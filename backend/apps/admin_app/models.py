from django.db import models
from django.contrib.auth.hashers import make_password
import json

"""管理员设置模型"""
class AdminSetting(models.Model):
    admin_password = models.CharField(max_length=100, verbose_name="管理员密码")
    # 轮播图图片列表（JSON格式存储图片URL）
    carousel_images = models.JSONField(default=list, blank=True, verbose_name="轮播图图片列表")
    # 头像图片
    avatar = models.ImageField(upload_to='admin/avatar/', blank=True, null=True, verbose_name="头像图片")
    # 装饰图标配置（JSON格式，存储季节装饰图标等）
    decorative_icons = models.JSONField(default=dict, blank=True, verbose_name="装饰图标配置")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="创建时间")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="更新时间")
    
    class Meta:
        verbose_name = "管理员设置"
        verbose_name_plural = "管理员设置"
    
    def save(self, *args, **kwargs):
        # 自动哈希密码
        if not self.admin_password.startswith('pbkdf2_'):
            self.admin_password = make_password(self.admin_password)
        # 确保carousel_images和decorative_icons是有效的JSON
        if isinstance(self.carousel_images, str):
            try:
                self.carousel_images = json.loads(self.carousel_images)
            except:
                self.carousel_images = []
        if isinstance(self.decorative_icons, str):
            try:
                self.decorative_icons = json.loads(self.decorative_icons)
            except:
                self.decorative_icons = {}
        if self.carousel_images is None:
            self.carousel_images = []
        if self.decorative_icons is None:
            self.decorative_icons = {}
        super().save(*args, **kwargs)

