import React, { useState, useEffect } from 'react';
import { Card, Tabs, Row, Col, Button, Space, Modal, Select } from 'antd';
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
  const [selectedEventType, setSelectedEventType] = useState<string>('full');

  const eventTypeOptions = [
    { value: 'full', label: '全程马拉松' },
    { value: 'half', label: '半程马拉松' },
    { value: 'other', label: '其他距离' },
    { value: 'all', label: '全部类型' },
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
    <div className="marathon-container">
      <Navigation />
      
      <Tabs defaultActiveKey="1" className="marathon-tabs">
        <TabPane tab="成绩展示" key="1">
          <Card loading={loading}>
            <div style={{ marginBottom: '24px', textAlign: 'center' }}>
              <Select
                value={selectedEventType}
                onChange={setSelectedEventType}
                style={{ width: 200 }}
                size="large"
              >
                {eventTypeOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </div>
            
            {(() => {
              const filteredEvents = selectedEventType === 'all' 
                ? [...events]
                : [...events].filter(event => event.event_type === selectedEventType);
              
              const sortedEvents = filteredEvents.sort((a, b) => {
                const timeA = parseInt(a.finish_time.replace(/:/g, ''));
                const timeB = parseInt(b.finish_time.replace(/:/g, ''));
                return timeA - timeB;
              });

              const topThree = sortedEvents.slice(0, 3);
              const otherEvents = sortedEvents.slice(3);

              return (
                <div>
                  <div className="podium-container">
                    <div className="podium">
                      {topThree.length >= 2 && (
                        <div className="podium-place second-place">
                          <div className="podium-number">
                            <TrophyOutlined />
                            <span>2</span>
                          </div>
                          <div className="podium-content">
                            <div className="event-name">{topThree[1].event_name}</div>
                            <div className="finish-time">
                              <ClockCircleOutlined />
                              {topThree[1].finish_time}
                            </div>
                            <div className="location">
                              <EnvironmentOutlined />
                              {topThree[1].location}
                            </div>
                            <div className="date">
                              <CalendarOutlined />
                              {topThree[1].event_date}
                            </div>
                          </div>
                        </div>
                      )}

                      {topThree.length >= 1 && (
                        <div className="podium-place first-place">
                          <div className="podium-number">
                            <TrophyOutlined />
                            <span>1</span>
                          </div>
                          <div className="podium-content">
                            <div className="event-name">{topThree[0].event_name}</div>
                            <div className="finish-time">
                              <ClockCircleOutlined />
                              {topThree[0].finish_time}
                            </div>
                            <div className="location">
                              <EnvironmentOutlined />
                              {topThree[0].location}
                            </div>
                            <div className="date">
                              <CalendarOutlined />
                              {topThree[0].event_date}
                            </div>
                          </div>
                        </div>
                      )}

                      {topThree.length >= 3 && (
                        <div className="podium-place third-place">
                          <div className="podium-number">
                            <TrophyOutlined />
                            <span>3</span>
                          </div>
                          <div className="podium-content">
                            <div className="event-name">{topThree[2].event_name}</div>
                            <div className="finish-time">
                              <ClockCircleOutlined />
                              {topThree[2].finish_time}
                            </div>
                            <div className="location">
                              <EnvironmentOutlined />
                              {topThree[2].location}
                            </div>
                            <div className="date">
                              <CalendarOutlined />
                              {topThree[2].event_date}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {otherEvents.length > 0 && (
                    <div className="other-events">
                      <div className="event-list">
                        {otherEvents.map((event, index) => (
                          <div className="event-item" key={event.id}>
                            <div className="event-rank">
                              <TrophyOutlined />
                              <span>{index + 4}</span>
                            </div>
                            <div className="event-details">
                              <div className="event-name">{event.event_name}</div>
                              <div className="event-info">
                                <span className="finish-time">
                                  <ClockCircleOutlined />
                                  {event.finish_time}
                                </span>
                                <span className="location">
                                  <EnvironmentOutlined />
                                  {event.location}
                                </span>
                                <span className="date">
                                  <CalendarOutlined />
                                  {event.event_date}
                                </span>
                              </div>
                            </div>
                            <div className="event-actions">
                              <Space>
                                <Button type="link" icon={<EyeOutlined />} onClick={() => handleViewDetails(event.id)} />
                                <Button type="link" icon={<SafetyCertificateOutlined />} onClick={() => handleViewCertificate(event)} />
                              </Space>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {sortedEvents.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                      <p>暂无赛事记录</p>
                    </div>
                  )}
                </div>
              );
            })()}
          </Card>
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
                          <p style={{ margin: '4px 0' }}><strong>赛事类型：</strong>
                            {registration.event_type === '5km' ? '5KM' : 
                             registration.event_type === '10km' ? '10KM' :
                             registration.event_type === '15km' ? '15KM' :
                             registration.event_type === 'half' ? '半程马拉松' : 
                             registration.event_type === 'full' ? '全程马拉松' : registration.event_type}
                          </p>
                          <p style={{ margin: '4px 0' }}><strong>报名状态：</strong>
                            <span style={{
                              color: registration.registration_status === 'won' ? '#52c41a' :
                                     registration.registration_status === 'pending' ? '#1890ff' :
                                     registration.registration_status === 'lost' ? '#ff4d4f' :
                                     registration.registration_status === 'abandoned' ? '#faad14' :
                                     '#d9d9d9'
                            }}>
                              {registration.registration_status === 'preparing' ? '准备报名' :
                               registration.registration_status === 'pending' ? '待抽签' :
                               registration.registration_status === 'won' ? '已中签' :
                               registration.registration_status === 'lost' ? '未中签' :
                               registration.registration_status === 'abandoned' ? '已弃赛' : registration.registration_status}
                            </span>
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
        title="赛事详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={800}
      >
        {currentEvent && (
          <div>
            <p><strong>赛事名称：</strong>{currentEvent.event_name}</p>
            <p><strong>赛事日期：</strong>{currentEvent.event_date}</p>
            <p><strong>地点：</strong>{currentEvent.location}</p>
            {currentEvent.province && <p><strong>省份：</strong>{currentEvent.province}</p>}
            {currentEvent.city && <p><strong>城市：</strong>{currentEvent.city}</p>}
            {currentEvent.district && <p><strong>区/县：</strong>{currentEvent.district}</p>}
            <p><strong>赛事类型：</strong>
              {currentEvent.event_type === '5km' ? '5KM' : 
               currentEvent.event_type === '10km' ? '10KM' :
               currentEvent.event_type === '15km' ? '15KM' :
               currentEvent.event_type === 'half' ? '半程马拉松' : 
               currentEvent.event_type === 'full' ? '全程马拉松' : currentEvent.event_type}
            </p>
            <p><strong>完赛时间：</strong>{currentEvent.finish_time}</p>
            <p><strong>配速：</strong>{currentEvent.pace}</p>
            {currentEvent.description && <p><strong>赛事描述：</strong>{currentEvent.description}</p>}
            {currentEvent.certificate && (
              <div>
                <p><strong>完赛证书：</strong></p>
                <div style={{ textAlign: 'center', marginBottom: '16px' }}>
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
              </div>
            )}
            {currentEvent.event_log && (
              <div>
                <p><strong>赛事日志：</strong></p>
                <div style={{ 
                  background: '#f5f5f5', 
                  padding: '16px', 
                  borderRadius: '4px',
                  maxHeight: '300px',
                  overflow: 'auto'
                }}>
                  <ReactMarkdown>{currentEvent.event_log}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Marathon;
