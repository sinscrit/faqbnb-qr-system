# REQ-342: Extract Empty State Messages for Internationalization - Technical Overview

**Document Created:** 2026-01-19 17:30:00 UTC
**Last Modified:** 2026-01-19 17:30:00 UTC
**Request Reference:** gen_requests_epic2.md - Request #342
**Implementation Plan Reference:** Plan-111-L10N-Epic2-Static-UI-Translation.md
**Sub-Epic:** 2H - Common & Shared Components
**Task ID:** 2H.6
**Size:** M (Medium)
**Priority:** High (Part of Epic 2 Foundation)

---

## 1. Summary

Extract all hardcoded empty state messages across the application to translation files, enabling users to see empty state content (titles, descriptions, call-to-action labels) in their preferred language. Empty states appear when lists are empty, searches return no results, or users have not yet created content.

---

## 2. Background & Context

### 2.1 Current State

The application has two primary empty state component patterns:

1. **EmptyStateCard** (`/src/components/SimpleDashboard/EmptyStateCard.tsx`)
   - Fully configurable via props (no hardcoded defaults)
   - Three visual variants: `default`, `welcome`, `subtle`
   - Used throughout SimpleDashboard components

2. **EmptyState** (`/src/components/ItemManager/components/shared/EmptyState.tsx`)
   - Has hardcoded default constants:
     - `DEFAULT_TITLE = 'No items yet'`
     - `DEFAULT_DESCRIPTION = 'Create your first item to get started'`
   - Used by ItemManager and related components

### 2.2 Hardcoded Strings Identified

| Component | Hardcoded String | Location |
|-----------|------------------|----------|
| EmptyState (ItemManager) | "No items yet" | Line 23 |
| EmptyState (ItemManager) | "Create your first item to get started" | Line 24 |
| ItemManager | "No items yet", "Create your first item..." | Lines 57-58 |
| ItemManager | "No matching items", "Try adjusting your search or filters" | Lines 590-591 |
| StatisticsCards | "Start adding new QR Code items and create guides/instructions" | Line 218 |
| PropertySection | "Let's add your property" | Line 129 |
| PropertySection | "A property is where your items live..." | Line 130 |
| GuideGrid | "No guides found", "Try adjusting your search or filters" | Lines 100-101 |
| PropertiesManagement | "No Properties Found" | Line 319 |
| PropertiesManagement | "Get started by creating your first property" | Line 321 |
| ItemSelectionList | "No items found", "No items available" | Lines 203-229 |
| ItemInstructionsList | "No guides yet" | Line 87 |
| Dashboard2 page | "Welcome to FAQBNB!", "Get started by adding your first property..." | Lines 173-175 |
| Print page | "No Properties Yet" | Line 45 |
| Instructions page | "No guides yet", "Create items and add guide articles..." | Lines 289-291 |
| MediaManagementSection | Empty state messaging | Lines 147-148 |
| ReactionAnalytics | Empty state component | Line 88 |

### 2.3 Existing i18n Foundation

The project already has next-intl configured with:
- **Translation files:** `/messages/{en,fr,es,de,nl,it}.json`
- **Partial empty state keys:** `dashboard.noActivity`, `items.noItems`
- **i18n config:** `/src/lib/i18n/config.ts` with 6 supported locales

---

## 3. Requirements

### 3.1 Functional Requirements

1. All empty state messages display in the user's selected language
2. Empty state scenarios covered:
   - Zero-data states (no items/properties/guides exist)
   - No-search-results states (filters/search yield no results)
   - First-time user guidance messages
3. Maintain helpful and encouraging tone in all languages
4. Props for custom empty state messages continue to work for component flexibility

### 3.2 Non-Functional Requirements

1. No performance regression from translation lookups
2. Consistent key naming following `emptyStates.[context].[element]` pattern
3. All 6 language files updated with identical key structures

---

## 4. Technical Approach

### 4.1 Translation Key Structure

Add new `emptyStates` namespace to the common translation section:

```json
{
  "common": {
    "emptyStates": {
      "items": {
        "title": "No items yet",
        "description": "Create your first item to get started",
        "action": "Create Item"
      },
      "search": {
        "title": "No matching items",
        "description": "Try adjusting your search or filters",
        "noResultsFor": "No items match your search for \"{term}\""
      },
      "properties": {
        "title": "Let's add your property",
        "description": "A property is where your items live - like a vacation rental or home.",
        "action": "Add Property",
        "notFound": "No Properties Found",
        "searchEmpty": "No properties match your search criteria.",
        "getStarted": "Get started by creating your first property."
      },
      "guides": {
        "title": "No guides yet",
        "description": "Create items and add guide articles to get started. Guides help guests find what they need.",
        "action": "Create Your First Item",
        "notFound": "No guides found",
        "searchHint": "Try adjusting your search or filters"
      },
      "dashboard": {
        "newUser": {
          "title": "Welcome to FAQBNB!",
          "description": "Get started by adding your first property. Then you can create QR codes to help guests find what they need."
        },
        "noActivity": "No recent activity",
        "startTracking": "Start adding new QR Code items and create guides/instructions"
      },
      "media": {
        "noLinks": "No links added yet",
        "addFirst": "Add your first link to get started"
      },
      "analytics": {
        "noData": "No analytics data available",
        "checkBack": "Check back after some activity"
      }
    }
  }
}
```

### 4.2 Component Update Pattern

**For Client Components:**
```typescript
// Before
const DEFAULT_TITLE = 'No items yet';
const DEFAULT_DESCRIPTION = 'Create your first item to get started';

// After
import { useTranslations } from 'next-intl';

function EmptyState({ title, description, ...props }: EmptyStateProps) {
  const t = useTranslations('common.emptyStates.items');

  const displayTitle = title ?? t('title');
  const displayDescription = description ?? t('description');

  return (/* JSX with translated defaults */);
}
```

**For Components Passing Props:**
```typescript
// Before
<EmptyStateCard
  title="Let's add your property"
  description="A property is where your items live..."
/>

// After
const t = useTranslations('common.emptyStates.properties');

<EmptyStateCard
  title={t('title')}
  description={t('description')}
/>
```

### 4.3 Handling Dynamic Empty States

For search results with interpolation:
```typescript
const t = useTranslations('common.emptyStates.search');

// With search term interpolation
<p>{t('noResultsFor', { term: searchQuery })}</p>
```

---

## 5. Implementation Tasks

### Task 1: Create Empty States Translation Namespace
- Add `common.emptyStates` structure to `/messages/en.json`
- Define all keys following the structure in Section 4.1
- **Estimated effort:** 30 minutes

### Task 2: Update EmptyState Component (ItemManager)
- File: `/src/components/ItemManager/components/shared/EmptyState.tsx`
- Add `useTranslations` hook for default values
- Replace `DEFAULT_TITLE` and `DEFAULT_DESCRIPTION` constants with translation calls
- Maintain backward compatibility with prop overrides
- **Estimated effort:** 20 minutes

### Task 3: Update ItemManager Labels
- File: `/src/components/ItemManager/ItemManager.tsx`
- Update default labels config (lines 57-58, 590-591) to use translations
- **Estimated effort:** 15 minutes

### Task 4: Update StatisticsCards Empty State
- File: `/src/components/SimpleDashboard/StatisticsCards.tsx`
- Update line 218 to use translated text
- **Estimated effort:** 10 minutes

### Task 5: Update PropertySection Empty State
- File: `/src/components/SimpleDashboard/PropertySection.tsx`
- Update PropertyEmptyState function (lines 125-136) to use translations
- **Estimated effort:** 10 minutes

### Task 6: Update GuideGrid Empty State
- File: `/src/components/InstructionsTable/GuideGrid.tsx`
- Update empty state section (lines 88-103) to use translations
- **Estimated effort:** 10 minutes

### Task 7: Update PropertiesManagement Empty State
- File: `/src/components/PropertiesManagement.tsx`
- Update lines 314-328 to use translations
- **Estimated effort:** 15 minutes

### Task 8: Update ItemSelectionList Empty States
- File: `/src/components/ItemSelectionList.tsx`
- Update multiple empty state sections (lines 203-231)
- Handle search term interpolation
- **Estimated effort:** 20 minutes

### Task 9: Update ItemInstructionsList Empty State
- File: `/src/components/ItemEditForm/ItemInstructionsList.tsx`
- Update line 87 to use translations
- **Estimated effort:** 10 minutes

### Task 10: Update Dashboard2 Page Empty States
- File: `/src/app/dashboard2/page.tsx`
- Update EmptyStateCard props (lines 172-175) to use translations
- **Estimated effort:** 10 minutes

### Task 11: Update Print Page Empty State
- File: `/src/app/dashboard2/print/page.tsx`
- Update EmptyState component (lines 36-52)
- **Estimated effort:** 10 minutes

### Task 12: Update Instructions Page Empty State
- File: `/src/app/dashboard2/instructions/page.tsx`
- Update empty state section (lines 283-299)
- **Estimated effort:** 15 minutes

### Task 13: Update MediaManagementSection Empty State
- File: `/src/components/MediaManagement/MediaManagementSection.tsx`
- Update empty state rendering (lines 147-148)
- **Estimated effort:** 10 minutes

### Task 14: Update ReactionAnalytics Empty State
- File: `/src/components/ReactionAnalytics.tsx`
- Update EmptyState function (line 88)
- **Estimated effort:** 10 minutes

### Task 15: Propagate Translations to Other Languages
- Update `/messages/fr.json`, `/messages/es.json`, `/messages/de.json`, `/messages/nl.json`, `/messages/it.json`
- Use AI translation for initial draft
- **Estimated effort:** 45 minutes

### Task 16: Testing and Verification
- Verify all empty states display correctly in each language
- Test language switching updates empty states
- Verify prop overrides still work (backward compatibility)
- **Estimated effort:** 30 minutes

---

## 6. Authorized Files and Functions for Modification

### 6.1 Translation Files

| File Path | Modification Type |
|-----------|-------------------|
| `/messages/en.json` | Add `common.emptyStates` namespace |
| `/messages/fr.json` | Add `common.emptyStates` namespace |
| `/messages/es.json` | Add `common.emptyStates` namespace |
| `/messages/de.json` | Add `common.emptyStates` namespace |
| `/messages/nl.json` | Add `common.emptyStates` namespace |
| `/messages/it.json` | Add `common.emptyStates` namespace |

### 6.2 Component Files

| File Path | Functions/Areas to Modify |
|-----------|---------------------------|
| `/src/components/ItemManager/components/shared/EmptyState.tsx` | `EmptyState` component, `DEFAULT_TITLE`, `DEFAULT_DESCRIPTION` constants |
| `/src/components/ItemManager/ItemManager.tsx` | `labels` default config object |
| `/src/components/SimpleDashboard/StatisticsCards.tsx` | `StatisticsCards` component (EmptyStateCard props) |
| `/src/components/SimpleDashboard/PropertySection.tsx` | `PropertyEmptyState` function |
| `/src/components/InstructionsTable/GuideGrid.tsx` | Empty state JSX block in `GuideGrid` component |
| `/src/components/PropertiesManagement.tsx` | Empty state JSX block |
| `/src/components/ItemSelectionList.tsx` | Multiple empty state sections |
| `/src/components/ItemEditForm/ItemInstructionsList.tsx` | Empty state section |
| `/src/app/dashboard2/page.tsx` | `EmptyStateCard` props |
| `/src/app/dashboard2/print/page.tsx` | `EmptyState` function component |
| `/src/app/dashboard2/instructions/page.tsx` | Empty state section |
| `/src/components/MediaManagement/MediaManagementSection.tsx` | Empty state rendering |
| `/src/components/ReactionAnalytics.tsx` | `EmptyState` function |

---

## 7. Dependencies

### 7.1 Prerequisites
- Epic 1 i18n foundation must be complete (next-intl installed and configured)
- Translation files must exist for all 6 locales

### 7.2 Related Tasks
- **Task 2H.1:** Create `common` namespace structure (should be complete first)
- **Task 2H.10:** Generate translations for all 5 non-English languages

### 7.3 Blocking Issues
- None identified - this task can proceed independently

---

## 8. Acceptance Criteria

- [ ] All components displaying empty states are identified and updated
- [ ] Empty state titles extracted to translation keys following `emptyStates.[context].title` pattern
- [ ] Empty state descriptions extracted to translation keys following `emptyStates.[context].description` pattern
- [ ] Search-specific empty states use dedicated keys with proper interpolation for search terms
- [ ] First-time user guidance messages use appropriate keys
- [ ] All extracted strings added to `en.json` with complete English translations
- [ ] All extracted strings propagated to other language files (de.json, es.json, fr.json, it.json, nl.json)
- [ ] Components correctly display translated empty state messages when language is switched
- [ ] No hardcoded English empty state text remains in any component
- [ ] Empty state messages maintain helpful and encouraging tone in all languages
- [ ] Props for custom empty state messages (title, description overrides) continue to work

---

## 9. Testing Strategy

### 9.1 Unit Tests
- Verify EmptyState component uses translations by default
- Verify prop overrides take precedence over translations
- Mock useTranslations hook in component tests

### 9.2 Integration Tests
- Verify empty states render in each supported locale
- Verify dynamic interpolation (search terms) works correctly

### 9.3 Manual Verification
- Switch language and verify all empty states update
- Check each empty state scenario:
  - New user with no data
  - User with data but empty search results
  - User viewing empty list (items, properties, guides)

---

## 10. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Missing empty state locations | Medium | Medium | Thorough grep search for empty state patterns |
| Broken prop overrides after changes | Low | High | Add tests for backward compatibility |
| Translation key mismatches between files | Low | Medium | Use JSON schema validation |
| Performance impact from many useTranslations calls | Low | Low | next-intl optimizes repeated calls |

---

## 11. Estimated Effort

**Total: ~4 hours**

| Phase | Time |
|-------|------|
| Translation key structure setup | 30 min |
| Component updates (14 components) | 2.5 hours |
| Translation propagation to 5 languages | 45 min |
| Testing and verification | 30 min |

---

## 12. References

- [Plan-111-L10N-Epic2-Static-UI-Translation.md](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md) - Section "Sub-Epic 2H: Common & Shared Components"
- [gen_requests_epic2.md](/docs/gen_requests_epic2.md) - Request #342
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Epic 1 Foundation](/docs/prd/Plan-110-L10N-Epic1-Foundation.md)
