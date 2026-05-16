import { EventEmitter } from 'events'
import mineflayer, { Bot } from 'mineflayer'
import { logger } from '../logger.js'

// Pathfinder is loaded dynamically to handle CJS/ESM interop
type PathfinderPlugin = (bot: Bot, ...args: unknown[]) => void

export interface BotSettings {
  serverIp: string
  serverPort: number
  username: string
  auth: 'offline' | 'microsoft'
  version: string | false
  autoReconnect: boolean
  reconnectDelay: number
  maxWanderDistance: number
  avoidWater: boolean
  antiAfk: boolean
  randomChatEnabled: boolean
  randomChatInterval: number
  sleepAtNight: boolean
  antiKick: boolean
  combatEnabled: boolean
}

export interface BotStatus {
  online: boolean
  health: number
  food: number
  position: { x: number; y: number; z: number } | null
  uptime: number
  ping: number
  username: string
  serverIp: string
  serverPort: number
  dimension: string | null
  gameMode: string | null
}

export interface ChatEntry {
  timestamp: string
  username: string
  message: string
}

const DEFAULT_SETTINGS: BotSettings = {
  serverIp: process.env.BOT_SERVER_IP ?? 'maincraftandme.aternos.me',
  serverPort: parseInt(process.env.BOT_SERVER_PORT ?? '29449', 10),
  username: process.env.BOT_USERNAME ?? 'SUGU',
  auth: 'offline',
  version: false,
  autoReconnect: true,
  reconnectDelay: 10000,
  maxWanderDistance: 20,
  avoidWater: true,
  antiAfk: true,
  randomChatEnabled: false,
  randomChatInterval: 120000,
  sleepAtNight: true,
  antiKick: true,
  combatEnabled: true,
}

const RANDOM_CHAT_MESSAGES = [
  'Hello!',
  'How is everyone?',
  'Nice day in Minecraft!',
  'Anyone need help?',
  'Just exploring!',
  'This server is great!',
]

export class BotEngine extends EventEmitter {
  private bot: Bot | null = null
  private settings: BotSettings
  private startTime: number | null = null
  private chatLog: ChatEntry[] = []
  private afkMode = false
  private afkInterval: ReturnType<typeof setInterval> | null = null
  private randomChatInterval: ReturnType<typeof setInterval> | null = null
  private antiKickInterval: ReturnType<typeof setInterval> | null = null
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null
  private isConnecting = false
  private shouldReconnect = false
  private pathfinderLoaded = false

  constructor(settings?: Partial<BotSettings>) {
    super()
    this.settings = { ...DEFAULT_SETTINGS, ...settings }
  }

  // ─── Public API ────────────────────────────────────────────────────────────

  getStatus(): BotStatus {
    if (!this.bot || !this.bot.entity) {
      return {
        online: false,
        health: 0,
        food: 0,
        position: null,
        uptime: 0,
        ping: 0,
        username: this.settings.username,
        serverIp: this.settings.serverIp,
        serverPort: this.settings.serverPort,
        dimension: null,
        gameMode: null,
      }
    }

    const pos = this.bot.entity.position
    return {
      online: true,
      health: this.bot.health ?? 0,
      food: this.bot.food ?? 0,
      position: { x: Math.round(pos.x), y: Math.round(pos.y), z: Math.round(pos.z) },
      uptime: this.startTime ? Date.now() - this.startTime : 0,
      ping: (this.bot as unknown as { _client?: { latency?: number } })._client?.latency ?? 0,
      username: this.bot.username,
      serverIp: this.settings.serverIp,
      serverPort: this.settings.serverPort,
      dimension: (this.bot.game as unknown as { dimension?: string })?.dimension ?? null,
      gameMode: this.bot.game?.gameMode ?? null,
    }
  }

  getSettings(): BotSettings {
    return { ...this.settings }
  }

  updateSettings(partial: Partial<BotSettings>): BotSettings {
    this.settings = { ...this.settings, ...partial }
    logger.info({ settings: this.settings }, 'Bot settings updated')
    return { ...this.settings }
  }

  getChatLog(): ChatEntry[] {
    return [...this.chatLog]
  }

  isOnline(): boolean {
    return this.bot !== null && this.bot.entity !== null
  }

  async connect(): Promise<void> {
    if (this.isConnecting || this.isOnline()) {
      throw new Error('Bot is already connected or connecting')
    }
    this.shouldReconnect = this.settings.autoReconnect
    await this._createBot()
  }

  async disconnect(): Promise<void> {
    this.shouldReconnect = false
    this._clearTimers()
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }
    if (this.bot) {
      try {
        this.bot.quit('Disconnected by user')
      } catch {
        // ignore
      }
      this.bot = null
    }
    this.startTime = null
    this.isConnecting = false
    this.emit('status', this.getStatus())
    logger.info('Bot disconnected by user')
  }

  sendChat(message: string): void {
    if (!this.bot || !this.isOnline()) {
      throw new Error('Bot is not connected')
    }
    this.bot.chat(message)
  }

  control(action: string, duration = 500, _target?: string): void {
    if (!this.bot || !this.isOnline()) {
      throw new Error('Bot is not connected')
    }

    const validActions = ['forward', 'back', 'left', 'right', 'jump', 'sneak', 'sprint', 'stop']
    if (!validActions.includes(action)) {
      throw new Error(`Invalid action: ${action}`)
    }

    if (action === 'stop') {
      for (const a of ['forward', 'back', 'left', 'right', 'jump', 'sneak', 'sprint']) {
        this.bot.setControlState(a as Parameters<Bot['setControlState']>[0], false)
      }
      return
    }

    this.bot.setControlState(action as Parameters<Bot['setControlState']>[0], true)
    setTimeout(() => {
      if (this.bot) {
        this.bot.setControlState(action as Parameters<Bot['setControlState']>[0], false)
      }
    }, duration)
  }

  setAfkMode(enabled: boolean): void {
    this.afkMode = enabled
    if (enabled) {
      this._startAfkLoop()
    } else {
      this._stopAfkLoop()
    }
    logger.info({ afkMode: enabled }, 'AFK mode toggled')
    this.emit('afk', enabled)
  }

  isAfkMode(): boolean {
    return this.afkMode
  }

  // ─── Bot lifecycle ─────────────────────────────────────────────────────────

  private async _createBot(): Promise<void> {
    this.isConnecting = true
    logger.info(
      { host: this.settings.serverIp, port: this.settings.serverPort },
      'Connecting bot...',
    )

    try {
      this.bot = mineflayer.createBot({
        host: this.settings.serverIp,
        port: this.settings.serverPort,
        username: this.settings.username,
        auth: this.settings.auth,
        version: this.settings.version || undefined,
        keepAlive: true,
        checkTimeoutInterval: 120000,
        hideErrors: false,
      })

      this._attachEvents()
    } catch (err) {
      this.isConnecting = false
      logger.error({ err }, 'Failed to create bot')
      throw err
    }
  }

  private _attachEvents(): void {
    if (!this.bot) return

    this.bot.once('spawn', () => {
      this.isConnecting = false
      this.startTime = Date.now()
      logger.info('Bot spawned successfully')

      this._loadPathfinder()

      if (this.settings.antiAfk) {
        this._startAfkLoop()
      }
      if (this.settings.randomChatEnabled) {
        this._startRandomChat()
      }
      if (this.settings.antiKick) {
        this._startAntiKick()
      }

      this.emit('status', this.getStatus())
      this.emit('connected')
    })

    this.bot.on('health', () => {
      this.emit('status', this.getStatus())

      // Auto-eat if food is low (basic survival)
      if (this.bot && this.bot.food < 14) {
        this._tryEat()
      }
    })

    this.bot.on('chat', (username: string, message: string) => {
      if (username === this.bot?.username) return
      const entry: ChatEntry = {
        timestamp: new Date().toISOString(),
        username,
        message,
      }
      this.chatLog.push(entry)
      // Keep last 500 messages
      if (this.chatLog.length > 500) {
        this.chatLog.shift()
      }
      this.emit('chat', entry)
      logger.debug({ username, message }, 'Chat received')
    })

    this.bot.on('physicsTick', () => {
      if (!this.bot || !this.settings.combatEnabled) return
      this._handleCombat()
    })

    this.bot.on('sleep', () => {
      logger.info('Bot went to sleep')
      this.emit('status', this.getStatus())
    })

    this.bot.on('wake', () => {
      logger.info('Bot woke up')
      this.emit('status', this.getStatus())
    })

    this.bot.on('end', (reason: string) => {
      logger.warn({ reason }, 'Bot disconnected')
      this._clearTimers()
      this.startTime = null
      const wasBot = this.bot
      this.bot = null
      this.emit('status', this.getStatus())
      this.emit('disconnected', reason)

      if (this.shouldReconnect && wasBot) {
        logger.info(
          { delay: this.settings.reconnectDelay },
          'Scheduling reconnect...',
        )
        this.reconnectTimeout = setTimeout(() => {
          this._createBot().catch((err) => {
            logger.error({ err }, 'Reconnect failed')
          })
        }, this.settings.reconnectDelay)
      }
    })

    this.bot.on('kicked', (reason: string) => {
      logger.warn({ reason }, 'Bot was kicked')
      this.emit('kicked', reason)
    })

    this.bot.on('error', (err: Error) => {
      logger.error({ err }, 'Bot error')
      this.isConnecting = false
      this.emit('error', err)
    })

    // Sleep at night
    if (this.settings.sleepAtNight) {
      this.bot.on('time', () => {
        if (!this.bot) return
        const time = this.bot.time.timeOfDay
        // Night time is roughly 12541–23458
        if (time >= 12541 && time <= 23458) {
          this._trySleep()
        }
      })
    }
  }

  // ─── Feature loops ─────────────────────────────────────────────────────────

  private _startAfkLoop(): void {
    if (this.afkInterval) return
    this.afkInterval = setInterval(() => {
      if (!this.bot || !this.isOnline()) return
      this._doAfkMovement()
    }, 10000)
  }

  private _stopAfkLoop(): void {
    if (this.afkInterval) {
      clearInterval(this.afkInterval)
      this.afkInterval = null
    }
  }

  private _doAfkMovement(): void {
    if (!this.bot) return

    // Random head look
    this.bot.look(Math.random() * Math.PI * 2, (Math.random() - 0.5) * 0.4, true)

    const actions: Array<Parameters<Bot['setControlState']>[0]> = [
      'forward',
      'back',
      'left',
      'right',
    ]
    const action = actions[Math.floor(Math.random() * actions.length)]!

    this.bot.setControlState(action, true)

    // Occasionally jump
    if (Math.random() < 0.3) {
      this.bot.setControlState('jump', true)
      setTimeout(() => {
        if (this.bot) this.bot.setControlState('jump', false)
      }, 400)
    }

    setTimeout(() => {
      if (this.bot) {
        this.bot.setControlState(action, false)
      }
    }, 1500 + Math.random() * 1000)
  }

  private _startRandomChat(): void {
    if (this.randomChatInterval) return
    this.randomChatInterval = setInterval(() => {
      if (!this.bot || !this.isOnline()) return
      const msg =
        RANDOM_CHAT_MESSAGES[Math.floor(Math.random() * RANDOM_CHAT_MESSAGES.length)]!
      this.bot.chat(msg)
    }, this.settings.randomChatInterval)
  }

  private _startAntiKick(): void {
    if (this.antiKickInterval) return
    // Swing arm periodically to avoid idle kick
    this.antiKickInterval = setInterval(() => {
      if (!this.bot || !this.isOnline()) return
      this.bot.swingArm()
    }, 55000)
  }

  private _handleCombat(): void {
    if (!this.bot) return
    const hostileMobs = [
      'zombie',
      'skeleton',
      'creeper',
      'spider',
      'enderman',
      'witch',
      'pillager',
      'vindicator',
      'phantom',
      'drowned',
      'husk',
      'stray',
      'blaze',
      'ghast',
      'slime',
      'magma_cube',
    ]

    const nearbyEntities = Object.values(this.bot.entities)
    for (const entity of nearbyEntities) {
      if (!entity || entity.type !== 'mob') continue
      if (!hostileMobs.includes(entity.name ?? '')) continue

      const distance = this.bot.entity.position.distanceTo(entity.position)
      if (distance < 4) {
        this.bot.attack(entity)
        break
      }
    }
  }

  private async _trySleep(): Promise<void> {
    if (!this.bot) return
    try {
      const bed = this.bot.findBlock({
        matching: (block) => this.bot!.isABed(block),
        maxDistance: 6,
      })
      if (bed) {
        await this.bot.sleep(bed)
      }
    } catch {
      // No bed nearby or can't sleep
    }
  }

  private async _tryEat(): Promise<void> {
    if (!this.bot) return
    try {
      const foodItems = this.bot.inventory.items().filter((item) => {
        // Common food item IDs — mineflayer exposes item.name
        const foodNames = [
          'bread',
          'cooked_beef',
          'cooked_chicken',
          'cooked_porkchop',
          'cooked_mutton',
          'cooked_rabbit',
          'cooked_salmon',
          'cooked_cod',
          'apple',
          'golden_apple',
          'carrot',
          'baked_potato',
          'cookie',
          'melon_slice',
        ]
        return foodNames.includes(item.name)
      })
      if (foodItems.length > 0) {
        await this.bot.equip(foodItems[0]!, 'hand')
        await this.bot.consume()
      }
    } catch {
      // Can't eat right now
    }
  }

  private _loadPathfinder(): void {
    if (this.pathfinderLoaded || !this.bot) return
    try {
      // Dynamic require for CJS mineflayer-pathfinder
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pathfinderModule = require('mineflayer-pathfinder') as {
        pathfinder: PathfinderPlugin
      }
      this.bot.loadPlugin(pathfinderModule.pathfinder)
      this.pathfinderLoaded = true
      logger.info('Pathfinder plugin loaded')
    } catch (err) {
      logger.warn({ err }, 'Could not load mineflayer-pathfinder')
    }
  }

  private _clearTimers(): void {
    this._stopAfkLoop()
    if (this.randomChatInterval) {
      clearInterval(this.randomChatInterval)
      this.randomChatInterval = null
    }
    if (this.antiKickInterval) {
      clearInterval(this.antiKickInterval)
      this.antiKickInterval = null
    }
  }
}

// Singleton instance
export const botEngine = new BotEngine()
