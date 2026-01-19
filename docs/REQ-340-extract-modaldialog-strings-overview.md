# REQ-340: Extract Modal and Dialog Strings for Translation

**Document Created:** 2026-01-19 16:45 UTC
**Last Modified:** 2026-01-19 16:45 UTC
**Type:** ENHANCEMENT
**Size:** M (Medium)
**Sub-Epic:** 2H - Common & Shared Components
**Task ID:** 2H.3
**Priority:** High (Foundation for L10N)
**Depends On:** Epic 1 Foundation (next-intl setup complete)

---

## Executive Summary

This task involves extracting all hardcoded English strings from modal and dialog components across the FAQBNB application and replacing them with translation function calls (`t()`). This enables internationalization of critical user interaction points including confirmation dialogs, form modals, bulk action dialogs, and content creation modals.

**Scope:**
- **17 Modal/Dialog Components** to internationalize
- **~100+ Hardcoded Strings** to extract
- **6 Languages:** English (source), French, Spanish, German, Dutch, Italian

---

## Request Details

### Summary
All modal and dialog components should display titles, messages, and action labels in the user's selected language.

### Current Behavior
Modal and dialog components contain hardcoded English strings for titles, confirmation messages, error messages, informational text, and button labels. Users see these interface elements only in English regardless of their language preference.

### Expected Behavior
Modal and dialog components render all text content using translation keys. Titles, body text, warning messages, confirmation prompts, and action buttons appear in the user's selected language. The translation system provides fallback to English when translations are unavailable.

### User Impact
Users who prefer non-English languages will see modal dialogs, confirmation prompts, error alerts, and informational popups in their chosen language, improving comprehension and reducing confusion during critical interactions like deletions, confirmations, and warnings.

### Business Value
Localized modal and dialog content improves user confidence during important actions and reduces support requests from non-English speakers who misunderstand confirmation prompts or error messages.

---

## Component Inventory

### Category 1: Confirmation Dialogs (Destructive Actions)

| Component | Location | Estimated Strings | Priority |
|-----------|----------|-------------------|----------|
| ConfirmationModal | `/src/components/ConfirmationModal.tsx` | ~5 | High |
| ConfirmDeleteDialog | `/src/components/ItemManager/components/dialogs/ConfirmDeleteDialog.tsx` | ~15 | High |
| DeleteItemDialog | `/src/components/dashboard/DeleteItemDialog.tsx` | ~20 | High |
| ConfirmExitDialog | `/src/components/ItemCreationWorkflow/components/shared/ConfirmExitDialog.tsx` | ~10 | High |
| RemoveItemDialog | `/src/components/ItemCreationWorkflow/components/shared/RemoveItemDialog.tsx` | ~8 | High |
| EmptySessionDialog | `/src/components/ItemCreationWorkflow/components/shared/EmptySessionDialog.tsx` | ~8 | Medium |
| AssetRemoveConfirmDialog | `/src/components/ItemManager/components/AssetPanel/AssetRemoveConfirmDialog.tsx` | ~15 | Medium |
| DeleteMediaConfirmDialog | `/src/components/MediaManagement/DeleteMediaConfirmDialog.tsx` | ~12 | Medium |

### Category 2: Form Modals (Data Entry)

| Component | Location | Estimated Strings | Priority |
|-----------|----------|-------------------|----------|
| AddPropertyModal | `/src/components/SimpleDashboard/AddPropertyModal.tsx` | ~25 | High |
| PropertyEditModal | `/src/components/SimpleDashboard/PropertyEditModal.tsx` | ~25 | High |
| AddContentModal | `/src/components/InstructionEditor/components/AddContentModal.tsx` | ~20 | Medium |

### Category 3: Bulk Action Dialogs

| Component | Location | Estimated Strings | Priority |
|-----------|----------|-------------------|----------|
| BulkMoveDialog | `/src/components/ItemManager/components/BulkActions/BulkMoveDialog.tsx` | ~15 | Medium |
| BulkTagDialog | `/src/components/ItemManager/components/BulkActions/BulkTagDialog.tsx` | ~18 | Medium |

### Category 4: Preview/Export Modals

| Component | Location | Estimated Strings | Priority |
|-----------|----------|-------------------|----------|
| PDFExportDialog | `/src/components/ItemCreationWorkflow/components/shared/PDFExportDialog.tsx` | ~12 | Medium |
| ItemPreviewModal | `/src/components/ItemManager/components/ItemPreview/ItemPreviewModal.tsx` | ~10 | Low |
| ItemViewModal | `/src/components/dashboard/ItemViewModal.tsx` | ~8 | Low |

---

## Translation Namespace Structure

Create a new `modals` namespace in the translation files organized by modal type:

```json
{
  "modals": {
    "common": {
      "cancel": "Cancel",
      "confirm": "Confirm",
      "close": "Close",
      "save": "Save",
      "saving": "Saving...",
      "delete": "Delete",
      "deleting": "Deleting...",
      "remove": "Remove",
      "removing": "Removing...",
      "actionCannotBeUndone": "This action cannot be undone.",
      "closeDialog": "Close dialog"
    },
    "confirmation": {
      "title": "Confirm Action",
      "defaultMessage": "Are you sure you want to proceed?"
    },
    "delete": {
      "title": "Delete Item",
      "titlePlural": "Delete Items",
      "messageSingle": "Are you sure you want to delete this item? This action cannot be undone.",
      "messagePlural": "Are you sure you want to delete these {count} items? This action cannot be undone.",
      "confirmButton": "Delete",
      "confirmButtonPlural": "Delete {count} Items",
      "alsoDeleteTitle": "This will also delete:",
      "resourceLinks": "{count, plural, one {# resource link} other {# resource links}}",
      "mediaFiles": "{count, plural, one {# media file} other {# media files}} from storage"
    },
    "exitWorkflow": {
      "title": "Exit Workflow?",
      "messageWithChangesAndItems": "You have unsaved changes and {count} {count, plural, one {item} other {items}} in this session. Are you sure you want to exit?",
      "messageWithChanges": "You have unsaved changes. Are you sure you want to exit?",
      "messageWithItems": "You have created {count} {count, plural, one {item} other {items}} in this session. Are you sure you want to exit?",
      "messageDefault": "Are you sure you want to exit the workflow?",
      "confirmButton": "Exit Workflow"
    },
    "removeItem": {
      "title": "Remove Item?",
      "message": "Are you sure you want to remove \"{itemName}\"? This action cannot be undone.",
      "confirmButton": "Remove"
    },
    "emptySession": {
      "title": "No Items Added",
      "message": "No items added yet. Add items or exit session?",
      "addItems": "Add Items",
      "exitSession": "Exit Session"
    },
    "removeAsset": {
      "title": "Remove {type}?",
      "types": {
        "video": "Video",
        "photo": "Photo",
        "pdf": "PDF",
        "default": "Asset"
      },
      "duration": "Duration: {duration}",
      "pages": "{count, plural, one {# page} other {# pages}}",
      "confirmButton": "Remove"
    },
    "deleteMedia": {
      "title": "Delete {type}?",
      "types": {
        "youtube": "YouTube Video",
        "pdf": "PDF Document",
        "image": "Image",
        "default": "Web Link"
      }
    },
    "addProperty": {
      "title": "Add New Property",
      "description": "Create a new property by entering the name and address information.",
      "fields": {
        "propertyName": "Property Name",
        "propertyNamePlaceholder": "e.g., Beach House",
        "addressLine1": "Address Line 1",
        "addressLine1Placeholder": "Street address",
        "addressLine2": "Address Line 2",
        "addressLine2Placeholder": "Apt, suite, unit, etc. (optional)",
        "city": "City",
        "cityPlaceholder": "City",
        "state": "State/Province",
        "statePlaceholder": "State or Province",
        "postalCode": "Postal Code",
        "postalCodePlaceholder": "ZIP / Postal code",
        "country": "Country",
        "selectCountry": "Select country..."
      },
      "validation": {
        "nameRequired": "Property name is required",
        "nameTooLong": "Property name must be 100 characters or less",
        "addressTooLong": "Address must be 200 characters or less",
        "cityTooLong": "City must be 100 characters or less",
        "stateTooLong": "State/Province must be 100 characters or less",
        "postalCodeTooLong": "Postal code must be 20 characters or less",
        "invalidCountry": "Please select a valid country"
      },
      "createButton": "Create Property",
      "creating": "Creating..."
    },
    "editProperty": {
      "title": "Edit Property",
      "description": "Edit the details of your property including name and address information.",
      "saveButton": "Save Changes",
      "saving": "Saving..."
    },
    "bulkMove": {
      "title": "Move {count} {count, plural, one {Item} other {Items}} to Another Property",
      "destinationLabel": "Destination property",
      "selectPlaceholder": "Select destination property...",
      "noPropertiesAvailable": "No other properties available",
      "noPropertiesMessage": "No properties available",
      "itemsToMove": "Items to move:",
      "fromProperty": "from: {propertyName}",
      "andMore": "(and {count} more...)",
      "confirmButton": "Move {count} {count, plural, one {Item} other {Items}}"
    },
    "bulkTag": {
      "addTitle": "Add Tags",
      "removeTitle": "Remove Tags",
      "addToItems": "from {count} {count, plural, one {Item} other {Items}}",
      "enterTagsLabel": "Enter tags to add:",
      "selectTagsLabel": "Select tags to remove:",
      "tagInputPlaceholder": "Type a tag and press Enter...",
      "maxTagsReached": "Max {max} tags",
      "noTagsFound": "No tags found on selected items.",
      "itemsToUpdate": "Items to be updated:",
      "suggestedTags": "Suggested tags:",
      "addButton": "Add {count} {count, plural, one {Tag} other {Tags}}",
      "removeButton": "Remove {count} {count, plural, one {Tag} other {Tags}}"
    },
    "pdfExport": {
      "title": "Export QR Codes as PDF",
      "itemCount": "{count, plural, one {# item} other {# items}}",
      "description": "Configure PDF export settings for your QR codes and download them as a printable PDF document.",
      "errorTitle": "PDF generation failed",
      "exportButton": "Export PDF",
      "generating": "Generating..."
    },
    "addContent": {
      "selectTitle": "Add Content",
      "createTitle": "Create Content",
      "options": {
        "writeText": "Write Text",
        "addLink": "Add Link",
        "uploadFile": "Upload File",
        "uploadHint": "Video, Image, PDF"
      },
      "textForm": {
        "titleLabel": "Title (Optional)",
        "titlePlaceholder": "Enter a title for this content",
        "contentLabel": "Text Content *",
        "contentPlaceholder": "Enter your text content here...",
        "characterCount": "{count} / {max} characters"
      },
      "urlForm": {
        "urlLabel": "URL *",
        "urlPlaceholder": "https://example.com",
        "titleLabel": "Link Title (Optional)",
        "titlePlaceholder": "Enter a title for this link"
      },
      "fileForm": {
        "selectLabel": "Select File *",
        "selectedFile": "Selected: {name} ({size} MB)"
      },
      "backButton": "Back",
      "addButton": "Add Content"
    }
  }
}
```

---

## Implementation Approach

### Pattern for Client Components

All modal/dialog components are client components (`'use client'`). Use the `useTranslations` hook:

```typescript
// Before
export function ConfirmDeleteDialog({ items, onConfirm, onCancel }) {
  const itemCount = items.length;
  const title = itemCount === 1 ? 'Delete Item' : 'Delete Items';
  const message = itemCount === 1
    ? 'Are you sure you want to delete this item? This action cannot be undone.'
    : `Are you sure you want to delete these ${itemCount} items? This action cannot be undone.`;

  return (
    <div>
      <h3>{title}</h3>
      <p>{message}</p>
      <button>Cancel</button>
      <button>Delete</button>
    </div>
  );
}

// After
import { useTranslations } from 'next-intl';

export function ConfirmDeleteDialog({ items, onConfirm, onCancel }) {
  const t = useTranslations('modals.delete');
  const tCommon = useTranslations('modals.common');
  const itemCount = items.length;

  return (
    <div>
      <h3>{itemCount === 1 ? t('title') : t('titlePlural')}</h3>
      <p>
        {itemCount === 1
          ? t('messageSingle')
          : t('messagePlural', { count: itemCount })}
      </p>
      <button>{tCommon('cancel')}</button>
      <button>
        {itemCount === 1
          ? t('confirmButton')
          : t('confirmButtonPlural', { count: itemCount })}
      </button>
    </div>
  );
}
```

### Pattern for Dynamic Content with Interpolation

```typescript
// ICU message format for pluralization and variables
t('messagePlural', { count: itemCount })
// Uses: "Are you sure you want to delete these {count} items?"

t('removeItem.message', { itemName: item.name })
// Uses: "Are you sure you want to remove \"{itemName}\"?"
```

### Pattern for Accessibility Attributes

```typescript
// Translate aria-label and other accessibility attributes
<button aria-label={tCommon('closeDialog')}>
  <X />
</button>

<div
  role="alertdialog"
  aria-modal="true"
  aria-labelledby={titleId}
  aria-describedby={descriptionId}
>
```

---

## Authorized Files and Functions for Modification

### Primary Files (Direct Modification Required)

| File Path | Modifications |
|-----------|---------------|
| `/src/components/ConfirmationModal.tsx` | Add `useTranslations`, replace default `confirmText`/`cancelText` |
| `/src/components/ItemManager/components/dialogs/ConfirmDeleteDialog.tsx` | Add translations, update `getDeleteTitle`, `getDeleteMessage`, `getConfirmButtonText` |
| `/src/components/dashboard/DeleteItemDialog.tsx` | Add translations for title, message, warning text, buttons |
| `/src/components/ItemCreationWorkflow/components/shared/ConfirmExitDialog.tsx` | Add translations, update `getExitMessage` |
| `/src/components/ItemCreationWorkflow/components/shared/RemoveItemDialog.tsx` | Add translations for title, message, buttons |
| `/src/components/ItemCreationWorkflow/components/shared/EmptySessionDialog.tsx` | Add translations for title, message, button labels |
| `/src/components/ItemManager/components/AssetPanel/AssetRemoveConfirmDialog.tsx` | Add translations, update `getTypeLabel` |
| `/src/components/MediaManagement/DeleteMediaConfirmDialog.tsx` | Add translations, update `getTypeLabel` |
| `/src/components/SimpleDashboard/AddPropertyModal.tsx` | Add translations for all form labels, placeholders, validation, buttons |
| `/src/components/SimpleDashboard/PropertyEditModal.tsx` | Add translations for all form labels, placeholders, validation, buttons |
| `/src/components/InstructionEditor/components/AddContentModal.tsx` | Add translations for all content type options, form labels, buttons |
| `/src/components/ItemManager/components/BulkActions/BulkMoveDialog.tsx` | Add translations for title, labels, buttons, empty states |
| `/src/components/ItemManager/components/BulkActions/BulkTagDialog.tsx` | Add translations for titles, labels, buttons, hints |
| `/src/components/ItemCreationWorkflow/components/shared/PDFExportDialog.tsx` | Add translations for title, error messages, buttons |
| `/src/components/ItemManager/components/ItemPreview/ItemPreviewModal.tsx` | Add translations for title, labels, buttons |
| `/src/components/dashboard/ItemViewModal.tsx` | Add translations for title, labels, buttons |

### Translation Files (Add New Keys)

| File Path | Modifications |
|-----------|---------------|
| `/messages/en.json` | Add complete `modals` namespace with all keys |
| `/messages/fr.json` | Add French translations for `modals` namespace |
| `/messages/es.json` | Add Spanish translations for `modals` namespace |
| `/messages/de.json` | Add German translations for `modals` namespace |
| `/messages/nl.json` | Add Dutch translations for `modals` namespace |
| `/messages/it.json` | Add Italian translations for `modals` namespace |

---

## Implementation Tasks

### Task 1: Create Translation Namespace Structure
**File:** `/messages/en.json`
- Add complete `modals` namespace with organized sub-sections
- Include all common button labels, confirmation messages, form labels

### Task 2: Update Confirmation Dialogs
**Files:** ConfirmationModal, ConfirmDeleteDialog, DeleteItemDialog, ConfirmExitDialog, RemoveItemDialog, EmptySessionDialog

For each component:
1. Import `useTranslations` from `next-intl`
2. Initialize translation hook with appropriate namespace
3. Replace all hardcoded strings with `t()` calls
4. Update helper functions to use translations
5. Translate aria-labels and accessibility attributes

### Task 3: Update Asset/Media Removal Dialogs
**Files:** AssetRemoveConfirmDialog, DeleteMediaConfirmDialog

1. Add translations for type labels (Video, Photo, PDF, etc.)
2. Translate confirmation messages and buttons
3. Handle dynamic type-based titles

### Task 4: Update Form Modals
**Files:** AddPropertyModal, PropertyEditModal, AddContentModal

1. Translate all form field labels and placeholders
2. Translate validation error messages
3. Translate button labels including loading states
4. Translate accessibility descriptions

### Task 5: Update Bulk Action Dialogs
**Files:** BulkMoveDialog, BulkTagDialog

1. Translate dynamic titles with item counts
2. Translate labels, placeholders, hints
3. Translate empty state messages
4. Handle pluralization for item/tag counts

### Task 6: Update Export/Preview Modals
**Files:** PDFExportDialog, ItemPreviewModal, ItemViewModal

1. Translate titles and descriptions
2. Translate error messages
3. Translate button labels including loading states

### Task 7: Generate Non-English Translations
**Files:** fr.json, es.json, de.json, nl.json, it.json

1. Use AI translation service (Claude/OpenAI) for initial translations
2. Apply ICU message format for pluralization
3. Preserve variable placeholders correctly

### Task 8: Verification and Testing
1. Run build to verify no TypeScript errors
2. Test each modal in each language
3. Verify pluralization works correctly
4. Check text overflow and layout issues

---

## Dependencies

### Required from Epic 1 (Must be complete):
- [x] `next-intl` package installed
- [x] i18n configuration in `/src/lib/i18n/config.ts`
- [x] `IntlProvider` wrapper in `/src/app/layout.tsx`
- [x] Translation files structure in `/messages/*.json`
- [x] `useTranslations` hook available

### Technical Dependencies:
- All modal components use client-side rendering (`'use client'`)
- All components are React functional components
- ICU message format support for pluralization

---

## Acceptance Criteria

- [ ] All modal and dialog components are identified and documented
- [ ] Hardcoded strings (titles, messages, button labels, warnings) are replaced with `t()` function calls
- [ ] Translation keys follow the established namespace pattern (`modals.{category}.{key}`)
- [ ] All extracted strings are added to `en.json` and propagated to other language files
- [ ] Modal components correctly display translated content when language is switched
- [ ] No hardcoded English text remains in modal or dialog components
- [ ] Button labels within modals use consistent translation keys with the common namespace where applicable
- [ ] Pluralization works correctly for item counts and tag counts
- [ ] Variable interpolation works correctly for dynamic content (item names, counts)
- [ ] All accessibility attributes (aria-labels) are translated
- [ ] Build passes without TypeScript errors
- [ ] Validation error messages in form modals are translated

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Missing strings during extraction | Medium | Low | Use grep/search to audit for remaining hardcoded strings |
| Translation key typos | Low | Medium | TypeScript typing for translation keys if available |
| Text overflow in other languages | Medium | Low | Design with 40% text expansion buffer |
| Helper function refactoring complexity | Low | Low | Maintain function signatures, only change return values |
| Pluralization edge cases | Low | Medium | Test with counts of 0, 1, 2, and large numbers |

---

## Estimated Effort

| Phase | Effort |
|-------|--------|
| Task 1: Create namespace structure | 1 hour |
| Task 2: Update confirmation dialogs (6 files) | 3 hours |
| Task 3: Update asset/media dialogs (2 files) | 1 hour |
| Task 4: Update form modals (3 files) | 2 hours |
| Task 5: Update bulk action dialogs (2 files) | 1.5 hours |
| Task 6: Update export/preview modals (3 files) | 1 hour |
| Task 7: Generate translations (5 languages) | 1.5 hours |
| Task 8: Verification and testing | 1 hour |
| **Total** | **~12 hours** |

---

## References

- [PRD: Localization Epic 2 - Static UI Translation](/docs/prd/PRD_L10N_Epic2_Static_UI_Translation.md)
- [Plan: Localization Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)
- [Request #340 in gen_requests_epic2.md](/docs/gen_requests_epic2.md)
