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
    
    def save(self, *args, **kwargs):
        """保存时自动同步外键字段和字符串字段"""
        # 如果外键字段有值，同步到字符串字段
        if self.province_obj:
            self.province = self.province_obj.name
        if self.city_obj:
            self.city = self.city_obj.name
        if self.district_obj:
            self.district = self.district_obj.name
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
    
    class Meta:
        verbose_name = "报名赛事"
        verbose_name_plural = "报名赛事"
        ordering = ['event_date']  # 按赛事日期升序排列
        # 添加数据库索引以加速查询
        indexes = [
            models.Index(fields=['event_date']),  # 按赛事日期索引
            models.Index(fields=['event_type']),  # 按赛事类型索引
            models.Index(fields=['registration_status']),  # 按报名状态索引
            models.Index(fields=['event_date', 'registration_status']),  # 组合索引：日期和状态
        ]
    
    def __str__(self):
        return f"{self.event_name} - {self.get_registration_status_display()}"

