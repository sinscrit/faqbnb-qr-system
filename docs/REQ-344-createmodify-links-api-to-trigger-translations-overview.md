# REQ-344: Create/Modify Links API to Trigger Translations - Implementation Overview
*Generated: 2026-01-19 15:45:00 UTC*
*Last Modified: 2026-01-19 15:45:00 UTC*

## Reference
- **Request**: REQ-344 (Modify Links API to Trigger Translations)
- **Source**: docs/gen_requests_epic3.md
- **Implementation Plan**: docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md
- **Type**: Enhancement
- **Phase**: 2 - Modify Existing Content APIs
- **Task ID**: 2.4
- **Size**: M

## Goals
1. Create/Modify the Links API POST handler to queue link title translations after successful link creation
2. Modify the Links API PUT handler to delete existing link translations before queuing new ones
3. Ensure translation queueing uses the content translation orchestrator
4. Links API responses return immediately without waiting for translation jobs to complete
5. Ensure translation queueing failures do not block link CRUD operations
6. Source language is determined using the standard source language detection utility
7. Translation workflow covers all supported languages configured in the system

## Context from Implementation Plan

### Task Description (Task 2.4)
Per the implementation plan, this task creates/modifies the Links API to automatically trigger translations:

```
- [ ] **Task 2.4:** Create/Modify Links API to trigger translations
  - File: `/src/app/api/admin/items/[id]/links/route.ts`
  - **POST handler:**
    - Queue link title translation after creation
  - **PUT handler:**
    - Delete existing link translations
    - Queue new translations
```

### Task Dependencies
- **Task 2.1** (Source Language Detection): Must be completed first - provides `detectSourceLanguage()` utility
- **Task 1.2** (Content Translation Orchestrator): Must be completed first - provides `queueContentTranslations()` function
- **Task 1.1** (Content Translation Types): Must be completed first - provides type definitions
- **Task 1.3** (Link Trigger): Must be completed first - provides `triggerLinkTranslation()` function
- **Epic 1** (Foundation): Translation tables and translation service must exist

### Related Tasks
- **Task 2.2** (Items API): Similar pattern for item translations
- **Task 2.3** (Articles API): Similar pattern for article translations
- **Task 3.4** (Link Translation Processor): Processes the queued link translation jobs

### Data Flow (From Implementation Plan)
```
Link Save Request
    |
    v
API Route (items/[id]/links/route.ts)
    |
    +-- 1. Save link record
    |
    +-- 2. Delete existing translations (if update)
    |
    +-- 3. Queue translation jobs (5 target languages)
    |       |
    |       +-- Insert into translation_jobs table
    |           - entity_type: 'link'
    |           - entity_id: UUID (link id)
    |           - source_language: detected from user/account
    |           - target_language: each of 5 other languages
    |           - status: 'queued'
    |           - priority: based on job type
    |
    +-- 4. Return success immediately
            |
            +-- Response includes translationJobIds
```

## Implementation Order

### Step 1: Create Links API Route File
The links API route doesn't currently exist. Create the new file at `/src/app/api/admin/items/[id]/links/route.ts`.

**Note**: The existing codebase uses `[publicId]` for item routes. Verify if this should be `[publicId]` or `[id]` - check existing patterns in the items API.

### Step 2: Implement GET Handler
Return all links for a specific item.

**Implementation:**
1. Validate admin authentication using `validateAdminAuth`
2. Get account context using `getAccountContext`
3. Validate item access within account context
4. Fetch links from `item_links` table for the given item
5. Return links array with proper typing

### Step 3: Implement POST Handler with Translation Triggering
Create new link and queue translations.

**Implementation:**
1. Validate admin authentication
2. Get account context
3. Validate item access
4. Validate link data (title, url, linkType)
5. Insert link into `item_links` table
6. Call `queueContentTranslations` for link title
7. Include `translationJobIds` in response
8. Wrap translation logic in try-catch to prevent blocking main operation

### Step 4: Implement PUT Handler with Translation Deletion and Re-queuing
Update existing link and re-queue translations.

**Implementation:**
1. Validate admin authentication
2. Get account context
3. Validate item access and link ownership
4. Delete existing translations from `link_translations` table
5. Update link in `item_links` table
6. Call `queueContentTranslations` for updated link title
7. Include `translationJobIds` in response
8. Wrap translation logic in try-catch

### Step 5: Implement DELETE Handler
Delete link (cascade will handle translation records).

**Implementation:**
1. Validate admin authentication
2. Get account context
3. Validate item access and link ownership
4. Delete link from `item_links` table
5. Return success response

### Step 6: Verification
- Run TypeScript compilation to verify no errors
- Test link creation triggers translation jobs
- Test link update deletes old translations and creates new jobs
- Verify main operations succeed even if translation queueing fails

## Authorized Files and Functions for Modification

### Files to Create

#### `/src/app/api/admin/items/[publicId]/links/route.ts` (NEW FILE)
- **Purpose**: CRUD operations for item links with translation triggering
- **Handlers to implement**:
  - `GET` - List all links for an item
  - `POST` - Create new link with translation queueing
  - `PUT` - Update link with translation deletion and re-queueing
  - `DELETE` - Delete link

### Files to Modify (Optional Type Updates)

#### `/src/types/index.ts`
- **Purpose**: Add link-specific translation response types if needed
- **Potential additions**:
  - Add `translationJobIds?: string[]` to link response structure (if creating new response type)

### New Dependencies to Import

```typescript
// In the new route file, add these imports:
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase-server';
import { validateAdminAuth } from '@/lib/auth-server';
import {
  queueContentTranslations,
  detectSourceLanguage,
  type QueueTranslationResult
} from '@/lib/content-translation';
```

### Database Operations

#### Translation Deletion (PUT handler only)
```typescript
// Delete existing translations for this link before update
const { error: deleteTranslationsError } = await supabase
  .from('link_translations')
  .delete()
  .eq('link_id', linkId);

if (deleteTranslationsError) {
  console.error('Failed to delete existing link translations:', deleteTranslationsError);
  // Continue with update - don't fail the main operation
}
```

#### Translation Queueing (POST and PUT handlers)
```typescript
// Queue translations for link title
let translationJobIds: string[] = [];
try {
  const sourceLanguage = detectSourceLanguage(user, accountContext, undefined);

  const translationResult = await queueContentTranslations({
    content: {
      entityType: 'link',
      entityId: newLink.id, // or updatedLink.id for PUT
      sourceLanguage,
      fields: [
        {
          fieldName: 'title',
          value: newLink.title,
          context: { contentType: 'link_title', domain: 'property_rental' },
          maxLength: 255
        }
        // Note: URLs are NOT translated - only the title field
      ]
    },
    trigger: 'create' // or 'update' for PUT
  });

  if (translationResult.success) {
    translationJobIds = translationResult.jobIds;
    console.log(`Queued ${translationJobIds.length} translation jobs for link ${newLink.id}`);
  } else {
    console.error('Link translation queueing failed:', translationResult.error);
  }
} catch (translationError) {
  console.error('Error queueing link translations:', translationError);
  // Don't fail the link creation/update - translations can be retried later
}
```

### Existing Files (Read-Only Reference)
These files will be imported from but NOT modified:
- `/src/lib/content-translation/index.ts` - Module exports
- `/src/lib/content-translation/content-translation.ts` - queueContentTranslations function
- `/src/lib/content-translation/source-language.ts` - detectSourceLanguage function
- `/src/lib/content-translation/triggers/link-trigger.ts` - triggerLinkTranslation function
- `/src/app/api/admin/items/[publicId]/route.ts` - Reference for authentication patterns
- `/src/app/api/admin/items/route.ts` - Reference for getAccountContext pattern

## Technical Specifications

### Route Structure
Following existing patterns in the codebase, the route will be:
```
/api/admin/items/[publicId]/links
```

Note: The implementation plan specifies `[id]` but existing item routes use `[publicId]`. Use `[publicId]` to match existing patterns.

### Request/Response Contracts

#### GET `/api/admin/items/[publicId]/links`
**Response:**
```typescript
{
  success: boolean;
  data?: {
    id: string;
    itemId: string;
    title: string;
    linkType: 'youtube' | 'pdf' | 'image' | 'text' | 'video';
    url: string;
    thumbnailUrl?: string;
    displayOrder: number;
    createdAt: string;
  }[];
  error?: string;
  accountContext?: {
    accountId: string | null;
    accountRole: string;
  };
}
```

#### POST `/api/admin/items/[publicId]/links`
**Request:**
```typescript
{
  title: string;
  linkType: 'youtube' | 'pdf' | 'image' | 'text' | 'video';
  url: string;
  thumbnailUrl?: string;
  displayOrder?: number;
  articleId?: string;  // Optional association with article
}
```

**Response:**
```typescript
{
  success: boolean;
  data?: {
    id: string;
    itemId: string;
    title: string;
    linkType: string;
    url: string;
    thumbnailUrl?: string;
    displayOrder: number;
    createdAt: string;
    // NEW: Translation job tracking
    translationJobIds?: string[];
  };
  error?: string;
  accountContext?: {...};
}
```

#### PUT `/api/admin/items/[publicId]/links/[linkId]` or PUT body with link ID
**Request:**
```typescript
{
  id: string;  // Link ID to update
  title: string;
  linkType: 'youtube' | 'pdf' | 'image' | 'text' | 'video';
  url: string;
  thumbnailUrl?: string;
  displayOrder?: number;
}
```

**Response:** Same as POST response

#### DELETE `/api/admin/items/[publicId]/links/[linkId]` or DELETE body with link ID
**Response:**
```typescript
{
  success: boolean;
  message?: string;
  deletedLink?: {
    id: string;
    title: string;
  };
  accountContext?: {...};
}
```

### Translation Context (From Implementation Plan)
```typescript
const LINK_TRANSLATION_CONTEXT = {
  link_title: {
    contentType: 'link_title' as const,
    domain: 'property_rental_media',
    systemPrompt: 'Translate a media link title (video, PDF, etc.) for vacation rental guests. Keep it descriptive but concise.'
  }
};
```

### Link Fields for Translation
Per the implementation plan, only the `title` field is translated for links:
- **title**: Translatable - human-readable description of the link
- **url**: NOT translated - URLs are universal
- **thumbnailUrl**: NOT translated - URLs are universal
- **linkType**: NOT translated - enum value, not user-facing text

### Supported Languages
Per Epic 1 configuration:
- English (en) - default
- French (fr)
- Spanish (es)
- German (de)
- Dutch (nl)
- Italian (it)

Source language is excluded from target languages (5 translations per link).

## Success Validation Checklist

### Route Creation
- [ ] New file created at `/src/app/api/admin/items/[publicId]/links/route.ts`
- [ ] TypeScript compilation succeeds without errors
- [ ] All handlers export properly (GET, POST, PUT, DELETE)

### GET Handler
- [ ] Returns all links for the specified item
- [ ] Validates admin authentication
- [ ] Respects account context filtering
- [ ] Returns 404 if item not found
- [ ] Returns 403 if access denied

### POST Handler
- [ ] Creates link in `item_links` table
- [ ] Validates required fields (title, linkType, url)
- [ ] Validates URL format
- [ ] Validates linkType is one of allowed values
- [ ] Calls `queueContentTranslations` after link creation
- [ ] Uses `detectSourceLanguage` for source language
- [ ] Includes `translationJobIds` in success response
- [ ] Link creation succeeds even if translation queueing fails
- [ ] Logs translation errors for debugging
- [ ] Does not expose internal errors to client

### PUT Handler
- [ ] Validates link exists and belongs to item
- [ ] Deletes existing `link_translations` before update
- [ ] Translation deletion failure doesn't block update
- [ ] Updates link successfully before queueing translations
- [ ] Calls `queueContentTranslations` after link update
- [ ] Uses `detectSourceLanguage` for source language
- [ ] Includes `translationJobIds` in success response
- [ ] Link update succeeds even if translation queueing fails
- [ ] Logs translation errors for debugging

### DELETE Handler
- [ ] Validates link exists and belongs to item
- [ ] Deletes link from `item_links` table
- [ ] Cascade deletes handle `link_translations` records
- [ ] Returns success with deleted link info

### Database Verification
- [ ] link_translations records are deleted on link update
- [ ] translation_jobs records are created for each target language
- [ ] Job records have correct entity_type='link'
- [ ] Job records have correct entity_id matching link.id
- [ ] Job records have appropriate priority (100 for create, 50 for update)

## Error Handling Strategy

### Translation Failures Should NOT Block Link Operations
```typescript
// Pattern to follow:
try {
  // Translation queueing logic
} catch (translationError) {
  // Log error for debugging
  console.error('Link translation queueing error:', translationError);
  // Continue with success response - link was saved
  // translationJobIds will be empty array
}
```

### Response Always Includes translationJobIds
```typescript
// Even on translation failure, include the field
const response = {
  success: true,
  data: {
    // ... link data ...
    translationJobIds: translationJobIds // May be empty array
  }
};
```

### Validation Errors
```typescript
// Return 400 for invalid input
if (!body.title || !body.url || !body.linkType) {
  return NextResponse.json(
    { success: false, error: 'Missing required fields: title, url, linkType' },
    { status: 400 }
  );
}

// Validate URL format
try {
  new URL(body.url);
} catch {
  return NextResponse.json(
    { success: false, error: `Invalid URL: ${body.url}` },
    { status: 400 }
  );
}

// Validate linkType
const validLinkTypes = ['youtube', 'pdf', 'image', 'text', 'video'];
if (!validLinkTypes.includes(body.linkType)) {
  return NextResponse.json(
    { success: false, error: `Invalid link type: ${body.linkType}` },
    { status: 400 }
  );
}
```

## Notes

### File Naming Consideration
The implementation plan specifies `[id]` but the existing codebase uses `[publicId]` for item routes. This document assumes `[publicId]` for consistency with existing patterns. Verify during implementation.

### Existing Link Management in Items API
Currently, links are managed through the main items API (POST/PUT handlers in `/src/app/api/admin/items/route.ts` and `/src/app/api/admin/items/[publicId]/route.ts`). This new dedicated links API provides:
- Direct CRUD operations on individual links
- Cleaner API for single-link operations
- Easier integration with translation workflow
- Better separation of concerns

### Backward Compatibility
- New API endpoint - no breaking changes to existing functionality
- Items API continues to work for bulk link operations
- `translationJobIds` is optional in response - clients can ignore it

### Performance Considerations
- Translation queueing is fast (just inserts to job queue)
- Actual translation happens asynchronously via job processor
- API response time not significantly impacted
- Single link translation = 5 job queue inserts (one per target language)

### Testing Approach
Per implementation plan Task 7.1:
- Unit tests for link translation triggering logic
- Integration tests for link creation with translations
- Verify jobs are created in translation_jobs table with entity_type='link'
- Verify translations are deleted before update

## Dependencies
- Epic 1 Foundation: Translation tables, translation service (REQUIRED)
- Task 1.1: Content Translation Types (REQUIRED)
- Task 1.2: Content Translation Orchestrator (REQUIRED)
- Task 1.3: Link Trigger utility (REQUIRED)
- Task 2.1: Source Language Detection (REQUIRED)
- Next.js 15.5.9, TypeScript 5.x (existing in project)
- Supabase client for database operations (existing in project)

## Risk Assessment
- **Risk Level**: Low
- **Rationale**:
  - New file creation - no modifications to existing functionality
  - Non-blocking approach means main operations always succeed
  - Well-established patterns from similar APIs (items, articles)
  - Translation can be retried via REQ-329 retry endpoint
  - Comprehensive error logging for debugging
  - Follows existing authentication/authorization patterns

## Acceptance Criteria Mapping (From PRD)

| PRD Criteria | Implementation |
|--------------|----------------|
| AC-1: New link triggers translation to 5 languages | POST handler calls queueContentTranslations |
| AC-1: Source language is recorded correctly | detectSourceLanguage utility |
| AC-2: Updated content re-triggers translation | PUT handler calls queueContentTranslations |
| AC-2: Old translations are replaced | PUT handler deletes existing link_translations |
| AC-2: Update doesn't block user action | try-catch wrapper, non-blocking approach |

## Acceptance Criteria (From gen_requests_epic3.md)

- [ ] POST handler queues link title translation after successful creation
- [ ] PUT handler deletes existing link translations before queueing new ones
- [ ] Translation queueing uses the content translation orchestrator
- [ ] Links API responses return immediately without waiting for translation jobs to complete
- [ ] Errors in translation queueing do not prevent link creation or update from succeeding
- [ ] Source language is determined using the standard source language detection utility
- [ ] Translation workflow covers all supported languages configured in the system
