# REQ-387: Update ItemGrid and ItemCard Components for Localization - Implementation Overview

**Generated:** 2026-01-19 17:15:00 UTC
**Last Modified:** 2026-01-19 17:15:00 UTC
**Request Reference:** docs/gen_requests_epic2.md - Request #387
**Implementation Plan Reference:** docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md
**Epic:** Epic 2 - Static UI Translation
**Sub-Epic:** 2D - Item Management
**Task ID:** 2D.3

---

## Overview

This document outlines the implementation approach for localizing the ItemGrid and ItemCard components to support all 6 languages (English, French, Spanish, German, Dutch, Italian). These components are core to the item browsing experience and contain numerous hardcoded English strings that must be replaced with translation function calls.

### Scope

| Aspect | Details |
|--------|---------|
| **Components** | ItemGrid.tsx, ItemCard.tsx |
| **Estimated Strings** | ~70 strings |
| **Languages** | 6 (en, fr, es, de, nl, it) |
| **Priority** | High - Core browsing UI |
| **Dependencies** | Epic 1 Foundation (next-intl setup complete) |

---

## Current State Analysis

### ItemGrid Component (`src/components/ItemManager/components/ItemGrid.tsx`)

**Hardcoded Strings Identified:**

| Line | Current String | Type |
|------|----------------|------|
| 38 | `` `${items.length} item${items.length !== 1 ? 's' : ''}` `` | aria-label with pluralization |

**Issues:**
- Grid aria-label uses JavaScript string concatenation for pluralization
- Pluralization logic is English-only (doesn't support language-specific plural rules)

### ItemCard Component (`src/components/ItemManager/components/ItemCard.tsx`)

**Hardcoded Strings Identified:**

| Line | Current String | Context |
|------|----------------|---------|
| 33 | `'LINK'` | Content type badge |
| 36 | `'TEXT'` | Content type badge |
| 39 | `'PDF'` | Content type badge |
| 42 | `'MIXED'` | Content type badge |
| 45 | `'LINK'` | Content type badge (for URL media) |
| 48 | `'VIDEO'` | Content type badge |
| 51 | `'PHOTO'` | Content type badge |
| 55 | `'PDF'` | Content type badge (for PDF media) |
| 57 | `'MEDIA'` | Content type badge (default) |
| 218 | `'Location:'` | aria-label prefix |
| 218 | `'content'` | aria-label suffix |
| 218 | `'Selected.'` / `'Not selected.'` | Selection status |
| 218 | `'Press Enter to deselect/select, or click to preview.'` | Interaction hint |
| 219 | `'Press Enter to preview.'` | Interaction hint |
| 299 | `` `Select ${item.title}` `` | Checkbox aria-label |
| 336 | `'Enter title...'` | Inline edit placeholder |
| 337 | `` `Edit title for ${item.title}` `` | Inline edit aria-label |
| 354 | `'Add location...'` | Inline edit placeholder |
| 355 | `` `Edit location for ${item.title}` `` | Inline edit aria-label |
| 377 | `'Add tags...'` | Tags inline edit placeholder |
| 378 | `` `Edit tags for ${item.title}` `` | Tags inline edit aria-label |
| 388-389 | `+{item.tags.length - 3} more` | Tag overflow indicator |

---

## Technical Approach

### Translation Pattern

Following the established pattern from `LogoutButton.tsx`:

```typescript
'use client';

import { useTranslations } from 'next-intl';

export function ItemCard({ ... }) {
  const t = useTranslations('items.card');
  // Use t('key') or t('key', { variable: value })
}
```

### Translation Keys Structure

Keys will be added to the existing `items` namespace in `/messages/en.json`:

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
        "location": "Location: {location}",
        "contentType": "{type} content",
        "selected": "Selected",
        "notSelected": "Not selected",
        "selectAction": "Press Enter to {action}, or click to preview",
        "previewAction": "Press Enter to preview",
        "selectCheckbox": "Select {title}",
        "select": "select",
        "deselect": "deselect"
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

### Pluralization (ICU Format)

The grid aria-label requires proper ICU pluralization to handle language-specific plural rules:

```typescript
// Before
aria-label={`${items.length} item${items.length !== 1 ? 's' : ''}`}

// After
const t = useTranslations('items.grid');
aria-label={t('ariaLabel', { count: items.length })}
```

ICU message format in translation file:
```json
"ariaLabel": "{count, plural, =0 {No items} one {# item} other {# items}}"
```

### Content Type Badge Helper Refactoring

The `getContentTypeBadge` helper function will be refactored to use translation keys:

```typescript
function getContentTypeBadge(contentType: string, firstMediaType: string | undefined, t: ReturnType<typeof useTranslations>) {
  if (contentType === 'url-only') {
    return { label: t('contentType.link'), classes: 'bg-cyan-100 text-cyan-800 border-cyan-200' };
  }
  // ... etc
}
```

---

## Implementation Tasks

### Task 1: Add Translation Keys to en.json

Add all required translation keys to `/messages/en.json` under the `items` namespace.

**Acceptance Criteria:**
- [ ] All ItemGrid strings added with proper ICU pluralization
- [ ] All ItemCard strings added with variable interpolation where needed
- [ ] Keys follow established naming convention

### Task 2: Update ItemGrid Component

Integrate `useTranslations` hook and replace hardcoded aria-label.

**Acceptance Criteria:**
- [ ] Import `useTranslations` from 'next-intl'
- [ ] Replace pluralized aria-label with translation function call
- [ ] Maintain all existing functionality

### Task 3: Update ItemCard Component

Integrate `useTranslations` hook and replace all hardcoded strings.

**Acceptance Criteria:**
- [ ] Import `useTranslations` from 'next-intl'
- [ ] Refactor `getContentTypeBadge` to use translations
- [ ] Replace all inline edit placeholders with translation keys
- [ ] Replace all aria-labels with translation keys
- [ ] Replace tag overflow indicator with translation key
- [ ] All variable interpolation uses proper syntax
- [ ] Maintain all existing functionality including inline editing, selection mode, and accessibility

### Task 4: Generate Non-English Translations

Add translated strings to all 5 non-English language files.

**Acceptance Criteria:**
- [ ] fr.json updated with French translations
- [ ] es.json updated with Spanish translations
- [ ] de.json updated with German translations
- [ ] nl.json updated with Dutch translations
- [ ] it.json updated with Italian translations
- [ ] All ICU pluralization rules correct per language

### Task 5: Testing & Verification

Verify components work correctly in all languages.

**Acceptance Criteria:**
- [ ] Grid displays correctly with 0, 1, and multiple items
- [ ] Content type badges display correctly in all languages
- [ ] Inline edit placeholders appear in correct language
- [ ] Accessibility labels announced correctly by screen readers
- [ ] Tag overflow indicator displays correct count format
- [ ] Selection mode interactions work as expected
- [ ] No visual layout issues with longer translated text

---

## Authorized Files and Functions for Modification

### Primary Files

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

### Functions to Modify

| File | Function | Modification |
|------|----------|--------------|
| `ItemGrid.tsx` | `ItemGrid` | Add translation hook, update aria-label |
| `ItemCard.tsx` | `getContentTypeBadge` | Accept translation function parameter, return translated labels |
| `ItemCard.tsx` | `ItemCard` | Add translation hook, replace all hardcoded strings |

### Files NOT to Modify

- `/src/components/ItemManager/ItemManager.types.ts` - No changes needed to type definitions
- `/src/components/ItemManager/components/shared/InlineEdit.tsx` - Placeholders are passed as props
- `/src/components/ItemManager/components/shared/TagsInlineEdit.tsx` - Placeholders are passed as props

---

## Dependencies

### Required Before Starting

| Dependency | Status | Location |
|------------|--------|----------|
| next-intl package | Installed | package.json |
| i18n config | Complete | /src/lib/i18n/config.ts |
| IntlProvider wrapper | Complete | /src/app/layout.tsx |
| Base translation files | Complete | /messages/*.json |

### Related Tasks

| Task ID | Title | Relationship |
|---------|-------|--------------|
| REQ-385 | Create `items` namespace structure | Provides namespace structure |
| REQ-386 | Update ItemManager component family | Parent task for Item Management l10n |
| REQ-388 | Update filter and sort components | Sibling task in Sub-Epic 2D |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Inline edit functionality breaks | Low | High | Thorough testing of edit mode, keyboard navigation |
| Content type badge colors lost | Low | Medium | Ensure refactored helper preserves class mappings |
| ICU pluralization syntax errors | Medium | Medium | Validate syntax in all 6 language files |
| Accessibility regression | Medium | High | Test with screen reader in multiple languages |
| Text overflow on longer translations | Medium | Low | UI already uses truncation; verify visually |

---

## Verification Checklist

Before marking complete:

- [ ] No hardcoded English strings remain in ItemGrid.tsx
- [ ] No hardcoded English strings remain in ItemCard.tsx
- [ ] All 6 language files have matching key structures
- [ ] Pluralization works correctly for 0, 1, and multiple items
- [ ] Variable interpolation works for item titles
- [ ] Content type badges display correctly
- [ ] Inline edit placeholders display correctly
- [ ] All aria-labels are properly translated
- [ ] Screen reader announces correct language content
- [ ] Visual layout unchanged from current state
- [ ] Build passes without errors
- [ ] Existing unit tests still pass

---

## Appendix A: Sample Translations

### English (en.json)

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
      }
    }
  }
}
```

### French (fr.json)

```json
{
  "items": {
    "grid": {
      "ariaLabel": "{count, plural, =0 {Aucun article} one {# article} other {# articles}}"
    },
    "card": {
      "contentType": {
        "link": "LIEN",
        "text": "TEXTE",
        "pdf": "PDF",
        "mixed": "MIXTE",
        "video": "VIDEO",
        "photo": "PHOTO",
        "media": "MEDIA"
      }
    }
  }
}
```

### German (de.json)

```json
{
  "items": {
    "grid": {
      "ariaLabel": "{count, plural, =0 {Keine Artikel} one {# Artikel} other {# Artikel}}"
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
      }
    }
  }
}
```

---

*Document generated for FAQBNB Localization Epic 2 - Sub-Epic 2D: Item Management*
