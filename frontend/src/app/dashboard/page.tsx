'use client';

import { AppShell } from '@/components/layout/AppShell';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { motion } from 'framer-motion';
import { getGreeting, formatMinutes, daysUntil } from '@/lib/utils';
import { ArrowRight, Flame, Clock, Target, Brain, Play, CheckCircle2, BookOpen } from 'lucide-react';
import Link from 'next/link';

function StatCard({ label, value, sub, icon: Icon, color }: any) {
  return (
    <motion.div whileHover={{ y: -2 }} className="card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
          {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();

  const { data: analytics } = useQuery({
    queryKey: ['analytics-weekly'],
    queryFn: () => api.get('/analytics/weekly').then(r => r.data),
  });

  const { data: tasks } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => api.get('/tasks').then(r => r.data),
  });

  const { data: exams } = useQuery({
    queryKey: ['exams'],
    queryFn: () => api.get('/exams').then(r => r.data),
  });

  const { data: streak } = useQuery({
    queryKey: ['streak'],
    queryFn: () => api.get('/rewards/streak').then(r => r.data),
  });

  const { data: subjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => api.get('/subjects').then(r => r.data),
  });

  const todoTasks = tasks?.filter((t: any) => t.status !== 'DONE').slice(0, 4) || [];
  const upcomingExams = exams?.filter((e: any) => !e.completed && daysUntil(e.date) >= 0).slice(0, 2) || [];

  return (
    <AppShell title="Dashboard">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-600 p-6 text-white"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <p className="text-purple-200">{getGreeting()},</p>
            <h2 className="text-2xl font-bold mt-1">{user?.name} 👋</h2>
            <p className="text-purple-100 mt-1 text-sm">
              {streak?.currentStreak > 0
                ? `You're on a ${streak.currentStreak}-day streak! Keep it up! 🔥`
                : "Start a study session to build your streak!"}
            </p>
            <Link href="/session/active">
              <button className="mt-4 bg-white/20 hover:bg-white/30 text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all">
                <Play className="w-4 h-4 fill-white" /> Start Studying
              </button>
            </Link>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Today's Study Time"
            value={formatMinutes(analytics?.byDay?.slice(-1)[0]?.minutes || 0)}
            sub="Goal: 2h"
            icon={Clock}
            color="bg-purple-600"
          />
          <StatCard
            label="Weekly Sessions"
            value={analytics?.totalSessions || 0}
            sub={`${analytics?.totalMinutes ? Math.round(analytics.totalMinutes / 60) : 0}h total`}
            icon={Target}
            color="bg-cyan-600"
          />
          <StatCard
            label="Current Streak"
            value={`${streak?.currentStreak || 0} 🔥`}
            sub={`Best: ${streak?.longestStreak || 0} days`}
            icon={Flame}
            color="bg-orange-600"
          />
          <StatCard
            label="Focus Score"
            value={`${analytics?.avgFocusScore || 0}%`}
            sub="This week"
            icon={Brain}
            color="bg-green-600"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Subjects */}
          <div className="lg:col-span-2 card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Subject Progress</h3>
              <Link href="/subjects" className="text-purple-400 text-sm hover:text-purple-300 flex items-center gap-1">
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            {subjects?.slice(0, 4).map((s: any) => (
              <div key={s.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: s.color }} />
                    <span>{s.name}</span>
                  </div>
                  <span className="text-muted-foreground">{Math.round(s.progress)}%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${s.progress}%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="h-full rounded-full"
                    style={{ background: s.color }}
                  />
                </div>
              </div>
            )) || <p className="text-muted-foreground text-sm">No subjects yet. <Link href="/subjects" className="text-purple-400">Add one!</Link></p>}
          </div>

          {/* Right column */}
          <div className="space-y-4">
            {/* Tasks */}
            <div className="card space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Today's Tasks</h3>
                <Link href="/tasks" className="text-purple-400 text-sm hover:text-purple-300">
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              {todoTasks.length > 0 ? todoTasks.map((t: any) => (
                <div key={t.id} className="flex items-start gap-3">
                  <CheckCircle2 className={`w-5 h-5 shrink-0 mt-0.5 ${t.status === 'DONE' ? 'text-green-400' : 'text-muted-foreground'}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${t.status === 'DONE' ? 'line-through text-muted-foreground' : ''}`}>{t.title}</p>
                    {t.subject && <p className="text-xs text-muted-foreground">{t.subject.name}</p>}
                  </div>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                    t.priority === 'URGENT' ? 'bg-red-500/20 text-red-400' :
                    t.priority === 'HIGH' ? 'bg-orange-500/20 text-orange-400' :
                    'bg-secondary text-muted-foreground'
                  }`}>{t.priority}</span>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground">No pending tasks 🎉</p>
              )}
            </div>

            {/* Upcoming Exams */}
            <div className="card space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Upcoming Exams</h3>
                <Link href="/exams" className="text-purple-400 text-sm"><ArrowRight className="w-4 h-4" /></Link>
              </div>
              {upcomingExams.length > 0 ? upcomingExams.map((e: any) => (
                <div key={e.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center shrink-0">
                    <BookOpen className="w-5 h-5 text-red-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{e.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {daysUntil(e.date) === 0 ? 'Today!' : daysUntil(e.date) === 1 ? 'Tomorrow' : `${daysUntil(e.date)} days`}
                    </p>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground">No upcoming exams</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
