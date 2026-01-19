# REQ-390: Update Item Detail and Edit Pages for Localization - Overview

**Last Modified:** 2026-01-19 16:45 UTC
**Request ID:** REQ-390
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2D - Item Management
**Task ID:** 2D.6
**Size:** L (Large)
**Priority:** P1 - High

---

## Summary

This task involves updating the item detail and edit pages to support full localization. All hardcoded English strings in the item editing workflow must be replaced with translation keys using the `useTranslations` hook from `next-intl`. This includes field labels, placeholder text, validation messages, action buttons, status indicators, error messages, and help text.

---

## Current State Analysis

### Affected Files

The following files contain hardcoded English strings that require localization:

| File | Path | Estimated Strings |
|------|------|-------------------|
| Edit Item Page | `/src/app/dashboard2/items/[publicId]/edit/page.tsx` | ~45 |
| Items Page | `/src/app/dashboard2/items/page.tsx` | ~20 |
| RoomSelector | `/src/components/ItemEditForm/RoomSelector.tsx` | ~5 |
| ItemTypeSelector | `/src/components/ItemEditForm/ItemTypeSelector.tsx` | ~5 |
| ItemInstructionsList | `/src/components/ItemEditForm/ItemInstructionsList.tsx` | ~15 |
| TagsInlineEdit | `/src/components/ItemManager/components/shared/TagsInlineEdit.tsx` | ~25 |

**Total Estimated Strings:** ~115

### Identified Hardcoded Strings

#### Edit Item Page (`/src/app/dashboard2/items/[publicId]/edit/page.tsx`)
- "Please log in to edit items."
- "Loading item..."
- "Return to Items"
- "Back to Items"
- "Edit Item"
- "Item Name"
- "Enter item name"
- "Description"
- "Enter item description (optional)"
- "Additional Tags"
- "Add custom tags for additional categorization"
- "Click to add tags..."
- "Cancel"
- "Saving..."
- "Save Changes"
- "Property ID is missing"
- "Failed to fetch item"
- "Failed to update item"

#### Items Page (`/src/app/dashboard2/items/page.tsx`)
- "Please log in to view items."
- "Loading items..."
- "My Items"
- "{count} item(s) total"
- "New QR Code Item"
- "Dismiss"
- "Failed to fetch items"
- "Failed to delete items"
- "Failed to update item"
- "Failed to duplicate item"

#### RoomSelector (`/src/components/ItemEditForm/RoomSelector.tsx`)
- "Room"
- "Select room for this item"
- "Select a room..."

#### ItemTypeSelector (`/src/components/ItemEditForm/ItemTypeSelector.tsx`)
- "Item Type"
- "Select item type"
- "Select item type..."

#### ItemInstructionsList (`/src/components/ItemEditForm/ItemInstructionsList.tsx`)
- "Guides"
- "Content associated with this item"
- "No guides yet"
- "Guides for this item will appear here"
- "Edit"
- Purpose labels (how_to_use, troubleshooting, etc.)

#### TagsInlineEdit (`/src/components/ItemManager/components/shared/TagsInlineEdit.tsx`)
- "Add tags..."
- "Type to add..."
- "Max tags reached"
- "Edit tags"
- "Tag cannot be empty"
- "Tag must be {max} characters or less"
- "Tag already exists"
- "Maximum {max} tags allowed"
- "Saving..."
- "Failed to save tags"
- "{count} tags selected"
- "+{count} more"
- "Tag suggestions"

---

## Existing Patterns

### Translation Hook Usage

The codebase follows this pattern (from `LogoutButton.tsx`):

```typescript
'use client';

import { useTranslations } from 'next-intl';

function Component() {
  const t = useTranslations('namespace');
  const tCommon = useTranslations('common');

  return <button>{t('buttonLabel')}</button>;
}
```

### Existing Translation Namespaces

From `/messages/en.json`:
- `common` - Shared actions (save, cancel, delete, etc.)
- `auth` - Authentication strings
- `dashboard` - Dashboard-related strings
- `items` - Item-related strings (partially populated)
- `errors` - Error messages

### Pluralization Pattern (ICU Format)

```json
{
  "items.count": "{count, plural, =0 {No items} one {# item} other {# items}}"
}
```

---

## Implementation Approach

### Phase 1: Update Translation Files

Add new translation keys to the `items` namespace in `/messages/en.json`:

```json
{
  "items": {
    "edit": {
      "title": "Edit Item",
      "backToItems": "Back to Items",
      "nameLabel": "Item Name",
      "namePlaceholder": "Enter item name",
      "descriptionLabel": "Description",
      "descriptionPlaceholder": "Enter item description (optional)",
      "additionalTags": "Additional Tags",
      "additionalTagsHint": "Add custom tags for additional categorization",
      "tagsPlaceholder": "Click to add tags...",
      "saving": "Saving...",
      "saveChanges": "Save Changes"
    },
    "list": {
      "title": "My Items",
      "itemCount": "{count, plural, =0 {No items} one {# item} other {# items}} total",
      "createNew": "New QR Code Item",
      "dismiss": "Dismiss",
      "loginRequired": "Please log in to view items."
    },
    "form": {
      "room": "Room",
      "roomAriaLabel": "Select room for this item",
      "roomPlaceholder": "Select a room...",
      "itemType": "Item Type",
      "itemTypeAriaLabel": "Select item type",
      "itemTypePlaceholder": "Select item type..."
    },
    "guides": {
      "title": "Guides",
      "description": "Content associated with this item",
      "empty": "No guides yet",
      "emptyHint": "Guides for this item will appear here"
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
      "fetchFailed": "Failed to fetch item",
      "updateFailed": "Failed to update item",
      "deleteFailed": "Failed to delete items",
      "duplicateFailed": "Failed to duplicate item",
      "saveFailed": "Failed to save tags",
      "loginRequiredEdit": "Please log in to edit items.",
      "returnToItems": "Return to Items"
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

### Phase 2: Update Components

Each component will be updated to:
1. Import `useTranslations` from `next-intl`
2. Initialize translation hooks with appropriate namespaces
3. Replace hardcoded strings with `t('key')` calls
4. Use pluralization for count-based strings
5. Use variable interpolation for dynamic values

### Phase 3: Generate Translations

After English translations are finalized, generate translations for:
- French (fr.json)
- Spanish (es.json)
- German (de.json)
- Dutch (nl.json)
- Italian (it.json)

---

## Dependencies

### Required (from Epic 1 Foundation)

| Dependency | Location | Status |
|------------|----------|--------|
| next-intl package | `package.json` | Installed |
| i18n config | `/src/lib/i18n/config.ts` | Complete |
| IntlProvider | `/src/app/layout.tsx` | Configured |
| Translation files | `/messages/*.json` | Available |
| useTranslations hook | next-intl | Available |

### Internal Dependencies

- Common namespace translations for shared actions (save, cancel, edit)
- Error namespace translations for error messages
- Existing `items` namespace translations (partial)

---

## Authorized Files and Functions for Modification

### Files Authorized for Modification

| File Path | Modification Scope |
|-----------|-------------------|
| `/src/app/dashboard2/items/[publicId]/edit/page.tsx` | Add translations for all UI strings |
| `/src/app/dashboard2/items/page.tsx` | Add translations for all UI strings |
| `/src/components/ItemEditForm/RoomSelector.tsx` | Add translations for labels and placeholders |
| `/src/components/ItemEditForm/ItemTypeSelector.tsx` | Add translations for labels and placeholders |
| `/src/components/ItemEditForm/ItemInstructionsList.tsx` | Add translations for all UI strings |
| `/src/components/ItemManager/components/shared/TagsInlineEdit.tsx` | Add translations for all UI strings |
| `/messages/en.json` | Add new translation keys in `items` namespace |
| `/messages/fr.json` | Add French translations |
| `/messages/es.json` | Add Spanish translations |
| `/messages/de.json` | Add German translations |
| `/messages/nl.json` | Add Dutch translations |
| `/messages/it.json` | Add Italian translations |

### Functions/Components Authorized for Modification

| Function/Component | File | Modification |
|-------------------|------|--------------|
| `EditItemPage` | edit/page.tsx | Add useTranslations hook, replace strings |
| `ItemsPage` | page.tsx | Add useTranslations hook, replace strings |
| `RoomSelector` | RoomSelector.tsx | Add useTranslations hook, replace strings |
| `ItemTypeSelector` | ItemTypeSelector.tsx | Add useTranslations hook, replace strings |
| `ItemInstructionsList` | ItemInstructionsList.tsx | Add useTranslations hook, replace strings |
| `formatPurposeLabel` | ItemInstructionsList.tsx | Update to use translations |
| `TagsInlineEdit` | TagsInlineEdit.tsx | Add useTranslations hook, replace strings |

### Constants Files (Read-Only Reference)

These files contain constant values that will be translated via lookup:

| File | Purpose |
|------|---------|
| `/src/components/ItemCreationWorkflow/utils/constants.ts` | Room types and item types constants |

---

## Acceptance Criteria Mapping

| Acceptance Criteria | Implementation Task |
|--------------------|---------------------|
| All static text on item detail pages is translated | Update ItemInstructionsList and related components |
| All static text on item edit pages is translated | Update edit/page.tsx and form components |
| Field labels, placeholders, and help text translated | Update all form components |
| Validation messages display in selected language | Update TagsInlineEdit validation messages |
| Action buttons show translated labels | Replace button text with t() calls |
| Status badges and indicators display localized text | Update purpose badges in ItemInstructionsList |
| Page titles and section headings internationalized | Add translations for all headings |
| Success and error toast notifications translated | Update error message displays |
| All five supported languages render correctly | Generate and verify all language files |
| Form submission and validation unchanged | Preserve existing logic, only change display strings |
| No hardcoded English strings remain | Audit all modified files |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Missing translation keys | Low | Medium | Comprehensive string audit |
| Layout breaks with longer text | Medium | Low | Design review with German translations |
| Validation logic affected | Low | High | Preserve existing validation, only change messages |
| Purpose label mapping issues | Medium | Low | Create comprehensive purpose translation map |
| Performance impact from multiple hooks | Low | Low | Combine namespaces where appropriate |

---

## Testing Checklist

- [ ] Edit item page renders correctly in all 6 languages
- [ ] Items list page renders correctly in all 6 languages
- [ ] Room selector shows translated labels
- [ ] Item type selector shows translated labels
- [ ] Guides section shows translated text
- [ ] Purpose badges display translated labels
- [ ] Tags component shows translated messages
- [ ] Validation errors display in selected language
- [ ] Action buttons show translated labels
- [ ] Loading states show translated text
- [ ] Error states show translated messages
- [ ] No layout breaks with longer translations
- [ ] Form submission works correctly
- [ ] No console errors related to missing translations

---

## Estimated Effort

| Task | Estimate |
|------|----------|
| Add translation keys to en.json | 1 hour |
| Update edit/page.tsx | 1.5 hours |
| Update page.tsx (items list) | 1 hour |
| Update RoomSelector.tsx | 30 minutes |
| Update ItemTypeSelector.tsx | 30 minutes |
| Update ItemInstructionsList.tsx | 1 hour |
| Update TagsInlineEdit.tsx | 1.5 hours |
| Generate translations for 5 languages | 1 hour |
| Testing and verification | 2 hours |
| **Total** | **~10 hours** |

---

## References

- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [Request Details: REQ-390](/docs/gen_requests_epic2.md)
- [i18n Configuration](/src/lib/i18n/config.ts)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Epic 1 Foundation Plan](/docs/prd/Plan-110-L10N-Epic1-Foundation.md)

---

## Appendix: String Inventory

### Edit Item Page - Complete String List

1. "Please log in to edit items."
2. "Loading item..."
3. "Return to Items"
4. "Back to Items"
5. "Edit Item"
6. "Item Name"
7. "Enter item name"
8. "Description"
9. "Enter item description (optional)"
10. "Additional Tags"
11. "Add custom tags for additional categorization"
12. "Click to add tags..."
13. "Cancel"
14. "Saving..."
15. "Save Changes"
16. "Property ID is missing"
17. "Failed to fetch item"
18. "Failed to update item"

### Items Page - Complete String List

1. "Please log in to view items."
2. "Loading items..."
3. "My Items"
4. "{count} item(s) total"
5. "New QR Code Item"
6. "Dismiss"
7. "Failed to fetch items"
8. "Failed to delete items"
9. "Failed to update item"
10. "Failed to duplicate item"

### TagsInlineEdit - Complete String List

1. "Add tags..."
2. "Type to add..."
3. "Max tags reached"
4. "Edit tags"
5. "Tag cannot be empty"
6. "Tag must be {maxTagLength} characters or less"
7. "Tag already exists"
8. "Maximum {maxTags} tags allowed"
9. "Saving..."
10. "Failed to save tags"
11. "{count} tags selected"
12. "+{count} more"
13. "Tag suggestions"

### ItemInstructionsList - Complete String List

1. "Guides"
2. "Content associated with this item"
3. "No guides yet"
4. "Guides for this item will appear here"
5. "Edit"
6. Purpose labels: "How To Use", "Troubleshooting", "How To Clean", "Safety Info", "Maintenance", "Features"
