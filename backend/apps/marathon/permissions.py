"""
自定义权限类
用于检查session中的is_admin标识
"""
from rest_framework import permissions


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    自定义权限类：
    - 读取操作（GET）：允许所有人
    - 写入操作（POST, PUT, DELETE）：需要管理员登录（检查session中的is_admin）
    """
    
    def has_permission(self, request, view):
        # 读取操作允许所有人
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # 写入操作需要检查session中的is_admin
        return request.session.get('is_admin', False)
