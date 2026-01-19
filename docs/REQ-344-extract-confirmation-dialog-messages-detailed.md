# REQ-344: Extract Confirmation Dialog Messages - Detailed Task Breakdown

**Document Created:** 2026-01-19 20:30:00 UTC
**Last Modified:** 2026-01-19 20:30:00 UTC
**Request Reference:** docs/gen_requests_epic2.md - Request #344
**Overview Document:** docs/REQ-344-extract-confirmation-dialog-messages-overview.md
**Implementation Plan Reference:** docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md
**Sub-Epic:** 2H - Common & Shared Components
**Task ID:** 2H.8
**Size:** M (Medium)
**Priority:** High (Part of Epic 2 Foundation)

---

## Executive Summary

This document provides granular, actionable tasks for extracting all hardcoded confirmation dialog messages across the application to translation files. The work encompasses 8 confirmation dialog components with approximately 60+ hardcoded strings, enabling users to see confirmation prompts in their preferred language.

---

## Task Index

| Task # | Title | Story Points | Status |
|--------|-------|--------------|--------|
| 1 | Add confirmation namespace to en.json | 1 | Pending |
| 2 | Add common action button keys to en.json | 1 | Pending |
| 3 | Update ConfirmationModal component | 1 | Pending |
| 4 | Update ConfirmDeleteDialog component | 2 | Pending |
| 5 | Update ConfirmExitDialog component | 2 | Pending |
| 6 | Update RemoveItemDialog component | 1 | Pending |
| 7 | Update EmptySessionDialog component | 1 | Pending |
| 8 | Update DeleteItemDialog component | 2 | Pending |
| 9 | Update DeleteMediaConfirmDialog component | 1 | Pending |
| 10 | Update AssetRemoveConfirmDialog component | 2 | Pending |
| 11 | Propagate translations to 5 non-English languages | 2 | Pending |
| 12 | Manual verification and testing | 1 | Pending |

**Total Story Points:** 17

---

## Task 1: Add Confirmation Namespace to en.json

**Story Points:** 1
**Priority:** Critical (Blocks all other tasks)

### Objective
Add the `common.confirmation` namespace structure to the English translation file with all confirmation dialog strings.

### File to Modify
- `/messages/en.json`

### Implementation Steps

1. Open `/messages/en.json`

2. Locate the `common` object (exists at root level)

3. Add the following `confirmation` nested object inside `common`:

```json
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
    "mediaFiles": "{count, plural, one {# media file} other {# media files}} from storage",
    "button": "Delete Item"
  },
  "remove": {
    "item": {
      "title": "Remove Item?",
      "message": "Are you sure you want to remove \"{name}\"? This action cannot be undone.",
      "button": "Remove"
    },
    "asset": {
      "title": "Remove {type}?",
      "types": {
        "video": "Video",
        "photo": "Photo",
        "pdf": "PDF",
        "asset": "Asset"
      },
      "button": "Remove"
    }
  },
  "deleteMedia": {
    "title": "Delete {type}?",
    "types": {
      "youtube": "YouTube Video",
      "pdf": "PDF Document",
      "image": "Image",
      "text": "Web Link"
    },
    "button": "Delete"
  },
  "exit": {
    "workflow": {
      "title": "Exit Workflow?",
      "unsavedWithItems": "You have unsaved changes and {count} {count, plural, one {item} other {items}} in this session. Are you sure you want to exit?",
      "unsaved": "You have unsaved changes. Are you sure you want to exit?",
      "withItems": "You have created {count} {count, plural, one {item} other {items}} in this session. Are you sure you want to exit?",
      "default": "Are you sure you want to exit the workflow?",
      "button": "Exit Workflow"
    }
  },
  "emptySession": {
    "title": "No Items Added",
    "message": "No items added yet. Add items or exit session?",
    "addItems": "Add Items",
    "exitSession": "Exit Session"
  },
  "metadata": {
    "duration": "Duration: {duration}",
    "pages": "{count, plural, one {# page} other {# pages}}"
  }
}
```

### Verification
- [ ] JSON is valid (no syntax errors)
- [ ] Confirmation namespace is nested under `common`
- [ ] All ICU pluralization patterns are correct
- [ ] All interpolation variables use `{variableName}` format

### Acceptance Criteria
- [ ] `common.confirmation` namespace exists in en.json
- [ ] All confirmation dialog strings are present
- [ ] Pluralization patterns follow ICU format
- [ ] JSON file parses without errors

---

## Task 2: Add Common Action Button Keys to en.json

**Story Points:** 1
**Priority:** Critical (Blocks component updates)

### Objective
Ensure all common action button labels exist in the translation file, adding any missing keys.

### File to Modify
- `/messages/en.json`

### Implementation Steps

1. Open `/messages/en.json`

2. Verify/add the following keys exist in the `common` object at root level:

```json
"common": {
  "save": "Save",
  "cancel": "Cancel",
  "delete": "Delete",
  "edit": "Edit",
  "create": "Create",
  "loading": "Loading...",
  "error": "Error",
  "success": "Success",
  "confirm": "Confirm",
  "back": "Back",
  "next": "Next",
  "close": "Close",
  "search": "Search",
  "filter": "Filter",
  "sort": "Sort",
  "actions": "Actions",
  "yes": "Yes",
  "no": "No",
  "submit": "Submit",
  "reset": "Reset",
  "clear": "Clear",
  "select": "Select",
  "view": "View",
  "download": "Download",
  "upload": "Upload",
  "copy": "Copy",
  "share": "Share",
  "more": "More",
  "less": "Less",
  "all": "All",
  "none": "None",
  "optional": "Optional",
  "required": "Required",
  "remove": "Remove",
  "exit": "Exit",
  "stay": "Stay",
  "proceed": "Proceed"
}
```

3. **Add missing keys only** - do not duplicate existing keys

### Keys Likely Missing (to verify and add)
- `"remove": "Remove"`
- `"exit": "Exit"`
- `"stay": "Stay"`
- `"proceed": "Proceed"`

### Verification
- [ ] All action button keys exist
- [ ] No duplicate keys
- [ ] JSON parses without errors

### Acceptance Criteria
- [ ] All common action labels are available for component use
- [ ] Keys follow existing naming convention

---

## Task 3: Update ConfirmationModal Component

**Story Points:** 1
**Priority:** High

### Objective
Update the generic ConfirmationModal to use translated default values for button labels.

### File to Modify
- `/src/components/ConfirmationModal.tsx`

### Current Hardcoded Strings (Lines 19-20)
```typescript
confirmText = 'Confirm',
cancelText = 'Cancel',
```

### Implementation Steps

1. **Add import** at top of file:
```typescript
import { useTranslations } from 'next-intl';
```

2. **Add hook inside component** (after opening brace of function):
```typescript
const t = useTranslations('common');
```

3. **Update default prop values** - Change the destructured props from:
```typescript
export default function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  loading = false,
  confirmButtonColor = 'red'
}: ConfirmationModalProps) {
```

To:
```typescript
export default function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  loading = false,
  confirmButtonColor = 'red'
}: ConfirmationModalProps) {
  const t = useTranslations('common');

  // Apply translated defaults
  const finalConfirmText = confirmText ?? t('confirm');
  const finalCancelText = cancelText ?? t('cancel');
```

4. **Update button renders** - Replace `{cancelText}` with `{finalCancelText}` and `{confirmText}` with `{finalConfirmText}`

### Verification
- [ ] Component compiles without errors
- [ ] Default button text shows translated values
- [ ] Custom prop values still override defaults
- [ ] Component renders correctly in browser

### Acceptance Criteria
- [ ] Default confirmText uses `t('confirm')`
- [ ] Default cancelText uses `t('cancel')`
- [ ] Props still override defaults when provided
- [ ] No TypeScript errors

---

## Task 4: Update ConfirmDeleteDialog Component

**Story Points:** 2
**Priority:** High

### Objective
Update ConfirmDeleteDialog to use translations for all hardcoded strings including helper functions.

### File to Modify
- `/src/components/ItemManager/components/dialogs/ConfirmDeleteDialog.tsx`

### Current Hardcoded Strings
| Line | String |
|------|--------|
| 62 | `'Delete Item'` |
| 62 | `'Delete Items'` |
| 73-74 | `'Are you sure you want to delete this item? This action cannot be undone.'` |
| 75 | `'Are you sure you want to delete these ${count} items? This action cannot be undone.'` |
| 86 | `'Delete'` |
| 88 | `'Delete ${count} Items'` |
| 230 | `and ${overflowCount} more` |
| 252 | `Cancel` |
| 271 | `Deleting...` |

### Implementation Steps

1. **Add import** at top of file:
```typescript
import { useTranslations } from 'next-intl';
```

2. **Move helper functions inside component** and refactor. The exported helper functions (`getDeleteTitle`, `getDeleteMessage`, `getConfirmButtonText`) need to be refactored since they can't access hooks.

3. **Inside the ConfirmDeleteDialog component**, add:
```typescript
const t = useTranslations('common.confirmation.delete');
const tCommon = useTranslations('common');
```

4. **Replace getDeleteTitle usage** (line 201):
```typescript
// Before
{getDeleteTitle(itemCount, title)}

// After - inline logic with translation
{title ?? (itemCount === 1 ? t('title') : t('titlePlural'))}
```

5. **Replace getDeleteMessage usage** (line 207):
```typescript
// Before
{getDeleteMessage(itemCount)}

// After
{itemCount === 1 ? t('singleItem') : t('multipleItems', { count: itemCount })}
```

6. **Replace "and X more" text** (line 230):
```typescript
// Before
<span>and {overflowCount} more</span>

// After
<span>{t('andMore', { count: overflowCount })}</span>
```

7. **Replace Cancel button text** (line 252):
```typescript
// Before
Cancel

// After
{tCommon('cancel')}
```

8. **Replace Deleting... text** (line 271):
```typescript
// Before
<span>Deleting...</span>

// After
<span>{t('deleting')}</span>
```

9. **Replace getConfirmButtonText usage** (line 274):
```typescript
// Before
getConfirmButtonText(itemCount)

// After
{itemCount === 1 ? t('buttonSingle') : t('buttonMultiple', { count: itemCount })}
```

10. **Keep exported helper functions** for backward compatibility, but mark them as deprecated:
```typescript
/**
 * @deprecated Use translations instead. Kept for backward compatibility.
 */
export function getDeleteTitle(count: number, customTitle?: string): string {
  // ... existing code
}
```

### Verification
- [ ] Component compiles without TypeScript errors
- [ ] Single item delete shows correct title/message
- [ ] Multiple item delete shows correct title/message with count
- [ ] "and X more" displays correctly with count
- [ ] Cancel and Delete buttons show translated text
- [ ] Loading state shows "Deleting..."

### Acceptance Criteria
- [ ] All hardcoded strings replaced with translation calls
- [ ] Pluralization works correctly for item counts
- [ ] Overflow count displays correctly
- [ ] Backward compatibility maintained for helper functions

---

## Task 5: Update ConfirmExitDialog Component

**Story Points:** 2
**Priority:** High

### Objective
Update ConfirmExitDialog to use translations for the title, dynamic message, and button labels.

### File to Modify
- `/src/components/ItemCreationWorkflow/components/shared/ConfirmExitDialog.tsx`

### Current Hardcoded Strings
| Line | String |
|------|--------|
| 68 | `You have unsaved changes and ${itemCount} item${...} in this session...` |
| 71 | `'You have unsaved changes. Are you sure you want to exit?'` |
| 74 | `You have created ${itemCount} item${...} in this session...` |
| 76 | `'Are you sure you want to exit the workflow?'` |
| 155 | `Exit Workflow?` |
| 181 | `Cancel` |
| 196 | `Exit Workflow` |

### Implementation Steps

1. **Add import** at top of file:
```typescript
import { useTranslations } from 'next-intl';
```

2. **Add hooks inside component** after the refs:
```typescript
const t = useTranslations('common.confirmation.exit.workflow');
const tCommon = useTranslations('common');
```

3. **Refactor getExitMessage helper** - Move it inside the component or create a new translated version:
```typescript
// Inside component, after hooks
const getExitMessageTranslated = (itemCount: number, hasUnsavedChanges: boolean): string => {
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
};
```

4. **Update title** (line 155):
```typescript
// Before
Exit Workflow?

// After
{t('title')}
```

5. **Update description** (line 161):
```typescript
// Before
{getExitMessage(itemCount, hasUnsavedChanges)}

// After
{getExitMessageTranslated(itemCount, hasUnsavedChanges)}
```

6. **Update Cancel button** (line 181):
```typescript
// Before
Cancel

// After
{tCommon('cancel')}
```

7. **Update Exit Workflow button** (line 196):
```typescript
// Before
Exit Workflow

// After
{t('button')}
```

### Verification
- [ ] Component compiles without errors
- [ ] Title shows translated "Exit Workflow?"
- [ ] Message varies correctly based on itemCount and hasUnsavedChanges
- [ ] Pluralization works (1 item vs 2 items)
- [ ] Cancel and Exit Workflow buttons show translated text

### Acceptance Criteria
- [ ] All 4 message variants translate correctly
- [ ] ICU pluralization for item counts works
- [ ] Button labels use translations
- [ ] No TypeScript errors

---

## Task 6: Update RemoveItemDialog Component

**Story Points:** 1
**Priority:** High

### Objective
Update RemoveItemDialog to use translations for title, message with item name interpolation, and buttons.

### File to Modify
- `/src/components/ItemCreationWorkflow/components/shared/RemoveItemDialog.tsx`

### Current Hardcoded Strings
| Line | String |
|------|--------|
| 123 | `Remove Item?` |
| 129 | `Are you sure you want to remove "{displayName}"? This action cannot be undone.` |
| 150 | `Cancel` |
| 167 | `Remove` |

### Implementation Steps

1. **Add import** at top of file:
```typescript
import { useTranslations } from 'next-intl';
```

2. **Add hooks inside component** after refs:
```typescript
const t = useTranslations('common.confirmation.remove.item');
const tCommon = useTranslations('common');
```

3. **Update title** (line 123):
```typescript
// Before
Remove Item?

// After
{t('title')}
```

4. **Update message** (line 129):
```typescript
// Before
Are you sure you want to remove &ldquo;{displayName}&rdquo;? This action cannot be undone.

// After
{t('message', { name: displayName })}
```

**Note:** The translation key `common.confirmation.remove.item.message` value should be:
`"Are you sure you want to remove \"{name}\"? This action cannot be undone."`

5. **Update Cancel button** (line 150):
```typescript
// Before
Cancel

// After
{tCommon('cancel')}
```

6. **Update Remove button** (line 167):
```typescript
// Before
Remove

// After
{t('button')}
```

### Verification
- [ ] Component compiles without errors
- [ ] Title shows "Remove Item?"
- [ ] Message includes the item name correctly
- [ ] Buttons show translated text

### Acceptance Criteria
- [ ] Title uses translation
- [ ] Message uses interpolation for item name
- [ ] Cancel button uses common translation
- [ ] Remove button uses translation

---

## Task 7: Update EmptySessionDialog Component

**Story Points:** 1
**Priority:** High

### Objective
Update EmptySessionDialog to use translations for title, message, and action buttons.

### File to Modify
- `/src/components/ItemCreationWorkflow/components/shared/EmptySessionDialog.tsx`

### Current Hardcoded Strings
| Line | String |
|------|--------|
| 150 | `No Items Added` |
| 158 | `No items added yet. Add items or exit session?` |
| 179 | `Add Items` |
| 198 | `Exit Session` |
| 132 | `Close dialog` (aria-label) |

### Implementation Steps

1. **Add import** at top of file:
```typescript
import { useTranslations } from 'next-intl';
```

2. **Add hook inside component**:
```typescript
const t = useTranslations('common.confirmation.emptySession');
```

3. **Update title** (line 150):
```typescript
// Before
No Items Added

// After
{t('title')}
```

4. **Update description** (line 158):
```typescript
// Before
No items added yet. Add items or exit session?

// After
{t('message')}
```

5. **Update Add Items button** (line 179):
```typescript
// Before
Add Items

// After
{t('addItems')}
```

6. **Update Exit Session button** (line 198):
```typescript
// Before
Exit Session

// After
{t('exitSession')}
```

### Verification
- [ ] Component compiles without errors
- [ ] Title shows translated text
- [ ] Message shows translated text
- [ ] Both action buttons show translated text

### Acceptance Criteria
- [ ] All visible text uses translations
- [ ] Dialog functions correctly in all states

---

## Task 8: Update DeleteItemDialog Component

**Story Points:** 2
**Priority:** High

### Objective
Update DeleteItemDialog to use translations including pluralized cascade warnings.

### File to Modify
- `/src/components/dashboard/DeleteItemDialog.tsx`

### Current Hardcoded Strings
| Line | String |
|------|--------|
| 72 | `Delete Item` |
| 78-79 | `Are you sure you want to delete "{item.name}"? This action cannot be undone.` |
| 92 | `This will also delete:` |
| 98 | `{linksCount} resource link{linksCount !== 1 ? 's' : ''}` |
| 104 | `{mediaCount} media file{mediaCount !== 1 ? 's' : ''} from storage` |
| 129 | `Cancel` |
| 148 | `Deleting...` |
| 151 | `Delete Item` |

### Implementation Steps

1. **Add import** at top of file:
```typescript
import { useTranslations } from 'next-intl';
```

2. **Add hooks inside component**:
```typescript
const t = useTranslations('common.confirmation.deleteItem');
const tCommon = useTranslations('common');
```

3. **Update title** (line 72):
```typescript
// Before
Delete Item

// After
{t('title')}
```

4. **Update message** (lines 77-79):
```typescript
// Before
Are you sure you want to delete <strong>&quot;{item.name}&quot;</strong>?
This action cannot be undone.

// After (using React.Fragment or restructure)
{t('message', { name: item.name })}
```

**Note:** You may need to handle the `<strong>` formatting. Option A: Remove bold. Option B: Use rich text formatting with next-intl.

For simplicity, modify the message JSX:
```tsx
<p id="delete-dialog-description" className="mt-2 text-sm text-gray-600">
  {t.rich('message', {
    name: item.name,
    strong: (chunks) => <strong>{chunks}</strong>
  })}
</p>
```

And update en.json:
```json
"message": "Are you sure you want to delete <strong>{name}</strong>? This action cannot be undone."
```

5. **Update cascade warning heading** (line 92):
```typescript
// Before
This will also delete:

// After
{t('cascadeWarning')}
```

6. **Update resource links count** (line 98):
```typescript
// Before
<span>{linksCount} resource link{linksCount !== 1 ? 's' : ''}</span>

// After
<span>{t('resourceLinks', { count: linksCount })}</span>
```

7. **Update media files count** (line 104):
```typescript
// Before
<span>{mediaCount} media file{mediaCount !== 1 ? 's' : ''} from storage</span>

// After
<span>{t('mediaFiles', { count: mediaCount })}</span>
```

8. **Update Cancel button** (line 129):
```typescript
// Before
Cancel

// After
{tCommon('cancel')}
```

9. **Update loading state** (line 148):
```typescript
// Before
<span>Deleting...</span>

// After
<span>{tCommon('confirmation.delete.deleting')}</span>
```

Or add a `deleting` key to deleteItem namespace.

10. **Update Delete Item button** (line 151):
```typescript
// Before
'Delete Item'

// After
{t('button')}
```

### Verification
- [ ] Component compiles without errors
- [ ] Title and message display correctly
- [ ] Cascade warning section shows pluralized counts
- [ ] "1 resource link" vs "2 resource links" works
- [ ] "1 media file" vs "2 media files" works
- [ ] Button states work correctly

### Acceptance Criteria
- [ ] All strings use translations
- [ ] ICU pluralization works for resource links and media files
- [ ] Name interpolation works in message
- [ ] Loading state shows translated text

---

## Task 9: Update DeleteMediaConfirmDialog Component

**Story Points:** 1
**Priority:** High

### Objective
Update DeleteMediaConfirmDialog to use translations for type labels, title, and buttons.

### File to Modify
- `/src/components/MediaManagement/DeleteMediaConfirmDialog.tsx`

### Current Hardcoded Strings
| Line | String |
|------|--------|
| 47 | `'YouTube Video'` |
| 49 | `'PDF Document'` |
| 51 | `'Image'` |
| 54 | `'Web Link'` |
| 104 | `Delete {getTypeLabel(link.linkType)}?` |
| 122 | `This action cannot be undone.` |
| 136 | `Cancel` |
| 154 | `Delete` |

### Implementation Steps

1. **Add import** at top of file:
```typescript
import { useTranslations } from 'next-intl';
```

2. **Add hooks inside component**:
```typescript
const t = useTranslations('common.confirmation.deleteMedia');
const tCommon = useTranslations('common');
```

3. **Refactor getTypeLabel function** to use translations:
```typescript
// Inside component, replace the standalone function usage with:
const getTypeLabelTranslated = (linkType: string): string => {
  const typeKey = linkType as 'youtube' | 'pdf' | 'image' | 'text';
  return t(`types.${typeKey}`);
};
```

4. **Update title** (line 104):
```typescript
// Before
Delete {getTypeLabel(link.linkType)}?

// After
{t('title', { type: getTypeLabelTranslated(link.linkType) })}
```

5. **Update warning message** (line 122):
```typescript
// Before
This action cannot be undone.

// After
{tCommon('confirmation.generic.cannotUndo')}
```

6. **Update Cancel button** (line 136):
```typescript
// Before
Cancel

// After
{tCommon('cancel')}
```

7. **Update Delete button** (line 154):
```typescript
// Before
Delete

// After
{t('button')}
```

### Verification
- [ ] YouTube Video, PDF Document, Image, Web Link all translate correctly
- [ ] Dynamic title shows "Delete YouTube Video?" etc.
- [ ] Warning message is translated
- [ ] Buttons are translated

### Acceptance Criteria
- [ ] Type labels use translations
- [ ] Title interpolates type correctly
- [ ] All buttons use translations

---

## Task 10: Update AssetRemoveConfirmDialog Component

**Story Points:** 2
**Priority:** High

### Objective
Update AssetRemoveConfirmDialog to use translations for type labels, title, metadata, and buttons.

### File to Modify
- `/src/components/ItemManager/components/AssetPanel/AssetRemoveConfirmDialog.tsx`

### Current Hardcoded Strings
| Line | String |
|------|--------|
| 118 | `'Video'` |
| 120 | `'Photo'` |
| 122 | `'PDF'` |
| 125 | `'Asset'` |
| 261 | `Remove {typeLabel}?` |
| 327 | `Duration: {formatDuration(duration)}` |
| 333 | `{pageCount} {pageCount === 1 ? 'page' : 'pages'}` |
| 348 | `This action cannot be undone.` |
| 364 | `Cancel` |
| 384 | `Remove` |

### Implementation Steps

1. **Add import** at top of file:
```typescript
import { useTranslations } from 'next-intl';
```

2. **Add hooks inside component**:
```typescript
const t = useTranslations('common.confirmation.remove.asset');
const tMeta = useTranslations('common.confirmation.metadata');
const tCommon = useTranslations('common');
```

3. **Refactor getTypeLabel function** to use translations:
```typescript
// Inside component, create translated version:
const getTypeLabelTranslated = (type: 'video' | 'image' | 'pdf'): string => {
  return t(`types.${type}`);
};
```

4. **Update title** (line 261):
```typescript
// Before
Remove {typeLabel}?

// After
{t('title', { type: getTypeLabelTranslated(asset.type) })}
```

5. **Update type badge label** (line 321):
```typescript
// Before
<span>{typeLabel}</span>

// After
<span>{getTypeLabelTranslated(asset.type)}</span>
```

6. **Update duration display** (line 327):
```typescript
// Before
<p className="text-sm text-gray-600 mt-1">
  Duration: {formatDuration(duration)}
</p>

// After
<p className="text-sm text-gray-600 mt-1">
  {tMeta('duration', { duration: formatDuration(duration) })}
</p>
```

7. **Update page count display** (line 333):
```typescript
// Before
<p className="text-sm text-gray-600 mt-1">
  {pageCount} {pageCount === 1 ? 'page' : 'pages'}
</p>

// After
<p className="text-sm text-gray-600 mt-1">
  {tMeta('pages', { count: pageCount })}
</p>
```

8. **Update warning message** (line 348):
```typescript
// Before
This action cannot be undone.

// After
{tCommon('confirmation.generic.cannotUndo')}
```

9. **Update Cancel button** (line 364):
```typescript
// Before
Cancel

// After
{tCommon('cancel')}
```

10. **Update Remove button** (line 384):
```typescript
// Before
Remove

// After
{t('button')}
```

### Verification
- [ ] Video, Photo, PDF, Asset type labels translate correctly
- [ ] Title interpolates type correctly
- [ ] Duration metadata translates
- [ ] Page count pluralizes correctly (1 page vs 2 pages)
- [ ] Warning and buttons are translated

### Acceptance Criteria
- [ ] All type labels use translations
- [ ] Metadata uses proper interpolation and pluralization
- [ ] All buttons use translations
- [ ] No TypeScript errors

---

## Task 11: Propagate Translations to 5 Non-English Languages

**Story Points:** 2
**Priority:** High

### Objective
Add the confirmation namespace translations to all non-English language files.

### Files to Modify
- `/messages/fr.json` (French)
- `/messages/es.json` (Spanish)
- `/messages/de.json` (German)
- `/messages/nl.json` (Dutch)
- `/messages/it.json` (Italian)

### Implementation Steps

1. **Copy the entire `common.confirmation` namespace** from en.json

2. **Translate each file** using AI translation or professional translation services

3. **Pay special attention to:**
   - ICU pluralization patterns (different languages have different plural rules)
   - Interpolation variables must remain unchanged: `{name}`, `{count}`, `{type}`, `{duration}`
   - Quotation marks may differ by language (French uses guillemets « »)

### Sample Translations (French)

```json
"confirmation": {
  "generic": {
    "title": "Confirmer l'action",
    "areYouSure": "Etes-vous sur ?",
    "cannotUndo": "Cette action est irreversible."
  },
  "delete": {
    "title": "Supprimer l'element",
    "titlePlural": "Supprimer les elements",
    "singleItem": "Etes-vous sur de vouloir supprimer cet element ? Cette action est irreversible.",
    "multipleItems": "Etes-vous sur de vouloir supprimer ces {count} elements ? Cette action est irreversible.",
    "buttonSingle": "Supprimer",
    "buttonMultiple": "Supprimer {count} elements",
    "deleting": "Suppression...",
    "andMore": "et {count} de plus"
  },
  "exit": {
    "workflow": {
      "title": "Quitter le processus ?",
      "unsavedWithItems": "Vous avez des modifications non enregistrees et {count, plural, one {# element} other {# elements}} dans cette session. Etes-vous sur de vouloir quitter ?",
      "unsaved": "Vous avez des modifications non enregistrees. Etes-vous sur de vouloir quitter ?",
      "withItems": "Vous avez cree {count, plural, one {# element} other {# elements}} dans cette session. Etes-vous sur de vouloir quitter ?",
      "default": "Etes-vous sur de vouloir quitter le processus ?",
      "button": "Quitter"
    }
  },
  "emptySession": {
    "title": "Aucun element ajoute",
    "message": "Aucun element ajoute. Ajouter des elements ou quitter la session ?",
    "addItems": "Ajouter des elements",
    "exitSession": "Quitter la session"
  }
}
```

### Verification Per Language
- [ ] JSON parses without errors
- [ ] All keys from en.json exist
- [ ] ICU pluralization syntax is correct
- [ ] Interpolation variables are preserved exactly

### Acceptance Criteria
- [ ] All 5 language files have complete `common.confirmation` namespace
- [ ] JSON files validate successfully
- [ ] No missing keys compared to en.json

---

## Task 12: Manual Verification and Testing

**Story Points:** 1
**Priority:** High

### Objective
Verify all confirmation dialogs display correctly in each language and test edge cases.

### Test Scenarios

#### 12.1 ConfirmationModal (Generic)
- [ ] Open any modal using ConfirmationModal
- [ ] Verify default "Confirm" and "Cancel" buttons translate
- [ ] Verify custom button text overrides still work

#### 12.2 ConfirmDeleteDialog
- [ ] Select 1 item for deletion - verify title, message, button
- [ ] Select 3 items for deletion - verify pluralized text
- [ ] Select 7 items for deletion - verify "and 2 more" overflow text
- [ ] Click delete - verify "Deleting..." appears
- [ ] Switch language - verify all text updates

#### 12.3 ConfirmExitDialog
- [ ] Open with hasUnsavedChanges=true, itemCount=0
- [ ] Open with hasUnsavedChanges=false, itemCount=1
- [ ] Open with hasUnsavedChanges=true, itemCount=5
- [ ] Open with hasUnsavedChanges=false, itemCount=0
- [ ] Verify title and both buttons translate

#### 12.4 RemoveItemDialog
- [ ] Remove item with short name
- [ ] Remove item with long name (verify truncation)
- [ ] Verify title, message with name, buttons translate

#### 12.5 EmptySessionDialog
- [ ] Trigger empty session dialog
- [ ] Verify title, message, both action buttons translate

#### 12.6 DeleteItemDialog
- [ ] Delete item with 0 links, 0 media
- [ ] Delete item with 1 link, 0 media
- [ ] Delete item with 0 links, 1 media
- [ ] Delete item with 3 links, 5 media
- [ ] Verify pluralization: "1 resource link" vs "3 resource links"
- [ ] Verify pluralization: "1 media file" vs "5 media files"

#### 12.7 DeleteMediaConfirmDialog
- [ ] Delete YouTube video - verify "Delete YouTube Video?" title
- [ ] Delete PDF - verify "Delete PDF Document?" title
- [ ] Delete Image - verify "Delete Image?" title
- [ ] Delete Web Link - verify "Delete Web Link?" title
- [ ] Verify warning and buttons translate

#### 12.8 AssetRemoveConfirmDialog
- [ ] Remove Video asset - verify "Remove Video?" title
- [ ] Remove Photo asset - verify "Remove Photo?" title
- [ ] Remove PDF asset - verify "Remove PDF?" title
- [ ] Verify duration metadata: "Duration: 1:30"
- [ ] Verify page count: "1 page" vs "5 pages"
- [ ] Verify warning and buttons translate

### Language Switching Test
For each dialog type:
- [ ] Open in English - verify text
- [ ] Switch to French - verify text updates immediately
- [ ] Switch to Spanish - verify text updates
- [ ] Switch to German - verify text updates
- [ ] Switch to Dutch - verify text updates
- [ ] Switch to Italian - verify text updates

### Acceptance Criteria
- [ ] All dialogs display translated text in all 6 languages
- [ ] Pluralization works correctly in all languages
- [ ] Dynamic interpolation (names, counts, types) works
- [ ] No console errors or warnings
- [ ] Backward compatibility maintained (prop overrides work)

---

## Dependencies

### Prerequisites (Must be complete)
- [x] Epic 1 i18n foundation (next-intl installed and configured)
- [x] Translation files exist for all 6 locales
- [x] useTranslations hook available in client components

### Related Tasks
- Task 2H.1: Create `common` namespace structure (should be complete)
- Task 2H.3: Extract modal/dialog strings (related patterns)
- Task 2H.10: Generate translations for all 5 non-English languages

### Already Complete
- LogoutButton confirmation uses `auth.confirmLogout` and `auth.confirmSignOutMessage`

---

## Files Modified Summary

### Translation Files
| File | Change |
|------|--------|
| `/messages/en.json` | Add `common.confirmation` namespace |
| `/messages/fr.json` | Add `common.confirmation` namespace |
| `/messages/es.json` | Add `common.confirmation` namespace |
| `/messages/de.json` | Add `common.confirmation` namespace |
| `/messages/nl.json` | Add `common.confirmation` namespace |
| `/messages/it.json` | Add `common.confirmation` namespace |

### Component Files
| File | Change |
|------|--------|
| `/src/components/ConfirmationModal.tsx` | Add useTranslations, update default props |
| `/src/components/ItemManager/components/dialogs/ConfirmDeleteDialog.tsx` | Add useTranslations, refactor helpers |
| `/src/components/ItemCreationWorkflow/components/shared/ConfirmExitDialog.tsx` | Add useTranslations, update all strings |
| `/src/components/ItemCreationWorkflow/components/shared/RemoveItemDialog.tsx` | Add useTranslations, update all strings |
| `/src/components/ItemCreationWorkflow/components/shared/EmptySessionDialog.tsx` | Add useTranslations, update all strings |
| `/src/components/dashboard/DeleteItemDialog.tsx` | Add useTranslations, update all strings |
| `/src/components/MediaManagement/DeleteMediaConfirmDialog.tsx` | Add useTranslations, update all strings |
| `/src/components/ItemManager/components/AssetPanel/AssetRemoveConfirmDialog.tsx` | Add useTranslations, update all strings |

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Helper functions outside component scope | High | Medium | Move helpers inside components or create translated versions |
| ICU syntax errors in translations | Medium | High | Validate JSON structure and test pluralization |
| Missing translation keys at runtime | Low | High | Build-time checks, comprehensive testing |
| Backward compatibility breaks | Low | High | Keep prop overrides working, deprecate old helpers |
| Rich text formatting issues | Medium | Medium | Use t.rich() for HTML content or simplify formatting |

---

## Notes for Implementation

1. **Import Pattern**: Always use `import { useTranslations } from 'next-intl';` for client components

2. **Hook Naming Convention**:
   - `t` for primary namespace
   - `tCommon` for common namespace
   - `tMeta` for metadata-specific translations

3. **ICU Pluralization**: Format is `{count, plural, one {# item} other {# items}}`

4. **Interpolation**: Use `{variableName}` in translation strings, pass as object to t()

5. **Testing**: Always test with counts 0, 1, 2, and larger numbers to verify pluralization

---

## References

- [Overview Document](/docs/REQ-344-extract-confirmation-dialog-messages-overview.md)
- [Request #344 in gen_requests_epic2.md](/docs/gen_requests_epic2.md)
- [Plan-111-L10N-Epic2-Static-UI-Translation.md](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)
