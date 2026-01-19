# REQ-343: Create TranslationProgressBar Component - Detailed Task Breakdown

**Document Type:** Detailed Implementation Tasks (Senior Dev Breakdown)
**Request ID:** REQ-343, Task 2.4
**Created:** 2026-01-19
**Last Modified:** 2026-01-19
**Status:** Ready for Implementation
**Phase:** 2 - Core UI Components
**Parent Epic:** L10N Epic 5 - Owner Translation Management

---

## Document Purpose

This document provides granular, implementation-ready tasks for creating the `TranslationProgressBar` component. Each task is scoped to approximately 1 story point and includes specific file paths, code patterns, and acceptance criteria that an AI coding agent or junior developer can execute step-by-step.

---

## Component Summary

The `TranslationProgressBar` component is a visual progress indicator that displays translation completion status across all supported languages. It provides:
- Horizontal progress bar with fill indicating completion percentage
- Text label showing "X/Y translations complete"
- Animated state during active translation processing
- Multiple size variants (sm, md, lg)
- Full accessibility support with ARIA attributes

This component is stateless and controlled, receiving all data via props. It is designed for reuse in the TranslationPreviewPanel, dashboard widgets, and item grids.

---

## Prerequisites

| Dependency | Status | Notes |
|------------|--------|-------|
| Task 2.1: TranslationManagement.types.ts | Must complete first | Shared types (TranslationProgressBarProps) |
| cn utility | Available | `/src/lib/utils.ts` |
| LoadingState pattern | Available | `/src/components/ItemManager/components/shared/LoadingState.tsx` |

---

## Task Breakdown

### Task 2.4.1: Create Component Directory and File Structure

**Effort:** 1 story point (~15 minutes)
**Dependencies:** Task 2.1 (TranslationManagement.types.ts) must be complete

#### Description
Create the component file with proper file header, imports, and JSDoc documentation. Ensure the directory structure exists.

#### Files to Create
- `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationProgressBar.tsx`

#### Implementation Steps

1. Verify the directory exists (should exist from Task 2.3):
   ```
   /src/components/TranslationManagement/TranslationPreviewPanel/
   ```

2. Create `TranslationProgressBar.tsx` with the following structure:

```typescript
'use client';

/**
 * TranslationProgressBar Component
 *
 * Visual progress indicator showing translation completion status.
 * Displays a horizontal progress bar with fill indicating percentage
 * and an optional text label showing completion count.
 *
 * Features:
 * - Multiple size variants (sm, md, lg)
 * - Animated state during active processing (pulse effect)
 * - Full accessibility with ARIA progressbar role
 * - Responsive width (adapts to container)
 *
 * Color scheme (from Plan-111):
 * - Progress fill: green (#22C55E) - bg-green-500
 * - Background: gray (#E5E7EB) - bg-gray-200
 * - Label text: gray (#374151) - text-gray-700
 *
 * @module TranslationManagement/TranslationPreviewPanel/TranslationProgressBar
 * @created 2026-01-19
 * @lastModified 2026-01-19
 */

import React from 'react';
import { cn } from '@/lib/utils';

// Component implementation follows in subsequent tasks...
```

#### Acceptance Criteria
- [ ] Directory `/src/components/TranslationManagement/TranslationPreviewPanel/` exists
- [ ] File `TranslationProgressBar.tsx` is created
- [ ] File contains `'use client'` directive
- [ ] File contains JSDoc header with component description
- [ ] Required imports are present (React, cn)
- [ ] File compiles without TypeScript errors

---

### Task 2.4.2: Define Props Interface and Size Configuration

**Effort:** 1 story point (~15 minutes)
**Dependencies:** Task 2.4.1

#### Description
Define the `TranslationProgressBarProps` interface and create the size configuration constant for different progress bar variants.

#### File to Modify
- `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationProgressBar.tsx`

#### Implementation Steps

1. Add the props interface after the imports:

```typescript
// =============================================================================
// Types
// =============================================================================

/**
 * Props for the TranslationProgressBar component
 */
export interface TranslationProgressBarProps {
  /** Number of completed translations */
  completed: number;

  /** Total number of translations expected */
  total: number;

  /** Whether to show the count label (e.g., "3/5 translations complete") */
  showLabel?: boolean;

  /** Whether to animate the progress bar during processing */
  isAnimating?: boolean;

  /** Size variant for the progress bar */
  size?: 'sm' | 'md' | 'lg';

  /** Additional CSS classes for the container */
  className?: string;
}
```

2. Add the size configuration constant:

```typescript
// =============================================================================
// Constants
// =============================================================================

/**
 * Size configuration for progress bar variants
 * Maps size prop to bar height, corner radius, and label font size
 */
const SIZE_CONFIG = {
  sm: {
    bar: 'h-1.5 rounded',      // 6px height
    label: 'text-xs',           // 12px font
  },
  md: {
    bar: 'h-2 rounded',         // 8px height
    label: 'text-sm',           // 14px font
  },
  lg: {
    bar: 'h-3 rounded-md',      // 12px height
    label: 'text-base',         // 16px font
  },
} as const;

/**
 * Type for size configuration keys
 */
type SizeKey = keyof typeof SIZE_CONFIG;
```

#### Acceptance Criteria
- [ ] `TranslationProgressBarProps` interface is defined with all required props
- [ ] All props have JSDoc comments
- [ ] `completed` and `total` are required number props
- [ ] `showLabel`, `isAnimating`, `size`, `className` are optional
- [ ] `size` has type union `'sm' | 'md' | 'lg'`
- [ ] `SIZE_CONFIG` object maps all 3 sizes
- [ ] Each size config includes `bar` and `label` classes
- [ ] TypeScript compiles without errors

---

### Task 2.4.3: Implement Percentage Calculation and State Logic

**Effort:** 1 story point (~10 minutes)
**Dependencies:** Task 2.4.2

#### Description
Implement the core calculation logic for progress percentage and determine the label text to display.

#### File to Modify
- `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationProgressBar.tsx`

#### Implementation Steps

1. Add helper functions for calculation:

```typescript
// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Calculate progress percentage from completed/total
 * Returns 0-100, handles edge cases (zero total, overflow)
 */
function calculatePercentage(completed: number, total: number): number {
  if (total <= 0) return 0;
  if (completed < 0) return 0;
  if (completed >= total) return 100;
  return Math.round((completed / total) * 100);
}

/**
 * Generate the label text based on completion state
 */
function getLabelText(completed: number, total: number): string {
  if (total === 0) {
    return 'No translations';
  }

  if (completed === total) {
    return `${completed}/${total} translations complete`;
  }

  return `${completed}/${total} translations`;
}
```

#### Acceptance Criteria
- [ ] `calculatePercentage` function handles zero total (returns 0)
- [ ] `calculatePercentage` function handles negative completed (returns 0)
- [ ] `calculatePercentage` function handles completed > total (returns 100)
- [ ] `calculatePercentage` returns rounded integer 0-100
- [ ] `getLabelText` returns "No translations" when total is 0
- [ ] `getLabelText` returns "X/Y translations complete" when completed === total
- [ ] `getLabelText` returns "X/Y translations" for partial completion
- [ ] TypeScript compiles without errors

---

### Task 2.4.4: Implement Main Component Structure

**Effort:** 1 story point (~20 minutes)
**Dependencies:** Task 2.4.3

#### Description
Implement the main `TranslationProgressBar` component with the progress bar structure and label.

#### File to Modify
- `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationProgressBar.tsx`

#### Implementation Steps

1. Add the main component implementation:

```typescript
// =============================================================================
// Main Component
// =============================================================================

/**
 * TranslationProgressBar - Visual progress indicator for translation completion
 *
 * Layout structure:
 * ┌─────────────────────────────────────────────────────────────────┐
 * │  ┌───────────────────────────────────────────────────────────┐  │
 * │  │ ████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │  │
 * │  │ ← Filled (60%) →              ← Empty (40%) →            │  │
 * │  └───────────────────────────────────────────────────────────┘  │
 * │                                                                  │
 * │                     3/5 translations complete                    │
 * └─────────────────────────────────────────────────────────────────┘
 *
 * @example
 * // Basic usage
 * <TranslationProgressBar completed={3} total={5} />
 *
 * @example
 * // With animation during processing
 * <TranslationProgressBar completed={2} total={5} isAnimating showLabel />
 *
 * @example
 * // Large size variant
 * <TranslationProgressBar completed={5} total={5} size="lg" />
 */
export function TranslationProgressBar({
  completed,
  total,
  showLabel = true,
  isAnimating = false,
  size = 'md',
  className,
}: TranslationProgressBarProps) {
  // Calculate percentage and label
  const percentage = calculatePercentage(completed, total);
  const labelText = getLabelText(completed, total);
  const sizeConfig = SIZE_CONFIG[size];

  // Generate unique ID for aria-describedby
  const labelId = React.useId();

  return (
    <div className={cn('w-full', className)}>
      {/* Progress bar container */}
      <div
        className={cn(
          'w-full bg-gray-200 overflow-hidden',
          sizeConfig.bar
        )}
        role="progressbar"
        aria-valuenow={completed}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-describedby={showLabel ? labelId : undefined}
        aria-label={`Translation progress: ${percentage}% complete`}
      >
        {/* Filled portion */}
        <div
          className={cn(
            'h-full bg-green-500 transition-all duration-300 ease-out',
            isAnimating && 'animate-pulse'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Label */}
      {showLabel && (
        <p
          id={labelId}
          className={cn(
            'mt-1 text-gray-700',
            sizeConfig.label
          )}
        >
          {labelText}
        </p>
      )}
    </div>
  );
}
```

#### Acceptance Criteria
- [ ] Component accepts all props from `TranslationProgressBarProps`
- [ ] Default values: `showLabel=true`, `isAnimating=false`, `size='md'`
- [ ] Progress bar container has `bg-gray-200` background
- [ ] Filled portion has `bg-green-500` fill color
- [ ] Fill width is set via inline style from percentage calculation
- [ ] Fill has smooth transition (`transition-all duration-300 ease-out`)
- [ ] `animate-pulse` class applied when `isAnimating` is true
- [ ] Label displays below the bar when `showLabel` is true
- [ ] Label uses correct font size from size config
- [ ] Container has `w-full` to fill parent width
- [ ] Component uses `React.useId()` for unique aria-describedby IDs

---

### Task 2.4.5: Add ARIA Accessibility Attributes

**Effort:** 1 story point (~10 minutes)
**Dependencies:** Task 2.4.4

#### Description
Ensure full accessibility compliance with proper ARIA attributes for the progressbar role.

#### File to Modify
- `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationProgressBar.tsx`

#### Implementation Steps

1. Verify the following ARIA attributes are in place on the progress bar container (should be from Task 2.4.4):

```typescript
// These should already be present - verify and correct if needed:
<div
  className={cn('w-full bg-gray-200 overflow-hidden', sizeConfig.bar)}
  role="progressbar"
  aria-valuenow={completed}
  aria-valuemin={0}
  aria-valuemax={total}
  aria-describedby={showLabel ? labelId : undefined}
  aria-label={`Translation progress: ${percentage}% complete`}
>
```

2. If the label is hidden (showLabel=false), ensure aria-label provides context:

The `aria-label` is already providing context. Verify this handles all cases:
- When `showLabel=true`: aria-describedby links to visible label
- When `showLabel=false`: aria-label provides full context

3. Ensure the label paragraph is properly linked:

```typescript
{showLabel && (
  <p
    id={labelId}
    className={cn('mt-1 text-gray-700', sizeConfig.label)}
  >
    {labelText}
  </p>
)}
```

#### Acceptance Criteria
- [ ] Progress bar has `role="progressbar"` attribute
- [ ] Progress bar has `aria-valuenow={completed}` (current value)
- [ ] Progress bar has `aria-valuemin={0}` (minimum value)
- [ ] Progress bar has `aria-valuemax={total}` (maximum value)
- [ ] Progress bar has `aria-label` with percentage for screen readers
- [ ] When label is visible, `aria-describedby` links to label element
- [ ] Label element has unique `id` generated by `React.useId()`
- [ ] Screen readers can announce "Translation progress: X% complete"

---

### Task 2.4.6: Handle Edge Cases

**Effort:** 1 story point (~15 minutes)
**Dependencies:** Task 2.4.4

#### Description
Implement proper handling for edge cases including zero translations, all complete, negative values, and overflow.

#### File to Modify
- `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationProgressBar.tsx`

#### Implementation Steps

1. Update the helper functions to handle edge cases (should already handle most, verify):

```typescript
/**
 * Calculate progress percentage from completed/total
 * Returns 0-100, handles edge cases
 */
function calculatePercentage(completed: number, total: number): number {
  // Handle zero or negative total
  if (total <= 0) return 0;

  // Handle negative completed
  if (completed < 0) return 0;

  // Handle overflow (completed > total)
  if (completed >= total) return 100;

  // Normal calculation with rounding
  return Math.round((completed / total) * 100);
}

/**
 * Generate the label text based on completion state
 */
function getLabelText(completed: number, total: number): string {
  // Handle zero total
  if (total === 0) {
    return 'No translations';
  }

  // Clamp completed to valid range for display
  const displayCompleted = Math.max(0, Math.min(completed, total));

  // Full completion
  if (displayCompleted === total) {
    return `${displayCompleted}/${total} translations complete`;
  }

  // Zero completion
  if (displayCompleted === 0) {
    return `0/${total} translations`;
  }

  // Partial completion
  return `${displayCompleted}/${total} translations`;
}
```

2. Verify component handles all edge cases gracefully:

| Scenario | completed | total | Expected percentage | Expected label |
|----------|-----------|-------|---------------------|----------------|
| Zero total | 0 | 0 | 0% | "No translations" |
| Zero completed | 0 | 5 | 0% | "0/5 translations" |
| Partial | 3 | 5 | 60% | "3/5 translations" |
| All complete | 5 | 5 | 100% | "5/5 translations complete" |
| Overflow | 7 | 5 | 100% | "5/5 translations complete" |
| Negative completed | -2 | 5 | 0% | "0/5 translations" |

#### Acceptance Criteria
- [ ] Zero total (0/0) shows 0% and "No translations"
- [ ] Zero completed (0/N) shows 0% and "0/N translations"
- [ ] Partial (X/N) shows correct percentage and "X/N translations"
- [ ] All complete (N/N) shows 100% and "N/N translations complete"
- [ ] Overflow (>N/N) caps at 100% and shows "N/N translations complete"
- [ ] Negative completed caps at 0% and shows "0/N translations"
- [ ] No JavaScript errors thrown for any edge case
- [ ] Visual appearance remains consistent across all edge cases

---

### Task 2.4.7: Add Default Export and Update Barrel Exports

**Effort:** 1 story point (~10 minutes)
**Dependencies:** Task 2.4.6

#### Description
Add default export to the component and update the barrel export files for proper module access.

#### Files to Create/Modify
- `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationProgressBar.tsx` (add default export)
- `/src/components/TranslationManagement/TranslationPreviewPanel/index.ts` (update exports)
- `/src/components/TranslationManagement/index.ts` (verify re-exports)

#### Implementation Steps

1. Add default export at the end of `TranslationProgressBar.tsx`:

```typescript
// At the end of the file
export default TranslationProgressBar;
```

2. Update `/src/components/TranslationManagement/TranslationPreviewPanel/index.ts`:

```typescript
/**
 * TranslationPreviewPanel barrel exports
 * @module TranslationManagement/TranslationPreviewPanel
 * @lastModified 2026-01-19
 */

export { TranslationStatusItem } from './TranslationStatusItem';
export type { TranslationStatusItemProps } from './TranslationStatusItem';

export { TranslationProgressBar } from './TranslationProgressBar';
export type { TranslationProgressBarProps } from './TranslationProgressBar';

// Future exports:
// export { TranslationPreviewPanel } from './TranslationPreviewPanel';
// export type { TranslationPreviewPanelProps } from './TranslationPreviewPanel';
```

3. Verify `/src/components/TranslationManagement/index.ts` re-exports correctly:

```typescript
/**
 * TranslationManagement component barrel exports
 * @module TranslationManagement
 * @lastModified 2026-01-19
 */

// TranslationPreviewPanel components
export * from './TranslationPreviewPanel';

// Shared types
export * from './TranslationManagement.types';

// Future exports:
// export * from './TranslationEditor';
// export * from './TranslationStatusWidget';
```

#### Acceptance Criteria
- [ ] `TranslationProgressBar` has both named and default exports
- [ ] `TranslationProgressBarProps` type is exported
- [ ] `/src/components/TranslationManagement/TranslationPreviewPanel/index.ts` exports the component
- [ ] `/src/components/TranslationManagement/index.ts` re-exports from TranslationPreviewPanel
- [ ] Import `{ TranslationProgressBar } from '@/components/TranslationManagement'` works
- [ ] Import `{ TranslationProgressBarProps } from '@/components/TranslationManagement'` works
- [ ] TypeScript compiles without errors

---

### Task 2.4.8: Verify Build and Lint

**Effort:** 1 story point (~10 minutes)
**Dependencies:** Task 2.4.7

#### Description
Run build and lint commands to verify the component compiles correctly with no errors or warnings.

#### Verification Commands

```bash
# TypeScript compilation check
npx tsc --noEmit

# Lint check
npm run lint

# Build verification
npm run build
```

#### Implementation Steps

1. Run TypeScript type checking:
   ```bash
   npx tsc --noEmit
   ```

2. Fix any type errors that appear.

3. Run ESLint:
   ```bash
   npm run lint
   ```

4. Fix any lint warnings or errors.

5. Run full build:
   ```bash
   npm run build
   ```

6. Verify build completes successfully.

#### Acceptance Criteria
- [ ] `npx tsc --noEmit` passes with no errors
- [ ] `npm run lint` passes with no errors
- [ ] `npm run build` completes successfully
- [ ] No console warnings related to the component
- [ ] Component can be imported in a test file without errors

---

### Task 2.4.9: Write Unit Tests (Optional - Phase 7)

**Effort:** 2 story points (~45 minutes)
**Dependencies:** Task 2.4.8
**Note:** This task is for Phase 7 testing but documented here for completeness

#### Description
Create unit tests for the TranslationProgressBar component covering all states, edge cases, and accessibility.

#### File to Create
- `/src/components/TranslationManagement/TranslationPreviewPanel/__tests__/TranslationProgressBar.test.tsx`

#### Test Cases to Implement

```typescript
import { render, screen } from '@testing-library/react';
import { TranslationProgressBar } from '../TranslationProgressBar';

describe('TranslationProgressBar', () => {
  // Rendering tests
  describe('Rendering', () => {
    it('renders progress bar with correct percentage width');
    it('renders label when showLabel is true');
    it('hides label when showLabel is false');
    it('applies correct size classes for sm variant');
    it('applies correct size classes for md variant');
    it('applies correct size classes for lg variant');
    it('applies custom className to container');
  });

  // Progress calculation tests
  describe('Progress Calculation', () => {
    it('calculates 0% for zero completed');
    it('calculates 100% for all completed');
    it('calculates correct percentage for partial completion');
    it('caps at 100% when completed exceeds total');
    it('returns 0% for negative completed values');
    it('returns 0% for zero total');
  });

  // Label text tests
  describe('Label Text', () => {
    it('shows "No translations" when total is 0');
    it('shows "X/Y translations" for partial completion');
    it('shows "X/Y translations complete" when all done');
  });

  // Animation tests
  describe('Animation', () => {
    it('applies animate-pulse class when isAnimating is true');
    it('does not apply animate-pulse when isAnimating is false');
  });

  // Accessibility tests
  describe('Accessibility', () => {
    it('has role="progressbar" on progress container');
    it('has correct aria-valuenow attribute');
    it('has correct aria-valuemin attribute');
    it('has correct aria-valuemax attribute');
    it('has aria-label with percentage');
    it('links label via aria-describedby when visible');
  });

  // Edge cases
  describe('Edge Cases', () => {
    it('handles 0/0 gracefully');
    it('handles 0/5 correctly');
    it('handles 5/5 correctly');
    it('handles 10/5 (overflow) correctly');
    it('handles -3/5 (negative) correctly');
  });
});
```

#### Acceptance Criteria
- [ ] Test file created in `__tests__` directory
- [ ] All rendering tests pass
- [ ] All calculation tests pass
- [ ] All label text tests pass
- [ ] All animation tests pass
- [ ] All accessibility tests pass
- [ ] All edge case tests pass
- [ ] Tests use React Testing Library best practices
- [ ] Test coverage > 80%

---

## Complete File Structure

After completing all tasks (excluding tests), the file structure should be:

```
/src/components/TranslationManagement/
├── index.ts                              # Re-exports all components
├── TranslationManagement.types.ts        # Shared types (from Task 2.1)
│
└── TranslationPreviewPanel/
    ├── index.ts                          # Barrel exports
    ├── TranslationStatusItem.tsx         # Status row (Task 2.3)
    ├── TranslationProgressBar.tsx        # This component (Task 2.4)
    └── __tests__/
        ├── TranslationStatusItem.test.tsx  # Unit tests (Phase 7)
        └── TranslationProgressBar.test.tsx # Unit tests (Phase 7)
```

---

## Complete Implementation Reference

Below is the complete expected implementation for reference:

```typescript
'use client';

/**
 * TranslationProgressBar Component
 *
 * Visual progress indicator showing translation completion status.
 * Displays a horizontal progress bar with fill indicating percentage
 * and an optional text label showing completion count.
 *
 * Features:
 * - Multiple size variants (sm, md, lg)
 * - Animated state during active processing (pulse effect)
 * - Full accessibility with ARIA progressbar role
 * - Responsive width (adapts to container)
 *
 * Color scheme (from Plan-111):
 * - Progress fill: green (#22C55E) - bg-green-500
 * - Background: gray (#E5E7EB) - bg-gray-200
 * - Label text: gray (#374151) - text-gray-700
 *
 * @module TranslationManagement/TranslationPreviewPanel/TranslationProgressBar
 * @created 2026-01-19
 * @lastModified 2026-01-19
 */

import React from 'react';
import { cn } from '@/lib/utils';

// =============================================================================
// Types
// =============================================================================

/**
 * Props for the TranslationProgressBar component
 */
export interface TranslationProgressBarProps {
  /** Number of completed translations */
  completed: number;

  /** Total number of translations expected */
  total: number;

  /** Whether to show the count label (e.g., "3/5 translations complete") */
  showLabel?: boolean;

  /** Whether to animate the progress bar during processing */
  isAnimating?: boolean;

  /** Size variant for the progress bar */
  size?: 'sm' | 'md' | 'lg';

  /** Additional CSS classes for the container */
  className?: string;
}

// =============================================================================
// Constants
// =============================================================================

/**
 * Size configuration for progress bar variants
 * Maps size prop to bar height, corner radius, and label font size
 */
const SIZE_CONFIG = {
  sm: {
    bar: 'h-1.5 rounded',      // 6px height
    label: 'text-xs',           // 12px font
  },
  md: {
    bar: 'h-2 rounded',         // 8px height
    label: 'text-sm',           // 14px font
  },
  lg: {
    bar: 'h-3 rounded-md',      // 12px height
    label: 'text-base',         // 16px font
  },
} as const;

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Calculate progress percentage from completed/total
 * Returns 0-100, handles edge cases (zero total, overflow)
 */
function calculatePercentage(completed: number, total: number): number {
  if (total <= 0) return 0;
  if (completed < 0) return 0;
  if (completed >= total) return 100;
  return Math.round((completed / total) * 100);
}

/**
 * Generate the label text based on completion state
 */
function getLabelText(completed: number, total: number): string {
  if (total === 0) {
    return 'No translations';
  }

  // Clamp completed to valid range for display
  const displayCompleted = Math.max(0, Math.min(completed, total));

  if (displayCompleted === total) {
    return `${displayCompleted}/${total} translations complete`;
  }

  return `${displayCompleted}/${total} translations`;
}

// =============================================================================
// Main Component
// =============================================================================

/**
 * TranslationProgressBar - Visual progress indicator for translation completion
 *
 * @example
 * // Basic usage
 * <TranslationProgressBar completed={3} total={5} />
 *
 * @example
 * // With animation during processing
 * <TranslationProgressBar completed={2} total={5} isAnimating showLabel />
 *
 * @example
 * // Large size variant
 * <TranslationProgressBar completed={5} total={5} size="lg" />
 */
export function TranslationProgressBar({
  completed,
  total,
  showLabel = true,
  isAnimating = false,
  size = 'md',
  className,
}: TranslationProgressBarProps) {
  // Calculate percentage and label
  const percentage = calculatePercentage(completed, total);
  const labelText = getLabelText(completed, total);
  const sizeConfig = SIZE_CONFIG[size];

  // Generate unique ID for aria-describedby
  const labelId = React.useId();

  return (
    <div className={cn('w-full', className)}>
      {/* Progress bar container */}
      <div
        className={cn(
          'w-full bg-gray-200 overflow-hidden',
          sizeConfig.bar
        )}
        role="progressbar"
        aria-valuenow={completed}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-describedby={showLabel ? labelId : undefined}
        aria-label={`Translation progress: ${percentage}% complete`}
      >
        {/* Filled portion */}
        <div
          className={cn(
            'h-full bg-green-500 transition-all duration-300 ease-out',
            isAnimating && 'animate-pulse'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Label */}
      {showLabel && (
        <p
          id={labelId}
          className={cn(
            'mt-1 text-gray-700',
            sizeConfig.label
          )}
        >
          {labelText}
        </p>
      )}
    </div>
  );
}

export default TranslationProgressBar;
```

---

## Integration Example

After implementation, the component can be used like this:

```tsx
import { TranslationProgressBar } from '@/components/TranslationManagement';

// In TranslationPreviewPanel
const completedCount = Object.values(translations)
  .filter(t => t.status === 'completed' || t.status === 'manual')
  .length;

const isProcessing = Object.values(translations)
  .some(t => t.status === 'processing');

<TranslationProgressBar
  completed={completedCount}
  total={5} // 6 languages minus source
  showLabel
  isAnimating={isProcessing}
/>

// In TranslationStatusWidget (dashboard)
<TranslationProgressBar
  completed={summary.complete}
  total={summary.total}
  size="lg"
  isAnimating={summary.pending > 0}
/>

// Compact usage in item grid
<TranslationProgressBar
  completed={item.translationCount}
  total={5}
  size="sm"
  showLabel={false}
/>
```

---

## Visual Reference

### Size Variants

```
Size: sm (h-1.5, 6px)
┌────────────────────────────────────────────────────────────────┐
│ ████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│ 3/5 translations                                      (text-xs) │
└────────────────────────────────────────────────────────────────┘

Size: md (h-2, 8px) - DEFAULT
┌────────────────────────────────────────────────────────────────┐
│ █████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│ 3/5 translations                                      (text-sm) │
└────────────────────────────────────────────────────────────────┘

Size: lg (h-3, 12px)
┌────────────────────────────────────────────────────────────────┐
│ ██████████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│ 3/5 translations                                    (text-base) │
└────────────────────────────────────────────────────────────────┘
```

### State Examples

```
Empty State (0/5):
┌────────────────────────────────────────────────────────────────┐
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│ 0/5 translations                                                │
└────────────────────────────────────────────────────────────────┘

Partial State (3/5):
┌────────────────────────────────────────────────────────────────┐
│ █████████████████████████████████████░░░░░░░░░░░░░░░░░░░░░░░  │
│ 3/5 translations                                                │
└────────────────────────────────────────────────────────────────┘

Complete State (5/5):
┌────────────────────────────────────────────────────────────────┐
│ ████████████████████████████████████████████████████████████  │
│ 5/5 translations complete                                       │
└────────────────────────────────────────────────────────────────┘

Processing State (3/5, isAnimating=true):
┌────────────────────────────────────────────────────────────────┐
│ ████████████████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░  │
│ ↑↑↑ animate-pulse (pulsing opacity) ↑↑↑                        │
│ 3/5 translations                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## Acceptance Criteria Summary

### Component Requirements
- [ ] Component file created at `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationProgressBar.tsx`
- [ ] Component accepts `completed` and `total` props for count display
- [ ] Component renders horizontal progress bar with fill based on percentage
- [ ] Component displays text label in "X/Y translations complete" format
- [ ] Progress bar fill uses green color for completed translations
- [ ] Component displays animation during processing (when `isAnimating` is true)
- [ ] Animation stops when `isAnimating` is false
- [ ] Component handles edge cases:
  - [ ] Zero translations (0/0): Empty bar, "No translations" label
  - [ ] Zero completed (0/N): Empty bar, shows count
  - [ ] All complete (N/N): Full bar, shows count with "complete"
  - [ ] Partial (X/N): Partial fill, shows count
  - [ ] Overflow (>N/N): Caps at 100%
  - [ ] Negative completed: Caps at 0%
- [ ] Progress bar width adapts to container
- [ ] Size variants (sm, md, lg) work correctly

### Technical Requirements
- [ ] Component is a Client Component (`'use client'`)
- [ ] TypeScript strict mode compliant
- [ ] All props have JSDoc documentation
- [ ] ARIA attributes for accessibility (progressbar role, value attributes)
- [ ] Follows existing codebase patterns (cn utility, Tailwind classes)
- [ ] No console warnings or errors
- [ ] Component exported from index files
- [ ] Build passes (`npm run build`)
- [ ] Lint passes (`npm run lint`)

---

## References

- **Overview Document:** `/docs/REQ-343-create-translationprogressbar-component-overview.md`
- **Request Source:** `/docs/gen_requests_epic5.md` (REQ-343)
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- **Pattern Reference (LoadingState):** `/src/components/ItemManager/components/shared/LoadingState.tsx`
- **cn Utility:** `/src/lib/utils.ts`
- **Related Component:** `/docs/REQ-342-create-translationstatusitem-component-detailed.md`

---

*Document generated for FAQBNB Localization Epic 5 - Task 2.4*
*Technical Lead: Claude | Date: 2026-01-19*
