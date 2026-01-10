from rest_framework import serializers
from .models import Marathon, MarathonRegistration

"""马拉松赛事精简序列化器（用于列表视图）"""
class MarathonListSerializer(serializers.ModelSerializer):
    """精简序列化器，只返回列表展示所需的核心字段"""
    class Meta:
        model = Marathon
        fields = [
            'id', 'event_name', 'event_date', 'location', 
            'province', 'city', 'district', 'event_type', 'finish_time', 'pace'
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
        """标准化省份名称：转换为地图数据需要的完整格式"""
        if not province:
            return province
        
        # 地图数据中使用的完整格式名称列表
        full_format_provinces = [
            '北京市', '天津市', '上海市', '重庆市',
            '河北省', '山西省', '辽宁省', '吉林省', '黑龙江省',
            '江苏省', '浙江省', '安徽省', '福建省', '江西省', '山东省',
            '河南省', '湖北省', '湖南省', '广东省', '广西壮族自治区', '海南省',
            '四川省', '贵州省', '云南省', '西藏自治区', '陕西省', '甘肃省',
            '青海省', '宁夏回族自治区', '新疆维吾尔自治区', '内蒙古自治区',
            '香港特别行政区', '澳门特别行政区', '台湾省'
        ]
        
        # 如果已经是完整格式，直接返回
        if province in full_format_provinces:
            return province
        
        # 映射：简化格式 -> 完整格式（地图数据需要的格式）
        province_map = {
            '北京': '北京市', '天津': '天津市', '上海': '上海市', '重庆': '重庆市',
            '河北': '河北省', '山西': '山西省', '辽宁': '辽宁省', '吉林': '吉林省', '黑龙江': '黑龙江省',
            '江苏': '江苏省', '浙江': '浙江省', '安徽': '安徽省', '福建': '福建省', '江西': '江西省', '山东': '山东省',
            '河南': '河南省', '湖北': '湖北省', '湖南': '湖南省', '广东': '广东省', '广西': '广西壮族自治区', '海南': '海南省',
            '四川': '四川省', '贵州': '贵州省', '云南': '云南省', '西藏': '西藏自治区', '陕西': '陕西省', '甘肃': '甘肃省',
            '青海': '青海省', '宁夏': '宁夏回族自治区', '新疆': '新疆维吾尔自治区', '内蒙古': '内蒙古自治区',
            '香港': '香港特别行政区', '澳门': '澳门特别行政区', '台湾': '台湾省',
        }
        
        # 如果在映射表中，返回完整格式
        if province in province_map:
            return province_map[province]
        
        # 如果不在映射表中，尝试添加后缀
        if not province.endswith(('省', '市', '自治区', '特别行政区')):
            if province in ['北京', '天津', '上海', '重庆']:
                return province + '市'
            else:
                return province + '省'
        
        return province

    def normalize_city_name(self, city):
        """标准化城市名称：保持完整格式（地图数据通常使用完整格式，如"成都市"）"""
        if not city:
            return city
        # 如果已经有后缀，直接返回
        if city.endswith(('市', '县', '区', '自治州', '盟', '地区', '自治县')):
            return city
        # 保持原样，不自动添加后缀（需要在输入时限制格式）
        return city

    def normalize_district_name(self, district):
        """标准化区县名称：保持完整格式（地图数据通常使用完整格式）"""
        if not district:
            return district
        # 如果已经有后缀，直接返回
        if district.endswith(('区', '县', '市', '自治县', '自治旗')):
            return district
        # 保持原样，不自动添加后缀
        return district

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
            'province', 'city', 'district', 'event_type', 'registration_status', 'registration_fee'
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
        """标准化省份名称：转换为地图数据需要的完整格式"""
        if not province:
            return province
        
        # 地图数据中使用的完整格式名称列表
        full_format_provinces = [
            '北京市', '天津市', '上海市', '重庆市',
            '河北省', '山西省', '辽宁省', '吉林省', '黑龙江省',
            '江苏省', '浙江省', '安徽省', '福建省', '江西省', '山东省',
            '河南省', '湖北省', '湖南省', '广东省', '广西壮族自治区', '海南省',
            '四川省', '贵州省', '云南省', '西藏自治区', '陕西省', '甘肃省',
            '青海省', '宁夏回族自治区', '新疆维吾尔自治区', '内蒙古自治区',
            '香港特别行政区', '澳门特别行政区', '台湾省'
        ]
        
        # 如果已经是完整格式，直接返回
        if province in full_format_provinces:
            return province
        
        # 映射：简化格式 -> 完整格式（地图数据需要的格式）
        province_map = {
            '北京': '北京市', '天津': '天津市', '上海': '上海市', '重庆': '重庆市',
            '河北': '河北省', '山西': '山西省', '辽宁': '辽宁省', '吉林': '吉林省', '黑龙江': '黑龙江省',
            '江苏': '江苏省', '浙江': '浙江省', '安徽': '安徽省', '福建': '福建省', '江西': '江西省', '山东': '山东省',
            '河南': '河南省', '湖北': '湖北省', '湖南': '湖南省', '广东': '广东省', '广西': '广西壮族自治区', '海南': '海南省',
            '四川': '四川省', '贵州': '贵州省', '云南': '云南省', '西藏': '西藏自治区', '陕西': '陕西省', '甘肃': '甘肃省',
            '青海': '青海省', '宁夏': '宁夏回族自治区', '新疆': '新疆维吾尔自治区', '内蒙古': '内蒙古自治区',
            '香港': '香港特别行政区', '澳门': '澳门特别行政区', '台湾': '台湾省',
        }
        
        # 如果在映射表中，返回完整格式
        if province in province_map:
            return province_map[province]
        
        # 如果不在映射表中，尝试添加后缀
        if not province.endswith(('省', '市', '自治区', '特别行政区')):
            if province in ['北京', '天津', '上海', '重庆']:
                return province + '市'
            else:
                return province + '省'
        
        return province

    def normalize_city_name(self, city):
        """标准化城市名称：保持完整格式（地图数据通常使用完整格式，如"成都市"）"""
        if not city:
            return city
        # 如果已经有后缀，直接返回
        if city.endswith(('市', '县', '区', '自治州', '盟', '地区', '自治县')):
            return city
        # 保持原样，不自动添加后缀（需要在输入时限制格式）
        return city

    def normalize_district_name(self, district):
        """标准化区县名称：保持完整格式（地图数据通常使用完整格式）"""
        if not district:
            return district
        # 如果已经有后缀，直接返回
        if district.endswith(('区', '县', '市', '自治县', '自治旗')):
            return district
        # 保持原样，不自动添加后缀
        return district

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
