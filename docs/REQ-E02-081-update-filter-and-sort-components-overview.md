# REQ-E02-081: Update Filter and Sort Components for Internationalization

**Document Type:** Implementation Breakdown (Overview)
**Request ID:** REQ-E02-081
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2D - Item Management
**Task Reference:** 2D.4
**Priority:** High
**Size:** M (Medium)

**Created:** 2026-01-20
**Last Modified:** 2026-01-22 14:49

---

## 1. Summary

This document provides the implementation breakdown for adding internationalization support to the filter and sort components in the ItemManager system. These components include FilterPanel, SortMenu, ContentTypeFilter, TagFilter, LocationFilter, and PropertyFilter. The implementation requires integrating next-intl translations for all hardcoded UI strings, including labels, placeholders, empty states, and accessibility attributes, ensuring users can interact with filtering and sorting controls in French, Spanish, German, Italian, and Dutch.

---

## 2. Requirements Analysis

### 2.1 Source Request Overview

**From:** `/docs/gen_requests_epic2.md` - Request #81

The filter and sort components must be updated to:
1. Display localized UI labels using next-intl translation hooks
2. Translate all section headers, button labels, and dropdown options
3. Provide translated placeholder text and empty state messages
4. Ensure accessibility attributes (aria-labels) reflect the current language
5. Support language switching without page reload

### 2.2 Current Behavior

**FilterPanel** (`src/components/ItemManager/components/dialogs/FilterPanel.tsx`):
- Hardcoded default labels in `DEFAULT_LABELS` constant (lines 89-98):
  - `title: 'Filters'`
  - `clearAll: 'Clear All'`
  - `contentType: 'Content Type'`
  - `tags: 'Tags'`
  - `location: 'Location'`
  - `property: 'Property'`
  - `applyFilters: 'Apply Filters'`
  - `close: 'Close'`
- Supports optional `labels` prop for i18n but uses English defaults

**SortMenu** (`src/components/ItemManager/components/dialogs/SortMenu.tsx`):
- Hardcoded default labels (lines 124-128):
  - `sortLabel: 'Sort'`
  - `sortByLabel: 'Sort by'`
- Uses `SORT_OPTIONS` from constants with hardcoded English labels

**SORT_OPTIONS** (`src/components/ItemManager/utils/constants.ts`):
- Hardcoded sort option labels (lines 31-41):
  - `'Title (A-Z)'`, `'Title (Z-A)'`
  - `'Newest First'`, `'Oldest First'`
  - `'Recently Modified'`, `'Least Recently Modified'`
  - `'Location (A-Z)'`
  - `'Most Guides'`, `'Fewest Guides'`

**ContentTypeFilter** (`src/components/ItemManager/components/dialogs/ContentTypeFilter.tsx`):
- Hardcoded `CONTENT_TYPE_OPTIONS` constant (lines 24-30):
  - `'Video'`, `'Photo'`, `'PDF'`, `'Text Only'`, `'Mixed'`
- Default `label: 'Content Type'` (line 67)

**TagFilter** (`src/components/ItemManager/components/dialogs/TagFilter.tsx`):
- Hardcoded default values (lines 62-64):
  - `label: 'Tags'`
  - `placeholder: 'Add tags...'`
  - `noTagsMessage: 'No tags available'`
- Hardcoded search placeholder (line 264): `'Search tags...'`
- Hardcoded empty state messages (lines 277-281):
  - `'No matching tags'`
  - `'All tags selected'`

**LocationFilter** (`src/components/ItemManager/components/dialogs/LocationFilter.tsx`):
- Hardcoded default values (lines 62-64):
  - `label: 'Location'`
  - `placeholder: 'Select location...'`
  - `noLocationsMessage: 'No locations available'`
- Hardcoded search placeholder (line 268): `'Search locations...'`
- Hardcoded empty state messages (lines 280-285):
  - `'No matching locations'`
  - `'No locations found'`
- Hardcoded aria-label (line 246): `'Clear location selection'`

**PropertyFilter** (`src/components/ItemManager/components/dialogs/PropertyFilter.tsx`):
- Default `label: 'Property'` (line 56)
- No placeholder or empty state messages (returns null when no properties)

### 2.3 Expected Behavior

After implementation:
1. All filter and sort labels use translation hooks (`useTranslations('items.filters')`)
2. Sort option labels display in the selected language
3. Content type filter chips show translated type names
4. Tag and Location filters display translated placeholders and empty states
5. All aria-labels reflect the selected language for accessibility
6. Components respond to locale context changes without page reload

---

## 3. Technical Approach

### 3.1 Architecture Pattern

Following the established Epic 2 pattern for client components:

```typescript
// Pattern for filter components
'use client';
import { useTranslations } from 'next-intl';

function FilterComponent() {
  const t = useTranslations('items.filters');
  return <span>{t('title')}</span>;
}
```

### 3.2 Translation Namespace

All translations will be added to the `items` namespace in `/messages/*.json` under a new `filters` and `sort` sub-namespace:

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

### 3.3 Dependencies

| Dependency | Status | Location |
|------------|--------|----------|
| next-intl | Installed | `package.json` |
| useTranslations hook | Available | `next-intl` |
| Translation files | Exists | `/messages/*.json` |
| items namespace | Exists | `/messages/en.json` |
| LocaleContext | Available | `src/contexts/LocaleContext.tsx` |

---

## 4. Implementation Tasks

### Task 1: Extend items namespace in translation files (Priority: High)

**Description:** Add new translation keys for filter and sort components to all 6 language files.

**Files to Modify:**
- `/messages/en.json`
- `/messages/fr.json`
- `/messages/es.json`
- `/messages/de.json`
- `/messages/nl.json`
- `/messages/it.json`

**Acceptance Criteria:**
- [ ] Add `items.filters.*` keys for all filter-related translations
- [ ] Add `items.sort.*` keys for all sort-related translations
- [ ] Add `items.filters.contentType.*` keys for content type labels
- [ ] Add `items.filters.tags.*` keys for tag filter strings
- [ ] Add `items.filters.location.*` keys for location filter strings
- [ ] Add `items.filters.property.*` keys for property filter strings
- [ ] All 6 language files contain identical key structure

---

### Task 2: Update FilterPanel component for i18n (Priority: High)

**Description:** Add translation hook and replace hardcoded DEFAULT_LABELS with translated strings.

**File to Modify:** `src/components/ItemManager/components/dialogs/FilterPanel.tsx`

**Current Code (lines 89-98):**
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

**Target Approach:**
```typescript
import { useTranslations } from 'next-intl';

export function FilterPanel({ ... }: FilterPanelProps) {
  const t = useTranslations('items.filters');

  // Build labels from translations, allowing custom overrides
  const labels: Required<FilterPanelLabels> = {
    title: customLabels.title ?? t('title'),
    clearAll: customLabels.clearAll ?? t('clearAll'),
    contentType: customLabels.contentType ?? t('contentType.label'),
    tags: customLabels.tags ?? t('tags.label'),
    location: customLabels.location ?? t('location.label'),
    property: customLabels.property ?? t('property.label'),
    applyFilters: customLabels.applyFilters ?? t('applyFilters'),
    close: customLabels.close ?? t('close'),
  };
  // ...
}
```

**Acceptance Criteria:**
- [ ] Import `useTranslations` from `next-intl`
- [ ] Initialize translation hook with `items.filters` namespace
- [ ] Replace DEFAULT_LABELS with translated values
- [ ] Preserve custom labels prop override capability
- [ ] TypeScript compiles without errors

---

### Task 3: Update SortMenu component for i18n (Priority: High)

**Description:** Add translation hook and translate sort labels and options.

**File to Modify:** `src/components/ItemManager/components/dialogs/SortMenu.tsx`

**Current Code (lines 124-128):**
```typescript
const mergedLabels = {
  sortLabel: 'Sort',
  sortByLabel: 'Sort by',
  ...labels,
};
```

**Target Approach:**
```typescript
import { useTranslations } from 'next-intl';

export function SortMenu({ ... }: SortMenuProps) {
  const t = useTranslations('items.sort');

  const mergedLabels = {
    sortLabel: labels?.sortLabel ?? t('label'),
    sortByLabel: labels?.sortByLabel ?? t('sortBy'),
  };

  // Translate sort options dynamically
  const translatedSortOptions = useMemo(() =>
    sortOptions.map(option => ({
      ...option,
      label: t(`options.${option.value.replace(/-/g, '')}`) || option.label,
    })),
    [sortOptions, t]
  );
  // ...
}
```

**Acceptance Criteria:**
- [ ] Import `useTranslations` from `next-intl`
- [ ] Initialize translation hook with `items.sort` namespace
- [ ] Replace hardcoded sort labels with translations
- [ ] Translate sort option labels
- [ ] Preserve custom labels prop override capability
- [ ] TypeScript compiles without errors

---

### Task 4: Update ContentTypeFilter component for i18n (Priority: High)

**Description:** Translate content type labels and section header.

**File to Modify:** `src/components/ItemManager/components/dialogs/ContentTypeFilter.tsx`

**Current Code (lines 24-30):**
```typescript
const CONTENT_TYPE_OPTIONS = [
  { value: 'video', label: 'Video', icon: '...' },
  { value: 'image', label: 'Photo', icon: '...' },
  { value: 'pdf', label: 'PDF', icon: '...' },
  { value: 'text-only', label: 'Text Only', icon: '...' },
  { value: 'mixed', label: 'Mixed', icon: '...' },
] as const;
```

**Target Approach:**
```typescript
import { useTranslations } from 'next-intl';

// Keep value and icon static, translate label dynamically
const CONTENT_TYPE_OPTIONS_BASE = [
  { value: 'video', key: 'video', icon: '...' },
  { value: 'image', key: 'photo', icon: '...' },
  { value: 'pdf', key: 'pdf', icon: '...' },
  { value: 'text-only', key: 'textOnly', icon: '...' },
  { value: 'mixed', key: 'mixed', icon: '...' },
] as const;

export function ContentTypeFilter({ ... }: ContentTypeFilterProps) {
  const t = useTranslations('items.filters.contentType');

  const contentTypeOptions = useMemo(() =>
    CONTENT_TYPE_OPTIONS_BASE.map(opt => ({
      value: opt.value,
      label: t(opt.key),
      icon: opt.icon,
    })),
    [t]
  );

  // Use translated label prop or fall back to translation
  const sectionLabel = label ?? t('label');
  // ...
}
```

**Acceptance Criteria:**
- [ ] Import `useTranslations` from `next-intl`
- [ ] Translate all content type option labels
- [ ] Keep emojis consistent across locales
- [ ] Translate section label
- [ ] TypeScript compiles without errors

---

### Task 5: Update TagFilter component for i18n (Priority: High)

**Description:** Translate labels, placeholders, and empty state messages.

**File to Modify:** `src/components/ItemManager/components/dialogs/TagFilter.tsx`

**Current Code (lines 62-64, 264, 277-281):**
```typescript
label = 'Tags',
placeholder = 'Add tags...',
noTagsMessage = 'No tags available',
// ...
placeholder="Search tags..."
// ...
{searchQuery ? 'No matching tags' : availableTags.length === 0 ? noTagsMessage : 'All tags selected'}
```

**Target Approach:**
```typescript
import { useTranslations } from 'next-intl';

export function TagFilter({ label, placeholder, noTagsMessage, ... }: TagFilterProps) {
  const t = useTranslations('items.filters.tags');

  const resolvedLabel = label ?? t('label');
  const resolvedPlaceholder = placeholder ?? t('placeholder');
  const resolvedNoTagsMessage = noTagsMessage ?? t('noTags');
  const searchPlaceholder = t('searchPlaceholder');
  const noMatchingMessage = t('noMatching');
  const allSelectedMessage = t('allSelected');

  // Render empty state
  {filteredTags.length === 0 ? (
    <div className="...">
      {searchQuery
        ? noMatchingMessage
        : availableTags.length === 0
        ? resolvedNoTagsMessage
        : allSelectedMessage}
    </div>
  ) : (...)}

  // Update aria-label for remove button
  aria-label={t('removeTag', { tag })}
}
```

**Acceptance Criteria:**
- [ ] Import `useTranslations` from `next-intl`
- [ ] Translate section label
- [ ] Translate "Add tags..." placeholder
- [ ] Translate "Search tags..." placeholder
- [ ] Translate all empty state messages
- [ ] Translate remove tag aria-label with interpolation
- [ ] Preserve custom prop overrides
- [ ] TypeScript compiles without errors

---

### Task 6: Update LocationFilter component for i18n (Priority: High)

**Description:** Translate labels, placeholders, empty states, and accessibility text.

**File to Modify:** `src/components/ItemManager/components/dialogs/LocationFilter.tsx`

**Current Code (lines 62-64, 246, 268, 280-285):**
```typescript
label = 'Location',
placeholder = 'Select location...',
noLocationsMessage = 'No locations available',
// ...
aria-label="Clear location selection"
// ...
placeholder="Search locations..."
// ...
{searchQuery ? 'No matching locations' : availableLocations.length === 0 ? noLocationsMessage : 'No locations found'}
```

**Target Approach:**
```typescript
import { useTranslations } from 'next-intl';

export function LocationFilter({ label, placeholder, noLocationsMessage, ... }: LocationFilterProps) {
  const t = useTranslations('items.filters.location');

  const resolvedLabel = label ?? t('label');
  const resolvedPlaceholder = placeholder ?? t('placeholder');
  const resolvedNoLocationsMessage = noLocationsMessage ?? t('noLocations');
  const searchPlaceholder = t('searchPlaceholder');
  const noMatchingMessage = t('noMatching');
  const clearAriaLabel = t('clearSelection');

  // Update clear button aria-label
  aria-label={clearAriaLabel}
}
```

**Acceptance Criteria:**
- [ ] Import `useTranslations` from `next-intl`
- [ ] Translate section label
- [ ] Translate "Select location..." placeholder
- [ ] Translate "Search locations..." placeholder
- [ ] Translate all empty state messages
- [ ] Translate clear button aria-label
- [ ] Preserve custom prop overrides
- [ ] TypeScript compiles without errors

---

### Task 7: Update PropertyFilter component for i18n (Priority: Medium)

**Description:** Translate section label.

**File to Modify:** `src/components/ItemManager/components/dialogs/PropertyFilter.tsx`

**Current Code (line 56):**
```typescript
label = 'Property',
```

**Target Approach:**
```typescript
import { useTranslations } from 'next-intl';

export function PropertyFilter({ label, ... }: PropertyFilterProps) {
  const t = useTranslations('items.filters.property');
  const resolvedLabel = label ?? t('label');
  // ...
}
```

**Acceptance Criteria:**
- [ ] Import `useTranslations` from `next-intl`
- [ ] Translate section label
- [ ] Preserve custom label prop override
- [ ] TypeScript compiles without errors

---

### Task 8: Update constants.ts sort options (Priority: Medium)

**Description:** Modify SORT_OPTIONS structure to support translation key mapping.

**File to Modify:** `src/components/ItemManager/utils/constants.ts`

**Current Code (lines 31-41):**
```typescript
export const SORT_OPTIONS: SortOptionItem[] = [
  { value: 'title-asc', label: 'Title (A-Z)', icon: 'asc' },
  { value: 'title-desc', label: 'Title (Z-A)', icon: 'desc' },
  // ...
];
```

**Target Approach:**
```typescript
// Option A: Add translation key field
export interface SortOptionItem {
  value: SortOption;
  label: string;       // Default English label (fallback)
  labelKey: string;    // Translation key
  icon?: 'asc' | 'desc' | 'none';
}

export const SORT_OPTIONS: SortOptionItem[] = [
  { value: 'title-asc', label: 'Title (A-Z)', labelKey: 'titleAsc', icon: 'asc' },
  { value: 'title-desc', label: 'Title (Z-A)', labelKey: 'titleDesc', icon: 'desc' },
  { value: 'created-desc', label: 'Newest First', labelKey: 'newestFirst', icon: 'desc' },
  { value: 'created-asc', label: 'Oldest First', labelKey: 'oldestFirst', icon: 'asc' },
  { value: 'updated-desc', label: 'Recently Modified', labelKey: 'recentlyModified', icon: 'desc' },
  { value: 'updated-asc', label: 'Least Recently Modified', labelKey: 'leastRecentlyModified', icon: 'asc' },
  { value: 'location-asc', label: 'Location (A-Z)', labelKey: 'locationAsc', icon: 'asc' },
  { value: 'instructions-desc', label: 'Most Guides', labelKey: 'mostGuides', icon: 'desc' },
  { value: 'instructions-asc', label: 'Fewest Guides', labelKey: 'fewestGuides', icon: 'asc' },
];
```

**Acceptance Criteria:**
- [ ] Add `labelKey` field to `SortOptionItem` interface
- [ ] Update all sort options with translation keys
- [ ] Preserve original `label` field as fallback
- [ ] TypeScript compiles without errors
- [ ] SortMenu can use `labelKey` for translation lookup

---

### Task 9: Testing and verification (Priority: High)

**Description:** Verify all translations work correctly across languages.

**Test Scenarios:**
1. Open FilterPanel in each of the 6 languages and verify:
   - Header title "Filters" is translated
   - "Clear All" button label is translated
   - Section headers (Content Type, Tags, Location, Property) are translated
   - "Apply Filters" button (mobile) is translated
   - Close button aria-label is translated
2. Test ContentTypeFilter chips in each language
3. Test TagFilter:
   - "Add tags..." placeholder is translated
   - "Search tags..." placeholder is translated
   - Empty state messages are translated
   - Remove tag aria-label is translated
4. Test LocationFilter:
   - "Select location..." placeholder is translated
   - "Search locations..." placeholder is translated
   - Empty state messages are translated
   - Clear button aria-label is translated
5. Test SortMenu in each language:
   - "Sort" and "Sort by" labels are translated
   - All 9 sort option labels are translated
6. Test language switching updates all text without page reload
7. Verify no console warnings about missing translation keys

**Acceptance Criteria:**
- [ ] All 6 languages display correctly
- [ ] No missing translation warnings in console
- [ ] Language switching updates UI without reload
- [ ] TypeScript compiles without errors
- [ ] Existing filter/sort functionality preserved
- [ ] Screen reader announces correctly in all languages

---

## 5. Authorized Files and Functions for Modification

### 5.1 Primary Files

| File | Functions/Sections | Modification Type |
|------|-------------------|-------------------|
| `src/components/ItemManager/components/dialogs/FilterPanel.tsx` | `FilterPanel` function, `DEFAULT_LABELS` | Add import, add hook, replace labels |
| `src/components/ItemManager/components/dialogs/SortMenu.tsx` | `SortMenu` function, `mergedLabels` | Add import, add hook, replace labels |
| `src/components/ItemManager/components/dialogs/ContentTypeFilter.tsx` | `ContentTypeFilter` function, `CONTENT_TYPE_OPTIONS` | Add import, add hook, translate options |
| `src/components/ItemManager/components/dialogs/TagFilter.tsx` | `TagFilter` function | Add import, add hook, replace strings |
| `src/components/ItemManager/components/dialogs/LocationFilter.tsx` | `LocationFilter` function | Add import, add hook, replace strings |
| `src/components/ItemManager/components/dialogs/PropertyFilter.tsx` | `PropertyFilter` function | Add import, add hook, replace label |
| `src/components/ItemManager/utils/constants.ts` | `SortOptionItem` interface, `SORT_OPTIONS` | Add labelKey field |
| `/messages/en.json` | `items` namespace | Extend with filters/sort keys |
| `/messages/fr.json` | `items` namespace | Extend with filters/sort keys |
| `/messages/es.json` | `items` namespace | Extend with filters/sort keys |
| `/messages/de.json` | `items` namespace | Extend with filters/sort keys |
| `/messages/nl.json` | `items` namespace | Extend with filters/sort keys |
| `/messages/it.json` | `items` namespace | Extend with filters/sort keys |

### 5.2 Functions to Modify

**FilterPanel.tsx:**
- `FilterPanel` function component - add useTranslations hook, replace DEFAULT_LABELS logic

**SortMenu.tsx:**
- `SortMenu` function component - add useTranslations hook, translate labels and options
- `getSortLabel` helper - may need to accept translation function

**ContentTypeFilter.tsx:**
- `ContentTypeFilter` function component - add useTranslations hook
- `CONTENT_TYPE_OPTIONS` constant - refactor to support translation keys

**TagFilter.tsx:**
- `TagFilter` function component - add useTranslations hook, replace all hardcoded strings

**LocationFilter.tsx:**
- `LocationFilter` function component - add useTranslations hook, replace all hardcoded strings

**PropertyFilter.tsx:**
- `PropertyFilter` function component - add useTranslations hook, replace label default

**constants.ts:**
- `SortOptionItem` interface - add `labelKey` property
- `SORT_OPTIONS` constant - add `labelKey` to each option

### 5.3 Read-Only Reference Files

| File | Purpose |
|------|---------|
| `src/components/ItemManager/ItemManager.types.ts` | Type definitions reference |
| `src/contexts/LocaleContext.tsx` | Locale context pattern reference |
| `src/lib/i18n/config.ts` | i18n configuration reference |
| `src/components/LogoutButton.tsx` | Pattern reference for useTranslations usage |
| `docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md` | Implementation plan reference |

---

## 6. Translation Strings Required

### 6.1 English (en.json) - New Keys

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

### 6.2 French (fr.json) - Translations

```json
{
  "items": {
    "filters": {
      "title": "Filtres",
      "clearAll": "Tout effacer",
      "applyFilters": "Appliquer les filtres",
      "close": "Fermer",
      "contentType": {
        "label": "Type de contenu",
        "video": "Video",
        "photo": "Photo",
        "pdf": "PDF",
        "textOnly": "Texte seul",
        "mixed": "Mixte"
      },
      "tags": {
        "label": "Tags",
        "placeholder": "Ajouter des tags...",
        "searchPlaceholder": "Rechercher des tags...",
        "noTags": "Aucun tag disponible",
        "noMatching": "Aucun tag correspondant",
        "allSelected": "Tous les tags selectionnes",
        "removeTag": "Supprimer le tag {tag}"
      },
      "location": {
        "label": "Emplacement",
        "placeholder": "Selectionner un emplacement...",
        "searchPlaceholder": "Rechercher des emplacements...",
        "noLocations": "Aucun emplacement disponible",
        "noMatching": "Aucun emplacement correspondant",
        "clearSelection": "Effacer la selection d'emplacement"
      },
      "property": {
        "label": "Propriete"
      }
    },
    "sort": {
      "label": "Trier",
      "sortBy": "Trier par",
      "options": {
        "titleAsc": "Titre (A-Z)",
        "titleDesc": "Titre (Z-A)",
        "newestFirst": "Plus recent d'abord",
        "oldestFirst": "Plus ancien d'abord",
        "recentlyModified": "Recemment modifie",
        "leastRecentlyModified": "Moins recemment modifie",
        "locationAsc": "Emplacement (A-Z)",
        "mostGuides": "Plus de guides",
        "fewestGuides": "Moins de guides"
      }
    }
  }
}
```

### 6.3 Spanish (es.json) - Translations

```json
{
  "items": {
    "filters": {
      "title": "Filtros",
      "clearAll": "Borrar todo",
      "applyFilters": "Aplicar filtros",
      "close": "Cerrar",
      "contentType": {
        "label": "Tipo de contenido",
        "video": "Video",
        "photo": "Foto",
        "pdf": "PDF",
        "textOnly": "Solo texto",
        "mixed": "Mixto"
      },
      "tags": {
        "label": "Etiquetas",
        "placeholder": "Agregar etiquetas...",
        "searchPlaceholder": "Buscar etiquetas...",
        "noTags": "No hay etiquetas disponibles",
        "noMatching": "No hay etiquetas coincidentes",
        "allSelected": "Todas las etiquetas seleccionadas",
        "removeTag": "Eliminar etiqueta {tag}"
      },
      "location": {
        "label": "Ubicacion",
        "placeholder": "Seleccionar ubicacion...",
        "searchPlaceholder": "Buscar ubicaciones...",
        "noLocations": "No hay ubicaciones disponibles",
        "noMatching": "No hay ubicaciones coincidentes",
        "clearSelection": "Borrar seleccion de ubicacion"
      },
      "property": {
        "label": "Propiedad"
      }
    },
    "sort": {
      "label": "Ordenar",
      "sortBy": "Ordenar por",
      "options": {
        "titleAsc": "Titulo (A-Z)",
        "titleDesc": "Titulo (Z-A)",
        "newestFirst": "Mas reciente primero",
        "oldestFirst": "Mas antiguo primero",
        "recentlyModified": "Modificado recientemente",
        "leastRecentlyModified": "Menos recientemente modificado",
        "locationAsc": "Ubicacion (A-Z)",
        "mostGuides": "Mas guias",
        "fewestGuides": "Menos guias"
      }
    }
  }
}
```

### 6.4 German (de.json) - Translations

```json
{
  "items": {
    "filters": {
      "title": "Filter",
      "clearAll": "Alle loschen",
      "applyFilters": "Filter anwenden",
      "close": "Schliessen",
      "contentType": {
        "label": "Inhaltstyp",
        "video": "Video",
        "photo": "Foto",
        "pdf": "PDF",
        "textOnly": "Nur Text",
        "mixed": "Gemischt"
      },
      "tags": {
        "label": "Tags",
        "placeholder": "Tags hinzufugen...",
        "searchPlaceholder": "Tags suchen...",
        "noTags": "Keine Tags verfugbar",
        "noMatching": "Keine passenden Tags",
        "allSelected": "Alle Tags ausgewahlt",
        "removeTag": "Tag {tag} entfernen"
      },
      "location": {
        "label": "Standort",
        "placeholder": "Standort auswahlen...",
        "searchPlaceholder": "Standorte suchen...",
        "noLocations": "Keine Standorte verfugbar",
        "noMatching": "Keine passenden Standorte",
        "clearSelection": "Standortauswahl loschen"
      },
      "property": {
        "label": "Immobilie"
      }
    },
    "sort": {
      "label": "Sortieren",
      "sortBy": "Sortieren nach",
      "options": {
        "titleAsc": "Titel (A-Z)",
        "titleDesc": "Titel (Z-A)",
        "newestFirst": "Neueste zuerst",
        "oldestFirst": "Alteste zuerst",
        "recentlyModified": "Kurzlich geandert",
        "leastRecentlyModified": "Am wenigsten kurzlich geandert",
        "locationAsc": "Standort (A-Z)",
        "mostGuides": "Meiste Anleitungen",
        "fewestGuides": "Wenigste Anleitungen"
      }
    }
  }
}
```

### 6.5 Dutch (nl.json) - Translations

```json
{
  "items": {
    "filters": {
      "title": "Filters",
      "clearAll": "Alles wissen",
      "applyFilters": "Filters toepassen",
      "close": "Sluiten",
      "contentType": {
        "label": "Inhoudstype",
        "video": "Video",
        "photo": "Foto",
        "pdf": "PDF",
        "textOnly": "Alleen tekst",
        "mixed": "Gemengd"
      },
      "tags": {
        "label": "Tags",
        "placeholder": "Tags toevoegen...",
        "searchPlaceholder": "Tags zoeken...",
        "noTags": "Geen tags beschikbaar",
        "noMatching": "Geen overeenkomende tags",
        "allSelected": "Alle tags geselecteerd",
        "removeTag": "Tag {tag} verwijderen"
      },
      "location": {
        "label": "Locatie",
        "placeholder": "Locatie selecteren...",
        "searchPlaceholder": "Locaties zoeken...",
        "noLocations": "Geen locaties beschikbaar",
        "noMatching": "Geen overeenkomende locaties",
        "clearSelection": "Locatieselectie wissen"
      },
      "property": {
        "label": "Eigendom"
      }
    },
    "sort": {
      "label": "Sorteren",
      "sortBy": "Sorteren op",
      "options": {
        "titleAsc": "Titel (A-Z)",
        "titleDesc": "Titel (Z-A)",
        "newestFirst": "Nieuwste eerst",
        "oldestFirst": "Oudste eerst",
        "recentlyModified": "Recent gewijzigd",
        "leastRecentlyModified": "Minst recent gewijzigd",
        "locationAsc": "Locatie (A-Z)",
        "mostGuides": "Meeste handleidingen",
        "fewestGuides": "Minste handleidingen"
      }
    }
  }
}
```

### 6.6 Italian (it.json) - Translations

```json
{
  "items": {
    "filters": {
      "title": "Filtri",
      "clearAll": "Cancella tutto",
      "applyFilters": "Applica filtri",
      "close": "Chiudi",
      "contentType": {
        "label": "Tipo di contenuto",
        "video": "Video",
        "photo": "Foto",
        "pdf": "PDF",
        "textOnly": "Solo testo",
        "mixed": "Misto"
      },
      "tags": {
        "label": "Tag",
        "placeholder": "Aggiungi tag...",
        "searchPlaceholder": "Cerca tag...",
        "noTags": "Nessun tag disponibile",
        "noMatching": "Nessun tag corrispondente",
        "allSelected": "Tutti i tag selezionati",
        "removeTag": "Rimuovi tag {tag}"
      },
      "location": {
        "label": "Posizione",
        "placeholder": "Seleziona posizione...",
        "searchPlaceholder": "Cerca posizioni...",
        "noLocations": "Nessuna posizione disponibile",
        "noMatching": "Nessuna posizione corrispondente",
        "clearSelection": "Cancella selezione posizione"
      },
      "property": {
        "label": "Proprieta"
      }
    },
    "sort": {
      "label": "Ordina",
      "sortBy": "Ordina per",
      "options": {
        "titleAsc": "Titolo (A-Z)",
        "titleDesc": "Titolo (Z-A)",
        "newestFirst": "Piu recenti prima",
        "oldestFirst": "Piu vecchi prima",
        "recentlyModified": "Modificato di recente",
        "leastRecentlyModified": "Meno recentemente modificato",
        "locationAsc": "Posizione (A-Z)",
        "mostGuides": "Piu guide",
        "fewestGuides": "Meno guide"
      }
    }
  }
}
```

---

## 7. Dependencies and Blockers

### 7.1 Prerequisites
- [x] Epic 1 foundation complete (next-intl installed and configured)
- [x] Translation files exist for all 6 languages
- [x] LocaleContext available for locale state management
- [x] `items` namespace exists in translation files

### 7.2 Dependencies on Other Requests
| Request | Dependency Type | Status |
|---------|-----------------|--------|
| REQ-E02-078 (Create items namespace structure) | Foundation | Complete |
| REQ-E02-079 (Update ItemManager component family) | Should be completed first | In Progress |
| REQ-E02-080 (Update ItemGrid and ItemCard) | Parallel task | In Progress |

### 7.3 Potential Blockers
- None identified - all prerequisites are met

---

## 8. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Sort option labels too long in some languages | Medium | Low | Keep labels concise; test layout |
| Filter component props override not working with translations | Low | Medium | Preserve nullable check pattern (`??`) |
| Performance impact from multiple translation hook calls | Low | Low | Hooks are memoized by next-intl |
| Missing translation keys in production | Low | High | Add build-time translation key validation |
| Search placeholder text truncation | Low | Low | Use ellipsis; test in mobile view |

---

## 9. Verification Checklist

### 9.1 Functional Verification
- [ ] FilterPanel displays all labels in all 6 languages
- [ ] SortMenu displays sort label and all options in all 6 languages
- [ ] ContentTypeFilter shows translated type labels with consistent emojis
- [ ] TagFilter shows translated placeholders and empty states
- [ ] LocationFilter shows translated placeholders and empty states
- [ ] PropertyFilter shows translated label
- [ ] "Clear All" and "Apply Filters" buttons work correctly
- [ ] Language switching updates all text without page reload
- [ ] Custom label props still override translations

### 9.2 Accessibility Verification
- [ ] All aria-labels are translated correctly
- [ ] Screen reader announces filter changes in selected language
- [ ] Keyboard navigation continues to work
- [ ] Remove tag aria-label includes tag name in all languages

### 9.3 Code Quality Verification
- [ ] TypeScript compiles without errors
- [ ] No console warnings for missing translation keys
- [ ] Translation keys follow naming convention (`items.filters.*`, `items.sort.*`)
- [ ] All 6 language files have identical key structure

---

## 10. References

- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md`
- **Request Source:** `/docs/gen_requests_epic2.md` - REQ-E02-081
- **Epic 1 Foundation:** `/docs/prd/Plan-110-L10N-Epic1-Foundation.md`
- **Pattern Reference:** `src/components/LogoutButton.tsx` (useTranslations usage)
- **next-intl Documentation:** https://next-intl-docs.vercel.app/
- **ICU Message Format:** https://unicode-org.github.io/icu/userguide/format_parse/messages/

---

*Document generated for FAQBNB Localization Epic 2 - Sub-Epic 2D: Item Management*
