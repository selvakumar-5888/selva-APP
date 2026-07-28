'use client';

import { motion } from 'framer-motion';
import { Brain, Sparkles, Calendar, Target, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const steps = [
  { icon: Brain, label: 'Analyzing your learning style...', delay: 0 },
  { icon: Calendar, label: 'Building your weekly schedule...', delay: 1.5 },
  { icon: Target, label: 'Optimizing study sessions...', delay: 3 },
  { icon: Zap, label: 'Generating flashcard decks...', delay: 4.5 },
  { icon: Sparkles, label: 'Finalizing your personalized plan!', delay: 5.5 },
];

export default function AiGeneratingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = steps.map((s, i) =>
      setTimeout(() => setStep(i), s.delay * 1000)
    );
    const final = setTimeout(() => router.push('/dashboard'), 7500);
    return () => { timers.forEach(clearTimeout); clearTimeout(final); };
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative text-center space-y-10 max-w-md w-full px-4"
      >
        {/* Animated brain */}
        <div className="flex justify-center">
          <div className="relative">
            <motion.div
              animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-28 h-28 rounded-3xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center shadow-2xl shadow-purple-500/40"
            >
              <Brain className="w-16 h-16 text-white" />
            </motion.div>
            {/* Orbiting dots */}
            {[0,1,2].map((i) => (
              <motion.div
                key={i}
                animate={{ rotate: 360 }}
                transition={{ duration: 3 + i, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0"
                style={{ transformOrigin: 'center' }}
              >
                <div
                  className="absolute w-3 h-3 rounded-full bg-purple-400"
                  style={{ top: -6 + (i * 12), left: '50%', transform: 'translateX(-50%)' }}
                />
              </motion.div>
            ))}
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-2">AI is building your plan</h1>
          <p className="text-muted-foreground">This takes just a few seconds...</p>
        </div>

        {/* Progress steps */}
        <div className="space-y-3 text-left">
          {steps.map(({ icon: Icon, label }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: i <= step ? 1 : 0.3, x: 0 }}
              transition={{ delay: 0.1 * i }}
              className="flex items-center gap-3"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${i <= step ? 'bg-purple-600/30 text-purple-400' : 'bg-white/5 text-muted-foreground'}`}>
                {i < step ? (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    <div className="w-3 h-3 bg-green-400 rounded-full" />
                  </motion.div>
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>
              <span className={`text-sm ${i <= step ? 'text-foreground' : 'text-muted-foreground'}`}>{label}</span>
            </motion.div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </motion.div>
    </div>
  );
}
