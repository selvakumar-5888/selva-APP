'use client';

import { AppShell } from '@/components/layout/AppShell';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';
import { Plus, BookOpen, Trash2, CheckCircle, Clock } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { daysUntil, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const schema = z.object({
  title: z.string().min(1),
  date: z.string(),
  subjectId: z.string().optional(),
  duration: z.number().optional(),
  location: z.string().optional(),
});
type F = z.infer<typeof schema>;

export default function ExamsPage() {
  const qc = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const { data: exams = [], isLoading } = useQuery({ queryKey: ['exams'], queryFn: () => api.get('/exams').then(r => r.data) });
  const { data: subjects = [] } = useQuery({ queryKey: ['subjects'], queryFn: () => api.get('/subjects').then(r => r.data) });

  const { register, handleSubmit, reset } = useForm<F>({ resolver: zodResolver(schema) });

  const create = useMutation({
    mutationFn: (d: F) => api.post('/exams', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['exams'] }); setShowAdd(false); reset(); toast.success('Exam added!'); },
  });

  const del = useMutation({
    mutationFn: (id: string) => api.delete(`/exams/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['exams'] }); toast.success('Exam removed'); },
  });

  const upcoming = exams.filter((e: any) => !e.completed && daysUntil(e.date) >= 0).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const past = exams.filter((e: any) => e.completed || daysUntil(e.date) < 0);

  const getCountdownColor = (days: number) => {
    if (days <= 3) return 'text-red-400 bg-red-500/20';
    if (days <= 7) return 'text-orange-400 bg-orange-500/20';
    if (days <= 14) return 'text-yellow-400 bg-yellow-500/20';
    return 'text-green-400 bg-green-500/20';
  };

  return (
    <AppShell title="Exams">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">{upcoming.length} upcoming</p>
          <button onClick={() => setShowAdd(!showAdd)} className="btn-primary flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> Add Exam
          </button>
        </div>

        {showAdd && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="card space-y-4">
            <h3 className="font-semibold">New Exam</h3>
            <form onSubmit={handleSubmit(d => create.mutate(d))} className="space-y-3">
              <input {...register('title')} className="input-field" placeholder="Exam title..." />
              <div className="grid grid-cols-2 gap-3">
                <input {...register('date')} type="datetime-local" className="input-field" />
                <input {...register('duration', { valueAsNumber: true })} type="number" className="input-field" placeholder="Duration (min)" />
              </div>
              <input {...register('location')} className="input-field" placeholder="Location (optional)" />
              <select {...register('subjectId')} className="input-field">
                <option value="">No subject</option>
                {subjects.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <div className="flex gap-2">
                <button type="submit" className="btn-primary text-sm">Add Exam</button>
                <button type="button" onClick={() => setShowAdd(false)} className="btn-ghost text-sm">Cancel</button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Upcoming */}
        <div className="space-y-3">
          <h2 className="font-semibold text-lg">Upcoming Exams</h2>
          {isLoading ? (
            [1,2].map(i => <div key={i} className="skeleton h-24" />)
          ) : upcoming.length > 0 ? (
            upcoming.map((exam: any) => {
              const days = daysUntil(exam.date);
              return (
                <motion.div
                  key={exam.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card flex items-center gap-4"
                >
                  <div className="w-14 h-14 rounded-xl bg-secondary flex flex-col items-center justify-center shrink-0">
                    <span className={cn('text-xl font-bold', getCountdownColor(days).split(' ')[0])}>{days}</span>
                    <span className="text-xs text-muted-foreground">days</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{exam.title}</h3>
                    <p className="text-sm text-muted-foreground">{formatDate(exam.date)}</p>
                    {exam.subject && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <div className="w-2 h-2 rounded-full" style={{ background: exam.subject.color }} />
                        <span className="text-xs text-muted-foreground">{exam.subject.name}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn('text-xs px-3 py-1.5 rounded-full font-medium', getCountdownColor(days))}>
                      {days === 0 ? 'Today!' : days === 1 ? 'Tomorrow' : `${days} days`}
                    </span>
                    <button onClick={() => del.mutate(exam.id)} className="p-2 hover:bg-red-500/10 text-muted-foreground hover:text-red-400 rounded-xl transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="card text-center py-8 text-muted-foreground">
              <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>No upcoming exams — you&apos;re all clear! 🎉</p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
