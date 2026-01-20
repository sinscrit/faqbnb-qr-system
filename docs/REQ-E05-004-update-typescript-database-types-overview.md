# Implementation Breakdown: REQ-E05-004 - Update TypeScript Database Types

**Document Created:** 2026-01-19
**Last Modified:** 2026-01-19
**Request ID:** REQ-E05-004
**Epic:** Epic 5 - Owner Translation Management
**Phase:** 1 - API Endpoints
**Task ID:** 1.5
**Implementation Plan Reference:** Plan-111-L10N-Epic5-Owner-Translation-Management.md

---

## Overview

This task updates the TypeScript database type definitions in `/src/lib/supabase.ts` to accurately reflect the complete translation table schema, including all columns added during Epic 1 (Foundation) and Epic 5 (Owner Translation Management). The goal is to ensure developers have complete type safety, accurate IntelliSense support, and compile-time validation when working with translation data.

### Business Context

Accurate TypeScript types are essential for maintaining code quality and developer productivity. When database schema changes (like the `source_version_at` columns added in REQ-E05-003) are not reflected in TypeScript types, developers experience:
- Missing autocomplete suggestions
- False-positive type errors or missed type mismatches
- Runtime errors when accessing properties that exist in the database but not in types
- Reduced confidence in refactoring operations

### Technical Context

The current TypeScript types in `/src/lib/supabase.ts` already include translation table definitions (added in Epic 1), but need updates to:
1. Add the `source_version_at` column to all three translation tables (items, articles, links)
2. Add `reviewed_by` column to `item_translations` and `link_translations` (if not present)
3. Add enum-style type definitions for translation status values
4. Add enum-style type definitions for entity types
5. Ensure JSON column types use specific structures rather than generic types

---

## Dependencies

### Required from Epic 1 (Foundation)
| Dependency | Status | Notes |
|------------|--------|-------|
| Translation tables created | Verified | `item_translations`, `article_translations`, `link_translations`, `tag_translations` |
| `translation_jobs` table | Verified | Includes `locked_by`, `locked_at` columns |
| Base type definitions in supabase.ts | Verified | Already includes translation table types |

### Required from REQ-E05-003 (This Epic)
| Dependency | Status | Notes |
|------------|--------|-------|
| `source_version_at` columns added | Pending | Must be applied before types are updated |
| Database migration for indexes | Pending | Not a blocker for type updates |

### Integration Points
| System | Purpose |
|--------|---------|
| `/src/lib/translation-service/translation-service.types.ts` | Has separate type definitions - may need sync |
| `/src/types/index.ts` | Re-exports locale types - may need to add translation types |
| Translation API routes | Will consume these updated types |

---

## Current State Analysis

### Existing Translation Table Types in `/src/lib/supabase.ts`

**item_translations:**
```typescript
Row: {
  id: string
  item_id: string
  language: string
  name: string
  description: string | null
  translation_status: string
  translated_at: string | null
  created_at: string | null
  updated_at: string | null
}
```
**Missing:** `source_version_at`, `reviewed_by`

**article_translations:**
```typescript
Row: {
  id: string
  article_id: string
  language: string
  title: string
  description: string | null
  translation_status: string
  translated_at: string | null
  reviewed_by: string | null
  created_at: string | null
  updated_at: string | null
}
```
**Missing:** `source_version_at`

**link_translations:**
```typescript
Row: {
  id: string
  link_id: string
  language: string
  title: string
  translation_status: string
  translated_at: string | null
  created_at: string | null
  updated_at: string | null
}
```
**Missing:** `source_version_at`, `reviewed_by` (if applicable based on schema)

**translation_jobs:**
```typescript
Row: {
  id: string
  entity_type: string
  entity_id: string
  source_language: string
  target_language: string
  status: string
  attempts: number | null
  error_message: string | null
  created_at: string | null
  started_at: string | null
  completed_at: string | null
  locked_by: string | null
  locked_at: string | null
}
```
**Status:** Complete (includes REQ-243 locking columns)

---

## Implementation Tasks

### Task 1: Add Translation Type Aliases
**Effort:** XS (Extra Small)
**File:** `/src/lib/supabase.ts`

Add type aliases at the top of the file (after the `Json` type definition) for improved type safety:

```typescript
/**
 * Translation status values for translation records.
 * @see translation_status column in *_translations tables
 */
export type TranslationStatusType = 'pending' | 'processing' | 'completed' | 'failed' | 'manual';

/**
 * Entity types that can be translated.
 * @see entity_type column in translation_jobs table
 */
export type TranslatableEntityType = 'article' | 'item' | 'link' | 'tag';

/**
 * Supported language codes (ISO 639-1).
 * @see language columns in *_translations tables
 */
export type SupportedLanguageCode = 'en' | 'fr' | 'es' | 'de' | 'nl' | 'it';

/**
 * Translation job status values.
 * @see status column in translation_jobs table
 */
export type TranslationJobStatusType = 'queued' | 'processing' | 'completed' | 'failed';
```

### Task 2: Update item_translations Types
**Effort:** S (Small)
**File:** `/src/lib/supabase.ts`

Update the `item_translations` table type definition:

**Row:**
```typescript
item_translations: {
  Row: {
    id: string
    item_id: string
    language: string  // Consider: SupportedLanguageCode
    name: string
    description: string | null
    translation_status: string  // Consider: TranslationStatusType
    translated_at: string | null
    reviewed_by: string | null  // REQ-E05-004: Add for manual edit tracking
    source_version_at: string | null  // REQ-E05-004: Source content version for staleness detection
    created_at: string | null
    updated_at: string | null
  }
  Insert: {
    id?: string
    item_id: string
    language: string
    name: string
    description?: string | null
    translation_status?: string
    translated_at?: string | null
    reviewed_by?: string | null  // REQ-E05-004
    source_version_at?: string | null  // REQ-E05-004
    created_at?: string | null
    updated_at?: string | null
  }
  Update: {
    id?: string
    item_id?: string
    language?: string
    name?: string
    description?: string | null
    translation_status?: string
    translated_at?: string | null
    reviewed_by?: string | null  // REQ-E05-004
    source_version_at?: string | null  // REQ-E05-004
    created_at?: string | null
    updated_at?: string | null
  }
  Relationships: [
    {
      foreignKeyName: "item_translations_item_id_fkey"
      columns: ["item_id"]
      isOneToOne: false
      referencedRelation: "items"
      referencedColumns: ["id"]
    },
    {
      foreignKeyName: "item_translations_reviewed_by_fkey"
      columns: ["reviewed_by"]
      isOneToOne: false
      referencedRelation: "users"
      referencedColumns: ["id"]
    }
  ]
}
```

### Task 3: Update article_translations Types
**Effort:** S (Small)
**File:** `/src/lib/supabase.ts`

Update the `article_translations` table type definition to add `source_version_at`:

**Row:**
```typescript
article_translations: {
  Row: {
    id: string
    article_id: string
    language: string
    title: string
    description: string | null
    translation_status: string
    translated_at: string | null
    reviewed_by: string | null
    source_version_at: string | null  // REQ-E05-004: Source content version for staleness detection
    created_at: string | null
    updated_at: string | null
  }
  Insert: {
    id?: string
    article_id: string
    language: string
    title: string
    description?: string | null
    translation_status?: string
    translated_at?: string | null
    reviewed_by?: string | null
    source_version_at?: string | null  // REQ-E05-004
    created_at?: string | null
    updated_at?: string | null
  }
  Update: {
    id?: string
    article_id?: string
    language?: string
    title?: string
    description?: string | null
    translation_status?: string
    translated_at?: string | null
    reviewed_by?: string | null
    source_version_at?: string | null  // REQ-E05-004
    created_at?: string | null
    updated_at?: string | null
  }
  // Relationships unchanged
}
```

### Task 4: Update link_translations Types
**Effort:** S (Small)
**File:** `/src/lib/supabase.ts`

Update the `link_translations` table type definition:

**Row:**
```typescript
link_translations: {
  Row: {
    id: string
    link_id: string
    language: string
    title: string
    translation_status: string
    translated_at: string | null
    reviewed_by: string | null  // REQ-E05-004: Add for manual edit tracking
    source_version_at: string | null  // REQ-E05-004: Source content version for staleness detection
    created_at: string | null
    updated_at: string | null
  }
  Insert: {
    id?: string
    link_id: string
    language: string
    title: string
    translation_status?: string
    translated_at?: string | null
    reviewed_by?: string | null  // REQ-E05-004
    source_version_at?: string | null  // REQ-E05-004
    created_at?: string | null
    updated_at?: string | null
  }
  Update: {
    id?: string
    link_id?: string
    language?: string
    title?: string
    translation_status?: string
    translated_at?: string | null
    reviewed_by?: string | null  // REQ-E05-004
    source_version_at?: string | null  // REQ-E05-004
    created_at?: string | null
    updated_at?: string | null
  }
  Relationships: [
    {
      foreignKeyName: "link_translations_link_id_fkey"
      columns: ["link_id"]
      isOneToOne: false
      referencedRelation: "item_links"
      referencedColumns: ["id"]
    },
    {
      foreignKeyName: "link_translations_reviewed_by_fkey"
      columns: ["reviewed_by"]
      isOneToOne: false
      referencedRelation: "users"
      referencedColumns: ["id"]
    }
  ]
}
```

### Task 5: Verify translation_jobs Types Are Complete
**Effort:** XS (Extra Small)
**File:** `/src/lib/supabase.ts`

Verify that `translation_jobs` types include all columns. Based on current inspection, the types already include:
- `locked_by` (REQ-243)
- `locked_at` (REQ-243)

No changes needed unless database schema has additional columns not reflected.

### Task 6: Update Translation Service Types for Consistency
**Effort:** S (Small)
**File:** `/src/lib/translation-service/translation-service.types.ts`

Update the database record types to include `source_version_at`:

```typescript
/**
 * Article translation database record.
 * Maps to article_translations table.
 */
export interface ArticleTranslationRecord {
  id: string;
  article_id: string;
  language: SupportedLanguage;
  title: string;
  description: string | null;
  translation_status: TranslationStatus;
  translated_at: string | null;
  reviewed_by: string | null;
  source_version_at: string | null;  // REQ-E05-004
  created_at: string;
  updated_at: string;
}

/**
 * Item translation database record.
 * Maps to item_translations table.
 */
export interface ItemTranslationRecord {
  id: string;
  item_id: string;
  language: SupportedLanguage;
  name: string;
  description: string | null;
  translation_status: TranslationStatus;
  translated_at: string | null;
  reviewed_by: string | null;  // REQ-E05-004
  source_version_at: string | null;  // REQ-E05-004
  created_at: string;
  updated_at: string;
}

/**
 * Link translation database record.
 * Maps to link_translations table.
 */
export interface LinkTranslationRecord {
  id: string;
  link_id: string;
  language: SupportedLanguage;
  title: string;
  translation_status: TranslationStatus;
  translated_at: string | null;
  reviewed_by: string | null;  // REQ-E05-004
  source_version_at: string | null;  // REQ-E05-004
  created_at: string;
  updated_at: string;
}

/**
 * Translation job database record.
 * Maps to translation_jobs table.
 */
export interface TranslationJobRecord {
  id: string;
  entity_type: TranslatableEntityType;
  entity_id: string;
  source_language: SupportedLanguage;
  target_language: SupportedLanguage;
  status: TranslationJobStatus;
  attempts: number;
  error_message: string | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  locked_by: string | null;  // REQ-243
  locked_at: string | null;  // REQ-243
}
```

### Task 7: Verify Build and Type Compilation
**Effort:** XS (Extra Small)
**File:** N/A (verification only)

Run TypeScript compilation to verify no type errors:
```bash
npm run typecheck
# or
npx tsc --noEmit
```

Also verify build succeeds:
```bash
npm run build
```

---

## Authorized Files and Functions for Modification

### Primary File

| File | Section | Change |
|------|---------|--------|
| `/src/lib/supabase.ts` | Type aliases (top) | Add `TranslationStatusType`, `TranslatableEntityType`, `SupportedLanguageCode`, `TranslationJobStatusType` |
| `/src/lib/supabase.ts` | `item_translations.Row` | Add `source_version_at: string \| null`, `reviewed_by: string \| null` |
| `/src/lib/supabase.ts` | `item_translations.Insert` | Add `source_version_at?: string \| null`, `reviewed_by?: string \| null` |
| `/src/lib/supabase.ts` | `item_translations.Update` | Add `source_version_at?: string \| null`, `reviewed_by?: string \| null` |
| `/src/lib/supabase.ts` | `item_translations.Relationships` | Add `reviewed_by` FK relationship |
| `/src/lib/supabase.ts` | `article_translations.Row` | Add `source_version_at: string \| null` |
| `/src/lib/supabase.ts` | `article_translations.Insert` | Add `source_version_at?: string \| null` |
| `/src/lib/supabase.ts` | `article_translations.Update` | Add `source_version_at?: string \| null` |
| `/src/lib/supabase.ts` | `link_translations.Row` | Add `source_version_at: string \| null`, `reviewed_by: string \| null` |
| `/src/lib/supabase.ts` | `link_translations.Insert` | Add `source_version_at?: string \| null`, `reviewed_by?: string \| null` |
| `/src/lib/supabase.ts` | `link_translations.Update` | Add `source_version_at?: string \| null`, `reviewed_by?: string \| null` |
| `/src/lib/supabase.ts` | `link_translations.Relationships` | Add `reviewed_by` FK relationship |

### Secondary File (Type Consistency)

| File | Section | Change |
|------|---------|--------|
| `/src/lib/translation-service/translation-service.types.ts` | `ArticleTranslationRecord` | Add `source_version_at: string \| null` |
| `/src/lib/translation-service/translation-service.types.ts` | `ItemTranslationRecord` | Add `source_version_at: string \| null`, `reviewed_by: string \| null` |
| `/src/lib/translation-service/translation-service.types.ts` | `LinkTranslationRecord` | Add `source_version_at: string \| null`, `reviewed_by: string \| null` |
| `/src/lib/translation-service/translation-service.types.ts` | `TranslationJobRecord` | Verify `locked_by`, `locked_at` present |

### Files NOT to Modify

| File | Reason |
|------|--------|
| `/src/types/index.ts` | Translation types are internal to lib modules, not exported publicly |
| `/src/contexts/LocaleContext.tsx` | UI locale types are separate from database translation types |
| Database tables | Type updates only - no schema changes in this task |

---

## Type Definition Examples

### Complete Updated `item_translations` Type

```typescript
// REQ-227: Item translations table for L10N
// REQ-E05-004: Updated with source_version_at for staleness detection
item_translations: {
  Row: {
    id: string
    item_id: string
    language: string
    name: string
    description: string | null
    translation_status: string
    translated_at: string | null
    reviewed_by: string | null  // User who manually edited translation
    source_version_at: string | null  // Source item updated_at when translation was created
    created_at: string | null
    updated_at: string | null
  }
  Insert: {
    id?: string
    item_id: string
    language: string
    name: string
    description?: string | null
    translation_status?: string
    translated_at?: string | null
    reviewed_by?: string | null
    source_version_at?: string | null
    created_at?: string | null
    updated_at?: string | null
  }
  Update: {
    id?: string
    item_id?: string
    language?: string
    name?: string
    description?: string | null
    translation_status?: string
    translated_at?: string | null
    reviewed_by?: string | null
    source_version_at?: string | null
    created_at?: string | null
    updated_at?: string | null
  }
  Relationships: [
    {
      foreignKeyName: "item_translations_item_id_fkey"
      columns: ["item_id"]
      isOneToOne: false
      referencedRelation: "items"
      referencedColumns: ["id"]
    },
    {
      foreignKeyName: "item_translations_reviewed_by_fkey"
      columns: ["reviewed_by"]
      isOneToOne: false
      referencedRelation: "users"
      referencedColumns: ["id"]
    }
  ]
}
```

### Usage Example

```typescript
import { Database } from '@/lib/supabase';

type ItemTranslation = Database['public']['Tables']['item_translations']['Row'];

// TypeScript now knows about source_version_at
const checkStaleness = (
  translation: ItemTranslation,
  sourceUpdatedAt: string
): boolean => {
  if (!translation.source_version_at) {
    return false; // No version tracking, assume not stale
  }
  return new Date(translation.source_version_at) < new Date(sourceUpdatedAt);
};

// TypeScript provides autocomplete for reviewed_by
const isManuallyEdited = (translation: ItemTranslation): boolean => {
  return translation.translation_status === 'manual' && !!translation.reviewed_by;
};
```

---

## Acceptance Criteria Verification

| Criteria | Implementation | Status |
|----------|----------------|--------|
| Type definitions include complete translation_jobs table structure | Task 5 - Verify existing types | Pending |
| Type definitions include items_translation with source_version_at | Task 2 - Add to Row/Insert/Update | Pending |
| Type definitions include articles_translation with source_version_at | Task 3 - Add to Row/Insert/Update | Pending |
| Type definitions include links_translation with source_version_at | Task 4 - Add to Row/Insert/Update | Pending |
| Enum types defined for translation status values | Task 1 - Add TranslationStatusType | Pending |
| Enum types defined for entity types | Task 1 - Add TranslatableEntityType | Pending |
| All timestamp columns typed as string (Supabase format) | Existing - All timestamps are string | Verified |
| Type definitions match actual database schema | Tasks 2-4 - Add missing columns | Pending |
| Existing code compiles without new type errors | Task 7 - Run typecheck | Pending |
| Generated types include JSDoc comments | Tasks 1-4 - Add comments | Pending |

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking existing code that uses translation types | Low | Medium | All new fields are optional (null/undefined allowed) |
| Type inconsistency between supabase.ts and translation-service.types.ts | Medium | Low | Task 6 ensures both files are updated |
| Database schema not yet migrated (REQ-E05-003) | Medium | Low | Types can be added before columns; queries will just get null |
| Forgetting to update Insert/Update along with Row | Medium | Medium | Task checklist includes all three type variants |

---

## Effort Estimate

| Task | Estimate | Notes |
|------|----------|-------|
| Task 1: Add type aliases | 5 min | New types at top of file |
| Task 2: Update item_translations | 5 min | Add 2 columns to 3 type variants |
| Task 3: Update article_translations | 5 min | Add 1 column to 3 type variants |
| Task 4: Update link_translations | 5 min | Add 2 columns to 3 type variants |
| Task 5: Verify translation_jobs | 2 min | Inspection only |
| Task 6: Update translation-service.types.ts | 10 min | Update 4 record types |
| Task 7: Verify build | 3 min | Run typecheck and build |
| **Total** | **35 min** | |

---

## Dependencies on Other Tasks

### Must Be Completed Before This Task
| Task | Reason |
|------|--------|
| None | Types can be added before database columns exist |

### Should Be Completed Before This Task (Recommended)
| Task | Reason |
|------|--------|
| REQ-E05-003 (source_version_at migration) | Ensures types match actual schema |

### Must Be Completed After This Task
| Task | Reason |
|------|--------|
| Phase 2+ UI components | Will use these updated types |
| Translation API endpoints | Will use these types for request/response |

---

## References

- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- Epic 5 PRD: `/docs/prd/PRD_L10N_Epic5_Owner_Translation_Management.md`
- Request Document: `/docs/gen_requests_epic5.md` (REQ-E05-005)
- Related Task: `/docs/REQ-E05-003-add-sourceversionat-columns-via-migration-overview.md`
- Existing Type Definitions: `/src/lib/supabase.ts`
- Translation Service Types: `/src/lib/translation-service/translation-service.types.ts`
