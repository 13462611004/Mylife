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
        # 读取文件，查找视频数据
        with open(image_path, 'rb') as f:
            f.seek(0, 2)  # 移动到文件尾部
            file_size = f.tell()
            
            # 自动读取足够的尾部数据来找到视频数据
            # 从 1MB 开始，如果没找到就增加
            chunk_size = 1024 * 1024  # 1MB
            tail_data = None
            
            for i in range(5):  # 最多读取 5MB
                read_size = (i + 1) * chunk_size
                if read_size > file_size:
                    read_size = file_size
                
                f.seek(file_size - read_size)
                tail_data = f.read()
                
                logger.info(f'Trying to find ftyp in last {read_size / 1024 / 1024:.2f} MB')
                
                # 在尾部数据中查找 ftyp 魔数
                ftyp_pos = tail_data.find(b'ftyp')
                if ftyp_pos >= 0:
                    logger.info(f'Found ftyp at position {ftyp_pos} from end of chunk')
                    break
            
            if not tail_data or len(tail_data) < 1024:
                logger.info('Not enough data to extract video')
                return None
            
            # 检查尾部数据是否为有效的视频文件
            # MP4 文件的魔数是 00 00 00 18 66 74 70 79 6D 70 61
            if len(tail_data) > 1024:
                # 在尾部数据中查找 MP4 魔数
                mp4_magic = b'\x00\x00\x00\x18\x66\x74\x79\x70\x6d\x70\x34\x32'
                mp4_pos = tail_data.find(mp4_magic)
                
                if mp4_pos >= 0:
                    logger.info(f'Found MP4 video data in file tail at position {mp4_pos}')
                    
                    # 检查 mdat box 是否使用 64 位大小
                    mdat_pos_in_tail = tail_data.find(b'mdat', mp4_pos)
                    if mdat_pos_in_tail >= 0:
                        mdat_size = int.from_bytes(tail_data[mdat_pos_in_tail-4:mdat_pos_in_tail], 'big')
                        logger.info(f'mdat box size field: {mdat_size}')
                        
                        if mdat_size == 1:
                            # 64 位大小标记，检查是否有效
                            large_size = int.from_bytes(tail_data[mdat_pos_in_tail+8:mdat_pos_in_tail+16], 'big')
                            logger.info(f'mdat box 64-bit size field: {large_size}')
                            
                            # 检查 64 位大小是否合理
                            if large_size > len(tail_data):
                                # 64 位大小无效，手动计算 mdat 数据大小
                                logger.info(f'mdat box 64-bit size is invalid, using manual calculation')
                                # mdat 数据从 mdat_pos + 16 开始，到 tail_data 末尾
                                mdat_data = tail_data[mdat_pos_in_tail + 16:]
                                logger.info(f'mdat data size: {len(mdat_data)} bytes')
                                
                                # 重建 MP4 文件
                                # 从 ftyp 到 mdat 头部 + mdat 数据
                                video_data = tail_data[mp4_pos:mdat_pos_in_tail + 8]  # ftyp + moov + free + mdat 头部(8 bytes)
                                video_data += mdat_data  # mdat 数据
                                
                                logger.info(f'Created corrected MP4: {len(video_data)} bytes')
                            else:
                                # 64 位大小有效，直接使用
                                video_data = tail_data[mp4_pos:]
                        else:
                            video_data = tail_data[mp4_pos:]
                    else:
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
        # 使用与原图片相同的文件名，只是将后缀改为 .mp4
        video_path = image_path
        if video_path.lower().endswith('.jpg'):
            video_path = video_path[:-4] + '.mp4'
        elif video_path.lower().endswith('.jpeg'):
            video_path = video_path[:-5] + '.mp4'
        elif video_path.lower().endswith('.png'):
            video_path = video_path[:-4] + '.mp4'
        else:
            # 如果不是标准后缀，直接替换最后一部分
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
