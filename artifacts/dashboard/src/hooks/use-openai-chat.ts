import { useState, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export function useOpenAiChat() {
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [streamedContent, setStreamedContent] = useState('');

  // Get or create conversation
  const { data: conversation } = useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: async () => {
      if (conversationId) {
        const res = await fetch(`/api/openai/conversations/${conversationId}`);
        return res.json();
      }

      // Create new conversation
      const res = await fetch('/api/openai/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: `Chat - ${new Date().toLocaleString()}` }),
      });
      const data = await res.json();
      setConversationId(data.id);
      return data;
    },
    enabled: conversationId === null,
  });

  // Get messages
  const { data: messages = [] } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      const res = await fetch(`/api/openai/conversations/${conversationId}/messages`);
      return res.json();
    },
    enabled: conversationId !== null,
  });

  // Send message with streaming
  const sendMessage = useCallback(
    async (content: string) => {
      if (!conversationId || !content.trim()) return;

      setStreamedContent('');

      try {
        const res = await fetch(`/api/openai/conversations/${conversationId}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: content }),
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
      } catch (err) {
        console.error('Failed to send message:', err);
      }
    },
    [conversationId],
  );

  return {
    conversationId,
    messages,
    streamedContent,
    sendMessage,
  };
}
