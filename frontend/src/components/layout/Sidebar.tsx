'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Calendar, CheckSquare, BookOpen, BarChart3,
  Brain, BookMarked, StickyNote, Clock, Trophy, Settings,
  Users, Star, Zap, ChevronLeft, Menu
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/planner/weekly', label: 'Planner', icon: Calendar },
  { href: '/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/subjects', label: 'Subjects', icon: BookOpen },
  { href: '/session/active', label: 'Study Now', icon: Clock, highlight: true },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/ai-insights', label: 'AI Insights', icon: Brain },
  { href: '/exams', label: 'Exams', icon: BookMarked },
  { href: '/flashcards/study', label: 'Flashcards', icon: Zap },
  { href: '/notes', label: 'Notes', icon: StickyNote },
  { href: '/rewards', label: 'Rewards', icon: Trophy },
  { href: '/groups', label: 'Groups', icon: Users },
];

const bottomItems = [
  { href: '/premium', label: 'Premium', icon: Star },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="relative flex flex-col h-screen bg-card border-r border-border shrink-0 overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-border">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center shrink-0 shadow-lg">
          <Brain className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="font-bold text-lg gradient-text"
          >
            StudyMind
          </motion.span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto p-1.5 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors"
        >
          {collapsed ? <Menu className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon, highlight }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link key={href} href={href}>
              <motion.div
                whileHover={{ x: 2 }}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer group',
                  active
                    ? 'bg-purple-600/20 text-purple-300 border border-purple-500/20'
                    : highlight
                    ? 'bg-gradient-to-r from-purple-600/10 to-cyan-600/10 text-purple-300 border border-purple-500/20 hover:from-purple-600/20 hover:to-cyan-600/20'
                    : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                )}
              >
                <Icon className={cn('w-5 h-5 shrink-0', active && 'text-purple-400')} />
                {!collapsed && <span>{label}</span>}
                {highlight && !collapsed && (
                  <span className="ml-auto text-xs bg-purple-600/30 text-purple-300 px-2 py-0.5 rounded-full">Now</span>
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-2 pb-4 border-t border-border pt-3 space-y-1">
        {bottomItems.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}>
            <div className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer',
              pathname === href ? 'bg-purple-600/20 text-purple-300' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
            )}>
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{label}</span>}
            </div>
          </Link>
        ))}
      </div>
    </motion.aside>
  );
}
