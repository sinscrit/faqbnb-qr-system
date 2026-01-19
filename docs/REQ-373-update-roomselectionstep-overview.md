# REQ-373: Update RoomSelectionStep Component for Internationalization

**Last Modified:** 2026-01-19 14:30 UTC
**Document Type:** Implementation Breakdown (Overview)
**Epic:** Epic 2: Static UI Localization
**Phase:** Phase 2C (Item Creation Workflow)
**Task:** 2C.3 - Update RoomSelectionStep component
**Request Size:** M (Medium)

---

## 1. Summary

This document provides the implementation breakdown for internationalizing the `RoomSelectionStep` component, which is Step 1 of the Item Creation Workflow. The component must be refactored to use the `useTranslations` hook from `next-intl` for all user-facing strings, enabling the room selection interface to display in all 6 supported languages (English, French, Spanish, German, Dutch, Italian).

## 2. Current State Analysis

### 2.1 Component Location
- **Primary File:** `src/components/ItemCreationWorkflow/components/steps/RoomSelectionStep.tsx`
- **Supporting Files:**
  - `src/components/ItemCreationWorkflow/components/shared/RoomCard.tsx`
  - `src/components/ItemCreationWorkflow/utils/constants.ts`
  - `src/components/ItemCreationWorkflow/components/steps/__tests__/RoomSelectionStep.test.tsx`

### 2.2 Current Hardcoded Strings

The component currently contains the following hardcoded English strings:

| String | Location | Purpose |
|--------|----------|---------|
| `"Select a Room"` | Line 142 | Step heading |
| `"Choose where this item is located in your property"` | Line 145 | Step description |
| `"Select a room for your item"` | Line 152 | ARIA label for radiogroup |
| `"Use arrow keys to navigate between rooms. Press Enter or Space to select."` | Line 171 | Screen reader help text |
| `"Enter room name"` | Line 181 | Custom input label |
| `"e.g., Home Office, Wine Cellar, Mudroom"` | Line 188 | Custom input placeholder |
| `"Maximum 50 characters"` | Line 200 | Character limit hint |
| `"Continue"` | Line 222 | Button label |

### 2.3 Constants Requiring Translation

From `constants.ts`, the `ROOM_LABELS` object contains 9 hardcoded labels:

| Room Type | Current Label |
|-----------|---------------|
| `kitchen` | Kitchen |
| `laundry` | Laundry Room |
| `bedroom` | Bedroom |
| `bathroom` | Bathroom |
| `living-room` | Living Room |
| `garage` | Garage |
| `outdoor` | Outdoor/Patio |
| `general` | General/Whole Property |
| `other` | Other |

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

Following the implementation plan, this component will use the `workflow` namespace. The translation keys will follow the pattern `workflow.steps.roomSelection.*`.

### 3.2 Required Translation Keys

Add to `/messages/en.json` under the `workflow` namespace:

```json
{
  "workflow": {
    "steps": {
      "roomSelection": {
        "title": "Select a Room",
        "description": "Choose where this item is located in your property",
        "ariaLabel": "Select a room for your item",
        "keyboardHelp": "Use arrow keys to navigate between rooms. Press Enter or Space to select."
      }
    },
    "rooms": {
      "kitchen": "Kitchen",
      "laundry": "Laundry Room",
      "bedroom": "Bedroom",
      "bathroom": "Bathroom",
      "livingRoom": "Living Room",
      "garage": "Garage",
      "outdoor": "Outdoor/Patio",
      "general": "General/Whole Property",
      "other": "Other"
    },
    "forms": {
      "customRoom": {
        "label": "Enter room name",
        "placeholder": "e.g., Home Office, Wine Cellar, Mudroom",
        "maxLength": "Maximum {max} characters"
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
4. **Handle room labels:** Create a translation lookup for room types using `t('rooms.{roomType}')`

## 4. Ordered Task List

### Task 1: Update Translation Files (Prerequisite)
**Priority:** High
**Scope:** Translation file structure

Add the `workflow` namespace structure to all 6 translation files (`/messages/en.json`, `/messages/fr.json`, `/messages/es.json`, `/messages/de.json`, `/messages/nl.json`, `/messages/it.json`).

**Note:** If `workflow` namespace doesn't exist, create it. If it exists partially, extend it with `steps.roomSelection` keys.

### Task 2: Modify RoomSelectionStep Component
**Priority:** High
**Scope:** Component internationalization

Update `RoomSelectionStep.tsx` to:
1. Import `useTranslations` from `next-intl`
2. Initialize translation function with `workflow` namespace
3. Replace all hardcoded strings with translation function calls

### Task 3: Handle Room Label Translation
**Priority:** High
**Scope:** Dynamic translation lookup

Replace the use of `ROOM_LABELS[room]` constant with translated labels:
- Create a helper function or inline translation lookup
- Map room type keys to translation keys (handle hyphenated keys like `living-room`)

### Task 4: Update Test File
**Priority:** Medium
**Scope:** Test compatibility

Update `RoomSelectionStep.test.tsx` to:
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
- German translations (typically longer) don't break the room grid layout
- All languages display correctly on mobile and desktop
- Custom room input accommodates translated placeholder text

## 5. Authorized Files and Functions for Modification

### 5.1 Primary Files to Modify

| File | Type | Changes Required |
|------|------|------------------|
| `src/components/ItemCreationWorkflow/components/steps/RoomSelectionStep.tsx` | Component | Add i18n imports, replace hardcoded strings |
| `messages/en.json` | Translation | Add workflow.steps.roomSelection keys |
| `messages/fr.json` | Translation | Add French translations |
| `messages/es.json` | Translation | Add Spanish translations |
| `messages/de.json` | Translation | Add German translations |
| `messages/nl.json` | Translation | Add Dutch translations |
| `messages/it.json` | Translation | Add Italian translations |

### 5.2 Functions/Sections to Modify

| File | Function/Section | Modification |
|------|------------------|--------------|
| `RoomSelectionStep.tsx` | Import statements | Add `useTranslations` import |
| `RoomSelectionStep.tsx` | `RoomSelectionStep` function body | Add `const t = useTranslations('workflow');` |
| `RoomSelectionStep.tsx` | JSX return (lines 141-147) | Replace heading and description with `t()` calls |
| `RoomSelectionStep.tsx` | Room grid section (lines 150-169) | Replace ARIA label with `t()`, pass translated label to RoomCard |
| `RoomSelectionStep.tsx` | Screen reader help (lines 170-172) | Replace with `t()` call |
| `RoomSelectionStep.tsx` | Custom input section (lines 175-203) | Replace label, placeholder, hint with `t()` calls |
| `RoomSelectionStep.tsx` | Continue button (lines 207-224) | Replace button text with `t()` call |

### 5.3 Test File Modifications

| File | Changes Required |
|------|------------------|
| `src/components/ItemCreationWorkflow/components/steps/__tests__/RoomSelectionStep.test.tsx` | Add next-intl mock, update string assertions |

### 5.4 Optional/Future Files

| File | Consideration |
|------|---------------|
| `src/components/ItemCreationWorkflow/utils/constants.ts` | `ROOM_LABELS` could remain for fallback/debugging, or be deprecated |
| `src/components/ItemCreationWorkflow/components/shared/RoomCard.tsx` | No changes needed - receives translated label as prop |

## 6. Technical Specifications

### 6.1 Translation Key Mapping for Room Types

Since room types use hyphenated identifiers (e.g., `living-room`) but JSON keys should use camelCase:

```typescript
// Helper to convert room type to translation key
const getRoomTranslationKey = (room: string): string => {
  const keyMap: Record<string, string> = {
    'kitchen': 'kitchen',
    'laundry': 'laundry',
    'bedroom': 'bedroom',
    'bathroom': 'bathroom',
    'living-room': 'livingRoom',
    'garage': 'garage',
    'outdoor': 'outdoor',
    'general': 'general',
    'other': 'other',
  };
  return keyMap[room] || room;
};

// Usage in component
const roomLabel = t(`rooms.${getRoomTranslationKey(room)}`);
```

### 6.2 Dynamic Interpolation

For the character limit hint, use ICU message format interpolation:

```typescript
// Translation key
"forms.customRoom.maxLength": "Maximum {max} characters"

// Usage
t('forms.customRoom.maxLength', { max: 50 })
```

### 6.3 Component Architecture

The RoomCard component receives the translated label as a prop, so it doesn't need modification. The translation happens in RoomSelectionStep:

```tsx
<RoomCard
  key={room}
  room={room}
  label={t(`rooms.${getRoomTranslationKey(room)}`)}  // Translated
  icon={ROOM_ICONS[room]}  // Icons are language-independent
  // ... other props
/>
```

## 7. Dependencies

### 7.1 Prerequisites
- Epic 1 foundation complete (next-intl installed and configured) ✓
- `workflow` namespace structure defined in translation files

### 7.2 Blocks
- None - this task is independent within Phase 2C

### 7.3 Related Tasks
- Task 2C.2: Update main ItemCreationWorkflow component
- Task 2C.4: Update ItemTypeStep (follows similar pattern)

## 8. Acceptance Criteria

- [ ] RoomSelectionStep imports `useTranslations` from `next-intl`
- [ ] Workflow namespace loaded using `useTranslations('workflow')`
- [ ] Step heading uses `workflow.steps.roomSelection.title`
- [ ] Step description uses `workflow.steps.roomSelection.description`
- [ ] All 9 room labels use `workflow.rooms.*` translation keys
- [ ] Custom room input label uses translated string
- [ ] Custom room placeholder uses locale-appropriate examples
- [ ] Character limit hint uses interpolated translation with `{max}` variable
- [ ] Continue button uses `workflow.buttons.continue`
- [ ] ARIA label uses `workflow.steps.roomSelection.ariaLabel`
- [ ] Screen reader help text uses `workflow.steps.roomSelection.keyboardHelp`
- [ ] No hardcoded English strings remain in component JSX
- [ ] Component displays correctly in all 6 languages without layout breaks
- [ ] Keyboard navigation continues to work correctly
- [ ] Auto-advance logic unchanged
- [ ] Custom room name validation unchanged
- [ ] Console shows no missing translation warnings in English
- [ ] Tests pass or are updated appropriately

## 9. Estimated Effort

| Task | Estimate |
|------|----------|
| Update translation files (en.json) | 15 min |
| Modify RoomSelectionStep component | 30 min |
| Generate 5 non-English translations | 20 min |
| Update test file | 30 min |
| Visual/layout testing | 20 min |
| **Total** | ~2 hours |

## 10. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| German text causes grid overflow | Medium | Low | Test with German locale; grid uses responsive columns |
| Translation key typos | Low | Medium | TypeScript path checking if enabled; test coverage |
| Missing translation warnings | Low | Low | next-intl falls back to key name; console warns in dev |
| Test failures from string changes | Medium | Low | Mock translations in tests |

## 11. References

- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [Request Definition](/docs/gen_requests_epic2.md#REQ-373)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Component Source](/src/components/ItemCreationWorkflow/components/steps/RoomSelectionStep.tsx)
- [Existing Pattern: LogoutButton.tsx](/src/components/LogoutButton.tsx)

---

*Document generated for FAQBNB Localization Epic 2 - Static UI Translation*
