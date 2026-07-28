import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import axios from 'axios';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

export const aiRouter = Router();
aiRouter.use(authenticate);

const aiLimiter = rateLimit({ windowMs: 60 * 1000, max: 10, message: { error: 'Too many AI requests. Please wait a minute.' } });

const AI_URL = () => process.env.AI_SERVICE_URL || 'http://localhost:8000';

aiRouter.post('/generate-plan', aiLimiter, async (req: AuthRequest, res, next) => {
  try {
    const schema = z.object({ weeklyHours: z.number().optional() });
    schema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: { preferences: true, subjects: { include: { topics: true } } },
    });

    const response = await axios.post(`${AI_URL()}/generate-plan`, {
      subjects: user?.subjects.map(s => ({ name: s.name, topics: s.topics.map(t => ({ name: t.name, completed: t.completed })) })),
      weeklyHours: req.body.weeklyHours || Math.round((user?.preferences?.dailyGoalMinutes || 120) * (user?.preferences?.weeklyGoalDays || 5) / 60),
      studyStyle: user?.preferences?.studyStyle || 'VISUAL',
    });

    res.json(response.data);
  } catch (err) { next(err); }
});

aiRouter.post('/generate-flashcards', aiLimiter, async (req: AuthRequest, res, next) => {
  try {
    const { content, deckTitle } = z.object({ content: z.string().min(10), deckTitle: z.string().optional() }).parse(req.body);
    const response = await axios.post(`${AI_URL()}/generate-flashcards`, { content, deckTitle });
    res.json(response.data);
  } catch (err) { next(err); }
});

aiRouter.post('/summarize-notes', aiLimiter, async (req: AuthRequest, res, next) => {
  try {
    const { content, noteId } = z.object({ content: z.string().min(10), noteId: z.string().optional() }).parse(req.body);
    const response = await axios.post(`${AI_URL()}/summarize-notes`, { content });

    if (noteId) {
      await prisma.note.updateMany({
        where: { id: noteId, userId: req.userId },
        data: { summary: response.data.summary },
      });
    }

    res.json(response.data);
  } catch (err) { next(err); }
});

aiRouter.get('/insights', aiLimiter, async (req: AuthRequest, res, next) => {
  try {
    const response = await axios.get(`${AI_URL()}/insights`, { params: { user_id: req.userId } });
    res.json(response.data);
  } catch (err) { next(err); }
});
