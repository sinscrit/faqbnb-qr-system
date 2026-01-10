# REQ-162: Consolidate Content Options - Detailed Task Breakdown

**Document Type:** Detailed Implementation Tasks
**Request ID:** REQ-162
**Phase:** 3 - Remove Redundant Step & Update Labels
**Task ID:** 3.3
**Created:** 2026-01-09 21:45:00 UTC
**Last Modified:** 2026-01-09 21:45:00 UTC
**Overview Reference:** `/docs/REQ-162-consolidate-content-options-overview.md`
**Implementation Plan Reference:** `/docs/prd/Plan-094-UI-UX-Workflow-Improvements.md`

---

## Document Purpose

This document transforms the technical overview for REQ-162 into granular, actionable implementation tasks. Each task is designed to be approximately 1 story point (a few hours of focused work) and includes clear verification steps.

---

## Task Summary

| Task # | Title | Estimated Effort | Dependencies |
|--------|-------|-----------------|--------------|
| 1 | Add UNIFIED_CONTENT_OPTIONS constant to constants.ts | 30 min | None |
| 2 | Update ContentTypeCard to support subtitle prop | 45 min | None |
| 3 | Refactor ContentTypeStep to use unified options | 1.5 hours | Tasks 1, 2 |
| 4 | Update ContentTypeStep props interface | 30 min | Task 3 |
| 5 | Update STEP_TRANSITIONS in useWorkflowState.ts | 30 min | None |
| 6 | Update ItemCreationWorkflow rendering logic | 45 min | Tasks 3, 4, 5 |
| 7 | Remove ContentSourceStep from exports | 15 min | Task 6 |
| 8 | Write unit tests for ContentTypeStep | 1 hour | Tasks 1-4 |
| 9 | Integration testing and verification | 45 min | All tasks |

**Total Estimated Effort:** 6-7 hours

---

## Authorized Files for Modification

Per the overview document, the following files are authorized for modification:

### Primary Files
| File Path | Change Type |
|-----------|-------------|
| `src/components/ItemCreationWorkflow/utils/constants.ts` | MODIFY |
| `src/components/ItemCreationWorkflow/components/steps/ContentTypeStep.tsx` | MAJOR MODIFY |
| `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts` | MODIFY |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | MODIFY |

### Secondary Files
| File Path | Change Type |
|-----------|-------------|
| `src/components/ItemCreationWorkflow/components/steps/ContentSourceStep.tsx` | DELETE or DEPRECATE |
| `src/components/ItemCreationWorkflow/components/steps/index.ts` | MODIFY |

---

## Detailed Tasks

### Task 1: Add UNIFIED_CONTENT_OPTIONS Constant to constants.ts

**File:** `src/components/ItemCreationWorkflow/utils/constants.ts`
**Lines:** After line 163 (after CONTENT_SOURCE_OPTIONS)
**Effort:** 30 minutes

#### Description
Create a new constant array `UNIFIED_CONTENT_OPTIONS` that defines all five unified content creation options with their associated metadata. This constant will replace the separate `EXISTING_CONTENT_OPTIONS` and `CREATE_NEW_OPTIONS` arrays in ContentTypeStep.

#### Implementation Steps

1. Add import for LucideIcon type at top of file:
   ```typescript
   import type { LucideIcon } from 'lucide-react';
   ```

2. Add interface definition after `CONTENT_SOURCE_OPTIONS` (after line 163):
   ```typescript
   /**
    * Interface for unified content options displayed in ContentTypeStep.
    * Consolidates both existing and create-new content types into single grid.
    */
   export interface UnifiedContentOption {
     /** Unique identifier for the option */
     id: string;
     /** Display label for the option */
     label: string;
     /** Optional subtitle text (e.g., supported formats) */
     subtitle?: string;
     /** Icon component from Lucide React */
     icon: string; // Icon name, resolved in component
     /** Content type this option creates */
     contentType: ContentTypeConst | 'file-upload';
     /** Content source classification */
     contentSource: 'existing' | 'create-new';
   }
   ```

3. Add the unified options constant:
   ```typescript
   /**
    * Unified content options for single-grid selection.
    * All five options are displayed together, eliminating the need
    * for separate ContentSourceStep.
    *
    * @see REQ-162 for consolidation requirements
    */
   export const UNIFIED_CONTENT_OPTIONS: UnifiedContentOption[] = [
     {
       id: 'record-video',
       label: 'Record Video',
       icon: 'Video',
       contentType: 'video',
       contentSource: 'create-new',
     },
     {
       id: 'take-photo',
       label: 'Take Photo',
       icon: 'Camera',
       contentType: 'photo',
       contentSource: 'create-new',
     },
     {
       id: 'write-text',
       label: 'Write Text',
       icon: 'PenLine',
       contentType: 'text',
       contentSource: 'create-new',
     },
     {
       id: 'upload-file',
       label: 'Upload File',
       subtitle: 'Video, Image, PDF, Text',
       icon: 'Upload',
       contentType: 'file-upload',
       contentSource: 'existing',
     },
     {
       id: 'add-link',
       label: 'Add Link',
       icon: 'Link',
       contentType: 'url',
       contentSource: 'existing',
     },
   ];
   ```

#### Verification Steps
- [ ] File compiles without TypeScript errors
- [ ] `UNIFIED_CONTENT_OPTIONS` exports correctly from module
- [ ] Interface `UnifiedContentOption` is exported
- [ ] All 5 options have unique `id` values
- [ ] Run: `npm run type-check` passes

---

### Task 2: Update ContentTypeCard to Support Subtitle Prop

**File:** `src/components/ItemCreationWorkflow/components/steps/ContentTypeStep.tsx`
**Lines:** 81-166 (ContentTypeCard component)
**Effort:** 45 minutes

#### Description
Modify the `ContentTypeCard` component to accept and render an optional `subtitle` prop beneath the main label. This is required for the "Upload File" option which displays supported formats.

#### Implementation Steps

1. Update `ContentTypeCardProps` interface (lines 81-86):
   ```typescript
   interface ContentTypeCardProps {
     option: {
       type: string;
       label: string;
       subtitle?: string;  // NEW: Optional subtitle
       icon: LucideIcon;
     };
     isSelected: boolean;
     onSelect: (type: string) => void;
     tabIndex?: number;
   }
   ```

2. Update the Label Section in ContentTypeCard (lines 147-155) to conditionally render subtitle:
   ```typescript
   {/* Label Section */}
   <div className="flex-1 flex flex-col text-left">
     <span
       className={cn(
         'text-base sm:text-lg font-medium',
         isSelected ? 'text-blue-700' : 'text-gray-900'
       )}
     >
       {option.label}
     </span>
     {option.subtitle && (
       <span
         className={cn(
           'text-xs sm:text-sm mt-0.5',
           isSelected ? 'text-blue-500' : 'text-gray-500'
         )}
       >
         {option.subtitle}
       </span>
     )}
   </div>
   ```

#### Verification Steps
- [ ] ContentTypeCard renders correctly without subtitle
- [ ] ContentTypeCard renders subtitle when provided
- [ ] Subtitle styling matches design (smaller text, muted color)
- [ ] Selected state correctly colors subtitle
- [ ] Run: `npm run type-check` passes

---

### Task 3: Refactor ContentTypeStep to Use Unified Options

**File:** `src/components/ItemCreationWorkflow/components/steps/ContentTypeStep.tsx`
**Lines:** 63-75, 172-304 (main component)
**Effort:** 1.5 hours

#### Description
Replace the source-filtered content type display with a unified grid showing all 5 options. Remove dependency on `currentContentSource` prop and update selection handler to set both contentType and contentSource.

#### Implementation Steps

1. Update imports at top of file:
   ```typescript
   import { UNIFIED_CONTENT_OPTIONS, type UnifiedContentOption } from '../../utils/constants';
   ```

2. Remove the old filtered options constants (lines 63-75):
   - DELETE: `EXISTING_CONTENT_OPTIONS` constant
   - DELETE: `CREATE_NEW_OPTIONS` constant

3. Update `ContentTypeOption` interface to match `UnifiedContentOption`:
   ```typescript
   // Remove old ContentTypeOption interface - use UnifiedContentOption from constants
   ```

4. Create icon mapping helper within component:
   ```typescript
   const ICON_MAP: Record<string, LucideIcon> = {
     Video,
     Camera,
     PenLine,
     Upload,
     ImageIcon,
     FileText,
     Type,
     Link,
   };

   const getIconComponent = (iconName: string): LucideIcon => {
     return ICON_MAP[iconName] || Upload;
   };
   ```

5. Update main component to use unified options:
   ```typescript
   export function ContentTypeStep({
     currentSelection,  // NEW: replaces currentContentSource
     onSelectContent,   // NEW: accepts both type and source
     onNext,
     canNext,
     className,
   }: ContentTypeStepProps) {
     // Use unified options directly
     const contentOptions = UNIFIED_CONTENT_OPTIONS;

     // ... rest of component
   }
   ```

6. Remove source-based filtering logic (lines 181-185):
   - DELETE: `useMemo` that filters based on `currentContentSource`

7. Update header text (lines 196-202):
   ```typescript
   const headerText = 'What content would you like to add?';
   const descriptionText = 'Choose how you want to add information for this item';
   ```

8. Update selection handler:
   ```typescript
   const handleContentSelect = useCallback((option: UnifiedContentOption) => {
     onSelectContent(option.contentType, option.contentSource);
     // Auto-advance after visual feedback
     setTimeout(() => {
       onNext();
     }, 150);
   }, [onSelectContent, onNext]);
   ```

9. Update grid rendering to pass resolved icon:
   ```typescript
   {contentOptions.map((option, index) => (
     <ContentTypeCard
       key={option.id}
       ref={(el) => { cardRefs.current[index] = el; }}
       option={{
         type: option.id,
         label: option.label,
         subtitle: option.subtitle,
         icon: getIconComponent(option.icon),
       }}
       isSelected={currentSelection === option.id}
       onSelect={() => handleContentSelect(option)}
       tabIndex={index === activeIndex ? 0 : -1}
     />
   ))}
   ```

10. Update keyboard navigation to work with unified options:
    ```typescript
    onSelect: (index) => {
      handleContentSelect(contentOptions[index]);
    },
    ```

#### Verification Steps
- [ ] All 5 options render in the grid
- [ ] "Upload File" shows subtitle "Video, Image, PDF, Text"
- [ ] Icons render correctly for each option
- [ ] Selection highlights correct option
- [ ] Keyboard navigation works (arrow keys, Enter/Space)
- [ ] Auto-advance occurs after selection
- [ ] Run: `npm run type-check` passes
- [ ] Run: `npm run build` passes

---

### Task 4: Update ContentTypeStep Props Interface

**File:** `src/components/ItemCreationWorkflow/components/steps/ContentTypeStep.tsx`
**Lines:** 44-57 (ContentTypeStepProps interface)
**Effort:** 30 minutes

#### Description
Update the props interface to support the unified content selection pattern. The new interface removes dependency on `currentContentSource` and changes the selection callback signature.

#### Implementation Steps

1. Replace the existing `ContentTypeStepProps` interface:
   ```typescript
   export interface ContentTypeStepProps {
     /** Current selected option id (for visual highlight) */
     currentSelection: string | null;
     /** Handler when content option is selected - receives both type and source */
     onSelectContent: (
       contentType: ContentType | 'file-upload',
       contentSource: 'existing' | 'create-new'
     ) => void;
     /** Handler for proceeding to next step */
     onNext: () => void;
     /** Whether next step navigation is allowed */
     canNext: boolean;
     /** Optional CSS class name */
     className?: string;
   }
   ```

2. Update type imports if needed:
   ```typescript
   import type { ContentType } from '../../ItemCreationWorkflow.types';
   ```

3. Update component docstring to reflect new interface:
   ```typescript
   /**
    * ContentTypeStep Component
    *
    * Displays unified content options in a single grid.
    * Users select from: Record Video, Take Photo, Write Text,
    * Upload File, or Add Link.
    *
    * @module ItemCreationWorkflow/components/steps/ContentTypeStep
    * @see docs/REQ-162-consolidate-content-options-overview.md
    * @lastModified 2026-01-09 (REQ-162 Consolidate Content Options)
    */
   ```

#### Verification Steps
- [ ] Interface exports correctly
- [ ] No TypeScript errors in component
- [ ] Props interface matches usage in ItemCreationWorkflow.tsx
- [ ] Run: `npm run type-check` passes

---

### Task 5: Update STEP_TRANSITIONS in useWorkflowState.ts

**File:** `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`
**Lines:** 76-86 (STEP_TRANSITIONS constant)
**Effort:** 30 minutes

#### Description
Update the step transition map to skip `content-source-selection` and go directly from `specific-item-selection` to `content-type-selection`.

#### Implementation Steps

1. Update `STEP_TRANSITIONS` constant (lines 76-86):
   ```typescript
   export const STEP_TRANSITIONS: Record<WorkflowStep, WorkflowStep[]> = {
     'room-selection': ['item-type-selection', 'specific-item-selection'],
     'item-type-selection': ['specific-item-selection'],
     'specific-item-selection': ['content-type-selection'],  // CHANGED: Skip content-source-selection
     // 'content-source-selection' removed from workflow
     'content-type-selection': ['content-creation'],
     'content-creation': ['preview-save'],
     'preview-save': ['next-action'],
     'next-action': ['room-selection', 'session-summary', 'content-type-selection'],  // CHANGED: Point to content-type-selection
     'session-summary': [],
   };
   ```

2. Update the `ADD_MORE_TO_ITEM` case in the reducer (lines 479-495) to go to `content-type-selection`:
   ```typescript
   case 'ADD_MORE_TO_ITEM': {
     const restoredItem = action.payload;
     const newHistory = [...state.stepHistory, state.currentStep];
     return {
       ...state,
       currentStep: 'content-type-selection',  // CHANGED: Was content-source-selection
       stepHistory: newHistory,
       canGoBack: true,
       currentItem: restoredItem,
       isDirty: true,
       session: {
         ...state.session,
         currentStep: 'content-type-selection',  // CHANGED: Was content-source-selection
         currentItem: restoredItem,
       },
     };
   }
   ```

3. Update `canGoNext` computed value if it references `content-source-selection` (lines 801-826):
   - Remove the `case 'content-source-selection':` branch if present
   - Ensure `content-type-selection` case returns appropriate validation

4. Update the docstring for `STEP_TRANSITIONS`:
   ```typescript
   /**
    * Valid transitions from each step.
    * Used to validate GO_TO_STEP actions and determine NEXT_STEP targets.
    *
    * Notes on conditional transitions:
    * - room-selection: Goes to specific-item-selection if room is 'general' (skips item-type)
    * - specific-item-selection: Goes directly to content-type-selection (REQ-162)
    * - next-action: Goes to room-selection for "Tag New Item", session-summary for "I'm Done",
    *   or content-type-selection for "Add More"
    *
    * @see REQ-162 for content-source-selection removal
    */
   ```

#### Verification Steps
- [ ] specific-item-selection transitions to content-type-selection
- [ ] next-action "Add More" transitions to content-type-selection
- [ ] No references to content-source-selection remain in transitions
- [ ] Run: `npm run type-check` passes
- [ ] Navigation flow works: specific-item -> content-type

---

### Task 6: Update ItemCreationWorkflow Rendering Logic

**File:** `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`
**Lines:** 23, 478-496, 550
**Effort:** 45 minutes

#### Description
Update the main workflow component to remove ContentSourceStep rendering and update ContentTypeStep with the new props interface.

#### Implementation Steps

1. Update imports (line 23) - remove ContentSourceStep:
   ```typescript
   import {
     RoomSelectionStep,
     ItemTypeStep,
     SpecificItemStep,
     // ContentSourceStep removed - REQ-162
     ContentTypeStep,
     ContentCreationStep,
     PreviewSaveStep,
     NextActionStep,
     SessionSummaryStep
   } from './components/steps';
   ```

2. Create handler for unified content selection (add before `renderCurrentStep`):
   ```typescript
   // REQ-162: Handle unified content selection
   const handleUnifiedContentSelect = useCallback((
     contentType: ContentType | 'file-upload',
     contentSource: 'existing' | 'create-new'
   ) => {
     selectContentSource(contentSource);
     if (contentType !== 'file-upload') {
       selectContentType(contentType as ContentType);
     }
     // For 'file-upload', contentType will be determined by FileUploadStep
   }, [selectContentSource, selectContentType]);
   ```

3. Remove ContentSourceStep case from `renderCurrentStep` (lines 478-486):
   ```typescript
   // DELETE entire case block:
   // case 'content-source-selection':
   //   return (
   //     <ContentSourceStep ... />
   //   );
   ```

4. Update ContentTypeStep case (lines 487-496):
   ```typescript
   case 'content-type-selection':
     return (
       <ContentTypeStep
         currentSelection={state.currentItem?.contentType ?? null}
         onSelectContent={handleUnifiedContentSelect}
         onNext={nextStep}
         canNext={canGoNext}
       />
     );
   ```

5. Update `renderCurrentStep` dependency array (line 550) - remove ContentSourceStep references:
   ```typescript
   ], [state.currentStep, state.currentItem, state.session.items, nextStep, prevStep, canGoNext,
       selectRoom, selectItemType, selectSpecificItem, setItemName,
       handleUnifiedContentSelect, // CHANGED: Was selectContentSource, selectContentType
       addContentPiece, removeContentPiece, reorderContent, goToStep, handleSaveItem,
       isSaving, itemCount, handleAddMore, startNewItem, completeSession, existingItems,
       isLoadingExisting, handleEditItem, removeSessionItem, handleProceedToPrint,
       handleFinishWithoutPrint]);
   ```

6. Update `handleAddMore` callback (lines 244-263) if it references content-source-selection:
   - Ensure it calls the correct transition after restoring item state

#### Verification Steps
- [ ] ContentSourceStep import removed
- [ ] No case for 'content-source-selection' in switch
- [ ] ContentTypeStep renders with new props
- [ ] handleUnifiedContentSelect sets both source and type
- [ ] Run: `npm run type-check` passes
- [ ] Run: `npm run build` passes

---

### Task 7: Remove ContentSourceStep from Exports

**File:** `src/components/ItemCreationWorkflow/components/steps/index.ts`
**Lines:** 62-63
**Effort:** 15 minutes

#### Description
Remove ContentSourceStep from the barrel exports. Optionally add a deprecation notice or delete the component file entirely.

#### Implementation Steps

1. Option A - Remove export (lines 62-63):
   ```typescript
   // DELETE these lines:
   // export { ContentSourceStep } from './ContentSourceStep';
   // export type { ContentSourceStepProps } from './ContentSourceStep';
   ```

2. Update the docstring comment (lines 1-37) to reflect new flow:
   ```typescript
   /**
    * ## Step Flow (Updated REQ-162)
    * ```
    * 1. RoomSelectionStep      - Select room (kitchen, bedroom, etc.)
    * 2. ItemTypeStep           - Select category (appliance, room-item, general-info)
    * 3. SpecificItemStep       - Select/name specific item with suggestions
    * 4. ContentTypeStep        - Select unified content option (5 choices)
    * 5. ContentCreationStep    - Create/upload content (delegates to ItemCapture)
    * 6. PreviewSaveStep        - Preview and save the item
    * 7. NextActionStep         - Add more content, new item, or finish
    * 8. SessionSummaryStep     - Review all items and print QR codes
    * ```
    *
    * NOTE: ContentSourceStep removed per REQ-162 - content options consolidated
    */
   ```

3. Option B - Add deprecation to ContentSourceStep.tsx (alternative):
   ```typescript
   /**
    * @deprecated This component is deprecated per REQ-162.
    * Content options are now consolidated in ContentTypeStep.
    * This file retained for backwards compatibility/reference only.
    */
   ```

#### Verification Steps
- [ ] ContentSourceStep not exported from barrel file
- [ ] Import of ContentSourceStep from '@/components/ItemCreationWorkflow/components/steps' fails
- [ ] Documentation updated to show new step flow
- [ ] Run: `npm run type-check` passes
- [ ] Run: `npm run build` passes

---

### Task 8: Write Unit Tests for ContentTypeStep

**File:** `src/components/ItemCreationWorkflow/components/steps/__tests__/ContentTypeStep.test.tsx` (create if not exists)
**Effort:** 1 hour

#### Description
Create comprehensive unit tests for the updated ContentTypeStep component covering all 5 options, subtitle rendering, selection handling, and keyboard navigation.

#### Implementation Steps

1. Create test file with required imports:
   ```typescript
   import { render, screen, fireEvent } from '@testing-library/react';
   import userEvent from '@testing-library/user-event';
   import { ContentTypeStep } from '../ContentTypeStep';
   import { UNIFIED_CONTENT_OPTIONS } from '../../../utils/constants';
   ```

2. Test: All 5 options render
   ```typescript
   describe('ContentTypeStep', () => {
     it('renders all 5 unified content options', () => {
       render(
         <ContentTypeStep
           currentSelection={null}
           onSelectContent={jest.fn()}
           onNext={jest.fn()}
           canNext={false}
         />
       );

       expect(screen.getByText('Record Video')).toBeInTheDocument();
       expect(screen.getByText('Take Photo')).toBeInTheDocument();
       expect(screen.getByText('Write Text')).toBeInTheDocument();
       expect(screen.getByText('Upload File')).toBeInTheDocument();
       expect(screen.getByText('Add Link')).toBeInTheDocument();
     });
   });
   ```

3. Test: Subtitle displays for Upload File
   ```typescript
   it('displays subtitle for Upload File option', () => {
     render(
       <ContentTypeStep
         currentSelection={null}
         onSelectContent={jest.fn()}
         onNext={jest.fn()}
         canNext={false}
       />
     );

     expect(screen.getByText('Video, Image, PDF, Text')).toBeInTheDocument();
   });
   ```

4. Test: Selection triggers correct callback
   ```typescript
   it.each([
     ['Record Video', 'video', 'create-new'],
     ['Take Photo', 'photo', 'create-new'],
     ['Write Text', 'text', 'create-new'],
     ['Upload File', 'file-upload', 'existing'],
     ['Add Link', 'url', 'existing'],
   ])('selecting %s calls onSelectContent with (%s, %s)', async (label, type, source) => {
     const mockSelect = jest.fn();
     render(
       <ContentTypeStep
         currentSelection={null}
         onSelectContent={mockSelect}
         onNext={jest.fn()}
         canNext={false}
       />
     );

     await userEvent.click(screen.getByText(label));

     expect(mockSelect).toHaveBeenCalledWith(type, source);
   });
   ```

5. Test: Selection state visual feedback
   ```typescript
   it('highlights selected option', () => {
     render(
       <ContentTypeStep
         currentSelection="record-video"
         onSelectContent={jest.fn()}
         onNext={jest.fn()}
         canNext={true}
       />
     );

     const recordVideoButton = screen.getByRole('radio', { name: /Record Video/i });
     expect(recordVideoButton).toHaveAttribute('aria-checked', 'true');
   });
   ```

6. Test: Keyboard navigation
   ```typescript
   it('supports keyboard navigation between options', async () => {
     render(
       <ContentTypeStep
         currentSelection={null}
         onSelectContent={jest.fn()}
         onNext={jest.fn()}
         canNext={false}
       />
     );

     const firstOption = screen.getByText('Record Video').closest('button');
     firstOption?.focus();

     await userEvent.keyboard('{ArrowRight}');
     expect(document.activeElement).toHaveTextContent('Take Photo');

     await userEvent.keyboard('{ArrowDown}');
     // Depending on grid layout, verify correct option is focused
   });
   ```

7. Test: Accessibility attributes
   ```typescript
   it('has correct accessibility attributes', () => {
     render(
       <ContentTypeStep
         currentSelection={null}
         onSelectContent={jest.fn()}
         onNext={jest.fn()}
         canNext={false}
       />
     );

     const radiogroup = screen.getByRole('radiogroup');
     expect(radiogroup).toHaveAttribute('aria-label', 'Select content type');

     const buttons = screen.getAllByRole('radio');
     expect(buttons).toHaveLength(5);
   });
   ```

#### Verification Steps
- [ ] All test cases pass
- [ ] Test coverage for ContentTypeStep > 80%
- [ ] Run: `npm test -- ContentTypeStep` passes
- [ ] No accessibility warnings in tests

---

### Task 9: Integration Testing and Verification

**Effort:** 45 minutes

#### Description
Perform end-to-end verification that the workflow navigates correctly with the consolidated content options and that all functionality works as expected.

#### Integration Test Cases

1. **Workflow Navigation Test**
   - Start new item workflow
   - Select room (e.g., Kitchen)
   - Select item type (e.g., Appliance)
   - Select specific item (e.g., Fridge)
   - **Verify:** ContentTypeStep appears (NOT ContentSourceStep)
   - **Verify:** All 5 options visible

2. **Record Video Path Test**
   - Select "Record Video" option
   - **Verify:** contentSource set to 'create-new'
   - **Verify:** contentType set to 'video'
   - **Verify:** Navigation to content-creation step

3. **Upload File Path Test**
   - Select "Upload File" option
   - **Verify:** contentSource set to 'existing'
   - **Verify:** contentType set to 'file-upload' (or handled appropriately)
   - **Verify:** FileUploadStep handles multiple file types

4. **Add Link Path Test**
   - Select "Add Link" option
   - **Verify:** contentSource set to 'existing'
   - **Verify:** contentType set to 'url'
   - **Verify:** Navigation to URL input step

5. **Add More Content Flow Test**
   - Complete item and save
   - On NextActionStep, select "Add More"
   - **Verify:** Navigation to content-type-selection (NOT content-source-selection)
   - **Verify:** All 5 options available for adding more content

6. **Back Navigation Test**
   - Navigate to content-type-selection
   - Press Back button
   - **Verify:** Returns to specific-item-selection (NOT content-source-selection)

#### Manual Verification Checklist

- [ ] Start dev server: `npm run dev`
- [ ] Navigate to /admin/create or workflow entry point
- [ ] Complete workflow navigation test cases above
- [ ] Test on mobile viewport (375px width)
- [ ] Verify keyboard navigation (Tab, Arrow keys, Enter)
- [ ] Verify screen reader announces step changes
- [ ] Check console for any errors or warnings
- [ ] Verify no visual regressions in grid layout

#### Accessibility Verification

- [ ] Run: `npm run lint` (for a11y rules)
- [ ] Tab through all 5 options
- [ ] Verify focus visible indicator
- [ ] Verify aria-checked updates on selection
- [ ] Test with VoiceOver/NVDA if available

---

## Rollback Plan

If issues are discovered after implementation:

1. **Quick Rollback:**
   - Revert STEP_TRANSITIONS to include content-source-selection
   - Restore ContentSourceStep rendering in ItemCreationWorkflow.tsx
   - Restore ContentSourceStep export in index.ts

2. **Files to Revert:**
   - `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`
   - `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`
   - `src/components/ItemCreationWorkflow/components/steps/index.ts`
   - ContentTypeStep.tsx can remain with subtitle support (non-breaking)

---

## Post-Implementation Checklist

- [ ] All 9 tasks completed
- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] Build succeeds (`npm run build`)
- [ ] Accessibility verification complete
- [ ] Code review completed
- [ ] Documentation updated (this file marked complete)
- [ ] Ready for merge to main branch

---

## References

- **Overview Document:** `/docs/REQ-162-consolidate-content-options-overview.md`
- **Implementation Plan:** `/docs/prd/Plan-094-UI-UX-Workflow-Improvements.md` (Phase 3, Task 3.3)
- **Request Definition:** `/docs/gen_requests.md` (REQ-162)
- **Related Requests:**
  - REQ-160: Remove ContentSourceStep (prerequisite)
  - REQ-161: Update ContentTypeStep labels (can be combined)

---

**Document Status:** Ready for Implementation
**Estimated Total Effort:** 6-7 hours
