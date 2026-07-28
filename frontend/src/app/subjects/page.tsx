'use client';

import { AppShell } from '@/components/layout/AppShell';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, CheckCircle2, Circle, MoreVertical, Trash2, Edit3 } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

export default function SubjectsPage() {
  const qc = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [newSubject, setNewSubject] = useState({ name: '', color: '#7C3AED', icon: '' });

  const { data: subjects = [], isLoading } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => api.get('/subjects').then(r => r.data),
  });

  const createSubject = useMutation({
    mutationFn: (data: any) => api.post('/subjects', data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['subjects'] }); setShowAdd(false); setNewSubject({ name: '', color: '#7C3AED', icon: '' }); toast.success('Subject added!'); },
  });

  const completeTopic = useMutation({
    mutationFn: ({ subjectId, topicId, completed }: any) =>
      api.put(`/subjects/${subjectId}/topics/${topicId}/complete`, { completed }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subjects'] }),
  });

  const deleteSubject = useMutation({
    mutationFn: (id: string) => api.delete(`/subjects/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['subjects'] }); toast.success('Subject deleted'); },
  });

  const COLORS = ['#7C3AED', '#0EA5E9', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#8B5CF6', '#14B8A6'];

  return (
    <AppShell title="Subjects">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">{subjects.length} subjects</p>
          <button onClick={() => setShowAdd(!showAdd)} className="btn-primary flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> Add Subject
          </button>
        </div>

        {/* Add subject form */}
        <AnimatePresence>
          {showAdd && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="card space-y-4 overflow-hidden"
            >
              <h3 className="font-semibold">New Subject</h3>
              <div className="flex gap-3">
                <input
                  value={newSubject.icon}
                  onChange={e => setNewSubject(p => ({ ...p, icon: e.target.value }))}
                  className="input-field w-20 text-center text-2xl"
                  placeholder="📚"
                  maxLength={2}
                />
                <input
                  value={newSubject.name}
                  onChange={e => setNewSubject(p => ({ ...p, name: e.target.value }))}
                  className="input-field flex-1"
                  placeholder="Subject name..."
                />
              </div>
              <div className="flex gap-2">
                {COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => setNewSubject(p => ({ ...p, color: c }))}
                    className={cn('w-8 h-8 rounded-full transition-all', newSubject.color === c && 'ring-2 ring-white ring-offset-2 ring-offset-background')}
                    style={{ background: c }}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => newSubject.name && createSubject.mutate(newSubject)}
                  className="btn-primary text-sm"
                >Add Subject</button>
                <button onClick={() => setShowAdd(false)} className="btn-ghost text-sm">Cancel</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isLoading ? (
          <div className="grid gap-4">
            {[1,2,3].map(i => <div key={i} className="skeleton h-48" />)}
          </div>
        ) : (
          <div className="grid gap-4">
            {subjects.map((subject: any) => (
              <motion.div
                key={subject.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: `${subject.color}20`, border: `1px solid ${subject.color}40` }}>
                      {subject.icon || '📚'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{subject.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {subject.topics?.filter((t: any) => t.completed).length || 0} / {subject.topics?.length || 0} topics done
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold" style={{ color: subject.color }}>{Math.round(subject.progress)}%</span>
                    <button onClick={() => deleteSubject.mutate(subject.id)} className="p-2 rounded-xl hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${subject.progress}%` }}
                    transition={{ duration: 1 }}
                    className="h-full rounded-full"
                    style={{ background: subject.color }}
                  />
                </div>

                {/* Topics */}
                {subject.topics?.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {subject.topics.map((topic: any) => (
                      <button
                        key={topic.id}
                        onClick={() => completeTopic.mutate({ subjectId: subject.id, topicId: topic.id, completed: !topic.completed })}
                        className={cn(
                          'flex items-center gap-2 p-2.5 rounded-xl text-sm text-left transition-all',
                          topic.completed ? 'bg-green-500/10 text-green-400' : 'bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary'
                        )}
                      >
                        {topic.completed ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <Circle className="w-4 h-4 shrink-0" />}
                        <span className={cn('truncate', topic.completed && 'line-through')}>{topic.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}

            {subjects.length === 0 && (
              <div className="card text-center py-12 text-muted-foreground">
                <p className="text-4xl mb-3">📚</p>
                <p className="font-medium">No subjects yet</p>
                <p className="text-sm mt-1">Add your first subject to start tracking progress</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
