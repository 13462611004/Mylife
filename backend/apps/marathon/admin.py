from django.contrib import admin
from .models import Province, City, District, Marathon, MarathonRegistration

"""注册地区模型到管理后台"""
@admin.register(Province)
class ProvinceAdmin(admin.ModelAdmin):
    """省份管理"""
    list_display = ('name', 'code')
    search_fields = ('name',)
    ordering = ('id',)

@admin.register(City)
class CityAdmin(admin.ModelAdmin):
    """城市管理"""
    list_display = ('name', 'code', 'province')
    list_filter = ('province',)
    search_fields = ('name',)
    ordering = ('province', 'id')

@admin.register(District)
class DistrictAdmin(admin.ModelAdmin):
    """区/县管理"""
    list_display = ('name', 'code', 'city')
    list_filter = ('city',)
    search_fields = ('name',)
    ordering = ('city', 'id')

"""注册马拉松赛事模型到管理后台"""
@admin.register(Marathon)
class MarathonAdmin(admin.ModelAdmin):
    """马拉松赛事管理"""
    list_display = ('event_name', 'event_date', 'location', 'province', 'city', 'event_type')
    list_filter = ('event_type', 'province', 'city', 'event_date')
    search_fields = ('event_name', 'location')
    date_hierarchy = 'event_date'
    ordering = ('-event_date',)
    
    fieldsets = (
        ('基本信息', {
            'fields': ('event_name', 'event_date', 'location')
        }),
        ('地区信息（级联选择）', {
            'fields': ('province_obj', 'city_obj', 'district_obj')
        }),
        ('赛事详情', {
            'fields': ('event_type', 'finish_time', 'pace')
        }),
        ('附加信息', {
            'fields': ('certificate', 'description', 'event_log')
        }),
    )
    
    class Media:
        """添加自定义JavaScript实现级联选择"""
        js = ('marathon/js/cascade_select.js',)

"""注册报名赛事模型到管理后台"""
@admin.register(MarathonRegistration)
class MarathonRegistrationAdmin(admin.ModelAdmin):
    """报名赛事管理"""
    list_display = ('event_name', 'event_date', 'location', 'event_type', 'registration_status', 'registration_fee')
    list_filter = ('registration_status', 'event_type', 'province', 'city', 'event_date')
    search_fields = ('event_name', 'location')
    date_hierarchy = 'event_date'
    ordering = ('event_date',)
    
    fieldsets = (
        ('基本信息', {
            'fields': ('event_name', 'event_date', 'location', 'province', 'city', 'district')
        }),
        ('赛事信息', {
            'fields': ('event_type', 'registration_status')
        }),
        ('报名信息', {
            'fields': ('registration_date', 'registration_fee')
        }),
        ('待抽签信息', {
            'fields': ('draw_date',),
            'classes': ('collapse',),
        }),
        ('已中签信息', {
            'fields': ('transport', 'accommodation'),
            'classes': ('collapse',),
        }),
        ('附加信息', {
            'fields': ('notes',)
        }),
    )

