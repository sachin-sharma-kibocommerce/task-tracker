'use client';

import { useState, useRef } from 'react';
import type { Priority } from '../types';

const PRIORITIES: { value: Priority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

interface TaskFormProps {
  onAdd: (title: string, priority: Priority, dueDate?: string) => void;
}

export function TaskForm({ onAdd }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    onAdd(trimmed, priority, dueDate || undefined);
    setTitle('');
    setDueDate('');
    inputRef.current?.focus();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-3"
    >
      <div className="flex gap-3">
        <input
          ref={inputRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          autoFocus
          className="flex-1 bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
        />
        <button
          type="submit"
          disabled={!title.trim()}
          className="px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
        >
          Add Task
        </button>
      </div>

      <div className="flex items-center gap-5 flex-wrap">
        {/* Priority */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500 dark:text-zinc-500">Priority</span>
          <div className="flex gap-1.5">
            {PRIORITIES.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setPriority(p.value)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  priority === p.value
                    ? priorityActiveClass(p.value)
                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Due date */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500 dark:text-zinc-500">Due date</span>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-1 text-xs text-slate-600 dark:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
        </div>
      </div>
    </form>
  );
}

function priorityActiveClass(p: Priority) {
  switch (p) {
    case 'high':   return 'bg-rose-500/20 text-rose-600 dark:text-rose-400 ring-1 ring-rose-500/50';
    case 'medium': return 'bg-amber-500/20 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/50';
    case 'low':    return 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/50';
  }
}
