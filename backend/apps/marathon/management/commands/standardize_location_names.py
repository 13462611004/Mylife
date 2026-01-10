from django.core.management.base import BaseCommand
from apps.marathon.models import Marathon, MarathonRegistration


class Command(BaseCommand):
    help = '标准化数据库中所有赛事的地理名称（省份、城市、区县）为地图需要的格式'

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
        # 保持原样，不自动添加后缀
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

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING('开始标准化地理位置名称...'))
        
        # 处理 Marathon 模型
        marathon_updated = 0
        marathon_skipped = 0
        marathon_total = Marathon.objects.count()
        
        for event in Marathon.objects.all():
            updated = False
            original_province = event.province
            original_city = event.city
            original_district = event.district
            
            # 标准化省份名称
            if event.province:
                normalized_province = self.normalize_province_name(event.province)
                if normalized_province != event.province:
                    event.province = normalized_province
                    updated = True
            
            # 标准化城市名称
            if event.city:
                normalized_city = self.normalize_city_name(event.city)
                if normalized_city != event.city:
                    event.city = normalized_city
                    updated = True
            
            # 标准化区县名称
            if event.district:
                normalized_district = self.normalize_district_name(event.district)
                if normalized_district != event.district:
                    event.district = normalized_district
                    updated = True
            
            if updated:
                event.save()
                marathon_updated += 1
                self.stdout.write(
                    self.style.SUCCESS(
                        f'更新 Marathon ID {event.id}: '
                        f'{original_province} -> {event.province}, '
                        f'{original_city} -> {event.city}, '
                        f'{original_district} -> {event.district}'
                    )
                )
            else:
                marathon_skipped += 1
        
        # 处理 MarathonRegistration 模型
        registration_updated = 0
        registration_skipped = 0
        registration_total = MarathonRegistration.objects.count()
        
        for registration in MarathonRegistration.objects.all():
            updated = False
            original_province = registration.province
            original_city = registration.city
            original_district = registration.district
            
            # 标准化省份名称
            if registration.province:
                normalized_province = self.normalize_province_name(registration.province)
                if normalized_province != registration.province:
                    registration.province = normalized_province
                    updated = True
            
            # 标准化城市名称
            if registration.city:
                normalized_city = self.normalize_city_name(registration.city)
                if normalized_city != registration.city:
                    registration.city = normalized_city
                    updated = True
            
            # 标准化区县名称
            if registration.district:
                normalized_district = self.normalize_district_name(registration.district)
                if normalized_district != registration.district:
                    registration.district = normalized_district
                    updated = True
            
            if updated:
                registration.save()
                registration_updated += 1
                self.stdout.write(
                    self.style.SUCCESS(
                        f'更新 MarathonRegistration ID {registration.id}: '
                        f'{original_province} -> {registration.province}, '
                        f'{original_city} -> {registration.city}, '
                        f'{original_district} -> {registration.district}'
                    )
                )
            else:
                registration_skipped += 1
        
        # 输出统计信息
        self.stdout.write(
            self.style.SUCCESS(
                f'\n=== 标准化完成 ===\n'
                f'\nMarathon 模型:'
                f'\n  总计: {marathon_total} 条'
                f'\n  更新: {marathon_updated} 条'
                f'\n  跳过: {marathon_skipped} 条'
                f'\n\nMarathonRegistration 模型:'
                f'\n  总计: {registration_total} 条'
                f'\n  更新: {registration_updated} 条'
                f'\n  跳过: {registration_skipped} 条'
                f'\n\n总计更新: {marathon_updated + registration_updated} 条记录'
            )
        )
