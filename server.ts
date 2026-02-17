import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'
import { Server as SocketIOServer } from 'socket.io'
import { loadEnvConfig } from '@next/env'
import { setGlobalDispatcher, Agent } from 'undici'

// 先加载环境变量
loadEnvConfig(process.cwd(), process.env.NODE_ENV !== 'production')

// 设置全局连接超时为 60 秒
setGlobalDispatcher(new Agent({
  connectTimeout: 60000,
  headersTimeout: 60000,
  bodyTimeout: 60000,
}))

const dev = process.env.NODE_ENV !== 'production'
const hostname = dev ? '0.0.0.0' : 'localhost'
const port = 3000

const app = next({ dev, hostname, port })
const handler = app.getRequestHandler()

app.prepare().then(async () => {
  // 在环境变量加载后动态导入 handlers
  const { setupRoomHandlers } = await import('./socket/roomHandler')
  const { setupDrawHandlers } = await import('./socket/drawHandler')

  const httpServer = createServer((req, res) => {
    // 调试日志
    console.log('[HTTP]', req.method, req.url)
    handler(req, res)
  })
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  })

  // Setup Socket.io handlers
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id)
    setupRoomHandlers(io, socket)
    setupDrawHandlers(io, socket)
  })

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`)
  })
})
