#!/usr/bin/env python3
"""
修复登录问题的脚本
"""

import os
import sys

# 添加项目路径
sys.path.insert(0, '/Users/wangliang/Desktop/Mylife/backend')

# 设置Django环境变量
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

# 初始化Django
import django
django.setup()

from apps.admin_app.models import AdminSetting
from django.contrib.auth.hashers import make_password, check_password

print("检查登录问题...")

# 检查AdminSetting记录
try:
    admin_setting = AdminSetting.objects.get(id=1)
    print(f"找到AdminSetting记录，ID: {admin_setting.id}")
    print(f"当前密码哈希: {admin_setting.admin_password}")
    
    # 检查密码是否正确
    test_password = "admin123"
    if check_password(test_password, admin_setting.admin_password):
        print(f"密码 '{test_password}' 验证通过")
    else:
        print(f"密码 '{test_password}' 验证失败，需要重置")
        # 重置密码
        admin_setting.admin_password = make_password(test_password)
        admin_setting.save()
        print(f"密码已重置为 '{test_password}'")
        print(f"新密码哈希: {admin_setting.admin_password}")
        # 再次验证
        if check_password(test_password, admin_setting.admin_password):
            print(f"重置后密码验证通过")
        else:
            print(f"重置后密码验证仍然失败")
            
except AdminSetting.DoesNotExist:
    print("AdminSetting记录不存在，创建新记录")
    default_password = "admin123"
    admin_setting = AdminSetting.objects.create(
        admin_password=make_password(default_password)
    )
    print(f"已创建新的AdminSetting记录，ID: {admin_setting.id}")
    print(f"默认密码: {default_password}")
    print(f"密码哈希: {admin_setting.admin_password}")
    
except Exception as e:
    print(f"发生错误: {str(e)}")
    import traceback
    traceback.print_exc()

print("登录问题检查完成")
