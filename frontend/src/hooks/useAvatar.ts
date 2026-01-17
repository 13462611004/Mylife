/**
 * 头像管理Hook
 * 提供统一的头像获取和管理功能
 */

import { useState, useEffect } from 'react';
import apiClient from '../services/axios';
import { AdminSetting } from '../services/types';
import { normalizeUrl, extractBaseURL } from '../utils/urlUtils';

/**
 * 使用头像Hook
 * @returns 头像URL和加载状态
 */
export const useAvatar = () => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchAvatar = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const adminSettings = await apiClient.get<AdminSetting>('/api/admin/settings/');
      const avatar = (adminSettings as any).avatar || (adminSettings as any).avatar_url;
      
      if (avatar) {
        // 如果avatar是相对路径，转换为绝对路径
        const normalizedUrl = normalizeUrl(avatar);
        setAvatarUrl(normalizedUrl);
      } else {
        setAvatarUrl(null);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('获取头像失败');
      setError(error);
      setAvatarUrl(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvatar();
  }, []);

  return { avatarUrl, loading, error, refetch: fetchAvatar };
};
