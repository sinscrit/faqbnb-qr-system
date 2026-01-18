import { NextRequest, NextResponse } from 'next/server';
import { signOut } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    console.log('Logout attempt');

    // Attempt to sign out
    const result = await signOut();

    if (result.error) {
      console.error('Logout failed:', result.error);
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    console.log('Logout successful');

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Successfully signed out',
    });

  } catch (error) {
    console.error('Logout API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle GET requests for logout (redirect-based logout)
export async function GET(request: NextRequest) {
  try {
    console.log('Logout via GET request');

    // Attempt to sign out
    const result = await signOut();

    if (result.error) {
      console.error('Logout failed:', result.error);
      // Still redirect to login even if signout fails
    }

    // Redirect to login page
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('message', 'logged_out');
    
    return NextResponse.redirect(loginUrl);

  } catch (error) {
    console.error('Logout GET API error:', error);
    
    // Still redirect to login on error
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('error', 'logout_error');
    
    return NextResponse.redirect(loginUrl);
  }
} 