import express from 'express'
import cors from 'cors'
import pinoHttp from 'pino-http'
import path from 'path'
import { fileURLToPath } from 'url'
import { logger } from './logger.js'
import { apiRouter } from './routes/index.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export function createApp() {
  const app = express()

  // ─── Middleware ─────────────────────────────────────────────────────────────
  app.use(cors())
  app.use(express.json())
  app.use(
    pinoHttp({
      logger,
      // Skip health check noise
      autoLogging: {
        ignore: (req) => req.url === '/api/healthz',
      },
    }),
  )

  // ─── Static files (web console) ─────────────────────────────────────────────
  const publicDir = path.resolve(__dirname, '..', 'public')
  app.use(express.static(publicDir))

  // ─── API routes ─────────────────────────────────────────────────────────────
  app.use('/api', apiRouter)

  // ─── SPA fallback ───────────────────────────────────────────────────────────
  app.get('*', (_req, res) => {
    res.sendFile(path.join(publicDir, 'index.html'))
  })

  return app
}
