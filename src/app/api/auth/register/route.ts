import { NextRequest, NextResponse } from 'next/server';
import { registerUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { 
  validateAccessCodeForRegistration, 
  consumeAccessCode 
} from '@/lib/access-validation';

// Rate limiting configuration (simple in-memory store)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_ATTEMPTS = 5; // 5 registration attempts per 15 minutes per IP

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password validation - at least 8 characters, 1 letter, 1 number
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  if (realIp) {
    return realIp.trim();
  }
  
  return 'unknown';
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitStore.get(ip);
  
  if (!userLimit || now > userLimit.resetTime) {
    // Reset or initialize rate limit
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (userLimit.count >= RATE_LIMIT_MAX_ATTEMPTS) {
    return false;
  }
  
  userLimit.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Check rate limiting
    const clientIp = getClientIp(request);
    if (!checkRateLimit(clientIp)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Too many registration attempts. Please try again in 15 minutes.' 
        },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await request.json().catch(() => null);
    
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { email, password, fullName, confirmPassword, accessCode } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Enhanced validation for access code registration flow
    if (accessCode) {
      console.log('🔒 REGISTRATION_API: ACCESS_CODE_FLOW', {
        timestamp: new Date().toISOString(),
        email: email,
        hasAccessCode: !!accessCode
      });

      // Validate access code for registration
      const accessValidation = await validateAccessCodeForRegistration(accessCode, email);
      
      if (!accessValidation.isValid) {
        console.log('🔒 REGISTRATION_API: ACCESS_CODE_INVALID', {
          timestamp: new Date().toISOString(),
          error: accessValidation.error,
          errorCode: accessValidation.errorCode
        });
        
        return NextResponse.json(
          { 
            success: false, 
            error: accessValidation.error || 'Invalid access code',
            errorCode: accessValidation.errorCode
          },
          { status: 403 }
        );
      }

      console.log('🔒 REGISTRATION_API: ACCESS_CODE_VALID', {
        timestamp: new Date().toISOString(),
        requestId: accessValidation.request?.id,
        hasMetadata: !!accessValidation.metadata
      });

      // For access code flow, we trust the email from the validated request
      // Skip email format validation since it was already validated in access code
    } else {
      // Standard registration flow - validate email format
      if (!EMAIL_REGEX.test(email)) {
        return NextResponse.json(
          { success: false, error: 'Please enter a valid email address' },
          { status: 400 }
        );
      }
    }

    // Validate password strength
    if (!PASSWORD_REGEX.test(password)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Password must be at least 8 characters long and contain at least one letter and one number' 
        },
        { status: 400 }
      );
    }

    // Validate password confirmation if provided
    if (confirmPassword && password !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: 'Passwords do not match' },
        { status: 400 }
      );
    }

    // Validate full name if provided
    if (fullName && (typeof fullName !== 'string' || fullName.trim().length < 2)) {
      return NextResponse.json(
        { success: false, error: 'Full name must be at least 2 characters long' },
        { status: 400 }
      );
    }

    // Attempt registration (Supabase will handle duplicate email detection)
    const registrationResult = await registerUser(
      email.toLowerCase().trim(),
      password,
      fullName?.trim()
    );

    if (registrationResult.error) {
      console.error('Registration failed:', registrationResult.error);
      
      // Handle specific error cases
      let errorMessage = registrationResult.error;
      let statusCode = 400;
      
      if (registrationResult.error.includes('already registered')) {
        errorMessage = 'An account with this email address already exists';
        statusCode = 409;
      } else if (registrationResult.error.includes('password')) {
        errorMessage = 'Password does not meet security requirements';
      } else if (registrationResult.error.includes('email')) {
        errorMessage = 'Please enter a valid email address';
      }
      
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: statusCode }
      );
    }

    if (!registrationResult.data) {
      return NextResponse.json(
        { success: false, error: 'Registration failed - no data returned' },
        { status: 500 }
      );
    }

    // If access code was used, mark it as consumed
    if (accessCode) {
      console.log('🔒 REGISTRATION_API: CONSUMING_ACCESS_CODE', {
        timestamp: new Date().toISOString(),
        userId: registrationResult.data.user.id,
        accessCode: `${accessCode.substring(0, 4)}...`
      });

      const consumeResult = await consumeAccessCode(accessCode, registrationResult.data.user.id);
      
      if (!consumeResult.success) {
        console.error('🔒 REGISTRATION_API: ACCESS_CODE_CONSUME_FAILED', {
          timestamp: new Date().toISOString(),
          error: consumeResult.error,
          errorCode: consumeResult.errorCode
        });
        // Note: We don't fail the registration here since the user was already created
        // This is just a warning that the access code couldn't be marked as used
      } else {
        console.log('🔒 REGISTRATION_API: ACCESS_CODE_CONSUMED', {
          timestamp: new Date().toISOString(),
          requestId: consumeResult.requestId,
          registrationDate: consumeResult.registrationDate
        });
      }
    }

    // Return success response (don't include sensitive session data)
    return NextResponse.json({
      success: true,
      message: 'Registration successful',
      user: {
        id: registrationResult.data.user.id,
        email: registrationResult.data.user.email,
        fullName: registrationResult.data.user.fullName,
        role: registrationResult.data.user.role,
      },
      // Include access code metadata if available
      ...(accessCode && {
        accessCodeUsed: true,
        registrationMethod: 'access_code'
      })
    }, { status: 201 });

  } catch (error) {
    console.error('Registration endpoint error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'An unexpected error occurred during registration. Please try again.' 
      },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { success: false, error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { success: false, error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { success: false, error: 'Method not allowed' },
    { status: 405 }
  );
} 