'use client';

import { AppShell } from '@/components/layout/AppShell';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Zap, Loader2, CheckCircle, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function GenerateFlashcardsPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [count, setCount] = useState(10);
  const [generated, setGenerated] = useState<any[] | null>(null);

  const generate = useMutation({
    mutationFn: () => api.post('/ai/generate-flashcards', { content, deckTitle: title, count }),
    onSuccess: (res) => {
      setGenerated(res.data.flashcards);
      toast.success(`Generated ${res.data.flashcards.length} flashcards!`);
    },
    onError: () => toast.error('AI generation failed. Check your API key.'),
  });

  const save = useMutation({
    mutationFn: () => api.post('/flashcards/decks', {
      title: title || 'AI Generated Deck',
      flashcards: generated,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['flashcard-decks'] });
      toast.success('Deck saved!');
      router.push('/flashcards/study');
    },
  });

  return (
    <AppShell title="Generate Flashcards">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* AI Header */}
        <div className="card bg-gradient-to-r from-purple-600/20 to-cyan-600/20 border-purple-500/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
              <Zap className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg">AI Flashcard Generator</h2>
              <p className="text-sm text-muted-foreground">Paste your notes and AI will create study cards automatically</p>
            </div>
          </div>
        </div>

        {!generated ? (
          <div className="card space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Deck Title</label>
              <input value={title} onChange={e => setTitle(e.target.value)} className="input-field" placeholder="e.g., Calculus Formulas" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Your Notes / Content *</label>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                rows={10}
                className="input-field resize-none font-mono text-sm"
                placeholder="Paste your notes, textbook content, or any text here...

Example:
Newton's Laws of Motion:
1. An object at rest stays at rest unless acted upon by an external force
2. F = ma (Force = mass × acceleration)
3. For every action there is an equal and opposite reaction"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Number of cards: {count}</label>
              <input
                type="range" min={5} max={20} value={count}
                onChange={e => setCount(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>5</span><span>20</span>
              </div>
            </div>
            <button
              onClick={() => generate.mutate()}
              disabled={!content.trim() || generate.isPending}
              className="btn-primary w-full flex items-center justify-center gap-2 py-4"
            >
              {generate.isPending ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Generating...</>
              ) : (
                <><Zap className="w-5 h-5" /> Generate {count} Flashcards</>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">{generated.length} cards generated</h2>
              <button onClick={() => setGenerated(null)} className="text-sm text-muted-foreground hover:text-foreground">
                ← Edit Content
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {generated.map((card, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="card space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      card.difficulty === 'EASY' ? 'bg-green-500/20 text-green-400' :
                      card.difficulty === 'HARD' ? 'bg-red-500/20 text-red-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>{card.difficulty}</span>
                    <button onClick={() => setGenerated(g => g!.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm font-medium">Q: {card.front}</p>
                  <p className="text-sm text-muted-foreground border-t border-border pt-2">A: {card.back}</p>
                </motion.div>
              ))}
            </div>

            <button
              onClick={() => save.mutate()}
              disabled={save.isPending}
              className="btn-primary w-full flex items-center justify-center gap-2 py-4"
            >
              {save.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckCircle className="w-5 h-5" /> Save Deck</>}
            </button>
          </div>
        )}
      </div>
    </AppShell>
  );
}
