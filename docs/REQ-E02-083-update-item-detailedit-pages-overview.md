# REQ-E02-083: Update Item Detail and Edit Pages for Internationalization

**Document Type:** Implementation Breakdown (Overview)
**Request ID:** REQ-E02-083
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2D - Item Management
**Task Reference:** 2D.6
**Priority:** High
**Size:** M (Medium)

**Created:** 2026-01-20
**Last Modified:** 2026-01-20

---

## 1. Summary

This document provides the implementation breakdown for adding internationalization support to the item detail/edit pages in the FAQBNB application. The implementation focuses on the Edit Item page (`/dashboard2/items/[publicId]/edit`) and its supporting components (RoomSelector, ItemTypeSelector, ItemInstructionsList, TagsInlineEdit). All hardcoded UI strings must be replaced with translated strings using next-intl, ensuring users can view and edit item details in French, Spanish, German, Italian, and Dutch interfaces.

---

## 2. Requirements Analysis

### 2.1 Source Request Overview

**From:** `/docs/gen_requests_epic2.md` - Request #83

The item detail and edit pages must be updated to:
1. Display localized field labels (Item Name, Description, Room, Item Type, Additional Tags)
2. Translate page titles, section headings, and navigation elements
3. Provide translated button labels (Save Changes, Cancel, Back to Items, Edit)
4. Translate placeholder text and helper messages
5. Translate form validation error messages
6. Translate empty state and loading messages
7. Translate breadcrumb and navigation text
8. Support language switching without page reload
9. Update all accessibility attributes (aria-labels) to reflect the current language

### 2.2 Current Behavior

**Edit Item Page** (`src/app/dashboard2/items/[publicId]/edit/page.tsx`):
- Hardcoded page title (line 221): `"Edit Item"`
- Hardcoded back button (lines 218-219): `"Back to Items"`
- Hardcoded loading message (line 188): `"Loading item..."`
- Hardcoded login prompt (line 178): `"Please log in to edit items."`
- Hardcoded error return link (lines 202-204): `"Return to Items"`
- Hardcoded field labels (lines 236-237, 252-253, 282-283): `"Item Name"`, `"Description"`, `"Additional Tags"`
- Hardcoded placeholders (lines 247-248, 263-264, 293): `"Enter item name"`, `"Enter item description (optional)"`, `"Click to add tags..."`
- Hardcoded helper text (lines 286-288): `"Add custom tags for additional categorization"`
- Hardcoded buttons (lines 315-316, 327-332): `"Cancel"`, `"Save Changes"`, `"Saving..."`

**RoomSelector** (`src/components/ItemEditForm/RoomSelector.tsx`):
- Hardcoded label (lines 24-25): `"Room"`
- Hardcoded aria-label (line 29): `"Select room for this item"`
- Hardcoded placeholder option (line 35): `"Select a room..."`
- Room type labels from constants (ROOM_LABELS) - need translation

**ItemTypeSelector** (`src/components/ItemEditForm/ItemTypeSelector.tsx`):
- Hardcoded label (lines 24-25): `"Item Type"`
- Hardcoded aria-label (line 29): `"Select item type"`
- Hardcoded placeholder option (line 35): `"Select item type..."`
- Item type labels from constants (ITEM_TYPE_LABELS) - need translation

**ItemInstructionsList** (`src/components/ItemEditForm/ItemInstructionsList.tsx`):
- Hardcoded section title (lines 62, 83, 97): `"Guides"`
- Hardcoded section description (lines 63, 84, 98): `"Content associated with this item"`
- Hardcoded empty state (lines 87-88): `"No guides yet"`, `"Guides for this item will appear here"`
- Hardcoded edit button (line 123): `"Edit"`
- Purpose labels from formatPurposeLabel function - need translation

**TagsInlineEdit** (`src/components/ItemManager/components/shared/TagsInlineEdit.tsx`):
- Hardcoded default placeholder (line 85): `"Add tags..."`
- Hardcoded validation messages (lines 197, 201, 210, 215):
  - `"Tag cannot be empty"`
  - `"Tag must be ${maxTagLength} characters or less"`
  - `"Tag already exists"`
  - `"Maximum ${maxTags} tags allowed"`
- Hardcoded display text (lines 541-543): `"+${displayTags.length - 3} more"`
- Hardcoded saving text (lines 582-583): `"Saving..."`
- Hardcoded aria-labels (lines 532, 585-586, 602, 629, 648, 685-688)
- Hardcoded input placeholder (line 625): `"Max tags reached"`, `"Type to add..."`

### 2.3 Expected Behavior

After implementation:
1. All field labels use translation hooks (`useTranslations('items.edit')`)
2. Page title, navigation, and breadcrumbs display in the selected language
3. All button labels (Save, Cancel, Back, Edit) display translated text
4. Empty state and loading messages display in the selected language
5. Form validation error messages appear translated
6. All aria-labels reflect the selected language for accessibility
7. Components respond to locale context changes without page reload
8. Room and item type dropdowns show translated labels

---

## 3. Technical Approach

### 3.1 Architecture Pattern

Following the established Epic 2 pattern for client components:

```typescript
// Pattern for item edit components
'use client';
import { useTranslations } from 'next-intl';

function EditItemPage() {
  const t = useTranslations('items.edit');
  return <h1>{t('pageTitle')}</h1>;
}
```

### 3.2 Translation Namespace

All translations will be added to the `items` namespace in `/messages/*.json` under a new `edit` sub-namespace:

```json
{
  "items": {
    "edit": {
      "pageTitle": "Edit Item",
      "backToItems": "Back to Items",
      "loading": "Loading item...",
      "loginRequired": "Please log in to edit items.",
      "returnToItems": "Return to Items",
      "form": {
        "nameLabel": "Item Name",
        "namePlaceholder": "Enter item name",
        "descriptionLabel": "Description",
        "descriptionPlaceholder": "Enter item description (optional)",
        "roomLabel": "Room",
        "roomPlaceholder": "Select a room...",
        "roomAriaLabel": "Select room for this item",
        "itemTypeLabel": "Item Type",
        "itemTypePlaceholder": "Select item type...",
        "itemTypeAriaLabel": "Select item type",
        "tagsLabel": "Additional Tags",
        "tagsHelper": "Add custom tags for additional categorization",
        "tagsPlaceholder": "Click to add tags..."
      },
      "buttons": {
        "cancel": "Cancel",
        "save": "Save Changes",
        "saving": "Saving..."
      },
      "guides": {
        "title": "Guides",
        "description": "Content associated with this item",
        "empty": "No guides yet",
        "emptyDescription": "Guides for this item will appear here",
        "edit": "Edit"
      },
      "purposes": {
        "howToUse": "How To Use",
        "troubleshooting": "Troubleshooting",
        "howToClean": "How To Clean",
        "safetyInfo": "Safety Info",
        "maintenance": "Maintenance",
        "features": "Features",
        "other": "Other"
      },
      "rooms": {
        "kitchen": "Kitchen",
        "bathroom": "Bathroom",
        "bedroom": "Bedroom",
        "livingRoom": "Living Room",
        "laundry": "Laundry",
        "garage": "Garage",
        "outdoor": "Outdoor",
        "office": "Office",
        "gym": "Gym",
        "pool": "Pool",
        "other": "Other"
      },
      "itemTypes": {
        "appliance": "Appliance",
        "roomItem": "Room Item",
        "generalInfo": "General Info"
      },
      "tags": {
        "addTags": "Add tags...",
        "typeToAdd": "Type to add...",
        "maxReached": "Max tags reached",
        "saving": "Saving...",
        "editTags": "Edit tags",
        "tagsSelected": "{count} tags selected",
        "savingTags": "Saving tags...",
        "moreCount": "+{count} more",
        "suggestions": "Tag suggestions",
        "validation": {
          "empty": "Tag cannot be empty",
          "tooLong": "Tag must be {max} characters or less",
          "duplicate": "Tag already exists",
          "maxTags": "Maximum {max} tags allowed"
        }
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

**Description:** Add new translation keys for item edit pages to all 6 language files.

**Files to Modify:**
- `/messages/en.json`
- `/messages/fr.json`
- `/messages/es.json`
- `/messages/de.json`
- `/messages/nl.json`
- `/messages/it.json`

**Acceptance Criteria:**
- [ ] Add `items.edit.*` keys for all edit page strings
- [ ] Add `items.edit.form.*` keys for form labels and placeholders
- [ ] Add `items.edit.buttons.*` keys for button labels
- [ ] Add `items.edit.guides.*` keys for guides section
- [ ] Add `items.edit.purposes.*` keys for purpose type labels
- [ ] Add `items.edit.rooms.*` keys for room type labels
- [ ] Add `items.edit.itemTypes.*` keys for item type labels
- [ ] Add `items.edit.tags.*` keys for tags component strings
- [ ] All 6 language files contain identical key structure

---

### Task 2: Update Edit Item Page for i18n (Priority: High)

**Description:** Add translation hook and replace all hardcoded strings in the main edit page.

**File to Modify:** `src/app/dashboard2/items/[publicId]/edit/page.tsx`

**Current Code (various lines):**
```typescript
// Page title
<h1 className="text-2xl font-bold text-gray-900">Edit Item</h1>
// Back button
<ArrowLeft className="w-4 h-4" />
Back to Items
// Loading state
<p className="text-gray-600">Loading item...</p>
// Login required
<p className="text-gray-600">Please log in to edit items.</p>
// Form labels
<label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
  Item Name
</label>
// Placeholders
placeholder="Enter item name"
placeholder="Enter item description (optional)"
// Helper text
<p className="text-xs text-gray-500 mb-2">
  Add custom tags for additional categorization
</p>
// Buttons
<button ...>Cancel</button>
<button ...>
  {saving ? (
    <><Loader2 className="w-4 h-4 animate-spin" />Saving...</>
  ) : (
    <><Save className="w-4 h-4" />Save Changes</>
  )}
</button>
```

**Target Approach:**
```typescript
import { useTranslations } from 'next-intl';

export default function EditItemPage() {
  const t = useTranslations('items.edit');

  // ... existing logic

  if (!user) {
    return <p className="text-gray-600">{t('loginRequired')}</p>;
  }

  if (loading) {
    return <p className="text-gray-600">{t('loading')}</p>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <button onClick={() => router.push('/dashboard2/items')}>
          <ArrowLeft className="w-4 h-4" />
          {t('backToItems')}
        </button>
        <h1 className="text-2xl font-bold text-gray-900">{t('pageTitle')}</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <label htmlFor="name">{t('form.nameLabel')}</label>
        <input placeholder={t('form.namePlaceholder')} ... />

        <label htmlFor="description">{t('form.descriptionLabel')}</label>
        <textarea placeholder={t('form.descriptionPlaceholder')} ... />

        <label>{t('form.tagsLabel')}</label>
        <p>{t('form.tagsHelper')}</p>
        <TagsInlineEdit placeholder={t('form.tagsPlaceholder')} ... />

        <button type="button">{t('buttons.cancel')}</button>
        <button type="submit">
          {saving ? t('buttons.saving') : t('buttons.save')}
        </button>
      </form>
    </div>
  );
}
```

**Acceptance Criteria:**
- [ ] Import `useTranslations` from `next-intl`
- [ ] Initialize translation hook with `items.edit` namespace
- [ ] Replace page title with translation
- [ ] Replace back button text with translation
- [ ] Replace loading message with translation
- [ ] Replace login required message with translation
- [ ] Replace error return link with translation
- [ ] Replace all form labels with translations
- [ ] Replace all placeholders with translations
- [ ] Replace helper text with translation
- [ ] Replace button labels with translations
- [ ] TypeScript compiles without errors

---

### Task 3: Update RoomSelector component for i18n (Priority: High)

**Description:** Add translation hook and replace hardcoded strings, including room type labels.

**File to Modify:** `src/components/ItemEditForm/RoomSelector.tsx`

**Current Code:**
```typescript
<label htmlFor="room-selector" className="...">
  Room
</label>
<select
  aria-label="Select room for this item"
  ...
>
  <option value="">Select a room...</option>
  {ROOM_TYPES.map((roomType) => (
    <option key={roomType} value={roomType}>
      {ROOM_LABELS[roomType]}
    </option>
  ))}
</select>
```

**Target Approach:**
```typescript
import { useTranslations } from 'next-intl';
import { ROOM_TYPES } from '@/components/ItemCreationWorkflow/utils/constants';

export function RoomSelector({ value, onChange, disabled = false }: RoomSelectorProps) {
  const t = useTranslations('items.edit');

  // Map room types to translation keys
  const getRoomLabel = (roomType: string): string => {
    const keyMap: Record<string, string> = {
      kitchen: 'rooms.kitchen',
      bathroom: 'rooms.bathroom',
      bedroom: 'rooms.bedroom',
      'living-room': 'rooms.livingRoom',
      laundry: 'rooms.laundry',
      garage: 'rooms.garage',
      outdoor: 'rooms.outdoor',
      office: 'rooms.office',
      gym: 'rooms.gym',
      pool: 'rooms.pool',
      other: 'rooms.other',
    };
    return t(keyMap[roomType] || 'rooms.other');
  };

  return (
    <div>
      <label htmlFor="room-selector">{t('form.roomLabel')}</label>
      <select
        aria-label={t('form.roomAriaLabel')}
        ...
      >
        <option value="">{t('form.roomPlaceholder')}</option>
        {ROOM_TYPES.map((roomType) => (
          <option key={roomType} value={roomType}>
            {getRoomLabel(roomType)}
          </option>
        ))}
      </select>
    </div>
  );
}
```

**Acceptance Criteria:**
- [ ] Import `useTranslations` from `next-intl`
- [ ] Initialize translation hook with `items.edit` namespace
- [ ] Replace "Room" label with translation
- [ ] Replace aria-label with translation
- [ ] Replace "Select a room..." placeholder with translation
- [ ] Replace room type labels with translated versions
- [ ] TypeScript compiles without errors

---

### Task 4: Update ItemTypeSelector component for i18n (Priority: High)

**Description:** Add translation hook and replace hardcoded strings, including item type labels.

**File to Modify:** `src/components/ItemEditForm/ItemTypeSelector.tsx`

**Current Code:**
```typescript
<label htmlFor="item-type-selector" className="...">
  Item Type
</label>
<select
  aria-label="Select item type"
  ...
>
  <option value="">Select item type...</option>
  {ITEM_TYPES.map((itemType) => (
    <option key={itemType} value={itemType}>
      {ITEM_TYPE_LABELS[itemType]}
    </option>
  ))}
</select>
```

**Target Approach:**
```typescript
import { useTranslations } from 'next-intl';

export function ItemTypeSelector({ value, onChange, disabled = false }: ItemTypeSelectorProps) {
  const t = useTranslations('items.edit');

  const getItemTypeLabel = (itemType: string): string => {
    const keyMap: Record<string, string> = {
      appliance: 'itemTypes.appliance',
      'room-item': 'itemTypes.roomItem',
      'general-info': 'itemTypes.generalInfo',
    };
    return t(keyMap[itemType] || 'itemTypes.appliance');
  };

  return (
    <div>
      <label htmlFor="item-type-selector">{t('form.itemTypeLabel')}</label>
      <select
        aria-label={t('form.itemTypeAriaLabel')}
        ...
      >
        <option value="">{t('form.itemTypePlaceholder')}</option>
        {ITEM_TYPES.map((itemType) => (
          <option key={itemType} value={itemType}>
            {getItemTypeLabel(itemType)}
          </option>
        ))}
      </select>
    </div>
  );
}
```

**Acceptance Criteria:**
- [ ] Import `useTranslations` from `next-intl`
- [ ] Initialize translation hook with `items.edit` namespace
- [ ] Replace "Item Type" label with translation
- [ ] Replace aria-label with translation
- [ ] Replace "Select item type..." placeholder with translation
- [ ] Replace item type labels with translated versions
- [ ] TypeScript compiles without errors

---

### Task 5: Update ItemInstructionsList component for i18n (Priority: High)

**Description:** Add translation hook and replace hardcoded strings including purpose labels.

**File to Modify:** `src/components/ItemEditForm/ItemInstructionsList.tsx`

**Current Code:**
```typescript
<h3 className="...">Guides</h3>
<p className="...">Content associated with this item</p>
// Empty state
<p className="...">No guides yet</p>
<p className="...">Guides for this item will appear here</p>
// Purpose labels
function formatPurposeLabel(purpose: string): string {
  return purpose
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
// Edit button
<span>Edit</span>
```

**Target Approach:**
```typescript
import { useTranslations } from 'next-intl';

export function ItemInstructionsList({ ... }: ItemInstructionsListProps) {
  const t = useTranslations('items.edit');

  const getPurposeLabel = (purpose: string): string => {
    const keyMap: Record<string, string> = {
      'how_to_use': 'purposes.howToUse',
      'how-to-use': 'purposes.howToUse',
      'troubleshooting': 'purposes.troubleshooting',
      'how_to_clean': 'purposes.howToClean',
      'how-to-clean': 'purposes.howToClean',
      'safety_info': 'purposes.safetyInfo',
      'safety-info': 'purposes.safetyInfo',
      'maintenance': 'purposes.maintenance',
      'features': 'purposes.features',
    };
    return t(keyMap[purpose] || 'purposes.other');
  };

  // Empty state
  if (articles.length === 0) {
    return (
      <div>
        <h3>{t('guides.title')}</h3>
        <p>{t('guides.description')}</p>
        <p>{t('guides.empty')}</p>
        <p>{t('guides.emptyDescription')}</p>
      </div>
    );
  }

  return (
    <div>
      <h3>{t('guides.title')}</h3>
      <p>{t('guides.description')}</p>
      {articles.map((article) => (
        <li key={article.id}>
          <span>{article.title}</span>
          <span>{getPurposeLabel(article.purpose)}</span>
          <button>
            <span>{t('guides.edit')}</span>
          </button>
        </li>
      ))}
    </div>
  );
}
```

**Acceptance Criteria:**
- [ ] Import `useTranslations` from `next-intl`
- [ ] Initialize translation hook with `items.edit` namespace
- [ ] Replace "Guides" section title with translation
- [ ] Replace section description with translation
- [ ] Replace empty state messages with translations
- [ ] Replace purpose labels with translated versions
- [ ] Replace "Edit" button text with translation
- [ ] TypeScript compiles without errors

---

### Task 6: Update TagsInlineEdit component for i18n (Priority: High)

**Description:** Add translation hook and replace all hardcoded strings including validation messages.

**File to Modify:** `src/components/ItemManager/components/shared/TagsInlineEdit.tsx`

**Current Code (various lines):**
```typescript
// Default placeholder
placeholder = 'Add tags...',
// Validation messages
return 'Tag cannot be empty';
return `Tag must be ${maxTagLength} characters or less`;
return 'Tag already exists';
return `Maximum ${maxTags} tags allowed`;
// Display text
+{displayTags.length - 3} more
// Saving text
<span className="text-xs">Saving...</span>
// Aria labels
aria-label={ariaLabel || 'Edit tags'}
aria-label="Add new tag"
aria-label="Tag suggestions"
// Live region
{editTags.length} tags selected
Saving tags...
// Input placeholders
placeholder={isAtMaxTags ? 'Max tags reached' : 'Type to add...'}
```

**Target Approach:**
```typescript
import { useTranslations } from 'next-intl';

export function TagsInlineEdit({ ... }: TagsInlineEditProps) {
  const t = useTranslations('items.edit.tags');

  // Validation with translations
  const validateTag = useCallback((tag: string): string | null => {
    const trimmed = tag.trim();
    if (!trimmed) return t('validation.empty');
    if (trimmed.length > maxTagLength) return t('validation.tooLong', { max: maxTagLength });
    if (isDuplicate) return t('validation.duplicate');
    if (editTags.length >= maxTags) return t('validation.maxTags', { max: maxTags });
    return null;
  }, [editTags, maxTagLength, maxTags, t]);

  // Display mode
  if (status === 'display') {
    return (
      <button aria-label={ariaLabel || t('editTags')}>
        {displayTags.length > 3 && (
          <span>{t('moreCount', { count: displayTags.length - 3 })}</span>
        )}
        <span>{placeholder || t('addTags')}</span>
      </button>
    );
  }

  // Saving mode
  if (status === 'saving') {
    return (
      <span>{t('saving')}</span>
      <span className="sr-only">{t('savingTags')}</span>
    );
  }

  // Editing mode
  return (
    <div aria-label={ariaLabel || t('editTags')}>
      <input
        placeholder={isAtMaxTags ? t('maxReached') : t('typeToAdd')}
        aria-label={t('addTags')}
      />
      <ul aria-label={t('suggestions')}>...</ul>
      <span className="sr-only">{t('tagsSelected', { count: editTags.length })}</span>
    </div>
  );
}
```

**Acceptance Criteria:**
- [ ] Import `useTranslations` from `next-intl`
- [ ] Initialize translation hook with `items.edit.tags` namespace
- [ ] Replace default placeholder with translation
- [ ] Replace all validation error messages with translations
- [ ] Replace "+X more" text with translation using count interpolation
- [ ] Replace "Saving..." text with translation
- [ ] Replace aria-labels with translations
- [ ] Replace input placeholders with translations
- [ ] Replace live region text with translations
- [ ] TypeScript compiles without errors

---

### Task 7: Update Items List Page for i18n (Priority: Medium)

**Description:** Add translation hook and replace hardcoded strings in the items list page.

**File to Modify:** `src/app/dashboard2/items/page.tsx`

**Current Code:**
```typescript
<h1 className="text-2xl font-bold text-gray-900">My Items</h1>
<p className="text-gray-600 mt-1">
  {items.length} {items.length === 1 ? 'item' : 'items'} total
</p>
<button ...>
  <PlusCircle className="w-4 h-4 mr-2" />
  New QR Code Item
</button>
<p className="text-gray-600">Please log in to view items.</p>
<p className="text-gray-600">Loading items...</p>
<button onClick={() => setError(null)} className="...">Dismiss</button>
```

**Target Approach:**
```typescript
import { useTranslations } from 'next-intl';

export default function ItemsPage() {
  const t = useTranslations('items.list');

  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('count', { count: items.length })}</p>
      <button>
        <PlusCircle ... />
        {t('createNew')}
      </button>
      ...
    </div>
  );
}
```

**Acceptance Criteria:**
- [ ] Import `useTranslations` from `next-intl`
- [ ] Initialize translation hook with `items.list` namespace
- [ ] Replace page title with translation
- [ ] Replace item count with pluralized translation
- [ ] Replace "New QR Code Item" button with translation
- [ ] Replace login required message with translation
- [ ] Replace loading message with translation
- [ ] Replace "Dismiss" button with translation
- [ ] TypeScript compiles without errors

---

### Task 8: Testing and verification (Priority: High)

**Description:** Verify all translations work correctly across languages and all functionality is preserved.

**Test Scenarios:**

1. **Edit Item Page tests in each of the 6 languages:**
   - Navigate to edit page, verify page title is translated
   - Verify "Back to Items" button is translated
   - Verify all form labels are translated
   - Verify all placeholders are translated
   - Verify helper text is translated
   - Verify Save and Cancel buttons are translated
   - Verify "Saving..." state is translated

2. **RoomSelector tests in each language:**
   - Open dropdown, verify "Select a room..." is translated
   - Verify all room type options are translated
   - Verify aria-label is translated

3. **ItemTypeSelector tests in each language:**
   - Open dropdown, verify "Select item type..." is translated
   - Verify all item type options are translated
   - Verify aria-label is translated

4. **ItemInstructionsList tests in each language:**
   - Verify "Guides" section title is translated
   - Verify description text is translated
   - Verify empty state messages are translated
   - Verify purpose badges are translated
   - Verify "Edit" button is translated

5. **TagsInlineEdit tests in each language:**
   - Verify placeholder text is translated
   - Add invalid tag, verify error message is translated
   - Verify "Saving..." state is translated
   - Verify "+X more" text is translated
   - Verify all aria-labels are translated

6. **Items List Page tests in each language:**
   - Verify page title is translated
   - Verify item count uses correct plural form
   - Verify "New QR Code Item" button is translated
   - Verify loading state is translated

7. **General tests:**
   - Verify language switching updates all text without page reload
   - Verify no console warnings about missing translation keys
   - Verify all accessibility attributes are in selected language
   - Verify existing edit functionality still works

**Acceptance Criteria:**
- [ ] All 6 languages display correctly on all pages
- [ ] No missing translation warnings in console
- [ ] Language switching updates UI without reload
- [ ] TypeScript compiles without errors
- [ ] Existing edit functionality preserved
- [ ] Pluralization works correctly for item counts
- [ ] Screen reader announces correctly in all languages

---

## 5. Authorized Files and Functions for Modification

### 5.1 Primary Files

| File | Functions/Sections | Modification Type |
|------|-------------------|-------------------|
| `src/app/dashboard2/items/[publicId]/edit/page.tsx` | `EditItemPage` function | Add import, add hook, replace strings |
| `src/app/dashboard2/items/page.tsx` | `ItemsPage` function | Add import, add hook, replace strings |
| `src/components/ItemEditForm/RoomSelector.tsx` | `RoomSelector` function | Add import, add hook, replace strings |
| `src/components/ItemEditForm/ItemTypeSelector.tsx` | `ItemTypeSelector` function | Add import, add hook, replace strings |
| `src/components/ItemEditForm/ItemInstructionsList.tsx` | `ItemInstructionsList` function, `formatPurposeLabel` | Add import, add hook, replace strings |
| `src/components/ItemManager/components/shared/TagsInlineEdit.tsx` | `TagsInlineEdit` function, `validateTag` callback | Add import, add hook, replace strings |
| `/messages/en.json` | `items.edit` namespace | Add new translation keys |
| `/messages/fr.json` | `items.edit` namespace | Add new translation keys |
| `/messages/es.json` | `items.edit` namespace | Add new translation keys |
| `/messages/de.json` | `items.edit` namespace | Add new translation keys |
| `/messages/nl.json` | `items.edit` namespace | Add new translation keys |
| `/messages/it.json` | `items.edit` namespace | Add new translation keys |

### 5.2 Functions to Modify

**EditItemPage (`page.tsx`):**
- `EditItemPage` function component - add useTranslations hook, replace all hardcoded strings
- Lines to modify: 178, 188, 202-204, 218-221, 236-237, 247-248, 252-253, 263-264, 282-288, 293, 315-316, 327-332

**ItemsPage (`page.tsx`):**
- `ItemsPage` function component - add useTranslations hook, replace strings
- Lines to modify: 204-205, 214-215, 226-228, 233-237, 243-245

**RoomSelector.tsx:**
- `RoomSelector` function component - add useTranslations hook
- Lines to modify: 24-25, 29, 35, 37-39

**ItemTypeSelector.tsx:**
- `ItemTypeSelector` function component - add useTranslations hook
- Lines to modify: 24-25, 29, 35, 37-39

**ItemInstructionsList.tsx:**
- `ItemInstructionsList` function component - add useTranslations hook
- `formatPurposeLabel` helper - replace with translation function
- Lines to modify: 42-50, 62-63, 83-84, 87-88, 97-98, 111-116, 123

**TagsInlineEdit.tsx:**
- `TagsInlineEdit` function component - add useTranslations hook
- `validateTag` callback - replace error strings with translations
- Lines to modify: 85, 197, 201, 210, 215, 532, 541-543, 582-583, 585-586, 602, 625, 629, 648, 685-688

### 5.3 Read-Only Reference Files

| File | Purpose |
|------|---------|
| `src/components/ItemCreationWorkflow/utils/constants.ts` | Room and item type constants reference |
| `src/components/ItemEditForm/ItemEditForm.types.ts` | Type definitions reference |
| `src/contexts/LocaleContext.tsx` | Locale context pattern reference |
| `src/lib/i18n/config.ts` | i18n configuration reference |
| `docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md` | Implementation plan reference |
| `docs/REQ-E02-082-update-bulk-action-dialogs-overview.md` | Pattern reference for similar components |

---

## 6. Translation Strings Required

### 6.1 English (en.json) - New Keys

```json
{
  "items": {
    "edit": {
      "pageTitle": "Edit Item",
      "backToItems": "Back to Items",
      "loading": "Loading item...",
      "loginRequired": "Please log in to edit items.",
      "returnToItems": "Return to Items",
      "form": {
        "nameLabel": "Item Name",
        "namePlaceholder": "Enter item name",
        "descriptionLabel": "Description",
        "descriptionPlaceholder": "Enter item description (optional)",
        "roomLabel": "Room",
        "roomPlaceholder": "Select a room...",
        "roomAriaLabel": "Select room for this item",
        "itemTypeLabel": "Item Type",
        "itemTypePlaceholder": "Select item type...",
        "itemTypeAriaLabel": "Select item type",
        "tagsLabel": "Additional Tags",
        "tagsHelper": "Add custom tags for additional categorization",
        "tagsPlaceholder": "Click to add tags..."
      },
      "buttons": {
        "cancel": "Cancel",
        "save": "Save Changes",
        "saving": "Saving..."
      },
      "guides": {
        "title": "Guides",
        "description": "Content associated with this item",
        "empty": "No guides yet",
        "emptyDescription": "Guides for this item will appear here",
        "edit": "Edit"
      },
      "purposes": {
        "howToUse": "How To Use",
        "troubleshooting": "Troubleshooting",
        "howToClean": "How To Clean",
        "safetyInfo": "Safety Info",
        "maintenance": "Maintenance",
        "features": "Features",
        "other": "Other"
      },
      "rooms": {
        "kitchen": "Kitchen",
        "bathroom": "Bathroom",
        "bedroom": "Bedroom",
        "livingRoom": "Living Room",
        "laundry": "Laundry",
        "garage": "Garage",
        "outdoor": "Outdoor",
        "office": "Office",
        "gym": "Gym",
        "pool": "Pool",
        "other": "Other"
      },
      "itemTypes": {
        "appliance": "Appliance",
        "roomItem": "Room Item",
        "generalInfo": "General Info"
      },
      "tags": {
        "addTags": "Add tags...",
        "typeToAdd": "Type to add...",
        "maxReached": "Max tags reached",
        "saving": "Saving...",
        "editTags": "Edit tags",
        "tagsSelected": "{count} tags selected",
        "savingTags": "Saving tags...",
        "moreCount": "+{count} more",
        "suggestions": "Tag suggestions",
        "addNewTag": "Add new tag",
        "validation": {
          "empty": "Tag cannot be empty",
          "tooLong": "Tag must be {max} characters or less",
          "duplicate": "Tag already exists",
          "maxTags": "Maximum {max} tags allowed"
        }
      }
    },
    "list": {
      "title": "My Items",
      "count": "{count, plural, one {# item} other {# items}} total",
      "createNew": "New QR Code Item",
      "loginRequired": "Please log in to view items.",
      "loading": "Loading items...",
      "dismiss": "Dismiss"
    }
  }
}
```

### 6.2 French (fr.json) - Translations

```json
{
  "items": {
    "edit": {
      "pageTitle": "Modifier l'article",
      "backToItems": "Retour aux articles",
      "loading": "Chargement de l'article...",
      "loginRequired": "Veuillez vous connecter pour modifier les articles.",
      "returnToItems": "Retour aux articles",
      "form": {
        "nameLabel": "Nom de l'article",
        "namePlaceholder": "Entrez le nom de l'article",
        "descriptionLabel": "Description",
        "descriptionPlaceholder": "Entrez la description de l'article (optionnel)",
        "roomLabel": "Piece",
        "roomPlaceholder": "Selectionner une piece...",
        "roomAriaLabel": "Selectionner la piece pour cet article",
        "itemTypeLabel": "Type d'article",
        "itemTypePlaceholder": "Selectionner le type d'article...",
        "itemTypeAriaLabel": "Selectionner le type d'article",
        "tagsLabel": "Tags supplementaires",
        "tagsHelper": "Ajouter des tags personnalises pour une categorisation supplementaire",
        "tagsPlaceholder": "Cliquez pour ajouter des tags..."
      },
      "buttons": {
        "cancel": "Annuler",
        "save": "Enregistrer les modifications",
        "saving": "Enregistrement..."
      },
      "guides": {
        "title": "Guides",
        "description": "Contenu associe a cet article",
        "empty": "Pas encore de guides",
        "emptyDescription": "Les guides pour cet article apparaitront ici",
        "edit": "Modifier"
      },
      "purposes": {
        "howToUse": "Comment utiliser",
        "troubleshooting": "Depannage",
        "howToClean": "Comment nettoyer",
        "safetyInfo": "Informations de securite",
        "maintenance": "Entretien",
        "features": "Fonctionnalites",
        "other": "Autre"
      },
      "rooms": {
        "kitchen": "Cuisine",
        "bathroom": "Salle de bain",
        "bedroom": "Chambre",
        "livingRoom": "Salon",
        "laundry": "Buanderie",
        "garage": "Garage",
        "outdoor": "Exterieur",
        "office": "Bureau",
        "gym": "Salle de sport",
        "pool": "Piscine",
        "other": "Autre"
      },
      "itemTypes": {
        "appliance": "Appareil",
        "roomItem": "Article de piece",
        "generalInfo": "Informations generales"
      },
      "tags": {
        "addTags": "Ajouter des tags...",
        "typeToAdd": "Tapez pour ajouter...",
        "maxReached": "Nombre max de tags atteint",
        "saving": "Enregistrement...",
        "editTags": "Modifier les tags",
        "tagsSelected": "{count} tags selectionnes",
        "savingTags": "Enregistrement des tags...",
        "moreCount": "+{count} de plus",
        "suggestions": "Suggestions de tags",
        "addNewTag": "Ajouter un nouveau tag",
        "validation": {
          "empty": "Le tag ne peut pas etre vide",
          "tooLong": "Le tag doit faire {max} caracteres ou moins",
          "duplicate": "Le tag existe deja",
          "maxTags": "Maximum {max} tags autorises"
        }
      }
    },
    "list": {
      "title": "Mes articles",
      "count": "{count, plural, one {# article} other {# articles}} au total",
      "createNew": "Nouvel article QR Code",
      "loginRequired": "Veuillez vous connecter pour voir les articles.",
      "loading": "Chargement des articles...",
      "dismiss": "Ignorer"
    }
  }
}
```

### 6.3 Spanish (es.json) - Translations

```json
{
  "items": {
    "edit": {
      "pageTitle": "Editar articulo",
      "backToItems": "Volver a articulos",
      "loading": "Cargando articulo...",
      "loginRequired": "Por favor inicie sesion para editar articulos.",
      "returnToItems": "Volver a articulos",
      "form": {
        "nameLabel": "Nombre del articulo",
        "namePlaceholder": "Ingrese el nombre del articulo",
        "descriptionLabel": "Descripcion",
        "descriptionPlaceholder": "Ingrese la descripcion del articulo (opcional)",
        "roomLabel": "Habitacion",
        "roomPlaceholder": "Seleccionar una habitacion...",
        "roomAriaLabel": "Seleccionar habitacion para este articulo",
        "itemTypeLabel": "Tipo de articulo",
        "itemTypePlaceholder": "Seleccionar tipo de articulo...",
        "itemTypeAriaLabel": "Seleccionar tipo de articulo",
        "tagsLabel": "Etiquetas adicionales",
        "tagsHelper": "Agregar etiquetas personalizadas para categorizacion adicional",
        "tagsPlaceholder": "Haga clic para agregar etiquetas..."
      },
      "buttons": {
        "cancel": "Cancelar",
        "save": "Guardar cambios",
        "saving": "Guardando..."
      },
      "guides": {
        "title": "Guias",
        "description": "Contenido asociado a este articulo",
        "empty": "Sin guias todavia",
        "emptyDescription": "Las guias para este articulo apareceran aqui",
        "edit": "Editar"
      },
      "purposes": {
        "howToUse": "Como usar",
        "troubleshooting": "Solucion de problemas",
        "howToClean": "Como limpiar",
        "safetyInfo": "Informacion de seguridad",
        "maintenance": "Mantenimiento",
        "features": "Caracteristicas",
        "other": "Otro"
      },
      "rooms": {
        "kitchen": "Cocina",
        "bathroom": "Bano",
        "bedroom": "Dormitorio",
        "livingRoom": "Sala de estar",
        "laundry": "Lavanderia",
        "garage": "Garaje",
        "outdoor": "Exterior",
        "office": "Oficina",
        "gym": "Gimnasio",
        "pool": "Piscina",
        "other": "Otro"
      },
      "itemTypes": {
        "appliance": "Electrodomestico",
        "roomItem": "Articulo de habitacion",
        "generalInfo": "Informacion general"
      },
      "tags": {
        "addTags": "Agregar etiquetas...",
        "typeToAdd": "Escriba para agregar...",
        "maxReached": "Maximo de etiquetas alcanzado",
        "saving": "Guardando...",
        "editTags": "Editar etiquetas",
        "tagsSelected": "{count} etiquetas seleccionadas",
        "savingTags": "Guardando etiquetas...",
        "moreCount": "+{count} mas",
        "suggestions": "Sugerencias de etiquetas",
        "addNewTag": "Agregar nueva etiqueta",
        "validation": {
          "empty": "La etiqueta no puede estar vacia",
          "tooLong": "La etiqueta debe tener {max} caracteres o menos",
          "duplicate": "La etiqueta ya existe",
          "maxTags": "Maximo {max} etiquetas permitidas"
        }
      }
    },
    "list": {
      "title": "Mis articulos",
      "count": "{count, plural, one {# articulo} other {# articulos}} en total",
      "createNew": "Nuevo articulo QR Code",
      "loginRequired": "Por favor inicie sesion para ver articulos.",
      "loading": "Cargando articulos...",
      "dismiss": "Descartar"
    }
  }
}
```

### 6.4 German (de.json) - Translations

```json
{
  "items": {
    "edit": {
      "pageTitle": "Artikel bearbeiten",
      "backToItems": "Zuruck zu Artikeln",
      "loading": "Artikel wird geladen...",
      "loginRequired": "Bitte melden Sie sich an, um Artikel zu bearbeiten.",
      "returnToItems": "Zuruck zu Artikeln",
      "form": {
        "nameLabel": "Artikelname",
        "namePlaceholder": "Artikelname eingeben",
        "descriptionLabel": "Beschreibung",
        "descriptionPlaceholder": "Artikelbeschreibung eingeben (optional)",
        "roomLabel": "Raum",
        "roomPlaceholder": "Raum auswahlen...",
        "roomAriaLabel": "Raum fur diesen Artikel auswahlen",
        "itemTypeLabel": "Artikeltyp",
        "itemTypePlaceholder": "Artikeltyp auswahlen...",
        "itemTypeAriaLabel": "Artikeltyp auswahlen",
        "tagsLabel": "Zusatzliche Tags",
        "tagsHelper": "Benutzerdefinierte Tags fur zusatzliche Kategorisierung hinzufugen",
        "tagsPlaceholder": "Klicken Sie, um Tags hinzuzufugen..."
      },
      "buttons": {
        "cancel": "Abbrechen",
        "save": "Anderungen speichern",
        "saving": "Speichern..."
      },
      "guides": {
        "title": "Anleitungen",
        "description": "Inhalt, der mit diesem Artikel verknupft ist",
        "empty": "Noch keine Anleitungen",
        "emptyDescription": "Anleitungen fur diesen Artikel werden hier angezeigt",
        "edit": "Bearbeiten"
      },
      "purposes": {
        "howToUse": "Wie zu benutzen",
        "troubleshooting": "Fehlerbehebung",
        "howToClean": "Wie zu reinigen",
        "safetyInfo": "Sicherheitsinformationen",
        "maintenance": "Wartung",
        "features": "Funktionen",
        "other": "Sonstiges"
      },
      "rooms": {
        "kitchen": "Kuche",
        "bathroom": "Badezimmer",
        "bedroom": "Schlafzimmer",
        "livingRoom": "Wohnzimmer",
        "laundry": "Waschkuche",
        "garage": "Garage",
        "outdoor": "Aussen",
        "office": "Buro",
        "gym": "Fitnessstudio",
        "pool": "Pool",
        "other": "Sonstiges"
      },
      "itemTypes": {
        "appliance": "Gerat",
        "roomItem": "Raumartikel",
        "generalInfo": "Allgemeine Informationen"
      },
      "tags": {
        "addTags": "Tags hinzufugen...",
        "typeToAdd": "Tippen zum Hinzufugen...",
        "maxReached": "Maximale Anzahl Tags erreicht",
        "saving": "Speichern...",
        "editTags": "Tags bearbeiten",
        "tagsSelected": "{count} Tags ausgewahlt",
        "savingTags": "Tags werden gespeichert...",
        "moreCount": "+{count} weitere",
        "suggestions": "Tag-Vorschlage",
        "addNewTag": "Neuen Tag hinzufugen",
        "validation": {
          "empty": "Tag darf nicht leer sein",
          "tooLong": "Tag muss {max} Zeichen oder weniger haben",
          "duplicate": "Tag existiert bereits",
          "maxTags": "Maximal {max} Tags erlaubt"
        }
      }
    },
    "list": {
      "title": "Meine Artikel",
      "count": "{count, plural, one {# Artikel} other {# Artikel}} insgesamt",
      "createNew": "Neuer QR-Code-Artikel",
      "loginRequired": "Bitte melden Sie sich an, um Artikel anzuzeigen.",
      "loading": "Artikel werden geladen...",
      "dismiss": "Verwerfen"
    }
  }
}
```

### 6.5 Dutch (nl.json) - Translations

```json
{
  "items": {
    "edit": {
      "pageTitle": "Item bewerken",
      "backToItems": "Terug naar items",
      "loading": "Item laden...",
      "loginRequired": "Log in om items te bewerken.",
      "returnToItems": "Terug naar items",
      "form": {
        "nameLabel": "Itemnaam",
        "namePlaceholder": "Voer itemnaam in",
        "descriptionLabel": "Beschrijving",
        "descriptionPlaceholder": "Voer itembeschrijving in (optioneel)",
        "roomLabel": "Kamer",
        "roomPlaceholder": "Selecteer een kamer...",
        "roomAriaLabel": "Selecteer kamer voor dit item",
        "itemTypeLabel": "Itemtype",
        "itemTypePlaceholder": "Selecteer itemtype...",
        "itemTypeAriaLabel": "Selecteer itemtype",
        "tagsLabel": "Extra tags",
        "tagsHelper": "Voeg aangepaste tags toe voor extra categorisatie",
        "tagsPlaceholder": "Klik om tags toe te voegen..."
      },
      "buttons": {
        "cancel": "Annuleren",
        "save": "Wijzigingen opslaan",
        "saving": "Opslaan..."
      },
      "guides": {
        "title": "Handleidingen",
        "description": "Inhoud gekoppeld aan dit item",
        "empty": "Nog geen handleidingen",
        "emptyDescription": "Handleidingen voor dit item verschijnen hier",
        "edit": "Bewerken"
      },
      "purposes": {
        "howToUse": "Hoe te gebruiken",
        "troubleshooting": "Probleemoplossing",
        "howToClean": "Hoe schoon te maken",
        "safetyInfo": "Veiligheidsinformatie",
        "maintenance": "Onderhoud",
        "features": "Functies",
        "other": "Overig"
      },
      "rooms": {
        "kitchen": "Keuken",
        "bathroom": "Badkamer",
        "bedroom": "Slaapkamer",
        "livingRoom": "Woonkamer",
        "laundry": "Wasruimte",
        "garage": "Garage",
        "outdoor": "Buiten",
        "office": "Kantoor",
        "gym": "Sportschool",
        "pool": "Zwembad",
        "other": "Overig"
      },
      "itemTypes": {
        "appliance": "Apparaat",
        "roomItem": "Kameritem",
        "generalInfo": "Algemene informatie"
      },
      "tags": {
        "addTags": "Tags toevoegen...",
        "typeToAdd": "Typ om toe te voegen...",
        "maxReached": "Maximum tags bereikt",
        "saving": "Opslaan...",
        "editTags": "Tags bewerken",
        "tagsSelected": "{count} tags geselecteerd",
        "savingTags": "Tags opslaan...",
        "moreCount": "+{count} meer",
        "suggestions": "Tag suggesties",
        "addNewTag": "Nieuwe tag toevoegen",
        "validation": {
          "empty": "Tag mag niet leeg zijn",
          "tooLong": "Tag moet {max} tekens of minder zijn",
          "duplicate": "Tag bestaat al",
          "maxTags": "Maximaal {max} tags toegestaan"
        }
      }
    },
    "list": {
      "title": "Mijn items",
      "count": "{count, plural, one {# item} other {# items}} totaal",
      "createNew": "Nieuw QR-code item",
      "loginRequired": "Log in om items te bekijken.",
      "loading": "Items laden...",
      "dismiss": "Sluiten"
    }
  }
}
```

### 6.6 Italian (it.json) - Translations

```json
{
  "items": {
    "edit": {
      "pageTitle": "Modifica articolo",
      "backToItems": "Torna agli articoli",
      "loading": "Caricamento articolo...",
      "loginRequired": "Effettua l'accesso per modificare gli articoli.",
      "returnToItems": "Torna agli articoli",
      "form": {
        "nameLabel": "Nome articolo",
        "namePlaceholder": "Inserisci il nome dell'articolo",
        "descriptionLabel": "Descrizione",
        "descriptionPlaceholder": "Inserisci la descrizione dell'articolo (opzionale)",
        "roomLabel": "Stanza",
        "roomPlaceholder": "Seleziona una stanza...",
        "roomAriaLabel": "Seleziona la stanza per questo articolo",
        "itemTypeLabel": "Tipo di articolo",
        "itemTypePlaceholder": "Seleziona il tipo di articolo...",
        "itemTypeAriaLabel": "Seleziona il tipo di articolo",
        "tagsLabel": "Tag aggiuntivi",
        "tagsHelper": "Aggiungi tag personalizzati per una categorizzazione aggiuntiva",
        "tagsPlaceholder": "Clicca per aggiungere tag..."
      },
      "buttons": {
        "cancel": "Annulla",
        "save": "Salva modifiche",
        "saving": "Salvataggio..."
      },
      "guides": {
        "title": "Guide",
        "description": "Contenuto associato a questo articolo",
        "empty": "Nessuna guida ancora",
        "emptyDescription": "Le guide per questo articolo appariranno qui",
        "edit": "Modifica"
      },
      "purposes": {
        "howToUse": "Come usare",
        "troubleshooting": "Risoluzione problemi",
        "howToClean": "Come pulire",
        "safetyInfo": "Informazioni di sicurezza",
        "maintenance": "Manutenzione",
        "features": "Funzionalita",
        "other": "Altro"
      },
      "rooms": {
        "kitchen": "Cucina",
        "bathroom": "Bagno",
        "bedroom": "Camera da letto",
        "livingRoom": "Soggiorno",
        "laundry": "Lavanderia",
        "garage": "Garage",
        "outdoor": "Esterno",
        "office": "Ufficio",
        "gym": "Palestra",
        "pool": "Piscina",
        "other": "Altro"
      },
      "itemTypes": {
        "appliance": "Elettrodomestico",
        "roomItem": "Articolo della stanza",
        "generalInfo": "Informazioni generali"
      },
      "tags": {
        "addTags": "Aggiungi tag...",
        "typeToAdd": "Digita per aggiungere...",
        "maxReached": "Numero massimo di tag raggiunto",
        "saving": "Salvataggio...",
        "editTags": "Modifica tag",
        "tagsSelected": "{count} tag selezionati",
        "savingTags": "Salvataggio tag...",
        "moreCount": "+{count} altri",
        "suggestions": "Suggerimenti tag",
        "addNewTag": "Aggiungi nuovo tag",
        "validation": {
          "empty": "Il tag non puo essere vuoto",
          "tooLong": "Il tag deve essere di {max} caratteri o meno",
          "duplicate": "Il tag esiste gia",
          "maxTags": "Massimo {max} tag consentiti"
        }
      }
    },
    "list": {
      "title": "I miei articoli",
      "count": "{count, plural, one {# articolo} other {# articoli}} in totale",
      "createNew": "Nuovo articolo QR Code",
      "loginRequired": "Effettua l'accesso per visualizzare gli articoli.",
      "loading": "Caricamento articoli...",
      "dismiss": "Chiudi"
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
| REQ-E02-081 (Update filter and sort components) | Parallel task | In Progress |
| REQ-E02-082 (Update bulk action dialogs) | Parallel task | In Progress |

### 7.3 Potential Blockers
- None identified - all prerequisites are met

---

## 8. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Room/item type constants not aligned with translation keys | Medium | Medium | Map existing constants to translation keys |
| TagsInlineEdit used in multiple places | Medium | Low | Ensure all usages pass translated placeholder |
| Long translated labels overflow form fields | Medium | Low | Design forms with 40% text expansion buffer |
| Missing translation keys in production | Low | High | Add build-time translation key validation |
| Performance impact from multiple hook calls | Low | Low | Hooks are memoized by next-intl |
| Accessibility regressions | Low | Medium | Test with screen reader in each language |

---

## 9. Verification Checklist

### 9.1 Functional Verification
- [ ] Edit Item page displays all labels in all 6 languages
- [ ] RoomSelector shows translated room options
- [ ] ItemTypeSelector shows translated item type options
- [ ] ItemInstructionsList shows translated section headings and empty states
- [ ] ItemInstructionsList shows translated purpose badges
- [ ] TagsInlineEdit shows translated placeholders and validation messages
- [ ] Items list page shows translated page title and counts
- [ ] Language switching updates all text without page reload
- [ ] All form functionality still works correctly after changes

### 9.2 Accessibility Verification
- [ ] All aria-labels are translated correctly
- [ ] Screen reader announces form fields in selected language
- [ ] Keyboard navigation continues to work in all components
- [ ] Error messages are announced correctly in selected language

### 9.3 Code Quality Verification
- [ ] TypeScript compiles without errors
- [ ] No console warnings for missing translation keys
- [ ] Translation keys follow naming convention (`items.edit.*`)
- [ ] All 6 language files have identical key structure
- [ ] Variables interpolation used correctly for dynamic values

---

## 10. References

- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md`
- **Request Source:** `/docs/gen_requests_epic2.md` - REQ-E02-083
- **Epic 1 Foundation:** `/docs/prd/Plan-110-L10N-Epic1-Foundation.md`
- **Pattern Reference:** `docs/REQ-E02-082-update-bulk-action-dialogs-overview.md`
- **next-intl Documentation:** https://next-intl-docs.vercel.app/
- **ICU Message Format:** https://unicode-org.github.io/icu/userguide/format_parse/messages/

---

*Document generated for FAQBNB Localization Epic 2 - Sub-Epic 2D: Item Management*
