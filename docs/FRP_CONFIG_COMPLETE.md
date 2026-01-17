# FRP 配置完成总结

## ✅ 配置状态

### 服务器端 (8.153.81.3)
- ✅ FRP 服务端 (frps) 运行中，监听端口：
  - 7000 (控制端口)
  - 8080 (HTTP 代理端口)
- ✅ Nginx 运行中，监听端口：
  - 80 (HTTP)
  - 443 (HTTPS，需要配置 SSL 证书)
- ✅ 防火墙已配置

### 本地客户端
- ✅ FRP 客户端 (frpc) 运行中
- ✅ 所有代理已启动：
  - ✅ frontend (HTTP) - 域名: xiaomanxia.com, www.xiaomanxia.com
  - ✅ backend (HTTP) - 域名: api.xiaomanxia.com
  - ✅ frontend-tcp (TCP) - 端口: 3000
  - ✅ backend-tcp (TCP) - 端口: 8000

## 🌐 访问地址

### HTTP 访问（当前可用）
- **前端**: http://xiaomanxia.com 或 http://www.xiaomanxia.com
- **后端 API**: http://api.xiaomanxia.com

### TCP 直接访问（备用）
- **前端**: http://8.153.81.3:3000
- **后端**: http://8.153.81.3:8000

### HTTPS 访问（需要配置 SSL 证书）
配置 SSL 证书后，可通过以下地址访问：
- **前端**: https://xiaomanxia.com 或 https://www.xiaomanxia.com
- **后端 API**: https://api.xiaomanxia.com

## 📋 重要提示

### 1. DNS 配置
确保以下域名都解析到服务器 IP `8.153.81.3`：
- `xiaomanxia.com` → A 记录 → 8.153.81.3
- `www.xiaomanxia.com` → A 记录 → 8.153.81.3 或 CNAME → xiaomanxia.com
- `api.xiaomanxia.com` → A 记录 → 8.153.81.3

### 2. SSL 证书配置
当前 Nginx 配置使用 HTTP（端口 80）。要启用 HTTPS：

1. 将 SSL 证书文件上传到服务器：
   ```bash
   # 证书文件路径
   /etc/nginx/ssl/xiaomanxia.com/fullchain.pem
   /etc/nginx/ssl/xiaomanxia.com/privkey.pem
   ```

2. 如果证书路径不同，修改 Nginx 配置：
   ```bash
   ssh root@8.153.81.3
   vim /etc/nginx/conf.d/xiaomanxia.com.conf
   vim /etc/nginx/conf.d/api.xiaomanxia.com.conf
   # 修改 ssl_certificate 和 ssl_certificate_key 路径
   nginx -t
   systemctl restart nginx
   ```

### 3. 服务管理

#### 本地 FRP 客户端
```bash
# 启动
./start_frp.sh start

# 停止
./start_frp.sh stop

# 重启
./start_frp.sh restart

# 查看状态
./start_frp.sh status

# 查看日志
./start_frp.sh logs
```

#### 服务器端服务
```bash
# 查看 FRP 服务端状态
ssh root@8.153.81.3 'systemctl status frps'

# 查看 Nginx 状态
ssh root@8.153.81.3 'systemctl status nginx'

# 查看 FRP 日志
ssh root@8.153.81.3 'tail -f /opt/frp/frps.log'

# 查看 Nginx 日志
ssh root@8.153.81.3 'tail -f /var/log/nginx/error.log'
```

## 🔧 配置文件位置

### 本地
- FRP 客户端配置: `frp/frpc.ini`
- FRP 客户端日志: `frp/frpc.log`
- 管理脚本: `start_frp.sh`

### 服务器端
- FRP 服务端配置: `/opt/frp/frps.toml`
- FRP 服务端日志: `/opt/frp/frps.log`
- Nginx 前端配置: `/etc/nginx/conf.d/xiaomanxia.com.conf`
- Nginx API 配置: `/etc/nginx/conf.d/api.xiaomanxia.com.conf`

## 🎉 配置完成！

现在您可以通过域名访问本地服务了！

- 前端: http://xiaomanxia.com
- 后端: http://api.xiaomanxia.com

如果需要配置 HTTPS，请按照上面的 SSL 证书配置步骤操作。
