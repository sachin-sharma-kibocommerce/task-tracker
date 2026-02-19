'use client';

import { useState } from 'react';
import type { Task, Priority } from '../types';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const PRIORITY_CONFIG: Record<Priority, { label: string; dot: string; badge: string }> = {
  high: {
    label: 'High',
    dot: 'bg-rose-500',
    badge: 'bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/20',
  },
  medium: {
    label: 'Medium',
    dot: 'bg-amber-500',
    badge: 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20',
  },
  low: {
    label: 'Low',
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20',
  },
};

export function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
  const [deleting, setDeleting] = useState(false);
  const config = PRIORITY_CONFIG[task.priority];

  function handleDelete() {
    setDeleting(true);
    setTimeout(() => onDelete(task.id), 200);
  }

  return (
    <li
      className={`group flex items-center gap-4 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3.5 transition-all duration-200 hover:border-zinc-700 ${
        deleting ? 'opacity-0 scale-95' : 'opacity-100'
      }`}
    >
      {/* Checkbox */}
      <button
        onClick={() => onToggle(task.id)}
        aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
        className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
          task.completed
            ? 'bg-indigo-500 border-indigo-500'
            : 'border-zinc-600 hover:border-indigo-400'
        }`}
      >
        {task.completed && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {/* Priority dot */}
      <span className={`shrink-0 w-2 h-2 rounded-full ${config.dot} ${task.completed ? 'opacity-30' : ''}`} />

      {/* Title */}
      <span
        className={`flex-1 text-sm leading-snug transition-colors ${
          task.completed ? 'line-through text-zinc-600' : 'text-zinc-200'
        }`}
      >
        {task.title}
      </span>

      {/* Priority badge */}
      <span
        className={`shrink-0 hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${config.badge} ${
          task.completed ? 'opacity-40' : ''
        }`}
      >
        {config.label}
      </span>

      {/* Delete button */}
      <button
        onClick={handleDelete}
        aria-label="Delete task"
        className="shrink-0 opacity-0 group-hover:opacity-100 p-1 rounded-md text-zinc-600 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </li>
  );
}
