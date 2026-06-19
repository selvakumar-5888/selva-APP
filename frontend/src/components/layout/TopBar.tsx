import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

interface TopBarProps {
  title?: string
  showBack?: boolean
  rightElement?: React.ReactNode
}

export function TopBar({ title = 'StudyMind AI', showBack = false, rightElement }: TopBarProps) {
  const navigate = useNavigate()
  const { profile } = useAuthStore()

  return (
    <header className="bg-surface/30 backdrop-blur-xl border-b border-white/10 shadow-[0_0_20px_rgba(108,99,255,0.1)] sticky top-0 z-40">
      <div className="flex justify-between items-center w-full px-lg py-md max-w-[1280px] mx-auto">
        <div className="flex items-center gap-md">
          {showBack ? (
            <button
              onClick={() => navigate(-1)}
              className="text-on-surface-variant hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
          ) : (
            <button
              onClick={() => navigate('/dashboard')}
              className="w-10 h-10 rounded-full bg-surface-container overflow-hidden border border-primary/20 flex items-center justify-center"
            >
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="material-symbols-outlined text-primary text-sm">person</span>
              )}
            </button>
          )}
          <span className="font-headline-md text-headline-md text-secondary tracking-tight">
            {title}
          </span>
        </div>

        <div className="flex items-center gap-md">
          {rightElement ?? (
            <>
              <button
                onClick={() => navigate('/analytics')}
                className="text-on-surface-variant hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined">monitoring</span>
              </button>
              <button
                onClick={() => navigate('/settings/reminders')}
                className="text-on-surface-variant hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined">notifications</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
