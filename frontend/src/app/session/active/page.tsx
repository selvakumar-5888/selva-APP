'use client';

import { AppShell } from '@/components/layout/AppShell';
import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Coffee, CheckCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

const MODES = {
  focus: { label: 'Focus', minutes: 25, color: 'from-purple-600 to-violet-600' },
  shortBreak: { label: 'Short Break', minutes: 5, color: 'from-cyan-600 to-blue-600' },
  longBreak: { label: 'Long Break', minutes: 15, color: 'from-green-600 to-emerald-600' },
};

export default function ActiveSessionPage() {
  const router = useRouter();
  const [mode, setMode] = useState<TimerMode>('focus');
  const [seconds, setSeconds] = useState(MODES.focus.minutes * 60);
  const [running, setRunning] = useState(false);
  const [pomodoros, setPomodoros] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout>();

  const total = MODES[mode].minutes * 60;
  const progress = ((total - seconds) / total) * 100;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            if (mode === 'focus') {
              setPomodoros(p => p + 1);
              toast.success('Pomodoro complete! Take a break 🎉');
              const next = (pomodoros + 1) % 4 === 0 ? 'longBreak' : 'shortBreak';
              setMode(next);
              setSeconds(MODES[next].minutes * 60);
            } else {
              setMode('focus');
              setSeconds(MODES.focus.minutes * 60);
              toast.success('Break over! Back to focus 💪');
            }
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, mode, pomodoros]);

  const handleStart = async () => {
    if (!sessionId) {
      try {
        const res = await api.post('/sessions/start', { title: 'Study Session', plannedMinutes: 25 });
        setSessionId(res.data.id);
      } catch {}
    }
    setRunning(true);
  };

  const handleComplete = async () => {
    setRunning(false);
    if (sessionId) {
      try {
        await api.put(`/sessions/${sessionId}/complete`, {
          actualMinutes: Math.round((total - seconds) / 60) + pomodoros * 25,
          pomodorosCompleted: pomodoros,
          focusScore: Math.min(100, 60 + pomodoros * 10),
        });
        toast.success('Session saved!');
        router.push('/session/complete');
      } catch {
        toast.error('Failed to save session');
      }
    }
  };

  return (
    <AppShell title="Study Session">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Mode selector */}
        <div className="flex gap-2 bg-card rounded-2xl p-1.5">
          {(Object.keys(MODES) as TimerMode[]).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setSeconds(MODES[m].minutes * 60); setRunning(false); }}
              className={cn(
                'flex-1 py-2.5 rounded-xl text-sm font-medium transition-all',
                mode === m ? `bg-gradient-to-r ${MODES[m].color} text-white shadow-lg` : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {MODES[m].label}
            </button>
          ))}
        </div>

        {/* Timer */}
        <div className="card flex flex-col items-center py-12 space-y-8">
          {/* Circle */}
          <div className="relative w-64 h-64">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--secondary))" strokeWidth="4" />
              <motion.circle
                cx="50" cy="50" r="45"
                fill="none"
                stroke="url(#timerGradient)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                transition={{ duration: 0.5 }}
              />
              <defs>
                <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#7C3AED" />
                  <stop offset="100%" stopColor="#06B6D4" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-6xl font-bold font-mono tabular-nums">
                {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
              </span>
              <span className="text-sm text-muted-foreground mt-2">{MODES[mode].label}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => { setSeconds(MODES[mode].minutes * 60); setRunning(false); }}
              className="p-3 rounded-2xl bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-all"
            >
              <RotateCcw className="w-6 h-6" />
            </button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={running ? () => setRunning(false) : handleStart}
              className={`p-5 rounded-2xl bg-gradient-to-r ${MODES[mode].color} text-white shadow-lg`}
            >
              {running ? <Pause className="w-8 h-8 fill-white" /> : <Play className="w-8 h-8 fill-white" />}
            </motion.button>
            <button
              onClick={() => { setMode('shortBreak'); setSeconds(MODES.shortBreak.minutes * 60); setRunning(false); }}
              className="p-3 rounded-2xl bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-all"
            >
              <Coffee className="w-6 h-6" />
            </button>
          </div>

          {/* Pomodoro dots */}
          <div className="flex gap-2">
            {[0,1,2,3].map(i => (
              <div key={i} className={cn('w-3 h-3 rounded-full transition-all', i < pomodoros ? 'bg-purple-500' : 'bg-secondary')} />
            ))}
            <span className="text-xs text-muted-foreground ml-2">{pomodoros} / 4 pomodoros</span>
          </div>
        </div>

        {/* End session */}
        <div className="flex gap-3">
          <button onClick={handleComplete} className="flex-1 btn-primary flex items-center justify-center gap-2">
            <CheckCircle className="w-5 h-5" /> Complete Session
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="btn-ghost px-4 text-muted-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </AppShell>
  );
}
