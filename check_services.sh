#!/bin/bash
# 服务状态检查脚本

echo "🔍 检查个人网站服务状态..."
echo "======================================"
echo ""

# 检查前端服务
echo "📱 前端服务 (React):"
if pgrep -f "react-scripts.*start" > /dev/null; then
    echo "✅ 前端服务正在运行"
    # 检查端口
    if netstat -an | grep -q "127.0.0.1.3000.*LISTEN"; then
        echo "✅ 端口 3000 正在监听"
    else
        echo "❌ 端口 3000 未监听"
    fi
else
    echo "❌ 前端服务未运行"
fi
echo ""

# 检查后端服务
echo "🔧 后端服务 (Django):"
if pgrep -f "manage.py.*runserver" > /dev/null; then
    echo "✅ 后端服务正在运行"
    # 检查端口
    if netstat -an | grep -q "127.0.0.1.8000.*LISTEN"; then
        echo "✅ 端口 8000 正在监听"
    else
        echo "❌ 端口 8000 未监听"
    fi
else
    echo "❌ 后端服务未运行"
fi
echo ""

# 检查FRP客户端
echo "🌐 FRP 客户端:"
if pgrep -f "frpc.*frpc.toml" > /dev/null; then
    echo "✅ FRP 客户端正在运行"
else
    echo "❌ FRP 客户端未运行"
fi
echo ""

# 测试本地访问
echo "🧪 本地访问测试:"
echo "测试前端 (127.0.0.1:3000):"
if curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000 | grep -q "200"; then
    echo "✅ 前端本地访问正常"
else
    echo "❌ 前端本地访问失败"
fi

echo "测试后端 API (127.0.0.1:8000/api/moments/posts/):"
if curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8000/api/moments/posts/ | grep -q "200"; then
    echo "✅ 后端 API 本地访问正常"
else
    echo "❌ 后端 API 本地访问失败"
fi
echo ""

# 测试外网访问
echo "🌍 外网访问测试:"
echo "测试外网前端 (8.153.81.3:3000):"
if curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 http://8.153.81.3:3000 | grep -q "200"; then
    echo "✅ 外网前端访问正常"
else
    echo "❌ 外网前端访问失败 (可能是网络或防火墙问题)"
fi

echo "测试外网后端 API (8.153.81.3:8000/api/moments/posts/):"
if curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 http://8.153.81.3:8000/api/moments/posts/ | grep -q "200"; then
    echo "✅ 外网后端 API 访问正常"
else
    echo "❌ 外网后端 API 访问失败 (可能是网络或防火墙问题)"
fi
echo ""

# 总结
echo "📊 状态总结:"
echo "======================================"

# 计算服务状态
total_services=3
running_services=0

pgrep -f "react-scripts.*start" > /dev/null && ((running_services++))
pgrep -f "manage.py.*runserver" > /dev/null && ((running_services++))
pgrep -f "frpc.*frpc.toml" > /dev/null && ((running_services++))

echo "运行中的服务: $running_services/$total_services"

if [ $running_services -eq $total_services ]; then
    echo "🎉 所有服务都在正常运行！"
elif [ $running_services -gt 0 ]; then
    echo "⚠️  部分服务运行中，建议检查未运行的服务"
else
    echo "❌ 所有服务都未运行，需要启动服务"
fi

echo ""
echo "🔧 快速修复命令:"
echo "启动所有服务: cd /Users/wangliang/Desktop/Mylife && ./start_external_access.sh"
echo "查看服务日志: tail -f /tmp/backend.log 或 /tmp/frontend.log"
echo ""
echo "检查完成时间: $(date)"