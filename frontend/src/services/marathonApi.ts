import apiClient from './axios';
import { MarathonEvent, PaginatedResponse } from './types';

// 获取所有马拉松赛事
export const getAllMarathons = async (): Promise<MarathonEvent[]> => {
  try {
    // 直接返回赛事列表，因为响应拦截器已经处理了response.data
    return await apiClient.get<MarathonEvent[]>('/marathon/');
  } catch (error) {
    console.error('获取马拉松赛事失败:', error);
    throw error;
  }
};

// 获取单个马拉松赛事详情
export const getMarathonById = async (id: number): Promise<MarathonEvent> => {
  try {
    const data = await apiClient.get<MarathonEvent>(`/marathon/${id}/`);
    return data;
  } catch (error) {
    console.error(`获取ID为${id}的马拉松赛事失败:`, error);
    throw error;
  }
};

// 创建新的马拉松赛事
export const createMarathon = async (marathonData: Omit<MarathonEvent, 'id'>): Promise<MarathonEvent> => {
  try {
    const data = await apiClient.post<MarathonEvent>('/marathon/', marathonData);
    return data;
  } catch (error) {
    console.error('创建马拉松赛事失败:', error);
    throw error;
  }
};

// 更新马拉松赛事
export const updateMarathon = async (id: number, marathonData: Partial<MarathonEvent>): Promise<MarathonEvent> => {
  try {
    const data = await apiClient.put<MarathonEvent>(`/marathon/${id}/`, marathonData);
    return data;
  } catch (error) {
    console.error(`更新ID为${id}的马拉松赛事失败:`, error);
    throw error;
  }
};

// 删除马拉松赛事
export const deleteMarathon = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`/marathon/${id}/`);
  } catch (error) {
    console.error(`删除ID为${id}的马拉松赛事失败:`, error);
    throw error;
  }
};

// 上传完赛证书
export const uploadCertificate = async (id: number, file: File): Promise<MarathonEvent> => {
  try {
    const formData = new FormData();
    formData.append('certificate', file);
    
    const data = await apiClient.post<MarathonEvent>(`/marathon/${id}/upload-certificate/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return data;
  } catch (error) {
    console.error(`上传ID为${id}的马拉松赛事证书失败:`, error);
    throw error;
  }
};
