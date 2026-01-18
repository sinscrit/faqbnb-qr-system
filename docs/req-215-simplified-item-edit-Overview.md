# Implementation Overview: Simplified Item Edit Page with Instructions List

## Header

| Field | Value |
|-------|-------|
| Request Reference | #215 |
| Source File | docs/gen_requests.md |
| Original Request Date | 2026-01-13 |
| Breakdown Created | 2026-01-13 00:18:21 CET |
| T-shirt Size | M |
| Estimated Effort | 2-3 days (16-24 hours) |

## Goals

Transform the Item Edit page (`/dashboard2/items/[publicId]/edit`) into a focused item metadata editor with:

1. **Simplified Metadata Form**: Keep only essential editable fields (name, room, type, description, tags)
2. **Remove Clutter**: Remove Media & Links section and read-only Property display
3. **Instructions List Integration**: Add a new section showing all associated instructions/articles for the item
4. **Navigation Flow**: Enable users to navigate from item edit to instruction edit and back

### Assumptions & Clarifications

- Room selection will use the existing room tag format (`#room.roomname`) stored in the `tags` array
- Item Type selection will use the existing tag-based approach (e.g., `appliance`, `room-item`, `general-info`)
- The instructions list will reuse patterns from the existing `InstructionsTable` component
- "Create new instruction" functionality may link to the existing item creation workflow or be a separate REQ (out of scope for this REQ)
- Back navigation from REQ-214 edit page should return to this Item Edit page when navigated from here

## Implementation Plan

### Step 1: Create Simplified Item Edit Form Structure

- **Description**: Restructure the edit page to remove MediaManagementSection and Property display, keeping only the core metadata fields
- **Rationale**: Must establish the clean form structure before adding new features
- **Estimated Effort**: S (2-3 hours)

### Step 2: Add Room Selection Component

- **Description**: Add a room dropdown/selector that reads from and writes to the item's tags array using the `#room.roomname` format
- **Rationale**: Room is a key organizational attribute that needs a dedicated UI control
- **Estimated Effort**: M (3-4 hours)

### Step 3: Add Item Type Selection Component

- **Description**: Add an item type selector (appliance, room-item, general-info) that integrates with the item's tags
- **Rationale**: Item type helps categorize items and is currently missing from the edit form
- **Estimated Effort**: M (3-4 hours)

### Step 4: Enhance Tags Section

- **Description**: Add a tags editor component for custom tags (separate from room and type tags which are managed by their dedicated controls)
- **Rationale**: Tags provide additional categorization beyond room and type
- **Estimated Effort**: S (2-3 hours)

### Step 5: Create Instructions List Section

- **Description**: Add a new section at the bottom showing all articles associated with this item, with title, purpose, and edit action
- **Rationale**: Core feature enabling users to see and navigate to related instructions
- **Estimated Effort**: M (4-5 hours)

### Step 6: Implement Empty State for Instructions

- **Description**: Add an empty state when the item has no associated instructions, with option to create new instruction
- **Rationale**: Provides clear guidance when no content exists
- **Estimated Effort**: S (1-2 hours)

### Step 7: Update API Integration

- **Description**: Modify the item fetch to include associated articles, update the save logic to handle room/type tag extraction
- **Rationale**: Backend data flow must support the new UI structure
- **Estimated Effort**: S (2-3 hours)

### Step 8: Add Navigation and State Management

- **Description**: Implement navigation to instruction edit pages with proper back navigation context
- **Rationale**: Completes the user flow between item and instruction editing
- **Estimated Effort**: S (2 hours)

## Authorized Files and Functions for Modification

> **APPROVED SCOPE**: Changes outside this list require review

### Core Page Component

| File | Target | Type |
|------|--------|------|
| `src/app/dashboard2/items/[publicId]/edit/page.tsx` | `EditItemPage` | Modify |

### New Components to Create

| File | Target | Type |
|------|--------|------|
| `src/components/ItemEditForm/index.ts` | - | Create |
| `src/components/ItemEditForm/ItemEditForm.tsx` | `ItemEditForm` | Create |
| `src/components/ItemEditForm/ItemEditForm.types.ts` | - | Create |
| `src/components/ItemEditForm/RoomSelector.tsx` | `RoomSelector` | Create |
| `src/components/ItemEditForm/ItemTypeSelector.tsx` | `ItemTypeSelector` | Create |
| `src/components/ItemEditForm/ItemInstructionsList.tsx` | `ItemInstructionsList` | Create |

### Existing Components to Reuse/Extend

| File | Target | Type |
|------|--------|------|
| `src/components/ItemManager/components/shared/TagsInlineEdit.tsx` | `TagsInlineEdit` | Reuse |
| `src/components/ItemManager/components/shared/EmptyState.tsx` | `EmptyState` | Reuse |
| `src/components/InstructionsTable/InstructionsTable.tsx` | Reference patterns | Reference |
| `src/components/ItemCreationWorkflow/utils/constants.ts` | `ROOM_TYPES`, `ROOM_LABELS`, `ITEM_TYPES`, `ITEM_TYPE_LABELS` | Import |
| `src/components/ItemCreationWorkflow/components/shared/RoomCard.tsx` | Reference patterns | Reference |
| `src/components/ItemCreationWorkflow/components/shared/ItemTypeCard.tsx` | Reference patterns | Reference |

### Utility Functions

| File | Target | Type |
|------|--------|------|
| `src/lib/room-utils.ts` | `extractRoomFromTags` | Import |
| `src/lib/room-utils.ts` | `setRoomInTags` | Create (new function) |
| `src/lib/item-type-utils.ts` | `extractItemTypeFromTags`, `setItemTypeInTags` | Create (new file) |

### API Integration

| File | Target | Type |
|------|--------|------|
| `src/lib/api.ts` | `adminApi.getItem` | Review (may need articles included) |
| `src/lib/api.ts` | `adminApi.listArticles` | Import |
| `src/types/index.ts` | `ItemWithDetails` | Extend (ensure articles included) |

## Dependencies

### Internal Dependencies

- **REQ-214**: Dedicated Single-Page Edit Experience - The instruction edit page that users navigate to from the instructions list. Must be implemented before or in parallel with this REQ.
- **REQ-212**: Instructions List Page - Provides patterns and components (`InstructionsTable`) that can be reused.

### External Dependencies

- **Supabase Database**: Uses existing `items`, `item_articles`, and `item_links` tables with established relationships
- **Lucide React**: Icons for UI elements (Pencil, FileText, Plus, etc.)
- **Next.js Router**: Navigation between item edit and instruction edit pages

## Risks and Considerations

### Potential Side Effects

1. **Tag System Coupling**: Room and Item Type are stored as tags. Changes to tag handling could affect other components that read tags.
2. **Navigation Context**: When navigating from Item Edit to Instruction Edit (REQ-214), need to ensure the back button returns to Item Edit, not Instructions List.
3. **API Response Structure**: The `getItem` API may need modification to include articles array, which could affect other consumers of this endpoint.

### Testing Requirements

1. **Form Validation**: Test all metadata field validations (name required, description optional)
2. **Tag Manipulation**: Verify room and item type tags are correctly extracted, displayed, and saved
3. **Instructions List**: Test with items that have 0, 1, and many instructions
4. **Navigation Flow**: Verify round-trip navigation: Items List -> Item Edit -> Instruction Edit -> back to Item Edit
5. **Save Operations**: Verify item metadata updates persist correctly
6. **Accessibility**: Ensure keyboard navigation and screen reader compatibility

### Open Questions

- [ ] Should "Create new instruction" button be included in this REQ or deferred to a separate feature?
- [ ] What should happen to the MediaManagementSection data that currently exists? (Answer: It stays in DB, just not editable from this page)
- [ ] Should there be confirmation before navigating away from unsaved changes in the form?
- [ ] How should the room selector handle custom room names (the "Other" option)?

## Out of Scope

Per original request (REQ-215):

1. **Creating New Instructions**: This REQ focuses on listing and navigating to existing instructions, not creating new ones from this page
2. **Inline Instruction Editing**: Instructions are edited on their dedicated page (REQ-214), not inline
3. **Reordering Instructions**: Display order management is not part of this REQ
4. **Bulk Operations**: No bulk editing of multiple instructions
5. **Media & Links Management**: Intentionally removed from this page; managed through Instruction Edit (REQ-214)
6. **Property Reassignment**: Property cannot be changed after item creation (existing behavior)

---
*Document generated: 2026-01-13 00:18:21 CET*
