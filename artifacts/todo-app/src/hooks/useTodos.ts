import { useState, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { TodoItem, FilterType, SortType } from '../types';
import { v4 as uuidv4 } from 'uuid';

export function useTodos() {
  const [todos, setTodos] = useLocalStorage<TodoItem[]>('todos', []);
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('date');
  const [searchQuery, setSearchQuery] = useState('');

  const addTodo = useCallback(
    (text: string, priority: TodoItem['priority'] = 'medium', category?: string, dueDate?: string) => {
      const newTodo: TodoItem = {
        id: uuidv4(),
        text,
        completed: false,
        priority,
        category,
        dueDate,
        createdAt: new Date().toISOString(),
      };
      setTodos(prev => [newTodo, ...prev]);
      return newTodo;
    },
    [setTodos]
  );

  const deleteTodo = useCallback(
    (id: string) => {
      setTodos(prev => prev.filter(todo => todo.id !== id));
    },
    [setTodos]
  );

  const toggleTodo = useCallback(
    (id: string) => {
      setTodos(prev =>
        prev.map(todo =>
          todo.id === id
            ? { ...todo, completed: !todo.completed, completedAt: !todo.completed ? new Date().toISOString() : undefined }
            : todo
        )
      );
    },
    [setTodos]
  );

  const updateTodo = useCallback(
    (id: string, updates: Partial<TodoItem>) => {
      setTodos(prev =>
        prev.map(todo => (todo.id === id ? { ...todo, ...updates } : todo))
      );
    },
    [setTodos]
  );

  const clearCompleted = useCallback(() => {
    setTodos(prev => prev.filter(todo => !todo.completed));
  }, [setTodos]);

  const getFilteredAndSortedTodos = useCallback(() => {
    let filtered = todos.filter(todo => {
      const matchesFilter =
        filter === 'all' || (filter === 'active' && !todo.completed) || (filter === 'completed' && todo.completed);

      const matchesSearch =
        !searchQuery ||
        todo.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (todo.category?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

      return matchesFilter && matchesSearch;
    });

    const sorted = [...filtered].sort((a, b) => {
      if (sort === 'date') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sort === 'priority') {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      } else if (sort === 'alphabetical') {
        return a.text.localeCompare(b.text);
      }
      return 0;
    });

    return sorted;
  }, [todos, filter, sort, searchQuery]);

  const stats = {
    total: todos.length,
    completed: todos.filter(t => t.completed).length,
    active: todos.filter(t => !t.completed).length,
    highPriority: todos.filter(t => !t.completed && t.priority === 'high').length,
  };

  return {
    todos,
    filter,
    setFilter,
    sort,
    setSort,
    searchQuery,
    setSearchQuery,
    addTodo,
    deleteTodo,
    toggleTodo,
    updateTodo,
    clearCompleted,
    filteredTodos: getFilteredAndSortedTodos(),
    stats,
  };
}
