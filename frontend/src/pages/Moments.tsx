import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Image, Tag, Spin, Empty, Pagination, Modal, Button, Space } from 'antd';
import { PushpinOutlined, CalendarOutlined, AppstoreOutlined, UnorderedListOutlined } from '@ant-design/icons';
import Navigation from '../components/Common/Navigation';
import apiClient from '../services/axios';
import { Post, PaginatedResponse } from '../services/types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import '../styles/Moments.css';
import '../styles/commonAnimations.css';

dayjs.extend(relativeTime);

type ViewMode = 'card' | 'timeline';

const Moments: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const [playingStates, setPlayingStates] = useState<Record<number, boolean>>({});
  
  useEffect(() => {
    fetchPosts();
  }, [currentPage]);

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
        
        // 添加日志输出
        console.log('Fetched posts:', JSON.stringify(posts.map(post => ({
          id: post.id,
          content: post.content,
          media_count: post.media_count,
          media: post.media.map(m => ({
            id: m.id,
            media_type: m.media_type,
            file: m.file,
            video_file_url: m.video_file_url
          }))
        })), null, 2));
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
      
      // 添加日志输出
      console.log('Rendering media item:', JSON.stringify({
        id: item.id,
        media_type: item.media_type,
        file: item.file,
        video_file_url: item.video_file_url,
        has_video: !!item.video_file_url
      }, null, 2));
      
      if (item.media_type === 'video') {
        return (
          <div style={{ marginTop: 12, position: 'relative' }}>
            <video
              src={item.file}
              controls
              style={{ width: '100%', maxHeight: isTimeline ? 300 : 400, borderRadius: 8 }}
              playsInline
            />
          </div>
        );
      } else if (item.media_type === 'live') {
        const isPlaying = playingStates[item.id];
        
        return (
          <div style={{ marginTop: 12, position: 'relative', overflow: 'hidden', borderRadius: 8 }}>
            {isPlaying && item.video_file_url ? (
              <video
                src={item.video_file_url}
                autoPlay
                controls
                style={{ width: '100%', maxHeight: isTimeline ? 300 : 400, borderRadius: 8 }}
                playsInline
                onEnded={() => {
                  const newPlayingStates = { ...playingStates };
                  newPlayingStates[item.id] = false;
                  setPlayingStates(newPlayingStates);
                }}
              />
            ) : (
              <img
                src={item.file}
                alt="Live图"
                style={{ 
                  width: '100%', 
                  maxHeight: isTimeline ? 300 : 400, 
                  objectFit: 'cover', 
                  borderRadius: 8,
                  transition: 'opacity 0.3s ease',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  if (item.video_file_url) {
                    const newPlayingStates = { ...playingStates };
                    newPlayingStates[item.id] = true;
                    setPlayingStates(newPlayingStates);
                  }
                }}
                onTouchStart={() => {
                  if (item.video_file_url) {
                    const newPlayingStates = { ...playingStates };
                    newPlayingStates[item.id] = true;
                    setPlayingStates(newPlayingStates);
                  }
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
              {isPlaying ? 'PLAYING' : 'LIVE'}
            </div>
          </div>
        );
      } else {
        return (
          <div style={{ marginTop: 12 }}>
            <Image
              src={item.file}
              alt="朋友圈图片"
              style={{ width: '100%', maxHeight: isTimeline ? 300 : 400, objectFit: 'cover', borderRadius: 8 }}
              preview={{
                mask: '点击预览',
              }}
            />
          </div>
        );
      }
    }

    return (
      <div style={{ marginTop: 12 }}>
        <Row gutter={[8, 8]}>
          {media.map((item, index) => (
            <Col key={index} xs={8} sm={8} md={8}>
              {item.media_type === 'video' ? (
                <div style={{ position: 'relative' }}>
                  <video
                    src={item.file}
                    controls
                    style={{ width: '100%', aspectRatio: 1, objectFit: 'cover', borderRadius: 8 }}
                    playsInline
                  />
                </div>
              ) : item.media_type === 'live' ? (
                <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 8 }}>
                  <img
                    src={item.file}
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
                        video.src = item.video_file_url;
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
                  src={item.file}
                  alt={`朋友圈图片${index + 1}`}
                  style={{ width: '100%', aspectRatio: 1, objectFit: 'cover', borderRadius: 8 }}
                  preview={{
                    mask: '点击预览',
                  }}
                />
              )}
            </Col>
          ))}
        </Row>
      </div>
    );
  };

  const renderPostCard = (post: Post) => {
    return (
      <Card
        key={post.id}
        className="card-entrance hover-lift"
        style={{ marginBottom: 16 }}
        bodyStyle={{ padding: 16 }}
      >
        {post.is_pinned && (
          <div style={{ marginBottom: 8 }}>
            <Tag color="red" icon={<PushpinOutlined />}>
              置顶
            </Tag>
          </div>
        )}

        {post.content && (
          <div style={{ 
            fontSize: 16, 
            lineHeight: 1.6, 
            marginBottom: 12, 
            color: '#333',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}>
            {post.content}
          </div>
        )}

        {renderMedia(post.media, false)}

        {post.tags && post.tags.trim() !== '' && (
          <div style={{ marginTop: 12 }}>
            {post.tags.split(',').map((tag, index) => {
              const trimmedTag = tag.trim();
              return trimmedTag ? (
                <Tag key={index} color="blue" style={{ marginBottom: 4 }}>
                  #{trimmedTag}
                </Tag>
              ) : null;
            })}
          </div>
        )}

        <div style={{ marginTop: 12, color: '#999', fontSize: 14 }}>
          <CalendarOutlined style={{ marginRight: 4 }} />
          {dayjs(post.created_at).format('YYYY-MM-DD HH:mm')}
          <span style={{ marginLeft: 12 }}>
            {dayjs(post.created_at).fromNow()}
          </span>
        </div>
      </Card>
    );
  };

  const renderTimelineView = () => {
    const groupedPosts = posts.reduce((acc, post) => {
      const date = dayjs(post.created_at).format('YYYY-MM-DD');
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(post);
      return acc;
    }, {} as Record<string, Post[]>);

    const sortedDates = Object.keys(groupedPosts).sort((a, b) => 
      dayjs(b).valueOf() - dayjs(a).valueOf()
    );

    return (
      <div className="moments-timeline">
        {sortedDates.map((date) => (
          <div key={date} className="timeline-date-group">
            <div className="timeline-date-header">
              <div className="timeline-date-line" />
              <div className="timeline-date-label">
                {dayjs(date).format('YYYY年MM月DD日')}
                <span className="timeline-date-weekday">
                  {dayjs(date).format(' dddd')}
                </span>
              </div>
              <div className="timeline-date-line" />
            </div>
            <div className="timeline-posts">
              {groupedPosts[date].map((post) => (
                <div key={post.id} className="timeline-post">
                  <div className="timeline-post-line" />
                  <div className="timeline-post-content">
                    <Card
                      className="card-entrance"
                      style={{ marginBottom: 16 }}
                      bodyStyle={{ padding: 16 }}
                    >
                      {post.is_pinned && (
                        <div style={{ marginBottom: 8 }}>
                          <Tag color="red" icon={<PushpinOutlined />}>
                            置顶
                          </Tag>
                        </div>
                      )}

                      {post.content && (
                        <div style={{ 
                          fontSize: 15, 
                          lineHeight: 1.6, 
                          marginBottom: 12, 
                          color: '#333',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word'
                        }}>
                          {post.content}
                        </div>
                      )}

                      {renderMedia(post.media, true)}

                      {post.tags && post.tags.trim() !== '' && (
                        <div style={{ marginTop: 12 }}>
                          {post.tags.split(',').map((tag, index) => {
                            const trimmedTag = tag.trim();
                            return trimmedTag ? (
                              <Tag key={index} color="blue" style={{ marginBottom: 4 }}>
                                #{trimmedTag}
                              </Tag>
                            ) : null;
                          })}
                        </div>
                      )}

                      <div style={{ marginTop: 12, color: '#999', fontSize: 13 }}>
                        <CalendarOutlined style={{ marginRight: 4 }} />
                        {dayjs(post.created_at).format('HH:mm')}
                        <span style={{ marginLeft: 12 }}>
                          {dayjs(post.created_at).fromNow()}
                        </span>
                      </div>
                    </Card>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="moments-container page-container">
      <Navigation />

      <div className="moments-view-switcher">
        <Space>
          <Button
            type={viewMode === 'card' ? 'primary' : 'default'}
            icon={<AppstoreOutlined />}
            onClick={() => setViewMode('card')}
            size="small"
          >
            <span className="view-switcher-text">卡片</span>
          </Button>
          <Button
            type={viewMode === 'timeline' ? 'primary' : 'default'}
            icon={<UnorderedListOutlined />}
            onClick={() => setViewMode('timeline')}
            size="small"
          >
            <span className="view-switcher-text">时间线</span>
          </Button>
        </Space>
      </div>

      <div className="moments-content">
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
            {viewMode === 'card' ? (
              posts.map(post => renderPostCard(post))
            ) : (
              renderTimelineView()
            )}

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
    </div>
  );
};

export default Moments;
