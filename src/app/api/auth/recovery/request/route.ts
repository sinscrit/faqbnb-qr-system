import { NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase-server';
import { parseJsonRequest, recoveryRequestSchema } from '@/lib/auth-flow';
import { isTrustedAuthMutation, trustedAuthUrl } from '@/lib/auth-origin';

export const dynamic = 'force-dynamic';
const headers = { 'Cache-Control': 'no-store' } as const;
const genericResponse = () => NextResponse.json(
  { success: true, message: 'If an account exists, a recovery link is on its way.' },
  { status: 202, headers }
);

export async function POST(request: Request) {
  if (!isTrustedAuthMutation(request)) {
    return NextResponse.json(
      { success: false, error: { code: 'INVALID_REQUEST', message: 'This request could not be accepted.' } },
      { status: 400, headers }
    );
  }
  const parsed = await parseJsonRequest(request, recoveryRequestSchema);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: 'INVALID_REQUEST', message: 'Enter a valid email address.' } },
      { status: 400, headers }
    );
  }

  try {
    const supabase = await createSupabaseServer();
    await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${trustedAuthUrl('/auth/confirm')}?flow=recovery`,
    });
  } catch {
    // Deliberately indistinguishable: this endpoint must not disclose whether
    // an identity exists or provider delivery accepted the request.
  }
  return genericResponse();
}
