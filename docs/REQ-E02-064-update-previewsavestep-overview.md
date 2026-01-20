# Implementation Breakdown: REQ-E02-064 - Update PreviewSaveStep

**Document Version:** 1.0
**Created:** 2026-01-20
**Last Modified:** 2026-01-20
**Request ID:** REQ-E02-064
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2C - Item Creation Workflow
**Task ID:** 2C.9
**Estimated Size:** L (Large)

---

## Overview

This document provides the implementation breakdown for updating the PreviewSaveStep component to use the i18n translation system. PreviewSaveStep is Step 8 (the final user-visible step) in the ItemCreationWorkflow, responsible for allowing users to review and save their captured content before completing the item creation process.

**Scope:** The PreviewSaveStep.tsx file contains approximately 50+ hardcoded English strings across multiple sub-components:

### Sub-Components in PreviewSaveStep:
1. **EmptyContentState** - Displayed when no content has been added
2. **ItemDetailsDisplay** - Read-only metadata display (room/item type dropdowns)
3. **ItemDetailsSection** - Editable fields for item name, description, article title, tags
4. **ContentSection** - Content grid with drag-and-drop reordering
5. **SuccessOverlay** - Success state after saving with QR code display
6. **Main PreviewSaveStep component** - Header, save button, error display, removal confirmation dialog

---

## Dependencies

### Prerequisites (Epic 1 Foundation)
| Dependency | Location | Status |
|------------|----------|--------|
| next-intl package | `package.json` | Required |
| i18n config | `/src/lib/i18n/config.ts` | Complete |
| Translation files | `/messages/en.json` | Complete (base structure exists) |
| useTranslations hook | next-intl | Available |

### Prerequisites (Epic 2 - Prior Tasks)
| Dependency | Task | Status |
|------------|------|--------|
| `workflow` namespace structure | REQ-E02-056 (Task 2C.1) | Required - Must be complete |
| Main ItemCreationWorkflow updated | REQ-E02-057 (Task 2C.2) | Recommended |
| MediaCaptureStep updated | REQ-E02-063 (Task 2C.8) | Recommended - Previous step in sequence |

### Existing Patterns to Follow
- Translation file structure in `/messages/en.json` (common, auth, dashboard, workflow namespaces)
- Key naming convention: `{namespace}.{component/area}.{element}.{variant?}`
- ICU message format for pluralization and interpolation
- Client component pattern using `useTranslations` hook
- Shared component localization approach (ContentPieceCard, ItemNameEditor, TagsEditor)

---

## Technical Context

### Current State Analysis

The PreviewSaveStep component (901 lines) is the final review and save step in the item creation workflow. It imports and uses several shared components that also require localization awareness:

```
PreviewSaveStep.tsx
├── EmptyContentState (inline sub-component) - ~5 strings
├── ItemDetailsDisplay (inline sub-component) - ~4 strings (labels for dropdowns)
├── ItemDetailsSection (inline sub-component) - ~6 strings (labels, placeholders)
├── ContentSection (inline sub-component) - ~8 strings (headers, badges, buttons)
├── SuccessOverlay (inline sub-component) - ~4 strings (title, description, button)
├── Main component render - ~15 strings (header, button states, dialogs)
└── Accessibility announcements - ~2 strings
```

### Imported Shared Components
The component imports from `../shared`:
- **ItemNameEditor** - May have its own strings (placeholder, validation)
- **ContentPieceCard** - May have its own strings (delete button, retake)
- **SortableContentPieceCard** - Wrapper for drag-and-drop
- **TagsEditor** - May have its own strings (placeholder, validation)

**Note:** The shared components should be updated in a separate task (REQ-E02-071 for shared components). This task focuses on PreviewSaveStep.tsx itself.

### Constants Referenced
From `../../utils/constants`:
- `ROOM_LABELS` - Room type display names (already in constants, may need translation consideration)
- `ITEM_TYPE_LABELS` - Item type display names (already in constants)
- `PURPOSE_LABELS` - Purpose type display names (already in constants)
- `MAX_CONTENT_PIECES` - Number constant (no translation needed)

**Important:** The labels in constants.ts are hardcoded English strings. For full i18n, these should eventually be replaced with translation keys in the consuming components. This task will translate the labels inline where they're used.

---

## Identified Hardcoded Strings

### 1. EmptyContentState Sub-Component (~5 strings)
| Line | Current String | Translation Key |
|------|----------------|-----------------|
| 111 | `"No content added yet"` | `workflow.steps.preview.empty.message` |
| 117 | `"Add Content"` | `workflow.steps.preview.empty.addButton` |

### 2. ItemDetailsDisplay Sub-Component (~4 strings)
| Line | Current String | Translation Key |
|------|----------------|-----------------|
| 152 | `"Room"` | `workflow.steps.preview.details.roomLabel` |
| 178 | `"Item Type"` | `workflow.steps.preview.details.itemTypeLabel` |

### 3. ItemDetailsSection Sub-Component (~8 strings)
| Line | Current String | Translation Key |
|------|----------------|-----------------|
| 258 | `"Enter item name"` (placeholder via ItemNameEditor) | `workflow.steps.preview.details.itemNamePlaceholder` |
| 267 | `"Item Description"` | `workflow.steps.preview.details.itemDescriptionLabel` |
| 277 | `"Enter a brief description of this item (optional)"` | `workflow.steps.preview.details.itemDescriptionPlaceholder` |
| 307 | `"Guide/Article Title"` | `workflow.steps.preview.details.articleTitleLabel` |
| 317 | `"Enter guide/article title"` | `workflow.steps.preview.details.articleTitlePlaceholder` |
| 333 | `"Tags"` | `workflow.steps.preview.details.tagsLabel` |

### 4. ContentSection Sub-Component (~8 strings)
| Line | Current String | Translation Key |
|------|----------------|-----------------|
| 397 | `"Content"` | `workflow.steps.preview.content.title` |
| 401 | `"${contentCount} content pieces"` (aria-label) | `workflow.steps.preview.content.countLabel` |
| 407-408 | `"Maximum reached"` | `workflow.steps.preview.content.maxReached` |
| 434 | `"Content pieces - drag to reorder"` (aria-label) | `workflow.steps.preview.content.dragHint` |
| 475 | `"Add More"` | `workflow.steps.preview.content.addMore` |

### 5. SuccessOverlay Sub-Component (~5 strings)
| Line | Current String | Translation Key |
|------|----------------|-----------------|
| 526 | `"Item Saved!"` | `workflow.steps.preview.success.title` |
| 532 | `"QR code for {itemName}"` (alt text) | `workflow.steps.preview.success.qrAlt` |
| 543 | `"Your item has been saved and is ready for your guests!"` | `workflow.steps.preview.success.message` |
| 553 | `"Continue"` | `workflow.steps.preview.success.continueButton` |

### 6. Main Component (~15 strings)
| Line | Current String | Translation Key |
|------|----------------|-----------------|
| 641 | `"Picked up {typeName}. Current position: {position} of {total}. Use arrow keys to move."` | `workflow.steps.preview.dnd.pickedUp` |
| 646 | `"Over position {position}"` | `workflow.steps.preview.dnd.overPosition` |
| 655 | `"Dropped {typeName}. New position: {position} of {total}"` | `workflow.steps.preview.dnd.dropped` |
| 657 | `"Position unchanged."` | `workflow.steps.preview.dnd.unchanged` |
| 661 | `"Drag cancelled. Content returned to original position."` | `workflow.steps.preview.dnd.cancelled` |
| 745 | `"No item data available. Please start a new item."` | `workflow.steps.preview.errors.noItemData` |
| 752 | `"Go Back"` | `common.actions.goBack` |
| 771 | `"Go back"` (aria-label) | `workflow.steps.preview.header.backAriaLabel` |
| 776 | `"Preview & Save"` | `workflow.steps.preview.header.title` |
| 841-848 | `"Saving..."` / `"Save Item"` | `workflow.steps.preview.buttons.saving` / `workflow.steps.preview.buttons.saveItem` |
| 854 | `"Item saved successfully"` (sr-only) | `workflow.steps.preview.announcements.saved` |
| 855 | `"Error: {saveError}"` (sr-only) | `workflow.steps.preview.announcements.error` |
| 817 | `"Dismiss"` | `common.actions.dismiss` |
| 870 | `"Remove Last Content?"` | `workflow.steps.preview.dialogs.removeLastContent.title` |
| 874 | `"This is the only piece of content. Removing it will leave this item empty. Are you sure you want to remove it?"` | `workflow.steps.preview.dialogs.removeLastContent.message` |
| 882 | `"Keep"` | `workflow.steps.preview.dialogs.removeLastContent.keepButton` |
| 889 | `"Remove"` | `workflow.steps.preview.dialogs.removeLastContent.removeButton` |

### 7. DnD Announcements Type Strings (~5 strings)
| Line | Current String | Translation Key |
|------|----------------|-----------------|
| 640 | `"{type} content"` | `workflow.steps.preview.dnd.contentType` |
| 641 | `"content piece"` (fallback) | `workflow.steps.preview.dnd.contentPiece` |

---

## Implementation Tasks

### Phase 1: Main Component Translation Setup

#### Task 1: Add Translation Hook and Initial Setup
**Priority:** Critical
**Estimate:** 0.25 story points
**File:** `/src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx`

**Changes:**
1. Add `useTranslations` import from 'next-intl'
2. Initialize hook at the start of main component: `const t = useTranslations('workflow.steps.preview');`
3. Add common translations hook if needed: `const tCommon = useTranslations('common');`

**Acceptance Criteria:**
- [ ] useTranslations hook imported
- [ ] Both namespace hooks initialized in main component

---

### Phase 2: Sub-Component Translations

#### Task 2: Update EmptyContentState Sub-Component
**Priority:** High
**Estimate:** 0.25 story points
**Location:** Lines 103-121 in PreviewSaveStep.tsx

**Changes:**
1. Add `t` parameter to EmptyContentState interface (pass from parent)
2. Replace "No content added yet" with `t('empty.message')`
3. Replace "Add Content" with `t('empty.addButton')`

**Acceptance Criteria:**
- [ ] All strings in EmptyContentState use translation keys
- [ ] Component receives translation function from parent

#### Task 3: Update ItemDetailsDisplay Sub-Component
**Priority:** High
**Estimate:** 0.25 story points
**Location:** Lines 127-203 in PreviewSaveStep.tsx

**Changes:**
1. Add `t` parameter to ItemDetailsDisplayProps interface
2. Replace "Room" label with `t('details.roomLabel')`
3. Replace "Item Type" label with `t('details.itemTypeLabel')`
4. Note: ROOM_LABELS and ITEM_TYPE_LABELS constants are used for dropdown options - these need special handling

**Special Consideration:** The dropdown options currently pull from constants (ROOM_LABELS, ITEM_TYPE_LABELS). For full i18n:
- Option A: Pass translated labels via translation keys in the dropdown options
- Option B: Create translation keys that match the constant keys and translate inline

**Recommendation:** Use Option B - create workflow.steps.preview.roomTypes.{key} and workflow.steps.preview.itemTypes.{key} translation keys.

**Acceptance Criteria:**
- [ ] Field labels use translation keys
- [ ] Dropdown option translations documented (may be deferred to shared task)

#### Task 4: Update ItemDetailsSection Sub-Component
**Priority:** High
**Estimate:** 0.5 story points
**Location:** Lines 209-345 in PreviewSaveStep.tsx

**Changes:**
1. Add `t` parameter to ItemDetailsSectionProps interface
2. Replace "Item Description" label with `t('details.itemDescriptionLabel')`
3. Replace description placeholder with `t('details.itemDescriptionPlaceholder')`
4. Replace "Guide/Article Title" label with `t('details.articleTitleLabel')`
5. Replace article title placeholder with `t('details.articleTitlePlaceholder')`
6. Replace "Tags" label with `t('details.tagsLabel')`
7. Update placeholder prop passed to ItemNameEditor: `placeholder={t('details.itemNamePlaceholder')}`

**Acceptance Criteria:**
- [ ] All labels use translation keys
- [ ] All placeholders use translation keys
- [ ] ItemNameEditor receives translated placeholder

#### Task 5: Update ContentSection Sub-Component
**Priority:** High
**Estimate:** 0.5 story points
**Location:** Lines 351-480 in PreviewSaveStep.tsx

**Changes:**
1. Add `t` parameter to ContentSectionProps interface
2. Replace "Content" header with `t('content.title')`
3. Replace aria-label with `t('content.countLabel', { count: contentCount })`
4. Replace "Maximum reached" with `t('content.maxReached')`
5. Replace role="list" aria-label with `t('content.dragHint')`
6. Replace "Add More" button text with `t('content.addMore')`

**Acceptance Criteria:**
- [ ] Content section header localized
- [ ] Count badge aria-label uses interpolation
- [ ] Maximum reached warning localized
- [ ] Add More button localized

#### Task 6: Update SuccessOverlay Sub-Component
**Priority:** High
**Estimate:** 0.25 story points
**Location:** Lines 486-557 in PreviewSaveStep.tsx

**Changes:**
1. Add `t` parameter to SuccessOverlayProps interface
2. Replace "Item Saved!" with `t('success.title')`
3. Replace QR code alt text with `t('success.qrAlt', { itemName })`
4. Replace description with `t('success.message')`
5. Replace "Continue" button with `t('success.continueButton')`

**Acceptance Criteria:**
- [ ] Success title localized
- [ ] QR code alt text uses interpolation for item name
- [ ] Success message localized
- [ ] Continue button localized

---

### Phase 3: Main Component Strings

#### Task 7: Update DnD Announcements
**Priority:** Medium
**Estimate:** 0.5 story points
**Location:** Lines 636-662 in PreviewSaveStep.tsx

**Changes:**
1. Update `announcements` useMemo to use translation keys
2. Replace all accessibility announcement strings with translations
3. Handle interpolation for position, type, and total values

**Implementation Pattern:**
```typescript
const announcements: Announcements = useMemo(() => ({
  onDragStart({ active }) {
    const piece = contentArray.find(c => c.id === active.id);
    const position = contentArray.findIndex(c => c.id === active.id) + 1;
    const typeName = piece ? t('dnd.contentType', { type: piece.type }) : t('dnd.contentPiece');
    return t('dnd.pickedUp', { typeName, position, total: contentArray.length });
  },
  onDragOver({ over }) {
    if (over) {
      const position = contentArray.findIndex(c => c.id === over.id) + 1;
      return t('dnd.overPosition', { position });
    }
    return undefined;
  },
  onDragEnd({ active, over }) {
    if (over && active.id !== over.id) {
      const piece = contentArray.find(c => c.id === active.id);
      const typeName = piece ? t('dnd.contentType', { type: piece.type }) : t('dnd.contentPiece');
      const newPosition = contentArray.findIndex(c => c.id === over.id) + 1;
      return t('dnd.dropped', { typeName, position: newPosition, total: contentArray.length });
    }
    return t('dnd.unchanged');
  },
  onDragCancel() {
    return t('dnd.cancelled');
  },
}), [contentArray, t]);
```

**Acceptance Criteria:**
- [ ] All DnD announcements use translation keys
- [ ] Position and total values interpolated correctly
- [ ] Content type name interpolated

#### Task 8: Update Header and Navigation
**Priority:** High
**Estimate:** 0.25 story points
**Location:** Lines 760-778 in PreviewSaveStep.tsx

**Changes:**
1. Replace "Go back" aria-label with `t('header.backAriaLabel')`
2. Replace "Preview & Save" title with `t('header.title')`

**Acceptance Criteria:**
- [ ] Page title localized
- [ ] Back button aria-label localized

#### Task 9: Update Save Button States
**Priority:** High
**Estimate:** 0.25 story points
**Location:** Lines 824-850 in PreviewSaveStep.tsx

**Changes:**
1. Replace "Saving..." with `t('buttons.saving')`
2. Replace "Save Item" with `t('buttons.saveItem')`

**Acceptance Criteria:**
- [ ] Save button shows correct state text
- [ ] Loading state text localized

#### Task 10: Update Screen Reader Announcements
**Priority:** Medium
**Estimate:** 0.25 story points
**Location:** Lines 852-856 in PreviewSaveStep.tsx

**Changes:**
1. Replace success announcement with `t('announcements.saved')`
2. Replace error announcement with `t('announcements.error', { error: saveError })`

**Acceptance Criteria:**
- [ ] Screen reader announcements localized
- [ ] Error message interpolated correctly

#### Task 11: Update Error Display
**Priority:** High
**Estimate:** 0.25 story points
**Location:** Lines 810-820 in PreviewSaveStep.tsx

**Changes:**
1. Replace "Dismiss" with `tCommon('dismiss')` or `t('errors.dismiss')`

**Acceptance Criteria:**
- [ ] Dismiss button localized

#### Task 12: Update Removal Confirmation Dialog
**Priority:** High
**Estimate:** 0.25 story points
**Location:** Lines 858-895 in PreviewSaveStep.tsx

**Changes:**
1. Replace "Remove Last Content?" title with `t('dialogs.removeLastContent.title')`
2. Replace confirmation message with `t('dialogs.removeLastContent.message')`
3. Replace "Keep" button with `t('dialogs.removeLastContent.keepButton')`
4. Replace "Remove" button with `t('dialogs.removeLastContent.removeButton')`

**Acceptance Criteria:**
- [ ] Dialog title localized
- [ ] Dialog message localized
- [ ] Both action buttons localized

#### Task 13: Update No Item Data State
**Priority:** Medium
**Estimate:** 0.25 story points
**Location:** Lines 741-755 in PreviewSaveStep.tsx

**Changes:**
1. Replace "No item data available..." message with `t('errors.noItemData')`
2. Replace "Go Back" button with `tCommon('goBack')` or `t('errors.goBackButton')`

**Acceptance Criteria:**
- [ ] Empty state message localized
- [ ] Action button localized

---

### Phase 4: Translation File Updates

#### Task 14: Add All Translation Keys to Messages File
**Priority:** Critical
**Estimate:** 0.5 story points
**File:** `/messages/en.json`

**Structure to Add:**
```json
{
  "workflow": {
    "steps": {
      "preview": {
        "header": {
          "title": "Preview & Save",
          "backAriaLabel": "Go back"
        },
        "details": {
          "roomLabel": "Room",
          "itemTypeLabel": "Item Type",
          "itemNamePlaceholder": "Enter item name",
          "itemDescriptionLabel": "Item Description",
          "itemDescriptionPlaceholder": "Enter a brief description of this item (optional)",
          "articleTitleLabel": "Guide/Article Title",
          "articleTitlePlaceholder": "Enter guide/article title",
          "tagsLabel": "Tags"
        },
        "empty": {
          "message": "No content added yet",
          "addButton": "Add Content"
        },
        "content": {
          "title": "Content",
          "countLabel": "{count, plural, one {# content piece} other {# content pieces}}",
          "maxReached": "Maximum reached",
          "dragHint": "Content pieces - drag to reorder",
          "addMore": "Add More"
        },
        "buttons": {
          "saveItem": "Save Item",
          "saving": "Saving..."
        },
        "success": {
          "title": "Item Saved!",
          "qrAlt": "QR code for {itemName}",
          "message": "Your item has been saved and is ready for your guests!",
          "continueButton": "Continue"
        },
        "dnd": {
          "contentType": "{type} content",
          "contentPiece": "content piece",
          "pickedUp": "Picked up {typeName}. Current position: {position} of {total}. Use arrow keys to move.",
          "overPosition": "Over position {position}",
          "dropped": "Dropped {typeName}. New position: {position} of {total}",
          "unchanged": "Position unchanged.",
          "cancelled": "Drag cancelled. Content returned to original position."
        },
        "dialogs": {
          "removeLastContent": {
            "title": "Remove Last Content?",
            "message": "This is the only piece of content. Removing it will leave this item empty. Are you sure you want to remove it?",
            "keepButton": "Keep",
            "removeButton": "Remove"
          }
        },
        "errors": {
          "noItemData": "No item data available. Please start a new item.",
          "goBackButton": "Go Back",
          "dismiss": "Dismiss"
        },
        "announcements": {
          "saved": "Item saved successfully",
          "error": "Error: {error}"
        }
      }
    }
  }
}
```

**Acceptance Criteria:**
- [ ] All required keys exist in `/messages/en.json`
- [ ] Keys follow established naming convention
- [ ] ICU format used for pluralization (count in countLabel)
- [ ] Variable interpolation used for dynamic values
- [ ] JSON file validates without syntax errors
- [ ] Build completes without missing translation warnings

---

## Authorized Files and Functions for Modification

### Primary Files to Modify

| File | Purpose | Modification Type |
|------|---------|-------------------|
| `/src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx` | Final preview and save step | Add useTranslations, replace all hardcoded strings |
| `/messages/en.json` | English translations | Add workflow.steps.preview.* keys |

### Functions/Sections to Modify

| Function/Section | Location | Modification |
|------------------|----------|--------------|
| `EmptyContentState` sub-component | PreviewSaveStep.tsx:103-121 | Add t prop, replace strings |
| `ItemDetailsDisplay` sub-component | PreviewSaveStep.tsx:127-203 | Add t prop, replace labels |
| `ItemDetailsSection` sub-component | PreviewSaveStep.tsx:209-345 | Add t prop, replace labels and placeholders |
| `ContentSection` sub-component | PreviewSaveStep.tsx:351-480 | Add t prop, replace header, labels, button |
| `SuccessOverlay` sub-component | PreviewSaveStep.tsx:486-557 | Add t prop, replace all strings |
| `announcements` useMemo | PreviewSaveStep.tsx:636-662 | Use translation keys with interpolation |
| Main component render | PreviewSaveStep.tsx:758-896 | Replace all remaining hardcoded strings |

### Files for Reference Only (Not Modified in This Task)

| File | Purpose |
|------|---------|
| `/src/lib/i18n/config.ts` | i18n configuration (read-only reference) |
| `/src/components/ItemCreationWorkflow/components/shared/ItemNameEditor.tsx` | Shared component (separate task) |
| `/src/components/ItemCreationWorkflow/components/shared/TagsEditor.tsx` | Shared component (separate task) |
| `/src/components/ItemCreationWorkflow/components/shared/ContentPieceCard.tsx` | Shared component (separate task) |
| `/src/components/ItemCreationWorkflow/components/shared/SortableContentPieceCard.tsx` | Wrapper component (separate task) |
| `/src/components/ItemCreationWorkflow/utils/constants.ts` | Label constants (shared task for ROOM_LABELS, ITEM_TYPE_LABELS translation) |

---

## Verification Steps

### 1. Build Verification
```bash
npm run build
```
- Verify no TypeScript errors related to translation types
- Verify no missing translation key warnings

### 2. Runtime Verification
- Start development server: `npm run dev`
- Navigate through item creation workflow to PreviewSaveStep
- Verify all text displays correctly in English
- Open browser console, verify no translation-related errors

### 3. Functional Testing

**Empty State:**
- Test with no content added, verify empty state message
- Verify "Add Content" button text

**Item Details Section:**
- Verify all field labels display correctly
- Verify all placeholders display correctly
- Test room and item type dropdowns

**Content Section:**
- Add content, verify header and count badge
- Test drag-and-drop, verify accessibility announcements
- Reach max content pieces, verify "Maximum reached" text
- Test "Add More" button

**Save Flow:**
- Test save button in normal and saving states
- Test success overlay with QR code
- Verify success message and continue button

**Error States:**
- Test error display and dismiss button
- Test removal confirmation dialog for last content piece
- Test no item data state

### 4. Accessibility Testing
- Use screen reader to verify all aria-labels are announced correctly
- Test drag-and-drop keyboard navigation with screen reader
- Verify focus management after save
- Test confirmation dialog focus trap

### 5. Language Switching Test
- Change browser language or use language switcher (if available)
- Verify all strings update
- Verify no mixed-language content

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Sub-component prop drilling complexity | Medium | Medium | Pass t function as prop to all sub-components |
| DnD announcements broken | Medium | High | Comprehensive accessibility testing with screen reader |
| Shared components not localized | High | Low | Document dependency on shared component task |
| Constants (ROOM_LABELS, etc.) not translated | High | Medium | Document in task; handle inline or defer to shared task |
| Type interpolation in DnD not working | Medium | Medium | Test with various content types (video, photo, text) |
| Pluralization not rendering correctly | Low | Medium | Test with 0, 1, and 5+ content pieces |

---

## Notes for Implementation

### 1. Sub-Component Translation Pattern
Since all sub-components are inline in PreviewSaveStep.tsx, they don't have their own `useTranslations` calls. The main component should:
1. Call `useTranslations` at the top level
2. Pass `t` function as a prop to each sub-component
3. Sub-components use the passed `t` function

Example pattern:
```typescript
interface EmptyContentStateProps {
  onAddContent: () => void;
  t: ReturnType<typeof useTranslations>;
}

function EmptyContentState({ onAddContent, t }: EmptyContentStateProps) {
  return (
    <div>
      <p>{t('empty.message')}</p>
      <button onClick={onAddContent}>{t('empty.addButton')}</button>
    </div>
  );
}
```

### 2. Dropdown Label Translation
The dropdowns use ROOM_LABELS and ITEM_TYPE_LABELS constants. Two approaches:

**Approach A (Inline translation):**
```typescript
{Object.entries(ROOM_LABELS).map(([key, _]) => (
  <option key={key} value={key}>{t(`roomTypes.${key}`)}</option>
))}
```

**Approach B (Keep English from constants, defer translation):**
Document that full dropdown translation requires updating constants or creating a translation-aware version.

**Recommendation:** Use Approach A with fallback - create translation keys for room types and item types.

### 3. DnD Content Type Translation
The content type in announcements comes from `piece.type` which is 'video', 'photo', 'text', 'url', etc. The translation should handle this:
```typescript
const typeName = piece
  ? t('dnd.contentTypes.' + piece.type, {}, { default: piece.type + ' content' })
  : t('dnd.contentPiece');
```

Or create a mapping in translations:
```json
{
  "dnd": {
    "contentTypes": {
      "video": "video content",
      "photo": "photo content",
      "text": "text content",
      "url": "link content",
      "pdf": "PDF content"
    }
  }
}
```

### 4. Coordination with Previous Task
This task follows REQ-E02-063 (MediaCaptureStep). The user captures content, then proceeds to preview. Ensure consistent patterns:
- Same translation namespace structure (`workflow.steps.*`)
- Same button label patterns (Back, Continue, Save)
- Same error message patterns

### 5. Coordination with Shared Components Task
The shared components (ItemNameEditor, TagsEditor, ContentPieceCard) used by PreviewSaveStep have their own hardcoded strings. Those should be handled in:
- REQ-E02-071: Update all shared components (25+ files)

This task should NOT modify the shared components, only pass translated props where applicable (like `placeholder` to ItemNameEditor).

---

## Acceptance Criteria Summary

From the request document (REQ-E02-064):

- [ ] All hardcoded strings in PreviewSaveStep component are extracted and replaced with translation keys
- [ ] useTranslations hook from next-intl is implemented with the 'workflow' namespace
- [ ] Preview section headers and field labels render in the selected language
- [ ] Save, cancel, and navigation buttons display translated text
- [ ] Success overlay displays translated title and message
- [ ] Error states display translated messages
- [ ] Confirmation dialogs display translated text
- [ ] Drag-and-drop accessibility announcements are localized
- [ ] Screen reader announcements are localized
- [ ] All translation keys follow established naming convention
- [ ] Translation keys added to `/messages/en.json`
- [ ] Component renders correctly with translations
- [ ] No hardcoded English strings remain in component code

---

## References

- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [REQ-E02-056: Create Workflow Namespace Structure](/docs/REQ-E02-056-create-workflow-namespace-structure-overview.md)
- [REQ-E02-063: Update MediaCaptureStep and Adapters](/docs/REQ-E02-063-update-mediacapturestep-and-adapters-overview.md)
- [Request Documentation](/docs/gen_requests_epic2.md#REQ-E02-064)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)

---

*Document generated for FAQBNB Localization Epic 2 - Sub-Epic 2C: Item Creation Workflow*
