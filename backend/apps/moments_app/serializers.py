import os
from rest_framework import serializers
from django.db import transaction
from .models import Post, PostMedia
from .utils import extract_video_from_live_photo, is_live_photo
from datetime import datetime


class PostMediaSerializer(serializers.ModelSerializer):
    """
    朋友圈媒体文件的序列化器
    用于序列化和反序列化媒体文件数据
    """
    # 文件URL，用于前端访问
    file_url = serializers.SerializerMethodField()
    
    # 视频文件URL（仅Live Photo）
    video_file_url = serializers.SerializerMethodField()
    
    class Meta:
        # 指定模型
        model = PostMedia
        
        # 包含的字段
        fields = [
            'id',
            'media_type',
            'file',
            'file_url',
            'video_file',
            'video_file_url',
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
    
    def get_video_file_url(self, obj):
        """
        获取视频文件的完整URL（仅Live Photo）
        """
        if obj.video_file:
            # 返回视频文件的完整URL
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.video_file.url)
            return obj.video_file.url
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
        优化：使用事务包装和批量创建，减少数据库IO操作
        """
        # 从验证后的数据中提取媒体文件和类型
        media_files = validated_data.pop('media_files', [])
        media_types = validated_data.pop('media_types', [])
        video_files = validated_data.pop('video_files', [])
        
        # 使用事务包装所有数据库操作，减少IO开销
        with transaction.atomic():
            # 创建朋友圈
            post = Post.objects.create(**validated_data)
            
            # 创建媒体文件（如果有的话）
            if media_files:
                # 先保存所有文件到磁盘，然后批量创建数据库记录
                # 这样可以减少数据库IO操作（从N次减少到1次）
                media_objects = []
                for i, media_file in enumerate(media_files):
                    # 创建临时PostMedia实例用于保存文件
                    temp_media = PostMedia(post=post, media_type='image', order=i)
                    # 保存文件到磁盘（文件IO是必须的，无法避免）
                    temp_media.file.save(media_file.name, media_file, save=False)
                    
                    # 使用 is_live_photo() 自动检测是否为 Live Photo
                    if is_live_photo(temp_media.file.path):
                        # 是 Live Photo，修改 media_type 并尝试提取视频
                        temp_media.media_type = 'live'
                        
                        # 尝试提取视频
                        extracted_video_path = extract_video_from_live_photo(temp_media.file.path)
                        if extracted_video_path:
                            # 直接设置 video_file.name 为简单文件名
                            video_filename = os.path.basename(extracted_video_path)
                            # 使用 Python datetime 格式化日期
                            date_dir = post.created_at.strftime('%Y/%m/%d')
                            temp_media.video_file.name = f'posts/{date_dir}/{video_filename}'
                    
                    # 添加到批量创建列表
                    media_objects.append(temp_media)
                
                # 使用bulk_create批量创建数据库记录
                # 将N次数据库INSERT操作合并为1次，大幅减少数据库IO
                PostMedia.objects.bulk_create(media_objects)
        
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
