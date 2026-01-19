# REQ-388: Update Filter and Sort Components for Localization - Implementation Overview

**Document Created**: 2026-01-19 18:15 UTC
**Last Modified**: 2026-01-19 18:15 UTC
**Request ID**: REQ-388
**Epic**: 2 - Static UI Translation
**Sub-Epic**: 2D - Item Management
**Task ID**: 2D.4
**Size**: M (Medium)
**Type**: ENHANCEMENT

---

## Summary

Update all filter and sort components in the ItemManager to display labels, options, and helper text in the user's selected language by replacing hardcoded English strings with translation function calls using next-intl's `useTranslations` hook.

---

## Current State Analysis

### Components to Update

| Component | Location | Hardcoded Strings |
|-----------|----------|-------------------|
| FilterPanel | `/src/components/ItemManager/components/dialogs/FilterPanel.tsx` | 8 labels |
| ContentTypeFilter | `/src/components/ItemManager/components/dialogs/ContentTypeFilter.tsx` | 5 content type options |
| TagFilter | `/src/components/ItemManager/components/dialogs/TagFilter.tsx` | 4 main + 3 inline messages |
| LocationFilter | `/src/components/ItemManager/components/dialogs/LocationFilter.tsx` | 4 main + 3 inline messages |
| SortMenu | `/src/components/ItemManager/components/dialogs/SortMenu.tsx` | 2 labels |
| constants.ts | `/src/components/ItemManager/utils/constants.ts` | 9 sort option labels |

### Existing Hardcoded Strings Inventory

#### FilterPanel (Lines 89-98)
```typescript
const DEFAULT_LABELS: Required<FilterPanelLabels> = {
  title: 'Filters',
  clearAll: 'Clear All',
  contentType: 'Content Type',
  tags: 'Tags',
  location: 'Location',
  property: 'Property',
  applyFilters: 'Apply Filters',
  close: 'Close',
};
```

#### ContentTypeFilter (Lines 24-30)
```typescript
const CONTENT_TYPE_OPTIONS = [
  { value: 'video', label: 'Video', icon: '🎥' },
  { value: 'image', label: 'Photo', icon: '📷' },
  { value: 'pdf', label: 'PDF', icon: '📄' },
  { value: 'text-only', label: 'Text Only', icon: '📝' },
  { value: 'mixed', label: 'Mixed', icon: '📦' },
];
```
Default label: `'Content Type'` (line 67)

#### TagFilter
- Default label: `'Tags'` (line 62)
- Default placeholder: `'Add tags...'` (line 63)
- Default noTagsMessage: `'No tags available'` (line 64)
- Search placeholder: `'Search tags...'` (line 264)
- No matching: `'No matching tags'` (line 278)
- All selected: `'All tags selected'` (line 281)

#### LocationFilter
- Default label: `'Location'` (line 62)
- Default placeholder: `'Select location...'` (line 63)
- Default noLocationsMessage: `'No locations available'` (line 64)
- Search placeholder: `'Search locations...'` (line 268)
- No matching: `'No matching locations'` (line 282)
- No found: `'No locations found'` (line 285)
- Clear aria-label: `'Clear location selection'` (line 246)

#### SortMenu (Lines 125-128)
```typescript
const mergedLabels = {
  sortLabel: 'Sort',
  sortByLabel: 'Sort by',
  ...labels,
};
```

#### constants.ts - SORT_OPTIONS (Lines 31-41)
```typescript
export const SORT_OPTIONS: SortOptionItem[] = [
  { value: 'title-asc', label: 'Title (A-Z)', icon: 'asc' },
  { value: 'title-desc', label: 'Title (Z-A)', icon: 'desc' },
  { value: 'created-desc', label: 'Newest First', icon: 'desc' },
  { value: 'created-asc', label: 'Oldest First', icon: 'asc' },
  { value: 'updated-desc', label: 'Recently Modified', icon: 'desc' },
  { value: 'updated-asc', label: 'Least Recently Modified', icon: 'asc' },
  { value: 'location-asc', label: 'Location (A-Z)', icon: 'asc' },
  { value: 'instructions-desc', label: 'Most Guides', icon: 'desc' },
  { value: 'instructions-asc', label: 'Fewest Guides', icon: 'asc' },
];
```

---

## Implementation Approach

### Translation Namespace Structure

Add to `/messages/en.json` under the `items` namespace:

```json
{
  "items": {
    "filters": {
      "title": "Filters",
      "clearAll": "Clear All",
      "applyFilters": "Apply Filters",
      "close": "Close",
      "contentType": {
        "label": "Content Type",
        "video": "Video",
        "photo": "Photo",
        "pdf": "PDF",
        "textOnly": "Text Only",
        "mixed": "Mixed"
      },
      "tags": {
        "label": "Tags",
        "placeholder": "Add tags...",
        "searchPlaceholder": "Search tags...",
        "noTags": "No tags available",
        "noMatching": "No matching tags",
        "allSelected": "All tags selected"
      },
      "location": {
        "label": "Location",
        "placeholder": "Select location...",
        "searchPlaceholder": "Search locations...",
        "noLocations": "No locations available",
        "noMatching": "No matching locations",
        "noFound": "No locations found",
        "clearSelection": "Clear location selection"
      },
      "property": {
        "label": "Property"
      }
    },
    "sort": {
      "label": "Sort",
      "sortBy": "Sort by",
      "options": {
        "titleAsc": "Title (A-Z)",
        "titleDesc": "Title (Z-A)",
        "newestFirst": "Newest First",
        "oldestFirst": "Oldest First",
        "recentlyModified": "Recently Modified",
        "leastRecentlyModified": "Least Recently Modified",
        "locationAsc": "Location (A-Z)",
        "mostGuides": "Most Guides",
        "fewestGuides": "Fewest Guides"
      }
    }
  }
}
```

### Component Update Pattern

For client components (all filter/sort components are client components), use:

```typescript
import { useTranslations } from 'next-intl';

export function FilterPanel({ ... }) {
  const t = useTranslations('items.filters');

  // Replace hardcoded strings
  const title = t('title');
  const clearAllLabel = t('clearAll');
  // etc.
}
```

### Sort Options Localization Strategy

Since `SORT_OPTIONS` is a constant array, the sort option labels need to be fetched dynamically in the component:

```typescript
// In SortMenu component
const t = useTranslations('items.sort');

const localizedSortOptions = SORT_OPTIONS.map(option => ({
  ...option,
  label: t(`options.${getSortOptionKey(option.value)}`),
}));
```

A helper function maps sort values to translation keys:
```typescript
const SORT_KEY_MAP: Record<SortOption, string> = {
  'title-asc': 'titleAsc',
  'title-desc': 'titleDesc',
  'created-desc': 'newestFirst',
  'created-asc': 'oldestFirst',
  'updated-desc': 'recentlyModified',
  'updated-asc': 'leastRecentlyModified',
  'location-asc': 'locationAsc',
  'instructions-desc': 'mostGuides',
  'instructions-asc': 'fewestGuides',
};
```

---

## Authorized Files and Functions for Modification

### Primary Files

| File Path | Line Numbers | Functions/Sections |
|-----------|--------------|-------------------|
| `/src/components/ItemManager/components/dialogs/FilterPanel.tsx` | 89-98, 263-312, 317-356 | `DEFAULT_LABELS` constant, `renderHeader()`, `renderFilters()` |
| `/src/components/ItemManager/components/dialogs/ContentTypeFilter.tsx` | 24-30, 62-68, 83-137 | `CONTENT_TYPE_OPTIONS` constant, component default props, render JSX |
| `/src/components/ItemManager/components/dialogs/TagFilter.tsx` | 62-65, 188-306 | default props, render JSX including search placeholder and messages |
| `/src/components/ItemManager/components/dialogs/LocationFilter.tsx` | 62-65, 185-325 | default props, render JSX including search placeholder and messages |
| `/src/components/ItemManager/components/dialogs/SortMenu.tsx` | 46-50, 112-128, 136-258 | labels interface, `mergedLabels`, component render |
| `/src/components/ItemManager/utils/constants.ts` | 31-41 | `SORT_OPTIONS` array (label values to be dynamically resolved) |

### Translation Files

| File Path | Section |
|-----------|---------|
| `/messages/en.json` | Add `items.filters` and `items.sort` namespaces |
| `/messages/fr.json` | Add French translations for `items.filters` and `items.sort` |
| `/messages/es.json` | Add Spanish translations for `items.filters` and `items.sort` |
| `/messages/de.json` | Add German translations for `items.filters` and `items.sort` |
| `/messages/nl.json` | Add Dutch translations for `items.filters` and `items.sort` |
| `/messages/it.json` | Add Italian translations for `items.filters` and `items.sort` |

---

## Implementation Tasks

### Task 1: Update Translation Files
1. Add `items.filters` namespace to `/messages/en.json`
2. Add `items.sort` namespace to `/messages/en.json`
3. Add corresponding translations to all 5 non-English language files

### Task 2: Update FilterPanel Component
1. Import `useTranslations` from `next-intl`
2. Replace `DEFAULT_LABELS` with translated values from `t('items.filters')`
3. Update `renderHeader()` to use translated labels
4. Ensure all aria-labels use translated text

### Task 3: Update ContentTypeFilter Component
1. Import `useTranslations` from `next-intl`
2. Create localized content type options using translations
3. Update default label prop to use translation
4. Maintain accessibility with translated aria-labels

### Task 4: Update TagFilter Component
1. Import `useTranslations` from `next-intl`
2. Replace all default prop values with translations
3. Update inline messages (search placeholder, no matching, all selected)
4. Update aria-label for remove tag button with translated text

### Task 5: Update LocationFilter Component
1. Import `useTranslations` from `next-intl`
2. Replace all default prop values with translations
3. Update inline messages (search placeholder, no matching, no found)
4. Update clear button aria-label with translated text

### Task 6: Update SortMenu Component
1. Import `useTranslations` from `next-intl`
2. Replace `mergedLabels` default values with translations
3. Create helper function to map sort options to translation keys
4. Generate localized sort options array dynamically
5. Update dropdown header with translated "Sort by" text

### Task 7: Testing and Verification
1. Verify all strings display correctly in English (default)
2. Switch language and verify all filter/sort components update
3. Verify aria-labels and accessibility attributes are translated
4. Test keyboard navigation with screen reader in multiple languages
5. Verify no regressions in filter/sort functionality

---

## Dependencies

### From Epic 1 (Foundation)
- ✅ next-intl package installed
- ✅ i18n configuration in `/src/lib/i18n/config.ts`
- ✅ Translation files structure in `/messages/*.json`
- ✅ `useTranslations` hook available for client components

### From Sub-Epic 2H (Common & Shared)
- `items.filters.title` should align with `common.filter` if defined
- `items.sort.label` should align with `common.sort` if defined

---

## Acceptance Criteria

- [ ] FilterPanel component uses translation keys for title, clearAll, contentType, tags, location, property, applyFilters, and close labels
- [ ] SortMenu component uses translation keys for sortLabel and sortByLabel
- [ ] All sort option labels in SORT_OPTIONS constant are replaced with translation key references
- [ ] ContentTypeFilter component displays translated content type labels and filter section heading
- [ ] TagFilter component displays translated tags label and dropdown placeholder text
- [ ] LocationFilter component displays translated location label and selection placeholder
- [ ] PropertyFilter component displays translated property label (via FilterPanel pass-through)
- [ ] Active filter count badge label is internationalized (if applicable)
- [ ] Filter clear button and apply button labels appear in selected language
- [ ] Sort direction indicators maintain correct display alongside translated sort option text
- [ ] All filter and sort components maintain existing functionality after internationalization
- [ ] Translation keys follow established naming conventions for the items namespace

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Text length variation across languages may break layout | Medium | Design filter chips and buttons with padding for longer text (German typically 30% longer) |
| Dynamic sort option localization complexity | Low | Use memoization to avoid recreating localized array on every render |
| Missing translations at runtime | Medium | Fallback to English via next-intl configuration |
| Breaking existing label prop customization | Medium | Maintain backward compatibility by using translations as defaults, but allowing prop overrides |

---

## Estimated Effort

| Task | Estimate |
|------|----------|
| Update translation files (6 languages) | 1 hour |
| Update FilterPanel | 30 minutes |
| Update ContentTypeFilter | 30 minutes |
| Update TagFilter | 45 minutes |
| Update LocationFilter | 45 minutes |
| Update SortMenu + constants | 1 hour |
| Testing and verification | 1 hour |
| **Total** | **~5.5 hours** |

---

## References

- [Implementation Plan: Epic 2 - Static UI Translation](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [Request Definition](/docs/gen_requests_epic2.md#req-388)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [i18n Configuration](/src/lib/i18n/config.ts)

---

*Document generated for FAQBNB Localization Epic 2 - Sub-Epic 2D Item Management*
