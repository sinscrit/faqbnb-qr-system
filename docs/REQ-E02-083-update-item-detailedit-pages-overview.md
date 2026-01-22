# REQ-E02-083: Update Item Detail/Edit Pages for Internationalization

**Document Type:** Implementation Breakdown (Overview)
**Request ID:** REQ-E02-083
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2D - Item Management
**Task Reference:** 2D.6
**Priority:** High
**Size:** M (Medium)

**Created:** 2026-01-22 15:09
**Last Modified:** 2026-01-22 15:09

---

## 1. Summary

This document provides the implementation breakdown for adding internationalization support to the item detail and edit pages in the FAQBNB application. This includes the Items List page (`/dashboard2/items`), the Edit Item page (`/dashboard2/items/[publicId]/edit`), and related child components such as RoomSelector, ItemTypeSelector, and ItemInstructionsList. The implementation integrates next-intl translations for all hardcoded UI strings including page titles, form labels, buttons, placeholders, loading states, error messages, and accessibility attributes.

---

## 2. Requirements Analysis

### 2.1 Source Request Overview

**From:** `/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md` - Task 2D.6

The item detail/edit pages must be updated to:
1. Display localized page titles and headers using next-intl translation hooks
2. Translate all form labels, placeholders, and helper text
3. Provide translated button labels and loading states
4. Ensure error messages are localized
5. Translate room type and item type dropdown options
6. Localize guide/instruction purpose badges
7. Support language switching without page reload

### 2.2 Current Behavior

**Items List Page** (`src/app/dashboard2/items/page.tsx`):
- Page title, subtitle with item count
- Login required message
- Loading state message
- "Create New" button label
- Error dismiss button

**Edit Item Page** (`src/app/dashboard2/items/[publicId]/edit/page.tsx`):
- Page title "Edit Item"
- Back navigation button label
- Form field labels (Name, Description)
- Form field placeholders
- Tags section label and helper text
- Cancel and Save buttons
- Loading and saving states
- Error messages

**RoomSelector** (`src/components/ItemEditForm/RoomSelector.tsx`):
- Section label "Room"
- Dropdown placeholder
- Room type options (Kitchen, Bathroom, Bedroom, etc.)

**ItemTypeSelector** (`src/components/ItemEditForm/ItemTypeSelector.tsx`):
- Section label "Item Type"
- Dropdown placeholder
- Item type options (Appliance, Room Item, General Info)

**ItemInstructionsList** (`src/components/ItemEditForm/ItemInstructionsList.tsx`):
- Section title "Guides"
- Description text
- Empty state messages
- Edit button for each instruction
- Purpose badge labels (How To Use, Troubleshooting, etc.)

### 2.3 Expected Behavior

After implementation:
1. All page content uses translation hooks (`useTranslations('items.list')`, `useTranslations('items.edit')`)
2. Form labels and placeholders display in the selected language
3. Room and item type dropdowns show translated option labels
4. Purpose badges on instructions show translated purpose names
5. Loading, saving, and error states display localized messages
6. Accessibility attributes (aria-labels) reflect the selected language
7. Components respond to locale context changes without page reload

---

## 3. Technical Approach

### 3.1 Architecture Pattern

Following the established Epic 2 pattern for client components:

```typescript
'use client';
import { useTranslations } from 'next-intl';

function ItemEditPage() {
  const t = useTranslations('items.edit');
  return <h1>{t('pageTitle')}</h1>;
}
```

### 3.2 Translation Namespaces

**Items List Page:** `items.list`
- `title`, `count`, `createNew`, `loginRequired`, `loading`, `dismiss`, `error`
- `empty.title`, `empty.description`, `empty.action`
- `noResults.title`, `noResults.description`

**Edit Item Page:** `items.edit`
- `pageTitle`, `backToItems`, `loading`, `loginRequired`, `returnToItems`
- `form.nameLabel`, `form.namePlaceholder`, `form.descriptionLabel`, `form.descriptionPlaceholder`
- `form.roomLabel`, `form.roomPlaceholder`, `form.roomAriaLabel`
- `form.itemTypeLabel`, `form.itemTypePlaceholder`, `form.itemTypeAriaLabel`
- `form.tagsLabel`, `form.tagsHelper`, `form.tagsPlaceholder`
- `buttons.cancel`, `buttons.save`, `buttons.saving`
- `guides.title`, `guides.description`, `guides.empty`, `guides.emptyDescription`, `guides.edit`
- `rooms.*` (kitchen, bathroom, bedroom, livingRoom, etc.)
- `itemTypes.*` (appliance, roomItem, generalInfo)
- `purposes.*` (howToUse, troubleshooting, howToClean, safetyInfo, maintenance, features, other)

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

### Task 1: Add items.list namespace to translation files (Priority: High)

**Description:** Add translation keys for the items list page to all 6 language files.

**Files to Modify:**
- `/messages/en.json`
- `/messages/fr.json`
- `/messages/es.json`
- `/messages/de.json`
- `/messages/nl.json`
- `/messages/it.json`

**Keys to Add:**
```json
{
  "items": {
    "list": {
      "title": "My Items",
      "count": "{count, plural, one {# item} other {# items}} total",
      "createNew": "New QR Code Item",
      "loginRequired": "Please log in to view items.",
      "loading": "Loading items...",
      "dismiss": "Dismiss",
      "error": "An error occurred",
      "empty": {
        "title": "No items yet",
        "description": "Create your first QR code item to get started",
        "action": "Create Item"
      },
      "noResults": {
        "title": "No matching items",
        "description": "Try adjusting your search or filters"
      }
    }
  }
}
```

**Acceptance Criteria:**
- [ ] All 6 language files contain `items.list.*` keys
- [ ] ICU plural syntax used for count formatting
- [ ] Translations are contextually appropriate

---

### Task 2: Add items.edit namespace to translation files (Priority: High)

**Description:** Add translation keys for the edit item page and child components.

**Files to Modify:**
- `/messages/en.json`
- `/messages/fr.json`
- `/messages/es.json`
- `/messages/de.json`
- `/messages/nl.json`
- `/messages/it.json`

**Keys to Add:**
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
      "purposes": {
        "howToUse": "How To Use",
        "troubleshooting": "Troubleshooting",
        "howToClean": "How To Clean",
        "safetyInfo": "Safety Info",
        "maintenance": "Maintenance",
        "features": "Features",
        "other": "Other"
      }
    }
  }
}
```

**Acceptance Criteria:**
- [ ] All 6 language files contain `items.edit.*` keys
- [ ] Room type translations cover all 11 room types
- [ ] Item type translations cover all 3 item types
- [ ] Purpose translations cover all 7 purpose types

---

### Task 3: Update Items List Page for i18n (Priority: High)

**Description:** Add translation hook and replace hardcoded strings in the items list page.

**File to Modify:** `src/app/dashboard2/items/page.tsx`

**Target Approach:**
```typescript
import { useTranslations } from 'next-intl';

export default function ItemsPage() {
  const t = useTranslations('items.list');

  // Replace hardcoded strings:
  // - Page title: <h1>{t('title')}</h1>
  // - Count: t('count', { count: items.length })
  // - Button: t('createNew')
  // - Loading: t('loading')
  // - Login required: t('loginRequired')
  // - Dismiss: t('dismiss')
}
```

**Acceptance Criteria:**
- [ ] Import `useTranslations` from `next-intl`
- [ ] Initialize translation hook with `items.list` namespace
- [ ] Replace all hardcoded strings with translation calls
- [ ] Use ICU plural format for item count
- [ ] TypeScript compiles without errors

---

### Task 4: Update Edit Item Page for i18n (Priority: High)

**Description:** Add translation hook and replace hardcoded strings in the edit item page.

**File to Modify:** `src/app/dashboard2/items/[publicId]/edit/page.tsx`

**Target Approach:**
```typescript
import { useTranslations } from 'next-intl';

export default function EditItemPage() {
  const t = useTranslations('items.edit');

  // Replace hardcoded strings:
  // - Page title: t('pageTitle')
  // - Back button: t('backToItems')
  // - Form labels: t('form.nameLabel'), t('form.descriptionLabel')
  // - Placeholders: t('form.namePlaceholder')
  // - Buttons: t('buttons.cancel'), t('buttons.save'), t('buttons.saving')
  // - Loading: t('loading')
  // - Login required: t('loginRequired')
}
```

**Acceptance Criteria:**
- [ ] Import `useTranslations` from `next-intl`
- [ ] Initialize translation hook with `items.edit` namespace
- [ ] Replace all form labels and placeholders
- [ ] Replace button labels and loading states
- [ ] Replace error and login required messages
- [ ] TypeScript compiles without errors

---

### Task 5: Update RoomSelector Component for i18n (Priority: High)

**Description:** Add translation hook and translate room type options.

**File to Modify:** `src/components/ItemEditForm/RoomSelector.tsx`

**Target Approach:**
```typescript
import { useTranslations } from 'next-intl';

export function RoomSelector({ value, onChange, disabled }: RoomSelectorProps) {
  const t = useTranslations('items.edit');

  // Map room type to translation key
  const getRoomLabel = (roomType: string): string => {
    const keyMap: Record<string, string> = {
      'kitchen': 'rooms.kitchen',
      'bathroom': 'rooms.bathroom',
      // ... etc
    };
    return t(keyMap[roomType] || 'rooms.other');
  };

  return (
    <div>
      <label>{t('form.roomLabel')}</label>
      <select aria-label={t('form.roomAriaLabel')}>
        <option value="">{t('form.roomPlaceholder')}</option>
        {ROOM_TYPES.map((room) => (
          <option key={room} value={room}>{getRoomLabel(room)}</option>
        ))}
      </select>
    </div>
  );
}
```

**Acceptance Criteria:**
- [ ] Import `useTranslations` from `next-intl`
- [ ] Translate section label
- [ ] Translate dropdown placeholder
- [ ] Translate all room type option labels
- [ ] Translate aria-label for accessibility
- [ ] TypeScript compiles without errors

---

### Task 6: Update ItemTypeSelector Component for i18n (Priority: High)

**Description:** Add translation hook and translate item type options.

**File to Modify:** `src/components/ItemEditForm/ItemTypeSelector.tsx`

**Target Approach:**
```typescript
import { useTranslations } from 'next-intl';

export function ItemTypeSelector({ value, onChange, disabled }: ItemTypeSelectorProps) {
  const t = useTranslations('items.edit');

  // Map item type to translation key
  const getItemTypeLabel = (itemType: string): string => {
    const keyMap: Record<string, string> = {
      'appliance': 'itemTypes.appliance',
      'room-item': 'itemTypes.roomItem',
      'general-info': 'itemTypes.generalInfo',
    };
    return t(keyMap[itemType] || 'itemTypes.appliance');
  };

  return (
    <div>
      <label>{t('form.itemTypeLabel')}</label>
      <select aria-label={t('form.itemTypeAriaLabel')}>
        <option value="">{t('form.itemTypePlaceholder')}</option>
        {ITEM_TYPES.map((type) => (
          <option key={type} value={type}>{getItemTypeLabel(type)}</option>
        ))}
      </select>
    </div>
  );
}
```

**Acceptance Criteria:**
- [ ] Import `useTranslations` from `next-intl`
- [ ] Translate section label
- [ ] Translate dropdown placeholder
- [ ] Translate all item type option labels
- [ ] Translate aria-label for accessibility
- [ ] TypeScript compiles without errors

---

### Task 7: Update ItemInstructionsList Component for i18n (Priority: High)

**Description:** Add translation hook and translate instruction list elements including purpose badges.

**File to Modify:** `src/components/ItemEditForm/ItemInstructionsList.tsx`

**Target Approach:**
```typescript
import { useTranslations } from 'next-intl';

export function ItemInstructionsList({ articles, itemName, onEditInstruction, loading }: Props) {
  const t = useTranslations('items.edit');

  // Map purpose to translation key
  const getPurposeLabel = (purpose: string): string => {
    const keyMap: Record<string, string> = {
      'how_to_use': 'purposes.howToUse',
      'troubleshooting': 'purposes.troubleshooting',
      // ... etc
    };
    return t(keyMap[purpose] || 'purposes.other');
  };

  return (
    <div>
      <h3>{t('guides.title')}</h3>
      <p>{t('guides.description')}</p>
      {/* Empty state */}
      <p>{t('guides.empty')}</p>
      <p>{t('guides.emptyDescription')}</p>
      {/* Edit button */}
      <span>{t('guides.edit')}</span>
    </div>
  );
}
```

**Acceptance Criteria:**
- [ ] Import `useTranslations` from `next-intl`
- [ ] Translate section title and description
- [ ] Translate empty state messages
- [ ] Translate edit button label
- [ ] Translate all purpose badge labels
- [ ] TypeScript compiles without errors

---

### Task 8: Update layout files for i18n (Priority: Medium)

**Description:** Update layout files to include any metadata translations.

**Files to Modify:**
- `src/app/dashboard2/items/layout.tsx`
- `src/app/dashboard2/items/[publicId]/edit/layout.tsx`

**Acceptance Criteria:**
- [ ] Metadata titles are translated (if applicable)
- [ ] TypeScript compiles without errors

---

### Task 9: Testing and verification (Priority: High)

**Description:** Verify all translations work correctly across languages.

**Test Scenarios:**
1. Navigate to `/dashboard2/items` in each of the 6 languages and verify:
   - Page title is translated
   - Item count uses correct plural form
   - "New QR Code Item" button is translated
   - Empty state messages are translated
   - Loading state is translated
2. Navigate to `/dashboard2/items/[id]/edit` in each language and verify:
   - "Edit Item" title is translated
   - "Back to Items" navigation is translated
   - All form labels and placeholders are translated
   - Room dropdown options are translated
   - Item type dropdown options are translated
   - Tags section labels are translated
   - Guides section is fully translated
   - Purpose badges show translated purpose names
   - Cancel and Save buttons are translated
   - Saving state is translated
3. Test language switching updates all text without page reload
4. Verify no console warnings about missing translation keys

**Acceptance Criteria:**
- [ ] All 6 languages display correctly
- [ ] No missing translation warnings in console
- [ ] Language switching updates UI without reload
- [ ] TypeScript compiles without errors
- [ ] Existing functionality preserved

---

## 5. Authorized Files and Functions for Modification

### 5.1 Primary Files

| File | Functions/Sections | Modification Type |
|------|-------------------|-------------------|
| `src/app/dashboard2/items/page.tsx` | `ItemsPage` function | Add import, add hook, replace strings |
| `src/app/dashboard2/items/[publicId]/edit/page.tsx` | `EditItemPage` function | Add import, add hook, replace strings |
| `src/components/ItemEditForm/RoomSelector.tsx` | `RoomSelector` function | Add import, add hook, translate options |
| `src/components/ItemEditForm/ItemTypeSelector.tsx` | `ItemTypeSelector` function | Add import, add hook, translate options |
| `src/components/ItemEditForm/ItemInstructionsList.tsx` | `ItemInstructionsList` function | Add import, add hook, translate labels |
| `src/app/dashboard2/items/layout.tsx` | Metadata (if applicable) | Add metadata translations |
| `src/app/dashboard2/items/[publicId]/edit/layout.tsx` | Metadata (if applicable) | Add metadata translations |
| `/messages/en.json` | `items.list`, `items.edit` namespaces | Extend with new keys |
| `/messages/fr.json` | `items.list`, `items.edit` namespaces | Extend with new keys |
| `/messages/es.json` | `items.list`, `items.edit` namespaces | Extend with new keys |
| `/messages/de.json` | `items.list`, `items.edit` namespaces | Extend with new keys |
| `/messages/nl.json` | `items.list`, `items.edit` namespaces | Extend with new keys |
| `/messages/it.json` | `items.list`, `items.edit` namespaces | Extend with new keys |

### 5.2 Read-Only Reference Files

| File | Purpose |
|------|---------|
| `src/components/ItemCreationWorkflow/utils/constants.ts` | ROOM_TYPES and ITEM_TYPES constants |
| `src/components/ItemEditForm/ItemEditForm.types.ts` | Type definitions |
| `src/lib/room-utils.ts` | Room tag utilities |
| `src/lib/item-type-utils.ts` | Item type utilities |
| `docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md` | Implementation plan reference |

---

## 6. Dependencies and Blockers

### 6.1 Prerequisites
- [x] Epic 1 foundation complete (next-intl installed and configured)
- [x] Translation files exist for all 6 languages
- [x] LocaleContext available for locale state management
- [x] `items` namespace exists in translation files

### 6.2 Dependencies on Other Requests

| Request | Dependency Type | Status |
|---------|-----------------|--------|
| REQ-E02-078 (Create items namespace structure) | Foundation | Complete |
| REQ-E02-079 (Update ItemManager component family) | Sibling task | In Progress |
| REQ-E02-080 (Update ItemGrid and ItemCard) | Sibling task | In Progress |
| REQ-E02-081 (Update filter and sort components) | Sibling task | In Progress |
| REQ-E02-082 (Update bulk action dialogs) | Sibling task | In Progress |

### 6.3 Blocks (Requires This First)

| Request | What This Provides |
|---------|-------------------|
| REQ-E02-084 (Generate translations for 5 non-English languages) | English source strings for items.list and items.edit |

### 6.4 Parallel Safety

- **Files touched**:
  - `src/app/dashboard2/items/page.tsx`
  - `src/app/dashboard2/items/[publicId]/edit/page.tsx`
  - `src/components/ItemEditForm/RoomSelector.tsx`
  - `src/components/ItemEditForm/ItemTypeSelector.tsx`
  - `src/components/ItemEditForm/ItemInstructionsList.tsx`
  - `/messages/*.json`

- **Conflicts with**:
  - REQ-E02-079, REQ-E02-080, REQ-E02-081, REQ-E02-082 (all modify messages files)

- **Safe to parallelize with**:
  - Tasks in other sub-epics (2A Auth, 2B Dashboard, 2C Workflow, 2E Articles, etc.)

### 6.5 External Dependencies

- `next-intl` package (installed in Epic 1)

---

## 7. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Room/item type labels too long in some languages | Medium | Low | Test layout with longer text; use ellipsis if needed |
| Purpose badge overflow in non-English | Low | Low | Badge styling allows for text expansion |
| Form field validation messages need translation | Medium | Medium | Ensure Zod or form validation messages also use i18n |
| Missing translation keys in production | Low | High | Add build-time translation key validation |

---

## 8. Verification Checklist

### 8.1 Functional Verification
- [ ] Items list page title is translated in all 6 languages
- [ ] Item count uses correct plural form (1 item / 2 items)
- [ ] Edit item page title is translated
- [ ] All form labels and placeholders are translated
- [ ] Room selector shows translated room names
- [ ] Item type selector shows translated type names
- [ ] Guides section title and description are translated
- [ ] Purpose badges show translated purpose names
- [ ] Cancel and Save buttons are translated
- [ ] Loading and saving states are translated
- [ ] Language switching updates all text without reload

### 8.2 Accessibility Verification
- [ ] All aria-labels are translated correctly
- [ ] Screen reader announces correctly in all languages
- [ ] Keyboard navigation continues to work

### 8.3 Code Quality Verification
- [ ] TypeScript compiles without errors
- [ ] No console warnings for missing translation keys
- [ ] Translation keys follow naming convention
- [ ] All 6 language files have identical key structure

---

## 9. Out of Scope

- API error message translations (covered by common error namespace)
- Item creation workflow translations (covered by Sub-Epic 2C)
- ItemManager component translations (covered by REQ-E02-079)
- Filter and sort component translations (covered by REQ-E02-081)
- Changes to page routing or functionality
- Backend API changes

---

## 10. References

- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md`
- **Epic 1 Foundation:** `/docs/prd/Plan-110-L10N-Epic1-Foundation.md`
- **Pattern Reference:** `src/components/LogoutButton.tsx` (useTranslations usage)
- **next-intl Documentation:** https://next-intl-docs.vercel.app/
- **ICU Message Format:** https://unicode-org.github.io/icu/userguide/format_parse/messages/

---

*Document generated: 2026-01-22 15:09*
*Document generated for FAQBNB Localization Epic 2 - Sub-Epic 2D: Item Management*
