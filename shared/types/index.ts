// Shared TypeScript types used by both frontend and backend

export type Role = 'STUDENT' | 'TEACHER' | 'PROFESSIONAL';
export type StudyStyle = 'VISUAL' | 'AUDITORY' | 'READING' | 'KINESTHETIC';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type FlashcardDifficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type SessionStatus = 'ACTIVE' | 'COMPLETED' | 'ABANDONED';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: Role;
  xpPoints: number;
  onboardingComplete: boolean;
  createdAt: string;
}

export interface UserPreferences {
  studyStyle: StudyStyle;
  dailyGoalMinutes: number;
  weeklyGoalDays: number;
  reminderEnabled: boolean;
  reminderTime: string;
  theme: string;
  notificationsEnabled: boolean;
  pomodoroLength: number;
  shortBreakLength: number;
  longBreakLength: number;
}

export interface Subject {
  id: string;
  name: string;
  color: string;
  icon?: string;
  description?: string;
  progress: number;
  topics: Topic[];
  createdAt: string;
}

export interface Topic {
  id: string;
  subjectId: string;
  name: string;
  completed: boolean;
  order: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  completedAt?: string;
  subject?: Pick<Subject, 'id' | 'name' | 'color'>;
  createdAt: string;
}

export interface StudySession {
  id: string;
  title: string;
  startTime: string;
  endTime?: string;
  plannedMinutes: number;
  actualMinutes?: number;
  status: SessionStatus;
  pomodorosCompleted: number;
  focusScore?: number;
  notes?: string;
  subject?: Pick<Subject, 'id' | 'name' | 'color'>;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  summary?: string;
  tags: string[];
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FlashcardDeck {
  id: string;
  title: string;
  description?: string;
  color: string;
  flashcards: Flashcard[];
  _count?: { flashcards: number };
  createdAt: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  difficulty: FlashcardDifficulty;
  confidence: number;
  nextReview?: string;
  reviewCount: number;
}

export interface Exam {
  id: string;
  title: string;
  date: string;
  duration?: number;
  location?: string;
  notes?: string;
  completed: boolean;
  score?: number;
  subject?: Pick<Subject, 'id' | 'name' | 'color'>;
}

export interface Streak {
  currentStreak: number;
  longestStreak: number;
  totalDays: number;
  lastStudyDate?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: string;
  earnedAt?: string;
}

export interface AIInsight {
  type: string;
  title: string;
  message: string;
  action?: string;
  priority: 'low' | 'medium' | 'high';
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}
