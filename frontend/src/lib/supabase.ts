import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import * as rawEnv from '$app/env/public';

let supabaseInstance: SupabaseClient | null = null;
const publicEnv = rawEnv as Record<string, string | undefined>;

export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance;

  const url = publicEnv['PUBLIC_SUPABASE_URL'];
  const key = publicEnv['PUBLIC_SUPABASE_ANON_KEY'];

  if (url && key && url.startsWith('http')) {
    supabaseInstance = createClient(url, key);
    return supabaseInstance;
  }

  return null;
}

export function isSupabaseConfigured(): boolean {
  const url = publicEnv['PUBLIC_SUPABASE_URL'];
  const key = publicEnv['PUBLIC_SUPABASE_ANON_KEY'];
  return !!(url && key && url.startsWith('http'));
}
