import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, getUserId } from '@/lib/supabase'
import toast from 'react-hot-toast'

const SUBJECTS = [
  { name: 'Mathematics', icon: 'functions', color: '#c4c0ff' },
  { name: 'Physics', icon: 'rocket_launch', color: '#c4c0ff' },
  { name: 'Computer Science', icon: 'terminal', color: '#c4c0ff' },
  { name: 'History', icon: 'history_edu', color: '#c4c0ff' },
  { name: 'Biology', icon: 'biotech', color: '#c4c0ff' },
  { name: 'Literature', icon: 'menu_book', color: '#c4c0ff' },
  { name: 'Art', icon: 'palette', color: '#c4c0ff' },
  { name: 'Economics', icon: 'trending_up', color: '#c4c0ff' },
  { name: 'Chemistry', icon: 'science', color: '#ffb785' },
  { name: 'Law', icon: 'balance', color: '#ffb785' },
  { name: 'Philosophy', icon: 'psychology', color: '#eec13c' },
  { name: 'Engineering', icon: 'engineering', color: '#eec13c' },
]

const SUBJECT_COLORS = ['#c4c0ff', '#eec13c', '#ffb785', '#8781ff', '#ff7b7b', '#7bc67b']

export default function OnboardingPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1 = welcome, 2 = subjects
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [customSubject, setCustomSubject] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const filteredSubjects = SUBJECTS.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const toggleSubject = (name: string) => {
    const newSelected = new Set(selected)
    if (newSelected.has(name)) {
      newSelected.delete(name)
    } else {
      newSelected.add(name)
    }
    setSelected(newSelected)
  }

  const handleContinue = async () => {
    if (step === 1) {
      setStep(2)
      return
    }

    setIsLoading(true)
    try {
      // ── Dev bypass: skip all Supabase writes ──────────────────────
      if (import.meta.env.VITE_BYPASS_AUTH === 'true') {
        toast.success('Welcome to StudyMind AI! 🎓')
        navigate('/dashboard', { replace: true })
        return
      }
      // ─────────────────────────────────────────────────────────────

      const userId = await getUserId()

      // Create subjects in Supabase
      const subjectsToInsert = Array.from(selected).map((name, i) => ({
        user_id: userId,
        name,
        color: SUBJECT_COLORS[i % SUBJECT_COLORS.length],
        icon: SUBJECTS.find(s => s.name === name)?.icon || 'school',
        progress: 0,
      }))

      if (subjectsToInsert.length > 0) {
        const { error } = await supabase.from('subjects').insert(subjectsToInsert)
        if (error) throw error
      }

      // Mark onboarding complete
      await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', userId)

      toast.success('Welcome to StudyMind AI! 🎓')
      navigate('/dashboard', { replace: true })
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong')
      // Navigate anyway so they don't get stuck
      navigate('/dashboard', { replace: true })
    } finally {
      setIsLoading(false)
    }
  }


  const handleAddCustom = async () => {
    if (!customSubject.trim()) return
    const newSelected = new Set(selected)
    newSelected.add(customSubject.trim())
    setSelected(newSelected)
    setCustomSubject('')
  }

  if (step === 1) {
    return (
      <div
        className="bg-[#0A0E1A] text-[#e5e2db] min-h-screen overflow-x-hidden"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(108,99,255,0.08) 0%, transparent 70%), radial-gradient(circle at 10% 20%, rgba(238,193,60,0.03) 0%, transparent 40%), #0A0E1A',
        }}
      >
        {/* TopAppBar */}
        <header className="fixed top-0 w-full z-50 backdrop-blur-xl flex justify-between items-center px-5 py-3 h-16" style={{ background: 'rgba(10,14,26,0.8)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#c3c6d7]">school</span>
            <span className="text-xl font-bold text-[#eec13c]" style={{ fontFamily: 'Syne, sans-serif' }}>StudyMind AI</span>
          </div>
          <button onClick={() => navigate('/dashboard', { replace: true })} className="text-[#c7c6cc] hover:opacity-80 transition-opacity text-xs font-bold tracking-widest uppercase">Skip</button>
        </header>

        <main className="relative min-h-screen pt-16 flex flex-col md:flex-row">
          {/* Left: Illustration */}
          <section className="flex-1 flex flex-col items-center justify-center p-10 md:p-16">
            <div className="relative w-full max-w-[480px] aspect-square flex items-center justify-center">
              <div className="absolute inset-0 bg-[#c4c0ff]/5 rounded-full blur-[100px] animate-pulse"></div>
              <img
                alt="Student at glowing desk illustration"
                className="w-full h-full object-contain relative z-10"
                style={{ filter: 'drop-shadow(0 0 40px rgba(108,99,255,0.3))' }}
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD5-BTRfjnFfvYrE-5fH2cIClWOpruFmQlALEmoMALyascKAL9HWG03cndbLd5RmaLk8NsAlKwOzKliTmhOalv7TnRypSE5XRabfibRo2_CCjHHWm_ouKHCkEUQP4zhGZbUiiJiM6V2xwQVIvqbKxvFhvc66IaOGeHHZWPMV-Q3-dtHUQHJNH2S1YE8d6O3JvxBTfYvl0Jjrjlc069Q1RDbdJViDjYiHv0AlK_V_IjmIMJf_qBmlPAKSz0XsQkZqksKhzN-skFI7Co"
              />
            </div>
          </section>

          {/* Right: Content */}
          <section className="flex-1 flex items-center justify-center p-5 md:p-10 z-20">
            <div
              className="w-full max-w-lg p-8 md:p-12 rounded-[32px] flex flex-col gap-8"
              style={{ background: 'rgba(195,198,215,0.03)', backdropFilter: 'blur(16px)', border: '1px solid rgba(195,198,215,0.1)', boxShadow: '0 0 30px rgba(108,99,255,0.15)' }}
            >
              <div className="space-y-2">
                <h1 className="text-2xl md:text-5xl font-bold leading-tight text-[#e5e2db] tracking-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
                  Study Smarter.<br/>
                  <span className="text-[#c4c0ff]">Not Harder.</span>
                </h1>
                <div className="h-1 w-12 bg-[#eec13c] rounded-full"></div>
              </div>

              <ul className="flex flex-col gap-6">
                {[
                  { icon: 'psychology', title: 'AI Planning', desc: 'Personalized study schedules generated by our neural engine based on your goals.' },
                  { icon: 'query_stats', title: 'Progress Tracking', desc: 'Visual analytics of your knowledge growth and retention metrics.' },
                  { icon: 'notifications_active', title: 'Smart Reminders', desc: 'Optimized notification timing to hit your peak cognitive performance windows.' },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4" style={{ opacity: 0, animation: `slideUp 0.8s cubic-bezier(0.16,1,0.3,1) ${0.1 + i * 0.1}s forwards` }}>
                    <div className="w-10 h-10 rounded-xl bg-[#c4c0ff]/10 flex items-center justify-center shrink-0 border border-[#c4c0ff]/20">
                      <span className="material-symbols-outlined text-[#c4c0ff]" style={{ fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#e5e2db]" style={{ fontFamily: 'Syne, sans-serif' }}>{item.title}</h3>
                      <p className="text-[#c7c6cc] text-sm mt-1">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-4 pt-4 border-t border-white/10">
                <button
                  onClick={handleContinue}
                  className="w-full h-14 font-bold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 group"
                  style={{ background: '#F5C842', color: '#0A0E1A', boxShadow: '0 8px 20px rgba(245,200,66,0.2)' }}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 12px 30px rgba(245,200,66,0.4)')}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 8px 20px rgba(245,200,66,0.2)')}
                >
                  <span className="text-xl font-semibold" style={{ fontFamily: 'Syne, sans-serif' }}>Get Started</span>
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </button>
                <p className="text-center text-sm text-[#c7c6cc]/60 mt-4">Join 50k+ scholars worldwide.</p>
              </div>
            </div>
          </section>
        </main>

        {/* Decorative bg elements */}
        <div className="fixed top-[20%] right-[-10%] w-[40%] h-[40%] bg-[#c4c0ff]/5 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
        <div className="fixed bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-[#eec13c]/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

        <style>{`
          @keyframes slideUp {
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    )
  }

  // Step 2: Subject selection
  return (
    <div
      className="text-[#dfe2f3] min-h-screen flex flex-col items-center"
      style={{
        backgroundColor: '#0A0E1A',
        backgroundImage: 'radial-gradient(at 0% 0%, rgba(108,99,255,0.1) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(238,193,60,0.05) 0px, transparent 50%)',
      }}
    >
      {/* Top AppBar */}
      <header className="w-full top-0 px-4 flex justify-between items-center h-16 bg-transparent">
        <div className="flex items-center gap-2">
          <button onClick={() => setStep(1)} className="material-symbols-outlined text-[#c4c0ff] scale-95 active:opacity-80 transition-all">arrow_back</button>
          <span className="text-2xl font-bold text-[#eec13c]" style={{ fontFamily: 'Syne, sans-serif' }}>StudyMind AI</span>
        </div>
        <button onClick={() => navigate('/dashboard', { replace: true })} className="text-sm text-[#c7c4d8] hover:text-[#c4c0ff] transition-colors">Skip</button>
      </header>

      <main className="w-full max-w-7xl px-4 flex-1 flex flex-col">
        {/* Progress Indicator */}
        <div className="flex justify-center gap-1 mt-4 mb-6">
          <div className="w-8 h-1 rounded-full bg-[#c4c0ff] opacity-30"></div>
          <div className="w-12 h-1 rounded-full bg-[#c4c0ff]" style={{ boxShadow: '0 0 20px rgba(108,99,255,0.2)' }}></div>
          <div className="w-8 h-1 rounded-full bg-[#918fa1] opacity-20"></div>
          <div className="w-8 h-1 rounded-full bg-[#918fa1] opacity-20"></div>
        </div>

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-[#dfe2f3] text-center" style={{ fontFamily: 'Syne, sans-serif' }}>What are you studying?</h1>
          <p className="text-[#c7c4d8] text-center mt-1">Select your primary subjects to personalize your AI tutor.</p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full mb-6 group">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#918fa1] group-focus-within:text-[#c4c0ff] transition-colors">search</span>
          <input
            className="w-full border-b border-[#464555] focus:border-[#c4c0ff] focus:outline-none py-4 pl-12 pr-4 rounded-t-xl transition-all font-body-md"
            style={{ background: 'rgba(23,27,40,0.8)', color: '#dfe2f3', backdropFilter: 'blur(12px)' }}
            placeholder="Search subjects..."
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Subjects Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {filteredSubjects.map(subject => {
            const isSelected = selected.has(subject.name)
            return (
              <button
                key={subject.name}
                onClick={() => toggleSubject(subject.name)}
                className="p-6 rounded-xl flex flex-col items-center gap-2 transition-all hover:bg-white/5 active:scale-95"
                style={{
                  background: isSelected ? '#6C63FF' : 'rgba(255,255,255,0.03)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  boxShadow: isSelected ? '0 0 15px rgba(196,192,255,0.4)' : undefined,
                  color: isSelected ? 'white' : '#dfe2f3',
                }}
              >
                {isSelected ? (
                  <span className="material-symbols-outlined text-white text-4xl" style={{ fontVariationSettings: "'FILL' 1, 'wght' 700" }}>check_circle</span>
                ) : (
                  <span className="material-symbols-outlined text-[#eec13c] text-4xl">{subject.icon}</span>
                )}
                <span className="text-sm font-medium">{subject.name}</span>
              </button>
            )
          })}
        </div>

        <div className="flex flex-col items-center gap-6 mb-16">
          {/* Add custom subject */}
          <div className="flex gap-2 w-full max-w-sm">
            <input
              className="flex-1 bg-transparent border-b border-[#464555] focus:border-[#c4c0ff] focus:outline-none py-2 px-3 text-[#dfe2f3]"
              placeholder="Add custom subject..."
              value={customSubject}
              onChange={e => setCustomSubject(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddCustom()}
            />
            <button onClick={handleAddCustom} className="text-[#c4c0ff] hover:opacity-80">
              <span className="material-symbols-outlined">add</span>
            </button>
          </div>
          {/* Display custom subjects */}
          {Array.from(selected).filter(s => !SUBJECTS.find(sub => sub.name === s)).map(custom => (
            <div key={custom} className="flex items-center gap-2 text-[#c4c0ff]">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <span className="text-sm">{custom}</span>
              <button onClick={() => toggleSubject(custom)} className="text-[#c7c4d8] hover:text-red-400">
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
          ))}
        </div>
      </main>

      {/* Footer Action */}
      <footer className="w-full max-w-7xl px-4 pb-10">
        <button
          onClick={handleContinue}
          disabled={isLoading}
          className="w-full py-6 bg-[#eec13c] text-[#3d2e00] rounded-xl font-bold text-lg uppercase tracking-widest active:scale-[0.98] transition-all hover:shadow-[0_0_30px_rgba(238,193,60,0.3)] disabled:opacity-70"
          style={{ fontFamily: 'Syne, sans-serif' }}
        >
          {isLoading ? 'Saving...' : selected.size > 0 ? `Continue with ${selected.size} subject${selected.size > 1 ? 's' : ''}` : 'Continue'}
        </button>
      </footer>
    </div>
  )
}
