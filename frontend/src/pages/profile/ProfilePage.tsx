import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, getUserId } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { BottomNav } from '@/components/layout/BottomNav'
import { motion } from 'framer-motion'
import { ArrowLeft, Upload, User, Camera, LogOut } from 'lucide-react'

export default function ProfilePage() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      if (import.meta.env.VITE_BYPASS_AUTH === 'true') {
        setProfile({ full_name: 'Dev Scholar', avatar_url: null, streak_days: 7, total_study_hours: 42, university: 'Cambridge University' })
        setLoading(false)
        return
      }

      const userId = await getUserId()
      if (!userId) { navigate('/login', { replace: true }); return }

      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()
      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error(error)
      toast.error('Error fetching profile')
    } finally {
      setLoading(false)
    }
  }

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.')
      }

      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      const userId = await getUserId()
      if (!userId) throw new Error('Not logged in')

      // Upload image to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // Update profile
      const { error: updateError } = await supabase.from('profiles').update({
        avatar_url: publicUrl,
        updated_at: new Date()
      }).eq('id', userId)

      if (updateError) throw updateError

      setProfile({ ...profile, avatar_url: publicUrl })
      toast.success('Avatar updated successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Error uploading avatar')
      console.error(error)
    } finally {
      setUploading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login', { replace: true })
  }

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  }

  return (
    <div className="bg-background min-h-screen pb-24 text-text-main font-sans antialiased overflow-x-hidden relative">
      <div className="fixed inset-0 bg-luminous-glow pointer-events-none z-0" />

      <header className="sticky top-0 z-40 backdrop-blur-md border-b border-surface-border bg-background/60">
        <div className="flex items-center gap-4 px-6 py-5 max-w-2xl mx-auto">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-surface-hover transition-colors">
            <ArrowLeft className="w-5 h-5 text-text-muted hover:text-white transition-colors" />
          </button>
          <h1 className="font-display text-xl font-bold text-white tracking-tight">Your Profile</h1>
        </div>
      </header>

      <main className="relative z-10 max-w-2xl mx-auto px-6 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 flex flex-col items-center gap-6 text-center relative overflow-hidden"
        >
          {/* Avatar Upload Section */}
          <div className="relative group">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-secondary p-[2px]">
              <div className="w-full h-full rounded-full bg-surface border-4 border-background flex items-center justify-center overflow-hidden relative">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-primary" />
                )}
                
                {/* Upload Overlay */}
                <div 
                  className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="w-8 h-8 text-white mb-1" />
                  <span className="text-[10px] font-bold tracking-widest uppercase text-white">Change</span>
                </div>
              </div>
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={uploadAvatar}
              disabled={uploading}
            />

            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <h2 className="font-display text-3xl font-bold text-white tracking-tight">{profile?.full_name || 'Scholar'}</h2>
            <p className="text-sm font-medium text-text-muted uppercase tracking-widest">{profile?.university || 'Independent Scholar'}</p>
          </div>

          <div className="w-full h-[1px] bg-surface-border my-2" />

          {/* Stats */}
          <div className="w-full grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center justify-center p-4 bg-surface rounded-2xl border border-surface-border">
              <span className="text-3xl font-display font-bold text-primary">{profile?.streak_days || 0}</span>
              <span className="text-xs font-medium text-text-muted uppercase tracking-widest mt-1">Day Streak</span>
            </div>
            <div className="flex flex-col items-center justify-center p-4 bg-surface rounded-2xl border border-surface-border">
              <span className="text-3xl font-display font-bold text-secondary">{profile?.total_study_hours || 0}</span>
              <span className="text-xs font-medium text-text-muted uppercase tracking-widest mt-1">Hours Studied</span>
            </div>
          </div>

          <button 
            onClick={handleLogout}
            className="mt-6 w-full flex items-center justify-center gap-2 py-4 rounded-xl border border-error/30 text-error hover:bg-error/10 hover:border-error transition-all font-semibold tracking-wide"
          >
            <LogOut className="w-5 h-5" />
            SIGN OUT
          </button>
        </motion.div>
      </main>

      <BottomNav />
    </div>
  )
}
