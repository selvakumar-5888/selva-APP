import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, getUserId } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { BottomNav } from '@/components/layout/BottomNav'

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
  high: '#ffb4ab',
  medium: '#eec13c',
  low: '#7bc67b',
}

const PRIORITY_DOT: Record<string, string> = {
  high: '#ffb4ab',
  medium: '#ffb785',
  low: '#c4c0ff',
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
      // ── Dev bypass: use mock data ─────────────────────────────────
      if (import.meta.env.VITE_BYPASS_AUTH === 'true') {
        setTasks([
          { id: '1', title: 'Finish React assignment', description: 'Complete the hooks section', status: 'in_progress', priority: 'high', due_date: '2026-06-20', subject_id: '1' },
          { id: '2', title: 'Read Chapter 5 – Physics', description: null, status: 'todo', priority: 'medium', due_date: '2026-06-21', subject_id: null },
          { id: '3', title: 'Math problem set', description: null, status: 'done', priority: 'low', due_date: null, subject_id: '1' },
        ] as Task[])
        setSubjects([{ id: '1', name: 'Mathematics', color: '#c4c0ff' }, { id: '2', name: 'Physics', color: '#eec13c' }])
        setLoading(false)
        return
      }
      // ─────────────────────────────────────────────────────────────
      const userId = await getUserId();
      if (!userId) { navigate('/login', { replace: true }); return }
      const [tasksRes, subjectsRes] = await Promise.all([
        supabase.from('tasks').select('*').eq('user_id', userId).order('created_at', { ascending: false }).order('status', { ascending: true }),
        supabase.from('subjects').select('id,name,color').eq('user_id', userId),
      ]);
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
    const userId = await getUserId();
    if (!userId) { setSaving(false); return }
    const payload = {
      title: newTask.title,
      description: newTask.description || null,
      priority: newTask.priority,
      due_date: newTask.due_date || null,
      subject_id: newTask.subject_id || null,
      status: newTask.status,
    };
    if (editingTask) {
      const { error } = await supabase.from('tasks').update(payload).eq('id', editingTask.id);
      if (error) toast.error(error.message);
      else { toast.success('Task updated!'); setShowModal(false); fetchData(); }
    } else {
      const { error } = await supabase.from('tasks').insert({ ...payload, user_id: userId });
      if (error) toast.error(error.message);
      else { toast.success('Task created!'); setShowModal(false); fetchData(); }
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

  return (
    <div className="bg-[#0a0e1a] text-[#dfe2f3] min-h-screen pb-24 overflow-x-hidden">
      {/* Atmospheric bg */}
      <div className="fixed top-1/4 -left-20 w-64 h-64 rounded-full blur-[100px] pointer-events-none" style={{ background: 'rgba(196,192,255,0.05)' }} />
      <div className="fixed bottom-1/4 -right-20 w-80 h-80 rounded-full blur-[120px] pointer-events-none" style={{ background: 'rgba(238,193,60,0.05)' }} />

      {/* Header */}
      <header className="fixed top-0 z-50 w-full backdrop-blur-xl border-b border-white/10 flex justify-between items-center px-6 py-4" style={{ background: 'rgba(15,19,31,0.8)', boxShadow: '0 0 20px rgba(108,99,255,0.1)' }}>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="text-[#c4c0ff] p-2 hover:bg-white/5 rounded-full">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <span className="text-2xl font-bold text-[#eec13c] tracking-tight" style={{ fontFamily: 'Syne, sans-serif' }}>StudyMind AI</span>
        </div>
        <button onClick={openAddModal} className="text-[#c4c0ff] hover:text-[#eec13c] transition-colors">
          <span className="material-symbols-outlined">add_task</span>
        </button>
      </header>

      <main className="pt-20 px-4">
        {/* Page title */}
        <div className="py-6">
          <h1 className="text-3xl font-bold text-[#dfe2f3]" style={{ fontFamily: 'Syne, sans-serif' }}>Task Board</h1>
          <p className="text-[#c7c4d8] mt-1">Manage your study tasks with AI-powered scheduling.</p>
        </div>

        {/* Filter bar */}
        <div className="flex gap-2 py-2 overflow-x-auto mb-4" style={{ scrollbarWidth: 'none' }}>
          {['All', 'High Priority', 'Due Today'].map(f => (
            <button key={f} className="flex items-center gap-1 px-4 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-all" style={{ background: f === 'All' ? 'rgba(238,193,60,0.15)' : 'rgba(255,255,255,0.03)', border: f === 'All' ? '1px solid rgba(238,193,60,0.4)' : '1px solid rgba(255,255,255,0.1)', color: f === 'All' ? '#eec13c' : '#c7c4d8' }}>
              {f}
            </button>
          ))}
        </div>

        {/* Kanban columns */}
        {loading ? (
          <div className="text-center py-20 text-[#c7c4d8]">Loading tasks...</div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-8" style={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'none' }}>
            {columns.map(col => {
              const colTasks = tasks.filter(t => t.status === col.key)
              return (
                <section key={col.key} className="flex flex-col gap-4 flex-shrink-0" style={{ width: 'calc(100vw - 32px)', maxWidth: '380px', scrollSnapAlign: 'start' }}>
                  <div className="flex justify-between items-center px-1">
                    <h2 className="text-xl font-semibold text-[#dfe2f3]" style={{ fontFamily: 'Syne, sans-serif' }}>{col.label}</h2>
                    <span className="px-3 py-0.5 rounded-full text-sm font-medium text-[#c7c4d8]" style={{ background: 'rgba(38,42,55,1)' }}>{colTasks.length}</span>
                  </div>

                  <div className="flex flex-col gap-4">
                    {colTasks.map(task => {
                      const subj = getSubject(task.subject_id)
                      return (
                        <div
                          key={task.id}
                          className="rounded-xl p-4 flex flex-col gap-3 cursor-pointer active:scale-[0.98] transition-all"
                          style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(12px)', border: col.key === 'in_progress' ? '1px solid rgba(196,192,255,0.3)' : '1px solid rgba(255,255,255,0.1)', borderLeft: col.key === 'in_progress' ? '4px solid #c4c0ff' : undefined, opacity: col.key === 'done' ? 0.6 : 1 }}
                          onClick={() => openEditModal(task)}
                        >
                          <div className="flex justify-between items-start">
                            {subj ? (
                              <span className="text-xs font-medium px-2 py-1 rounded-lg" style={{ color: subj.color, border: '1px solid ' + subj.color + '44' }}>{subj.name}</span>
                            ) : (
                              <span className="text-xs font-medium px-2 py-1 rounded-lg text-[#c7c4d8]" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>No Subject</span>
                            )}
                            <div className="w-3 h-3 rounded-full" style={{ background: PRIORITY_DOT[task.priority], boxShadow: '0 0 8px ' + PRIORITY_DOT[task.priority] + '88' }} />
                          </div>
                          <h3 className={`text-base font-semibold leading-tight ${col.key === 'done' ? 'line-through text-[#c7c4d8]' : 'text-[#dfe2f3]'}`}>{task.title}</h3>
                          {task.description && <p className="text-xs text-[#c7c4d8] line-clamp-2">{task.description}</p>}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 text-[#c7c4d8] text-xs">
                              {task.due_date && (
                                <><span className="material-symbols-outlined text-sm">calendar_today</span> {task.due_date}</>
                              )}
                            </div>
                            <div className="flex gap-1">
                              {col.key !== 'in_progress' && (
                                <button onClick={e => { e.stopPropagation(); handleStatusChange(task, 'in_progress') }} className="p-1 text-[#c7c4d8]/40 hover:text-[#eec13c] transition-colors" title="Move to In Progress">
                                  <span className="material-symbols-outlined text-sm">play_arrow</span>
                                </button>
                              )}
                              {col.key !== 'done' && (
                                <button onClick={e => { e.stopPropagation(); handleStatusChange(task, 'done') }} className="p-1 text-[#c7c4d8]/40 hover:text-[#7bc67b] transition-colors" title="Mark Done">
                                  <span className="material-symbols-outlined text-sm">check_circle</span>
                                </button>
                              )}
                              <button onClick={e => { e.stopPropagation(); handleDelete(task.id) }} className="p-1 text-[#c7c4d8]/40 hover:text-red-400 transition-colors" title="Delete">
                                <span className="material-symbols-outlined text-sm">delete</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}

                    {/* Add task button */}
                    <button onClick={openAddModal} className="w-full py-4 rounded-xl border-2 border-dashed border-white/5 flex items-center justify-center gap-2 text-[#c7c4d8] hover:bg-white/5 transition-all active:scale-95">
                      <span className="material-symbols-outlined">add</span>
                      <span className="text-sm font-medium uppercase tracking-wider">Add Task</span>
                    </button>
                  </div>
                </section>
              )
            })}
          </div>
        )}
      </main>

      {/* Add/Edit Task Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
          <div className="w-full md:max-w-lg rounded-t-2xl md:rounded-2xl p-6 space-y-5" style={{ background: '#1b1f2c', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-[#dfe2f3]" style={{ fontFamily: 'Syne, sans-serif' }}>{editingTask ? 'Edit Task' : 'New Task'}</h3>
              <button onClick={() => setShowModal(false)} className="text-[#c7c4d8] hover:text-white"><span className="material-symbols-outlined">close</span></button>
            </div>

            <input
              className="w-full bg-[#0f131f] border border-[#464555] rounded-lg px-4 py-3 text-[#dfe2f3] focus:border-[#c4c0ff] focus:outline-none"
              placeholder="Task title..."
              value={newTask.title}
              onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))}
            />
            <textarea
              className="w-full bg-[#0f131f] border border-[#464555] rounded-lg px-4 py-3 text-[#dfe2f3] focus:border-[#c4c0ff] focus:outline-none resize-none"
              placeholder="Description (optional)..."
              rows={2}
              value={newTask.description}
              onChange={e => setNewTask(p => ({ ...p, description: e.target.value }))}
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase tracking-widest text-[#eec13c] mb-2 block">Priority</label>
                <select className="w-full bg-[#0f131f] border border-[#464555] rounded-lg px-3 py-2 text-[#dfe2f3] focus:border-[#c4c0ff] focus:outline-none" value={newTask.priority} onChange={e => setNewTask(p => ({ ...p, priority: e.target.value }))}>
                  <option value="high">🔴 High</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="low">🟢 Low</option>
                </select>
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-[#eec13c] mb-2 block">Status</label>
                <select className="w-full bg-[#0f131f] border border-[#464555] rounded-lg px-3 py-2 text-[#dfe2f3] focus:border-[#c4c0ff] focus:outline-none" value={newTask.status} onChange={e => setNewTask(p => ({ ...p, status: e.target.value }))}>
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase tracking-widest text-[#eec13c] mb-2 block">Due Date</label>
                <input type="date" className="w-full bg-[#0f131f] border border-[#464555] rounded-lg px-3 py-2 text-[#dfe2f3] focus:border-[#c4c0ff] focus:outline-none" value={newTask.due_date} onChange={e => setNewTask(p => ({ ...p, due_date: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-[#eec13c] mb-2 block">Subject</label>
                <select className="w-full bg-[#0f131f] border border-[#464555] rounded-lg px-3 py-2 text-[#dfe2f3] focus:border-[#c4c0ff] focus:outline-none" value={newTask.subject_id} onChange={e => setNewTask(p => ({ ...p, subject_id: e.target.value }))}>
                  <option value="">None</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>

            <button onClick={handleSave} disabled={saving || !newTask.title.trim()} className="w-full py-4 rounded-xl font-bold text-sm uppercase tracking-wider transition-all active:scale-95 disabled:opacity-50" style={{ background: '#eec13c', color: '#3d2e00' }}>
              {saving ? 'Saving...' : editingTask ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
