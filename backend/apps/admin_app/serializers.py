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
        
        # 处理轮播图数据
        if 'carousel_images' in validated_data:
            instance.carousel_images = validated_data['carousel_images']
        
        # 处理装饰图标数据
        if 'decorative_icons' in validated_data:
            instance.decorative_icons = validated_data['decorative_icons']
        
        instance.save()
        return instance

    def to_representation(self, instance):
        """自定义序列化输出，将图片URL转换为完整URL"""
        representation = super().to_representation(instance)
        # 如果有头像图片，添加完整的URL
        if instance.avatar:
            representation['avatar'] = self.context['request'].build_absolute_uri(instance.avatar.url)
        # 如果有轮播图，将相对URL转换为完整URL
        if instance.carousel_images and isinstance(instance.carousel_images, list):
            carousel_with_urls = []
            for item in instance.carousel_images:
                if isinstance(item, dict) and 'url' in item:
                    if item['url'] and not item['url'].startswith('http'):
                        item['url'] = self.context['request'].build_absolute_uri(item['url'])
                    carousel_with_urls.append(item)
                elif isinstance(item, str) and not item.startswith('http'):
                    carousel_with_urls.append(self.context['request'].build_absolute_uri(item))
                else:
                    carousel_with_urls.append(item)
            representation['carousel_images'] = carousel_with_urls
        return representation
