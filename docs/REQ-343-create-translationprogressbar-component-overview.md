# REQ-343: Create TranslationProgressBar Component - Implementation Overview

**Document Type:** Technical Lead Implementation Breakdown
**Request ID:** REQ-343
**Created:** 2026-01-19
**Last Modified:** 2026-01-19
**Status:** Ready for Implementation
**Phase:** 2 - Core UI Components
**Task ID:** 2.4
**Parent Epic:** L10N Epic 5 - Owner Translation Management
**Implementation Plan Reference:** Plan-111-L10N-Epic5-Owner-Translation-Management.md
**Size:** S (Small)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Request Analysis](#2-request-analysis)
3. [Technical Context](#3-technical-context)
4. [Component Architecture](#4-component-architecture)
5. [Implementation Approach](#5-implementation-approach)
6. [Authorized Files and Functions for Modification](#6-authorized-files-and-functions-for-modification)
7. [Integration Points](#7-integration-points)
8. [Acceptance Criteria](#8-acceptance-criteria)
9. [Visual Specifications](#9-visual-specifications)
10. [Dependencies](#10-dependencies)
11. [Risk Assessment](#11-risk-assessment)
12. [References](#12-references)

---

## 1. Executive Summary

### 1.1 Purpose

Create a reusable `TranslationProgressBar` component that provides visual feedback on translation completion status across all supported languages. This component displays progress as both a filled bar and a textual count (e.g., "3/5 translations complete") and supports animation during active translation processing.

### 1.2 Scope

- **Component File:** `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationProgressBar.tsx`
- **Primary Use Case:** Display translation completion progress within the `TranslationPreviewPanel` slide-out component
- **Secondary Use Cases:** Dashboard widgets, bulk translation status displays

### 1.3 Business Value

Property owners benefit from instant visual comprehension of translation coverage without mentally counting language rows. The animated state during processing reduces perceived wait time and provides reassurance that translation requests are being actively processed.

---

## 2. Request Analysis

### 2.1 Original Request (from gen_requests_epic5.md)

> **REQ-343: Create TranslationProgressBar Component for Visual Translation Status**
>
> Users should see a visual progress indicator showing the completion status of translations across all supported languages with real-time updates during active translation processing.

### 2.2 User Impact

- Instant assessment of translation coverage for content
- Visual feedback during translation processing reassures users
- Quick scanning of progress bars across multiple items helps prioritize translation attention

### 2.3 Key Requirements

| Requirement | Description |
|-------------|-------------|
| Progress Display | Horizontal bar with fill indicating completion percentage |
| Text Label | Display completion count in "X/Y translations complete" format |
| Animation | Animated state during active processing (gradient/pulse effect) |
| Color Scheme | Progress fill uses success color theme |
| Edge Cases | Handle zero translations, all complete, and in-progress states |
| Configurability | Width adapts to container or is configurable via props |

---

## 3. Technical Context

### 3.1 Existing Technology Stack

| Technology | Version/Details |
|------------|-----------------|
| Framework | Next.js 15.5.9 with App Router |
| Language | TypeScript 5.x (strict mode) |
| Styling | Tailwind CSS 4.x |
| UI Primitives | Radix UI, Heroicons, Lucide React |
| State | React Context + useReducer patterns |

### 3.2 Relevant Existing Patterns

| Pattern | Location | Usage |
|---------|----------|-------|
| Loading State Animation | `/src/components/ItemManager/components/shared/LoadingState.tsx` | `animate-pulse` pattern for skeleton loading |
| Status Indicators | `/src/components/ItemManager/components/shared/TagChip.tsx` | Pill-shaped status displays with color variants |
| Tailwind Utilities | `/src/lib/utils.ts` | `cn()` function for class name merging |
| i18n Configuration | `/src/lib/i18n/config.ts` | Language metadata and locale support |
| Translation Types | `/src/lib/translation-service/translation-service.types.ts` | `SupportedLanguage`, `TranslationStatus` types |

### 3.3 Design System Colors (from Plan-111)

| State | Color | Tailwind Class |
|-------|-------|----------------|
| Completed/Success | Green (#22C55E) | `bg-green-500` |
| In Progress | Blue (#3B82F6) | `bg-blue-500` |
| Partial | Amber (#F59E0B) | `bg-amber-500` |
| Background | Gray (#E5E7EB) | `bg-gray-200` |

---

## 4. Component Architecture

### 4.1 Component Structure

```
/src/components/TranslationManagement/
├── TranslationManagement.types.ts          # Shared types (REQ-341)
├── index.ts                                 # Barrel exports
│
└── TranslationPreviewPanel/
    ├── index.ts                             # Panel exports
    ├── TranslationPreviewPanel.tsx          # Main panel (REQ-342.2)
    ├── TranslationStatusItem.tsx            # Status rows (REQ-342)
    └── TranslationProgressBar.tsx           # This component (REQ-343)
```

### 4.2 Props Interface

Based on `TranslationProgressBarProps` from `TranslationManagement.types.ts`:

```typescript
interface TranslationProgressBarProps {
  /** Number of completed translations */
  completed: number;

  /** Total number of translations expected */
  total: number;

  /** Whether to show the count label (e.g., "3/5") */
  showLabel?: boolean;

  /** Whether to animate during processing */
  isAnimating?: boolean;

  /** Size variant for the progress bar */
  size?: 'sm' | 'md' | 'lg';

  /** Additional CSS classes */
  className?: string;
}
```

### 4.3 Component States

| State | Visual Representation |
|-------|----------------------|
| Empty (0/N) | Empty bar with gray background, "0/N translations" label |
| Partial (X/N) | Partially filled bar (green), "X/N translations complete" |
| Complete (N/N) | Fully filled bar (green), "N/N translations complete" |
| Processing | Animated gradient/shimmer effect on the filled portion |

---

## 5. Implementation Approach

### 5.1 Recommended Approach: CSS-Only Animation

Use Tailwind CSS animations with custom keyframes for the processing state rather than JavaScript-based animations. This provides better performance and follows existing codebase patterns.

**Animation Strategy:**
- Use `animate-pulse` for subtle processing indication (consistent with `LoadingState.tsx`)
- Alternatively, implement custom shimmer gradient animation via Tailwind `@keyframes`

### 5.2 Implementation Tasks

#### Task 5.2.1: Create Component File with Type Definitions

**File:** `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationProgressBar.tsx`

1. Create file with `'use client'` directive
2. Add module-level JSDoc documentation
3. Import required dependencies:
   - `React`
   - `cn` from `@/lib/utils`
4. Define component props interface (or import from types file if already defined)

#### Task 5.2.2: Implement Core Progress Bar Structure

```typescript
// Recommended structure
export function TranslationProgressBar({
  completed,
  total,
  showLabel = true,
  isAnimating = false,
  size = 'md',
  className,
}: TranslationProgressBarProps) {
  // Calculate percentage
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const isComplete = completed === total && total > 0;

  return (
    <div className={cn('...', className)}>
      {/* Progress bar container */}
      <div className="...">
        {/* Filled portion */}
        <div
          className={cn(
            '...',
            isAnimating && 'animate-...',
          )}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={completed}
          aria-valuemin={0}
          aria-valuemax={total}
        />
      </div>

      {/* Label */}
      {showLabel && (
        <span className="...">
          {completed}/{total} translations{isComplete ? '' : ' complete'}
        </span>
      )}
    </div>
  );
}
```

#### Task 5.2.3: Implement Size Variants

| Size | Bar Height | Font Size |
|------|------------|-----------|
| `sm` | `h-1.5` (6px) | `text-xs` |
| `md` | `h-2` (8px) | `text-sm` |
| `lg` | `h-3` (12px) | `text-base` |

#### Task 5.2.4: Implement Animation Effect

**Option A: Pulse Animation (Simpler)**
```typescript
isAnimating && 'animate-pulse'
```

**Option B: Shimmer Gradient (More Visual)**
```typescript
// Add custom keyframes to tailwind.config.ts or use inline styles
isAnimating && 'bg-gradient-to-r from-green-500 via-green-400 to-green-500 bg-[length:200%_100%] animate-shimmer'
```

If using shimmer, add to `tailwind.config.ts`:
```javascript
animation: {
  shimmer: 'shimmer 1.5s ease-in-out infinite',
},
keyframes: {
  shimmer: {
    '0%': { backgroundPosition: '200% 0' },
    '100%': { backgroundPosition: '-200% 0' },
  },
},
```

#### Task 5.2.5: Add Accessibility Features

- `role="progressbar"` on the progress element
- `aria-valuenow={completed}` for current value
- `aria-valuemin={0}` for minimum
- `aria-valuemax={total}` for maximum
- `aria-label` for screen reader description
- `aria-describedby` linking to the label text

#### Task 5.2.6: Update Barrel Exports

Update `/src/components/TranslationManagement/TranslationPreviewPanel/index.ts` to export the component.

---

## 6. Authorized Files and Functions for Modification

### 6.1 New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationProgressBar.tsx` | Main component implementation |

### 6.2 Files to Modify

| File Path | Modification |
|-----------|--------------|
| `/src/components/TranslationManagement/TranslationPreviewPanel/index.ts` | Add export for TranslationProgressBar |
| `/src/components/TranslationManagement/index.ts` | Ensure re-export from TranslationPreviewPanel |

### 6.3 Files to Reference (Read-Only)

| File Path | Reference Purpose |
|-----------|-------------------|
| `/src/components/TranslationManagement/TranslationManagement.types.ts` | `TranslationProgressBarProps` type definition |
| `/src/lib/utils.ts` | `cn()` utility function |
| `/src/components/ItemManager/components/shared/LoadingState.tsx` | Animation pattern reference |
| `/src/components/ItemManager/components/shared/TagChip.tsx` | Component structure and styling patterns |
| `/src/lib/translation-service/translation-service.types.ts` | `SupportedLanguage` type |

### 6.4 Scope Boundaries

**DO:**
- Create the TranslationProgressBar component
- Export the component from index files
- Use existing utility functions and types

**DO NOT:**
- Modify TypeScript types (already defined in REQ-341)
- Modify Tailwind configuration (unless shimmer animation is chosen)
- Create test files (deferred to Phase 7)
- Modify other components

---

## 7. Integration Points

### 7.1 Usage in TranslationPreviewPanel

```tsx
// In TranslationPreviewPanel.tsx
import { TranslationProgressBar } from './TranslationProgressBar';

// Calculate completed count from translations map
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
```

### 7.2 Usage in TranslationStatusWidget (Dashboard)

```tsx
<TranslationProgressBar
  completed={summary.complete}
  total={summary.total}
  size="lg"
  isAnimating={summary.pending > 0}
/>
```

### 7.3 Expected Consumers

| Component | Location | Purpose |
|-----------|----------|---------|
| TranslationPreviewPanel | `/src/components/TranslationManagement/TranslationPreviewPanel/` | Primary consumer, shows in slide-out panel |
| TranslationStatusWidget | `/src/components/TranslationManagement/TranslationStatusWidget/` | Dashboard summary widget |
| BulkTranslationBar | `/src/components/TranslationManagement/BulkTranslationBar/` | Bulk operations progress |

---

## 8. Acceptance Criteria

### 8.1 Functional Requirements

- [ ] Component file created at specified path
- [ ] Component accepts `completed` and `total` props for count display
- [ ] Component renders horizontal progress bar with fill based on percentage
- [ ] Component displays text label in "X/Y translations complete" format
- [ ] Progress bar fill uses green color for completed translations
- [ ] Component displays animation during processing (when `isAnimating` is true)
- [ ] Animation stops when `isAnimating` is false
- [ ] Component handles edge cases:
  - [ ] Zero translations (0/0): Empty bar, appropriate label
  - [ ] Zero completed (0/N): Empty bar, shows count
  - [ ] All complete (N/N): Full bar, shows count
  - [ ] Partial (X/N): Partial fill, shows count
- [ ] Progress bar width adapts to container or respects className override

### 8.2 Non-Functional Requirements

- [ ] Component is a Client Component (`'use client'`)
- [ ] TypeScript strict mode compliant
- [ ] All props have JSDoc documentation
- [ ] ARIA attributes for accessibility (progressbar role, value attributes)
- [ ] Follows existing codebase patterns (cn utility, Tailwind classes)
- [ ] No console warnings or errors
- [ ] Component exported from index files

### 8.3 Verification Commands

```bash
# TypeScript compilation check
npx tsc --noEmit

# Lint check
npm run lint

# Build verification
npm run build
```

---

## 9. Visual Specifications

### 9.1 Layout Reference (from Plan-111)

```
┌─────────────────────────────────────────────────────────────────┐
│ Translations:    [3/5 Complete] ████████░░                     │
└─────────────────────────────────────────────────────────────────┘
```

### 9.2 Detailed Visual Structure

```
Component Layout:

┌──────────────────────────────────────────────────────────────────┐
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ [                   Progress Bar                          ] │  │
│  │ ████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │  │
│  │ ← Filled (60%) →                  ← Empty (40%) →          │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│                            3/5 translations complete             │
│                            ↑ Label text (optional)               │
└──────────────────────────────────────────────────────────────────┘
```

### 9.3 Size Variants

| Size | Bar Height | Corner Radius | Label Font |
|------|------------|---------------|------------|
| `sm` | 6px (`h-1.5`) | `rounded` | `text-xs` |
| `md` | 8px (`h-2`) | `rounded` | `text-sm` |
| `lg` | 12px (`h-3`) | `rounded-md` | `text-base` |

### 9.4 Color Specifications

| Element | Default State | Color | Tailwind |
|---------|--------------|-------|----------|
| Bar Background | Always | Gray-200 | `bg-gray-200` |
| Filled Portion | Completed | Green-500 | `bg-green-500` |
| Filled Portion | Processing | Green-500 + animation | `bg-green-500 animate-pulse` |
| Label Text | Always | Gray-700 | `text-gray-700` |

### 9.5 Animation Specification

**Processing State Animation:**
- **Type:** Pulse (opacity fade in/out) OR Shimmer (gradient movement)
- **Duration:** 1.5-2 seconds per cycle
- **Easing:** ease-in-out
- **Effect:** Subtle visual indication that work is in progress

---

## 10. Dependencies

### 10.1 Required Before Implementation

| Dependency | Status | Blocker |
|------------|--------|---------|
| Task 2.1: TranslationManagement.types.ts (REQ-341) | Must be complete | Yes - types required |
| Translation service types | Exists | No |
| cn utility | Exists | No |

### 10.2 Not Required (Can Implement Independently)

| Component | Notes |
|-----------|-------|
| TranslationPreviewPanel | Progress bar can be built standalone |
| TranslationStatusItem | No direct dependency |
| Supabase realtime | Animation trigger comes via props |

---

## 11. Risk Assessment

### 11.1 Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Type mismatch with TranslationManagement.types.ts | Low | Medium | Verify props interface matches before implementation |
| Animation performance | Low | Low | Use CSS-only animations (not JS intervals) |
| Tailwind config changes needed | Medium | Low | Shimmer animation may need config update; pulse doesn't |

### 11.2 Integration Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Incompatible with parent container | Low | Low | Use flexible width (100% default) |
| Label truncation on narrow containers | Medium | Low | Use responsive font sizing |

---

## 12. References

### 12.1 Project Documentation

- **Request Source:** `/docs/gen_requests_epic5.md` (REQ-343)
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- **Types Task:** `/docs/REQ-341-create-translationmanagement-types-file-detailed.md`
- **Related Component:** `/docs/REQ-342-create-translationstatusitem-component-detailed.md`

### 12.2 Codebase References

| Reference | Path |
|-----------|------|
| Type definitions | `/src/components/TranslationManagement/TranslationManagement.types.ts` |
| cn utility | `/src/lib/utils.ts` |
| Loading animation pattern | `/src/components/ItemManager/components/shared/LoadingState.tsx` |
| Status indicator pattern | `/src/components/ItemManager/components/shared/TagChip.tsx` |

### 12.3 External Documentation

- [Tailwind CSS Animation](https://tailwindcss.com/docs/animation)
- [ARIA Progressbar Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/meter/)
- [React Accessibility Guide](https://react.dev/reference/react-dom/components/common#aria-attributes)

---

## Appendix A: Example Implementation

```typescript
'use client';

/**
 * TranslationProgressBar Component
 *
 * Visual progress indicator showing translation completion status.
 * Displays a horizontal bar with fill and optional text label.
 *
 * @module TranslationManagement/TranslationPreviewPanel/TranslationProgressBar
 * @created 2026-01-19
 * @lastModified 2026-01-19
 */

import React from 'react';
import { cn } from '@/lib/utils';

// Props interface (may import from TranslationManagement.types.ts)
export interface TranslationProgressBarProps {
  completed: number;
  total: number;
  showLabel?: boolean;
  isAnimating?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Size configuration
const SIZE_CONFIG = {
  sm: { bar: 'h-1.5 rounded', label: 'text-xs' },
  md: { bar: 'h-2 rounded', label: 'text-sm' },
  lg: { bar: 'h-3 rounded-md', label: 'text-base' },
} as const;

export function TranslationProgressBar({
  completed,
  total,
  showLabel = true,
  isAnimating = false,
  size = 'md',
  className,
}: TranslationProgressBarProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const sizeConfig = SIZE_CONFIG[size];

  const labelId = React.useId();
  const labelText = total === 0
    ? 'No translations'
    : `${completed}/${total} translations${completed === total ? '' : ' complete'}`;

  return (
    <div className={cn('w-full', className)}>
      {/* Progress bar */}
      <div
        className={cn('w-full bg-gray-200 overflow-hidden', sizeConfig.bar)}
        role="progressbar"
        aria-valuenow={completed}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-describedby={showLabel ? labelId : undefined}
        aria-label={`Translation progress: ${percentage}% complete`}
      >
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
        <p id={labelId} className={cn('mt-1 text-gray-700', sizeConfig.label)}>
          {labelText}
        </p>
      )}
    </div>
  );
}

export default TranslationProgressBar;
```

---

*Document generated for FAQBNB Localization Epic 5 - Task 2.4*
*Technical Lead: Claude | Date: 2026-01-19*
