#!/bin/bash
# 启动外网访问服务的完整脚本

echo "🚀 启动外网访问服务..."
echo "======================================"

# 检查并启动后端服务
echo "📡 检查后端服务..."
if ! pgrep -f "manage.py.*runserver" > /dev/null; then
    echo "启动后端服务..."
    cd /Users/wangliang/Desktop/Mylife/backend
    source venv/bin/activate
    nohup python manage.py runserver 0.0.0.0:8000 > /tmp/backend.log 2>&1 &
    sleep 3
    if pgrep -f "manage.py.*runserver" > /dev/null; then
        echo "✅ 后端服务启动成功"
    else
        echo "❌ 后端服务启动失败"
        exit 1
    fi
else
    echo "✅ 后端服务已在运行"
fi

# 检查并启动前端服务
echo "📡 检查前端服务..."
if ! pgrep -f "react-scripts.*start" > /dev/null; then
    echo "启动前端服务..."
    cd /Users/wangliang/Desktop/Mylife/frontend
    nohup npm start > /tmp/frontend.log 2>&1 &
    sleep 5
    if pgrep -f "react-scripts.*start" > /dev/null; then
        echo "✅ 前端服务启动成功"
    else
        echo "❌ 前端服务启动失败"
        exit 1
    fi
else
    echo "✅ 前端服务已在运行"
fi

# 启动反向代理
echo "📡 启动反向代理服务..."
cd /Users/wangliang/Desktop/Mylife
if ! pgrep -f "simple_proxy.py" > /dev/null; then
    echo "启动反向代理..."
    nohup python3 simple_proxy.py 80 > /tmp/proxy.log 2>&1 &
    sleep 2
    if pgrep -f "simple_proxy.py" > /dev/null; then
        echo "✅ 反向代理启动成功"
    else
        echo "❌ 反向代理启动失败"
        exit 1
    fi
else
    echo "✅ 反向代理已在运行"
fi

# 启动FRP服务
echo "📡 启动FRP隧道服务..."
cd /Users/wangliang/Desktop/Mylife/frp
if ! pgrep -f "frpc.*frpc.toml" > /dev/null; then
    echo "启动FRP客户端..."
    nohup ./frpc -c frpc.toml > /tmp/frpc.log 2>&1 &
    sleep 3
    if pgrep -f "frpc.*frpc.toml" > /dev/null; then
        echo "✅ FRP客户端启动成功"
    else
        echo "❌ FRP客户端启动失败"
        exit 1
    fi
else
    echo "✅ FRP客户端已在运行"
fi

echo ""
echo "🎉 所有服务启动完成！"
echo "======================================"
echo "服务状态:"
echo "  后端服务: http://localhost:8000"
echo "  前端服务: http://localhost:3000"
echo "  反向代理: http://localhost:80"
echo "  外网访问: http://8.153.95.63:3000 或 http://8.153.95.63:8000"
echo ""
echo "📋 日志文件:"
echo "  后端日志: tail -f /tmp/backend.log"
echo "  前端日志: tail -f /tmp/frontend.log"
echo "  代理日志: tail -f /tmp/proxy.log"
echo "  FRP日志:  tail -f /tmp/frpc.log"