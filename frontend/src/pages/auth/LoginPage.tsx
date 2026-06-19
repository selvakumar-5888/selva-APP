import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'

interface LoginFormData {
  email: string
  password: string
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { onboardingCompleted } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const inflight = useRef(false) // prevents double-submit

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>()

  // Mouse parallax on card
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const card = cardRef.current
      if (!card) return
      const x = e.clientX / window.innerWidth
      const y = e.clientY / window.innerHeight
      const moveX = (x - 0.5) * 12
      const moveY = (y - 0.5) * 12
      card.style.transform = `translate(${moveX}px, ${moveY}px)`
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const onSubmit = async (data: LoginFormData) => {
    // Prevent concurrent requests
    if (inflight.current || isLoading) return
    inflight.current = true
    setIsLoading(true)

    try {
      // ── Dev bypass: skip Supabase entirely ────────────────────────
      if (import.meta.env.VITE_BYPASS_AUTH === 'true') {
        toast.success('Welcome back, Scholar! 🎓 (dev mode)', {
          style: { background: '#1b1f2c', color: '#dfe2f3', border: '1px solid rgba(196,192,255,0.2)' },
        })
        navigate('/dashboard', { replace: true })
        return
      }
      // ─────────────────────────────────────────────────────────────

      // Validate inputs first (no network call)
      if (!data.email?.trim() || !data.password) {
        toast.error('Please provide both email and password.', {
          style: { background: '#1b1f2c', color: '#ffb4ab', border: '1px solid rgba(255,180,171,0.2)' },
        })
        return
      }

      // Single Supabase auth call
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email.trim(),
        password: data.password,
      })

      if (error) {
        console.error('Supabase login error:', error)
        const userMessage =
          error.status === 400
            ? 'Invalid email or password. Please check your credentials.'
            : error.message
        toast.error(userMessage, {
          style: { background: '#1b1f2c', color: '#ffb4ab', border: '1px solid rgba(255,180,171,0.2)' },
        })
        return
      }

      if (authData?.user) {
        toast.success('Welcome back, Scholar! 🎓', {
          style: { background: '#1b1f2c', color: '#dfe2f3', border: '1px solid rgba(196,192,255,0.2)' },
        })
        navigate('/dashboard', { replace: true })
      }
    } catch (err: unknown) {
      console.error('Unexpected login error:', err)
      toast.error('Something went wrong. Please try again.', {
        style: { background: '#1b1f2c', color: '#ffb4ab', border: '1px solid rgba(255,180,171,0.2)' },
      })
    } finally {
      setIsLoading(false)
      inflight.current = false
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 font-body-md text-on-surface overflow-hidden"
      style={{
        backgroundColor: '#0a0e1a',
        backgroundImage: `
          radial-gradient(at 0% 0%, rgba(108, 99, 255, 0.15) 0px, transparent 50%),
          radial-gradient(at 100% 100%, rgba(108, 99, 255, 0.1) 0px, transparent 50%)
        `,
      }}
    >
      {/* Spinning ring background decorations */}
      <div className="fixed inset-0 pointer-events-none opacity-20 overflow-hidden">
        <div
          className="absolute top-[10%] left-[5%] w-[80%] h-[80%] rounded-full border border-[rgba(196,192,255,0.2)]"
          style={{ animation: 'spin 60s linear infinite' }}
        />
        <div
          className="absolute top-[15%] left-[10%] w-[70%] h-[70%] rounded-full border border-[rgba(238,193,60,0.1)]"
          style={{ animation: 'spin 45s linear infinite reverse' }}
        />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 w-full flex justify-between items-center px-6 py-4 z-50">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#c4c0ff]">school</span>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: 20, color: '#dfe2f3' }}>
            StudyMind AI
          </span>
        </div>
        <button className="font-label-md text-label-md text-[#eec13c] hover:opacity-80 transition-opacity uppercase tracking-widest text-sm">
          Help
        </button>
      </header>

      {/* Login card */}
      <main className="relative z-10 w-full max-w-[400px]">
        {/* Glow behind card */}
        <div className="absolute -top-12 -left-12 w-32 h-32 rounded-full pointer-events-none" style={{ background: 'rgba(196,192,255,0.2)', filter: 'blur(60px)' }} />
        <div className="absolute -bottom-12 -right-12 w-32 h-32 rounded-full pointer-events-none" style={{ background: 'rgba(238,193,60,0.1)', filter: 'blur(60px)' }} />

        <div
          ref={cardRef}
          className="flex flex-col gap-6 items-center rounded-xl p-6 shadow-2xl"
          style={{
            backdropFilter: 'blur(12px)',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 0 20px rgba(108, 99, 255, 0.2)',
            transition: 'transform 0.1s ease-out',
          }}
        >
          {/* Brand */}
          <div className="flex flex-col items-center gap-2 mt-2">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-2"
              style={{
                background: 'rgba(49,52,66,0.8)',
                border: '1px solid rgba(196,192,255,0.3)',
              }}
            >
              <span
                className="material-symbols-outlined text-[#c4c0ff]"
                style={{ fontSize: 32, fontVariationSettings: "'FILL' 1" }}
              >
                auto_awesome
              </span>
            </div>
            <h1
              className="text-center"
              style={{ fontFamily: 'Syne, sans-serif', fontSize: 36, fontWeight: 800, color: '#eec13c', letterSpacing: '-0.02em' }}
            >
              Login
            </h1>
            <p className="text-center text-sm px-4" style={{ color: '#c7c4d8', fontFamily: 'DM Sans, sans-serif' }}>
              Welcome back, Scholar. Access your research lab.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-4">
            {/* Email */}
            <div className="flex flex-col gap-1">
              <label
                className="uppercase tracking-widest px-1"
                style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 500, color: '#eec13c', letterSpacing: '0.05em' }}
              >
                Academic Email
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#918fa1] group-focus-within:text-[#c4c0ff] transition-colors" style={{ fontSize: 20 }}>
                  mail
                </span>
                <input
                  type="email"
                  placeholder="scholar@university.edu"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' },
                  })}
                  className="w-full pl-10 pr-4 py-4 rounded-t-lg transition-all"
                  style={{
                    background: '#0a0e1a',
                    border: 'none',
                    borderBottom: errors.email ? '1px solid #ffb4ab' : '1px solid #464555',
                    color: '#dfe2f3',
                    fontFamily: 'DM Sans, sans-serif',
                    outline: 'none',
                  }}
                  onFocus={e => (e.target.style.borderBottomColor = '#c4c0ff')}
                  onBlur={e => (e.target.style.borderBottomColor = errors.email ? '#ffb4ab' : '#464555')}
                />
              </div>
              {errors.email && (
                <span className="text-xs px-1" style={{ color: '#ffb4ab', fontFamily: 'DM Sans, sans-serif' }}>
                  {errors.email.message}
                </span>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center px-1">
                <label
                  className="uppercase tracking-widest"
                  style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 500, color: '#eec13c', letterSpacing: '0.05em' }}
                >
                  Passphrase
                </label>
                <button
                  type="button"
                  className="text-sm hover:text-[#eec13c] transition-colors"
                  style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#918fa1' }}
                >
                  Forgot?
                </button>
              </div>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#918fa1] group-focus-within:text-[#c4c0ff] transition-colors" style={{ fontSize: 20 }}>
                  lock
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
                  className="w-full pl-10 pr-12 py-4 rounded-t-lg transition-all"
                  style={{
                    background: '#0a0e1a',
                    border: 'none',
                    borderBottom: errors.password ? '1px solid #ffb4ab' : '1px solid #464555',
                    color: '#dfe2f3',
                    fontFamily: 'DM Sans, sans-serif',
                    outline: 'none',
                  }}
                  onFocus={e => (e.target.style.borderBottomColor = '#c4c0ff')}
                  onBlur={e => (e.target.style.borderBottomColor = errors.password ? '#ffb4ab' : '#464555')}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#918fa1] hover:text-[#c4c0ff] transition-colors"
                  onClick={() => setShowPassword(v => !v)}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              {errors.password && (
                <span className="text-xs px-1" style={{ color: '#ffb4ab', fontFamily: 'DM Sans, sans-serif' }}>
                  {errors.password.message}
                </span>
              )}
            </div>

            {/* Login button */}
            <button
              type="submit"
              disabled={isLoading}
              className="relative overflow-hidden w-full rounded-lg mt-4 active:scale-[0.98] transition-all disabled:opacity-70"
              style={{
                background: '#c4c0ff',
                padding: '16px',
                fontFamily: 'DM Sans, sans-serif',
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: '#2000a4',
                boxShadow: '0 4px 20px rgba(196,192,255,0.2)',
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 30px rgba(196,192,255,0.4)')}
              onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 20px rgba(196,192,255,0.2)')}
            >
              <span className="relative z-10">{isLoading ? 'Authenticating...' : 'Login'}</span>
              {/* Shimmer */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'linear-gradient(to bottom right, transparent 0%, transparent 40%, rgba(255,255,255,0.2) 50%, transparent 60%, transparent 100%)',
                  animation: 'shimmer 3s infinite',
                }}
              />
            </button>

          </form>

          {/* Sign up link */}
          <div className="mt-2">
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 16, color: '#c7c4d8' }}>
              New to the lab?{' '}
              <Link
                to="/signup"
                className="font-bold hover:underline transition-all ml-1"
                style={{ color: '#eec13c', textDecorationColor: 'rgba(238,193,60,0.3)', textUnderlineOffset: 4 }}
              >
                Create account
              </Link>
            </p>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%) rotate(0deg); }
          100% { transform: translateX(100%) rotate(0deg); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
