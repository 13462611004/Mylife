from django.apps import AppConfig


class MomentsAppConfig(AppConfig):
    """
    朋友圈应用配置类
    """
    # 应用的名称
    default_auto_field = 'django.db.models.BigAutoField'
    
    # 应用的完整名称
    name = 'apps.moments_app'
    
    # 应用的显示名称
    verbose_name = '朋友圈'
