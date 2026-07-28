'use client';

import { motion } from 'framer-motion';
import { Brain, Zap, Target, BarChart3, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const features = [
  { icon: Brain, label: 'AI Study Plans', color: 'from-purple-500 to-violet-500', desc: 'Personalized schedules built by AI' },
  { icon: Target, label: 'Smart Goals', color: 'from-cyan-500 to-blue-500', desc: 'Track progress toward your targets' },
  { icon: Zap, label: 'Flashcards', color: 'from-amber-500 to-orange-500', desc: 'AI-generated study cards' },
  { icon: BarChart3, label: 'Analytics', color: 'from-green-500 to-emerald-500', desc: 'Insights into your study habits' },
];

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-900/20 via-background to-cyan-900/20" />
        <div className="absolute top-20 right-20 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative max-w-lg w-full text-center space-y-8"
      >
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center shadow-xl shadow-purple-500/30">
            <Brain className="w-11 h-11 text-white" />
          </div>
        </div>

        <div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl font-bold"
          >
            Welcome to{' '}
            <span className="gradient-text">StudyMind</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground mt-4 text-lg leading-relaxed"
          >
            Your AI-powered study companion. Build better habits, track your progress, and achieve your academic goals.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 gap-3"
        >
          {features.map(({ icon: Icon, label, color, desc }) => (
            <div key={label} className="glass-card p-4 text-left space-y-2">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-3"
        >
          <Link href="/auth/signup">
            <button className="btn-primary w-full flex items-center justify-center gap-2 text-base py-4">
              Get Started Free <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
          <Link href="/auth/login">
            <button className="btn-ghost w-full text-base py-4">
              I already have an account
            </button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
