# REQ-350: Create TranslationStatusWidget Component - Implementation Overview

**Date Created:** 2026-01-19
**Last Modified:** 2026-01-19
**Request ID:** REQ-350
**Request Type:** NEW FEATURE
**Size:** M (Medium)
**Phase:** 3 - Dashboard Integration
**Task ID:** 3.1

---

## Summary

Create a dashboard summary widget component that displays overall translation status across all property owner content. The widget provides at-a-glance visibility into translation progress with a progress bar, status counts, and quick access to detailed translation management via a "View Details" link.

---

## Dependencies

### Epic Dependencies
| Dependency | Description | Status |
|------------|-------------|--------|
| Epic 1 (Foundation) | Translation tables, job queue, translation service | Required |
| Epic 3 (Dynamic Content Translation) | Translation trigger system, status tracking | Required |
| REQ-336 | Translation Status API endpoint (`/api/translations/status`) | Required (Phase 1) |
| REQ-315 | `useTranslationStatus` hook | Required (Phase 2) |

### Technical Dependencies
| Dependency | Location | Purpose |
|------------|----------|---------|
| Translation tables | `article_translations`, `item_translations`, `link_translations`, `tag_translations` | Data source for status counts |
| Translation Status API | `/src/app/api/translations/status/route.ts` | Fetches summary and item-level status |
| Existing Dashboard Components | `/src/components/SimpleDashboard/StatisticsCards.tsx` | Pattern reference for card styling |
| Tailwind CSS | Project-wide | Styling |
| Lucide React | `lucide-react` | Icons |
| Radix UI | `@radix-ui/react-*` | Accessible primitives (optional for progress bar) |

---

## Technical Context

### Existing Patterns to Follow

1. **Dashboard Widget Pattern** (from `StatisticsCards.tsx`):
   - White background with shadow: `bg-white rounded-xl shadow-sm`
   - Consistent padding: `p-6`
   - Loading skeleton with shimmer animation
   - Error state handling
   - Empty state handling

2. **Status Indicator Pattern** (from PRD):
   - Status colors: green (complete), orange (pending), red (failed), purple (manual)
   - Icons: `✓` (complete), `⏳` (pending), `❌` (failed), `✎` (manual)

3. **Hook Pattern** (from `useDashboardStats.ts`):
   - Loading/refreshing/error states
   - API request with property filtering
   - Stale data prevention

4. **Component Structure Pattern** (from `TagChip.tsx`, `EmptyStateCard.tsx`):
   - TypeScript interfaces for props
   - JSDoc documentation
   - Accessibility with ARIA labels
   - Keyboard navigation support

### Translation Status API Response (from Plan-111)

```typescript
interface TranslationStatusResponse {
  summary: {
    total: number;
    complete: number;
    partial: number;
    pending: number;
    failed: number;
  };
  items: TranslationStatusItem[];
}
```

---

## Implementation Tasks

### Task 1: Create Types File
**File:** `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.types.ts`
**Estimated Size:** ~50 lines

Create TypeScript interfaces for the widget:

```typescript
import { SupportedLanguage } from '@/lib/translation-service/translation-service.types';

export interface TranslationStatusSummary {
  total: number;
  complete: number;
  partial: number;
  pending: number;
  failed: number;
}

export interface TranslationStatusWidgetProps {
  /** Optional property ID to filter status */
  propertyId?: string;
  /** Callback when "View Details" is clicked */
  onViewDetails?: () => void;
  /** Additional CSS classes */
  className?: string;
}

export interface TranslationStatusWidgetState {
  summary: TranslationStatusSummary | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}
```

**Acceptance Criteria:**
- [ ] All prop types are clearly defined
- [ ] Interfaces match API response structure
- [ ] Optional props use `?` syntax
- [ ] JSDoc comments on key types

---

### Task 2: Create Index Export File
**File:** `/src/components/TranslationManagement/TranslationStatusWidget/index.ts`
**Estimated Size:** ~10 lines

```typescript
export { TranslationStatusWidget } from './TranslationStatusWidget';
export type {
  TranslationStatusWidgetProps,
  TranslationStatusSummary,
  TranslationStatusWidgetState,
} from './TranslationStatusWidget.types';
```

**Acceptance Criteria:**
- [ ] Exports component and types
- [ ] Uses named exports for tree-shaking

---

### Task 3: Create Widget Component
**File:** `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.tsx`
**Estimated Size:** ~250 lines

Implement the main widget component with:

1. **Header Section:**
   - Widget title "Translation Status"
   - Optional refresh button (icon)

2. **Progress Bar Section:**
   - Visual progress bar showing completion percentage
   - Percentage label (e.g., "75% Complete")
   - Tailwind gradient or solid color fill

3. **Status Counts Section:**
   - Four status count items in a grid:
     - Complete (green `✓` icon)
     - Partial (blue icon)
     - Pending (orange `⏳` icon)
     - Failed (red `❌` icon)
   - Each shows count and label

4. **Footer Section:**
   - "View Details" link/button
   - Navigates to `/dashboard2/translations`

5. **States:**
   - Loading skeleton (similar to StatisticsCards pattern)
   - Error state with retry option
   - Empty state when no content exists

**Component Structure:**
```tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Languages, RefreshCw, CheckCircle, Clock, AlertTriangle, XCircle, ChevronRight } from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { SkeletonBase } from '@/components/SimpleDashboard/skeletons';
import type { TranslationStatusWidgetProps, TranslationStatusSummary } from './TranslationStatusWidget.types';

export function TranslationStatusWidget({
  propertyId,
  onViewDetails,
  className = '',
}: TranslationStatusWidgetProps) {
  // Implementation here...
}
```

**Acceptance Criteria:**
- [ ] Widget renders as a dashboard card with consistent styling
- [ ] Progress bar shows overall translation completion percentage
- [ ] Progress bar calculation includes all content types (items, articles, links, tags)
- [ ] Widget displays count of complete translations
- [ ] Widget displays count of partial translations
- [ ] Widget displays count of pending translations
- [ ] Widget displays count of failed translations
- [ ] Each status count uses distinct visual styling with appropriate colors and icons
- [ ] Failed translation count uses warning/error color
- [ ] "View Details" link appears at the bottom with clear affordance
- [ ] Clicking "View Details" navigates to translation management page
- [ ] Widget handles loading state with skeleton
- [ ] Widget handles error state with retry button
- [ ] Widget handles empty state for owners with no content
- [ ] Widget automatically updates when translation status changes (via polling or realtime)
- [ ] Component is fully typed using TypeScript
- [ ] Component follows accessibility guidelines (ARIA labels)
- [ ] Widget is responsive on different screen sizes
- [ ] Widget integrates into existing dashboard layout without breaking other widgets

---

### Task 4: Add Loading Skeleton
**Within:** `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.tsx`

Create a loading skeleton component similar to `StatisticsCards`:

```tsx
function LoadingSkeleton() {
  return (
    <SkeletonBase label="Loading translation status">
      <div className="bg-white rounded-xl shadow-sm p-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 w-40 bg-gray-200 rounded" />
          <div className="h-8 w-8 bg-gray-200 rounded-full" />
        </div>
        {/* Progress bar skeleton */}
        <div className="mb-4">
          <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
          <div className="h-3 w-full bg-gray-200 rounded-full" />
        </div>
        {/* Status counts skeleton */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="h-8 w-8 bg-gray-200 rounded" />
              <div className="h-5 w-16 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
        {/* Footer skeleton */}
        <div className="h-5 w-24 bg-gray-200 rounded" />
      </div>
    </SkeletonBase>
  );
}
```

**Acceptance Criteria:**
- [ ] Skeleton shows during initial data fetch
- [ ] Accessible via SkeletonBase wrapper
- [ ] Visual structure matches loaded widget

---

### Task 5: Add Empty State
**Within:** `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.tsx`

Handle empty state when no translatable content exists:

```tsx
function EmptyState({ className }: { className?: string }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm p-6 ${className}`}>
      <div className="flex flex-col items-center text-center py-4">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
          <Languages className="w-6 h-6 text-gray-400" aria-hidden="true" />
        </div>
        <p className="text-sm text-gray-500">
          No content to translate yet
        </p>
      </div>
    </div>
  );
}
```

**Acceptance Criteria:**
- [ ] Shows when total content count is 0
- [ ] Friendly message with icon
- [ ] Matches widget styling

---

### Task 6: Add Error State
**Within:** `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.tsx`

Handle API error state:

```tsx
function ErrorState({
  error,
  onRetry,
  className,
}: {
  error: string;
  onRetry: () => void;
  className?: string;
}) {
  return (
    <div className={`bg-white rounded-xl shadow-sm p-6 ${className}`}>
      <div className="flex flex-col items-center text-center py-4">
        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-3">
          <AlertTriangle className="w-6 h-6 text-red-500" aria-hidden="true" />
        </div>
        <p className="text-sm text-gray-700 mb-3">Unable to load translation status</p>
        <button
          onClick={onRetry}
          className="text-sm text-[#FF385C] hover:underline focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:ring-offset-2 rounded"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
```

**Acceptance Criteria:**
- [ ] Shows when API request fails
- [ ] Displays retry button
- [ ] User-friendly error message

---

### Task 7: Create Progress Bar Sub-component
**Within:** `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.tsx`

Create a reusable progress bar:

```tsx
interface ProgressBarProps {
  percentage: number;
  className?: string;
}

function ProgressBar({ percentage, className }: ProgressBarProps) {
  // Ensure percentage is between 0 and 100
  const safePercentage = Math.min(100, Math.max(0, percentage));

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">
          Translation Progress
        </span>
        <span className="text-sm font-medium text-gray-700">
          {Math.round(safePercentage)}%
        </span>
      </div>
      <div
        className="w-full h-2 bg-gray-200 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={safePercentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Translation ${Math.round(safePercentage)}% complete`}
      >
        <div
          className="h-full bg-gradient-to-r from-[#00A699] to-[#00C9B9] rounded-full transition-all duration-500 ease-out"
          style={{ width: `${safePercentage}%` }}
        />
      </div>
    </div>
  );
}
```

**Acceptance Criteria:**
- [ ] Shows percentage visually and numerically
- [ ] Uses Airbnb teal gradient (`#00A699`)
- [ ] Accessible with ARIA attributes
- [ ] Smooth width transition animation

---

### Task 8: Create Status Count Item Sub-component
**Within:** `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.tsx`

```tsx
interface StatusCountItemProps {
  label: string;
  count: number;
  icon: React.ReactNode;
  color: 'green' | 'orange' | 'red' | 'blue';
}

function StatusCountItem({ label, count, icon, color }: StatusCountItemProps) {
  const colorStyles = {
    green: 'bg-green-50 text-green-600',
    orange: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
    blue: 'bg-blue-50 text-blue-600',
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorStyles[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-lg font-semibold text-gray-900">{count}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
}
```

**Acceptance Criteria:**
- [ ] Shows icon with colored background
- [ ] Displays count prominently
- [ ] Displays label below count
- [ ] Uses distinct colors per status

---

### Task 9: Integrate API Call with useTranslationStatus Hook (or inline)
**Within:** `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.tsx`

If `useTranslationStatus` hook exists (REQ-315), use it. Otherwise, implement inline:

```tsx
const [state, setState] = useState<TranslationStatusWidgetState>({
  summary: null,
  isLoading: true,
  error: null,
  lastUpdated: null,
});

const fetchStatus = useCallback(async () => {
  setState(prev => ({ ...prev, isLoading: true, error: null }));

  try {
    const endpoint = propertyId
      ? `/translations/status?propertyId=${encodeURIComponent(propertyId)}`
      : '/translations/status';

    const response = await apiRequest<{ success: boolean; data?: { summary: TranslationStatusSummary } }>(
      endpoint,
      {},
      true
    );

    if (response.success && response.data) {
      setState({
        summary: response.data.summary,
        isLoading: false,
        error: null,
        lastUpdated: new Date(),
      });
    } else {
      throw new Error('Failed to load translation status');
    }
  } catch (error) {
    setState(prev => ({
      ...prev,
      isLoading: false,
      error: error instanceof Error ? error.message : 'An error occurred',
    }));
  }
}, [propertyId]);

useEffect(() => {
  fetchStatus();
}, [fetchStatus]);
```

**Acceptance Criteria:**
- [ ] Fetches data on mount
- [ ] Re-fetches when propertyId changes
- [ ] Handles API errors gracefully
- [ ] Supports manual refresh

---

### Task 10: Add Widget to TranslationManagement Index
**File:** `/src/components/TranslationManagement/index.ts` (create if doesn't exist)
**Estimated Size:** ~15 lines

```typescript
// TranslationManagement module exports
// Part of Epic 5: Owner Translation Management

export {
  TranslationStatusWidget,
  type TranslationStatusWidgetProps,
  type TranslationStatusSummary,
} from './TranslationStatusWidget';

// Future exports for other components:
// export { TranslationPreviewPanel } from './TranslationPreviewPanel';
// export { TranslationEditor } from './TranslationEditor';
// export { TranslationStatusColumn } from './TranslationStatusColumn';
// export { TranslationStatusFilter } from './TranslationStatusFilter';
```

**Acceptance Criteria:**
- [ ] Module index file exports widget
- [ ] Prepared for future component exports

---

## Authorized Files and Functions for Modification

### New Files to Create
| File Path | Purpose |
|-----------|---------|
| `/src/components/TranslationManagement/index.ts` | Module exports |
| `/src/components/TranslationManagement/TranslationStatusWidget/index.ts` | Widget exports |
| `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.tsx` | Main widget component |
| `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.types.ts` | Type definitions |

### Existing Files to Modify (Future Task - REQ-319)
| File Path | Modification |
|-----------|--------------|
| `/src/app/dashboard2/page.tsx` | Import and render TranslationStatusWidget (separate task REQ-319) |
| `/src/types/index.ts` | Export TranslationStatusWidget types (if needed) |

---

## UI Specifications

### Visual Layout
```
┌─────────────────────────────────────────────────────────────┐
│ 🌐 Translation Status                            [↻ Refresh] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Translation Progress                                   75%  │
│ ████████████████████████████████░░░░░░░░░░░                │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐                         │
│  │ ✓  45        │  │ ◐  12        │                         │
│  │    Complete  │  │    Partial   │                         │
│  └──────────────┘  └──────────────┘                         │
│  ┌──────────────┐  ┌──────────────┐                         │
│  │ ⏳  8        │  │ ❌  3        │                         │
│  │    Pending   │  │    Failed    │                         │
│  └──────────────┘  └──────────────┘                         │
├─────────────────────────────────────────────────────────────┤
│                              View Details →                  │
└─────────────────────────────────────────────────────────────┘
```

### Color Palette (from PRD)
| Status | Color | Tailwind Class |
|--------|-------|----------------|
| Complete | Green | `text-green-500`, `bg-green-50` |
| Partial | Blue | `text-blue-500`, `bg-blue-50` |
| Pending | Orange/Amber | `text-amber-500`, `bg-amber-50` |
| Failed | Red | `text-red-500`, `bg-red-50` |
| Progress Bar | Teal | `bg-[#00A699]` (Airbnb teal) |

### Icon Mapping
| Status | Lucide Icon |
|--------|-------------|
| Complete | `CheckCircle` |
| Partial | `Circle` or custom half-filled |
| Pending | `Clock` |
| Failed | `XCircle` or `AlertTriangle` |
| Header | `Languages` or `Globe` |
| Refresh | `RefreshCw` |
| View Details | `ChevronRight` |

---

## Testing Requirements

### Unit Tests (Future - REQ-335)
- [ ] Component renders with translation status data
- [ ] Progress bar fills proportionally to completion ratio
- [ ] Status counts display correctly
- [ ] View details link navigates to translation management page
- [ ] Loading state renders skeleton
- [ ] Error state renders retry button
- [ ] Empty state renders when no content

### Integration Tests
- [ ] Widget integrates into dashboard without layout issues
- [ ] API calls work with authentication
- [ ] Property filtering works correctly

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Translation Status API not ready | High | High | Create mock data fallback, coordinate with Phase 1 |
| useTranslationStatus hook not ready | Medium | Medium | Implement inline fetch logic as fallback |
| Progress calculation edge cases | Low | Low | Handle division by zero, clamp percentage 0-100 |
| Performance with many translations | Low | Medium | Efficient API query, no over-fetching |

---

## References

- **PRD:** `/docs/prd/PRD_L10N_Epic5_Owner_Translation_Management.md`
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- **Request Definition:** `/docs/gen_requests_epic5.md` (REQ-350)
- **Pattern Reference:** `/src/components/SimpleDashboard/StatisticsCards.tsx`
- **Types Reference:** `/src/lib/translation-service/translation-service.types.ts`

---

## Acceptance Criteria Checklist

From REQ-350:
- [ ] Component file is created at `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.tsx`
- [ ] Widget renders as a dashboard card with consistent styling matching other dashboard widgets
- [ ] Widget displays a progress bar showing overall translation completion percentage across all owner content
- [ ] Progress bar calculation includes all content types: items, articles, links, and tags
- [ ] Widget displays count of content pieces with complete translations in all supported languages
- [ ] Widget displays count of content pieces with partial translations in some but not all languages
- [ ] Widget displays count of content pieces with pending translations currently processing
- [ ] Widget displays count of content pieces with failed translations requiring owner attention
- [ ] Each status count uses distinct visual styling with appropriate colors and icons
- [ ] Failed translation count uses warning or error color to draw attention to issues
- [ ] "View Details" link appears at the bottom of the widget with clear affordance
- [ ] Clicking "View Details" navigates to the translation management page with appropriate filters or context
- [ ] Widget handles loading state appropriately while fetching translation statistics
- [ ] Widget handles error state appropriately if translation statistics cannot be loaded
- [ ] Widget handles empty state appropriately for owners with no content yet
- [ ] Widget automatically updates when translation status changes through real-time subscriptions or periodic refresh
- [ ] Component is fully typed using TypeScript interfaces for all props and data structures
- [ ] Component follows project styling conventions and accessibility guidelines
- [ ] Widget is responsive and maintains usability on different screen sizes
- [ ] Widget integrates successfully into the existing dashboard layout without breaking other widgets
