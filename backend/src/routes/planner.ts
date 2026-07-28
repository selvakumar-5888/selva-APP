import { Router } from 'express';
import { z } from 'zod';
import axios from 'axios';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

export const plannerRouter = Router();
plannerRouter.use(authenticate);

plannerRouter.get('/weekly', async (req: AuthRequest, res, next) => {
  try {
    const { date } = req.query as { date?: string };
    const startDate = date ? new Date(date) : new Date();
    startDate.setHours(0, 0, 0, 0);
    const dayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - dayOfWeek);
    const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);

    const sessions = await prisma.studySession.findMany({
      where: { userId: req.userId, startTime: { gte: startDate, lt: endDate } },
      include: { subject: { select: { id: true, name: true, color: true } } },
      orderBy: { startTime: 'asc' },
    });
    res.json({ week: startDate.toISOString(), sessions });
  } catch (err) { next(err); }
});

plannerRouter.get('/monthly', async (req: AuthRequest, res, next) => {
  try {
    const { month } = req.query as { month?: string };
    const [year, mon] = month ? month.split('-').map(Number) : [new Date().getFullYear(), new Date().getMonth() + 1];
    const startDate = new Date(year, mon - 1, 1);
    const endDate = new Date(year, mon, 1);

    const sessions = await prisma.studySession.findMany({
      where: { userId: req.userId, startTime: { gte: startDate, lt: endDate } },
      include: { subject: { select: { id: true, name: true, color: true } } },
      orderBy: { startTime: 'asc' },
    });
    res.json({ month: `${year}-${String(mon).padStart(2, '0')}`, sessions });
  } catch (err) { next(err); }
});

const sessionSchema = z.object({
  title: z.string().min(1),
  subjectId: z.string().optional(),
  startTime: z.string().datetime(),
  plannedMinutes: z.number().min(5).max(480),
  notes: z.string().optional(),
});

plannerRouter.post('/sessions', async (req: AuthRequest, res, next) => {
  try {
    const data = sessionSchema.parse(req.body);
    const session = await prisma.studySession.create({
      data: { ...data, userId: req.userId!, startTime: new Date(data.startTime), status: 'ACTIVE' },
      include: { subject: { select: { id: true, name: true, color: true } } },
    });
    res.status(201).json(session);
  } catch (err) { next(err); }
});

plannerRouter.put('/sessions/:id', async (req: AuthRequest, res, next) => {
  try {
    const session = await prisma.studySession.findFirst({ where: { id: req.params.id, userId: req.userId } });
    if (!session) throw new AppError('Session not found', 404);

    const data = sessionSchema.partial().parse(req.body);
    const updated = await prisma.studySession.update({
      where: { id: req.params.id },
      data: { ...data, startTime: data.startTime ? new Date(data.startTime) : undefined },
      include: { subject: { select: { id: true, name: true, color: true } } },
    });
    res.json(updated);
  } catch (err) { next(err); }
});

plannerRouter.delete('/sessions/:id', async (req: AuthRequest, res, next) => {
  try {
    const session = await prisma.studySession.findFirst({ where: { id: req.params.id, userId: req.userId } });
    if (!session) throw new AppError('Session not found', 404);
    await prisma.studySession.delete({ where: { id: req.params.id } });
    res.json({ message: 'Session deleted' });
  } catch (err) { next(err); }
});

plannerRouter.post('/regenerate', async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: { preferences: true, subjects: { include: { topics: true } } },
    });
    if (!user) throw new AppError('User not found', 404);

    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    const response = await axios.post(`${aiServiceUrl}/generate-plan`, {
      subjects: user.subjects.map(s => ({ name: s.name, topics: s.topics.map(t => t.name) })),
      weeklyHours: Math.round((user.preferences?.dailyGoalMinutes || 120) * (user.preferences?.weeklyGoalDays || 5) / 60),
      goals: { dailyMinutes: user.preferences?.dailyGoalMinutes || 120 },
    });

    res.json(response.data);
  } catch (err) { next(err); }
});
