'use client';

import { AppShell } from '@/components/layout/AppShell';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Clock, TrendingUp, Target, Flame } from 'lucide-react';
import { formatMinutes } from '@/lib/utils';

export default function AnalyticsPage() {
  const { data: weekly } = useQuery({ queryKey: ['analytics-weekly'], queryFn: () => api.get('/analytics/weekly').then(r => r.data) });
  const { data: monthly } = useQuery({ queryKey: ['analytics-monthly'], queryFn: () => api.get('/analytics/monthly').then(r => r.data) });
  const { data: heatmap } = useQuery({ queryKey: ['analytics-heatmap'], queryFn: () => api.get('/analytics/heatmap').then(r => r.data) });
  const { data: streak } = useQuery({ queryKey: ['streak'], queryFn: () => api.get('/rewards/streak').then(r => r.data) });

  const COLORS = ['#7C3AED', '#0EA5E9', '#10B981', '#F59E0B', '#EF4444'];

  return (
    <AppShell title="Analytics">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Summary stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'This Week', value: formatMinutes(weekly?.totalMinutes || 0), icon: Clock, color: 'bg-purple-600/20 text-purple-400' },
            { label: 'Sessions', value: weekly?.totalSessions || 0, icon: Target, color: 'bg-cyan-600/20 text-cyan-400' },
            { label: 'Avg Focus', value: `${weekly?.avgFocusScore || 0}%`, icon: TrendingUp, color: 'bg-green-600/20 text-green-400' },
            { label: 'Streak', value: `${streak?.currentStreak || 0} days`, icon: Flame, color: 'bg-orange-600/20 text-orange-400' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="text-2xl font-bold">{value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Weekly chart */}
          <div className="lg:col-span-2 card space-y-4">
            <h3 className="font-semibold">Study Time This Week</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weekly?.byDay || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickFormatter={v => `${v}m`} />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12 }}
                  formatter={(v: number) => [formatMinutes(v), 'Study Time']}
                />
                <Bar dataKey="minutes" fill="#7C3AED" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* By subject pie */}
          <div className="card space-y-4">
            <h3 className="font-semibold">By Subject</h3>
            {weekly?.bySubject?.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={weekly.bySubject} dataKey="minutes" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={70}>
                      {weekly.bySubject.map((entry: any, i: number) => (
                        <Cell key={i} fill={entry.color || COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12 }} formatter={(v: number) => [formatMinutes(v), 'Time']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {weekly.bySubject.slice(0, 4).map((s: any, i: number) => (
                    <div key={s.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ background: s.color || COLORS[i % COLORS.length] }} />
                      <span className="text-sm flex-1 truncate">{s.name}</span>
                      <span className="text-sm text-muted-foreground">{formatMinutes(s.minutes)}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-muted-foreground text-sm text-center py-8">No data yet</p>
            )}
          </div>
        </div>

        {/* Monthly chart */}
        <div className="card space-y-4">
          <h3 className="font-semibold">Monthly Overview</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthly?.byWeek || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="week" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} />
              <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickFormatter={v => `${Math.round(v/60)}h`} />
              <Tooltip
                contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12 }}
                formatter={(v: number) => [formatMinutes(v), 'Study Time']}
              />
              <Bar dataKey="minutes" fill="#0EA5E9" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Heatmap */}
        {heatmap?.length > 0 && (
          <div className="card space-y-4">
            <h3 className="font-semibold">Study Activity (Last Year)</h3>
            <div className="flex gap-1 flex-wrap">
              {heatmap.slice(-90).map((d: any) => {
                const intensity = Math.min(4, Math.floor(d.minutes / 30));
                const colors = ['bg-secondary', 'bg-purple-900/60', 'bg-purple-700/60', 'bg-purple-500/80', 'bg-purple-400'];
                return (
                  <div
                    key={d.date}
                    title={`${d.date}: ${formatMinutes(d.minutes)}`}
                    className={`w-3 h-3 rounded-sm ${colors[intensity]}`}
                  />
                );
              })}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Less</span>
              {['bg-secondary', 'bg-purple-900/60', 'bg-purple-700/60', 'bg-purple-500/80', 'bg-purple-400'].map((c, i) => (
                <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />
              ))}
              <span>More</span>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
