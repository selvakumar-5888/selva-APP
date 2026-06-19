import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { StudySession, Task, Subject, Note, FlashcardDeck, Flashcard } from '@/types'

// ─── Subjects ──────────────────────────────────────────────────────────────
export function useSubjects() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()

  const { data: subjects = [], isLoading } = useQuery({
    queryKey: ['subjects', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as Subject[]
    },
    enabled: !!user?.id,
  })

  const addSubject = useMutation({
    mutationFn: async (subject: Omit<Subject, 'id' | 'created_at' | 'user_id'>) => {
      const { data, error } = await supabase
        .from('subjects')
        .insert({ ...subject, user_id: user!.id })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['subjects', user?.id] }),
  })

  return { subjects, isLoading, addSubject: addSubject.mutateAsync }
}

// ─── Study Sessions ─────────────────────────────────────────────────────────
export function useStudySessions() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['sessions', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(20)
      if (error) throw error
      return data as StudySession[]
    },
    enabled: !!user?.id,
  })

  const createSession = useMutation({
    mutationFn: async (session: Omit<StudySession, 'id' | 'created_at' | 'user_id'>) => {
      const { data, error } = await supabase
        .from('study_sessions')
        .insert({ ...session, user_id: user!.id })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sessions', user?.id] }),
  })

  const completeSession = useMutation({
    mutationFn: async (sessionId: string) => {
      const { data, error } = await supabase
        .from('study_sessions')
        .update({ completed: true, completed_at: new Date().toISOString() })
        .eq('id', sessionId)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sessions', user?.id] }),
  })

  return { sessions, isLoading, createSession: createSession.mutateAsync, completeSession: completeSession.mutateAsync }
}

// ─── Tasks ─────────────────────────────────────────────────────────────────
export function useTasks() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as Task[]
    },
    enabled: !!user?.id,
  })

  const addTask = useMutation({
    mutationFn: async (task: Omit<Task, 'id' | 'created_at' | 'user_id'>) => {
      const { data, error } = await supabase
        .from('tasks')
        .insert({ ...task, user_id: user!.id })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] }),
  })

  const updateTask = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Task> }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] }),
  })

  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('tasks').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] }),
  })

  return { tasks, isLoading, addTask: addTask.mutateAsync, updateTask: updateTask.mutateAsync, deleteTask: deleteTask.mutateAsync }
}

// ─── Notes ─────────────────────────────────────────────────────────────────
export function useNotes() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ['notes', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user!.id)
        .order('updated_at', { ascending: false })
      if (error) throw error
      return data as Note[]
    },
    enabled: !!user?.id,
  })

  const saveNote = useMutation({
    mutationFn: async (note: Omit<Note, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
      const { data, error } = await supabase
        .from('notes')
        .insert({ ...note, user_id: user!.id })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notes', user?.id] }),
  })

  return { notes, isLoading, saveNote: saveNote.mutateAsync }
}

// ─── Flashcards ────────────────────────────────────────────────────────────
export function useFlashcardDecks() {
  const { user } = useAuthStore()

  const { data: decks = [], isLoading } = useQuery({
    queryKey: ['flashcard-decks', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('flashcard_decks')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as FlashcardDeck[]
    },
    enabled: !!user?.id,
  })

  return { decks, isLoading }
}

export function useFlashcards(deckId: string) {
  const { data: flashcards = [], isLoading } = useQuery({
    queryKey: ['flashcards', deckId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('flashcards')
        .select('*')
        .eq('deck_id', deckId)
      if (error) throw error
      return data as Flashcard[]
    },
    enabled: !!deckId,
  })

  return { flashcards, isLoading }
}
