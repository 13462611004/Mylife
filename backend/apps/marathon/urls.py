"""马拉松应用的URL配置"""
from django.urls import path
from . import views

urlpatterns = [
    path('', views.MarathonListView.as_view(), name='marathon-list'),  # 获取所有马拉松赛事
    path('<int:pk>/', views.MarathonDetail.as_view(), name='marathon-detail'),  # 获取单个马拉松赛事详情
    path('<int:pk>/upload-certificate/', views.UploadCertificate.as_view(), name='upload-certificate'),  # 上传完赛证书
    # 级联选择API
    path('province/', views.ProvinceList.as_view(), name='province-list'),  # 获取所有省份列表
    path('city/', views.CityListByProvince.as_view(), name='city-list'),  # 根据省份获取城市列表
    path('district/', views.DistrictListByCity.as_view(), name='district-list'),  # 根据城市获取区县列表
    # 报名赛事API
    path('registration/', views.MarathonRegistrationListView.as_view(), name='registration-list'),  # 获取所有报名赛事
    path('registration/<int:pk>/', views.MarathonRegistrationDetail.as_view(), name='registration-detail'),  # 获取单个报名赛事详情
]
