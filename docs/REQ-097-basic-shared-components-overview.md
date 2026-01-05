# REQ-097: Basic Shared Components - Implementation Breakdown

**Generated:** 2026-01-05 19:45 UTC
**Last Modified:** 2026-01-05 19:45 UTC
**Request Reference:** [REQ-097 in gen_requests.md](./gen_requests.md#req-097-shared-ui-components-for-item-creation-workflow)
**Implementation Plan Reference:** [Plan-093-Item-Creation-Workflow.md](./prd/Plan-093-Item-Creation-Workflow.md)
**Phase:** 1 - Foundation & Core Infrastructure
**Task ID:** 1.5

---

## Overview

This document provides the implementation breakdown for Task 1.5: Basic Shared Components from the Item Creation Workflow implementation plan. The task involves creating three reusable UI components that will be used throughout the workflow:

1. **SessionProgressBar** - Displays session-level progress (items created count)
2. **RoomCard** - Selection card for room type choices
3. **ItemTypeCard** - Selection card for item type choices

All components must follow the established Airbnb design system patterns and be consistent with existing component styling in ItemCapture and ItemManager.

---

## Dependencies

### Prerequisites (Must be Completed First)
- [x] **Task 1.1**: Component Scaffold & Type Definitions (REQ-093)
- [x] **Task 1.2**: Workflow State Machine (REQ-094)
- [x] **Task 1.3**: Main Workflow Component (REQ-095)
- [x] **Task 1.4**: Session Persistence (REQ-096)

### Related Components
| Component | Location | Relationship |
|-----------|----------|--------------|
| `WorkflowHeader` | `components/shared/WorkflowHeader.tsx` | Sibling - shares styling patterns |
| `ConfirmExitDialog` | `components/shared/ConfirmExitDialog.tsx` | Sibling - shares styling patterns |
| `ContentTypeStep` | `ItemCapture/components/steps/` | Pattern reference for card components |
| `ItemCard` | `ItemManager/components/` | Pattern reference for card styling |
| `ProgressIndicator` | `ItemCapture/components/shared/` | Pattern reference for progress display |

---

## Existing Patterns to Follow

### Styling Patterns from Codebase Analysis

#### Color Palette (Airbnb Design System)
```css
/* Primary Colors */
--brand-primary: #FF385C;          /* Buttons, progress bars, focus rings */
--brand-primary-hover: #E31C5F;    /* Hover states */

/* Text Colors */
--text-primary: #222222;           /* Primary text (gray-900) */
--text-secondary: #717171;         /* Secondary text (gray-500) */

/* State Colors */
--selection-border: #3B82F6;       /* blue-500 - Selected state borders */
--selection-bg: #EFF6FF;           /* blue-50 - Selected state background */
--selection-text: #1D4ED8;         /* blue-700 - Selected state text */
```

#### Card Component Pattern (from ContentTypeStep, ItemCard)
```tsx
// Base card structure
<button
  type="button"
  role="radio"
  aria-checked={isSelected}
  className={cn(
    // Layout
    'flex flex-col items-center justify-center',
    'w-full rounded-xl border-2',
    // Touch targets
    'min-h-[100px] p-4',
    // Transitions
    'transition-all duration-200',
    // Focus states
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
    // Selection states
    isSelected
      ? 'border-blue-500 bg-blue-50 text-blue-700'
      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 active:scale-95'
  )}
/>
```

#### Progress Bar Pattern (from WorkflowHeader)
```tsx
<div
  className="w-full h-1 bg-gray-200"
  role="progressbar"
  aria-valuenow={progressPercent}
  aria-valuemin={0}
  aria-valuemax={100}
>
  <div
    className="h-full transition-all duration-300 ease-out"
    style={{
      width: `${progressPercent}%`,
      backgroundColor: '#FF385C', // Airbnb brand primary
    }}
  />
</div>
```

### Constants Available (from utils/constants.ts)
```typescript
// Room configuration
ROOM_TYPES = ['kitchen', 'laundry', 'bedroom', 'bathroom', 'living-room', 'garage', 'outdoor', 'general', 'other']
ROOM_LABELS: Record<RoomType, string>
ROOM_ICONS: Record<RoomType, string>  // Lucide icon names

// Item type configuration
ITEM_TYPES = ['appliance', 'room-item', 'general-info']
ITEM_TYPE_LABELS: Record<ItemType, string>
ITEM_TYPE_DESCRIPTIONS: Record<ItemType, string>

// UI constants
TOUCH_TARGET_MIN_SIZE = 48  // pixels
```

---

## Component Specifications

### 1. SessionProgressBar

**Purpose:** Display session-level progress showing how many items have been created during the current session.

**Props Interface:**
```typescript
export interface SessionProgressBarProps {
  /** Number of items created in this session */
  itemsCreated: number;
  /** Optional maximum items per session (default: 50 from config) */
  maxItems?: number;
  /** Optional: Show count text (default: true) */
  showCount?: boolean;
  /** Optional CSS class name */
  className?: string;
}
```

**Design Requirements:**
- Thin horizontal progress bar (h-1.5 or h-2)
- Airbnb brand primary color (#FF385C) for fill
- Gray background (bg-gray-200)
- Smooth transition animation (duration-300)
- Text display: "X items created" below or inline with bar
- ARIA progressbar role with appropriate labels

**Visual Reference:**
```
┌──────────────────────────────────────────────────────────┐
│ ████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ 8 items created                                          │
└──────────────────────────────────────────────────────────┘
```

**Accessibility:**
- `role="progressbar"`
- `aria-valuenow={itemsCreated}`
- `aria-valuemax={maxItems}`
- `aria-label="Session progress: X items created"`

---

### 2. RoomCard

**Purpose:** Selectable card for room type selection in Step 1 of the workflow.

**Props Interface:**
```typescript
export interface RoomCardProps {
  /** Room type identifier */
  room: RoomType;
  /** Human-readable room label */
  label: string;
  /** Lucide icon name for the room */
  icon: string;
  /** Whether this room is currently selected */
  isSelected: boolean;
  /** Whether this room was previously used in session (grayed out) */
  isDisabled?: boolean;
  /** Called when room is selected */
  onSelect: (room: RoomType) => void;
  /** Optional CSS class name */
  className?: string;
}
```

**Design Requirements:**
- Square aspect ratio (`aspect-square`) on mobile, flexible on desktop
- Minimum touch target: 100px height (mobile), 120px (desktop)
- Icon centered above label
- Icon size: w-8 h-8 (mobile), w-10 h-10 (desktop)
- Selection states matching ContentTypeStep pattern
- Hover scale effect: `active:scale-95`
- Support for disabled/grayed state (previously used rooms)

**Visual Reference:**
```
┌─────────────────┐     ┌─────────────────┐
│                 │     │     ████████    │  <- Selected
│     🍳          │     │     🍳          │
│    Kitchen      │     │    Kitchen      │
│                 │     │                 │
└─────────────────┘     └─────────────────┘
   Default               Selected (blue border/bg)
```

**Accessibility:**
- `role="radio"` within `role="radiogroup"` parent
- `aria-checked={isSelected}`
- `aria-disabled={isDisabled}`
- Keyboard navigation (Enter/Space to select)
- Focus visible ring

---

### 3. ItemTypeCard

**Purpose:** Selectable card for item type selection in Step 2 of the workflow.

**Props Interface:**
```typescript
export interface ItemTypeCardProps {
  /** Item type identifier */
  itemType: ItemType;
  /** Human-readable item type label */
  label: string;
  /** Description/examples for this item type */
  description: string;
  /** Lucide icon for the item type */
  icon: LucideIcon;
  /** Whether this item type is currently selected */
  isSelected: boolean;
  /** Called when item type is selected */
  onSelect: (itemType: ItemType) => void;
  /** Optional CSS class name */
  className?: string;
}
```

**Design Requirements:**
- Larger than RoomCard to accommodate description text
- Minimum height: 120px (mobile), 140px (desktop)
- Icon on left, text content on right (horizontal layout)
- Label in bold, description in muted text below
- Selection states matching ContentTypeStep pattern
- Clear visual hierarchy: icon > label > description

**Visual Reference:**
```
┌────────────────────────────────────────────┐
│  ⚡   Appliance                            │
│       Washer, dryer, stove, refrigerator   │
│       etc.                                 │
└────────────────────────────────────────────┘
```

**Item Type Icons:**
| Item Type | Suggested Icon |
|-----------|---------------|
| `appliance` | `Zap` or `Plug` |
| `room-item` | `Package` or `Box` |
| `general-info` | `Info` or `FileText` |

**Accessibility:**
- `role="radio"` within `role="radiogroup"` parent
- `aria-checked={isSelected}`
- `aria-describedby` linking to description element
- Keyboard navigation (Enter/Space to select)
- Focus visible ring

---

## Authorized Files and Functions for Modification

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemCreationWorkflow/components/shared/SessionProgressBar.tsx` | SessionProgressBar component |
| `src/components/ItemCreationWorkflow/components/shared/RoomCard.tsx` | RoomCard component |
| `src/components/ItemCreationWorkflow/components/shared/ItemTypeCard.tsx` | ItemTypeCard component |

### Files to Modify

| File Path | Modification |
|-----------|--------------|
| `src/components/ItemCreationWorkflow/components/shared/index.ts` | Uncomment and export new components |
| `src/components/ItemCreationWorkflow/utils/constants.ts` | Add icon mapping if needed |

### Imports Required

```typescript
// Common imports for all components
import { cn } from '@/lib/utils';

// Lucide React icons
import {
  ChefHat, Shirt, Bed, ShowerHead, Sofa, Car, TreePine, Info, MapPin,
  Zap, Package, FileText,
  type LucideIcon
} from 'lucide-react';

// Types from workflow
import type { RoomType, ItemType } from '../../ItemCreationWorkflow.types';

// Constants
import { ROOM_LABELS, ROOM_ICONS, ITEM_TYPE_LABELS, ITEM_TYPE_DESCRIPTIONS, TOUCH_TARGET_MIN_SIZE } from '../../utils/constants';
```

---

## Implementation Tasks

### Task 1: SessionProgressBar Component
**Estimated Effort:** 1-2 story points

1. Create `SessionProgressBar.tsx` file with component and props interface
2. Implement progress bar using WorkflowHeader progress pattern
3. Add text display for items count
4. Apply ARIA accessibility attributes
5. Add smooth transition animations
6. Export from barrel file

**Acceptance Criteria:**
- [ ] Component displays progress bar with correct fill percentage
- [ ] Progress bar uses Airbnb brand color (#FF385C)
- [ ] Count text displays "X items created" message
- [ ] ARIA progressbar role with correct attributes
- [ ] Smooth animation on progress changes

---

### Task 2: RoomCard Component
**Estimated Effort:** 2-3 story points

1. Create `RoomCard.tsx` file with component and props interface
2. Implement card layout with centered icon and label
3. Create icon mapping utility (ROOM_ICONS to Lucide components)
4. Apply selection state styling (blue border, background)
5. Add hover/active/disabled states
6. Implement keyboard navigation (Enter/Space)
7. Add ARIA radio attributes
8. Export from barrel file

**Acceptance Criteria:**
- [ ] Card displays room icon and label correctly
- [ ] Selection state shows blue border and background
- [ ] Hover state shows gray background change
- [ ] Active state shows scale-95 effect
- [ ] Disabled state shows grayed out appearance
- [ ] Minimum touch target size (48px) met
- [ ] Keyboard activation works (Enter/Space)
- [ ] ARIA radio role with checked state

---

### Task 3: ItemTypeCard Component
**Estimated Effort:** 2-3 story points

1. Create `ItemTypeCard.tsx` file with component and props interface
2. Implement horizontal layout (icon left, text right)
3. Add label and description text hierarchy
4. Apply selection state styling
5. Add hover/active states
6. Implement keyboard navigation
7. Add ARIA radio attributes with describedby
8. Export from barrel file

**Acceptance Criteria:**
- [ ] Card displays icon, label, and description
- [ ] Horizontal layout with proper spacing
- [ ] Selection state shows blue styling
- [ ] Hover/active states work correctly
- [ ] Keyboard activation works
- [ ] ARIA attributes correctly implemented

---

### Task 4: Integration & Testing
**Estimated Effort:** 1 story point

1. Update barrel export in `shared/index.ts`
2. Verify TypeScript compilation
3. Test components in isolation
4. Verify responsive behavior on mobile/tablet/desktop

**Acceptance Criteria:**
- [ ] All components export correctly from barrel
- [ ] No TypeScript errors
- [ ] Components render correctly at all breakpoints
- [ ] Touch targets meet WCAG 2.5.5 requirements

---

## Icon Mapping Reference

### Room Icons (Lucide React)
| Room Type | Constant Value | Lucide Component |
|-----------|---------------|------------------|
| kitchen | `chef-hat` | `ChefHat` |
| laundry | `shirt` | `Shirt` |
| bedroom | `bed` | `Bed` |
| bathroom | `shower-head` | `ShowerHead` |
| living-room | `sofa` | `Sofa` |
| garage | `car` | `Car` |
| outdoor | `tree` | `TreePine` |
| general | `info` | `Info` |
| other | `map-pin` | `MapPin` |

### Item Type Icons
| Item Type | Lucide Component | Rationale |
|-----------|-----------------|-----------|
| appliance | `Zap` | Electrical/power association |
| room-item | `Package` | Physical item in room |
| general-info | `Info` | Information/instructions |

---

## Styling Reference (Tailwind Classes)

### Common Card Base
```tsx
className={cn(
  // Layout
  'flex flex-col items-center justify-center',
  'w-full rounded-xl border-2',
  // Touch targets
  'min-h-[100px] p-4 sm:min-h-[120px] sm:p-6',
  // Touch optimization
  'touch-manipulation select-none',
  // Transitions
  'transition-all duration-200',
  // Focus states
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
  // Selection states
  isSelected
    ? 'border-blue-500 bg-blue-50 text-blue-700'
    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 active:scale-95',
  // Disabled state
  isDisabled && 'opacity-50 cursor-not-allowed hover:bg-white hover:border-gray-200'
)}
```

### Progress Bar
```tsx
// Container
'w-full h-1.5 bg-gray-200 rounded-full overflow-hidden'

// Fill
'h-full rounded-full transition-all duration-300 ease-out'
style={{ width: `${percent}%`, backgroundColor: '#FF385C' }}
```

### Text Hierarchy
```tsx
// Label (primary)
'text-sm sm:text-base font-medium'

// Description (secondary)
'text-xs sm:text-sm text-gray-500'
```

---

## Testing Considerations

### Manual Testing Checklist
- [ ] Mobile viewport (375px): Cards stack correctly, touch targets adequate
- [ ] Tablet viewport (768px): Grid layout works correctly
- [ ] Desktop viewport (1024px+): Full layout displays correctly
- [ ] Keyboard navigation: Tab, Enter, Space all work
- [ ] Screen reader: ARIA labels read correctly
- [ ] Selection states: Visual feedback is clear
- [ ] Disabled states: Cannot interact with disabled cards

### Edge Cases
- Empty state (0 items created)
- Maximum items reached
- Long room names (truncation)
- Rapid selection changes
- Focus management between cards

---

## References

- [ItemCreationWorkflow Types](../src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts)
- [Constants File](../src/components/ItemCreationWorkflow/utils/constants.ts)
- [WorkflowHeader Pattern](../src/components/ItemCreationWorkflow/components/shared/WorkflowHeader.tsx)
- [ContentTypeStep Pattern](../src/components/ItemCapture/components/steps/ContentTypeStep.tsx)
- [ItemCard Pattern](../src/components/ItemManager/components/ItemCard.tsx)
- [ProgressIndicator Pattern](../src/components/ItemCapture/components/shared/ProgressIndicator.tsx)
- [Airbnb Design System](./prd/airbnb_designsystem.md)

---

*Implementation Breakdown generated on 2026-01-05 for REQ-097: Basic Shared Components*
