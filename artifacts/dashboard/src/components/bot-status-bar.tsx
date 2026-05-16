import { useEffect, useState } from 'react';
import { botEngine } from '../services/bot-client';
import type { BotStatus } from '../types';

export default function BotStatusBar() {
  const [status, setStatus] = useState<BotStatus | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/bot/status');
        const data = await res.json();
        setStatus(data);
      } catch (err) {
        console.error('Failed to fetch status:', err);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  if (!status) return <div className="text-amber-500">Loading...</div>;

  const healthPercent = (status.health / 20) * 100;
  const foodPercent = (status.food / 20) * 100;

  return (
    <div className="bg-slate-900 border-b border-cyan-500/30 p-4 space-y-3">
      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full ${status.online ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
        <span className="font-mono text-sm">{status.username}</span>
        <span className={`px-2 py-1 rounded text-xs font-bold ${status.online ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
          {status.online ? 'ONLINE' : 'OFFLINE'}
        </span>
        {status.afkMode && <span className="px-2 py-1 rounded text-xs font-bold bg-cyan-500/20 text-cyan-400">AFK</span>}
      </div>

      <div className="grid grid-cols-2 gap-4 text-xs">
        <div>
          <div className="text-amber-400 mb-1">❤️ Health</div>
          <div className="w-full bg-slate-800 rounded h-2 overflow-hidden">
            <div className="bg-red-500 h-full" style={{ width: `${healthPercent}%` }} />
          </div>
          <div className="text-gray-400 mt-1">{status.health.toFixed(1)} / 20</div>
        </div>
        <div>
          <div className="text-amber-400 mb-1">🍖 Food</div>
          <div className="w-full bg-slate-800 rounded h-2 overflow-hidden">
            <div className="bg-orange-500 h-full" style={{ width: `${foodPercent}%` }} />
          </div>
          <div className="text-gray-400 mt-1">{status.food} / 20</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs text-gray-300">
        <div>
          <div className="text-cyan-400">📍 Position</div>
          {status.position ? (
            <div className="font-mono text-gray-400">
              {status.position.x}, {status.position.y}, {status.position.z}
            </div>
          ) : (
            <div className="text-gray-500">Unknown</div>
          )}
        </div>
        <div>
          <div className="text-cyan-400">🌍 Dimension</div>
          <div className="font-mono text-gray-400 capitalize">{status.dimension}</div>
        </div>
        <div>
          <div className="text-cyan-400">⏱️ Uptime</div>
          <div className="font-mono text-gray-400">{Math.floor(status.uptime / 60)}m {status.uptime % 60}s</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
        <div>
          <div className="text-cyan-400">📡 Ping</div>
          <div className="font-mono text-gray-400">{status.ping}ms</div>
        </div>
        <div>
          <div className="text-cyan-400">🔄 Reconnects</div>
          <div className="font-mono text-gray-400">{status.reconnectCount}</div>
        </div>
      </div>
    </div>
  );
}
