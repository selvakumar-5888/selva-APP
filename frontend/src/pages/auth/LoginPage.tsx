import { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { motion } from 'framer-motion'
import { Sparkles, ArrowRight, Mail, Lock, Eye, EyeOff, UserCheck, Shield, User } from 'lucide-react'

interface LoginFormData {
  email: string
  password: string
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { onboardingCompleted } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [activeRole, setActiveRole] = useState<'Farmer' | 'Officer' | 'Admin'>('Farmer')
  const inflight = useRef(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: {
      email: 'farmer@demo.com',
      password: 'password123',
    }
  })

  const handleRoleSelect = (role: 'Farmer' | 'Officer' | 'Admin') => {
    setActiveRole(role)
    if (role === 'Farmer') {
      setValue('email', 'farmer@demo.com')
      setValue('password', 'password123')
    } else if (role === 'Officer') {
      setValue('email', 'officer@demo.com')
      setValue('password', 'officer123')
    } else if (role === 'Admin') {
      setValue('email', 'admin@demo.com')
      setValue('password', 'admin123')
    }
  }

  const onSubmit = async (data: LoginFormData) => {
    if (inflight.current || isLoading) return
    inflight.current = true
    setIsLoading(true)

    try {
      const emailLower = data.email?.trim().toLowerCase() || ''

      // Role check or demo mode check
      const targetRole = activeRole === 'Admin' || emailLower.includes('admin') ? 'Admin' :
                         activeRole === 'Officer' || emailLower.includes('officer') ? 'Officer' : 'Farmer'

      toast.success(`Welcome back! 🎓 (Logged in as ${targetRole})`, {
        style: { background: '#09090b', color: '#00f2fe', border: '1px solid rgba(0,242,254,0.2)' },
      })

      if (targetRole === 'Admin') {
        navigate('/admin', { replace: true })
      } else if (targetRole === 'Officer') {
        navigate('/officer', { replace: true })
      } else {
        navigate('/farmer', { replace: true })
      }
      return
    } catch (err: unknown) {
      console.error('Unexpected login error:', err)
      toast.error('Something went wrong. Please try again.', {
        style: { background: '#09090b', color: '#ff4b4b', border: '1px solid rgba(255,75,75,0.2)' },
      })
    } finally {
      setIsLoading(false)
      inflight.current = false
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center font-sans text-text-main bg-background bg-luminous-glow relative overflow-hidden">
      
      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-primary/20 blur-[100px] pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-secondary/20 blur-[100px] pointer-events-none animate-pulse-glow" style={{ animationDelay: '2s' }} />

      {/* Header */}
      <header className="fixed top-0 left-0 w-full flex justify-between items-center px-8 py-6 z-50">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <Sparkles className="text-secondary w-6 h-6" />
          <h1 className="font-display text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            StudyMind
          </h1>
        </motion.div>
        <button className="font-display font-semibold text-text-muted hover:text-primary transition-colors tracking-wide text-sm">
          HELP
        </button>
      </header>

      {/* Login card */}
      <main className="relative z-10 w-full max-w-[420px] px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col gap-6 items-center glass-card p-8 relative overflow-hidden"
        >
          {/* Subtle inner highlight */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          {/* Brand */}
          <div className="flex flex-col items-center gap-2 mt-2 w-full">
            <h1 className="text-center font-display text-3xl font-bold text-white tracking-tight">
              Welcome Back
            </h1>
            <p className="text-center text-sm text-text-muted font-medium">
              Access your personalized learning lab.
            </p>
          </div>

          {/* Role Tabs */}
          <div className="w-full flex p-1 bg-white/5 border border-white/10 rounded-xl gap-1" role="tablist">
            {(['Farmer', 'Officer', 'Admin'] as const).map(role => (
              <button
                key={role}
                type="button"
                role="tab"
                aria-selected={activeRole === role}
                onClick={() => handleRoleSelect(role)}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeRole === role ? 'bg-gradient-to-r from-primary to-secondary text-background shadow-md' : 'text-text-muted hover:text-white'
                }`}
              >
                {role === 'Farmer' && <User className="w-3.5 h-3.5" />}
                {role === 'Officer' && <UserCheck className="w-3.5 h-3.5" />}
                {role === 'Admin' && <Shield className="w-3.5 h-3.5" />}
                {role}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-5 mt-1">
            
            {/* Email */}
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors" />
              <input
                type="email"
                placeholder="Academic Email"
                {...register('email', {
                  required: 'Email is required',
                })}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
              />
              {errors.email && (
                <span className="absolute -bottom-5 left-2 text-xs text-error">
                  {errors.email.message}
                </span>
              )}
            </div>

            {/* Password */}
            <div className="relative group mt-2">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Passphrase"
                {...register('password', { required: 'Password is required' })}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-12 text-white placeholder-white/30 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary transition-colors focus:outline-none"
                onClick={() => setShowPassword(v => !v)}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
              {errors.password && (
                <span className="absolute -bottom-5 left-2 text-xs text-error">
                  {errors.password.message}
                </span>
              )}
            </div>
            
            <div className="w-full flex justify-end mt-1">
              <button
                type="button"
                className="text-xs font-semibold text-text-muted hover:text-primary transition-colors"
              >
                Forgot Passphrase?
              </button>
            </div>

            {/* Login button */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 relative w-full group overflow-hidden rounded-xl font-display font-bold tracking-wide text-background py-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary transition-transform duration-300 group-hover:scale-105" />
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isLoading ? 'AUTHENTICATING...' : 'Sign In'}
                {!isLoading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
              </span>
            </button>

          </form>

          {/* Sign up link */}
          <div className="mt-4 w-full text-center">
            <p className="text-sm text-text-muted">
              New to the lab?{' '}
              <Link
                to="/signup"
                className="font-bold text-primary hover:text-secondary transition-colors ml-1"
              >
                Create account
              </Link>
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
