'use client';

import { AppShell } from '@/components/layout/AppShell';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { useTheme } from 'next-themes';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Bell, Palette, LogOut, Moon, Sun, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const qc = useQueryClient();

  const { data: prefs } = useQuery({
    queryKey: ['preferences'],
    queryFn: () => api.get('/user/preferences').then(r => r.data),
  });

  const [name, setName] = useState(user?.name || '');

  const updateProfile = useMutation({
    mutationFn: () => api.put('/user/profile', { name }),
    onSuccess: () => { qc.invalidateQueries(); toast.success('Profile updated!'); },
  });

  const handleLogout = async () => {
    try { await api.post('/auth/logout'); } catch {}
    logout();
    router.push('/auth/login');
  };

  return (
    <AppShell title="Settings">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Profile */}
        <div className="card space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-600/20 flex items-center justify-center">
              <User className="w-4 h-4 text-purple-400" />
            </div>
            <h3 className="font-semibold">Profile</h3>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-2xl font-bold text-white shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 space-y-3">
              <input value={name} onChange={e => setName(e.target.value)} className="input-field" placeholder="Your name" />
              <input value={user?.email} readOnly className="input-field opacity-60 cursor-not-allowed" />
            </div>
          </div>
          <button onClick={() => updateProfile.mutate()} className="btn-primary flex items-center gap-2 text-sm w-fit">
            <Save className="w-4 h-4" /> Save Changes
          </button>
        </div>

        {/* Appearance */}
        <div className="card space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-600/20 flex items-center justify-center">
              <Palette className="w-4 h-4 text-cyan-400" />
            </div>
            <h3 className="font-semibold">Appearance</h3>
          </div>
          <div className="flex gap-3">
            {[
              { value: 'dark', label: 'Dark', icon: Moon },
              { value: 'light', label: 'Light', icon: Sun },
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={`flex-1 flex items-center gap-2 p-3 rounded-xl border transition-all ${theme === value ? 'border-purple-500 bg-purple-600/10 text-purple-300' : 'border-border hover:border-purple-500/50'}`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Study preferences */}
        {prefs && (
          <div className="card space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-green-600/20 flex items-center justify-center">
                <Bell className="w-4 h-4 text-green-400" />
              </div>
              <h3 className="font-semibold">Study Preferences</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-sm">Daily goal</span>
                <span className="text-sm font-medium">{prefs.dailyGoalMinutes} minutes</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-sm">Weekly days</span>
                <span className="text-sm font-medium">{prefs.weeklyGoalDays} days</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm">Learning style</span>
                <span className="text-sm font-medium capitalize">{prefs.studyStyle?.toLowerCase()}</span>
              </div>
            </div>
          </div>
        )}

        {/* Danger zone */}
        <div className="card border-red-500/20 space-y-3">
          <h3 className="font-semibold text-red-400">Account</h3>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 rounded-xl py-3 text-sm font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>
    </AppShell>
  );
}
