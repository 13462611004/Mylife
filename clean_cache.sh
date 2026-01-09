#!/bin/bash

# 定期清理前端缓存的脚本
# 可以添加到crontab中定期执行

PROJECT_DIR="/home/SOLO/Mylife"
FRONTEND_DIR="$PROJECT_DIR/frontend"

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== 前端缓存清理脚本 ===${NC}"
echo "时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

cd $FRONTEND_DIR || exit 1

if [ -d "node_modules/.cache" ]; then
    CACHE_SIZE=$(du -sh node_modules/.cache 2>/dev/null | cut -f1)
    CACHE_SIZE_BYTES=$(du -sb node_modules/.cache 2>/dev/null | cut -f1)
    
    # 如果缓存大于200MB，则清理
    if [ -n "$CACHE_SIZE_BYTES" ] && [ "$CACHE_SIZE_BYTES" -gt 209715200 ]; then
        echo -e "${YELLOW}检测到缓存大小: ${CACHE_SIZE} (超过200MB)${NC}"
        rm -rf node_modules/.cache
        echo -e "${GREEN}✓ 缓存已清理，释放空间: ${CACHE_SIZE}${NC}"
    else
        echo -e "${GREEN}✓ 缓存大小正常: ${CACHE_SIZE}，无需清理${NC}"
    fi
else
    echo -e "${GREEN}✓ 缓存目录不存在，无需清理${NC}"
fi

echo ""
echo -e "${YELLOW}磁盘使用情况:${NC}"
df -h / | tail -1

echo ""
echo -e "${GREEN}清理完成！${NC}"
