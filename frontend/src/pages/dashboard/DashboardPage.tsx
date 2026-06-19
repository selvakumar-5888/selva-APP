import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, getUserId } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { BottomNav } from '@/components/layout/BottomNav'

export default function DashboardPage() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<any>(null)
  const [recentTasks, setRecentTasks] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      // ── Dev bypass: use mock data, no Supabase calls ──────────────
      if (import.meta.env.VITE_BYPASS_AUTH === 'true') {
        setProfile({ full_name: 'Dev Scholar', streak_days: 7, total_study_hours: 42 })
        setRecentTasks([
          { id: '1', title: 'Finish React assignment', priority: 'high', due_date: 'Today' },
          { id: '2', title: 'Read Chapter 5 – Physics', priority: 'medium', due_date: 'Tomorrow' },
        ])
        setSubjects([
          { id: '1', name: 'Mathematics', icon: 'functions', color: '#c4c0ff', progress: 65 },
          { id: '2', name: 'Computer Science', icon: 'terminal', color: '#eec13c', progress: 40 },
        ])
        setLoading(false)
        return
      }
      // ─────────────────────────────────────────────────────────────

      const userId = await getUserId()
      if (!userId) { navigate('/login', { replace: true }); return }

      const [profileRes, tasksRes, subjectsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase.from('tasks').select('*').eq('user_id', userId).neq('status', 'done').order('created_at', { ascending: false }).limit(3),
        supabase.from('subjects').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(4),
      ])

      setProfile(profileRes.data || { full_name: 'Scholar', streak_days: 0, total_study_hours: 0 })
      setRecentTasks(tasksRes.data || [])
      setSubjects(subjectsRes.data || [])
    } catch (e) {
      console.error(e)
      toast.error('Failed to load dashboard data.')
    } finally {
      setLoading(false)
    }
  }


  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login', { replace: true })
  }

  const getGreeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const firstName = profile?.full_name ? profile.full_name.split(' ')[0] : 'Scholar'

  return (
    <div className="bg-[#05050A] min-h-screen pb-24 text-[#dfe2f3] antialiased overflow-x-hidden font-sans">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#6C63FF] rounded-full mix-blend-screen filter blur-[150px] opacity-20 animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#EEC13C] rounded-full mix-blend-screen filter blur-[150px] opacity-10 animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Modern Top Header */}
      <header className="relative z-40 sticky top-0 backdrop-blur-3xl border-b border-white/5 bg-[#05050A]/70">
        <div className="flex justify-between items-center px-6 py-5 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#6C63FF] to-[#3B349E] p-[1px]">
              <div className="w-full h-full rounded-2xl bg-[#0A0E1A] flex items-center justify-center overflow-hidden">
                {profile?.avatar_url
                  ? <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                  : <span className="material-symbols-outlined text-[#c4c0ff] text-2xl">person</span>}
              </div>
            </div>
            <div>
              <p className="text-xs text-[#918FA1] font-semibold tracking-widest uppercase">{getGreeting()}</p>
              <h1 className="text-xl font-bold text-white tracking-tight" style={{ fontFamily: 'Syne, sans-serif' }}>{firstName}</h1>
            </div>
          </div>
          <button onClick={handleLogout} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#c7c4d8] hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 transition-all">
            <span className="material-symbols-outlined text-sm">logout</span>
          </button>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Bento Grid Header */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Streak Card */}
          <div className="md:col-span-2 relative overflow-hidden rounded-[32px] p-8 flex flex-col justify-end min-h-[220px]" style={{ background: 'linear-gradient(135deg, rgba(238,193,60,0.1) 0%, rgba(238,193,60,0.02) 100%)', border: '1px solid rgba(238,193,60,0.2)' }}>
            <div className="absolute top-6 right-6 w-16 h-16 rounded-full bg-[#EEC13C]/20 flex items-center justify-center blur-sm" />
            <div className="absolute top-8 right-8 w-12 h-12 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#EEC13C] text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
            </div>
            <div className="relative z-10">
              <p className="text-[#EEC13C] text-sm font-bold tracking-widest uppercase mb-1">Current Streak</p>
              <h2 className="text-5xl font-extrabold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>{profile?.streak_days || 0} <span className="text-2xl text-white/50 font-normal">Days</span></h2>
              <p className="text-[#c7c4d8] text-sm mt-2 max-w-sm">You are in the top 5% of scholars this week. Keep the momentum going!</p>
            </div>
          </div>

          {/* Quick Study Card */}
          <div className="relative overflow-hidden rounded-[32px] p-8 flex flex-col justify-between min-h-[220px] cursor-pointer group hover:scale-[1.02] transition-transform duration-300" style={{ background: 'linear-gradient(135deg, rgba(108,99,255,0.1) 0%, rgba(108,99,255,0.02) 100%)', border: '1px solid rgba(108,99,255,0.2)' }} onClick={() => navigate('/library')}>
            <div className="w-12 h-12 rounded-2xl bg-[#6C63FF]/20 flex items-center justify-center border border-[#6C63FF]/30">
              <span className="material-symbols-outlined text-[#c4c0ff]">timer</span>
            </div>
            <div>
              <p className="text-[#c4c0ff] text-sm font-bold tracking-widest uppercase mb-1">Focus Mode</p>
              <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>Start Session</h3>
              <div className="flex items-center gap-2 text-xs text-[#918FA1]">
                <span className="material-symbols-outlined text-xs">arrow_forward</span> Enter deep work
              </div>
            </div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#6C63FF] blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity" />
          </div>
        </section>

        {/* Quick Access Menu */}
        <section>
          <h3 className="text-sm font-bold tracking-widest uppercase text-[#918FA1] mb-4 pl-2">Navigation</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { title: 'Library', icon: 'book_4', color: '#c4c0ff', path: '/library' },
              { title: 'Tasks', icon: 'task_alt', color: '#ffb785', path: '/tasks' },
              { title: 'Notes', icon: 'note_stack', color: '#7bc67b', path: '/notes' },
              { title: 'Flashcards', icon: 'style', color: '#ff7b7b', path: '/flashcards' }
            ].map(item => (
              <button key={item.title} onClick={() => navigate(item.path)} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 transition-all group">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center border" style={{ background: item.color + '15', borderColor: item.color + '30' }}>
                  <span className="material-symbols-outlined text-lg" style={{ color: item.color }}>{item.icon}</span>
                </div>
                <span className="font-semibold text-white/90 group-hover:text-white transition-colors">{item.title}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Dynamic Content Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pending Tasks Bento */}
          <div className="rounded-[32px] p-6 bg-white/[0.02] border border-white/5 relative overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold tracking-widest uppercase text-[#918FA1]">Priority Tasks</h3>
              <button onClick={() => navigate('/tasks')} className="text-xs font-bold text-[#c4c0ff] hover:text-white transition-colors bg-[#c4c0ff]/10 px-3 py-1.5 rounded-full">View All</button>
            </div>
            <div className="space-y-3 relative z-10">
              {recentTasks.length > 0 ? recentTasks.map(task => (
                <div key={task.id} className="flex items-center gap-4 p-4 rounded-2xl bg-[#0A0E1A] border border-white/5">
                  <div className="w-3 h-3 rounded-full shadow-[0_0_10px_rgba(255,180,171,0.5)]" style={{ background: task.priority === 'high' ? '#ffb4ab' : '#eec13c' }} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">{task.title}</p>
                    <p className="text-xs text-[#918FA1] mt-0.5">{task.due_date || 'No due date'}</p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-6 text-[#918FA1] bg-[#0A0E1A] rounded-2xl border border-white/5">
                  <span className="material-symbols-outlined text-3xl mb-2 opacity-50">done_all</span>
                  <p className="text-sm">No pending tasks!</p>
                </div>
              )}
            </div>
          </div>

          {/* Activity / AI Insights */}
          <div className="rounded-[32px] p-6 bg-white/[0.02] border border-white/5 relative overflow-hidden flex flex-col">
            <h3 className="text-sm font-bold tracking-widest uppercase text-[#918FA1] mb-6">AI Insight</h3>
            <div className="flex-1 flex flex-col justify-center items-center text-center p-6 bg-gradient-to-b from-[#6C63FF]/10 to-transparent rounded-2xl border border-[#6C63FF]/20 relative">
              <div className="absolute top-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#6C63FF] to-transparent opacity-50" />
              <span className="material-symbols-outlined text-[#c4c0ff] text-4xl mb-4 animate-bounce" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              <h4 className="text-lg font-bold text-white mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>Optimal Review Time</h4>
              <p className="text-sm text-[#c7c4d8] leading-relaxed">Your retention for Biology peaks at 4:00 PM. Schedule your next flashcard session then for a 20% memory boost.</p>
            </div>
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  )
}
