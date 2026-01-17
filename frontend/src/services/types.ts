// 马拉松赛事数据类型定义（与后端Marathon模型字段保持一致）
export interface MarathonEvent {
  id: number;
  event_name: string;
  event_date: string; // DateField序列化为string
  location: string;
  province: string; // CharField(blank=True)，可能为空字符串
  city: string; // CharField(blank=True)，可能为空字符串
  district: string; // CharField(blank=True)，可能为空字符串
  event_type: '5km' | '10km' | '15km' | 'half' | 'full'; // CharField with choices
  finish_time: string; // CharField
  pace: string; // CharField
  certificate: string | null; // ImageField(blank=True, null=True)
  description: string; // TextField(blank=True)，可能为空字符串
  event_log: string; // TextField(blank=True)，可能为空字符串
  created_at?: string; // DateTimeField(auto_now_add=True)
  updated_at?: string; // DateTimeField(auto_now=True)
}

// 马拉松报名赛事数据类型定义（与后端MarathonRegistration模型字段保持一致）
export interface MarathonRegistration {
  id: number;
  event_name: string; // CharField
  event_date: string; // DateField序列化为string
  location: string; // CharField
  province: string; // CharField(blank=True)，可能为空字符串
  city: string; // CharField(blank=True)，可能为空字符串
  district: string; // CharField(blank=True)，可能为空字符串
  event_type: '5km' | '10km' | '15km' | 'half' | 'full'; // CharField with choices
  registration_status: 'preparing' | 'pending' | 'won' | 'lost' | 'abandoned' | 'waitlist'; // CharField with choices
  registration_date: string | null; // DateField(null=True, blank=True)
  registration_fee: number | null; // DecimalField(null=True, blank=True)
  draw_date: string | null; // DateField(null=True, blank=True)
  transport: 'booked' | 'not_booked' | 'local' | null; // CharField with choices (null=True, blank=True)
  accommodation: 'booked' | 'not_booked' | 'local' | null; // CharField with choices (null=True, blank=True)
  notes: string; // TextField(blank=True)，可能为空字符串
  created_at?: string; // DateTimeField(auto_now_add=True)
  updated_at?: string; // DateTimeField(auto_now=True)
}

// 管理员设置类型定义（与后端AdminSetting模型字段保持一致）
export interface AdminSetting {
  id: number;
  admin_password: string; // CharField - 管理员密码
  carousel_images?: Array<{ id?: number; url: string; original_url?: string; alt?: string }> | string[]; // JSONField - 轮播图图片列表（url为裁剪后的，original_url为原始图片）
  avatar?: string | null; // ImageField - 头像图片URL
  decorative_icons?: { [key: string]: any }; // JSONField - 装饰图标配置
  created_at?: string; // DateTimeField(auto_now_add=True)
  updated_at?: string; // DateTimeField(auto_now=True)
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
  video_file?: string;
  video_file_url?: string;
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
