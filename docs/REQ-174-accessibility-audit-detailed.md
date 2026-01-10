# REQ-174: Accessibility Compliance Verification - Detailed Task Breakdown

**Document Created:** 2026-01-09 23:55 UTC
**Last Modified:** 2026-01-10 08:45 UTC
**Request ID:** REQ-174
**Phase:** 6 - Integration & Polish
**Task ID:** 6.3
**Overview Document:** `/docs/REQ-174-accessibility-audit-overview.md`
**Plan Reference:** `/docs/prd/Plan-094-UI-UX-Workflow-Improvements.md`

---

## Implementation Status

| Task | Description | Status |
|------|-------------|--------|
| 6.3.1 | Set Up Accessibility Testing Infrastructure | COMPLETE |
| 6.3.2 | Audit and Fix PurposeStep ARIA Labels | COMPLETE |
| 6.3.3 | Create PurposeStep Accessibility Tests | COMPLETE |
| 6.3.4 | Audit and Fix ContentPreview Accessibility | COMPLETE |
| 6.3.5 | Create ContentPreview Accessibility Tests | COMPLETE |
| 6.3.6 | Audit and Fix PreviewSaveStep Accessibility | COMPLETE |
| 6.3.7 | Create PreviewSaveStep Accessibility Tests | COMPLETE |
| 6.3.8 | Audit and Fix NextActionStep Accessibility | COMPLETE |
| 6.3.9 | Implement Full Workflow Keyboard Navigation Tests | COMPLETE |
| 6.3.10 | Test Screen Reader Announcements | COMPLETE |
| 6.3.11 | Update accessibility.ts with Purpose Step Support | COMPLETE |
| 6.3.12 | Create Manual Testing Checklist Document | COMPLETE |
| 6.3.13 | Run Final Accessibility Audit and Fix Issues | COMPLETE |

**All Tasks Complete** - 2026-01-10

### Implementation Notes

1. **Accessibility test files created:**
   - `src/components/ItemCreationWorkflow/__tests__/ItemCreationWorkflow.a11y.test.tsx`
   - `src/components/ItemCreationWorkflow/components/steps/__tests__/PurposeStep.a11y.test.tsx`
   - `src/components/ItemCreationWorkflow/components/steps/__tests__/PreviewSaveStep.a11y.test.tsx`
   - `src/components/ItemCreationWorkflow/components/shared/__tests__/ContentPreview.a11y.test.tsx`

2. **Component fixes applied:**
   - ContentPreview.tsx: Improved alt text, aria-hidden on decorative icons, descriptive remove button labels
   - PreviewSaveStep.tsx: Added aria-hidden to back button icon

3. **Manual testing checklist created:**
   - `docs/REQ-174-accessibility-testing-checklist.md`

4. **Test results:** 106 accessibility tests passing across all test files

---

## Document Purpose

This document breaks down the Accessibility Compliance Verification task (REQ-174) into granular, actionable implementation tasks. Each task is designed to be completable within 1 story point (a few hours of focused work) and includes specific verification steps.

The audit focuses on ensuring WCAG 2.1 AA compliance for all new and modified components in the Item Creation Workflow.

---

## Prerequisites

Before starting these tasks, ensure the following are complete:

- [ ] **Phase 1:** Types and Constants (PURPOSE_TYPES, updated state shape)
- [ ] **Phase 2:** PurposeStep component created and integrated
- [ ] **Phase 3:** ContentSourceStep removed, ContentTypeStep consolidated
- [ ] **Phase 4:** Bottom navigation removed from content screens
- [ ] **Phase 5:** PreviewSaveStep redesigned with ContentPreview

---

## Existing Accessibility Infrastructure

The codebase includes robust accessibility utilities in `/src/components/ItemCreationWorkflow/utils/accessibility.ts`:

| Utility | Purpose |
|---------|---------|
| `useReducedMotion()` | Detect user's reduced motion preference |
| `useFocusTrap()` | Trap focus within modals/dialogs |
| `useAnnounce()` | Screen reader live region announcements |
| `useFocusOnMount()` | Focus element when condition is met |
| `createKeyboardNavigator()` | Grid/list keyboard navigation |
| `getStepAnnouncement()` | Generate step context strings |
| `STEP_NAMES` | Human-readable step names |

---

## Authorized Files for Modification

### Files to AUDIT and FIX

| File Path | Modification Type | Specific Areas |
|-----------|-------------------|----------------|
| `src/components/ItemCreationWorkflow/components/steps/PurposeStep.tsx` | AUDIT/FIX | `role`, `aria-*` attributes, keyboard handlers |
| `src/components/ItemCreationWorkflow/components/shared/ContentPreview.tsx` | AUDIT/FIX | `alt` text, `aria-label`, loading states |
| `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx` | AUDIT/FIX | Grid a11y, reorder a11y, edit a11y |
| `src/components/ItemCreationWorkflow/components/steps/NextActionStep.tsx` | AUDIT/FIX | Card navigation, dialog a11y |
| `src/components/ItemCreationWorkflow/components/steps/ContentCreationStep.tsx` | AUDIT/FIX | Subcomponent a11y delegation |
| `src/components/ItemCreationWorkflow/components/steps/ContentTypeStep.tsx` | AUDIT/FIX | Label accuracy |
| `src/components/ItemCreationWorkflow/components/shared/SortableContentPieceCard.tsx` | AUDIT/FIX | Drag-drop keyboard alternative |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | AUDIT | Focus management, announcements |
| `src/components/ItemCreationWorkflow/utils/accessibility.ts` | EXTEND IF NEEDED | Add utilities for new patterns |

### Test Files to CREATE or MODIFY

| File Path | Test Coverage |
|-----------|---------------|
| `src/components/ItemCreationWorkflow/components/steps/__tests__/PurposeStep.a11y.test.tsx` | NEW - Accessibility assertions |
| `src/components/ItemCreationWorkflow/components/shared/__tests__/ContentPreview.a11y.test.tsx` | NEW - Accessibility assertions |
| `src/components/ItemCreationWorkflow/components/steps/__tests__/PreviewSaveStep.a11y.test.tsx` | NEW - Accessibility assertions |
| `src/components/ItemCreationWorkflow/__tests__/ItemCreationWorkflow.a11y.test.tsx` | NEW - Full flow keyboard tests |

### Files to READ ONLY (for reference)

| File Path | Reference Purpose |
|-----------|-------------------|
| `src/components/ItemCreationWorkflow/components/shared/RoomCard.tsx` | Existing a11y pattern reference |
| `src/components/ItemCreationWorkflow/components/shared/ItemTypeCard.tsx` | Existing a11y pattern reference |
| `src/components/ItemCreationWorkflow/components/shared/ConfirmExitDialog.tsx` | Dialog a11y pattern reference |

---

## Task Breakdown

### Task 1: Set Up Accessibility Testing Infrastructure

**Task ID:** 6.3.1
**Effort:** ~2 hours
**Priority:** High
**Dependencies:** None

#### Description

Set up automated accessibility testing tools and create shared test utilities for accessibility assertions.

#### Implementation Steps

1. **Verify jest-axe is installed**
   - Check `package.json` for `jest-axe` dependency
   - If missing, install: `npm install --save-dev jest-axe @types/jest-axe`

2. **Create accessibility test utilities**
   - File: `src/components/ItemCreationWorkflow/__tests__/helpers/a11yTestUtils.ts`
   - Include:
     ```typescript
     import { axe, toHaveNoViolations } from 'jest-axe';
     import { render, RenderResult } from '@testing-library/react';

     expect.extend(toHaveNoViolations);

     /**
      * Runs axe accessibility check on a rendered component
      */
     export async function checkA11y(container: HTMLElement): Promise<void> {
       const results = await axe(container);
       expect(results).toHaveNoViolations();
     }

     /**
      * Simulates keyboard navigation through focusable elements
      */
     export function simulateKeyboardNavigation(
       container: HTMLElement,
       keys: string[]
     ): HTMLElement | null;

     /**
      * Verifies ARIA attributes on an element
      */
     export function verifyAriaAttributes(
       element: HTMLElement,
       expectedAttributes: Record<string, string>
     ): void;

     /**
      * Checks focus visible indicator is present
      */
     export function verifyFocusVisible(element: HTMLElement): void;
     ```

3. **Create eslint-plugin-jsx-a11y configuration check**
   - Verify `.eslintrc.js` or `eslint.config.js` includes jsx-a11y rules
   - If missing, add recommended a11y rules

4. **Export utilities from helpers/index.ts**
   - Add exports for new a11y test utilities

#### Verification Steps

- [ ] Run `npm test -- --testPathPattern="a11yTestUtils"` - should pass
- [ ] Verify `jest-axe` is available for import
- [ ] Run `npm run lint` - should catch any obvious a11y issues
- [ ] TypeScript compilation passes: `npm run type-check`

#### Acceptance Criteria

- [ ] `jest-axe` is properly configured
- [ ] `a11yTestUtils.ts` exports helper functions
- [ ] ESLint jsx-a11y rules are active
- [ ] All utilities have proper TypeScript types

---

### Task 2: Audit and Fix PurposeStep ARIA Labels

**Task ID:** 6.3.2
**Effort:** ~2-3 hours
**Priority:** High
**Dependencies:** Task 6.3.1, PurposeStep component exists

#### Description

Audit PurposeStep component for ARIA compliance and fix any missing or incorrect accessibility attributes.

#### Implementation Steps

1. **Audit current PurposeStep.tsx**
   - Read and document current ARIA attributes
   - Check for:
     - `role="radiogroup"` on container
     - `aria-label` on radiogroup
     - `role="radio"` on each purpose card
     - `aria-checked` state on cards
     - `aria-describedby` for keyboard instructions
     - `tabindex` implementation (roving tabindex pattern)

2. **Fix missing ARIA attributes**
   - File: `src/components/ItemCreationWorkflow/components/steps/PurposeStep.tsx`
   - Ensure grid container has:
     ```tsx
     <div
       role="radiogroup"
       aria-label="Select your purpose for this content"
       aria-describedby="purpose-help"
       className="grid grid-cols-2 gap-4"
     >
     ```
   - Ensure each card has:
     ```tsx
     <button
       role="radio"
       aria-checked={selectedPurpose === purpose.id}
       aria-describedby={`purpose-${purpose.id}-desc`}
       tabIndex={index === activeIndex ? 0 : -1}
     >
     ```
   - Add screen-reader only help text:
     ```tsx
     <p id="purpose-help" className="sr-only">
       Use arrow keys to navigate. Press Enter or Space to select.
     </p>
     ```

3. **Add descriptions for each purpose**
   - Ensure each purpose card has hidden description via `aria-describedby`
   - Use existing `PURPOSE_DESCRIPTIONS` from constants

4. **Verify keyboard navigation is using createKeyboardNavigator**
   - Check that PurposeStep uses the existing `createKeyboardNavigator` utility
   - Ensure arrow key navigation works correctly
   - Verify Home/End keys work

#### Verification Steps

- [ ] Run automated axe scan on PurposeStep - 0 violations
- [ ] Tab into purpose grid - first item receives focus
- [ ] Arrow keys navigate between items
- [ ] Enter/Space selects purpose
- [ ] Screen reader announces "Step X of Y: Select your purpose"
- [ ] Each card announces as "[Purpose Name], radio button, not checked" or "checked"

#### Acceptance Criteria

- [ ] PurposeStep passes axe-core scan with 0 violations
- [ ] All purpose cards have `role="radio"` and `aria-checked`
- [ ] Container has `role="radiogroup"` with descriptive `aria-label`
- [ ] Keyboard navigation follows WAI-ARIA radio group pattern
- [ ] Help text available for screen reader users

---

### Task 3: Create PurposeStep Accessibility Tests

**Task ID:** 6.3.3
**Effort:** ~2 hours
**Priority:** High
**Dependencies:** Task 6.3.2

#### Description

Create comprehensive accessibility tests for the PurposeStep component.

#### Implementation Steps

1. **Create accessibility test file**
   - File: `src/components/ItemCreationWorkflow/components/steps/__tests__/PurposeStep.a11y.test.tsx`

2. **Implement test cases**
   ```typescript
   import { render, screen, fireEvent } from '@testing-library/react';
   import { axe, toHaveNoViolations } from 'jest-axe';
   import { PurposeStep } from '../PurposeStep';
   import { checkA11y, simulateKeyboardNavigation } from '../../../__tests__/helpers/a11yTestUtils';

   expect.extend(toHaveNoViolations);

   describe('PurposeStep Accessibility', () => {
     describe('axe-core compliance', () => {
       it('should have no accessibility violations', async () => {
         const { container } = render(<PurposeStep {...mockProps} />);
         await checkA11y(container);
       });
     });

     describe('ARIA attributes', () => {
       it('should have radiogroup role on container', () => {});
       it('should have aria-label on radiogroup', () => {});
       it('should have radio role on each purpose card', () => {});
       it('should update aria-checked when selection changes', () => {});
       it('should have aria-describedby linking to descriptions', () => {});
     });

     describe('keyboard navigation', () => {
       it('should focus first item when tabbing into grid', () => {});
       it('should move focus with arrow keys', () => {});
       it('should wrap focus at boundaries when loop enabled', () => {});
       it('should select with Enter key', () => {});
       it('should select with Space key', () => {});
       it('should jump to first with Home key', () => {});
       it('should jump to last with End key', () => {});
     });

     describe('screen reader announcements', () => {
       it('should announce step context on mount', () => {});
       it('should announce selection changes', () => {});
     });
   });
   ```

3. **Add helper functions for keyboard simulation**
   - Use `fireEvent.keyDown` for arrow key simulation
   - Verify `document.activeElement` after navigation

#### Verification Steps

- [ ] Run `npm test PurposeStep.a11y.test.tsx` - all tests pass
- [ ] Coverage includes all ARIA attributes
- [ ] Keyboard navigation tests cover all specified keys

#### Acceptance Criteria

- [ ] Test file created with complete coverage
- [ ] All tests pass
- [ ] Tests verify axe-core compliance
- [ ] Tests verify keyboard navigation
- [ ] Tests verify ARIA attribute presence and correctness

---

### Task 4: Audit and Fix ContentPreview Accessibility

**Task ID:** 6.3.4
**Effort:** ~2-3 hours
**Priority:** High
**Dependencies:** Task 6.3.1, ContentPreview component exists

#### Description

Audit ContentPreview component for accessibility, focusing on alt text, loading states, and media descriptions.

#### Implementation Steps

1. **Audit current ContentPreview.tsx**
   - Read and document current accessibility implementation
   - Check for:
     - Meaningful `alt` text for images (not generic "image" or "photo")
     - `aria-label` for video previews
     - Loading state accessibility (`aria-busy`, status text)
     - Error state announcements
     - Remove button accessibility

2. **Fix image alt text**
   - File: `src/components/ItemCreationWorkflow/components/shared/ContentPreview.tsx`
   - Ensure alt text is descriptive:
     ```tsx
     // For images
     <img
       src={content.thumbnailUrl}
       alt={`Preview of ${content.title || 'uploaded image'}`}
     />
     ```

3. **Fix video preview accessibility**
   ```tsx
   <div
     role="img"
     aria-label={`Video preview: ${content.title || 'uploaded video'}, duration ${content.duration || 'unknown'}`}
   >
     <video aria-hidden="true" />
   </div>
   ```

4. **Fix PDF preview accessibility**
   ```tsx
   <div
     role="img"
     aria-label={`PDF document: ${content.title || 'uploaded document'}, ${content.pageCount || 1} pages`}
   >
     {/* Preview thumbnail */}
   </div>
   ```

5. **Fix loading state accessibility**
   ```tsx
   {isLoading && (
     <div
       aria-busy="true"
       aria-label="Loading content preview"
       role="status"
     >
       <span className="sr-only">Loading...</span>
     </div>
   )}
   ```

6. **Fix remove button accessibility**
   ```tsx
   <button
     aria-label={`Remove ${content.title || 'this content'} from item`}
     onClick={onRemove}
   >
     <XIcon aria-hidden="true" />
   </button>
   ```

#### Verification Steps

- [ ] Run automated axe scan on ContentPreview - 0 violations
- [ ] Each content type has appropriate alt/aria-label
- [ ] Loading state announces to screen reader
- [ ] Remove button describes which content will be removed
- [ ] Icons have `aria-hidden="true"`

#### Acceptance Criteria

- [ ] ContentPreview passes axe-core scan
- [ ] Images have meaningful alt text
- [ ] Video/PDF previews have descriptive aria-labels
- [ ] Loading states are properly announced
- [ ] Remove buttons identify the content being removed

---

### Task 5: Create ContentPreview Accessibility Tests

**Task ID:** 6.3.5
**Effort:** ~2 hours
**Priority:** High
**Dependencies:** Task 6.3.4

#### Description

Create accessibility tests for the ContentPreview component covering all content types.

#### Implementation Steps

1. **Create test file**
   - File: `src/components/ItemCreationWorkflow/components/shared/__tests__/ContentPreview.a11y.test.tsx`

2. **Implement test cases**
   ```typescript
   describe('ContentPreview Accessibility', () => {
     describe('axe-core compliance', () => {
       it('should have no violations for image preview', async () => {});
       it('should have no violations for video preview', async () => {});
       it('should have no violations for PDF preview', async () => {});
       it('should have no violations for text preview', async () => {});
       it('should have no violations for URL preview', async () => {});
     });

     describe('image alt text', () => {
       it('should have descriptive alt text', () => {});
       it('should include content title in alt text', () => {});
       it('should have fallback alt when title missing', () => {});
     });

     describe('video accessibility', () => {
       it('should have aria-label with video details', () => {});
       it('should include duration in aria-label', () => {});
       it('should hide video element from screen readers', () => {});
     });

     describe('PDF accessibility', () => {
       it('should announce as PDF document', () => {});
       it('should include page count', () => {});
     });

     describe('loading states', () => {
       it('should have aria-busy when loading', () => {});
       it('should announce loading to screen readers', () => {});
     });

     describe('remove button', () => {
       it('should have descriptive aria-label', () => {});
       it('should include content identifier in label', () => {});
       it('should have icon hidden from screen readers', () => {});
     });
   });
   ```

#### Verification Steps

- [ ] Run `npm test ContentPreview.a11y.test.tsx` - all tests pass
- [ ] Each content type has dedicated test coverage
- [ ] Loading and error states are tested

#### Acceptance Criteria

- [ ] Test file created with comprehensive coverage
- [ ] All content type previews tested
- [ ] Loading/error states tested
- [ ] Remove button accessibility tested

---

### Task 6: Audit and Fix PreviewSaveStep Accessibility

**Task ID:** 6.3.6
**Effort:** ~3 hours
**Priority:** High
**Dependencies:** Task 6.3.1

#### Description

Audit PreviewSaveStep for accessibility including grid navigation, content reordering, and title editing.

#### Implementation Steps

1. **Audit current PreviewSaveStep.tsx**
   - Check for:
     - Proper heading hierarchy (h2, h3)
     - Item details section landmarks
     - Content grid accessibility
     - Drag-and-drop keyboard alternative
     - Title edit field accessibility
     - "Add More" link accessibility

2. **Fix heading hierarchy**
   ```tsx
   <section aria-labelledby="preview-heading">
     <h2 id="preview-heading" tabIndex={-1}>Preview & Save</h2>
     <section aria-labelledby="item-details-heading">
       <h3 id="item-details-heading">Item Details</h3>
       {/* details content */}
     </section>
     <section aria-labelledby="content-heading">
       <h3 id="content-heading">Content ({contentCount} items)</h3>
       {/* content grid */}
     </section>
   </section>
   ```

3. **Fix content grid accessibility**
   ```tsx
   <div
     role="list"
     aria-label="Content items for this item"
   >
     {content.map((piece, index) => (
       <div
         key={piece.id}
         role="listitem"
         aria-label={`${piece.type} content: ${piece.title}, position ${index + 1} of ${content.length}`}
       >
         <ContentPreview content={piece} />
       </div>
     ))}
   </div>
   ```

4. **Add keyboard alternative for drag-and-drop reordering**
   - File: `src/components/ItemCreationWorkflow/components/shared/SortableContentPieceCard.tsx`
   - Add keyboard reorder controls:
     ```tsx
     <button
       aria-label={`Move ${content.title} up`}
       onClick={() => onMoveUp(content.id)}
       disabled={isFirst}
     >
       <ChevronUpIcon aria-hidden="true" />
     </button>
     <button
       aria-label={`Move ${content.title} down`}
       onClick={() => onMoveDown(content.id)}
       disabled={isLast}
     >
       <ChevronDownIcon aria-hidden="true" />
     </button>
     ```

5. **Fix title edit field accessibility**
   ```tsx
   <div role="group" aria-labelledby="title-label">
     <label id="title-label">Title</label>
     <input
       id="item-title"
       aria-describedby="title-help"
       value={title}
       onChange={onTitleChange}
     />
     <span id="title-help" className="sr-only">
       Auto-generated title. You can edit this value.
     </span>
   </div>
   ```

6. **Fix "Add More" link**
   ```tsx
   <a
     href="#"
     role="button"
     aria-label="Add more content to this item"
     onClick={handleAddMore}
   >
     + Add More
   </a>
   ```

#### Verification Steps

- [ ] Run automated axe scan - 0 violations
- [ ] Tab order follows visual layout
- [ ] Content can be reordered using keyboard only
- [ ] Title field has proper label association
- [ ] Screen reader announces content count

#### Acceptance Criteria

- [ ] PreviewSaveStep passes axe-core scan
- [ ] Proper heading hierarchy (h2 > h3)
- [ ] Content grid uses list semantics
- [ ] Keyboard alternative exists for drag-and-drop
- [ ] Title field properly labeled
- [ ] All interactive elements keyboard accessible

---

### Task 7: Create PreviewSaveStep Accessibility Tests

**Task ID:** 6.3.7
**Effort:** ~2 hours
**Priority:** High
**Dependencies:** Task 6.3.6

#### Description

Create accessibility tests for PreviewSaveStep including keyboard reordering tests.

#### Implementation Steps

1. **Create test file**
   - File: `src/components/ItemCreationWorkflow/components/steps/__tests__/PreviewSaveStep.a11y.test.tsx`

2. **Implement test cases**
   ```typescript
   describe('PreviewSaveStep Accessibility', () => {
     describe('axe-core compliance', () => {
       it('should have no violations', async () => {});
       it('should have no violations with multiple content items', async () => {});
       it('should have no violations in empty state', async () => {});
     });

     describe('heading hierarchy', () => {
       it('should have h2 as main heading', () => {});
       it('should have h3 for sections', () => {});
       it('should have logical heading order', () => {});
     });

     describe('content grid accessibility', () => {
       it('should have list role on container', () => {});
       it('should have listitem role on each content', () => {});
       it('should announce content position', () => {});
     });

     describe('keyboard reorder', () => {
       it('should have move up button for non-first items', () => {});
       it('should have move down button for non-last items', () => {});
       it('should update position on keyboard move', () => {});
       it('should announce position change', () => {});
     });

     describe('title editing', () => {
       it('should have associated label', () => {});
       it('should have descriptive help text', () => {});
       it('should be focusable', () => {});
     });
   });
   ```

#### Verification Steps

- [ ] Run `npm test PreviewSaveStep.a11y.test.tsx` - all tests pass
- [ ] Keyboard reorder tests confirm functionality

#### Acceptance Criteria

- [ ] Test file covers all accessibility requirements
- [ ] All tests pass
- [ ] Keyboard reorder is thoroughly tested

---

### Task 8: Audit and Fix NextActionStep Accessibility

**Task ID:** 6.3.8
**Effort:** ~2 hours
**Priority:** Medium
**Dependencies:** Task 6.3.1

#### Description

Audit NextActionStep for card navigation and confirmation dialog accessibility.

#### Implementation Steps

1. **Audit current NextActionStep.tsx**
   - Check for:
     - Action cards container semantics
     - Individual card ARIA attributes
     - Confirmation dialog accessibility (alertdialog pattern)
     - Focus management when dialog opens/closes

2. **Fix action cards container**
   ```tsx
   <div
     role="group"
     aria-label="Choose your next action"
     className="space-y-4"
   >
     {actions.map((action) => (
       <button
         key={action.id}
         role="radio"
         aria-checked={selectedAction === action.id}
         aria-describedby={`action-${action.id}-desc`}
         onClick={() => handleActionSelect(action.id)}
       >
         <span>{action.title}</span>
         <span id={`action-${action.id}-desc`} className="sr-only">
           {action.description}
         </span>
       </button>
     ))}
   </div>
   ```

3. **Fix confirmation dialog**
   - Ensure ConfirmExitDialog follows alertdialog pattern:
     ```tsx
     <div
       role="alertdialog"
       aria-modal="true"
       aria-labelledby="dialog-title"
       aria-describedby="dialog-description"
     >
       <h2 id="dialog-title">Cancel Upload?</h2>
       <p id="dialog-description">
         You have unsaved content. Are you sure you want to cancel?
       </p>
       <button autoFocus>Keep Editing</button>
       <button>Cancel Upload</button>
     </div>
     ```

4. **Verify focus management**
   - Focus should move to dialog when opened
   - Focus should return to trigger when dialog closes
   - Focus should be trapped within dialog

#### Verification Steps

- [ ] Run automated axe scan - 0 violations
- [ ] Tab navigates between action cards
- [ ] Dialog traps focus correctly
- [ ] Focus returns to trigger on dialog close
- [ ] Escape key closes dialog

#### Acceptance Criteria

- [ ] NextActionStep passes axe-core scan
- [ ] Action cards have proper roles and labels
- [ ] Confirmation dialog follows alertdialog pattern
- [ ] Focus management works correctly

---

### Task 9: Implement Full Workflow Keyboard Navigation Tests

**Task ID:** 6.3.9
**Effort:** ~3 hours
**Priority:** High
**Dependencies:** Tasks 6.3.2-6.3.8

#### Description

Create integration tests that verify keyboard-only navigation through the entire workflow.

#### Implementation Steps

1. **Create test file**
   - File: `src/components/ItemCreationWorkflow/__tests__/ItemCreationWorkflow.a11y.test.tsx`

2. **Implement full flow keyboard tests**
   ```typescript
   describe('ItemCreationWorkflow Keyboard Navigation', () => {
     describe('complete flow navigation', () => {
       it('should navigate from room to save using keyboard only', async () => {
         // Tab to Start
         // Tab to room grid, arrow to select, Enter
         // Tab to item type grid, arrow to select, Enter
         // Tab to specific item input, type, Tab to continue, Enter
         // Tab to purpose grid, arrow to select, Enter
         // Tab to content type grid, arrow to select, Enter
         // Complete content creation (keyboard)
         // Tab to Save button, Enter
         // Tab to action cards, arrow to select, Enter
       });

       it('should handle exit flow with keyboard', async () => {
         // Navigate partway through workflow
         // Tab to exit button, Enter
         // Verify focus is in dialog
         // Tab through dialog buttons
         // Press Escape - verify dialog closes
         // Verify focus returns to exit button
       });
     });

     describe('grid navigation patterns', () => {
       it('should navigate room grid with arrow keys', async () => {});
       it('should navigate item type grid with arrow keys', async () => {});
       it('should navigate purpose grid with arrow keys', async () => {});
       it('should navigate content type grid with arrow keys', async () => {});
     });

     describe('focus management', () => {
       it('should focus step heading on step change', async () => {});
       it('should trap focus in exit confirmation dialog', async () => {});
       it('should restore focus after dialog closes', async () => {});
     });
   });
   ```

3. **Create keyboard navigation helper**
   - Add to test utilities:
     ```typescript
     export async function navigateWorkflowWithKeyboard(
       screen: Screen,
       userEvent: UserEvent
     ) {
       // Tab into workflow
       await userEvent.tab();
       // ... comprehensive keyboard navigation
     }
     ```

#### Verification Steps

- [ ] Run `npm test ItemCreationWorkflow.a11y.test.tsx` - all tests pass
- [ ] Complete flow test successfully navigates all steps
- [ ] Exit flow test verifies dialog focus behavior

#### Acceptance Criteria

- [ ] Full workflow is navigable using keyboard only
- [ ] All grid navigation patterns tested
- [ ] Focus management tested for step transitions
- [ ] Dialog focus trapping verified

---

### Task 10: Test Screen Reader Announcements

**Task ID:** 6.3.10
**Effort:** ~2 hours
**Priority:** High
**Dependencies:** Tasks 6.3.2-6.3.8

#### Description

Verify that screen reader announcements are made at appropriate times throughout the workflow.

#### Implementation Steps

1. **Create screen reader announcement tests**
   - Add to existing a11y test files or create dedicated file
   - Test announcements via live region

2. **Test step transition announcements**
   ```typescript
   describe('Screen Reader Announcements', () => {
     it('should announce step 1 on workflow start', async () => {
       render(<ItemCreationWorkflow />);
       const announcement = screen.getByRole('status');
       expect(announcement).toHaveTextContent(/Step 1 of \d+: Select a room/i);
     });

     it('should announce step change when advancing', async () => {
       // Make selection and advance
       // Verify new step announced
     });

     it('should announce selection confirmations', async () => {
       // Select a room
       // Verify "[Room name] selected" announced
     });
   });
   ```

3. **Test content action announcements**
   ```typescript
   describe('Content Action Announcements', () => {
     it('should announce content upload success', async () => {});
     it('should announce content removal', async () => {});
     it('should announce content reorder', async () => {});
     it('should announce errors assertively', async () => {});
   });
   ```

4. **Verify useAnnounce hook usage**
   - Check that components use `useAnnounce()` hook
   - Verify `getStepAnnouncement()` is called on step changes
   - Verify selection announcements are made

#### Verification Steps

- [ ] Step transition announcements tested
- [ ] Selection confirmation announcements tested
- [ ] Content action announcements tested
- [ ] Error announcements use `assertive` priority

#### Acceptance Criteria

- [ ] All step transitions trigger announcements
- [ ] Selection changes are announced
- [ ] Content actions are announced
- [ ] Errors are announced assertively
- [ ] Live region is properly configured

---

### Task 11: Update accessibility.ts with Purpose Step Support

**Task ID:** 6.3.11
**Effort:** ~1 hour
**Priority:** Medium
**Dependencies:** Tasks 6.3.2

#### Description

Update the accessibility utilities to support the new PurposeStep component.

#### Implementation Steps

1. **Update STEP_NAMES constant**
   - File: `src/components/ItemCreationWorkflow/utils/accessibility.ts`
   - Add purpose-selection step name:
     ```typescript
     export const STEP_NAMES: Record<string, string> = {
       'room-selection': 'Select a room',
       'item-type-selection': 'Choose item type',
       'specific-item-selection': 'Name your item',
       'purpose-selection': 'Select your purpose',  // NEW
       'content-type-selection': 'Choose content type',
       'content-creation': 'Create content',
       'preview-save': 'Preview and save',
       'next-action': 'Choose next action',
       'session-summary': 'Session summary',
     };
     ```

2. **Remove content-source-selection if present**
   - Remove deprecated step name if still in STEP_NAMES

3. **Verify getStepAnnouncement works for new step**
   - Test that announcement is generated correctly

#### Verification Steps

- [ ] STEP_NAMES includes 'purpose-selection'
- [ ] STEP_NAMES does not include deprecated steps
- [ ] `getStepAnnouncement()` works for purpose step
- [ ] TypeScript compilation passes

#### Acceptance Criteria

- [ ] STEP_NAMES updated with new step
- [ ] No references to removed steps
- [ ] Announcement generation works correctly

---

### Task 12: Create Manual Testing Checklist Document

**Task ID:** 6.3.12
**Effort:** ~1 hour
**Priority:** Medium
**Dependencies:** Tasks 6.3.1-6.3.11

#### Description

Create a comprehensive manual testing checklist for accessibility verification.

#### Implementation Steps

1. **Create checklist document**
   - File: `docs/manual-test-checklist-req-174-accessibility.md`

2. **Include sections for:**
   - Keyboard-only navigation test script
   - Screen reader testing with VoiceOver (macOS)
   - Screen reader testing with NVDA (Windows)
   - Focus indicator visibility checks
   - Color contrast verification
   - Reduced motion testing
   - Browser zoom testing (200%)

3. **Add test script from overview document**
   - Copy and expand the keyboard test script from overview
   - Add specific checkpoints for each step

4. **Include pass/fail criteria**
   - Define what constitutes passing for each test
   - Document known acceptable deviations

#### Verification Steps

- [ ] Checklist document created
- [ ] All test areas covered
- [ ] Pass/fail criteria defined

#### Acceptance Criteria

- [ ] Comprehensive manual testing checklist exists
- [ ] Checklist covers all accessibility requirements
- [ ] Pass/fail criteria are clear and measurable

---

### Task 13: Run Final Accessibility Audit and Fix Issues

**Task ID:** 6.3.13
**Effort:** ~2-3 hours
**Priority:** High
**Dependencies:** All previous tasks

#### Description

Run comprehensive automated and manual accessibility tests and fix any remaining issues.

#### Implementation Steps

1. **Run automated axe-core scan**
   - Run all a11y tests: `npm test -- --testPathPattern="a11y"`
   - Document any failures

2. **Run manual keyboard navigation test**
   - Follow manual checklist document
   - Document any failures

3. **Run screen reader test (VoiceOver)**
   - Follow manual checklist
   - Document any announcement issues

4. **Fix any identified issues**
   - Create fixes for each issue found
   - Re-run tests to verify fixes

5. **Document results**
   - Update overview document with audit results
   - Mark acceptance criteria as complete

#### Verification Steps

- [ ] All automated tests pass
- [ ] Manual keyboard test passes
- [ ] Screen reader test passes
- [ ] No remaining critical or serious violations

#### Acceptance Criteria

- [ ] axe-core: 0 critical, 0 serious violations
- [ ] Keyboard-only completion rate: 100%
- [ ] Screen reader announcement coverage: 100%
- [ ] Focus visible on all interactive elements
- [ ] All acceptance criteria from REQ-174 met

---

## Success Metrics

| Metric | Target |
|--------|--------|
| axe-core violations | 0 critical, 0 serious |
| Keyboard-only completion rate | 100% of flows |
| Screen reader announcement coverage | 100% of state changes |
| Focus visible states | 100% of interactive elements |
| WCAG 2.1 AA compliance | Full compliance |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Missing ARIA on new components | Medium | High | Comprehensive automated tests |
| Drag-drop not keyboard accessible | High | High | Add keyboard alternative (Task 6.3.6) |
| Screen reader conflicts | Low | Medium | Test multiple screen readers |
| Focus lost during async ops | Medium | Medium | Track and restore focus |
| Grid navigation issues | Medium | High | Use existing `createKeyboardNavigator` |

---

## References

- **Overview Document**: `/docs/REQ-174-accessibility-audit-overview.md`
- **Implementation Plan**: `/docs/prd/Plan-094-UI-UX-Workflow-Improvements.md`
- **Accessibility Utilities**: `/src/components/ItemCreationWorkflow/utils/accessibility.ts`
- **Previous A11y Work**: `docs/REQ-114-accessibility-mobile-optimization-overview.md`
- **WCAG 2.1 Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/
- **WAI-ARIA Practices**: https://www.w3.org/WAI/ARIA/apg/

---

*Document generated as detailed task breakdown for REQ-174 Accessibility Audit implementation.*
