import { NextRequest, NextResponse } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';
import { createSupabaseServer } from '@/lib/supabase-server';
import {
  CANONICAL_AUTH_DESTINATION,
  resolveCurrentUserContext,
  type CurrentUserContextClient,
} from '@/lib/current-user-context';
import { getTrustedAppOrigin } from '@/lib/auth-origin';
import { failWithClearedAuthSession } from '@/lib/auth-session-cleanup';
import {
  createRecoveryIntent,
  RECOVERY_INTENT_COOKIE,
  RECOVERY_INTENT_MAX_AGE_SECONDS,
} from '@/lib/recovery-intent';

const supportedOtpTypes = new Set<EmailOtpType>(['email', 'signup', 'recovery']);
export const dynamic = 'force-dynamic';

function safeRedirect(origin: string, path: '/login?notice=confirmation_failed' | '/forgot-password?notice=recovery_failed' | '/reset-password' | typeof CANONICAL_AUTH_DESTINATION) {
  return NextResponse.redirect(new URL(path, `${origin}/`), {
    headers: { 'Cache-Control': 'no-store' },
  });
}

export async function GET(request: NextRequest) {
  let origin: string;
  try {
    origin = getTrustedAppOrigin();
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'AUTH_CONFIGURATION_UNAVAILABLE', message: 'This link cannot be completed right now.' } },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const code = request.nextUrl.searchParams.get('code');
  const tokenHash = request.nextUrl.searchParams.get('token_hash');
  const rawType = request.nextUrl.searchParams.get('type');
  const flow = request.nextUrl.searchParams.get('flow');
  const recovery = rawType === 'recovery' || (!tokenHash && flow === 'recovery');
  let supabase: Awaited<ReturnType<typeof createSupabaseServer>> | null = null;
  let sessionEstablished = false;

  try {
    supabase = await createSupabaseServer();
    let verified = false;
    const hasCodeShape = Boolean(
      code &&
      code.length <= 4096 &&
      !tokenHash &&
      !rawType &&
      (flow === null || flow === 'recovery')
    );
    const hasTokenShape = Boolean(
      !code &&
      tokenHash &&
      tokenHash.length <= 4096 &&
      rawType &&
      supportedOtpTypes.has(rawType as EmailOtpType) &&
      (flow === null || (rawType === 'recovery' && flow === 'recovery'))
    );

    if (hasCodeShape) {
      verified = !(await supabase.auth.exchangeCodeForSession(code!)).error;
    } else if (hasTokenShape) {
      verified = !(await supabase.auth.verifyOtp({
        token_hash: tokenHash!,
        type: rawType as EmailOtpType,
      })).error;
    }
    if (!verified) return safeRedirect(origin, recovery ? '/forgot-password?notice=recovery_failed' : '/login?notice=confirmation_failed');
    sessionEstablished = true;

    if (recovery) {
      const { data, error } = await supabase.auth.getUser();
      const userId = data?.user?.id;
      if (error || typeof userId !== 'string') {
        return failWithClearedAuthSession(
          supabase,
          safeRedirect(origin, '/forgot-password?notice=recovery_failed')
        );
      }
      const proof = createRecoveryIntent(userId);
      const response = safeRedirect(origin, '/reset-password');
      response.cookies.set(RECOVERY_INTENT_COOKIE, proof, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/api/auth/recovery/update',
        maxAge: RECOVERY_INTENT_MAX_AGE_SECONDS,
      });
      return response;
    }

    const context = await resolveCurrentUserContext(
      supabase as unknown as CurrentUserContextClient
    );
    if (!context.success) {
      return failWithClearedAuthSession(
        supabase,
        safeRedirect(origin, '/login?notice=confirmation_failed')
      );
    }
    return safeRedirect(origin, CANONICAL_AUTH_DESTINATION);
  } catch {
    const response = safeRedirect(origin, recovery ? '/forgot-password?notice=recovery_failed' : '/login?notice=confirmation_failed');
    return sessionEstablished && supabase
      ? failWithClearedAuthSession(supabase, response)
      : response;
  }
}
