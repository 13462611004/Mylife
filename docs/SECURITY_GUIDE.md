# SOLO 项目安全配置指南

## 一、当前安全风险分析

### 1.1 高风险配置
| 配置项 | 当前值 | 风险等级 | 说明 |
|---------|---------|----------|------|
| DEBUG | True | 🔴 高 | 暴露详细错误信息 |
| SECRET_KEY | 默认值 | 🔴 高 | 容易被破解 |
| ALLOWED_HOSTS | 部分限制 | 🟡 中 | 可能被主机头攻击 |
| CORS | 允许所有来源 | 🟡 中 | 跨域安全风险 |
| 协议 | HTTP | 🟡 中 | 数据未加密传输 |
| 认证 | Session | 🟡 中 | 需要额外保护 |
| 访问控制 | 无 | 🔴 高 | 任何人可访问 |

### 1.2 安全威胁
- **信息泄露**：DEBUG模式暴露敏感信息
- **CSRF攻击**：跨站请求伪造
- **XSS攻击**：跨站脚本攻击
- **SQL注入**：数据库注入攻击
- **暴力破解**：管理员账户被破解
- **DDoS攻击**：服务拒绝攻击

## 二、立即安全加固措施

### 2.1 关闭DEBUG模式（生产环境必须）

**修改文件**：[settings.py](file:///home/SOLO/Mylife/backend/backend/settings.py#L26)

```python
# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False  # 生产环境必须设为 False
```

**影响**：
- ✅ 隐藏详细错误信息
- ✅ 防止信息泄露
- ✅ 提升安全性

### 2.2 更换SECRET_KEY

**生成新密钥**：
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

**修改文件**：[settings.py](file:///home/SOLO/Mylife/backend/backend/settings.py#L23)

```python
# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'your-new-secret-key-here'  # 替换为生成的密钥
```

**最佳实践**：
- 使用环境变量存储密钥
- 不要将密钥提交到版本控制
- 定期更换密钥

### 2.3 配置ALLOWED_HOSTS

**当前配置**：
```python
ALLOWED_HOSTS = ['8.153.95.63', '172.31.180.1', 'localhost', '127.0.0.1']
```

**建议配置**（使用域名后）：
```python
ALLOWED_HOSTS = [
    'yourdomain.com',
    'www.yourdomain.com',
    '8.153.95.63',  # 仅用于过渡期
]
```

### 2.4 配置HTTPS（强烈推荐）

#### 方案1：使用Let's Encrypt免费证书

**安装Certbot**：
```bash
sudo yum install -y certbot python3-certbot-nginx
```

**申请证书**：
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

**自动续期**：
```bash
sudo certbot renew --dry-run
```

#### 方案2：使用阿里云免费SSL证书

1. 登录阿里云控制台
2. 进入"数字证书管理服务"
3. 申请免费证书（DV证书）
4. 下载证书文件
5. 配置到Nginx

### 2.5 配置安全响应头

**修改文件**：[settings.py](file:///home/SOLO/Mylife/backend/backend/settings.py)

在文件末尾添加：

```python
# 安全响应头配置
SECURE_SSL_REDIRECT = True  # 强制HTTPS
SECURE_HSTS_SECONDS = 31536000  # HSTS一年
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# Cookie安全配置
SESSION_COOKIE_SECURE = True  # 仅HTTPS传输
CSRF_COOKIE_SECURE = True  # 仅HTTPS传输
SESSION_COOKIE_HTTPONLY = True  # 防止JavaScript访问
SESSION_COOKIE_SAMESITE = 'Lax'  # 防止CSRF
CSRF_COOKIE_SAMESITE = 'Lax'
```

## 三、访问控制配置

### 3.1 IP白名单（可选）

**修改文件**：[settings.py](file:///home/SOLO/Mylife/backend/backend/settings.py)

```python
# IP白名单配置
ALLOWED_IPS = [
    '192.168.1.0/24',  # 内网IP段
    'your.public.ip',  # 您的公网IP
]

# 中间件配置
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'apps.middleware.IPRestrictMiddleware',  # 自定义中间件
    'corsheaders.middleware.CorsMiddleware',
    # ... 其他中间件
]
```

**创建中间件**：`apps/middleware.py`

```python
from django.http import HttpResponseForbidden
from django.conf import settings

class IPRestrictMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        ip = request.META.get('REMOTE_ADDR')
        if ip not in settings.ALLOWED_IPS:
            return HttpResponseForbidden('Access Denied')
        return self.get_response(request)
```

### 3.2 基本认证保护（开发环境）

**修改文件**：[settings.py](file:///home/SOLO/Mylife/backend/backend/settings.py)

```python
# 基本认证配置
BASIC_AUTH_USERNAME = 'admin'
BASIC_AUTH_PASSWORD = 'your-strong-password'
```

**创建中间件**：`apps/middleware.py`

```python
from django.http import HttpResponse
from django.conf import settings
import base64

class BasicAuthMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if 'HTTP_AUTHORIZATION' in request.META:
            auth = request.META['HTTP_AUTHORIZATION'].split()
            if len(auth) == 2 and auth[0].lower() == 'basic':
                decoded = base64.b64decode(auth[1]).decode('utf-8')
                username, password = decoded.split(':')
                if (username == settings.BASIC_AUTH_USERNAME and
                    password == settings.BASIC_AUTH_PASSWORD):
                    return self.get_response(request)
        response = HttpResponse()
        response['WWW-Authenticate'] = 'Basic realm="Restricted"'
        response.status_code = 401
        return response
```

## 四、生产环境部署方案

### 4.1 使用Gunicorn替代开发服务器

**安装Gunicorn**：
```bash
source venv/bin/activate
pip install gunicorn
```

**创建Gunicorn配置文件**：`gunicorn_config.py`

```python
import multiprocessing

bind = "0.0.0.0:8001"
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "sync"
worker_connections = 1000
max_requests = 1000
max_requests_jitter = 50
timeout = 30
keepalive = 2
preload_app = True
daemon = True
pidfile = "/tmp/gunicorn.pid"
accesslog = "/var/log/gunicorn/access.log"
errorlog = "/var/log/gunicorn/error.log"
loglevel = "info"
```

**启动Gunicorn**：
```bash
cd /home/SOLO/Mylife/backend
source venv/bin/activate
gunicorn -c gunicorn_config.py backend.wsgi:application
```

### 4.2 配置Nginx反向代理

**安装Nginx**：
```bash
sudo yum install -y nginx
```

**创建Nginx配置文件**：`/etc/nginx/conf.d/solo.conf`

```nginx
# 前端配置
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # 前端静态文件
    location / {
        root /home/SOLO/Mylife/frontend/build;
        try_files $uri $uri/ /index.html;
    }

    # 后端API代理
    location /api/ {
        proxy_pass http://127.0.0.1:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 管理后台代理
    location /admin/ {
        proxy_pass http://127.0.0.1:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 静态文件
    location /static/ {
        alias /home/SOLO/Mylife/backend/staticfiles/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # 媒体文件
    location /media/ {
        alias /home/SOLO/Mylife/backend/media/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}

# HTTPS配置（使用SSL证书后）
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # 其他配置同上...
}

# HTTP重定向到HTTPS
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

**启动Nginx**：
```bash
sudo nginx -t  # 测试配置
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 4.3 使用Supervisor管理进程

**安装Supervisor**：
```bash
sudo yum install -y supervisor
```

**创建配置文件**：`/etc/supervisord.d/solo.conf`

```ini
[program:backend]
command=/home/SOLO/Mylife/backend/venv/bin/gunicorn -c /home/SOLO/Mylife/backend/gunicorn_config.py backend.wsgi:application
directory=/home/SOLO/Mylife/backend
user=root
autostart=true
autorestart=true
stderr_logfile=/var/log/supervisor/backend.err.log
stdout_logfile=/var/log/supervisor/backend.out.log
priority=999

[program:frontend]
command=/usr/bin/npm start
directory=/home/SOLO/Mylife/frontend
user=root
autostart=true
autorestart=true
stderr_logfile=/var/log/supervisor/frontend.err.log
stdout_logfile=/var/log/supervisor/frontend.out.log
environment=BROWSER="none"
priority=998
```

**启动Supervisor**：
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start all
```

## 五、防火墙和网络安全

### 5.1 配置服务器防火墙

**查看当前规则**：
```bash
sudo firewall-cmd --list-all
```

**添加规则**：
```bash
# 开放HTTP
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https

# 开放SSH
sudo firewall-cmd --permanent --add-service=ssh

# 开放自定义端口（开发环境）
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --permanent --add-port=8001/tcp

# 重载防火墙
sudo firewall-cmd --reload
```

### 5.2 配置fail2ban防暴力破解

**安装fail2ban**：
```bash
sudo yum install -y fail2ban
```

**创建配置文件**：`/etc/fail2ban/jail.local`

```ini
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/secure
maxretry = 3

[nginx-http-auth]
enabled = true
port = http,https
filter = nginx-http-auth
logpath = /var/log/nginx/error.log
maxretry = 5
```

**启动fail2ban**：
```bash
sudo systemctl start fail2ban
sudo systemctl enable fail2ban
```

## 六、数据库安全

### 6.1 数据库备份

**创建备份脚本**：`backup_db.sh`

```bash
#!/bin/bash
BACKUP_DIR="/home/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_FILE="$BACKUP_DIR/db_backup_$DATE.sqlite3"

mkdir -p $BACKUP_DIR
cp /home/SOLO/Mylife/backend/db.sqlite3 $DB_FILE

# 保留最近7天的备份
find $BACKUP_DIR -name "db_backup_*.sqlite3" -mtime +7 -delete

echo "Database backed up to $DB_FILE"
```

**设置定时任务**：
```bash
crontab -e
# 添加以下行（每天凌晨2点备份）
0 2 * * * /home/SOLO/Mylife/backend/backup_db.sh
```

### 6.2 数据库加密

**使用SQLCipher加密SQLite**：
```bash
pip install pysqlcipher3
```

**修改数据库配置**：[settings.py](file:///home/SOLO/Mylife/backend/backend/settings.py#L81)

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
        'OPTIONS': {
            'key': 'your-encryption-key',  # 加密密钥
        }
    }
}
```

## 七、日志和监控

### 7.1 配置日志

**修改文件**：[settings.py](file:///home/SOLO/Mylife/backend/backend/settings.py)

```python
# 日志配置
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': '/var/log/django/django.log',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['file'],
        'level': 'INFO',
    },
}
```

### 7.2 监控服务状态

**创建监控脚本**：`monitor.sh`

```bash
#!/bin/bash
# 检查后端服务
if ! pgrep -f "gunicorn" > /dev/null; then
    echo "Backend service is down, restarting..."
    supervisorctl restart backend
fi

# 检查前端服务
if ! pgrep -f "npm start" > /dev/null; then
    echo "Frontend service is down, restarting..."
    supervisorctl restart frontend
fi

# 检查Nginx
if ! systemctl is-active --quiet nginx; then
    echo "Nginx is down, restarting..."
    systemctl restart nginx
fi
```

**设置定时检查**：
```bash
crontab -e
# 每5分钟检查一次
*/5 * * * * /home/SOLO/Mylife/monitor.sh
```

## 八、安全检查清单

### 8.1 部署前检查
- [ ] DEBUG = False
- [ ] SECRET_KEY 已更换
- [ ] ALLOWED_HOSTS 已配置
- [ ] HTTPS 已启用
- [ ] 安全响应头已配置
- [ ] Cookie 安全已配置
- [ ] 防火墙规则已设置
- [ ] fail2ban 已启用
- [ ] 数据库备份已配置
- [ ] 日志已配置
- [ ] 监控已配置
- [ ] 管理员密码已修改

### 8.2 定期安全检查
- [ ] 每月检查依赖更新
- [ ] 每季度更换SECRET_KEY
- [ ] 每半年检查SSL证书
- [ ] 定期审查访问日志
- [ ] 定期备份数据库

## 九、应急响应

### 9.1 发现安全漏洞时

1. **立即隔离**：
   - 停止受影响的服务
   - 断开网络连接

2. **评估影响**：
   - 确定受影响的范围
   - 评估数据泄露风险

3. **修复漏洞**：
   - 应用安全补丁
   - 更新依赖包

4. **恢复服务**：
   - 从备份恢复数据
   - 重新启动服务

5. **事后分析**：
   - 分析攻击原因
   - 改进安全措施

### 9.2 紧急联系方式

- **阿里云安全中心**：95187
- **CERT中国**：400-810-6060
- **网络安全应急响应**：12377

---

**最后更新时间**：2026-01-09
**文档版本**：v1.0
**安全等级**：基础配置