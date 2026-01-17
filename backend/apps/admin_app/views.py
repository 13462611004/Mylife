from django.contrib.auth.hashers import check_password
from rest_framework.decorators import api_view, parser_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .models import AdminSetting
from .serializers import AdminSettingSerializer
import logging
import json
import os

logger = logging.getLogger(__name__)

@api_view(['POST'])
def admin_login(request):
    """管理员登录"""
    try:
        # 使用 DRF 的 request.data 获取请求数据（支持 JSON 和 Form 数据）
        password = request.data.get('password')

        if not password:
            return Response({'error': '请提供密码'}, status=status.HTTP_400_BAD_REQUEST)

        # 获取管理员设置（假设只有一个）
        try:
            admin_setting = AdminSetting.objects.get(id=1)
        except AdminSetting.DoesNotExist:
            # 如果不存在，创建一个默认的管理员设置
            admin_setting = AdminSetting.objects.create(admin_password='admin123')

        # 验证密码
        if check_password(password, admin_setting.admin_password):
            # 设置session
            request.session['is_admin'] = True
            request.session.save()  # 确保session保存
            return Response({'message': '登录成功'}, status=status.HTTP_200_OK)
        else:
            return Response({'error': '密码错误'}, status=status.HTTP_401_UNAUTHORIZED)
    except Exception as e:
        logger.error(f'管理员登录失败: {str(e)}', exc_info=True)
        return Response({'error': '登录失败，请稍后重试'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def admin_logout(request):
    """管理员注销"""
    # 清除session
    if 'is_admin' in request.session:
        del request.session['is_admin']
    return Response({'message': '注销成功'}, status=status.HTTP_200_OK)

@api_view(['GET', 'PUT'])
def admin_settings(request):
    """管理员设置"""
    # 检查是否已登录
    if not request.session.get('is_admin'):
        return Response({'error': '请先登录'}, status=status.HTTP_401_UNAUTHORIZED)

    try:
        # 获取管理员设置
        admin_setting = AdminSetting.objects.get(id=1)
    except AdminSetting.DoesNotExist:
        # 如果不存在，创建一个默认的管理员设置
        admin_setting = AdminSetting.objects.create(admin_password='admin123')

    if request.method == 'GET':
        # 返回管理员设置
        serializer = AdminSettingSerializer(admin_setting, context={'request': request})
        return Response(serializer.data)
    elif request.method == 'PUT':
        # 更新管理员设置（支持文件上传）
        data = request.data.copy()
        
        # 处理头像上传
        if 'avatar' in request.FILES:
            admin_setting.avatar = request.FILES['avatar']
        
        # 处理轮播图数据（可能是JSON字符串）
        if 'carousel_images' in data:
            if isinstance(data['carousel_images'], str):
                try:
                    data['carousel_images'] = json.loads(data['carousel_images'])
                except:
                    data['carousel_images'] = []
        
        # 处理装饰图标数据（可能是JSON字符串）
        if 'decorative_icons' in data:
            if isinstance(data['decorative_icons'], str):
                try:
                    data['decorative_icons'] = json.loads(data['decorative_icons'])
                except:
                    data['decorative_icons'] = {}
        
        serializer = AdminSettingSerializer(admin_setting, data=data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def upload_carousel_image(request):
    """上传轮播图图片"""
    # 检查是否已登录
    if not request.session.get('is_admin'):
        return Response({'error': '请先登录'}, status=status.HTTP_401_UNAUTHORIZED)
    
    image_file = request.FILES.get('image') # 尝试从request.FILES获取
    original_file = request.FILES.get('original') # 获取原始图片（如果存在）
    if not image_file:
        # 如果request.FILES中没有，尝试从request.data中获取（某些情况下文件可能被解析到这里）
        image_file = request.data.get('image')
        original_file = request.data.get('original')
    
    if not image_file:
        logger.error(f'未找到image文件 - FILES keys: {list(request.FILES.keys())}, data keys: {list(request.data.keys())}')
        return Response({'error': '请选择图片文件', 'received_files_keys': list(request.FILES.keys()), 'received_data_keys': list(request.data.keys())}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # 获取管理员设置
        admin_setting = AdminSetting.objects.get(id=1)
        
        # 保存裁剪后的图片
        from django.core.files.storage import default_storage
        
        file_path = default_storage.save(f'admin/carousel/{image_file.name}', image_file)
        file_url = default_storage.url(file_path)
        
        # 保存原始图片（如果存在）
        original_url = None
        if original_file:
            original_path = default_storage.save(f'admin/carousel/original_{original_file.name}', original_file)
            original_url = default_storage.url(original_path)
        
        # 添加到轮播图列表
        carousel_images = admin_setting.carousel_images or []
        if not isinstance(carousel_images, list):
            carousel_images = []
        
        carousel_images.append({
            'url': file_url,  # 裁剪后的图片（用于轮播图显示）
            'original_url': original_url,  # 原始图片（用于预览）
            'alt': request.data.get('alt', '轮播图')
        })
        
        admin_setting.carousel_images = carousel_images
        admin_setting.save()
        
        return Response({
            'message': '上传成功',
            'url': request.build_absolute_uri(file_url),
            'original_url': request.build_absolute_uri(original_url) if original_url else None,
            'carousel_images': admin_setting.carousel_images
        })
    except Exception as e:
        logger.error(f'上传轮播图失败: {str(e)}', exc_info=True)
        return Response({'error': f'上传失败: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)