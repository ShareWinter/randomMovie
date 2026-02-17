module.exports = {
  apps: [{
    name: 'random-movie',
    // 使用 tsx 运行 TypeScript 服务器
    script: 'node_modules/.bin/tsx',
    args: 'server.ts',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    // 确保环境变量加载
    env_file: '.env.local',
  }],
}
