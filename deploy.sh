#!/bin/bash
# 自动部署脚本 - 同步代码到远程服务器并重新构建

set -e

REMOTE_HOST="43.138.38.254"
REMOTE_USER="ubuntu"
REMOTE_DIR="/home/ubuntu/designer-platform"
LOCAL_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "🚀 开始部署到 ${REMOTE_HOST}..."

# 1. 同步源代码（排除 node_modules、.next 等）
echo "📦 同步文件..."
rsync -avz --delete \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='.git' \
  --exclude='uploads' \
  --exclude='dev.db' \
  --exclude='*.log' \
  --exclude='.env*' \
  --exclude='test_*' \
  --exclude='fix_*' \
  --exclude='quick-*' \
  --exclude='scripts/backup.sh' \
  "${LOCAL_DIR}/" "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/"

# 2. 远程构建并重启
echo "🔨 远程构建并重启服务..."
ssh ${REMOTE_USER}@${REMOTE_HOST} << 'REMOTE_SCRIPT'
cd /home/ubuntu/designer-platform

echo "🧹 清理旧构建..."
rm -rf .next

echo "📥 安装依赖..."
npm install 2>&1 | tail -3

# 安装 Linux 平台原生模块（Tailwind v4 / lightningcss 需要）
npm install lightningcss-linux-x64-gnu @tailwindcss/oxide-linux-x64-gnu --no-save 2>&1 | tail -3

echo "🔧 生成 Prisma Client..."
npx prisma generate 2>&1 | tail -2
npx prisma db push --accept-data-loss 2>&1 | tail -3

echo "🏗️ 构建项目..."
npx next build 2>&1 | tail -10

echo "♻️ 重启服务..."
pm2 restart designer-platform 2>&1 | tail -3
pm2 save 2>&1 | tail -1

echo "✅ 部署完成！"
REMOTE_SCRIPT

echo "🎉 部署成功！"
