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
        # 读取 XMP 元数据
        image = Image.open(image_path)
        exif_data = image._getexif()
        
        if not exif_data:
            logger.info(f'No EXIF data found in {image_path}')
            return None
        
        # 检查是否为 Live Photo
        # 标签 271 = "meizu", 272 = "MEIZU"
        make_tag = exif_data.get(271, b'')
        if isinstance(make_tag, bytes):
            make = make_tag.decode('utf-8', errors='ignore').lower()
        elif isinstance(make_tag, str):
            make = make_tag.lower()
        else:
            make = str(make_tag).lower()
        
        model_tag = exif_data.get(272, b'')
        if isinstance(model_tag, bytes):
            model = model_tag.decode('utf-8', errors='ignore').lower()
        elif isinstance(model_tag, str):
            model = model_tag.lower()
        else:
            model = str(model_tag).lower()
        
        is_live_photo = False
        
        # 检查 XMP 元数据
        for tag, value in exif_data.items():
            if isinstance(value, bytes):
                try:
                    xmp_data = value.decode('utf-8', errors='ignore')
                    if 'Camera:MotionPhoto="1"' in xmp_data or "Camera:MotionPhoto='1'" in xmp_data:
                        logger.info(f'Found MotionPhoto in EXIF tag {tag}')
                        is_live_photo = True
                        break
                except:
                    pass
        
        # 检查是否为魅族设备
        if 'meizu' in make or 'meizu' in model:
            logger.info(f'Found Meizu device: {make} {model}')
            is_live_photo = True
        
        if not is_live_photo:
            logger.info(f'Not a Live Photo: {image_path}')
            return None
        
        # 读取文件，查找视频数据
        with open(image_path, 'rb') as f:
            file_data = f.read()
        
        # 在文件末尾查找 MP4 魔数
        mp4_magic = b'\x00\x00\x00\x18ftypmp42'
        mp4_pos = file_data.rfind(mp4_magic)
        
        if mp4_pos == -1:
            mp4_magic = b'\x00\x00\x00\x18ftyp'
            mp4_pos = file_data.rfind(mp4_magic)
        
        if mp4_pos == -1:
            logger.info(f'No MP4 magic found in {image_path}')
            return None
        
        logger.info(f'Found MP4 magic at position {mp4_pos}')
        
        # 找到 mdat box
        mdat_magic = b'mdat'
        mdat_pos = file_data.find(mdat_magic, mp4_pos)
        
        if mdat_pos == -1:
            logger.info(f'No mdat box found in {image_path}')
            return None
        
        logger.info(f'mdat box position: {mdat_pos}')
        
        # 读取 mdat box 大小
        mdat_size = int.from_bytes(file_data[mdat_pos-4:mdat_pos], 'big')
        logger.info(f'mdat box size field: {mdat_size}')
        
        # 如果 mdat_size = 1，说明使用 64 位大小
        if mdat_size == 1:
            # 读取 64 位大小字段
            mdat_size_8byte = int.from_bytes(file_data[mdat_pos+8:mdat_pos+16], 'big')
            logger.info(f'mdat box 64-bit size field: {mdat_size_8byte}')
            
            # 计算 mdat 数据的实际大小
            mdat_data_size = mdat_size_8byte - 16  # 减去 16 byte 头部
            
            # 检查 64 位大小是否合理
            if mdat_data_size + mdat_pos + 16 <= len(file_data):
                logger.info(f'mdat box size is valid, extracting complete video data')
                # 提取完整的视频数据（从 ftyp 到 mdat 末尾）
                video_data = file_data[mp4_pos:mdat_pos + mdat_size_8byte]
            else:
                logger.info(f'mdat box size is invalid, extracting data from ftyp to end of file')
                # 直接提取从 ftyp 到文件末尾的数据
                video_data = file_data[mp4_pos:]
        else:
            # 提取完整的视频数据
            video_data = file_data[mp4_pos:mdat_pos + mdat_size]
        
        logger.info(f'Extracted video data: {len(video_data)} bytes')
        
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
