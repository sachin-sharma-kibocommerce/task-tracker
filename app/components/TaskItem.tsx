'use client';

import { useState, useRef } from 'react';
import type { Task, Priority, Status } from '../types';

interface TaskItemProps {
  task: Task;
  onSetStatus: (id: string, status: Status) => void;
  onSetPriority: (id: string, priority: Priority) => void;
  onRequestDelete: (id: string) => void;
  onRestore: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onSetDueDate: (id: string, dueDate?: string) => void;
}

const PRIORITY_SELECT_CLASS: Record<Priority, string> = {
  high:   'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  medium: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  low:    'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
};

const PRIORITY_DOT: Record<Priority, string> = {
  high: 'bg-rose-500', medium: 'bg-amber-500', low: 'bg-emerald-500',
};

const STATUS_CONFIG: Record<string, { label: string; classes: string }> = {
  'not-started': { label: 'Not Started', classes: 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400' },
  'in-progress': { label: 'In Progress', classes: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' },
  'completed':   { label: 'Completed',   classes: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' },
};

function formatDueDate(dateStr: string): { text: string; urgency: 'overdue' | 'today' | 'soon' | 'normal' } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dateStr + 'T00:00:00');
  const diffDays = Math.round((due.getTime() - today.getTime()) / 86_400_000);
  const text = diffDays === 0 ? 'Today' : due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  if (diffDays < 0)  return { text, urgency: 'overdue' };
  if (diffDays === 0) return { text, urgency: 'today' };
  if (diffDays <= 2)  return { text, urgency: 'soon' };
  return { text, urgency: 'normal' };
}

function dueDateColorClass(urgency: string, done: boolean) {
  if (done) return 'text-slate-400 dark:text-zinc-600';
  return ({ overdue: 'text-rose-500 dark:text-rose-400', today: 'text-amber-500 dark:text-amber-400', soon: 'text-orange-500 dark:text-orange-400', normal: 'text-slate-500 dark:text-zinc-400' } as Record<string, string>)[urgency] ?? '';
}

export function TaskItem({
  task, onSetStatus, onSetPriority, onRequestDelete, onRestore, onRename, onSetDueDate,
}: TaskItemProps) {
  const [removing, setRemoving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task.title);
  const [editingDate, setEditingDate] = useState(false);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const isCompleted = task.status === 'completed';
  const isRemoved = task.status === 'removed';
  const dueInfo = task.dueDate ? formatDueDate(task.dueDate) : null;

  /* ── title editing ── */
  function startEditing() {
    if (isCompleted || isRemoved) return;
    setDraft(task.title);
    setEditing(true);
  }
  function commitEdit() {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== task.title) onRename(task.id, trimmed);
    setEditing(false);
  }
  function cancelEdit() { setDraft(task.title); setEditing(false); }
  function handleTitleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter') commitEdit();
    if (e.key === 'Escape') cancelEdit();
  }

  /* ── due date editing ── */
  function handleDateClick() {
    if (isRemoved) return;
    setEditingDate(true);
    setTimeout(() => {
      try { dateInputRef.current?.showPicker(); } catch { dateInputRef.current?.focus(); }
    }, 50);
  }
  function handleDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    onSetDueDate(task.id, e.target.value || undefined);
    setEditingDate(false);
  }

  /* ── delete / restore ── */
  function handleDeleteClick() {
    setRemoving(true);
    setTimeout(() => {
      onRequestDelete(task.id);
      setRemoving(false);
    }, 150);
  }
  function handleCheckbox() {
    if (isRemoved) return;
    onSetStatus(task.id, isCompleted ? 'not-started' : 'completed');
  }

  return (
    <li
      className={`group flex items-center gap-3 border rounded-xl px-4 py-3.5 transition-all duration-200 ${
        isRemoved
          ? 'bg-slate-50 dark:bg-zinc-900/50 border-slate-200 dark:border-zinc-800 opacity-60'
          : editing
          ? 'bg-white dark:bg-zinc-900 border-indigo-500/50'
          : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
      } ${removing ? 'opacity-0 scale-95' : 'opacity-100'}`}
      style={
        !editing && !isRemoved && task.priority === 'high' && !isCompleted
          ? { borderLeftColor: 'rgb(239 68 68 / 0.5)', borderLeftWidth: '2px' }
          : undefined
      }
    >
      {/* Checkbox */}
      <button
        onClick={handleCheckbox}
        disabled={isRemoved}
        aria-label={isCompleted ? 'Mark incomplete' : 'Mark complete'}
        className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
          isCompleted
            ? 'bg-indigo-500 border-indigo-500'
            : isRemoved
            ? 'border-slate-200 dark:border-zinc-700 cursor-default'
            : 'border-slate-300 dark:border-zinc-600 hover:border-indigo-400'
        }`}
      >
        {isCompleted && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {/* Priority dot */}
      <span className={`shrink-0 w-2 h-2 rounded-full ${PRIORITY_DOT[task.priority]} ${isCompleted || isRemoved ? 'opacity-30' : ''}`} />

      {/* Title */}
      {editing ? (
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={handleTitleKey}
          className="flex-1 min-w-0 bg-transparent text-sm text-slate-900 dark:text-zinc-100 focus:outline-none"
        />
      ) : (
        <span
          onClick={startEditing}
          title={isCompleted || isRemoved ? undefined : 'Click to edit'}
          className={`flex-1 min-w-0 truncate text-sm leading-snug transition-colors ${
            isCompleted || isRemoved
              ? 'line-through text-slate-400 dark:text-zinc-600 cursor-default'
              : 'text-slate-800 dark:text-zinc-200 cursor-text hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          {task.title}
        </span>
      )}

      {/* Due date */}
      {!isRemoved && (
        <div className="shrink-0">
          {editingDate ? (
            <input
              ref={dateInputRef}
              type="date"
              defaultValue={task.dueDate ?? ''}
              onChange={handleDateChange}
              onBlur={() => setEditingDate(false)}
              className="text-xs bg-slate-100 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-md px-2 py-1 text-slate-600 dark:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          ) : (
            <button
              onClick={handleDateClick}
              className={`flex items-center gap-1 text-xs rounded-md px-2 py-1 transition-colors ${
                dueInfo
                  ? `${dueDateColorClass(dueInfo.urgency, isCompleted)} hover:bg-slate-100 dark:hover:bg-zinc-800`
                  : 'text-slate-300 dark:text-zinc-700 hover:text-slate-400 dark:hover:text-zinc-500 hover:bg-slate-100 dark:hover:bg-zinc-800 opacity-0 group-hover:opacity-100'
              }`}
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
              </svg>
              {dueInfo ? dueInfo.text : 'Add date'}
            </button>
          )}
        </div>
      )}

      {/* Status select (hidden on removed tasks) */}
      {!isRemoved && (
        <select
          value={task.status}
          onChange={(e) => onSetStatus(task.id, e.target.value as Status)}
          className={`shrink-0 text-xs rounded-md px-2 py-1 border-0 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer font-medium transition-colors ${STATUS_CONFIG[task.status]?.classes ?? ''}`}
        >
          <option value="not-started">Not Started</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      )}

      {/* Priority select (replaces badge) */}
      <select
        value={task.priority}
        onChange={(e) => onSetPriority(task.id, e.target.value as Priority)}
        disabled={isRemoved}
        className={`shrink-0 text-xs rounded-full px-2 py-0.5 border-0 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium transition-colors ${
          isRemoved ? 'opacity-40 cursor-default' : 'cursor-pointer'
        } ${PRIORITY_SELECT_CLASS[task.priority]}`}
      >
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>

      {/* Restore (removed) / Delete (active) */}
      {isRemoved ? (
        <button
          onClick={() => onRestore(task.id)}
          className="shrink-0 opacity-0 group-hover:opacity-100 text-xs px-2 py-1 rounded-md text-indigo-500 hover:bg-indigo-500/10 font-medium transition-all"
        >
          Restore
        </button>
      ) : (
        <button
          onClick={handleDeleteClick}
          aria-label="Delete task"
          className="shrink-0 opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-400 dark:text-zinc-600 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </li>
  );
}
