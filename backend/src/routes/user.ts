import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

export const userRouter = Router();
userRouter.use(authenticate);

const profileSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  avatar: z.string().url().optional(),
  role: z.enum(['STUDENT', 'TEACHER', 'PROFESSIONAL']).optional(),
});

const onboardingSchema = z.object({
  role: z.enum(['STUDENT', 'TEACHER', 'PROFESSIONAL']),
  subjects: z.array(z.string()),
  goals: z.object({
    dailyMinutes: z.number().min(15).max(600),
    weeklyDays: z.number().min(1).max(7),
  }),
  studyStyle: z.enum(['VISUAL', 'AUDITORY', 'READING', 'KINESTHETIC']),
});

userRouter.put('/profile', async (req: AuthRequest, res, next) => {
  try {
    const data = profileSchema.parse(req.body);
    const user = await prisma.user.update({
      where: { id: req.userId },
      data,
      select: { id: true, name: true, email: true, role: true, avatar: true, xpPoints: true },
    });
    res.json(user);
  } catch (err) { next(err); }
});

userRouter.post('/onboarding', async (req: AuthRequest, res, next) => {
  try {
    const { role, subjects: subjectNames, goals, studyStyle } = onboardingSchema.parse(req.body);

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: req.userId },
        data: { role, onboardingComplete: true },
      });

      await tx.userPreferences.upsert({
        where: { userId: req.userId },
        update: { studyStyle, dailyGoalMinutes: goals.dailyMinutes, weeklyGoalDays: goals.weeklyDays },
        create: { userId: req.userId!, studyStyle, dailyGoalMinutes: goals.dailyMinutes, weeklyGoalDays: goals.weeklyDays },
      });

      const colors = ['#7C3AED', '#0EA5E9', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#8B5CF6', '#14B8A6'];
      for (let i = 0; i < subjectNames.length; i++) {
        await tx.subject.create({
          data: { userId: req.userId!, name: subjectNames[i], color: colors[i % colors.length] },
        });
      }
    });

    res.json({ message: 'Onboarding complete', redirect: '/ai-generating' });
  } catch (err) { next(err); }
});

userRouter.get('/preferences', async (req: AuthRequest, res, next) => {
  try {
    const prefs = await prisma.userPreferences.findUnique({ where: { userId: req.userId } });
    res.json(prefs);
  } catch (err) { next(err); }
});
