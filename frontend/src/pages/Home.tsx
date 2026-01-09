import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Spin } from 'antd';
import { TrophyOutlined, CalendarOutlined, EnvironmentOutlined, FileTextOutlined } from '@ant-design/icons';
import Navigation from '../components/Common/Navigation';
import apiClient from '../services/axios';
import { MarathonEvent } from '../services/types';
import { showError } from '../utils/errorHandler';
import '../styles/Home.css';
import '../styles/commonAnimations.css';

const Home: React.FC = () => {
  const [loading, setLoading] = useState(true);
  
  const [stats, setStats] = useState([
    { title: '已完成赛事', value: 0, icon: <TrophyOutlined />, color: '#B22A2A' },
    { title: '总跑里程', value: '0', suffix: '公里', icon: <FileTextOutlined />, color: '#F6C12C' },
    { title: '参赛城市', value: 0, icon: <EnvironmentOutlined />, color: '#B22A2A' },
    { title: '最佳配速', value: '0', suffix: '分/公里', icon: <CalendarOutlined />, color: '#F6C12C' },
  ]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const raw = await apiClient.get('/api/marathon/');
      const events: MarathonEvent[] = Array.isArray(raw) ? raw : [];

      if (!events || events.length === 0) {
        setStats([
          { title: '已完成赛事', value: '0', suffix: '场', icon: <TrophyOutlined />, color: '#B22A2A' },
          { title: '总跑里程', value: '0', suffix: '公里', icon: <FileTextOutlined />, color: '#F6C12C' },
          { title: '参赛城市', value: '0', suffix: '个', icon: <EnvironmentOutlined />, color: '#B22A2A' },
          { title: '最佳配速', value: '0', suffix: '分/公里', icon: <CalendarOutlined />, color: '#F6C12C' },
        ]);
        return;
      }

      const totalEvents = events.length;

      const eventTypeDistanceMap: { [key: string]: number } = {
        '5km': 5,
        '10km': 10,
        '15km': 15,
        'half': 21.0975,
        'full': 42.195,
      };
      
      const totalDistance = events.reduce<number>((sum, event) => {
        const distance = eventTypeDistanceMap[event.event_type] || 0;
        return sum + distance;
      }, 0);

      const cities = new Set(events.map(event => event.location).filter(loc => loc));
      const totalCities = cities.size;

      const validPaceEvents = events.filter(event => event.pace && event.pace.includes(':'));
      const bestPace = validPaceEvents.reduce((best, event) => {
        const paceParts = event.pace.split(':');
        const paceMinutes = parseInt(paceParts[0]) + parseInt(paceParts[1]) / 60;
        return paceMinutes < best ? paceMinutes : best;
      }, Infinity);

      const bestPaceFormatted = bestPace !== Infinity ? bestPace.toFixed(2) : '0';

      setStats([
        { title: '已完成赛事', value: totalEvents.toString(), suffix: '场', icon: <TrophyOutlined />, color: '#B22A2A' },
        { title: '总跑里程', value: totalDistance.toFixed(1), suffix: '公里', icon: <FileTextOutlined />, color: '#F6C12C' },
        { title: '参赛城市', value: totalCities.toString(), suffix: '个', icon: <EnvironmentOutlined />, color: '#B22A2A' },
        { title: '最佳配速', value: bestPaceFormatted, suffix: '分/公里', icon: <CalendarOutlined />, color: '#F6C12C' },
      ]);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-container page-container">
      <Navigation />
      
      {loading ? (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: 'calc(100vh - 64px)',
          marginTop: '64px'
        }}>
          <Spin size="large" tip="加载中..." />
        </div>
      ) : (
        <>
          <Card className="intro-card fade-in" title="个人简介">
            <p>大家好！欢迎来到<strong>追光小慢侠</strong>！我是一个热爱马拉松的跑者，通过这个应用展示我的跑步生涯和马拉松赛事记录。</p>
            <p>这里你可以看到我的赛事成绩、参赛地点分布以及完赛证书等信息。</p>
          </Card>

          <div className="stats-section fade-in">
            <h2>数据概览</h2>
            <Row gutter={[16, 16]}>
              {stats.map((stat, index) => (
                <Col xs={12} sm={6} key={index}>
                  <Card className="card-entrance hover-lift" style={{ height: '100%' }}>
                    <Statistic
                      title={stat.title}
                      value={stat.value}
                      suffix={stat.suffix}
                      prefix={stat.icon}
                      valueStyle={{ color: stat.color }}
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </>
      )}
    </div>
  );
};

export default Home;
