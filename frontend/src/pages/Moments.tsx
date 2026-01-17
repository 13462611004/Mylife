import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Image, Tag, Spin, Empty, Pagination, Modal, Button, Drawer, Dropdown, Slider } from 'antd';
import { PushpinOutlined, CalendarOutlined, CaretDownOutlined, PauseOutlined, CaretRightOutlined, UserOutlined } from '@ant-design/icons';
import Navigation from '../components/Common/Navigation';
import apiClient from '../services/axios';
import { Post, PaginatedResponse } from '../services/types';
import { useAvatar } from '../hooks/useAvatar';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import '../styles/Moments.css';
import '../styles/commonAnimations.css';

dayjs.extend(relativeTime);

type SeasonType = 'spring' | 'summer' | 'autumn' | 'winter';

// 转换图片URL为当前环境可访问的URL
const normalizeMediaUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;
  
  // 检测当前环境
  const currentHost = window.location.hostname;
  const currentPort = window.location.port;
  const currentProtocol = window.location.protocol;
  const isTestEnv = currentHost === 'localhost' || currentHost === '127.0.0.1';
  const isProductionEnv = currentHost === 'xiaomanxia.com' || currentHost === 'www.xiaomanxia.com';
  
  // 如果已经是完整URL
  if (url.startsWith('http')) {
    try {
      const urlObj = new URL(url);
      
      // 测试环境：将生产环境URL或8000端口URL转换为测试环境URL
      if (isTestEnv && (currentPort === '3001' || currentPort === '3000' || currentPort === '')) {
        // 处理生产环境URL (xiaomanxia.com)
        if (urlObj.hostname === 'xiaomanxia.com' || urlObj.hostname === 'www.xiaomanxia.com') {
          return `http://localhost:8000${urlObj.pathname}`;
        }
        // 处理8000端口URL（测试环境可能需要8001）
        if (urlObj.port === '8000' || urlObj.hostname === 'localhost' && urlObj.port === '8000') {
          // 保持 localhost:8000，或根据需要改为 8001
          return url;
        }
      }
      
      // 生产环境：确保使用 HTTPS 和正确的域名
      if (isProductionEnv) {
        // 生产环境强制使用 HTTPS
        if (urlObj.protocol === 'http:') {
          urlObj.protocol = 'https:';
          urlObj.port = '';
          // 如果域名是 xiaomanxia.com 相关，使用当前访问的域名
          if (urlObj.hostname === 'xiaomanxia.com' || urlObj.hostname === 'www.xiaomanxia.com' || urlObj.hostname === 'api.xiaomanxia.com') {
            urlObj.hostname = currentHost;
          }
          return urlObj.toString();
        }
        // 处理无法解析的域名（如 api.xiaomanxia.com）
        if (urlObj.hostname === 'api.xiaomanxia.com' || urlObj.hostname === 'localhost' || urlObj.hostname === '127.0.0.1') {
          urlObj.protocol = 'https:';
          urlObj.hostname = currentHost;
          urlObj.port = '';
          return urlObj.toString();
        }
        // 如果已经是正确的HTTPS URL，直接返回
        if (urlObj.protocol === 'https:' && (urlObj.hostname === currentHost || urlObj.hostname === 'xiaomanxia.com' || urlObj.hostname === 'www.xiaomanxia.com')) {
          return url;
        }
      }
      
      // 其他情况直接返回
      return url;
    } catch {
      // URL解析失败，尝试简单处理
      // 如果是生产环境，尝试转换为HTTPS
      if (isProductionEnv && url.startsWith('http://')) {
        const pathname = url.replace(/^https?:\/\/[^/]+/, '');
        return `https://${currentHost}${pathname}`;
      }
      return url;
    }
  }
  
  // 相对路径：根据环境拼接baseURL
  const path = url.startsWith('/') ? url : `/${url}`;
  
  if (isTestEnv) {
    return `http://localhost:8000${path}`;
  }
  
  // 生产环境使用当前协议和域名
  return `${currentProtocol}//${currentHost}${path}`;
};

// 根据日期判断季节
const getSeason = (dateString: string): SeasonType => {
  const date = new Date(dateString);
  const month = date.getMonth() + 1; // 0-11 -> 1-12
  if (month >= 3 && month <= 5) return 'spring'; // 3-5月：春季
  if (month >= 6 && month <= 8) return 'summer'; // 6-8月：夏季
  if (month >= 9 && month <= 11) return 'autumn'; // 9-11月：秋季
  return 'winter'; // 12-2月：冬季
};

// 季节配置 - 完全按照Demo的配置
const seasonConfig = {
  spring: {
    icon: '🌸',
    color: '#FCE7F3',
    borderColor: '#F9A8D4',
    accentColor: '#EC4899',
    gradient: 'linear-gradient(135deg, #FCE7F3 0%, #F0FDF4 100%)',
    emoji: ['🌸', '🌿', '💐', '🌺', '🌷', '🌼', '🦋', '🍀', '🌱', '🌻'],
    smallEmoji: ['🌿', '💐', '🌷', '🌼', '🍀'],
    bgPattern: '🌸🌿💐🌺'
  },
  summer: {
    icon: '☀️',
    color: '#ECFDF5',
    borderColor: '#34D399',
    accentColor: '#10B981',
    gradient: 'linear-gradient(135deg, #ECFDF5 0%, #DBEAFE 100%)',
    emoji: ['☀️', '🌿', '🌊', '🌻', '🌺', '🌴', '🏖️', '🌞', '🦋', '🌾'],
    smallEmoji: ['🌿', '🌊', '🌻', '🌺', '🌴'],
    bgPattern: '☀️🌿🌊🌻'
  },
  autumn: {
    icon: '🍂',
    color: '#FFF7ED',
    borderColor: '#FB923C',
    accentColor: '#F97316',
    gradient: 'linear-gradient(135deg, #FFF7ED 0%, #FEF3C7 100%)',
    emoji: ['🍂', '🍁', '🍃', '🌾', '🌰', '🍊', '🍎', '🍇', '🌻', '🍄'],
    smallEmoji: ['🍂', '🍁', '🍃', '🌾', '🌰'],
    bgPattern: '🍂🍁🍃🌾'
  },
  winter: {
    icon: '❄️',
    color: '#F0F9FF',
    borderColor: '#93C5FD',
    accentColor: '#3B82F6',
    gradient: 'linear-gradient(135deg, #F0F9FF 0%, #E0E7FF 100%)',
    emoji: ['❄️', '⛄', '🌨️', '🧊', '🌲', '🎄', '☃️', '🔔', '🧣', '⛸️'],
    smallEmoji: ['❄️', '⛄', '🌨️', '🧊', '🌲'],
    bgPattern: '❄️⛄🌨️🧊'
  }
};

// 获取当前主要季节（用于页面背景装饰）
const getCurrentSeason = (): SeasonType => {
  return getSeason(new Date().toISOString().split('T')[0]);
};

const Moments: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [playingStates, setPlayingStates] = useState<Record<number, boolean>>({});
  const [previewMedia, setPreviewMedia] = useState<any>(null);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [rateDrawerOpen, setRateDrawerOpen] = useState(false);
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  
  // 使用头像Hook
  const { avatarUrl } = useAvatar();

  useEffect(() => {
    fetchPosts();
  }, [currentPage]);

  // 格式化时间
  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 应用音量变化
  useEffect(() => {
    if (videoRef) {
      videoRef.volume = volume;
    }
  }, [volume, videoRef]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: currentPage,
        page_size: pageSize,
      };

      const response: PaginatedResponse<Post> | Post[] = await apiClient.get('/api/moments/posts/', { params });
      
      if (response && typeof response === 'object' && 'results' in response) {
        const paginatedResponse = response as PaginatedResponse<Post>;
        const posts = Array.isArray(paginatedResponse.results) ? paginatedResponse.results : [];
        setPosts(posts);
        setTotalCount(paginatedResponse.count || 0);
      } else if (Array.isArray(response)) {
        setPosts(response);
        setTotalCount(response.length);
      } else {
        setPosts([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error('获取朋友圈数据失败:', error);
      setPosts([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const renderMedia = (media: any[], isTimeline: boolean = false) => {
    if (!media || !Array.isArray(media) || media.length === 0) return null;

    if (media.length === 1) {
      const item = media[0];
      
      if (item.media_type === 'video') {
        const videoUrl = normalizeMediaUrl(item.file_url || item.file);
        if (!videoUrl || videoUrl === '') {
                // 视频URL为空，跳过渲染
          return null;
        }
        
        return (
          <div style={{ marginTop: 12, position: 'relative' }}>
            <video
              src={videoUrl}
              controls
              style={{ width: '100%', maxHeight: isTimeline ? 300 : 400, borderRadius: 8 }}
              playsInline
              preload="metadata"
              onError={(e) => {
                const target = e.target as HTMLVideoElement;
                // 视频加载失败，隐藏视频元素
                // 隐藏无法加载的视频
                target.style.display = 'none';
              }}
              onLoadedMetadata={(e) => {
                // 视频元数据加载成功
                const target = e.target as HTMLVideoElement;
                target.style.display = 'block';
              }}
            />
          </div>
        );
      } else if (item.media_type === 'live') {
        const isPlaying = playingStates[item.id];
        const isPreviewing = previewMedia?.id === item.id;
        
        return (
          <div 
            style={{ 
              marginTop: 12, 
              position: 'relative', 
              overflow: 'hidden', 
              borderRadius: 8,
              cursor: item.video_file_url ? 'pointer' : 'default'
            }}
            onMouseEnter={() => {
              if (item.video_file_url && !isPreviewing) {
                const newPlayingStates = { ...playingStates };
                newPlayingStates[item.id] = true;
                setPlayingStates(newPlayingStates);
              }
            }}
            onMouseLeave={() => {
              if (item.video_file_url && !isPreviewing) {
                const newPlayingStates = { ...playingStates };
                newPlayingStates[item.id] = false;
                setPlayingStates(newPlayingStates);
              }
            }}
            onClick={() => {
              if (item.video_file_url) {
                // 停止自动播放
                const newPlayingStates = { ...playingStates };
                newPlayingStates[item.id] = false;
                setPlayingStates(newPlayingStates);
                // 进入预览模式
                setPreviewMedia(item);
              }
            }}
          >
            {(isPlaying || isPreviewing) && item.video_file_url ? (() => {
              const liveVideoUrl = normalizeMediaUrl(item.video_file_url);
              if (!liveVideoUrl || liveVideoUrl === '') {
                    // Live视频URL为空，跳过渲染
                return null;
              }
              return (
                <video
                  src={liveVideoUrl}
                  autoPlay={!isPreviewing}
                  muted={!isPreviewing}
                  controls={isPreviewing}
                  style={{ 
                    width: '100%', 
                    maxHeight: isTimeline ? 300 : 400, 
                    borderRadius: 8,
                    display: 'block'
                  }}
                  playsInline
                  preload="metadata"
                  onError={(e) => {
                    const target = e.target as HTMLVideoElement;
                    // Live视频加载失败，隐藏视频元素
                    target.style.display = 'none';
                  }}
                  onEnded={() => {
                    if (!isPreviewing) {
                      const newPlayingStates = { ...playingStates };
                      newPlayingStates[item.id] = false;
                      setPlayingStates(newPlayingStates);
                    }
                  }}
                />
              );
            })() : (
              <img
                src={normalizeMediaUrl(item.file_url || item.file) || ''}
                alt="Live图"
                style={{ 
                  width: '100%', 
                  maxHeight: isTimeline ? 300 : 400, 
                  objectFit: 'cover', 
                  borderRadius: 8,
                  transition: 'opacity 0.3s ease'
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  const imageUrl = normalizeMediaUrl(item.file_url || item.file);
                  // Live图片加载失败
                  
                  // 如果仍然失败，显示占位图
                  target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23f0f0f0' width='200' height='200'/%3E%3Ctext fill='%23999' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3E图片加载失败%3C/text%3E%3C/svg%3E`;
                  target.style.display = 'block';
                }}
              />
            )}
            <div style={{
              position: 'absolute',
              top: 8,
              right: 8,
              background: 'rgba(0, 0, 0, 0.6)',
              color: '#fff',
              padding: '4px 8px',
              borderRadius: 4,
              fontSize: 12,
              fontWeight: 'bold',
              zIndex: 1
            }}>
              {isPreviewing ? 'PREVIEW' : (isPlaying ? 'PLAYING' : 'LIVE')}
            </div>
          </div>
        );
      } else {
        // 转换图片URL为当前环境可访问的URL
        const imageUrl = normalizeMediaUrl(item.file_url || item.file);
        if (!imageUrl) {
          // 图片URL为空，跳过渲染
          return null;
        }
        
        return (
          <div style={{ marginTop: 12 }}>
            <Image
              src={imageUrl}
              alt="朋友圈图片"
              style={{ width: '100%', maxHeight: isTimeline ? 300 : 600, objectFit: 'contain', borderRadius: 8 }}
              preview={{
                mask: '点击预览',
              }}
              fallback="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23f0f0f0' width='200' height='200'/%3E%3Ctext fill='%23999' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3E图片加载失败%3C/text%3E%3C/svg%3E"
              onError={(e) => {
                // 图片加载失败
                // Image组件会自动使用fallback，这里只是记录日志
              }}
            />
          </div>
        );
      }
    }

    return (
      <div style={{ marginTop: 12 }}>
        <Row gutter={[8, 8]}>
          {media.map((item, index) => {
            // 转换媒体URL为当前环境可访问的URL
            const mediaUrl = normalizeMediaUrl(item.file_url || item.file);
            if (!mediaUrl) {
              // 媒体URL为空，跳过渲染
              return null;
            }
            
            return (
              <Col key={index} xs={8} sm={8} md={8}>
                {item.media_type === 'video' ? (
                  <div style={{ position: 'relative' }}>
                    <video
                      src={mediaUrl}
                      controls
                      style={{ width: '100%', aspectRatio: 1, objectFit: 'cover', borderRadius: 8 }}
                      playsInline
                    />
                  </div>
                ) : item.media_type === 'live' ? (
                  <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 8 }}>
                    <img
                      src={mediaUrl}
                    alt={`Live图${index + 1}`}
                    style={{ 
                      width: '100%', 
                      aspectRatio: 1, 
                      objectFit: 'cover', 
                      borderRadius: 8,
                      transition: 'opacity 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      if (item.video_file_url) {
                        const img = e.currentTarget;
                        img.style.opacity = '0';
                        const video = document.createElement('video');
                        video.src = normalizeMediaUrl(item.video_file_url) || item.video_file_url;
                        video.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;border-radius:8px;';
                        video.autoplay = true;
                        video.muted = true;
                        video.loop = true;
                        video.playsInline = true;
                        img.parentElement?.appendChild(video);
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (item.video_file_url) {
                        const img = e.currentTarget;
                        img.style.opacity = '1';
                        const video = img.parentElement?.querySelector('video');
                        if (video) {
                          video.remove();
                        }
                      }
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    background: 'rgba(0, 0, 0, 0.6)',
                    color: '#fff',
                    padding: '2px 6px',
                    borderRadius: 4,
                    fontSize: 10,
                    fontWeight: 'bold',
                    zIndex: 1
                  }}>
                    LIVE
                  </div>
                </div>
              ) : (
                <Image
                  src={mediaUrl}
                  alt={`朋友圈图片${index + 1}`}
                  style={{ width: '100%', aspectRatio: 1, objectFit: 'cover', borderRadius: 8 }}
                  preview={{
                    mask: '点击预览',
                  }}
                  fallback="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23ddd' width='100' height='100'/%3E%3Ctext fill='%23999' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3E图片加载失败%3C/text%3E%3C/svg%3E"
                />
              )}
              </Col>
            );
          })}
        </Row>
      </div>
    );
  };

  const renderPostCard = (post: Post) => {
    const season: SeasonType = getSeason(post.created_at);
    const config = seasonConfig[season];
    
    return (
      <Card
        key={post.id}
        className={`moments-post-card ${post.is_pinned ? 'pinned' : ''}`}
        style={{
          borderLeft: `3px solid ${config.borderColor}`,
          position: 'relative',
          overflow: 'visible',
          marginBottom: 16
        }}
        bodyStyle={{ padding: 16 }}
      >
        {/* 季节装饰图标 - 右上角（多个小图标） */}
        <div style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          display: 'flex',
          gap: '4px',
          zIndex: 1,
          opacity: 0.35
        }}>
          {config.emoji.slice(0, 3).map((emoji, idx) => (
            <span
              key={idx}
              style={{
                fontSize: idx === 0 ? '20px' : '16px',
                animation: `float ${3 + idx * 0.5}s ease-in-out infinite`,
                animationDelay: `${idx * 0.3}s`,
                transform: `rotate(${idx * 15}deg)`
              }}
            >
              {emoji}
            </span>
          ))}
        </div>
        
        {/* 左下角小装饰 */}
        <div style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          fontSize: '14px',
          opacity: 0.25,
          zIndex: 1
        }}>
          {config.smallEmoji[Math.floor(Math.random() * config.smallEmoji.length)]}
        </div>

        {post.is_pinned && (
          <Tag 
            className="pinned-tag" 
            style={{ 
              background: config.gradient,
              color: config.accentColor, 
              border: `1px solid ${config.borderColor}`,
              fontWeight: 500,
              marginBottom: 8
            }}
          >
            {config.icon} 置顶
          </Tag>
        )}

        {/* 用户信息 - 带季节头像装饰 */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: config.gradient,
            border: `2px solid ${config.borderColor}40`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
            boxShadow: `0 2px 8px ${config.borderColor}30`,
            overflow: 'hidden',
            position: 'relative'
          }}>
            {/* 头像内部季节图标 */}
            <div style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              fontSize: '20px',
              opacity: 0.4,
              transform: 'rotate(15deg)',
              zIndex: 2
            }}>
              {config.emoji[Math.floor(Math.random() * 3)]}
            </div>
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
                  // 头像加载失败，显示默认图标
                  // 如果头像加载失败，显示默认图标
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <UserOutlined style={{ 
                fontSize: 24, 
                color: '#6B7280',
                position: 'relative',
                zIndex: 1
              }} />
            )}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 500, color: '#1A1A1A', marginBottom: 4 }}>追光小慢侠</div>
            <div style={{ 
              fontSize: 12, 
              color: config.accentColor,
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <span>{config.icon}</span>
              <CalendarOutlined style={{ marginRight: 4 }} /> 
              {dayjs(post.created_at).format('YYYY-MM-DD HH:mm')}
              <span style={{ opacity: 0.5 }}>
                {config.smallEmoji[Math.floor(Math.random() * 2)]}
              </span>
            </div>
          </div>
        </div>

        {/* 内容 - 带季节装饰线 */}
        {post.content && (
          <div className="post-content" style={{ 
            position: 'relative', 
            paddingLeft: '12px',
            fontSize: 16, 
            lineHeight: 1.8, 
            marginBottom: 12, 
            color: '#2D2D2D',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}>
            {/* 内容左侧季节装饰线 */}
            <div style={{
              position: 'absolute',
              left: '0',
              top: '0',
              bottom: '0',
              width: '3px',
              background: config.gradient,
              borderRadius: '2px',
              opacity: 0.3
            }} />
            {post.content}
            
            {/* 内容末尾小装饰 */}
            <span style={{
              marginLeft: '8px',
              fontSize: '16px',
              opacity: 0.4
            }}>
              {config.emoji[Math.floor(Math.random() * config.emoji.length)]}
            </span>
          </div>
        )}

        {renderMedia(post.media, false)}

        {/* 标签 - 使用季节主题色 */}
        {post.tags && post.tags.trim() !== '' && (
          <div className="post-tags" style={{ marginTop: 16 }}>
            {post.tags.split(',').map((tag, index) => {
              const trimmedTag = tag.trim();
              return trimmedTag ? (
                <Tag 
                  key={index} 
                  style={{ 
                    background: config.color, 
                    color: config.accentColor, 
                    border: `1px solid ${config.borderColor}`,
                    borderRadius: 12,
                    padding: '4px 12px',
                    fontWeight: 500,
                    marginBottom: 4
                  }}
                >
                  {config.emoji[0]} #{trimmedTag}
                </Tag>
              ) : null;
            })}
          </div>
        )}
      </Card>
    );
  };

  const currentSeason: SeasonType = getCurrentSeason();

  return (
    <div style={{ 
      width: '100%', 
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${seasonConfig[currentSeason].color}20 0%, #FEFDFB 100%)`, /* 充满整个屏幕的背景 */
      padding: 0,
      margin: 0
    }}>
      <div className="moments-container page-container">
        <Navigation />

        {/* 页面背景季节性装饰 */}
        <div 
          className="page-preview moments-page"
          style={{
            position: 'relative',
            background: `linear-gradient(135deg, ${seasonConfig[currentSeason].color}20 0%, #FEFDFB 100%)`
          }}
        >
        {/* 背景季节性装饰图案 */}
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          fontSize: '120px',
          opacity: 0.05,
          zIndex: 0,
          pointerEvents: 'none',
          lineHeight: 1,
          fontFamily: 'Arial, sans-serif'
        }}>
          {seasonConfig[currentSeason].bgPattern}
        </div>
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          fontSize: '100px',
          opacity: 0.04,
          zIndex: 0,
          pointerEvents: 'none',
          lineHeight: 1,
          fontFamily: 'Arial, sans-serif'
        }}>
          {seasonConfig[currentSeason].emoji.slice(0, 3).join('')}
        </div>

      {/* 页面标题 - 带季节装饰 */}
      <div className="moments-header" style={{ position: 'relative', zIndex: 1, textAlign: 'center', marginBottom: 24 }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          gap: '12px',
          marginBottom: '8px'
        }}>
          <span style={{ fontSize: '32px', opacity: 0.6 }}>
            {seasonConfig[currentSeason].emoji[0]}
          </span>
          <h1>春夏秋冬</h1>
          <span style={{ fontSize: '32px', opacity: 0.6 }}>
            {seasonConfig[currentSeason].emoji[1]}
          </span>
        </div>
        <p className="subtitle">记录生活的每一个瞬间</p>
        
        {/* 标题下方季节小图标装饰 */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '8px',
          marginTop: '12px',
          opacity: 0.4
        }}>
          {seasonConfig[currentSeason].smallEmoji.map((emoji, idx) => (
            <span 
              key={idx}
              style={{
                fontSize: '16px',
                animation: `float ${3 + idx * 0.5}s ease-in-out infinite`,
                animationDelay: `${idx * 0.2}s`
              }}
            >
              {emoji}
            </span>
          ))}
        </div>
      </div>

      <div className="moments-content" style={{ position: 'relative', zIndex: 1 }}>
        {loading ? (
          <div className="moments-loading">
            <Spin size="large" />
          </div>
        ) : posts.length === 0 ? (
          <Card>
            <Empty description="暂无朋友圈内容" />
          </Card>
        ) : (
          <>
            {posts.map(post => renderPostCard(post))}

            {totalCount > 0 && (
              <div className="moments-pagination">
                <Pagination
                  current={currentPage}
                  pageSize={pageSize}
                  total={totalCount}
                  onChange={(page) => setCurrentPage(page)}
                  showSizeChanger={false}
                  showQuickJumper
                />
              </div>
            )}
          </>
        )}
      </div>

      <Modal
        open={previewVisible}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        width="80%"
        style={{ top: 20 }}
      >
        <Image
          src={previewImage}
          alt="预览图片"
          style={{ width: '100%' }}
          preview={false}
        />
      </Modal>

      {/* Live Photo 预览模态框 */}
      <Modal
        open={!!previewMedia}
        footer={null}
        onCancel={() => {
          setPreviewMedia(null);
          setPlaybackRate(1);
        }}
        width="90%"
        style={{ top: 20 }}
        title={previewMedia?.file ? 'LIVE Photo 预览' : undefined}
        styles={{ body: { padding: 0, background: '#000' } }}
        closable={true}
      >
        {previewMedia && previewMedia.video_file_url && (() => {
          const previewVideoUrl = normalizeMediaUrl(previewMedia.video_file_url);
          if (!previewVideoUrl || previewVideoUrl === '') {
            // 预览视频URL为空
            return null;
          }
          return (
            <div style={{ position: 'relative', background: '#000' }}>
              <video
                ref={(el: HTMLVideoElement | null) => {
                  if (el) {
                    setVideoRef(el);
                    el.playbackRate = playbackRate;
                  }
                }}
                src={previewVideoUrl}
                autoPlay
                style={{ 
                  width: '100%', 
                  maxHeight: '70vh',
                  display: 'block'
                }}
                playsInline
                preload="metadata"
                onError={(e) => {
                  const target = e.target as HTMLVideoElement;
                  // 预览视频加载失败
                  target.style.display = 'none';
                }}
                onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
            
              {/* 自定义控制栏 */}
              <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
              padding: '20px 16px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 16
            }}>
              {/* 播放/暂停 */}
              <Button
                type="text"
                icon={isPlaying ? <PauseOutlined /> : <CaretRightOutlined />}
                onClick={() => videoRef?.paused ? videoRef.play() : videoRef?.pause()}
                style={{ color: '#fff', fontSize: 20 }}
              />
              
              {/* 时间进度 */}
              <span style={{ color: '#fff', fontSize: 12, minWidth: 100 }}>
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
              
              {/* 进度条 */}
              <div style={{ flex: 1, cursor: 'pointer' }}>
                <div style={{ 
                  width: '100%', 
                  height: 4, 
                  background: 'rgba(255,255,255,0.3)',
                  borderRadius: 2,
                  overflow: 'hidden'
                }}>
                  <div style={{ 
                    width: `${duration ? (currentTime / duration) * 100 : 0}%`,
                    height: '100%',
                    background: '#1890ff',
                    transition: 'width 0.1s'
                  }} />
                </div>
              </div>
              
              {/* 音量控制 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Slider
                  min={0}
                  max={1}
                  step={0.1}
                  value={volume}
                  onChange={setVolume}
                  style={{ width: 80 }}
                  tooltip={{ formatter: null }}
                />
              </div>
              
              {/* 倍速选择器 */}
              <Dropdown
                overlay={
                  <div style={{
                    background: 'rgba(0,0,0,0.9)',
                    borderRadius: 8,
                    padding: '8px 0',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                  }}>
                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                      <div
                        key={rate}
                        onClick={() => {
                          setPlaybackRate(rate);
                          if (videoRef) videoRef.playbackRate = rate;
                        }}
                        style={{
                          padding: '8px 20px',
                          color: playbackRate === rate ? '#1890ff' : '#fff',
                          cursor: 'pointer',
                          fontWeight: playbackRate === rate ? 'bold' : 'normal',
                          textAlign: 'center'
                        }}
                      >
                        {rate}x
                      </div>
                    ))}
                  </div>
                }
                trigger={['click']}
                placement="topRight"
              >
                <Button
                  type="text"
                  style={{ color: '#fff', fontSize: 12 }}
                >
                  {playbackRate}x <CaretDownOutlined />
                </Button>
              </Dropdown>
              </div>
            </div>
          );
        })()}
        {previewMedia && previewMedia.file && !previewMedia.video_file_url && (
          <Image
            src={previewMedia.file_url || previewMedia.file}
            alt="预览图片"
            style={{ width: '100%' }}
            preview={false}
          />
        )}
      </Modal>
      </div>
      </div>
    </div>
  );
};

export default Moments;
