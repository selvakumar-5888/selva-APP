import type { ReactNode } from 'react'
import { TopBar } from './TopBar'
import { BottomNav } from './BottomNav'

interface AppShellProps {
  children: ReactNode
  title?: string
  showBack?: boolean
  showNav?: boolean
  showTopBar?: boolean
  rightElement?: ReactNode
  fab?: ReactNode
}

export function AppShell({
  children,
  title,
  showBack = false,
  showNav = true,
  showTopBar = true,
  rightElement,
  fab,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-surface-container-lowest text-on-surface">
      {showTopBar && (
        <TopBar title={title} showBack={showBack} rightElement={rightElement} />
      )}
      <main className="max-w-[1280px] mx-auto px-md md:px-lg py-xl pb-[120px]">
        {children}
      </main>
      {fab && (
        <div className="fixed bottom-24 right-md md:right-lg z-50">
          {fab}
        </div>
      )}
      {showNav && <BottomNav />}
    </div>
  )
}
