# REQ-389: Update Bulk Action Dialogs for Localization - Implementation Overview

**Document Created**: 2026-01-19 18:30 UTC
**Last Modified**: 2026-01-19 18:30 UTC
**Request ID**: REQ-389
**Epic**: 2 - Static UI Translation
**Sub-Epic**: 2D - Item Management
**Task ID**: 2D.5
**Size**: M (Medium)
**Type**: ENHANCEMENT

---

## Summary

Update all bulk action dialog components in the ItemManager to display titles, descriptions, labels, confirmation messages, and action buttons in the user's selected language by replacing hardcoded English strings with translation function calls using next-intl's `useTranslations` hook.

---

## Current State Analysis

### Components to Update

| Component | Location | Hardcoded Strings |
|-----------|----------|-------------------|
| BulkActionsBar | `/src/components/ItemManager/components/BulkActions/BulkActionsBar.tsx` | 8 labels/messages |
| BulkTagDialog | `/src/components/ItemManager/components/BulkActions/BulkTagDialog.tsx` | 18 labels/messages |
| BulkMoveDialog | `/src/components/ItemManager/components/BulkActions/BulkMoveDialog.tsx` | 12 labels/messages |
| ConfirmDeleteDialog | `/src/components/ItemManager/components/dialogs/ConfirmDeleteDialog.tsx` | 8 labels/messages |

### Existing Hardcoded Strings Inventory

#### BulkActionsBar (Lines 155-197)
```typescript
// Line 155: aria-label
aria-label={`Bulk actions for ${selectedCount} selected item${selectedCount !== 1 ? 's' : ''}`}

// Line 181-182: Selection count
<span className="text-sm font-medium text-gray-900 truncate">
  {selectedCount} selected
</span>

// Line 185-187: Screen reader announcement
<span className="sr-only">
  Currently {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
</span>

// Line 196-197: Loading state
<span className="text-sm">Processing...</span>

// Lines 201-235: Button labels
label="Delete"
label="Add Tag"
label="Remove Tag"
label="Move to Property"

// Line 254: Cancel button aria-label
aria-label="Cancel selection"
```

#### BulkTagDialog (Lines 72-516)
```typescript
// Line 81-82: ItemPreviewList heading (internal component)
<p className="text-sm font-medium text-gray-700 mb-2">Items to be updated:</p>

// Line 91-93: Overflow count
<p className="text-sm text-gray-500 italic mt-1">
  (and {remainingCount} more...)
</p>

// Lines 320-322: Dialog title
{mode === 'add' ? 'Add Tags' : 'Remove Tags'} from {itemCount} Item
{itemCount !== 1 ? 's' : ''}

// Line 334: Close button aria-label
aria-label="Close dialog"

// Lines 346-347: Add mode label
<label className="block text-sm font-medium text-gray-700">
  Enter tags to add:
</label>

// Lines 380-386: Input placeholder
placeholder={
  tagsToAdd.length === 0
    ? 'Type a tag and press Enter...'
    : tagsToAdd.length >= MAX_TAGS_TO_ADD
    ? `Max ${MAX_TAGS_TO_ADD} tags`
    : ''
}

// Line 365: Remove tag aria-label
aria-label={`Remove ${tag} tag`}

// Line 400: Suggested tags label
<p className="text-xs text-gray-500">Suggested tags:</p>

// Lines 427-429: No tags found (remove mode)
<p className="text-sm text-gray-500 italic">
  No tags found on selected items.
</p>

// Lines 432-433: Remove mode label
<label className="block text-sm font-medium text-gray-700">
  Select tags to remove:
</label>

// Line 493: Cancel button
Cancel

// Line 510: Confirm button
{mode === 'add' ? 'Add' : 'Remove'} {tagCount} Tag{tagCount !== 1 ? 's' : ''}
```

#### BulkMoveDialog (Lines 196-573)
```typescript
// Line 196-199: No properties empty state
<div className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm">
  No properties available
</div>

// Line 214: Dropdown aria-label
aria-label="Select destination property"

// Line 257: Unknown property fallback
'Unknown Property'

// Line 334: ItemPreviewList heading
<p className="text-sm font-medium text-gray-700 mb-2">Items to move:</p>

// Line 344: Source property label
<span className="text-xs text-gray-500">from: {propertyName}</span>

// Lines 351-354: Overflow count
<p className="text-sm text-gray-500 italic mt-2 ml-4">
  (and {remainingCount} more...)
</p>

// Lines 486-488: Dialog title
<h2 id={titleId} className="text-lg font-semibold text-gray-900">
  Move {itemCount} {itemLabel} to Another Property
</h2>

// Line 501: Close button aria-label
aria-label="Close dialog"

// Lines 513-514: Destination property label
<label id={selectLabelId} className="block text-sm font-medium text-gray-700">
  Destination property
</label>

// Line 518: No other properties message
<p className="text-sm text-gray-500">No other properties available</p>

// Line 526: Dropdown placeholder
placeholder="Select destination property..."

// Line 551: Cancel button
Cancel

// Line 567: Confirm button
Move {itemCount} {itemLabel}
```

#### ConfirmDeleteDialog (Lines 60-76, 196-275)
```typescript
// Lines 60-63: getDeleteTitle function
if (customTitle) return customTitle;
return count === 1 ? 'Delete Item' : 'Delete Items';

// Lines 72-76: getDeleteMessage function
if (count === 1) {
  return 'Are you sure you want to delete this item? This action cannot be undone.';
}
return `Are you sure you want to delete these ${count} items? This action cannot be undone.`;

// Lines 84-88: getConfirmButtonText function
if (count === 1) {
  return 'Delete';
}
return `Delete ${count} Items`;

// Line 230: Overflow message
<span>and {overflowCount} more</span>

// Line 252: Cancel button
Cancel

// Lines 269-274: Loading/confirm button text
{loading ? (
  <>
    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
    <span>Deleting...</span>
  </>
) : (
  getConfirmButtonText(itemCount)
)}
```

---

## Implementation Approach

### Translation Namespace Structure

Add to `/messages/en.json` under the `items` namespace:

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
        "cancelSelection": "Cancel selection"
      },
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
      },
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
      },
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

### Component Update Pattern

For client components (all bulk action components are client components), use:

```typescript
import { useTranslations } from 'next-intl';

export function BulkActionsBar({ ... }) {
  const t = useTranslations('items.bulk.actions');

  // Replace hardcoded strings with translations
  const selectedLabel = t('selected', { count: selectedCount });
  const deleteLabel = t('delete');
  // etc.
}
```

### Pluralization Strategy

Use ICU MessageFormat for proper pluralization across all supported languages:

```typescript
// Translation key in en.json
"addTitle": "Add Tags from {count, plural, one {# Item} other {# Items}}"

// Usage in component
t('addTitle', { count: itemCount })
```

This ensures correct singular/plural forms are automatically selected based on the count and current locale.

---

## Authorized Files and Functions for Modification

### Primary Files

| File Path | Line Numbers | Functions/Sections |
|-----------|--------------|-------------------|
| `/src/components/ItemManager/components/BulkActions/BulkActionsBar.tsx` | 136-274 | `BulkActionsBar` component render, button labels, aria-labels, loading text |
| `/src/components/ItemManager/components/BulkActions/BulkTagDialog.tsx` | 72-97, 285-516 | `ItemPreviewList` internal component, `BulkTagDialog` render including header, body labels, input placeholders, button texts |
| `/src/components/ItemManager/components/BulkActions/BulkMoveDialog.tsx` | 95-196, 310-573 | `PropertyDropdown` internal component, `ItemPreviewList` internal component, `BulkMoveDialog` render including header, labels, placeholders |
| `/src/components/ItemManager/components/dialogs/ConfirmDeleteDialog.tsx` | 56-89, 141-281 | `getDeleteTitle()`, `getDeleteMessage()`, `getConfirmButtonText()` helper functions, `ConfirmDeleteDialog` render |

### Translation Files

| File Path | Section |
|-----------|---------|
| `/messages/en.json` | Add `items.bulk` namespace with `actions`, `tagDialog`, `moveDialog`, `deleteDialog` sub-namespaces |
| `/messages/fr.json` | Add French translations for `items.bulk` namespace |
| `/messages/es.json` | Add Spanish translations for `items.bulk` namespace |
| `/messages/de.json` | Add German translations for `items.bulk` namespace |
| `/messages/nl.json` | Add Dutch translations for `items.bulk` namespace |
| `/messages/it.json` | Add Italian translations for `items.bulk` namespace |

---

## Implementation Tasks

### Task 1: Update Translation Files
1. Add `items.bulk.actions` namespace to `/messages/en.json` for BulkActionsBar strings
2. Add `items.bulk.tagDialog` namespace to `/messages/en.json` for BulkTagDialog strings
3. Add `items.bulk.moveDialog` namespace to `/messages/en.json` for BulkMoveDialog strings
4. Add `items.bulk.deleteDialog` namespace to `/messages/en.json` for ConfirmDeleteDialog strings
5. Add corresponding translations to all 5 non-English language files

### Task 2: Update BulkActionsBar Component
1. Import `useTranslations` from `next-intl`
2. Replace toolbar aria-label with pluralized translation
3. Replace selection count display with translation
4. Replace screen reader announcement with translation
5. Replace "Processing..." loading text with translation
6. Replace all action button labels (Delete, Add Tag, Remove Tag, Move to Property) with translations
7. Replace "Cancel selection" aria-label with translation

### Task 3: Update BulkTagDialog Component
1. Import `useTranslations` from `next-intl`
2. Update `ItemPreviewList` internal component to receive translated strings as props or use translations directly
3. Replace dialog title with pluralized translation for both add/remove modes
4. Replace "Close dialog" aria-label with translation
5. Replace "Enter tags to add:" label with translation
6. Replace input placeholder and max tags message with translations
7. Replace individual tag removal aria-labels with translation including tag name interpolation
8. Replace "Suggested tags:" label with translation
9. Replace "No tags found on selected items." message with translation
10. Replace "Select tags to remove:" label with translation
11. Replace "Cancel" button text with translation
12. Replace confirm button text with pluralized translation for both modes

### Task 4: Update BulkMoveDialog Component
1. Import `useTranslations` from `next-intl`
2. Update `PropertyDropdown` internal component to use translations for placeholder and empty state
3. Update `ItemPreviewList` internal component to use translations
4. Replace dialog title with pluralized translation
5. Replace "Close dialog" aria-label with translation
6. Replace "Destination property" label with translation
7. Replace "No other properties available" message with translation
8. Replace dropdown placeholder with translation
9. Replace "from: {property}" text with translation including property name interpolation
10. Replace overflow count message with translation
11. Replace "Cancel" button text with translation
12. Replace confirm button text with pluralized translation

### Task 5: Update ConfirmDeleteDialog Component
1. Import `useTranslations` from `next-intl`
2. Update `getDeleteTitle()` helper to use translations with proper singular/plural
3. Update `getDeleteMessage()` helper to use translations with proper singular/plural and count interpolation
4. Update `getConfirmButtonText()` helper to use translations with proper singular/plural
5. Replace "and {count} more" overflow text with translation
6. Replace "Cancel" button text with translation
7. Replace "Deleting..." loading text with translation

### Task 6: Testing and Verification
1. Verify all bulk action dialog strings display correctly in English (default)
2. Switch language and verify all dialog components update appropriately
3. Test singular vs. plural forms with 1 item selected vs. multiple items
4. Verify aria-labels and accessibility attributes are translated correctly
5. Test all bulk operations work correctly after internationalization
6. Verify error states and edge cases (empty selections, no tags, etc.)
7. Test keyboard navigation with screen reader in multiple languages

---

## Dependencies

### From Epic 1 (Foundation)
- next-intl package installed
- i18n configuration in `/src/lib/i18n/config.ts`
- Translation files structure in `/messages/*.json`
- `useTranslations` hook available for client components

### From Sub-Epic 2H (Common & Shared)
- May reuse `common.cancel` if defined
- May reuse `common.delete` if defined

### From Task 2D.4 (Filter and Sort Components)
- No direct dependencies, but naming conventions should align

---

## Acceptance Criteria

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

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Text length variation across languages may break dialog layouts | Medium | Design dialogs with flexible widths; test with German (typically 30% longer) |
| Complex pluralization rules in some languages | Medium | Use ICU MessageFormat; test with languages having complex plural rules (e.g., Russian, Arabic) |
| Interpolated variable placement differs by language | Medium | Allow translators to reposition `{variables}` in translated strings |
| Breaking existing functionality during refactor | High | Maintain comprehensive test coverage; run existing tests after changes |
| Aria-labels becoming too verbose in some languages | Low | Review translated aria-labels for conciseness; consider abbreviations where appropriate |

---

## Estimated Effort

| Task | Estimate |
|------|----------|
| Update translation files (6 languages) | 1.5 hours |
| Update BulkActionsBar | 45 minutes |
| Update BulkTagDialog | 1.5 hours |
| Update BulkMoveDialog | 1.5 hours |
| Update ConfirmDeleteDialog | 1 hour |
| Testing and verification | 1.5 hours |
| **Total** | **~8 hours** |

---

## References

- [Implementation Plan: Epic 2 - Static UI Translation](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [Request Definition](/docs/gen_requests_epic2.md#req-389)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [i18n Configuration](/src/lib/i18n/config.ts)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)

---

*Document generated for FAQBNB Localization Epic 2 - Sub-Epic 2D Item Management*
