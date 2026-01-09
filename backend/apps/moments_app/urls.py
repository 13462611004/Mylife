from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PostViewSet, PostMediaViewSet

# 创建路由器
router = DefaultRouter()

# 注册朋友圈视图集
router.register(r'posts', PostViewSet, basename='post')

# 注册朋友圈媒体文件视图集
router.register(r'media', PostMediaViewSet, basename='postmedia')

# URL 配置
urlpatterns = [
    # 包含路由器的 URL
    path('', include(router.urls)),
]
