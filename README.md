# 影片随机抽取 Web 应用

一个支持多人在线实时抽奖决定观看影片的 Web 应用。

## 功能特性

- 🔐 **用户认证** - 注册、登录、会话管理
- 🎬 **影片库管理** - 豆瓣链接自动爬取、手动添加、CRUD操作
- 🏠 **房间系统** - 创建/加入房间、房主权限控制
- 🎰 **随机抽奖** - 老虎机式动画、实时同步
- 📊 **历史记录** - 抽奖历史查询
- 🎨 **手绘风格UI** - 笔记本质感、手写字体

## 技术栈

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS + Framer Motion
- MongoDB + Mongoose
- NextAuth.js v5
- Socket.io
- Puppeteer

## 开始使用

### 安装依赖

```bash
npm install
```

### 配置环境变量

复制 `.env.local.example` 为 `.env.local` 并修改以下变量：

```env
MONGODB_URI=mongodb://localhost:27017/random-movie
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
```

**注意**: 需要先安装并启动本地MongoDB服务。详见 [DEPLOYMENT.md](./DEPLOYMENT.md)。

### 运行开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
npm start
```

## 项目结构

```
src/
├── app/           # Next.js App Router 页面
├── components/    # React 组件
├── lib/          # 工具函数
├── models/       # Mongoose 数据模型
├── hooks/        # 自定义 Hooks
└── types/        # TypeScript 类型定义
```

## 部署

详见 `deploy/` 目录中的部署脚本。
