from django.core.management.base import BaseCommand
from apps.marathon.models import Marathon


class Command(BaseCommand):
    help = '修复配速数据格式，将 5:30/km 转换为 05:30'

    def handle(self, *args, **options):
        events = Marathon.objects.all()
        updated_count = 0
        
        for event in events:
            old_pace = event.pace
            if not old_pace:
                continue
            
            # 移除 /km 后缀
            new_pace = old_pace.replace('/km', '').strip()
            
            # 检查格式是否为 m:ss 或 mm:ss
            if ':' in new_pace:
                parts = new_pace.split(':')
                if len(parts) == 2:
                    try:
                        minutes = int(parts[0])
                        seconds = parts[1]
                        # 确保分钟数是两位数格式
                        new_pace = f'{minutes:02d}:{seconds}'
                        
                        if new_pace != old_pace:
                            event.pace = new_pace
                            event.save(update_fields=['pace'])
                            self.stdout.write(
                                self.style.SUCCESS(
                                    f'Updated ID {event.id}: "{old_pace}" -> "{new_pace}"'
                                )
                            )
                            updated_count += 1
                    except ValueError:
                        self.stdout.write(
                            self.style.WARNING(
                                f'ID {event.id}: Invalid pace format "{old_pace}", skipping'
                            )
                        )
                else:
                    self.stdout.write(
                        self.style.WARNING(
                            f'ID {event.id}: Invalid pace format "{old_pace}", expected m:ss or mm:ss'
                        )
                    )
            else:
                self.stdout.write(
                    self.style.WARNING(
                        f'ID {event.id}: Pace "{old_pace}" does not contain ":", skipping'
                    )
                )
        
        self.stdout.write(
            self.style.SUCCESS(f'\n修复完成！共更新 {updated_count} 条记录')
        )
