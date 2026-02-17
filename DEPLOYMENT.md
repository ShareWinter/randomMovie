# 部署指南

本文档介绍如何将影片随机抽取应用部署到VPS服务器。

## 服务器要求

- **操作系统**: Ubuntu 20.04+ 或其他Linux发行版
- **Node.js**: 20.x+
- **内存**: 2GB+
- **CPU**: 2核+
- **磁盘**: 2GB+

## 快速部署

### 1. 克隆项目

```bash
# 克隆项目到服务器
git clone https://github.com/ShareWinter/randomMovie.git /var/www/random-movie
cd /var/www/random-movie
```

### 2. 配置环境变量（重要！）

**必须在启动前创建 `.env.local` 文件**：

```bash
cp .env.local.example .env.local
nano .env.local
```

编辑以下配置:

```env
# MongoDB 连接字符串
MONGODB_URI=mongodb://localhost:27017/random-movie

# NextAuth 配置 - 必须是用户访问的实际地址
NEXTAUTH_URL=http://你的服务器IP:3000

# NextAuth 密钥 - 至少32字符的随机字符串
NEXTAUTH_SECRET=your-super-secret-key-at-least-32-characters
```

**生成 NEXTAUTH_SECRET**:
```bash
openssl rand -base64 32
```

**注意事项**：
- `NEXTAUTH_URL` 必须是用户访问的实际地址（包含协议和端口）
- `NEXTAUTH_SECRET` 必须至少 32 字符
- 如果没有配置这些环境变量，会报错：`There was a problem with the server configuration`

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

### NextAuth 配置错误

错误信息：`There was a problem with the server configuration`

**解决方案**：

1. 确保 `.env.local` 文件存在且配置正确：
   ```bash
   cat .env.local
   ```

2. 确保以下环境变量已设置：
   - `NEXTAUTH_URL` - 必须是用户访问的实际地址
   - `NEXTAUTH_SECRET` - 至少 32 字符的随机字符串
   - `MONGODB_URI` - MongoDB 连接字符串

3. 如果使用 IP 地址访问，确保 `NEXTAUTH_URL` 包含正确的 IP 和端口：
   ```env
   NEXTAUTH_URL=http://172.22.206.181:3000
   ```

4. 重启应用：
   ```bash
   pm2 restart random-movie
   ```

### 数据库连接失败

1. 检查MONGODB_URI是否正确
2. 确认MongoDB服务正在运行: `sudo systemctl status mongod`
3. 测试连接: `mongosh --eval "db.runCommand({ ping: 1 })"`

### Socket.io连接失败

**症状**：参与者列表不同步、影片选择不更新

**排查步骤**：

1. 检查服务器是否正常运行：
   ```bash
   pm2 logs random-movie | grep -E "(Client connected|join-room)"
   ```

2. 检查浏览器控制台是否有 WebSocket 错误

3. 确保 Nginx WebSocket 配置正确（如果使用 Nginx）：
   ```nginx
   location /socket.io/ {
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection "upgrade";
       proxy_pass http://localhost:3000;
   }
   ```

4. 检查防火墙是否阻止 WebSocket 连接

5. 如果 Socket 连接超时，检查服务器日志：
   ```bash
   pm2 logs random-movie --lines 100
   ```

### 参与者数据不同步

**症状**：切换标签页后选择被清除、其他参与者看不到更新

**解决方案**：

1. 检查 Socket 连接状态（浏览器控制台应显示 `[Socket] Connected`）
2. 检查服务器是否收到事件（服务器终端应显示 `[join-room]` 等日志）
3. 确保网络稳定，WebSocket 连接未中断

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
6. 不要将 `.env.local` 文件提交到版本控制

## 网络问题

### Git 推送失败

如果遇到 `TLS connection was non-properly terminated` 或连接超时：

1. **使用 SSH 方式**（推荐）：
   ```bash
   # 生成 SSH 密钥
   ssh-keygen -t ed25519 -C "your_email@example.com"

   # 查看公钥并复制到 GitHub Settings > SSH Keys
   cat ~/.ssh/id_ed25519.pub

   # 切换远程地址
   git remote set-url origin git@github.com:ShareWinter/randomMovie.git
   ```

2. **配置代理**（如果有）：
   ```bash
   git config --global http.proxy http://127.0.0.1:7890
   ```

3. **增加超时时间**：
   ```bash
   git config --global http.postBuffer 524288000
   git config --global http.lowSpeedLimit 1000
   git config --global http.lowSpeedTime 300
   ```

## 相关链接

- [Next.js部署文档](https://nextjs.org/docs/deployment)
- [PM2文档](https://pm2.keymetrics.io/)
- [MongoDB文档](https://www.mongodb.com/docs/)
- [Let's Encrypt](https://letsencrypt.org/)
