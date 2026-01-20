# REQ-E02-028: Extract Confirmation Dialog Messages - Implementation Overview

*Generated: 2026-01-20 20:15:00 UTC*
*Last Modified: 2026-01-20 20:15:00 UTC*

## Reference

- **Request**: REQ-E02-028 (Extract Confirmation Dialog Messages)
- **Source**: docs/gen_requests_epic2.md
- **Implementation Plan**: docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md
- **Type**: Enhancement
- **Phase**: 2H (Common & Shared Components)
- **Task ID**: 2H.8
- **Size**: M (Medium)
- **Epic**: Localization Epic 2 - Static UI Translation
- **Depends On**:
  - Epic 1 (L10N Foundation - next-intl setup)
  - REQ-E02-001 (Common Namespace Structure - must be completed first)

## Summary

Extract all hardcoded confirmation dialog messages used for user action confirmations throughout the application. Replace them with references to localized translation keys. This task affects approximately 8 confirmation dialog components and 30+ locations where these dialogs are invoked, with an estimated ~60 distinct confirmation-related strings needing migration to the i18n `common.confirmations` namespace.

## Goals

1. Identify and catalog all confirmation dialog components across the codebase (~8 components)
2. Extract all hardcoded confirmation strings to the `common.confirmations` namespace
3. Replace hardcoded strings with `useTranslations()` hook references
4. Ensure confirmation dialogs display translated text based on user's language preference
5. Maintain accessibility features (ARIA labels, screen reader text) with translated content
6. Support ICU format for pluralization in bulk confirmation messages
7. Preserve dynamic content interpolation (item names, counts, etc.)
8. Follow consistent naming conventions for translation keys

## Context from Implementation Plan

### Existing Infrastructure (Epic 1 Foundation)

The localization foundation from Epic 1 is already in place:

| Component | Location | Status |
|-----------|----------|--------|
| next-intl package | `package.json` | Installed (v4.7.0) |
| i18n config | `/src/lib/i18n/config.ts` | Configured |
| IntlProvider | `/src/app/layout.tsx` | Integrated |
| Translation files | `/messages/*.json` | 6 languages (en, fr, es, de, nl, it) |
| useTranslations hook | next-intl | Available |
| Language detection | `/src/lib/i18n/language-detection.ts` | Configured |

### Existing Common Namespace

From Plan-111, the `/messages/en.json` file already includes a basic confirmation structure:

```json
{
  "common": {
    "confirmation": {
      "title": "Confirm Action",
      "deleteTitle": "Confirm Delete",
      "deleteMessage": "Are you sure you want to delete this? This action cannot be undone.",
      "unsavedChanges": "You have unsaved changes. Are you sure you want to leave?",
      "yes": "Yes",
      "no": "No"
    }
  }
}
```

This task significantly expands this into comprehensive sub-namespaces for different confirmation types.

### Estimated Scope

- **Components to modify**: 8 confirmation dialog components
- **Distinct strings**: ~60 confirmation-related messages
- **New translation keys needed**: ~60
- **Categories**: Delete, Remove, Exit, Discard, Move, Tag Management, Generic

## Current Confirmation Dialog Inventory

### Core Confirmation Dialog Components

#### 1. ConfirmationModal (Generic)

**Location:** `/src/components/ConfirmationModal.tsx`

**Hardcoded Strings:**
| Line | String | Translation Key |
|------|--------|-----------------|
| 19 | `'Confirm'` (default prop) | `common.confirmations.buttons.confirm` |
| 20 | `'Cancel'` (default prop) | `common.confirmations.buttons.cancel` |

**Notes:** This is a generic reusable modal. The title/message are passed as props from calling code, so those strings are extracted where the component is used. Only default button labels need translation within this component.

---

#### 2. ConfirmDeleteDialog (Item Manager)

**Location:** `/src/components/ItemManager/components/dialogs/ConfirmDeleteDialog.tsx`

**Hardcoded Strings:**
| Line | String | Translation Key |
|------|--------|-----------------|
| 62 | `'Delete Item'` | `common.confirmations.delete.titleSingle` |
| 62 | `'Delete Items'` | `common.confirmations.delete.titleMultiple` |
| 73 | `'Are you sure you want to delete this item? This action cannot be undone.'` | `common.confirmations.delete.messageSingle` |
| 75 | `'Are you sure you want to delete these {count} items? This action cannot be undone.'` | `common.confirmations.delete.messageMultiple` |
| 87 | `'Delete'` | `common.confirmations.buttons.delete` |
| 88 | `'Delete {count} Items'` | `common.confirmations.delete.buttonMultiple` |
| 215 | `'Items to be deleted'` (aria-label) | `common.confirmations.delete.ariaItemList` |
| 230 | `'and {count} more'` | `common.confirmations.overflow` |
| 252 | `'Cancel'` | `common.confirmations.buttons.cancel` |
| 271 | `'Deleting...'` | `common.confirmations.status.deleting` |

**Notes:** Uses helper functions `getDeleteTitle()`, `getDeleteMessage()`, `getConfirmButtonText()` which need to be updated to use translations with pluralization support.

---

#### 3. ConfirmExitDialog (Workflow)

**Location:** `/src/components/ItemCreationWorkflow/components/shared/ConfirmExitDialog.tsx`

**Hardcoded Strings:**
| Line | String | Translation Key |
|------|--------|-----------------|
| 68 | `'You have unsaved changes and {count} item(s) in this session. Are you sure you want to exit?'` | `common.confirmations.exit.messageUnsavedWithItems` |
| 71 | `'You have unsaved changes. Are you sure you want to exit?'` | `common.confirmations.exit.messageUnsaved` |
| 74 | `'You have created {count} item(s) in this session. Are you sure you want to exit?'` | `common.confirmations.exit.messageWithItems` |
| 76 | `'Are you sure you want to exit the workflow?'` | `common.confirmations.exit.messageDefault` |
| 155 | `'Exit Workflow?'` | `common.confirmations.exit.title` |
| 181 | `'Cancel'` | `common.confirmations.buttons.cancel` |
| 196 | `'Exit Workflow'` | `common.confirmations.exit.button` |

**Notes:** Uses helper function `getExitMessage()` which needs to be updated to support translation with dynamic item counts.

---

#### 4. RemoveItemDialog (Workflow)

**Location:** `/src/components/ItemCreationWorkflow/components/shared/RemoveItemDialog.tsx`

**Hardcoded Strings:**
| Line | String | Translation Key |
|------|--------|-----------------|
| 123 | `'Remove Item?'` | `common.confirmations.remove.title` |
| 129 | `'Are you sure you want to remove "{name}"? This action cannot be undone.'` | `common.confirmations.remove.message` |
| 150 | `'Cancel'` | `common.confirmations.buttons.cancel` |
| 167 | `'Remove'` | `common.confirmations.buttons.remove` |

---

#### 5. DeleteItemDialog (Dashboard)

**Location:** `/src/components/dashboard/DeleteItemDialog.tsx`

**Hardcoded Strings:**
| Line | String | Translation Key |
|------|--------|-----------------|
| 72 | `'Delete Item'` | `common.confirmations.delete.titleSingle` |
| 78 | `'Are you sure you want to delete "{name}"? This action cannot be undone.'` | `common.confirmations.delete.messageWithName` |
| 92 | `'This will also delete:'` | `common.confirmations.delete.cascadeWarning` |
| 98 | `'{count} resource link(s)'` | `common.confirmations.delete.resourceLinks` |
| 104 | `'{count} media file(s) from storage'` | `common.confirmations.delete.mediaFiles` |
| 129 | `'Cancel'` | `common.confirmations.buttons.cancel` |
| 148 | `'Deleting...'` | `common.confirmations.status.deleting` |
| 151 | `'Delete Item'` | `common.confirmations.delete.buttonSingle` |

---

#### 6. AssetRemoveConfirmDialog (Asset Panel)

**Location:** `/src/components/ItemManager/components/AssetPanel/AssetRemoveConfirmDialog.tsx`

**Hardcoded Strings:**
| Line | String | Translation Key |
|------|--------|-----------------|
| 107 | `'PDF Document'` | `common.confirmations.assetTypes.pdfDocument` |
| 117-126 | Type labels (`'Video'`, `'Photo'`, `'PDF'`, `'Asset'`) | `common.confirmations.assetTypes.*` |
| 261 | `'Remove {typeLabel}?'` | `common.confirmations.remove.assetTitle` |
| 327 | `'Duration: {duration}'` | `common.confirmations.remove.videoDuration` |
| 333 | `'{count} page(s)'` | `common.confirmations.remove.pdfPages` |
| 348 | `'This action cannot be undone.'` | `common.confirmations.warnings.cannotUndo` |
| 364 | `'Cancel'` | `common.confirmations.buttons.cancel` |
| 364 | `'Cancel removal'` (aria-label) | `common.confirmations.aria.cancelRemoval` |
| 384 | `'Remove'` | `common.confirmations.buttons.remove` |
| 384 | `'Remove asset'` (aria-label) | `common.confirmations.aria.removeAsset` |

---

#### 7. DeleteMediaConfirmDialog (Media Management)

**Location:** `/src/components/MediaManagement/DeleteMediaConfirmDialog.tsx`

**Hardcoded Strings:**
| Line | String | Translation Key |
|------|--------|-----------------|
| 44-55 | Type labels (`'YouTube Video'`, `'PDF Document'`, `'Image'`, `'Web Link'`) | `common.confirmations.mediaTypes.*` |
| 104 | `'Delete {typeLabel}?'` | `common.confirmations.delete.mediaTitle` |
| 121 | `'This action cannot be undone.'` | `common.confirmations.warnings.cannotUndo` |
| 136 | `'Cancel'` | `common.confirmations.buttons.cancel` |
| 154 | `'Delete'` | `common.confirmations.buttons.delete` |

---

#### 8. BulkMoveDialog (Bulk Actions)

**Location:** `/src/components/ItemManager/components/BulkActions/BulkMoveDialog.tsx`

**Hardcoded Strings (partial - see full file):**
| Line | String | Translation Key |
|------|--------|-----------------|
| - | `'Move {count} Item(s) to Another Property'` | `common.confirmations.move.title` |
| - | `'Select a property...'` | `common.confirmations.move.placeholder` |
| - | `'Cancel'` | `common.confirmations.buttons.cancel` |
| - | `'Move {count} Items'` | `common.confirmations.move.button` |

---

#### 9. BulkTagDialog (Bulk Actions)

**Location:** `/src/components/ItemManager/components/BulkActions/BulkTagDialog.tsx`

**Hardcoded Strings (estimated):**
| Line | String | Translation Key |
|------|--------|-----------------|
| - | `'Add Tags from {count} Item(s)'` | `common.confirmations.tags.addTitle` |
| - | `'Remove Tags from {count} Item(s)'` | `common.confirmations.tags.removeTitle` |
| - | `'Cancel'` | `common.confirmations.buttons.cancel` |
| - | `'Add {count} Tags'` | `common.confirmations.tags.addButton` |
| - | `'Remove {count} Tags'` | `common.confirmations.tags.removeButton` |

---

## Translation Namespace Structure

### Namespace: `common.confirmations`

```json
{
  "common": {
    "confirmations": {
      "generic": {
        "title": "Confirm Action",
        "message": "Are you sure you want to proceed?",
        "cannotUndo": "This action cannot be undone."
      },
      "delete": {
        "titleSingle": "Delete Item",
        "titleMultiple": "Delete Items",
        "messageSingle": "Are you sure you want to delete this item? This action cannot be undone.",
        "messageMultiple": "Are you sure you want to delete these {count} items? This action cannot be undone.",
        "messageWithName": "Are you sure you want to delete \"{name}\"? This action cannot be undone.",
        "buttonSingle": "Delete Item",
        "buttonMultiple": "Delete {count} Items",
        "cascadeWarning": "This will also delete:",
        "resourceLinks": "{count, plural, one {# resource link} other {# resource links}}",
        "mediaFiles": "{count, plural, one {# media file from storage} other {# media files from storage}}",
        "ariaItemList": "Items to be deleted",
        "mediaTitle": "Delete {type}?"
      },
      "remove": {
        "title": "Remove Item?",
        "message": "Are you sure you want to remove \"{name}\"? This action cannot be undone.",
        "assetTitle": "Remove {type}?",
        "videoDuration": "Duration: {duration}",
        "pdfPages": "{count, plural, one {# page} other {# pages}}"
      },
      "exit": {
        "title": "Exit Workflow?",
        "messageDefault": "Are you sure you want to exit the workflow?",
        "messageUnsaved": "You have unsaved changes. Are you sure you want to exit?",
        "messageWithItems": "You have created {count, plural, one {# item} other {# items}} in this session. Are you sure you want to exit?",
        "messageUnsavedWithItems": "You have unsaved changes and {count, plural, one {# item} other {# items}} in this session. Are you sure you want to exit?",
        "button": "Exit Workflow"
      },
      "discard": {
        "title": "Discard Changes?",
        "message": "You have unsaved changes. Are you sure you want to discard them?",
        "button": "Discard"
      },
      "move": {
        "title": "Move {count, plural, one {# Item} other {# Items}} to Another Property",
        "placeholder": "Select a property...",
        "button": "Move {count, plural, one {# Item} other {# Items}}"
      },
      "tags": {
        "addTitle": "Add Tags to {count, plural, one {# Item} other {# Items}}",
        "removeTitle": "Remove Tags from {count, plural, one {# Item} other {# Items}}",
        "addButton": "Add {count, plural, one {# Tag} other {# Tags}}",
        "removeButton": "Remove {count, plural, one {# Tag} other {# Tags}}"
      },
      "buttons": {
        "confirm": "Confirm",
        "cancel": "Cancel",
        "delete": "Delete",
        "remove": "Remove",
        "yes": "Yes",
        "no": "No",
        "proceed": "Proceed",
        "goBack": "Go Back",
        "stay": "Stay"
      },
      "status": {
        "deleting": "Deleting...",
        "removing": "Removing...",
        "moving": "Moving...",
        "processing": "Processing..."
      },
      "warnings": {
        "cannotUndo": "This action cannot be undone.",
        "permanentDelete": "This will permanently delete the selected content.",
        "dataLoss": "Any unsaved data will be lost."
      },
      "overflow": "and {count} more",
      "assetTypes": {
        "video": "Video",
        "photo": "Photo",
        "pdf": "PDF",
        "asset": "Asset",
        "pdfDocument": "PDF Document"
      },
      "mediaTypes": {
        "youtubeVideo": "YouTube Video",
        "pdfDocument": "PDF Document",
        "image": "Image",
        "webLink": "Web Link"
      },
      "aria": {
        "cancelRemoval": "Cancel removal",
        "removeAsset": "Remove asset",
        "confirmDelete": "Confirm delete",
        "dialogTitle": "Confirmation dialog"
      }
    }
  }
}
```

## Implementation Order

### Step 1: Expand Confirmations Namespace (Priority: High)

Expand the existing `common.confirmation` keys in `/messages/en.json` into the full `common.confirmations` namespace structure above.

### Step 2: Update Generic ConfirmationModal (Priority: High)

**File:** `/src/components/ConfirmationModal.tsx`

- Add `useTranslations('common.confirmations')` hook
- Update default prop values to use translated strings
- Maintain prop-based text passing for flexibility

### Step 3: Update ConfirmDeleteDialog (Priority: High)

**File:** `/src/components/ItemManager/components/dialogs/ConfirmDeleteDialog.tsx`

- Add `useTranslations('common.confirmations')` hook
- Update helper functions `getDeleteTitle()`, `getDeleteMessage()`, `getConfirmButtonText()` to use translations with ICU pluralization
- Replace all hardcoded strings with translation references
- Update ARIA labels with translated content

### Step 4: Update ConfirmExitDialog (Priority: High)

**File:** `/src/components/ItemCreationWorkflow/components/shared/ConfirmExitDialog.tsx`

- Add `useTranslations('common.confirmations')` hook
- Update `getExitMessage()` helper to use translations with ICU pluralization
- Replace all hardcoded strings with translation references

### Step 5: Update RemoveItemDialog (Priority: High)

**File:** `/src/components/ItemCreationWorkflow/components/shared/RemoveItemDialog.tsx`

- Add `useTranslations('common.confirmations')` hook
- Replace all hardcoded strings with translation references
- Handle dynamic item name interpolation

### Step 6: Update DeleteItemDialog (Priority: High)

**File:** `/src/components/dashboard/DeleteItemDialog.tsx`

- Add `useTranslations('common.confirmations')` hook
- Replace all hardcoded strings with translation references
- Handle cascade warning with proper pluralization

### Step 7: Update AssetRemoveConfirmDialog (Priority: Medium)

**File:** `/src/components/ItemManager/components/AssetPanel/AssetRemoveConfirmDialog.tsx`

- Add `useTranslations('common.confirmations')` hook
- Update `getTypeLabel()` helper to use translations
- Replace all hardcoded strings with translation references
- Update ARIA labels with translated content

### Step 8: Update DeleteMediaConfirmDialog (Priority: Medium)

**File:** `/src/components/MediaManagement/DeleteMediaConfirmDialog.tsx`

- Add `useTranslations('common.confirmations')` hook
- Update `getTypeLabel()` helper to use translations
- Replace all hardcoded strings with translation references

### Step 9: Update Bulk Action Dialogs (Priority: Medium)

**Files:**
- `/src/components/ItemManager/components/BulkActions/BulkMoveDialog.tsx`
- `/src/components/ItemManager/components/BulkActions/BulkTagDialog.tsx`

- Add `useTranslations('common.confirmations')` hook to each
- Replace all hardcoded strings with translation references
- Handle count-based pluralization for titles and buttons

### Step 10: Update Calling Code for ConfirmationModal (Priority: Lower)

Search for all usages of `<ConfirmationModal` and ensure the `title`, `message`, `confirmText`, and `cancelText` props are using translated strings from calling contexts.

## Authorized Files and Functions for Modification

### Translation Files to Modify

#### `/messages/en.json`

- **Purpose**: English translation source file
- **Modification**:
  - Expand `common.confirmation` to comprehensive `common.confirmations` namespace
  - Add all sub-categories (generic, delete, remove, exit, discard, move, tags, buttons, status, warnings, overflow, assetTypes, mediaTypes, aria)

#### `/messages/fr.json`, `/messages/es.json`, `/messages/de.json`, `/messages/nl.json`, `/messages/it.json`

- **Purpose**: Non-English translation files
- **Modification**: Add same keys as en.json (with English placeholders initially)
- **Note**: Actual translations generated in separate task (2H.10)

### Component Files to Modify

#### `/src/components/ConfirmationModal.tsx`

| Modification | Details |
|--------------|---------|
| Add import | `import { useTranslations } from 'next-intl';` |
| Add hook | `const t = useTranslations('common.confirmations');` |
| Update defaults | `confirmText = t('buttons.confirm')`, `cancelText = t('buttons.cancel')` |

#### `/src/components/ItemManager/components/dialogs/ConfirmDeleteDialog.tsx`

| Modification | Details |
|--------------|---------|
| Add import | `import { useTranslations } from 'next-intl';` |
| Add hook | `const t = useTranslations('common.confirmations');` |
| Update `getDeleteTitle()` | Use `t('delete.titleSingle')` / `t('delete.titleMultiple')` |
| Update `getDeleteMessage()` | Use `t('delete.messageSingle')` / `t('delete.messageMultiple', { count })` |
| Update `getConfirmButtonText()` | Use `t('buttons.delete')` / `t('delete.buttonMultiple', { count })` |
| Update Cancel button | Use `t('buttons.cancel')` |
| Update Deleting text | Use `t('status.deleting')` |
| Update overflow | Use `t('overflow', { count: overflowCount })` |
| Update aria-label | Use `t('delete.ariaItemList')` |

#### `/src/components/ItemCreationWorkflow/components/shared/ConfirmExitDialog.tsx`

| Modification | Details |
|--------------|---------|
| Add import | `import { useTranslations } from 'next-intl';` |
| Add hook | `const t = useTranslations('common.confirmations');` |
| Update `getExitMessage()` | Use appropriate `t('exit.message*')` keys with pluralization |
| Update title | Use `t('exit.title')` |
| Update Cancel button | Use `t('buttons.cancel')` |
| Update Exit button | Use `t('exit.button')` |

#### `/src/components/ItemCreationWorkflow/components/shared/RemoveItemDialog.tsx`

| Modification | Details |
|--------------|---------|
| Add import | `import { useTranslations } from 'next-intl';` |
| Add hook | `const t = useTranslations('common.confirmations');` |
| Update title | Use `t('remove.title')` |
| Update message | Use `t('remove.message', { name: displayName })` |
| Update Cancel button | Use `t('buttons.cancel')` |
| Update Remove button | Use `t('buttons.remove')` |

#### `/src/components/dashboard/DeleteItemDialog.tsx`

| Modification | Details |
|--------------|---------|
| Add import | `import { useTranslations } from 'next-intl';` |
| Add hook | `const t = useTranslations('common.confirmations');` |
| Update title | Use `t('delete.titleSingle')` |
| Update message | Use `t('delete.messageWithName', { name: item.name })` |
| Update cascade warning | Use `t('delete.cascadeWarning')` |
| Update resource links | Use `t('delete.resourceLinks', { count: linksCount })` |
| Update media files | Use `t('delete.mediaFiles', { count: mediaCount })` |
| Update Cancel button | Use `t('buttons.cancel')` |
| Update Deleting text | Use `t('status.deleting')` |
| Update Delete button | Use `t('delete.buttonSingle')` |

#### `/src/components/ItemManager/components/AssetPanel/AssetRemoveConfirmDialog.tsx`

| Modification | Details |
|--------------|---------|
| Add import | `import { useTranslations } from 'next-intl';` |
| Add hook | `const t = useTranslations('common.confirmations');` |
| Update `getTypeLabel()` | Use `t('assetTypes.video')`, `t('assetTypes.photo')`, `t('assetTypes.pdf')` |
| Update `getAssetDisplayName()` fallback | Use `t('assetTypes.pdfDocument')` |
| Update title | Use `t('remove.assetTitle', { type: typeLabel })` |
| Update duration | Use `t('remove.videoDuration', { duration })` |
| Update pages | Use `t('remove.pdfPages', { count: pageCount })` |
| Update warning | Use `t('warnings.cannotUndo')` |
| Update Cancel button | Use `t('buttons.cancel')` |
| Update Remove button | Use `t('buttons.remove')` |
| Update aria-labels | Use `t('aria.cancelRemoval')`, `t('aria.removeAsset')` |

#### `/src/components/MediaManagement/DeleteMediaConfirmDialog.tsx`

| Modification | Details |
|--------------|---------|
| Add import | `import { useTranslations } from 'next-intl';` |
| Add hook | `const t = useTranslations('common.confirmations');` |
| Update `getTypeLabel()` | Use `t('mediaTypes.*')` keys |
| Update title | Use `t('delete.mediaTitle', { type: typeLabel })` |
| Update warning | Use `t('warnings.cannotUndo')` |
| Update Cancel button | Use `t('buttons.cancel')` |
| Update Delete button | Use `t('buttons.delete')` |

#### `/src/components/ItemManager/components/BulkActions/BulkMoveDialog.tsx`

| Modification | Details |
|--------------|---------|
| Add import | `import { useTranslations } from 'next-intl';` |
| Add hook | `const t = useTranslations('common.confirmations');` |
| Update title | Use `t('move.title', { count })` |
| Update placeholder | Use `t('move.placeholder')` |
| Update Cancel button | Use `t('buttons.cancel')` |
| Update Move button | Use `t('move.button', { count })` |

#### `/src/components/ItemManager/components/BulkActions/BulkTagDialog.tsx`

| Modification | Details |
|--------------|---------|
| Add import | `import { useTranslations } from 'next-intl';` |
| Add hook | `const t = useTranslations('common.confirmations');` |
| Update titles | Use `t('tags.addTitle')` / `t('tags.removeTitle')` with count |
| Update Cancel button | Use `t('buttons.cancel')` |
| Update action buttons | Use `t('tags.addButton')` / `t('tags.removeButton')` with count |

### Files NOT to Modify

- Console.log messages (for developers only, not user-facing)
- Test files (`__tests__/*.tsx`, `/src/app/test/**`) - Testing handled separately
- API route files (`/src/app/api/*`) - Server-side, different translation approach
- Comments and documentation strings

## Technical Specifications

### Import Pattern for Client Components

Every client component with confirmation dialogs must import the useTranslations hook:

```typescript
'use client';
import { useTranslations } from 'next-intl';

function MyConfirmationDialog() {
  const t = useTranslations('common.confirmations');

  return (
    <div>
      <h3>{t('delete.titleSingle')}</h3>
      <p>{t('delete.messageSingle')}</p>
      <button>{t('buttons.cancel')}</button>
      <button>{t('buttons.delete')}</button>
    </div>
  );
}
```

### Helper Function Update Pattern

```tsx
// Before: ConfirmDeleteDialog helper
export function getDeleteTitle(count: number, customTitle?: string): string {
  if (customTitle) return customTitle;
  return count === 1 ? 'Delete Item' : 'Delete Items';
}

// After: Updated to accept translator function
export function getDeleteTitle(
  count: number,
  t: (key: string, values?: Record<string, unknown>) => string,
  customTitle?: string
): string {
  if (customTitle) return customTitle;
  return count === 1 ? t('delete.titleSingle') : t('delete.titleMultiple');
}

// Alternative: Use ICU pluralization (preferred)
// Translation key: "delete.title": "{count, plural, one {Delete Item} other {Delete Items}}"
// Usage: t('delete.title', { count })
```

### ICU Pluralization Pattern

For confirmation messages with counts, use ICU message format:

```json
{
  "delete": {
    "messageMultiple": "Are you sure you want to delete {count, plural, one {this item} other {these # items}}? This action cannot be undone."
  }
}
```

```tsx
// Usage
t('delete.messageMultiple', { count: selectedItems.length })
```

### Dynamic Content Interpolation Pattern

For messages with dynamic names:

```json
{
  "remove": {
    "message": "Are you sure you want to remove \"{name}\"? This action cannot be undone."
  }
}
```

```tsx
// Usage
t('remove.message', { name: displayName })
```

### ConfirmExitDialog Update Pattern

```tsx
// Before
function getExitMessage(itemCount: number, hasUnsavedChanges: boolean): string {
  if (hasUnsavedChanges && itemCount > 0) {
    return `You have unsaved changes and ${itemCount} item${itemCount !== 1 ? 's' : ''} in this session...`;
  }
  // ... other conditions
}

// After
function getExitMessage(
  itemCount: number,
  hasUnsavedChanges: boolean,
  t: (key: string, values?: Record<string, unknown>) => string
): string {
  if (hasUnsavedChanges && itemCount > 0) {
    return t('exit.messageUnsavedWithItems', { count: itemCount });
  }
  if (hasUnsavedChanges) {
    return t('exit.messageUnsaved');
  }
  if (itemCount > 0) {
    return t('exit.messageWithItems', { count: itemCount });
  }
  return t('exit.messageDefault');
}
```

### ARIA Label Translation Pattern

```tsx
// Before
<div aria-label="Items to be deleted">

// After
<div aria-label={t('delete.ariaItemList')}>
```

## Translation Key Naming Convention

Following Plan-111 convention:
```
common.confirmations.{category}.{variant}
```

### Categories:
- `generic` - Generic confirmation messages
- `delete` - Delete-related confirmations
- `remove` - Remove-related confirmations (non-permanent, session-based)
- `exit` - Exit/leave workflow confirmations
- `discard` - Discard changes confirmations
- `move` - Move item confirmations
- `tags` - Tag management confirmations
- `buttons` - Common button labels
- `status` - Loading/processing status messages
- `warnings` - Warning messages
- `overflow` - Overflow indicator text
- `assetTypes` - Asset type labels
- `mediaTypes` - Media type labels
- `aria` - ARIA accessibility labels

### Rules:
- Use camelCase for multi-word keys: `titleSingle`, `messageWithName`
- Use ICU format for pluralization: `{count, plural, one {...} other {...}}`
- Use interpolation for dynamic content: `{name}`, `{count}`, `{type}`
- Keep keys descriptive and context-aware

### Examples:
| Message | Translation Key |
|---------|-----------------|
| "Delete Item" | `common.confirmations.delete.titleSingle` |
| "Delete {count} Items" | `common.confirmations.delete.buttonMultiple` |
| "Are you sure you want to remove \"{name}\"?" | `common.confirmations.remove.message` |
| "This action cannot be undone." | `common.confirmations.warnings.cannotUndo` |
| "Cancel" | `common.confirmations.buttons.cancel` |
| "Deleting..." | `common.confirmations.status.deleting` |

## Success Validation Checklist

### Code Validation
- [ ] All 8 confirmation dialog components have been updated
- [ ] Each updated component imports `useTranslations` from 'next-intl'
- [ ] No hardcoded English confirmation text remains in modified components
- [ ] Helper functions accept and use translator function parameter
- [ ] ICU pluralization format used for count-based messages
- [ ] Dynamic content interpolation works correctly
- [ ] ARIA labels use translated content

### Translation File Validation
- [ ] `/messages/en.json` contains complete `common.confirmations` namespace
- [ ] All 6 language files have identical key structures
- [ ] No duplicate keys within namespaces
- [ ] ICU format syntax is valid in all translation strings

### Functional Validation
- [ ] Application builds without errors: `npm run build`
- [ ] Confirmation dialogs display correct translated text
- [ ] Single item deletion shows singular form messages
- [ ] Multiple item deletion shows plural form messages with correct count
- [ ] Dynamic content (item names, counts) displays correctly
- [ ] Loading states show translated status messages
- [ ] Confirmation dialogs display translated text when locale is changed
- [ ] No console warnings about missing translation keys

### Accessibility Validation
- [ ] ARIA labels include translated content
- [ ] Screen readers correctly announce confirmation dialog content
- [ ] role="alertdialog" maintains proper behavior with translations
- [ ] Focus management continues to work correctly

## Dependencies

### Required (Already Completed)
- Epic 1: next-intl foundation must be in place
- REQ-E02-001: Common Namespace Structure must be complete

### Related Tasks
- Task 2H.10: Will generate translations for non-English languages
- Task 2H.3 (Modal/Dialog Strings): Some overlap - ensure namespace coordination
- Task 2H.2 (Button Labels): May share common button translations

## Risk Assessment

- **Risk Level**: Low-Medium
- **Rationale**:
  - Straightforward string replacement in most cases
  - ICU pluralization adds some complexity
  - Multiple helper functions need updates
  - Well-established patterns in codebase

### Potential Issues

| Issue | Likelihood | Impact | Mitigation |
|-------|------------|--------|------------|
| ICU format syntax errors | Medium | Medium | Test pluralization thoroughly; use i18n linting |
| Helper function refactoring | Medium | Low | Keep helper functions internal to components or pass translator |
| Missing interpolation variables | Low | Medium | Document all required variables per translation key |
| Component already has useTranslations | Low | Low | Check for existing imports; use distinct namespace paths |
| Bulk dialog complexity | Medium | Low | Test bulk operations with various counts (0, 1, 5, 100) |

## Search Patterns for Discovery

Use these patterns to find all confirmation dialog locations:

```bash
# Find confirmation dialog components
grep -rn "ConfirmationModal\|ConfirmDeleteDialog\|ConfirmExitDialog\|RemoveItemDialog\|DeleteItemDialog\|AssetRemoveConfirmDialog\|DeleteMediaConfirmDialog\|BulkMoveDialog\|BulkTagDialog" --include="*.tsx" src/

# Find "Are you sure" patterns
grep -rn "Are you sure" --include="*.tsx" src/

# Find "cannot be undone" patterns
grep -rn "cannot be undone" --include="*.tsx" src/

# Find delete/remove confirmation text
grep -rn "Delete.*\?" --include="*.tsx" src/
grep -rn "Remove.*\?" --include="*.tsx" src/

# Find exit confirmation text
grep -rn "Exit.*Workflow\|Exit.*\?" --include="*.tsx" src/

# Find dialog role patterns
grep -rn "role=\"alertdialog\"\|role=\"dialog\"" --include="*.tsx" src/

# Find Cancel/Confirm button patterns
grep -rn ">Cancel<\|>Confirm<\|>Delete<\|>Remove<" --include="*.tsx" src/
```

## Notes

### Reference Implementation

The ConfirmDeleteDialog provides a good pattern for ICU pluralization:

```typescript
// /src/components/ItemManager/components/dialogs/ConfirmDeleteDialog.tsx - Reference implementation
'use client';
import { useTranslations } from 'next-intl';

export function ConfirmDeleteDialog({
  isOpen,
  items,
  onConfirm,
  onCancel,
  loading = false,
  title,
}: ConfirmDeleteDialogProps) {
  const t = useTranslations('common.confirmations');
  const itemCount = items.length;

  // Use ICU pluralization for count-based messages
  const dialogTitle = title || t('delete.title', { count: itemCount });
  const dialogMessage = t('delete.message', { count: itemCount });
  const confirmButton = t('delete.button', { count: itemCount });

  return (
    <div role="alertdialog" aria-modal="true" aria-labelledby="delete-dialog-title">
      <h3 id="delete-dialog-title">{dialogTitle}</h3>
      <p>{dialogMessage}</p>
      <ul aria-label={t('delete.ariaItemList')}>
        {/* ... item list ... */}
      </ul>
      <button onClick={onCancel}>{t('buttons.cancel')}</button>
      <button onClick={onConfirm}>
        {loading ? t('status.deleting') : confirmButton}
      </button>
    </div>
  );
}
```

### Coordination with Other Tasks

- **Task 2H.1 (Common Namespace)**: Creates base structure; this task adds/expands confirmations sub-namespace
- **Task 2H.3 (Modal/Dialog Strings)**: Potential overlap with generic modal strings
- **Task 2H.2 (Button Labels)**: May reuse `common.buttons` for Cancel/Confirm if established there

### Confirmation vs. Alert Dialogs

The codebase distinguishes between:
- **Alert dialogs** (`role="alertdialog"`): For destructive/critical confirmations
- **Regular dialogs** (`role="dialog"`): For non-critical confirmations

Both should use translated content but maintain their semantic roles.

### Estimated Effort

Based on Plan-111, this task is estimated at ~60 strings across ~8 components with multiple usage locations. This represents approximately 7.5% of Sub-Epic 2H's overall ~800 strings. Due to helper function updates and ICU pluralization complexity, this M-sized task should take approximately 1-1.5 days.

---

*End of Implementation Overview*
