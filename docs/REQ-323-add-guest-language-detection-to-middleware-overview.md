# Implementation Overview: Add Guest Language Detection to Middleware

## Header
| Field | Value |
|-------|-------|
| Request Reference | #323 |
| Source File | docs/gen_requests_epic4.md |
| Implementation Plan | docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md |
| Original Request Date | 2026-01-18 |
| Breakdown Created | 2026-01-18 19:45:00 CET |
| T-shirt Size | M |
| Estimated Effort | 4-6 hours |
| Phase | 6 - Middleware & Language Detection |
| Task ID | 6.1 |

## Goals
Add guest language detection capabilities to the Next.js middleware layer for public item routes (`/item/*`). The middleware should detect guest language preferences from multiple sources (URL query parameters, cookies, Accept-Language headers) and make this information available to downstream page handlers via custom headers and cookies, **without performing any redirects**. This centralizes language detection at the infrastructure level, eliminating duplication across individual page components.

### Assumptions & Clarifications
- Language preference priority order: URL parameter (`?lang=xx`) > Cookie (`FAQBNB_GUEST_LANG`) > Accept-Language header > default (English)
- Six supported languages: `en`, `fr`, `es`, `de`, `nl`, `it`
- Language remains in URL query parameters, NOT path segments (to preserve existing QR code URLs)
- NO redirects should occur - middleware only sets headers/cookies for downstream use
- Cookie name follows Epic 1 convention: `FAQBNB_GUEST_LANG`
- Cookie expiration: 1 year (365 days)
- The guest language detection utility module may already exist from Epic 1 or will be created as a dependency
- Middleware should handle errors gracefully without blocking requests

## Implementation Plan

### Step 1: Update Middleware Matcher Configuration
- **Description**: Add `/item/:path*` to the middleware `config.matcher` array to intercept all public item routes
- **Rationale**: Currently middleware only handles auth-related routes. Guest language detection needs to run on public item pages
- **Estimated Effort**: XS (15 minutes)

### Step 2: Create/Import Guest Language Detection Utility
- **Description**: Either import existing `detectGuestLanguage()` from `@/lib/i18n/guest-language` (if Epic 1 created it) or create it in this task
- **Rationale**: Centralizes detection logic for reuse across middleware and page components
- **Estimated Effort**: S-M (1-2 hours if creating, 15 minutes if importing)
- **Dependency**: May depend on Epic 1 creating `src/lib/i18n/guest-language.ts`

### Step 3: Add Language Detection Logic to Middleware Function
- **Description**: Add conditional block in middleware function that detects when request path matches `/item/*` routes, then executes language detection logic
- **Rationale**: Separates guest route handling from existing auth-focused middleware logic
- **Estimated Effort**: M (1-2 hours)

### Step 4: Set Custom Request Header for Downstream Handlers
- **Description**: Set `X-Guest-Language` custom header on the response with detected language code, making it available to page components and API routes
- **Rationale**: Headers are the standard way for middleware to communicate with downstream handlers in Next.js
- **Estimated Effort**: S (30 minutes)

### Step 5: Set Guest Language Cookie When Not Present
- **Description**: When no existing language cookie is present or detected language differs from cookie, set/update the `FAQBNB_GUEST_LANG` cookie with appropriate attributes (1-year expiry, path="/", Secure, SameSite=Lax)
- **Rationale**: Persists language preference across sessions; matches cookie attributes used elsewhere in the application
- **Estimated Effort**: S (30 minutes)

### Step 6: Add Error Handling and Fallback Behavior
- **Description**: Wrap language detection in try/catch, ensure requests proceed even if detection fails, fallback to default language (`en`)
- **Rationale**: Language detection failure should not block guest access to content
- **Estimated Effort**: S (30 minutes)

### Step 7: Verify No Redirect Logic
- **Description**: Ensure middleware does NOT perform any redirects based on language detection results; explicitly document and test this behavior
- **Rationale**: Critical requirement to preserve SEO and prevent infinite redirect loops; language stays in query params
- **Estimated Effort**: XS (15 minutes for verification)

## Authorized Files and Functions for Modification

> Warning: **APPROVED SCOPE**: Changes outside this list require review

### Step 1: Middleware Matcher Configuration
| File | Target | Type |
|------|--------|------|
| `src/middleware.ts` | `config.matcher` array | Extend |

### Step 2: Guest Language Detection Utility
| File | Target | Type |
|------|--------|------|
| `src/lib/i18n/guest-language.ts` | `detectGuestLanguage()` function | Create or Import |
| `src/lib/i18n/guest-language.ts` | `parseAcceptLanguage()` function | Create (if needed) |
| `src/lib/i18n/guest-language.ts` | `mapToSupportedLanguage()` function | Create (if needed) |
| `src/lib/i18n/guest-language.ts` | `GUEST_LANGUAGE_COOKIE_NAME` constant | Create or Import |

### Step 3-6: Middleware Function Updates
| File | Target | Type |
|------|--------|------|
| `src/middleware.ts` | `middleware()` function | Extend |
| `src/middleware.ts` | Guest language detection block | Create (new conditional block) |

### Supporting Type Definitions
| File | Target | Type |
|------|--------|------|
| `src/types/l10n.ts` | `SupportedLanguage` type | Reference (from Epic 1) |
| `src/types/l10n.ts` | `SUPPORTED_LANGUAGES` constant | Reference (from Epic 1) |

## Dependencies

### Internal Dependencies
- **REQ-304**: Create Localization Types File (Epic 1 dependency) - Provides `SupportedLanguage` type
- **REQ-305**: Guest Language Detection and Preference Utility Module - Core detection logic
- **REQ-318**: Cookie Utility for Guest Language Persistence - Cookie handling functions
- **REQ-319**: Update Guest Item Page - Consumer of the middleware-set header/cookie

### External Dependencies
- Next.js 15.5.9 Middleware API (`NextRequest`, `NextResponse`)
- Supabase SSR client (already in middleware)
- No new npm packages required

### API Endpoints Used
- None - Middleware operates at request interception level

## Technical Architecture

### Middleware Request Flow
```
Guest Request → /item/abc123?lang=fr
                     │
                     ▼
            Middleware Matcher Matches
                     │
                     ▼
            ┌─────────────────────────────┐
            │   Language Detection        │
            │   1. Check ?lang= param     │
            │   2. Check FAQBNB_GUEST_LANG│
            │   3. Parse Accept-Language  │
            │   4. Default to 'en'        │
            └─────────────────────────────┘
                     │
                     ▼
            ┌─────────────────────────────┐
            │   Set Response Headers      │
            │   X-Guest-Language: fr      │
            └─────────────────────────────┘
                     │
                     ▼
            ┌─────────────────────────────┐
            │   Set Cookie (if needed)    │
            │   FAQBNB_GUEST_LANG=fr      │
            └─────────────────────────────┘
                     │
                     ▼
            Request Proceeds to Page Handler
            (NO REDIRECT)
```

### Language Detection Priority
```typescript
// Priority order (highest to lowest)
1. URL Query Parameter: ?lang=fr
2. Cookie: FAQBNB_GUEST_LANG=fr
3. Accept-Language Header: Accept-Language: fr-FR,fr;q=0.9,en;q=0.8
4. Default: 'en'
```

### Cookie Attributes
```typescript
{
  name: 'FAQBNB_GUEST_LANG',
  value: 'fr',
  maxAge: 60 * 60 * 24 * 365,  // 1 year
  path: '/',
  secure: true,                 // HTTPS only in production
  sameSite: 'lax'              // Allow navigation requests
}
```

### Accept-Language Parsing Logic
```typescript
// Example header: "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7"
// Parsing steps:
// 1. Split by comma
// 2. Extract language code and quality value
// 3. Sort by quality (default q=1.0)
// 4. Map to supported language
// 5. Return first supported match or default
```

## Risks and Considerations

### Potential Side Effects
- Adding `/item/:path*` to matcher may increase middleware execution on every item page load
- Cookie setting on every request could generate extra Set-Cookie headers (mitigate by checking existing cookie)
- Custom header `X-Guest-Language` may conflict with CDN or proxy headers (unlikely but possible)

### Testing Requirements
- Test middleware runs on `/item/abc123` routes
- Test middleware does NOT run on other routes (e.g., `/api/`, `/dashboard2/`)
- Test URL parameter detection (`?lang=fr`)
- Test cookie detection (pre-existing cookie)
- Test Accept-Language header parsing with various formats
- Test fallback to `en` when no language detected
- Test cookie is set when not present
- Test cookie is NOT overwritten when already matching detected language
- Test NO redirects occur under any circumstances
- Test malformed Accept-Language headers don't crash middleware
- Test unsupported language codes fallback gracefully
- Test error handling doesn't block requests

### Performance Considerations
- Language detection should complete in <10ms to avoid blocking
- Cookie check is O(1) - fast
- Accept-Language parsing is O(n) where n is number of languages in header (typically <10)
- No database calls in middleware for language detection

### Security Considerations
- Cookie uses `Secure` flag for HTTPS-only transmission
- Cookie uses `SameSite=Lax` to prevent CSRF while allowing navigation
- Language codes are validated against allowed list to prevent injection
- No user-controlled data flows directly into headers without validation

### Open Questions
- [ ] Does Epic 1's `guest-language.ts` utility already exist? If not, this task must create it
- [ ] Should the custom header be `X-Guest-Language` or follow a different naming convention?
- [ ] Should we also set the language in the response `Content-Language` header for HTTP semantics?
- [ ] Should the middleware log language detection results for debugging/analytics?

## Out of Scope
- Redirecting users to language-specific paths (explicitly NOT doing this)
- Modifying URL paths based on language (language stays in query params)
- Authenticated user language preferences (this is guest-only)
- Translation fetching or content modification (handled by page components)
- Language detection for non-item routes (only `/item/*` routes)
- Analytics tracking of language preferences (future enhancement)
- A/B testing framework for language features

## Detailed Implementation Notes

### Middleware Matcher Update (Step 1)
```typescript
// Current matcher
export const config = {
  matcher: [
    '/admin/:path*',
    '/admin',
    '/user/:path*',
    // ... other routes
  ],
}

// Updated matcher - add item routes
export const config = {
  matcher: [
    '/admin/:path*',
    '/admin',
    '/user/:path*',
    // ... existing routes
    '/item/:path*',  // NEW: Guest item pages for language detection
  ],
}
```

### Language Detection Block (Step 3)
```typescript
// Add after OAuth callback handling, before auth checks
// Guest item pages - language detection (no auth required)
if (req.nextUrl.pathname.startsWith('/item/')) {
  console.log('[MIDDLEWARE] Guest item route detected:', req.nextUrl.pathname);

  try {
    const detectedLanguage = detectGuestLanguage({
      urlParam: req.nextUrl.searchParams.get('lang'),
      cookie: req.cookies.get('FAQBNB_GUEST_LANG')?.value,
      acceptLanguageHeader: req.headers.get('accept-language'),
    });

    // Set custom header for downstream use
    res.headers.set('X-Guest-Language', detectedLanguage);

    // Set cookie if not present or different
    const existingCookie = req.cookies.get('FAQBNB_GUEST_LANG')?.value;
    if (!existingCookie || existingCookie !== detectedLanguage) {
      res.cookies.set({
        name: 'FAQBNB_GUEST_LANG',
        value: detectedLanguage,
        maxAge: 60 * 60 * 24 * 365,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });
    }

    console.log('[MIDDLEWARE] Guest language detected:', detectedLanguage);
  } catch (error) {
    console.error('[MIDDLEWARE] Language detection failed, using default:', error);
    res.headers.set('X-Guest-Language', 'en');
  }

  // DO NOT REDIRECT - let request proceed
  return res;
}
```

### Guest Language Detection Function Signature (Step 2)
```typescript
// src/lib/i18n/guest-language.ts

import type { SupportedLanguage } from '@/types/l10n';

export const GUEST_LANGUAGE_COOKIE_NAME = 'FAQBNB_GUEST_LANG';

export interface DetectGuestLanguageParams {
  /** Value from ?lang= URL parameter */
  urlParam: string | null;
  /** Value from FAQBNB_GUEST_LANG cookie */
  cookie: string | undefined;
  /** Value from Accept-Language header */
  acceptLanguageHeader: string | null;
}

export function detectGuestLanguage(params: DetectGuestLanguageParams): SupportedLanguage {
  // 1. URL parameter (highest priority)
  if (params.urlParam && isValidLanguageCode(params.urlParam)) {
    return params.urlParam as SupportedLanguage;
  }

  // 2. Cookie
  if (params.cookie && isValidLanguageCode(params.cookie)) {
    return params.cookie as SupportedLanguage;
  }

  // 3. Accept-Language header
  if (params.acceptLanguageHeader) {
    const parsed = parseAcceptLanguage(params.acceptLanguageHeader);
    if (parsed) return parsed;
  }

  // 4. Default
  return 'en';
}

export function parseAcceptLanguage(header: string): SupportedLanguage | null {
  // Parse "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7"
  const languages = header.split(',')
    .map(lang => {
      const [code, qValue] = lang.trim().split(';q=');
      return {
        code: code.split('-')[0].toLowerCase(), // fr-FR -> fr
        quality: qValue ? parseFloat(qValue) : 1.0
      };
    })
    .sort((a, b) => b.quality - a.quality);

  for (const { code } of languages) {
    if (isValidLanguageCode(code)) {
      return code as SupportedLanguage;
    }
  }

  return null;
}

function isValidLanguageCode(code: string): boolean {
  const supportedCodes: SupportedLanguage[] = ['en', 'fr', 'es', 'de', 'nl', 'it'];
  return supportedCodes.includes(code.toLowerCase() as SupportedLanguage);
}
```

### Reading Header in Page Component
```typescript
// In /src/app/item/[publicId]/page.tsx
import { headers } from 'next/headers';

export default async function ItemPage({ params }: PageProps) {
  const headersList = await headers();
  const guestLanguage = headersList.get('X-Guest-Language') || 'en';

  // Use guestLanguage for translation fetching
  // ...
}
```

---
*Document generated: 2026-01-18 19:45:00 CET*
*Last modified: 2026-01-18 19:45:00 CET*
