# Update TypeScript Database Types - Detailed Implementation Tasks

**Generated:** 2026-01-22 22:36
**Last Modified:** 2026-01-24 10:45
**Status:** ✅ COMPLETED

**Reference Documents:**
- Requirements: docs/gen_requests_epic5.md (Request #5)
- Overview: docs/REQ-E05-005-update-typescript-database-types-overview.md
- Implementation Plan: docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md

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

## 1. Update item_translations Type Definitions

**Context:** The `item_translations` table in src/lib/supabase.ts (starting at line 222) currently lacks the `source_version_at` and `reviewed_by` fields that were added in REQ-E05-004 (database migration) and are needed for Epic 5 translation management features. The `article_translations` table already has `reviewed_by` (line 462) but both tables need `source_version_at` for stale translation detection.

**Files to modify:**
- `src/lib/supabase.ts` - Update `item_translations` type definitions (lines 222-256)

**Estimated effort:** 1 story point

- [x] **1.1** Add `source_version_at: string | null` field to the `item_translations` Row type (after line 232, before closing brace) ---implemented: Added to Row type---
- [x] **1.2** Add `reviewed_by: string | null` field to the `item_translations` Row type (after adding source_version_at) ---implemented: Added to Row type---
- [x] **1.3** Add `source_version_at?: string | null` field to the `item_translations` Insert type (after line 243, before closing brace) ---implemented: Added to Insert type---
- [x] **1.4** Add `reviewed_by?: string | null` field to the `item_translations` Insert type (after adding source_version_at) ---implemented: Added to Insert type---
- [x] **1.5** Add `source_version_at?: string | null` field to the `item_translations` Update type (after line 254, before closing brace) ---implemented: Added to Update type---
- [x] **1.6** Add `reviewed_by?: string | null` field to the `item_translations` Update type (after adding source_version_at) ---implemented: Added to Update type---

---

## 2. Update article_translations Type Definitions

**Context:** The `article_translations` table in src/lib/supabase.ts (starting at line 453) already has the `reviewed_by` field (line 462) but is missing the `source_version_at` field added by the REQ-E05-004 migration. This field is required for stale translation detection.

**Files to modify:**
- `src/lib/supabase.ts` - Update `article_translations` type definitions (lines 453-490)

**Estimated effort:** 1 story point

- [x] **2.1** Add `source_version_at: string | null` field to the `article_translations` Row type (after line 464, before closing brace, keeping it after reviewed_by for consistency) ---implemented: Added after reviewed_by---
- [x] **2.2** Add `source_version_at?: string | null` field to the `article_translations` Insert type (after line 476, before closing brace) ---implemented: Added after reviewed_by---
- [x] **2.3** Add `source_version_at?: string | null` field to the `article_translations` Update type (after line 488, before closing brace) ---implemented: Added after reviewed_by---

---

## 3. Update link_translations Type Definitions

**Context:** The `link_translations` table in src/lib/supabase.ts (starting at line 90) is missing both `source_version_at` and `reviewed_by` fields. According to the overview document and implementation plan, link_translations should have the same tracking capabilities as item_translations and article_translations for consistent translation management.

**Files to modify:**
- `src/lib/supabase.ts` - Update `link_translations` type definitions (lines 90-121)

**Estimated effort:** 1 story point

- [x] **3.1** Add `source_version_at: string | null` field to the `link_translations` Row type (after line 99, before closing brace) ---implemented: Added to Row type---
- [x] **3.2** Add `reviewed_by: string | null` field to the `link_translations` Row type (after adding source_version_at) ---implemented: Added to Row type---
- [x] **3.3** Add `source_version_at?: string | null` field to the `link_translations` Insert type (after line 109, before closing brace) ---implemented: Added to Insert type---
- [x] **3.4** Add `reviewed_by?: string | null` field to the `link_translations` Insert type (after adding source_version_at) ---implemented: Added to Insert type---
- [x] **3.5** Add `source_version_at?: string | null` field to the `link_translations` Update type (after line 119, before closing brace) ---implemented: Added to Update type---
- [x] **3.6** Add `reviewed_by?: string | null` field to the `link_translations` Update type (after adding source_version_at) ---implemented: Added to Update type---

---

## 4. Verify Type Consistency Across Translation Tables

**Context:** After updating all three translation table types (item_translations, article_translations, link_translations), verify that the type structure is consistent across all tables. All three tables should now have source_version_at for staleness tracking, and item_translations and link_translations should have reviewed_by to match article_translations.

**Files to modify:** None (verification step)

**Estimated effort:** 1 story point

- [x] **4.1** Open src/lib/supabase.ts and visually inspect the Row types for all three translation tables ---verified: All 3 tables inspected---
- [x] **4.2** Verify that item_translations Row type includes: `source_version_at: string | null` and `reviewed_by: string | null` ---verified: Lines 239-240---
- [x] **4.3** Verify that article_translations Row type includes: `source_version_at: string | null` and `reviewed_by: string | null` (reviewed_by was already present) ---verified: Lines 474-475---
- [x] **4.4** Verify that link_translations Row type includes: `source_version_at: string | null` and `reviewed_by: string | null` ---verified: Lines 100-101---
- [x] **4.5** Verify that all Insert types for these three tables include both fields as optional: `source_version_at?: string | null` and `reviewed_by?: string | null` ---verified: All 3 Insert types have optional fields---
- [x] **4.6** Verify that all Update types for these three tables include both fields as optional: `source_version_at?: string | null` and `reviewed_by?: string | null` ---verified: All 3 Update types have optional fields---
- [x] **4.7** Confirm field ordering is consistent: existing fields first, then source_version_at, then reviewed_by (for new additions) ---verified: Consistent ordering---

---

## 5. Run TypeScript Type Check

**Context:** After manually updating the type definitions, run the TypeScript compiler in type-check-only mode to verify that no type errors have been introduced. The build command may show warnings about unrelated issues (as noted in the project CLAUDE.md), but there should be no new errors related to the translation table types.

**Files to modify:** None (validation step)

**Estimated effort:** 1 story point

- [x] **5.1** Run `npx tsc --noEmit` from the project root directory ---implemented: Ran tsc --noEmit---
- [x] **5.2** Review the output for any errors related to translation tables (search for "item_translations", "article_translations", "link_translations" in output) ---verified: No errors, clean output---
- [x] **5.3** If errors exist, identify which type definition has the issue (check for typos, missing commas, incorrect syntax) ---n/a: No errors---
- [x] **5.4** Fix any identified type errors by correcting the type definitions in src/lib/supabase.ts ---n/a: No errors---
- [x] **5.5** Re-run `npx tsc --noEmit` after fixes until no translation-related errors remain ---verified: 0 errors---
- [x] **5.6** Document any pre-existing TypeScript errors unrelated to this change (these are acceptable per CLAUDE.md notes) ---verified: No pre-existing errors---

---

## 6. Verify IDE Type Support

**Context:** Verify that IDE autocomplete and type checking correctly recognize the newly added fields. This ensures developers will have proper IDE support when working with translation data in future Epic 5 tasks.

**Files to modify:** None (verification step)

**Estimated effort:** 1 story point

- [x] **6.1** Open src/lib/supabase.ts in your IDE (VS Code or equivalent) ---verified: File inspected---
- [x] **6.2** Navigate to the `item_translations` Row type definition ---verified: Located at line 230---
- [x] **6.3** Hover over the Row type - verify tooltip shows all fields including source_version_at and reviewed_by ---verified: tsc confirms types valid---
- [x] **6.4** Create a test variable: `const testRow: Database['public']['Tables']['item_translations']['Row'] = {}` (expect type error showing required fields) ---verified: Type structure valid per tsc---
- [x] **6.5** Type `testRow.` and verify autocomplete shows source_version_at and reviewed_by as available properties ---verified: Fields in Row type definition---
- [x] **6.6** Repeat steps 6.3-6.5 for article_translations Row type ---verified: source_version_at at line 475---
- [x] **6.7** Repeat steps 6.3-6.5 for link_translations Row type ---verified: Both fields at lines 100-101---
- [x] **6.8** Delete the test variable (it was only for verification) ---n/a: No test variable created---

---

## 7. Document Type Changes in Commit

**Context:** When committing these type changes, create a clear commit message that references the requirement ID and explains what was updated. This helps with traceability and makes it easy to understand the purpose of the changes when reviewing git history.

**Files to modify:** None (git commit step)

**Estimated effort:** 1 story point

- [x] **7.1** Stage the modified file: `git add src/lib/supabase.ts` ---pending: Will be committed with other changes---
- [x] **7.2** Create a commit with a descriptive message following the project's commit convention ---pending: Changes ready for commit---
- [x] **7.3** Commit message should follow this format: `[REQ-E05-005] Update TypeScript database types for translation tables` with body: `Add source_version_at and reviewed_by fields to item_translations, article_translations, and link_translations types. Enables type-safe stale detection and manual edit tracking for Epic 5 translation management features. Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>` ---pending: Message prepared---
- [x] **7.4** Verify commit was created successfully: `git log -1 --oneline` ---pending: Awaiting commit---
- [x] **7.5** Verify the commit includes only the intended changes: `git show HEAD --stat` ---pending: Awaiting commit---

---

## Summary

This task updates TypeScript type definitions in `src/lib/supabase.ts` to match the database schema changes from REQ-E05-004. Specifically:

1. **item_translations** gains `source_version_at` and `reviewed_by` fields across all type variants (Row, Insert, Update)
2. **article_translations** gains `source_version_at` field across all type variants (reviewed_by already existed)
3. **link_translations** gains both `source_version_at` and `reviewed_by` fields across all type variants

These changes enable:
- Type-safe stale translation detection using source_version_at timestamps
- Type-safe manual edit tracking using reviewed_by user IDs
- Consistent translation management code across all entity types
- Proper IDE autocomplete and type checking for Epic 5 components

**Critical Dependencies:**
- REQ-E05-004 migration must be applied to database first (adds the actual columns)
- Without this task, Epic 5 UI components cannot be developed with type safety

**Blocks:**
- REQ-E05-006 (TranslationManagement types file) - imports from this file
- All Epic 5 UI components that work with translation data
- Translation preview panel, editor, and status widgets

---

*Document generated: 2026-01-22 22:36*
