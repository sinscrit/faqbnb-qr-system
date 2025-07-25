import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// GET: Validate current session and return user info
export async function GET(request: NextRequest) {
  try {
    console.log('Session validation request');

    // Get the session from the request headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { 
          success: false, 
          authenticated: false,
          error: 'No valid authorization header provided',
          code: 'NO_AUTH_HEADER'
        },
        { status: 401 }
      );
    }

    const accessToken = authHeader.substring(7);
    if (!accessToken) {
      return NextResponse.json(
        { 
          success: false, 
          authenticated: false,
          error: 'No access token provided',
          code: 'NO_TOKEN'
        },
        { status: 401 }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase environment variables');
      return NextResponse.json(
        { 
          success: false, 
          authenticated: false,
          error: 'Server configuration error',
          code: 'SERVER_CONFIG_ERROR'
        },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Validate the token and get user
    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);
    
    if (userError || !user) {
      console.log('Token validation failed:', userError?.message);
      return NextResponse.json(
        { 
          success: false, 
          authenticated: false,
          error: 'Invalid or expired token',
          code: 'INVALID_TOKEN'
        },
        { status: 401 }
      );
    }

    if (!user.email) {
      return NextResponse.json(
        { 
          success: false, 
          authenticated: false,
          error: 'User email not found in token',
          code: 'NO_EMAIL'
        },
        { status: 401 }
      );
    }

    // Check if user is an admin
    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .select('email, full_name, role')
      .eq('id', user.id)
      .eq('email', user.email)
      .single();

    if (adminError || !adminUser) {
      console.log('Admin user not found:', { 
        userId: user.id, 
        email: user.email, 
        error: adminError?.message 
      });
      return NextResponse.json(
        { 
          success: false, 
          authenticated: false,
          error: 'User not found in admin system',
          code: 'NOT_ADMIN'
        },
        { status: 403 }
      );
    }

    if (adminUser.role !== 'admin') {
      console.log('User is not admin:', { 
        userId: user.id, 
        email: user.email, 
        role: adminUser.role 
      });
      return NextResponse.json(
        { 
          success: false, 
          authenticated: false,
          error: 'Admin privileges required',
          code: 'INSUFFICIENT_PRIVILEGES'
        },
        { status: 403 }
      );
    }

    // Return validated user data
    const validatedUser = {
      id: user.id,
      email: adminUser.email,
      fullName: adminUser.full_name || undefined,
      role: adminUser.role
    };

    console.log('Session validation successful for admin:', validatedUser.email);

    return NextResponse.json({
      success: true,
      authenticated: true,
      user: validatedUser,
      message: 'Session validation successful'
    });

  } catch (error) {
    console.error('Session validation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        authenticated: false,
        error: 'Session validation failed',
        code: 'VALIDATION_ERROR'
      },
      { status: 500 }
    );
  }
}

// POST: Refresh the current session
export async function POST(request: NextRequest) {
  try {
    console.log('Session refresh request');

    // Get refresh token from request body
    const body = await request.json().catch(() => ({}));
    const refreshToken = body.refreshToken;

    if (!refreshToken) {
      return NextResponse.json(
        { 
          success: false, 
          authenticated: false,
          error: 'Refresh token is required',
          code: 'NO_REFRESH_TOKEN'
        },
        { status: 400 }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase environment variables');
      return NextResponse.json(
        { 
          success: false, 
          authenticated: false,
          error: 'Server configuration error',
          code: 'SERVER_CONFIG_ERROR'
        },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Refresh the session
    const { data: sessionData, error: refreshError } = await supabase.auth.refreshSession({
      refresh_token: refreshToken
    });

    if (refreshError || !sessionData.session) {
      console.log('Session refresh failed:', refreshError?.message);
      return NextResponse.json(
        { 
          success: false, 
          authenticated: false,
          error: 'Failed to refresh session',
          code: 'REFRESH_FAILED'
        },
        { status: 401 }
      );
    }

    const { session, user } = sessionData;
    
    if (!user || !user.email) {
      return NextResponse.json(
        { 
          success: false, 
          authenticated: false,
          error: 'Invalid user data in refreshed session',
          code: 'INVALID_USER_DATA'
        },
        { status: 401 }
      );
    }

    // Validate admin status
    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .select('email, full_name, role')
      .eq('id', user.id)
      .eq('email', user.email)
      .single();

    if (adminError || !adminUser || adminUser.role !== 'admin') {
      console.log('Admin validation failed during refresh:', { 
        userId: user.id, 
        email: user.email,
        error: adminError?.message,
        role: adminUser?.role
      });
      return NextResponse.json(
        { 
          success: false, 
          authenticated: false,
          error: 'Admin privileges required',
          code: 'NOT_ADMIN'
        },
        { status: 403 }
      );
    }

    // Return refreshed session data
    const validatedUser = {
      id: user.id,
      email: adminUser.email,
      fullName: adminUser.full_name || undefined,
      role: adminUser.role
    };

    console.log('Session refresh successful for admin:', validatedUser.email);

    return NextResponse.json({
      success: true,
      authenticated: true,
      user: validatedUser,
      session: {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: session.expires_at
      },
      message: 'Session refresh successful'
    });

  } catch (error) {
    console.error('Session refresh error:', error);
    return NextResponse.json(
      { 
        success: false, 
        authenticated: false,
        error: 'Session refresh failed',
        code: 'REFRESH_ERROR'
      },
      { status: 500 }
    );
  }
} 