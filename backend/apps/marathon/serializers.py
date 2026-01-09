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

    def normalize_province_name(self, province):
        """标准化省份名称：转换为地图数据中的格式"""
        if not province:
            return province
        province_map = {
            '广西壮族自治区': '广西',
            '西藏自治区': '西藏',
            '新疆维吾尔自治区': '新疆',
            '宁夏回族自治区': '宁夏',
            '内蒙古自治区': '内蒙古',
            '香港特别行政区': '香港',
            '澳门特别行政区': '澳门',
        }
        if province in province_map:
            return province_map[province]
        else:
            # 对于其他省份，移除"省"、"市"、"自治区"等后缀
            return province.replace('省', '').replace('市', '').replace('自治区', '')

    def normalize_city_name(self, city):
        """标准化城市名称：移除"市"、"县"、"区"等后缀"""
        if not city:
            return city
        suffixes = ['市', '县', '区', '自治州', '盟', '地区']
        normalized = city
        for suffix in suffixes:
            if normalized.endswith(suffix):
                normalized = normalized[:-len(suffix)]
                break
        return normalized

    def normalize_district_name(self, district):
        """标准化区县名称：移除"区"、"县"等后缀"""
        if not district:
            return district
        suffixes = ['区', '县', '市', '自治县', '自治旗']
        normalized = district
        for suffix in suffixes:
            if normalized.endswith(suffix):
                normalized = normalized[:-len(suffix)]
                break
        return normalized

    def validate(self, data):
        """验证和标准化数据"""
        # 标准化省份名称
        if 'province' in data and data['province']:
            data['province'] = self.normalize_province_name(data['province'])
        # 标准化城市名称
        if 'city' in data and data['city']:
            data['city'] = self.normalize_city_name(data['city'])
        # 标准化区县名称
        if 'district' in data and data['district']:
            data['district'] = self.normalize_district_name(data['district'])
        return data

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
            'province', 'city', 'event_type', 'registration_status', 'registration_fee'
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

    def normalize_province_name(self, province):
        """标准化省份名称：转换为地图数据中的格式"""
        if not province:
            return province
        province_map = {
            '广西壮族自治区': '广西',
            '西藏自治区': '西藏',
            '新疆维吾尔自治区': '新疆',
            '宁夏回族自治区': '宁夏',
            '内蒙古自治区': '内蒙古',
            '香港特别行政区': '香港',
            '澳门特别行政区': '澳门',
        }
        if province in province_map:
            return province_map[province]
        else:
            # 对于其他省份，移除"省"、"市"、"自治区"等后缀
            return province.replace('省', '').replace('市', '').replace('自治区', '')

    def normalize_city_name(self, city):
        """标准化城市名称：移除"市"、"县"、"区"等后缀"""
        if not city:
            return city
        suffixes = ['市', '县', '区', '自治州', '盟', '地区']
        normalized = city
        for suffix in suffixes:
            if normalized.endswith(suffix):
                normalized = normalized[:-len(suffix)]
                break
        return normalized

    def normalize_district_name(self, district):
        """标准化区县名称：移除"区"、"县"等后缀"""
        if not district:
            return district
        suffixes = ['区', '县', '市', '自治县', '自治旗']
        normalized = district
        for suffix in suffixes:
            if normalized.endswith(suffix):
                normalized = normalized[:-len(suffix)]
                break
        return normalized

    def validate(self, data):
        """验证和标准化数据"""
        # 标准化省份名称
        if 'province' in data and data['province']:
            data['province'] = self.normalize_province_name(data['province'])
        # 标准化城市名称
        if 'city' in data and data['city']:
            data['city'] = self.normalize_city_name(data['city'])
        # 标准化区县名称
        if 'district' in data and data['district']:
            data['district'] = self.normalize_district_name(data['district'])
        return data
