import { Router, Request, Response } from 'express'
import OpenAI from 'openai'
import { eq } from 'drizzle-orm'
import { getDb, schema } from '../../db/index.js'
import { logger } from '../../logger.js'

export const openaiRouter = Router()

function getClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY is not set')
  return new OpenAI({ apiKey })
}

// GET /api/openai/conversations
openaiRouter.get('/conversations', async (_req: Request, res: Response) => {
  try {
    const db = getDb()
    const rows = await db
      .select()
      .from(schema.conversations)
      .orderBy(schema.conversations.updatedAt)
    res.json(rows)
  } catch (err) {
    logger.error({ err }, 'Failed to list conversations')
    res.status(500).json({ error: (err as Error).message })
  }
})

// POST /api/openai/conversations
openaiRouter.post('/conversations', async (req: Request, res: Response) => {
  const { title } = req.body as { title?: string }
  try {
    const db = getDb()
    const [row] = await db
      .insert(schema.conversations)
      .values({ title: title ?? 'New Conversation' })
      .returning()
    res.status(201).json(row)
  } catch (err) {
    logger.error({ err }, 'Failed to create conversation')
    res.status(500).json({ error: (err as Error).message })
  }
})

// GET /api/openai/conversations/:id
openaiRouter.get('/conversations/:id', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id ?? '', 10)
  if (isNaN(id)) {
    res.status(400).json({ error: 'Invalid id' })
    return
  }
  try {
    const db = getDb()
    const [conversation] = await db
      .select()
      .from(schema.conversations)
      .where(eq(schema.conversations.id, id))
    if (!conversation) {
      res.status(404).json({ error: 'Conversation not found' })
      return
    }
    const msgs = await db
      .select()
      .from(schema.messages)
      .where(eq(schema.messages.conversationId, id))
      .orderBy(schema.messages.createdAt)
    res.json({ ...conversation, messages: msgs })
  } catch (err) {
    logger.error({ err }, 'Failed to get conversation')
    res.status(500).json({ error: (err as Error).message })
  }
})

// DELETE /api/openai/conversations/:id
openaiRouter.delete('/conversations/:id', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id ?? '', 10)
  if (isNaN(id)) {
    res.status(400).json({ error: 'Invalid id' })
    return
  }
  try {
    const db = getDb()
    await db.delete(schema.conversations).where(eq(schema.conversations.id, id))
    res.json({ success: true })
  } catch (err) {
    logger.error({ err }, 'Failed to delete conversation')
    res.status(500).json({ error: (err as Error).message })
  }
})

// GET /api/openai/conversations/:id/messages
openaiRouter.get('/conversations/:id/messages', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id ?? '', 10)
  if (isNaN(id)) {
    res.status(400).json({ error: 'Invalid id' })
    return
  }
  try {
    const db = getDb()
    const msgs = await db
      .select()
      .from(schema.messages)
      .where(eq(schema.messages.conversationId, id))
      .orderBy(schema.messages.createdAt)
    res.json(msgs)
  } catch (err) {
    logger.error({ err }, 'Failed to list messages')
    res.status(500).json({ error: (err as Error).message })
  }
})

// POST /api/openai/conversations/:id/messages  — streams GPT-4o reply via SSE
openaiRouter.post('/conversations/:id/messages', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id ?? '', 10)
  if (isNaN(id)) {
    res.status(400).json({ error: 'Invalid id' })
    return
  }

  const { content } = req.body as { content?: string }
  if (!content || typeof content !== 'string') {
    res.status(400).json({ error: 'content is required' })
    return
  }

  try {
    const db = getDb()

    // Verify conversation exists
    const [conversation] = await db
      .select()
      .from(schema.conversations)
      .where(eq(schema.conversations.id, id))
    if (!conversation) {
      res.status(404).json({ error: 'Conversation not found' })
      return
    }

    // Persist user message
    await db.insert(schema.messages).values({
      conversationId: id,
      role: 'user',
      content,
    })

    // Load full history for context
    const history = await db
      .select()
      .from(schema.messages)
      .where(eq(schema.messages.conversationId, id))
      .orderBy(schema.messages.createdAt)

    const openaiMessages = history.map((m) => ({
      role: m.role as 'user' | 'assistant' | 'system',
      content: m.content,
    }))

    // Set up SSE
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.flushHeaders()

    const client = getClient()
    const stream = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: openaiMessages,
      stream: true,
    })

    let assistantContent = ''

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content ?? ''
      if (delta) {
        assistantContent += delta
        res.write(`data: ${JSON.stringify({ delta })}\n\n`)
      }
    }

    // Persist assistant reply
    await db.insert(schema.messages).values({
      conversationId: id,
      role: 'assistant',
      content: assistantContent,
    })

    // Update conversation timestamp
    await db
      .update(schema.conversations)
      .set({ updatedAt: new Date() })
      .where(eq(schema.conversations.id, id))

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`)
    res.end()
  } catch (err) {
    logger.error({ err }, 'OpenAI streaming error')
    if (!res.headersSent) {
      res.status(500).json({ error: (err as Error).message })
    } else {
      res.write(`data: ${JSON.stringify({ error: (err as Error).message })}\n\n`)
      res.end()
    }
  }
})
