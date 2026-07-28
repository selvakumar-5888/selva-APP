'use client';

import { AppShell } from '@/components/layout/AppShell';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { CheckCircle, Flame, Clock, Brain, ArrowRight, RotateCcw } from 'lucide-react';
import Link from 'next/link';

export default function SessionCompletePage() {
  const { data: streak } = useQuery({ queryKey: ['streak'], queryFn: () => api.get('/rewards/streak').then(r => r.data) });

  return (
    <AppShell>
      <div className="max-w-lg mx-auto text-center space-y-8 py-8">
        {/* Success animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="flex justify-center"
        >
          <div className="w-24 h-24 rounded-full bg-green-500/20 border-4 border-green-500/40 flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-400" />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h1 className="text-3xl font-bold">Session Complete! 🎉</h1>
          <p className="text-muted-foreground mt-2">Great work! You&apos;re building strong study habits.</p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-3 gap-4"
        >
          {[
            { icon: Clock, label: 'Time Studied', value: '25m', color: 'bg-purple-600/20 text-purple-400' },
            { icon: Brain, label: 'Focus Score', value: '85%', color: 'bg-cyan-600/20 text-cyan-400' },
            { icon: Flame, label: 'Streak', value: `${streak?.currentStreak || 1}🔥`, color: 'bg-orange-600/20 text-orange-400' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="card text-center space-y-2">
              <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mx-auto`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </motion.div>

        {/* XP gained */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-r from-purple-600/20 to-cyan-600/20 border border-purple-500/20 rounded-2xl p-4"
        >
          <p className="text-lg font-semibold">+50 XP earned! ⚡</p>
          <p className="text-sm text-muted-foreground mt-1">Keep it up to unlock badges and level up!</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex gap-3"
        >
          <Link href="/session/active" className="flex-1">
            <button className="w-full btn-ghost flex items-center justify-center gap-2">
              <RotateCcw className="w-5 h-5" /> Another Session
            </button>
          </Link>
          <Link href="/dashboard" className="flex-1">
            <button className="w-full btn-primary flex items-center justify-center gap-2">
              Dashboard <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
        </motion.div>
      </div>
    </AppShell>
  );
}
