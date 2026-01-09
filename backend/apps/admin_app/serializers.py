from rest_framework import serializers
from .models import AdminSetting

"""管理员设置序列化器"""
class AdminSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminSetting
        fields = '__all__'  # 序列化所有字段
        read_only_fields = ['created_at', 'updated_at']  # 只读字段

    def create(self, validated_data):
        """创建管理员设置（只有一个）"""
        # 检查是否已存在管理员设置，如果存在则更新
        admin_setting, created = AdminSetting.objects.update_or_create(
            id=1,  # 假设只有一个管理员设置
            defaults=validated_data
        )
        return admin_setting

    def update(self, instance, validated_data):
        """更新管理员设置"""
        # 允许更新密码
        if 'admin_password' in validated_data:
            instance.admin_password = validated_data['admin_password']
        instance.save()
        return instance
