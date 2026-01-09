"""管理员应用的URL配置"""
from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.admin_login, name='admin-login'),  # 管理员登录
    path('logout/', views.admin_logout, name='admin-logout'),  # 管理员注销
    path('settings/', views.admin_settings, name='admin-settings'),  # 管理员设置
]
