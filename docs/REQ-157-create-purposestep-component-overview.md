# REQ-157: Create PurposeStep Component - Implementation Overview

**Generated:** 2026-01-09 21:45:00 UTC
**Last Modified:** 2026-01-09 21:45:00 UTC
**Request ID:** REQ-157
**Phase:** 2 - New Purpose Step
**Task ID:** 2.1
**Implementation Plan Reference:** `/docs/prd/Plan-094-UI-UX-Workflow-Improvements.md`

---

## Executive Summary

This document provides a technical implementation breakdown for creating the `PurposeStep` component, a new step in the Item Creation Workflow that allows users to select the purpose/intent of their item content (e.g., "How to Clean", "Troubleshooting", "Safety Info"). The component follows existing patterns established by `ItemTypeStep` and implements full keyboard navigation and accessibility support.

---

## Task Context from Implementation Plan

From Phase 2, Task 2.1 of Plan-094:

```
#### Task 2.1: Create PurposeStep Component
- [ ] Create `/components/steps/PurposeStep.tsx`
- [ ] Implement purpose card grid (similar to ItemTypeStep pattern)
- [ ] Add icons for each purpose type
- [ ] Implement keyboard navigation (arrow keys)
- [ ] Add auto-advance on selection (with delay for visual feedback)
- [ ] Add aria labels and screen reader support
- [ ] Export from steps/index.ts
```

---

## Requirements Analysis

### From REQ-157 (gen_requests.md)

**User Story:** Users need an interactive, accessible interface to select the purpose of their item from a grid of clearly labeled options with visual icons and smooth navigation.

**Acceptance Criteria:**
- [ ] Purpose options displayed in responsive grid layout adapting to screen size
- [ ] Each option displays a distinctive icon and clear text label
- [ ] Click/tap selection support
- [ ] Keyboard navigation with arrow keys
- [ ] Enter/Space key selection support
- [ ] Visual feedback on selection before auto-advance
- [ ] Brief delay between selection and advancement
- [ ] Screen reader announcements for options and selection state
- [ ] Appropriate ARIA labels and roles

### Purpose Types (from Plan-094 Appendix A)

```typescript
export const PURPOSE_TYPES = [
  'how-to-use',
  'how-to-clean',
  'troubleshooting',
  'safety-info',
  'maintenance',
  'features',
  'other',
] as const;
```

### Icons Mapping (from Plan-094)

```typescript
export const PURPOSE_ICONS: Record<PurposeTypeConst, string> = {
  'how-to-use': 'play-circle',
  'how-to-clean': 'sparkles',
  'troubleshooting': 'wrench',
  'safety-info': 'alert-triangle',
  'maintenance': 'settings',
  'features': 'star',
  'other': 'info',
};
```

---

## Existing Patterns to Follow

### 1. ItemTypeStep Pattern (Reference: `/src/components/ItemCreationWorkflow/components/steps/ItemTypeStep.tsx`)

Key patterns to replicate:

```typescript
// Props interface pattern
export interface ItemTypeStepProps {
  currentItemType: ItemType | null;
  onSelectItemType: (itemType: ItemType) => void;
  onNext: () => void;
  canNext: boolean;
  className?: string;
}

// Auto-advance with delay pattern
const handleItemTypeSelect = useCallback((itemType: ItemType) => {
  onSelectItemType(itemType);
  setTimeout(() => {
    onNext();
  }, 150);
}, [onSelectItemType, onNext]);

// Roving tabindex pattern
const [activeIndex, setActiveIndex] = useState(() =>
  currentItemType ? ITEM_TYPES.indexOf(currentItemType as ItemType) : 0
);
const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

// Keyboard navigation using createKeyboardNavigator
const handleListKeyDown = useCallback((event: React.KeyboardEvent) => {
  const validRefs = itemRefs.current.filter(Boolean) as HTMLButtonElement[];
  const handleNav = createKeyboardNavigator({
    items: validRefs,
    orientation: 'vertical',
    loop: true,
    onSelect: (index) => { /* select item */ },
    onFocusChange: (index) => { setActiveIndex(index); },
  });
  handleNav(event);
}, [/* deps */]);
```

### 2. ItemTypeCard Pattern (Reference: `/src/components/ItemCreationWorkflow/components/shared/ItemTypeCard.tsx`)

Key patterns:
- `forwardRef` for ref forwarding to enable roving tabindex
- `role="radio"` and `aria-checked` for radiogroup semantics
- `aria-describedby` linking to description element
- Visual checkmark indicator for selected state
- Touch-optimized sizing (`min-h-[120px]`, `min-h-[56px]` for buttons)

### 3. Accessibility Utilities (Reference: `/src/components/ItemCreationWorkflow/utils/accessibility.ts`)

```typescript
import { createKeyboardNavigator } from '../../utils/accessibility';
```

---

## Component Architecture

### File Structure

```
src/components/ItemCreationWorkflow/
├── components/
│   ├── shared/
│   │   ├── index.ts                    # MODIFY: Export PurposeCard
│   │   └── PurposeCard.tsx             # CREATE: Reusable purpose card
│   └── steps/
│       ├── index.ts                    # MODIFY: Export PurposeStep
│       └── PurposeStep.tsx             # CREATE: Main step component
└── utils/
    └── constants.ts                    # ALREADY MODIFIED: PURPOSE_TYPES, etc.
```

### PurposeStep Props Interface

```typescript
export interface PurposeStepProps {
  /** Currently selected purpose (null if none) */
  currentPurpose: PurposeType | null;
  /** Callback when purpose is selected */
  onSelectPurpose: (purpose: PurposeType) => void;
  /** Callback to proceed to next step */
  onNext: () => void;
  /** Whether next step navigation is allowed */
  canNext: boolean;
  /** Optional CSS class */
  className?: string;
}
```

### PurposeCard Props Interface (Optional - Can inline in PurposeStep)

```typescript
export interface PurposeCardProps {
  /** Purpose type identifier */
  purposeType: PurposeType;
  /** Human-readable purpose label */
  label: string;
  /** Description for this purpose type */
  description: string;
  /** Lucide icon component */
  icon: LucideIcon;
  /** Whether this purpose is currently selected */
  isSelected: boolean;
  /** Called when purpose is selected */
  onSelect: (purposeType: PurposeType) => void;
  /** Tab index for roving tabindex pattern */
  tabIndex?: number;
  /** Optional CSS class name */
  className?: string;
}
```

---

## Implementation Tasks

### Task 1: Create PurposeStep.tsx

**File:** `/src/components/ItemCreationWorkflow/components/steps/PurposeStep.tsx`

**Implementation Details:**

1. **Component Header & Imports**
   - Add 'use client' directive
   - Import React hooks: `useCallback`, `useRef`, `useState`
   - Import `cn` from `@/lib/utils`
   - Import Lucide icons: `PlayCircle`, `Sparkles`, `Wrench`, `AlertTriangle`, `Settings`, `Star`, `Info`, `Check`
   - Import constants: `PURPOSE_TYPES`, `PURPOSE_LABELS`, `PURPOSE_DESCRIPTIONS`
   - Import types: `PurposeType` from types file
   - Import `createKeyboardNavigator` from utils/accessibility

2. **Icon Mapping Constant**
   ```typescript
   const PURPOSE_ICONS: Record<PurposeType, LucideIcon> = {
     'how-to-use': PlayCircle,
     'how-to-clean': Sparkles,
     'troubleshooting': Wrench,
     'safety-info': AlertTriangle,
     'maintenance': Settings,
     'features': Star,
     'other': Info,
   };
   ```

3. **State Management**
   - `activeIndex` state for roving tabindex (initialized from currentPurpose)
   - `itemRefs` ref array for card button elements

4. **Event Handlers**
   - `handlePurposeSelect`: Select purpose and auto-advance with 150ms delay
   - `handleContinue`: Manual continue button handler
   - `handleListKeyDown`: Keyboard navigation using createKeyboardNavigator

5. **Render Structure**
   ```tsx
   <div className="flex flex-col flex-1 p-6">
     {/* Header */}
     <div className="mb-6">
       <h2>What's the purpose of this content?</h2>
       <p>Choose what you want to help guests with</p>
     </div>

     {/* Purpose cards - radiogroup with grid layout */}
     <div role="radiogroup" aria-label="Select content purpose">
       {PURPOSE_TYPES.map((type, index) => (
         <button
           key={type}
           ref={(el) => { itemRefs.current[index] = el; }}
           role="radio"
           aria-checked={currentPurpose === type}
           tabIndex={index === activeIndex ? 0 : -1}
           onClick={() => handlePurposeSelect(type)}
           // ... styling and content
         >
           <Icon /> {label} {description}
           {isSelected && <Check />}
         </button>
       ))}
     </div>

     {/* Screen reader help text */}
     <p className="sr-only">
       Use up and down arrow keys to navigate. Press Enter or Space to select.
     </p>

     {/* Continue button */}
     <div className="mt-8 pt-6 border-t">
       <button disabled={!canNext}>Continue</button>
     </div>
   </div>
   ```

6. **Grid Layout for 7 Items**
   - Use vertical list layout (like ItemTypeStep) for consistency
   - Responsive: Single column on mobile, cards stack vertically
   - Alternative: 2-column grid on larger screens
   ```css
   /* Option A: Vertical list (recommended for consistency) */
   .flex.flex-col.gap-4

   /* Option B: Responsive grid */
   .grid.grid-cols-1.sm:grid-cols-2.gap-4
   ```

7. **Card Styling** (matching ItemTypeCard pattern)
   ```typescript
   cn(
     'flex items-center gap-4',
     'w-full rounded-xl border-2',
     'min-h-[100px] p-4',
     'touch-manipulation select-none',
     'transition-all duration-200',
     'motion-reduce:transition-none',
     'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
     isSelected
       ? 'border-blue-500 bg-blue-50'
       : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
   )
   ```

### Task 2: Update steps/index.ts

**File:** `/src/components/ItemCreationWorkflow/components/steps/index.ts`

**Changes:**
```typescript
// Add after SpecificItemStep exports:

// =============================================================================
// Purpose Selection Step (Step 4 - NEW)
// =============================================================================
/**
 * Purpose selection for item content.
 * Determines the intent of the content being created.
 */
export { PurposeStep } from './PurposeStep';
export type { PurposeStepProps } from './PurposeStep';
```

### Task 3: (Optional) Create PurposeCard Shared Component

If the card rendering is complex enough to warrant separation:

**File:** `/src/components/ItemCreationWorkflow/components/shared/PurposeCard.tsx`

Follow ItemTypeCard pattern exactly, just with PurposeType instead of ItemType.

---

## Dependencies

### Prerequisites (Must be completed before this task)

These are from Phase 1 of Plan-094:

1. **Task 1.1: Update Types and Constants** - Adds `PurposeType` and PURPOSE_* constants
   - `PurposeType` must exist in `ItemCreationWorkflow.types.ts`
   - `PURPOSE_TYPES`, `PURPOSE_LABELS`, `PURPOSE_DESCRIPTIONS` must exist in `constants.ts`

### Dependent Tasks (Will use this component)

1. **Task 2.2: Integrate PurposeStep into Workflow** - Connects PurposeStep to ItemCreationWorkflow.tsx
2. **Task 2.3: Create Unit Tests** - Tests for PurposeStep component

---

## Authorized Files and Functions for Modification

### Files to CREATE

| File | Purpose |
|------|---------|
| `/src/components/ItemCreationWorkflow/components/steps/PurposeStep.tsx` | Main PurposeStep component |

### Files to MODIFY

| File | Changes |
|------|---------|
| `/src/components/ItemCreationWorkflow/components/steps/index.ts` | Add export for PurposeStep |

### Files to READ (Reference Only)

| File | Purpose |
|------|---------|
| `/src/components/ItemCreationWorkflow/components/steps/ItemTypeStep.tsx` | Pattern reference |
| `/src/components/ItemCreationWorkflow/components/shared/ItemTypeCard.tsx` | Card styling reference |
| `/src/components/ItemCreationWorkflow/utils/accessibility.ts` | Keyboard navigation utilities |
| `/src/components/ItemCreationWorkflow/utils/constants.ts` | PURPOSE_* constants |
| `/src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` | PurposeType definition |

---

## Testing Considerations

### Unit Test Cases (for Task 2.3)

1. **Rendering Tests**
   - Renders all 7 purpose options
   - Displays correct labels and descriptions
   - Shows correct icons for each purpose type

2. **Selection Tests**
   - Selecting a purpose calls onSelectPurpose with correct type
   - Selected purpose shows visual indicator (checkmark)
   - Auto-advances to next step after 150ms delay

3. **Keyboard Navigation Tests**
   - Arrow keys move focus between cards
   - Home/End keys move to first/last card
   - Enter/Space selects focused card
   - Tab moves out of radiogroup

4. **Accessibility Tests**
   - radiogroup role is present
   - radio role on each card
   - aria-checked reflects selection state
   - Help text is available to screen readers

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Phase 1 constants not ready | Medium | High | Verify PurposeType exists before starting; can stub constants temporarily |
| Grid vs List layout decision | Low | Low | Start with vertical list (consistent with ItemTypeStep); can refactor later |
| 7 items may be overwhelming | Low | Medium | Consider adding descriptions to clarify each option |

---

## Estimated Effort

| Sub-task | Estimate | Confidence |
|----------|----------|------------|
| Create PurposeStep.tsx | 2-3 hours | High |
| Update index.ts export | 5 minutes | High |
| Manual testing | 30 minutes | High |
| **Total** | **3-4 hours** | High |

---

## Definition of Done

- [ ] PurposeStep.tsx created following ItemTypeStep pattern
- [ ] All 7 purpose types render with icons, labels, descriptions
- [ ] Click/tap selection works and calls onSelectPurpose
- [ ] Auto-advance fires after 150ms delay
- [ ] Keyboard navigation works (arrow keys, Enter, Space, Home, End)
- [ ] Roving tabindex implemented correctly
- [ ] ARIA attributes present (role, aria-checked, aria-label, aria-describedby)
- [ ] Screen reader help text included
- [ ] Export added to steps/index.ts
- [ ] No TypeScript errors
- [ ] Component renders without console errors

---

## References

- Implementation Plan: `/docs/prd/Plan-094-UI-UX-Workflow-Improvements.md`
- Request: `/docs/gen_requests.md` - REQ-157
- ItemTypeStep Pattern: `/src/components/ItemCreationWorkflow/components/steps/ItemTypeStep.tsx`
- ItemTypeCard Pattern: `/src/components/ItemCreationWorkflow/components/shared/ItemTypeCard.tsx`
- Accessibility Utils: `/src/components/ItemCreationWorkflow/utils/accessibility.ts`
- Constants: `/src/components/ItemCreationWorkflow/utils/constants.ts`
