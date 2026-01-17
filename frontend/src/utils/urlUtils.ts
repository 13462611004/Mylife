/**
 * URL工具函数
 * 提供统一的URL转换和处理功能
 */

/**
 * 将相对路径转换为绝对路径
 * @param url - 相对或绝对路径
 * @param baseURL - 基础URL（可选，默认从当前环境推断）
 * @returns 绝对URL
 */
export const normalizeUrl = (url: string | null | undefined, baseURL?: string): string | null => {
  if (!url) return null;
  
  // 如果已经是绝对URL，直接返回
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // 如果是相对路径，转换为绝对路径
  if (url.startsWith('/')) {
    const base = baseURL || getDefaultBaseURL();
    return `${base}${url}`;
  }
  
  return url;
};

/**
 * 获取默认的基础URL
 * @returns 基础URL
 */
const getDefaultBaseURL = (): string => {
  // 优先使用环境变量
  if (process.env.REACT_APP_API_BASE_URL) {
    return process.env.REACT_APP_API_BASE_URL;
  }
  
  // 根据当前访问的地址动态设置
  const currentHost = window.location.hostname;
  
  // 生产环境
  if (currentHost === 'xiaomanxia.com' || currentHost === 'www.xiaomanxia.com') {
    return 'https://xiaomanxia.com';
  }
  
  // 公网IP
  if (['8.153.95.63', '172.31.180.1', '8.153.81.3'].includes(currentHost)) {
    return `http://${currentHost}:8000`;
  }
  
  // 本地IP
  if (currentHost === '192.168.31.142') {
    return `http://${currentHost}:8000`;
  }
  
  // localtunnel
  if (['floppy-files-draw.loca.lt', 'cyan-pugs-show.loca.lt'].includes(currentHost)) {
    return 'https://backend-solo.loca.lt';
  }
  
  // 默认测试环境
  return 'http://localhost:8001';
};

/**
 * 从现有URL中提取基础URL
 * @param existingUrl - 现有的绝对URL
 * @returns 基础URL（origin部分）
 */
export const extractBaseURL = (existingUrl: string): string => {
  try {
    const urlObj = new URL(existingUrl);
    return urlObj.origin;
  } catch {
    return getDefaultBaseURL();
  }
};
