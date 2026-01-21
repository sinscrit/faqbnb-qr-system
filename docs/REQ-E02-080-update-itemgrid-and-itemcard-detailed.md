# REQ-E02-080: Update ItemGrid and ItemCard Components - Detailed Task Breakdown

**Document Type:** Detailed Implementation Tasks
**Request ID:** REQ-E02-080
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2D - Item Management
**Task Reference:** 2D.3
**Priority:** High
**Size:** M (Medium)

**Created:** 2026-01-20
**Last Modified:** 2026-01-20

---

## Overview

This document provides a detailed, actionable task breakdown for implementing internationalization support in the ItemGrid and ItemCard components. Each task is designed to be approximately 1 story point and can be completed independently where possible.

**Source Documents:**
- Overview: `/docs/REQ-E02-080-update-itemgrid-and-itemcard-overview.md`
- Requirements: `/docs/gen_requests_epic2.md` (Request #80)
- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md`

---

## Task Summary

| Task ID | Title | Priority | Estimated SP | Dependencies |
|---------|-------|----------|--------------|--------------|
| T1 | Add `items.grid` translations to English | High | 1 | None |
| T2 | Add `items.card` translations to English | High | 1 | None |
| T3 | Add translations to 5 non-English locales | High | 1 | T1, T2 |
| T4 | Update ItemGrid component with i18n | High | 1 | T1 |
| T5 | Add translation hook to ItemCard | High | 1 | T2 |
| T6 | Translate ItemCard content type badges | High | 1 | T5 |
| T7 | Translate ItemCard placeholders | Medium | 1 | T5 |
| T8 | Translate ItemCard accessibility strings | High | 1 | T5 |
| T9 | Translate ItemCard tag overflow text | Medium | 0.5 | T5 |
| T10 | Verification and testing | High | 1 | All |

**Total Estimated Story Points:** 9.5

---

## Detailed Tasks

### Task T1: Add `items.grid` Translations to English

**Task ID:** REQ-E02-080-T1
**Priority:** High
**Story Points:** 1
**Dependencies:** None

**Description:**
Add new translation keys for the ItemGrid component to the English translation file (`/messages/en.json`). This includes the aria-label with ICU pluralization format and a loading message.

**File to Modify:**
- `/messages/en.json`

**Changes Required:**

Add the following keys under the existing `items` namespace:

```json
{
  "items": {
    // ... existing keys ...
    "grid": {
      "ariaLabel": "{count, plural, =0 {No items} one {# item} other {# items}}",
      "loading": "Loading items"
    }
  }
}
```

**Acceptance Criteria:**
- [ ] `items.grid.ariaLabel` key added with ICU plural format
- [ ] `items.grid.loading` key added
- [ ] JSON file is valid (no syntax errors)
- [ ] Build completes without errors

**Verification Command:**
```bash
npm run typecheck && cat messages/en.json | jq '.items.grid'
```

---

### Task T2: Add `items.card` Translations to English

**Task ID:** REQ-E02-080-T2
**Priority:** High
**Story Points:** 1
**Dependencies:** None

**Description:**
Add all translation keys for the ItemCard component to the English translation file. This includes content type badges, placeholders, aria-labels, and tag overflow text.

**File to Modify:**
- `/messages/en.json`

**Changes Required:**

Add the following keys under the existing `items` namespace:

```json
{
  "items": {
    // ... existing keys ...
    "card": {
      "contentType": {
        "link": "LINK",
        "text": "TEXT",
        "pdf": "PDF",
        "mixed": "MIXED",
        "video": "VIDEO",
        "photo": "PHOTO",
        "media": "MEDIA"
      },
      "placeholder": {
        "title": "Enter title...",
        "location": "Add location...",
        "tags": "Add tags..."
      },
      "aria": {
        "location": "Location: {location}.",
        "selected": "Selected",
        "notSelected": "Not selected",
        "pressEnterToSelect": "Press Enter to select",
        "pressEnterToDeselect": "Press Enter to deselect",
        "pressEnterToPreview": "Press Enter to preview",
        "selectItem": "Select {title}",
        "thumbnail": "{title} thumbnail",
        "editTitle": "Edit title for {title}",
        "editLocation": "Edit location for {title}",
        "editTags": "Edit tags for {title}",
        "contentDescription": "{badgeLabel} content"
      },
      "tags": {
        "more": "+{count} more"
      }
    }
  }
}
```

**Acceptance Criteria:**
- [ ] All `items.card.contentType.*` keys added (7 keys)
- [ ] All `items.card.placeholder.*` keys added (3 keys)
- [ ] All `items.card.aria.*` keys added (12 keys)
- [ ] `items.card.tags.more` key added with interpolation
- [ ] JSON file is valid (no syntax errors)
- [ ] Build completes without errors

**Verification Command:**
```bash
npm run typecheck && cat messages/en.json | jq '.items.card'
```

---

### Task T3: Add Translations to 5 Non-English Locales

**Task ID:** REQ-E02-080-T3
**Priority:** High
**Story Points:** 1
**Dependencies:** T1, T2

**Description:**
Add translations for all new keys to French, Spanish, German, Dutch, and Italian locale files. Ensure consistent key structure across all files.

**Files to Modify:**
- `/messages/fr.json`
- `/messages/es.json`
- `/messages/de.json`
- `/messages/nl.json`
- `/messages/it.json`

**Translation Reference:**

**French (fr.json):**
```json
{
  "items": {
    "grid": {
      "ariaLabel": "{count, plural, =0 {Aucun élément} one {# élément} other {# éléments}}",
      "loading": "Chargement des éléments"
    },
    "card": {
      "contentType": {
        "link": "LIEN",
        "text": "TEXTE",
        "pdf": "PDF",
        "mixed": "MIXTE",
        "video": "VIDÉO",
        "photo": "PHOTO",
        "media": "MÉDIA"
      },
      "placeholder": {
        "title": "Entrez le titre...",
        "location": "Ajouter un emplacement...",
        "tags": "Ajouter des tags..."
      },
      "aria": {
        "location": "Emplacement : {location}.",
        "selected": "Sélectionné",
        "notSelected": "Non sélectionné",
        "pressEnterToSelect": "Appuyez sur Entrée pour sélectionner",
        "pressEnterToDeselect": "Appuyez sur Entrée pour désélectionner",
        "pressEnterToPreview": "Appuyez sur Entrée pour prévisualiser",
        "selectItem": "Sélectionner {title}",
        "thumbnail": "Miniature de {title}",
        "editTitle": "Modifier le titre de {title}",
        "editLocation": "Modifier l'emplacement de {title}",
        "editTags": "Modifier les tags de {title}",
        "contentDescription": "Contenu {badgeLabel}"
      },
      "tags": {
        "more": "+{count} de plus"
      }
    }
  }
}
```

**Spanish (es.json):**
```json
{
  "items": {
    "grid": {
      "ariaLabel": "{count, plural, =0 {Sin elementos} one {# elemento} other {# elementos}}",
      "loading": "Cargando elementos"
    },
    "card": {
      "contentType": {
        "link": "ENLACE",
        "text": "TEXTO",
        "pdf": "PDF",
        "mixed": "MIXTO",
        "video": "VIDEO",
        "photo": "FOTO",
        "media": "MEDIA"
      },
      "placeholder": {
        "title": "Ingresa el título...",
        "location": "Agregar ubicación...",
        "tags": "Agregar etiquetas..."
      },
      "aria": {
        "location": "Ubicación: {location}.",
        "selected": "Seleccionado",
        "notSelected": "No seleccionado",
        "pressEnterToSelect": "Presiona Enter para seleccionar",
        "pressEnterToDeselect": "Presiona Enter para deseleccionar",
        "pressEnterToPreview": "Presiona Enter para previsualizar",
        "selectItem": "Seleccionar {title}",
        "thumbnail": "Miniatura de {title}",
        "editTitle": "Editar título de {title}",
        "editLocation": "Editar ubicación de {title}",
        "editTags": "Editar etiquetas de {title}",
        "contentDescription": "Contenido {badgeLabel}"
      },
      "tags": {
        "more": "+{count} más"
      }
    }
  }
}
```

**German (de.json):**
```json
{
  "items": {
    "grid": {
      "ariaLabel": "{count, plural, =0 {Keine Elemente} one {# Element} other {# Elemente}}",
      "loading": "Elemente werden geladen"
    },
    "card": {
      "contentType": {
        "link": "LINK",
        "text": "TEXT",
        "pdf": "PDF",
        "mixed": "GEMISCHT",
        "video": "VIDEO",
        "photo": "FOTO",
        "media": "MEDIEN"
      },
      "placeholder": {
        "title": "Titel eingeben...",
        "location": "Standort hinzufügen...",
        "tags": "Tags hinzufügen..."
      },
      "aria": {
        "location": "Standort: {location}.",
        "selected": "Ausgewählt",
        "notSelected": "Nicht ausgewählt",
        "pressEnterToSelect": "Drücken Sie Enter zum Auswählen",
        "pressEnterToDeselect": "Drücken Sie Enter zum Abwählen",
        "pressEnterToPreview": "Drücken Sie Enter zur Vorschau",
        "selectItem": "{title} auswählen",
        "thumbnail": "Miniaturansicht von {title}",
        "editTitle": "Titel von {title} bearbeiten",
        "editLocation": "Standort von {title} bearbeiten",
        "editTags": "Tags von {title} bearbeiten",
        "contentDescription": "{badgeLabel}-Inhalt"
      },
      "tags": {
        "more": "+{count} weitere"
      }
    }
  }
}
```

**Dutch (nl.json):**
```json
{
  "items": {
    "grid": {
      "ariaLabel": "{count, plural, =0 {Geen items} one {# item} other {# items}}",
      "loading": "Items laden"
    },
    "card": {
      "contentType": {
        "link": "LINK",
        "text": "TEKST",
        "pdf": "PDF",
        "mixed": "GEMENGD",
        "video": "VIDEO",
        "photo": "FOTO",
        "media": "MEDIA"
      },
      "placeholder": {
        "title": "Titel invoeren...",
        "location": "Locatie toevoegen...",
        "tags": "Tags toevoegen..."
      },
      "aria": {
        "location": "Locatie: {location}.",
        "selected": "Geselecteerd",
        "notSelected": "Niet geselecteerd",
        "pressEnterToSelect": "Druk op Enter om te selecteren",
        "pressEnterToDeselect": "Druk op Enter om te deselecteren",
        "pressEnterToPreview": "Druk op Enter voor preview",
        "selectItem": "{title} selecteren",
        "thumbnail": "Miniatuur van {title}",
        "editTitle": "Titel van {title} bewerken",
        "editLocation": "Locatie van {title} bewerken",
        "editTags": "Tags van {title} bewerken",
        "contentDescription": "{badgeLabel} inhoud"
      },
      "tags": {
        "more": "+{count} meer"
      }
    }
  }
}
```

**Italian (it.json):**
```json
{
  "items": {
    "grid": {
      "ariaLabel": "{count, plural, =0 {Nessun elemento} one {# elemento} other {# elementi}}",
      "loading": "Caricamento elementi"
    },
    "card": {
      "contentType": {
        "link": "LINK",
        "text": "TESTO",
        "pdf": "PDF",
        "mixed": "MISTO",
        "video": "VIDEO",
        "photo": "FOTO",
        "media": "MEDIA"
      },
      "placeholder": {
        "title": "Inserisci titolo...",
        "location": "Aggiungi posizione...",
        "tags": "Aggiungi tag..."
      },
      "aria": {
        "location": "Posizione: {location}.",
        "selected": "Selezionato",
        "notSelected": "Non selezionato",
        "pressEnterToSelect": "Premi Invio per selezionare",
        "pressEnterToDeselect": "Premi Invio per deselezionare",
        "pressEnterToPreview": "Premi Invio per anteprima",
        "selectItem": "Seleziona {title}",
        "thumbnail": "Miniatura di {title}",
        "editTitle": "Modifica titolo di {title}",
        "editLocation": "Modifica posizione di {title}",
        "editTags": "Modifica tag di {title}",
        "contentDescription": "Contenuto {badgeLabel}"
      },
      "tags": {
        "more": "+{count} altri"
      }
    }
  }
}
```

**Acceptance Criteria:**
- [ ] All 5 locale files updated with identical key structure
- [ ] ICU plural format used correctly in all languages
- [ ] Variable interpolation syntax consistent (`{variableName}`)
- [ ] All JSON files are valid (no syntax errors)
- [ ] Build completes without errors

**Verification Command:**
```bash
npm run typecheck && for f in messages/*.json; do echo "Checking $f"; cat "$f" | jq '.items.grid, .items.card' > /dev/null && echo "OK"; done
```

---

### Task T4: Update ItemGrid Component with i18n

**Task ID:** REQ-E02-080-T4
**Priority:** High
**Story Points:** 1
**Dependencies:** T1

**Description:**
Add the `useTranslations` hook to ItemGrid and replace the hardcoded aria-label with the translated version using ICU pluralization.

**File to Modify:**
- `src/components/ItemManager/components/ItemGrid.tsx`

**Current Code (lines 1-40):**
```typescript
'use client';

/**
 * ItemGrid Component
 * ...
 */

import { cn } from '@/lib/utils';
import { ItemCard } from './ItemCard';
import type { ItemGridProps } from '../ItemManager.types';

export function ItemGrid({
  items,
  // ... props
  loading,
}: ItemGridProps & { loading?: boolean }) {
  return (
    <div
      className={cn(...)}
      role="grid"
      aria-label={`${items.length} item${items.length !== 1 ? 's' : ''}`}
      aria-busy={loading}
      aria-describedby={items.length === 0 ? 'empty-message-grid' : undefined}
    >
      {/* ... */}
    </div>
  );
}
```

**Target Code:**
```typescript
'use client';

/**
 * ItemGrid Component
 *
 * Renders items in a responsive multi-column grid layout.
 * Each item is displayed using the ItemCard component.
 *
 * @module ItemManager/components/ItemGrid
 * @lastModified 2026-01-20 (REQ-E02-080 - Added i18n support)
 */

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { ItemCard } from './ItemCard';
import type { ItemGridProps } from '../ItemManager.types';

export function ItemGrid({
  items,
  onItemPreview,
  onSelectionChange,
  selectedIds,
  isSelectionMode,
  onLongPressSelect,
  className,
  enableInlineEdit,
  onUpdateItem,
  existingTags,
  loading,
}: ItemGridProps & { loading?: boolean }) {
  const t = useTranslations('items.grid');

  return (
    <div
      className={cn(
        "grid gap-4 sm:gap-5 lg:gap-6",
        "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6",
        className
      )}
      role="grid"
      aria-label={t('ariaLabel', { count: items.length })}
      aria-busy={loading}
      aria-describedby={items.length === 0 ? 'empty-message-grid' : undefined}
    >
      {items.map((item) => (
        <div key={item.id} role="gridcell">
          <ItemCard
            item={item}
            onPreviewClick={onItemPreview}
            onSelectionChange={onSelectionChange}
            isSelected={selectedIds.has(item.id)}
            isSelectionMode={isSelectionMode}
            onLongPressSelect={onLongPressSelect}
            enableInlineEdit={enableInlineEdit}
            onUpdateItem={onUpdateItem}
            existingTags={existingTags}
          />
        </div>
      ))}
    </div>
  );
}

export default ItemGrid;
```

**Changes Summary:**
1. Add import: `import { useTranslations } from 'next-intl';`
2. Add hook initialization: `const t = useTranslations('items.grid');`
3. Replace line 38: `aria-label={t('ariaLabel', { count: items.length })}`
4. Update `@lastModified` comment

**Acceptance Criteria:**
- [ ] `useTranslations` imported from `next-intl`
- [ ] Hook initialized with `items.grid` namespace
- [ ] `aria-label` uses translated string with ICU pluralization
- [ ] TypeScript compiles without errors
- [ ] Component renders correctly with 0, 1, and multiple items

**Verification Commands:**
```bash
npm run typecheck
# Manual: Verify aria-label in browser dev tools for different item counts
```

---

### Task T5: Add Translation Hook to ItemCard

**Task ID:** REQ-E02-080-T5
**Priority:** High
**Story Points:** 1
**Dependencies:** T2

**Description:**
Add the `useTranslations` hook to ItemCard component. This is the foundation for all subsequent ItemCard translation tasks.

**File to Modify:**
- `src/components/ItemManager/components/ItemCard.tsx`

**Changes Required:**

1. Add import at line 21 (after other imports):
```typescript
import { useTranslations } from 'next-intl';
```

2. Add hook initialization inside the `ItemCard` function (after line 79):
```typescript
export function ItemCard({
  item,
  onPreviewClick,
  // ... other props
}: ItemCardProps) {
  const t = useTranslations('items.card');

  // ... rest of component
```

3. Update `@lastModified` comment in the docstring to:
```typescript
* @lastModified 2026-01-20 (REQ-E02-080 - Added i18n support)
```

**Acceptance Criteria:**
- [ ] `useTranslations` imported from `next-intl`
- [ ] Hook initialized with `items.card` namespace
- [ ] TypeScript compiles without errors
- [ ] Component renders correctly (no visual changes yet)

**Verification Command:**
```bash
npm run typecheck
```

---

### Task T6: Translate ItemCard Content Type Badges

**Task ID:** REQ-E02-080-T6
**Priority:** High
**Story Points:** 1
**Dependencies:** T5

**Description:**
Refactor the `getContentTypeBadge` function to use translated labels. Since the function is defined outside the component, we need to pass the translation function or move the logic inside the component.

**File to Modify:**
- `src/components/ItemManager/components/ItemCard.tsx`

**Current Code (lines 31-58):**
```typescript
function getContentTypeBadge(contentType: string, firstMediaType?: string) {
  if (contentType === 'url-only') {
    return { label: 'LINK', classes: 'bg-cyan-100 text-cyan-800 border-cyan-200' };
  }
  // ... more hardcoded labels
}
```

**Target Approach - Option A (Recommended):**
Keep `getContentTypeBadge` for CSS classes only, and create a new function inside the component for translated labels:

```typescript
// Keep existing function for classes only, rename it
function getContentTypeBadgeClasses(contentType: string, firstMediaType?: string): string {
  if (contentType === 'url-only') {
    return 'bg-cyan-100 text-cyan-800 border-cyan-200';
  }
  if (contentType === 'text-only') {
    return 'bg-purple-100 text-purple-800 border-purple-200';
  }
  if (contentType === 'pdf-only') {
    return 'bg-blue-100 text-blue-800 border-blue-200';
  }
  if (contentType === 'mixed') {
    return 'bg-orange-100 text-orange-800 border-orange-200';
  }
  // contentType === 'media'
  if (firstMediaType === 'url') {
    return 'bg-cyan-100 text-cyan-800 border-cyan-200';
  }
  if (firstMediaType === 'video') {
    return 'bg-red-100 text-red-800 border-red-200';
  }
  if (firstMediaType === 'image') {
    return 'bg-green-100 text-green-800 border-green-200';
  }
  if (firstMediaType === 'pdf') {
    return 'bg-blue-100 text-blue-800 border-blue-200';
  }
  return 'bg-gray-100 text-gray-800 border-gray-200';
}

// Inside ItemCard component:
export function ItemCard({ ... }: ItemCardProps) {
  const t = useTranslations('items.card');

  // Get translated badge label
  const getBadgeLabel = useCallback((contentType: string, firstMediaType?: string): string => {
    if (contentType === 'url-only') return t('contentType.link');
    if (contentType === 'text-only') return t('contentType.text');
    if (contentType === 'pdf-only') return t('contentType.pdf');
    if (contentType === 'mixed') return t('contentType.mixed');
    if (firstMediaType === 'url') return t('contentType.link');
    if (firstMediaType === 'video') return t('contentType.video');
    if (firstMediaType === 'image') return t('contentType.photo');
    if (firstMediaType === 'pdf') return t('contentType.pdf');
    return t('contentType.media');
  }, [t]);

  // Update badge usage (around line 155)
  const badgeClasses = getContentTypeBadgeClasses(item.contentType, item.media[0]?.type);
  const badgeLabel = getBadgeLabel(item.contentType, item.media[0]?.type);

  // ... update all usages of badge.label to badgeLabel and badge.classes to badgeClasses
```

**JSX Update (around line 317-326):**
```typescript
{/* Content Type Badge */}
<div className="absolute top-2 right-2 z-10">
  <span
    className={cn(
      'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border',
      badgeClasses
    )}
  >
    {badgeLabel}
  </span>
</div>
```

**Acceptance Criteria:**
- [ ] `getContentTypeBadge` refactored to separate concerns (classes vs labels)
- [ ] Badge labels use translation keys
- [ ] All 7 content types have translated labels
- [ ] Badge CSS classes unchanged (visual appearance preserved)
- [ ] TypeScript compiles without errors

**Verification Commands:**
```bash
npm run typecheck
# Manual: Verify badges display correctly for each content type
```

---

### Task T7: Translate ItemCard Placeholders

**Task ID:** REQ-E02-080-T7
**Priority:** Medium
**Story Points:** 1
**Dependencies:** T5

**Description:**
Replace hardcoded placeholder strings in InlineEdit and TagsInlineEdit components with translated strings.

**File to Modify:**
- `src/components/ItemManager/components/ItemCard.tsx`

**Current Code (lines 333-380):**
```typescript
<InlineEdit
  value={item.title}
  placeholder="Enter title..."
  ariaLabel={`Edit title for ${item.title}`}
  ...
/>
<InlineEdit
  value={item.location || ''}
  placeholder="Add location..."
  ariaLabel={`Edit location for ${item.title}`}
  ...
/>
<TagsInlineEdit
  placeholder="Add tags..."
  ariaLabel={`Edit tags for ${item.title}`}
  ...
/>
```

**Target Code:**
```typescript
<InlineEdit
  value={item.title}
  placeholder={t('placeholder.title')}
  ariaLabel={t('aria.editTitle', { title: item.title })}
  ...
/>
<InlineEdit
  value={item.location || ''}
  placeholder={t('placeholder.location')}
  ariaLabel={t('aria.editLocation', { title: item.title })}
  ...
/>
<TagsInlineEdit
  placeholder={t('placeholder.tags')}
  ariaLabel={t('aria.editTags', { title: item.title })}
  ...
/>
```

**Lines to Update:**
- Line 336: `placeholder="Enter title..."` → `placeholder={t('placeholder.title')}`
- Line 337: `ariaLabel={...}` → `ariaLabel={t('aria.editTitle', { title: item.title })}`
- Line 354: `placeholder="Add location..."` → `placeholder={t('placeholder.location')}`
- Line 355: `ariaLabel={...}` → `ariaLabel={t('aria.editLocation', { title: item.title })}`
- Line 377: `placeholder="Add tags..."` → `placeholder={t('placeholder.tags')}`
- Line 378: `ariaLabel={...}` → `ariaLabel={t('aria.editTags', { title: item.title })}`

**Acceptance Criteria:**
- [ ] Title placeholder uses `t('placeholder.title')`
- [ ] Location placeholder uses `t('placeholder.location')`
- [ ] Tags placeholder uses `t('placeholder.tags')`
- [ ] All aria-labels use translation keys with title interpolation
- [ ] Inline edit functionality unchanged
- [ ] TypeScript compiles without errors

**Verification Commands:**
```bash
npm run typecheck
# Manual: Verify placeholders display correctly when fields are empty
```

---

### Task T8: Translate ItemCard Accessibility Strings

**Task ID:** REQ-E02-080-T8
**Priority:** High
**Story Points:** 1
**Dependencies:** T5, T6

**Description:**
Replace hardcoded aria-labels and accessibility text throughout ItemCard with translated strings. This includes the main card aria-label, checkbox aria-label, and image alt text.

**File to Modify:**
- `src/components/ItemManager/components/ItemCard.tsx`

**Changes Required:**

**1. Update main aria-label construction (lines 216-219):**

Current:
```typescript
const ariaLabel = isSelectionMode
  ? `${item.title}. ${item.location ? `Location: ${item.location}.` : ''} ${badge.label} content. ${isSelected ? 'Selected.' : 'Not selected.'} Press Enter to ${isSelected ? 'deselect' : 'select'}, or click to preview.`
  : `${item.title}. ${item.location ? `Location: ${item.location}.` : ''} ${badge.label} content. Press Enter to preview.`;
```

Target:
```typescript
const ariaLabel = useMemo(() => {
  const locationPart = item.location
    ? t('aria.location', { location: item.location })
    : '';
  const contentPart = t('aria.contentDescription', { badgeLabel });
  const selectionPart = isSelected
    ? t('aria.selected')
    : t('aria.notSelected');
  const actionPart = isSelectionMode
    ? (isSelected ? t('aria.pressEnterToDeselect') : t('aria.pressEnterToSelect'))
    : t('aria.pressEnterToPreview');

  if (isSelectionMode) {
    return `${item.title}. ${locationPart} ${contentPart}. ${selectionPart}. ${actionPart}`;
  }
  return `${item.title}. ${locationPart} ${contentPart}. ${actionPart}`;
}, [item.title, item.location, badgeLabel, isSelectionMode, isSelected, t]);
```

**Note:** Add `useMemo` to imports if not already present.

**2. Update image alt text (line 249):**

Current:
```typescript
alt={`${item.title} thumbnail`}
```

Target:
```typescript
alt={t('aria.thumbnail', { title: item.title })}
```

**3. Update checkbox aria-label (line 299):**

Current:
```typescript
aria-label={`Select ${item.title}`}
```

Target:
```typescript
aria-label={t('aria.selectItem', { title: item.title })}
```

**Acceptance Criteria:**
- [ ] Main card aria-label uses translation keys with proper interpolation
- [ ] Location part only included when item has location
- [ ] Selection state uses translated "Selected"/"Not selected"
- [ ] Action prompts use translated "Press Enter to..." strings
- [ ] Image alt text uses translated thumbnail string
- [ ] Checkbox aria-label uses translated select string
- [ ] `useMemo` used for aria-label to optimize performance
- [ ] TypeScript compiles without errors
- [ ] Screen reader announces correctly in all languages

**Verification Commands:**
```bash
npm run typecheck
# Manual: Test with screen reader (VoiceOver/NVDA) in different languages
```

---

### Task T9: Translate ItemCard Tag Overflow Text

**Task ID:** REQ-E02-080-T9
**Priority:** Medium
**Story Points:** 0.5
**Dependencies:** T5

**Description:**
Replace the hardcoded "+N more" text for tag overflow with a translated string.

**File to Modify:**
- `src/components/ItemManager/components/ItemCard.tsx`

**Current Code (lines 387-390):**
```typescript
{item.tags.length > 3 && (
  <span className="text-xs text-gray-500 ml-1">
    +{item.tags.length - 3} more
  </span>
)}
```

**Target Code:**
```typescript
{item.tags.length > 3 && (
  <span className="text-xs text-gray-500 ml-1">
    {t('tags.more', { count: item.tags.length - 3 })}
  </span>
)}
```

**Acceptance Criteria:**
- [ ] Overflow text uses `t('tags.more', { count: ... })`
- [ ] Count is properly interpolated
- [ ] Visual appearance unchanged
- [ ] TypeScript compiles without errors

**Verification Command:**
```bash
npm run typecheck
# Manual: Verify overflow text displays correctly for items with 4+ tags
```

---

### Task T10: Verification and Testing

**Task ID:** REQ-E02-080-T10
**Priority:** High
**Story Points:** 1
**Dependencies:** All previous tasks

**Description:**
Comprehensive verification that all translations work correctly across all 6 supported languages.

**Test Scenarios:**

1. **ItemGrid aria-label pluralization:**
   - Render grid with 0 items → "No items" / locale equivalent
   - Render grid with 1 item → "1 item" / locale equivalent
   - Render grid with 5 items → "5 items" / locale equivalent

2. **ItemCard content type badges:**
   - Verify LINK badge for url-only content
   - Verify TEXT badge for text-only content
   - Verify PDF badge for pdf-only content
   - Verify MIXED badge for mixed content
   - Verify VIDEO badge for video media
   - Verify PHOTO badge for image media
   - Verify MEDIA badge for other media types

3. **ItemCard placeholders:**
   - Verify title placeholder when title field is empty
   - Verify location placeholder when location field is empty
   - Verify tags placeholder when tags field is empty

4. **ItemCard accessibility:**
   - Verify screen reader announces full card context
   - Verify selection state announced correctly
   - Verify keyboard navigation works in all languages

5. **Language switching:**
   - Switch language from EN to FR → verify all UI updates
   - Switch language from FR to DE → verify all UI updates
   - Verify no page reload required

6. **Console checks:**
   - Verify no missing translation key warnings
   - Verify no runtime errors

**Acceptance Criteria:**
- [ ] All 6 languages display correctly (EN, FR, ES, DE, NL, IT)
- [ ] No missing translation warnings in console
- [ ] Pluralization works correctly for 0, 1, and many items
- [ ] Language switching updates UI without page reload
- [ ] TypeScript compiles without errors (`npm run typecheck` passes)
- [ ] Build succeeds (`npm run build` passes)
- [ ] Existing component functionality preserved (selection, preview, inline edit)
- [ ] Accessibility: screen reader announces correctly in each language

**Verification Commands:**
```bash
# TypeScript check
npm run typecheck

# Build check
npm run build

# Manual testing checklist:
# 1. Open app in browser
# 2. Navigate to item management page
# 3. Test each language via language selector
# 4. Verify badge labels, placeholders, aria-labels
# 5. Check browser console for warnings
# 6. Test with screen reader
```

---

## Implementation Order

**Recommended execution sequence:**

```
T1 (EN grid translations) ─┬─> T4 (Update ItemGrid)
                          │
T2 (EN card translations) ─┼─> T5 (Add hook to ItemCard)
                          │         │
                          │         ├─> T6 (Content type badges)
                          │         ├─> T7 (Placeholders)
                          │         ├─> T8 (Accessibility strings)
                          │         └─> T9 (Tag overflow)
                          │
T3 (Non-EN translations) ──┴─> T10 (Verification)
```

**Parallel execution opportunities:**
- T1 and T2 can be done in parallel
- T6, T7, T8, and T9 can be done in parallel after T5
- T3 can start after T1 and T2 are complete

---

## Files Modified Summary

| File | Tasks | Changes |
|------|-------|---------|
| `/messages/en.json` | T1, T2 | Add `items.grid.*` and `items.card.*` keys |
| `/messages/fr.json` | T3 | Add French translations |
| `/messages/es.json` | T3 | Add Spanish translations |
| `/messages/de.json` | T3 | Add German translations |
| `/messages/nl.json` | T3 | Add Dutch translations |
| `/messages/it.json` | T3 | Add Italian translations |
| `src/components/ItemManager/components/ItemGrid.tsx` | T4 | Add useTranslations, update aria-label |
| `src/components/ItemManager/components/ItemCard.tsx` | T5, T6, T7, T8, T9 | Add useTranslations, translate all strings |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Badge text overflow in German/French | Badge labels kept short (3-6 chars), CSS handles overflow |
| Complex aria-label causing translation issues | Use `useMemo` for performance, test with screen readers |
| Missing translation keys at runtime | Build-time validation, fallback to English |
| Breaking existing functionality | Comprehensive testing in T10 |

---

## Definition of Done

- [ ] All 10 tasks completed
- [ ] `npm run typecheck` passes
- [ ] `npm run build` succeeds
- [ ] All 6 languages tested manually
- [ ] No console warnings for missing translations
- [ ] Screen reader testing passed
- [ ] Code review completed
- [ ] Documentation updated (component docstrings)

---

## References

- Overview Document: `/docs/REQ-E02-080-update-itemgrid-and-itemcard-overview.md`
- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md`
- next-intl Documentation: https://next-intl-docs.vercel.app/
- ICU Message Format: https://unicode-org.github.io/icu/userguide/format_parse/messages/

---

*Document generated for FAQBNB Localization Epic 2 - Sub-Epic 2D: Item Management - Task 2D.3*
