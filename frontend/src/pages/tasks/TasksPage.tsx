import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, getUserId } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { BottomNav } from '@/components/layout/BottomNav'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, Plus, Calendar, PlayCircle, CheckCircle, Trash2, X
} from 'lucide-react'

interface Task {
  id: string
  title: string
  description: string | null
  status: 'todo' | 'in_progress' | 'done'
  priority: 'low' | 'medium' | 'high'
  due_date: string | null
  subject_id: string | null
}

interface Subject {
  id: string
  name: string
  color: string
}

const PRIORITY_COLORS: Record<string, string> = {
  high: 'bg-error shadow-[0_0_8px_rgba(255,75,75,0.6)]',
  medium: 'bg-secondary shadow-[0_0_8px_rgba(0,242,254,0.6)]',
  low: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]',
}

export default function TasksPage() {
  const navigate = useNavigate()
  const [tasks, setTasks] = useState<Task[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium', due_date: '', subject_id: '', status: 'todo' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      if (import.meta.env.VITE_BYPASS_AUTH === 'true') {
        setTasks([
          { id: '1', title: 'Finish React assignment', description: 'Complete the hooks section', status: 'in_progress', priority: 'high', due_date: '2026-06-20', subject_id: '1' },
          { id: '2', title: 'Read Chapter 5 – Physics', description: null, status: 'todo', priority: 'medium', due_date: '2026-06-21', subject_id: null },
          { id: '3', title: 'Math problem set', description: null, status: 'done', priority: 'low', due_date: null, subject_id: '1' },
        ] as Task[])
        setSubjects([{ id: '1', name: 'Mathematics', color: '#4facfe' }, { id: '2', name: 'Physics', color: '#ff4b4b' }])
        setLoading(false)
        return
      }
      const userId = await getUserId()
      if (!userId) { navigate('/login', { replace: true }); return }
      const [tasksRes, subjectsRes] = await Promise.all([
        supabase.from('tasks').select('*').eq('user_id', userId).order('created_at', { ascending: false }).order('status', { ascending: true }),
        supabase.from('subjects').select('id,name,color').eq('user_id', userId),
      ])
      setTasks((tasksRes.data || []) as Task[])
      setSubjects(subjectsRes.data || [])
    } catch (e: any) {
      console.error(e)
      toast.error('Failed to load tasks.')
    } finally {
      setLoading(false)
    }
  }

  const openAddModal = () => {
    setEditingTask(null)
    setNewTask({ title: '', description: '', priority: 'medium', due_date: '', subject_id: '', status: 'todo' })
    setShowModal(true)
  }

  const openEditModal = (task: Task) => {
    setEditingTask(task)
    setNewTask({ title: task.title, description: task.description || '', priority: task.priority, due_date: task.due_date || '', subject_id: task.subject_id || '', status: task.status })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!newTask.title.trim()) return
    setSaving(true)
    const userId = await getUserId()
    if (!userId) { setSaving(false); return }
    const payload = {
      title: newTask.title,
      description: newTask.description || null,
      priority: newTask.priority,
      due_date: newTask.due_date || null,
      subject_id: newTask.subject_id || null,
      status: newTask.status,
    }
    if (editingTask) {
      const { error } = await supabase.from('tasks').update(payload).eq('id', editingTask.id)
      if (error) toast.error(error.message)
      else { toast.success('Task updated!'); setShowModal(false); fetchData() }
    } else {
      const { error } = await supabase.from('tasks').insert({ ...payload, user_id: userId })
      if (error) toast.error(error.message)
      else { toast.success('Task created!'); setShowModal(false); fetchData() }
    }
    setSaving(false)
  }

  const handleStatusChange = async (task: Task, newStatus: 'todo' | 'in_progress' | 'done') => {
    await supabase.from('tasks').update({ status: newStatus }).eq('id', task.id)
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t))
    toast.success('Task updated!')
  }

  const handleDelete = async (id: string) => {
    await supabase.from('tasks').delete().eq('id', id)
    toast.success('Task deleted')
    fetchData()
  }

  const columns: { key: 'todo' | 'in_progress' | 'done'; label: string }[] = [
    { key: 'todo', label: 'To Do' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'done', label: 'Done' },
  ]

  const getSubject = (id: string | null) => subjects.find(s => s.id === id)

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }
  const itemVariants = { hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1 } }

  return (
    <div className="bg-background min-h-screen pb-24 text-text-main font-sans antialiased overflow-x-hidden relative">
      <div className="fixed inset-0 bg-luminous-glow pointer-events-none z-0" />

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md border-b border-surface-border bg-background/60">
        <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/dashboard')} className="p-2 rounded-full hover:bg-surface-hover transition-colors">
              <ArrowLeft className="w-5 h-5 text-text-muted hover:text-white transition-colors" />
            </button>
            <h1 className="font-display text-xl font-bold text-white tracking-tight">Task Board</h1>
          </div>
          <button onClick={openAddModal} className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-background hover:scale-105 transition-transform shadow-[0_0_20px_rgba(79,172,254,0.4)]">
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        
        {/* Filter bar */}
        <div className="flex gap-2 overflow-x-auto mb-8 hide-scrollbar pb-2">
          {['All', 'High Priority', 'Due Today'].map(f => (
            <button key={f} className={`flex items-center gap-1 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all ${
              f === 'All' ? 'bg-primary/20 text-primary border border-primary/40' : 'bg-surface border border-surface-border text-text-muted hover:text-white hover:bg-surface-hover'
            }`}>
              {f}
            </button>
          ))}
        </div>

        {/* Kanban columns */}
        {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-8 hide-scrollbar" style={{ scrollSnapType: 'x mandatory' }}>
            {columns.map(col => {
              const colTasks = tasks.filter(t => t.status === col.key)
              return (
                <section key={col.key} className="flex flex-col gap-4 flex-shrink-0" style={{ width: 'calc(100vw - 32px)', maxWidth: '380px', scrollSnapAlign: 'start' }}>
                  <div className="flex justify-between items-center px-2">
                    <h2 className="text-sm font-bold tracking-widest uppercase text-text-muted">{col.label}</h2>
                    <span className="px-3 py-0.5 rounded-full text-xs font-bold text-white bg-surface border border-surface-border">{colTasks.length}</span>
                  </div>

                  <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex flex-col gap-3">
                    <AnimatePresence>
                      {colTasks.map(task => {
                        const subj = getSubject(task.subject_id)
                        return (
                          <motion.div
                            layout
                            variants={itemVariants}
                            key={task.id}
                            className={`glass-card p-5 flex flex-col gap-3 cursor-pointer hover:border-primary/40 transition-all ${col.key === 'done' ? 'opacity-50 hover:opacity-100' : ''}`}
                            onClick={() => openEditModal(task)}
                          >
                            <div className="flex justify-between items-start">
                              {subj ? (
                                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md" style={{ color: subj.color, backgroundColor: subj.color + '20', border: '1px solid ' + subj.color + '40' }}>{subj.name}</span>
                              ) : (
                                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md text-text-muted bg-surface border border-surface-border">No Subject</span>
                              )}
                              <div className={`w-2.5 h-2.5 rounded-full ${PRIORITY_COLORS[task.priority]}`} />
                            </div>
                            
                            <div>
                              <h3 className={`text-base font-display font-bold leading-tight ${col.key === 'done' ? 'line-through text-text-muted' : 'text-white'}`}>{task.title}</h3>
                              {task.description && <p className="text-xs text-text-muted mt-1 line-clamp-2">{task.description}</p>}
                            </div>

                            <div className="flex items-center justify-between mt-2 pt-3 border-t border-surface-border">
                              <div className="flex items-center gap-1.5 text-text-muted text-xs font-medium">
                                {task.due_date && (
                                  <><Calendar className="w-3.5 h-3.5" /> {task.due_date}</>
                                )}
                              </div>
                              <div className="flex gap-2">
                                {col.key !== 'in_progress' && (
                                  <button onClick={e => { e.stopPropagation(); handleStatusChange(task, 'in_progress') }} className="text-text-muted hover:text-secondary transition-colors" title="Move to In Progress">
                                    <PlayCircle className="w-5 h-5" />
                                  </button>
                                )}
                                {col.key !== 'done' && (
                                  <button onClick={e => { e.stopPropagation(); handleStatusChange(task, 'done') }} className="text-text-muted hover:text-success transition-colors" title="Mark Done">
                                    <CheckCircle className="w-5 h-5" />
                                  </button>
                                )}
                                <button onClick={e => { e.stopPropagation(); handleDelete(task.id) }} className="text-text-muted hover:text-error transition-colors" title="Delete">
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>

                    {/* Add task button */}
                    <button onClick={openAddModal} className="w-full py-4 rounded-xl border-2 border-dashed border-surface-border bg-surface/30 flex items-center justify-center gap-2 text-text-muted hover:text-white hover:border-primary/50 transition-all group">
                      <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-bold uppercase tracking-wider">Add Task</span>
                    </button>
                  </motion.div>
                </section>
              )
            })}
          </div>
        )}
      </main>

      {/* Add/Edit Task Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-background/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full md:max-w-lg rounded-t-3xl md:rounded-3xl p-8 space-y-6 glass-card border-surface-border bg-surface shadow-2xl"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-display font-bold text-white">{editingTask ? 'Edit Task' : 'New Task'}</h3>
                <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full bg-surface-hover flex items-center justify-center text-text-muted hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <input
                  className="w-full bg-background border border-surface-border rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                  placeholder="Task title..."
                  value={newTask.title}
                  onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))}
                />
                <textarea
                  className="w-full bg-background border border-surface-border rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all resize-none"
                  placeholder="Description (optional)..."
                  rows={2}
                  value={newTask.description}
                  onChange={e => setNewTask(p => ({ ...p, description: e.target.value }))}
                />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-2 block">Priority</label>
                    <select className="w-full bg-background border border-surface-border rounded-xl px-3 py-3 text-white focus:border-primary focus:outline-none" value={newTask.priority} onChange={e => setNewTask(p => ({ ...p, priority: e.target.value }))}>
                      <option value="high">🔴 High</option>
                      <option value="medium">🟡 Medium</option>
                      <option value="low">🟢 Low</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-2 block">Status</label>
                    <select className="w-full bg-background border border-surface-border rounded-xl px-3 py-3 text-white focus:border-primary focus:outline-none" value={newTask.status} onChange={e => setNewTask(p => ({ ...p, status: e.target.value }))}>
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-2 block">Due Date</label>
                    <input type="date" className="w-full bg-background border border-surface-border rounded-xl px-3 py-3 text-white focus:border-primary focus:outline-none [color-scheme:dark]" value={newTask.due_date} onChange={e => setNewTask(p => ({ ...p, due_date: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-2 block">Subject</label>
                    <select className="w-full bg-background border border-surface-border rounded-xl px-3 py-3 text-white focus:border-primary focus:outline-none" value={newTask.subject_id} onChange={e => setNewTask(p => ({ ...p, subject_id: e.target.value }))}>
                      <option value="">None</option>
                      {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <button onClick={handleSave} disabled={saving || !newTask.title.trim()} className="w-full py-4 rounded-xl font-bold text-sm uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 mt-4 bg-primary text-background hover:brightness-110">
                {saving ? 'Saving...' : editingTask ? 'Update Task' : 'Create Task'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      <BottomNav />
    </div>
  )
}
