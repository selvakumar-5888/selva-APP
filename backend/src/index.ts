import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';

import { errorHandler } from './middleware/errorHandler';
import { authRouter } from './routes/auth';
import { userRouter } from './routes/user';
import { subjectsRouter } from './routes/subjects';
import { plannerRouter } from './routes/planner';
import { tasksRouter } from './routes/tasks';
import { sessionsRouter } from './routes/sessions';
import { analyticsRouter } from './routes/analytics';
import { notesRouter } from './routes/notes';
import { flashcardsRouter } from './routes/flashcards';
import { examsRouter } from './routes/exams';
import { rewardsRouter } from './routes/rewards';
import { aiRouter } from './routes/ai';

const app = express();
const PORT = process.env.PORT || 5000;

// Security & utilities
app.use(helmet());
app.use(compression());
app.use(morgan('dev'));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/subjects', subjectsRouter);
app.use('/api/planner', plannerRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/notes', notesRouter);
app.use('/api/flashcards', flashcardsRouter);
app.use('/api/exams', examsRouter);
app.use('/api/rewards', rewardsRouter);
app.use('/api/ai', aiRouter);

// Error handler (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 StudyMind API running on http://localhost:${PORT}`);
});

export default app;
