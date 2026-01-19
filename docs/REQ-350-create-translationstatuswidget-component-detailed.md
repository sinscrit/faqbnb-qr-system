# REQ-350: Create TranslationStatusWidget Component - Detailed Task Breakdown

**Date Created:** 2026-01-19
**Last Modified:** 2026-01-19
**Request ID:** REQ-350
**Request Type:** NEW FEATURE
**Size:** M (Medium)
**Phase:** 3 - Dashboard Integration
**Task ID:** 3.1
**Epic:** Epic 5 - Owner Translation Management

---

## Document Purpose

This document provides a granular, actionable task breakdown for implementing the TranslationStatusWidget component. Each task is designed to be approximately 1 story point and can be executed independently by an AI coding agent or junior developer.

---

## Prerequisites

Before starting implementation, verify the following dependencies are available:

| Dependency | Status Check | Fallback Strategy |
|------------|--------------|-------------------|
| Translation Status API (`/api/translations/status`) | Check if `src/app/api/translations/status/route.ts` exists | Create mock data fallback |
| `useTranslationStatus` hook | Check if `src/hooks/useTranslationStatus.ts` exists | Implement inline fetch logic |
| Translation tables exist | Verify via Supabase MCP | Document as blocked |
| `SkeletonBase` component | Import from `@/components/SimpleDashboard/skeletons` | Available |
| `apiRequest` utility | Import from `@/lib/api` | Available |

---

## Task Breakdown

### Task 1: Create Directory Structure and Types File

**File:** `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.types.ts`
**Estimated Lines:** ~60
**Story Points:** 1

**Description:**
Create the TypeScript types file defining all interfaces for the TranslationStatusWidget component.

**Implementation Steps:**

1. Create directory structure:
   ```
   /src/components/TranslationManagement/
   └── TranslationStatusWidget/
       └── TranslationStatusWidget.types.ts
   ```

2. Define the following interfaces:

```typescript
// src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.types.ts
// REQ-350: TranslationStatusWidget Type Definitions
// Created: 2026-01-19
// Last Modified: 2026-01-19

/**
 * Summary of translation status counts across all content
 */
export interface TranslationStatusSummary {
  /** Total number of translatable content pieces */
  total: number;
  /** Content with complete translations in all languages */
  complete: number;
  /** Content with translations in some but not all languages */
  partial: number;
  /** Content with translations currently processing */
  pending: number;
  /** Content with failed translations requiring attention */
  failed: number;
}

/**
 * Props for the TranslationStatusWidget component
 */
export interface TranslationStatusWidgetProps {
  /** Optional property ID to filter translation status */
  propertyId?: string;
  /** Callback when "View Details" is clicked */
  onViewDetails?: () => void;
  /** Additional CSS classes for the widget container */
  className?: string;
}

/**
 * Internal state for the TranslationStatusWidget
 */
export interface TranslationStatusWidgetState {
  /** Translation summary data from API */
  summary: TranslationStatusSummary | null;
  /** Whether initial data is loading */
  isLoading: boolean;
  /** Whether data is being refreshed */
  isRefreshing: boolean;
  /** Error message if API call failed */
  error: string | null;
  /** Timestamp of last successful data fetch */
  lastUpdated: Date | null;
}

/**
 * API response structure for translation status endpoint
 */
export interface TranslationStatusApiResponse {
  success: boolean;
  data?: {
    summary: TranslationStatusSummary;
  };
  error?: string;
}
```

**Acceptance Criteria:**
- [ ] File created at correct path
- [ ] `TranslationStatusSummary` interface defined with `total`, `complete`, `partial`, `pending`, `failed`
- [ ] `TranslationStatusWidgetProps` interface defined with optional `propertyId`, `onViewDetails`, `className`
- [ ] `TranslationStatusWidgetState` interface defined for internal state management
- [ ] `TranslationStatusApiResponse` interface defined matching expected API response
- [ ] All interfaces have JSDoc comments explaining their purpose
- [ ] File includes header comment with REQ-350, creation date, and last modified date

---

### Task 2: Create Index Export File for Widget

**File:** `/src/components/TranslationManagement/TranslationStatusWidget/index.ts`
**Estimated Lines:** ~15
**Story Points:** 0.5

**Description:**
Create the barrel export file for the TranslationStatusWidget module.

**Implementation Steps:**

```typescript
// src/components/TranslationManagement/TranslationStatusWidget/index.ts
// REQ-350: TranslationStatusWidget Module Exports
// Created: 2026-01-19
// Last Modified: 2026-01-19

export { TranslationStatusWidget } from './TranslationStatusWidget';
export type {
  TranslationStatusWidgetProps,
  TranslationStatusSummary,
  TranslationStatusWidgetState,
  TranslationStatusApiResponse,
} from './TranslationStatusWidget.types';
```

**Acceptance Criteria:**
- [ ] File created at correct path
- [ ] Exports `TranslationStatusWidget` component (named export)
- [ ] Exports all type definitions with `type` keyword for tree-shaking
- [ ] File includes header comment with REQ-350, creation date

---

### Task 3: Create TranslationManagement Module Index

**File:** `/src/components/TranslationManagement/index.ts`
**Estimated Lines:** ~25
**Story Points:** 0.5

**Description:**
Create the module-level barrel export file for the TranslationManagement component family.

**Implementation Steps:**

```typescript
// src/components/TranslationManagement/index.ts
// Epic 5: Owner Translation Management - Module Exports
// REQ-350: Initial module setup with TranslationStatusWidget
// Created: 2026-01-19
// Last Modified: 2026-01-19

// TranslationStatusWidget - Dashboard summary widget
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
// export { BulkTranslationBar } from './BulkTranslationBar';
```

**Acceptance Criteria:**
- [ ] File created at correct path
- [ ] Exports TranslationStatusWidget and types from Task 1-2
- [ ] Includes commented placeholders for future Epic 5 components
- [ ] File includes header comment with Epic 5 reference

---

### Task 4: Create ProgressBar Sub-component

**File:** `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.tsx` (partial)
**Estimated Lines:** ~40
**Story Points:** 1

**Description:**
Create the ProgressBar sub-component that displays overall translation completion percentage.

**Implementation Steps:**

Create this as a local sub-component within the main widget file:

```typescript
/**
 * Props for the internal ProgressBar component
 */
interface ProgressBarProps {
  /** Completion percentage (0-100) */
  percentage: number;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Visual progress bar showing translation completion
 * Uses Airbnb teal gradient for the fill
 */
function ProgressBar({ percentage, className }: ProgressBarProps) {
  // Clamp percentage between 0 and 100
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
- [ ] ProgressBar component defined with `percentage` and optional `className` props
- [ ] Percentage value clamped between 0 and 100
- [ ] Progress bar uses Airbnb teal gradient (`#00A699` to `#00C9B9`)
- [ ] ARIA attributes present: `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, `aria-label`
- [ ] Smooth transition animation on width change (`transition-all duration-500 ease-out`)
- [ ] Percentage displayed numerically with "%" suffix
- [ ] Label "Translation Progress" displayed

---

### Task 5: Create StatusCountItem Sub-component

**File:** `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.tsx` (partial)
**Estimated Lines:** ~50
**Story Points:** 1

**Description:**
Create the StatusCountItem sub-component that displays a single status count with icon and label.

**Implementation Steps:**

```typescript
/**
 * Color variants for status count items
 */
type StatusCountColor = 'green' | 'blue' | 'orange' | 'red';

/**
 * Props for the internal StatusCountItem component
 */
interface StatusCountItemProps {
  /** Display label (e.g., "Complete", "Pending") */
  label: string;
  /** Numeric count to display */
  count: number;
  /** React node for the icon */
  icon: React.ReactNode;
  /** Color variant for styling */
  color: StatusCountColor;
}

/**
 * Color style mappings for each status
 */
const statusColorStyles: Record<StatusCountColor, string> = {
  green: 'bg-green-50 text-green-600',
  blue: 'bg-blue-50 text-blue-600',
  orange: 'bg-amber-50 text-amber-600',
  red: 'bg-red-50 text-red-600',
};

/**
 * Individual status count item with icon and label
 */
function StatusCountItem({ label, count, icon, color }: StatusCountItemProps) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center ${statusColorStyles[color]}`}
        aria-hidden="true"
      >
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
- [ ] StatusCountItem component defined with `label`, `count`, `icon`, `color` props
- [ ] Four color variants supported: green, blue, orange, red
- [ ] Icon container uses rounded-lg with colored background
- [ ] Count displayed prominently with `text-lg font-semibold`
- [ ] Label displayed below count with `text-xs text-gray-500`
- [ ] Icon container marked `aria-hidden="true"` since it's decorative

---

### Task 6: Create LoadingSkeleton Sub-component

**File:** `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.tsx` (partial)
**Estimated Lines:** ~45
**Story Points:** 1

**Description:**
Create the LoadingSkeleton sub-component that displays while data is being fetched.

**Implementation Steps:**

```typescript
import { SkeletonBase } from '@/components/SimpleDashboard/skeletons';

/**
 * Loading skeleton matching the widget layout
 * Uses SkeletonBase for accessibility
 */
function LoadingSkeleton({ className }: { className?: string }) {
  return (
    <SkeletonBase label="Loading translation status">
      <div className={`bg-white rounded-xl shadow-sm p-6 ${className || ''}`}>
        {/* Header skeleton */}
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 w-40 bg-gray-200 rounded animate-pulse" />
          <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
        </div>
        {/* Progress bar skeleton */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-10 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="h-2 w-full bg-gray-200 rounded-full animate-pulse" />
        </div>
        {/* Status counts skeleton - 2x2 grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="h-8 w-8 bg-gray-200 rounded-lg animate-pulse" />
              <div>
                <div className="h-5 w-8 bg-gray-200 rounded animate-pulse mb-1" />
                <div className="h-3 w-14 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
        {/* Footer skeleton */}
        <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
      </div>
    </SkeletonBase>
  );
}
```

**Acceptance Criteria:**
- [ ] LoadingSkeleton wrapped in `SkeletonBase` for accessibility
- [ ] Skeleton structure matches loaded widget layout
- [ ] Uses `animate-pulse` class for shimmer effect
- [ ] Header area skeleton included
- [ ] Progress bar area skeleton included
- [ ] 2x2 grid of status count skeletons included
- [ ] Footer area skeleton included
- [ ] Accepts optional `className` prop

---

### Task 7: Create EmptyState Sub-component

**File:** `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.tsx` (partial)
**Estimated Lines:** ~25
**Story Points:** 0.5

**Description:**
Create the EmptyState sub-component shown when owner has no translatable content.

**Implementation Steps:**

```typescript
import { Languages } from 'lucide-react';

/**
 * Empty state shown when no translatable content exists
 */
function EmptyState({ className }: { className?: string }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm p-6 ${className || ''}`}>
      <div className="flex flex-col items-center text-center py-4">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
          <Languages className="w-6 h-6 text-gray-400" aria-hidden="true" />
        </div>
        <p className="text-sm text-gray-500">
          No content to translate yet
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Create items or articles to see translation status
        </p>
      </div>
    </div>
  );
}
```

**Acceptance Criteria:**
- [ ] EmptyState displays Languages icon from lucide-react
- [ ] Primary message "No content to translate yet" displayed
- [ ] Secondary help text explaining what to do
- [ ] Styling matches widget card style (white bg, rounded-xl, shadow-sm)
- [ ] Accepts optional `className` prop

---

### Task 8: Create ErrorState Sub-component

**File:** `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.tsx` (partial)
**Estimated Lines:** ~35
**Story Points:** 0.5

**Description:**
Create the ErrorState sub-component shown when API request fails.

**Implementation Steps:**

```typescript
import { AlertTriangle } from 'lucide-react';

/**
 * Props for error state component
 */
interface ErrorStateProps {
  /** Error message to display */
  error: string;
  /** Callback when retry button is clicked */
  onRetry: () => void;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Error state with retry button
 */
function ErrorState({ error, onRetry, className }: ErrorStateProps) {
  return (
    <div className={`bg-white rounded-xl shadow-sm p-6 ${className || ''}`}>
      <div className="flex flex-col items-center text-center py-4">
        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-3">
          <AlertTriangle className="w-6 h-6 text-red-500" aria-hidden="true" />
        </div>
        <p className="text-sm text-gray-700 mb-3">
          Unable to load translation status
        </p>
        <button
          onClick={onRetry}
          className="text-sm text-[#FF385C] hover:underline focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:ring-offset-2 rounded px-2 py-1"
          aria-label="Retry loading translation status"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
```

**Acceptance Criteria:**
- [ ] ErrorState displays AlertTriangle icon from lucide-react
- [ ] Error message "Unable to load translation status" displayed
- [ ] "Try again" retry button displayed with Airbnb pink color (`#FF385C`)
- [ ] Retry button calls `onRetry` callback when clicked
- [ ] Focus styles present on retry button
- [ ] ARIA label on retry button for accessibility
- [ ] Styling matches widget card style

---

### Task 9: Implement Main Widget Component Structure

**File:** `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.tsx`
**Estimated Lines:** ~100
**Story Points:** 2

**Description:**
Create the main TranslationStatusWidget component with all state management and rendering logic.

**Implementation Steps:**

```typescript
// src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.tsx
// REQ-350: TranslationStatusWidget - Dashboard Summary Component
// Created: 2026-01-19
// Last Modified: 2026-01-19

'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Languages,
  RefreshCw,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { SkeletonBase } from '@/components/SimpleDashboard/skeletons';
import type {
  TranslationStatusWidgetProps,
  TranslationStatusWidgetState,
  TranslationStatusSummary,
  TranslationStatusApiResponse,
} from './TranslationStatusWidget.types';

// ... Sub-components from Tasks 4-8 go here ...

/**
 * TranslationStatusWidget - Dashboard summary widget showing overall translation status
 *
 * Features:
 * - Progress bar showing completion percentage
 * - Counts by status: complete, partial, pending, failed
 * - "View Details" link to translation management page
 * - Loading, error, and empty states
 * - Manual refresh capability
 *
 * @example
 * ```tsx
 * <TranslationStatusWidget
 *   propertyId={selectedPropertyId}
 *   onViewDetails={() => router.push('/dashboard2/translations')}
 * />
 * ```
 */
export function TranslationStatusWidget({
  propertyId,
  onViewDetails,
  className = '',
}: TranslationStatusWidgetProps) {
  const [state, setState] = useState<TranslationStatusWidgetState>({
    summary: null,
    isLoading: true,
    isRefreshing: false,
    error: null,
    lastUpdated: null,
  });

  // Fetch translation status from API
  const fetchStatus = useCallback(async (isRefresh: boolean = false) => {
    setState((prev) => ({
      ...prev,
      isLoading: !isRefresh,
      isRefreshing: isRefresh,
      error: null,
    }));

    try {
      const endpoint = propertyId
        ? `/translations/status?propertyId=${encodeURIComponent(propertyId)}`
        : '/translations/status';

      const response = await apiRequest<TranslationStatusApiResponse>(
        endpoint,
        {},
        true
      );

      if (response.success && response.data) {
        setState({
          summary: response.data.summary,
          isLoading: false,
          isRefreshing: false,
          error: null,
          lastUpdated: new Date(),
        });
      } else {
        throw new Error(response.error || 'Failed to load translation status');
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unexpected error occurred';

      setState((prev) => ({
        ...prev,
        isLoading: false,
        isRefreshing: false,
        error: errorMessage,
      }));
    }
  }, [propertyId]);

  // Handle manual refresh
  const handleRefresh = useCallback(() => {
    if (!state.isRefreshing) {
      fetchStatus(true);
    }
  }, [fetchStatus, state.isRefreshing]);

  // Fetch on mount and when propertyId changes
  useEffect(() => {
    let isStale = false;

    const doFetch = async () => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const endpoint = propertyId
          ? `/translations/status?propertyId=${encodeURIComponent(propertyId)}`
          : '/translations/status';

        const response = await apiRequest<TranslationStatusApiResponse>(
          endpoint,
          {},
          true
        );

        if (isStale) return;

        if (response.success && response.data) {
          setState({
            summary: response.data.summary,
            isLoading: false,
            isRefreshing: false,
            error: null,
            lastUpdated: new Date(),
          });
        } else {
          throw new Error(response.error || 'Failed to load translation status');
        }
      } catch (error) {
        if (isStale) return;

        const errorMessage =
          error instanceof Error ? error.message : 'An unexpected error occurred';

        setState((prev) => ({
          ...prev,
          isLoading: false,
          isRefreshing: false,
          error: errorMessage,
        }));
      }
    };

    doFetch();

    return () => {
      isStale = true;
    };
  }, [propertyId]);

  // Calculate completion percentage
  const completionPercentage = state.summary
    ? state.summary.total > 0
      ? (state.summary.complete / state.summary.total) * 100
      : 0
    : 0;

  // Show loading skeleton
  if (state.isLoading) {
    return <LoadingSkeleton className={className} />;
  }

  // Show error state
  if (state.error) {
    return (
      <ErrorState
        error={state.error}
        onRetry={handleRefresh}
        className={className}
      />
    );
  }

  // Show empty state
  if (!state.summary || state.summary.total === 0) {
    return <EmptyState className={className} />;
  }

  const { summary } = state;

  return (
    <div className={`bg-white rounded-xl shadow-sm p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Languages className="w-5 h-5 text-gray-600" aria-hidden="true" />
          <h3 className="text-base font-semibold text-gray-900">
            Translation Status
          </h3>
        </div>
        <button
          onClick={handleRefresh}
          disabled={state.isRefreshing}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:ring-offset-2 disabled:opacity-50"
          aria-label="Refresh translation status"
        >
          <RefreshCw
            className={`w-4 h-4 text-gray-500 ${state.isRefreshing ? 'animate-spin' : ''}`}
            aria-hidden="true"
          />
        </button>
      </div>

      {/* Progress Bar */}
      <ProgressBar percentage={completionPercentage} className="mb-4" />

      {/* Status Counts Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <StatusCountItem
          label="Complete"
          count={summary.complete}
          icon={<CheckCircle className="w-4 h-4" />}
          color="green"
        />
        <StatusCountItem
          label="Partial"
          count={summary.partial}
          icon={<AlertCircle className="w-4 h-4" />}
          color="blue"
        />
        <StatusCountItem
          label="Pending"
          count={summary.pending}
          icon={<Clock className="w-4 h-4" />}
          color="orange"
        />
        <StatusCountItem
          label="Failed"
          count={summary.failed}
          icon={<XCircle className="w-4 h-4" />}
          color="red"
        />
      </div>

      {/* Footer - View Details Link */}
      {onViewDetails ? (
        <button
          onClick={onViewDetails}
          className="flex items-center gap-1 text-sm text-[#FF385C] hover:underline focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:ring-offset-2 rounded"
        >
          View Details
          <ChevronRight className="w-4 h-4" aria-hidden="true" />
        </button>
      ) : (
        <Link
          href="/dashboard2/translations"
          className="flex items-center gap-1 text-sm text-[#FF385C] hover:underline focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:ring-offset-2 rounded"
        >
          View Details
          <ChevronRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}
```

**Acceptance Criteria:**
- [ ] Component is a client component (`'use client'` directive)
- [ ] Component accepts `propertyId`, `onViewDetails`, `className` props
- [ ] State managed with useState hook containing summary, isLoading, isRefreshing, error, lastUpdated
- [ ] API fetch using `apiRequest` from `@/lib/api`
- [ ] Fetch triggered on mount and when `propertyId` changes
- [ ] Stale closure prevention implemented in useEffect
- [ ] Completion percentage calculated as `(complete / total) * 100`
- [ ] Renders LoadingSkeleton when `isLoading` is true
- [ ] Renders ErrorState when `error` is not null
- [ ] Renders EmptyState when summary is null or total is 0
- [ ] Header displays Languages icon and "Translation Status" title
- [ ] Refresh button with RefreshCw icon that spins when refreshing
- [ ] ProgressBar displays completion percentage
- [ ] 2x2 grid displays Complete (green), Partial (blue), Pending (orange), Failed (red) counts
- [ ] Footer displays "View Details" link with ChevronRight icon
- [ ] Uses `onViewDetails` callback if provided, otherwise Link to `/dashboard2/translations`
- [ ] All interactive elements have focus styles with `#FF385C` ring
- [ ] File includes header comment with REQ-350, creation date, last modified date

---

### Task 10: Add Mock Data Fallback (Optional)

**File:** `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.tsx` (modification)
**Estimated Lines:** ~30
**Story Points:** 0.5

**Description:**
Add mock data fallback for development when Translation Status API is not yet available.

**Implementation Steps:**

Add this above the main component:

```typescript
/**
 * Mock data for development/testing when API is unavailable
 * Remove or disable once REQ-336 (Translation Status API) is complete
 */
const MOCK_TRANSLATION_STATUS: TranslationStatusSummary = {
  total: 68,
  complete: 45,
  partial: 12,
  pending: 8,
  failed: 3,
};

const USE_MOCK_DATA = process.env.NODE_ENV === 'development' && false; // Set to true to use mock data
```

Modify the fetch logic to optionally use mock data:

```typescript
// In the useEffect fetch logic:
if (USE_MOCK_DATA) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  if (isStale) return;

  setState({
    summary: MOCK_TRANSLATION_STATUS,
    isLoading: false,
    isRefreshing: false,
    error: null,
    lastUpdated: new Date(),
  });
  return;
}
// ... rest of actual API call
```

**Acceptance Criteria:**
- [ ] Mock data constant defined with realistic values
- [ ] `USE_MOCK_DATA` flag controls whether mock data is used
- [ ] Mock data only available in development environment
- [ ] Mock data includes simulated API delay (500ms)
- [ ] Easy to enable/disable via boolean flag

---

### Task 11: Write Unit Test File Structure

**File:** `/src/components/TranslationManagement/TranslationStatusWidget/__tests__/TranslationStatusWidget.test.tsx`
**Estimated Lines:** ~150
**Story Points:** 2

**Description:**
Create unit tests for the TranslationStatusWidget component.

**Implementation Steps:**

```typescript
// src/components/TranslationManagement/TranslationStatusWidget/__tests__/TranslationStatusWidget.test.tsx
// REQ-350: TranslationStatusWidget Unit Tests
// Created: 2026-01-19
// Last Modified: 2026-01-19

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TranslationStatusWidget } from '../TranslationStatusWidget';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock apiRequest
vi.mock('@/lib/api', () => ({
  apiRequest: vi.fn(),
}));

import { apiRequest } from '@/lib/api';

const mockApiRequest = vi.mocked(apiRequest);

describe('TranslationStatusWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading State', () => {
    it('renders loading skeleton while fetching data', () => {
      mockApiRequest.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<TranslationStatusWidget />);

      expect(screen.getByLabelText('Loading translation status')).toBeInTheDocument();
    });
  });

  describe('Loaded State', () => {
    const mockSummary = {
      total: 68,
      complete: 45,
      partial: 12,
      pending: 8,
      failed: 3,
    };

    beforeEach(() => {
      mockApiRequest.mockResolvedValue({
        success: true,
        data: { summary: mockSummary },
      });
    });

    it('renders translation status widget with correct counts', async () => {
      render(<TranslationStatusWidget />);

      await waitFor(() => {
        expect(screen.getByText('Translation Status')).toBeInTheDocument();
      });

      expect(screen.getByText('45')).toBeInTheDocument(); // Complete
      expect(screen.getByText('12')).toBeInTheDocument(); // Partial
      expect(screen.getByText('8')).toBeInTheDocument(); // Pending
      expect(screen.getByText('3')).toBeInTheDocument(); // Failed
    });

    it('renders progress bar with correct percentage', async () => {
      render(<TranslationStatusWidget />);

      await waitFor(() => {
        // 45/68 = ~66%
        expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '66');
      });
    });

    it('renders View Details link', async () => {
      render(<TranslationStatusWidget />);

      await waitFor(() => {
        expect(screen.getByText('View Details')).toBeInTheDocument();
      });

      const link = screen.getByRole('link', { name: /view details/i });
      expect(link).toHaveAttribute('href', '/dashboard2/translations');
    });

    it('calls onViewDetails callback when provided', async () => {
      const onViewDetails = vi.fn();
      render(<TranslationStatusWidget onViewDetails={onViewDetails} />);

      await waitFor(() => {
        expect(screen.getByText('View Details')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('View Details'));
      expect(onViewDetails).toHaveBeenCalledTimes(1);
    });

    it('refreshes data when refresh button is clicked', async () => {
      render(<TranslationStatusWidget />);

      await waitFor(() => {
        expect(screen.getByText('Translation Status')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByLabelText('Refresh translation status'));

      await waitFor(() => {
        expect(mockApiRequest).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Error State', () => {
    it('renders error state when API fails', async () => {
      mockApiRequest.mockRejectedValue(new Error('Network error'));

      render(<TranslationStatusWidget />);

      await waitFor(() => {
        expect(screen.getByText('Unable to load translation status')).toBeInTheDocument();
      });

      expect(screen.getByText('Try again')).toBeInTheDocument();
    });

    it('retries fetch when Try again is clicked', async () => {
      mockApiRequest.mockRejectedValueOnce(new Error('Network error'));
      mockApiRequest.mockResolvedValueOnce({
        success: true,
        data: { summary: { total: 10, complete: 5, partial: 2, pending: 2, failed: 1 } },
      });

      render(<TranslationStatusWidget />);

      await waitFor(() => {
        expect(screen.getByText('Try again')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Try again'));

      await waitFor(() => {
        expect(screen.getByText('Translation Status')).toBeInTheDocument();
      });
    });
  });

  describe('Empty State', () => {
    it('renders empty state when total is 0', async () => {
      mockApiRequest.mockResolvedValue({
        success: true,
        data: { summary: { total: 0, complete: 0, partial: 0, pending: 0, failed: 0 } },
      });

      render(<TranslationStatusWidget />);

      await waitFor(() => {
        expect(screen.getByText('No content to translate yet')).toBeInTheDocument();
      });
    });
  });

  describe('Property Filtering', () => {
    it('includes propertyId in API request when provided', async () => {
      mockApiRequest.mockResolvedValue({
        success: true,
        data: { summary: { total: 10, complete: 5, partial: 2, pending: 2, failed: 1 } },
      });

      render(<TranslationStatusWidget propertyId="prop-123" />);

      await waitFor(() => {
        expect(mockApiRequest).toHaveBeenCalledWith(
          '/translations/status?propertyId=prop-123',
          {},
          true
        );
      });
    });
  });
});
```

**Acceptance Criteria:**
- [ ] Test file created at correct path
- [ ] Tests cover loading state
- [ ] Tests cover loaded state with correct counts
- [ ] Tests cover progress bar percentage calculation
- [ ] Tests cover View Details link/callback
- [ ] Tests cover refresh functionality
- [ ] Tests cover error state
- [ ] Tests cover retry functionality
- [ ] Tests cover empty state
- [ ] Tests cover property filtering
- [ ] All mocks properly set up and cleared

---

## File Summary

### New Files to Create

| File Path | Purpose | Task |
|-----------|---------|------|
| `/src/components/TranslationManagement/index.ts` | Module exports | Task 3 |
| `/src/components/TranslationManagement/TranslationStatusWidget/index.ts` | Widget exports | Task 2 |
| `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.types.ts` | Type definitions | Task 1 |
| `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.tsx` | Main component | Tasks 4-10 |
| `/src/components/TranslationManagement/TranslationStatusWidget/__tests__/TranslationStatusWidget.test.tsx` | Unit tests | Task 11 |

### Files to Reference (Read Only)

| File Path | Purpose |
|-----------|---------|
| `/src/components/SimpleDashboard/StatisticsCards.tsx` | Pattern reference for card styling |
| `/src/components/SimpleDashboard/skeletons/index.ts` | SkeletonBase import |
| `/src/hooks/useDashboardStats.ts` | Pattern reference for hook structure |
| `/src/lib/api.ts` | apiRequest utility |

---

## Implementation Order

Execute tasks in this order for optimal dependency resolution:

1. **Task 1:** Create types file (no dependencies)
2. **Task 2:** Create widget index file (depends on Task 1)
3. **Task 3:** Create module index file (depends on Task 2)
4. **Tasks 4-8:** Create sub-components (can be done in parallel)
5. **Task 9:** Implement main widget (depends on Tasks 4-8)
6. **Task 10:** Add mock data fallback (optional, depends on Task 9)
7. **Task 11:** Write unit tests (depends on Task 9)

---

## Verification Checklist

After implementation, verify the following:

### Functional Verification
- [ ] Widget renders without errors in dashboard
- [ ] Loading skeleton displays during fetch
- [ ] Progress bar shows correct percentage
- [ ] All four status counts display correctly
- [ ] View Details link navigates to correct page
- [ ] Refresh button triggers new data fetch
- [ ] Error state displays with retry option
- [ ] Empty state displays when no content
- [ ] Property filtering works when propertyId provided

### Visual Verification
- [ ] Widget matches dashboard card styling (white bg, rounded-xl, shadow-sm)
- [ ] Colors match specification (green, blue, orange, red)
- [ ] Progress bar uses Airbnb teal gradient
- [ ] Icons display correctly
- [ ] Responsive on mobile and desktop

### Accessibility Verification
- [ ] Progress bar has ARIA attributes
- [ ] All buttons have accessible names
- [ ] Focus indicators visible
- [ ] Screen reader announces loading state

### Code Quality Verification
- [ ] TypeScript compiles without errors
- [ ] All props are typed
- [ ] JSDoc comments present
- [ ] File headers include REQ-350 reference
- [ ] Unit tests pass

---

## Integration Notes (Future Task REQ-319)

The TranslationStatusWidget will be integrated into the dashboard in a separate task (REQ-319):

```tsx
// In /src/app/dashboard2/page.tsx
import { TranslationStatusWidget } from '@/components/TranslationManagement';

// Add to dashboard layout:
<TranslationStatusWidget
  propertyId={selectedPropertyId}
  onViewDetails={() => router.push('/dashboard2/translations')}
/>
```

---

## References

- **Overview Document:** `/docs/REQ-350-create-translationstatuswidget-component-overview.md`
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- **Request Definition:** `/docs/gen_requests_epic5.md` (REQ-350)
- **Pattern Reference:** `/src/components/SimpleDashboard/StatisticsCards.tsx`
- **PRD:** `/docs/prd/PRD_L10N_Epic5_Owner_Translation_Management.md`

---

*Document generated for FAQBNB L10N Epic 5 - Task 3.1: Create TranslationStatusWidget Component*
