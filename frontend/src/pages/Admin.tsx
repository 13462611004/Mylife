import React, { useState, useEffect, useRef } from 'react';
import { Card, Table, Button, Form, Input, DatePicker, Select, Upload, Modal, message, Space, Row, Col, Tabs, Tag, Checkbox, Popconfirm, Slider } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, EyeOutlined, LockOutlined, SettingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/axios';
import { MarathonEvent, MarathonRegistration, Post, AdminSetting } from '../services/types';
import dayjs from 'dayjs';
import Navigation from '../components/Common/Navigation';
import '../styles/Admin.css';

const { TextArea } = Input;
const { Option } = Select;
const { Dragger } = Upload;

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [marathons, setMarathons] = useState<MarathonEvent[]>([]);
  const [registrations, setRegistrations] = useState<MarathonRegistration[]>([]);
  const [form] = Form.useForm();
  const [registrationForm] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [registrationModalVisible, setRegistrationModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isEditRegistrationMode, setIsEditRegistrationMode] = useState(false);
  const [currentMarathon, setCurrentMarathon] = useState<MarathonEvent | null>(null);
  const [currentRegistration, setCurrentRegistration] = useState<MarathonRegistration | null>(null);
  const [certificateModalVisible, setCertificateModalVisible] = useState(false);
  const [currentCertificate, setCurrentCertificate] = useState<string | null>(null);
  const [currentEventName, setCurrentEventName] = useState('');
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [cities, setCities] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [registrationCities, setRegistrationCities] = useState<any[]>([]);
  const [registrationDistricts, setRegistrationDistricts] = useState<any[]>([]);
  const [provinces, setProvinces] = useState<any[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [postForm] = Form.useForm();
  const [postModalVisible, setPostModalVisible] = useState(false);
  const [isEditPostMode, setIsEditPostMode] = useState(false);
  const [currentPost, setCurrentPost] = useState<Post | null>(null);
  const [postMediaFiles, setPostMediaFiles] = useState<File[]>([]);
  const [postMediaTypes, setPostMediaTypes] = useState<string[]>([]);
  const [postVideoFiles, setPostVideoFiles] = useState<File[]>([]);
  const [postSearchText, setPostSearchText] = useState<string>('');
  const [postStartDate, setPostStartDate] = useState<dayjs.Dayjs | null>(null);
  const [postEndDate, setPostEndDate] = useState<dayjs.Dayjs | null>(null);
  const [postStats, setPostStats] = useState<any>(null);
  // 修改密码相关状态
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [passwordForm] = Form.useForm();
  const [passwordLoading, setPasswordLoading] = useState(false);
  // 媒体资源管理相关状态
  const [adminSettings, setAdminSettings] = useState<AdminSetting | null>(null);
  const [carouselLoading, setCarouselLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  // 图片裁剪相关状态
  const [cropModalVisible, setCropModalVisible] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string>('');
  const [cropImageFile, setCropImageFile] = useState<File | null>(null);
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [imageScale, setImageScale] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin');
    if (!isAdmin) {
      message.error('请先登录');
      navigate('/admin/login');
      return;
    }
    // 先验证session是否有效，再加载数据
    const loadData = async () => {
      try {
        // 先尝试获取管理员设置来验证session
        await fetchAdminSettings();
        // 如果成功，再加载其他数据
        fetchMarathons();
        fetchRegistrations();
        fetchPosts();
        fetchPostStats();
        fetchProvinces();
      } catch (error: any) {
        // fetchAdminSettings内部已经处理了401错误并跳转
        // 如果是其他错误，继续加载其他数据
        if (error.response?.status !== 401) {
          fetchMarathons();
          fetchRegistrations();
          fetchPosts();
          fetchPostStats();
          fetchProvinces();
        }
      }
    };
    loadData();
  }, []);

  const fetchProvinces = async () => {
    try {
      const raw = await apiClient.get('/api/marathon/province/');
      const data = Array.isArray(raw) ? raw : [];
      setProvinces(data);
    } catch (error) {
      message.error('获取省份数据失败');
    }
  };

  const fetchCities = async (provinceId: number) => {
    try {
      const raw = await apiClient.get(`/api/marathon/city/?province=${provinceId}`);
      const data = Array.isArray(raw) ? raw : [];
      setCities(data);
      setDistricts([]);
    } catch (error) {
      message.error('获取城市数据失败');
    }
  };

  const fetchDistricts = async (cityId: number) => {
    try {
      const raw = await apiClient.get(`/api/marathon/district/?city=${cityId}`);
      const data = Array.isArray(raw) ? raw : [];
      setDistricts(data);
    } catch (error) {
      message.error('获取区县数据失败');
    }
  };

  const fetchRegistrationCities = async (provinceId: number) => {
    try {
      const raw = await apiClient.get(`/api/marathon/city/?province=${provinceId}`);
      const data = Array.isArray(raw) ? raw : [];
      setRegistrationCities(data);
      setRegistrationDistricts([]);
    } catch (error) {
      message.error('获取城市数据失败');
    }
  };

  const fetchRegistrationDistricts = async (cityId: number) => {
    try {
      const raw = await apiClient.get(`/api/marathon/district/?city=${cityId}`);
      const data = Array.isArray(raw) ? raw : [];
      setRegistrationDistricts(data);
    } catch (error) {
      message.error('获取区县数据失败');
    }
  };

  const fetchMarathons = async () => {
    try {
      const response = await apiClient.get('/api/marathon/');
      setMarathons(Array.isArray(response) ? response : []);
    } catch (error) {
      message.error('获取赛事数据失败');
    }
  };

  const fetchRegistrations = async () => {
    try {
      const response = await apiClient.get('/api/marathon/registration/');
      setRegistrations(Array.isArray(response) ? response : []);
    } catch (error) {
      message.error('获取报名赛事数据失败');
    }
  };

  const fetchPosts = async () => {
    try {
      const params: any = {};
      if (postSearchText) {
        params.search = postSearchText;
      }
      if (postStartDate) {
        params.start_date = postStartDate.format('YYYY-MM-DD');
      }
      if (postEndDate) {
        params.end_date = postEndDate.format('YYYY-MM-DD');
      }
      const raw = await apiClient.get('/api/moments/posts/', { params });
      const list = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.results)
          ? raw.results
          : [];
      setPosts(list);
    } catch (error) {
      message.error('获取朋友圈数据失败');
    }
  };

  const fetchPostStats = async () => {
    try {
      const response = await apiClient.get('/api/moments/posts/stats/');
      setPostStats(response);
    } catch (error) {
      message.error('获取朋友圈统计数据失败');
    }
  };

  // 处理朋友圈搜索
  const handlePostSearch = () => {
    fetchPosts();
  };

  // 打开添加朋友圈模态框
  const handleAddPost = () => {
    setIsEditPostMode(false);
    setCurrentPost(null);
    postForm.resetFields();
    setPostMediaFiles([]);
    setPostMediaTypes([]);
    setPostModalVisible(true);
  };

  // 打开编辑朋友圈模态框
  const handleEditPost = (record: Post) => {
    setIsEditPostMode(true);
    setCurrentPost(record);
    postForm.setFieldsValue({
      content: record.content,
      is_pinned: record.is_pinned,
      tags: record.tags,
    });
    setPostMediaFiles([]);
    setPostMediaTypes([]);
    setPostModalVisible(true);
  };

  // 删除朋友圈
  const handleDeletePost = async (id: number) => {
    try {
      await apiClient.delete(`/api/moments/posts/${id}/`);
      message.success('朋友圈删除成功');
      fetchPosts();
      fetchPostStats();
    } catch (error) {
      message.error('朋友圈删除失败');
    }
  };

  // 提交朋友圈表单
  const handlePostSubmit = async (values: any) => {
    setLoading(true);
    try {
      if (isEditPostMode && currentPost) {
        // 更新模式
        const formData = new FormData();
        formData.append('content', values.content || '');
        formData.append('is_pinned', values.is_pinned ? 'true' : 'false');
        formData.append('tags', values.tags || '');

        await apiClient.put(`/api/moments/posts/${currentPost.id}/`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        message.success('朋友圈更新成功');
      } else {
        // 创建模式
        const formData = new FormData();
        formData.append('content', values.content || '');
        formData.append('is_pinned', values.is_pinned ? 'true' : 'false');
        formData.append('tags', values.tags || '');

        // 添加媒体文件和类型
        if (postMediaFiles.length > 0) {
          postMediaFiles.forEach((file, index) => {
            formData.append('media_files', file);
            formData.append('media_types', postMediaTypes[index] || 'image');
          });
        }

        await apiClient.post('/api/moments/posts/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        message.success('朋友圈添加成功');
      }
      setPostModalVisible(false);
      fetchPosts();
      fetchPostStats();
    } catch (error: any) {
      console.error('朋友圈提交错误:', error);
      const errorMsg = error.response?.data || error.message || '未知错误';
      message.error(isEditPostMode ? `朋友圈更新失败: ${JSON.stringify(errorMsg)}` : `朋友圈添加失败: ${JSON.stringify(errorMsg)}`);
    } finally {
      setLoading(false);
    }
  };

  // ========== 马拉松赛事管理功能 ==========
  const handleAddMarathon = () => {
    setIsEditMode(false);
    setCurrentMarathon(null);
    form.resetFields();
    setCities([]);
    setDistricts([]);
    setCertificateFile(null);
    setModalVisible(true);
  };

  const handleEditMarathon = async (record: MarathonEvent) => {
    setIsEditMode(true);
    setCurrentMarathon(record);
    setCertificateFile(null);
    setCities([]);
    setDistricts([]);
    
    // 先初始化表单，设置非级联字段
    form.setFieldsValue({
      event_name: record.event_name,
      event_date: dayjs(record.event_date),
      location: record.location,
      event_type: record.event_type,
      finish_time: record.finish_time,
      pace: record.pace,
      description: record.description,
      event_log: record.event_log,
      province: undefined,
      city: undefined,
      district: undefined,
    });
    
    // 如果有省份，先加载城市列表
    if (record.province) {
      const selectedProvince = provinces.find((p: any) => p.name === record.province);
      if (selectedProvince) {
        // 1. 加载城市列表
        await fetchCities(selectedProvince.id);
        
        // 2. 城市列表加载完成后，设置省份值
        form.setFieldsValue({ province: record.province });
        
        // 3. 如果有城市，加载区县列表
        if (record.city) {
          // 从已加载的城市列表中查找对应的城市对象
          const selectedCity = cities.find((c: any) => c.name === record.city);
          if (selectedCity) {
            // 4. 加载区县列表
            await fetchDistricts(selectedCity.id);
            
            // 5. 区县列表加载完成后，设置城市和区县值
            form.setFieldsValue({
              city: record.city,
              district: record.district
            });
          }
        }
      }
    }
    
    // 显示表单
    setModalVisible(true);
  };

  const handleDeleteMarathon = async (id: number) => {
    try {
      await apiClient.delete(`/api/marathon/${id}/`);
      message.success('删除成功');
      fetchMarathons();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleMarathonSubmit = async (values: any) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('event_name', values.event_name);
      formData.append('event_date', values.event_date.format('YYYY-MM-DD'));
      formData.append('location', values.location);
      formData.append('province', values.province || '');
      formData.append('city', values.city || '');
      formData.append('district', values.district || '');
      formData.append('event_type', values.event_type);
      formData.append('finish_time', values.finish_time);
      formData.append('pace', values.pace);
      formData.append('description', values.description || '');
      formData.append('event_log', values.event_log || '');

      if (isEditMode && currentMarathon) {
        await apiClient.put(`/api/marathon/${currentMarathon.id}/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        message.success('更新成功');
        // 如果有新证书文件，上传证书
        if (certificateFile) {
          await handleUploadCertificate(currentMarathon.id);
        }
      } else {
        const response = await apiClient.post('/api/marathon/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        message.success('添加成功');
        // 如果有证书文件，上传证书
        if (certificateFile && response.id) {
          await handleUploadCertificate(response.id);
        }
      }
      setModalVisible(false);
      fetchMarathons();
    } catch (error: any) {
      console.error('提交错误:', error);
      const errorMsg = error.response?.data || error.message || '未知错误';
      message.error(`操作失败: ${JSON.stringify(errorMsg)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadCertificate = async (marathonId: number) => {
    if (!certificateFile) return;
    try {
      const formData = new FormData();
      formData.append('certificate', certificateFile);
      await apiClient.post(`/api/marathon/${marathonId}/upload-certificate/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      message.success('证书上传成功');
      fetchMarathons();
    } catch (error) {
      message.error('证书上传失败');
    }
  };

  const handleViewCertificate = (certificate: string, eventName: string) => {
    setCurrentCertificate(certificate);
    setCurrentEventName(eventName);
    setCertificateModalVisible(true);
  };

  const marathonColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '赛事名称',
      dataIndex: 'event_name',
      key: 'event_name',
      width: 200,
    },
    {
      title: '赛事日期',
      dataIndex: 'event_date',
      key: 'event_date',
      width: 120,
      render: (text: string) => dayjs(text).format('YYYY-MM-DD'),
    },
    {
      title: '地点',
      dataIndex: 'location',
      key: 'location',
      width: 150,
      ellipsis: true,
    },
    {
      title: '省份',
      dataIndex: 'province',
      key: 'province',
      width: 100,
    },
    {
      title: '城市',
      dataIndex: 'city',
      key: 'city',
      width: 100,
    },
    {
      title: '类型',
      dataIndex: 'event_type',
      key: 'event_type',
      width: 100,
      render: (type: string) => {
        const typeMap: { [key: string]: string } = {
          '5km': '5KM',
          '10km': '10KM',
          '15km': '15KM',
          'half': '半程',
          'full': '全程',
        };
        return typeMap[type] || type;
      },
    },
    {
      title: '完赛时间',
      dataIndex: 'finish_time',
      key: 'finish_time',
      width: 120,
    },
    {
      title: '配速',
      dataIndex: 'pace',
      key: 'pace',
      width: 100,
    },
    {
      title: '证书',
      key: 'certificate',
      width: 100,
      render: (_: any, record: MarathonEvent) => (
        record.certificate ? (
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewCertificate(record.certificate!, record.event_name)}
          >
            查看
          </Button>
        ) : (
          <span style={{ color: '#999' }}>无</span>
        )
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: any, record: MarathonEvent) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEditMarathon(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这条记录吗？"
            onConfirm={() => handleDeleteMarathon(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // ========== 报名赛事管理功能 ==========
  const handleAddRegistration = () => {
    setIsEditRegistrationMode(false);
    setCurrentRegistration(null);
    registrationForm.resetFields();
    setRegistrationCities([]);
    setRegistrationDistricts([]);
    setRegistrationModalVisible(true);
  };

  const handleEditRegistration = async (record: MarathonRegistration) => {
    setIsEditRegistrationMode(true);
    setCurrentRegistration(record);
    setRegistrationCities([]);
    setRegistrationDistricts([]);
    
    // 如果有省份，先加载城市列表
    if (record.province) {
      const selectedProvince = provinces.find((p: any) => p.name === record.province);
      if (selectedProvince) {
        await fetchRegistrationCities(selectedProvince.id);
        // 等待城市加载完成后再加载区县
        setTimeout(async () => {
          if (record.city) {
            const cityList = await apiClient.get(`/api/marathon/city/?province=${selectedProvince.id}`);
            const selectedCity = Array.isArray(cityList) ? cityList.find((c: any) => c.name === record.city) : null;
            if (selectedCity) {
              await fetchRegistrationDistricts(selectedCity.id);
            }
          }
        }, 100);
      }
    }
    
    // 设置表单值
    registrationForm.setFieldsValue({
      event_name: record.event_name,
      event_date: dayjs(record.event_date),
      location: record.location,
      province: record.province,
      city: record.city,
      district: record.district,
      event_type: record.event_type,
      registration_status: record.registration_status,
      registration_date: record.registration_date ? dayjs(record.registration_date) : null,
      registration_fee: record.registration_fee,
      draw_date: record.draw_date ? dayjs(record.draw_date) : null,
      transport: record.transport,
      accommodation: record.accommodation,
      notes: record.notes,
    });
    
    setRegistrationModalVisible(true);
  };

  const handleDeleteRegistration = async (id: number) => {
    try {
      await apiClient.delete(`/api/marathon/registration/${id}/`);
      message.success('删除成功');
      fetchRegistrations();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleRegistrationSubmit = async (values: any) => {
    setLoading(true);
    try {
      // 处理报名费用：如果是空字符串或undefined，转换为null；否则转换为数字
      let registrationFee = null;
      if (values.registration_fee !== undefined && values.registration_fee !== null && values.registration_fee !== '') {
        const fee = parseFloat(values.registration_fee);
        if (!isNaN(fee)) {
          registrationFee = fee;
        }
      }
      
      const data = {
        event_name: values.event_name,
        event_date: values.event_date.format('YYYY-MM-DD'),
        location: values.location || '',
        province: values.province || '',
        city: values.city || '',
        district: values.district || '',
        event_type: values.event_type,
        registration_status: values.registration_status,
        registration_date: values.registration_date ? values.registration_date.format('YYYY-MM-DD') : null,
        registration_fee: registrationFee,
        draw_date: values.draw_date ? values.draw_date.format('YYYY-MM-DD') : null,
        transport: values.transport || null,
        accommodation: values.accommodation || null,
        notes: values.notes || '',
      };

      if (isEditRegistrationMode && currentRegistration) {
        await apiClient.put(`/api/marathon/registration/${currentRegistration.id}/`, data);
        message.success('更新成功');
      } else {
        await apiClient.post('/api/marathon/registration/', data);
        message.success('添加成功');
      }
      setRegistrationModalVisible(false);
      fetchRegistrations();
    } catch (error: any) {
      console.error('提交错误:', error);
      let errorMsg = '未知错误';
      if (error.response?.data) {
        // 如果是对象，尝试提取错误信息
        if (typeof error.response.data === 'object') {
          const errors = [];
          for (const [key, value] of Object.entries(error.response.data)) {
            if (Array.isArray(value)) {
              errors.push(`${key}: ${value.join(', ')}`);
            } else {
              errors.push(`${key}: ${value}`);
            }
          }
          errorMsg = errors.join('; ') || JSON.stringify(error.response.data);
        } else {
          errorMsg = error.response.data;
        }
      } else if (error.message) {
        errorMsg = error.message;
      }
      message.error(`操作失败: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const registrationColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '赛事名称',
      dataIndex: 'event_name',
      key: 'event_name',
      width: 200,
    },
    {
      title: '赛事日期',
      dataIndex: 'event_date',
      key: 'event_date',
      width: 120,
      defaultSortOrder: 'ascend' as const,
      sorter: (a: any, b: any) => {
        const dateA = dayjs(a.event_date);
        const dateB = dayjs(b.event_date);
        // 升序：距离今天最近的日期（最早的未来日期）在上面
        return dateA.valueOf() - dateB.valueOf();
      },
      render: (text: string) => dayjs(text).format('YYYY-MM-DD'),
    },
    {
      title: '地点',
      dataIndex: 'location',
      key: 'location',
      width: 150,
      ellipsis: true,
    },
    {
      title: '省份',
      dataIndex: 'province',
      key: 'province',
      width: 100,
    },
    {
      title: '城市',
      dataIndex: 'city',
      key: 'city',
      width: 100,
    },
    {
      title: '类型',
      dataIndex: 'event_type',
      key: 'event_type',
      width: 100,
      render: (type: string) => {
        const typeMap: { [key: string]: string } = {
          '5km': '5KM',
          '10km': '10KM',
          '15km': '15KM',
          'half': '半程',
          'full': '全程',
        };
        return typeMap[type] || type;
      },
    },
    {
      title: '报名状态',
      dataIndex: 'registration_status',
      key: 'registration_status',
      width: 120,
      render: (status: string) => {
        const statusMap: { [key: string]: { text: string; color: string } } = {
          'preparing': { text: '准备报名', color: 'default' },
          'pending': { text: '待抽签', color: 'processing' },
          'won': { text: '已中签', color: 'success' },
          'lost': { text: '未中签', color: 'error' },
          'abandoned': { text: '已弃赛', color: 'warning' },
          'waitlist': { text: '候补中', color: 'orange' },
        };
        const statusInfo = statusMap[status] || { text: status, color: 'default' };
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
      },
    },
    {
      title: '报名费用',
      dataIndex: 'registration_fee',
      key: 'registration_fee',
      width: 100,
      render: (fee: number | string | null) => {
        if (fee === null || fee === undefined || fee === '') {
          return '-';
        }
        // 处理 Decimal 类型（可能是字符串格式）
        const feeNum = typeof fee === 'string' ? parseFloat(fee) : fee;
        return !isNaN(feeNum) ? `¥${feeNum.toFixed(2)}` : '-';
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: any, record: MarathonRegistration) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEditRegistration(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这条记录吗？"
            onConfirm={() => handleDeleteRegistration(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // ========== 媒体资源管理功能 ==========
  const fetchAdminSettings = async () => {
    try {
      const response = await apiClient.get('/api/admin/settings/');
      setAdminSettings(response);
    } catch (error: any) {
      console.error('获取管理员设置失败:', error);
      // 如果是401错误，说明session过期，需要重新登录
      if (error.response?.status === 401) {
        message.warning('登录已过期，请重新登录');
        localStorage.removeItem('isAdmin');
        navigate('/admin/login');
      }
    }
  };

  // 打开裁剪模态框
  const openCropModal = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      setCropImageSrc(imageUrl);
      setCropImageFile(file);
      setCropModalVisible(true);
      // 默认裁剪区域为图片中心，宽高比为4:3（轮播图常用比例）
      setTimeout(() => {
        if (imageRef.current && containerRef.current) {
          const img = imageRef.current;
          const container = containerRef.current;
          const containerWidth = container.clientWidth;
          const containerHeight = container.clientHeight;
          const imgAspectRatio = img.naturalWidth / img.naturalHeight;
          const cropAspectRatio = 4 / 3; // 轮播图比例
          
          let cropWidth = Math.min(containerWidth * 0.8, img.naturalWidth * imageScale);
          let cropHeight = cropWidth / cropAspectRatio;
          
          if (cropHeight > Math.min(containerHeight * 0.8, img.naturalHeight * imageScale)) {
            cropHeight = Math.min(containerHeight * 0.8, img.naturalHeight * imageScale);
            cropWidth = cropHeight * cropAspectRatio;
          }
          
          setCropArea({
            x: (containerWidth - cropWidth) / 2,
            y: (containerHeight - cropHeight) / 2,
            width: cropWidth,
            height: cropHeight
          });
        }
      }, 100);
    };
    reader.readAsDataURL(file);
  };

  // 处理图片上传前的事件（打开裁剪框）
  const handleBeforeUploadCarousel = (file: File) => {
    openCropModal(file);
    return false; // 阻止自动上传
  };

  // 裁剪图片并上传
  const handleCropAndUpload = async () => {
    if (!cropImageFile || !imageRef.current || !containerRef.current) {
      message.error('缺少必要的信息，请重新上传图片');
      return;
    }

    setCarouselLoading(true);
    try {
      const img = imageRef.current;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        message.error('无法创建画布');
        setCarouselLoading(false);
        return;
      }

      // 验证图片是否已加载完成
      if (!img.complete || img.naturalWidth === 0 || img.naturalHeight === 0) {
        message.error('图片尚未加载完成，请稍候再试');
        setCarouselLoading(false);
        return;
      }

      // 验证裁剪区域是否有效
      if (cropArea.width <= 0 || cropArea.height <= 0) {
        console.error('裁剪区域无效:', cropArea);
        message.error('裁剪区域无效，请重新选择区域');
        setCarouselLoading(false);
        return;
      }

      // 计算实际裁剪区域（相对于原图）
      // 注意：使用imageSize（已缩放的显示尺寸）来计算比例
      const displayWidth = imageSize.width > 0 ? imageSize.width : (img.width || img.clientWidth);
      const displayHeight = imageSize.height > 0 ? imageSize.height : (img.height || img.clientHeight);
      
      if (displayWidth <= 0 || displayHeight <= 0) {
        console.error('显示尺寸无效:', { displayWidth, displayHeight, imageSize, imgWidth: img.width, imgHeight: img.height });
        message.error('图片尺寸无效，请重新上传');
        setCarouselLoading(false);
        return;
      }
      
      const scaleX = img.naturalWidth / displayWidth;
      const scaleY = img.naturalHeight / displayHeight;
      
      // 调整裁剪区域坐标（考虑图片在容器中的位置）
      const relativeX = Math.max(0, (cropArea.x - imagePosition.x) * scaleX);
      const relativeY = Math.max(0, (cropArea.y - imagePosition.y) * scaleY);
      const relativeWidth = Math.min(cropArea.width * scaleX, img.naturalWidth - relativeX);
      const relativeHeight = Math.min(cropArea.height * scaleY, img.naturalHeight - relativeY);

      // 验证裁剪区域是否在图片范围内
      if (relativeWidth <= 0 || relativeHeight <= 0 || relativeX >= img.naturalWidth || relativeY >= img.naturalHeight) {
        console.error('裁剪区域超出范围:', {
          relativeX, relativeY, relativeWidth, relativeHeight,
          naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight
        });
        message.error('裁剪区域超出图片范围，请重新选择');
        setCarouselLoading(false);
        return;
      }

      // 设置画布尺寸为裁剪区域
      canvas.width = relativeWidth;
      canvas.height = relativeHeight;

      // 绘制裁剪后的图片
      ctx.drawImage(
        img,
        relativeX, relativeY, relativeWidth, relativeHeight,
        0, 0, relativeWidth, relativeHeight
      );

      // 将画布转换为Blob
      canvas.toBlob(async (blob) => {
        if (!blob) {
          message.error('裁剪失败');
          setCarouselLoading(false);
          return;
        }

        // 验证blob是否有效
        if (blob.size === 0) {
          message.error('裁剪后的图片为空');
          setCarouselLoading(false);
          return;
        }

        // 创建File对象
        const croppedFile = new File([blob], cropImageFile.name || 'carousel.jpg', { 
          type: cropImageFile.type || 'image/jpeg' 
        });

        // 验证文件对象
        if (!croppedFile || croppedFile.size === 0) {
          message.error('文件对象无效');
          setCarouselLoading(false);
          return;
        }

        // 上传裁剪后的图片和原始图片
        const formData = new FormData();
        formData.append('image', croppedFile);
        // 同时上传原始图片，用于预览时显示完整图片
        if (cropImageFile) {
          formData.append('original', cropImageFile);
        }
        
        // 验证FormData
        if (!formData.has('image')) {
          message.error('FormData添加文件失败');
          setCarouselLoading(false);
          return;
        }
        
        // 验证FormData和文件
        console.log('准备上传文件:', {
          fileName: croppedFile.name,
          fileSize: croppedFile.size,
          fileType: croppedFile.type,
          formDataHasImage: formData.has('image'),
          formDataHasOriginal: formData.has('original')
        });
        
        // 注意：不要手动设置 Content-Type，让浏览器自动设置（包含boundary）
        // 这样session cookie才能正确传递
        try {
          const response = await apiClient.post('/api/admin/upload-carousel/', formData, {
            headers: {
              // 不设置Content-Type，让浏览器自动设置multipart/form-data; boundary=...
            },
          });
          
          message.success('轮播图上传成功');
          setCropModalVisible(false);
          setCropImageSrc('');
          setCropImageFile(null);
          await fetchAdminSettings();
          setCarouselLoading(false);
        } catch (uploadError: any) {
          console.error('上传请求错误:', uploadError);
          console.error('错误响应:', uploadError.response?.data);
          const errorMsg = uploadError.response?.data?.error || uploadError.response?.data?.message || uploadError.message || '未知错误';
          message.error(`上传失败: ${errorMsg}`);
          setCarouselLoading(false);
          throw uploadError; // 重新抛出以便外层catch捕获
        }
      }, cropImageFile.type, 0.95);
    } catch (error: any) {
      console.error('裁剪上传过程错误:', error);
      const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message || '未知错误';
      message.error(`上传失败: ${errorMsg}`);
      setCarouselLoading(false);
    }
  };

  // 处理图片加载完成
  const handleImageLoad = () => {
    if (imageRef.current && containerRef.current) {
      const img = imageRef.current;
      const container = containerRef.current;
      const imgNaturalWidth = img.naturalWidth;
      const imgNaturalHeight = img.naturalHeight;
      const imgAspectRatio = imgNaturalWidth / imgNaturalHeight;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      const containerAspectRatio = containerWidth / containerHeight;
      
      // 计算初始缩放比例，使图片完全显示在容器中
      let initialScale = 1;
      if (imgAspectRatio > containerAspectRatio) {
        // 图片更宽，以宽度为准
        initialScale = containerWidth / imgNaturalWidth;
      } else {
        // 图片更高，以高度为准
        initialScale = containerHeight / imgNaturalHeight;
      }
      
      setImageScale(initialScale);
      
      const scaledWidth = imgNaturalWidth * initialScale;
      const scaledHeight = imgNaturalHeight * initialScale;
      
      // 存储图片尺寸
      setImageSize({ width: scaledWidth, height: scaledHeight });
      
      // 居中图片
      setImagePosition({
        x: (containerWidth - scaledWidth) / 2,
        y: (containerHeight - scaledHeight) / 2
      });

      // 初始化裁剪区域（4:3比例）
      const cropAspectRatio = 4 / 3;
      const cropWidth = Math.min(containerWidth * 0.8, scaledWidth);
      const cropHeight = cropWidth / cropAspectRatio;
      
      if (cropHeight > containerHeight * 0.8) {
        const adjustedCropHeight = containerHeight * 0.8;
        const adjustedCropWidth = adjustedCropHeight * cropAspectRatio;
        setCropArea({
          x: (containerWidth - adjustedCropWidth) / 2,
          y: (containerHeight - adjustedCropHeight) / 2,
          width: adjustedCropWidth,
          height: adjustedCropHeight
        });
      } else {
        setCropArea({
          x: (containerWidth - cropWidth) / 2,
          y: (containerHeight - cropHeight) / 2,
          width: cropWidth,
          height: cropHeight
        });
      }
    }
  };

  // 处理鼠标拖动（区分拖动裁剪框和拖动图片）
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current || !imageRef.current) return;
    
    const target = e.target as HTMLElement;
    const container = containerRef.current;
    const img = imageRef.current;
    
    // 检查点击的是图片还是裁剪框
    if (target === img || img.contains(target)) {
      // 点击的是图片，拖动图片
      e.stopPropagation();
      setIsDraggingImage(true);
      setDragStart({ 
        x: e.clientX - imagePosition.x, 
        y: e.clientY - imagePosition.y 
      });
    } else {
      // 点击的是裁剪框区域，拖动裁剪框
      setIsDragging(true);
      setDragStart({ 
        x: e.clientX - cropArea.x, 
        y: e.clientY - cropArea.y 
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current || !imageRef.current) return;
    const container = containerRef.current;
    const img = imageRef.current;
    
    if (isDraggingImage) {
      // 拖动图片
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      
      // 限制图片不能移出容器太远（允许部分移出，但不能完全移出）
      const maxX = container.clientWidth - imageSize.width;
      const minX = 0;
      const maxY = container.clientHeight - imageSize.height;
      const minY = 0;
      
      setImagePosition({
        x: Math.max(minX, Math.min(newX, maxX)),
        y: Math.max(minY, Math.min(newY, maxY))
      });
    } else if (isDragging) {
      // 拖动裁剪框
      const newX = Math.max(0, Math.min(e.clientX - dragStart.x, container.clientWidth - cropArea.width));
      const newY = Math.max(0, Math.min(e.clientY - dragStart.y, container.clientHeight - cropArea.height));
      setCropArea(prev => ({ ...prev, x: newX, y: newY }));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsDraggingImage(false);
  };

  const handleDeleteCarousel = async (index: number) => {
    if (!adminSettings) return;
    
    const carouselImages = adminSettings.carousel_images || [];
    if (Array.isArray(carouselImages)) {
      // 创建新数组，避免直接修改原数组
      const newCarouselImages = [...carouselImages];
      newCarouselImages.splice(index, 1);
      
      try {
        const response = await apiClient.put('/api/admin/settings/', {
          carousel_images: newCarouselImages,
        });
        message.success('删除成功');
        // 更新本地状态
        setAdminSettings(response);
        // 同时重新获取以确保数据同步
        await fetchAdminSettings();
      } catch (error: any) {
        console.error('删除轮播图错误:', error);
        const errorMsg = error.response?.data?.error || error.message || '未知错误';
        message.error(`删除失败: ${errorMsg}`);
      }
    }
  };

  const handleUploadAvatar = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      await apiClient.put('/api/admin/settings/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      message.success('头像上传成功');
      await fetchAdminSettings();
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || error.message || '未知错误';
      message.error(`上传失败: ${errorMsg}`);
    }
  };

  // ========== 修改密码功能 ==========
  const handleChangePassword = async (values: { oldPassword: string; newPassword: string; confirmPassword: string }) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('两次输入的密码不一致');
      return;
    }
    
    if (values.newPassword.length < 6) {
      message.error('新密码长度至少6位');
      return;
    }

    setPasswordLoading(true);
    try {
      // 先验证旧密码
      const loginResponse = await apiClient.post('/api/admin/login/', {
        password: values.oldPassword,
      });
      
      if (loginResponse.message === '登录成功') {
        // 更新密码
        await apiClient.put('/api/admin/settings/', {
          admin_password: values.newPassword,
        });
        message.success('密码修改成功，请使用新密码登录');
        setPasswordModalVisible(false);
        passwordForm.resetFields();
        // 登出
        handleLogout();
      } else {
        message.error('旧密码错误');
      }
    } catch (error: any) {
      console.error('修改密码错误:', error);
      const errorMsg = error.response?.data?.error || error.message || '未知错误';
      message.error(`修改密码失败: ${errorMsg}`);
    } finally {
      setPasswordLoading(false);
    }
  };

  // ========== 登出功能 ==========
  const handleLogout = async () => {
    try {
      await apiClient.post('/api/admin/logout/');
      localStorage.removeItem('isAdmin');
      message.success('已退出登录');
      navigate('/admin/login');
    } catch (error) {
      // 即使API调用失败，也清除本地状态
      localStorage.removeItem('isAdmin');
      navigate('/admin/login');
    }
  };

  // 朋友圈表格列
  const postColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '内容',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
      render: (text: string) => text || '（无文字）',
    },
    {
      title: '置顶',
      dataIndex: 'is_pinned',
      key: 'is_pinned',
      width: 80,
      render: (isPinned: boolean) => isPinned ? <Tag color="red">置顶</Tag> : '-',
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      ellipsis: true,
    },
    {
      title: '媒体数量',
      dataIndex: 'media_count',
      key: 'media_count',
      width: 100,
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (text: string) => dayjs(text).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: Post) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEditPost(record)}>
            编辑
          </Button>
          <Button 
            type="link" 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => handleDeletePost(record.id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="admin-container">
      <Navigation />
      <Card className="admin-main-card">
        <div className="admin-header">
                  <h2 className="admin-title" style={{ 
                    fontSize: 20,
                    fontWeight: 500,
                    color: 'var(--about-accent)',
                    paddingLeft: 8,
                    borderLeft: '3px solid var(--about-secondary)',
                    margin: 0
                  }}>管理后台</h2>
          <Button 
            icon={<SettingOutlined />} 
            onClick={() => setPasswordModalVisible(true)}
            className="admin-settings-btn"
          >
            修改密码
          </Button>
        </div>
        <Tabs defaultActiveKey="1">
          <Tabs.TabPane tab="马拉松赛事" key="1">
            <div style={{ marginBottom: 16 }}>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAddMarathon}>
                添加赛事
              </Button>
            </div>
            <Table
              columns={marathonColumns}
              dataSource={marathons}
              rowKey="id"
              loading={loading}
              scroll={{ x: 1400 }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
              }}
            />
          </Tabs.TabPane>
          <Tabs.TabPane tab="报名赛事" key="2">
            <div style={{ marginBottom: 16 }}>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAddRegistration}>
                添加报名
              </Button>
            </div>
            <Table
              columns={registrationColumns}
              dataSource={registrations}
              rowKey="id"
              loading={loading}
              scroll={{ x: 1300 }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
              }}
            />
          </Tabs.TabPane>
          <Tabs.TabPane tab="朋友圈" key="3">
            <div className="admin-moments-toolbar" style={{ marginBottom: 16 }}>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAddPost}>
                添加朋友圈
              </Button>
              <Input.Search
                placeholder="搜索内容或标签"
                style={{ width: 300 }}
                onSearch={handlePostSearch}
                onChange={(e) => setPostSearchText(e.target.value)}
                allowClear
              />
              <DatePicker
                placeholder="开始日期"
                value={postStartDate}
                onChange={(date) => {
                  setPostStartDate(date);
                  if (date && postEndDate && date.isAfter(postEndDate)) {
                    message.warning('开始日期不能晚于结束日期');
                    return;
                  }
                  fetchPosts();
                }}
              />
              <DatePicker
                placeholder="结束日期"
                value={postEndDate}
                onChange={(date) => {
                  setPostEndDate(date);
                  if (date && postStartDate && date.isBefore(postStartDate)) {
                    message.warning('结束日期不能早于开始日期');
                    return;
                  }
                  fetchPosts();
                }}
              />
            </div>

            {postStats && (
              <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={6}>
                  <Card>
                    <div>总数: {postStats.total_count || 0}</div>
                  </Card>
                </Col>
                <Col span={6}>
                  <Card>
                    <div>置顶: {postStats.pinned_count || 0}</div>
                  </Card>
                </Col>
                <Col span={6}>
                  <Card>
                    <div>有媒体: {postStats.with_media_count || 0}</div>
                  </Card>
                </Col>
                <Col span={6}>
                  <Card>
                    <div>今日: {postStats.today_count || 0}</div>
                  </Card>
                </Col>
              </Row>
            )}

            <Table
              columns={postColumns}
              dataSource={posts}
              rowKey="id"
              loading={loading}
              scroll={{ x: 1200 }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
              }}
            />
          </Tabs.TabPane>
          <Tabs.TabPane tab="媒体资源管理" key="4">
            <Row gutter={[24, 24]}>
              {/* 轮播图管理 */}
              <Col span={24}>
                <Card title="首页轮播图管理" style={{ marginBottom: 24 }}>
                  <div style={{ marginBottom: 16 }}>
                    <Upload
                      accept="image/*"
                      beforeUpload={handleBeforeUploadCarousel}
                      showUploadList={false}
                    >
                      <Button icon={<UploadOutlined />} loading={carouselLoading} type="primary">
                        上传轮播图
                      </Button>
                    </Upload>
                  </div>
                  {adminSettings?.carousel_images && Array.isArray(adminSettings.carousel_images) && adminSettings.carousel_images.length > 0 ? (
                    <Row gutter={[16, 16]}>
                      {adminSettings.carousel_images.map((item: any, index: number) => {
                        const imageUrl = typeof item === 'string' ? item : item.url || item;
                        return (
                          <Col span={6} key={index}>
                            <Card
                              hoverable
                              cover={
                                <img
                                  alt={typeof item === 'object' && item.alt ? item.alt : `轮播图${index + 1}`}
                                  src={imageUrl}
                                  style={{ height: 150, objectFit: 'cover' }}
                                />
                              }
                              actions={[
                                <Popconfirm
                                  key="delete"
                                  title="确定删除这张轮播图吗？"
                                  onConfirm={() => handleDeleteCarousel(index)}
                                  okText="确定"
                                  cancelText="取消"
                                >
                                  <Button type="text" danger icon={<DeleteOutlined />}>
                                    删除
                                  </Button>
                                </Popconfirm>,
                              ]}
                            >
                              <Card.Meta
                                title={`轮播图 ${index + 1}`}
                                description={typeof item === 'object' && item.alt ? item.alt : '轮播图'}
                              />
                            </Card>
                          </Col>
                        );
                      })}
                    </Row>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                      暂无轮播图，请上传
                    </div>
                  )}
                </Card>
              </Col>

              {/* 头像管理 */}
              <Col span={24}>
                <Card title="用户头像管理">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div>
                      <Upload
                        accept="image/*"
                        beforeUpload={(file) => {
                          handleUploadAvatar(file);
                          return false; // 阻止自动上传
                        }}
                        showUploadList={false}
                      >
                        <Button icon={<UploadOutlined />} type="primary">
                          上传头像
                        </Button>
                      </Upload>
                    </div>
                    {adminSettings?.avatar && (
                      <div>
                        <img
                          src={adminSettings.avatar}
                          alt="用户头像"
                          style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover', border: '2px solid #E5E7EB' }}
                        />
                      </div>
                    )}
                  </Space>
                </Card>
              </Col>
            </Row>
          </Tabs.TabPane>
        </Tabs>
      </Card>

      {/* 朋友圈编辑/添加模态框 */}
      <Modal
        title={isEditPostMode ? '编辑朋友圈' : '添加朋友圈'}
        open={postModalVisible}
        onCancel={() => {
          setPostModalVisible(false);
          postForm.resetFields();
          setPostMediaFiles([]);
          setPostMediaTypes([]);
        }}
        footer={null}
        width={800}
      >
        <Form
          form={postForm}
          layout="vertical"
          onFinish={handlePostSubmit}
        >
          <Form.Item
            name="content"
            label="文字内容"
            rules={[
              { max: 200, message: '文字内容最多200个字' }
            ]}
          >
            <TextArea rows={3} placeholder="请输入文字内容（最多200个字）" />
          </Form.Item>

          <Form.Item
            name="is_pinned"
            label="是否置顶"
            valuePropName="checked"
          >
            <Checkbox>置顶</Checkbox>
          </Form.Item>

          <Form.Item
            name="tags"
            label="标签"
          >
            <Input placeholder="请输入标签，用逗号分隔，例如：生活,跑步,美食" />
          </Form.Item>

          <Form.Item label="媒体文件">
            <Upload
              listType="picture-card"
              fileList={postMediaFiles.map((file, index) => ({
                uid: `${index}`,
                name: file.name,
                status: 'done',
                url: URL.createObjectURL(file),
              }))}
              beforeUpload={(file) => {
                const fileType = file.type.toLowerCase();
                const fileName = file.name.toLowerCase();
                
                const isImage = fileType.startsWith('image/');
                const isVideo = fileType.startsWith('video/');
                
                if (!isImage && !isVideo) {
                  message.error('只能上传图片或视频文件！');
                  return false;
                }
                
                // 验证文件大小（最大50MB）
                const isLt50M = file.size / 1024 / 1024 < 50;
                if (!isLt50M) {
                  message.error('文件大小不能超过50MB！');
                  return false;
                }
                
                // 验证文件数量
                if (postMediaFiles.length >= 9) {
                  message.error('最多只能上传9个文件！');
                  return false;
                }
                
                // 验证视频数量
                const videoCount = postMediaTypes.filter(t => t === 'video').length;
                if (isVideo && videoCount >= 1) {
                  message.error('最多只能上传1个视频！');
                  return false;
                }
                
                // 添加文件到列表（根据文件类型标记：video或image）
                setPostMediaFiles([...postMediaFiles, file]);
                const mediaType = isVideo ? 'video' : 'image';
                setPostMediaTypes([...postMediaTypes, mediaType]);
                return false;
              }}
              onRemove={(file) => {
                const index = postMediaFiles.findIndex(f => f.name === file.name);
                if (index > -1) {
                  const newFiles = [...postMediaFiles];
                  const newTypes = [...postMediaTypes];
                  newFiles.splice(index, 1);
                  newTypes.splice(index, 1);
                  setPostMediaFiles(newFiles);
                  setPostMediaTypes(newTypes);
                }
              }}
            >
              {postMediaFiles.length < 9 && (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>上传</div>
                </div>
              )}
            </Upload>
            <div style={{ marginTop: 8, color: '#999' }}>
              最多上传9个文件（图片或Live图最多9张，视频最多1个），单个文件最大50MB
            </div>
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => {
                setPostModalVisible(false);
                postForm.resetFields();
                setPostMediaFiles([]);
                setPostMediaTypes([]);
                setPostVideoFiles([]);
              }}>取消</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {isEditPostMode ? '更新朋友圈' : '添加朋友圈'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 图片裁剪模态框 */}
      <Modal
        title="裁剪轮播图"
        open={cropModalVisible}
        onCancel={() => {
          setCropModalVisible(false);
          setCropImageSrc('');
          setCropImageFile(null);
        }}
        onOk={handleCropAndUpload}
        okText="确认上传"
        cancelText="取消"
        width={800}
        confirmLoading={carouselLoading}
        maskClosable={false}
      >
        <div
          ref={containerRef}
          style={{
            width: '100%',
            height: '500px',
            position: 'relative',
            overflow: 'hidden',
            backgroundColor: '#f5f5f5',
            borderRadius: 8,
            border: '1px solid #d9d9d9',
            cursor: isDragging || isDraggingImage ? 'grabbing' : 'default',
            touchAction: 'none'
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {cropImageSrc && (
            <img
              ref={imageRef}
              src={cropImageSrc}
              alt="裁剪预览"
              onLoad={handleImageLoad}
              style={{
                position: 'absolute',
                top: `${imagePosition.y}px`,
                left: `${imagePosition.x}px`,
                width: `${imageSize.width}px`,
                height: `${imageSize.height}px`,
                maxWidth: 'none',
                maxHeight: 'none',
                userSelect: 'none',
                cursor: isDraggingImage ? 'grabbing' : 'grab',
                pointerEvents: 'auto' // 允许图片接收鼠标事件
              }}
            />
          )}
          {/* 裁剪框 */}
          <div
            style={{
              position: 'absolute',
              left: `${cropArea.x}px`,
              top: `${cropArea.y}px`,
              width: `${cropArea.width}px`,
              height: `${cropArea.height}px`,
              border: '2px solid #1890ff',
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
              cursor: isDragging ? 'grabbing' : 'move',
              zIndex: 10
            }}
          >
            {/* 裁剪框四个角的控制点 */}
            <div
              style={{
                position: 'absolute',
                top: -4,
                left: -4,
                width: 8,
                height: 8,
                border: '2px solid #1890ff',
                backgroundColor: '#fff',
                borderRadius: '50%',
                cursor: 'nw-resize'
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: -4,
                right: -4,
                width: 8,
                height: 8,
                border: '2px solid #1890ff',
                backgroundColor: '#fff',
                borderRadius: '50%',
                cursor: 'ne-resize'
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: -4,
                left: -4,
                width: 8,
                height: 8,
                border: '2px solid #1890ff',
                backgroundColor: '#fff',
                borderRadius: '50%',
                cursor: 'sw-resize'
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: -4,
                right: -4,
                width: 8,
                height: 8,
                border: '2px solid #1890ff',
                backgroundColor: '#fff',
                borderRadius: '50%',
                cursor: 'se-resize'
              }}
            />
          </div>
        </div>
        <div style={{ marginTop: 16 }}>
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <div>
              <div style={{ marginBottom: 8 }}>
                <span>缩放：</span>
                <Slider
                  min={0.1}
                  max={2}
                  step={0.01}
                  value={imageScale}
                  onChange={(value) => {
                    if (imageRef.current && containerRef.current) {
                      const newScale = value;
                      const img = imageRef.current;
                      const container = containerRef.current;
                      const centerX = container.clientWidth / 2;
                      const centerY = container.clientHeight / 2;
                      
                      // 计算新的图片尺寸
                      const newWidth = img.naturalWidth * newScale;
                      const newHeight = img.naturalHeight * newScale;
                      setImageSize({ width: newWidth, height: newHeight });
                      
                      // 以中心点缩放
                      const scaleDiff = newScale / imageScale;
                      const newX = centerX - (centerX - imagePosition.x) * scaleDiff;
                      const newY = centerY - (centerY - imagePosition.y) * scaleDiff;
                      
                      setImageScale(newScale);
                      setImagePosition({ x: newX, y: newY });
                    }
                  }}
                  style={{ width: '200px', display: 'inline-block', marginLeft: 16 }}
                />
                <Button 
                  size="small" 
                  onClick={() => {
                    if (imageRef.current && containerRef.current) {
                      const img = imageRef.current;
                      const container = containerRef.current;
                      const containerWidth = container.clientWidth;
                      const containerHeight = container.clientHeight;
                      const imgAspectRatio = img.naturalWidth / img.naturalHeight;
                      const containerAspectRatio = containerWidth / containerHeight;
                      
                      let initialScale = 1;
                      if (imgAspectRatio > containerAspectRatio) {
                        initialScale = containerWidth / img.naturalWidth;
                      } else {
                        initialScale = containerHeight / img.naturalHeight;
                      }
                      
                      setImageScale(initialScale);
                      const scaledWidth = img.naturalWidth * initialScale;
                      const scaledHeight = img.naturalHeight * initialScale;
                      setImageSize({ width: scaledWidth, height: scaledHeight });
                      setImagePosition({
                        x: (containerWidth - scaledWidth) / 2,
                        y: (containerHeight - scaledHeight) / 2
                      });
                    }
                  }}
                  style={{ marginLeft: 8 }}
                >
                  重置
                </Button>
              </div>
            </div>
            <div>
              <div style={{ marginBottom: 8 }}>
                <span>水平位置：</span>
                <Slider
                  min={0}
                  max={100}
                  step={1}
                  value={(() => {
                    if (!containerRef.current || imageSize.width === 0) return 50;
                    const container = containerRef.current;
                    const containerWidth = container.clientWidth;
                    const imageWidth = imageSize.width;
                    
                    // 计算可移动范围
                    // 如果图片比容器大，允许负值（图片可以向左移出容器）
                    const minX = Math.min(0, containerWidth - imageWidth);
                    const maxX = Math.max(0, containerWidth - imageWidth);
                    const range = maxX - minX;
                    
                    if (range <= 0) return 50; // 如果无法移动，返回中间值
                    
                    // 将当前位置映射到0-100
                    const normalizedX = imagePosition.x - minX;
                    return (normalizedX / range) * 100;
                  })()}
                  onChange={(value) => {
                    if (containerRef.current && imageSize.width > 0) {
                      const container = containerRef.current;
                      const containerWidth = container.clientWidth;
                      const imageWidth = imageSize.width;
                      
                      // 计算可移动范围
                      const minX = Math.min(0, containerWidth - imageWidth);
                      const maxX = Math.max(0, containerWidth - imageWidth);
                      const range = maxX - minX;
                      
                      if (range > 0) {
                        // 将滑块值(0-100)映射到实际位置
                        const newX = minX + (value / 100) * range;
                        setImagePosition(prev => ({ ...prev, x: newX }));
                      }
                    }
                  }}
                  style={{ width: '200px', display: 'inline-block', marginLeft: 16 }}
                />
                <Button 
                  size="small" 
                  onClick={() => {
                    if (containerRef.current && imageSize.width > 0) {
                      const container = containerRef.current;
                      const containerWidth = container.clientWidth;
                      const imageWidth = imageSize.width;
                      const minX = Math.min(0, containerWidth - imageWidth);
                      const maxX = Math.max(0, containerWidth - imageWidth);
                      const centerX = (minX + maxX) / 2;
                      setImagePosition(prev => ({ ...prev, x: centerX }));
                    }
                  }}
                  style={{ marginLeft: 8 }}
                >
                  居中
                </Button>
              </div>
            </div>
            <div>
              <div style={{ marginBottom: 8 }}>
                <span>垂直位置：</span>
                <Slider
                  min={0}
                  max={100}
                  step={1}
                  value={(() => {
                    if (!containerRef.current || imageSize.height === 0) return 50;
                    const container = containerRef.current;
                    const containerHeight = container.clientHeight;
                    const imageHeight = imageSize.height;
                    
                    // 计算可移动范围
                    // 如果图片比容器大，允许负值（图片可以向上移出容器）
                    const minY = Math.min(0, containerHeight - imageHeight);
                    const maxY = Math.max(0, containerHeight - imageHeight);
                    const range = maxY - minY;
                    
                    if (range <= 0) return 50; // 如果无法移动，返回中间值
                    
                    // 将当前位置映射到0-100
                    const normalizedY = imagePosition.y - minY;
                    return (normalizedY / range) * 100;
                  })()}
                  onChange={(value) => {
                    if (containerRef.current && imageSize.height > 0) {
                      const container = containerRef.current;
                      const containerHeight = container.clientHeight;
                      const imageHeight = imageSize.height;
                      
                      // 计算可移动范围
                      const minY = Math.min(0, containerHeight - imageHeight);
                      const maxY = Math.max(0, containerHeight - imageHeight);
                      const range = maxY - minY;
                      
                      if (range > 0) {
                        // 将滑块值(0-100)映射到实际位置
                        const newY = minY + (value / 100) * range;
                        setImagePosition(prev => ({ ...prev, y: newY }));
                      }
                    }
                  }}
                  style={{ width: '200px', display: 'inline-block', marginLeft: 16 }}
                />
                <Button 
                  size="small" 
                  onClick={() => {
                    if (containerRef.current && imageSize.height > 0) {
                      const container = containerRef.current;
                      const containerHeight = container.clientHeight;
                      const imageHeight = imageSize.height;
                      const minY = Math.min(0, containerHeight - imageHeight);
                      const maxY = Math.max(0, containerHeight - imageHeight);
                      const centerY = (minY + maxY) / 2;
                      setImagePosition(prev => ({ ...prev, y: centerY }));
                    }
                  }}
                  style={{ marginLeft: 8 }}
                >
                  居中
                </Button>
              </div>
            </div>
            <div style={{ fontSize: 12, color: '#666' }}>
              提示：使用滑块调整图片缩放和位置，拖拽裁剪框移动裁剪区域。裁剪区域是轮播图中显示的部分。
            </div>
          </Space>
        </div>
      </Modal>

      {/* 马拉松赛事编辑/添加模态框 */}
      <Modal
        title={isEditMode ? '编辑马拉松赛事' : '添加马拉松赛事'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setCities([]);
          setDistricts([]);
          setCertificateFile(null);
        }}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleMarathonSubmit}
        >
          <Form.Item
            name="event_name"
            label="赛事名称"
            rules={[{ required: true, message: '请输入赛事名称' }]}
          >
            <Input placeholder="请输入赛事名称" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="event_date"
                label="赛事日期"
                rules={[{ required: true, message: '请选择赛事日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="event_type"
                label="赛事类型"
                rules={[{ required: true, message: '请选择赛事类型' }]}
              >
                <Select placeholder="请选择赛事类型">
                  <Option value="5km">5KM</Option>
                  <Option value="10km">10KM</Option>
                  <Option value="15km">15KM</Option>
                  <Option value="half">半程马拉松</Option>
                  <Option value="full">全程马拉松</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="location"
            label="赛事地点"
            rules={[{ required: true, message: '请输入赛事地点' }]}
          >
            <Input placeholder="请输入赛事地点" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="province"
                label="省份"
              >
                <Select
                  placeholder="请选择省份"
                  onChange={(value) => {
                    if (value) {
                      const selectedProvince = provinces.find((p: any) => p.name === value);
                      if (selectedProvince) {
                        fetchCities(selectedProvince.id);
                        form.setFieldsValue({ city: undefined, district: undefined });
                      }
                    } else {
                      setCities([]);
                      setDistricts([]);
                    }
                  }}
                >
                  {provinces.map((province: any) => (
                    <Option key={province.id} value={province.name}>
                      {province.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="city"
                label="城市"
              >
                <Select
                  placeholder="请选择城市"
                  onChange={(value) => {
                    if (value) {
                      const selectedCity = cities.find((c: any) => c.name === value);
                      if (selectedCity) {
                        fetchDistricts(selectedCity.id);
                        form.setFieldsValue({ district: undefined });
                      }
                    } else {
                      setDistricts([]);
                    }
                  }}
                >
                  {cities.map((city: any) => (
                    <Option key={city.id} value={city.name}>
                      {city.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="district"
                label="区/县"
              >
                <Select placeholder="请选择区/县">
                  {districts.map((district: any) => (
                    <Option key={district.id} value={district.name}>
                      {district.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="finish_time"
                label="完赛时间"
                rules={[{ required: true, message: '请输入完赛时间' }]}
              >
                <Input placeholder="例如：3:45:30" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="pace"
                label="配速"
                rules={[
                  {
                    required: false,
                    pattern: /^([0-5][0-9]):([0-5][0-9])$/,
                    message: '配速格式错误，请输入 mm:ss 格式（例如：05:30），表示每公里分钟:秒',
                  },
                ]}
                getValueFromEvent={(e) => {
                  // 输入时实时规范化：移除 /km 后缀
                  return e.target.value.replace(/\/km/gi, '').trim();
                }}
              >
                <Input 
                  placeholder="例如：05:30（表示每公里5分30秒）" 
                  maxLength={5}
                  onBlur={(e) => {
                    // 失焦时自动补零：将 m:ss 格式转换为 mm:ss
                    const value = e.target.value.trim();
                    if (value && /^([0-9]):([0-5][0-9])$/.test(value)) {
                      const parts = value.split(':');
                      const normalized = `${parts[0].padStart(2, '0')}:${parts[1]}`;
                      form.setFieldsValue({ pace: normalized });
                    }
                  }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="赛事描述"
          >
            <TextArea rows={3} placeholder="请输入赛事描述" />
          </Form.Item>

          <Form.Item
            name="event_log"
            label="赛事日志（Markdown格式）"
          >
            <TextArea rows={5} placeholder="请输入赛事日志，支持Markdown格式" />
          </Form.Item>

          {!isEditMode && (
            <Form.Item label="完赛证书">
              <Upload
                beforeUpload={(file) => {
                  setCertificateFile(file);
                  return false;
                }}
                onRemove={() => {
                  setCertificateFile(null);
                }}
                fileList={certificateFile ? [{
                  uid: '-1',
                  name: certificateFile.name,
                  status: 'done',
                }] : []}
              >
                <Button icon={<UploadOutlined />}>选择证书图片</Button>
              </Upload>
              <div style={{ marginTop: 8, color: '#999', fontSize: 12 }}>
                注：证书将在添加赛事后自动上传
              </div>
            </Form.Item>
          )}

          {isEditMode && currentMarathon && currentMarathon.certificate && (
            <Form.Item label="当前证书">
              <Button
                type="link"
                icon={<EyeOutlined />}
                onClick={() => handleViewCertificate(currentMarathon!.certificate!, currentMarathon!.event_name)}
              >
                查看证书
              </Button>
              <Upload
                beforeUpload={(file) => {
                  setCertificateFile(file);
                  return false;
                }}
                onRemove={() => {
                  setCertificateFile(null);
                }}
                fileList={certificateFile ? [{
                  uid: '-1',
                  name: certificateFile.name,
                  status: 'done',
                }] : []}
                style={{ marginLeft: 16 }}
              >
                <Button icon={<UploadOutlined />} size="small">更换证书</Button>
              </Upload>
            </Form.Item>
          )}

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => {
                setModalVisible(false);
                form.resetFields();
                setCities([]);
                setDistricts([]);
                setCertificateFile(null);
              }}>取消</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {isEditMode ? '更新赛事' : '添加赛事'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 报名赛事编辑/添加模态框 */}
      <Modal
        title={isEditRegistrationMode ? '编辑报名赛事' : '添加报名赛事'}
        open={registrationModalVisible}
        onCancel={() => {
          setRegistrationModalVisible(false);
          registrationForm.resetFields();
          setRegistrationCities([]);
          setRegistrationDistricts([]);
        }}
        footer={null}
        width={800}
      >
        <Form
          form={registrationForm}
          layout="vertical"
          onFinish={handleRegistrationSubmit}
        >
          <Form.Item
            name="event_name"
            label="赛事名称"
            rules={[{ required: true, message: '请输入赛事名称' }]}
          >
            <Input placeholder="请输入赛事名称" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="event_date"
                label="赛事日期"
                rules={[{ required: true, message: '请选择赛事日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="event_type"
                label="赛事类型"
                rules={[{ required: true, message: '请选择赛事类型' }]}
              >
                <Select placeholder="请选择赛事类型">
                  <Option value="5km">5KM</Option>
                  <Option value="10km">10KM</Option>
                  <Option value="15km">15KM</Option>
                  <Option value="half">半程马拉松</Option>
                  <Option value="full">全程马拉松</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="location"
            label="赛事地点"
          >
            <Input placeholder="请输入赛事地点" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="province"
                label="省份"
              >
                <Select
                  placeholder="请选择省份"
                  onChange={(value) => {
                    if (value) {
                      const selectedProvince = provinces.find((p: any) => p.name === value);
                      if (selectedProvince) {
                        fetchRegistrationCities(selectedProvince.id);
                        registrationForm.setFieldsValue({ city: undefined, district: undefined });
                      }
                    } else {
                      setRegistrationCities([]);
                      setRegistrationDistricts([]);
                    }
                  }}
                >
                  {provinces.map((province: any) => (
                    <Option key={province.id} value={province.name}>
                      {province.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="city"
                label="城市"
              >
                <Select
                  placeholder="请选择城市"
                  onChange={(value) => {
                    if (value) {
                      const selectedCity = registrationCities.find((c: any) => c.name === value);
                      if (selectedCity) {
                        fetchRegistrationDistricts(selectedCity.id);
                        registrationForm.setFieldsValue({ district: undefined });
                      }
                    } else {
                      setRegistrationDistricts([]);
                    }
                  }}
                >
                  {registrationCities.map((city: any) => (
                    <Option key={city.id} value={city.name}>
                      {city.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="district"
                label="区/县"
              >
                <Select placeholder="请选择区/县">
                  {registrationDistricts.map((district: any) => (
                    <Option key={district.id} value={district.name}>
                      {district.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="registration_status"
                label="报名状态"
                rules={[{ required: true, message: '请选择报名状态' }]}
              >
                <Select placeholder="请选择报名状态">
                  <Option value="preparing">准备报名</Option>
                  <Option value="pending">待抽签</Option>
                  <Option value="won">已中签</Option>
                  <Option value="lost">未中签</Option>
                  <Option value="abandoned">已弃赛</Option>
                  <Option value="waitlist">候补中</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="registration_date"
                label="报名时间"
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="registration_fee"
                label="报名费用（元）"
              >
                <Input type="number" placeholder="请输入报名费用" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="draw_date"
                label="出签时间"
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="transport"
                label="交通信息"
              >
                <Select placeholder="请选择交通信息" allowClear>
                  <Option value="booked">已预定</Option>
                  <Option value="not_booked">未预定</Option>
                  <Option value="local">本地不需要</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="accommodation"
                label="住宿信息"
              >
                <Select placeholder="请选择住宿信息" allowClear>
                  <Option value="booked">已预定</Option>
                  <Option value="not_booked">未预定</Option>
                  <Option value="local">本地不需要</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="notes"
            label="备注"
          >
            <TextArea rows={3} placeholder="请输入备注信息" />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => {
                setRegistrationModalVisible(false);
                registrationForm.resetFields();
                setRegistrationCities([]);
                setRegistrationDistricts([]);
              }}>取消</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {isEditRegistrationMode ? '更新报名' : '添加报名'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 证书查看模态框 */}
      <Modal
        title={`${currentEventName} - 完赛证书`}
        open={certificateModalVisible}
        onCancel={() => {
          setCertificateModalVisible(false);
          setCurrentCertificate(null);
          setCurrentEventName('');
        }}
        footer={null}
        width={800}
      >
        {currentCertificate && (
          <img
            src={currentCertificate}
            alt="完赛证书"
            style={{ width: '100%', height: 'auto' }}
          />
        )}
      </Modal>

      {/* 修改密码模态框 */}
      <Modal
        title="修改密码"
        open={passwordModalVisible}
        onCancel={() => {
          setPasswordModalVisible(false);
          passwordForm.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handleChangePassword}
        >
          <Form.Item
            name="oldPassword"
            label="当前密码"
            rules={[{ required: true, message: '请输入当前密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请输入当前密码"
            />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label="新密码"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码长度至少6位' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请输入新密码（至少6位）"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="确认新密码"
            rules={[
              { required: true, message: '请确认新密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请再次输入新密码"
            />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => {
                setPasswordModalVisible(false);
                passwordForm.resetFields();
              }}>取消</Button>
              <Button type="primary" htmlType="submit" loading={passwordLoading}>
                修改密码
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Admin;
