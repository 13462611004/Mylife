from django.core.management.base import BaseCommand
from apps.marathon.models import Marathon

class Command(BaseCommand):
    help = '迁移现有赛事数据，填充province、city和district字段'

    def handle(self, *args, **options):
        # 城市到省份的映射
        city_to_province = {
            '北京': '北京市',
            '上海': '上海市',
            '天津': '天津市',
            '重庆': '重庆市',
            '广州': '广东省',
            '深圳': '广东省',
            '珠海': '广东省',
            '东莞': '广东省',
            '佛山': '广东省',
            '杭州': '浙江省',
            '宁波': '浙江省',
            '温州': '浙江省',
            '南京': '江苏省',
            '苏州': '江苏省',
            '无锡': '江苏省',
            '常州': '江苏省',
            '武汉': '湖北省',
            '成都': '四川省',
            '西安': '陕西省',
            '郑州': '河南省',
            '长沙': '湖南省',
            '合肥': '安徽省',
            '福州': '福建省',
            '厦门': '福建省',
            '济南': '山东省',
            '青岛': '山东省',
            '沈阳': '辽宁省',
            '大连': '辽宁省',
            '长春': '吉林省',
            '哈尔滨': '黑龙江省',
            '石家庄': '河北省',
            '太原': '山西省',
            '呼和浩特': '内蒙古自治区',
            '南昌': '江西省',
            '南宁': '广西壮族自治区',
            '海口': '海南省',
            '昆明': '云南省',
            '贵阳': '贵州省',
            '兰州': '甘肃省',
            '西宁': '青海省',
            '银川': '宁夏回族自治区',
            '乌鲁木齐': '新疆维吾尔自治区',
            '拉萨': '西藏自治区',
            '台北': '台湾省',
            '香港': '香港特别行政区',
            '澳门': '澳门特别行政区',
        }

        # 获取所有赛事
        events = Marathon.objects.all()
        updated_count = 0
        skipped_count = 0

        for event in events:
            location = event.location.strip()
            
            # 如果已经有数据，跳过
            if event.province and event.city:
                skipped_count += 1
                continue
            
            # 尝试从location中提取城市
            province = city_to_province.get(location)
            
            if province:
                event.province = province
                event.city = location
                event.district = ''
                event.save()
                updated_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'已更新: {event.event_name} - {location} -> {province}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'未找到映射: {event.event_name} - {location}')
                )

        self.stdout.write(
            self.style.SUCCESS(
                f'\n迁移完成！\n'
                f'更新: {updated_count} 条\n'
                f'跳过: {skipped_count} 条\n'
                f'总计: {events.count()} 条'
            )
        )
