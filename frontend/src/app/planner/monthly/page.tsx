'use client';

import { AppShell } from '@/components/layout/AppShell';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { addMonths, startOfMonth, getDaysInMonth, format, getDay } from 'date-fns';
import { cn } from '@/lib/utils';

export default function MonthlyPlannerPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const monthStr = format(currentMonth, 'yyyy-MM');

  const { data } = useQuery({
    queryKey: ['planner-monthly', monthStr],
    queryFn: () => api.get(`/planner/monthly?month=${monthStr}`).then(r => r.data),
  });

  const firstDay = startOfMonth(currentMonth);
  const daysInMonth = getDaysInMonth(currentMonth);
  const startDayOfWeek = getDay(firstDay) === 0 ? 6 : getDay(firstDay) - 1;
  const today = new Date();

  return (
    <AppShell title="Monthly Planner">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex items-center gap-4">
          <button onClick={() => setCurrentMonth(d => addMonths(d, -1))} className="p-2 rounded-xl hover:bg-white/5">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-semibold flex-1 text-center">{format(currentMonth, 'MMMM yyyy')}</h2>
          <button onClick={() => setCurrentMonth(d => addMonths(d, 1))} className="p-2 rounded-xl hover:bg-white/5">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="card p-0 overflow-hidden">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-border">
            {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => (
              <div key={d} className="p-3 text-xs font-medium text-muted-foreground text-center">{d}</div>
            ))}
          </div>

          {/* Calendar cells */}
          <div className="grid grid-cols-7">
            {Array.from({ length: startDayOfWeek }, (_, i) => (
              <div key={`empty-${i}`} className="h-24 border-b border-r border-border/50" />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const dateStr = format(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day), 'yyyy-MM-dd');
              const daySessions = data?.sessions?.filter((s: any) =>
                format(new Date(s.startTime), 'yyyy-MM-dd') === dateStr
              ) || [];
              const isToday = dateStr === format(today, 'yyyy-MM-dd');

              return (
                <div key={day} className={cn('h-24 p-1.5 border-b border-r border-border/50 overflow-hidden', isToday && 'bg-purple-600/5')}>
                  <span className={cn('text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full mb-1', isToday ? 'bg-purple-600 text-white' : 'text-foreground')}>
                    {day}
                  </span>
                  {daySessions.slice(0, 2).map((s: any) => (
                    <div key={s.id} className="text-xs rounded px-1 py-0.5 truncate mb-0.5 text-white" style={{ background: s.subject?.color || '#7C3AED' }}>
                      {s.title}
                    </div>
                  ))}
                  {daySessions.length > 2 && <p className="text-xs text-muted-foreground">+{daySessions.length - 2}</p>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
