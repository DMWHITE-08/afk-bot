import { useState, useEffect } from 'react';
import type { BotStatus } from '../types';

interface ControlState {
  isStarting: boolean;
  isStopping: boolean;
  currentAction: string;
}

export default function BotControls() {
  const [status, setStatus] = useState<BotStatus | null>(null);
  const [controlState, setControlState] = useState<ControlState>({
    isStarting: false,
    isStopping: false,
    currentAction: 'Idle',
  });

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/bot/status');
        const data = await res.json();
        setStatus(data);
        setControlState(prev => ({ ...prev, currentAction: data.currentAction }));
      } catch (err) {
        console.error('Failed to fetch status:', err);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  const startBot = async () => {
    setControlState(prev => ({ ...prev, isStarting: true }));
    try {
      const res = await fetch('/api/bot/start', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setControlState(prev => ({ ...prev, currentAction: 'Starting...' }));
      }
    } catch (err) {
      console.error('Failed to start bot:', err);
    } finally {
      setControlState(prev => ({ ...prev, isStarting: false }));
    }
  };

  const stopBot = async () => {
    setControlState(prev => ({ ...prev, isStopping: true }));
    try {
      const res = await fetch('/api/bot/stop', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setControlState(prev => ({ ...prev, currentAction: 'Offline' }));
      }
    } catch (err) {
      console.error('Failed to stop bot:', err);
    } finally {
      setControlState(prev => ({ ...prev, isStopping: false }));
    }
  };

  const toggleAfkMode = async (enabled: boolean) => {
    try {
      const res = await fetch('/api/bot/toggle-afk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled }),
      });
      const data = await res.json();
      console.log('AFK toggle:', data);
    } catch (err) {
      console.error('Failed to toggle AFK:', err);
    }
  };

  const sendControl = async (action: string, duration?: number, target?: { x: number; y: number; z: number }) => {
    try {
      const res = await fetch('/api/bot/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, duration, target }),
      });
      const data = await res.json();
      console.log('Control executed:', data);
    } catch (err) {
      console.error('Failed to execute control:', err);
    }
  };

  if (!status) return <div className="text-amber-500">Loading...</div>;

  return (
    <div className="bg-slate-900 border-b border-cyan-500/30 p-6 space-y-6">
      {/* Start/Stop Buttons */}
      <div className="flex gap-4">
        <button
          onClick={startBot}
          disabled={status.online || controlState.isStarting}
          className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-4 rounded text-lg transition"
        >
          {controlState.isStarting ? '⏳ Starting...' : '▶️ Start Bot'}
        </button>
        <button
          onClick={stopBot}
          disabled={!status.online || controlState.isStopping}
          className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-bold py-4 rounded text-lg transition"
        >
          {controlState.isStopping ? '⏳ Stopping...' : '⏹️ Stop Bot'}
        </button>
      </div>

      {/* AFK Mode Toggle */}
      <div className="flex items-center justify-between bg-slate-800 p-4 rounded">
        <span className="text-cyan-400 font-mono">AFK Mode</span>
        <button
          onClick={() => toggleAfkMode(!status.afkMode)}
          disabled={!status.online}
          className={`px-6 py-2 rounded font-bold transition ${
            status.afkMode
              ? 'bg-cyan-600 text-white'
              : 'bg-slate-700 text-gray-400 hover:bg-slate-600'
          } disabled:opacity-50`}
        >
          {status.afkMode ? '✓ ON' : '○ OFF'}
        </button>
      </div>

      {/* Movement Pad */}
      {status.online && (
        <div className="space-y-3">
          <div className="text-cyan-400 text-sm font-mono">Movement Controls</div>
          <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
            <div />
            <button
              onClick={() => sendControl('move_forward', 1)}
              disabled={status.afkMode}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-3 rounded transition"
            >
              ⬆️
            </button>
            <div />
            <button
              onClick={() => sendControl('move_left', 1)}
              disabled={status.afkMode}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-3 rounded transition"
            >
              ⬅️
            </button>
            <button
              onClick={() => sendControl('stop')}
              disabled={status.afkMode}
              className="bg-slate-700 hover:bg-slate-600 disabled:bg-gray-600 text-white font-bold py-3 rounded transition"
            >
              ⏸️
            </button>
            <button
              onClick={() => sendControl('move_right', 1)}
              disabled={status.afkMode}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-3 rounded transition"
            >
              ➡️
            </button>
            <div />
            <button
              onClick={() => sendControl('move_back', 1)}
              disabled={status.afkMode}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-3 rounded transition"
            >
              ⬇️
            </button>
            <div />
          </div>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => sendControl('jump')}
              disabled={status.afkMode}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-bold px-4 py-2 rounded transition text-sm"
            >
              🦘 Jump
            </button>
            <button
              onClick={() => sendControl('sneak', 1)}
              disabled={status.afkMode}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-bold px-4 py-2 rounded transition text-sm"
            >
              🤐 Sneak
            </button>
          </div>
        </div>
      )}

      {/* Current Action Display */}
      <div className="bg-slate-800 p-4 rounded text-center">
        <div className="text-gray-400 text-xs uppercase tracking-wide mb-2">Current Action</div>
        <div className="text-cyan-400 font-mono text-lg font-bold">{controlState.currentAction}</div>
      </div>
    </div>
  );
}
