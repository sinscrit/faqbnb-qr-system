# Detailed Task Breakdown: REQ-E05-004 - Update TypeScript Database Types

**Document Created:** 2026-01-19
**Last Modified:** 2026-01-19
**Request ID:** REQ-E05-004
**Epic:** Epic 5 - Owner Translation Management
**Phase:** 1 - API Endpoints
**Task ID:** 1.5
**Implementation Plan Reference:** Plan-111-L10N-Epic5-Owner-Translation-Management.md
**Overview Document:** REQ-E05-004-update-typescript-database-types-overview.md

---

## Executive Summary

This document provides detailed, step-by-step implementation tasks for updating TypeScript database type definitions to accurately reflect the translation table schema. The changes ensure type safety for `source_version_at` columns (added in REQ-E05-003), `reviewed_by` columns for manual edit tracking, and provide enum-like type aliases for improved developer experience.

**Total Effort Estimate:** 35 minutes
**Risk Level:** Low
**Dependencies:** None (types can be added before database columns exist)

---

## Task Breakdown

### Task 1: Add Translation Type Aliases to supabase.ts
**Effort:** 5 minutes | **Priority:** High | **Complexity:** XS

#### Objective
Add type aliases at the top of `/src/lib/supabase.ts` to provide type-safe constants for translation status values, entity types, language codes, and job status values.

#### Prerequisites
- Access to `/src/lib/supabase.ts`
- No external dependencies

#### Implementation Steps

**Step 1.1:** Open `/src/lib/supabase.ts` and locate the `Json` type definition (lines 4-10).

**Step 1.2:** Add the following type aliases immediately after the `Json` type definition (after line 10, before `export type Database = {`):

```typescript
/**
 * Translation status values for translation records.
 * @see translation_status column in *_translations tables
 * REQ-E05-004: Type alias for translation status values
 */
export type TranslationStatusType = 'pending' | 'processing' | 'completed' | 'failed' | 'manual';

/**
 * Entity types that can be translated.
 * @see entity_type column in translation_jobs table
 * REQ-E05-004: Type alias for translatable entity types
 */
export type TranslatableEntityType = 'article' | 'item' | 'link' | 'tag';

/**
 * Supported language codes (ISO 639-1).
 * @see language columns in *_translations tables
 * REQ-E05-004: Type alias for supported languages
 */
export type SupportedLanguageCode = 'en' | 'fr' | 'es' | 'de' | 'nl' | 'it';

/**
 * Translation job status values.
 * @see status column in translation_jobs table
 * REQ-E05-004: Type alias for job status values
 */
export type TranslationJobStatusType = 'queued' | 'processing' | 'completed' | 'failed';
```

#### Verification Steps
- [ ] Type aliases are placed after `Json` type and before `Database` type
- [ ] JSDoc comments include `@see` references to relevant columns
- [ ] All status values match database schema

#### File Changes
| File | Change Type | Lines Affected |
|------|-------------|----------------|
| `/src/lib/supabase.ts` | Addition | After line 10 (new lines ~11-35) |

---

### Task 2: Update item_translations Types
**Effort:** 5 minutes | **Priority:** High | **Complexity:** S

#### Objective
Add `source_version_at` and `reviewed_by` columns to the `item_translations` table type definition in all three variants (Row, Insert, Update) and add the `reviewed_by` foreign key relationship.

#### Prerequisites
- Task 1 completed (type aliases available)

#### Current State Analysis
Current `item_translations` type (lines 463-505 in supabase.ts):
- **Missing from Row:** `reviewed_by`, `source_version_at`
- **Missing from Insert:** `reviewed_by`, `source_version_at`
- **Missing from Update:** `reviewed_by`, `source_version_at`
- **Missing from Relationships:** `reviewed_by` FK

#### Implementation Steps

**Step 2.1:** Locate the `item_translations` table definition (starts at line 463).

**Step 2.2:** Update the `Row` type by adding the following properties after `translated_at`:

```typescript
Row: {
  id: string
  item_id: string
  language: string
  name: string
  description: string | null
  translation_status: string
  translated_at: string | null
  reviewed_by: string | null  // REQ-E05-004: User who manually edited translation
  source_version_at: string | null  // REQ-E05-004: Source item updated_at when translation was created
  created_at: string | null
  updated_at: string | null
}
```

**Step 2.3:** Update the `Insert` type by adding optional versions of the new properties:

```typescript
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
```

**Step 2.4:** Update the `Update` type by adding optional versions of the new properties:

```typescript
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
```

**Step 2.5:** Add the `reviewed_by` foreign key relationship:

```typescript
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
```

#### Verification Steps
- [ ] `source_version_at: string | null` added to Row
- [ ] `reviewed_by: string | null` added to Row
- [ ] Both properties added to Insert with `?` optional marker
- [ ] Both properties added to Update with `?` optional marker
- [ ] `reviewed_by` FK relationship added to Relationships array
- [ ] Comments include `// REQ-E05-004` references

#### File Changes
| File | Change Type | Lines Affected |
|------|-------------|----------------|
| `/src/lib/supabase.ts` | Modification | Lines 463-506 (item_translations section) |

---

### Task 3: Update article_translations Types
**Effort:** 5 minutes | **Priority:** High | **Complexity:** S

#### Objective
Add `source_version_at` column to the `article_translations` table type definition. Note: `reviewed_by` already exists in this table type.

#### Current State Analysis
Current `article_translations` type (lines 361-414 in supabase.ts):
- **Missing from Row:** `source_version_at`
- **Missing from Insert:** `source_version_at`
- **Missing from Update:** `source_version_at`
- `reviewed_by` is **already present** (line 370)

#### Implementation Steps

**Step 3.1:** Locate the `article_translations` table definition (starts at line 361).

**Step 3.2:** Update the `Row` type by adding `source_version_at` after `reviewed_by`:

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
  source_version_at: string | null  // REQ-E05-004: Source article updated_at when translation was created
  created_at: string | null
  updated_at: string | null
}
```

**Step 3.3:** Update the `Insert` type:

```typescript
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
```

**Step 3.4:** Update the `Update` type:

```typescript
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
```

#### Verification Steps
- [ ] `source_version_at: string | null` added to Row after `reviewed_by`
- [ ] `source_version_at` added to Insert with `?` optional marker
- [ ] `source_version_at` added to Update with `?` optional marker
- [ ] `reviewed_by` not duplicated (already exists)
- [ ] Comments include `// REQ-E05-004` reference

#### File Changes
| File | Change Type | Lines Affected |
|------|-------------|----------------|
| `/src/lib/supabase.ts` | Modification | Lines 361-414 (article_translations section) |

---

### Task 4: Update link_translations Types
**Effort:** 5 minutes | **Priority:** High | **Complexity:** S

#### Objective
Add `source_version_at` and `reviewed_by` columns to the `link_translations` table type definition and add the `reviewed_by` foreign key relationship.

#### Current State Analysis
Current `link_translations` type (lines 274-314 in supabase.ts):
- **Missing from Row:** `reviewed_by`, `source_version_at`
- **Missing from Insert:** `reviewed_by`, `source_version_at`
- **Missing from Update:** `reviewed_by`, `source_version_at`
- **Missing from Relationships:** `reviewed_by` FK

#### Implementation Steps

**Step 4.1:** Locate the `link_translations` table definition (starts at line 274).

**Step 4.2:** Update the `Row` type:

```typescript
Row: {
  id: string
  link_id: string
  language: string
  title: string
  translation_status: string
  translated_at: string | null
  reviewed_by: string | null  // REQ-E05-004: User who manually edited translation
  source_version_at: string | null  // REQ-E05-004: Source link updated_at when translation was created
  created_at: string | null
  updated_at: string | null
}
```

**Step 4.3:** Update the `Insert` type:

```typescript
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
```

**Step 4.4:** Update the `Update` type:

```typescript
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
```

**Step 4.5:** Add the `reviewed_by` foreign key relationship:

```typescript
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
```

#### Verification Steps
- [ ] `source_version_at: string | null` added to Row
- [ ] `reviewed_by: string | null` added to Row
- [ ] Both properties added to Insert with `?` optional marker
- [ ] Both properties added to Update with `?` optional marker
- [ ] `reviewed_by` FK relationship added to Relationships array
- [ ] Comments include `// REQ-E05-004` references

#### File Changes
| File | Change Type | Lines Affected |
|------|-------------|----------------|
| `/src/lib/supabase.ts` | Modification | Lines 274-314 (link_translations section) |

---

### Task 5: Verify translation_jobs Types Are Complete
**Effort:** 2 minutes | **Priority:** Medium | **Complexity:** XS

#### Objective
Verify that the `translation_jobs` table type definition includes all required columns, particularly `locked_by` and `locked_at` from REQ-243.

#### Current State Analysis
Current `translation_jobs` type (lines 637-684 in supabase.ts):
- `locked_by: string | null` - **Present** (line 650)
- `locked_at: string | null` - **Present** (line 651)

#### Implementation Steps

**Step 5.1:** Confirm the `translation_jobs` type at lines 637-684 contains:
- `locked_by: string | null` in Row
- `locked_at: string | null` in Row
- Both in Insert (optional)
- Both in Update (optional)

**Step 5.2:** If any are missing, add them following the same pattern as Tasks 2-4.

#### Verification Steps
- [ ] `locked_by` present in Row, Insert, Update
- [ ] `locked_at` present in Row, Insert, Update
- [ ] Comments reference REQ-243

#### Expected Result
No changes required - current implementation already includes these columns.

---

### Task 6: Update Translation Service Types for Consistency
**Effort:** 10 minutes | **Priority:** Medium | **Complexity:** S

#### Objective
Update the database record types in `/src/lib/translation-service/translation-service.types.ts` to include `source_version_at` and `reviewed_by` columns for consistency with the Supabase types.

#### Current State Analysis
Current types (lines 394-467 in translation-service.types.ts):

**ArticleTranslationRecord (lines 394-405):**
- Has `reviewed_by: string | null`
- **Missing:** `source_version_at`

**ItemTranslationRecord (lines 410-421):**
- **Missing:** `reviewed_by`
- **Missing:** `source_version_at`

**LinkTranslationRecord (lines 426-436):**
- **Missing:** `reviewed_by`
- **Missing:** `source_version_at`

**TranslationJobRecord (lines 455-467):**
- **Missing:** `locked_by`, `locked_at`

#### Implementation Steps

**Step 6.1:** Open `/src/lib/translation-service/translation-service.types.ts`

**Step 6.2:** Update `ArticleTranslationRecord` (after `reviewed_by` line 402):

```typescript
export interface ArticleTranslationRecord {
  id: string;
  article_id: string;
  language: SupportedLanguage;
  title: string;
  description: string | null;
  translation_status: TranslationStatus;
  translated_at: string | null;
  reviewed_by: string | null;
  source_version_at: string | null;  // REQ-E05-004: Source content version for staleness detection
  created_at: string;
  updated_at: string;
}
```

**Step 6.3:** Update `ItemTranslationRecord` (add `reviewed_by` and `source_version_at` after `translated_at`):

```typescript
export interface ItemTranslationRecord {
  id: string;
  item_id: string;
  language: SupportedLanguage;
  name: string;
  description: string | null;
  translation_status: TranslationStatus;
  translated_at: string | null;
  reviewed_by: string | null;  // REQ-E05-004: User who manually edited translation
  source_version_at: string | null;  // REQ-E05-004: Source content version for staleness detection
  created_at: string;
  updated_at: string;
}
```

**Step 6.4:** Update `LinkTranslationRecord` (add `reviewed_by` and `source_version_at` after `translated_at`):

```typescript
export interface LinkTranslationRecord {
  id: string;
  link_id: string;
  language: SupportedLanguage;
  title: string;
  translation_status: TranslationStatus;
  translated_at: string | null;
  reviewed_by: string | null;  // REQ-E05-004: User who manually edited translation
  source_version_at: string | null;  // REQ-E05-004: Source content version for staleness detection
  created_at: string;
  updated_at: string;
}
```

**Step 6.5:** Update `TranslationJobRecord` (add `locked_by` and `locked_at` after `completed_at`):

```typescript
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
  locked_by: string | null;  // REQ-243: Job locking support
  locked_at: string | null;  // REQ-243: Job locking support
}
```

#### Verification Steps
- [ ] `ArticleTranslationRecord` has `source_version_at`
- [ ] `ItemTranslationRecord` has `reviewed_by` and `source_version_at`
- [ ] `LinkTranslationRecord` has `reviewed_by` and `source_version_at`
- [ ] `TranslationJobRecord` has `locked_by` and `locked_at`
- [ ] All comments reference appropriate REQ numbers

#### File Changes
| File | Change Type | Lines Affected |
|------|-------------|----------------|
| `/src/lib/translation-service/translation-service.types.ts` | Modification | Lines 394-467 (database record types section) |

---

### Task 7: Verify Build and Type Compilation
**Effort:** 3 minutes | **Priority:** Critical | **Complexity:** XS

#### Objective
Verify that all TypeScript changes compile without errors and the project builds successfully.

#### Prerequisites
- All previous tasks completed

#### Implementation Steps

**Step 7.1:** Run TypeScript type checking:

```bash
npm run typecheck
# or if not available:
npx tsc --noEmit
```

**Step 7.2:** If type errors occur, fix them based on error messages:
- Missing property: Add the property
- Type mismatch: Correct the type
- Duplicate property: Remove duplicate

**Step 7.3:** Run the build to verify everything compiles:

```bash
npm run build
```

**Step 7.4:** If build errors occur, address them before marking task complete.

#### Verification Steps
- [ ] `npm run typecheck` (or `npx tsc --noEmit`) exits with code 0
- [ ] `npm run build` completes successfully
- [ ] No new type errors introduced

#### Expected Output
```
✓ Type checking complete - no errors
✓ Build successful
```

---

## Complete File Change Summary

### Primary Files Modified

| File | Tasks | Changes Summary |
|------|-------|-----------------|
| `/src/lib/supabase.ts` | 1, 2, 3, 4, 5 | Add type aliases; update item_translations, article_translations, link_translations with new columns and relationships |

### Secondary Files Modified

| File | Tasks | Changes Summary |
|------|-------|-----------------|
| `/src/lib/translation-service/translation-service.types.ts` | 6 | Add `source_version_at`, `reviewed_by`, `locked_by`, `locked_at` to record types |

### Files NOT Modified (Explicitly Excluded)

| File | Reason |
|------|--------|
| `/src/types/index.ts` | Translation types are internal to lib modules |
| `/src/contexts/LocaleContext.tsx` | UI locale types separate from database types |
| Database tables | Type updates only - no schema changes |

---

## Acceptance Criteria Checklist

| Criteria (from REQ-E05-005) | Implementation | Task |
|-----------------------------|----------------|------|
| Type definitions include complete translation_jobs table structure | Verify locked_by/locked_at present | Task 5 |
| Type definitions include items_translation with source_version_at | Add to Row/Insert/Update | Task 2 |
| Type definitions include articles_translation with source_version_at | Add to Row/Insert/Update | Task 3 |
| Type definitions include links_translation with source_version_at | Add to Row/Insert/Update | Task 4 |
| Enum types defined for translation status values | Add TranslationStatusType | Task 1 |
| Enum types defined for entity types | Add TranslatableEntityType | Task 1 |
| All timestamp columns typed as string | Already correct (Supabase format) | N/A |
| Type definitions match actual database schema | Add missing columns | Tasks 2-4, 6 |
| Existing code compiles without new type errors | Run typecheck and build | Task 7 |
| Generated types include JSDoc comments | Add comments with @see | Tasks 1-4, 6 |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking existing code using translation types | Low | Medium | All new fields are optional (`| null`) |
| Type inconsistency between supabase.ts and translation-service.types.ts | Medium | Low | Task 6 ensures both files updated |
| Database schema not yet migrated (REQ-E05-003) | Medium | Low | Types can be added before columns; queries return null |
| Forgetting to update Insert/Update along with Row | Medium | Medium | Each task checklist covers all three variants |

---

## Post-Implementation Verification

After completing all tasks, verify:

1. **Type Safety Test** - Create a test file with:
```typescript
import { Database } from '@/lib/supabase';

type ItemTranslation = Database['public']['Tables']['item_translations']['Row'];

// TypeScript should recognize these properties
const test: ItemTranslation = {
  id: '1',
  item_id: '2',
  language: 'en',
  name: 'Test',
  description: null,
  translation_status: 'completed',
  translated_at: null,
  reviewed_by: null,  // Should compile
  source_version_at: null,  // Should compile
  created_at: null,
  updated_at: null
};
```

2. **IDE IntelliSense** - Open any translation-related file and verify autocomplete shows the new properties.

3. **No Runtime Changes** - This is a types-only change with no runtime impact.

---

## References

- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- **PRD:** `/docs/prd/PRD_L10N_Epic5_Owner_Translation_Management.md`
- **Request Document:** `/docs/gen_requests_epic5.md` (REQ-E05-005)
- **Overview Document:** `/docs/REQ-E05-004-update-typescript-database-types-overview.md`
- **Related Migration Task:** `/docs/REQ-E05-003-add-sourceversionat-columns-via-migration-detailed.md`
- **Supabase Types File:** `/src/lib/supabase.ts`
- **Translation Service Types:** `/src/lib/translation-service/translation-service.types.ts`

---

*Document generated for FAQBNB L10N Epic 5 - Owner Translation Management*
*Task: REQ-E05-004 - Update TypeScript Database Types*
