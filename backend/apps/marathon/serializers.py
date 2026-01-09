from rest_framework import serializers
from .models import Marathon, MarathonRegistration

"""马拉松赛事精简序列化器（用于列表视图）"""
class MarathonListSerializer(serializers.ModelSerializer):
    """精简序列化器，只返回列表展示所需的核心字段"""
    class Meta:
        model = Marathon
        fields = [
            'id', 'event_name', 'event_date', 'location', 
            'province', 'city', 'event_type', 'finish_time', 'pace'
        ]

"""马拉松赛事完整序列化器（用于详情视图）"""
class MarathonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Marathon
        # 只序列化字符串字段，不包含外键字段
        fields = [
            'id', 'event_name', 'event_date', 'location', 
            'province', 'city', 'district',
            'event_type', 'finish_time', 'pace',
            'certificate', 'description', 'event_log',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']  # 只读字段

    def to_representation(self, instance):
        """自定义序列化输出"""
        representation = super().to_representation(instance)
        # 如果有证书图片，添加完整的URL
        if instance.certificate:
            representation['certificate'] = self.context['request'].build_absolute_uri(instance.certificate.url)
        return representation

"""马拉松报名赛事精简序列化器（用于列表视图）"""
class MarathonRegistrationListSerializer(serializers.ModelSerializer):
    """精简序列化器，只返回列表展示所需的核心字段"""
    class Meta:
        model = MarathonRegistration
        fields = [
            'id', 'event_name', 'event_date', 'location',
            'province', 'city', 'event_type', 'registration_status'
        ]

"""马拉松报名赛事完整序列化器（用于详情视图）"""
class MarathonRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = MarathonRegistration
        fields = [
            'id', 'event_name', 'event_date', 'location',
            'province', 'city', 'district',
            'event_type', 'registration_status',
            'registration_date', 'registration_fee',
            'draw_date', 'transport', 'accommodation',
            'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']  # 只读字段
