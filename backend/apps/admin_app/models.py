from django.db import models
from django.contrib.auth.hashers import make_password

"""管理员设置模型"""
class AdminSetting(models.Model):
    admin_password = models.CharField(max_length=100, verbose_name="管理员密码")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="创建时间")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="更新时间")
    
    class Meta:
        verbose_name = "管理员设置"
        verbose_name_plural = "管理员设置"
    
    def save(self, *args, **kwargs):
        # 自动哈希密码
        if not self.admin_password.startswith('pbkdf2_'):
            self.admin_password = make_password(self.admin_password)
        super().save(*args, **kwargs)

