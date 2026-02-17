# 部署指南

本文档介绍如何将影片随机抽取应用部署到VPS服务器。

## 服务器要求

- **操作系统**: Ubuntu 20.04+ 或其他Linux发行版
- **内存**: 4GB+ (Puppeteer需要)
- **CPU**: 2核+
- **磁盘**: 2GB+

## 快速部署

### 1. 运行部署脚本

```bash
# 克隆项目到服务器
git clone <repository-url> /var/www/random-movie
cd /var/www/random-movie

# 运行部署脚本
chmod +x deploy/deploy.sh
sudo ./deploy/deploy.sh
```

### 2. 配置环境变量

```bash
cd /var/www/random-movie
cp .env.local.example .env.local
nano .env.local
```

编辑以下配置:

```env
MONGODB_URI=mongodb://localhost:27017/random-movie
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-secret-key
```

**生成NEXTAUTH_SECRET**:
```bash
openssl rand -base64 32
```

### 3. 安装依赖和构建

```bash
npm install
npm run build
```

### 4. 启动应用

```bash
pm2 start deploy/ecosystem.config.js
pm2 save
pm2 startup  # 开机自启动
```

### 5. 配置Nginx

```bash
# 复制Nginx配置
sudo cp deploy/nginx.conf.example /etc/nginx/sites-available/random-movie
sudo ln -s /etc/nginx/sites-available/random-movie /etc/nginx/sites-enabled/

# 修改配置中的域名
sudo nano /etc/nginx/sites-available/random-movie

# 测试配置
sudo nginx -t

# 重载Nginx
sudo systemctl reload nginx
```

### 6. 配置SSL证书

```bash
# 使用Let's Encrypt获取免费SSL证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

## 手动部署步骤

如果不使用自动部署脚本,请按以下步骤操作:

### 安装Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 安装Puppeteer依赖

```bash
sudo apt-get install -y \
  libatk1.0-0 libatk-bridge2.0-0 libcups2 libxkbcommon0 \
  libxcomposite1 libxdamage1 libxrandr2 libgbm1 libpango-1.0-0 \
  libcairo2 libasound2 libnspr4 libnss3
```

### 安装MongoDB

```bash
# Ubuntu 20.04/22.04
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# 启动MongoDB服务
sudo systemctl start mongod
sudo systemctl enable mongod

# 验证MongoDB运行状态
sudo systemctl status mongod
```

### 安装PM2

```bash
sudo npm install -g pm2
```

## 应用管理

### 查看应用状态

```bash
pm2 status
pm2 logs random-movie
pm2 monit
```

### 重启应用

```bash
pm2 restart random-movie
```

### 停止应用

```bash
pm2 stop random-movie
```

### 更新应用

```bash
cd /var/www/random-movie
git pull
npm install
npm run build
pm2 restart random-movie
```

## 故障排查

### 应用无法启动

1. 检查日志: `pm2 logs random-movie`
2. 检查端口占用: `lsof -i:3000`
3. 检查环境变量: `cat .env.local`

### Puppeteer无法启动

1. 确认系统依赖已安装
2. 检查内存是否充足
3. 查看错误日志

### 数据库连接失败

1. 检查MONGODB_URI是否正确
2. 确认MongoDB服务正在运行: `sudo systemctl status mongod`
3. 测试连接: `mongosh --eval "db.runCommand({ ping: 1 })"`

### Socket.io连接失败

1. 检查Nginx WebSocket配置
2. 确认防火墙允许WebSocket连接
3. 查看浏览器控制台错误

## 性能优化

### 启用Gzip压缩

在Nginx配置中添加:

```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
```

### 启用缓存

```nginx
location /_next/static/ {
    proxy_pass http://localhost:3000;
    proxy_cache_valid 200 30d;
    add_header Cache-Control "public, max-age=2592000, immutable";
}
```

### 内存优化

编辑 `deploy/ecosystem.config.js`:

```javascript
max_memory_restart: '1G',
instances: 2  // 根据CPU核心数调整
```

## 备份策略

### 数据库备份

```bash
# 创建备份目录
sudo mkdir -p /var/backups/mongodb

# 备份所有数据库
sudo mongodump --out /var/backups/mongodb/$(date +%Y%m%d)

# 备份单个数据库
sudo mongodump --db random-movie --out /var/backups/mongodb/$(date +%Y%m%d)

# 恢复数据库
sudo mongorestore --db random-movie /var/backups/mongodb/20240101/random-movie
```

### 自动备份脚本

创建 `/etc/cron.daily/mongodb-backup`:

```bash
#!/bin/bash
mongodump --out /var/backups/mongodb/$(date +\%Y\%m\%d)
find /var/backups/mongodb -type d -mtime +7 -exec rm -rf {} \;
```

设置权限:

```bash
sudo chmod +x /etc/cron.daily/mongodb-backup
```

### 应用备份

```bash
# 备份应用代码
tar -czf random-movie-backup-$(date +%Y%m%d).tar.gz /var/www/random-movie
```

## 监控和日志

### 日志位置

- PM2日志: `/var/www/random-movie/logs/`
- Nginx日志: `/var/log/nginx/`

### 监控工具

- PM2监控: `pm2 monit`
- PM2 Plus: https://pm2.io/

## 安全建议

1. 使用防火墙限制端口访问
2. 定期更新系统和依赖
3. 使用强密码和密钥认证
4. 启用HTTPS
5. 定期备份数据

## 相关链接

- [Next.js部署文档](https://nextjs.org/docs/deployment)
- [PM2文档](https://pm2.keymetrics.io/)
- [MongoDB文档](https://www.mongodb.com/docs/)
- [Let's Encrypt](https://letsencrypt.org/)
