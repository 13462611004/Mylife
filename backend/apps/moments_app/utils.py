import subprocess
import os
import logging
import piexif
from motion_photo_splitter.__main__ import Splitter
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
        # 读取文件的尾部，查找视频数据
        with open(image_path, 'rb') as f:
            f.seek(0, 2)  # 移动到文件尾部
            file_size = f.tell()
            
            # 读取文件的最后 2MB 数据（视频数据可能在这个范围内）
            f.seek(max(0, file_size - 2 * 1024 * 1024))
            tail_data = f.read()
            
            logger.info(f'File size: {file_size}, Tail data size: {len(tail_data)}')
            
            # 检查尾部数据是否为有效的视频文件
            # MP4 文件的魔数是 00 00 00 18 66 74 70 79 6D 70 61
            if len(tail_data) > 1024:
                # 在尾部数据中查找 MP4 魔数
                mp4_magic = b'\x00\x00\x00\x18\x66\x74\x79\x70\x6d\x70\x34\x32'
                mp4_pos = tail_data.find(mp4_magic)
                
                if mp4_pos >= 0:
                    logger.info(f'Found MP4 video data in file tail at position {mp4_pos}')
                    video_data = tail_data[mp4_pos:]
                else:
                    # 尝试其他 MP4 魔数
                    mp4_magic2 = b'\x00\x00\x00\x18\x66\x74\x79\x70'
                    mp4_pos = tail_data.find(mp4_magic2)
                    
                    if mp4_pos >= 0:
                        logger.info(f'Found MP4 video data in file tail at position {mp4_pos}')
                        video_data = tail_data[mp4_pos:]
                    else:
                        logger.info(f'Tail data does not look like a video file')
                        return None
            else:
                logger.info(f'Tail data is too small to be a video file')
                return None
        
        # 保存视频文件
        video_path = image_path.replace('.jpg', '.mp4')
        if not video_path.endswith('.mp4'):
            video_path = video_path.rsplit('.', 1)[0] + '.mp4'
        
        # 写入视频文件
        with open(video_path, 'wb') as f:
            f.write(video_data)
        
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
