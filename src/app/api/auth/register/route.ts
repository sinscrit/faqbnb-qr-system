import { NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase-server';
import { parseJsonRequest, registerRequestSchema } from '@/lib/auth-flow';
import { isTrustedAuthMutation, trustedAuthUrl } from '@/lib/auth-origin';
import { failWithClearedAuthSession } from '@/lib/auth-session-cleanup';

export const dynamic = 'force-dynamic';
const headers = { 'Cache-Control': 'no-store' } as const;
const checkEmail = () => NextResponse.json(
  { success: true, message: 'Check your email to confirm your account.' },
  { status: 202, headers }
);

export async function POST(request: Request) {
  if (!isTrustedAuthMutation(request)) {
    return NextResponse.json(
      { success: false, error: { code: 'INVALID_REQUEST', message: 'This request could not be accepted.' } },
      { status: 400, headers }
    );
  }
  const parsed = await parseJsonRequest(request, registerRequestSchema);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: 'INVALID_REQUEST', message: 'Check the form and try again.' } },
      { status: 400, headers }
    );
  }

  try {
    const supabase = await createSupabaseServer();
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: trustedAuthUrl('/auth/confirm'),
        data: parsed.data.displayName ? { full_name: parsed.data.displayName } : {},
      },
    });

    // Supabase deliberately obscures an existing identity. Keep that response
    // indistinguishable from a normal confirmation request.
    // A session here means provider auto-confirm is enabled. Check this before
    // every other result branch so even an unexpected mixed provider envelope
    // cannot return while leaving an unintended authenticated session behind.
    if (data?.session) {
      return failWithClearedAuthSession(supabase, NextResponse.json(
        { success: false, error: { code: 'EMAIL_CONFIRMATION_REQUIRED', message: 'Registration needs email confirmation. Please try again later.' } },
        { status: 503, headers }
      ));
    }

    if (error?.code === 'user_already_exists' || data?.user?.identities?.length === 0) {
      return checkEmail();
    }
    if (error || !data?.user) {
      return NextResponse.json(
        { success: false, error: { code: 'REGISTRATION_UNAVAILABLE', message: 'Registration is temporarily unavailable. Please try again.' } },
        { status: 503, headers }
      );
    }

    return checkEmail();
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'REGISTRATION_UNAVAILABLE', message: 'Registration is temporarily unavailable. Please try again.' } },
      { status: 503, headers }
    );
  }
}
