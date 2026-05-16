import { useState, useEffect, useRef } from 'react';
import type { ChatMessage } from '../types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function AiAssistantPanel() {
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedContent, setStreamedContent] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize conversation on first load
  useEffect(() => {
    const initConversation = async () => {
      try {
        setIsLoading(true);
        // Try to create a new conversation
        const res = await fetch('/api/openai/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: `Chat - ${new Date().toLocaleString()}` }),
        });
        const data = await res.json();
        if (data.id) {
          setConversationId(data.id);
        }
      } catch (err) {
        console.error('Failed to init conversation:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initConversation();
  }, []);

  // Load conversation messages
  useEffect(() => {
    if (!conversationId) return;

    const loadMessages = async () => {
      try {
        const res = await fetch(`/api/openai/conversations/${conversationId}/messages`);
        const data = await res.json();
        setMessages(data);
      } catch (err) {
        console.error('Failed to load messages:', err);
      }
    };

    loadMessages();
  }, [conversationId]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamedContent]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !conversationId || isStreaming) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsStreaming(true);
    setStreamedContent('');

    try {
      const res = await fetch(`/api/openai/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No reader');

      let fullContent = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += new TextDecoder().decode(value);
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const json = JSON.parse(line.slice(6));
              if (json.content) {
                fullContent += json.content;
                setStreamedContent(fullContent);
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }

      // Add assistant message to chat
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: fullContent,
      };
      setMessages(prev => [...prev, assistantMessage]);
      setStreamedContent('');
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsStreaming(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-slate-900 flex flex-col items-center justify-center h-full">
        <div className="text-amber-500">Initializing AI Assistant...</div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 flex flex-col h-full">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-sm">
        {messages.length === 0 && !streamedContent ? (
          <div className="text-gray-500 text-center mt-8">
            <div className="text-lg mb-2">🤖 AI Assistant</div>
            <div className="text-xs">Start a conversation with your bot assistant</div>
          </div>
        ) : (
          <>
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`max-w-xs rounded p-3 ${
                  msg.role === 'user'
                    ? 'ml-auto bg-cyan-600/30 text-cyan-100'
                    : 'mr-auto bg-slate-800 text-gray-300'
                }`}
              >
                <div className="text-xs text-gray-400 mb-1 font-bold">
                  {msg.role === 'user' ? '👤 You' : '🤖 Assistant'}
                </div>
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
            ))}
            {isStreaming && streamedContent && (
              <div className="max-w-xs rounded p-3 mr-auto bg-slate-800 text-gray-300">
                <div className="text-xs text-gray-400 mb-1 font-bold">🤖 Assistant</div>
                <div className="whitespace-pre-wrap">{streamedContent}</div>
                <div className="inline-block ml-1 text-cyan-400">▌</div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="border-t border-cyan-500/30 p-4 bg-slate-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask me anything about your bot..."
            disabled={isStreaming}
            className="flex-1 bg-slate-700 text-white px-3 py-2 rounded border border-cyan-500/30 focus:outline-none focus:border-cyan-500 font-mono text-sm disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isStreaming || !input.trim()}
            className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white font-bold px-4 py-2 rounded transition"
          >
            {isStreaming ? '⏳' : '✈️'}
          </button>
        </div>
      </form>
    </div>
  );
}
