# FRP 外网访问配置指南

本文档说明如何通过 FRP 将本地服务暴露到外网，并使用域名和 HTTPS 访问。

## 架构说明

```
本地服务 (localhost) → FRP 客户端 (frpc) → 云服务器 (FRP 服务端 frps:7000) → Nginx (反向代理:8080) → 外网 (HTTPS:443)
```

## 配置步骤

### 一、云服务器端配置（8.153.81.3）

#### 1. 上传并配置 FRP 服务端

在云服务器上执行以下操作：

```bash
# 1. 创建 frp 目录
mkdir -p /opt/frp
cd /opt/frp

# 2. 上传 frps 可执行文件（从本地 frp 目录上传）
# 将 /Users/wangliang/Desktop/Mylife/frp/frps 上传到服务器

# 3. 创建 frps.toml 配置文件
cat > /opt/frp/frps.toml << EOF
bindPort = 7000

# 允许 HTTP 代理（用于域名访问）
vhostHTTPPort = 8080

# Token 认证
auth.token = "mylife2024"

# 日志配置
log.to = "/opt/frp/frps.log"
log.level = "info"
log.maxDays = 3
EOF

# 4. 创建 systemd 服务
cat > /etc/systemd/system/frps.service << EOF
[Unit]
Description=FRP Server
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/frp
ExecStart=/opt/frp/frps -c /opt/frp/frps.toml
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

# 5. 启动 frps 服务
systemctl daemon-reload
systemctl enable frps
systemctl start frps
systemctl status frps
```

#### 2. 配置 Nginx 反向代理和 SSL

**重要：请根据您的实际 SSL 证书路径修改配置**

```bash
# 1. 配置前端站点（xiaomanxia.com）
cat > /etc/nginx/conf.d/xiaomanxia.com.conf << EOF
# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name xiaomanxia.com www.xiaomanxia.com;
    return 301 https://\$server_name\$request_uri;
}

# HTTPS
server {
    listen 443 ssl http2;
    server_name xiaomanxia.com www.xiaomanxia.com;

    # SSL 证书路径（请根据实际情况修改）
    ssl_certificate /etc/nginx/ssl/xiaomanxia.com/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/xiaomanxia.com/privkey.pem;
    
    # SSL 配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # WebSocket 支持
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF

# 2. 配置后端 API（api.xiaomanxia.com）
cat > /etc/nginx/conf.d/api.xiaomanxia.com.conf << EOF
# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name api.xiaomanxia.com;
    return 301 https://\$server_name\$request_uri;
}

# HTTPS
server {
    listen 443 ssl http2;
    server_name api.xiaomanxia.com;

    # SSL 证书路径（请根据实际情况修改）
    ssl_certificate /etc/nginx/ssl/xiaomanxia.com/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/xiaomanxia.com/privkey.pem;
    
    # SSL 配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # CORS 支持
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods 'GET, POST, PUT, DELETE, OPTIONS';
        add_header Access-Control-Allow-Headers 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization';
        
        if (\$request_method = 'OPTIONS') {
            return 204;
        }
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF

# 3. 测试并重启 Nginx
nginx -t
systemctl restart nginx
```

#### 3. 配置防火墙

```bash
# 开放必要端口
firewall-cmd --permanent --add-port=7000/tcp  # FRP 服务端
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https
firewall-cmd --reload

# 或者使用 ufw
# ufw allow 7000/tcp
# ufw allow 80/tcp
# ufw allow 443/tcp
```

#### 4. 配置域名 DNS 解析

确保以下域名都解析到云服务器 IP `8.153.81.3`：
- `xiaomanxia.com` → A 记录 → 8.153.81.3
- `www.xiaomanxia.com` → A 记录 → 8.153.81.3 或 CNAME → xiaomanxia.com
- `api.xiaomanxia.com` → A 记录 → 8.153.81.3

### 二、本地客户端配置

#### 1. 配置已更新

配置文件已更新为：
- `frp/frpc.toml` - TOML 格式配置（推荐）
- `frp/frpc.ini` - INI 格式配置（备用）

配置包括：
- 前端 HTTP 代理：`xiaomanxia.com` 和 `www.xiaomanxia.com`
- 后端 API HTTP 代理：`api.xiaomanxia.com`
- TCP 代理（备用）：端口 3000 和 8000

#### 2. 启动 FRP 客户端

```bash
# 启动 FRP 客户端
cd /Users/wangliang/Desktop/Mylife
./start_frp.sh start

# 查看状态
./start_frp.sh status

# 查看日志
./start_frp.sh logs

# 停止
./start_frp.sh stop
```

#### 3. 启动所有服务

```bash
# 启动前后端服务
./start_services.sh start

# 启动 FRP 客户端
./start_frp.sh start
```

### 三、访问地址

配置完成后，可以通过以下地址访问：

- **前端（HTTPS）**: https://xiaomanxia.com 或 https://www.xiaomanxia.com
- **后端 API（HTTPS）**: https://api.xiaomanxia.com
- **前端（TCP，备用）**: http://8.153.81.3:3000
- **后端 API（TCP，备用）**: http://8.153.81.3:8000

### 四、故障排查

#### 1. 检查 FRP 客户端连接

```bash
# 查看本地 frpc 日志
tail -f /Users/wangliang/Desktop/Mylife/frp/frpc.log

# 查看本地 frpc 状态
./start_frp.sh status
```

#### 2. 检查云服务器端

```bash
# 查看 frps 状态
systemctl status frps

# 查看 frps 日志
tail -f /opt/frp/frps.log

# 查看 Nginx 状态
systemctl status nginx

# 查看 Nginx 错误日志
tail -f /var/log/nginx/error.log

# 测试 Nginx 配置
nginx -t
```

#### 3. 常见问题

**问题1：frpc 连接失败**
- 检查云服务器防火墙是否开放 7000 端口
- 检查 token 是否匹配
- 检查网络连接

**问题2：域名无法访问**
- 检查 DNS 解析是否正确
- 检查 Nginx 配置是否正确
- 检查 SSL 证书路径是否正确

**问题3：HTTPS 证书错误**
- 确认 SSL 证书路径正确
- 检查证书文件权限
- 重新加载 Nginx: `systemctl reload nginx`

### 五、快速部署脚本

在云服务器上，可以直接运行自动化配置脚本（需要先上传 `docs/frp_server_setup.sh`）：

```bash
# 上传脚本到服务器
scp docs/frp_server_setup.sh root@8.153.81.3:/root/

# 在服务器上执行
ssh root@8.153.81.3
chmod +x /root/frp_server_setup.sh
/root/frp_server_setup.sh
```

**注意**：脚本需要根据实际 SSL 证书路径进行修改。
