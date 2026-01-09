from django.db import models
from django.core.validators import FileExtensionValidator


class Post(models.Model):
    """
    朋友圈模型
    存储朋友圈的基本信息
    """
    # 文字内容，最多200个字
    content = models.CharField(max_length=200, blank=True, verbose_name='文字内容')
    
    # 是否置顶
    is_pinned = models.BooleanField(default=False, verbose_name='是否置顶')
    
    # 标签，手动输入，用逗号分隔
    tags = models.CharField(max_length=200, blank=True, verbose_name='标签')
    
    # 创建时间
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    
    # 更新时间
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')
    
    class Meta:
        # 元数据配置
        verbose_name = '朋友圈'
        verbose_name_plural = '朋友圈'
        # 默认按置顶和创建时间倒序排序（置顶的在前，然后是最新发布的）
        ordering = ['-is_pinned', '-created_at']
    
    def __str__(self):
        # 返回朋友圈的文字内容，如果没有文字则返回ID
        return self.content if self.content else f'朋友圈 {self.id}'


class PostMedia(models.Model):
    """
    朋友圈媒体文件模型
    存储朋友圈的图片、Live图、视频等媒体文件
    """
    # 媒体类型选择
    MEDIA_TYPE_CHOICES = [
        ('image', '图片'),
        ('live', 'Live图'),
        ('video', '视频'),
    ]
    
    # 关联到朋友圈
    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name='media',
        verbose_name='朋友圈'
    )
    
    # 媒体类型
    media_type = models.CharField(
        max_length=10,
        choices=MEDIA_TYPE_CHOICES,
        verbose_name='媒体类型'
    )
    
    # 媒体文件路径
    file = models.FileField(
        upload_to='posts/%Y/%m/%d/',
        verbose_name='媒体文件',
        validators=[
            FileExtensionValidator(
                allowed_extensions=['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov', 'avi', 'webm']
            )
        ]
    )
    
    # 排序顺序，控制媒体文件的显示顺序
    order = models.IntegerField(default=0, verbose_name='排序顺序')
    
    # 创建时间
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    
    class Meta:
        # 元数据配置
        verbose_name = '朋友圈媒体'
        verbose_name_plural = '朋友圈媒体'
        # 默认按排序顺序和创建时间排序
        ordering = ['order', 'created_at']
    
    def __str__(self):
        # 返回媒体文件的文件名
        return f'{self.get_media_type_display()}: {self.file.name}'
