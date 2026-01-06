# REQ-138: Shimmer Skeletons and Consistent Loading Indicators - Implementation Overview

**Document Created:** 2026-01-06 11:00:00 UTC
**Last Modified:** 2026-01-06 11:00:00 UTC
**Request Reference:** REQ-138 from docs/gen_requests.md
**Implementation Plan Reference:** Plan-001-Simple-Dashboard-Implementation-REVISED.md (Phase 6.2)
**Status:** PLANNING

---

## 1. Request Summary

### 1.1 Original Request
Display engaging shimmer skeleton placeholders during data loading and provide consistent loading indicators across all async operations to improve perceived performance and user experience.

### 1.2 Current Behavior
Users encounter blank spaces, abrupt content shifts, or inconsistent loading feedback when data is being fetched. Some sections may show loading indicators while others display nothing, creating an inconsistent and potentially confusing experience.

### 1.3 Expected Behavior
- Shimmer skeleton components that mirror the layout of actual content (cards, lists, tables)
- Consistent loading indicators (spinner or progress indicator) for all async operations
- Smooth transitions from skeleton to actual content without layout shifts
- Loading states visually distinct from empty states

### 1.4 PRD Reference
Phase 6.2 from Plan-001-Simple-Dashboard-Implementation-REVISED.md:
- [ ] Shimmer skeletons for all loading sections
- [ ] Consistent loading indicators

---

## 2. Technical Context

### 2.1 Technology Stack
| Technology | Details |
|------------|---------|
| Framework | Next.js 15.5.9 (App Router, Turbopack) |
| Language | TypeScript 5.x |
| Styling | Tailwind CSS 4 |
| State Management | React Context (AuthContext), React useState/useReducer |
| UI Components | Custom components + Radix UI primitives |
| Icons | Lucide React |
| Animation | Tailwind `animate-pulse` class |

### 2.2 Airbnb Design System Loading Guidelines
From `docs/prd/airbnb_designsystem.md`:

**Timing Guidelines:**
```css
--duration-instant: 100ms;
--duration-fast: 200ms;
--duration-normal: 300ms;
--duration-slow: 400ms;

--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
```

**Color System for Skeletons:**
| Token | Value | Usage |
|-------|-------|-------|
| Skeleton Background | `bg-gray-200` | Base skeleton color |
| Skeleton Shimmer | `animate-pulse` | Tailwind animation |
| Card Background | `bg-white` | Card container |
| Border | `border-[#DDDDDD]` | Skeleton borders |

**Accessibility Requirements:**
- Support `prefers-reduced-motion` for animations
- Include `role="status"` and `aria-busy="true"` for screen readers
- Provide `aria-label` describing loading state
- Include `sr-only` text for screen reader context

---

## 3. Current State Analysis

### 3.1 Existing Loading Patterns in Codebase

**Pattern 1: StatisticsCards LoadingSkeleton** (`src/components/SimpleDashboard/StatisticsCards.tsx:100-120`)
```tsx
function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4 animate-pulse">
          <div className="w-12 h-12 bg-gray-200 rounded-xl" />
          <div className="flex-1">
            <div className="h-8 w-16 bg-gray-200 rounded mb-1" />
            <div className="h-4 w-12 bg-gray-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
```

**Pattern 2: PropertySection LoadingSkeleton** (`src/components/SimpleDashboard/PropertySection.tsx:59-84`)
```tsx
function LoadingSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-4 border-b border-[#DDDDDD]">
        <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
      </div>
      {[1, 2].map((i) => (
        <div key={i} className="flex items-center justify-between p-4 border-b border-[#DDDDDD] last:border-b-0">
          <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />
          <div className="h-5 w-5 bg-gray-200 rounded animate-pulse" />
        </div>
      ))}
      <div className="p-4">
        <div className="h-12 w-full bg-gray-200 rounded-lg animate-pulse" />
      </div>
    </div>
  );
}
```

**Pattern 3: PortfolioSummary LoadingSkeleton** (`src/components/SimpleDashboard/PortfolioSummary.tsx:28-45`)
```tsx
function LoadingSkeleton() {
  return (
    <div className="bg-gradient-to-r from-[#E61E4D] to-[#D70466] rounded-xl p-6 text-white animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-white/20 rounded-lg" />
        <div className="h-6 w-48 bg-white/20 rounded" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white/10 rounded-lg p-4">
            <div className="h-8 w-20 bg-white/20 rounded mb-2" />
            <div className="h-4 w-24 bg-white/20 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Pattern 4: ItemManager LoadingState** (`src/components/ItemManager/components/shared/LoadingState.tsx`)
- Supports both grid and list view modes
- Includes full accessibility support (role="status", aria-label, sr-only)
- Configurable skeleton count
- Uses `cn()` utility for class composition

**Pattern 5: AnalyticsSkeleton** (`src/components/AnalyticsSkeleton.tsx`)
- Full page skeleton layout
- Header, cards grid, and content sections
- Basic `animate-pulse` implementation

**Pattern 6: Dashboard Layout Spinner** (`src/app/dashboard2/layout.tsx:29-37`)
```tsx
<div className="min-h-screen flex items-center justify-center bg-gray-50">
  <div className="text-center">
    <Loader2 className="w-12 h-12 animate-spin text-[#FF385C] mx-auto mb-4" />
    <p className="text-gray-600 text-lg">Loading dashboard...</p>
  </div>
</div>
```

### 3.2 Components Requiring Loading States

| Component | Current State | Gap |
|-----------|---------------|-----|
| `StatisticsCards` | Has basic skeleton | Needs accessibility, reduced motion |
| `PropertySection` | Has basic skeleton | Needs accessibility, reduced motion |
| `PortfolioSummary` | Has basic skeleton | Needs accessibility, reduced motion |
| `ActionButtons` | No loading state | Static component - none needed |
| `PropertyEditModal` | No loading state | Needs save/loading state |
| `AddPropertyModal` | No loading state | Needs save/loading state |
| `Dashboard Layout` | Has spinner | Good - Airbnb colored |
| `EmptyStateCard` | No loading state | Static component - none needed |

### 3.3 Async Operations Requiring Loading Indicators

| Operation | Location | Current Indicator |
|-----------|----------|-------------------|
| Fetch dashboard stats | `useDashboardStats` hook | `isLoading` state |
| Fetch user properties | `AuthContext` | `loading` state |
| Save property (edit) | `PropertyEditModal` | None (needs addition) |
| Create property | `AddPropertyModal` | None (needs addition) |
| Navigation transitions | Router | None (page-level) |

---

## 4. Implementation Tasks

### Task 1: Create Reusable Skeleton Components Library

**Files to Create:**
- `/src/components/SimpleDashboard/skeletons/index.ts`
- `/src/components/SimpleDashboard/skeletons/SkeletonBase.tsx`
- `/src/components/SimpleDashboard/skeletons/SkeletonCard.tsx`
- `/src/components/SimpleDashboard/skeletons/SkeletonText.tsx`

**SkeletonBase.tsx - Core skeleton with accessibility:**
```tsx
interface SkeletonBaseProps {
  className?: string;
  children: React.ReactNode;
  label?: string;
}

export function SkeletonBase({ className, children, label = 'Loading content' }: SkeletonBaseProps) {
  return (
    <div
      role="status"
      aria-label={label}
      aria-busy="true"
      className={cn('animate-pulse', className)}
    >
      <span className="sr-only">{label}, please wait...</span>
      {children}
    </div>
  );
}
```

### Task 2: Refactor Existing Skeletons to Use Base Component

**Files to Modify:**
- `/src/components/SimpleDashboard/StatisticsCards.tsx` (lines 100-120)
- `/src/components/SimpleDashboard/PropertySection.tsx` (lines 59-84)
- `/src/components/SimpleDashboard/PortfolioSummary.tsx` (lines 28-45)

**Changes:**
- Wrap existing skeletons with `SkeletonBase`
- Add `role="status"`, `aria-busy="true"`, `aria-label`
- Add `sr-only` text for screen readers
- Support `prefers-reduced-motion` media query

### Task 3: Add Reduced Motion Support

**Files to Modify:**
- `/src/app/globals.css` (or create new utility)

**Add CSS:**
```css
@media (prefers-reduced-motion: reduce) {
  .animate-pulse {
    animation: none;
    opacity: 0.6;
  }

  .animate-spin {
    animation: none;
  }
}
```

### Task 4: Add Loading States to Modal Operations

**Files to Modify:**
- `/src/components/SimpleDashboard/PropertyEditModal.tsx`
- `/src/components/SimpleDashboard/AddPropertyModal.tsx`

**Changes:**
- Add `isSaving` state to track save operations
- Disable form inputs during save
- Show spinner on save button
- Prevent modal close during save

**Save Button Pattern:**
```tsx
<button
  type="submit"
  disabled={isSaving}
  className="..."
>
  {isSaving ? (
    <>
      <Loader2 className="w-4 h-4 animate-spin mr-2" />
      Saving...
    </>
  ) : (
    'Save Changes'
  )}
</button>
```

### Task 5: Create Consistent Loading Indicator Component

**Files to Create:**
- `/src/components/SimpleDashboard/LoadingIndicator.tsx`

**Component Purpose:**
- Unified loading spinner component
- Configurable size (sm, md, lg)
- Airbnb brand color (#FF385C)
- Accessible with proper ARIA

```tsx
interface LoadingIndicatorProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

export function LoadingIndicator({
  size = 'md',
  label = 'Loading',
  className
}: LoadingIndicatorProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <span
      role="status"
      aria-label={label}
      className={cn('inline-flex items-center', className)}
    >
      <Loader2 className={cn('animate-spin text-[#FF385C]', sizeClasses[size])} />
      <span className="sr-only">{label}</span>
    </span>
  );
}
```

### Task 6: Add Transition Animations

**Files to Modify:**
- Components with loading states

**Pattern for Smooth Transitions:**
```tsx
// Use CSS transitions for opacity
<div className={cn(
  'transition-opacity duration-300',
  isLoading ? 'opacity-100' : 'opacity-0 absolute'
)}>
  <LoadingSkeleton />
</div>
<div className={cn(
  'transition-opacity duration-300',
  isLoading ? 'opacity-0 absolute' : 'opacity-100'
)}>
  <ActualContent />
</div>
```

### Task 7: Update Exports and Documentation

**Files to Modify:**
- `/src/components/SimpleDashboard/index.ts`

**Exports to Add:**
```ts
export { SkeletonBase } from './skeletons/SkeletonBase';
export { SkeletonCard } from './skeletons/SkeletonCard';
export { SkeletonText } from './skeletons/SkeletonText';
export { LoadingIndicator } from './LoadingIndicator';
```

---

## 5. Authorized Files and Functions for Modification

### 5.1 Files to CREATE

| File Path | Purpose |
|-----------|---------|
| `/src/components/SimpleDashboard/skeletons/index.ts` | Skeleton components barrel export |
| `/src/components/SimpleDashboard/skeletons/SkeletonBase.tsx` | Base skeleton wrapper with accessibility |
| `/src/components/SimpleDashboard/skeletons/SkeletonCard.tsx` | Reusable card skeleton |
| `/src/components/SimpleDashboard/skeletons/SkeletonText.tsx` | Reusable text line skeleton |
| `/src/components/SimpleDashboard/LoadingIndicator.tsx` | Unified loading spinner |

### 5.2 Files to MODIFY

| File Path | Functions/Sections | Changes |
|-----------|-------------------|---------|
| `/src/components/SimpleDashboard/StatisticsCards.tsx` | `LoadingSkeleton()` (lines 100-120) | Add accessibility, use SkeletonBase |
| `/src/components/SimpleDashboard/PropertySection.tsx` | `LoadingSkeleton()` (lines 59-84) | Add accessibility, use SkeletonBase |
| `/src/components/SimpleDashboard/PortfolioSummary.tsx` | `LoadingSkeleton()` (lines 28-45) | Add accessibility, use SkeletonBase |
| `/src/components/SimpleDashboard/PropertyEditModal.tsx` | Save handler, submit button | Add isSaving state, loading indicator |
| `/src/components/SimpleDashboard/AddPropertyModal.tsx` | Save handler, submit button | Add isSaving state, loading indicator |
| `/src/components/SimpleDashboard/index.ts` | Exports | Add new component exports |
| `/src/app/globals.css` | Root styles | Add reduced motion media query |

### 5.3 Files NOT to Modify (Already Complete/Out of Scope)

| File Path | Reason |
|-----------|--------|
| `/src/app/dashboard2/layout.tsx` | Loading state already implemented with Airbnb colors |
| `/src/app/dashboard2/create/page.tsx` | Already complete per implementation plan |
| `/src/app/dashboard2/items/page.tsx` | Already complete per implementation plan |
| `/src/components/ItemManager/components/shared/LoadingState.tsx` | Already has full accessibility support |
| `/src/components/SimpleDashboard/ActionButtons.tsx` | Static component, no async operations |
| `/src/components/SimpleDashboard/EmptyStateCard.tsx` | Static component, no loading needed |

---

## 6. Acceptance Criteria

Based on REQ-138 requirements:

- [ ] All data-loading sections (dashboard, property lists, statistics, forms) display shimmer skeleton placeholders while fetching
- [ ] Skeleton placeholders accurately reflect the layout and structure of the loaded content
- [ ] All async operations (save, update, delete, fetch) show a consistent loading indicator
- [ ] Loading states are visually distinct from empty states
- [ ] Transitions between loading and loaded states are smooth without jarring layout shifts
- [ ] Loading indicators automatically disappear when operations complete or error
- [ ] Reduced motion support for users with `prefers-reduced-motion` preference
- [ ] All loading states include proper accessibility attributes (role, aria-label, sr-only)

---

## 7. Implementation Dependencies

### 7.1 Prerequisites
- REQ-137 (Empty States) - COMPLETED: EmptyStateCard component exists
- SimpleDashboard components structure - COMPLETED: All components exist

### 7.2 Related Requests
- REQ-137: Empty State Guidance - Provides visual distinction from loading states
- REQ-124: Dashboard Statistics - StatisticsCards already has loading skeleton
- REQ-130: PropertySection - PropertySection already has loading skeleton

---

## 8. Testing Considerations

### 8.1 Manual Testing Checklist
- [ ] Throttle network to slow 3G and verify skeletons display
- [ ] Enable "Reduce motion" in OS settings and verify animation stops
- [ ] Use screen reader to verify loading announcements
- [ ] Test keyboard navigation during loading states
- [ ] Verify no layout shift when content loads
- [ ] Test modal save operations with slow network

### 8.2 Automated Testing Suggestions
- Unit tests for LoadingIndicator component props
- Unit tests for SkeletonBase accessibility attributes
- Integration test for modal loading state flow
- Visual regression tests for skeleton layouts

---

## 9. Effort Estimate

| Task | Complexity | Estimate |
|------|------------|----------|
| Task 1: Skeleton components library | Medium | 1-2 hours |
| Task 2: Refactor existing skeletons | Low | 1 hour |
| Task 3: Reduced motion support | Low | 30 minutes |
| Task 4: Modal loading states | Medium | 1-2 hours |
| Task 5: LoadingIndicator component | Low | 30 minutes |
| Task 6: Transition animations | Medium | 1 hour |
| Task 7: Exports and documentation | Low | 30 minutes |
| **Total** | | **5-7 hours** |

---

## 10. References

- [PRD: Dashboard 2 - Simple Dashboard](/docs/prd/PRD_Dashboard_2_Simple_Dashboard.md)
- [Airbnb Design System](/docs/prd/airbnb_designsystem.md) - Section 8: Motion & Animation
- [Implementation Plan](/docs/prd/Plan-001-Simple-Dashboard-Implementation-REVISED.md) - Phase 6.2
- [Existing LoadingState Component](/src/components/ItemManager/components/shared/LoadingState.tsx)
- [WCAG 2.1 - Reduced Motion Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html)
