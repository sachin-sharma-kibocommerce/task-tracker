'use client';

import type { Task, Filter } from '../types';
import { TaskItem } from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
  filter: Filter;
}

const EMPTY_MESSAGES: Record<Filter, { heading: string; sub: string }> = {
  all: { heading: 'No pending tasks', sub: 'Add a task above to get started.' },
  high: { heading: 'No high-priority tasks', sub: 'Nothing urgent right now.' },
  medium: { heading: 'No medium-priority tasks', sub: 'Looking balanced.' },
  low: { heading: 'No low-priority tasks', sub: 'Nothing low-key on the list.' },
  completed: { heading: 'No completed tasks', sub: 'Finish something to see it here.' },
};

export function TaskList({ tasks, onToggle, onDelete, onRename, filter }: TaskListProps) {
  if (tasks.length === 0) {
    const msg = EMPTY_MESSAGES[filter];
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4">
          <svg className="w-5 h-5 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-zinc-400">{msg.heading}</p>
        <p className="text-xs text-zinc-600 mt-1">{msg.sub}</p>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onDelete={onDelete}
          onRename={onRename}
        />
      ))}
    </ul>
  );
}
