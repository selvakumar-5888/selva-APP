import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { Profile, OnboardingData } from '@/types'

export function useUser() {
  const { user, setProfile } = useAuthStore()
  const queryClient = useQueryClient()

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      if (error) throw error
      return data as Profile
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  })

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Partial<Profile>) => {
      if (!user?.id) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()
      if (error) throw error
      return data as Profile
    },
    onSuccess: (data) => {
      setProfile(data)
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] })
    },
  })

  const completeOnboardingMutation = useMutation({
    mutationFn: async (data: OnboardingData) => {
      if (!user?.id) throw new Error('Not authenticated')
      const { data: updated, error } = await supabase
        .from('profiles')
        .update({
          role: data.role,
          study_style: data.study_style,
          daily_goal_hours: data.daily_goal_hours,
          onboarding_completed: true,
        })
        .eq('id', user.id)
        .select()
        .single()
      if (error) throw error
      return updated as Profile
    },
    onSuccess: (data) => {
      setProfile(data)
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] })
    },
  })

  return {
    profile,
    isLoading,
    updateProfile: updateProfileMutation.mutate,
    completeOnboarding: completeOnboardingMutation.mutateAsync,
    isUpdating: updateProfileMutation.isPending,
  }
}
