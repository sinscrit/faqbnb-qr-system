# REQ-061: Detailed Task Breakdown - Empty and Loading State Components

**Document Generated:** 2026-01-03T14:25:00-05:00
**Last Modified:** 2026-01-03T14:25:00-05:00
**Request Reference:** `/docs/gen_requests.md` - Request #061
**Overview Document:** `/docs/REQ-061-implement-empty-and-loading-states-overview.md`
**Implementation Plan Reference:** `/docs/prd/item-capture-manager-implementation-plan.md`
**Phase:** 1 - Foundation
**Task ID:** 1.7

---

## Executive Summary

This document provides granular, actionable implementation tasks for creating the `EmptyState.tsx` and `LoadingState.tsx` components within the ItemManager component. Each task is scoped to approximately 1 story point (a few hours of focused work) with clear verification steps.

### Component Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| Task 1.1 - Directory Structure | Must be complete | `/src/components/ItemManager/` must exist |
| Task 1.3 - ItemManager Shell | Must be complete | Main component for integration |
| `cn()` utility | Exists | Located at `src/lib/utils.ts` |
| Lucide React icons | Exists | Package already installed (0.525.0) |

---

## Authorized Files for Modification

### Files to Create

| # | File Path | Purpose |
|---|-----------|---------|
| 1 | `src/components/ItemManager/components/shared/EmptyState.tsx` | Empty state display component |
| 2 | `src/components/ItemManager/components/shared/LoadingState.tsx` | Skeleton loading component |

### Files to Modify

| # | File Path | Modification |
|---|-----------|--------------|
| 1 | `src/components/ItemManager/ItemManager.types.ts` | Add `EmptyStateProps` and `LoadingStateProps` interfaces |
| 2 | `src/components/ItemManager/ItemManager.tsx` | Integrate conditional rendering for loading/empty states |
| 3 | `src/components/ItemManager/index.ts` | Add exports for new components and types |

---

## Detailed Tasks

### Task 1.7.1: Add Type Definitions to ItemManager.types.ts

**Effort:** ~30 minutes
**Dependencies:** Task 1.1 complete (types file exists)

#### Description
Add TypeScript interface definitions for the EmptyState and LoadingState component props to the existing types file.

#### Implementation Steps

1. Open `src/components/ItemManager/ItemManager.types.ts`
2. Add the `EmptyStateProps` interface after existing type definitions:
   ```typescript
   /**
    * Props for the EmptyState component.
    * Displays when the item collection is empty.
    */
   export interface EmptyStateProps {
     /** Title text for empty state (default: "No items yet") */
     title?: string;
     /** Description text for empty state (default: "Create your first item to get started") */
     description?: string;
     /** Custom icon component to display (default: Package icon) */
     icon?: React.ReactNode;
     /** Call-to-action element (button, link, etc.) */
     action?: React.ReactNode;
     /** Additional CSS classes for styling customization */
     className?: string;
   }
   ```

3. Add the `LoadingStateProps` interface:
   ```typescript
   /**
    * Props for the LoadingState component.
    * Displays skeleton animation while content is loading.
    */
   export interface LoadingStateProps {
     /** View mode to determine skeleton layout ('grid' | 'list') */
     viewMode?: 'grid' | 'list';
     /** Number of skeleton items to display (default: 6 for grid, 5 for list) */
     itemCount?: number;
     /** Additional CSS classes for styling customization */
     className?: string;
   }
   ```

#### Verification Steps
- [ ] TypeScript compilation succeeds with `npm run build` or `npx tsc --noEmit`
- [ ] Both interfaces are exported from the types file
- [ ] JSDoc comments are present for all props
- [ ] Types align with the implementation plan specification

---

### Task 1.7.2: Create EmptyState Component

**Effort:** ~1.5 hours
**Dependencies:** Task 1.7.1 complete (types exist)

#### Description
Create the EmptyState component that displays when no items are available. Component follows patterns from `src/components/ItemsManagement.tsx:278-301`.

#### Implementation Steps

1. Create file `src/components/ItemManager/components/shared/EmptyState.tsx`

2. Implement the component:
   ```typescript
   'use client';

   import { Package } from 'lucide-react';
   import { cn } from '@/lib/utils';
   import type { EmptyStateProps } from '../../ItemManager.types';

   /** Default labels for empty state */
   const DEFAULT_TITLE = 'No items yet';
   const DEFAULT_DESCRIPTION = 'Create your first item to get started';

   /**
    * EmptyState displays a friendly message when no items exist.
    * Supports customizable title, description, icon, and action CTA.
    */
   export function EmptyState({
     title = DEFAULT_TITLE,
     description = DEFAULT_DESCRIPTION,
     icon,
     action,
     className,
   }: EmptyStateProps) {
     return (
       <div className={cn('text-center py-12', className)}>
         {/* Icon container */}
         <div className="text-gray-400 mb-4 flex justify-center">
           {icon ?? <Package className="w-12 h-12" />}
         </div>

         {/* Title */}
         <h3 className="text-lg font-medium text-gray-900 mb-2">
           {title}
         </h3>

         {/* Description */}
         <p className="text-gray-600 mb-6 max-w-md mx-auto">
           {description}
         </p>

         {/* Optional action CTA */}
         {action && (
           <div className="mt-4">
             {action}
           </div>
         )}
       </div>
     );
   }
   ```

3. Ensure the `shared` directory exists:
   - Path: `src/components/ItemManager/components/shared/`
   - Create if not already present from previous tasks

#### Styling Guidelines

| Element | Tailwind Classes | Notes |
|---------|------------------|-------|
| Container | `text-center py-12` | Vertical padding, centered text |
| Icon | `text-gray-400 mb-4` | Muted color, spacing below |
| Title | `text-lg font-medium text-gray-900 mb-2` | Matches existing pattern |
| Description | `text-gray-600 mb-6 max-w-md mx-auto` | Constrained width for readability |
| Action container | `mt-4` | Spacing above action |

#### Verification Steps
- [ ] Component renders without errors in isolation
- [ ] Default props display correctly (Package icon, default title/description)
- [ ] Custom title and description override defaults
- [ ] Custom icon renders correctly
- [ ] Action slot renders provided element
- [ ] Custom className is applied to container
- [ ] TypeScript types are correctly inferred

---

### Task 1.7.3: Create LoadingState Component - Grid Skeleton

**Effort:** ~1.5 hours
**Dependencies:** Task 1.7.1 complete (types exist)

#### Description
Create the LoadingState component with grid view skeleton animation. Component follows patterns from `src/components/AnalyticsSkeleton.tsx`.

#### Implementation Steps

1. Create file `src/components/ItemManager/components/shared/LoadingState.tsx`

2. Implement the component with grid skeleton:
   ```typescript
   'use client';

   import { cn } from '@/lib/utils';
   import type { LoadingStateProps } from '../../ItemManager.types';

   /** Default skeleton item counts per view mode */
   const DEFAULT_GRID_COUNT = 6;
   const DEFAULT_LIST_COUNT = 5;

   /**
    * Skeleton card for grid view loading state.
    * Matches the visual structure of ItemCard component.
    */
   function GridSkeletonCard() {
     return (
       <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
         {/* Thumbnail placeholder - 16:9 aspect ratio */}
         <div className="aspect-video bg-gray-200" />

         {/* Content area */}
         <div className="p-4 space-y-3">
           {/* Title line - 70% width */}
           <div className="h-4 bg-gray-200 rounded w-3/4" />

           {/* Subtitle/metadata line - 50% width */}
           <div className="h-3 bg-gray-200 rounded w-1/2" />

           {/* Badge placeholders */}
           <div className="flex gap-2 pt-1">
             <div className="h-5 bg-gray-200 rounded-full w-16" />
             <div className="h-5 bg-gray-200 rounded-full w-12" />
           </div>
         </div>
       </div>
     );
   }

   /**
    * Skeleton row for list view loading state.
    * Matches the visual structure of ItemRow component.
    */
   function ListSkeletonRow() {
     return (
       <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg bg-white">
         {/* Thumbnail placeholder - square */}
         <div className="w-12 h-12 bg-gray-200 rounded flex-shrink-0" />

         {/* Content area */}
         <div className="flex-1 space-y-2 min-w-0">
           {/* Title line - 75% width */}
           <div className="h-4 bg-gray-200 rounded w-3/4" />
           {/* Metadata line - 50% width */}
           <div className="h-3 bg-gray-200 rounded w-1/2" />
         </div>

         {/* Action buttons placeholder */}
         <div className="flex gap-2 flex-shrink-0">
           <div className="w-8 h-8 bg-gray-200 rounded" />
           <div className="w-8 h-8 bg-gray-200 rounded" />
         </div>
       </div>
     );
   }

   /**
    * LoadingState displays skeleton animation while content is loading.
    * Supports both grid and list view modes with appropriate skeletons.
    */
   export function LoadingState({
     viewMode = 'grid',
     itemCount,
     className,
   }: LoadingStateProps) {
     const count = itemCount ?? (viewMode === 'grid' ? DEFAULT_GRID_COUNT : DEFAULT_LIST_COUNT);

     if (viewMode === 'list') {
       return (
         <div className={cn('animate-pulse space-y-2', className)}>
           {Array.from({ length: count }).map((_, index) => (
             <ListSkeletonRow key={index} />
           ))}
         </div>
       );
     }

     // Grid view (default)
     return (
       <div
         className={cn(
           'animate-pulse grid gap-4',
           'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
           className
         )}
       >
         {Array.from({ length: count }).map((_, index) => (
           <GridSkeletonCard key={index} />
         ))}
       </div>
     );
   }
   ```

#### Styling Guidelines

| Element | Tailwind Classes | Notes |
|---------|------------------|-------|
| Animation | `animate-pulse` | Standard Tailwind pulse animation |
| Skeleton background | `bg-gray-200` | Consistent with AnalyticsSkeleton |
| Grid container | `grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4` | Responsive columns |
| List container | `space-y-2` | Vertical spacing between rows |
| Card border | `border border-gray-200 rounded-lg` | Matches ItemCard style |

#### Verification Steps
- [ ] Grid skeleton displays with correct responsive column layout
- [ ] List skeleton displays vertically stacked rows
- [ ] `animate-pulse` animation is visible and smooth
- [ ] Default itemCount is applied correctly (6 for grid, 5 for list)
- [ ] Custom itemCount overrides default
- [ ] Custom className is applied to container
- [ ] TypeScript types are correctly inferred

---

### Task 1.7.4: Update Barrel Exports in index.ts

**Effort:** ~15 minutes
**Dependencies:** Tasks 1.7.2 and 1.7.3 complete

#### Description
Add exports for the new EmptyState and LoadingState components and their types to the ItemManager barrel export file.

#### Implementation Steps

1. Open `src/components/ItemManager/index.ts`

2. Add component exports:
   ```typescript
   // Existing exports...

   // Empty and Loading state components
   export { EmptyState } from './components/shared/EmptyState';
   export { LoadingState } from './components/shared/LoadingState';
   ```

3. Add type exports (if not already re-exported from types file):
   ```typescript
   // Type exports
   export type {
     // Existing type exports...
     EmptyStateProps,
     LoadingStateProps,
   } from './ItemManager.types';
   ```

#### Verification Steps
- [ ] `EmptyState` can be imported from `@/components/ItemManager`
- [ ] `LoadingState` can be imported from `@/components/ItemManager`
- [ ] `EmptyStateProps` type can be imported from `@/components/ItemManager`
- [ ] `LoadingStateProps` type can be imported from `@/components/ItemManager`
- [ ] No circular dependency warnings

---

### Task 1.7.5: Integrate States into ItemManager Component

**Effort:** ~1.5 hours
**Dependencies:** Tasks 1.7.2, 1.7.3, 1.7.4 complete

#### Description
Modify the main ItemManager component to conditionally render EmptyState and LoadingState based on props. Support render prop overrides for customization.

#### Implementation Steps

1. Open `src/components/ItemManager/ItemManager.tsx`

2. Add imports at the top of the file:
   ```typescript
   import { EmptyState } from './components/shared/EmptyState';
   import { LoadingState } from './components/shared/LoadingState';
   ```

3. Destructure relevant props in the component:
   ```typescript
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
   ```

4. Add default labels constant (if not already present):
   ```typescript
   const DEFAULT_LABELS = {
     emptyStateTitle: 'No items yet',
     emptyStateDescription: 'Create your first item to get started',
   };
   ```

5. Add conditional rendering logic before main content:
   ```typescript
   // Get current view mode from state
   const { viewMode } = state;
   const labels = config?.labels ?? DEFAULT_LABELS;

   // Loading state - render first (takes priority)
   if (loading) {
     if (renderLoadingState) {
       return <>{renderLoadingState()}</>;
     }
     return (
       <LoadingState
         viewMode={viewMode}
         className={classNames?.loadingState}
       />
     );
   }

   // Error state - render if error exists
   if (error) {
     if (renderErrorState) {
       return <>{renderErrorState(error)}</>;
     }
     // Default error UI (can be enhanced later)
     return (
       <div className={cn('text-center py-12', classNames?.emptyState)}>
         <p className="text-red-600">An error occurred: {error.message}</p>
       </div>
     );
   }

   // Empty state - render if no items
   if (!items || items.length === 0) {
     if (renderEmptyState) {
       return <>{renderEmptyState()}</>;
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

6. Ensure the state hook provides `viewMode`:
   - Verify `useItemManagerState` returns `viewMode` in state object
   - Default to `'grid'` if not available

#### Integration Pattern

```
┌─────────────────────────────────────────────────────────────┐
│                      ItemManager                             │
│                                                              │
│   Props: items, loading, error, config.labels, classNames   │
│                                                              │
│   ┌──────────────────────────────────────────────────────┐  │
│   │                  Render Logic                         │  │
│   │                                                       │  │
│   │   1. if (loading)                                     │  │
│   │      → renderLoadingState?.() || <LoadingState />     │  │
│   │                                                       │  │
│   │   2. if (error)                                       │  │
│   │      → renderErrorState?.(error) || <ErrorState />    │  │
│   │                                                       │  │
│   │   3. if (items.length === 0)                          │  │
│   │      → renderEmptyState?.() || <EmptyState />         │  │
│   │                                                       │  │
│   │   4. else                                             │  │
│   │      → <ItemGrid /> or <ItemList />                   │  │
│   └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

#### Verification Steps
- [ ] Loading state displays when `loading={true}`
- [ ] Loading skeleton matches current `viewMode` (grid/list)
- [ ] Empty state displays when `items=[]` and `loading={false}`
- [ ] Empty state uses labels from `config.labels` when provided
- [ ] Error state displays when `error` prop is set
- [ ] Custom `renderLoadingState` override works correctly
- [ ] Custom `renderEmptyState` override works correctly
- [ ] Custom `renderErrorState` override works correctly
- [ ] `classNames.loadingState` is applied to LoadingState
- [ ] `classNames.emptyState` is applied to EmptyState
- [ ] Normal content renders when items exist and not loading

---

### Task 1.7.6: Manual Testing and Verification

**Effort:** ~1 hour
**Dependencies:** All previous tasks complete

#### Description
Verify all components work correctly through manual testing. Use the test harness page if available, or create isolated test scenarios.

#### Test Scenarios

##### EmptyState Component Tests

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| Default rendering | Render `<EmptyState />` with no props | Shows Package icon, default title "No items yet", default description |
| Custom title | Render with `title="Custom Title"` | Displays "Custom Title" as heading |
| Custom description | Render with `description="Custom desc"` | Displays "Custom desc" as paragraph |
| Custom icon | Render with `icon={<Search className="w-12 h-12" />}` | Displays Search icon instead of Package |
| Action button | Render with `action={<button>Add Item</button>}` | Button appears below description |
| Custom className | Render with `className="bg-blue-50"` | Container has blue background |
| Null icon | Render with `icon={null}` | No icon displayed |

##### LoadingState Component Tests

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| Grid default | Render `<LoadingState />` | 6 skeleton cards in responsive grid |
| List mode | Render with `viewMode="list"` | 5 skeleton rows stacked vertically |
| Custom grid count | Render with `viewMode="grid" itemCount={4}` | 4 skeleton cards |
| Custom list count | Render with `viewMode="list" itemCount={3}` | 3 skeleton rows |
| Animation | Observe skeleton elements | Pulse animation is smooth and visible |
| Responsive grid | Resize viewport | Grid columns adjust: 1→2→3→4 columns |
| Custom className | Render with `className="p-8"` | Container has extra padding |

##### ItemManager Integration Tests

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| Loading state shown | Pass `loading={true}` | LoadingState component displays |
| Empty state shown | Pass `items={[]} loading={false}` | EmptyState component displays |
| Content shown | Pass `items={[...]}` with data | Normal item display (grid/list) |
| View mode sync | Toggle view mode while loading | Skeleton matches current view mode |
| Custom empty render | Pass `renderEmptyState={() => <div>Custom</div>}` | Custom empty state renders |
| Custom loading render | Pass `renderLoadingState={() => <div>Loading...</div>}` | Custom loading state renders |
| Label override | Pass `config={{ labels: { emptyStateTitle: 'Empty!' } }}` | Empty state shows "Empty!" |

#### Test Harness Code (Optional)

If a test page exists at `/test/item-manager/page.tsx`, add these test sections:

```tsx
{/* Empty State Tests */}
<section className="mb-8 p-4 border rounded-lg">
  <h2 className="text-xl font-bold mb-4">Empty State Variants</h2>

  <div className="space-y-6">
    <div>
      <h3 className="font-medium mb-2">Default</h3>
      <EmptyState />
    </div>

    <div>
      <h3 className="font-medium mb-2">Custom Content</h3>
      <EmptyState
        title="No results found"
        description="Try adjusting your search or filters"
        icon={<Search className="w-12 h-12" />}
        action={
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Clear Filters
          </button>
        }
      />
    </div>
  </div>
</section>

{/* Loading State Tests */}
<section className="mb-8 p-4 border rounded-lg">
  <h2 className="text-xl font-bold mb-4">Loading State Variants</h2>

  <div className="space-y-6">
    <div>
      <h3 className="font-medium mb-2">Grid View (default)</h3>
      <LoadingState viewMode="grid" itemCount={4} />
    </div>

    <div>
      <h3 className="font-medium mb-2">List View</h3>
      <LoadingState viewMode="list" itemCount={3} />
    </div>
  </div>
</section>
```

#### Verification Checklist

- [ ] All EmptyState test cases pass
- [ ] All LoadingState test cases pass
- [ ] All ItemManager integration test cases pass
- [ ] No TypeScript errors in browser console
- [ ] No React warnings in browser console
- [ ] Animation runs at 60fps (no jank)
- [ ] Components render correctly on mobile viewport (375px width)
- [ ] Components render correctly on desktop viewport (1920px width)

---

## Task Summary Table

| Task ID | Title | Effort | Dependencies | Verification |
|---------|-------|--------|--------------|--------------|
| 1.7.1 | Add Type Definitions | ~30 min | 1.1 | TypeScript compiles |
| 1.7.2 | Create EmptyState Component | ~1.5 hrs | 1.7.1 | Component renders |
| 1.7.3 | Create LoadingState Component | ~1.5 hrs | 1.7.1 | Skeleton animates |
| 1.7.4 | Update Barrel Exports | ~15 min | 1.7.2, 1.7.3 | Imports work |
| 1.7.5 | Integrate into ItemManager | ~1.5 hrs | 1.7.4 | Conditional rendering works |
| 1.7.6 | Manual Testing | ~1 hr | 1.7.5 | All tests pass |

**Total Estimated Effort:** ~6 hours

---

## Acceptance Criteria Checklist

| Criteria | Implementation | Status |
|----------|----------------|--------|
| Empty state displays clear message | EmptyState with configurable title/description | [ ] |
| Loading state shows skeleton animation | LoadingState with `animate-pulse` | [ ] |
| Skeleton matches content layout | Grid/List view modes | [ ] |
| Visually consistent with design system | Uses existing Tailwind patterns | [ ] |
| Smooth transition to content | React conditional rendering | [ ] |
| Actionable next steps in empty state | Optional action prop slot | [ ] |
| Render props for customization | renderEmptyState, renderLoadingState | [ ] |
| Custom className support | className prop on both components | [ ] |
| TypeScript type safety | Full interface definitions | [ ] |

---

## References

- **Overview Document:** `/docs/REQ-061-implement-empty-and-loading-states-overview.md`
- **Implementation Plan:** `/docs/prd/item-capture-manager-implementation-plan.md`
- **Skeleton Pattern Reference:** `src/components/AnalyticsSkeleton.tsx`
- **Empty State Pattern Reference:** `src/components/ItemsManagement.tsx:278-301`
- **Loading State Pattern Reference:** `src/components/ItemsManagement.tsx:171-181`
- **Utility Functions:** `src/lib/utils.ts` (cn function)

---

*End of Document*
