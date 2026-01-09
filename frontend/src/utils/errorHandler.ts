/**
 * 错误处理工具类
 * 提供统一的错误处理和用户引导功能
 */

import { message } from 'antd';

/**
 * 错误类型枚举
 */
export enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',  // 网络错误
  SERVER_ERROR = 'SERVER_ERROR',    // 服务器错误
  VALIDATION_ERROR = 'VALIDATION_ERROR',  // 验证错误
  NOT_FOUND = 'NOT_FOUND',          // 资源未找到
  UNKNOWN = 'UNKNOWN'               // 未知错误
}

/**
 * 错误信息映射
 */
const ERROR_MESSAGES: Record<ErrorType, string> = {
  [ErrorType.NETWORK_ERROR]: '网络连接失败，请检查网络设置或稍后重试',
  [ErrorType.SERVER_ERROR]: '服务器错误，请稍后重试',
  [ErrorType.VALIDATION_ERROR]: '数据验证失败，请检查输入',
  [ErrorType.NOT_FOUND]: '请求的资源不存在',
  [ErrorType.UNKNOWN]: '请求失败，请稍后重试'
};
/**
 * 判断错误类型
 * @param error - 错误对象
 * @returns 错误类型
 */
export const getErrorType = (error: any): ErrorType => {
  if (!error) return ErrorType.UNKNOWN;
  
  // 检查是否是网络连接错误（请求无法发送到服务器）
  if (error.code === 'ECONNABORTED' || 
      error.code === 'ECONNREFUSED' || 
      error.code === 'ETIMEDOUT' ||
      error.code === 'ENETUNREACH' ||
      error.code === 'ERR_NETWORK' ||
      error.message?.includes('Network Error') ||
      error.message?.includes('ERR_CONNECTION_REFUSED')) {
    return ErrorType.NETWORK_ERROR;
  }
  
  // 检查HTTP状态码
  if (error.response) {
    const status = error.response.status;
    if (status >= 500) return ErrorType.SERVER_ERROR;
    if (status === 404) return ErrorType.NOT_FOUND;
    if (status >= 400 && status < 500) return ErrorType.VALIDATION_ERROR;
  }
  
  // 检查网络请求错误（请求已发送但无响应）
  if (error.request) {
    return ErrorType.NETWORK_ERROR;
  }
  
  return ErrorType.UNKNOWN;
};

/**
 * 获取用户友好的错误信息
 * @param error - 错误对象
 * @returns 错误信息
 */
export const getErrorMessage = (error: any): string => {
  const errorType = getErrorType(error);
  
  // 如果服务器返回了具体的错误信息，优先使用
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  // 如果服务器返回了错误详情
  if (error.response?.data?.detail) {
    return error.response.data.detail;
  }
  
  // 使用预设的错误信息
  return ERROR_MESSAGES[errorType];
};

/**
 * 显示错误提示
 * @param error - 错误对象
 * @param duration - 显示时长（秒）
 */
export const showError = (error: any, duration: number = 5) => {
  const errorMessage = getErrorMessage(error);
  message.error(errorMessage, duration);
};

/**
 * 显示成功提示
 * @param messageText - 提示信息
 * @param duration - 显示时长（秒）
 */
export const showSuccess = (messageText: string, duration: number = 3) => {
  message.success(messageText, duration);
};

/**
 * 显示警告提示
 * @param messageText - 提示信息
 * @param duration - 显示时长（秒）
 */
export const showWarning = (messageText: string, duration: number = 4) => {
  message.warning(messageText, duration);
};

/**
 * 显示信息提示
 * @param messageText - 提示信息
 * @param duration - 显示时长（秒）
 */
export const showInfo = (messageText: string, duration: number = 3) => {
  message.info(messageText, duration);
};

/**
 * 加载提示对象
 */
export const loadingMessage = {
  show: (text: string = '加载中...') => message.loading(text, 0),
  hide: () => message.destroy()
};
