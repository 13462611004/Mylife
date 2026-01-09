# SOLO 项目快速参考指南

## 🚀 快速访问地址

### 当前服务状态
| 服务 | 地址 | 状态 |
|------|------|------|
| **前端应用** | http://8.153.95.63:3000 | ✅ 运行中 |
| **后端API** | http://8.153.95.63:8001/api | ✅ 运行中 |
| **管理后台** | http://8.153.95.63:8001/admin | ✅ 运行中 |

### API 端点
- **马拉松API**：http://8.153.95.63:8001/api/marathon/
- **管理员API**：http://8.153.95.63:8001/api/admin/
- **朋友圈API**：http://8.153.95.63:8001/api/moments/

## 📱 从手机访问

### 步骤
1. 确保手机有网络连接（WiFi或移动数据）
2. 打开手机浏览器
3. 访问：**http://8.153.95.63:3000**
4. 等待页面加载完成

### 注意事项
- ⚠️ 首次访问可能较慢（加载资源）
- ⚠️ 确保云服务器安全组已开放3000端口
- ⚠️ 某些移动网络可能限制非标准端口

## 💻 从电脑访问

### 步骤
1. 打开浏览器（推荐Chrome、Firefox、Edge）
2. 访问：**http://8.153.95.63:3000**
3. 按F12打开开发者工具查看日志（如遇问题）

### 测试API连接
```bash
# 测试后端API
curl http://8.153.95.63:8001/api/marathon/

# 测试前端
curl http://8.153.95.63:3000
```

## 🔧 服务管理

### 使用管理脚本
```bash
# 查看服务状态
/home/SOLO/Mylife/manage_services.sh status

# 启动所有服务
/home/SOLO/Mylife/manage_services.sh start

# 停止所有服务
/home/SOLO/Mylife/manage_services.sh stop

# 重启所有服务
/home/SOLO/Mylife/manage_services.sh restart

# 查看日志
/home/SOLO/Mylife/manage_services.sh logs

# 执行数据库迁移
/home/SOLO/Mylife/manage_services.sh migrate

# 创建管理员账户
/home/SOLO/Mylife/manage_services.sh admin
```

### 手动管理
```bash
# 启动后端
cd /home/SOLO/Mylife/backend
source venv/bin/activate
python manage.py runserver 0.0.0.0:8001

# 启动前端
cd /home/SOLO/Mylife/frontend
npm start
```

## 🔒 安全组配置（必须）

### 阿里云控制台配置
1. 登录：https://ecs.console.aliyun.com/
2. 选择实例 → 安全组 → 配置规则
3. 添加入方向规则：

| 端口 | 协议 | 授权对象 | 优先级 |
|------|------|----------|--------|
| 3000 | TCP | 0.0.0.0/0 | 1 |
| 8001 | TCP | 0.0.0.0/0 | 1 |

4. 保存并等待生效（1-2分钟）

## 📚 详细文档

- **[访问配置完整指南](file:///home/SOLO/Mylife/docs/ACCESS_GUIDE.md)** - 详细的访问配置步骤
- **[安全配置指南](file:///home/SOLO/Mylife/docs/SECURITY_GUIDE.md)** - 生产环境安全配置
- **[Nginx配置模板](file:///home/SOLO/Mylife/docs/nginx.conf)** - Nginx反向代理配置

## ⚠️ 常见问题

### 无法访问前端
**检查清单**：
- [ ] 安全组是否开放3000端口
- [ ] 前端服务是否运行：`/home/SOLO/Mylife/manage_services.sh status`
- [ ] 浏览器控制台是否有错误

**解决方法**：
```bash
# 重启前端服务
/home/SOLO/Mylife/manage_services.sh frontend
```

### 无法访问后端API
**检查清单**：
- [ ] 安全组是否开放8001端口
- [ ] 后端服务是否运行
- [ ] CORS配置是否正确

**解决方法**：
```bash
# 重启后端服务
/home/SOLO/Mylife/manage_services.sh backend
```

### CORS错误
**症状**：浏览器控制台显示跨域错误

**解决方法**：
- 已在 [settings.py](file:///home/SOLO/Mylife/backend/backend/settings.py#L135) 配置CORS
- 重启后端服务使配置生效

### 连接超时
**可能原因**：
- 网络延迟高
- 服务未响应
- 防火墙阻止

**解决方法**：
```bash
# 测试网络连接
ping 8.153.95.63

# 检查服务状态
/home/SOLO/Mylife/manage_services.sh status
```

## 🎯 下一步

### 开发环境
1. ✅ 服务已启动并运行
2. ✅ 安全组已配置
3. ✅ 可以从手机和电脑访问

### 生产环境（推荐）
1. 配置域名解析
2. 申请SSL证书
3. 配置Nginx反向代理
4. 使用Gunicorn替代开发服务器
5. 配置HTTPS
6. 关闭DEBUG模式
7. 更换SECRET_KEY

详细步骤请参考 [安全配置指南](file:///home/SOLO/Mylife/docs/SECURITY_GUIDE.md)

## 📞 技术支持

### 遇到问题时
1. 检查服务状态：`/home/SOLO/Mylife/manage_services.sh status`
2. 查看服务日志：`/home/SOLO/Mylife/manage_services.sh logs`
3. 检查安全组配置
4. 查看浏览器控制台错误信息

### 文档位置
- 项目目录：`/home/SOLO/Mylife/`
- 文档目录：`/home/SOLO/Mylife/docs/`
- 管理脚本：`/home/SOLO/Mylife/manage_services.sh`

---

**最后更新**：2026-01-09
**服务器IP**：8.153.95.63
**项目名称**：SOLO