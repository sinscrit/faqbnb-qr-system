# Implementation Breakdown: REQ-E02-059 - Update ItemTypeStep Component

**Document Version:** 1.0
**Created:** 2026-01-20
**Last Modified:** 2026-01-20
**Request ID:** REQ-E02-059
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2C - Item Creation Workflow
**Task ID:** 2C.4
**Estimated Size:** M (Medium)

---

## Overview

This document provides the implementation breakdown for updating the `ItemTypeStep` component to use the i18n translation system. This component is Step 2 of the item creation workflow and allows users to select the category that best describes their item (Appliance, Room Item, or General Info).

The ItemTypeStep component contains:
- Step header text ("What type of item is this?")
- Instructional helper text ("Choose the category that best describes your item")
- Item type labels from `ITEM_TYPE_LABELS` constant (Appliance, Room Item, General Info)
- Item type descriptions from `ITEM_TYPE_DESCRIPTIONS` constant
- Accessibility labels for the radiogroup interface
- Keyboard navigation help text (screen reader only)
- Continue button text

**Note:** This task focuses on the ItemTypeStep component and its direct dependencies. The ItemTypeCard child component receives labels and descriptions as props; any internal strings in ItemTypeCard will be handled in Task 2C.11 (Shared Components).

---

## Dependencies

### Prerequisites (Epic 1 Foundation)
| Dependency | Location | Status |
|------------|----------|--------|
| next-intl package | `package.json` | Required |
| i18n config | `/src/lib/i18n/config.ts` | Complete |
| Translation files | `/messages/en.json` | Complete (base structure exists) |
| useTranslations hook | next-intl | Available |

### Prerequisites (Epic 2 - Prior Tasks)
| Dependency | Task | Status |
|------------|------|--------|
| `workflow` namespace structure | REQ-E02-056 (Task 2C.1) | Required - Must be complete |
| Main ItemCreationWorkflow updated | REQ-E02-057 (Task 2C.2) | Recommended - Establishes patterns |
| RoomSelectionStep updated | REQ-E02-058 (Task 2C.3) | Recommended - Similar pattern |

### Existing Patterns to Follow
- Translation file structure in `/messages/en.json` (common, auth, dashboard, workflow namespaces)
- Key naming convention: `{namespace}.{component/area}.{element}.{variant?}`
- ICU message format for pluralization
- Client component pattern using `useTranslations` hook
- Room label translation pattern established in REQ-E02-058

---

## Technical Context

### Current State Analysis

The `ItemTypeStep.tsx` component (located at `/src/components/ItemCreationWorkflow/components/steps/ItemTypeStep.tsx`) is a client component (`'use client'`) that renders the second step of the item creation workflow. It is auto-skipped when room is "General" (handled by the state machine).

#### Identified Hardcoded Strings in ItemTypeStep.tsx

| Line | Current String | Translation Key |
|------|----------------|-----------------|
| 97-98 | `"What type of item is this?"` | `workflow.steps.itemType.title` |
| 100-101 | `"Choose the category that best describes your item"` | `workflow.steps.itemType.subtitle` |
| 108 | `"Select item type"` (aria-label) | `workflow.steps.itemType.ariaLabel` |
| 127-128 | `"Use up and down arrow keys to navigate. Press Enter or Space to select."` | `workflow.steps.itemType.keyboardHelp` |
| 147 | `"Continue"` | `workflow.steps.itemType.continueButton` or `common.actions.continue` |

#### Hardcoded Item Type Labels in constants.ts

The `ITEM_TYPE_LABELS` constant in `/src/components/ItemCreationWorkflow/utils/constants.ts` contains:

| Item Type | Current Label | Translation Key |
|-----------|---------------|-----------------|
| `appliance` | `"Appliance"` | `workflow.itemTypes.appliance.label` |
| `room-item` | `"Room Item"` | `workflow.itemTypes.roomItem.label` |
| `general-info` | `"General Info"` | `workflow.itemTypes.generalInfo.label` |

#### Hardcoded Item Type Descriptions in constants.ts

The `ITEM_TYPE_DESCRIPTIONS` constant in `/src/components/ItemCreationWorkflow/utils/constants.ts` contains:

| Item Type | Current Description | Translation Key |
|-----------|---------------------|-----------------|
| `appliance` | `"Washer, dryer, stove, refrigerator, etc."` | `workflow.itemTypes.appliance.description` |
| `room-item` | `"Pantry, cabinets, closet, sink, etc."` | `workflow.itemTypes.roomItem.description` |
| `general-info` | `"Trash schedule, WiFi info, house rules, etc."` | `workflow.itemTypes.generalInfo.description` |

### Component Integration Points

```
ItemTypeStep.tsx
├── imports ITEM_TYPES, ITEM_TYPE_LABELS, ITEM_TYPE_DESCRIPTIONS from ../../utils/constants
├── imports ItemTypeCard, ITEM_TYPE_ICONS from ../shared
├── passes label={ITEM_TYPE_LABELS[type]} to ItemTypeCard
├── passes description={ITEM_TYPE_DESCRIPTIONS[type]} to ItemTypeCard
├── contains radiogroup with aria-label
├── contains sr-only help text for keyboard navigation
└── contains Continue button
```

### ItemTypeCard Component (Reference)

The `ItemTypeCard` component at `/src/components/ItemCreationWorkflow/components/shared/ItemTypeCard.tsx` accepts:
- `label: string` - Human-readable item type label (passed from parent)
- `description: string` - Description/examples for this item type (passed from parent)
- `aria-describedby` - Points to description element using itemType-based ID

No internal hardcoded strings exist in ItemTypeCard that need translation in this task; all text comes from props.

---

## Implementation Tasks

### Task 1: Add useTranslations Hook to ItemTypeStep Component
**Priority:** Critical
**Estimate:** 0.25 story points

Add the `useTranslations` hook import and initialization at the component level.

**Implementation:**
```typescript
// Add import at top of file
import { useTranslations } from 'next-intl';

// Inside ItemTypeStep component, before state declarations
export function ItemTypeStep({...props}: ItemTypeStepProps) {
  const t = useTranslations('workflow.steps.itemType');
  const tItemTypes = useTranslations('workflow.itemTypes');

  // ... rest of component
}
```

**Acceptance Criteria:**
- [ ] Import statement added for useTranslations from 'next-intl'
- [ ] Hook initialized at component scope with 'workflow.steps.itemType' namespace
- [ ] Second hook initialized for item type translations with 'workflow.itemTypes' namespace
- [ ] No re-initialization on every render (hooks called at component level, not in callbacks)

### Task 2: Update Step Header Text
**Priority:** High
**Estimate:** 0.25 story points

Replace the hardcoded step header and subtitle text with translation keys.

**Current Code (Lines 94-103):**
```tsx
{/* Step header */}
<div className="mb-6">
  <h2 className="text-2xl font-semibold text-[#222222] mb-2">
    What type of item is this?
  </h2>
  <p className="text-base text-[#717171]">
    Choose the category that best describes your item
  </p>
</div>
```

**Updated Code:**
```tsx
{/* Step header */}
<div className="mb-6">
  <h2 className="text-2xl font-semibold text-[#222222] mb-2">
    {t('title')}
  </h2>
  <p className="text-base text-[#717171]">
    {t('subtitle')}
  </p>
</div>
```

**Acceptance Criteria:**
- [ ] Step title uses translation key `workflow.steps.itemType.title`
- [ ] Step subtitle uses translation key `workflow.steps.itemType.subtitle`
- [ ] Header maintains existing styling and structure

### Task 3: Update Accessibility Strings
**Priority:** High
**Estimate:** 0.25 story points

Replace hardcoded accessibility strings with translation keys.

**Current Code (Lines 105-129):**
```tsx
{/* Item type cards */}
<div
  role="radiogroup"
  aria-label="Select item type"
  aria-describedby="item-type-help"
  className="flex flex-col gap-4"
  onKeyDown={handleListKeyDown}
>
  {/* ItemTypeCard mapping */}
</div>
<p id="item-type-help" className="sr-only">
  Use up and down arrow keys to navigate. Press Enter or Space to select.
</p>
```

**Updated Code:**
```tsx
{/* Item type cards */}
<div
  role="radiogroup"
  aria-label={t('ariaLabel')}
  aria-describedby="item-type-help"
  className="flex flex-col gap-4"
  onKeyDown={handleListKeyDown}
>
  {/* ItemTypeCard mapping */}
</div>
<p id="item-type-help" className="sr-only">
  {t('keyboardHelp')}
</p>
```

**Acceptance Criteria:**
- [ ] Radiogroup aria-label uses translation key
- [ ] Keyboard navigation help text uses translation key
- [ ] Screen reader accessibility preserved in all languages

### Task 4: Create Translated Item Type Labels and Descriptions
**Priority:** Critical
**Estimate:** 0.5 story points

Create a mechanism to get translated item type labels and descriptions. The translation system needs to handle hyphenated keys (`room-item`, `general-info`) mapping to camelCase JSON keys.

**Implementation Approach - Create Helper Function:**
```typescript
// Helper function to map item type to translation key
const getItemTypeKey = (type: string): string => {
  const keyMap: Record<string, string> = {
    'room-item': 'roomItem',
    'general-info': 'generalInfo',
  };
  return keyMap[type] || type;
};

// In component, update the map:
{ITEM_TYPES.map((type, index) => {
  const typeKey = getItemTypeKey(type);
  return (
    <ItemTypeCard
      key={type}
      ref={(el) => { itemRefs.current[index] = el; }}
      itemType={type}
      label={tItemTypes(`${typeKey}.label`)}
      description={tItemTypes(`${typeKey}.description`)}
      icon={ITEM_TYPE_ICONS[type]}
      isSelected={currentItemType === type}
      onSelect={handleItemTypeSelect}
      tabIndex={index === activeIndex ? 0 : -1}
    />
  );
})}
```

**Alternative Inline Approach:**
```tsx
{ITEM_TYPES.map((type, index) => (
  <ItemTypeCard
    key={type}
    ref={(el) => { itemRefs.current[index] = el; }}
    itemType={type}
    label={tItemTypes(type === 'room-item' ? 'roomItem.label' : type === 'general-info' ? 'generalInfo.label' : `${type}.label`)}
    description={tItemTypes(type === 'room-item' ? 'roomItem.description' : type === 'general-info' ? 'generalInfo.description' : `${type}.description`)}
    icon={ITEM_TYPE_ICONS[type]}
    isSelected={currentItemType === type}
    onSelect={handleItemTypeSelect}
    tabIndex={index === activeIndex ? 0 : -1}
  />
))}
```

**Important Note on Description Examples:**
The description texts contain locale-specific examples (appliance examples, room item examples). These should be translated to culturally appropriate examples in each language. For example:
- English: "Washer, dryer, stove, refrigerator, etc."
- French: "Machine a laver, seche-linge, cuisiniere, refrigerateur, etc."
- German: "Waschmaschine, Trockner, Herd, Kuhlschrank, usw."

**Acceptance Criteria:**
- [ ] All 3 item type labels use translation keys
- [ ] All 3 item type descriptions use translation keys
- [ ] Translation key naming handles hyphenated types appropriately
- [ ] ItemTypeCard receives translated labels and descriptions as props
- [ ] Fallback to English if translation missing
- [ ] Examples in descriptions are culturally appropriate for each language

### Task 5: Update Continue Button
**Priority:** High
**Estimate:** 0.25 story points

Replace the hardcoded Continue button text.

**Current Code (Lines 131-149):**
```tsx
{/* Continue button */}
<div className="mt-8 pt-6 border-t border-gray-200">
  <button
    type="button"
    onClick={handleContinue}
    disabled={!canNext}
    className={cn(...)}
    aria-disabled={!canNext}
  >
    Continue
  </button>
</div>
```

**Updated Code:**
```tsx
{/* Continue button */}
<div className="mt-8 pt-6 border-t border-gray-200">
  <button
    type="button"
    onClick={handleContinue}
    disabled={!canNext}
    className={cn(...)}
    aria-disabled={!canNext}
  >
    {t('continueButton')}
  </button>
</div>
```

**Alternative:** Use `common.actions.continue` if "Continue" is used consistently across the app:
```tsx
const tCommon = useTranslations('common.actions');
// ...
{tCommon('continue')}
```

**Acceptance Criteria:**
- [ ] Continue button uses translation key
- [ ] Button maintains existing functionality
- [ ] Consistent with other workflow step buttons (RoomSelectionStep pattern)

### Task 6: Ensure Translation Keys Exist in Messages File
**Priority:** Critical
**Estimate:** 0.25 story points

Verify that all required translation keys exist in `/messages/en.json` under the `workflow` namespace. Add any missing keys.

**Required Keys:**
```json
{
  "workflow": {
    "steps": {
      "itemType": {
        "title": "What type of item is this?",
        "subtitle": "Choose the category that best describes your item",
        "ariaLabel": "Select item type",
        "keyboardHelp": "Use up and down arrow keys to navigate. Press Enter or Space to select.",
        "continueButton": "Continue"
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
    }
  }
}
```

**Acceptance Criteria:**
- [ ] All required keys exist in `/messages/en.json`
- [ ] Item type labels and descriptions are in `workflow.itemTypes` namespace (reusable across components)
- [ ] JSON file validates without syntax errors
- [ ] Build completes without missing translation warnings

### Task 7: Remove Dependency on Hardcoded Constants for Display
**Priority:** Medium
**Estimate:** 0.25 story points

Update imports to no longer use `ITEM_TYPE_LABELS` and `ITEM_TYPE_DESCRIPTIONS` from constants.ts for UI display.

**Current Imports (Line 19):**
```typescript
import { ITEM_TYPES, ITEM_TYPE_LABELS, ITEM_TYPE_DESCRIPTIONS } from '../../utils/constants';
```

**Updated Imports:**
```typescript
import { ITEM_TYPES } from '../../utils/constants';
// ITEM_TYPE_LABELS and ITEM_TYPE_DESCRIPTIONS no longer needed for UI display
// Labels and descriptions now come from translations
```

**Note:** The `ITEM_TYPE_LABELS` and `ITEM_TYPE_DESCRIPTIONS` constants in `constants.ts` should be retained for:
- Backward compatibility
- Non-UI contexts (e.g., logging, analytics)
- Fallback scenarios

Add a deprecation comment in constants.ts if desired (separate task).

**Acceptance Criteria:**
- [ ] Component no longer imports ITEM_TYPE_LABELS for UI display
- [ ] Component no longer imports ITEM_TYPE_DESCRIPTIONS for UI display
- [ ] ITEM_TYPES constant is still imported (needed for iteration)
- [ ] Constants file remains unchanged (backward compatibility)

---

## Authorized Files and Functions for Modification

### Primary Files to Modify

| File | Purpose | Modification Type |
|------|---------|-------------------|
| `/src/components/ItemCreationWorkflow/components/steps/ItemTypeStep.tsx` | Item type selection step component | Add useTranslations hook, replace all hardcoded strings |
| `/messages/en.json` | English translations | Add workflow.steps.itemType and workflow.itemTypes keys |

### Functions to Modify

| Function/Section | File | Modification |
|------------------|------|--------------|
| `ItemTypeStep` component | ItemTypeStep.tsx | Add `useTranslations` hooks, use translation keys |
| Import statements | ItemTypeStep.tsx | Add useTranslations import, optionally remove label/description constant imports |
| Step header JSX | ItemTypeStep.tsx | Use `t('title')` and `t('subtitle')` |
| Radiogroup section | ItemTypeStep.tsx | Use translated aria-label and help text |
| Item type card mapping | ItemTypeStep.tsx | Use translated labels and descriptions from `tItemTypes()` |
| Continue button | ItemTypeStep.tsx | Use translated button text |

### Files for Reference Only (Not Modified in This Task)

| File | Purpose |
|------|---------|
| `/src/components/ItemCreationWorkflow/utils/constants.ts` | Contains ITEM_TYPE_LABELS, ITEM_TYPE_DESCRIPTIONS (may be deprecated for UI in favor of translations) |
| `/src/components/ItemCreationWorkflow/components/shared/ItemTypeCard.tsx` | Child component - receives label and description as props |
| `/src/lib/i18n/config.ts` | i18n configuration (read-only reference) |
| `/src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | Parent component (separate task) |
| `/src/components/ItemCreationWorkflow/components/steps/RoomSelectionStep.tsx` | Prior step - reference for patterns |

### Constants Consideration

The `ITEM_TYPE_LABELS` and `ITEM_TYPE_DESCRIPTIONS` constants in `constants.ts` contain English strings. After this task:
- Constants can remain for backward compatibility (default/fallback, non-UI contexts)
- Or can be deprecated if all consumers use translated labels
- Recommend keeping constants but documenting that UI should use translations
- Add comment like: `// @deprecated for UI display - use translations from workflow.itemTypes namespace`

---

## Verification Steps

### 1. Build Verification
```bash
npm run build
```
- Verify no TypeScript errors related to translation types
- Verify no missing translation key warnings

### 2. Runtime Verification
- Start development server: `npm run dev`
- Navigate to item creation workflow (Step 2 - Item Type Selection)
- Open browser console, verify no translation-related errors
- Verify all text displays correctly

### 3. Functional Testing
- Select each item type and verify labels and descriptions display correctly
- Verify item type icons still display
- Verify auto-advance behavior after selection still works
- Verify Continue button text and functionality
- Verify selection state (checkmark indicator) appears correctly

### 4. Accessibility Testing
- Use screen reader (VoiceOver/NVDA) to navigate item type cards
- Verify radiogroup aria-label is announced correctly
- Verify each item type's description is announced (via aria-describedby)
- Verify keyboard navigation help is announced
- Use keyboard to navigate (up/down arrows, Enter/Space to select)

### 5. Skip Behavior Verification
- Start workflow with "General/Whole Property" room selection
- Verify ItemTypeStep is correctly skipped
- Verify no translation errors in skip scenario

### 6. Language Switching Test
- Change browser language or use language switcher (if available)
- Verify all ItemTypeStep strings update
- Verify item type labels and descriptions update
- Verify no mixed-language content

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Missing dependency on REQ-E02-056 | Medium | High | Verify workflow namespace exists before starting |
| Item type key mismatch with ITEM_TYPES | Medium | Medium | Create mapping for hyphenated keys (room-item -> roomItem, general-info -> generalInfo) |
| Description examples not culturally appropriate | Medium | Low | Work with translators to provide locale-specific examples |
| ItemTypeCard not receiving translated props | Low | Medium | Verify prop passing works correctly |
| Multiple useTranslations hooks affecting performance | Low | Low | Hook calls are optimized by next-intl |
| Auto-advance timing affected by translations | Low | Low | Timing is in component logic, not affected by text |

---

## Notes for Implementation

### 1. Client Component Requirement
The `ItemTypeStep` component is marked with `'use client'`, which is compatible with the `useTranslations` hook from next-intl. No changes needed for server/client boundary.

### 2. Item Type Key Mapping
The item types `room-item` and `general-info` have hyphens, but JSON keys typically use camelCase. The translation key mapping needs to handle this:
- `room-item` (ITEM_TYPES constant) -> `roomItem` (translation key)
- `general-info` (ITEM_TYPES constant) -> `generalInfo` (translation key)
- `appliance` -> `appliance` (no change needed)

Consider creating a utility mapping:
```typescript
const ITEM_TYPE_KEY_MAP: Record<string, string> = {
  'room-item': 'roomItem',
  'general-info': 'generalInfo',
};
const getItemTypeKey = (type: string) => ITEM_TYPE_KEY_MAP[type] || type;
```

### 3. Reusable Item Type Translations
The item type labels and descriptions in `workflow.itemTypes` namespace should be reusable across components (SpecificItemStep, PreviewSaveStep, etc.). Keep them at the `workflow.itemTypes` level rather than nested under `steps.itemType`.

### 4. Description Localization
The descriptions contain culturally specific examples:
- "Washer, dryer, stove, refrigerator, etc." - common appliances
- "Pantry, cabinets, closet, sink, etc." - room items/fixtures
- "Trash schedule, WiFi info, house rules, etc." - general property info

Ensure translators provide equivalent examples for each locale that make sense in that culture.

### 5. Coordination with Constants
The `ITEM_TYPE_LABELS` and `ITEM_TYPE_DESCRIPTIONS` constants in `constants.ts` will become redundant for UI display. Options:
- Keep for backward compatibility and non-translated contexts
- Add deprecation comment pointing to translation usage
- Do not modify constants.ts in this task (separate cleanup task if needed)

### 6. Pattern Consistency with RoomSelectionStep
Follow the same patterns established in REQ-E02-058 (RoomSelectionStep):
- Dual useTranslations hooks (one for step-specific, one for reusable labels)
- Key mapping for hyphenated identifiers
- Keep constants for non-UI use

---

## Acceptance Criteria Summary

From the request document (REQ-E02-059):

- [ ] Step header text "What type of item is this?" is extracted to localization namespace
- [ ] Instructional text "Choose the category that best describes your item" is extracted to localization namespace
- [ ] Accessibility label "Select item type" for the item type selection interface is extracted to localization namespace
- [ ] Keyboard navigation help text "Use up and down arrow keys to navigate. Press Enter or Space to select." is extracted to localization namespace
- [ ] Item type label "Appliance" is extracted to localization namespace
- [ ] Item type label "Room Item" (from ITEM_TYPE_LABELS['room-item']) is extracted to localization namespace
- [ ] Item type label "General Info" (from ITEM_TYPE_LABELS['general-info']) is extracted to localization namespace
- [ ] Item type description "Washer, dryer, stove, refrigerator, etc." is extracted to localization namespace
- [ ] Item type description "Pantry, cabinets, closet, sink, etc." is extracted to localization namespace
- [ ] Item type description "Trash schedule, WiFi info, house rules, etc." is extracted to localization namespace
- [ ] Continue button text "Continue" is extracted to localization namespace
- [ ] Component uses appropriate i18n hooks to retrieve all translated strings
- [ ] All ARIA labels and accessibility strings are properly localized
- [ ] Component renders correctly with translations in all supported languages
- [ ] No hardcoded English strings remain in the component code
- [ ] Item type category translations use culturally appropriate terminology

---

## References

- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [REQ-E02-056: Create Workflow Namespace Structure](/docs/REQ-E02-056-create-workflow-namespace-structure-overview.md)
- [REQ-E02-057: Update Main ItemCreationWorkflow Component](/docs/REQ-E02-057-update-main-itemcreationworkflow-component-overview.md)
- [REQ-E02-058: Update RoomSelectionStep](/docs/REQ-E02-058-update-roomselectionstep-overview.md)
- [Request Documentation](/docs/gen_requests_epic2.md#REQ-E02-059)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)

---

*Document generated for FAQBNB Localization Epic 2 - Sub-Epic 2C: Item Creation Workflow*
