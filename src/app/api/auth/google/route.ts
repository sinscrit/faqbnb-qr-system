import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getTrustedAppOrigin, googleCompatibilityConfigured } from '@/lib/auth-origin';
import { createOAuthState, OAUTH_STATE_COOKIE, OAUTH_STATE_MAX_AGE_SECONDS } from '@/lib/oauth-state';

export const dynamic = 'force-dynamic';
const noStore = { 'Cache-Control': 'no-store' } as const;

export async function GET() {
  let origin: string;
  try {
    origin = getTrustedAppOrigin();
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'AUTH_CONFIGURATION_UNAVAILABLE', message: 'Google sign-in is unavailable.' } },
      { status: 503, headers: noStore }
    );
  }
  if (!googleCompatibilityConfigured()) {
    return NextResponse.redirect(new URL('/login?notice=google_unavailable', `${origin}/`), { headers: noStore });
  }

  const state = createOAuthState();
  const cookieStore = await cookies();
  cookieStore.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/auth/google/callback',
    maxAge: OAUTH_STATE_MAX_AGE_SECONDS,
  });

  const redirectUri = new URL('/api/auth/google/callback', `${origin}/`).toString();
  const google = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  google.searchParams.set('client_id', process.env.GOOGLE_CLIENT_ID!);
  google.searchParams.set('redirect_uri', redirectUri);
  google.searchParams.set('response_type', 'code');
  google.searchParams.set('scope', 'openid email profile');
  google.searchParams.set('state', state);
  google.searchParams.set('prompt', 'select_account');
  return NextResponse.redirect(google, { headers: noStore });
}
