# Implementation Overview: Create Update Translation API Endpoint

## Header
| Field | Value |
|-------|-------|
| Request Reference | REQ-E05-002 |
| Source File | docs/gen_requests_epic5.md |
| Original Request Date | 2026-01-22 15:57 |
| Breakdown Created | 2026-01-22 18:46 |
| T-shirt Size | M |
| Estimated Effort | 2-3 hours (verification and enhancement) |

## Goals

Verify and enhance the existing PUT endpoint at `/api/translations/[entityType]/[entityId]/[language]/route.ts` to ensure it meets all Epic 5 requirements for manual translation editing. The endpoint already exists from Epic 3 (REQ-E03-023) but needs verification against Epic 5 acceptance criteria and potential enhancements.

**Technical Requirements:**
- Accept PUT requests with translation content (title, description, name, etc.)
- Set translation_status to 'manual' when content is edited
- Record reviewedBy field with authenticated user's ID
- Validate user has ownership access to the entity via property ownership
- Return updated translation record with timestamps
- Preserve original entityType, entityId, and language associations
- Handle all entity types: item, article, link, tag

### Assumptions & Clarifications

- **Discovery**: Endpoint already exists at `/src/app/api/translations/[entityType]/[entityId]/[language]/route.ts` from Epic 3 (REQ-E03-023)
- **Assumption**: Epic 5 request duplicates Epic 3 functionality, implementation verification needed
- **Assumption**: Existing implementation handles most requirements but may need minor enhancements
- **Clarification needed**: Are there Epic 5-specific features beyond what Epic 3 already implemented?
- **Note**: `reviewed_by` column only exists in `article_translations` table, not in `item_translations` or `link_translations` tables

## Implementation Plan

### Step 1: Verify Existing Implementation Against Epic 5 Requirements
- **Description**: Review existing endpoint implementation and compare against REQ-E05-002 acceptance criteria
- **Rationale**: Avoid duplicate work and identify any gaps between Epic 3 and Epic 5 requirements
- **Estimated Effort**: 30 minutes

Verification checklist:
- ✓ PUT request returns HTTP 200 with valid auth (line 683)
- ✓ Unauthenticated requests return HTTP 401 (lines 433-437)
- ✓ Translation status set to 'manual' (lines 541, 573, 607)
- ✓ reviewedBy field records user ID (line 574 for articles)
- ✓ Ownership validation via property chain (lines 458-469)
- ✓ Access denied returns HTTP 403 (lines 461-468)
- ✓ Missing fields return HTTP 400 (lines 476-497)
- ✓ updatedAt timestamp included (lines 543, 576, 608)
- ✓ Original entityType/entityId/language preserved (lines 537-545, 567-581, 599-613)
- ✓ Response includes complete translation object (lines 662-673)

### Step 2: Identify Schema Limitations for reviewedBy Field
- **Description**: Document which translation tables support reviewedBy and which don't
- **Rationale**: Not all translation tables have the reviewed_by column, limiting Epic 5's tracking capability
- **Estimated Effort**: 15 minutes

Schema analysis (from existing code lines 516-644):
- `article_translations`: ✓ Has `reviewed_by` column (line 574)
- `item_translations`: ✗ No `reviewed_by` column (schema limitation)
- `link_translations`: ✗ No `reviewed_by` column (schema limitation)
- `tag_translations`: ✗ No `translation_status`, `reviewed_by`, or timestamp columns (different schema)

**Impact**: Epic 5 requirement "The reviewedBy field records the authenticated user's ID" can only be met for articles, not items or links.

### Step 3: Add Database Migration for reviewedBy Column (If Needed)
- **Description**: Create migration to add reviewed_by column to item_translations and link_translations tables
- **Rationale**: Enable full Epic 5 functionality for tracking who manually edited translations
- **Estimated Effort**: 30 minutes

Migration details:
```sql
ALTER TABLE item_translations ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES auth.users(id);
ALTER TABLE link_translations ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES auth.users(id);

CREATE INDEX IF NOT EXISTS idx_item_translations_reviewed_by
  ON item_translations(reviewed_by);
CREATE INDEX IF NOT EXISTS idx_link_translations_reviewed_by
  ON link_translations(reviewed_by);
```

### Step 4: Update Endpoint Code to Use reviewedBy for All Entity Types
- **Description**: Modify upsert operations to include reviewed_by for items and links
- **Rationale**: Ensure consistent behavior across all entity types once schema is updated
- **Estimated Effort**: 30 minutes

Changes required in `/src/app/api/translations/[entityType]/[entityId]/[language]/route.ts`:
- Update item_translations upsert (lines 533-548) to include `reviewed_by: user.id`
- Update link_translations upsert (lines 598-613) to include `reviewed_by: user.id`
- Article_translations already includes reviewed_by (line 574) ✓

### Step 5: Add Integration Tests for Epic 5 Acceptance Criteria
- **Description**: Create or update test suite to verify all Epic 5 acceptance criteria are met
- **Rationale**: Ensure endpoint meets Epic 5 requirements and prevent regressions
- **Estimated Effort**: 45 minutes

Test coverage needed:
- Verify HTTP 200 on successful PUT with valid auth
- Verify HTTP 401 on unauthenticated request
- Verify translation_status becomes 'manual' after update
- Verify reviewed_by is populated with correct user ID
- Verify ownership validation prevents cross-property edits
- Verify HTTP 403 on unauthorized access attempt
- Verify HTTP 400 on missing required fields
- Verify updatedAt timestamp is current
- Verify entityType/entityId/language cannot be changed
- Verify response includes all translation fields

### Step 6: Update API Documentation and Type Exports
- **Description**: Update type definitions and API documentation to reflect Epic 5 usage
- **Rationale**: Ensure consuming code (Epic 5 UI components) has correct types and knows about reviewed_by
- **Estimated Effort**: 15 minutes

Documentation updates:
- Update type comments to reference both Epic 3 and Epic 5
- Export ManualTranslationResponse type for UI components
- Document reviewed_by availability per entity type
- Add JSDoc comments explaining schema limitations

### Step 7: Verify CORS and Security Headers
- **Description**: Ensure CORS headers are appropriate for Epic 5 UI consumption
- **Rationale**: Epic 5 UI components need to call this endpoint from the dashboard
- **Estimated Effort**: 15 minutes

Verification checklist:
- ✓ OPTIONS handler exists for CORS preflight (lines 712-721)
- ✓ PUT method allowed in CORS headers (line 718)
- Review if additional headers needed for Epic 5 use cases
- Ensure rate limiting won't impact translation editing workflows

## Authorized Files and Functions for Modification

> ⚠️ **APPROVED SCOPE**: Changes outside this list require review

### Existing Files to Modify
| File | Target | Type |
|------|--------|------|
| `/src/app/api/translations/[entityType]/[entityId]/[language]/route.ts` | `PUT()` function (lines 381-707) | Modify - add reviewed_by to items/links |
| `/src/app/api/translations/[entityType]/[entityId]/[language]/route.ts` | Type definitions (lines 27-82) | Modify - update comments |

### Database Migrations to Create
| File | Target | Type |
|------|--------|------|
| Via Supabase MCP | `item_translations.reviewed_by` column | Create |
| Via Supabase MCP | `link_translations.reviewed_by` column | Create |

### Test Files to Create/Modify
| File | Target | Type |
|------|--------|------|
| `/src/app/api/translations/[entityType]/[entityId]/[language]/route.test.ts` | Epic 5 acceptance criteria tests | Create or Extend |

### Documentation Files to Update
| File | Target | Type |
|------|--------|------|
| `/src/app/api/translations/[entityType]/[entityId]/[language]/route.ts` | JSDoc comments | Modify - add Epic 5 references |

## Dependencies

### Depends On (Completed First)
- **Epic 1 (Foundation)**: Translation tables must exist
  - Tables: `item_translations`, `article_translations`, `link_translations`, `tag_translations`
  - Columns: `translation_status`, `translated_at`, `updated_at`, `language`
  - Column to add: `reviewed_by` (items and links)
- **Epic 3 (Dynamic Content Translation)**: Base endpoint implementation
  - REQ-E03-023: Manual Translation Override Endpoint (already completed)
  - File: `/src/app/api/translations/[entityType]/[entityId]/[language]/route.ts`
  - Functions: `validateRequestBody()`, `getEntity()`, `validateEntityAccess()`

### Blocks (Requires This First)
- **REQ-E05-004**: Translation Editor Component - needs this endpoint to save manual edits
- **REQ-E05-005**: Translation Preview Panel - uses this endpoint when user clicks "Edit Translation"
- **REQ-E05-010**: Manual Edit Warning Dialog - needs reviewed_by data to detect manual edits

### Parallel Safety
- **Files touched**:
  - `/src/app/api/translations/[entityType]/[entityId]/[language]/route.ts` (existing file, minimal changes)
  - Database schema (new columns)
- **Conflicts with**:
  - REQ-E05-003 (Re-translate API) - May modify same translation records, but different routes
- **Safe to parallelize with**:
  - REQ-E05-001 (Translation Status API) - different route, read-only
  - Any UI component tasks that will consume this endpoint
  - Epic 5 frontend tasks (they'll use existing endpoint during development)

### External Dependencies
- Supabase PostgreSQL database with RLS enabled
- Next.js 15.5.9 App Router API routes
- Existing authentication system via `validateAdminAuth`
- TypeScript 5.x with strict mode

## Risks and Considerations

### Potential Side Effects
- **Schema changes**: Adding reviewed_by columns requires migration
  - Mitigation: Use `ADD COLUMN IF NOT EXISTS` for idempotent migrations
  - Mitigation: Coordinate with Epic 1 team if schema changes conflict

- **Existing Epic 3 usage**: Changes shouldn't break Epic 3 consumers
  - Mitigation: Changes are additive only (adding reviewed_by field)
  - Mitigation: Maintain backward compatibility in response structure

- **Tag translations**: tag_translations table has fundamentally different schema
  - Mitigation: Document that reviewed_by is not available for tag translations
  - Mitigation: Consider whether tags need manual edit tracking

### Testing Requirements
- **Unit tests**:
  - reviewed_by population for all entity types
  - Schema validation for new columns
  - Response structure includes reviewed_by

- **Integration tests**:
  - End-to-end PUT request → database update → response
  - Verify reviewed_by persists across multiple edits
  - Verify translation_status remains 'manual' after edit

- **Regression tests**:
  - Ensure Epic 3 functionality still works
  - Verify existing manual override tests pass
  - Check that upsert conflict resolution works with new column

### Open Questions
- [ ] Should we add reviewed_by to tag_translations as well? (Recommendation: No, tags use different pattern)
- [ ] Should we track edit history (multiple reviewedBy entries)? (Recommendation: Defer to future iteration, single field sufficient for Epic 5)
- [ ] Do we need to migrate existing manual translations to populate reviewed_by? (Recommendation: No, leave NULL for historical records)
- [ ] Should reviewed_by reference auth.users or users table? (Recommendation: auth.users as shown in existing code)

## Out of Scope

The following are explicitly **not** included in this task:
- Creating the endpoint from scratch (already exists from Epic 3)
- Modifying entity validation logic (already implemented)
- Changing CORS policies (already configured)
- Adding new entity types beyond item, article, link, tag
- Implementing translation versioning or history tracking
- Adding bulk update capabilities (single entity only)
- Implementing automatic translation quality scoring
- Adding translation approval workflows
- Creating UI components that consume this endpoint (separate Epic 5 tasks)
- Implementing real-time collaboration on translation edits
- Adding translation diff/comparison logic to the API
- Implementing undo/redo functionality
- Adding translation export/import features
- Modifying source content through this endpoint (translation-only)

## Special Notes

### Relationship to Epic 3
This request (REQ-E05-002) from Epic 5 describes functionality that was already implemented in Epic 3 as REQ-E03-023. The endpoint exists and is functional. The work for this task primarily involves:

1. **Verification**: Confirming Epic 3 implementation meets Epic 5 requirements
2. **Enhancement**: Adding reviewed_by column to item_translations and link_translations
3. **Testing**: Ensuring all Epic 5 acceptance criteria are validated
4. **Documentation**: Updating references to include Epic 5 use cases

### Schema Limitation Discovery
During investigation, it was discovered that not all translation tables have the `reviewed_by` column:
- ✓ `article_translations` has `reviewed_by`
- ✗ `item_translations` lacks `reviewed_by`
- ✗ `link_translations` lacks `reviewed_by`
- ✗ `tag_translations` has completely different schema

This is a **critical finding** that affects Epic 5's ability to track who manually edited translations. A migration is required to add this column.

### Coordination with Epic 5 Team
The Epic 5 UI components (Translation Editor, Preview Panel) should use the existing endpoint during development. Once the reviewed_by column is added, they'll automatically receive that data in responses.

---
*Document generated: 2026-01-22 18:46*
