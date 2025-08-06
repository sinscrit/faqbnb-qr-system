import { NextRequest, NextResponse } from 'next/server';
import { validateAccessCode } from '@/lib/access-management';
import { AccessRequest } from '@/types/admin';

// Rate limiting - simple in-memory store (in production, use Redis)
const rateLimitStore = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10;

function getRateLimitKey(request: NextRequest): string {
  // Use IP address for rate limiting
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0] || request.headers.get('x-real-ip') || 'unknown';
  return `validate-code:${ip}`;
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const requests = rateLimitStore.get(key) || [];
  
  // Remove old requests outside the window
  const recentRequests = requests.filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW_MS);
  
  // Update the store
  rateLimitStore.set(key, recentRequests);
  
  // Check if rate limited
  return recentRequests.length >= RATE_LIMIT_MAX_REQUESTS;
}

function addRateLimitEntry(key: string): void {
  const now = Date.now();
  const requests = rateLimitStore.get(key) || [];
  requests.push(now);
  rateLimitStore.set(key, requests);
}

interface ValidationResponse {
  isValid: boolean;
  request?: AccessRequest;
  account?: any;
  error?: string;
}

/**
 * GET /api/auth/validate-code
 * Validates an access code for registration
 * 
 * Query Parameters:
 * - code: The access code to validate (required)
 * - email: The email to match against (required)
 */
export async function GET(request: NextRequest) {
  const DEBUG_PREFIX = "🔒 VALIDATE_CODE_API:";
  
  try {
    console.log(`${DEBUG_PREFIX} REQUEST_RECEIVED`, {
      timestamp: new Date().toISOString(),
      url: request.url,
      method: request.method
    });

    // Rate limiting check
    const rateLimitKey = getRateLimitKey(request);
    if (isRateLimited(rateLimitKey)) {
      console.log(`${DEBUG_PREFIX} RATE_LIMITED`, {
        timestamp: new Date().toISOString(),
        key: rateLimitKey
      });
      
      return NextResponse.json(
        { 
          isValid: false, 
          error: 'Too many validation attempts. Please try again later.' 
        },
        { 
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Limit': RATE_LIMIT_MAX_REQUESTS.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': Math.ceil((Date.now() + RATE_LIMIT_WINDOW_MS) / 1000).toString()
          }
        }
      );
    }

    // Add to rate limit tracking
    addRateLimitEntry(rateLimitKey);

    // Extract and validate parameters
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const email = searchParams.get('email');

    console.log(`${DEBUG_PREFIX} EXTRACTING_PARAMS`, {
      timestamp: new Date().toISOString(),
      hasCode: !!code,
      codeLength: code?.length,
      hasEmail: !!email,
      email: email
    });

    // Validate parameter presence
    if (!code || !email) {
      console.log(`${DEBUG_PREFIX} MISSING_PARAMETERS`, {
        timestamp: new Date().toISOString(),
        hasCode: !!code,
        hasEmail: !!email
      });
      
      return NextResponse.json(
        { 
          isValid: false, 
          error: 'Both code and email parameters are required' 
        },
        { status: 400 }
      );
    }

    // Validate parameter format
    const codePattern = /^[A-Z0-9]{12}$/;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!codePattern.test(code)) {
      console.log(`${DEBUG_PREFIX} INVALID_CODE_FORMAT`, {
        timestamp: new Date().toISOString(),
        code: `${code.substring(0, 4)}...`,
        pattern: 'Must be 12 uppercase alphanumeric characters'
      });
      
      return NextResponse.json(
        { 
          isValid: false, 
          error: 'Invalid access code format' 
        },
        { status: 400 }
      );
    }

    if (!emailPattern.test(email)) {
      console.log(`${DEBUG_PREFIX} INVALID_EMAIL_FORMAT`, {
        timestamp: new Date().toISOString(),
        email: email
      });
      
      return NextResponse.json(
        { 
          isValid: false, 
          error: 'Invalid email format' 
        },
        { status: 400 }
      );
    }

    // Call the validation function
    console.log(`${DEBUG_PREFIX} CALLING_VALIDATION`, {
      timestamp: new Date().toISOString(),
      code: `${code.substring(0, 4)}...`,
      email: email
    });

    const validationResult = await validateAccessCode(code);

    if (!validationResult.isValid) {
      console.log(`${DEBUG_PREFIX} CODE_VALIDATION_FAILED`, {
        timestamp: new Date().toISOString(),
        error: validationResult.error
      });
      
      return NextResponse.json(
        { 
          isValid: false, 
          error: validationResult.error || 'Invalid access code'
        },
        { status: 404 }
      );
    }

    // Check if email matches the request
    if (validationResult.request?.requester_email !== email) {
      console.log(`${DEBUG_PREFIX} EMAIL_MISMATCH`, {
        timestamp: new Date().toISOString(),
        providedEmail: email,
        requestEmail: validationResult.request?.requester_email ? 
          `${validationResult.request.requester_email.substring(0, 3)}...` : 'none'
      });
      
      return NextResponse.json(
        { 
          isValid: false, 
          error: 'Email does not match the access request' 
        },
        { status: 403 }
      );
    }

    // Check if the code has already been used for registration
    if (validationResult.request?.status === 'registered') {
      console.log(`${DEBUG_PREFIX} CODE_ALREADY_USED`, {
        timestamp: new Date().toISOString(),
        registrationDate: validationResult.request.registration_date
      });
      
      return NextResponse.json(
        { 
          isValid: false, 
          error: 'This access code has already been used for registration' 
        },
        { status: 409 }
      );
    }

    // Success response
    console.log(`${DEBUG_PREFIX} VALIDATION_SUCCESS`, {
      timestamp: new Date().toISOString(),
      requestId: validationResult.request?.id,
      status: validationResult.request?.status,
      hasAccount: !!validationResult.request?.account_id
    });

    const response: ValidationResponse = {
      isValid: true,
      request: validationResult.request,
      account: validationResult.request?.account_id ? {
        id: validationResult.request.account_id
      } : null
    };

    return NextResponse.json(response, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error(`${DEBUG_PREFIX} INTERNAL_ERROR:`, error);
    
    return NextResponse.json(
      { 
        isValid: false, 
        error: 'Internal server error during validation' 
      },
      { status: 500 }
    );
  }
}

// Only allow GET method
export async function POST() {
  return NextResponse.json(
    { error: 'Method not allowed. Use GET.' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed. Use GET.' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed. Use GET.' },
    { status: 405 }
  );
}