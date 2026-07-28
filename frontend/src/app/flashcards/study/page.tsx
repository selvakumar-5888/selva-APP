'use client';

import { AppShell } from '@/components/layout/AppShell';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, Plus, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function FlashcardsStudyPage() {
  const [selectedDeck, setSelectedDeck] = useState<any>(null);
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const qc = useQueryClient();

  const { data: decks = [], isLoading } = useQuery({
    queryKey: ['flashcard-decks'],
    queryFn: () => api.get('/flashcards/decks').then(r => r.data),
  });

  const rateCard = useMutation({
    mutationFn: ({ id, confidence }: any) => api.put(`/flashcards/${id}/confidence`, { confidence }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['flashcard-decks'] }),
  });

  const cards = selectedDeck?.flashcards || [];
  const currentCard = cards[cardIndex];

  const next = () => { setFlipped(false); setCardIndex(i => Math.min(i + 1, cards.length - 1)); };
  const prev = () => { setFlipped(false); setCardIndex(i => Math.max(i - 1, 0)); };

  if (!selectedDeck) {
    return (
      <AppShell title="Flashcards">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">{decks.length} decks</p>
            <Link href="/flashcards/generate">
              <button className="btn-primary flex items-center gap-2 text-sm">
                <Plus className="w-4 h-4" /> Generate with AI
              </button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 gap-4">{[1,2,3,4].map(i => <div key={i} className="skeleton h-32" />)}</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {decks.map((deck: any) => (
                <motion.button
                  key={deck.id}
                  whileHover={{ y: -4, scale: 1.02 }}
                  onClick={() => { setSelectedDeck(deck); setCardIndex(0); setFlipped(false); }}
                  className="card text-left space-y-3 cursor-pointer hover:border-purple-500/50"
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${deck.color}30` }}>
                    <Layers className="w-6 h-6" style={{ color: deck.color }} />
                  </div>
                  <div>
                    <h3 className="font-semibold">{deck.title}</h3>
                    <p className="text-sm text-muted-foreground">{deck._count?.flashcards || deck.flashcards?.length || 0} cards</p>
                  </div>
                </motion.button>
              ))}
              {decks.length === 0 && (
                <div className="col-span-3 card text-center py-12 text-muted-foreground">
                  <Layers className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No flashcard decks yet</p>
                  <Link href="/flashcards/generate"><button className="btn-primary mt-4 text-sm">Generate with AI</button></Link>
                </div>
              )}
            </div>
          )}
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Study Flashcards">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Back & progress */}
        <div className="flex items-center justify-between">
          <button onClick={() => setSelectedDeck(null)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
            <ChevronLeft className="w-4 h-4" /> {selectedDeck.title}
          </button>
          <span className="text-sm text-muted-foreground">{cardIndex + 1} / {cards.length}</span>
        </div>

        <div className="w-full bg-secondary rounded-full h-1.5">
          <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${((cardIndex + 1) / cards.length) * 100}%` }} />
        </div>

        {/* Flashcard */}
        {currentCard && (
          <motion.div
            className="relative h-64 cursor-pointer"
            onClick={() => setFlipped(f => !f)}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={flipped ? 'back' : 'front'}
                initial={{ rotateY: 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: -90, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 card flex flex-col items-center justify-center p-8 text-center"
              >
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
                  {flipped ? '✅ Answer' : '❓ Question'}
                </p>
                <p className={cn('font-medium leading-relaxed', flipped ? 'text-lg' : 'text-xl')}>
                  {flipped ? currentCard.back : currentCard.front}
                </p>
                <p className="text-xs text-muted-foreground mt-6">Click to {flipped ? 'see question' : 'reveal answer'}</p>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}

        {/* Confidence rating (shown after flip) */}
        {flipped && currentCard && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card space-y-3">
            <p className="text-sm font-medium text-center">How well did you know this?</p>
            <div className="flex gap-2">
              {[
                { label: 'Forgot', value: 0, color: 'bg-red-500/20 text-red-400 hover:bg-red-500/40' },
                { label: 'Hard', value: 1, color: 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/40' },
                { label: 'OK', value: 2, color: 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/40' },
                { label: 'Good', value: 3, color: 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/40' },
                { label: 'Easy', value: 4, color: 'bg-green-500/20 text-green-400 hover:bg-green-500/40' },
                { label: 'Perfect', value: 5, color: 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/40' },
              ].map(({ label, value, color }) => (
                <button
                  key={value}
                  onClick={() => { rateCard.mutate({ id: currentCard.id, confidence: value }); next(); }}
                  className={cn('flex-1 py-2 rounded-xl text-xs font-medium transition-all', color)}
                >
                  {label}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <button onClick={prev} disabled={cardIndex === 0} className="btn-ghost flex items-center gap-2 text-sm disabled:opacity-40">
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          <button onClick={() => { setCardIndex(0); setFlipped(false); }} className="btn-ghost text-sm">
            <RotateCcw className="w-4 h-4" />
          </button>
          <button onClick={next} disabled={cardIndex === cards.length - 1} className="btn-ghost flex items-center gap-2 text-sm disabled:opacity-40">
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </AppShell>
  );
}
