import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, getUserId } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { BottomNav } from '@/components/layout/BottomNav'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, Plus, Trash2, Calendar, Activity, X,
  BookOpen, Calculator, Terminal, Rocket, Microscope, 
  Palette, TrendingUp, Scale, Brain, Code, Wrench, Globe, Music 
} from 'lucide-react'

interface Subject {
  id: string
  name: string
  color: string
  icon: string
  progress: number
  exam_date: string | null
}

const ICON_MAP: Record<string, any> = {
  school: BookOpen,
  functions: Calculator,
  terminal: Terminal,
  rocket_launch: Rocket,
  biotech: Microscope,
  palette: Palette,
  trending_up: TrendingUp,
  balance: Scale,
  psychology: Brain,
  code: Code,
  engineering: Wrench,
  language: Globe,
  music_note: Music,
  default: BookOpen
}

export default function LibraryPage() {
  const navigate = useNavigate()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newSubject, setNewSubject] = useState({ name: '', color: '#4facfe', icon: 'school', exam_date: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      if (import.meta.env.VITE_BYPASS_AUTH === 'true') {
        setSubjects([
          { id: '1', name: 'Mathematics', color: '#4facfe', icon: 'functions', progress: 65, exam_date: '2026-07-15' },
          { id: '2', name: 'Computer Science', color: '#00f2fe', icon: 'terminal', progress: 40, exam_date: null },
          { id: '3', name: 'Physics', color: '#ff4b4b', icon: 'rocket_launch', progress: 80, exam_date: '2026-07-20' },
        ])
        setLoading(false)
        return
      }

      const userId = await getUserId()
      if (!userId) { navigate('/login', { replace: true }); return }

      const { data: subjectsData } = await supabase
        .from('subjects').select('*').eq('user_id', userId).order('created_at', { ascending: false })
      setSubjects(subjectsData || [])
    } catch (e) {
      console.error(e)
      toast.error('Failed to load library.')
    } finally {
      setLoading(false)
    }
  }

  const handleAddSubject = async () => {
    if (!newSubject.name.trim()) return
    setSaving(true)
    try {
      const userId = await getUserId()
      if (!userId) return
      const { error } = await supabase.from('subjects').insert({
        user_id: userId,
        name: newSubject.name,
        color: newSubject.color,
        icon: newSubject.icon,
        exam_date: newSubject.exam_date || null,
        progress: 0,
      })
      if (error) throw error
      toast.success('Subject added!')
      setShowAddModal(false)
      setNewSubject({ name: '', color: '#4facfe', icon: 'school', exam_date: '' })
      fetchData()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteSubject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const { error } = await supabase.from('subjects').delete().eq('id', id)
    if (error) { toast.error(error.message) } else {
      toast.success('Subject removed')
      fetchData()
    }
  }

  const avgProgress = subjects.length ? Math.round(subjects.reduce((a, s) => a + (s.progress || 0), 0) / subjects.length) : 0

  const ICON_KEYS = Object.keys(ICON_MAP).filter(k => k !== 'default')
  const COLOR_OPTIONS = ['#4facfe', '#00f2fe', '#ff4b4b', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6']

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }
  const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }

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
            <h1 className="font-display text-xl font-bold text-white tracking-tight">Curriculum Library</h1>
          </div>
          <button onClick={() => setShowAddModal(true)} className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-background hover:scale-105 transition-transform shadow-[0_0_20px_rgba(79,172,254,0.4)]">
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8 space-y-8">
        
        {/* Progress Overview Bento */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 flex flex-col justify-end min-h-[180px] relative overflow-hidden group"
        >
          <div className="absolute top-8 right-8 w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform">
            <Activity className="text-primary w-8 h-8" />
          </div>
          <div className="relative z-10 w-full max-w-md">
            <p className="text-primary text-sm font-bold tracking-widest uppercase mb-1">Overall Progress</p>
            <h2 className="text-5xl font-display font-extrabold text-white mb-4">{avgProgress}<span className="text-2xl text-text-muted font-normal">%</span></h2>
            <div className="w-full bg-surface border border-surface-border h-2 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-primary to-secondary h-full rounded-full transition-all duration-1000 ease-out" style={{ width: avgProgress + '%' }} />
            </div>
          </div>
        </motion.section>

        {/* Subjects Grid */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-bold tracking-widest uppercase text-text-muted">Active Subjects</h3>
            <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">{subjects.length} Total</span>
          </div>
          
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : subjects.length === 0 ? (
            <div className="text-center p-16 rounded-2xl border border-dashed border-surface-border bg-surface/50">
              <BookOpen className="w-12 h-12 text-text-muted mx-auto mb-4 animate-bounce" />
              <p className="text-white text-lg font-display font-semibold mb-2">Your library is empty</p>
              <p className="text-text-muted text-sm mb-6 max-w-xs mx-auto">Add your first subject to start organizing your study materials.</p>
              <button onClick={() => setShowAddModal(true)} className="bg-primary text-background px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wider hover:scale-105 transition-transform">Add Subject</button>
            </div>
          ) : (
            <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map(subject => {
                const SubjectIcon = ICON_MAP[subject.icon] || ICON_MAP.default
                return (
                  <motion.div key={subject.id} variants={itemVariants} className="glass-card p-6 flex flex-col gap-4 relative overflow-hidden group cursor-pointer hover:border-white/20 transition-all">
                    <div className="absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity pointer-events-none" style={{ background: subject.color }} />
                    
                    <div className="flex justify-between items-start relative z-10">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center border" style={{ background: subject.color + '15', borderColor: subject.color + '30' }}>
                        <SubjectIcon className="w-6 h-6" style={{ color: subject.color }} />
                      </div>
                      <button onClick={(e) => handleDeleteSubject(subject.id, e)} className="w-8 h-8 rounded-full bg-surface-hover flex items-center justify-center text-text-muted hover:text-error hover:bg-error/10 transition-all opacity-0 group-hover:opacity-100">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="relative z-10 mt-2">
                      <h4 className="text-xl font-display font-bold text-white mb-1 truncate">{subject.name}</h4>
                      <p className="text-xs text-text-muted flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {subject.exam_date ? `Exam: ${subject.exam_date}` : 'No exam scheduled'}
                      </p>
                    </div>

                    <div className="relative z-10 mt-auto pt-4">
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-xs font-bold tracking-widest uppercase text-text-muted">Completion</span>
                        <span className="text-sm font-bold" style={{ color: subject.color }}>{subject.progress}%</span>
                      </div>
                      <input
                        type="range" min={0} max={100} value={subject.progress || 0}
                        className="w-full h-2 rounded-full appearance-none bg-surface border border-surface-border outline-none"
                        style={{ accentColor: subject.color }}
                        onChange={async e => {
                          const newProgress = Number(e.target.value)
                          setSubjects(prev => prev.map(s => s.id === subject.id ? { ...s, progress: newProgress } : s))
                          await supabase.from('subjects').update({ progress: newProgress }).eq('id', subject.id)
                        }}
                      />
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          )}
        </section>
      </main>

      {/* Add Subject Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-md rounded-3xl p-8 space-y-6 glass-card shadow-2xl border-surface-border bg-surface"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-display font-bold text-white">Add Subject</h3>
                <button onClick={() => setShowAddModal(false)} className="w-8 h-8 rounded-full bg-surface-hover flex items-center justify-center text-text-muted hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-5">
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-text-muted mb-2 block">Subject Name</label>
                  <input
                    className="w-full bg-background border border-surface-border rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                    placeholder="e.g. Quantum Physics"
                    value={newSubject.name}
                    onChange={e => setNewSubject(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-text-muted mb-2 block">Exam Date (optional)</label>
                  <input
                    type="date"
                    className="w-full bg-background border border-surface-border rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all [color-scheme:dark]"
                    value={newSubject.exam_date}
                    onChange={e => setNewSubject(prev => ({ ...prev, exam_date: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-text-muted mb-2 block">Theme Color</label>
                  <div className="flex gap-3 flex-wrap">
                    {COLOR_OPTIONS.map(color => (
                      <button key={color} onClick={() => setNewSubject(prev => ({ ...prev, color }))}
                        className="w-10 h-10 rounded-full transition-all duration-300 hover:scale-110"
                        style={{ background: color, border: newSubject.color === color ? '2px solid white' : '2px solid transparent', boxShadow: newSubject.color === color ? `0 0 15px ${color}80` : 'none' }}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-text-muted mb-2 block">Icon</label>
                  <div className="flex gap-2 flex-wrap">
                    {ICON_KEYS.map(iconKey => {
                      const IconCmp = ICON_MAP[iconKey]
                      return (
                        <button key={iconKey} onClick={() => setNewSubject(prev => ({ ...prev, icon: iconKey }))}
                          className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300"
                          style={{ background: newSubject.icon === iconKey ? newSubject.color + '20' : 'rgba(255,255,255,0.05)', border: newSubject.icon === iconKey ? `1px solid ${newSubject.color}` : '1px solid transparent', color: newSubject.icon === iconKey ? newSubject.color : '#94a3b8' }}
                        >
                          <IconCmp className="w-5 h-5" />
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleAddSubject}
                disabled={saving || !newSubject.name.trim()}
                className="w-full py-4 rounded-xl font-bold text-sm uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 mt-4 bg-primary text-background hover:brightness-110"
              >
                {saving ? 'Saving...' : 'Add Subject'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  )
}
