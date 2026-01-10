#!/bin/bash
# 低IOPS优化启动脚本 - 前后端服务启动脚本

set -e

PROJECT_DIR="/home/SOLO/Mylife"
BACKEND_DIR="${PROJECT_DIR}/backend"
FRONTEND_DIR="${PROJECT_DIR}/frontend"
PID_BACKEND="${PROJECT_DIR}/.backend.pid"
PID_FRONTEND="${PROJECT_DIR}/.frontend.pid"

# 颜色输出
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

start_backend() {
    echo -e "${GREEN}启动后端服务（Django）...${NC}"
    
    if [ -f "$PID_BACKEND" ] && ps -p $(cat "$PID_BACKEND") > /dev/null 2>&1; then
        echo -e "${YELLOW}后端服务已在运行（PID: $(cat $PID_BACKEND)）${NC}"
        return 1
    fi
    
    cd "$BACKEND_DIR"
    source venv/bin/activate
    
    # 使用 --noreload 减少文件监听，降低IOPS
    # 输出重定向到 /dev/null 减少日志IO
    nohup python manage.py runserver 0.0.0.0:8000 --noreload > /dev/null 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > "$PID_BACKEND"
    
    # 等待服务启动
    sleep 2
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        echo -e "${GREEN}✓ 后端服务启动成功（PID: $BACKEND_PID，端口: 8000）${NC}"
        return 0
    else
        echo -e "${RED}✗ 后端服务启动失败${NC}"
        rm -f "$PID_BACKEND"
        return 1
    fi
}

start_frontend() {
    echo -e "${GREEN}启动前端服务（React）...${NC}"
    
    if [ -f "$PID_FRONTEND" ] && ps -p $(cat "$PID_FRONTEND") > /dev/null 2>&1; then
        echo -e "${YELLOW}前端服务已在运行（PID: $(cat $PID_FRONTEND)）${NC}"
        return 1
    fi
    
    cd "$FRONTEND_DIR"
    
    # 禁用source map生成，减少IO
    # 禁用自动打开浏览器，减少IO
    # 输出重定向到 /dev/null 减少日志IO
    BROWSER=none GENERATE_SOURCEMAP=false nohup npm start > /dev/null 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > "$PID_FRONTEND"
    
    # 等待服务启动（前端需要更长时间）
    echo -e "${YELLOW}等待前端服务启动（约10-15秒）...${NC}"
    for i in {1..15}; do
        sleep 1
        if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null | grep -q "200"; then
            # 找到实际的React进程PID
            ACTUAL_PID=$(pgrep -f "react-scripts start" | head -1)
            if [ -n "$ACTUAL_PID" ]; then
                echo $ACTUAL_PID > "$PID_FRONTEND"
                echo -e "${GREEN}✓ 前端服务启动成功（PID: $ACTUAL_PID，端口: 3000）${NC}"
                return 0
            fi
        fi
    done
    
    # 如果超时，尝试查找实际PID
    ACTUAL_PID=$(pgrep -f "react-scripts start" | head -1)
    if [ -n "$ACTUAL_PID" ]; then
        echo $ACTUAL_PID > "$PID_FRONTEND"
        echo -e "${GREEN}✓ 前端服务已启动（PID: $ACTUAL_PID，端口: 3000）${NC}"
        return 0
    else
        echo -e "${RED}✗ 前端服务启动失败或超时${NC}"
        rm -f "$PID_FRONTEND"
        return 1
    fi
}

stop_backend() {
    echo -e "${YELLOW}停止后端服务...${NC}"
    if [ -f "$PID_BACKEND" ]; then
        PID=$(cat "$PID_BACKEND")
        if ps -p $PID > /dev/null 2>&1; then
            kill $PID 2>/dev/null
            sleep 1
            # 如果还在运行，强制杀死
            if ps -p $PID > /dev/null 2>&1; then
                kill -9 $PID 2>/dev/null
            fi
            echo -e "${GREEN}✓ 后端服务已停止${NC}"
        else
            echo -e "${YELLOW}后端服务进程不存在${NC}"
        fi
        rm -f "$PID_BACKEND"
    else
        # 如果没有PID文件，尝试通过进程名停止
        pkill -f "manage.py runserver" 2>/dev/null && echo -e "${GREEN}✓ 后端服务已停止${NC}" || echo -e "${YELLOW}未找到后端服务进程${NC}"
    fi
}

stop_frontend() {
    echo -e "${YELLOW}停止前端服务...${NC}"
    if [ -f "$PID_FRONTEND" ]; then
        PID=$(cat "$PID_FRONTEND")
        if ps -p $PID > /dev/null 2>&1; then
            kill $PID 2>/dev/null
            sleep 1
            # 如果还在运行，强制杀死
            if ps -p $PID > /dev/null 2>&1; then
                kill -9 $PID 2>/dev/null
            fi
            echo -e "${GREEN}✓ 前端服务已停止${NC}"
        else
            echo -e "${YELLOW}前端服务进程不存在${NC}"
        fi
        rm -f "$PID_FRONTEND"
    else
        # 如果没有PID文件，尝试通过进程名停止
        pkill -f "react-scripts start" 2>/dev/null && echo -e "${GREEN}✓ 前端服务已停止${NC}" || echo -e "${YELLOW}未找到前端服务进程${NC}"
    fi
}

status() {
    echo -e "${GREEN}=== 服务状态 ===${NC}"
    
    # 检查后端
    BACKEND_PID=$(pgrep -f "manage.py runserver" | head -1)
    if [ -n "$BACKEND_PID" ]; then
        echo -e "${GREEN}后端: 运行中 (PID: $BACKEND_PID)${NC}"
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/api/marathon/ 2>/dev/null)
        if [ "$HTTP_CODE" = "200" ]; then
            echo -e "  ${GREEN}状态码: $HTTP_CODE ✓${NC}"
        else
            echo -e "  ${YELLOW}状态码: $HTTP_CODE${NC}"
        fi
        echo $BACKEND_PID > "$PID_BACKEND" 2>/dev/null  # 更新PID文件
    else
        echo -e "${RED}后端: 未运行${NC}"
        rm -f "$PID_BACKEND" 2>/dev/null
    fi
    
    # 检查前端（多种匹配方式）
    FRONTEND_PID=$(pgrep -f "react-scripts.*start.js" | head -1)
    if [ -z "$FRONTEND_PID" ]; then
        FRONTEND_PID=$(pgrep -f "react-scripts start" | head -1)
    fi
    if [ -z "$FRONTEND_PID" ]; then
        FRONTEND_PID=$(lsof -ti :3000 2>/dev/null | head -1)
    fi
    if [ -n "$FRONTEND_PID" ]; then
        echo -e "${GREEN}前端: 运行中 (PID: $FRONTEND_PID)${NC}"
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null)
        if [ "$HTTP_CODE" = "200" ]; then
            echo -e "  ${GREEN}状态码: $HTTP_CODE ✓${NC}"
        else
            echo -e "  ${YELLOW}状态码: $HTTP_CODE (可能还在启动中...)${NC}"
        fi
        echo $FRONTEND_PID > "$PID_FRONTEND" 2>/dev/null  # 更新PID文件
    else
        echo -e "${RED}前端: 未运行${NC}"
        rm -f "$PID_FRONTEND" 2>/dev/null
    fi
}

case "$1" in
    start)
        start_backend
        start_frontend
        status
        ;;
    stop)
        stop_backend
        stop_frontend
        ;;
    restart)
        stop_backend
        stop_frontend
        sleep 2
        start_backend
        start_frontend
        status
        ;;
    status)
        status
        ;;
    backend)
        case "$2" in
            start) start_backend ;;
            stop) stop_backend ;;
            restart) stop_backend && sleep 1 && start_backend ;;
            *) echo "用法: $0 backend {start|stop|restart}" ;;
        esac
        ;;
    frontend)
        case "$2" in
            start) start_frontend ;;
            stop) stop_frontend ;;
            restart) stop_frontend && sleep 2 && start_frontend ;;
            *) echo "用法: $0 frontend {start|stop|restart}" ;;
        esac
        ;;
    *)
        echo "用法: $0 {start|stop|restart|status|backend|frontend}"
        echo ""
        echo "命令:"
        echo "  start       - 启动前后端服务"
        echo "  stop        - 停止前后端服务"
        echo "  restart     - 重启前后端服务"
        echo "  status      - 查看服务状态"
        echo "  backend     - 管理后端服务 (start/stop)"
        echo "  frontend    - 管理前端服务 (start/stop)"
        exit 1
        ;;
esac
