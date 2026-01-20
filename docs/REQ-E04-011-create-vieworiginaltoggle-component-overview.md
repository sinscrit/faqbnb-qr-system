# Implementation Overview: REQ-E04-011 - Create ViewOriginalToggle Component

**Request ID:** REQ-E04-011
**Title:** Create View Original Toggle Component
**Type:** NEW FEATURE
**Size:** S (Small)
**Priority:** P1 - High
**Epic:** Epic 4 - Guest Experience
**Phase:** 3 - Guest UI Components
**Task ID:** 3.4

**Document Created:** 2026-01-20
**Last Modified:** 2026-01-20

---

## 1. Summary

Create a ViewOriginalToggle component that allows guests viewing translated content to toggle between the translation and the original source language version. The component should be a secondary-styled button with clear visual indication of the current state and appropriate swap/language icon.

---

## 2. Requirements Reference

### From gen_requests_epic4.md (Request #11)

**Summary:** Guests viewing translated content should have a secondary button that toggles between viewing the translation and the original source language version, with visual indication of the current state.

**Key Acceptance Criteria:**
- [ ] A button component renders with secondary button styling as defined in the design system
- [ ] When viewing translated content, the button displays "View in original (English)" or similar text with the source language name
- [ ] When viewing original content, the button displays "View translation" or similar text
- [ ] The button includes a swap icon or language toggle icon that visually represents switching between versions
- [ ] The icon position is consistent whether showing translation or original state
- [ ] Clicking the button triggers a callback function to change the displayed content version
- [ ] The component accepts the current view state as a prop (translated vs. original)
- [ ] The component accepts the source language name as a prop for display in the toggle text
- [ ] The component accepts a callback function that executes when the button is clicked
- [ ] The button is responsive and displays appropriately on mobile devices
- [ ] Typography is consistent with the application's secondary button design
- [ ] The component integrates with accessibility standards (appropriate ARIA labels, keyboard interaction)
- [ ] The button visually indicates the action that will occur when clicked, not the current state
- [ ] The component handles undefined or null props gracefully with sensible defaults

### From Implementation Plan (Plan-111-L10N-Epic4-Guest-Experience.md)

**Task 3.4: Create ViewOriginalToggle component**
- File: `/src/components/guest/ViewOriginalToggle/ViewOriginalToggle.tsx`
- Secondary button style
- "View in original (English)" / "View translation"
- Swap icon

**Design Specifications (From PRD):**
- Secondary button style (outline)
- Icon: ArrowRightLeft (from Lucide)
- Clear label indicating action

---

## 3. Technical Investigation

### Existing Patterns Identified

#### Secondary Button Styling Pattern
**Reference:** `/src/components/SimpleDashboard/ActionButtons.tsx:78-82`

```typescript
// Secondary button pattern from ActionButtons
const variantClasses = `bg-white border border-[#222222] text-[#222222]
   hover:scale-[1.02] hover:bg-[#F7F7F7] active:scale-[0.98]`;

const baseClasses = `
  flex items-center justify-center gap-2
  min-h-[48px] px-6 py-3.5
  rounded-lg font-medium text-base
  transition-all duration-200 ease-out
  focus-visible:outline-none focus-visible:ring-2
  focus-visible:ring-[#222222] focus-visible:ring-offset-2
  disabled:opacity-50 disabled:cursor-not-allowed
`;
```

#### Toggle Component Pattern
**Reference:** `/src/components/ItemManager/components/shared/ViewModeToggle.tsx:17-68`

```typescript
// Accessibility pattern from ViewModeToggle
<button
  type="button"
  onClick={() => onViewModeChange('grid')}
  disabled={disabled}
  aria-label="Grid view"
  aria-pressed={viewMode === 'grid'}
  className={cn(
    "p-2 rounded-md transition-all duration-200",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF385C] focus-visible:ring-offset-2",
    // State-based styling...
  )}
>
  <LayoutGrid className="w-5 h-5" />
</button>
```

#### Utility Function
**Reference:** `/src/lib/utils.ts:5-7`

```typescript
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

#### Icon Pattern
**Reference:** `lucide-react` package (v0.525.0)
- Icons used in toggle contexts: `RefreshCcw`, `LayoutGrid`, `List`
- For language/swap: `ArrowRightLeft` (recommended in PRD)
- Icon sizing convention: `w-5 h-5` for standard buttons

### Types Interface
**Reference:** `/src/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md:335-346`

```typescript
// /src/components/guest/ViewOriginalToggle/ViewOriginalToggle.types.ts

export interface ViewOriginalToggleProps {
  /** Whether currently showing original content */
  isShowingOriginal: boolean;
  /** Original language code */
  sourceLanguage: SupportedLanguage;
  /** Callback when toggle is clicked */
  onToggle: () => void;
  /** Additional CSS classes */
  className?: string;
}
```

### Language Types
**Reference:** `/src/types/index.ts:673-681`

```typescript
// Locale/i18n types (REQ-250)
export type {
  SupportedLanguage,
  LocaleOption,
  LocaleChangeResult,
  LocaleContextValue,
} from '@/contexts/LocaleContext';

export { SUPPORTED_LOCALES, DEFAULT_LOCALE } from '@/contexts/LocaleContext';
```

### Guest Component Directory Structure
The `/src/components/guest/` directory does not exist yet. This component will establish the pattern for guest-facing components.

**Expected Structure (from Implementation Plan):**
```
/src/components/guest/
├── index.ts                         # Barrel exports
└── ViewOriginalToggle/
    ├── index.ts                     # Component export
    ├── ViewOriginalToggle.tsx       # Toggle component
    └── ViewOriginalToggle.types.ts  # Component types
```

---

## 4. Implementation Tasks

### Task 1: Create Directory Structure and Types File
**Complexity:** XS | **Risk:** Low

Create the guest component directory structure and define the types file.

**Files to Create:**
- `/src/components/guest/ViewOriginalToggle/ViewOriginalToggle.types.ts`

**Implementation Details:**
```typescript
// ViewOriginalToggle.types.ts
import type { SupportedLanguage } from '@/types';

export interface ViewOriginalToggleProps {
  /** Whether currently showing original content */
  isShowingOriginal: boolean;
  /** Original language code (e.g., 'en', 'es') */
  sourceLanguage: SupportedLanguage;
  /** Callback when toggle is clicked */
  onToggle: () => void;
  /** Disabled state */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
}
```

---

### Task 2: Create ViewOriginalToggle Component
**Complexity:** S | **Risk:** Low

Implement the main toggle component with secondary button styling.

**Files to Create:**
- `/src/components/guest/ViewOriginalToggle/ViewOriginalToggle.tsx`

**Implementation Details:**
1. Use `'use client'` directive (component handles onClick)
2. Import `ArrowRightLeft` icon from `lucide-react`
3. Import `cn` utility from `@/lib/utils`
4. Follow secondary button styling from ActionButtons pattern
5. Implement toggle text logic:
   - When `isShowingOriginal === false`: "View in original ({sourceLanguageName})"
   - When `isShowingOriginal === true`: "View translation"
6. Include proper ARIA attributes (`aria-pressed`, `aria-label`)
7. Handle keyboard interaction (Space/Enter keys)
8. Apply responsive styling for mobile

**Component Structure:**
```typescript
'use client';

import { ArrowRightLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SUPPORTED_LOCALES } from '@/types';
import type { ViewOriginalToggleProps } from './ViewOriginalToggle.types';

export function ViewOriginalToggle({
  isShowingOriginal,
  sourceLanguage,
  onToggle,
  disabled = false,
  className,
}: ViewOriginalToggleProps) {
  // Get language display name
  const languageInfo = SUPPORTED_LOCALES.find(l => l.code === sourceLanguage);
  const languageName = languageInfo?.name || sourceLanguage;

  // Dynamic button text based on state
  const buttonText = isShowingOriginal
    ? 'View translation'
    : `View in original (${languageName})`;

  const ariaLabel = isShowingOriginal
    ? 'Switch to translated content'
    : `Switch to original content in ${languageName}`;

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={isShowingOriginal}
      aria-label={ariaLabel}
      className={cn(
        // Base styles
        'inline-flex items-center justify-center gap-2',
        'min-h-[48px] px-4 py-2.5',
        'rounded-lg font-medium text-sm',
        'transition-all duration-200 ease-out',
        // Secondary button style
        'bg-white border border-[#222222] text-[#222222]',
        'hover:scale-[1.02] hover:bg-[#F7F7F7] active:scale-[0.98]',
        // Focus styles
        'focus-visible:outline-none focus-visible:ring-2',
        'focus-visible:ring-[#222222] focus-visible:ring-offset-2',
        // Disabled state
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
        className
      )}
    >
      <ArrowRightLeft className="w-4 h-4" aria-hidden="true" />
      <span>{buttonText}</span>
    </button>
  );
}

export default ViewOriginalToggle;
```

---

### Task 3: Create Component Barrel Export
**Complexity:** XS | **Risk:** Low

Create the index.ts barrel export for the ViewOriginalToggle component.

**Files to Create:**
- `/src/components/guest/ViewOriginalToggle/index.ts`

**Implementation:**
```typescript
export { ViewOriginalToggle, default } from './ViewOriginalToggle';
export type { ViewOriginalToggleProps } from './ViewOriginalToggle.types';
```

---

### Task 4: Create Guest Components Barrel Export
**Complexity:** XS | **Risk:** Low

Create the root barrel export for all guest components.

**Files to Create:**
- `/src/components/guest/index.ts`

**Implementation:**
```typescript
// Guest-facing components for translated content display
export * from './ViewOriginalToggle';
```

---

## 5. Authorized Files and Functions for Modification

### Files to CREATE (New)

| File Path | Purpose |
|-----------|---------|
| `/src/components/guest/index.ts` | Barrel exports for guest components |
| `/src/components/guest/ViewOriginalToggle/index.ts` | Component barrel export |
| `/src/components/guest/ViewOriginalToggle/ViewOriginalToggle.tsx` | Main toggle component |
| `/src/components/guest/ViewOriginalToggle/ViewOriginalToggle.types.ts` | TypeScript type definitions |

### Files to MODIFY (Existing)

None - This is a new component creation that does not modify existing files.

### Functions/Components to CREATE

| Function/Component | Location | Description |
|-------------------|----------|-------------|
| `ViewOriginalToggle` | `/src/components/guest/ViewOriginalToggle/ViewOriginalToggle.tsx` | Main toggle button component |
| `ViewOriginalToggleProps` | `/src/components/guest/ViewOriginalToggle/ViewOriginalToggle.types.ts` | Props interface |

### Dependencies (External Packages)

| Package | Import | Usage |
|---------|--------|-------|
| `lucide-react` | `ArrowRightLeft` | Swap/toggle icon |
| `clsx` | Via `cn()` | Class name merging |
| `tailwind-merge` | Via `cn()` | Tailwind class deduplication |

### Dependencies (Internal Modules)

| Module | Import | Usage |
|--------|--------|-------|
| `@/lib/utils` | `cn` | Class name utility |
| `@/types` | `SupportedLanguage`, `SUPPORTED_LOCALES` | Language type definitions |

---

## 6. Design Specifications

### Visual Design

**Button Style:** Secondary (outline)
- Background: `bg-white`
- Border: `border border-[#222222]`
- Text: `text-[#222222]`
- Hover: `hover:bg-[#F7F7F7]`, `hover:scale-[1.02]`
- Active: `active:scale-[0.98]`

**Sizing:**
- Minimum height: 48px (WCAG 2.5.5 touch target)
- Padding: `px-4 py-2.5`
- Font: `text-sm font-medium`
- Border radius: `rounded-lg`

**Icon:**
- Icon: `ArrowRightLeft` from Lucide
- Size: `w-4 h-4`
- Position: Left of text (before label)
- Hidden from screen readers: `aria-hidden="true"`

### States

| State | Appearance |
|-------|------------|
| Default (showing translation) | "View in original (English)" with swap icon |
| Toggled (showing original) | "View translation" with swap icon |
| Hover | Light gray background (#F7F7F7), slight scale up |
| Active/Pressed | Scale down effect |
| Focus | 2px ring with offset |
| Disabled | 50% opacity, no hover effects |

### Accessibility

- `aria-pressed`: Indicates toggle state
- `aria-label`: Descriptive label for screen readers
- Focus ring: `focus-visible:ring-2 focus-visible:ring-[#222222] focus-visible:ring-offset-2`
- Keyboard: Standard button behavior (Space/Enter activate)
- Touch target: 48px minimum (WCAG 2.5.5)

---

## 7. Testing Considerations

### Unit Tests to Create

1. **Render Tests:**
   - Renders without crashing with minimal props
   - Displays correct text when `isShowingOriginal` is false
   - Displays correct text when `isShowingOriginal` is true
   - Displays source language name in button text

2. **Interaction Tests:**
   - Calls `onToggle` when clicked
   - Does not call `onToggle` when disabled
   - Responds to keyboard activation (Enter/Space)

3. **Accessibility Tests:**
   - Has correct `aria-pressed` state
   - Has descriptive `aria-label`
   - Meets focus requirements

4. **Edge Cases:**
   - Handles unknown language codes gracefully
   - Handles undefined/null sourceLanguage

### Integration Testing Notes

- Test within TranslationBanner context
- Test with useGuestLanguage hook
- Verify state syncs with content display

---

## 8. Implementation Order

1. **Task 1:** Create types file (ViewOriginalToggle.types.ts)
2. **Task 2:** Create main component (ViewOriginalToggle.tsx)
3. **Task 3:** Create component barrel export (index.ts)
4. **Task 4:** Create guest components barrel export (/guest/index.ts)

**Estimated Effort:** 1-2 hours

---

## 9. Usage Example

```tsx
// In ItemDisplay.tsx or similar guest-facing component
import { ViewOriginalToggle } from '@/components/guest';
import { useGuestLanguage } from '@/hooks/useGuestLanguage';

function ItemDisplay({ item, translationMeta }) {
  const { showOriginal, toggleOriginal } = useGuestLanguage({
    sourceLanguage: translationMeta.sourceLanguage,
    availableTranslations: translationMeta.availableTranslations,
  });

  return (
    <div>
      {/* Only show toggle when viewing translated content */}
      {translationMeta.isShowingTranslation && (
        <ViewOriginalToggle
          isShowingOriginal={showOriginal}
          sourceLanguage={translationMeta.sourceLanguage}
          onToggle={toggleOriginal}
        />
      )}

      {/* Content display */}
      <h1>{showOriginal ? item.originalName : item.name}</h1>
    </div>
  );
}
```

---

## 10. Related Documents

- **PRD:** `/docs/prd/PRD_L10N_Epic4_Guest_Experience.md`
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`
- **Epic 4 Requests:** `/docs/gen_requests_epic4.md` (Request #11)
- **Related Components:**
  - TranslationBanner (REQ-E04-009)
  - MissingTranslationBanner (REQ-E04-010)
  - GuestLanguageSwitcher (REQ-E04-008)

---

## 11. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| SupportedLanguage type not available | Low | Medium | Fall back to language code string if type unavailable |
| SUPPORTED_LOCALES not exported | Low | Medium | Create local language map as fallback |
| Guest directory conflicts with future components | Low | Low | Follow established directory pattern from plan |

---

*Document generated for FAQBNB Localization Epic 4 - Guest Experience*
