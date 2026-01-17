import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosRequestConfig } from 'axios';

// 创建自定义Axios实例类型，考虑响应拦截器直接返回data
interface CustomAxiosInstance extends Omit<AxiosInstance, 'get' | 'post' | 'put' | 'delete' | 'patch'> {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
  patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
}

// 根据当前访问地址动态设置后端API基础URL
const getBaseURL = (): string => {
  // 优先使用环境变量
  if (process.env.REACT_APP_API_BASE_URL) {
    return process.env.REACT_APP_API_BASE_URL;
  }
  
  // 根据当前访问的地址动态设置
  const currentHost = window.location.hostname;
  const currentPort = window.location.port;
  
  // 如果是域名访问，使用主域名（通过前端代理或服务器端路由转发到后端）
  if (currentHost === 'xiaomanxia.com' || currentHost === 'www.xiaomanxia.com') {
    // 使用主域名，React 开发服务器的 setupProxy.js 会将 /api/ 路径代理到后端
    // 生产环境构建后，需要通过服务器端（FRP 或 Nginx）配置 /api/ 路径转发到后端
    return 'https://xiaomanxia.com';
  }
  
  // 如果直接通过 api.xiaomanxia.com 访问，使用子域名
  if (currentHost === 'api.xiaomanxia.com') {
    return 'https://api.xiaomanxia.com';
  }
  
  // 如果是公网IP，使用公网IP的8000端口
  if (currentHost === '8.153.95.63' || currentHost === '172.31.180.1' || currentHost === '8.153.81.3') {
    return `http://${currentHost}:8000`;
  }
  
  // 如果是本地IP，使用相同IP的8000端口
  if (currentHost === '192.168.31.142') {
    return `http://${currentHost}:8000`;
  }
  
  // 如果是localtunnel地址，使用对应的后端localtunnel地址
  if (currentHost === 'floppy-files-draw.loca.lt' || currentHost === 'cyan-pugs-show.loca.lt') {
    return 'https://backend-solo.loca.lt';
  }
  
  // 默认使用 localhost（本地开发）
  // 测试环境使用8001端口，避免与主项目冲突
  return 'http://localhost:8001';
};

// 创建Axios实例
const apiClient: CustomAxiosInstance = axios.create({
  baseURL: getBaseURL(), // 后端API基础URL（不包含/api）
  timeout: 30000, // 请求超时时间（30秒）
  withCredentials: true, // 允许携带cookies，用于Session认证
  headers: {
    'Content-Type': 'application/json',
  },
}) as any;

// 请求拦截器
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    // 如果是FormData，删除Content-Type让浏览器自动设置（包含boundary）
    if (config.data instanceof FormData) {
      if (config.headers) {
        delete config.headers['Content-Type'];
      }
    }
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
