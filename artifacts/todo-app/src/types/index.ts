export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  category?: string;
  createdAt: string;
  completedAt?: string;
}

export type FilterType = 'all' | 'active' | 'completed';
export type SortType = 'date' | 'priority' | 'alphabetical';
