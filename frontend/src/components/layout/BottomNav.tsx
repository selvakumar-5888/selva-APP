import { useNavigate, useLocation } from 'react-router-dom'
import { Home, BookOpen, CheckSquare, Users, Trophy } from 'lucide-react'

export function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  const NAV_ITEMS = [
    { label: 'Home', icon: Home, path: '/dashboard', activeColor: 'text-primary' },
    { label: 'Library', icon: BookOpen, path: '/library', activeColor: 'text-secondary' },
    { label: 'Tasks', icon: CheckSquare, path: '/tasks', activeColor: 'text-emerald-400' },
    { label: 'Rooms', icon: Users, path: '/study-rooms', activeColor: 'text-rose-400' },
    { label: 'Rank', icon: Trophy, path: '/leaderboard', activeColor: 'text-yellow-400' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 py-4 border-t border-surface-border rounded-t-2xl bg-surface/80 backdrop-blur-xl">
      {NAV_ITEMS.map((item) => {
        const isActive = location.pathname.startsWith(item.path)
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center px-4 py-1 transition-all duration-300 group ${isActive ? 'scale-110' : 'hover:scale-105'}`}
          >
            <item.icon 
              className={`w-6 h-6 transition-all duration-300 ${isActive ? item.activeColor : 'text-text-muted'} ${isActive ? `drop-shadow-[0_0_8px_rgba(currentColor,0.5)]` : ''}`} 
              strokeWidth={isActive ? 2.5 : 2}
            />
            <span className={`text-[10px] font-bold mt-1 uppercase tracking-widest transition-colors ${isActive ? 'text-white' : 'text-text-muted group-hover:text-text-main'}`}>
              {item.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
