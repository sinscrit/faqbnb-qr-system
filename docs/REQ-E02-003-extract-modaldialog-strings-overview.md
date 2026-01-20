# REQ-E02-003: Extract Modal and Dialog Strings - Implementation Overview

*Generated: 2026-01-19 14:30:00 UTC*
*Last Modified: 2026-01-19 14:30:00 UTC*

## Reference

- **Request**: REQ-E02-003 (Extract Modal and Dialog Strings)
- **Source**: docs/gen_requests_epic2.md
- **Implementation Plan**: docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md
- **Type**: Enhancement
- **Phase**: 2H (Common & Shared Components)
- **Task ID**: 2H.3
- **Size**: M (Medium)
- **Epic**: Localization Epic 2 - Static UI Translation
- **Depends On**:
  - Epic 1 (L10N Foundation - next-intl setup)
  - REQ-E02-001 (Common Namespace Structure - must be completed first)
  - REQ-E02-002 (Button Labels - provides action button translations used in dialogs)

## Summary

Extract all hardcoded text strings from modal dialogs, confirmation dialogs, and alert dialogs throughout the application and replace them with references to localized translation keys. This task affects 16 modal/dialog components containing approximately 100 distinct strings including titles, body text, warning messages, confirmation prompts, and dynamic messages with variable interpolation.

## Goals

1. Identify and catalog all modal and dialog components across the codebase (16 components)
2. Extract all hardcoded dialog strings to appropriate i18n namespaces
3. Replace hardcoded strings with `useTranslations()` hook references
4. Implement proper ICU message format for dynamic content with variable interpolation
5. Ensure dialogs display translated text based on user's language preference
6. Maintain accessibility features (ARIA labels, roles) with translated content
7. Follow consistent naming conventions for translation keys

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

### Existing Common Namespace (from REQ-E02-001)

After REQ-E02-001 completion, `/messages/en.json` contains:

```json
{
  "common": {
    "actions": { /* from REQ-E02-002 */ },
    "status": {
      "loading": "Loading...",
      "saving": "Saving...",
      "deleting": "Deleting...",
      "success": "Success",
      "error": "Error"
    },
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

### Estimated Scope

- **Files to modify**: 16 modal/dialog components
- **Distinct strings**: ~100 across all dialogs
- **New translation keys needed**: ~80 (beyond existing common namespace)
- **Strings with interpolation**: ~15 (requiring ICU format)
- **Pluralization patterns**: ~5

## Current Modal/Dialog Components

### Component Inventory

| Component | Location | Type | Est. Strings |
|-----------|----------|------|--------------|
| ConfirmationModal | `/src/components/ConfirmationModal.tsx` | Generic confirmation | 2 (defaults) |
| ItemPreviewModal | `/src/components/ItemManager/components/ItemPreview/ItemPreviewModal.tsx` | Item detail view | ~12 |
| PropertyEditModal | `/src/components/SimpleDashboard/PropertyEditModal.tsx` | Form modal | ~30 |
| AddPropertyModal | `/src/components/SimpleDashboard/AddPropertyModal.tsx` | Form modal | ~25 |
| ItemViewModal | `/src/components/dashboard/ItemViewModal.tsx` | Item detail view | ~10 |
| AddContentModal | `/src/components/InstructionEditor/components/AddContentModal.tsx` | Content creation | ~20 |
| ConfirmDeleteDialog | `/src/components/ItemManager/components/dialogs/ConfirmDeleteDialog.tsx` | Bulk delete | ~10 |
| BulkTagDialog | `/src/components/ItemManager/components/BulkActions/BulkTagDialog.tsx` | Tag management | ~15 |
| BulkMoveDialog | `/src/components/ItemManager/components/BulkActions/BulkMoveDialog.tsx` | Property move | ~12 |
| ConfirmExitDialog | `/src/components/ItemCreationWorkflow/components/shared/ConfirmExitDialog.tsx` | Workflow exit | ~8 |
| EmptySessionDialog | `/src/components/ItemCreationWorkflow/components/shared/EmptySessionDialog.tsx` | Empty state | ~5 |
| RemoveItemDialog | `/src/components/ItemCreationWorkflow/components/shared/RemoveItemDialog.tsx` | Item removal | ~5 |
| PDFExportDialog | `/src/components/ItemCreationWorkflow/components/shared/PDFExportDialog.tsx` | PDF export | ~8 |
| DeleteItemDialog | `/src/components/dashboard/DeleteItemDialog.tsx` | Item deletion | ~10 |
| DeleteMediaConfirmDialog | `/src/components/MediaManagement/DeleteMediaConfirmDialog.tsx` | Media deletion | ~8 |
| AssetRemoveConfirmDialog | `/src/components/ItemManager/components/AssetPanel/AssetRemoveConfirmDialog.tsx` | Asset removal | ~10 |

**Total**: ~16 components, ~100 strings

## Current Dialog Patterns in Codebase

### Pattern 1: Static Title and Message

```tsx
// Current: ConfirmExitDialog.tsx
<h3 id="exit-dialog-title">
  Exit Workflow?
</h3>
<p id="exit-dialog-description">
  {getExitMessage(itemCount, hasUnsavedChanges)}
</p>

// Target: Translated
<h3 id="exit-dialog-title">
  {t('title')}
</h3>
<p id="exit-dialog-description">
  {getExitMessage(t, itemCount, hasUnsavedChanges)}
</p>
```

### Pattern 2: Dynamic Message with Interpolation

```tsx
// Current: ConfirmDeleteDialog.tsx
return `Are you sure you want to delete these ${count} items? This action cannot be undone.`;

// Target: ICU format
// Translation key: "deleteMultipleMessage": "Are you sure you want to delete these {count} items? This action cannot be undone."
return t('deleteMultipleMessage', { count });
```

### Pattern 3: Helper Function Generating Strings

```tsx
// Current: ConfirmDeleteDialog.tsx
export function getDeleteTitle(count: number, customTitle?: string): string {
  if (customTitle) return customTitle;
  return count === 1 ? 'Delete Item' : 'Delete Items';
}

// Target: Accept translation function
export function getDeleteTitle(
  t: (key: string, params?: Record<string, unknown>) => string,
  count: number,
  customTitle?: string
): string {
  if (customTitle) return customTitle;
  return count === 1 ? t('title.single') : t('title.multiple');
}
```

### Pattern 4: Pluralization

```tsx
// Current: ConfirmExitDialog.tsx
return `You have created ${itemCount} item${itemCount !== 1 ? 's' : ''} in this session.`;

// Target: ICU plural format
// Translation: "sessionItemsMessage": "You have created {count, plural, one {# item} other {# items}} in this session."
return t('sessionItemsMessage', { count: itemCount });
```

### Pattern 5: Dynamic Type Labels

```tsx
// Current: DeleteMediaConfirmDialog.tsx
const typeLabels = {
  youtube_video: 'YouTube Video',
  pdf: 'PDF Document',
  image: 'Image',
  link: 'Web Link',
};
return `Delete ${typeLabels[type]}?`;

// Target: Translated type labels
return t('deleteTitle', { type: t(`types.${type}`) });
```

### Pattern 6: Form Modal with Validation

```tsx
// Current: PropertyEditModal.tsx
<label>Property Name</label>
<input placeholder="e.g., Beach House" />
{errors.name && <span>Property name is required</span>}

// Target: Translated
<label>{t('form.name.label')}</label>
<input placeholder={t('form.name.placeholder')} />
{errors.name && <span>{t('form.name.error.required')}</span>}
```

## Implementation Order

### Step 1: Extend Common.Confirmation Namespace

Add core confirmation dialog strings to `/messages/en.json`:

```json
{
  "common": {
    "confirmation": {
      "title": "Confirm Action",
      "deleteTitle": "Confirm Delete",
      "deleteMessage": "Are you sure you want to delete this? This action cannot be undone.",
      "deleteItemTitle": "Delete Item",
      "deleteItemsTitle": "Delete Items",
      "deleteItemMessage": "Are you sure you want to delete this item? This action cannot be undone.",
      "deleteItemsMessage": "Are you sure you want to delete these {count} items? This action cannot be undone.",
      "deleteNamedMessage": "Are you sure you want to delete \"{name}\"? This action cannot be undone.",
      "unsavedChanges": "You have unsaved changes. Are you sure you want to leave?",
      "cannotUndo": "This action cannot be undone.",
      "itemsToDelete": "Items to be deleted",
      "andMore": "and {count} more"
    },
    "dialog": {
      "close": "Close",
      "closeModal": "Close modal",
      "closeDialog": "Close dialog"
    }
  }
}
```

### Step 2: Create Component-Specific Namespaces

Add namespaces for complex dialogs that need many strings.

#### Workflow Dialogs Namespace

```json
{
  "workflow": {
    "dialogs": {
      "confirmExit": {
        "title": "Exit Workflow?",
        "messageDefault": "Are you sure you want to exit the workflow?",
        "messageUnsaved": "You have unsaved changes. Are you sure you want to exit?",
        "messageItems": "You have created {count, plural, one {# item} other {# items}} in this session. Are you sure you want to exit?",
        "messageUnsavedAndItems": "You have unsaved changes and {count, plural, one {# item} other {# items}} in this session. Are you sure you want to exit?",
        "stay": "Cancel",
        "exit": "Exit Workflow"
      },
      "emptySession": {
        "title": "No Items Added",
        "message": "No items added yet. Add items or exit session?",
        "addItems": "Add Items",
        "exitSession": "Exit Session"
      },
      "removeItem": {
        "title": "Remove Item?",
        "message": "Are you sure you want to remove \"{itemName}\"? This action cannot be undone.",
        "cancel": "Cancel",
        "remove": "Remove"
      },
      "pdfExport": {
        "title": "Export QR Codes as PDF",
        "itemCount": "{count, plural, one {# item} other {# items}}",
        "errorTitle": "PDF generation failed",
        "dismissError": "Dismiss error",
        "cancel": "Cancel",
        "generating": "Generating...",
        "export": "Export PDF"
      }
    }
  }
}
```

#### Property Dialogs Namespace

```json
{
  "properties": {
    "modal": {
      "addTitle": "Add New Property",
      "addDescription": "Create a new property by entering the name and address information.",
      "editTitle": "Edit Property",
      "editDescription": "Edit the details of your property including name and address information.",
      "saving": "Saving...",
      "creating": "Creating...",
      "form": {
        "name": {
          "label": "Property Name",
          "placeholder": "e.g., Beach House"
        },
        "address1": {
          "label": "Address Line 1",
          "placeholder": "Street address"
        },
        "address2": {
          "label": "Address Line 2",
          "placeholder": "Apt, suite, unit, etc. (optional)"
        },
        "city": {
          "label": "City",
          "placeholder": "City"
        },
        "state": {
          "label": "State/Province",
          "placeholder": "State or Province"
        },
        "postalCode": {
          "label": "Postal Code",
          "placeholder": "ZIP / Postal code"
        },
        "country": {
          "label": "Country",
          "placeholder": "Select country..."
        }
      },
      "validation": {
        "nameRequired": "Property name is required",
        "nameMaxLength": "Property name must be 100 characters or less",
        "addressMaxLength": "Address must be 200 characters or less",
        "cityMaxLength": "City must be 100 characters or less",
        "stateMaxLength": "State/Province must be 100 characters or less",
        "postalCodeMaxLength": "Postal Code must be 20 characters or less",
        "countryInvalid": "Please select a valid country"
      },
      "toast": {
        "saving": "Saving property changes...",
        "saveFailed": "Failed to update property",
        "createFailed": "Failed to create property"
      }
    }
  }
}
```

#### Items Dialogs Namespace

```json
{
  "items": {
    "dialogs": {
      "preview": {
        "title": "Item Preview",
        "close": "Close preview",
        "edit": "Edit",
        "manageAssets": "Manage Assets",
        "delete": "Delete"
      },
      "delete": {
        "title": "Delete Item",
        "message": "Are you sure you want to delete \"{itemName}\"? This action cannot be undone.",
        "warningHeader": "This will also delete:",
        "resourceLinks": "{count, plural, one {# resource link} other {# resource links}}",
        "mediaFiles": "{count, plural, one {# media file} other {# media files}} from storage",
        "confirm": "Delete Item",
        "deleting": "Deleting..."
      },
      "bulkDelete": {
        "titleSingle": "Delete Item",
        "titleMultiple": "Delete Items",
        "messageSingle": "Are you sure you want to delete this item? This action cannot be undone.",
        "messageMultiple": "Are you sure you want to delete these {count} items? This action cannot be undone.",
        "itemsList": "Items to be deleted",
        "andMore": "and {count} more",
        "cancel": "Cancel",
        "confirmSingle": "Delete",
        "confirmMultiple": "Delete {count} Items",
        "deleting": "Deleting..."
      },
      "view": {
        "description": "Description",
        "created": "Created:",
        "updated": "Updated:",
        "resources": "Resources ({count})",
        "noResources": "No resources attached to this item",
        "edit": "Edit Item",
        "delete": "Delete"
      }
    }
  }
}
```

#### Bulk Actions Namespace

```json
{
  "items": {
    "bulkActions": {
      "tags": {
        "addTitle": "Add Tags to {count, plural, one {# Item} other {# Items}}",
        "removeTitle": "Remove Tags from {count, plural, one {# Item} other {# Items}}",
        "addLabel": "Enter tags to add:",
        "addPlaceholder": "Type a tag and press Enter...",
        "maxTags": "Max {max} tags",
        "suggestions": "Suggested tags:",
        "removeLabel": "Select tags to remove:",
        "noTags": "No tags found on selected items.",
        "itemsPreview": "Items to be updated:",
        "andMore": "(and {count} more...)",
        "cancel": "Cancel",
        "addConfirm": "Add {count, plural, one {# Tag} other {# Tags}}",
        "removeConfirm": "Remove {count, plural, one {# Tag} other {# Tags}}",
        "removeTag": "Remove {tag} tag"
      },
      "move": {
        "title": "Move {count, plural, one {# Item} other {# Items}} to Another Property",
        "propertyLabel": "Destination property",
        "selectProperty": "Select destination property...",
        "selectPropertyAlt": "Select a property...",
        "noProperties": "No properties available",
        "noOtherProperties": "No other properties available",
        "itemsPreview": "Items to move:",
        "andMore": "(and {count} more...)",
        "cancel": "Cancel",
        "confirm": "Move {count, plural, one {# Item} other {# Items}}"
      }
    }
  }
}
```

#### Media/Asset Dialogs Namespace

```json
{
  "media": {
    "dialogs": {
      "deleteConfirm": {
        "titleYoutube": "Delete YouTube Video?",
        "titlePdf": "Delete PDF Document?",
        "titleImage": "Delete Image?",
        "titleLink": "Delete Web Link?",
        "warning": "This action cannot be undone.",
        "cancel": "Cancel",
        "delete": "Delete"
      },
      "assetRemove": {
        "titleVideo": "Remove Video?",
        "titlePhoto": "Remove Photo?",
        "titlePdf": "Remove PDF?",
        "titleGeneric": "Remove Asset?",
        "typeVideo": "Video",
        "typePhoto": "Photo",
        "typePdf": "PDF",
        "typeGeneric": "Asset",
        "duration": "Duration: {duration}",
        "pages": "{count, plural, one {# page} other {# pages}}",
        "warning": "This action cannot be undone.",
        "cancel": "Cancel",
        "cancelRemoval": "Cancel removal",
        "remove": "Remove",
        "removeAsset": "Remove asset"
      }
    }
  }
}
```

#### Content Dialogs Namespace

```json
{
  "content": {
    "addModal": {
      "selectTitle": "Add Content",
      "createTitle": "Create Content",
      "types": {
        "text": "Write Text",
        "link": "Add Link",
        "file": "Upload File",
        "fileHint": "Video, Image, PDF"
      },
      "form": {
        "titleLabel": "Title (Optional)",
        "titlePlaceholder": "Enter a title for this content",
        "textLabel": "Text Content *",
        "textPlaceholder": "Enter your text content here...",
        "charCount": "{count} / {max} characters",
        "urlLabel": "URL *",
        "urlPlaceholder": "https://example.com",
        "linkTitleLabel": "Link Title (Optional)",
        "linkTitlePlaceholder": "Enter a title for this link",
        "fileLabel": "Select File *"
      },
      "actions": {
        "back": "Back",
        "cancel": "Cancel",
        "add": "Add Content"
      }
    }
  }
}
```

### Step 3: Update Dialog Components (Priority Order)

#### High Priority (Core Functionality)

1. **ConfirmationModal.tsx** - Generic confirmation, used throughout
2. **ConfirmDeleteDialog.tsx** - Bulk delete operations
3. **ConfirmExitDialog.tsx** - Workflow exit (prevents data loss)
4. **PropertyEditModal.tsx** - Property management
5. **AddPropertyModal.tsx** - Property creation

#### Medium Priority (Common Operations)

6. **ItemPreviewModal.tsx** - Item viewing
7. **DeleteItemDialog.tsx** - Single item deletion
8. **BulkTagDialog.tsx** - Tag management
9. **BulkMoveDialog.tsx** - Property assignment
10. **ItemViewModal.tsx** - Item details

#### Lower Priority (Specialized)

11. **RemoveItemDialog.tsx** - Workflow item removal
12. **EmptySessionDialog.tsx** - Empty state handling
13. **PDFExportDialog.tsx** - PDF export
14. **AddContentModal.tsx** - Content creation
15. **DeleteMediaConfirmDialog.tsx** - Media deletion
16. **AssetRemoveConfirmDialog.tsx** - Asset removal

## Authorized Files and Functions for Modification

### Translation Files to Modify

#### `/messages/en.json`

- **Purpose**: English translation source file
- **Modification**:
  - Extend `common.confirmation` namespace with additional dialog strings
  - Add `common.dialog` namespace for shared dialog elements
  - Ensure all dialog strings have corresponding translation keys
  - Implement ICU format for pluralization and interpolation

#### `/messages/fr.json`, `/messages/es.json`, `/messages/de.json`, `/messages/nl.json`, `/messages/it.json`

- **Purpose**: Non-English translation files
- **Modification**: Add same keys as en.json (with English placeholders initially)
- **Note**: Actual translations generated in separate task (2H.10)

### Component Files to Modify

#### Generic Confirmation Components

| File | Modifications |
|------|---------------|
| `/src/components/ConfirmationModal.tsx` | Add `useTranslations('common')` hook; use translated defaults for `confirmText` and `cancelText` props |

#### Property Management Modals

| File | Modifications |
|------|---------------|
| `/src/components/SimpleDashboard/PropertyEditModal.tsx` | Add `useTranslations('properties.modal')` hook; replace all form labels, placeholders, validation messages, and button labels |
| `/src/components/SimpleDashboard/AddPropertyModal.tsx` | Add `useTranslations('properties.modal')` hook; replace all form labels, placeholders, validation messages, and button labels |

#### Item Management Dialogs

| File | Modifications |
|------|---------------|
| `/src/components/ItemManager/components/ItemPreview/ItemPreviewModal.tsx` | Add `useTranslations('items.dialogs.preview')` hook; replace title, close label, action buttons |
| `/src/components/ItemManager/components/dialogs/ConfirmDeleteDialog.tsx` | Add `useTranslations('items.dialogs.bulkDelete')` hook; modify helper functions to accept translation function; replace all static strings |
| `/src/components/dashboard/ItemViewModal.tsx` | Add `useTranslations('items.dialogs.view')` hook; replace section labels, empty state, action buttons |
| `/src/components/dashboard/DeleteItemDialog.tsx` | Add `useTranslations('items.dialogs.delete')` hook; replace title, message, warning, button labels |

#### Bulk Action Dialogs

| File | Modifications |
|------|---------------|
| `/src/components/ItemManager/components/BulkActions/BulkTagDialog.tsx` | Add `useTranslations('items.bulkActions.tags')` hook; replace all labels, placeholders, button text with ICU pluralization |
| `/src/components/ItemManager/components/BulkActions/BulkMoveDialog.tsx` | Add `useTranslations('items.bulkActions.move')` hook; replace all labels, placeholders, button text with ICU pluralization |

#### Workflow Dialogs

| File | Modifications |
|------|---------------|
| `/src/components/ItemCreationWorkflow/components/shared/ConfirmExitDialog.tsx` | Add `useTranslations('workflow.dialogs.confirmExit')` hook; modify `getExitMessage` helper to use translations with ICU pluralization |
| `/src/components/ItemCreationWorkflow/components/shared/EmptySessionDialog.tsx` | Add `useTranslations('workflow.dialogs.emptySession')` hook; replace all text |
| `/src/components/ItemCreationWorkflow/components/shared/RemoveItemDialog.tsx` | Add `useTranslations('workflow.dialogs.removeItem')` hook; replace title, message, buttons |
| `/src/components/ItemCreationWorkflow/components/shared/PDFExportDialog.tsx` | Add `useTranslations('workflow.dialogs.pdfExport')` hook; replace title, status text, error messages, buttons |

#### Media/Asset Dialogs

| File | Modifications |
|------|---------------|
| `/src/components/MediaManagement/DeleteMediaConfirmDialog.tsx` | Add `useTranslations('media.dialogs.deleteConfirm')` hook; replace dynamic type labels and confirmation text |
| `/src/components/ItemManager/components/AssetPanel/AssetRemoveConfirmDialog.tsx` | Add `useTranslations('media.dialogs.assetRemove')` hook; replace type labels, metadata display, confirmation text |

#### Content Dialogs

| File | Modifications |
|------|---------------|
| `/src/components/InstructionEditor/components/AddContentModal.tsx` | Add `useTranslations('content.addModal')` hook; replace all titles, type labels, form labels, placeholders, buttons |

### Helper Functions to Modify

| File | Function | Modification |
|------|----------|--------------|
| `/src/components/ItemManager/components/dialogs/ConfirmDeleteDialog.tsx` | `getDeleteTitle()` | Add translation function parameter; return translated strings |
| `/src/components/ItemManager/components/dialogs/ConfirmDeleteDialog.tsx` | `getDeleteMessage()` | Add translation function parameter; use ICU format for pluralization |
| `/src/components/ItemManager/components/dialogs/ConfirmDeleteDialog.tsx` | `getConfirmButtonText()` | Add translation function parameter; use ICU format for count |
| `/src/components/ItemCreationWorkflow/components/shared/ConfirmExitDialog.tsx` | `getExitMessage()` | Add translation function parameter; return appropriate translated message based on state |

### Files NOT to Modify

- `/src/lib/i18n/config.ts` - No changes needed
- `/src/lib/i18n/index.ts` - No changes needed
- `/src/app/layout.tsx` - IntlProvider already configured
- Test files (`__tests__/*.tsx`) - Testing handled separately
- UI primitive components (Radix UI wrappers) - Already use semantic slots

## Technical Specifications

### Import Pattern

Every dialog component must import the useTranslations hook:

```typescript
'use client';
import { useTranslations } from 'next-intl';

function MyDialog() {
  const t = useTranslations('namespace.dialogs.myDialog');

  return (
    <div role="alertdialog" aria-labelledby="dialog-title">
      <h3 id="dialog-title">{t('title')}</h3>
      <p>{t('message')}</p>
      <button>{t('cancel')}</button>
      <button>{t('confirm')}</button>
    </div>
  );
}
```

### Multiple Namespace Pattern

When a dialog needs both common and component-specific translations:

```typescript
'use client';
import { useTranslations } from 'next-intl';

function ConfirmDeleteDialog({ items }) {
  const tCommon = useTranslations('common');
  const t = useTranslations('items.dialogs.bulkDelete');

  return (
    <div role="alertdialog">
      <h3>{t('title')}</h3>
      <p>{t('message', { count: items.length })}</p>
      <button>{tCommon('cancel')}</button>
      <button>{t('confirm', { count: items.length })}</button>
    </div>
  );
}
```

### Variable Interpolation Pattern (ICU Format)

For messages with dynamic values:

```json
{
  "deleteNamedMessage": "Are you sure you want to delete \"{name}\"? This action cannot be undone."
}
```

```typescript
t('deleteNamedMessage', { name: item.title })
```

### Pluralization Pattern (ICU Format)

For count-based messages:

```json
{
  "messageItems": "You have created {count, plural, one {# item} other {# items}} in this session."
}
```

```typescript
t('messageItems', { count: itemCount })
```

### Helper Function Pattern

Update helper functions to accept translation function:

```typescript
// Before
export function getDeleteTitle(count: number): string {
  return count === 1 ? 'Delete Item' : 'Delete Items';
}

// After
export function getDeleteTitle(
  t: (key: string, params?: Record<string, unknown>) => string,
  count: number
): string {
  return count === 1 ? t('titleSingle') : t('titleMultiple');
}

// Or use ICU pluralization directly in the translation
// Translation: "title": "{count, plural, one {Delete Item} other {Delete Items}}"
export function getDeleteTitle(
  t: (key: string, params?: Record<string, unknown>) => string,
  count: number
): string {
  return t('title', { count });
}
```

### Accessibility Attributes

ARIA labels must also be translated:

```typescript
<div
  role="alertdialog"
  aria-modal="true"
  aria-labelledby="dialog-title"
  aria-describedby="dialog-description"
>
  <button aria-label={t('closeDialog')}>
    <X />
  </button>
</div>
```

## Translation Key Naming Convention

Following Plan-111 convention:
```
{namespace}.{component}.{element}.{variant?}
```

### Rules:
- Use camelCase for multi-word elements: `deleteMessage`, `confirmButton`
- Use descriptive names that indicate context: `titleSingle`, `titleMultiple`
- Group related strings under common parent keys
- Use `form.{field}.{attribute}` pattern for form dialogs

### Examples:
| String | Translation Key |
|--------|-----------------|
| "Delete Item" | `items.dialogs.delete.title` |
| "Are you sure..." (single) | `items.dialogs.bulkDelete.messageSingle` |
| "Are you sure..." (multiple) | `items.dialogs.bulkDelete.messageMultiple` |
| "Property Name" (label) | `properties.modal.form.name.label` |
| "e.g., Beach House" (placeholder) | `properties.modal.form.name.placeholder` |
| "Property name is required" | `properties.modal.validation.nameRequired` |
| "Exit Workflow?" | `workflow.dialogs.confirmExit.title` |

## Success Validation Checklist

### Code Validation
- [ ] All 16 dialog components have been updated
- [ ] Each updated component imports `useTranslations` from 'next-intl'
- [ ] No hardcoded English dialog text remains in modified components
- [ ] All helper functions accept and use translation function
- [ ] All dynamic messages use ICU format interpolation
- [ ] All pluralization uses ICU plural format
- [ ] All ARIA labels are translated

### Translation File Validation
- [ ] `/messages/en.json` contains all required dialog keys
- [ ] All 6 language files have identical key structures
- [ ] ICU message formats are syntactically correct
- [ ] No duplicate keys within namespaces

### Functional Validation
- [ ] Application builds without errors: `npm run build`
- [ ] Dialogs display correct text in English
- [ ] Dialogs display translated text when locale is changed
- [ ] Variable interpolation works correctly (names, counts)
- [ ] Pluralization displays correctly for 0, 1, and many items
- [ ] No console warnings about missing translation keys

### Visual Validation
- [ ] Dialog text is fully visible (no truncation)
- [ ] Dialog sizes accommodate translated text (allow for 40% expansion)
- [ ] Layout remains intact with longer translated strings
- [ ] Line breaks appear appropriately in longer messages

### Accessibility Validation
- [ ] ARIA labels are properly translated
- [ ] Screen reader announces translated content correctly
- [ ] Focus management still works correctly

## Dependencies

### Required (Already Completed)
- REQ-E02-001: Common Namespace Structure must be complete
- REQ-E02-002: Button labels extracted (used in dialog actions)
- Epic 1: next-intl foundation must be in place

### Related Tasks
- Task 2H.10: Will generate translations for non-English languages
- Task 2H.4: Form element strings (overlaps with form modals)
- Task 2H.8: Confirmation dialog messages (overlaps with common.confirmation)

## Risk Assessment

- **Risk Level**: Medium
- **Rationale**:
  - Moderate number of files (16) but high string density
  - Several helper functions require refactoring
  - ICU format complexity for pluralization
  - Dynamic content interpolation patterns

### Potential Issues

| Issue | Likelihood | Impact | Mitigation |
|-------|------------|--------|------------|
| ICU format syntax errors | Medium | High | Test each pluralization pattern; use next-intl linting |
| Helper function refactoring breaks callers | Medium | High | Update all call sites together; run type checks |
| Longer translated text breaks dialog layout | Medium | Low | Design system accommodates expansion; test visually |
| Missing variable interpolation | Low | Medium | Grep for remaining template literals; review all strings |
| Accessibility regression | Low | Medium | Test with screen reader after changes |
| Performance from multiple hooks | Low | Low | next-intl is optimized; negligible overhead |

## Search Patterns for Discovery

Use these patterns to verify all dialogs are covered:

```bash
# Find all modal/dialog components
grep -r "role=\"dialog\"\|role=\"alertdialog\"" --include="*.tsx" src/

# Find Modal/Dialog in filenames
find src -name "*Modal*.tsx" -o -name "*Dialog*.tsx"

# Find hardcoded dialog strings (after extraction)
grep -rE "(Delete Item|Confirm|Are you sure)" --include="*.tsx" src/components/

# Find components already using useTranslations (reference)
grep -r "useTranslations" --include="*.tsx" src/
```

## Notes

### Reference Implementation

The `LogoutButton.tsx` provides a reference for multi-namespace usage:

```typescript
'use client';
import { useTranslations } from 'next-intl';

function LogoutConfirmModal() {
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');

  return (
    <div role="alertdialog">
      <h3>{t('confirmLogout')}</h3>
      <p>{t('confirmSignOutMessage')}</p>
      <button>{tCommon('cancel')}</button>
      <button>{t('signOut')}</button>
    </div>
  );
}
```

### Coordination with Other Tasks

- This task focuses on dialog-specific strings (titles, messages, prompts)
- Button labels within dialogs may reference `common.actions` (from REQ-E02-002)
- Form modals have overlap with Task 2H.4 (form element strings)
- Confirmation patterns contribute to `common.confirmation` namespace

### Helper Function Refactoring Strategy

For functions like `getExitMessage()` and `getDeleteTitle()`:

1. Add translation function as first parameter
2. Update return statements to use translation calls
3. Update all call sites to pass the translation function
4. Ensure TypeScript types are correct

Example migration:

```typescript
// 1. Update function signature
function getExitMessage(
  t: (key: string, params?: Record<string, unknown>) => string,
  itemCount: number,
  hasUnsavedChanges: boolean
): string {
  // 2. Use translations for each case
  if (hasUnsavedChanges && itemCount > 0) {
    return t('messageUnsavedAndItems', { count: itemCount });
  }
  if (hasUnsavedChanges) {
    return t('messageUnsaved');
  }
  if (itemCount > 0) {
    return t('messageItems', { count: itemCount });
  }
  return t('messageDefault');
}

// 3. Update call sites
const t = useTranslations('workflow.dialogs.confirmExit');
const message = getExitMessage(t, itemCount, hasUnsavedChanges);
```

### Estimated Effort

Based on Plan-111, this task is estimated at ~100 strings across 16 dialog components. This represents approximately 12.5% of Sub-Epic 2H's overall ~800 strings. Due to the complexity of helper function refactoring and ICU format implementation, this M-sized task may take 1-2 days.

---

*End of Implementation Overview*
