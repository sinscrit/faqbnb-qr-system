# REQ-079: Add Preview Actions - Implementation Overview

**Document Created:** 2026-01-03
**Last Modified:** 2026-01-03
**Request Reference:** REQ-079 from `/docs/gen_requests.md`
**Implementation Plan Reference:** `/docs/prd/item-capture-manager-implementation-plan.md`
**Phase:** 4 - Item Preview/Detail
**Task ID:** 4.6

---

## Summary

This task implements action controls within the `ItemPreviewModal` component, allowing users to perform common item management operations directly from the preview interface. The implementation includes Edit, Manage Assets, and Delete buttons, along with metadata display for title, location, and tags.

---

## Dependencies

### Hard Dependencies (Must Be Complete)

| Task ID | Task Name | Reason |
|---------|-----------|--------|
| 4.1 | ItemPreviewModal Component | Parent container that will host the action controls |
| 4.2 | MediaGallery Component | Preview modal layout must be established before adding actions |
| 4.5 | InstructionsViewer | Content sections must be defined before action placement |

### Soft Dependencies (Should Be Complete)

| Task ID | Task Name | Reason |
|---------|-----------|--------|
| 3.4 | ConfirmDeleteDialog | Delete confirmation dialog pattern to reuse |
| 1.1 | Component Types | `ItemRecord` and callback types must be defined |

### Future Dependencies (This Task Enables)

| Task ID | Task Name | Relationship |
|---------|-----------|--------------|
| 5.2 | AssetPanel Component | "Manage Assets" button will trigger opening the asset panel |
| 5.1 | useAssetManagement Hook | Asset management integration requires this action trigger |

---

## Technical Approach

### Component Structure

The preview actions will be implemented as a dedicated section within `ItemPreviewModal.tsx`, following the established pattern from `ReviewStep.tsx` for action button layouts.

```
ItemPreviewModal.tsx
├── Header Section
│   ├── Title (prominent display)
│   ├── Close button (X icon, top-right)
│   └── Metadata bar (location, tags)
├── Content Section
│   ├── MediaGallery
│   └── InstructionsViewer
└── Actions Section (NEW - this task)
    ├── Edit button (primary style)
    ├── Manage Assets button (secondary style)
    └── Delete button (destructive style)
```

### State Requirements

No new state hooks required. This task uses:
- Existing `previewItem` state from `useItemManagerState`
- Existing callbacks from `ItemManagerProps`: `onEditItem`, `onDeleteItems`
- Local `showDeleteConfirm` state for delete confirmation dialog

### Callback Flow

```
User clicks "Edit" → onEditItem(previewItem) → Parent handles navigation
User clicks "Manage Assets" → dispatch({ type: 'OPEN_ASSET_PANEL', payload: previewItem })
User clicks "Delete" → Show confirmation → onDeleteItems([previewItem.id]) → Close preview
```

---

## UI/UX Specifications

### Action Button Layout

Following the established pattern from `ReviewStep.tsx` (lines 630-664):

```
┌─────────────────────────────────────────────────────────┐
│  Preview Header                                    [X]  │
│  ─────────────────────────────────────────────────────  │
│  Title: {item.title}                                    │
│  Location: {item.location}  |  Tags: [tag1] [tag2]     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│                   [Media Gallery]                       │
│                                                         │
│                  [Instructions]                         │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  [Edit]     [Manage Assets]              [Delete]      │
│  (primary)   (secondary)                 (destructive)  │
└─────────────────────────────────────────────────────────┘
```

### Button Styling (from codebase patterns)

**Edit Button (Primary):**
```css
"inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg
 hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2
 focus:ring-blue-500 focus:ring-offset-2 min-h-[44px]"
```

**Manage Assets Button (Secondary):**
```css
"inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300
 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none
 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 min-h-[44px]"
```

**Delete Button (Destructive):**
```css
"inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg
 hover:bg-red-700 transition-colors focus:outline-none focus:ring-2
 focus:ring-red-500 focus:ring-offset-2 min-h-[44px]"
```

### Metadata Display

Following the `dl/dt/dd` pattern from `ReviewStep.tsx` (lines 410-454):

**Location Display:**
```tsx
<div className="flex items-center gap-2 text-sm text-gray-600">
  <MapPin className="w-4 h-4" />
  <span>{item.location || 'No location set'}</span>
</div>
```

**Tags Display:**
```tsx
<div className="flex flex-wrap gap-2">
  {item.tags?.map(tag => (
    <span
      key={tag}
      className="inline-flex items-center px-2.5 py-0.5 rounded-full
                 text-xs font-medium bg-gray-100 text-gray-800"
    >
      {tag}
    </span>
  ))}
</div>
```

### Delete Confirmation Dialog

Reuse the existing `ConfirmDeleteDialog` component pattern (from Phase 3.4) or inline modal pattern from `ReviewStep.tsx`:

```tsx
// Modal structure following ConfirmationModal.tsx pattern
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  <div
    className="bg-white rounded-lg p-6 max-w-sm mx-4 w-full"
    role="dialog"
    aria-modal="true"
    aria-labelledby="delete-confirm-title"
  >
    <h3 id="delete-confirm-title" className="text-lg font-medium text-gray-900 mb-4">
      Delete Item
    </h3>
    <p className="text-gray-600 mb-6">
      Are you sure you want to delete "{item.title}"? This action cannot be undone.
    </p>
    <div className="flex space-x-3">
      <button className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg
                         hover:bg-gray-200 transition-colors">
        Cancel
      </button>
      <button className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg
                         hover:bg-red-700 transition-colors">
        Delete
      </button>
    </div>
  </div>
</div>
```

---

## Mobile Considerations

### Touch Targets
- All action buttons use `min-h-[44px]` for accessibility compliance
- Buttons have adequate padding (`px-4 py-2`) for touch interaction

### Layout Adjustments
- Action bar uses `flex flex-wrap gap-2` on mobile to stack buttons if needed
- Delete button aligns right with `ml-auto` to separate from positive actions

### Mobile-Specific Layout
```tsx
// Mobile: Stack vertically, Desktop: Horizontal
<div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 pt-4 border-t border-gray-200">
  <button>Edit</button>
  <button>Manage Assets</button>
  <button className="sm:ml-auto">Delete</button>
</div>
```

---

## Implementation Tasks

### Task 4.6.1: Add Metadata Display Section
**Effort:** XS (< 1 hour)

Add metadata display to `ItemPreviewModal` header:
- Display item title prominently
- Show location with MapPin icon
- Render tags as pill badges

### Task 4.6.2: Implement Action Buttons Row
**Effort:** S (1-2 hours)

Create action button section in `ItemPreviewModal`:
- Edit button with `Edit` icon from Lucide
- Manage Assets button with `FolderOpen` or `Images` icon
- Delete button with `Trash2` icon
- Proper button styling following codebase conventions

### Task 4.6.3: Wire Edit Button to Callback
**Effort:** XS (< 1 hour)

Connect Edit button to parent callback:
- Call `onEditItem(previewItem)` on click
- Close preview modal after triggering edit
- Verify callback receives complete `ItemRecord`

### Task 4.6.4: Wire Manage Assets Button to State
**Effort:** XS (< 1 hour)

Connect Manage Assets button to state dispatch:
- Dispatch `OPEN_ASSET_PANEL` action with current item
- Close preview modal when opening asset panel
- Handle case where asset management is disabled via config

### Task 4.6.5: Implement Delete Confirmation Flow
**Effort:** S (1-2 hours)

Add delete confirmation dialog:
- Local state for `showDeleteConfirm` boolean
- Render confirmation modal when true
- Display item title in confirmation message
- Call `onDeleteItems([item.id])` on confirm
- Close both confirmation and preview on successful delete

### Task 4.6.6: Add Keyboard Navigation
**Effort:** XS (< 1 hour)

Ensure keyboard accessibility:
- All buttons focusable with Tab
- Enter/Space activates buttons
- Escape closes confirmation dialog
- Focus trap within confirmation dialog

---

## Authorized Files and Functions for Modification

### Files to Modify

| File Path | Changes |
|-----------|---------|
| `src/components/ItemManager/components/ItemPreview/ItemPreviewModal.tsx` | Add metadata display, action buttons section, delete confirmation flow |

### Functions to Add/Modify

| Function | File | Description |
|----------|------|-------------|
| `handleEdit` | `ItemPreviewModal.tsx` | Trigger `onEditItem` callback and close modal |
| `handleManageAssets` | `ItemPreviewModal.tsx` | Dispatch `OPEN_ASSET_PANEL` action |
| `handleDelete` | `ItemPreviewModal.tsx` | Show confirmation dialog |
| `handleConfirmDelete` | `ItemPreviewModal.tsx` | Execute delete and close modal |
| `handleCancelDelete` | `ItemPreviewModal.tsx` | Close confirmation dialog |

### New State Variables

| Variable | Type | Location |
|----------|------|----------|
| `showDeleteConfirm` | `boolean` | Local state in `ItemPreviewModal.tsx` |

### Props to Access

From `ItemManagerProps` (passed down through context or props):
- `onEditItem: (item: ItemRecord) => void`
- `onDeleteItems: (ids: string[]) => void`
- `config?.enableAssetManagement: boolean`

From `useItemManagerState`:
- `previewItem: ItemRecord | null`
- `dispatch` for `OPEN_ASSET_PANEL` and `CLOSE_PREVIEW` actions

---

## Testing Requirements

### Unit Tests

- [ ] Edit button calls `onEditItem` with correct item
- [ ] Manage Assets button dispatches `OPEN_ASSET_PANEL` action
- [ ] Delete button shows confirmation dialog
- [ ] Confirm delete calls `onDeleteItems` with item ID array
- [ ] Cancel delete closes dialog without calling callback
- [ ] Metadata displays correctly for items with/without location
- [ ] Tags render correctly for items with multiple tags
- [ ] Tags section hidden when item has no tags

### Integration Tests

- [ ] Full flow: Click Edit → Parent receives callback → Navigation occurs
- [ ] Full flow: Click Delete → Confirm → Item removed from list
- [ ] Preview closes after successful edit trigger
- [ ] Preview closes after successful delete

### Accessibility Tests

- [ ] All buttons have accessible names
- [ ] Confirmation dialog has proper ARIA attributes
- [ ] Focus moves to confirmation dialog when opened
- [ ] Focus returns to trigger button when dialog closes
- [ ] Keyboard navigation works throughout

### Mobile Tests

- [ ] Buttons remain tappable on small screens
- [ ] Layout adjusts properly on narrow viewports
- [ ] Confirmation dialog scrolls if content exceeds viewport

---

## Acceptance Criteria Mapping

| Acceptance Criteria | Implementation |
|---------------------|----------------|
| Edit button visible and triggers callback | Task 4.6.2, 4.6.3 |
| Manage Assets button opens asset panel | Task 4.6.2, 4.6.4 |
| Delete button with warning styling | Task 4.6.2 (red/destructive style) |
| Delete shows confirmation before action | Task 4.6.5 |
| Title prominently displayed | Task 4.6.1 (header section) |
| Location shown when available | Task 4.6.1 (MapPin + text) |
| Tags displayed in scannable format | Task 4.6.1 (pill badges) |
| Actions accessible on mobile | Mobile layout adjustments |
| Asset panel shows associated media | Handled by Phase 5 (AssetPanel) |
| Confirmation identifies item being deleted | Task 4.6.5 (shows item title) |

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Asset panel not yet implemented | Medium | Low | Manage Assets button can be conditionally rendered based on `enableAssetManagement` config; shows placeholder or disabled state until Phase 5 complete |
| Delete confirmation blocks other interactions | Low | Low | Proper z-index (z-50+) and focus trap ensures modal is isolated |
| Callback error not handled | Medium | Medium | Add error boundary or try-catch around callbacks; show toast notification on failure |

---

## Icons Required (Lucide React)

- `Edit` - Edit button icon
- `Images` or `FolderOpen` - Manage Assets button icon
- `Trash2` - Delete button icon
- `MapPin` - Location metadata icon
- `X` - Close button / dialog close
- `AlertTriangle` - Optional warning icon in delete confirmation

---

## References

- Implementation Plan: `/docs/prd/item-capture-manager-implementation-plan.md` (Phase 4, Task 4.6)
- ConfirmationModal Pattern: `src/components/ConfirmationModal.tsx`
- ReviewStep Action Buttons: `src/components/ItemCapture/components/steps/ReviewStep.tsx` (lines 630-664)
- Delete Confirmation Dialog Pattern: `src/components/ItemCapture/components/steps/ReviewStep.tsx` (lines 669-740)
- Tag Pills Pattern: `src/components/ItemCapture/components/steps/MetadataStep.tsx` (lines 517-531)
- Existing ItemCapture Types: `src/components/ItemCapture/ItemCapture.types.ts`
