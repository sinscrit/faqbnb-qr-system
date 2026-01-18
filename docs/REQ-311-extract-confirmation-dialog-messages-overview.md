# REQ-311: Extract Confirmation Dialog Messages for Internationalization

**Last Modified:** 2026-01-18 17:45:00 UTC
**Request Type:** ENHANCEMENT
**Size:** M (Medium)
**Sub-Epic:** 2H - Common & Shared Components
**Task ID:** 2H.8
**Status:** Ready for Implementation

---

## Summary

Extract all hardcoded confirmation dialog messages from React components and replace them with translation keys using next-intl's `useTranslations` hook. This enables all confirmation dialog text to be displayed in the user's preferred language.

---

## Context from Epic 2 Plan

This task is part of **Sub-Epic 2H: Common & Shared Components**, which must be completed first as it provides the foundation for all other sub-epics. Confirmation dialogs are critical user communication touchpoints that require clear, understandable text in the user's native language.

**Reference:** `/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md`

**Dependencies:**
- Epic 1 Foundation (next-intl setup, IntlProvider, translation files structure)
- Task 2H.1 (Create common namespace structure in `/messages/en.json`)

---

## Current Behavior

Confirmation dialogs throughout the application contain hardcoded English text:

1. **Dialog titles** - "Delete Item", "Exit Workflow?", "Remove Item?", "Remove Video?"
2. **Confirmation questions** - "Are you sure you want to delete...?", "Are you sure you want to remove...?"
3. **Warning messages** - "This action cannot be undone."
4. **Context-specific messages** - "You have unsaved changes and {n} items in this session."
5. **Button labels** - "Cancel", "Confirm", "Delete", "Remove", "Exit Workflow"
6. **Dynamic messages** - Messages with item counts, item names, type labels

These strings are embedded directly in component code, making it impossible to translate these critical user interactions into other languages.

---

## Expected Behavior

When users encounter confirmation dialogs:

1. All dialog text appears in their preferred language (en, fr, es, de, nl, it)
2. Dialog titles, confirmation prompts, warning messages, and button labels are all retrieved from translation keys
3. Dynamic content (item names, counts) is properly interpolated using ICU message format
4. Pluralization works correctly for messages like "Delete {count} items"
5. All confirmation dialog functionality (keyboard handling, focus trapping, backdrop click) remains unchanged

---

## Technical Approach

### Translation Key Structure

Add to `common.confirmation` namespace in `/messages/en.json`:

```json
{
  "common": {
    "confirmation": {
      "title": "Confirm Action",
      "deleteTitle": "Confirm Delete",
      "deleteItem": {
        "title": "Delete Item",
        "titlePlural": "Delete Items",
        "message": "Are you sure you want to delete this item? This action cannot be undone.",
        "messagePlural": "Are you sure you want to delete these {count} items? This action cannot be undone.",
        "messageWithName": "Are you sure you want to delete \"{name}\"? This action cannot be undone.",
        "confirmButton": "Delete",
        "confirmButtonPlural": "Delete {count} Items",
        "deleting": "Deleting..."
      },
      "removeItem": {
        "title": "Remove Item?",
        "message": "Are you sure you want to remove \"{name}\"? This action cannot be undone."
      },
      "removeAsset": {
        "title": "Remove {type}?",
        "types": {
          "video": "Video",
          "photo": "Photo",
          "pdf": "PDF",
          "asset": "Asset"
        }
      },
      "deleteMedia": {
        "title": "Delete {type}?",
        "types": {
          "youtube": "YouTube Video",
          "pdf": "PDF Document",
          "image": "Image",
          "link": "Web Link"
        }
      },
      "exitWorkflow": {
        "title": "Exit Workflow?",
        "messageWithUnsavedAndItems": "You have unsaved changes and {count} {count, plural, one {item} other {items}} in this session. Are you sure you want to exit?",
        "messageWithUnsaved": "You have unsaved changes. Are you sure you want to exit?",
        "messageWithItems": "You have created {count} {count, plural, one {item} other {items}} in this session. Are you sure you want to exit?",
        "messageDefault": "Are you sure you want to exit the workflow?",
        "confirmButton": "Exit Workflow",
        "cancelButton": "Cancel"
      },
      "emptySession": {
        "title": "No Items Added",
        "message": "No items added yet. Add items or exit session?",
        "addItems": "Add Items",
        "exitSession": "Exit Session"
      },
      "warning": {
        "cannotBeUndone": "This action cannot be undone.",
        "willAlsoDelete": "This will also delete:",
        "resourceLinks": "{count} resource {count, plural, one {link} other {links}}",
        "mediaFiles": "{count} media {count, plural, one {file} other {files}} from storage"
      },
      "overflow": {
        "andMore": "and {count} more"
      },
      "buttons": {
        "confirm": "Confirm",
        "cancel": "Cancel",
        "delete": "Delete",
        "remove": "Remove",
        "yes": "Yes",
        "no": "No"
      }
    }
  }
}
```

### Component Update Pattern

```tsx
// Before
<h3>Delete Item</h3>
<p>Are you sure you want to delete this item? This action cannot be undone.</p>

// After
import { useTranslations } from 'next-intl';

function ConfirmDeleteDialog({ items, ... }) {
  const t = useTranslations('common.confirmation');
  const itemCount = items.length;

  return (
    <>
      <h3>{itemCount === 1 ? t('deleteItem.title') : t('deleteItem.titlePlural')}</h3>
      <p>
        {itemCount === 1
          ? t('deleteItem.message')
          : t('deleteItem.messagePlural', { count: itemCount })
        }
      </p>
    </>
  );
}
```

---

## Authorized Files and Functions for Modification

### Primary Files to Modify (Confirmation Dialog Components)

| File Path | Estimated Strings | Priority |
|-----------|------------------|----------|
| `/src/components/ConfirmationModal.tsx` | 2 | High |
| `/src/components/ItemCreationWorkflow/components/shared/ConfirmExitDialog.tsx` | 8 | High |
| `/src/components/ItemManager/components/dialogs/ConfirmDeleteDialog.tsx` | 12 | High |
| `/src/components/MediaManagement/DeleteMediaConfirmDialog.tsx` | 8 | High |
| `/src/components/ItemManager/components/AssetPanel/AssetRemoveConfirmDialog.tsx` | 10 | High |
| `/src/components/ItemCreationWorkflow/components/shared/RemoveItemDialog.tsx` | 6 | High |
| `/src/components/dashboard/DeleteItemDialog.tsx` | 12 | High |
| `/src/components/ItemCreationWorkflow/components/shared/EmptySessionDialog.tsx` | 6 | Medium |

### Functions to Modify

| Component | Functions/Sections | Changes Required |
|-----------|-------------------|------------------|
| `ConfirmationModal.tsx` | Default export function | Add `useTranslations`, replace default `confirmText`/`cancelText` |
| `ConfirmExitDialog.tsx` | `getExitMessage()`, main render | Add `useTranslations`, extract 4 message variants |
| `ConfirmDeleteDialog.tsx` | `getDeleteTitle()`, `getDeleteMessage()`, `getConfirmButtonText()`, render | Add `useTranslations`, extract title/message/button patterns |
| `DeleteMediaConfirmDialog.tsx` | `getTypeLabel()`, main render | Add `useTranslations`, extract type labels and messages |
| `AssetRemoveConfirmDialog.tsx` | `getTypeLabel()`, main render | Add `useTranslations`, extract type labels and messages |
| `RemoveItemDialog.tsx` | Main render | Add `useTranslations`, extract title/message/buttons |
| `DeleteItemDialog.tsx` | Main render, warning section | Add `useTranslations`, extract all strings including warning list |
| `EmptySessionDialog.tsx` | Main render | Add `useTranslations`, extract title/message/buttons |

### Translation Files to Update

| File Path | Action |
|-----------|--------|
| `/messages/en.json` | Add `common.confirmation` namespace with ~60 keys |
| `/messages/fr.json` | Generate French translations |
| `/messages/es.json` | Generate Spanish translations |
| `/messages/de.json` | Generate German translations |
| `/messages/nl.json` | Generate Dutch translations |
| `/messages/it.json` | Generate Italian translations |

---

## Implementation Tasks

### Task 1: Create Translation Keys
**Files:** `/messages/en.json`
**Action:** Add `common.confirmation` namespace with all identified strings

### Task 2: Update ConfirmationModal.tsx
**File:** `/src/components/ConfirmationModal.tsx`
**Strings to extract:**
- Default `confirmText` = "Confirm"
- Default `cancelText` = "Cancel"

**Note:** This component receives text via props, but defaults should be translated.

### Task 3: Update ConfirmExitDialog.tsx
**File:** `/src/components/ItemCreationWorkflow/components/shared/ConfirmExitDialog.tsx`
**Strings to extract:**
- Title: "Exit Workflow?"
- 4 message variants from `getExitMessage()` function
- Button: "Cancel"
- Button: "Exit Workflow"

### Task 4: Update ConfirmDeleteDialog.tsx
**File:** `/src/components/ItemManager/components/dialogs/ConfirmDeleteDialog.tsx`
**Strings to extract:**
- Titles: "Delete Item" / "Delete Items"
- Messages with singular/plural and name interpolation
- Button text: "Cancel", "Delete", "Delete {count} Items", "Deleting..."
- Overflow text: "and {count} more"

### Task 5: Update DeleteMediaConfirmDialog.tsx
**File:** `/src/components/MediaManagement/DeleteMediaConfirmDialog.tsx`
**Strings to extract:**
- Title: "Delete {type}?"
- Type labels: "YouTube Video", "PDF Document", "Image", "Web Link"
- Warning: "This action cannot be undone."
- Buttons: "Cancel", "Delete"

### Task 6: Update AssetRemoveConfirmDialog.tsx
**File:** `/src/components/ItemManager/components/AssetPanel/AssetRemoveConfirmDialog.tsx`
**Strings to extract:**
- Title: "Remove {type}?"
- Type labels: "Video", "Photo", "PDF", "Asset"
- Duration label: "Duration: {duration}"
- Page count: "{count} page(s)"
- Warning: "This action cannot be undone."
- Buttons: "Cancel", "Remove"

### Task 7: Update RemoveItemDialog.tsx
**File:** `/src/components/ItemCreationWorkflow/components/shared/RemoveItemDialog.tsx`
**Strings to extract:**
- Title: "Remove Item?"
- Message: 'Are you sure you want to remove "{name}"? This action cannot be undone.'
- Buttons: "Cancel", "Remove"

### Task 8: Update DeleteItemDialog.tsx
**File:** `/src/components/dashboard/DeleteItemDialog.tsx`
**Strings to extract:**
- Title: "Delete Item"
- Message with item name interpolation
- Warning: "This action cannot be undone."
- Associated content warning: "This will also delete:"
- Resource links: "{count} resource link(s)"
- Media files: "{count} media file(s) from storage"
- Buttons: "Cancel", "Delete Item", "Deleting..."

### Task 9: Update EmptySessionDialog.tsx
**File:** `/src/components/ItemCreationWorkflow/components/shared/EmptySessionDialog.tsx`
**Strings to extract:**
- Title: "No Items Added"
- Message: "No items added yet. Add items or exit session?"
- Buttons: "Add Items", "Exit Session"

### Task 10: Generate Translations
**Action:** Use AI translation to generate equivalent strings for fr, es, de, nl, it

### Task 11: Verify and Test
**Action:** Test all confirmation dialogs in each language, verify pluralization and interpolation

---

## Acceptance Criteria

- [ ] All confirmation dialog instances have been identified and their text content catalogued
- [ ] Confirmation dialog titles are extracted to translation keys and replaced with `t()` calls
- [ ] Confirmation question prompts and body text use translation keys instead of hardcoded strings
- [ ] Warning messages about action consequences are internationalized
- [ ] Explanatory text describing what will happen after confirmation uses translation keys
- [ ] Common confirmation patterns share consistent translation keys across different features
- [ ] Translation files include organized sections for confirmation messages with clear naming by action type
- [ ] Confirmation messages for destructive actions maintain appropriate gravity and clarity in tone
- [ ] Confirmation messages can accept dynamic parameters when referencing specific items or counts
- [ ] All confirmation dialog functionality including button behavior and modal behavior remains unchanged
- [ ] Confirmation dialog accessibility attributes (aria-labelledby, aria-describedby) are properly maintained
- [ ] Both confirm and cancel button labels are internationalized consistently across all dialogs
- [ ] Pluralization works correctly using ICU message format
- [ ] All 6 language files contain equivalent keys with no missing translations

---

## Testing Checklist

- [ ] Test `ConfirmationModal` with default and custom text props
- [ ] Test `ConfirmExitDialog` with 0 items, 1 item, multiple items, unsaved changes combinations
- [ ] Test `ConfirmDeleteDialog` with single item and bulk delete scenarios
- [ ] Test `DeleteMediaConfirmDialog` with each media type (YouTube, PDF, Image, Link)
- [ ] Test `AssetRemoveConfirmDialog` with video, image, and PDF assets
- [ ] Test `RemoveItemDialog` with short and long item names
- [ ] Test `DeleteItemDialog` with and without associated content warnings
- [ ] Test `EmptySessionDialog` renders correct action buttons
- [ ] Verify keyboard navigation (Escape to dismiss) still works
- [ ] Verify click-outside-to-dismiss still works
- [ ] Verify focus trapping still works in accessible dialogs
- [ ] Switch language and verify all text updates correctly
- [ ] Test pluralization with 0, 1, 2, and 5+ items

---

## Estimated Effort

| Task | Complexity | Estimate |
|------|------------|----------|
| Create translation keys | Low | 30 min |
| Update 8 dialog components | Medium | 3-4 hours |
| Generate translations (5 languages) | Low | 30 min |
| Testing across all languages | Medium | 1-2 hours |
| **Total** | | **5-7 hours** |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking dialog functionality | Low | High | Thorough testing after each component update |
| Missing string edge cases | Medium | Low | Review helper functions like `getExitMessage()` carefully |
| Inconsistent button labels | Medium | Medium | Use shared `common.confirmation.buttons` namespace |
| Pluralization errors | Low | Medium | Test with 0, 1, 2, and many items |

---

## Dependencies

- **Epic 1 Foundation:** `next-intl` package installed and configured
- **Task 2H.1:** Common namespace structure created in `/messages/en.json`
- **IntlProvider:** Must be wrapping the application in layout

---

## References

- [REQ-311 Request](/docs/gen_requests_epic2.md#req-311)
- [Epic 2 Implementation Plan](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)
