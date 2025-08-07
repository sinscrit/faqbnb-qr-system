import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { createUser, createDefaultAccount, linkUserToAccount } from '@/lib/auth';
import { validateAccessCodeForRegistration, consumeAccessCode } from '@/lib/access-validation';
import type { OAuthUserData } from '@/types';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  console.log('🔗 OAUTH_CALLBACK: Request received', {
    timestamp: new Date().toISOString(),
    hasCode: !!code,
    hasState: !!state,
    hasError: !!error,
    url: request.url
  });

  // Handle OAuth errors from provider
  if (error) {
    console.error('🔗 OAUTH_CALLBACK: OAuth provider error', {
      timestamp: new Date().toISOString(),
      error,
      errorDescription,
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
    });

    let errorMessage: string;
    let errorCode: string;

    switch (error) {
      case 'access_denied':
        errorMessage = 'Google authentication was cancelled. You can try again or register with email and password.';
        errorCode = 'USER_CANCELLED';
        break;
      case 'invalid_request':
        errorMessage = 'There was a problem with the authentication request. Please try again.';
        errorCode = 'INVALID_REQUEST';
        break;
      case 'invalid_client':
        errorMessage = 'Authentication service temporarily unavailable. Please try again later.';
        errorCode = 'CONFIG_ERROR';
        break;
      case 'invalid_scope':
        errorMessage = 'Permission scope error. Please try again or contact support.';
        errorCode = 'SCOPE_ERROR';
        break;
      case 'server_error':
      case 'temporarily_unavailable':
        errorMessage = 'Google services are temporarily unavailable. Please try again in a few minutes.';
        errorCode = 'TEMPORARY_ERROR';
        break;
      default:
        errorMessage = `Authentication failed: ${errorDescription || error}. Please try again or register with email and password.`;
        errorCode = 'UNKNOWN_ERROR';
    }
    
    return NextResponse.redirect(
      new URL(`/register?error=${encodeURIComponent(errorMessage)}&error_code=${errorCode}`, request.url)
    );
  }

  if (!code) {
    console.error('🔗 OAUTH_CALLBACK: Missing authorization code', {
      timestamp: new Date().toISOString()
    });
    
    const errorMessage = encodeURIComponent('Missing authorization code from OAuth provider');
    return NextResponse.redirect(
      new URL(`/register?error=${errorMessage}`, request.url)
    );
  }

  try {
    // Parse URL parameters for access code and email (passed from OAuth button)
    const accessCode = searchParams.get('accessCode');
    const email = searchParams.get('email');
    
    console.log('🔗 OAUTH_CALLBACK: PKCE OAuth callback received', {
      timestamp: new Date().toISOString(),
      hasCode: !!code,
      hasAccessCode: !!accessCode,
      hasEmail: !!email,
      email: email
    });

    // For PKCE flow, redirect to client to handle code exchange
    // The client will automatically exchange the code due to detectSessionInUrl: true
    console.log('🔗 OAUTH_CALLBACK: PKCE flow - redirecting to client for code exchange', {
      timestamp: new Date().toISOString(),
      hasCode: !!code
    });

    // Build the redirect URL with the OAuth code for client-side exchange
    const redirectParams = new URLSearchParams();
    if (code) redirectParams.set('code', code);
    
    // Include access code and email if provided
    if (accessCode) redirectParams.set('accessCode', accessCode);
    if (email) redirectParams.set('email', email);
    
    // Redirect to registration page with parameters - client will handle OAuth code exchange
    const redirectUrl = `/register?${redirectParams.toString()}`;

    console.log('🔗 OAUTH_CALLBACK: Redirecting to', {
      timestamp: new Date().toISOString(),
      url: redirectUrl
    });

    return NextResponse.redirect(new URL(redirectUrl, request.url));

  } catch (error) {
    console.error('🔗 OAUTH_CALLBACK: Unexpected error during redirect', {
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      hasCode: !!code,
      hasState: !!state
    });

    const errorMessage = encodeURIComponent('OAuth callback processing failed');
    return NextResponse.redirect(
      new URL(`/register?error=${errorMessage}`, request.url)
    );
  }
}