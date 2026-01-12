# REQ-215: Simplified Item Edit Page - Detailed Implementation Tasks

**Generated:** 2026-01-13 00:20:06 CET
**Reference Documents:**
- Requirements: docs/gen_requests.md (REQ-215)
- Overview: docs/req-215-simplified-item-edit-Overview.md

**CRITICAL INSTRUCTIONS FOR IMPLEMENTING AGENT:**
- Operate from the project root folder ONLY
- **DO NOT ATTEMPT TO NAVIGATE TO OTHER FOLDERS UNDER ANY CIRCUMSTANCES**
- All file paths must be relative to project root

---

## Summary

This document breaks down REQ-215 (Simplified Item Edit Page with Instructions List) into granular, actionable tasks. The implementation transforms the current Item Edit page into a focused metadata editor with room/type selectors and an instructions list section.

### Database Context (Current State)

**items table:**
- `id` (uuid, PK)
- `public_id` (varchar, unique)
- `name` (varchar)
- `description` (text, nullable)
- `property_id` (uuid, FK to properties)
- `tags` (text[], default '{}') - Room tags use format `#room.roomname`
- `qr_code_url` (text, nullable)
- `created_at`, `updated_at` (timestamptz)

**item_articles table:**
- `id` (uuid, PK)
- `item_id` (uuid, FK to items)
- `purpose` (varchar) - Categories: how_to_use, how_to_clean, troubleshooting, safety_info, maintenance, features, other
- `title` (varchar)
- `description` (text, nullable)
- `display_order` (integer, default 0)
- `created_at`, `updated_at` (timestamptz)

### Existing Patterns to Reuse

1. **Room/Type Constants:** `src/components/ItemCreationWorkflow/utils/constants.ts` - `ROOM_TYPES`, `ROOM_LABELS`, `ITEM_TYPES`, `ITEM_TYPE_LABELS`
2. **Room Extraction:** `src/lib/room-utils.ts` - `extractRoomFromTags()`
3. **Tags Editing:** `src/components/ItemManager/components/shared/TagsInlineEdit.tsx`
4. **Empty State:** `src/components/ItemManager/components/shared/EmptyState.tsx`
5. **Instructions Table:** `src/components/InstructionsTable/InstructionsTable.tsx` - Table patterns, purpose badges

---

## 1. Create Item Type Utilities

**Context:** The existing `src/lib/room-utils.ts` has `extractRoomFromTags()` but lacks a setter function. We need similar utilities for item types, which are stored as plain tags (e.g., `appliance`, `room-item`).
**Files to modify:** `src/lib/room-utils.ts`, Create `src/lib/item-type-utils.ts`
**Estimated effort:** 1 story point

- [x] **1.1** Add `setRoomInTags` function to `src/lib/room-utils.ts`:
  - Function signature: `setRoomInTags(tags: string[], roomType: string | null): string[]`
  - Remove any existing `#room.` prefixed tags from the array
  - If `roomType` is provided (not null/empty), add `#room.${roomType}` to the array
  - Return the modified tags array (do not mutate original)
  - Include JSDoc documentation following existing file style
  ---implemented: Added setRoomInTags function to room-utils.ts with JSDoc documentation-unit tested-

- [x] **1.2** Create new file `src/lib/item-type-utils.ts` with the following functions:
  - `extractItemTypeFromTags(tags: string[]): string | null` - Find and return first tag matching ITEM_TYPES values ('appliance', 'room-item', 'general-info')
  - `setItemTypeInTags(tags: string[], itemType: string | null): string[]` - Remove existing item type tags, add new one if provided
  - Import `ITEM_TYPES` from `@/components/ItemCreationWorkflow/utils/constants`
  - Include JSDoc documentation with examples
  ---implemented: Created item-type-utils.ts with extractItemTypeFromTags and setItemTypeInTags functions-unit tested-

- [x] **1.3** Verify utilities work correctly:
  - Test `setRoomInTags(['#room.kitchen', 'appliance'], 'bathroom')` returns `['appliance', '#room.bathroom']`
  - Test `extractItemTypeFromTags(['#room.kitchen', 'appliance'])` returns `'appliance'`
  - Test `setItemTypeInTags(['#room.kitchen', 'appliance'], 'room-item')` returns `['#room.kitchen', 'room-item']`
  ---implemented: Created test script and verified all utility functions work correctly-unit tested-

---

## 2. Create ItemEditForm Types and Index

**Context:** The new ItemEditForm component needs TypeScript interfaces for props, state, and callback types. Creating these upfront ensures type safety throughout implementation.
**Files to modify:** Create `src/components/ItemEditForm/index.ts`, Create `src/components/ItemEditForm/ItemEditForm.types.ts`
**Estimated effort:** 1 story point

- [x] **2.1** Create directory structure:
  - Create folder `src/components/ItemEditForm/` (if not exists)
  ---implemented: Created ItemEditForm directory-unit tested-

- [x] **2.2** Create `src/components/ItemEditForm/ItemEditForm.types.ts` with:
  ```typescript
  // Import from existing types
  import { ItemWithDetails, ItemArticle, Property } from '@/types';
  import { RoomTypeConst, ItemTypeConst } from '@/components/ItemCreationWorkflow/utils/constants';

  // Props for main form component
  export interface ItemEditFormProps {
    item: ItemWithDetails;
    onSave: (data: ItemEditFormData) => Promise<void>;
    onCancel: () => void;
    saving?: boolean;
    error?: string | null;
  }

  // Form data submitted on save
  export interface ItemEditFormData {
    name: string;
    description: string;
    tags: string[];
  }

  // Props for RoomSelector
  export interface RoomSelectorProps {
    value: RoomTypeConst | null;
    onChange: (room: RoomTypeConst | null) => void;
    disabled?: boolean;
  }

  // Props for ItemTypeSelector
  export interface ItemTypeSelectorProps {
    value: ItemTypeConst | null;
    onChange: (type: ItemTypeConst | null) => void;
    disabled?: boolean;
  }

  // Props for ItemInstructionsList
  export interface ItemInstructionsListProps {
    articles: ItemArticle[];
    itemName: string;
    onEditInstruction: (articleId: string) => void;
    loading?: boolean;
  }

  // Instruction row for simplified list display
  export interface InstructionListItem {
    id: string;
    title: string;
    purpose: string;
  }
  ```
  ---implemented: Created ItemEditForm.types.ts with all required interfaces-unit tested-

- [x] **2.3** Create `src/components/ItemEditForm/index.ts` barrel export:
  ```typescript
  export * from './ItemEditForm';
  export * from './ItemEditForm.types';
  export * from './RoomSelector';
  export * from './ItemTypeSelector';
  export * from './ItemInstructionsList';
  ```
  ---implemented: Created index.ts barrel export file-unit tested-

---

## 3. Create RoomSelector Component

**Context:** Room selection uses the `#room.roomname` tag format. The selector should display room options from `ROOM_TYPES` constant and update the form state.
**Files to modify:** Create `src/components/ItemEditForm/RoomSelector.tsx`
**Estimated effort:** 1 story point

- [x] **3.1** Create `src/components/ItemEditForm/RoomSelector.tsx`:
  - Import `ROOM_TYPES`, `ROOM_LABELS` from `@/components/ItemCreationWorkflow/utils/constants`
  - Import `RoomSelectorProps` from `./ItemEditForm.types`
  - Use a native `<select>` element with Tailwind styling matching existing form fields
  ---implemented: Created RoomSelector.tsx with select element and proper imports-unit tested-

- [x] **3.2** Implement component structure:
  - Label: "Room" with `text-sm font-medium text-gray-700 mb-2`
  - Select field styled to match existing form inputs: `w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF385C] focus:border-transparent`
  - First option: "Select a room..." with empty value
  - Map `ROOM_TYPES` to options using `ROOM_LABELS` for display text
  - Handle `onChange` to pass selected value (or null for empty) to parent
  ---implemented: Implemented full component structure with proper styling-unit tested-

- [x] **3.3** Add accessibility attributes:
  - `id="room-selector"` on select
  - `aria-label="Select room for this item"` on select
  - Associate label with `htmlFor="room-selector"`
  ---implemented: Added all accessibility attributes-unit tested-

---

## 4. Create ItemTypeSelector Component

**Context:** Item type selection uses plain tags (appliance, room-item, general-info). Similar pattern to RoomSelector but without the `#room.` prefix.
**Files to modify:** Create `src/components/ItemEditForm/ItemTypeSelector.tsx`
**Estimated effort:** 1 story point

- [x] **4.1** Create `src/components/ItemEditForm/ItemTypeSelector.tsx`:
  - Import `ITEM_TYPES`, `ITEM_TYPE_LABELS` from `@/components/ItemCreationWorkflow/utils/constants`
  - Import `ItemTypeSelectorProps` from `./ItemEditForm.types`
  - Follow same structure as RoomSelector
  ---implemented: Created ItemTypeSelector.tsx following RoomSelector pattern-unit tested-

- [x] **4.2** Implement component structure:
  - Label: "Item Type" with `text-sm font-medium text-gray-700 mb-2`
  - Select field with same styling as RoomSelector
  - First option: "Select item type..." with empty value
  - Map `ITEM_TYPES` to options using `ITEM_TYPE_LABELS` for display text
  - Handle `onChange` to pass selected value (or null) to parent
  ---implemented: Implemented full component structure with styling-unit tested-

- [x] **4.3** Add accessibility attributes:
  - `id="item-type-selector"` on select
  - `aria-label="Select item type"` on select
  - Associate label with `htmlFor="item-type-selector"`
  ---implemented: Added all accessibility attributes-unit tested-

---

## 5. Create ItemInstructionsList Component

**Context:** This component displays articles associated with an item. Reuse patterns from `InstructionsTable` for purpose badges and styling, but use a simpler list format suitable for the edit page context.
**Files to modify:** Create `src/components/ItemEditForm/ItemInstructionsList.tsx`
**Estimated effort:** 1 story point

- [x] **5.1** Create `src/components/ItemEditForm/ItemInstructionsList.tsx`:
  - Import `Pencil`, `FileText` from `lucide-react`
  - Import `ItemInstructionsListProps` from `./ItemEditForm.types`
  - Import or copy `getPurposeBadgeColor` and `formatPurposeLabel` helper functions from `src/components/InstructionsTable/InstructionsTable.tsx`
  ---implemented: Created ItemInstructionsList.tsx with all imports and helper functions copied-unit tested-

- [x] **5.2** Implement section header:
  - Container: `div` with `pt-6 border-t border-gray-200`
  - Title: `h3` with text "Instructions" and styling `text-lg font-medium text-gray-900 mb-4`
  - Subtitle: `p` with text "Content associated with this item" and styling `text-sm text-gray-500 mb-4`
  ---implemented: Implemented section header with proper styling-unit tested-

- [x] **5.3** Implement instructions list:
  - Use `ul` with styling `space-y-2`
  - Each `li` styled as: `flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors`
  - Left side: `FileText` icon (w-4 h-4 text-gray-400 mr-3) + title (text-sm font-medium text-gray-900) + purpose badge
  - Right side: Edit button with `Pencil` icon and "Edit" text, styled as: `inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-[#FF385C] hover:text-[#E31C5F] hover:bg-[#FFEEEF] rounded-lg transition-colors`
  - Edit button `onClick` calls `onEditInstruction(article.id)`
  ---implemented: Implemented full instructions list with proper layout and styling-unit tested-

- [x] **5.4** Implement purpose badge display:
  - Use same badge styling pattern: `inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ml-2`
  - Apply color class from `getPurposeBadgeColor(article.purpose)`
  - Display formatted label from `formatPurposeLabel(article.purpose)`
  ---implemented: Integrated purpose badges with proper styling-unit tested-

---

## 6. Implement Empty State for Instructions

**Context:** When an item has no associated articles, display a friendly empty state. Reuse the `EmptyState` component pattern from ItemManager.
**Files to modify:** `src/components/ItemEditForm/ItemInstructionsList.tsx`
**Estimated effort:** 1 story point

- [x] **6.1** Add empty state rendering to `ItemInstructionsList.tsx`:
  - Check if `articles.length === 0` after loading check
  - Import `FileText` icon for empty state display
  ---implemented: Added empty state check and FileText icon already imported-unit tested-

- [x] **6.2** Implement empty state UI:
  - Container: `div` with `text-center py-8`
  - Icon: `FileText` with `w-12 h-12 text-gray-300 mx-auto mb-3`
  - Title: `p` with "No instructions yet" and `text-gray-500 font-medium`
  - Description: `p` with "Instructions for this item will appear here" and `text-sm text-gray-400 mt-1`
  ---implemented: Implemented empty state UI with proper styling-unit tested-

- [x] **6.3** Add loading skeleton:
  - When `loading` prop is true, display 2-3 skeleton rows
  - Each skeleton row: `div` with `animate-pulse flex items-center justify-between p-3 bg-gray-100 rounded-lg`
  - Left: `div` with `h-4 bg-gray-200 rounded w-2/3`
  - Right: `div` with `h-8 bg-gray-200 rounded w-16`
  ---implemented: Added loading skeleton with 2 placeholder rows-unit tested-

---

## 7. Create Main ItemEditForm Component

**Context:** The main form component orchestrates all sub-components and manages form state. It handles tag extraction/setting for room and type, and integrates the simplified tags editor.
**Files to modify:** Create `src/components/ItemEditForm/ItemEditForm.tsx`
**Estimated effort:** 1 story point

- [ ] **7.1** Create `src/components/ItemEditForm/ItemEditForm.tsx` with imports:
  - React hooks: `useState`, `useCallback`, `useMemo`
  - Lucide icons: `Save`, `Loader2`
  - Local components: `RoomSelector`, `ItemTypeSelector`, `ItemInstructionsList`
  - Utils: `extractRoomFromTags`, `setRoomInTags` from `@/lib/room-utils`
  - Utils: `extractItemTypeFromTags`, `setItemTypeInTags` from `@/lib/item-type-utils`
  - Types: `ItemEditFormProps`, `ItemEditFormData` from `./ItemEditForm.types`
  - TagsInlineEdit: `TagsInlineEdit` from `@/components/ItemManager/components/shared/TagsInlineEdit`

- [ ] **7.2** Implement form state management:
  - `name`: string state initialized from `item.name`
  - `description`: string state initialized from `item.description || ''`
  - `tags`: string[] state initialized from item.tags (preserve original for tag editing)
  - Derived state: `selectedRoom` computed via `useMemo` from tags using `extractRoomFromTags`
  - Derived state: `selectedItemType` computed via `useMemo` from tags using `extractItemTypeFromTags`
  - `customTags`: computed by filtering out room tags (`#room.`) and item type tags from tags array

- [ ] **7.3** Implement room/type change handlers:
  - `handleRoomChange`: Update tags using `setRoomInTags(tags, newRoom)`
  - `handleItemTypeChange`: Update tags using `setItemTypeInTags(tags, newType)`

- [ ] **7.4** Implement form submission:
  - Create `handleSubmit` async function that calls `onSave` with `{ name, description, tags }`
  - Prevent default form submission
  - Validate name is not empty before submitting

---

## 8. Implement Tags Section in ItemEditForm

**Context:** The tags section should allow editing custom tags while room and item type are managed by their dedicated selectors. Filter out managed tags before displaying in TagsInlineEdit.
**Files to modify:** `src/components/ItemEditForm/ItemEditForm.tsx`
**Estimated effort:** 1 story point

- [ ] **8.1** Compute custom tags (tags excluding room and item type):
  - Create `customTags` using `useMemo`:
    ```typescript
    const customTags = useMemo(() => {
      return tags.filter(tag => {
        // Exclude room tags
        if (tag.startsWith('#room.')) return false;
        // Exclude item type tags
        if (['appliance', 'room-item', 'general-info'].includes(tag)) return false;
        return true;
      });
    }, [tags]);
    ```

- [ ] **8.2** Implement custom tags update handler:
  - `handleCustomTagsSave`: Async function that:
    1. Extracts current room tag (if any)
    2. Extracts current item type tag (if any)
    3. Combines new custom tags with preserved room/type tags
    4. Updates the tags state

- [ ] **8.3** Add TagsInlineEdit to form:
  - Place after Item Type selector
  - Label: "Tags" with helper text "Additional tags for categorization"
  - Pass `customTags` as the `tags` prop
  - Pass `handleCustomTagsSave` as the `onSave` prop
  - Set `disabled={saving}` to prevent edits during save

---

## 9. Refactor EditItemPage to Use New Components

**Context:** The existing page at `src/app/dashboard2/items/[publicId]/edit/page.tsx` needs to be simplified by removing MediaManagementSection and Property display, integrating the new ItemEditForm components.
**Files to modify:** `src/app/dashboard2/items/[publicId]/edit/page.tsx`
**Estimated effort:** 1 story point

- [ ] **9.1** Update imports in `page.tsx`:
  - Remove: `MediaManagementSection`, `EditableMediaLink` imports
  - Add: Import new components from `@/components/ItemEditForm`
  - Add: `extractRoomFromTags`, `setRoomInTags` from `@/lib/room-utils`
  - Add: `extractItemTypeFromTags`, `setItemTypeInTags` from `@/lib/item-type-utils`

- [ ] **9.2** Update state declarations:
  - Remove: `mediaLinks` state and `setMediaLinks`
  - Add: `tags` state initialized from item.tags
  - Keep: `name`, `description`, `item`, `loading`, `saving`, `error` states

- [ ] **9.3** Remove MediaManagementSection callback:
  - Delete `handleMediaLinksChange` callback function

- [ ] **9.4** Update form submission handler:
  - Remove `links` from the `updateItem` payload
  - Add `tags` to the payload (must extend UpdateItemRequest type if needed)
  - Keep `name`, `description`, `propertyId` in payload

---

## 10. Update Form UI Structure

**Context:** Remove the Property display section and MediaManagementSection from the rendered form, replace with the new RoomSelector, ItemTypeSelector, and Tags components.
**Files to modify:** `src/app/dashboard2/items/[publicId]/edit/page.tsx`
**Estimated effort:** 1 story point

- [ ] **10.1** Remove Property display section:
  - Delete the entire block that renders `item?.property` with the read-only property display
  - Delete the "Property cannot be changed after creation" helper text

- [ ] **10.2** Remove MediaManagementSection:
  - Delete the `<div className="pt-4 border-t border-gray-200">` containing `MediaManagementSection`
  - Delete all references to `mediaLinks` in the form

- [ ] **10.3** Add Room selector after Description field:
  - Create state: `const [selectedRoom, setSelectedRoom] = useState<RoomTypeConst | null>(() => extractRoomFromTags(item?.tags || []))`
  - Add `<RoomSelector value={selectedRoom} onChange={handleRoomChange} disabled={saving} />`
  - Implement `handleRoomChange` to update tags state

- [ ] **10.4** Add Item Type selector after Room selector:
  - Create state: `const [selectedItemType, setSelectedItemType] = useState<ItemTypeConst | null>(() => extractItemTypeFromTags(item?.tags || []))`
  - Add `<ItemTypeSelector value={selectedItemType} onChange={handleItemTypeChange} disabled={saving} />`
  - Implement `handleItemTypeChange` to update tags state

- [ ] **10.5** Add Tags section after Item Type:
  - Add wrapper div with label "Additional Tags"
  - Integrate TagsInlineEdit or simple tag input for custom tags
  - Helper text: "Add custom tags for additional categorization"

---

## 11. Add Instructions List Section

**Context:** Add the ItemInstructionsList component at the bottom of the form to display associated articles with edit navigation.
**Files to modify:** `src/app/dashboard2/items/[publicId]/edit/page.tsx`
**Estimated effort:** 1 story point

- [ ] **11.1** Ensure articles are available in item data:
  - Check that `adminApi.getItem` response includes `articles` array
  - If not included, may need to fetch separately using `adminApi.listArticles(item.id)`

- [ ] **11.2** Add ItemInstructionsList after form fields (before action buttons):
  - Add separator: `<div className="pt-6 border-t border-gray-200">`
  - Render `<ItemInstructionsList articles={item?.articles || []} itemName={item?.name || ''} onEditInstruction={handleEditInstruction} />`

- [ ] **11.3** Implement navigation handler:
  - Create `handleEditInstruction` callback:
    ```typescript
    const handleEditInstruction = useCallback((articleId: string) => {
      router.push(`/dashboard2/instructions/${articleId}/edit`);
    }, [router]);
    ```
  - Import `useRouter` from `next/navigation` (already imported)

---

## 12. Update API to Include Articles in getItem Response

**Context:** The `adminApi.getItem` response should include the articles array for the item so the instructions list can display them without a separate API call.
**Files to modify:** Review `src/app/api/admin/items/[publicId]/route.ts` (not in authorized list - may need to request permission)
**Estimated effort:** 1 story point

**NOTE:** This task may require modification to files outside the authorized list. If the API route is not in the authorized files, request permission before proceeding.

- [ ] **12.1** Check current getItem API response:
  - Review `src/app/api/admin/items/[publicId]/route.ts` GET handler
  - Verify if `articles` are already included in the response

- [ ] **12.2** If articles not included, update the API query:
  - Add a join to fetch `item_articles` related to the item
  - Include articles in the response data structure
  - Map database fields to camelCase for consistency

- [ ] **12.3** Update TypeScript types if needed:
  - Verify `ItemResponse` type in `src/types/index.ts` includes articles
  - The type already has `articles?: {...}[]` so should be compatible

---

## 13. Update UpdateItemRequest to Include Tags

**Context:** The item update API needs to accept tags in the request payload. Verify the existing type and API support this.
**Files to modify:** `src/types/index.ts` (review only), `src/app/api/admin/items/[publicId]/route.ts` (may need permission)
**Estimated effort:** 1 story point

- [ ] **13.1** Review UpdateItemRequest type:
  - Check `src/types/index.ts` for `UpdateItemRequest` interface
  - Verify if `tags?: string[]` field exists

- [ ] **13.2** If tags not in UpdateItemRequest, add it:
  - Add `tags?: string[]` to the `UpdateItemRequest` interface in `src/types/index.ts`
  - This should be optional to maintain backward compatibility

- [ ] **13.3** Verify API handler accepts tags:
  - Check `src/app/api/admin/items/[publicId]/route.ts` PUT handler
  - Ensure it reads `tags` from request body and updates the database

---

## 14. Integration Testing

**Context:** Verify all components work together correctly with real data.
**Files to modify:** None (testing only)
**Estimated effort:** 1 story point

- [ ] **14.1** Test form rendering:
  - Navigate to `/dashboard2/items/[publicId]/edit` for an existing item
  - Verify Name and Description fields display correctly
  - Verify Room selector shows current room (if any)
  - Verify Item Type selector shows current type (if any)
  - Verify Tags section shows custom tags (excluding room/type)

- [ ] **14.2** Test room selection:
  - Change room selection
  - Save the item
  - Reload the page
  - Verify room selection persisted correctly in tags

- [ ] **14.3** Test item type selection:
  - Change item type selection
  - Save the item
  - Reload the page
  - Verify item type persisted correctly in tags

- [ ] **14.4** Test instructions list:
  - Verify articles for the item are displayed
  - Click "Edit" on an instruction
  - Verify navigation to `/dashboard2/instructions/[articleId]/edit`
  - Test with item that has 0 articles (empty state)
  - Test with item that has multiple articles

- [ ] **14.5** Test form validation:
  - Clear the name field and try to save
  - Verify validation prevents save
  - Verify error feedback is displayed

---

## 15. Accessibility and UX Polish

**Context:** Ensure the form meets accessibility standards and provides good user experience.
**Files to modify:** All new components created
**Estimated effort:** 1 story point

- [ ] **15.1** Keyboard navigation:
  - Verify all form fields are reachable via Tab key
  - Verify Enter key submits the form
  - Verify Escape key in selectors closes dropdown

- [ ] **15.2** Screen reader compatibility:
  - Verify all form fields have associated labels
  - Verify error messages are announced
  - Verify loading states are announced

- [ ] **15.3** Visual feedback:
  - Verify focus states are visible on all interactive elements
  - Verify loading spinner displays during save
  - Verify error messages are clearly visible

- [ ] **15.4** Mobile responsiveness:
  - Test form layout on mobile viewport (375px)
  - Verify touch targets are at least 44px
  - Verify instructions list is scrollable if needed

---

## Authorization Boundary Verification

The following files are authorized for modification per the overview document:

**Core Page Component:**
- `src/app/dashboard2/items/[publicId]/edit/page.tsx` - Modify

**New Components to Create:**
- `src/components/ItemEditForm/index.ts` - Create
- `src/components/ItemEditForm/ItemEditForm.tsx` - Create
- `src/components/ItemEditForm/ItemEditForm.types.ts` - Create
- `src/components/ItemEditForm/RoomSelector.tsx` - Create
- `src/components/ItemEditForm/ItemTypeSelector.tsx` - Create
- `src/components/ItemEditForm/ItemInstructionsList.tsx` - Create

**Utility Functions:**
- `src/lib/room-utils.ts` - Modify (add setRoomInTags)
- `src/lib/item-type-utils.ts` - Create (new file)

**Components to Reuse (import only):**
- `src/components/ItemManager/components/shared/TagsInlineEdit.tsx` - Import
- `src/components/ItemManager/components/shared/EmptyState.tsx` - Import
- `src/components/InstructionsTable/InstructionsTable.tsx` - Reference patterns
- `src/components/ItemCreationWorkflow/utils/constants.ts` - Import

**API Integration (review/extend):**
- `src/lib/api.ts` - Review (may need articles in getItem)
- `src/types/index.ts` - Extend if needed (add tags to UpdateItemRequest)

**Files requiring permission if modification needed:**
- `src/app/api/admin/items/[publicId]/route.ts` - Not in authorized list

---

## Quality Checklist

Before completing implementation, verify:

- [ ] All tasks reference only authorized files/functions
- [ ] Each numbered task is completable in ~1 story point
- [ ] All file paths are relative to project root
- [ ] No navigation commands to other directories
- [ ] Testing tasks are included
- [ ] Database context documented (items.tags, item_articles)
- [ ] Solutions are input-driven, not example-specific
- [ ] Implementation uses standard Next.js/React patterns
- [ ] All subtask checkboxes use the **X.Y** ID format

---

*Document generated: 2026-01-13 00:20:06 CET*
