"""
通用视图模块
提供可复用的视图函数
"""
from django.http import FileResponse, Http404
from django.conf import settings
import os


def serve_media(request, path):
    """
    提供媒体文件访问服务
    用于生产环境下访问媒体文件
    
    Args:
        request: Django请求对象
        path: 媒体文件的相对路径（从MEDIA_URL之后的路径）
        
    Returns:
        FileResponse: 文件响应
    """
    # 构建文件的完整路径
    file_path = os.path.join(settings.MEDIA_ROOT, path)
    
    # 安全检查：确保文件在MEDIA_ROOT目录下
    file_path = os.path.normpath(file_path)
    media_root = os.path.normpath(settings.MEDIA_ROOT)
    if not file_path.startswith(media_root):
        raise Http404("文件不存在")
    
    # 检查文件是否存在
    if not os.path.exists(file_path):
        raise Http404("文件不存在")
    
    # 返回文件响应
    response = FileResponse(open(file_path, 'rb'))
    
    # 设置适当的Content-Type
    import mimetypes
    content_type, _ = mimetypes.guess_type(file_path)
    if content_type:
        response['Content-Type'] = content_type
    
    return response
