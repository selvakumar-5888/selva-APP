import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, getUserId } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { BottomNav } from '@/components/layout/BottomNav'

interface Subject {
  id: string
  name: string
  color: string
  icon: string
  progress: number
  exam_date: string | null
}

export default function LibraryPage() {
  const navigate = useNavigate()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newSubject, setNewSubject] = useState({ name: '', color: '#c4c0ff', icon: 'school', exam_date: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // ── Dev bypass: use mock data ─────────────────────────────────
      if (import.meta.env.VITE_BYPASS_AUTH === 'true') {
        setSubjects([
          { id: '1', name: 'Mathematics', color: '#c4c0ff', icon: 'functions', progress: 65, exam_date: '2026-07-15' },
          { id: '2', name: 'Computer Science', color: '#eec13c', icon: 'terminal', progress: 40, exam_date: null },
          { id: '3', name: 'Physics', color: '#ffb785', icon: 'rocket_launch', progress: 80, exam_date: '2026-07-20' },
        ])
        setLoading(false)
        return
      }
      // ─────────────────────────────────────────────────────────────
      const userId = await getUserId();
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
      const userId = await getUserId();
      if (!userId) return
      const { error } = await supabase.from('subjects').insert({
        user_id: userId,
        name: newSubject.name,
        color: newSubject.color,
        icon: newSubject.icon,
        exam_date: newSubject.exam_date || null,
        progress: 0,
      })
      if (error) throw error;
      toast.success('Subject added!')
      setShowAddModal(false)
      setNewSubject({ name: '', color: '#c4c0ff', icon: 'school', exam_date: '' })
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

  const ICON_OPTIONS = ['school', 'science', 'calculate', 'history_edu', 'biotech', 'menu_book', 'palette', 'trending_up', 'balance', 'psychology', 'code', 'engineering', 'language', 'music_note']
  const COLOR_OPTIONS = ['#c4c0ff', '#eec13c', '#ffb785', '#8781ff', '#ff7b7b', '#7bc67b', '#60d0d0', '#ff9de2']

  return (
    <div className="bg-[#05050A] text-[#dfe2f3] min-h-screen pb-32 overflow-x-hidden font-sans">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-[#c4c0ff] rounded-full mix-blend-screen filter blur-[150px] opacity-10 animate-pulse" />
      </div>

      {/* Modern Top Header */}
      <header className="relative z-40 sticky top-0 backdrop-blur-3xl border-b border-white/5 bg-[#05050A]/70">
        <div className="flex justify-between items-center px-6 py-5 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/dashboard')} className="text-[#c4c0ff] hover:bg-white/10 transition-colors p-2 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <h1 className="text-xl font-bold text-white tracking-tight" style={{ fontFamily: 'Syne, sans-serif' }}>Curriculum Library</h1>
          </div>
          <button onClick={() => setShowAddModal(true)} className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-[#c4c0ff] to-[#8781ff] text-[#1b0091] hover:scale-105 transition-transform shadow-[0_0_20px_rgba(196,192,255,0.4)]">
            <span className="material-symbols-outlined text-xl">add</span>
          </button>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8 space-y-8">
        
        {/* Progress Overview Bento */}
        <section className="relative overflow-hidden rounded-[32px] p-8 flex flex-col justify-end min-h-[180px]" style={{ background: 'linear-gradient(135deg, rgba(196,192,255,0.1) 0%, rgba(196,192,255,0.02) 100%)', border: '1px solid rgba(196,192,255,0.2)' }}>
          <div className="absolute top-8 right-8 w-16 h-16 rounded-2xl bg-[#c4c0ff]/10 flex items-center justify-center border border-[#c4c0ff]/20">
            <span className="material-symbols-outlined text-[#c4c0ff] text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>monitoring</span>
          </div>
          <div className="relative z-10 w-full max-w-md">
            <p className="text-[#c4c0ff] text-sm font-bold tracking-widest uppercase mb-1">Overall Progress</p>
            <h2 className="text-5xl font-extrabold text-white mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>{avgProgress}<span className="text-2xl text-white/50 font-normal">%</span></h2>
            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
              <div className="bg-[#c4c0ff] h-full rounded-full transition-all duration-1000 ease-out" style={{ width: avgProgress + '%' }} />
            </div>
          </div>
        </section>

        {/* Subjects Grid */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold tracking-widest uppercase text-[#918FA1]">Active Subjects</h3>
            <span className="text-xs font-bold text-[#c4c0ff] bg-[#c4c0ff]/10 px-3 py-1 rounded-full">{subjects.length} Total</span>
          </div>
          
          {loading ? (
            <div className="text-center py-10 text-[#c7c4d8]">Loading...</div>
          ) : subjects.length === 0 ? (
            <div className="text-center p-16 rounded-[32px] border border-dashed border-white/10 bg-white/[0.02]">
              <span className="material-symbols-outlined text-5xl text-[#c4c0ff]/40 mb-4 block animate-bounce">school</span>
              <p className="text-white text-lg font-semibold mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>Your library is empty</p>
              <p className="text-[#918FA1] text-sm mb-6 max-w-xs mx-auto">Add your first subject to start organizing your study materials.</p>
              <button onClick={() => setShowAddModal(true)} className="bg-[#c4c0ff] text-[#1b0091] px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wider hover:scale-105 transition-transform shadow-[0_0_20px_rgba(196,192,255,0.3)]">Add Subject</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map(subject => (
                <div key={subject.id} className="rounded-[24px] p-6 flex flex-col gap-4 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300 cursor-pointer" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity" style={{ background: subject.color }} />
                  
                  <div className="flex justify-between items-start relative z-10">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center border" style={{ background: subject.color + '15', borderColor: subject.color + '30' }}>
                      <span className="material-symbols-outlined text-2xl" style={{ color: subject.color, fontVariationSettings: "'FILL' 1" }}>{subject.icon || 'school'}</span>
                    </div>
                    <button onClick={(e) => handleDeleteSubject(subject.id, e)} className="w-8 h-8 rounded-full bg-black/20 flex items-center justify-center text-white/40 hover:text-red-400 hover:bg-red-400/20 transition-all opacity-0 group-hover:opacity-100">
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                  
                  <div className="relative z-10 mt-2">
                    <h4 className="text-xl font-bold text-white mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>{subject.name}</h4>
                    <p className="text-xs text-[#918FA1] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">event</span>
                      {subject.exam_date ? `Exam: ${subject.exam_date}` : 'No exam scheduled'}
                    </p>
                  </div>

                  <div className="relative z-10 mt-auto pt-4">
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-xs font-bold tracking-widest uppercase text-[#918FA1]">Completion</span>
                      <span className="text-sm font-bold" style={{ color: subject.color }}>{subject.progress}%</span>
                    </div>
                    <input
                      type="range" min={0} max={100} value={subject.progress || 0}
                      className="w-full h-2 rounded-full appearance-none bg-white/10 outline-none"
                      style={{ accentColor: subject.color }}
                      onChange={async e => {
                        const newProgress = Number(e.target.value)
                        setSubjects(prev => prev.map(s => s.id === subject.id ? { ...s, progress: newProgress } : s))
                        await supabase.from('subjects').update({ progress: newProgress }).eq('id', subject.id)
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Add Subject Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)' }}>
          <div className="w-full max-w-md rounded-[32px] p-8 space-y-6 animate-in slide-in-from-bottom-8 md:slide-in-from-bottom-0 md:zoom-in-95 duration-300" style={{ background: '#0A0E1A', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>Add Subject</h3>
              <button onClick={() => setShowAddModal(false)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[#c7c4d8] hover:text-white"><span className="material-symbols-outlined text-sm">close</span></button>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-[#918FA1] mb-2 block">Subject Name</label>
                <input
                  className="w-full bg-[#131620] border border-white/5 rounded-2xl px-4 py-4 text-white focus:border-[#c4c0ff] focus:outline-none transition-colors"
                  placeholder="e.g. Quantum Physics"
                  value={newSubject.name}
                  onChange={e => setNewSubject(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-[#918FA1] mb-2 block">Exam Date (optional)</label>
                <input
                  type="date"
                  className="w-full bg-[#131620] border border-white/5 rounded-2xl px-4 py-4 text-white focus:border-[#c4c0ff] focus:outline-none transition-colors"
                  value={newSubject.exam_date}
                  onChange={e => setNewSubject(prev => ({ ...prev, exam_date: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-[#918FA1] mb-2 block">Theme Color</label>
                <div className="flex gap-3 flex-wrap">
                  {COLOR_OPTIONS.map(color => (
                    <button key={color} onClick={() => setNewSubject(prev => ({ ...prev, color }))}
                      className="w-10 h-10 rounded-full transition-all duration-300 hover:scale-110"
                      style={{ background: color, border: newSubject.color === color ? '3px solid white' : '3px solid transparent', boxShadow: newSubject.color === color ? `0 0 15px ${color}` : 'none' }}
                    />
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-[#918FA1] mb-2 block">Icon</label>
                <div className="flex gap-2 flex-wrap">
                  {ICON_OPTIONS.map(icon => (
                    <button key={icon} onClick={() => setNewSubject(prev => ({ ...prev, icon }))}
                      className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300"
                      style={{ background: newSubject.icon === icon ? newSubject.color + '20' : '#131620', border: newSubject.icon === icon ? `1px solid ${newSubject.color}` : '1px solid transparent', color: newSubject.icon === icon ? newSubject.color : '#918FA1' }}
                    >
                      <span className="material-symbols-outlined">{icon}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <button
              onClick={handleAddSubject}
              disabled={saving || !newSubject.name.trim()}
              className="w-full py-4 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 mt-4"
              style={{ background: '#c4c0ff', color: '#1b0091' }}
            >
              {saving ? 'Saving...' : 'Add Subject'}
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
