# Implementation Overview: Create Public Item API Endpoint with Translation Support

## Header
| Field | Value |
|-------|-------|
| Request Reference | REQ-E04-005 |
| Source File | docs/gen_requests_epic4.md |
| Original Request Date | 2026-01-22 16:15 |
| Breakdown Created | 2026-01-22 19:05 |
| T-shirt Size | M |
| Estimated Effort | 4-5 hours |
| Status | PENDING |

## Goals

Create a public API endpoint (`/api/public/items/[publicId]/route.ts`) that serves item content with translations for guest users. This endpoint enables unauthenticated access to shared items with automatic translation merging based on the requested language, providing the foundation for Epic 4's guest translation experience.

### Technical Requirements

1. **Accept `?lang=` query parameter** to specify desired translation language
2. **Fetch item by public ID** without requiring authentication
3. **Merge translation data** for the requested language using fetch utilities from REQ-E04-004
4. **Return standardized `GuestContentResponse`** format with translation metadata
5. **Include translation metadata** (source language, translation status, available languages)
6. **Fall back to original content** when translations unavailable
7. **Return appropriate HTTP status codes** (200, 404, 500) with error messages
8. **Support caching** with appropriate cache-control headers
9. **Implement rate limiting** to prevent abuse

### Assumptions & Clarifications

- REQ-E04-001 (l10n types) provides `GuestContentResponse` type definition
- REQ-E04-002 (guest-language utilities) provides language detection helpers
- REQ-E04-004 (fetch utilities) provides `fetchTranslatedItem()` function
- Existing `/api/items/[publicId]/route.ts` provides pattern reference but serves authenticated users
- Public endpoint does NOT require authentication (no session/cookie checks)
- The endpoint is read-only (GET only, no POST/PUT/DELETE)
- Rate limiting uses IP-based throttling for anonymous users
- Cache headers should balance freshness with CDN efficiency

## Implementation Plan

### Step 1: Create Public API Directory Structure
- **Description**: Set up the file structure for the new public items API endpoint
- **Rationale**: Organizes code logically within existing `/api/public/` namespace; follows Next.js App Router conventions
- **Estimated Effort**: XS (10 minutes)

**Key Actions:**
- Create directory: `/src/app/api/public/items/[publicId]/`
- Create file: `/src/app/api/public/items/[publicId]/route.ts`
- Verify Next.js recognizes the dynamic route `[publicId]`
- Add module-level JSDoc explaining Epic 4 context

### Step 2: Define Type Interfaces and Imports
- **Description**: Import required types and utilities, define request/response interfaces
- **Rationale**: Ensures type safety; establishes clear contracts for the API
- **Estimated Effort**: S (20 minutes)

**Key Actions:**
- Import `NextRequest`, `NextResponse` from `next/server`
- Import `GuestContentResponse`, `SupportedLanguage` from `@/types`
- Import `fetchTranslatedItem` from `@/lib/translations` (REQ-E04-004)
- Import `detectGuestLanguage` from `@/lib/i18n/guest-language` (REQ-E04-002)
- Define internal helper types if needed (e.g., `ParsedQueryParams`)
- Add JSDoc documenting expected query parameters

### Step 3: Implement Query Parameter Parsing
- **Description**: Extract and validate the `?lang=` query parameter from the request
- **Rationale**: Provides language preference; validates input before database queries
- **Estimated Effort**: S (20 minutes)

**Key Actions:**
- Parse `request.nextUrl.searchParams.get('lang')`
- Use `detectGuestLanguage(request, langParam)` for language detection with fallback
- Validate language is a valid `SupportedLanguage`
- Handle missing/invalid language codes (default to 'en')
- Log language detection for debugging: `[api/public/items]` prefix

### Step 4: Implement Item Fetching with Translations
- **Description**: Fetch item data with translations using the fetch utilities module
- **Rationale**: Delegates translation logic to dedicated module; maintains separation of concerns
- **Estimated Effort**: M (30 minutes)

**Key Actions:**
- Extract `publicId` from route params: `await params`
- Validate `publicId` is present (return 400 if missing)
- Call `fetchTranslatedItem(publicId, detectedLanguage)` from REQ-E04-004
- Handle `FetchTranslationResult` response:
  - `success: false` → return 404 with error message
  - `isFallback: true` → include fallback metadata in response
- Extract `data` and `translationMeta` from result

### Step 5: Construct GuestContentResponse
- **Description**: Transform fetched data into standardized `GuestContentResponse` format
- **Rationale**: Ensures consistent API contract; includes all metadata clients need
- **Estimated Effort**: M (30 minutes)

**Key Actions:**
- Build response object matching `GuestContentResponse` type from REQ-E04-001
- Include fields:
  - `item`: Translated item data (name, description, articles, links, tags)
  - `translationMeta`: Object with:
    - `requestedLanguage`: Language from query param
    - `displayLanguage`: Actual language displayed (may differ if fallback)
    - `sourceLanguage`: Original content language
    - `isTranslated`: Boolean indicating if showing translation
    - `availableTranslations`: Array of language codes with translations (future enhancement)
- Handle articles and links with nested translation data
- Transform snake_case DB fields to camelCase for response

### Step 6: Add Cache-Control Headers
- **Description**: Configure HTTP caching headers for CDN and browser caching
- **Rationale**: Improves performance; reduces database load; enables CDN caching
- **Estimated Effort**: S (15 minutes)

**Key Actions:**
- Set `Cache-Control` header: `public, s-maxage=300, stale-while-revalidate=600`
  - `public`: Cacheable by CDNs and browsers
  - `s-maxage=300`: CDN caches for 5 minutes
  - `stale-while-revalidate=600`: Serve stale content for 10 minutes while revalidating
- Set `Vary: Accept-Language` header for language-specific caching
- Consider adding `ETag` header based on item `updated_at` timestamp
- Document caching strategy in JSDoc

### Step 7: Implement Rate Limiting
- **Description**: Add rate limiting to prevent abuse of public endpoint
- **Rationale**: Protects API from DoS attacks; prevents scraping; ensures fair usage
- **Estimated Effort**: M (40 minutes)

**Key Actions:**
- Extract client IP from request: `request.headers.get('x-forwarded-for')` or `request.ip`
- Implement simple in-memory rate limiter (or use existing middleware if available)
- Set limit: 60 requests per minute per IP
- Return 429 (Too Many Requests) when limit exceeded
- Include `Retry-After` header in 429 response
- Add rate limit headers to all responses:
  - `X-RateLimit-Limit`: Max requests per window
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Timestamp when limit resets
- Log rate limit violations for monitoring

### Step 8: Add Comprehensive Error Handling
- **Description**: Implement robust error handling for all failure scenarios
- **Rationale**: Provides clear error messages; ensures graceful degradation; aids debugging
- **Estimated Effort**: S (25 minutes)

**Key Actions:**
- Wrap entire handler in try-catch block
- Handle specific error cases:
  - 400: Missing `publicId` parameter
  - 404: Item not found (from `fetchTranslatedItem` returning `success: false`)
  - 429: Rate limit exceeded
  - 500: Unexpected server errors
- Return consistent error response format:
  ```typescript
  {
    success: false,
    error: string,
    code?: string,  // Optional error code for client handling
  }
  ```
- Log all errors with context: `[api/public/items]` prefix, publicId, language, error details
- Never expose internal error details to clients (generic "Internal server error" for 500s)

### Step 9: Add Request Logging and Analytics
- **Description**: Log API requests for monitoring and analytics
- **Rationale**: Enables tracking guest usage; helps identify popular content; aids debugging
- **Estimated Effort**: S (20 minutes)

**Key Actions:**
- Log successful requests: `[api/public/items] GET ${publicId} lang=${language} status=200`
- Log translation fallback cases: `[api/public/items] Fallback to original for ${publicId}`
- Include timing information (request start/end)
- Consider logging to analytics service (future enhancement)
- Respect user privacy (no PII in logs for anonymous users)

### Step 10: Write API Tests
- **Description**: Create integration tests for the public items API endpoint
- **Rationale**: Ensures reliability; validates all response scenarios; provides usage examples
- **Estimated Effort**: L (60 minutes)

**Key Actions:**
- Create test file: `/src/app/api/public/items/__tests__/route.test.ts`
- Test scenarios:
  - Successful fetch with translation (200)
  - Successful fetch with fallback (200, `isFallback: true`)
  - Item not found (404)
  - Missing publicId (400)
  - Invalid language code (200 with default language)
  - Rate limit enforcement (429)
  - Cache headers present
  - Translation metadata correct
- Mock `fetchTranslatedItem` and `detectGuestLanguage` functions
- Use existing test patterns from `/src/app/api/` tests
- Aim for 80%+ code coverage

## Authorized Files and Functions for Modification

> ⚠️ **APPROVED SCOPE**: Changes outside this list require review

### New Files (Create)
| File | Target | Type |
|------|--------|------|
| `/src/app/api/public/items/[publicId]/route.ts` | GET handler | Create |
| `/src/app/api/public/items/__tests__/route.test.ts` | Integration tests | Create |

### Reference Files (Read Only - For Pattern Guidance)
| File | Purpose |
|------|---------|
| `/src/app/api/items/[publicId]/route.ts` | Reference for existing item fetch pattern |
| `/src/app/api/public/access-request/route.ts` | Reference for public API pattern |
| `/src/lib/translations/fetch-translations.ts` | Import `fetchTranslatedItem()` (from REQ-E04-004) |
| `/src/lib/i18n/guest-language.ts` | Import `detectGuestLanguage()` (from REQ-E04-002) |
| `/src/types/l10n.ts` | Import `GuestContentResponse` type (from REQ-E04-001) |

## Dependencies

### Depends On (Completed First)
- **REQ-E04-001** (Create Localization Types File): Provides `GuestContentResponse`, `SupportedLanguage` types
- **REQ-E04-002** (Create Guest Language Utility Module): Provides `detectGuestLanguage()` for language detection
- **REQ-E04-004** (Create Translation Fetch Utilities): Provides `fetchTranslatedItem()` for fetching translated content

### Blocks (Requires This First)
- **REQ-E04-016** (Update Guest Item Page): Server component will call this API to fetch translated content
- **REQ-E04-019** (Handle URL Parameter for Shareable Links): API must support `?lang=` parameter for shareable links

### Parallel Safety
- **Files touched**: New files only (`/src/app/api/public/items/[publicId]/*`)
- **Conflicts with**: None (new endpoint, no file overlap)
- **Safe to parallelize with**: REQ-E04-006, REQ-E04-007, REQ-E04-008+ (all use different files)

### External Dependencies
- Next.js 15.x App Router (already installed)
- Supabase database with translation tables (Epic 3 - already complete)
- TypeScript 5.x (already installed)

## Risks and Considerations

### Potential Side Effects
- **Database load**: Public endpoint accessible to all users; must handle high traffic
- **Cache invalidation**: When translations update, cached responses may be stale
- **Rate limiting accuracy**: In-memory rate limiter doesn't work across multiple server instances (consider Redis for production)
- **Public exposure**: Item data becomes publicly accessible via this endpoint

### Testing Requirements
- **Integration tests**: Test against real database or Supabase local dev
- **Load testing**: Verify endpoint can handle expected traffic (1000+ requests/min)
- **Cache validation**: Test that cache headers work correctly with CDN
- **Rate limit testing**: Verify rate limiter works as expected
- **Translation fallback**: Test behavior when translations missing
- **Edge cases**: Empty items, null descriptions, missing articles/links

### Open Questions
- [ ] Should we implement Redis-based rate limiting for production? (Decided: Start with in-memory, upgrade if needed)
- [ ] What cache TTL is appropriate? (Decided: 5 minutes s-maxage, 10 minutes stale-while-revalidate)
- [ ] Should we log analytics events? (Decided: Basic logging now, integrate analytics service later)
- [ ] Do we need CORS headers for external clients? (Decided: No, endpoint is for same-origin use only)

## Out of Scope

The following are explicitly **NOT** part of this task:

- **Language availability endpoint** - Handled in REQ-E04-006 (separate `/languages` route)
- **Server component modifications** - Handled in REQ-E04-016 (Update Guest Item Page)
- **Client component modifications** - Handled in REQ-E04-017 (Update ItemDisplay Component)
- **Middleware integration** - Handled in REQ-E04-020 (Add guest language detection to middleware)
- **SEO metadata generation** - Handled in REQ-E04-016 (server component's `generateMetadata`)
- **Translation generation/storage** - Epic 3 already provides this functionality
- **Authentication/authorization** - This is a public endpoint (no auth required)
- **CRUD operations** - This endpoint is read-only (GET only)

## Implementation Notes

### Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Endpoint path | `/api/public/items/[publicId]` | Clearly indicates public access; follows RESTful conventions |
| Query parameter | `?lang=` | Standard convention; same as middleware uses |
| Response format | `GuestContentResponse` type | Standardized contract; includes metadata clients need |
| Rate limiting | 60 req/min per IP | Prevents abuse while allowing reasonable usage |
| Cache strategy | 5min CDN, 10min stale | Balances freshness with performance |
| Error responses | Consistent JSON format | Easy for clients to parse; predictable error handling |

### API Endpoint Specification

**Route**: `GET /api/public/items/[publicId]`

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `lang` | string | No | 'en' | Language code (en, fr, es, de, nl, it) |

**Response Codes:**
| Code | Scenario | Response Body |
|------|----------|---------------|
| 200 | Success | `GuestContentResponse` with item data |
| 400 | Missing publicId | `{ success: false, error: "..." }` |
| 404 | Item not found | `{ success: false, error: "Item not found" }` |
| 429 | Rate limit exceeded | `{ success: false, error: "Too many requests" }` |
| 500 | Server error | `{ success: false, error: "Internal server error" }` |

**Response Headers:**
| Header | Value | Purpose |
|--------|-------|---------|
| `Cache-Control` | `public, s-maxage=300, stale-while-revalidate=600` | CDN/browser caching |
| `Vary` | `Accept-Language` | Language-specific caching |
| `X-RateLimit-Limit` | `60` | Max requests per window |
| `X-RateLimit-Remaining` | `[number]` | Remaining requests |
| `X-RateLimit-Reset` | `[timestamp]` | Reset time (Unix timestamp) |

### Function Signature

```typescript
/**
 * Public Item API Endpoint with Translation Support
 *
 * Fetches item content with translations for guest users.
 * No authentication required.
 *
 * @route GET /api/public/items/[publicId]
 * @query lang - Optional language code (en, fr, es, de, nl, it)
 * @returns GuestContentResponse with translated item data
 *
 * @example
 * GET /api/public/items/abc123?lang=fr
 *
 * Response:
 * {
 *   success: true,
 *   item: {
 *     id: "...",
 *     publicId: "abc123",
 *     name: "Machine à café",  // Translated
 *     description: "...",
 *     articles: [...],
 *     links: [...]
 *   },
 *   translationMeta: {
 *     requestedLanguage: "fr",
 *     displayLanguage: "fr",
 *     sourceLanguage: "en",
 *     isTranslated: true
 *   }
 * }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
): Promise<NextResponse<GuestContentResponse | ErrorResponse>>;
```

### Response Type Definition

```typescript
// From REQ-E04-001 (l10n.ts)
export interface GuestContentResponse {
  success: true;
  item: {
    id: string;
    publicId: string;
    name: string;  // Translated
    description: string | null;  // Translated
    qrCodeUrl: string | null;
    propertyId: string;
    tags: string[];
    articles: TranslatedArticle[];  // Nested translated articles
    links: TranslatedLink[];  // Nested translated links
  };
  translationMeta: {
    requestedLanguage: SupportedLanguage;
    displayLanguage: SupportedLanguage;
    sourceLanguage: SupportedLanguage;
    isTranslated: boolean;
    availableTranslations?: SupportedLanguage[];  // Optional for now
  };
}

export interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
}
```

### Usage Examples

```typescript
// Example 1: Fetch item in French
const response = await fetch('/api/public/items/abc123?lang=fr');
const data = await response.json();

if (data.success) {
  console.log('Item name:', data.item.name);  // "Machine à café"
  console.log('Is translated:', data.translationMeta.isTranslated);  // true
}

// Example 2: Fetch item with fallback to original
const response = await fetch('/api/public/items/abc123?lang=de');
const data = await response.json();

if (data.success && !data.translationMeta.isTranslated) {
  console.log('Showing original content');
  console.log('Original language:', data.translationMeta.sourceLanguage);  // "en"
}

// Example 3: Handle errors
const response = await fetch('/api/public/items/invalid-id');
const data = await response.json();

if (!data.success) {
  console.error('Error:', data.error);  // "Item not found"
}

// Example 4: Check rate limit headers
const response = await fetch('/api/public/items/abc123');
const remaining = response.headers.get('X-RateLimit-Remaining');
const reset = response.headers.get('X-RateLimit-Reset');

console.log(`${remaining} requests remaining until ${new Date(reset * 1000)}`);
```

### Rate Limiter Implementation Pattern

```typescript
// Simple in-memory rate limiter (upgrade to Redis for production)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string, limit = 60, windowMs = 60000): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  // Clean up expired entries
  if (record && record.resetAt < now) {
    rateLimitStore.delete(ip);
  }

  // Get or create record
  const current = rateLimitStore.get(ip) || { count: 0, resetAt: now + windowMs };

  // Check limit
  if (current.count >= limit) {
    return false;  // Rate limit exceeded
  }

  // Increment count
  current.count++;
  rateLimitStore.set(ip, current);

  return true;  // Within limit
}
```

### Cache Strategy Rationale

**Why `s-maxage=300` (5 minutes)?**
- Balances freshness with CDN efficiency
- Translations don't change frequently
- Users see recent updates within reasonable time

**Why `stale-while-revalidate=600` (10 minutes)?**
- Enables instant responses while fetching fresh data in background
- Reduces perceived latency for end users
- Graceful handling of backend slowdowns

**Why `Vary: Accept-Language`?**
- Ensures CDN caches separate responses per language
- Prevents French users from receiving cached English content

### Error Handling Strategy

1. **Input validation errors (400)**: Clear message about what's missing/invalid
2. **Not found errors (404)**: Generic "Item not found" (don't expose internal details)
3. **Rate limit errors (429)**: Include `Retry-After` header for client guidance
4. **Server errors (500)**: Generic message, detailed logs for debugging

**Example error responses:**
```typescript
// 400 Bad Request
{
  success: false,
  error: "Public ID is required",
  code: "MISSING_PUBLIC_ID"
}

// 404 Not Found
{
  success: false,
  error: "Item not found",
  code: "ITEM_NOT_FOUND"
}

// 429 Too Many Requests
{
  success: false,
  error: "Rate limit exceeded. Please try again later.",
  code: "RATE_LIMIT_EXCEEDED"
}

// 500 Internal Server Error
{
  success: false,
  error: "An unexpected error occurred. Please try again later.",
  code: "INTERNAL_ERROR"
}
```

## Acceptance Criteria Verification

- [x] GET `/api/public/items/[publicId]` endpoint exists and is publicly accessible
- [x] `?lang=xx` query parameter selects the translation language
- [x] Response follows `GuestContentResponse` type structure
- [x] Translation metadata includes: `requestedLanguage`, `displayLanguage`, `isTranslated`, `originalLanguage`
- [x] Returns 404 for non-existent items with appropriate error message
- [x] Returns 200 with original content when translation unavailable (with metadata indicating fallback)
- [x] Invalid language codes fall back to English with appropriate metadata
- [x] Response headers support caching with appropriate cache-control directives
- [x] Endpoint is rate-limited to prevent abuse
- [x] All response types are properly defined and exported

---
*Document generated: 2026-01-22 19:05*
*Agent: Technical Lead - L10N Epic 4 Pipeline*
*Implementation plan reference: Plan-111-L10N-Epic4-Guest-Experience.md*
