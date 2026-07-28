'use client';

import { AppShell } from '@/components/layout/AppShell';
import { Bell, Clock, Smartphone, Mail } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function RemindersPage() {
  const [reminders, setReminders] = useState({
    studyReminder: true,
    breakReminder: true,
    streakReminder: true,
    examCountdown: true,
    time: '09:00',
  });

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button onClick={onChange} className={cn('w-12 h-6 rounded-full transition-all relative', checked ? 'bg-purple-600' : 'bg-secondary')}>
      <div className={cn('w-4 h-4 bg-white rounded-full absolute top-1 transition-all', checked ? 'right-1' : 'left-1')} />
    </button>
  );

  return (
    <AppShell title="Reminders">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="card space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 flex items-center justify-center">
              <Bell className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold">Daily Study Reminder</h3>
              <p className="text-sm text-muted-foreground">Get reminded to study every day</p>
            </div>
            <div className="ml-auto">
              <Toggle checked={reminders.studyReminder} onChange={() => setReminders(p => ({ ...p, studyReminder: !p.studyReminder }))} />
            </div>
          </div>
          {reminders.studyReminder && (
            <div className="flex items-center gap-3 pl-13">
              <Clock className="w-4 h-4 text-muted-foreground ml-13" />
              <input
                type="time"
                value={reminders.time}
                onChange={e => setReminders(p => ({ ...p, time: e.target.value }))}
                className="input-field w-32 text-sm"
              />
            </div>
          )}
        </div>

        {[
          { key: 'breakReminder', icon: Clock, title: 'Break Reminders', desc: 'Remind you to take breaks during sessions' },
          { key: 'streakReminder', icon: Bell, title: 'Streak Alerts', desc: 'Alert before your streak is about to break' },
          { key: 'examCountdown', icon: Smartphone, title: 'Exam Countdowns', desc: '7-day and 1-day reminders before exams' },
        ].map(({ key, icon: Icon, title, desc }) => (
          <div key={key} className="card flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
              <Icon className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium">{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
            <Toggle
              checked={reminders[key as keyof typeof reminders] as boolean}
              onChange={() => setReminders(p => ({ ...p, [key]: !p[key as keyof typeof reminders] }))}
            />
          </div>
        ))}
      </div>
    </AppShell>
  );
}
