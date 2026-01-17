"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve
from django.http import Http404
import os

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/marathon/', include('apps.marathon.urls')),  # 马拉松相关API
    path('api/admin/', include('apps.admin_app.urls')),    # 管理员相关API
    path('api/moments/', include('apps.moments_app.urls')), # 朋友圈相关API
]

# 开发环境和测试环境的媒体文件和静态文件访问
# 测试环境（localhost）也需要提供media文件服务（即使DEBUG=False）
is_local_env = 'localhost' in settings.ALLOWED_HOSTS or '127.0.0.1' in settings.ALLOWED_HOSTS

# DEBUG模式使用static()函数
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
# 测试环境（非DEBUG）使用手动serve视图
elif is_local_env:
    # 手动添加media文件服务路由
    urlpatterns += [
        re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
    ]