import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { AccessRequestStatus, AccessRequestSource } from '@/types/admin';

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 5; // Max 5 requests per minute per IP
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();

// Helper function to validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Helper function to normalize email
function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

// Helper function to check rate limiting
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(ip);

  if (!userLimit) {
    rateLimitMap.set(ip, { count: 1, timestamp: now });
    return true;
  }

  // Reset count if window has passed
  if (now - userLimit.timestamp > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { count: 1, timestamp: now });
    return true;
  }

  // Check if under limit
  if (userLimit.count < RATE_LIMIT_MAX_REQUESTS) {
    userLimit.count++;
    return true;
  }

  return false;
}

// Clean up old rate limit entries
function cleanupRateLimit() {
  const now = Date.now();
  for (const [ip, data] of rateLimitMap.entries()) {
    if (now - data.timestamp > RATE_LIMIT_WINDOW) {
      rateLimitMap.delete(ip);
    }
  }
}

// Basic spam protection - check for suspicious patterns
function detectSpam(email: string): boolean {
  const suspiciousPatterns = [
    /^[a-z0-9]{20,}@/, // Very long username
    /\+.{10,}@/, // Very long plus addressing
    /\.(tk|ml|ga|cf)$/, // Suspicious TLDs
    /[0-9]{5,}/, // Many consecutive numbers
    /(.)\1{4,}/, // Repeated characters (5+ times)
  ];

  return suspiciousPatterns.some(pattern => pattern.test(email.toLowerCase()));
}

// Helper function to create access request for beta waitlist signup
async function createBetaAccessRequest(email: string, clientIP: string, userAgent: string | null): Promise<{ success: boolean; error?: string; data?: any }> {
  try {
    console.log('Creating beta access request for:', email);

    // Check if access request already exists for this email
    const { data: existingRequest, error: checkError } = await supabase
      .from('access_requests')
      .select('id, requester_email, source')
      .eq('requester_email', email)
      .eq('source', AccessRequestSource.BETA_WAITLIST)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error checking existing access request:', checkError);
      return { success: false, error: 'Database check failed' };
    }

    // If access request already exists, return success (idempotent)
    if (existingRequest) {
      console.log('Beta access request already exists for:', email);
      return { success: true, data: existingRequest };
    }

    // Create new beta access request
    const requestData = {
      requester_email: email,
      requester_name: null, // Beta users don't provide names initially
      account_id: null, // Beta requests don't specify accounts initially
      request_date: new Date().toISOString(),
      status: AccessRequestStatus.PENDING,
      source: AccessRequestSource.BETA_WAITLIST,
      metadata: {
        origin: 'beta_waitlist',
        signup_ip: clientIP !== 'unknown' ? clientIP : null,
        user_agent: userAgent,
        auto_created: true,
        signup_timestamp: new Date().toISOString()
      },
      notes: 'Auto-created from beta waitlist signup',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: newRequest, error: insertError } = await supabase
      .from('access_requests')
      .insert(requestData)
      .select('id, requester_email, source, status, created_at')
      .single();

    if (insertError) {
      console.error('Failed to create beta access request:', insertError);
      return { success: false, error: 'Access request creation failed' };
    }

    console.log('✅ Beta access request created successfully:', newRequest?.id);
    return { success: true, data: newRequest };

  } catch (error) {
    console.error('Error in createBetaAccessRequest:', error);
    return { success: false, error: 'Unexpected error during access request creation' };
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Mailing list subscription API called');

    // Get client IP for rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';

    console.log('Client IP:', clientIP);

    // Clean up old rate limit entries periodically
    cleanupRateLimit();

    // Check rate limiting
    if (!checkRateLimit(clientIP)) {
      console.log('Rate limit exceeded for IP:', clientIP);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Too many subscription attempts. Please try again later.',
          code: 'RATE_LIMITED'
        },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await request.json();
    console.log('Request body received');

    // Validate required fields
    if (!body.email || typeof body.email !== 'string') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Email address is required',
          code: 'MISSING_EMAIL'
        },
        { status: 400 }
      );
    }

    // Normalize email
    const email = normalizeEmail(body.email);
    console.log('Processing email:', email);

    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Please enter a valid email address',
          code: 'INVALID_EMAIL'
        },
        { status: 400 }
      );
    }

    // Basic spam protection
    if (detectSpam(email)) {
      console.log('Potential spam detected for email:', email);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid email address format',
          code: 'INVALID_EMAIL'
        },
        { status: 400 }
      );
    }

    // Check for existing subscription
    console.log('Checking for existing subscription...');
    const { data: existingSubscription, error: checkError } = await supabase
      .from('mailing_list_subscribers')
      .select('id, email, subscribed_at')
      .eq('email', email)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Database check error:', checkError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Unable to process subscription. Please try again.',
          code: 'DATABASE_ERROR'
        },
        { status: 500 }
      );
    }

    // If email already exists, return success (idempotent operation)
    if (existingSubscription) {
      console.log('Email already subscribed:', email);

      // Check if beta access request exists and create if not
      const accessRequestResult = await createBetaAccessRequest(
        email, 
        clientIP, 
        request.headers.get('user-agent')
      );

      let responseData = {
        email: existingSubscription.email,
        subscribedAt: existingSubscription.subscribed_at,
        alreadySubscribed: true,
      };

      // Include access request information if successful
      if (accessRequestResult.success) {
        responseData = {
          ...responseData,
          accessRequest: {
            id: accessRequestResult.data?.id,
            status: accessRequestResult.data?.status,
            created: !accessRequestResult.data?.id // false if already existed
          }
        };
      }

      return NextResponse.json({
        success: true,
        message: 'You are already subscribed to our mailing list!',
        data: responseData,
      });
    }

    // Insert new subscription
    console.log('Adding new subscription...');
    const { data: newSubscription, error: insertError } = await supabase
      .from('mailing_list_subscribers')
      .insert({
        email: email,
        subscribed_at: new Date().toISOString(),
        ip_address: clientIP !== 'unknown' ? clientIP : null,
        user_agent: request.headers.get('user-agent') || null,
      })
      .select('id, email, subscribed_at')
      .single();

    if (insertError) {
      console.error('Subscription insertion error:', insertError);
      
      // Handle duplicate key error specifically
      if (insertError.code === '23505') {
        return NextResponse.json({
          success: true,
          message: 'You are already subscribed to our mailing list!',
          data: {
            email: email,
            alreadySubscribed: true,
          },
        });
      }

      return NextResponse.json(
        { 
          success: false, 
          error: 'Unable to complete subscription. Please try again.',
          code: 'SUBSCRIPTION_FAILED'
        },
        { status: 500 }
      );
    }

    console.log('Subscription successful:', newSubscription?.id);

    // Add analytics tracking
    console.log(`New mailing list subscription: ${email} from IP: ${clientIP}`);

    // Create beta access request (non-blocking)
    const accessRequestResult = await createBetaAccessRequest(
      email, 
      clientIP, 
      request.headers.get('user-agent')
    );

    let responseData = {
      email: newSubscription.email,
      subscribedAt: newSubscription.subscribed_at,
      alreadySubscribed: false,
    };

    // Include access request information if successful
    if (accessRequestResult.success) {
      console.log('✅ Beta access request created for:', email);
      responseData = {
        ...responseData,
        accessRequest: {
          id: accessRequestResult.data?.id,
          status: accessRequestResult.data?.status,
          created: true
        }
      };
    } else {
      // Log the error but don't fail the subscription
      console.warn('⚠️ Failed to create beta access request:', accessRequestResult.error);
      console.warn('Subscription successful but access request creation failed for:', email);
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Thank you for subscribing! We\'ll keep you updated on FAQBNB.',
      data: responseData,
    }, { status: 201 });

  } catch (error) {
    console.error('Mailing list API error:', error);
    
    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request format',
          code: 'INVALID_JSON'
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'An unexpected error occurred. Please try again.',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}

// Optional: Add GET handler for subscription verification (if needed)
export async function GET(request: NextRequest) {
  return NextResponse.json(
    { 
      success: false, 
      error: 'Method not allowed. Use POST to subscribe to the mailing list.',
      code: 'METHOD_NOT_ALLOWED'
    },
    { status: 405 }
  );
} 