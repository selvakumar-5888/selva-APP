import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

export const flashcardsRouter = Router();
flashcardsRouter.use(authenticate);

flashcardsRouter.get('/decks', async (req: AuthRequest, res, next) => {
  try {
    const decks = await prisma.flashcardDeck.findMany({
      where: { userId: req.userId },
      include: { _count: { select: { flashcards: true } }, flashcards: { take: 3 } },
      orderBy: { updatedAt: 'desc' },
    });
    res.json(decks);
  } catch (err) { next(err); }
});

flashcardsRouter.post('/decks', async (req: AuthRequest, res, next) => {
  try {
    const schema = z.object({
      title: z.string().min(1).max(100),
      description: z.string().optional(),
      color: z.string().optional(),
      flashcards: z.array(z.object({
        front: z.string().min(1),
        back: z.string().min(1),
        difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
      })).optional(),
    });
    const { flashcards: cards, ...deckData } = schema.parse(req.body);
    const deck = await prisma.flashcardDeck.create({
      data: {
        ...deckData,
        userId: req.userId!,
        flashcards: cards ? { create: cards } : undefined,
      },
      include: { flashcards: true, _count: { select: { flashcards: true } } },
    });
    res.status(201).json(deck);
  } catch (err) { next(err); }
});

flashcardsRouter.put('/:id/confidence', async (req: AuthRequest, res, next) => {
  try {
    const { confidence } = z.object({ confidence: z.number().min(0).max(5) }).parse(req.body);
    const flashcard = await prisma.flashcard.findFirst({
      where: { id: req.params.id, deck: { userId: req.userId } },
    });
    if (!flashcard) throw new AppError('Flashcard not found', 404);

    const nextReview = calculateNextReview(confidence);
    const updated = await prisma.flashcard.update({
      where: { id: req.params.id },
      data: { confidence, nextReview, reviewCount: { increment: 1 } },
    });
    res.json(updated);
  } catch (err) { next(err); }
});

function calculateNextReview(confidence: number): Date {
  const days = [0, 1, 3, 7, 14, 30][confidence] || 1;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}
