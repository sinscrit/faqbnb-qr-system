# Implementation Overview: Create TranslationProgressBar Component

## Header
| Field | Value |
|-------|-------|
| Request Reference | REQ-E05-009 |
| Source File | docs/gen_requests_epic5.md |
| Original Request Date | 2026-01-22 23:45 |
| Breakdown Created | 2026-01-22 19:09 |
| T-shirt Size | S |
| Estimated Effort | 4-5 hours |

## Goals

Create a visual progress indicator component that displays translation completion status using a segmented, multi-colored progress bar. The component shows proportional segments for complete (green), pending (orange with animation), failed (red), and stale (amber) translations, with a gray background representing missing translations. Supports multiple size variants and optional labels for numeric summaries.

**Technical Requirements:**
- Segmented progress bar with proportional width calculations
- Color-coded segments: green (complete), orange (pending), red (failed), amber (stale), gray (missing background)
- Animated pulse effect on pending segment during active translation processing
- Three size variants: sm (6px), md (8px), lg (12px)
- Optional label display with compact ("3/5") or detailed ("3 of 5 translations") formats
- Optional percentage display
- Smooth width transitions when values change (300ms ease-in-out)
- ARIA progressbar role with proper attributes for accessibility
- Respect prefers-reduced-motion media query to disable animations
- i18n support via next-intl for all label text

### Assumptions & Clarifications

- **Discovery**: SessionProgressBar.tsx (lines 48-89) provides excellent pattern for simple progress bars with ARIA attributes
- **Discovery**: QRGenerationProgress.tsx (lines 102-149) shows conditional color logic based on status
- **Discovery**: Project already has `prefers-reduced-motion` CSS handling in globals.css (lines 236-244)
- **Discovery**: Tailwind `animate-pulse` class available for pending animation
- **Assumption**: Zero-count segments should not render at all (no empty colored sections)
- **Assumption**: Segment widths are calculated as `(count / total) * 100%`
- **Assumption**: Component is presentational - parent handles data fetching and state
- **Clarification needed**: Should percentage be shown inside the bar or as separate label?
- **Clarification needed**: Should detailed labels show breakdown per status or just summary?

## Implementation Plan

### Step 1: Create Component File Structure and Basic Imports
- **Description**: Set up component file with 'use client' directive and import all dependencies
- **Rationale**: Establish foundation with proper React Client Component setup
- **Estimated Effort**: 15 minutes

Component file: `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationProgressBar.tsx`

Required imports:
- React hooks: `useMemo` for computed segment widths
- next-intl: `useTranslations` for i18n
- Utils: `cn` from `@/lib/utils`
- Types: `TranslationProgressBarProps` (will be defined in this file initially, moved to types file later)

Module JSDoc header:
```typescript
/**
 * TranslationProgressBar Component
 *
 * Displays translation completion status as a segmented, multi-colored progress bar.
 * Shows proportional segments for complete/pending/failed/stale/missing translations.
 *
 * @module TranslationManagement/TranslationPreviewPanel/TranslationProgressBar
 * @lastModified 2026-01-22 19:09 (REQ-E05-009 - Initial implementation)
 */
```

### Step 2: Define Props Interface and Type Definitions
- **Description**: Create TypeScript interface for component props and helper types
- **Rationale**: Establish type safety for component API
- **Estimated Effort**: 20 minutes

Props interface (initially in component file, later move to TranslationManagement.types.ts):
```typescript
export interface TranslationProgressBarProps {
  /** Count of complete translations */
  completed: number;
  /** Count of pending/in-progress translations */
  pending: number;
  /** Count of failed translations */
  failed: number;
  /** Count of stale translations (optional) */
  stale?: number;
  /** Total number of possible translations */
  total: number;
  /** Show text labels with counts (default: false) */
  showLabels?: boolean;
  /** Show completion percentage (default: false) */
  showPercentage?: boolean;
  /** Size variant (default: 'md') */
  size?: 'sm' | 'md' | 'lg';
  /** Enable pulse animation for pending (default: true when pending > 0) */
  animated?: boolean;
  /** Label format (default: 'compact') */
  labelFormat?: 'compact' | 'detailed';
  /** Additional CSS classes */
  className?: string;
}

interface SegmentConfig {
  count: number;
  color: string;
  animate?: boolean;
}
```

### Step 3: Define Constants for Size Variants and Colors
- **Description**: Create constants for size configurations and color mappings
- **Rationale**: Centralize configuration for maintainability and consistency with TranslationStatusItem
- **Estimated Effort**: 15 minutes

**Size Configurations:**
```typescript
const SIZE_CONFIG = {
  sm: {
    barHeight: 'h-1.5',  // 6px
    fontSize: 'text-xs',
  },
  md: {
    barHeight: 'h-2',    // 8px
    fontSize: 'text-sm',
  },
  lg: {
    barHeight: 'h-3',    // 12px
    fontSize: 'text-base',
  },
} as const;
```

**Color Constants (matching TranslationStatusItem and REQ-E05-008):**
```typescript
const SEGMENT_COLORS = {
  complete: 'bg-green-500',   // #22c55e
  pending: 'bg-orange-500',   // #f97316
  failed: 'bg-red-500',       // #ef4444
  stale: 'bg-amber-500',      // #f59e0b
  missing: 'bg-gray-200',     // Background color
} as const;
```

### Step 4: Implement Segment Width Calculation Logic
- **Description**: Create helper function to calculate proportional widths for each segment
- **Rationale**: Core logic for segmented bar visualization
- **Estimated Effort**: 30 minutes

Width calculation helper using useMemo:
```typescript
function calculateSegmentWidths(
  completed: number,
  pending: number,
  failed: number,
  stale: number,
  total: number
): {
  completed: number;
  pending: number;
  failed: number;
  stale: number;
  missing: number;
} {
  // Ensure total is at least 1 to prevent division by zero
  const safeTotal = Math.max(total, 1);

  // Calculate missing count
  const missing = Math.max(0, total - (completed + pending + failed + stale));

  // Calculate percentage widths
  return {
    completed: (completed / safeTotal) * 100,
    pending: (pending / safeTotal) * 100,
    failed: (failed / safeTotal) * 100,
    stale: (stale / safeTotal) * 100,
    missing: (missing / safeTotal) * 100,
  };
}
```

Usage in component:
```typescript
const widths = useMemo(
  () => calculateSegmentWidths(completed, pending, failed, stale || 0, total),
  [completed, pending, failed, stale, total]
);
```

### Step 5: Implement Main Component Structure
- **Description**: Build component skeleton with root container and ARIA attributes
- **Rationale**: Establish HTML structure with accessibility foundation
- **Estimated Effort**: 30 minutes

Component structure:
```typescript
export function TranslationProgressBar({
  completed,
  pending,
  failed,
  stale = 0,
  total,
  showLabels = false,
  showPercentage = false,
  size = 'md',
  animated = undefined, // Will default based on pending > 0
  labelFormat = 'compact',
  className,
}: TranslationProgressBarProps) {
  // Translations
  const t = useTranslations('translationManagement.progressBar');

  // Default animated behavior: animate when pending > 0
  const shouldAnimate = animated !== undefined ? animated : pending > 0;

  // Calculate segment widths
  const widths = useMemo(
    () => calculateSegmentWidths(completed, pending, failed, stale, total),
    [completed, pending, failed, stale, total]
  );

  // Calculate completion percentage
  const completionPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Size configuration
  const sizeConfig = SIZE_CONFIG[size];

  return (
    <div className={cn('w-full', className)}>
      {/* Labels section (top) */}
      {/* Progress bar section */}
      {/* Detailed labels section (bottom) */}
    </div>
  );
}
```

Root ARIA attributes:
- Role: `"progressbar"` on the bar element
- `aria-valuenow`: completed count
- `aria-valuemin`: 0
- `aria-valuemax`: total
- `aria-label`: descriptive text for screen readers

### Step 6: Implement Progress Bar Container and Segments
- **Description**: Create the visual progress bar with colored segments
- **Rationale**: Core visual component showing translation status
- **Estimated Effort**: 45 minutes

Progress bar container:
```typescript
<div
  className={cn(
    'w-full rounded-full bg-gray-200 overflow-hidden relative',
    sizeConfig.barHeight
  )}
  role="progressbar"
  aria-valuenow={completed}
  aria-valuemin={0}
  aria-valuemax={total}
  aria-label={t('progressAriaLabel', {
    completed,
    pending,
    failed,
    stale,
    total
  })}
>
  {/* Segments rendered left to right */}
  <div className="flex h-full">
    {/* Complete segment */}
    {widths.completed > 0 && (
      <div
        className={cn(
          SEGMENT_COLORS.complete,
          'transition-all duration-300 ease-in-out'
        )}
        style={{ width: `${widths.completed}%` }}
        aria-label={t('completeSegment', { count: completed })}
      />
    )}

    {/* Pending segment (with animation) */}
    {widths.pending > 0 && (
      <div
        className={cn(
          SEGMENT_COLORS.pending,
          'transition-all duration-300 ease-in-out',
          shouldAnimate && 'animate-pulse'
        )}
        style={{ width: `${widths.pending}%` }}
        aria-label={t('pendingSegment', { count: pending })}
      />
    )}

    {/* Failed segment */}
    {widths.failed > 0 && (
      <div
        className={cn(
          SEGMENT_COLORS.failed,
          'transition-all duration-300 ease-in-out'
        )}
        style={{ width: `${widths.failed}%` }}
        aria-label={t('failedSegment', { count: failed })}
      />
    )}

    {/* Stale segment (optional) */}
    {stale > 0 && widths.stale > 0 && (
      <div
        className={cn(
          SEGMENT_COLORS.stale,
          'transition-all duration-300 ease-in-out'
        )}
        style={{ width: `${widths.stale}%` }}
        aria-label={t('staleSegment', { count: stale })}
      />
    )}

    {/* Missing portion is just the gray background showing through */}
  </div>
</div>
```

Note: Segments render in order (complete, pending, failed, stale), with gray background showing missing translations.

### Step 7: Implement Label Display Logic
- **Description**: Add optional label text above or below the progress bar
- **Rationale**: Provide numeric summary for users who need exact counts
- **Estimated Effort**: 30 minutes

**Top Label (summary):**
```typescript
{(showLabels || showPercentage) && (
  <div className={cn('mb-1.5 flex items-center justify-between', sizeConfig.fontSize)}>
    {showLabels && (
      <span className="text-gray-700">
        {labelFormat === 'compact'
          ? t('compactLabel', { completed, total })  // "3/5"
          : t('detailedLabel', { completed, total }) // "3 of 5 translations"
        }
      </span>
    )}
    {showPercentage && (
      <span className="text-gray-600">
        {t('percentage', { percent: completionPercent })}
      </span>
    )}
  </div>
)}
```

**Bottom Label (detailed breakdown - large size only):**
```typescript
{showLabels && labelFormat === 'detailed' && size === 'lg' && (
  <div className={cn('mt-2 flex items-center gap-4 flex-wrap', sizeConfig.fontSize)}>
    {completed > 0 && (
      <span className="flex items-center gap-1.5 text-gray-700">
        <span className={cn('w-2 h-2 rounded-full', SEGMENT_COLORS.complete)} aria-hidden="true" />
        {t('completeCount', { count: completed })}
      </span>
    )}
    {pending > 0 && (
      <span className="flex items-center gap-1.5 text-gray-700">
        <span className={cn('w-2 h-2 rounded-full', SEGMENT_COLORS.pending)} aria-hidden="true" />
        {t('pendingCount', { count: pending })}
      </span>
    )}
    {failed > 0 && (
      <span className="flex items-center gap-1.5 text-gray-700">
        <span className={cn('w-2 h-2 rounded-full', SEGMENT_COLORS.failed)} aria-hidden="true" />
        {t('failedCount', { count: failed })}
      </span>
    )}
    {stale > 0 && (
      <span className="flex items-center gap-1.5 text-gray-700">
        <span className={cn('w-2 h-2 rounded-full', SEGMENT_COLORS.stale)} aria-hidden="true" />
        {t('staleCount', { count: stale })}
      </span>
    )}
  </div>
)}
```

### Step 8: Add Screen Reader Accessible Text
- **Description**: Include visually hidden text describing full status for screen readers
- **Rationale**: Ensure non-visual users get complete status information
- **Estimated Effort**: 15 minutes

Add to component (visually hidden but accessible):
```typescript
<span className="sr-only">
  {t('screenReaderStatus', {
    completed,
    pending,
    failed,
    stale,
    missing: total - (completed + pending + failed + stale),
    total
  })}
</span>
```

CSS for `.sr-only` already exists in globals.css (screen reader only utility class).

### Step 9: Add i18n Translation Keys
- **Description**: Document required translation keys for component
- **Rationale**: Ensure all UI text is translatable
- **Estimated Effort**: 20 minutes

Required translation keys in `/messages/en.json` under `translationManagement.progressBar`:
```json
{
  "translationManagement": {
    "progressBar": {
      "compactLabel": "{completed}/{total}",
      "detailedLabel": "{completed} of {total} translations",
      "percentage": "{percent}%",
      "completeCount": "{count} Complete",
      "pendingCount": "{count} Pending",
      "failedCount": "{count} Failed",
      "staleCount": "{count} Stale",
      "progressAriaLabel": "Translation progress: {completed} complete, {pending} pending, {failed} failed, {stale} stale of {total} total",
      "completeSegment": "{count} translations complete",
      "pendingSegment": "{count} translations pending",
      "failedSegment": "{count} translations failed",
      "staleSegment": "{count} translations stale",
      "screenReaderStatus": "{completed} translations complete, {pending} pending, {failed} failed, {stale} stale, {missing} missing out of {total} total"
    }
  }
}
```

Note: Add equivalent translations to all supported locales (fr, es, de, nl, it).

### Step 10: Create Directory Structure and Export
- **Description**: Create TranslationManagement directory structure and export component
- **Rationale**: Establish proper folder organization for Epic 5 components
- **Estimated Effort**: 10 minutes

Create directories:
```bash
mkdir -p src/components/TranslationManagement/TranslationPreviewPanel
```

Update barrel file `/src/components/TranslationManagement/TranslationPreviewPanel/index.ts`:
```typescript
export { TranslationProgressBar } from './TranslationProgressBar';
// Future exports: TranslationPreviewPanel, TranslationStatusItem, etc.
```

### Step 11: Verify Animation and Reduced Motion Support
- **Description**: Test animation behavior and prefers-reduced-motion handling
- **Rationale**: Ensure accessibility and respect user preferences
- **Estimated Effort**: 15 minutes

Verification steps:
- [ ] Confirm `animate-pulse` applies to pending segment when `animated={true}` and `pending > 0`
- [ ] Verify animation is disabled when `animated={false}` explicitly set
- [ ] Test with browser prefers-reduced-motion setting enabled
- [ ] Confirm globals.css already handles `.animate-pulse` with reduced motion (lines 236-241)
- [ ] Verify smooth width transitions work when prop values change

### Step 12: Manual Testing Checklist
- **Description**: Test component with various value combinations
- **Rationale**: Ensure all configurations and edge cases work correctly
- **Estimated Effort**: 30 minutes

Test scenarios:
- [ ] **Size variants**: Render at sm, md, lg sizes with correct bar heights
- [ ] **All segments**: `completed=2, pending=1, failed=1, stale=1, total=6` shows all colors
- [ ] **Missing only**: `completed=0, pending=0, failed=0, total=5` shows gray bar
- [ ] **Complete only**: `completed=5, pending=0, failed=0, total=5` shows green bar only
- [ ] **Zero values**: Segments with count=0 do not render (no empty colored sections)
- [ ] **Pending animation**: Pending segment pulses when animated=true
- [ ] **No animation**: No pulse when animated=false
- [ ] **Compact labels**: Shows "3/5" format when labelFormat='compact'
- [ ] **Detailed labels**: Shows "3 of 5 translations" when labelFormat='detailed'
- [ ] **Percentage display**: Shows "60%" when showPercentage=true
- [ ] **Large detailed labels**: Bottom breakdown shows when size='lg' and labelFormat='detailed'
- [ ] **Width transitions**: Smooth animation when changing prop values
- [ ] **ARIA attributes**: Verify role, aria-valuenow, aria-valuemax are correct
- [ ] **Screen reader text**: Confirm sr-only text describes full status
- [ ] **Overflow prevention**: Total segment width never exceeds 100%
- [ ] **Reduced motion**: Animation disabled with prefers-reduced-motion

## Authorized Files and Functions for Modification

> ⚠️ **APPROVED SCOPE**: Changes outside this list require review

### New Files to Create
| File | Target | Type |
|------|--------|------|
| `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationProgressBar.tsx` | — | Create |
| `/src/components/TranslationManagement/TranslationPreviewPanel/index.ts` | — | Create (barrel file) |

### New Directories to Create
| Directory | Purpose |
|-----------|---------|
| `/src/components/TranslationManagement/` | Top-level directory for Epic 5 components |
| `/src/components/TranslationManagement/TranslationPreviewPanel/` | Directory for preview panel and related components |

### Existing Files to Reference (Read-Only)
| File | Purpose |
|------|------------|
| `/src/components/ItemCreationWorkflow/components/shared/SessionProgressBar.tsx` | Pattern reference for simple progress bars (lines 48-89) |
| `/src/components/ItemCreationWorkflow/components/shared/QRGenerationProgress.tsx` | Pattern reference for conditional color logic (lines 102-149) |
| `/src/app/globals.css` | Verify prefers-reduced-motion handling (lines 236-244) |
| `/src/lib/utils.ts` | Import `cn` utility |
| `/messages/en.json` | Add translation keys |

## Dependencies

### Depends On (Completed First)
- **REQ-E05-006**: TranslationManagement Types File
  - Status: Pending (not yet created)
  - Note: Props interface will be initially defined in component file, then moved to types file when REQ-E05-006 is implemented
  - Reason: Component can function without centralized types initially
- **Existing**: Tailwind CSS configured with animate-pulse
- **Existing**: next-intl configured for i18n
- **Existing**: globals.css with prefers-reduced-motion support

### Blocks (Requires This First)
- **REQ-E05-007**: TranslationPreviewPanel Component - parent component will use this progress bar
- **Future**: Dashboard translation status widgets - will reuse this component
- **Future**: Translation list views - will show progress inline

### Parallel Safety
- **Files touched**:
  - `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationProgressBar.tsx` (new file)
  - `/src/components/TranslationManagement/TranslationPreviewPanel/index.ts` (new file)
- **Conflicts with**:
  - REQ-E05-008 (TranslationStatusItem) - both modify same index.ts, but separate export lines (git merge safe)
- **Safe to parallelize with**:
  - REQ-E05-008 (TranslationStatusItem) - different component file, separate exports
  - All Epic 5 API endpoint tasks (different files entirely)
  - Epic 5 database/type tasks (different scope)

### External Dependencies
- React 18+ with hooks (useMemo)
- Next.js 15.5.9 with App Router
- next-intl for i18n
- Tailwind CSS for styling with animate-pulse
- TypeScript 5.x with strict mode

## Risks and Considerations

### Potential Side Effects
- **Color consistency**: Progress bar colors MUST match TranslationStatusItem (REQ-E05-008) for visual consistency
  - Mitigation: Use exact same Tailwind color classes documented in both specs
  - Mitigation: Consider extracting color constants to shared file in future

- **Animation performance**: animate-pulse on pending segment may cause repaints
  - Mitigation: Tailwind's animate-pulse is GPU-accelerated and performant
  - Mitigation: Animation only applies when pending > 0

- **Width calculation precision**: Floating point math may cause segments to not sum exactly to 100%
  - Mitigation: Use percentage-based widths in CSS (browser handles rounding)
  - Mitigation: Test with various count combinations

- **i18n keys missing**: If translation keys not added to all locale files, component shows fallback text
  - Mitigation: Document all required keys in this overview
  - Mitigation: Add keys to all 6 supported locales (en, fr, es, de, nl, it)

### Testing Requirements
- **Unit tests**:
  - Segment width calculations for various count combinations
  - Zero-count segments do not render
  - Animation applies only when animated=true and pending > 0
  - Size variants render correct bar heights and font sizes
  - Label formats produce correct text

- **Integration tests**:
  - Component renders within TranslationPreviewPanel
  - Smooth transitions when prop values change
  - ARIA attributes present and accurate
  - Screen reader text describes full status

- **Visual regression tests**:
  - All 5 segment colors render correctly (green, orange, red, amber, gray)
  - Size variants (sm, md, lg) display at correct heights
  - Pending segment pulses during animation
  - Rounded corners on bar container

- **Accessibility tests**:
  - ARIA progressbar role and attributes correct
  - Screen reader announces status accurately
  - Animation respects prefers-reduced-motion
  - Color contrast meets WCAG AA standards
  - Keyboard focus not applicable (non-interactive component)

### Open Questions
- [ ] Should percentage be displayed inside the bar or as separate label above/below?
  - Recommendation: Separate label for clarity and flexibility (implemented in Step 7)
- [ ] Should detailed labels show as legend below bar or inline?
  - Recommendation: Below bar for lg size only (matches spec visual layout)
- [ ] Should we support additional status types in the future (e.g., "reviewing", "needs-review")?
  - Recommendation: Design is extensible - add new segments as needed without breaking changes
- [ ] Should we add click handlers to segments for filtering/interaction?
  - Recommendation: No - keep component presentational, parent handles interactions
- [ ] Should we support vertical orientation in addition to horizontal?
  - Recommendation: Out of scope for now, add if needed in future

## Out of Scope

The following are explicitly **not** included in this task:
- Click handlers or interactive segments (component is presentational only)
- Data fetching or API calls (parent component responsibility)
- Integration with TranslationPreviewPanel component (separate task: REQ-E05-007)
- Tooltip on hover showing detailed breakdown (can be added in future enhancement)
- Animation customization beyond animate-pulse (e.g., custom keyframes)
- Real-time updates or WebSocket integration for live progress
- Export/download progress visualization to image
- Comparison view showing progress over time
- Historical progress tracking or analytics
- Progress bar for individual entity types (item vs article vs link)
- Filtering or drill-down by clicking segments
- Sorting or grouping multiple progress bars
- Configurable color schemes or themes
- Dark mode specific colors (will inherit from Tailwind dark mode if implemented)
- Vertical progress bar orientation
- Stacked or grouped progress bars
- Progress bar with hover tooltips for each segment
- Loading skeleton state for the progress bar itself
- Error state visualization (relies on failed segment)

## Special Notes

### Color Consistency with TranslationStatusItem

**CRITICAL**: The segment colors defined in this component MUST exactly match TranslationStatusItem (REQ-E05-008):

| Status | Color | Tailwind Class | Hex Value |
|--------|-------|----------------|-----------|
| Complete | Green | `bg-green-500` | `#22c55e` |
| Pending | Orange | `bg-orange-500` | `#f97316` |
| Failed | Red | `bg-red-500` | `#ef4444` |
| Stale | Amber | `bg-amber-500` | `#f59e0b` |
| Missing | Gray | `bg-gray-200` | `#e5e7eb` |

These colors are also documented in:
- Translation Status API (REQ-E05-001)
- Database schema (translation_status column values)

**Future Enhancement**: Consider extracting these colors to a shared constants file:
- `/src/components/TranslationManagement/constants/translationColors.ts`
- Import in both TranslationProgressBar and TranslationStatusItem

### Segment Rendering Order

Segments are rendered left-to-right in this specific order:
1. Complete (green)
2. Pending (orange, animated)
3. Failed (red)
4. Stale (amber)
5. Missing (gray background shows through)

This order provides logical visual flow: success → in-progress → errors → outdated → not-started.

### Width Calculation Details

Segment widths use proportional percentage calculation:
- Each segment: `(count / total) * 100%`
- Browser handles sub-pixel rounding automatically
- Zero-count segments: Conditional rendering prevents empty colored sections
- Missing calculation: `total - (completed + pending + failed + stale)`

**Edge Cases:**
- `total = 0`: Component should handle gracefully (return 0% for all)
- Negative counts: Assume parent validates (use Math.max(0, count) if needed)
- Counts exceed total: Unlikely but could clamp widths to 100% max

### Animation Behavior

Pending segment animation:
- Uses Tailwind's `animate-pulse` class
- Automatically disabled via globals.css when `prefers-reduced-motion: reduce`
- Animation applies when: `animated !== false && pending > 0`
- Default behavior: Animate when pending > 0 (unless explicitly disabled)

Animation specification from globals.css (lines 236-241):
```css
@media (prefers-reduced-motion: reduce) {
  .animate-pulse {
    animation: none;
    opacity: 0.6;
  }
}
```

### Accessibility Implementation

ARIA progressbar role implementation:
- `role="progressbar"` on bar container
- `aria-valuenow={completed}` - current progress value
- `aria-valuemin={0}` - minimum value (0)
- `aria-valuemax={total}` - maximum value (total translations)
- `aria-label` describes full status for screen readers

Screen reader text:
- Visually hidden span with complete status description
- Updates dynamically when prop values change
- Provides context that visual-only users might miss

### Performance Considerations

This component is designed for efficient rendering:
- Uses `useMemo` for width calculations to avoid recalculation on every render
- No expensive operations in render path
- Conditional rendering prevents unnecessary DOM elements (zero-count segments)
- CSS transitions are GPU-accelerated (transform/opacity would be even better, but width is acceptable)

Expected performance:
- Renders instantly for typical counts (0-100)
- Handles large counts (1000+) without performance degradation
- Smooth transitions when values change (300ms duration)
- No performance impact from animation (GPU-accelerated pulse)

**Optimization Notes:**
- If rendering 50+ progress bars simultaneously, consider virtualization
- Width transitions use `transition-all` - could optimize to `transition: width 300ms` for specificity

### Integration with TranslationPreviewPanel

This component will be consumed by TranslationPreviewPanel (REQ-E05-007) as:
```tsx
// Inside TranslationPreviewPanel.tsx
<TranslationProgressBar
  completed={translationStats.completed}
  pending={translationStats.pending}
  failed={translationStats.failed}
  stale={translationStats.stale}
  total={5} // 5 target languages
  showLabels={true}
  size="md"
  animated={true}
/>
```

The parent component is responsible for:
- Fetching translation counts via API
- Calculating stats from translation status data
- Handling loading/error states
- Re-fetching data when translations are updated

### Future Enhancement Opportunities

Potential improvements for future iterations:
1. **Tooltip on hover**: Show detailed breakdown when hovering over segments
2. **Click handlers**: Allow filtering by status when clicking segments
3. **Custom animation**: Replace animate-pulse with custom keyframe for smoother effect
4. **Gradient segments**: Use gradients instead of solid colors for visual polish
5. **Vertical orientation**: Support vertical progress bars for sidebar widgets
6. **Comparison mode**: Show before/after progress bars for tracking improvements
7. **Sparkline integration**: Combine with sparkline showing progress over time
8. **Theme support**: Custom color schemes for different contexts (dashboard vs modal)

---
*Document generated: 2026-01-22 19:09*
