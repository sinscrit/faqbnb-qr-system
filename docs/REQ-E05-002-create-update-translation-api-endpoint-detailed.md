# Create Update Translation API Endpoint - Detailed Implementation Tasks

**Generated:** 2026-01-22 22:35
**Reference Documents:**
- Requirements: docs/gen_requests_epic5.md (REQ-E05-002)
- Overview: docs/REQ-E05-002-create-update-translation-api-endpoint-overview.md
- Implementation Plan: docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md

**CRITICAL INSTRUCTIONS FOR IMPLEMENTING AGENT:**
- Operate from the project root folder ONLY
- **DO NOT ATTEMPT TO NAVIGATE TO OTHER FOLDERS UNDER ANY CIRCUMSTANCES**
- All file paths must be relative to project root

---

## Build & Test Commands

| Action | Command |
|--------|---------|
| Type Check | `npx tsc --noEmit` |
| Unit Tests | `npm test` |
| Build | `npm run build` |
| Lint | `npm run lint` |

---

## Implementation Context

**IMPORTANT**: This endpoint already exists at `/src/app/api/translations/[entityType]/[entityId]/[language]/route.ts` from Epic 3 (REQ-E03-023). The work for this task involves:

1. **Verification**: Confirm existing implementation meets Epic 5 requirements
2. **Enhancement**: Add `reviewed_by` column to `item_translations` and `link_translations` tables
3. **Code Updates**: Update upsert operations to populate `reviewed_by` for items and links
4. **Testing**: Validate all Epic 5 acceptance criteria
5. **Documentation**: Update comments to reference Epic 5

**Schema Discovery**: Currently only `article_translations` has the `reviewed_by` column. Items and links lack this column, preventing Epic 5 from tracking who manually edited those translations.

---

## 1. Verify Existing Implementation Against Epic 5 Requirements

**Context:** The endpoint was implemented for Epic 3 and needs verification that it meets all Epic 5 acceptance criteria. Review lines 381-707 of the existing route.ts file to confirm functionality.

**Files to modify:**
- None (verification only)

**Estimated effort:** 1 story point

- [ ] **1.1** Read the existing endpoint file `/src/app/api/translations/[entityType]/[entityId]/[language]/route.ts` completely
- [ ] **1.2** Verify PUT request returns HTTP 200 with valid authentication (check line 683 response structure)
- [ ] **1.3** Verify unauthenticated requests return HTTP 401 (check lines 433-437 for auth validation)
- [ ] **1.4** Verify translation_status is set to 'manual' (check lines 541, 573, 607 in upsert operations)
- [ ] **1.5** Verify reviewed_by field is populated for articles (check line 574) but note items and links don't have this field
- [ ] **1.6** Verify ownership validation via property chain (check lines 458-469 for access control logic)
- [ ] **1.7** Verify access denied returns HTTP 403 (check lines 461-468)
- [ ] **1.8** Verify missing fields return HTTP 400 (check lines 476-497 validation logic)
- [ ] **1.9** Verify updated_at timestamp is set (check lines 543, 576, 608)
- [ ] **1.10** Verify response includes complete translation object (check lines 662-673 response construction)
- [ ] **1.11** Document which Epic 5 acceptance criteria are already met vs. which need the reviewed_by enhancement
- [ ] **1.12** Create a verification summary noting that articles work correctly but items and links need schema updates

---

## 2. Create Database Migration for reviewed_by Column

**Context:** The `item_translations` and `link_translations` tables lack the `reviewed_by` column that exists in `article_translations`. Add this column to enable Epic 5 to track who manually edited item and link translations.

**Files to modify:**
- Database schema via Supabase MCP tool

**Estimated effort:** 1 story point

- [ ] **2.1** Use Supabase MCP `apply_migration` tool to create a migration named "add_reviewed_by_to_item_and_link_translations"
- [ ] **2.2** In the migration SQL, add `ALTER TABLE item_translations ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES auth.users(id);`
- [ ] **2.3** In the migration SQL, add `ALTER TABLE link_translations ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES auth.users(id);`
- [ ] **2.4** In the migration SQL, add comment for item_translations.reviewed_by: `COMMENT ON COLUMN item_translations.reviewed_by IS 'User ID who manually edited this translation (Epic 5)';`
- [ ] **2.5** In the migration SQL, add comment for link_translations.reviewed_by: `COMMENT ON COLUMN link_translations.reviewed_by IS 'User ID who manually edited this translation (Epic 5)';`
- [ ] **2.6** In the migration SQL, create index `CREATE INDEX IF NOT EXISTS idx_item_translations_reviewed_by ON item_translations(reviewed_by);`
- [ ] **2.7** In the migration SQL, create index `CREATE INDEX IF NOT EXISTS idx_link_translations_reviewed_by ON link_translations(reviewed_by);`
- [ ] **2.8** Execute the migration using Supabase MCP tool
- [ ] **2.9** Verify migration was applied successfully by listing the columns of item_translations table
- [ ] **2.10** Verify migration was applied successfully by listing the columns of link_translations table
- [ ] **2.11** Document the migration was completed and the schema now supports reviewed_by for items, articles, and links
- [ ] **2.12** Note that tag_translations does NOT receive reviewed_by due to its fundamentally different schema (documented limitation)

---

## 3. Update item_translations Upsert to Include reviewed_by

**Context:** After the database migration, update the item translation upsert operation (lines 533-548) to populate the reviewed_by field with the authenticated user's ID, matching the pattern already used for articles (line 574).

**Files to modify:**
- `/src/app/api/translations/[entityType]/[entityId]/[language]/route.ts`

**Estimated effort:** 1 story point

- [ ] **3.1** Locate the item case in the switch statement (line 520) in the PUT function
- [ ] **3.2** Find the item_translations upsert operation (lines 533-548)
- [ ] **3.3** In the upsert data object, add `reviewed_by: user.id` field after the translation_status field (around line 541)
- [ ] **3.4** Ensure the field is added in the same position as it appears in the article case for consistency
- [ ] **3.5** Verify the upsert conflict resolution remains `{ onConflict: 'item_id,language' }` unchanged
- [ ] **3.6** Update the code comment above the item case (around line 520) to mention "reviewed_by column added in Epic 5"
- [ ] **3.7** Verify the ManualTranslationResponse type (lines 60-71) already includes reviewedBy field in the response
- [ ] **3.8** Run `npx tsc --noEmit` to verify no TypeScript errors
- [ ] **3.9** Check that the response construction code (lines 662-673) already returns reviewedBy, so no changes needed there
- [ ] **3.10** Test manually by making a PUT request to update an item translation and verify reviewed_by is populated in the database

---

## 4. Update link_translations Upsert to Include reviewed_by

**Context:** Update the link translation upsert operation (lines 598-613) to populate the reviewed_by field, matching the pattern used for articles and now items.

**Files to modify:**
- `/src/app/api/translations/[entityType]/[entityId]/[language]/route.ts`

**Estimated effort:** 1 story point

- [ ] **4.1** Locate the link case in the switch statement (line 585) in the PUT function
- [ ] **4.2** Find the link_translations upsert operation (lines 598-613)
- [ ] **4.3** In the upsert data object, add `reviewed_by: user.id` field after the translation_status field (around line 605)
- [ ] **4.4** Ensure the field is added consistently with the item and article cases
- [ ] **4.5** Verify the upsert conflict resolution remains `{ onConflict: 'link_id,language' }` unchanged
- [ ] **4.6** Update the code comment above the link case (around line 585) to mention "reviewed_by column added in Epic 5"
- [ ] **4.7** Run `npx tsc --noEmit` to verify no TypeScript errors
- [ ] **4.8** Test manually by making a PUT request to update a link translation and verify reviewed_by is populated in the database
- [ ] **4.9** Verify the response includes the reviewedBy field for link translations
- [ ] **4.10** Document that all three entity types (item, article, link) now consistently support reviewed_by tracking

---

## 5. Update File Header Comments to Reference Epic 5

**Context:** The file header (lines 1-15) currently only references Epic 3 (REQ-E03-023). Update documentation to indicate this endpoint serves both Epic 3 and Epic 5 requirements.

**Files to modify:**
- `/src/app/api/translations/[entityType]/[entityId]/[language]/route.ts`

**Estimated effort:** 1 story point

- [ ] **5.1** Locate the file header comment block (lines 1-15)
- [ ] **5.2** Update the description to mention "Allows property owners to manually override automatic translations (Epic 3) and edit translations with review tracking (Epic 5)"
- [ ] **5.3** Add a new line: "Part of REQ-E03-023: Create Manual Translation Override Endpoint (Epic 3)"
- [ ] **5.4** Add a new line: "Part of REQ-E05-002: Create Update Translation API Endpoint (Epic 5)"
- [ ] **5.5** Update "Epic:" line to read "Epic: L10N Epic 3 & Epic 5 - Dynamic Content Translation & Owner Translation Management"
- [ ] **5.6** Update "Last Modified:" to current date 2026-01-22
- [ ] **5.7** Add schema comment section documenting reviewed_by availability: "Schema: reviewed_by column available for items, articles, links (Epic 5); not available for tags (different schema pattern)"
- [ ] **5.8** Review the ManualTranslationResponse type comment (line 59-60) and add note that reviewedBy field is populated for items, articles, links but may be empty for legacy data
- [ ] **5.9** Add JSDoc comment to the PUT function explaining Epic 5 enhancements (reviewed_by tracking)
- [ ] **5.10** Run `npm run lint` to ensure documentation style is consistent

---

## 6. Update Schema Comment Block for reviewed_by

**Context:** The existing code has a detailed schema comment (lines 514-518) explaining differences between translation tables. Update this to reflect the new reviewed_by column for items and links.

**Files to modify:**
- `/src/app/api/translations/[entityType]/[entityId]/[language]/route.ts`

**Estimated effort:** 1 story point

- [ ] **6.1** Locate the schema comment block (lines 514-518) before the switch statement
- [ ] **6.2** Update the comment for item_translations to read: "item_translations: has reviewed_by column (added Epic 5)"
- [ ] **6.3** Update the comment for link_translations to read: "link_translations: has reviewed_by column (added Epic 5)"
- [ ] **6.4** Keep the article_translations comment as: "article_translations: has reviewed_by column (Epic 1)"
- [ ] **6.5** Keep the tag_translations comment unchanged explaining its different schema
- [ ] **6.6** Add a summary line at the top of the comment: "Schema differences (after Epic 5 migration):"
- [ ] **6.7** Add a note: "Note: reviewed_by enables tracking which user manually edited each translation"
- [ ] **6.8** Verify the comment accurately reflects the current database state after migration
- [ ] **6.9** Run `npx tsc --noEmit` to ensure no errors
- [ ] **6.10** Commit changes with message format: "[REQ-E05-002] Update schema comments for reviewed_by column"

---

## 7. Write Unit Tests for reviewed_by Field Population

**Context:** Create or extend test file to verify that reviewed_by is correctly populated for items, articles, and links when translations are manually updated.

**Files to modify:**
- `/src/app/api/translations/[entityType]/[entityId]/[language]/__tests__/route.test.ts` (create if doesn't exist, extend if exists)

**Estimated effort:** 1 story point

- [ ] **7.1** Check if test file exists at `/src/app/api/translations/[entityType]/[entityId]/[language]/__tests__/route.test.ts`
- [ ] **7.2** If file doesn't exist, create it with proper imports: vitest, NextRequest, NextResponse, and route handler
- [ ] **7.3** Create test suite: `describe('PUT /api/translations/[entityType]/[entityId]/[language] - Epic 5 reviewed_by tracking', ...)`
- [ ] **7.4** Write test: "should populate reviewed_by for item translations" - mock user, make PUT request, verify reviewed_by equals user.id
- [ ] **7.5** Write test: "should populate reviewed_by for article translations" - verify existing Epic 3 behavior still works
- [ ] **7.6** Write test: "should populate reviewed_by for link translations" - mock user, make PUT request, verify reviewed_by equals user.id
- [ ] **7.7** Write test: "should not populate reviewed_by for tag translations" - verify tags work without this field (different schema)
- [ ] **7.8** Mock Supabase client using vitest.mock to simulate upsert responses
- [ ] **7.9** Mock validateAdminAuth to return test user with id 'test-user-123'
- [ ] **7.10** Run tests with `npm test` and verify all tests pass
- [ ] **7.11** Check test coverage with `npm run test:coverage` and ensure reviewed_by logic is covered
- [ ] **7.12** Document any mock setup requirements in test file comments

---

## 8. Write Integration Tests for Epic 5 Acceptance Criteria

**Context:** Verify all Epic 5 acceptance criteria are met by the enhanced endpoint, including authentication, authorization, status setting, and response structure.

**Files to modify:**
- `/src/app/api/translations/[entityType]/[entityId]/[language]/__tests__/route.test.ts`

**Estimated effort:** 1 story point

- [ ] **8.1** Create test suite: `describe('PUT /api/translations - Epic 5 Acceptance Criteria', ...)`
- [ ] **8.2** Write test: "should return HTTP 200 with valid authentication and content" - verify successful PUT returns 200 status
- [ ] **8.3** Write test: "should return HTTP 401 for unauthenticated requests" - mock request without auth token
- [ ] **8.4** Write test: "should set translation_status to manual" - verify upsert data includes translation_status: 'manual'
- [ ] **8.5** Write test: "should record reviewedBy with authenticated user ID" - verify reviewed_by matches authenticated user
- [ ] **8.6** Write test: "should validate property ownership" - mock user with no access and verify HTTP 403
- [ ] **8.7** Write test: "should return HTTP 403 when user doesn't own entity" - test cross-property access prevention
- [ ] **8.8** Write test: "should return HTTP 400 for missing required fields" - omit required field and verify error
- [ ] **8.9** Write test: "should include updated_at timestamp in response" - verify response.data.updatedAt is recent timestamp
- [ ] **8.10** Write test: "should preserve entityType, entityId, language" - verify these cannot be changed by PUT request
- [ ] **8.11** Write test: "should return complete translation object" - verify response includes all expected fields per ManualTranslationResponse type
- [ ] **8.12** Run all tests with `npm test` and verify 100% pass rate for acceptance criteria tests

---

## 9. Add Type Exports for Epic 5 UI Components

**Context:** Epic 5 UI components (Translation Editor, Preview Panel) need to import types from this endpoint. Ensure the ManualTranslationResponse type is properly exported and documented.

**Files to modify:**
- `/src/app/api/translations/[entityType]/[entityId]/[language]/route.ts`

**Estimated effort:** 1 story point

- [ ] **9.1** Verify ManualTranslationResponse interface (lines 60-71) includes reviewedBy field
- [ ] **9.2** Ensure ManualTranslationResponse is exported (check if `export` keyword is present)
- [ ] **9.3** If not exported, add `export` keyword before the interface definition
- [ ] **9.4** Similarly check and export ManualTranslationApiResponse type (line 81)
- [ ] **9.5** Add JSDoc comment above ManualTranslationResponse explaining this is used by Epic 5 UI components
- [ ] **9.6** Document in the JSDoc which entity types support reviewedBy field (items, articles, links) vs. which don't (tags)
- [ ] **9.7** Create a type alias `export type { ManualTranslationResponse, ManualTranslationApiResponse }` at the bottom of the type definitions section
- [ ] **9.8** Run `npx tsc --noEmit` to verify types are correctly exported
- [ ] **9.9** Consider creating an index.ts file at `/src/app/api/translations/types.ts` to centralize API type exports (optional)
- [ ] **9.10** Document the export path in file comments for UI developers: "Import from '@/app/api/translations/[entityType]/[entityId]/[language]/route'"

---

## 10. Verify CORS Headers for Epic 5 UI Consumption

**Context:** Epic 5 dashboard UI components will call this endpoint from the same domain, but verify CORS headers are appropriate for the usage pattern.

**Files to modify:**
- `/src/app/api/translations/[entityType]/[entityId]/[language]/route.ts`

**Estimated effort:** 1 story point

- [ ] **10.1** Locate the OPTIONS handler function (lines 712-721) for CORS preflight
- [ ] **10.2** Verify OPTIONS handler returns status 204 (no content)
- [ ] **10.3** Verify Access-Control-Allow-Methods includes 'PUT' method
- [ ] **10.4** Verify Access-Control-Allow-Headers includes 'Content-Type, Authorization'
- [ ] **10.5** Check if Access-Control-Allow-Origin header is needed (usually not for same-origin requests)
- [ ] **10.6** Verify PUT response includes appropriate cache headers (should be Cache-Control: no-store for dynamic content)
- [ ] **10.7** Test CORS manually by making OPTIONS request followed by PUT request from browser console
- [ ] **10.8** Verify no CORS errors appear in browser console during manual test
- [ ] **10.9** Document CORS configuration in file comments if any specific settings are required for Epic 5
- [ ] **10.10** Ensure no rate limiting concerns exist for translation editing workflows (Epic 5 users may edit multiple translations in succession)

---

## 11. Update Regenerate TypeScript Database Types

**Context:** After adding reviewed_by columns to item_translations and link_translations, regenerate TypeScript types from Supabase schema to ensure type safety.

**Files to modify:**
- `/src/types/database.generated.ts` (regenerated)

**Estimated effort:** 1 story point

- [ ] **11.1** Use Supabase MCP `generate_typescript_types` tool to regenerate database types
- [ ] **11.2** Save the regenerated types to `/src/types/database.generated.ts` (overwrite existing file)
- [ ] **11.3** Verify the item_translations table type now includes `reviewed_by: string | null` field
- [ ] **11.4** Verify the link_translations table type now includes `reviewed_by: string | null` field
- [ ] **11.5** Verify the article_translations table type still has `reviewed_by: string | null` field
- [ ] **11.6** Run `npx tsc --noEmit` to verify no type errors after regeneration
- [ ] **11.7** Check if any other files need updates due to the new types (unlikely, but verify)
- [ ] **11.8** Update any import statements if the type structure changed
- [ ] **11.9** Run `npm run build` to ensure the project builds successfully with new types
- [ ] **11.10** Commit the regenerated types file with message: "[REQ-E05-002] Regenerate database types for reviewed_by columns"

---

## 12. Final Verification and Documentation

**Context:** Perform end-to-end verification that all Epic 5 requirements are met and document the completion of the enhancement.

**Files to modify:**
- `/src/app/api/translations/[entityType]/[entityId]/[language]/route.ts`

**Estimated effort:** 1 story point

- [ ] **12.1** Run complete test suite with `npm test` and verify 100% pass rate
- [ ] **12.2** Run type check with `npx tsc --noEmit` and verify zero errors
- [ ] **12.3** Run build with `npm run build` and verify successful compilation
- [ ] **12.4** Run lint with `npm run lint` and fix any issues
- [ ] **12.5** Manually test PUT request for item translation with curl or Postman, verify reviewed_by is populated
- [ ] **12.6** Manually test PUT request for article translation, verify reviewed_by is populated
- [ ] **12.7** Manually test PUT request for link translation, verify reviewed_by is populated
- [ ] **12.8** Manually test PUT request for tag translation, verify it works without reviewed_by
- [ ] **12.9** Verify all Epic 5 acceptance criteria from REQ-E05-002 are satisfied (cross-check against requirements)
- [ ] **12.10** Add a "CHANGELOG" comment section in the file documenting the Epic 5 enhancements made
- [ ] **12.11** Document any known limitations (e.g., tag_translations doesn't support reviewed_by)
- [ ] **12.12** Commit all changes with message: "[REQ-E05-002] Complete update translation endpoint Epic 5 enhancements"

---

## Status Tracking

**Overall Status:** PENDING
**Phase:** Verification and Enhancement
**Estimated Total Effort:** 12 story points
**Completion:** 0/12 tasks completed

---

## Notes for Implementation Agent

1. **Existing Code**: The endpoint exists and works. Do NOT rewrite it from scratch. Only make the specific enhancements described.

2. **Database Schema**: After task 2, the schema will have:
   - `article_translations.reviewed_by` (existed from Epic 1)
   - `item_translations.reviewed_by` (NEW in this task)
   - `link_translations.reviewed_by` (NEW in this task)
   - `tag_translations` does NOT get reviewed_by (different schema pattern)

3. **Testing**: Mock Supabase client for unit tests. Do not connect to real database in tests.

4. **Type Safety**: After regenerating types (task 11), TypeScript will enforce the new schema. Ensure all upsert operations match.

5. **Backward Compatibility**: Changes are additive only. Existing Epic 3 functionality must continue to work.

6. **Manual Testing**: Use a tool like curl or Postman to test the actual endpoint behavior after changes:
   ```bash
   curl -X PUT https://localhost:3000/api/translations/item/[item-id]/fr \
     -H "Authorization: Bearer [token]" \
     -H "Content-Type: application/json" \
     -d '{"name": "Test translation", "description": "Test description"}'
   ```

7. **Verification Approach**: Task 1 is read-only verification. Tasks 2-4 make the actual changes. Tasks 7-8 add tests. Tasks 9-12 handle documentation and final verification.

---

*Document created: 2026-01-22 22:35*
