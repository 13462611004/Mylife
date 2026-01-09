from django.contrib import admin
from .models import Post, PostMedia


class PostMediaInline(admin.TabularInline):
    """
    朋友圈媒体文件的内联编辑器
    在编辑朋友圈时可以直接添加/编辑媒体文件
    """
    model = PostMedia
    extra = 0
    fields = ['media_type', 'file', 'order']


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    """
    朋友圈管理界面
    """
    # 列表页显示的字段
    list_display = ['id', 'content_preview', 'is_pinned', 'tags', 'media_count', 'created_at']
    
    # 列表页可点击排序的字段
    list_filter = ['is_pinned', 'created_at']
    
    # 搜索字段
    search_fields = ['content', 'tags']
    
    # 每页显示的记录数
    list_per_page = 20
    
    # 内联编辑媒体文件
    inlines = [PostMediaInline]
    
    # 字段集分组
    fieldsets = (
        ('基本信息', {
            'fields': ('content', 'tags', 'is_pinned')
        }),
    )
    
    def content_preview(self, obj):
        """
        返回文字内容的预览（最多50个字）
        """
        if obj.content:
            return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
        return '（无文字）'
    content_preview.short_description = '文字内容'
    
    def media_count(self, obj):
        """
        返回媒体文件的数量
        """
        return obj.media.count()
    media_count.short_description = '媒体数量'


@admin.register(PostMedia)
class PostMediaAdmin(admin.ModelAdmin):
    """
    朋友圈媒体文件管理界面
    """
    # 列表页显示的字段
    list_display = ['id', 'post', 'media_type', 'file_preview', 'order', 'created_at']
    
    # 列表页可点击排序的字段
    list_filter = ['media_type', 'created_at']
    
    # 搜索字段
    search_fields = ['post__content', 'file']
    
    # 每页显示的记录数
    list_per_page = 20
    
    def file_preview(self, obj):
        """
        返回文件路径的预览
        """
        if obj.file:
            return obj.file.name
        return '（无文件）'
    file_preview.short_description = '文件路径'
