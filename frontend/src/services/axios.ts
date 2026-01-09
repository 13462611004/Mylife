import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosRequestConfig } from 'axios';

// 创建自定义Axios实例类型，考虑响应拦截器直接返回data
interface CustomAxiosInstance extends Omit<AxiosInstance, 'get' | 'post' | 'put' | 'delete' | 'patch'> {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
  patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
}

// 创建Axios实例
const apiClient: CustomAxiosInstance = axios.create({
  baseURL: 'http://8.153.95.63:8001', // 后端API基础URL（公网IP，不带/api）
  timeout: 30000, // 请求超时时间（30秒）
  withCredentials: true, // 允许携带cookies，用于Session认证
  headers: {
    'Content-Type': 'application/json',
  },
}) as any;

// 请求拦截器
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    // 可以在这里添加认证信息，比如token
    // const token = localStorage.getItem('token');
    // if (token && config.headers) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // 直接返回响应数据
    return response.data;
  },
  (error) => {
    // 统一处理错误
    console.error('API请求错误:', error);
    
    // 处理不同的错误状态码
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // 未授权，可跳转到登录页
          // console.error('未授权，请重新登录');
          break;
        case 403:
          // 禁止访问
          // console.error('禁止访问');
          break;
        case 404:
          // 资源不存在
          // console.error('请求的资源不存在');
          break;
        case 500:
          // 服务器错误
          // console.error('服务器错误');
          break;
        default:
          // console.error(`请求错误: ${error.response.status}`);
      }
    } else if (error.request) {
      // 请求已发出但没有收到响应
      // console.error('网络错误，服务器没有响应');
    } else {
      // 请求配置错误
      // console.error('请求配置错误:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
