from rest_framework import serializers
from .models import Post, PostMedia


class PostMediaSerializer(serializers.ModelSerializer):
    """
    朋友圈媒体文件的序列化器
    用于序列化和反序列化媒体文件数据
    """
    # 文件URL，用于前端访问
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        # 指定模型
        model = PostMedia
        
        # 包含的字段
        fields = [
            'id',
            'media_type',
            'file',
            'file_url',
            'order',
            'created_at'
        ]
    
    def get_file_url(self, obj):
        """
        获取文件的完整URL
        """
        if obj.file:
            # 返回文件的URL
            return obj.file.url
        return None


class PostSerializer(serializers.ModelSerializer):
    """
    朋友圈的序列化器
    用于序列化和反序列化朋友圈数据
    """
    # 媒体文件列表，嵌套序列化
    media = PostMediaSerializer(many=True, read_only=True)
    
    # 媒体文件数量
    media_count = serializers.SerializerMethodField()
    
    # 格式化的创建时间
    created_at_formatted = serializers.SerializerMethodField()
    
    class Meta:
        # 指定模型
        model = Post
        
        # 包含的字段
        fields = [
            'id',
            'content',
            'is_pinned',
            'tags',
            'media',
            'media_count',
            'created_at',
            'created_at_formatted',
            'updated_at'
        ]
    
    def get_media_count(self, obj):
        """
        获取媒体文件的数量
        """
        return obj.media.count()
    
    def get_created_at_formatted(self, obj):
        """
        获取格式化的创建时间
        """
        # 返回格式化的时间字符串
        return obj.created_at.strftime('%Y-%m-%d %H:%M:%S')


class PostCreateSerializer(serializers.ModelSerializer):
    """
    朋友圈创建的序列化器
    用于创建朋友圈
    """
    # 媒体文件列表，用于创建时上传
    media_files = serializers.ListField(
        child=serializers.FileField(),
        write_only=True,
        required=False
    )
    
    # 媒体类型列表，与media_files一一对应
    media_types = serializers.ListField(
        child=serializers.ChoiceField(choices=['image', 'live', 'video']),
        write_only=True,
        required=False
    )
    
    class Meta:
        # 指定模型
        model = Post
        
        # 包含的字段
        fields = [
            'content',
            'is_pinned',
            'tags',
            'media_files',
            'media_types'
        ]
    
    def create(self, validated_data):
        """
        创建朋友圈及其媒体文件
        """
        # 从验证后的数据中提取媒体文件和类型
        media_files = validated_data.pop('media_files', [])
        media_types = validated_data.pop('media_types', [])
        
        # 创建朋友圈
        post = Post.objects.create(**validated_data)
        
        # 创建媒体文件（如果有的话）
        if media_files and media_types:
            for i, (media_file, media_type) in enumerate(zip(media_files, media_types)):
                PostMedia.objects.create(
                    post=post,
                    media_type=media_type,
                    file=media_file,
                    order=i
                )
        
        return post


class PostUpdateSerializer(serializers.ModelSerializer):
    """
    朋友圈更新的序列化器
    用于更新朋友圈
    """
    class Meta:
        # 指定模型
        model = Post
        
        # 包含的字段
        fields = [
            'content',
            'is_pinned',
            'tags'
        ]
