from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.views.decorators.cache import cache_page
from django.utils.decorators import method_decorator
from .models import Marathon, Province, City, District, MarathonRegistration
from .serializers import MarathonSerializer, MarathonListSerializer, MarathonRegistrationSerializer, MarathonRegistrationListSerializer
from .permissions import IsAdminOrReadOnly
from django.conf import settings
import os

"""马拉松赛事视图"""
class MarathonListView(APIView):
    """马拉松赛事列表视图"""
    permission_classes = [IsAdminOrReadOnly]
    
    # 暂时禁用缓存以便调试
    # @method_decorator(cache_page(settings.CACHE_TIMEOUT['MEDIUM']))  # 缓存30分钟
    def get(self, request):
        """获取所有马拉松赛事"""
        # 使用select_related优化外键查询，减少SQL查询次数
        # province_obj, city_obj, district_obj是外键字段，使用select_related可以一次性加载相关对象
        marathons = Marathon.objects.select_related('province_obj', 'city_obj', 'district_obj').all()
        # 使用精简序列化器减少数据传输量
        serializer = MarathonListSerializer(marathons, many=True)
        return Response(serializer.data)

    def post(self, request):
        """添加新的马拉松赛事"""
        serializer = MarathonSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MarathonDetail(APIView):
    """获取单个马拉松赛事详情"""
    permission_classes = [IsAdminOrReadOnly]  # 允许游客读取

    def get_object(self, pk):
        """获取指定ID的马拉松赛事"""
        try:
            return Marathon.objects.get(pk=pk)
        except Marathon.DoesNotExist:
            return None

    def get(self, request, pk):
        """获取单个马拉松赛事详情"""
        marathon = self.get_object(pk)
        if marathon is None:
            return Response({'error': '马拉松赛事不存在'}, status=status.HTTP_404_NOT_FOUND)
        # 使用select_related优化外键查询，减少SQL查询次数
        # 重新查询以获取关联的外键对象
        marathon = Marathon.objects.select_related('province_obj', 'city_obj', 'district_obj').get(pk=pk)
        serializer = MarathonSerializer(marathon, context={'request': request})
        return Response(serializer.data)

    def put(self, request, pk):
        """更新马拉松赛事"""
        marathon = self.get_object(pk)
        if marathon is None:
            return Response({'error': '马拉松赛事不存在'}, status=status.HTTP_404_NOT_FOUND)
        serializer = MarathonSerializer(marathon, data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        """删除马拉松赛事"""
        marathon = self.get_object(pk)
        if marathon is None:
            return Response({'error': '马拉松赛事不存在'}, status=status.HTTP_404_NOT_FOUND)
        # 删除证书图片（如果存在）
        if marathon.certificate:
            certificate_path = os.path.join(settings.MEDIA_ROOT, marathon.certificate.path)
            if os.path.exists(certificate_path):
                os.remove(certificate_path)
        marathon.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class UploadCertificate(APIView):
    """上传完赛证书"""
    permission_classes = [IsAdminOrReadOnly]  # 允许游客读取

    def get_object(self, pk):
        """获取指定ID的马拉松赛事"""
        try:
            return Marathon.objects.get(pk=pk)
        except Marathon.DoesNotExist:
            return None

    def post(self, request, pk):
        """上传完赛证书"""
        marathon = self.get_object(pk)
        if marathon is None:
            return Response({'error': '马拉松赛事不存在'}, status=status.HTTP_404_NOT_FOUND)

        if 'certificate' not in request.FILES:
            return Response({'error': '未提供证书文件'}, status=status.HTTP_400_BAD_REQUEST)

        # 删除旧证书（如果存在）
        if marathon.certificate:
            old_certificate_path = os.path.join(settings.MEDIA_ROOT, marathon.certificate.path)
            if os.path.exists(old_certificate_path):
                os.remove(old_certificate_path)

        # 保存新证书
        marathon.certificate = request.FILES['certificate']
        marathon.save()

        serializer = MarathonSerializer(marathon, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


"""级联选择API视图"""
class ProvinceList(APIView):
    """获取所有省份列表"""
    permission_classes = [IsAdminOrReadOnly]

    def get(self, request):
        """获取所有省份列表"""
        try:
            provinces = Province.objects.all().order_by('id')
            province_list = [{'id': province.id, 'name': province.name} for province in provinces]
            return Response(province_list)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CityListByProvince(APIView):
    """根据省份获取城市列表"""
    permission_classes = [IsAdminOrReadOnly]

    def get(self, request):
        """获取指定省份下的城市列表"""
        province_id = request.GET.get('province')
        if not province_id:
            return Response({'error': '缺少省份ID'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            cities = City.objects.filter(province_id=province_id)
            city_list = [{'id': city.id, 'name': city.name} for city in cities]
            return Response(city_list)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class DistrictListByCity(APIView):
    """根据城市获取区县列表"""
    permission_classes = [IsAdminOrReadOnly]

    def get(self, request):
        """获取指定城市下的区县列表"""
        city_id = request.GET.get('city')
        if not city_id:
            return Response({'error': '缺少城市ID'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            districts = District.objects.filter(city_id=city_id)
            district_list = [{'id': district.id, 'name': district.name} for district in districts]
            return Response(district_list)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


"""马拉松报名赛事视图"""
class MarathonRegistrationListView(APIView):
    """马拉松报名赛事列表视图"""
    permission_classes = [IsAdminOrReadOnly]
    
    # 暂时禁用缓存以便调试
    # @method_decorator(cache_page(settings.CACHE_TIMEOUT['MEDIUM']))  # 缓存30分钟
    def get(self, request):
        """获取所有报名赛事"""
        registrations = MarathonRegistration.objects.all()
        # 使用精简序列化器减少数据传输量
        serializer = MarathonRegistrationListSerializer(registrations, many=True)
        return Response(serializer.data)

    def post(self, request):
        """添加新的报名赛事"""
        serializer = MarathonRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MarathonRegistrationDetail(APIView):
    """获取单个报名赛事详情"""
    permission_classes = [IsAdminOrReadOnly]

    def get_object(self, pk):
        """获取指定ID的报名赛事"""
        try:
            return MarathonRegistration.objects.get(pk=pk)
        except MarathonRegistration.DoesNotExist:
            return None

    def get(self, request, pk):
        """获取单个报名赛事详情"""
        registration = self.get_object(pk)
        if registration is None:
            return Response({'error': '报名赛事不存在'}, status=status.HTTP_404_NOT_FOUND)
        serializer = MarathonRegistrationSerializer(registration)
        return Response(serializer.data)

    def put(self, request, pk):
        """更新报名赛事"""
        registration = self.get_object(pk)
        if registration is None:
            return Response({'error': '报名赛事不存在'}, status=status.HTTP_404_NOT_FOUND)
        serializer = MarathonRegistrationSerializer(registration, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        """删除报名赛事"""
        registration = self.get_object(pk)
        if registration is None:
            return Response({'error': '报名赛事不存在'}, status=status.HTTP_404_NOT_FOUND)
        registration.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

