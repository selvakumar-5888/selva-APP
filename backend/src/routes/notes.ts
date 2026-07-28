import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

export const notesRouter = Router();
notesRouter.use(authenticate);

const noteSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string(),
  tags: z.array(z.string()).optional(),
  pinned: z.boolean().optional(),
});

notesRouter.get('/', async (req: AuthRequest, res, next) => {
  try {
    const { search } = req.query as { search?: string };
    const notes = await prisma.note.findMany({
      where: {
        userId: req.userId,
        ...(search ? { OR: [{ title: { contains: search, mode: 'insensitive' } }, { content: { contains: search, mode: 'insensitive' } }] } : {}),
      },
      orderBy: [{ pinned: 'desc' }, { updatedAt: 'desc' }],
    });
    res.json(notes);
  } catch (err) { next(err); }
});

notesRouter.post('/', async (req: AuthRequest, res, next) => {
  try {
    const data = noteSchema.parse(req.body);
    const note = await prisma.note.create({ data: { ...data, userId: req.userId! } });
    res.status(201).json(note);
  } catch (err) { next(err); }
});

notesRouter.put('/:id', async (req: AuthRequest, res, next) => {
  try {
    const note = await prisma.note.findFirst({ where: { id: req.params.id, userId: req.userId } });
    if (!note) throw new AppError('Note not found', 404);
    const data = noteSchema.partial().parse(req.body);
    const updated = await prisma.note.update({ where: { id: req.params.id }, data });
    res.json(updated);
  } catch (err) { next(err); }
});

notesRouter.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    const note = await prisma.note.findFirst({ where: { id: req.params.id, userId: req.userId } });
    if (!note) throw new AppError('Note not found', 404);
    await prisma.note.delete({ where: { id: req.params.id } });
    res.json({ message: 'Note deleted' });
  } catch (err) { next(err); }
});
