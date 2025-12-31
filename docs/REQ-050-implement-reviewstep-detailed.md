# REQ-050: Implement ReviewStep Component - Detailed Task Breakdown

**Document Created:** 2025-12-31T19:30:00
**Last Modified:** 2025-12-31T19:30:00
**Overview Reference:** `/docs/REQ-050-implement-reviewstep-overview.md`
**Implementation Plan:** `/docs/prd/item-capture-implementation-plan.md`
**Phase:** 5 - Review & Polish
**Task ID:** 5.1
**Status:** Ready for Implementation

---

## Document Purpose

This document provides granular, implementation-ready tasks for the ReviewStep component. Each task is scoped to approximately 1 story point (a few hours of focused work) and includes specific verification steps. Developers should work through tasks sequentially within each section unless noted as parallelizable.

---

## Pre-Implementation Checklist

Before starting implementation, verify the following prerequisites are complete:

- [ ] Phase 1 (Foundation) complete: Types, state machine, wizard navigation exist
- [ ] Phase 2 (Media Capture) complete: Video and photo capture produce MediaItem objects
- [ ] Phase 3 (File Upload & Text) complete: Upload and markdown content produce data
- [ ] Phase 4 (Editing Features) complete: Editing produces modified media items
- [ ] Dependencies installed: `react-markdown` (^9.1.0), `lucide-react` (^0.525.0)
- [ ] CaptureWizard.tsx exists and renders step components
- [ ] useItemCaptureState hook exists with state and dispatch

---

## Authorized Files for Modification

### Files to CREATE

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemCapture/components/steps/ReviewStep.tsx` | Main ReviewStep component |

### Files to MODIFY

| File Path | Modification |
|-----------|--------------|
| `src/components/ItemCapture/components/CaptureWizard.tsx` | Import and render ReviewStep for 'review' step |
| `src/components/ItemCapture/index.ts` | Export ReviewStep if needed externally |
| `src/components/ItemCapture/hooks/useItemCaptureState.ts` | Ensure REORDER_MEDIA and REMOVE_MEDIA actions exist |

### Reference Files (Read-Only Patterns)

| File Path | Pattern Reference |
|-----------|-------------------|
| `src/components/ItemForm.tsx` | Link reordering pattern (moveLink function at line 154-166) |
| `src/components/ConfirmationModal.tsx` | Modal overlay pattern |
| `src/lib/utils.ts` | `cn()` utility for class merging |

---

## Task Breakdown

### Section 1: Component Skeleton and Types (3 tasks)

#### Task 1.1: Create ReviewStep.tsx with TypeScript Interfaces

**Objective:** Create the ReviewStep component file with all TypeScript interfaces and basic structure.

**Files to Modify:**
- CREATE: `src/components/ItemCapture/components/steps/ReviewStep.tsx`

**Implementation Steps:**

1. Create the file at `src/components/ItemCapture/components/steps/ReviewStep.tsx`

2. Add the `'use client'` directive at the top

3. Define the `ReviewStepProps` interface with these properties:
   - `metadata: ItemMetadata` - All captured metadata
   - `mediaItems: MediaItem[]` - Array of media items
   - `instructions: string` - Markdown-formatted instructions
   - `onSubmit: () => void` - Submit callback
   - `onCancel: () => void` - Cancel callback
   - `onEditSection: (section: 'metadata' | 'content-type' | 'capture' | 'text') => void` - Navigation callback
   - `onRemoveMedia: (mediaId: string) => void` - Remove media callback
   - `onReorderMedia: (mediaId: string, direction: 'up' | 'down') => void` - Reorder callback
   - `onEditMedia: (mediaId: string) => void` - Edit media callback
   - `isSubmitting?: boolean` - Loading state (optional)
   - `className?: string` - CSS class (optional)
   - `debug?: boolean` - Debug mode (optional)

4. Define the `MediaItemCardProps` interface with:
   - `item: MediaItem`
   - `index: number`
   - `totalItems: number`
   - `onMoveUp: () => void`
   - `onMoveDown: () => void`
   - `onRemove: () => void`
   - `onEdit: () => void`

5. Create a skeleton `ReviewStep` component that:
   - Accepts ReviewStepProps
   - Returns a div with className applied
   - Has placeholder text "ReviewStep Component"

6. Export the component as both named and default export

**Verification:**
- [ ] File compiles without TypeScript errors
- [ ] Component renders placeholder text when imported
- [ ] All interface properties are properly typed

**Estimated Time:** 30 minutes

---

#### Task 1.2: Add Internal State Management

**Objective:** Add internal state for modal dialogs, announcements, and validation.

**Files to Modify:**
- `src/components/ItemCapture/components/steps/ReviewStep.tsx`

**Implementation Steps:**

1. Import useState, useEffect, useRef, useCallback from React

2. Add internal state variables:
   ```typescript
   const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
   const [showCancelConfirm, setShowCancelConfirm] = useState(false);
   const [announcement, setAnnouncement] = useState('');
   ```

3. Add refs for cleanup:
   ```typescript
   const urlsRef = useRef<string[]>([]);
   ```

4. Add computed validation:
   ```typescript
   const hasContent = mediaItems.length > 0 || instructions.trim().length > 0;
   const isValid = metadata.title.trim().length > 0 && hasContent;
   ```

5. Add useEffect for cleanup on unmount:
   ```typescript
   useEffect(() => {
     return () => {
       urlsRef.current.forEach(url => URL.revokeObjectURL(url));
     };
   }, []);
   ```

**Verification:**
- [ ] State variables initialize correctly
- [ ] Validation logic returns expected values for edge cases
- [ ] No memory leaks (console shows no warnings about cleanup)

**Estimated Time:** 30 minutes

---

#### Task 1.3: Import Dependencies and Icons

**Objective:** Set up all required imports for the ReviewStep component.

**Files to Modify:**
- `src/components/ItemCapture/components/steps/ReviewStep.tsx`

**Implementation Steps:**

1. Add import for dynamic (for lazy loading react-markdown):
   ```typescript
   import dynamic from 'next/dynamic';
   ```

2. Add Lucide icons import:
   ```typescript
   import {
     Edit,
     Trash2,
     ChevronUp,
     ChevronDown,
     Check,
     X,
     Loader2,
     Video,
     Image,
     FileText,
     Play,
     Plus,
   } from 'lucide-react';
   ```

3. Add utility import:
   ```typescript
   import { cn } from '@/lib/utils';
   ```

4. Add lazy-loaded ReactMarkdown:
   ```typescript
   const ReactMarkdown = dynamic(() => import('react-markdown'), {
     ssr: false,
     loading: () => <div className="animate-pulse h-20 bg-gray-100 rounded" />,
   });
   ```

5. Add type imports (adjust path based on actual location):
   ```typescript
   import type { MediaItem, ItemMetadata } from '../../ItemCapture.types';
   ```

**Verification:**
- [ ] All imports resolve without errors
- [ ] No unused import warnings
- [ ] ReactMarkdown lazy loads correctly (check network tab)

**Estimated Time:** 20 minutes

---

### Section 2: Metadata Summary Section (2 tasks)

#### Task 2.1: Implement Metadata Summary Layout

**Objective:** Create the metadata summary section showing title, location, tags, and appliance type.

**Files to Modify:**
- `src/components/ItemCapture/components/steps/ReviewStep.tsx`

**Implementation Steps:**

1. Replace the placeholder content in ReviewStep with:
   - A container div with flex column layout
   - A heading: "Review Your Item"
   - A section element with white background, rounded corners, shadow, and border

2. Add the section header with:
   - h3 element: "Item Details"
   - Edit button aligned right that calls `onEditSection('metadata')`
   - Use flexbox for the header layout

3. Add a description list (`dl`) with grid layout (1 column on mobile, 2 on md+):
   - Title field (always shown, show "—" if empty)
   - Location field (conditionally shown if `metadata.location` exists)
   - Appliance Type field (conditionally shown if `metadata.applianceType` exists)
   - Tags field (conditionally shown, spans 2 columns on md+)

4. Style the tags as inline pills:
   - Gray background (`bg-gray-100`)
   - Small text (`text-sm`)
   - Rounded corners
   - Map over `metadata.tags` array

5. Apply Tailwind classes matching the overview specification:
   - Section: `bg-white rounded-lg shadow-sm border border-gray-200 p-6`
   - Edit button: `flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm`

**Verification:**
- [ ] Title displays correctly (or "—" when empty)
- [ ] Optional fields only show when data exists
- [ ] Tags render as styled pills
- [ ] Edit button is visible and aligned correctly
- [ ] Responsive grid works (1 column mobile, 2 columns desktop)

**Estimated Time:** 45 minutes

---

#### Task 2.2: Wire Edit Button to Navigation Callback

**Objective:** Connect the Edit button to navigate back to MetadataStep.

**Files to Modify:**
- `src/components/ItemCapture/components/steps/ReviewStep.tsx`

**Implementation Steps:**

1. Add onClick handler to the Edit button:
   ```typescript
   onClick={() => onEditSection('metadata')}
   ```

2. Ensure button has accessible attributes:
   - `type="button"`
   - `aria-label="Edit item details"`

3. Add the Edit icon from Lucide with proper sizing:
   ```typescript
   <Edit className="w-4 h-4" />
   ```

4. Add visual feedback on hover/focus:
   - Hover color change (already in classes from 2.1)
   - Focus ring for accessibility

**Verification:**
- [ ] Clicking Edit button triggers onEditSection callback with 'metadata'
- [ ] Button is keyboard accessible (can tab to it, Enter activates it)
- [ ] Icon renders correctly at proper size

**Estimated Time:** 15 minutes

---

### Section 3: Media Gallery Section (4 tasks)

#### Task 3.1: Create Media Gallery Container

**Objective:** Create the media gallery section container with header and empty state.

**Files to Modify:**
- `src/components/ItemCapture/components/steps/ReviewStep.tsx`

**Implementation Steps:**

1. Add a new section element below the metadata section with:
   - `mt-6` for spacing
   - Same styling as metadata section: `bg-white rounded-lg shadow-sm border border-gray-200 p-6`

2. Create the section header with:
   - h3 showing item count: "Media & Files (X items)" using singular/plural logic
   - "Add More" button aligned right that calls `onEditSection('content-type')`
   - Plus icon in the button

3. Implement empty state UI (when `mediaItems.length === 0`):
   - Centered content with dashed border
   - Image icon (grayed out)
   - Text: "No media items added yet"
   - "Add Media" button

4. Add conditional rendering:
   - If no media items: show empty state
   - If media items exist: render grid container (placeholder for now)

**Verification:**
- [ ] Section header shows correct item count with proper pluralization
- [ ] Empty state displays when mediaItems is empty array
- [ ] "Add More" and "Add Media" buttons trigger correct navigation
- [ ] Spacing between sections is consistent

**Estimated Time:** 30 minutes

---

#### Task 3.2: Implement Responsive Thumbnail Grid

**Objective:** Create the responsive CSS grid for displaying media item thumbnails.

**Files to Modify:**
- `src/components/ItemCapture/components/steps/ReviewStep.tsx`

**Implementation Steps:**

1. Replace the grid placeholder with actual grid container:
   ```typescript
   <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
   ```

2. Map over mediaItems array and render placeholder cards for now:
   ```typescript
   {mediaItems.map((item, index) => (
     <div key={item.id} className="aspect-square bg-gray-100 rounded-lg">
       Placeholder {index + 1}
     </div>
   ))}
   ```

3. Verify grid behavior at each breakpoint:
   - Default (mobile): 2 columns
   - sm (640px+): 3 columns
   - md (768px+): 4 columns
   - lg (1024px+): 5 columns

**Verification:**
- [ ] Grid displays correct number of columns at each breakpoint
- [ ] Cards maintain 1:1 aspect ratio
- [ ] Gap between cards is consistent
- [ ] Grid works with 1, 2, 5, and 10+ items

**Estimated Time:** 20 minutes

---

#### Task 3.3: Create MediaItemCard Sub-Component

**Objective:** Implement the MediaItemCard component for displaying individual media thumbnails.

**Files to Modify:**
- `src/components/ItemCapture/components/steps/ReviewStep.tsx`

**Implementation Steps:**

1. Create the MediaItemCard function component after the main ReviewStep component (but before the export):

2. Add thumbnail URL state management:
   ```typescript
   const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

   useEffect(() => {
     if (item.thumbnail) {
       const url = URL.createObjectURL(item.thumbnail);
       urlsRef.current.push(url);
       setThumbnailUrl(url);
     }
   }, [item.thumbnail, urlsRef]);
   ```

3. Define type configuration object:
   ```typescript
   const typeConfig = {
     video: { icon: Video, color: 'bg-purple-100 text-purple-700', label: 'Video' },
     image: { icon: Image, color: 'bg-blue-100 text-blue-700', label: 'Photo' },
     pdf: { icon: FileText, color: 'bg-amber-100 text-amber-700', label: 'PDF' },
   };
   ```

4. Implement the card structure:
   - Relative container with group class for hover effects
   - Button element for the thumbnail (calls onEdit)
   - Aspect-square thumbnail display
   - Image tag or placeholder icon
   - Video play overlay (only for video type)
   - Type badge (top-left corner)
   - Order badge (top-right corner)

5. Add the thumbnail display logic:
   - If thumbnailUrl exists: show img tag with object-cover
   - If no thumbnail: show placeholder with TypeIcon centered

6. Add video-specific overlay:
   ```typescript
   {item.type === 'video' && (
     <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
       <Play className="w-8 h-8 text-white" />
     </div>
   )}
   ```

**Verification:**
- [ ] Thumbnail displays for items with thumbnail property
- [ ] Placeholder icon shows for items without thumbnail
- [ ] Video items show play overlay
- [ ] Type badge shows correct icon and color
- [ ] Order badge shows correct number (1-indexed)
- [ ] Clicking thumbnail triggers onEdit callback

**Estimated Time:** 1 hour

---

#### Task 3.4: Add Reorder and Remove Action Buttons

**Objective:** Add the hover-visible action buttons for reordering and removing media items.

**Files to Modify:**
- `src/components/ItemCapture/components/steps/ReviewStep.tsx`

**Implementation Steps:**

1. Add the action button container at the bottom of MediaItemCard:
   ```typescript
   <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
   ```

2. Add move up button:
   - ChevronUp icon
   - Disabled when index === 0
   - onClick calls onMoveUp (with stopPropagation)
   - `aria-label="Move up"`

3. Add move down button:
   - ChevronDown icon
   - Disabled when index === totalItems - 1
   - onClick calls onMoveDown (with stopPropagation)
   - `aria-label="Move down"`

4. Add remove button:
   - Trash2 icon
   - Red color on hover
   - onClick calls onRemove (with stopPropagation)
   - `aria-label="Remove"`

5. Style the buttons:
   - Small padding: `p-1`
   - White background: `bg-white`
   - Rounded corners
   - Disabled state styling

6. Update the grid mapping to pass all required props to MediaItemCard:
   ```typescript
   <MediaItemCard
     key={item.id}
     item={item}
     index={index}
     totalItems={mediaItems.length}
     onMoveUp={() => handleReorder(item.id, 'up')}
     onMoveDown={() => handleReorder(item.id, 'down')}
     onRemove={() => setConfirmDeleteId(item.id)}
     onEdit={() => onEditMedia(item.id)}
     urlsRef={urlsRef}
   />
   ```

**Verification:**
- [ ] Action buttons appear on hover
- [ ] Action buttons appear on focus within (keyboard navigation)
- [ ] Move up disabled for first item
- [ ] Move down disabled for last item
- [ ] Button clicks don't trigger the parent thumbnail onClick
- [ ] All buttons have proper aria-labels

**Estimated Time:** 45 minutes

---

### Section 4: Instructions Preview Section (2 tasks)

#### Task 4.1: Create Instructions Preview Container

**Objective:** Create the instructions section with markdown rendering.

**Files to Modify:**
- `src/components/ItemCapture/components/steps/ReviewStep.tsx`

**Implementation Steps:**

1. Add a new section element below the media gallery section with:
   - `mt-6` for spacing
   - Same styling as other sections

2. Create the section header with:
   - h3 element: "Instructions"
   - Edit button aligned right that calls `onEditSection('text')`
   - Edit icon in the button

3. Add conditional content rendering:
   - If instructions exist: render ReactMarkdown with prose styling
   - If no instructions: render "No instructions added" with link to add

4. Wrap ReactMarkdown in prose container:
   ```typescript
   <div className="prose prose-sm max-w-none">
     <ReactMarkdown>{instructions}</ReactMarkdown>
   </div>
   ```

5. Add the empty state:
   ```typescript
   <div className="text-gray-500 italic">
     No instructions added.{' '}
     <button
       onClick={() => onEditSection('text')}
       className="text-blue-600 hover:underline"
     >
       Add instructions
     </button>
   </div>
   ```

**Verification:**
- [ ] Instructions render as formatted markdown
- [ ] Empty state shows when instructions is empty string
- [ ] Edit button navigates to text editor
- [ ] "Add instructions" link works in empty state
- [ ] Prose styling applied (headers, lists, links formatted)

**Estimated Time:** 30 minutes

---

#### Task 4.2: Add Validation Warning Banner

**Objective:** Display a warning when content is incomplete.

**Files to Modify:**
- `src/components/ItemCapture/components/steps/ReviewStep.tsx`

**Implementation Steps:**

1. Add the validation warning below the instructions section (conditional):
   ```typescript
   {!isValid && (
     <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded mt-6">
       <p className="text-sm">
         Please add a title and at least one media item or instructions before submitting.
       </p>
     </div>
   )}
   ```

2. The warning should display when:
   - Title is empty OR
   - Both mediaItems and instructions are empty

3. Add appropriate styling:
   - Yellow background
   - Yellow border
   - Dark yellow text
   - Small text size

**Verification:**
- [ ] Warning shows when title is empty
- [ ] Warning shows when both media and instructions are empty
- [ ] Warning hides when all required content exists
- [ ] Warning styling matches design spec

**Estimated Time:** 15 minutes

---

### Section 5: Action Buttons (2 tasks)

#### Task 5.1: Implement Submit and Cancel Buttons

**Objective:** Create the action bar with Submit and Cancel buttons.

**Files to Modify:**
- `src/components/ItemCapture/components/steps/ReviewStep.tsx`

**Implementation Steps:**

1. Add action bar container after the validation warning:
   ```typescript
   <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
   ```

2. Add Cancel button (left side):
   - X icon before text
   - Gray text color
   - onClick triggers cancel confirmation modal
   - Disabled when isSubmitting

3. Add Submit button (right side):
   - Loading state with Loader2 spinner when isSubmitting
   - Check icon before text when not loading
   - Blue background
   - Disabled when isSubmitting OR !isValid
   - onClick calls onSubmit

4. Apply button styling:
   - Cancel: `px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors`
   - Submit: `px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed`

5. Use cn() for conditional class merging on Submit button

**Verification:**
- [ ] Cancel button triggers confirmation modal
- [ ] Submit button disabled when validation fails
- [ ] Submit button shows spinner when isSubmitting
- [ ] Both buttons disabled during submission
- [ ] Button alignment is correct (space-between)

**Estimated Time:** 30 minutes

---

#### Task 5.2: Handle Reorder and Remove Callbacks

**Objective:** Implement the handler functions for media reorder and remove with announcements.

**Files to Modify:**
- `src/components/ItemCapture/components/steps/ReviewStep.tsx`

**Implementation Steps:**

1. Create handleReorder function:
   ```typescript
   const handleReorder = (mediaId: string, direction: 'up' | 'down') => {
     onReorderMedia(mediaId, direction);
     const index = mediaItems.findIndex(item => item.id === mediaId);
     const newPosition = direction === 'up' ? index : index + 2;
     setAnnouncement(`Item moved to position ${newPosition}`);
   };
   ```

2. Create handleConfirmRemove function:
   ```typescript
   const handleConfirmRemove = () => {
     if (confirmDeleteId) {
       onRemoveMedia(confirmDeleteId);
       setAnnouncement('Item removed');
       setConfirmDeleteId(null);
     }
   };
   ```

3. Add the accessibility live region at the end of the component:
   ```typescript
   <div aria-live="polite" className="sr-only">
     {announcement}
   </div>
   ```

4. Update the MediaItemCard mapping to use handleReorder instead of direct callback

**Verification:**
- [ ] Reorder calls the parent callback with correct parameters
- [ ] Remove confirmation sets the confirmDeleteId state
- [ ] Announcements update for screen readers
- [ ] Live region is hidden visually but accessible

**Estimated Time:** 30 minutes

---

### Section 6: Confirmation Modals (2 tasks)

#### Task 6.1: Implement Delete Confirmation Modal

**Objective:** Create the modal for confirming media item removal.

**Files to Modify:**
- `src/components/ItemCapture/components/steps/ReviewStep.tsx`

**Implementation Steps:**

1. Add the delete confirmation modal (rendered conditionally when confirmDeleteId is not null):
   ```typescript
   {confirmDeleteId && (
     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
   ```

2. Create the modal card with:
   - White background, rounded corners, padding
   - Max width of sm, centered with mx-4
   - Title: "Remove this item?"
   - Message explaining the action
   - Two buttons: "Keep" (cancel) and "Remove" (confirm)

3. Wire up the buttons:
   - "Keep" button: sets confirmDeleteId to null
   - "Remove" button: calls handleConfirmRemove

4. Style the Remove button as destructive (red):
   ```typescript
   className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
   ```

5. Follow the pattern from `src/components/ConfirmationModal.tsx` for consistency

**Verification:**
- [ ] Modal appears when delete button clicked
- [ ] Modal covers entire screen with dark overlay
- [ ] Clicking "Keep" closes modal without removing
- [ ] Clicking "Remove" removes item and closes modal
- [ ] Modal is centered on all screen sizes

**Estimated Time:** 30 minutes

---

#### Task 6.2: Implement Cancel Confirmation Modal

**Objective:** Create the modal for confirming wizard cancellation.

**Files to Modify:**
- `src/components/ItemCapture/components/steps/ReviewStep.tsx`

**Implementation Steps:**

1. Add the cancel confirmation modal (rendered conditionally when showCancelConfirm is true):
   ```typescript
   {showCancelConfirm && (
     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
   ```

2. Create the modal card with:
   - Title: "Discard all changes?"
   - Message warning that all data will be lost
   - Two buttons: "Continue Editing" (cancel) and "Discard" (confirm)

3. Wire up the buttons:
   - "Continue Editing": sets showCancelConfirm to false
   - "Discard": calls onCancel and closes modal

4. Style the Discard button as destructive (red)

5. Update the Cancel button in the action bar to:
   ```typescript
   onClick={() => setShowCancelConfirm(true)}
   ```

**Verification:**
- [ ] Modal appears when Cancel button clicked
- [ ] "Continue Editing" closes modal and stays on ReviewStep
- [ ] "Discard" calls onCancel callback
- [ ] Warning message is clear about data loss

**Estimated Time:** 30 minutes

---

### Section 7: Integration (2 tasks)

#### Task 7.1: Integrate ReviewStep with CaptureWizard

**Objective:** Wire up ReviewStep to render when the wizard reaches the 'review' step.

**Files to Modify:**
- `src/components/ItemCapture/components/CaptureWizard.tsx`

**Implementation Steps:**

1. Import ReviewStep at the top of CaptureWizard:
   ```typescript
   import { ReviewStep } from './steps/ReviewStep';
   ```

2. Add the 'review' case to the step rendering switch/conditional:
   ```typescript
   case 'review':
     return (
       <ReviewStep
         metadata={state.metadata}
         mediaItems={state.mediaItems}
         instructions={state.instructions}
         onSubmit={handleSubmit}
         onCancel={handleCancel}
         onEditSection={handleEditSection}
         onRemoveMedia={(id) => dispatch({ type: 'REMOVE_MEDIA', payload: id })}
         onReorderMedia={(id, dir) => /* dispatch reorder */}
         onEditMedia={handleEditMedia}
         isSubmitting={isSubmitting}
       />
     );
   ```

3. Implement or verify these handler functions exist in CaptureWizard:
   - handleSubmit: calls onComplete with assembled ItemRecord
   - handleCancel: calls props.onCancel
   - handleEditSection: dispatches GO_TO_STEP action
   - handleEditMedia: sets edit target and navigates to edit-media step

4. Verify state access provides all required data:
   - state.metadata
   - state.mediaItems
   - state.instructions

**Verification:**
- [ ] Navigating to 'review' step renders ReviewStep
- [ ] All props are passed correctly
- [ ] Edit navigation works (goes to correct step)
- [ ] Remove and reorder dispatch correct actions
- [ ] Submit assembles and emits ItemRecord

**Estimated Time:** 45 minutes

---

#### Task 7.2: Export ReviewStep from Index

**Objective:** Add ReviewStep to the component exports for external access if needed.

**Files to Modify:**
- `src/components/ItemCapture/index.ts`

**Implementation Steps:**

1. Add named export for ReviewStep:
   ```typescript
   export { ReviewStep } from './components/steps/ReviewStep';
   ```

2. If ReviewStepProps needs external access, export it as well:
   ```typescript
   export type { ReviewStepProps } from './components/steps/ReviewStep';
   ```

3. Verify existing exports are not broken

**Verification:**
- [ ] ReviewStep can be imported from '@/components/ItemCapture'
- [ ] No breaking changes to existing exports
- [ ] TypeScript compiles without errors

**Estimated Time:** 10 minutes

---

### Section 8: Testing and Verification (3 tasks)

#### Task 8.1: Manual Testing - Metadata Display

**Objective:** Verify metadata summary displays correctly for all field combinations.

**Files to Modify:** None (testing only)

**Test Cases:**

1. Title only (no location, tags, or appliance type):
   - [ ] Title displays correctly
   - [ ] Empty state not shown for other fields
   - [ ] Edit button works

2. All fields populated:
   - [ ] All fields display in correct positions
   - [ ] Tags show as pills
   - [ ] Appliance type shows label (not raw value)

3. Empty title:
   - [ ] Shows "—" placeholder
   - [ ] Validation warning appears

4. Long title (100+ characters):
   - [ ] Text wraps correctly
   - [ ] No horizontal overflow

**Verification:**
- [ ] All test cases pass
- [ ] No visual regressions

**Estimated Time:** 20 minutes

---

#### Task 8.2: Manual Testing - Media Gallery

**Objective:** Verify media gallery displays and interactions work correctly.

**Files to Modify:** None (testing only)

**Test Cases:**

1. Empty media list:
   - [ ] Empty state displays
   - [ ] "Add Media" button works

2. Single media item:
   - [ ] Thumbnail displays
   - [ ] Move up disabled
   - [ ] Move down disabled
   - [ ] Remove works

3. Multiple media items (5+):
   - [ ] Grid layout correct
   - [ ] Order numbers correct (1, 2, 3...)
   - [ ] Move up/down reorders correctly
   - [ ] First item: move up disabled
   - [ ] Last item: move down disabled

4. Different media types:
   - [ ] Video shows purple badge and play overlay
   - [ ] Image shows blue badge
   - [ ] PDF shows amber badge

5. Responsive behavior:
   - [ ] 2 columns on mobile (< 640px)
   - [ ] 3 columns on sm (640px+)
   - [ ] 4 columns on md (768px+)
   - [ ] 5 columns on lg (1024px+)

**Verification:**
- [ ] All test cases pass
- [ ] Interactions feel responsive
- [ ] No visual glitches during reorder

**Estimated Time:** 30 minutes

---

#### Task 8.3: Manual Testing - Instructions and Actions

**Objective:** Verify instructions preview and action buttons work correctly.

**Files to Modify:** None (testing only)

**Test Cases:**

1. Instructions with markdown:
   - [ ] Headers render with correct styling
   - [ ] Lists render correctly
   - [ ] Links are clickable
   - [ ] Code blocks styled

2. Empty instructions:
   - [ ] Empty state shows
   - [ ] "Add instructions" link works

3. Submit button:
   - [ ] Disabled when title empty
   - [ ] Disabled when no content (media or text)
   - [ ] Enabled when valid
   - [ ] Shows spinner when isSubmitting

4. Cancel button:
   - [ ] Opens confirmation modal
   - [ ] "Continue Editing" closes modal
   - [ ] "Discard" triggers onCancel

5. Delete confirmation:
   - [ ] Modal opens on remove click
   - [ ] "Keep" closes modal
   - [ ] "Remove" removes item

**Verification:**
- [ ] All test cases pass
- [ ] Modals behave correctly
- [ ] No unexpected navigation

**Estimated Time:** 25 minutes

---

### Section 9: Accessibility and Polish (2 tasks)

#### Task 9.1: Add Keyboard Navigation Support

**Objective:** Ensure all interactive elements are keyboard accessible.

**Files to Modify:**
- `src/components/ItemCapture/components/steps/ReviewStep.tsx`

**Implementation Steps:**

1. Verify all buttons have type="button" attribute

2. Add keyboard event handlers for thumbnail card:
   - Enter/Space activates edit
   - Arrow keys could optionally trigger reorder (enhancement)

3. Add tabindex="0" to any non-button interactive elements

4. Add focus styles to interactive elements:
   - Focus ring visible
   - Focus-within shows action buttons

5. Test full keyboard flow:
   - Tab through all interactive elements
   - Enter/Space activates buttons
   - Escape closes modals

**Verification:**
- [ ] All interactive elements reachable via Tab
- [ ] Focus indicators visible
- [ ] Modals trap focus
- [ ] Escape closes modals

**Estimated Time:** 30 minutes

---

#### Task 9.2: Add ARIA Attributes for Screen Readers

**Objective:** Ensure component is accessible to screen reader users.

**Files to Modify:**
- `src/components/ItemCapture/components/steps/ReviewStep.tsx`

**Implementation Steps:**

1. Add role attributes:
   - Media gallery: `role="list"`
   - Media items: `role="listitem"`

2. Add aria-labels:
   - Edit buttons: "Edit [section name]"
   - Move buttons: "Move [item type] up/down"
   - Remove buttons: "Remove [item type]"
   - Thumbnail buttons: "Edit [item type] [number]"

3. Add aria-live region for announcements (already added in 5.2)

4. Add aria-describedby for modals connecting title to description

5. Mark decorative elements with aria-hidden:
   - Order badges (info conveyed by list position)
   - Icons (if text alternative exists)

**Verification:**
- [ ] VoiceOver/NVDA announces elements correctly
- [ ] Actions are announced in live region
- [ ] Modal content is announced on open
- [ ] Decorative elements not announced

**Estimated Time:** 30 minutes

---

## Summary

### Total Tasks: 21

| Section | Tasks | Estimated Time |
|---------|-------|----------------|
| 1. Component Skeleton | 3 | 1h 20m |
| 2. Metadata Summary | 2 | 1h |
| 3. Media Gallery | 4 | 2h 35m |
| 4. Instructions Preview | 2 | 45m |
| 5. Action Buttons | 2 | 1h |
| 6. Confirmation Modals | 2 | 1h |
| 7. Integration | 2 | 55m |
| 8. Testing | 3 | 1h 15m |
| 9. Accessibility | 2 | 1h |
| **Total** | **21** | **~10h 50m** |

### Critical Path

```
1.1 → 1.2 → 1.3 → 2.1 → 2.2 → 3.1 → 3.2 → 3.3 → 3.4 → 4.1 → 4.2 → 5.1 → 5.2 → 6.1 → 6.2 → 7.1 → 7.2 → 8.x → 9.x
```

All tasks are sequential except:
- Testing tasks (8.1, 8.2, 8.3) can be done in parallel
- Accessibility tasks (9.1, 9.2) can be done in parallel

### Dependencies on Other Tasks

| This Task | Requires |
|-----------|----------|
| All ReviewStep tasks | Phase 1-4 complete |
| Task 7.1 | REORDER_MEDIA and REMOVE_MEDIA actions in useItemCaptureState |
| Task 8.x | Actual media items from capture/upload flow |

---

## Post-Implementation Checklist

- [ ] All tasks completed
- [ ] Manual testing passed on:
  - [ ] Desktop Chrome
  - [ ] Desktop Firefox
  - [ ] iPhone Safari
  - [ ] Android Chrome
- [ ] No TypeScript errors
- [ ] No console errors/warnings
- [ ] No memory leaks (blob URLs cleaned up)
- [ ] Keyboard navigation works
- [ ] Screen reader testing passed
- [ ] Code reviewed
- [ ] Ready for Phase 5.2 (MediaThumbnail) if not already complete

---

## References

- [Overview Document](/docs/REQ-050-implement-reviewstep-overview.md)
- [Implementation Plan](/docs/prd/item-capture-implementation-plan.md)
- [ItemForm.tsx](/src/components/ItemForm.tsx) - Reorder pattern
- [ConfirmationModal.tsx](/src/components/ConfirmationModal.tsx) - Modal pattern
- [utils.ts](/src/lib/utils.ts) - cn() utility
