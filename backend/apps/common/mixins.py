"""
通用Mixin类
提供可复用的ViewSet/APIView功能
"""
from rest_framework.response import Response
from rest_framework import status


class GetObjectMixin:
    """
    通用的对象获取Mixin
    消除重复的get_object逻辑
    """
    
    def get_object_or_404(self, pk, queryset=None, use_select_related=False, select_related_fields=None):
        """
        获取对象，如果不存在返回404响应
        
        Args:
            pk: 主键
            queryset: 查询集（如果为None，使用self.queryset或model_class）
            use_select_related: 是否使用select_related优化
            select_related_fields: select_related的字段列表
            
        Returns:
            (object, None) 如果找到对象
            (None, Response) 如果未找到对象
        """
        # 如果没有提供queryset，使用默认的
        if queryset is None:
            if hasattr(self, 'queryset') and self.queryset is not None:
                queryset = self.queryset
            elif hasattr(self, 'model'):
                queryset = self.model.objects.all()
            else:
                raise AttributeError(
                    f"{self.__class__.__name__} must have either 'queryset' or 'model' attribute"
                )
        
        # 应用select_related优化
        if use_select_related and select_related_fields:
            queryset = queryset.select_related(*select_related_fields)
        
        try:
            return queryset.get(pk=pk), None
        except queryset.model.DoesNotExist:
            error_message = getattr(self, 'not_found_message', f'{queryset.model.__name__}不存在')
            return None, Response({'error': error_message}, status=status.HTTP_404_NOT_FOUND)
