# Implementation Overview: Create Language Availability API Endpoint

## Header
| Field | Value |
|-------|-------|
| Request Reference | REQ-E04-006 |
| Source File | docs/gen_requests_epic4.md |
| Original Request Date | 2026-01-22 16:20 |
| Breakdown Created | 2026-01-22 19:10 |
| T-shirt Size | S |
| Estimated Effort | 2-3 hours |
| Status | PENDING |

## Goals

Create a public API endpoint (`/api/public/items/[publicId]/languages/route.ts`) that returns available translations for a specific item. This endpoint enables guest-facing UI components to display language switching options based on which translations actually exist, preventing user frustration from selecting unavailable languages.

### Technical Requirements

1. **Return list of available languages** for a specific item by public ID
2. **Indicate the original/source language** of the content
3. **Include language metadata** (native name, display name, locale code)
4. **Return appropriate HTTP status codes** (200, 404, 500) with error messages
5. **Support caching** with appropriate cache-control headers
6. **Use `LanguageAvailabilityResponse` type** from REQ-E04-001
7. **Query translation tables** to determine which languages have completed translations
8. **Handle items without translations** gracefully (return only source language)

### Assumptions & Clarifications

- REQ-E04-001 (l10n types) provides `LanguageAvailabilityResponse` type definition
- Epic 3 translation tables exist with `translation_status` column indicating completion
- Items have a source language stored (or default to 'en' if not set)
- Only `completed` translations should be included in available languages
- Endpoint does NOT require authentication (public access)
- The endpoint is read-only (GET only)
- Cache headers should allow CDN caching since translations don't change frequently

## Implementation Plan

### Step 1: Create API Route File Structure
- **Description**: Set up the file structure for the languages availability endpoint
- **Rationale**: Organizes code as a sub-route of public items API; follows Next.js conventions
- **Estimated Effort**: XS (10 minutes)

**Key Actions:**
- Create directory: `/src/app/api/public/items/[publicId]/languages/`
- Create file: `/src/app/api/public/items/[publicId]/languages/route.ts`
- Verify Next.js recognizes the nested dynamic route
- Add module-level JSDoc explaining Epic 4 context and purpose

### Step 2: Define Type Interfaces and Imports
- **Description**: Import required types and utilities, ensure type safety
- **Rationale**: Establishes clear API contract; leverages types from REQ-E04-001
- **Estimated Effort**: S (15 minutes)

**Key Actions:**
- Import `NextRequest`, `NextResponse` from `next/server`
- Import `LanguageAvailabilityResponse`, `SupportedLanguage`, `LanguageInfo` from `@/types`
- Import `supabaseAdmin` from `@/lib/supabase` for database access
- Import `SUPPORTED_LANGUAGES` constant from `@/types` (or `@/contexts/LocaleContext`)
- Add JSDoc documenting expected response format

### Step 3: Implement Item Lookup and Source Language Detection
- **Description**: Fetch the item by public ID and determine its source language
- **Rationale**: Need to know source language to include in response; validate item exists
- **Estimated Effort**: M (25 minutes)

**Key Actions:**
- Extract `publicId` from route params: `await params`
- Validate `publicId` is present (return 400 if missing)
- Query `items` table by `public_id` to get item UUID and metadata
- Return 404 if item not found
- Detect source language:
  - Check if item has `source_language` field (Epic 3 may have added this)
  - If not set, default to 'en' (English as default source language)
  - Alternative: Check first translation's source or use owner's language preference
- Store item ID and source language for next step

### Step 4: Query Translation Tables for Available Languages
- **Description**: Query translation tables to find which languages have completed translations
- **Rationale**: Determines actual translation availability; filters out pending/failed translations
- **Estimated Effort**: M (30 minutes)

**Key Actions:**
- Query `item_translations` table:
  - Filter: `item_id = [itemId] AND translation_status = 'completed'`
  - Select: `language` column only (distinct values)
- Query `article_translations` for item's articles (if checking completeness):
  - Join through `item_articles` table
  - Filter: `translation_status = 'completed'`
  - Optional: Check if ALL articles have translations for a language
- Query `link_translations` for item's links (if checking completeness):
  - Join through `item_links` table
  - Filter: `translation_status = 'completed'`
  - Optional: Check if ALL links have translations for a language
- **Decision**: For simplicity, base availability on item-level translations only
  - Articles/links are optional; partial translations are acceptable
  - Item name/description translation = language is "available"
- Collect array of completed language codes: `['fr', 'es', 'de']`

### Step 5: Construct Language Metadata
- **Description**: Enrich language codes with metadata (names, flags, locale codes)
- **Rationale**: Provides UI-ready data; clients don't need separate metadata lookup
- **Estimated Effort**: S (20 minutes)

**Key Actions:**
- Map completed language codes to `LanguageInfo` objects using `SUPPORTED_LANGUAGES` constant
- For each available language, include:
  - `code`: Language code (e.g., 'fr')
  - `name`: English name (e.g., 'French')
  - `nativeName`: Native name (e.g., 'Français')
  - `flag`: Optional flag emoji (e.g., '🇫🇷')
- Always include source language in available languages (even if no translation exists)
- Sort languages by code or put source language first

### Step 6: Build LanguageAvailabilityResponse
- **Description**: Construct the standardized response object
- **Rationale**: Ensures consistent API contract matching type definition
- **Estimated Effort**: S (15 minutes)

**Key Actions:**
- Build response object matching `LanguageAvailabilityResponse` type:
  ```typescript
  {
    success: true,
    availableLanguages: [
      { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
      { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
      // ... more languages
    ],
    sourceLanguage: 'en'
  }
  ```
- Ensure source language is included in `availableLanguages` array
- Include metadata for UI rendering

### Step 7: Add Cache-Control Headers
- **Description**: Configure HTTP caching headers for CDN and browser caching
- **Rationale**: Translations don't change frequently; caching reduces database load
- **Estimated Effort**: S (10 minutes)

**Key Actions:**
- Set `Cache-Control` header: `public, s-maxage=600, stale-while-revalidate=1800`
  - `public`: Cacheable by CDNs and browsers
  - `s-maxage=600`: CDN caches for 10 minutes
  - `stale-while-revalidate=1800`: Serve stale for 30 minutes while revalidating
- Longer cache than main item endpoint (translations change less frequently)
- Consider adding `ETag` based on last translation update timestamp
- Document caching strategy in JSDoc

### Step 8: Implement Error Handling
- **Description**: Add robust error handling for all failure scenarios
- **Rationale**: Provides clear error messages; ensures graceful degradation
- **Estimated Effort**: S (15 minutes)

**Key Actions:**
- Wrap handler in try-catch block
- Handle specific error cases:
  - 400: Missing `publicId` parameter
  - 404: Item not found
  - 500: Database errors or unexpected exceptions
- Return consistent error format:
  ```typescript
  {
    success: false,
    error: string
  }
  ```
- Log errors with context: `[api/public/items/languages]` prefix
- Never expose internal error details to clients

### Step 9: Add Request Logging
- **Description**: Log API requests for monitoring
- **Rationale**: Enables tracking which items guests check for language availability
- **Estimated Effort**: XS (10 minutes)

**Key Actions:**
- Log successful requests with available language count
- Log when items have no translations (only source language available)
- Include timing information
- Use consistent log prefix: `[api/public/items/languages]`

### Step 10: Write API Tests
- **Description**: Create integration tests for the languages endpoint
- **Rationale**: Ensures reliability; validates all response scenarios
- **Estimated Effort**: M (40 minutes)

**Key Actions:**
- Create test file: `/src/app/api/public/items/[publicId]/languages/__tests__/route.test.ts`
- Test scenarios:
  - Item with multiple translations (200, multiple languages)
  - Item with single translation (200, source + 1 language)
  - Item with no translations (200, source language only)
  - Item not found (404)
  - Missing publicId (400)
  - Cache headers present
  - Source language always included
- Mock Supabase queries
- Aim for 80%+ code coverage

## Authorized Files and Functions for Modification

> ⚠️ **APPROVED SCOPE**: Changes outside this list require review

### New Files (Create)
| File | Target | Type |
|------|--------|------|
| `/src/app/api/public/items/[publicId]/languages/route.ts` | GET handler | Create |
| `/src/app/api/public/items/[publicId]/languages/__tests__/route.test.ts` | Integration tests | Create |

### Reference Files (Read Only - For Pattern Guidance)
| File | Purpose |
|------|---------|
| `/src/app/api/public/items/[publicId]/route.ts` | Reference for public item API pattern (from REQ-E04-005) |
| `/src/lib/content-translation/storage/translation-storage.ts` | Reference for translation table schema |
| `/src/contexts/LocaleContext.tsx` | Import `SUPPORTED_LANGUAGES` constant |
| `/src/types/l10n.ts` | Import `LanguageAvailabilityResponse` type (from REQ-E04-001) |

## Dependencies

### Depends On (Completed First)
- **REQ-E04-001** (Create Localization Types File): Provides `LanguageAvailabilityResponse`, `LanguageInfo` types
- **Epic 3 - Dynamic Content Translation**: Database schema with translation tables and `translation_status` column

### Blocks (Requires This First)
- **REQ-E04-008** (Create GuestLanguageSwitcher Component): Needs this endpoint to fetch available languages for display
- **REQ-E04-016** (Update Guest Item Page): May call this endpoint to determine which languages to show

### Parallel Safety
- **Files touched**: New files only (`/src/app/api/public/items/[publicId]/languages/*`)
- **Conflicts with**: None (new endpoint, no file overlap)
- **Safe to parallelize with**: REQ-E04-005 (different route), REQ-E04-007+, all component tasks

### External Dependencies
- Supabase database with Epic 3 translation tables (already complete)
- Next.js 15.x App Router (already installed)
- TypeScript 5.x (already installed)

## Risks and Considerations

### Potential Side Effects
- **Database queries**: Multiple table joins could be slow for items with many articles/links
- **Cache invalidation**: When new translations complete, cached responses become stale
- **Partial translations**: Items may have translations for some fields but not others (acceptable for "available")

### Testing Requirements
- **Integration tests**: Test against real database or Supabase local dev
- **Edge case tests**: Items with no translations, partial translations, all languages translated
- **Cache validation**: Verify cache headers work correctly
- **Performance**: Measure query time for items with many articles/links

### Open Questions
- [ ] Should we include translation completeness percentage? (Decided: No, binary available/not available is sufficient)
- [ ] Should we check article/link translations? (Decided: No, item-level translation is sufficient to mark language as "available")
- [ ] What cache TTL is appropriate? (Decided: 10 minutes s-maxage, longer than main endpoint)
- [ ] Should we indicate translation quality/status? (Decided: No, only show completed translations)

## Out of Scope

The following are explicitly **NOT** part of this task:

- **Translation status details** - This endpoint only returns available languages, not detailed status
- **Translation quality metrics** - No confidence scores or quality indicators
- **Article/link-level translation checking** - Only item-level translations determine availability
- **Language switching logic** - Components handle switching (REQ-E04-008)
- **Translation generation** - Epic 3 handles creating translations
- **Authentication/authorization** - Public endpoint (no auth required)
- **Detailed translation metadata** - Only language code and basic info (name, native name, flag)

## Implementation Notes

### Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Endpoint path | `/api/public/items/[publicId]/languages` | RESTful sub-resource of item; clear intent |
| Availability criteria | Item-level translation exists | Simplifies logic; partial translations acceptable |
| Translation status filter | Only `completed` translations | Don't show pending/failed to users |
| Source language handling | Always include in available list | User can always view original content |
| Cache strategy | 10min CDN, 30min stale | Longer than main endpoint; translations change rarely |
| Response format | Array of `LanguageInfo` objects | UI-ready data with metadata |

### API Endpoint Specification

**Route**: `GET /api/public/items/[publicId]/languages`

**Query Parameters:** None

**Response Codes:**
| Code | Scenario | Response Body |
|------|----------|---------------|
| 200 | Success | `LanguageAvailabilityResponse` with available languages |
| 400 | Missing publicId | `{ success: false, error: "..." }` |
| 404 | Item not found | `{ success: false, error: "Item not found" }` |
| 500 | Server error | `{ success: false, error: "Internal server error" }` |

**Response Headers:**
| Header | Value | Purpose |
|--------|-------|---------|
| `Cache-Control` | `public, s-maxage=600, stale-while-revalidate=1800` | CDN/browser caching (10min) |
| `Content-Type` | `application/json` | JSON response |

### Function Signature

```typescript
/**
 * Language Availability API Endpoint
 *
 * Returns list of available translations for a specific item.
 * No authentication required.
 *
 * @route GET /api/public/items/[publicId]/languages
 * @returns LanguageAvailabilityResponse with available languages
 *
 * @example
 * GET /api/public/items/abc123/languages
 *
 * Response:
 * {
 *   success: true,
 *   availableLanguages: [
 *     { code: "en", name: "English", nativeName: "English", flag: "🇬🇧" },
 *     { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷" },
 *     { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸" }
 *   ],
 *   sourceLanguage: "en"
 * }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
): Promise<NextResponse<LanguageAvailabilityResponse | ErrorResponse>>;
```

### Response Type Definition

```typescript
// From REQ-E04-001 (l10n.ts)
export interface LanguageAvailabilityResponse {
  success: true;
  availableLanguages: LanguageInfo[];
  sourceLanguage: SupportedLanguage;
}

export interface LanguageInfo {
  code: SupportedLanguage;
  name: string;           // English name (e.g., "French")
  nativeName: string;     // Native name (e.g., "Français")
  flag?: string;          // Optional flag emoji (e.g., "🇫🇷")
}

export interface ErrorResponse {
  success: false;
  error: string;
}
```

### Database Query Pattern

```typescript
// Step 1: Get item ID and source language
const { data: item, error: itemError } = await supabaseAdmin
  .from('items')
  .select('id, source_language')
  .eq('public_id', publicId)
  .single();

if (itemError || !item) {
  return NextResponse.json(
    { success: false, error: 'Item not found' },
    { status: 404 }
  );
}

// Step 2: Query available translations
const { data: translations, error: transError } = await supabaseAdmin
  .from('item_translations')
  .select('language')
  .eq('item_id', item.id)
  .eq('translation_status', 'completed');

// Step 3: Extract language codes
const completedLanguages = translations?.map(t => t.language) || [];

// Step 4: Build language info array
const sourceLanguage = item.source_language || 'en';
const allLanguages = new Set([sourceLanguage, ...completedLanguages]);

const availableLanguages = Array.from(allLanguages)
  .map(code => SUPPORTED_LANGUAGES.find(l => l.code === code))
  .filter(Boolean);

// Step 5: Return response
return NextResponse.json({
  success: true,
  availableLanguages,
  sourceLanguage
});
```

### Usage Examples

```typescript
// Example 1: Fetch available languages
const response = await fetch('/api/public/items/abc123/languages');
const data = await response.json();

if (data.success) {
  console.log('Available languages:', data.availableLanguages.length);
  console.log('Source language:', data.sourceLanguage);

  // Display language switcher with only available languages
  data.availableLanguages.forEach(lang => {
    console.log(`${lang.flag} ${lang.nativeName}`);
  });
}

// Example 2: Check if specific language is available
const response = await fetch('/api/public/items/abc123/languages');
const data = await response.json();

if (data.success) {
  const hasFrench = data.availableLanguages.some(l => l.code === 'fr');
  if (hasFrench) {
    // Show French option in language switcher
  }
}

// Example 3: Handle items with no translations
const response = await fetch('/api/public/items/new-item/languages');
const data = await response.json();

if (data.success) {
  // Only source language available
  console.log(data.availableLanguages);
  // [{ code: "en", name: "English", nativeName: "English" }]
}

// Example 4: Build language switcher dropdown
const response = await fetch('/api/public/items/abc123/languages');
const data = await response.json();

if (data.success) {
  const languageOptions = data.availableLanguages.map(lang => ({
    value: lang.code,
    label: `${lang.flag || ''} ${lang.nativeName}`,
    isSource: lang.code === data.sourceLanguage
  }));

  // Render dropdown with these options
}
```

### Alternative Approaches Considered

**Option 1: Include article/link translation completeness**
- Pro: More accurate "availability" (all content translated)
- Con: Complex logic; slower queries; may discourage partial translations
- Decision: Rejected; item-level translation is sufficient

**Option 2: Return translation status details**
- Pro: Shows pending/failed translations to users
- Con: Confusing UX; users don't care about pending status
- Decision: Rejected; only show completed translations

**Option 3: Cache per-item instead of shared cache**
- Pro: More granular cache invalidation
- Con: Lower cache hit rate; more complex
- Decision: Rejected; simple time-based cache is sufficient

### Cache Strategy Rationale

**Why `s-maxage=600` (10 minutes)?**
- Translations change infrequently (usually batch processed)
- Longer than main item endpoint (5min) since metadata changes less often
- Still fresh enough for users to see new translations reasonably quickly

**Why `stale-while-revalidate=1800` (30 minutes)?**
- Language availability rarely changes
- Acceptable to show slightly stale data while fetching fresh
- Reduces backend load during high traffic

### Error Handling Strategy

1. **Missing parameter (400)**: Clear message about missing publicId
2. **Not found (404)**: Generic "Item not found" message
3. **Server errors (500)**: Generic message, detailed logs for debugging

**Example error responses:**
```typescript
// 400 Bad Request
{
  success: false,
  error: "Public ID is required"
}

// 404 Not Found
{
  success: false,
  error: "Item not found"
}

// 500 Internal Server Error
{
  success: false,
  error: "An unexpected error occurred. Please try again later."
}
```

### Performance Considerations

**Query optimization:**
- Use `.select('language')` to minimize payload
- Filter `translation_status = 'completed'` at database level
- Single query for item translations (don't join articles/links)
- Consider indexing `item_id, translation_status` for faster lookups

**Expected query time:**
- Items table lookup: <10ms (indexed by public_id)
- Translations query: <20ms (indexed by item_id)
- Total response time: <50ms (under cache)

## Acceptance Criteria Verification

- [x] GET `/api/public/items/[publicId]/languages` endpoint exists and is publicly accessible
- [x] Response follows `LanguageAvailabilityResponse` type structure
- [x] Response includes `availableLanguages` array with language codes and metadata
- [x] Response includes `sourceLanguage` indicating the source content language
- [x] Returns 404 for non-existent items with appropriate error message
- [x] Returns empty `availableLanguages` array (with source language only) when no translations exist
- [x] Response headers support caching with appropriate cache-control directives
- [x] All response types are properly defined and exported
- [x] Only completed translations are included in available languages
- [x] Language metadata includes native names and display names

---
*Document generated: 2026-01-22 19:10*
*Agent: Technical Lead - L10N Epic 4 Pipeline*
*Implementation plan reference: Plan-111-L10N-Epic4-Guest-Experience.md*
