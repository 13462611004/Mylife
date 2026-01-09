import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Form, Input, DatePicker, Select, Upload, Modal, message, Space, Row, Col, Tabs, Tag, Checkbox, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, EyeOutlined, LogoutOutlined, LockOutlined, SettingOutlined } from '@ant-design/icons';
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
  const [postSearchText, setPostSearchText] = useState<string>('');
  const [postStartDate, setPostStartDate] = useState<dayjs.Dayjs | null>(null);
  const [postEndDate, setPostEndDate] = useState<dayjs.Dayjs | null>(null);
  const [postStats, setPostStats] = useState<any>(null);
  // 修改密码相关状态
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [passwordForm] = Form.useForm();
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin');
    if (!isAdmin) {
      message.error('请先登录');
      navigate('/admin/login');
      return;
    }
    fetchMarathons();
    fetchRegistrations();
    fetchPosts();
    fetchPostStats();
    fetchProvinces();
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
    
    // 如果有省份，先加载城市列表
    if (record.province) {
      const selectedProvince = provinces.find((p: any) => p.name === record.province);
      if (selectedProvince) {
        await fetchCities(selectedProvince.id);
        // 等待城市加载完成后再加载区县
        setTimeout(async () => {
          if (record.city) {
            const cityList = await apiClient.get(`/api/marathon/city/?province=${selectedProvince.id}`);
            const selectedCity = Array.isArray(cityList) ? cityList.find((c: any) => c.name === record.city) : null;
            if (selectedCity) {
              await fetchDistricts(selectedCity.id);
            }
          }
        }, 100);
      }
    }
    
    // 设置表单值
    form.setFieldsValue({
      event_name: record.event_name,
      event_date: dayjs(record.event_date),
      location: record.location,
      province: record.province,
      city: record.city,
      district: record.district,
      event_type: record.event_type,
      finish_time: record.finish_time,
      pace: record.pace,
      description: record.description,
      event_log: record.event_log,
    });
    
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
      formData.append('location', values.location || '');
      formData.append('province', values.province || '');
      formData.append('city', values.city || '');
      formData.append('district', values.district || '');
      formData.append('event_type', values.event_type);
      formData.append('finish_time', values.finish_time || '');
      formData.append('pace', values.pace || '');
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
        registration_fee: values.registration_fee || null,
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
      const errorMsg = error.response?.data || error.message || '未知错误';
      message.error(`操作失败: ${JSON.stringify(errorMsg)}`);
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
      render: (fee: number | null) => fee ? `¥${fee}` : '-',
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
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>管理后台</h2>
          <Space>
            <Button 
              icon={<SettingOutlined />} 
              onClick={() => setPasswordModalVisible(true)}
            >
              修改密码
            </Button>
            <Button 
              icon={<LogoutOutlined />} 
              onClick={handleLogout}
            >
              退出登录
            </Button>
          </Space>
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
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
              }}
            />
          </Tabs.TabPane>
          <Tabs.TabPane tab="朋友圈" key="3">
            <div style={{ marginBottom: 16 }}>
              <Space>
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
              </Space>
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
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
              }}
            />
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
                // 验证文件类型
                const isImage = file.type.startsWith('image/');
                const isVideo = file.type.startsWith('video/');
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
                
                // 检测Live图（通常是.mov, .heic, .heif格式，或MIME类型为video/quicktime）
                const fileName = file.name.toLowerCase();
                const fileType = file.type.toLowerCase();
                const isLive = 
                  fileName.endsWith('.mov') || 
                  fileName.endsWith('.heic') || 
                  fileName.endsWith('.heif') ||
                  fileType === 'video/quicktime' ||
                  fileType === 'image/heic' ||
                  fileType === 'image/heif';
                
                // 验证视频数量
                const videoCount = postMediaTypes.filter(t => t === 'video').length;
                if (isVideo && videoCount >= 1) {
                  message.error('最多只能上传1个视频！');
                  return false;
                }
                
                // 添加文件到列表（根据文件类型标记：live、video或image）
                setPostMediaFiles([...postMediaFiles, file]);
                const mediaType = isVideo ? 'video' : (isLive ? 'live' : 'image');
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
            {/* 显示已上传文件的类型选择 */}
            {postMediaFiles.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div style={{ marginBottom: 8, fontSize: 14, fontWeight: 500 }}>设置媒体类型：</div>
                {postMediaFiles.map((file, index) => {
                  const currentType = postMediaTypes[index] || 'image';
                  return (
                    <div key={index} style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ flex: 1, fontSize: 13, color: '#666' }}>
                        {file.name.length > 30 ? file.name.substring(0, 30) + '...' : file.name}
                      </span>
                      <Select
                        value={currentType}
                        onChange={(value) => {
                          const newTypes = [...postMediaTypes];
                          newTypes[index] = value;
                          setPostMediaTypes(newTypes);
                        }}
                        style={{ width: 100 }}
                        size="small"
                      >
                        <Option value="image">图片</Option>
                        <Option value="live">Live图</Option>
                        <Option value="video">视频</Option>
                      </Select>
                    </div>
                  );
                })}
              </div>
            )}
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
              }}>取消</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {isEditPostMode ? '更新朋友圈' : '添加朋友圈'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
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
              >
                <Input placeholder="例如：3:45:30" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="pace"
                label="配速"
              >
                <Input placeholder="例如：5:30/km" />
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
