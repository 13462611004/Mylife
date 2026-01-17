"""
通用工具函数模块
提供可复用的工具函数，避免代码重复
"""
import os
import logging
from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist
from rest_framework.response import Response
from rest_framework import status

logger = logging.getLogger(__name__)


def get_object_or_404_response(model_class, pk, error_message=None):
    """
    获取对象，如果不存在返回404响应
    
    Args:
        model_class: Django模型类
        pk: 主键
        error_message: 错误消息，如果为None则使用默认消息
        
    Returns:
        (object, None) 如果找到对象
        (None, Response) 如果未找到对象
    """
    try:
        return model_class.objects.get(pk=pk), None
    except ObjectDoesNotExist:
        error_msg = error_message or f'{model_class.__name__}不存在'
        return None, Response({'error': error_msg}, status=status.HTTP_404_NOT_FOUND)


def build_file_url(file_path):
    """
    构建文件的完整URL
    统一使用settings中的配置，避免硬编码
    
    Args:
        file_path: 文件的相对路径（如 media/posts/xxx.jpg）
        
    Returns:
        完整的URL字符串，如果file_path为空则返回None
    """
    if not file_path:
        return None
    
    # 如果已经是完整URL，检查并修复协议
    if file_path.startswith('http'):
        # 如果URL是HTTP，检查是否应该转换为HTTPS（生产环境）
        if file_path.startswith('http://') and ('xiaomanxia.com' in file_path or 'localhost' not in file_path):
            # 生产环境使用HTTPS
            return file_path.replace('http://', 'https://', 1)
        return file_path
    
    # 从settings中获取基础URL（默认使用HTTPS）
    base_url = getattr(settings, 'MEDIA_BASE_URL', 'https://xiaomanxia.com')
    
    # 确保base_url使用HTTPS（生产环境）
    if 'xiaomanxia.com' in base_url and base_url.startswith('http://'):
        base_url = base_url.replace('http://', 'https://', 1)
    
    # 确保file_path以/开头
    if not file_path.startswith('/'):
        file_path = '/' + file_path
    
    return f'{base_url}{file_path}'


def delete_file_if_exists(file_path):
    """
    安全删除文件，如果文件存在则删除
    
    Args:
        file_path: 文件的完整路径
        
    Returns:
        bool: 是否成功删除（如果文件不存在也返回True）
    """
    try:
        if file_path and os.path.exists(file_path):
            os.remove(file_path)
            logger.info(f'文件已删除: {file_path}')
            return True
        return True
    except Exception as e:
        logger.error(f'删除文件失败: {file_path}, 错误: {str(e)}')
        return False


def normalize_tags(tags_string):
    """
    标准化标签字符串：将#号分隔的标签转换为逗号分隔
    
    Args:
        tags_string: 标签字符串
        
    Returns:
        标准化后的标签字符串
    """
    if not tags_string:
        return ''
    
    # 将#号替换为逗号
    tags = tags_string.replace('#', ',')
    # 去除首尾的逗号和空格
    return tags.strip(', ')
