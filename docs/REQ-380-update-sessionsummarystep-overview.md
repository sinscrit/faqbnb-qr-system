# REQ-380: Update SessionSummaryStep Component for Internationalization

**Document Created**: 2026-01-19 17:00 UTC
**Last Modified**: 2026-01-19 17:00 UTC
**Type**: ENHANCEMENT
**Size**: S (Small)
**Epic**: Epic 2 - Static UI Translation
**Sub-Epic**: 2C - Item Creation Workflow
**Task ID**: 2C.10

---

## Summary

The SessionSummaryStep component must display all user-facing text in the user's selected language by implementing next-intl translations. This includes the main heading, section titles, empty state messages, item count displays, action button labels, collapsible section headers, and screen reader announcements. SessionSummaryStep is the final step (Step 9) of the item creation workflow where users review all items created in their session before proceeding to print or finishing.

---

## Current State Analysis

### SessionSummaryStep.tsx (Main Component)
**Location**: `/src/components/ItemCreationWorkflow/components/steps/SessionSummaryStep.tsx`
**Lines**: ~351
**Estimated Strings**: ~20

The SessionSummaryStep component is composed of:
- **EmptySessionState** - Sub-component for when no items have been created
- **LoadingSkeleton** - Sub-component for loading state (no visible strings)
- **Main Component** - Session summary with collapsible sections and action buttons

### Hardcoded Strings Identified

#### Main Component Header
1. `"Session Summary"` - Main step heading (line 176)
2. `"Review your items before printing"` - Subtitle description (line 177-178)

#### EmptySessionState Sub-Component
3. `"No items yet"` - Empty state heading (line 80-81)
4. `"You haven't created any items in this session yet. Start by adding your first item."` - Empty state description (line 83-84)
5. `"Add First Item"` - Empty state button label (line 99)

#### New Items Section
6. `"New Items in This Session ({sessionItems.length})"` - Section heading with count (line 192-193)
7. `"Add More Items"` - Add more items button label (line 229)

#### Previously Created Items Section (Collapsible)
8. `"Previously Created Items ({existingItems.length})"` - Collapsible section heading with count (line 259)

#### Action Buttons (Sticky Footer)
9. `"Print QR Codes"` - Print button label (line 310)
10. `"Skip & Finish"` - Skip/finish button label (line 330)

#### Screen Reader Announcements
11. `"Step: Session Summary - {sessionItems.length} items created in this session."` - Live region announcement (line 344)

### Related Shared Component Files

These shared components are used by SessionSummaryStep and contain additional hardcoded strings:

#### SessionProgressBar.tsx
**Location**: `/src/components/ItemCreationWorkflow/components/shared/SessionProgressBar.tsx`
1. `"Session progress: {itemsCreated} items created"` - Progress bar aria-label (line 65)
2. `"{itemsCreated} items created"` - Count text display (line 80)

#### SessionItemCard.tsx
**Location**: `/src/components/ItemCreationWorkflow/components/shared/SessionItemCard.tsx`
1. `"No content"` - Zero content label (line 201)
2. `"1 content piece"` - Singular content label (line 202)
3. `"{count} content pieces"` - Plural content label (line 203)
4. `"Item photo"` - Photo alt text (line 122)
5. `"{item.name} - {contentCountLabel}"` - Item card aria-label (line 247)
6. `"Room: {roomLabel}"` - Room badge aria-label (line 280)
7. `"Edit {item.name}"` - Edit button aria-label (line 303)
8. `"Remove {item.name}"` - Remove button aria-label (line 323)

#### RemoveItemDialog.tsx
**Location**: `/src/components/ItemCreationWorkflow/components/shared/RemoveItemDialog.tsx`
1. `"Remove Item?"` - Dialog heading (line 123)
2. `"Are you sure you want to remove \"{displayName}\"? This action cannot be undone."` - Dialog message (line 129)
3. `"Cancel"` - Cancel button label (line 150)
4. `"Remove"` - Remove/confirm button label (line 167)

---

## Implementation Approach

### Translation Key Structure

Following the implementation plan's namespace convention, add to the `workflow` namespace:

```json
{
  "workflow": {
    "sessionSummary": {
      "heading": "Session Summary",
      "subtitle": "Review your items before printing",
      "emptyState": {
        "heading": "No items yet",
        "description": "You haven't created any items in this session yet. Start by adding your first item.",
        "button": "Add First Item"
      },
      "sections": {
        "newItems": "New Items in This Session ({count})",
        "existingItems": "Previously Created Items ({count})"
      },
      "buttons": {
        "addMore": "Add More Items",
        "printQrCodes": "Print QR Codes",
        "skipFinish": "Skip & Finish"
      },
      "announcements": {
        "stepSummary": "Step: Session Summary - {count, plural, =0 {no items} one {# item} other {# items}} created in this session."
      }
    },
    "sessionProgress": {
      "ariaLabel": "Session progress: {count, plural, =0 {no items} one {# item} other {# items}} created",
      "countText": "{count, plural, =0 {no items} one {# item} other {# items}} created"
    },
    "sessionItemCard": {
      "contentCount": {
        "none": "No content",
        "count": "{count, plural, one {# content piece} other {# content pieces}}"
      },
      "photoAlt": "Item photo",
      "ariaLabel": "{name} - {contentLabel}",
      "roomLabel": "Room: {room}",
      "editButton": "Edit {name}",
      "removeButton": "Remove {name}"
    },
    "removeItemDialog": {
      "heading": "Remove Item?",
      "message": "Are you sure you want to remove \"{name}\"? This action cannot be undone.",
      "buttons": {
        "cancel": "Cancel",
        "remove": "Remove"
      }
    }
  }
}
```

### Component Update Pattern

```typescript
import { useTranslations } from 'next-intl';

export function SessionSummaryStep({ ... }: SessionSummaryStepProps) {
  const t = useTranslations('workflow');

  return (
    <>
      <h2>{t('sessionSummary.heading')}</h2>
      <p>{t('sessionSummary.subtitle')}</p>
      {/* ... */}
    </>
  );
}
```

For sub-components in the same file, access the translation function via closure or props.

---

## Ordered Implementation Tasks

### Task 1: Add Translation Keys to Message Files
**Priority**: Required
**Estimated Strings**: ~20 (main) + ~15 (shared)

1. Add the `workflow.sessionSummary` namespace structure to `/messages/en.json`
2. Add the `workflow.sessionProgress` namespace for SessionProgressBar
3. Add the `workflow.sessionItemCard` namespace for SessionItemCard
4. Add the `workflow.removeItemDialog` namespace for RemoveItemDialog
5. Use ICU message format for pluralization and interpolation

### Task 2: Update SessionSummaryStep Main Component
**Priority**: Required
**Files**: 1

1. Import `useTranslations` from `next-intl`
2. Initialize translations with `const t = useTranslations('workflow')`
3. Replace "Session Summary" heading with `t('sessionSummary.heading')`
4. Replace subtitle with `t('sessionSummary.subtitle')`
5. Replace section headings with translation keys using count interpolation
6. Replace action button labels with translation keys

### Task 3: Update EmptySessionState Sub-Component
**Priority**: Required

1. Accept translation function as prop or access via closure
2. Replace "No items yet" heading with translation key
3. Replace description text with translation key
4. Replace "Add First Item" button label with translation key

### Task 4: Update Screen Reader Announcements
**Priority**: Required

1. Replace live region text with translation key using pluralization
2. Ensure proper interpolation for count values

### Task 5: Update SessionProgressBar Component
**Priority**: Required
**File**: `/src/components/ItemCreationWorkflow/components/shared/SessionProgressBar.tsx`

1. Import `useTranslations` from `next-intl`
2. Replace aria-label with translation key using pluralization
3. Replace count text display with translation key using pluralization

### Task 6: Update SessionItemCard Component
**Priority**: Required
**File**: `/src/components/ItemCreationWorkflow/components/shared/SessionItemCard.tsx`

1. Import `useTranslations` from `next-intl`
2. Replace `getContentCountLabel` function to use translations
3. Replace item card aria-label with translation key
4. Replace room badge aria-label with translation key
5. Replace edit button aria-label with translation key
6. Replace remove button aria-label with translation key
7. Replace photo alt text with translation key

### Task 7: Update RemoveItemDialog Component
**Priority**: Required
**File**: `/src/components/ItemCreationWorkflow/components/shared/RemoveItemDialog.tsx`

1. Import `useTranslations` from `next-intl`
2. Replace "Remove Item?" heading with translation key
3. Replace confirmation message with translation key using name interpolation
4. Replace "Cancel" button label with translation key
5. Replace "Remove" button label with translation key

### Task 8: Generate Non-English Translations
**Priority**: Required
**Files**: 5

Generate translations for all new keys in:
- French (`fr.json`)
- Spanish (`es.json`)
- German (`de.json`)
- Dutch (`nl.json`)
- Italian (`it.json`)

### Task 9: Testing and Validation
**Priority**: Required

1. Verify all strings render correctly in each language
2. Test layout with longer translations (German, French tend to be ~40% longer)
3. Test collapsible section behavior with translated headers
4. Verify empty state displays correctly in all languages
5. Test action buttons display correctly without text overflow
6. Verify remove dialog displays correctly with long translated item names
7. Verify screen reader announcements work in all languages
8. Verify no missing translation warnings in console
9. Run existing unit tests and update as needed

---

## Authorized Files and Functions for Modification

### Primary Component File

| File Path | Authorized Functions/Sections |
|-----------|-------------------------------|
| `/src/components/ItemCreationWorkflow/components/steps/SessionSummaryStep.tsx` | All content - `SessionSummaryStep` main component, `EmptySessionState` sub-component, `LoadingSkeleton` (no changes needed), all JSX text content, aria-labels |

### Related Shared Components

| File Path | Authorized Functions/Sections |
|-----------|-------------------------------|
| `/src/components/ItemCreationWorkflow/components/shared/SessionProgressBar.tsx` | `SessionProgressBar` component, aria-label, count text display |
| `/src/components/ItemCreationWorkflow/components/shared/SessionItemCard.tsx` | `SessionItemCard` component, `getContentCountLabel` function, all aria-labels, alt text |
| `/src/components/ItemCreationWorkflow/components/shared/RemoveItemDialog.tsx` | `RemoveItemDialog` component, dialog heading, message, button labels |
| `/src/components/ItemCreationWorkflow/components/shared/index.ts` | Export statements if type updates needed |

### Translation Files

| File Path | Authorized Sections |
|-----------|---------------------|
| `/messages/en.json` | Add `workflow.sessionSummary`, `workflow.sessionProgress`, `workflow.sessionItemCard`, `workflow.removeItemDialog` namespaces |
| `/messages/fr.json` | Add corresponding namespaces with French translations |
| `/messages/es.json` | Add corresponding namespaces with Spanish translations |
| `/messages/de.json` | Add corresponding namespaces with German translations |
| `/messages/nl.json` | Add corresponding namespaces with Dutch translations |
| `/messages/it.json` | Add corresponding namespaces with Italian translations |

### Type Definition Files

| File Path | Authorized Sections |
|-----------|---------------------|
| `/src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` | Add translation-related types if needed |

### Test Files

| File Path | Authorized Sections |
|-----------|---------------------|
| `/src/components/ItemCreationWorkflow/components/steps/__tests__/SessionSummaryStep.test.tsx` | Update mocks for translation function |
| `/src/components/ItemCreationWorkflow/components/shared/__tests__/SessionProgressBar.test.tsx` | Update mocks if exists |
| `/src/components/ItemCreationWorkflow/components/shared/__tests__/SessionItemCard.test.tsx` | Update mocks if exists |
| `/src/components/ItemCreationWorkflow/components/shared/__tests__/RemoveItemDialog.test.tsx` | Update mocks if exists |

---

## Dependencies

### From Epic 1 (Must Be Complete)
- next-intl package installed and configured
- IntlProvider wrapper in app layout
- Translation files structure in `/messages/`
- `useTranslations` hook available

### Component Dependencies
- SessionSummaryStep depends on shared components: SessionProgressBar, SessionItemCard, RemoveItemDialog
- Uses Radix UI Collapsible for expandable sections
- Uses Lucide React icons

---

## Acceptance Criteria

From REQ-380:

**Import and Hook Setup**
- [ ] The SessionSummaryStep component imports the `useTranslations` hook from next-intl
- [ ] The workflow namespace is loaded using `useTranslations('workflow')`

**Main Heading and Subtitle**
- [ ] The main heading "Session Summary" uses a translation key from `workflow.sessionSummary.heading`
- [ ] The introductory message "Review your items before printing" uses `workflow.sessionSummary.subtitle`

**Empty State**
- [ ] "No items yet" heading uses a translation key from `workflow.sessionSummary.emptyState.heading`
- [ ] Empty state description uses a translation key from `workflow.sessionSummary.emptyState.description`
- [ ] "Add First Item" button uses a translation key from `workflow.sessionSummary.emptyState.button`

**Section Headers**
- [ ] "New Items in This Session" section heading uses a translation key from `workflow.sessionSummary.sections.newItems` with count interpolation
- [ ] "Previously Created Items" collapsible heading uses a translation key from `workflow.sessionSummary.sections.existingItems` with count interpolation

**Action Buttons**
- [ ] "Add More Items" button uses a translation key from `workflow.sessionSummary.buttons.addMore`
- [ ] "Print QR Codes" button uses a translation key from `workflow.sessionSummary.buttons.printQrCodes`
- [ ] "Skip & Finish" button uses a translation key from `workflow.sessionSummary.buttons.skipFinish`

**Screen Reader Announcements**
- [ ] Live region announcement uses a translation key from `workflow.sessionSummary.announcements.stepSummary` with count interpolation and pluralization

**SessionProgressBar Component**
- [ ] Progress bar aria-label uses a translation key from `workflow.sessionProgress.ariaLabel` with pluralization
- [ ] Count text display uses a translation key from `workflow.sessionProgress.countText` with pluralization

**SessionItemCard Component**
- [ ] Content count labels use translation keys from `workflow.sessionItemCard.contentCount` with pluralization
- [ ] Item card aria-label uses a translation key from `workflow.sessionItemCard.ariaLabel`
- [ ] Room badge aria-label uses a translation key from `workflow.sessionItemCard.roomLabel`
- [ ] Edit button aria-label uses a translation key from `workflow.sessionItemCard.editButton`
- [ ] Remove button aria-label uses a translation key from `workflow.sessionItemCard.removeButton`

**RemoveItemDialog Component**
- [ ] Dialog heading "Remove Item?" uses a translation key from `workflow.removeItemDialog.heading`
- [ ] Confirmation message uses a translation key from `workflow.removeItemDialog.message` with name interpolation
- [ ] "Cancel" button uses a translation key from `workflow.removeItemDialog.buttons.cancel`
- [ ] "Remove" button uses a translation key from `workflow.removeItemDialog.buttons.remove`

**Quality Checks**
- [ ] No hardcoded English strings remain in the SessionSummaryStep component
- [ ] No hardcoded English strings remain in related shared components
- [ ] The component maintains its display functionality regardless of language
- [ ] Navigation to add more items works correctly with translated button
- [ ] Navigation to print works correctly with translated button
- [ ] Skip and finish navigation works correctly with translated button
- [ ] Item details display correctly with translated labels in all six supported languages
- [ ] Collapsible sections expand/collapse correctly with translated headers
- [ ] Button labels maintain consistent sizing with translated text of varying lengths
- [ ] Console shows no missing translation warnings when the component is viewed in English
- [ ] The component gracefully handles missing translation keys without crashing
- [ ] Existing tests pass or are updated to accommodate translation function calls
- [ ] Manual testing in all six languages confirms correct display and navigation functionality

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Section header text overflow with count | Low | Low | Use flexible layout, test with larger counts |
| Layout breaks with long translations | Medium | Medium | Test with German (40% longer), use existing flexible CSS |
| Missing translations at runtime | Low | High | Implement fallback to English, add build-time checks |
| Shared component prop changes | Low | Low | Components can use their own useTranslations hook |
| Pluralization complexity | Low | Medium | Use ICU format consistently, test all count scenarios |
| RemoveItemDialog text wrapping | Medium | Low | Dialog already uses max-width, verify with long names |

---

## Estimated Effort

| Task | Strings | Complexity | Estimate |
|------|---------|------------|----------|
| Task 1: Translation Keys | ~35 | Low | 30 min |
| Tasks 2-4: SessionSummaryStep | ~12 | Low | 1 hour |
| Task 5: SessionProgressBar | ~2 | Low | 20 min |
| Task 6: SessionItemCard | ~8 | Medium | 45 min |
| Task 7: RemoveItemDialog | ~4 | Low | 20 min |
| Task 8: Non-English Translations | ~175 total | Medium | 1 hour |
| Task 9: Testing | N/A | Low | 1 hour |
| **Total** | **~35 unique** | **Low-Medium** | **~5 hours** |

---

## References

- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [Request Document](/docs/gen_requests_epic2.md) - REQ-380
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)
- [Previous PreviewSaveStep Implementation](/docs/REQ-379-update-previewsavestep-overview.md)
- [Radix UI Collapsible](https://www.radix-ui.com/primitives/docs/components/collapsible)

---

*Document generated for FAQBNB Localization Epic 2, Sub-Epic 2C - Item Creation Workflow, Task 2C.10*
