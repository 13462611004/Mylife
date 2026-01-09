from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.hashers import check_password
from django.contrib.sessions.backends.db import SessionStore
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import AdminSetting
from .serializers import AdminSettingSerializer
import json

@csrf_exempt
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
        import traceback
        print(f"登录错误: {str(e)}")
        print(traceback.format_exc())
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@csrf_exempt
@api_view(['POST'])
def admin_logout(request):
    """管理员注销"""
    # 清除session
    if 'is_admin' in request.session:
        del request.session['is_admin']
    return Response({'message': '注销成功'}, status=status.HTTP_200_OK)

@csrf_exempt
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
        return Response({'error': '管理员设置不存在'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        # 返回管理员设置
        serializer = AdminSettingSerializer(admin_setting)
        return Response(serializer.data)
    elif request.method == 'PUT':
        # 更新管理员设置
        serializer = AdminSettingSerializer(admin_setting, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

