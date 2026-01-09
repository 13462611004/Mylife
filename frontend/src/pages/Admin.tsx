import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Form, Input, DatePicker, Select, Upload, Modal, message, Space, Row, Col, Tabs, Tag, Checkbox } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/axios';
import { MarathonEvent, MarathonRegistration, Post } from '../services/types';
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
        <Tabs defaultActiveKey="3">
          <Tabs.TabPane tab="马拉松赛事" key="1">
            <p>管理功能开发中...</p>
          </Tabs.TabPane>
          <Tabs.TabPane tab="报名赛事" key="2">
            <p>管理功能开发中...</p>
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
    </div>
  );
};

export default Admin;
