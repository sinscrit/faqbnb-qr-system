# REQ-106: Preview and Save Step - Detailed Task Breakdown

**Created:** 2026-01-05 19:30:00 UTC
**Last Modified:** 2026-01-05 09:15:00 UTC
**Request Reference:** REQ-106 from docs/gen_requests.md
**Overview Document:** docs/REQ-106-preview-save-step-overview.md
**Implementation Plan:** docs/prd/Plan-093-Item-Creation-Workflow.md (Phase 4, Task 4.2)

---

## Executive Summary

This document provides a granular, implementation-ready task breakdown for REQ-106: Preview and Save Step. Each task is sized at approximately 1 story point (a few hours of focused work) and includes specific implementation steps, verification criteria, and file modifications.

**Phase Context:**
- **Phase:** 4 - Content Creation & Preview (Steps 6-7)
- **Task ID:** 4.2
- **Predecessor:** Task 4.1 (ContentCreationStep) - Complete
- **Total Estimated Tasks:** 8 implementation tasks + 2 testing tasks

---

## Authorized Files and Functions for Modification

### New Files to Create
| File Path | Purpose |
|-----------|---------|
| `src/components/ItemCreationWorkflow/components/shared/ContentPieceCard.tsx` | Content piece display card with type-specific preview |
| `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx` | Main preview and save step component |
| `src/components/ItemCreationWorkflow/components/steps/__tests__/PreviewSaveStep.test.tsx` | Unit tests for PreviewSaveStep |
| `src/components/ItemCreationWorkflow/components/shared/__tests__/ContentPieceCard.test.tsx` | Unit tests for ContentPieceCard |

### Existing Files to Modify
| File Path | Modifications |
|-----------|---------------|
| `src/components/ItemCreationWorkflow/components/steps/index.ts` | Add PreviewSaveStep export |
| `src/components/ItemCreationWorkflow/components/shared/index.ts` | Add ContentPieceCard export |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | Add step rendering case for 'preview-save' |
| `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts` | Verify/add step transitions for retake flow |

### Files to Reference (Read-Only)
| File Path | Reference Purpose |
|-----------|-------------------|
| `src/components/ItemCapture/components/steps/ReviewStep.tsx` | Content preview patterns |
| `src/components/ItemCapture/components/shared/UrlPreview.tsx` | URL preview component |
| `src/components/ItemCreationWorkflow/components/shared/ItemNameEditor.tsx` | Name editing pattern |
| `src/hooks/useQRCodeGeneration.ts` | QR generation hook usage |
| `src/lib/qrcode-utils.ts` | QR code generation utilities |

---

## Detailed Task Breakdown

### Task 1: Create ContentPieceCard Component - Types and Base Structure
**File:** `src/components/ItemCreationWorkflow/components/shared/ContentPieceCard.tsx`
**Estimate:** 1 story point

**Objective:** Create the TypeScript interface and base component structure for ContentPieceCard.

**Implementation Steps:**

1.1. Create the file with proper module documentation header:
```typescript
/**
 * ContentPieceCard Component
 *
 * Displays individual content piece with type-appropriate preview.
 * Supports video, photo, PDF, text, and URL content types.
 *
 * @module ItemCreationWorkflow/components/shared/ContentPieceCard
 * @see docs/REQ-106-preview-save-step-overview.md
 * @lastModified 2026-01-05
 */
```

1.2. Define the props interface:
```typescript
export interface ContentPieceCardProps {
  /** Content piece data from workflow state */
  content: ContentPiece;
  /** Callback when remove is clicked */
  onRemove?: (id: string) => void;
  /** Callback when retake/replace is clicked */
  onRetake?: (id: string) => void;
  /** Whether actions are disabled (during save) */
  disabled?: boolean;
  /** Optional CSS class */
  className?: string;
}
```

1.3. Import required dependencies:
- `React` hooks: `useState`, `useEffect`, `useRef`
- Lucide icons: `Video`, `Image`, `FileText`, `Type`, `Link`, `Trash2`, `RotateCcw`
- `cn` from `@/lib/utils`
- Types from `../../ItemCreationWorkflow.types`

1.4. Create type configuration constant for badge colors:
```typescript
const TYPE_CONFIG = {
  video: { icon: Video, color: 'bg-purple-100 text-purple-700', label: 'Video' },
  photo: { icon: Image, color: 'bg-blue-100 text-blue-700', label: 'Photo' },
  pdf: { icon: FileText, color: 'bg-amber-100 text-amber-700', label: 'PDF' },
  text: { icon: Type, color: 'bg-green-100 text-green-700', label: 'Text' },
  url: { icon: Link, color: 'bg-indigo-100 text-indigo-700', label: 'Link' },
} as const;
```

1.5. Create component skeleton with proper export.

**Verification Steps:**
- [x] File compiles without TypeScript errors
- [x] Imports resolve correctly
- [x] Component exports both named and default

**Implementation Notes:** Implemented 2026-01-05. ContentPieceCard created with full TypeScript types and sub-components for each content type.

**Dependencies:** None

---

### Task 2: Implement ContentPieceCard - Content Type Renderers
**File:** `src/components/ItemCreationWorkflow/components/shared/ContentPieceCard.tsx`
**Estimate:** 1 story point

**Objective:** Implement rendering logic for each content type (video, photo, PDF, text, URL).

**Implementation Steps:**

2.1. Implement video thumbnail renderer:
```typescript
const renderVideoPreview = (data: ContentData) => {
  if (data.type !== 'video') return null;
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  // Generate thumbnail URL from File/Blob
  // Display duration overlay if available
  // Return img with play button overlay
};
```

2.2. Implement photo thumbnail renderer:
- Create object URL from File/Blob
- Handle URL cleanup on unmount with useRef pattern (see ReviewStep.tsx:311)
- Display image with aspect ratio preservation

2.3. Implement PDF preview renderer:
- Display PDF icon with page count badge (if available)
- Use existing pattern from `src/components/ItemCapture/components/shared/PDFPlaceholder.tsx`

2.4. Implement text preview renderer:
- Display truncated text (max 100 characters)
- Use markdown preview styling (prose class)
- Handle long text with ellipsis

2.5. Implement URL preview renderer:
- Integrate existing `UrlPreview` component from ItemCapture
- Handle metadata display (title, domain, favicon)
- Display fallback for failed previews

2.6. Create main render function that switches on content.type:
```typescript
const renderContent = () => {
  switch (content.type) {
    case 'video': return renderVideoPreview(content.data);
    case 'photo': return renderPhotoPreview(content.data);
    case 'pdf': return renderPdfPreview(content.data);
    case 'text': return renderTextPreview(content.data);
    case 'url': return renderUrlPreview(content.data);
    default: return null;
  }
};
```

**Verification Steps:**
- [x] Each content type renders appropriate preview
- [x] Object URLs are cleaned up on unmount (no memory leaks)
- [x] Fallback displays for missing thumbnails
- [x] Video duration overlay shows correctly

**Implementation Notes:** Implemented 2026-01-05. VideoPreview, PhotoPreview, PdfPreview, TextPreview, and UrlPreviewContent sub-components all created with proper cleanup via urlsRef pattern.

**Dependencies:** Task 1

---

### Task 3: Implement ContentPieceCard - Actions and Styling
**File:** `src/components/ItemCreationWorkflow/components/shared/ContentPieceCard.tsx`
**Estimate:** 0.5 story points

**Objective:** Add action buttons and apply Airbnb design tokens.

**Implementation Steps:**

3.1. Implement action button container:
```typescript
<div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
  <div className="flex items-center justify-center gap-2">
    {/* Retake button */}
    {onRetake && (
      <button
        type="button"
        onClick={() => onRetake(content.id)}
        disabled={disabled}
        className="p-1.5 bg-white rounded hover:bg-gray-100 disabled:opacity-50 transition-colors"
        aria-label="Retake content"
      >
        <RotateCcw className="w-4 h-4 text-gray-700" />
      </button>
    )}
    {/* Remove button */}
    {onRemove && (
      <button
        type="button"
        onClick={() => onRemove(content.id)}
        disabled={disabled}
        className="p-1.5 bg-white rounded hover:bg-red-100 transition-colors"
        aria-label="Remove content"
      >
        <Trash2 className="w-4 h-4 text-red-600" />
      </button>
    )}
  </div>
</div>
```

3.2. Apply Airbnb design tokens:
- Border radius: `rounded-lg` (8px)
- Shadows: `shadow-sm`
- Colors: Use CSS custom properties pattern
- Touch targets: Minimum 44x44px for action buttons

3.3. Add accessibility attributes:
- `role="listitem"` on card container
- `aria-label` on all interactive elements
- Focus ring styling: `focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:ring-offset-2`

3.4. Add disabled state styling:
```typescript
className={cn(
  'relative group rounded-lg overflow-hidden border border-gray-200 bg-white',
  disabled && 'opacity-60 pointer-events-none',
  className
)}
```

**Verification Steps:**
- [x] Action buttons appear on hover
- [x] Disabled state prevents interactions
- [x] Touch targets meet 44x44px minimum
- [x] Focus states are visible

**Implementation Notes:** Implemented 2026-01-05. Action buttons with 44x44px min touch targets, focus rings, and hover overlays.

**Dependencies:** Task 2

---

### Task 4: Export ContentPieceCard and Add to Barrel
**File:** `src/components/ItemCreationWorkflow/components/shared/index.ts`
**Estimate:** 0.25 story points

**Objective:** Add ContentPieceCard to barrel exports.

**Implementation Steps:**

4.1. Uncomment and update the ContentPieceCard export section:
```typescript
// =============================================================================
// Content Components (Phase 4)
// =============================================================================

// Task 4.2: ContentPieceCard
export { ContentPieceCard } from './ContentPieceCard';
export type { ContentPieceCardProps } from './ContentPieceCard';
```

4.2. Verify import works from parent barrel:
```typescript
import { ContentPieceCard, ContentPieceCardProps } from './components/shared';
```

**Verification Steps:**
- [x] Export compiles without errors
- [x] Can import from `./components/shared`
- [x] Type export works for consumers

**Implementation Notes:** Implemented 2026-01-05. ContentPieceCard and ContentPieceCardProps exported via barrel index.ts.

**Dependencies:** Task 3

---

### Task 5: Create PreviewSaveStep Component - Base Structure
**File:** `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx`
**Estimate:** 1 story point

**Objective:** Create the base PreviewSaveStep component with props interface and layout structure.

**Implementation Steps:**

5.1. Create file with module documentation:
```typescript
/**
 * PreviewSaveStep Component
 *
 * Step 7 of ItemCreationWorkflow - Preview and save captured content.
 * Displays content preview, allows item name editing, and handles save.
 *
 * @module ItemCreationWorkflow/components/steps/PreviewSaveStep
 * @see docs/REQ-106-preview-save-step-overview.md
 * @lastModified 2026-01-05
 */
```

5.2. Define props interface (from overview document):
```typescript
export interface PreviewSaveStepProps {
  /** Current item state from workflow */
  currentItem: CurrentItemState;
  /** Callback when item name changes */
  onUpdateItemName: (name: string) => void;
  /** Callback to remove a content piece */
  onRemoveContent: (contentId: string) => void;
  /** Callback to reorder content pieces */
  onReorderContent: (fromIndex: number, toIndex: number) => void;
  /** Callback to retake/replace content - navigates back to content creation */
  onRetake: () => void;
  /** Callback when save is triggered */
  onSave: () => Promise<{ id: string; qrCodeUrl: string }>;
  /** Callback when user cancels (goes back) */
  onCancel: () => void;
  /** Whether save operation is in progress */
  isSaving?: boolean;
  /** Optional CSS class */
  className?: string;
}
```

5.3. Define local state:
```typescript
const [isEditingName, setIsEditingName] = useState(false);
const [showSuccess, setShowSuccess] = useState(false);
const [savedResult, setSavedResult] = useState<{ id: string; qrCodeUrl: string } | null>(null);
const [saveError, setSaveError] = useState<string | null>(null);
```

5.4. Create layout structure following UI spec from overview:
```typescript
return (
  <div className={cn('flex flex-col gap-6 p-6', className)}>
    {/* Header with back button */}
    {/* Item Name Section */}
    {/* Content Grid Section */}
    {/* Retake/Replace All Button */}
    {/* Save Button */}
  </div>
);
```

5.5. Import required dependencies:
- React hooks
- ItemNameEditor from shared components
- ContentPieceCard from shared components
- Lucide icons: `ArrowLeft`, `Check`, `Loader2`, `RotateCcw`
- Types from ItemCreationWorkflow.types

**Verification Steps:**
- [x] Component compiles without errors
- [x] Props interface matches overview specification
- [x] Layout sections are properly structured
- [x] All imports resolve correctly

**Implementation Notes:** Implemented 2026-01-05. PreviewSaveStep with EmptyContentState and SuccessOverlay sub-components.

**Dependencies:** Task 4

---

### Task 6: Implement PreviewSaveStep - Content Display and Editing
**File:** `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx`
**Estimate:** 1 story point

**Objective:** Implement item name editing and content grid display.

**Implementation Steps:**

6.1. Implement item name section:
```typescript
{/* Item Name Section */}
<section className="bg-white rounded-lg border border-gray-200 p-6">
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-lg font-medium text-[#222222]">Item Name</h3>
  </div>
  <ItemNameEditor
    value={currentItem.itemName}
    onChange={onUpdateItemName}
    disabled={isSaving}
    maxLength={100}
    placeholder="Enter item name"
  />
</section>
```

6.2. Implement content grid section:
```typescript
{/* Content Section */}
<section className="bg-white rounded-lg border border-gray-200 p-6">
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-lg font-medium text-[#222222]">
      Content ({currentItem.content.length} {currentItem.content.length === 1 ? 'piece' : 'pieces'})
    </h3>
  </div>

  {currentItem.content.length === 0 ? (
    <EmptyContentState onAddContent={onRetake} />
  ) : (
    <div
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
      role="list"
      aria-label="Content pieces"
    >
      {currentItem.content.map((piece, index) => (
        <ContentPieceCard
          key={piece.id}
          content={piece}
          onRemove={onRemoveContent}
          onRetake={() => onRetake()}
          disabled={isSaving}
        />
      ))}
    </div>
  )}
</section>
```

6.3. Create empty content state component:
```typescript
function EmptyContentState({ onAddContent }: { onAddContent: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
      <Type className="w-12 h-12 text-gray-400 mb-3" />
      <p className="text-[#717171] mb-4">No content added yet</p>
      <button
        type="button"
        onClick={onAddContent}
        className="px-4 py-2 bg-[#FF385C] text-white rounded-lg hover:bg-[#E31C5F] transition-colors"
      >
        Add Content
      </button>
    </div>
  );
}
```

6.4. Implement "Retake / Replace All" button:
```typescript
{currentItem.content.length > 0 && (
  <button
    type="button"
    onClick={onRetake}
    disabled={isSaving}
    className={cn(
      'w-full py-3 border-2 border-gray-200 rounded-lg',
      'flex items-center justify-center gap-2',
      'text-[#222222] font-medium',
      'hover:border-gray-300 hover:bg-gray-50 transition-colors',
      'disabled:opacity-50 disabled:cursor-not-allowed'
    )}
  >
    <RotateCcw className="w-5 h-5" />
    Retake / Replace All
  </button>
)}
```

**Verification Steps:**
- [x] Item name displays and is editable
- [x] Content grid shows all content pieces
- [x] Empty state displays when no content
- [x] Retake button appears when content exists
- [x] All elements disabled during save

**Implementation Notes:** Implemented 2026-01-05. ItemNameEditor integration, content grid with ContentPieceCard, and EmptyContentState.

**Dependencies:** Task 5

---

### Task 7: Implement PreviewSaveStep - Save Flow and Success State
**File:** `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx`
**Estimate:** 1 story point

**Objective:** Implement save button, loading state, and success confirmation with QR code display.

**Implementation Steps:**

7.1. Implement save handler:
```typescript
const handleSave = useCallback(async () => {
  setSaveError(null);
  try {
    const result = await onSave();
    setSavedResult(result);
    setShowSuccess(true);
  } catch (error) {
    setSaveError(error instanceof Error ? error.message : 'Failed to save item');
  }
}, [onSave]);
```

7.2. Implement save button with loading state:
```typescript
{/* Save Button */}
<button
  type="button"
  onClick={handleSave}
  disabled={isSaving || currentItem.content.length === 0 || !currentItem.itemName.trim()}
  className={cn(
    'w-full py-4 rounded-lg font-semibold text-lg',
    'flex items-center justify-center gap-2',
    'transition-colors',
    isSaving
      ? 'bg-[#FF385C]/70 text-white cursor-wait'
      : 'bg-[#FF385C] text-white hover:bg-[#E31C5F]',
    'disabled:bg-gray-300 disabled:cursor-not-allowed'
  )}
>
  {isSaving ? (
    <>
      <Loader2 className="w-5 h-5 animate-spin" />
      Saving...
    </>
  ) : (
    <>
      <Check className="w-5 h-5" />
      Save Item
    </>
  )}
</button>
```

7.3. Implement error display:
```typescript
{saveError && (
  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
    <p className="text-red-600 text-sm">{saveError}</p>
    <button
      type="button"
      onClick={() => setSaveError(null)}
      className="mt-2 text-red-700 underline text-sm"
    >
      Dismiss
    </button>
  </div>
)}
```

7.4. Implement success confirmation overlay:
```typescript
{showSuccess && savedResult && (
  <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center p-8">
    <div className="text-center max-w-md">
      {/* Success Icon */}
      <div className="w-16 h-16 bg-[#00A699] rounded-full flex items-center justify-center mx-auto mb-6">
        <Check className="w-8 h-8 text-white" />
      </div>

      {/* Title */}
      <h2 className="text-2xl font-semibold text-[#222222] mb-4">
        Item Saved!
      </h2>

      {/* QR Code */}
      <div className="p-4 bg-white border border-gray-200 rounded-lg inline-block mb-4">
        <img
          src={savedResult.qrCodeUrl}
          alt={`QR code for ${currentItem.itemName}`}
          className="w-40 h-40"
        />
        <p className="mt-2 text-sm font-medium text-[#222222]">
          {currentItem.itemName}
        </p>
      </div>

      {/* Description */}
      <p className="text-[#717171] mb-8">
        Your item has been saved and is ready for your guests!
      </p>

      {/* Continue Button */}
      <button
        type="button"
        onClick={() => {
          setShowSuccess(false);
          // Navigate to next-action step
        }}
        className="px-8 py-3 bg-[#FF385C] text-white rounded-lg font-medium hover:bg-[#E31C5F] transition-colors"
      >
        Continue
      </button>
    </div>
  </div>
)}
```

7.5. Add screen reader announcement for success:
```typescript
<div aria-live="polite" className="sr-only">
  {showSuccess && 'Item saved successfully'}
  {saveError && `Error: ${saveError}`}
</div>
```

**Verification Steps:**
- [x] Save button triggers onSave callback
- [x] Loading state displays during save
- [x] Error message displays on failure
- [x] Success overlay shows QR code
- [x] Continue button advances workflow

**Implementation Notes:** Implemented 2026-01-05. Save flow with handleSave, error handling with setSaveError, SuccessOverlay with QR code display, and onComplete callback.

**Dependencies:** Task 6

---

### Task 8: Integrate PreviewSaveStep with Workflow
**Files:**
- `src/components/ItemCreationWorkflow/components/steps/index.ts`
- `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`
- `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`

**Estimate:** 1 story point

**Objective:** Wire PreviewSaveStep into the main workflow component.

**Implementation Steps:**

8.1. Update `components/steps/index.ts` - Uncomment PreviewSaveStep export:
```typescript
// Task 4.2: PreviewSaveStep
export { PreviewSaveStep } from './PreviewSaveStep';
export type { PreviewSaveStepProps } from './PreviewSaveStep';
```

8.2. Update `ItemCreationWorkflow.tsx` - Add import:
```typescript
import {
  RoomSelectionStep,
  ItemTypeStep,
  SpecificItemStep,
  ContentSourceStep,
  ContentTypeStep,
  ContentCreationStep,
  PreviewSaveStep  // Add this
} from './components/steps';
```

8.3. Update `ItemCreationWorkflow.tsx` - Add local state for save operation:
```typescript
const [isSaving, setIsSaving] = useState(false);
```

8.4. Update `ItemCreationWorkflow.tsx` - Create handleSaveItem function:
```typescript
const handleSaveItem = useCallback(async () => {
  if (!state.currentItem) {
    throw new Error('No current item to save');
  }

  setIsSaving(true);
  try {
    const sessionItem: SessionItem = {
      id: crypto.randomUUID(),
      name: state.currentItem.itemName,
      room: state.currentItem.room,
      itemType: state.currentItem.itemType,
      content: state.currentItem.content,
      createdAt: new Date(),
    };

    const result = await onSaveItem(sessionItem);

    // Save to session state
    saveItem({ ...sessionItem, qrCodeUrl: result.qrCodeUrl });

    return result;
  } finally {
    setIsSaving(false);
  }
}, [state.currentItem, onSaveItem, saveItem]);
```

8.5. Update `ItemCreationWorkflow.tsx` - Replace placeholder in renderCurrentStep:
```typescript
case 'preview-save':
  return (
    <PreviewSaveStep
      currentItem={state.currentItem!}
      onUpdateItemName={setItemName}
      onRemoveContent={removeContentPiece}
      onReorderContent={reorderContent}
      onRetake={() => goToStep('content-creation')}
      onSave={handleSaveItem}
      onCancel={prevStep}
      isSaving={isSaving}
    />
  );
```

8.6. Add `removeContentPiece` and `reorderContent` to destructured values from useWorkflowState.

8.7. Update `hooks/useWorkflowState.ts` - Verify STEP_TRANSITIONS allows preview-save → content-creation for retake:
```typescript
// Current config already correct:
'content-creation': ['preview-save'],
'preview-save': ['next-action'],
// Need to add for retake functionality - update to allow going back:
// The GO_TO_STEP action already allows going to any step in history,
// so verify this works or add content-creation to allowed transitions
```

8.8. Add success navigation handler to advance to next-action step:
```typescript
// In handleSaveItem success path or PreviewSaveStep:
goToStep('next-action');
```

**Verification Steps:**
- [x] PreviewSaveStep renders when currentStep is 'preview-save'
- [x] Save operation calls onSaveItem prop
- [x] Session item is added to session.items on save
- [x] Navigation to content-creation works for retake
- [x] Navigation to next-action works after save
- [x] isSaving state propagates correctly

**Implementation Notes:** Implemented 2026-01-05. ItemCreationWorkflow.tsx updated with PreviewSaveStep integration, handleSaveItem function, and proper state management.

**Dependencies:** Task 7

---

### Task 9: Unit Tests for ContentPieceCard
**File:** `src/components/ItemCreationWorkflow/components/shared/__tests__/ContentPieceCard.test.tsx`
**Estimate:** 0.75 story points

**Objective:** Create comprehensive unit tests for ContentPieceCard component.

**Implementation Steps:**

9.1. Set up test file with proper imports:
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { ContentPieceCard, ContentPieceCardProps } from '../ContentPieceCard';
import type { ContentPiece } from '../../../ItemCreationWorkflow.types';

describe('ContentPieceCard', () => {
  // Tests here
});
```

9.2. Create test fixtures for each content type:
```typescript
const mockVideoContent: ContentPiece = {
  id: 'video-1',
  type: 'video',
  data: { type: 'video', file: new Blob(['video'], { type: 'video/mp4' }), duration: 45 },
  order: 0,
};

const mockPhotoContent: ContentPiece = {
  id: 'photo-1',
  type: 'photo',
  data: { type: 'photo', file: new Blob(['image'], { type: 'image/jpeg' }) },
  order: 0,
};

// ... similar for pdf, text, url
```

9.3. Write tests for each content type rendering:
```typescript
describe('content type rendering', () => {
  it('renders video preview with duration overlay', () => {});
  it('renders photo thumbnail', () => {});
  it('renders PDF preview with page count', () => {});
  it('renders text preview with truncation', () => {});
  it('renders URL preview with metadata', () => {});
});
```

9.4. Write tests for action buttons:
```typescript
describe('action buttons', () => {
  it('calls onRemove when remove button clicked', () => {});
  it('calls onRetake when retake button clicked', () => {});
  it('disables actions when disabled prop is true', () => {});
  it('hides remove button when onRemove not provided', () => {});
});
```

9.5. Write accessibility tests:
```typescript
describe('accessibility', () => {
  it('has appropriate aria-label on card', () => {});
  it('has aria-label on action buttons', () => {});
  it('buttons are keyboard accessible', () => {});
});
```

**Verification Steps:**
- [x] All tests pass
- [x] Test coverage > 80% for component
- [x] Tests run successfully in CI

**Implementation Notes:** Implemented 2026-01-05. Comprehensive tests in ContentPieceCard.test.tsx covering all content types, actions, styling, and accessibility.

**Dependencies:** Task 3

---

### Task 10: Unit Tests for PreviewSaveStep
**File:** `src/components/ItemCreationWorkflow/components/steps/__tests__/PreviewSaveStep.test.tsx`
**Estimate:** 1 story point

**Objective:** Create comprehensive unit tests for PreviewSaveStep component.

**Implementation Steps:**

10.1. Set up test file with mocks:
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PreviewSaveStep, PreviewSaveStepProps } from '../PreviewSaveStep';
import type { CurrentItemState } from '../../../ItemCreationWorkflow.types';

const mockCurrentItem: CurrentItemState = {
  room: 'kitchen',
  itemType: 'appliance',
  specificItem: 'Dishwasher',
  itemName: 'Kitchen - Dishwasher',
  contentSource: 'create-new',
  contentType: 'video',
  content: [
    { id: '1', type: 'video', data: { type: 'video', file: new Blob() }, order: 0 },
  ],
};

const defaultProps: PreviewSaveStepProps = {
  currentItem: mockCurrentItem,
  onUpdateItemName: jest.fn(),
  onRemoveContent: jest.fn(),
  onReorderContent: jest.fn(),
  onRetake: jest.fn(),
  onSave: jest.fn().mockResolvedValue({ id: 'item-1', qrCodeUrl: 'data:image/png;base64,...' }),
  onCancel: jest.fn(),
  isSaving: false,
};
```

10.2. Write tests for content display:
```typescript
describe('content display', () => {
  it('displays item name in editor', () => {});
  it('displays all content pieces in grid', () => {});
  it('shows empty state when no content', () => {});
  it('shows content count correctly', () => {});
});
```

10.3. Write tests for item name editing:
```typescript
describe('item name editing', () => {
  it('calls onUpdateItemName when name changes', async () => {});
  it('disables name input when saving', () => {});
});
```

10.4. Write tests for save flow:
```typescript
describe('save flow', () => {
  it('calls onSave when save button clicked', async () => {});
  it('shows loading state while saving', () => {});
  it('shows success state after save', async () => {});
  it('displays QR code in success state', async () => {});
  it('shows error message on save failure', async () => {});
  it('disables save button when no content', () => {});
  it('disables save button when name is empty', () => {});
});
```

10.5. Write tests for navigation:
```typescript
describe('navigation', () => {
  it('calls onRetake when retake button clicked', () => {});
  it('calls onCancel when back/cancel clicked', () => {});
});
```

10.6. Write accessibility tests:
```typescript
describe('accessibility', () => {
  it('announces success to screen readers', async () => {});
  it('announces errors to screen readers', async () => {});
  it('success overlay is keyboard navigable', async () => {});
});
```

**Verification Steps:**
- [x] All tests pass
- [x] Test coverage > 80% for component
- [x] Tests cover all acceptance criteria
- [x] Tests run successfully in CI

**Implementation Notes:** Implemented 2026-01-05. Comprehensive tests in PreviewSaveStep.test.tsx covering content display, editing, save flow, navigation, content actions, and accessibility.

**Dependencies:** Task 8

---

## Acceptance Criteria Mapping

| Acceptance Criteria | Task Coverage |
|---------------------|---------------|
| AC1: Preview displays with content visualization | Tasks 2, 6 |
| AC2: Item name shown with edit option | Tasks 5, 6 |
| AC3: Retake/replace option returns to content creation | Tasks 6, 8 |
| AC4: Save button triggers persistence | Tasks 7, 8 |
| AC5: Success confirmation displayed | Task 7 |
| AC6: Multi-content items display all pieces | Tasks 2, 6 |
| AC7: Content preview represents end-user view | Task 2 |
| AC8: Workflow state preserved | Task 8 |

---

## Testing Strategy

### Unit Tests (Tasks 9, 10)
- ContentPieceCard: Content type rendering, action handlers, disabled states
- PreviewSaveStep: Layout, save flow, success/error states, navigation

### Integration Tests (Post-Implementation)
- Complete flow from content creation → preview → save
- QR code generation integration
- Navigation flows (retake, cancel, continue)
- State preservation during operations

### Accessibility Tests
- Keyboard navigation through all elements
- Screen reader announcements for state changes
- Focus management on step entry/success overlay
- Touch target sizes on mobile

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Large video thumbnails causing performance issues | Use lazy loading, limit thumbnail resolution |
| URL preview fails to load | Graceful fallback to URL text display |
| Save operation fails | Clear error message with retry option |
| Memory leaks from object URLs | Use urlsRef pattern from ReviewStep.tsx |

---

## Implementation Order

1. **Task 1** - ContentPieceCard types and base structure
2. **Task 2** - Content type renderers
3. **Task 3** - Actions and styling
4. **Task 4** - Export ContentPieceCard
5. **Task 5** - PreviewSaveStep base structure
6. **Task 6** - Content display and editing
7. **Task 7** - Save flow and success state
8. **Task 8** - Workflow integration
9. **Task 9** - ContentPieceCard tests
10. **Task 10** - PreviewSaveStep tests

---

*Detailed Task Breakdown generated on 2026-01-05 for REQ-106: Preview and Save Step*
