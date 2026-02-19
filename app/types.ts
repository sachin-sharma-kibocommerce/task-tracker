export type Priority = 'low' | 'medium' | 'high';

export type Filter = 'all' | 'low' | 'medium' | 'high' | 'completed';

export interface Task {
  id: string;
  title: string;
  priority: Priority;
  completed: boolean;
  createdAt: number;
}
