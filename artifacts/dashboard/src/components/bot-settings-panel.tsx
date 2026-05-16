import { useState, useEffect } from 'react';
import type { BotSettings } from '../types';

export default function BotSettingsPanel() {
  const [settings, setSettings] = useState<BotSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/bot/settings');
        const data = await res.json();
        setSettings(data);
      } catch (err) {
        console.error('Failed to fetch settings:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (key: keyof BotSettings, value: any) => {
    if (settings) {
      setSettings({ ...settings, [key]: value });
    }
  };

  const saveSettings = async () => {
    if (!settings) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/bot/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data) {
        setSettings(data);
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="text-amber-500">Loading...</div>;
  if (!settings) return <div className="text-red-500">Failed to load settings</div>;

  return (
    <div className="bg-slate-900 p-6 space-y-6 overflow-y-auto">
      <h2 className="text-cyan-400 text-lg font-bold font-mono">⚙️ Bot Settings</h2>

      {/* Server Connection */}
      <div className="space-y-4">
        <h3 className="text-cyan-300 text-sm font-mono uppercase tracking-wide">Server Connection</h3>
        <div>
          <label className="block text-gray-300 text-sm mb-2">Server IP</label>
          <input
            type="text"
            value={settings.serverIp}
            onChange={e => handleChange('serverIp', e.target.value)}
            className="w-full bg-slate-800 text-white px-3 py-2 rounded border border-cyan-500/30 focus:outline-none focus:border-cyan-500 font-mono text-sm"
          />
        </div>
        <div>
          <label className="block text-gray-300 text-sm mb-2">Username</label>
          <input
            type="text"
            value={settings.username}
            onChange={e => handleChange('username', e.target.value)}
            className="w-full bg-slate-800 text-white px-3 py-2 rounded border border-cyan-500/30 focus:outline-none focus:border-cyan-500 font-mono text-sm"
          />
        </div>
      </div>

      {/* Reconnection */}
      <div className="space-y-4">
        <h3 className="text-cyan-300 text-sm font-mono uppercase tracking-wide">Reconnection</h3>
        <div className="flex items-center justify-between">
          <label className="text-gray-300 text-sm">Auto Reconnect</label>
          <input
            type="checkbox"
            checked={settings.autoReconnect}
            onChange={e => handleChange('autoReconnect', e.target.checked)}
            className="w-5 h-5 cursor-pointer"
          />
        </div>
        <div>
          <label className="block text-gray-300 text-sm mb-2">Reconnect Delay (ms)</label>
          <input
            type="number"
            value={settings.reconnectDelay}
            onChange={e => handleChange('reconnectDelay', parseInt(e.target.value))}
            className="w-full bg-slate-800 text-white px-3 py-2 rounded border border-cyan-500/30 focus:outline-none focus:border-cyan-500 font-mono text-sm"
          />
        </div>
      </div>

      {/* Movement Behavior */}
      <div className="space-y-4">
        <h3 className="text-cyan-300 text-sm font-mono uppercase tracking-wide">Movement Behavior</h3>
        <div>
          <label className="block text-gray-300 text-sm mb-2">Max Wander Distance (blocks)</label>
          <input
            type="number"
            value={settings.maxWanderDistance}
            onChange={e => handleChange('maxWanderDistance', parseInt(e.target.value))}
            className="w-full bg-slate-800 text-white px-3 py-2 rounded border border-cyan-500/30 focus:outline-none focus:border-cyan-500 font-mono text-sm"
          />
        </div>
        <div className="flex items-center justify-between">
          <label className="text-gray-300 text-sm">Avoid Water</label>
          <input
            type="checkbox"
            checked={settings.avoidWater}
            onChange={e => handleChange('avoidWater', e.target.checked)}
            className="w-5 h-5 cursor-pointer"
          />
        </div>
      </div>

      {/* Anti-AFK */}
      <div className="space-y-4">
        <h3 className="text-cyan-300 text-sm font-mono uppercase tracking-wide">Anti-AFK</h3>
        <div className="flex items-center justify-between">
          <label className="text-gray-300 text-sm">Anti-AFK Mode</label>
          <input
            type="checkbox"
            checked={settings.antiAfk}
            onChange={e => handleChange('antiAfk', e.target.checked)}
            className="w-5 h-5 cursor-pointer"
          />
        </div>
        <div className="flex items-center justify-between">
          <label className="text-gray-300 text-sm">Anti-Kick</label>
          <input
            type="checkbox"
            checked={settings.antiKick}
            onChange={e => handleChange('antiKick', e.target.checked)}
            className="w-5 h-5 cursor-pointer"
          />
        </div>
      </div>

      {/* Chat Behavior */}
      <div className="space-y-4">
        <h3 className="text-cyan-300 text-sm font-mono uppercase tracking-wide">Chat Behavior</h3>
        <div className="flex items-center justify-between">
          <label className="text-gray-300 text-sm">Random Chat Enabled</label>
          <input
            type="checkbox"
            checked={settings.randomChatEnabled}
            onChange={e => handleChange('randomChatEnabled', e.target.checked)}
            className="w-5 h-5 cursor-pointer"
          />
        </div>
        {settings.randomChatEnabled && (
          <div>
            <label className="block text-gray-300 text-sm mb-2">Random Chat Interval (ms)</label>
            <input
              type="number"
              value={settings.randomChatInterval}
              onChange={e => handleChange('randomChatInterval', parseInt(e.target.value))}
              className="w-full bg-slate-800 text-white px-3 py-2 rounded border border-cyan-500/30 focus:outline-none focus:border-cyan-500 font-mono text-sm"
            />
          </div>
        )}
      </div>

      {/* Combat & Survival */}
      <div className="space-y-4">
        <h3 className="text-cyan-300 text-sm font-mono uppercase tracking-wide">Combat & Survival</h3>
        <div className="flex items-center justify-between">
          <label className="text-gray-300 text-sm">Combat Enabled</label>
          <input
            type="checkbox"
            checked={settings.combatEnabled}
            onChange={e => handleChange('combatEnabled', e.target.checked)}
            className="w-5 h-5 cursor-pointer"
          />
        </div>
        <div className="flex items-center justify-between">
          <label className="text-gray-300 text-sm">Sleep at Night</label>
          <input
            type="checkbox"
            checked={settings.sleepAtNight}
            onChange={e => handleChange('sleepAtNight', e.target.checked)}
            className="w-5 h-5 cursor-pointer"
          />
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={saveSettings}
        disabled={isSaving}
        className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white font-bold py-3 rounded transition uppercase tracking-wide"
      >
        {isSaving ? '⏳ Saving...' : '💾 Save Settings'}
      </button>
    </div>
  );
}
