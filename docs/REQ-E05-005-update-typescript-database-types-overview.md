# Implementation Overview: Update TypeScript Database Types

## Header
| Field | Value |
|-------|-------|
| Request Reference | REQ-E05-005 |
| Source File | docs/gen_requests_epic5.md |
| Original Request Date | 2026-01-22 18:30 |
| Breakdown Created | 2026-01-22 18:55 |
| T-shirt Size | S |
| Estimated Effort | 1-2 hours |

## Goals

Update the TypeScript database types in `/src/lib/supabase.ts` to reflect schema changes from REQ-E05-004 (source_version_at columns) and REQ-E05-002 (reviewed_by columns), ensuring type safety and consistency across all translation table types.

**Technical Requirements:**
- Add `source_version_at: string | null` to Row types for item_translations, article_translations, link_translations
- Add `source_version_at?: string | null` to Insert and Update types for the same tables
- Add `reviewed_by: string | null` to Row type for item_translations and link_translations
- Add `reviewed_by?: string | null` to Insert and Update types for item_translations and link_translations
- Ensure all type variants (Row, Insert, Update) are consistent
- Verify TypeScript compilation passes after changes
- Maintain backward compatibility with existing code

### Assumptions & Clarifications

- **Discovery**: Current types in `/src/lib/supabase.ts` are missing:
  - `source_version_at` field (added in REQ-E05-004 migration)
  - `reviewed_by` field for item_translations (exists in article_translations line 462, but missing from item_translations line 223)
  - `reviewed_by` field for link_translations (needs to match article_translations pattern)
- **Discovery**: article_translations already has `reviewed_by` field in types (line 462), but item_translations doesn't
- **Assumption**: Types can be updated manually or regenerated using Supabase CLI
- **Assumption**: Regenerating types is preferred for accuracy but requires Supabase project ID
- **Clarification needed**: Should we use manual updates or regenerate from database schema?

## Implementation Plan

### Step 1: Decide on Type Update Approach
- **Description**: Choose between manual type updates or automatic regeneration from database
- **Rationale**: Determine best approach based on available tooling and risk of human error
- **Estimated Effort**: 5 minutes

**Option A: Manual Type Updates**
- Pros: Quick, no external dependencies, surgical changes
- Cons: Risk of typos, may miss other schema changes, harder to maintain

**Option B: Regenerate Types from Database**
- Pros: Accurate, catches all schema changes, authoritative source
- Cons: Requires Supabase project ID, may regenerate entire file, need to verify no regressions
- Command: `npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.generated.ts`
- Or MCP: `mcp__supabase__generate_typescript_types`

**Recommendation**: Option B (regenerate) if Supabase CLI access available, otherwise Option A (manual)

### Step 2: Backup Current Types File
- **Description**: Create backup of current `/src/lib/supabase.ts` before modifications
- **Rationale**: Enable rollback if changes cause issues
- **Estimated Effort**: 2 minutes

```bash
cp src/lib/supabase.ts src/lib/supabase.ts.backup
```

### Step 3A: Manual Type Updates (If Using Manual Approach)
- **Description**: Manually add missing fields to translation table types
- **Rationale**: Surgical updates minimize risk of unintended changes
- **Estimated Effort**: 30 minutes

Changes to `item_translations` (starting line 222):

**Row type** (add after line 232):
```typescript
source_version_at: string | null
reviewed_by: string | null
```

**Insert type** (add after line 243):
```typescript
source_version_at?: string | null
reviewed_by?: string | null
```

**Update type** (add after line 254):
```typescript
source_version_at?: string | null
reviewed_by?: string | null
```

Changes to `article_translations` (starting line 453):

**Row type** (add after line 464):
```typescript
source_version_at: string | null
```

**Insert type** (add after line 476):
```typescript
source_version_at?: string | null
```

**Update type** (add after line 488):
```typescript
source_version_at?: string | null
```

Changes to `link_translations` (starting line 90):

**Row type** (add after existing fields):
```typescript
source_version_at: string | null
reviewed_by: string | null
```

**Insert type** (add after existing fields):
```typescript
source_version_at?: string | null
reviewed_by?: string | null
```

**Update type** (add after existing fields):
```typescript
source_version_at?: string | null
reviewed_by?: string | null
```

### Step 3B: Regenerate Types from Database (If Using Regeneration Approach)
- **Description**: Use Supabase CLI to regenerate types from current database schema
- **Rationale**: Authoritative source ensures accuracy and catches all changes
- **Estimated Effort**: 15 minutes

Using Supabase MCP:
```typescript
// Use mcp__supabase__generate_typescript_types tool
```

Or using Supabase CLI:
```bash
npx supabase gen types typescript --project-id <PROJECT_ID> > src/types/database.generated.ts
```

Then either:
1. Replace `/src/lib/supabase.ts` Database type with generated types, OR
2. Update `/src/lib/supabase.ts` to import from `database.generated.ts`

### Step 4: Verify Type Additions
- **Description**: Inspect updated types to confirm all required fields are present
- **Rationale**: Catch any missing fields before compilation
- **Estimated Effort**: 10 minutes

Verification checklist:
- [ ] `item_translations.Row` includes `source_version_at: string | null`
- [ ] `item_translations.Row` includes `reviewed_by: string | null`
- [ ] `item_translations.Insert` includes `source_version_at?: string | null`
- [ ] `item_translations.Insert` includes `reviewed_by?: string | null`
- [ ] `item_translations.Update` includes `source_version_at?: string | null`
- [ ] `item_translations.Update` includes `reviewed_by?: string | null`
- [ ] `article_translations.Row` includes `source_version_at: string | null`
- [ ] `article_translations.Insert` includes `source_version_at?: string | null`
- [ ] `article_translations.Update` includes `source_version_at?: string | null`
- [ ] `article_translations.Row` still has `reviewed_by: string | null` (existing)
- [ ] `link_translations.Row` includes `source_version_at: string | null`
- [ ] `link_translations.Row` includes `reviewed_by: string | null`
- [ ] `link_translations.Insert` includes both fields as optional
- [ ] `link_translations.Update` includes both fields as optional

### Step 5: Run TypeScript Type Check
- **Description**: Compile TypeScript to verify no type errors introduced
- **Rationale**: Catch type errors before runtime
- **Estimated Effort**: 5 minutes

Run type check:
```bash
npm run typecheck
# Or: npx tsc --noEmit
```

Expected result: No new type errors related to translation tables

Common issues to check:
- Existing code using translation tables may need null checks for new nullable fields
- Queries that destructure translation objects may need to handle new fields
- INSERT operations may need to explicitly set new fields or omit them

### Step 6: Test Type Safety in IDE
- **Description**: Open files that use translation types and verify IDE autocomplete shows new fields
- **Rationale**: Confirm types are working correctly in development environment
- **Estimated Effort**: 10 minutes

Files to test:
- `/src/app/api/translations/[entityType]/[entityId]/[language]/route.ts` (uses translation types in upsert)
- `/src/lib/job-queue/job-processor.ts` (saves translations)
- Any Epic 5 components that query translation tables

Verification:
- Type `item_translations.` in IDE → should show `source_version_at` and `reviewed_by` in autocomplete
- Type `article_translations.` in IDE → should show `source_version_at` in autocomplete
- Hover over translation table types → tooltips should show all fields including new ones

### Step 7: Update Code Using Translation Types (If Needed)
- **Description**: Fix any code that breaks due to stricter type checking with new fields
- **Rationale**: Ensure existing code compiles with updated types
- **Estimated Effort**: 15 minutes

Potential updates needed:
- Add null checks when accessing `source_version_at` or `reviewed_by`
- Update INSERT queries to explicitly include or omit new fields
- Update type assertions or casts that assume old type shape

Example fix:
```typescript
// Before
const translation: Database['public']['Tables']['item_translations']['Row'] = result.data;
const translatedAt = translation.translated_at;

// After (if accessing new fields)
const sourceVersion = translation.source_version_at; // Now valid!
const reviewer = translation.reviewed_by; // Now valid!
```

### Step 8: Document Type Changes
- **Description**: Add comment or documentation about new fields
- **Rationale**: Help future developers understand purpose of fields
- **Estimated Effort**: 5 minutes

Add JSDoc comments above affected types:
```typescript
/**
 * Translation record for items
 *
 * @property source_version_at - Timestamp of source content when translation was created (Epic 5)
 * @property reviewed_by - User ID who manually edited the translation (Epic 5)
 */
item_translations: {
  Row: { ... }
  ...
}
```

## Authorized Files and Functions for Modification

> ⚠️ **APPROVED SCOPE**: Changes outside this list require review

### Primary Type File
| File | Target | Type |
|------|--------|------|
| `/src/lib/supabase.ts` | `Database.public.Tables.item_translations` | Modify - add fields to Row/Insert/Update |
| `/src/lib/supabase.ts` | `Database.public.Tables.article_translations` | Modify - add fields to Row/Insert/Update |
| `/src/lib/supabase.ts` | `Database.public.Tables.link_translations` | Modify - add fields to Row/Insert/Update |

### Alternative: Generated Types Approach
| File | Target | Type |
|------|--------|------|
| `src/types/database.generated.ts` | Entire Database type | Create (if using generation approach) |
| `/src/lib/supabase.ts` | Import statement | Modify - import from generated file |

### Files That May Need Updates
| File | Target | Type |
|------|--------|------|
| `/src/app/api/translations/[entityType]/[entityId]/[language]/route.ts` | Upsert operations | Verify - may need to populate new fields |
| `/src/lib/job-queue/job-processor.ts` | `saveTranslation()` | Verify - may need to populate new fields |

## Dependencies

### Depends On (Completed First)
- **REQ-E05-004**: Add source_version_at Columns via Migration
  - Provides: Database schema with source_version_at columns
  - Reason: Types must match actual database schema
- **REQ-E05-002**: Create Update Translation API Endpoint (reviewed_by column addition)
  - Provides: Database schema with reviewed_by columns for item_translations and link_translations
  - Reason: Types must reflect reviewed_by availability

### Blocks (Requires This First)
- **All Epic 5 UI Components**: Cannot develop with type safety until types are updated
  - REQ-E05-006: TranslationManagement types file - imports from this file
  - Translation Preview Panel - uses translation types
  - Translation Editor - uses translation types
  - Translation Status Widget - queries translation data
- **Stale Translation Detection**: Code needs source_version_at in types to check for staleness
- **Manual Edit Tracking**: Code needs reviewed_by in types to track reviewers

### Parallel Safety
- **Files touched**:
  - `/src/lib/supabase.ts` (type definitions only)
  - Optionally: `src/types/database.generated.ts` (if using generation)
- **Conflicts with**:
  - Any other task modifying `/src/lib/supabase.ts` simultaneously
  - Unlikely since this is primarily type-level changes
- **Safe to parallelize with**:
  - All Epic 5 API endpoint implementation (different files)
  - Epic 5 UI component planning (can use updated types once available)
  - Database query optimizations (types don't affect runtime)

### External Dependencies
- TypeScript 5.x compiler
- Supabase CLI (optional, if using regeneration approach)
- Supabase project ID (optional, if using regeneration approach)
- IDE with TypeScript support (VS Code, etc.)

## Risks and Considerations

### Potential Side Effects
- **Existing code may break**: If code relies on strict type shapes, adding fields could cause errors
  - Mitigation: New fields are optional in Insert/Update types
  - Mitigation: Run full type check to catch issues
  - Mitigation: Most code uses Supabase queries which are flexible

- **Type regeneration may change unrelated types**: If using CLI regeneration
  - Mitigation: Review diff carefully before committing
  - Mitigation: Only use regeneration if confident in database schema state
  - Mitigation: Backup original file first

- **NULL handling**: Code may not expect NULL values in new fields
  - Mitigation: Fields are already nullable, consistent with existing pattern
  - Mitigation: TypeScript forces null checks where needed

### Testing Requirements
- **Type checking**:
  - Run `npm run typecheck` to verify no type errors
  - Verify strict mode passes
  - Check that all existing queries compile

- **IDE testing**:
  - Verify autocomplete shows new fields
  - Verify type tooltips include field descriptions
  - Check that type errors are caught in development

- **Runtime testing** (indirect):
  - Existing code continues to work (fields are optional)
  - New code using fields compiles correctly
  - Database queries return expected shape

### Open Questions
- [ ] Should we use manual updates or regenerate from database? (Recommendation: Regenerate if available)
- [ ] Should we add JSDoc comments for new fields? (Recommendation: Yes, for clarity)
- [ ] Should we create a separate generated types file or update inline? (Recommendation: Keep inline for simplicity unless project has separate pattern)
- [ ] Do we need to update any helper types or utility functions that work with translation tables? (Recommendation: Review `/src/lib/db-transforms.ts` if it exists)

## Out of Scope

The following are explicitly **not** included in this task:
- Implementing stale translation detection logic (separate task)
- Implementing manual edit tracking UI (separate task)
- Adding validation logic for new fields (handled in API endpoints)
- Creating helper functions to work with new fields
- Updating database schema (already done in REQ-E05-004 and REQ-E05-002)
- Populating new fields in existing database records (NULL is acceptable)
- Creating TypeScript branded types or enhanced type safety
- Adding Zod or other runtime validation schemas
- Updating database migration scripts (already complete)
- Modifying RLS policies related to new fields
- Adding database triggers for new fields
- Creating database views using new fields
- Performance testing with new fields

## Special Notes

### Type vs Runtime Considerations

These are **compile-time only changes**. The TypeScript types don't affect runtime behavior:
- Types are erased during compilation
- No JavaScript code changes
- No bundle size impact
- No performance impact

The value is in **developer experience**:
- IDE autocomplete for new fields
- Type errors caught at compile time
- Self-documenting code
- Refactoring confidence

### Relationship Between Types and Schema

TypeScript types should be **in sync with database schema**:
- Types describe what exists in database
- Types don't create database changes
- Schema changes happen via migrations (REQ-E05-004)
- Type updates happen in TypeScript files (this task)

**Critical order**:
1. First: Database migration (REQ-E05-004) ✓
2. Second: Type updates (this task)
3. Third: Code using new fields (Epic 5 features)

### Manual vs Generated Types Trade-off

**Manual approach** (recommended for this task):
- Surgical changes to specific types
- No risk of unrelated changes
- Quick to implement
- Full control over naming and documentation

**Generated approach**:
- Authoritative source (database schema)
- Catches all changes automatically
- Risk of changing unrelated types
- Requires Supabase CLI setup

For this specific task, **manual approach is recommended** because:
- Changes are well-defined (specific fields to add)
- Low risk of human error (simple field additions)
- Faster than setting up/verifying regeneration
- No risk of unintended changes to other types

### Consistency Across Translation Tables

After this task, all translation tables will have consistent structure:
- `item_translations`: Has source_version_at ✓, Has reviewed_by ✓
- `article_translations`: Has source_version_at ✓, Has reviewed_by ✓ (already existed)
- `link_translations`: Has source_version_at ✓, Has reviewed_by ✓
- `tag_translations`: Different schema (no status tracking) - not affected

This consistency enables:
- Generic translation management code
- Unified stale detection logic
- Consistent manual edit tracking

---
*Document generated: 2026-01-22 18:55*
