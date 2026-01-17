#!/bin/bash

echo "========================================="
echo "项目空间优化脚本"
echo "========================================="
echo ""

# 显示优化前的空间占用
echo "📊 优化前空间占用："
du -sh . 2>/dev/null
echo ""

# 1. 清理 npm 缓存（不影响项目，可以随时重建）
if [ -d "frontend/node_modules/.cache" ]; then
    echo "🧹 清理 npm 缓存..."
    rm -rf frontend/node_modules/.cache
    echo "✅ 已清理 frontend/node_modules/.cache (约544MB)"
fi

# 2. 清理构建产物（生产环境建议保留，开发环境可清理）
read -p "是否清理 frontend/build 目录？(y/n, 默认为n): " clean_build
if [ "$clean_build" = "y" ] || [ "$clean_build" = "Y" ]; then
    if [ -d "frontend/build" ]; then
        rm -rf frontend/build
        echo "✅ 已清理 frontend/build (约30MB)"
        echo "💡 提示：需要时运行 'cd frontend && npm run build' 重新构建"
    fi
fi

# 3. 清理 Python 缓存
echo "🧹 清理 Python 缓存文件..."
find backend -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null
find backend -type f -name "*.pyc" -delete 2>/dev/null
find backend -type f -name "*.pyo" -delete 2>/dev/null
echo "✅ 已清理 Python 缓存"

# 4. 显示优化后的空间占用
echo ""
echo "📊 优化后空间占用："
du -sh . 2>/dev/null

echo ""
echo "========================================="
echo "优化完成！"
echo "========================================="
echo ""
echo "💡 其他可优化项（需手动确认）："
echo "   - frontend/node_modules (1.1GB) - 可删除后重新 npm install"
echo "   - backend/venv (86MB) - 可删除后重新创建虚拟环境"
echo "   - backend/media (27MB) - 包含用户数据，请谨慎操作"
echo ""
