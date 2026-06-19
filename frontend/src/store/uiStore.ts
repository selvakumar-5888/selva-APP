import { create } from 'zustand'
import type { NavTab } from '@/types'

interface UIState {
  activeTab: NavTab
  isSidebarOpen: boolean
  isLoading: boolean
  setActiveTab: (tab: NavTab) => void
  toggleSidebar: () => void
  setLoading: (loading: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  activeTab: 'home',
  isSidebarOpen: false,
  isLoading: false,
  setActiveTab: (tab) => set({ activeTab: tab }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setLoading: (isLoading) => set({ isLoading }),
}))
