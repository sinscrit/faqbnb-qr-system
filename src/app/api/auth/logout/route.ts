import { NextResponse } from 'next/server';
import { z } from 'zod';
import { clearAuthSession } from '@/lib/auth-session-cleanup';
import { parseJsonRequest } from '@/lib/auth-flow';
import { isTrustedAuthMutation } from '@/lib/auth-origin';
import { createSupabaseServer } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

const RESPONSE_HEADERS = { 'Cache-Control': 'no-store' } as const;
const logoutRequestSchema = z.object({}).strict();

/** Cookie-backed logout. GET is deliberately not exported. */
export async function POST(request: Request) {
  if (!isTrustedAuthMutation(request)) {
    return NextResponse.json(
      { success: false, error: { code: 'INVALID_REQUEST', message: 'This request could not be accepted.' } },
      { status: 400, headers: RESPONSE_HEADERS }
    );
  }

  const parsed = await parseJsonRequest(request, logoutRequestSchema);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: 'INVALID_REQUEST', message: 'This request could not be accepted.' } },
      { status: 400, headers: RESPONSE_HEADERS }
    );
  }

  try {
    const client = await createSupabaseServer();
    if (await clearAuthSession(client)) {
      return NextResponse.json(
        { success: true, next: '/login' },
        { status: 200, headers: RESPONSE_HEADERS }
      );
    }
  } catch {
    // The response below requests browser cookie cleanup and remains fail-closed.
  }

  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'LOGOUT_UNAVAILABLE',
        message: 'We could not sign you out. Please try again.',
      },
    },
    {
      status: 503,
      headers: { ...RESPONSE_HEADERS, 'Clear-Site-Data': '"cookies"' },
    }
  );
}
