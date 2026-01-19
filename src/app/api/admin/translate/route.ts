/**
 * Admin Translation Testing API Endpoint
 * REQ-242: Manual Translation Testing for Administrators
 *
 * This endpoint allows administrators to manually test the translation service
 * by submitting text for translation between supported languages.
 *
 * @module api/admin/translate
 * @created 2026-01-18
 * @lastModified 2026-01-18
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAuth } from '@/lib/auth-server';

// =============================================================================
// Type Definitions
// =============================================================================

/**
 * Supported language codes for translation
 * Matches Phase 1 database schema language constraints
 */
type SupportedLanguage = 'en' | 'fr' | 'es' | 'de' | 'nl' | 'it';

/**
 * Content type categories for context-aware translation
 */
type ContentType = 'item_name' | 'item_description' | 'article_title' | 'article_description' | 'link_title' | 'tag';

/**
 * Request body for translation testing endpoint
 */
interface TranslateTestRequest {
  /** Text to translate (max 5000 characters) */
  text: string;
  /** Source language code */
  sourceLanguage: SupportedLanguage;
  /** Target language(s) for translation */
  targetLanguages: SupportedLanguage[];
  /** Optional: Force specific provider for testing */
  provider?: 'claude' | 'openai';
  /** Optional: Content type context for better translations */
  contentType?: ContentType;
  /** Optional: Domain context hint */
  domainContext?: string;
}

/**
 * Individual translation result for a target language
 */
interface TranslationResult {
  /** Translated text */
  text: string;
  /** Provider that handled this translation */
  provider: 'claude' | 'openai';
  /** Processing time in milliseconds */
  durationMs?: number;
}

/**
 * Response body for translation testing endpoint
 */
interface TranslateTestResponse {
  success: boolean;
  data?: {
    /** Original text submitted */
    originalText: string;
    /** Source language */
    sourceLanguage: SupportedLanguage;
    /** Translation results by target language */
    translations: Partial<Record<SupportedLanguage, TranslationResult>>;
    /** Total tokens used (if available from provider) */
    totalTokensUsed?: number;
    /** Total processing time in milliseconds */
    totalDurationMs: number;
  };
  error?: string;
  code?: string;
}

// =============================================================================
// Constants
// =============================================================================

const SUPPORTED_LANGUAGES: SupportedLanguage[] = ['en', 'fr', 'es', 'de', 'nl', 'it'];
const VALID_CONTENT_TYPES: ContentType[] = ['item_name', 'item_description', 'article_title', 'article_description', 'link_title', 'tag'];
const MAX_TEXT_LENGTH = 5000;
const MAX_TARGET_LANGUAGES = 5;

// =============================================================================
// Translation Service Import (conditional)
// =============================================================================

// Dynamic import to handle case where translation service may not exist yet
let translateText: ((
  text: string,
  sourceLanguage: SupportedLanguage,
  targetLanguage: SupportedLanguage,
  options?: { provider?: 'claude' | 'openai'; context?: { contentType?: ContentType; domainContext?: string } }
) => Promise<{
  translatedText: string;
  provider: 'claude' | 'openai';
  tokensUsed?: number;
  durationMs?: number;
  usedFallback: boolean;
  retryAttempts: number;
}>) | null = null;

const loadTranslationService = async () => {
  if (translateText !== null) return;

  try {
    const translationService = await import('@/lib/translation-service');
    translateText = translationService.translateText;
  } catch (error) {
    console.warn('[TranslateTest] Translation service not available:', error);
    translateText = null;
  }
};

// =============================================================================
// Validation
// =============================================================================

/**
 * Validates the translation request body
 * @returns null if valid, error message string if invalid
 */
function validateTranslationRequest(body: unknown): string | null {
  if (!body || typeof body !== 'object') {
    return 'Request body is required';
  }

  const request = body as Partial<TranslateTestRequest>;

  // Validate text field
  if (!request.text || typeof request.text !== 'string') {
    return 'text field is required and must be a string';
  }
  if (request.text.trim().length === 0) {
    return 'text field cannot be empty';
  }
  if (request.text.length > MAX_TEXT_LENGTH) {
    return `text field exceeds maximum length of ${MAX_TEXT_LENGTH} characters`;
  }

  // Validate sourceLanguage
  if (!request.sourceLanguage || typeof request.sourceLanguage !== 'string') {
    return 'sourceLanguage field is required';
  }
  if (!SUPPORTED_LANGUAGES.includes(request.sourceLanguage as SupportedLanguage)) {
    return `sourceLanguage must be one of: ${SUPPORTED_LANGUAGES.join(', ')}`;
  }

  // Validate targetLanguages
  if (!request.targetLanguages || !Array.isArray(request.targetLanguages)) {
    return 'targetLanguages field is required and must be an array';
  }
  if (request.targetLanguages.length === 0) {
    return 'targetLanguages array cannot be empty';
  }
  if (request.targetLanguages.length > MAX_TARGET_LANGUAGES) {
    return `targetLanguages array cannot exceed ${MAX_TARGET_LANGUAGES} languages`;
  }
  for (const lang of request.targetLanguages) {
    if (!SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage)) {
      return `Invalid target language: ${lang}. Must be one of: ${SUPPORTED_LANGUAGES.join(', ')}`;
    }
  }

  // Validate optional provider field
  if (request.provider !== undefined) {
    if (request.provider !== 'claude' && request.provider !== 'openai') {
      return 'provider must be either "claude" or "openai"';
    }
  }

  // Validate optional contentType field
  if (request.contentType !== undefined) {
    if (!VALID_CONTENT_TYPES.includes(request.contentType)) {
      return `contentType must be one of: ${VALID_CONTENT_TYPES.join(', ')}`;
    }
  }

  // Validate optional domainContext field
  if (request.domainContext !== undefined) {
    if (typeof request.domainContext !== 'string') {
      return 'domainContext must be a string';
    }
    if (request.domainContext.length > 500) {
      return 'domainContext cannot exceed 500 characters';
    }
  }

  return null;
}

// =============================================================================
// API Handler
// =============================================================================

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Step 1: Authenticate and authorize admin user
    const authResult = await validateAdminAuth(request);

    if (authResult.error) {
      return authResult.error;
    }

    if (!authResult.isAdmin && !authResult.isSysAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: 'Admin access required for translation testing',
          code: 'FORBIDDEN'
        },
        { status: 403 }
      );
    }

    console.log(`[TranslateTest] Admin ${authResult.user?.email} initiated translation test`);

    // Step 2: Parse and validate request body
    let body: TranslateTestRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid JSON in request body',
          code: 'INVALID_REQUEST'
        },
        { status: 400 }
      );
    }

    const validationError = validateTranslationRequest(body);
    if (validationError) {
      return NextResponse.json(
        {
          success: false,
          error: validationError,
          code: 'INVALID_REQUEST'
        },
        { status: 400 }
      );
    }

    // Step 3: Load and check translation service
    await loadTranslationService();

    if (translateText === null) {
      return NextResponse.json(
        {
          success: false,
          error: 'Translation service is not yet configured. Please ensure Phase 3 tasks 3.1-3.6 are complete.',
          code: 'SERVICE_UNAVAILABLE'
        },
        { status: 503 }
      );
    }

    // Step 4: Execute translations for each target language
    const translations: Partial<Record<SupportedLanguage, TranslationResult>> = {};
    let totalTokensUsed = 0;

    // Build translation context
    const context = body.contentType
      ? {
          contentType: body.contentType,
          domainContext: body.domainContext,
        }
      : undefined;

    console.log(`[TranslateTest] Translating "${body.text.substring(0, 50)}..." from ${body.sourceLanguage} to [${body.targetLanguages.join(', ')}]`);

    // Process each target language
    for (const targetLang of body.targetLanguages) {
      const langStartTime = Date.now();

      try {
        const result = await translateText(
          body.text,
          body.sourceLanguage,
          targetLang,
          {
            provider: body.provider,
            context,
          }
        );

        translations[targetLang] = {
          text: result.translatedText,
          provider: result.provider,
          durationMs: Date.now() - langStartTime,
        };

        if (result.tokensUsed) {
          totalTokensUsed += result.tokensUsed;
        }

        console.log(`[TranslateTest] ${targetLang}: Success in ${Date.now() - langStartTime}ms`);
      } catch (translationError: unknown) {
        const errorMessage = translationError instanceof Error ? translationError.message : 'Unknown error';
        console.error(`[TranslateTest] Translation failed for ${targetLang}:`, translationError);

        translations[targetLang] = {
          text: `[Translation failed: ${errorMessage}]`,
          provider: body.provider || 'claude',
          durationMs: Date.now() - langStartTime,
        };
      }
    }

    // Step 5: Return successful response
    const totalDurationMs = Date.now() - startTime;

    const response: TranslateTestResponse = {
      success: true,
      data: {
        originalText: body.text,
        sourceLanguage: body.sourceLanguage,
        translations,
        totalTokensUsed: totalTokensUsed > 0 ? totalTokensUsed : undefined,
        totalDurationMs,
      },
    };

    console.log(`[TranslateTest] Completed in ${totalDurationMs}ms, ${Object.keys(translations).length} translations`);

    return NextResponse.json(response, { status: 200 });

  } catch (error: unknown) {
    console.error('[TranslateTest] API error:', error);

    const errorMessage = error instanceof Error ? error.message : '';
    const isServiceError = errorMessage.includes('API') ||
                          errorMessage.includes('rate limit') ||
                          errorMessage.includes('timeout');

    return NextResponse.json(
      {
        success: false,
        error: isServiceError
          ? 'Translation service temporarily unavailable'
          : 'Internal server error',
        code: isServiceError ? 'SERVICE_UNAVAILABLE' : 'TRANSLATION_FAILED'
      },
      { status: isServiceError ? 503 : 500 }
    );
  }
}
