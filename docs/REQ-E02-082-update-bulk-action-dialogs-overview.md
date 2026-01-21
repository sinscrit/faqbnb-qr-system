# REQ-E02-082: Update Bulk Action Dialogs for Internationalization

**Document Type:** Implementation Breakdown (Overview)
**Request ID:** REQ-E02-082
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2D - Item Management
**Task Reference:** 2D.5
**Priority:** High
**Size:** M (Medium)

**Created:** 2026-01-20
**Last Modified:** 2026-01-20

---

## 1. Summary

This document provides the implementation breakdown for adding internationalization support to all bulk action dialogs in the ItemManager system. These dialogs include BulkActionsBar, BulkTagDialog, BulkMoveDialog, and ConfirmDeleteDialog. The implementation requires integrating next-intl translations for all hardcoded UI strings, including dialog titles, confirmation messages, button labels, item counts, empty states, and accessibility attributes, ensuring users can manage items in bulk using French, Spanish, German, Italian, and Dutch interfaces.

---

## 2. Requirements Analysis

### 2.1 Source Request Overview

**From:** `/docs/gen_requests_epic2.md` - Request #82

The bulk action dialogs must be updated to:
1. Display localized dialog titles and descriptions using next-intl translation hooks
2. Translate confirmation prompts showing item counts and operation details
3. Provide translated action button labels (confirm, cancel, proceed, etc.)
4. Translate success and error messages after bulk operations complete
5. Translate warning text about irreversible actions
6. Ensure item counts and numeric values follow locale formatting rules
7. Support language switching without page reload
8. Update all accessibility attributes (aria-labels) to reflect the current language

### 2.2 Current Behavior

**BulkActionsBar** (`src/components/ItemManager/components/BulkActions/BulkActionsBar.tsx`):
- Hardcoded aria-label (line 155): ``Bulk actions for ${selectedCount} selected item${selectedCount !== 1 ? 's' : ''}``
- Hardcoded count display (line 182): `{selectedCount} selected`
- Hardcoded screen reader text (lines 185-187): `Currently {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected`
- Hardcoded processing text (line 196): `Processing...`
- Hardcoded button labels (lines 203, 213, 219, 231, 267):
  - `"Delete"`, `"Add Tag"`, `"Remove Tag"`, `"Move to Property"`, `"Cancel"`
- Hardcoded cancel button aria-label (line 253): `"Cancel selection"`

**BulkTagDialog** (`src/components/ItemManager/components/BulkActions/BulkTagDialog.tsx`):
- Hardcoded close button aria-label (line 334): `"Close dialog"`
- Hardcoded dialog title (lines 320-322): `{mode === 'add' ? 'Add Tags' : 'Remove Tags'} from {itemCount} Item{itemCount !== 1 ? 's' : ''}`
- Hardcoded preview list header (line 81): `"Items to be updated:"`
- Hardcoded overflow message (lines 91-93): `"(and {remainingCount} more...)"`
- Hardcoded tag input label (line 346): `"Enter tags to add:"`
- Hardcoded input placeholder (lines 381-384): `"Type a tag and press Enter..."`, `"Max {MAX_TAGS_TO_ADD} tags"`
- Hardcoded suggestions label (line 400): `"Suggested tags:"`
- Hardcoded remove tag aria-label (line 365): `Remove ${tag} tag`
- Hardcoded no tags message (lines 427-429): `"No tags found on selected items."`
- Hardcoded select tags label (lines 432-433): `"Select tags to remove:"`
- Hardcoded cancel button (line 493): `"Cancel"`
- Hardcoded confirm button (line 510): `{mode === 'add' ? 'Add' : 'Remove'} {tagCount} Tag{tagCount !== 1 ? 's' : ''}`

**BulkMoveDialog** (`src/components/ItemManager/components/BulkActions/BulkMoveDialog.tsx`):
- Hardcoded placeholder default (line 100): `"Select a property..."`
- Hardcoded empty state (lines 196-198): `"No properties available"`
- Hardcoded aria-label (line 214): `"Select destination property"`
- Hardcoded unknown property (lines 114, 257): `"Unknown Property"`
- Hardcoded aria-label (line 248): `"Available properties"`
- Hardcoded close button aria-label (line 501): `"Close dialog"`
- Hardcoded dialog title (lines 486-487): `Move {itemCount} {itemLabel} to Another Property`
- Hardcoded preview header (line 334): `"Items to move:"`
- Hardcoded "from:" prefix (line 344): `"from: {propertyName}"`
- Hardcoded overflow message (lines 351-353): `"(and {remainingCount} more...)"`
- Hardcoded destination label (lines 512-514): `"Destination property"`
- Hardcoded no properties message (line 518): `"No other properties available"`
- Hardcoded dropdown placeholder (line 526): `"Select destination property..."`
- Hardcoded cancel button (line 551): `"Cancel"`
- Hardcoded confirm button (line 567): `Move {itemCount} {itemLabel}`

**ConfirmDeleteDialog** (`src/components/ItemManager/components/dialogs/ConfirmDeleteDialog.tsx`):
- Hardcoded helper functions (lines 60-75, 84-88):
  - `getDeleteTitle`: Returns `'Delete Item'` or `'Delete Items'`
  - `getDeleteMessage`: Returns `'Are you sure you want to delete this item? This action cannot be undone.'` or variant
  - `getConfirmButtonText`: Returns `'Delete'` or `'Delete {count} Items'`
- Hardcoded overflow message (lines 228-230): `"and {overflowCount} more"`
- Hardcoded cancel button (line 251): `"Cancel"`
- Hardcoded loading text (line 271): `"Deleting..."`

### 2.3 Expected Behavior

After implementation:
1. All dialog titles use translation hooks with pluralization (`useTranslations('items.bulk')`)
2. Confirmation messages display item counts in the selected language with ICU plural format
3. All button labels (Delete, Add Tag, Remove Tag, Move, Cancel, etc.) display translated text
4. Empty state messages display in the selected language
5. Success/error notifications use translated messages
6. All aria-labels reflect the selected language for accessibility
7. Components respond to locale context changes without page reload
8. Numeric values (item counts, tag counts) follow locale formatting rules

---

## 3. Technical Approach

### 3.1 Architecture Pattern

Following the established Epic 2 pattern for client components:

```typescript
// Pattern for bulk action dialogs
'use client';
import { useTranslations } from 'next-intl';

function BulkActionDialog() {
  const t = useTranslations('items.bulk');
  return <h2>{t('delete.title', { count: itemCount })}</h2>;
}
```

### 3.2 Translation Namespace

All translations will be added to the `items` namespace in `/messages/*.json` under a new `bulk` sub-namespace:

```json
{
  "items": {
    "bulk": {
      "actionsBar": {
        "ariaLabel": "{count, plural, one {Bulk actions for # selected item} other {Bulk actions for # selected items}}",
        "selected": "{count} selected",
        "srAnnouncement": "{count, plural, one {Currently # item selected} other {Currently # items selected}}",
        "processing": "Processing...",
        "delete": "Delete",
        "addTag": "Add Tag",
        "removeTag": "Remove Tag",
        "moveToProperty": "Move to Property",
        "cancel": "Cancel",
        "cancelSelection": "Cancel selection"
      },
      "tagDialog": {
        "closeDialog": "Close dialog",
        "addTitle": "{count, plural, one {Add Tags to # Item} other {Add Tags to # Items}}",
        "removeTitle": "{count, plural, one {Remove Tags from # Item} other {Remove Tags from # Items}}",
        "itemsToUpdate": "Items to be updated:",
        "andMore": "(and {count} more...)",
        "enterTags": "Enter tags to add:",
        "inputPlaceholder": "Type a tag and press Enter...",
        "maxTagsReached": "Max {max} tags",
        "suggestedTags": "Suggested tags:",
        "removeTagAriaLabel": "Remove {tag} tag",
        "noTagsFound": "No tags found on selected items.",
        "selectTagsToRemove": "Select tags to remove:",
        "cancelButton": "Cancel",
        "addButton": "{count, plural, one {Add # Tag} other {Add # Tags}}",
        "removeButton": "{count, plural, one {Remove # Tag} other {Remove # Tags}}"
      },
      "moveDialog": {
        "selectProperty": "Select a property...",
        "noPropertiesAvailable": "No properties available",
        "selectDestination": "Select destination property",
        "unknownProperty": "Unknown Property",
        "availableProperties": "Available properties",
        "closeDialog": "Close dialog",
        "title": "{count, plural, one {Move # Item to Another Property} other {Move # Items to Another Property}}",
        "itemsToMove": "Items to move:",
        "fromProperty": "from: {property}",
        "andMore": "(and {count} more...)",
        "destinationProperty": "Destination property",
        "noOtherProperties": "No other properties available",
        "selectDestinationPlaceholder": "Select destination property...",
        "cancelButton": "Cancel",
        "moveButton": "{count, plural, one {Move # Item} other {Move # Items}}"
      },
      "deleteDialog": {
        "title": "{count, plural, one {Delete Item} other {Delete Items}}",
        "message": "{count, plural, one {Are you sure you want to delete this item? This action cannot be undone.} other {Are you sure you want to delete these # items? This action cannot be undone.}}",
        "andMore": "and {count} more",
        "cancelButton": "Cancel",
        "confirmButton": "{count, plural, one {Delete} other {Delete # Items}}",
        "deleting": "Deleting..."
      }
    }
  }
}
```

### 3.3 Dependencies

| Dependency | Status | Location |
|------------|--------|----------|
| next-intl | Installed | `package.json` |
| useTranslations hook | Available | `next-intl` |
| Translation files | Exists | `/messages/*.json` |
| items namespace | Exists | `/messages/en.json` |
| LocaleContext | Available | `src/contexts/LocaleContext.tsx` |

---

## 4. Implementation Tasks

### Task 1: Extend items namespace in translation files (Priority: High)

**Description:** Add new translation keys for bulk action dialogs to all 6 language files.

**Files to Modify:**
- `/messages/en.json`
- `/messages/fr.json`
- `/messages/es.json`
- `/messages/de.json`
- `/messages/nl.json`
- `/messages/it.json`

**Acceptance Criteria:**
- [ ] Add `items.bulk.actionsBar.*` keys for BulkActionsBar translations
- [ ] Add `items.bulk.tagDialog.*` keys for BulkTagDialog translations
- [ ] Add `items.bulk.moveDialog.*` keys for BulkMoveDialog translations
- [ ] Add `items.bulk.deleteDialog.*` keys for ConfirmDeleteDialog translations
- [ ] All keys use ICU plural format for count-dependent strings
- [ ] All 6 language files contain identical key structure

---

### Task 2: Update BulkActionsBar component for i18n (Priority: High)

**Description:** Add translation hook and replace all hardcoded strings with translated values.

**File to Modify:** `src/components/ItemManager/components/BulkActions/BulkActionsBar.tsx`

**Current Code (lines 155, 182, 196, 203, etc.):**
```typescript
aria-label={`Bulk actions for ${selectedCount} selected item${selectedCount !== 1 ? 's' : ''}`}
// ...
<span>{selectedCount} selected</span>
// ...
<span>Processing...</span>
// ...
label="Delete"
label="Add Tag"
label="Remove Tag"
label="Move to Property"
// ...
aria-label="Cancel selection"
<span>Cancel</span>
```

**Target Approach:**
```typescript
import { useTranslations } from 'next-intl';

export function BulkActionsBar({ ... }: BulkActionsBarProps) {
  const t = useTranslations('items.bulk.actionsBar');

  return (
    <div
      role="toolbar"
      aria-label={t('ariaLabel', { count: selectedCount })}
    >
      <span>{t('selected', { count: selectedCount })}</span>
      <span className="sr-only">{t('srAnnouncement', { count: selectedCount })}</span>

      {loading ? (
        <span>{t('processing')}</span>
      ) : (
        <>
          <ActionButton label={t('delete')} ... />
          <ActionButton label={t('addTag')} ... />
          <ActionButton label={t('removeTag')} ... />
          {multiPropertyMode && <ActionButton label={t('moveToProperty')} ... />}
        </>
      )}

      <button aria-label={t('cancelSelection')}>
        <span>{t('cancel')}</span>
      </button>
    </div>
  );
}
```

**Acceptance Criteria:**
- [ ] Import `useTranslations` from `next-intl`
- [ ] Initialize translation hook with `items.bulk.actionsBar` namespace
- [ ] Replace toolbar aria-label with translated plural string
- [ ] Replace selected count display with translation
- [ ] Replace screen reader announcement with translation
- [ ] Replace "Processing..." text with translation
- [ ] Replace all button labels with translations
- [ ] Replace cancel button aria-label with translation
- [ ] TypeScript compiles without errors

---

### Task 3: Update BulkTagDialog component for i18n (Priority: High)

**Description:** Add translation hook and replace all hardcoded strings including pluralized counts.

**File to Modify:** `src/components/ItemManager/components/BulkActions/BulkTagDialog.tsx`

**Current Code (various lines):**
```typescript
// Dialog title
{mode === 'add' ? 'Add Tags' : 'Remove Tags'} from {itemCount} Item{itemCount !== 1 ? 's' : ''}
// Preview list
"Items to be updated:"
"(and {remainingCount} more...)"
// Form labels
"Enter tags to add:"
"Type a tag and press Enter..."
"Suggested tags:"
aria-label={`Remove ${tag} tag`}
// Empty state
"No tags found on selected items."
"Select tags to remove:"
// Buttons
"Cancel"
{mode === 'add' ? 'Add' : 'Remove'} {tagCount} Tag{tagCount !== 1 ? 's' : ''}
```

**Target Approach:**
```typescript
import { useTranslations } from 'next-intl';

export function BulkTagDialog({ mode, ... }: BulkTagDialogProps) {
  const t = useTranslations('items.bulk.tagDialog');

  const dialogTitle = mode === 'add'
    ? t('addTitle', { count: itemCount })
    : t('removeTitle', { count: itemCount });

  const confirmButtonText = mode === 'add'
    ? t('addButton', { count: tagCount })
    : t('removeButton', { count: tagCount });

  return (
    <div role="dialog" aria-labelledby={titleId}>
      <button aria-label={t('closeDialog')} ...>
      <h2 id={titleId}>{dialogTitle}</h2>

      <p>{t('itemsToUpdate')}</p>
      <p>{t('andMore', { count: remainingCount })}</p>

      {mode === 'add' ? (
        <>
          <label>{t('enterTags')}</label>
          <input placeholder={
            tagsToAdd.length === 0 ? t('inputPlaceholder')
            : tagsToAdd.length >= MAX_TAGS_TO_ADD ? t('maxTagsReached', { max: MAX_TAGS_TO_ADD })
            : ''
          } />
          <p>{t('suggestedTags')}</p>
          <button aria-label={t('removeTagAriaLabel', { tag })} ...>
        </>
      ) : (
        <>
          {allTagsOnSelectedItems.length === 0 ? (
            <p>{t('noTagsFound')}</p>
          ) : (
            <label>{t('selectTagsToRemove')}</label>
          )}
        </>
      )}

      <button>{t('cancelButton')}</button>
      <button>{confirmButtonText}</button>
    </div>
  );
}
```

**Acceptance Criteria:**
- [ ] Import `useTranslations` from `next-intl`
- [ ] Initialize translation hook with `items.bulk.tagDialog` namespace
- [ ] Replace dialog title with mode-aware pluralized translation
- [ ] Replace close button aria-label with translation
- [ ] Replace "Items to be updated:" with translation
- [ ] Replace overflow message with translation
- [ ] Replace form labels with translations
- [ ] Replace input placeholders with translations
- [ ] Replace "Suggested tags:" with translation
- [ ] Replace remove tag aria-label with interpolated translation
- [ ] Replace empty state messages with translations
- [ ] Replace confirm button text with mode-aware pluralized translation
- [ ] Update internal `ItemPreviewList` component strings
- [ ] TypeScript compiles without errors

---

### Task 4: Update BulkMoveDialog component for i18n (Priority: High)

**Description:** Add translation hook and replace all hardcoded strings including pluralized counts.

**File to Modify:** `src/components/ItemManager/components/BulkActions/BulkMoveDialog.tsx`

**Current Code (various lines):**
```typescript
// PropertyDropdown defaults
placeholder = 'Select a property...'
"No properties available"
aria-label="Select destination property"
"Unknown Property"
aria-label="Available properties"
// Dialog
aria-label="Close dialog"
Move {itemCount} {itemLabel} to Another Property
// ItemPreviewList
"Items to move:"
"from: {propertyName}"
"(and {remainingCount} more...)"
// Form
"Destination property"
"No other properties available"
"Select destination property..."
// Buttons
"Cancel"
Move {itemCount} {itemLabel}
```

**Target Approach:**
```typescript
import { useTranslations } from 'next-intl';

export function BulkMoveDialog({ ... }: BulkMoveDialogProps) {
  const t = useTranslations('items.bulk.moveDialog');

  return (
    <div role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <button aria-label={t('closeDialog')} ...>
      <h2 id={titleId}>{t('title', { count: itemCount })}</h2>

      <label>{t('destinationProperty')}</label>
      <PropertyDropdown
        placeholder={t('selectDestinationPlaceholder')}
        emptyMessage={t('noOtherProperties')}
      />

      <ItemPreviewList ... />

      <button>{t('cancelButton')}</button>
      <button>{t('moveButton', { count: itemCount })}</button>
    </div>
  );
}

// Update PropertyDropdown to accept translated strings
function PropertyDropdown({ placeholder, ... }) {
  const t = useTranslations('items.bulk.moveDialog');
  // Use t('noPropertiesAvailable') for empty state
  // Use t('unknownProperty') for unknown property names
  // Use t('selectDestination') for aria-label
  // Use t('availableProperties') for listbox aria-label
}

// Update ItemPreviewList to accept translated strings
function ItemPreviewList({ ... }) {
  const t = useTranslations('items.bulk.moveDialog');
  // Use t('itemsToMove') for header
  // Use t('fromProperty', { property: propertyName }) for source
  // Use t('andMore', { count: remainingCount }) for overflow
}
```

**Acceptance Criteria:**
- [ ] Import `useTranslations` from `next-intl`
- [ ] Initialize translation hook with `items.bulk.moveDialog` namespace
- [ ] Replace dialog title with pluralized translation
- [ ] Replace close button aria-label with translation
- [ ] Replace PropertyDropdown placeholder with translation
- [ ] Replace PropertyDropdown empty state with translation
- [ ] Replace PropertyDropdown aria-labels with translations
- [ ] Replace "Unknown Property" fallback with translation
- [ ] Replace ItemPreviewList header with translation
- [ ] Replace "from:" prefix with interpolated translation
- [ ] Replace overflow message with translation
- [ ] Replace destination label with translation
- [ ] Replace "No other properties available" with translation
- [ ] Replace cancel button text with translation
- [ ] Replace move button text with pluralized translation
- [ ] TypeScript compiles without errors

---

### Task 5: Update ConfirmDeleteDialog component for i18n (Priority: High)

**Description:** Add translation hook and replace helper functions with translated versions.

**File to Modify:** `src/components/ItemManager/components/dialogs/ConfirmDeleteDialog.tsx`

**Current Code (lines 60-88):**
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

**Target Approach:**
```typescript
import { useTranslations } from 'next-intl';

// Helper functions can remain for non-React contexts but main component uses hook
export function ConfirmDeleteDialog({ ... }: ConfirmDeleteDialogProps) {
  const t = useTranslations('items.bulk.deleteDialog');

  const dialogTitle = title ?? t('title', { count: itemCount });
  const dialogMessage = t('message', { count: itemCount });
  const confirmText = t('confirmButton', { count: itemCount });

  return (
    <div role="alertdialog" aria-labelledby="delete-dialog-title">
      <h3 id="delete-dialog-title">{dialogTitle}</h3>
      <p id="delete-dialog-description">{dialogMessage}</p>

      <ul>
        {visibleItems.map(...)}
        {overflowCount > 0 && (
          <li>{t('andMore', { count: overflowCount })}</li>
        )}
      </ul>

      <button>{t('cancelButton')}</button>
      <button>
        {loading ? (
          <><Loader2 /><span>{t('deleting')}</span></>
        ) : (
          confirmText
        )}
      </button>
    </div>
  );
}
```

**Acceptance Criteria:**
- [ ] Import `useTranslations` from `next-intl`
- [ ] Initialize translation hook with `items.bulk.deleteDialog` namespace
- [ ] Replace dialog title with pluralized translation (preserve custom title override)
- [ ] Replace confirmation message with pluralized translation
- [ ] Replace overflow "and X more" message with translation
- [ ] Replace cancel button text with translation
- [ ] Replace confirm button text with pluralized translation
- [ ] Replace "Deleting..." loading text with translation
- [ ] Keep exported helper functions for backward compatibility (with English fallbacks)
- [ ] TypeScript compiles without errors

---

### Task 6: Testing and verification (Priority: High)

**Description:** Verify all translations work correctly across languages and all functionality is preserved.

**Test Scenarios:**

1. **BulkActionsBar tests in each of the 6 languages:**
   - Select multiple items, verify "{count} selected" is translated
   - Verify toolbar aria-label uses correct plural form
   - Verify all button labels are translated
   - Verify "Processing..." state is translated
   - Verify cancel button and aria-label are translated

2. **BulkTagDialog tests in each language:**
   - Open Add Tag dialog, verify title uses correct plural form
   - Open Remove Tag dialog, verify title uses correct plural form
   - Verify "Items to be updated:" is translated
   - Verify "Enter tags to add:" label is translated
   - Verify input placeholder is translated
   - Verify "Suggested tags:" is translated
   - Add a tag pill, verify remove tag aria-label is translated
   - Verify empty state "No tags found..." is translated
   - Verify confirm button text uses correct plural form

3. **BulkMoveDialog tests in each language:**
   - Open dialog, verify title uses correct plural form
   - Verify "Destination property" label is translated
   - Verify dropdown placeholder is translated
   - Verify "Items to move:" is translated
   - Verify "from: {property}" is translated
   - Verify empty state messages are translated
   - Verify confirm button uses correct plural form

4. **ConfirmDeleteDialog tests in each language:**
   - Delete single item, verify singular form in title/message
   - Delete multiple items, verify plural form in title/message
   - Verify "and X more" overflow text is translated
   - Verify "Cancel" and "Delete X Items" are translated
   - Verify "Deleting..." loading state is translated

5. **General tests:**
   - Verify language switching updates all dialog text without page reload
   - Verify no console warnings about missing translation keys
   - Verify all accessibility attributes are in selected language
   - Verify existing bulk action functionality still works

**Acceptance Criteria:**
- [ ] All 6 languages display correctly in all dialogs
- [ ] No missing translation warnings in console
- [ ] Language switching updates UI without reload
- [ ] TypeScript compiles without errors
- [ ] Existing bulk action functionality preserved
- [ ] Pluralization works correctly for all counts (0, 1, many)
- [ ] Screen reader announces correctly in all languages

---

## 5. Authorized Files and Functions for Modification

### 5.1 Primary Files

| File | Functions/Sections | Modification Type |
|------|-------------------|-------------------|
| `src/components/ItemManager/components/BulkActions/BulkActionsBar.tsx` | `BulkActionsBar` function, all hardcoded strings | Add import, add hook, replace strings |
| `src/components/ItemManager/components/BulkActions/BulkTagDialog.tsx` | `BulkTagDialog` function, `ItemPreviewList` function | Add import, add hook, replace strings |
| `src/components/ItemManager/components/BulkActions/BulkMoveDialog.tsx` | `BulkMoveDialog` function, `PropertyDropdown` function, `ItemPreviewList` function | Add import, add hook, replace strings |
| `src/components/ItemManager/components/dialogs/ConfirmDeleteDialog.tsx` | `ConfirmDeleteDialog` function, `getDeleteTitle`, `getDeleteMessage`, `getConfirmButtonText` helpers | Add import, add hook, replace strings |
| `/messages/en.json` | `items.bulk` namespace | Add new translation keys |
| `/messages/fr.json` | `items.bulk` namespace | Add new translation keys |
| `/messages/es.json` | `items.bulk` namespace | Add new translation keys |
| `/messages/de.json` | `items.bulk` namespace | Add new translation keys |
| `/messages/nl.json` | `items.bulk` namespace | Add new translation keys |
| `/messages/it.json` | `items.bulk` namespace | Add new translation keys |

### 5.2 Functions to Modify

**BulkActionsBar.tsx:**
- `BulkActionsBar` function component - add useTranslations hook, replace all hardcoded strings
- Lines to modify: 155, 182, 185-187, 196, 203, 213, 219, 231, 253, 267

**BulkTagDialog.tsx:**
- `BulkTagDialog` function component - add useTranslations hook, replace all hardcoded strings
- `ItemPreviewList` internal component - replace hardcoded strings
- Lines to modify: 81, 91-93, 320-322, 334, 346, 365, 381-384, 400, 427-429, 432-433, 493, 510

**BulkMoveDialog.tsx:**
- `BulkMoveDialog` function component - add useTranslations hook
- `PropertyDropdown` internal component - replace placeholder and empty state
- `ItemPreviewList` internal component - replace header and overflow text
- Lines to modify: 100, 114, 196-198, 214, 248, 257, 334, 344, 351-353, 486-487, 501, 512-514, 518, 526, 551, 567

**ConfirmDeleteDialog.tsx:**
- `ConfirmDeleteDialog` function component - add useTranslations hook
- `getDeleteTitle` helper - keep for backward compatibility
- `getDeleteMessage` helper - keep for backward compatibility
- `getConfirmButtonText` helper - keep for backward compatibility
- Lines to modify: 60-88, 228-230, 251, 271, 274

### 5.3 Read-Only Reference Files

| File | Purpose |
|------|---------|
| `src/components/ItemManager/ItemManager.types.ts` | Type definitions reference |
| `src/contexts/LocaleContext.tsx` | Locale context pattern reference |
| `src/lib/i18n/config.ts` | i18n configuration reference |
| `docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md` | Implementation plan reference |
| `docs/REQ-E02-081-update-filter-and-sort-components-overview.md` | Pattern reference for similar components |

---

## 6. Translation Strings Required

### 6.1 English (en.json) - New Keys

```json
{
  "items": {
    "bulk": {
      "actionsBar": {
        "ariaLabel": "{count, plural, one {Bulk actions for # selected item} other {Bulk actions for # selected items}}",
        "selected": "{count} selected",
        "srAnnouncement": "{count, plural, one {Currently # item selected} other {Currently # items selected}}",
        "processing": "Processing...",
        "delete": "Delete",
        "addTag": "Add Tag",
        "removeTag": "Remove Tag",
        "moveToProperty": "Move to Property",
        "cancel": "Cancel",
        "cancelSelection": "Cancel selection"
      },
      "tagDialog": {
        "closeDialog": "Close dialog",
        "addTitle": "{count, plural, one {Add Tags to # Item} other {Add Tags to # Items}}",
        "removeTitle": "{count, plural, one {Remove Tags from # Item} other {Remove Tags from # Items}}",
        "itemsToUpdate": "Items to be updated:",
        "andMore": "(and {count} more...)",
        "enterTags": "Enter tags to add:",
        "inputPlaceholder": "Type a tag and press Enter...",
        "maxTagsReached": "Max {max} tags",
        "suggestedTags": "Suggested tags:",
        "removeTagAriaLabel": "Remove {tag} tag",
        "noTagsFound": "No tags found on selected items.",
        "selectTagsToRemove": "Select tags to remove:",
        "cancelButton": "Cancel",
        "addButton": "{count, plural, one {Add # Tag} other {Add # Tags}}",
        "removeButton": "{count, plural, one {Remove # Tag} other {Remove # Tags}}"
      },
      "moveDialog": {
        "selectProperty": "Select a property...",
        "noPropertiesAvailable": "No properties available",
        "selectDestination": "Select destination property",
        "unknownProperty": "Unknown Property",
        "availableProperties": "Available properties",
        "closeDialog": "Close dialog",
        "title": "{count, plural, one {Move # Item to Another Property} other {Move # Items to Another Property}}",
        "itemsToMove": "Items to move:",
        "fromProperty": "from: {property}",
        "andMore": "(and {count} more...)",
        "destinationProperty": "Destination property",
        "noOtherProperties": "No other properties available",
        "selectDestinationPlaceholder": "Select destination property...",
        "cancelButton": "Cancel",
        "moveButton": "{count, plural, one {Move # Item} other {Move # Items}}"
      },
      "deleteDialog": {
        "title": "{count, plural, one {Delete Item} other {Delete Items}}",
        "message": "{count, plural, one {Are you sure you want to delete this item? This action cannot be undone.} other {Are you sure you want to delete these # items? This action cannot be undone.}}",
        "andMore": "and {count} more",
        "cancelButton": "Cancel",
        "confirmButton": "{count, plural, one {Delete} other {Delete # Items}}",
        "deleting": "Deleting..."
      }
    }
  }
}
```

### 6.2 French (fr.json) - Translations

```json
{
  "items": {
    "bulk": {
      "actionsBar": {
        "ariaLabel": "{count, plural, one {Actions groupees pour # element selectionne} other {Actions groupees pour # elements selectionnes}}",
        "selected": "{count} selectionne(s)",
        "srAnnouncement": "{count, plural, one {Actuellement # element selectionne} other {Actuellement # elements selectionnes}}",
        "processing": "Traitement en cours...",
        "delete": "Supprimer",
        "addTag": "Ajouter un tag",
        "removeTag": "Supprimer un tag",
        "moveToProperty": "Deplacer vers une propriete",
        "cancel": "Annuler",
        "cancelSelection": "Annuler la selection"
      },
      "tagDialog": {
        "closeDialog": "Fermer la boite de dialogue",
        "addTitle": "{count, plural, one {Ajouter des tags a # element} other {Ajouter des tags a # elements}}",
        "removeTitle": "{count, plural, one {Supprimer des tags de # element} other {Supprimer des tags de # elements}}",
        "itemsToUpdate": "Elements a mettre a jour :",
        "andMore": "(et {count} de plus...)",
        "enterTags": "Entrez les tags a ajouter :",
        "inputPlaceholder": "Tapez un tag et appuyez sur Entree...",
        "maxTagsReached": "Maximum {max} tags",
        "suggestedTags": "Tags suggeres :",
        "removeTagAriaLabel": "Supprimer le tag {tag}",
        "noTagsFound": "Aucun tag trouve sur les elements selectionnes.",
        "selectTagsToRemove": "Selectionnez les tags a supprimer :",
        "cancelButton": "Annuler",
        "addButton": "{count, plural, one {Ajouter # tag} other {Ajouter # tags}}",
        "removeButton": "{count, plural, one {Supprimer # tag} other {Supprimer # tags}}"
      },
      "moveDialog": {
        "selectProperty": "Selectionner une propriete...",
        "noPropertiesAvailable": "Aucune propriete disponible",
        "selectDestination": "Selectionner la propriete de destination",
        "unknownProperty": "Propriete inconnue",
        "availableProperties": "Proprietes disponibles",
        "closeDialog": "Fermer la boite de dialogue",
        "title": "{count, plural, one {Deplacer # element vers une autre propriete} other {Deplacer # elements vers une autre propriete}}",
        "itemsToMove": "Elements a deplacer :",
        "fromProperty": "de : {property}",
        "andMore": "(et {count} de plus...)",
        "destinationProperty": "Propriete de destination",
        "noOtherProperties": "Aucune autre propriete disponible",
        "selectDestinationPlaceholder": "Selectionner la propriete de destination...",
        "cancelButton": "Annuler",
        "moveButton": "{count, plural, one {Deplacer # element} other {Deplacer # elements}}"
      },
      "deleteDialog": {
        "title": "{count, plural, one {Supprimer l'element} other {Supprimer les elements}}",
        "message": "{count, plural, one {Etes-vous sur de vouloir supprimer cet element ? Cette action est irreversible.} other {Etes-vous sur de vouloir supprimer ces # elements ? Cette action est irreversible.}}",
        "andMore": "et {count} de plus",
        "cancelButton": "Annuler",
        "confirmButton": "{count, plural, one {Supprimer} other {Supprimer # elements}}",
        "deleting": "Suppression..."
      }
    }
  }
}
```

### 6.3 Spanish (es.json) - Translations

```json
{
  "items": {
    "bulk": {
      "actionsBar": {
        "ariaLabel": "{count, plural, one {Acciones masivas para # elemento seleccionado} other {Acciones masivas para # elementos seleccionados}}",
        "selected": "{count} seleccionado(s)",
        "srAnnouncement": "{count, plural, one {Actualmente # elemento seleccionado} other {Actualmente # elementos seleccionados}}",
        "processing": "Procesando...",
        "delete": "Eliminar",
        "addTag": "Agregar etiqueta",
        "removeTag": "Eliminar etiqueta",
        "moveToProperty": "Mover a propiedad",
        "cancel": "Cancelar",
        "cancelSelection": "Cancelar seleccion"
      },
      "tagDialog": {
        "closeDialog": "Cerrar dialogo",
        "addTitle": "{count, plural, one {Agregar etiquetas a # elemento} other {Agregar etiquetas a # elementos}}",
        "removeTitle": "{count, plural, one {Eliminar etiquetas de # elemento} other {Eliminar etiquetas de # elementos}}",
        "itemsToUpdate": "Elementos a actualizar:",
        "andMore": "(y {count} mas...)",
        "enterTags": "Ingrese las etiquetas a agregar:",
        "inputPlaceholder": "Escriba una etiqueta y presione Enter...",
        "maxTagsReached": "Maximo {max} etiquetas",
        "suggestedTags": "Etiquetas sugeridas:",
        "removeTagAriaLabel": "Eliminar etiqueta {tag}",
        "noTagsFound": "No se encontraron etiquetas en los elementos seleccionados.",
        "selectTagsToRemove": "Seleccione las etiquetas a eliminar:",
        "cancelButton": "Cancelar",
        "addButton": "{count, plural, one {Agregar # etiqueta} other {Agregar # etiquetas}}",
        "removeButton": "{count, plural, one {Eliminar # etiqueta} other {Eliminar # etiquetas}}"
      },
      "moveDialog": {
        "selectProperty": "Seleccionar una propiedad...",
        "noPropertiesAvailable": "No hay propiedades disponibles",
        "selectDestination": "Seleccionar propiedad de destino",
        "unknownProperty": "Propiedad desconocida",
        "availableProperties": "Propiedades disponibles",
        "closeDialog": "Cerrar dialogo",
        "title": "{count, plural, one {Mover # elemento a otra propiedad} other {Mover # elementos a otra propiedad}}",
        "itemsToMove": "Elementos a mover:",
        "fromProperty": "de: {property}",
        "andMore": "(y {count} mas...)",
        "destinationProperty": "Propiedad de destino",
        "noOtherProperties": "No hay otras propiedades disponibles",
        "selectDestinationPlaceholder": "Seleccionar propiedad de destino...",
        "cancelButton": "Cancelar",
        "moveButton": "{count, plural, one {Mover # elemento} other {Mover # elementos}}"
      },
      "deleteDialog": {
        "title": "{count, plural, one {Eliminar elemento} other {Eliminar elementos}}",
        "message": "{count, plural, one {Esta seguro de que desea eliminar este elemento? Esta accion no se puede deshacer.} other {Esta seguro de que desea eliminar estos # elementos? Esta accion no se puede deshacer.}}",
        "andMore": "y {count} mas",
        "cancelButton": "Cancelar",
        "confirmButton": "{count, plural, one {Eliminar} other {Eliminar # elementos}}",
        "deleting": "Eliminando..."
      }
    }
  }
}
```

### 6.4 German (de.json) - Translations

```json
{
  "items": {
    "bulk": {
      "actionsBar": {
        "ariaLabel": "{count, plural, one {Massenaktionen fur # ausgewahltes Element} other {Massenaktionen fur # ausgewahlte Elemente}}",
        "selected": "{count} ausgewahlt",
        "srAnnouncement": "{count, plural, one {Aktuell # Element ausgewahlt} other {Aktuell # Elemente ausgewahlt}}",
        "processing": "Verarbeitung...",
        "delete": "Loschen",
        "addTag": "Tag hinzufugen",
        "removeTag": "Tag entfernen",
        "moveToProperty": "Zu Immobilie verschieben",
        "cancel": "Abbrechen",
        "cancelSelection": "Auswahl abbrechen"
      },
      "tagDialog": {
        "closeDialog": "Dialog schliessen",
        "addTitle": "{count, plural, one {Tags zu # Element hinzufugen} other {Tags zu # Elementen hinzufugen}}",
        "removeTitle": "{count, plural, one {Tags von # Element entfernen} other {Tags von # Elementen entfernen}}",
        "itemsToUpdate": "Zu aktualisierende Elemente:",
        "andMore": "(und {count} weitere...)",
        "enterTags": "Tags zum Hinzufugen eingeben:",
        "inputPlaceholder": "Tag eingeben und Enter drucken...",
        "maxTagsReached": "Maximal {max} Tags",
        "suggestedTags": "Vorgeschlagene Tags:",
        "removeTagAriaLabel": "Tag {tag} entfernen",
        "noTagsFound": "Keine Tags bei ausgewahlten Elementen gefunden.",
        "selectTagsToRemove": "Tags zum Entfernen auswahlen:",
        "cancelButton": "Abbrechen",
        "addButton": "{count, plural, one {# Tag hinzufugen} other {# Tags hinzufugen}}",
        "removeButton": "{count, plural, one {# Tag entfernen} other {# Tags entfernen}}"
      },
      "moveDialog": {
        "selectProperty": "Immobilie auswahlen...",
        "noPropertiesAvailable": "Keine Immobilien verfugbar",
        "selectDestination": "Ziel-Immobilie auswahlen",
        "unknownProperty": "Unbekannte Immobilie",
        "availableProperties": "Verfugbare Immobilien",
        "closeDialog": "Dialog schliessen",
        "title": "{count, plural, one {# Element zu anderer Immobilie verschieben} other {# Elemente zu anderer Immobilie verschieben}}",
        "itemsToMove": "Zu verschiebende Elemente:",
        "fromProperty": "von: {property}",
        "andMore": "(und {count} weitere...)",
        "destinationProperty": "Ziel-Immobilie",
        "noOtherProperties": "Keine anderen Immobilien verfugbar",
        "selectDestinationPlaceholder": "Ziel-Immobilie auswahlen...",
        "cancelButton": "Abbrechen",
        "moveButton": "{count, plural, one {# Element verschieben} other {# Elemente verschieben}}"
      },
      "deleteDialog": {
        "title": "{count, plural, one {Element loschen} other {Elemente loschen}}",
        "message": "{count, plural, one {Sind Sie sicher, dass Sie dieses Element loschen mochten? Diese Aktion kann nicht ruckgangig gemacht werden.} other {Sind Sie sicher, dass Sie diese # Elemente loschen mochten? Diese Aktion kann nicht ruckgangig gemacht werden.}}",
        "andMore": "und {count} weitere",
        "cancelButton": "Abbrechen",
        "confirmButton": "{count, plural, one {Loschen} other {# Elemente loschen}}",
        "deleting": "Wird geloscht..."
      }
    }
  }
}
```

### 6.5 Dutch (nl.json) - Translations

```json
{
  "items": {
    "bulk": {
      "actionsBar": {
        "ariaLabel": "{count, plural, one {Bulkacties voor # geselecteerd item} other {Bulkacties voor # geselecteerde items}}",
        "selected": "{count} geselecteerd",
        "srAnnouncement": "{count, plural, one {Momenteel # item geselecteerd} other {Momenteel # items geselecteerd}}",
        "processing": "Verwerken...",
        "delete": "Verwijderen",
        "addTag": "Tag toevoegen",
        "removeTag": "Tag verwijderen",
        "moveToProperty": "Verplaatsen naar eigendom",
        "cancel": "Annuleren",
        "cancelSelection": "Selectie annuleren"
      },
      "tagDialog": {
        "closeDialog": "Dialoog sluiten",
        "addTitle": "{count, plural, one {Tags toevoegen aan # item} other {Tags toevoegen aan # items}}",
        "removeTitle": "{count, plural, one {Tags verwijderen van # item} other {Tags verwijderen van # items}}",
        "itemsToUpdate": "Items om bij te werken:",
        "andMore": "(en {count} meer...)",
        "enterTags": "Voer tags in om toe te voegen:",
        "inputPlaceholder": "Typ een tag en druk op Enter...",
        "maxTagsReached": "Maximaal {max} tags",
        "suggestedTags": "Voorgestelde tags:",
        "removeTagAriaLabel": "Tag {tag} verwijderen",
        "noTagsFound": "Geen tags gevonden op geselecteerde items.",
        "selectTagsToRemove": "Selecteer tags om te verwijderen:",
        "cancelButton": "Annuleren",
        "addButton": "{count, plural, one {# tag toevoegen} other {# tags toevoegen}}",
        "removeButton": "{count, plural, one {# tag verwijderen} other {# tags verwijderen}}"
      },
      "moveDialog": {
        "selectProperty": "Selecteer een eigendom...",
        "noPropertiesAvailable": "Geen eigendommen beschikbaar",
        "selectDestination": "Selecteer bestemmingseigendom",
        "unknownProperty": "Onbekend eigendom",
        "availableProperties": "Beschikbare eigendommen",
        "closeDialog": "Dialoog sluiten",
        "title": "{count, plural, one {# item verplaatsen naar ander eigendom} other {# items verplaatsen naar ander eigendom}}",
        "itemsToMove": "Items om te verplaatsen:",
        "fromProperty": "van: {property}",
        "andMore": "(en {count} meer...)",
        "destinationProperty": "Bestemmingseigendom",
        "noOtherProperties": "Geen andere eigendommen beschikbaar",
        "selectDestinationPlaceholder": "Selecteer bestemmingseigendom...",
        "cancelButton": "Annuleren",
        "moveButton": "{count, plural, one {# item verplaatsen} other {# items verplaatsen}}"
      },
      "deleteDialog": {
        "title": "{count, plural, one {Item verwijderen} other {Items verwijderen}}",
        "message": "{count, plural, one {Weet u zeker dat u dit item wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.} other {Weet u zeker dat u deze # items wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.}}",
        "andMore": "en {count} meer",
        "cancelButton": "Annuleren",
        "confirmButton": "{count, plural, one {Verwijderen} other {# items verwijderen}}",
        "deleting": "Verwijderen..."
      }
    }
  }
}
```

### 6.6 Italian (it.json) - Translations

```json
{
  "items": {
    "bulk": {
      "actionsBar": {
        "ariaLabel": "{count, plural, one {Azioni di massa per # elemento selezionato} other {Azioni di massa per # elementi selezionati}}",
        "selected": "{count} selezionato/i",
        "srAnnouncement": "{count, plural, one {Attualmente # elemento selezionato} other {Attualmente # elementi selezionati}}",
        "processing": "Elaborazione...",
        "delete": "Elimina",
        "addTag": "Aggiungi tag",
        "removeTag": "Rimuovi tag",
        "moveToProperty": "Sposta in proprieta",
        "cancel": "Annulla",
        "cancelSelection": "Annulla selezione"
      },
      "tagDialog": {
        "closeDialog": "Chiudi dialogo",
        "addTitle": "{count, plural, one {Aggiungi tag a # elemento} other {Aggiungi tag a # elementi}}",
        "removeTitle": "{count, plural, one {Rimuovi tag da # elemento} other {Rimuovi tag da # elementi}}",
        "itemsToUpdate": "Elementi da aggiornare:",
        "andMore": "(e altri {count}...)",
        "enterTags": "Inserisci i tag da aggiungere:",
        "inputPlaceholder": "Digita un tag e premi Invio...",
        "maxTagsReached": "Massimo {max} tag",
        "suggestedTags": "Tag suggeriti:",
        "removeTagAriaLabel": "Rimuovi tag {tag}",
        "noTagsFound": "Nessun tag trovato sugli elementi selezionati.",
        "selectTagsToRemove": "Seleziona i tag da rimuovere:",
        "cancelButton": "Annulla",
        "addButton": "{count, plural, one {Aggiungi # tag} other {Aggiungi # tag}}",
        "removeButton": "{count, plural, one {Rimuovi # tag} other {Rimuovi # tag}}"
      },
      "moveDialog": {
        "selectProperty": "Seleziona una proprieta...",
        "noPropertiesAvailable": "Nessuna proprieta disponibile",
        "selectDestination": "Seleziona proprieta di destinazione",
        "unknownProperty": "Proprieta sconosciuta",
        "availableProperties": "Proprieta disponibili",
        "closeDialog": "Chiudi dialogo",
        "title": "{count, plural, one {Sposta # elemento in un'altra proprieta} other {Sposta # elementi in un'altra proprieta}}",
        "itemsToMove": "Elementi da spostare:",
        "fromProperty": "da: {property}",
        "andMore": "(e altri {count}...)",
        "destinationProperty": "Proprieta di destinazione",
        "noOtherProperties": "Nessun'altra proprieta disponibile",
        "selectDestinationPlaceholder": "Seleziona proprieta di destinazione...",
        "cancelButton": "Annulla",
        "moveButton": "{count, plural, one {Sposta # elemento} other {Sposta # elementi}}"
      },
      "deleteDialog": {
        "title": "{count, plural, one {Elimina elemento} other {Elimina elementi}}",
        "message": "{count, plural, one {Sei sicuro di voler eliminare questo elemento? Questa azione non puo essere annullata.} other {Sei sicuro di voler eliminare questi # elementi? Questa azione non puo essere annullata.}}",
        "andMore": "e altri {count}",
        "cancelButton": "Annulla",
        "confirmButton": "{count, plural, one {Elimina} other {Elimina # elementi}}",
        "deleting": "Eliminazione..."
      }
    }
  }
}
```

---

## 7. Dependencies and Blockers

### 7.1 Prerequisites
- [x] Epic 1 foundation complete (next-intl installed and configured)
- [x] Translation files exist for all 6 languages
- [x] LocaleContext available for locale state management
- [x] `items` namespace exists in translation files

### 7.2 Dependencies on Other Requests

| Request | Dependency Type | Status |
|---------|-----------------|--------|
| REQ-E02-078 (Create items namespace structure) | Foundation | Complete |
| REQ-E02-079 (Update ItemManager component family) | Should be completed first | In Progress |
| REQ-E02-080 (Update ItemGrid and ItemCard) | Parallel task | In Progress |
| REQ-E02-081 (Update filter and sort components) | Parallel task | In Progress |

### 7.3 Potential Blockers
- None identified - all prerequisites are met

---

## 8. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| ICU plural format not rendering correctly | Low | High | Test all plural forms (0, 1, many) in each language |
| Dialog text overflow in some languages | Medium | Low | Design dialogs with 40% text expansion buffer |
| Button text truncation in mobile view | Medium | Low | Use responsive text sizing; test on mobile |
| Missing translation keys in production | Low | High | Add build-time translation key validation |
| Performance impact from multiple hook calls | Low | Low | Hooks are memoized by next-intl |
| Accessibility regressions | Low | Medium | Test with screen reader in each language |

---

## 9. Verification Checklist

### 9.1 Functional Verification
- [ ] BulkActionsBar displays all labels in all 6 languages
- [ ] BulkActionsBar shows correct plural form for selected count
- [ ] BulkTagDialog Add mode displays correctly in all languages
- [ ] BulkTagDialog Remove mode displays correctly in all languages
- [ ] BulkTagDialog shows correct plural forms for tag and item counts
- [ ] BulkMoveDialog displays correctly in all languages
- [ ] BulkMoveDialog shows correct plural form for item count
- [ ] ConfirmDeleteDialog displays correctly in all languages
- [ ] ConfirmDeleteDialog shows correct plural forms
- [ ] Language switching updates all dialog text without page reload
- [ ] All bulk operations still function correctly after changes

### 9.2 Accessibility Verification
- [ ] All aria-labels are translated correctly
- [ ] Screen reader announces dialog content in selected language
- [ ] Keyboard navigation continues to work in all dialogs
- [ ] Focus trap works correctly in dialogs
- [ ] Remove tag aria-label includes tag name in all languages
- [ ] Cancel selection aria-label is translated

### 9.3 Code Quality Verification
- [ ] TypeScript compiles without errors
- [ ] No console warnings for missing translation keys
- [ ] Translation keys follow naming convention (`items.bulk.*`)
- [ ] All 6 language files have identical key structure
- [ ] ICU plural format used correctly for all count-dependent strings

---

## 10. References

- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md`
- **Request Source:** `/docs/gen_requests_epic2.md` - REQ-E02-082
- **Epic 1 Foundation:** `/docs/prd/Plan-110-L10N-Epic1-Foundation.md`
- **Pattern Reference:** `docs/REQ-E02-081-update-filter-and-sort-components-overview.md`
- **next-intl Documentation:** https://next-intl-docs.vercel.app/
- **ICU Message Format:** https://unicode-org.github.io/icu/userguide/format_parse/messages/

---

*Document generated for FAQBNB Localization Epic 2 - Sub-Epic 2D: Item Management*
