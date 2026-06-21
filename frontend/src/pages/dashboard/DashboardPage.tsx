import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, getUserId } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { BottomNav } from '@/components/layout/BottomNav'
import { motion } from 'framer-motion'
import { Flame, Brain, LogOut, BookOpen, CheckSquare, FileText, Layers, Sparkles, User as UserIcon } from 'lucide-react'

export default function DashboardPage() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<any>(null)
  const [recentTasks, setRecentTasks] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      if (import.meta.env.VITE_BYPASS_AUTH === 'true') {
        setProfile({ full_name: 'Dev Scholar', streak_days: 7, total_study_hours: 42 })
        setRecentTasks([
          { id: '1', title: 'Finish React assignment', priority: 'high', due_date: 'Today' },
          { id: '2', title: 'Read Chapter 5 – Physics', priority: 'medium', due_date: 'Tomorrow' },
        ])
        setSubjects([
          { id: '1', name: 'Mathematics', icon: 'functions', color: '#4facfe', progress: 65 },
          { id: '2', name: 'Computer Science', icon: 'terminal', color: '#00f2fe', progress: 40 },
        ])
        setLoading(false)
        return
      }

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

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <div className="bg-background min-h-screen pb-24 text-text-main font-sans antialiased overflow-x-hidden relative">
      
      {/* Dynamic Background */}
      <div className="fixed inset-0 bg-luminous-glow pointer-events-none z-0" />

      {/* Decorative Orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] pointer-events-none animate-pulse-glow" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/10 rounded-full blur-[120px] pointer-events-none animate-pulse-glow" style={{ animationDelay: '2s' }} />

      {/* Modern Top Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md border-b border-surface-border bg-background/60">
        <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/profile')} 
              className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-br from-primary to-secondary hover:scale-105 transition-transform"
            >
              <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden">
                {profile?.avatar_url
                  ? <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                  : <UserIcon className="w-6 h-6 text-primary" />}
              </div>
            </button>
            <div className="flex flex-col">
              <p className="text-[10px] font-bold text-text-muted tracking-widest uppercase">{getGreeting()}</p>
              <h1 className="text-xl font-display font-bold text-white tracking-tight">{firstName}</h1>
            </div>
          </div>
          <button 
            onClick={handleLogout} 
            className="w-10 h-10 rounded-full bg-surface border border-surface-border flex items-center justify-center text-text-muted hover:bg-error/10 hover:text-error hover:border-error/30 transition-all"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          {/* Bento Grid Top Section */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Streak Card */}
            <motion.div variants={itemVariants} className="md:col-span-2 glass-card p-6 flex flex-col justify-end min-h-[200px] relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-transparent opacity-50" />
              <div className="absolute top-6 right-6 w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center backdrop-blur-md border border-secondary/30 group-hover:scale-110 transition-transform">
                <Flame className="text-secondary w-6 h-6" />
              </div>
              <div className="relative z-10">
                <p className="text-secondary text-xs font-bold tracking-widest uppercase mb-1">Current Streak</p>
                <div className="flex items-baseline gap-2">
                  <h2 className="text-5xl font-display font-bold text-white tracking-tighter">
                    {profile?.streak_days || 0}
                  </h2>
                  <span className="text-lg font-medium text-text-muted">Days</span>
                </div>
                <p className="text-text-muted text-sm mt-2 max-w-xs leading-relaxed">
                  You are in the top 5% of scholars this week. Keep the momentum going!
                </p>
              </div>
            </motion.div>

            {/* Quick Study Card */}
            <motion.div 
              variants={itemVariants} 
              onClick={() => navigate('/library')}
              className="glass-card p-6 flex flex-col justify-between min-h-[200px] cursor-pointer group hover:border-primary/50 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-50" />
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30 group-hover:scale-110 transition-transform">
                <Brain className="text-primary w-6 h-6" />
              </div>
              <div className="relative z-10 mt-8">
                <p className="text-primary text-xs font-bold tracking-widest uppercase mb-1">Focus Mode</p>
                <h3 className="text-2xl font-display font-bold text-white mb-1">Start Session</h3>
                <p className="text-sm text-text-muted group-hover:text-white transition-colors">Enter deep work →</p>
              </div>
            </motion.div>
          </section>

          {/* Quick Access Menu */}
          <motion.section variants={itemVariants}>
            <h3 className="text-xs font-bold tracking-widest uppercase text-text-muted mb-3 pl-1">Quick Navigation</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { title: 'Library', icon: BookOpen, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' },
                { title: 'Tasks', icon: CheckSquare, color: 'text-secondary', bg: 'bg-secondary/10', border: 'border-secondary/20' },
                { title: 'Notes', icon: FileText, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
                { title: 'Flashcards', icon: Layers, color: 'text-rose-400', bg: 'bg-rose-400/10', border: 'border-rose-400/20' }
              ].map(item => (
                <button 
                  key={item.title} 
                  onClick={() => navigate(`/${item.title.toLowerCase()}`)} 
                  className="flex flex-col items-center justify-center gap-3 p-5 rounded-2xl bg-surface border border-surface-border hover:bg-surface-hover hover:scale-[1.02] transition-all group"
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border ${item.bg} ${item.border} group-hover:scale-110 transition-transform`}>
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <span className="font-semibold text-sm text-text-muted group-hover:text-white transition-colors">{item.title}</span>
                </button>
              ))}
            </div>
          </motion.section>

          {/* Dynamic Content Grid */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Priority Tasks Bento */}
            <motion.div variants={itemVariants} className="glass-card p-6 flex flex-col">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-xs font-bold tracking-widest uppercase text-text-muted">Priority Tasks</h3>
                <button onClick={() => navigate('/tasks')} className="text-xs font-bold text-primary hover:text-white transition-colors bg-primary/10 px-3 py-1.5 rounded-full">View All</button>
              </div>
              
              <div className="flex flex-col gap-3 flex-1">
                {recentTasks.length > 0 ? recentTasks.map(task => (
                  <div key={task.id} className="flex items-center gap-4 p-4 rounded-xl bg-surface border border-surface-border hover:border-primary/30 transition-colors cursor-pointer group">
                    <div className={`w-2.5 h-2.5 rounded-full ${task.priority === 'high' ? 'bg-error shadow-[0_0_8px_rgba(255,75,75,0.6)]' : 'bg-secondary shadow-[0_0_8px_rgba(0,242,254,0.6)]'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-white truncate group-hover:text-primary transition-colors">{task.title}</p>
                      <p className="text-xs text-text-muted mt-0.5">{task.due_date || 'No due date'}</p>
                    </div>
                  </div>
                )) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-surface rounded-xl border border-surface-border border-dashed">
                    <CheckSquare className="w-8 h-8 text-text-muted mb-2 opacity-50" />
                    <p className="text-sm text-text-muted">No pending tasks!</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* AI Insights Bento */}
            <motion.div variants={itemVariants} className="glass-card p-6 flex flex-col relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
              <h3 className="text-xs font-bold tracking-widest uppercase text-text-muted mb-5">AI Insight</h3>
              
              <div className="flex-1 flex flex-col justify-center items-center text-center p-6 bg-surface border border-primary/20 rounded-xl relative">
                <div className="absolute top-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-30" />
                <Sparkles className="text-primary w-8 h-8 mb-4 animate-float" />
                <h4 className="font-display text-lg font-bold text-white mb-2">Optimal Review Time</h4>
                <p className="text-sm text-text-muted leading-relaxed">
                  Your retention for Biology peaks at <span className="text-primary font-semibold">4:00 PM</span>. Schedule your next flashcard session then for a 20% memory boost.
                </p>
              </div>
            </motion.div>
            
          </section>
        </motion.div>
      </main>

      <BottomNav />
    </div>
  )
}
