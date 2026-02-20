'use client';

import { useState, useEffect } from 'react';
import type { Task, Priority, Status, Filter } from '../types';
import { TaskForm } from './TaskForm';
import { TaskList } from './TaskList';

const STORAGE_KEY = 'task-tracker-tasks';
const THEME_KEY = 'task-tracker-theme';

export function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [hydrated, setHydrated] = useState(false);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const raw = JSON.parse(stored);
        // Migrate old tasks: convert completed boolean → status field
        const migrated = raw.map((t: any) => {
          const { completed, ...rest } = t;
          return {
            ...rest,
            status: rest.status ?? (completed ? 'completed' : 'not-started'),
          };
        });
        setTasks(migrated);
      }
    } catch { /* ignore */ }

    const theme = localStorage.getItem(THEME_KEY);
    setIsDark(theme !== 'light');
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks, hydrated]);

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem(THEME_KEY, next ? 'dark' : 'light');
  }

  function addTask(title: string, priority: Priority, dueDate?: string) {
    setTasks((prev) => [
      {
        id: crypto.randomUUID(),
        title,
        priority,
        status: 'not-started',
        dueDate,
        createdAt: Date.now(),
      },
      ...prev,
    ]);
  }

  function setTaskStatus(id: string, status: Status) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
  }

  function setDueDate(id: string, dueDate?: string) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, dueDate } : t)));
  }

  function renameTask(id: string, title: string) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, title } : t)));
  }

  function deleteTask(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  const counts = {
    all: tasks.filter((t) => t.status !== 'completed').length,
    low: tasks.filter((t) => t.priority === 'low' && t.status !== 'completed').length,
    medium: tasks.filter((t) => t.priority === 'medium' && t.status !== 'completed').length,
    high: tasks.filter((t) => t.priority === 'high' && t.status !== 'completed').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
  };

  const filtered = tasks.filter((t) => {
    if (filter === 'completed') return t.status === 'completed';
    if (filter === 'all') return t.status !== 'completed';
    return t.priority === filter && t.status !== 'completed';
  });

  if (!hydrated) return null;

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100">
        {/* Header */}
        <header className="border-b border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="font-semibold tracking-tight">Task Tracker</span>
            </div>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle light/dark mode"
              className="p-2 rounded-lg text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            >
              {isDark ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                </svg>
              )}
            </button>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
          <TaskForm onAdd={addTask} />

          {/* Filter tabs */}
          <div className="flex items-center gap-1 border-b border-slate-200 dark:border-zinc-800 pb-px">
            {(['all', 'high', 'medium', 'low', 'completed'] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-2 text-sm font-medium rounded-t transition-colors relative ${
                  filter === f
                    ? 'text-slate-900 dark:text-zinc-100'
                    : 'text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
                {counts[f] > 0 && (
                  <span className={`ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-semibold ${
                    filter === f
                      ? 'bg-indigo-500 text-white'
                      : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400'
                  }`}>
                    {counts[f]}
                  </span>
                )}
                {filter === f && (
                  <span className="absolute bottom-[-1px] left-0 right-0 h-px bg-indigo-500" />
                )}
              </button>
            ))}
          </div>

          <TaskList
            tasks={filtered}
            onSetStatus={setTaskStatus}
            onDelete={deleteTask}
            onRename={renameTask}
            onSetDueDate={setDueDate}
            filter={filter}
          />
        </main>
      </div>
    </div>
  );
}
