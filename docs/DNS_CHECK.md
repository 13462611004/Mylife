# DNS 配置检查

## 问题诊断

**症状**: 
- 直接访问 IP (`http://8.153.81.3`) ✅ 正常
- 域名访问 (`http://xiaomanxia.com`) ❌ 返回 403 (Server: Beaver)

**原因**: 域名 `xiaomanxia.com` 可能：
1. 解析到了 CDN/WAF 服务器（不是您的服务器）
2. 使用了域名代理服务
3. DNS 记录配置错误

## 解决方案

### 方案 1: 检查并修正 DNS 记录

1. **登录域名管理后台**
   - 找到域名 `xiaomanxia.com` 的管理界面

2. **检查 A 记录**
   - 确保有以下 A 记录：
     ```
     记录类型: A
     主机记录: @ (或留空)
     记录值: 8.153.81.3
     TTL: 600
     ```

     ```
     记录类型: A
     主机记录: www
     记录值: 8.153.81.3
     TTL: 600
     ```

     ```
     记录类型: A
     主机记录: api
     记录值: 8.153.81.3
     TTL: 600
     ```

3. **检查是否有 CDN/代理**
   - 如果使用了 CDN（如阿里云 CDN、Cloudflare 等），需要：
     - 停用 CDN，或
     - 将 CDN 回源地址设置为 `8.153.81.3`

4. **等待 DNS 生效**
   - DNS 修改后需要等待 5-30 分钟生效
   - 可以清除本地 DNS 缓存：`sudo dscacheutil -flushcache` (macOS)

### 方案 2: 临时使用 IP 访问

在 DNS 问题解决前，您可以：
- 直接使用 IP 访问: http://8.153.81.3:3000 (前端) 或 http://8.153.81.3:8000 (后端)
- 在本地 hosts 文件中添加映射（仅本地有效）:
  ```bash
  sudo vi /etc/hosts
  # 添加：
  8.153.81.3 xiaomanxia.com
  8.153.81.3 www.xiaomanxia.com
  8.153.81.3 api.xiaomanxia.com
  ```

### 方案 3: 使用子域名测试

如果主域名有 CDN，可以尝试：
- 使用测试子域名（如 `test.xiaomanxia.com`）直接解析到 `8.153.81.3`
- 验证配置正确后，再切换主域名

## 验证步骤

配置完成后，运行以下命令验证：

```bash
# 检查 DNS 解析
dig xiaomanxia.com

# 应该返回: 8.153.81.3

# 测试访问
curl -I http://xiaomanxia.com
# 应该返回: Server: nginx/1.20.1 (不是 Beaver)
```

## 当前状态

✅ **服务器配置**: 正常
✅ **FRP 服务**: 正常  
✅ **Nginx 配置**: 正常
✅ **安全组规则**: 正常
❌ **DNS 解析**: 需要检查（域名可能指向了其他服务器）

一旦 DNS 正确解析到 `8.153.81.3`，访问就会正常。
