import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, { // generic removed, using any
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Override getUser for development bypass
const originalGetUser = supabase.auth.getUser.bind(supabase.auth);
supabase.auth.getUser = async (...args) => {
  const bypass = import.meta.env.VITE_BYPASS_AUTH === 'true';
  if (bypass) {
    return { data: { user: { id: 'dev-user', email: 'dev@example.com' } as any }, error: null };
  }
  return originalGetUser(...args);
};

/** Helper to get current user ID respecting bypass */
export const getUserId = async (): Promise<string> => {
  const bypass = import.meta.env.VITE_BYPASS_AUTH === 'true';
  if (bypass) return 'dev-user';
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error('Not authenticated');
  return user.id;
};
