/**
 * @fileoverview Public Item API Endpoint with Translation Support (Epic 4 - Guest Experience)
 *
 * Serves item content with translations to unauthenticated guests. No authentication required.
 * This endpoint is publicly accessible and rate-limited to prevent abuse.
 *
 * @description
 * This endpoint enables guest users to fetch item data with translations merged.
 * It supports the `?lang=` query parameter to request specific translations.
 * When a translation is not available, it falls back to the original content
 * and indicates this via the `translationMeta.isTranslated` field.
 *
 * Rate limiting: 60 requests per minute per IP address
 * Caching: CDN cache for 5 minutes, stale-while-revalidate for 10 minutes
 *
 * @module api/public/items/[publicId]
 * @since Epic 4 - Guest Experience
 *
 * @example
 * // Request with default language detection
 * GET /api/public/items/abc-123
 *
 * // Request with specific language
 * GET /api/public/items/abc-123?lang=fr
 *
 * Last Modified: 2026-01-23 10:45
 */

import { NextRequest, NextResponse } from 'next/server';
import type { SupportedLanguage } from '@/types/l10n';
import { fetchTranslatedItem } from '@/lib/translations';
import { detectGuestLanguage } from '@/lib/i18n/guest-language';

// =============================================================================
// Type Definitions
// =============================================================================

/**
 * Error response structure used for all error scenarios (400, 404, 429, 500).
 * Provides consistent format for clients to handle errors programmatically.
 */
interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
}

// =============================================================================
// Rate Limiter Implementation
// =============================================================================

/**
 * Record tracking rate limit state for a single IP address.
 */
interface RateLimitRecord {
  /** Number of requests made in current window */
  count: number;
  /** Unix timestamp when the window resets */
  resetAt: number;
}

/**
 * In-memory store for rate limiting records.
 * Maps IP addresses to their rate limit state.
 *
 * @note For production with multiple instances, use Redis-based rate limiting
 */
const rateLimitStore = new Map<string, RateLimitRecord>();

/** Maximum requests allowed per window */
const RATE_LIMIT_MAX = 60;

/** Rate limit window duration in milliseconds (60 seconds) */
const RATE_LIMIT_WINDOW_MS = 60000;

/** Counter for cleanup trigger */
let requestCounter = 0;

/**
 * Checks and updates rate limit status for a given IP address.
 *
 * Implements a fixed-window rate limiting algorithm:
 * - Each IP gets 60 requests per 60-second window
 * - Window resets after the reset time passes
 * - Returns current quota status for rate limit headers
 *
 * @param ip - The client IP address to check
 * @returns Object with allowed status, remaining quota, and reset timestamp
 *
 * @note For production with multiple instances, use Redis-based rate limiting
 *
 * @example
 * const status = checkRateLimit('203.0.113.1');
 * if (!status.allowed) {
 *   return new Response('Rate limit exceeded', { status: 429 });
 * }
 */
function checkRateLimit(ip: string): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
} {
  const now = Date.now();

  // Periodic cleanup to prevent memory leak (every 1000 requests)
  requestCounter++;
  if (requestCounter >= 1000) {
    requestCounter = 0;
    for (const [key, record] of rateLimitStore.entries()) {
      if (record.resetAt < now) {
        rateLimitStore.delete(key);
      }
    }
  }

  // Get or initialize record for this IP
  let record = rateLimitStore.get(ip);

  if (!record || record.resetAt < now) {
    // Window expired or new IP, reset counter
    record = { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };
  }

  // Check if limit exceeded
  if (record.count >= RATE_LIMIT_MAX) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: record.resetAt,
    };
  }

  // Increment count and update store
  record.count++;
  rateLimitStore.set(ip, record);

  return {
    allowed: true,
    remaining: RATE_LIMIT_MAX - record.count,
    resetAt: record.resetAt,
  };
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Extracts the real client IP address from request headers.
 *
 * Handles proxy headers from Vercel, Railway, and other hosting platforms.
 * Priority: x-forwarded-for (first IP) → x-real-ip → request.ip → 'unknown'
 *
 * @param request - The incoming Next.js request object
 * @returns The extracted client IP address
 *
 * @example
 * // x-forwarded-for: "203.0.113.1, 198.51.100.2" returns "203.0.113.1"
 * const ip = getClientIP(request);
 */
function getClientIP(request: NextRequest): string {
  // Check x-forwarded-for header (may contain multiple IPs from proxy chain)
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // Take the first IP (original client) from the comma-separated list
    return forwardedFor.split(',')[0].trim();
  }

  // Check x-real-ip header (some proxies use this instead)
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fall back to 'unknown' - in serverless environments, IP might not be directly available
  return 'unknown';
}

// =============================================================================
// GET Handler
// =============================================================================

/**
 * GET handler for public item endpoint with translation support.
 *
 * @route GET /api/public/items/[publicId]
 * @query lang - Optional language code (e.g., 'fr', 'es', 'de'). If not provided,
 *               language is detected from cookie or Accept-Language header.
 *
 * @returns NextResponse with item data or error
 *
 * @example Request:
 * GET /api/public/items/abc-123?lang=fr
 *
 * @example Success Response (200):
 * {
 *   "id": "uuid",
 *   "publicId": "abc-123",
 *   "name": "Cafetière",
 *   "description": "Comment utiliser...",
 *   "articles": [...],
 *   "links": [...],
 *   "translationMeta": {
 *     "requestedLanguage": "fr",
 *     "displayLanguage": "fr",
 *     "sourceLanguage": "en",
 *     "isTranslated": true
 *   }
 * }
 *
 * @example Error Response (404):
 * {
 *   "success": false,
 *   "error": "Item not found",
 *   "code": "ITEM_NOT_FOUND"
 * }
 *
 * @throws Never - catches all errors and returns appropriate HTTP responses
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ publicId: string }> }
): Promise<NextResponse> {
  // Request logging for monitoring and debugging - no PII for anonymous users
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
          code: 'MISSING_PUBLIC_ID',
        } as ErrorResponse,
        { status: 400 }
      );
    }

    // Rate limit check - prevents abuse of public endpoint
    const clientIP = getClientIP(request);
    const rateLimitCheck = checkRateLimit(clientIP);

    if (!rateLimitCheck.allowed) {
      const retryAfterSeconds = Math.ceil(
        (rateLimitCheck.resetAt - Date.now()) / 1000
      );
      console.warn('[api/public/items] Rate limit exceeded for IP:', clientIP);

      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded. Please try again later.',
          code: 'RATE_LIMIT_EXCEEDED',
        } as ErrorResponse,
        {
          status: 429,
          headers: {
            'Retry-After': retryAfterSeconds.toString(),
            'X-RateLimit-Limit': RATE_LIMIT_MAX.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitCheck.resetAt.toString(),
          },
        }
      );
    }

    // Store rate limit headers for success response
    const rateLimitHeaders = {
      'X-RateLimit-Limit': RATE_LIMIT_MAX.toString(),
      'X-RateLimit-Remaining': rateLimitCheck.remaining.toString(),
      'X-RateLimit-Reset': rateLimitCheck.resetAt.toString(),
    };

    // Detect guest language from query param, cookie, or Accept-Language header
    const langParam = request.nextUrl.searchParams.get('lang');
    const detectedLanguage: SupportedLanguage = detectGuestLanguage(
      request,
      langParam || undefined
    );

    console.info(
      '[api/public/items] Fetching item:',
      publicId,
      'language:',
      detectedLanguage
    );

    // Fetch item with translations merged - fallback to original if translation unavailable
    const result = await fetchTranslatedItem(publicId, detectedLanguage);

    if (!result.success) {
      console.warn('[api/public/items] Item not found:', publicId);
      return NextResponse.json(
        {
          success: false,
          error: 'Item not found',
          code: 'ITEM_NOT_FOUND',
        } as ErrorResponse,
        { status: 404 }
      );
    }

    const { data: itemData, isFallback } = result;

    if (isFallback) {
      console.info(
        '[api/public/items] Translation not available for:',
        publicId,
        'language:',
        detectedLanguage,
        '- using original content'
      );
    }

    // Transform to GuestContentResponse format with translation metadata
    // fetchTranslatedItem already returns data in the correct format with translationMeta
    const responseData = itemData;

    // Build response headers
    const headers = new Headers();

    // Cache for 5 minutes with 10-minute stale-while-revalidate for performance
    headers.set(
      'Cache-Control',
      'public, s-maxage=300, stale-while-revalidate=600'
    );

    // Vary by Accept-Language ensures CDN caches per language
    headers.set('Vary', 'Accept-Language');

    // Add rate limit headers
    headers.set('X-RateLimit-Limit', rateLimitHeaders['X-RateLimit-Limit']);
    headers.set(
      'X-RateLimit-Remaining',
      rateLimitHeaders['X-RateLimit-Remaining']
    );
    headers.set('X-RateLimit-Reset', rateLimitHeaders['X-RateLimit-Reset']);

    // Log successful request
    const duration = Date.now() - startTime;
    console.info(
      `[api/public/items] GET ${publicId} lang=${detectedLanguage} status=200 translated=${!isFallback} duration=${duration}ms`
    );

    return NextResponse.json(responseData, { status: 200, headers });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(
      '[api/public/items] Unexpected error:',
      error instanceof Error ? error.message : String(error),
      `duration=${duration}ms`
    );

    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred. Please try again later.',
        code: 'INTERNAL_ERROR',
      } as ErrorResponse,
      { status: 500 }
    );
  }
}
