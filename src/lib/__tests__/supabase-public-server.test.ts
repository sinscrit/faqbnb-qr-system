import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createClient } from '@supabase/supabase-js';

vi.mock('@supabase/supabase-js', () => ({ createClient: vi.fn(() => ({ anonymous: true })) }));

import { createPublicSupabaseServer } from '@/lib/supabase-public-server';

describe('public Supabase server client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://project.example.test';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-publishable-key';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'must-never-be-read';
  });

  it('uses only the anon key and disables every session mechanism', () => {
    expect(createPublicSupabaseServer()).toEqual({ anonymous: true });
    expect(createClient).toHaveBeenCalledWith(
      'https://project.example.test',
      'anon-publishable-key',
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      }
    );
    expect(JSON.stringify((createClient as ReturnType<typeof vi.fn>).mock.calls)).not.toContain('must-never-be-read');
  });
});
