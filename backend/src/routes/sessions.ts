import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

export const sessionsRouter = Router();
sessionsRouter.use(authenticate);

sessionsRouter.post('/start', async (req: AuthRequest, res, next) => {
  try {
    const schema = z.object({
      title: z.string().min(1),
      subjectId: z.string().optional(),
      plannedMinutes: z.number().min(1).max(480),
    });
    const data = schema.parse(req.body);
    const session = await prisma.studySession.create({
      data: { ...data, userId: req.userId!, startTime: new Date(), status: 'ACTIVE' },
      include: { subject: { select: { id: true, name: true, color: true } } },
    });
    res.status(201).json(session);
  } catch (err) { next(err); }
});

sessionsRouter.put('/:id/complete', async (req: AuthRequest, res, next) => {
  try {
    const session = await prisma.studySession.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!session) throw new AppError('Session not found', 404);

    const schema = z.object({
      actualMinutes: z.number().min(0),
      pomodorosCompleted: z.number().min(0).optional(),
      focusScore: z.number().min(0).max(100).optional(),
      notes: z.string().optional(),
    });
    const data = schema.parse(req.body);

    const updated = await prisma.studySession.update({
      where: { id: req.params.id },
      data: { ...data, endTime: new Date(), status: 'COMPLETED' },
      include: { subject: { select: { id: true, name: true, color: true } } },
    });

    // Update streak
    await updateStreak(req.userId!);

    res.json(updated);
  } catch (err) { next(err); }
});

sessionsRouter.get('/history', async (req: AuthRequest, res, next) => {
  try {
    const { page = '1', limit = '20' } = req.query as Record<string, string>;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const sessions = await prisma.studySession.findMany({
      where: { userId: req.userId, status: 'COMPLETED' },
      include: { subject: { select: { id: true, name: true, color: true } } },
      orderBy: { startTime: 'desc' },
      skip,
      take: parseInt(limit),
    });
    res.json(sessions);
  } catch (err) { next(err); }
});

async function updateStreak(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

  const streak = await prisma.streak.findUnique({ where: { userId } });

  if (!streak) {
    await prisma.streak.create({
      data: { userId, currentStreak: 1, longestStreak: 1, lastStudyDate: new Date(), totalDays: 1 },
    });
    return;
  }

  const lastDate = streak.lastStudyDate ? new Date(streak.lastStudyDate) : null;
  if (lastDate) lastDate.setHours(0, 0, 0, 0);

  if (lastDate?.getTime() === today.getTime()) return; // already studied today

  const newStreak = lastDate?.getTime() === yesterday.getTime()
    ? streak.currentStreak + 1
    : 1;

  await prisma.streak.update({
    where: { userId },
    data: {
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, streak.longestStreak),
      lastStudyDate: new Date(),
      totalDays: streak.totalDays + 1,
    },
  });
}
