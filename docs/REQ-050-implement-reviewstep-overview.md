# REQ-050: Implement ReviewStep Component - Technical Overview

**Document Created:** 2025-12-31T18:45:00
**Last Modified:** 2025-12-31T18:45:00
**Request Reference:** `/docs/gen_requests.md` (derived from Implementation Plan Phase 5.1)
**Implementation Plan:** `/docs/prd/item-capture-implementation-plan.md`
**Phase:** 5 - Review & Polish
**Task ID:** 5.1
**Status:** Ready for Implementation

---

## 1. Summary

Implement the `ReviewStep` component, the final step in the ItemCapture wizard where users review all captured content before submission. This component provides a comprehensive summary display with media thumbnails, reordering capabilities, item removal, navigation back to edit sections, metadata summary, and instructions preview. Upon confirmation, the wizard proceeds to the `onComplete` callback with the assembled `ItemRecord`.

**Key Responsibility:** ReviewStep is the gateway to submission - it ensures users have reviewed all their content and provides last-chance editing/reordering capabilities before the final `ItemRecord` is assembled and emitted.

---

## 2. Context from Implementation Plan

### Phase 5 Position

```
5.1 ReviewStep ◄────► 5.2 MediaThumbnail
       │                 (can develop together)
       ▼
5.3 Validation Layer
       │
       ▼
5.4 onComplete Assembly
       │
  ┌────┴────┐
  ▼         ▼
5.5       5.6
Perf     Test
Opt.    Harness
```

### Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| Phase 1 (Foundation) | Required | Types, state machine, wizard navigation |
| Phase 2 (Media Capture) | Required | Video and photo content to display |
| Phase 3 (File Upload & Text) | Required | Uploaded files and markdown content |
| Phase 4 (Editing Features) | Required | Edited media items with applied edits |
| Task 5.2 (MediaThumbnail) | Parallel | Reusable thumbnail component for media display |

### This Task Initiates Phase 5

ReviewStep is the first task in Phase 5. Upon completion:
- Users can review all captured content
- Drag-and-drop reordering is available
- Individual items can be removed
- Navigation back to edit any section is supported
- Phase 5 continues with validation layer (5.3) and onComplete assembly (5.4)

---

## 3. Technical Approach

### 3.1 Component Architecture

The ReviewStep component will:
1. Display a summary of all captured metadata (title, location, tags, appliance type)
2. Show all media items as thumbnails with type badges
3. Enable drag-and-drop reordering of media items
4. Provide delete/remove functionality for individual items
5. Allow navigation back to any previous step for editing
6. Display the markdown instructions preview
7. Provide final "Submit" and "Cancel" action buttons

### 3.2 Content Sections

| Section | Content | Actions Available |
|---------|---------|-------------------|
| Metadata Summary | Title, location, tags, appliance type | Edit button → navigate to MetadataStep |
| Media Gallery | Thumbnails with type badges, order indicators | Reorder (drag-drop or buttons), Remove, Edit → MediaEditorStep |
| Instructions Preview | Rendered markdown content | Edit button → navigate to TextEditorStep |
| Action Bar | Submit and Cancel buttons | Submit item or cancel entire flow |

### 3.3 Drag-and-Drop Strategy

**Current Codebase Pattern:** The codebase uses manual reordering with up/down arrow buttons (no drag-and-drop library).

**Recommended Approach for V1:** Follow existing pattern with up/down arrow buttons for reordering. This:
- Maintains consistency with `ItemForm.tsx` link reordering pattern
- Avoids adding new dependencies (react-beautiful-dnd, dnd-kit)
- Is fully accessible for keyboard users
- Works reliably on mobile devices

**V2 Enhancement:** Consider adding `@dnd-kit/core` for true drag-and-drop with touch support.

### 3.4 State Management Integration

```typescript
// ReviewStep uses useItemCaptureState for all data access
const { state, dispatch } = useItemCaptureContext();

// Access captured data
const { metadata, mediaItems, instructions } = state;

// Dispatch actions for modifications
dispatch({ type: 'REMOVE_MEDIA', payload: mediaId });
dispatch({ type: 'REORDER_MEDIA', payload: { id: mediaId, newOrder: 3 } });
dispatch({ type: 'GO_TO_STEP', payload: 'metadata' }); // Navigate back
```

---

## 4. Props Interface

```typescript
/**
 * Props for the ReviewStep component
 */
export interface ReviewStepProps {
  /** All captured metadata (title, location, tags, appliance type) */
  metadata: ItemMetadata;

  /** Array of media items to display */
  mediaItems: MediaItem[];

  /** Markdown-formatted instructions text */
  instructions: string;

  /** Callback when user clicks Submit */
  onSubmit: () => void;

  /** Callback when user clicks Cancel */
  onCancel: () => void;

  /** Callback to navigate back to a specific step for editing */
  onEditSection: (section: 'metadata' | 'content-type' | 'capture' | 'text') => void;

  /** Callback to remove a media item */
  onRemoveMedia: (mediaId: string) => void;

  /** Callback to reorder media items */
  onReorderMedia: (mediaId: string, direction: 'up' | 'down') => void;

  /** Callback to edit a specific media item */
  onEditMedia: (mediaId: string) => void;

  /** Optional: Show loading state on submit button */
  isSubmitting?: boolean;

  /** Optional: CSS class for the container */
  className?: string;

  /** Optional: Enable debug logging */
  debug?: boolean;
}
```

---

## 5. Component Structure

```
src/components/ItemCapture/components/steps/
├── ReviewStep.tsx              # Main component (THIS TASK)
└── ReviewStep.types.ts         # TypeScript interfaces (optional, can inline)
```

### Internal State

```typescript
interface ReviewStepInternalState {
  /** Which section is expanded (for mobile accordion view) */
  expandedSection: 'metadata' | 'media' | 'instructions' | null;

  /** Media item being confirmed for deletion (for confirmation modal) */
  confirmDeleteId: string | null;

  /** Error message if any */
  error: string | null;
}
```

---

## 6. UI Layout

### 6.1 Overall Layout

```
+------------------------------------------------------------------+
|                      📋 Review Your Item                          |
|                                                                   |
|  +---------------------------------------------------------+     |
|  |  METADATA SUMMARY                              [Edit ✏️] |     |
|  |                                                          |     |
|  |  Title: Samsung Washing Machine WF45T6000AW             |     |
|  |  Location: Laundry Room                                 |     |
|  |  Tags: appliance, laundry, washing                      |     |
|  |  Type: Washing Machine                                  |     |
|  +---------------------------------------------------------+     |
|                                                                   |
|  +---------------------------------------------------------+     |
|  |  MEDIA & FILES (4 items)                       [Edit ✏️] |     |
|  |                                                          |     |
|  |  +--------+  +--------+  +--------+  +--------+         |     |
|  |  | 🎬 1   |  | 📷 2   |  | 📷 3   |  | 📄 4   |         |     |
|  |  | Video  |  | Photo  |  | Photo  |  | PDF    |         |     |
|  |  | [↑][↓] |  | [↑][↓] |  | [↑][↓] |  | [↑][↓] |         |     |
|  |  | [🗑️]   |  | [🗑️]   |  | [🗑️]   |  | [🗑️]   |         |     |
|  |  +--------+  +--------+  +--------+  +--------+         |     |
|  +---------------------------------------------------------+     |
|                                                                   |
|  +---------------------------------------------------------+     |
|  |  INSTRUCTIONS                                  [Edit ✏️] |     |
|  |                                                          |     |
|  |  ## How to Use                                          |     |
|  |  1. Load clothes into the drum                          |     |
|  |  2. Add detergent to the dispenser                      |     |
|  |  3. Select cycle and press Start                        |     |
|  |  ...                                                    |     |
|  +---------------------------------------------------------+     |
|                                                                   |
|           [Cancel]                        [Submit Item ✓]         |
|                                                                   |
+------------------------------------------------------------------+
```

### 6.2 Media Thumbnail Card Specifications

| Element | Specification |
|---------|---------------|
| Container | `w-24 h-24` (96x96px) rounded-lg with border |
| Thumbnail | Object-fit cover, centered |
| Type Badge | Top-left corner, icon + short label |
| Order Badge | Top-right corner, circular with number |
| Action Buttons | Bottom row: Move up ↑, Move down ↓, Delete 🗑️ |
| Video Overlay | Play icon (▶️) centered on thumbnail |
| PDF Overlay | Document icon, page count badge |

### 6.3 Type Badge Styling

| Media Type | Icon | Background | Text |
|------------|------|------------|------|
| Video | `Video` (Lucide) | `bg-purple-100` | `text-purple-700` |
| Image | `Image` (Lucide) | `bg-blue-100` | `text-blue-700` |
| PDF | `FileText` (Lucide) | `bg-amber-100` | `text-amber-700` |

### 6.4 Responsive Behavior

| Viewport | Behavior |
|----------|----------|
| Mobile (< 640px) | Single column layout, collapsible sections, full-width buttons |
| Tablet (640-1024px) | 3-column media grid, comfortable padding |
| Desktop (> 1024px) | 4-5 column media grid, max-width container, two-button row |

---

## 7. User Interaction Flow

```
1. Component mounts with all captured data
   └── Display metadata summary section
   └── Display media gallery with thumbnails
   └── Display instructions preview (if any)
   └── All sections default to expanded (desktop) or first expanded (mobile)

2. User reviews content:

   2a. Edit Metadata
       └── Click "Edit" button on Metadata section
       └── onEditSection('metadata') called
       └── Wizard navigates back to MetadataStep
       └── After edit, user navigates forward to return to ReviewStep

   2b. Reorder Media
       └── Click ↑ or ↓ button on media thumbnail
       └── onReorderMedia(mediaId, 'up' | 'down') called
       └── Media items reorder in place with animation
       └── Order numbers update accordingly

   2c. Remove Media
       └── Click 🗑️ button on media thumbnail
       └── Confirmation modal appears: "Remove this item?"
       └── User confirms: onRemoveMedia(mediaId) called
       └── User cancels: modal closes, no change
       └── If last media item removed, show warning state

   2d. Edit Media Item
       └── Click on thumbnail or "Edit" overlay
       └── onEditMedia(mediaId) called
       └── Wizard navigates to MediaEditorStep with that item focused

   2e. Edit Instructions
       └── Click "Edit" button on Instructions section
       └── onEditSection('text') called
       └── Wizard navigates back to TextEditorStep

3. User submits or cancels:

   3a. Submit Item
       └── Click "Submit Item" button
       └── onSubmit() called
       └── Parent component assembles ItemRecord and calls onComplete()

   3b. Cancel
       └── Click "Cancel" button
       └── Confirmation modal: "Discard all changes?"
       └── User confirms: onCancel() called, wizard closes
       └── User cancels: modal closes, stay on ReviewStep
```

---

## 8. Integration with State Machine

### 8.1 Accessing State

```typescript
// Inside ReviewStep or parent CaptureWizard
const { state, dispatch } = useItemCaptureContext();

// Destructure for display
const { metadata, mediaItems, instructions, errors } = state;
```

### 8.2 Dispatching Actions

```typescript
// Navigate back to edit metadata
const handleEditMetadata = () => {
  dispatch({ type: 'GO_TO_STEP', payload: 'metadata' });
};

// Remove a media item
const handleRemoveMedia = (mediaId: string) => {
  dispatch({ type: 'REMOVE_MEDIA', payload: mediaId });
};

// Reorder media (swap with adjacent item)
const handleReorder = (mediaId: string, direction: 'up' | 'down') => {
  const currentIndex = mediaItems.findIndex(item => item.id === mediaId);
  const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

  if (newIndex >= 0 && newIndex < mediaItems.length) {
    dispatch({
      type: 'REORDER_MEDIA',
      payload: { id: mediaId, newOrder: newIndex }
    });
  }
};

// Navigate to edit a specific media item
const handleEditMedia = (mediaId: string) => {
  // Store the media ID to focus on in MediaEditorStep
  dispatch({ type: 'SET_EDIT_TARGET', payload: mediaId });
  dispatch({ type: 'GO_TO_STEP', payload: 'edit-media' });
};
```

---

## 9. Acceptance Criteria Mapping

Based on Implementation Plan Task 5.1:

| Requirement | Implementation |
|-------------|----------------|
| Summary display of all content | Three sections: Metadata Summary, Media Gallery, Instructions Preview |
| Media thumbnails with type badges | MediaThumbnail component with type-specific icons and colors |
| Reorder via drag-and-drop | V1: Up/down arrow buttons (following ItemForm.tsx pattern) |
| Remove individual items | Delete button with confirmation modal |
| Edit any section (navigate back) | Edit buttons trigger GO_TO_STEP dispatch to appropriate wizard step |
| Metadata summary | Display title, location, tags, and appliance type with labels |
| Instructions preview | Render markdown with react-markdown component |

---

## 10. Error Handling

| Error Scenario | Handling |
|----------------|----------|
| No media items (empty) | Display "No media captured" message with button to add content |
| No instructions (text) | Display "No instructions added" with optional "Add Instructions" button |
| Invalid metadata (missing title) | Should be caught by validation before reaching ReviewStep, but show error if present |
| Thumbnail generation fails | Show placeholder with error icon, still allow submission |
| Markdown rendering fails | Show raw text fallback |

### Error/Warning Display Patterns

```tsx
// Empty media state
{mediaItems.length === 0 && (
  <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
    <Image className="w-12 h-12 text-gray-400 mx-auto mb-2" />
    <p className="text-gray-500 mb-4">No media items added yet</p>
    <button
      onClick={() => onEditSection('content-type')}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
    >
      Add Media
    </button>
  </div>
)}

// Warning after removing last item
{showRemovalWarning && (
  <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded mb-4">
    <p className="text-sm">
      ⚠️ You've removed all media. Add at least one photo, video, or file before submitting.
    </p>
  </div>
)}
```

---

## 11. Metadata Summary Section

### 11.1 Display Structure

```tsx
<section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-lg font-semibold text-gray-900">Item Details</h3>
    <button
      onClick={() => onEditSection('metadata')}
      className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
    >
      <Edit className="w-4 h-4" />
      Edit
    </button>
  </div>

  <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <dt className="text-sm font-medium text-gray-500">Title</dt>
      <dd className="text-gray-900">{metadata.title}</dd>
    </div>

    {metadata.location && (
      <div>
        <dt className="text-sm font-medium text-gray-500">Location</dt>
        <dd className="text-gray-900">{metadata.location}</dd>
      </div>
    )}

    {metadata.applianceType && (
      <div>
        <dt className="text-sm font-medium text-gray-500">Appliance Type</dt>
        <dd className="text-gray-900">
          {APPLIANCE_TYPES.find(a => a.value === metadata.applianceType)?.label}
        </dd>
      </div>
    )}

    {metadata.tags && metadata.tags.length > 0 && (
      <div className="md:col-span-2">
        <dt className="text-sm font-medium text-gray-500">Tags</dt>
        <dd className="flex flex-wrap gap-2 mt-1">
          {metadata.tags.map(tag => (
            <span
              key={tag}
              className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded"
            >
              {tag}
            </span>
          ))}
        </dd>
      </div>
    )}
  </dl>
</section>
```

---

## 12. Media Gallery Section

### 12.1 Gallery Container

```tsx
<section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-lg font-semibold text-gray-900">
      Media & Files ({mediaItems.length} {mediaItems.length === 1 ? 'item' : 'items'})
    </h3>
    <button
      onClick={() => onEditSection('content-type')}
      className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
    >
      <Plus className="w-4 h-4" />
      Add More
    </button>
  </div>

  {mediaItems.length === 0 ? (
    <EmptyMediaState onAdd={() => onEditSection('content-type')} />
  ) : (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {mediaItems.map((item, index) => (
        <MediaItemCard
          key={item.id}
          item={item}
          index={index}
          totalItems={mediaItems.length}
          onMoveUp={() => onReorderMedia(item.id, 'up')}
          onMoveDown={() => onReorderMedia(item.id, 'down')}
          onRemove={() => setConfirmDeleteId(item.id)}
          onEdit={() => onEditMedia(item.id)}
        />
      ))}
    </div>
  )}
</section>
```

### 12.2 Individual Media Item Card

```tsx
interface MediaItemCardProps {
  item: MediaItem;
  index: number;
  totalItems: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  onEdit: () => void;
}

function MediaItemCard({
  item,
  index,
  totalItems,
  onMoveUp,
  onMoveDown,
  onRemove,
  onEdit,
}: MediaItemCardProps) {
  const thumbnailUrl = item.thumbnail
    ? URL.createObjectURL(item.thumbnail)
    : null;

  const typeConfig = {
    video: { icon: Video, color: 'bg-purple-100 text-purple-700', label: 'Video' },
    image: { icon: Image, color: 'bg-blue-100 text-blue-700', label: 'Photo' },
    pdf: { icon: FileText, color: 'bg-amber-100 text-amber-700', label: 'PDF' },
  };

  const config = typeConfig[item.type];
  const TypeIcon = config.icon;

  return (
    <div className="relative group">
      {/* Thumbnail */}
      <div
        onClick={onEdit}
        className="aspect-square rounded-lg overflow-hidden border border-gray-200 cursor-pointer hover:border-blue-400 transition-colors"
      >
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={`Media ${index + 1}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <TypeIcon className="w-8 h-8 text-gray-400" />
          </div>
        )}

        {/* Video play overlay */}
        {item.type === 'video' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
            <Play className="w-8 h-8 text-white" />
          </div>
        )}
      </div>

      {/* Type badge - top left */}
      <span className={cn(
        'absolute top-1 left-1 px-1.5 py-0.5 text-xs font-medium rounded',
        config.color
      )}>
        <TypeIcon className="w-3 h-3 inline mr-0.5" />
        {config.label}
      </span>

      {/* Order badge - top right */}
      <span className="absolute top-1 right-1 w-5 h-5 bg-gray-900 text-white text-xs font-medium rounded-full flex items-center justify-center">
        {index + 1}
      </span>

      {/* Action buttons - bottom */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
            disabled={index === 0}
            className="p-1 bg-white rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Move up"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
            disabled={index === totalItems - 1}
            className="p-1 bg-white rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Move down"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="p-1 bg-white rounded hover:bg-red-100 text-red-600"
            aria-label="Remove"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## 13. Instructions Preview Section

### 13.1 Markdown Rendering

```tsx
import ReactMarkdown from 'react-markdown';

<section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-lg font-semibold text-gray-900">Instructions</h3>
    <button
      onClick={() => onEditSection('text')}
      className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
    >
      <Edit className="w-4 h-4" />
      Edit
    </button>
  </div>

  {instructions ? (
    <div className="prose prose-sm max-w-none">
      <ReactMarkdown>{instructions}</ReactMarkdown>
    </div>
  ) : (
    <div className="text-gray-500 italic">
      No instructions added.{' '}
      <button
        onClick={() => onEditSection('text')}
        className="text-blue-600 hover:underline"
      >
        Add instructions
      </button>
    </div>
  )}
</section>
```

### 13.2 Markdown Styling (Prose)

Use Tailwind Typography plugin (`@tailwindcss/typography`) or custom prose classes:

```css
/* If not using plugin, add these to globals.css */
.prose h1 { @apply text-xl font-bold mb-2; }
.prose h2 { @apply text-lg font-semibold mb-2; }
.prose h3 { @apply text-base font-medium mb-1; }
.prose p { @apply mb-3; }
.prose ul { @apply list-disc pl-5 mb-3; }
.prose ol { @apply list-decimal pl-5 mb-3; }
.prose li { @apply mb-1; }
.prose a { @apply text-blue-600 hover:underline; }
.prose code { @apply bg-gray-100 px-1 py-0.5 rounded text-sm; }
```

---

## 14. Action Buttons Section

```tsx
<div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
  <button
    onClick={() => setShowCancelConfirm(true)}
    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
    disabled={isSubmitting}
  >
    <X className="w-4 h-4 inline mr-2" />
    Cancel
  </button>

  <button
    onClick={onSubmit}
    disabled={isSubmitting || !isValid}
    className={cn(
      'inline-flex items-center px-6 py-2 rounded-lg transition-colors',
      'bg-blue-600 text-white hover:bg-blue-700',
      'disabled:opacity-50 disabled:cursor-not-allowed'
    )}
  >
    {isSubmitting ? (
      <>
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        Submitting...
      </>
    ) : (
      <>
        <Check className="w-4 h-4 mr-2" />
        Submit Item
      </>
    )}
  </button>
</div>
```

---

## 15. Confirmation Modals

### 15.1 Delete Confirmation Modal

```tsx
{confirmDeleteId && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
      <h4 className="text-lg font-semibold text-gray-900 mb-2">
        Remove this item?
      </h4>
      <p className="text-gray-600 mb-4">
        This will remove the media from your item. You can add it again later if needed.
      </p>
      <div className="flex justify-end gap-3">
        <button
          onClick={() => setConfirmDeleteId(null)}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          Keep
        </button>
        <button
          onClick={() => {
            onRemoveMedia(confirmDeleteId);
            setConfirmDeleteId(null);
          }}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Remove
        </button>
      </div>
    </div>
  </div>
)}
```

### 15.2 Cancel Confirmation Modal

```tsx
{showCancelConfirm && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
      <h4 className="text-lg font-semibold text-gray-900 mb-2">
        Discard all changes?
      </h4>
      <p className="text-gray-600 mb-4">
        All captured media and entered information will be lost. This cannot be undone.
      </p>
      <div className="flex justify-end gap-3">
        <button
          onClick={() => setShowCancelConfirm(false)}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          Continue Editing
        </button>
        <button
          onClick={() => {
            setShowCancelConfirm(false);
            onCancel();
          }}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Discard
        </button>
      </div>
    </div>
  </div>
)}
```

---

## 16. Performance Considerations

### 16.1 Memory Management

```typescript
// Clean up blob URLs when component unmounts or items change
useEffect(() => {
  const urls: string[] = [];

  // Create URLs for thumbnails
  mediaItems.forEach(item => {
    if (item.thumbnail) {
      urls.push(URL.createObjectURL(item.thumbnail));
    }
  });

  return () => {
    urls.forEach(url => URL.revokeObjectURL(url));
  };
}, [mediaItems]);
```

### 16.2 Virtualization (Future Enhancement)

For large numbers of media items (>20), consider using `react-virtualized` or `@tanstack/react-virtual` to only render visible items.

### 16.3 Lazy Markdown Rendering

```typescript
// Lazy load react-markdown for smaller initial bundle
const ReactMarkdown = dynamic(() => import('react-markdown'), {
  ssr: false,
  loading: () => <div className="animate-pulse h-20 bg-gray-100 rounded" />,
});
```

---

## 17. Accessibility Requirements

| Requirement | Implementation |
|-------------|----------------|
| Keyboard navigation | Tab through all interactive elements in logical order |
| Screen reader support | `aria-label` on buttons, `role="list"` on media gallery |
| Focus management | Focus confirmation modal when opened, return focus when closed |
| Button states | Clear disabled states with `aria-disabled` |
| Image alt text | Descriptive alt text for media thumbnails |
| Live regions | Announce reorder and remove actions |

### Live Region for Actions

```tsx
<div aria-live="polite" className="sr-only" ref={announceRef}>
  {announcement}
</div>

// Update announcement on actions
const handleRemoveComplete = (itemName: string) => {
  setAnnouncement(`${itemName} removed from list`);
};

const handleReorderComplete = (itemName: string, newPosition: number) => {
  setAnnouncement(`${itemName} moved to position ${newPosition}`);
};
```

---

## 18. Authorized Files and Functions for Modification

### Files to CREATE

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemCapture/components/steps/ReviewStep.tsx` | Main ReviewStep component |

### Files to MODIFY

| File Path | Modification |
|-----------|--------------|
| `src/components/ItemCapture/components/CaptureWizard.tsx` | Import and render ReviewStep for 'review' step |
| `src/components/ItemCapture/index.ts` | Export ReviewStep if needed externally |
| `src/components/ItemCapture/hooks/useItemCaptureState.ts` | Ensure REORDER_MEDIA and REMOVE_MEDIA actions work correctly |

### Files to REFERENCE (read-only patterns)

| File Path | Pattern Reference |
|-----------|-------------------|
| `src/components/ItemForm.tsx` | Link reordering pattern (moveLink function) |
| `src/components/ConfirmationModal.tsx` | Modal overlay pattern |
| `src/components/LinkCard.tsx` | Thumbnail display with fallback icons |
| `src/components/ItemCapture/ItemCapture.types.ts` | MediaItem, ItemMetadata types |
| `src/components/ItemCapture/components/shared/MediaThumbnail.tsx` | Thumbnail display (Task 5.2) |
| `src/lib/utils.ts` | `cn()` utility for class merging |

### Dependencies Required

| Dependency | Version | Notes |
|------------|---------|-------|
| `lucide-react` | ^0.525.0 | Already installed - Edit, Trash2, ChevronUp, ChevronDown, Check, X, Loader2, Video, Image, FileText, Play, Plus |
| `react-markdown` | ^9.1.0 | Already installed - for instructions preview |
| `tailwind-merge` | ^3.3.1 | Already installed - via cn() utility |
| `clsx` | ^2.1.1 | Already installed - via cn() utility |

**No new dependencies required.**

---

## 19. Testing Approach

### Unit Tests

1. **Component Rendering:**
   - Renders metadata summary correctly
   - Renders media gallery with correct item count
   - Renders instructions preview with markdown
   - Handles empty states (no media, no instructions)

2. **Reordering Logic:**
   - `onReorderMedia('up')` not called for first item
   - `onReorderMedia('down')` not called for last item
   - Order numbers update correctly after reorder

3. **Remove Logic:**
   - Confirmation modal appears on delete click
   - `onRemoveMedia` called only after confirmation
   - Cancel dismisses modal without removing

4. **Navigation Logic:**
   - `onEditSection('metadata')` called when Edit clicked on metadata
   - `onEditSection('text')` called when Edit clicked on instructions
   - `onEditMedia(id)` called when media thumbnail clicked

### Integration Tests

1. Full review flow with metadata, media, and instructions
2. Reorder multiple items and verify final order
3. Remove item and verify state updates
4. Navigate back to edit, make changes, return to review
5. Submit button calls onSubmit with correct validation

### Manual Testing Checklist

- [ ] Metadata displays correctly for all fields
- [ ] All media types show correct type badges
- [ ] Reorder buttons work correctly at boundaries
- [ ] Delete confirmation modal appears and works
- [ ] Edit buttons navigate to correct wizard steps
- [ ] Instructions render markdown correctly
- [ ] Submit button disabled during submission
- [ ] Cancel confirmation prevents accidental loss
- [ ] Works on iPhone Safari
- [ ] Works on Android Chrome
- [ ] Works on desktop browsers
- [ ] Keyboard navigation works throughout
- [ ] Screen reader announces actions correctly

---

## 20. Implementation Order

1. Create `ReviewStep.tsx` with basic structure and TypeScript interfaces
2. Implement metadata summary section with static display
3. Add media gallery section with thumbnail grid layout
4. Implement MediaItemCard component with reorder/delete buttons
5. Add reorder logic following ItemForm.tsx pattern
6. Add delete confirmation modal
7. Implement instructions preview with react-markdown
8. Add Edit buttons and navigation callbacks
9. Add action buttons (Submit/Cancel) with confirmation
10. Add accessibility attributes and live regions
11. Add memory cleanup for blob URLs
12. Integrate with CaptureWizard step rendering
13. Test on target browsers/devices

---

## 21. Related Tasks

| Task ID | Title | Relationship |
|---------|-------|--------------|
| 5.2 | MediaThumbnail | Parallel - reusable component for thumbnail display |
| 5.3 | Validation Layer | Dependent - validates content before allowing submit |
| 5.4 | onComplete Assembly | Dependent - assembles ItemRecord from reviewed content |
| 4.5 | MediaEditorStep | Preceding - ReviewStep follows editing in wizard flow |
| 1.2 | useItemCaptureState | Foundation - provides state access and dispatch |

---

## 22. Open Questions

1. **Minimum Content Requirement:** Is at least one media item required, or can user submit with only text instructions?
   - **Recommendation:** Require at least one content item (media OR text) to avoid empty submissions

2. **Reorder Animation:** Should reordering animate the position swap, or is instant OK?
   - **Recommendation:** Simple instant swap for V1; add animation in V2

3. **Thumbnail Size:** Is 96x96px appropriate for all device sizes, or should thumbnails scale?
   - **Recommendation:** Use responsive grid columns; thumbnail fills grid cell

4. **Max Media Items Display:** Should we paginate or virtualize if user has many items?
   - **Recommendation:** Show all items in V1 (max 10 photos + 1 video); virtualize in V2 if needed

5. **PDF Preview:** Should PDF thumbnails show page count badge like in LinkCard?
   - **Recommendation:** Yes, show page count (e.g., "3 pages") for consistency

6. **Undo Support:** Should user be able to undo removal before submitting?
   - **Recommendation:** Not in V1 - user can navigate back and re-add; consider undo in V2

---

## 23. Component Implementation Skeleton

```tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
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
import { cn } from '@/lib/utils';
import { APPLIANCE_TYPES } from '../../utils/constants';
import type { MediaItem, ItemMetadata } from '../../ItemCapture.types';

// Lazy load react-markdown
const ReactMarkdown = dynamic(() => import('react-markdown'), {
  ssr: false,
  loading: () => <div className="animate-pulse h-20 bg-gray-100 rounded" />,
});

interface ReviewStepProps {
  metadata: ItemMetadata;
  mediaItems: MediaItem[];
  instructions: string;
  onSubmit: () => void;
  onCancel: () => void;
  onEditSection: (section: 'metadata' | 'content-type' | 'capture' | 'text') => void;
  onRemoveMedia: (mediaId: string) => void;
  onReorderMedia: (mediaId: string, direction: 'up' | 'down') => void;
  onEditMedia: (mediaId: string) => void;
  isSubmitting?: boolean;
  className?: string;
  debug?: boolean;
}

export function ReviewStep({
  metadata,
  mediaItems,
  instructions,
  onSubmit,
  onCancel,
  onEditSection,
  onRemoveMedia,
  onReorderMedia,
  onEditMedia,
  isSubmitting = false,
  className,
  debug = false,
}: ReviewStepProps) {
  // Internal state
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  // Refs for cleanup
  const urlsRef = useRef<string[]>([]);

  // Clean up blob URLs on unmount
  useEffect(() => {
    return () => {
      urlsRef.current.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  // Validation: at least one content item required
  const hasContent = mediaItems.length > 0 || instructions.trim().length > 0;
  const isValid = metadata.title.trim().length > 0 && hasContent;

  // Handle reorder with announcement
  const handleReorder = (mediaId: string, direction: 'up' | 'down') => {
    onReorderMedia(mediaId, direction);
    const index = mediaItems.findIndex(item => item.id === mediaId);
    const newPosition = direction === 'up' ? index : index + 2;
    setAnnouncement(`Item moved to position ${newPosition}`);
  };

  // Handle remove with announcement
  const handleConfirmRemove = () => {
    if (confirmDeleteId) {
      onRemoveMedia(confirmDeleteId);
      setAnnouncement('Item removed');
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className={cn('flex flex-col min-h-full', className)}>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Review Your Item
      </h2>

      {/* Metadata Summary Section */}
      <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Item Details</h3>
          <button
            onClick={() => onEditSection('metadata')}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
        </div>

        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">Title</dt>
            <dd className="text-gray-900">{metadata.title || '—'}</dd>
          </div>

          {metadata.location && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Location</dt>
              <dd className="text-gray-900">{metadata.location}</dd>
            </div>
          )}

          {metadata.applianceType && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Appliance Type</dt>
              <dd className="text-gray-900">
                {APPLIANCE_TYPES.find(a => a.value === metadata.applianceType)?.label || metadata.applianceType}
              </dd>
            </div>
          )}

          {metadata.tags && metadata.tags.length > 0 && (
            <div className="md:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Tags</dt>
              <dd className="flex flex-wrap gap-2 mt-1">
                {metadata.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded"
                  >
                    {tag}
                  </span>
                ))}
              </dd>
            </div>
          )}
        </dl>
      </section>

      {/* Media Gallery Section */}
      <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Media & Files ({mediaItems.length} {mediaItems.length === 1 ? 'item' : 'items'})
          </h3>
          <button
            onClick={() => onEditSection('content-type')}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
          >
            <Plus className="w-4 h-4" />
            Add More
          </button>
        </div>

        {mediaItems.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <Image className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 mb-4">No media items added yet</p>
            <button
              onClick={() => onEditSection('content-type')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add Media
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {mediaItems.map((item, index) => (
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
            ))}
          </div>
        )}
      </section>

      {/* Instructions Preview Section */}
      <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Instructions</h3>
          <button
            onClick={() => onEditSection('text')}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
        </div>

        {instructions ? (
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown>{instructions}</ReactMarkdown>
          </div>
        ) : (
          <div className="text-gray-500 italic">
            No instructions added.{' '}
            <button
              onClick={() => onEditSection('text')}
              className="text-blue-600 hover:underline"
            >
              Add instructions
            </button>
          </div>
        )}
      </section>

      {/* Validation Warning */}
      {!isValid && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded mt-6">
          <p className="text-sm">
            Please add a title and at least one media item or instructions before submitting.
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
        <button
          onClick={() => setShowCancelConfirm(true)}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          disabled={isSubmitting}
        >
          <X className="w-4 h-4 inline mr-2" />
          Cancel
        </button>

        <button
          onClick={onSubmit}
          disabled={isSubmitting || !isValid}
          className={cn(
            'inline-flex items-center px-6 py-2 rounded-lg transition-colors',
            'bg-blue-600 text-white hover:bg-blue-700',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Check className="w-4 h-4 mr-2" />
              Submit Item
            </>
          )}
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              Remove this item?
            </h4>
            <p className="text-gray-600 mb-4">
              This will remove the media from your item. You can add it again later if needed.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Keep
              </button>
              <button
                onClick={handleConfirmRemove}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              Discard all changes?
            </h4>
            <p className="text-gray-600 mb-4">
              All captured media and entered information will be lost. This cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Continue Editing
              </button>
              <button
                onClick={() => {
                  setShowCancelConfirm(false);
                  onCancel();
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Accessibility: Live region for screen readers */}
      <div aria-live="polite" className="sr-only">
        {announcement}
      </div>
    </div>
  );
}

// Media Item Card Component
interface MediaItemCardProps {
  item: MediaItem;
  index: number;
  totalItems: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  onEdit: () => void;
  urlsRef: React.MutableRefObject<string[]>;
}

function MediaItemCard({
  item,
  index,
  totalItems,
  onMoveUp,
  onMoveDown,
  onRemove,
  onEdit,
  urlsRef,
}: MediaItemCardProps) {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

  useEffect(() => {
    if (item.thumbnail) {
      const url = URL.createObjectURL(item.thumbnail);
      urlsRef.current.push(url);
      setThumbnailUrl(url);
    }
    return () => {
      // Individual cleanup handled by parent
    };
  }, [item.thumbnail, urlsRef]);

  const typeConfig = {
    video: { icon: Video, color: 'bg-purple-100 text-purple-700', label: 'Video' },
    image: { icon: Image, color: 'bg-blue-100 text-blue-700', label: 'Photo' },
    pdf: { icon: FileText, color: 'bg-amber-100 text-amber-700', label: 'PDF' },
  };

  const config = typeConfig[item.type];
  const TypeIcon = config.icon;

  return (
    <div className="relative group">
      {/* Thumbnail */}
      <button
        onClick={onEdit}
        className="w-full aspect-square rounded-lg overflow-hidden border border-gray-200 cursor-pointer hover:border-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label={`Edit ${item.type} ${index + 1}`}
      >
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={`${item.type} ${index + 1}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <TypeIcon className="w-8 h-8 text-gray-400" />
          </div>
        )}

        {/* Video play overlay */}
        {item.type === 'video' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
            <Play className="w-8 h-8 text-white" />
          </div>
        )}
      </button>

      {/* Type badge - top left */}
      <span
        className={cn(
          'absolute top-1 left-1 px-1.5 py-0.5 text-xs font-medium rounded',
          config.color
        )}
      >
        {config.label}
      </span>

      {/* Order badge - top right */}
      <span className="absolute top-1 right-1 w-5 h-5 bg-gray-900 text-white text-xs font-medium rounded-full flex items-center justify-center">
        {index + 1}
      </span>

      {/* Action buttons - bottom */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMoveUp();
            }}
            disabled={index === 0}
            className="p-1 bg-white rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Move up"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMoveDown();
            }}
            disabled={index === totalItems - 1}
            className="p-1 bg-white rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Move down"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="p-1 bg-white rounded hover:bg-red-100 text-red-600"
            aria-label="Remove"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReviewStep;
```

---

## 24. References

- [Implementation Plan](/docs/prd/item-capture-implementation-plan.md) - Phase 5, Task 5.1
- [ItemForm.tsx](/src/components/ItemForm.tsx) - Link reordering pattern (moveLink function)
- [ConfirmationModal.tsx](/src/components/ConfirmationModal.tsx) - Modal overlay pattern
- [MediaEditorStep Overview](/docs/REQ-050-build-mediaeditorstep-overview.md) - Preceding step in wizard
- [react-markdown documentation](https://github.com/remarkjs/react-markdown)
- [Lucide Icons](https://lucide.dev/icons/)
- [Tailwind CSS Typography Plugin](https://tailwindcss.com/docs/typography-plugin)
