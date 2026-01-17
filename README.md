# Mylife 项目

个人生活记录应用 - 追光小慢侠

## 项目结构

```
Mylife/
├── backend/              # Django 后端应用
│   ├── apps/            # 应用模块
│   │   ├── admin_app/   # 管理应用
│   │   ├── marathon/    # 马拉松应用
│   │   └── moments_app/ # 朋友圈应用
│   ├── backend/         # Django 项目配置
│   └── manage.py        # Django 管理脚本
├── frontend/            # React 前端应用
│   ├── src/            # 源代码
│   ├── public/         # 静态文件
│   └── package.json    # 依赖配置
├── docs/               # 项目文档
├── frp/                # FRP 内网穿透配置
├── start_services.sh   # 主服务管理脚本（启动/停止/重启/状态检查）
└── start_frp.sh        # FRP 管理脚本（独立功能）
```

## 快速开始

### 启动服务

```bash
# 启动前后端服务
./start_services.sh start

# 查看服务状态（简要）
./start_services.sh status

# 详细检查服务状态（含端口、外网访问测试）
./start_services.sh check

# 停止服务
./start_services.sh stop

# 重启服务
./start_services.sh restart
```

### 单独管理服务

```bash
# 管理后端
./start_services.sh backend {start|stop|restart}

# 管理前端
./start_services.sh frontend {start|stop|restart}
```

### FRP 管理（如需外网访问）

```bash
# 启动 FRP 客户端
./start_frp.sh start

# 查看 FRP 状态
./start_frp.sh status

# 查看 FRP 日志
./start_frp.sh logs

# 停止 FRP
./start_frp.sh stop
```

## 环境配置

### 后端环境变量

在 `backend/` 目录创建 `.env` 文件：

```bash
DJANGO_SECRET_KEY=你的密钥
DJANGO_DEBUG=True  # 开发环境为 True，生产环境为 False
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
```

详细配置说明请参考：[环境变量配置指南](docs/环境变量配置指南.md)

## 访问地址

- **前端应用**: http://localhost:3000
- **后端API**: http://localhost:8000/api/
- **管理后台**: http://localhost:8000/admin/

## 文档

项目相关文档位于 `docs/` 目录：

- [环境变量配置指南](docs/环境变量配置指南.md)
- [安全配置指南](docs/SECURITY_GUIDE.md)
- [FRP 配置指南](docs/FRP_SETUP_GUIDE.md)
- [网络错误排查](docs/NETWORK_ERROR_FIX.md)
- [故障排查指南](docs/TROUBLESHOOTING.md)

## 技术栈

### 后端
- Django 5.2.3
- Django REST Framework
- SQLite

### 前端
- React 18.2.0
- TypeScript
- Ant Design
- ECharts
- Chart.js
