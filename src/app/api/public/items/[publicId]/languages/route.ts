/**
 * @fileoverview Language Availability API Endpoint (Epic 4 - Guest Experience)
 *
 * Returns list of available translations for a specific item. No authentication required.
 * This endpoint enables guest-facing language switcher components to show only available languages.
 *
 * @description
 * This endpoint queries the item_translations table to find all completed translations
 * for a given item. The source language is always included in the response, even if
 * no translations exist. Language codes are enriched with metadata (native names, flags)
 * for UI rendering.
 *
 * Cache strategy: 10-minute CDN cache, 30-minute stale-while-revalidate
 * (longer than main item endpoint since language availability changes infrequently)
 *
 * @module api/public/items/[publicId]/languages
 * @since Epic 4 - Guest Experience
 *
 * @example
 * // Request available languages for an item
 * GET /api/public/items/abc-123/languages
 *
 * // Response
 * {
 *   "success": true,
 *   "availableLanguages": [
 *     { "code": "en", "name": "English", "nativeName": "English", "flag": "GB" },
 *     { "code": "fr", "name": "French", "nativeName": "Francais", "flag": "FR" }
 *   ],
 *   "sourceLanguage": "en"
 * }
 *
 * Last Modified: 2026-01-23 11:15
 */

import { NextRequest, NextResponse } from 'next/server';
import type { SupportedLanguage, LanguageInfo } from '@/types/l10n';
import { SUPPORTED_LANGUAGES } from '@/types/l10n';
import { supabaseAdmin } from '@/lib/supabase';

// =============================================================================
// Type Definitions
// =============================================================================

/**
 * Error response structure used for all error scenarios (400, 404, 500).
 * Provides consistent format for clients to handle errors programmatically.
 */
interface ErrorResponse {
  success: false;
  error: string;
}

/**
 * Success response structure matching LanguageAvailabilityResponse from REQ-E04-001.
 * Contains available languages with metadata and the source language.
 */
interface SuccessResponse {
  success: true;
  availableLanguages: LanguageInfo[];
  sourceLanguage: SupportedLanguage;
}

/**
 * Union type for all possible API responses.
 */
type APIResponse = SuccessResponse | ErrorResponse;

// =============================================================================
// GET Handler
// =============================================================================

/**
 * GET handler for language availability endpoint.
 *
 * Returns the list of available translations for a specific item, including
 * the source language which is always available. Only completed translations
 * are included in the response.
 *
 * @route GET /api/public/items/[publicId]/languages
 * @returns NextResponse with available languages or error
 *
 * @example Request:
 * GET /api/public/items/abc-123/languages
 *
 * @example Success Response (200):
 * {
 *   "success": true,
 *   "availableLanguages": [
 *     { "code": "en", "name": "English", "nativeName": "English", "flag": "GB" },
 *     { "code": "fr", "name": "French", "nativeName": "Francais", "flag": "FR" },
 *     { "code": "de", "name": "German", "nativeName": "Deutsch", "flag": "DE" }
 *   ],
 *   "sourceLanguage": "en"
 * }
 *
 * @example Error Response (404):
 * {
 *   "success": false,
 *   "error": "Item not found"
 * }
 *
 * @throws Never - catches all errors and returns appropriate HTTP responses
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ publicId: string }> }
): Promise<NextResponse<APIResponse>> {
  // Request logging for monitoring and performance tracking
  const startTime = Date.now();

  try {
    // Extract publicId from dynamic route parameter (Next.js 15 pattern)
    const { publicId } = await context.params;

    // Validate required parameter
    if (!publicId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Public ID is required',
        } as ErrorResponse,
        { status: 400 }
      );
    }

    // Step 1: Fetch item to get ID and source language
    // Query by public_id (guest-facing identifier) to get internal UUID and source language
    const { data: item, error: itemError } = await supabaseAdmin
      .from('items')
      .select('id, source_language')
      .eq('public_id', publicId)
      .single();

    if (itemError || !item) {
      const duration = Date.now() - startTime;
      console.warn(
        `[api/public/items/languages] Item not found: ${publicId} duration=${duration}ms`
      );
      return NextResponse.json(
        {
          success: false,
          error: 'Item not found',
        } as ErrorResponse,
        { status: 404 }
      );
    }

    const itemId = item.id;
    const sourceLanguage: SupportedLanguage =
      (item.source_language as SupportedLanguage) || 'en';

    console.info(
      `[api/public/items/languages] Found item: ${publicId} source: ${sourceLanguage}`
    );

    // Step 2: Query available translations (completed only)
    // Only completed translations are shown to users - pending/failed are excluded
    const { data: translations, error: transError } = await supabaseAdmin
      .from('item_translations')
      .select('language')
      .eq('item_id', itemId)
      .eq('translation_status', 'completed');

    if (transError) {
      console.warn(
        '[api/public/items/languages] Error fetching translations:',
        transError
      );
      // Treat query error as no translations available (don't fail request)
    }

    const completedLanguages: SupportedLanguage[] = (translations || []).map(
      (t) => t.language as SupportedLanguage
    );

    console.info(
      `[api/public/items/languages] Found ${completedLanguages.length} completed translations for item: ${publicId}`
    );

    // Step 3: Combine source language with completed translations
    // Source language is always available (original content)
    const allLanguageCodes = new Set<SupportedLanguage>([
      sourceLanguage,
      ...completedLanguages,
    ]);
    const uniqueLanguages = Array.from(allLanguageCodes);

    console.info(
      `[api/public/items/languages] Total available languages: ${uniqueLanguages.length} codes: ${uniqueLanguages.join(', ')}`
    );

    // Step 4: Map language codes to LanguageInfo objects with metadata
    // Enrich language codes with UI-ready metadata (native name, English name, flag emoji)
    const availableLanguages: LanguageInfo[] = uniqueLanguages
      .map((code) => SUPPORTED_LANGUAGES.find((lang) => lang.code === code))
      .filter((lang): lang is LanguageInfo => lang !== undefined);

    // Sort languages: put source language first, then alphabetically by code
    availableLanguages.sort((a, b) => {
      if (a.code === sourceLanguage) return -1;
      if (b.code === sourceLanguage) return 1;
      return a.code.localeCompare(b.code);
    });

    console.info(
      `[api/public/items/languages] Enriched ${availableLanguages.length} languages with metadata`
    );

    // Step 5: Build response with available languages and source language
    const responseData: SuccessResponse = {
      success: true,
      availableLanguages,
      sourceLanguage,
    };

    // Build response headers
    const headers = new Headers();

    // Cache for 10 minutes (longer than main endpoint since language availability changes infrequently)
    headers.set(
      'Cache-Control',
      'public, s-maxage=600, stale-while-revalidate=1800'
    );

    // Log successful response
    const duration = Date.now() - startTime;
    console.info(
      `[api/public/items/languages] GET ${publicId} status=200 languages=${availableLanguages.length} source=${sourceLanguage} duration=${duration}ms`
    );

    return NextResponse.json(responseData, { status: 200, headers });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(
      '[api/public/items/languages] Unexpected error:',
      error instanceof Error ? error.message : String(error),
      `duration=${duration}ms`
    );

    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred. Please try again later.',
      } as ErrorResponse,
      { status: 500 }
    );
  }
}
