from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import Post, PostMedia
from .serializers import (
    PostSerializer,
    PostCreateSerializer,
    PostUpdateSerializer,
    PostMediaSerializer
)
from apps.common.utils import normalize_tags

def detect_media_type(file):
    """
    检测文件类型：image, video, live
    优先级：live > video > image
    """
    file_name = file.name.lower()
    file_type = file.content_type.lower() if file.content_type else ''
    
    # 检测 Apple Live Photo
    if (file_type in ['image/heic', 'image/heif'] or 
        file_name.endswith('.heic') or file_name.endswith('.heif')):
        return 'live'
    
    # 检测 Android Live Photo
    if (file_type in ['image/jpeg', 'image/png'] and file_name.endswith('.jpg')):
        return 'live'
    
    # 检测视频
    if file_type.startswith('video/'):
        return 'video'
    
    # 检测普通图片
    if file_type.startswith('image/'):
        return 'image'
    
    return 'image'


class PostViewSet(viewsets.ModelViewSet):
    """
    朋友圈视图集
    提供朋友圈的增删改查功能
    """
    # 暂时移除认证要求，方便测试
    permission_classes = []
    
    # 默认序列化器
    serializer_class = PostSerializer
    
    def get_queryset(self):
        """
        获取查询集
        支持搜索和日期筛选
        优化：使用prefetch_related预加载媒体文件，避免N+1查询
        """
        queryset = Post.objects.prefetch_related('media').all()
        
        # 获取搜索关键词
        search = self.request.query_params.get('search', None)
        if search:
            # 搜索文字内容和标签
            queryset = queryset.filter(
                Q(content__icontains=search) | Q(tags__icontains=search)
            )
        
        # 获取开始日期
        start_date = self.request.query_params.get('start_date', None)
        if start_date:
            # 筛选创建时间大于等于开始日期的记录
            queryset = queryset.filter(created_at__gte=start_date)
        
        # 获取结束日期
        end_date = self.request.query_params.get('end_date', None)
        if end_date:
            # 筛选创建时间小于等于结束日期的记录
            queryset = queryset.filter(created_at__lte=end_date)
        
        return queryset
    
    def get_serializer_class(self):
        """
        根据不同的操作返回不同的序列化器
        """
        # 创建操作使用 PostCreateSerializer
        if self.action == 'create':
            return PostCreateSerializer
        # 更新操作使用 PostUpdateSerializer
        elif self.action in ['update', 'partial_update']:
            return PostUpdateSerializer
        # 其他操作使用默认的 PostSerializer
        return PostSerializer
    
    def create(self, request, *args, **kwargs):
        """
        创建朋友圈
        """
        # 获取上传的媒体文件和类型
        media_files = request.FILES.getlist('media_files')
        media_types = request.data.getlist('media_types')
        
        # 调试信息已移除，减少IO操作
        # 如需调试，请使用Django的logging模块
        
        # 验证媒体文件数量
        if len(media_files) > 9:
            return Response(
                {'error': '最多只能上传9张图片'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # 验证视频数量
        video_count = sum(1 for t in media_types if t == 'video')
        if video_count > 1:
            return Response(
                {'error': '最多只能上传1个视频'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # 验证文字长度
        content = request.data.get('content', '')
        if len(content) > 200:
            return Response(
                {'error': '文字内容最多200个字'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # 处理标签：将#号分隔的标签转换为逗号分隔
        tags = normalize_tags(request.data.get('tags', ''))
        
        # 创建数据字典，不要使用request.data.copy()，它会破坏FormData结构
        data = {
            'content': content,
            'is_pinned': request.data.get('is_pinned', False),
            'tags': tags,
            'media_files': media_files,
            'video_files': [],
            'media_types': media_types
        }
        
        # 使用创建序列化器
        serializer = PostCreateSerializer(data=data)
        if serializer.is_valid():
            # 保存朋友圈
            serializer.save()
            # 返回创建的朋友圈数据（传递 request 到序列化器）
            post_serializer = PostSerializer(serializer.instance, context={'request': request})
            return Response(
                post_serializer.data,
                status=status.HTTP_201_CREATED
            )
        # 验证失败，返回错误信息
        # 调试信息已移除，减少IO操作
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def update(self, request, *args, **kwargs):
        """
        更新朋友圈
        """
        # 获取要更新的朋友圈
        instance = self.get_object()
        
        # 验证文字长度
        content = request.data.get('content', instance.content)
        if content and len(content) > 200:
            return Response(
                {'error': '文字内容最多200个字'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # 使用更新序列化器
        serializer = PostUpdateSerializer(
            instance,
            data=request.data,
            partial=True
        )
        if serializer.is_valid():
            # 保存更新
            serializer.save()
            # 返回更新后的朋友圈数据（传递 request 到序列化器）
            post_serializer = PostSerializer(instance, context={'request': request})
            return Response(
                post_serializer.data,
                status=status.HTTP_200_OK
            )
        # 验证失败，返回错误信息
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        获取统计信息
        优化：使用数据库聚合减少查询次数
        """
        from django.utils import timezone
        from django.db.models import Count, Q, Exists, OuterRef
        
        today = timezone.now().date()
        queryset = Post.objects.all()
        
        # 使用一次查询获取所有统计数据，减少数据库IO
        # 使用聚合和子查询优化性能
        stats = queryset.aggregate(
            total_count=Count('id'),
            pinned_count=Count('id', filter=Q(is_pinned=True)),
            today_count=Count('id', filter=Q(created_at__date=today)),
        )
        
        # 统计有媒体文件的数量（使用子查询优化）
        with_media_count = queryset.filter(
            Exists(PostMedia.objects.filter(post_id=OuterRef('id')))
        ).count()
        
        stats['with_media_count'] = with_media_count
        
        return Response(stats)


class PostMediaViewSet(viewsets.ModelViewSet):
    """
    朋友圈媒体文件视图集
    提供媒体文件的增删改查功能
    """
    # 暂时移除认证要求，方便测试
    permission_classes = []
    
    # 序列化器
    serializer_class = PostMediaSerializer
    
    def get_queryset(self):
        """
        获取查询集
        可以通过 post_id 参数筛选特定朋友圈的媒体文件
        """
        queryset = PostMedia.objects.all()
        
        # 获取朋友圈ID
        post_id = self.request.query_params.get('post_id', None)
        if post_id:
            # 筛选特定朋友圈的媒体文件
            queryset = queryset.filter(post_id=post_id)
        
        return queryset
