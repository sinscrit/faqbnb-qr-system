import { NextRequest, NextResponse } from 'next/server';

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
    
    // Determine redirect URL based on whether this is registration or login flow
    const isRegistrationFlow = searchParams.get('accessCode');
    const redirectPage = isRegistrationFlow ? '/register' : '/login';
    
    return NextResponse.redirect(
      new URL(`${redirectPage}?error=${encodeURIComponent(errorMessage)}&error_code=${errorCode}`, request.url)
    );
  }

  if (!code) {
    console.error('🔗 OAUTH_CALLBACK: Missing authorization code', {
      timestamp: new Date().toISOString()
    });
    
    const errorMessage = encodeURIComponent('Missing authorization code from OAuth provider');
    const isRegistrationFlow = searchParams.get('accessCode');
    const redirectPage = isRegistrationFlow ? '/register' : '/login';
    
    return NextResponse.redirect(
      new URL(`${redirectPage}?error=${errorMessage}`, request.url)
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
    
    // Enhanced logging for Gmail OAuth callbacks
    if (email && email.endsWith('@gmail.com')) {
      console.log('🔍 GMAIL_OAUTH_DEBUG: Gmail OAuth callback processing', {
        timestamp: new Date().toISOString(),
        gmailEmail: email,
        isLoginFlow: !accessCode,
        isRegistrationFlow: !!accessCode,
        hasOAuthCode: !!code,
        oauthCodeLength: code?.length,
        url: request.url
      });
    }

    // For registration flow with accessCode, redirect to client for registration completion
    if (accessCode && email) {
      console.log('🔗 OAUTH_CALLBACK: Registration flow detected - redirecting to client for completion', {
        timestamp: new Date().toISOString(),
        email: email,
        accessCode: accessCode.substring(0, 4) + '...'
      });

      // Redirect to registration page with OAuth success parameters
      const redirectParams = new URLSearchParams();
      if (code) redirectParams.set('code', code);
      if (accessCode) redirectParams.set('accessCode', accessCode);
      if (email) redirectParams.set('email', email);
      redirectParams.set('oauth_success', 'true');
      
      const redirectUrl = `/register?${redirectParams.toString()}`;
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }

    // For login flow (no accessCode), redirect to client for code exchange
    console.log('🔗 OAUTH_CALLBACK: Login flow - redirecting to client for code exchange', {
      timestamp: new Date().toISOString(),
      hasCode: !!code
    });
    
    const redirectParams = new URLSearchParams();
    if (code) redirectParams.set('code', code);
    const redirectUrl = `/login?${redirectParams.toString()}`;

    return NextResponse.redirect(new URL(redirectUrl, request.url));

  } catch (error) {
    console.error('🔗 OAUTH_CALLBACK: Unexpected error during redirect', {
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      hasCode: !!code,
      hasState: !!state
    });

    const errorMessage = encodeURIComponent('OAuth callback processing failed');
    const isRegistrationFlow = searchParams.get('accessCode');
    const redirectPage = isRegistrationFlow ? '/register' : '/login';
    
    return NextResponse.redirect(
      new URL(`${redirectPage}?error=${errorMessage}`, request.url)
    );
  }
}