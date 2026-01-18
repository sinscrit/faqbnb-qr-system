# REQ-061: Implementation Breakdown - Empty and Loading State Components

**Document Generated:** 2026-01-03T10:30:00
**Last Modified:** 2026-01-03T10:30:00
**Request Reference:** `/docs/gen_requests.md` - Request #061
**Implementation Plan Reference:** `/docs/prd/item-capture-manager-implementation-plan.md`
**Phase:** 1 - Foundation
**Task ID:** 1.7

---

## Overview

This document provides a technical implementation breakdown for creating the `EmptyState.tsx` and `LoadingState.tsx` components for the ItemManager component. These shared UI components provide visual feedback when content is loading or when no items are available to display.

### Task Context from Implementation Plan

| Attribute | Value |
|-----------|-------|
| Phase | 1 - Foundation |
| Task ID | 1.7 |
| Task Title | Implement Empty and Loading states |
| Dependencies | Task 1.3 (Basic ItemManager Shell) |
| Parallel With | None (last task in Phase 1) |
| Estimated Effort | Part of 2-3 day Phase 1 |

### Scope

- Create `EmptyState.tsx` component with customizable messaging
- Create `LoadingState.tsx` with skeleton animation matching grid/list layouts
- Integrate both components into the main ItemManager component
- Support render prop customization as defined in `ItemManagerProps`

---

## Technical Context

### Existing Stack (from Implementation Plan)

| Technology | Version/Details |
|------------|-----------------|
| Framework | Next.js 15.5.9 with Turbopack |
| React | 19.1.0 |
| Language | TypeScript 5.x (strict mode) |
| Styling | Tailwind CSS 4.x |
| Icons | Lucide React 0.525.0 |
| Utility Library | clsx + tailwind-merge via `cn()` |

### Established Patterns (from Codebase Analysis)

| Pattern | Source File | Description |
|---------|-------------|-------------|
| Skeleton Animation | `src/components/AnalyticsSkeleton.tsx` | Uses `animate-pulse` with `bg-gray-200` rounded elements |
| Empty State UI | `src/components/ItemsManagement.tsx:278-301` | Centered layout with icon, title, description, and optional CTA |
| Loading State | `src/components/ItemsManagement.tsx:171-181` | Centered spinner with `animate-spin` and message |
| Client Components | All `/src/components/` | Use `'use client'` directive |
| Utility Classes | `src/lib/utils.ts` | `cn()` for class merging |

### Props Interface from Implementation Plan

```typescript
// From ItemManagerProps in ItemManager.types.ts
interface ItemManagerProps {
  // ...
  loading?: boolean;
  error?: Error | null;

  // Render customization
  renderEmptyState?: () => React.ReactNode;
  renderLoadingState?: () => React.ReactNode;
  renderErrorState?: (error: Error) => React.ReactNode;

  // Labels (for i18n)
  config?: {
    labels?: {
      emptyStateTitle?: string;
      emptyStateDescription?: string;
      // ...
    };
  };

  // Styling
  classNames?: {
    emptyState?: string;
    loadingState?: string;
  };
}
```

---

## Component Architecture

### Component Hierarchy

```
src/components/ItemManager/
├── components/
│   └── shared/
│       ├── EmptyState.tsx      # NEW - Empty collection state
│       └── LoadingState.tsx    # NEW - Skeleton loading state
├── ItemManager.tsx             # MODIFY - Integrate states
└── ItemManager.types.ts        # MODIFY - Add component props interfaces
```

### Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      ItemManager                              │
│                                                               │
│   Props: items, loading, error, config.labels, classNames    │
│                                                               │
│   ┌─────────────────────────────────────────────────────┐   │
│   │                  Render Logic                         │   │
│   │                                                       │   │
│   │   if (loading)                                        │   │
│   │     → renderLoadingState?.() || <LoadingState />      │   │
│   │                                                       │   │
│   │   if (error)                                          │   │
│   │     → renderErrorState?.(error) || <ErrorState />     │   │
│   │                                                       │   │
│   │   if (items.length === 0)                             │   │
│   │     → renderEmptyState?.() || <EmptyState />          │   │
│   │                                                       │   │
│   │   else                                                │   │
│   │     → <ItemGrid /> or <ItemList />                    │   │
│   └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Tasks

### Task 1.7.1: Create EmptyState Component

**File:** `src/components/ItemManager/components/shared/EmptyState.tsx`

**Props Interface:**
```typescript
export interface EmptyStateProps {
  /** Title text for empty state */
  title?: string;
  /** Description text for empty state */
  description?: string;
  /** Icon component to display */
  icon?: React.ReactNode;
  /** Call-to-action element */
  action?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}
```

**Implementation Requirements:**
- Centered layout with vertical stacking
- Gray icon (default: Package or FolderOpen from Lucide)
- Title in `text-lg font-medium text-gray-900`
- Description in `text-gray-600`
- Optional action button slot
- Support custom className override
- Follow pattern from `ItemsManagement.tsx:278-301`

**Default Values (from Implementation Plan constants):**
```typescript
const DEFAULT_LABELS = {
  emptyStateTitle: 'No items yet',
  emptyStateDescription: 'Create your first item to get started',
};
```

---

### Task 1.7.2: Create LoadingState Component

**File:** `src/components/ItemManager/components/shared/LoadingState.tsx`

**Props Interface:**
```typescript
export interface LoadingStateProps {
  /** View mode to determine skeleton layout */
  viewMode?: 'grid' | 'list';
  /** Number of skeleton items to show */
  itemCount?: number;
  /** Additional CSS classes */
  className?: string;
}
```

**Implementation Requirements:**
- Use `animate-pulse` for skeleton animation (matches `AnalyticsSkeleton.tsx`)
- Render skeleton that matches target layout:
  - Grid view: 2-4 column responsive grid of card skeletons
  - List view: Table row skeletons
- Default `itemCount`: 6 for grid, 5 for list
- Card skeleton structure:
  - Thumbnail placeholder (16:9 aspect ratio, `bg-gray-200`)
  - Title line placeholder (70% width)
  - Subtitle/metadata placeholder (50% width)
  - Badge placeholder (small rounded rectangle)
- Row skeleton structure:
  - Small thumbnail (square)
  - Multiple text line placeholders
  - Action area placeholder

**Grid Skeleton Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐    │
│  │ ░░░░░░░ │  │ ░░░░░░░ │  │ ░░░░░░░ │  │ ░░░░░░░ │    │
│  │ ░░░░░░░ │  │ ░░░░░░░ │  │ ░░░░░░░ │  │ ░░░░░░░ │    │
│  │ ─────── │  │ ─────── │  │ ─────── │  │ ─────── │    │
│  │ ────    │  │ ────    │  │ ────    │  │ ────    │    │
│  │ ▪       │  │ ▪       │  │ ▪       │  │ ▪       │    │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘    │
│  ┌─────────┐  ┌─────────┐                               │
│  │ ░░░░░░░ │  │ ░░░░░░░ │                               │
│  │ ...     │  │ ...     │                               │
│  └─────────┘  └─────────┘                               │
└─────────────────────────────────────────────────────────┘
```

**List Skeleton Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ ┌──┐  ─────────────  ────────  ────  ────  ▪ ▪ ▪       │
├─────────────────────────────────────────────────────────┤
│ ┌──┐  ─────────────  ────────  ────  ────  ▪ ▪ ▪       │
├─────────────────────────────────────────────────────────┤
│ ┌──┐  ─────────────  ────────  ────  ────  ▪ ▪ ▪       │
└─────────────────────────────────────────────────────────┘
```

---

### Task 1.7.3: Add Type Definitions

**File:** `src/components/ItemManager/ItemManager.types.ts`

**Additions:**
```typescript
// Add to existing types file

export interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export interface LoadingStateProps {
  viewMode?: 'grid' | 'list';
  itemCount?: number;
  className?: string;
}
```

---

### Task 1.7.4: Integrate into ItemManager

**File:** `src/components/ItemManager/ItemManager.tsx`

**Modifications:**
1. Import `EmptyState` and `LoadingState` components
2. Add conditional rendering logic before main content
3. Support render prop overrides (`renderEmptyState`, `renderLoadingState`)
4. Pass `viewMode` from state to `LoadingState`
5. Pass labels from `config.labels` to `EmptyState`
6. Apply `classNames.emptyState` and `classNames.loadingState`

**Integration Pattern:**
```tsx
// In ItemManager.tsx render logic
const {
  items,
  loading,
  error,
  config,
  classNames,
  renderEmptyState,
  renderLoadingState,
  renderErrorState,
} = props;

const { viewMode } = state;
const labels = config?.labels ?? DEFAULT_LABELS;

// Loading state
if (loading) {
  if (renderLoadingState) {
    return renderLoadingState();
  }
  return (
    <LoadingState
      viewMode={viewMode}
      className={classNames?.loadingState}
    />
  );
}

// Error state (if applicable)
if (error) {
  if (renderErrorState) {
    return renderErrorState(error);
  }
  // Default error UI
}

// Empty state
if (items.length === 0) {
  if (renderEmptyState) {
    return renderEmptyState();
  }
  return (
    <EmptyState
      title={labels.emptyStateTitle}
      description={labels.emptyStateDescription}
      className={classNames?.emptyState}
    />
  );
}

// Normal content rendering...
```

---

### Task 1.7.5: Update Barrel Exports

**File:** `src/components/ItemManager/index.ts`

**Additions:**
```typescript
// Add to existing exports
export { EmptyState } from './components/shared/EmptyState';
export { LoadingState } from './components/shared/LoadingState';
export type { EmptyStateProps, LoadingStateProps } from './ItemManager.types';
```

---

## Authorized Files and Functions for Modification

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemManager/components/shared/EmptyState.tsx` | Empty state component |
| `src/components/ItemManager/components/shared/LoadingState.tsx` | Loading skeleton component |

### Files to Modify

| File Path | Modification |
|-----------|--------------|
| `src/components/ItemManager/ItemManager.types.ts` | Add `EmptyStateProps`, `LoadingStateProps` interfaces |
| `src/components/ItemManager/ItemManager.tsx` | Add conditional rendering for loading/empty states |
| `src/components/ItemManager/index.ts` | Export new components and types |

### Functions/Sections to Modify

| File | Function/Section | Change |
|------|------------------|--------|
| `ItemManager.tsx` | Render function | Add conditional checks before content rendering |
| `ItemManager.types.ts` | Types section | Add new interface definitions |
| `index.ts` | Export statements | Add new exports |

---

## Styling Guidelines

### Color Palette (Consistent with Codebase)

| Element | Tailwind Classes |
|---------|------------------|
| Skeleton background | `bg-gray-200` |
| Icon container (empty) | `text-gray-400` |
| Title text | `text-lg font-medium text-gray-900` |
| Description text | `text-gray-600` |
| CTA button (if present) | `bg-blue-600 text-white hover:bg-blue-700` |

### Animation Classes

| Animation | Tailwind Class | Usage |
|-----------|----------------|-------|
| Skeleton pulse | `animate-pulse` | LoadingState skeleton elements |
| Spinner rotation | `animate-spin` | Alternative simple loading indicator |

### Responsive Grid for Loading Skeleton

```css
/* Grid skeleton responsive layout */
.loading-grid {
  @apply grid gap-4;
  @apply grid-cols-1;       /* Mobile: 1 column */
  @apply sm:grid-cols-2;    /* Small: 2 columns */
  @apply lg:grid-cols-3;    /* Large: 3 columns */
  @apply xl:grid-cols-4;    /* XL: 4 columns */
}
```

---

## Acceptance Criteria Mapping

| Acceptance Criteria | Implementation |
|--------------------|----------------|
| Empty state displays clear message | `EmptyState` with configurable `title` and `description` |
| Loading state shows skeleton animation | `LoadingState` with `animate-pulse` matching content layout |
| Visually consistent with design system | Follows Tailwind patterns from existing components |
| Smooth transition to content | Standard React conditional rendering (no explicit animation needed) |
| Actionable next steps in empty state | Optional `action` prop for CTA buttons |

---

## Dependencies

### Internal Dependencies

| Dependency | Status | Required For |
|------------|--------|--------------|
| Task 1.1 - Directory structure | Must be complete | File locations |
| Task 1.3 - ItemManager shell | Must be complete | Integration point |
| `cn()` utility | Exists | Class merging |

### External Dependencies

| Package | Version | Usage |
|---------|---------|-------|
| lucide-react | 0.525.0 | Icon components (Package, FolderOpen, Search) |
| clsx | existing | Class name utilities |
| tailwind-merge | existing | Class merging |

---

## Testing Considerations

### Manual Testing Checklist

- [ ] EmptyState displays correctly with default labels
- [ ] EmptyState displays correctly with custom labels
- [ ] EmptyState displays correctly with action button
- [ ] EmptyState applies custom className
- [ ] LoadingState displays grid skeleton when viewMode='grid'
- [ ] LoadingState displays list skeleton when viewMode='list'
- [ ] LoadingState respects custom itemCount
- [ ] LoadingState skeleton animation runs smoothly
- [ ] Loading → Content transition is seamless
- [ ] Loading → Empty transition is seamless
- [ ] renderEmptyState override works correctly
- [ ] renderLoadingState override works correctly

### Component Isolation Testing

Both components should be testable in isolation via the test harness:

```tsx
// In test page
<div className="space-y-8">
  <section>
    <h2>Empty State - Default</h2>
    <EmptyState />
  </section>

  <section>
    <h2>Empty State - Custom</h2>
    <EmptyState
      title="No results found"
      description="Try adjusting your search or filters"
      icon={<Search className="w-12 h-12" />}
      action={
        <button className="btn-primary">Clear Filters</button>
      }
    />
  </section>

  <section>
    <h2>Loading State - Grid</h2>
    <LoadingState viewMode="grid" itemCount={4} />
  </section>

  <section>
    <h2>Loading State - List</h2>
    <LoadingState viewMode="list" itemCount={3} />
  </section>
</div>
```

---

## References

- Implementation Plan: `/docs/prd/item-capture-manager-implementation-plan.md`
- Existing Skeleton Pattern: `src/components/AnalyticsSkeleton.tsx`
- Existing Empty State Pattern: `src/components/ItemsManagement.tsx:278-301`
- Existing Loading Pattern: `src/components/ItemsManagement.tsx:171-181`
- Utility Functions: `src/lib/utils.ts`

---

## Appendix A: Code Templates

### EmptyState.tsx Template

```tsx
'use client';

import { Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { EmptyStateProps } from '../../ItemManager.types';

const DEFAULT_TITLE = 'No items yet';
const DEFAULT_DESCRIPTION = 'Create your first item to get started';

export function EmptyState({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('text-center py-12', className)}>
      <div className="text-gray-400 mb-4">
        {icon ?? <Package className="w-12 h-12 mx-auto" />}
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-gray-600 mb-6">
        {description}
      </p>
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  );
}
```

### LoadingState.tsx Template

```tsx
'use client';

import { cn } from '@/lib/utils';
import type { LoadingStateProps } from '../../ItemManager.types';

const DEFAULT_GRID_COUNT = 6;
const DEFAULT_LIST_COUNT = 5;

export function LoadingState({
  viewMode = 'grid',
  itemCount,
  className,
}: LoadingStateProps) {
  const count = itemCount ?? (viewMode === 'grid' ? DEFAULT_GRID_COUNT : DEFAULT_LIST_COUNT);

  if (viewMode === 'list') {
    return (
      <div className={cn('animate-pulse space-y-2', className)}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
            <div className="w-12 h-12 bg-gray-200 rounded" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
            <div className="flex space-x-2">
              <div className="w-8 h-8 bg-gray-200 rounded" />
              <div className="w-8 h-8 bg-gray-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn(
      'animate-pulse grid gap-4',
      'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
      className
    )}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="aspect-video bg-gray-200" />
          <div className="p-4 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
            <div className="flex space-x-2 mt-2">
              <div className="h-5 bg-gray-200 rounded-full w-16" />
              <div className="h-5 bg-gray-200 rounded-full w-12" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

*End of Document*
