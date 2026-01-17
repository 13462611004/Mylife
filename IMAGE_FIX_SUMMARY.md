# 图片预览问题修复总结

## 问题描述
点击"点击预览"时无法显示图片

## 已完成的修复

### 1. 后端修复
- ✅ 修改了 `PostMediaSerializer`，根据请求上下文动态构建URL
- ✅ 创建了 `serve_media` 视图处理媒体文件访问（生产环境）
- ✅ 修改了 `urls.py`，确保媒体文件路由在生产环境也可用
- ✅ 添加了 `get_serializer_context` 方法，传递request对象到序列化器

### 2. 前端修复
- ✅ 添加了 `normalizeMediaUrl` 函数，将绝对URL转换为相对路径
- ✅ 修改了所有图片组件使用 `normalizeMediaUrl` 处理URL
- ✅ 添加了图片加载错误处理

### 3. 代理配置
- ✅ 在 `setupProxy.js` 中添加了 `/media` 路径的代理配置

## 当前状态

### 后端图片URL
- 返回格式：`http://localhost:8000/media/posts/2026/01/09/P20251106-060936.jpg`
- 后端直接访问：✅ HTTP 200（正常工作）

### 前端处理
- `normalizeMediaUrl` 将URL转换为：`/media/posts/2026/01/09/P20251106-060936.jpg`
- 代理访问：❌ HTTP 404（代理未正常工作）

## 问题诊断

1. **代理配置问题**：前端代理未正确转发媒体文件请求
2. **可能的解决方案**：
   - 方案A：修复代理配置（推荐）
   - 方案B：前端直接使用后端绝对URL（Django CORS已配置支持）

## 测试步骤

1. 刷新浏览器页面（强制刷新：Cmd+Shift+R）
2. 打开开发者工具（F12）查看控制台错误
3. 点击"点击预览"查看图片是否显示
4. 检查Network标签页，查看图片请求的状态码

## 如果仍然无法显示

请检查：
1. 浏览器控制台的错误信息
2. Network标签页中图片请求的URL和状态码
3. 后端服务是否正常运行（`http://localhost:8000/media/...` 是否可以访问）

## 临时解决方案

如果代理问题无法解决，可以临时修改 `normalizeMediaUrl` 函数，直接返回后端绝对URL：

```typescript
const normalizeMediaUrl = (url: string | null | undefined): string | undefined => {
  if (!url) return undefined;
  // 直接返回原URL，让浏览器直接访问后端（Django CORS已配置）
  return url;
};
```

这样可以绕过代理问题，直接访问后端。
