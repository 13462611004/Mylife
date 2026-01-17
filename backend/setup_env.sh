#!/bin/bash
# 环境变量快速设置脚本

echo "🔐 配置Django环境变量..."
echo "======================================"

BACKEND_DIR="$(cd "$(dirname "$0")" && pwd)"
ENV_FILE="$BACKEND_DIR/.env"
ENV_EXAMPLE="$BACKEND_DIR/.env.example"

# 检查是否已存在.env文件
if [ -f "$ENV_FILE" ]; then
    echo "⚠️  .env 文件已存在"
    read -p "是否覆盖现有配置? [y/N]: " overwrite
    if [[ ! $overwrite =~ ^[Yy]$ ]]; then
        echo "取消操作"
        exit 0
    fi
fi

# 检测环境（根据路径判断）
if [[ "$BACKEND_DIR" == *"/Users/wangliang"* ]]; then
    echo "检测到: 本地Mac开发环境"
    ENV_TYPE="development"
    DEFAULT_DEBUG="True"
else
    echo "检测到: 云服务器生产环境"
    ENV_TYPE="production"
    DEFAULT_DEBUG="False"
fi

# 生成新的SECRET_KEY
echo ""
echo "生成新的SECRET_KEY..."
if [ -d "$BACKEND_DIR/venv" ]; then
    source "$BACKEND_DIR/venv/bin/activate"
fi

SECRET_KEY=$(python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())" 2>/dev/null)

if [ -z "$SECRET_KEY" ]; then
    echo "❌ 无法生成SECRET_KEY，请确保Django已安装"
    exit 1
fi

echo "✅ SECRET_KEY生成成功"

# 创建.env文件
cat > "$ENV_FILE" << EOF
# Django 环境变量配置
# 生成时间: $(date)

# Django SECRET_KEY
DJANGO_SECRET_KEY=$SECRET_KEY

# Django DEBUG 模式
DJANGO_DEBUG=$DEFAULT_DEBUG

# Django ALLOWED_HOSTS (可选)
# 如果不设置，将使用 settings.py 中的默认值
# DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1,xiaomanxia.com
EOF

echo ""
echo "✅ .env 文件创建成功！"
echo ""
echo "📋 配置内容:"
echo "  - DJANGO_SECRET_KEY: 已生成"
echo "  - DJANGO_DEBUG: $DEFAULT_DEBUG"
echo ""
echo "💡 如需修改配置，请编辑: $ENV_FILE"
echo ""
echo "🔍 验证配置:"
echo "  cd $BACKEND_DIR"
echo "  source venv/bin/activate"
echo "  python manage.py check --deploy"
echo ""
