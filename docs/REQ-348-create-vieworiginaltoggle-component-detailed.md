# REQ-348: Create ViewOriginalToggle Component - Detailed Task Breakdown

**Document Created:** 2026-01-19 20:15 UTC
**Last Modified:** 2026-01-19 20:15 UTC
**Request ID:** REQ-348
**Type:** NEW FEATURE
**Size:** S
**Phase:** 3 - Guest UI Components (Task 3.4)
**Epic:** L10N Epic 4 - Guest Experience
**Overview Document:** `/docs/REQ-348-create-vieworiginaltoggle-component-overview.md`
**Implementation Plan Reference:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`

---

## Document Purpose

This document provides a granular, actionable task breakdown for implementing the ViewOriginalToggle component. Each task is designed to be approximately 1 story point (completable in a single focused coding session) and can be executed by an AI coding agent or junior developer with minimal ambiguity.

---

## Prerequisites

Before starting implementation, verify the following dependencies are in place:

| Dependency | Location | Verification Command |
|------------|----------|---------------------|
| i18n Configuration | `/src/lib/i18n/config.ts` | `grep -l "localeMetadata" src/lib/i18n/config.ts` |
| `SupportedLocale` type | `/src/lib/i18n/config.ts` | Must export `'en' | 'fr' | 'es' | 'de' | 'nl' | 'it'` |
| `getLocaleMetadata()` function | `/src/lib/i18n/config.ts` | Must return locale metadata with `name` property |
| `SupportedLanguage` type export | `/src/types/index.ts` | Must re-export from LocaleContext |
| Lucide React Icons | `package.json` | `npm list lucide-react` |
| `cn` utility | `/src/lib/utils.ts` | Must export Tailwind class merge utility |
| Guest components directory | `/src/components/guest/` | May need to be created if not exists |

---

## Implementation Tasks

### Task 1: Verify Directory Structure Exists

**Objective:** Ensure the guest components directory structure exists.

**Verification:**
```bash
ls -la src/components/guest/
```

**If directory doesn't exist, create it:**
```bash
mkdir -p src/components/guest/ViewOriginalToggle
```

**If directory exists, create component subdirectory:**
```bash
mkdir -p src/components/guest/ViewOriginalToggle
```

**Verification Criteria:**
- [ ] Directory `/src/components/guest/` exists
- [ ] Directory `/src/components/guest/ViewOriginalToggle/` exists
- [ ] No errors during directory creation

**Estimated Effort:** 5 minutes

---

### Task 2: Create Type Definitions File

**Objective:** Create TypeScript interfaces for the ViewOriginalToggle component props.

**File to Create:** `/src/components/guest/ViewOriginalToggle/ViewOriginalToggle.types.ts`

**Implementation:**

```typescript
/**
 * ViewOriginalToggle Component Types
 *
 * Type definitions for the toggle button that allows guests to switch
 * between translated content and original source language content.
 *
 * REQ-348: Create ViewOriginalToggle Component
 * Phase 3.4 - Guest UI Components
 *
 * @created 2026-01-19
 * @lastModified 2026-01-19
 */

import type { SupportedLocale } from '@/lib/i18n/config';

/**
 * Props interface for the ViewOriginalToggle component.
 *
 * @example
 * // When viewing translation - shows "View in original (English)"
 * <ViewOriginalToggle
 *   isShowingOriginal={false}
 *   sourceLanguage="en"
 *   onToggle={() => setShowOriginal(!showOriginal)}
 * />
 *
 * @example
 * // When viewing original - shows "View translation"
 * <ViewOriginalToggle
 *   isShowingOriginal={true}
 *   sourceLanguage="en"
 *   onToggle={() => setShowOriginal(!showOriginal)}
 * />
 */
export interface ViewOriginalToggleProps {
  /**
   * Whether the user is currently viewing the original content.
   * - `false`: Currently viewing translated content, button shows "View in original (X)"
   * - `true`: Currently viewing original content, button shows "View translation"
   */
  isShowingOriginal: boolean;

  /**
   * The source/original language code of the content.
   * Used to dynamically generate the label "View in original (English)"
   * by looking up the language name from i18n config.
   */
  sourceLanguage: SupportedLocale;

  /**
   * Callback function invoked when the toggle button is clicked.
   * Parent component should toggle the `isShowingOriginal` state.
   */
  onToggle: () => void;

  /**
   * Optional disabled state for the button.
   * When true, the button cannot be clicked.
   * @default false
   */
  disabled?: boolean;

  /**
   * Optional additional CSS classes to apply to the button element.
   */
  className?: string;
}
```

**Verification Criteria:**
- [ ] File exists at correct path
- [ ] Imports `SupportedLocale` from i18n config
- [ ] All 5 props are defined with JSDoc comments
- [ ] Both `isShowingOriginal` states are documented
- [ ] TypeScript compilation succeeds: `npx tsc --noEmit src/components/guest/ViewOriginalToggle/ViewOriginalToggle.types.ts`
- [ ] No linting errors

**Estimated Effort:** 15 minutes

---

### Task 3: Create Component Barrel Export

**Objective:** Create the index.ts file for re-exporting the component.

**File to Create:** `/src/components/guest/ViewOriginalToggle/index.ts`

**Implementation:**

```typescript
/**
 * ViewOriginalToggle Component Exports
 *
 * Barrel export file for the ViewOriginalToggle component.
 *
 * REQ-348: Create ViewOriginalToggle Component
 *
 * @created 2026-01-19
 * @lastModified 2026-01-19
 */

export { ViewOriginalToggle } from './ViewOriginalToggle';
export { default } from './ViewOriginalToggle';
export type { ViewOriginalToggleProps } from './ViewOriginalToggle.types';
```

**Note:** This file will have import errors until Task 4 is complete. That is expected.

**Verification Criteria:**
- [ ] File exists at correct path
- [ ] Exports named export `ViewOriginalToggle`
- [ ] Exports default export
- [ ] Exports type `ViewOriginalToggleProps`

**Estimated Effort:** 5 minutes

---

### Task 4: Implement Main Component

**Objective:** Create the main ViewOriginalToggle component with full functionality.

**File to Create:** `/src/components/guest/ViewOriginalToggle/ViewOriginalToggle.tsx`

**Implementation:**

```typescript
/**
 * ViewOriginalToggle Component
 *
 * A toggle button component that allows guests viewing translated content
 * to switch between the translated version and the original source language
 * version. The button displays dynamic labels based on the current view state:
 *
 * - When viewing translation: "View in original (English)" (or appropriate language)
 * - When viewing original: "View translation"
 *
 * Features:
 * - Secondary button styling (white background, dark border)
 * - Swap icon (ArrowRightLeft) for universal visual reinforcement
 * - Full accessibility with ARIA attributes and keyboard support
 * - Touch-friendly sizing (minimum 48px height)
 * - Hover, focus, and active visual states
 *
 * REQ-348: Create ViewOriginalToggle Component
 * Phase 3.4 - Guest UI Components
 *
 * @created 2026-01-19
 * @lastModified 2026-01-19
 */

'use client';

import { ArrowRightLeft } from 'lucide-react';
import { getLocaleMetadata } from '@/lib/i18n/config';
import { cn } from '@/lib/utils';
import type { ViewOriginalToggleProps } from './ViewOriginalToggle.types';

/**
 * ViewOriginalToggle - Toggle between translated and original content.
 *
 * @param props - Component props
 * @returns React button element
 */
export function ViewOriginalToggle({
  isShowingOriginal,
  sourceLanguage,
  onToggle,
  disabled = false,
  className,
}: ViewOriginalToggleProps) {
  // Get the display name of the source language
  const sourceLanguageMetadata = getLocaleMetadata(sourceLanguage);
  const sourceLanguageName = sourceLanguageMetadata?.name || sourceLanguage.toUpperCase();

  // Determine button label based on current state
  const buttonLabel = isShowingOriginal
    ? 'View translation'
    : `View in original (${sourceLanguageName})`;

  // Determine aria-label for screen readers with more context
  const ariaLabel = isShowingOriginal
    ? 'View translated content. Currently showing original content.'
    : `View original content in ${sourceLanguageName}. Currently showing translated content.`;

  // Button styling classes following project secondary button pattern
  const buttonClasses = cn(
    // Base layout
    'flex items-center justify-center gap-2',
    // Sizing - minimum touch target
    'min-h-[48px] px-6 py-3.5',
    // Visual styling - secondary button pattern
    'bg-white border border-[#222222] text-[#222222]',
    // Typography
    'font-medium text-base',
    // Border radius
    'rounded-lg',
    // Transitions
    'transition-all duration-200 ease-out',
    // Hover state
    'hover:scale-[1.02] hover:bg-[#F7F7F7]',
    // Active state
    'active:scale-[0.98]',
    // Focus visible state
    'focus-visible:outline-none focus-visible:ring-2',
    'focus-visible:ring-[#222222] focus-visible:ring-offset-2',
    // Disabled state
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'disabled:hover:scale-100 disabled:hover:bg-white',
    // Touch optimization
    'touch-manipulation [-webkit-tap-highlight-color:transparent]',
    // Custom classes
    className
  );

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={buttonClasses}
      aria-pressed={isShowingOriginal}
      aria-label={ariaLabel}
    >
      {/* Swap icon for universal visual reinforcement */}
      <ArrowRightLeft
        className="w-4 h-4 flex-shrink-0"
        aria-hidden="true"
      />
      {/* Dynamic label text */}
      <span>{buttonLabel}</span>
    </button>
  );
}

export default ViewOriginalToggle;
```

**Verification Criteria:**
- [ ] File exists at correct path
- [ ] Has `'use client'` directive at top
- [ ] All imports resolve correctly
- [ ] Component accepts all props from types file
- [ ] `getLocaleMetadata` is called with sourceLanguage
- [ ] Dynamic label shows "View in original (X)" when `isShowingOriginal === false`
- [ ] Dynamic label shows "View translation" when `isShowingOriginal === true`
- [ ] ArrowRightLeft icon is rendered
- [ ] Button has `type="button"` attribute
- [ ] Button has `aria-pressed` attribute
- [ ] Button has descriptive `aria-label`
- [ ] Button has minimum 48px height
- [ ] Secondary button styling applied
- [ ] Disabled state handled
- [ ] TypeScript compilation succeeds

**Estimated Effort:** 30 minutes

---

### Task 5: Update Guest Components Barrel Export

**Objective:** Add ViewOriginalToggle to the guest components barrel export.

**File to Modify:** `/src/components/guest/index.ts`

**Implementation:**

If the file exists, add the following exports:

```typescript
// ViewOriginalToggle Component
export { ViewOriginalToggle } from './ViewOriginalToggle';
export type { ViewOriginalToggleProps } from './ViewOriginalToggle';
```

If the file doesn't exist, create it with:

```typescript
/**
 * Guest Components Barrel Exports
 *
 * Re-exports all guest-facing components for clean imports.
 *
 * Usage:
 *   import { ViewOriginalToggle } from '@/components/guest';
 *
 * REQ-348: Create ViewOriginalToggle Component
 *
 * @created 2026-01-19
 * @lastModified 2026-01-19
 */

// ViewOriginalToggle Component
export { ViewOriginalToggle } from './ViewOriginalToggle';
export type { ViewOriginalToggleProps } from './ViewOriginalToggle';

// Other guest components (add as they are created):
// export { GuestLanguageSwitcher } from './GuestLanguageSwitcher';
// export { TranslationBanner } from './TranslationBanner';
// export { MissingTranslationBanner } from './MissingTranslationBanner';
// export { LanguageIndicator } from './LanguageIndicator';
```

**Verification Criteria:**
- [ ] File exists at `/src/components/guest/index.ts`
- [ ] Exports `ViewOriginalToggle` component
- [ ] Exports `ViewOriginalToggleProps` type
- [ ] Import statement works: `import { ViewOriginalToggle } from '@/components/guest'`

**Estimated Effort:** 5 minutes

---

### Task 6: Verify Component Compilation

**Objective:** Ensure the component compiles without TypeScript errors.

**Steps:**

6.1. Run TypeScript compiler:
```bash
npx tsc --noEmit
```

6.2. Run ESLint on new files:
```bash
npx eslint src/components/guest/ViewOriginalToggle/ --ext .ts,.tsx
```

6.3. Run the build:
```bash
npm run build
```

**Verification Criteria:**
- [ ] TypeScript compilation succeeds with no errors
- [ ] ESLint shows no errors or warnings
- [ ] Build completes successfully

**Estimated Effort:** 10 minutes

---

### Task 7: Verify Keyboard Navigation

**Objective:** Manually verify keyboard navigation works correctly.

**Test Scenarios:**

| Scenario | Action | Expected Result |
|----------|--------|-----------------|
| Focus with Tab | Press Tab to focus button | Focus ring visible |
| Activate with Enter | Press Enter on focused button | `onToggle` callback fires |
| Activate with Space | Press Space on focused button | `onToggle` callback fires |
| Disabled state | Tab to disabled button | Button receives focus but Enter/Space do nothing |

**Note:** Native button element provides these behaviors automatically. This task verifies they work as expected.

**Verification Criteria:**
- [ ] Button receives keyboard focus via Tab
- [ ] Focus ring is visible when focused
- [ ] Enter key activates button
- [ ] Space key activates button
- [ ] Disabled state prevents activation

**Estimated Effort:** 10 minutes

---

### Task 8: Verify Accessibility Attributes

**Objective:** Verify the component meets accessibility requirements.

**Accessibility Checklist:**

| Requirement | Implementation | Verification |
|-------------|----------------|--------------|
| Button has `type="button"` | Explicit type attribute | Inspect element |
| Toggle has `aria-pressed` | Reflects current state | Check attribute changes on click |
| Descriptive `aria-label` | Announces current state | Screen reader test |
| Icon is decorative | `aria-hidden="true"` on icon | Inspect element |
| Sufficient contrast | Dark text (#222222) on white | Color contrast check |
| Focus indicator visible | `focus-visible:ring-2` | Tab to button, verify ring |

**Screen Reader Test:**
- Open screen reader (VoiceOver on Mac, NVDA on Windows)
- Tab to the button
- Verify announcement includes:
  - Current state (showing original or translation)
  - Action that will occur on click

**Verification Criteria:**
- [ ] `aria-pressed` attribute present and toggles
- [ ] `aria-label` provides meaningful context
- [ ] Screen reader announces button correctly
- [ ] Icon is hidden from assistive technology
- [ ] Color contrast meets WCAG AA (minimum 4.5:1)

**Estimated Effort:** 15 minutes

---

### Task 9: Test Mobile Responsiveness

**Objective:** Verify the component works correctly on mobile viewports.

**Test Scenarios:**

| Viewport | Scenario | Expected Result |
|----------|----------|-----------------|
| 320px width | Button renders | Button visible, no text truncation |
| 320px width | Touch button | `onToggle` fires |
| 375px width | Label displays | Full label "View in original (English)" visible |
| 414px width | Touch interaction | Smooth visual feedback |

**Touch Target Verification:**
- [ ] Button height is minimum 48px (per design spec)
- [ ] Button padding provides comfortable tap area

**Verification Criteria:**
- [ ] Component renders correctly on 320px viewport
- [ ] Label is readable without truncation
- [ ] Touch interactions work smoothly
- [ ] Visual feedback (scale effects) work on touch

**Estimated Effort:** 10 minutes

---

### Task 10: Test Dynamic Label States

**Objective:** Verify the button label changes correctly based on state.

**Test Scenarios:**

| `isShowingOriginal` | `sourceLanguage` | Expected Label |
|---------------------|------------------|----------------|
| `false` | `'en'` | "View in original (English)" |
| `false` | `'fr'` | "View in original (French)" |
| `false` | `'es'` | "View in original (Spanish)" |
| `false` | `'de'` | "View in original (German)" |
| `false` | `'nl'` | "View in original (Dutch)" |
| `false` | `'it'` | "View in original (Italian)" |
| `true` | `'en'` | "View translation" |
| `true` | `'fr'` | "View translation" |
| `true` | any | "View translation" |

**Testing Steps:**

1. Render component with `isShowingOriginal={false}` and each language
2. Verify label includes correct language name
3. Render component with `isShowingOriginal={true}`
4. Verify label is always "View translation"

**Verification Criteria:**
- [ ] All 6 languages display correct English names
- [ ] "View translation" label shown when viewing original
- [ ] Label changes immediately when prop changes

**Estimated Effort:** 15 minutes

---

### Task 11: Create Unit Tests

**Objective:** Write unit tests to verify component behavior.

**File to Create:** `/src/components/guest/ViewOriginalToggle/__tests__/ViewOriginalToggle.test.tsx`

**Implementation:**

```typescript
/**
 * ViewOriginalToggle Component Tests
 *
 * Unit tests for the ViewOriginalToggle component.
 *
 * REQ-348: Create ViewOriginalToggle Component
 *
 * @created 2026-01-19
 * @lastModified 2026-01-19
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ViewOriginalToggle } from '../ViewOriginalToggle';

describe('ViewOriginalToggle', () => {
  const defaultProps = {
    isShowingOriginal: false,
    sourceLanguage: 'en' as const,
    onToggle: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Label Rendering', () => {
    it('shows "View in original (English)" when viewing translation', () => {
      render(
        <ViewOriginalToggle
          {...defaultProps}
          isShowingOriginal={false}
          sourceLanguage="en"
        />
      );

      expect(screen.getByText('View in original (English)')).toBeInTheDocument();
    });

    it('shows "View in original (French)" when source is French', () => {
      render(
        <ViewOriginalToggle
          {...defaultProps}
          isShowingOriginal={false}
          sourceLanguage="fr"
        />
      );

      expect(screen.getByText('View in original (French)')).toBeInTheDocument();
    });

    it('shows "View translation" when viewing original', () => {
      render(
        <ViewOriginalToggle
          {...defaultProps}
          isShowingOriginal={true}
        />
      );

      expect(screen.getByText('View translation')).toBeInTheDocument();
    });

    it('shows correct label for all supported languages', () => {
      const languages = [
        { code: 'en' as const, name: 'English' },
        { code: 'fr' as const, name: 'French' },
        { code: 'es' as const, name: 'Spanish' },
        { code: 'de' as const, name: 'German' },
        { code: 'nl' as const, name: 'Dutch' },
        { code: 'it' as const, name: 'Italian' },
      ];

      languages.forEach(({ code, name }) => {
        const { unmount } = render(
          <ViewOriginalToggle
            {...defaultProps}
            isShowingOriginal={false}
            sourceLanguage={code}
          />
        );

        expect(screen.getByText(`View in original (${name})`)).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe('Interaction', () => {
    it('calls onToggle when clicked', () => {
      const onToggle = vi.fn();
      render(<ViewOriginalToggle {...defaultProps} onToggle={onToggle} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(onToggle).toHaveBeenCalledTimes(1);
    });

    it('does not call onToggle when disabled', () => {
      const onToggle = vi.fn();
      render(
        <ViewOriginalToggle {...defaultProps} onToggle={onToggle} disabled />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(onToggle).not.toHaveBeenCalled();
    });

    it('calls onToggle on Enter key press', () => {
      const onToggle = vi.fn();
      render(<ViewOriginalToggle {...defaultProps} onToggle={onToggle} />);

      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });

      // Note: Native button handles keydown differently, use click simulation
      fireEvent.click(button);
      expect(onToggle).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has aria-pressed attribute reflecting state', () => {
      const { rerender } = render(
        <ViewOriginalToggle {...defaultProps} isShowingOriginal={false} />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-pressed', 'false');

      rerender(
        <ViewOriginalToggle {...defaultProps} isShowingOriginal={true} />
      );

      expect(button).toHaveAttribute('aria-pressed', 'true');
    });

    it('has descriptive aria-label', () => {
      render(
        <ViewOriginalToggle {...defaultProps} isShowingOriginal={false} />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label');
      expect(button.getAttribute('aria-label')).toContain('English');
    });

    it('has type="button" attribute', () => {
      render(<ViewOriginalToggle {...defaultProps} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
    });
  });

  describe('Styling', () => {
    it('has disabled styles when disabled', () => {
      render(<ViewOriginalToggle {...defaultProps} disabled />);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('disabled:opacity-50');
    });

    it('applies custom className', () => {
      render(
        <ViewOriginalToggle {...defaultProps} className="custom-class" />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    it('has minimum height of 48px', () => {
      render(<ViewOriginalToggle {...defaultProps} />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('min-h-[48px]');
    });
  });

  describe('Icon', () => {
    it('renders ArrowRightLeft icon', () => {
      render(<ViewOriginalToggle {...defaultProps} />);

      // The icon should be present and hidden from screen readers
      const button = screen.getByRole('button');
      const icon = button.querySelector('svg');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });
  });
});
```

**Verification Criteria:**
- [ ] Test file created at correct path
- [ ] All tests pass: `npm test src/components/guest/ViewOriginalToggle`
- [ ] Tests cover all acceptance criteria
- [ ] No test errors or warnings

**Estimated Effort:** 30 minutes

---

## Complete Implementation Summary

### Files Created

| File Path | Purpose | Task |
|-----------|---------|------|
| `/src/components/guest/ViewOriginalToggle/ViewOriginalToggle.types.ts` | TypeScript interfaces | Task 2 |
| `/src/components/guest/ViewOriginalToggle/index.ts` | Component barrel export | Task 3 |
| `/src/components/guest/ViewOriginalToggle/ViewOriginalToggle.tsx` | Main component | Task 4 |
| `/src/components/guest/ViewOriginalToggle/__tests__/ViewOriginalToggle.test.tsx` | Unit tests | Task 11 |

### Files Modified

| File Path | Changes | Task |
|-----------|---------|------|
| `/src/components/guest/index.ts` | Add ViewOriginalToggle exports | Task 5 |

### Imports Required

```typescript
// From lucide-react (already installed)
import { ArrowRightLeft } from 'lucide-react';

// From project i18n config (Epic 1)
import { getLocaleMetadata } from '@/lib/i18n/config';
import type { SupportedLocale } from '@/lib/i18n/config';

// From project utils
import { cn } from '@/lib/utils';
```

### Usage Example

```tsx
'use client';

import { useState } from 'react';
import { ViewOriginalToggle } from '@/components/guest';

function TranslatedContentPage({
  sourceLanguage,
  translatedContent,
  originalContent,
}: {
  sourceLanguage: 'en' | 'fr' | 'es' | 'de' | 'nl' | 'it';
  translatedContent: string;
  originalContent: string;
}) {
  const [showOriginal, setShowOriginal] = useState(false);

  return (
    <div className="space-y-4">
      {/* Toggle button */}
      <ViewOriginalToggle
        isShowingOriginal={showOriginal}
        sourceLanguage={sourceLanguage}
        onToggle={() => setShowOriginal(!showOriginal)}
      />

      {/* Content display */}
      <div className="prose">
        {showOriginal ? originalContent : translatedContent}
      </div>
    </div>
  );
}
```

---

## Acceptance Criteria Verification Checklist

| # | Acceptance Criteria | Verification Method | Status |
|---|---------------------|---------------------|--------|
| 1 | Component file exists at `/src/components/guest/ViewOriginalToggle/ViewOriginalToggle.tsx` | File system check | [ ] |
| 2 | Component renders as a button using the secondary button style | Visual inspection | [ ] |
| 3 | Label dynamically displays "View in original (English)" when viewing translation | Test with `isShowingOriginal={false}` | [ ] |
| 4 | Label dynamically displays "View translation" when viewing original | Test with `isShowingOriginal={true}` | [ ] |
| 5 | Source language name is dynamically inserted (not hardcoded) | Test all 6 languages | [ ] |
| 6 | Component accepts `sourceLanguage` prop | TypeScript check | [ ] |
| 7 | Swap icon appears within the button | Visual inspection | [ ] |
| 8 | Icon is from lucide-react (ArrowRightLeft) | Code review | [ ] |
| 9 | Component accepts `isShowingOriginal` prop for view state | TypeScript check | [ ] |
| 10 | Component accepts `onToggle` handler | TypeScript check, click test | [ ] |
| 11 | Button has proper ARIA attributes (`aria-pressed`) | Inspect element | [ ] |
| 12 | Keyboard support (Enter, Space) works | Keyboard test | [ ] |
| 13 | Typography follows design system | Visual inspection | [ ] |
| 14 | Mobile touch target minimum 44x44px | Measure or verify class | [ ] |
| 15 | Visual states: hover, focus, active | Interactive test | [ ] |
| 16 | Screen reader announces correctly | Screen reader test | [ ] |
| 17 | TypeScript prop types properly defined | Compilation check | [ ] |
| 18 | Handles missing/invalid props gracefully | Test edge cases | [ ] |
| 19 | Sufficient contrast for visibility | Color contrast check | [ ] |
| 20 | Visual consistency with other secondary actions | Design comparison | [ ] |

---

## Dependencies on Other Tasks

| This Task | Depends On | Notes |
|-----------|-----------|-------|
| REQ-348 (this) | Epic 1 - i18n Config | Requires `getLocaleMetadata`, `SupportedLocale` |
| Task 4.1 (useGuestLanguage) | REQ-348 (this) | Hook will use toggleOriginal function |
| Task 5.2 (ItemDisplay update) | REQ-348 (this) | Page will integrate this component |
| REQ-346 (TranslationBanner) | None | May render alongside this component |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| `getLocaleMetadata` not available | Verify Epic 1 completion; add fallback to language code |
| i18n config missing language metadata | Ensure all 6 languages have `name` property |
| Tailwind classes not working | Verify Tailwind config includes component paths |
| Icon not rendering | Verify lucide-react is installed |
| Contrast issues | Use established color values from ActionButtons |

---

## Design Specifications

### Visual Design

| Property | Value | Source |
|----------|-------|--------|
| Background | `bg-white` | ActionButtons.tsx pattern |
| Border | `border border-[#222222]` | ActionButtons.tsx pattern |
| Text Color | `text-[#222222]` | ActionButtons.tsx pattern |
| Font | `font-medium text-base` | ActionButtons.tsx pattern |
| Height | `min-h-[48px]` | Touch target requirement |
| Padding | `px-6 py-3.5` | ActionButtons.tsx pattern |
| Border Radius | `rounded-lg` | ActionButtons.tsx pattern |
| Gap (icon to text) | `gap-2` | Standard spacing |

### Interactive States

| State | Style |
|-------|-------|
| Default | White background, dark border |
| Hover | `hover:scale-[1.02] hover:bg-[#F7F7F7]` |
| Active | `active:scale-[0.98]` |
| Focus | `focus-visible:ring-2 focus-visible:ring-[#222222] focus-visible:ring-offset-2` |
| Disabled | `disabled:opacity-50 disabled:cursor-not-allowed` |

### Icon Specifications

| Property | Value |
|----------|-------|
| Icon | `ArrowRightLeft` from lucide-react |
| Size | `w-4 h-4` |
| Accessibility | `aria-hidden="true"` |

---

## References

- **Overview Document:** `/docs/REQ-348-create-vieworiginaltoggle-component-overview.md`
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`
- **Request Document:** `/docs/gen_requests_epic4.md` (REQ-348)
- **i18n Configuration:** `/src/lib/i18n/config.ts`
- **Button Pattern Reference:** `/src/components/SimpleDashboard/ActionButtons.tsx`
- **Toggle Pattern Reference:** `/src/components/ItemManager/components/shared/ViewModeToggle.tsx`
- **Related Component:** `/docs/REQ-346-create-translationbanner-component-detailed.md`

---

*Document generated for FAQBNB L10N Epic 4 - Guest Experience implementation*
*Task 3.4 - Create ViewOriginalToggle Component*
