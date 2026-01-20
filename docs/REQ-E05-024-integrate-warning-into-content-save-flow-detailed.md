# Detailed Task Breakdown: REQ-E05-024 - Integrate Warning into Content Save Flow

**Document Created:** 2026-01-20
**Last Modified:** 2026-01-20
**Request ID:** REQ-E05-024
**Epic:** Epic 5 - Owner Translation Management
**Phase:** 5 - Manual Edit Preservation
**Task ID:** 5.3
**Size:** M (Medium)
**Priority:** P2 - Medium
**Depends On:** REQ-E05-022 (ManualEditWarningDialog), REQ-E05-003 (source_version_at columns)

---

## Executive Summary

This task integrates the `ManualEditWarningDialog` component into article, item, and link content save handlers to automatically detect manual translations before content updates. The system intercepts save operations when manual translations exist, presenting property owners with choices to preserve human-reviewed translations or trigger re-translation jobs.

---

## Prerequisites

### Required Components (Must Exist)

| Component | Path | Status |
|-----------|------|--------|
| `ManualEditWarningDialog` | `/src/components/TranslationManagement/ManualEditWarning/ManualEditWarningDialog.tsx` | REQ-E05-022 |
| Translation Status API | `GET /api/translations/status` | Epic 5 Phase 1 |
| Re-translate API | `POST /api/translations/retranslate` | REQ-E05-002 |
| `source_version_at` columns | Translation tables | REQ-E05-003 |

### Required Types

| Type | Location |
|------|----------|
| `SupportedLanguage` | `/src/lib/translation-service/translation-service.types.ts` |
| `TranslationStatus` | `/src/lib/translation-service/translation-service.types.ts` |

---

## Task Breakdown

### Task 1: Create `useManualTranslationCheck` Hook

**File:** `/src/hooks/useManualTranslationCheck.ts`
**Size:** S (Small)
**Estimated Effort:** 1 story point

#### Description
Create a reusable React hook that checks whether an entity has manual translations by querying the translation status API.

#### Implementation Steps

1. Create the hook file at `/src/hooks/useManualTranslationCheck.ts`
2. Import required types from translation service
3. Implement state management for:
   - `isChecking` (boolean) - Loading state during API call
   - `error` (string | null) - Error message if check fails
   - `manualLanguages` (SupportedLanguage[]) - List of languages with manual status
4. Implement `checkManualTranslations` function that:
   - Accepts `entityType`, `entityId`, and `accountId` parameters
   - Calls `GET /api/translations/status?entityType={type}&entityId={id}&status=manual`
   - Parses response to extract languages with manual status
   - Returns array of affected language codes
5. Implement `clearManualLanguages` function to reset state
6. Export hook with TypeScript types

#### Code Template

```typescript
import { useState, useCallback } from 'react';
import type { SupportedLanguage } from '@/lib/translation-service/translation-service.types';

interface ManualTranslationCheckResult {
  isChecking: boolean;
  error: string | null;
  manualLanguages: SupportedLanguage[];
  checkManualTranslations: (
    entityType: 'article' | 'item' | 'link',
    entityId: string,
    accountId: string
  ) => Promise<SupportedLanguage[]>;
  clearManualLanguages: () => void;
}

export function useManualTranslationCheck(): ManualTranslationCheckResult {
  // Implementation here
}
```

#### Acceptance Criteria
- [ ] Hook returns empty array when no manual translations exist
- [ ] Hook returns correct language codes when manual translations found
- [ ] `isChecking` is true during API call, false otherwise
- [ ] `error` is set when API call fails
- [ ] `clearManualLanguages` resets both `manualLanguages` and `error` states
- [ ] TypeScript types are properly exported

#### Files to Create
- `/src/hooks/useManualTranslationCheck.ts`

#### Files to Modify
- `/src/hooks/index.ts` (add export if barrel file exists)

---

### Task 2: Create `hasTranslatableContentChanged` Utility

**File:** `/src/lib/translation-utils.ts`
**Size:** XS (Extra Small)
**Estimated Effort:** 0.5 story points

#### Description
Create a utility function that determines whether translatable content fields (title, name, description) have changed between original and updated values.

#### Implementation Steps

1. Create or update file at `/src/lib/translation-utils.ts`
2. Implement `hasTranslatableContentChanged` function that:
   - Accepts original and updated content objects
   - Compares title/name fields (handling both article and item patterns)
   - Compares description fields
   - Trims whitespace before comparison
   - Handles null/undefined values gracefully
   - Returns boolean indicating whether changes exist

#### Code Template

```typescript
/**
 * Translation utility functions for content save flow integration.
 * Created: 2026-01-20
 * Last Modified: 2026-01-20
 */

interface ContentFields {
  title?: string;
  name?: string;
  description?: string | null;
}

/**
 * Determines if translatable content fields have changed.
 * Only trigger manual translation check when actual content is modified.
 */
export function hasTranslatableContentChanged(
  original: ContentFields,
  updated: ContentFields
): boolean {
  // Compare title/name (articles use title, items use name)
  const originalTitle = (original.title || original.name || '').trim();
  const updatedTitle = (updated.title || updated.name || '').trim();
  if (originalTitle !== updatedTitle) return true;

  // Compare description
  const originalDesc = (original.description || '').trim();
  const updatedDesc = (updated.description || '').trim();
  if (originalDesc !== updatedDesc) return true;

  return false;
}
```

#### Acceptance Criteria
- [ ] Returns `true` when title/name changes
- [ ] Returns `true` when description changes
- [ ] Returns `false` when content is identical
- [ ] Handles null/undefined values without throwing
- [ ] Trims whitespace to avoid false positives
- [ ] Handles both `title` and `name` patterns for articles/items

#### Files to Create
- `/src/lib/translation-utils.ts`

---

### Task 3: Integrate Warning Dialog into Article Editor

**File:** `/src/app/dashboard2/instructions/[articleId]/edit/page.tsx`
**Size:** M (Medium)
**Estimated Effort:** 3 story points

#### Description
Modify the article editor save handler to check for manual translations and show the warning dialog before proceeding with content updates.

#### Implementation Steps

1. Add imports at top of file:
   ```typescript
   import { useState, useRef, useEffect } from 'react';
   import { ManualEditWarningDialog } from '@/components/TranslationManagement/ManualEditWarning';
   import { useManualTranslationCheck } from '@/hooks/useManualTranslationCheck';
   import { hasTranslatableContentChanged } from '@/lib/translation-utils';
   import type { SupportedLanguage } from '@/lib/translation-service/translation-service.types';
   ```

2. Add new state variables after existing state declarations:
   ```typescript
   const [showManualWarning, setShowManualWarning] = useState(false);
   const [pendingSavePayload, setPendingSavePayload] = useState<UpdateArticlePayload | null>(null);
   const {
     isChecking: isCheckingTranslations,
     manualLanguages,
     checkManualTranslations,
     clearManualLanguages,
   } = useManualTranslationCheck();
   ```

3. Add ref to store original content for comparison:
   ```typescript
   const originalContentRef = useRef<{ title: string; description: string | null } | null>(null);

   useEffect(() => {
     if (articleData) {
       originalContentRef.current = {
         title: articleData.title,
         description: articleData.description,
       };
     }
   }, [articleData]);
   ```

4. Modify `handleSave` function to:
   - Check if translatable content has changed using `hasTranslatableContentChanged`
   - If changed, call `checkManualTranslations` to detect manual translations
   - If manual translations exist, store payload and show dialog
   - If no manual translations or no content changes, proceed with save

5. Extract save logic into `performSave` function:
   - Move existing save logic to separate function
   - Add parameter `queueRetranslation: boolean`
   - If `queueRetranslation` is true, call re-translate API after save

6. Add dialog handler functions:
   - `handleKeepManual`: Close dialog, call `performSave(payload, false)`
   - `handleRetranslate`: Close dialog, call `performSave(payload, true)`
   - `handleWarningCancel`: Close dialog, clear pending payload and languages

7. Add `ManualEditWarningDialog` component to JSX return:
   ```tsx
   <ManualEditWarningDialog
     isOpen={showManualWarning}
     entityType="article"
     entityId={articleId}
     affectedLanguages={manualLanguages}
     onKeepManual={handleKeepManual}
     onRetranslate={handleRetranslate}
     onCancel={handleWarningCancel}
     loading={isSaving}
   />
   ```

8. Update loading state in InstructionEditor to include `isCheckingTranslations`:
   ```tsx
   <InstructionEditor
     articleData={articleData}
     onSave={handleSave}
     onCancel={handleCancel}
     isSaving={isSaving || isCheckingTranslations}
   />
   ```

#### Acceptance Criteria
- [ ] Save proceeds without dialog when no manual translations exist
- [ ] Save proceeds without dialog when content is unchanged
- [ ] Dialog appears when content changed AND manual translations exist
- [ ] "Keep Manual Edits" saves content without re-translation
- [ ] "Re-translate All" saves content and queues translation jobs
- [ ] "Cancel" returns to edit view without saving
- [ ] Loading state shows during translation check
- [ ] Error in translation check logs warning but allows save to proceed

#### Files to Modify
- `/src/app/dashboard2/instructions/[articleId]/edit/page.tsx`

---

### Task 4: Integrate Warning Dialog into Item Editor

**File:** `/src/app/dashboard2/items/[publicId]/edit/page.tsx`
**Size:** M (Medium)
**Estimated Effort:** 3 story points

#### Description
Modify the item editor save handler to check for manual translations and show the warning dialog before proceeding with content updates.

#### Implementation Steps

1. Add imports at top of file:
   ```typescript
   import { useRef } from 'react';
   import { ManualEditWarningDialog } from '@/components/TranslationManagement/ManualEditWarning';
   import { useManualTranslationCheck } from '@/hooks/useManualTranslationCheck';
   import { hasTranslatableContentChanged } from '@/lib/translation-utils';
   import type { SupportedLanguage } from '@/lib/translation-service/translation-service.types';
   ```

2. Add new state variables after existing state:
   ```typescript
   const [showManualWarning, setShowManualWarning] = useState(false);
   const [pendingSaveData, setPendingSaveData] = useState<{
     name: string;
     description: string;
     tags: string[];
   } | null>(null);
   const {
     isChecking: isCheckingTranslations,
     manualLanguages,
     checkManualTranslations,
     clearManualLanguages,
   } = useManualTranslationCheck();
   ```

3. Add ref to store original content:
   ```typescript
   const originalContentRef = useRef<{ name: string; description: string } | null>(null);

   useEffect(() => {
     if (item) {
       originalContentRef.current = {
         name: item.name || '',
         description: item.description || '',
       };
     }
   }, [item]);
   ```

4. Modify `handleSubmit` function to:
   - Prevent default form submission
   - Check if translatable content (name, description) has changed
   - If changed, check for manual translations
   - If manual translations exist, store form data and show dialog
   - If no manual translations, proceed with save

5. Extract save logic into `performSave` function:
   - Accept `queueRetranslation: boolean` parameter
   - Move existing API call logic
   - If `queueRetranslation`, call re-translate API after save success

6. Add dialog handler functions:
   - `handleKeepManual`: Close dialog, call `performSave(false)`
   - `handleRetranslate`: Close dialog, call `performSave(true)`
   - `handleWarningCancel`: Close dialog, clear pending data

7. Add `ManualEditWarningDialog` to JSX:
   ```tsx
   <ManualEditWarningDialog
     isOpen={showManualWarning}
     entityType="item"
     entityId={item?.id || ''}
     affectedLanguages={manualLanguages}
     onKeepManual={handleKeepManual}
     onRetranslate={handleRetranslate}
     onCancel={handleWarningCancel}
     loading={saving}
   />
   ```

8. Update save button disabled state:
   ```tsx
   disabled={saving || isCheckingTranslations || !name.trim()}
   ```

#### Acceptance Criteria
- [ ] Save proceeds without dialog when no manual translations exist
- [ ] Save proceeds without dialog when name/description unchanged
- [ ] Dialog appears when content changed AND manual translations exist
- [ ] "Keep Manual Edits" saves content without re-translation
- [ ] "Re-translate All" saves content and queues translation jobs
- [ ] "Cancel" returns to edit view without saving
- [ ] Save button is disabled during translation check
- [ ] Form remains functional after dialog interactions

#### Files to Modify
- `/src/app/dashboard2/items/[publicId]/edit/page.tsx`

---

### Task 5: Update Article API to Update source_version_at

**File:** `/src/app/api/admin/articles/[id]/route.ts`
**Size:** S (Small)
**Estimated Effort:** 1 story point

#### Description
Modify the article update API endpoint to update `source_version_at` timestamp in translation records when article content changes.

#### Implementation Steps

1. Read the existing article API route file
2. In the PUT handler, after successful article update:
   - Determine if translatable content (title, description) was updated
   - If content changed, update `source_version_at` in `article_translations` table
   - Use current timestamp for the update

#### Code Addition

```typescript
// After successful article update
if (contentWasUpdated) {
  // Update source_version_at for all translations of this article
  const { error: translationUpdateError } = await supabase
    .from('article_translations')
    .update({ source_version_at: new Date().toISOString() })
    .eq('article_id', articleId);

  if (translationUpdateError) {
    console.warn('Failed to update source_version_at:', translationUpdateError);
    // Don't fail the request - this is non-critical
  }
}
```

#### Acceptance Criteria
- [ ] `source_version_at` is updated when article title changes
- [ ] `source_version_at` is updated when article description changes
- [ ] `source_version_at` is NOT updated for metadata-only changes
- [ ] Failure to update timestamp does not fail the article update
- [ ] Timestamp update error is logged for debugging

#### Files to Modify
- `/src/app/api/admin/articles/[id]/route.ts`

---

### Task 6: Update Item API to Update source_version_at

**File:** `/src/app/api/admin/items/[publicId]/route.ts`
**Size:** S (Small)
**Estimated Effort:** 1 story point

#### Description
Modify the item update API endpoint to update `source_version_at` timestamp in translation records when item content changes.

#### Implementation Steps

1. Read the existing item API route file
2. In the PUT handler, after successful item update:
   - Determine if translatable content (name, description) was updated
   - If content changed, update `source_version_at` in `item_translations` table
   - Use current timestamp for the update

#### Code Addition

```typescript
// After successful item update
if (contentWasUpdated) {
  // Update source_version_at for all translations of this item
  const { error: translationUpdateError } = await supabase
    .from('item_translations')
    .update({ source_version_at: new Date().toISOString() })
    .eq('item_id', itemId);

  if (translationUpdateError) {
    console.warn('Failed to update source_version_at:', translationUpdateError);
    // Don't fail the request - this is non-critical
  }
}
```

#### Acceptance Criteria
- [ ] `source_version_at` is updated when item name changes
- [ ] `source_version_at` is updated when item description changes
- [ ] `source_version_at` is NOT updated for tag-only changes
- [ ] Failure to update timestamp does not fail the item update
- [ ] Timestamp update error is logged for debugging

#### Files to Modify
- `/src/app/api/admin/items/[publicId]/route.ts`

---

### Task 7: Add Error Handling and Loading States

**File:** Multiple files
**Size:** S (Small)
**Estimated Effort:** 1 story point

#### Description
Enhance error handling and loading states across the save flow integration to ensure graceful degradation and clear user feedback.

#### Implementation Steps

1. In both editor pages, wrap translation check in try-catch:
   ```typescript
   try {
     const manualLangs = await checkManualTranslations('article', articleId, currentAccount.id);
     // Handle result
   } catch (checkError) {
     console.warn('Failed to check manual translations, proceeding with save:', checkError);
     await performSave(payload, false);
   }
   ```

2. Add visual loading indicator during translation check:
   - Consider adding subtle loading spinner or text
   - Disable form submission during check

3. Add success notifications after save:
   - Show toast when translations were queued
   - Show different message when manual edits were preserved

4. Handle edge cases:
   - Account context missing
   - Entity not found
   - Network timeout

#### Acceptance Criteria
- [ ] Translation check failure does not block save operation
- [ ] User sees loading state during translation check
- [ ] Success toast shows when translations are queued
- [ ] Error is logged when translation check fails
- [ ] Save proceeds with fallback behavior on any error

#### Files to Modify
- `/src/app/dashboard2/instructions/[articleId]/edit/page.tsx`
- `/src/app/dashboard2/items/[publicId]/edit/page.tsx`

---

### Task 8: Add Feature Flag Support (Optional)

**File:** `/src/lib/feature-flags.ts`
**Size:** XS (Extra Small)
**Estimated Effort:** 0.5 story points

#### Description
Add a feature flag to enable/disable the manual translation warning feature for gradual rollout.

#### Implementation Steps

1. Create or update feature flags file:
   ```typescript
   // /src/lib/feature-flags.ts

   /**
    * Feature flags for gradual rollout of features.
    * Created: 2026-01-20
    * Last Modified: 2026-01-20
    */

   export const FEATURE_FLAGS = {
     /** Enable manual translation warning on content save */
     MANUAL_TRANSLATION_WARNING: process.env.NEXT_PUBLIC_ENABLE_MANUAL_TRANSLATION_WARNING !== 'false',
   };
   ```

2. Update editor pages to check feature flag:
   ```typescript
   import { FEATURE_FLAGS } from '@/lib/feature-flags';

   // In handleSave/handleSubmit
   if (FEATURE_FLAGS.MANUAL_TRANSLATION_WARNING && contentChanged) {
     // Check for manual translations
   } else {
     await performSave(payload, false);
   }
   ```

#### Acceptance Criteria
- [ ] Feature flag defaults to enabled (true)
- [ ] Setting env var to 'false' disables the feature
- [ ] Save proceeds normally when feature is disabled
- [ ] No errors when env var is not set

#### Files to Create
- `/src/lib/feature-flags.ts` (if doesn't exist)

#### Files to Modify
- `/src/app/dashboard2/instructions/[articleId]/edit/page.tsx`
- `/src/app/dashboard2/items/[publicId]/edit/page.tsx`

---

## Files Summary

### Files to Create

| File Path | Task | Purpose |
|-----------|------|---------|
| `/src/hooks/useManualTranslationCheck.ts` | Task 1 | Hook for checking manual translation status |
| `/src/lib/translation-utils.ts` | Task 2 | Utility functions for content change detection |
| `/src/lib/feature-flags.ts` | Task 8 | Feature flag configuration (optional) |

### Files to Modify

| File Path | Tasks | Changes |
|-----------|-------|---------|
| `/src/app/dashboard2/instructions/[articleId]/edit/page.tsx` | 3, 7, 8 | Add dialog integration, modify handleSave, add state and handlers |
| `/src/app/dashboard2/items/[publicId]/edit/page.tsx` | 4, 7, 8 | Add dialog integration, modify handleSubmit, add state and handlers |
| `/src/app/api/admin/articles/[id]/route.ts` | 5 | Update source_version_at after content changes |
| `/src/app/api/admin/items/[publicId]/route.ts` | 6 | Update source_version_at after content changes |
| `/src/hooks/index.ts` | 1 | Export useManualTranslationCheck hook (if barrel exists) |

### Files to Reference (Read-Only)

| File Path | Purpose |
|-----------|---------|
| `/src/components/TranslationManagement/ManualEditWarning/ManualEditWarningDialog.tsx` | Dialog component to integrate |
| `/src/lib/translation-service/translation-service.types.ts` | Type definitions |
| `/database/migrations/20260117_l10n_foundation.sql` | Translation table schema |

---

## Testing Requirements

### Unit Tests

#### `useManualTranslationCheck.test.ts`
- [ ] Hook returns empty array when no manual translations exist
- [ ] Hook returns correct languages when manual translations found
- [ ] Hook handles API errors gracefully
- [ ] `isChecking` state updates correctly during fetch
- [ ] `clearManualLanguages` resets state properly

#### `translation-utils.test.ts`
- [ ] `hasTranslatableContentChanged` returns true when title changes
- [ ] `hasTranslatableContentChanged` returns true when name changes
- [ ] `hasTranslatableContentChanged` returns true when description changes
- [ ] `hasTranslatableContentChanged` returns false when content unchanged
- [ ] Function handles null/undefined values correctly
- [ ] Function trims whitespace before comparison

### Integration Tests

#### Article Editor Integration
- [ ] Save proceeds without dialog when no manual translations exist
- [ ] Save proceeds without dialog when content unchanged
- [ ] Dialog appears when content changed and manual translations exist
- [ ] "Keep Manual Edits" saves content without re-translation
- [ ] "Re-translate All" saves content and queues jobs
- [ ] "Cancel" returns to edit view without saving
- [ ] source_version_at is updated in translation records

#### Item Editor Integration
- [ ] Same test cases as article editor
- [ ] Tags-only changes do not trigger dialog

### E2E Tests

- [ ] Full flow: Edit article with manual translations, choose keep, verify save
- [ ] Full flow: Edit article with manual translations, choose re-translate, verify jobs queued
- [ ] Full flow: Edit article with manual translations, cancel, verify no changes
- [ ] Full flow: Same scenarios for item editor

### Accessibility Tests

- [ ] Dialog receives focus when opened
- [ ] Escape key closes dialog and triggers cancel
- [ ] Tab navigation works correctly through dialog controls
- [ ] Screen reader announces dialog content appropriately

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Translation status API unavailable | Low | Medium | Graceful fallback - proceed with save if check fails |
| Performance degradation on save | Low | Medium | Async check completes quickly, timeout fallback |
| Race condition with concurrent saves | Low | High | Disable save button during operation, optimistic locking |
| Dialog dismissed during network request | Medium | Low | Track pending state, cleanup on unmount |
| False positives (unchanged content detected as changed) | Low | Low | Trim whitespace, normalize comparison |
| Autosave conflicts | Medium | Medium | Check only on explicit save, not autosave |

---

## Implementation Order

1. **Task 2**: Create `hasTranslatableContentChanged` utility (foundation)
2. **Task 1**: Create `useManualTranslationCheck` hook (foundation)
3. **Task 3**: Integrate dialog into Article Editor (main integration)
4. **Task 4**: Integrate dialog into Item Editor (parallel to Task 3)
5. **Task 5**: Update Article API for source_version_at (can parallelize)
6. **Task 6**: Update Item API for source_version_at (can parallelize)
7. **Task 7**: Add error handling and loading states (polish)
8. **Task 8**: Add feature flag support (optional)

---

## Dependencies Graph

```
REQ-E05-003 (source_version_at migration)
    |
REQ-E05-022 (ManualEditWarningDialog component)
    |
REQ-E05-023 (Stale Translation Indicator)
    |
REQ-E05-024 (Integrate Warning into Content Save Flow) <-- THIS TASK
    |
    +-- Task 2: hasTranslatableContentChanged utility
    |       |
    +-- Task 1: useManualTranslationCheck hook
            |
            +-- Task 3: Article Editor Integration
            |       |
            +-- Task 4: Item Editor Integration
                    |
                    +-- Task 5: Article API source_version_at
                    |
                    +-- Task 6: Item API source_version_at
                            |
                            +-- Task 7: Error Handling
                                    |
                                    +-- Task 8: Feature Flag (optional)
```

---

## Acceptance Criteria Checklist

### Save Handler Integration
- [ ] Article save handler checks for existing manual translations before persisting content changes
- [ ] Item save handler checks for existing manual translations before persisting content changes
- [ ] Link save handler checks for existing manual translations before persisting content changes (if applicable)
- [ ] System queries translation tables filtered by entity reference and manual status
- [ ] Manual translation check executes only when source content fields have changed
- [ ] Check ignores metadata-only updates that do not affect translatable content
- [ ] Warning dialog displays when one or more manual translations are detected

### Dialog Flow
- [ ] Dialog shows complete list of affected languages with manual status
- [ ] Dialog passes entity reference and affected language codes to component props
- [ ] Save operation pauses until dialog action is selected by property owner
- [ ] Choosing "Keep Manual Edits" completes save without triggering translation jobs
- [ ] Choosing "Re-translate All" completes save and queues translation jobs for affected languages
- [ ] Choosing "Cancel" aborts save operation and returns to edit view

### Database Updates
- [ ] Translation jobs receive priority flag when manually triggered via dialog
- [ ] System updates source_version_at timestamp in translation records after save
- [ ] Manual translations marked as stale when source_version_at timestamp updates

### Error Handling and UX
- [ ] Integration preserves existing save validation logic and error handling
- [ ] Warning dialog appears before any database commits occur
- [ ] Failed translation job creation does not prevent content save completion
- [ ] Success notification displays after save indicating whether translations were queued
- [ ] Component handles concurrent save attempts gracefully with proper locking
- [ ] Integration works correctly with autosave functionality if enabled

### Performance and Reliability
- [ ] Manual check query performance remains acceptable (response time under 500ms)
- [ ] System logs all dialog interactions and decisions for audit purposes
- [ ] Feature can be disabled via feature flag for gradual rollout if needed
- [ ] Integration does not affect save performance for content without manual translations
- [ ] Dialog state persists correctly if user navigates away during decision process
- [ ] Component handles edge cases like deleted translations gracefully

### Accessibility and Consistency
- [ ] Integration maintains accessibility standards for dialog presentation
- [ ] Feature works consistently across article editor, item editor, and link editor interfaces

---

## References

- **Overview Document:** `/docs/REQ-E05-024-integrate-warning-into-content-save-flow-overview.md`
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md` (Phase 5, Task 5.3)
- **Request Definition:** `/docs/gen_requests_epic5.md` (REQ-E05-025)
- **ManualEditWarningDialog Overview:** `/docs/REQ-E05-022-create-manualeditwarningdialog-component-overview.md`
- **Stale Indicator Overview:** `/docs/REQ-E05-023-implement-stale-translation-indicator-overview.md`
- **Article Editor:** `/src/app/dashboard2/instructions/[articleId]/edit/page.tsx`
- **Item Editor:** `/src/app/dashboard2/items/[publicId]/edit/page.tsx`
- **Translation Schema:** `/database/migrations/20260117_l10n_foundation.sql`

---

*Document generated for FAQBNB L10N Epic 5 - Task 5.3: Integrate Warning into Content Save Flow*
