import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Session } from '@supabase/supabase-js'
import type { Profile } from '@/types'

interface AuthState {
  user: User | null
  session: Session | null
  profile: Profile | null
  isLoading: boolean
  isAuthenticated: boolean
  onboardingCompleted: boolean
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  setProfile: (profile: Profile | null) => void
  setLoading: (loading: boolean) => void
  setOnboardingCompleted: (completed: boolean) => void
  signOut: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      profile: null,
      isLoading: true,
      isAuthenticated: false,
      onboardingCompleted: false,

      setUser: (user) =>
        set({ user, isAuthenticated: !!user }),

      setSession: (session) =>
        set({ session, user: session?.user ?? null, isAuthenticated: !!session }),

      setProfile: (profile) =>
        set({ profile, onboardingCompleted: profile?.onboarding_completed ?? false }),

      setLoading: (isLoading) => set({ isLoading }),

      setOnboardingCompleted: (completed) =>
        set({ onboardingCompleted: completed }),

      signOut: () =>
        set({
          user: null,
          session: null,
          profile: null,
          isAuthenticated: false,
          onboardingCompleted: false,
        }),
    }),
    {
      name: 'studymind-auth',
      partialize: (state) => ({
        onboardingCompleted: state.onboardingCompleted,
      }),
    }
  )
)
