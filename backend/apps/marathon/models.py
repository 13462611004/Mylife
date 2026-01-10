from django.db import models

"""地区数据模型"""
class Province(models.Model):
    """省份模型"""
    name = models.CharField(max_length=50, unique=True, verbose_name="省份名称")
    code = models.CharField(max_length=10, unique=True, verbose_name="省份代码")
    
    class Meta:
        verbose_name = "省份"
        verbose_name_plural = "省份"
        ordering = ['id']
    
    def __str__(self):
        return self.name

class City(models.Model):
    """城市模型"""
    name = models.CharField(max_length=50, verbose_name="城市名称")
    code = models.CharField(max_length=10, unique=True, verbose_name="城市代码")
    province = models.ForeignKey(Province, on_delete=models.CASCADE, related_name='cities', verbose_name="所属省份")
    
    class Meta:
        verbose_name = "城市"
        verbose_name_plural = "城市"
        ordering = ['province', 'id']
    
    def __str__(self):
        return f"{self.province.name} - {self.name}"

class District(models.Model):
    """区/县模型"""
    name = models.CharField(max_length=50, verbose_name="区/县名称")
    code = models.CharField(max_length=10, unique=True, verbose_name="区/县代码")
    city = models.ForeignKey(City, on_delete=models.CASCADE, related_name='districts', verbose_name="所属城市")
    
    class Meta:
        verbose_name = "区/县"
        verbose_name_plural = "区/县"
        ordering = ['city', 'id']
    
    def __str__(self):
        return f"{self.city.name} - {self.name}"

"""马拉松赛事模型"""
class Marathon(models.Model):
    # 赛事类型枚举
    EVENT_TYPE_CHOICES = [
        ('5km', '5KM'),
        ('10km', '10KM'),
        ('15km', '15KM'),
        ('half', '半程马拉松'),
        ('full', '全程马拉松'),
    ]
    
    event_name = models.CharField(max_length=100, verbose_name="赛事名称")
    event_date = models.DateField(verbose_name="赛事日期")
    location = models.CharField(max_length=100, verbose_name="赛事地点")
    # 原有的字符串字段（保留用于API返回）
    province = models.CharField(max_length=50, verbose_name="省份", blank=True)
    city = models.CharField(max_length=50, verbose_name="城市", blank=True)
    district = models.CharField(max_length=50, blank=True, verbose_name="区/县")
    # 新的外键字段（用于管理后台级联选择）
    province_obj = models.ForeignKey(Province, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="省份", related_name='marathon_provinces')
    city_obj = models.ForeignKey(City, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="城市", related_name='marathon_cities')
    district_obj = models.ForeignKey(District, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="区/县", related_name='marathon_districts')
    event_type = models.CharField(max_length=10, choices=EVENT_TYPE_CHOICES, verbose_name="赛事类型", default='full')
    finish_time = models.CharField(max_length=20, verbose_name="完赛时间")
    pace = models.CharField(max_length=20, verbose_name="配速")
    certificate = models.ImageField(upload_to='marathon/certificates/', blank=True, null=True, verbose_name="完赛证书")
    description = models.TextField(blank=True, verbose_name="赛事描述")
    event_log = models.TextField(blank=True, verbose_name="赛事日志(Markdown格式)")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="创建时间")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="更新时间")
    
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
            '北京': '北京市',
            '天津': '天津市',
            '上海': '上海市',
            '重庆': '重庆市',
            '河北': '河北省',
            '山西': '山西省',
            '辽宁': '辽宁省',
            '吉林': '吉林省',
            '黑龙江': '黑龙江省',
            '江苏': '江苏省',
            '浙江': '浙江省',
            '安徽': '安徽省',
            '福建': '福建省',
            '江西': '江西省',
            '山东': '山东省',
            '河南': '河南省',
            '湖北': '湖北省',
            '湖南': '湖南省',
            '广东': '广东省',
            '广西': '广西壮族自治区',
            '海南': '海南省',
            '四川': '四川省',
            '贵州': '贵州省',
            '云南': '云南省',
            '西藏': '西藏自治区',
            '陕西': '陕西省',
            '甘肃': '甘肃省',
            '青海': '青海省',
            '宁夏': '宁夏回族自治区',
            '新疆': '新疆维吾尔自治区',
            '内蒙古': '内蒙古自治区',
            '香港': '香港特别行政区',
            '澳门': '澳门特别行政区',
            '台湾': '台湾省',
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
        # 地图数据中的城市名称通常是完整格式，所以保持原样
        if not city:
            return city
        # 如果已经有后缀，直接返回
        if city.endswith(('市', '县', '区', '自治州', '盟', '地区', '自治县')):
            return city
        # 保持原样，不自动添加后缀（需要在输入时限制格式）
        return city
    
    def normalize_district_name(self, district):
        """标准化区县名称：保持完整格式（地图数据通常使用完整格式）"""
        # 地图数据中的区县名称通常是完整格式，所以保持原样
        if not district:
            return district
        # 如果已经有后缀，直接返回
        if district.endswith(('区', '县', '市', '自治县', '自治旗')):
            return district
        # 保持原样，不自动添加后缀
        return district

    def save(self, *args, **kwargs):
        """保存时自动同步外键字段和字符串字段，并标准化为地图需要的格式"""
        # 省份名称标准化：优先从外键获取，否则标准化字符串字段
        if self.province_obj:
            province_name = self.province_obj.name
            self.province = self.normalize_province_name(province_name)
        elif self.province:
            # 如果没有外键对象，但province字段有值，也要标准化
            self.province = self.normalize_province_name(self.province)
        
        # 城市名称标准化：优先从外键获取，否则标准化字符串字段
        if self.city_obj:
            city_name = self.city_obj.name
            self.city = self.normalize_city_name(city_name)
        elif self.city:
            # 如果没有外键对象，但city字段有值，也要标准化
            self.city = self.normalize_city_name(self.city)
        
        # 区县名称标准化：优先从外键获取，否则标准化字符串字段
        if self.district_obj:
            district_name = self.district_obj.name
            self.district = self.normalize_district_name(district_name)
        elif self.district:
            # 如果没有外键对象，但district字段有值，也要标准化
            self.district = self.normalize_district_name(self.district)
        
        super().save(*args, **kwargs)
    
    class Meta:
        verbose_name = "马拉松赛事"
        verbose_name_plural = "马拉松赛事"
        ordering = ['-event_date']  # 按赛事日期倒序排列
        # 添加数据库索引以加速查询
        indexes = [
            models.Index(fields=['event_date']),  # 按赛事日期索引
            models.Index(fields=['event_type']),  # 按赛事类型索引
            models.Index(fields=['province_obj']),  # 按省份索引
            models.Index(fields=['city_obj']),  # 按城市索引
            models.Index(fields=['district_obj']),  # 按区县索引
            models.Index(fields=['event_date', 'event_type']),  # 组合索引：日期和类型
        ]

"""马拉松报名赛事模型"""
class MarathonRegistration(models.Model):
    """报名赛事模型"""
    # 报名状态枚举
    REGISTRATION_STATUS_CHOICES = [
        ('preparing', '准备报名'),
        ('pending', '待抽签'),
        ('won', '已中签'),
        ('lost', '未中签'),
        ('abandoned', '已弃赛'),
        ('waitlist', '候补中'),
    ]
    
    # 赛事类型枚举
    EVENT_TYPE_CHOICES = [
        ('5km', '5KM'),
        ('10km', '10KM'),
        ('15km', '15KM'),
        ('half', '半程马拉松'),
        ('full', '全程马拉松'),
    ]
    
    # 交通信息枚举
    TRANSPORT_CHOICES = [
        ('booked', '已预定'),
        ('not_booked', '未预定'),
        ('local', '本地不需要'),
    ]
    
    # 住宿信息枚举
    ACCOMMODATION_CHOICES = [
        ('booked', '已预定'),
        ('not_booked', '未预定'),
        ('local', '本地不需要'),
    ]
    
    event_name = models.CharField(max_length=100, verbose_name="赛事名称")
    event_date = models.DateField(verbose_name="赛事日期")
    location = models.CharField(max_length=100, verbose_name="赛事地点")
    province = models.CharField(max_length=50, verbose_name="省份", blank=True)
    city = models.CharField(max_length=50, verbose_name="城市", blank=True)
    district = models.CharField(max_length=50, blank=True, verbose_name="区/县")
    event_type = models.CharField(max_length=10, choices=EVENT_TYPE_CHOICES, verbose_name="赛事类型", default='full')
    registration_status = models.CharField(max_length=20, choices=REGISTRATION_STATUS_CHOICES, verbose_name="报名状态", default='preparing')
    registration_date = models.DateField(verbose_name="报名时间", null=True, blank=True)
    registration_fee = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="报名费用", null=True, blank=True)
    draw_date = models.DateField(verbose_name="出签时间", null=True, blank=True)
    transport = models.CharField(max_length=20, choices=TRANSPORT_CHOICES, verbose_name="交通信息", null=True, blank=True)
    accommodation = models.CharField(max_length=20, choices=ACCOMMODATION_CHOICES, verbose_name="住宿信息", null=True, blank=True)
    notes = models.TextField(blank=True, verbose_name="备注")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="创建时间")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="更新时间")
    
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
            '北京': '北京市',
            '天津': '天津市',
            '上海': '上海市',
            '重庆': '重庆市',
            '河北': '河北省',
            '山西': '山西省',
            '辽宁': '辽宁省',
            '吉林': '吉林省',
            '黑龙江': '黑龙江省',
            '江苏': '江苏省',
            '浙江': '浙江省',
            '安徽': '安徽省',
            '福建': '福建省',
            '江西': '江西省',
            '山东': '山东省',
            '河南': '河南省',
            '湖北': '湖北省',
            '湖南': '湖南省',
            '广东': '广东省',
            '广西': '广西壮族自治区',
            '海南': '海南省',
            '四川': '四川省',
            '贵州': '贵州省',
            '云南': '云南省',
            '西藏': '西藏自治区',
            '陕西': '陕西省',
            '甘肃': '甘肃省',
            '青海': '青海省',
            '宁夏': '宁夏回族自治区',
            '新疆': '新疆维吾尔自治区',
            '内蒙古': '内蒙古自治区',
            '香港': '香港特别行政区',
            '澳门': '澳门特别行政区',
            '台湾': '台湾省',
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

    def save(self, *args, **kwargs):
        """保存时标准化地理名称为地图需要的格式"""
        # 标准化省份名称
        if self.province:
            self.province = self.normalize_province_name(self.province)
        
        # 标准化城市名称
        if self.city:
            self.city = self.normalize_city_name(self.city)
        
        # 标准化区县名称
        if self.district:
            self.district = self.normalize_district_name(self.district)
        
        super().save(*args, **kwargs)
    
    class Meta:
        verbose_name = "报名赛事"
        verbose_name_plural = "报名赛事"
        ordering = ['event_date']  # 按赛事日期升序排列（距离今天最近的日期在上面）
        # 添加数据库索引以加速查询
        indexes = [
            models.Index(fields=['event_date']),  # 按赛事日期索引
            models.Index(fields=['event_type']),  # 按赛事类型索引
            models.Index(fields=['registration_status']),  # 按报名状态索引
            models.Index(fields=['event_date', 'registration_status']),  # 组合索引：日期和状态
        ]
    
    def __str__(self):
        return f"{self.event_name} - {self.get_registration_status_display()}"

