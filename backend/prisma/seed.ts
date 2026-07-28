import { PrismaClient, Role, StudyStyle, TaskStatus, TaskPriority, FlashcardDifficulty } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create test user
  const passwordHash = await bcrypt.hash('password123', 10);

  const user = await prisma.user.upsert({
    where: { email: 'demo@studymind.ai' },
    update: {},
    create: {
      email: 'demo@studymind.ai',
      name: 'Alex Johnson',
      passwordHash,
      role: Role.STUDENT,
      onboardingComplete: true,
      xpPoints: 2450,
    },
  });

  // Preferences
  await prisma.userPreferences.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      studyStyle: StudyStyle.VISUAL,
      dailyGoalMinutes: 120,
      weeklyGoalDays: 5,
      reminderEnabled: true,
      reminderTime: '09:00',
      theme: 'dark',
      pomodoroLength: 25,
    },
  });

  // Subjects
  const math = await prisma.subject.create({
    data: {
      userId: user.id,
      name: 'Mathematics',
      color: '#7C3AED',
      icon: '📐',
      progress: 65,
      topics: {
        create: [
          { name: 'Calculus - Derivatives', completed: true, order: 1 },
          { name: 'Calculus - Integrals', completed: true, order: 2 },
          { name: 'Linear Algebra', completed: false, order: 3 },
          { name: 'Differential Equations', completed: false, order: 4 },
          { name: 'Statistics & Probability', completed: false, order: 5 },
        ],
      },
    },
  });

  const physics = await prisma.subject.create({
    data: {
      userId: user.id,
      name: 'Physics',
      color: '#0EA5E9',
      icon: '⚛️',
      progress: 40,
      topics: {
        create: [
          { name: 'Mechanics', completed: true, order: 1 },
          { name: 'Thermodynamics', completed: false, order: 2 },
          { name: 'Electromagnetism', completed: false, order: 3 },
          { name: 'Quantum Mechanics', completed: false, order: 4 },
        ],
      },
    },
  });

  const cs = await prisma.subject.create({
    data: {
      userId: user.id,
      name: 'Computer Science',
      color: '#10B981',
      icon: '💻',
      progress: 80,
      topics: {
        create: [
          { name: 'Data Structures', completed: true, order: 1 },
          { name: 'Algorithms', completed: true, order: 2 },
          { name: 'Operating Systems', completed: true, order: 3 },
          { name: 'Database Systems', completed: false, order: 4 },
          { name: 'Computer Networks', completed: false, order: 5 },
        ],
      },
    },
  });

  // Tasks
  await prisma.task.createMany({
    data: [
      {
        userId: user.id,
        subjectId: math.id,
        title: 'Complete calculus problem set',
        description: 'Chapter 5 exercises 1-20',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        order: 1,
      },
      {
        userId: user.id,
        subjectId: physics.id,
        title: 'Read thermodynamics chapter',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        order: 2,
      },
      {
        userId: user.id,
        subjectId: cs.id,
        title: 'Implement binary search tree',
        description: 'With insert, delete, and search operations',
        status: TaskStatus.DONE,
        priority: TaskPriority.HIGH,
        completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        order: 3,
      },
      {
        userId: user.id,
        title: 'Review notes before exam',
        status: TaskStatus.TODO,
        priority: TaskPriority.URGENT,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        order: 4,
      },
    ],
  });

  // Study sessions (past)
  const now = new Date();
  await prisma.studySession.createMany({
    data: [
      {
        userId: user.id,
        subjectId: math.id,
        title: 'Calculus Review',
        startTime: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        endTime: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000),
        plannedMinutes: 90,
        actualMinutes: 90,
        status: 'COMPLETED',
        pomodorosCompleted: 3,
        focusScore: 85,
      },
      {
        userId: user.id,
        subjectId: physics.id,
        title: 'Mechanics Deep Dive',
        startTime: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        endTime: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
        plannedMinutes: 60,
        actualMinutes: 55,
        status: 'COMPLETED',
        pomodorosCompleted: 2,
        focusScore: 78,
      },
      {
        userId: user.id,
        subjectId: cs.id,
        title: 'Algorithm Practice',
        startTime: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        endTime: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000 + 120 * 60 * 1000),
        plannedMinutes: 120,
        actualMinutes: 125,
        status: 'COMPLETED',
        pomodorosCompleted: 4,
        focusScore: 92,
      },
      {
        userId: user.id,
        subjectId: math.id,
        title: 'Linear Algebra Intro',
        startTime: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        endTime: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000 + 75 * 60 * 1000),
        plannedMinutes: 90,
        actualMinutes: 75,
        status: 'COMPLETED',
        pomodorosCompleted: 2,
        focusScore: 70,
      },
    ],
  });

  // Notes
  await prisma.note.createMany({
    data: [
      {
        userId: user.id,
        title: 'Calculus Key Formulas',
        content: '# Calculus Key Formulas\n\n## Derivatives\n- Power Rule: d/dx[x^n] = nx^(n-1)\n- Chain Rule: d/dx[f(g(x))] = f\'(g(x)) · g\'(x)\n\n## Integrals\n- ∫x^n dx = x^(n+1)/(n+1) + C\n- ∫e^x dx = e^x + C',
        tags: ['calculus', 'formulas', 'math'],
        pinned: true,
      },
      {
        userId: user.id,
        title: 'Physics - Newton\'s Laws',
        content: '# Newton\'s Three Laws of Motion\n\n**First Law:** An object at rest stays at rest unless acted upon by an external force.\n\n**Second Law:** F = ma (Force equals mass times acceleration)\n\n**Third Law:** For every action, there is an equal and opposite reaction.',
        tags: ['physics', 'mechanics'],
        pinned: false,
      },
    ],
  });

  // Flashcard decks
  const deck1 = await prisma.flashcardDeck.create({
    data: {
      userId: user.id,
      title: 'Calculus Fundamentals',
      description: 'Key calculus concepts and formulas',
      color: '#7C3AED',
    },
  });

  await prisma.flashcard.createMany({
    data: [
      {
        deckId: deck1.id,
        front: 'What is the derivative of x²?',
        back: '2x\n\nUsing the power rule: d/dx[x^n] = nx^(n-1)',
        difficulty: FlashcardDifficulty.EASY,
        confidence: 4,
      },
      {
        deckId: deck1.id,
        front: 'What is the integral of sin(x)?',
        back: '-cos(x) + C',
        difficulty: FlashcardDifficulty.MEDIUM,
        confidence: 3,
      },
      {
        deckId: deck1.id,
        front: 'State the Fundamental Theorem of Calculus',
        back: 'If F is an antiderivative of f on [a,b], then:\n∫[a to b] f(x)dx = F(b) - F(a)',
        difficulty: FlashcardDifficulty.HARD,
        confidence: 2,
      },
    ],
  });

  // Exams
  await prisma.exam.createMany({
    data: [
      {
        userId: user.id,
        subjectId: math.id,
        title: 'Calculus Midterm',
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        duration: 120,
        location: 'Hall B, Room 201',
      },
      {
        userId: user.id,
        subjectId: physics.id,
        title: 'Physics Final Exam',
        date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        duration: 180,
        location: 'Main Hall',
      },
    ],
  });

  // Streak
  await prisma.streak.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      currentStreak: 7,
      longestStreak: 21,
      lastStudyDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
      totalDays: 45,
    },
  });

  // Badges
  const badges = await prisma.badge.createMany({
    data: [
      { name: 'First Session', description: 'Complete your first study session', icon: '🎯', condition: 'sessions_1', rarity: 'common' },
      { name: 'Week Warrior', description: 'Study 7 days in a row', icon: '🔥', condition: 'streak_7', rarity: 'rare' },
      { name: 'Century Club', description: 'Log 100 hours of study time', icon: '💯', condition: 'hours_100', rarity: 'epic' },
      { name: 'Task Master', description: 'Complete 50 tasks', icon: '✅', condition: 'tasks_50', rarity: 'rare' },
      { name: 'Flash Genius', description: 'Create 100 flashcards', icon: '⚡', condition: 'flashcards_100', rarity: 'common' },
    ],
    skipDuplicates: true,
  });

  const allBadges = await prisma.badge.findMany();
  if (allBadges.length > 0) {
    await prisma.userBadge.createMany({
      data: [
        { userId: user.id, badgeId: allBadges[0].id },
        { userId: user.id, badgeId: allBadges[1].id },
      ],
      skipDuplicates: true,
    });
  }

  console.log('✅ Database seeded successfully!');
  console.log('📧 Demo login: demo@studymind.ai / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
