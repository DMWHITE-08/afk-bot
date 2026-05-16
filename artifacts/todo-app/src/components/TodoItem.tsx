import { useState } from 'react';
import type { TodoItem as TodoItemType } from '../types';

interface Props {
  todo: TodoItemType;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<TodoItemType>) => void;
}

const priorityColors = {
  high: 'text-red-400 bg-red-500/10',
  medium: 'text-yellow-400 bg-yellow-500/10',
  low: 'text-green-400 bg-green-500/10',
};

const priorityEmoji = {
  high: '🔥',
  medium: '⚡',
  low: '✓',
};

export default function TodoItem({ todo, onToggle, onDelete, onUpdate }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);

  const handleSave = () => {
    if (editText.trim()) {
      onUpdate(todo.id, { text: editText.trim() });
      setIsEditing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg border transition-all ${
        todo.completed
          ? 'bg-slate-800/50 border-slate-700 opacity-60'
          : 'bg-slate-800 border-cyan-500/30 hover:border-cyan-500'
      }`}
    >
      {/* Checkbox */}
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        className="w-5 h-5 mt-1 cursor-pointer accent-cyan-500"
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <input
            type="text"
            value={editText}
            onChange={e => setEditText(e.target.value)}
            onBlur={handleSave}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            autoFocus
            className="w-full bg-slate-700 text-white px-2 py-1 rounded border border-cyan-500 focus:outline-none text-sm"
          />
        ) : (
          <>
            <p
              className={`text-sm ${
                todo.completed
                  ? 'line-through text-gray-500'
                  : 'text-gray-100'
              }}`}
            >
              {todo.text}
            </p>
            {todo.category && (
              <p className="text-xs text-gray-400 mt-1">📁 {todo.category}</p>
            )}
          </>
        )}
      </div>

      {/* Metadata */}
      <div className="flex items-center gap-2 flex-wrap justify-end">
        {todo.dueDate && (
          <span className="text-xs text-gray-400 whitespace-nowrap">
            📅 {formatDate(todo.dueDate)}
          </span>
        )}
        <span className={`text-xs font-bold px-2 py-1 rounded ${priorityColors[todo.priority]}`}>
          {priorityEmoji[todo.priority]} {todo.priority}
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="text-gray-400 hover:text-cyan-400 transition text-sm px-2 py-1"
        >
          ✏️
        </button>
        <button
          onClick={() => onDelete(todo.id)}
          className="text-gray-400 hover:text-red-400 transition text-sm px-2 py-1"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}
