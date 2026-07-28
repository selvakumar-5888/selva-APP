import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

export const examsRouter = Router();
examsRouter.use(authenticate);

const examSchema = z.object({
  title: z.string().min(1).max(200),
  date: z.string().datetime(),
  subjectId: z.string().optional(),
  duration: z.number().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
});

examsRouter.get('/', async (req: AuthRequest, res, next) => {
  try {
    const exams = await prisma.exam.findMany({
      where: { userId: req.userId },
      include: { subject: { select: { id: true, name: true, color: true } } },
      orderBy: { date: 'asc' },
    });
    res.json(exams);
  } catch (err) { next(err); }
});

examsRouter.post('/', async (req: AuthRequest, res, next) => {
  try {
    const data = examSchema.parse(req.body);
    const exam = await prisma.exam.create({
      data: { ...data, userId: req.userId!, date: new Date(data.date) },
      include: { subject: { select: { id: true, name: true, color: true } } },
    });
    res.status(201).json(exam);
  } catch (err) { next(err); }
});

examsRouter.put('/:id', async (req: AuthRequest, res, next) => {
  try {
    const exam = await prisma.exam.findFirst({ where: { id: req.params.id, userId: req.userId } });
    if (!exam) throw new AppError('Exam not found', 404);
    const data = examSchema.partial().extend({ completed: z.boolean().optional(), score: z.number().optional() }).parse(req.body);
    const updated = await prisma.exam.update({
      where: { id: req.params.id },
      data: { ...data, date: data.date ? new Date(data.date) : undefined },
      include: { subject: { select: { id: true, name: true, color: true } } },
    });
    res.json(updated);
  } catch (err) { next(err); }
});

examsRouter.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    const exam = await prisma.exam.findFirst({ where: { id: req.params.id, userId: req.userId } });
    if (!exam) throw new AppError('Exam not found', 404);
    await prisma.exam.delete({ where: { id: req.params.id } });
    res.json({ message: 'Exam deleted' });
  } catch (err) { next(err); }
});
