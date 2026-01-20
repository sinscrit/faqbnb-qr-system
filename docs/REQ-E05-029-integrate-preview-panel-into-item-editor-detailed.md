# REQ-E05-029: Integrate Translation Preview Panel into Item Editor - Detailed Task Breakdown

**Document Created:** 2026-01-20
**Last Modified:** 2026-01-20
**Epic:** L10N Epic 5 - Owner Translation Management
**Phase:** 7 - Integration & Polish
**Task ID:** 7.2
**Size:** M (Medium)
**Implementation Plan Reference:** `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
**Overview Document:** `/docs/REQ-E05-029-integrate-preview-panel-into-item-editor-overview.md`
**Request Reference:** `/docs/gen_requests_epic5.md` - REQ-E05-030

---

## Executive Summary

This task integrates the TranslationPreviewPanel component into the item editor page (`/src/app/dashboard2/items/[publicId]/edit/page.tsx`), enabling property owners to immediately review translation status after saving content changes without leaving the editor context. The panel auto-opens when pending or failed translations exist and provides manual toggle control for on-demand access.

---

## Prerequisites Verification Checklist

Before starting implementation, verify these dependencies are complete:

- [ ] REQ-E05-007: TranslationPreviewPanel component exists at `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx`
- [ ] REQ-E05-011: useTranslationStatus hook exists at `/src/hooks/useTranslationStatus.ts`
- [ ] REQ-E05-012: useTranslationRealtime hook exists at `/src/hooks/useTranslationRealtime.ts`
- [ ] REQ-E05-001: Translation status API endpoint working at `/api/translations/status`
- [ ] Epic 1: Translation tables and i18n framework deployed
- [ ] Epic 3: Translation trigger system operational

---

## Task Breakdown

### Task 1: Add Required Imports

**File:** `/src/app/dashboard2/items/[publicId]/edit/page.tsx`
**Lines:** After line 27 (after existing imports)
**Type:** Add imports
**Estimated Effort:** 0.5 story points

#### Description
Add all required imports for translation panel integration including components, hooks, and icons.

#### Code Changes

```typescript
// Add after existing imports (line 27)

// Translation Management Components (Epic 5)
import { TranslationPreviewPanel } from '@/components/TranslationManagement';

// Translation Hooks (Epic 5)
import { useTranslationStatus } from '@/hooks/useTranslationStatus';
import { useTranslationRealtime } from '@/hooks/useTranslationRealtime';

// Additional Icons
import { Languages } from 'lucide-react';
```

#### Verification Steps
1. Run `npm run build` - no import errors
2. TypeScript compilation succeeds without type errors
3. Verify TranslationPreviewPanel export exists in TranslationManagement index

---

### Task 2: Add Translation Panel State Variables

**File:** `/src/app/dashboard2/items/[publicId]/edit/page.tsx`
**Lines:** After line 44 (after existing state declarations)
**Type:** Add state
**Estimated Effort:** 0.5 story points

#### Description
Add state variables to manage translation panel visibility, auto-open logic, and tracking of pending translations.

#### Code Changes

```typescript
// Add after line 44 (after const [tags, setTags] = useState<string[]>([]);)

// Translation panel state
const [isPanelOpen, setIsPanelOpen] = useState(false);
const [hasPendingTranslations, setHasPendingTranslations] = useState(false);
const [showPanelAfterSave, setShowPanelAfterSave] = useState(false);
```

#### Verification Steps
1. Component renders without errors
2. State variables initialize correctly
3. No hydration mismatches in development mode

---

### Task 3: Integrate Translation Status Hook

**File:** `/src/app/dashboard2/items/[publicId]/edit/page.tsx`
**Lines:** After Task 2 additions
**Type:** Add hook integration
**Estimated Effort:** 1 story point

#### Description
Integrate the useTranslationStatus hook to fetch translation status for the current item. The hook should only be enabled after the item is loaded.

#### Code Changes

```typescript
// Add after translation panel state variables

// Fetch translation status for current item
const {
  data: translationStatus,
  loading: statusLoading,
  error: statusError,
  refresh: refreshStatus
} = useTranslationStatus({
  entityType: 'item',
  entityId: item?.id || null,
  enabled: !!item?.id
});

// Check if any translations are pending or failed
useEffect(() => {
  if (translationStatus?.translations) {
    const pendingOrFailed = Object.values(translationStatus.translations).some(
      (t) => t.status === 'pending' || t.status === 'processing' || t.status === 'failed'
    );
    setHasPendingTranslations(pendingOrFailed);
  }
}, [translationStatus]);
```

#### Verification Steps
1. Hook fetches translation status when item is loaded
2. `hasPendingTranslations` updates based on status data
3. No infinite re-render loops
4. Hook disabled when item.id is null/undefined

---

### Task 4: Integrate Realtime Translation Updates Hook

**File:** `/src/app/dashboard2/items/[publicId]/edit/page.tsx`
**Lines:** After Task 3 additions
**Type:** Add hook integration
**Estimated Effort:** 1 story point

#### Description
Integrate the useTranslationRealtime hook to receive real-time updates as translation jobs complete, automatically refreshing the status display.

#### Code Changes

```typescript
// Add after useTranslationStatus integration

// Subscribe to realtime translation updates
const { connectionStatus } = useTranslationRealtime({
  entityType: 'item',
  entityId: item?.id || null,
  enabled: !!item?.id && isPanelOpen,
  onUpdate: (update) => {
    // Refresh status when translation updates arrive
    refreshStatus();

    // Update pending state based on incoming update
    if (update.status === 'completed' || update.status === 'manual') {
      // Re-evaluate pending status after update
      setHasPendingTranslations((prev) => {
        // Will be recalculated by useEffect on translationStatus change
        return prev;
      });
    }
  }
});
```

#### Verification Steps
1. Realtime subscription activates when panel is open
2. Panel updates automatically when translation jobs complete
3. Subscription properly cleans up on unmount
4. No memory leaks from subscription

---

### Task 5: Add Keyboard Shortcut Handler

**File:** `/src/app/dashboard2/items/[publicId]/edit/page.tsx`
**Lines:** After Task 4 additions
**Type:** Add useEffect
**Estimated Effort:** 0.5 story points

#### Description
Add keyboard shortcut (Alt+T) to toggle the translation panel open/closed for quick access.

#### Code Changes

```typescript
// Add after realtime hook integration

// Keyboard shortcut to toggle translation panel (Alt+T)
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.altKey && e.key === 't') {
      e.preventDefault();
      setIsPanelOpen((prev) => !prev);
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

#### Verification Steps
1. Pressing Alt+T toggles panel visibility
2. Event listener properly cleaned up on unmount
3. Shortcut doesn't conflict with browser/OS shortcuts
4. Works correctly on both Windows and Mac

---

### Task 6: Modify handleSubmit for Post-Save Panel Display

**File:** `/src/app/dashboard2/items/[publicId]/edit/page.tsx`
**Lines:** Modify existing handleSubmit function (lines 132-173)
**Type:** Modify function
**Estimated Effort:** 2 story points

#### Description
Modify the save handler to check translation status after successful save and conditionally auto-open the translation panel instead of immediately redirecting.

#### Code Changes

Replace the existing handleSubmit function:

```typescript
// Handle form submission
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!item) return;

  setSaving(true);
  setError(null);

  const headers: Record<string, string> = {};
  if (currentAccount) {
    headers['x-current-account'] = currentAccount.id;
  }

  try {
    // Get propertyId from item.propertyId or item.property.id
    const propertyId = item.propertyId || item.property?.id;
    if (!propertyId) {
      setError('Property ID is missing');
      setSaving(false);
      return;
    }

    const response = await adminApi.updateItem(publicId, {
      name,
      description,
      propertyId,
      tags,
      links: [], // REQ-215: Media management removed from this page
    }, headers);

    if (response.success) {
      // REQ-E05-029: Check translation status after save before redirecting
      try {
        // Refresh translation status
        await refreshStatus();

        // Small delay to allow status fetch to complete
        await new Promise(resolve => setTimeout(resolve, 500));

        // Check if any translations are pending or failed
        const currentStatus = translationStatus;
        const hasPending = currentStatus?.translations
          ? Object.values(currentStatus.translations).some(
              (t) => t.status === 'pending' || t.status === 'processing' || t.status === 'failed'
            )
          : false;

        if (hasPending) {
          // Auto-open panel, stay on page
          setIsPanelOpen(true);
          setShowPanelAfterSave(true);
          setHasPendingTranslations(true);
        } else {
          // All translations complete or none exist - redirect
          router.push('/dashboard2/items');
        }
      } catch (statusErr) {
        // If status check fails, still redirect (graceful degradation)
        console.error('Error checking translation status:', statusErr);
        router.push('/dashboard2/items');
      }
    } else {
      setError(response.error || 'Failed to update item');
    }
  } catch (err) {
    console.error('Error updating item:', err);
    setError(err instanceof Error ? err.message : 'Failed to update item');
  } finally {
    setSaving(false);
  }
};
```

#### Verification Steps
1. Save still works correctly and updates item
2. Panel auto-opens when pending translations exist
3. Redirects to items list when no pending translations
4. Gracefully handles status check failures
5. Error banner still displays for save failures

---

### Task 7: Add Translation Toggle Button to Header

**File:** `/src/app/dashboard2/items/[publicId]/edit/page.tsx`
**Lines:** Modify header section (lines 213-222)
**Type:** Modify JSX
**Estimated Effort:** 1 story point

#### Description
Add a "View Translations" button in the header area that allows manual access to the translation panel.

#### Code Changes

Replace the header section:

```tsx
{/* Header */}
<div className="mb-6">
  <div className="flex items-center justify-between mb-4">
    <button
      onClick={() => router.push('/dashboard2/items')}
      className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
    >
      <ArrowLeft className="w-4 h-4" />
      Back to Items
    </button>

    {/* Translation Panel Toggle Button */}
    {item && (
      <button
        type="button"
        onClick={() => setIsPanelOpen(true)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="View translation status (Alt+T)"
        title="View Translations (Alt+T)"
      >
        <Languages className="w-4 h-4" />
        <span className="hidden sm:inline">Translations</span>
        {hasPendingTranslations && (
          <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" aria-label="Pending translations" />
        )}
      </button>
    )}
  </div>
  <h1 className="text-2xl font-bold text-gray-900">Edit Item</h1>
</div>
```

#### Verification Steps
1. Button renders correctly in header
2. Button hidden when item not loaded
3. Orange dot appears when pending translations exist
4. Button click opens translation panel
5. Tooltip shows keyboard shortcut
6. Responsive: label hidden on small screens

---

### Task 8: Render TranslationPreviewPanel Component

**File:** `/src/app/dashboard2/items/[publicId]/edit/page.tsx`
**Lines:** Before the final closing `</div>` of the return statement (before line 338)
**Type:** Add JSX
**Estimated Effort:** 1.5 story points

#### Description
Add the TranslationPreviewPanel component to the page, passing all required props including entity reference, source content, and callbacks.

#### Code Changes

Add before the final closing `</div>`:

```tsx
      {/* Translation Preview Panel - REQ-E05-029 */}
      {item && (
        <TranslationPreviewPanel
          entityType="item"
          entityId={item.id}
          sourceLanguage={item.source_language || 'en'}
          sourceContent={{
            name: item.name,
            description: item.description || undefined
          }}
          isOpen={isPanelOpen}
          onClose={() => {
            setIsPanelOpen(false);
            setShowPanelAfterSave(false);
            // If panel was shown after save and user closes it, redirect to items list
            if (showPanelAfterSave) {
              router.push('/dashboard2/items');
            }
          }}
          onTranslationEdited={(language) => {
            // Refresh status after manual edit
            refreshStatus();
            console.log(`Translation edited for ${language}`);
          }}
        />
      )}
```

#### Verification Steps
1. Panel renders when isPanelOpen is true
2. Panel receives correct entity props
3. Panel close handler works correctly
4. After-save close triggers redirect
5. Manual edit callback refreshes status
6. Panel doesn't render when item is null

---

### Task 9: Add Post-Save Success Banner

**File:** `/src/app/dashboard2/items/[publicId]/edit/page.tsx`
**Lines:** After the error banner section (after line 229)
**Type:** Add JSX
**Estimated Effort:** 0.5 story points

#### Description
Add a success banner that appears when the panel is shown after save, explaining to the user why they weren't redirected.

#### Code Changes

Add after the error banner section:

```tsx
{/* Post-Save Translation Panel Banner */}
{showPanelAfterSave && isPanelOpen && (
  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
    <Languages className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
    <div>
      <p className="text-blue-800 font-medium">Item saved successfully!</p>
      <p className="text-blue-700 text-sm mt-1">
        Your translations are being processed. Review the status in the panel on the right,
        then close it to return to the items list.
      </p>
    </div>
  </div>
)}
```

#### Verification Steps
1. Banner appears after successful save with pending translations
2. Banner provides clear instructions to user
3. Banner doesn't appear during normal editing
4. Banner disappears when panel is closed

---

### Task 10: Handle Edge Cases and Loading States

**File:** `/src/app/dashboard2/items/[publicId]/edit/page.tsx`
**Lines:** Various modifications
**Type:** Add error handling
**Estimated Effort:** 1 story point

#### Description
Add proper handling for edge cases including loading states during status fetch, error handling for status API failures, and graceful degradation.

#### Code Changes

1. Add loading indicator for translation status in toggle button:

```tsx
{/* Translation Panel Toggle Button - Updated with loading state */}
{item && (
  <button
    type="button"
    onClick={() => setIsPanelOpen(true)}
    disabled={statusLoading}
    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
    aria-label="View translation status (Alt+T)"
    title="View Translations (Alt+T)"
  >
    {statusLoading ? (
      <Loader2 className="w-4 h-4 animate-spin" />
    ) : (
      <Languages className="w-4 h-4" />
    )}
    <span className="hidden sm:inline">Translations</span>
    {hasPendingTranslations && !statusLoading && (
      <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" aria-label="Pending translations" />
    )}
  </button>
)}
```

2. Add error state handling for translation status fetch:

```tsx
// Add after showing the panel, before the closing </div>
{statusError && isPanelOpen && (
  <div className="fixed bottom-4 right-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 shadow-lg max-w-xs z-40">
    <p className="text-yellow-800 text-sm">
      Unable to load translation status. The panel may not show current data.
    </p>
    <button
      onClick={() => refreshStatus()}
      className="text-yellow-700 underline text-sm mt-1 hover:text-yellow-900"
    >
      Retry
    </button>
  </div>
)}
```

#### Verification Steps
1. Loading spinner shows while fetching status
2. Error notification appears when status fetch fails
3. Retry button refreshes status
4. Component doesn't crash on errors
5. Graceful degradation when hooks unavailable

---

## Complete Modified File Structure

After all tasks are complete, the imports section should include:

```typescript
'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth, useAccountContext } from '@/contexts/AuthContext';
import { adminApi } from '@/lib/api';
import { Loader2, ArrowLeft, Save, Languages } from 'lucide-react';
import { ItemWithDetails } from '@/types';
import { RoomSelector, ItemTypeSelector, ItemInstructionsList } from '@/components/ItemEditForm';
import { TagsInlineEdit } from '@/components/ItemManager/components/shared/TagsInlineEdit';
import { extractRoomFromTags, setRoomInTags } from '@/lib/room-utils';
import { extractItemTypeFromTags, setItemTypeInTags } from '@/lib/item-type-utils';
import type { RoomTypeConst, ItemTypeConst } from '@/components/ItemCreationWorkflow/utils/constants';

// Translation Management Components (Epic 5)
import { TranslationPreviewPanel } from '@/components/TranslationManagement';

// Translation Hooks (Epic 5)
import { useTranslationStatus } from '@/hooks/useTranslationStatus';
import { useTranslationRealtime } from '@/hooks/useTranslationRealtime';
```

---

## Testing Checklist

### Unit Tests
- [ ] Panel state toggles correctly
- [ ] Auto-open logic triggers for pending/failed translations
- [ ] Keyboard shortcut handler registers and unregisters
- [ ] hasPendingTranslations updates based on status data

### Integration Tests
- [ ] Save with pending translations opens panel
- [ ] Save with complete translations redirects to list
- [ ] Panel close after save triggers redirect
- [ ] Manual toggle button opens panel
- [ ] Translation edit refreshes status

### E2E Tests
- [ ] Complete flow: edit item -> save -> panel opens -> view translations -> close panel -> redirect
- [ ] Manual panel access during editing (before save)
- [ ] Keyboard shortcut Alt+T toggles panel
- [ ] Responsive behavior on tablet viewports
- [ ] Panel actions (edit, re-translate) work within editor context

### Accessibility Tests
- [ ] Panel toggle button has proper ARIA label
- [ ] Keyboard navigation works (Alt+T, Tab, Escape)
- [ ] Screen reader announces panel state changes
- [ ] Focus management between editor and panel

---

## Acceptance Criteria Verification

| Criterion | Task(s) | Verified |
|-----------|---------|----------|
| Panel integrated into item editor | Task 8 | [ ] |
| Panel receives item entity reference | Task 8 | [ ] |
| Panel state management controls visibility | Task 2 | [ ] |
| Panel auto-opens after save | Task 6 | [ ] |
| Auto-open checks pending/failed status | Task 6 | [ ] |
| Panel opens only when pending/failed exist | Task 6 | [ ] |
| Panel closed when translations complete | Task 6 | [ ] |
| Manual toggle button in header | Task 7 | [ ] |
| Toggle button shows descriptive label | Task 7 | [ ] |
| Toggle opens panel regardless of auto conditions | Task 7 | [ ] |
| Panel slide-in animation smooth | Task 8 | [ ] |
| Panel overlays without layout reflow | Task 8 | [ ] |
| Panel accessible during edit mode | Task 8 | [ ] |
| Close button dismisses panel | Task 8 | [ ] |
| Overlay backdrop closes panel | Task 8 | [ ] |
| Real-time updates when jobs complete | Task 4 | [ ] |
| Preserves existing save functionality | Task 6 | [ ] |
| Panel loading state during status fetch | Task 10 | [ ] |
| Panel handles error states | Task 10 | [ ] |
| Empty state for new items | Task 8 | [ ] |
| Action buttons work (edit, re-translate) | Task 8 | [ ] |
| Keyboard shortcuts (Alt+T) | Task 5 | [ ] |
| Focus management correct | Task 8 | [ ] |
| Consistent with article editor pattern | All | [ ] |

---

## Implementation Order

1. **Task 1** (Imports) - Must be first
2. **Task 2** (State) - Depends on Task 1
3. **Task 3** (Status Hook) - Depends on Task 2
4. **Task 4** (Realtime Hook) - Depends on Task 3
5. **Task 5** (Keyboard Shortcut) - Independent, can be parallel with Task 4
6. **Task 7** (Toggle Button) - Depends on Tasks 2, 3
7. **Task 6** (handleSubmit modification) - Depends on Tasks 3, 4
8. **Task 8** (Panel Component) - Depends on all above
9. **Task 9** (Success Banner) - Depends on Task 8
10. **Task 10** (Edge Cases) - Final polish, depends on all above

---

## Rollback Plan

If issues arise, the integration can be rolled back by:

1. Remove all imports added in Task 1
2. Remove state variables from Task 2
3. Remove hook integrations from Tasks 3, 4
4. Remove keyboard handler from Task 5
5. Restore original handleSubmit function (revert Task 6)
6. Restore original header (revert Task 7)
7. Remove TranslationPreviewPanel JSX (revert Task 8)
8. Remove success banner (revert Task 9)
9. Remove edge case handling (revert Task 10)

Original file backup location: Git history at commit before implementation

---

## References

- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- Overview Document: `/docs/REQ-E05-029-integrate-preview-panel-into-item-editor-overview.md`
- Request: `/docs/gen_requests_epic5.md` - REQ-E05-030
- Article Editor Integration (Reference Pattern): REQ-E05-029
- Existing Modal Pattern: `/src/components/ItemManager/components/ItemPreview/ItemPreviewModal.tsx`
- Item Edit Page: `/src/app/dashboard2/items/[publicId]/edit/page.tsx`
- Radix UI Dialog: https://www.radix-ui.com/primitives/docs/components/dialog
- Supabase Realtime: https://supabase.com/docs/guides/realtime

---

*Generated for FAQBNB Localization Epic 5 - Owner Translation Management*
*Document created: 2026-01-20*
