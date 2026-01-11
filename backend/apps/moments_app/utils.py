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
        
        # 记录所有 EXIF 标签，用于调试
        logger.info(f'EXIF tags found: {list(exif_data.keys())}')
        for tag, value in exif_data.items():
            try:
                value_str = str(value)[:200] if len(str(value)) > 200 else str(value)
                logger.info(f'EXIF tag {tag}: type={type(value).__name__}, value={value_str}')
            except Exception as e:
                logger.warning(f'Failed to log EXIF tag {tag}: {e}')
        
        # 查找视频数据（魅族 Live Photo 可能使用不同的标签）
        video_data = None
        
        # 记录所有 EXIF 标签，用于调试
        logger.info(f'EXIF tags found: {list(exif_data.keys())}')
        
        # 优先检查Container XMP元数据（Android动态照片标准）
        if 'Container' in exif_data:
            container_data = exif_data['Container']
            logger.info(f'Found Container XMP data: {container_data}')
            
            # 检查是否有MotionPhoto容器
            if isinstance(container_data, list):
                for item in container_data:
                    if isinstance(item, dict) and item.get('Semantic') == 'MotionPhoto':
                        logger.info(f'Found MotionPhoto container item: {item}')
                        # 提取视频数据
                        if 'Data' in item:
                            video_data = item['Data']
                            logger.info(f'Found video data in MotionPhoto container, size: {len(video_data) if isinstance(video_data, (str, bytes)) else "unknown"}')
                            break
        
        # 如果没有找到MotionPhoto，继续检查常见的视频标签
        if not video_data:
            logger.info(f'No MotionPhoto container found, checking common video tags')
            for tag in ['VideoData', 'MotionPhotoVideo', 'LivePhotoVideo', 'EmbeddedVideo']:
                if tag in exif_data:
                    video_data = exif_data[tag]
                    logger.info(f'Found video data in EXIF tag: {tag}')
                    break
        
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
