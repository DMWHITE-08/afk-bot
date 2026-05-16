/**
 * Bot API Client
 * Provides type-safe methods for communicating with the bot backend
 */

import type { BotStatus, ChatMessage, BotSettings } from '../types';

const API_BASE = '/api';

export const botClient = {
  async getStatus(): Promise<BotStatus> {
    const res = await fetch(`${API_BASE}/bot/status`);
    return res.json();
  },

  async start(): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/bot/start`, { method: 'POST' });
    return res.json();
  },

  async stop(): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/bot/stop`, { method: 'POST' });
    return res.json();
  },

  async sendChat(message: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/bot/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    return res.json();
  },

  async control(
    action: string,
    duration?: number,
    target?: { x: number; y: number; z: number },
  ): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/bot/control`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, duration, target }),
    });
    return res.json();
  },

  async getChatLog(limit = 50): Promise<ChatMessage[]> {
    const res = await fetch(`${API_BASE}/bot/chat-log?limit=${limit}`);
    return res.json();
  },

  async toggleAfkMode(enabled: boolean): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/bot/toggle-afk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled }),
    });
    return res.json();
  },

  async getSettings(): Promise<BotSettings> {
    const res = await fetch(`${API_BASE}/bot/settings`);
    return res.json();
  },

  async updateSettings(settings: Partial<BotSettings>): Promise<BotSettings> {
    const res = await fetch(`${API_BASE}/bot/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    return res.json();
  },
};

/**
 * Singleton instance for direct use
 */
export const botEngine = botClient;
