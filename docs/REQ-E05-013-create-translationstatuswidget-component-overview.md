# Implementation Overview: REQ-E05-013 - Dashboard Translation Status Summary Widget

**Document Created:** 2026-01-20 17:45 UTC
**Last Modified:** 2026-01-20 17:45 UTC
**Request ID:** REQ-E05-013
**Epic:** Epic 5 - Owner Translation Management
**Phase:** 3 - Dashboard Integration
**Task ID:** 3.1

---

## Request Summary

**Title:** Dashboard Translation Status Summary Widget

**Type:** NEW FEATURE

**Size:** M (Medium)

**Description:** Property owners need a dashboard widget that displays an at-a-glance summary of translation coverage across all their content, showing overall progress and status breakdowns with quick access to detailed translation management.

---

## Background & Context

### Current State
No dashboard widget exists to show property owners their overall translation status. Property owners must navigate to dedicated translation pages to understand the completeness of their multilingual content coverage.

### Target State
A compact dashboard card displays translation completion statistics with:
- Visual progress bar showing percentage of content fully translated
- Numerical counts categorized by translation status (complete, partial, pending, failed)
- Clickable link/button to navigate to detailed translation management interface

### Dependencies

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| Epic 1 Foundation | Translation tables, job queue | Required | `translation_jobs`, `*_translation` tables |
| Epic 3 Dynamic Content | Translation trigger system, status tracking | Required | Provides status data |
| REQ-E05-001 | Translation Status Query API | Required | GET `/api/translations/status` endpoint |
| REQ-E05-011 | useTranslationStatus hook | Required | Provides data fetching |
| REQ-E05-012 | useTranslationRealtime hook | Required | Provides live updates |

---

## Technical Analysis

### Existing Patterns to Follow

#### 1. Dashboard Card Pattern
**Reference:** `/src/components/SimpleDashboard/StatisticsCards.tsx:1-262`

```tsx
// Card container pattern
<div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all">
  <div className="flex items-center gap-4">
    <div className={`p-3 rounded-xl ${iconBgColor}`}>
      <Icon className={`w-6 h-6 ${iconColor}`} />
    </div>
    <div className="flex-1">
      <p className="text-[32px] font-bold text-[#222222]">{value}</p>
      <p className="text-sm text-[#717171]">{label}</p>
    </div>
  </div>
</div>
```

#### 2. Progress Bar Pattern
**Reference:** `/src/components/ItemCapture/components/shared/ProgressIndicator.tsx:1-202`

```tsx
// Progress bar with ARIA accessibility
<div
  className="w-full bg-gray-200 rounded-full h-1.5"
  role="progressbar"
  aria-valuenow={progressPercent}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-label={`Translation progress: ${progressPercent}%`}
>
  <div
    className="h-1.5 rounded-full transition-all duration-300"
    style={{ width: `${progressPercent}%`, backgroundColor: progressColor }}
  />
</div>
```

#### 3. Status Indicator Pattern
**Reference:** `/src/components/ItemManager/components/shared/EngagementIndicator.tsx:1-240`

Status colors and badges are defined with consistent styling:
- High/Success: `bg-green-100 text-green-700 border-green-200`
- Medium/Pending: `bg-yellow-100 text-yellow-700 border-yellow-200`
- Low/Failed: `bg-red-100 text-red-700 border-red-200`

#### 4. Hook Pattern
**Reference:** `/src/hooks/useDashboardStats.ts:1-245`

```tsx
// State management pattern
const [state, setState] = useState<StateType>({
  data: null,
  isLoading: true,
  isRefreshing: false,
  error: null,
  lastUpdated: null
});
```

#### 5. Translation Types
**Reference:** `/src/lib/translation-service/translation-service.types.ts:1-572`

Existing types to reuse:
- `SupportedLanguage = 'en' | 'fr' | 'es' | 'de' | 'nl' | 'it'`
- `TranslationStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'manual'`
- `SUPPORTED_LANGUAGES` constant array with metadata

### Color Specifications (from PRD)

| Status | Color | Tailwind Class | Hex |
|--------|-------|----------------|-----|
| Complete | Green | `text-green-500` | #10b981 |
| Partial | Orange | `text-amber-500` | #F59E0B |
| Pending | Orange | `text-amber-500` | #F59E0B |
| Failed | Red | `text-red-500` | #EF4444 |
| Manual | Purple | `text-violet-500` | #8B5CF6 |

### Progress Bar Color Logic

| Range | Color | Tailwind Class |
|-------|-------|----------------|
| 80-100% | Green | `bg-green-500` (#10b981) |
| 40-79% | Orange | `bg-amber-500` (#f59e0b) |
| 0-39% | Gray/Red | `bg-gray-300` (#d1d5db) |

---

## Implementation Details

### Component File Structure

```
/src/components/TranslationManagement/
├── TranslationStatusWidget/
│   ├── index.ts                          # Public exports
│   ├── TranslationStatusWidget.tsx       # Main dashboard widget
│   └── TranslationStatusWidget.types.ts  # Widget-specific types
```

### Component API

```typescript
// TranslationStatusWidget.types.ts
export interface TranslationStatusWidgetProps {
  /** Property ID to scope statistics */
  propertyId: string;

  /** Additional CSS classes */
  className?: string;

  /** Handler for "View Details" navigation */
  onViewDetails?: () => void;

  /** Widget display variant */
  variant?: 'compact' | 'detailed';
}

export interface TranslationStatusSummary {
  /** Total number of content items with translations */
  total: number;

  /** Number with all 5 non-English languages translated */
  complete: number;

  /** Number with some but not all languages */
  partial: number;

  /** Number with translations currently pending/processing */
  pending: number;

  /** Number with failed translations requiring attention */
  failed: number;

  /** Calculated completion percentage (0-100) */
  completionPercentage: number;
}
```

### Component Implementation

```tsx
// TranslationStatusWidget.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { Globe, CheckCircle, Clock, AlertCircle, Edit } from 'lucide-react';
import { useTranslationStatus } from '@/hooks/useTranslationStatus';
import { useTranslationRealtime } from '@/hooks/useTranslationRealtime';
import { cn } from '@/lib/utils';
import type { TranslationStatusWidgetProps, TranslationStatusSummary } from './TranslationStatusWidget.types';

export function TranslationStatusWidget({
  propertyId,
  className,
  onViewDetails,
  variant = 'compact'
}: TranslationStatusWidgetProps) {
  // Data fetching with useTranslationStatus hook
  const { data, isLoading, error, refresh } = useTranslationStatus({ propertyId });

  // Real-time updates subscription
  useTranslationRealtime({
    propertyId,
    onUpdate: refresh
  });

  // Loading state - skeleton
  if (isLoading) {
    return <TranslationStatusWidgetSkeleton className={className} />;
  }

  // Error state with retry
  if (error) {
    return (
      <TranslationStatusWidgetError
        error={error}
        onRetry={refresh}
        className={className}
      />
    );
  }

  // Empty state - no content yet
  if (!data || data.total === 0) {
    return (
      <TranslationStatusWidgetEmpty
        onViewDetails={onViewDetails}
        className={className}
      />
    );
  }

  const summary = data.summary as TranslationStatusSummary;
  const progressColor = getProgressColor(summary.completionPercentage);

  return (
    <div
      className={cn(
        'bg-white rounded-xl shadow-sm p-6 transition-all hover:shadow-md',
        className
      )}
      role="region"
      aria-label="Translation Status Summary"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-blue-50">
            <Globe className="w-5 h-5 text-blue-600" aria-hidden="true" />
          </div>
          <h3 className="font-semibold text-gray-900">Translation Status</h3>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">Overall Progress</span>
          <span className="font-medium text-gray-900">
            {summary.completionPercentage}%
          </span>
        </div>
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
              progressColor
            )}
            style={{ width: `${summary.completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Status Counts Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <StatusCount
          icon={CheckCircle}
          label="Complete"
          count={summary.complete}
          colorClass="text-green-600 bg-green-50"
        />
        <StatusCount
          icon={Edit}
          label="Partial"
          count={summary.partial}
          colorClass="text-amber-600 bg-amber-50"
        />
        <StatusCount
          icon={Clock}
          label="Pending"
          count={summary.pending}
          colorClass="text-blue-600 bg-blue-50"
        />
        <StatusCount
          icon={AlertCircle}
          label="Failed"
          count={summary.failed}
          colorClass="text-red-600 bg-red-50"
          highlight={summary.failed > 0}
        />
      </div>

      {/* View Details Link */}
      <Link
        href="/dashboard2/translations"
        onClick={onViewDetails}
        className={cn(
          'flex items-center justify-center w-full py-2.5 px-4',
          'bg-gray-50 text-gray-700 rounded-lg',
          'hover:bg-gray-100 transition-colors',
          'text-sm font-medium',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
        )}
      >
        View Details
      </Link>
    </div>
  );
}

// Sub-component: Status count indicator
interface StatusCountProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  count: number;
  colorClass: string;
  highlight?: boolean;
}

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

// Sub-component: Loading skeleton
function TranslationStatusWidgetSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('bg-white rounded-xl shadow-sm p-6 animate-pulse', className)}>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-9 h-9 bg-gray-200 rounded-lg" />
        <div className="h-5 w-32 bg-gray-200 rounded" />
      </div>
      <div className="h-2 w-full bg-gray-200 rounded-full mb-4" />
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
      <div className="h-10 w-full bg-gray-200 rounded-lg" />
    </div>
  );
}

// Sub-component: Error state
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
            className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}

// Sub-component: Empty state
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

// Utility: Get progress bar color based on percentage
function getProgressColor(percentage: number): string {
  if (percentage >= 80) return 'bg-green-500';
  if (percentage >= 40) return 'bg-amber-500';
  return 'bg-gray-300';
}
```

### Index File Export

```typescript
// index.ts
export { TranslationStatusWidget } from './TranslationStatusWidget';
export type {
  TranslationStatusWidgetProps,
  TranslationStatusSummary
} from './TranslationStatusWidget.types';
```

---

## Authorized Files and Functions for Modification

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/components/TranslationManagement/TranslationStatusWidget/index.ts` | Public exports for widget |
| `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.tsx` | Main widget component |
| `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.types.ts` | TypeScript type definitions |

### Files to Modify

| File Path | Function/Section | Change Description |
|-----------|------------------|-------------------|
| `/src/components/TranslationManagement/index.ts` | Exports | Add export for TranslationStatusWidget |
| `/src/app/dashboard2/page.tsx` | Main render | Import and render TranslationStatusWidget in dashboard layout |

---

## Integration Points

### Dashboard Integration
**File:** `/src/app/dashboard2/page.tsx`

Add widget after the statistics section:

```tsx
import { TranslationStatusWidget } from '@/components/TranslationManagement';

// In the main render, after ProgressiveStatisticsSection:
{showTranslationWidget && (
  <TranslationStatusWidget
    propertyId={selectedPropertyId}
    className="mt-6"
    onViewDetails={() => router.push('/dashboard2/translations')}
  />
)}
```

### Hook Dependencies

The widget depends on these hooks (from REQ-E05-011 and REQ-E05-012):

```typescript
// useTranslationStatus hook interface
interface UseTranslationStatusOptions {
  propertyId: string;
  entityType?: 'article' | 'item' | 'link';
  status?: 'pending' | 'completed' | 'failed' | 'manual';
}

interface UseTranslationStatusReturn {
  data: TranslationStatusResponse | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

// useTranslationRealtime hook interface
interface UseTranslationRealtimeOptions {
  propertyId: string;
  onUpdate: () => void;
}
```

---

## Acceptance Criteria Validation

| Criteria | Implementation | Status |
|----------|---------------|--------|
| Widget renders as dashboard card with consistent styling | Uses existing card patterns from StatisticsCards.tsx | Planned |
| Card header displays "Translation Status" with icon | Globe icon with blue background, semibold title | Planned |
| Progress bar displays completion percentage (0-100%) | Horizontal bar with percentage text and ARIA attributes | Planned |
| Progress bar color coding (green/orange/red thresholds) | 80-100% green, 40-79% orange, 0-39% gray | Planned |
| Complete count shows fully translated items | StatusCount component with CheckCircle icon, green styling | Planned |
| Partial count shows partially translated items | StatusCount component with Edit icon, amber styling | Planned |
| Pending count shows in-progress jobs | StatusCount component with Clock icon, blue styling | Planned |
| Failed count shows error jobs | StatusCount component with AlertCircle icon, red styling + highlight | Planned |
| "View Details" link navigates to translations page | Link component pointing to /dashboard2/translations | Planned |
| Loading skeleton while fetching data | TranslationStatusWidgetSkeleton component with animate-pulse | Planned |
| Error state with retry option | TranslationStatusWidgetError component with onRetry handler | Planned |
| Zero state when no content exists | TranslationStatusWidgetEmpty component | Planned |
| Automatic updates via realtime subscription | Integration with useTranslationRealtime hook | Planned |
| Responsive layout for mobile | Grid layout adapts (grid-cols-2 consistent) | Planned |
| Consistent height (no layout shifts) | Fixed structure regardless of content | Planned |
| Proper ARIA labels and accessibility | role="region", role="progressbar", aria-* attributes | Planned |
| Hover state feedback for action area | hover:shadow-md on card, hover:bg-gray-100 on link | Planned |

---

## Testing Considerations

### Unit Tests

```typescript
// TranslationStatusWidget.test.tsx
describe('TranslationStatusWidget', () => {
  it('renders loading skeleton while fetching', () => {});
  it('renders error state with retry button when fetch fails', () => {});
  it('renders empty state when no translations exist', () => {});
  it('displays correct status counts from data', () => {});
  it('calculates progress percentage correctly', () => {});
  it('applies correct color to progress bar based on percentage', () => {});
  it('highlights failed count when > 0', () => {});
  it('calls onViewDetails when link is clicked', () => {});
  it('refreshes data when realtime update received', () => {});
  it('has proper accessibility attributes', () => {});
});
```

### Visual Testing Scenarios

1. All statuses at 0 (empty/zero state)
2. 100% completion (all green)
3. Mixed statuses with failures highlighted
4. Single pending job (in-progress indicator)
5. Mobile viewport responsiveness

---

## Estimated Effort

| Task | Estimate |
|------|----------|
| Create type definitions | 0.5 hours |
| Implement main component | 2 hours |
| Implement sub-components (skeleton, error, empty) | 1 hour |
| Create index and exports | 0.25 hours |
| Integrate into dashboard page | 0.5 hours |
| Write unit tests | 1.5 hours |
| **Total** | **5.75 hours** |

---

## Notes

1. **Hook Dependencies:** This component requires REQ-E05-011 (useTranslationStatus) and REQ-E05-012 (useTranslationRealtime) to be implemented first. If these are not ready, create stub implementations that return mock data.

2. **Feature Flag:** Consider wrapping the widget integration in a feature flag to allow staged rollout: `showTranslationWidget && tierConfig.features.translationManagement`

3. **Tooltip Enhancement (optional):** The PRD mentions "displays tooltip explaining the progress percentage calculation method." This can be added using Radix UI Tooltip primitive if needed in a follow-up task.

4. **Dark Mode:** The component uses Tailwind classes that support dark mode via `dark:` prefix if/when dark mode is added to the application.

---

## References

- **Request:** REQ-E05-013 in `/docs/gen_requests_epic5.md`
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- **PRD:** `/docs/prd/PRD_L10N_Epic5_Owner_Translation_Management.md`
- **Existing Patterns:**
  - StatisticsCards: `/src/components/SimpleDashboard/StatisticsCards.tsx`
  - ProgressIndicator: `/src/components/ItemCapture/components/shared/ProgressIndicator.tsx`
  - EngagementIndicator: `/src/components/ItemManager/components/shared/EngagementIndicator.tsx`
  - useDashboardStats: `/src/hooks/useDashboardStats.ts`
  - Translation types: `/src/lib/translation-service/translation-service.types.ts`
