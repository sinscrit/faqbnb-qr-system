# Detailed Task Breakdown: REQ-347 - Create MissingTranslationBanner Component

**Document Created:** 2026-01-19 17:30:00 UTC
**Last Modified:** 2026-01-19 17:30:00 UTC
**Request Reference:** docs/gen_requests_epic4.md - REQ-347
**Overview Document:** docs/REQ-347-create-missingtranslationbanner-component-overview.md
**Implementation Plan Reference:** docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md (Phase 3, Task 3.3)
**Epic:** L10N Epic 4 - Guest Experience
**Size:** S (Small)
**Priority:** P1 - High

---

## 1. Executive Summary

This document provides granular, actionable implementation tasks for creating the MissingTranslationBanner component. This component displays a subtle, non-alarming notification when a guest requests content in a language for which no translation is available. The banner informs users that content is being shown in the original language, using muted gray styling to maintain a calm, professional tone.

### 1.1 Scope

Create the MissingTranslationBanner component with:
- Type definitions file
- Main component implementation with accessibility support
- Barrel exports for clean imports
- Unit tests for all functionality
- Integration with guest components barrel export

### 1.2 Out of Scope

- Integration into ItemDisplay component (covered by REQ-320)
- Translation of banner text itself (future enhancement)
- Dismissible functionality (explicitly not required)

---

## 2. Pre-Implementation Checklist

Before starting implementation, verify:

- [ ] Epic 1 Foundation is complete with i18n config available at `/src/lib/i18n/config.ts`
- [ ] `localeMetadata` constant is exported with `name` property for all 6 supported languages
- [ ] `SupportedLocale` type is exported from `/src/lib/i18n/config.ts`
- [ ] `cn()` utility is available at `/src/lib/utils.ts`
- [ ] Lucide React icons are installed in the project (`lucide-react`)
- [ ] Directory `/src/components/guest/` exists or can be created

---

## 3. Detailed Implementation Tasks

### Task 3.1: Create Type Definitions File

**File:** `/src/components/guest/MissingTranslationBanner/MissingTranslationBanner.types.ts`
**Effort:** XS (Extra Small)
**Story Points:** 0.5

#### 3.1.1 Description

Create the TypeScript interface definitions for the MissingTranslationBanner component props. This file establishes the contract for how consumers will interact with the component.

#### 3.1.2 Step-by-Step Actions

1. **Create directory structure**
   ```bash
   mkdir -p /src/components/guest/MissingTranslationBanner
   ```

2. **Create the types file** at `/src/components/guest/MissingTranslationBanner/MissingTranslationBanner.types.ts`

3. **Add file header comment** with creation date and reference to REQ-347

4. **Import the SupportedLocale type** from i18n config:
   ```typescript
   import { SupportedLocale } from '@/lib/i18n/config';
   ```

5. **Define the MissingTranslationBannerProps interface** with:
   - `requestedLanguage: SupportedLocale` - Language the guest wanted
   - `displayLanguage: SupportedLocale` - Language being shown instead
   - `className?: string` - Optional additional CSS classes

6. **Add JSDoc comments** for each property explaining its purpose

#### 3.1.3 Expected Code Structure

```typescript
/**
 * MissingTranslationBanner Type Definitions
 *
 * Type definitions for the MissingTranslationBanner component that displays
 * when a guest's requested translation is not available.
 *
 * REQ-347: Create MissingTranslationBanner Component
 * Plan-111: L10N Epic 4 - Guest Experience, Phase 3, Task 3.3
 *
 * @created 2026-01-19
 * @lastModified 2026-01-19
 */

import { SupportedLocale } from '@/lib/i18n/config';

/**
 * Props for the MissingTranslationBanner component.
 */
export interface MissingTranslationBannerProps {
  /**
   * Language code that was requested by the guest.
   * This is the language the user wanted to view content in.
   */
  requestedLanguage: SupportedLocale;

  /**
   * Language code of the content being displayed (source/original language).
   * This is the fallback language shown when the requested translation is unavailable.
   */
  displayLanguage: SupportedLocale;

  /**
   * Additional CSS classes for container customization.
   * Classes are merged with component's default styles using cn().
   */
  className?: string;
}
```

#### 3.1.4 Acceptance Criteria

- [ ] File created at correct path
- [ ] TypeScript compiles without errors
- [ ] `MissingTranslationBannerProps` interface is exported
- [ ] `requestedLanguage` prop uses `SupportedLocale` type
- [ ] `displayLanguage` prop uses `SupportedLocale` type
- [ ] `className` prop is optional (`?`)
- [ ] All props have JSDoc documentation
- [ ] File header includes creation date and REQ reference

#### 3.1.5 Verification Commands

```bash
# Check TypeScript compilation
npx tsc --noEmit src/components/guest/MissingTranslationBanner/MissingTranslationBanner.types.ts

# Verify file exists
ls -la src/components/guest/MissingTranslationBanner/MissingTranslationBanner.types.ts
```

---

### Task 3.2: Create Main Component Implementation

**File:** `/src/components/guest/MissingTranslationBanner/MissingTranslationBanner.tsx`
**Effort:** S (Small)
**Story Points:** 2

#### 3.2.1 Description

Implement the main MissingTranslationBanner component. This is a client component that displays a muted informational banner when a guest's requested translation is unavailable. The banner uses subtle gray styling to inform without alarming.

#### 3.2.2 Step-by-Step Actions

1. **Create the component file** at `/src/components/guest/MissingTranslationBanner/MissingTranslationBanner.tsx`

2. **Add 'use client' directive** as the first line (required for client components in Next.js App Router)

3. **Add file header comment** with:
   - Component description
   - REQ-347 reference
   - Creation and modification dates

4. **Import dependencies:**
   ```typescript
   import { Info } from 'lucide-react';
   import { cn } from '@/lib/utils';
   import { localeMetadata } from '@/lib/i18n/config';
   import { MissingTranslationBannerProps } from './MissingTranslationBanner.types';
   ```

5. **Implement the component function:**
   - Destructure props: `requestedLanguage`, `displayLanguage`, `className`
   - Get language display names from `localeMetadata`
   - Return JSX with banner structure

6. **Apply styling per design specifications:**
   - Background: `bg-gray-100` (#F5F5F5)
   - Text color: `text-gray-500` (subdued)
   - Icon color: `text-gray-400`
   - Font size: `text-sm` (14px)
   - Padding: `px-4 py-3`
   - Full width: `w-full`
   - Flex layout for icon + text alignment

7. **Add accessibility attributes:**
   - `role="status"` on container
   - `aria-live="polite"` for non-urgent announcements
   - `aria-hidden="true"` on decorative icon

8. **Implement fallback for language names:**
   - Use `localeMetadata[code]?.name` with fallback to raw code

#### 3.2.3 Expected Code Structure

```typescript
'use client';

/**
 * MissingTranslationBanner Component
 *
 * Displays a subtle informational banner when a guest requests content in a
 * language for which no translation is available. The banner explains that
 * content is being shown in the original language instead.
 *
 * Uses muted gray styling to inform without creating alarm or suggesting an error.
 *
 * REQ-347: Create MissingTranslationBanner Component
 * Plan-111: L10N Epic 4 - Guest Experience, Phase 3, Task 3.3
 *
 * @example
 * ```tsx
 * <MissingTranslationBanner
 *   requestedLanguage="fr"
 *   displayLanguage="en"
 * />
 * // Renders: "French translation not available. Showing content in English."
 * ```
 *
 * @created 2026-01-19
 * @lastModified 2026-01-19
 */

import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { localeMetadata } from '@/lib/i18n/config';
import { MissingTranslationBannerProps } from './MissingTranslationBanner.types';

/**
 * Displays a muted banner when the requested translation is unavailable.
 *
 * @param props - Component props
 * @returns JSX element rendering the banner
 */
export function MissingTranslationBanner({
  requestedLanguage,
  displayLanguage,
  className,
}: MissingTranslationBannerProps) {
  // Get human-readable language names from metadata
  // Fallback to raw code if metadata lookup fails
  const requestedName = localeMetadata[requestedLanguage]?.name || requestedLanguage;
  const displayName = localeMetadata[displayLanguage]?.name || displayLanguage;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        // Layout
        'w-full flex items-center gap-3',
        // Spacing
        'px-4 py-3',
        // Colors - muted gray theme
        'bg-gray-100 text-gray-500',
        // Typography
        'text-sm',
        // Custom classes
        className
      )}
    >
      {/* Info icon - decorative, hidden from screen readers */}
      <Info
        className="w-4 h-4 text-gray-400 flex-shrink-0"
        aria-hidden="true"
      />

      {/* Message text */}
      <span>
        {requestedName} translation not available. Showing content in {displayName}.
      </span>
    </div>
  );
}

export default MissingTranslationBanner;
```

#### 3.2.4 Design Specifications Verification

| Specification | Implementation | Verified |
|---------------|----------------|----------|
| Background #F5F5F5 (gray-100) | `bg-gray-100` | [ ] |
| Text color #6B7280 (gray-500) | `text-gray-500` | [ ] |
| Icon color #9CA3AF (gray-400) | `text-gray-400` | [ ] |
| Font size 14px | `text-sm` | [ ] |
| Padding px-4 py-3 | `px-4 py-3` | [ ] |
| Full width | `w-full` | [ ] |
| Icon: Lucide Info | `<Info />` | [ ] |
| Non-dismissible | No dismiss button | [ ] |
| Accessibility role | `role="status"` | [ ] |
| Accessibility live | `aria-live="polite"` | [ ] |

#### 3.2.5 Acceptance Criteria

- [ ] Component is a client component (`'use client'` directive present)
- [ ] Component renders banner with muted gray background (gray-100)
- [ ] Info icon appears on the left with gray-400 color
- [ ] Icon has `aria-hidden="true"` attribute
- [ ] Message correctly displays requested and display language names
- [ ] Language names come from `localeMetadata`
- [ ] Fallback to raw code works if metadata unavailable
- [ ] Text uses subdued gray-500 color
- [ ] Font size is text-sm (14px)
- [ ] Component spans full width with appropriate padding
- [ ] No dismiss button present (component is non-dismissible)
- [ ] Component has `role="status"` for accessibility
- [ ] Component has `aria-live="polite"` for screen reader announcements
- [ ] Custom `className` prop merges correctly via `cn()`
- [ ] Works correctly on mobile viewports without horizontal scrolling
- [ ] TypeScript compiles without errors
- [ ] Component default export is provided

#### 3.2.6 Verification Commands

```bash
# Check TypeScript compilation
npx tsc --noEmit src/components/guest/MissingTranslationBanner/MissingTranslationBanner.tsx

# Build to verify no errors
npm run build

# Start dev server and visually verify
npm run dev
# Navigate to a test page to verify component renders
```

---

### Task 3.3: Create Barrel Export File

**File:** `/src/components/guest/MissingTranslationBanner/index.ts`
**Effort:** XS (Extra Small)
**Story Points:** 0.25

#### 3.3.1 Description

Create the barrel export file that enables clean imports of the component and its types from the component directory path.

#### 3.3.2 Step-by-Step Actions

1. **Create the index.ts file** at `/src/components/guest/MissingTranslationBanner/index.ts`

2. **Add file header comment** with component reference

3. **Export the main component:**
   ```typescript
   export { MissingTranslationBanner, default } from './MissingTranslationBanner';
   ```

4. **Export the types:**
   ```typescript
   export type { MissingTranslationBannerProps } from './MissingTranslationBanner.types';
   ```

#### 3.3.3 Expected Code Structure

```typescript
/**
 * MissingTranslationBanner Barrel Exports
 *
 * Provides clean import paths for the MissingTranslationBanner component
 * and its type definitions.
 *
 * @example
 * ```typescript
 * import { MissingTranslationBanner } from '@/components/guest/MissingTranslationBanner';
 * import type { MissingTranslationBannerProps } from '@/components/guest/MissingTranslationBanner';
 * ```
 *
 * REQ-347: Create MissingTranslationBanner Component
 *
 * @created 2026-01-19
 * @lastModified 2026-01-19
 */

// Component exports
export { MissingTranslationBanner, default } from './MissingTranslationBanner';

// Type exports
export type { MissingTranslationBannerProps } from './MissingTranslationBanner.types';
```

#### 3.3.4 Acceptance Criteria

- [ ] File created at correct path
- [ ] Named export for `MissingTranslationBanner` component
- [ ] Default export for `MissingTranslationBanner` component
- [ ] Type export for `MissingTranslationBannerProps`
- [ ] Can import using `from '@/components/guest/MissingTranslationBanner'`
- [ ] TypeScript compiles without errors

#### 3.3.5 Verification Commands

```bash
# Verify imports work
cat > /tmp/test-import.ts << 'EOF'
import { MissingTranslationBanner } from '@/components/guest/MissingTranslationBanner';
import type { MissingTranslationBannerProps } from '@/components/guest/MissingTranslationBanner';
EOF

# Check compilation (from project root)
npx tsc --noEmit
```

---

### Task 3.4: Update Guest Components Barrel Export

**File:** `/src/components/guest/index.ts`
**Effort:** XS (Extra Small)
**Story Points:** 0.25

#### 3.4.1 Description

Create or update the guest components barrel file to re-export the MissingTranslationBanner component. This enables importing all guest components from a single location.

#### 3.4.2 Step-by-Step Actions

1. **Check if `/src/components/guest/index.ts` exists**

2. **If file does not exist, create it:**
   - Add file header comment
   - Export MissingTranslationBanner

3. **If file exists, update it:**
   - Add export statement for MissingTranslationBanner
   - Maintain consistent export pattern with existing components

#### 3.4.3 Expected Code Structure (New File)

```typescript
/**
 * Guest Components Barrel Exports
 *
 * Centralized exports for all guest-facing components used in
 * the localization and internationalization features.
 *
 * Plan-111: L10N Epic 4 - Guest Experience, Phase 3
 *
 * @created 2026-01-19
 * @lastModified 2026-01-19
 */

// MissingTranslationBanner - REQ-347
export {
  MissingTranslationBanner,
  type MissingTranslationBannerProps,
} from './MissingTranslationBanner';

// Future exports for other guest components:
// - GuestLanguageSwitcher (REQ-345)
// - TranslationBanner (REQ-346)
// - ViewOriginalToggle (REQ-314)
// - LanguageIndicator (REQ-315)
```

#### 3.4.4 Expected Code Structure (Updating Existing File)

If the file already exists with other exports, add:

```typescript
// MissingTranslationBanner - REQ-347
export {
  MissingTranslationBanner,
  type MissingTranslationBannerProps,
} from './MissingTranslationBanner';
```

#### 3.4.5 Acceptance Criteria

- [ ] `/src/components/guest/index.ts` exists
- [ ] `MissingTranslationBanner` component is exported
- [ ] `MissingTranslationBannerProps` type is exported
- [ ] Can import using `from '@/components/guest'`
- [ ] Export pattern is consistent with other guest components (if any exist)
- [ ] TypeScript compiles without errors
- [ ] No existing imports are broken

#### 3.4.6 Verification Commands

```bash
# Verify imports work from guest barrel
cat > /tmp/test-barrel.ts << 'EOF'
import { MissingTranslationBanner } from '@/components/guest';
import type { MissingTranslationBannerProps } from '@/components/guest';
EOF

# Check compilation
npx tsc --noEmit
```

---

### Task 3.5: Add Unit Tests

**File:** `/src/components/guest/MissingTranslationBanner/__tests__/MissingTranslationBanner.test.tsx`
**Effort:** S (Small)
**Story Points:** 2

#### 3.5.1 Description

Create comprehensive unit tests for the MissingTranslationBanner component covering rendering, accessibility, language combinations, and edge cases.

#### 3.5.2 Step-by-Step Actions

1. **Create test directory:**
   ```bash
   mkdir -p /src/components/guest/MissingTranslationBanner/__tests__
   ```

2. **Create test file** at `/src/components/guest/MissingTranslationBanner/__tests__/MissingTranslationBanner.test.tsx`

3. **Add file header comment** with test description and REQ reference

4. **Import testing utilities:**
   ```typescript
   import { render, screen } from '@testing-library/react';
   import { describe, it, expect } from 'vitest';
   ```

5. **Import component under test:**
   ```typescript
   import { MissingTranslationBanner } from '../MissingTranslationBanner';
   ```

6. **Implement test suites** for:
   - Basic rendering
   - Message format correctness
   - All 6 language combinations
   - Accessibility attributes
   - Custom className merging
   - Edge cases (unknown codes)

#### 3.5.3 Expected Test Structure

```typescript
/**
 * MissingTranslationBanner Component Tests
 *
 * Comprehensive test suite for the MissingTranslationBanner component
 * verifying rendering, accessibility, and edge case handling.
 *
 * REQ-347: Create MissingTranslationBanner Component
 *
 * @created 2026-01-19
 * @lastModified 2026-01-19
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MissingTranslationBanner } from '../MissingTranslationBanner';

describe('MissingTranslationBanner', () => {
  // ==========================================================================
  // Basic Rendering Tests
  // ==========================================================================

  describe('Rendering', () => {
    it('renders with required props', () => {
      render(
        <MissingTranslationBanner
          requestedLanguage="fr"
          displayLanguage="en"
        />
      );

      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('renders the Info icon', () => {
      const { container } = render(
        <MissingTranslationBanner
          requestedLanguage="fr"
          displayLanguage="en"
        />
      );

      // Check for SVG icon (Lucide icons render as SVG)
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('applies correct background color class', () => {
      render(
        <MissingTranslationBanner
          requestedLanguage="fr"
          displayLanguage="en"
        />
      );

      const banner = screen.getByRole('status');
      expect(banner).toHaveClass('bg-gray-100');
    });

    it('applies correct text color class', () => {
      render(
        <MissingTranslationBanner
          requestedLanguage="fr"
          displayLanguage="en"
        />
      );

      const banner = screen.getByRole('status');
      expect(banner).toHaveClass('text-gray-500');
    });
  });

  // ==========================================================================
  // Message Format Tests
  // ==========================================================================

  describe('Message Format', () => {
    it('displays correct message format with language names', () => {
      render(
        <MissingTranslationBanner
          requestedLanguage="fr"
          displayLanguage="en"
        />
      );

      expect(
        screen.getByText(/French translation not available\. Showing content in English\./i)
      ).toBeInTheDocument();
    });

    it('displays German requested, Spanish displayed', () => {
      render(
        <MissingTranslationBanner
          requestedLanguage="de"
          displayLanguage="es"
        />
      );

      expect(
        screen.getByText(/German translation not available\. Showing content in Spanish\./i)
      ).toBeInTheDocument();
    });

    it('displays Dutch requested, Italian displayed', () => {
      render(
        <MissingTranslationBanner
          requestedLanguage="nl"
          displayLanguage="it"
        />
      );

      expect(
        screen.getByText(/Dutch translation not available\. Showing content in Italian\./i)
      ).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // All Language Combinations Tests
  // ==========================================================================

  describe('Language Combinations', () => {
    const languageNames: Record<string, string> = {
      en: 'English',
      fr: 'French',
      es: 'Spanish',
      de: 'German',
      nl: 'Dutch',
      it: 'Italian',
    };

    const supportedLanguages = ['en', 'fr', 'es', 'de', 'nl', 'it'] as const;

    supportedLanguages.forEach((requested) => {
      supportedLanguages
        .filter((display) => display !== requested)
        .forEach((display) => {
          it(`handles ${requested} requested, ${display} displayed`, () => {
            render(
              <MissingTranslationBanner
                requestedLanguage={requested}
                displayLanguage={display}
              />
            );

            const expectedText = new RegExp(
              `${languageNames[requested]} translation not available\\. Showing content in ${languageNames[display]}\\.`,
              'i'
            );
            expect(screen.getByText(expectedText)).toBeInTheDocument();
          });
        });
    });
  });

  // ==========================================================================
  // Accessibility Tests
  // ==========================================================================

  describe('Accessibility', () => {
    it('has role="status" for screen readers', () => {
      render(
        <MissingTranslationBanner
          requestedLanguage="fr"
          displayLanguage="en"
        />
      );

      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('has aria-live="polite" for non-urgent announcements', () => {
      render(
        <MissingTranslationBanner
          requestedLanguage="fr"
          displayLanguage="en"
        />
      );

      const banner = screen.getByRole('status');
      expect(banner).toHaveAttribute('aria-live', 'polite');
    });

    it('has aria-hidden on decorative icon', () => {
      const { container } = render(
        <MissingTranslationBanner
          requestedLanguage="fr"
          displayLanguage="en"
        />
      );

      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('aria-hidden', 'true');
    });
  });

  // ==========================================================================
  // Custom ClassName Tests
  // ==========================================================================

  describe('Custom className', () => {
    it('applies custom className to container', () => {
      render(
        <MissingTranslationBanner
          requestedLanguage="fr"
          displayLanguage="en"
          className="custom-class"
        />
      );

      const banner = screen.getByRole('status');
      expect(banner).toHaveClass('custom-class');
    });

    it('merges custom className with default classes', () => {
      render(
        <MissingTranslationBanner
          requestedLanguage="fr"
          displayLanguage="en"
          className="mt-4"
        />
      );

      const banner = screen.getByRole('status');
      expect(banner).toHaveClass('bg-gray-100'); // Default class
      expect(banner).toHaveClass('mt-4'); // Custom class
    });

    it('renders without className prop', () => {
      render(
        <MissingTranslationBanner
          requestedLanguage="fr"
          displayLanguage="en"
        />
      );

      const banner = screen.getByRole('status');
      expect(banner).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // Edge Cases Tests
  // ==========================================================================

  describe('Edge Cases', () => {
    it('handles same language for requested and display gracefully', () => {
      // This is an edge case that shouldn't occur in practice,
      // but the component should handle it without crashing
      render(
        <MissingTranslationBanner
          requestedLanguage="en"
          displayLanguage="en"
        />
      );

      expect(
        screen.getByText(/English translation not available\. Showing content in English\./i)
      ).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // Non-Dismissible Verification Tests
  // ==========================================================================

  describe('Non-Dismissible Behavior', () => {
    it('does not render a dismiss button', () => {
      render(
        <MissingTranslationBanner
          requestedLanguage="fr"
          displayLanguage="en"
        />
      );

      // Should not find any buttons
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('does not render a close icon', () => {
      const { container } = render(
        <MissingTranslationBanner
          requestedLanguage="fr"
          displayLanguage="en"
        />
      );

      // Should only have one SVG (the Info icon)
      const svgs = container.querySelectorAll('svg');
      expect(svgs).toHaveLength(1);
    });
  });

  // ==========================================================================
  // Layout Tests
  // ==========================================================================

  describe('Layout', () => {
    it('has full width class', () => {
      render(
        <MissingTranslationBanner
          requestedLanguage="fr"
          displayLanguage="en"
        />
      );

      const banner = screen.getByRole('status');
      expect(banner).toHaveClass('w-full');
    });

    it('has flex layout for icon and text alignment', () => {
      render(
        <MissingTranslationBanner
          requestedLanguage="fr"
          displayLanguage="en"
        />
      );

      const banner = screen.getByRole('status');
      expect(banner).toHaveClass('flex');
      expect(banner).toHaveClass('items-center');
    });

    it('has text-sm for smaller font size', () => {
      render(
        <MissingTranslationBanner
          requestedLanguage="fr"
          displayLanguage="en"
        />
      );

      const banner = screen.getByRole('status');
      expect(banner).toHaveClass('text-sm');
    });
  });
});
```

#### 3.5.4 Test Coverage Requirements

| Test Category | Description | Tests |
|---------------|-------------|-------|
| Basic Rendering | Component renders correctly | 4 tests |
| Message Format | Message displays correctly | 3 tests |
| Language Combinations | All 6 languages work | 30 tests (6 x 5 combinations) |
| Accessibility | ARIA attributes present | 3 tests |
| Custom className | Class merging works | 3 tests |
| Edge Cases | Edge case handling | 1 test |
| Non-Dismissible | No dismiss functionality | 2 tests |
| Layout | Layout classes applied | 3 tests |

**Total: ~49 tests**

#### 3.5.5 Acceptance Criteria

- [ ] Test file created at correct path
- [ ] All tests pass when run with `npm test`
- [ ] Tests verify component renders with all required props
- [ ] Tests verify correct message format
- [ ] Tests cover all 6 supported language combinations
- [ ] Tests verify `role="status"` attribute
- [ ] Tests verify `aria-live="polite"` attribute
- [ ] Tests verify icon has `aria-hidden="true"`
- [ ] Tests verify custom className merging
- [ ] Tests verify no dismiss button exists
- [ ] Tests verify layout classes are applied
- [ ] Test coverage meets minimum 80% threshold

#### 3.5.6 Verification Commands

```bash
# Run all tests for this component
npm test -- src/components/guest/MissingTranslationBanner

# Run tests with coverage
npm test -- --coverage src/components/guest/MissingTranslationBanner

# Run tests in watch mode during development
npm test -- --watch src/components/guest/MissingTranslationBanner
```

---

## 4. File Manifest

### 4.1 Files to Create

| File Path | Task | Purpose |
|-----------|------|---------|
| `/src/components/guest/MissingTranslationBanner/MissingTranslationBanner.types.ts` | 3.1 | TypeScript interface definitions |
| `/src/components/guest/MissingTranslationBanner/MissingTranslationBanner.tsx` | 3.2 | Main component implementation |
| `/src/components/guest/MissingTranslationBanner/index.ts` | 3.3 | Barrel exports |
| `/src/components/guest/MissingTranslationBanner/__tests__/MissingTranslationBanner.test.tsx` | 3.5 | Unit tests |

### 4.2 Files to Create or Modify

| File Path | Task | Changes |
|-----------|------|---------|
| `/src/components/guest/index.ts` | 3.4 | Create if doesn't exist, or add MissingTranslationBanner export |

### 4.3 Files to Reference (Read-Only)

| File Path | Purpose |
|-----------|---------|
| `/src/lib/i18n/config.ts` | `localeMetadata` and `SupportedLocale` type |
| `/src/lib/utils.ts` | `cn()` utility function |
| `/src/components/ItemCreationWorkflow/components/shared/SessionRecoveryBanner.tsx` | Pattern reference for banner structure |

---

## 5. Implementation Order

Execute tasks in the following sequence:

```
Task 3.1: Types File
    │
    ▼
Task 3.2: Main Component
    │
    ▼
Task 3.3: Barrel Export
    │
    ▼
Task 3.4: Guest Barrel Export
    │
    ▼
Task 3.5: Unit Tests
```

**Rationale:**
- Types must be created first as the component imports them
- Main component must exist before barrel exports
- Component barrel must exist before guest barrel can re-export
- Tests come last to verify complete implementation

---

## 6. Testing Strategy

### 6.1 Unit Testing (Task 3.5)

- Test rendering with all required props
- Test all 30 language combination permutations
- Test accessibility attributes
- Test className merging
- Test edge cases

### 6.2 Manual Testing Checklist

After implementation, manually verify:

- [ ] Component displays correctly in browser
- [ ] Gray background color matches specification (#F5F5F5)
- [ ] Text color is subdued gray (#6B7280)
- [ ] Icon appears on the left
- [ ] Icon color is muted (#9CA3AF)
- [ ] Text is smaller than primary content (14px)
- [ ] Banner spans full width
- [ ] No horizontal scrolling on mobile
- [ ] Screen reader announces content appropriately
- [ ] No dismiss button or close functionality

### 6.3 Visual Verification

Create a test page or Storybook story to visually verify the component:

```tsx
// Temporary test page at /src/app/test-banner/page.tsx
import { MissingTranslationBanner } from '@/components/guest/MissingTranslationBanner';

export default function TestBannerPage() {
  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">MissingTranslationBanner Test</h1>

      <MissingTranslationBanner
        requestedLanguage="fr"
        displayLanguage="en"
      />

      <MissingTranslationBanner
        requestedLanguage="de"
        displayLanguage="es"
      />

      <MissingTranslationBanner
        requestedLanguage="nl"
        displayLanguage="it"
        className="mt-8"
      />
    </div>
  );
}
```

---

## 7. Definition of Done

This task is complete when all of the following are verified:

### 7.1 Code Complete

- [ ] All 5 implementation tasks completed
- [ ] All files created at correct paths
- [ ] TypeScript compiles without errors
- [ ] No ESLint errors or warnings

### 7.2 Functionality Complete

- [ ] Component renders correctly with all language combinations
- [ ] Styling matches design specifications (muted gray, subtle)
- [ ] Non-dismissible (no close button)
- [ ] Mobile responsive without horizontal scroll

### 7.3 Accessibility Complete

- [ ] `role="status"` present
- [ ] `aria-live="polite"` present
- [ ] Icon has `aria-hidden="true"`
- [ ] Color contrast meets WCAG AA (gray-500 on gray-100 = 4.48:1)

### 7.4 Testing Complete

- [ ] All unit tests pass
- [ ] Test coverage exceeds 80%
- [ ] Manual testing completed
- [ ] Visual inspection passed

### 7.5 Integration Complete

- [ ] Can be imported from barrel exports
- [ ] Can be imported from guest components barrel
- [ ] Follows project conventions and patterns

---

## 8. Appendix

### 8.1 Design Visual Reference

```
+-------------------------------------------------------------------------+
|  (i)  French translation not available. Showing content in English.     |
+-------------------------------------------------------------------------+
   ^                              ^
   Info icon                      Muted text
   (gray-400)                     (gray-500, text-sm)

Background: gray-100 (#F5F5F5)
```

### 8.2 Contrast Comparison with TranslationBanner

| Property | TranslationBanner (REQ-346) | MissingTranslationBanner (REQ-347) |
|----------|-----------------------------|------------------------------------|
| Background | Light blue (#E3F2FD) | Light gray (#F5F5F5) |
| Purpose | "Content is translated" | "Translation not available" |
| Icon | Globe | Info |
| Action | "View original" link | None |
| Tone | Informative, positive | Neutral, explanatory |

### 8.3 Color Specifications

| Element | Hex Color | Tailwind Class |
|---------|-----------|----------------|
| Background | #F5F5F5 | bg-gray-100 |
| Text | #6B7280 | text-gray-500 |
| Icon | #9CA3AF | text-gray-400 |

### 8.4 Related Requests

- **REQ-346:** Create TranslationBanner Component (sister component with blue styling)
- **REQ-320:** Update ItemDisplay Component for Guest Translation Support (consumer)
- **REQ-316:** Create Barrel Exports for Guest Components

---

## 9. References

- **Request:** `/docs/gen_requests_epic4.md` (REQ-347)
- **Overview:** `/docs/REQ-347-create-missingtranslationbanner-component-overview.md`
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`
- **Pattern Reference:** `/src/components/ItemCreationWorkflow/components/shared/SessionRecoveryBanner.tsx`
- **i18n Config:** `/src/lib/i18n/config.ts`
- **Utilities:** `/src/lib/utils.ts`
