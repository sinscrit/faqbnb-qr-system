# Implementation Overview: Dedicated Single-Page Edit Experience for Instructions

## Header

| Field | Value |
|-------|-------|
| Request Reference | #214 |
| Source File | docs/gen_requests.md |
| Original Request Date | 2026-01-12 23:21 |
| Breakdown Created | 2026-01-12 23:36:21 CET |
| T-shirt Size | M |
| Estimated Effort | 2-3 days (16-24 hours) |

## Goals

Replace the current workflow-based edit experience (REQ-213) with a dedicated single-page form that provides a streamlined editing interface for existing instruction articles. The new page will:

1. Display article context (room, item type, item name) as read-only information at the top
2. Provide editable fields for article title, tags, and content pieces
3. Support content operations: add, edit, remove, and drag-to-reorder
4. Remove all multi-step workflow UI elements (progress indicators, back arrows, step navigation)
5. Use existing APIs and reuse existing components where possible

### Assumptions & Clarifications

- **Article Title**: The page header will show "Editing Instruction For: [Article Title]" where the article title is the current title from the database (e.g., "How to Clean - Cabinets")
- **Tags**: Tags are stored at the item level in `items.tags` array. The edit page will allow modifying tags, which will require updating the item (not just the article)
- **Content Pieces**: Stored in `item_links` table with `article_id` reference. The PUT `/api/admin/articles/[articleId]` endpoint already supports updating links
- **Purpose Field**: Per requirements, purpose is NOT displayed in the read-only section
- **File Uploads**: For new content pieces, we need to handle file uploads for video/photo/PDF types. This may require reusing adapters from ItemCreationWorkflow

---

## Implementation Plan

### Step 1: Create New Edit Page Component Structure

- **Description**: Create a new page component at the existing edit route that renders a single-page form instead of the ItemCreationWorkflow. The page will have two main sections: a read-only header section and an editable content section.
- **Rationale**: Starting with the page structure ensures we have the correct layout before implementing individual features. This replaces the current implementation that wraps ItemCreationWorkflow.
- **Estimated Effort**: M (4-6 hours)

**Key sub-tasks:**
1. Remove ItemCreationWorkflow import and usage
2. Create page layout with header and two content sections
3. Implement article data fetching (reuse existing `adminApi.getArticle` call)
4. Add loading, error, and authentication states (can reuse existing patterns)

### Step 2: Implement Read-Only Context Section

- **Description**: Create a read-only section displaying "Editing Instruction For: [Article Title]" header and item metadata (room, item type, item name). Purpose is explicitly excluded per requirements.
- **Rationale**: This section establishes the editing context and must be completed before the editable section so users understand what they're editing.
- **Estimated Effort**: S (2-3 hours)

**Key sub-tasks:**
1. Create header with dynamic article title
2. Display room (extracted from item tags using `extractRoomFromTags`)
3. Display item type (extracted from tags or default to 'Appliance')
4. Display item name from `article.item.name`
5. Style as read-only display with gray backgrounds (similar to `ItemDetailsDisplay` in PreviewSaveStep)

### Step 3: Implement Editable Article Title Field

- **Description**: Add an editable text input for the article title that pre-populates with the current title value.
- **Rationale**: Simple field that establishes the editable pattern for subsequent fields.
- **Estimated Effort**: S (1-2 hours)

**Key sub-tasks:**
1. Create controlled input component
2. Add validation (required, max length)
3. Track changes for save operation

### Step 4: Implement Tags Editor Integration

- **Description**: Integrate the existing `TagsEditor` component to allow adding and removing tags.
- **Rationale**: Reusing the existing TagsEditor component saves development time and maintains consistency.
- **Estimated Effort**: S (2-3 hours)

**Key sub-tasks:**
1. Import and render TagsEditor component
2. Pre-populate with item's current tags
3. Track tag changes for save operation
4. Note: Tags are stored on the item, so saving will require updating item tags (may need API enhancement)

### Step 5: Implement Content List with Drag-and-Drop Reordering

- **Description**: Display existing content pieces in a grid with drag-to-reorder capability using @dnd-kit. Reuse `SortableContentPieceCard` and `ContentPieceCard` components.
- **Rationale**: Reusing existing sortable components maintains consistency and reduces development time. The PreviewSaveStep already has this implementation pattern.
- **Estimated Effort**: M (4-6 hours)

**Key sub-tasks:**
1. Set up DndContext with sensors (pointer, touch, keyboard)
2. Render content pieces using SortableContentPieceCard
3. Handle reorder events to update display_order
4. Implement accessibility announcements for screen readers

### Step 6: Implement Content Piece Operations (Add, Remove, Edit)

- **Description**: Add functionality to add new content pieces, remove existing ones, and edit existing content. For adding, provide options for all supported types: Text, Video, Photo, PDF, URL.
- **Rationale**: Content operations are the core editing functionality. Building on the content list from Step 5.
- **Estimated Effort**: L (6-8 hours)

**Key sub-tasks:**
1. **Remove**: Add remove button to each content card, implement confirmation dialog for last piece
2. **Add**: Create "Add Content" button/modal with type selection (reuse ContentTypeStep patterns)
3. **Add - Text**: Integrate TextEditorAdapter for text content
4. **Add - URL**: Integrate UrlInputAdapter for URL content
5. **Add - Media**: Integrate FileUploadAdapter for video/photo/PDF uploads
6. **Edit**: For existing content, allow re-capturing/re-uploading (may be complex - consider as stretch goal)

### Step 7: Implement Save and Cancel Actions

- **Description**: Add Save and Cancel buttons. Save persists all changes via PUT `/api/admin/articles/[articleId]`. Cancel navigates back to instructions list without saving.
- **Rationale**: Final step that makes the edit functionality complete. Must handle both success and error cases.
- **Estimated Effort**: M (3-4 hours)

**Key sub-tasks:**
1. Create Save button with loading state
2. Create Cancel button with unsaved changes warning
3. Transform component state to UpdateArticleRequest format
4. Call `adminApi.updateArticle` with updated data
5. Handle file uploads for new content pieces (upload to storage, get URLs)
6. On success, set sessionStorage flag and redirect to list
7. On error, display error message

### Step 8: Update API for Tags (if needed)

- **Description**: If tags cannot be updated through the article endpoint, create or modify an endpoint to update item tags.
- **Rationale**: Tags are stored on the item, not the article. The current PUT article endpoint may not support updating item tags.
- **Estimated Effort**: S-M (2-4 hours, depending on approach)

**Options:**
1. Extend PUT `/api/admin/articles/[articleId]` to accept `itemTags` field
2. Make separate PUT call to `/api/admin/items/[itemId]` for tags
3. Create dedicated PATCH endpoint for item tags

---

## Authorized Files and Functions for Modification

> **APPROVED SCOPE**: Changes outside this list require review

### Page Component (Replace Existing)

| File | Target | Type |
|------|--------|------|
| `src/app/dashboard2/instructions/[articleId]/edit/page.tsx` | `EditArticlePage` | Replace |

### New Components (Create)

| File | Target | Type |
|------|--------|------|
| `src/components/InstructionEditor/InstructionEditor.tsx` | `InstructionEditor` | Create |
| `src/components/InstructionEditor/InstructionEditor.types.ts` | Type definitions | Create |
| `src/components/InstructionEditor/index.ts` | Barrel export | Create |
| `src/components/InstructionEditor/components/ReadOnlyContextSection.tsx` | `ReadOnlyContextSection` | Create |
| `src/components/InstructionEditor/components/ContentEditSection.tsx` | `ContentEditSection` | Create |
| `src/components/InstructionEditor/components/AddContentModal.tsx` | `AddContentModal` | Create |

### Reusable Components (Import, No Modification)

| File | Target | Type |
|------|--------|------|
| `src/components/ItemCreationWorkflow/components/shared/TagsEditor.tsx` | `TagsEditor` | Import |
| `src/components/ItemCreationWorkflow/components/shared/SortableContentPieceCard.tsx` | `SortableContentPieceCard` | Import |
| `src/components/ItemCreationWorkflow/components/shared/ContentPieceCard.tsx` | `ContentPieceCard` | Import |
| `src/components/ItemCreationWorkflow/components/steps/adapters/TextEditorAdapter.tsx` | `TextEditorAdapter` | Import |
| `src/components/ItemCreationWorkflow/components/steps/adapters/UrlInputAdapter.tsx` | `UrlInputAdapter` | Import |
| `src/components/ItemCreationWorkflow/components/steps/adapters/FileUploadAdapter.tsx` | `FileUploadAdapter` | Import |

### Utility Functions (Import, No Modification)

| File | Target | Type |
|------|--------|------|
| `src/lib/room-utils.ts` | `extractRoomFromTags()` | Import |
| `src/lib/api.ts` | `adminApi.getArticle()`, `adminApi.updateArticle()` | Import |
| `src/components/ItemCreationWorkflow/utils/constants.ts` | Label constants | Import |

### API (Potentially Modify)

| File | Target | Type |
|------|--------|------|
| `src/app/api/admin/articles/[articleId]/route.ts` | `PUT` handler | Potentially Modify (for tags) |
| `src/types/index.ts` | `UpdateArticleRequest` | Potentially Extend (for tags) |

### Existing List Page (No Modification Needed)

| File | Target | Type |
|------|--------|------|
| `src/app/dashboard2/instructions/page.tsx` | Success message handling | Already implemented |

---

## Dependencies

### Internal Dependencies

- **REQ-213** (superseded): The current edit implementation uses ItemCreationWorkflow. REQ-214 replaces this approach entirely.
- **REQ-212**: Instructions list page is already complete and handles success messages via sessionStorage.
- **REQ-145/146/147**: File upload support for video/photo/PDF is available via FileUploadAdapter.

### External Dependencies

- **@dnd-kit/core** and **@dnd-kit/sortable**: Already installed, used for drag-and-drop reordering
- **Supabase Storage**: For uploading new media files
- **Existing APIs**: GET and PUT article endpoints are already implemented and tested

---

## Risks and Considerations

### Potential Side Effects

1. **Shared TagsEditor Component**: If we modify TagsEditor for this feature, ensure it doesn't break PreviewSaveStep usage
2. **API Changes for Tags**: If we extend the article PUT endpoint to handle item tags, ensure backward compatibility
3. **Content Type Handling**: Ensure content type mapping between display and API formats matches existing patterns

### Testing Requirements

1. **Unit Tests**: Create tests for new InstructionEditor components
2. **Integration Tests**: Test save operation with various content combinations
3. **Accessibility Tests**: Verify keyboard navigation for drag-and-drop and form fields
4. **Mobile Testing**: Verify responsive layout and touch interactions

### Open Questions

- [ ] **Tag Updates**: Should tags be saved with the article update or require a separate item update call? Need to verify current API capabilities.
- [ ] **Edit Existing Content**: Should users be able to edit the content of existing pieces (e.g., re-record a video, edit text), or only add/remove/reorder? Initial implementation may focus on add/remove/reorder only.
- [ ] **Unsaved Changes Warning**: Should the Cancel button prompt for confirmation if there are unsaved changes? Recommend implementing this for better UX.
- [ ] **Content Type Icons**: Should we display type icons (video, photo, pdf, text, url) on content cards in the edit view? The existing ContentPieceCard may already handle this.

---

## Out of Scope

Per the original request, the following are explicitly out of scope:

1. **Purpose Editing**: Purpose field is not editable; it's not even displayed in the read-only section
2. **Item Identity Changes**: Room, item type, and item name are read-only (changing these would require a different item)
3. **Multi-Article Management**: This page edits a single article; managing multiple articles per item is separate
4. **QR Code Generation**: No QR code generation or display on the edit page
5. **Step Progress Indicators**: Explicitly removed per requirements
6. **Back Arrow Navigation**: Explicitly removed; only Cancel button for navigation
7. **Multi-Step Workflow**: Single-page form only

---

*Document generated: 2026-01-12 23:36:21 CET*
