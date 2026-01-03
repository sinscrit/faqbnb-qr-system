# REQ-086: Create InlineEdit Component - Detailed Task Breakdown

**Document Created:** 2026-01-03T10:15:00
**Last Modified:** 2026-01-03T10:15:00
**Request Reference:** `/docs/gen_requests.md` - REQ-086
**Overview Document:** `/docs/REQ-086-create-inlineedit-component-overview.md`
**Implementation Plan Reference:** `/docs/prd/item-capture-manager-implementation-plan.md`
**Phase:** 6 - Inline Edit & Polish
**Task ID:** 6.1
**Status:** PENDING

---

## Executive Summary

This document provides granular, actionable tasks for implementing the InlineEdit component as specified in REQ-086. The InlineEdit component is a reusable click-to-edit text field with keyboard navigation, loading states, and error handling. It serves as the foundation for inline editing capabilities throughout the ItemManager component.

### Scope

- Create `InlineEdit.tsx` component with full TypeScript types
- Implement state machine (display, editing, saving, error)
- Add keyboard navigation (Enter to save, Escape to cancel)
- Implement loading and error state displays
- Add validation support (built-in and custom)
- Ensure accessibility compliance (ARIA, keyboard-only operation)
- Export component from shared module

### Out of Scope (Deferred to Tasks 6.2 and 6.3)

- Integration with ItemCard/ItemRow components
- Title/location inline editing implementation
- Tags inline editing implementation

---

## Authorized Files and Functions for Modification

### New Files to Create

| File | Purpose |
|------|---------|
| `src/components/ItemManager/components/shared/InlineEdit.tsx` | Main InlineEdit component implementation |

### Existing Files to Modify

| File | Modification |
|------|--------------|
| `src/components/ItemManager/components/shared/index.ts` | Add InlineEdit export (create if directory/file does not exist) |
| `src/components/ItemManager/index.ts` | Re-export InlineEdit if needed for external use |
| `src/components/ItemManager/ItemManager.types.ts` | Add InlineEditProps interface if centralizing types |

### Files NOT to Modify

- Core ItemCapture components (read-only reference)
- Global utility files (`src/lib/utils.ts`) - use existing patterns only
- Any Phase 1-5 components (modifications deferred to tasks 6.2-6.3)

---

## Dependencies

### Hard Dependencies

- Phase 1-5 of ItemManager implementation must be complete (directory structure exists)
- If ItemManager directory does not exist, create the required subdirectories

### Technical Dependencies

| Dependency | Source | Purpose |
|------------|--------|---------|
| `cn()` utility | `src/lib/utils.ts` | Class name merging with Tailwind |
| Lucide React | `lucide-react` (already installed) | Icons (Loader2, Check, X, AlertCircle, Pencil) |
| React hooks | react | useState, useRef, useCallback, useEffect, useId |

---

## Task Breakdown

### Task 1: Create Directory Structure and Types File

**Estimate:** 30 minutes
**Story Points:** 0.5

#### Description

Create the ItemManager shared components directory structure if it doesn't exist and define the InlineEditProps interface.

#### Prerequisites

- None

#### Implementation Steps

1. Check if `src/components/ItemManager/` directory exists; create if not
2. Create `src/components/ItemManager/components/shared/` directory structure
3. Define `InlineEditProps` interface with all required props:
   - `value: string` - Current text value
   - `onSave: (newValue: string) => Promise<void>` - Save callback
   - `onCancel?: () => void` - Optional cancel callback
   - `placeholder?: string` - Placeholder text
   - `disabled?: boolean` - Disabled state
   - `maxLength?: number` - Maximum character length
   - `minLength?: number` - Minimum character length
   - `validate?: (value: string) => string | null` - Custom validation
   - `className?: string` - Container CSS classes
   - `displayClassName?: string` - Display mode CSS classes
   - `inputClassName?: string` - Input field CSS classes
   - `ariaLabel?: string` - Accessible label
   - `trimOnSave?: boolean` - Trim whitespace (default: true)
   - `inputType?: 'text' | 'email' | 'url'` - Input type
   - `allowEmpty?: boolean` - Allow saving empty values (default: false)
4. Define `InlineEditState` type: `'display' | 'editing' | 'saving' | 'error'`

#### Verification Steps

- [ ] Directory `src/components/ItemManager/components/shared/` exists
- [ ] Types are properly exported and TypeScript compilation succeeds
- [ ] All props documented with JSDoc comments

#### Files Modified

- `src/components/ItemManager/components/shared/InlineEdit.tsx` (create)

---

### Task 2: Implement Core Component Shell with Display Mode

**Estimate:** 1 hour
**Story Points:** 1

#### Description

Create the InlineEdit component shell with display mode rendering. The display mode shows the current value as text with a hover indicator.

#### Prerequisites

- Task 1 completed

#### Implementation Steps

1. Create component file with `'use client'` directive
2. Import required dependencies:
   ```typescript
   import React, { useState, useRef, useCallback, useEffect, useId } from 'react';
   import { Loader2, AlertCircle, Pencil } from 'lucide-react';
   import { cn } from '@/lib/utils';
   ```
3. Implement component function with props destructuring and defaults
4. Create internal state using useState:
   - `status: InlineEditState` - Current state (initially 'display')
   - `editValue: string` - Value during editing
   - `errorMessage: string | null` - Current error message
5. Implement display mode render:
   - Show value text (or placeholder if empty)
   - Add hover effect with Pencil icon indicator
   - Make container focusable with tabIndex={0}
   - Add click handler to transition to edit mode
   - Add keyboard handler (Enter/Space) to transition to edit mode
6. Apply Tailwind styling following codebase patterns:
   ```typescript
   const displayStyles = cn(
     'cursor-pointer rounded px-2 py-1',
     'hover:bg-gray-100 transition-colors',
     'focus:outline-none focus:ring-2 focus:ring-blue-500',
     'group inline-flex items-center gap-1',
     disabled && 'cursor-not-allowed opacity-50'
   );
   ```

#### Verification Steps

- [ ] Component renders in display mode with correct text
- [ ] Placeholder displays when value is empty
- [ ] Hover shows Pencil icon indicator
- [ ] Click on display mode transitions state (console.log for now)
- [ ] Tab key allows focusing the component
- [ ] Enter/Space key on focused component triggers edit mode transition

#### Files Modified

- `src/components/ItemManager/components/shared/InlineEdit.tsx`

---

### Task 3: Implement Edit Mode with Input Field

**Estimate:** 1 hour
**Story Points:** 1

#### Description

Implement the editing state with an input field that auto-focuses and shows the current value.

#### Prerequisites

- Task 2 completed

#### Implementation Steps

1. Add ref for input element: `const inputRef = useRef<HTMLInputElement>(null)`
2. Add ref for display element: `const displayRef = useRef<HTMLDivElement>(null)`
3. Store original value when entering edit mode: `const [originalValue, setOriginalValue] = useState('')`
4. Implement `enterEditMode` function:
   - Set status to 'editing'
   - Set editValue to current value
   - Store originalValue for cancel restoration
   - Clear any existing errorMessage
5. Implement edit mode render:
   - Render input field instead of text display
   - Set input value to editValue
   - Add onChange handler to update editValue
   - Apply input styling matching MetadataStep patterns:
     ```typescript
     const inputStyles = cn(
       'w-full px-3 py-2 border rounded-lg transition-colors',
       'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
       'min-h-[40px]',
       errorMessage
         ? 'border-red-300 bg-red-50'
         : 'border-gray-300 hover:border-gray-400',
       inputClassName
     );
     ```
6. Use useEffect to focus input when entering edit mode:
   ```typescript
   useEffect(() => {
     if (status === 'editing' && inputRef.current) {
       inputRef.current.focus();
       inputRef.current.setSelectionRange(
         inputRef.current.value.length,
         inputRef.current.value.length
       );
     }
   }, [status]);
   ```
7. Apply maxLength attribute to input if provided

#### Verification Steps

- [ ] Clicking display mode shows input field
- [ ] Input field auto-focuses when entering edit mode
- [ ] Cursor is positioned at end of text
- [ ] Typing updates the editValue
- [ ] MaxLength constraint is enforced by input
- [ ] Input styling matches codebase patterns

#### Files Modified

- `src/components/ItemManager/components/shared/InlineEdit.tsx`

---

### Task 4: Implement Keyboard Navigation (Enter to Save, Escape to Cancel)

**Estimate:** 45 minutes
**Story Points:** 0.5

#### Description

Add keyboard event handlers for Enter (save) and Escape (cancel) key presses.

#### Prerequisites

- Task 3 completed

#### Implementation Steps

1. Create `handleCancel` function:
   ```typescript
   const handleCancel = useCallback(() => {
     setEditValue(originalValue);
     setStatus('display');
     setErrorMessage(null);
     onCancel?.();
     // Return focus to display element
     setTimeout(() => displayRef.current?.focus(), 0);
   }, [originalValue, onCancel]);
   ```
2. Create placeholder `handleSave` function (full implementation in Task 5):
   ```typescript
   const handleSave = useCallback(async () => {
     // Will be implemented in Task 5
     console.log('Save triggered with value:', editValue);
   }, [editValue]);
   ```
3. Implement `handleKeyDown` function:
   ```typescript
   const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
     if (e.key === 'Escape') {
       e.preventDefault();
       handleCancel();
     } else if (e.key === 'Enter') {
       e.preventDefault();
       handleSave();
     }
   }, [handleCancel, handleSave]);
   ```
4. Attach onKeyDown handler to input element
5. Ensure focus returns to display element after cancel

#### Verification Steps

- [ ] Pressing Escape while editing cancels and restores original value
- [ ] Pressing Enter while editing triggers save (console.log for now)
- [ ] Focus returns to display element after cancel
- [ ] No page navigation or form submission occurs on Enter

#### Files Modified

- `src/components/ItemManager/components/shared/InlineEdit.tsx`

---

### Task 5: Implement Save Logic with Validation

**Estimate:** 1 hour
**Story Points:** 1

#### Description

Implement the full save logic including built-in validation, custom validation, and calling the onSave callback.

#### Prerequisites

- Task 4 completed

#### Implementation Steps

1. Create `validateValue` function:
   ```typescript
   const validateValue = useCallback((value: string): string | null => {
     const trimmed = trimOnSave !== false ? value.trim() : value;

     // Empty check
     if (!allowEmpty && !trimmed) {
       return 'Value cannot be empty';
     }

     // Min length
     if (minLength && trimmed.length < minLength) {
       return `Minimum ${minLength} characters required`;
     }

     // Max length (belt and suspenders - input already enforces)
     if (maxLength && trimmed.length > maxLength) {
       return `Maximum ${maxLength} characters allowed`;
     }

     // Custom validation
     if (validate) {
       return validate(trimmed);
     }

     return null;
   }, [trimOnSave, allowEmpty, minLength, maxLength, validate]);
   ```
2. Update `handleSave` function:
   ```typescript
   const handleSave = useCallback(async () => {
     const trimmed = trimOnSave !== false ? editValue.trim() : editValue;

     // Skip save if value unchanged
     if (trimmed === value) {
       setStatus('display');
       return;
     }

     // Validate
     const validationError = validateValue(editValue);
     if (validationError) {
       setErrorMessage(validationError);
       setStatus('error');
       return;
     }

     // Call onSave
     try {
       setStatus('saving');
       await onSave(trimmed);
       setStatus('display');
       setErrorMessage(null);
       setTimeout(() => displayRef.current?.focus(), 0);
     } catch (error) {
       const message = error instanceof Error ? error.message : 'Save failed';
       setErrorMessage(message);
       setStatus('error');
     }
   }, [editValue, value, trimOnSave, validateValue, onSave]);
   ```
3. Ensure error state shows input with error styling
4. When in error state, editing the value should clear the error and return to 'editing' state:
   ```typescript
   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     setEditValue(e.target.value);
     if (status === 'error') {
       setStatus('editing');
       setErrorMessage(null);
     }
   };
   ```

#### Verification Steps

- [ ] Empty value shows validation error when allowEmpty is false
- [ ] Values shorter than minLength show validation error
- [ ] Custom validation function is called and errors displayed
- [ ] Unchanged values skip the save callback (optimization)
- [ ] Successful save transitions to display mode
- [ ] Failed save (onSave throws) transitions to error state with message
- [ ] Editing after error clears the error state

#### Files Modified

- `src/components/ItemManager/components/shared/InlineEdit.tsx`

---

### Task 6: Implement Blur Handler with Save Trigger

**Estimate:** 45 minutes
**Story Points:** 0.5

#### Description

Implement blur-to-save behavior while preventing double-save race conditions.

#### Prerequisites

- Task 5 completed

#### Implementation Steps

1. Add ref to track if save is in progress: `const isSavingRef = useRef(false)`
2. Update handleSave to set isSavingRef:
   ```typescript
   const handleSave = useCallback(async () => {
     if (isSavingRef.current) return; // Prevent double-save
     isSavingRef.current = true;

     try {
       // ... existing save logic
     } finally {
       isSavingRef.current = false;
     }
   }, [/* dependencies */]);
   ```
3. Implement `handleBlur` function:
   ```typescript
   const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
     // Don't save if clicking on a cancel/dismiss element (if we add buttons later)
     // For now, blur triggers save unless already saving or in error state
     if (status === 'editing' && !isSavingRef.current) {
       handleSave();
     }
   }, [status, handleSave]);
   ```
4. Attach onBlur handler to input element
5. Ensure blur doesn't trigger save when component unmounts or user cancels

#### Verification Steps

- [ ] Clicking outside the input triggers save
- [ ] Tabbing away from input triggers save
- [ ] Rapid blur events don't cause double-save
- [ ] Escape key cancels before blur can trigger save
- [ ] Blur during saving state is ignored

#### Files Modified

- `src/components/ItemManager/components/shared/InlineEdit.tsx`

---

### Task 7: Implement Loading State Display

**Estimate:** 30 minutes
**Story Points:** 0.5

#### Description

Add loading state visual feedback with spinner and disabled input.

#### Prerequisites

- Task 6 completed

#### Implementation Steps

1. Import Loader2 icon from lucide-react (if not already)
2. Add loading state styling:
   ```typescript
   const loadingInputStyles = cn(
     inputStyles,
     'opacity-75 cursor-not-allowed bg-gray-50'
   );
   ```
3. Render loading state UI:
   - Show input field with disabled attribute
   - Add Loader2 spinner with animation
   - Position spinner to the right of input
4. Structure:
   ```tsx
   {status === 'saving' && (
     <div className="relative">
       <input
         {...inputProps}
         disabled
         className={loadingInputStyles}
       />
       <div className="absolute right-2 top-1/2 -translate-y-1/2">
         <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
       </div>
     </div>
   )}
   ```
5. Ensure keyboard events are blocked during saving

#### Verification Steps

- [ ] Loader2 spinner displays during save operation
- [ ] Input is disabled and shows disabled styling
- [ ] Keyboard input is blocked during save
- [ ] Spinner has smooth spin animation

#### Files Modified

- `src/components/ItemManager/components/shared/InlineEdit.tsx`

---

### Task 8: Implement Error State Display

**Estimate:** 45 minutes
**Story Points:** 0.5

#### Description

Add error state UI with error message display and proper ARIA attributes.

#### Prerequisites

- Task 7 completed

#### Implementation Steps

1. Generate unique error ID using useId: `const errorId = useId()`
2. Add error styling to input:
   ```typescript
   const hasError = status === 'error' && errorMessage;
   const inputStylesWithError = cn(
     inputStyles,
     hasError && 'border-red-300 bg-red-50 focus:ring-red-500'
   );
   ```
3. Render error message below input:
   ```tsx
   {hasError && (
     <p
       id={errorId}
       role="alert"
       className="flex items-center gap-1 mt-1 text-sm text-red-600"
     >
       <AlertCircle className="w-4 h-4 flex-shrink-0" />
       {errorMessage}
     </p>
   )}
   ```
4. Add ARIA attributes to input:
   ```tsx
   <input
     aria-invalid={hasError}
     aria-describedby={hasError ? errorId : undefined}
     aria-errormessage={hasError ? errorId : undefined}
     {...otherProps}
   />
   ```
5. Error state should still allow editing (to fix the error)
6. Focus remains on input in error state

#### Verification Steps

- [ ] Error message displays below input on validation failure
- [ ] Error message displays on save failure
- [ ] AlertCircle icon shows next to error message
- [ ] Input has red border styling in error state
- [ ] ARIA attributes are correctly applied
- [ ] Screen reader announces error message
- [ ] User can edit the value while in error state
- [ ] Editing clears the error and returns to editing state

#### Files Modified

- `src/components/ItemManager/components/shared/InlineEdit.tsx`

---

### Task 9: Add Accessibility Enhancements

**Estimate:** 45 minutes
**Story Points:** 0.5

#### Description

Ensure full accessibility compliance with keyboard navigation, ARIA labels, and screen reader support.

#### Prerequisites

- Task 8 completed

#### Implementation Steps

1. Add ariaLabel prop support:
   ```tsx
   <input
     aria-label={ariaLabel || 'Editable text field'}
     {...otherProps}
   />
   ```
2. Add ARIA attributes to display mode:
   ```tsx
   <div
     role="button"
     aria-label={`${ariaLabel || 'Text field'}, click to edit`}
     aria-describedby={value ? undefined : `${id}-placeholder`}
     tabIndex={disabled ? -1 : 0}
     {...otherProps}
   >
   ```
3. Add visual focus indicators that meet WCAG AA contrast requirements
4. Ensure minimum touch target size (48x48px) for mobile:
   ```typescript
   const touchTargetStyles = cn(
     'min-h-[48px]', // Minimum touch target height
     className
   );
   ```
5. Add aria-live region for state change announcements:
   ```tsx
   <span className="sr-only" aria-live="polite">
     {status === 'saving' && 'Saving...'}
     {status === 'display' && value && `Saved: ${value}`}
   </span>
   ```
6. Test keyboard-only operation:
   - Tab to focus display mode
   - Enter/Space to start editing
   - Type new value
   - Enter to save, Escape to cancel
   - Tab to move to next element

#### Verification Steps

- [ ] Tab key navigates to and from the component
- [ ] Enter/Space activates edit mode from display mode
- [ ] All states are keyboard accessible
- [ ] Screen reader announces state changes
- [ ] Focus indicators are clearly visible
- [ ] Touch targets are at least 48x48px
- [ ] ariaLabel prop is correctly applied

#### Files Modified

- `src/components/ItemManager/components/shared/InlineEdit.tsx`

---

### Task 10: Create Barrel Export and Module Integration

**Estimate:** 30 minutes
**Story Points:** 0.5

#### Description

Create the index.ts barrel export file and integrate InlineEdit into the ItemManager module exports.

#### Prerequisites

- Task 9 completed

#### Implementation Steps

1. Create `src/components/ItemManager/components/shared/index.ts`:
   ```typescript
   /**
    * Shared components for ItemManager
    * @module ItemManager/components/shared
    * @lastModified 2026-01-03 (REQ-086)
    */

   export { InlineEdit } from './InlineEdit';
   export type { InlineEditProps } from './InlineEdit';
   ```
2. Update or create `src/components/ItemManager/components/index.ts` to re-export shared:
   ```typescript
   export * from './shared';
   ```
3. Update or create `src/components/ItemManager/index.ts` to export InlineEdit:
   ```typescript
   // Export shared components
   export { InlineEdit } from './components/shared';
   export type { InlineEditProps } from './components/shared';
   ```
4. Verify TypeScript compilation succeeds
5. Verify InlineEdit can be imported from both:
   - `@/components/ItemManager`
   - `@/components/ItemManager/components/shared`

#### Verification Steps

- [ ] Import `{ InlineEdit }` from `@/components/ItemManager` works
- [ ] Import `{ InlineEditProps }` type export works
- [ ] TypeScript shows no compilation errors
- [ ] All exports are properly typed

#### Files Modified

- `src/components/ItemManager/components/shared/index.ts` (create)
- `src/components/ItemManager/components/index.ts` (create if needed)
- `src/components/ItemManager/index.ts` (update or create)

---

### Task 11: Manual Testing and Edge Case Verification

**Estimate:** 1 hour
**Story Points:** 1

#### Description

Perform comprehensive manual testing of all component states and edge cases.

#### Prerequisites

- Task 10 completed

#### Implementation Steps

1. Create a temporary test page or use existing test harness:
   ```tsx
   // In test file or dev page
   import { InlineEdit } from '@/components/ItemManager';

   function TestInlineEdit() {
     const [value, setValue] = useState('Initial Value');

     const handleSave = async (newValue: string) => {
       // Simulate network delay
       await new Promise(resolve => setTimeout(resolve, 1000));
       // Simulate occasional failure
       if (Math.random() < 0.2) {
         throw new Error('Network error');
       }
       setValue(newValue);
     };

     return (
       <div className="p-8 space-y-8">
         <h2>Basic InlineEdit</h2>
         <InlineEdit value={value} onSave={handleSave} />

         <h2>With Placeholder</h2>
         <InlineEdit value="" onSave={handleSave} placeholder="Enter text..." allowEmpty />

         <h2>With Validation</h2>
         <InlineEdit
           value={value}
           onSave={handleSave}
           minLength={3}
           maxLength={50}
           validate={(v) => v.includes('test') ? 'Cannot contain "test"' : null}
         />

         <h2>Disabled</h2>
         <InlineEdit value={value} onSave={handleSave} disabled />
       </div>
     );
   }
   ```
2. Test each scenario from the checklist below
3. Test on mobile device or simulator for touch targets
4. Test with keyboard only (unplug mouse)
5. Test with screen reader (VoiceOver on Mac, NVDA on Windows)

#### Test Checklist

**Display Mode:**
- [ ] Shows current value correctly
- [ ] Shows placeholder when value is empty
- [ ] Pencil icon appears on hover
- [ ] Cursor changes to pointer on hover
- [ ] Disabled state prevents interaction

**Edit Mode Activation:**
- [ ] Click activates edit mode
- [ ] Enter key activates edit mode (when focused)
- [ ] Space key activates edit mode (when focused)
- [ ] Input receives focus automatically
- [ ] Cursor positioned at end of text

**Editing:**
- [ ] Text can be typed and deleted
- [ ] MaxLength prevents typing beyond limit
- [ ] Value updates on each keystroke

**Save Operation:**
- [ ] Enter key triggers save
- [ ] Blur (click outside) triggers save
- [ ] Loading spinner appears during save
- [ ] Input disabled during save
- [ ] Success returns to display mode with new value
- [ ] Failed save shows error message

**Cancel Operation:**
- [ ] Escape key cancels edit
- [ ] Original value is restored
- [ ] Focus returns to display element
- [ ] Error state clears on cancel

**Validation:**
- [ ] Empty value rejected when allowEmpty is false
- [ ] Values below minLength rejected
- [ ] Custom validation function executed
- [ ] Error message displays for validation failures

**Error State:**
- [ ] Error message displays below input
- [ ] AlertCircle icon shows
- [ ] Input has red border
- [ ] Editing clears error and allows retry
- [ ] ARIA attributes announce error

**Edge Cases:**
- [ ] Double-click doesn't cause issues
- [ ] Rapid Enter presses don't double-save
- [ ] Very long text handled with ellipsis in display
- [ ] Special characters handled correctly
- [ ] Network timeout handled gracefully

**Accessibility:**
- [ ] Keyboard-only operation works completely
- [ ] Focus visible at all times
- [ ] Screen reader announces state changes
- [ ] Touch targets are 48x48px minimum
- [ ] Color contrast meets WCAG AA

#### Verification Steps

- [ ] All test checklist items pass
- [ ] No console errors during testing
- [ ] Component works on Chrome, Firefox, Safari
- [ ] Component works on mobile (iOS Safari, Chrome Android)

#### Files Modified

- None (testing only)

---

## Summary

| Task | Title | Estimate | Story Points |
|------|-------|----------|--------------|
| 1 | Create Directory Structure and Types File | 30 min | 0.5 |
| 2 | Implement Core Component Shell with Display Mode | 1 hr | 1 |
| 3 | Implement Edit Mode with Input Field | 1 hr | 1 |
| 4 | Implement Keyboard Navigation | 45 min | 0.5 |
| 5 | Implement Save Logic with Validation | 1 hr | 1 |
| 6 | Implement Blur Handler with Save Trigger | 45 min | 0.5 |
| 7 | Implement Loading State Display | 30 min | 0.5 |
| 8 | Implement Error State Display | 45 min | 0.5 |
| 9 | Add Accessibility Enhancements | 45 min | 0.5 |
| 10 | Create Barrel Export and Module Integration | 30 min | 0.5 |
| 11 | Manual Testing and Edge Case Verification | 1 hr | 1 |
| **Total** | | **~8.5 hours** | **7.5** |

---

## Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Blur/save race conditions | Medium | Medium | Use refs to track save state, prevent double-save |
| Mobile touch handling | Low | Medium | Test on iOS/Android simulators, ensure 48px targets |
| Focus management edge cases | Low | Low | Follow existing MetadataStep patterns |
| Async cleanup on unmount | Low | Medium | Use AbortController or isMounted ref |

---

## References

- [Overview Document](/docs/REQ-086-create-inlineedit-component-overview.md)
- [Implementation Plan](/docs/prd/item-capture-manager-implementation-plan.md) - Phase 6 details
- [ValidationMessage](/src/components/ItemCapture/components/shared/ValidationMessage.tsx) - Error display patterns
- [cn() utility](/src/lib/utils.ts) - Class merging utility
- [gen_requests.md](/docs/gen_requests.md) - REQ-086 requirements

---

## Document History

| Date | Author | Changes |
|------|--------|---------|
| 2026-01-03 | Senior Dev Agent | Initial detailed task breakdown creation |
