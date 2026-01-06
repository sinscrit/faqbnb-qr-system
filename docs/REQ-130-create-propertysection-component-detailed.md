# REQ-130: Create PropertySection Component - Detailed Task Breakdown

**Created:** 2026-01-06 21:45:00 UTC
**Last Modified:** 2026-01-06 22:45:00 UTC
**Implementation Status:** COMPLETE
**Request Reference:** REQ-130 in docs/gen_requests.md
**Overview Document:** docs/REQ-130-create-propertysection-component-overview.md
**Plan Reference:** docs/prd/Plan-001-Simple-Dashboard-Implementation-REVISED.md (Phase 4, Task 4.1)

---

## Executive Summary

This document provides a detailed, step-by-step task breakdown for implementing the PropertySection component for Dashboard 2. Each task is scoped to approximately 1 story point (a few hours of focused work) and includes specific verification steps.

**Total Tasks:** 8
**Estimated Effort:** 2-3 hours

---

## Task Dependencies Graph

```
Task 1 (Create PropertySection.tsx)
    │
    ├── Task 2 (PropertyRow sub-component)
    │       │
    │       └── Task 3 (PropertyRow accessibility)
    │
    ├── Task 4 (Loading skeleton)
    │
    ├── Task 5 (Empty state)
    │
    └── Task 6 (Main PropertySection component)
            │
            └── Task 7 (Update index.ts exports)
                    │
                    └── Task 8 (Integrate into Dashboard page)
```

---

## Authorized Files for Modification

### Files to CREATE

| File Path | Purpose |
|-----------|---------|
| `src/components/SimpleDashboard/PropertySection.tsx` | Main PropertySection component |

### Files to MODIFY

| File Path | Lines/Functions | Purpose |
|-----------|-----------------|---------|
| `src/components/SimpleDashboard/index.ts` | Add 2 export lines after line 11 | Export PropertySection |
| `src/app/dashboard2/page.tsx` | Add import (line 14), render component (after line 35) | Integrate PropertySection |

### Files to READ (Reference Only - DO NOT MODIFY)

| File Path | Purpose |
|-----------|---------|
| `src/components/SimpleDashboard/StatisticsCards.tsx` | Pattern: component structure, loading skeleton |
| `src/components/SimpleDashboard/ActionButtons.tsx` | Pattern: button styling, accessibility, keyboard navigation |
| `src/types/index.ts` (lines 64-76) | Property interface definition |
| `src/contexts/AuthContext.tsx` | useAuth hook, userProperties data source |

---

## Detailed Tasks

### Task 1: Create PropertySection.tsx File with Header and Imports

**File:** `src/components/SimpleDashboard/PropertySection.tsx`

**Description:** Create the component file with proper header comments, 'use client' directive, and all required imports.

**Implementation Steps:**

1. Create file `src/components/SimpleDashboard/PropertySection.tsx`
2. Add header comment block:
   ```typescript
   // src/components/SimpleDashboard/PropertySection.tsx
   // REQ-130: PropertySection Component for Dashboard 2
   // Created: 2026-01-06
   // Last Modified: 2026-01-06
   ```
3. Add `'use client';` directive
4. Add imports:
   ```typescript
   import { ChevronRight, Home, Plus } from 'lucide-react';
   import { useAuth } from '@/contexts/AuthContext';
   import { Property } from '@/types';
   ```

**Verification:**
- [ ] File created at correct path
- [ ] Header comment includes REQ-130 reference
- [ ] 'use client' directive is first non-comment line
- [ ] All imports are valid (no TypeScript errors)

**Estimated Effort:** 10 minutes

---

### Task 2: Implement PropertyRow Sub-component

**File:** `src/components/SimpleDashboard/PropertySection.tsx`

**Description:** Create the PropertyRow internal component that displays a single property with name and chevron icon.

**Implementation Steps:**

1. Define `PropertyRowProps` interface:
   ```typescript
   /**
    * Props for PropertyRow sub-component
    */
   interface PropertyRowProps {
     /** Property data to display */
     property: Property;
     /** Callback when row is clicked */
     onClick: (property: Property) => void;
   }
   ```

2. Implement `PropertyRow` component:
   ```typescript
   /**
    * Individual property row with click interaction
    * Displays property nickname and chevron icon
    */
   function PropertyRow({ property, onClick }: PropertyRowProps) {
     const handleClick = () => onClick(property);
     const handleKeyDown = (e: React.KeyboardEvent) => {
       if (e.key === 'Enter' || e.key === ' ') {
         e.preventDefault();
         onClick(property);
       }
     };

     return (
       <button
         type="button"
         onClick={handleClick}
         onKeyDown={handleKeyDown}
         className="w-full flex items-center justify-between p-4 bg-white border-b border-[#DDDDDD] last:border-b-0 hover:bg-[#F7F7F7] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#222222] focus-visible:ring-inset"
         aria-label={`Edit property: ${property.nickname}`}
       >
         <span className="text-[#222222] font-medium">
           {property.nickname}
         </span>
         <ChevronRight className="w-5 h-5 text-[#717171]" />
       </button>
     );
   }
   ```

**Airbnb Design System Compliance:**
- Text color: `text-[#222222]` (Primary Text)
- Border color: `border-[#DDDDDD]` (Border token)
- Hover background: `hover:bg-[#F7F7F7]`
- Icon color: `text-[#717171]` (Secondary Text)

**Verification:**
- [ ] PropertyRow renders property nickname
- [ ] Chevron icon displays on right side
- [ ] Hover state applies background color change
- [ ] Click triggers onClick callback with property data
- [ ] TypeScript compiles without errors

**Estimated Effort:** 20 minutes

---

### Task 3: Add Accessibility Features to PropertyRow

**File:** `src/components/SimpleDashboard/PropertySection.tsx`

**Description:** Ensure PropertyRow meets WCAG 2.1 AA requirements with keyboard navigation and screen reader support.

**Implementation Steps:**

1. Verify `<button>` element is used (not `<div>`) - already done in Task 2
2. Add `aria-label` with property name - already done in Task 2
3. Verify keyboard handlers for Enter and Space keys - already done in Task 2
4. Add focus-visible ring styling:
   ```css
   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#222222] focus-visible:ring-inset
   ```
5. Verify minimum touch target of 48px (p-4 = 16px padding, should be verified visually)

**Verification:**
- [ ] Tab key can navigate to each property row
- [ ] Enter key activates property row click
- [ ] Space key activates property row click
- [ ] Focus ring is visible when focused via keyboard
- [ ] Screen reader announces "Edit property: {name}" when focused
- [ ] Touch target meets 48px minimum height

**Estimated Effort:** 10 minutes

---

### Task 4: Implement LoadingSkeleton Sub-component

**File:** `src/components/SimpleDashboard/PropertySection.tsx`

**Description:** Create loading skeleton component following the pattern from StatisticsCards.tsx.

**Implementation Steps:**

1. Implement `LoadingSkeleton` component:
   ```typescript
   /**
    * Loading skeleton for PropertySection
    * Shows shimmer animation while property data loads
    */
   function LoadingSkeleton() {
     return (
       <div className="bg-white rounded-xl shadow-sm overflow-hidden">
         {/* Header skeleton */}
         <div className="p-4 border-b border-[#DDDDDD]">
           <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
         </div>

         {/* Property row skeletons */}
         {[1, 2].map((i) => (
           <div
             key={i}
             className="flex items-center justify-between p-4 border-b border-[#DDDDDD] last:border-b-0"
           >
             <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />
             <div className="h-5 w-5 bg-gray-200 rounded animate-pulse" />
           </div>
         ))}

         {/* Add button skeleton */}
         <div className="p-4">
           <div className="h-12 w-full bg-gray-200 rounded-lg animate-pulse" />
         </div>
       </div>
     );
   }
   ```

**Pattern Reference:** `src/components/SimpleDashboard/StatisticsCards.tsx` lines 82-101

**Verification:**
- [ ] Skeleton renders 2 placeholder rows
- [ ] Shimmer animation (`animate-pulse`) is visible
- [ ] Layout matches PropertySection structure
- [ ] Uses gray-200 background for skeleton elements

**Estimated Effort:** 15 minutes

---

### Task 5: Implement EmptyState Sub-component

**File:** `src/components/SimpleDashboard/PropertySection.tsx`

**Description:** Create empty state component when user has no properties.

**Implementation Steps:**

1. Implement `EmptyState` component:
   ```typescript
   /**
    * Empty state when user has no properties
    * Displays friendly message and encourages adding first property
    */
   function EmptyState() {
     return (
       <div className="text-center py-8 px-4">
         <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
           <Home className="w-6 h-6 text-[#717171]" />
         </div>
         <p className="text-[#222222] font-medium mb-1">No properties yet</p>
         <p className="text-[#717171] text-sm">
           Add your first property to get started
         </p>
       </div>
     );
   }
   ```

**Airbnb Design System Compliance:**
- Primary text: `text-[#222222]`
- Secondary text: `text-[#717171]`
- Icon background: `bg-gray-100`

**Verification:**
- [ ] Home icon displays centered
- [ ] "No properties yet" message displays
- [ ] Helper text displays below main message
- [ ] Styling matches Airbnb design system

**Estimated Effort:** 10 minutes

---

### Task 6: Implement Main PropertySection Component

**File:** `src/components/SimpleDashboard/PropertySection.tsx`

**Description:** Implement the main PropertySection component that composes all sub-components.

**Implementation Steps:**

1. Define `PropertySectionProps` interface:
   ```typescript
   /**
    * Props for the main PropertySection component
    */
   export interface PropertySectionProps {
     /** Optional callback when property is selected for editing */
     onPropertyEdit?: (property: Property) => void;
     /** Optional callback when add property is clicked */
     onAddProperty?: () => void;
     /** Optional additional CSS classes */
     className?: string;
   }
   ```

2. Implement `PropertySection` component:
   ```typescript
   /**
    * Property section for Dashboard 2 displaying user's properties
    *
    * Features:
    * - Dynamic heading ("My Property" vs "My Properties")
    * - Clickable property rows with edit navigation
    * - "Add New Property" button
    * - Loading skeleton state
    * - Empty state for new users
    * - Full keyboard accessibility
    *
    * @param onPropertyEdit - Callback when property row is clicked
    * @param onAddProperty - Callback when Add button is clicked
    * @param className - Optional additional CSS classes
    */
   export function PropertySection({
     onPropertyEdit,
     onAddProperty,
     className = '',
   }: PropertySectionProps) {
     const { userProperties, isLoading } = useAuth();

     // Dynamic heading based on property count
     const headingText = userProperties?.length === 1 ? 'My Property' : 'My Properties';

     // Handle property row click
     const handlePropertyClick = (property: Property) => {
       if (onPropertyEdit) {
         onPropertyEdit(property);
       } else {
         // Placeholder: Log warning until edit modal is implemented (Task 4.2)
         console.warn('[PropertySection] onPropertyEdit not provided. Property:', property.id);
       }
     };

     // Handle add property button click
     const handleAddClick = () => {
       if (onAddProperty) {
         onAddProperty();
       } else {
         // Placeholder: Log warning until add modal is implemented (Task 4.3)
         console.warn('[PropertySection] onAddProperty not provided');
       }
     };

     // Show loading skeleton
     if (isLoading) {
       return <LoadingSkeleton />;
     }

     const hasProperties = userProperties && userProperties.length > 0;

     return (
       <section
         className={`bg-white rounded-xl shadow-sm overflow-hidden ${className}`}
         aria-labelledby="property-section-heading"
       >
         {/* Section Header */}
         <h2
           id="property-section-heading"
           className="text-lg font-semibold text-[#222222] p-4 border-b border-[#DDDDDD]"
         >
           {headingText}
         </h2>

         {/* Property List or Empty State */}
         {hasProperties ? (
           <div role="list" aria-label="Your properties">
             {userProperties.map((property) => (
               <PropertyRow
                 key={property.id}
                 property={property}
                 onClick={handlePropertyClick}
               />
             ))}
           </div>
         ) : (
           <EmptyState />
         )}

         {/* Add Property Button */}
         <div className="p-4 border-t border-[#DDDDDD]">
           <button
             type="button"
             onClick={handleAddClick}
             className="w-full flex items-center justify-center gap-2 min-h-[48px] px-6 py-3.5 rounded-lg font-medium text-base bg-gradient-to-r from-[#E61E4D] to-[#D70466] text-white transition-all duration-200 ease-out hover:scale-[1.02] hover:brightness-95 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#222222] focus-visible:ring-offset-2"
             aria-label="Add a new property"
           >
             <Plus className="w-5 h-5" />
             <span>Add New Property</span>
           </button>
         </div>
       </section>
     );
   }
   ```

**Acceptance Criteria Mapping:**
- [x] A PropertySection component is displayed on Dashboard 2
- [x] Section heading displays "My Property" when exactly one property
- [x] Section heading displays "My Properties" when two or more properties
- [x] Each property appears as a distinct, clickable row
- [x] Each property row displays chevron icon on right side
- [x] Clicking property row navigates to edit view (via callback)
- [x] "Add New Property" button appears below list
- [x] Clicking Add button initiates creation workflow (via callback)
- [x] Component handles loading states
- [x] Component handles empty states
- [x] Component is fully keyboard accessible
- [x] Component follows Airbnb design system

**Verification:**
- [ ] Component renders without TypeScript errors
- [ ] "My Property" displays when userProperties.length === 1
- [ ] "My Properties" displays when userProperties.length !== 1
- [ ] All properties render as PropertyRow components
- [ ] Loading skeleton shows when isLoading is true
- [ ] Empty state shows when userProperties is empty
- [ ] Add button has Airbnb gradient styling
- [ ] ARIA landmarks and labels are present

**Estimated Effort:** 30 minutes

---

### Task 7: Update SimpleDashboard Index Exports

**File:** `src/components/SimpleDashboard/index.ts`

**Description:** Add exports for PropertySection component and its types.

**Implementation Steps:**

1. Open `src/components/SimpleDashboard/index.ts`
2. Add exports after existing lines:
   ```typescript
   export { PropertySection } from './PropertySection';
   export type { PropertySectionProps } from './PropertySection';
   ```

**Current File Content (lines 1-12):**
```typescript
// src/components/SimpleDashboard/index.ts
// REQ-124: StatisticsCards Component
// REQ-126: ActionButtons Component
// Created: 2026-01-06 17:00:00 UTC
// Last Modified: 2026-01-06

export { StatisticsCards } from './StatisticsCards';
export type { StatisticsCardsProps } from './StatisticsCards';

export { ActionButtons } from './ActionButtons';
export type { ActionButtonsProps } from './ActionButtons';
```

**After Modification:**
```typescript
// src/components/SimpleDashboard/index.ts
// REQ-124: StatisticsCards Component
// REQ-126: ActionButtons Component
// REQ-130: PropertySection Component
// Created: 2026-01-06 17:00:00 UTC
// Last Modified: 2026-01-06

export { StatisticsCards } from './StatisticsCards';
export type { StatisticsCardsProps } from './StatisticsCards';

export { ActionButtons } from './ActionButtons';
export type { ActionButtonsProps } from './ActionButtons';

export { PropertySection } from './PropertySection';
export type { PropertySectionProps } from './PropertySection';
```

**Verification:**
- [ ] Import works: `import { PropertySection } from '@/components/SimpleDashboard'`
- [ ] Type import works: `import type { PropertySectionProps } from '@/components/SimpleDashboard'`
- [ ] No TypeScript compilation errors

**Estimated Effort:** 5 minutes

---

### Task 8: Integrate PropertySection into Dashboard Page

**File:** `src/app/dashboard2/page.tsx`

**Description:** Import and render PropertySection component on Dashboard 2 page below ActionButtons.

**Implementation Steps:**

1. Update import statement on line 14:
   ```typescript
   // Before:
   import { StatisticsCards, ActionButtons } from '@/components/SimpleDashboard';

   // After:
   import { StatisticsCards, ActionButtons, PropertySection } from '@/components/SimpleDashboard';
   ```

2. Add PropertySection below ActionButtons (after line 35):
   ```typescript
   {/* Action Buttons - REQ-126 */}
   <ActionButtons />

   {/* Property Section - REQ-130 */}
   <PropertySection
     onPropertyEdit={(property) => {
       // TODO: Implement in Task 4.2 (PropertyEditModal)
       console.log('[Dashboard2] Edit property:', property.id);
     }}
     onAddProperty={() => {
       // TODO: Implement in Task 4.3 (AddPropertyModal)
       console.log('[Dashboard2] Add new property');
     }}
   />
   ```

**Current File Content:**
```typescript
'use client';

/**
 * Dashboard2 Home Page
 * ...
 */

import { useAuth } from '@/contexts/AuthContext';
import { StatisticsCards, ActionButtons } from '@/components/SimpleDashboard';
import { useDashboardStats } from '@/hooks/useDashboardStats';

export default function Dashboard2Page() {
  const { user } = useAuth();
  const { stats, isLoading, error } = useDashboardStats();

  const firstName = user?.email?.split('@')[0] || 'there';

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-[#E61E4D] via-[#E31C5F] to-[#D70466] rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {firstName}!</h1>
        <p className="text-white/80 text-lg">Create and manage your QR code items</p>
      </div>

      {/* Statistics Cards */}
      <StatisticsCards stats={stats} isLoading={isLoading} error={error} />

      {/* Action Buttons - REQ-126 */}
      <ActionButtons />
    </div>
  );
}
```

**After Modification:**
```typescript
'use client';

/**
 * Dashboard2 Home Page
 * REQ-130: Added PropertySection component
 * ...
 */

import { useAuth } from '@/contexts/AuthContext';
import { StatisticsCards, ActionButtons, PropertySection } from '@/components/SimpleDashboard';
import { useDashboardStats } from '@/hooks/useDashboardStats';

export default function Dashboard2Page() {
  const { user } = useAuth();
  const { stats, isLoading, error } = useDashboardStats();

  const firstName = user?.email?.split('@')[0] || 'there';

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-[#E61E4D] via-[#E31C5F] to-[#D70466] rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {firstName}!</h1>
        <p className="text-white/80 text-lg">Create and manage your QR code items</p>
      </div>

      {/* Statistics Cards */}
      <StatisticsCards stats={stats} isLoading={isLoading} error={error} />

      {/* Action Buttons - REQ-126 */}
      <ActionButtons />

      {/* Property Section - REQ-130 */}
      <PropertySection
        onPropertyEdit={(property) => {
          // TODO: Implement in Task 4.2 (PropertyEditModal)
          console.log('[Dashboard2] Edit property:', property.id);
        }}
        onAddProperty={() => {
          // TODO: Implement in Task 4.3 (AddPropertyModal)
          console.log('[Dashboard2] Add new property');
        }}
      />
    </div>
  );
}
```

**Verification:**
- [ ] Dashboard 2 page loads without errors
- [ ] PropertySection renders below ActionButtons
- [ ] Clicking property row logs to console
- [ ] Clicking Add button logs to console
- [ ] Loading skeleton displays during auth loading
- [ ] Empty state displays for users with no properties

**Estimated Effort:** 15 minutes

---

## Testing Checklist

### Unit Test Scenarios

| Test Case | Expected Result | Priority |
|-----------|-----------------|----------|
| Render with 0 properties | Shows "My Properties" heading, empty state, Add button | P0 |
| Render with 1 property | Shows "My Property" heading, 1 row, Add button | P0 |
| Render with 2+ properties | Shows "My Properties" heading, N rows, Add button | P0 |
| Loading state | Shows skeleton animation | P0 |
| Click property row | Calls onPropertyEdit with property data | P0 |
| Click Add button | Calls onAddProperty callback | P0 |
| Keyboard navigation | Tab/Enter/Space work correctly | P1 |
| No callback provided | Logs warning to console | P1 |

### Accessibility Testing

| Test Case | Expected Result |
|-----------|-----------------|
| Tab through elements | Focus moves: heading → each row → Add button |
| Enter on property row | Triggers click handler |
| Space on property row | Triggers click handler |
| Screen reader on heading | Announces "My Property" or "My Properties" |
| Screen reader on row | Announces "Edit property: {name}" |
| Focus visible | Ring appears on focused elements |

### Visual Testing

| Test Case | Expected Result |
|-----------|-----------------|
| Card styling | White background, rounded-xl, shadow-sm |
| Heading | text-lg, font-semibold, text-[#222222] |
| Property rows | Proper hover state (bg-[#F7F7F7]) |
| Add button | Airbnb gradient, white text |
| Loading skeleton | Shimmer animation visible |
| Empty state | Centered icon and text |

---

## Implementation Order

Execute tasks in this order to ensure proper dependencies:

1. **Task 1**: Create file with header and imports
2. **Task 2**: Implement PropertyRow sub-component
3. **Task 3**: Add accessibility features to PropertyRow
4. **Task 4**: Implement LoadingSkeleton sub-component
5. **Task 5**: Implement EmptyState sub-component
6. **Task 6**: Implement main PropertySection component
7. **Task 7**: Update index.ts exports
8. **Task 8**: Integrate into Dashboard page

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| userProperties undefined during loading | Medium | Low | Check `isLoading` from useAuth before accessing properties |
| isLoading not available in AuthContext | Low | High | Fall back to checking if userProperties is undefined |
| Property nickname missing | Low | Medium | Display fallback text or property ID |
| Modal not ready for click | Expected | Low | Use console.log placeholder with clear TODO comments |

---

## Success Criteria

Implementation is complete when:

1. ✅ PropertySection component file exists at `src/components/SimpleDashboard/PropertySection.tsx`
2. ✅ Component exports added to `src/components/SimpleDashboard/index.ts`
3. ✅ Component renders on Dashboard 2 page below ActionButtons
4. ✅ Shows "My Property" for exactly 1 property
5. ✅ Shows "My Properties" for 0 or 2+ properties
6. ✅ Each property row displays nickname and chevron icon
7. ✅ Property rows have proper hover and focus states
8. ✅ Clicking a property row logs to console (placeholder for edit modal)
9. ✅ "Add New Property" button is visible with Airbnb gradient styling
10. ✅ Loading skeleton displays while fetching
11. ✅ Empty state displays with friendly message when no properties
12. ✅ All interactive elements are keyboard accessible
13. ✅ Passes visual review for Airbnb design system compliance
14. ✅ No TypeScript compilation errors
15. ✅ Dashboard 2 page renders without runtime errors

---

## Notes for Implementation Agent

1. **Follow existing patterns**: Use `StatisticsCards.tsx` and `ActionButtons.tsx` as references for component structure and styling
2. **Property interface**: Import `Property` from `@/types` (see `src/types/index.ts` lines 64-76)
3. **useAuth hook**: The `userProperties` array comes from `useAuth()` - check if `isLoading` is available
4. **Placeholder callbacks**: Use `console.log` with descriptive messages until PropertyEditModal (Task 4.2) and AddPropertyModal (Task 4.3) are implemented
5. **Touch targets**: Ensure all clickable elements have minimum 48px height for accessibility
6. **Test with edge cases**: 0 properties, 1 property, multiple properties, and loading state

---

## References

- Overview Document: `docs/REQ-130-create-propertysection-component-overview.md`
- Implementation Plan: `docs/prd/Plan-001-Simple-Dashboard-Implementation-REVISED.md`
- Request: `docs/gen_requests.md` (REQ-130)
- Pattern Reference: `src/components/SimpleDashboard/StatisticsCards.tsx`
- Pattern Reference: `src/components/SimpleDashboard/ActionButtons.tsx`
- Type Definitions: `src/types/index.ts`
