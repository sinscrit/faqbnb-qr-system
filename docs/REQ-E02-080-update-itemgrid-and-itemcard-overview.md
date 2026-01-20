# REQ-E02-080: Update ItemGrid and ItemCard Components for Internationalization

**Document Type:** Implementation Breakdown (Overview)
**Request ID:** REQ-E02-080
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2D - Item Management
**Task Reference:** 2D.3
**Priority:** High
**Size:** M (Medium)

**Created:** 2026-01-20
**Last Modified:** 2026-01-20

---

## 1. Summary

This document provides the implementation breakdown for adding internationalization support to the ItemGrid and ItemCard components. These components are core UI elements in the Item Management feature, displaying item collections in a responsive grid layout. The implementation requires integrating next-intl translations for all hardcoded UI strings while also enabling display of localized item content from the item_translations database table.

---

## 2. Requirements Analysis

### 2.1 Source Request Overview

**From:** `/docs/gen_requests_epic2.md` - Request #80

The ItemGrid and ItemCard components must be updated to:
1. Display localized UI labels using next-intl translation hooks
2. Support locale context for displaying translated item names and descriptions
3. Provide fallback behavior when translations are missing
4. Handle language switching without page reload

### 2.2 Current Behavior

- **ItemGrid** (`src/components/ItemManager/components/ItemGrid.tsx`):
  - Hardcoded aria-label with English text: `${items.length} item${items.length !== 1 ? 's' : ''}`
  - No translation hooks imported
  - No locale awareness

- **ItemCard** (`src/components/ItemManager/components/ItemCard.tsx`):
  - Hardcoded content type labels: 'LINK', 'TEXT', 'PDF', 'MIXED', 'VIDEO', 'PHOTO', 'MEDIA'
  - Hardcoded placeholder texts: "Enter title...", "Add location...", "Add tags..."
  - Hardcoded aria-labels with English text: "Location:", "Selected.", "Not selected.", "Press Enter to..."
  - Hardcoded overflow text: "+{n} more"
  - Hardcoded alt text patterns: `${item.title} thumbnail`

### 2.3 Expected Behavior

After implementation:
1. All UI strings use translation hooks (`useTranslations('items')`)
2. Aria-labels reflect the selected language for accessibility
3. Content type badges display translated labels
4. Placeholder texts use locale-appropriate messages
5. Pluralization uses ICU format for item counts
6. Components respond to locale context changes without page reload

---

## 3. Technical Approach

### 3.1 Architecture Pattern

Following the established Epic 2 pattern for client components:

```typescript
// Pattern for client components
'use client';
import { useTranslations } from 'next-intl';

function Component() {
  const t = useTranslations('items');
  return <span>{t('card.contentType.photo')}</span>;
}
```

### 3.2 Translation Namespace

All translations will be added to the existing `items` namespace in `/messages/*.json`:

```json
{
  "items": {
    "grid": {
      "ariaLabel": "{count, plural, =0 {No items} one {# item} other {# items}}",
      "loading": "Loading items"
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
      "placeholder": {
        "title": "Enter title...",
        "location": "Add location...",
        "tags": "Add tags..."
      },
      "aria": {
        "location": "Location: {location}",
        "selected": "Selected",
        "notSelected": "Not selected",
        "pressEnterToSelect": "Press Enter to select",
        "pressEnterToDeselect": "Press Enter to deselect",
        "pressEnterToPreview": "Press Enter to preview",
        "selectItem": "Select {title}",
        "thumbnail": "{title} thumbnail"
      },
      "tags": {
        "more": "+{count} more"
      }
    }
  }
}
```

### 3.3 Dependencies

| Dependency | Status | Location |
|------------|--------|----------|
| next-intl | ✅ Installed | `package.json` |
| useTranslations hook | ✅ Available | `next-intl` |
| Translation files | ✅ Exists | `/messages/*.json` |
| items namespace | ✅ Exists | `/messages/en.json` |
| LocaleContext | ✅ Available | `src/contexts/LocaleContext.tsx` |

---

## 4. Implementation Tasks

### Task 1: Extend items namespace in translation files (Priority: High)

**Description:** Add new translation keys for ItemGrid and ItemCard components to all 6 language files.

**Files to Modify:**
- `/messages/en.json`
- `/messages/fr.json`
- `/messages/es.json`
- `/messages/de.json`
- `/messages/nl.json`
- `/messages/it.json`

**Acceptance Criteria:**
- [ ] Add `items.grid.*` keys for grid-level translations
- [ ] Add `items.card.contentType.*` keys for all badge labels
- [ ] Add `items.card.placeholder.*` keys for inline edit placeholders
- [ ] Add `items.card.aria.*` keys for accessibility strings
- [ ] Add `items.card.tags.more` key with pluralization support
- [ ] Verify ICU format for pluralized strings
- [ ] All 6 language files contain identical key structure

---

### Task 2: Update ItemGrid component for i18n (Priority: High)

**Description:** Add translation hook and replace hardcoded strings in ItemGrid.

**File to Modify:** `src/components/ItemManager/components/ItemGrid.tsx`

**Current Code (lines 38-40):**
```typescript
aria-label={`${items.length} item${items.length !== 1 ? 's' : ''}`}
aria-busy={loading}
aria-describedby={items.length === 0 ? 'empty-message-grid' : undefined}
```

**Target Code:**
```typescript
import { useTranslations } from 'next-intl';

export function ItemGrid({ ... }: ItemGridProps & { loading?: boolean }) {
  const t = useTranslations('items.grid');

  return (
    <div
      className={cn(...)}
      role="grid"
      aria-label={t('ariaLabel', { count: items.length })}
      aria-busy={loading}
      aria-describedby={items.length === 0 ? 'empty-message-grid' : undefined}
    >
      {/* ... */}
    </div>
  );
}
```

**Acceptance Criteria:**
- [ ] Import `useTranslations` from `next-intl`
- [ ] Initialize translation hook with `items.grid` namespace
- [ ] Replace hardcoded aria-label with translated string using ICU pluralization
- [ ] Verify component renders correctly in all 6 languages
- [ ] TypeScript compiles without errors

---

### Task 3: Update ItemCard content type badge translations (Priority: High)

**Description:** Replace hardcoded content type labels with translated strings.

**File to Modify:** `src/components/ItemManager/components/ItemCard.tsx`

**Current Code (lines 31-58) - `getContentTypeBadge` function:**
```typescript
function getContentTypeBadge(contentType: string, firstMediaType?: string) {
  if (contentType === 'url-only') {
    return { label: 'LINK', classes: '...' };
  }
  // ... more hardcoded labels
}
```

**Target Approach:**
Move badge label retrieval inside component where `t` hook is available, or pass `t` function to helper:

```typescript
// Option A: Move logic inside component
const t = useTranslations('items.card');

const getBadgeLabel = (contentType: string, firstMediaType?: string): string => {
  if (contentType === 'url-only') return t('contentType.link');
  if (contentType === 'text-only') return t('contentType.text');
  if (contentType === 'pdf-only') return t('contentType.pdf');
  if (contentType === 'mixed') return t('contentType.mixed');
  if (firstMediaType === 'url') return t('contentType.link');
  if (firstMediaType === 'video') return t('contentType.video');
  if (firstMediaType === 'image') return t('contentType.photo');
  if (firstMediaType === 'pdf') return t('contentType.pdf');
  return t('contentType.media');
};
```

**Acceptance Criteria:**
- [ ] All content type labels use translation keys
- [ ] Badge displays correctly in all 6 languages
- [ ] Original badge CSS classes preserved
- [ ] No regression in badge appearance

---

### Task 4: Update ItemCard placeholder texts (Priority: Medium)

**Description:** Replace hardcoded placeholder strings in InlineEdit components.

**File to Modify:** `src/components/ItemManager/components/ItemCard.tsx`

**Current Code (lines 333-378):**
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

**Acceptance Criteria:**
- [ ] All placeholder texts use translation keys
- [ ] All aria-labels use translation keys with interpolation
- [ ] Inline edit functionality unchanged
- [ ] Screen readers announce correctly in all languages

---

### Task 5: Update ItemCard accessibility strings (Priority: High)

**Description:** Replace hardcoded aria-labels and accessibility text with translations.

**File to Modify:** `src/components/ItemManager/components/ItemCard.tsx`

**Current Code (lines 217-219):**
```typescript
const ariaLabel = isSelectionMode
  ? `${item.title}. ${item.location ? `Location: ${item.location}.` : ''} ${badge.label} content. ${isSelected ? 'Selected.' : 'Not selected.'} Press Enter to ${isSelected ? 'deselect' : 'select'}, or click to preview.`
  : `${item.title}. ${item.location ? `Location: ${item.location}.` : ''} ${badge.label} content. Press Enter to preview.`;
```

**Target Code:**
```typescript
const ariaLabel = useMemo(() => {
  const locationPart = item.location
    ? t('aria.location', { location: item.location })
    : '';
  const selectionPart = isSelected
    ? t('aria.selected')
    : t('aria.notSelected');
  const actionPart = isSelectionMode
    ? (isSelected ? t('aria.pressEnterToDeselect') : t('aria.pressEnterToSelect'))
    : t('aria.pressEnterToPreview');

  return `${item.title}. ${locationPart} ${badge.label}. ${isSelectionMode ? `${selectionPart}. ` : ''}${actionPart}`;
}, [item.title, item.location, badge.label, isSelectionMode, isSelected, t]);
```

**Additional locations to update:**
- Line 249: `alt={`${item.title} thumbnail`}` → `alt={t('aria.thumbnail', { title: item.title })}`
- Line 299: `aria-label={`Select ${item.title}`}` → `aria-label={t('aria.selectItem', { title: item.title })}`

**Acceptance Criteria:**
- [ ] All aria-labels use translation keys
- [ ] Dynamic values (title, location) properly interpolated
- [ ] Screen reader experience consistent across languages
- [ ] No accessibility regression

---

### Task 6: Update ItemCard tag overflow text (Priority: Medium)

**Description:** Replace hardcoded "+N more" text with translated string.

**File to Modify:** `src/components/ItemManager/components/ItemCard.tsx`

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
- [ ] Overflow text uses translation key
- [ ] Count is properly interpolated
- [ ] Visual appearance unchanged

---

### Task 7: Testing and verification (Priority: High)

**Description:** Verify all translations work correctly across languages.

**Test Scenarios:**
1. Render ItemGrid with 0, 1, and multiple items in each language
2. Verify content type badges display correctly in each language
3. Test inline edit placeholders in each language
4. Verify screen reader announces aria-labels correctly
5. Test language switching without page reload
6. Verify no console warnings about missing translation keys

**Acceptance Criteria:**
- [ ] All 6 languages display correctly
- [ ] No missing translation warnings in console
- [ ] Pluralization works correctly (0, 1, many items)
- [ ] Language switching updates UI without reload
- [ ] TypeScript compiles without errors
- [ ] Existing component functionality preserved

---

## 5. Authorized Files and Functions for Modification

### 5.1 Primary Files

| File | Functions/Sections | Modification Type |
|------|-------------------|-------------------|
| `src/components/ItemManager/components/ItemGrid.tsx` | Entire file | Add import, add hook, update aria-label |
| `src/components/ItemManager/components/ItemCard.tsx` | `getContentTypeBadge`, `ItemCard`, `ariaLabel` construction | Add import, add hook, replace strings |
| `/messages/en.json` | `items` namespace | Extend with new keys |
| `/messages/fr.json` | `items` namespace | Extend with new keys |
| `/messages/es.json` | `items` namespace | Extend with new keys |
| `/messages/de.json` | `items` namespace | Extend with new keys |
| `/messages/nl.json` | `items` namespace | Extend with new keys |
| `/messages/it.json` | `items` namespace | Extend with new keys |

### 5.2 Functions to Modify

**ItemGrid.tsx:**
- `ItemGrid` function component - add useTranslations hook and update aria-label

**ItemCard.tsx:**
- `getContentTypeBadge` function - refactor to accept translation function or move logic inside component
- `ItemCard` function component - add useTranslations hook
- `ariaLabel` construction (lines 217-219) - use translation keys
- `handleTitleSave`, `handleLocationSave`, `handleTagsSave` - no changes needed
- JSX return - update all hardcoded strings

### 5.3 Read-Only Reference Files

| File | Purpose |
|------|---------|
| `src/components/ItemManager/ItemManager.types.ts` | Type definitions for props |
| `src/contexts/LocaleContext.tsx` | Locale context pattern reference |
| `src/lib/i18n/config.ts` | i18n configuration reference |
| `docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md` | Implementation plan reference |

---

## 6. Translation Strings Required

### 6.1 English (en.json) - New Keys

```json
{
  "items": {
    "grid": {
      "ariaLabel": "{count, plural, =0 {No items} one {# item} other {# items}}",
      "loading": "Loading items"
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
        "editTags": "Edit tags for {title}"
      },
      "tags": {
        "more": "+{count} more"
      }
    }
  }
}
```

### 6.2 French (fr.json) - Translations

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
        "editTags": "Modifier les tags de {title}"
      },
      "tags": {
        "more": "+{count} de plus"
      }
    }
  }
}
```

### 6.3 Other Languages

Similar translations will be provided for:
- Spanish (es.json)
- German (de.json)
- Dutch (nl.json)
- Italian (it.json)

---

## 7. Dependencies and Blockers

### 7.1 Prerequisites
- [x] Epic 1 foundation complete (next-intl installed and configured)
- [x] Translation files exist for all 6 languages
- [x] LocaleContext available for locale state management

### 7.2 Dependencies on Other Requests
| Request | Dependency Type | Status |
|---------|-----------------|--------|
| REQ-E02-079 (ItemManager component family) | Should be completed first | In Progress |
| Sub-Epic 2H (Common & Shared) | Shared translation patterns | Foundation |

### 7.3 Potential Blockers
- None identified - all prerequisites are met

---

## 8. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Badge text overflow in other languages | Low | Low | Keep badge labels short (3-6 chars) |
| Aria-label complexity causing translation issues | Medium | Medium | Test with screen readers in all languages |
| Performance impact from translation hook calls | Low | Low | Memoize where appropriate |
| Missing translation keys in production | Low | High | Add build-time translation key validation |

---

## 9. Verification Checklist

### 9.1 Functional Verification
- [ ] ItemGrid displays correct item count in all 6 languages
- [ ] ItemCard content type badges show translated labels
- [ ] Placeholder texts appear in correct language
- [ ] Language switching updates all text without page reload
- [ ] Existing functionality (selection, preview, inline edit) unchanged

### 9.2 Accessibility Verification
- [ ] Screen reader announces grid item count correctly
- [ ] Screen reader announces card content in selected language
- [ ] Aria-labels are grammatically correct in all languages
- [ ] Keyboard navigation continues to work

### 9.3 Code Quality Verification
- [ ] TypeScript compiles without errors
- [ ] No console warnings for missing translation keys
- [ ] Translation keys follow naming convention
- [ ] ICU format used correctly for pluralization

---

## 10. References

- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md`
- **Request Source:** `/docs/gen_requests_epic2.md` - REQ-E02-080
- **Epic 1 Foundation:** `/docs/prd/Plan-110-L10N-Epic1-Foundation.md`
- **next-intl Documentation:** https://next-intl-docs.vercel.app/
- **ICU Message Format:** https://unicode-org.github.io/icu/userguide/format_parse/messages/

---

*Document generated for FAQBNB Localization Epic 2 - Sub-Epic 2D: Item Management*
