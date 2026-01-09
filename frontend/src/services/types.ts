// 马拉松赛事数据类型定义
export interface MarathonEvent {
  id: number;
  event_name: string;
  event_date: string;
  location: string;
  province: string;
  city: string;
  district: string;
  event_type: '5km' | '10km' | '15km' | 'half' | 'full';
  finish_time: string;
  pace: string;
  certificate: string | null;
  description: string;
  event_log: string;
  created_at?: string;
  updated_at?: string;
}

// 马拉松报名赛事数据类型定义
export interface MarathonRegistration {
  id: number;
  event_name: string;
  event_date: string;
  location: string;
  province: string;
  city: string;
  district: string;
  event_type: '5km' | '10km' | '15km' | 'half' | 'full';
  registration_status: 'preparing' | 'pending' | 'won' | 'lost' | 'abandoned';
  registration_date: string | null;
  registration_fee: number | null;
  draw_date: string | null;
  transport: 'booked' | 'not_booked' | 'local' | null;
  accommodation: 'booked' | 'not_booked' | 'local' | null;
  notes: string;
  created_at?: string;
  updated_at?: string;
}

// 管理员设置类型定义
export interface AdminSetting {
  id: number;
  admin_password: string;
  created_at?: string;
  updated_at?: string;
}

// API响应类型定义
export interface ApiResponse<T> {
  status: string;
  data: T;
  message?: string;
}

// 分页响应类型定义
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// 朋友圈媒体文件类型定义
export interface PostMedia {
  id: number;
  media_type: 'image' | 'live' | 'video';
  file: string;
  file_url: string;
  order: number;
  created_at: string;
}

// 朋友圈类型定义
export interface Post {
  id: number;
  content: string;
  is_pinned: boolean;
  tags: string;
  media: PostMedia[];
  media_count: number;
  created_at: string;
  created_at_formatted: string;
  updated_at: string;
}
