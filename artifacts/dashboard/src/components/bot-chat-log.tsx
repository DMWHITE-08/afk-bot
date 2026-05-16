import { useState, useEffect, useRef } from 'react';
import type { ChatMessage } from '../types';

export default function BotChatLog() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchChatLog = async () => {
      try {
        const res = await fetch('/api/bot/chat-log?limit=50');
        const data = await res.json();
        setMessages(data);
      } catch (err) {
        console.error('Failed to fetch chat log:', err);
      }
    };

    fetchChatLog();
    const interval = setInterval(fetchChatLog, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setIsSending(true);
    try {
      const res = await fetch('/api/bot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMessage }),
      });
      const data = await res.json();
      if (data.success) {
        setNewMessage('');
      }
    } catch (err) {
      console.error('Failed to send chat:', err);
    } finally {
      setIsSending(false);
    }
  };

  const getMessageColor = (type: ChatMessage['type']) => {
    switch (type) {
      case 'system':
        return 'text-amber-400';
      case 'bot':
        return 'text-cyan-400';
      case 'whisper':
        return 'text-purple-400';
      case 'chat':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="bg-slate-900 border-r border-cyan-500/30 flex flex-col h-full">
      {/* Chat Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-sm"
      >
        {messages.length === 0 ? (
          <div className="text-gray-500 text-center mt-8">No messages yet...</div>
        ) : (
          messages.map(msg => (
            <div key={msg.id} className="space-y-0.5">
              <div className="text-gray-500 text-xs">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
              <div className={getMessageColor(msg.type)}>
                <span className="font-bold">{msg.username}:</span> {msg.message}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Chat Input */}
      <form onSubmit={sendChat} className="border-t border-cyan-500/30 p-4 bg-slate-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-slate-700 text-white px-3 py-2 rounded border border-cyan-500/30 focus:outline-none focus:border-cyan-500 font-mono text-sm"
          />
          <button
            type="submit"
            disabled={isSending || !newMessage.trim()}
            className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white font-bold px-4 py-2 rounded transition"
          >
            {isSending ? '⏳' : '📤'}
          </button>
        </div>
      </form>
    </div>
  );
}
