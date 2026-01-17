import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, Row, Col, Statistic, Spin, Progress, Image } from 'antd';
import { 
  TrophyOutlined, 
  EnvironmentOutlined, 
  ClockCircleOutlined,
  UserOutlined
} from '@ant-design/icons';
import Navigation from '../components/Common/Navigation';
import apiClient from '../services/axios';
import { MarathonEvent } from '../services/types';
import { useAdminSettings } from '../hooks/useAdminSettings';
import '../styles/Home.css';
import '../styles/commonAnimations.css';

const Home: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const galleryRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const positionRef = useRef<number>(0);
  const isPausedRef = useRef<boolean>(false);
  const animationStartedRef = useRef<boolean>(false);
  
  // 使用管理员设置Hook获取轮播图和头像
  const { carouselImages, avatarUrl } = useAdminSettings();
  const [galleryImages, setGalleryImages] = useState<{ id: number; src: string; original_url?: string; alt: string }[]>([]);
  
  const [stats, setStats] = useState([
    { title: '已完成赛事', value: '0', suffix: '场', icon: <TrophyOutlined />, color: '#2563EB' },
    { title: '总跑里程', value: '0', suffix: '公里', icon: <ClockCircleOutlined />, color: '#10B981' },
    { title: '参赛城市', value: '0', suffix: '个', icon: <EnvironmentOutlined />, color: '#8B5CF6' },
    { title: '最佳配速', value: '0', suffix: '分/公里', icon: <ClockCircleOutlined />, color: '#F59E0B' },
  ]);

  // 核心技能数据（可以根据实际需求调整）
  const skills = [
    { name: '跑步训练', level: 90 },
    { name: '营养管理', level: 75 },
    { name: '运动康复', level: 70 },
    { name: '赛事规划', level: 85 },
  ];

  // 跑步历程时间线（可以从后端获取或根据赛事数据生成）
  const timeline = [
    { year: '2020', event: '开始接触马拉松', desc: '第一次完成半程马拉松' },
    { year: '2021', event: '参加首场全马', desc: '北京马拉松完赛' },
    { year: '2022', event: '突破个人最好成绩', desc: '全马成绩提升至3小时45分' },
    { year: '2024', event: '持续挑战', desc: '不断突破自我，享受跑步的乐趣' },
  ];

  // 从Hook获取的数据更新到本地状态
  useEffect(() => {
    if (carouselImages && carouselImages.length > 0) {
      setGalleryImages(carouselImages);
    } else {
      // 如果没有上传的图片，使用默认示例图片
      setGalleryImages([
        { id: 1, src: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=600&fit=crop', alt: '跑步瞬间1' },
        { id: 2, src: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=600&fit=crop', alt: '跑步瞬间2' },
        { id: 3, src: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop', alt: '跑步瞬间3' },
        { id: 4, src: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop', alt: '跑步瞬间4' },
      ]);
    }
  }, [carouselImages]);

  // 动态计算轮播图参数
  const getCarouselConfig = () => {
    const imageCount = galleryImages.length;
    const itemsPerView = 4; // 桌面端一次显示4张
    const minGroupsForLoop = 3; // 至少需要3组才能无缝循环
    
    if (imageCount < itemsPerView) {
      return {
        shouldCarousel: false,
        itemsPerView: imageCount,
        groupCount: 1,
        totalItems: imageCount,
      };
    }
    
    const groupCount = minGroupsForLoop;
    const totalItems = imageCount * groupCount;
    
    return {
      shouldCarousel: true,
      itemsPerView,
      groupCount,
      totalItems,
    };
  };

  const carouselConfig = getCarouselConfig();
  
  // 启动动画的函数（完全复制UIDesignDemo的逻辑）
  const startAnimation = useCallback(() => {
    if (animationStartedRef.current || !trackRef.current) {
      return;
    }
    
    // 如果已经有动画在运行，先停止
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    animationStartedRef.current = true;
    const track = trackRef.current;
    const wrapper = track.parentElement as HTMLElement;
    
    if (!wrapper) {
      animationStartedRef.current = false;
      return;
    }

    // 动态计算轮播参数（使用最新的值）
    const imageCount = galleryImages.length;
    const itemsPerView = 4; // 桌面端一次显示4张
    const minGroupsForLoop = 3; // 至少需要3组才能无缝循环
    
    // 重新计算配置
    let currentConfig;
    if (imageCount < itemsPerView) {
      currentConfig = {
        shouldCarousel: false,
        itemsPerView: imageCount,
        groupCount: 1,
        totalItems: imageCount,
      };
    } else {
      currentConfig = {
        shouldCarousel: true,
        itemsPerView,
        groupCount: minGroupsForLoop,
        totalItems: imageCount * minGroupsForLoop,
      };
    }
    const groupCount = currentConfig.groupCount; // 复制的组数
    
    // 如果图片数量不足，不启动动画
    if (imageCount < itemsPerView || !currentConfig.shouldCarousel) {
      animationStartedRef.current = false;
      return;
    }
    
    // 计算宽度比例
    // - 每张图片占wrapper的 100% / itemsPerView（例如4张时每张占25%）
    // - 每组图片总宽度 = imageCount × (100% / itemsPerView) = imageCount × 25%wrapper = (imageCount / itemsPerView) × 100%wrapper
    // - track总宽度 = groupCount × 每组宽度（通过CSS flex自动计算或内联样式设置）
    // - 每组占track的百分比 = 100% / groupCount
    const oneGroupWidthPercent = 100 / groupCount; // 精确值（相对于track）
    const speed = 0.04; // 每帧移动的速度（百分比，相对于track）
    
    // 初始化位置和暂停状态
    positionRef.current = 0;
    isPausedRef.current = false;

    const animate = () => {
      // 确保track元素仍然存在
      if (!trackRef.current || !wrapper) {
        animationStartedRef.current = false;
        return;
      }

      // 如果暂停，继续请求下一帧但不移动
      if (isPausedRef.current) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      // 更新位置
      positionRef.current += speed;
      
      // 关键修复：只有当位置严格大于等于一组宽度时才重置
      // 一组宽度 = 33.333%track = 100%wrapper
      // 当位置达到33.333%时，第一组（8张图片，即图片1-8）完全移出视野
      // 此时应该显示第二组的前4张（图片9-12，内容与图片1-4相同）
      // 重置到0%时，视觉上从第二组跳回第一组，但因为内容相同，应该无缝
      
      // 关键修复：只有当位置严格大于一组宽度时才重置
      // 一组宽度 = 100% / groupCount（相对于track）
      // 例如3组时，每组占33.333%track = 100%wrapper（8张×25%wrapper）
      // 当第一组完全移出视野时，重置到0%，此时显示第二组（内容与第一组相同）
      if (positionRef.current >= oneGroupWidthPercent) {
        // 重置位置：减去一组宽度
        // 使用取模运算，确保重置后位置在[0, oneGroupWidthPercent)范围内
        positionRef.current = positionRef.current % oneGroupWidthPercent;
        // 处理浮点误差：如果结果接近0或大于等于阈值，设为0
        if (positionRef.current < 0.001 || positionRef.current >= oneGroupWidthPercent - 0.001) {
          positionRef.current = 0;
        }
      }

      // 应用transform（相对于track自身宽度）
      if (trackRef.current) {
        trackRef.current.style.transform = `translate3d(-${positionRef.current}%, 0, 0)`;
      }
      
      // 继续动画循环
      animationRef.current = requestAnimationFrame(animate);
    };

    // 启动动画
    animationRef.current = requestAnimationFrame(animate);
  }, [galleryImages]);

  // 页面加载后启动动画
  useEffect(() => {
    const timer1 = setTimeout(() => {
      if (trackRef.current) {
        startAnimation();
      }
    }, 100);

    const timer2 = setTimeout(() => {
      if (trackRef.current && !animationStartedRef.current) {
        startAnimation();
      }
    }, 300);

    const timer3 = setTimeout(() => {
      if (trackRef.current && !animationStartedRef.current) {
        startAnimation();
      }
    }, 500);

    if (galleryRef.current && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && trackRef.current && !animationStartedRef.current) {
              startAnimation();
            }
          });
        },
        { threshold: 0.1 }
      );
      
      observer.observe(galleryRef.current);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
        observer.disconnect();
      };
    }

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [startAnimation]);

  // 清理动画
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      animationStartedRef.current = false;
    };
  }, []);

  const handleMouseEnter = useCallback(() => {
    isPausedRef.current = true;
  }, []);

  const handleMouseLeave = useCallback(() => {
    isPausedRef.current = false;
  }, []);

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
          { title: '已完成赛事', value: '0', suffix: '场', icon: <TrophyOutlined />, color: '#2563EB' },
          { title: '总跑里程', value: '0', suffix: '公里', icon: <ClockCircleOutlined />, color: '#10B981' },
          { title: '参赛城市', value: '0', suffix: '个', icon: <EnvironmentOutlined />, color: '#8B5CF6' },
          { title: '最佳配速', value: '0', suffix: '分/公里', icon: <ClockCircleOutlined />, color: '#F59E0B' },
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
        { title: '已完成赛事', value: totalEvents.toString(), suffix: '场', icon: <TrophyOutlined />, color: '#2563EB' },
        { title: '总跑里程', value: totalDistance.toFixed(1), suffix: '公里', icon: <ClockCircleOutlined />, color: '#10B981' },
        { title: '参赛城市', value: totalCities.toString(), suffix: '个', icon: <EnvironmentOutlined />, color: '#8B5CF6' },
        { title: '最佳配速', value: bestPaceFormatted, suffix: '分/公里', icon: <ClockCircleOutlined />, color: '#F59E0B' },
      ]);
    } catch (error) {
      console.error('获取统计数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      width: '100%', 
      minHeight: '100vh',
      background: 'var(--about-background)', /* #FAF9F6 - 极浅米白，充满整个屏幕 */
      padding: 0,
      margin: 0
    }}>
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
        <div className="page-preview about-page">
          {/* 个人简介卡片 - 完全按照Demo的样式 */}
          <Card className="preview-intro-card">
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
              <div style={{ 
                width: 80, 
                height: 80, 
                borderRadius: '50%', 
                background: 'linear-gradient(135deg, #2563EB 0%, #10B981 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 20,
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
                overflow: 'hidden',
                position: 'relative'
              }}>
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt="用户头像"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      position: 'absolute',
                      zIndex: 1
                    }}
                    onError={(e) => {
                      // 如果头像加载失败，显示默认图标
                      e.currentTarget.style.display = 'none';
                    }}
                  />
      ) : (
        <>
                    <div style={{
                      width: '100%',
                      height: '100%',
                      background: 'url(https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop) center/cover',
                      filter: 'brightness(0.9)',
                      position: 'absolute'
                    }} />
                    <div style={{
                      position: 'relative',
                      zIndex: 1,
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.3) 0%, rgba(16, 185, 129, 0.3) 100%)'
                    }}>
                      <UserOutlined style={{ fontSize: 40, color: '#FFFFFF' }} />
                    </div>
                  </>
                )}
              </div>
              <div>
                <h1 style={{ fontSize: 28, fontWeight: 600, color: '#1A1A1A', marginBottom: 8 }}>追光小慢侠</h1>
                <p style={{ color: '#666666', fontSize: 14 }}>马拉松爱好者 | 跑步教练</p>
              </div>
            </div>
            <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1A1A1A', marginBottom: 12 }}>关于我</h3>
              <p style={{ color: '#666666', lineHeight: 1.8, marginBottom: 12 }}>
                大家好！欢迎来到<strong style={{ color: '#2563EB' }}>追光小慢侠</strong>！我是一个热爱马拉松的跑者，通过这个应用展示我的跑步生涯和马拉松赛事记录。
              </p>
              <p style={{ color: '#666666', lineHeight: 1.8 }}>
                这里你可以看到我的赛事成绩、参赛地点分布以及完赛证书等信息。跑步不仅是我的爱好，更是我生活的一部分。
              </p>
            </div>
          </Card>

          {/* 数据概览 */}
          <div className="preview-stats-section">
            <h2>数据概览</h2>
            <Row gutter={[16, 16]}>
              {stats.map((stat, index) => (
                <Col xs={12} sm={6} key={index}>
                  <Card className="preview-stat-card">
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

          {/* 核心技能 */}
          <Card className="preview-skills-card" style={{ marginTop: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 600, color: '#1A1A1A', marginBottom: 24, paddingLeft: 8, borderLeft: '3px solid #2563EB' }}>核心技能</h2>
            <Row gutter={[24, 24]}>
              {skills.map((skill, index) => (
                <Col xs={24} sm={12} key={index}>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 16, color: '#1A1A1A', fontWeight: 500 }}>{skill.name}</span>
                      <span style={{ fontSize: 14, color: '#666666' }}>{skill.level}%</span>
                    </div>
                    <Progress 
                      percent={skill.level} 
                      strokeColor={{
                        '0%': '#2563EB',
                        '100%': '#10B981',
                      }}
                      showInfo={false}
                      strokeWidth={8}
                      style={{ borderRadius: 4 }}
                    />
                  </div>
                </Col>
              ))}
            </Row>
          </Card>

          {/* 精彩瞬间 - 轮播图 */}
          <Card className="preview-gallery-card" style={{ marginTop: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 600, color: '#1A1A1A', marginBottom: 24, paddingLeft: 8, borderLeft: '3px solid #2563EB' }}>精彩瞬间</h2>
            <div className="gallery-carousel-container">
              <Image.PreviewGroup>
                <div 
                  className="gallery-carousel-wrapper"
                  ref={galleryRef}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <div 
                    className="gallery-carousel-track" 
                    ref={trackRef}
                    style={{
                      // track宽度 = 组数 × 每组宽度
                      // 每组宽度 = 图片数 × 每张宽度（相对于wrapper）
                      // 每张图片占wrapper的25%（4张显示时），所以每组宽度 = imageCount × 25%wrapper
                      // track总宽度 = groupCount × (imageCount × 25%wrapper)
                      // 例如：3组 × (8张 × 25%) = 3 × 200% = 600%wrapper
                      width: carouselConfig.shouldCarousel 
                        ? `${carouselConfig.groupCount * (galleryImages.length * 25)}%` 
                        : '100%'
                    }}
                  >
                    {/* 动态渲染多组图片以实现无缝循环 */}
                    {Array.from({ length: carouselConfig.groupCount }, (_, groupIndex) => (
                      <React.Fragment key={`group-${groupIndex}`}>
                        {galleryImages.map((img, index) => (
                          <div 
                            key={`g${groupIndex + 1}-${img.id}-${index}`} 
                            className="gallery-carousel-item"
                            style={{
                              // 每张图片占wrapper的25%，但track宽度是600%wrapper
                              // 所以每张应该占track的 25% / 600% = 4.167%
                              // 或者更简单：每张占track的 1 / (groupCount * imageCount)
                              flex: `0 0 ${100 / (carouselConfig.groupCount * galleryImages.length)}%`,
                              width: `${100 / (carouselConfig.groupCount * galleryImages.length)}%`,
                              height: '250px' // 确保容器高度固定
                            }}
                          >
                            <Image
                              src={img.src}
                              alt={img.alt}
                              preview={{
                                src: img.original_url || img.src, // 预览时使用原始图片，如果没有则使用裁剪后的
                                mask: '点击预览'
                              }}
                              onClick={() => {
                                // 点击时的调试日志
                              }}
                              style={{
                                width: '100%',
                                height: '250px',
                                objectFit: 'cover', // 使用cover填充容器，避免上下空隙
                                borderRadius: 8,
                                cursor: 'pointer'
                              }}
                            />
                          </div>
                        ))}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </Image.PreviewGroup>
            </div>
          </Card>

          {/* 跑步历程 - 时间线 */}
          <Card className="preview-timeline-card" style={{ marginTop: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 600, color: '#1A1A1A', marginBottom: 24, paddingLeft: 8, borderLeft: '3px solid #2563EB' }}>跑步历程</h2>
            <div className="about-timeline">
              {[...timeline].sort((a, b) => parseInt(b.year) - parseInt(a.year)).map((item, index) => (
                <div key={index} className="timeline-item">
                  <div className="timeline-content">
                    <div className="timeline-year">{item.year}</div>
                    <div className="timeline-event">{item.event}</div>
                    <div className="timeline-desc">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
      </div>
    </div>
  );
};

export default Home;
