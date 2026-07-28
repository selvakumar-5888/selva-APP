import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

export const analyticsRouter = Router();
analyticsRouter.use(authenticate);

analyticsRouter.get('/weekly', async (req: AuthRequest, res, next) => {
  try {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);

    const sessions = await prisma.studySession.findMany({
      where: { userId: req.userId!, status: 'COMPLETED', startTime: { gte: weekStart } },
      include: { subject: { select: { name: true, color: true } } },
    });

    const byDay: Record<string, number> = {};
    const bySubject: Record<string, { minutes: number; color: string }> = {};

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      byDay[d.toLocaleDateString('en-US', { weekday: 'short' })] = 0;
    }

    sessions.forEach(s => {
      const day = new Date(s.startTime).toLocaleDateString('en-US', { weekday: 'short' });
      byDay[day] = (byDay[day] || 0) + (s.actualMinutes || 0);
      if (s.subject) {
        if (!bySubject[s.subject.name]) bySubject[s.subject.name] = { minutes: 0, color: s.subject.color };
        bySubject[s.subject.name].minutes += s.actualMinutes || 0;
      }
    });

    res.json({
      totalMinutes: sessions.reduce((a, s) => a + (s.actualMinutes || 0), 0),
      totalSessions: sessions.length,
      avgFocusScore: sessions.length > 0
        ? Math.round(sessions.reduce((a, s) => a + (s.focusScore || 0), 0) / sessions.length)
        : 0,
      byDay: Object.entries(byDay).map(([day, minutes]) => ({ day, minutes })),
      bySubject: Object.entries(bySubject).map(([name, data]) => ({ name, ...data })),
    });
  } catch (err) { next(err); }
});

analyticsRouter.get('/monthly', async (req: AuthRequest, res, next) => {
  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const sessions = await prisma.studySession.findMany({
      where: { userId: req.userId!, status: 'COMPLETED', startTime: { gte: monthStart } },
    });

    const byWeek: Record<string, number> = { 'Week 1': 0, 'Week 2': 0, 'Week 3': 0, 'Week 4': 0 };
    sessions.forEach(s => {
      const day = new Date(s.startTime).getDate();
      const week = `Week ${Math.ceil(day / 7)}`;
      byWeek[week] = (byWeek[week] || 0) + (s.actualMinutes || 0);
    });

    res.json({
      totalMinutes: sessions.reduce((a, s) => a + (s.actualMinutes || 0), 0),
      totalSessions: sessions.length,
      byWeek: Object.entries(byWeek).map(([week, minutes]) => ({ week, minutes })),
    });
  } catch (err) { next(err); }
});

analyticsRouter.get('/heatmap', async (req: AuthRequest, res, next) => {
  try {
    const yearAgo = new Date();
    yearAgo.setFullYear(yearAgo.getFullYear() - 1);

    const sessions = await prisma.studySession.findMany({
      where: { userId: req.userId!, status: 'COMPLETED', startTime: { gte: yearAgo } },
      select: { startTime: true, actualMinutes: true },
    });

    const heatmap: Record<string, number> = {};
    sessions.forEach(s => {
      const key = s.startTime.toISOString().split('T')[0];
      heatmap[key] = (heatmap[key] || 0) + (s.actualMinutes || 0);
    });

    res.json(Object.entries(heatmap).map(([date, minutes]) => ({ date, minutes })));
  } catch (err) { next(err); }
});
