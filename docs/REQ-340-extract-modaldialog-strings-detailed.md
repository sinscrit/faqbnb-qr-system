# REQ-340: Extract Modal and Dialog Strings - Detailed Task Breakdown

**Document Created:** 2026-01-19 17:30 UTC
**Last Modified:** 2026-01-19 17:30 UTC
**Overview Document:** REQ-340-extract-modaldialog-strings-overview.md
**Implementation Plan:** Plan-111-L10N-Epic2-Static-UI-Translation.md
**Sub-Epic:** 2H - Common & Shared Components
**Task ID:** 2H.3

---

## Executive Summary

This document provides a granular, implementation-ready task breakdown for extracting all hardcoded English strings from modal and dialog components across the FAQBNB application. Each task is scoped to approximately 1 story point and includes specific file paths, line numbers, strings to extract, and translation keys to create.

**Scope Summary:**
- **17 Modal/Dialog Components** across 4 categories
- **~100+ Hardcoded Strings** to extract
- **6 Languages:** English (source), French, Spanish, German, Dutch, Italian

---

## Task Breakdown

### Phase 1: Translation Namespace Setup (2 Tasks)

#### Task 1.1: Create `modals` Namespace Structure in en.json

**File:** `/messages/en.json`
**Estimated Strings:** ~85 keys (common + all modal-specific keys)
**Priority:** CRITICAL (Blocks all other tasks)

**Steps:**
1. Open `/messages/en.json`
2. Add the complete `modals` namespace after the existing namespaces
3. Organize into sub-sections: `common`, `confirmation`, `delete`, `exitWorkflow`, `removeItem`, `emptySession`, `removeAsset`, `deleteMedia`, `addProperty`, `editProperty`, `bulkMove`, `bulkTag`, `pdfExport`, `addContent`, `itemPreview`, `itemView`

**Translation Keys to Add:**

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
      "closeDialog": "Close dialog",
      "andMore": "and {count} more"
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
      "messageWithName": "Are you sure you want to delete \"{itemName}\"? This action cannot be undone.",
      "confirmButton": "Delete",
      "confirmButtonPlural": "Delete {count} Items",
      "alsoDeleteTitle": "This will also delete:",
      "resourceLinks": "{count} resource link",
      "resourceLinksPlural": "{count} resource links",
      "mediaFiles": "{count} media file from storage",
      "mediaFilesPlural": "{count} media files from storage",
      "itemsToDelete": "Items to be deleted"
    },
    "exitWorkflow": {
      "title": "Exit Workflow?",
      "messageWithChangesAndItems": "You have unsaved changes and {count} item(s) in this session. Are you sure you want to exit?",
      "messageWithChanges": "You have unsaved changes. Are you sure you want to exit?",
      "messageWithItems": "You have created {count} item(s) in this session. Are you sure you want to exit?",
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
      "pages": "{count} page",
      "pagesPlural": "{count} pages",
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
      "creating": "Creating...",
      "creatingProperty": "Creating property"
    },
    "editProperty": {
      "title": "Edit Property",
      "description": "Edit the details of your property including name and address information.",
      "saveButton": "Save Changes",
      "saving": "Saving..."
    },
    "bulkMove": {
      "title": "Move {count} Item(s) to Another Property",
      "destinationLabel": "Destination property",
      "selectPlaceholder": "Select destination property...",
      "noPropertiesAvailable": "No other properties available",
      "noPropertiesMessage": "No properties available",
      "itemsToMove": "Items to move:",
      "fromProperty": "from: {propertyName}",
      "andMore": "(and {count} more...)",
      "confirmButton": "Move {count} Item(s)",
      "selectDestination": "Select destination property"
    },
    "bulkTag": {
      "addTitle": "Add Tags",
      "removeTitle": "Remove Tags",
      "addToItems": "from {count} Item(s)",
      "enterTagsLabel": "Enter tags to add:",
      "selectTagsLabel": "Select tags to remove:",
      "tagInputPlaceholder": "Type a tag and press Enter...",
      "maxTagsReached": "Max {max} tags",
      "noTagsFound": "No tags found on selected items.",
      "itemsToUpdate": "Items to be updated:",
      "suggestedTags": "Suggested tags:",
      "addButton": "Add {count} Tag(s)",
      "removeButton": "Remove {count} Tag(s)"
    },
    "pdfExport": {
      "title": "Export QR Codes as PDF",
      "itemCount": "{count} item(s)",
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
    },
    "itemPreview": {
      "title": "Item Preview",
      "closeButton": "Close"
    },
    "itemView": {
      "title": "View Item",
      "closeButton": "Close"
    }
  }
}
```

**Verification:**
- [ ] JSON structure is valid (no syntax errors)
- [ ] All keys use consistent naming convention
- [ ] Pluralization placeholders use `{count}` format

---

#### Task 1.2: Propagate `modals` Namespace to Other Languages

**Files:**
- `/messages/fr.json`
- `/messages/es.json`
- `/messages/de.json`
- `/messages/nl.json`
- `/messages/it.json`

**Steps:**
1. For each language file, add the translated `modals` namespace
2. Preserve all `{variable}` placeholders exactly as in English
3. Use AI translation service for initial translations

**Note:** Detailed translations will be provided by the translation service. Placeholder structure must be preserved exactly.

**Verification:**
- [ ] All 5 language files contain the complete `modals` namespace
- [ ] All variable placeholders (`{count}`, `{itemName}`, etc.) are preserved
- [ ] JSON structure is valid in all files

---

### Phase 2: Confirmation Dialogs (6 Tasks)

#### Task 2.1: Update ConfirmationModal.tsx

**File:** `/src/components/ConfirmationModal.tsx`
**Estimated Strings:** 2 (default props)
**Lines to Modify:** 3-25, 45-56

**Current Hardcoded Strings:**
| Line | Current String | Translation Key |
|------|---------------|-----------------|
| 19 | `'Confirm'` (default prop) | `modals.common.confirm` |
| 20 | `'Cancel'` (default prop) | `modals.common.cancel` |

**Implementation Steps:**

1. Add import at top of file:
```typescript
import { useTranslations } from 'next-intl';
```

2. Add `'use client';` directive if not present (already a client component based on usage)

3. Initialize translations hook inside component:
```typescript
const t = useTranslations('modals.common');
```

4. Update default props to use translations:
```typescript
// Change from:
confirmText = 'Confirm',
cancelText = 'Cancel',

// To:
confirmText,
cancelText,
// And inside component:
const defaultConfirmText = t('confirm');
const defaultCancelText = t('cancel');
const actualConfirmText = confirmText ?? defaultConfirmText;
const actualCancelText = cancelText ?? defaultCancelText;
```

**Note:** Since this component accepts `confirmText` and `cancelText` as props, the translations serve as defaults while allowing override. The calling components should eventually pass translated strings.

**Verification:**
- [ ] Import added correctly
- [ ] Hook initialized inside component function
- [ ] Default button text uses translations
- [ ] Build passes without TypeScript errors

---

#### Task 2.2: Update ConfirmDeleteDialog.tsx (ItemManager)

**File:** `/src/components/ItemManager/components/dialogs/ConfirmDeleteDialog.tsx`
**Estimated Strings:** 8
**Lines to Modify:** 1, 15, 60-89, 201-207, 252, 268-274

**Current Hardcoded Strings:**
| Line | Current String | Translation Key |
|------|---------------|-----------------|
| 62 | `'Delete Item'` | `modals.delete.title` |
| 62 | `'Delete Items'` | `modals.delete.titlePlural` |
| 73 | `'Are you sure you want to delete this item?...'` | `modals.delete.messageSingle` |
| 75 | `'Are you sure you want to delete these {count} items?...'` | `modals.delete.messagePlural` |
| 87 | `'Delete'` | `modals.delete.confirmButton` |
| 88 | `'Delete {count} Items'` | `modals.delete.confirmButtonPlural` |
| 215 | `'Items to be deleted'` | `modals.delete.itemsToDelete` |
| 230 | `'and {count} more'` | `modals.common.andMore` |
| 252 | `'Cancel'` | `modals.common.cancel` |
| 271 | `'Deleting...'` | `modals.common.deleting` |

**Implementation Steps:**

1. Add import:
```typescript
import { useTranslations } from 'next-intl';
```

2. Add hooks at start of component:
```typescript
const t = useTranslations('modals.delete');
const tCommon = useTranslations('modals.common');
```

3. Update helper functions to use translations:

```typescript
// getDeleteTitle function (lines 60-63)
export function getDeleteTitle(count: number, customTitle?: string, t?: ReturnType<typeof useTranslations>): string {
  if (customTitle) return customTitle;
  if (!t) return count === 1 ? 'Delete Item' : 'Delete Items'; // Fallback for non-React contexts
  return count === 1 ? t('title') : t('titlePlural');
}

// getDeleteMessage function (lines 71-76)
export function getDeleteMessage(count: number, t?: ReturnType<typeof useTranslations>): string {
  if (!t) {
    return count === 1
      ? 'Are you sure you want to delete this item? This action cannot be undone.'
      : `Are you sure you want to delete these ${count} items? This action cannot be undone.`;
  }
  return count === 1 ? t('messageSingle') : t('messagePlural', { count });
}

// getConfirmButtonText function (lines 84-89)
export function getConfirmButtonText(count: number, t?: ReturnType<typeof useTranslations>): string {
  if (!t) return count === 1 ? 'Delete' : `Delete ${count} Items`;
  return count === 1 ? t('confirmButton') : t('confirmButtonPlural', { count });
}
```

4. Update component to pass `t` to helper functions:
```typescript
// Line 201
{getDeleteTitle(itemCount, title, t)}

// Line 207
{getDeleteMessage(itemCount, t)}

// Line 274
{getConfirmButtonText(itemCount, t)}
```

5. Update Cancel button (line 252):
```typescript
{tCommon('cancel')}
```

6. Update loading state (line 271):
```typescript
<span>{tCommon('deleting')}</span>
```

7. Update overflow text (line 230):
```typescript
<span>{tCommon('andMore', { count: overflowCount })}</span>
```

8. Update aria-label (line 215):
```typescript
aria-label={t('itemsToDelete')}
```

**Verification:**
- [ ] All hardcoded strings replaced
- [ ] Helper functions updated with translation parameter
- [ ] Pluralization works correctly for 0, 1, and multiple items
- [ ] Build passes without TypeScript errors

---

#### Task 2.3: Update DeleteItemDialog.tsx (Dashboard)

**File:** `/src/components/dashboard/DeleteItemDialog.tsx`
**Estimated Strings:** 10
**Lines to Modify:** 1, 13, 72, 78-79, 92, 98-99, 104, 129, 148-151

**Current Hardcoded Strings:**
| Line | Current String | Translation Key |
|------|---------------|-----------------|
| 72 | `'Delete Item'` | `modals.delete.title` |
| 78-79 | `'Are you sure you want to delete "{item.name}"?...'` | `modals.delete.messageWithName` |
| 92 | `'This will also delete:'` | `modals.delete.alsoDeleteTitle` |
| 98 | `'{count} resource link(s)'` | `modals.delete.resourceLinks` / `resourceLinksPlural` |
| 104 | `'{count} media file(s) from storage'` | `modals.delete.mediaFiles` / `mediaFilesPlural` |
| 129 | `'Cancel'` | `modals.common.cancel` |
| 148 | `'Deleting...'` | `modals.common.deleting` |
| 151 | `'Delete Item'` | `modals.delete.confirmButton` |

**Implementation Steps:**

1. Add import:
```typescript
import { useTranslations } from 'next-intl';
```

2. Add hooks at start of component:
```typescript
const t = useTranslations('modals.delete');
const tCommon = useTranslations('modals.common');
```

3. Update title (line 72):
```typescript
{t('title')}
```

4. Update delete message (lines 78-79):
```typescript
{t('messageWithName', { itemName: item.name })}
{' '}{tCommon('actionCannotBeUndone')}
```

5. Update warning section (line 92):
```typescript
{t('alsoDeleteTitle')}
```

6. Update resource links count (lines 98-99):
```typescript
<span>{linksCount === 1 ? t('resourceLinks', { count: linksCount }) : t('resourceLinksPlural', { count: linksCount })}</span>
```

7. Update media files count (line 104):
```typescript
<span>{mediaCount === 1 ? t('mediaFiles', { count: mediaCount }) : t('mediaFilesPlural', { count: mediaCount })}</span>
```

8. Update buttons (lines 129, 148, 151):
```typescript
// Cancel button
{tCommon('cancel')}

// Deleting state
<span>{tCommon('deleting')}</span>

// Delete button
{t('confirmButton')}
```

**Verification:**
- [ ] All hardcoded strings replaced
- [ ] Variable interpolation works for item name
- [ ] Pluralization works for resource links and media files
- [ ] Build passes without TypeScript errors

---

#### Task 2.4: Update ConfirmExitDialog.tsx

**File:** `/src/components/ItemCreationWorkflow/components/shared/ConfirmExitDialog.tsx`
**Estimated Strings:** 7
**Lines to Modify:** 1, 31, 66-77, 155, 161, 181, 196

**Current Hardcoded Strings:**
| Line | Current String | Translation Key |
|------|---------------|-----------------|
| 68 | `'You have unsaved changes and {count} item(s)...'` | `modals.exitWorkflow.messageWithChangesAndItems` |
| 71 | `'You have unsaved changes...'` | `modals.exitWorkflow.messageWithChanges` |
| 74 | `'You have created {count} item(s)...'` | `modals.exitWorkflow.messageWithItems` |
| 76 | `'Are you sure you want to exit the workflow?'` | `modals.exitWorkflow.messageDefault` |
| 155 | `'Exit Workflow?'` | `modals.exitWorkflow.title` |
| 181 | `'Cancel'` | `modals.common.cancel` |
| 196 | `'Exit Workflow'` | `modals.exitWorkflow.confirmButton` |

**Implementation Steps:**

1. Add import:
```typescript
import { useTranslations } from 'next-intl';
```

2. Add hooks at start of component:
```typescript
const t = useTranslations('modals.exitWorkflow');
const tCommon = useTranslations('modals.common');
```

3. Update `getExitMessage` helper function (lines 66-77):
```typescript
function getExitMessage(itemCount: number, hasUnsavedChanges: boolean, t: ReturnType<typeof useTranslations>): string {
  if (hasUnsavedChanges && itemCount > 0) {
    return t('messageWithChangesAndItems', { count: itemCount });
  }
  if (hasUnsavedChanges) {
    return t('messageWithChanges');
  }
  if (itemCount > 0) {
    return t('messageWithItems', { count: itemCount });
  }
  return t('messageDefault');
}
```

4. Update component to pass `t` to helper:
```typescript
{getExitMessage(itemCount, hasUnsavedChanges, t)}
```

5. Update title (line 155):
```typescript
{t('title')}
```

6. Update buttons (lines 181, 196):
```typescript
// Cancel button
{tCommon('cancel')}

// Exit button
{t('confirmButton')}
```

**Verification:**
- [ ] All hardcoded strings replaced
- [ ] All 4 exit message scenarios work correctly
- [ ] Pluralization works for item count
- [ ] Build passes without TypeScript errors

---

#### Task 2.5: Update RemoveItemDialog.tsx

**File:** `/src/components/ItemCreationWorkflow/components/shared/RemoveItemDialog.tsx`
**Estimated Strings:** 4
**Lines to Modify:** 1, 14, 122-123, 129, 150, 167

**Current Hardcoded Strings:**
| Line | Current String | Translation Key |
|------|---------------|-----------------|
| 122-123 | `'Remove Item?'` | `modals.removeItem.title` |
| 129 | `'Are you sure you want to remove "{displayName}"?...'` | `modals.removeItem.message` |
| 150 | `'Cancel'` | `modals.common.cancel` |
| 167 | `'Remove'` | `modals.removeItem.confirmButton` |

**Implementation Steps:**

1. Add import:
```typescript
import { useTranslations } from 'next-intl';
```

2. Add hooks at start of component:
```typescript
const t = useTranslations('modals.removeItem');
const tCommon = useTranslations('modals.common');
```

3. Update title (lines 122-123):
```typescript
{t('title')}
```

4. Update message (line 129):
```typescript
{t('message', { itemName: displayName })}
```

5. Update buttons (lines 150, 167):
```typescript
// Cancel button
{tCommon('cancel')}

// Remove button
{t('confirmButton')}
```

**Verification:**
- [ ] All hardcoded strings replaced
- [ ] Variable interpolation works for item name
- [ ] Build passes without TypeScript errors

---

#### Task 2.6: Update EmptySessionDialog.tsx

**File:** `/src/components/ItemCreationWorkflow/components/shared/EmptySessionDialog.tsx`
**Estimated Strings:** 5
**Lines to Modify:** 1, 16, 132, 149-150, 158, 179, 198

**Current Hardcoded Strings:**
| Line | Current String | Translation Key |
|------|---------------|-----------------|
| 132 | `'Close dialog'` (aria-label) | `modals.common.closeDialog` |
| 149-150 | `'No Items Added'` | `modals.emptySession.title` |
| 158 | `'No items added yet. Add items or exit session?'` | `modals.emptySession.message` |
| 179 | `'Add Items'` | `modals.emptySession.addItems` |
| 198 | `'Exit Session'` | `modals.emptySession.exitSession` |

**Implementation Steps:**

1. Add import:
```typescript
import { useTranslations } from 'next-intl';
```

2. Add hooks at start of component:
```typescript
const t = useTranslations('modals.emptySession');
const tCommon = useTranslations('modals.common');
```

3. Update aria-label (line 132):
```typescript
aria-label={tCommon('closeDialog')}
```

4. Update title (lines 149-150):
```typescript
{t('title')}
```

5. Update message (line 158):
```typescript
{t('message')}
```

6. Update buttons (lines 179, 198):
```typescript
// Add Items button
{t('addItems')}

// Exit Session button
{t('exitSession')}
```

**Verification:**
- [ ] All hardcoded strings replaced
- [ ] Accessibility attributes translated
- [ ] Build passes without TypeScript errors

---

### Phase 3: Asset/Media Removal Dialogs (2 Tasks)

#### Task 3.1: Update AssetRemoveConfirmDialog.tsx

**File:** `/src/components/ItemManager/components/AssetPanel/AssetRemoveConfirmDialog.tsx`
**Estimated Strings:** ~8
**Priority:** Medium

**Implementation Steps:**

1. Add imports:
```typescript
import { useTranslations } from 'next-intl';
```

2. Add hooks:
```typescript
const t = useTranslations('modals.removeAsset');
const tCommon = useTranslations('modals.common');
```

3. Update type labels to use translations:
```typescript
// Update getTypeLabel function to use t('types.video'), t('types.photo'), etc.
```

4. Update all hardcoded strings:
- Title: `t('title', { type: typeLabel })`
- Duration display: `t('duration', { duration })`
- Pages count: `t('pages', { count })` / `t('pagesPlural', { count })`
- Cancel button: `tCommon('cancel')`
- Remove button: `t('confirmButton')`

**Verification:**
- [ ] All type labels translated
- [ ] Dynamic title works with interpolation
- [ ] Build passes without TypeScript errors

---

#### Task 3.2: Update DeleteMediaConfirmDialog.tsx

**File:** `/src/components/MediaManagement/DeleteMediaConfirmDialog.tsx`
**Estimated Strings:** ~6
**Priority:** Medium

**Implementation Steps:**

1. Add imports:
```typescript
import { useTranslations } from 'next-intl';
```

2. Add hooks:
```typescript
const t = useTranslations('modals.deleteMedia');
const tCommon = useTranslations('modals.common');
```

3. Update type labels:
- YouTube Video: `t('types.youtube')`
- PDF Document: `t('types.pdf')`
- Image: `t('types.image')`
- Default/Web Link: `t('types.default')`

4. Update all buttons:
- Cancel: `tCommon('cancel')`
- Delete: `tCommon('delete')`

**Verification:**
- [ ] All media type labels translated
- [ ] Build passes without TypeScript errors

---

### Phase 4: Form Modals (3 Tasks)

#### Task 4.1: Update AddPropertyModal.tsx

**File:** `/src/components/SimpleDashboard/AddPropertyModal.tsx`
**Estimated Strings:** ~25
**Lines to Modify:** 1, 8, 20, 91-133, 369-376, 417-452, 505-531

**Current Hardcoded Strings:**
| Location | Strings | Translation Keys |
|----------|---------|------------------|
| Title (369) | `'Add New Property'` | `modals.addProperty.title` |
| Description (374-376) | `'Create a new property...'` | `modals.addProperty.description` |
| Field Labels | `'Property Name'`, `'Address Line 1'`, etc. | `modals.addProperty.fields.*` |
| Placeholders | `'e.g., Beach House'`, `'Street address'`, etc. | `modals.addProperty.fields.*Placeholder` |
| Validation | `'Property name is required'`, etc. | `modals.addProperty.validation.*` |
| Buttons | `'Cancel'`, `'Create Property'`, `'Creating...'` | `modals.addProperty.*` |
| COUNTRIES array (20) | `'Select country...'` | `modals.addProperty.fields.selectCountry` |
| Screen reader (400) | `'Creating property...'` | `modals.addProperty.creatingProperty` |

**Implementation Steps:**

1. Add import:
```typescript
import { useTranslations } from 'next-intl';
```

2. Add hooks at start of component (line ~157):
```typescript
const t = useTranslations('modals.addProperty');
const tCommon = useTranslations('modals.common');
```

3. Update COUNTRIES first item or handle dynamically:
```typescript
// Option A: Keep static array but translate placeholder in dropdown
// Option B: Move placeholder handling to component
```

4. Update validateForm function (lines 91-133) to accept translations:
```typescript
const validateForm = (data: AddPropertyFormData, t: ReturnType<typeof useTranslations>): AddPropertyValidationErrors => {
  const errors: AddPropertyValidationErrors = {};

  const trimmedName = data.name.trim();
  if (!trimmedName) {
    errors.name = t('validation.nameRequired');
  } else if (trimmedName.length > 100) {
    errors.name = t('validation.nameTooLong');
  }
  // ... continue for all validation messages
};
```

5. Update Dialog.Title (line 369):
```typescript
{t('title')}
```

6. Update Dialog.Description (lines 374-376):
```typescript
{t('description')}
```

7. Update renderTextField calls with translated labels and placeholders:
```typescript
{renderTextField('name', t('fields.propertyName'), formData.name, {
  required: true,
  maxLength: 100,
  placeholder: t('fields.propertyNamePlaceholder'),
})}
```

8. Update buttons (lines 505, 525-530):
```typescript
// Cancel button
{tCommon('cancel')}

// Create button
{isSubmitting ? (
  <>
    <LoadingIndicator size="sm" color="white" label={t('creatingProperty')} />
    <span>{t('creating')}</span>
  </>
) : (
  <span>{t('createButton')}</span>
)}
```

**Verification:**
- [ ] All form labels translated
- [ ] All placeholders translated
- [ ] All validation messages translated
- [ ] Button states (normal/loading) translated
- [ ] Build passes without TypeScript errors

---

#### Task 4.2: Update PropertyEditModal.tsx

**File:** `/src/components/SimpleDashboard/PropertyEditModal.tsx`
**Estimated Strings:** ~20 (similar to AddPropertyModal)
**Priority:** High

**Implementation Steps:**

1. Follow same pattern as AddPropertyModal.tsx
2. Use `modals.editProperty.*` for edit-specific strings
3. Reuse `modals.addProperty.fields.*` for field labels (same structure)
4. Reuse `modals.addProperty.validation.*` for validation messages

**Key Differences from AddPropertyModal:**
- Title: `t('title')` → "Edit Property"
- Button: `t('saveButton')` → "Save Changes"
- Loading: `t('saving')` → "Saving..."

**Verification:**
- [ ] All strings translated
- [ ] Shared field translations work correctly
- [ ] Build passes without TypeScript errors

---

#### Task 4.3: Update AddContentModal.tsx

**File:** `/src/components/InstructionEditor/components/AddContentModal.tsx`
**Estimated Strings:** ~20
**Priority:** Medium

**Implementation Steps:**

1. Add imports:
```typescript
import { useTranslations } from 'next-intl';
```

2. Add hooks:
```typescript
const t = useTranslations('modals.addContent');
const tCommon = useTranslations('modals.common');
```

3. Update content type options:
- Write Text: `t('options.writeText')`
- Add Link: `t('options.addLink')`
- Upload File: `t('options.uploadFile')`
- Upload hint: `t('options.uploadHint')`

4. Update form labels and placeholders:
- Text form: `t('textForm.titleLabel')`, `t('textForm.contentLabel')`, etc.
- URL form: `t('urlForm.urlLabel')`, `t('urlForm.titleLabel')`, etc.
- File form: `t('fileForm.selectLabel')`, `t('fileForm.selectedFile', { name, size })`

5. Update buttons:
- Back: `t('backButton')` or `tCommon('back')`
- Add Content: `t('addButton')`

**Verification:**
- [ ] All content type options translated
- [ ] All form fields translated
- [ ] Character count format works correctly
- [ ] Build passes without TypeScript errors

---

### Phase 5: Bulk Action Dialogs (2 Tasks)

#### Task 5.1: Update BulkMoveDialog.tsx

**File:** `/src/components/ItemManager/components/BulkActions/BulkMoveDialog.tsx`
**Estimated Strings:** ~12
**Lines to Modify:** 1, 22, 196-199, 334, 344, 412-413, 487, 514, 517-519, 552, 567

**Current Hardcoded Strings:**
| Line | Current String | Translation Key |
|------|---------------|-----------------|
| 100 | `'Select a property...'` | `modals.bulkMove.selectPlaceholder` |
| 197 | `'No properties available'` | `modals.bulkMove.noPropertiesMessage` |
| 214 | `'Select destination property'` | `modals.bulkMove.selectDestination` |
| 334 | `'Items to move:'` | `modals.bulkMove.itemsToMove` |
| 344 | `'from: {propertyName}'` | `modals.bulkMove.fromProperty` |
| 353 | `'(and {count} more...)'` | `modals.bulkMove.andMore` |
| 487 | `'Move {count} Item(s) to Another Property'` | `modals.bulkMove.title` |
| 500 | `'Close dialog'` (aria-label) | `modals.common.closeDialog` |
| 514 | `'Destination property'` | `modals.bulkMove.destinationLabel` |
| 518 | `'No other properties available'` | `modals.bulkMove.noPropertiesAvailable` |
| 552 | `'Cancel'` | `modals.common.cancel` |
| 567 | `'Move {count} Item(s)'` | `modals.bulkMove.confirmButton` |

**Implementation Steps:**

1. Add import:
```typescript
import { useTranslations } from 'next-intl';
```

2. Add hooks:
```typescript
const t = useTranslations('modals.bulkMove');
const tCommon = useTranslations('modals.common');
```

3. Update title (line 487):
```typescript
{t('title', { count: itemCount })}
```

4. Update PropertyDropdown placeholder (line 100):
```typescript
placeholder={t('selectPlaceholder')}
```

5. Update empty state messages (lines 197, 518):
```typescript
{t('noPropertiesMessage')}
{t('noPropertiesAvailable')}
```

6. Update ItemPreviewList strings (lines 334, 344, 353):
```typescript
{t('itemsToMove')}
{t('fromProperty', { propertyName })}
{t('andMore', { count: remainingCount })}
```

7. Update buttons:
```typescript
// Cancel
{tCommon('cancel')}

// Confirm
{t('confirmButton', { count: itemCount })}
```

**Verification:**
- [ ] All strings translated
- [ ] Pluralization works for item counts
- [ ] Build passes without TypeScript errors

---

#### Task 5.2: Update BulkTagDialog.tsx

**File:** `/src/components/ItemManager/components/BulkActions/BulkTagDialog.tsx`
**Estimated Strings:** ~12
**Priority:** Medium

**Implementation Steps:**

1. Add imports:
```typescript
import { useTranslations } from 'next-intl';
```

2. Add hooks:
```typescript
const t = useTranslations('modals.bulkTag');
const tCommon = useTranslations('modals.common');
```

3. Update dynamic title based on mode (add/remove):
```typescript
{mode === 'add' ? t('addTitle') : t('removeTitle')}
```

4. Update labels:
- Items affected: `t('addToItems', { count })`
- Tag input label: `t('enterTagsLabel')` or `t('selectTagsLabel')`
- Input placeholder: `t('tagInputPlaceholder')`
- Max tags hint: `t('maxTagsReached', { max })`
- No tags found: `t('noTagsFound')`
- Items to update: `t('itemsToUpdate')`
- Suggested tags: `t('suggestedTags')`

5. Update buttons:
```typescript
// Cancel
{tCommon('cancel')}

// Add/Remove button
{mode === 'add'
  ? t('addButton', { count: selectedTags.length })
  : t('removeButton', { count: selectedTags.length })}
```

**Verification:**
- [ ] Add mode strings work correctly
- [ ] Remove mode strings work correctly
- [ ] Pluralization works for tag counts
- [ ] Build passes without TypeScript errors

---

### Phase 6: Export/Preview Modals (3 Tasks)

#### Task 6.1: Update PDFExportDialog.tsx

**File:** `/src/components/ItemCreationWorkflow/components/shared/PDFExportDialog.tsx`
**Estimated Strings:** ~6
**Priority:** Medium

**Implementation Steps:**

1. Add imports:
```typescript
import { useTranslations } from 'next-intl';
```

2. Add hooks:
```typescript
const t = useTranslations('modals.pdfExport');
const tCommon = useTranslations('modals.common');
```

3. Update strings:
- Title: `t('title')`
- Item count: `t('itemCount', { count })`
- Description: `t('description')`
- Error title: `t('errorTitle')`
- Export button: `t('exportButton')`
- Generating state: `t('generating')`

**Verification:**
- [ ] All strings translated
- [ ] Build passes without TypeScript errors

---

#### Task 6.2: Update ItemPreviewModal.tsx

**File:** `/src/components/ItemManager/components/ItemPreview/ItemPreviewModal.tsx`
**Estimated Strings:** ~4
**Priority:** Low

**Implementation Steps:**

1. Add imports and hooks
2. Update:
- Title: `t('title')`
- Close button: `tCommon('close')` or `t('closeButton')`
- Any labels or buttons

**Verification:**
- [ ] All strings translated
- [ ] Build passes without TypeScript errors

---

#### Task 6.3: Update ItemViewModal.tsx

**File:** `/src/components/dashboard/ItemViewModal.tsx`
**Estimated Strings:** ~4
**Priority:** Low

**Implementation Steps:**

1. Add imports and hooks
2. Update title and buttons similar to ItemPreviewModal

**Verification:**
- [ ] All strings translated
- [ ] Build passes without TypeScript errors

---

### Phase 7: Verification and Testing (2 Tasks)

#### Task 7.1: Run Build and Fix TypeScript Errors

**Command:** `npm run build`

**Steps:**
1. Run full build
2. Identify any TypeScript errors related to translations
3. Fix import issues, type mismatches, or missing keys
4. Verify all components compile successfully

**Common Issues to Check:**
- Missing `'use client'` directives
- Type mismatches with translation function return types
- Missing translation keys in JSON files
- Incorrect variable placeholder syntax

**Verification:**
- [ ] Build completes without errors
- [ ] No TypeScript warnings related to i18n

---

#### Task 7.2: Manual Testing of Modal Components

**Test Scenarios:**

For each modal component:
1. Open modal in English - verify all text displays correctly
2. Switch language to French - verify translations appear
3. Switch language to Spanish - verify translations appear
4. Test with each supported language
5. Verify pluralization works (test with 0, 1, 2, and 10 items)
6. Verify variable interpolation works (item names, counts)
7. Check text overflow and layout in longer languages (German)

**Test Checklist:**
- [ ] ConfirmationModal - default text and override props work
- [ ] ConfirmDeleteDialog (ItemManager) - single/plural items
- [ ] DeleteItemDialog (Dashboard) - item name interpolation, resource/media counts
- [ ] ConfirmExitDialog - all 4 message scenarios
- [ ] RemoveItemDialog - item name truncation and interpolation
- [ ] EmptySessionDialog - button labels and messages
- [ ] AssetRemoveConfirmDialog - type labels (Video, Photo, PDF)
- [ ] DeleteMediaConfirmDialog - media type labels
- [ ] AddPropertyModal - all form fields, validation, buttons
- [ ] PropertyEditModal - all form fields, validation, buttons
- [ ] AddContentModal - content type options, form states
- [ ] BulkMoveDialog - property dropdown, item counts
- [ ] BulkTagDialog - add/remove modes, tag counts
- [ ] PDFExportDialog - title, item count, error states
- [ ] ItemPreviewModal - title and close button
- [ ] ItemViewModal - title and close button

---

## Dependencies

### Prerequisites (Must be complete before starting):
- [x] Epic 1 Foundation complete (next-intl installed and configured)
- [x] `IntlProvider` wrapper in `/src/app/layout.tsx`
- [x] Translation files structure exists in `/messages/*.json`
- [x] `useTranslations` hook available from next-intl

### Task Dependencies:
```
Task 1.1 ─┬─► Task 2.1 ─► Task 7.1
          ├─► Task 2.2 ─► Task 7.1
          ├─► Task 2.3 ─► Task 7.1
          ├─► Task 2.4 ─► Task 7.1
          ├─► Task 2.5 ─► Task 7.1
          ├─► Task 2.6 ─► Task 7.1
          ├─► Task 3.1 ─► Task 7.1
          ├─► Task 3.2 ─► Task 7.1
          ├─► Task 4.1 ─► Task 7.1
          ├─► Task 4.2 ─► Task 7.1
          ├─► Task 4.3 ─► Task 7.1
          ├─► Task 5.1 ─► Task 7.1
          ├─► Task 5.2 ─► Task 7.1
          ├─► Task 6.1 ─► Task 7.1
          ├─► Task 6.2 ─► Task 7.1
          └─► Task 6.3 ─► Task 7.1

Task 1.2 ─────────────────────────► Task 7.2
Task 7.1 ─────────────────────────► Task 7.2
```

---

## Acceptance Criteria Verification

| Criteria | Verification Task |
|----------|-------------------|
| All modal/dialog components identified and documented | This document |
| Hardcoded strings replaced with `t()` function calls | Tasks 2.1-6.3 |
| Translation keys follow namespace pattern | Task 1.1 |
| All strings added to en.json | Task 1.1 |
| All strings propagated to other languages | Task 1.2 |
| Modal components display translated content | Task 7.2 |
| No hardcoded English text remains | Task 7.1 |
| Button labels use consistent translation keys | Tasks 2.1-6.3 |
| Pluralization works correctly | Task 7.2 |
| Variable interpolation works correctly | Task 7.2 |
| All accessibility attributes translated | Tasks 2.1-6.3 |
| Build passes without TypeScript errors | Task 7.1 |
| Validation error messages translated | Task 4.1, 4.2 |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Missing strings | Use grep to audit for remaining hardcoded text after implementation |
| Translation key typos | Consistent naming convention, code review |
| Text overflow | Design review in German (longest translations) |
| Helper function compatibility | Pass translation function as parameter |
| Pluralization edge cases | Test with 0, 1, 2, and large numbers |

---

## Notes for Implementation

1. **Client Components Only**: All modal/dialog components are client components. Use `useTranslations` hook (not `getTranslations`).

2. **Helper Function Pattern**: When updating helper functions (like `getDeleteTitle`, `getExitMessage`), pass the translation function as a parameter to maintain reusability while enabling translations.

3. **Default Props Pattern**: For components that accept text as props (like ConfirmationModal), use translations as defaults while allowing caller override.

4. **Pluralization Format**: Use ICU message format for pluralization:
   - English: `{count, plural, one {# item} other {# items}}`
   - Or handle in code with separate keys

5. **Accessibility**: All `aria-label` attributes must also be translated.

6. **Testing Priority**: Focus testing on:
   - Confirmation dialogs (high user impact)
   - Form modals (validation messages)
   - Bulk actions (pluralization)

---

## References

- [Overview Document: REQ-340-extract-modaldialog-strings-overview.md](./REQ-340-extract-modaldialog-strings-overview.md)
- [Implementation Plan: Plan-111-L10N-Epic2-Static-UI-Translation.md](./prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)
