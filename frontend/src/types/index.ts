// ─── Supabase Database Types ───────────────────────────────────────────────
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>
      }
      subjects: {
        Row: Subject
        Insert: Omit<Subject, 'id' | 'created_at'>
        Update: Partial<Omit<Subject, 'id' | 'created_at'>>
      }
      study_sessions: {
        Row: StudySession
        Insert: Omit<StudySession, 'id' | 'created_at'>
        Update: Partial<Omit<StudySession, 'id' | 'created_at'>>
      }
      tasks: {
        Row: Task
        Insert: Omit<Task, 'id' | 'created_at'>
        Update: Partial<Omit<Task, 'id' | 'created_at'>>
      }
      notes: {
        Row: Note
        Insert: Omit<Note, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Note, 'id' | 'created_at'>>
      }
      flashcard_decks: {
        Row: FlashcardDeck
        Insert: Omit<FlashcardDeck, 'id' | 'created_at'>
        Update: Partial<Omit<FlashcardDeck, 'id' | 'created_at'>>
      }
      flashcards: {
        Row: Flashcard
        Insert: Omit<Flashcard, 'id' | 'created_at'>
        Update: Partial<Omit<Flashcard, 'id' | 'created_at'>>
      }
      study_groups: {
        Row: StudyGroup
        Insert: Omit<StudyGroup, 'id' | 'created_at'>
        Update: Partial<Omit<StudyGroup, 'id' | 'created_at'>>
      }
    }
  }
}

// ─── Domain Types ──────────────────────────────────────────────────────────
export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: 'student' | 'teacher' | 'researcher' | null
  study_style: 'visual' | 'auditory' | 'reading' | 'kinesthetic' | null
  daily_goal_hours: number
  streak_days: number
  total_study_hours: number
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

export interface Subject {
  id: string
  user_id: string
  name: string
  color: string
  icon: string
  exam_date: string | null
  progress: number
  created_at: string
}

export interface StudySession {
  id: string
  user_id: string
  subject_id: string | null
  title: string
  duration_minutes: number
  focus_level: 'low' | 'medium' | 'high'
  completed: boolean
  started_at: string | null
  completed_at: string | null
  notes: string | null
  created_at: string
}

export interface Task {
  id: string
  user_id: string
  subject_id: string | null
  title: string
  description: string | null
  status: 'todo' | 'in_progress' | 'done'
  priority: 'low' | 'medium' | 'high'
  due_date: string | null
  created_at: string
}

export interface Note {
  id: string
  user_id: string
  subject_id: string | null
  title: string
  content: string
  tags: string[]
  is_pinned: boolean
  created_at: string
  updated_at: string
}

export interface FlashcardDeck {
  id: string
  user_id: string
  subject_id: string | null
  title: string
  description: string | null
  card_count: number
  mastered_count: number
  created_at: string
}

export interface Flashcard {
  id: string
  deck_id: string
  user_id: string
  front: string
  back: string
  ease_factor: number
  interval_days: number
  next_review: string | null
  review_count: number
  created_at: string
}

export interface StudyGroup {
  id: string
  name: string
  description: string | null
  subject: string | null
  created_by: string
  member_count: number
  is_public: boolean
  created_at: string
}

// ─── UI / App Types ────────────────────────────────────────────────────────
export type NavTab = 'home' | 'focus' | 'insights' | 'profile'

export interface DailyStats {
  sessionsCompleted: number
  weeklyHours: number
  tasksDone: number
  tasksTotal: number
  streakDays: number
}

export interface OnboardingData {
  role: Profile['role']
  goals: string[]
  subjects: string[]
  study_style: Profile['study_style']
  daily_goal_hours: number
}
