import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

export const rewardsRouter = Router();
rewardsRouter.use(authenticate);

rewardsRouter.get('/streak', async (req: AuthRequest, res, next) => {
  try {
    const streak = await prisma.streak.findUnique({ where: { userId: req.userId } });
    res.json(streak || { currentStreak: 0, longestStreak: 0, totalDays: 0 });
  } catch (err) { next(err); }
});

rewardsRouter.get('/badges', async (req: AuthRequest, res, next) => {
  try {
    const allBadges = await prisma.badge.findMany();
    const earned = await prisma.userBadge.findMany({
      where: { userId: req.userId },
      include: { badge: true },
    });
    const earnedIds = new Set(earned.map(e => e.badgeId));

    res.json({
      earned: earned.map(e => ({ ...e.badge, earnedAt: e.earnedAt })),
      locked: allBadges.filter(b => !earnedIds.has(b.id)),
    });
  } catch (err) { next(err); }
});

rewardsRouter.get('/xp', async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { xpPoints: true },
    });
    const level = Math.floor((user?.xpPoints || 0) / 500) + 1;
    const xpInLevel = (user?.xpPoints || 0) % 500;
    res.json({ xp: user?.xpPoints || 0, level, xpInLevel, xpToNextLevel: 500 - xpInLevel });
  } catch (err) { next(err); }
});
