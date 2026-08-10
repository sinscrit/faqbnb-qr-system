import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase';

/**
 * Anonymous, cookie-free server client for explicitly public database RPCs.
 * It uses the publishable anon key and can never acquire a user session.
 */
export function createPublicSupabaseServer() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  );
}
