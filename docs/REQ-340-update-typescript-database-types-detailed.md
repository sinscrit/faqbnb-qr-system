# REQ-340: Update TypeScript Database Types - Detailed Task Breakdown

**Created:** 2026-01-19 15:45:00 UTC
**Last Modified:** 2026-01-19 15:45:00 UTC
**Request Source:** docs/gen_requests_epic5.md - Request #340
**Overview Document:** docs/REQ-340-update-typescript-database-types-overview.md
**Implementation Plan:** docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md
**Phase:** 1 - API Endpoints
**Task ID:** 1.5
**Size:** S (Small)
**Priority:** P2 - Medium

---

## Executive Summary

This document provides a granular, step-by-step breakdown for updating the TypeScript database types in `/src/lib/supabase.ts` to support Epic 5 Owner Translation Management features. The task adds `source_version_at` and `reviewed_by` columns to translation table type definitions, enabling proper type safety for stale translation detection and manual edit tracking.

---

## Prerequisites

### Required Prior Completions

| Task | Status | Verification Method |
|------|--------|---------------------|
| REQ-339: Add Source Version Tracking Columns via Migration | Must be complete | Check `supabase/migrations/` for source_version_at migration file |
| Epic 1 Foundation Types (REQ-227) | Complete | Translation tables exist in `/src/lib/supabase.ts` |
| REQ-224: Source Language Columns | Complete | Verify `source_language` in `items`, `item_articles`, `item_links` |
| REQ-225: Language Preference Columns | Complete | Verify `preferred_language` in `users` and `accounts` |

### Pre-Implementation Verification

Before starting, verify the database migration has been applied:

```bash
# Check that source_version_at columns exist in the database
# This can be done via Supabase MCP or direct database query
```

---

## Current State Analysis

### Existing Translation Tables in `/src/lib/supabase.ts`

After reviewing the current file (lines 1-727), the following translation tables exist:

| Table | Location | Has `reviewed_by` | Has `source_version_at` |
|-------|----------|-------------------|-------------------------|
| `article_translations` | Lines 361-414 | Yes (line 370) | **NO - Needs Adding** |
| `item_translations` | Lines 463-506 | **NO - Needs Adding** | **NO - Needs Adding** |
| `link_translations` | Lines 274-314 | **NO - Needs Adding** | **NO - Needs Adding** |
| `tag_translations` | Lines 607-634 | No (not applicable) | **OPTIONAL** |
| `translation_jobs` | Lines 637-684 | Has `locked_by`, `locked_at` | Not applicable |

### Summary of Required Changes

1. **article_translations**: Add `source_version_at` to Row/Insert/Update
2. **item_translations**: Add `reviewed_by` and `source_version_at` to Row/Insert/Update
3. **link_translations**: Add `reviewed_by` and `source_version_at` to Row/Insert/Update
4. **tag_translations**: Optionally add `source_version_at` for completeness

---

## Detailed Task Breakdown

### Task 1: Update article_translations Type Definition

**File:** `/src/lib/supabase.ts`
**Lines:** 361-414
**Estimated Effort:** 5 minutes
**Story Points:** 0.5

#### 1.1 Add source_version_at to Row type

**Location:** Inside `article_translations.Row` (after line 372)

**Current Code (lines 362-373):**
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
    created_at: string | null
    updated_at: string | null
  }
```

**Change to Apply:**
Add the following line after `updated_at: string | null` (line 372):
```typescript
    source_version_at: string | null  // REQ-340: Track source content version for stale detection
```

#### 1.2 Add source_version_at to Insert type

**Location:** Inside `article_translations.Insert` (after line 385)

**Add after `updated_at?: string | null`:**
```typescript
    source_version_at?: string | null  // REQ-340: Track source content version for stale detection
```

#### 1.3 Add source_version_at to Update type

**Location:** Inside `article_translations.Update` (after line 397)

**Add after `updated_at?: string | null`:**
```typescript
    source_version_at?: string | null  // REQ-340: Track source content version for stale detection
```

#### 1.4 Verification

After changes, the `article_translations` type should include:
- [x] `reviewed_by` in Row/Insert/Update (already exists)
- [x] `source_version_at` in Row/Insert/Update (newly added)

---

### Task 2: Update item_translations Type Definition

**File:** `/src/lib/supabase.ts`
**Lines:** 462-506
**Estimated Effort:** 10 minutes
**Story Points:** 1

#### 2.1 Add reviewed_by and source_version_at to Row type

**Location:** Inside `item_translations.Row` (after line 472)

**Current Code (lines 463-474):**
```typescript
item_translations: {
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

**Change to Apply:**
Add the following lines after `updated_at: string | null` (line 473):
```typescript
    reviewed_by: string | null  // REQ-340: Track manual edit reviewer
    source_version_at: string | null  // REQ-340: Track source content version for stale detection
```

#### 2.2 Add reviewed_by and source_version_at to Insert type

**Location:** Inside `item_translations.Insert` (after line 485)

**Add after `updated_at?: string | null`:**
```typescript
    reviewed_by?: string | null  // REQ-340: Track manual edit reviewer
    source_version_at?: string | null  // REQ-340: Track source content version for stale detection
```

#### 2.3 Add reviewed_by and source_version_at to Update type

**Location:** Inside `item_translations.Update` (after line 495)

**Add after `updated_at?: string | null`:**
```typescript
    reviewed_by?: string | null  // REQ-340: Track manual edit reviewer
    source_version_at?: string | null  // REQ-340: Track source content version for stale detection
```

#### 2.4 Add Relationship for reviewed_by FK (Optional)

**Location:** Inside `item_translations.Relationships` array (after line 504)

**Add to Relationships array:**
```typescript
      ,
      {
        foreignKeyName: "item_translations_reviewed_by_fkey"
        columns: ["reviewed_by"]
        isOneToOne: false
        referencedRelation: "users"
        referencedColumns: ["id"]
      }
```

#### 2.5 Verification

After changes, the `item_translations` type should include:
- [x] `reviewed_by` in Row/Insert/Update (newly added)
- [x] `source_version_at` in Row/Insert/Update (newly added)
- [x] Relationship entry for `reviewed_by` FK (optional, newly added)

---

### Task 3: Update link_translations Type Definition

**File:** `/src/lib/supabase.ts`
**Lines:** 273-314
**Estimated Effort:** 10 minutes
**Story Points:** 1

#### 3.1 Add reviewed_by and source_version_at to Row type

**Location:** Inside `link_translations.Row` (after line 283)

**Current Code (lines 274-285):**
```typescript
link_translations: {
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

**Change to Apply:**
Add the following lines after `updated_at: string | null` (line 283):
```typescript
    reviewed_by: string | null  // REQ-340: Track manual edit reviewer
    source_version_at: string | null  // REQ-340: Track source content version for stale detection
```

#### 3.2 Add reviewed_by and source_version_at to Insert type

**Location:** Inside `link_translations.Insert` (after line 295)

**Add after `updated_at?: string | null`:**
```typescript
    reviewed_by?: string | null  // REQ-340: Track manual edit reviewer
    source_version_at?: string | null  // REQ-340: Track source content version for stale detection
```

#### 3.3 Add reviewed_by and source_version_at to Update type

**Location:** Inside `link_translations.Update` (after line 304)

**Add after `updated_at?: string | null`:**
```typescript
    reviewed_by?: string | null  // REQ-340: Track manual edit reviewer
    source_version_at?: string | null  // REQ-340: Track source content version for stale detection
```

#### 3.4 Add Relationship for reviewed_by FK (Optional)

**Location:** Inside `link_translations.Relationships` array (after line 312)

**Add to Relationships array:**
```typescript
      ,
      {
        foreignKeyName: "link_translations_reviewed_by_fkey"
        columns: ["reviewed_by"]
        isOneToOne: false
        referencedRelation: "users"
        referencedColumns: ["id"]
      }
```

#### 3.5 Verification

After changes, the `link_translations` type should include:
- [x] `reviewed_by` in Row/Insert/Update (newly added)
- [x] `source_version_at` in Row/Insert/Update (newly added)
- [x] Relationship entry for `reviewed_by` FK (optional, newly added)

---

### Task 4: Update tag_translations Type Definition (Optional)

**File:** `/src/lib/supabase.ts`
**Lines:** 607-634
**Estimated Effort:** 5 minutes
**Story Points:** 0.5
**Priority:** Low (Optional for completeness)

#### 4.1 Add source_version_at to Row type

**Location:** Inside `tag_translations.Row` (after line 615)

**Current Code (lines 608-617):**
```typescript
tag_translations: {
  Row: {
    id: string
    tag_key: string
    language: string
    translated_value: string
    is_system_tag: boolean | null
    created_at: string | null
  }
```

**Change to Apply:**
Add the following line after `created_at: string | null` (line 615):
```typescript
    source_version_at: string | null  // REQ-340: Track source content version for stale detection (optional)
```

#### 4.2 Add source_version_at to Insert type

**Location:** Inside `tag_translations.Insert` (after line 624)

**Add after `created_at?: string | null`:**
```typescript
    source_version_at?: string | null  // REQ-340: Track source content version for stale detection (optional)
```

#### 4.3 Add source_version_at to Update type

**Location:** Inside `tag_translations.Update` (after line 632)

**Add after `created_at?: string | null`:**
```typescript
    source_version_at?: string | null  // REQ-340: Track source content version for stale detection (optional)
```

#### 4.4 Decision Note

This task is **optional** because system tag translations are typically managed by administrators and may not require the same stale detection workflow as user-generated content translations. Include if:
- The database migration (REQ-339) adds `source_version_at` to `tag_translations`
- Consistency across all translation tables is desired

Skip if:
- System tags are rarely updated and stale detection is unnecessary
- The database migration does not include this table

---

### Task 5: Verify TypeScript Compilation

**Estimated Effort:** 5 minutes
**Story Points:** 0.5

#### 5.1 Run TypeScript Compiler

Execute the following command to verify all changes compile correctly:

```bash
npx tsc --noEmit
```

**Expected Result:** No errors related to supabase.ts or translation table types

#### 5.2 Run Build Process

Execute the full build to ensure no runtime issues:

```bash
npm run build
```

**Expected Result:** Build completes successfully with no type errors

#### 5.3 Verify IDE Autocomplete

Open the following files and verify autocomplete suggestions include the new fields:

1. Any file using `article_translations` - should suggest `source_version_at`
2. Any file using `item_translations` - should suggest `reviewed_by` and `source_version_at`
3. Any file using `link_translations` - should suggest `reviewed_by` and `source_version_at`

#### 5.4 Test Existing Code Compatibility

Verify that existing code using translation tables continues to work:

```bash
# Run any existing tests that use translation types
npm test -- --grep "translation"
```

**Expected Result:** All existing tests pass without modification

---

## Implementation Checklist

### Pre-Implementation
- [ ] Verify REQ-339 migration has been applied (source_version_at columns exist in database)
- [ ] Read current `/src/lib/supabase.ts` file
- [ ] Confirm line numbers match expectations (file may have changed)

### Task 1: article_translations
- [ ] Add `source_version_at: string | null` to Row type
- [ ] Add `source_version_at?: string | null` to Insert type
- [ ] Add `source_version_at?: string | null` to Update type

### Task 2: item_translations
- [ ] Add `reviewed_by: string | null` to Row type
- [ ] Add `source_version_at: string | null` to Row type
- [ ] Add `reviewed_by?: string | null` to Insert type
- [ ] Add `source_version_at?: string | null` to Insert type
- [ ] Add `reviewed_by?: string | null` to Update type
- [ ] Add `source_version_at?: string | null` to Update type
- [ ] Add Relationships entry for `reviewed_by` FK (optional)

### Task 3: link_translations
- [ ] Add `reviewed_by: string | null` to Row type
- [ ] Add `source_version_at: string | null` to Row type
- [ ] Add `reviewed_by?: string | null` to Insert type
- [ ] Add `source_version_at?: string | null` to Insert type
- [ ] Add `reviewed_by?: string | null` to Update type
- [ ] Add `source_version_at?: string | null` to Update type
- [ ] Add Relationships entry for `reviewed_by` FK (optional)

### Task 4: tag_translations (Optional)
- [ ] Add `source_version_at: string | null` to Row type
- [ ] Add `source_version_at?: string | null` to Insert type
- [ ] Add `source_version_at?: string | null` to Update type

### Task 5: Verification
- [ ] Run `npx tsc --noEmit` - no errors
- [ ] Run `npm run build` - successful build
- [ ] Verify IDE autocomplete shows new fields
- [ ] Verify existing tests pass

### Post-Implementation
- [ ] Update document timestamp
- [ ] Commit changes with appropriate message

---

## Acceptance Criteria Verification

Based on REQ-340 from gen_requests_epic5.md:

| Criteria | Implementation Task | Verification |
|----------|---------------------|--------------|
| Type definitions include all translation table structures | Existing | Verify `article_translations`, `item_translations`, `link_translations`, `tag_translations`, `translation_jobs` present |
| Type definitions include `source_version_at` columns | Tasks 1, 2, 3, 4 | grep for `source_version_at` in supabase.ts |
| Type definitions include `reviewed_by` columns for tracking manual edits | Tasks 1 (existing), 2, 3 | grep for `reviewed_by` in translation tables |
| Type definitions include `translation_status` fields | Existing | All translation tables have `translation_status: string` |
| Type definitions include all translation job queue columns including locking fields | Existing | `translation_jobs` has `locked_by`, `locked_at` |
| Type definitions include `preferred_language` columns for users and accounts | Existing | `users.preferred_language`, `accounts.preferred_language` |
| Type definitions include `source_language` columns for content entities | Existing | `items`, `item_articles`, `item_links` have `source_language` |
| TypeScript compiler validates code without errors | Task 5.1, 5.2 | `npx tsc --noEmit` passes |
| Autocomplete suggestions appear correctly | Task 5.3 | Manual IDE verification |
| All Row, Insert, and Update type variants properly defined | Tasks 1-4 | Each field added to all three variants |
| Relationships correctly typed for FK references | Tasks 2.4, 3.4 | Optional FK relationships added |

---

## Code Snippets for Copy-Paste

### For article_translations (Task 1)

```typescript
// Add to Row (after updated_at):
    source_version_at: string | null  // REQ-340: Track source content version for stale detection

// Add to Insert (after updated_at):
    source_version_at?: string | null  // REQ-340: Track source content version for stale detection

// Add to Update (after updated_at):
    source_version_at?: string | null  // REQ-340: Track source content version for stale detection
```

### For item_translations (Task 2)

```typescript
// Add to Row (after updated_at):
    reviewed_by: string | null  // REQ-340: Track manual edit reviewer
    source_version_at: string | null  // REQ-340: Track source content version for stale detection

// Add to Insert (after updated_at):
    reviewed_by?: string | null  // REQ-340: Track manual edit reviewer
    source_version_at?: string | null  // REQ-340: Track source content version for stale detection

// Add to Update (after updated_at):
    reviewed_by?: string | null  // REQ-340: Track manual edit reviewer
    source_version_at?: string | null  // REQ-340: Track source content version for stale detection

// Add to Relationships (optional):
      ,
      {
        foreignKeyName: "item_translations_reviewed_by_fkey"
        columns: ["reviewed_by"]
        isOneToOne: false
        referencedRelation: "users"
        referencedColumns: ["id"]
      }
```

### For link_translations (Task 3)

```typescript
// Add to Row (after updated_at):
    reviewed_by: string | null  // REQ-340: Track manual edit reviewer
    source_version_at: string | null  // REQ-340: Track source content version for stale detection

// Add to Insert (after updated_at):
    reviewed_by?: string | null  // REQ-340: Track manual edit reviewer
    source_version_at?: string | null  // REQ-340: Track source content version for stale detection

// Add to Update (after updated_at):
    reviewed_by?: string | null  // REQ-340: Track manual edit reviewer
    source_version_at?: string | null  // REQ-340: Track source content version for stale detection

// Add to Relationships (optional):
      ,
      {
        foreignKeyName: "link_translations_reviewed_by_fkey"
        columns: ["reviewed_by"]
        isOneToOne: false
        referencedRelation: "users"
        referencedColumns: ["id"]
      }
```

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Database migration (REQ-339) not yet applied | Medium | High | Verify migration exists before implementation; coordinate with DBA |
| Line numbers in supabase.ts have changed | Medium | Low | Re-read file and adjust line numbers; use search patterns instead of absolute lines |
| Breaking existing type references | Low | Medium | Types use optional fields (`?`) for Insert/Update; maintain backward compatibility |
| Missing columns in database | Low | High | Cross-reference with REQ-339 implementation; verify database schema |
| Build fails after changes | Low | Medium | Run `tsc --noEmit` incrementally after each task |

---

## Commit Message Template

```
feat(L10N): Update TypeScript database types for Epic 5 (REQ-340)

- Add source_version_at to article_translations type definition
- Add reviewed_by and source_version_at to item_translations type definition
- Add reviewed_by and source_version_at to link_translations type definition
- Add FK relationships for reviewed_by columns (optional)

These type updates enable proper TypeScript validation for:
- Stale translation detection via source_version_at timestamps
- Manual edit tracking via reviewed_by user references

Part of Epic 5: Owner Translation Management
Depends on: REQ-339 (database migration)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

---

## Related Documentation

- [REQ-340 Overview Document](./REQ-340-update-typescript-database-types-overview.md)
- [Epic 5 Implementation Plan](./prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md)
- [REQ-339: Add Source Version Tracking Columns](./REQ-339-add-sourceversionat-columns-via-migration-overview.md)
- [Epic 1 Foundation Types (REQ-227)](./prd/Plan-110-L10N-Epic1-Foundation.md)
- [Gen Requests Epic 5](./gen_requests_epic5.md)

---

## Notes for Implementer

1. **Order of Operations**: Complete Tasks 1-4 in order, then run Task 5 verification. This allows catching errors early.

2. **Backward Compatibility**: All new fields use `| null` for Row types and `?:` optional syntax for Insert/Update types. This ensures existing code continues to work without modification.

3. **FK Relationships**: Adding the `reviewed_by` relationships is optional but recommended for type-safe joins. If the database does not have these FK constraints, skip the relationship additions.

4. **Tag Translations**: Task 4 is optional. Implement if the database migration includes `source_version_at` for `tag_translations`.

5. **IDE Restart**: After making changes, you may need to restart your IDE or TypeScript server for autocomplete to update properly.

6. **Future Consideration**: Consider generating types automatically from Supabase schema using `supabase gen types typescript` in future iterations for better maintainability.

---

*Document generated for FAQBNB Localization Epic 5 - Owner Translation Management*
*Task 1.5: Update TypeScript Database Types*
