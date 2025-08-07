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
    // Parse state parameter for access code and email
    let stateData: { accessCode?: string; email?: string; returnTo?: string } = {};
    if (state) {
      try {
        stateData = JSON.parse(state);
        console.log('🔗 OAUTH_CALLBACK: State parsed', {
          timestamp: new Date().toISOString(),
          hasAccessCode: !!stateData.accessCode,
          hasEmail: !!stateData.email,
          returnTo: stateData.returnTo
        });
      } catch (parseError) {
        console.warn('🔗 OAUTH_CALLBACK: Failed to parse state', {
          timestamp: new Date().toISOString(),
          state,
          error: parseError
        });
      }
    }

    // Exchange OAuth code for session
    console.log('🔗 OAUTH_CALLBACK: Exchanging code for session', {
      timestamp: new Date().toISOString()
    });

    const { data: authData, error: authError } = await supabase.auth.exchangeCodeForSession(code);

    if (authError || !authData?.user || !authData?.session) {
      console.error('🔗 OAUTH_CALLBACK: Failed to exchange code for session', {
        timestamp: new Date().toISOString(),
        error: authError?.message,
        hasUser: !!authData?.user,
        hasSession: !!authData?.session
      });

      const errorMessage = encodeURIComponent(
        authError?.message || 'Failed to complete OAuth authentication'
      );
      return NextResponse.redirect(
        new URL(`/register?error=${errorMessage}`, request.url)
      );
    }

    const oauthUser = authData.user;
    const session = authData.session;

    console.log('🔗 OAUTH_CALLBACK: OAuth session created', {
      timestamp: new Date().toISOString(),
      userId: oauthUser.id,
      email: oauthUser.email,
      provider: oauthUser.app_metadata?.provider
    });

    // Extract user data from OAuth
    const oauthUserData: OAuthUserData = {
      email: oauthUser.email!,
      fullName: oauthUser.user_metadata?.full_name || oauthUser.user_metadata?.name,
      picture: oauthUser.user_metadata?.picture || oauthUser.user_metadata?.avatar_url,
      provider: 'google',
      providerId: oauthUser.id
    };

    console.log('🔗 OAUTH_CALLBACK: Extracted OAuth user data', {
      timestamp: new Date().toISOString(),
      email: oauthUserData.email,
      hasFullName: !!oauthUserData.fullName,
      hasPicture: !!oauthUserData.picture
    });

    // Validate access code if provided
    if (stateData.accessCode) {
      console.log('🔗 OAUTH_CALLBACK: Validating access code', {
        timestamp: new Date().toISOString(),
        accessCode: stateData.accessCode.substring(0, 4) + '...',
        email: oauthUserData.email
      });

      const accessValidation = await validateAccessCodeForRegistration(
        stateData.accessCode, 
        oauthUserData.email
      );

      if (!accessValidation.isValid) {
        console.error('🔗 OAUTH_CALLBACK: Access code validation failed', {
          timestamp: new Date().toISOString(),
          error: accessValidation.error,
          errorCode: accessValidation.errorCode
        });

        const errorMessage = encodeURIComponent(
          accessValidation.error || 'Invalid access code for OAuth registration'
        );
        return NextResponse.redirect(
          new URL(`/register?error=${errorMessage}`, request.url)
        );
      }

      console.log('🔗 OAUTH_CALLBACK: Access code validated successfully', {
        timestamp: new Date().toISOString(),
        requestId: accessValidation.request?.id
      });
    }

    // Check if user already exists in our users table
    const { data: existingUser, error: userLookupError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', oauthUser.id)
      .single();

    if (userLookupError && userLookupError.code !== 'PGRST116') {
      console.error('🔗 OAUTH_CALLBACK: Database error checking existing user', {
        timestamp: new Date().toISOString(),
        error: userLookupError.message,
        code: userLookupError.code
      });

      const errorMessage = encodeURIComponent('Database error during OAuth registration');
      return NextResponse.redirect(
        new URL(`/register?error=${errorMessage}`, request.url)
      );
    }

    let user;
    let account;

    if (existingUser) {
      console.log('🔗 OAUTH_CALLBACK: User already exists', {
        timestamp: new Date().toISOString(),
        userId: existingUser.id,
        email: existingUser.email
      });
      
      user = existingUser;
    } else {
      // Create new user record
      console.log('🔗 OAUTH_CALLBACK: Creating new user record', {
        timestamp: new Date().toISOString(),
        email: oauthUserData.email
      });

      const userResult = await createUser({
        id: oauthUser.id,
        email: oauthUserData.email,
        fullName: oauthUserData.fullName,
        role: 'user',
        profilePicture: oauthUserData.picture,
        authProvider: 'google'
      });

      if (userResult.error) {
        console.error('🔗 OAUTH_CALLBACK: Failed to create user', {
          timestamp: new Date().toISOString(),
          error: userResult.error
        });

        const errorMessage = encodeURIComponent('Failed to create user account');
        return NextResponse.redirect(
          new URL(`/register?error=${errorMessage}`, request.url)
        );
      }

      user = userResult.data!;

      // Create default account
      console.log('🔗 OAUTH_CALLBACK: Creating default account', {
        timestamp: new Date().toISOString(),
        userId: user.id
      });

      const accountResult = await createDefaultAccount(user.id, user.email);
      
      if (accountResult.error) {
        console.warn('🔗 OAUTH_CALLBACK: Account creation failed, continuing without account', {
          timestamp: new Date().toISOString(),
          error: accountResult.error
        });
      } else {
        account = accountResult.data;

        // Link user to account
        const linkResult = await linkUserToAccount(user.id, account.id, 'owner');
        if (linkResult.error) {
          console.warn('🔗 OAUTH_CALLBACK: Account linking failed', {
            timestamp: new Date().toISOString(),
            error: linkResult.error
          });
        }
      }
    }

    // Consume access code if provided
    if (stateData.accessCode) {
      console.log('🔗 OAUTH_CALLBACK: Consuming access code', {
        timestamp: new Date().toISOString(),
        accessCode: stateData.accessCode.substring(0, 4) + '...',
        userId: user.id
      });

      const consumeResult = await consumeAccessCode(stateData.accessCode, user.id);
      if (!consumeResult.success) {
        console.warn('🔗 OAUTH_CALLBACK: Access code consumption failed', {
          timestamp: new Date().toISOString(),
          error: consumeResult.error
        });
        // Don't fail the OAuth flow for this - user is already created
      }
    }

    console.log('🔗 OAUTH_CALLBACK: OAuth registration completed successfully', {
      timestamp: new Date().toISOString(),
      userId: user.id,
      email: user.email,
      hasAccount: !!account,
      accessCodeUsed: !!stateData.accessCode
    });

    // Redirect to success page
    const returnTo = stateData.returnTo || '/dashboard';
    const successUrl = new URL(returnTo, request.url);
    successUrl.searchParams.set('oauth_success', 'true');
    successUrl.searchParams.set('registration_method', 'oauth');
    
    if (stateData.accessCode) {
      successUrl.searchParams.set('access_code_used', 'true');
    }

    return NextResponse.redirect(successUrl);

  } catch (error) {
    console.error('🔗 OAUTH_CALLBACK: Unexpected error during OAuth callback', {
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    const errorMessage = encodeURIComponent(
      error instanceof Error ? error.message : 'An unexpected error occurred during OAuth authentication'
    );
    
    return NextResponse.redirect(
      new URL(`/register?error=${errorMessage}`, request.url)
    );
  }
}