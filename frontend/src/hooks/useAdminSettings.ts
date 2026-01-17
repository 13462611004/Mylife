/**
 * 管理员设置Hook
 * 提供统一的管理员设置获取功能
 */

import { useState, useEffect } from 'react';
import apiClient from '../services/axios';
import { AdminSetting } from '../services/types';
import { normalizeUrl, extractBaseURL } from '../utils/urlUtils';

interface CarouselImage {
  id?: number;
  src: string;
  original_url?: string;
  alt?: string;
}

interface FormattedCarouselImage {
  id: number;
  src: string;
  original_url?: string;
  alt: string;
}

/**
 * 使用管理员设置Hook
 * @returns 管理员设置数据
 */
export const useAdminSettings = () => {
  const [adminSettings, setAdminSettings] = useState<AdminSetting | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [carouselImages, setCarouselImages] = useState<FormattedCarouselImage[]>([]);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const settings = await apiClient.get<AdminSetting>('/api/admin/settings/');
      setAdminSettings(settings);
      
      // 处理轮播图
      const rawCarouselImages = settings.carousel_images || [];
      if (Array.isArray(rawCarouselImages) && rawCarouselImages.length > 0) {
        const formatted: FormattedCarouselImage[] = rawCarouselImages.map((item: any, index: number) => {
          const imageUrl = typeof item === 'string' ? item : (item.url || item.src || item);
          let originalUrl = typeof item === 'object' && item.original_url ? item.original_url : null;
          
          // 如果original_url是相对路径，转换为绝对路径
          if (originalUrl && originalUrl.startsWith('/')) {
            const baseURL = extractBaseURL(imageUrl);
            originalUrl = `${baseURL}${originalUrl}`;
          }
          
          const altText = typeof item === 'object' && item.alt ? item.alt : `图片${index + 1}`;
          
          return {
            id: index + 1,
            src: imageUrl,
            original_url: originalUrl || undefined,
            alt: altText
          };
        });
        setCarouselImages(formatted);
      } else {
        setCarouselImages([]);
      }
      
      // 处理头像
      const avatar = (settings as any).avatar || (settings as any).avatar_url;
      if (avatar) {
        const normalizedUrl = normalizeUrl(avatar);
        setAvatarUrl(normalizedUrl);
      } else {
        setAvatarUrl(null);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('获取管理员设置失败');
      setError(error);
      setAdminSettings(null);
      setCarouselImages([]);
      setAvatarUrl(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    adminSettings,
    carouselImages,
    avatarUrl,
    loading,
    error,
    refetch: fetchSettings
  };
};
