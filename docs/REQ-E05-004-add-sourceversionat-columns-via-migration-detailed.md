# Add source_version_at Columns via Migration - Detailed Implementation Tasks

**Generated:** 2026-01-22 23:05
**Reference Documents:**
- Requirements: docs/gen_requests_epic5.md (REQ-E05-004)
- Overview: docs/REQ-E05-004-add-sourceversionat-columns-via-migration-overview.md
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

This task adds `source_version_at` columns to translation tables to enable stale translation detection. When source content is updated, the system can compare the source's `updated_at` timestamp with the translation's `source_version_at` to determine if the translation is outdated.

**Key Points:**
- Small, low-risk schema addition (nullable columns only)
- Enables Epic 5's stale translation detection features
- No data backfill needed (NULL for existing records)
- Idempotent migration (can be run multiple times safely)
- After migration, TypeScript types must be regenerated

**Affected Tables:**
- `item_translations` - translations for items (name, description)
- `article_translations` - translations for articles (title, description)
- `link_translations` - translations for links (title) - included for consistency per implementation plan

---

## 1. Design Migration SQL Script

**Context:** Create the SQL migration script with column additions and index creation. Use idempotent operations (IF NOT EXISTS) to allow safe re-runs.

**Files to modify:**
- None (SQL script prepared for MCP tool)

**Estimated effort:** 1 story point

- [ ] **1.1** Create SQL migration script content with header comment: migration name `add_source_version_at_columns`, description, date 2026-01-22
- [ ] **1.2** Add SQL statement: `ALTER TABLE item_translations ADD COLUMN IF NOT EXISTS source_version_at TIMESTAMPTZ;`
- [ ] **1.3** Add SQL statement: `ALTER TABLE article_translations ADD COLUMN IF NOT EXISTS source_version_at TIMESTAMPTZ;`
- [ ] **1.4** Add SQL statement: `ALTER TABLE link_translations ADD COLUMN IF NOT EXISTS source_version_at TIMESTAMPTZ;` (per implementation plan recommendation)
- [ ] **1.5** Add comment explaining column purpose: "Stores timestamp of source content at time of translation for stale detection"
- [ ] **1.6** Add SQL statement: `CREATE INDEX IF NOT EXISTS idx_item_translations_source_version ON item_translations(source_version_at);`
- [ ] **1.7** Add SQL statement: `CREATE INDEX IF NOT EXISTS idx_article_translations_source_version ON article_translations(source_version_at);`
- [ ] **1.8** Add SQL statement: `CREATE INDEX IF NOT EXISTS idx_link_translations_source_version ON link_translations(source_version_at);`
- [ ] **1.9** Add comment explaining index purpose: "Enables efficient queries for stale translation detection"
- [ ] **1.10** Review SQL script for correctness: column names, table names, syntax
- [ ] **1.11** Verify all statements use IF NOT EXISTS for idempotency
- [ ] **1.12** Verify no NOT NULL constraints are added (nullable for backward compatibility)

---

## 2. Apply Migration via Supabase MCP Tool

**Context:** Execute the migration using Supabase MCP's `apply_migration` tool, which tracks migrations and ensures proper execution.

**Files to modify:**
- Database schema via Supabase MCP

**Estimated effort:** 1 story point

- [ ] **2.1** Call `mcp__supabase__apply_migration` tool with migration name "add_source_version_at_columns"
- [ ] **2.2** Pass the complete SQL script from task 1 as the query parameter
- [ ] **2.3** Verify the MCP tool returns success response without errors
- [ ] **2.4** Check for any warnings in the response (e.g., "relation already exists" is OK with IF NOT EXISTS)
- [ ] **2.5** Log the migration result for audit trail
- [ ] **2.6** If migration fails with error, analyze the error message and determine if it's safe to retry
- [ ] **2.7** If migration fails due to missing table, verify translation tables exist from Epic 1
- [ ] **2.8** If migration succeeds partially (some statements succeed, some fail), determine next steps
- [ ] **2.9** Verify migration is recorded in Supabase's migration tracking (check response metadata)
- [ ] **2.10** Document migration completion timestamp and any issues encountered

---

## 3. Verify Column Creation

**Context:** Query the database information schema to confirm columns were created with correct properties (type, nullable, default).

**Files to modify:**
- None (verification only)

**Estimated effort:** 1 story point

- [ ] **3.1** Use `mcp__supabase__execute_sql` to query `information_schema.columns` for the new columns
- [ ] **3.2** Query SQL: `SELECT table_name, column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name IN ('item_translations', 'article_translations', 'link_translations') AND column_name = 'source_version_at' ORDER BY table_name;`
- [ ] **3.3** Verify result contains exactly 3 rows (one for each table)
- [ ] **3.4** Verify `data_type` is "timestamp with time zone" for all rows
- [ ] **3.5** Verify `is_nullable` is "YES" for all rows
- [ ] **3.6** Verify `column_default` is NULL for all rows (no default value set)
- [ ] **3.7** If any verification fails, document the discrepancy and determine if migration needs to be re-run
- [ ] **3.8** Use `mcp__supabase__list_tables` to inspect item_translations table structure
- [ ] **3.9** Verify source_version_at appears in the columns list for item_translations
- [ ] **3.10** Repeat verification for article_translations and link_translations tables
- [ ] **3.11** Log successful verification: "Column creation verified for all 3 tables"
- [ ] **3.12** If link_translations was not included in migration, document that only 2 tables were modified

---

## 4. Verify Index Creation

**Context:** Query PostgreSQL system catalogs to confirm indexes were created and have expected structure.

**Files to modify:**
- None (verification only)

**Estimated effort:** 1 story point

- [ ] **4.1** Use `mcp__supabase__execute_sql` to query `pg_indexes` for the new indexes
- [ ] **4.2** Query SQL: `SELECT tablename, indexname, indexdef FROM pg_indexes WHERE tablename IN ('item_translations', 'article_translations', 'link_translations') AND indexname LIKE '%source_version%' ORDER BY tablename;`
- [ ] **4.3** Verify result contains exactly 3 rows (one index per table)
- [ ] **4.4** Verify index names match expected pattern: `idx_item_translations_source_version`, `idx_article_translations_source_version`, `idx_link_translations_source_version`
- [ ] **4.5** Verify `indexdef` contains the column name `source_version_at` for each index
- [ ] **4.6** Verify indexes are using B-tree (default index type, should be in indexdef)
- [ ] **4.7** Query index size: `SELECT schemaname, tablename, indexname, pg_size_pretty(pg_relation_size(indexrelid)) as index_size FROM pg_stat_user_indexes WHERE indexname LIKE '%source_version%';`
- [ ] **4.8** Log index sizes for monitoring (should be small initially since all values are NULL)
- [ ] **4.9** If any index verification fails, document the issue and determine if migration needs correction
- [ ] **4.10** Log successful verification: "Index creation verified for all 3 tables"

---

## 5. Verify Existing Data Integrity

**Context:** Confirm existing translation records were not affected by migration and have NULL value for new column.

**Files to modify:**
- None (verification only)

**Estimated effort:** 1 story point

- [ ] **5.1** Query sample of existing item_translations records: `SELECT id, item_id, language, source_version_at FROM item_translations LIMIT 10;`
- [ ] **5.2** Verify all records have `source_version_at = NULL`
- [ ] **5.3** Count total records with non-NULL source_version_at: `SELECT COUNT(*) FROM item_translations WHERE source_version_at IS NOT NULL;` - should be 0
- [ ] **5.4** Repeat verification for article_translations table
- [ ] **5.5** Repeat verification for link_translations table
- [ ] **5.6** Verify record count did not change: `SELECT COUNT(*) FROM item_translations;` should match pre-migration count
- [ ] **5.7** Verify no records were deleted or modified unintentionally
- [ ] **5.8** Query for any anomalies: records with unexpected values in other columns
- [ ] **5.9** If any data integrity issues found, document and escalate immediately
- [ ] **5.10** Log successful verification: "Existing data integrity confirmed - all source_version_at values are NULL"

---

## 6. Test Migration Idempotency

**Context:** Verify migration can be run multiple times without errors (important for deployment safety).

**Files to modify:**
- None (testing only)

**Estimated effort:** 1 story point

- [ ] **6.1** Re-run the migration using `mcp__supabase__apply_migration` with the same SQL script
- [ ] **6.2** Verify the second run returns success without errors
- [ ] **6.3** Check for expected informational messages like "relation already exists" or "skipping duplicate"
- [ ] **6.4** Verify column properties did not change after second run (query information_schema.columns again)
- [ ] **6.5** Verify index properties did not change (query pg_indexes again)
- [ ] **6.6** Verify no duplicate columns were created (should still be 1 source_version_at column per table)
- [ ] **6.7** Verify no duplicate indexes were created (should still be 1 index per table)
- [ ] **6.8** Document that migration is idempotent and safe to re-run
- [ ] **6.9** Consider third run if needed to confirm consistent behavior
- [ ] **6.10** Log successful idempotency test: "Migration is idempotent - safe to re-run"

---

## 7. Regenerate TypeScript Database Types

**Context:** Update TypeScript types to include the new column so code can reference it with type safety.

**Files to modify:**
- `src/types/database.generated.ts` (regenerated file)

**Estimated effort:** 1 story point

- [ ] **7.1** Call `mcp__supabase__generate_typescript_types` tool to regenerate types
- [ ] **7.2** Verify tool returns success response
- [ ] **7.3** Read the regenerated `src/types/database.generated.ts` file
- [ ] **7.4** Search for `ItemTranslation` interface (or similar) in the generated types
- [ ] **7.5** Verify `source_version_at` field exists with type `string | null` in ItemTranslation
- [ ] **7.6** Search for `ArticleTranslation` interface in the generated types
- [ ] **7.7** Verify `source_version_at` field exists with type `string | null` in ArticleTranslation
- [ ] **7.8** Search for `LinkTranslation` interface (if exists) in the generated types
- [ ] **7.9** Verify `source_version_at` field exists with type `string | null` in LinkTranslation
- [ ] **7.10** Run `npx tsc --noEmit` to verify no TypeScript compilation errors after type regeneration
- [ ] **7.11** Check for any breaking changes in other interfaces (should be none)
- [ ] **7.12** Commit the regenerated types file with message: "[REQ-E05-004] Regenerate types for source_version_at columns"

---

## 8. Create Rollback Migration Script

**Context:** Document how to rollback the migration if needed (remove columns and indexes). Best practice for production safety.

**Files to modify:**
- None (documentation only, not applied)

**Estimated effort:** 1 story point

- [ ] **8.1** Create rollback SQL script with header comment: "Rollback for add_source_version_at_columns migration"
- [ ] **8.2** Add SQL statement: `DROP INDEX IF EXISTS idx_item_translations_source_version;`
- [ ] **8.3** Add SQL statement: `DROP INDEX IF EXISTS idx_article_translations_source_version;`
- [ ] **8.4** Add SQL statement: `DROP INDEX IF EXISTS idx_link_translations_source_version;`
- [ ] **8.5** Add SQL statement: `ALTER TABLE item_translations DROP COLUMN IF EXISTS source_version_at;`
- [ ] **8.6** Add SQL statement: `ALTER TABLE article_translations DROP COLUMN IF EXISTS source_version_at;`
- [ ] **8.7** Add SQL statement: `ALTER TABLE link_translations DROP COLUMN IF EXISTS source_version_at;`
- [ ] **8.8** Add comment explaining rollback procedure and when to use it
- [ ] **8.9** Document rollback script in migration comment or separate rollback file
- [ ] **8.10** Test rollback script syntax (do NOT apply it, just verify SQL is valid)
- [ ] **8.11** Document rollback script location for future reference
- [ ] **8.12** Note: Rollback should only be used if migration causes critical issues

---

## 9. Document Stale Translation Detection Query Pattern

**Context:** Provide example queries for developers who will implement stale translation detection features.

**Files to modify:**
- Migration comment or project documentation

**Estimated effort:** 1 story point

- [ ] **9.1** Document the stale translation detection query pattern for items
- [ ] **9.2** Example SQL: `SELECT t.* FROM item_translations t JOIN items i ON i.id = t.item_id WHERE t.source_version_at IS NOT NULL AND i.updated_at > t.source_version_at;`
- [ ] **9.3** Document the query pattern for articles: join article_translations with item_articles
- [ ] **9.4** Document the query pattern for links: join link_translations with item_links
- [ ] **9.5** Explain the NULL check: `WHERE source_version_at IS NOT NULL` filters out legacy translations
- [ ] **9.6** Explain the staleness condition: `i.updated_at > t.source_version_at` means source is newer
- [ ] **9.7** Document how to calculate staleness duration: `i.updated_at - t.source_version_at`
- [ ] **9.8** Provide example for counting stale translations per property
- [ ] **9.9** Document performance considerations: queries should use the new indexes
- [ ] **9.10** Add documentation to code comments or project README
- [ ] **9.11** Reference the Epic 5 features that will use these query patterns
- [ ] **9.12** Note that the Translation Status API (REQ-E05-001) will implement these queries

---

## 10. Update Translation Creation Code to Populate source_version_at

**Context:** Modify code that creates translations to populate the new column going forward. This ensures new translations capture source version timestamp.

**Files to modify:**
- `/src/lib/job-queue/job-processor.ts`
- `/src/app/api/translations/[entityType]/[entityId]/[language]/route.ts`

**Estimated effort:** 1 story point

- [ ] **10.1** Open `/src/lib/job-queue/job-processor.ts` and locate the function that saves translation results
- [ ] **10.2** Identify where translation records are inserted/upserted into translation tables
- [ ] **10.3** Before translation, fetch source entity's `updated_at` timestamp
- [ ] **10.4** Store source `updated_at` in variable: `const sourceVersionAt = sourceEntity.updated_at;`
- [ ] **10.5** In the translation record upsert, add field: `source_version_at: sourceVersionAt`
- [ ] **10.6** Verify upsert includes source_version_at for all entity types: items, articles, links
- [ ] **10.7** Open `/src/app/api/translations/[entityType]/[entityId]/[language]/route.ts` (manual override endpoint)
- [ ] **10.8** Locate PUT handler where manual translations are saved (lines 381-707)
- [ ] **10.9** Before upserting manual translation, fetch source entity's updated_at timestamp
- [ ] **10.10** Add `source_version_at` field to all upsert operations (items, articles, links)
- [ ] **10.11** For manual translations, use current source updated_at at time of edit
- [ ] **10.12** Run `npx tsc --noEmit` to verify no TypeScript errors after code changes

---

## 11. Write Test for source_version_at Population

**Context:** Create test to verify new translations correctly populate source_version_at field.

**Files to modify:**
- `/src/lib/job-queue/__tests__/job-processor.test.ts` (or create if doesn't exist)

**Estimated effort:** 1 story point

- [ ] **11.1** Locate or create test file for job processor
- [ ] **11.2** Write test: "should populate source_version_at when creating item translation"
- [ ] **11.3** Mock source item with `updated_at` timestamp
- [ ] **11.4** Execute translation job processing
- [ ] **11.5** Query resulting item_translations record
- [ ] **11.6** Assert `source_version_at` equals source item's `updated_at`
- [ ] **11.7** Write test: "should populate source_version_at when creating article translation"
- [ ] **11.8** Write test: "should populate source_version_at when creating link translation"
- [ ] **11.9** Write test: "should handle missing source updated_at gracefully" - verify NULL or current timestamp used as fallback
- [ ] **11.10** Run tests with `npm test` and verify all pass
- [ ] **11.11** Check test coverage for source_version_at logic
- [ ] **11.12** Add test for manual override endpoint populating source_version_at

---

## 12. Final Verification and Documentation

**Context:** Perform comprehensive end-to-end verification and document the completed migration.

**Files to modify:**
- None (verification and documentation)

**Estimated effort:** 1 story point

- [ ] **12.1** Run `npx tsc --noEmit` to verify no TypeScript errors across entire codebase
- [ ] **12.2** Run `npm run build` to verify project builds successfully
- [ ] **12.3** Run `npm test` to verify all tests pass
- [ ] **12.4** Query database one final time to confirm all columns and indexes exist
- [ ] **12.5** Create a test translation record with source_version_at populated and verify it's stored correctly
- [ ] **12.6** Test stale detection query manually: update source entity, verify query finds stale translation
- [ ] **12.7** Document migration completion in project changelog or migration log
- [ ] **12.8** Document that Epic 5 features can now use source_version_at for stale detection
- [ ] **12.9** Verify all acceptance criteria from REQ-E05-004 are satisfied
- [ ] **12.10** Create summary document listing: tables modified, columns added, indexes created, rollback procedure
- [ ] **12.11** Note any deviations from original plan (e.g., included link_translations)
- [ ] **12.12** Commit all code changes with message: "[REQ-E05-004] Add source_version_at columns and update translation creation code"

---

## Status Tracking

**Overall Status:** PENDING
**Phase:** Database Migration
**Estimated Total Effort:** 12 story points
**Completion:** 0/12 tasks completed

---

## Notes for Implementation Agent

1. **Migration Safety**: This is a low-risk additive migration. Columns are nullable, idempotent, and don't affect existing data.

2. **Table Coverage**: The requirements mention only `item_translations` and `article_translations`, but the implementation plan includes `link_translations` for consistency. **Follow the implementation plan and add to all three tables.**

3. **Type Regeneration**: After migration, TypeScript types MUST be regenerated. Old types won't include the new column.

4. **NULL Semantics**: Existing translations will have NULL `source_version_at`. This is intentional - it means "unknown version" or "legacy translation". Stale detection queries should always check `WHERE source_version_at IS NOT NULL`.

5. **Integration Points**: After this migration, these tasks need to use source_version_at:
   - REQ-E05-001: Translation Status API (query stale translations)
   - REQ-E05-010: Manual Edit Warning Dialog (detect stale manual edits)
   - Job processor: Populate column when creating translations

6. **Index Usage**: The single-column indexes on `source_version_at` support stale detection queries. Composite indexes (entity_id, source_version_at) can be added later if performance testing shows benefit.

7. **No Backfill**: Do NOT attempt to backfill source_version_at for existing translations. Leave them as NULL. The column will be populated going forward as new translations are created or updated.

8. **Testing Strategy**:
   - Tasks 3-6: Verification tests (query database to confirm schema)
   - Task 11: Unit tests for code changes
   - Task 12: End-to-end verification

9. **Rollback**: Task 8 creates rollback documentation but does NOT execute it. Only apply rollback if migration causes critical issues.

10. **Code Updates**: Task 10 updates code to populate the new column. This ensures new translations capture source version going forward.

---

*Document created: 2026-01-22 23:05*
