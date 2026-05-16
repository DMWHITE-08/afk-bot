import { Router } from 'express'
import { healthRouter } from './health.js'
import { botRouter } from './bot.js'
import { openaiRouter } from './openai/index.js'

export const apiRouter = Router()

apiRouter.use('/', healthRouter)
apiRouter.use('/bot', botRouter)
apiRouter.use('/openai', openaiRouter)
