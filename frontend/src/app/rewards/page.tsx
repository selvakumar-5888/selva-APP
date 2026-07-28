'use client';

import { AppShell } from '@/components/layout/AppShell';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';
import { Flame, Star, Zap, Trophy, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function RewardsPage() {
  const { data: streak } = useQuery({ queryKey: ['streak'], queryFn: () => api.get('/rewards/streak').then(r => r.data) });
  const { data: badges } = useQuery({ queryKey: ['badges'], queryFn: () => api.get('/rewards/badges').then(r => r.data) });
  const { data: xp } = useQuery({ queryKey: ['xp'], queryFn: () => api.get('/rewards/xp').then(r => r.data) });

  const rarityColors: Record<string, string> = {
    common: 'from-gray-500 to-gray-400',
    rare: 'from-blue-500 to-cyan-400',
    epic: 'from-purple-500 to-violet-400',
    legendary: 'from-amber-500 to-yellow-400',
  };

  return (
    <AppShell title="Rewards">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* XP Level */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card bg-gradient-to-r from-purple-600/20 to-cyan-600/20 border-purple-500/20"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-2xl font-bold text-white">
              {xp?.level || 1}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold">Level {xp?.level || 1}</span>
                <span className="text-sm text-muted-foreground">{xp?.xp || 0} XP total</span>
              </div>
              <div className="h-3 bg-black/20 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${((xp?.xpInLevel || 0) / 500) * 100}%` }}
                  transition={{ duration: 1 }}
                  className="h-full bg-gradient-to-r from-purple-400 to-cyan-400 rounded-full"
                />
              </div>
              <p className="text-xs text-white/70 mt-1">{xp?.xpInLevel || 0} / 500 XP to Level {(xp?.level || 1) + 1}</p>
            </div>
          </div>
        </motion.div>

        {/* Streak */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Current Streak', value: streak?.currentStreak || 0, suffix: '🔥', color: 'bg-orange-600/20 text-orange-300' },
            { label: 'Longest Streak', value: streak?.longestStreak || 0, suffix: '⚡', color: 'bg-purple-600/20 text-purple-300' },
            { label: 'Total Days', value: streak?.totalDays || 0, suffix: '📅', color: 'bg-cyan-600/20 text-cyan-300' },
          ].map(({ label, value, suffix, color }) => (
            <div key={label} className="card text-center space-y-1">
              <p className="text-3xl font-bold">{value} {suffix}</p>
              <p className="text-sm text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        {/* Streak calendar */}
        <div className="card space-y-3">
          <h3 className="font-semibold">This Week</h3>
          <div className="flex gap-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
              <div key={day} className="flex-1 flex flex-col items-center gap-1">
                <div className={cn('w-full aspect-square rounded-xl flex items-center justify-center text-lg transition-all', i < (streak?.currentStreak || 0) % 7 ? 'bg-orange-500/30 border border-orange-500/40' : 'bg-secondary')}>
                  {i < (streak?.currentStreak || 0) % 7 ? '🔥' : '○'}
                </div>
                <span className="text-xs text-muted-foreground">{day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Earned badges */}
        {badges?.earned?.length > 0 && (
          <div className="card space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" /> Earned Badges
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {badges.earned.map((badge: any) => (
                <motion.div
                  key={badge.id}
                  whileHover={{ scale: 1.05 }}
                  className="card text-center space-y-2 bg-secondary/50"
                >
                  <div className={`w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br ${rarityColors[badge.rarity] || rarityColors.common} flex items-center justify-center text-2xl shadow-lg`}>
                    {badge.icon}
                  </div>
                  <p className="font-semibold text-sm">{badge.name}</p>
                  <p className="text-xs text-muted-foreground">{badge.description}</p>
                  <span className={cn('text-xs px-2 py-0.5 rounded-full capitalize',
                    badge.rarity === 'legendary' ? 'bg-amber-500/20 text-amber-400' :
                    badge.rarity === 'epic' ? 'bg-purple-500/20 text-purple-400' :
                    badge.rarity === 'rare' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-gray-500/20 text-gray-400'
                  )}>{badge.rarity}</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Locked badges */}
        {badges?.locked?.length > 0 && (
          <div className="card space-y-4">
            <h3 className="font-semibold flex items-center gap-2 text-muted-foreground">
              <Lock className="w-5 h-5" /> Locked Badges
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {badges.locked.map((badge: any) => (
                <div key={badge.id} className="card text-center space-y-2 opacity-50">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-secondary flex items-center justify-center text-2xl grayscale">
                    {badge.icon}
                  </div>
                  <p className="font-semibold text-sm">{badge.name}</p>
                  <p className="text-xs text-muted-foreground">{badge.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
