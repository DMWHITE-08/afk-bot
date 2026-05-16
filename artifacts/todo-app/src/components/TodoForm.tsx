import { useState } from 'react';
import type { TodoItem } from '../types';

interface Props {
  onAdd: (text: string, priority: TodoItem['priority'], category?: string, dueDate?: string) => void;
}

export default function TodoForm({ onAdd }: Props) {
  const [text, setText] = useState('');
  const [priority, setPriority] = useState<TodoItem['priority']>('medium');
  const [category, setCategory] = useState('');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onAdd(text.trim(), priority, category || undefined, dueDate || undefined);
      setText('');
      setCategory('');
      setDueDate('');
      setPriority('medium');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-800 p-6 rounded-lg border border-cyan-500/30 space-y-4">
      <div>
        <label className="block text-sm text-gray-300 mb-2">Task</label>
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Add a new task..."
          className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-cyan-500/30 focus:outline-none focus:border-cyan-500 placeholder-gray-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm text-gray-300 mb-2">Priority</label>
          <select
            value={priority}
            onChange={e => setPriority(e.target.value as TodoItem['priority'])}
            className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-cyan-500/30 focus:outline-none focus:border-cyan-500"
          >
            <option value="low">✓ Low</option>
            <option value="medium">⚡ Medium</option>
            <option value="high">🔥 High</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-2">Category</label>
          <input
            type="text"
            value={category}
            onChange={e => setCategory(e.target.value)}
            placeholder="Work, Personal..."
            className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-cyan-500/30 focus:outline-none focus:border-cyan-500 placeholder-gray-500 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-2">Due Date</label>
          <input
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-cyan-500/30 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={!text.trim()}
        className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white font-bold py-2 rounded transition uppercase tracking-wide"
      >
        ➕ Add Task
      </button>
    </form>
  );
}
