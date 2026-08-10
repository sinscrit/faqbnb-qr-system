import { NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase-server';
import { loginRequestSchema, parseJsonRequest } from '@/lib/auth-flow';
import { isTrustedAuthMutation } from '@/lib/auth-origin';
import { failWithClearedAuthSession } from '@/lib/auth-session-cleanup';
import {
  resolveCurrentUserContext,
  type CurrentUserContextClient,
} from '@/lib/current-user-context';

export const dynamic = 'force-dynamic';
const headers = { 'Cache-Control': 'no-store' } as const;

export async function POST(request: Request) {
  if (!isTrustedAuthMutation(request)) {
    return NextResponse.json(
      { success: false, error: { code: 'INVALID_REQUEST', message: 'This request could not be accepted.' } },
      { status: 400, headers }
    );
  }
  const parsed = await parseJsonRequest(request, loginRequestSchema);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: 'INVALID_REQUEST', message: 'Enter a valid email and password.' } },
      { status: 400, headers }
    );
  }

  try {
    const supabase = await createSupabaseServer();
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    if (error) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Email or password is incorrect.' } },
        { status: 401, headers }
      );
    }

    const context = await resolveCurrentUserContext(
      supabase as unknown as CurrentUserContextClient
    );
    if (!context.success) {
      return failWithClearedAuthSession(supabase, NextResponse.json(
        { success: false, error: { code: context.error.code, message: context.error.message } },
        { status: context.error.status, headers }
      ));
    }

    return NextResponse.json(
      { success: true, next: context.context.next },
      { status: 200, headers }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'AUTH_UNAVAILABLE', message: 'Sign in is temporarily unavailable. Please try again.' } },
      { status: 503, headers }
    );
  }
}
