# REQ-388: Update Filter and Sort Components for Localization - Detailed Task Breakdown

**Document Created**: 2026-01-19 19:45 UTC
**Last Modified**: 2026-01-19 19:45 UTC
**Request ID**: REQ-388
**Epic**: 2 - Static UI Translation
**Sub-Epic**: 2D - Item Management
**Task ID**: 2D.4
**Size**: M (Medium)
**Type**: ENHANCEMENT
**Overview Document**: [REQ-388-update-filter-and-sort-components-overview.md](./REQ-388-update-filter-and-sort-components-overview.md)

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Prerequisites](#prerequisites)
3. [Task Breakdown](#task-breakdown)
4. [Implementation Details](#implementation-details)
5. [Testing Requirements](#testing-requirements)
6. [Acceptance Criteria Checklist](#acceptance-criteria-checklist)
7. [Rollback Plan](#rollback-plan)

---

## Executive Summary

This document provides a granular, step-by-step implementation guide for localizing all filter and sort components in the ItemManager. The work is divided into 7 main tasks with approximately 25 sub-tasks, each designed to be a 1-story-point unit of work that can be completed independently and verified.

**Total Estimated Effort**: ~5.5 hours
**Files to Modify**: 12 files (6 components + 6 translation files)
**New Translation Keys**: ~40 keys per language

---

## Prerequisites

Before starting this implementation, verify:

- [ ] Epic 1 Foundation complete (next-intl installed, configured)
- [ ] Translation files exist at `/messages/{en,fr,es,de,nl,it}.json`
- [ ] `useTranslations` hook available from next-intl
- [ ] Existing `items` namespace in translation files (or create it)

---

## Task Breakdown

### Task 1: Add Translation Keys to English File

**Objective**: Add all filter and sort translation keys to `/messages/en.json`

**File**: `/messages/en.json`

**Duration**: ~30 minutes

#### Sub-task 1.1: Add items.filters namespace

Add the following structure under the `items` key (create if not exists):

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

**Verification**:
- JSON is valid (no syntax errors)
- All keys from component audit are included

---

### Task 2: Add Translations to Non-English Language Files

**Objective**: Add translated strings to all 5 non-English language files

**Duration**: ~30 minutes (using AI translation assistance)

#### Sub-task 2.1: Add French translations to `/messages/fr.json`

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
        "textOnly": "Texte uniquement",
        "mixed": "Mixte"
      },
      "tags": {
        "label": "Etiquettes",
        "placeholder": "Ajouter des etiquettes...",
        "searchPlaceholder": "Rechercher des etiquettes...",
        "noTags": "Aucune etiquette disponible",
        "noMatching": "Aucune etiquette correspondante",
        "allSelected": "Toutes les etiquettes selectionnees",
        "removeTag": "Supprimer l'etiquette {tag}"
      },
      "location": {
        "label": "Emplacement",
        "placeholder": "Selectionner un emplacement...",
        "searchPlaceholder": "Rechercher des emplacements...",
        "noLocations": "Aucun emplacement disponible",
        "noMatching": "Aucun emplacement correspondant",
        "noFound": "Aucun emplacement trouve",
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
        "newestFirst": "Plus recents",
        "oldestFirst": "Plus anciens",
        "recentlyModified": "Recemment modifies",
        "leastRecentlyModified": "Moins recemment modifies",
        "locationAsc": "Emplacement (A-Z)",
        "mostGuides": "Plus de guides",
        "fewestGuides": "Moins de guides"
      }
    }
  }
}
```

#### Sub-task 2.2: Add Spanish translations to `/messages/es.json`

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
        "noFound": "No se encontraron ubicaciones",
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
        "newestFirst": "Mas recientes",
        "oldestFirst": "Mas antiguos",
        "recentlyModified": "Modificados recientemente",
        "leastRecentlyModified": "Menos modificados recientemente",
        "locationAsc": "Ubicacion (A-Z)",
        "mostGuides": "Mas guias",
        "fewestGuides": "Menos guias"
      }
    }
  }
}
```

#### Sub-task 2.3: Add German translations to `/messages/de.json`

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
        "noFound": "Keine Standorte gefunden",
        "clearSelection": "Standortauswahl loschen"
      },
      "property": {
        "label": "Objekt"
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
        "leastRecentlyModified": "Am langsten nicht geandert",
        "locationAsc": "Standort (A-Z)",
        "mostGuides": "Meiste Anleitungen",
        "fewestGuides": "Wenigste Anleitungen"
      }
    }
  }
}
```

#### Sub-task 2.4: Add Dutch translations to `/messages/nl.json`

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
        "noFound": "Geen locaties gevonden",
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

#### Sub-task 2.5: Add Italian translations to `/messages/it.json`

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
        "noFound": "Nessuna posizione trovata",
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
        "newestFirst": "Piu recenti",
        "oldestFirst": "Piu vecchi",
        "recentlyModified": "Modificati di recente",
        "leastRecentlyModified": "Meno modificati di recente",
        "locationAsc": "Posizione (A-Z)",
        "mostGuides": "Piu guide",
        "fewestGuides": "Meno guide"
      }
    }
  }
}
```

**Verification**:
- All 5 non-English files have identical key structures to en.json
- No missing or extra keys
- JSON is valid

---

### Task 3: Update FilterPanel Component

**Objective**: Replace hardcoded strings with translation function calls

**File**: `/src/components/ItemManager/components/dialogs/FilterPanel.tsx`

**Duration**: ~30 minutes

#### Sub-task 3.1: Add useTranslations import

**Location**: Line 14 (after existing imports)

```typescript
import { useTranslations } from 'next-intl';
```

#### Sub-task 3.2: Initialize translation hook in component

**Location**: Inside `FilterPanel` function, after props destructuring (around line 130)

```typescript
// ---------------------------------------------------------------------------
// Translations
// ---------------------------------------------------------------------------

const t = useTranslations('items.filters');
```

#### Sub-task 3.3: Update DEFAULT_LABELS to use translations

**Location**: Lines 89-98

**Before**:
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

**After** (move inside component and use translations):

Remove the `DEFAULT_LABELS` constant and update the `labels` merge inside the component:

```typescript
// Inside the component function:
const translatedDefaults: Required<FilterPanelLabels> = {
  title: t('title'),
  clearAll: t('clearAll'),
  contentType: t('contentType.label'),
  tags: t('tags.label'),
  location: t('location.label'),
  property: t('property.label'),
  applyFilters: t('applyFilters'),
  close: t('close'),
};

const labels: Required<FilterPanelLabels> = {
  ...translatedDefaults,
  ...customLabels,
};
```

#### Sub-task 3.4: Update lastModified comment

**Location**: Line 11

```typescript
 * @lastModified 2026-01-19 (REQ-388 Localization)
```

**Verification**:
- Component compiles without TypeScript errors
- Labels display correctly in English
- No hardcoded strings remain in component

---

### Task 4: Update ContentTypeFilter Component

**Objective**: Localize content type labels and section heading

**File**: `/src/components/ItemManager/components/dialogs/ContentTypeFilter.tsx`

**Duration**: ~30 minutes

#### Sub-task 4.1: Add useTranslations import

**Location**: Line 14 (after existing imports)

```typescript
import { useTranslations } from 'next-intl';
```

#### Sub-task 4.2: Update CONTENT_TYPE_OPTIONS constant

**Location**: Lines 24-30

The constant needs to store only values and icons. Labels will be resolved dynamically.

**Before**:
```typescript
const CONTENT_TYPE_OPTIONS = [
  { value: 'video', label: 'Video', icon: '🎥' },
  { value: 'image', label: 'Photo', icon: '📷' },
  { value: 'pdf', label: 'PDF', icon: '📄' },
  { value: 'text-only', label: 'Text Only', icon: '📝' },
  { value: 'mixed', label: 'Mixed', icon: '📦' },
] as const;
```

**After**:
```typescript
/**
 * Content type option configuration (labels resolved via i18n).
 */
const CONTENT_TYPE_OPTIONS = [
  { value: 'video', translationKey: 'video', icon: '🎥' },
  { value: 'image', translationKey: 'photo', icon: '📷' },
  { value: 'pdf', translationKey: 'pdf', icon: '📄' },
  { value: 'text-only', translationKey: 'textOnly', icon: '📝' },
  { value: 'mixed', translationKey: 'mixed', icon: '📦' },
] as const;
```

#### Sub-task 4.3: Initialize translation hook and resolve labels

**Location**: Inside `ContentTypeFilter` function, after props destructuring

```typescript
const t = useTranslations('items.filters.contentType');

// Resolve localized options
const localizedOptions = CONTENT_TYPE_OPTIONS.map(option => ({
  ...option,
  label: t(option.translationKey),
}));
```

#### Sub-task 4.4: Update default label prop

**Location**: Line 67

**Before**:
```typescript
label = 'Content Type',
```

**After** (use translation as default):
```typescript
label: labelProp,
```

Then inside the component:
```typescript
const label = labelProp ?? t('label');
```

#### Sub-task 4.5: Update render to use localizedOptions

**Location**: Line 94

**Before**:
```typescript
{CONTENT_TYPE_OPTIONS.map(({ value, label: typeLabel, icon }) => {
```

**After**:
```typescript
{localizedOptions.map(({ value, label: typeLabel, icon }) => {
```

#### Sub-task 4.6: Update lastModified comment

**Location**: Line 11

```typescript
 * @lastModified 2026-01-19 (REQ-388 Localization)
```

**Verification**:
- Component compiles without errors
- All 5 content type labels display in English
- Content type chips render correctly

---

### Task 5: Update TagFilter Component

**Objective**: Localize all user-facing strings in tag filter

**File**: `/src/components/ItemManager/components/dialogs/TagFilter.tsx`

**Duration**: ~45 minutes

#### Sub-task 5.1: Add useTranslations import

**Location**: After existing imports

```typescript
import { useTranslations } from 'next-intl';
```

#### Sub-task 5.2: Initialize translation hook

**Location**: Inside `TagFilter` function, after state declarations

```typescript
const t = useTranslations('items.filters.tags');
```

#### Sub-task 5.3: Update default prop values

**Location**: Lines 62-64

**Before**:
```typescript
label = 'Tags',
placeholder = 'Add tags...',
noTagsMessage = 'No tags available',
```

**After**:
```typescript
label: labelProp,
placeholder: placeholderProp,
noTagsMessage: noTagsMessageProp,
```

Then resolve inside component:
```typescript
const label = labelProp ?? t('label');
const placeholder = placeholderProp ?? t('placeholder');
const noTagsMessage = noTagsMessageProp ?? t('noTags');
```

#### Sub-task 5.4: Update search placeholder

**Location**: Line 264

**Before**:
```typescript
placeholder="Search tags..."
```

**After**:
```typescript
placeholder={t('searchPlaceholder')}
```

#### Sub-task 5.5: Update inline messages

**Location**: Lines 276-281

**Before**:
```typescript
{searchQuery
  ? 'No matching tags'
  : availableTags.length === 0
  ? noTagsMessage
  : 'All tags selected'}
```

**After**:
```typescript
{searchQuery
  ? t('noMatching')
  : availableTags.length === 0
  ? noTagsMessage
  : t('allSelected')}
```

#### Sub-task 5.6: Update remove tag aria-label

**Location**: Line 211

**Before**:
```typescript
aria-label={`Remove ${tag} tag`}
```

**After**:
```typescript
aria-label={t('removeTag', { tag })}
```

#### Sub-task 5.7: Update lastModified comment

```typescript
 * @lastModified 2026-01-19 (REQ-388 Localization)
```

**Verification**:
- All 7 hardcoded strings replaced
- Component renders correctly
- Remove tag button has translated aria-label

---

### Task 6: Update LocationFilter Component

**Objective**: Localize all user-facing strings in location filter

**File**: `/src/components/ItemManager/components/dialogs/LocationFilter.tsx`

**Duration**: ~45 minutes

#### Sub-task 6.1: Add useTranslations import

**Location**: After existing imports

```typescript
import { useTranslations } from 'next-intl';
```

#### Sub-task 6.2: Initialize translation hook

**Location**: Inside `LocationFilter` function, after state declarations

```typescript
const t = useTranslations('items.filters.location');
```

#### Sub-task 6.3: Update default prop values

**Location**: Lines 62-64

**Before**:
```typescript
label = 'Location',
placeholder = 'Select location...',
noLocationsMessage = 'No locations available',
```

**After**:
```typescript
label: labelProp,
placeholder: placeholderProp,
noLocationsMessage: noLocationsMessageProp,
```

Then resolve inside component:
```typescript
const label = labelProp ?? t('label');
const placeholder = placeholderProp ?? t('placeholder');
const noLocationsMessage = noLocationsMessageProp ?? t('noLocations');
```

#### Sub-task 6.4: Update search placeholder

**Location**: Line 268

**Before**:
```typescript
placeholder="Search locations..."
```

**After**:
```typescript
placeholder={t('searchPlaceholder')}
```

#### Sub-task 6.5: Update inline messages

**Location**: Lines 281-285

**Before**:
```typescript
{searchQuery
  ? 'No matching locations'
  : availableLocations.length === 0
  ? noLocationsMessage
  : 'No locations found'}
```

**After**:
```typescript
{searchQuery
  ? t('noMatching')
  : availableLocations.length === 0
  ? noLocationsMessage
  : t('noFound')}
```

#### Sub-task 6.6: Update clear button aria-label

**Location**: Line 245

**Before**:
```typescript
aria-label="Clear location selection"
```

**After**:
```typescript
aria-label={t('clearSelection')}
```

#### Sub-task 6.7: Update lastModified comment

```typescript
 * @lastModified 2026-01-19 (REQ-388 Localization)
```

**Verification**:
- All 7 hardcoded strings replaced
- Component renders correctly
- Clear button has translated aria-label

---

### Task 7: Update SortMenu Component and Constants

**Objective**: Localize sort labels and option names

**Files**:
- `/src/components/ItemManager/components/dialogs/SortMenu.tsx`
- `/src/components/ItemManager/utils/constants.ts`

**Duration**: ~1 hour

#### Sub-task 7.1: Add sort option key mapping to constants.ts

**File**: `/src/components/ItemManager/utils/constants.ts`

**Location**: After SORT_OPTIONS definition (line 41)

```typescript
/**
 * Mapping from sort option values to translation keys.
 * Used by SortMenu to resolve localized labels.
 */
export const SORT_OPTION_KEYS: Record<SortOption, string> = {
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

#### Sub-task 7.2: Update SORT_OPTIONS to remove hardcoded labels

**File**: `/src/components/ItemManager/utils/constants.ts`

**Before**:
```typescript
export const SORT_OPTIONS: SortOptionItem[] = [
  { value: 'title-asc', label: 'Title (A-Z)', icon: 'asc' },
  { value: 'title-desc', label: 'Title (Z-A)', icon: 'desc' },
  // ... etc
];
```

**After**:
```typescript
/**
 * Sort option configuration (labels resolved via i18n in SortMenu).
 */
export const SORT_OPTIONS: Omit<SortOptionItem, 'label'>[] = [
  { value: 'title-asc', icon: 'asc' },
  { value: 'title-desc', icon: 'desc' },
  { value: 'created-desc', icon: 'desc' },
  { value: 'created-asc', icon: 'asc' },
  { value: 'updated-desc', icon: 'desc' },
  { value: 'updated-asc', icon: 'asc' },
  { value: 'location-asc', icon: 'asc' },
  { value: 'instructions-desc', icon: 'desc' },
  { value: 'instructions-asc', icon: 'asc' },
];
```

Note: Update `SortOptionItem` interface if needed to make `label` optional, or create a separate type.

#### Sub-task 7.3: Add useTranslations import to SortMenu

**File**: `/src/components/ItemManager/components/dialogs/SortMenu.tsx`

**Location**: After existing imports

```typescript
import { useTranslations } from 'next-intl';
import { SORT_OPTION_KEYS } from '../../utils/constants';
```

#### Sub-task 7.4: Initialize translation hook in SortMenu

**Location**: Inside `SortMenu` function, after props destructuring

```typescript
const t = useTranslations('items.sort');
```

#### Sub-task 7.5: Update mergedLabels to use translations

**Location**: Lines 124-128

**Before**:
```typescript
const mergedLabels = {
  sortLabel: 'Sort',
  sortByLabel: 'Sort by',
  ...labels,
};
```

**After**:
```typescript
const mergedLabels = {
  sortLabel: labels?.sortLabel ?? t('label'),
  sortByLabel: labels?.sortByLabel ?? t('sortBy'),
};
```

#### Sub-task 7.6: Create localized sort options array

**Location**: After mergedLabels

```typescript
// Resolve localized sort options
const localizedSortOptions: SortOptionItem[] = useMemo(
  () =>
    sortOptions.map((option) => ({
      ...option,
      label: t(`options.${SORT_OPTION_KEYS[option.value]}`),
    })),
  [sortOptions, t]
);
```

#### Sub-task 7.7: Update getSortLabel function

**Location**: Lines 64-70

Update to accept translation function:

```typescript
function getSortLabel(
  sort: SortOption,
  options: SortOptionItem[]
): string {
  const option = options.find((o) => o.value === sort);
  return option?.label ?? 'Sort';
}
```

Or update usage to use `localizedSortOptions`:

```typescript
const currentLabel = useMemo(
  () => getSortLabel(currentSort, localizedSortOptions),
  [currentSort, localizedSortOptions]
);
```

#### Sub-task 7.8: Update radio group to use localizedSortOptions

**Location**: Line 206

**Before**:
```typescript
{sortOptions.map((option) => {
```

**After**:
```typescript
{localizedSortOptions.map((option) => {
```

#### Sub-task 7.9: Update lastModified comments

Update both files:
```typescript
 * @lastModified 2026-01-19 (REQ-388 Localization)
```

**Verification**:
- Sort menu displays localized labels
- All 9 sort options show correct translations
- "Sort" and "Sort by" labels are translated
- Current sort label updates correctly

---

## Implementation Details

### Translation Key Naming Convention

All keys follow the pattern: `{namespace}.{component}.{element}.{variant}`

Examples:
- `items.filters.title` - Filter panel title
- `items.filters.contentType.video` - Video content type label
- `items.sort.options.newestFirst` - Sort option label

### Handling Dynamic Aria Labels

For aria-labels with dynamic content (like tag names), use ICU message format:

```json
{
  "removeTag": "Remove {tag} tag"
}
```

Usage:
```typescript
aria-label={t('removeTag', { tag: tagName })}
```

### Maintaining Backward Compatibility

All components maintain their existing prop interfaces for label customization. The translation functions provide sensible defaults, but custom labels can still be passed via props to override translations when needed.

Pattern used:
```typescript
// Props allow optional override
label: labelProp,

// Inside component, use translation as default
const label = labelProp ?? t('label');
```

---

## Testing Requirements

### Unit Tests

1. **Translation Key Existence**
   - Verify all keys exist in en.json
   - Verify all keys exist in each non-English file

2. **Component Rendering**
   - FilterPanel renders with translated labels
   - ContentTypeFilter shows translated content types
   - TagFilter shows translated messages
   - LocationFilter shows translated messages
   - SortMenu shows translated options

### Integration Tests

1. **Language Switching**
   - Switch language and verify all filter/sort UI updates
   - Verify no flash of untranslated content

2. **Prop Override**
   - Pass custom label props and verify they override translations

### Accessibility Tests

1. **Aria Labels**
   - Verify all aria-labels are translated
   - Test with screen reader in multiple languages

### Manual QA Checklist

- [ ] FilterPanel title displays in selected language
- [ ] "Clear All" button label translates
- [ ] "Apply Filters" button label translates (mobile)
- [ ] Close button aria-label translates
- [ ] All 5 content type labels translate
- [ ] Tag filter placeholder translates
- [ ] Tag search placeholder translates
- [ ] "No tags available" message translates
- [ ] "No matching tags" message translates
- [ ] "All tags selected" message translates
- [ ] Remove tag aria-label translates with tag name
- [ ] Location filter placeholder translates
- [ ] Location search placeholder translates
- [ ] "No locations available" message translates
- [ ] "No matching locations" message translates
- [ ] Clear location aria-label translates
- [ ] Sort menu "Sort" label translates
- [ ] Sort menu "Sort by" header translates
- [ ] All 9 sort option labels translate
- [ ] Current sort label in trigger translates

---

## Acceptance Criteria Checklist

Based on REQ-388 acceptance criteria:

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

## Rollback Plan

If issues are discovered after deployment:

1. **Revert Translation File Changes**
   - Restore previous versions of `/messages/*.json` files

2. **Revert Component Changes**
   - Components can be reverted independently
   - Each component change is isolated

3. **Feature Flag Option**
   - If a feature flag system exists, translations can be conditionally applied

4. **Graceful Degradation**
   - next-intl falls back to English if translations are missing
   - This provides natural rollback behavior

---

## References

- [Overview Document](./REQ-388-update-filter-and-sort-components-overview.md)
- [Implementation Plan: Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [Request Definition](/docs/gen_requests_epic2.md#req-388)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [i18n Configuration](/src/lib/i18n/config.ts)

---

*Document generated for FAQBNB Localization Epic 2 - Sub-Epic 2D Item Management*
*Task ID: 2D.4 - Update filter and sort components*
