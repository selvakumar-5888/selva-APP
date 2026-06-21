import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { motion } from 'framer-motion'
import { Sparkles, ArrowRight, User, Mail, Lock, GraduationCap } from 'lucide-react'

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
  const [passwordStrength, setPasswordStrength] = useState({ strength: 0, color: '#ff4b4b' })

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

    let color = '#ff4b4b'
    if (strength > 25 && strength <= 50) color = '#f59e0b'
    else if (strength > 50 && strength <= 75) color = '#00f2fe'
    else if (strength > 75) color = '#10b981'

    setPasswordStrength({ strength, color })
  }, [passwordValue])

  const onSubmit = async (data: SignUpFormData) => {
    if (inflight.current) return
    if (isLoading) return

    if (cooldownSec > 0) {
      toast.error(`Please wait ${cooldownSec}s before trying again.`, {
        style: { background: '#09090b', color: '#ff4b4b', border: '1px solid rgba(255,75,75,0.2)' },
      })
      return
    }

    inflight.current = true
    setIsLoading(true)

    try {
      if (import.meta.env.VITE_BYPASS_AUTH === 'true') {
        const { setUser, setSession, setProfile, setOnboardingCompleted } = useAuthStore.getState()
        const dummyUser = { id: 'dev-user-new', email: data.email, user_metadata: {} } as any
        setUser(dummyUser)
        setSession({ user: dummyUser, expires_at: Date.now() + 3600 * 1000 } as any)
        setProfile({ id: dummyUser.id, full_name: data.fullName, onboarding_completed: false } as any)
        setOnboardingCompleted(false)
        toast.success('Dev mode – entering onboarding 🎓', {
          style: { background: '#09090b', color: '#00f2fe', border: '1px solid rgba(0,242,254,0.2)' },
        })
        navigate('/onboarding', { replace: true })
        return
      }

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
          localStorage.setItem(LS_KEY, Date.now().toString())
          setCooldownSec(Math.ceil(COOLDOWN_MS / 1000))
          toast.error('Too many requests – please wait 1 minute before trying again.', {
            style: { background: '#09090b', color: '#ff4b4b', border: '1px solid rgba(255,75,75,0.2)' },
          })
        } else {
          toast.error(error.message, {
            style: { background: '#09090b', color: '#ff4b4b', border: '1px solid rgba(255,75,75,0.2)' },
          })
        }
        return
      }

      if (authData?.user && !authData.user.confirmed_at) {
        toast.success('Almost there! Check your email to confirm your account 📧', {
          duration: 6000,
          style: { background: '#09090b', color: '#00f2fe', border: '1px solid rgba(0,242,254,0.2)' },
        })
        return
      }

      localStorage.setItem(LS_KEY, Date.now().toString())
      toast.success("Account created! Let's set up your subjects 🎓", {
        style: { background: '#09090b', color: '#00f2fe', border: '1px solid rgba(0,242,254,0.2)' },
      })
      navigate('/onboarding', { replace: true })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error creating account'
      toast.error(message, {
        style: { background: '#09090b', color: '#ff4b4b', border: '1px solid rgba(255,75,75,0.2)' },
      })
    } finally {
      setIsLoading(false)
      inflight.current = false
    }
  }

  const isDisabled = isLoading || cooldownSec > 0

  return (
    <div className="min-h-screen flex flex-col font-sans text-text-main bg-background bg-luminous-glow relative overflow-hidden">
      
      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-primary/20 blur-[100px] pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-secondary/20 blur-[100px] pointer-events-none animate-pulse-glow" style={{ animationDelay: '2s' }} />

      <header className="w-full top-0 sticky flex justify-between items-center px-8 py-6 bg-transparent z-50">
        <button onClick={() => navigate(-1)} className="text-text-muted hover:text-primary transition-colors">
          <ArrowRight className="rotate-180 w-6 h-6" />
        </button>
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2"
        >
          <Sparkles className="text-secondary w-6 h-6" />
          <h1 className="font-display text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            StudyMind
          </h1>
        </motion.div>
        <Link to="/login" className="font-display font-semibold text-primary hover:text-secondary transition-colors tracking-wide text-sm">
          LOGIN
        </Link>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center px-6 py-10 z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md p-8 glass-card flex flex-col gap-8 relative overflow-hidden"
        >
          {/* Subtle inner highlight */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          <div className="flex flex-col gap-2 text-center">
            <h2 className="font-display text-3xl font-bold text-white tracking-tight">
              Create Account
            </h2>
            <p className="text-text-muted text-sm font-medium">
              Join the next generation of learners.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            
            {/* Full Name */}
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Full Name"
                {...register('fullName', { required: 'Name is required' })}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
              />
              {errors.fullName && <span className="absolute -bottom-5 left-2 text-xs text-error">{errors.fullName.message}</span>}
            </div>

            {/* Email */}
            <div className="relative group mt-2">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors" />
              <input
                type="email"
                placeholder="Email Address"
                {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' } })}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
              />
              {errors.email && <span className="absolute -bottom-5 left-2 text-xs text-error">{errors.email.message}</span>}
            </div>

            {/* Password */}
            <div className="relative group mt-2">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors" />
              <input
                type="password"
                placeholder="Password"
                {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
              />
              {errors.password && <span className="absolute -bottom-5 left-2 text-xs text-error">{errors.password.message}</span>}
            </div>
            
            {/* Password Strength Indicator */}
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mt-1">
              <div
                className="h-full transition-all duration-500 ease-out"
                style={{ width: `${passwordStrength.strength}%`, backgroundColor: passwordStrength.color }}
              />
            </div>

            {/* University */}
            <div className="relative group mt-2">
              <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="University (Optional)"
                {...register('university')}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isDisabled}
              className="mt-6 relative w-full group overflow-hidden rounded-xl font-display font-bold tracking-wide text-background py-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary transition-transform duration-300 group-hover:scale-105" />
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isLoading ? 'INITIALIZING...' : cooldownSec > 0 ? `WAIT ${cooldownSec}s` : 'GET STARTED'}
                {!isLoading && cooldownSec === 0 && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
              </span>
            </button>
          </form>

          <div className="flex items-center gap-4 my-2">
            <div className="h-[1px] flex-grow bg-white/10" />
            <span className="text-xs font-semibold text-text-muted uppercase tracking-widest">Or continue with</span>
            <div className="h-[1px] flex-grow bg-white/10" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-3 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
              <img alt="Google" className="w-5 h-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuACayDuNgrs4T_hYqNCcNbeC9HQaRx8NvTftPkODg11KDukVyIyyhsmB1doHI7QRQXPTVCIJrzx5L2E1S3LeZURAHfD1AtlI-gfaIF6aK2T4kyx5y9OFh0ugM1RV9cBIgKVtEuEqWmP576_kP7d99SOv3bSR-3IVpAe45WmLmPA58KLc3bKeigGY188P3OicuJ6Pbj4QyIfX9pCEtyjI2pB5zI8HjbcnESKhTtEFSk4Bqkh8Ni-p9xH5hCWita49e-2_IxyWcrT_Ts" />
              <span className="font-medium text-sm">Google</span>
            </button>
            <button className="flex items-center justify-center gap-3 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
              <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>ios</span>
              <span className="font-medium text-sm">Apple</span>
            </button>
          </div>
        </motion.div>

        <p className="mt-8 text-xs text-text-muted text-center max-w-xs">
          By continuing, you agree to our <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
        </p>
      </main>
    </div>
  )
}
