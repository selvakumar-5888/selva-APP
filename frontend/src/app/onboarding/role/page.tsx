'use client';

import { motion } from 'framer-motion';
import { GraduationCap, Briefcase, BookOpen, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const roles = [
  { id: 'STUDENT', label: 'Student', desc: 'High school, college, or university', icon: GraduationCap, color: 'from-purple-500 to-violet-500' },
  { id: 'PROFESSIONAL', label: 'Professional', desc: 'Upskilling for career growth', icon: Briefcase, color: 'from-cyan-500 to-blue-500' },
  { id: 'TEACHER', label: 'Educator', desc: 'Teaching or tutoring others', icon: BookOpen, color: 'from-amber-500 to-orange-500' },
];

export default function RolePage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string>('');

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-background to-cyan-900/10" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-lg space-y-8"
      >
        {/* Step indicator */}
        <div className="flex items-center gap-2 justify-center">
          {[1,2,3,4].map((s) => (
            <div key={s} className={cn('h-1.5 rounded-full transition-all', s === 1 ? 'w-8 bg-purple-500' : 'w-4 bg-white/20')} />
          ))}
        </div>

        <div className="text-center">
          <h1 className="text-3xl font-bold">Who are you studying as?</h1>
          <p className="text-muted-foreground mt-2">We&apos;ll personalize your experience based on your role</p>
        </div>

        <div className="space-y-3">
          {roles.map(({ id, label, desc, icon: Icon, color }) => (
            <motion.button
              key={id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelected(id)}
              className={cn(
                'w-full flex items-center gap-4 p-5 rounded-2xl border transition-all text-left',
                selected === id
                  ? 'border-purple-500 bg-purple-600/10'
                  : 'border-border bg-card hover:border-purple-500/50 hover:bg-white/5'
              )}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shrink-0`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">{label}</p>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
              {selected === id && (
                <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 bg-white rounded-full" />
                </div>
              )}
            </motion.button>
          ))}
        </div>

        <button
          onClick={() => selected && router.push('/onboarding/subjects')}
          disabled={!selected}
          className={cn(
            'btn-primary w-full flex items-center justify-center gap-2 py-4',
            !selected && 'opacity-50 cursor-not-allowed hover:scale-100'
          )}
        >
          Continue <ArrowRight className="w-5 h-5" />
        </button>
      </motion.div>
    </div>
  );
}
