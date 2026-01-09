# SOLO 项目外网访问配置指南

## 一、项目访问信息

### 服务器基本信息
- **公网IP地址**：8.153.95.63
- **内网IP地址**：172.31.180.1
- **操作系统**：Alibaba Cloud Linux 4.0.1
- **云服务提供商**：阿里云

### 服务端口配置
| 服务名称 | 端口 | 访问地址 | 说明 |
|---------|------|----------|------|
| 前端应用 | 3000 | http://8.153.95.63:3000 | React 开发服务器 |
| 后端API | 8001 | http://8.153.95.63:8001/api | Django REST API |
| 管理后台 | 8001 | http://8.153.95.63:8001/admin | Django Admin |

### API 端点列表
- **马拉松API**：http://8.153.95.63:8001/api/marathon/
- **管理员API**：http://8.153.95.63:8001/api/admin/
- **朋友圈API**：http://8.153.95.63:8001/api/moments/

## 二、云服务器安全组配置（必须）

### 2.1 登录阿里云控制台
1. 访问：https://ecs.console.aliyun.com/
2. 选择实例：找到您的云服务器实例
3. 点击"安全组" → "配置规则"

### 2.2 添加入方向规则

#### 规则1：前端访问端口
- **端口范围**：3000/3000
- **授权对象**：0.0.0.0/0
- **协议类型**：TCP
- **优先级**：1
- **描述**：前端React应用访问

#### 规则2：后端API端口
- **端口范围**：8001/8001
- **授权对象**：0.0.0.0/0
- **协议类型**：TCP
- **优先级**：1
- **描述**：后端Django API访问

### 2.3 保存配置
- 点击"保存"按钮
- 等待规则生效（通常1-2分钟）

## 三、从不同设备访问

### 3.1 从电脑访问
1. 打开浏览器（Chrome、Firefox、Edge等）
2. 访问：http://8.153.95.63:3000
3. 等待页面加载完成

### 3.2 从手机访问
1. 确保手机和电脑在同一网络，或手机有网络连接
2. 打开手机浏览器
3. 访问：http://8.153.95.63:3000
4. 如遇问题，尝试使用移动数据而非WiFi

### 3.3 局域网访问（可选）
如果需要在同一局域网内访问：
- 前端：http://172.31.180.1:3000
- 后端：http://172.31.180.1:8001

## 四、域名配置（可选）

### 4.1 购买域名
1. 在阿里云域名注册平台购买域名
2. 或在其他域名注册商购买（如 GoDaddy、Namecheap）

### 4.2 配置DNS解析
1. 登录域名管理控制台
2. 找到"DNS解析"或"域名解析"
3. 添加A记录：

| 主机记录 | 记录类型 | 记录值 | TTL |
|---------|----------|---------|-----|
| @ | A | 8.153.95.63 | 600 |
| www | A | 8.153.95.63 | 600 |

4. 保存并等待DNS生效（通常10分钟-24小时）

### 4.3 更新项目配置
配置域名后，需要更新以下文件：

**前端配置** - [axios.ts](file:///home/SOLO/Mylife/frontend/src/services/axios.ts)：
```typescript
const apiClient: CustomAxiosInstance = axios.create({
  baseURL: 'http://yourdomain.com:8001/api', // 替换为您的域名
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
}) as any;
```

**后端配置** - [settings.py](file:///home/SOLO/Mylife/backend/backend/settings.py)：
```python
ALLOWED_HOSTS = ['yourdomain.com', 'www.yourdomain.com', '8.153.95.63']

CORS_ALLOWED_ORIGINS = [
    'http://yourdomain.com:3000',
    'http://www.yourdomain.com:3000',
]
```

## 五、网络限制和解决方案

### 5.1 常见网络限制

#### 1. 云服务提供商限制
- **问题**：安全组未开放端口
- **解决**：按照第二部分配置安全组规则
- **验证**：使用 `telnet 8.153.95.63 3000` 测试端口连通性

#### 2. 防火墙限制
- **问题**：服务器防火墙阻止连接
- **检查**：`sudo firewall-cmd --list-all`
- **解决**：
  ```bash
  sudo firewall-cmd --permanent --add-port=3000/tcp
  sudo firewall-cmd --permanent --add-port=8001/tcp
  sudo firewall-cmd --reload
  ```

#### 3. ISP限制
- **问题**：某些ISP阻止非标准端口
- **解决**：使用标准端口（80、443）配合Nginx反向代理

#### 4. CORS限制
- **问题**：浏览器阻止跨域请求
- **解决**：已在 [settings.py](file:///home/SOLO/Mylife/backend/backend/settings.py#L135) 配置CORS

### 5.2 移动网络特殊限制

#### 1. 移动数据网络
- 某些移动运营商可能限制端口
- 建议使用标准端口（80、443）

#### 2. 企业网络
- 企业防火墙可能阻止非标准端口
- 联系IT部门开放端口

#### 3. 公共WiFi
- 公共WiFi可能有端口限制
- 尝试使用移动数据

## 六、访问测试步骤

### 6.1 基础连通性测试
```bash
# 测试前端端口
curl http://8.153.95.63:3000

# 测试后端API
curl http://8.153.95.63:8001/api/marathon/

# 测试管理后台
curl http://8.153.95.63:8001/admin/
```

### 6.2 浏览器测试
1. 打开浏览器开发者工具（F12）
2. 访问：http://8.153.95.63:3000
3. 检查Console是否有错误
4. 检查Network标签查看API请求

### 6.3 移动设备测试
1. 使用手机浏览器访问
2. 测试不同浏览器（Chrome、Safari、Firefox）
3. 测试不同网络（WiFi、4G/5G）

## 七、故障排查

### 7.1 无法访问前端
**检查清单**：
- [ ] 安全组是否开放3000端口
- [ ] 前端服务是否运行：`ps aux | grep node`
- [ ] 防火墙是否阻止：`sudo firewall-cmd --list-ports`
- [ ] 浏览器控制台是否有错误

**解决方法**：
```bash
# 检查服务状态
netstat -tlnp | grep 3000

# 重启前端服务
cd /home/SOLO/Mylife/frontend
npm start
```

### 7.2 无法访问后端API
**检查清单**：
- [ ] 安全组是否开放8001端口
- [ ] 后端服务是否运行：`ps aux | grep python`
- [ ] CORS配置是否正确
- [ ] ALLOWED_HOSTS是否包含访问IP

**解决方法**：
```bash
# 检查服务状态
netstat -tlnp | grep 8001

# 重启后端服务
cd /home/SOLO/Mylife/backend
source venv/bin/activate
python manage.py runserver 0.0.0.0:8001
```

### 7.3 CORS错误
**症状**：浏览器控制台显示跨域错误

**解决方法**：
1. 检查 [settings.py](file:///home/SOLO/Mylife/backend/backend/settings.py#L135) CORS配置
2. 确认前端地址在CORS_ALLOWED_ORIGINS中
3. 重启后端服务

### 7.4 连接超时
**可能原因**：
- 网络延迟高
- 服务未响应
- 防火墙阻止

**解决方法**：
1. 检查网络连接：`ping 8.153.95.63`
2. 检查服务日志
3. 检查防火墙规则

## 八、性能优化建议

### 8.1 开发环境优化
- 使用 `npm run build` 构建生产版本
- 使用 Nginx 托管静态文件
- 启用 gzip 压缩

### 8.2 生产环境优化
- 使用 Gunicorn 替代 Django 开发服务器
- 配置 Nginx 反向代理
- 启用 CDN 加速
- 配置缓存策略

## 九、监控和日志

### 9.1 服务监控
```bash
# 查看后端日志
tail -f /home/SOLO/Mylife/backend/backend/logs/*.log

# 查看前端日志
# 前端日志在浏览器控制台查看
```

### 9.2 性能监控
- 使用 PM2 管理进程
- 配置日志轮转
- 设置告警通知

## 十、联系方式

如遇问题，请检查：
1. 阿里云控制台安全组配置
2. 服务器防火墙状态
3. 服务运行状态
4. 浏览器控制台错误信息

---

**最后更新时间**：2026-01-09
**文档版本**：v1.0