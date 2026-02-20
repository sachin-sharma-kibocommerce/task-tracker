export type Priority = 'low' | 'medium' | 'high';
export type Status = 'not-started' | 'in-progress' | 'completed' | 'removed';
export type Filter = 'all' | 'low' | 'medium' | 'high' | 'completed' | 'removed';
export type SortBy = 'default' | 'due-asc' | 'due-desc';

export interface Task {
  id: string;
  title: string;
  priority: Priority;
  status: Status;
  dueDate?: string; // YYYY-MM-DD
  createdAt: number;
}
