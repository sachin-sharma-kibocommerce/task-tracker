'use client';

import { useState, useEffect } from 'react';
import type { Task, Priority, Status, Filter, SortBy } from '../types';
import { TaskForm } from './TaskForm';
import { TaskList } from './TaskList';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

const STORAGE_KEY = 'task-tracker-tasks';
const THEME_KEY = 'task-tracker-theme';

export function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [sortBy, setSortBy] = useState<SortBy>('default');
  const [hydrated, setHydrated] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const raw = JSON.parse(stored);
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
      { id: crypto.randomUUID(), title, priority, status: 'not-started', dueDate, createdAt: Date.now() },
      ...prev,
    ]);
  }

  function setTaskStatus(id: string, status: Status) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
  }

  function setTaskPriority(id: string, priority: Priority) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, priority } : t)));
  }

  function setDueDate(id: string, dueDate?: string) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, dueDate } : t)));
  }

  function renameTask(id: string, title: string) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, title } : t)));
  }

  function removeTask(id: string) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'removed' } : t)));
  }

  function restoreTask(id: string) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'not-started' } : t)));
  }

  function confirmDelete() {
    if (pendingDelete) {
      removeTask(pendingDelete);
      setPendingDelete(null);
    }
  }

  const counts: Record<Filter, number> = {
    all:       tasks.filter((t) => t.status !== 'completed' && t.status !== 'removed').length,
    low:       tasks.filter((t) => t.priority === 'low'    && t.status !== 'completed' && t.status !== 'removed').length,
    medium:    tasks.filter((t) => t.priority === 'medium' && t.status !== 'completed' && t.status !== 'removed').length,
    high:      tasks.filter((t) => t.priority === 'high'   && t.status !== 'completed' && t.status !== 'removed').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
    removed:   tasks.filter((t) => t.status === 'removed').length,
  };

  const filtered = tasks.filter((t) => {
    if (filter === 'removed')   return t.status === 'removed';
    if (filter === 'completed') return t.status === 'completed';
    if (filter === 'all')       return t.status !== 'completed' && t.status !== 'removed';
    return t.priority === filter && t.status !== 'completed' && t.status !== 'removed';
  });

  const sorted: Task[] = sortBy === 'default' ? filtered : [...filtered].sort((a, b) => {
    const fallback = sortBy === 'due-asc' ? Infinity : -Infinity;
    const da = a.dueDate ? new Date(a.dueDate + 'T00:00:00').getTime() : fallback;
    const db = b.dueDate ? new Date(b.dueDate + 'T00:00:00').getTime() : fallback;
    return sortBy === 'due-asc' ? da - db : db - da;
  });

  const pendingTask = pendingDelete ? tasks.find((t) => t.id === pendingDelete) : null;

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

          {/* Filter tabs + Sort control */}
          <div className="flex items-end justify-between border-b border-slate-200 dark:border-zinc-800">
            <div className="flex items-center gap-1">
              {(['all', 'high', 'medium', 'low', 'completed', 'removed'] as Filter[]).map((f) => (
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
                        ? f === 'removed' ? 'bg-rose-500 text-white' : 'bg-indigo-500 text-white'
                        : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400'
                    }`}>
                      {counts[f]}
                    </span>
                  )}
                  {filter === f && (
                    <span className={`absolute bottom-[-1px] left-0 right-0 h-px ${f === 'removed' ? 'bg-rose-500' : 'bg-indigo-500'}`} />
                  )}
                </button>
              ))}
            </div>

            {/* Sort control */}
            <div className="flex items-center gap-2 pb-2">
              <span className="text-xs text-slate-400 dark:text-zinc-500">Sort</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="text-xs bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="default">Default</option>
                <option value="due-asc">Due date ↑</option>
                <option value="due-desc">Due date ↓</option>
              </select>
            </div>
          </div>

          <TaskList
            tasks={sorted}
            onSetStatus={setTaskStatus}
            onSetPriority={setTaskPriority}
            onRequestDelete={setPendingDelete}
            onRestore={restoreTask}
            onRename={renameTask}
            onSetDueDate={setDueDate}
            filter={filter}
          />
        </main>
      </div>

      {/* Confirm delete modal */}
      {pendingTask && (
        <ConfirmDeleteModal
          taskTitle={pendingTask.title}
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}
