// /src/app/api/user/language/route.ts
// REQ-251: User Language Preference Update Endpoint
// Phase: 5 - Language Switching Infrastructure
// Task ID: 5.6
// Last Modified: 2026-01-18

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase-server';

// Supported language codes (matches i18n configuration)
const SUPPORTED_LANGUAGES = ['en', 'fr', 'es', 'de', 'nl', 'it'] as const;
type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

/**
 * Type guard to check if a language code is supported
 */
function isValidLanguage(code: string): code is SupportedLanguage {
  return SUPPORTED_LANGUAGES.includes(code as SupportedLanguage);
}

// Response interfaces
interface SuccessResponse {
  success: true;
  data: {
    language: string;
    updatedAt?: string;
    supportedLanguages?: string[];
  };
}

interface ErrorResponse {
  success: false;
  error: string;
  code: string;
  supportedLanguages?: string[];
}

type ApiResponse = SuccessResponse | ErrorResponse;

/**
 * GET /api/user/language
 * Get the authenticated user's current preferred language
 */
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const supabase = await createSupabaseServer();

    // Validate authentication
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // Get user's current language preference
    const { data: userData, error: fetchError } = await supabase
      .from('users')
      .select('preferred_language')
      .eq('id', user.id)
      .single();

    if (fetchError) {
      console.error('[API] /api/user/language GET: Database fetch error:', fetchError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch language preference', code: 'FETCH_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        language: userData?.preferred_language || 'en',
        supportedLanguages: [...SUPPORTED_LANGUAGES],
      },
    });

  } catch (error) {
    console.error('[API] /api/user/language GET: Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/user/language
 * Update the authenticated user's preferred language
 */
export async function PUT(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const supabase = await createSupabaseServer();

    // Step 1: Validate authentication
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.log('[API] /api/user/language PUT: Unauthorized request');
      return NextResponse.json(
        { success: false, error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // Step 2: Parse request body
    let body: { language?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON body', code: 'INVALID_BODY' },
        { status: 400 }
      );
    }

    const { language } = body;

    // Step 3: Validate language parameter exists
    if (!language) {
      return NextResponse.json(
        {
          success: false,
          error: 'Language parameter is required',
          code: 'MISSING_LANGUAGE',
          supportedLanguages: [...SUPPORTED_LANGUAGES],
        },
        { status: 400 }
      );
    }

    // Step 4: Normalize and validate language
    const normalizedLanguage = language.toLowerCase().trim();
    if (!isValidLanguage(normalizedLanguage)) {
      return NextResponse.json(
        {
          success: false,
          error: `Language "${language}" is not supported`,
          code: 'INVALID_LANGUAGE',
          supportedLanguages: [...SUPPORTED_LANGUAGES],
        },
        { status: 400 }
      );
    }

    // Step 5: Update user's preferred language in database
    const { error: updateError } = await supabase
      .from('users')
      .update({
        preferred_language: normalizedLanguage,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('[API] /api/user/language PUT: Database update error:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update language preference', code: 'UPDATE_FAILED' },
        { status: 500 }
      );
    }

    // Step 6: Return success response
    const updatedAt = new Date().toISOString();
    console.log('[API] /api/user/language PUT: Language updated', {
      userId: user.id,
      language: normalizedLanguage,
      updatedAt
    });

    return NextResponse.json({
      success: true,
      data: {
        language: normalizedLanguage,
        updatedAt,
      },
    });

  } catch (error) {
    console.error('[API] /api/user/language PUT: Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
