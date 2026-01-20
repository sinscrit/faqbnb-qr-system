# Implementation Overview: REQ-E05-008 - Create TranslationProgressBar Component

**Document ID:** REQ-E05-008-overview
**Created:** 2026-01-20 14:45 UTC
**Last Modified:** 2026-01-20 16:30 UTC
**Epic:** 5 - Owner Translation Management
**Phase:** 2 - Core UI Components
**Task:** 2.4

---

## Request Summary

**Request ID:** REQ-E05-008
**Title:** Translation Progress Bar Visual Indicator Component
**Type:** NEW FEATURE
**Size:** S (Small)

Property owners need a visual progress indicator that displays translation completion status as a ratio and animated progress bar, showing at a glance how many languages have completed translations out of the total number of supported languages.

---

## Dependencies

### Epic Dependencies

| Dependency | Source | Status |
|------------|--------|--------|
| Epic 1 Foundation | Translation types and language constants | Required |
| Epic 3 Dynamic Content | Translation status tracking | Required |
| REQ-E05-006 | TranslationManagement.types.ts (shared types) | Required |
| REQ-E05-007 | TranslationPreviewPanel component (parent) | Co-dependent |

### Package Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `@/lib/utils` | Existing | `cn()` utility for className merging |
| `tailwindcss` | 4.x | Styling and animations |

**Note:** No new npm packages required. Uses existing Tailwind CSS for styling and animations.

---

## Technical Context

### Existing Patterns to Follow

The codebase has established progress bar patterns that this component should align with:

1. **ProgressIndicator** (`/src/components/ItemCapture/components/shared/ProgressIndicator.tsx`)
   - Mobile: Simple progress bar with step counter `text-xs text-gray-600`
   - Container: `w-full bg-gray-200 rounded-full h-1.5`
   - Fill: `bg-blue-600 h-1.5 rounded-full transition-all duration-300`
   - ARIA: `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, `aria-label`
   - Percentage calculation: `((currentIndex + 1) / totalStages) * 100`

2. **CharacterCounter in MarkdownEditor** (`/src/components/ItemCapture/editors/MarkdownEditor.tsx`)
   - Color-coded progress bar with state thresholds
   - Container: `w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden`
   - Fill: `h-full rounded-full transition-all duration-300`
   - States: `bg-blue-500` (normal), `bg-yellow-500` (warning), `bg-red-500` (error)
   - ARIA: `role="progressbar"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
   - Live region for screen readers: `aria-live="polite"` `aria-atomic="true"`

3. **LoadingIndicator** (`/src/components/SimpleDashboard/LoadingIndicator.tsx`)
   - Size presets: `sm` (16px), `md` (24px), `lg` (32px)
   - Color presets: `brand`, `white`, `muted`
   - ARIA: `role="status"`, `aria-label`, `sr-only` for screen reader text

### Tailwind Animation Configuration

From `tailwind.config.js`:
```javascript
animation: {
  'slide-up': 'slide-up 0.3s ease-out',
},
```

Standard Tailwind utilities:
- `transition-all duration-300` - Standard transition timing (300ms)
- `ease-in-out` or `ease-out` - Easing functions
- `animate-pulse` - Skeleton/loading animation

### Color Palette (from PRD)

| State | Hex | Tailwind | Description |
|-------|-----|----------|-------------|
| Complete (100%) | `#10b981` | `bg-emerald-500` | All translations done |
| Partial (1-99%) | `#f59e0b` | `bg-amber-500` | Some translations pending |
| Empty (0%) | `#d1d5db` | `bg-gray-300` | No translations started |

### Typography Standards

- Label text: `text-sm text-gray-600` (secondary text)
- Progress count: `font-medium` for emphasis on completion numbers

---

## Component Specification

### File Location

```
/src/components/TranslationManagement/TranslationPreviewPanel/TranslationProgressBar.tsx
```

### Component Interface

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

### Expected Behavior

1. **Progress Calculation**
   - Percentage = `(completed / total) * 100`, capped at 100%
   - Integer rounding for display (no decimals)

2. **Color States**
   - 0% (empty): Gray progress bar (`bg-gray-300`)
   - 1-99% (partial): Amber progress bar (`bg-amber-500`)
   - 100% (complete): Green progress bar (`bg-emerald-500`)

3. **Animation**
   - Width transition: `transition-all duration-300 ease-in-out`
   - Smooth animation when `completed` prop changes
   - CSS transitions are GPU-accelerated for smooth performance

4. **Label Display**
   - Default format: "3/6 translations complete"
   - Edge cases: "0/6 translations complete", "6/6 translations complete"
   - Numbers use `font-medium` for emphasis

5. **Accessibility**
   - `role="progressbar"` on the progress container
   - `aria-valuenow={completed}`
   - `aria-valuemin={0}`
   - `aria-valuemax={total}`
   - `aria-label` describing the progress state for screen readers

---

## Implementation Tasks

### Task 1: Create Component File

**Story Points:** 1

- Create `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationProgressBar.tsx`
- Implement the component with proper TypeScript types
- Follow existing progress bar patterns (ProgressIndicator, CharacterCounter)
- Add JSDoc documentation matching codebase style

### Task 2: Implement Core Functionality

**Story Points:** 1

- Progress percentage calculation with Math.min() capping at 100%
- Color state logic based on completion percentage (0%, 1-99%, 100%)
- Width animation using Tailwind transitions
- Label text rendering with format string support

### Task 3: Add Accessibility

**Story Points:** 1

- ARIA attributes for progressbar role
- Screen reader support with descriptive `aria-label`
- Proper labeling for different states (empty, partial, complete)
- Consider `aria-live` for real-time updates if needed

### Task 4: Create Export in Index

**Story Points:** 0.5

- Export from `/src/components/TranslationManagement/TranslationPreviewPanel/index.ts`
- Ensure named export for tree-shaking
- Export types for external consumers

---

## Acceptance Criteria Mapping

| PRD Criteria | Implementation |
|--------------|----------------|
| Component displays text label "X/Y translations complete" | `showLabel` prop with default format |
| Horizontal progress bar beneath label | Stacked layout with `mb-1.5` gap |
| Progress fills left-to-right proportional to percentage | Dynamic width style `style={{ width: \`${percentage}%\` }}` |
| Green color (#10b981) for 100% | Conditional class `bg-emerald-500` |
| Orange color (#f59e0b) for 1-99% | Conditional class `bg-amber-500` |
| Gray color (#d1d5db) for 0% | Conditional class `bg-gray-300` |
| Smooth 300ms animation on change | `transition-all duration-300 ease-in-out` |
| Accepts total count prop | `total` prop with default 6 |
| Accepts completed count prop | `completed` required prop |
| Auto-calculates percentage | Internal `Math.min(Math.round(...), 100)` |
| "0/6 translations complete" for empty | Edge case handling with completed=0 |
| "6/6 translations complete" for full | Edge case handling with completed=total |
| Responsive width at different sizes | `w-full` with container control |
| Consistent height | Fixed `h-2` (default) or `h-1.5` (small) |
| Easing function for animation | `ease-in-out` timing function |
| ARIA attributes for accessibility | Full progressbar ARIA attributes |
| Renders within TranslationPreviewPanel | Export for parent consumption |
| Consistent with design system | Tailwind patterns matching codebase |
| Real-time update capability | React state-driven, CSS transitions |

---

## Authorized Files and Functions for Modification

### New Files (CREATE)

| File Path | Purpose |
|-----------|---------|
| `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationProgressBar.tsx` | Main component implementation |

### Files to Modify (UPDATE)

| File Path | Function/Section | Changes |
|-----------|------------------|---------|
| `/src/components/TranslationManagement/TranslationPreviewPanel/index.ts` | Export statements | Add `TranslationProgressBar` and `TranslationProgressBarProps` exports |

### Dependencies to Import

| Import | From | Purpose |
|--------|------|---------|
| `cn` | `@/lib/utils` | ClassName merging utility |

### Files to Reference (READ-ONLY)

| File Path | Purpose |
|-----------|---------|
| `/src/components/ItemCapture/components/shared/ProgressIndicator.tsx` | Progress bar pattern, ARIA implementation |
| `/src/components/ItemCapture/editors/MarkdownEditor.tsx` | CharacterCounter pattern, color-coded progress |
| `/src/components/SimpleDashboard/LoadingIndicator.tsx` | Size/color preset patterns |
| `/src/lib/utils.ts` | `cn()` utility function |
| `/src/components/TranslationManagement/TranslationManagement.types.ts` | Shared type definitions |

---

## Code Example

```tsx
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
  /** Number of completed translations */
  completed: number;
  /** Total number of languages (default: 6) */
  total?: number;
  /** Show/hide the text label (default: true) */
  showLabel?: boolean;
  /** Custom label format - use {completed} and {total} as placeholders */
  labelFormat?: string;
  /** Additional CSS classes */
  className?: string;
  /** Size variant */
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
  // Calculate progress percentage, clamped at 100%
  const percentage = Math.min(Math.round((completed / total) * 100), 100);

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

## Testing Considerations

### Unit Tests

```typescript
describe('TranslationProgressBar', () => {
  it('renders with correct percentage (3/6 = 50%)', () => {
    // Test that width style is 50%
  });

  it('shows green color at 100% completion', () => {
    // Test bg-emerald-500 class when completed === total
  });

  it('shows amber color at partial completion', () => {
    // Test bg-amber-500 class when 0 < completed < total
  });

  it('shows gray color at 0% completion', () => {
    // Test bg-gray-300 class when completed === 0
  });

  it('has correct ARIA attributes', () => {
    // Test role="progressbar", aria-valuenow, aria-valuemin, aria-valuemax
  });

  it('hides label when showLabel is false', () => {
    // Test label visibility toggle
  });

  it('uses custom label format when provided', () => {
    // Test custom labelFormat prop
  });

  it('caps percentage at 100%', () => {
    // Test edge case where completed > total
  });

  it('applies size variant correctly', () => {
    // Test h-1.5 for small, h-2 for default
  });
});
```

### Accessibility Tests

```typescript
describe('TranslationProgressBar Accessibility', () => {
  it('has role="progressbar"', () => {
    // Verify progressbar role is present
  });

  it('has descriptive aria-label', () => {
    // Verify aria-label describes current state
  });

  it('updates aria-valuenow on prop change', () => {
    // Verify aria-valuenow reflects completed count
  });
});
```

---

## Integration Notes

### Usage in TranslationPreviewPanel

```tsx
// In TranslationPreviewPanel.tsx
import { TranslationProgressBar } from './TranslationProgressBar';

// Within the component JSX:
<TranslationProgressBar
  completed={completedCount}
  total={SUPPORTED_LANGUAGES.length}
  showLabel={true}
/>
```

### Real-time Updates

The component is designed to re-render smoothly when `completed` prop changes. CSS transitions handle the animation automatically, supporting real-time translation status updates via Supabase realtime subscriptions (useTranslationRealtime hook).

### Responsive Behavior

The component uses `w-full` to fill its container width. Parent components control the actual width:
- In TranslationPreviewPanel: Full width within 400px panel
- In dashboard widgets: May be constrained by card width

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Animation jank | Low | Low | Use CSS transitions (GPU-accelerated) |
| Color contrast issues | Low | Medium | Use established Tailwind colors with good contrast |
| ARIA not announced | Low | Medium | Test with screen readers (VoiceOver, NVDA) |
| Edge case: completed > total | Low | Low | Math.min() caps at 100% |
| Edge case: total = 0 | Low | Medium | Add guard clause, default to 6 |

---

## References

- **Request:** `/docs/gen_requests_epic5.md` - REQ-E05-009 (Progress Bar)
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- **Pattern Reference:** `/src/components/ItemCapture/components/shared/ProgressIndicator.tsx`
- **Pattern Reference:** `/src/components/ItemCapture/editors/MarkdownEditor.tsx` (CharacterCounter)
- **Pattern Reference:** `/src/components/SimpleDashboard/LoadingIndicator.tsx`
- **Translation Types:** `/src/lib/translation-service/translation-service.types.ts`

---

*Document generated for FAQBNB L10N Epic 5 - Owner Translation Management*
*Last Modified: 2026-01-20 16:30 UTC*
