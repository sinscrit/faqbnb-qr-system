# REQ-390: Update Item Detail and Edit Pages for Localization - Detailed Task Breakdown

**Last Modified:** 2026-01-19 17:30 UTC
**Request ID:** REQ-390
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2D - Item Management
**Task ID:** 2D.6
**Size:** L (Large)
**Priority:** P1 - High
**Overview Document:** [REQ-390-update-item-detailedit-pages-overview.md](./REQ-390-update-item-detailedit-pages-overview.md)
**Implementation Plan:** [Plan-111-L10N-Epic2-Static-UI-Translation.md](./prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)

---

## Task Summary

This document provides a granular, step-by-step implementation breakdown for localizing all item detail and edit pages. The task involves replacing ~115 hardcoded English strings across 6 component files with translation keys using the `next-intl` framework.

---

## Pre-Implementation Checklist

Before starting implementation, verify:

- [ ] `next-intl` package is installed (`package.json`)
- [ ] i18n configuration exists at `/src/lib/i18n/config.ts`
- [ ] Translation files exist at `/messages/*.json` (en, fr, es, de, nl, it)
- [ ] `useTranslations` hook is available from `next-intl`
- [ ] Existing `items` namespace in `/messages/en.json` is accessible

---

## Task Breakdown

### Task 2D.6.1: Extend Translation Keys in /messages/en.json

**Estimated Effort:** 1 story point
**File:** `/messages/en.json`
**Dependencies:** None

#### Description
Add comprehensive translation keys for all item detail/edit page strings under the `items` namespace.

#### Implementation Steps

1. Open `/messages/en.json`
2. Extend the existing `items` namespace with the following structure:

```json
{
  "items": {
    "edit": {
      "title": "Edit Item",
      "backToItems": "Back to Items",
      "returnToItems": "Return to Items",
      "nameLabel": "Item Name",
      "namePlaceholder": "Enter item name",
      "descriptionLabel": "Description",
      "descriptionPlaceholder": "Enter item description (optional)",
      "additionalTags": "Additional Tags",
      "additionalTagsHint": "Add custom tags for additional categorization",
      "tagsPlaceholder": "Click to add tags...",
      "saving": "Saving...",
      "saveChanges": "Save Changes",
      "loginRequired": "Please log in to edit items.",
      "loadingItem": "Loading item..."
    },
    "list": {
      "title": "My Items",
      "itemCount": "{count, plural, =0 {No items} one {# item} other {# items}} total",
      "createNew": "New QR Code Item",
      "dismiss": "Dismiss",
      "loginRequired": "Please log in to view items.",
      "loadingItems": "Loading items..."
    },
    "form": {
      "roomLabel": "Room",
      "roomAriaLabel": "Select room for this item",
      "roomPlaceholder": "Select a room...",
      "itemTypeLabel": "Item Type",
      "itemTypeAriaLabel": "Select item type",
      "itemTypePlaceholder": "Select item type..."
    },
    "guides": {
      "title": "Guides",
      "description": "Content associated with this item",
      "emptyTitle": "No guides yet",
      "emptyDescription": "Guides for this item will appear here",
      "editButton": "Edit"
    },
    "tags": {
      "placeholder": "Add tags...",
      "typeToAdd": "Type to add...",
      "maxReached": "Max tags reached",
      "editTags": "Edit tags",
      "suggestions": "Tag suggestions",
      "saving": "Saving...",
      "selected": "{count} tags selected",
      "more": "+{count} more"
    },
    "validation": {
      "tagEmpty": "Tag cannot be empty",
      "tagTooLong": "Tag must be {max} characters or less",
      "tagDuplicate": "Tag already exists",
      "tagMaxCount": "Maximum {max} tags allowed"
    },
    "errors": {
      "propertyMissing": "Property ID is missing",
      "fetchItemFailed": "Failed to fetch item",
      "fetchItemsFailed": "Failed to fetch items",
      "updateFailed": "Failed to update item",
      "deleteFailed": "Failed to delete items",
      "duplicateFailed": "Failed to duplicate item",
      "saveTagsFailed": "Failed to save tags"
    },
    "purposes": {
      "how_to_use": "How To Use",
      "how-to-use": "How To Use",
      "troubleshooting": "Troubleshooting",
      "how_to_clean": "How To Clean",
      "how-to-clean": "How To Clean",
      "safety_info": "Safety Info",
      "safety-info": "Safety Info",
      "maintenance": "Maintenance",
      "features": "Features",
      "other": "Other"
    }
  }
}
```

#### Acceptance Criteria
- [ ] All new translation keys are added to `/messages/en.json`
- [ ] Keys follow `items.{section}.{element}` naming convention
- [ ] Pluralization uses ICU format for count-based strings
- [ ] Variable interpolation uses `{variableName}` syntax
- [ ] JSON is valid and properly formatted

---

### Task 2D.6.2: Update Edit Item Page (/src/app/dashboard2/items/[publicId]/edit/page.tsx)

**Estimated Effort:** 2 story points
**File:** `/src/app/dashboard2/items/[publicId]/edit/page.tsx`
**Dependencies:** Task 2D.6.1

#### Description
Replace all hardcoded English strings in the edit item page with translation function calls.

#### Implementation Steps

1. Add import at the top of the file:
```typescript
import { useTranslations } from 'next-intl';
```

2. Add translation hooks inside the component function (after line 33):
```typescript
const t = useTranslations('items');
const tCommon = useTranslations('common');
```

3. Replace each hardcoded string with its translation key:

| Line | Current String | Replacement |
|------|---------------|-------------|
| 178 | `"Please log in to edit items."` | `{t('edit.loginRequired')}` |
| 188 | `"Loading item..."` | `{t('edit.loadingItem')}` |
| 201-203 | `"Return to Items"` | `{t('edit.returnToItems')}` |
| 218-219 | `"Back to Items"` | `{t('edit.backToItems')}` |
| 221 | `"Edit Item"` | `{t('edit.title')}` |
| 236-237 | `"Item Name"` | `{t('edit.nameLabel')}` |
| 247 | `placeholder="Enter item name"` | `placeholder={t('edit.namePlaceholder')}` |
| 252-253 | `"Description"` | `{t('edit.descriptionLabel')}` |
| 263 | `placeholder="Enter item description (optional)"` | `placeholder={t('edit.descriptionPlaceholder')}` |
| 283-284 | `"Additional Tags"` | `{t('edit.additionalTags')}` |
| 286-287 | `"Add custom tags for additional categorization"` | `{t('edit.additionalTagsHint')}` |
| 293 | `placeholder="Click to add tags..."` | `placeholder={t('edit.tagsPlaceholder')}` |
| 315-316 | `"Cancel"` | `{tCommon('cancel')}` |
| 326 | `"Saving..."` | `{t('edit.saving')}` |
| 330 | `"Save Changes"` | `{t('edit.saveChanges')}` |
| 149 | `'Property ID is missing'` | `t('errors.propertyMissing')` |
| 89 | `'Failed to fetch item'` | `t('errors.fetchItemFailed')` |
| 93 | `'Failed to fetch item'` | `t('errors.fetchItemFailed')` |
| 165 | `'Failed to update item'` | `t('errors.updateFailed')` |
| 169 | `'Failed to update item'` | `t('errors.updateFailed')` |

#### Code Changes

**Before (example):**
```typescript
<h1 className="text-2xl font-bold text-gray-900">Edit Item</h1>
```

**After:**
```typescript
<h1 className="text-2xl font-bold text-gray-900">{t('edit.title')}</h1>
```

#### Acceptance Criteria
- [ ] `useTranslations` hook is imported from `next-intl`
- [ ] All hardcoded strings replaced with `t()` or `tCommon()` calls
- [ ] No hardcoded English text remains in the component
- [ ] Component renders correctly in English
- [ ] No TypeScript errors
- [ ] Form submission behavior unchanged

---

### Task 2D.6.3: Update Items List Page (/src/app/dashboard2/items/page.tsx)

**Estimated Effort:** 1 story point
**File:** `/src/app/dashboard2/items/page.tsx`
**Dependencies:** Task 2D.6.1

#### Description
Replace all hardcoded English strings in the items list page with translation function calls.

#### Implementation Steps

1. Add import at the top of the file:
```typescript
import { useTranslations } from 'next-intl';
```

2. Add translation hook inside the component function (after line 26):
```typescript
const t = useTranslations('items');
```

3. Replace each hardcoded string:

| Line | Current String | Replacement |
|------|---------------|-------------|
| 205 | `"Please log in to view items."` | `{t('list.loginRequired')}` |
| 215 | `"Loading items..."` | `{t('list.loadingItems')}` |
| 226 | `"My Items"` | `{t('list.title')}` |
| 227-228 | `{items.length} {items.length === 1 ? 'item' : 'items'} total` | `{t('list.itemCount', { count: items.length })}` |
| 236 | `"New QR Code Item"` | `{t('list.createNew')}` |
| 243 | `"Dismiss"` | `{t('list.dismiss')}` |
| 79 | `'Failed to fetch items'` | `t('errors.fetchItemsFailed')` |
| 83 | `'Failed to fetch items'` | `t('errors.fetchItemsFailed')` |
| 129 | `'Failed to delete items'` | `t('errors.deleteFailed')` |
| 162 | `'Failed to update item'` | `t('errors.updateFailed')` |
| 196 | `'Failed to duplicate item'` | `t('errors.duplicateFailed')` |

#### Acceptance Criteria
- [ ] `useTranslations` hook is imported and initialized
- [ ] Item count uses ICU pluralization correctly
- [ ] All error messages use translation keys
- [ ] Page renders correctly with correct grammar for counts (0, 1, 2+)
- [ ] No TypeScript errors

---

### Task 2D.6.4: Update RoomSelector Component (/src/components/ItemEditForm/RoomSelector.tsx)

**Estimated Effort:** 0.5 story points
**File:** `/src/components/ItemEditForm/RoomSelector.tsx`
**Dependencies:** Task 2D.6.1

#### Description
Replace hardcoded strings in the room selector dropdown with translation function calls.

#### Implementation Steps

1. Add `'use client';` directive at the top of the file (if not present)

2. Add import:
```typescript
import { useTranslations } from 'next-intl';
```

3. Add translation hook inside the component:
```typescript
const t = useTranslations('items.form');
```

4. Replace strings:

| Line | Current String | Replacement |
|------|---------------|-------------|
| 25 | `"Room"` | `{t('roomLabel')}` |
| 29 | `aria-label="Select room for this item"` | `aria-label={t('roomAriaLabel')}` |
| 35 | `"Select a room..."` | `{t('roomPlaceholder')}` |

#### Note on Room Labels
Room labels come from `ROOM_LABELS` constant. These will be translated in a separate task (workflow namespace). For now, the selector structure is prepared for future room label translation.

#### Acceptance Criteria
- [ ] Component has `'use client'` directive
- [ ] Translation hook is properly initialized
- [ ] Label, aria-label, and placeholder are translated
- [ ] Dropdown functionality unchanged

---

### Task 2D.6.5: Update ItemTypeSelector Component (/src/components/ItemEditForm/ItemTypeSelector.tsx)

**Estimated Effort:** 0.5 story points
**File:** `/src/components/ItemEditForm/ItemTypeSelector.tsx`
**Dependencies:** Task 2D.6.1

#### Description
Replace hardcoded strings in the item type selector dropdown with translation function calls.

#### Implementation Steps

1. Add `'use client';` directive at the top of the file (if not present)

2. Add import:
```typescript
import { useTranslations } from 'next-intl';
```

3. Add translation hook inside the component:
```typescript
const t = useTranslations('items.form');
```

4. Replace strings:

| Line | Current String | Replacement |
|------|---------------|-------------|
| 25 | `"Item Type"` | `{t('itemTypeLabel')}` |
| 29 | `aria-label="Select item type"` | `aria-label={t('itemTypeAriaLabel')}` |
| 35 | `"Select item type..."` | `{t('itemTypePlaceholder')}` |

#### Note on Item Type Labels
Item type labels come from `ITEM_TYPE_LABELS` constant. These will be translated in a separate task (workflow namespace).

#### Acceptance Criteria
- [ ] Component has `'use client'` directive
- [ ] Translation hook is properly initialized
- [ ] Label, aria-label, and placeholder are translated
- [ ] Dropdown functionality unchanged

---

### Task 2D.6.6: Update ItemInstructionsList Component (/src/components/ItemEditForm/ItemInstructionsList.tsx)

**Estimated Effort:** 1 story point
**File:** `/src/components/ItemEditForm/ItemInstructionsList.tsx`
**Dependencies:** Task 2D.6.1

#### Description
Replace hardcoded strings in the instructions list component with translation function calls, including the purpose badge labels.

#### Implementation Steps

1. Add `'use client';` directive at the top of the file

2. Add import:
```typescript
import { useTranslations } from 'next-intl';
```

3. Add translation hook inside the component:
```typescript
const t = useTranslations('items');
```

4. Update `formatPurposeLabel` function to use translations:

**Before:**
```typescript
function formatPurposeLabel(purpose: string): string {
  return purpose
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
```

**After:**
```typescript
// Move this inside the component to access translations
const formatPurposeLabel = (purpose: string): string => {
  const key = `purposes.${purpose}` as const;
  // Try to get translated label, fallback to formatted string
  try {
    return t(key);
  } catch {
    // Fallback for unknown purposes
    return purpose
      .replace(/_/g, ' ')
      .replace(/-/g, ' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
};
```

5. Replace strings:

| Line | Current String | Replacement |
|------|---------------|-------------|
| 62 | `"Guides"` | `{t('guides.title')}` |
| 63 | `"Content associated with this item"` | `{t('guides.description')}` |
| 83 | `"Guides"` | `{t('guides.title')}` |
| 84 | `"Content associated with this item"` | `{t('guides.description')}` |
| 87 | `"No guides yet"` | `{t('guides.emptyTitle')}` |
| 88 | `"Guides for this item will appear here"` | `{t('guides.emptyDescription')}` |
| 97 | `"Guides"` | `{t('guides.title')}` |
| 98 | `"Content associated with this item"` | `{t('guides.description')}` |
| 123 | `"Edit"` | `{t('guides.editButton')}` |

#### Acceptance Criteria
- [ ] Component has `'use client'` directive
- [ ] Translation hook is properly initialized
- [ ] All section headers, descriptions, and button text are translated
- [ ] Purpose labels use translation lookup with fallback
- [ ] Empty state renders with translated text
- [ ] Loading skeleton labels are translated

---

### Task 2D.6.7: Update TagsInlineEdit Component (/src/components/ItemManager/components/shared/TagsInlineEdit.tsx)

**Estimated Effort:** 2 story points
**File:** `/src/components/ItemManager/components/shared/TagsInlineEdit.tsx`
**Dependencies:** Task 2D.6.1

#### Description
Replace all hardcoded strings in the tags inline editor with translation function calls.

#### Implementation Steps

1. Add import at the top (component already has `'use client'`):
```typescript
import { useTranslations } from 'next-intl';
```

2. Add translation hook inside the component function (after line 100):
```typescript
const t = useTranslations('items');
```

3. Replace validation messages in `validateTag` function (lines 192-219):

**Before:**
```typescript
if (!trimmed) {
  return 'Tag cannot be empty';
}
if (trimmed.length > maxTagLength) {
  return `Tag must be ${maxTagLength} characters or less`;
}
if (isDuplicate) {
  return 'Tag already exists';
}
if (editTags.length >= maxTags) {
  return `Maximum ${maxTags} tags allowed`;
}
```

**After:**
```typescript
if (!trimmed) {
  return t('validation.tagEmpty');
}
if (trimmed.length > maxTagLength) {
  return t('validation.tagTooLong', { max: maxTagLength });
}
if (isDuplicate) {
  return t('validation.tagDuplicate');
}
if (editTags.length >= maxTags) {
  return t('validation.tagMaxCount', { max: maxTags });
}
```

4. Replace UI strings:

| Line | Current String | Replacement |
|------|---------------|-------------|
| 85 | `placeholder = 'Add tags...'` | `placeholder = t('tags.placeholder')` (default prop) |
| 309 | `'Failed to save tags'` | `t('errors.saveTagsFailed')` |
| 532 | `ariaLabel || 'Edit tags'` | `ariaLabel || t('tags.editTags')` |
| 541-542 | `+{displayTags.length - 3} more` | `{t('tags.more', { count: displayTags.length - 3 })}` |
| 548-549 | `{placeholder}` | Keep as prop, but document default should use translation |
| 583 | `"Saving..."` | `{t('tags.saving')}` |
| 602 | `ariaLabel || 'Edit tags'` | `ariaLabel || t('tags.editTags')` |
| 625 | `isAtMaxTags ? 'Max tags reached' : 'Type to add...'` | `isAtMaxTags ? t('tags.maxReached') : t('tags.typeToAdd')` |
| 648 | `aria-label="Tag suggestions"` | `aria-label={t('tags.suggestions')}` |
| 686-687 | `{editTags.length} tags selected` | `{t('tags.selected', { count: editTags.length })}` |

#### Note on Default Placeholder Prop
The `placeholder` prop has a default value. Update the component to use translation as default:

```typescript
// Change function signature
export function TagsInlineEdit({
  // ... other props
  placeholder, // Remove default here
  // ...
}: TagsInlineEditProps) {
  const t = useTranslations('items');

  // Set default after hook is available
  const displayPlaceholder = placeholder || t('tags.placeholder');
```

#### Acceptance Criteria
- [ ] Translation hook is properly initialized
- [ ] All validation error messages use translation keys with variable interpolation
- [ ] All UI strings (saving, edit tags, suggestions label) are translated
- [ ] Pluralization works correctly for "X tags selected" and "+X more"
- [ ] Component maintains all existing functionality
- [ ] Aria labels are translated for accessibility
- [ ] No TypeScript errors

---

### Task 2D.6.8: Generate Translations for Non-English Languages

**Estimated Effort:** 1 story point
**Files:** `/messages/fr.json`, `/messages/es.json`, `/messages/de.json`, `/messages/nl.json`, `/messages/it.json`
**Dependencies:** Tasks 2D.6.1-2D.6.7

#### Description
Generate translations for all new keys added in Task 2D.6.1 for the five non-English supported languages.

#### Implementation Steps

1. For each language file, add the corresponding translations for all keys in the `items` namespace.

#### French (fr.json) - Sample
```json
{
  "items": {
    "edit": {
      "title": "Modifier l'élément",
      "backToItems": "Retour aux éléments",
      "returnToItems": "Retourner aux éléments",
      "nameLabel": "Nom de l'élément",
      "namePlaceholder": "Entrez le nom de l'élément",
      "descriptionLabel": "Description",
      "descriptionPlaceholder": "Entrez la description de l'élément (facultatif)",
      "additionalTags": "Étiquettes supplémentaires",
      "additionalTagsHint": "Ajoutez des étiquettes personnalisées pour une catégorisation supplémentaire",
      "tagsPlaceholder": "Cliquez pour ajouter des étiquettes...",
      "saving": "Enregistrement...",
      "saveChanges": "Enregistrer les modifications",
      "loginRequired": "Veuillez vous connecter pour modifier les éléments.",
      "loadingItem": "Chargement de l'élément..."
    },
    "list": {
      "title": "Mes éléments",
      "itemCount": "{count, plural, =0 {Aucun élément} one {# élément} other {# éléments}} au total",
      "createNew": "Nouvel élément QR Code",
      "dismiss": "Ignorer",
      "loginRequired": "Veuillez vous connecter pour voir les éléments.",
      "loadingItems": "Chargement des éléments..."
    }
  }
}
```

#### Spanish (es.json) - Sample
```json
{
  "items": {
    "edit": {
      "title": "Editar elemento",
      "backToItems": "Volver a elementos",
      "returnToItems": "Regresar a elementos",
      "nameLabel": "Nombre del elemento",
      "namePlaceholder": "Ingrese el nombre del elemento",
      "descriptionLabel": "Descripción",
      "descriptionPlaceholder": "Ingrese la descripción del elemento (opcional)",
      "additionalTags": "Etiquetas adicionales",
      "additionalTagsHint": "Agregue etiquetas personalizadas para categorización adicional",
      "tagsPlaceholder": "Haga clic para agregar etiquetas...",
      "saving": "Guardando...",
      "saveChanges": "Guardar cambios",
      "loginRequired": "Por favor inicie sesión para editar elementos.",
      "loadingItem": "Cargando elemento..."
    },
    "list": {
      "title": "Mis elementos",
      "itemCount": "{count, plural, =0 {Sin elementos} one {# elemento} other {# elementos}} en total",
      "createNew": "Nuevo elemento QR Code",
      "dismiss": "Descartar",
      "loginRequired": "Por favor inicie sesión para ver elementos.",
      "loadingItems": "Cargando elementos..."
    }
  }
}
```

#### German (de.json) - Sample
```json
{
  "items": {
    "edit": {
      "title": "Element bearbeiten",
      "backToItems": "Zurück zu Elementen",
      "returnToItems": "Zu Elementen zurückkehren",
      "nameLabel": "Elementname",
      "namePlaceholder": "Elementname eingeben",
      "descriptionLabel": "Beschreibung",
      "descriptionPlaceholder": "Elementbeschreibung eingeben (optional)",
      "additionalTags": "Zusätzliche Tags",
      "additionalTagsHint": "Fügen Sie benutzerdefinierte Tags für zusätzliche Kategorisierung hinzu",
      "tagsPlaceholder": "Klicken Sie, um Tags hinzuzufügen...",
      "saving": "Speichern...",
      "saveChanges": "Änderungen speichern",
      "loginRequired": "Bitte melden Sie sich an, um Elemente zu bearbeiten.",
      "loadingItem": "Element wird geladen..."
    },
    "list": {
      "title": "Meine Elemente",
      "itemCount": "{count, plural, =0 {Keine Elemente} one {# Element} other {# Elemente}} insgesamt",
      "createNew": "Neues QR-Code-Element",
      "dismiss": "Schließen",
      "loginRequired": "Bitte melden Sie sich an, um Elemente anzuzeigen.",
      "loadingItems": "Elemente werden geladen..."
    }
  }
}
```

#### Dutch (nl.json) - Sample
```json
{
  "items": {
    "edit": {
      "title": "Item bewerken",
      "backToItems": "Terug naar items",
      "returnToItems": "Terug naar items",
      "nameLabel": "Itemnaam",
      "namePlaceholder": "Voer itemnaam in",
      "descriptionLabel": "Beschrijving",
      "descriptionPlaceholder": "Voer itembeschrijving in (optioneel)",
      "additionalTags": "Extra tags",
      "additionalTagsHint": "Voeg aangepaste tags toe voor extra categorisatie",
      "tagsPlaceholder": "Klik om tags toe te voegen...",
      "saving": "Opslaan...",
      "saveChanges": "Wijzigingen opslaan",
      "loginRequired": "Log in om items te bewerken.",
      "loadingItem": "Item laden..."
    },
    "list": {
      "title": "Mijn items",
      "itemCount": "{count, plural, =0 {Geen items} one {# item} other {# items}} totaal",
      "createNew": "Nieuw QR-code item",
      "dismiss": "Sluiten",
      "loginRequired": "Log in om items te bekijken.",
      "loadingItems": "Items laden..."
    }
  }
}
```

#### Italian (it.json) - Sample
```json
{
  "items": {
    "edit": {
      "title": "Modifica elemento",
      "backToItems": "Torna agli elementi",
      "returnToItems": "Ritorna agli elementi",
      "nameLabel": "Nome elemento",
      "namePlaceholder": "Inserisci il nome dell'elemento",
      "descriptionLabel": "Descrizione",
      "descriptionPlaceholder": "Inserisci la descrizione dell'elemento (opzionale)",
      "additionalTags": "Tag aggiuntivi",
      "additionalTagsHint": "Aggiungi tag personalizzati per una categorizzazione aggiuntiva",
      "tagsPlaceholder": "Clicca per aggiungere tag...",
      "saving": "Salvataggio...",
      "saveChanges": "Salva modifiche",
      "loginRequired": "Effettua l'accesso per modificare gli elementi.",
      "loadingItem": "Caricamento elemento..."
    },
    "list": {
      "title": "I miei elementi",
      "itemCount": "{count, plural, =0 {Nessun elemento} one {# elemento} other {# elementi}} in totale",
      "createNew": "Nuovo elemento QR Code",
      "dismiss": "Chiudi",
      "loginRequired": "Effettua l'accesso per visualizzare gli elementi.",
      "loadingItems": "Caricamento elementi..."
    }
  }
}
```

#### Acceptance Criteria
- [ ] All five non-English language files have complete translations for new keys
- [ ] Pluralization rules are correct for each language
- [ ] Translations maintain appropriate length (±40% of English for layout safety)
- [ ] All variable placeholders ({count}, {max}) are preserved
- [ ] JSON files are valid and properly formatted

---

### Task 2D.6.9: Testing and Verification

**Estimated Effort:** 1 story point
**Dependencies:** Tasks 2D.6.1-2D.6.8

#### Description
Verify all translations work correctly across all supported languages.

#### Testing Checklist

1. **Edit Item Page Testing**
   - [ ] Page title displays "Edit Item" in selected language
   - [ ] Back button text is translated
   - [ ] Form labels (Item Name, Description) are translated
   - [ ] Placeholders are translated
   - [ ] Cancel and Save buttons are translated
   - [ ] Saving state shows translated text
   - [ ] Error messages display in selected language
   - [ ] Login required message is translated

2. **Items List Page Testing**
   - [ ] Page title "My Items" is translated
   - [ ] Item count shows correct pluralization:
     - 0 items: "No items total" / equivalent
     - 1 item: "1 item total"
     - 5 items: "5 items total"
   - [ ] "New QR Code Item" button is translated
   - [ ] "Dismiss" error button is translated
   - [ ] Loading state is translated
   - [ ] Error messages are translated

3. **RoomSelector Testing**
   - [ ] Label "Room" is translated
   - [ ] Placeholder "Select a room..." is translated
   - [ ] Aria-label is translated (check with screen reader)

4. **ItemTypeSelector Testing**
   - [ ] Label "Item Type" is translated
   - [ ] Placeholder "Select item type..." is translated
   - [ ] Aria-label is translated (check with screen reader)

5. **ItemInstructionsList Testing**
   - [ ] "Guides" title is translated
   - [ ] Section description is translated
   - [ ] Empty state title and description are translated
   - [ ] Purpose badges show translated labels
   - [ ] "Edit" button is translated

6. **TagsInlineEdit Testing**
   - [ ] Default placeholder "Add tags..." is translated
   - [ ] "Type to add..." placeholder is translated
   - [ ] "Max tags reached" message is translated
   - [ ] Validation errors are translated:
     - Empty tag error
     - Tag too long error (with character count)
     - Duplicate tag error
     - Max tags error (with max count)
   - [ ] "Saving..." state is translated
   - [ ] "X tags selected" screen reader text uses correct pluralization
   - [ ] "+X more" badge uses correct pluralization
   - [ ] "Tag suggestions" aria-label is translated

7. **Cross-Language Testing**
   - [ ] Test all pages in French
   - [ ] Test all pages in Spanish
   - [ ] Test all pages in German
   - [ ] Test all pages in Dutch
   - [ ] Test all pages in Italian

8. **Layout Verification**
   - [ ] No text truncation with German translations (typically longest)
   - [ ] Buttons don't overflow
   - [ ] Form labels align properly
   - [ ] Error messages display without clipping

9. **Functional Verification**
   - [ ] Form submission works correctly in all languages
   - [ ] Validation behavior unchanged
   - [ ] Tag operations work correctly
   - [ ] Navigation works correctly

#### Acceptance Criteria
- [ ] All checklist items pass in all 6 languages
- [ ] No console errors related to missing translations
- [ ] No visual regressions in any language
- [ ] Form functionality preserved

---

## Implementation Order

Execute tasks in this sequence:

1. **Task 2D.6.1** - Add translation keys to en.json
2. **Tasks 2D.6.4 & 2D.6.5** - Update RoomSelector and ItemTypeSelector (parallel)
3. **Task 2D.6.6** - Update ItemInstructionsList
4. **Task 2D.6.7** - Update TagsInlineEdit
5. **Task 2D.6.2** - Update Edit Item Page
6. **Task 2D.6.3** - Update Items List Page
7. **Task 2D.6.8** - Generate non-English translations
8. **Task 2D.6.9** - Testing and verification

---

## Files Modified Summary

| File | Modification Type | Lines Changed (Est.) |
|------|------------------|---------------------|
| `/messages/en.json` | Add translation keys | +80 |
| `/messages/fr.json` | Add translations | +80 |
| `/messages/es.json` | Add translations | +80 |
| `/messages/de.json` | Add translations | +80 |
| `/messages/nl.json` | Add translations | +80 |
| `/messages/it.json` | Add translations | +80 |
| `/src/app/dashboard2/items/[publicId]/edit/page.tsx` | Add i18n | +20, ~30 modified |
| `/src/app/dashboard2/items/page.tsx` | Add i18n | +10, ~15 modified |
| `/src/components/ItemEditForm/RoomSelector.tsx` | Add i18n | +5, ~5 modified |
| `/src/components/ItemEditForm/ItemTypeSelector.tsx` | Add i18n | +5, ~5 modified |
| `/src/components/ItemEditForm/ItemInstructionsList.tsx` | Add i18n | +15, ~15 modified |
| `/src/components/ItemManager/components/shared/TagsInlineEdit.tsx` | Add i18n | +15, ~25 modified |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Missing translation keys at runtime | Use TypeScript types for translation keys where possible |
| Validation logic affected | Only change string values, preserve all validation logic |
| Layout breaks with longer translations | Test with German (typically longest), ensure min-width/truncation |
| Purpose label mapping issues | Use try-catch with fallback in formatPurposeLabel |
| Performance impact | Combine namespace calls where appropriate |

---

## Rollback Plan

If issues are discovered:

1. Revert component files to pre-translation state
2. Translation files can remain (no harm)
3. Re-deploy without i18n changes
4. Debug and fix issues
5. Re-apply changes

---

## Definition of Done

- [ ] All 8 implementation tasks completed
- [ ] All acceptance criteria met
- [ ] Testing task checklist completed
- [ ] No TypeScript errors
- [ ] No console errors for missing translations
- [ ] Build succeeds (`npm run build`)
- [ ] Code reviewed and approved
- [ ] Changes committed with proper commit message

---

## References

- [Overview Document](./REQ-390-update-item-detailedit-pages-overview.md)
- [Implementation Plan](./prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [i18n Configuration](/src/lib/i18n/config.ts)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)
