import React, { useState, useEffect } from 'react';
import { Card, Tabs, Row, Col, Button, Space, Modal, Select, Tag, Spin, Statistic, Empty } from 'antd';
import { EyeOutlined, TrophyOutlined, SafetyCertificateOutlined, ClockCircleOutlined, EnvironmentOutlined, CalendarOutlined } from '@ant-design/icons';
import MarathonTable from '../components/Marathon/MarathonTable';
import MarathonCharts from '../components/Marathon/MarathonCharts';
import { MarathonEvent, MarathonRegistration } from '../services/types';
import apiClient from '../services/axios';
import Navigation from '../components/Common/Navigation';
import ReactMarkdown from 'react-markdown';
import { showError, showWarning } from '../utils/errorHandler';
import '../styles/Marathon.css';

const { TabPane } = Tabs;
const { Option } = Select;

const Marathon: React.FC = () => {
  const [events, setEvents] = useState<MarathonEvent[]>([]);
  const [registrations, setRegistrations] = useState<MarathonRegistration[]>([]);
  const [loading, setLoading] = useState(false);
  const [certificateModalVisible, setCertificateModalVisible] = useState(false);
  const [currentCertificate, setCurrentCertificate] = useState<string | null>(null);
  const [currentEventName, setCurrentEventName] = useState('');
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<MarathonEvent | null>(null);
  const [selectedEventType, setSelectedEventType] = useState<string>('all');

  const eventTypeOptions = [
    { value: 'all', label: '全部类型' },
    { value: 'full', label: '全程马拉松' },
    { value: 'half', label: '半程马拉松' },
    { value: '5km', label: '5KM' },
    { value: '10km', label: '10KM' },
    { value: '15km', label: '15KM' },
  ];

  useEffect(() => {
    fetchMarathons();
    fetchRegistrations();
  }, []);

  const fetchMarathons = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/api/marathon/');
      setEvents(Array.isArray(response) ? response : []);
    } catch (error) {
      showError(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/api/marathon/registration/');
      setRegistrations(Array.isArray(response) ? response : []);
    } catch (error) {
      showError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (id: number) => {
    const event = events.find(e => e.id === id);
    if (event) {
      setCurrentEvent(event);
      setDetailModalVisible(true);
    }
  };

  const handleViewCertificate = (record: MarathonEvent) => {
    if (record.certificate) {
      setCurrentCertificate(`${record.certificate}`);
      setCurrentEventName(record.event_name);
      setCertificateModalVisible(true);
    } else {
      showWarning('该赛事暂无完赛证书');
    }
  };

  return (
    <div style={{ 
      width: '100%', 
      minHeight: '100vh',
      background: '#FAFAFA', /* 与UIDesignDemo的ui-demo-container一致 */
      padding: 0,
      margin: 0
    }}>
      <div className="marathon-container">
        <Navigation />
      
      <Tabs defaultActiveKey="1" className="marathon-tabs">
        <TabPane tab="成绩展示" key="1">
          <div className="page-preview marathon-page">
            {/* 页面标题 */}
            <div className="marathon-header">
              <h1>马拉松成绩展示</h1>
              <p className="subtitle">我的跑步之路，每一步都是坚持</p>
            </div>

            {/* 运动场景图片展示 */}
            <div style={{ marginBottom: 32, borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}>
              <div style={{
                width: '100%',
                paddingTop: '40%',
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(245, 158, 11, 0.1) 100%)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'url(https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=1200&h=500&fit=crop) center/cover',
                  opacity: 0.8
                }} />
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center',
                  color: '#FFFFFF',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
                }}>
                  <TrophyOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                  <div style={{ fontSize: 24, fontWeight: 700 }}>挑战自我，永不止步</div>
                </div>
              </div>
            </div>

            {/* 赛事类型筛选器 */}
            <div style={{ 
              marginBottom: 24, 
              display: 'flex', 
              justifyContent: 'flex-end', 
              alignItems: 'center',
              gap: 12
            }}>
              <span style={{ 
                fontSize: 14, 
                color: '#6B7280', 
                fontWeight: 500,
                fontFamily: 'var(--font-family)'
              }}>
                筛选类型：
              </span>
              <Select
                value={selectedEventType}
                onChange={(value) => setSelectedEventType(value)}
                style={{ 
                  width: 160,
                  borderRadius: '6px'
                }}
                size="middle"
                className="marathon-event-filter"
              >
                {eventTypeOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <Spin size="large" />
              </div>
            ) : (() => {
              // 筛选逻辑：根据选择的赛事类型筛选
              const filteredEvents = selectedEventType === 'all' 
                ? [...events]
                : [...events].filter(event => event.event_type === selectedEventType);
              
              // 如果没有筛选到任何数据，显示提示
              if (filteredEvents.length === 0) {
                return (
                  <div style={{ textAlign: 'center', padding: '40px' }}>
                    <Empty description="暂无该类型的赛事记录" />
                  </div>
                );
              }
              
              // 按完赛时间排序（从小到大，即最快的时间在前）
              const sortedEvents = filteredEvents.sort((a, b) => {
                try {
                  const timeA = parseInt(a.finish_time.replace(/:/g, ''));
                  const timeB = parseInt(b.finish_time.replace(/:/g, ''));
                  return timeA - timeB;
                } catch (error) {
                  // 如果时间格式不正确，保持原顺序
                  return 0;
                }
              });

              // 取前3名作为领奖台展示
              const topThree = sortedEvents.slice(0, 3);
              // 剩余的赛事作为列表展示
              const otherEvents = sortedEvents.slice(3);

              return (
                <div>
                  {topThree.length > 0 && (
                    <div className="podium-showcase">
                    {topThree.length >= 2 && (
                      <div 
                        className="podium-item second" 
                        onClick={() => handleViewDetails(topThree[1].id)}
                        style={{ cursor: 'pointer', transition: 'transform 0.3s ease' }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      >
                        <div className="rank">2</div>
                        <div className="info">
                          <div className="event-name">{topThree[1].event_name}</div>
                          <div className="time">{topThree[1].finish_time}</div>
                          <div className="location">{topThree[1].location}</div>
                        </div>
                      </div>
                    )}

                    {topThree.length >= 1 && (
                      <div 
                        className="podium-item first" 
                        onClick={() => handleViewDetails(topThree[0].id)}
                        style={{ cursor: 'pointer', transition: 'transform 0.3s ease' }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      >
                        <div className="rank">1</div>
                        <div className="info">
                          <div className="event-name">{topThree[0].event_name}</div>
                          <div className="time">{topThree[0].finish_time}</div>
                          <div className="location">{topThree[0].location}</div>
                        </div>
                      </div>
                    )}

                    {topThree.length >= 3 && (
                      <div 
                        className="podium-item third" 
                        onClick={() => handleViewDetails(topThree[2].id)}
                        style={{ cursor: 'pointer', transition: 'transform 0.3s ease' }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      >
                        <div className="rank">3</div>
                        <div className="info">
                          <div className="event-name">{topThree[2].event_name}</div>
                          <div className="time">{topThree[2].finish_time}</div>
                          <div className="location">{topThree[2].location}</div>
                        </div>
                      </div>
                    )}
                  </div>
                  )}

                  {otherEvents.length > 0 && (
                    <Card title="赛事列表" className="marathon-list-card">
                      {otherEvents.map((event, index) => (
                        <div 
                          key={event.id} 
                          className="marathon-event-item"
                          onClick={() => handleViewDetails(event.id)}
                          style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateX(4px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.2)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateX(0)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          <div className="event-main">
                            <h3>{event.event_name}</h3>
                            <div className="event-meta">
                              <Tag icon={<CalendarOutlined />}>{event.event_date}</Tag>
                              <Tag icon={<EnvironmentOutlined />}>{event.location}</Tag>
                              <Tag icon={<ClockCircleOutlined />}>{event.finish_time}</Tag>
                              <Tag color="orange">
                                {event.event_type === 'full' ? '全程马拉松' : 
                                 event.event_type === 'half' ? '半程马拉松' : 
                                 event.event_type === '5km' ? '5KM' :
                                 event.event_type === '10km' ? '10KM' :
                                 event.event_type === '15km' ? '15KM' : 
                                 event.event_type}
                              </Tag>
                            </div>
                          </div>
                        </div>
                      ))}
                    </Card>
                  )}

                  {sortedEvents.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                      <p>暂无赛事记录</p>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </TabPane>

        <TabPane tab="赛事记录" key="2">
          <Card title="成绩表格" loading={loading}>
            <MarathonTable
              data={events}
              onViewDetails={handleViewDetails}
              onViewCertificate={handleViewCertificate}
            />
          </Card>
        </TabPane>

        <TabPane tab="数据可视化" key="3">
          <Card title="马拉松数据统计" loading={loading}>
            {events.length > 0 ? (
              <MarathonCharts events={events} />
            ) : (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <p>暂无数据可可视化</p>
              </div>
            )}
          </Card>
        </TabPane>

        <TabPane tab="完赛证书" key="4">
          <Card title="证书画廊" loading={loading}>
            <Row gutter={[16, 16]}>
              {events.length > 0 ? (
                events.map((event) => (
                  <Col xs={12} sm={8} key={event.id}>
                    <Card 
                      hoverable 
                      className="certificate-card"
                      bodyStyle={{ padding: '8px' }}
                      onClick={() => handleViewCertificate(event)}
                    >
                      {event.certificate ? (
                        <div style={{ height: '180px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <img 
                            src={`${event.certificate}`} 
                            alt={`${event.event_name} 证书`} 
                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                          />
                        </div>
                      ) : (
                        <div style={{ height: '180px', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <p>无证书</p>
                        </div>
                      )}
                      <p style={{ textAlign: 'center', marginTop: '8px' }}>{event.event_name}</p>
                    </Card>
                  </Col>
                ))
              ) : (
                <Col span={24} style={{ textAlign: 'center', padding: '40px' }}>
                  <p>暂无证书</p>
                </Col>
              )}
            </Row>
          </Card>
        </TabPane>

        <TabPane tab="报名赛事" key="5">
          <Card title="即将参加的赛事" loading={loading}>
            {registrations.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {registrations
                  .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
                  .map((registration) => (
                    <Card 
                      key={registration.id}
                      style={{ 
                        borderLeft: `4px solid ${
                          registration.registration_status === 'won' ? '#52c41a' :
                          registration.registration_status === 'pending' ? '#1890ff' :
                          registration.registration_status === 'lost' ? '#ff4d4f' :
                          registration.registration_status === 'abandoned' ? '#faad14' :
                          '#d9d9d9'
                        }`
                      }}
                    >
                      <Row gutter={16}>
                        <Col span={16}>
                          <h3 style={{ margin: '0 0 8px 0', color: '#B22A2A' }}>{registration.event_name}</h3>
                          <p style={{ margin: '4px 0' }}><strong>赛事日期：</strong>{registration.event_date}</p>
                          <p style={{ margin: '4px 0' }}><strong>地点：</strong>{registration.location}</p>
                          <p style={{ margin: '4px 0' }}><strong>状态：</strong>
                            {registration.registration_status === 'won' ? '已中签' :
                             registration.registration_status === 'pending' ? '待抽签' :
                             registration.registration_status === 'lost' ? '未中签' :
                             registration.registration_status === 'abandoned' ? '已放弃' :
                             '准备中'}
                          </p>
                          {registration.registration_fee && (
                            <p style={{ margin: '4px 0' }}><strong>报名费用：</strong>¥{registration.registration_fee}</p>
                          )}
                        </Col>
                        <Col span={8} style={{ textAlign: 'right' }}>
                          <div style={{ 
                            padding: '12px', 
                            background: '#f5f5f5', 
                            borderRadius: '8px',
                            display: 'inline-block'
                          }}>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#B22A2A' }}>
                              {registration.event_type === '5km' ? '5KM' : 
                               registration.event_type === '10km' ? '10KM' :
                               registration.event_type === '15km' ? '15KM' :
                               registration.event_type === 'half' ? '半马' : 
                               registration.event_type === 'full' ? '全马' : registration.event_type}
                            </div>
                          </div>
                        </Col>
                      </Row>
                    </Card>
                  ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <p>暂无报名赛事</p>
              </div>
            )}
          </Card>
        </TabPane>
      </Tabs>

      <Modal
        title={`${currentEventName} - 完赛证书`}
        open={certificateModalVisible}
        onCancel={() => setCertificateModalVisible(false)}
        footer={null}
        width={800}
      >
        {currentCertificate && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <img 
              src={currentCertificate} 
              alt={`${currentEventName} 证书`} 
              style={{ maxWidth: '100%', maxHeight: '80vh' }}
            />
          </div>
        )}
      </Modal>

      <Modal
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={900}
        style={{ top: 20 }}
        className="marathon-detail-modal"
      >
        {currentEvent && (() => {
          // 计算距离（根据赛事类型）
          const eventTypeDistanceMap: { [key: string]: number } = {
            '5km': 5,
            '10km': 10,
            '15km': 15,
            'half': 21.0975,
            'full': 42.195,
          };
          const distance = eventTypeDistanceMap[currentEvent.event_type] || 0;
          
          // 估算卡路里消耗（每公里约60卡路里）
          const calories = Math.round(distance * 60);
          
          // 获取赛事类型显示文本
          const eventTypeText = currentEvent.event_type === '5km' ? '5KM' : 
            currentEvent.event_type === '10km' ? '10KM' :
            currentEvent.event_type === '15km' ? '15KM' :
            currentEvent.event_type === 'half' ? '半程马拉松' : 
            currentEvent.event_type === 'full' ? '全程马拉松' : currentEvent.event_type;
          
          // 计算排名（在同一赛事类型中的排名）
          const sameTypeEvents = events.filter(e => e.event_type === currentEvent.event_type);
          const sortedSameType = sameTypeEvents.sort((a, b) => {
            const timeA = parseInt(a.finish_time.replace(/:/g, ''));
            const timeB = parseInt(b.finish_time.replace(/:/g, ''));
            return timeA - timeB;
          });
          const rank = sortedSameType.findIndex(e => e.id === currentEvent.id) + 1;
          
          return (
            <div className="marathon-detail-page" style={{
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(245, 158, 11, 0.05) 100%)',
              padding: '24px',
              borderRadius: '12px'
            }}>
              {/* 头部横幅 */}
              <div style={{
                background: 'linear-gradient(135deg, #EF4444 0%, #F59E0B 100%)',
                padding: '32px',
                borderRadius: '12px',
                marginBottom: '24px',
                color: '#FFFFFF',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'url(https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=900&h=200&fit=crop) center/cover',
                  opacity: 0.3
                }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <TrophyOutlined style={{ fontSize: 48, marginBottom: '12px' }} />
                  <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px', color: '#FFFFFF' }}>
                    {currentEvent.event_name}
                  </h1>
                  <div style={{ fontSize: '18px', opacity: 0.9 }}>
                    <EnvironmentOutlined style={{ marginRight: '8px' }} />
                    {currentEvent.location}
                    <span style={{ margin: '0 12px' }}>·</span>
                    <CalendarOutlined style={{ marginRight: '8px' }} />
                    {currentEvent.event_date}
                  </div>
                </div>
              </div>

              {/* 关键数据展示 */}
              <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                <Col xs={24} sm={12} md={6}>
                  <Card style={{
                    background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
                    border: 'none',
                    textAlign: 'center',
                    borderRadius: '8px',
                    minHeight: '150px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}>
                    <Statistic
                      title={<span style={{ color: '#92400E', fontWeight: 600 }}>完赛时间</span>}
                      value={currentEvent.finish_time}
                      valueStyle={{ color: '#92400E', fontSize: '24px', fontWeight: 700 }}
                      prefix={<ClockCircleOutlined />}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card style={{
                    background: 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)',
                    border: 'none',
                    textAlign: 'center',
                    borderRadius: '8px',
                    minHeight: '150px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}>
                    <Statistic
                      title={<span style={{ color: '#991B1B', fontWeight: 600 }}>平均配速</span>}
                      value={currentEvent.pace || '-'}
                      suffix="分/公里"
                      valueStyle={{ color: '#991B1B', fontSize: '24px', fontWeight: 700 }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card style={{
                    background: 'linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 100%)',
                    border: 'none',
                    textAlign: 'center',
                    borderRadius: '8px',
                    minHeight: '150px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}>
                    <Statistic
                      title={<span style={{ color: '#3730A3', fontWeight: 600 }}>距离</span>}
                      value={distance.toFixed(3)}
                      suffix="公里"
                      valueStyle={{ color: '#3730A3', fontSize: '24px', fontWeight: 700 }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card style={{
                    background: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)',
                    border: 'none',
                    textAlign: 'center',
                    borderRadius: '8px',
                    minHeight: '150px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}>
                    <Statistic
                      title={<span style={{ color: '#065F46', fontWeight: 600 }}>消耗</span>}
                      value={calories.toLocaleString()}
                      suffix="卡路里"
                      valueStyle={{ color: '#065F46', fontSize: '24px', fontWeight: 700 }}
                    />
                  </Card>
                </Col>
              </Row>

              {/* 详细信息 */}
              <Card style={{
                background: '#FFFFFF',
                border: '2px solid #FED7AA',
                borderRadius: '12px'
              }}>
                <h3 style={{ 
                  fontSize: '20px', 
                  fontWeight: 600, 
                  color: '#92400E', 
                  marginBottom: '16px',
                  paddingBottom: '12px',
                  borderBottom: '2px solid #FED7AA'
                }}>
                  赛事详情
                </h3>
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12}>
                    <div style={{ marginBottom: '16px' }}>
                      <Tag color="orange" style={{ fontSize: '14px', padding: '4px 12px', marginBottom: '8px' }}>
                        <TrophyOutlined style={{ marginRight: '4px' }} />
                        排名：第 {rank} 名
                      </Tag>
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <Tag color="blue" style={{ fontSize: '14px', padding: '4px 12px', marginBottom: '8px' }}>
                        <CalendarOutlined style={{ marginRight: '4px' }} />
                        赛事类型：{eventTypeText}
                      </Tag>
                    </div>
                    {currentEvent.province && (
                      <div style={{ marginBottom: '16px' }}>
                        <Tag color="geekblue" style={{ fontSize: '14px', padding: '4px 12px', marginBottom: '8px' }}>
                          <EnvironmentOutlined style={{ marginRight: '4px' }} />
                          省份：{currentEvent.province}
                        </Tag>
                      </div>
                    )}
                    {currentEvent.city && (
                      <div style={{ marginBottom: '16px' }}>
                        <Tag color="cyan" style={{ fontSize: '14px', padding: '4px 12px', marginBottom: '8px' }}>
                          <EnvironmentOutlined style={{ marginRight: '4px' }} />
                          城市：{currentEvent.city}
                        </Tag>
                      </div>
                    )}
                  </Col>
                  <Col xs={24} sm={12}>
                    {currentEvent.district && (
                      <div style={{ marginBottom: '16px' }}>
                        <Tag color="lime" style={{ fontSize: '14px', padding: '4px 12px', marginBottom: '8px' }}>
                          <EnvironmentOutlined style={{ marginRight: '4px' }} />
                          区/县：{currentEvent.district}
                        </Tag>
                      </div>
                    )}
                    {currentEvent.created_at && (
                      <div style={{ marginBottom: '16px' }}>
                        <Tag color="default" style={{ fontSize: '14px', padding: '4px 12px', marginBottom: '8px' }}>
                          <ClockCircleOutlined style={{ marginRight: '4px' }} />
                          创建时间：{new Date(currentEvent.created_at).toLocaleString('zh-CN')}
                        </Tag>
                      </div>
                    )}
                    {currentEvent.updated_at && (
                      <div style={{ marginBottom: '16px' }}>
                        <Tag color="default" style={{ fontSize: '14px', padding: '4px 12px', marginBottom: '8px' }}>
                          <ClockCircleOutlined style={{ marginRight: '4px' }} />
                          更新时间：{new Date(currentEvent.updated_at).toLocaleString('zh-CN')}
                        </Tag>
                      </div>
                    )}
                  </Col>
                </Row>
                
                {currentEvent.description && (
                  <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #FED7AA' }}>
                    <p style={{ color: '#666', lineHeight: 1.8 }}>{currentEvent.description}</p>
                  </div>
                )}
                
                {currentEvent.event_log && (
                  <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #FED7AA' }}>
                    <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#92400E', marginBottom: '12px' }}>赛事日志</h4>
                    <div style={{ 
                      background: '#f9fafb', 
                      padding: '16px', 
                      borderRadius: '8px',
                      maxHeight: '300px',
                      overflow: 'auto',
                      fontSize: '14px',
                      lineHeight: 1.6,
                      color: '#374151'
                    }}>
                      <ReactMarkdown>{currentEvent.event_log}</ReactMarkdown>
                    </div>
                  </div>
                )}
              </Card>
              
              {currentEvent.certificate && (
                <Card style={{
                  background: '#FFFFFF',
                  border: '2px solid #FED7AA',
                  borderRadius: '12px',
                  marginTop: '24px'
                }}>
                  <h3 style={{ 
                    fontSize: '20px', 
                    fontWeight: 600, 
                    color: '#92400E', 
                    marginBottom: '16px',
                    paddingBottom: '12px',
                    borderBottom: '2px solid #FED7AA'
                  }}>
                    完赛证书
                  </h3>
                  <div style={{ textAlign: 'center' }}>
                    <img 
                      src={currentEvent.certificate} 
                      alt="完赛证书" 
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: '400px',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                      }} 
                    />
                  </div>
                </Card>
              )}

              {/* 关闭按钮 */}
              <div style={{ textAlign: 'center', marginTop: '24px' }}>
                <Button 
                  type="primary" 
                  size="large"
                  onClick={() => setDetailModalVisible(false)}
                  style={{
                    background: 'linear-gradient(135deg, #EF4444 0%, #F59E0B 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0 32px',
                    height: '40px',
                    fontSize: '16px',
                    fontWeight: 600
                  }}
                >
                  关闭
                </Button>
              </div>
            </div>
          );
        })()}
      </Modal>
      </div>
    </div>
  );
};

export default Marathon;
