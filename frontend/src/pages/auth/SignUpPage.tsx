import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'

interface SignUpFormData {
  fullName: string
  email: string
  password: string
  university?: string
}

// Rate-limit: minimum ms between actual Supabase signup calls
const COOLDOWN_MS = 60_000 // 1 minute
const LS_KEY = 'signup_last_attempt_ts'

export default function SignUpPage() {
  const navigate = useNavigate()
  const inflight = useRef(false)          // prevents double-submit
  const [isLoading, setIsLoading] = useState(false)
  const [cooldownSec, setCooldownSec] = useState(0)
  const [passwordStrength, setPasswordStrength] = useState({ strength: 0, color: '#ffb4ab' })

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignUpFormData>()

  const passwordValue = watch('password', '')

  // Restore remaining cooldown on mount
  useEffect(() => {
    const stored = Number(localStorage.getItem(LS_KEY) ?? '0')
    const remaining = Math.max(0, stored + COOLDOWN_MS - Date.now())
    if (remaining > 0) setCooldownSec(Math.ceil(remaining / 1000))
  }, [])

  // Countdown ticker
  useEffect(() => {
    if (cooldownSec <= 0) return
    const id = setInterval(() => {
      setCooldownSec(s => {
        if (s <= 1) { clearInterval(id); return 0 }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [cooldownSec])

  // Password strength meter
  useEffect(() => {
    let strength = 0
    if (passwordValue.length > 5) strength += 25
    if (passwordValue.match(/[A-Z]/)) strength += 25
    if (passwordValue.match(/[0-9]/)) strength += 25
    if (passwordValue.match(/[^A-Za-z0-9]/)) strength += 25

    let color = '#ffb4ab'
    if (strength > 25 && strength <= 50) color = '#ffb785'
    else if (strength > 50 && strength <= 75) color = '#eec13c'
    else if (strength > 75) color = '#c4c0ff'

    setPasswordStrength({ strength, color })
  }, [passwordValue])

  const onSubmit = async (data: SignUpFormData) => {
    // Prevent concurrent requests
    if (inflight.current) return
    if (isLoading) return

    // Client-side cooldown check
    if (cooldownSec > 0) {
      toast.error(`Please wait ${cooldownSec}s before trying again.`, {
        style: { background: '#1b1f2c', color: '#ffb4ab', border: '1px solid rgba(255,180,171,0.2)' },
      })
      return
    }

    inflight.current = true
    setIsLoading(true)

    try {
      // ── Dev bypass (VITE_BYPASS_AUTH=true) ──────────────────────────
      if (import.meta.env.VITE_BYPASS_AUTH === 'true') {
        const { setUser, setSession, setProfile, setOnboardingCompleted } = useAuthStore.getState()
        const dummyUser = { id: 'dev-user-new', email: data.email, user_metadata: {} } as any
        setUser(dummyUser)
        setSession({ user: dummyUser, expires_at: Date.now() + 3600 * 1000 } as any)
        setProfile({ id: dummyUser.id, full_name: data.fullName, onboarding_completed: false } as any)
        setOnboardingCompleted(false)
        toast.success('Dev mode – entering onboarding 🎓', {
          style: { background: '#1b1f2c', color: '#dfe2f3', border: '1px solid rgba(196,192,255,0.2)' },
        })
        navigate('/onboarding', { replace: true })
        return
      }
      // ───────────────────────────────────────────────────────────────
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email.trim(),
        password: data.password,
        options: {
          data: {
            full_name: data.fullName.trim(),
            university: data.university?.trim() ?? '',
          },
        },
      })

      if (error) {
        if (error.status === 429) {
          // Server-side rate limit – start cooldown
          localStorage.setItem(LS_KEY, Date.now().toString())
          setCooldownSec(Math.ceil(COOLDOWN_MS / 1000))
          toast.error('Too many requests – please wait 1 minute before trying again.', {
            style: { background: '#1b1f2c', color: '#ffb4ab', border: '1px solid rgba(255,180,171,0.2)' },
          })
        } else {
          toast.error(error.message, {
            style: { background: '#1b1f2c', color: '#ffb4ab', border: '1px solid rgba(255,180,171,0.2)' },
          })
        }
        return
      }

      // Supabase may return a user without error but with email-confirmation pending
      if (authData?.user && !authData.user.confirmed_at) {
        toast.success('Almost there! Check your email to confirm your account 📧', {
          duration: 6000,
          style: { background: '#1b1f2c', color: '#dfe2f3', border: '1px solid rgba(196,192,255,0.2)' },
        })
        return
      }

      // Mark attempt time (success)
      localStorage.setItem(LS_KEY, Date.now().toString())
      toast.success("Account created! Let's set up your subjects 🎓", {
        style: { background: '#1b1f2c', color: '#dfe2f3', border: '1px solid rgba(196,192,255,0.2)' },
      })
      navigate('/onboarding', { replace: true })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error creating account'
      toast.error(message, {
        style: { background: '#1b1f2c', color: '#ffb4ab', border: '1px solid rgba(255,180,171,0.2)' },
      })
    } finally {
      setIsLoading(false)
      inflight.current = false
    }
  }

  const isDisabled = isLoading || cooldownSec > 0

  return (
    <div
      className="min-h-screen flex flex-col font-body-md text-on-surface overflow-hidden"
      style={{
        backgroundColor: '#0a0e1a',
        backgroundImage: `
          radial-gradient(circle at 20% 30%, rgba(108, 99, 255, 0.15) 0%, transparent 50%),
          radial-gradient(circle at 80% 70%, rgba(238, 193, 60, 0.05) 0%, transparent 50%)
        `,
      }}
    >
      <header className="w-full top-0 sticky flex justify-between items-center px-6 py-4 bg-transparent z-50">
        <button onClick={() => navigate(-1)} className="text-[#c4c0ff] hover:opacity-80 transition-opacity active:scale-95 duration-200">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>arrow_back</span>
        </button>
        <h1 className="text-center" style={{ fontFamily: 'Syne, sans-serif', fontSize: 36, fontWeight: 800, color: '#eec13c', letterSpacing: '-0.02em' }}>
          StudyMind AI
        </h1>
        <button onClick={() => navigate('/login')} className="text-[#c4c0ff] hover:opacity-80 transition-opacity active:scale-95 duration-200" style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: 20 }}>
          SKIP
        </button>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center px-6 py-10">
        <div
          className="w-full max-w-md p-6 rounded-xl flex flex-col gap-6"
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div className="flex flex-col gap-1">
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 32, fontWeight: 700, color: '#dfe2f3', lineHeight: 1.3 }}>
              Begin Your Journey
            </h2>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 16, color: '#c7c4d8' }}>
              Forge your academic legacy with AI-driven rigor.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 500, color: '#eec13c', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Full Name
              </label>
              <input
                type="text"
                placeholder="ISAAC NEWTON"
                {...register('fullName', { required: 'Name is required' })}
                className="bg-transparent border-b py-2 transition-colors focus:outline-none"
                style={{
                  borderBottomColor: errors.fullName ? '#ffb4ab' : '#464555',
                  color: '#dfe2f3',
                  fontFamily: 'DM Sans, sans-serif',
                }}
                onFocus={(e) => (e.target.style.borderBottomColor = '#c4c0ff')}
                onBlur={(e) => (e.target.style.borderBottomColor = errors.fullName ? '#ffb4ab' : '#464555')}
              />
              {errors.fullName && <span className="text-xs" style={{ color: '#ffb4ab' }}>{errors.fullName.message}</span>}
            </div>

            <div className="flex flex-col gap-1">
              <label style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 500, color: '#eec13c', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Email Address
              </label>
              <input
                type="email"
                placeholder="scholar@oxford.edu"
                {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' } })}
                className="bg-transparent border-b py-2 transition-colors focus:outline-none"
                style={{
                  borderBottomColor: errors.email ? '#ffb4ab' : '#464555',
                  color: '#dfe2f3',
                  fontFamily: 'DM Sans, sans-serif',
                }}
                onFocus={(e) => (e.target.style.borderBottomColor = '#c4c0ff')}
                onBlur={(e) => (e.target.style.borderBottomColor = errors.email ? '#ffb4ab' : '#464555')}
              />
              {errors.email && <span className="text-xs" style={{ color: '#ffb4ab' }}>{errors.email.message}</span>}
            </div>

            <div className="flex flex-col gap-1">
              <label style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 500, color: '#eec13c', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
                className="bg-transparent border-b py-2 transition-colors focus:outline-none"
                style={{
                  borderBottomColor: errors.password ? '#ffb4ab' : '#464555',
                  color: '#dfe2f3',
                  fontFamily: 'DM Sans, sans-serif',
                }}
                onFocus={(e) => (e.target.style.borderBottomColor = '#c4c0ff')}
                onBlur={(e) => (e.target.style.borderBottomColor = errors.password ? '#ffb4ab' : '#464555')}
              />
              <div className="h-1 w-full rounded-full mt-1 overflow-hidden" style={{ background: '#313442' }}>
                <div
                  className="h-full transition-all duration-300 ease-in-out"
                  style={{ width: `${passwordStrength.strength}%`, backgroundColor: passwordStrength.color }}
                />
              </div>
              {errors.password && <span className="text-xs" style={{ color: '#ffb4ab' }}>{errors.password.message}</span>}
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <label style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 500, color: '#eec13c', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  University
                </label>
                <span style={{ fontSize: 10, color: '#464555', fontStyle: 'italic' }}>OPTIONAL</span>
              </div>
              <input
                type="text"
                placeholder="CAMBRIDGE UNIVERSITY"
                {...register('university')}
                className="bg-transparent border-b py-2 transition-colors focus:outline-none"
                style={{
                  borderBottomColor: '#464555',
                  color: '#dfe2f3',
                  fontFamily: 'DM Sans, sans-serif',
                }}
                onFocus={(e) => (e.target.style.borderBottomColor = '#c4c0ff')}
                onBlur={(e) => (e.target.style.borderBottomColor = '#464555')}
              />
            </div>

            <button
              type="submit"
              disabled={isDisabled}
              className="mt-4 rounded-lg uppercase font-bold active:scale-[0.98] transition-all hover:shadow-[0_0_20px_rgba(108,99,255,0.2)] disabled:opacity-70 disabled:cursor-not-allowed"
              style={{
                background: '#c4c0ff',
                color: '#2000a4',
                fontFamily: 'DM Sans, sans-serif',
                fontSize: 14,
                letterSpacing: '0.05em',
                padding: '16px',
              }}
            >
              {isLoading
                ? 'Initializing...'
                : cooldownSec > 0
                ? `Wait ${cooldownSec}s…`
                : 'Initialize Account'}
            </button>
          </form>

          <div className="flex items-center gap-4">
            <div className="h-[1px] flex-grow" style={{ background: '#464555' }} />
            <span style={{ color: '#918fa1', fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 500 }}>OR CONNECT VIA</span>
            <div className="h-[1px] flex-grow" style={{ background: '#464555' }} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 py-2 rounded-lg transition-colors hover:bg-white/10" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <img alt="Google" className="w-5 h-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuACayDuNgrs4T_hYqNCcNbeC9HQaRx8NvTftPkODg11KDukVyIyyhsmB1doHI7QRQXPTVCIJrzx5L2E1S3LeZURAHfD1AtlI-gfaIF6aK2T4kyx5y9OFh0ugM1RV9cBIgKVtEuEqWmP576_kP7d99SOv3bSR-3IVpAe45WmLmPA58KLc3bKeigGY188P3OicuJ6Pbj4QyIfX9pCEtyjI2pB5zI8HjbcnESKhTtEFSk4Bqkh8Ni-p9xH5hCWita49e-2_IxyWcrT_Ts" />
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 500, color: '#dfe2f3' }}>GOOGLE</span>
            </button>
            <button className="flex items-center justify-center gap-2 py-2 rounded-lg transition-colors hover:bg-white/10" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1", color: '#dfe2f3' }}>ios</span>
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 500, color: '#dfe2f3' }}>APPLE</span>
            </button>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-4 text-center">
          <Link to="/login" className="hover:text-[#eec13c] transition-colors" style={{ color: '#c7c4d8', fontFamily: 'DM Sans, sans-serif', fontSize: 16 }}>
            Already have an account? <span style={{ color: '#eec13c', fontWeight: 700 }}>Log in</span>
          </Link>
          <p className="max-w-xs leading-relaxed" style={{ fontSize: 12, color: '#464555', fontFamily: 'DM Sans, sans-serif' }}>
            By creating an account, you adhere to our <a href="#" className="underline">Scholarly Conduct</a> and <a href="#" className="underline">Privacy Doctrine</a>. Data is encrypted via neuro-links.
          </p>
        </div>
      </main>

      {/* Abstract Background Image */}
      <div className="fixed inset-0 -z-10 opacity-30 pointer-events-none">
        <img alt="background" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCm5lth5BmMRTowZQg8dL3thOYg_sE4HUNgqCcOjxrRdngm3NKGnJ17t5tCKaLgcoEZxcf8pP6pXIFunzKoh_I6WxPJ-NR9skfSyZ54c1F--au8ESJ75HsIPmzg9a0tzoEFshin3yqKBnNBBdtOAY5iy7sh5oIOW8tRL6LRCRy8tS3bjren3PeYQ2VxXpaThcHY7jr5d-ATi58VQ9gB_Yizu_zB1HOUqxJMBUTks4BExwNqTGp-wupMJ59UGSAOhqykr43SyHPgfY4" />
      </div>
    </div>
  )
}
