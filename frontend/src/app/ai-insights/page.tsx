'use client';

import { AppShell } from '@/components/layout/AppShell';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';
import { Brain, Zap, TrendingUp, AlertCircle, ArrowRight, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

const TYPE_ICONS: Record<string, any> = {
  productivity: TrendingUp,
  streak: Zap,
  subject: Brain,
  recommendation: ArrowRight,
  default: AlertCircle,
};

const PRIORITY_STYLES: Record<string, string> = {
  high: 'border-l-red-500 bg-red-500/5',
  medium: 'border-l-purple-500 bg-purple-500/5',
  low: 'border-l-cyan-500 bg-cyan-500/5',
};

export default function AIInsightsPage() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['ai-insights'],
    queryFn: () => api.get('/ai/insights').then(r => r.data),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <AppShell title="AI Insights">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden card bg-gradient-to-r from-purple-600/20 to-cyan-600/20 border-purple-500/20">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center shrink-0">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">Your AI Study Coach</h2>
              <p className="text-muted-foreground text-sm mt-1">
                Personalized insights and recommendations based on your study patterns
              </p>
            </div>
            <button
              onClick={() => refetch()}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Insights */}
        {isLoading ? (
          <div className="space-y-4">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="skeleton h-24" />
            ))}
          </div>
        ) : data?.insights?.length > 0 ? (
          <div className="space-y-4">
            {data.insights.map((insight: any, i: number) => {
              const Icon = TYPE_ICONS[insight.type] || TYPE_ICONS.default;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={cn('card border-l-4', PRIORITY_STYLES[insight.priority] || PRIORITY_STYLES.medium)}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                      insight.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                      insight.priority === 'medium' ? 'bg-purple-500/20 text-purple-400' :
                      'bg-cyan-500/20 text-cyan-400'
                    )}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{insight.title}</h3>
                        <span className={cn('text-xs px-2 py-0.5 rounded-full capitalize',
                          insight.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                          insight.priority === 'medium' ? 'bg-purple-500/20 text-purple-400' :
                          'bg-cyan-500/20 text-cyan-400'
                        )}>{insight.priority}</span>
                      </div>
                      <p className="text-muted-foreground text-sm mt-1">{insight.message}</p>
                      {insight.action && (
                        <button className="mt-3 text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1.5 font-medium">
                          {insight.action} <ArrowRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="card text-center py-12 text-muted-foreground">
            <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">No insights yet</p>
            <p className="text-sm mt-1">Complete some study sessions and I&apos;ll analyze your patterns</p>
          </div>
        )}

        {data?.generatedAt && (
          <p className="text-xs text-muted-foreground text-center">
            Generated {new Date(data.generatedAt).toLocaleString()}
          </p>
        )}
      </div>
    </AppShell>
  );
}
