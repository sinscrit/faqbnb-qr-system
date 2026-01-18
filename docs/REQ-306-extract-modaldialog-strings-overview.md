# REQ-306: Extract Modal and Dialog Strings for Internationalization - Implementation Overview

**Generated:** 2026-01-18 17:30:00 UTC
**Last Modified:** 2026-01-18 17:30:00 UTC
**Request Reference:** REQ-306 - Extract Modal and Dialog Strings for Internationalization
**Plan Reference:** Plan-111-L10N-Epic2-Static-UI-Translation.md (Sub-Epic 2H, Task 2H.3)
**Status:** Ready for Implementation

---

## 1. Request Summary

Extract all hardcoded text content from modal and dialog components throughout the application and replace them with translation keys using the `next-intl` translation function `t()`, enabling the application to display localized modal content based on user language preferences.

**Scope:**
- Identify all modal and dialog components containing hardcoded strings
- Extract titles, body content, confirmation messages, warning text, and action prompts
- Replace hardcoded strings with translation function calls
- Organize modal translation keys within appropriate namespaces (`common.confirmation`, `common.modals`, and feature-specific namespaces)
- Ensure dynamic content within modals supports translation parameters

**Out of Scope:**
- Translating content to other languages (handled by Task 2H.10)
- Creating the `common` namespace structure (completed in Task 2H.1 / REQ-304)
- Extracting button labels outside modals (Task 2H.2)
- Creating new modal components

---

## 2. Current State Analysis

### Modal/Dialog Components Inventory

Based on codebase exploration, the following modal and dialog components contain hardcoded strings that need extraction:

| Component | Location | Estimated Strings | Priority |
|-----------|----------|-------------------|----------|
| ConfirmationModal | `/src/components/ConfirmationModal.tsx` | ~5 | High |
| ConfirmDeleteDialog | `/src/components/ItemManager/components/dialogs/ConfirmDeleteDialog.tsx` | ~15 | High |
| ConfirmExitDialog | `/src/components/ItemCreationWorkflow/components/shared/ConfirmExitDialog.tsx` | ~10 | High |
| RemoveItemDialog | `/src/components/ItemCreationWorkflow/components/shared/RemoveItemDialog.tsx` | ~8 | High |
| EmptySessionDialog | `/src/components/ItemCreationWorkflow/components/shared/EmptySessionDialog.tsx` | ~8 | Medium |
| PDFExportDialog | `/src/components/ItemCreationWorkflow/components/shared/PDFExportDialog.tsx` | ~15 | Medium |
| PropertyEditModal | `/src/components/SimpleDashboard/PropertyEditModal.tsx` | ~30 | High |
| AddPropertyModal | `/src/components/SimpleDashboard/AddPropertyModal.tsx` | ~25 | High |
| DeleteItemDialog | `/src/components/dashboard/DeleteItemDialog.tsx` | ~12 | High |
| BulkTagDialog | `/src/components/ItemManager/components/BulkActions/BulkTagDialog.tsx` | ~20 | Medium |
| BulkMoveDialog | `/src/components/ItemManager/components/BulkActions/BulkMoveDialog.tsx` | ~18 | Medium |
| DeleteMediaConfirmDialog | `/src/components/MediaManagement/DeleteMediaConfirmDialog.tsx` | ~10 | Medium |
| ItemPreviewModal | `/src/components/ItemManager/components/ItemPreview/ItemPreviewModal.tsx` | ~15 | Medium |
| AssetRemoveConfirmDialog | `/src/components/ItemManager/components/AssetPanel/AssetRemoveConfirmDialog.tsx` | ~8 | Low |
| AddContentModal | `/src/components/InstructionEditor/components/AddContentModal.tsx` | ~20 | Medium |

**Total Estimated Strings:** ~220

### Existing Technology Stack

| Technology | Version | Location |
|------------|---------|----------|
| Next.js | 15.5.9 | `package.json` |
| React | 19.1.0 | `package.json` |
| TypeScript | ^5 | `package.json` |
| Radix UI Dialog | Various | `@radix-ui/react-dialog` |
| next-intl | TBD (Epic 1) | To be installed |

### Current Modal Patterns

The codebase uses several modal implementation patterns:

1. **Custom Modal Pattern** (most common):
   - Fixed position overlay with backdrop
   - Props-driven content: `title`, `message`, `confirmText`, `cancelText`
   - Example: `ConfirmationModal.tsx`

2. **Radix UI Dialog Pattern**:
   - Uses `@radix-ui/react-dialog` primitives
   - `Dialog.Root`, `Dialog.Portal`, `Dialog.Overlay`, `Dialog.Content`
   - Example: `PropertyEditModal.tsx`, `AddPropertyModal.tsx`

3. **Confirmation Dialog Pattern**:
   - Warning icon + title + message + action buttons
   - Consistent structure across components
   - Example: `ConfirmDeleteDialog.tsx`, `ConfirmExitDialog.tsx`

### String Categories in Modals

| Category | Examples | Count (Est.) |
|----------|----------|--------------|
| Dialog Titles | "Delete Item", "Exit Workflow?", "Edit Property" | ~25 |
| Confirmation Messages | "Are you sure you want to delete this?", "This action cannot be undone." | ~30 |
| Action Button Labels | "Delete", "Cancel", "Confirm", "Save Changes" | ~40 |
| Warning Text | "This will also delete:", "You have unsaved changes" | ~20 |
| Form Labels | "Property Name", "Address Line 1", "Country" | ~35 |
| Helper Text | "Items to be updated:", "Select tags to remove:" | ~25 |
| Status Messages | "Saving...", "Deleting...", "Creating..." | ~15 |
| Error Messages | "Failed to update property", "PDF generation failed" | ~15 |
| Accessibility Labels | "Close dialog", "Close modal" | ~15 |

---

## 3. Technical Approach

### Translation Key Organization

Modal strings will be organized into the following namespace structure:

```
common
├── confirmation        # Shared confirmation dialog strings (from REQ-304)
│   ├── title
│   ├── deleteTitle
│   ├── deleteMessage
│   └── ...
├── modals             # Generic modal UI strings (NEW)
│   ├── closeDialog
│   ├── loading
│   └── ...
└── actions            # Shared action buttons (from REQ-304)
    ├── save
    ├── cancel
    └── ...

properties             # Property-specific modal content
├── modal
│   ├── editTitle
│   ├── addTitle
│   └── ...

workflow               # Workflow-specific dialog content
├── dialogs
│   ├── confirmExit
│   ├── removeItem
│   ├── emptySession
│   └── ...

items                  # Item management dialog content
├── delete
│   ├── title
│   ├── message
│   └── ...
├── bulk
│   ├── tagDialog
│   ├── moveDialog
│   └── ...
```

### Translation Pattern - Client Components

```typescript
// Before (hardcoded)
function ConfirmDeleteDialog() {
  return (
    <h3>Delete Item</h3>
    <p>Are you sure you want to delete this item? This action cannot be undone.</p>
    <button>Cancel</button>
    <button>Delete</button>
  );
}

// After (translated)
import { useTranslations } from 'next-intl';

function ConfirmDeleteDialog() {
  const t = useTranslations('items.delete');
  const tCommon = useTranslations('common.actions');

  return (
    <h3>{t('title')}</h3>
    <p>{t('message')}</p>
    <button>{tCommon('cancel')}</button>
    <button>{tCommon('delete')}</button>
  );
}
```

### Translation Pattern - Dynamic Content

```typescript
// Before
<p>Are you sure you want to delete "{item.name}"?</p>

// After
<p>{t('deleteItemMessage', { name: item.name })}</p>
```

### Translation Pattern - Pluralization

```typescript
// Translation key
{
  "items.bulk.selectedCount": "{count, plural, one {# Item} other {# Items}}"
}

// Usage
<h2>{t('selectedCount', { count: itemCount })}</h2>
```

### Translation Pattern - Conditional Messages

```typescript
// Before
function getDeleteTitle(count: number): string {
  return count === 1 ? 'Delete Item' : 'Delete Items';
}

// After
function getDeleteTitle(count: number, t: ReturnType<typeof useTranslations>): string {
  return t('title', { count });
}

// Translation key with ICU
{
  "items.delete.title": "{count, plural, one {Delete Item} other {Delete Items}}"
}
```

### Accessibility Attribute Translations

```typescript
// Before
<button aria-label="Close dialog">

// After
<button aria-label={t('a11y.closeDialog')}>
```

---

## 4. Implementation Tasks

### Task 2H.3.1: Extract ConfirmationModal strings

**File:** `/src/components/ConfirmationModal.tsx`
**Complexity:** Low

**Strings to extract:**
- Default `confirmText` prop value: "Confirm"
- Default `cancelText` prop value: "Cancel"

**Note:** This component receives dynamic content via props, so extraction is minimal. Ensure callers provide translated strings.

### Task 2H.3.2: Extract ConfirmDeleteDialog strings

**File:** `/src/components/ItemManager/components/dialogs/ConfirmDeleteDialog.tsx`
**Complexity:** Medium

**Strings to extract:**
- Titles: "Delete Item", "Delete Items" (pluralized)
- Messages: "Are you sure you want to delete this item? This action cannot be undone."
- Bulk message with count interpolation
- Button: "Cancel", "Delete", "Delete {count} Items"
- Loading state: "Deleting..."
- Helper text: "and {count} more"
- Accessibility: aria-labels

### Task 2H.3.3: Extract ConfirmExitDialog strings

**File:** `/src/components/ItemCreationWorkflow/components/shared/ConfirmExitDialog.tsx`
**Complexity:** Medium

**Strings to extract:**
- Title: "Exit Workflow?"
- Dynamic messages based on session state
- Buttons: "Cancel", "Exit Workflow"

### Task 2H.3.4: Extract RemoveItemDialog strings

**File:** `/src/components/ItemCreationWorkflow/components/shared/RemoveItemDialog.tsx`
**Complexity:** Low

**Strings to extract:**
- Title: "Remove Item?"
- Message with item name interpolation
- Buttons: "Cancel", "Remove"

### Task 2H.3.5: Extract EmptySessionDialog strings

**File:** `/src/components/ItemCreationWorkflow/components/shared/EmptySessionDialog.tsx`
**Complexity:** Low

**Strings to extract:**
- Title: "No Items Added"
- Message: "No items added yet. Add items or exit session?"
- Buttons: "Add Items", "Exit Session"
- Accessibility: "Close dialog"

### Task 2H.3.6: Extract PDFExportDialog strings

**File:** `/src/components/ItemCreationWorkflow/components/shared/PDFExportDialog.tsx`
**Complexity:** Medium

**Strings to extract:**
- Title: "Export QR Codes as PDF"
- Item count badge with pluralization
- Error banner: "PDF generation failed"
- Description (sr-only): "Configure PDF export settings..."
- Buttons: "Cancel", "Export PDF", "Generating..."
- Accessibility: "Close dialog", "Dismiss error"

### Task 2H.3.7: Extract PropertyEditModal strings

**File:** `/src/components/SimpleDashboard/PropertyEditModal.tsx`
**Complexity:** High

**Strings to extract:**
- Title: "Edit Property"
- Description (sr-only): "Edit the details of your property..."
- Form labels: "Property Name", "Address Line 1", "Address Line 2", "City", "State/Province", "Postal Code", "Country"
- Placeholders: "e.g., Beach House", "Street address", etc.
- Validation messages: "Property name is required", "must be X characters or less"
- Country dropdown: "Select country..."
- Country names (may use existing library)
- Buttons: "Cancel", "Save Changes", "Saving..."
- Status announcements: "Saving property changes...", "Error: {message}"
- Accessibility: "Close modal"

### Task 2H.3.8: Extract AddPropertyModal strings

**File:** `/src/components/SimpleDashboard/AddPropertyModal.tsx`
**Complexity:** High

**Strings to extract:**
- Title: "Add New Property"
- Description (sr-only): "Create a new property..."
- Form labels and placeholders (same as PropertyEditModal)
- Validation messages
- Buttons: "Cancel", "Create Property", "Creating..."
- Status announcements

### Task 2H.3.9: Extract DeleteItemDialog strings

**File:** `/src/components/dashboard/DeleteItemDialog.tsx`
**Complexity:** Medium

**Strings to extract:**
- Title: "Delete Item"
- Message with item name: "Are you sure you want to delete {name}?"
- Warning section: "This will also delete:"
- Resource counts: "{count} resource links", "{count} media files from storage"
- Buttons: "Cancel", "Delete Item", "Deleting..."

### Task 2H.3.10: Extract BulkTagDialog strings

**File:** `/src/components/ItemManager/components/BulkActions/BulkTagDialog.tsx`
**Complexity:** Medium

**Strings to extract:**
- Titles: "Add Tags", "Remove Tags"
- Dynamic title: "from {count} Items"
- Labels: "Enter tags to add:", "Select tags to remove:"
- Helper text: "Suggested tags:", "Items to be updated:", "(and {count} more...)"
- Empty state: "No tags found on selected items."
- Input placeholder: "Type a tag and press Enter...", "Max {count} tags"
- Buttons: "Cancel", "Add {count} Tags", "Remove {count} Tags"
- Accessibility: "Close dialog", "Remove {tag} tag"

### Task 2H.3.11: Extract BulkMoveDialog strings

**File:** `/src/components/ItemManager/components/BulkActions/BulkMoveDialog.tsx`
**Complexity:** Medium

**Strings to extract:**
- Title: "Move {count} Items to Another Property"
- Labels: "Destination property", "Select destination property..."
- Empty state: "No properties available", "No other properties available"
- Helper text: "Items to move:", "(and {count} more...)", "from: {propertyName}"
- Buttons: "Cancel", "Move {count} Items"
- Accessibility: "Close dialog", "Select destination property", "Available properties"

### Task 2H.3.12: Extract DeleteMediaConfirmDialog strings

**File:** `/src/components/MediaManagement/DeleteMediaConfirmDialog.tsx`
**Complexity:** Low

**Strings to extract:**
- Titles by type: "Delete YouTube Video?", "Delete PDF Document?", "Delete Image?", "Delete Web Link?"
- Warning: "This action cannot be undone."
- Buttons: "Cancel", "Delete"

### Task 2H.3.13: Extract AssetRemoveConfirmDialog strings

**File:** `/src/components/ItemManager/components/AssetPanel/AssetRemoveConfirmDialog.tsx`
**Complexity:** Low

**Strings to extract:**
- Title: "Remove Asset?"
- Message: "Are you sure you want to remove this asset?"
- Buttons: "Cancel", "Remove"

### Task 2H.3.14: Extract AddContentModal strings

**File:** `/src/components/InstructionEditor/components/AddContentModal.tsx`
**Complexity:** Medium

**Strings to extract:**
- Titles: "Add Content", "Create Content"
- Content type buttons: "Write Text", "Add Link", "Upload File"
- Sub-label: "Video, Image, PDF"
- Form labels: "Title (Optional)", "Text Content", "URL", "Link Title (Optional)", "Select File"
- Placeholders: "Enter a title for this content", "Enter your text content here...", "https://example.com"
- Character counter: "{count} / 5000 characters"
- File info: "Selected: {name} ({size} MB)"
- Buttons: "Back", "Cancel", "Add Content"

### Task 2H.3.15: Update translation files with modal keys

**Files:** `/messages/en.json` (and stub files for other languages)
**Complexity:** Medium

**Actions:**
- Add `common.modals` sub-namespace if not present
- Add feature-specific modal keys to respective namespaces
- Ensure ICU format is correct for pluralized strings
- Validate JSON syntax

---

## 5. Authorized Files and Functions for Modification

### Files to MODIFY

| File Path | Description | Modification |
|-----------|-------------|--------------|
| `/src/components/ConfirmationModal.tsx` | Generic confirmation modal | Add useTranslations import; translate default prop values |
| `/src/components/ItemManager/components/dialogs/ConfirmDeleteDialog.tsx` | Item delete confirmation | Add useTranslations; replace all hardcoded strings |
| `/src/components/ItemCreationWorkflow/components/shared/ConfirmExitDialog.tsx` | Workflow exit confirmation | Add useTranslations; replace all hardcoded strings |
| `/src/components/ItemCreationWorkflow/components/shared/RemoveItemDialog.tsx` | Remove item confirmation | Add useTranslations; replace all hardcoded strings |
| `/src/components/ItemCreationWorkflow/components/shared/EmptySessionDialog.tsx` | Empty session warning | Add useTranslations; replace all hardcoded strings |
| `/src/components/ItemCreationWorkflow/components/shared/PDFExportDialog.tsx` | PDF export settings | Add useTranslations; replace all hardcoded strings |
| `/src/components/SimpleDashboard/PropertyEditModal.tsx` | Property edit form | Add useTranslations; replace all hardcoded strings |
| `/src/components/SimpleDashboard/AddPropertyModal.tsx` | Property creation form | Add useTranslations; replace all hardcoded strings |
| `/src/components/dashboard/DeleteItemDialog.tsx` | Dashboard item delete | Add useTranslations; replace all hardcoded strings |
| `/src/components/ItemManager/components/BulkActions/BulkTagDialog.tsx` | Bulk tag operations | Add useTranslations; replace all hardcoded strings |
| `/src/components/ItemManager/components/BulkActions/BulkMoveDialog.tsx` | Bulk move operations | Add useTranslations; replace all hardcoded strings |
| `/src/components/MediaManagement/DeleteMediaConfirmDialog.tsx` | Media delete confirmation | Add useTranslations; replace all hardcoded strings |
| `/src/components/ItemManager/components/AssetPanel/AssetRemoveConfirmDialog.tsx` | Asset remove confirmation | Add useTranslations; replace all hardcoded strings |
| `/src/components/InstructionEditor/components/AddContentModal.tsx` | Add content modal | Add useTranslations; replace all hardcoded strings |
| `/messages/en.json` | English translations | Add modal-specific translation keys |

### Functions to MODIFY

| Component | Function/Section | Modification |
|-----------|------------------|--------------|
| ConfirmDeleteDialog | `getDeleteTitle()` | Use translation with ICU pluralization |
| ConfirmDeleteDialog | `getDeleteMessage()` | Use translation with ICU pluralization |
| ConfirmDeleteDialog | `getConfirmButtonText()` | Use translation with count interpolation |
| ConfirmExitDialog | `getExitMessage()` | Use translation with conditional params |
| DeleteMediaConfirmDialog | `getTypeLabel()` | Use translations for content type labels |
| PropertyEditModal | `validateForm()` | Return translation keys instead of hardcoded messages |
| AddPropertyModal | `validateForm()` | Return translation keys instead of hardcoded messages |
| BulkTagDialog | Component body | Replace all inline strings with t() calls |
| BulkMoveDialog | Component body | Replace all inline strings with t() calls |

### Files to READ (Reference Only)

| File Path | Purpose |
|-----------|---------|
| `/messages/en.json` | Check existing `common` namespace keys to reuse |
| `/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md` | Reference implementation patterns |
| `/docs/REQ-304-create-common-namespace-structure-in-overview.md` | Reference common keys available |

### Files NOT to Modify

- `/messages/fr.json`, `/messages/es.json`, etc. (handled by Task 2H.10)
- Test files (`*.test.tsx`) - will be updated separately
- Type definition files unless necessary for translation params
- Non-modal/dialog components

---

## 6. Dependencies

### Prerequisite Tasks

| Task | Description | Status |
|------|-------------|--------|
| Epic 1 - Foundation | i18n Framework Integration | Must be completed first |
| REQ-229 | Install and configure next-intl | Must be completed |
| REQ-304 / Task 2H.1 | Create common namespace structure | Must be completed |

**Note:** This task uses `common.actions` and `common.confirmation` keys from REQ-304. Verify these keys exist before implementation.

### Downstream Dependencies (Tasks blocked by this)

| Task | Description | Dependency |
|------|-------------|------------|
| Task 2H.10 | Generate translations for 5 non-English languages | Modal keys must be in en.json |
| Epic 2 testing | Modal translation verification | All modals must be updated |

---

## 7. Acceptance Criteria

From REQ-306 in gen_requests_epic2.md:

- [ ] All modal and dialog components have been identified and their text content catalogued
- [ ] Modal titles are extracted to translation keys and replaced with translation function calls
- [ ] Modal body content and descriptions use translation keys instead of hardcoded strings
- [ ] Confirmation prompts, warning messages, and instructional text in modals are internationalized
- [ ] Common modal types share consistent translation key structures across the application
- [ ] Translation files include organized sections for modal content with clear naming conventions
- [ ] All modal functionality remains unchanged after string extraction
- [ ] Modal accessibility attributes that depend on text content are properly maintained
- [ ] Dynamic content within modals can accept translation parameters when needed

### Additional Verification Criteria

- [ ] All 15 identified modal/dialog components have been updated
- [ ] ~220 strings extracted and replaced with translation keys
- [ ] ICU format used correctly for pluralized strings
- [ ] Dynamic content uses proper parameter interpolation
- [ ] Accessibility labels (aria-label, sr-only) are translated
- [ ] JSON translation file remains valid after additions
- [ ] Build succeeds without errors
- [ ] All modals render correctly in development

---

## 8. Testing Strategy

### Pre-Implementation Verification

```bash
# Verify Epic 1 is complete
npm list next-intl

# Verify common namespace exists
cat messages/en.json | python3 -c "
import json, sys
d = json.load(sys.stdin)
if 'common' not in d:
    print('ERROR: common namespace missing')
    sys.exit(1)
print('common namespace found')
"
```

### Post-Implementation Verification

```bash
# Validate JSON syntax
cat messages/en.json | python3 -m json.tool > /dev/null && echo "Valid JSON"

# Build verification
npm run build

# Start dev server and manually test modals
npm run dev
```

### Manual Testing Checklist

For each modal component, verify:

- [ ] Modal opens correctly
- [ ] Title displays translated text
- [ ] Body content displays translated text
- [ ] Buttons display translated text
- [ ] Dynamic content (item names, counts) interpolates correctly
- [ ] Pluralization works (test with count=0, 1, 2+)
- [ ] Loading states display translated text
- [ ] Error states display translated text
- [ ] Accessibility attributes are translated
- [ ] Modal closes correctly (no regressions)
- [ ] Keyboard navigation still works
- [ ] Screen reader announces correct content

### Component-Specific Test Cases

| Component | Test Case |
|-----------|-----------|
| ConfirmDeleteDialog | Test with 1 item, 5 items, and 10+ items (overflow) |
| ConfirmExitDialog | Test with 0 items, 1 item, and unsaved changes |
| PDFExportDialog | Test item count badge with 1 vs multiple items |
| PropertyEditModal | Test all validation messages trigger |
| BulkTagDialog | Test add mode and remove mode titles |
| BulkMoveDialog | Test with different item counts |

---

## 9. Translation Keys Reference

### New Keys to Add to `/messages/en.json`

```json
{
  "common": {
    "modals": {
      "closeDialog": "Close dialog",
      "closeModal": "Close modal",
      "dismissError": "Dismiss error"
    }
  },
  "items": {
    "delete": {
      "title": "{count, plural, one {Delete Item} other {Delete Items}}",
      "message": "{count, plural, one {Are you sure you want to delete this item? This action cannot be undone.} other {Are you sure you want to delete these {count} items? This action cannot be undone.}}",
      "confirmButton": "{count, plural, one {Delete} other {Delete {count} Items}}",
      "deleting": "Deleting...",
      "overflowCount": "and {count} more",
      "alsoDelete": "This will also delete:",
      "resourceLinks": "{count, plural, one {# resource link} other {# resource links}}",
      "mediaFiles": "{count, plural, one {# media file} other {# media files}} from storage"
    },
    "bulk": {
      "tagDialog": {
        "addTitle": "Add Tags",
        "removeTitle": "Remove Tags",
        "fromItems": "from {count, plural, one {# Item} other {# Items}}",
        "enterTags": "Enter tags to add:",
        "selectTags": "Select tags to remove:",
        "suggestedTags": "Suggested tags:",
        "itemsToUpdate": "Items to be updated:",
        "andMore": "(and {count} more...)",
        "noTagsFound": "No tags found on selected items.",
        "inputPlaceholder": "Type a tag and press Enter...",
        "maxTags": "Max {count} tags",
        "addButton": "Add {count, plural, one {# Tag} other {# Tags}}",
        "removeButton": "Remove {count, plural, one {# Tag} other {# Tags}}",
        "removeTagLabel": "Remove {tag} tag"
      },
      "moveDialog": {
        "title": "Move {count, plural, one {# Item} other {# Items}} to Another Property",
        "destinationLabel": "Destination property",
        "selectPlaceholder": "Select destination property...",
        "noProperties": "No properties available",
        "noOtherProperties": "No other properties available",
        "itemsToMove": "Items to move:",
        "fromProperty": "from: {propertyName}",
        "moveButton": "Move {count, plural, one {# Item} other {# Items}}",
        "selectLabel": "Select destination property",
        "availableProperties": "Available properties"
      }
    }
  },
  "workflow": {
    "dialogs": {
      "confirmExit": {
        "title": "Exit Workflow?",
        "messageWithBoth": "You have unsaved changes and {count, plural, one {# item} other {# items}} in this session. Are you sure you want to exit?",
        "messageUnsaved": "You have unsaved changes. Are you sure you want to exit?",
        "messageWithItems": "You have created {count, plural, one {# item} other {# items}} in this session. Are you sure you want to exit?",
        "messageDefault": "Are you sure you want to exit the workflow?",
        "exitButton": "Exit Workflow"
      },
      "removeItem": {
        "title": "Remove Item?",
        "message": "Are you sure you want to remove \"{itemName}\"? This action cannot be undone.",
        "removeButton": "Remove"
      },
      "emptySession": {
        "title": "No Items Added",
        "message": "No items added yet. Add items or exit session?",
        "addButton": "Add Items",
        "exitButton": "Exit Session"
      },
      "pdfExport": {
        "title": "Export QR Codes as PDF",
        "itemCount": "{count, plural, one {# item} other {# items}}",
        "description": "Configure PDF export settings for your QR codes and download them as a printable PDF document.",
        "errorTitle": "PDF generation failed",
        "exportButton": "Export PDF",
        "generating": "Generating..."
      }
    }
  },
  "properties": {
    "modal": {
      "editTitle": "Edit Property",
      "editDescription": "Edit the details of your property including name and address information.",
      "addTitle": "Add New Property",
      "addDescription": "Create a new property by entering the name and address information.",
      "savingAnnouncement": "Saving property changes...",
      "creatingAnnouncement": "Creating property...",
      "errorAnnouncement": "Error: {message}",
      "saveButton": "Save Changes",
      "createButton": "Create Property",
      "saving": "Saving...",
      "creating": "Creating..."
    },
    "form": {
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
      "nameTooLong": "Property name must be {max} characters or less",
      "addressTooLong": "Address must be {max} characters or less",
      "cityTooLong": "City must be {max} characters or less",
      "stateTooLong": "State/Province must be {max} characters or less",
      "postalCodeTooLong": "Postal code must be {max} characters or less",
      "invalidCountry": "Please select a valid country"
    }
  },
  "media": {
    "delete": {
      "titleYoutube": "Delete YouTube Video?",
      "titlePdf": "Delete PDF Document?",
      "titleImage": "Delete Image?",
      "titleLink": "Delete Web Link?",
      "warning": "This action cannot be undone."
    }
  },
  "content": {
    "addModal": {
      "selectTitle": "Add Content",
      "createTitle": "Create Content",
      "writeText": "Write Text",
      "addLink": "Add Link",
      "uploadFile": "Upload File",
      "fileTypes": "Video, Image, PDF",
      "titleLabel": "Title (Optional)",
      "titlePlaceholder": "Enter a title for this content",
      "textLabel": "Text Content",
      "textPlaceholder": "Enter your text content here...",
      "charCount": "{count} / {max} characters",
      "urlLabel": "URL",
      "urlPlaceholder": "https://example.com",
      "linkTitleLabel": "Link Title (Optional)",
      "fileLabel": "Select File",
      "fileSelected": "Selected: {name} ({size} MB)",
      "backButton": "Back",
      "addButton": "Add Content"
    }
  }
}
```

### Keys to Reuse from `common` Namespace

The following keys from `common` namespace (REQ-304) should be reused:

- `common.actions.cancel`
- `common.actions.delete`
- `common.actions.save`
- `common.actions.close`
- `common.actions.confirm`
- `common.confirmation.deleteTitle`
- `common.confirmation.deleteMessage`
- `common.confirmation.irreversibleAction`
- `common.validation.required`

---

## 10. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Missing translation keys at runtime | Medium | High | Verify all keys exist before build; use fallback to English |
| ICU format syntax errors | Medium | High | Validate ICU syntax; test pluralization thoroughly |
| Breaking modal functionality | Low | High | Test each modal after changes; preserve all props/callbacks |
| Accessibility regressions | Low | Medium | Verify aria-labels are translated; test with screen reader |
| Performance impact from additional hook calls | Low | Low | next-intl is optimized; minimal overhead |
| Missing dynamic parameters | Medium | Medium | Verify all {param} placeholders have corresponding values |
| TypeScript errors from translation changes | Low | Low | Update type annotations as needed |

---

## 11. Estimated Effort

| Task | Estimate |
|------|----------|
| Task 2H.3.1: ConfirmationModal | 15 min |
| Task 2H.3.2: ConfirmDeleteDialog | 30 min |
| Task 2H.3.3: ConfirmExitDialog | 25 min |
| Task 2H.3.4: RemoveItemDialog | 20 min |
| Task 2H.3.5: EmptySessionDialog | 20 min |
| Task 2H.3.6: PDFExportDialog | 30 min |
| Task 2H.3.7: PropertyEditModal | 45 min |
| Task 2H.3.8: AddPropertyModal | 40 min |
| Task 2H.3.9: DeleteItemDialog | 25 min |
| Task 2H.3.10: BulkTagDialog | 35 min |
| Task 2H.3.11: BulkMoveDialog | 35 min |
| Task 2H.3.12: DeleteMediaConfirmDialog | 20 min |
| Task 2H.3.13: AssetRemoveConfirmDialog | 15 min |
| Task 2H.3.14: AddContentModal | 30 min |
| Task 2H.3.15: Update translation files | 30 min |
| Testing and verification | 45 min |
| **Total** | **~7.5 hours** |

---

## 12. Implementation Commands Summary

```bash
# Step 1: Verify prerequisites
npm list next-intl
cat messages/en.json | python3 -c "import json,sys; d=json.load(sys.stdin); print('common' in d)"

# Step 2: Backup existing en.json
cp messages/en.json messages/en.json.backup

# Step 3: For each component, follow this pattern:
# a) Add import: import { useTranslations } from 'next-intl';
# b) Add hook: const t = useTranslations('namespace');
# c) Replace strings: {t('key')} or {t('key', { param: value })}

# Step 4: Update translation file with new keys
# (Use Edit tool to add keys to messages/en.json)

# Step 5: Validate JSON
cat messages/en.json | python3 -m json.tool > /dev/null && echo "Valid JSON"

# Step 6: Build verification
npm run build

# Step 7: Manual testing
npm run dev
# Test each modal in browser
```

---

## 13. Next Steps After Implementation

After completing Task 2H.3 (this task):

1. **Task 2H.4:** Extract form element strings (labels, placeholders, hints)
2. **Task 2H.5:** Extract toast notification messages
3. **Task 2H.10:** Generate translations for all 5 non-English languages
4. **Update tests:** Ensure modal tests pass with mocked translations

---

## 14. References

- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)
- [PRD: L10N Epic 2 - Static UI Translation](/docs/prd/PRD_L10N_Epic2_Static_UI_Translation.md)
- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [REQ-304: Create Common Namespace Structure](/docs/REQ-304-create-common-namespace-structure-in-overview.md)

---

*Document generated for FAQBNB Localization Epic 2 - Static UI Translation, Sub-Epic 2H, Task 2H.3*
