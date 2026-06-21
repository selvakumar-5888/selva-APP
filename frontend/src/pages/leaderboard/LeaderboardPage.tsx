import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, getUserId } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { BottomNav } from '@/components/layout/BottomNav'
import { motion } from 'framer-motion'
import { ArrowLeft, Trophy, Medal, Star, User as UserIcon } from 'lucide-react'

export default function LeaderboardPage() {
  const navigate = useNavigate()
  const [leaders, setLeaders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    try {
      if (import.meta.env.VITE_BYPASS_AUTH === 'true') {
        setLeaders([
          { id: '1', full_name: 'Alice Cooper', total_study_hours: 120, streak_days: 45, avatar_url: null },
          { id: '2', full_name: 'Bob Martin', total_study_hours: 95, streak_days: 30, avatar_url: null },
          { id: 'dev-user', full_name: 'Dev Scholar', total_study_hours: 42, streak_days: 7, avatar_url: null },
          { id: '4', full_name: 'Diana Prince', total_study_hours: 30, streak_days: 5, avatar_url: null },
          { id: '5', full_name: 'Evan Wright', total_study_hours: 15, streak_days: 2, avatar_url: null },
        ])
        setCurrentUserId('dev-user')
        setLoading(false)
        return
      }

      const userId = await getUserId()
      setCurrentUserId(userId)

      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, total_study_hours, streak_days, avatar_url')
        .order('total_study_hours', { ascending: false })
        .limit(20)

      if (error) throw error
      setLeaders(data || [])
    } catch (error) {
      console.error(error)
      toast.error('Failed to load leaderboard')
    } finally {
      setLoading(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 }
  }

  return (
    <div className="bg-background min-h-screen pb-24 text-text-main font-sans antialiased overflow-x-hidden relative">
      <div className="fixed inset-0 bg-luminous-glow pointer-events-none z-0" />

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md border-b border-surface-border bg-background/60">
        <div className="flex items-center justify-between px-6 py-4 max-w-2xl mx-auto">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-surface-hover transition-colors">
              <ArrowLeft className="w-5 h-5 text-text-muted hover:text-white transition-colors" />
            </button>
            <h1 className="font-display text-xl font-bold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" /> Global Leaderboard
            </h1>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-2xl mx-auto px-6 py-8">
        
        {/* Top 3 Podium (Optional extra polish) */}
        {leaders.length >= 3 && (
          <div className="flex items-end justify-center gap-4 mb-12 mt-8">
            {/* 2nd Place */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-col items-center">
              <div className="relative mb-2">
                <div className="w-16 h-16 rounded-full bg-surface border-4 border-surface-border overflow-hidden">
                  {leaders[1].avatar_url ? <img src={leaders[1].avatar_url} className="w-full h-full object-cover"/> : <UserIcon className="w-full h-full p-2 text-text-muted"/>}
                </div>
                <div className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-slate-300 flex items-center justify-center border-2 border-background text-[10px] font-bold text-black">2</div>
              </div>
              <div className="h-24 w-20 bg-gradient-to-t from-slate-500/20 to-transparent rounded-t-lg border-t border-slate-400/30 flex flex-col items-center justify-end pb-2">
                <span className="text-white font-bold text-sm truncate w-full text-center px-1">{leaders[1].full_name?.split(' ')[0]}</span>
                <span className="text-text-muted text-xs">{leaders[1].total_study_hours}h</span>
              </div>
            </motion.div>

            {/* 1st Place */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center z-10">
              <div className="relative mb-2">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                  <Trophy className="w-8 h-8 text-yellow-400" />
                </div>
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-600 p-1">
                  <div className="w-full h-full rounded-full bg-surface overflow-hidden">
                    {leaders[0].avatar_url ? <img src={leaders[0].avatar_url} className="w-full h-full object-cover"/> : <UserIcon className="w-full h-full p-3 text-yellow-500"/>}
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center border-2 border-background text-xs font-bold text-black">1</div>
              </div>
              <div className="h-32 w-24 bg-gradient-to-t from-yellow-500/20 to-transparent rounded-t-lg border-t border-yellow-400/50 flex flex-col items-center justify-end pb-2 shadow-[0_-10px_20px_rgba(250,204,21,0.1)]">
                <span className="text-white font-bold text-base truncate w-full text-center px-1">{leaders[0].full_name?.split(' ')[0]}</span>
                <span className="text-yellow-400 text-sm font-bold">{leaders[0].total_study_hours}h</span>
              </div>
            </motion.div>

            {/* 3rd Place */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex flex-col items-center">
              <div className="relative mb-2">
                <div className="w-16 h-16 rounded-full bg-surface border-4 border-surface-border overflow-hidden">
                  {leaders[2].avatar_url ? <img src={leaders[2].avatar_url} className="w-full h-full object-cover"/> : <UserIcon className="w-full h-full p-2 text-text-muted"/>}
                </div>
                <div className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-amber-600 flex items-center justify-center border-2 border-background text-[10px] font-bold text-white">3</div>
              </div>
              <div className="h-20 w-20 bg-gradient-to-t from-amber-600/20 to-transparent rounded-t-lg border-t border-amber-600/30 flex flex-col items-center justify-end pb-2">
                <span className="text-white font-bold text-sm truncate w-full text-center px-1">{leaders[2].full_name?.split(' ')[0]}</span>
                <span className="text-text-muted text-xs">{leaders[2].total_study_hours}h</span>
              </div>
            </motion.div>
          </div>
        )}

        {/* List */}
        {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="flex flex-col gap-3"
          >
            {leaders.map((leader, index) => {
              const isMe = leader.id === currentUserId
              
              return (
                <motion.div 
                  key={leader.id}
                  variants={itemVariants}
                  className={`flex items-center justify-between p-4 rounded-xl border ${isMe ? 'bg-primary/10 border-primary/30' : 'bg-surface border-surface-border'}`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-display font-bold w-6 text-center text-text-muted">
                      {index + 1}
                    </span>
                    <div className="w-10 h-10 rounded-full bg-surface-hover overflow-hidden flex items-center justify-center">
                      {leader.avatar_url ? (
                        <img src={leader.avatar_url} alt={leader.full_name} className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon className="w-5 h-5 text-text-muted" />
                      )}
                    </div>
                    <div>
                      <p className={`font-semibold text-sm ${isMe ? 'text-primary' : 'text-white'}`}>
                        {leader.full_name} {isMe && '(You)'}
                      </p>
                      <p className="text-xs text-text-muted flex items-center gap-1">
                        <Star className="w-3 h-3 text-secondary" /> {leader.streak_days} day streak
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <span className="text-lg font-display font-bold text-white">{leader.total_study_hours}</span>
                    <span className="text-xs text-text-muted ml-1">hrs</span>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
