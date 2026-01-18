import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createUser, createDefaultAccount, linkUserToAccount } from '@/lib/auth';
import { validateAccessCodeForRegistration, consumeAccessCode } from '@/lib/access-validation';

/**
 * Direct Google OAuth callback route
 * Exchanges the Google auth code for tokens and signs in with Supabase using signInWithIdToken
 * Now also completes registration server-side to avoid client-side race conditions
 *
 * Updated: 2026-01-17
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const stateParam = searchParams.get('state');
  const error = searchParams.get('error');

  // Base URL for redirects - use NEXT_PUBLIC_APP_URL to avoid localhost issues on Railway
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;

  console.log('🔐 GOOGLE_OAUTH_CALLBACK: Received callback', {
    timestamp: new Date().toISOString(),
    hasCode: !!code,
    hasState: !!stateParam,
    hasError: !!error,
    error,
    baseUrl
  });

  // Handle OAuth errors
  if (error) {
    console.error('🔐 GOOGLE_OAUTH_CALLBACK: OAuth error from Google', { error });
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error)}`, baseUrl)
    );
  }

  if (!code || !stateParam) {
    console.error('🔐 GOOGLE_OAUTH_CALLBACK: Missing code or state');
    return NextResponse.redirect(
      new URL('/login?error=Missing authorization code', baseUrl)
    );
  }

  // Verify state to prevent CSRF
  const cookieStore = await cookies();
  const storedState = cookieStore.get('oauth_state')?.value;

  let state: { csrf: string; accessCode?: string; email?: string };
  try {
    state = JSON.parse(Buffer.from(stateParam, 'base64').toString());
    if (!storedState || JSON.parse(storedState).csrf !== state.csrf) {
      throw new Error('State mismatch');
    }
    console.log('🔐 GOOGLE_OAUTH_CALLBACK: State verified successfully', {
      timestamp: new Date().toISOString(),
      hasAccessCode: !!state.accessCode,
      hasEmail: !!state.email
    });
  } catch (stateError) {
    console.error('🔐 GOOGLE_OAUTH_CALLBACK: State verification failed', { stateError });
    return NextResponse.redirect(
      new URL('/login?error=Invalid state parameter', baseUrl)
    );
  }

  // Clear state cookie
  cookieStore.delete('oauth_state');

  // Exchange code for tokens
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin}/api/auth/google/callback`;

  console.log('🔐 GOOGLE_OAUTH_CALLBACK: Exchanging code for tokens', {
    timestamp: new Date().toISOString(),
    redirectUri
  });

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

  const tokens = await tokenResponse.json();

  if (tokens.error) {
    console.error('🔐 GOOGLE_OAUTH_CALLBACK: Token exchange failed', {
      error: tokens.error,
      description: tokens.error_description
    });
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(tokens.error_description || tokens.error)}`, baseUrl)
    );
  }

  console.log('🔐 GOOGLE_OAUTH_CALLBACK: Token exchange successful', {
    timestamp: new Date().toISOString(),
    hasIdToken: !!tokens.id_token,
    hasAccessToken: !!tokens.access_token,
    tokenType: tokens.token_type,
    expiresIn: tokens.expires_in
  });

  // Create Supabase client and sign in with ID token
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );

  console.log('🔐 GOOGLE_OAUTH_CALLBACK: Signing in with Supabase using ID token');

  const { data, error: authError } = await supabase.auth.signInWithIdToken({
    provider: 'google',
    token: tokens.id_token,
  });

  if (authError) {
    console.error('🔐 GOOGLE_OAUTH_CALLBACK: Supabase signInWithIdToken failed', {
      error: authError.message,
      code: authError.code
    });
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(authError.message)}`, baseUrl)
    );
  }

  console.log('🔐 GOOGLE_OAUTH_CALLBACK: Supabase sign in successful', {
    timestamp: new Date().toISOString(),
    userId: data.user?.id,
    userEmail: data.user?.email
  });

  // Handle registration flow (if accessCode present) - complete server-side
  if (state.accessCode && state.email && data.user) {
    console.log('🔐 GOOGLE_OAUTH_CALLBACK: Registration flow detected, completing server-side', {
      timestamp: new Date().toISOString(),
      userId: data.user.id,
      email: state.email,
      accessCode: state.accessCode.substring(0, 4) + '...'
    });

    try {
      // Validate access code
      const validationResult = await validateAccessCodeForRegistration(state.accessCode, state.email);
      if (!validationResult.isValid) {
        console.error('🔐 GOOGLE_OAUTH_CALLBACK: Access code validation failed', {
          error: validationResult.error,
          errorCode: validationResult.errorCode
        });
        return NextResponse.redirect(
          new URL(`/register?error=${encodeURIComponent(validationResult.error || 'Invalid access code')}`, baseUrl)
        );
      }

      console.log('🔐 GOOGLE_OAUTH_CALLBACK: Access code valid, creating user record');

      // Create user in application database
      const userResult = await createUser({
        id: data.user.id,
        email: state.email,
        fullName: data.user.user_metadata?.full_name || data.user.user_metadata?.name || '',
        role: 'user',
        authProvider: 'google'
      });

      if (userResult.error) {
        console.error('🔐 GOOGLE_OAUTH_CALLBACK: User creation failed', { error: userResult.error });
        return NextResponse.redirect(
          new URL(`/register?error=${encodeURIComponent('Failed to create user account')}`, baseUrl)
        );
      }

      console.log('🔐 GOOGLE_OAUTH_CALLBACK: User created, creating account');

      // Create default account
      const accountResult = await createDefaultAccount(data.user.id, state.email);
      if (accountResult.error) {
        console.error('🔐 GOOGLE_OAUTH_CALLBACK: Account creation failed', { error: accountResult.error });
        return NextResponse.redirect(
          new URL(`/register?error=${encodeURIComponent('Failed to create account')}`, baseUrl)
        );
      }

      console.log('🔐 GOOGLE_OAUTH_CALLBACK: Account created, linking user');

      // Link user to account
      const linkResult = await linkUserToAccount(data.user.id, accountResult.data!.id, 'owner');
      if (linkResult.error) {
        console.error('🔐 GOOGLE_OAUTH_CALLBACK: Account linking failed', { error: linkResult.error });
        // Continue anyway - user and account exist
      }

      // Consume access code
      await consumeAccessCode(state.accessCode, data.user.id);

      console.log('🔐 GOOGLE_OAUTH_CALLBACK: Registration completed successfully', {
        timestamp: new Date().toISOString(),
        userId: data.user.id,
        accountId: accountResult.data?.id
      });

      // Redirect to dashboard
      return NextResponse.redirect(new URL('/dashboard2', baseUrl));

    } catch (registrationError) {
      console.error('🔐 GOOGLE_OAUTH_CALLBACK: Registration error', { error: registrationError });
      return NextResponse.redirect(
        new URL(`/register?error=${encodeURIComponent('Registration failed. Please try again.')}`, baseUrl)
      );
    }
  }

  // Login flow - redirect to dashboard
  console.log('🔐 GOOGLE_OAUTH_CALLBACK: Login flow, redirecting to dashboard');
  return NextResponse.redirect(new URL('/dashboard2', baseUrl));
}
