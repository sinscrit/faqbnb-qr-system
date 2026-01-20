# Detailed Task Breakdown: REQ-E02-060 - Update SpecificItemStep Component

**Document Version:** 1.0
**Created:** 2026-01-20
**Last Modified:** 2026-01-20
**Request ID:** REQ-E02-060
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2C - Item Creation Workflow
**Task ID:** 2C.5
**Estimated Size:** S (Small)
**Story Points:** 2

---

## Executive Summary

This document provides granular, implementation-ready tasks for updating the `SpecificItemStep` component to use the i18n translation system. The SpecificItemStep is Step 3 of the item creation workflow, allowing users to select or enter a specific item name from contextual suggestions.

**Component Location:** `/src/components/ItemCreationWorkflow/components/steps/SpecificItemStep.tsx`

**Total Hardcoded Strings to Extract:** 9 distinct strings

---

## Prerequisites Checklist

Before starting implementation, verify:

- [ ] Epic 1 foundation is complete (next-intl installed and configured)
- [ ] REQ-E02-056 (workflow namespace structure) is complete
- [ ] `/messages/en.json` exists with `workflow` namespace
- [ ] `workflow.rooms` translations exist (from REQ-E02-058)
- [ ] Development server can be started without errors

---

## Task Breakdown

### Task 1: Add Translation Hook Import and Initialization

**Priority:** Critical | **Points:** 0.25 | **Type:** Code Change

**Objective:** Import and initialize the `useTranslations` hook from next-intl.

**File:** `/src/components/ItemCreationWorkflow/components/steps/SpecificItemStep.tsx`

**Current Code (Line 16):**
```typescript
import { useState, useCallback, useMemo } from 'react';
```

**Implementation Steps:**

1. Add import statement for `useTranslations` after existing React imports:
   ```typescript
   import { useState, useCallback, useMemo } from 'react';
   import { useTranslations } from 'next-intl';
   ```

2. Inside the `SpecificItemStep` function component, add hook initialization after the props destructuring and before local state declarations (after line 58, before line 60):
   ```typescript
   export function SpecificItemStep({
     // ... props
   }: SpecificItemStepProps) {
     // Translation hooks
     const t = useTranslations('workflow.steps.specificItem');
     const tRooms = useTranslations('workflow.rooms');

     // Local state for custom item mode
     const [isCustomMode, setIsCustomMode] = useState(false);
     // ... rest of component
   ```

**Acceptance Criteria:**
- [ ] Import statement added for `useTranslations` from 'next-intl'
- [ ] Primary translation hook `t` initialized with namespace 'workflow.steps.specificItem'
- [ ] Secondary hook `tRooms` initialized for room label translations
- [ ] Hooks are called at component top level (not inside callbacks or conditionals)
- [ ] No TypeScript errors after adding imports

---

### Task 2: Add Translation Keys to Messages File

**Priority:** Critical | **Points:** 0.25 | **Type:** Configuration

**Objective:** Add all required translation keys to the English messages file.

**File:** `/messages/en.json`

**Implementation Steps:**

1. Locate the `workflow.steps` section in `/messages/en.json`

2. Add the `specificItem` object with all required keys:
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

**Translation Keys Reference:**

| Key | English Value | Usage Location |
|-----|---------------|----------------|
| `title` | "What specific item?" | Step header h2 (line 136) |
| `subtitle` | "Select from suggestions or enter a custom item for {room}" | Step header subtitle (line 139) |
| `suggestionsLabel` | "Suggestions" | Section header h3 (line 147) |
| `ariaLabel` | "Select a specific item" | Radiogroup aria-label (line 151) |
| `other` | "Other..." | Other button label (line 165) |
| `customItemLabel` | "Enter custom item name" | Label when suggestions exist (line 181) |
| `itemLabel` | "Enter item name" | Label when no suggestions (line 181) |
| `customItemPlaceholder` | "e.g., Coffee Maker, Smart Thermostat" | Custom input placeholder (line 188) |
| `itemNamePlaceholder` | "Enter item name" | ItemNameEditor placeholder prop (line 209) |
| `continueButton` | "Continue" | Continue button text (line 242) |

**Acceptance Criteria:**
- [ ] All 10 translation keys exist under `workflow.steps.specificItem`
- [ ] JSON file is valid (no syntax errors)
- [ ] Key names follow established naming convention
- [ ] `subtitle` key includes `{room}` placeholder for interpolation
- [ ] Build completes without missing translation warnings

---

### Task 3: Update Room Label to Use Translation

**Priority:** High | **Points:** 0.25 | **Type:** Code Change

**Objective:** Replace hardcoded room label lookup with translated room label.

**File:** `/src/components/ItemCreationWorkflow/components/steps/SpecificItemStep.tsx`

**Current Code (Line 129):**
```typescript
// Room label for display
const roomLabel = ROOM_LABELS[currentRoom] || currentRoom;
```

**Updated Code:**
```typescript
// Room label for display - use translation with fallback to constant
const roomLabel = (() => {
  try {
    return tRooms(`${currentRoom}.label`);
  } catch {
    return ROOM_LABELS[currentRoom] || currentRoom;
  }
})();
```

**Alternative (simpler, if next-intl supports `.has()`):**
```typescript
// Room label for display - use translation with fallback
const roomLabel = tRooms(`${currentRoom}.label`, {
  default: ROOM_LABELS[currentRoom] || currentRoom
});
```

**Note:** Keep the `ROOM_LABELS` import as it provides fallback values.

**Acceptance Criteria:**
- [ ] Room label uses translated value when available
- [ ] Falls back to `ROOM_LABELS` constant if translation missing
- [ ] No errors thrown for missing room translations
- [ ] Room label displays correctly for all room types

---

### Task 4: Update Step Header Section

**Priority:** High | **Points:** 0.25 | **Type:** Code Change

**Objective:** Replace hardcoded step header text with translation keys.

**File:** `/src/components/ItemCreationWorkflow/components/steps/SpecificItemStep.tsx`

**Current Code (Lines 133-141):**
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
    {t('subtitle', { room: roomLabel })}
  </p>
</div>
```

**Acceptance Criteria:**
- [ ] Title uses `t('title')` translation key
- [ ] Subtitle uses `t('subtitle', { room: roomLabel })` with interpolation
- [ ] Room name displays correctly within subtitle
- [ ] Existing CSS classes and structure preserved
- [ ] Text renders correctly in browser

---

### Task 5: Update Suggestions Section

**Priority:** High | **Points:** 0.25 | **Type:** Code Change

**Objective:** Replace hardcoded "Suggestions" label, aria-label, and "Other..." button text.

**File:** `/src/components/ItemCreationWorkflow/components/steps/SpecificItemStep.tsx`

**Current Code (Lines 143-171):**
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
      {suggestions.map((suggestion) => (
        <SuggestionButton
          key={suggestion}
          label={suggestion}
          isSelected={isSuggestionSelected(suggestion)}
          isCreated={isCreated(suggestion)}
          onSelect={handleSuggestionSelect}
        />
      ))}
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
      {suggestions.map((suggestion) => (
        <SuggestionButton
          key={suggestion}
          label={suggestion}
          isSelected={isSuggestionSelected(suggestion)}
          isCreated={isCreated(suggestion)}
          onSelect={handleSuggestionSelect}
        />
      ))}
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

**Important:** Suggestion button labels (e.g., "Coffee Maker", "Stove") remain untranslated as they are data values, not UI strings.

**Acceptance Criteria:**
- [ ] "Suggestions" section header uses `t('suggestionsLabel')`
- [ ] Radiogroup `aria-label` uses `t('ariaLabel')`
- [ ] "Other..." button uses `t('other')`
- [ ] Suggestion item labels remain as data (not translated)
- [ ] Screen reader announces translated aria-label

---

### Task 6: Update Custom Item Input Section

**Priority:** High | **Points:** 0.25 | **Type:** Code Change

**Objective:** Replace hardcoded custom item input label and placeholder.

**File:** `/src/components/ItemCreationWorkflow/components/steps/SpecificItemStep.tsx`

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
      className={cn(
        'w-full px-4 py-3 border-2 rounded-lg',
        'text-base text-[#222222] placeholder:text-[#717171]',
        'transition-colors duration-150',
        'focus:outline-none focus:border-[#222222]',
        'border-gray-200'
      )}
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
      className={cn(
        'w-full px-4 py-3 border-2 rounded-lg',
        'text-base text-[#222222] placeholder:text-[#717171]',
        'transition-colors duration-150',
        'focus:outline-none focus:border-[#222222]',
        'border-gray-200'
      )}
      aria-required="true"
      autoFocus={isCustomMode}
    />
  </div>
)}
```

**Acceptance Criteria:**
- [ ] Label uses conditional `t('customItemLabel')` or `t('itemLabel')` based on `hasSuggestions`
- [ ] Placeholder uses `t('customItemPlaceholder')`
- [ ] Input functionality unchanged
- [ ] Label and placeholder display correctly

---

### Task 7: Update ItemNameEditor Placeholder Prop

**Priority:** Medium | **Points:** 0.25 | **Type:** Code Change

**Objective:** Pass translated placeholder to the ItemNameEditor child component.

**File:** `/src/components/ItemCreationWorkflow/components/steps/SpecificItemStep.tsx`

**Current Code (Lines 203-211):**
```tsx
{/* Item name editor (shows auto-generated name when item selected) */}
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
{/* Item name editor (shows auto-generated name when item selected) */}
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

**Note:** The ItemNameEditor's internal label ("Item Name") and hint text will be translated in Task 2C.11 (Shared Components update).

**Acceptance Criteria:**
- [ ] `placeholder` prop uses `t('itemNamePlaceholder')`
- [ ] ItemNameEditor displays translated placeholder
- [ ] Component functionality unchanged

---

### Task 8: Update Continue Button

**Priority:** High | **Points:** 0.25 | **Type:** Code Change

**Objective:** Replace hardcoded Continue button text with translation key.

**File:** `/src/components/ItemCreationWorkflow/components/steps/SpecificItemStep.tsx`

**Current Code (Lines 226-244):**
```tsx
{/* Continue button */}
<div className="mt-auto pt-6 border-t border-gray-200">
  <button
    type="button"
    onClick={handleContinue}
    disabled={!canNext}
    className={cn(
      'w-full py-4 rounded-lg font-semibold text-lg',
      'transition-colors duration-150',
      'min-h-[56px]',
      canNext
        ? 'bg-[#FF385C] text-white hover:bg-[#E31C5F] active:bg-[#D70466]'
        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
    )}
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
    className={cn(
      'w-full py-4 rounded-lg font-semibold text-lg',
      'transition-colors duration-150',
      'min-h-[56px]',
      canNext
        ? 'bg-[#FF385C] text-white hover:bg-[#E31C5F] active:bg-[#D70466]'
        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
    )}
    aria-disabled={!canNext}
  >
    {t('continueButton')}
  </button>
</div>
```

**Alternative:** Use `common.actions.continue` for consistency across the app if that pattern is established.

**Acceptance Criteria:**
- [ ] Continue button text uses `t('continueButton')`
- [ ] Button styling and functionality unchanged
- [ ] Disabled state still works correctly

---

### Task 9: Verification and Testing

**Priority:** Critical | **Points:** 0.5 | **Type:** Testing

**Objective:** Verify all translations are working correctly.

**Verification Steps:**

#### 9.1 Build Verification
```bash
npm run build
```
- [ ] No TypeScript errors
- [ ] No missing translation key warnings
- [ ] Build completes successfully

#### 9.2 Runtime Verification
```bash
npm run dev
```
- [ ] Navigate to item creation workflow
- [ ] Progress to Step 3 (Specific Item Selection)
- [ ] Open browser console - no translation errors
- [ ] All text displays correctly

#### 9.3 Functional Testing Checklist

| Test Case | Steps | Expected Result | Pass |
|-----------|-------|-----------------|------|
| Title displays | Load Step 3 | "What specific item?" shows | [ ] |
| Subtitle with room | Select "Kitchen" in Step 1, proceed to Step 3 | Subtitle shows "...for Kitchen" | [ ] |
| Different room | Select "Bathroom" in Step 1, proceed to Step 3 | Subtitle shows "...for Bathroom" | [ ] |
| Suggestions label | View Step 3 with room that has suggestions | "Suggestions" header shows | [ ] |
| Other button | View suggestions section | "Other..." button visible | [ ] |
| Custom input label (with suggestions) | Click "Other..." | "Enter custom item name" label shows | [ ] |
| Custom input label (no suggestions) | Select room/type with no suggestions | "Enter item name" label shows | [ ] |
| Placeholder | Click "Other..." or view custom input | Placeholder shows examples | [ ] |
| ItemNameEditor placeholder | Select a suggestion item | Editor shows "Enter item name" placeholder | [ ] |
| Continue button | View Step 3 | "Continue" button shows | [ ] |
| Suggestion selection | Click a suggestion | Item selected, auto-advances | [ ] |
| Continue disabled | No item selected | Continue button disabled | [ ] |
| Continue enabled | Item selected | Continue button enabled | [ ] |

#### 9.4 Accessibility Testing
- [ ] Screen reader announces radiogroup aria-label
- [ ] Tab navigation works through suggestions
- [ ] Custom input label properly associated with input
- [ ] Keyboard users can operate the form

#### 9.5 Edge Cases
- [ ] Room type with no suggestions (verify "Enter item name" label)
- [ ] Very long room name (verify subtitle doesn't break)
- [ ] Duplicate name warning still appears

---

## Complete Code Reference

### Final SpecificItemStep.tsx (Key Sections)

```typescript
'use client';

import { useState, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { useSuggestions } from '../../hooks';
import { SuggestionButton, ItemNameEditor, DuplicateNameWarning } from '../shared';
import { ROOM_LABELS } from '../../utils/constants';
import { checkDuplicateName } from '../../utils/duplicateNameCheck';
import type { RoomType, ItemType, SessionItem } from '../../ItemCreationWorkflow.types';

// ... interface unchanged ...

export function SpecificItemStep({
  currentRoom,
  currentItemType,
  currentSpecificItem,
  currentItemName,
  existingSessionItems,
  onSelectSpecificItem,
  onSetItemName,
  onNext,
  canNext,
  className,
}: SpecificItemStepProps) {
  // Translation hooks
  const t = useTranslations('workflow.steps.specificItem');
  const tRooms = useTranslations('workflow.rooms');

  // Local state for custom item mode
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customItemValue, setCustomItemValue] = useState('');

  // ... hooks and handlers unchanged ...

  // Room label for display - use translation with fallback
  const roomLabel = (() => {
    try {
      return tRooms(`${currentRoom}.label`);
    } catch {
      return ROOM_LABELS[currentRoom] || currentRoom;
    }
  })();

  return (
    <div className={cn('flex flex-col flex-1 p-6', className)}>
      {/* Step header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-[#222222] mb-2">
          {t('title')}
        </h2>
        <p className="text-base text-[#717171]">
          {t('subtitle', { room: roomLabel })}
        </p>
      </div>

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
            {suggestions.map((suggestion) => (
              <SuggestionButton
                key={suggestion}
                label={suggestion}
                isSelected={isSuggestionSelected(suggestion)}
                isCreated={isCreated(suggestion)}
                onSelect={handleSuggestionSelect}
              />
            ))}
            <SuggestionButton
              label={t('other')}
              isSelected={isCustomMode}
              isCreated={false}
              onSelect={handleOtherClick}
            />
          </div>
        </div>
      )}

      {/* Custom item input */}
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
            className={cn(
              'w-full px-4 py-3 border-2 rounded-lg',
              'text-base text-[#222222] placeholder:text-[#717171]',
              'transition-colors duration-150',
              'focus:outline-none focus:border-[#222222]',
              'border-gray-200'
            )}
            aria-required="true"
            autoFocus={isCustomMode}
          />
        </div>
      )}

      {/* Item name editor */}
      {currentSpecificItem && (
        <div className="mb-6">
          <ItemNameEditor
            value={currentItemName}
            onChange={onSetItemName}
            placeholder={t('itemNamePlaceholder')}
            maxLength={100}
          />
          {duplicateCheck.isDuplicate && (
            <div className="mt-3">
              <DuplicateNameWarning
                matchingNames={duplicateCheck.matchingNames}
                matchType={duplicateCheck.matchType}
                variant="block"
              />
            </div>
          )}
        </div>
      )}

      {/* Continue button */}
      <div className="mt-auto pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={handleContinue}
          disabled={!canNext}
          className={cn(
            'w-full py-4 rounded-lg font-semibold text-lg',
            'transition-colors duration-150',
            'min-h-[56px]',
            canNext
              ? 'bg-[#FF385C] text-white hover:bg-[#E31C5F] active:bg-[#D70466]'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          )}
          aria-disabled={!canNext}
        >
          {t('continueButton')}
        </button>
      </div>
    </div>
  );
}
```

---

## Files Modified Summary

| File | Change Type | Description |
|------|-------------|-------------|
| `/src/components/ItemCreationWorkflow/components/steps/SpecificItemStep.tsx` | Modified | Add useTranslations hook, replace 9 hardcoded strings |
| `/messages/en.json` | Modified | Add `workflow.steps.specificItem` namespace with 10 keys |

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Missing workflow namespace | Low | High | Verify REQ-E02-056 complete first |
| Room translation key mismatch | Medium | Medium | Follow exact pattern from REQ-E02-058 |
| Child component strings untranslated | Expected | Low | Document for Task 2C.11 |
| ICU interpolation syntax error | Low | Medium | Test with multiple room types |

---

## Dependencies on Other Tasks

| Task | Dependency Type | Notes |
|------|-----------------|-------|
| REQ-E02-056 | Required | Creates workflow namespace structure |
| REQ-E02-057 | Reference | Pattern established for main workflow |
| REQ-E02-058 | Required | Room label translations (`workflow.rooms`) |
| REQ-E02-059 | Reference | Similar dual-hook pattern |
| Task 2C.11 | Future | Child component strings (SuggestionButton, ItemNameEditor, DuplicateNameWarning) |

---

## Acceptance Criteria Checklist

From REQ-E02-060:

- [ ] All hardcoded text strings in SpecificItemStep component are identified and extracted
- [ ] Translation keys are added to the workflow namespace following the established naming convention
- [ ] Component imports and uses next-intl's useTranslations hook
- [ ] All UI elements (labels, buttons, placeholders, hints, error messages) display translated text
- [ ] Component renders correctly with translation keys in place
- [ ] No English-only fallback text remains visible in the component

### Detailed Verification:

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

## Notes for Implementation Agent

1. **Client Component Compatibility:** This is a `'use client'` component, which is fully compatible with `useTranslations` hook.

2. **Suggestion Labels Are Data:** The suggestion button labels (e.g., "Coffee Maker", "Microwave") come from the `useSuggestions` hook and are actual item names, not UI strings. Do NOT translate these.

3. **Child Component Strings:** The following child components have internal hardcoded strings that will be addressed in Task 2C.11:
   - **SuggestionButton**: "Created" status text
   - **ItemNameEditor**: "Item Name" label, hint text
   - **DuplicateNameWarning**: "Exact name already exists", etc.

4. **Placeholder Localization:** When generating translations, ensure placeholder examples are culturally appropriate (e.g., French might use "ex: Cafetiere, Thermostat" instead of "e.g., Coffee Maker, Smart Thermostat").

5. **Fallback Strategy:** Always provide fallbacks for room labels to handle cases where translations might be missing.

---

## References

- [Overview Document](/docs/REQ-E02-060-update-specificitemstep-overview.md)
- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [Request Documentation](/docs/gen_requests_epic2.md#REQ-E02-060)
- [REQ-E02-058: Update RoomSelectionStep](/docs/REQ-E02-058-update-roomselectionstep-overview.md) (room label pattern)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)

---

*Document generated for FAQBNB Localization Epic 2 - Sub-Epic 2C: Item Creation Workflow*
*Task 2C.5: Update SpecificItemStep Component*
