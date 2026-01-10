# REQ-177: Intelligent Pre-filling of Item Details - Detailed Implementation Tasks

**Generated:** 2026-01-10 12:41:20 CET
**Reference Documents:**
- Requirements: docs/gen_requests.md (Request #177)
- Overview: docs/req-177-intelligent-prefill-Overview.md

**CRITICAL INSTRUCTIONS FOR IMPLEMENTING AGENT:**
- Operate from the project root folder ONLY
- **DO NOT ATTEMPT TO NAVIGATE TO OTHER FOLDERS UNDER ANY CIRCUMSTANCES**
- All file paths must be relative to project root
- Read each file before modifying it
- Run tests after each implementation task to verify changes

---

## Summary

This document breaks down REQ-177 (Intelligent Pre-filling of Item Details) into granular, 1-story-point tasks. The feature adds automatic tag selection based on workflow choices (room + item type + purpose).

**Key Context from Codebase Analysis:**
- Item Name pre-filling already works via `generateArticleTitle()` in `/src/components/ItemCreationWorkflow/utils/titleGenerator.ts`
- Purpose pre-filling already works (carried through workflow state in `SELECT_PURPOSE` action)
- Tags are the NEW feature - must be added from scratch
- Current interfaces `CurrentItemState` and `SessionItem` do NOT have a `tags` field
- Tags are client-side only (no database persistence in this request)

---

## Task 1: Define Tag Types and Constants

**Context:** The workflow uses constants defined in `/src/components/ItemCreationWorkflow/utils/constants.ts`. Tags need to follow the same pattern as existing room/item/purpose types. Tags will be string literals representing categorization concepts.

**Files to modify:**
- `/src/components/ItemCreationWorkflow/utils/constants.ts`

**Estimated effort:** 1 story point

- [x] **1.1** Add the `AVAILABLE_TAGS` constant array after the `PURPOSE_ICONS` section (around line 325). Include these tag values: `'kitchen'`, `'laundry'`, `'bedroom'`, `'bathroom'`, `'living-room'`, `'garage'`, `'outdoor'`, `'general'`, `'appliance'`, `'room-item'`, `'instructions'`, `'cleaning'`, `'troubleshooting'`, `'safety'`, `'maintenance'`, `'features'`, `'info'` ---implemented: Added AVAILABLE_TAGS constant with all 17 tag values and JSDoc documentation-unit tested-

- [x] **1.2** Add the `TagTypeConst` type below the constant: `export type TagTypeConst = (typeof AVAILABLE_TAGS)[number];` ---implemented: Added TagTypeConst type definition-unit tested-

- [x] **1.3** Add the `TAG_LABELS` constant as a `Record<TagTypeConst, string>` with human-readable labels for each tag (e.g., `'kitchen': 'Kitchen'`, `'instructions': 'Instructions'`, etc.) ---implemented: Added TAG_LABELS Record with human-readable labels for all 17 tags-unit tested-

- [x] **1.4** Verify the file compiles without TypeScript errors by running: `npx tsc --noEmit src/components/ItemCreationWorkflow/utils/constants.ts` ---implemented: TypeScript compilation verified successfully-unit tested-

---

## Task 2: Create Tag Mapping Logic

**Context:** The tag mapper determines which tags to auto-select based on the combination of room, item type, and purpose. This is a new utility file. The mapping should use pattern-based logic rather than exhaustive enumeration (as stated in the overview).

**Files to modify:**
- `/src/components/ItemCreationWorkflow/utils/tagMapper.ts` (CREATE)

**Estimated effort:** 1 story point

- [ ] **2.1** Create the file `/src/components/ItemCreationWorkflow/utils/tagMapper.ts`

- [ ] **2.2** Import types from the types file: `import type { RoomType, ItemType, PurposeType } from '../ItemCreationWorkflow.types';`

- [ ] **2.3** Import `TagTypeConst` from constants: `import type { TagTypeConst } from './constants';`

- [ ] **2.4** Create the `TagMapperInput` interface with fields: `room: RoomType`, `itemType: ItemType`, `purpose: PurposeType | null`

- [ ] **2.5** Implement the `generateTags(input: TagMapperInput): TagTypeConst[]` function with this logic:
  - Start with empty array
  - Add room tag if room is not 'other' (map room value to tag, e.g., 'kitchen' -> 'kitchen', 'living-room' -> 'living-room')
  - Add 'appliance' tag if itemType is 'appliance'
  - Add 'room-item' tag if itemType is 'room-item'
  - Add purpose-derived tag using PURPOSE_TO_TAG mapping: `'how-to-use' -> 'instructions'`, `'how-to-clean' -> 'cleaning'`, `'troubleshooting' -> 'troubleshooting'`, `'safety-info' -> 'safety'`, `'maintenance' -> 'maintenance'`, `'features' -> 'features'`, `'other' -> 'info'`
  - If room is 'general' or itemType is 'general-info', add 'general' and 'info' tags
  - Return deduplicated array

- [ ] **2.6** Export the function and interface: `export { generateTags, type TagMapperInput };`

- [ ] **2.7** Add JSDoc documentation with module header and examples showing input/output

---

## Task 3: Extend Type Definitions for Tags

**Context:** The `CurrentItemState` and `SessionItem` interfaces in `/src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` need a `tags` field. The `WorkflowAction` union needs a `SET_TAGS` action.

**Files to modify:**
- `/src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts`

**Estimated effort:** 1 story point

- [ ] **3.1** Read the file to understand current structure

- [ ] **3.2** Add `tags: string[];` field to `CurrentItemState` interface (after line 183, after the `content` field). Add JSDoc: `/** Auto-generated tags based on workflow selections (REQ-177) */`

- [ ] **3.3** Add `tags?: string[];` field to `SessionItem` interface (after line 210, after the `qrCodeUrl` field). Make it optional with `?` for backward compatibility. Add JSDoc: `/** Tags for categorization (optional, REQ-177) */`

- [ ] **3.4** Add a new action to the `WorkflowAction` union (around line 389, after SET_ITEM_NAME):
```typescript
// Tags action (REQ-177)
| { type: 'SET_TAGS'; payload: string[] }
```

- [ ] **3.5** Update the `@lastModified` comment at the top of the file to today's date and add `REQ-177 Tags`

- [ ] **3.6** Verify TypeScript compilation: `npx tsc --noEmit src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts`

---

## Task 4: Update Workflow Reducer for Tags

**Context:** The reducer in `/src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts` handles state transitions. Tags should be auto-generated when purpose is selected (in `SELECT_PURPOSE` action) since that's when all required data is available.

**Files to modify:**
- `/src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`

**Estimated effort:** 1 story point

- [ ] **4.1** Read the file to understand current reducer structure

- [ ] **4.2** Add import for the tag mapper at the top (around line 69): `import { generateTags } from '../utils/tagMapper';`

- [ ] **4.3** Update `createInitialState()` function (around line 120) to include `tags: []` in the initial state when `currentItem` would be initialized

- [ ] **4.4** Update the `SELECT_ROOM` case (around line 264) to initialize `tags: []` in the `newItem` object

- [ ] **4.5** Update the `SELECT_PURPOSE` case (around line 342) to auto-generate tags. After generating the article title, add:
```typescript
// Auto-generate tags based on selections (REQ-177)
const autoTags = generateTags({
  room: state.currentItem.room,
  itemType: state.currentItem.itemType,
  purpose: purpose,
});
```
Then include `tags: autoTags` in the `updatedItem` object

- [ ] **4.6** Add a new case for `SET_TAGS` action (after the `SELECT_PURPOSE` case, around line 370):
```typescript
case 'SET_TAGS': {
  if (!state.currentItem) return state;
  const updatedItem: CurrentItemState = {
    ...state.currentItem,
    tags: action.payload,
  };
  return {
    ...state,
    currentItem: updatedItem,
    isDirty: true,
    session: {
      ...state.session,
      currentItem: updatedItem,
    },
  };
}
```

- [ ] **4.7** Update the `ADD_MORE_TO_ITEM` case (around line 531) to preserve tags when restoring an item: include `tags: restoredItem.tags || []` in the reconstructed item

- [ ] **4.8** Add `setTags` action function in the hook (around line 777):
```typescript
const setTags = useCallback((tags: string[]) => {
  dispatch({ type: 'SET_TAGS', payload: tags });
}, []);
```

- [ ] **4.9** Add `setTags` to the `UseWorkflowStateReturn` interface and include it in the return object

---

## Task 5: Create TagsEditor Component

**Context:** The TagsEditor component displays auto-selected tags as chips/badges and allows users to add/remove tags. It follows the project's Airbnb-inspired design patterns. The component should use existing styling conventions from other shared components.

**Files to modify:**
- `/src/components/ItemCreationWorkflow/components/shared/TagsEditor.tsx` (CREATE)

**Estimated effort:** 1 story point

- [ ] **5.1** Create the file `/src/components/ItemCreationWorkflow/components/shared/TagsEditor.tsx`

- [ ] **5.2** Add the file header with JSDoc documentation explaining the component purpose

- [ ] **5.3** Import required dependencies: `useState`, `useCallback` from 'react', `X`, `Plus` from 'lucide-react', `cn` from '@/lib/utils'

- [ ] **5.4** Import tag constants: `AVAILABLE_TAGS`, `TAG_LABELS`, `type TagTypeConst` from '../../utils/constants'

- [ ] **5.5** Create the `TagsEditorProps` interface with:
  - `selectedTags: string[]` - currently selected tags
  - `onTagsChange: (tags: string[]) => void` - callback when tags change
  - `disabled?: boolean` - disable editing
  - `maxTags?: number` - maximum tags allowed (default: 10)
  - `className?: string` - optional CSS class

- [ ] **5.6** Implement the `TagChip` sub-component for displaying individual tags:
  - Display tag label from TAG_LABELS
  - Include X button to remove (unless disabled)
  - Use Airbnb color scheme: `bg-gray-100 text-gray-700 hover:bg-gray-200`
  - Include focus ring for accessibility
  - Min height 32px for touch targets

- [ ] **5.7** Implement the `TagsEditor` main component:
  - Display selected tags as TagChip components
  - Show count badge: `{selectedTags.length} / {maxTags}`
  - Include "+ Add Tag" dropdown button (only if under maxTags)
  - Dropdown shows available tags not yet selected
  - Handle keyboard navigation (Enter to select, Escape to close)
  - Include aria-labels for accessibility

- [ ] **5.8** Export the component and props type at the bottom of the file

---

## Task 6: Export TagsEditor from Shared Index

**Context:** All shared components are exported through the barrel file at `/src/components/ItemCreationWorkflow/components/shared/index.ts`. TagsEditor needs to be added to this file.

**Files to modify:**
- `/src/components/ItemCreationWorkflow/components/shared/index.ts`

**Estimated effort:** 1 story point

- [ ] **6.1** Read the current index.ts file structure

- [ ] **6.2** Add a new section after the Selection Components section (around line 63), before Content Components:
```typescript
// =============================================================================
// Tags Components (REQ-177)
// =============================================================================
/**
 * Tag management components for item categorization.
 * Used in PreviewSaveStep for displaying and editing auto-generated tags.
 */
export { TagsEditor } from './TagsEditor';
export type { TagsEditorProps } from './TagsEditor';
```

- [ ] **6.3** Update the `@lastModified` comment at the top of the file

- [ ] **6.4** Verify the export works: `npx tsc --noEmit src/components/ItemCreationWorkflow/components/shared/index.ts`

---

## Task 7: Integrate TagsEditor into PreviewSaveStep

**Context:** The PreviewSaveStep component (`/src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx`) displays item details before saving. The TagsEditor should appear in the ItemDetailsSection, after the read-only metadata fields and before the Article Title.

**Files to modify:**
- `/src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx`

**Estimated effort:** 1 story point

- [ ] **7.1** Read the PreviewSaveStep component to understand current structure

- [ ] **7.2** Update imports section (around line 50) to include TagsEditor: `import { ItemNameEditor, ContentPieceCard, SortableContentPieceCard, TagsEditor } from '../shared';`

- [ ] **7.3** Update `PreviewSaveStepProps` interface (around line 65) to add:
  - `onUpdateTags: (tags: string[]) => void;` - callback for tag changes

- [ ] **7.4** Add `onUpdateTags` to the component's destructured props (around line 424)

- [ ] **7.5** Update `ItemDetailsSectionProps` interface (around line 173) to add:
  - `onUpdateTags: (tags: string[]) => void;`

- [ ] **7.6** Update `ItemDetailsSection` component (around line 179) to accept and use `onUpdateTags` prop

- [ ] **7.7** Add TagsEditor to `ItemDetailsSection` after the `ItemDetailsDisplay` component and before the Article Title input (around line 203):
```tsx
{/* Tags Editor - REQ-177 */}
<div className="mt-4">
  <label className="block text-sm font-medium text-[#717171] mb-2">
    Tags
  </label>
  <TagsEditor
    selectedTags={currentItem.tags || []}
    onTagsChange={onUpdateTags}
    disabled={disabled}
    maxTags={10}
  />
</div>
```

- [ ] **7.8** Update the ItemDetailsSection call in the main component (around line 577) to pass `onUpdateTags`:
```tsx
<ItemDetailsSection
  currentItem={currentItem}
  onUpdateItemName={onUpdateItemName}
  onUpdateTags={onUpdateTags}
  disabled={isSaving}
/>
```

---

## Task 8: Wire Tags to ItemCreationWorkflow Component

**Context:** The main orchestrator component (`/src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`) needs to pass the tag update handler to PreviewSaveStep and include tags in the save flow.

**Files to modify:**
- `/src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`

**Estimated effort:** 1 story point

- [ ] **8.1** Read the ItemCreationWorkflow component to understand the current save flow

- [ ] **8.2** Update the destructured return from `useWorkflowState()` (around line 112) to include `setTags`:
```typescript
const {
  // ... existing properties
  setTags,
} = useWorkflowState();
```

- [ ] **8.3** Update the `handleSaveItem` function (around line 294) to include tags in the `SessionItem`:
```typescript
const sessionItem: SessionItem = {
  id: generateUUID(),
  name: state.currentItem.itemName,
  room: state.currentItem.room,
  itemType: state.currentItem.itemType,
  content: state.currentItem.content,
  tags: state.currentItem.tags || [],  // Add this line
  createdAt: new Date(),
};
```

- [ ] **8.4** Update the PreviewSaveStep rendering (around line 544) to pass `onUpdateTags`:
```tsx
<PreviewSaveStep
  currentItem={state.currentItem!}
  onUpdateItemName={setItemName}
  onUpdateTags={setTags}  // Add this line
  onRemoveContent={removeContentPiece}
  // ... rest of props
/>
```

- [ ] **8.5** Update the `handleAddMore` callback (around line 260) to preserve tags when reconstructing CurrentItemState:
```typescript
const restoredItem: CurrentItemState = {
  // ... existing fields
  tags: lastItem.tags || [],  // Add this line
  content: lastItem.content,
};
```

---

## Task 9: Create Tag Mapper Unit Tests

**Context:** Unit tests for the tag mapping logic ensure correct tag generation for all workflow combinations. Tests should cover the main scenarios outlined in the overview's Tag Mapping Matrix.

**Files to modify:**
- `/src/components/ItemCreationWorkflow/utils/__tests__/tagMapper.test.ts` (CREATE)

**Estimated effort:** 1 story point

- [ ] **9.1** Create the test file `/src/components/ItemCreationWorkflow/utils/__tests__/tagMapper.test.ts`

- [ ] **9.2** Add imports: `import { generateTags, type TagMapperInput } from '../tagMapper';`

- [ ] **9.3** Add test suite: `describe('generateTags', () => { ... })`

- [ ] **9.4** Add test case for kitchen + appliance + how-to-use: should return `['kitchen', 'appliance', 'instructions']`

- [ ] **9.5** Add test case for kitchen + appliance + how-to-clean: should return `['kitchen', 'appliance', 'cleaning']`

- [ ] **9.6** Add test case for laundry + appliance + troubleshooting: should return `['laundry', 'appliance', 'troubleshooting']`

- [ ] **9.7** Add test case for general + general-info + other: should return `['general', 'info']`

- [ ] **9.8** Add test case for other room: should NOT include the room tag, only item type and purpose tags

- [ ] **9.9** Add test case for null purpose: should still return room and item type tags without purpose-derived tag

- [ ] **9.10** Add test case for deduplication: verify no duplicate tags in output

- [ ] **9.11** Run tests to verify they pass: `npx jest src/components/ItemCreationWorkflow/utils/__tests__/tagMapper.test.ts`

---

## Task 10: Create TagsEditor Component Tests

**Context:** Component tests for TagsEditor ensure the UI works correctly for displaying, adding, and removing tags. Tests should verify accessibility and user interactions.

**Files to modify:**
- `/src/components/ItemCreationWorkflow/components/shared/__tests__/TagsEditor.test.tsx` (CREATE)

**Estimated effort:** 1 story point

- [ ] **10.1** Create the test file `/src/components/ItemCreationWorkflow/components/shared/__tests__/TagsEditor.test.tsx`

- [ ] **10.2** Add imports for testing: `import { render, screen, fireEvent } from '@testing-library/react';` and `import { TagsEditor } from '../TagsEditor';`

- [ ] **10.3** Add describe block: `describe('TagsEditor', () => { ... })`

- [ ] **10.4** Add test: "renders selected tags as chips" - pass selectedTags=['kitchen', 'appliance'] and verify both labels appear

- [ ] **10.5** Add test: "calls onTagsChange when removing a tag" - click X on a tag chip and verify callback with updated array

- [ ] **10.6** Add test: "shows Add Tag button when under maxTags" - render with 2 tags, maxTags=5, verify button visible

- [ ] **10.7** Add test: "hides Add Tag button when at maxTags" - render with 5 tags, maxTags=5, verify button not visible

- [ ] **10.8** Add test: "disables editing when disabled prop is true" - render with disabled=true, verify X buttons not present

- [ ] **10.9** Add test: "displays tag count badge" - render with 3 tags, verify "3 / 10" text visible

- [ ] **10.10** Add accessibility test: "tag chips have accessible labels" - verify aria-label on remove buttons

- [ ] **10.11** Run tests: `npx jest src/components/ItemCreationWorkflow/components/shared/__tests__/TagsEditor.test.tsx`

---

## Task 11: Update useWorkflowState Tests for Tags

**Context:** The existing test file `/src/components/ItemCreationWorkflow/hooks/__tests__/useWorkflowState.test.ts` needs additional test cases for the new tags functionality.

**Files to modify:**
- `/src/components/ItemCreationWorkflow/hooks/__tests__/useWorkflowState.test.ts`

**Estimated effort:** 1 story point

- [ ] **11.1** Read the existing test file to understand the test structure

- [ ] **11.2** Add a new describe block: `describe('Tags Management (REQ-177)', () => { ... })`

- [ ] **11.3** Add test: "SELECT_ROOM initializes tags as empty array"

- [ ] **11.4** Add test: "SELECT_PURPOSE auto-generates tags based on selections"

- [ ] **11.5** Add test: "SET_TAGS updates tags array"

- [ ] **11.6** Add test: "ADD_MORE_TO_ITEM preserves existing tags"

- [ ] **11.7** Add test: "generated tags include room, item type, and purpose-derived tags"

- [ ] **11.8** Run tests: `npx jest src/components/ItemCreationWorkflow/hooks/__tests__/useWorkflowState.test.ts`

---

## Task 12: Update PreviewSaveStep Tests for Tags

**Context:** The existing test file `/src/components/ItemCreationWorkflow/components/steps/__tests__/PreviewSaveStep.test.tsx` needs test cases for the TagsEditor integration.

**Files to modify:**
- `/src/components/ItemCreationWorkflow/components/steps/__tests__/PreviewSaveStep.test.tsx`

**Estimated effort:** 1 story point

- [ ] **12.1** Read the existing PreviewSaveStep test file

- [ ] **12.2** Update the mock `currentItem` in test fixtures to include `tags: ['kitchen', 'appliance', 'instructions']`

- [ ] **12.3** Add mock for `onUpdateTags` callback in the test setup

- [ ] **12.4** Add test: "displays TagsEditor in ItemDetailsSection"

- [ ] **12.5** Add test: "passes tags from currentItem to TagsEditor"

- [ ] **12.6** Add test: "calls onUpdateTags when tags are modified"

- [ ] **12.7** Run tests: `npx jest src/components/ItemCreationWorkflow/components/steps/__tests__/PreviewSaveStep.test.tsx`

---

## Task 13: Run Full Test Suite and Fix Issues

**Context:** After implementing all changes, run the complete test suite to ensure no regressions and all new functionality works correctly.

**Files to modify:** None (verification task)

**Estimated effort:** 1 story point

- [ ] **13.1** Run TypeScript compilation check: `npx tsc --noEmit`

- [ ] **13.2** Run the full ItemCreationWorkflow test suite: `npx jest src/components/ItemCreationWorkflow --coverage`

- [ ] **13.3** Verify all tests pass. If any fail, fix the issues before proceeding.

- [ ] **13.4** Review test coverage for new files - aim for >80% coverage on:
  - `tagMapper.ts`
  - `TagsEditor.tsx`
  - Modified sections of `useWorkflowState.ts`

- [ ] **13.5** Run linting: `npm run lint src/components/ItemCreationWorkflow`

- [ ] **13.6** Fix any linting errors

---

## Task 14: Manual Integration Testing

**Context:** Perform end-to-end manual testing to verify the complete flow works as expected with real user interactions.

**Files to modify:** None (verification task)

**Estimated effort:** 1 story point

- [ ] **14.1** Start the development server: `npm run dev`

- [ ] **14.2** Navigate to the item creation workflow

- [ ] **14.3** Test Case 1: Kitchen > Appliance > Fridge > How to Use
  - Verify tags auto-populate: kitchen, appliance, instructions
  - Verify tags appear in PreviewSaveStep

- [ ] **14.4** Test Case 2: Laundry > Appliance > Washing Machine > How to Clean
  - Verify tags auto-populate: laundry, appliance, cleaning

- [ ] **14.5** Test Case 3: General > WiFi Info > Other
  - Verify tags auto-populate: general, info

- [ ] **14.6** Test adding/removing tags manually in PreviewSaveStep
  - Add a new tag via dropdown
  - Remove an auto-selected tag
  - Verify changes persist after save

- [ ] **14.7** Test "Add More to Item" flow preserves tags

- [ ] **14.8** Verify zero-typing flow works: complete Kitchen > Appliance > Fridge > How to Use > Take Photo flow without any manual input

---

## Verification Checklist

Before marking this feature complete, verify:

- [ ] All 14 tasks completed successfully
- [ ] All TypeScript files compile without errors
- [ ] All tests pass (unit + integration)
- [ ] Test coverage >80% for new code
- [ ] No linting errors
- [ ] Manual testing confirms:
  - Tags auto-populate correctly based on workflow selections
  - TagsEditor displays and allows editing in PreviewSaveStep
  - Tags persist through save flow
  - Tags preserved in "Add More to Item" flow
  - Zero-typing flow works end-to-end

---

## Open Questions (From Overview)

These were noted as open questions in the overview document. The implementing agent should NOT address these unless explicitly instructed:

- [ ] Should tags be displayed in the SessionSummaryStep for each item?
- [ ] Should tags be visible on the success overlay after save?
- [ ] Should tag changes trigger the "unsaved changes" warning if user navigates away?
- [ ] Future: Will tags need to be persisted to the database? (Deferred to separate request)

---

*Document generated: 2026-01-10 12:41:20 CET*
