# REQ-130: Create PropertySection Component - Implementation Overview

**Created:** 2026-01-06 21:15:00 UTC
**Last Modified:** 2026-01-06 21:15:00 UTC
**Request Reference:** REQ-130 in docs/gen_requests.md
**Plan Reference:** docs/prd/Plan-001-Simple-Dashboard-Implementation-REVISED.md (Phase 4, Task 4.1)

---

## 1. Summary

Create a PropertySection component for Dashboard 2 that displays the user's properties in a navigable list format. The component dynamically shows "My Property" (singular) or "My Properties" (plural) based on the count, with each property row being clickable to open an edit view. An "Add New Property" button below the list initiates the property creation flow.

---

## 2. Request Details (from gen_requests.md)

**Type:** NEW FEATURE
**Size:** M (Medium)
**Phase:** 4 - Property Section
**Task ID:** 4.1

### Acceptance Criteria
- [ ] A PropertySection component is displayed on Dashboard 2
- [ ] The section heading displays "My Property" when the user owns exactly one property
- [ ] The section heading displays "My Properties" when the user owns two or more properties
- [ ] Each property appears as a distinct, clickable row in the section
- [ ] Each property row displays a chevron icon positioned on the right side
- [ ] Clicking any property row navigates the user to that property's edit view
- [ ] An "Add New Property" button appears below the list of property rows
- [ ] Clicking the "Add New Property" button initiates the property creation workflow
- [ ] The component handles loading states while property data is being fetched
- [ ] The component handles empty states appropriately when the user has no properties
- [ ] The component is fully keyboard accessible with proper focus management
- [ ] The component follows the Airbnb design system color palette and styling conventions

---

## 3. Technical Context

### 3.1 Technology Stack (from Implementation Plan)

| Technology | Details |
|------------|---------|
| Framework | Next.js 15.5.9 (App Router, Turbopack) |
| Language | TypeScript 5.x |
| Styling | Tailwind CSS 4 |
| State Management | React Context (AuthContext), React useState |
| UI Components | Custom components + Radix UI primitives |
| Icons | Lucide React |
| Database | Supabase (PostgreSQL) with Row Level Security |
| API Pattern | Next.js API Routes with `apiRequest` helper |

### 3.2 Airbnb Design System Tokens (Required)

| Token | Tailwind Class | Usage |
|-------|----------------|-------|
| Primary CTA | `bg-[#FF385C]` | Add Property button |
| Primary Text | `text-[#222222]` | Section heading, property names |
| Secondary Text | `text-[#717171]` | Subtitles, hints |
| Border | `border-[#DDDDDD]` | Property row borders |
| Card Background | `bg-white` | Section container |
| Card Radius | `rounded-xl` (12px) | Section container |
| Button Radius | `rounded-lg` (8px) | Add Property button |
| Hover Background | `bg-gray-50` or `hover:bg-[#F7F7F7]` | Property row hover |

### 3.3 Existing Reusable Components

| Component | Location | Can Reuse For |
|-----------|----------|---------------|
| `PropertyForm` | `/src/components/PropertyForm.tsx` | Property edit/add form (already complete) |
| `PropertySelector` | `/src/components/PropertySelector.tsx` | Reference for property display patterns |
| `StatisticsCards` | `/src/components/SimpleDashboard/StatisticsCards.tsx` | Pattern for loading skeletons, Airbnb styling |
| `ActionButtons` | `/src/components/SimpleDashboard/ActionButtons.tsx` | Pattern for button styling, accessibility |

### 3.4 Existing Patterns to Follow

**Component Structure Pattern (from StatisticsCards.tsx):**
```typescript
// File header comment with REQ reference
// Created/Modified timestamps
// 'use client' directive
// Interface definitions with JSDoc
// Sub-components (internal, not exported)
// Main component with JSDoc
// Named exports
```

**Button Styling Pattern (from ActionButtons.tsx:67-82):**
```typescript
// Primary button classes
`bg-gradient-to-r from-[#E61E4D] to-[#D70466] text-white`

// Secondary button classes
`bg-white border border-[#222222] text-[#222222]`

// Focus states
`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#222222] focus-visible:ring-offset-2`

// Touch target
`min-h-[48px]`
```

**Loading Skeleton Pattern (from StatisticsCards.tsx:82-101):**
```typescript
<div className="animate-pulse">
  <div className="h-8 w-16 bg-gray-200 rounded mb-1" />
</div>
```

---

## 4. Data Flow

### 4.1 Property Data Source

Properties are available via `useAuth()` hook from AuthContext:

```typescript
const { userProperties } = useAuth();
// userProperties: Property[]
```

**Property Interface (from AuthContext):**
```typescript
interface Property {
  id: string;
  nickname: string;
  address?: string;
  property_type_id?: string;
  user_id: string;
  property_types?: {
    display_name: string;
  };
}
```

### 4.2 Alternative: Use Properties API

If `userProperties` from context is insufficient, use the existing API:

**Endpoint:** `GET /api/user/properties`

**Response:**
```typescript
{
  success: boolean;
  data: Property[];
  error?: string;
}
```

### 4.3 Edit Flow

When a property row is clicked:
1. Open a modal dialog with `PropertyEditModal` (to be created in Task 4.2)
2. Pre-populate the form with the selected property data
3. On save, call `PUT /api/user/properties/[propertyId]` (existing endpoint)
4. On success, refresh the property list

### 4.4 Add Property Flow

When "Add New Property" is clicked:
1. Open a modal dialog with `AddPropertyModal` (to be created in Task 4.3)
2. Show empty form using `PropertyForm` component
3. On save, call `POST /api/user/properties` (existing endpoint)
4. On success, refresh the property list and close modal

---

## 5. Component Design

### 5.1 PropertySection Component Structure

```
PropertySection
├── Section Header (h2: "My Property" or "My Properties")
├── Property List
│   └── PropertyRow (for each property)
│       ├── Property Name
│       ├── Property Type Badge (optional)
│       └── Chevron Icon (ChevronRight from lucide-react)
├── Add Property Button
└── Loading State (shimmer skeleton)
└── Empty State (when no properties)
```

### 5.2 PropertyRow Sub-component Props

```typescript
interface PropertyRowProps {
  property: Property;
  onClick: (property: Property) => void;
}
```

### 5.3 PropertySection Props

```typescript
export interface PropertySectionProps {
  /** Optional callback when property is selected for editing */
  onPropertyEdit?: (property: Property) => void;
  /** Optional callback when add property is clicked */
  onAddProperty?: () => void;
  /** Optional additional CSS classes */
  className?: string;
}
```

### 5.4 Visual Design Wireframe

**Single Property View:**
```
┌─────────────────────────────────────────────┐
│ My Property                                 │
├─────────────────────────────────────────────┤
│ Beach House                              [>]│
├─────────────────────────────────────────────┤
│         [+ Add New Property]                │
└─────────────────────────────────────────────┘
```

**Multiple Properties View:**
```
┌─────────────────────────────────────────────┐
│ My Properties                               │
├─────────────────────────────────────────────┤
│ Beach House                              [>]│
├─────────────────────────────────────────────┤
│ Downtown Apartment                       [>]│
├─────────────────────────────────────────────┤
│         [+ Add New Property]                │
└─────────────────────────────────────────────┘
```

**Empty State:**
```
┌─────────────────────────────────────────────┐
│ My Properties                               │
├─────────────────────────────────────────────┤
│                                             │
│   🏠  No properties yet                     │
│   Add your first property to get started    │
│                                             │
│         [+ Add New Property]                │
└─────────────────────────────────────────────┘
```

---

## 6. Implementation Tasks

### Task 4.1.1: Create PropertySection Component File

**File:** `/src/components/SimpleDashboard/PropertySection.tsx`

Subtasks:
- [ ] Create file with proper header comments (REQ-130, timestamps)
- [ ] Define `PropertySectionProps` interface with JSDoc
- [ ] Define `PropertyRowProps` interface
- [ ] Implement `PropertyRow` sub-component with:
  - Clickable div/button with proper role
  - Property name display
  - ChevronRight icon from lucide-react
  - Hover state styling (bg-gray-50)
  - Focus visible ring styling
  - Keyboard accessibility (Enter/Space to click)
- [ ] Implement `LoadingSkeleton` sub-component with shimmer animation
- [ ] Implement `EmptyState` sub-component with icon and message
- [ ] Implement main `PropertySection` component with:
  - Dynamic heading ("My Property" vs "My Properties")
  - Map properties to PropertyRow components
  - "Add New Property" button below list
  - Loading state handling
  - Empty state handling
- [ ] Export component and types from file

### Task 4.1.2: Update SimpleDashboard Index

**File:** `/src/components/SimpleDashboard/index.ts`

Subtasks:
- [ ] Add export for `PropertySection` component
- [ ] Add export for `PropertySectionProps` type

### Task 4.1.3: Integrate PropertySection into Dashboard Page

**File:** `/src/app/dashboard2/page.tsx`

Subtasks:
- [ ] Import `PropertySection` from SimpleDashboard
- [ ] Add PropertySection below ActionButtons in the layout
- [ ] Wire up edit property callback (placeholder for Task 4.2)
- [ ] Wire up add property callback (placeholder for Task 4.3)

---

## 7. Authorized Files and Functions for Modification

### 7.1 Files to CREATE

| File Path | Purpose |
|-----------|---------|
| `/src/components/SimpleDashboard/PropertySection.tsx` | Main PropertySection component |

### 7.2 Files to MODIFY

| File Path | Lines/Functions to Modify | Purpose |
|-----------|---------------------------|---------|
| `/src/components/SimpleDashboard/index.ts` | Add 2 export lines (lines 12-13) | Export PropertySection |
| `/src/app/dashboard2/page.tsx` | Lines 14, 32-36 | Import and render PropertySection |

### 7.3 Files to READ (Reference Only - DO NOT MODIFY)

| File Path | Purpose |
|-----------|---------|
| `/src/components/SimpleDashboard/StatisticsCards.tsx` | Pattern for component structure, loading skeleton |
| `/src/components/SimpleDashboard/ActionButtons.tsx` | Pattern for button styling, accessibility |
| `/src/components/PropertyForm.tsx` | Reference for Property interface and form patterns |
| `/src/components/PropertySelector.tsx` | Reference for property display patterns |
| `/src/contexts/AuthContext.tsx` | Property interface, useAuth hook usage |

---

## 8. Dependencies

### 8.1 Upstream Dependencies (Required Before This Task)

| Dependency | Status | Notes |
|------------|--------|-------|
| Dashboard 2 page exists | COMPLETE | `/src/app/dashboard2/page.tsx` |
| StatisticsCards component | COMPLETE | Pattern to follow |
| ActionButtons component | COMPLETE | Pattern to follow |
| AuthContext with userProperties | COMPLETE | Data source |
| Properties API | COMPLETE | `/api/user/properties` |

### 8.2 Downstream Dependencies (Blocked By This Task)

| Dependency | Task ID | Notes |
|------------|---------|-------|
| PropertyEditModal | 4.2 | Needs PropertySection click handler |
| AddPropertyModal | 4.3 | Needs PropertySection add button handler |
| Property Section Integration | 4.4 | Full integration after modals complete |

---

## 9. Testing Checklist

### 9.1 Unit Test Scenarios

- [ ] Renders "My Property" when exactly 1 property
- [ ] Renders "My Properties" when 0, 2, or more properties
- [ ] Renders correct number of PropertyRow items
- [ ] Shows loading skeleton when loading
- [ ] Shows empty state when no properties
- [ ] Click on property row calls onPropertyEdit with correct property
- [ ] Click on Add button calls onAddProperty

### 9.2 Accessibility Testing

- [ ] Tab through all interactive elements in correct order
- [ ] Enter/Space activates property row click
- [ ] Focus visible ring on all focusable elements
- [ ] Screen reader announces section heading appropriately
- [ ] ARIA labels present on buttons

### 9.3 Visual Testing

- [ ] Matches Airbnb design system colors
- [ ] Proper spacing and padding
- [ ] Responsive on mobile (stacks appropriately)
- [ ] Hover states work correctly
- [ ] Loading shimmer animation smooth

---

## 10. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| userProperties not populated in context | Low | High | Fallback to API call if context is empty |
| Property type data not included | Low | Medium | Handle optional property_types gracefully |
| Edit modal not ready for click handler | Expected | Low | Use placeholder callback that logs warning |
| Mobile layout issues | Low | Medium | Test early with responsive breakpoints |

---

## 11. Estimated Effort

**Total:** 2-3 hours

| Subtask | Estimate |
|---------|----------|
| 4.1.1 Create PropertySection component | 1.5-2 hours |
| 4.1.2 Update index exports | 5 minutes |
| 4.1.3 Integrate into Dashboard page | 15-30 minutes |
| Testing and polish | 30 minutes |

---

## 12. Success Criteria

Implementation is complete when:

1. PropertySection component renders on Dashboard 2 below ActionButtons
2. Shows "My Property" for single property, "My Properties" for 0 or 2+
3. Each property row displays name and chevron icon
4. Property rows have proper hover and focus states
5. Clicking a property row logs to console (placeholder for edit modal)
6. "Add New Property" button is visible and clickable
7. Loading skeleton displays while fetching
8. Empty state displays with friendly message when no properties
9. All interactive elements are keyboard accessible
10. Passes visual review for Airbnb design system compliance
