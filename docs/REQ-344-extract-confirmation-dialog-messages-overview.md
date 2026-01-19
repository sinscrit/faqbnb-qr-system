# REQ-344: Extract Confirmation Dialog Messages for Internationalization - Technical Overview

**Document Created:** 2026-01-19 19:15:00 UTC
**Last Modified:** 2026-01-19 19:15:00 UTC
**Request Reference:** gen_requests_epic2.md - Request #344
**Implementation Plan Reference:** Plan-111-L10N-Epic2-Static-UI-Translation.md
**Sub-Epic:** 2H - Common & Shared Components
**Task ID:** 2H.8
**Size:** M (Medium)
**Priority:** High (Part of Epic 2 Foundation)

---

## 1. Summary

Extract all hardcoded confirmation dialog messages across the application to translation files, enabling users to see confirmation prompts (delete confirmations, save prompts, exit warnings, logout confirmations, approval requests) in their preferred language. Confirmation dialogs appear at critical decision points and require clear, unambiguous messaging.

---

## 2. Background & Context

### 2.1 Current State

The application has multiple confirmation dialog components with varying patterns:

1. **Generic ConfirmationModal** (`/src/components/ConfirmationModal.tsx`)
   - Fully prop-driven (title, message, confirmText, cancelText)
   - Default values: `confirmText = 'Confirm'`, `cancelText = 'Cancel'`
   - Used for general-purpose confirmations

2. **ConfirmDeleteDialog** (`/src/components/ItemManager/components/dialogs/ConfirmDeleteDialog.tsx`)
   - Has hardcoded helper functions with default messages:
     - `getDeleteTitle()`: "Delete Item" / "Delete Items"
     - `getDeleteMessage()`: "Are you sure you want to delete this item? This action cannot be undone."
     - `getConfirmButtonText()`: "Delete" / "Delete X Items"
   - Shows "Cancel" button and "and X more" overflow text

3. **ConfirmExitDialog** (`/src/components/ItemCreationWorkflow/components/shared/ConfirmExitDialog.tsx`)
   - Has hardcoded helper function `getExitMessage()` with multiple scenarios:
     - "You have unsaved changes and X items in this session..."
     - "You have unsaved changes. Are you sure you want to exit?"
     - "You have created X items in this session..."
     - "Are you sure you want to exit the workflow?"
   - Title: "Exit Workflow?"
   - Buttons: "Cancel" and "Exit Workflow"

4. **RemoveItemDialog** (`/src/components/ItemCreationWorkflow/components/shared/RemoveItemDialog.tsx`)
   - Title: "Remove Item?"
   - Message: "Are you sure you want to remove [itemName]? This action cannot be undone."
   - Buttons: "Cancel" and "Remove"

5. **EmptySessionDialog** (`/src/components/ItemCreationWorkflow/components/shared/EmptySessionDialog.tsx`)
   - Title: "No Items Added"
   - Message: "No items added yet. Add items or exit session?"
   - Buttons: "Add Items" and "Exit Session"

6. **DeleteItemDialog** (`/src/components/dashboard/DeleteItemDialog.tsx`)
   - Title: "Delete Item"
   - Message: "Are you sure you want to delete [item.name]? This action cannot be undone."
   - Warning: "This will also delete: X resource links, X media files from storage"
   - Buttons: "Cancel" and "Delete Item" / "Deleting..."

7. **DeleteMediaConfirmDialog** (`/src/components/MediaManagement/DeleteMediaConfirmDialog.tsx`)
   - Dynamic title: "Delete [YouTube Video/PDF Document/Image/Web Link]?"
   - Message: "This action cannot be undone."
   - Buttons: "Cancel" and "Delete"

8. **AssetRemoveConfirmDialog** (`/src/components/ItemManager/components/AssetPanel/AssetRemoveConfirmDialog.tsx`)
   - Dynamic title: "Remove [Video/Photo/PDF]?"
   - Message: "This action cannot be undone."
   - Metadata labels: "Duration:", "[X] pages"
   - Buttons: "Cancel" and "Remove"

9. **LogoutButton ConfirmationModal** (`/src/components/LogoutButton.tsx`)
   - **Already translated** using `useTranslations('auth')`:
     - Title: `t('confirmLogout')`
     - Message: `t('confirmSignOutMessage')`
   - Uses `tCommon('cancel')` and `t('signOut')`

### 2.2 Hardcoded Strings Identified

| Component | Hardcoded String | Location |
|-----------|------------------|----------|
| ConfirmationModal | "Confirm", "Cancel" | Lines 19-20 (defaults) |
| ConfirmDeleteDialog | "Delete Item", "Delete Items" | Lines 61-62 |
| ConfirmDeleteDialog | "Are you sure you want to delete this item?..." | Lines 72-75 |
| ConfirmDeleteDialog | "Delete", "Delete X Items" | Lines 84-88 |
| ConfirmDeleteDialog | "Cancel", "Deleting..." | Lines 251-252, 272 |
| ConfirmDeleteDialog | "and X more" | Line 230 |
| ConfirmExitDialog | "Exit Workflow?" | Line 155 |
| ConfirmExitDialog | "You have unsaved changes..." (multiple variations) | Lines 67-76 |
| ConfirmExitDialog | "Cancel", "Exit Workflow" | Lines 181, 196 |
| RemoveItemDialog | "Remove Item?" | Line 123 |
| RemoveItemDialog | "Are you sure you want to remove [name]?..." | Line 129 |
| RemoveItemDialog | "Cancel", "Remove" | Lines 150, 167 |
| EmptySessionDialog | "No Items Added" | Line 150 |
| EmptySessionDialog | "No items added yet..." | Line 158 |
| EmptySessionDialog | "Add Items", "Exit Session" | Lines 179, 198 |
| DeleteItemDialog | "Delete Item" | Line 72 |
| DeleteItemDialog | "Are you sure you want to delete [name]?..." | Lines 77-79 |
| DeleteItemDialog | "This will also delete:", "X resource links", "X media files from storage" | Lines 91-104 |
| DeleteItemDialog | "Cancel", "Delete Item", "Deleting..." | Lines 129, 150-151 |
| DeleteMediaConfirmDialog | "Delete [Type]?" | Line 104 |
| DeleteMediaConfirmDialog | "This action cannot be undone." | Line 122 |
| DeleteMediaConfirmDialog | "Cancel", "Delete" | Lines 136, 154 |
| DeleteMediaConfirmDialog | "YouTube Video", "PDF Document", "Image", "Web Link" | Lines 44-55 |
| AssetRemoveConfirmDialog | "Remove [Type]?" | Line 261 |
| AssetRemoveConfirmDialog | "This action cannot be undone." | Line 348 |
| AssetRemoveConfirmDialog | "Cancel", "Remove" | Lines 363, 384 |
| AssetRemoveConfirmDialog | "Video", "Photo", "PDF", "Asset" | Lines 118-126 |
| AssetRemoveConfirmDialog | "Duration:", "[X] pages" | Lines 327, 333 |

### 2.3 Existing i18n Foundation

The project already has next-intl configured with:
- **Translation files:** `/messages/{en,fr,es,de,nl,it}.json`
- **Logout confirmation already translated:** `auth.confirmLogout`, `auth.confirmSignOutMessage`
- **Common action buttons:** `common.cancel`, `common.confirm`, `common.yes`, `common.no`
- **i18n config:** `/src/lib/i18n/config.ts` with 6 supported locales

---

## 3. Requirements

### 3.1 Functional Requirements

1. All confirmation dialog messages display in the user's selected language
2. Confirmation scenarios covered:
   - Delete confirmations (items, media, assets)
   - Unsaved changes warnings
   - Exit/cancel workflow confirmations
   - Remove item from session confirmations
   - Empty session prompts
3. Maintain appropriate urgency and clarity level in all languages
4. Dynamic content (item names, counts) uses proper interpolation
5. Props for custom confirmation messages continue to work

### 3.2 Non-Functional Requirements

1. No performance regression from translation lookups
2. Consistent key naming following `common.confirmation.[context].[element]` pattern
3. All 6 language files updated with identical key structures
4. Pluralization handled correctly (1 item vs X items)

---

## 4. Technical Approach

### 4.1 Translation Key Structure

Add/expand `common.confirmation` namespace in translation files:

```json
{
  "common": {
    "actions": {
      "confirm": "Confirm",
      "cancel": "Cancel",
      "yes": "Yes",
      "no": "No",
      "proceed": "Proceed",
      "remove": "Remove",
      "delete": "Delete",
      "exit": "Exit",
      "stay": "Stay",
      "addItems": "Add Items",
      "exitSession": "Exit Session",
      "exitWorkflow": "Exit Workflow"
    },
    "confirmation": {
      "generic": {
        "title": "Confirm Action",
        "areYouSure": "Are you sure?",
        "cannotUndo": "This action cannot be undone."
      },
      "delete": {
        "title": "Delete Item",
        "titlePlural": "Delete Items",
        "singleItem": "Are you sure you want to delete this item? This action cannot be undone.",
        "multipleItems": "Are you sure you want to delete these {count} items? This action cannot be undone.",
        "buttonSingle": "Delete",
        "buttonMultiple": "Delete {count} Items",
        "deleting": "Deleting...",
        "andMore": "and {count} more"
      },
      "deleteItem": {
        "title": "Delete Item",
        "message": "Are you sure you want to delete \"{name}\"? This action cannot be undone.",
        "cascadeWarning": "This will also delete:",
        "resourceLinks": "{count, plural, one {# resource link} other {# resource links}}",
        "mediaFiles": "{count, plural, one {# media file} other {# media files}} from storage"
      },
      "remove": {
        "item": {
          "title": "Remove Item?",
          "message": "Are you sure you want to remove \"{name}\"? This action cannot be undone."
        },
        "asset": {
          "title": "Remove {type}?",
          "types": {
            "video": "Video",
            "photo": "Photo",
            "pdf": "PDF",
            "asset": "Asset"
          }
        }
      },
      "deleteMedia": {
        "title": "Delete {type}?",
        "types": {
          "youtube": "YouTube Video",
          "pdf": "PDF Document",
          "image": "Image",
          "text": "Web Link"
        }
      },
      "exit": {
        "workflow": {
          "title": "Exit Workflow?",
          "unsavedWithItems": "You have unsaved changes and {count} {count, plural, one {item} other {items}} in this session. Are you sure you want to exit?",
          "unsaved": "You have unsaved changes. Are you sure you want to exit?",
          "withItems": "You have created {count} {count, plural, one {item} other {items}} in this session. Are you sure you want to exit?",
          "default": "Are you sure you want to exit the workflow?"
        }
      },
      "emptySession": {
        "title": "No Items Added",
        "message": "No items added yet. Add items or exit session?"
      },
      "metadata": {
        "duration": "Duration: {duration}",
        "pages": "{count, plural, one {# page} other {# pages}}"
      }
    }
  }
}
```

### 4.2 Component Update Patterns

**For ConfirmDeleteDialog helper functions:**
```typescript
// Before
export function getDeleteTitle(count: number, customTitle?: string): string {
  if (customTitle) return customTitle;
  return count === 1 ? 'Delete Item' : 'Delete Items';
}

// After - Move to component with hook access
function ConfirmDeleteDialog({ ... }: ConfirmDeleteDialogProps) {
  const t = useTranslations('common.confirmation.delete');

  const getDeleteTitle = (count: number, customTitle?: string): string => {
    if (customTitle) return customTitle;
    return count === 1 ? t('title') : t('titlePlural');
  };
  // ...
}
```

**For ConfirmExitDialog dynamic messages:**
```typescript
// Before
function getExitMessage(itemCount: number, hasUnsavedChanges: boolean): string {
  if (hasUnsavedChanges && itemCount > 0) {
    return `You have unsaved changes and ${itemCount} item${itemCount !== 1 ? 's' : ''} in this session...`;
  }
  // ...
}

// After
const t = useTranslations('common.confirmation.exit.workflow');

function getExitMessage(itemCount: number, hasUnsavedChanges: boolean): string {
  if (hasUnsavedChanges && itemCount > 0) {
    return t('unsavedWithItems', { count: itemCount });
  }
  if (hasUnsavedChanges) {
    return t('unsaved');
  }
  if (itemCount > 0) {
    return t('withItems', { count: itemCount });
  }
  return t('default');
}
```

**For components with type labels (DeleteMediaConfirmDialog, AssetRemoveConfirmDialog):**
```typescript
// Before
function getTypeLabel(linkType: string): string {
  switch (linkType) {
    case 'youtube': return 'YouTube Video';
    // ...
  }
}

// After
const t = useTranslations('common.confirmation.deleteMedia');

function getTypeLabel(linkType: string): string {
  return t(`types.${linkType}`);
}

// Title
<h3>{t('title', { type: getTypeLabel(link.linkType) })}</h3>
```

### 4.3 Handling Pluralization

Use ICU message format for proper pluralization:

```json
{
  "resourceLinks": "{count, plural, one {# resource link} other {# resource links}}"
}
```

```typescript
t('resourceLinks', { count: linksCount })
// Output: "1 resource link" or "5 resource links"
```

---

## 5. Implementation Tasks

### Task 1: Create Confirmation Translation Namespace
- Add/expand `common.confirmation` structure to `/messages/en.json`
- Define all keys following the structure in Section 4.1
- Include pluralization and interpolation patterns
- **Estimated effort:** 30 minutes

### Task 2: Update ConfirmationModal Component
- File: `/src/components/ConfirmationModal.tsx`
- Add `useTranslations` hook
- Replace default prop values with translation calls
- Maintain backward compatibility with prop overrides
- **Estimated effort:** 15 minutes

### Task 3: Update ConfirmDeleteDialog Component
- File: `/src/components/ItemManager/components/dialogs/ConfirmDeleteDialog.tsx`
- Move helper functions inside component to access translations
- Update `getDeleteTitle()`, `getDeleteMessage()`, `getConfirmButtonText()`
- Update "Cancel", "Deleting...", "and X more" text
- **Estimated effort:** 30 minutes

### Task 4: Update ConfirmExitDialog Component
- File: `/src/components/ItemCreationWorkflow/components/shared/ConfirmExitDialog.tsx`
- Add `useTranslations` hook
- Update `getExitMessage()` helper function with ICU pluralization
- Update title "Exit Workflow?" and button labels
- **Estimated effort:** 25 minutes

### Task 5: Update RemoveItemDialog Component
- File: `/src/components/ItemCreationWorkflow/components/shared/RemoveItemDialog.tsx`
- Add `useTranslations` hook
- Update title, message (with name interpolation), and button labels
- **Estimated effort:** 15 minutes

### Task 6: Update EmptySessionDialog Component
- File: `/src/components/ItemCreationWorkflow/components/shared/EmptySessionDialog.tsx`
- Add `useTranslations` hook
- Update title, message, and button labels
- **Estimated effort:** 15 minutes

### Task 7: Update DeleteItemDialog Component
- File: `/src/components/dashboard/DeleteItemDialog.tsx`
- Add `useTranslations` hook
- Update title, message (with name interpolation), cascade warning, and button labels
- Handle pluralization for resource links and media files count
- **Estimated effort:** 25 minutes

### Task 8: Update DeleteMediaConfirmDialog Component
- File: `/src/components/MediaManagement/DeleteMediaConfirmDialog.tsx`
- Add `useTranslations` hook
- Update `getTypeLabel()` helper function to use translations
- Update dynamic title (with type interpolation), warning message, and button labels
- **Estimated effort:** 20 minutes

### Task 9: Update AssetRemoveConfirmDialog Component
- File: `/src/components/ItemManager/components/AssetPanel/AssetRemoveConfirmDialog.tsx`
- Add `useTranslations` hook
- Update `getTypeLabel()` helper function to use translations
- Update dynamic title (with type interpolation), warning message, metadata labels, and button labels
- Handle pluralization for page count
- **Estimated effort:** 25 minutes

### Task 10: Update Common Actions Keys
- Ensure `common.actions.cancel`, `common.actions.confirm`, etc. exist in en.json
- Add any missing action button labels
- **Estimated effort:** 10 minutes

### Task 11: Propagate Translations to Other Languages
- Update `/messages/fr.json`, `/messages/es.json`, `/messages/de.json`, `/messages/nl.json`, `/messages/it.json`
- Use AI translation for initial draft
- Ensure proper pluralization rules for each language
- **Estimated effort:** 45 minutes

### Task 12: Testing and Verification
- Verify all confirmation dialogs display correctly in each language
- Test language switching updates confirmation messages
- Verify prop overrides still work (backward compatibility)
- Test pluralization scenarios (1 item, multiple items)
- Test interpolation with dynamic content (item names)
- **Estimated effort:** 30 minutes

---

## 6. Authorized Files and Functions for Modification

### 6.1 Translation Files

| File Path | Modification Type |
|-----------|-------------------|
| `/messages/en.json` | Add/expand `common.confirmation` namespace |
| `/messages/fr.json` | Add/expand `common.confirmation` namespace |
| `/messages/es.json` | Add/expand `common.confirmation` namespace |
| `/messages/de.json` | Add/expand `common.confirmation` namespace |
| `/messages/nl.json` | Add/expand `common.confirmation` namespace |
| `/messages/it.json` | Add/expand `common.confirmation` namespace |

### 6.2 Component Files

| File Path | Functions/Areas to Modify |
|-----------|---------------------------|
| `/src/components/ConfirmationModal.tsx` | Default prop values for `confirmText`, `cancelText` |
| `/src/components/ItemManager/components/dialogs/ConfirmDeleteDialog.tsx` | `getDeleteTitle()`, `getDeleteMessage()`, `getConfirmButtonText()`, button labels, "and X more" text |
| `/src/components/ItemCreationWorkflow/components/shared/ConfirmExitDialog.tsx` | `getExitMessage()` helper, title, button labels |
| `/src/components/ItemCreationWorkflow/components/shared/RemoveItemDialog.tsx` | Title, message JSX, button labels |
| `/src/components/ItemCreationWorkflow/components/shared/EmptySessionDialog.tsx` | Title, description, button labels |
| `/src/components/dashboard/DeleteItemDialog.tsx` | Title, message JSX, cascade warning section, button labels |
| `/src/components/MediaManagement/DeleteMediaConfirmDialog.tsx` | `getTypeLabel()` helper, title, warning message, button labels |
| `/src/components/ItemManager/components/AssetPanel/AssetRemoveConfirmDialog.tsx` | `getTypeLabel()` helper, title, warning message, metadata labels, button labels |

---

## 7. Dependencies

### 7.1 Prerequisites
- Epic 1 i18n foundation must be complete (next-intl installed and configured)
- Translation files must exist for all 6 locales

### 7.2 Related Tasks
- **Task 2H.1:** Create `common` namespace structure (should be complete first)
- **Task 2H.3:** Extract modal/dialog strings (related, can share patterns)
- **Task 2H.10:** Generate translations for all 5 non-English languages

### 7.3 Already Completed
- **LogoutButton confirmation:** Already uses `t('confirmLogout')` and `t('confirmSignOutMessage')` from auth namespace

### 7.4 Blocking Issues
- None identified - this task can proceed independently

---

## 8. Acceptance Criteria

- [ ] All components with confirmation dialogs are identified including delete confirmations, unsaved changes warnings, logout prompts, cancellation dialogs, and approval requests
- [ ] Generic confirmation actions are extracted to translation keys in the common namespace following the pattern "common.confirmation.[context].[element]"
- [ ] Generic button labels use keys like "common.actions.yes", "common.actions.no", "common.actions.cancel", "common.actions.proceed", "common.actions.confirm"
- [ ] Context-specific confirmations use dedicated keys like "common.confirmation.delete", "common.confirmation.exit.workflow", "common.confirmation.remove.item"
- [ ] Dialog titles use translation keys like "common.confirmation.delete.title", "common.confirmation.exit.workflow.title"
- [ ] Pluralization patterns use ICU format for item counts (e.g., "{count, plural, one {# item} other {# items}}")
- [ ] Dynamic content (item names, types) uses proper interpolation (e.g., "\"{name}\"", "{type}")
- [ ] All extracted strings are added to en.json with complete English translations
- [ ] All extracted strings are propagated to other language files (de.json, es.json, fr.json, it.json, nl.json)
- [ ] Components correctly display translated confirmation dialogs when language is switched
- [ ] Confirmation messages maintain appropriate tone and urgency level in all languages
- [ ] Props for custom confirmation messages continue to work (backward compatibility)

---

## 9. Testing Strategy

### 9.1 Unit Tests
- Verify confirmation dialog components use translations by default
- Verify prop overrides take precedence over translations
- Mock useTranslations hook in component tests
- Test pluralization logic (1 vs multiple items)

### 9.2 Integration Tests
- Verify confirmation dialogs render correctly in each supported locale
- Verify dynamic interpolation (item names, counts, types) works correctly
- Test cascade warning messages with various link/media counts

### 9.3 Manual Verification
- Switch language and verify all confirmation dialogs update
- Test each confirmation scenario:
  - Delete single item
  - Delete multiple items (bulk delete)
  - Exit workflow with unsaved changes
  - Exit workflow with created items
  - Remove item from session
  - Empty session prompt
  - Delete media links (each type)
  - Remove assets (each type)
  - Logout confirmation

---

## 10. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Missing confirmation dialog locations | Low | Medium | Thorough grep search for "confirm", "Confirm", dialog patterns |
| Broken prop overrides after changes | Low | High | Add tests for backward compatibility |
| Pluralization errors in other languages | Medium | Medium | Test with various counts (0, 1, 2, 5, 21) |
| ICU syntax errors in translations | Low | High | Validate JSON structure and ICU patterns |
| Performance from multiple useTranslations calls | Low | Low | next-intl optimizes repeated calls |

---

## 11. Estimated Effort

**Total: ~4.5 hours**

| Phase | Time |
|-------|------|
| Translation key structure setup | 30 min |
| Component updates (8 components) | 2.75 hours |
| Translation propagation to 5 languages | 45 min |
| Testing and verification | 30 min |

---

## 12. References

- [Plan-111-L10N-Epic2-Static-UI-Translation.md](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md) - Section "Sub-Epic 2H: Common & Shared Components", Task 2H.8
- [gen_requests_epic2.md](/docs/gen_requests_epic2.md) - Request #344
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)
- [Epic 1 Foundation](/docs/prd/Plan-110-L10N-Epic1-Foundation.md)
