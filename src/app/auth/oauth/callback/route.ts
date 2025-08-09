import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  // ============ COMPREHENSIVE OAUTH CALLBACK LOGGING ============
  console.log('🔗 OAUTH_CALLBACK: REQUEST_RECEIVED', {
    timestamp: new Date().toISOString(),
    fullUrl: request.url,
    searchParams: Object.fromEntries(searchParams.entries()),
    headers: {
      referer: request.headers.get('referer'),
      userAgent: request.headers.get('user-agent')?.slice(0, 100),
      host: request.headers.get('host')
    },
    method: request.method
  });

  console.log('🔗 OAUTH_CALLBACK: PARAMETER_ANALYSIS', {
    timestamp: new Date().toISOString(),
    hasCode: !!code,
    codeLength: code?.length,
    hasState: !!state,
    stateContent: state ? (state.length > 100 ? state.slice(0, 100) + '...' : state) : null,
    hasError: !!error,
    error: error,
    errorDescription: errorDescription,
    allParams: Object.fromEntries(searchParams.entries())
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
    
    console.log('🔗 OAUTH_CALLBACK: PKCE_CALLBACK_RECEIVED', {
      timestamp: new Date().toISOString(),
      hasCode: !!code,
      codePreview: code ? code.slice(0, 8) + '...' : null,
      hasAccessCode: !!accessCode,
      accessCodePreview: accessCode ? accessCode.slice(0, 4) + '...' : null,
      hasEmail: !!email,
      email: email,
      flowType: accessCode && email ? 'REGISTRATION' : 'LOGIN'
    });

    // Decode and analyze state parameter if present
    if (state) {
      try {
        const decodedState = JSON.parse(state);
        console.log('🔗 OAUTH_CALLBACK: STATE_DECODED', {
          timestamp: new Date().toISOString(),
          stateKeys: Object.keys(decodedState),
          hasAccessCodeInState: !!decodedState.accessCode,
          hasEmailInState: !!decodedState.email,
          stateAccessCode: decodedState.accessCode ? decodedState.accessCode.slice(0, 4) + '...' : null
        });
      } catch (stateError) {
        console.log('🔗 OAUTH_CALLBACK: STATE_PARSE_FAILED', {
          timestamp: new Date().toISOString(),
          stateLength: state.length,
          statePreview: state.slice(0, 50) + '...',
          error: stateError instanceof Error ? stateError.message : 'Unknown error'
        });
      }
    }
    
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
      console.log('🔗 OAUTH_CALLBACK: REGISTRATION_FLOW_DETECTED', {
        timestamp: new Date().toISOString(),
        email: email,
        accessCode: accessCode.substring(0, 4) + '...',
        hasOAuthCode: !!code,
        nextStep: 'REDIRECT_TO_REGISTER_WITH_OAUTH_SUCCESS'
      });

      // Redirect to registration page with OAuth success parameters
      const redirectParams = new URLSearchParams();
      if (code) redirectParams.set('code', code);
      if (accessCode) redirectParams.set('accessCode', accessCode);
      if (email) redirectParams.set('email', email);
      redirectParams.set('oauth_success', 'true');
      
      const redirectUrl = `/register?${redirectParams.toString()}`;
      
      console.log('🔗 OAUTH_CALLBACK: REGISTRATION_REDIRECT_EXECUTING', {
        timestamp: new Date().toISOString(),
        redirectUrl: redirectUrl,
        fullUrl: `${request.url.split('/auth/oauth/callback')[0]}${redirectUrl}`,
        redirectParams: Object.fromEntries(redirectParams.entries()),
        expectedBehavior: 'User should land on /register with oauth_success=true and trigger client-side API call'
      });
      
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }

    // For login flow (no accessCode), redirect to client for code exchange
    console.log('🔗 OAUTH_CALLBACK: LOGIN_FLOW_DETECTED', {
      timestamp: new Date().toISOString(),
      hasCode: !!code,
      codePreview: code ? code.slice(0, 8) + '...' : null,
      nextStep: 'REDIRECT_TO_LOGIN_FOR_CODE_EXCHANGE'
    });
    
    const redirectParams = new URLSearchParams();
    if (code) redirectParams.set('code', code);
    const redirectUrl = `/login?${redirectParams.toString()}`;

    console.log('🔗 OAUTH_CALLBACK: LOGIN_REDIRECT_EXECUTING', {
      timestamp: new Date().toISOString(),
      redirectUrl: redirectUrl,
      fullUrl: `${request.url.split('/auth/oauth/callback')[0]}${redirectUrl}`,
      expectedBehavior: 'User should land on /login and complete OAuth code exchange'
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
    const isRegistrationFlow = searchParams.get('accessCode');
    const redirectPage = isRegistrationFlow ? '/register' : '/login';
    
    return NextResponse.redirect(
      new URL(`${redirectPage}?error=${errorMessage}`, request.url)
    );
  }
}