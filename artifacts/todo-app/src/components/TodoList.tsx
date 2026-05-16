import TodoItem from './TodoItem';
import type { TodoItem as TodoItemType } from '../types';

interface Props {
  todos: TodoItemType[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<TodoItemType>) => void;
}

export default function TodoList({ todos, onToggle, onDelete, onUpdate }: Props) {
  if (todos.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-3">🎉</div>
        <p className="text-gray-400 mb-2">No tasks found</p>
        <p className="text-gray-500 text-sm">All caught up! Add a new task to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {todos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  );
}
