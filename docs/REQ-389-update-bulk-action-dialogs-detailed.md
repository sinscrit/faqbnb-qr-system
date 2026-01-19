# REQ-389: Update Bulk Action Dialogs for Localization - Detailed Task Breakdown

**Document Created**: 2026-01-19 19:15 UTC
**Last Modified**: 2026-01-19 19:15 UTC
**Request ID**: REQ-389
**Epic**: 2 - Static UI Translation
**Sub-Epic**: 2D - Item Management
**Task ID**: 2D.5
**Size**: M (Medium)
**Type**: ENHANCEMENT
**Overview Document**: [REQ-389-update-bulk-action-dialogs-overview.md](./REQ-389-update-bulk-action-dialogs-overview.md)

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Prerequisites](#prerequisites)
3. [Task Breakdown](#task-breakdown)
4. [Translation Keys Reference](#translation-keys-reference)
5. [Implementation Details](#implementation-details)
6. [Testing Requirements](#testing-requirements)
7. [Acceptance Criteria Checklist](#acceptance-criteria-checklist)

---

## Executive Summary

This document provides granular, implementation-ready tasks for internationalizing four bulk action dialog components in the ItemManager. The implementation follows the established next-intl pattern using `useTranslations` hook for client components, with ICU MessageFormat for proper pluralization across all 6 supported languages.

**Components to Update:**
1. `BulkActionsBar.tsx` (8 strings)
2. `BulkTagDialog.tsx` (18 strings)
3. `BulkMoveDialog.tsx` (12 strings)
4. `ConfirmDeleteDialog.tsx` (8 strings)

**Total Strings**: ~46 unique strings across 4 components

---

## Prerequisites

Before starting implementation, verify:

- [ ] Epic 1 foundation is complete (next-intl installed and configured)
- [ ] `useTranslations` hook is available from `next-intl`
- [ ] Translation files exist in `/messages/*.json` for all 6 languages
- [ ] i18n configuration is in place at `/src/lib/i18n/config.ts`

---

## Task Breakdown

### Task 1: Add Translation Keys to English Translation File
**File**: `/messages/en.json`
**Estimated Effort**: 30 minutes
**Story Points**: 1

#### 1.1 Add `items.bulk.actions` namespace for BulkActionsBar

Add the following keys under the `items` namespace:

```json
{
  "items": {
    "bulk": {
      "actions": {
        "toolbar": "Bulk actions for {count, plural, one {# selected item} other {# selected items}}",
        "selected": "{count} selected",
        "selectedSr": "Currently {count, plural, one {# item} other {# items}} selected",
        "processing": "Processing...",
        "delete": "Delete",
        "addTag": "Add Tag",
        "removeTag": "Remove Tag",
        "moveToProperty": "Move to Property",
        "cancelSelection": "Cancel selection",
        "cancel": "Cancel"
      }
    }
  }
}
```

**Implementation Steps**:
1. Open `/messages/en.json`
2. Locate or create the `items` namespace object
3. Add the `bulk.actions` nested object with all keys listed above
4. Ensure valid JSON syntax (no trailing commas)
5. Save the file

**Verification**:
- JSON validates without syntax errors
- All 10 keys are present under `items.bulk.actions`

---

#### 1.2 Add `items.bulk.tagDialog` namespace for BulkTagDialog

Add to the `items.bulk` object:

```json
{
  "items": {
    "bulk": {
      "tagDialog": {
        "addTitle": "Add Tags from {count, plural, one {# Item} other {# Items}}",
        "removeTitle": "Remove Tags from {count, plural, one {# Item} other {# Items}}",
        "closeDialog": "Close dialog",
        "itemsToUpdate": "Items to be updated:",
        "andMore": "(and {count} more...)",
        "enterTagsLabel": "Enter tags to add:",
        "inputPlaceholder": "Type a tag and press Enter...",
        "maxTagsReached": "Max {max} tags",
        "removeTagAriaLabel": "Remove {tag} tag",
        "suggestedTags": "Suggested tags:",
        "noTagsOnItems": "No tags found on selected items.",
        "selectTagsLabel": "Select tags to remove:",
        "cancel": "Cancel",
        "addConfirm": "Add {count, plural, one {# Tag} other {# Tags}}",
        "removeConfirm": "Remove {count, plural, one {# Tag} other {# Tags}}"
      }
    }
  }
}
```

**Implementation Steps**:
1. Add `tagDialog` object as sibling to `actions` under `items.bulk`
2. Include all 15 keys with proper ICU pluralization syntax
3. Verify JSON syntax

**Verification**:
- All 15 keys present under `items.bulk.tagDialog`
- ICU plural syntax is correct (uses `{count, plural, one {...} other {...}}`)

---

#### 1.3 Add `items.bulk.moveDialog` namespace for BulkMoveDialog

Add to the `items.bulk` object:

```json
{
  "items": {
    "bulk": {
      "moveDialog": {
        "title": "Move {count, plural, one {# Item} other {# Items}} to Another Property",
        "closeDialog": "Close dialog",
        "noPropertiesAvailable": "No properties available",
        "selectDestination": "Select destination property",
        "unknownProperty": "Unknown Property",
        "itemsToMove": "Items to move:",
        "fromProperty": "from: {property}",
        "andMore": "(and {count} more...)",
        "destinationLabel": "Destination property",
        "noOtherProperties": "No other properties available",
        "selectPlaceholder": "Select destination property...",
        "cancel": "Cancel",
        "confirm": "Move {count, plural, one {# Item} other {# Items}}"
      }
    }
  }
}
```

**Implementation Steps**:
1. Add `moveDialog` object under `items.bulk`
2. Include all 13 keys
3. Verify JSON syntax

**Verification**:
- All 13 keys present under `items.bulk.moveDialog`
- Variable interpolation syntax correct (`{property}`, `{count}`)

---

#### 1.4 Add `items.bulk.deleteDialog` namespace for ConfirmDeleteDialog

Add to the `items.bulk` object:

```json
{
  "items": {
    "bulk": {
      "deleteDialog": {
        "titleSingle": "Delete Item",
        "titleMultiple": "Delete Items",
        "messageSingle": "Are you sure you want to delete this item? This action cannot be undone.",
        "messageMultiple": "Are you sure you want to delete these {count} items? This action cannot be undone.",
        "andMore": "and {count} more",
        "cancel": "Cancel",
        "deleting": "Deleting...",
        "confirmSingle": "Delete",
        "confirmMultiple": "Delete {count} Items"
      }
    }
  }
}
```

**Implementation Steps**:
1. Add `deleteDialog` object under `items.bulk`
2. Include all 9 keys
3. Verify JSON syntax

**Verification**:
- All 9 keys present under `items.bulk.deleteDialog`
- Singular/plural variants are properly separated

---

### Task 2: Update BulkActionsBar Component
**File**: `/src/components/ItemManager/components/BulkActions/BulkActionsBar.tsx`
**Estimated Effort**: 45 minutes
**Story Points**: 1

#### 2.1 Import useTranslations hook

**Location**: Line 16 (after existing imports)

**Code Change**:
```typescript
// Add this import
import { useTranslations } from 'next-intl';
```

---

#### 2.2 Initialize translation function in component

**Location**: Inside `BulkActionsBar` function, after line 146 (after props destructuring)

**Code Change**:
```typescript
export function BulkActionsBar({
  selectedCount,
  // ... other props
}: BulkActionsBarProps) {
  // Add this line
  const t = useTranslations('items.bulk.actions');

  // Don't render if no items selected
  if (selectedCount === 0) {
    return null;
  }
  // ... rest of component
```

---

#### 2.3 Replace toolbar aria-label (Line 155)

**Current Code**:
```tsx
aria-label={`Bulk actions for ${selectedCount} selected item${selectedCount !== 1 ? 's' : ''}`}
```

**New Code**:
```tsx
aria-label={t('toolbar', { count: selectedCount })}
```

---

#### 2.4 Replace selection count display (Lines 181-183)

**Current Code**:
```tsx
<span className="text-sm font-medium text-gray-900 truncate">
  {selectedCount} selected
</span>
```

**New Code**:
```tsx
<span className="text-sm font-medium text-gray-900 truncate">
  {t('selected', { count: selectedCount })}
</span>
```

---

#### 2.5 Replace screen reader announcement (Lines 185-187)

**Current Code**:
```tsx
<span className="sr-only">
  Currently {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
</span>
```

**New Code**:
```tsx
<span className="sr-only">
  {t('selectedSr', { count: selectedCount })}
</span>
```

---

#### 2.6 Replace "Processing..." text (Line 196)

**Current Code**:
```tsx
<span className="text-sm">Processing...</span>
```

**New Code**:
```tsx
<span className="text-sm">{t('processing')}</span>
```

---

#### 2.7 Replace action button labels (Lines 201-235)

**Current Code** (multiple locations):
```tsx
label="Delete"
label="Add Tag"
label="Remove Tag"
label="Move to Property"
```

**New Code**:
```tsx
label={t('delete')}
label={t('addTag')}
label={t('removeTag')}
label={t('moveToProperty')}
```

---

#### 2.8 Replace cancel button aria-label (Line 253)

**Current Code**:
```tsx
aria-label="Cancel selection"
title="Cancel selection"
```

**New Code**:
```tsx
aria-label={t('cancelSelection')}
title={t('cancelSelection')}
```

---

#### 2.9 Replace Cancel button text (Line 267)

**Current Code**:
```tsx
<span className="hidden sm:inline ml-1.5 text-sm font-medium">
  Cancel
</span>
```

**New Code**:
```tsx
<span className="hidden sm:inline ml-1.5 text-sm font-medium">
  {t('cancel')}
</span>
```

---

### Task 3: Update BulkTagDialog Component
**File**: `/src/components/ItemManager/components/BulkActions/BulkTagDialog.tsx`
**Estimated Effort**: 1.5 hours
**Story Points**: 2

#### 3.1 Import useTranslations hook

**Location**: Line 14 (after React imports)

**Code Change**:
```typescript
import { useTranslations } from 'next-intl';
```

---

#### 3.2 Initialize translation function

**Location**: Inside `BulkTagDialog` function, after line 117 (after props destructuring)

**Code Change**:
```typescript
export function BulkTagDialog({
  mode,
  selectedItems,
  // ... other props
}: BulkTagDialogProps) {
  // Add this line
  const t = useTranslations('items.bulk.tagDialog');

  // ... rest of component
```

---

#### 3.3 Update ItemPreviewList internal component (Lines 72-97)

This internal component needs access to translations. Two options:

**Option A (Recommended)**: Pass translations as props

**Current Code**:
```tsx
function ItemPreviewList({ items, maxDisplay = MAX_PREVIEW_ITEMS }: ItemPreviewListProps) {
  const displayItems = items.slice(0, maxDisplay);
  const remainingCount = items.length - maxDisplay;

  return (
    <div className="mt-4">
      <p className="text-sm font-medium text-gray-700 mb-2">Items to be updated:</p>
      // ...
      {remainingCount > 0 && (
        <p className="text-sm text-gray-500 italic mt-1">
          (and {remainingCount} more...)
        </p>
      )}
    </div>
  );
}
```

**New Code**:
```tsx
interface ItemPreviewListProps {
  items: ItemRecord[];
  maxDisplay?: number;
  headingText: string;
  andMoreText: (count: number) => string;
}

function ItemPreviewList({
  items,
  maxDisplay = MAX_PREVIEW_ITEMS,
  headingText,
  andMoreText
}: ItemPreviewListProps) {
  const displayItems = items.slice(0, maxDisplay);
  const remainingCount = items.length - maxDisplay;

  return (
    <div className="mt-4">
      <p className="text-sm font-medium text-gray-700 mb-2">{headingText}</p>
      <ul className="max-h-32 overflow-y-auto space-y-1">
        {displayItems.map((item) => (
          <li key={item.id} className="flex items-center text-sm text-gray-600">
            <span className="mr-2 text-gray-400">-</span>
            <span className="truncate">{item.title}</span>
          </li>
        ))}
      </ul>
      {remainingCount > 0 && (
        <p className="text-sm text-gray-500 italic mt-1">
          {andMoreText(remainingCount)}
        </p>
      )}
    </div>
  );
}
```

**Update usage** (Line 476):
```tsx
<ItemPreviewList
  items={selectedItems}
  headingText={t('itemsToUpdate')}
  andMoreText={(count) => t('andMore', { count })}
/>
```

---

#### 3.4 Replace dialog title (Lines 320-323)

**Current Code**:
```tsx
<h2 id={titleId} className="text-lg font-semibold text-gray-900">
  {mode === 'add' ? 'Add Tags' : 'Remove Tags'} from {itemCount} Item
  {itemCount !== 1 ? 's' : ''}
</h2>
```

**New Code**:
```tsx
<h2 id={titleId} className="text-lg font-semibold text-gray-900">
  {mode === 'add'
    ? t('addTitle', { count: itemCount })
    : t('removeTitle', { count: itemCount })}
</h2>
```

---

#### 3.5 Replace close button aria-label (Line 334)

**Current Code**:
```tsx
aria-label="Close dialog"
```

**New Code**:
```tsx
aria-label={t('closeDialog')}
```

---

#### 3.6 Replace "Enter tags to add:" label (Lines 346-348)

**Current Code**:
```tsx
<label className="block text-sm font-medium text-gray-700">
  Enter tags to add:
</label>
```

**New Code**:
```tsx
<label className="block text-sm font-medium text-gray-700">
  {t('enterTagsLabel')}
</label>
```

---

#### 3.7 Replace input placeholder (Lines 380-386)

**Current Code**:
```tsx
placeholder={
  tagsToAdd.length === 0
    ? 'Type a tag and press Enter...'
    : tagsToAdd.length >= MAX_TAGS_TO_ADD
    ? `Max ${MAX_TAGS_TO_ADD} tags`
    : ''
}
```

**New Code**:
```tsx
placeholder={
  tagsToAdd.length === 0
    ? t('inputPlaceholder')
    : tagsToAdd.length >= MAX_TAGS_TO_ADD
    ? t('maxTagsReached', { max: MAX_TAGS_TO_ADD })
    : ''
}
```

---

#### 3.8 Replace remove tag aria-label (Line 365)

**Current Code**:
```tsx
aria-label={`Remove ${tag} tag`}
```

**New Code**:
```tsx
aria-label={t('removeTagAriaLabel', { tag })}
```

---

#### 3.9 Replace "Suggested tags:" label (Line 400)

**Current Code**:
```tsx
<p className="text-xs text-gray-500">Suggested tags:</p>
```

**New Code**:
```tsx
<p className="text-xs text-gray-500">{t('suggestedTags')}</p>
```

---

#### 3.10 Replace "No tags found" message (Lines 427-429)

**Current Code**:
```tsx
<p className="text-sm text-gray-500 italic">
  No tags found on selected items.
</p>
```

**New Code**:
```tsx
<p className="text-sm text-gray-500 italic">
  {t('noTagsOnItems')}
</p>
```

---

#### 3.11 Replace "Select tags to remove:" label (Lines 432-434)

**Current Code**:
```tsx
<label className="block text-sm font-medium text-gray-700">
  Select tags to remove:
</label>
```

**New Code**:
```tsx
<label className="block text-sm font-medium text-gray-700">
  {t('selectTagsLabel')}
</label>
```

---

#### 3.12 Replace Cancel button (Line 493)

**Current Code**:
```tsx
>
  Cancel
</button>
```

**New Code**:
```tsx
>
  {t('cancel')}
</button>
```

---

#### 3.13 Replace confirm button text (Line 510)

**Current Code**:
```tsx
{mode === 'add' ? 'Add' : 'Remove'} {tagCount} Tag{tagCount !== 1 ? 's' : ''}
```

**New Code**:
```tsx
{mode === 'add'
  ? t('addConfirm', { count: tagCount })
  : t('removeConfirm', { count: tagCount })}
```

---

### Task 4: Update BulkMoveDialog Component
**File**: `/src/components/ItemManager/components/BulkActions/BulkMoveDialog.tsx`
**Estimated Effort**: 1.5 hours
**Story Points**: 2

#### 4.1 Import useTranslations hook

**Location**: Line 14 (after React imports)

**Code Change**:
```typescript
import { useTranslations } from 'next-intl';
```

---

#### 4.2 Initialize translation function

**Location**: Inside `BulkMoveDialog` function, after line 378 (after props destructuring)

**Code Change**:
```typescript
export function BulkMoveDialog({
  selectedItems,
  properties,
  // ... other props
}: BulkMoveDialogProps) {
  // Add this line
  const t = useTranslations('items.bulk.moveDialog');

  // ... rest of component
```

---

#### 4.3 Update PropertyDropdown internal component (Lines 95-296)

Pass translated strings as props to the internal component.

**Update PropertyDropdownProps interface**:
```typescript
interface PropertyDropdownProps {
  properties: Property[];
  selectedPropertyId: string;
  onSelect: (propertyId: string) => void;
  disabled?: boolean;
  placeholder?: string;
  noPropertiesText?: string;
  unknownPropertyText?: string;
  selectLabel?: string;
}
```

**Update empty state (Lines 194-199)**:

**Current Code**:
```tsx
if (properties.length === 0) {
  return (
    <div className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm">
      No properties available
    </div>
  );
}
```

**New Code**:
```tsx
if (properties.length === 0) {
  return (
    <div className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm">
      {noPropertiesText}
    </div>
  );
}
```

**Update displayName (Line 113-115)**:

**Current Code**:
```tsx
const displayName = selectedProperty
  ? selectedProperty.nickname || selectedProperty.name || 'Unknown Property'
  : placeholder;
```

**New Code**:
```tsx
const displayName = selectedProperty
  ? selectedProperty.nickname || selectedProperty.name || unknownPropertyText
  : placeholder;
```

**Update aria-label (Line 214)**:

**Current Code**:
```tsx
aria-label="Select destination property"
```

**New Code**:
```tsx
aria-label={selectLabel}
```

**Update Unknown Property fallback (Line 257)**:

**Current Code**:
```tsx
const displayText = property.nickname || property.name || 'Unknown Property';
```

**New Code**:
```tsx
const displayText = property.nickname || property.name || unknownPropertyText;
```

**Update PropertyDropdown usage**:
```tsx
<PropertyDropdown
  properties={availableProperties}
  selectedPropertyId={destinationPropertyId}
  onSelect={setDestinationPropertyId}
  disabled={loading}
  placeholder={t('selectPlaceholder')}
  noPropertiesText={t('noPropertiesAvailable')}
  unknownPropertyText={t('unknownProperty')}
  selectLabel={t('selectDestination')}
/>
```

---

#### 4.4 Update ItemPreviewList internal component (Lines 310-357)

Similar to BulkTagDialog, pass translations as props.

**Update ItemPreviewListProps**:
```typescript
interface ItemPreviewListProps {
  items: ItemRecord[];
  properties: Property[];
  maxDisplay?: number;
  headingText: string;
  fromPropertyText: (property: string) => string;
  andMoreText: (count: number) => string;
}
```

**Update "Items to move:" heading (Line 334)**:

**Current Code**:
```tsx
<p className="text-sm font-medium text-gray-700 mb-2">Items to move:</p>
```

**New Code**:
```tsx
<p className="text-sm font-medium text-gray-700 mb-2">{headingText}</p>
```

**Update "from: {property}" text (Line 344)**:

**Current Code**:
```tsx
<span className="text-xs text-gray-500">from: {propertyName}</span>
```

**New Code**:
```tsx
<span className="text-xs text-gray-500">{fromPropertyText(propertyName)}</span>
```

**Update overflow count (Lines 351-354)**:

**Current Code**:
```tsx
<p className="text-sm text-gray-500 italic mt-2 ml-4">
  (and {remainingCount} more...)
</p>
```

**New Code**:
```tsx
<p className="text-sm text-gray-500 italic mt-2 ml-4">
  {andMoreText(remainingCount)}
</p>
```

**Update ItemPreviewList usage**:
```tsx
<ItemPreviewList
  items={selectedItems}
  properties={properties}
  headingText={t('itemsToMove')}
  fromPropertyText={(property) => t('fromProperty', { property })}
  andMoreText={(count) => t('andMore', { count })}
/>
```

---

#### 4.5 Replace dialog title (Lines 486-488)

**Current Code**:
```tsx
<h2 id={titleId} className="text-lg font-semibold text-gray-900">
  Move {itemCount} {itemLabel} to Another Property
</h2>
```

**New Code**:
```tsx
<h2 id={titleId} className="text-lg font-semibold text-gray-900">
  {t('title', { count: itemCount })}
</h2>
```

---

#### 4.6 Replace close button aria-label (Line 500)

**Current Code**:
```tsx
aria-label="Close dialog"
```

**New Code**:
```tsx
aria-label={t('closeDialog')}
```

---

#### 4.7 Replace "Destination property" label (Lines 513-514)

**Current Code**:
```tsx
<label id={selectLabelId} className="block text-sm font-medium text-gray-700">
  Destination property
</label>
```

**New Code**:
```tsx
<label id={selectLabelId} className="block text-sm font-medium text-gray-700">
  {t('destinationLabel')}
</label>
```

---

#### 4.8 Replace "No other properties available" message (Line 518)

**Current Code**:
```tsx
<p className="text-sm text-gray-500">No other properties available</p>
```

**New Code**:
```tsx
<p className="text-sm text-gray-500">{t('noOtherProperties')}</p>
```

---

#### 4.9 Replace Cancel button (Line 551)

**Current Code**:
```tsx
>
  Cancel
</button>
```

**New Code**:
```tsx
>
  {t('cancel')}
</button>
```

---

#### 4.10 Replace confirm button text (Line 567)

**Current Code**:
```tsx
Move {itemCount} {itemLabel}
```

**New Code**:
```tsx
{t('confirm', { count: itemCount })}
```

---

### Task 5: Update ConfirmDeleteDialog Component
**File**: `/src/components/ItemManager/components/dialogs/ConfirmDeleteDialog.tsx`
**Estimated Effort**: 1 hour
**Story Points**: 1

#### 5.1 Import useTranslations hook

**Location**: Line 15 (after existing imports)

**Code Change**:
```typescript
import { useTranslations } from 'next-intl';
```

---

#### 5.2 Update helper functions to accept translations

The helper functions `getDeleteTitle`, `getDeleteMessage`, and `getConfirmButtonText` are exported and used elsewhere. We have two options:

**Option A (Recommended)**: Keep helpers but make them use translations

**Current Code (Lines 60-89)**:
```typescript
export function getDeleteTitle(count: number, customTitle?: string): string {
  if (customTitle) return customTitle;
  return count === 1 ? 'Delete Item' : 'Delete Items';
}

export function getDeleteMessage(count: number): string {
  if (count === 1) {
    return 'Are you sure you want to delete this item? This action cannot be undone.';
  }
  return `Are you sure you want to delete these ${count} items? This action cannot be undone.`;
}

export function getConfirmButtonText(count: number): string {
  if (count === 1) {
    return 'Delete';
  }
  return `Delete ${count} Items`;
}
```

**New Approach**: Create new internal functions that use translations and keep exported functions for backward compatibility:

```typescript
// Keep exported functions unchanged for backward compatibility
export function getDeleteTitle(count: number, customTitle?: string): string {
  if (customTitle) return customTitle;
  return count === 1 ? 'Delete Item' : 'Delete Items';
}

export function getDeleteMessage(count: number): string {
  if (count === 1) {
    return 'Are you sure you want to delete this item? This action cannot be undone.';
  }
  return `Are you sure you want to delete these ${count} items? This action cannot be undone.`;
}

export function getConfirmButtonText(count: number): string {
  if (count === 1) {
    return 'Delete';
  }
  return `Delete ${count} Items`;
}
```

Then use translations directly in the component.

---

#### 5.3 Initialize translation function in component

**Location**: Inside `ConfirmDeleteDialog` function, after line 148 (after props destructuring)

**Code Change**:
```typescript
export function ConfirmDeleteDialog({
  isOpen,
  items,
  onConfirm,
  onCancel,
  loading = false,
  title,
  className,
}: ConfirmDeleteDialogProps) {
  // Add this line
  const t = useTranslations('items.bulk.deleteDialog');

  // Don't render if not open or no items
  if (!isOpen || items.length === 0) {
    return null;
  }
  // ... rest of component
```

---

#### 5.4 Replace dialog title (Lines 197-201)

**Current Code**:
```tsx
<h3
  id="delete-dialog-title"
  className="text-lg font-semibold text-gray-900"
>
  {getDeleteTitle(itemCount, title)}
</h3>
```

**New Code**:
```tsx
<h3
  id="delete-dialog-title"
  className="text-lg font-semibold text-gray-900"
>
  {title || (itemCount === 1 ? t('titleSingle') : t('titleMultiple'))}
</h3>
```

---

#### 5.5 Replace confirmation message (Lines 203-208)

**Current Code**:
```tsx
<p
  id="delete-dialog-description"
  className="mt-2 text-sm text-gray-600"
>
  {getDeleteMessage(itemCount)}
</p>
```

**New Code**:
```tsx
<p
  id="delete-dialog-description"
  className="mt-2 text-sm text-gray-600"
>
  {itemCount === 1
    ? t('messageSingle')
    : t('messageMultiple', { count: itemCount })}
</p>
```

---

#### 5.6 Replace "and {count} more" text (Line 230)

**Current Code**:
```tsx
<span>and {overflowCount} more</span>
```

**New Code**:
```tsx
<span>{t('andMore', { count: overflowCount })}</span>
```

---

#### 5.7 Replace Cancel button (Line 252)

**Current Code**:
```tsx
>
  Cancel
</button>
```

**New Code**:
```tsx
>
  {t('cancel')}
</button>
```

---

#### 5.8 Replace loading/confirm button text (Lines 268-275)

**Current Code**:
```tsx
{loading ? (
  <>
    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
    <span>Deleting...</span>
  </>
) : (
  getConfirmButtonText(itemCount)
)}
```

**New Code**:
```tsx
{loading ? (
  <>
    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
    <span>{t('deleting')}</span>
  </>
) : (
  itemCount === 1 ? t('confirmSingle') : t('confirmMultiple', { count: itemCount })
)}
```

---

### Task 6: Add Translations to Non-English Language Files
**Files**: `/messages/fr.json`, `/messages/es.json`, `/messages/de.json`, `/messages/nl.json`, `/messages/it.json`
**Estimated Effort**: 1.5 hours
**Story Points**: 2

#### 6.1 French Translations (`/messages/fr.json`)

Add to the file:

```json
{
  "items": {
    "bulk": {
      "actions": {
        "toolbar": "Actions groupees pour {count, plural, one {# element selectionne} other {# elements selectionnes}}",
        "selected": "{count} selectionne(s)",
        "selectedSr": "Actuellement {count, plural, one {# element} other {# elements}} selectionne(s)",
        "processing": "Traitement en cours...",
        "delete": "Supprimer",
        "addTag": "Ajouter un tag",
        "removeTag": "Supprimer un tag",
        "moveToProperty": "Deplacer vers une propriete",
        "cancelSelection": "Annuler la selection",
        "cancel": "Annuler"
      },
      "tagDialog": {
        "addTitle": "Ajouter des tags a {count, plural, one {# element} other {# elements}}",
        "removeTitle": "Supprimer des tags de {count, plural, one {# element} other {# elements}}",
        "closeDialog": "Fermer la boite de dialogue",
        "itemsToUpdate": "Elements a mettre a jour :",
        "andMore": "(et {count} de plus...)",
        "enterTagsLabel": "Entrez les tags a ajouter :",
        "inputPlaceholder": "Tapez un tag et appuyez sur Entree...",
        "maxTagsReached": "Maximum {max} tags",
        "removeTagAriaLabel": "Supprimer le tag {tag}",
        "suggestedTags": "Tags suggeres :",
        "noTagsOnItems": "Aucun tag trouve sur les elements selectionnes.",
        "selectTagsLabel": "Selectionnez les tags a supprimer :",
        "cancel": "Annuler",
        "addConfirm": "Ajouter {count, plural, one {# tag} other {# tags}}",
        "removeConfirm": "Supprimer {count, plural, one {# tag} other {# tags}}"
      },
      "moveDialog": {
        "title": "Deplacer {count, plural, one {# element} other {# elements}} vers une autre propriete",
        "closeDialog": "Fermer la boite de dialogue",
        "noPropertiesAvailable": "Aucune propriete disponible",
        "selectDestination": "Selectionner la propriete de destination",
        "unknownProperty": "Propriete inconnue",
        "itemsToMove": "Elements a deplacer :",
        "fromProperty": "de : {property}",
        "andMore": "(et {count} de plus...)",
        "destinationLabel": "Propriete de destination",
        "noOtherProperties": "Aucune autre propriete disponible",
        "selectPlaceholder": "Selectionner la propriete de destination...",
        "cancel": "Annuler",
        "confirm": "Deplacer {count, plural, one {# element} other {# elements}}"
      },
      "deleteDialog": {
        "titleSingle": "Supprimer l'element",
        "titleMultiple": "Supprimer les elements",
        "messageSingle": "Etes-vous sur de vouloir supprimer cet element ? Cette action est irreversible.",
        "messageMultiple": "Etes-vous sur de vouloir supprimer ces {count} elements ? Cette action est irreversible.",
        "andMore": "et {count} de plus",
        "cancel": "Annuler",
        "deleting": "Suppression...",
        "confirmSingle": "Supprimer",
        "confirmMultiple": "Supprimer {count} elements"
      }
    }
  }
}
```

---

#### 6.2 Spanish Translations (`/messages/es.json`)

```json
{
  "items": {
    "bulk": {
      "actions": {
        "toolbar": "Acciones masivas para {count, plural, one {# elemento seleccionado} other {# elementos seleccionados}}",
        "selected": "{count} seleccionado(s)",
        "selectedSr": "Actualmente {count, plural, one {# elemento} other {# elementos}} seleccionado(s)",
        "processing": "Procesando...",
        "delete": "Eliminar",
        "addTag": "Agregar etiqueta",
        "removeTag": "Quitar etiqueta",
        "moveToProperty": "Mover a propiedad",
        "cancelSelection": "Cancelar seleccion",
        "cancel": "Cancelar"
      },
      "tagDialog": {
        "addTitle": "Agregar etiquetas a {count, plural, one {# elemento} other {# elementos}}",
        "removeTitle": "Quitar etiquetas de {count, plural, one {# elemento} other {# elementos}}",
        "closeDialog": "Cerrar dialogo",
        "itemsToUpdate": "Elementos a actualizar:",
        "andMore": "(y {count} mas...)",
        "enterTagsLabel": "Ingrese las etiquetas a agregar:",
        "inputPlaceholder": "Escriba una etiqueta y presione Enter...",
        "maxTagsReached": "Maximo {max} etiquetas",
        "removeTagAriaLabel": "Quitar etiqueta {tag}",
        "suggestedTags": "Etiquetas sugeridas:",
        "noTagsOnItems": "No se encontraron etiquetas en los elementos seleccionados.",
        "selectTagsLabel": "Seleccione las etiquetas a quitar:",
        "cancel": "Cancelar",
        "addConfirm": "Agregar {count, plural, one {# etiqueta} other {# etiquetas}}",
        "removeConfirm": "Quitar {count, plural, one {# etiqueta} other {# etiquetas}}"
      },
      "moveDialog": {
        "title": "Mover {count, plural, one {# elemento} other {# elementos}} a otra propiedad",
        "closeDialog": "Cerrar dialogo",
        "noPropertiesAvailable": "No hay propiedades disponibles",
        "selectDestination": "Seleccionar propiedad de destino",
        "unknownProperty": "Propiedad desconocida",
        "itemsToMove": "Elementos a mover:",
        "fromProperty": "de: {property}",
        "andMore": "(y {count} mas...)",
        "destinationLabel": "Propiedad de destino",
        "noOtherProperties": "No hay otras propiedades disponibles",
        "selectPlaceholder": "Seleccionar propiedad de destino...",
        "cancel": "Cancelar",
        "confirm": "Mover {count, plural, one {# elemento} other {# elementos}}"
      },
      "deleteDialog": {
        "titleSingle": "Eliminar elemento",
        "titleMultiple": "Eliminar elementos",
        "messageSingle": "Esta seguro de que desea eliminar este elemento? Esta accion no se puede deshacer.",
        "messageMultiple": "Esta seguro de que desea eliminar estos {count} elementos? Esta accion no se puede deshacer.",
        "andMore": "y {count} mas",
        "cancel": "Cancelar",
        "deleting": "Eliminando...",
        "confirmSingle": "Eliminar",
        "confirmMultiple": "Eliminar {count} elementos"
      }
    }
  }
}
```

---

#### 6.3 German Translations (`/messages/de.json`)

```json
{
  "items": {
    "bulk": {
      "actions": {
        "toolbar": "Massenaktionen fur {count, plural, one {# ausgewahltes Element} other {# ausgewahlte Elemente}}",
        "selected": "{count} ausgewahlt",
        "selectedSr": "Derzeit {count, plural, one {# Element} other {# Elemente}} ausgewahlt",
        "processing": "Verarbeitung...",
        "delete": "Loschen",
        "addTag": "Tag hinzufugen",
        "removeTag": "Tag entfernen",
        "moveToProperty": "Zu Objekt verschieben",
        "cancelSelection": "Auswahl abbrechen",
        "cancel": "Abbrechen"
      },
      "tagDialog": {
        "addTitle": "Tags zu {count, plural, one {# Element} other {# Elementen}} hinzufugen",
        "removeTitle": "Tags von {count, plural, one {# Element} other {# Elementen}} entfernen",
        "closeDialog": "Dialog schliessen",
        "itemsToUpdate": "Zu aktualisierende Elemente:",
        "andMore": "(und {count} weitere...)",
        "enterTagsLabel": "Tags zum Hinzufugen eingeben:",
        "inputPlaceholder": "Tag eingeben und Enter drucken...",
        "maxTagsReached": "Maximal {max} Tags",
        "removeTagAriaLabel": "Tag {tag} entfernen",
        "suggestedTags": "Vorgeschlagene Tags:",
        "noTagsOnItems": "Keine Tags auf ausgewahlten Elementen gefunden.",
        "selectTagsLabel": "Tags zum Entfernen auswahlen:",
        "cancel": "Abbrechen",
        "addConfirm": "{count, plural, one {# Tag} other {# Tags}} hinzufugen",
        "removeConfirm": "{count, plural, one {# Tag} other {# Tags}} entfernen"
      },
      "moveDialog": {
        "title": "{count, plural, one {# Element} other {# Elemente}} zu einem anderen Objekt verschieben",
        "closeDialog": "Dialog schliessen",
        "noPropertiesAvailable": "Keine Objekte verfugbar",
        "selectDestination": "Zielobjekt auswahlen",
        "unknownProperty": "Unbekanntes Objekt",
        "itemsToMove": "Zu verschiebende Elemente:",
        "fromProperty": "von: {property}",
        "andMore": "(und {count} weitere...)",
        "destinationLabel": "Zielobjekt",
        "noOtherProperties": "Keine anderen Objekte verfugbar",
        "selectPlaceholder": "Zielobjekt auswahlen...",
        "cancel": "Abbrechen",
        "confirm": "{count, plural, one {# Element} other {# Elemente}} verschieben"
      },
      "deleteDialog": {
        "titleSingle": "Element loschen",
        "titleMultiple": "Elemente loschen",
        "messageSingle": "Sind Sie sicher, dass Sie dieses Element loschen mochten? Diese Aktion kann nicht ruckgangig gemacht werden.",
        "messageMultiple": "Sind Sie sicher, dass Sie diese {count} Elemente loschen mochten? Diese Aktion kann nicht ruckgangig gemacht werden.",
        "andMore": "und {count} weitere",
        "cancel": "Abbrechen",
        "deleting": "Loschen...",
        "confirmSingle": "Loschen",
        "confirmMultiple": "{count} Elemente loschen"
      }
    }
  }
}
```

---

#### 6.4 Dutch Translations (`/messages/nl.json`)

```json
{
  "items": {
    "bulk": {
      "actions": {
        "toolbar": "Bulkacties voor {count, plural, one {# geselecteerd item} other {# geselecteerde items}}",
        "selected": "{count} geselecteerd",
        "selectedSr": "Momenteel {count, plural, one {# item} other {# items}} geselecteerd",
        "processing": "Verwerken...",
        "delete": "Verwijderen",
        "addTag": "Tag toevoegen",
        "removeTag": "Tag verwijderen",
        "moveToProperty": "Naar eigendom verplaatsen",
        "cancelSelection": "Selectie annuleren",
        "cancel": "Annuleren"
      },
      "tagDialog": {
        "addTitle": "Tags toevoegen aan {count, plural, one {# item} other {# items}}",
        "removeTitle": "Tags verwijderen van {count, plural, one {# item} other {# items}}",
        "closeDialog": "Dialoog sluiten",
        "itemsToUpdate": "Items om bij te werken:",
        "andMore": "(en {count} meer...)",
        "enterTagsLabel": "Voer tags in om toe te voegen:",
        "inputPlaceholder": "Typ een tag en druk op Enter...",
        "maxTagsReached": "Maximaal {max} tags",
        "removeTagAriaLabel": "Tag {tag} verwijderen",
        "suggestedTags": "Voorgestelde tags:",
        "noTagsOnItems": "Geen tags gevonden op geselecteerde items.",
        "selectTagsLabel": "Selecteer tags om te verwijderen:",
        "cancel": "Annuleren",
        "addConfirm": "{count, plural, one {# tag} other {# tags}} toevoegen",
        "removeConfirm": "{count, plural, one {# tag} other {# tags}} verwijderen"
      },
      "moveDialog": {
        "title": "{count, plural, one {# item} other {# items}} verplaatsen naar een ander eigendom",
        "closeDialog": "Dialoog sluiten",
        "noPropertiesAvailable": "Geen eigendommen beschikbaar",
        "selectDestination": "Selecteer doeleigendom",
        "unknownProperty": "Onbekend eigendom",
        "itemsToMove": "Items om te verplaatsen:",
        "fromProperty": "van: {property}",
        "andMore": "(en {count} meer...)",
        "destinationLabel": "Doeleigendom",
        "noOtherProperties": "Geen andere eigendommen beschikbaar",
        "selectPlaceholder": "Selecteer doeleigendom...",
        "cancel": "Annuleren",
        "confirm": "{count, plural, one {# item} other {# items}} verplaatsen"
      },
      "deleteDialog": {
        "titleSingle": "Item verwijderen",
        "titleMultiple": "Items verwijderen",
        "messageSingle": "Weet u zeker dat u dit item wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.",
        "messageMultiple": "Weet u zeker dat u deze {count} items wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.",
        "andMore": "en {count} meer",
        "cancel": "Annuleren",
        "deleting": "Verwijderen...",
        "confirmSingle": "Verwijderen",
        "confirmMultiple": "{count} items verwijderen"
      }
    }
  }
}
```

---

#### 6.5 Italian Translations (`/messages/it.json`)

```json
{
  "items": {
    "bulk": {
      "actions": {
        "toolbar": "Azioni di massa per {count, plural, one {# elemento selezionato} other {# elementi selezionati}}",
        "selected": "{count} selezionato/i",
        "selectedSr": "Attualmente {count, plural, one {# elemento} other {# elementi}} selezionato/i",
        "processing": "Elaborazione...",
        "delete": "Elimina",
        "addTag": "Aggiungi tag",
        "removeTag": "Rimuovi tag",
        "moveToProperty": "Sposta in proprieta",
        "cancelSelection": "Annulla selezione",
        "cancel": "Annulla"
      },
      "tagDialog": {
        "addTitle": "Aggiungi tag a {count, plural, one {# elemento} other {# elementi}}",
        "removeTitle": "Rimuovi tag da {count, plural, one {# elemento} other {# elementi}}",
        "closeDialog": "Chiudi finestra di dialogo",
        "itemsToUpdate": "Elementi da aggiornare:",
        "andMore": "(e altri {count}...)",
        "enterTagsLabel": "Inserisci i tag da aggiungere:",
        "inputPlaceholder": "Digita un tag e premi Invio...",
        "maxTagsReached": "Massimo {max} tag",
        "removeTagAriaLabel": "Rimuovi tag {tag}",
        "suggestedTags": "Tag suggeriti:",
        "noTagsOnItems": "Nessun tag trovato sugli elementi selezionati.",
        "selectTagsLabel": "Seleziona i tag da rimuovere:",
        "cancel": "Annulla",
        "addConfirm": "Aggiungi {count, plural, one {# tag} other {# tag}}",
        "removeConfirm": "Rimuovi {count, plural, one {# tag} other {# tag}}"
      },
      "moveDialog": {
        "title": "Sposta {count, plural, one {# elemento} other {# elementi}} in un'altra proprieta",
        "closeDialog": "Chiudi finestra di dialogo",
        "noPropertiesAvailable": "Nessuna proprieta disponibile",
        "selectDestination": "Seleziona proprieta di destinazione",
        "unknownProperty": "Proprieta sconosciuta",
        "itemsToMove": "Elementi da spostare:",
        "fromProperty": "da: {property}",
        "andMore": "(e altri {count}...)",
        "destinationLabel": "Proprieta di destinazione",
        "noOtherProperties": "Nessun'altra proprieta disponibile",
        "selectPlaceholder": "Seleziona proprieta di destinazione...",
        "cancel": "Annulla",
        "confirm": "Sposta {count, plural, one {# elemento} other {# elementi}}"
      },
      "deleteDialog": {
        "titleSingle": "Elimina elemento",
        "titleMultiple": "Elimina elementi",
        "messageSingle": "Sei sicuro di voler eliminare questo elemento? Questa azione non puo essere annullata.",
        "messageMultiple": "Sei sicuro di voler eliminare questi {count} elementi? Questa azione non puo essere annullata.",
        "andMore": "e altri {count}",
        "cancel": "Annulla",
        "deleting": "Eliminazione...",
        "confirmSingle": "Elimina",
        "confirmMultiple": "Elimina {count} elementi"
      }
    }
  }
}
```

---

### Task 7: Testing and Verification
**Estimated Effort**: 1.5 hours
**Story Points**: 2

#### 7.1 Verify JSON Syntax

Run JSON validation on all translation files:

```bash
# From project root
node -e "JSON.parse(require('fs').readFileSync('./messages/en.json'))"
node -e "JSON.parse(require('fs').readFileSync('./messages/fr.json'))"
node -e "JSON.parse(require('fs').readFileSync('./messages/es.json'))"
node -e "JSON.parse(require('fs').readFileSync('./messages/de.json'))"
node -e "JSON.parse(require('fs').readFileSync('./messages/nl.json'))"
node -e "JSON.parse(require('fs').readFileSync('./messages/it.json'))"
```

---

#### 7.2 Build Verification

Run the build to check for TypeScript errors:

```bash
npm run build
```

**Expected**: No TypeScript errors related to translation imports or usage

---

#### 7.3 Visual Testing Checklist

Test each component in English and at least one other language:

**BulkActionsBar**:
- [ ] Selection count displays correctly with 1 item
- [ ] Selection count displays correctly with multiple items
- [ ] All button labels display correctly
- [ ] "Processing..." state displays correctly
- [ ] Screen reader announcements are correct

**BulkTagDialog - Add Mode**:
- [ ] Dialog title shows correct pluralization
- [ ] Label "Enter tags to add:" displays correctly
- [ ] Input placeholder shows correctly
- [ ] "Max X tags" shows when limit reached
- [ ] "Suggested tags:" label displays
- [ ] Remove tag aria-label includes tag name
- [ ] Confirm button shows correct count
- [ ] Cancel button displays correctly

**BulkTagDialog - Remove Mode**:
- [ ] Dialog title shows correct pluralization
- [ ] "Select tags to remove:" label displays
- [ ] "No tags found" message displays when applicable
- [ ] Confirm button shows correct count

**BulkMoveDialog**:
- [ ] Dialog title shows correct pluralization
- [ ] "Destination property" label displays
- [ ] Placeholder text displays correctly
- [ ] "No other properties available" message displays
- [ ] "from: {property}" displays with property name
- [ ] Confirm button shows correct count

**ConfirmDeleteDialog**:
- [ ] Title singular/plural correct
- [ ] Message singular/plural correct
- [ ] "and X more" displays correctly
- [ ] "Deleting..." loading state displays
- [ ] Confirm button shows correct count

---

#### 7.4 Language Switching Test

1. Navigate to ItemManager with items selected
2. Open language switcher
3. Change to each supported language
4. Verify all bulk action dialogs display correctly in each language
5. Verify pluralization works (test with 1 item, 2 items, 5 items)

---

#### 7.5 Accessibility Testing

- [ ] Run axe-core or similar tool on each dialog
- [ ] Verify all aria-labels are translated
- [ ] Test with screen reader (VoiceOver/NVDA)
- [ ] Verify keyboard navigation still works

---

## Translation Keys Reference

### Complete Key Structure

```
items.bulk.actions.toolbar
items.bulk.actions.selected
items.bulk.actions.selectedSr
items.bulk.actions.processing
items.bulk.actions.delete
items.bulk.actions.addTag
items.bulk.actions.removeTag
items.bulk.actions.moveToProperty
items.bulk.actions.cancelSelection
items.bulk.actions.cancel

items.bulk.tagDialog.addTitle
items.bulk.tagDialog.removeTitle
items.bulk.tagDialog.closeDialog
items.bulk.tagDialog.itemsToUpdate
items.bulk.tagDialog.andMore
items.bulk.tagDialog.enterTagsLabel
items.bulk.tagDialog.inputPlaceholder
items.bulk.tagDialog.maxTagsReached
items.bulk.tagDialog.removeTagAriaLabel
items.bulk.tagDialog.suggestedTags
items.bulk.tagDialog.noTagsOnItems
items.bulk.tagDialog.selectTagsLabel
items.bulk.tagDialog.cancel
items.bulk.tagDialog.addConfirm
items.bulk.tagDialog.removeConfirm

items.bulk.moveDialog.title
items.bulk.moveDialog.closeDialog
items.bulk.moveDialog.noPropertiesAvailable
items.bulk.moveDialog.selectDestination
items.bulk.moveDialog.unknownProperty
items.bulk.moveDialog.itemsToMove
items.bulk.moveDialog.fromProperty
items.bulk.moveDialog.andMore
items.bulk.moveDialog.destinationLabel
items.bulk.moveDialog.noOtherProperties
items.bulk.moveDialog.selectPlaceholder
items.bulk.moveDialog.cancel
items.bulk.moveDialog.confirm

items.bulk.deleteDialog.titleSingle
items.bulk.deleteDialog.titleMultiple
items.bulk.deleteDialog.messageSingle
items.bulk.deleteDialog.messageMultiple
items.bulk.deleteDialog.andMore
items.bulk.deleteDialog.cancel
items.bulk.deleteDialog.deleting
items.bulk.deleteDialog.confirmSingle
items.bulk.deleteDialog.confirmMultiple
```

---

## Implementation Details

### ICU MessageFormat Pluralization

All count-based strings use ICU MessageFormat for proper pluralization:

```
{count, plural, one {# item} other {# items}}
```

This automatically selects the correct form based on:
- The count value
- The current locale's pluralization rules

**Languages with special plural rules handled**:
- English: one, other
- French: one, other (0 and 1 are singular)
- Spanish: one, other
- German: one, other
- Dutch: one, other
- Italian: one, other

---

### Variable Interpolation

Variables are interpolated using curly brace syntax:

```
"fromProperty": "from: {property}"
```

Usage in code:
```typescript
t('fromProperty', { property: propertyName })
```

---

## Acceptance Criteria Checklist

- [ ] All bulk action dialog titles use translation keys with proper context for each operation type
- [ ] Warning messages describing bulk action consequences are retrieved from translation keys
- [ ] Item count indicators in dialog content use translation keys with proper singular and plural forms for each supported language
- [ ] Confirmation checkbox labels requesting user acknowledgment use translation keys (if applicable)
- [ ] Primary action button labels use translation keys appropriate to each bulk operation
- [ ] Secondary action button labels (Cancel, Close) use translation keys from common namespace or dialog-specific namespace
- [ ] Validation error messages that prevent bulk operations use translation keys (if applicable)
- [ ] Progress indicator messages during bulk operation execution use translation keys
- [ ] Success and failure feedback messages after bulk operations complete use translation keys (if applicable in toast notifications)
- [ ] Dialog content maintains proper formatting and layout when rendered in languages with longer text strings
- [ ] Pluralization rules are correctly applied based on item counts and target language grammar
- [ ] All bulk action dialogs maintain existing functionality including validation, progress tracking, and error handling
- [ ] Translation keys follow established naming conventions for the items namespace
- [ ] Destructive action dialogs emphasize warnings appropriately regardless of language

---

## References

- [Overview Document](./REQ-389-update-bulk-action-dialogs-overview.md)
- [Implementation Plan: Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [Request Definition](/docs/gen_requests_epic2.md#req-389)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)

---

*Document generated for FAQBNB Localization Epic 2 - Sub-Epic 2D Item Management - Task 2D.5*
