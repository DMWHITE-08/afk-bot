export interface BotStatus {
  online: boolean;
  username: string;
  health: number;
  food: number;
  position: { x: number; y: number; z: number } | null;
  dimension: string;
  afkMode: boolean;
  currentAction: string;
  uptime: number;
  ping: number;
  reconnectCount: number;
  connectedAt: string | null;
}

export interface ChatMessage {
  id: string;
  timestamp: string;
  username: string;
  message: string;
  type: 'chat' | 'system' | 'whisper' | 'bot';
}

export interface BotSettings {
  serverIp: string;
  serverPort: number;
  username: string;
  autoReconnect: boolean;
  reconnectDelay: number;
  maxWanderDistance: number;
  avoidWater: boolean;
  antiAfk: boolean;
  randomChatEnabled: boolean;
  randomChatInterval: number;
  sleepAtNight: boolean;
  antiKick: boolean;
  combatEnabled: boolean;
}
