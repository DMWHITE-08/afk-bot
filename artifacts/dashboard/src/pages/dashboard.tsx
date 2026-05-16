import BotStatusBar from '@/components/bot-status-bar';
import BotControls from '@/components/bot-controls';
import BotChatLog from '@/components/bot-chat-log';
import BotSettingsPanel from '@/components/bot-settings-panel';
import AiAssistantPanel from '@/components/ai-assistant-panel';

export default function Dashboard() {
  return (
    <div className="h-screen bg-gradient-to-br from-slate-950 to-slate-900 text-white flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-cyan-500/30 px-6 py-4">
        <h1 className="text-2xl font-bold font-mono text-cyan-400">🤖 BotForge Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Minecraft AFK Bot Control Center</p>
      </header>

      {/* Status Bar */}
      <BotStatusBar />

      {/* Controls */}
      <BotControls />

      {/* Main Content Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-0 overflow-hidden">
        {/* Left: Chat Log */}
        <div className="lg:col-span-1 overflow-hidden border-r border-cyan-500/30">
          <BotChatLog />
        </div>

        {/* Center: Settings */}
        <div className="lg:col-span-1 overflow-hidden border-r border-cyan-500/30">
          <BotSettingsPanel />
        </div>

        {/* Right: AI Assistant */}
        <div className="lg:col-span-1 overflow-hidden">
          <AiAssistantPanel />
        </div>
      </div>
    </div>
  );
}
