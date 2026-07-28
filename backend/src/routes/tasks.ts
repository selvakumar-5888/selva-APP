import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

export const tasksRouter = Router();
tasksRouter.use(authenticate);

const taskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  dueDate: z.string().datetime().optional(),
  subjectId: z.string().optional(),
});

tasksRouter.get('/', async (req: AuthRequest, res, next) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { userId: req.userId },
      include: { subject: { select: { id: true, name: true, color: true } } },
      orderBy: [{ status: 'asc' }, { priority: 'desc' }, { dueDate: 'asc' }],
    });
    res.json(tasks);
  } catch (err) { next(err); }
});

tasksRouter.post('/', async (req: AuthRequest, res, next) => {
  try {
    const data = taskSchema.parse(req.body);
    const task = await prisma.task.create({
      data: { ...data, userId: req.userId!, dueDate: data.dueDate ? new Date(data.dueDate) : undefined },
      include: { subject: { select: { id: true, name: true, color: true } } },
    });
    res.status(201).json(task);
  } catch (err) { next(err); }
});

tasksRouter.put('/:id', async (req: AuthRequest, res, next) => {
  try {
    const task = await prisma.task.findFirst({ where: { id: req.params.id, userId: req.userId } });
    if (!task) throw new AppError('Task not found', 404);

    const data = taskSchema.partial().parse(req.body);
    const updated = await prisma.task.update({
      where: { id: req.params.id },
      data: { ...data, dueDate: data.dueDate ? new Date(data.dueDate) : undefined },
      include: { subject: { select: { id: true, name: true, color: true } } },
    });
    res.json(updated);
  } catch (err) { next(err); }
});

tasksRouter.put('/:id/status', async (req: AuthRequest, res, next) => {
  try {
    const task = await prisma.task.findFirst({ where: { id: req.params.id, userId: req.userId } });
    if (!task) throw new AppError('Task not found', 404);

    const { status } = z.object({ status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']) }).parse(req.body);
    const updated = await prisma.task.update({
      where: { id: req.params.id },
      data: { status, completedAt: status === 'DONE' ? new Date() : null },
      include: { subject: { select: { id: true, name: true, color: true } } },
    });
    res.json(updated);
  } catch (err) { next(err); }
});

tasksRouter.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    const task = await prisma.task.findFirst({ where: { id: req.params.id, userId: req.userId } });
    if (!task) throw new AppError('Task not found', 404);
    await prisma.task.delete({ where: { id: req.params.id } });
    res.json({ message: 'Task deleted' });
  } catch (err) { next(err); }
});
