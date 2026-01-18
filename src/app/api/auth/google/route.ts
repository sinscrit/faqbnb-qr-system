import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Direct Google OAuth initiation route
 * This bypasses Supabase's OAuth flow so Google shows your app domain
 * instead of the Supabase URL in the consent screen.
 *
 * Updated: 2026-01-13
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const accessCode = searchParams.get('accessCode');
  const email = searchParams.get('email');

  console.log('🔐 GOOGLE_OAUTH_INIT: Starting direct Google OAuth flow', {
    timestamp: new Date().toISOString(),
    hasAccessCode: !!accessCode,
    hasEmail: !!email,
    flowType: accessCode && email ? 'REGISTRATION' : 'LOGIN'
  });

  // Generate CSRF state token
  const state = JSON.stringify({
    csrf: crypto.randomUUID(),
    accessCode: accessCode || undefined,
    email: email || undefined,
    timestamp: Date.now(),
  });

  // Store state in cookie for verification
  const cookieStore = await cookies();
  cookieStore.set('oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10, // 10 minutes
  });

  // Build Google OAuth URL
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin}/api/auth/google/callback`;

  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  googleAuthUrl.searchParams.set('client_id', process.env.GOOGLE_CLIENT_ID!);
  googleAuthUrl.searchParams.set('redirect_uri', redirectUri);
  googleAuthUrl.searchParams.set('response_type', 'code');
  googleAuthUrl.searchParams.set('scope', 'openid email profile');
  googleAuthUrl.searchParams.set('state', Buffer.from(state).toString('base64'));
  googleAuthUrl.searchParams.set('access_type', 'offline');
  googleAuthUrl.searchParams.set('prompt', 'consent');

  console.log('🔐 GOOGLE_OAUTH_INIT: Redirecting to Google', {
    timestamp: new Date().toISOString(),
    redirectUri,
    googleAuthUrl: googleAuthUrl.toString().replace(/client_id=[^&]+/, 'client_id=***')
  });

  return NextResponse.redirect(googleAuthUrl.toString());
}
