import subprocess
import os
import logging
from PIL import Image, ExifTags, ImageOps

logger = logging.getLogger(__name__)

def extract_video_from_live_photo(image_path):
    """
    从魅族 Live Photo 的 .jpg 文件中提取视频
    
    Args:
        image_path: 图片文件路径
        
    Returns:
        视频文件路径，如果提取失败则返回 None
    """
    try:
        # 使用 Pillow 读取 EXIF 元数据
        image = Image.open(image_path)
        exif_data = image._getexif()
        
        if not exif_data:
            logger.info(f'No EXIF data found in {image_path}')
            return None
        
        # 查找视频数据（魅族 Live Photo 可能使用不同的标签）
        video_data = None
        
        # 检查常见的视频标签
        for tag in ['VideoData', 'MotionPhotoVideo', 'LivePhotoVideo', 'EmbeddedVideo']:
            if tag in exif_data:
                video_data = exif_data[tag]
                logger.info(f'Found video data in EXIF tag: {tag}')
                break
        
        # 如果没有找到常见的视频标签，尝试从所有 EXIF 标签中查找
        if not video_data:
            logger.info(f'No common video tags found, checking all EXIF tags')
            for tag in exif_data:
                try:
                    value = exif_data[tag]
                    # 检查是否为字符串且包含视频相关关键词
                    if isinstance(value, str) and any(keyword in value.lower() for keyword in ['video', 'mp4', 'mov', 'live']):
                        logger.info(f'Found potential video data in tag {tag}: {value[:100]}')
                        # 尝试解析为 base64 编码的视频数据
                        if value.startswith('data:video') or value.startswith('data:video/mp4') or value.startswith('data:video/mov'):
                            try:
                                import base64
                                if ',' in value:
                                    header, data = value.split(',', 1)
                                    video_bytes = base64.b64decode(data)
                                else:
                                    video_bytes = base64.b64decode(value.split(':', 1)[1])
                                video_data = video_bytes
                                logger.info(f'Successfully extracted video from tag {tag}')
                                break
                            except Exception as e:
                                logger.warning(f'Failed to decode base64 data from tag {tag}: {e}')
                    # 检查是否为 bytes 类型（可能是原始视频数据）
                    elif isinstance(value, bytes):
                        # 检查是否为有效的视频数据（大于 1KB）
                        if len(value) > 1024:
                            logger.info(f'Found potential video data in tag {tag} (bytes, size: {len(value)})')
                            video_data = value
                            break
                except Exception as e:
                    logger.warning(f'Failed to process tag {tag}: {e}')
        
        if not video_data:
            logger.info(f'No video data found in EXIF metadata')
            return None
        
        # 保存视频文件
        video_path = image_path.replace('.jpg', '.mp4')
        if not video_path.endswith('.mp4'):
            video_path = video_path.rsplit('.', 1)[0] + '.mp4'
        
        # 如果视频数据是 base64 编码
        if isinstance(video_data, str) and video_data.startswith('data:'):
            import base64
            header, data = video_data.split(',', 1)
            video_bytes = base64.b64decode(data)
        elif isinstance(video_data, bytes):
            video_bytes = video_data
        else:
            logger.warning(f'Unsupported video data format: {type(video_data)}')
            return None
        
        # 写入视频文件
        with open(video_path, 'wb') as f:
            f.write(video_bytes)
        
        logger.info(f'Successfully extracted video to {video_path}')
        return video_path
        
    except Exception as e:
        logger.error(f'Error extracting video from live photo: {e}')
        return None


def is_live_photo(image_path):
    """
    检测图片是否为 Live Photo
    
    Args:
        image_path: 图片文件路径
        
    Returns:
        bool: 是否为 Live Photo
    """
    try:
        # 使用 Pillow 读取 EXIF 元数据
        image = Image.open(image_path)
        exif_data = image._getexif()
        
        if not exif_data:
            logger.info(f'No EXIF data found in {image_path}')
            return False
        
        # 检查是否包含视频相关标签
        video_tags = ['VideoData', 'MotionPhotoVideo', 'LivePhotoVideo', 'EmbeddedVideo']
        for tag in video_tags:
            if tag in exif_data:
                logger.info(f'Found video tag in EXIF: {tag}')
                return True
        
        # 检查是否为魅族设备拍摄的图片（通过 Make 标签）
        # 标签 271 = "meizu", 272 = "MEIZU"
        make = exif_data.get(271, '').lower()
        if 'meizu' in make or 'meizu' in make:
            logger.info(f'Found Meizu device in EXIF: {make}')
            return True
        
        return False
        
    except Exception as e:
        logger.error(f'Error detecting live photo: {e}')
        return False
