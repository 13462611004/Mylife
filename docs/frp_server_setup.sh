#!/bin/bash
# 云服务器端 FRP 和 Nginx 配置脚本
# 在云服务器 8.153.81.3 上运行此脚本

set -e

SERVER_IP="8.153.81.3"
DOMAIN="xiaomanxia.com"
FRP_DIR="/opt/frp"
NGINX_CONF_DIR="/etc/nginx/conf.d"

echo "=========================================="
echo "FRP 服务器端和 Nginx 配置脚本"
echo "=========================================="
echo ""

# 检查是否为 root 用户
if [ "$EUID" -ne 0 ]; then 
    echo "错误: 请使用 root 用户运行此脚本"
    exit 1
fi

# 1. 安装必要软件
echo "1. 检查并安装必要软件..."
if ! command -v nginx &> /dev/null; then
    echo "安装 Nginx..."
    if command -v yum &> /dev/null; then
        yum install -y nginx
    elif command -v apt-get &> /dev/null; then
        apt-get update && apt-get install -y nginx
    fi
fi

# 2. 配置 frps
echo ""
echo "2. 配置 FRP 服务器端..."
mkdir -p "$FRP_DIR"

cat > "$FRP_DIR/frps.toml" << EOF
bindPort = 7000
token = "mylife2024"

# 允许 HTTP 代理
vhostHTTPPort = 8080

# 日志配置
log.to = "/opt/frp/frps.log"
log.level = "info"
EOF

# 3. 创建 frps systemd 服务
echo ""
echo "3. 创建 frps systemd 服务..."
cat > /etc/systemd/system/frps.service << EOF
[Unit]
Description=FRP Server
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$FRP_DIR
ExecStart=$FRP_DIR/frps -c $FRP_DIR/frps.toml
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

# 4. 配置 Nginx
echo ""
echo "4. 配置 Nginx 反向代理和 SSL..."

# 主站点配置（前端）
cat > "$NGINX_CONF_DIR/xiaomanxia.com.conf" << EOF
# 前端 - HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name xiaomanxia.com www.xiaomanxia.com;
    return 301 https://\$server_name\$request_uri;
}

# 前端 - HTTPS
server {
    listen 443 ssl http2;
    server_name xiaomanxia.com www.xiaomanxia.com;

    # SSL 证书路径（根据实际路径修改）
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

# API 站点配置（后端）
cat > "$NGINX_CONF_DIR/api.xiaomanxia.com.conf" << EOF
# 后端 API - HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name api.xiaomanxia.com;
    return 301 https://\$server_name\$request_uri;
}

# 后端 API - HTTPS
server {
    listen 443 ssl http2;
    server_name api.xiaomanxia.com;

    # SSL 证书路径（根据实际路径修改）
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

# 5. 测试 Nginx 配置
echo ""
echo "5. 测试 Nginx 配置..."
nginx -t

# 6. 启动服务
echo ""
echo "6. 启动服务..."

# 如果 frps 已存在，启动它
if [ -f "$FRP_DIR/frps" ]; then
    systemctl daemon-reload
    systemctl enable frps
    systemctl restart frps
    echo "✓ FRP 服务器端已启动"
else
    echo "⚠ 警告: $FRP_DIR/frps 不存在，请先上传 frps 可执行文件"
fi

# 启动 Nginx
systemctl enable nginx
systemctl restart nginx
echo "✓ Nginx 已启动"

# 7. 防火墙配置
echo ""
echo "7. 配置防火墙..."
if command -v firewall-cmd &> /dev/null; then
    firewall-cmd --permanent --add-port=7000/tcp
    firewall-cmd --permanent --add-service=http
    firewall-cmd --permanent --add-service=https
    firewall-cmd --reload
    echo "✓ 防火墙已配置"
elif command -v ufw &> /dev/null; then
    ufw allow 7000/tcp
    ufw allow 80/tcp
    ufw allow 443/tcp
    echo "✓ 防火墙已配置"
fi

echo ""
echo "=========================================="
echo "配置完成！"
echo "=========================================="
echo ""
echo "重要提示："
echo "1. 请确保 SSL 证书路径正确: /etc/nginx/ssl/xiaomanxia.com/"
echo "2. 如果证书路径不同，请修改 Nginx 配置文件中的证书路径"
echo "3. 检查域名 DNS 解析是否指向服务器 IP: $SERVER_IP"
echo ""
echo "服务状态："
echo "  - 查看 frps 状态: systemctl status frps"
echo "  - 查看 nginx 状态: systemctl status nginx"
echo "  - 查看 frps 日志: tail -f $FRP_DIR/frps.log"
echo "  - 查看 nginx 日志: tail -f /var/log/nginx/error.log"
echo ""
echo "访问地址："
echo "  - 前端: https://xiaomanxia.com"
echo "  - 后端: https://api.xiaomanxia.com"
