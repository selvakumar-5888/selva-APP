'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Clock, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const dailyOptions = [30, 60, 90, 120, 180, 240];
const weeklyOptions = [3, 4, 5, 6, 7];

export default function GoalsPage() {
  const router = useRouter();
  const [daily, setDaily] = useState(120);
  const [weekly, setWeekly] = useState(5);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-background to-cyan-900/10" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-lg space-y-8"
      >
        <div className="flex items-center gap-2 justify-center">
          {[1,2,3,4].map((s) => (
            <div key={s} className={cn('h-1.5 rounded-full transition-all', s === 3 ? 'w-8 bg-purple-500' : 'w-4 bg-white/20')} />
          ))}
        </div>

        <div className="text-center">
          <h1 className="text-3xl font-bold">Set your study goals</h1>
          <p className="text-muted-foreground mt-2">We&apos;ll build your schedule around these targets</p>
        </div>

        <div className="card space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="font-semibold">Daily study goal</p>
              <p className="text-sm text-muted-foreground">How many minutes per day?</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {dailyOptions.map((m) => (
              <button
                key={m}
                onClick={() => setDaily(m)}
                className={cn(
                  'p-3 rounded-xl text-sm font-medium border transition-all',
                  daily === m ? 'bg-purple-600/20 border-purple-500 text-purple-300' : 'border-border bg-secondary hover:border-purple-500/50'
                )}
              >
                {m < 60 ? `${m}m` : `${m/60}h`}
              </button>
            ))}
          </div>
        </div>

        <div className="card space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-600/20 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <p className="font-semibold">Days per week</p>
              <p className="text-sm text-muted-foreground">How many days will you study?</p>
            </div>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {weeklyOptions.map((d) => (
              <button
                key={d}
                onClick={() => setWeekly(d)}
                className={cn(
                  'p-3 rounded-xl text-sm font-semibold border transition-all',
                  weekly === d ? 'bg-cyan-600/20 border-cyan-500 text-cyan-300' : 'border-border bg-secondary hover:border-cyan-500/50'
                )}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div className="card bg-gradient-to-r from-purple-600/10 to-cyan-600/10">
          <p className="text-center font-medium">
            📈 Weekly goal:{' '}
            <span className="gradient-text font-bold">
              {Math.round(daily * weekly / 60)} hours
            </span>{' '}
            across {weekly} days
          </p>
        </div>

        <button
          onClick={() => router.push('/onboarding/quiz')}
          className="btn-primary w-full flex items-center justify-center gap-2 py-4"
        >
          Continue <ArrowRight className="w-5 h-5" />
        </button>
      </motion.div>
    </div>
  );
}
