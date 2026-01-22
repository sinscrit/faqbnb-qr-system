# Create Language Availability API Endpoint - Detailed Implementation Tasks

**Generated:** 2026-01-22 22:38
**Reference Documents:**
- Requirements: docs/gen_requests_epic4.md (Request #6)
- Overview: docs/REQ-E04-006-create-language-availability-api-endpoint-overview.md
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

## 1. Create Nested Route Directory Structure

**Context:** This endpoint is a sub-resource of the public items API created in REQ-E04-005. Next.js 15 App Router supports nested dynamic routes with the pattern `[publicId]/languages/route.ts`. This structure follows RESTful conventions where `/items/[id]/languages` represents the languages collection for a specific item. The nested structure keeps related endpoints organized and provides clear API hierarchy.

**Files to modify:**
- `/src/app/api/public/items/[publicId]/languages/route.ts` (create new file)

**Estimated effort:** 1 story point

- [ ] **1.1** Create nested directory structure: `/src/app/api/public/items/[publicId]/languages/` using file system or terminal
- [ ] **1.2** Create file: `/src/app/api/public/items/[publicId]/languages/route.ts`
- [ ] **1.3** Add module-level JSDoc comment block explaining: "Language Availability API Endpoint (Epic 4 - Guest Experience)"
- [ ] **1.4** Add JSDoc description: "Returns list of available translations for a specific item. No authentication required."
- [ ] **1.5** Add JSDoc tags: `@module api/public/items/[publicId]/languages`, `@since Epic 4 - Guest Experience`
- [ ] **1.6** Add JSDoc note: "This endpoint enables guest-facing language switcher components to show only available languages"
- [ ] **1.7** Verify Next.js recognizes the nested route by starting dev server: `npm run dev` and checking routes list
- [ ] **1.8** Run `npx tsc --noEmit` to ensure file compiles as valid TypeScript module

---

## 2. Import Dependencies and Define Response Types

**Context:** The endpoint requires types from REQ-E04-001 (`LanguageAvailabilityResponse`, `LanguageInfo`, `SupportedLanguage`) and database access via Supabase admin client. The `SUPPORTED_LANGUAGES` constant provides metadata (native names, flags) for each language code. Following patterns from REQ-E04-005, we import from `next/server` for Next.js 15 route handlers. The `ErrorResponse` type must be defined locally for error scenarios.

**Files to modify:**
- `/src/app/api/public/items/[publicId]/languages/route.ts` (continue in same file)

**Estimated effort:** 1 story point

- [ ] **2.1** Add import statement: `import { NextRequest, NextResponse } from 'next/server';` for Next.js server types
- [ ] **2.2** Add import statement: `import type { SupportedLanguage, LanguageInfo } from '@/types/l10n';` from REQ-E04-001
- [ ] **2.3** Add import statement: `import { SUPPORTED_LANGUAGES } from '@/types/l10n';` for language metadata constant
- [ ] **2.4** Add import statement: `import { supabaseAdmin } from '@/lib/supabase';` for database access
- [ ] **2.5** Define local `ErrorResponse` interface with fields: `success: false`, `error: string`
- [ ] **2.6** Add JSDoc to `ErrorResponse` explaining it's used for all error scenarios (400, 404, 500)
- [ ] **2.7** Define type `SuccessResponse` interface matching `LanguageAvailabilityResponse` with fields: `success: true`, `availableLanguages: LanguageInfo[]`, `sourceLanguage: SupportedLanguage`
- [ ] **2.8** Define type alias: `type APIResponse = SuccessResponse | ErrorResponse` for all possible responses
- [ ] **2.9** Add JSDoc documenting the response format and example
- [ ] **2.10** Run `npx tsc --noEmit` to verify all imports resolve correctly and types compile

---

## 3. Implement GET Handler Skeleton with Error Handling

**Context:** Next.js 15 route handlers use async functions exported as HTTP method names. The function signature must match Next.js's expected type with `NextRequest` and route params as a Promise (new in Next.js 15). Following the pattern from REQ-E04-005, the entire handler body wraps in try-catch to prevent unhandled exceptions. Validation of the `publicId` parameter occurs first, before any database queries.

**Files to modify:**
- `/src/app/api/public/items/[publicId]/languages/route.ts` (add main handler)

**Estimated effort:** 1 story point

- [ ] **3.1** Export async function: `export async function GET(request: NextRequest, context: { params: Promise<{ publicId: string }> }): Promise<NextResponse<APIResponse>>`
- [ ] **3.2** Add comprehensive JSDoc above function with route, return types, and example request/response
- [ ] **3.3** Add JSDoc tags: `@route GET /api/public/items/[publicId]/languages`, `@returns NextResponse with available languages`
- [ ] **3.4** Wrap entire function body in try-catch block
- [ ] **3.5** In try block, await params destructuring: `const { publicId } = await context.params;`
- [ ] **3.6** Add validation: if `!publicId`, return `NextResponse.json({ success: false, error: 'Public ID is required' }, { status: 400 })`
- [ ] **3.7** In catch block, log error with prefix: `console.error('[api/public/items/languages] Unexpected error:', error);`
- [ ] **3.8** In catch block, return generic 500 error: `NextResponse.json({ success: false, error: 'An unexpected error occurred. Please try again later.' }, { status: 500 })`
- [ ] **3.9** Add JSDoc note: "@throws Never - catches all errors and returns appropriate HTTP responses"
- [ ] **3.10** Run `npx tsc --noEmit` to verify async function signature and error handling compile correctly

---

## 4. Query Item to Get ID and Source Language

**Context:** The endpoint needs the item's internal UUID (for querying translations) and source language (to include in response). Epic 3 added a `source_language` column to the items table (default 'en'). Query by `public_id` since that's what guests use in URLs. Handle the 404 case when item doesn't exist. The source language determines which language should always be available (original content).

**Files to modify:**
- `/src/app/api/public/items/[publicId]/languages/route.ts` (add after validation)

**Estimated effort:** 1 story point

- [ ] **4.1** After publicId validation, add comment: "// Step 1: Fetch item to get ID and source language"
- [ ] **4.2** Query items table: `const { data: item, error: itemError } = await supabaseAdmin.from('items').select('id, source_language').eq('public_id', publicId).single();`
- [ ] **4.3** Check for item not found: if `itemError` or `!item`, log warning with `console.warn('[api/public/items/languages] Item not found:', publicId);`
- [ ] **4.4** If item not found, return 404 response: `return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });`
- [ ] **4.5** Extract item data: `const itemId = item.id;`
- [ ] **4.6** Extract source language with fallback: `const sourceLanguage: SupportedLanguage = (item.source_language as SupportedLanguage) || 'en';`
- [ ] **4.7** Add JSDoc note above query explaining: "Query by public_id (guest-facing identifier) to get internal UUID and source language"
- [ ] **4.8** Log successful item lookup: `console.info('[api/public/items/languages] Found item:', publicId, 'source:', sourceLanguage);`
- [ ] **4.9** Run `npx tsc --noEmit` to verify Supabase query types and error handling

---

## 5. Query Translation Tables for Completed Translations

**Context:** The `item_translations` table (Epic 3 schema) tracks translations with a `translation_status` column ('pending', 'processing', 'completed', 'failed'). Only `completed` translations should be exposed to users. Query filters by both `item_id` and `translation_status` for efficient lookup. The query returns an array of translation records, from which we extract unique language codes. Articles and links are not checked per the overview's decision (item-level translation = "available").

**Files to modify:**
- `/src/app/api/public/items/[publicId]/languages/route.ts` (add after item query)

**Estimated effort:** 1 story point

- [ ] **5.1** Add comment: "// Step 2: Query available translations (completed only)"
- [ ] **5.2** Query item_translations table: `const { data: translations, error: transError } = await supabaseAdmin.from('item_translations').select('language').eq('item_id', itemId).eq('translation_status', 'completed');`
- [ ] **5.3** Handle query errors: if `transError`, log warning with `console.warn('[api/public/items/languages] Error fetching translations:', transError);`
- [ ] **5.4** If query error, treat as no translations available (don't fail request): `const translations = [];`
- [ ] **5.5** Extract language codes from results: `const completedLanguages: SupportedLanguage[] = (translations || []).map(t => t.language as SupportedLanguage);`
- [ ] **5.6** Log translation query result: `console.info('[api/public/items/languages] Found ${completedLanguages.length} completed translations for item:', publicId);`
- [ ] **5.7** Add inline comment: "// Only completed translations are shown to users - pending/failed are excluded"
- [ ] **5.8** Run `npx tsc --noEmit` to verify query types and language array typing

---

## 6. Build Complete Language List with Source

**Context:** The available languages array must always include the source language (original content is always "available") even if no translations exist. Use a Set to deduplicate language codes in case source language also has a translation record. The combined list represents all languages a guest can view content in - either as translation or original.

**Files to modify:**
- `/src/app/api/public/items/[publicId]/languages/route.ts` (add after translation query)

**Estimated effort:** 1 story point

- [ ] **6.1** Add comment: "// Step 3: Combine source language with completed translations"
- [ ] **6.2** Create Set with source and completed languages: `const allLanguageCodes = new Set<SupportedLanguage>([sourceLanguage, ...completedLanguages]);`
- [ ] **6.3** Convert Set back to array: `const uniqueLanguages = Array.from(allLanguageCodes);`
- [ ] **6.4** Add inline comment: "// Source language is always available (original content)"
- [ ] **6.5** Log the complete language list: `console.info('[api/public/items/languages] Total available languages:', uniqueLanguages.length, 'codes:', uniqueLanguages.join(', '));`
- [ ] **6.6** Run `npx tsc --noEmit` to verify Set usage and type inference

---

## 7. Enrich Language Codes with Metadata

**Context:** UI components need more than just language codes ('en', 'fr') - they need display names, native names, and optional flags for rendering. The `SUPPORTED_LANGUAGES` constant from REQ-E04-001 provides this metadata. Map each language code to its corresponding `LanguageInfo` object. Filter out any undefined results (shouldn't happen if `SupportedLanguage` type is enforced, but defensive programming). Sort the array to ensure consistent ordering (source first, then alphabetically).

**Files to modify:**
- `/src/app/api/public/items/[publicId]/languages/route.ts` (add after language list)

**Estimated effort:** 1 story point

- [ ] **7.1** Add comment: "// Step 4: Map language codes to LanguageInfo objects with metadata"
- [ ] **7.2** Map codes to info objects: `const availableLanguages: LanguageInfo[] = uniqueLanguages.map(code => SUPPORTED_LANGUAGES.find(lang => lang.code === code)).filter((lang): lang is LanguageInfo => lang !== undefined);`
- [ ] **7.3** Sort languages: put source language first, then alphabetically by code: `availableLanguages.sort((a, b) => { if (a.code === sourceLanguage) return -1; if (b.code === sourceLanguage) return 1; return a.code.localeCompare(b.code); });`
- [ ] **7.4** Add JSDoc comment above mapping explaining: "Enrich language codes with UI-ready metadata (native name, English name, flag emoji)"
- [ ] **7.5** Verify each LanguageInfo includes: `code`, `name`, `nativeName`, optional `flag`
- [ ] **7.6** Log enriched languages count: `console.info('[api/public/items/languages] Enriched ${availableLanguages.length} languages with metadata');`
- [ ] **7.7** Run `npx tsc --noEmit` to verify array mapping and type guard filter

---

## 8. Construct Response Object and Add Cache Headers

**Context:** The response must match the `LanguageAvailabilityResponse` type from REQ-E04-001 exactly. Following the overview's caching strategy, set `Cache-Control: public, s-maxage=600, stale-while-revalidate=1800` for 10-minute CDN caching with 30-minute stale serving. This is longer than the main item endpoint (5 minutes) because language availability changes even less frequently. The response is UI-ready JSON with all metadata clients need.

**Files to modify:**
- `/src/app/api/public/items/[publicId]/languages/route.ts` (add response construction)

**Estimated effort:** 1 story point

- [ ] **8.1** Add comment: "// Step 5: Build response with available languages and source language"
- [ ] **8.2** Construct response object: `const responseData: SuccessResponse = { success: true, availableLanguages, sourceLanguage };`
- [ ] **8.3** Verify response structure matches `LanguageAvailabilityResponse` type from REQ-E04-001
- [ ] **8.4** Create headers object: `const headers = new Headers();`
- [ ] **8.5** Set cache control for 10-minute CDN cache: `headers.set('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=1800');`
- [ ] **8.6** Add comment explaining cache strategy: "// Cache for 10 minutes (longer than main endpoint since language availability changes infrequently)"
- [ ] **8.7** Log successful response: `console.info('[api/public/items/languages] Returning ${availableLanguages.length} available languages for item:', publicId);`
- [ ] **8.8** Return success response: `return NextResponse.json(responseData, { status: 200, headers });`
- [ ] **8.9** Run `npx tsc --noEmit` to verify response structure and headers

---

## 9. Add Request Timing and Enhanced Logging

**Context:** Production debugging and performance monitoring require timing information for API requests. Log the total duration from request start to response. Include key metadata in logs: publicId, source language, translation count, and duration. Use consistent `[api/public/items/languages]` prefix for easy log filtering. Log levels follow conventions: info for normal operations, warn for recoverable issues, error for exceptions.

**Files to modify:**
- `/src/app/api/public/items/[publicId]/languages/route.ts` (enhance logging throughout)

**Estimated effort:** 1 story point

- [ ] **9.1** At function start (top of try block), capture start time: `const startTime = Date.now();`
- [ ] **9.2** Before returning success response, calculate duration: `const duration = Date.now() - startTime;`
- [ ] **9.3** Update success log to include duration: `console.info('[api/public/items/languages] GET ${publicId} status=200 languages=${availableLanguages.length} source=${sourceLanguage} duration=${duration}ms');`
- [ ] **9.4** Ensure existing warn log for item not found includes duration
- [ ] **9.5** In catch block, enhance error logging: `console.error('[api/public/items/languages] GET ${publicId} error:', error instanceof Error ? error.message : String(error), 'duration=${Date.now() - startTime}ms');`
- [ ] **9.6** Add comment at top of function: "// Request logging for monitoring and performance tracking"
- [ ] **9.7** Verify all log statements use consistent `[api/public/items/languages]` prefix
- [ ] **9.8** Run `npx tsc --noEmit` to verify all logging statements compile

---

## 10. Verify Complete Handler Implementation

**Context:** Before moving to testing, ensure the complete GET handler compiles without errors, follows Next.js 15 patterns, implements all required features (item lookup, translation query, metadata enrichment, caching, error handling), and matches the function signature specified in the overview document. This verification step catches integration issues before writing tests.

**Files to modify:**
- None (verification only)

**Estimated effort:** 1 story point

- [ ] **10.1** Run `npx tsc --noEmit` to verify entire route file compiles without TypeScript errors
- [ ] **10.2** Check that function signature matches: `async function GET(request: NextRequest, context: { params: Promise<{ publicId: string }> }): Promise<NextResponse<APIResponse>>`
- [ ] **10.3** Verify all imports resolve correctly (no "cannot find module" errors)
- [ ] **10.4** Verify response types match `LanguageAvailabilityResponse` from REQ-E04-001
- [ ] **10.5** Verify item query filters by `public_id` and selects `id, source_language`
- [ ] **10.6** Verify translation query filters by `item_id` and `translation_status = 'completed'`
- [ ] **10.7** Verify source language is always included in available languages
- [ ] **10.8** Verify language metadata is enriched using `SUPPORTED_LANGUAGES` constant
- [ ] **10.9** Verify cache headers are set correctly (10-minute s-maxage, 30-minute stale-while-revalidate)
- [ ] **10.10** Verify all error cases return appropriate status codes (400, 404, 500)
- [ ] **10.11** Verify try-catch wraps entire handler body
- [ ] **10.12** Review code for any hardcoded values that should be constants

---

## 11. Run Full Build and Integration Tests

**Context:** TypeScript compilation checks syntax and types, but the full Next.js build process validates route registration, production optimizations, and integration with the parent item route from REQ-E04-005. The nested route `/api/public/items/[publicId]/languages` must be recognized by Next.js as a separate endpoint from `/api/public/items/[publicId]`. Build errors often reveal issues not caught by type checking.

**Files to modify:**
- None (verification only)

**Estimated effort:** 1 story point

- [ ] **11.1** Run full production build: `npm run build`
- [ ] **11.2** Verify build completes successfully without errors
- [ ] **11.3** Check build output for warnings about the new nested route
- [ ] **11.4** Verify Next.js recognizes both routes: check `.next/server/app/api/public/items/[publicId]/route.js` and `.next/server/app/api/public/items/[publicId]/languages/route.js` exist
- [ ] **11.5** Confirm routes are distinct (languages route doesn't override parent route)
- [ ] **11.6** Check bundle size impact: nested route should be minimal
- [ ] **11.7** Verify no circular dependency warnings in build output
- [ ] **11.8** Run linter: `npm run lint` to ensure code style compliance
- [ ] **11.9** Fix any linting errors (prefer-const, no-console in production, etc.)
- [ ] **11.10** Re-run build after fixing lint errors to confirm clean build

---

## 12. Manual Testing with Dev Server

**Context:** Before writing automated tests, manually verify the endpoint works correctly using curl or a browser. Test the happy path (item with translations), edge cases (item with no translations, item not found), and verify the response structure matches expectations. Check cache headers are present. This quick verification catches obvious issues before investing in test infrastructure.

**Files to modify:**
- None (manual testing only)

**Estimated effort:** 1 story point

- [ ] **12.1** Start development server: `npm run dev`
- [ ] **12.2** Test happy path with item that has translations: `curl http://localhost:3000/api/public/items/[EXISTING_PUBLIC_ID]/languages` (replace with actual publicId from database)
- [ ] **12.3** Verify response status is 200 and structure matches `LanguageAvailabilityResponse`: `success: true`, `availableLanguages: LanguageInfo[]`, `sourceLanguage: string`
- [ ] **12.4** Verify `availableLanguages` array contains objects with `code`, `name`, `nativeName`, optional `flag` fields
- [ ] **12.5** Verify source language is included in `availableLanguages` array
- [ ] **12.6** Test item with no translations (newly created item): verify response includes only source language in array
- [ ] **12.7** Test item not found: `curl http://localhost:3000/api/public/items/nonexistent-id/languages` and verify 404 response
- [ ] **12.8** Test missing publicId: `curl http://localhost:3000/api/public/items//languages` and verify 400 response (if route allows it) or 404
- [ ] **12.9** Check cache headers in response: verify `Cache-Control: public, s-maxage=600, stale-while-revalidate=1800`
- [ ] **12.10** Verify response content-type is `application/json`
- [ ] **12.11** Verify logs appear in console with `[api/public/items/languages]` prefix
- [ ] **12.12** Document any issues found and fix them before proceeding

---

## Verification Checklist

After completing all tasks, verify the following acceptance criteria:

- [ ] File `/src/app/api/public/items/[publicId]/languages/route.ts` exists with complete GET handler
- [ ] GET handler accepts `request: NextRequest` and `context: { params: Promise<{ publicId: string }> }` (Next.js 15 pattern)
- [ ] Response structure matches `LanguageAvailabilityResponse` type from REQ-E04-001
- [ ] Response includes `availableLanguages: LanguageInfo[]` with language metadata (code, name, nativeName, flag)
- [ ] Response includes `sourceLanguage: SupportedLanguage` field
- [ ] Source language is always included in `availableLanguages` array
- [ ] Only `translation_status = 'completed'` translations are included in available languages
- [ ] Items table is queried by `public_id` to get internal UUID and source language
- [ ] `item_translations` table is queried filtering by `item_id` and `translation_status`
- [ ] Language codes are enriched with metadata using `SUPPORTED_LANGUAGES` constant
- [ ] Languages are sorted with source language first, then alphabetically
- [ ] Cache-Control header is set: `public, s-maxage=600, stale-while-revalidate=1800` (10min CDN cache)
- [ ] 404 response returned when item not found
- [ ] 400 response returned when publicId missing
- [ ] 500 response returned for unexpected errors (with generic message, detailed logs)
- [ ] All error responses use format: `{ success: false, error: string }`
- [ ] Comprehensive logging with `[api/public/items/languages]` prefix
- [ ] Request duration logged for performance monitoring
- [ ] Try-catch block wraps entire handler
- [ ] `npx tsc --noEmit` runs without errors
- [ ] `npm run build` completes successfully
- [ ] `npm run lint` passes without errors
- [ ] Manual testing confirms endpoint works for all scenarios
- [ ] Nested route doesn't conflict with parent `/api/public/items/[publicId]` route

---

## Notes for Implementation Agent

**Next.js 15 Nested Route Pattern:**
The nested structure `/api/public/items/[publicId]/languages/route.ts` creates a separate endpoint from the parent `/api/public/items/[publicId]/route.ts`. Both can coexist. Requests to `/api/public/items/abc123` go to the parent route, requests to `/api/public/items/abc123/languages` go to this route.

**Database Schema Context:**
Per Epic 3, the `items` table has a `source_language` column (VARCHAR, default 'en', CHECK constraint for valid codes). The `item_translations` table has columns: `item_id` (UUID FK), `language` (VARCHAR), `name`, `description`, `translation_status` ('pending'|'processing'|'completed'|'failed'|'manual'), `translated_at`, etc.

**Translation Status Filtering:**
Only `translation_status = 'completed'` should be exposed to users. Pending/processing/failed translations are internal states that guests shouldn't see. This prevents showing "Available in French" when the French translation is still being generated or failed.

**Source Language Handling:**
The source language (original content language) is ALWAYS available because guests can always view original content. Even if an item has zero completed translations, the response should include the source language in `availableLanguages`. This ensures the language switcher always has at least one option.

**Language Metadata Enrichment:**
The `SUPPORTED_LANGUAGES` constant from REQ-E04-001 (or `/src/contexts/LocaleContext.tsx`) provides:
```typescript
[
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  // ... more languages
]
```

Map each language code to its `LanguageInfo` object for UI-ready response.

**Cache Strategy Rationale:**
- 10-minute CDN cache (`s-maxage=600`) is longer than the main item endpoint (5 minutes) because language availability changes less frequently
- New translations are typically batch-processed, not added in real-time
- 30-minute stale serving (`stale-while-revalidate=1800`) provides fast responses during cache revalidation
- No `Vary` header needed since this endpoint doesn't consider Accept-Language (it returns ALL available languages)

**Performance Optimization:**
- Query only `language` column from `item_translations` to minimize payload
- Use `.eq()` filters at database level, not JavaScript filtering
- Single query for translations (don't join articles/links)
- Expected response time: <50ms under cache, <100ms cache miss

**Error Handling Philosophy:**
- 400: Input validation errors (missing publicId) - should rarely happen with proper routing
- 404: Item doesn't exist - common for invalid/expired URLs
- 500: Database errors or exceptions - log details but return generic message

**Article/Link Translation Checking (Not Implemented):**
The overview explicitly states we DON'T check article/link translations to determine availability. Only item-level translation matters. This simplifies logic and encourages partial translations (translate the item first, articles/links later). If all content types were required, items might show as "not available" in a language even though the main content is translated.

**Response Sorting:**
Languages are sorted with source language first (so original always appears at top of switcher), then alphabetically by code. This provides consistent ordering across all items and makes the source language easy to find.

**Testing Approach (for future task if needed):**
The overview mentions creating tests in `/src/app/api/public/items/[publicId]/languages/__tests__/route.test.ts`. Test scenarios:
1. Item with multiple translations (200, 3+ languages in array)
2. Item with single translation (200, source + 1 language)
3. Item with no translations (200, source language only)
4. Item not found (404)
5. Missing publicId (400 or 404 depending on routing)
6. Cache headers present
7. Source language always in array
8. Translation status filtering works

**Commit Message Suggestion:**
```
[REQ-E04-006] Create language availability API endpoint

- Implement GET /api/public/items/[publicId]/languages
- Return available translations with metadata (names, flags)
- Filter for completed translations only
- Source language always included
- Cache-Control headers (10min CDN, 30min stale)
- Comprehensive error handling (400, 404, 500)
```

---

*Document generated: 2026-01-22 22:38*
*Epic: 4 - Guest Experience*
*Task: Phase 2, Task 2.3 - Create language availability API endpoint*
