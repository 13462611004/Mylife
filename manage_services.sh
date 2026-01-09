#!/bin/bash

# SOLO 项目服务管理脚本

PROJECT_DIR="/home/SOLO/Mylife"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"
VENV_DIR="$BACKEND_DIR/venv"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查服务状态
check_status() {
    echo -e "${YELLOW}检查服务状态...${NC}"
    
    # 检查后端
    if pgrep -f "python.*manage.py.*runserver" > /dev/null; then
        echo -e "${GREEN}✓ 后端服务运行中 (端口 8001)${NC}"
    else
        echo -e "${RED}✗ 后端服务未运行${NC}"
    fi
    
    # 检查前端
    if pgrep -f "react-scripts.*start" > /dev/null; then
        echo -e "${GREEN}✓ 前端服务运行中 (端口 3000)${NC}"
    else
        echo -e "${RED}✗ 前端服务未运行${NC}"
    fi
    
    # 检查Nginx
    if systemctl is-active --quiet nginx 2>/dev/null; then
        echo -e "${GREEN}✓ Nginx服务运行中${NC}"
    else
        echo -e "${YELLOW}○ Nginx服务未运行${NC}"
    fi
    
    echo ""
}

# 启动后端服务
start_backend() {
    echo -e "${YELLOW}启动后端服务...${NC}"
    cd $BACKEND_DIR
    
    if [ ! -d "$VENV_DIR" ]; then
        echo -e "${RED}虚拟环境不存在，请先创建虚拟环境${NC}"
        exit 1
    fi
    
    source $VENV_DIR/bin/activate
    
    # 检查端口是否被占用
    if lsof -Pi :8001 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${RED}端口 8001 已被占用${NC}"
        echo "请先停止占用该端口的进程："
        lsof -i :8001
        exit 1
    fi
    
    nohup python manage.py runserver 0.0.0.0:8001 > /tmp/backend.log 2>&1 &
    
    sleep 3
    
    if pgrep -f "python.*manage.py.*runserver" > /dev/null; then
        echo -e "${GREEN}✓ 后端服务启动成功${NC}"
        echo "访问地址: http://8.153.95.63:8001"
        echo "管理后台: http://8.153.95.63:8001/admin"
        echo "日志文件: /tmp/backend.log"
    else
        echo -e "${RED}✗ 后端服务启动失败${NC}"
        tail -20 /tmp/backend.log
        exit 1
    fi
}

# 停止后端服务
stop_backend() {
    echo -e "${YELLOW}停止后端服务...${NC}"
    pkill -f "python.*manage.py.*runserver"
    
    sleep 2
    
    if ! pgrep -f "python.*manage.py.*runserver" > /dev/null; then
        echo -e "${GREEN}✓ 后端服务已停止${NC}"
    else
        echo -e "${RED}✗ 后端服务停止失败${NC}"
        exit 1
    fi
}

# 启动前端服务
start_frontend() {
    echo -e "${YELLOW}启动前端服务...${NC}"
    cd $FRONTEND_DIR
    
    # 检查端口是否被占用
    if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${RED}端口 3000 已被占用${NC}"
        echo "请先停止占用该端口的进程："
        lsof -i :3000
        exit 1
    fi
    
    # 检查node_modules是否存在
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}node_modules不存在，正在安装依赖...${NC}"
        npm install
    fi
    
    nohup npm start > /tmp/frontend.log 2>&1 &
    
    sleep 5
    
    if pgrep -f "react-scripts.*start" > /dev/null; then
        echo -e "${GREEN}✓ 前端服务启动成功${NC}"
        echo "访问地址: http://8.153.95.63:3000"
        echo "日志文件: /tmp/frontend.log"
    else
        echo -e "${RED}✗ 前端服务启动失败${NC}"
        tail -20 /tmp/frontend.log
        exit 1
    fi
}

# 停止前端服务
stop_frontend() {
    echo -e "${YELLOW}停止前端服务...${NC}"
    pkill -f "react-scripts.*start"
    
    sleep 2
    
    if ! pgrep -f "react-scripts.*start" > /dev/null; then
        echo -e "${GREEN}✓ 前端服务已停止${NC}"
    else
        echo -e "${RED}✗ 前端服务停止失败${NC}"
        exit 1
    fi
}

# 启动所有服务
start_all() {
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}启动 SOLO 项目所有服务${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    
    start_backend
    echo ""
    start_frontend
    echo ""
    
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}所有服务启动完成！${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo -e "${YELLOW}访问地址：${NC}"
    echo -e "  前端: ${GREEN}http://8.153.95.63:3000${NC}"
    echo -e "  后端: ${GREEN}http://8.153.95.63:8001${NC}"
    echo -e "  管理: ${GREEN}http://8.153.95.63:8001/admin${NC}"
    echo ""
    echo -e "${YELLOW}查看日志：${NC}"
    echo "  后端: tail -f /tmp/backend.log"
    echo "  前端: tail -f /tmp/frontend.log"
}

# 停止所有服务
stop_all() {
    echo -e "${YELLOW}停止所有服务...${NC}"
    stop_backend
    stop_frontend
    echo -e "${GREEN}✓ 所有服务已停止${NC}"
}

# 重启所有服务
restart_all() {
    stop_all
    sleep 2
    start_all
}

# 查看日志
view_logs() {
    echo -e "${YELLOW}选择要查看的日志：${NC}"
    echo "1) 后端日志"
    echo "2) 前端日志"
    echo "3) 退出"
    
    read -p "请选择 [1-3]: " choice
    
    case $choice in
        1)
            tail -f /tmp/backend.log
            ;;
        2)
            tail -f /tmp/frontend.log
            ;;
        3)
            exit 0
            ;;
        *)
            echo -e "${RED}无效选择${NC}"
            exit 1
            ;;
    esac
}

# 数据库迁移
migrate_db() {
    echo -e "${YELLOW}执行数据库迁移...${NC}"
    cd $BACKEND_DIR
    source $VENV_DIR/bin/activate
    
    python manage.py makemigrations
    python manage.py migrate
    
    echo -e "${GREEN}✓ 数据库迁移完成${NC}"
}

# 创建超级管理员
create_superuser() {
    echo -e "${YELLOW}创建超级管理员账户...${NC}"
    cd $BACKEND_DIR
    source $VENV_DIR/bin/activate
    
    python manage.py createsuperuser
}

# 显示帮助信息
show_help() {
    echo "SOLO 项目服务管理脚本"
    echo ""
    echo "用法: $0 [命令]"
    echo ""
    echo "命令:"
    echo "  status      检查服务状态"
    echo "  start       启动所有服务"
    echo "  stop        停止所有服务"
    echo "  restart     重启所有服务"
    echo "  backend     仅启动后端服务"
    echo "  frontend    仅启动前端服务"
    echo "  logs        查看日志"
    echo "  migrate     执行数据库迁移"
    echo "  admin       创建超级管理员"
    echo "  help        显示此帮助信息"
    echo ""
    echo "示例:"
    echo "  $0 start       # 启动所有服务"
    echo "  $0 status      # 检查服务状态"
    echo "  $0 logs        # 查看日志"
}

# 主函数
main() {
    case "$1" in
        status)
            check_status
            ;;
        start)
            start_all
            ;;
        stop)
            stop_all
            ;;
        restart)
            restart_all
            ;;
        backend)
            start_backend
            ;;
        frontend)
            start_frontend
            ;;
        logs)
            view_logs
            ;;
        migrate)
            migrate_db
            ;;
        admin)
            create_superuser
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            echo -e "${RED}未知命令: $1${NC}"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# 执行主函数
main "$@"