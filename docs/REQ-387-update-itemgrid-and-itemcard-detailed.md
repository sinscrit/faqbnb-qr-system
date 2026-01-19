# REQ-387: Update ItemGrid and ItemCard Components for Localization - Detailed Task Breakdown

**Generated:** 2026-01-19 22:30:00 UTC
**Last Modified:** 2026-01-19 22:30:00 UTC
**Source Overview:** docs/REQ-387-update-itemgrid-and-itemcard-overview.md
**Request Reference:** docs/gen_requests_epic2.md (REQ-387)
**Implementation Plan:** docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md

---

## Document Context

| Field | Value |
|-------|-------|
| **Request ID** | REQ-387 |
| **Title** | Update ItemGrid and ItemCard Components for Localization |
| **Epic** | 2 - Static UI Translation |
| **Sub-Epic** | 2D - Item Management |
| **Task ID** | 2D.3 |
| **Size** | M (Medium) |
| **Priority** | Seventh (per recommended order in Plan-111) |
| **Estimated Effort** | 4-6 hours |
| **Dependencies** | REQ-385 (items namespace structure), REQ-230 ✓, REQ-231 ✓ |

---

## Executive Summary

This document provides granular, actionable tasks for internationalizing the ItemGrid and ItemCard components to support multilingual item browsing experiences. These components are core to the item browsing experience and contain approximately 25-30 hardcoded strings that must be replaced with translation function calls. Each task is designed to be approximately 1 story point and can be executed independently where dependencies allow.

---

## Prerequisites Checklist

Before starting implementation, verify these prerequisites:

- [ ] REQ-230: i18n configuration module exists at `/src/lib/i18n/config.ts`
- [ ] REQ-231: next.config.ts configured for i18n
- [ ] REQ-385: items namespace structure exists in `/messages/en.json`
- [ ] next-intl package installed and configured
- [ ] IntlProvider wrapper in place

---

## Authorized Files for Modification

| File Path | Modification Scope |
|-----------|-------------------|
| `/src/components/ItemManager/components/ItemGrid.tsx` | Add useTranslations import, replace aria-label |
| `/src/components/ItemManager/components/ItemCard.tsx` | Add useTranslations import, refactor getContentTypeBadge, replace all hardcoded strings |
| `/messages/en.json` | Add items.grid and items.card namespace keys |
| `/messages/fr.json` | Add French translations for items.grid and items.card |
| `/messages/es.json` | Add Spanish translations for items.grid and items.card |
| `/messages/de.json` | Add German translations for items.grid and items.card |
| `/messages/nl.json` | Add Dutch translations for items.grid and items.card |
| `/messages/it.json` | Add Italian translations for items.grid and items.card |

---

## Task Breakdown

### Phase 1: Translation Keys Setup (Foundation)

---

#### Task 1.1: Add Translation Keys to en.json

**File:** `/messages/en.json`
**Estimated Time:** 20-30 minutes
**Priority:** CRITICAL - Must be completed first

**Description:**
Add all required translation keys to the English source file under the `items` namespace. This establishes the translation structure that all other tasks will reference.

**Changes Required:**

1. Locate the existing `items` namespace in `/messages/en.json`

2. Add the `grid` sub-namespace with ICU pluralization:
```json
"grid": {
  "ariaLabel": "{count, plural, =0 {No items} one {# item} other {# items}}"
}
```

3. Add the `card` sub-namespace with all required keys:
```json
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
  "accessibility": {
    "locationPrefix": "Location: {location}",
    "contentSuffix": "{type} content",
    "selected": "Selected",
    "notSelected": "Not selected",
    "pressEnterToSelect": "Press Enter to select, or click to preview",
    "pressEnterToDeselect": "Press Enter to deselect, or click to preview",
    "pressEnterToPreview": "Press Enter to preview",
    "selectItem": "Select {title}"
  },
  "inlineEdit": {
    "titlePlaceholder": "Enter title...",
    "titleAriaLabel": "Edit title for {title}",
    "locationPlaceholder": "Add location...",
    "locationAriaLabel": "Edit location for {title}",
    "tagsPlaceholder": "Add tags...",
    "tagsAriaLabel": "Edit tags for {title}"
  },
  "tags": {
    "overflow": "+{count} more"
  }
}
```

**Complete JSON Structure to Add:**
```json
{
  "items": {
    "grid": {
      "ariaLabel": "{count, plural, =0 {No items} one {# item} other {# items}}"
    },
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
      "accessibility": {
        "locationPrefix": "Location: {location}",
        "contentSuffix": "{type} content",
        "selected": "Selected",
        "notSelected": "Not selected",
        "pressEnterToSelect": "Press Enter to select, or click to preview",
        "pressEnterToDeselect": "Press Enter to deselect, or click to preview",
        "pressEnterToPreview": "Press Enter to preview",
        "selectItem": "Select {title}"
      },
      "inlineEdit": {
        "titlePlaceholder": "Enter title...",
        "titleAriaLabel": "Edit title for {title}",
        "locationPlaceholder": "Add location...",
        "locationAriaLabel": "Edit location for {title}",
        "tagsPlaceholder": "Add tags...",
        "tagsAriaLabel": "Edit tags for {title}"
      },
      "tags": {
        "overflow": "+{count} more"
      }
    }
  }
}
```

**Acceptance Criteria:**
- [ ] `items.grid.ariaLabel` key added with ICU pluralization syntax
- [ ] All 7 content type keys added under `items.card.contentType`
- [ ] All 8 accessibility keys added under `items.card.accessibility`
- [ ] All 6 inline edit keys added under `items.card.inlineEdit`
- [ ] Tag overflow key added under `items.card.tags`
- [ ] JSON is valid (no syntax errors)
- [ ] Keys follow the `namespace.component.element.variant` convention

**Testing:**
- Validate JSON syntax with a JSON linter
- Verify no duplicate keys exist

---

### Phase 2: Component Updates

---

#### Task 2.1: Update ItemGrid Component

**File:** `/src/components/ItemManager/components/ItemGrid.tsx`
**Estimated Time:** 15-20 minutes
**Priority:** HIGH

**Description:**
Update the ItemGrid component to use the translation hook for the grid's aria-label, which requires proper pluralization for item count display.

**Current Code (Line 38):**
```typescript
aria-label={`${items.length} item${items.length !== 1 ? 's' : ''}`}
```

**Changes Required:**

1. Add import statement at the top of the file (after existing imports, around line 14):
```typescript
import { useTranslations } from 'next-intl';
```

2. Add hook call inside the component function (line ~30, after destructuring props):
```typescript
const t = useTranslations('items.grid');
```

3. Replace the hardcoded aria-label (line 38):

**Before:**
```typescript
aria-label={`${items.length} item${items.length !== 1 ? 's' : ''}`}
```

**After:**
```typescript
aria-label={t('ariaLabel', { count: items.length })}
```

**Complete Updated Component:**
```typescript
'use client';

/**
 * ItemGrid Component
 *
 * Renders items in a responsive multi-column grid layout.
 * Each item is displayed using the ItemCard component.
 *
 * @module ItemManager/components/ItemGrid
 * @lastModified 2026-01-19 (REQ-387 - Added i18n support)
 */

import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
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

**Acceptance Criteria:**
- [ ] `useTranslations` imported from 'next-intl'
- [ ] Hook called with 'items.grid' namespace
- [ ] aria-label uses translation function with count parameter
- [ ] Component renders correctly with 0, 1, and multiple items
- [ ] No hardcoded English strings remain
- [ ] File comment updated with last modified date and REQ reference

**Testing:**
- Verify aria-label displays "No items" when count is 0
- Verify aria-label displays "1 item" when count is 1
- Verify aria-label displays "X items" when count is > 1
- Test with screen reader to confirm proper announcement

---

#### Task 2.2: Update ItemCard - Add Translation Hook and Refactor getContentTypeBadge

**File:** `/src/components/ItemManager/components/ItemCard.tsx`
**Estimated Time:** 30-40 minutes
**Priority:** HIGH

**Description:**
Add the translation hook to ItemCard and refactor the `getContentTypeBadge` helper function to accept the translation function and return translated labels.

**Changes Required:**

1. Add import statement (after line 20):
```typescript
import { useTranslations } from 'next-intl';
```

2. Modify the `getContentTypeBadge` function signature (lines 31-58) to accept a translation function:

**Before:**
```typescript
function getContentTypeBadge(contentType: string, firstMediaType?: string) {
  if (contentType === 'url-only') {
    return { label: 'LINK', classes: 'bg-cyan-100 text-cyan-800 border-cyan-200' };
  }
  // ... rest of function
}
```

**After:**
```typescript
function getContentTypeBadge(
  contentType: string,
  firstMediaType: string | undefined,
  t: (key: string) => string
) {
  if (contentType === 'url-only') {
    return { label: t('contentType.link'), classes: 'bg-cyan-100 text-cyan-800 border-cyan-200' };
  }
  if (contentType === 'text-only') {
    return { label: t('contentType.text'), classes: 'bg-purple-100 text-purple-800 border-purple-200' };
  }
  if (contentType === 'pdf-only') {
    return { label: t('contentType.pdf'), classes: 'bg-blue-100 text-blue-800 border-blue-200' };
  }
  if (contentType === 'mixed') {
    return { label: t('contentType.mixed'), classes: 'bg-orange-100 text-orange-800 border-orange-200' };
  }
  // contentType === 'media'
  if (firstMediaType === 'url') {
    return { label: t('contentType.link'), classes: 'bg-cyan-100 text-cyan-800 border-cyan-200' };
  }
  if (firstMediaType === 'video') {
    return { label: t('contentType.video'), classes: 'bg-red-100 text-red-800 border-red-200' };
  }
  if (firstMediaType === 'image') {
    return { label: t('contentType.photo'), classes: 'bg-green-100 text-green-800 border-green-200' };
  }
  if (firstMediaType === 'pdf') {
    return { label: t('contentType.pdf'), classes: 'bg-blue-100 text-blue-800 border-blue-200' };
  }
  return { label: t('contentType.media'), classes: 'bg-gray-100 text-gray-800 border-gray-200' };
}
```

3. Inside the ItemCard component function, add the translation hook (after line 79):
```typescript
const t = useTranslations('items.card');
```

4. Update the badge call (line ~155):

**Before:**
```typescript
const badge = getContentTypeBadge(item.contentType, item.media[0]?.type);
```

**After:**
```typescript
const badge = getContentTypeBadge(item.contentType, item.media[0]?.type, t);
```

**Acceptance Criteria:**
- [ ] `useTranslations` imported from 'next-intl'
- [ ] Hook called with 'items.card' namespace
- [ ] `getContentTypeBadge` function accepts translation function parameter
- [ ] All 7 content type labels use translation keys
- [ ] Badge displays correctly for all content types
- [ ] CSS classes preserved correctly

**Testing:**
- Verify LINK badge appears for url-only content
- Verify TEXT badge appears for text-only content
- Verify PDF badge appears for pdf-only content
- Verify MIXED badge appears for mixed content
- Verify VIDEO badge appears for video media
- Verify PHOTO badge appears for image media
- Verify MEDIA badge appears for unknown media types

---

#### Task 2.3: Update ItemCard - Replace Inline Edit Placeholders and Aria Labels

**File:** `/src/components/ItemManager/components/ItemCard.tsx`
**Estimated Time:** 25-35 minutes
**Priority:** HIGH

**Description:**
Replace all hardcoded inline edit placeholder texts and aria-labels with translation function calls.

**Changes Required:**

1. Update title inline edit placeholder (line ~336):

**Before:**
```typescript
placeholder="Enter title..."
ariaLabel={`Edit title for ${item.title}`}
```

**After:**
```typescript
placeholder={t('inlineEdit.titlePlaceholder')}
ariaLabel={t('inlineEdit.titleAriaLabel', { title: item.title })}
```

2. Update location inline edit placeholder (lines ~354-355):

**Before:**
```typescript
placeholder="Add location..."
ariaLabel={`Edit location for ${item.title}`}
```

**After:**
```typescript
placeholder={t('inlineEdit.locationPlaceholder')}
ariaLabel={t('inlineEdit.locationAriaLabel', { title: item.title })}
```

3. Update tags inline edit placeholder (lines ~377-378):

**Before:**
```typescript
placeholder="Add tags..."
ariaLabel={`Edit tags for ${item.title}`}
```

**After:**
```typescript
placeholder={t('inlineEdit.tagsPlaceholder')}
ariaLabel={t('inlineEdit.tagsAriaLabel', { title: item.title })}
```

**Complete Updated InlineEdit Sections:**
```tsx
{/* Title InlineEdit */}
<InlineEdit
  value={item.title}
  onSave={handleTitleSave}
  placeholder={t('inlineEdit.titlePlaceholder')}
  ariaLabel={t('inlineEdit.titleAriaLabel', { title: item.title })}
  maxLength={100}
  minLength={1}
  className="font-semibold text-gray-900 text-sm leading-tight"
  displayClassName="line-clamp-2 group-hover:text-blue-600 transition-colors"
/>

{/* Location InlineEdit */}
<InlineEdit
  value={item.location || ''}
  onSave={handleLocationSave}
  placeholder={t('inlineEdit.locationPlaceholder')}
  ariaLabel={t('inlineEdit.locationAriaLabel', { title: item.title })}
  maxLength={100}
  allowEmpty
  className="text-xs text-gray-500"
  displayClassName="truncate"
/>

{/* Tags InlineEdit */}
<TagsInlineEdit
  tags={item.tags || []}
  onSave={handleTagsSave}
  existingTags={existingTags}
  placeholder={t('inlineEdit.tagsPlaceholder')}
  ariaLabel={t('inlineEdit.tagsAriaLabel', { title: item.title })}
/>
```

**Acceptance Criteria:**
- [ ] Title placeholder uses translation key
- [ ] Title aria-label uses translation key with variable interpolation
- [ ] Location placeholder uses translation key
- [ ] Location aria-label uses translation key with variable interpolation
- [ ] Tags placeholder uses translation key
- [ ] Tags aria-label uses translation key with variable interpolation
- [ ] All placeholders display correctly in edit mode
- [ ] Screen reader announces correct aria-labels

**Testing:**
- Enter edit mode for title, location, and tags
- Verify placeholders appear in correct language
- Test with screen reader to verify aria-labels are announced correctly

---

#### Task 2.4: Update ItemCard - Replace Accessibility Aria-Labels

**File:** `/src/components/ItemManager/components/ItemCard.tsx`
**Estimated Time:** 30-40 minutes
**Priority:** HIGH

**Description:**
Replace the complex aria-label construction on lines 217-219 and the checkbox aria-label with translation function calls.

**Changes Required:**

1. Update the main card aria-label (lines 217-219):

**Before:**
```typescript
const ariaLabel = isSelectionMode
  ? `${item.title}. ${item.location ? `Location: ${item.location}.` : ''} ${badge.label} content. ${isSelected ? 'Selected.' : 'Not selected.'} Press Enter to ${isSelected ? 'deselect' : 'select'}, or click to preview.`
  : `${item.title}. ${item.location ? `Location: ${item.location}.` : ''} ${badge.label} content. Press Enter to preview.`;
```

**After:**
```typescript
const buildAriaLabel = () => {
  const parts: string[] = [item.title];

  if (item.location) {
    parts.push(t('accessibility.locationPrefix', { location: item.location }));
  }

  parts.push(t('accessibility.contentSuffix', { type: badge.label }));

  if (isSelectionMode) {
    parts.push(isSelected ? t('accessibility.selected') : t('accessibility.notSelected'));
    parts.push(isSelected ? t('accessibility.pressEnterToDeselect') : t('accessibility.pressEnterToSelect'));
  } else {
    parts.push(t('accessibility.pressEnterToPreview'));
  }

  return parts.join('. ') + '.';
};

const ariaLabel = buildAriaLabel();
```

2. Update the checkbox aria-label (line ~299):

**Before:**
```typescript
aria-label={`Select ${item.title}`}
```

**After:**
```typescript
aria-label={t('accessibility.selectItem', { title: item.title })}
```

**Acceptance Criteria:**
- [ ] Main card aria-label uses translation keys for all parts
- [ ] Location prefix uses translation with variable interpolation
- [ ] Content type suffix uses translation with variable interpolation
- [ ] Selection status uses appropriate translation key
- [ ] Selection action hint uses appropriate translation key
- [ ] Preview action hint uses translation key
- [ ] Checkbox aria-label uses translation with variable interpolation
- [ ] All accessibility labels announced correctly by screen readers

**Testing:**
- Use screen reader to navigate cards in both selection and normal modes
- Verify complete aria-label is announced with proper translations
- Test checkbox announcement in selection mode

---

#### Task 2.5: Update ItemCard - Replace Tag Overflow Indicator

**File:** `/src/components/ItemManager/components/ItemCard.tsx`
**Estimated Time:** 10-15 minutes
**Priority:** MEDIUM

**Description:**
Replace the hardcoded tag overflow indicator with a translation function call.

**Changes Required:**

Update the tag overflow text (lines 388-389):

**Before:**
```typescript
{item.tags.length > 3 && (
  <span className="text-xs text-gray-500 ml-1">
    +{item.tags.length - 3} more
  </span>
)}
```

**After:**
```typescript
{item.tags.length > 3 && (
  <span className="text-xs text-gray-500 ml-1">
    {t('tags.overflow', { count: item.tags.length - 3 })}
  </span>
)}
```

**Acceptance Criteria:**
- [ ] Tag overflow text uses translation key with count variable
- [ ] Overflow indicator displays correctly for various tag counts (4, 5, 10+ tags)
- [ ] Count value is calculated correctly (tags.length - 3)

**Testing:**
- Create items with 4, 5, and 10 tags
- Verify overflow indicator shows "+1 more", "+2 more", "+7 more" respectively

---

#### Task 2.6: Update ItemCard - Update Component Documentation

**File:** `/src/components/ItemManager/components/ItemCard.tsx`
**Estimated Time:** 5-10 minutes
**Priority:** LOW

**Description:**
Update the component's JSDoc comment to reflect the i18n changes.

**Changes Required:**

Update the file header comment (lines 1-18):

**Before:**
```typescript
/**
 * ItemCard Component
 *
 * A card component for displaying items in the grid view of ItemManager.
 * Features include:
 * - Thumbnail display with Object URL management
 * - Content type badge with appropriate colors
 * - Selection checkbox for bulk operations
 * - Hover and focus states for accessibility
 * - Keyboard navigation support
 * - Inline editing of title, location, and tags (REQ-087, REQ-088)
 * - Long-press gesture for mobile selection mode entry (REQ-069)
 *
 * @module ItemManager/components/ItemCard
 * @lastModified 2026-01-05 (REQ-091 - Added analytics display: visitStats, reactions)
 */
```

**After:**
```typescript
/**
 * ItemCard Component
 *
 * A card component for displaying items in the grid view of ItemManager.
 * Features include:
 * - Thumbnail display with Object URL management
 * - Content type badge with appropriate colors (localized)
 * - Selection checkbox for bulk operations
 * - Hover and focus states for accessibility
 * - Keyboard navigation support
 * - Inline editing of title, location, and tags (REQ-087, REQ-088)
 * - Long-press gesture for mobile selection mode entry (REQ-069)
 * - Full i18n support with next-intl (REQ-387)
 *
 * @module ItemManager/components/ItemCard
 * @lastModified 2026-01-19 (REQ-387 - Added i18n support for all user-facing strings)
 */
```

**Acceptance Criteria:**
- [ ] JSDoc comment mentions i18n support
- [ ] Last modified date updated to current date
- [ ] REQ-387 reference added

---

### Phase 3: Non-English Translations

---

#### Task 3.1: Generate French Translations (fr.json)

**File:** `/messages/fr.json`
**Estimated Time:** 15-20 minutes
**Priority:** HIGH

**Description:**
Add French translations for all ItemGrid and ItemCard strings.

**Translations to Add:**
```json
{
  "items": {
    "grid": {
      "ariaLabel": "{count, plural, =0 {Aucun élément} one {# élément} other {# éléments}}"
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
      "accessibility": {
        "locationPrefix": "Emplacement : {location}",
        "contentSuffix": "Contenu {type}",
        "selected": "Sélectionné",
        "notSelected": "Non sélectionné",
        "pressEnterToSelect": "Appuyez sur Entrée pour sélectionner, ou cliquez pour prévisualiser",
        "pressEnterToDeselect": "Appuyez sur Entrée pour désélectionner, ou cliquez pour prévisualiser",
        "pressEnterToPreview": "Appuyez sur Entrée pour prévisualiser",
        "selectItem": "Sélectionner {title}"
      },
      "inlineEdit": {
        "titlePlaceholder": "Entrez le titre...",
        "titleAriaLabel": "Modifier le titre de {title}",
        "locationPlaceholder": "Ajouter un emplacement...",
        "locationAriaLabel": "Modifier l'emplacement de {title}",
        "tagsPlaceholder": "Ajouter des tags...",
        "tagsAriaLabel": "Modifier les tags de {title}"
      },
      "tags": {
        "overflow": "+{count} de plus"
      }
    }
  }
}
```

**Acceptance Criteria:**
- [ ] All keys from en.json exist in fr.json
- [ ] ICU pluralization syntax correct for French (one/other)
- [ ] Variable placeholders preserved ({count}, {location}, {title}, {type})
- [ ] JSON syntax valid

---

#### Task 3.2: Generate Spanish Translations (es.json)

**File:** `/messages/es.json`
**Estimated Time:** 15-20 minutes
**Priority:** HIGH

**Description:**
Add Spanish translations for all ItemGrid and ItemCard strings.

**Translations to Add:**
```json
{
  "items": {
    "grid": {
      "ariaLabel": "{count, plural, =0 {Sin elementos} one {# elemento} other {# elementos}}"
    },
    "card": {
      "contentType": {
        "link": "ENLACE",
        "text": "TEXTO",
        "pdf": "PDF",
        "mixed": "MIXTO",
        "video": "VIDEO",
        "photo": "FOTO",
        "media": "MEDIOS"
      },
      "accessibility": {
        "locationPrefix": "Ubicación: {location}",
        "contentSuffix": "Contenido {type}",
        "selected": "Seleccionado",
        "notSelected": "No seleccionado",
        "pressEnterToSelect": "Presiona Enter para seleccionar, o haz clic para previsualizar",
        "pressEnterToDeselect": "Presiona Enter para deseleccionar, o haz clic para previsualizar",
        "pressEnterToPreview": "Presiona Enter para previsualizar",
        "selectItem": "Seleccionar {title}"
      },
      "inlineEdit": {
        "titlePlaceholder": "Ingresa el título...",
        "titleAriaLabel": "Editar título de {title}",
        "locationPlaceholder": "Agregar ubicación...",
        "locationAriaLabel": "Editar ubicación de {title}",
        "tagsPlaceholder": "Agregar etiquetas...",
        "tagsAriaLabel": "Editar etiquetas de {title}"
      },
      "tags": {
        "overflow": "+{count} más"
      }
    }
  }
}
```

**Acceptance Criteria:**
- [ ] All keys from en.json exist in es.json
- [ ] ICU pluralization syntax correct for Spanish (one/other)
- [ ] Variable placeholders preserved
- [ ] JSON syntax valid

---

#### Task 3.3: Generate German Translations (de.json)

**File:** `/messages/de.json`
**Estimated Time:** 15-20 minutes
**Priority:** HIGH

**Description:**
Add German translations for all ItemGrid and ItemCard strings.

**Translations to Add:**
```json
{
  "items": {
    "grid": {
      "ariaLabel": "{count, plural, =0 {Keine Elemente} one {# Element} other {# Elemente}}"
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
      "accessibility": {
        "locationPrefix": "Standort: {location}",
        "contentSuffix": "{type}-Inhalt",
        "selected": "Ausgewählt",
        "notSelected": "Nicht ausgewählt",
        "pressEnterToSelect": "Drücken Sie Enter zum Auswählen oder klicken Sie für die Vorschau",
        "pressEnterToDeselect": "Drücken Sie Enter zum Abwählen oder klicken Sie für die Vorschau",
        "pressEnterToPreview": "Drücken Sie Enter für die Vorschau",
        "selectItem": "{title} auswählen"
      },
      "inlineEdit": {
        "titlePlaceholder": "Titel eingeben...",
        "titleAriaLabel": "Titel für {title} bearbeiten",
        "locationPlaceholder": "Standort hinzufügen...",
        "locationAriaLabel": "Standort für {title} bearbeiten",
        "tagsPlaceholder": "Tags hinzufügen...",
        "tagsAriaLabel": "Tags für {title} bearbeiten"
      },
      "tags": {
        "overflow": "+{count} weitere"
      }
    }
  }
}
```

**Acceptance Criteria:**
- [ ] All keys from en.json exist in de.json
- [ ] ICU pluralization syntax correct for German (one/other)
- [ ] Variable placeholders preserved
- [ ] JSON syntax valid

---

#### Task 3.4: Generate Dutch Translations (nl.json)

**File:** `/messages/nl.json`
**Estimated Time:** 15-20 minutes
**Priority:** HIGH

**Description:**
Add Dutch translations for all ItemGrid and ItemCard strings.

**Translations to Add:**
```json
{
  "items": {
    "grid": {
      "ariaLabel": "{count, plural, =0 {Geen items} one {# item} other {# items}}"
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
      "accessibility": {
        "locationPrefix": "Locatie: {location}",
        "contentSuffix": "{type} inhoud",
        "selected": "Geselecteerd",
        "notSelected": "Niet geselecteerd",
        "pressEnterToSelect": "Druk op Enter om te selecteren, of klik om te bekijken",
        "pressEnterToDeselect": "Druk op Enter om te deselecteren, of klik om te bekijken",
        "pressEnterToPreview": "Druk op Enter om te bekijken",
        "selectItem": "{title} selecteren"
      },
      "inlineEdit": {
        "titlePlaceholder": "Voer titel in...",
        "titleAriaLabel": "Titel bewerken voor {title}",
        "locationPlaceholder": "Locatie toevoegen...",
        "locationAriaLabel": "Locatie bewerken voor {title}",
        "tagsPlaceholder": "Tags toevoegen...",
        "tagsAriaLabel": "Tags bewerken voor {title}"
      },
      "tags": {
        "overflow": "+{count} meer"
      }
    }
  }
}
```

**Acceptance Criteria:**
- [ ] All keys from en.json exist in nl.json
- [ ] ICU pluralization syntax correct for Dutch (one/other)
- [ ] Variable placeholders preserved
- [ ] JSON syntax valid

---

#### Task 3.5: Generate Italian Translations (it.json)

**File:** `/messages/it.json`
**Estimated Time:** 15-20 minutes
**Priority:** HIGH

**Description:**
Add Italian translations for all ItemGrid and ItemCard strings.

**Translations to Add:**
```json
{
  "items": {
    "grid": {
      "ariaLabel": "{count, plural, =0 {Nessun elemento} one {# elemento} other {# elementi}}"
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
      "accessibility": {
        "locationPrefix": "Posizione: {location}",
        "contentSuffix": "Contenuto {type}",
        "selected": "Selezionato",
        "notSelected": "Non selezionato",
        "pressEnterToSelect": "Premi Invio per selezionare, o clicca per visualizzare l'anteprima",
        "pressEnterToDeselect": "Premi Invio per deselezionare, o clicca per visualizzare l'anteprima",
        "pressEnterToPreview": "Premi Invio per visualizzare l'anteprima",
        "selectItem": "Seleziona {title}"
      },
      "inlineEdit": {
        "titlePlaceholder": "Inserisci titolo...",
        "titleAriaLabel": "Modifica titolo per {title}",
        "locationPlaceholder": "Aggiungi posizione...",
        "locationAriaLabel": "Modifica posizione per {title}",
        "tagsPlaceholder": "Aggiungi tag...",
        "tagsAriaLabel": "Modifica tag per {title}"
      },
      "tags": {
        "overflow": "+{count} altri"
      }
    }
  }
}
```

**Acceptance Criteria:**
- [ ] All keys from en.json exist in it.json
- [ ] ICU pluralization syntax correct for Italian (one/other)
- [ ] Variable placeholders preserved
- [ ] JSON syntax valid

---

### Phase 4: Testing & Verification

---

#### Task 4.1: Verification Testing

**Estimated Time:** 30-45 minutes
**Priority:** HIGH

**Description:**
Perform comprehensive testing to verify all translations work correctly.

**Test Cases:**

1. **Grid Aria-Label Pluralization:**
   - [ ] Test with 0 items: should display "No items"
   - [ ] Test with 1 item: should display "1 item"
   - [ ] Test with 5 items: should display "5 items"
   - [ ] Repeat in all 6 languages

2. **Content Type Badges:**
   - [ ] Create item with URL-only content: verify "LINK" badge
   - [ ] Create item with text-only content: verify "TEXT" badge
   - [ ] Create item with PDF content: verify "PDF" badge
   - [ ] Create item with mixed content: verify "MIXED" badge
   - [ ] Create item with video: verify "VIDEO" badge
   - [ ] Create item with photo: verify "PHOTO" badge
   - [ ] Test edge case for generic media: verify "MEDIA" badge

3. **Inline Edit Placeholders:**
   - [ ] Click on title field: verify placeholder text
   - [ ] Click on location field: verify placeholder text
   - [ ] Click on tags field: verify placeholder text

4. **Tag Overflow:**
   - [ ] Create item with 4 tags: verify "+1 more" display
   - [ ] Create item with 6 tags: verify "+3 more" display

5. **Accessibility:**
   - [ ] Use screen reader on item card in normal mode
   - [ ] Use screen reader on item card in selection mode (selected)
   - [ ] Use screen reader on item card in selection mode (not selected)
   - [ ] Verify checkbox aria-label announcement

6. **Language Switching:**
   - [ ] Change language to French, verify all strings
   - [ ] Change language to Spanish, verify all strings
   - [ ] Change language to German, verify all strings
   - [ ] Change language to Dutch, verify all strings
   - [ ] Change language to Italian, verify all strings

**Acceptance Criteria:**
- [ ] All test cases pass
- [ ] No console errors related to missing translation keys
- [ ] No visual layout issues with longer translated text
- [ ] Screen reader announces correct content in each language

---

#### Task 4.2: Build Verification

**Estimated Time:** 10-15 minutes
**Priority:** HIGH

**Description:**
Verify the application builds successfully and there are no TypeScript errors.

**Steps:**
1. Run `npm run build`
2. Check for any compilation errors
3. Run `npm run lint` to check for linting issues
4. Run existing tests with `npm test`

**Acceptance Criteria:**
- [ ] Build completes without errors
- [ ] No TypeScript type errors
- [ ] Linting passes
- [ ] Existing tests continue to pass

---

## Verification Checklist

Before marking this request complete, verify all items:

### Code Quality
- [ ] No hardcoded English strings remain in ItemGrid.tsx
- [ ] No hardcoded English strings remain in ItemCard.tsx
- [ ] All imports added correctly
- [ ] Translation hooks called at component level (not inside loops/callbacks)
- [ ] Variable interpolation uses correct syntax

### Translation Files
- [ ] en.json has all required keys with correct structure
- [ ] fr.json has matching key structure with French translations
- [ ] es.json has matching key structure with Spanish translations
- [ ] de.json has matching key structure with German translations
- [ ] nl.json has matching key structure with Dutch translations
- [ ] it.json has matching key structure with Italian translations
- [ ] All JSON files are syntactically valid

### Functionality
- [ ] Grid renders correctly with 0, 1, and multiple items
- [ ] Content type badges display correctly
- [ ] Inline edit placeholders display correctly
- [ ] Tag overflow indicator displays correctly
- [ ] Selection mode works as expected
- [ ] Keyboard navigation works as expected
- [ ] Long-press gesture works on mobile

### Accessibility
- [ ] Screen reader announces correct aria-labels
- [ ] Focus states work correctly
- [ ] Keyboard interactions function properly

### Build
- [ ] Application builds without errors
- [ ] No TypeScript errors
- [ ] Existing tests pass

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Inline edit functionality breaks | Low | High | Test all edit operations thoroughly after changes |
| Content type badge colors lost | Low | Medium | Ensure CSS classes preserved in refactored function |
| ICU pluralization syntax errors | Medium | Medium | Validate syntax before testing, use ICU message linter |
| Accessibility regression | Medium | High | Test with screen reader in multiple languages |
| Text overflow on longer translations | Medium | Low | UI uses truncation; verify visually |
| Translation hook called in loop | Medium | High | Code review to ensure hook at component level |

---

## Dependencies and Relationships

### Upstream Dependencies
| Dependency | Status | Notes |
|------------|--------|-------|
| REQ-230: i18n configuration | ✓ Complete | Provides config module |
| REQ-231: next.config.ts update | ✓ Complete | Enables i18n |
| REQ-385: items namespace structure | Required | Provides namespace foundation |

### Downstream Dependencies
| Task | Impact |
|------|--------|
| REQ-388: Filter/sort components | May reference same namespace |
| Epic 2 completion | This task is part of Sub-Epic 2D |

### Related Tasks
| Task ID | Title | Relationship |
|---------|-------|--------------|
| REQ-386 | Update ItemManager component family | Parent task in Sub-Epic 2D |
| REQ-388 | Update filter and sort components | Sibling task |

---

## Appendix A: Complete Code References

### ItemGrid.tsx - Final State
```typescript
'use client';

/**
 * ItemGrid Component
 *
 * Renders items in a responsive multi-column grid layout.
 * Each item is displayed using the ItemCard component.
 *
 * @module ItemManager/components/ItemGrid
 * @lastModified 2026-01-19 (REQ-387 - Added i18n support)
 */

import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
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

---

*Document generated for FAQBNB Localization Epic 2 - Sub-Epic 2D: Item Management*
*Task 2D.3: Update ItemGrid and ItemCard*
