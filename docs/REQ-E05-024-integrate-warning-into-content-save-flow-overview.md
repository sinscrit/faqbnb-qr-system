# Implementation Overview: REQ-E05-024 - Integrate Warning into Content Save Flow

**Document Created:** 2026-01-20
**Last Modified:** 2026-01-20
**Request ID:** REQ-E05-024
**Epic:** Epic 5 - Owner Translation Management
**Phase:** 5 - Manual Edit Preservation
**Task ID:** 5.3
**Size:** M (Medium)
**Priority:** P2 - Medium

---

## Summary

Integrate the `ManualEditWarningDialog` component into the article, item, and link save handlers to automatically detect manual translations before content updates. When manual translations exist and source content has changed, the dialog intercepts the save operation, allowing property owners to choose between preserving human-reviewed translations or triggering re-translation jobs.

---

## Request Details

### Original Request (REQ-E05-025)

Property owners need automatic detection of manual translations when saving content changes, with immediate presentation of the warning dialog to make informed decisions about preserving or replacing human-reviewed translations.

### Current Behavior

Content save operations proceed without checking for existing manual translations:
- Article editor (`/src/app/dashboard2/instructions/[articleId]/edit/page.tsx`) saves via `adminApi.updateArticle()` without translation checks
- Item editor (`/src/app/dashboard2/items/[publicId]/edit/page.tsx`) saves via `adminApi.updateItem()` without translation checks
- Source content updates can create stale translations without warning
- Property owners have no opportunity to decide whether to preserve manual edits

### Expected Behavior

When a property owner saves changes to source content:
1. System checks whether any translations have `manual` status before proceeding
2. If manual translations detected, the `ManualEditWarningDialog` displays
3. Property owner chooses:
   - **Keep Manual Edits**: Save proceeds, `source_version_at` updated, translations become stale
   - **Re-translate All**: Save proceeds, translation jobs queued for affected languages
   - **Cancel**: Save aborted, user returns to edit view
4. Save operation pauses until dialog action is selected
5. Success notification indicates whether translations were queued

### User Impact

Property owners:
- Receive immediate notification when content changes will affect manual translations
- Make informed decisions about translation workflows at the moment of content update
- Avoid accidentally creating stale translations without awareness
- Choose appropriate actions based on the scope of their content changes

### Business Value

- Prevents unintended loss of valuable manual translation work
- Ensures property owners are aware of translation implications when updating content
- Supports flexible workflows that balance automation efficiency with protection of human-reviewed content quality

---

## Technical Context

### Dependencies

| Dependency | Source | Status |
|------------|--------|--------|
| `ManualEditWarningDialog` | `/src/components/TranslationManagement/ManualEditWarning/ManualEditWarningDialog.tsx` | REQ-E05-022 (predecessor) |
| `TranslationStatus` type | `/src/lib/translation-service/translation-service.types.ts` | Exists |
| `SupportedLanguage` type | `/src/lib/translation-service/translation-service.types.ts` | Exists |
| Translation tables | `article_translations`, `item_translations`, `link_translations` | Epic 1 |
| `source_version_at` columns | Translation tables | REQ-E05-003 |
| Translation Status API | `GET /api/translations/status` | Epic 5 Phase 1 |
| Re-translate API | `POST /api/translations/retranslate` | REQ-E05-002 |
| Article Update API | `/src/app/api/admin/articles/[id]/route.ts` | Exists |
| Item Update API | `/src/app/api/admin/items/[publicId]/route.ts` | Exists |

### Existing Save Handlers

#### Article Save Handler
**File:** `/src/app/dashboard2/instructions/[articleId]/edit/page.tsx`

```typescript
const handleSave = useCallback(async (payload: UpdateArticlePayload) => {
  if (!articleData || !currentAccount) {
    throw new Error('Missing data or account context');
  }

  setIsSaving(true);

  try {
    const headers: Record<string, string> = {
      'x-current-account': currentAccount.id,
    };

    const apiPayload: any = {
      title: payload.title,
      links: processedLinks,
    };

    if (payload.itemTags) {
      apiPayload.itemTags = payload.itemTags;
    }

    const response = await adminApi.updateArticle(articleId, apiPayload, headers);

    if (!response.success) {
      throw new Error(response.error || 'Failed to update article');
    }

    sessionStorage.setItem('editSuccess', 'true');
    router.push('/dashboard2/instructions');
  } catch (error) {
    console.error('Error saving article:', error);
    throw error;
  } finally {
    setIsSaving(false);
  }
}, [articleId, articleData, currentAccount, router]);
```

#### Item Save Handler
**File:** `/src/app/dashboard2/items/[publicId]/edit/page.tsx`

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!item) return;

  setSaving(true);
  setError(null);

  try {
    const response = await adminApi.updateItem(publicId, {
      name,
      description,
      propertyId,
      tags,
      links: [],
    }, headers);

    if (response.success) {
      router.push('/dashboard2/items');
    } else {
      setError(response.error || 'Failed to update item');
    }
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Failed to update item');
  } finally {
    setSaving(false);
  }
};
```

### Dialog Pattern Reference

**File:** `/src/components/ItemCreationWorkflow/components/shared/ConfirmExitDialog.tsx`

The codebase uses custom dialog implementations with:
- Focus trapping via `useFocusTrap` hook
- Fixed positioning with backdrop overlay
- ARIA attributes (`role="alertdialog"`, `aria-modal="true"`)
- Escape key handling
- Lucide icons (AlertTriangle)
- Tailwind styling with `cn()` utility

---

## Implementation Approach

### Architecture Overview

```
Content Save Initiated
    │
    ├── Check for translatable content changes
    │   └── Compare original vs. updated fields (name, title, description)
    │
    ├── If no changes to translatable fields → Proceed with save
    │
    ├── If changes detected:
    │   │
    │   ├── Fetch manual translation status
    │   │   └── GET /api/translations/status?entityType={type}&entityId={id}&status=manual
    │   │
    │   ├── If no manual translations → Proceed with save + update source_version_at
    │   │
    │   └── If manual translations exist:
    │       │
    │       └── Show ManualEditWarningDialog
    │           │
    │           ├── onKeepManual():
    │           │   └── Save content + update source_version_at (translations become stale)
    │           │
    │           ├── onRetranslate():
    │           │   └── Save content + queue translation jobs + update source_version_at
    │           │
    │           └── onCancel():
    │               └── Abort save, return to edit view
```

### State Management

```typescript
// New state variables for save flow integration
const [showManualWarning, setShowManualWarning] = useState(false);
const [manualTranslationLanguages, setManualTranslationLanguages] = useState<SupportedLanguage[]>([]);
const [pendingSavePayload, setPendingSavePayload] = useState<UpdatePayload | null>(null);
const [isCheckingTranslations, setIsCheckingTranslations] = useState(false);
```

### Content Change Detection

```typescript
/**
 * Determines if translatable content fields have changed.
 * Only trigger manual translation check when actual content is modified,
 * not for metadata-only updates.
 */
function hasTranslatableContentChanged(
  original: { title?: string; name?: string; description?: string | null },
  updated: { title?: string; name?: string; description?: string | null }
): boolean {
  // Compare title/name
  const originalTitle = original.title || original.name || '';
  const updatedTitle = updated.title || updated.name || '';
  if (originalTitle !== updatedTitle) return true;

  // Compare description
  const originalDesc = original.description || '';
  const updatedDesc = updated.description || '';
  if (originalDesc !== updatedDesc) return true;

  return false;
}
```

---

## Implementation Tasks

### Task 1: Create useManualTranslationCheck hook

**File:** `/src/hooks/useManualTranslationCheck.ts`

Create a reusable hook for checking manual translation status:

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
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualLanguages, setManualLanguages] = useState<SupportedLanguage[]>([]);

  const checkManualTranslations = useCallback(
    async (
      entityType: 'article' | 'item' | 'link',
      entityId: string,
      accountId: string
    ): Promise<SupportedLanguage[]> => {
      setIsChecking(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/translations/status?entityType=${entityType}&entityId=${entityId}&status=manual`,
          {
            headers: {
              'x-current-account': accountId,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to check translation status');
        }

        const data = await response.json();
        const languages: SupportedLanguage[] = data.items?.[0]?.translations
          ? Object.entries(data.items[0].translations)
              .filter(([_, info]: [string, any]) => info?.status === 'manual')
              .map(([lang]) => lang as SupportedLanguage)
          : [];

        setManualLanguages(languages);
        return languages;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        return [];
      } finally {
        setIsChecking(false);
      }
    },
    []
  );

  const clearManualLanguages = useCallback(() => {
    setManualLanguages([]);
  }, []);

  return {
    isChecking,
    error,
    manualLanguages,
    checkManualTranslations,
    clearManualLanguages,
  };
}
```

### Task 2: Create hasTranslatableContentChanged utility

**File:** `/src/lib/translation-utils.ts`

```typescript
/**
 * Translation utility functions for content save flow integration.
 */

/**
 * Determines if translatable content fields have changed.
 * Only trigger manual translation check when actual content is modified.
 */
export function hasTranslatableContentChanged(
  original: { title?: string; name?: string; description?: string | null },
  updated: { title?: string; name?: string; description?: string | null }
): boolean {
  // Compare title/name
  const originalTitle = (original.title || original.name || '').trim();
  const updatedTitle = (updated.title || updated.name || '').trim();
  if (originalTitle !== updatedTitle) return true;

  // Compare description
  const originalDesc = (original.description || '').trim();
  const updatedDesc = (updated.description || '').trim();
  if (originalDesc !== updatedDesc) return true;

  return false;
}

/**
 * Maps entity types to their corresponding translation table names.
 */
export function getTranslationTableName(
  entityType: 'article' | 'item' | 'link'
): string {
  const tableMap: Record<string, string> = {
    article: 'article_translations',
    item: 'item_translations',
    link: 'link_translations',
  };
  return tableMap[entityType];
}
```

### Task 3: Integrate ManualEditWarningDialog into Article Editor

**File:** `/src/app/dashboard2/instructions/[articleId]/edit/page.tsx`

Modify the article editor to intercept saves and show the warning dialog:

**Changes Required:**

1. Add new state variables for dialog management
2. Import `ManualEditWarningDialog` component and hooks
3. Modify `handleSave` to check for manual translations first
4. Add dialog handlers (`onKeepManual`, `onRetranslate`, `onCancel`)
5. Add dialog component to JSX render

```typescript
// Add imports
import { ManualEditWarningDialog } from '@/components/TranslationManagement/ManualEditWarning';
import { useManualTranslationCheck } from '@/hooks/useManualTranslationCheck';
import { hasTranslatableContentChanged } from '@/lib/translation-utils';
import type { SupportedLanguage } from '@/lib/translation-service/translation-service.types';

// Add state
const [showManualWarning, setShowManualWarning] = useState(false);
const [pendingSavePayload, setPendingSavePayload] = useState<UpdateArticlePayload | null>(null);
const {
  isChecking: isCheckingTranslations,
  manualLanguages,
  checkManualTranslations,
  clearManualLanguages,
} = useManualTranslationCheck();

// Store original content for comparison
const originalContentRef = useRef<{ title: string; description: string | null } | null>(null);
useEffect(() => {
  if (articleData) {
    originalContentRef.current = {
      title: articleData.title,
      description: articleData.description,
    };
  }
}, [articleData]);

// Modified handleSave
const handleSave = useCallback(async (payload: UpdateArticlePayload) => {
  if (!articleData || !currentAccount) {
    throw new Error('Missing data or account context');
  }

  // Check if translatable content has changed
  const contentChanged = hasTranslatableContentChanged(
    originalContentRef.current || {},
    { title: payload.title }
  );

  if (contentChanged) {
    // Check for manual translations
    const manualLangs = await checkManualTranslations('article', articleId, currentAccount.id);

    if (manualLangs.length > 0) {
      // Store payload and show dialog
      setPendingSavePayload(payload);
      setShowManualWarning(true);
      return; // Exit, let dialog handle the rest
    }
  }

  // No manual translations or no content changes - proceed with save
  await performSave(payload, false);
}, [articleId, articleData, currentAccount, checkManualTranslations]);

// Actual save logic extracted to separate function
const performSave = useCallback(async (
  payload: UpdateArticlePayload,
  queueRetranslation: boolean
) => {
  setIsSaving(true);

  try {
    const headers: Record<string, string> = {
      'x-current-account': currentAccount!.id,
    };

    // Process links...
    const apiPayload: any = {
      title: payload.title,
      links: processedLinks,
    };

    if (payload.itemTags) {
      apiPayload.itemTags = payload.itemTags;
    }

    const response = await adminApi.updateArticle(articleId, apiPayload, headers);

    if (!response.success) {
      throw new Error(response.error || 'Failed to update article');
    }

    // Queue re-translation if requested
    if (queueRetranslation && manualLanguages.length > 0) {
      await fetch('/api/translations/retranslate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-current-account': currentAccount!.id,
        },
        body: JSON.stringify({
          entities: [{ type: 'article', id: articleId }],
          languages: manualLanguages,
          overwriteManual: true,
        }),
      });
    }

    sessionStorage.setItem('editSuccess', 'true');
    router.push('/dashboard2/instructions');
  } catch (error) {
    console.error('Error saving article:', error);
    throw error;
  } finally {
    setIsSaving(false);
    clearManualLanguages();
    setPendingSavePayload(null);
  }
}, [articleId, currentAccount, manualLanguages, router, clearManualLanguages]);

// Dialog handlers
const handleKeepManual = useCallback(async () => {
  setShowManualWarning(false);
  if (pendingSavePayload) {
    await performSave(pendingSavePayload, false);
  }
}, [pendingSavePayload, performSave]);

const handleRetranslate = useCallback(async () => {
  setShowManualWarning(false);
  if (pendingSavePayload) {
    await performSave(pendingSavePayload, true);
  }
}, [pendingSavePayload, performSave]);

const handleWarningCancel = useCallback(() => {
  setShowManualWarning(false);
  setPendingSavePayload(null);
  clearManualLanguages();
}, [clearManualLanguages]);
```

Add to JSX render:

```tsx
{/* Manual Edit Warning Dialog */}
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

### Task 4: Integrate ManualEditWarningDialog into Item Editor

**File:** `/src/app/dashboard2/items/[publicId]/edit/page.tsx`

Apply the same pattern as the article editor:

1. Add imports for dialog, hook, and utility
2. Add state variables
3. Store original content for comparison
4. Modify `handleSubmit` to check for manual translations
5. Extract `performSave` function
6. Add dialog handlers
7. Add dialog component to JSX

```typescript
// Similar pattern to article editor with entity type 'item'
// Key differences:
// - Compare name and description instead of title
// - Use publicId for API calls
// - Update item via adminApi.updateItem()
```

### Task 5: Create link save handler integration (if applicable)

**File:** Check if link editor exists at `/src/app/dashboard2/links/[linkId]/edit/page.tsx`

If link editing is handled separately:
1. Apply same pattern as article/item editors
2. Use entity type 'link'
3. Compare title field for content changes

### Task 6: Update API to return source_version_at after save

**File:** `/src/app/api/admin/articles/[id]/route.ts`

Ensure the update API:
1. Updates `source_version_at` in translation records when content changes
2. Returns updated translation status in response

```typescript
// After successful article update, update source_version_at
if (contentChanged) {
  await supabase
    .from('article_translations')
    .update({ source_version_at: new Date().toISOString() })
    .eq('article_id', articleId);
}
```

### Task 7: Add loading states and error handling

**Files:** Both editor pages

1. Show loading indicator while checking translations
2. Display error toast if translation check fails
3. Allow save to proceed even if translation check fails (fallback)
4. Handle API errors gracefully without blocking save
5. Add success notification indicating translation status

```typescript
// Example error handling
const handleSave = useCallback(async (payload: UpdateArticlePayload) => {
  // ...

  try {
    const manualLangs = await checkManualTranslations('article', articleId, currentAccount.id);
    // ...
  } catch (checkError) {
    // Log error but allow save to proceed
    console.warn('Failed to check manual translations, proceeding with save:', checkError);
    await performSave(payload, false);
  }
}, [/* deps */]);
```

### Task 8: Add feature flag support (optional)

**File:** `/src/lib/feature-flags.ts` (create if doesn't exist)

```typescript
export const FEATURE_FLAGS = {
  MANUAL_TRANSLATION_WARNING: process.env.NEXT_PUBLIC_ENABLE_MANUAL_TRANSLATION_WARNING !== 'false',
};
```

Usage in editors:

```typescript
import { FEATURE_FLAGS } from '@/lib/feature-flags';

// In handleSave
if (FEATURE_FLAGS.MANUAL_TRANSLATION_WARNING && contentChanged) {
  // Check for manual translations
} else {
  await performSave(payload, false);
}
```

---

## Authorized Files and Functions for Modification

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/hooks/useManualTranslationCheck.ts` | Hook for checking manual translation status |
| `/src/lib/translation-utils.ts` | Utility functions for translation content change detection |
| `/src/lib/feature-flags.ts` | Feature flag configuration (optional) |

### Files to Modify

| File Path | Changes |
|-----------|---------|
| `/src/app/dashboard2/instructions/[articleId]/edit/page.tsx` | Add dialog integration, modify handleSave, add state and handlers |
| `/src/app/dashboard2/items/[publicId]/edit/page.tsx` | Add dialog integration, modify handleSubmit, add state and handlers |
| `/src/app/api/admin/articles/[id]/route.ts` | Update source_version_at after content changes |
| `/src/app/api/admin/items/[publicId]/route.ts` | Update source_version_at after content changes |
| `/src/hooks/index.ts` | Export useManualTranslationCheck hook (if exists) |

### Functions to Modify

| Function | File | Changes |
|----------|------|---------|
| `handleSave` | Article edit page | Add manual translation check, dialog flow |
| `handleSubmit` | Item edit page | Add manual translation check, dialog flow |
| `PUT handler` | Article API route | Update source_version_at timestamp |
| `PUT handler` | Item API route | Update source_version_at timestamp |

### Files to Reference (Read-Only)

| File Path | Purpose |
|-----------|---------|
| `/src/components/TranslationManagement/ManualEditWarning/ManualEditWarningDialog.tsx` | Dialog component to integrate |
| `/src/lib/translation-service/translation-service.types.ts` | Type definitions |
| `/src/components/ItemCreationWorkflow/components/shared/ConfirmExitDialog.tsx` | Dialog pattern reference |
| `/database/migrations/20260117_l10n_foundation.sql` | Translation table schema |

---

## Acceptance Criteria Checklist

### Save Handler Integration

- [ ] Article save handler checks for existing manual translations before persisting content changes
- [ ] Item save handler checks for existing manual translations before persisting content changes
- [ ] Link save handler checks for existing manual translations before persisting content changes
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

## Testing Requirements

### Unit Tests

**`useManualTranslationCheck.test.ts`**
- [ ] Hook returns empty array when no manual translations exist
- [ ] Hook returns correct languages when manual translations found
- [ ] Hook handles API errors gracefully
- [ ] `isChecking` state updates correctly during fetch

**`translation-utils.test.ts`**
- [ ] `hasTranslatableContentChanged` returns true when title changes
- [ ] `hasTranslatableContentChanged` returns true when description changes
- [ ] `hasTranslatableContentChanged` returns false when content unchanged
- [ ] Function handles null/undefined values correctly
- [ ] Function trims whitespace before comparison

### Integration Tests

**Article Editor**
- [ ] Save proceeds without dialog when no manual translations exist
- [ ] Save proceeds without dialog when content unchanged
- [ ] Dialog appears when content changed and manual translations exist
- [ ] "Keep Manual Edits" saves content without re-translation
- [ ] "Re-translate All" saves content and queues jobs
- [ ] "Cancel" returns to edit view without saving

**Item Editor**
- [ ] Same test cases as article editor

### E2E Tests

- [ ] Full flow: Edit article with manual translations, choose keep, verify save
- [ ] Full flow: Edit article with manual translations, choose re-translate, verify jobs queued
- [ ] Full flow: Edit article with manual translations, cancel, verify no changes

### Accessibility Tests

- [ ] Dialog receives focus when opened
- [ ] Escape key closes dialog and triggers cancel
- [ ] Tab navigation works correctly through dialog controls
- [ ] Screen reader announces dialog content appropriately

---

## Code Examples

### Complete Article Editor Integration

```tsx
'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth, useAccountContext } from '@/contexts/AuthContext';
import { adminApi } from '@/lib/api';
import { ManualEditWarningDialog } from '@/components/TranslationManagement/ManualEditWarning';
import { useManualTranslationCheck } from '@/hooks/useManualTranslationCheck';
import { hasTranslatableContentChanged } from '@/lib/translation-utils';
import type { SupportedLanguage } from '@/lib/translation-service/translation-service.types';
import type { ArticleEditData, UpdateArticlePayload } from '@/components/InstructionEditor';

export default function EditArticlePage() {
  // ... existing state and hooks ...

  // Manual translation warning state
  const [showManualWarning, setShowManualWarning] = useState(false);
  const [pendingSavePayload, setPendingSavePayload] = useState<UpdateArticlePayload | null>(null);
  const {
    isChecking: isCheckingTranslations,
    manualLanguages,
    checkManualTranslations,
    clearManualLanguages,
  } = useManualTranslationCheck();

  // Store original content for comparison
  const originalContentRef = useRef<{ title: string; description: string | null } | null>(null);

  useEffect(() => {
    if (articleData) {
      originalContentRef.current = {
        title: articleData.title,
        description: articleData.description,
      };
    }
  }, [articleData]);

  // Modified save handler with manual translation check
  const handleSave = useCallback(async (payload: UpdateArticlePayload) => {
    if (!articleData || !currentAccount) {
      throw new Error('Missing data or account context');
    }

    const contentChanged = hasTranslatableContentChanged(
      originalContentRef.current || {},
      { title: payload.title }
    );

    if (contentChanged) {
      try {
        const manualLangs = await checkManualTranslations('article', articleId, currentAccount.id);
        if (manualLangs.length > 0) {
          setPendingSavePayload(payload);
          setShowManualWarning(true);
          return;
        }
      } catch (checkError) {
        console.warn('Failed to check manual translations:', checkError);
      }
    }

    await performSave(payload, false);
  }, [articleId, articleData, currentAccount, checkManualTranslations]);

  // Extracted save logic
  const performSave = useCallback(async (
    payload: UpdateArticlePayload,
    queueRetranslation: boolean
  ) => {
    setIsSaving(true);

    try {
      const headers = { 'x-current-account': currentAccount!.id };
      const apiPayload = { title: payload.title, links: payload.links };

      const response = await adminApi.updateArticle(articleId, apiPayload, headers);

      if (!response.success) {
        throw new Error(response.error || 'Failed to update article');
      }

      if (queueRetranslation && manualLanguages.length > 0) {
        await fetch('/api/translations/retranslate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...headers },
          body: JSON.stringify({
            entities: [{ type: 'article', id: articleId }],
            languages: manualLanguages,
            overwriteManual: true,
          }),
        });
      }

      sessionStorage.setItem('editSuccess', 'true');
      router.push('/dashboard2/instructions');
    } finally {
      setIsSaving(false);
      clearManualLanguages();
      setPendingSavePayload(null);
    }
  }, [articleId, currentAccount, manualLanguages, router, clearManualLanguages]);

  // Dialog handlers
  const handleKeepManual = useCallback(async () => {
    setShowManualWarning(false);
    if (pendingSavePayload) await performSave(pendingSavePayload, false);
  }, [pendingSavePayload, performSave]);

  const handleRetranslate = useCallback(async () => {
    setShowManualWarning(false);
    if (pendingSavePayload) await performSave(pendingSavePayload, true);
  }, [pendingSavePayload, performSave]);

  const handleWarningCancel = useCallback(() => {
    setShowManualWarning(false);
    setPendingSavePayload(null);
    clearManualLanguages();
  }, [clearManualLanguages]);

  return (
    <>
      <InstructionEditor
        articleData={articleData}
        onSave={handleSave}
        onCancel={handleCancel}
        isSaving={isSaving || isCheckingTranslations}
      />

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
    </>
  );
}
```

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Translation status API unavailable | Low | Medium | Graceful fallback - proceed with save if check fails |
| Performance degradation on save | Low | Medium | Cache translation status, async check before save completes |
| Race condition with concurrent saves | Low | High | Optimistic locking, disable save button during operation |
| Dialog dismissed during network request | Medium | Low | Track pending state, cleanup on unmount |
| False positives (content unchanged detected as changed) | Low | Low | Trim whitespace, normalize comparison |
| Autosave conflicts | Medium | Medium | Check for manual translations on debounced save, not every keystroke |

---

## Dependencies Graph

```
REQ-E05-003 (source_version_at migration)
    ↓
REQ-E05-022 (ManualEditWarningDialog component)
    ↓
REQ-E05-023 (Stale Translation Indicator)
    ↓
REQ-E05-024 (Integrate Warning into Content Save Flow) ← THIS TASK
```

---

## References

- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md` (Phase 5, Task 5.3)
- **Request Definition:** `/docs/gen_requests_epic5.md` (REQ-E05-025)
- **ManualEditWarningDialog Overview:** `/docs/REQ-E05-022-create-manualeditwarningdialog-component-overview.md`
- **Stale Indicator Overview:** `/docs/REQ-E05-023-implement-stale-translation-indicator-overview.md`
- **Article Editor:** `/src/app/dashboard2/instructions/[articleId]/edit/page.tsx`
- **Item Editor:** `/src/app/dashboard2/items/[publicId]/edit/page.tsx`
- **Translation Schema:** `/database/migrations/20260117_l10n_foundation.sql`
- **Dialog Pattern:** `/src/components/ItemCreationWorkflow/components/shared/ConfirmExitDialog.tsx`

---

*Document generated for FAQBNB L10N Epic 5 - Task 5.3: Integrate Warning into Content Save Flow*
