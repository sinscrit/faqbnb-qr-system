# Implementation Overview: Media Management on Edit Item Page

## Header
| Field | Value |
|-------|-------|
| Request Reference | #143 |
| Source File | docs/gen_requests.md |
| Original Request Date | 2026-01-08 |
| Breakdown Created | 2026-01-08 12:10:51 CET |
| T-shirt Size | L (Large) |
| Estimated Effort | 3-4 days (24-32 hours) |

## Goals

Enable comprehensive media management directly within the Edit Item page, allowing users to:

1. **View existing media**: Display all `item_links` associated with the item with appropriate previews/thumbnails
2. **Add new media**: Create new `item_links` with title, URL, and type (youtube, pdf, image, text)
3. **Edit existing media**: Modify title, URL, and type of existing `item_links`
4. **Delete media**: Remove `item_links` with confirmation dialog to prevent accidental deletion
5. **Reorder media**: Drag-and-drop reordering with `display_order` persistence

### Assumptions & Clarifications

- Media assets are stored as `item_links` in Supabase (not as separate `media` entities)
- The existing `ItemLink` type (`id`, `item_id`, `title`, `link_type`, `url`, `thumbnail_url`, `display_order`) is the data model
- Link types are constrained to: `youtube`, `pdf`, `image`, `text`
- Changes to media should be saved atomically with other item changes (name, description)
- The existing `AssetPanel` component from ItemManager provides a reference pattern but operates on a different data model (`MediaItem`) - we need to adapt the approach for `ItemLink`
- The Edit Item page is located at `/dashboard2/items/[publicId]/edit/page.tsx`

## Implementation Plan

### Step 1: Create MediaLinkItem Component

- **Description**: Create a reusable component to display a single media link with preview, edit, and delete actions
- **Rationale**: This is the atomic building block for the media list. Needs to handle different link types (YouTube, PDF, image, text) with appropriate preview rendering
- **Estimated Effort**: M (4-6 hours)

**Subtasks**:
1.1. Create component file with props interface
1.2. Implement link type detection and appropriate preview rendering
1.3. Add edit mode with inline form fields (title, URL, type dropdown)
1.4. Add delete button with visual feedback
1.5. Implement drag handle for reordering
1.6. Style with Tailwind CSS matching existing design system

### Step 2: Create MediaLinkList Component with Drag-and-Drop

- **Description**: Create a sortable list component that manages multiple MediaLinkItem components with drag-and-drop reordering using @dnd-kit
- **Rationale**: Reordering is a core requirement. @dnd-kit is already used in the codebase (SortableAssetList) so we should follow the same pattern for consistency
- **Estimated Effort**: M (4-6 hours)

**Subtasks**:
2.1. Create component with @dnd-kit/core and @dnd-kit/sortable setup
2.2. Implement DndContext with sensors (Pointer, Touch, Keyboard)
2.3. Create SortableContext with vertical list strategy
2.4. Implement drag overlay for visual feedback
2.5. Handle reorder events and update display_order
2.6. Add accessibility announcements for screen readers

### Step 3: Create AddMediaLinkForm Component

- **Description**: Create a form component for adding new media links with title, URL, and type fields
- **Rationale**: Separate component keeps the add flow clean and reusable. Should include URL validation and type auto-detection
- **Estimated Effort**: S (2-3 hours)

**Subtasks**:
3.1. Create form with controlled inputs (title, URL, type)
3.2. Add URL validation
3.3. Implement type auto-detection from URL (YouTube pattern detection)
3.4. Add thumbnail URL field (optional, for images)
3.5. Add submit and cancel buttons

### Step 4: Create MediaManagementSection Component

- **Description**: Create the main orchestrating component that combines MediaLinkList and AddMediaLinkForm
- **Rationale**: This container manages the state and provides the interface between the Edit Item page and the media management components
- **Estimated Effort**: M (3-4 hours)

**Subtasks**:
4.1. Create component with local state for pending changes
4.2. Implement add, edit, delete, and reorder handlers
4.3. Expose `getUpdatedLinks()` method for parent form submission
4.4. Add empty state when no media exists
4.5. Add visual section header and styling

### Step 5: Create DeleteMediaConfirmDialog Component

- **Description**: Create a confirmation dialog for media deletion to prevent accidental removal
- **Rationale**: Acceptance criteria explicitly requires confirmation for deletion. Should follow existing dialog patterns in the codebase
- **Estimated Effort**: S (1-2 hours)

**Subtasks**:
5.1. Create modal dialog component
5.2. Display media title and type being deleted
5.3. Add confirm and cancel buttons
5.4. Handle keyboard accessibility (Escape to close)

### Step 6: Integrate MediaManagementSection into Edit Item Page

- **Description**: Add the MediaManagementSection to the existing Edit Item page and wire up data flow
- **Rationale**: This is the integration step that brings everything together. Must ensure media changes are submitted with the form
- **Estimated Effort**: M (3-4 hours)

**Subtasks**:
6.1. Import MediaManagementSection into Edit Item page
6.2. Pass existing item.links to component
6.3. Update form submission handler to include media changes
6.4. Update `adminApi.updateItem()` call with modified links array
6.5. Handle loading states during save
6.6. Add error handling for media operations

### Step 7: Update API Types and Validation

- **Description**: Ensure API types and validation properly handle media link updates including create, update, and delete scenarios
- **Rationale**: The API already supports links in UpdateItemRequest, but we need to verify all scenarios are covered
- **Estimated Effort**: S (1-2 hours)

**Subtasks**:
7.1. Verify UpdateItemRequest type supports all link operations
7.2. Ensure API route handles link deletions (links not in array are deleted)
7.3. Add validation for link type constraints
7.4. Test API with various link operation combinations

### Step 8: Add Unit Tests

- **Description**: Create unit tests for all new components
- **Rationale**: Ensures reliability and catches regressions
- **Estimated Effort**: M (3-4 hours)

**Subtasks**:
8.1. Test MediaLinkItem rendering for each link type
8.2. Test MediaLinkList drag-and-drop functionality
8.3. Test AddMediaLinkForm validation and submission
8.4. Test DeleteMediaConfirmDialog interactions
8.5. Test MediaManagementSection integration

## Authorized Files and Functions for Modification

> **APPROVED SCOPE**: Changes outside this list require review

### New Components (Create)

| File | Target | Type |
|------|--------|------|
| `src/components/MediaManagement/MediaLinkItem.tsx` | MediaLinkItem component | Create |
| `src/components/MediaManagement/MediaLinkList.tsx` | MediaLinkList with drag-and-drop | Create |
| `src/components/MediaManagement/AddMediaLinkForm.tsx` | Form for adding new links | Create |
| `src/components/MediaManagement/MediaManagementSection.tsx` | Container component | Create |
| `src/components/MediaManagement/DeleteMediaConfirmDialog.tsx` | Confirmation dialog | Create |
| `src/components/MediaManagement/index.ts` | Barrel exports | Create |
| `src/components/MediaManagement/MediaManagement.types.ts` | TypeScript types | Create |

### Edit Item Page Integration (Modify)

| File | Target | Type |
|------|--------|------|
| `src/app/dashboard2/items/[publicId]/edit/page.tsx` | `EditItemPage` component | Modify |
| `src/app/dashboard2/items/[publicId]/edit/page.tsx` | `handleSubmit()` function | Modify |
| `src/app/dashboard2/items/[publicId]/edit/page.tsx` | Form state (add links state) | Modify |

### Types (Potential Modification)

| File | Target | Type |
|------|--------|------|
| `src/types/index.ts` | `ItemLink` type (verify completeness) | Verify |
| `src/types/index.ts` | `UpdateItemRequest` type (verify) | Verify |

### API Routes (Verify)

| File | Target | Type |
|------|--------|------|
| `src/app/api/admin/items/[publicId]/route.ts` | `PUT` handler link logic | Verify |

### Test Files (Create)

| File | Target | Type |
|------|--------|------|
| `src/components/MediaManagement/__tests__/MediaLinkItem.test.tsx` | Unit tests | Create |
| `src/components/MediaManagement/__tests__/MediaLinkList.test.tsx` | Unit tests | Create |
| `src/components/MediaManagement/__tests__/AddMediaLinkForm.test.tsx` | Unit tests | Create |
| `src/components/MediaManagement/__tests__/MediaManagementSection.test.tsx` | Integration tests | Create |

## Dependencies

### Internal Dependencies

- **REQ-142**: Enhanced Item Management - Must be complete (provides Edit Item page)
- Current Edit Item page implementation at `/dashboard2/items/[publicId]/edit`
- Existing `ItemLink` type from `src/types/index.ts`
- Existing `adminApi.updateItem()` from `src/lib/api.ts`

### External Dependencies

- **@dnd-kit/core**: Already installed, used for drag-and-drop
- **@dnd-kit/sortable**: Already installed, used for sortable lists
- **@dnd-kit/utilities**: Already installed, CSS transform utilities
- **lucide-react**: Already installed, for icons

## Risks and Considerations

### Potential Side Effects

1. **Item Updates**: Modifying the links array during item update could inadvertently delete links if not handled correctly. The API deletes existing links and recreates them - need to ensure this is atomic.

2. **Concurrent Edits**: If multiple users edit the same item simultaneously, link changes could conflict. Current architecture doesn't handle optimistic locking.

3. **Performance**: Large numbers of links (10+) with drag-and-drop could cause performance issues. Consider virtualization if needed.

4. **URL Validation**: Invalid URLs could cause issues. Need robust validation before save.

### Testing Requirements

1. **CRUD Operations**: Test create, read, update, delete for each link type
2. **Drag-and-Drop**: Test reordering with keyboard and mouse/touch
3. **Form Validation**: Test URL validation, required fields
4. **Error States**: Test API failures, network errors
5. **Accessibility**: Test with screen reader, keyboard navigation
6. **Mobile Responsiveness**: Test on various screen sizes

### Open Questions

- [ ] Should thumbnail_url be auto-generated for YouTube links (extract video thumbnail)?
- [ ] Should we limit the maximum number of media links per item?
- [ ] Should changes be auto-saved or require explicit save button?
- [ ] Should we support bulk operations (delete multiple, reorder multiple)?
- [ ] Is there a need for media preview in a lightbox/modal before save?

## Out of Scope

Per the original request, the following are explicitly out of scope:

1. **File Upload**: Direct file upload to storage (links are URLs only)
2. **Media Conversion**: Transcoding, thumbnail generation, etc.
3. **Bulk Import**: Importing multiple media at once from external sources
4. **Advanced Editing**: Cropping images, trimming videos, etc.
5. **Version History**: Tracking changes to media over time
6. **Sharing/Permissions**: Per-media access control
7. **Other Pages**: Changes to any pages other than Edit Item page
8. **ItemManager Integration**: The ItemManager component has its own AssetPanel - this is separate

---
*Document generated: 2026-01-08 12:10:51 CET*
