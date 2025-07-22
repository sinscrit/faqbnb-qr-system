import { NextRequest, NextResponse } from 'next/server';
import { signInWithEmail } from '@/lib/auth';

interface LoginRequest {
  email: string;
  password: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    
    // Validate request body
    if (!body.email || !body.password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    console.log('Login attempt for:', body.email);

    // Attempt to sign in
    const result = await signInWithEmail(body.email, body.password);

    if (result.error) {
      console.log('Login failed:', result.error);
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 401 }
      );
    }

    if (!result.data) {
      return NextResponse.json(
        { success: false, error: 'Login failed - no data returned' },
        { status: 500 }
      );
    }

    console.log('Login successful for:', body.email);

    // Return success response with user data (no session data for security)
    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: result.data.user.id,
          email: result.data.user.email,
          fullName: result.data.user.fullName,
          role: result.data.user.role,
        },
      },
    });

  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 