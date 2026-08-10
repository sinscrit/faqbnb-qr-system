import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createSupabaseServer } from '@/lib/supabase-server';
import { parseJsonRequest, updatePasswordRequestSchema } from '@/lib/auth-flow';
import { isTrustedAuthMutation } from '@/lib/auth-origin';
import { failWithClearedAuthSession } from '@/lib/auth-session-cleanup';
import {
  resolveCurrentUserContext,
  type CurrentUserContextClient,
} from '@/lib/current-user-context';
import { isRecoveryIntent, RECOVERY_INTENT_COOKIE } from '@/lib/recovery-intent';

export const dynamic = 'force-dynamic';
const headers = { 'Cache-Control': 'no-store' } as const;

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const recoveryIntent = cookieStore.get(RECOVERY_INTENT_COOKIE)?.value;
  cookieStore.set(RECOVERY_INTENT_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/api/auth/recovery/update',
    maxAge: 0,
  });

  if (!isTrustedAuthMutation(request)) {
    return NextResponse.json(
      { success: false, error: { code: 'INVALID_REQUEST', message: 'This request could not be accepted.' } },
      { status: 400, headers }
    );
  }

  const parsed = await parseJsonRequest(request, updatePasswordRequestSchema);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: 'INVALID_REQUEST', message: 'Check the passwords and try again.' } },
      { status: 400, headers }
    );
  }

  try {
    const supabase = await createSupabaseServer();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (userError || typeof userId !== 'string' || !isRecoveryIntent(recoveryIntent, userId)) {
      return NextResponse.json(
        { success: false, error: { code: 'RECOVERY_SESSION_REQUIRED', message: 'This recovery link is invalid or has expired.' } },
        { status: 401, headers }
      );
    }

    const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
    if (error) {
      return NextResponse.json(
        { success: false, error: { code: 'RECOVERY_SESSION_REQUIRED', message: 'This recovery link is invalid or has expired.' } },
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
    return NextResponse.json({ success: true, next: context.context.next }, { status: 200, headers });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'RECOVERY_UNAVAILABLE', message: 'Password recovery is temporarily unavailable. Please try again.' } },
      { status: 503, headers }
    );
  }
}
