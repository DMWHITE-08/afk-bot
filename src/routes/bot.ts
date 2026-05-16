import { Router, Request, Response } from 'express'
import { botEngine } from '../bot/engine.js'
import { logger } from '../logger.js'

export const botRouter = Router()

// GET /api/bot/status
botRouter.get('/status', (_req: Request, res: Response) => {
  res.json(botEngine.getStatus())
})

// POST /api/bot/start
botRouter.post('/start', async (_req: Request, res: Response) => {
  try {
    if (botEngine.isOnline()) {
      res.status(409).json({ error: 'Bot is already running' })
      return
    }
    await botEngine.connect()
    res.json({ success: true, message: 'Bot is connecting...' })
  } catch (err) {
    logger.error({ err }, 'Failed to start bot')
    res.status(500).json({ error: (err as Error).message })
  }
})

// POST /api/bot/stop
botRouter.post('/stop', async (_req: Request, res: Response) => {
  try {
    if (!botEngine.isOnline()) {
      res.status(409).json({ error: 'Bot is not running' })
      return
    }
    await botEngine.disconnect()
    res.json({ success: true, message: 'Bot disconnected' })
  } catch (err) {
    logger.error({ err }, 'Failed to stop bot')
    res.status(500).json({ error: (err as Error).message })
  }
})

// POST /api/bot/chat
botRouter.post('/chat', (req: Request, res: Response) => {
  const { message } = req.body as { message?: string }
  if (!message || typeof message !== 'string') {
    res.status(400).json({ error: 'message is required' })
    return
  }
  try {
    botEngine.sendChat(message)
    res.json({ success: true })
  } catch (err) {
    res.status(400).json({ error: (err as Error).message })
  }
})

// POST /api/bot/control
botRouter.post('/control', (req: Request, res: Response) => {
  const { action, duration, target } = req.body as {
    action?: string
    duration?: number
    target?: string
  }
  if (!action || typeof action !== 'string') {
    res.status(400).json({ error: 'action is required' })
    return
  }
  try {
    botEngine.control(action, duration, target)
    res.json({ success: true })
  } catch (err) {
    res.status(400).json({ error: (err as Error).message })
  }
})

// GET /api/bot/chat-log
botRouter.get('/chat-log', (_req: Request, res: Response) => {
  res.json(botEngine.getChatLog())
})

// POST /api/bot/toggle-afk
botRouter.post('/toggle-afk', (req: Request, res: Response) => {
  const { enabled } = req.body as { enabled?: boolean }
  if (typeof enabled !== 'boolean') {
    res.status(400).json({ error: 'enabled (boolean) is required' })
    return
  }
  botEngine.setAfkMode(enabled)
  res.json({ success: true, afkMode: enabled })
})

// GET /api/bot/settings
botRouter.get('/settings', (_req: Request, res: Response) => {
  res.json(botEngine.getSettings())
})

// PUT /api/bot/settings
botRouter.put('/settings', (req: Request, res: Response) => {
  try {
    const updated = botEngine.updateSettings(req.body)
    res.json(updated)
  } catch (err) {
    res.status(400).json({ error: (err as Error).message })
  }
})
