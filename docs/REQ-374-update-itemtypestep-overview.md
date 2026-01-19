# REQ-374: Update ItemTypeStep Component for Internationalization

**Last Modified:** 2026-01-19 18:55 UTC
**Document Type:** Implementation Breakdown (Overview)
**Epic:** Epic 2: Static UI Localization
**Phase:** Phase 2C (Item Creation Workflow)
**Task:** 2C.4 - Update ItemTypeStep component
**Request Size:** M (Medium)

---

## 1. Summary

This document provides the implementation breakdown for internationalizing the `ItemTypeStep` component, which is Step 2 of the Item Creation Workflow. The component must be refactored to use the `useTranslations` hook from `next-intl` for all user-facing strings, enabling the item type selection interface to display in all 6 supported languages (English, French, Spanish, German, Dutch, Italian).

## 2. Current State Analysis

### 2.1 Component Location
- **Primary File:** `src/components/ItemCreationWorkflow/components/steps/ItemTypeStep.tsx`
- **Supporting Files:**
  - `src/components/ItemCreationWorkflow/components/shared/ItemTypeCard.tsx`
  - `src/components/ItemCreationWorkflow/utils/constants.ts`
  - `src/components/ItemCreationWorkflow/components/steps/__tests__/ItemTypeStep.test.tsx`

### 2.2 Current Hardcoded Strings

The component currently contains the following hardcoded English strings:

| String | Location | Purpose |
|--------|----------|---------|
| `"What type of item is this?"` | Line 97-98 | Step heading |
| `"Choose the category that best describes your item"` | Line 100-102 | Step description |
| `"Select item type"` | Line 108 | ARIA label for radiogroup |
| `"Use up and down arrow keys to navigate. Press Enter or Space to select."` | Line 127-129 | Screen reader help text |
| `"Continue"` | Line 147 | Button label |

### 2.3 Constants Requiring Translation

From `constants.ts`, the `ITEM_TYPE_LABELS` and `ITEM_TYPE_DESCRIPTIONS` objects contain 3 hardcoded labels and descriptions:

| Item Type | Current Label | Current Description |
|-----------|---------------|---------------------|
| `appliance` | Appliance | Washer, dryer, stove, refrigerator, etc. |
| `room-item` | Room Item | Pantry, cabinets, closet, sink, etc. |
| `general-info` | General Info | Trash schedule, WiFi info, house rules, etc. |

### 2.4 Existing i18n Infrastructure

The project uses `next-intl` with the following established patterns:
- Translation files in `/messages/{locale}.json`
- Client components use `useTranslations` hook
- Multiple namespaces can be loaded (e.g., `useTranslations('auth')`, `useTranslations('common')`)
- Example pattern in `LogoutButton.tsx`:
  ```typescript
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');
  ```

## 3. Implementation Approach

### 3.1 Translation Namespace: `workflow`

Following the implementation plan, this component will use the `workflow` namespace. The translation keys will follow the pattern `workflow.steps.itemType.*`.

### 3.2 Required Translation Keys

Add to `/messages/en.json` under the `workflow` namespace:

```json
{
  "workflow": {
    "steps": {
      "itemType": {
        "title": "What type of item is this?",
        "description": "Choose the category that best describes your item",
        "ariaLabel": "Select item type",
        "keyboardHelp": "Use up and down arrow keys to navigate. Press Enter or Space to select."
      }
    },
    "itemTypes": {
      "appliance": {
        "label": "Appliance",
        "description": "Washer, dryer, stove, refrigerator, etc."
      },
      "roomItem": {
        "label": "Room Item",
        "description": "Pantry, cabinets, closet, sink, etc."
      },
      "generalInfo": {
        "label": "General Info",
        "description": "Trash schedule, WiFi info, house rules, etc."
      }
    },
    "buttons": {
      "continue": "Continue"
    }
  }
}
```

### 3.3 Component Modification Strategy

1. **Import the hook:** Add `import { useTranslations } from 'next-intl';`
2. **Initialize translations:** `const t = useTranslations('workflow');`
3. **Replace hardcoded strings:** Use `t()` function calls with appropriate keys
4. **Handle item type labels:** Create a translation lookup for item types using `t('itemTypes.{itemType}.label')` and `t('itemTypes.{itemType}.description')`

## 4. Ordered Task List

### Task 1: Update Translation Files (Prerequisite)
**Priority:** High
**Scope:** Translation file structure

Add the `workflow.steps.itemType` and `workflow.itemTypes` keys to all 6 translation files (`/messages/en.json`, `/messages/fr.json`, `/messages/es.json`, `/messages/de.json`, `/messages/nl.json`, `/messages/it.json`).

**Note:** If `workflow` namespace doesn't exist, create it. If it exists partially, extend it with `steps.itemType` and `itemTypes` keys.

### Task 2: Modify ItemTypeStep Component
**Priority:** High
**Scope:** Component internationalization

Update `ItemTypeStep.tsx` to:
1. Import `useTranslations` from `next-intl`
2. Initialize translation function with `workflow` namespace
3. Replace all hardcoded strings with translation function calls

### Task 3: Handle Item Type Label and Description Translation
**Priority:** High
**Scope:** Dynamic translation lookup

Replace the use of `ITEM_TYPE_LABELS[type]` and `ITEM_TYPE_DESCRIPTIONS[type]` constants with translated labels:
- Create a helper function or inline translation lookup
- Map item type keys to translation keys (handle hyphenated keys like `room-item` and `general-info`)

### Task 4: Update Test File
**Priority:** Medium
**Scope:** Test compatibility

Update `ItemTypeStep.test.tsx` to:
1. Mock `next-intl` properly
2. Update test assertions to work with translated strings
3. Consider testing translation key existence vs. actual text

### Task 5: Generate Non-English Translations
**Priority:** Medium
**Scope:** Translation content

Generate translations for all strings in the 5 non-English locales using the AI translation service.

### Task 6: Visual/Layout Testing
**Priority:** Medium
**Scope:** QA

Verify that:
- German translations (typically longer) don't break the item type card layout
- All languages display correctly on mobile and desktop
- Card heights remain consistent with varying description lengths

## 5. Authorized Files and Functions for Modification

### 5.1 Primary Files to Modify

| File | Type | Changes Required |
|------|------|------------------|
| `src/components/ItemCreationWorkflow/components/steps/ItemTypeStep.tsx` | Component | Add i18n imports, replace hardcoded strings |
| `messages/en.json` | Translation | Add workflow.steps.itemType and workflow.itemTypes keys |
| `messages/fr.json` | Translation | Add French translations |
| `messages/es.json` | Translation | Add Spanish translations |
| `messages/de.json` | Translation | Add German translations |
| `messages/nl.json` | Translation | Add Dutch translations |
| `messages/it.json` | Translation | Add Italian translations |

### 5.2 Functions/Sections to Modify

| File | Function/Section | Modification |
|------|------------------|--------------|
| `ItemTypeStep.tsx` | Import statements | Add `useTranslations` import |
| `ItemTypeStep.tsx` | `ItemTypeStep` function body | Add `const t = useTranslations('workflow');` |
| `ItemTypeStep.tsx` | JSX return (lines 96-103) | Replace heading and description with `t()` calls |
| `ItemTypeStep.tsx` | Radiogroup section (lines 106-126) | Replace ARIA label with `t()`, pass translated label/description to ItemTypeCard |
| `ItemTypeStep.tsx` | Screen reader help (lines 127-129) | Replace with `t()` call |
| `ItemTypeStep.tsx` | Continue button (lines 131-149) | Replace button text with `t()` call |

### 5.3 Test File Modifications

| File | Changes Required |
|------|------------------|
| `src/components/ItemCreationWorkflow/components/steps/__tests__/ItemTypeStep.test.tsx` | Add next-intl mock, update string assertions |

### 5.4 Optional/Future Files

| File | Consideration |
|------|---------------|
| `src/components/ItemCreationWorkflow/utils/constants.ts` | `ITEM_TYPE_LABELS` and `ITEM_TYPE_DESCRIPTIONS` could remain for fallback/debugging, or be deprecated |
| `src/components/ItemCreationWorkflow/components/shared/ItemTypeCard.tsx` | No changes needed - receives translated label and description as props |

## 6. Technical Specifications

### 6.1 Translation Key Mapping for Item Types

Since item types use hyphenated identifiers (e.g., `room-item`, `general-info`) but JSON keys should use camelCase:

```typescript
// Helper to convert item type to translation key
const getItemTypeTranslationKey = (itemType: string): string => {
  const keyMap: Record<string, string> = {
    'appliance': 'appliance',
    'room-item': 'roomItem',
    'general-info': 'generalInfo',
  };
  return keyMap[itemType] || itemType;
};

// Usage in component
const itemTypeLabel = t(`itemTypes.${getItemTypeTranslationKey(type)}.label`);
const itemTypeDescription = t(`itemTypes.${getItemTypeTranslationKey(type)}.description`);
```

### 6.2 Updated ItemTypeCard Usage

The ItemTypeCard component receives the translated label and description as props, so it doesn't need modification. The translation happens in ItemTypeStep:

```tsx
{ITEM_TYPES.map((type, index) => (
  <ItemTypeCard
    key={type}
    ref={(el) => { itemRefs.current[index] = el; }}
    itemType={type}
    label={t(`itemTypes.${getItemTypeTranslationKey(type)}.label`)}
    description={t(`itemTypes.${getItemTypeTranslationKey(type)}.description`)}
    icon={ITEM_TYPE_ICONS[type]}
    isSelected={currentItemType === type}
    onSelect={handleItemTypeSelect}
    tabIndex={index === activeIndex ? 0 : -1}
  />
))}
```

### 6.3 Component Architecture

The ItemTypeCard component already accepts `label` and `description` as props (lines 40-42 of ItemTypeCard.tsx), so the translation approach integrates seamlessly without modifying the shared component.

## 7. Dependencies

### 7.1 Prerequisites
- Epic 1 foundation complete (next-intl installed and configured) ✓
- `workflow` namespace structure defined in translation files

### 7.2 Blocks
- None - this task is independent within Phase 2C

### 7.3 Related Tasks
- Task 2C.2: Update main ItemCreationWorkflow component
- Task 2C.3: Update RoomSelectionStep (follows similar pattern)
- Task 2C.5: Update SpecificItemStep (follows similar pattern)

## 8. Acceptance Criteria

- [ ] ItemTypeStep imports `useTranslations` from `next-intl`
- [ ] Workflow namespace loaded using `useTranslations('workflow')`
- [ ] Step heading uses `workflow.steps.itemType.title`
- [ ] Step description uses `workflow.steps.itemType.description`
- [ ] All 3 item type labels use `workflow.itemTypes.*.label` translation keys
- [ ] All 3 item type descriptions use `workflow.itemTypes.*.description` translation keys
- [ ] Continue button uses `workflow.buttons.continue`
- [ ] ARIA label uses `workflow.steps.itemType.ariaLabel`
- [ ] Screen reader help text uses `workflow.steps.itemType.keyboardHelp`
- [ ] No hardcoded English strings remain in component JSX
- [ ] Component displays correctly in all 6 languages without layout breaks
- [ ] Keyboard navigation continues to work correctly (arrow keys, Enter/Space)
- [ ] Auto-advance on selection logic unchanged
- [ ] Card heights remain consistent across all languages
- [ ] Icon alignment remains consistent regardless of label length variations
- [ ] Hover and focus states continue to function correctly
- [ ] Console shows no missing translation warnings in English
- [ ] Tests pass or are updated appropriately

## 9. Estimated Effort

| Task | Estimate |
|------|----------|
| Update translation files (en.json) | 15 min |
| Modify ItemTypeStep component | 25 min |
| Generate 5 non-English translations | 20 min |
| Update test file | 25 min |
| Visual/layout testing | 20 min |
| **Total** | ~1.75 hours |

## 10. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| German descriptions cause card height inconsistency | Medium | Low | Test with German locale; cards use flex layout with consistent min-height |
| Translation key typos | Low | Medium | TypeScript path checking if enabled; test coverage |
| Missing translation warnings | Low | Low | next-intl falls back to key name; console warns in dev |
| Test failures from string changes | Medium | Low | Mock translations in tests |
| Description text overflow | Low | Low | CSS already handles text overflow; test with longest translations |

## 11. References

- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [Request Definition](/docs/gen_requests_epic2.md#REQ-374)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Component Source](/src/components/ItemCreationWorkflow/components/steps/ItemTypeStep.tsx)
- [ItemTypeCard Source](/src/components/ItemCreationWorkflow/components/shared/ItemTypeCard.tsx)
- [Constants Source](/src/components/ItemCreationWorkflow/utils/constants.ts)
- [Existing Pattern: LogoutButton.tsx](/src/components/LogoutButton.tsx)
- [Related Task: REQ-373 RoomSelectionStep](/docs/REQ-373-update-roomselectionstep-overview.md)

---

*Document generated for FAQBNB Localization Epic 2 - Static UI Translation*
