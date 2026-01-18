# REQ-187: Create WhatsNextStep Component - Implementation Overview

**Generated:** 2026-01-12 23:30
**Last Modified:** 2026-01-12 23:30
**Request Reference:** REQ-187 (from gen_requests.md)
**Implementation Plan:** Plan-105-FAQBNB-Review-2026-01-11-Comprehensive-Implementation.md
**Phase:** 2 - REQ-3 - Fix "What's Next" Screen
**Task ID:** 2.1

---

## Summary

Create a new `WhatsNextStep` component that serves as a post-save decision menu in the ItemCapture workflow. This component is displayed after an item is successfully saved and provides users with four action options:
1. **Edit Instructions** - Navigate to edit the article just created
2. **Add New Instructions** - Create different instructions for the same item
3. **Create New Item** - Start fresh with a different item
4. **Done** - Exit the workflow and return to dashboard

**CRITICAL:** This is NOT a numbered workflow step - it's a post-workflow decision point and should NOT be counted in the progress indicator.

---

## Dependencies

### Depends On (upstream)
- **Task 0.1-0.4 (Phase 0 - REQ-2)**: Data model UI clarification must be complete so the component uses correct "Item Name" terminology
- **Task 1.1-1.3 (Phase 1 - REQ-5)**: Step count fixes must be in place to ensure WhatsNextStep is properly excluded from the numbered workflow

### Blocks (downstream)
- **Task 2.2**: Add WhatsNextStep to Wizard Types - requires this component to exist first
- **Task 2.3**: Integrate WhatsNextStep into ItemCapture Flow - depends on the component being created
- **Task 2.4**: Ensure No Navigation Controls on WhatsNextStep - requires this component for testing

### Parallel Safety
- **Files touched:**
  - `src/components/ItemCapture/components/steps/WhatsNextStep.tsx` (NEW FILE)
- **Conflicts with:** None (creates a new file)
- **Safe to parallelize with:**
  - Phase 3 tasks (REQ-1 - Dashboard cards)
  - Phase 4 tasks (REQ-4 - Navigation menu)

---

## Technical Context

### Existing Patterns

The ItemCapture workflow uses a multi-step wizard pattern with the following characteristics:

1. **Step Components Location:** `src/components/ItemCapture/components/steps/`
   - Each step is a self-contained React component
   - Steps use 'use client' directive for client-side rendering
   - JSDoc headers document module purpose and last modification

2. **Component Structure Pattern:**
   ```tsx
   'use client';
   /**
    * ComponentName Component
    * @module ItemCapture/components/steps/ComponentName
    * @lastModified DATE (REQ-XXX description)
    */
   import React from 'react';
   import { cn } from '@/lib/utils';
   // ... component implementation
   export function ComponentName(props: ComponentNameProps) { ... }
   export default ComponentName;
   ```

3. **WizardStep Type Union:** Defined in `ItemCapture.types.ts:246-256`
   - Currently includes: `metadata`, `content-type`, `capture-video`, `capture-photo`, `upload-file`, `write-text`, `add-url`, `edit-media`, `add-more`, `review`
   - WhatsNextStep will be added as `'whats-next'`

4. **Step-to-Stage Mapping:** `ProgressIndicator.tsx:65-75`
   - Maps internal wizard steps to 4 display stages
   - WhatsNextStep should NOT be mapped (or mapped to -1) to exclude from progress

5. **Icon Usage:** Uses Lucide React icons consistently
   - Existing icons: `Edit`, `PlusCircle`, `Package`, `CheckCircle` (proposed for WhatsNextStep)

### Current Workflow Flow

```
metadata → content-type → [capture steps] → add-more → review → [submit] → reset()
```

After this implementation:
```
metadata → content-type → [capture steps] → add-more → review → [submit] → whats-next → [user choice]
```

---

## Authorized Files and Functions for Modification

### New File (CREATE)

| File | Description |
|------|-------------|
| `src/components/ItemCapture/components/steps/WhatsNextStep.tsx` | New post-save menu component |

### Files for Reference Only (NO MODIFICATION)

| File | Purpose |
|------|---------|
| `src/components/ItemCapture/ItemCapture.tsx` | Understand wizard flow orchestration (modified in Task 2.3) |
| `src/components/ItemCapture/ItemCapture.types.ts` | Reference for type patterns (modified in Task 2.2) |
| `src/components/ItemCapture/components/steps/MetadataStep.tsx` | Reference for step component patterns |
| `src/components/ItemCapture/components/steps/ReviewStep.tsx` | Reference for final step patterns |
| `src/components/ItemCapture/components/shared/ProgressIndicator.tsx` | Understand step-to-stage mapping (modified in Task 2.4) |
| `src/lib/utils.ts` | Import `cn` utility for class merging |

---

## Implementation Details

### Task 2.1.1: Create WhatsNextStep Component File

**File:** `src/components/ItemCapture/components/steps/WhatsNextStep.tsx` (NEW)

**Component Structure:**

```tsx
'use client';

/**
 * WhatsNextStep Component
 *
 * Post-save menu displayed after an item is successfully saved.
 * This is NOT a numbered workflow step - it's a post-workflow decision point.
 *
 * Options:
 * 1. Edit Instructions - Navigate to edit the article just created
 * 2. Add New Instructions - Create different instructions for same item
 * 3. Create New Item - Start fresh with a different item
 * 4. Done - Exit the workflow completely
 *
 * @module ItemCapture/components/steps/WhatsNextStep
 * @lastModified 2026-01-12 (REQ-187 - Create WhatsNextStep component)
 * @see REQ-3 from PRD CPL-FAQBNB-Review-2026-01-11
 */
```

### Task 2.1.2: Define Props Interface

```typescript
export interface WhatsNextStepProps {
  /** The item that was just saved */
  savedItemId: string;
  savedItemName: string;
  /** Callback for Edit Instructions action */
  onEditInstructions: () => void;
  /** Callback for Add New Instructions action */
  onAddNewInstructions: () => void;
  /** Callback for Create New Item action */
  onCreateNewItem: () => void;
  /** Callback for Done action */
  onDone: () => void;
  /** Optional CSS class */
  className?: string;
}
```

### Task 2.1.3: Implement ActionCard Sub-Component

Internal helper component for consistent action button styling:

```typescript
interface ActionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  variant?: 'default' | 'primary';
}
```

**Styling Patterns:**
- Default variant: `border-gray-200 hover:border-gray-300 hover:bg-gray-50`
- Primary variant: `border-blue-500 bg-blue-50 hover:bg-blue-100`
- Focus states: `focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`
- Icon containers: Rounded with colored background matching variant

### Task 2.1.4: Implement Main WhatsNextStep Component

**Visual Structure:**
1. Success Header (centered)
   - Green checkmark icon (16x16 circle, 8x8 icon)
   - "Item Saved!" heading
   - Item name confirmation
   - "What would you like to do next?" prompt

2. Action Options (max-w-md, vertical stack with spacing)
   - Edit Instructions (Edit icon, default variant)
   - Add New Instructions (PlusCircle icon, **primary variant** - recommended action)
   - Create New Item (Package icon, default variant)
   - Done button (separated by border, plain text style)

**Key Implementation Notes:**
- Use `cn()` utility from `@/lib/utils` for class merging
- Follow existing step component patterns from MetadataStep.tsx
- Include proper TypeScript types for all props
- Ensure accessibility with proper button semantics

---

## Integration Contracts

### Props Contract

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `savedItemId` | `string` | Yes | UUID of the saved item |
| `savedItemName` | `string` | Yes | Display name of the saved item |
| `onEditInstructions` | `() => void` | Yes | Navigate to edit article |
| `onAddNewInstructions` | `() => void` | Yes | Start new article for same item |
| `onCreateNewItem` | `() => void` | Yes | Reset wizard for new item |
| `onDone` | `() => void` | Yes | Exit workflow to dashboard |
| `className` | `string` | No | Additional CSS classes |

### Expected Callback Behaviors (for Task 2.3 implementation)

| Callback | Expected Behavior |
|----------|-------------------|
| `onEditInstructions` | Navigate to article edit page with savedItemId |
| `onAddNewInstructions` | Reset to content-type step, preserve item metadata |
| `onCreateNewItem` | Full wizard reset |
| `onDone` | Call parent's onCancel or navigate to dashboard |

---

## Acceptance Criteria

- [ ] WhatsNextStep.tsx file created in correct location
- [ ] Component exports match expected interface (named + default export)
- [ ] Props interface properly typed with TypeScript
- [ ] ActionCard internal component implemented with variant support
- [ ] Success header displays with green checkmark
- [ ] Item name displayed correctly in confirmation message
- [ ] Four action options rendered with correct icons and labels
- [ ] "Add New Instructions" has primary (blue) styling
- [ ] "Done" button separated by border divider
- [ ] All buttons have proper focus states (ring-2)
- [ ] Component uses `cn()` utility for class merging
- [ ] JSDoc header includes correct module path and lastModified date
- [ ] No TypeScript errors in strict mode
- [ ] Component renders correctly in isolation (can be tested standalone)

---

## Testing Notes

### Manual Testing (after Task 2.3 integration)
1. Complete full item capture workflow
2. Verify WhatsNextStep appears after successful save
3. Test each of the four action buttons
4. Verify no back button or cancel button present
5. Verify progress indicator is hidden or shows completed state

### Component Testing (this task)
- Can create snapshot test for WhatsNextStep
- Test each callback is invoked correctly on button click
- Test variant styling is applied correctly to ActionCard

---

## Related Documents

- **Source PRD:** `docs/prd/intake/prd-CPL-FAQBNB-Review-2026-01-11-20260111-231607.md`
- **Implementation Plan:** `docs/prd/Plan-105-FAQBNB-Review-2026-01-11-Comprehensive-Implementation.md`
- **Request Tracking:** `docs/gen_requests.md` (Request #187)

---

## Notes

The component implementation provided in the Task Details section of the pipeline configuration contains the complete source code. This overview document serves to:

1. Document the component's purpose and relationship to other tasks
2. Establish dependencies and parallel safety for pipeline execution
3. Define acceptance criteria for verification
4. Provide context for future maintenance

The implementation should follow the exact component structure provided in Plan-105, Task 2.1.
