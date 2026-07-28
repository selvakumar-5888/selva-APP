'use client';

import { AppShell } from '@/components/layout/AppShell';
import { motion } from 'framer-motion';
import { Brain, Plus, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function EmptyStatePage() {
  return (
    <AppShell>
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="relative"
        >
          <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-500/20 flex items-center justify-center">
            <Brain className="w-16 h-16 text-purple-400/50" />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 className="text-2xl font-bold">Nothing here yet</h2>
          <p className="text-muted-foreground mt-2 max-w-sm">
            Start by adding subjects, creating tasks, or letting AI generate your first study plan.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="flex flex-col gap-3 w-full max-w-xs">
          <Link href="/subjects">
            <button className="btn-primary w-full flex items-center justify-center gap-2">
              <Plus className="w-5 h-5" /> Add Subjects
            </button>
          </Link>
          <Link href="/ai-generating">
            <button className="btn-ghost w-full flex items-center justify-center gap-2">
              <Brain className="w-5 h-5" /> Generate AI Plan <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
        </motion.div>
      </div>
    </AppShell>
  );
}
