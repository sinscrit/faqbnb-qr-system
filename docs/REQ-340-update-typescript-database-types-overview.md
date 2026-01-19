# REQ-340: Update TypeScript Database Types for Owner Management Translation Features

**Created:** 2026-01-19 14:30:00 UTC
**Last Modified:** 2026-01-19 14:30:00 UTC
**Request Source:** docs/gen_requests_epic5.md - Request #340
**Implementation Plan:** docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md
**Phase:** 1 - API Endpoints
**Task ID:** 1.5
**Size:** S (Small)
**Priority:** P2 - Medium

---

## Overview

This task updates the TypeScript database types in `/src/lib/supabase.ts` to include all translation infrastructure columns needed for Epic 5 Owner Translation Management features. While Epic 1 established the base translation tables (article_translations, item_translations, link_translations, tag_translations, translation_jobs), Epic 5 requires additional columns for source version tracking, manual edit tracking, and comprehensive type safety for owner-facing translation management components.

---

## Current State Analysis

### Existing Types in `/src/lib/supabase.ts`

The current database types file already includes:

1. **Translation Tables (from Epic 1/REQ-227):**
   - `article_translations` - includes `reviewed_by`, `translation_status`, `translated_at`
   - `item_translations` - includes `translation_status`, `translated_at`
   - `link_translations` - includes `translation_status`, `translated_at`
   - `tag_translations` - for system tag translations
   - `translation_jobs` - with `locked_by`, `locked_at` for job queue management

2. **Language Preference Columns (from REQ-225):**
   - `accounts.preferred_language` - Account default language preference
   - `users.preferred_language` - User language preference

3. **Source Language Columns (from REQ-224):**
   - `items.source_language` - Track original language for translation
   - `item_articles.source_language` - Track original language for translation
   - `item_links.source_language` - Track original language for translation

### Missing for Epic 5

Based on REQ-339 (Add Source Version Tracking Columns via Migration) and the implementation plan, the following columns need to be added to type definitions:

1. **`source_version_at` columns** - To track when source content was last modified for stale translation detection
   - `article_translations.source_version_at`
   - `item_translations.source_version_at`
   - `link_translations.source_version_at`
   - `tag_translations.source_version_at` (if applicable)

2. **`reviewed_by` columns** - For tracking manual edit reviewers (partially exists)
   - `item_translations.reviewed_by` - Currently missing
   - `link_translations.reviewed_by` - Currently missing

---

## Dependencies

### Required Prior Completions

| Dependency | Status | Notes |
|------------|--------|-------|
| REQ-339: Add Source Version Tracking Columns | Must be applied first | Migration adds the database columns |
| Epic 1 Foundation Types | Complete | Base translation table types exist |
| REQ-224: Source Language Columns | Complete | Already in types |
| REQ-225: Language Preference Columns | Complete | Already in types |

### Blocked Tasks

The following Epic 5 tasks depend on these type updates:
- REQ-309: TranslationManagement Component Type Definitions
- REQ-314: useTranslationStatus Hook
- REQ-315: useTranslationRealtime Hook
- All API endpoint tasks (REQ-336, REQ-337, REQ-338)

---

## Implementation Approach

### Strategy

Update the existing type definitions in `/src/lib/supabase.ts` to add the missing columns to the relevant translation table types. This follows the established pattern already used for translation tables.

### Type Definition Changes Required

#### 1. article_translations (Partially Complete)

Already has `reviewed_by`, needs `source_version_at`:

```typescript
article_translations: {
  Row: {
    // ... existing fields
    source_version_at: string | null  // NEW: Track source content version
  }
  Insert: {
    // ... existing fields
    source_version_at?: string | null  // NEW
  }
  Update: {
    // ... existing fields
    source_version_at?: string | null  // NEW
  }
}
```

#### 2. item_translations

Needs both `reviewed_by` and `source_version_at`:

```typescript
item_translations: {
  Row: {
    // ... existing fields
    reviewed_by: string | null        // NEW: Manual edit reviewer
    source_version_at: string | null  // NEW: Track source content version
  }
  Insert: {
    // ... existing fields
    reviewed_by?: string | null       // NEW
    source_version_at?: string | null // NEW
  }
  Update: {
    // ... existing fields
    reviewed_by?: string | null       // NEW
    source_version_at?: string | null // NEW
  }
}
```

#### 3. link_translations

Needs both `reviewed_by` and `source_version_at`:

```typescript
link_translations: {
  Row: {
    // ... existing fields
    reviewed_by: string | null        // NEW: Manual edit reviewer
    source_version_at: string | null  // NEW: Track source content version
  }
  Insert: {
    // ... existing fields
    reviewed_by?: string | null       // NEW
    source_version_at?: string | null // NEW
  }
  Update: {
    // ... existing fields
    reviewed_by?: string | null       // NEW
    source_version_at?: string | null // NEW
  }
}
```

#### 4. tag_translations (If applicable)

May need `source_version_at` for completeness:

```typescript
tag_translations: {
  Row: {
    // ... existing fields
    source_version_at: string | null  // NEW: Track source content version (if applicable)
  }
  // Insert and Update as above
}
```

---

## Authorized Files and Functions for Modification

### Files to Modify

| File | Changes | Rationale |
|------|---------|-----------|
| `/src/lib/supabase.ts` | Add `source_version_at` and `reviewed_by` columns to translation table type definitions | Primary target for type updates |

### Specific Modifications

#### `/src/lib/supabase.ts`

**Section: `article_translations` (lines ~361-414)**
- Add `source_version_at: string | null` to Row type
- Add `source_version_at?: string | null` to Insert type
- Add `source_version_at?: string | null` to Update type

**Section: `item_translations` (lines ~463-506)**
- Add `reviewed_by: string | null` to Row type
- Add `source_version_at: string | null` to Row type
- Add `reviewed_by?: string | null` to Insert type
- Add `source_version_at?: string | null` to Insert type
- Add `reviewed_by?: string | null` to Update type
- Add `source_version_at?: string | null` to Update type
- Add Relationships for reviewed_by FK (optional, matches article_translations pattern)

**Section: `link_translations` (lines ~274-314)**
- Add `reviewed_by: string | null` to Row type
- Add `source_version_at: string | null` to Row type
- Add `reviewed_by?: string | null` to Insert type
- Add `source_version_at?: string | null` to Insert type
- Add `reviewed_by?: string | null` to Update type
- Add `source_version_at?: string | null` to Update type
- Add Relationships for reviewed_by FK (optional)

**Section: `tag_translations` (lines ~607-634)**
- Consider adding `source_version_at: string | null` for completeness

---

## Implementation Tasks

### Task 1: Update article_translations Type Definition
**Estimated Effort:** 5 minutes
**Files:** `/src/lib/supabase.ts`

Add `source_version_at` column to all three variants (Row, Insert, Update) of the article_translations type definition.

### Task 2: Update item_translations Type Definition
**Estimated Effort:** 10 minutes
**Files:** `/src/lib/supabase.ts`

Add `reviewed_by` and `source_version_at` columns to all three variants of the item_translations type definition. Optionally add Relationships entry for reviewed_by FK.

### Task 3: Update link_translations Type Definition
**Estimated Effort:** 10 minutes
**Files:** `/src/lib/supabase.ts`

Add `reviewed_by` and `source_version_at` columns to all three variants of the link_translations type definition. Optionally add Relationships entry for reviewed_by FK.

### Task 4: Update tag_translations Type Definition (Optional)
**Estimated Effort:** 5 minutes
**Files:** `/src/lib/supabase.ts`

Add `source_version_at` column if system tag translations should support stale detection.

### Task 5: Verify TypeScript Compilation
**Estimated Effort:** 5 minutes
**Command:** `npm run build` or `npx tsc --noEmit`

Ensure all type changes compile successfully and don't break existing code references.

---

## Validation Criteria

### Type Safety Verification

1. TypeScript compiler validates the updated types without errors
2. Autocomplete suggestions appear correctly for new columns in IDE
3. Existing code using translation tables continues to work

### Integration Verification

1. Components can access `source_version_at` for stale translation detection
2. Components can access `reviewed_by` for manual edit tracking
3. useTranslationStatus hook can reference new fields without TypeScript errors

---

## Acceptance Criteria

Based on REQ-340 from gen_requests_epic5.md:

- [ ] Type definitions include all translation table structures (existing - verify)
- [ ] Type definitions include `source_version_at` columns for all translation tables
- [ ] Type definitions include `reviewed_by` columns for tracking manual edits
- [ ] Type definitions include `translation_status` fields with appropriate type constraints (existing - verify)
- [ ] Type definitions include all translation job queue columns including locking fields (existing - verify)
- [ ] Type definitions include `preferred_language` columns for users and accounts (existing - verify)
- [ ] Type definitions include `source_language` columns for content entities (existing - verify)
- [ ] TypeScript compiler validates code using updated types without errors
- [ ] Autocomplete suggestions appear correctly when accessing translation fields in development
- [ ] All Row, Insert, and Update type variants are properly defined for affected tables
- [ ] Relationships are correctly typed for foreign key references in translation tables

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Database migration not yet applied | Medium | High | Verify REQ-339 is complete before implementation |
| Breaking existing type references | Low | Medium | Types use optional fields, maintain backward compatibility |
| Missing columns in migration | Low | High | Cross-reference with REQ-339 implementation |

---

## Related Documentation

- [Epic 5 Implementation Plan](./prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md)
- [REQ-339: Add Source Version Tracking Columns](./REQ-339-add-sourceversionat-columns-via-migration-overview.md)
- [Epic 1 Foundation Types](./prd/Plan-110-L10N-Epic1-Foundation.md)
- [Gen Requests Epic 5](./gen_requests_epic5.md)

---

## Notes

- This is a small, focused task that prepares the TypeScript type system for Epic 5 features
- The actual database columns must be created via migration (REQ-339) before these types are meaningful
- Maintaining the established patterns from Epic 1 ensures consistency across the codebase
- Consider generating types automatically from Supabase schema in future iterations

---

*Document generated for FAQBNB Localization Epic 5 - Owner Translation Management*
