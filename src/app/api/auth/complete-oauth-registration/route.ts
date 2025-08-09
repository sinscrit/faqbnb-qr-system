import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createUser, createDefaultAccount, linkUserToAccount } from '@/lib/auth';
import { validateAccessCodeForRegistration, consumeAccessCode } from '@/lib/access-validation';

// Supabase client for session validation
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * Validate OAuth session and extract user data
 */
async function validateOAuthSession(request: NextRequest) {
  try {
    // Get session from authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { error: 'Missing or invalid authorization header' };
    }

    const accessToken = authHeader.replace('Bearer ', '');
    
    // Validate session with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      return { error: 'Invalid or expired session' };
    }

    // Extract OAuth user metadata
    const userData = {
      id: user.id,
      email: user.email!,
      fullName: user.user_metadata?.full_name || user.user_metadata?.name || '',
      provider: user.app_metadata?.provider || 'google'
    };

    return { data: userData };
  } catch (error) {
    console.error('Session validation error:', error);
    return { error: 'Session validation failed' };
  }
}

/**
 * Complete OAuth registration for authenticated user
 */
export async function POST(request: NextRequest) {
  const DEBUG_PREFIX = "🔗 OAUTH_REGISTRATION_API:";
  
  try {
    console.log(`${DEBUG_PREFIX} REQUEST_RECEIVED`, {
      timestamp: new Date().toISOString(),
      method: request.method,
      url: request.url
    });

    // Parse request body
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { accessCode, email } = body;

    // Validate required parameters
    if (!accessCode || !email) {
      return NextResponse.json(
        { success: false, error: 'Access code and email are required' },
        { status: 400 }
      );
    }

    console.log(`${DEBUG_PREFIX} VALIDATING_SESSION`, {
      timestamp: new Date().toISOString(),
      email: email,
      accessCode: accessCode.substring(0, 4) + '...'
    });

    // Validate OAuth session
    const sessionResult = await validateOAuthSession(request);
    if (sessionResult.error) {
      console.error(`${DEBUG_PREFIX} SESSION_VALIDATION_FAILED`, {
        timestamp: new Date().toISOString(),
        error: sessionResult.error
      });
      
      return NextResponse.json(
        { success: false, error: sessionResult.error },
        { status: 401 }
      );
    }

    const oauthUser = sessionResult.data!;
    
    // Verify email matches session
    if (oauthUser.email !== email) {
      console.error(`${DEBUG_PREFIX} EMAIL_MISMATCH`, {
        timestamp: new Date().toISOString(),
        sessionEmail: oauthUser.email,
        requestEmail: email
      });
      
      return NextResponse.json(
        { success: false, error: 'Email does not match authenticated session' },
        { status: 403 }
      );
    }

    console.log(`${DEBUG_PREFIX} SESSION_VALIDATED`, {
      timestamp: new Date().toISOString(),
      userId: oauthUser.id,
      email: oauthUser.email,
      provider: oauthUser.provider
    });

    // Validate access code
    console.log(`${DEBUG_PREFIX} VALIDATING_ACCESS_CODE`, {
      timestamp: new Date().toISOString(),
      email: email,
      accessCode: accessCode.substring(0, 4) + '...'
    });

    const validationResult = await validateAccessCodeForRegistration(accessCode, email);
    if (!validationResult.isValid) {
      console.error(`${DEBUG_PREFIX} ACCESS_CODE_INVALID`, {
        timestamp: new Date().toISOString(),
        error: validationResult.error,
        errorCode: validationResult.errorCode
      });
      
      return NextResponse.json(
        { 
          success: false, 
          error: validationResult.error || 'Invalid access code',
          errorCode: validationResult.errorCode
        },
        { status: 403 }
      );
    }

    console.log(`${DEBUG_PREFIX} ACCESS_CODE_VALID`, {
      timestamp: new Date().toISOString(),
      requestId: validationResult.request?.id
    });

    // Create user in application database
    console.log(`${DEBUG_PREFIX} CREATING_USER`, {
      timestamp: new Date().toISOString(),
      userId: oauthUser.id,
      email: oauthUser.email,
      provider: oauthUser.provider
    });

    const userResult = await createUser({
      id: oauthUser.id,
      email: oauthUser.email,
      fullName: oauthUser.fullName,
      role: 'user',
      authProvider: oauthUser.provider
    });

    if (userResult.error) {
      console.error(`${DEBUG_PREFIX} USER_CREATION_FAILED`, {
        timestamp: new Date().toISOString(),
        error: userResult.error
      });
      
      return NextResponse.json(
        { success: false, error: `User creation failed: ${userResult.error}` },
        { status: 500 }
      );
    }

    console.log(`${DEBUG_PREFIX} USER_CREATED`, {
      timestamp: new Date().toISOString(),
      userId: userResult.data!.id,
      email: userResult.data!.email
    });

    // Create default account
    console.log(`${DEBUG_PREFIX} CREATING_ACCOUNT`, {
      timestamp: new Date().toISOString(),
      userId: oauthUser.id,
      email: oauthUser.email
    });

    const accountResult = await createDefaultAccount(oauthUser.id, oauthUser.email);
    if (accountResult.error) {
      console.error(`${DEBUG_PREFIX} ACCOUNT_CREATION_FAILED`, {
        timestamp: new Date().toISOString(),
        error: accountResult.error
      });
      
      return NextResponse.json(
        { success: false, error: `Account creation failed: ${accountResult.error}` },
        { status: 500 }
      );
    }

    console.log(`${DEBUG_PREFIX} ACCOUNT_CREATED`, {
      timestamp: new Date().toISOString(),
      accountId: accountResult.data!.id,
      accountName: accountResult.data!.name
    });

    // Link user to account
    console.log(`${DEBUG_PREFIX} LINKING_ACCOUNT`, {
      timestamp: new Date().toISOString(),
      userId: oauthUser.id,
      accountId: accountResult.data!.id
    });

    const linkResult = await linkUserToAccount(oauthUser.id, accountResult.data!.id, 'owner');
    if (linkResult.error) {
      console.error(`${DEBUG_PREFIX} ACCOUNT_LINKING_FAILED`, {
        timestamp: new Date().toISOString(),
        error: linkResult.error
      });
      
      return NextResponse.json(
        { success: false, error: `Account linking failed: ${linkResult.error}` },
        { status: 500 }
      );
    }

    console.log(`${DEBUG_PREFIX} ACCOUNT_LINKED`, {
      timestamp: new Date().toISOString(),
      userId: linkResult.data!.userId,
      accountId: linkResult.data!.accountId,
      role: linkResult.data!.role
    });

    // Consume access code
    console.log(`${DEBUG_PREFIX} CONSUMING_ACCESS_CODE`, {
      timestamp: new Date().toISOString(),
      accessCode: accessCode.substring(0, 4) + '...',
      userId: oauthUser.id
    });

    const consumeResult = await consumeAccessCode(accessCode, oauthUser.id);
    if (!consumeResult.success) {
      console.error(`${DEBUG_PREFIX} ACCESS_CODE_CONSUME_FAILED`, {
        timestamp: new Date().toISOString(),
        error: consumeResult.error,
        errorCode: consumeResult.errorCode
      });
      
      return NextResponse.json(
        { success: false, error: `Access code consumption failed: ${consumeResult.error}` },
        { status: 500 }
      );
    }

    console.log(`${DEBUG_PREFIX} ACCESS_CODE_CONSUMED`, {
      timestamp: new Date().toISOString(),
      requestId: consumeResult.requestId,
      registrationDate: consumeResult.registrationDate
    });

    // Success response
    console.log(`${DEBUG_PREFIX} REGISTRATION_COMPLETED`, {
      timestamp: new Date().toISOString(),
      userId: oauthUser.id,
      email: oauthUser.email,
      accountId: accountResult.data!.id,
      provider: oauthUser.provider
    });

    return NextResponse.json({
      success: true,
      message: 'OAuth registration completed successfully',
      user: {
        id: userResult.data!.id,
        email: userResult.data!.email,
        fullName: userResult.data!.fullName,
        role: userResult.data!.role,
        authProvider: userResult.data!.authProvider
      },
      account: {
        id: accountResult.data!.id,
        name: accountResult.data!.name
      },
      accessCodeUsed: true,
      registrationMethod: 'oauth'
    }, { status: 201 });

  } catch (error) {
    console.error(`${DEBUG_PREFIX} INTERNAL_ERROR:`, error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'An unexpected error occurred during OAuth registration. Please try again.' 
      },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}