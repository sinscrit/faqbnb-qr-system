# Implementation Breakdown: REQ-E02-060 - Update SpecificItemStep Component

**Document Version:** 1.0
**Created:** 2026-01-20
**Last Modified:** 2026-01-20
**Request ID:** REQ-E02-060
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2C - Item Creation Workflow
**Task ID:** 2C.5
**Estimated Size:** S (Small)

---

## Overview

This document provides the implementation breakdown for updating the `SpecificItemStep` component to use the i18n translation system. This component is Step 3 of the item creation workflow and allows users to select or enter a specific item name from contextual suggestions.

The SpecificItemStep component contains:
- Step header text ("What specific item?")
- Instructional helper text with dynamic room label
- "Suggestions" section label
- "Other..." button label
- Custom item input label and placeholder
- Item name editor label and hint text (via ItemNameEditor child component)
- "Continue" button text
- Accessibility labels for the radiogroup interface

**Note:** This task focuses on the SpecificItemStep component. The ItemNameEditor, SuggestionButton, and DuplicateNameWarning child components have internal strings that will be handled in Task 2C.11 (Shared Components). However, this task will address any hardcoded strings passed as props to these components from SpecificItemStep.

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
| ItemTypeStep updated | REQ-E02-059 (Task 2C.4) | Recommended - Similar pattern |

### Existing Patterns to Follow
- Translation file structure in `/messages/en.json` (common, auth, dashboard, workflow namespaces)
- Key naming convention: `{namespace}.{component/area}.{element}.{variant?}`
- ICU message format for pluralization and interpolation
- Client component pattern using `useTranslations` hook
- Room label translation pattern established in REQ-E02-058

---

## Technical Context

### Current State Analysis

The `SpecificItemStep.tsx` component (located at `/src/components/ItemCreationWorkflow/components/steps/SpecificItemStep.tsx`) is a client component (`'use client'`) that renders the third step of the item creation workflow. It displays contextual item suggestions and allows custom item entry.

#### Identified Hardcoded Strings in SpecificItemStep.tsx

| Line | Current String | Translation Key |
|------|----------------|-----------------|
| 135-136 | `"What specific item?"` | `workflow.steps.specificItem.title` |
| 138-140 | `"Select from suggestions or enter a custom item for {roomLabel}"` | `workflow.steps.specificItem.subtitle` (with `{room}` interpolation) |
| 146-147 | `"Suggestions"` | `workflow.steps.specificItem.suggestionsLabel` |
| 151 | `"Select a specific item"` (aria-label) | `workflow.steps.specificItem.ariaLabel` |
| 164 | `"Other..."` | `workflow.steps.specificItem.other` |
| 180-181 | `"Enter custom item name"` / `"Enter item name"` | `workflow.steps.specificItem.customItemLabel` / `workflow.steps.specificItem.itemLabel` |
| 188 | `"e.g., Coffee Maker, Smart Thermostat"` (placeholder) | `workflow.steps.specificItem.customItemPlaceholder` |
| 209 | `"Enter item name"` (placeholder prop) | `workflow.steps.specificItem.itemNamePlaceholder` |
| 242 | `"Continue"` | `workflow.steps.specificItem.continueButton` or `common.actions.continue` |

#### Hardcoded Room Labels in constants.ts

The component uses `ROOM_LABELS[currentRoom]` from constants.ts for display. Room label translations should come from the `workflow.rooms` namespace established in REQ-E02-058.

### Component Integration Points

```
SpecificItemStep.tsx
├── imports ROOM_LABELS from ../../utils/constants
├── imports useSuggestions from ../../hooks
├── imports SuggestionButton, ItemNameEditor, DuplicateNameWarning from ../shared
├── uses ROOM_LABELS[currentRoom] for display (line 129)
├── passes label to SuggestionButton (suggestions are item names, not translated)
├── passes placeholder to ItemNameEditor (should be translated)
├── contains radiogroup with aria-label
├── contains "Suggestions" section header
├── contains "Other..." button
├── contains custom item input with label and placeholder
└── contains Continue button
```

### Child Component Considerations

1. **SuggestionButton** - Receives `label` prop which is the actual item suggestion name (e.g., "Coffee Maker", "Stove/Oven"). These are data values, not UI strings, so they remain untranslated. However, the "Created" status indicator inside SuggestionButton needs translation (handled in Task 2C.11).

2. **ItemNameEditor** - Has internal hardcoded strings:
   - "Item Name" label (line 69)
   - "Enter item name" default placeholder (line 48)
   - "This name will appear on the QR code label" hint (line 107)
   These will be handled in Task 2C.11, but SpecificItemStep can pass translated `placeholder` prop.

3. **DuplicateNameWarning** - Has internal hardcoded strings:
   - "Exact name already exists"
   - "Similar name already used"
   - "+X more..."
   These will be handled in Task 2C.11.

---

## Implementation Tasks

### Task 1: Add useTranslations Hook to SpecificItemStep Component
**Priority:** Critical
**Estimate:** 0.25 story points

Add the `useTranslations` hook import and initialization at the component level.

**Implementation:**
```typescript
// Add import at top of file
import { useTranslations } from 'next-intl';

// Inside SpecificItemStep component, before state declarations
export function SpecificItemStep({...props}: SpecificItemStepProps) {
  const t = useTranslations('workflow.steps.specificItem');
  const tRooms = useTranslations('workflow.rooms');

  // ... rest of component
}
```

**Acceptance Criteria:**
- [ ] Import statement added for useTranslations from 'next-intl'
- [ ] Hook initialized at component scope with 'workflow.steps.specificItem' namespace
- [ ] Second hook initialized for room label translations with 'workflow.rooms' namespace
- [ ] No re-initialization on every render (hooks called at component level, not in callbacks)

### Task 2: Update Step Header Text with Dynamic Room Label
**Priority:** High
**Estimate:** 0.25 story points

Replace the hardcoded step header and subtitle text with translation keys. The subtitle includes a dynamic room label that needs interpolation.

**Current Code (Lines 131-141):**
```tsx
{/* Step header */}
<div className="mb-6">
  <h2 className="text-2xl font-semibold text-[#222222] mb-2">
    What specific item?
  </h2>
  <p className="text-base text-[#717171]">
    Select from suggestions or enter a custom item for {roomLabel}
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
    {t('subtitle', { room: translatedRoomLabel })}
  </p>
</div>
```

**Update Room Label Translation (Line 129):**
```typescript
// Current
const roomLabel = ROOM_LABELS[currentRoom] || currentRoom;

// Updated - use translated room label
const translatedRoomLabel = tRooms(`${currentRoom}.label`, { fallback: ROOM_LABELS[currentRoom] || currentRoom });
```

**Note:** Room label translation keys follow the pattern from REQ-E02-058 (e.g., `workflow.rooms.kitchen.label`, `workflow.rooms.bathroom.label`).

**Acceptance Criteria:**
- [ ] Step title uses translation key `workflow.steps.specificItem.title`
- [ ] Step subtitle uses translation key with room interpolation `workflow.steps.specificItem.subtitle` with `{room}` variable
- [ ] Room label is translated using `workflow.rooms.{roomType}.label`
- [ ] Header maintains existing styling and structure
- [ ] Fallback to constant value if translation missing

### Task 3: Update Suggestions Section Label
**Priority:** High
**Estimate:** 0.25 story points

Replace the hardcoded "Suggestions" label and accessibility strings.

**Current Code (Lines 143-172):**
```tsx
{/* Suggestions section */}
{hasSuggestions && (
  <div className="mb-6">
    <h3 className="text-sm font-medium text-[#717171] mb-3 uppercase tracking-wide">
      Suggestions
    </h3>
    <div
      role="radiogroup"
      aria-label="Select a specific item"
      className="grid grid-cols-2 gap-3 sm:grid-cols-3"
    >
      {/* SuggestionButton mapping */}
      {/* "Other" option */}
      <SuggestionButton
        label="Other..."
        isSelected={isCustomMode}
        isCreated={false}
        onSelect={handleOtherClick}
      />
    </div>
  </div>
)}
```

**Updated Code:**
```tsx
{/* Suggestions section */}
{hasSuggestions && (
  <div className="mb-6">
    <h3 className="text-sm font-medium text-[#717171] mb-3 uppercase tracking-wide">
      {t('suggestionsLabel')}
    </h3>
    <div
      role="radiogroup"
      aria-label={t('ariaLabel')}
      className="grid grid-cols-2 gap-3 sm:grid-cols-3"
    >
      {/* SuggestionButton mapping - labels are data, not translated */}
      {/* "Other" option */}
      <SuggestionButton
        label={t('other')}
        isSelected={isCustomMode}
        isCreated={false}
        onSelect={handleOtherClick}
      />
    </div>
  </div>
)}
```

**Acceptance Criteria:**
- [ ] "Suggestions" section header uses translation key
- [ ] Radiogroup aria-label uses translation key
- [ ] "Other..." button label uses translation key
- [ ] Suggestion item labels (Coffee Maker, Stove, etc.) remain untranslated (they are data values)

### Task 4: Update Custom Item Input Section
**Priority:** High
**Estimate:** 0.25 story points

Replace the hardcoded custom item input label and placeholder.

**Current Code (Lines 174-201):**
```tsx
{/* Custom item input (shown when "Other" selected or no suggestions) */}
{(isCustomMode || !hasSuggestions) && (
  <div className="mb-6">
    <label
      htmlFor="custom-item-input"
      className="block text-sm font-medium text-[#222222] mb-2"
    >
      {hasSuggestions ? 'Enter custom item name' : 'Enter item name'}
    </label>
    <input
      id="custom-item-input"
      type="text"
      value={customItemValue}
      onChange={handleCustomItemChange}
      placeholder="e.g., Coffee Maker, Smart Thermostat"
      maxLength={50}
      className={cn(...)}
      aria-required="true"
      autoFocus={isCustomMode}
    />
  </div>
)}
```

**Updated Code:**
```tsx
{/* Custom item input (shown when "Other" selected or no suggestions) */}
{(isCustomMode || !hasSuggestions) && (
  <div className="mb-6">
    <label
      htmlFor="custom-item-input"
      className="block text-sm font-medium text-[#222222] mb-2"
    >
      {hasSuggestions ? t('customItemLabel') : t('itemLabel')}
    </label>
    <input
      id="custom-item-input"
      type="text"
      value={customItemValue}
      onChange={handleCustomItemChange}
      placeholder={t('customItemPlaceholder')}
      maxLength={50}
      className={cn(...)}
      aria-required="true"
      autoFocus={isCustomMode}
    />
  </div>
)}
```

**Acceptance Criteria:**
- [ ] Custom item label uses conditional translation keys
- [ ] Input placeholder uses translation key
- [ ] Placeholder examples are culturally appropriate for each language

### Task 5: Update ItemNameEditor Placeholder Prop
**Priority:** Medium
**Estimate:** 0.25 story points

Pass a translated placeholder to the ItemNameEditor component.

**Current Code (Lines 203-211):**
```tsx
{currentSpecificItem && (
  <div className="mb-6">
    <ItemNameEditor
      value={currentItemName}
      onChange={onSetItemName}
      placeholder="Enter item name"
      maxLength={100}
    />
    {/* ... DuplicateNameWarning */}
  </div>
)}
```

**Updated Code:**
```tsx
{currentSpecificItem && (
  <div className="mb-6">
    <ItemNameEditor
      value={currentItemName}
      onChange={onSetItemName}
      placeholder={t('itemNamePlaceholder')}
      maxLength={100}
    />
    {/* ... DuplicateNameWarning */}
  </div>
)}
```

**Note:** The ItemNameEditor's internal label ("Item Name") and hint text ("This name will appear on the QR code label") will be translated in Task 2C.11 when shared components are updated.

**Acceptance Criteria:**
- [ ] ItemNameEditor receives translated placeholder prop
- [ ] Placeholder displays correctly in all languages

### Task 6: Update Continue Button
**Priority:** High
**Estimate:** 0.25 story points

Replace the hardcoded Continue button text.

**Current Code (Lines 226-244):**
```tsx
{/* Continue button */}
<div className="mt-auto pt-6 border-t border-gray-200">
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
<div className="mt-auto pt-6 border-t border-gray-200">
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

**Alternative:** Use `common.actions.continue` for consistency across the app.

**Acceptance Criteria:**
- [ ] Continue button uses translation key
- [ ] Button maintains existing functionality
- [ ] Consistent with other workflow step buttons

### Task 7: Ensure Translation Keys Exist in Messages File
**Priority:** Critical
**Estimate:** 0.25 story points

Verify that all required translation keys exist in `/messages/en.json` under the `workflow` namespace. Add any missing keys.

**Required Keys:**
```json
{
  "workflow": {
    "steps": {
      "specificItem": {
        "title": "What specific item?",
        "subtitle": "Select from suggestions or enter a custom item for {room}",
        "suggestionsLabel": "Suggestions",
        "ariaLabel": "Select a specific item",
        "other": "Other...",
        "customItemLabel": "Enter custom item name",
        "itemLabel": "Enter item name",
        "customItemPlaceholder": "e.g., Coffee Maker, Smart Thermostat",
        "itemNamePlaceholder": "Enter item name",
        "continueButton": "Continue"
      }
    }
  }
}
```

**Note:** Room label translations should already exist in `workflow.rooms` namespace from REQ-E02-058.

**Acceptance Criteria:**
- [ ] All required keys exist in `/messages/en.json`
- [ ] Keys follow established naming convention
- [ ] JSON file validates without syntax errors
- [ ] Build completes without missing translation warnings

### Task 8: Remove/Update ROOM_LABELS Dependency for Display
**Priority:** Low
**Estimate:** 0.25 story points

Update the room label lookup to use translations as primary source with ROOM_LABELS as fallback.

**Current Import (Line 20):**
```typescript
import { ROOM_LABELS } from '../../utils/constants';
```

**Current Usage (Line 129):**
```typescript
const roomLabel = ROOM_LABELS[currentRoom] || currentRoom;
```

**Updated Usage:**
```typescript
// Keep ROOM_LABELS import for fallback
// Use translation with fallback to constant
const getRoomLabel = (room: RoomType): string => {
  try {
    return tRooms(`${room}.label`);
  } catch {
    return ROOM_LABELS[room] || room;
  }
};

const translatedRoomLabel = getRoomLabel(currentRoom);
```

**Alternative simpler approach:**
```typescript
// If room translation exists, use it; otherwise fall back to constant
const translatedRoomLabel = tRooms.has(`${currentRoom}.label`)
  ? tRooms(`${currentRoom}.label`)
  : (ROOM_LABELS[currentRoom] || currentRoom);
```

**Note:** Keep ROOM_LABELS import for fallback scenarios and non-UI contexts.

**Acceptance Criteria:**
- [ ] Room labels display using translations when available
- [ ] Fallback to ROOM_LABELS constant if translation missing
- [ ] No errors when translation key doesn't exist

---

## Authorized Files and Functions for Modification

### Primary Files to Modify

| File | Purpose | Modification Type |
|------|---------|-------------------|
| `/src/components/ItemCreationWorkflow/components/steps/SpecificItemStep.tsx` | Specific item selection step component | Add useTranslations hook, replace all hardcoded strings |
| `/messages/en.json` | English translations | Add workflow.steps.specificItem keys |

### Functions to Modify

| Function/Section | File | Modification |
|------------------|------|--------------|
| `SpecificItemStep` component | SpecificItemStep.tsx | Add `useTranslations` hooks, use translation keys |
| Import statements | SpecificItemStep.tsx | Add useTranslations import |
| Room label lookup (line 129) | SpecificItemStep.tsx | Use translated room label with fallback |
| Step header JSX | SpecificItemStep.tsx | Use `t('title')` and `t('subtitle', { room })` |
| Suggestions section | SpecificItemStep.tsx | Use translated section label, aria-label, and "Other..." |
| Custom item input | SpecificItemStep.tsx | Use translated label and placeholder |
| ItemNameEditor props | SpecificItemStep.tsx | Pass translated placeholder |
| Continue button | SpecificItemStep.tsx | Use translated button text |

### Files for Reference Only (Not Modified in This Task)

| File | Purpose |
|------|---------|
| `/src/components/ItemCreationWorkflow/utils/constants.ts` | Contains ROOM_LABELS (keep for fallback) |
| `/src/components/ItemCreationWorkflow/components/shared/SuggestionButton.tsx` | Child component - has "Created" text (Task 2C.11) |
| `/src/components/ItemCreationWorkflow/components/shared/ItemNameEditor.tsx` | Child component - has internal strings (Task 2C.11) |
| `/src/components/ItemCreationWorkflow/components/shared/DuplicateNameWarning.tsx` | Child component - has internal strings (Task 2C.11) |
| `/src/lib/i18n/config.ts` | i18n configuration (read-only reference) |
| `/src/components/ItemCreationWorkflow/components/steps/ItemTypeStep.tsx` | Prior step - reference for patterns |
| `/src/components/ItemCreationWorkflow/components/steps/RoomSelectionStep.tsx` | Prior step - reference for room label pattern |

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
- Navigate to item creation workflow (Step 3 - Specific Item Selection)
- Open browser console, verify no translation-related errors
- Verify all text displays correctly

### 3. Functional Testing
- Select different rooms in Step 1 and verify room label displays correctly in Step 3 subtitle
- Click on suggestion buttons and verify selection works
- Click "Other..." and verify custom input appears with translated label/placeholder
- Enter a custom item name and verify ItemNameEditor displays correctly
- Verify Continue button text and functionality
- Verify auto-advance behavior after suggestion selection still works

### 4. Accessibility Testing
- Use screen reader (VoiceOver/NVDA) to navigate suggestion buttons
- Verify radiogroup aria-label is announced correctly
- Verify custom input label is announced
- Use keyboard to navigate (Tab, Enter/Space to select)

### 5. Edge Case Testing
- Test with room type that has no suggestions (verify "Enter item name" label displays)
- Test with room type that has suggestions (verify "Enter custom item name" label displays after clicking Other)
- Test duplicate name warning still appears (DuplicateNameWarning component)

### 6. Language Switching Test
- Change browser language or use language switcher (if available)
- Verify all SpecificItemStep strings update
- Verify room label updates in subtitle
- Verify no mixed-language content

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Missing dependency on REQ-E02-056 | Medium | High | Verify workflow namespace exists before starting |
| Room label translation key mismatch | Medium | Medium | Follow exact key pattern from REQ-E02-058 |
| Child component strings not translated | Expected | Low | Document that shared components handled in Task 2C.11 |
| Placeholder examples not culturally appropriate | Medium | Low | Work with translators to provide locale-specific examples |
| Subtitle interpolation syntax error | Low | Medium | Test with multiple room types |

---

## Notes for Implementation

### 1. Client Component Requirement
The `SpecificItemStep` component is marked with `'use client'`, which is compatible with the `useTranslations` hook from next-intl. No changes needed for server/client boundary.

### 2. Dynamic Subtitle with Room Name
The subtitle "Select from suggestions or enter a custom item for {roomLabel}" requires ICU interpolation:
```json
"subtitle": "Select from suggestions or enter a custom item for {room}"
```
Usage: `t('subtitle', { room: translatedRoomLabel })`

### 3. Suggestion Labels Are Data, Not UI Strings
The suggestion button labels (e.g., "Coffee Maker", "Stove/Oven", "Microwave") come from the `useSuggestions` hook based on room and item type. These are actual item names/data, not UI strings, so they should NOT be translated. Only the "Other..." button label needs translation.

### 4. Child Components with Internal Strings
The following child components have internal hardcoded strings that will be addressed in Task 2C.11:
- **SuggestionButton**: "Created" status text (line 96)
- **ItemNameEditor**: "Item Name" label, default placeholder, hint text
- **DuplicateNameWarning**: "Exact name already exists", "Similar name already used", "+X more..."

For now, only pass translated props where the component accepts them (e.g., `placeholder` prop for ItemNameEditor).

### 5. Placeholder Examples Localization
The placeholder "e.g., Coffee Maker, Smart Thermostat" contains example items. Ensure translators provide equivalent examples that make sense in each locale:
- English: "e.g., Coffee Maker, Smart Thermostat"
- French: "ex: Cafetiere, Thermostat intelligent"
- German: "z.B. Kaffeemaschine, Smart-Thermostat"
- Spanish: "ej: Cafetera, Termostato inteligente"

### 6. Coordination with Prior Tasks
Follow the same patterns established in:
- REQ-E02-058 (RoomSelectionStep) - Room label translation pattern
- REQ-E02-059 (ItemTypeStep) - Dual useTranslations hooks pattern

---

## Acceptance Criteria Summary

From the request document (REQ-E02-060):

- [ ] All hardcoded text strings in SpecificItemStep component are identified and extracted
- [ ] Translation keys are added to the workflow namespace following the established naming convention
- [ ] Component imports and uses next-intl's useTranslations hook
- [ ] All UI elements (labels, buttons, placeholders, hints, error messages) display translated text
- [ ] Component renders correctly with translation keys in place
- [ ] No English-only fallback text remains visible in the component

### Detailed Criteria:
- [ ] Step header "What specific item?" uses translation key
- [ ] Step subtitle with room name interpolation uses translation key
- [ ] "Suggestions" section label uses translation key
- [ ] Radiogroup aria-label uses translation key
- [ ] "Other..." button label uses translation key
- [ ] Custom item input label (conditional) uses translation keys
- [ ] Custom item input placeholder uses translation key
- [ ] ItemNameEditor placeholder prop is translated
- [ ] Continue button uses translation key
- [ ] Room label in subtitle is translated using workflow.rooms namespace
- [ ] Suggestion item names remain untranslated (they are data values)

---

## References

- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [REQ-E02-056: Create Workflow Namespace Structure](/docs/REQ-E02-056-create-workflow-namespace-structure-overview.md)
- [REQ-E02-057: Update Main ItemCreationWorkflow Component](/docs/REQ-E02-057-update-main-itemcreationworkflow-component-overview.md)
- [REQ-E02-058: Update RoomSelectionStep](/docs/REQ-E02-058-update-roomselectionstep-overview.md)
- [REQ-E02-059: Update ItemTypeStep](/docs/REQ-E02-059-update-itemtypestep-overview.md)
- [Request Documentation](/docs/gen_requests_epic2.md#REQ-E02-060)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)

---

*Document generated for FAQBNB Localization Epic 2 - Sub-Epic 2C: Item Creation Workflow*
