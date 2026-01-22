# Implementation Overview: Create Translation Status API Endpoint

## Header
| Field | Value |
|-------|-------|
| Request Reference | REQ-E05-001 |
| Source File | docs/gen_requests_epic5.md |
| Original Request Date | 2026-01-22 15:55 |
| Breakdown Created | 2026-01-22 18:43 |
| T-shirt Size | M |
| Estimated Effort | 4-6 hours |

## Goals

Create a new GET endpoint at `/api/translations/status/route.ts` that provides property owners with a comprehensive view of translation status across their content. This endpoint aggregates translation data with flexible filtering capabilities and returns both summary counts and item-level details.

**Technical Requirements:**
- Accept query parameters: `entityType`, `entityId`, `status`, `propertyId`
- Return summary counts (complete, pending, failed) per language
- Return item-level translation status details
- Enforce property ownership access validation via account_users table
- Handle authentication via existing `validateAdminAuth` pattern
- Use existing translation status tracking from Epic 1/Epic 3 tables

### Assumptions & Clarifications

- **Assumption**: This endpoint returns aggregated/summary status data, distinct from the existing `/api/translations/status/[entityType]/[entityId]/route.ts` which returns single-entity status
- **Assumption**: The existing `/api/translations/status/batch/route.ts` is for bulk entity lookup, whereas this endpoint provides dashboard-style summaries with filters
- **Assumption**: Property ownership validation follows the pattern in `/api/admin/items/route.ts` using the `account_users` table
- **Assumption**: Translation tables (`item_translations`, `article_translations`, `link_translations`, `tag_translations`) exist from Epic 1
- **Assumption**: `translation_jobs` table exists and tracks job status from Epic 3
- **Clarification needed**: Should this endpoint support pagination for large result sets?

## Implementation Plan

### Step 1: Create API Route File Structure
- **Description**: Set up the new API route file with proper TypeScript types and imports
- **Rationale**: Establish the foundation with correct file location and dependencies before implementing logic
- **Estimated Effort**: 30 minutes

Create `/src/app/api/translations/status/route.ts` with:
- Import statements for NextRequest, NextResponse, Supabase client, auth validation
- Import types from existing translation type files
- Export GET handler function
- Export OPTIONS handler for CORS

### Step 2: Implement Request Validation and Authentication
- **Description**: Validate user authentication and extract query parameters
- **Rationale**: Security-first approach ensures only authenticated users can access the endpoint
- **Estimated Effort**: 1 hour

Implementation details:
- Use `validateAdminAuth(request)` to authenticate user
- Extract and validate query parameters: `entityType`, `entityId`, `status`, `propertyId`
- Validate `entityType` against allowed values: 'item', 'article', 'link', 'tag'
- Validate `status` against allowed values: 'pending', 'processing', 'completed', 'failed', 'manual'
- Return 401 for unauthenticated requests
- Return 400 for invalid query parameters

### Step 3: Implement Property Access Validation
- **Description**: Validate user has access to requested property via account_users table
- **Rationale**: Enforce multi-tenant access control so users only see their own content
- **Estimated Effort**: 1 hour

Implementation details:
- If `propertyId` provided, query `account_users` table to verify user has access
- Join properties → accounts → account_users to validate ownership chain
- If no `propertyId` provided, fetch all properties user has access to via account_users
- Return 403 if user lacks access to requested property
- Use pattern from `/src/app/api/admin/items/route.ts` lines 17-90

### Step 4: Build Database Queries for Translation Status
- **Description**: Query translation tables and translation_jobs to gather status data
- **Rationale**: Combine data from multiple tables to provide comprehensive status view
- **Estimated Effort**: 2 hours

Implementation details:
- Query relevant entities (items, articles, links) filtered by propertyId
- For each entity type, query corresponding translation table:
  - `item_translations` for items
  - `article_translations` for articles
  - `link_translations` for links
  - `tag_translations` for tags
- Join with `translation_jobs` table to get pending/processing job counts
- Apply entityType and status filters if provided
- Use efficient batch queries to avoid N+1 problems
- Follow patterns from `/src/app/api/translations/status/batch/route.ts` for querying translation status

### Step 5: Aggregate Summary Counts
- **Description**: Calculate summary counts per language showing complete, pending, and failed translations
- **Rationale**: Provide owners with quick overview of translation coverage
- **Estimated Effort**: 1 hour

Implementation details:
- Group translations by language (fr, es, de, nl, it)
- Count translations by status for each language:
  - Complete: status = 'completed' OR 'manual'
  - Pending: job status = 'queued' OR 'processing'
  - Failed: translation_status = 'failed' OR job status = 'failed'
- Calculate missing translations (entities without translation records)
- Return summary object with per-language counts

### Step 6: Format Item-Level Status Response
- **Description**: Build array of entities with their translation status details
- **Rationale**: Enable UI to display item-by-item translation status
- **Estimated Effort**: 1 hour

Implementation details:
- For each entity, build status object containing:
  - entityType, entityId, entity name
  - sourceLanguage from entity's source_language column
  - translations object mapping each target language to its status
  - Include translatedAt timestamp if available
  - Include isStale flag (compare source updated_at with translation translated_at)
  - Include reviewedBy user ID if translation status is 'manual'
- Return items array maintaining database query order

### Step 7: Add Response Headers and Error Handling
- **Description**: Set appropriate cache headers and implement comprehensive error handling
- **Rationale**: Ensure reliable API behavior and proper caching for performance
- **Estimated Effort**: 30 minutes

Implementation details:
- Set `Cache-Control: no-store` for dynamic translation status
- Add CORS headers for cross-origin requests
- Wrap all logic in try-catch with proper error logging
- Return 500 with error message for unexpected failures
- Follow error response pattern from existing translation endpoints

## Authorized Files and Functions for Modification

> ⚠️ **APPROVED SCOPE**: Changes outside this list require review

### New Files to Create
| File | Target | Type |
|------|--------|------|
| `/src/app/api/translations/status/route.ts` | — | Create |
| `/src/app/api/translations/status/types.ts` | — | Create |

### Existing Files to Reference (Read-Only)
| File | Purpose |
|------|---------|
| `/src/lib/auth-server.ts` | Use `validateAdminAuth()` function |
| `/src/lib/supabase.ts` | Import Supabase client and types |
| `/src/app/api/translations/status/batch/route.ts` | Reference for translation query patterns |
| `/src/app/api/translations/status/batch/types.ts` | Reference for status aggregation logic |
| `/src/app/api/admin/items/route.ts` | Reference for property access validation pattern (lines 17-90) |
| `/src/types/translation-management.ts` | Import TranslationEntityType and related types |
| `/src/lib/content-translation/index.ts` | Reference `getEntityTranslationStatus` utility if needed |

## Dependencies

### Depends On (Completed First)
- **Epic 1 (Foundation)**: Translation tables must exist
  - Tables: `item_translations`, `article_translations`, `link_translations`, `tag_translations`, `translation_jobs`
  - Columns: `translation_status`, `translated_at`, `reviewed_by`, `language`
  - Source language columns: `items.source_language`, `item_articles.source_language`, `item_links.source_language`
- **Epic 3 (Dynamic Content Translation)**: Translation status tracking system
  - Translation status API utilities in `/src/lib/content-translation/`
  - Job queue system for tracking pending translations

### Blocks (Requires This First)
- **REQ-E05-004**: Translation Preview Panel UI - needs this endpoint to fetch status data
- **REQ-E05-007**: Translation Status Widget - needs summary counts from this endpoint
- **REQ-E05-008**: Translation Status Dashboard - needs filtered status results

### Parallel Safety
- **Files touched**: `/src/app/api/translations/status/route.ts` (new file)
- **Conflicts with**: None - this is a new API endpoint
- **Safe to parallelize with**:
  - REQ-E05-002 (Update Translation API) - different route
  - REQ-E05-003 (Re-translate API) - different route
  - Any UI component tasks that will consume this endpoint

### External Dependencies
- Supabase PostgreSQL database with RLS enabled
- Next.js 15.5.9 App Router API routes
- Existing authentication system via `validateAdminAuth`
- TypeScript 5.x with strict mode

## Risks and Considerations

### Potential Side Effects
- **Query performance**: Aggregating translation status across many entities could be slow
  - Mitigation: Add database indexes on translation_status columns (already planned in Epic 5)
  - Mitigation: Implement query result limits (e.g., max 100 entities)
  - Mitigation: Consider pagination for large result sets

- **Access control complexity**: Property → Account → User relationship traversal
  - Mitigation: Reuse proven pattern from `/src/app/api/admin/items/route.ts`
  - Mitigation: Add comprehensive logging for access denied cases

- **Stale detection accuracy**: Comparing timestamps to detect stale translations
  - Mitigation: Use `source_version_at` column from Epic 5 migration (Task 1.4)
  - Mitigation: Document that stale detection requires source_version_at to be populated

### Testing Requirements
- **Unit tests**:
  - Query parameter validation
  - Access control logic (user has/lacks property access)
  - Summary count aggregation logic

- **Integration tests**:
  - End-to-end request → response flow
  - Multiple entities with mixed translation statuses
  - Empty results when user has no properties
  - Filtering by entityType, status, propertyId

- **Performance tests**:
  - Response time with 50+ entities
  - Response time with multiple concurrent requests
  - Database query efficiency (check for N+1 issues)

### Open Questions
- [ ] Should this endpoint support pagination for large result sets? (Recommendation: Yes, add `limit` and `offset` query params)
- [ ] Should we cache summary counts for frequently accessed properties? (Recommendation: Start without caching, add if needed)
- [ ] Should the endpoint support sorting (e.g., by completion percentage, last updated)? (Recommendation: Defer to future iteration)
- [ ] Should failed translations include error messages in the response? (Recommendation: Yes, include last error message)

## Out of Scope

The following are explicitly **not** included in this task:
- Updating or modifying translation content (see REQ-E05-002)
- Triggering new translation jobs (see REQ-E05-003)
- Real-time status updates via WebSockets or Server-Sent Events
- Translation preview or comparison functionality
- Pagination UI components (endpoint can support pagination, but UI is separate)
- Translation history or audit trail
- Exporting translation status to CSV/Excel
- Filtering by date ranges or translation quality scores
- User preference management for default language

---
*Document generated: 2026-01-22 18:43*
