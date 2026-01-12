#!/usr/bin/env python3
"""
简单的反向代理服务器，用于将80端口转发到3000和8001端口
"""

import http.server
import socketserver
import urllib.request
import urllib.error
import json
from urllib.parse import urlparse, urljoin

class ProxyHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        self.handle_request('GET')
    
    def do_POST(self):
        self.handle_request('POST')
    
    def do_PUT(self):
        self.handle_request('PUT')
    
    def do_DELETE(self):
        self.handle_request('DELETE')
    
    def do_OPTIONS(self):
        self.handle_request('OPTIONS')
    
    def handle_request(self, method):
        try:
            # 根据路径决定转发到哪个服务
            if self.path.startswith('/api/') or self.path.startswith('/admin/'):
                # 转发到后端服务
                target_url = f'http://127.0.0.1:8000{self.path}'
            else:
                # 转发到前端服务
                target_url = f'http://127.0.0.1:3000{self.path}'
            
            # 准备请求头
            headers = {}
            for key, value in self.headers.items():
                if key.lower() not in ['host', 'connection']:
                    headers[key] = value
            
            # 如果是POST/PUT请求，读取请求体
            data = None
            if method in ['POST', 'PUT']:
                content_length = int(self.headers.get('Content-Length', 0))
                if content_length > 0:
                    data = self.rfile.read(content_length)
            
            # 创建请求
            req = urllib.request.Request(
                target_url,
                data=data,
                headers=headers,
                method=method
            )
            
            # 发送请求并获取响应
            try:
                with urllib.request.urlopen(req) as response:
                    # 读取响应内容
                    content = response.read()
                    
                    # 设置响应状态码
                    self.send_response(response.status)
                    
                    # 复制响应头
                    for key, value in response.headers.items():
                        if key.lower() not in ['connection', 'transfer-encoding']:
                            self.send_header(key, value)
                    
                    # 添加CORS头
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                    self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
                    
                    self.end_headers()
                    
                    # 写入响应内容
                    self.wfile.write(content)
                    
            except urllib.error.HTTPError as e:
                # 处理HTTP错误
                self.send_response(e.code)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                
                error_response = {
                    'error': str(e),
                    'status': e.code,
                    'reason': e.reason
                }
                self.wfile.write(json.dumps(error_response).encode())
                
        except Exception as e:
            # 处理其他错误
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            error_response = {
                'error': 'Internal Server Error',
                'message': str(e)
            }
            self.wfile.write(json.dumps(error_response).encode())
    
    def log_message(self, format, *args):
        """自定义日志格式"""
        print(f"[PROXY] {self.address_string()} - {format % args}")

def run_proxy_server(port=80):
    """运行代理服务器"""
    with socketserver.TCPServer(("", port), ProxyHandler) as httpd:
        print(f"[PROXY] 代理服务器启动，监听端口 {port}")
        print(f"[PROXY] 前端服务: http://127.0.0.1:3000")
        print(f"[PROXY] 后端服务: http://127.0.0.1:8001")
        print(f"[PROXY] 访问地址: http://localhost:{port}")
        print("[PROXY] 按 Ctrl+C 停止服务")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n[PROXY] 代理服务器已停止")

if __name__ == '__main__':
    import sys
    
    # 检查端口参数
    port = 80
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            print(f"[PROXY] 无效的端口号: {sys.argv[1]}")
            sys.exit(1)
    
    # 检查端口是否被占用
    import socket
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.bind(('', port))
        sock.close()
    except OSError:
        print(f"[PROXY] 端口 {port} 已被占用")
        sys.exit(1)
    
    run_proxy_server(port)