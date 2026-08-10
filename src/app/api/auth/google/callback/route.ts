import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createSupabaseServer } from '@/lib/supabase-server';
import { getTrustedAppOrigin, googleCompatibilityConfigured } from '@/lib/auth-origin';
import { failWithClearedAuthSession } from '@/lib/auth-session-cleanup';
import { isOAuthState, OAUTH_STATE_COOKIE } from '@/lib/oauth-state';
import {
  resolveCurrentUserContext,
  type CurrentUserContextClient,
} from '@/lib/current-user-context';

export const dynamic = 'force-dynamic';
const failed = (origin: string) => NextResponse.redirect(
  new URL('/login?notice=google_failed', `${origin}/`),
  { headers: { 'Cache-Control': 'no-store' } }
);

export async function GET(request: NextRequest) {
  let origin: string;
  try {
    origin = getTrustedAppOrigin();
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'AUTH_CONFIGURATION_UNAVAILABLE', message: 'Google sign-in is unavailable.' } },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    );
  }
  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');
  const cookieStore = await cookies();
  const storedState = cookieStore.get(OAUTH_STATE_COOKIE)?.value;
  cookieStore.set(OAUTH_STATE_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/auth/google/callback',
    maxAge: 0,
  });
  if (!googleCompatibilityConfigured()) return failed(origin);
  if (
    !code ||
    code.length > 4096 ||
    !state ||
    state !== storedState ||
    !isOAuthState(storedState)
  ) return failed(origin);

  let supabase: Awaited<ReturnType<typeof createSupabaseServer>> | null = null;
  let sessionEstablished = false;
  try {
    const redirectUri = new URL('/api/auth/google/callback', `${origin}/`).toString();
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });
    const tokenBody: unknown = await tokenResponse.json();
    const idToken = tokenBody && typeof tokenBody === 'object' && 'id_token' in tokenBody
      ? (tokenBody as { id_token?: unknown }).id_token
      : null;
    if (!tokenResponse.ok || typeof idToken !== 'string' || !idToken || idToken.length > 16_384) return failed(origin);

    supabase = await createSupabaseServer();
    const { data, error } = await supabase.auth.signInWithIdToken({ provider: 'google', token: idToken });
    if (error || !data.user) return failed(origin);
    sessionEstablished = true;

    // Compatibility is not a registration path. RLS permits an authenticated
    // identity to see only its own existing application profile; an unknown
    // identity is signed out and receives no profile/account enrollment.
    const existing = await supabase.from('users').select('id').eq('id', data.user.id).maybeSingle();
    if (existing.error || !existing.data) {
      return failWithClearedAuthSession(supabase, failed(origin));
    }
    const context = await resolveCurrentUserContext(
      supabase as unknown as CurrentUserContextClient
    );
    if (!context.success) {
      return failWithClearedAuthSession(supabase, failed(origin));
    }
    return NextResponse.redirect(new URL(context.context.next, `${origin}/`), {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch {
    const response = failed(origin);
    return sessionEstablished && supabase
      ? failWithClearedAuthSession(supabase, response)
      : response;
  }
}
