'use client';

import { useState, useRef } from 'react';
import type { Priority } from '../types';

const PRIORITIES: { value: Priority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

interface TaskFormProps {
  onAdd: (title: string, priority: Priority) => void;
}

export function TaskForm({ onAdd }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    onAdd(trimmed, priority);
    setTitle('');
    inputRef.current?.focus();
  }

  return (
    <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
      <div className="flex gap-3">
        <input
          ref={inputRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          autoFocus
          className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
        />
        <button
          type="submit"
          disabled={!title.trim()}
          className="px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
        >
          Add Task
        </button>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-zinc-500 font-medium">Priority</span>
        <div className="flex gap-1.5">
          {PRIORITIES.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setPriority(p.value)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                priority === p.value
                  ? priorityActiveClass(p.value)
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </form>
  );
}

function priorityActiveClass(p: Priority) {
  switch (p) {
    case 'high':
      return 'bg-rose-500/20 text-rose-400 ring-1 ring-rose-500/50';
    case 'medium':
      return 'bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/50';
    case 'low':
      return 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/50';
  }
}
