# REQ-379: Update PreviewSaveStep Component for Internationalization

**Document Created**: 2026-01-19 16:30 UTC
**Last Modified**: 2026-01-19 16:30 UTC
**Type**: ENHANCEMENT
**Size**: L (Large)
**Epic**: Epic 2 - Static UI Translation
**Sub-Epic**: 2C - Item Creation Workflow
**Task ID**: 2C.9

---

## Summary

The PreviewSaveStep component must display all user-facing text in the user's selected language by implementing next-intl translations. This includes form labels, button text, status messages, confirmation dialogs, placeholder text, drag-and-drop accessibility announcements, success overlay content, and error messages. PreviewSaveStep is the final step in the item creation workflow where users review and save their created items.

---

## Current State Analysis

### PreviewSaveStep.tsx (Main Component)
**Location**: `/src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx`
**Lines**: ~900
**Estimated Strings**: ~50

The PreviewSaveStep is a complex component composed of multiple sub-components that together handle the final review and save operation of the item creation workflow. It includes:

- **EmptyContentState** - Sub-component for empty content display
- **ItemDetailsDisplay** - Sub-component for room/item type dropdowns
- **ItemDetailsSection** - Sub-component for all item metadata fields
- **ContentSection** - Sub-component for content preview and reordering
- **SuccessOverlay** - Sub-component for save success display

### Hardcoded Strings Identified

#### Main Component & Header
1. `"Preview & Save"` - Main step heading (line 776)
2. `"Go back"` - Back button aria-label (line 771)

#### EmptyContentState Sub-Component
3. `"No content added yet"` - Empty state message (line 111)
4. `"Add Content"` - Empty state button label (line 117)

#### ItemDetailsDisplay Sub-Component (Form Labels)
5. `"Room"` - Room dropdown label (line 152)
6. `"Item Type"` - Item type dropdown label (line 177)

#### ItemDetailsSection Sub-Component (Form Fields)
7. `"Item details form"` - Section aria-label (line 249)
8. `"Enter item name"` - Item name placeholder (line 258)
9. `"Item Description"` - Item description label (line 267)
10. `"Enter a brief description of this item (optional)"` - Item description placeholder (line 277)
11. `"Guide/Article Title"` - Article title label (line 307)
12. `"Enter guide/article title"` - Article title placeholder (line 317)
13. `"Tags"` - Tags section label (line 333)

#### ContentSection Sub-Component
14. `"Content"` - Content section heading (line 397)
15. `"{contentCount} content pieces"` - Content count aria-label (line 401)
16. `"Maximum reached"` - Maximum content indicator (line 408)
17. `"Content pieces - drag to reorder"` - Content list aria-label (line 433)
18. `"Add More"` - Add more content link (line 475)

#### Drag-and-Drop Announcements
19. `"Picked up {type} content. Current position: {position} of {total}. Use arrow keys to move."` - Drag start announcement (line 641)
20. `"Over position {position}"` - Drag over announcement (line 646)
21. `"Dropped {type} content. New position: {position} of {total}"` - Drag end announcement (line 655)
22. `"Position unchanged."` - No change announcement (line 657)
23. `"Drag cancelled. Content returned to original position."` - Drag cancel announcement (line 660)

#### Save Button States
24. `"Saving..."` - Saving button label (line 842)
25. `"Save Item"` - Save button label (line 847)

#### SuccessOverlay Sub-Component
26. `"Item Saved!"` - Success heading (line 527)
27. `"QR code for {itemName}"` - QR code alt text (line 533)
28. `"Your item has been saved and is ready for your guests!"` - Success description (line 543)
29. `"Continue"` - Continue button label (line 551)

#### Error Handling
30. `"Failed to save item"` - Save error fallback message (line 710)
31. `"Dismiss"` - Dismiss error button (line 818)
32. `"No item data available. Please start a new item."` - Guard state message (line 745)
33. `"Go Back"` - Guard state button label (line 751)

#### Confirmation Dialog (Last Content Removal)
34. `"Remove Last Content?"` - Confirmation dialog heading (line 871)
35. `"This is the only piece of content. Removing it will leave this item empty. Are you sure you want to remove it?"` - Confirmation message (lines 873-875)
36. `"Keep"` - Keep button label (line 881)
37. `"Remove"` - Remove button label (line 887)

#### Screen Reader Announcements
38. `"Item saved successfully"` - Save success announcement (line 854)
39. `"Error: {error}"` - Save error announcement (line 855)

### Related Sub-Component Files

These shared components are used by PreviewSaveStep and contain additional hardcoded strings:

#### ItemNameEditor.tsx
**Location**: `/src/components/ItemCreationWorkflow/components/shared/ItemNameEditor.tsx`
1. `"Item Name"` - Label (line 69)
2. `"Enter item name"` - Default placeholder (line 47)
3. `"This name will appear on the QR code label"` - Hint text (line 108)

#### TagsEditor.tsx
**Location**: `/src/components/ItemCreationWorkflow/components/shared/TagsEditor.tsx`
1. `"Remove {label} tag"` - Remove tag aria-label (line 84)
2. `"Add tag"` - Add tag button aria-label (line 184)
3. `"Add Tag"` - Add tag button label (line 188)
4. `"Available tags"` - Dropdown menu aria-label (line 209)

---

## Implementation Approach

### Translation Key Structure

Following the implementation plan's namespace convention, add to the `workflow` namespace:

```json
{
  "workflow": {
    "previewSaveStep": {
      "heading": "Preview & Save",
      "itemDetails": {
        "sectionLabel": "Item details form",
        "labels": {
          "itemName": "Item Name",
          "itemDescription": "Item Description",
          "room": "Room",
          "itemType": "Item Type",
          "articleTitle": "Guide/Article Title",
          "tags": "Tags"
        },
        "placeholders": {
          "itemName": "Enter item name",
          "itemDescription": "Enter a brief description of this item (optional)",
          "articleTitle": "Enter guide/article title"
        },
        "hints": {
          "itemNameHint": "This name will appear on the QR code label"
        }
      },
      "content": {
        "heading": "Content",
        "countLabel": "{count, plural, one {# content piece} other {# content pieces}}",
        "maxReached": "Maximum reached",
        "emptyState": "No content added yet",
        "buttons": {
          "addContent": "Add Content",
          "addMore": "Add More"
        }
      },
      "dragDrop": {
        "contentListLabel": "Content pieces - drag to reorder",
        "announcements": {
          "pickedUp": "Picked up {type} content. Current position: {position} of {total}. Use arrow keys to move.",
          "overPosition": "Over position {position}",
          "dropped": "Dropped {type} content. New position: {position} of {total}",
          "unchanged": "Position unchanged.",
          "cancelled": "Drag cancelled. Content returned to original position."
        }
      },
      "buttons": {
        "save": "Save Item",
        "saving": "Saving..."
      },
      "success": {
        "heading": "Item Saved!",
        "description": "Your item has been saved and is ready for your guests!",
        "qrCodeAlt": "QR code for {itemName}",
        "buttons": {
          "continue": "Continue"
        }
      },
      "confirmRemove": {
        "heading": "Remove Last Content?",
        "message": "This is the only piece of content. Removing it will leave this item empty. Are you sure you want to remove it?",
        "buttons": {
          "keep": "Keep",
          "remove": "Remove"
        }
      },
      "errors": {
        "saveFailed": "Failed to save item",
        "noData": "No item data available. Please start a new item."
      },
      "announcements": {
        "saveSuccess": "Item saved successfully",
        "saveError": "Error: {error}"
      },
      "tags": {
        "removeTag": "Remove {label} tag",
        "addTagLabel": "Add tag",
        "addTagButton": "Add Tag",
        "availableTags": "Available tags"
      }
    },
    "buttons": {
      "goBack": "Go Back",
      "dismiss": "Dismiss"
    }
  }
}
```

### Component Update Pattern

Each sub-component within PreviewSaveStep.tsx will receive the translation function via props from the main component:

```typescript
import { useTranslations } from 'next-intl';

export function PreviewSaveStep({ ... }: PreviewSaveStepProps) {
  const t = useTranslations('workflow');

  // Pass to sub-components
  return (
    <>
      <ItemDetailsSection t={t} ... />
      <ContentSection t={t} ... />
      <SuccessOverlay t={t} ... />
    </>
  );
}
```

Since all sub-components are defined within the same file, they can access the translation function via closure or props.

---

## Ordered Implementation Tasks

### Task 1: Add Translation Keys to Message Files
**Priority**: Required
**Estimated Strings**: ~50

1. Add the `workflow.previewSaveStep` namespace structure to `/messages/en.json`
2. Include all identified strings with proper nesting
3. Use ICU message format for pluralization and interpolation

### Task 2: Update PreviewSaveStep Main Component
**Priority**: Required
**Files**: 1

1. Import `useTranslations` from `next-intl`
2. Initialize translations with `const t = useTranslations('workflow')`
3. Replace main heading "Preview & Save" with `t('previewSaveStep.heading')`
4. Replace back button aria-label with `t('buttons.goBack')`

### Task 3: Update EmptyContentState Sub-Component
**Priority**: Required

1. Accept translation function as prop or access via closure
2. Replace "No content added yet" with translation key
3. Replace "Add Content" button label with translation key

### Task 4: Update ItemDetailsDisplay Sub-Component
**Priority**: Required

1. Replace "Room" label with translation key
2. Replace "Item Type" label with translation key

### Task 5: Update ItemDetailsSection Sub-Component
**Priority**: Required

1. Replace section aria-label with translation key
2. Replace all form field labels with translation keys
3. Replace all placeholder text with translation keys
4. Update ItemNameEditor integration to pass/use translations

### Task 6: Update ContentSection Sub-Component
**Priority**: Required

1. Replace "Content" heading with translation key
2. Replace content count aria-label with translation key using pluralization
3. Replace "Maximum reached" indicator with translation key
4. Replace content list aria-label with translation key
5. Replace "Add More" link text with translation key

### Task 7: Update Drag-and-Drop Announcements
**Priority**: Required

1. Update `announcements` object to use translation function
2. Replace all announcement strings with translation keys
3. Ensure proper interpolation for `{type}`, `{position}`, `{total}` values

### Task 8: Update Save Button States
**Priority**: Required

1. Replace "Saving..." with translation key
2. Replace "Save Item" with translation key

### Task 9: Update SuccessOverlay Sub-Component
**Priority**: Required

1. Replace "Item Saved!" heading with translation key
2. Replace success description with translation key
3. Replace QR code alt text with translation key using interpolation
4. Replace "Continue" button label with translation key

### Task 10: Update Error Handling
**Priority**: Required

1. Replace save error message with translation key
2. Replace "Dismiss" button with translation key
3. Replace guard state message with translation key
4. Replace guard state "Go Back" button with translation key

### Task 11: Update Confirmation Dialog
**Priority**: Required

1. Replace dialog heading with translation key
2. Replace dialog message with translation key
3. Replace "Keep" and "Remove" button labels with translation keys

### Task 12: Update Screen Reader Announcements
**Priority**: Required

1. Replace save success announcement with translation key
2. Replace error announcement with translation key using interpolation

### Task 13: Update ItemNameEditor Component (Optional - may be separate task)
**Priority**: Medium
**File**: `/src/components/ItemCreationWorkflow/components/shared/ItemNameEditor.tsx`

1. Add translation prop to ItemNameEditorProps
2. Replace "Item Name" label with translation
3. Replace default placeholder with translation
4. Replace hint text with translation

### Task 14: Update TagsEditor Component (Optional - may be separate task)
**Priority**: Medium
**File**: `/src/components/ItemCreationWorkflow/components/shared/TagsEditor.tsx`

1. Add translation prop to TagsEditorProps
2. Replace aria-labels with translations
3. Replace "Add Tag" button text with translation

### Task 15: Generate Non-English Translations
**Priority**: Required
**Files**: 5

Generate translations for all new keys in:
- French (`fr.json`)
- Spanish (`es.json`)
- German (`de.json`)
- Dutch (`nl.json`)
- Italian (`it.json`)

### Task 16: Testing and Validation
**Priority**: Required

1. Verify all strings render correctly in each language
2. Test layout with longer translations (German, French tend to be ~40% longer)
3. Verify drag-and-drop screen reader announcements work in all languages
4. Test success overlay displays correctly with translated text
5. Verify confirmation dialog displays correctly in all languages
6. Test error states display translated messages
7. Verify no missing translation warnings in console
8. Run existing unit tests and update as needed

---

## Authorized Files and Functions for Modification

### Primary Component File

| File Path | Authorized Functions/Sections |
|-----------|-------------------------------|
| `/src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx` | All content - `PreviewSaveStep` main component, `EmptyContentState`, `ItemDetailsDisplay`, `ItemDetailsSection`, `ContentSection`, `SuccessOverlay` sub-components, `announcements` object |

### Related Shared Components

| File Path | Authorized Functions/Sections |
|-----------|-------------------------------|
| `/src/components/ItemCreationWorkflow/components/shared/ItemNameEditor.tsx` | `ItemNameEditorProps` interface, `ItemNameEditor` component, label, placeholder, hint text |
| `/src/components/ItemCreationWorkflow/components/shared/TagsEditor.tsx` | `TagsEditorProps` interface, `TagChip` component, `TagsEditor` component, aria-labels, button labels |
| `/src/components/ItemCreationWorkflow/components/shared/index.ts` | Export statements if type updates needed |

### Translation Files

| File Path | Authorized Sections |
|-----------|---------------------|
| `/messages/en.json` | Add `workflow.previewSaveStep` namespace with all sub-keys |
| `/messages/fr.json` | Add corresponding namespace with French translations |
| `/messages/es.json` | Add corresponding namespace with Spanish translations |
| `/messages/de.json` | Add corresponding namespace with German translations |
| `/messages/nl.json` | Add corresponding namespace with Dutch translations |
| `/messages/it.json` | Add corresponding namespace with Italian translations |

### Type Definition Files

| File Path | Authorized Sections |
|-----------|---------------------|
| `/src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` | Add translation-related types if needed |

### Test Files

| File Path | Authorized Sections |
|-----------|---------------------|
| `/src/components/ItemCreationWorkflow/components/steps/__tests__/PreviewSaveStep.test.tsx` | Update mocks for translation function |
| `/src/components/ItemCreationWorkflow/components/steps/__tests__/PreviewSaveStep.a11y.test.tsx` | Update mocks, verify translated aria-labels |
| `/src/components/ItemCreationWorkflow/components/steps/__tests__/PreviewSaveStep.reorder.test.tsx` | Update mocks for drag-drop announcements |
| `/src/components/ItemCreationWorkflow/components/shared/__tests__/ItemNameEditor.test.tsx` | Update mocks if component modified |

---

## Dependencies

### From Epic 1 (Must Be Complete)
- next-intl package installed and configured
- IntlProvider wrapper in app layout
- Translation files structure in `/messages/`
- `useTranslations` hook available

### Component Dependencies
- PreviewSaveStep depends on shared components: ItemNameEditor, TagsEditor, ContentPieceCard, SortableContentPieceCard
- Uses dnd-kit for drag-and-drop functionality
- Uses constants from `../../utils/constants.ts` (ROOM_LABELS, ITEM_TYPE_LABELS, PURPOSE_LABELS)

---

## Acceptance Criteria

From REQ-379:

**Import and Hook Setup**
- [ ] The PreviewSaveStep component imports the `useTranslations` hook from next-intl
- [ ] The workflow namespace is loaded using `useTranslations('workflow')`

**Main Component & Navigation**
- [ ] The main step heading "Preview & Save" uses a translation key from `workflow.previewSaveStep.heading`
- [ ] The back button aria-label uses a translation key from `workflow.buttons.goBack`

**Item Details Section**
- [ ] ItemDetailsSection section aria-label uses a translation key from `workflow.previewSaveStep.itemDetails.sectionLabel`
- [ ] "Item Name" label uses a translation key from `workflow.previewSaveStep.itemDetails.labels.itemName`
- [ ] Item name placeholder uses a translation key from `workflow.previewSaveStep.itemDetails.placeholders.itemName`
- [ ] "Item Description" label uses a translation key from `workflow.previewSaveStep.itemDetails.labels.itemDescription`
- [ ] Item description placeholder uses a translation key from `workflow.previewSaveStep.itemDetails.placeholders.itemDescription`
- [ ] "Room" label uses a translation key from `workflow.previewSaveStep.itemDetails.labels.room`
- [ ] "Item Type" label uses a translation key from `workflow.previewSaveStep.itemDetails.labels.itemType`
- [ ] "Guide/Article Title" label uses a translation key from `workflow.previewSaveStep.itemDetails.labels.articleTitle`
- [ ] Article title placeholder uses a translation key from `workflow.previewSaveStep.itemDetails.placeholders.articleTitle`
- [ ] "Tags" label uses a translation key from `workflow.previewSaveStep.itemDetails.labels.tags`

**Content Section**
- [ ] ContentSection heading "Content" uses a translation key from `workflow.previewSaveStep.content.heading`
- [ ] Content count aria-label uses a translation key from `workflow.previewSaveStep.content.countLabel` with count interpolation
- [ ] "Maximum reached" indicator uses a translation key from `workflow.previewSaveStep.content.maxReached`
- [ ] "No content added yet" message uses a translation key from `workflow.previewSaveStep.content.emptyState`
- [ ] "Add Content" button in empty state uses a translation key from `workflow.previewSaveStep.content.buttons.addContent`
- [ ] "+ Add More" link uses a translation key from `workflow.previewSaveStep.content.buttons.addMore`
- [ ] Content list aria-label uses a translation key from `workflow.previewSaveStep.dragDrop.contentListLabel`

**Drag-and-Drop Announcements**
- [ ] Drag start announcement uses a translation key from `workflow.previewSaveStep.dragDrop.announcements.pickedUp` with type, position, and total interpolation
- [ ] Drag over announcement uses a translation key from `workflow.previewSaveStep.dragDrop.announcements.overPosition` with position interpolation
- [ ] Drag end announcement uses a translation key from `workflow.previewSaveStep.dragDrop.announcements.dropped` with type and position interpolation
- [ ] Drag unchanged announcement uses a translation key from `workflow.previewSaveStep.dragDrop.announcements.unchanged`
- [ ] Drag cancelled announcement uses a translation key from `workflow.previewSaveStep.dragDrop.announcements.cancelled`

**Save Operation**
- [ ] "Save Item" button label uses a translation key from `workflow.previewSaveStep.buttons.save`
- [ ] "Saving..." button label uses a translation key from `workflow.previewSaveStep.buttons.saving`

**Success Overlay**
- [ ] Success overlay heading "Item Saved!" uses a translation key from `workflow.previewSaveStep.success.heading`
- [ ] Success overlay description uses a translation key from `workflow.previewSaveStep.success.description`
- [ ] QR code alt text uses a translation key from `workflow.previewSaveStep.success.qrCodeAlt` with item name interpolation
- [ ] Success overlay "Continue" button uses a translation key from `workflow.previewSaveStep.success.buttons.continue`

**Confirmation Dialog**
- [ ] Confirmation dialog heading "Remove Last Content?" uses a translation key from `workflow.previewSaveStep.confirmRemove.heading`
- [ ] Confirmation dialog message uses a translation key from `workflow.previewSaveStep.confirmRemove.message`
- [ ] Confirmation dialog "Keep" button uses a translation key from `workflow.previewSaveStep.confirmRemove.buttons.keep`
- [ ] Confirmation dialog "Remove" button uses a translation key from `workflow.previewSaveStep.confirmRemove.buttons.remove`

**Error Handling**
- [ ] Save error message uses a translation key from `workflow.previewSaveStep.errors.saveFailed`
- [ ] "Dismiss" button uses a translation key from `workflow.buttons.dismiss`
- [ ] No data guard message uses a translation key from `workflow.previewSaveStep.errors.noData`
- [ ] "Go Back" button in guard state uses a translation key from `workflow.buttons.goBack`

**Screen Reader Announcements**
- [ ] Save success screen reader announcement uses a translation key from `workflow.previewSaveStep.announcements.saveSuccess`
- [ ] Save error screen reader announcement uses a translation key from `workflow.previewSaveStep.announcements.saveError` with error interpolation

**Quality Checks**
- [ ] No hardcoded English strings remain in the PreviewSaveStep component JSX or logic
- [ ] No hardcoded English strings remain in sub-components: EmptyContentState, ItemDetailsDisplay, ItemDetailsSection, ContentSection, SuccessOverlay
- [ ] The component maintains its form editing functionality regardless of language
- [ ] Item name editing with onChange callback works correctly with translated labels
- [ ] Item description editing works correctly with translated labels and placeholders
- [ ] Article title editing works correctly with translated labels and placeholders
- [ ] Room and item type dropdown selection works correctly with translated labels
- [ ] Tags editing using TagsEditor component works correctly with translated label
- [ ] Drag-and-drop content reordering functions identically across all languages
- [ ] DndKit sensors (pointer, touch, keyboard) work correctly with translated announcements
- [ ] Content piece removal with confirmation dialog functions correctly with translated text
- [ ] Save operation handling and error display work correctly with translated messages
- [ ] Success overlay display with QR code shows correctly with translated text
- [ ] Guard condition rendering for null currentItem works correctly with translated message
- [ ] Maximum content piece limit enforcement displays correctly with translated indicator
- [ ] Empty content state rendering and "Add Content" action work correctly with translated text
- [ ] Screen reader live region announcements function correctly in all languages

**Layout and Visual**
- [ ] The component displays correctly in all six supported languages without text overflow or layout breaks
- [ ] Form labels maintain consistent alignment and spacing despite translation length variations
- [ ] Longer translated placeholders in languages like German or French do not cause input field overflow
- [ ] Success overlay heading and description display correctly without text clipping in all languages
- [ ] Confirmation dialog message displays correctly in modal without overflow in all languages
- [ ] Button labels maintain consistent sizing with translated text of varying lengths
- [ ] Content section heading with count badge displays correctly across all languages
- [ ] Drag-and-drop announcements for screen readers handle long translated strings gracefully
- [ ] QR code display and label in success overlay maintain proper alignment with translated text
- [ ] Error message display adapts correctly to translated message lengths in all languages

**Technical**
- [ ] Console shows no missing translation warnings when the component is viewed in English
- [ ] Accessibility testing with screen readers confirms form labels, buttons, and announcements read correctly in each language
- [ ] The component gracefully handles missing translation keys without crashing
- [ ] TypeScript types correctly reflect the translation key structure for type-safe t() calls

**Testing**
- [ ] Existing unit tests for PreviewSaveStep pass or are updated to accommodate translation function calls
- [ ] Integration tests confirm save flow works correctly in all six languages
- [ ] Manual testing in all six languages confirms successful item preview, editing, and save operations
- [ ] Drag-and-drop testing confirms reordering works correctly with translated announcements in all languages
- [ ] Confirmation dialog testing confirms last content removal warning displays correctly in all languages
- [ ] Success overlay testing confirms QR code display and translated success message appear correctly in all languages
- [ ] Error scenario testing confirms save failures display translated error messages correctly
- [ ] Guard condition testing confirms null currentItem state displays translated fallback message
- [ ] Form validation testing confirms required field checks work correctly with translated labels
- [ ] Screen reader testing confirms all announcements occur in the user's selected language
- [ ] Visual regression testing confirms consistent layout across all languages and viewport sizes

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Complex sub-component structure | Medium | Low | All sub-components are in same file, can share t() via closure |
| Drag-drop announcement timing | Low | Medium | Test extensively with screen readers, maintain existing timing |
| Layout breaks with long translations | Medium | Medium | Test with German (40% longer), use flexible CSS already in place |
| Missing translations at runtime | Low | High | Implement fallback to English, add build-time checks |
| Success overlay text overflow | Medium | Medium | Success overlay has max-width, test with all languages |
| Confirmation dialog text wrapping | Medium | Low | Dialog already uses flexible width, verify with long messages |
| ItemNameEditor/TagsEditor coupling | Low | Low | Can update shared components with optional translation props |

---

## Estimated Effort

| Task | Strings | Complexity | Estimate |
|------|---------|------------|----------|
| Task 1: Translation Keys | ~50 | Low | 45 min |
| Tasks 2-12: Component Updates | ~50 | Medium | 3 hours |
| Task 13-14: Shared Components | ~8 | Low | 30 min |
| Task 15: Non-English Translations | ~250 total | Medium | 1.5 hours |
| Task 16: Testing | N/A | Medium | 2 hours |
| **Total** | **~50 unique** | **Medium** | **~8 hours** |

---

## References

- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [Request Document](/docs/gen_requests_epic2.md) - REQ-379
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)
- [dnd-kit Accessibility](https://docs.dndkit.com/guides/accessibility)
- [Previous PreviewSaveStep Implementation](/docs/REQ-210-update-previewsavestep-display-overview.md)

---

*Document generated for FAQBNB Localization Epic 2, Sub-Epic 2C - Item Creation Workflow, Task 2C.9*
