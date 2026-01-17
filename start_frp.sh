#!/bin/bash
# FRP 客户端管理脚本

PROJECT_DIR="/Users/wangliang/Desktop/Mylife"
FRP_DIR="${PROJECT_DIR}/frp"
PID_FRPC="${PROJECT_DIR}/.frpc.pid"
FRPC_LOG="${FRP_DIR}/frpc.log"

# 颜色输出
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

start_frpc() {
    echo -e "${GREEN}启动 FRP 客户端...${NC}"
    
    if [ -f "$PID_FRPC" ] && ps -p $(cat "$PID_FRPC") > /dev/null 2>&1; then
        echo -e "${YELLOW}FRP 客户端已在运行（PID: $(cat $PID_FRPC)）${NC}"
        return 1
    fi
    
    cd "$FRP_DIR"
    
    # 检查 frpc 可执行文件
    if [ ! -f "./frpc" ]; then
        echo -e "${RED}✗ frpc 可执行文件不存在${NC}"
        return 1
    fi
    
    # 检查配置文件
    if [ ! -f "frpc.toml" ]; then
        echo -e "${RED}✗ frpc.toml 配置文件不存在${NC}"
        return 1
    fi
    
    # 启动 frpc (使用 ini 格式，因为 toml 格式可能有兼容性问题)
    nohup ./frpc -c frpc.ini > "$FRPC_LOG" 2>&1 &
    FRPC_PID=$!
    echo $FRPC_PID > "$PID_FRPC"
    
    # 等待服务启动
    sleep 2
    if ps -p $FRPC_PID > /dev/null 2>&1; then
        echo -e "${GREEN}✓ FRP 客户端启动成功（PID: $FRPC_PID）${NC}"
        echo -e "${YELLOW}等待连接建立...${NC}"
        sleep 3
        if grep -q "start proxy success" "$FRPC_LOG" 2>/dev/null; then
            echo -e "${GREEN}✓ FRP 隧道连接成功${NC}"
        else
            echo -e "${YELLOW}检查日志: tail -f $FRPC_LOG${NC}"
        fi
        return 0
    else
        echo -e "${RED}✗ FRP 客户端启动失败${NC}"
        echo "查看日志: cat $FRPC_LOG"
        rm -f "$PID_FRPC"
        return 1
    fi
}

stop_frpc() {
    echo -e "${YELLOW}停止 FRP 客户端...${NC}"
    if [ -f "$PID_FRPC" ]; then
        PID=$(cat "$PID_FRPC")
        if ps -p $PID > /dev/null 2>&1; then
            kill $PID 2>/dev/null
            sleep 1
            if ps -p $PID > /dev/null 2>&1; then
                kill -9 $PID 2>/dev/null
            fi
            echo -e "${GREEN}✓ FRP 客户端已停止${NC}"
        else
            echo -e "${YELLOW}FRP 客户端进程不存在${NC}"
        fi
        rm -f "$PID_FRPC"
    else
        pkill -f "frpc.*frpc" 2>/dev/null && echo -e "${GREEN}✓ FRP 客户端已停止${NC}" || echo -e "${YELLOW}未找到 FRP 客户端进程${NC}"
    fi
}

status_frpc() {
    echo -e "${GREEN}=== FRP 客户端状态 ===${NC}"
    
    FRPC_PID=$(pgrep -f "frpc.*frpc" | head -1)
    if [ -n "$FRPC_PID" ]; then
        echo -e "${GREEN}FRP 客户端: 运行中 (PID: $FRPC_PID)${NC}"
        echo $FRPC_PID > "$PID_FRPC" 2>/dev/null
        
        # 检查日志中的连接状态
        if [ -f "$FRPC_LOG" ]; then
            if grep -q "start proxy success" "$FRPC_LOG" 2>/dev/null; then
                echo -e "  ${GREEN}隧道状态: 已连接 ✓${NC}"
            else
                echo -e "  ${YELLOW}隧道状态: 连接中或失败${NC}"
            fi
            echo ""
            echo -e "${YELLOW}最近日志:${NC}"
            tail -5 "$FRPC_LOG" 2>/dev/null | sed 's/^/  /'
        fi
    else
        echo -e "${RED}FRP 客户端: 未运行${NC}"
        rm -f "$PID_FRPC" 2>/dev/null
    fi
}

show_logs() {
    if [ -f "$FRPC_LOG" ]; then
        echo -e "${YELLOW}FRP 客户端日志（按 Ctrl+C 退出）:${NC}"
        tail -f "$FRPC_LOG"
    else
        echo -e "${RED}日志文件不存在: $FRPC_LOG${NC}"
    fi
}

case "$1" in
    start)
        start_frpc
        ;;
    stop)
        stop_frpc
        ;;
    restart)
        stop_frpc
        sleep 2
        start_frpc
        ;;
    status)
        status_frpc
        ;;
    logs)
        show_logs
        ;;
    *)
        echo "用法: $0 {start|stop|restart|status|logs}"
        echo ""
        echo "命令:"
        echo "  start    - 启动 FRP 客户端"
        echo "  stop     - 停止 FRP 客户端"
        echo "  restart  - 重启 FRP 客户端"
        echo "  status   - 查看 FRP 客户端状态"
        echo "  logs     - 查看 FRP 客户端日志"
        exit 1
        ;;
esac
