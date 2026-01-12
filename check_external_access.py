#!/usr/bin/env python3
"""
检查外网访问状态
"""

import requests
import socket
import json
from datetime import datetime

def check_service(url, name):
    """检查服务状态"""
    try:
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            print(f"✅ {name}: {url} - 正常")
            return True
        else:
            print(f"❌ {name}: {url} - 状态码: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ {name}: {url} - 错误: {str(e)}")
        return False

def check_port(host, port):
    """检查端口是否开放"""
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(3)
        result = sock.connect_ex((host, port))
        sock.close()
        if result == 0:
            print(f"✅ 端口 {port}: 开放")
            return True
        else:
            print(f"❌ 端口 {port}: 关闭")
            return False
    except Exception as e:
        print(f"❌ 端口 {port}: 检查失败 - {str(e)}")
        return False

def main():
    print("🔍 外网访问状态检查")
    print("=" * 50)
    print(f"检查时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # 公网IP地址
    public_ip = "8.153.95.63"
    
    print("📡 端口检查:")
    print("-" * 30)
    
    # 检查各个端口
    ports = [80, 3000, 8000, 8001]
    for port in ports:
        check_port(public_ip, port)
    
    print()
    print("🌐 服务访问检查:")
    print("-" * 30)
    
    # 检查各个服务
    services = [
        (f"http://{public_ip}:3000", "前端服务"),
        (f"http://{public_ip}:8000/api/moments/posts/", "后端API"),
        (f"http://{public_ip}:8000/admin/", "管理后台"),
        (f"http://{public_ip}:80", "反向代理"),
    ]
    
    results = []
    for url, name in services:
        results.append(check_service(url, name))
    
    print()
    print("📊 检查结果统计:")
    print("-" * 30)
    
    total = len(results)
    success = sum(results)
    failed = total - success
    
    print(f"总检查项: {total}")
    print(f"成功: {success}")
    print(f"失败: {failed}")
    print(f"成功率: {success/total*100:.1f}%")
    
    if success == total:
        print("\n🎉 所有服务都可以正常外网访问！")
    else:
        print(f"\n⚠️  有 {failed} 个服务无法外网访问")
        print("\n🔧 建议检查:")
        print("1. 服务器安全组/防火墙设置")
        print("2. FRP隧道连接状态")
        print("3. 服务是否正常运行")
        print("4. 网络连接状态")

if __name__ == "__main__":
    main()