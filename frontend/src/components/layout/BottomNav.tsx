import { useNavigate, useLocation } from 'react-router-dom'

export function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  const NAV_ITEMS = [
    { label: 'Home', icon: 'home', path: '/dashboard', activeColor: '#eec13c' },
    { label: 'Library', icon: 'book_4', path: '/library', activeColor: '#c4c0ff' },
    { label: 'Tasks', icon: 'task_alt', path: '/tasks', activeColor: '#ffb785' },
    { label: 'Cards', icon: 'style', path: '/flashcards', activeColor: '#8781ff' },
    { label: 'Notes', icon: 'note_stack', path: '/notes', activeColor: '#7bc67b' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 py-4 border-t border-white/10 rounded-t-xl transition-all duration-300" style={{ background: 'rgba(27,31,44,0.9)', backdropFilter: 'blur(12px)' }}>
      {NAV_ITEMS.map((item) => {
        const isActive = location.pathname.startsWith(item.path)
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center px-4 py-1 transition-all duration-300 ${isActive ? 'scale-110' : 'hover:scale-105'}`}
            style={{ 
              color: isActive ? item.activeColor : '#c7c4d8',
              filter: isActive ? `drop-shadow(0 0 8px ${item.activeColor}80)` : 'none'
            }}
          >
            <span className="material-symbols-outlined transition-transform duration-300" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
              {item.icon}
            </span>
            <span className={`text-xs font-medium mt-1 ${isActive ? 'opacity-100' : 'opacity-70'}`}>
              {item.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
