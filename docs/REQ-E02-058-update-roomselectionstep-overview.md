# Implementation Breakdown: REQ-E02-058 - Update RoomSelectionStep Component

**Document Version:** 1.0
**Created:** 2026-01-20
**Last Modified:** 2026-01-20
**Request ID:** REQ-E02-058
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2C - Item Creation Workflow
**Task ID:** 2C.3
**Estimated Size:** M (Medium)

---

## Overview

This document provides the implementation breakdown for updating the `RoomSelectionStep` component to use the i18n translation system. This component is Step 1 of the item creation workflow and allows users to select or specify the room where an item is located.

The RoomSelectionStep component contains:
- Step header text ("Select a Room")
- Instructional helper text
- Room type labels from `ROOM_LABELS` constant
- Custom room input field with label, placeholder, and hint text
- Continue button text
- Accessibility labels and screen reader content

**Note:** This task focuses on the RoomSelectionStep component and its direct dependencies. The RoomCard child component receives labels as props but will be handled in Task 2C.11 (Shared Components) for any internal strings.

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

### Existing Patterns to Follow
- Translation file structure in `/messages/en.json` (common, auth, dashboard, workflow namespaces)
- Key naming convention: `{namespace}.{component/area}.{element}.{variant?}`
- ICU message format for pluralization
- Client component pattern using `useTranslations` hook

---

## Technical Context

### Current State Analysis

The `RoomSelectionStep.tsx` component (located at `/src/components/ItemCreationWorkflow/components/steps/RoomSelectionStep.tsx`) is a client component (`'use client'`) that renders the first step of the item creation workflow.

#### Identified Hardcoded Strings in RoomSelectionStep.tsx

| Line | Current String | Translation Key |
|------|----------------|-----------------|
| 141-142 | `"Select a Room"` | `workflow.steps.roomSelection.title` |
| 144-145 | `"Choose where this item is located in your property"` | `workflow.steps.roomSelection.subtitle` |
| 152 | `"Select a room for your item"` (aria-label) | `workflow.steps.roomSelection.ariaLabel` |
| 170-171 | `"Use arrow keys to navigate between rooms. Press Enter or Space to select."` | `workflow.steps.roomSelection.keyboardHelp` |
| 180-181 | `"Enter room name"` | `workflow.steps.roomSelection.customRoomLabel` |
| 188 | `"e.g., Home Office, Wine Cellar, Mudroom"` | `workflow.steps.roomSelection.customRoomPlaceholder` |
| 200-201 | `"Maximum 50 characters"` | `workflow.steps.roomSelection.customRoomHint` |
| 222 | `"Continue"` | `workflow.steps.roomSelection.continueButton` or `common.next` |

#### Hardcoded Room Labels in constants.ts

The `ROOM_LABELS` constant in `/src/components/ItemCreationWorkflow/utils/constants.ts` contains:

| Room Type | Current Label | Translation Key |
|-----------|---------------|-----------------|
| `kitchen` | `"Kitchen"` | `workflow.rooms.kitchen` |
| `laundry` | `"Laundry Room"` | `workflow.rooms.laundry` |
| `bedroom` | `"Bedroom"` | `workflow.rooms.bedroom` |
| `bathroom` | `"Bathroom"` | `workflow.rooms.bathroom` |
| `living-room` | `"Living Room"` | `workflow.rooms.livingRoom` |
| `garage` | `"Garage"` | `workflow.rooms.garage` |
| `outdoor` | `"Outdoor/Patio"` | `workflow.rooms.outdoor` |
| `general` | `"General/Whole Property"` | `workflow.rooms.general` |
| `other` | `"Other"` | `workflow.rooms.other` |

### Component Integration Points

```
RoomSelectionStep.tsx
├── imports ROOM_TYPES, ROOM_LABELS, ROOM_ICONS from ../../utils/constants
├── imports RoomCard from ../shared
├── passes label={ROOM_LABELS[room]} to RoomCard
├── contains radiogroup with aria-label
├── contains sr-only help text for keyboard navigation
├── contains conditional custom room input section
└── contains Continue button
```

---

## Implementation Tasks

### Task 1: Add useTranslations Hook to RoomSelectionStep Component
**Priority:** Critical
**Estimate:** 0.25 story points

Add the `useTranslations` hook import and initialization at the component level.

**Implementation:**
```typescript
// Add import at top of file
import { useTranslations } from 'next-intl';

// Inside RoomSelectionStep component, before state declarations
export function RoomSelectionStep({...props}: RoomSelectionStepProps) {
  const t = useTranslations('workflow.steps.roomSelection');
  const tRooms = useTranslations('workflow.rooms');

  // ... rest of component
}
```

**Acceptance Criteria:**
- [ ] Import statement added for useTranslations from 'next-intl'
- [ ] Hook initialized at component scope with 'workflow.steps.roomSelection' namespace
- [ ] Second hook initialized for room translations with 'workflow.rooms' namespace
- [ ] No re-initialization on every render (hooks called at component level, not in callbacks)

### Task 2: Update Step Header Text
**Priority:** High
**Estimate:** 0.25 story points

Replace the hardcoded step header and subtitle text with translation keys.

**Current Code (Lines 140-147):**
```tsx
<div className="mb-6">
  <h2 className="text-2xl font-semibold text-[#222222] mb-2">
    Select a Room
  </h2>
  <p className="text-base text-[#717171]">
    Choose where this item is located in your property
  </p>
</div>
```

**Updated Code:**
```tsx
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
- [ ] Step title uses translation key `workflow.steps.roomSelection.title`
- [ ] Step subtitle uses translation key `workflow.steps.roomSelection.subtitle`
- [ ] Header maintains existing styling and structure

### Task 3: Update Accessibility Strings
**Priority:** High
**Estimate:** 0.25 story points

Replace hardcoded accessibility strings with translation keys.

**Current Code (Lines 150-172):**
```tsx
<div
  role="radiogroup"
  aria-label="Select a room for your item"
  aria-describedby="room-selection-help"
  ...
>
  {/* room cards */}
</div>
<p id="room-selection-help" className="sr-only">
  Use arrow keys to navigate between rooms. Press Enter or Space to select.
</p>
```

**Updated Code:**
```tsx
<div
  role="radiogroup"
  aria-label={t('ariaLabel')}
  aria-describedby="room-selection-help"
  ...
>
  {/* room cards */}
</div>
<p id="room-selection-help" className="sr-only">
  {t('keyboardHelp')}
</p>
```

**Acceptance Criteria:**
- [ ] Radiogroup aria-label uses translation key
- [ ] Keyboard navigation help text uses translation key
- [ ] Screen reader accessibility preserved in all languages

### Task 4: Create Translated Room Labels
**Priority:** Critical
**Estimate:** 0.5 story points

Create a mechanism to get translated room labels. There are two approaches:

**Option A: Create useTranslatedRoomLabels Hook (Recommended)**
Create a custom hook that returns translated room labels:

```typescript
// In RoomSelectionStep or a new utility file
function useTranslatedRoomLabels() {
  const t = useTranslations('workflow.rooms');

  return {
    kitchen: t('kitchen'),
    laundry: t('laundry'),
    bedroom: t('bedroom'),
    bathroom: t('bathroom'),
    'living-room': t('livingRoom'),
    garage: t('garage'),
    outdoor: t('outdoor'),
    general: t('general'),
    other: t('other'),
  };
}
```

**Option B: Inline Translation in Map**
Use translation directly in the map:

```tsx
{ROOM_TYPES.map((room, index) => (
  <RoomCard
    key={room}
    ref={(el) => { roomRefs.current[index] = el; }}
    room={room}
    label={tRooms(room === 'living-room' ? 'livingRoom' : room)}
    icon={ROOM_ICONS[room]}
    isSelected={currentRoom === room}
    onSelect={handleRoomSelect}
    tabIndex={index === activeIndex ? 0 : -1}
  />
))}
```

**Note:** The key mapping is needed because `living-room` contains a hyphen but JSON keys typically use camelCase.

**Acceptance Criteria:**
- [ ] All 9 room type labels use translation keys
- [ ] Translation key naming handles hyphenated room types appropriately
- [ ] RoomCard receives translated labels as props
- [ ] Fallback to English if translation missing

### Task 5: Update Custom Room Input Section
**Priority:** High
**Estimate:** 0.25 story points

Replace hardcoded strings in the custom room input section.

**Current Code (Lines 175-203):**
```tsx
{currentRoom === 'other' && (
  <div className="mt-6">
    <label
      htmlFor="custom-room-input"
      className="..."
    >
      Enter room name
    </label>
    <input
      id="custom-room-input"
      ...
      placeholder="e.g., Home Office, Wine Cellar, Mudroom"
      ...
    />
    <p id="custom-room-hint" className="...">
      Maximum 50 characters
    </p>
  </div>
)}
```

**Updated Code:**
```tsx
{currentRoom === 'other' && (
  <div className="mt-6">
    <label
      htmlFor="custom-room-input"
      className="..."
    >
      {t('customRoomLabel')}
    </label>
    <input
      id="custom-room-input"
      ...
      placeholder={t('customRoomPlaceholder')}
      ...
    />
    <p id="custom-room-hint" className="...">
      {t('customRoomHint')}
    </p>
  </div>
)}
```

**Important Note on Placeholder Examples:**
The placeholder text contains locale-specific examples (Home Office, Wine Cellar, Mudroom). These should be translated to culturally appropriate examples in each language. For example:
- French: "ex. Bureau, Cave a vin, Entree"
- German: "z.B. Homeoffice, Weinkeller, Hauswirtschaftsraum"

**Acceptance Criteria:**
- [ ] Custom room label uses translation key
- [ ] Placeholder text uses translation key with locale-appropriate examples
- [ ] Character limit hint uses translation key
- [ ] All attributes properly localized

### Task 6: Update Continue Button
**Priority:** High
**Estimate:** 0.25 story points

Replace the hardcoded Continue button text.

**Current Code (Lines 206-224):**
```tsx
<button
  type="button"
  onClick={handleContinue}
  disabled={!isValidSelection}
  className={...}
  aria-disabled={!isValidSelection}
>
  Continue
</button>
```

**Updated Code:**
```tsx
<button
  type="button"
  onClick={handleContinue}
  disabled={!isValidSelection}
  className={...}
  aria-disabled={!isValidSelection}
>
  {t('continueButton')}
</button>
```

**Alternative:** Use `common.next` if "Continue" is used consistently across the app:
```tsx
const tCommon = useTranslations('common');
// ...
{tCommon('next')}
```

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
      "roomSelection": {
        "title": "Select a Room",
        "subtitle": "Choose where this item is located in your property",
        "ariaLabel": "Select a room for your item",
        "keyboardHelp": "Use arrow keys to navigate between rooms. Press Enter or Space to select.",
        "customRoomLabel": "Enter room name",
        "customRoomPlaceholder": "e.g., Home Office, Wine Cellar, Mudroom",
        "customRoomHint": "Maximum 50 characters",
        "continueButton": "Continue"
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
    }
  }
}
```

**Acceptance Criteria:**
- [ ] All required keys exist in `/messages/en.json`
- [ ] Room labels are in `workflow.rooms` namespace (reusable across components)
- [ ] JSON file validates without syntax errors
- [ ] Build completes without missing translation warnings

---

## Authorized Files and Functions for Modification

### Primary Files to Modify

| File | Purpose | Modification Type |
|------|---------|-------------------|
| `/src/components/ItemCreationWorkflow/components/steps/RoomSelectionStep.tsx` | Room selection step component | Add useTranslations hook, replace all hardcoded strings |
| `/messages/en.json` | English translations | Add workflow.steps.roomSelection and workflow.rooms keys |

### Functions to Modify

| Function/Section | File | Modification |
|------------------|------|--------------|
| `RoomSelectionStep` component | RoomSelectionStep.tsx | Add `useTranslations` hooks, use translation keys |
| Step header JSX | RoomSelectionStep.tsx | Use `t('title')` and `t('subtitle')` |
| Radiogroup section | RoomSelectionStep.tsx | Use translated aria-label and help text |
| Room card mapping | RoomSelectionStep.tsx | Use translated room labels from `tRooms()` |
| Custom room input | RoomSelectionStep.tsx | Use translated label, placeholder, hint |
| Continue button | RoomSelectionStep.tsx | Use translated button text |

### Files for Reference Only (Not Modified in This Task)

| File | Purpose |
|------|---------|
| `/src/components/ItemCreationWorkflow/utils/constants.ts` | Contains ROOM_LABELS (may be deprecated in favor of translations) |
| `/src/components/ItemCreationWorkflow/components/shared/RoomCard.tsx` | Child component - receives label as prop |
| `/src/lib/i18n/config.ts` | i18n configuration (read-only reference) |
| `/src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | Parent component (separate task) |

### Constants Consideration

The `ROOM_LABELS` constant in `constants.ts` contains English labels. After this task:
- The constant can remain for backward compatibility (default/fallback)
- Or can be deprecated if all consumers use translated labels
- Recommend keeping the constant but documenting that UI should use translations

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
- Navigate to item creation workflow (Step 1)
- Open browser console, verify no translation-related errors
- Verify all text displays correctly

### 3. Functional Testing
- Select each room type and verify labels display correctly
- Select "Other" and verify custom input section appears with translated strings
- Verify Continue button text
- Verify custom room input validation still works

### 4. Accessibility Testing
- Use screen reader (VoiceOver/NVDA) to navigate room grid
- Verify radiogroup aria-label is announced correctly
- Verify keyboard navigation help is announced
- Tab through all room options

### 5. Language Switching Test
- Change browser language or use language switcher (if available)
- Verify all RoomSelectionStep strings update
- Verify room labels update
- Verify no mixed-language content

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Missing dependency on REQ-E02-056 | Medium | High | Verify workflow namespace exists before starting |
| Room label key mismatch with ROOM_TYPES | Medium | Medium | Create mapping for hyphenated keys (living-room -> livingRoom) |
| Placeholder examples not culturally appropriate | Medium | Low | Work with translators to provide locale-specific examples |
| RoomCard not receiving translated labels | Low | Medium | Verify prop passing works correctly |
| Multiple useTranslations hooks affecting performance | Low | Low | Hook calls are optimized by next-intl |

---

## Notes for Implementation

### 1. Client Component Requirement
The `RoomSelectionStep` component is marked with `'use client'`, which is compatible with the `useTranslations` hook from next-intl. No changes needed for server/client boundary.

### 2. Room Label Key Mapping
The room type `living-room` has a hyphen, but JSON keys typically use camelCase. The translation key mapping needs to handle this:
- `living-room` (ROOM_TYPES constant) -> `livingRoom` (translation key)

Consider creating a utility mapping:
```typescript
const ROOM_KEY_MAP: Record<string, string> = {
  'living-room': 'livingRoom',
};
const getRoomKey = (room: string) => ROOM_KEY_MAP[room] || room;
```

### 3. Reusable Room Translations
The room labels in `workflow.rooms` namespace should be reusable across components (ItemTypeStep, PreviewSaveStep, etc.). Keep them at the `workflow.rooms` level rather than nested under `roomSelection`.

### 4. Placeholder Localization
The placeholder "e.g., Home Office, Wine Cellar, Mudroom" contains culturally specific room names. Ensure translators provide equivalent examples for each locale that make sense in that culture.

### 5. Coordination with Constants
The `ROOM_LABELS` constant in `constants.ts` will become redundant for UI display. Options:
- Keep for backward compatibility and non-translated contexts
- Add deprecation comment pointing to translation usage
- Do not modify constants.ts in this task (separate cleanup task if needed)

---

## Acceptance Criteria Summary

From the request document (REQ-E02-058):

- [ ] Step header text "Select a Room" is extracted to localization namespace
- [ ] Instructional text "Choose where this item is located in your property" is extracted to localization namespace
- [ ] Accessibility label "Select a room for your item" is extracted to localization namespace
- [ ] Keyboard navigation help text "Use arrow keys to navigate between rooms. Press Enter or Space to select." is extracted to localization namespace
- [ ] Custom room input label "Enter room name" is extracted to localization namespace
- [ ] Placeholder text "e.g., Home Office, Wine Cellar, Mudroom" is extracted to localization namespace with appropriate locale-specific examples
- [ ] Character limit hint "Maximum 50 characters" is extracted to localization namespace
- [ ] Continue button text "Continue" is extracted to localization namespace
- [ ] All room type labels from ROOM_LABELS constant (Kitchen, Laundry Room, Bedroom, Bathroom, Living Room, Garage, Outdoor/Patio, General/Whole Property, Other) are accessible through the translation system
- [ ] Component uses appropriate i18n hooks to retrieve all translated strings
- [ ] All ARIA labels and accessibility strings are properly localized
- [ ] Component renders correctly with translations in all supported languages
- [ ] No hardcoded English strings remain in the component code

---

## References

- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [REQ-E02-056: Create Workflow Namespace Structure](/docs/REQ-E02-056-create-workflow-namespace-structure-overview.md)
- [REQ-E02-057: Update Main ItemCreationWorkflow Component](/docs/REQ-E02-057-update-main-itemcreationworkflow-component-overview.md)
- [Request Documentation](/docs/gen_requests_epic2.md#REQ-E02-058)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)

---

*Document generated for FAQBNB Localization Epic 2 - Sub-Epic 2C: Item Creation Workflow*
