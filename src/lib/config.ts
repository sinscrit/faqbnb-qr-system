// Domain Configuration Utilities for QR Code Generation
// Part of REQ-016: Domain Configuration for QR Links and System Admin Back Office
// Last Modified: 2026-01-15 - Added getServerBaseUrl for access request links

import { NextRequest } from 'next/server';

/**
 * Get the server base URL for generating links in API routes.
 * Priority order:
 * 1. NEXT_PUBLIC_APP_URL environment variable (recommended for production)
 * 2. Request origin from headers (when request is provided)
 * 3. Fallback to localhost (development only)
 *
 * @param request - Optional NextRequest to derive origin from headers
 * @returns Base URL string (e.g., "https://faqbnb.com")
 *
 * @example
 * // In an API route:
 * const baseUrl = getServerBaseUrl(request);
 * const registrationUrl = `${baseUrl}/register`;
 */
export function getServerBaseUrl(request?: NextRequest | null): string {
  // Priority 1: Explicit environment variable
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  // Priority 2: Derive from request headers
  if (request) {
    // Try x-forwarded-host first (for proxied requests like Railway)
    const forwardedHost = request.headers.get('x-forwarded-host');
    const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';

    if (forwardedHost) {
      return `${forwardedProto}://${forwardedHost}`;
    }

    // Fall back to request.nextUrl.origin
    if (request.nextUrl?.origin && !request.nextUrl.origin.includes('localhost')) {
      return request.nextUrl.origin;
    }
  }

  // Priority 3: Development fallback
  return 'http://localhost:3000';
}

/**
 * Get the domain override from environment variables
 * @returns Domain override URL or null if not set
 */
export function getDomainOverride(): string | null {
  return process.env.NEXT_PUBLIC_QR_DOMAIN_OVERRIDE || null;
}

/**
 * Get the QR domain for QR code generation
 * Falls back to window.location.origin if no override is set
 * @returns Domain URL for QR code generation
 */
export function getQRDomain(): string {
  const override = getDomainOverride();
  
  if (override) {
    return override;
  }
  
  // Fallback to current origin in browser environment
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  // Server-side fallback - use NEXT_PUBLIC_APP_URL if available
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  // Development fallback (should not happen in production)
  return 'http://localhost:3000';
}

/**
 * Validate domain configuration
 * @param domain Domain to validate
 * @returns true if domain is valid, false otherwise
 */
export function validateDomainConfig(domain: string): boolean {
  if (!domain || typeof domain !== 'string') {
    return false;
  }
  
  try {
    const url = new URL(domain);
    // Require HTTPS protocol for security
    return url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Build QR code URL for a physical Item
 *
 * Constructs the URL that will be encoded in the QR code image.
 * This URL points to the Item landing page, which displays all
 * Articles/Instructions associated with the physical item.
 *
 * IMPORTANT (REQ-211): QR codes represent physical Items, NOT Articles.
 * - The publicId parameter is the Item's public ID
 * - Do NOT pass Article IDs to this function
 * - The generated URL remains stable when Articles are added/modified
 *
 * @param publicId - The Item's public ID (NOT Article ID)
 * @returns Full URL for the QR code (e.g., "https://domain.com/item/abc123")
 *
 * @example
 * ```typescript
 * // Correct: Using Item's public ID
 * const url = buildQRUrl(item.publicId);
 * // Returns: "https://yourdomain.com/item/abc-123-def"
 *
 * // The URL leads to a landing page showing all articles for this item
 * ```
 *
 * @see docs/REQ-211-update-qr-code-generation-overview.md
 * @lastModified 2026-01-12 (REQ-211 QR Code Documentation)
 */
export function buildQRUrl(publicId: string): string {
  const domain = getQRDomain();
  return `${domain}/item/${publicId}`;
}