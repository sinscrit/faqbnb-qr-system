# Detailed Task Breakdown: REQ-E05-008 - Create TranslationProgressBar Component

**Document ID:** REQ-E05-008-detailed
**Created:** 2026-01-20 17:15 UTC
**Last Modified:** 2026-01-20 17:15 UTC
**Epic:** 5 - Owner Translation Management
**Phase:** 2 - Core UI Components
**Task:** 2.4
**Source Overview:** REQ-E05-008-create-translationprogressbar-component-overview.md

---

## Summary

This document provides granular, step-by-step implementation tasks for the TranslationProgressBar component. The component displays translation completion status as a ratio text label and animated horizontal progress bar, allowing property owners to see at a glance how many languages have completed translations.

**Total Estimated Story Points:** 3.5

---

## Prerequisites

Before starting implementation, verify:

- [ ] Epic 1 Foundation is complete (translation types and language constants)
- [ ] REQ-E05-006 TranslationManagement.types.ts exists or will be created
- [ ] `/src/lib/utils.ts` has the `cn()` utility function available
- [ ] Tailwind CSS 4.x is configured in the project

---

## Task Breakdown

### Task 1: Create Component Directory Structure

**Story Points:** 0.5
**Priority:** Required
**Dependencies:** None

#### 1.1 Create TranslationPreviewPanel Directory (if not exists)

**File to Create:** `/src/components/TranslationManagement/TranslationPreviewPanel/`

**Actions:**
1. Check if `/src/components/TranslationManagement/` directory exists
2. If not, create the `TranslationManagement` directory
3. Create the `TranslationPreviewPanel` subdirectory

**Verification:**
```bash
ls -la /src/components/TranslationManagement/TranslationPreviewPanel/
```

---

### Task 2: Create TranslationProgressBar Component File

**Story Points:** 1.0
**Priority:** Required
**Dependencies:** Task 1

#### 2.1 Create Component File with Base Structure

**File to Create:** `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationProgressBar.tsx`

**Implementation Steps:**

1. **Add 'use client' directive** (line 1)
   - Required for client-side React component

2. **Add JSDoc header comment** (lines 2-18)
   ```typescript
   /**
    * TranslationProgressBar Component
    *
    * Visual progress indicator showing translation completion status
    * as a ratio and animated progress bar.
    *
    * @example
    * ```tsx
    * <TranslationProgressBar
    *   completed={3}
    *   total={6}
    *   showLabel={true}
    * />
    * // Displays: "3/6 translations complete" with 50% filled bar
    * ```
    *
    * @module TranslationManagement/TranslationPreviewPanel/TranslationProgressBar
    * @lastModified 2026-01-20
    * @see TranslationPreviewPanel for usage context
    */
   ```

3. **Add import statement** (line 20)
   ```typescript
   import { cn } from '@/lib/utils';
   ```

4. **Define and export interface** (lines 22-45)
   ```typescript
   export interface TranslationProgressBarProps {
     /**
      * Number of completed translations
      * @minimum 0
      */
     completed: number;

     /**
      * Total number of languages (default: 6 for supported languages)
      * @minimum 1
      */
     total?: number;

     /**
      * Show/hide the text label (default: true)
      */
     showLabel?: boolean;

     /**
      * Custom label format (optional)
      * Use {completed} and {total} as placeholders
      * @default "{completed}/{total} translations complete"
      */
     labelFormat?: string;

     /**
      * Optional CSS class for the container
      */
     className?: string;

     /**
      * Size variant
      * @default "default"
      */
     size?: 'small' | 'default';
   }
   ```

**Acceptance Criteria:**
- [ ] File created at correct path
- [ ] 'use client' directive is first line
- [ ] JSDoc comment includes @example, @module, @lastModified, @see
- [ ] Interface exported with all required props documented
- [ ] cn utility imported from @/lib/utils

---

### Task 3: Implement Color State Helper Function

**Story Points:** 0.5
**Priority:** Required
**Dependencies:** Task 2

#### 3.1 Create getProgressColor Helper Function

**Location:** After interface definition, before main component

**Implementation:**
```typescript
/**
 * Determines progress bar color based on completion percentage.
 * - 0%: Gray (no progress)
 * - 1-99%: Amber (in progress)
 * - 100%: Emerald/Green (complete)
 */
function getProgressColor(percentage: number): string {
  if (percentage === 0) return 'bg-gray-300';
  if (percentage === 100) return 'bg-emerald-500';
  return 'bg-amber-500';
}
```

**Color Mapping (from PRD):**

| State | Percentage | Tailwind Class | Hex Code |
|-------|------------|----------------|----------|
| Empty | 0% | `bg-gray-300` | #d1d5db |
| Partial | 1-99% | `bg-amber-500` | #f59e0b |
| Complete | 100% | `bg-emerald-500` | #10b981 |

**Acceptance Criteria:**
- [ ] Function returns 'bg-gray-300' when percentage is 0
- [ ] Function returns 'bg-amber-500' when percentage is between 1-99
- [ ] Function returns 'bg-emerald-500' when percentage is 100
- [ ] JSDoc comment explains the color states

---

### Task 4: Implement Main Component Function

**Story Points:** 1.0
**Priority:** Required
**Dependencies:** Task 2, Task 3

#### 4.1 Create Component Function Signature

**Implementation:**
```typescript
export function TranslationProgressBar({
  completed,
  total = 6,
  showLabel = true,
  labelFormat = '{completed}/{total} translations complete',
  className,
  size = 'default',
}: TranslationProgressBarProps) {
```

**Default Values:**
- `total`: 6 (number of supported languages)
- `showLabel`: true
- `labelFormat`: '{completed}/{total} translations complete'
- `size`: 'default'

#### 4.2 Implement Progress Calculation

**Location:** Inside component function body

**Implementation:**
```typescript
// Calculate progress percentage, clamped at 100%
const percentage = Math.min(Math.round((completed / total) * 100), 100);
```

**Behavior:**
- Uses `Math.round()` for integer percentages
- Uses `Math.min()` to cap at 100% even if completed > total
- Edge case: If total is 0, would cause division by zero - add guard if needed

**Edge Case Guard (optional):**
```typescript
const safeTotal = total > 0 ? total : 1;
const percentage = Math.min(Math.round((completed / safeTotal) * 100), 100);
```

#### 4.3 Implement Label Text Formatting

**Implementation:**
```typescript
// Format label text with placeholders
const labelText = labelFormat
  .replace('{completed}', String(completed))
  .replace('{total}', String(total));
```

**Behavior:**
- Replaces `{completed}` placeholder with actual count
- Replaces `{total}` placeholder with actual total
- Supports custom label formats

#### 4.4 Implement Size-Based Height Logic

**Implementation:**
```typescript
// Size-based height: small = 6px (h-1.5), default = 8px (h-2)
const barHeight = size === 'small' ? 'h-1.5' : 'h-2';
```

**Size Mapping:**

| Size | Tailwind Class | Pixel Height |
|------|----------------|--------------|
| small | `h-1.5` | 6px |
| default | `h-2` | 8px |

**Acceptance Criteria:**
- [ ] percentage calculated with Math.min and Math.round
- [ ] percentage capped at 100 even when completed > total
- [ ] labelText replaces both placeholders correctly
- [ ] barHeight returns 'h-1.5' for small, 'h-2' for default

---

### Task 5: Implement Component JSX Structure

**Story Points:** 0.5
**Priority:** Required
**Dependencies:** Task 4

#### 5.1 Implement Container Wrapper

**Implementation:**
```tsx
return (
  <div className={cn('w-full', className)}>
    {/* Content here */}
  </div>
);
```

**Behavior:**
- Full width by default (`w-full`)
- Allows custom className to be merged via `cn()`

#### 5.2 Implement Label Section

**Implementation:**
```tsx
{/* Text label */}
{showLabel && (
  <p className="text-sm text-gray-600 mb-1.5">
    <span className="font-medium">{completed}/{total}</span>
    {' '}translations complete
  </p>
)}
```

**Typography Standards:**
- Label text: `text-sm text-gray-600`
- Progress numbers: `font-medium` for emphasis
- Margin below: `mb-1.5` (6px)

**Conditional Rendering:**
- Only renders when `showLabel` is true

#### 5.3 Implement Progress Bar Container

**Implementation:**
```tsx
{/* Progress bar container */}
<div
  className={cn(
    'w-full bg-gray-200 rounded-full overflow-hidden',
    barHeight
  )}
  role="progressbar"
  aria-valuenow={completed}
  aria-valuemin={0}
  aria-valuemax={total}
  aria-label={`Translation progress: ${completed} of ${total} translations complete`}
>
  {/* Progress fill */}
</div>
```

**Container Styling:**
- `w-full`: Full width of parent
- `bg-gray-200`: Track background color
- `rounded-full`: Pill shape
- `overflow-hidden`: Ensures fill respects border-radius
- Dynamic height from `barHeight` variable

**ARIA Attributes (Accessibility):**
- `role="progressbar"`: Identifies as progress indicator
- `aria-valuenow={completed}`: Current value (completed count)
- `aria-valuemin={0}`: Minimum value (0 translations)
- `aria-valuemax={total}`: Maximum value (total languages)
- `aria-label`: Descriptive label for screen readers

#### 5.4 Implement Progress Fill Element

**Implementation:**
```tsx
{/* Progress fill */}
<div
  className={cn(
    'h-full rounded-full transition-all duration-300 ease-in-out',
    getProgressColor(percentage)
  )}
  style={{ width: `${percentage}%` }}
/>
```

**Fill Styling:**
- `h-full`: Fill entire container height
- `rounded-full`: Match container pill shape
- `transition-all duration-300 ease-in-out`: 300ms smooth animation
- Dynamic color from `getProgressColor()` helper
- Inline width style for percentage

**Animation Behavior:**
- Uses CSS transition for smooth width changes
- 300ms duration matches codebase standard (from PRD)
- `ease-in-out` timing function for natural motion
- GPU-accelerated via CSS (no JavaScript animation)

**Acceptance Criteria:**
- [ ] Container has `w-full` class with className merging
- [ ] Label only renders when showLabel is true
- [ ] Label displays formatted "{completed}/{total} translations complete"
- [ ] Progress bar container has all ARIA attributes
- [ ] Progress fill has transition animation classes
- [ ] Progress fill width set via inline style with percentage

---

### Task 6: Add Default Export

**Story Points:** 0.1
**Priority:** Required
**Dependencies:** Task 5

#### 6.1 Add Default Export Statement

**Location:** End of file

**Implementation:**
```typescript
export default TranslationProgressBar;
```

**Rationale:**
- Allows both named and default imports
- Follows codebase pattern (see ProgressIndicator.tsx:201)

---

### Task 7: Create/Update Index Export File

**Story Points:** 0.4
**Priority:** Required
**Dependencies:** Task 6

#### 7.1 Create or Update TranslationPreviewPanel/index.ts

**File:** `/src/components/TranslationManagement/TranslationPreviewPanel/index.ts`

**If file doesn't exist, create it:**
```typescript
/**
 * TranslationPreviewPanel Component Exports
 *
 * @module TranslationManagement/TranslationPreviewPanel
 * @lastModified 2026-01-20
 */

// Components
export { TranslationProgressBar } from './TranslationProgressBar';
export { default as TranslationProgressBarDefault } from './TranslationProgressBar';

// Types
export type { TranslationProgressBarProps } from './TranslationProgressBar';
```

**If file exists, add exports:**
```typescript
// Add to existing exports
export { TranslationProgressBar } from './TranslationProgressBar';
export type { TranslationProgressBarProps } from './TranslationProgressBar';
```

**Acceptance Criteria:**
- [ ] TranslationProgressBar component is exported
- [ ] TranslationProgressBarProps type is exported
- [ ] Named export used for tree-shaking compatibility

---

## Complete Component Code

**File:** `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationProgressBar.tsx`

```typescript
'use client';

/**
 * TranslationProgressBar Component
 *
 * Visual progress indicator showing translation completion status
 * as a ratio and animated progress bar.
 *
 * @example
 * ```tsx
 * <TranslationProgressBar
 *   completed={3}
 *   total={6}
 *   showLabel={true}
 * />
 * // Displays: "3/6 translations complete" with 50% filled bar
 * ```
 *
 * @module TranslationManagement/TranslationPreviewPanel/TranslationProgressBar
 * @lastModified 2026-01-20
 * @see TranslationPreviewPanel for usage context
 */

import { cn } from '@/lib/utils';

export interface TranslationProgressBarProps {
  /**
   * Number of completed translations
   * @minimum 0
   */
  completed: number;

  /**
   * Total number of languages (default: 6 for supported languages)
   * @minimum 1
   */
  total?: number;

  /**
   * Show/hide the text label (default: true)
   */
  showLabel?: boolean;

  /**
   * Custom label format (optional)
   * Use {completed} and {total} as placeholders
   * @default "{completed}/{total} translations complete"
   */
  labelFormat?: string;

  /**
   * Optional CSS class for the container
   */
  className?: string;

  /**
   * Size variant
   * @default "default"
   */
  size?: 'small' | 'default';
}

/**
 * Determines progress bar color based on completion percentage.
 * - 0%: Gray (no progress)
 * - 1-99%: Amber (in progress)
 * - 100%: Emerald/Green (complete)
 */
function getProgressColor(percentage: number): string {
  if (percentage === 0) return 'bg-gray-300';
  if (percentage === 100) return 'bg-emerald-500';
  return 'bg-amber-500';
}

export function TranslationProgressBar({
  completed,
  total = 6,
  showLabel = true,
  labelFormat = '{completed}/{total} translations complete',
  className,
  size = 'default',
}: TranslationProgressBarProps) {
  // Guard against division by zero
  const safeTotal = total > 0 ? total : 1;

  // Calculate progress percentage, clamped at 100%
  const percentage = Math.min(Math.round((completed / safeTotal) * 100), 100);

  // Format label text with placeholders
  const labelText = labelFormat
    .replace('{completed}', String(completed))
    .replace('{total}', String(total));

  // Size-based height: small = 6px (h-1.5), default = 8px (h-2)
  const barHeight = size === 'small' ? 'h-1.5' : 'h-2';

  return (
    <div className={cn('w-full', className)}>
      {/* Text label */}
      {showLabel && (
        <p className="text-sm text-gray-600 mb-1.5">
          <span className="font-medium">{completed}/{total}</span>
          {' '}translations complete
        </p>
      )}

      {/* Progress bar container */}
      <div
        className={cn(
          'w-full bg-gray-200 rounded-full overflow-hidden',
          barHeight
        )}
        role="progressbar"
        aria-valuenow={completed}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={`Translation progress: ${completed} of ${total} translations complete`}
      >
        {/* Progress fill */}
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300 ease-in-out',
            getProgressColor(percentage)
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export default TranslationProgressBar;
```

---

## Verification Checklist

### Functional Verification

| Test Case | Expected Result | Status |
|-----------|-----------------|--------|
| `completed=0, total=6` | Gray bar at 0%, label "0/6 translations complete" | [ ] |
| `completed=3, total=6` | Amber bar at 50%, label "3/6 translations complete" | [ ] |
| `completed=6, total=6` | Green bar at 100%, label "6/6 translations complete" | [ ] |
| `completed=7, total=6` | Green bar at 100% (capped), label "7/6 translations complete" | [ ] |
| `showLabel=false` | No text label displayed | [ ] |
| `size='small'` | Bar height is h-1.5 (6px) | [ ] |
| `size='default'` | Bar height is h-2 (8px) | [ ] |
| `className='mt-4'` | Custom class merged with container | [ ] |
| `labelFormat='{completed} done'` | Custom format applied | [ ] |

### Accessibility Verification

| Requirement | Implementation | Status |
|-------------|----------------|--------|
| `role="progressbar"` | Present on progress container | [ ] |
| `aria-valuenow` | Set to completed count | [ ] |
| `aria-valuemin` | Set to 0 | [ ] |
| `aria-valuemax` | Set to total | [ ] |
| `aria-label` | Descriptive label present | [ ] |
| Screen reader test | Announces "Translation progress: X of Y translations complete" | [ ] |

### Visual Verification

| Aspect | Specification | Status |
|--------|---------------|--------|
| 0% color | Gray (#d1d5db / bg-gray-300) | [ ] |
| 1-99% color | Amber (#f59e0b / bg-amber-500) | [ ] |
| 100% color | Emerald (#10b981 / bg-emerald-500) | [ ] |
| Animation | Smooth 300ms transition | [ ] |
| Border radius | Pill shape (rounded-full) | [ ] |
| Track background | Gray-200 (#e5e7eb) | [ ] |

---

## Unit Test Specifications

### Test File Location
`/src/components/TranslationManagement/TranslationPreviewPanel/__tests__/TranslationProgressBar.test.tsx`

### Test Cases

```typescript
import { render, screen } from '@testing-library/react';
import { TranslationProgressBar } from '../TranslationProgressBar';

describe('TranslationProgressBar', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<TranslationProgressBar completed={3} />);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(screen.getByText(/3\/6/)).toBeInTheDocument();
    });

    it('renders without label when showLabel is false', () => {
      render(<TranslationProgressBar completed={3} showLabel={false} />);
      expect(screen.queryByText(/translations complete/)).not.toBeInTheDocument();
    });

    it('uses custom label format', () => {
      render(
        <TranslationProgressBar
          completed={3}
          total={6}
          labelFormat="{completed} of {total} done"
        />
      );
      expect(screen.getByText(/3 of 6 done/)).toBeInTheDocument();
    });
  });

  describe('Progress Calculation', () => {
    it('calculates 50% for 3/6 completed', () => {
      render(<TranslationProgressBar completed={3} total={6} />);
      const fill = screen.getByRole('progressbar').querySelector('div');
      expect(fill).toHaveStyle({ width: '50%' });
    });

    it('caps percentage at 100% when completed > total', () => {
      render(<TranslationProgressBar completed={7} total={6} />);
      const fill = screen.getByRole('progressbar').querySelector('div');
      expect(fill).toHaveStyle({ width: '100%' });
    });

    it('handles total=0 without crashing', () => {
      render(<TranslationProgressBar completed={0} total={0} />);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  describe('Color States', () => {
    it('shows gray color for 0% completion', () => {
      render(<TranslationProgressBar completed={0} total={6} />);
      const fill = screen.getByRole('progressbar').querySelector('div');
      expect(fill).toHaveClass('bg-gray-300');
    });

    it('shows amber color for partial completion', () => {
      render(<TranslationProgressBar completed={3} total={6} />);
      const fill = screen.getByRole('progressbar').querySelector('div');
      expect(fill).toHaveClass('bg-amber-500');
    });

    it('shows green color for 100% completion', () => {
      render(<TranslationProgressBar completed={6} total={6} />);
      const fill = screen.getByRole('progressbar').querySelector('div');
      expect(fill).toHaveClass('bg-emerald-500');
    });
  });

  describe('Size Variants', () => {
    it('uses h-2 height for default size', () => {
      render(<TranslationProgressBar completed={3} size="default" />);
      const container = screen.getByRole('progressbar');
      expect(container).toHaveClass('h-2');
    });

    it('uses h-1.5 height for small size', () => {
      render(<TranslationProgressBar completed={3} size="small" />);
      const container = screen.getByRole('progressbar');
      expect(container).toHaveClass('h-1.5');
    });
  });

  describe('Accessibility', () => {
    it('has correct ARIA attributes', () => {
      render(<TranslationProgressBar completed={3} total={6} />);
      const progressbar = screen.getByRole('progressbar');

      expect(progressbar).toHaveAttribute('aria-valuenow', '3');
      expect(progressbar).toHaveAttribute('aria-valuemin', '0');
      expect(progressbar).toHaveAttribute('aria-valuemax', '6');
      expect(progressbar).toHaveAttribute('aria-label');
    });

    it('has descriptive aria-label', () => {
      render(<TranslationProgressBar completed={3} total={6} />);
      const progressbar = screen.getByRole('progressbar');

      expect(progressbar.getAttribute('aria-label')).toContain('3 of 6');
    });
  });

  describe('Custom Styling', () => {
    it('merges custom className', () => {
      render(<TranslationProgressBar completed={3} className="mt-4 mx-2" />);
      const container = screen.getByRole('progressbar').parentElement;
      expect(container).toHaveClass('mt-4', 'mx-2', 'w-full');
    });
  });
});
```

---

## Integration Notes

### Usage in TranslationPreviewPanel

```tsx
// In TranslationPreviewPanel.tsx
import { TranslationProgressBar } from './TranslationProgressBar';
import { SUPPORTED_LANGUAGES } from '@/lib/translation-service/translation-service.types';

// Within the component JSX (after source content section):
<div className="py-4 border-b border-gray-200">
  <TranslationProgressBar
    completed={completedCount}
    total={SUPPORTED_LANGUAGES.length}
    showLabel={true}
  />
</div>
```

### Real-time Updates

The component automatically animates via CSS transitions when `completed` prop changes:

```tsx
// Example with realtime subscription
const { translationStatus, completedCount } = useTranslationRealtime(entityType, entityId);

// Progress bar will smoothly animate when completedCount updates
<TranslationProgressBar completed={completedCount} />
```

### Responsive Width Control

The component uses `w-full` to fill its container. Parent components control actual width:

```tsx
// In TranslationPreviewPanel (400px panel)
<div className="w-full">
  <TranslationProgressBar completed={3} />
</div>

// In dashboard widget (constrained)
<div className="w-64">
  <TranslationProgressBar completed={3} size="small" showLabel={false} />
</div>
```

---

## Files to Create/Modify Summary

| File | Action | Purpose |
|------|--------|---------|
| `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationProgressBar.tsx` | CREATE | Main component implementation |
| `/src/components/TranslationManagement/TranslationPreviewPanel/index.ts` | CREATE/UPDATE | Export barrel file |
| `/src/components/TranslationManagement/TranslationPreviewPanel/__tests__/TranslationProgressBar.test.tsx` | CREATE (optional) | Unit tests |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Animation jank on low-end devices | CSS transitions are GPU-accelerated; avoid JavaScript animations |
| Division by zero if total=0 | Added guard clause with safeTotal |
| Color contrast accessibility | Using Tailwind colors with established WCAG compliance |
| Screen reader announcement | Full ARIA implementation with descriptive label |
| Percentage display issues | Math.min() caps at 100%, Math.round() ensures integer |

---

## References

- **Overview Document:** `/docs/REQ-E05-008-create-translationprogressbar-component-overview.md`
- **Request:** `/docs/gen_requests_epic5.md` - REQ-E05-009 (Progress Bar)
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- **Pattern Reference:** `/src/components/ItemCapture/components/shared/ProgressIndicator.tsx`
- **Pattern Reference:** `/src/components/ItemCapture/editors/MarkdownEditor.tsx` (CharacterCounter)
- **Pattern Reference:** `/src/components/SimpleDashboard/LoadingIndicator.tsx`

---

*Document generated for FAQBNB L10N Epic 5 - Owner Translation Management*
*Task 2.4: Create TranslationProgressBar Component*
*Last Modified: 2026-01-20 17:15 UTC*
