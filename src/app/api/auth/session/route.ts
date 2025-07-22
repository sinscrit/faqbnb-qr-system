import { NextRequest, NextResponse } from 'next/server';
import { getSession, getUser, refreshSession, isSessionExpiringSoon } from '@/lib/auth';

// GET: Validate current session and return user info
export async function GET(request: NextRequest) {
  try {
    console.log('Session validation request');

    // Get current session
    const sessionResponse = await getSession();
    if (sessionResponse.error || !sessionResponse.data) {
      return NextResponse.json(
        { success: false, error: 'No valid session found' },
        { status: 401 }
      );
    }

    // Get user information
    const userResponse = await getUser();
    if (userResponse.error || !userResponse.data) {
      return NextResponse.json(
        { success: false, error: 'User not found or not authorized' },
        { status: 401 }
      );
    }

    // Check if session is expiring soon
    const sessionExpiringSoon = isSessionExpiringSoon(sessionResponse.data);

    console.log('Session validation successful for user:', userResponse.data.id);

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: userResponse.data.id,
          email: userResponse.data.email,
          fullName: userResponse.data.fullName,
          role: userResponse.data.role,
        },
        session: {
          expiresAt: sessionResponse.data.expires_at,
          expiringSoon: sessionExpiringSoon,
        },
      },
    });

  } catch (error) {
    console.error('Session validation error:', error);
    return NextResponse.json(
      { success: false, error: 'Session validation failed' },
      { status: 500 }
    );
  }
}

// POST: Refresh the current session
export async function POST(request: NextRequest) {
  try {
    console.log('Session refresh request');

    // Check if current session exists
    const currentSessionResponse = await getSession();
    if (currentSessionResponse.error || !currentSessionResponse.data) {
      return NextResponse.json(
        { success: false, error: 'No valid session to refresh' },
        { status: 401 }
      );
    }

    // Attempt to refresh the session
    const refreshResponse = await refreshSession();
    if (refreshResponse.error || !refreshResponse.data) {
      return NextResponse.json(
        { success: false, error: refreshResponse.error || 'Session refresh failed' },
        { status: 401 }
      );
    }

    // Get updated user information
    const userResponse = await getUser();
    if (userResponse.error || !userResponse.data) {
      return NextResponse.json(
        { success: false, error: 'User not found after session refresh' },
        { status: 401 }
      );
    }

    console.log('Session refresh successful for user:', userResponse.data.id);

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: userResponse.data.id,
          email: userResponse.data.email,
          fullName: userResponse.data.fullName,
          role: userResponse.data.role,
        },
        session: {
          expiresAt: refreshResponse.data.expires_at,
          expiringSoon: false, // Just refreshed
        },
      },
      message: 'Session refreshed successfully',
    });

  } catch (error) {
    console.error('Session refresh error:', error);
    return NextResponse.json(
      { success: false, error: 'Session refresh failed' },
      { status: 500 }
    );
  }
} 