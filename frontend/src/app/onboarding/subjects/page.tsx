'use client';

import { motion } from 'framer-motion';
import { Plus, X, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const presets = [
  '📐 Mathematics', '⚛️ Physics', '🧪 Chemistry', '🧬 Biology',
  '💻 Computer Science', '📚 Literature', '🌍 History', '🗣️ Languages',
  '💰 Economics', '🎨 Art', '🎵 Music', '🏛️ Philosophy',
];

export default function SubjectsPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [custom, setCustom] = useState('');

  const toggle = (s: string) =>
    setSelected(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const addCustom = () => {
    if (custom.trim() && !selected.includes(custom.trim())) {
      setSelected(prev => [...prev, custom.trim()]);
      setCustom('');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-background to-cyan-900/10" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-lg space-y-6"
      >
        <div className="flex items-center gap-2 justify-center">
          {[1,2,3,4].map((s) => (
            <div key={s} className={cn('h-1.5 rounded-full transition-all', s === 2 ? 'w-8 bg-purple-500' : 'w-4 bg-white/20')} />
          ))}
        </div>

        <div className="text-center">
          <h1 className="text-3xl font-bold">What do you study?</h1>
          <p className="text-muted-foreground mt-2">Select all subjects you&apos;re working on</p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {presets.map((s) => (
            <motion.button
              key={s}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggle(s)}
              className={cn(
                'p-3 rounded-xl text-sm font-medium border transition-all text-center',
                selected.includes(s)
                  ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                  : 'bg-card border-border hover:border-purple-500/50 text-muted-foreground hover:text-foreground'
              )}
            >
              {s}
            </motion.button>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addCustom()}
            className="input-field flex-1"
            placeholder="Add custom subject..."
          />
          <button onClick={addCustom} className="btn-ghost px-4">
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {selected.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selected.filter(s => !presets.includes(s)).map(s => (
              <span key={s} className="flex items-center gap-1.5 bg-purple-600/20 text-purple-300 border border-purple-500/30 rounded-full px-3 py-1 text-sm">
                {s}
                <button onClick={() => toggle(s)}><X className="w-3 h-3" /></button>
              </span>
            ))}
          </div>
        )}

        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">{selected.length} selected</span>
          <button
            onClick={() => selected.length > 0 && router.push('/onboarding/goals')}
            disabled={selected.length === 0}
            className={cn('btn-primary flex items-center gap-2', selected.length === 0 && 'opacity-50 cursor-not-allowed hover:scale-100')}
          >
            Continue <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
