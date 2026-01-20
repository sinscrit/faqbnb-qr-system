# Detailed Task Breakdown: REQ-E05-013 - Create TranslationStatusWidget Component

**Document Created:** 2026-01-20 18:30 UTC
**Last Modified:** 2026-01-20 18:30 UTC
**Request ID:** REQ-E05-013
**Epic:** Epic 5 - Owner Translation Management
**Phase:** 3 - Dashboard Integration
**Task ID:** 3.1
**Overview Document:** REQ-E05-013-create-translationstatuswidget-component-overview.md

---

## Task Summary

Create a dashboard widget component that displays an at-a-glance summary of translation coverage across all property content, showing overall progress and status breakdowns with quick access to detailed translation management.

**Size:** M (Medium)
**Estimated Effort:** 5.75 hours

---

## Prerequisites

Before starting this task, ensure the following are complete:

| Prerequisite | Status | Notes |
|--------------|--------|-------|
| Epic 1 Foundation tables | Required | `translation_jobs`, `*_translation` tables must exist |
| Epic 3 Dynamic Content | Required | Translation trigger system, status tracking |
| REQ-E05-001 Translation Status API | Required | GET `/api/translations/status` endpoint |
| REQ-E05-011 useTranslationStatus hook | Required | Data fetching hook |
| REQ-E05-012 useTranslationRealtime hook | Required | Live updates hook |
| TranslationManagement folder exists | Required | `/src/components/TranslationManagement/` |

**If hooks are not ready:** Create stub implementations returning mock data before proceeding.

---

## Task Breakdown

### Task 1: Create Widget Types File

**File:** `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.types.ts`

**Effort:** 0.5 hours

**Description:** Define TypeScript interfaces for the widget component props and data structures.

**Implementation Steps:**

1. Create the directory structure if it doesn't exist:
   ```
   /src/components/TranslationManagement/TranslationStatusWidget/
   ```

2. Create `TranslationStatusWidget.types.ts` with the following types:

```typescript
// TranslationStatusWidget.types.ts
// REQ-E05-013: Type definitions for Dashboard Translation Status Widget
// Created: 2026-01-20 18:30 UTC
// Last Modified: 2026-01-20 18:30 UTC

/**
 * Props for the TranslationStatusWidget component
 */
export interface TranslationStatusWidgetProps {
  /** Property ID to scope statistics - required for filtering */
  propertyId: string;

  /** Additional CSS classes for custom styling */
  className?: string;

  /** Handler for "View Details" navigation action */
  onViewDetails?: () => void;

  /** Widget display variant - compact for dashboard, detailed for expanded view */
  variant?: 'compact' | 'detailed';
}

/**
 * Summary statistics for translation status
 * Matches the API response structure from /api/translations/status
 */
export interface TranslationStatusSummary {
  /** Total number of content items with translations */
  total: number;

  /** Number with all 5 non-English languages translated */
  complete: number;

  /** Number with some but not all languages translated */
  partial: number;

  /** Number with translations currently pending/processing */
  pending: number;

  /** Number with failed translations requiring attention */
  failed: number;

  /** Calculated completion percentage (0-100) */
  completionPercentage: number;
}

/**
 * Props for the internal StatusCount sub-component
 */
export interface StatusCountProps {
  /** Lucide icon component to display */
  icon: React.ComponentType<{ className?: string }>;

  /** Status label text */
  label: string;

  /** Numeric count value */
  count: number;

  /** Tailwind color classes for icon and background */
  colorClass: string;

  /** Whether to highlight this count (e.g., for failed status) */
  highlight?: boolean;
}
```

**Acceptance Criteria:**
- [ ] File created at correct path
- [ ] TranslationStatusWidgetProps interface defined with all props
- [ ] TranslationStatusSummary interface matches API response structure
- [ ] StatusCountProps interface defined for sub-component
- [ ] JSDoc comments on all interfaces and properties
- [ ] Types export properly

---

### Task 2: Create Main Widget Component

**File:** `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.tsx`

**Effort:** 2 hours

**Description:** Implement the main dashboard widget component with data fetching, loading states, and status display.

**Implementation Steps:**

1. Create the component file with the following structure:

```typescript
// TranslationStatusWidget.tsx
// REQ-E05-013: Dashboard Translation Status Summary Widget
// Created: 2026-01-20 18:30 UTC
// Last Modified: 2026-01-20 18:30 UTC

'use client';

import React from 'react';
import Link from 'next/link';
import { Globe, CheckCircle, Clock, AlertCircle, Edit } from 'lucide-react';
import { useTranslationStatus } from '@/hooks/useTranslationStatus';
import { useTranslationRealtime } from '@/hooks/useTranslationRealtime';
import { cn } from '@/lib/utils';
import type {
  TranslationStatusWidgetProps,
  TranslationStatusSummary,
  StatusCountProps
} from './TranslationStatusWidget.types';
```

2. Implement the main component with these sections:
   - Hook integration for data fetching
   - Realtime subscription for live updates
   - Loading state handling
   - Error state handling
   - Empty state handling
   - Main render with progress bar and status counts

3. Key implementation patterns to follow:
   - Use `cn()` utility for className merging (from `/src/lib/utils.ts`)
   - Follow card styling from `StatisticsCards.tsx`:
     - `bg-white rounded-xl shadow-sm p-6`
     - `hover:shadow-md transition-all`
   - Use ARIA attributes for accessibility

4. Progress bar implementation:
   ```typescript
   // Progress bar with ARIA accessibility
   <div
     className="w-full bg-gray-200 rounded-full h-2"
     role="progressbar"
     aria-valuenow={summary.completionPercentage}
     aria-valuemin={0}
     aria-valuemax={100}
     aria-label={`Translation completion: ${summary.completionPercentage}%`}
   >
     <div
       className={cn(
         'h-2 rounded-full transition-all duration-300 ease-in-out',
         getProgressColor(summary.completionPercentage)
       )}
       style={{ width: `${summary.completionPercentage}%` }}
     />
   </div>
   ```

5. Color utility function:
   ```typescript
   function getProgressColor(percentage: number): string {
     if (percentage >= 80) return 'bg-green-500';
     if (percentage >= 40) return 'bg-amber-500';
     return 'bg-gray-300';
   }
   ```

**Component Structure:**

```
TranslationStatusWidget
├── Header (Globe icon + "Translation Status" title)
├── Progress Bar Section
│   ├── Label ("Overall Progress")
│   ├── Percentage text
│   └── Progress bar with color coding
├── Status Counts Grid (2x2)
│   ├── Complete (CheckCircle, green)
│   ├── Partial (Edit, amber)
│   ├── Pending (Clock, blue)
│   └── Failed (AlertCircle, red, highlighted if > 0)
└── View Details Link
```

**Acceptance Criteria:**
- [ ] Component accepts propertyId prop
- [ ] Integrates with useTranslationStatus hook
- [ ] Integrates with useTranslationRealtime hook for live updates
- [ ] Renders loading skeleton while data is loading
- [ ] Renders error state with retry button when fetch fails
- [ ] Renders empty state when no content exists
- [ ] Displays progress bar with correct percentage
- [ ] Progress bar color changes based on percentage (80%+ green, 40-79% orange, <40% gray)
- [ ] Displays 4 status counts (complete, partial, pending, failed)
- [ ] Failed count is highlighted when > 0
- [ ] "View Details" link navigates to /dashboard2/translations
- [ ] Component has proper ARIA labels for accessibility
- [ ] Hover state on card and link
- [ ] Consistent height (no layout shifts)

---

### Task 3: Create Sub-Components

**File:** `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.tsx` (continued)

**Effort:** 1 hour

**Description:** Implement the supporting sub-components: StatusCount, Skeleton, Error, and Empty states.

**Implementation Steps:**

1. **StatusCount Component:**
```typescript
function StatusCount({ icon: Icon, label, count, colorClass, highlight }: StatusCountProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 p-2 rounded-lg',
        highlight && count > 0 ? 'ring-1 ring-red-200' : ''
      )}
    >
      <div className={cn('p-1.5 rounded', colorClass.split(' ')[1])}>
        <Icon className={cn('w-4 h-4', colorClass.split(' ')[0])} aria-hidden="true" />
      </div>
      <div>
        <p className="text-lg font-semibold text-gray-900">{count}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
}
```

2. **TranslationStatusWidgetSkeleton Component:**
```typescript
function TranslationStatusWidgetSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('bg-white rounded-xl shadow-sm p-6 animate-pulse', className)}>
      {/* Header skeleton */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-9 h-9 bg-gray-200 rounded-lg" />
        <div className="h-5 w-32 bg-gray-200 rounded" />
      </div>
      {/* Progress bar skeleton */}
      <div className="h-2 w-full bg-gray-200 rounded-full mb-4" />
      {/* Status counts skeleton */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex items-center gap-2 p-2">
            <div className="w-8 h-8 bg-gray-200 rounded" />
            <div>
              <div className="h-5 w-8 bg-gray-200 rounded mb-1" />
              <div className="h-3 w-12 bg-gray-200 rounded" />
            </div>
          </div>
        ))}
      </div>
      {/* Button skeleton */}
      <div className="h-10 w-full bg-gray-200 rounded-lg" />
    </div>
  );
}
```

3. **TranslationStatusWidgetError Component:**
```typescript
function TranslationStatusWidgetError({
  error,
  onRetry,
  className
}: {
  error: string;
  onRetry: () => void;
  className?: string;
}) {
  return (
    <div className={cn('bg-white rounded-xl shadow-sm p-6 border-l-4 border-red-500', className)}>
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">Unable to load translation status</h3>
          <p className="text-sm text-gray-600 mt-1">{error}</p>
          <button
            onClick={onRetry}
            className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-700 focus:outline-none focus:underline"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}
```

4. **TranslationStatusWidgetEmpty Component:**
```typescript
function TranslationStatusWidgetEmpty({
  onViewDetails,
  className
}: {
  onViewDetails?: () => void;
  className?: string;
}) {
  return (
    <div className={cn('bg-white rounded-xl shadow-sm p-6', className)}>
      <div className="text-center py-4">
        <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
          <Globe className="w-6 h-6 text-gray-400" />
        </div>
        <h3 className="font-semibold text-gray-900">No translations yet</h3>
        <p className="text-sm text-gray-500 mt-1">
          Create content to start generating translations
        </p>
      </div>
    </div>
  );
}
```

**Acceptance Criteria:**
- [ ] StatusCount component renders with icon, label, count
- [ ] StatusCount applies highlight ring when highlight=true and count > 0
- [ ] Skeleton has animate-pulse animation
- [ ] Skeleton structure matches main component layout
- [ ] Error state shows error message with red left border
- [ ] Error state has clickable "Try again" button
- [ ] Empty state shows centered content with Globe icon
- [ ] Empty state has appropriate messaging

---

### Task 4: Create Index Export File

**File:** `/src/components/TranslationManagement/TranslationStatusWidget/index.ts`

**Effort:** 0.25 hours

**Description:** Create the barrel export file for the TranslationStatusWidget folder.

**Implementation:**

```typescript
// index.ts
// REQ-E05-013: TranslationStatusWidget public exports
// Created: 2026-01-20 18:30 UTC
// Last Modified: 2026-01-20 18:30 UTC

export { TranslationStatusWidget } from './TranslationStatusWidget';
export type {
  TranslationStatusWidgetProps,
  TranslationStatusSummary
} from './TranslationStatusWidget.types';
```

**Acceptance Criteria:**
- [ ] File created at correct path
- [ ] Exports TranslationStatusWidget component
- [ ] Exports type definitions for consumers
- [ ] No circular dependencies

---

### Task 5: Update TranslationManagement Barrel Export

**File:** `/src/components/TranslationManagement/index.ts`

**Effort:** 0.25 hours

**Description:** Add TranslationStatusWidget export to the main TranslationManagement index file.

**Implementation:**

If the file doesn't exist, create it:

```typescript
// index.ts
// REQ-E05-013: TranslationManagement public exports
// Created: 2026-01-20 18:30 UTC
// Last Modified: 2026-01-20 18:30 UTC

export * from './TranslationStatusWidget';
```

If the file exists, add the export:

```typescript
// Add to existing exports
export * from './TranslationStatusWidget';
```

**Acceptance Criteria:**
- [ ] TranslationStatusWidget is exported from main barrel file
- [ ] Import works: `import { TranslationStatusWidget } from '@/components/TranslationManagement'`

---

### Task 6: Integrate Widget into Dashboard Page

**File:** `/src/app/dashboard2/page.tsx`

**Effort:** 0.5 hours

**Description:** Import and render the TranslationStatusWidget in the dashboard layout.

**Implementation Steps:**

1. Add import at top of file:
```typescript
import { TranslationStatusWidget } from '@/components/TranslationManagement';
```

2. Locate the section after `ProgressiveStatisticsSection` or main stats cards.

3. Add the widget conditionally (consider feature flag):
```typescript
{/* Translation Status Widget - REQ-E05-013 */}
{selectedPropertyId && (
  <TranslationStatusWidget
    propertyId={selectedPropertyId}
    className="mt-6"
    onViewDetails={() => router.push('/dashboard2/translations')}
  />
)}
```

4. Ensure `router` is available (from `useRouter` hook if not already imported).

**Acceptance Criteria:**
- [ ] Widget imports successfully
- [ ] Widget renders in dashboard when propertyId is available
- [ ] Widget positioned appropriately in dashboard layout
- [ ] Navigation to /dashboard2/translations works
- [ ] No console errors on render
- [ ] Build passes with widget integration

---

### Task 7: Write Unit Tests

**File:** `/src/components/TranslationManagement/TranslationStatusWidget/__tests__/TranslationStatusWidget.test.tsx`

**Effort:** 1.5 hours

**Description:** Create comprehensive unit tests for the widget component.

**Test Cases:**

```typescript
// TranslationStatusWidget.test.tsx
// REQ-E05-013: Unit tests for Dashboard Translation Status Widget
// Created: 2026-01-20 18:30 UTC

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TranslationStatusWidget } from '../TranslationStatusWidget';

// Mock the hooks
jest.mock('@/hooks/useTranslationStatus', () => ({
  useTranslationStatus: jest.fn()
}));

jest.mock('@/hooks/useTranslationRealtime', () => ({
  useTranslationRealtime: jest.fn()
}));

describe('TranslationStatusWidget', () => {
  // Loading state tests
  describe('Loading State', () => {
    it('renders loading skeleton while fetching', () => {});
    it('skeleton has correct structure and animation', () => {});
  });

  // Error state tests
  describe('Error State', () => {
    it('renders error state with retry button when fetch fails', () => {});
    it('calls refresh when retry button is clicked', () => {});
    it('displays error message from hook', () => {});
  });

  // Empty state tests
  describe('Empty State', () => {
    it('renders empty state when no translations exist', () => {});
    it('renders empty state when total is 0', () => {});
  });

  // Success state tests
  describe('Success State', () => {
    it('displays correct status counts from data', () => {});
    it('calculates progress percentage correctly', () => {});
    it('applies green color to progress bar when >= 80%', () => {});
    it('applies orange color to progress bar when 40-79%', () => {});
    it('applies gray color to progress bar when < 40%', () => {});
    it('highlights failed count when > 0', () => {});
    it('does not highlight failed count when 0', () => {});
  });

  // Interaction tests
  describe('Interactions', () => {
    it('calls onViewDetails when link is clicked', () => {});
    it('navigates to /dashboard2/translations', () => {});
  });

  // Realtime tests
  describe('Realtime Updates', () => {
    it('refreshes data when realtime update received', () => {});
    it('subscribes to realtime channel with propertyId', () => {});
  });

  // Accessibility tests
  describe('Accessibility', () => {
    it('has proper ARIA attributes on progress bar', () => {});
    it('has role="region" on main container', () => {});
    it('has accessible label for View Details link', () => {});
  });
});
```

**Acceptance Criteria:**
- [ ] All test cases pass
- [ ] Tests cover loading, error, empty, and success states
- [ ] Tests cover progress bar color logic
- [ ] Tests verify accessibility attributes
- [ ] Tests mock hooks correctly
- [ ] No test warnings or errors

---

## File Changes Summary

### New Files to Create

| File Path | Task |
|-----------|------|
| `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.types.ts` | Task 1 |
| `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.tsx` | Tasks 2-3 |
| `/src/components/TranslationManagement/TranslationStatusWidget/index.ts` | Task 4 |
| `/src/components/TranslationManagement/TranslationStatusWidget/__tests__/TranslationStatusWidget.test.tsx` | Task 7 |

### Files to Modify

| File Path | Task | Change |
|-----------|------|--------|
| `/src/components/TranslationManagement/index.ts` | Task 5 | Add TranslationStatusWidget export |
| `/src/app/dashboard2/page.tsx` | Task 6 | Import and render widget |

---

## Implementation Order

Execute tasks in this order due to dependencies:

1. **Task 1:** Types file (no dependencies)
2. **Task 2:** Main component (depends on Task 1)
3. **Task 3:** Sub-components (part of Task 2)
4. **Task 4:** Widget index file (depends on Tasks 2-3)
5. **Task 5:** Update barrel export (depends on Task 4)
6. **Task 6:** Dashboard integration (depends on Task 5)
7. **Task 7:** Unit tests (can run in parallel with Task 6)

---

## Testing Scenarios

### Visual Testing

| Scenario | Expected Result |
|----------|-----------------|
| Loading state | Skeleton with pulse animation matches layout |
| 0% completion | Gray progress bar, zero counts |
| 50% completion | Orange progress bar, partial at midpoint |
| 100% completion | Green progress bar, all complete |
| Failed translations | Red highlight on failed count |
| Mobile viewport | Responsive grid layout |
| Hover state | Shadow increase on card, bg change on link |

### Integration Testing

| Scenario | Expected Result |
|----------|-----------------|
| Dashboard load with property selected | Widget fetches and displays data |
| Click "View Details" | Navigates to /dashboard2/translations |
| Translation completes in background | Widget updates via realtime |
| API error occurs | Error state with retry option |
| Retry after error | Attempts refresh, shows loading |

---

## Color Reference

| Status | Icon | Color | Tailwind Classes |
|--------|------|-------|------------------|
| Complete | CheckCircle | Green | `text-green-600 bg-green-50` |
| Partial | Edit | Amber | `text-amber-600 bg-amber-50` |
| Pending | Clock | Blue | `text-blue-600 bg-blue-50` |
| Failed | AlertCircle | Red | `text-red-600 bg-red-50` |

| Progress % | Color | Tailwind Class |
|------------|-------|----------------|
| 80-100% | Green | `bg-green-500` |
| 40-79% | Orange | `bg-amber-500` |
| 0-39% | Gray | `bg-gray-300` |

---

## Notes

1. **Hook Stubs:** If `useTranslationStatus` or `useTranslationRealtime` are not yet implemented, create temporary stub implementations that return mock data to unblock development.

2. **Feature Flag:** Consider wrapping the dashboard integration in a feature flag for staged rollout:
   ```typescript
   {tierConfig.features.translationManagement && selectedPropertyId && (
     <TranslationStatusWidget ... />
   )}
   ```

3. **Tooltip Enhancement:** The PRD mentions a tooltip explaining progress calculation. This can be added as a follow-up task using Radix UI Tooltip primitive.

4. **Dark Mode:** All Tailwind classes used support dark mode via `dark:` prefix when dark mode is implemented.

5. **Performance:** The widget should cache results to prevent redundant API calls. This is handled by the `useTranslationStatus` hook.

---

## References

- **Overview Document:** `/docs/REQ-E05-013-create-translationstatuswidget-component-overview.md`
- **Request:** REQ-E05-013 in `/docs/gen_requests_epic5.md`
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- **PRD:** `/docs/prd/PRD_L10N_Epic5_Owner_Translation_Management.md`
- **Existing Patterns:**
  - StatisticsCards: `/src/components/SimpleDashboard/StatisticsCards.tsx`
  - useDashboardStats: `/src/hooks/useDashboardStats.ts`
  - Utils (cn function): `/src/lib/utils.ts`

---

*Document generated for FAQBNB Localization Epic 5 - Owner Translation Management*
*Task 3.1: Create TranslationStatusWidget component*
