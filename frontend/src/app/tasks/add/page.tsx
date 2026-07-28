'use client';

import { AppShell } from '@/components/layout/AppShell';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']),
  dueDate: z.string().optional(),
  subjectId: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function AddTaskPage() {
  const router = useRouter();
  const qc = useQueryClient();

  const { data: subjects = [] } = useQuery({ queryKey: ['subjects'], queryFn: () => api.get('/subjects').then(r => r.data) });

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { priority: 'MEDIUM', status: 'TODO' },
  });

  const create = useMutation({
    mutationFn: (data: FormData) => api.post('/tasks', data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tasks'] }); toast.success('Task created!'); router.push('/tasks'); },
    onError: () => toast.error('Failed to create task'),
  });

  return (
    <AppShell title="Add Task">
      <div className="max-w-lg mx-auto space-y-6">
        <Link href="/tasks">
          <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Tasks
          </button>
        </Link>

        <div className="card space-y-5">
          <h2 className="text-xl font-semibold">New Task</h2>
          <form onSubmit={handleSubmit((d) => create.mutate(d))} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Title *</label>
              <input {...register('title')} className="input-field" placeholder="What needs to be done?" />
              {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Description</label>
              <textarea {...register('description')} rows={3} className="input-field resize-none" placeholder="Add details..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Priority</label>
                <select {...register('priority')} className="input-field">
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Status</label>
                <select {...register('status')} className="input-field">
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="DONE">Done</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Due Date</label>
              <input {...register('dueDate')} type="datetime-local" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Subject</label>
              <select {...register('subjectId')} className="input-field">
                <option value="">No subject</option>
                {subjects.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <button type="submit" disabled={isSubmitting} className="btn-primary w-full flex items-center justify-center gap-2 py-3.5">
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Task'}
            </button>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
