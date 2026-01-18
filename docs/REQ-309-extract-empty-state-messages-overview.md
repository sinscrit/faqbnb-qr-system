# REQ-309: Extract Empty State Messages for Internationalization - Implementation Overview

**Document Created:** 2026-01-18
**Last Modified:** 2026-01-18
**Request ID:** REQ-309
**Sub-Epic:** 2H - Common & Shared Components
**Task ID:** 2H.6
**Type:** ENHANCEMENT
**Size:** M (Medium)
**Priority:** High (Foundation task for other sub-epics)

---

## 1. Summary

This document provides a technical implementation breakdown for extracting all empty state messages from hardcoded strings throughout the FAQBNB application and replacing them with translation keys using the `next-intl` framework. Empty states appear when users encounter sections with no data, and translating these messages is essential for providing a consistent, localized user experience.

---

## 2. Reference Documents

| Document | Location |
|----------|----------|
| Request Source | `/docs/gen_requests_epic2.md` - Request #309 |
| Implementation Plan | `/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md` |
| Epic 1 Foundation Plan | `/docs/prd/Plan-110-L10N-Epic1-Foundation.md` |
| Airbnb Design System | `/docs/prd/airbnb_designsystem.md` |

---

## 3. Prerequisites

This task depends on **Epic 1** being complete:

| Dependency | Status | Required For |
|------------|--------|--------------|
| `next-intl` package installed | Epic 1 | Translation framework |
| `IntlProvider` in root layout | Epic 1 | Context provider |
| `/messages/en.json` structure | Epic 1 | English translations |
| `useTranslations` hook | Epic 1 | Client component translations |
| `getTranslations` function | Epic 1 | Server component translations |

**Note:** Task 2H.1 (Create common namespace structure) should be completed before this task.

---

## 4. Current State Analysis

### 4.1 Existing Empty State Components

The codebase has **3 reusable empty state components**:

| Component | Location | Description |
|-----------|----------|-------------|
| `EmptyState` | `/src/components/ItemManager/components/shared/EmptyState.tsx` | Generic component with default messages |
| `EmptyStateCard` | `/src/components/SimpleDashboard/EmptyStateCard.tsx` | Styled variant with Airbnb design system |
| `EmptySessionDialog` | `/src/components/ItemCreationWorkflow/components/shared/EmptySessionDialog.tsx` | Modal dialog with hardcoded text |

### 4.2 Empty State Message Patterns

Empty state messages follow these patterns:

1. **Primary Message (Title)**: Brief description of empty state (e.g., "No items yet")
2. **Secondary Message (Description)**: Guidance or context (e.g., "Create your first item to get started")
3. **Action Label**: CTA button text (e.g., "Add Item", "Create Item")
4. **Search Feedback**: Dynamic search-related messages (e.g., "No items match your search")

### 4.3 Hardcoded Strings Inventory

**Total Estimated Strings:** ~80 empty state strings across ~30+ component files

#### Primary Empty State Messages:
| String | Occurrences | Context |
|--------|-------------|---------|
| `'No items yet'` | 5+ | Items/session/lists |
| `'No items found'` | 4+ | Search results |
| `'No properties found'` | 3+ | Property lists |
| `'No properties available'` | 2+ | Property selection |
| `'No guides found'` | 2+ | Guide/instructions lists |
| `'No reactions yet'` | 2+ | Analytics |
| `'No rooms available'` | 1 | Room selection |
| `'No data available'` | 2+ | Generic fallback |
| `'No results found'` | 2+ | Search/filter results |

#### Secondary/Description Messages:
| String | Context |
|--------|---------|
| `'Create your first item to get started'` | Initial item creation |
| `'Get started by creating your first property'` | Property onboarding |
| `'Get started by creating your first item'` | Item onboarding |
| `'Try adjusting your search or filters'` | Search/filter help |
| `'Try adjusting your search terms'` | Search help |
| `'No items added yet. Add items or exit session?'` | Session workflow |
| `'Reaction data will appear here once users start interacting...'` | Analytics |
| `'You haven't created any items in this session yet...'` | Session summary |
| `'⚠️ No properties available. Please create a property first...'` | Item form warning |

#### Dynamic/Parameterized Messages:
| Pattern | Example |
|---------|---------|
| `No items match "{searchTerm}"` | Search with term |
| `No items match your search for "{searchTerm}"` | Detailed search |
| `No properties match your search criteria.` | Property search |

---

## 5. Translation Key Structure

### 5.1 Namespace: `common.empty`

Following the plan's convention of `{namespace}.{component/area}.{element}`:

```json
{
  "common": {
    "empty": {
      "noData": "No data available",
      "noResults": "No results found",
      "tryDifferentFilters": "Try adjusting your search or filters",
      "tryDifferentSearch": "Try adjusting your search terms",

      "items": {
        "title": "No items yet",
        "titleSearch": "No items found",
        "titleSearchWithTerm": "No items match \"{searchTerm}\"",
        "description": "Create your first item to get started",
        "descriptionOnboarding": "Get started by creating your first item",
        "noItemsSelected": "No items selected for QR code generation"
      },

      "properties": {
        "title": "No properties found",
        "titleSearch": "No properties match your search criteria",
        "description": "Get started by creating your first property",
        "notAvailable": "No properties available",
        "createFirst": "Please create a property first before adding items"
      },

      "guides": {
        "title": "No guides found",
        "titleSearch": "No guides match your search",
        "description": "Create your first guide to get started"
      },

      "rooms": {
        "title": "No rooms available",
        "description": "Add rooms to your property first"
      },

      "reactions": {
        "title": "No reactions yet",
        "description": "Reaction data will appear here once users start interacting with your content"
      },

      "session": {
        "title": "No Items Added",
        "description": "No items added yet. Add items or exit session?",
        "noItemsYet": "You haven't created any items in this session yet. Start by adding your first item.",
        "addItems": "Add Items",
        "exitSession": "Exit Session"
      },

      "tags": {
        "title": "No tags yet",
        "description": "Create tags to organize your items"
      }
    }
  }
}
```

### 5.2 ICU Message Format for Dynamic Content

For strings with variables:

```json
{
  "common": {
    "empty": {
      "items": {
        "titleSearchWithTerm": "No items match \"{searchTerm}\""
      }
    }
  }
}
```

Usage:
```tsx
t('empty.items.titleSearchWithTerm', { searchTerm: searchQuery })
```

---

## 6. Implementation Tasks

### Task 1: Add Empty State Translations to `/messages/en.json`

**Estimated Effort:** 0.5 hours

Add the `common.empty` namespace with all identified empty state strings to the English translation file.

### Task 2: Update `EmptyState.tsx` Component

**File:** `/src/components/ItemManager/components/shared/EmptyState.tsx`
**Estimated Effort:** 0.5 hours

**Changes Required:**
1. Import `useTranslations` from `next-intl`
2. Replace hardcoded `DEFAULT_TITLE` and `DEFAULT_DESCRIPTION` constants with translation keys
3. Update props to support translation key overrides

**Before:**
```tsx
const DEFAULT_TITLE = 'No items yet';
const DEFAULT_DESCRIPTION = 'Create your first item to get started';
```

**After:**
```tsx
import { useTranslations } from 'next-intl';

export function EmptyState({
  title,
  description,
  ...props
}: EmptyStateProps) {
  const t = useTranslations('common.empty');

  return (
    <div>
      <h3>{title ?? t('items.title')}</h3>
      <p>{description ?? t('items.description')}</p>
    </div>
  );
}
```

### Task 3: Update `EmptyStateCard.tsx` Component

**File:** `/src/components/SimpleDashboard/EmptyStateCard.tsx`
**Estimated Effort:** 0.25 hours

This component receives text via props, so update components that use it to pass translated strings.

### Task 4: Update `EmptySessionDialog.tsx` Component

**File:** `/src/components/ItemCreationWorkflow/components/shared/EmptySessionDialog.tsx`
**Estimated Effort:** 0.5 hours

**Changes Required:**
1. Import `useTranslations` from `next-intl`
2. Replace all hardcoded strings:
   - `"No Items Added"` → `t('session.title')`
   - `"No items added yet. Add items or exit session?"` → `t('session.description')`
   - `"Add Items"` → `t('session.addItems')`
   - `"Exit Session"` → `t('session.exitSession')`
   - `"Close dialog"` → Use common actions translation

### Task 5: Update Consumer Components with Inline Empty States

**Estimated Effort:** 3-4 hours

Update all components that display empty states inline (not using reusable components):

| Component | File | Strings to Extract |
|-----------|------|-------------------|
| `ItemsManagement` | `/src/components/ItemsManagement.tsx` | 4-6 strings |
| `PropertiesManagement` | `/src/components/PropertiesManagement.tsx` | 4-5 strings |
| `GuideGrid` | `/src/components/InstructionsTable/GuideGrid.tsx` | 2 strings |
| `ItemSelectionList` | `/src/components/ItemSelectionList.tsx` | 3-4 strings |
| `SessionSummaryStep` | `/src/components/ItemCreationWorkflow/components/steps/SessionSummaryStep.tsx` | 2 strings |
| `MetadataStep` | `/src/components/ItemCapture/components/steps/MetadataStep.tsx` | 1 string |
| `ReactionAnalytics` | `/src/components/ReactionAnalytics.tsx` | 2 strings |
| `QRCodePrintPreview` | `/src/components/QRCodePrintPreview.tsx` | 1 string |
| `PropertySelector` | `/src/components/PropertySelector.tsx` | 1 string |
| `PropertyDropdown` | `/src/components/PropertyDropdown.tsx` | 1 string |
| `BulkMoveDialog` | `/src/components/ItemManager/components/BulkActions/BulkMoveDialog.tsx` | 1 string |
| `AccessRequestTable` | `/src/components/AccessRequestTable.tsx` | 1 string |
| `UserAnalyticsTable` | `/src/components/UserAnalyticsTable.tsx` | 1 string |
| `AnalyticsManagement` | `/src/components/AnalyticsManagement.tsx` | 1 string |
| `ItemForm` | `/src/components/ItemForm.tsx` | 1 string |
| `ProgressivePropertySection` | `/src/components/SimpleDashboard/ProgressivePropertySection.tsx` | 1 string |

### Task 6: Handle Parameterized Empty States

**Estimated Effort:** 0.5 hours

For components using dynamic search terms, implement ICU message format:

**Example in `ItemSelectionList.tsx`:**
```tsx
// Before
{`No items match "${debouncedSearchTerm}"`}

// After
{t('items.titleSearchWithTerm', { searchTerm: debouncedSearchTerm })}
```

### Task 7: Verify and Test All Empty States

**Estimated Effort:** 1 hour

1. Navigate to each affected page/component
2. Trigger empty states (clear data, search for non-existent items)
3. Verify all text displays correctly
4. Test with different locales (when translations available)

---

## 7. Authorized Files and Functions for Modification

### 7.1 Translation Files (Create/Modify)

| File | Action | Description |
|------|--------|-------------|
| `/messages/en.json` | MODIFY | Add `common.empty` namespace |
| `/messages/fr.json` | MODIFY | Add French translations (Task 2H.10) |
| `/messages/es.json` | MODIFY | Add Spanish translations (Task 2H.10) |
| `/messages/de.json` | MODIFY | Add German translations (Task 2H.10) |
| `/messages/nl.json` | MODIFY | Add Dutch translations (Task 2H.10) |
| `/messages/it.json` | MODIFY | Add Italian translations (Task 2H.10) |

### 7.2 Reusable Empty State Components (MODIFY)

| File | Functions/Components to Modify |
|------|-------------------------------|
| `/src/components/ItemManager/components/shared/EmptyState.tsx` | `EmptyState` component |
| `/src/components/SimpleDashboard/EmptyStateCard.tsx` | No changes needed (props-based) |
| `/src/components/ItemCreationWorkflow/components/shared/EmptySessionDialog.tsx` | `EmptySessionDialog` component |

### 7.3 Consumer Components with Inline Empty States (MODIFY)

| File | Functions/Components to Modify |
|------|-------------------------------|
| `/src/components/ItemsManagement.tsx` | `ItemsManagement` component (JSX rendering) |
| `/src/components/PropertiesManagement.tsx` | `PropertiesManagement` component (JSX rendering) |
| `/src/components/InstructionsTable/GuideGrid.tsx` | `GuideGrid` component (empty state section) |
| `/src/components/ItemSelectionList.tsx` | `ItemSelectionList` component (JSX rendering) |
| `/src/components/ItemCreationWorkflow/components/steps/SessionSummaryStep.tsx` | `SessionSummaryStep` component |
| `/src/components/ItemCapture/components/steps/MetadataStep.tsx` | `MetadataStep` component |
| `/src/components/ReactionAnalytics.tsx` | `ReactionAnalytics` component |
| `/src/components/QRCodePrintPreview.tsx` | `QRCodePrintPreview` component |
| `/src/components/PropertySelector.tsx` | `PropertySelector` component |
| `/src/components/PropertyDropdown.tsx` | `PropertyDropdown` component |
| `/src/components/ItemManager/components/BulkActions/BulkMoveDialog.tsx` | `BulkMoveDialog` component |
| `/src/components/AccessRequestTable.tsx` | `AccessRequestTable` component |
| `/src/components/UserAnalyticsTable.tsx` | `UserAnalyticsTable` component |
| `/src/components/AnalyticsManagement.tsx` | `AnalyticsManagement` component |
| `/src/components/ItemForm.tsx` | `ItemForm` component |
| `/src/components/SimpleDashboard/ProgressivePropertySection.tsx` | `ProgressivePropertySection` component |

### 7.4 Files That Should NOT Be Modified

- Any backend/API files
- Database schema files
- Authentication/security files
- Files outside the component directories listed above

---

## 8. Component Update Pattern

### 8.1 Client Component Pattern

For all client components (`'use client'`), use this pattern:

```tsx
'use client';

import { useTranslations } from 'next-intl';

export function ComponentName() {
  const t = useTranslations('common.empty');

  // For items empty state
  if (items.length === 0) {
    return (
      <div role="status" aria-live="polite">
        <p>{t('items.title')}</p>
        <p>{t('items.description')}</p>
      </div>
    );
  }

  // For search results empty state
  if (filteredItems.length === 0 && searchTerm) {
    return (
      <div role="status" aria-live="polite">
        <p>{t('items.titleSearchWithTerm', { searchTerm })}</p>
        <p>{t('tryDifferentSearch')}</p>
      </div>
    );
  }
}
```

### 8.2 Reusable Component Props Pattern

For components that accept empty state text via props:

```tsx
// Parent component
import { useTranslations } from 'next-intl';

function ParentComponent() {
  const t = useTranslations('common.empty');

  return (
    <EmptyStateCard
      title={t('properties.title')}
      description={t('properties.description')}
      actionLabel={t('properties.action')}
    />
  );
}
```

---

## 9. Acceptance Criteria Verification

| Criterion | Verification Method |
|-----------|---------------------|
| All empty state messages identified and catalogued | ✅ See Section 4.3 |
| Primary messages extracted to translation keys | Test: Navigate to empty states, verify translated text |
| Secondary messages internationalized | Test: Verify descriptions use translation keys |
| Common scenarios share translation keys | Code review: Check for key reuse |
| Translation files include organized sections | Review: `/messages/en.json` structure |
| Dynamic parameters work correctly | Test: Search for non-existent items, verify term appears |
| Layout and presentation unchanged | Visual regression: Compare before/after screenshots |
| Helpful and encouraging tone preserved | Content review: Compare original vs translated |
| Different contexts display appropriate messages | Test: Empty search vs no content states |

---

## 10. Effort Estimate

| Task | Estimated Time |
|------|----------------|
| Task 1: Add translations to en.json | 0.5 hours |
| Task 2: Update EmptyState.tsx | 0.5 hours |
| Task 3: Update EmptyStateCard.tsx | 0.25 hours |
| Task 4: Update EmptySessionDialog.tsx | 0.5 hours |
| Task 5: Update consumer components | 3-4 hours |
| Task 6: Handle parameterized messages | 0.5 hours |
| Task 7: Verification and testing | 1 hour |
| **Total** | **6-7 hours** |

---

## 11. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Missing empty state strings | Medium | Low | Grep for patterns like "No \*", "empty", "found" |
| Translation key typos | Low | Medium | Use TypeScript for translation key validation |
| Breaking existing functionality | Low | High | Test all affected components after changes |
| Inconsistent key naming | Medium | Low | Follow established naming convention strictly |
| Props-based components miss translation | Medium | Medium | Update all parent components passing hardcoded strings |

---

## 12. Dependencies on Other Tasks

| Depends On | Task | Status |
|------------|------|--------|
| Epic 1 | next-intl foundation | Must be complete |
| Task 2H.1 | Create common namespace structure | Must be complete |

| Blocks | Task | Reason |
|--------|------|--------|
| Task 2H.10 | Generate translations for non-English languages | Needs English keys first |

---

## 13. Testing Checklist

- [ ] Empty state displays when no items exist
- [ ] Empty state displays when search returns no results
- [ ] Parameterized search terms display correctly in messages
- [ ] All reusable empty state components use translation keys
- [ ] All inline empty states use translation keys
- [ ] ARIA labels and live regions work with translated content
- [ ] No hardcoded empty state strings remain in modified files
- [ ] Build completes without errors
- [ ] No console warnings about missing translation keys

---

## 14. Notes

1. **Consistency Priority:** Use the same translation key for identical messages across components (e.g., `t('tryDifferentFilters')` should be used everywhere this message appears).

2. **Fallback Values:** The `EmptyState` component currently has default values via props. After translation, defaults should come from translation keys, not hardcoded constants.

3. **Accessibility:** Ensure `aria-label` attributes that use empty state text are also updated to use translated values.

4. **Future Enhancement:** Consider creating a `useEmptyStateTranslations()` convenience hook if the pattern becomes common enough.

---

*Document generated for FAQBNB L10N Epic 2 - Sub-Epic 2H Task 2H.6*
