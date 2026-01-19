# REQ-362: Integrate Translation Preview Panel into Item Editor - Detailed Task Breakdown

**Document Created:** 2026-01-19
**Last Modified:** 2026-01-19 15:30 UTC
**Status:** Ready for Implementation
**Epic:** L10N Epic 5 - Owner Translation Management
**Phase:** 7 - Integration & Polish
**Task ID:** 7.2
**Size:** M (Medium)
**Estimated Story Points:** 3

---

## Executive Summary

This document provides a granular, step-by-step task breakdown for integrating the `TranslationPreviewPanel` component into the item editor page. The implementation follows the exact pattern established in REQ-361 (article editor integration), adapting it for the item entity type and the different file structure of the item edit page.

---

## Prerequisites Checklist

Before starting implementation, verify the following dependencies are complete:

- [ ] **Phase 2, Task 2.2:** `TranslationPreviewPanel` component exists at `/src/components/TranslationManagement/TranslationPreviewPanel/`
- [ ] **Phase 2, Task 2.3:** `TranslationStatusItem` component exists
- [ ] **Phase 2, Task 2.4:** `TranslationProgressBar` component exists
- [ ] **Phase 2, Task 2.5:** `TranslationEditor` component exists
- [ ] **Phase 2, Task 2.6:** `useTranslationStatus` hook exists at `/src/hooks/useTranslationStatus.ts`
- [ ] **Phase 2, Task 2.7:** `useTranslationRealtime` hook exists at `/src/hooks/useTranslationRealtime.ts`
- [ ] **Phase 1, Task 1.1:** Translation Status API exists at `/src/app/api/translations/status/route.ts`
- [ ] **Epic 1:** `item_translations` database table exists and has RLS policies

---

## Implementation Tasks

### Task 1: Add New Imports

**File:** `/src/app/dashboard2/items/[publicId]/edit/page.tsx`
**Location:** Lines 16-26 (import section)
**Estimated Effort:** 5 minutes

**Current Code (Lines 16-26):**
```typescript
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth, useAccountContext } from '@/contexts/AuthContext';
import { adminApi } from '@/lib/api';
import { Loader2, ArrowLeft, Save } from 'lucide-react';
import { ItemWithDetails } from '@/types';
import { RoomSelector, ItemTypeSelector, ItemInstructionsList } from '@/components/ItemEditForm';
import { TagsInlineEdit } from '@/components/ItemManager/components/shared/TagsInlineEdit';
import { extractRoomFromTags, setRoomInTags } from '@/lib/room-utils';
import { extractItemTypeFromTags, setItemTypeInTags } from '@/lib/item-type-utils';
import type { RoomTypeConst, ItemTypeConst } from '@/components/ItemCreationWorkflow/utils/constants';
```

**Add After Line 26:**
```typescript
import { TranslationPreviewPanel } from '@/components/TranslationManagement';
import type { SupportedLocale } from '@/lib/i18n/config';
```

**Verification:**
- [ ] No TypeScript compilation errors after adding imports
- [ ] `TranslationPreviewPanel` is properly exported from the barrel file
- [ ] `SupportedLocale` type is defined in `/src/lib/i18n/config.ts`

---

### Task 2: Add Translation Panel State Variables

**File:** `/src/app/dashboard2/items/[publicId]/edit/page.tsx`
**Location:** After line 44 (after existing state declarations)
**Estimated Effort:** 5 minutes

**Current State Variables (Lines 36-44):**
```typescript
const [item, setItem] = useState<ItemWithDetails | null>(null);
const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState(false);
const [error, setError] = useState<string | null>(null);

// Form state
const [name, setName] = useState('');
const [description, setDescription] = useState('');
const [tags, setTags] = useState<string[]>([]);
```

**Add After Line 44:**
```typescript
// Translation preview panel state
const [showTranslationPanel, setShowTranslationPanel] = useState(false);
const [savedItemData, setSavedItemData] = useState<{
  entityType: 'item';
  entityId: string;
  sourceLanguage: SupportedLocale;
  sourceContent: { name: string; description?: string };
} | null>(null);
```

**Verification:**
- [ ] No TypeScript errors on the new state types
- [ ] State initializes correctly (panel hidden, data null)

---

### Task 3: Create Panel Close Handler

**File:** `/src/app/dashboard2/items/[publicId]/edit/page.tsx`
**Location:** After line 129 (after `handleEditInstruction` callback)
**Estimated Effort:** 5 minutes

**Insert After Line 129:**
```typescript
// Handle translation panel close and navigate to items list
const handleTranslationPanelClose = useCallback(() => {
  setShowTranslationPanel(false);
  // Navigate to items list after panel closes
  router.push('/dashboard2/items');
}, [router]);
```

**Verification:**
- [ ] Function compiles without errors
- [ ] `router` is properly included in dependency array

---

### Task 4: Modify handleSubmit to Show Panel Instead of Redirect

**File:** `/src/app/dashboard2/items/[publicId]/edit/page.tsx`
**Location:** Lines 131-173 (handleSubmit function)
**Estimated Effort:** 15 minutes

**Current Success Flow (Lines 162-163):**
```typescript
if (response.success) {
  router.push('/dashboard2/items');
}
```

**Replace With:**
```typescript
if (response.success) {
  // Instead of immediate redirect, show translation panel
  setSavedItemData({
    entityType: 'item',
    entityId: item.id,  // Use the item's UUID, not publicId
    sourceLanguage: ((item as any).sourceLanguage as SupportedLocale) || 'en',
    sourceContent: {
      name: name,
      description: description || undefined,
    },
  });
  setShowTranslationPanel(true);

  // Store success flag (panel close will redirect)
  sessionStorage.setItem('editItemSuccess', 'true');

  // DO NOT redirect here - let panel handle navigation
}
```

**Key Changes:**
1. Remove direct `router.push('/dashboard2/items')` call
2. Set `savedItemData` with current item information
3. Set `showTranslationPanel` to true
4. Use `item.id` (UUID) for `entityId`, not `publicId`
5. Store success flag in sessionStorage for potential list page notification

**Verification:**
- [ ] Saving an item no longer redirects immediately
- [ ] Panel state is set correctly with item data
- [ ] `item.id` is the UUID (not the publicId from params)

---

### Task 5: Add Auto-Open Effect for Pending Translations

**File:** `/src/app/dashboard2/items/[publicId]/edit/page.tsx`
**Location:** After line 101 (after the `fetchItem` useEffect)
**Estimated Effort:** 15 minutes

**Insert After Line 101:**
```typescript
// Check for pending translations on page load and auto-open panel if found
useEffect(() => {
  const checkPendingTranslations = async () => {
    if (!item || !currentAccount) return;

    try {
      const response = await fetch(
        `/api/translations/status?entityType=item&entityId=${item.id}`,
        {
          headers: {
            'x-current-account': currentAccount.id,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const hasPending = data.items?.[0]?.translations &&
          Object.values(data.items[0].translations).some(
            (t: any) => t.status === 'pending' || t.status === 'processing'
          );

        if (hasPending) {
          setSavedItemData({
            entityType: 'item',
            entityId: item.id,
            sourceLanguage: ((item as any).sourceLanguage as SupportedLocale) || 'en',
            sourceContent: {
              name: item.name,
              description: item.description || undefined,
            },
          });
          setShowTranslationPanel(true);
        }
      }
    } catch (error) {
      console.error('Failed to check translation status:', error);
      // Non-critical error - don't block editor functionality
    }
  };

  checkPendingTranslations();
}, [item, currentAccount]);
```

**Important Notes:**
- Use `item.id` (UUID) for the API call, not `publicId`
- Default `sourceLanguage` to `'en'` if not present on item
- Error handling should be silent - don't block editor
- Check is triggered after item data is loaded

**Verification:**
- [ ] Effect runs after item is fetched
- [ ] Panel auto-opens when pending/processing translations exist
- [ ] Panel does NOT auto-open when all translations are complete
- [ ] API errors are logged but don't break the page

---

### Task 6: Add TranslationPreviewPanel to Render Output

**File:** `/src/app/dashboard2/items/[publicId]/edit/page.tsx`
**Location:** Lines 335-337 (inside the return statement, after the form)
**Estimated Effort:** 10 minutes

**Current Return End (Lines 335-337):**
```tsx
      </form>
    </div>
  );
```

**Replace With:**
```tsx
      </form>

      {/* Translation Preview Panel - slides in from right after save */}
      {savedItemData && (
        <TranslationPreviewPanel
          entityType={savedItemData.entityType}
          entityId={savedItemData.entityId}
          sourceLanguage={savedItemData.sourceLanguage}
          sourceContent={savedItemData.sourceContent}
          isOpen={showTranslationPanel}
          onClose={handleTranslationPanelClose}
          onTranslationEdited={(lang) => {
            console.log(`Translation edited for language: ${lang}`);
          }}
        />
      )}
    </div>
  );
```

**Key Props:**
| Prop | Value | Description |
|------|-------|-------------|
| `entityType` | `'item'` | Identifies this as an item translation |
| `entityId` | `item.id` | The item's UUID (not publicId) |
| `sourceLanguage` | Item's source language or 'en' | Language of original content |
| `sourceContent` | `{ name, description }` | Item uses `name` field (not `title`) |
| `isOpen` | `showTranslationPanel` state | Controls panel visibility |
| `onClose` | `handleTranslationPanelClose` | Handles navigation after close |
| `onTranslationEdited` | Callback | Optional logging for edits |

**Verification:**
- [ ] Panel renders when `showTranslationPanel` is true
- [ ] Panel is hidden when `savedItemData` is null
- [ ] Close button navigates to `/dashboard2/items`
- [ ] `sourceContent` uses `name` field (not `title`)

---

### Task 7: Verify TypeScript Compilation

**Estimated Effort:** 5 minutes

Run TypeScript compiler to check for errors:

```bash
npm run type-check
# or
npx tsc --noEmit
```

**Expected Result:**
- No type errors in the modified file
- All imports resolve correctly
- All props match expected interfaces

**Common Issues to Check:**
- [ ] `SupportedLocale` type includes 'en'
- [ ] `TranslationPreviewPanel` accepts `name` in `sourceContent`
- [ ] `ItemWithDetails` type has `id` field (UUID)

---

### Task 8: Build Verification

**Estimated Effort:** 5 minutes

Run the Next.js build to verify no issues:

```bash
npm run build
```

**Expected Result:**
- Build completes successfully
- No warnings about missing exports
- Page compiles without errors

---

### Task 9: Manual Testing - Save Flow

**Estimated Effort:** 15 minutes

**Test Scenario 1: Save and Panel Opens**

1. Navigate to an existing item edit page: `/dashboard2/items/[publicId]/edit`
2. Make a change to the item name or description
3. Click "Save Changes"
4. **Expected:** Translation Preview Panel slides in from the right
5. **Expected:** Panel shows source content (name, description)
6. **Expected:** Panel shows translation status for all 6 languages
7. Click "Close" on the panel
8. **Expected:** Navigates to `/dashboard2/items`

**Test Scenario 2: Form Still Works Correctly**

1. Navigate to item edit page
2. Modify item name, description, room, item type, and tags
3. Save changes
4. **Expected:** All field values are saved correctly
5. **Expected:** Panel appears with updated content

**Verification Checklist:**
- [ ] Panel appears after successful save
- [ ] Panel does not appear if save fails
- [ ] All form fields (name, description, room, type, tags) save correctly
- [ ] Close button navigates to items list

---

### Task 10: Manual Testing - Auto-Open on Page Load

**Estimated Effort:** 15 minutes

**Test Scenario 3: Auto-Open with Pending Translations**

1. Ensure an item has pending or processing translations (manually set in DB if needed)
2. Navigate directly to the edit page: `/dashboard2/items/[publicId]/edit`
3. **Expected:** Panel auto-opens showing translation progress
4. **Expected:** Panel shows "pending" or "processing" status for relevant languages

**Test Scenario 4: No Auto-Open for Completed Translations**

1. Ensure an item has all translations completed
2. Navigate to the edit page
3. **Expected:** Panel does NOT auto-open
4. **Expected:** User can still save and panel will appear

**Verification Checklist:**
- [ ] Panel auto-opens when pending/processing translations exist
- [ ] Panel does not auto-open when all translations are complete
- [ ] Page loads correctly even if translation API is unavailable

---

### Task 11: Manual Testing - Panel Actions

**Estimated Effort:** 15 minutes

**Test Scenario 5: Panel Edit Action**

1. Save an item (panel opens)
2. Wait for at least one translation to complete
3. Click "Edit" button on a completed translation
4. **Expected:** Translation editor modal opens
5. Modify translation text and save
6. **Expected:** Status updates to "manual"

**Test Scenario 6: Panel Re-translate Action**

1. From the translation panel, click "Re-translate" on a language
2. **Expected:** Job is queued
3. **Expected:** Status changes to "pending" then "processing"

**Test Scenario 7: Panel Retry Failed Action**

1. Ensure a translation has "failed" status
2. Click "Retry" button
3. **Expected:** Translation is re-queued
4. **Expected:** Status updates accordingly

**Verification Checklist:**
- [ ] Edit button opens translation editor
- [ ] Re-translate queues new job
- [ ] Retry works for failed translations
- [ ] Real-time status updates visible in panel

---

### Task 12: Edge Case Testing

**Estimated Effort:** 10 minutes

**Test Scenario 8: API Unavailable**

1. Temporarily disable the translation status API (or disconnect network)
2. Navigate to item edit page
3. **Expected:** Page loads normally, panel does not auto-open
4. **Expected:** Console shows error log, but page is fully functional
5. Save an item
6. **Expected:** Panel still appears (with loading state)

**Test Scenario 9: Item Without UUID**

1. Check that all items have valid UUIDs
2. If item.id is missing, verify panel handles gracefully

**Verification Checklist:**
- [ ] Editor works when translation API is unavailable
- [ ] Error is logged but not shown to user
- [ ] Panel handles missing data gracefully

---

## Complete File Diff Reference

Below is a summary of all changes to `/src/app/dashboard2/items/[publicId]/edit/page.tsx`:

### Imports Section (Add)
```typescript
import { TranslationPreviewPanel } from '@/components/TranslationManagement';
import type { SupportedLocale } from '@/lib/i18n/config';
```

### State Section (Add after line 44)
```typescript
const [showTranslationPanel, setShowTranslationPanel] = useState(false);
const [savedItemData, setSavedItemData] = useState<{
  entityType: 'item';
  entityId: string;
  sourceLanguage: SupportedLocale;
  sourceContent: { name: string; description?: string };
} | null>(null);
```

### Callbacks Section (Add after line 129)
```typescript
const handleTranslationPanelClose = useCallback(() => {
  setShowTranslationPanel(false);
  router.push('/dashboard2/items');
}, [router]);
```

### Effects Section (Add after line 101)
```typescript
useEffect(() => {
  const checkPendingTranslations = async () => {
    // ... pending translations check logic
  };
  checkPendingTranslations();
}, [item, currentAccount]);
```

### handleSubmit Modification (Replace lines 162-163)
```typescript
// Replace router.push with panel state update
setSavedItemData({ ... });
setShowTranslationPanel(true);
sessionStorage.setItem('editItemSuccess', 'true');
```

### Render Section (Add before closing div)
```tsx
{savedItemData && (
  <TranslationPreviewPanel {...props} />
)}
```

---

## Acceptance Criteria Validation

| Requirement | Implementation | Task |
|-------------|----------------|------|
| Preview panel visible in item editor | Panel renders when `showTranslationPanel` is true | Task 6 |
| Owners can select language to preview | TranslationPreviewPanel shows all 6 languages | Task 6 |
| Preview reflects current item content | `sourceContent` uses current `name`/`description` | Task 4, 5 |
| Preview indicates translation status | Panel shows status icons and colors | Task 6 |
| Preview updates when content changes | Real-time updates via `useTranslationRealtime` | Built-in |
| Same pattern as article editor | Follows REQ-361 implementation exactly | All tasks |

---

## Definition of Done

- [ ] All 12 tasks completed
- [ ] TypeScript compiles without errors
- [ ] Next.js build succeeds
- [ ] All manual test scenarios pass
- [ ] No console errors during normal operation
- [ ] Panel slides in smoothly from right
- [ ] Close button navigates to items list
- [ ] Existing form functionality unchanged
- [ ] Code follows existing patterns in the file

---

## Rollback Plan

If issues are discovered post-implementation:

1. Revert the `handleSubmit` function to redirect immediately
2. Remove the `TranslationPreviewPanel` from render
3. Remove the `checkPendingTranslations` effect
4. Remove state variables and imports

The panel integration is isolated and can be disabled without affecting core item editing functionality.

---

## Related Documentation

- **Overview Document:** `/docs/REQ-362-integrate-preview-panel-into-item-editor-overview.md`
- **Article Editor Pattern (REQ-361):** `/docs/REQ-361-integrate-preview-panel-into-article-editor-overview.md`
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- **Request Document:** `/docs/gen_requests_epic5.md` (REQ-362)
- **Target File:** `/src/app/dashboard2/items/[publicId]/edit/page.tsx`

---

*Document generated for FAQBNB Localization Epic 5 - Owner Translation Management*
*Task ID: 7.2 | Phase: 7 - Integration & Polish*
