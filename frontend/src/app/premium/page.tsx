'use client';

import { AppShell } from '@/components/layout/AppShell';
import { motion } from 'framer-motion';
import { Star, Check, Zap, Brain, BarChart3, Users, Crown } from 'lucide-react';

const features = [
  { icon: Brain, label: 'Unlimited AI study plans' },
  { icon: Zap, label: 'Unlimited AI flashcards' },
  { icon: BarChart3, label: 'Advanced analytics & insights' },
  { icon: Users, label: 'Unlimited study groups' },
  { icon: Star, label: 'Priority AI responses' },
  { icon: Crown, label: 'Exclusive badges & rewards' },
];

export default function PremiumPage() {
  return (
    <AppShell title="Premium">
      <div className="max-w-2xl mx-auto space-y-8 py-4">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-xl shadow-amber-500/30">
              <Crown className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">StudyMind Premium</h1>
          <p className="text-muted-foreground">Unlock the full power of AI-assisted learning</p>
        </motion.div>

        {/* Pricing cards */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card space-y-3"
          >
            <p className="font-semibold">Monthly</p>
            <p className="text-3xl font-bold">$9.99<span className="text-sm text-muted-foreground font-normal">/mo</span></p>
            <button className="btn-ghost w-full text-sm">Get Monthly</button>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="card space-y-3 border-amber-500/40 bg-amber-500/5 relative"
          >
            <span className="absolute -top-2 right-4 text-xs bg-amber-500 text-black px-2 py-0.5 rounded-full font-semibold">Best Value</span>
            <p className="font-semibold">Annual</p>
            <p className="text-3xl font-bold">$59.99<span className="text-sm text-muted-foreground font-normal">/yr</span></p>
            <p className="text-xs text-amber-400">Save 50%!</p>
            <button className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-black font-semibold py-2.5 rounded-xl text-sm hover:opacity-90 transition-opacity">Get Annual</button>
          </motion.div>
        </div>

        {/* Features */}
        <div className="card space-y-4">
          <h3 className="font-semibold text-lg">Everything included</h3>
          <div className="grid grid-cols-1 gap-3">
            {features.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-amber-400" />
                </div>
                <span className="text-sm">{label}</span>
                <Check className="w-4 h-4 text-green-400 ml-auto" />
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Cancel anytime. No hidden fees. 7-day free trial.
        </p>
      </div>
    </AppShell>
  );
}
