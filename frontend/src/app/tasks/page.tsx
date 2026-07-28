'use client';

import { AppShell } from '@/components/layout/AppShell';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';
import { Plus, CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import toast from 'react-hot-toast';
import Link from 'next/link';

const COLUMNS = [
  { id: 'TODO', label: 'To Do', color: 'border-t-gray-500' },
  { id: 'IN_PROGRESS', label: 'In Progress', color: 'border-t-blue-500' },
  { id: 'DONE', label: 'Done', color: 'border-t-green-500' },
];

const PRIORITY_COLORS: Record<string, string> = {
  URGENT: 'bg-red-500/20 text-red-400 border-red-500/30',
  HIGH: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  MEDIUM: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  LOW: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

export default function TasksPage() {
  const qc = useQueryClient();
  const [addingTask, setAddingTask] = useState<{ status: string; title: string } | null>(null);

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => api.get('/tasks').then(r => r.data),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: any) => api.put(`/tasks/${id}/status`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const createTask = useMutation({
    mutationFn: (data: any) => api.post('/tasks', data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tasks'] }); setAddingTask(null); toast.success('Task created!'); },
  });

  const deleteTask = useMutation({
    mutationFn: (id: string) => api.delete(`/tasks/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tasks'] }); toast.success('Task deleted'); },
  });

  return (
    <AppShell title="Tasks">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <p className="text-muted-foreground">{tasks.filter((t: any) => t.status !== 'DONE').length} tasks remaining</p>
          <Link href="/tasks/add">
            <button className="btn-primary flex items-center gap-2 text-sm">
              <Plus className="w-4 h-4" /> Add Task
            </button>
          </Link>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {COLUMNS.map(({ id, label, color }) => {
            const colTasks = tasks.filter((t: any) => t.status === id);
            return (
              <div key={id} className={`card border-t-2 ${color} space-y-3`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{label}</h3>
                  <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">{colTasks.length}</span>
                </div>

                <div className="space-y-2 min-h-[200px]">
                  {isLoading ? (
                    [1,2,3].map(i => <div key={i} className="skeleton h-20" />)
                  ) : colTasks.map((task: any) => (
                    <motion.div
                      key={task.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-secondary/50 rounded-xl p-3 space-y-2 group cursor-pointer hover:bg-secondary/80 transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        <button
                          onClick={() => updateStatus.mutate({ id: task.id, status: task.status === 'DONE' ? 'TODO' : 'DONE' })}
                          className="mt-0.5 shrink-0"
                        >
                          {task.status === 'DONE'
                            ? <CheckCircle2 className="w-5 h-5 text-green-400" />
                            : <Circle className="w-5 h-5 text-muted-foreground hover:text-purple-400 transition-colors" />
                          }
                        </button>
                        <p className={cn('text-sm font-medium flex-1', task.status === 'DONE' && 'line-through text-muted-foreground')}>
                          {task.title}
                        </p>
                      </div>
                      {task.subject && (
                        <div className="flex items-center gap-1.5 ml-7">
                          <div className="w-2 h-2 rounded-full" style={{ background: task.subject.color }} />
                          <span className="text-xs text-muted-foreground">{task.subject.name}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 ml-7">
                        <span className={cn('text-xs px-2 py-0.5 rounded-full border', PRIORITY_COLORS[task.priority])}>
                          {task.priority}
                        </span>
                        {task.dueDate && (
                          <span className="text-xs text-muted-foreground">
                            Due {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>
                      {/* Status change buttons */}
                      <div className="ml-7 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {COLUMNS.filter(c => c.id !== id).map(c => (
                          <button
                            key={c.id}
                            onClick={() => updateStatus.mutate({ id: task.id, status: c.id })}
                            className="text-xs bg-secondary px-2 py-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
                          >
                            → {c.label}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  ))}

                  {/* Add task inline */}
                  {addingTask?.status === id ? (
                    <div className="space-y-2">
                      <input
                        autoFocus
                        className="input-field text-sm py-2"
                        placeholder="Task title..."
                        value={addingTask.title}
                        onChange={e => setAddingTask({ ...addingTask, title: e.target.value })}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && addingTask.title) createTask.mutate({ title: addingTask.title, status: id });
                          if (e.key === 'Escape') setAddingTask(null);
                        }}
                      />
                      <div className="flex gap-2">
                        <button onClick={() => addingTask.title && createTask.mutate({ title: addingTask.title, status: id })} className="btn-primary text-xs px-3 py-1.5">Add</button>
                        <button onClick={() => setAddingTask(null)} className="btn-ghost text-xs px-3 py-1.5">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAddingTask({ status: id, title: '' })}
                      className="w-full flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground p-2 rounded-xl hover:bg-white/5 transition-colors"
                    >
                      <Plus className="w-4 h-4" /> Add task
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
