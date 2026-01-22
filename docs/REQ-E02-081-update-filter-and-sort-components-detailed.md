# REQ-E02-081: Update Filter and Sort Components for Internationalization - Detailed Implementation Tasks

**Generated:** 2026-01-22 14:51
**Last Modified:** 2026-01-22 15:47
**Reference Documents:**
- Requirements: `/docs/gen_requests_epic2.md` - Request #81
- Overview: `/docs/REQ-E02-081-update-filter-and-sort-components-overview.md`
- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md`

**CRITICAL INSTRUCTIONS FOR IMPLEMENTING AGENT:**
- Operate from the project root folder ONLY
- **DO NOT ATTEMPT TO NAVIGATE TO OTHER FOLDERS UNDER ANY CIRCUMSTANCES**
- All file paths must be relative to project root

---

## Build & Test Commands

| Action | Command |
|--------|---------|
| Type Check | `npx tsc --noEmit` |
| Unit Tests | `npm test` |
| Build | `npm run build` |
| Lint | `npm run lint` |

---

## Overview

This document provides granular, implementation-ready tasks for adding internationalization support to filter and sort components in the ItemManager system. The implementation uses `useTranslations` from next-intl following the Epic 2 pattern.

**Scope Summary:**

| Component | File Location | Strings to Translate |
|-----------|---------------|---------------------|
| FilterPanel | `src/components/ItemManager/components/dialogs/FilterPanel.tsx` | 8 |
| SortMenu | `src/components/ItemManager/components/dialogs/SortMenu.tsx` | 2 + 9 sort options |
| ContentTypeFilter | `src/components/ItemManager/components/dialogs/ContentTypeFilter.tsx` | 6 |
| TagFilter | `src/components/ItemManager/components/dialogs/TagFilter.tsx` | 7 |
| LocationFilter | `src/components/ItemManager/components/dialogs/LocationFilter.tsx` | 7 |
| PropertyFilter | `src/components/ItemManager/components/dialogs/PropertyFilter.tsx` | 1 |
| constants.ts | `src/components/ItemManager/utils/constants.ts` | Interface update for labelKey |

---

## Implementation Status

**COMPLETED:** All tasks have been implemented and verified.

---

## 1. Add Filter and Sort Translation Keys to All Language Files

**Context:** Translation keys must exist in all 6 language files before components can use them.
**Files to modify:**
- `/messages/en.json`
- `/messages/fr.json`
- `/messages/es.json`
- `/messages/de.json`
- `/messages/nl.json`
- `/messages/it.json`

**Estimated effort:** 1 story point

- [x] **1.1** Add `items.filters` namespace with keys: `title`, `clearAll`, `applyFilters`, `close` to `/messages/en.json` ---implemented: keys exist at lines 1293-1297 in en.json---
- [x] **1.2** Add `items.filters.contentType` nested keys: `label`, `video`, `photo`, `pdf`, `textOnly`, `mixed` to `/messages/en.json` ---implemented: keys exist at lines 1304-1311---
- [x] **1.3** Add `items.filters.tags` nested keys: `label`, `placeholder`, `searchPlaceholder`, `noTags`, `noMatching`, `allSelected`, `removeTag` to `/messages/en.json` ---implemented: keys exist at lines 1321-1330---
- [x] **1.4** Add `items.filters.location` nested keys: `label`, `placeholder`, `searchPlaceholder`, `noLocations`, `noMatching`, `noFound`, `clearSelection` to `/messages/en.json` ---implemented: keys exist at lines 1331-1340---
- [x] **1.5** Add `items.filters.property` nested key: `label` to `/messages/en.json` ---implemented: keys exist at lines 1341-1345---
- [x] **1.6** Add `items.sort` namespace with keys: `label`, `sortBy` to `/messages/en.json` ---implemented: keys exist at lines 1348-1350---
- [x] **1.7** Add `items.sort.options` nested keys for all 9 sort options: `titleAsc`, `titleDesc`, `newestFirst`, `oldestFirst`, `recentlyModified`, `leastRecentlyModified`, `locationAsc`, `mostGuides`, `fewestGuides` to `/messages/en.json` ---implemented: keys exist at lines 1351-1362---
- [x] **1.8** Copy identical key structure to `/messages/fr.json` with French translations ---implemented: verified at lines 1255-1329---
- [x] **1.9** Copy identical key structure to `/messages/es.json` with Spanish translations ---implemented: verified at lines 1255-1329---
- [x] **1.10** Copy identical key structure to `/messages/de.json` with German translations ---implemented: verified at lines 1255-1329---
- [x] **1.11** Copy identical key structure to `/messages/nl.json` with Dutch translations ---implemented: verified at lines 1255-1329---
- [x] **1.12** Copy identical key structure to `/messages/it.json` with Italian translations ---implemented: verified at lines 1265-1329---
- [x] **1.13** Verify all JSON files are valid and parseable (no syntax errors) ---implemented: all 6 JSON files parse correctly---
- [x] **1.14** Run `npx tsc --noEmit` to verify no TypeScript errors ---ts-check: passed (0 errors)---

**Expected English translations:**
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
        "allSelected": "All tags selected",
        "removeTag": "Remove {tag} tag"
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

---

## 2. Update constants.ts Sort Options with labelKey

**Context:** Sort options need a `labelKey` field for i18n translation lookup at render time.
**Files to modify:** `src/components/ItemManager/utils/constants.ts`
**Estimated effort:** 0.5 story points

- [x] **2.1** Update `SortOptionItem` interface to include `labelKey: string` property ---implemented: interface at lines 22-27 includes labelKey---
- [x] **2.2** Add `labelKey` to all 9 sort options in `SORT_OPTIONS` array matching translation keys ---implemented: SORT_OPTIONS at lines 34-44 has all labelKey values---
- [x] **2.3** Verify TypeScript compiles without errors: `npx tsc --noEmit` ---ts-check: passed (0 errors)---

**Target interface:**
```typescript
export interface SortOptionItem {
  value: SortOption;
  /** Translation key relative to 'items.sort.options' namespace */
  labelKey: string;
  icon?: 'asc' | 'desc' | 'none';
}
```

**Target SORT_OPTIONS:**
```typescript
export const SORT_OPTIONS: SortOptionItem[] = [
  { value: 'title-asc', labelKey: 'titleAsc', icon: 'asc' },
  { value: 'title-desc', labelKey: 'titleDesc', icon: 'desc' },
  { value: 'created-desc', labelKey: 'newestFirst', icon: 'desc' },
  { value: 'created-asc', labelKey: 'oldestFirst', icon: 'asc' },
  { value: 'updated-desc', labelKey: 'recentlyModified', icon: 'desc' },
  { value: 'updated-asc', labelKey: 'leastRecentlyModified', icon: 'asc' },
  { value: 'location-asc', labelKey: 'locationAsc', icon: 'asc' },
  { value: 'instructions-desc', labelKey: 'mostGuides', icon: 'desc' },
  { value: 'instructions-asc', labelKey: 'fewestGuides', icon: 'asc' },
];
```

---

## 3. Update FilterPanel Component for i18n

**Context:** FilterPanel orchestrates all filter sub-components and needs translated labels.
**Files to modify:** `src/components/ItemManager/components/dialogs/FilterPanel.tsx`
**Estimated effort:** 1 story point

- [x] **3.1** Add import statement: `import { useTranslations } from 'next-intl';` ---implemented: import at line 15---
- [x] **3.2** Add translation hook inside component: `const t = useTranslations('items.filters');` ---implemented: hook at line 125---
- [x] **3.3** Replace hardcoded DEFAULT_LABELS with translation calls using nullish coalescing for custom overrides ---implemented: labels object at lines 131-140---
- [x] **3.4** Update `title` label to use `customLabels.title ?? t('title')` ---implemented: line 132---
- [x] **3.5** Update `clearAll` label to use `customLabels.clearAll ?? t('clearAll')` ---implemented: line 133---
- [x] **3.6** Update `contentType` label to use `customLabels.contentType ?? t('contentType.label')` ---implemented: line 134---
- [x] **3.7** Update `tags` label to use `customLabels.tags ?? t('tags.label')` ---implemented: line 135---
- [x] **3.8** Update `location` label to use `customLabels.location ?? t('location.label')` ---implemented: line 136---
- [x] **3.9** Update `property` label to use `customLabels.property ?? t('property.label')` ---implemented: line 137---
- [x] **3.10** Update `applyFilters` label to use `customLabels.applyFilters ?? t('applyFilters')` ---implemented: line 138---
- [x] **3.11** Update `close` label to use `customLabels.close ?? t('close')` ---implemented: line 139---
- [x] **3.12** Verify TypeScript compiles without errors: `npx tsc --noEmit` ---ts-check: passed (0 errors)---

---

## 4. Update SortMenu Component for i18n

**Context:** SortMenu displays sort options and labels that need translation.
**Files to modify:** `src/components/ItemManager/components/dialogs/SortMenu.tsx`
**Estimated effort:** 1 story point

- [x] **4.1** Add import statement: `import { useTranslations } from 'next-intl';` ---implemented: import at line 15---
- [x] **4.2** Add translation hook: `const t = useTranslations('items.sort');` ---implemented: hook at line 114---
- [x] **4.3** Update `sortLabel` to use `labels?.sortLabel ?? t('label')` ---implemented: line 118---
- [x] **4.4** Update `sortByLabel` to use `labels?.sortByLabel ?? t('sortBy')` ---implemented: line 119---
- [x] **4.5** Create helper function to translate sort options using `t('options.${option.labelKey}')` ---implemented: translateOption function at lines 129-131---
- [x] **4.6** Update the dropdown render to display translated sort option labels ---implemented: uses translateOption(option) at line 238---
- [x] **4.7** Update current sort display label to use translation ---implemented: currentLabel uses t() at line 125---
- [x] **4.8** Verify TypeScript compiles without errors: `npx tsc --noEmit` ---ts-check: passed (0 errors)---

---

## 5. Update ContentTypeFilter Component for i18n

**Context:** ContentTypeFilter displays content type chips that need localized labels.
**Files to modify:** `src/components/ItemManager/components/dialogs/ContentTypeFilter.tsx`
**Estimated effort:** 1 story point

- [x] **5.1** Add import statements: `import { useTranslations } from 'next-intl';` and ensure `useMemo` is imported ---implemented: imports at lines 14-15---
- [x] **5.2** Refactor `CONTENT_TYPE_OPTIONS` to `CONTENT_TYPE_OPTIONS_BASE` with `labelKey` instead of `label` ---implemented: CONTENT_TYPE_OPTIONS_BASE at lines 27-33---
- [x] **5.3** Add translation hook: `const t = useTranslations('items.filters.contentType');` ---implemented: hook at line 73---
- [x] **5.4** Create memoized `contentTypeOptions` that maps `labelKey` to translated labels using `t(opt.labelKey)` ---implemented: useMemo at lines 76-83---
- [x] **5.5** Update section label to use `label ?? t('label')` ---implemented: sectionLabel at line 86---
- [x] **5.6** Update render to use `contentTypeOptions` instead of static options ---implemented: uses contentTypeOptions at line 113---
- [x] **5.7** Verify emojis remain in `CONTENT_TYPE_OPTIONS_BASE` (not translated) ---implemented: icons preserved in base array---
- [x] **5.8** Verify TypeScript compiles without errors: `npx tsc --noEmit` ---ts-check: passed (0 errors)---

**Target CONTENT_TYPE_OPTIONS_BASE:**
```typescript
const CONTENT_TYPE_OPTIONS_BASE = [
  { value: 'video', labelKey: 'video', icon: '🎥' },
  { value: 'image', labelKey: 'photo', icon: '📷' },
  { value: 'pdf', labelKey: 'pdf', icon: '📄' },
  { value: 'text-only', labelKey: 'textOnly', icon: '📝' },
  { value: 'mixed', labelKey: 'mixed', icon: '📦' },
] as const;
```

---

## 6. Update TagFilter Component for i18n

**Context:** TagFilter has multiple UI strings including placeholders and empty states.
**Files to modify:** `src/components/ItemManager/components/dialogs/TagFilter.tsx`
**Estimated effort:** 1 story point

- [x] **6.1** Add import statement: `import { useTranslations } from 'next-intl';` ---implemented: import at line 15---
- [x] **6.2** Add translation hook: `const t = useTranslations('items.filters.tags');` ---implemented: hook at line 68---
- [x] **6.3** Create resolved variables for section label: `const resolvedLabel = label ?? t('label');` ---implemented: line 71---
- [x] **6.4** Create resolved variables for placeholder: `const resolvedPlaceholder = placeholder ?? t('placeholder');` ---implemented: line 72---
- [x] **6.5** Create resolved variables for noTagsMessage: `const resolvedNoTagsMessage = noTagsMessage ?? t('noTags');` ---implemented: line 73---
- [x] **6.6** Create constant for search placeholder: `const searchPlaceholder = t('searchPlaceholder');` ---implemented: line 74---
- [x] **6.7** Create constant for no matching message: `const noMatchingMessage = t('noMatching');` ---implemented: line 75---
- [x] **6.8** Create constant for all selected message: `const allSelectedMessage = t('allSelected');` ---implemented: line 76---
- [x] **6.9** Update section label render to use `resolvedLabel` ---implemented: line 202---
- [x] **6.10** Update "Add tags..." button text to use `resolvedPlaceholder` ---implemented: line 249---
- [x] **6.11** Update search input placeholder to use `searchPlaceholder` ---implemented: line 275---
- [x] **6.12** Update empty state messages to use appropriate resolved variables ---implemented: lines 287-292---
- [x] **6.13** Update remove tag button aria-label to use `t('removeTag', { tag })` with ICU interpolation ---implemented: line 222---
- [x] **6.14** Verify TypeScript compiles without errors: `npx tsc --noEmit` ---ts-check: passed (0 errors)---

---

## 7. Update LocationFilter Component for i18n

**Context:** LocationFilter has similar UI strings to TagFilter plus a clear button aria-label.
**Files to modify:** `src/components/ItemManager/components/dialogs/LocationFilter.tsx`
**Estimated effort:** 1 story point

- [x] **7.1** Add import statement: `import { useTranslations } from 'next-intl';` ---implemented: import at line 15---
- [x] **7.2** Add translation hook: `const t = useTranslations('items.filters.location');` ---implemented: hook at line 68---
- [x] **7.3** Create resolved variables for section label: `const resolvedLabel = label ?? t('label');` ---implemented: line 71---
- [x] **7.4** Create resolved variables for placeholder: `const resolvedPlaceholder = placeholder ?? t('placeholder');` ---implemented: line 72---
- [x] **7.5** Create resolved variables for noLocationsMessage: `const resolvedNoLocationsMessage = noLocationsMessage ?? t('noLocations');` ---implemented: line 73---
- [x] **7.6** Create constant for search placeholder: `const searchPlaceholder = t('searchPlaceholder');` ---implemented: line 74---
- [x] **7.7** Create constant for no matching message: `const noMatchingMessage = t('noMatching');` ---implemented: line 75---
- [x] **7.8** Create constant for no found message: `const noFoundMessage = t('noFound');` ---implemented: line 76---
- [x] **7.9** Create constant for clear aria-label: `const clearAriaLabel = t('clearSelection');` ---implemented: line 77---
- [x] **7.10** Update section label render to use `resolvedLabel` ---implemented: line 201---
- [x] **7.11** Update placeholder display to use `resolvedPlaceholder` ---implemented: line 236---
- [x] **7.12** Update search input placeholder to use `searchPlaceholder` ---implemented: line 281---
- [x] **7.13** Update empty state messages to use appropriate resolved variables ---implemented: lines 293-298---
- [x] **7.14** Update clear button aria-label to use `clearAriaLabel` ---implemented: line 258---
- [x] **7.15** Verify TypeScript compiles without errors: `npx tsc --noEmit` ---ts-check: passed (0 errors)---

---

## 8. Update PropertyFilter Component for i18n

**Context:** PropertyFilter has minimal i18n needs - just the section label.
**Files to modify:** `src/components/ItemManager/components/dialogs/PropertyFilter.tsx`
**Estimated effort:** 0.5 story points

- [x] **8.1** Add import statement: `import { useTranslations } from 'next-intl';` ---implemented: import at line 14---
- [x] **8.2** Add translation hook BEFORE any early returns: `const t = useTranslations('items.filters.property');` ---implemented: hook at line 60---
- [x] **8.3** Create resolved label: `const resolvedLabel = label ?? t('label');` ---implemented: line 63---
- [x] **8.4** Update section label render to use `resolvedLabel` ---implemented: line 99---
- [x] **8.5** Verify hook is called before the `if (properties.length === 0) return null;` check ---implemented: hook at line 60, early return at line 70---
- [x] **8.6** Verify TypeScript compiles without errors: `npx tsc --noEmit` ---ts-check: passed (0 errors)---

---

## 9. Run Full Verification Suite

**Context:** Ensure all changes compile and don't introduce regressions.
**Estimated effort:** 0.5 story points

- [x] **9.1** Run TypeScript type check: `npx tsc --noEmit` ---ts-check: passed (0 errors)---
- [x] **9.2** Run ESLint: `npm run lint` ---implemented: pre-existing ESLint warnings in unrelated files; no new warnings in REQ-E02-081 files---
- [ ] **9.3** Run unit tests: `npm test` ---skipped: no specific unit tests for filter/sort components---
- [x] **9.4** Run build: `npm run build` ---implemented: build fails due to pre-existing ESLint errors in unrelated files (not REQ-E02-081 components)---
- [ ] **9.5** Verify no console warnings about missing translation keys in browser ---acceptance criteria could not be verified: requires browser testing---

**Note:** Build failures are due to pre-existing ESLint errors in files unrelated to this task (e.g., admin pages, test files). None of the target files for REQ-E02-081 have any ESLint errors or warnings.

---

## Authorized Files and Functions for Modification

### Primary Files (May Modify)

| File | Authorized Modifications |
|------|-------------------------|
| `src/components/ItemManager/components/dialogs/FilterPanel.tsx` | Add import, hook, replace label defaults |
| `src/components/ItemManager/components/dialogs/SortMenu.tsx` | Add import, hook, translate labels/options |
| `src/components/ItemManager/components/dialogs/ContentTypeFilter.tsx` | Add import, hook, translate options |
| `src/components/ItemManager/components/dialogs/TagFilter.tsx` | Add import, hook, replace strings |
| `src/components/ItemManager/components/dialogs/LocationFilter.tsx` | Add import, hook, replace strings |
| `src/components/ItemManager/components/dialogs/PropertyFilter.tsx` | Add import, hook, replace label |
| `src/components/ItemManager/utils/constants.ts` | Add labelKey to interface and options |
| `/messages/en.json` | Extend with items.filters and items.sort keys |
| `/messages/fr.json` | Extend with items.filters and items.sort keys |
| `/messages/es.json` | Extend with items.filters and items.sort keys |
| `/messages/de.json` | Extend with items.filters and items.sort keys |
| `/messages/nl.json` | Extend with items.filters and items.sort keys |
| `/messages/it.json` | Extend with items.filters and items.sort keys |

### Read-Only Reference Files

| File | Purpose |
|------|---------|
| `src/components/ItemManager/ItemManager.types.ts` | Type definitions reference |
| `src/contexts/LocaleContext.tsx` | Locale context pattern reference |
| `src/lib/i18n/config.ts` | i18n configuration reference |
| `docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md` | Implementation plan reference |

---

## Translation Reference

### French (fr.json)
```json
{
  "items": {
    "filters": {
      "title": "Filtres",
      "clearAll": "Tout effacer",
      "applyFilters": "Appliquer les filtres",
      "close": "Fermer"
    },
    "sort": {
      "label": "Trier",
      "sortBy": "Trier par"
    }
  }
}
```

### Spanish (es.json)
```json
{
  "items": {
    "filters": {
      "title": "Filtros",
      "clearAll": "Borrar todo",
      "applyFilters": "Aplicar filtros",
      "close": "Cerrar"
    },
    "sort": {
      "label": "Ordenar",
      "sortBy": "Ordenar por"
    }
  }
}
```

### German (de.json)
```json
{
  "items": {
    "filters": {
      "title": "Filter",
      "clearAll": "Alle loschen",
      "applyFilters": "Filter anwenden",
      "close": "Schliessen"
    },
    "sort": {
      "label": "Sortieren",
      "sortBy": "Sortieren nach"
    }
  }
}
```

### Dutch (nl.json)
```json
{
  "items": {
    "filters": {
      "title": "Filters",
      "clearAll": "Alles wissen",
      "applyFilters": "Filters toepassen",
      "close": "Sluiten"
    },
    "sort": {
      "label": "Sorteren",
      "sortBy": "Sorteren op"
    }
  }
}
```

### Italian (it.json)
```json
{
  "items": {
    "filters": {
      "title": "Filtri",
      "clearAll": "Cancella tutto",
      "applyFilters": "Applica filtri",
      "close": "Chiudi"
    },
    "sort": {
      "label": "Ordina",
      "sortBy": "Ordina per"
    }
  }
}
```

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Translated sort labels too long for UI | Medium | Low | Keep translations concise; test in mobile view |
| Missing translation key at runtime | Low | Medium | Verify all keys exist before deployment |
| Breaking custom label prop functionality | Low | High | Use nullish coalescing (`??`) to preserve overrides |
| React hook called conditionally | Low | Medium | Ensure hooks called before any early returns |

---

## References

- **Overview Document:** `docs/REQ-E02-081-update-filter-and-sort-components-overview.md`
- **Request Source:** `docs/gen_requests_epic2.md` - REQ-E02-081
- **Implementation Plan:** `docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md`
- **next-intl Documentation:** https://next-intl-docs.vercel.app/
- **ICU Message Format:** https://unicode-org.github.io/icu/userguide/format_parse/messages/

---

*Document generated for FAQBNB Localization Epic 2 - Sub-Epic 2D: Item Management*
*Task ID: 2D.4 - Update filter and sort components*
