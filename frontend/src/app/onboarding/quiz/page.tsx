'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Eye, Headphones, BookText, Dumbbell } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const styles = [
  { id: 'VISUAL', label: 'Visual', desc: 'I learn best with diagrams, charts, and videos', icon: Eye, color: 'from-purple-500 to-violet-500' },
  { id: 'AUDITORY', label: 'Auditory', desc: 'I prefer listening to lectures and discussions', icon: Headphones, color: 'from-cyan-500 to-blue-500' },
  { id: 'READING', label: 'Reading/Writing', desc: 'I learn through reading and taking notes', icon: BookText, color: 'from-amber-500 to-orange-500' },
  { id: 'KINESTHETIC', label: 'Kinesthetic', desc: 'I learn by doing, practicing, and experimenting', icon: Dumbbell, color: 'from-green-500 to-emerald-500' },
];

export default function QuizPage() {
  const router = useRouter();
  const [selected, setSelected] = useState('');

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
            <div key={s} className={cn('h-1.5 rounded-full transition-all', s === 4 ? 'w-8 bg-purple-500' : 'w-4 bg-white/20')} />
          ))}
        </div>

        <div className="text-center">
          <h1 className="text-3xl font-bold">How do you learn best?</h1>
          <p className="text-muted-foreground mt-2">Your AI study plan will match your learning style</p>
        </div>

        <div className="space-y-3">
          {styles.map(({ id, label, desc, icon: Icon, color }) => (
            <motion.button
              key={id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setSelected(id)}
              className={cn(
                'w-full flex items-center gap-4 p-5 rounded-2xl border transition-all text-left',
                selected === id ? 'border-purple-500 bg-purple-600/10' : 'border-border bg-card hover:border-purple-500/40'
              )}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shrink-0`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">{label}</p>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
              <div className={cn('w-5 h-5 rounded-full border-2 transition-all', selected === id ? 'border-purple-500 bg-purple-500' : 'border-border')} />
            </motion.button>
          ))}
        </div>

        <button
          onClick={() => selected && router.push('/ai-generating')}
          disabled={!selected}
          className={cn('btn-primary w-full flex items-center justify-center gap-2 py-4', !selected && 'opacity-50 cursor-not-allowed hover:scale-100')}
        >
          Generate My Study Plan <ArrowRight className="w-5 h-5" />
        </button>
      </motion.div>
    </div>
  );
}
