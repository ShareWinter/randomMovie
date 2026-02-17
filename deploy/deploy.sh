#!/bin/bash

# 影片随机抽取应用部署脚本
# 使用方法: sudo ./deploy.sh [选项]
# 选项:
#   --ip=IP_ADDRESS    设置服务器IP地址（用于NEXTAUTH_URL）
#   --domain=DOMAIN    设置域名（用于NEXTAUTH_URL和SSL）
#   --skip-mongo       跳过MongoDB安装
#   --skip-nginx       跳过Nginx安装

set -e

# 解析参数
SKIP_MONGO=false
SKIP_NGINX=false
SERVER_IP=""
DOMAIN=""

for arg in "$@"; do
  case $arg in
    --ip=*)
      SERVER_IP="${arg#*=}"
      shift
      ;;
    --domain=*)
      DOMAIN="${arg#*=}"
      shift
      ;;
    --skip-mongo)
      SKIP_MONGO=true
      shift
      ;;
    --skip-nginx)
      SKIP_NGINX=true
      shift
      ;;
  esac
done

echo "==================================="
echo "影片随机抽取应用部署脚本"
echo "==================================="

# 检查是否为root用户
if [ "$EUID" -ne 0 ]; then
  echo "请使用root权限运行此脚本"
  exit 1
fi

# 自动检测服务器IP（如果未提供）
if [ -z "$SERVER_IP" ]; then
  SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s icanhazip.com 2>/dev/null || echo "")
  if [ -n "$SERVER_IP" ]; then
    echo ">>> 自动检测到服务器IP: $SERVER_IP"
  fi
fi

# 安装系统依赖
echo ">>> 安装系统依赖..."
apt-get update
apt-get install -y curl wget git build-essential

# 安装Node.js 20
echo ">>> 安装Node.js 20..."
if ! command -v node &> /dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi
echo "Node.js 版本: $(node -v)"
echo "npm 版本: $(npm -v)"

# 安装PM2
echo ">>> 安装PM2..."
if ! command -v pm2 &> /dev/null; then
  npm install -g pm2
fi

# 安装MongoDB
if [ "$SKIP_MONGO" = false ]; then
  echo ">>> 安装MongoDB 7.0..."
  
  # 检查是否已安装
  if ! command -v mongod &> /dev/null; then
    wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | apt-key add - 2>/dev/null || true
    echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
    apt-get update
    apt-get install -y mongodb-org
  fi

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
else
  echo ">>> 跳过MongoDB安装"
fi

# 安装Nginx
if [ "$SKIP_NGINX" = false ]; then
  echo ">>> 安装Nginx..."
  if ! command -v nginx &> /dev/null; then
    apt-get install -y nginx
  fi

  # 安装Certbot (Let's Encrypt)
  echo ">>> 安装Certbot..."
  apt-get install -y certbot python3-certbot-nginx
else
  echo ">>> 跳过Nginx安装"
fi

# 创建应用目录
echo ">>> 创建应用目录..."
APP_DIR="/var/www/random-movie"
mkdir -p $APP_DIR
mkdir -p $APP_DIR/logs

# 设置权限
if [ -n "$SUDO_USER" ]; then
  chown -R $SUDO_USER:$SUDO_USER $APP_DIR
fi

# 生成 NEXTAUTH_SECRET
echo ">>> 生成 NEXTAUTH_SECRET..."
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# 创建 .env.local 文件（如果不存在）
ENV_FILE="$APP_DIR/.env.local"
if [ ! -f "$ENV_FILE" ]; then
  echo ">>> 创建环境变量文件..."
  
  # 确定 NEXTAUTH_URL
  if [ -n "$DOMAIN" ]; then
    NEXTAUTH_URL="https://$DOMAIN"
  elif [ -n "$SERVER_IP" ]; then
    NEXTAUTH_URL="http://$SERVER_IP:3000"
  else
    NEXTAUTH_URL="http://localhost:3000"
  fi
  
  cat > "$ENV_FILE" << EOF
# MongoDB 连接字符串
MONGODB_URI=mongodb://localhost:27017/random-movie

# NextAuth 配置
# 访问地址 - 请根据实际情况修改
NEXTAUTH_URL=$NEXTAUTH_URL

# 密钥 - 已自动生成，请妥善保管
NEXTAUTH_SECRET=$NEXTAUTH_SECRET
EOF
  
  if [ -n "$SUDO_USER" ]; then
    chown $SUDO_USER:$SUDO_USER "$ENV_FILE"
  fi
  
  echo "✓ 已创建 $ENV_FILE"
else
  echo "! $ENV_FILE 已存在，跳过创建"
fi

echo ""
echo "==================================="
echo "基础环境安装完成!"
echo "==================================="
echo ""
echo "环境变量已配置:"
echo "  MONGODB_URI=mongodb://localhost:27017/random-movie"
echo "  NEXTAUTH_URL=$NEXTAUTH_URL"
echo "  NEXTAUTH_SECRET=$NEXTAUTH_SECRET"
echo ""
echo "后续步骤:"
echo "1. 将项目代码上传到 $APP_DIR"
echo "   或克隆: cd /var/www && git clone https://github.com/ShareWinter/randomMovie.git random-movie"
echo ""
echo "2. 检查环境变量（如需修改）:"
echo "   nano $APP_DIR/.env.local"
echo ""
echo "3. 安装依赖和构建:"
echo "   cd $APP_DIR && npm install && npm run build"
echo ""
echo "4. 启动应用:"
echo "   pm2 start deploy/ecosystem.config.js"
echo "   pm2 save && pm2 startup"
echo ""
echo "5. 配置Nginx（可选）:"
echo "   复制 deploy/nginx.conf.example 到 /etc/nginx/sites-available/"
echo "   或直接使用端口访问: http://$SERVER_IP:3000"
echo ""

if [ -n "$DOMAIN" ]; then
  echo "6. 配置SSL证书:"
  echo "   certbot --nginx -d $DOMAIN"
  echo ""
fi

echo "常用命令:"
echo "  查看应用状态: pm2 status"
echo "  查看日志: pm2 logs random-movie"
echo "  重启应用: pm2 restart random-movie"
echo "  MongoDB状态: sudo systemctl status mongod"
echo "  连接数据库: mongosh"
echo ""
echo "完成!"
