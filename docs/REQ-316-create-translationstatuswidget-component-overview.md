# REQ-316: Create TranslationStatusWidget Component - Overview

**Date Created:** 2026-01-18
**Last Modified:** 2026-01-18
**Type:** NEW FEATURE
**Size:** M (Medium)
**Priority:** P2 - Medium
**Phase:** 3 - Dashboard Integration
**Task ID:** 3.1

---

## Summary

Create a dashboard widget component that displays translation status summary for property owners. The widget shows overall translation progress, counts by status (complete, partial, pending, failed), and provides a "View Details" link to navigate to the full translation management interface.

---

## Dependencies

### Epic Dependencies
- **Epic 1 (Foundation):** Translation tables, translation status tracking, i18n framework
- **Epic 3 (Dynamic Content Translation):** Translation trigger system, status API

### Task Dependencies
- **Task 1.1 (REQ-304):** Translation Status Query Endpoint - Provides the API for fetching summary counts
- **Task 2.1 (REQ-309):** TranslationManagement types file - Shared type definitions
- **Task 2.6 (REQ-314):** useTranslationStatus hook - Data fetching abstraction

---

## Technical Context

### Existing Patterns to Follow

| Pattern | Location | Usage |
|---------|----------|-------|
| Dashboard Widget | `/src/components/SimpleDashboard/StatisticsCards.tsx` | Card layout, styling, grid integration |
| Data Fetching Hook | `/src/hooks/useDashboardStats.ts` | Loading/error states, refresh pattern |
| Empty State | `/src/components/SimpleDashboard/EmptyStateCard.tsx` | Empty/error state display |
| Loading Skeleton | `/src/components/SimpleDashboard/skeletons/SkeletonBase.tsx` | Skeleton UI pattern |
| Airbnb Design System | Various | Color palette, typography, spacing |

### Dashboard Integration Point

The widget will be integrated into `/src/app/dashboard2/page.tsx` alongside existing components:
- `ProgressiveStatisticsSection`
- `ActionButtons`
- `PropertySection`

---

## Component Specification

### Component Location
```
/src/components/TranslationManagement/TranslationStatusWidget/
├── index.ts                           # Public exports
├── TranslationStatusWidget.tsx        # Main component
└── TranslationStatusWidget.types.ts   # Component types
```

### Props Interface

```typescript
/**
 * Props for TranslationStatusWidget component
 */
export interface TranslationStatusWidgetProps {
  /** Optional property ID to filter translation status */
  propertyId?: string;
  /** Callback when "View Details" is clicked */
  onViewDetails?: () => void;
  /** Optional additional CSS classes */
  className?: string;
}
```

### Data Structure (from useTranslationStatus hook)

```typescript
interface TranslationStatusSummary {
  /** Total translatable content items */
  total: number;
  /** Items with all languages translated */
  complete: number;
  /** Items with some languages translated */
  partial: number;
  /** Items with translations queued but not started */
  pending: number;
  /** Items with translation errors */
  failed: number;
}
```

### Visual Layout

```
┌────────────────────────────────────────────────────────────┐
│  🌐 Translation Status                                     │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ████████████████░░░░  75% Complete                       │
│                                                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │ ✓ 45     │ │ ◐ 12     │ │ ⏳ 3     │ │ ❌ 0     │      │
│  │ Complete │ │ Partial  │ │ Pending  │ │ Failed   │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│                                                            │
│                                    [View Details →]        │
└────────────────────────────────────────────────────────────┘
```

### Styling Specifications

Following Airbnb Design Language System patterns:

| Element | Tailwind Classes |
|---------|-----------------|
| Card Container | `bg-white rounded-xl shadow-sm p-6` |
| Card Title | `text-lg font-semibold text-[#222222]` |
| Progress Bar Background | `bg-gray-200 rounded-full h-2` |
| Progress Bar Fill | `bg-green-500 rounded-full h-2 transition-all` |
| Percentage Text | `text-sm font-medium text-[#717171]` |
| Status Count Value | `text-xl font-bold text-[#222222]` |
| Status Count Label | `text-xs text-[#717171]` |
| View Details Link | `text-sm font-medium text-[#FF385C] hover:underline` |

### Status Icon Colors

| Status | Icon | Color | Tailwind Class |
|--------|------|-------|----------------|
| Complete | ✓ | Green | `text-green-500` |
| Partial | ◐ | Blue | `text-blue-500` |
| Pending | ⏳ | Orange | `text-amber-500` |
| Failed | ❌ | Red | `text-red-500` |

---

## Implementation Tasks

### Task 3.1.1: Create TranslationStatusWidget Types
**Effort:** 0.5 story points

Create the types file defining component interfaces:
- `TranslationStatusWidgetProps`
- `StatusCountCardProps` (internal sub-component)
- Re-export relevant types from shared TranslationManagement.types.ts

### Task 3.1.2: Create TranslationStatusWidget Component
**Effort:** 2 story points

Implement the main widget component:
1. Use `useTranslationStatus` hook for data fetching
2. Calculate percentage completion: `(complete / total) * 100`
3. Render progress bar with animated fill
4. Display four status count cards in responsive grid
5. Render "View Details" link with navigation

### Task 3.1.3: Implement Loading State
**Effort:** 0.5 story points

Create skeleton UI following `SkeletonBase` pattern:
- Shimmer animation on progress bar placeholder
- Skeleton cards for status counts
- Accessible loading announcement

### Task 3.1.4: Implement Empty State
**Effort:** 0.5 story points

Handle when no translatable content exists:
- Display message: "No translatable content yet"
- Optional CTA to create content
- Use `EmptyStateCard` component pattern

### Task 3.1.5: Implement Error State
**Effort:** 0.5 story points

Handle API errors gracefully:
- Display error message
- Provide retry button
- Log error for debugging

### Task 3.1.6: Create Index Export
**Effort:** 0.25 story points

Create barrel export file for clean imports.

---

## Acceptance Criteria

From REQ-316:

- [ ] Widget displays as a summary card component on the dashboard
- [ ] Widget shows progress bar indicating overall translation completion percentage
- [ ] Widget displays count of content items with status "complete" (all languages translated)
- [ ] Widget displays count of content items with status "partial" (some languages translated)
- [ ] Widget displays count of content items with status "pending" (translation queued)
- [ ] Widget displays count of content items with status "failed" (translation errors)
- [ ] Widget includes "View Details" link that navigates to translation management page
- [ ] Widget only displays data for content belonging to the authenticated user's account
- [ ] Widget shows loading state while translation status data is being fetched
- [ ] Widget displays appropriate empty state when no translatable content exists
- [ ] Widget displays error state if translation status data cannot be retrieved
- [ ] Widget is responsive and adapts layout for tablet and desktop viewports
- [ ] Widget is keyboard accessible with proper focus management for the "View Details" link

---

## Authorized Files and Functions for Modification

### New Files (Create)

| File Path | Purpose |
|-----------|---------|
| `/src/components/TranslationManagement/TranslationStatusWidget/index.ts` | Barrel exports |
| `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.tsx` | Main widget component |
| `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.types.ts` | Component type definitions |

### Files to Modify (Future Integration - Task 3.4)

| File Path | Modification |
|-----------|--------------|
| `/src/app/dashboard2/page.tsx` | Import and render TranslationStatusWidget |
| `/src/components/TranslationManagement/index.ts` | Add TranslationStatusWidget exports |

### Dependencies Required

| File Path | Import |
|-----------|--------|
| `/src/hooks/useTranslationStatus.ts` | `useTranslationStatus` hook (Task 2.6) |
| `/src/components/TranslationManagement/TranslationManagement.types.ts` | Shared types (Task 2.1) |
| `/src/components/SimpleDashboard/skeletons/SkeletonBase.tsx` | Loading state base |
| `/src/components/SimpleDashboard/EmptyStateCard.tsx` | Empty state pattern (optional) |

---

## Component Code Template

```typescript
// /src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.tsx

'use client';

import { useRouter } from 'next/navigation';
import { Globe, Check, AlertCircle, Clock, XCircle, ChevronRight } from 'lucide-react';
import { useTranslationStatus } from '@/hooks/useTranslationStatus';
import { SkeletonBase } from '@/components/SimpleDashboard/skeletons';
import type { TranslationStatusWidgetProps } from './TranslationStatusWidget.types';

/**
 * TranslationStatusWidget - Dashboard summary card for translation status
 *
 * Displays:
 * - Progress bar with percentage completion
 * - Status counts: complete, partial, pending, failed
 * - "View Details" link to translation management page
 *
 * REQ-316: Translation status visibility for property owners
 * Created: 2026-01-18
 */
export function TranslationStatusWidget({
  propertyId,
  onViewDetails,
  className = ''
}: TranslationStatusWidgetProps) {
  const router = useRouter();
  const { data, isLoading, error, refresh } = useTranslationStatus({ propertyId });

  // Handle View Details navigation
  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails();
    } else {
      router.push('/dashboard2/translations');
    }
  };

  // Loading state
  if (isLoading) {
    return <TranslationStatusWidgetSkeleton className={className} />;
  }

  // Error state
  if (error) {
    return (
      <TranslationStatusWidgetError
        message={error}
        onRetry={refresh}
        className={className}
      />
    );
  }

  // Empty state - no translatable content
  if (!data || data.summary.total === 0) {
    return (
      <TranslationStatusWidgetEmpty className={className} />
    );
  }

  const { summary } = data;
  const percentage = Math.round((summary.complete / summary.total) * 100);

  return (
    <div className={`bg-white rounded-xl shadow-sm p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Globe className="w-5 h-5 text-[#FF385C]" aria-hidden="true" />
        <h3 className="text-lg font-semibold text-[#222222]">
          Translation Status
        </h3>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-[#717171]">Overall Progress</span>
          <span className="text-sm font-medium text-[#222222]">{percentage}%</span>
        </div>
        <div
          className="bg-gray-200 rounded-full h-2"
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${percentage}% translations complete`}
        >
          <div
            className="bg-green-500 rounded-full h-2 transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Status Counts Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <StatusCountCard
          icon={Check}
          value={summary.complete}
          label="Complete"
          iconColor="text-green-500"
          iconBgColor="bg-green-50"
        />
        <StatusCountCard
          icon={AlertCircle}
          value={summary.partial}
          label="Partial"
          iconColor="text-blue-500"
          iconBgColor="bg-blue-50"
        />
        <StatusCountCard
          icon={Clock}
          value={summary.pending}
          label="Pending"
          iconColor="text-amber-500"
          iconBgColor="bg-amber-50"
        />
        <StatusCountCard
          icon={XCircle}
          value={summary.failed}
          label="Failed"
          iconColor="text-red-500"
          iconBgColor="bg-red-50"
        />
      </div>

      {/* View Details Link */}
      <button
        onClick={handleViewDetails}
        className="flex items-center gap-1 text-sm font-medium text-[#FF385C] hover:underline
                   focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:ring-offset-2 rounded"
      >
        View Details
        <ChevronRight className="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  );
}

// ... (StatusCountCard, Skeleton, Error, Empty sub-components)
```

---

## Testing Considerations

### Unit Tests
- Render with loading state
- Render with data (various percentage values: 0%, 50%, 100%)
- Render with empty state (total = 0)
- Render with error state
- Click "View Details" triggers navigation/callback
- Accessibility: ARIA progressbar attributes
- Responsive layout at different breakpoints

### Integration Tests
- Widget displays correctly on dashboard
- Data refreshes when property context changes
- Error recovery with retry button

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| useTranslationStatus hook not ready | Medium | High | Stub hook with mock data for initial development |
| Translation tables not migrated | Medium | High | Feature flag to hide widget until Epic 1 complete |
| Dashboard layout conflicts | Low | Medium | Use same grid/spacing patterns as existing widgets |

---

## References

- **Request:** `/docs/gen_requests_epic5.md` - REQ-316
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- **Similar Component:** `/src/components/SimpleDashboard/StatisticsCards.tsx`
- **Dashboard Page:** `/src/app/dashboard2/page.tsx`
- **Airbnb Design System:** `/docs/prd/airbnb_designsystem.md`
