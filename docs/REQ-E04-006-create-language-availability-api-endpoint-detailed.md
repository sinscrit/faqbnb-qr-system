# REQ-E04-006: Create Language Availability API Endpoint - Detailed Task Breakdown

**Generated:** 2026-01-19 23:15:00 UTC
**Last Modified:** 2026-01-19 23:15:00 UTC
**Request ID:** REQ-E04-006
**Epic:** Epic 4 - Guest Experience
**Phase:** 2 - Translation Data Layer
**Task ID:** 2.3
**Overview Document:** REQ-E04-006-create-language-availability-api-endpoint-overview.md

---

## Executive Summary

This document provides a granular, step-by-step implementation guide for creating a public API endpoint that returns language availability information for a specific item. The endpoint enables guest-facing language switcher components to display accurate translation availability indicators.

**Total Estimated Tasks:** 8 tasks
**Complexity:** Low-Medium
**Size:** S (Small)

---

## Prerequisites

Before starting implementation, verify the following:

| Prerequisite | Verification | Status |
|--------------|--------------|--------|
| Epic 1 Foundation complete | Translation tables exist in database | Required |
| Translation types available | `SupportedLanguage`, `TranslationStatus` in `/src/lib/translation-service/translation-service.types.ts` | Required |
| Existing items API pattern | `/src/app/api/items/[publicId]/route.ts` exists | Available |
| Supabase client configured | `/src/lib/supabase.ts` exports working client | Available |

---

## Task Breakdown

### Task 1: Add LanguageAvailabilityResponse Interface to Types

**File:** `/src/lib/translation-service/translation-service.types.ts`
**Action:** MODIFY
**Lines to modify:** Add after line 489 (after `TranslationResult` type)

#### Description
Add the `LanguageAvailabilityResponse` interface and supporting types to the existing translation service types file. This provides type safety for the API response.

#### Implementation Details

Add the following type definitions after the `TranslationResult` type (around line 489):

```typescript
// ============================================================================
// Language Availability API Types
// ============================================================================

/**
 * Language availability detail for a specific language.
 * Provides granular breakdown of translation completeness.
 */
export interface LanguageAvailabilityDetail {
  /** Overall status for this language */
  status: 'available' | 'partial' | 'pending' | 'unavailable';
  /** Number of translated articles */
  articlesTranslated: number;
  /** Total number of articles */
  totalArticles: number;
  /** Number of translated links */
  linksTranslated: number;
  /** Total number of links */
  totalLinks: number;
  /** Whether item name/description is translated */
  itemTranslated: boolean;
  /** Tags translation count */
  tagsTranslated: number;
  /** Total tags count */
  totalTags: number;
}

/**
 * Response structure for the language availability endpoint.
 * Returns translation availability for a specific item.
 */
export interface LanguageAvailabilityResponse {
  /** Source/original language of the item */
  sourceLanguage: SupportedLanguage;
  /** Languages with completed translations */
  availableTranslations: SupportedLanguage[];
  /** Languages with pending/processing translations */
  pendingTranslations: SupportedLanguage[];
  /** Languages with no translations or failed translations */
  unavailableTranslations: SupportedLanguage[];
  /** Detailed breakdown per language (optional, for enhanced display) */
  languageDetails?: Partial<Record<SupportedLanguage, LanguageAvailabilityDetail>>;
}
```

#### Acceptance Criteria
- [ ] `LanguageAvailabilityDetail` interface is exported
- [ ] `LanguageAvailabilityResponse` interface is exported
- [ ] Types align with the API contract defined in the overview
- [ ] No TypeScript compilation errors

#### Verification Command
```bash
npx tsc --noEmit
```

---

### Task 2: Create Directory Structure for Public Items API

**Path:** `/src/app/api/public/items/[publicId]/languages/`
**Action:** CREATE DIRECTORY

#### Description
Create the nested directory structure for the new public API endpoint. This follows Next.js App Router conventions.

#### Implementation Details

Create the directory structure:
```
/src/app/api/public/
└── items/
    └── [publicId]/
        └── languages/
            └── route.ts  (created in Task 3)
```

#### Verification
```bash
ls -la /src/app/api/public/items/[publicId]/languages/
```

---

### Task 3: Create the Language Availability API Route File

**File:** `/src/app/api/public/items/[publicId]/languages/route.ts`
**Action:** CREATE

#### Description
Create the main API route handler that returns language availability for an item. This is a public endpoint (no authentication required) that queries translation tables and aggregates availability data.

#### Implementation Details

```typescript
/**
 * Language Availability API Endpoint
 * REQ-E04-006: Create Language Availability API Endpoint
 *
 * GET /api/public/items/[publicId]/languages
 *
 * Returns the list of available translation languages for a specific item,
 * including completeness indicators for each language.
 *
 * @created 2026-01-19
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import {
  SupportedLanguage,
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
  LanguageAvailabilityResponse,
  LanguageAvailabilityDetail,
} from '@/lib/translation-service/translation-service.types';

// Cache headers: 5 minutes cache, 10 minutes stale-while-revalidate
const CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
  'Content-Type': 'application/json',
};

/**
 * GET handler for language availability
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
) {
  try {
    const { publicId } = await params;

    // Validate publicId
    if (!publicId || typeof publicId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Public ID is required', code: 'INVALID_PUBLIC_ID' },
        { status: 400, headers: CACHE_HEADERS }
      );
    }

    // Fetch item to verify existence and get internal ID
    const { data: item, error: itemError } = await supabase
      .from('items')
      .select('id, source_language')
      .eq('public_id', publicId)
      .single();

    if (itemError || !item) {
      return NextResponse.json(
        { success: false, error: 'Item not found', code: 'ITEM_NOT_FOUND' },
        { status: 404, headers: CACHE_HEADERS }
      );
    }

    const itemId = item.id;
    const sourceLanguage: SupportedLanguage = item.source_language || DEFAULT_LANGUAGE;

    // Fetch all translation statuses in parallel
    const [
      itemTranslationsResult,
      articleTranslationsResult,
      linkTranslationsResult,
      tagTranslationsResult,
      articleCountResult,
      linkCountResult,
      tagCountResult,
    ] = await Promise.all([
      // Item translations status per language
      supabase
        .from('item_translations')
        .select('language, translation_status')
        .eq('item_id', itemId),

      // Article translations count per language
      supabase.rpc('get_article_translation_counts', { p_item_id: itemId }),

      // Link translations count per language
      supabase.rpc('get_link_translation_counts', { p_item_id: itemId }),

      // Tag translations count per language
      supabase.rpc('get_tag_translation_counts', { p_item_id: itemId }),

      // Total article count
      supabase
        .from('item_articles')
        .select('id', { count: 'exact', head: true })
        .eq('item_id', itemId),

      // Total link count
      supabase
        .from('item_links')
        .select('id', { count: 'exact', head: true })
        .eq('item_id', itemId),

      // Total tag count for item
      supabase
        .from('item_tags')
        .select('tag_key', { count: 'exact', head: true })
        .eq('item_id', itemId),
    ]);

    // Build aggregated response
    const response = buildLanguageAvailabilityResponse(
      sourceLanguage,
      itemTranslationsResult.data || [],
      articleTranslationsResult.data || [],
      linkTranslationsResult.data || [],
      tagTranslationsResult.data || [],
      articleCountResult.count || 0,
      linkCountResult.count || 0,
      tagCountResult.count || 0
    );

    return NextResponse.json(
      { success: true, data: response },
      { status: 200, headers: CACHE_HEADERS }
    );
  } catch (error) {
    console.error('Language availability API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500, headers: CACHE_HEADERS }
    );
  }
}

/**
 * Builds the LanguageAvailabilityResponse from translation data
 */
function buildLanguageAvailabilityResponse(
  sourceLanguage: SupportedLanguage,
  itemTranslations: Array<{ language: string; translation_status: string }>,
  articleTranslations: Array<{ language: string; completed_count: number; pending_count: number }>,
  linkTranslations: Array<{ language: string; completed_count: number; pending_count: number }>,
  tagTranslations: Array<{ language: string; completed_count: number }>,
  totalArticles: number,
  totalLinks: number,
  totalTags: number
): LanguageAvailabilityResponse {
  const allLanguages = SUPPORTED_LANGUAGES.map(l => l.code).filter(l => l !== sourceLanguage);

  const availableTranslations: SupportedLanguage[] = [];
  const pendingTranslations: SupportedLanguage[] = [];
  const unavailableTranslations: SupportedLanguage[] = [];
  const languageDetails: Partial<Record<SupportedLanguage, LanguageAvailabilityDetail>> = {};

  for (const lang of allLanguages) {
    const itemTrans = itemTranslations.find(t => t.language === lang);
    const articleTrans = articleTranslations.find(t => t.language === lang);
    const linkTrans = linkTranslations.find(t => t.language === lang);
    const tagTrans = tagTranslations.find(t => t.language === lang);

    const articlesTranslated = articleTrans?.completed_count || 0;
    const linksTranslated = linkTrans?.completed_count || 0;
    const tagsTranslated = tagTrans?.completed_count || 0;
    const itemTranslated = itemTrans?.translation_status === 'completed';

    const articlesPending = articleTrans?.pending_count || 0;
    const linksPending = linkTrans?.pending_count || 0;
    const itemPending = itemTrans?.translation_status === 'pending' || itemTrans?.translation_status === 'processing';

    // Determine overall status for this language
    const hasAnyTranslation = itemTranslated || articlesTranslated > 0 || linksTranslated > 0 || tagsTranslated > 0;
    const hasAnyPending = itemPending || articlesPending > 0 || linksPending > 0;
    const isComplete =
      itemTranslated &&
      articlesTranslated >= totalArticles &&
      linksTranslated >= totalLinks &&
      tagsTranslated >= totalTags;

    let status: 'available' | 'partial' | 'pending' | 'unavailable';

    if (isComplete) {
      status = 'available';
      availableTranslations.push(lang as SupportedLanguage);
    } else if (hasAnyTranslation) {
      status = 'partial';
      availableTranslations.push(lang as SupportedLanguage); // Partial still counts as available
    } else if (hasAnyPending) {
      status = 'pending';
      pendingTranslations.push(lang as SupportedLanguage);
    } else {
      status = 'unavailable';
      unavailableTranslations.push(lang as SupportedLanguage);
    }

    languageDetails[lang as SupportedLanguage] = {
      status,
      articlesTranslated,
      totalArticles,
      linksTranslated,
      totalLinks,
      itemTranslated,
      tagsTranslated,
      totalTags,
    };
  }

  return {
    sourceLanguage,
    availableTranslations,
    pendingTranslations,
    unavailableTranslations,
    languageDetails,
  };
}
```

#### Acceptance Criteria
- [ ] File created at `/src/app/api/public/items/[publicId]/languages/route.ts`
- [ ] GET handler exports properly
- [ ] Returns 400 for missing/invalid publicId
- [ ] Returns 404 for non-existent item
- [ ] Returns 200 with LanguageAvailabilityResponse for valid item
- [ ] Response includes proper cache headers
- [ ] No TypeScript errors

---

### Task 4: Create Database Helper Functions (RPC Functions)

**Location:** Supabase SQL Migration
**Action:** CREATE MIGRATION

#### Description
Create PostgreSQL functions to efficiently aggregate translation counts per language. These RPC functions avoid loading full content and use indexed queries for performance.

#### Implementation Details

Create a new migration file or run directly in Supabase SQL editor:

```sql
-- REQ-E04-006: Translation count aggregation functions
-- These functions efficiently count translations per language for an item

-- Function: Get article translation counts per language
CREATE OR REPLACE FUNCTION get_article_translation_counts(p_item_id UUID)
RETURNS TABLE (
  language TEXT,
  completed_count BIGINT,
  pending_count BIGINT
)
LANGUAGE SQL
STABLE
AS $$
  SELECT
    at.language,
    COUNT(*) FILTER (WHERE at.translation_status = 'completed') as completed_count,
    COUNT(*) FILTER (WHERE at.translation_status IN ('pending', 'processing')) as pending_count
  FROM article_translations at
  INNER JOIN item_articles ia ON ia.id = at.article_id
  WHERE ia.item_id = p_item_id
  GROUP BY at.language;
$$;

-- Function: Get link translation counts per language
CREATE OR REPLACE FUNCTION get_link_translation_counts(p_item_id UUID)
RETURNS TABLE (
  language TEXT,
  completed_count BIGINT,
  pending_count BIGINT
)
LANGUAGE SQL
STABLE
AS $$
  SELECT
    lt.language,
    COUNT(*) FILTER (WHERE lt.translation_status = 'completed') as completed_count,
    COUNT(*) FILTER (WHERE lt.translation_status IN ('pending', 'processing')) as pending_count
  FROM link_translations lt
  INNER JOIN item_links il ON il.id = lt.link_id
  WHERE il.item_id = p_item_id
  GROUP BY lt.language;
$$;

-- Function: Get tag translation counts per language
CREATE OR REPLACE FUNCTION get_tag_translation_counts(p_item_id UUID)
RETURNS TABLE (
  language TEXT,
  completed_count BIGINT
)
LANGUAGE SQL
STABLE
AS $$
  SELECT
    tt.language,
    COUNT(*) as completed_count
  FROM tag_translations tt
  INNER JOIN item_tags it ON it.tag_key = tt.tag_key
  WHERE it.item_id = p_item_id
  GROUP BY tt.language;
$$;

-- Grant execute permissions to authenticated and anon roles
GRANT EXECUTE ON FUNCTION get_article_translation_counts(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_link_translation_counts(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_tag_translation_counts(UUID) TO authenticated, anon;
```

#### Alternative: Inline Queries (No Migration Required)

If RPC functions are not desired, modify Task 3 to use inline queries:

```typescript
// Replace RPC calls with direct queries
const articleTranslationsResult = await supabase
  .from('article_translations')
  .select('language, translation_status')
  .in('article_id', articleIds);

// Then aggregate in JavaScript
```

#### Acceptance Criteria
- [ ] RPC functions created in Supabase
- [ ] Functions return correct aggregation
- [ ] Permissions granted for anon access
- [ ] OR: Inline queries implemented as alternative

---

### Task 5: Add source_language Column to Items Table (If Not Exists)

**Location:** Supabase SQL Migration
**Action:** CONDITIONAL MIGRATION

#### Description
Ensure the `items` table has a `source_language` column to track the original content language. This may already exist from Epic 1.

#### Implementation Details

Check if column exists, add if not:

```sql
-- REQ-E04-006: Ensure source_language column exists on items table
-- This may already exist from Epic 1

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'items' AND column_name = 'source_language'
  ) THEN
    ALTER TABLE items
    ADD COLUMN source_language TEXT DEFAULT 'en';
  END IF;
END $$;

-- Add comment
COMMENT ON COLUMN items.source_language IS 'ISO 639-1 language code for the original content language';
```

#### Verification
```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'items' AND column_name = 'source_language';
```

#### Acceptance Criteria
- [ ] `source_language` column exists on `items` table
- [ ] Column has default value of 'en'
- [ ] No data loss from existing items

---

### Task 6: Update Supabase TypeScript Types (If Needed)

**File:** `/src/lib/supabase.ts` or types file
**Action:** VERIFY/UPDATE

#### Description
Ensure TypeScript types for Supabase include the `source_language` field on items and any RPC function return types.

#### Implementation Details

If using generated types, regenerate:
```bash
npx supabase gen types typescript --project-id <PROJECT_ID> > src/types/database.types.ts
```

If manually defined, ensure types include:
```typescript
interface Item {
  // ... existing fields
  source_language?: string;
}
```

#### Acceptance Criteria
- [ ] TypeScript types include `source_language` on items
- [ ] No TypeScript errors when accessing `item.source_language`

---

### Task 7: Write Manual Test Cases

**File:** `/docs/testing/REQ-E04-006-test-cases.md` (optional) or manual testing
**Action:** TEST

#### Description
Test the endpoint manually to verify functionality before marking complete.

#### Test Cases

| # | Test Case | Expected Result | Status |
|---|-----------|-----------------|--------|
| 1 | GET `/api/public/items/[validPublicId]/languages` | 200 with LanguageAvailabilityResponse | [ ] |
| 2 | GET `/api/public/items/[invalidPublicId]/languages` | 404 Item not found | [ ] |
| 3 | GET `/api/public/items//languages` | 400 Invalid publicId | [ ] |
| 4 | Item with all translations complete | `availableTranslations` contains languages | [ ] |
| 5 | Item with no translations | `unavailableTranslations` contains all non-source languages | [ ] |
| 6 | Item with pending translations | `pendingTranslations` contains languages | [ ] |
| 7 | Item with partial translations | `languageDetails` shows partial status | [ ] |
| 8 | Item with no articles/links | Handles zero counts gracefully | [ ] |
| 9 | Response includes cache headers | `Cache-Control` header present | [ ] |

#### Test Commands

```bash
# Test with a known publicId
curl -X GET "http://localhost:3000/api/public/items/abc123/languages" | jq

# Test 404
curl -X GET "http://localhost:3000/api/public/items/nonexistent/languages" | jq

# Check headers
curl -I "http://localhost:3000/api/public/items/abc123/languages"
```

#### Acceptance Criteria
- [ ] All test cases pass
- [ ] Response format matches LanguageAvailabilityResponse
- [ ] Cache headers are present

---

### Task 8: Verify Build and Integration

**Action:** VERIFY

#### Description
Run build and verify no TypeScript or runtime errors.

#### Verification Steps

```bash
# TypeScript check
npx tsc --noEmit

# Build check
npm run build

# Dev server test
npm run dev
# Then test endpoint in browser/curl
```

#### Acceptance Criteria
- [ ] `tsc --noEmit` passes with no errors
- [ ] `npm run build` completes successfully
- [ ] Endpoint responds correctly in dev environment

---

## Implementation Order

```
Task 1 (Types)
    │
    ▼
Task 5 (DB Column) ──────► Task 4 (RPC Functions)
    │                           │
    ▼                           │
Task 6 (TS Types)               │
    │                           │
    └───────────┬───────────────┘
                │
                ▼
           Task 2 (Directory)
                │
                ▼
           Task 3 (Route Handler)
                │
                ▼
           Task 7 (Testing)
                │
                ▼
           Task 8 (Verification)
```

**Parallel Tasks:** Tasks 4 and 5 can be done in parallel after Task 1.

---

## Files Summary

| File | Action | Task |
|------|--------|------|
| `/src/lib/translation-service/translation-service.types.ts` | MODIFY | 1 |
| `/src/app/api/public/items/[publicId]/languages/route.ts` | CREATE | 3 |
| Supabase migration (RPC functions) | CREATE | 4 |
| Supabase migration (source_language) | CONDITIONAL | 5 |
| `/src/lib/supabase.ts` or types | VERIFY | 6 |

---

## Rollback Plan

If issues arise:

1. **Route file issue:** Delete `/src/app/api/public/items/[publicId]/languages/route.ts`
2. **Type issue:** Revert changes to `translation-service.types.ts`
3. **Database issue:** Drop RPC functions with:
   ```sql
   DROP FUNCTION IF EXISTS get_article_translation_counts(UUID);
   DROP FUNCTION IF EXISTS get_link_translation_counts(UUID);
   DROP FUNCTION IF EXISTS get_tag_translation_counts(UUID);
   ```

---

## Definition of Done

- [ ] All 8 tasks completed
- [ ] TypeScript compiles without errors
- [ ] Build passes
- [ ] Endpoint returns correct response format
- [ ] 404 returned for non-existent items
- [ ] 400 returned for invalid input
- [ ] Cache headers present on responses
- [ ] Manual test cases pass
- [ ] Code committed with appropriate message

---

## References

- **Overview Document:** `/docs/REQ-E04-006-create-language-availability-api-endpoint-overview.md`
- **Request Document:** `/docs/gen_requests_epic4.md` - REQ-E04-006
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md` - Task 2.3
- **Existing Item API:** `/src/app/api/items/[publicId]/route.ts`
- **Translation Types:** `/src/lib/translation-service/translation-service.types.ts`
- **Supabase Client:** `/src/lib/supabase.ts`
