import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

export const subjectsRouter = Router();
subjectsRouter.use(authenticate);

const subjectSchema = z.object({
  name: z.string().min(1).max(100),
  color: z.string().optional(),
  icon: z.string().optional(),
  description: z.string().optional(),
});

subjectsRouter.get('/', async (req: AuthRequest, res, next) => {
  try {
    const subjects = await prisma.subject.findMany({
      where: { userId: req.userId },
      include: { topics: { orderBy: { order: 'asc' } } },
      orderBy: { createdAt: 'asc' },
    });
    res.json(subjects);
  } catch (err) { next(err); }
});

subjectsRouter.post('/', async (req: AuthRequest, res, next) => {
  try {
    const data = subjectSchema.parse(req.body);
    const subject = await prisma.subject.create({
      data: { ...data, userId: req.userId! },
      include: { topics: true },
    });
    res.status(201).json(subject);
  } catch (err) { next(err); }
});

subjectsRouter.put('/:id', async (req: AuthRequest, res, next) => {
  try {
    const data = subjectSchema.partial().parse(req.body);
    const subject = await prisma.subject.findFirst({ where: { id: req.params.id, userId: req.userId } });
    if (!subject) throw new AppError('Subject not found', 404);

    const updated = await prisma.subject.update({
      where: { id: req.params.id },
      data,
      include: { topics: true },
    });
    res.json(updated);
  } catch (err) { next(err); }
});

subjectsRouter.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    const subject = await prisma.subject.findFirst({ where: { id: req.params.id, userId: req.userId } });
    if (!subject) throw new AppError('Subject not found', 404);
    await prisma.subject.delete({ where: { id: req.params.id } });
    res.json({ message: 'Subject deleted' });
  } catch (err) { next(err); }
});

subjectsRouter.put('/:id/topics/:topicId/complete', async (req: AuthRequest, res, next) => {
  try {
    const subject = await prisma.subject.findFirst({ where: { id: req.params.id, userId: req.userId } });
    if (!subject) throw new AppError('Subject not found', 404);

    const { completed } = z.object({ completed: z.boolean() }).parse(req.body);
    const topic = await prisma.topic.update({
      where: { id: req.params.topicId },
      data: { completed },
    });

    const allTopics = await prisma.topic.findMany({ where: { subjectId: req.params.id } });
    const progress = allTopics.length > 0
      ? (allTopics.filter(t => t.completed).length / allTopics.length) * 100
      : 0;

    await prisma.subject.update({ where: { id: req.params.id }, data: { progress } });
    res.json(topic);
  } catch (err) { next(err); }
});
