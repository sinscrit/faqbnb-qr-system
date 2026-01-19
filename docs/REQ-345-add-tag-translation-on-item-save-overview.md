# REQ-345: Add Tag Translation on Item Save - Implementation Overview

**Generated:** 2026-01-19 14:30:00 UTC
**Last Modified:** 2026-01-19 14:30:00 UTC
**Request Reference:** REQ-345 - Add Tag Translation on Item Save
**Plan Reference:** Plan-111-L10N-Epic3-Dynamic-Content-Translation.md (Phase 2, Task 2.5)
**Status:** Ready for Implementation

---

## 1. Request Summary

Modify the items API POST and PUT handlers to automatically trigger tag translation workflows when items are created or updated with user-defined tags. For each user tag in the `tags[]` array, check if translation exists; if not, queue a tag translation job. System tags (those starting with `#` or found in the `AVAILABLE_TAGS` constant) are skipped.

**Scope:**
- Modify `/src/app/api/admin/items/route.ts` POST handler to process tags after item creation
- Modify `/src/app/api/admin/items/[publicId]/route.ts` PUT handler to process tags after item update
- Filter out system tags from translation workflow
- Check for existing translations before queueing new jobs
- Queue tag translation jobs asynchronously (non-blocking)
- Handle errors gracefully without failing item operations

**Out of Scope:**
- Creating new tag trigger functions (REQ-262 / Task 1.4)
- Translation job processing (Phase 3 tasks)
- Translation storage utilities (Task 1.5)
- Translation status APIs (Phase 4 tasks)
- Modifying the item creation/update core logic
- Frontend changes

---

## 2. Current State Analysis

### Existing Technology Stack

| Technology | Version | Location |
|------------|---------|----------|
| Next.js | 15.5.9 | `package.json` |
| React | 19.1.0 | `package.json` |
| TypeScript | ^5 | `package.json` |
| Supabase | Latest | `@supabase/supabase-js`, `@supabase/ssr` |

### Relevant Existing Patterns

| Pattern | Location | Usage for REQ-345 |
|---------|----------|-------------------|
| Item POST handler | `/src/app/api/admin/items/route.ts:267-561` | Add tag translation trigger after line 502 |
| Item PUT handler | `/src/app/api/admin/items/[publicId]/route.ts:458-810` | Add tag translation trigger after line 752 |
| Tags field in item | `/src/app/api/admin/items/[publicId]/route.ts:623` | Existing `body.tags` processing |
| Tag trigger function | `/src/lib/content-translation/triggers/tag-trigger.ts` | `triggerTagTranslation()` from REQ-262 |
| System tags constant | `/src/components/ItemCreationWorkflow/utils/constants.ts` | `AVAILABLE_TAGS` (17 system tags) |
| Auth pattern | `/src/lib/auth-server.ts` | `validateAdminAuth` helper |

### Current Item POST Handler Flow (lines 267-561)

```
POST /api/admin/items
    │
    ├── Validate authentication (validateAdminAuth)
    ├── Get account context
    ├── Parse and validate request body
    ├── Validate property exists in account context
    ├── Create item in database
    ├── Create article if provided (REQ-151)
    ├── Create links if provided
    │
    └── Return success response (line 553)
        └── ⚠️ Tags NOT processed for translation
```

### Current Item PUT Handler Flow (lines 458-810)

```
PUT /api/admin/items/[publicId]
    │
    ├── Validate authentication
    ├── Get account context
    ├── Validate item access
    ├── Parse and validate request body
    ├── Validate property in account context
    ├── Update item in database (includes tags: body.tags || []) ← line 623
    ├── Delete existing links
    ├── Create new links if provided
    ├── Handle article creation/update (REQ-151)
    │
    └── Return success response (line 801)
        └── ⚠️ Tags NOT processed for translation
```

### System Tags (Pre-seeded - Should be Skipped)

From `/src/components/ItemCreationWorkflow/utils/constants.ts` (lines 352-370):

**17 System Tags:**
- Room: `kitchen`, `laundry`, `bedroom`, `bathroom`, `living-room`, `garage`, `outdoor`, `general`
- Item Type: `appliance`, `room-item`
- Purpose: `instructions`, `cleaning`, `troubleshooting`, `safety`, `maintenance`, `features`, `info`

**System Tag Identification:**
1. Tags in `AVAILABLE_TAGS` constant
2. Tags starting with `#` prefix (room tags in format `#room.roomname`)

### Dependencies from Previous Tasks

| Task | Expected Location | Required Components |
|------|-------------------|---------------------|
| REQ-262 (Task 1.4) | `/src/lib/content-translation/triggers/tag-trigger.ts` | `triggerTagTranslation()`, `isSystemTag()`, `triggerBatchTagTranslation()` |
| REQ-260 (Task 1.2) | `/src/lib/content-translation/content-translation.ts` | `queueContentTranslations()` (used internally by tag trigger) |
| REQ-259 (Task 1.1) | `/src/lib/content-translation/content-translation.types.ts` | `QueueTranslationResult`, `SupportedLanguage` |

---

## 3. Technical Approach

### Tag Translation Trigger Logic

When an item is saved (POST or PUT), the following logic will be applied:

```
Item Save (POST or PUT) completed successfully
    │
    ├── 1. Extract tags from request body
    │       const tags = body.tags || [];
    │
    ├── 2. Filter out system tags
    │       │
    │       ├── Skip tags starting with '#' (room tag format)
    │       │
    │       └── Skip tags in AVAILABLE_TAGS constant
    │           (uses isSystemTag() from tag-trigger.ts)
    │
    ├── 3. For remaining user tags:
    │       │
    │       ├── Get source language (user preference or 'en')
    │       │
    │       └── Call triggerBatchTagTranslation(userTags, sourceLanguage)
    │           - Runs asynchronously
    │           - Does NOT block response
    │           - Errors are logged but not thrown
    │
    └── 4. Return response immediately
            - translationJobIds included if available
            - Main operation success is NOT affected by tag translation errors
```

### Source Language Detection

The source language for tags should match the user's or account's preferred language:

```typescript
// Priority: request body > user preference > account preference > default 'en'
const sourceLanguage = body.sourceLanguage
  || user.preferred_language
  || account?.preferred_language
  || 'en';
```

**Note:** The actual source language detection may depend on the implementation from Task 2.1 (source language detection utility). If not available, default to 'en'.

### Error Handling Strategy

Tag translation errors should NOT prevent the item from being saved:

```typescript
// Example error handling pattern
try {
  // Queue tag translations (async, non-blocking)
  const tagTranslationResults = await triggerBatchTagTranslation(
    userTags,
    sourceLanguage
  );
  // Optionally collect job IDs for response
} catch (error) {
  // Log error but don't throw
  console.error('Tag translation queueing failed (non-blocking):', error);
  // Continue with success response
}
```

### Response Enhancement

Add `translationJobIds` to the response when tags are processed:

```typescript
const response = {
  success: true,
  data: { ... },
  translationJobIds: translationResults?.flatMap(r => r.jobIds) || undefined,
  accountContext: { ... }
};
```

---

## 4. Implementation Tasks

### Task 2.5.1: Create helper function for tag translation

**Action:** Create a helper function that handles tag translation logic
**File:** `/src/app/api/admin/items/route.ts` (can also be extracted to a shared utility)

**Function to add:**

```typescript
import {
  triggerBatchTagTranslation,
  isSystemTag
} from '@/lib/content-translation';
import type { SupportedLanguage } from '@/lib/content-translation';

/**
 * Queues tag translations for user-defined tags (non-blocking)
 *
 * Filters out system tags and '#'-prefixed tags, then queues
 * translation jobs for remaining user tags.
 *
 * @param tags - Array of tag strings from item
 * @param sourceLanguage - Source language for translation
 * @returns Array of job IDs for queued translations, or undefined on error
 */
async function queueTagTranslations(
  tags: string[],
  sourceLanguage: SupportedLanguage
): Promise<string[] | undefined> {
  if (!tags || tags.length === 0) {
    return undefined;
  }

  try {
    // Filter out system tags and '#'-prefixed tags
    const userTags = tags.filter(tag => {
      // Skip '#'-prefixed tags (room tags format)
      if (tag.startsWith('#')) {
        return false;
      }
      // Skip system tags defined in AVAILABLE_TAGS
      if (isSystemTag(tag)) {
        return false;
      }
      return true;
    });

    if (userTags.length === 0) {
      console.log('No user tags to translate (all system or prefixed tags)');
      return undefined;
    }

    console.log(`Queueing translation for ${userTags.length} user tag(s):`, userTags);

    // Queue translations for user tags
    const results = await triggerBatchTagTranslation(userTags, sourceLanguage);

    // Collect all job IDs from results
    const jobIds = results.flatMap(result => result.jobIds);
    console.log(`Tag translation jobs queued: ${jobIds.length}`);

    return jobIds.length > 0 ? jobIds : undefined;
  } catch (error) {
    // Log error but don't throw - tag translation is non-blocking
    console.error('Tag translation queueing failed (non-blocking):', error);
    return undefined;
  }
}
```

### Task 2.5.2: Modify POST handler in items/route.ts

**Action:** Add tag translation trigger after successful item creation
**File:** `/src/app/api/admin/items/route.ts`
**Location:** After line 502 (after links created successfully) and before line 507 (response construction)

**Modification:**

```typescript
// === EXISTING CODE (around line 502) ===
      createdLinks.push(...(newLinks || []));
      console.log('Links created successfully:', createdLinks.length);
    }

    // === NEW CODE: Queue tag translations ===
    // REQ-345: Trigger tag translation for user tags
    let tagTranslationJobIds: string[] | undefined;
    if (body.tags && body.tags.length > 0) {
      // Determine source language (default to 'en')
      // TODO: Use detectSourceLanguage utility from Task 2.1 when available
      const sourceLanguage = (body as any).sourceLanguage || 'en';
      tagTranslationJobIds = await queueTagTranslations(body.tags, sourceLanguage as SupportedLanguage);
    }
    // === END NEW CODE ===

    // Transform response to match ItemResponse type
    // REQ-151: Include articles array in response
    const response = {
      success: true,
      data: {
        // ... existing fields
      },
      // REQ-345: Include tag translation job IDs
      translationJobIds: tagTranslationJobIds,
      accountContext: {
        accountId,
        accountRole
      }
    };
```

### Task 2.5.3: Modify PUT handler in items/[publicId]/route.ts

**Action:** Add tag translation trigger after successful item update
**File:** `/src/app/api/admin/items/[publicId]/route.ts`
**Location:** After line 752 (after article handling) and before line 756 (response construction)

**Modification:**

```typescript
// === EXISTING CODE (around line 752) ===
        console.log('Links associated with article:', linkIds.length);
      }
    }

    // === NEW CODE: Queue tag translations ===
    // REQ-345: Trigger tag translation for user tags
    let tagTranslationJobIds: string[] | undefined;
    if (body.tags && body.tags.length > 0) {
      // Determine source language (default to 'en')
      // TODO: Use detectSourceLanguage utility from Task 2.1 when available
      const sourceLanguage = (body as any).sourceLanguage || 'en';
      tagTranslationJobIds = await queueTagTranslations(body.tags, sourceLanguage as SupportedLanguage);
    }
    // === END NEW CODE ===

    // Transform response to match ItemResponse type
    // REQ-151: Include articles in response
    const response = {
      success: true,
      data: {
        // ... existing fields
      },
      // REQ-345: Include tag translation job IDs
      translationJobIds: tagTranslationJobIds,
      accountContext: {
        accountId,
        accountRole
      }
    };
```

### Task 2.5.4: Add imports to both files

**Action:** Add necessary imports for tag translation
**Files:** Both `/src/app/api/admin/items/route.ts` and `/src/app/api/admin/items/[publicId]/route.ts`

**Imports to add:**

```typescript
// REQ-345: Import tag translation utilities
import {
  triggerBatchTagTranslation,
  isSystemTag
} from '@/lib/content-translation';
import type { SupportedLanguage } from '@/lib/content-translation';
```

### Task 2.5.5: Update TypeScript types for response

**Action:** Ensure `translationJobIds` is properly typed in responses
**File:** `/src/types/index.ts`

**Note:** According to Plan-111 Task 2.6, the types should already include `translationJobIds`. Verify the following types exist:

```typescript
// In ItemResponse or CreateItemResponse
export interface ItemResponse {
  success: boolean;
  data?: { ... };
  error?: string;
  translationJobIds?: string[];  // NEW: Translation job tracking
  accountContext?: { ... };
}
```

If not present, add `translationJobIds?: string[]` to the appropriate response interfaces.

---

## 5. Authorized Files and Functions for Modification

### Files to MODIFY

| File Path | Function/Section | Modification |
|-----------|------------------|--------------|
| `/src/app/api/admin/items/route.ts` | POST handler | Add tag translation trigger after item/links creation |
| `/src/app/api/admin/items/route.ts` | Imports section | Add imports for tag translation utilities |
| `/src/app/api/admin/items/[publicId]/route.ts` | PUT handler | Add tag translation trigger after item/links/article update |
| `/src/app/api/admin/items/[publicId]/route.ts` | Imports section | Add imports for tag translation utilities |
| `/src/types/index.ts` | ItemResponse type | Verify/add `translationJobIds` field (if not present from Task 2.6) |

### Functions to CREATE

| Function Name | File | Purpose |
|---------------|------|---------|
| `queueTagTranslations` | `/src/app/api/admin/items/route.ts` | Helper to filter and queue tag translations |

**Note:** The helper function `queueTagTranslations` can be duplicated in both files initially, or extracted to a shared utility file like `/src/lib/api/tag-translation-helper.ts` if preferred.

### Functions to CALL (from existing modules)

| Function | Module | Purpose |
|----------|--------|---------|
| `triggerBatchTagTranslation` | `@/lib/content-translation` | Queue translations for multiple tags |
| `isSystemTag` | `@/lib/content-translation` | Check if tag is a system tag |

### Files to READ (Reference Only)

| File Path | Purpose |
|-----------|---------|
| `/src/lib/content-translation/triggers/tag-trigger.ts` | Reference for `triggerBatchTagTranslation`, `isSystemTag` |
| `/src/lib/content-translation/index.ts` | Verify exports |
| `/src/components/ItemCreationWorkflow/utils/constants.ts` | Reference for `AVAILABLE_TAGS` |
| `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md` | Implementation plan reference |
| `/docs/REQ-262-implement-tag-translation-trigger-overview.md` | Tag trigger implementation reference |

### No Modifications Required

The following files should NOT be modified for this task:
- `/src/lib/content-translation/triggers/tag-trigger.ts` (read-only, created in REQ-262)
- `/src/lib/content-translation/content-translation.ts` (read-only)
- `/src/lib/content-translation/content-translation.types.ts` (read-only)
- `/src/components/ItemCreationWorkflow/utils/constants.ts` (read-only reference)
- Database schema (no changes required)

---

## 6. Dependencies

### NPM Package Dependencies

None required - uses only existing project dependencies.

### Internal Dependencies

| Dependency | Source | Required Items |
|------------|--------|----------------|
| REQ-262 (Task 1.4) | `/src/lib/content-translation/triggers/tag-trigger.ts` | `triggerBatchTagTranslation`, `isSystemTag` |
| REQ-259 (Task 1.1) | `/src/lib/content-translation/content-translation.types.ts` | `SupportedLanguage` type |
| System Tags | `/src/components/ItemCreationWorkflow/utils/constants.ts` | Used internally by `isSystemTag()` |

**Prerequisites:** REQ-262 (Tag Translation Trigger) must be completed before this task can begin.

### Database Dependencies

The following tables must exist (created in Epic 1):
- `translation_jobs` - For storing queued translation jobs
- `tag_translations` - For checking existing translations

### Downstream Dependencies (Tasks blocked by this)

| Task | Dependency |
|------|------------|
| Task 3.5: Tag translation processor | Processes jobs created by this trigger |
| Phase 4: Translation status APIs | May query tag translation status |

---

## 7. Acceptance Criteria

From REQ-345:

- [ ] POST handler iterates through tags array after successful item creation
- [ ] PUT handler iterates through tags array after successful item update
- [ ] System filters out tags starting with '#' from translation workflow
- [ ] For each user tag, system checks if translations exist before queueing
- [ ] Tag translation jobs are queued only when translations are missing
- [ ] Translation queueing uses the content translation orchestrator
- [ ] Items API responses return immediately without waiting for tag translation jobs to complete
- [ ] Errors in tag translation queueing do not prevent item creation or update from succeeding

### Additional Implementation Criteria

- [ ] `queueTagTranslations` helper function exists in items route file(s)
- [ ] Import statements for `triggerBatchTagTranslation` and `isSystemTag` are present
- [ ] `translationJobIds` field is included in successful responses when tags are processed
- [ ] System tags from `AVAILABLE_TAGS` constant are correctly skipped
- [ ] Tags with '#' prefix are correctly skipped
- [ ] TypeScript compilation passes without errors
- [ ] Build succeeds
- [ ] Existing item creation/update functionality is not broken

---

## 8. Testing Strategy

### Pre-Implementation Verification

1. **Verify REQ-262 is complete:**
   ```bash
   ls -la src/lib/content-translation/triggers/tag-trigger.ts
   # Expected: file exists

   # Verify exports
   grep -n "triggerBatchTagTranslation\|isSystemTag" src/lib/content-translation/index.ts
   # Expected: exports present
   ```

2. **Verify imports work:**
   ```bash
   npx tsc --noEmit
   # Expected: No errors
   ```

### Post-Implementation Verification

3. **File modification check:**
   ```bash
   # Check imports added
   grep -n "triggerBatchTagTranslation" src/app/api/admin/items/route.ts
   grep -n "triggerBatchTagTranslation" src/app/api/admin/items/[publicId]/route.ts
   # Expected: import statements present

   # Check helper function exists
   grep -n "queueTagTranslations" src/app/api/admin/items/route.ts
   # Expected: function definition present
   ```

4. **TypeScript compilation check:**
   ```bash
   npx tsc --noEmit
   # Expected: No errors
   ```

5. **Build verification:**
   ```bash
   npm run build
   # Expected: Build completes successfully
   ```

### Integration Test Scenarios

1. **Create item with user tags:**
   ```typescript
   // POST /api/admin/items
   const response = await fetch('/api/admin/items', {
     method: 'POST',
     body: JSON.stringify({
       publicId: 'uuid-here',
       name: 'Coffee Maker',
       propertyId: 'property-uuid',
       tags: ['coffee-maker', 'morning-essentials', 'kitchen'], // kitchen is system tag
     })
   });

   const data = await response.json();

   // Verify
   expect(data.success).toBe(true);
   expect(data.translationJobIds).toBeDefined();
   // Only user tags should trigger jobs (coffee-maker, morning-essentials)
   // 'kitchen' is a system tag and should be skipped
   ```

2. **Create item with only system tags:**
   ```typescript
   // POST /api/admin/items
   const response = await fetch('/api/admin/items', {
     method: 'POST',
     body: JSON.stringify({
       publicId: 'uuid-here',
       name: 'Oven',
       propertyId: 'property-uuid',
       tags: ['kitchen', 'appliance'], // Both are system tags
     })
   });

   const data = await response.json();

   // Verify - should succeed but no translation jobs
   expect(data.success).toBe(true);
   expect(data.translationJobIds).toBeUndefined();
   ```

3. **Create item with '#'-prefixed tags:**
   ```typescript
   // POST /api/admin/items
   const response = await fetch('/api/admin/items', {
     method: 'POST',
     body: JSON.stringify({
       publicId: 'uuid-here',
       name: 'Lamp',
       propertyId: 'property-uuid',
       tags: ['#room.bedroom', 'lamp-shade'], // #room.bedroom should be skipped
     })
   });

   const data = await response.json();

   // Verify
   expect(data.success).toBe(true);
   // Only 'lamp-shade' should trigger translation
   ```

4. **Update item with new tags:**
   ```typescript
   // PUT /api/admin/items/[publicId]
   const response = await fetch(`/api/admin/items/${publicId}`, {
     method: 'PUT',
     body: JSON.stringify({
       name: 'Updated Coffee Maker',
       propertyId: 'property-uuid',
       tags: ['updated-tag', 'new-feature'],
     })
   });

   const data = await response.json();

   // Verify
   expect(data.success).toBe(true);
   expect(data.translationJobIds).toBeDefined();
   ```

5. **Error in tag translation does NOT fail item creation:**
   ```typescript
   // Mock triggerBatchTagTranslation to throw error
   // Item should still be created successfully
   expect(data.success).toBe(true);
   expect(data.data.id).toBeDefined();
   // translationJobIds may be undefined due to error, but that's OK
   ```

### Manual Verification Checklist

- [ ] Import statements present in both route files
- [ ] `queueTagTranslations` helper function implemented
- [ ] POST handler calls tag translation after item creation
- [ ] PUT handler calls tag translation after item update
- [ ] System tags from `AVAILABLE_TAGS` are skipped
- [ ] Tags with '#' prefix are skipped
- [ ] `translationJobIds` returned in response when jobs queued
- [ ] Error in translation does not fail item operation
- [ ] TypeScript compilation passes
- [ ] Build succeeds
- [ ] Existing tests still pass

---

## 9. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| REQ-262 not complete | Medium | High | Verify task completion before starting; add clear error message if imports fail |
| Tag trigger functions not exported | Low | Medium | Verify exports exist in `/src/lib/content-translation/index.ts` |
| Performance impact from async calls | Low | Low | Calls are non-blocking; no impact on response time |
| Duplicate translation jobs | Low | Low | `triggerBatchTagTranslation` already checks for existing translations |
| Breaking existing item operations | Low | High | Use try/catch to isolate tag translation; comprehensive testing |
| Source language detection missing | Medium | Low | Default to 'en' until Task 2.1 is complete |

---

## 10. Estimated Effort

| Task | Estimate |
|------|----------|
| Task 2.5.1: Create helper function | 15 min |
| Task 2.5.2: Modify POST handler | 15 min |
| Task 2.5.3: Modify PUT handler | 15 min |
| Task 2.5.4: Add imports | 5 min |
| Task 2.5.5: Verify types | 5 min |
| Testing and verification | 25 min |
| **Total** | **~80 min** |

---

## 11. Implementation Commands Summary

```bash
# Step 1: Verify REQ-262 is complete
ls -la src/lib/content-translation/triggers/tag-trigger.ts
grep -n "triggerBatchTagTranslation\|isSystemTag" src/lib/content-translation/index.ts

# Step 2: Verify TypeScript compilation before changes
npx tsc --noEmit

# Step 3: Make modifications to route files
# (Manual edit or AI-assisted)

# Step 4: Verify TypeScript compilation after changes
npx tsc --noEmit

# Step 5: Verify build
npm run build

# Step 6: Run tests (if available)
npm run test
```

---

## 12. Summary of Tag Translation on Item Save

| Scenario | Tags Example | Behavior | Result |
|----------|--------------|----------|--------|
| No tags | `[]` or undefined | Skip processing | No `translationJobIds` |
| Only system tags | `['kitchen', 'appliance']` | Skip all (system tags) | No `translationJobIds` |
| Only '#'-prefixed | `['#room.bedroom']` | Skip all (prefixed) | No `translationJobIds` |
| User tags only | `['coffee-maker', 'my-tag']` | Queue for all user tags | `translationJobIds: [...]` |
| Mixed tags | `['kitchen', 'my-tag', '#room.living']` | Queue only user tags | `translationJobIds: [...]` (only for 'my-tag') |
| Translation error | Any | Error logged, item saved | Item success, `translationJobIds` may be undefined |

**Key Design Decisions:**

1. **Non-blocking:** Tag translation is async and does not block item save response
2. **Graceful degradation:** Translation errors do not fail item operations
3. **System tag detection:** Uses `isSystemTag()` from REQ-262 + '#' prefix check
4. **Batch processing:** Uses `triggerBatchTagTranslation()` for efficiency
5. **Response enhancement:** `translationJobIds` included when jobs are queued
6. **Source language:** Defaults to 'en' until Task 2.1 detection utility is available

---

## 13. Next Steps After Implementation

After completing Task 2.5 (this task):

1. **Task 2.6:** Update TypeScript types for API responses (if not already done)
2. **Phase 3:** Implement job processors:
   - Task 3.5: Tag translation processor (processes jobs created by this trigger)
3. **Phase 4:** Translation status APIs (can query status of tag translations)

---

## References

- [PRD: L10N Epic 3 - Dynamic Content Translation](/docs/prd/PRD_L10N_Epic3_Dynamic_Content_Translation.md)
- [Implementation Plan](/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md)
- [Request Reference](/docs/gen_requests_epic3.md) - REQ-345
- [Tag Trigger Implementation](/docs/REQ-262-implement-tag-translation-trigger-overview.md) - REQ-262
- [Items POST API](/src/app/api/admin/items/route.ts)
- [Items PUT API](/src/app/api/admin/items/[publicId]/route.ts)
- [System Tags Constants](/src/components/ItemCreationWorkflow/utils/constants.ts) - `AVAILABLE_TAGS`

---

*Document generated for FAQBNB Localization Epic 3 - Dynamic Content Translation, Phase 2, Task 2.5*
