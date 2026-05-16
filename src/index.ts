import http from 'http'
import { WebSocketServer, WebSocket } from 'ws'
import { createApp } from './app.js'
import { botEngine } from './bot/engine.js'
import { logger } from './logger.js'

const PORT = parseInt(process.env.PORT ?? '3000', 10)

// ─── HTTP server ──────────────────────────────────────────────────────────────
const app = createApp()
const server = http.createServer(app)

// ─── WebSocket server ─────────────────────────────────────────────────────────
const wss = new WebSocketServer({ server, path: '/ws' })

function broadcast(data: unknown): void {
  const payload = JSON.stringify(data)
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload)
    }
  }
}

wss.on('connection', (ws) => {
  logger.info('WebSocket client connected')

  // Send current status immediately on connect
  ws.send(JSON.stringify({ type: 'status', data: botEngine.getStatus() }))
  ws.send(JSON.stringify({ type: 'chatLog', data: botEngine.getChatLog() }))
  ws.send(JSON.stringify({ type: 'settings', data: botEngine.getSettings() }))

  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw.toString()) as { type: string; data?: unknown }
      logger.debug({ msg }, 'WS message received')

      switch (msg.type) {
        case 'ping':
          ws.send(JSON.stringify({ type: 'pong' }))
          break
        case 'getStatus':
          ws.send(JSON.stringify({ type: 'status', data: botEngine.getStatus() }))
          break
        default:
          logger.warn({ type: msg.type }, 'Unknown WS message type')
      }
    } catch (err) {
      logger.warn({ err }, 'Failed to parse WS message')
    }
  })

  ws.on('close', () => {
    logger.info('WebSocket client disconnected')
  })

  ws.on('error', (err) => {
    logger.error({ err }, 'WebSocket error')
  })
})

// ─── Bot event → WebSocket broadcast ─────────────────────────────────────────
botEngine.on('status', (status) => {
  broadcast({ type: 'status', data: status })
})

botEngine.on('chat', (entry) => {
  broadcast({ type: 'chat', data: entry })
})

botEngine.on('connected', () => {
  broadcast({ type: 'connected' })
  broadcast({ type: 'status', data: botEngine.getStatus() })
})

botEngine.on('disconnected', (reason: string) => {
  broadcast({ type: 'disconnected', data: { reason } })
  broadcast({ type: 'status', data: botEngine.getStatus() })
})

botEngine.on('kicked', (reason: string) => {
  broadcast({ type: 'kicked', data: { reason } })
})

botEngine.on('error', (err: Error) => {
  broadcast({ type: 'error', data: { message: err.message } })
})

botEngine.on('afk', (enabled: boolean) => {
  broadcast({ type: 'afk', data: { enabled } })
})

// ─── Start listening ──────────────────────────────────────────────────────────
server.listen(PORT, () => {
  logger.info({ port: PORT }, `Minecraft Bot API server listening`)
  logger.info(`Web console: http://localhost:${PORT}`)
  logger.info(`WebSocket:   ws://localhost:${PORT}/ws`)
})

// ─── Graceful shutdown ────────────────────────────────────────────────────────
async function shutdown(signal: string) {
  logger.info({ signal }, 'Shutting down...')
  try {
    await botEngine.disconnect()
  } catch {
    // ignore
  }
  server.close(() => {
    logger.info('HTTP server closed')
    process.exit(0)
  })
  // Force exit after 10s
  setTimeout(() => process.exit(1), 10000).unref()
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))
process.on('uncaughtException', (err) => {
  logger.error({ err }, 'Uncaught exception')
})
process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'Unhandled rejection')
})
