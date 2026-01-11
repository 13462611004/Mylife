import subprocess
import os
import logging
import piexif
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
        # 使用 piexif 读取 EXIF 元数据
        exif_dict = piexif.load(image_path)
        
        if not exif_dict:
            logger.info(f'No EXIF data found in {image_path}')
            return None
        
        # 记录所有 EXIF 标签，用于调试
        logger.info(f'EXIF tags found: {list(exif_dict.keys())}')
        
        # 查找视频数据（魅族 Live Photo 可能使用不同的标签）
        video_data = None
        
        # 检查 XMP 元数据
        if '0th' in exif_dict:
            for key, value in exif_dict['0th'].items():
                logger.info(f'EXIF 0th tag {key}: type={type(value).__name__}, value={str(value)[:200]}')
                # 检查是否为视频数据
                if isinstance(value, bytes) and len(value) > 1024:
                    logger.info(f'Found potential video data in 0th tag {key} (bytes, size: {len(value)})')
                    video_data = value
                    break
        
        # 检查 EXIF 元数据
        if 'Exif' in exif_dict and not video_data:
            for key, value in exif_dict['Exif'].items():
                logger.info(f'EXIF Exif tag {key}: type={type(value).__name__}, value={str(value)[:200]}')
                # 检查是否为视频数据
                if isinstance(value, bytes) and len(value) > 1024:
                    logger.info(f'Found potential video data in Exif tag {key} (bytes, size: {len(value)})')
                    video_data = value
                    break
        
        # 检查 Interop 元数据
        if 'Interop' in exif_dict and not video_data:
            for key, value in exif_dict['Interop'].items():
                logger.info(f'EXIF Interop tag {key}: type={type(value).__name__}, value={str(value)[:200]}')
                # 检查是否为视频数据
                if isinstance(value, bytes) and len(value) > 1024:
                    logger.info(f'Found potential video data in Interop tag {key} (bytes, size: {len(value)})')
                    video_data = value
                    break
        
        # 检查 1st 元数据
        if '1st' in exif_dict and not video_data:
            for key, value in exif_dict['1st'].items():
                logger.info(f'EXIF 1st tag {key}: type={type(value).__name__}, value={str(value)[:200]}')
                # 检查是否为视频数据
                if isinstance(value, bytes) and len(value) > 1024:
                    logger.info(f'Found potential video data in 1st tag {key} (bytes, size: {len(value)})')
                    video_data = value
                    break
        
        # 检查 thumbnail 元数据
        if 'thumbnail' in exif_dict and not video_data:
            thumbnail_data = exif_dict['thumbnail']
            if isinstance(thumbnail_data, bytes) and len(thumbnail_data) > 1024:
                logger.info(f'Found potential video data in thumbnail (bytes, size: {len(thumbnail_data)})')
                video_data = thumbnail_data
        
        if not video_data:
            logger.info(f'No video data found in EXIF metadata')
            return None
        
        # 保存视频文件
        video_path = image_path.replace('.jpg', '.mp4')
        if not video_path.endswith('.mp4'):
            video_path = video_path.rsplit('.', 1)[0] + '.mp4'
        
        # 如果视频数据是 bytes 类型
        if isinstance(video_data, bytes):
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
