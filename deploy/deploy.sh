#!/bin/bash

# 影片随机抽取应用部署脚本

set -e

echo "==================================="
echo "影片随机抽取应用部署脚本"
echo "==================================="

# 检查是否为root用户
if [ "$EUID" -ne 0 ]; then
  echo "请使用root权限运行此脚本"
  exit 1
fi

# 安装系统依赖
echo ">>> 安装系统依赖..."
apt-get update
apt-get install -y curl wget git build-essential

# 安装Node.js 20
echo ">>> 安装Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# 安装PM2
echo ">>> 安装PM2..."
npm install -g pm2

# 安装Puppeteer依赖
echo ">>> 安装Puppeteer系统依赖..."
apt-get install -y \
  libatk1.0-0 libatk-bridge2.0-0 libcups2 libxkbcommon0 \
  libxcomposite1 libxdamage1 libxrandr2 libgbm1 libpango-1.0-0 \
  libcairo2 libasound2 libnspr4 libnss3 libxss1 libappindicator3-1 \
  libxtst6 fonts-liberation libappindicator3-1 libgbm1 libnss3

# 安装MongoDB
echo ">>> 安装MongoDB 7.0..."
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
apt-get update
apt-get install -y mongodb-org

# 启动MongoDB
echo ">>> 启动MongoDB服务..."
systemctl start mongod
systemctl enable mongod

# 验证MongoDB
if systemctl is-active --quiet mongod; then
  echo "✓ MongoDB安装成功并正在运行"
else
  echo "✗ MongoDB启动失败,请检查日志"
  exit 1
fi

# 安装Nginx
echo ">>> 安装Nginx..."
apt-get install -y nginx

# 安装Certbot (Let's Encrypt)
echo ">>> 安装Certbot..."
apt-get install -y certbot python3-certbot-nginx

# 创建应用目录
echo ">>> 创建应用目录..."
APP_DIR="/var/www/random-movie"
mkdir -p $APP_DIR
mkdir -p $APP_DIR/logs

# 设置权限
chown -R $SUDO_USER:$SUDO_USER $APP_DIR

echo "==================================="
echo "基础环境安装完成!"
echo "==================================="
echo ""
echo "后续步骤:"
echo "1. 将项目代码上传到 $APP_DIR"
echo "2. 配置环境变量: cp .env.local.example .env.local"
echo "3. 编辑 .env.local 设置 NEXTAUTH_URL 和 NEXTAUTH_SECRET"
echo "   (MONGODB_URI已配置为本地MongoDB: mongodb://localhost:27017/random-movie)"
echo "4. 安装依赖: cd $APP_DIR && npm install"
echo "5. 构建项目: npm run build"
echo "6. 启动应用: pm2 start deploy/ecosystem.config.js"
echo "7. 配置Nginx: 复制 deploy/nginx.conf.example 到 /etc/nginx/sites-available/"
echo "8. 配置SSL: certbot --nginx -d your-domain.com"
echo ""
echo "MongoDB管理命令:"
echo "  查看状态: sudo systemctl status mongod"
echo "  重启服务: sudo systemctl restart mongod"
echo "  查看日志: sudo journalctl -u mongod"
echo "  连接数据库: mongosh"
echo ""
echo "完成!"
