const { createServer } = require('http')
const next = require('next')
const { Server: SocketIOServer } = require('socket.io')

const { setupRoomHandlers } = require('./socket/roomHandler')
const { setupDrawHandlers } = require('./socket/drawHandler')

const dev = process.env.NODE_ENV !== 'production'
const hostname = dev ? '0.0.0.0' : 'localhost'
const port = Number(process.env.PORT || 3000)

const app = next({ dev, hostname, port })
const handler = app.getRequestHandler()

app.prepare().then(() => {
  const httpServer = createServer((req, res) => handler(req, res))

  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  })

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id)
    setupRoomHandlers(io, socket)
    setupDrawHandlers(io, socket)
  })

  httpServer.listen(port, hostname, () => {
    console.log(`> Ready on http://${hostname}:${port}`)
  })
})
