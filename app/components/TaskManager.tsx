'use client';

import { useState, useEffect } from 'react';
import type { Task, Priority, Filter } from '../types';
import { TaskForm } from './TaskForm';
import { TaskList } from './TaskList';

const STORAGE_KEY = 'task-tracker-tasks';

export function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setTasks(JSON.parse(stored));
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }
  }, [tasks, hydrated]);

  function addTask(title: string, priority: Priority) {
    const task: Task = {
      id: crypto.randomUUID(),
      title,
      priority,
      completed: false,
      createdAt: Date.now(),
    };
    setTasks((prev) => [task, ...prev]);
  }

  function toggleTask(id: string) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  }

  function deleteTask(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  const counts = {
    all: tasks.filter((t) => !t.completed).length,
    low: tasks.filter((t) => t.priority === 'low' && !t.completed).length,
    medium: tasks.filter((t) => t.priority === 'medium' && !t.completed).length,
    high: tasks.filter((t) => t.priority === 'high' && !t.completed).length,
    completed: tasks.filter((t) => t.completed).length,
  };

  const filtered = tasks.filter((t) => {
    if (filter === 'completed') return t.completed;
    if (filter === 'all') return !t.completed;
    return t.priority === filter && !t.completed;
  });

  if (!hydrated) return null;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="font-semibold text-zinc-100 tracking-tight">Task Tracker</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <span className="tabular-nums">{counts.all}</span>
            <span>remaining</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Add Task Form */}
        <TaskForm onAdd={addTask} />

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 border-b border-zinc-800 pb-px">
          {(['all', 'high', 'medium', 'low', 'completed'] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 text-sm font-medium rounded-t transition-colors relative ${
                filter === f
                  ? 'text-zinc-100'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {counts[f] > 0 && (
                <span
                  className={`ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-semibold ${
                    filter === f
                      ? 'bg-indigo-500 text-white'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {counts[f]}
                </span>
              )}
              {filter === f && (
                <span className="absolute bottom-[-1px] left-0 right-0 h-px bg-indigo-500" />
              )}
            </button>
          ))}
        </div>

        {/* Task List */}
        <TaskList
          tasks={filtered}
          onToggle={toggleTask}
          onDelete={deleteTask}
          filter={filter}
        />
      </main>
    </div>
  );
}
