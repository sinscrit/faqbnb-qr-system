# Create Public Item API Endpoint with Translation Support - Detailed Implementation Tasks

**Generated:** 2026-01-22 22:34
**Reference Documents:**
- Requirements: docs/gen_requests_epic4.md (Request #5)
- Overview: docs/REQ-E04-005-create-public-item-api-endpoint-with-translation-overview.md
- Implementation Plan: docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md

**CRITICAL INSTRUCTIONS FOR IMPLEMENTING AGENT:**
- Operate from the project root folder ONLY
- **DO NOT ATTEMPT TO NAVIGATE TO OTHER FOLDERS UNDER ANY CIRCUMSTANCES**
- All file paths must be relative to project root

## Build & Test Commands

| Action | Command |
|--------|---------|
| Type Check | `npx tsc --noEmit` |
| Unit Tests | `npm test` |
| Build | `npm run build` |
| Lint | `npm run lint` |

---

## 1. Create Directory Structure and Route File

**Context:** Next.js 15 App Router uses file-based routing with dynamic segments. The pattern `[publicId]` creates a dynamic route parameter. The file structure should mirror existing patterns in `/src/app/api/items/[publicId]/route.ts` (authenticated endpoint) and `/src/app/api/public/access-request/route.ts` (public endpoint reference). This task creates the foundational file where all subsequent implementation will occur.

**Files to modify:**
- `/src/app/api/public/items/[publicId]/route.ts` (create new file)

**Estimated effort:** 1 story point

- [ ] **1.1** Create directory structure: `/src/app/api/public/items/[publicId]/` using terminal or file system
- [ ] **1.2** Create file: `/src/app/api/public/items/[publicId]/route.ts`
- [ ] **1.3** Add module-level JSDoc comment block explaining: "Public Item API Endpoint with Translation Support (Epic 4 - Guest Experience)"
- [ ] **1.4** Add JSDoc description: "Serves item content with translations to unauthenticated guests. No authentication required."
- [ ] **1.5** Add JSDoc tags: `@module api/public/items/[publicId]`, `@since Epic 4 - Guest Experience`
- [ ] **1.6** Add JSDoc note: "This endpoint is publicly accessible and rate-limited to prevent abuse"
- [ ] **1.7** Verify Next.js recognizes the route by starting dev server: `npm run dev` and checking routes list
- [ ] **1.8** Run `npx tsc --noEmit` to ensure file compiles as valid TypeScript module

---

## 2. Import Dependencies and Define Types

**Context:** The route handler requires types and utilities from REQ-E04-001 (l10n types), REQ-E04-002 (guest language detection), and REQ-E04-004 (translation fetching). Following Next.js 15 patterns from existing routes like `/src/app/api/public/access-request/route.ts`, we import from `next/server` for request/response handling. Error response type must be defined locally since it's endpoint-specific.

**Files to modify:**
- `/src/app/api/public/items/[publicId]/route.ts` (continue in same file)

**Estimated effort:** 1 story point

- [ ] **2.1** Add import statement: `import { NextRequest, NextResponse } from 'next/server';` for Next.js server types
- [ ] **2.2** Add import statement: `import type { SupportedLanguage } from '@/types/l10n';` from REQ-E04-001
- [ ] **2.3** Add import statement: `import { fetchTranslatedItem } from '@/lib/translations';` from REQ-E04-004
- [ ] **2.4** Add import statement: `import { detectGuestLanguage } from '@/lib/i18n/guest-language';` from REQ-E04-002
- [ ] **2.5** Define local `ErrorResponse` interface with fields: `success: false`, `error: string`, `code?: string`
- [ ] **2.6** Add JSDoc to `ErrorResponse` explaining it's used for all error scenarios (400, 404, 429, 500)
- [ ] **2.7** Define type alias: `type APIResponse = SuccessResponse | ErrorResponse` where SuccessResponse uses the result from fetchTranslatedItem
- [ ] **2.8** Add JSDoc comment documenting the `?lang=` query parameter format and valid values
- [ ] **2.9** Run `npx tsc --noEmit` to verify all imports resolve correctly and types compile

---

## 3. Implement Rate Limiter Utility

**Context:** Public endpoints need rate limiting to prevent abuse. Following the overview's specification (60 requests/minute per IP), we implement a simple in-memory Map-based rate limiter. This pattern is suitable for single-instance deployment; production at scale should use Redis. The rate limiter tracks requests by IP address with a sliding window algorithm. Reference existing patterns from `/src/app/api/public/access-request/route.ts` if it has rate limiting.

**Files to modify:**
- `/src/app/api/public/items/[publicId]/route.ts` (add before GET handler)

**Estimated effort:** 1 story point

- [ ] **3.1** Define type `RateLimitRecord` interface with fields: `count: number`, `resetAt: number` (Unix timestamp)
- [ ] **3.2** Create module-level constant: `const rateLimitStore = new Map<string, RateLimitRecord>();` for tracking request counts per IP
- [ ] **3.3** Define constants: `const RATE_LIMIT_MAX = 60;` (requests per window)
- [ ] **3.4** Define constants: `const RATE_LIMIT_WINDOW_MS = 60000;` (60 seconds in milliseconds)
- [ ] **3.5** Create function `checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetAt: number }`
- [ ] **3.6** In `checkRateLimit`: Get current timestamp with `Date.now()`
- [ ] **3.7** In `checkRateLimit`: Retrieve or initialize record for IP: `rateLimitStore.get(ip) || { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS }`
- [ ] **3.8** In `checkRateLimit`: Check if reset time has passed; if yes, reset count to 0 and update resetAt
- [ ] **3.9** In `checkRateLimit`: If `count >= RATE_LIMIT_MAX`, return `{ allowed: false, remaining: 0, resetAt: record.resetAt }`
- [ ] **3.10** In `checkRateLimit`: Otherwise, increment count, update Map, return `{ allowed: true, remaining: RATE_LIMIT_MAX - count, resetAt: record.resetAt }`
- [ ] **3.11** Add JSDoc to `checkRateLimit` explaining: in-memory implementation, per-IP tracking, 60 req/min limit, returns rate limit status
- [ ] **3.12** Add JSDoc note: "For production with multiple instances, use Redis-based rate limiting"
- [ ] **3.13** Add cleanup logic: periodically remove expired entries from Map (e.g., every 1000 requests) to prevent memory leak
- [ ] **3.14** Run `npx tsc --noEmit` to verify rate limiter function signature and logic compile

---

## 4. Extract Client IP Address Helper

**Context:** Rate limiting requires identifying clients by IP address. In Next.js deployed behind proxies (Vercel, Railway), the real client IP is in the `x-forwarded-for` header, not `request.ip`. The header may contain multiple IPs (comma-separated) from proxy chain; we need the first one (original client). This follows the pattern used in analytics and visit tracking endpoints.

**Files to modify:**
- `/src/app/api/public/items/[publicId]/route.ts` (add helper function)

**Estimated effort:** 1 story point

- [ ] **4.1** Create function `getClientIP(request: NextRequest): string` with JSDoc explaining it extracts real client IP from headers
- [ ] **4.2** In `getClientIP`: Check for `x-forwarded-for` header: `request.headers.get('x-forwarded-for')`
- [ ] **4.3** If `x-forwarded-for` exists, split by comma, take first entry, trim whitespace: `forwardedFor.split(',')[0].trim()`
- [ ] **4.4** If `x-forwarded-for` doesn't exist, check `x-real-ip` header: `request.headers.get('x-real-ip')`
- [ ] **4.5** If neither header exists, fall back to `request.ip || 'unknown'`
- [ ] **4.6** Return the extracted IP address as a string
- [ ] **4.7** Add JSDoc note: "Handles proxy headers from Vercel, Railway, and other hosting platforms"
- [ ] **4.8** Add JSDoc `@example` showing: `x-forwarded-for: "203.0.113.1, 198.51.100.2"` returns `"203.0.113.1"`
- [ ] **4.9** Run `npx tsc --noEmit` to verify function compiles

---

## 5. Implement GET Handler Skeleton with Error Handling

**Context:** Next.js 15 App Router handlers use async functions exported as HTTP method names (GET, POST, etc.). The function signature must match Next.js's expected type with `NextRequest` and route params. Following the pattern in `/src/app/api/items/[publicId]/route.ts`, params are now a Promise in Next.js 15. The handler wraps all logic in try-catch to prevent unhandled exceptions from crashing the server.

**Files to modify:**
- `/src/app/api/public/items/[publicId]/route.ts` (add main handler)

**Estimated effort:** 1 story point

- [ ] **5.1** Export async function: `export async function GET(request: NextRequest, context: { params: Promise<{ publicId: string }> }): Promise<NextResponse>`
- [ ] **5.2** Add comprehensive JSDoc above function with route, query parameters, return types, and example request/response
- [ ] **5.3** Add JSDoc tags: `@route GET /api/public/items/[publicId]`, `@query lang - Optional language code`, `@returns NextResponse with item data or error`
- [ ] **5.4** Wrap entire function body in try-catch block
- [ ] **5.5** In try block, await params destructuring: `const { publicId } = await context.params;`
- [ ] **5.6** Add validation: if `!publicId`, return `NextResponse.json({ success: false, error: 'Public ID is required', code: 'MISSING_PUBLIC_ID' }, { status: 400 })`
- [ ] **5.7** In catch block, log error with prefix: `console.error('[api/public/items] Unexpected error:', error);`
- [ ] **5.8** In catch block, return generic 500 error: `NextResponse.json({ success: false, error: 'An unexpected error occurred. Please try again later.', code: 'INTERNAL_ERROR' }, { status: 500 })`
- [ ] **5.9** Add JSDoc note: "@throws Never - catches all errors and returns appropriate HTTP responses"
- [ ] **5.10** Run `npx tsc --noEmit` to verify async function signature and error handling compile correctly

---

## 6. Implement Rate Limiting Check

**Context:** Rate limiting must occur early in the request lifecycle, before expensive database queries. Extract client IP, check against rate limit, and return 429 with appropriate headers if exceeded. The `Retry-After` header tells clients when they can retry. Rate limit headers (`X-RateLimit-*`) provide visibility into quota usage for debugging and client logic.

**Files to modify:**
- `/src/app/api/public/items/[publicId]/route.ts` (add to GET handler, after validation)

**Estimated effort:** 1 story point

- [ ] **6.1** After publicId validation, call `const clientIP = getClientIP(request);` to extract IP address
- [ ] **6.2** Call `const rateLimitCheck = checkRateLimit(clientIP);` to check rate limit status
- [ ] **6.3** If `!rateLimitCheck.allowed`, calculate retry delay: `const retryAfterSeconds = Math.ceil((rateLimitCheck.resetAt - Date.now()) / 1000)`
- [ ] **6.4** If rate limit exceeded, log warning: `console.warn('[api/public/items] Rate limit exceeded for IP:', clientIP)`
- [ ] **6.5** If rate limit exceeded, return 429 response: `NextResponse.json({ success: false, error: 'Rate limit exceeded. Please try again later.', code: 'RATE_LIMIT_EXCEEDED' }, { status: 429, headers: { 'Retry-After': retryAfterSeconds.toString(), 'X-RateLimit-Limit': RATE_LIMIT_MAX.toString(), 'X-RateLimit-Remaining': '0', 'X-RateLimit-Reset': rateLimitCheck.resetAt.toString() } })`
- [ ] **6.6** Add comment: "// Rate limit check - prevents abuse of public endpoint"
- [ ] **6.7** Store rate limit values for adding to success response headers later: `const rateLimitHeaders = { 'X-RateLimit-Limit': RATE_LIMIT_MAX.toString(), 'X-RateLimit-Remaining': rateLimitCheck.remaining.toString(), 'X-RateLimit-Reset': rateLimitCheck.resetAt.toString() }`
- [ ] **6.8** Run `npx tsc --noEmit` to verify rate limit headers are correctly typed

---

## 7. Implement Language Detection from Query Parameter

**Context:** The `?lang=` query parameter allows clients to request specific translations. Use `detectGuestLanguage()` from REQ-E04-002 which implements the priority cascade: URL param → Cookie → Accept-Language header → Default ('en'). The function handles invalid language codes gracefully by falling back to supported values. Logging the detected language aids debugging of translation issues.

**Files to modify:**
- `/src/app/api/public/items/[publicId]/route.ts` (add after rate limit check)

**Estimated effort:** 1 story point

- [ ] **7.1** After rate limit check, extract language query parameter: `const langParam = request.nextUrl.searchParams.get('lang');`
- [ ] **7.2** Call `const detectedLanguage = detectGuestLanguage(request, langParam || undefined);` to determine target language
- [ ] **7.3** Add info logging: `console.info('[api/public/items] Fetching item:', publicId, 'language:', detectedLanguage);`
- [ ] **7.4** Add JSDoc comment above code block: "// Detect guest language from query param, cookie, or Accept-Language header"
- [ ] **7.5** Verify `detectedLanguage` is typed as `SupportedLanguage` for type safety
- [ ] **7.6** Run `npx tsc --noEmit` to ensure language detection types resolve correctly

---

## 8. Fetch Item with Translations

**Context:** Use `fetchTranslatedItem()` from REQ-E04-004 to retrieve item data with translations merged. The function returns a `FetchTranslationResult` with `success` boolean, optional `data`, and `isFallback` flag indicating whether original content is shown due to missing translation. Handle the 404 case (item not found) by returning appropriate error response. The fetched data includes translation metadata that will be passed to the client.

**Files to modify:**
- `/src/app/api/public/items/[publicId]/route.ts` (add after language detection)

**Estimated effort:** 1 story point

- [ ] **8.1** Call `const result = await fetchTranslatedItem(publicId, detectedLanguage);` to fetch item with translations
- [ ] **8.2** Check for failure: `if (!result.success)`
- [ ] **8.3** If failure, log warning: `console.warn('[api/public/items] Item not found:', publicId);`
- [ ] **8.4** If failure, return 404 response: `return NextResponse.json({ success: false, error: 'Item not found', code: 'ITEM_NOT_FOUND' }, { status: 404 });`
- [ ] **8.5** If success, extract data: `const { data: itemData, isFallback } = result;`
- [ ] **8.6** If `isFallback` is true, log info: `console.info('[api/public/items] Translation not available for:', publicId, 'language:', detectedLanguage, '- using original content');`
- [ ] **8.7** Add comment: "// Fetch item with translations merged - fallback to original if translation unavailable"
- [ ] **8.8** Run `npx tsc --noEmit` to verify result destructuring and error handling compile

---

## 9. Transform Response Data to GuestContentResponse Format

**Context:** The `fetchTranslatedItem()` function returns data with translation metadata. We need to structure this into the exact `GuestContentResponse` format expected by clients (as defined in REQ-E04-001). The response must include: item data with nested articles/links, and translationMeta object. Database snake_case fields should already be transformed to camelCase by REQ-E04-004, but verify the final response structure matches the type definition.

**Files to modify:**
- `/src/app/api/public/items/[publicId]/route.ts` (add after fetch success)

**Estimated effort:** 1 story point

- [ ] **9.1** Construct response object matching GuestContentResponse structure (check if fetchTranslatedItem already returns correct format, or if transformation needed)
- [ ] **9.2** Verify response includes: `item` object with all required fields (id, publicId, name, description, articles, links, tags)
- [ ] **9.3** Verify response includes: `translationMeta` object with fields (requestedLanguage, displayLanguage, sourceLanguage, isTranslated)
- [ ] **9.4** If itemData.translationMeta exists from fetchTranslatedItem, use it directly; otherwise construct it
- [ ] **9.5** Ensure `requestedLanguage` is set to the detected language
- [ ] **9.6** Ensure `displayLanguage` matches the actual language displayed (sourceLanguage if isFallback, detectedLanguage if translated)
- [ ] **9.7** Ensure `sourceLanguage` comes from item.sourceLanguage field (default to 'en' if not present)
- [ ] **9.8** Ensure `isTranslated` is set to `!isFallback`
- [ ] **9.9** Add comment: "// Transform to GuestContentResponse format with translation metadata"
- [ ] **9.10** Store response data in variable: `const responseData = { ...constructedResponse };`
- [ ] **9.11** Run `npx tsc --noEmit` to verify response structure matches GuestContentResponse type

---

## 10. Add Cache-Control and Response Headers

**Context:** Following the overview's caching strategy, set `Cache-Control: public, s-maxage=300, stale-while-revalidate=600` for CDN caching (5 minutes fresh, 10 minutes stale). The `Vary: Accept-Language` header ensures CDNs cache separate responses per language, preventing French users from receiving cached English content. Rate limit headers provide client visibility into quota usage.

**Files to modify:**
- `/src/app/api/public/items/[publicId]/route.ts` (add headers to success response)

**Estimated effort:** 1 story point

- [ ] **10.1** Create headers object: `const headers = new Headers();`
- [ ] **10.2** Set cache control: `headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');`
- [ ] **10.3** Set vary header: `headers.set('Vary', 'Accept-Language');` to enable language-specific caching
- [ ] **10.4** Add rate limit headers from earlier: `headers.set('X-RateLimit-Limit', rateLimitHeaders['X-RateLimit-Limit']);`
- [ ] **10.5** Add remaining rate limit headers: `headers.set('X-RateLimit-Remaining', rateLimitHeaders['X-RateLimit-Remaining']);`
- [ ] **10.6** Add reset timestamp header: `headers.set('X-RateLimit-Reset', rateLimitHeaders['X-RateLimit-Reset']);`
- [ ] **10.7** Add comment explaining cache strategy: "// Cache for 5 minutes with 10-minute stale-while-revalidate for performance"
- [ ] **10.8** Add comment explaining vary header: "// Vary by Accept-Language ensures CDN caches per language"
- [ ] **10.9** Return success response: `return NextResponse.json(responseData, { status: 200, headers });`
- [ ] **10.10** Run `npx tsc --noEmit` to verify headers are correctly constructed

---

## 11. Add Request/Response Logging

**Context:** Production debugging requires comprehensive logging of API requests and responses. Log successful requests with key metadata (publicId, language, translation status), errors with full context, and timing information for performance monitoring. Use consistent `[api/public/items]` prefix for easy log filtering. Avoid logging PII for anonymous users (no personal info, just public IDs and language codes).

**Files to modify:**
- `/src/app/api/public/items/[publicId]/route.ts` (enhance logging throughout)

**Estimated effort:** 1 story point

- [ ] **11.1** At function start, capture start time: `const startTime = Date.now();`
- [ ] **11.2** Before returning success response, calculate duration: `const duration = Date.now() - startTime;`
- [ ] **11.3** Log successful request: `console.info('[api/public/items] GET ${publicId} lang=${detectedLanguage} status=200 translated=${!isFallback} duration=${duration}ms');`
- [ ] **11.4** Ensure existing info log for translation fallback is present (added in task 8)
- [ ] **11.5** Ensure existing warn log for rate limit exceeded is present (added in task 6)
- [ ] **11.6** Ensure existing warn log for item not found is present (added in task 8)
- [ ] **11.7** In catch block, enhance error logging: `console.error('[api/public/items] GET ${publicId} error:', error instanceof Error ? error.message : String(error), 'duration=${Date.now() - startTime}ms');`
- [ ] **11.8** Add comment at top of function: "// Request logging for monitoring and debugging - no PII for anonymous users"
- [ ] **11.9** Run `npx tsc --noEmit` to verify all logging statements compile

---

## 12. Verify Complete Handler Implementation and TypeScript Compliance

**Context:** Before moving to tests, ensure the complete GET handler compiles without errors, follows Next.js 15 patterns, implements all required features (rate limiting, language detection, translation fetching, caching, error handling), and matches the function signature specified in the overview document. This verification step catches integration issues early.

**Files to modify:**
- None (verification only)

**Estimated effort:** 1 story point

- [ ] **12.1** Run `npx tsc --noEmit` to verify entire route file compiles without TypeScript errors
- [ ] **12.2** Check that function signature matches: `async function GET(request: NextRequest, context: { params: Promise<{ publicId: string }> }): Promise<NextResponse>`
- [ ] **12.3** Verify all imports resolve correctly (no "cannot find module" errors)
- [ ] **12.4** Verify ErrorResponse type is correctly defined and used in error returns
- [ ] **12.5** Verify rate limit logic is complete (checkRateLimit, getClientIP functions exist and are called)
- [ ] **12.6** Verify language detection is implemented (detectGuestLanguage is called)
- [ ] **12.7** Verify translation fetching is implemented (fetchTranslatedItem is called with correct parameters)
- [ ] **12.8** Verify cache headers are set correctly in success response
- [ ] **12.9** Verify rate limit headers are included in all responses (success and 429)
- [ ] **12.10** Verify all error cases return appropriate status codes (400, 404, 429, 500)
- [ ] **12.11** Verify try-catch wraps entire handler body and catches all errors
- [ ] **12.12** Review code for any hardcoded values that should be constants (rate limits, cache TTLs, etc.)

---

## 13. Run Full Build and Check for Integration Issues

**Context:** TypeScript compilation checks syntax and types, but the full Next.js build process validates route registration, edge runtime compatibility (if applicable), and production optimizations. This step ensures the new endpoint will work correctly in production deployment. Build errors often reveal issues not caught by type checking alone (e.g., server/client component boundaries, dynamic imports, environment variables).

**Files to modify:**
- None (verification only)

**Estimated effort:** 1 story point

- [ ] **13.1** Run full production build: `npm run build`
- [ ] **13.2** Verify build completes successfully without errors
- [ ] **13.3** Check build output for warnings about the new route file
- [ ] **13.4** Verify Next.js recognizes the route: check `.next/server/app/api/public/items/[publicId]/route.js` exists after build
- [ ] **13.5** Check bundle size impact: new route should be minimal since it's server-side only
- [ ] **13.6** Verify no circular dependency warnings in build output
- [ ] **13.7** Check for any unused imports or dead code warnings
- [ ] **13.8** Run linter: `npm run lint` to ensure code style compliance
- [ ] **13.9** Fix any linting errors (prefer-const, no-console in production mode, etc.)
- [ ] **13.10** Re-run build after fixing lint errors to confirm clean build

---

## 14. Manual Testing with Dev Server

**Context:** Before writing automated tests, manually verify the endpoint works correctly using curl or a browser. Test the happy path (item exists, translation available), error cases (item not found, invalid language), rate limiting (make many requests quickly), and cache headers (check response headers). This quick verification catches obvious issues before investing in test infrastructure.

**Files to modify:**
- None (manual testing only)

**Estimated effort:** 1 story point

- [ ] **14.1** Start development server: `npm run dev`
- [ ] **14.2** Test happy path: `curl http://localhost:3000/api/public/items/[EXISTING_PUBLIC_ID]` (replace with actual publicId from database)
- [ ] **14.3** Verify response status is 200 and response body matches GuestContentResponse structure
- [ ] **14.4** Test with language parameter: `curl http://localhost:3000/api/public/items/[EXISTING_PUBLIC_ID]?lang=fr`
- [ ] **14.5** Verify response includes French translation (if translation exists in database) or original content with fallback metadata
- [ ] **14.6** Test item not found: `curl http://localhost:3000/api/public/items/nonexistent-id` and verify 404 response
- [ ] **14.7** Test rate limiting: Use a script to make 65 requests rapidly to same endpoint from same IP, verify 429 after 60 requests
- [ ] **14.8** Check rate limit headers in response: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`, `Retry-After` (on 429)
- [ ] **14.9** Check cache headers: `Cache-Control`, `Vary` in successful response
- [ ] **14.10** Test invalid language code: `curl http://localhost:3000/api/public/items/[EXISTING_PUBLIC_ID]?lang=invalid` and verify defaults to 'en'
- [ ] **14.11** Verify logs appear in console with `[api/public/items]` prefix for all request types
- [ ] **14.12** Document any issues found and fix them before proceeding to automated tests

---

## Verification Checklist

After completing all tasks, verify the following acceptance criteria:

- [ ] File `/src/app/api/public/items/[publicId]/route.ts` exists with complete GET handler implementation
- [ ] GET handler accepts `request: NextRequest` and `context: { params: Promise<{ publicId: string }> }` parameters (Next.js 15 pattern)
- [ ] Query parameter `?lang=` is parsed and used for language detection
- [ ] `detectGuestLanguage()` is called to determine target language with fallback
- [ ] `fetchTranslatedItem()` is called to retrieve item with translations
- [ ] Rate limiting is implemented with 60 requests/minute per IP
- [ ] Client IP extraction handles `x-forwarded-for` and `x-real-ip` headers
- [ ] Rate limit headers are included in all responses: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- [ ] 429 response includes `Retry-After` header when rate limit exceeded
- [ ] Cache-Control header is set: `public, s-maxage=300, stale-while-revalidate=600`
- [ ] Vary header is set: `Accept-Language` for language-specific caching
- [ ] Response structure matches `GuestContentResponse` type from REQ-E04-001
- [ ] Translation metadata includes: `requestedLanguage`, `displayLanguage`, `sourceLanguage`, `isTranslated`
- [ ] 404 response returned when item not found
- [ ] 400 response returned when publicId missing
- [ ] 500 response returned for unexpected errors (with generic message, detailed logs)
- [ ] All error responses use consistent format: `{ success: false, error: string, code?: string }`
- [ ] Comprehensive logging with `[api/public/items]` prefix for filtering
- [ ] Request duration logged for performance monitoring
- [ ] Try-catch block wraps entire handler to prevent unhandled exceptions
- [ ] `npx tsc --noEmit` runs without errors
- [ ] `npm run build` completes successfully
- [ ] `npm run lint` passes without errors
- [ ] Manual testing confirms endpoint works correctly for all scenarios

---

## Notes for Implementation Agent

**Next.js 15 Pattern Changes:**
The `params` in route handlers is now a Promise and must be awaited: `const { publicId } = await context.params;`. This is different from Next.js 13/14 where params were directly accessible. Reference: https://nextjs.org/docs/app/api-reference/file-conventions/route

**Rate Limiter Implementation:**
The in-memory Map-based rate limiter is sufficient for single-instance deployments and development. For production at scale:
- Consider Redis-based rate limiting (e.g., `ioredis` + sliding window algorithm)
- Or use a service like Upstash Rate Limiting
- Or rely on CDN/platform rate limiting (Vercel, Cloudflare)

**Cache Strategy Rationale:**
- `public`: Allows CDN and browser caching
- `s-maxage=300`: CDN serves cached copy for 5 minutes (balances freshness with performance)
- `stale-while-revalidate=600`: Allows serving 10-minute stale content while fetching fresh data in background
- `Vary: Accept-Language`: Ensures separate cache entries per language, prevents wrong-language content

**Translation Fallback Behavior:**
When `fetchTranslatedItem()` returns `isFallback: true`:
- The response still returns 200 (not an error)
- `translationMeta.isTranslated` is `false`
- `translationMeta.displayLanguage` should match `translationMeta.sourceLanguage`
- Client can detect this and show "View Original" toggle appropriately

**Error Response Consistency:**
All error responses use the same structure:
```typescript
{
  success: false,
  error: "Human-readable message",
  code: "MACHINE_READABLE_CODE"  // Optional but recommended
}
```

Error codes help clients handle specific scenarios programmatically (e.g., show "Item not found" UI for `ITEM_NOT_FOUND` code).

**IP Address Extraction:**
The `x-forwarded-for` header may contain multiple IPs in a proxy chain: `"client, proxy1, proxy2"`. We take the first IP (leftmost) as the original client. Some platforms use `x-real-ip` instead. Always check both and fall back to `request.ip`.

**Logging Guidelines:**
- Use `console.info` for normal operations (successful requests, fallbacks)
- Use `console.warn` for recoverable issues (rate limits, item not found)
- Use `console.error` for unexpected errors (exceptions, database failures)
- Always include contextual data: publicId, language, duration, error message
- Never log sensitive data (auth tokens, PII) for public endpoints

**Testing Approach (for future task):**
The overview specifies creating tests in `/src/app/api/public/items/__tests__/route.test.ts`. Test scenarios to cover:
1. Successful fetch with translation (200)
2. Successful fetch with fallback to original (200, isFallback: true)
3. Item not found (404)
4. Missing publicId (400)
5. Rate limit exceeded (429)
6. Invalid language code (200 with default 'en')
7. Cache headers present in response
8. Rate limit headers present in all responses
9. Translation metadata accuracy

**Performance Considerations:**
- The endpoint makes one database query via `fetchTranslatedItem()` which internally uses parallel queries
- Rate limiter Map lookup is O(1)
- Cache headers enable CDN to serve 99%+ of requests without hitting origin
- Language detection is fast (header parsing, no DB calls)

**Commit Message Suggestion:**
```
[REQ-E04-005] Create public item API endpoint with translation support

- Implement GET /api/public/items/[publicId] handler
- Add rate limiting (60 req/min per IP)
- Support ?lang= parameter for translation selection
- Return GuestContentResponse with translation metadata
- Cache-Control headers for CDN optimization (5min/10min)
- Comprehensive error handling (400, 404, 429, 500)
- Logging with [api/public/items] prefix
```

---

*Document generated: 2026-01-22 22:34*
*Epic: 4 - Guest Experience*
*Task: Phase 2, Task 2.2 - Create public item API endpoint with translation support*
