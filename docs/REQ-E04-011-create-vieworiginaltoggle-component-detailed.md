# Detailed Task Breakdown: REQ-E04-011 - Create ViewOriginalToggle Component

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

## 1. Executive Summary

This document provides granular, implementation-ready tasks for creating the ViewOriginalToggle component. The component allows guests viewing translated content to toggle between the translation and the original source language version. Each task is designed to be approximately 1 story point in complexity.

---

## 2. Prerequisites Checklist

Before starting implementation, verify the following:

- [ ] `/src/contexts/LocaleContext.tsx` exists with `SupportedLanguage` type and `SUPPORTED_LOCALES` constant
- [ ] `/src/lib/utils.ts` exists with `cn()` utility function
- [ ] `lucide-react` package is installed (verify: `ArrowRightLeft` icon available)
- [ ] `/src/types/index.ts` exports locale types from LocaleContext

---

## 3. Implementation Tasks

### Task 3.4.1: Create Guest Component Directory Structure

**Story Points:** 0.5
**Type:** Setup
**Risk:** Low

**Description:**
Create the directory structure for guest components. The `/src/components/guest/` directory does not currently exist and needs to be created to establish the pattern for guest-facing components.

**Files to Create:**
```
/src/components/guest/
└── ViewOriginalToggle/
    └── (placeholder for subsequent files)
```

**Implementation Steps:**

1. Create the guest components directory:
   ```bash
   mkdir -p /src/components/guest/ViewOriginalToggle
   ```

2. Verify the directory structure is created correctly.

**Acceptance Criteria:**
- [ ] Directory `/src/components/guest/ViewOriginalToggle/` exists
- [ ] Directory permissions allow file creation

**Verification:**
```bash
ls -la /src/components/guest/ViewOriginalToggle/
```

---

### Task 3.4.2: Create ViewOriginalToggle Types File

**Story Points:** 0.5
**Type:** Types/Interfaces
**Risk:** Low

**File to Create:** `/src/components/guest/ViewOriginalToggle/ViewOriginalToggle.types.ts`

**Description:**
Define TypeScript type definitions for the ViewOriginalToggle component props interface.

**Implementation:**

```typescript
/**
 * ViewOriginalToggle.types.ts
 * Type definitions for the ViewOriginalToggle component
 *
 * REQ-E04-011: Create View Original Toggle Component
 * Last Modified: 2026-01-20
 */

import type { SupportedLanguage } from '@/types';

/**
 * Props interface for ViewOriginalToggle component
 */
export interface ViewOriginalToggleProps {
  /** Whether currently showing original content (true) or translated content (false) */
  isShowingOriginal: boolean;

  /** Original/source language code (e.g., 'en', 'es', 'fr') */
  sourceLanguage: SupportedLanguage;

  /** Callback function executed when the toggle button is clicked */
  onToggle: () => void;

  /** Disabled state - prevents interaction when true */
  disabled?: boolean;

  /** Additional CSS classes for custom styling */
  className?: string;
}
```

**Acceptance Criteria:**
- [ ] File exists at `/src/components/guest/ViewOriginalToggle/ViewOriginalToggle.types.ts`
- [ ] `ViewOriginalToggleProps` interface is exported
- [ ] All required props are defined: `isShowingOriginal`, `sourceLanguage`, `onToggle`
- [ ] Optional props have `?` modifier: `disabled`, `className`
- [ ] JSDoc comments document each prop
- [ ] Import uses `@/types` path alias

**Dependencies:**
- `SupportedLanguage` type from `/src/types/index.ts`

---

### Task 3.4.3: Create ViewOriginalToggle Component Implementation

**Story Points:** 1.5
**Type:** React Component
**Risk:** Low

**File to Create:** `/src/components/guest/ViewOriginalToggle/ViewOriginalToggle.tsx`

**Description:**
Implement the main ViewOriginalToggle component with secondary button styling, dynamic text based on state, accessibility features, and proper icon integration.

**Implementation:**

```typescript
/**
 * ViewOriginalToggle.tsx
 * Toggle component for switching between translated and original content
 *
 * REQ-E04-011: Create View Original Toggle Component
 * Last Modified: 2026-01-20
 */

'use client';

import { ArrowRightLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SUPPORTED_LOCALES } from '@/contexts/LocaleContext';
import type { ViewOriginalToggleProps } from './ViewOriginalToggle.types';

/**
 * ViewOriginalToggle Component
 *
 * A secondary-styled button that allows guests to toggle between viewing
 * translated content and the original source language version.
 *
 * Features:
 * - Dynamic button text based on current view state
 * - Secondary button styling (outline) per design system
 * - Accessible with ARIA attributes and keyboard support
 * - Responsive design for mobile devices
 * - ArrowRightLeft icon for visual toggle indication
 *
 * @example
 * ```tsx
 * <ViewOriginalToggle
 *   isShowingOriginal={false}
 *   sourceLanguage="es"
 *   onToggle={() => setShowOriginal(!showOriginal)}
 * />
 * ```
 */
export function ViewOriginalToggle({
  isShowingOriginal,
  sourceLanguage,
  onToggle,
  disabled = false,
  className,
}: ViewOriginalToggleProps) {
  // Get the display name for the source language
  const languageInfo = SUPPORTED_LOCALES.find(l => l.code === sourceLanguage);
  const languageName = languageInfo?.name || sourceLanguage.toUpperCase();

  // Dynamic button text based on current state
  // Text indicates the ACTION that will occur when clicked (not current state)
  const buttonText = isShowingOriginal
    ? 'View translation'
    : `View in original (${languageName})`;

  // Descriptive ARIA label for screen readers
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
        // Base styles - flexbox layout with centered content
        'inline-flex items-center justify-center gap-2',
        // Sizing - 48px min height for WCAG 2.5.5 touch targets
        'min-h-[48px] px-4 py-2.5',
        // Typography
        'rounded-lg font-medium text-sm',
        // Transitions
        'transition-all duration-200 ease-out',
        // Secondary button style (outline) - matches ActionButtons.tsx pattern
        'bg-white border border-[#222222] text-[#222222]',
        // Hover effects
        'hover:scale-[1.02] hover:bg-[#F7F7F7]',
        // Active/pressed effect
        'active:scale-[0.98]',
        // Focus styles for keyboard navigation
        'focus-visible:outline-none focus-visible:ring-2',
        'focus-visible:ring-[#222222] focus-visible:ring-offset-2',
        // Disabled state
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'disabled:hover:scale-100 disabled:hover:bg-white',
        // Custom classes
        className
      )}
    >
      <ArrowRightLeft
        className="w-4 h-4 flex-shrink-0"
        aria-hidden="true"
      />
      <span>{buttonText}</span>
    </button>
  );
}

export default ViewOriginalToggle;
```

**Acceptance Criteria:**
- [ ] File exists at `/src/components/guest/ViewOriginalToggle/ViewOriginalToggle.tsx`
- [ ] Component uses `'use client'` directive
- [ ] Component renders as a `<button>` element with `type="button"`
- [ ] Button displays correct text based on `isShowingOriginal` prop:
  - When `false`: "View in original ({LanguageName})"
  - When `true`: "View translation"
- [ ] `ArrowRightLeft` icon from lucide-react is displayed
- [ ] Icon has `aria-hidden="true"` to hide from screen readers
- [ ] Secondary button styling matches design system (white bg, dark border)
- [ ] Hover state: light gray background (#F7F7F7), slight scale (1.02)
- [ ] Active state: scale down (0.98)
- [ ] Focus state: 2px ring with offset
- [ ] Disabled state: 50% opacity, no-pointer cursor, hover effects disabled
- [ ] `aria-pressed` reflects `isShowingOriginal` state
- [ ] `aria-label` provides descriptive text for screen readers
- [ ] Minimum touch target height of 48px (WCAG 2.5.5)
- [ ] Component accepts and applies `className` prop
- [ ] `onToggle` callback is called when button is clicked
- [ ] Button does not trigger when `disabled={true}`

**Dependencies:**
- `ArrowRightLeft` from `lucide-react`
- `cn` from `/src/lib/utils`
- `SUPPORTED_LOCALES` from `/src/contexts/LocaleContext`
- `ViewOriginalToggleProps` from `./ViewOriginalToggle.types`

**Design Reference:**
- Secondary button pattern from `/src/components/SimpleDashboard/ActionButtons.tsx:78-82`

---

### Task 3.4.4: Create ViewOriginalToggle Component Barrel Export

**Story Points:** 0.25
**Type:** Module Export
**Risk:** Low

**File to Create:** `/src/components/guest/ViewOriginalToggle/index.ts`

**Description:**
Create the barrel export file for the ViewOriginalToggle component directory.

**Implementation:**

```typescript
/**
 * ViewOriginalToggle component exports
 *
 * REQ-E04-011: Create View Original Toggle Component
 * Last Modified: 2026-01-20
 */

export { ViewOriginalToggle, default } from './ViewOriginalToggle';
export type { ViewOriginalToggleProps } from './ViewOriginalToggle.types';
```

**Acceptance Criteria:**
- [ ] File exists at `/src/components/guest/ViewOriginalToggle/index.ts`
- [ ] Named export `ViewOriginalToggle` is available
- [ ] Default export is available
- [ ] Type export `ViewOriginalToggleProps` is available
- [ ] Imports work: `import { ViewOriginalToggle } from '@/components/guest/ViewOriginalToggle'`

---

### Task 3.4.5: Create Guest Components Root Barrel Export

**Story Points:** 0.25
**Type:** Module Export
**Risk:** Low

**File to Create:** `/src/components/guest/index.ts`

**Description:**
Create the root barrel export for all guest-facing components. This establishes the pattern for the guest components directory.

**Implementation:**

```typescript
/**
 * Guest-facing components for translated content display
 *
 * Epic 4 - Guest Experience Components
 * Last Modified: 2026-01-20
 */

// View Original Toggle - REQ-E04-011
export * from './ViewOriginalToggle';
```

**Acceptance Criteria:**
- [ ] File exists at `/src/components/guest/index.ts`
- [ ] All exports from ViewOriginalToggle are re-exported
- [ ] Import works: `import { ViewOriginalToggle } from '@/components/guest'`
- [ ] Type import works: `import type { ViewOriginalToggleProps } from '@/components/guest'`

**Note:** This barrel export will be expanded as additional guest components are added (GuestLanguageSwitcher, TranslationBanner, MissingTranslationBanner, etc.).

---

## 4. File Summary

### Files to CREATE

| # | File Path | Purpose | Task |
|---|-----------|---------|------|
| 1 | `/src/components/guest/ViewOriginalToggle/ViewOriginalToggle.types.ts` | TypeScript type definitions | 3.4.2 |
| 2 | `/src/components/guest/ViewOriginalToggle/ViewOriginalToggle.tsx` | Main toggle component | 3.4.3 |
| 3 | `/src/components/guest/ViewOriginalToggle/index.ts` | Component barrel export | 3.4.4 |
| 4 | `/src/components/guest/index.ts` | Guest components root barrel | 3.4.5 |

### Files to MODIFY

None - This is a new component creation that does not modify existing files.

### Final Directory Structure

```
/src/components/guest/
├── index.ts                         # Guest components barrel exports
└── ViewOriginalToggle/
    ├── index.ts                     # Component barrel export
    ├── ViewOriginalToggle.tsx       # Main toggle component
    └── ViewOriginalToggle.types.ts  # TypeScript type definitions
```

---

## 5. Testing Checklist

### Manual Testing

After implementation, verify the following scenarios:

1. **Render Tests:**
   - [ ] Component renders without errors
   - [ ] Displays "View in original (English)" when `isShowingOriginal={false}` and `sourceLanguage="en"`
   - [ ] Displays "View translation" when `isShowingOriginal={true}`
   - [ ] Displays correct language name for each supported language

2. **Interaction Tests:**
   - [ ] Clicking the button calls `onToggle` callback
   - [ ] Button does not respond to clicks when `disabled={true}`
   - [ ] Keyboard activation works (Enter/Space keys)

3. **Accessibility Tests:**
   - [ ] Screen reader announces button purpose
   - [ ] `aria-pressed` updates correctly with state changes
   - [ ] Focus ring is visible on keyboard focus
   - [ ] Touch target meets 48px minimum

4. **Visual Tests:**
   - [ ] Button matches secondary button design
   - [ ] Hover state shows light gray background
   - [ ] Icon displays correctly to the left of text
   - [ ] Responsive display on mobile widths

### Test Component Code

```tsx
// Test page: /src/app/test/vieworiginaltoggle/page.tsx (for development testing only)
'use client';

import { useState } from 'react';
import { ViewOriginalToggle } from '@/components/guest';

export default function TestViewOriginalToggle() {
  const [showOriginal, setShowOriginal] = useState(false);

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">ViewOriginalToggle Test</h1>

      {/* Default state */}
      <div className="space-y-2">
        <p className="text-sm text-gray-600">Current state: {showOriginal ? 'Original' : 'Translated'}</p>
        <ViewOriginalToggle
          isShowingOriginal={showOriginal}
          sourceLanguage="en"
          onToggle={() => setShowOriginal(!showOriginal)}
        />
      </div>

      {/* Different languages */}
      <div className="space-y-2">
        <p className="text-sm text-gray-600">Spanish source:</p>
        <ViewOriginalToggle
          isShowingOriginal={false}
          sourceLanguage="es"
          onToggle={() => {}}
        />
      </div>

      {/* Disabled state */}
      <div className="space-y-2">
        <p className="text-sm text-gray-600">Disabled:</p>
        <ViewOriginalToggle
          isShowingOriginal={false}
          sourceLanguage="en"
          onToggle={() => {}}
          disabled
        />
      </div>

      {/* Custom className */}
      <div className="space-y-2">
        <p className="text-sm text-gray-600">With custom class (full width):</p>
        <ViewOriginalToggle
          isShowingOriginal={false}
          sourceLanguage="fr"
          onToggle={() => {}}
          className="w-full"
        />
      </div>
    </div>
  );
}
```

---

## 6. Implementation Order

Execute tasks in the following order:

1. **Task 3.4.1:** Create directory structure
2. **Task 3.4.2:** Create types file
3. **Task 3.4.3:** Create main component
4. **Task 3.4.4:** Create component barrel export
5. **Task 3.4.5:** Create guest components root barrel export

**Estimated Total Effort:** 3 story points (~1-2 hours)

---

## 7. Usage Example (Post-Implementation)

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
      <p>{showOriginal ? item.originalDescription : item.description}</p>
    </div>
  );
}
```

---

## 8. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| `SupportedLanguage` type not exported from `@/types` | Low | Medium | Use direct import from `@/contexts/LocaleContext` as fallback |
| `SUPPORTED_LOCALES` not accessible | Low | Medium | Create local language map with names as fallback |
| Icon import fails | Low | Low | Verify lucide-react installation; use fallback icon |
| Unknown language code passed | Low | Low | Fallback to uppercase language code display |

---

## 9. Related Documents

- **Overview Document:** `/docs/REQ-E04-011-create-vieworiginaltoggle-component-overview.md`
- **PRD:** `/docs/prd/PRD_L10N_Epic4_Guest_Experience.md`
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`
- **Epic 4 Requests:** `/docs/gen_requests_epic4.md` (Request #11)

**Related Components (same phase):**
- GuestLanguageSwitcher (REQ-E04-008)
- TranslationBanner (REQ-E04-009)
- MissingTranslationBanner (REQ-E04-010)

---

## 10. Definition of Done

- [ ] All 5 tasks completed and files created
- [ ] Component renders without TypeScript errors
- [ ] Component renders without runtime errors
- [ ] All acceptance criteria verified
- [ ] Manual testing checklist completed
- [ ] Import from `@/components/guest` works
- [ ] Code follows existing project patterns

---

*Document generated for FAQBNB Localization Epic 4 - Guest Experience*
*Task 3.4: Create ViewOriginalToggle component*
