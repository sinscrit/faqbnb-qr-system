# REQ-209: Update CurrentItemState to Reflect Item-Article Separation

**Document Created:** 2026-01-12 20:45 UTC
**Last Modified:** 2026-01-12 20:45 UTC
**Request Type:** ENHANCEMENT
**Size:** M
**Phase:** 5 - Fix Data Model - Separate Item from Article (ITEM-02)
**Task ID:** 5.2
**Priority:** CRITICAL

---

## Overview

This task restructures the `CurrentItemState` interface to properly distinguish between physical Item properties and Article content properties. This is a critical architectural change that aligns the internal state management with the corrected data model where Items and Articles/Instructions are separate concepts.

**Key Distinction:**
- **Item**: A physical object (e.g., "Cabinets") that gets ONE QR code
- **Article/Instruction**: Content about how to use/clean/maintain the item (e.g., "How to Clean")

---

## Current Behavior

The `CurrentItemState` interface conflates Item and Article properties:

**Current structure (lines 160-187 of `ItemCreationWorkflow.types.ts`):**
```typescript
export interface CurrentItemState {
  room: RoomType;
  itemType: ItemType;
  specificItem: string;           // Physical item name
  itemName: string;               // Conflated - sometimes item, sometimes article title
  purpose: PurposeType | null;    // Article property
  contentSource: 'existing' | 'create-new';
  contentType: ContentType | null;
  content: ContentPiece[];        // Article content
  tags: string[];
}
```

**Problems with current structure:**
1. `itemName` is overloaded - it stores the article title (e.g., "How to Clean - Cabinets") but the QR code should show only the item name (e.g., "Cabinets")
2. No clear separation between Item metadata (room, itemType, specificItem) and Article metadata (purpose, content)
3. When user selects a purpose, `itemName` gets overwritten by `generateArticleTitle()` (line 381-384 of `useWorkflowState.ts`)
4. QR code display in `PreviewSaveStep` uses `itemName` which contains the article title, not the physical item name

---

## Expected Behavior

The `CurrentItemState` interface should clearly separate Item and Article concerns:

**Target structure:**
```typescript
export interface CurrentItemState {
  // === Item Properties (Physical Object) ===
  /** Selected room for this item */
  room: RoomType;
  /** Selected item type category */
  itemType: ItemType;
  /** Specific item name from suggestions or custom input */
  specificItem: string;
  /**
   * Physical item name for QR code display.
   * Equals specificItem. Example: "Cabinets"
   */
  itemName: string;
  /** Tags for item categorization */
  tags: string[];

  // === Current Article Being Created ===
  /** Article/Instruction metadata and content */
  currentArticle: {
    /** Article title derived from purpose (e.g., "How to Clean") */
    title: string;
    /** Purpose selection for this article */
    purpose: PurposeType | null;
    /** Content pieces for this article */
    content: ContentPiece[];
  };

  // === Content Creation State ===
  /** Content source for current article piece */
  contentSource: 'existing' | 'create-new';
  /** Selected content type for current piece */
  contentType: ContentType | null;

  // === Legacy Fields (Deprecated) ===
  /** @deprecated Use currentArticle.purpose */
  purpose?: PurposeType | null;
  /** @deprecated Use currentArticle.content */
  content?: ContentPiece[];
}
```

---

## Dependencies

### Depends On (upstream)
- **Task 5.1** (Add Article interface to types): The `Article` interface must be defined before `CurrentItemState` can reference article concepts
- **Phase 1** (ITEM-05 - Fix Step Count): Step count changes should be completed first as they establish the correct workflow structure

### Blocks (downstream)
- **Task 5.3** (Update PreviewSaveStep display): Cannot update display labels until the state structure is updated
- **Task 5.4** (Update QR code generation): QR code label logic depends on properly separated item name

### Parallel Safety
- **Files touched:**
  - `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` (PRIMARY)
  - `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts` (reducer updates)
  - `src/components/ItemCreationWorkflow/utils/constants.ts` (potential helper functions)
- **Conflicts with:**
  - Task 5.1 (both modify `ItemCreationWorkflow.types.ts`)
  - Task 5.3 (PreviewSaveStep reads CurrentItemState)
  - Any task modifying `useWorkflowState.ts` reducer
- **Safe to parallelize with:**
  - Phase 3 (ITEM-01 - Dashboard Cards) - different component tree
  - Phase 4 (ITEM-04 - Navigation Menu) - different component tree

---

## Implementation Approach

### Step 1: Update CurrentItemState Interface

**File:** `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts`

**Location:** Lines 160-187

**Changes:**
1. Add `currentArticle` nested object property
2. Keep legacy `purpose` and `content` fields as deprecated
3. Add JSDoc clarifying the Item vs Article distinction
4. Update `itemName` documentation to clarify it's the physical item name

### Step 2: Update WorkflowState Reducer

**File:** `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`

**Locations to update:**
- `createInitialState()` (lines 121-137) - Initialize `currentArticle` object
- `SELECT_ROOM` action (lines 265-288) - Initialize `currentArticle` when creating new item
- `SELECT_PURPOSE` action (lines 361-396) - Update `currentArticle.title` and `currentArticle.purpose` instead of `itemName`
- `ADD_CONTENT_PIECE` action (lines 436-458) - Add to `currentArticle.content`
- `REMOVE_CONTENT_PIECE` action (lines 460-475) - Remove from `currentArticle.content`
- `REORDER_CONTENT` action (lines 477-510) - Reorder `currentArticle.content`

### Step 3: Update Computed Values

**File:** `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`

**Locations:**
- `canGoNext` computed value (lines 892-919) - Check `currentArticle.content` length
- Update any references to `state.currentItem?.content` to use `state.currentItem?.currentArticle.content`

### Step 4: Maintain Backward Compatibility

During the transition:
1. Keep deprecated fields populated (mirrored from `currentArticle`)
2. Add getter utility functions if needed
3. Components can gradually migrate to using `currentArticle`

---

## Authorized Files and Functions for Modification

### Primary File
| File | Scope | Reason |
|------|-------|--------|
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` | `CurrentItemState` interface (lines 160-187) | Add `currentArticle` nested object, deprecate legacy fields |

### Secondary Files
| File | Scope | Reason |
|------|-------|--------|
| `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts` | `createInitialState()` (lines 121-137) | Initialize `currentArticle` object |
| `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts` | `SELECT_ROOM` case (lines 265-288) | Initialize `currentArticle` for new items |
| `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts` | `SELECT_PURPOSE` case (lines 361-396) | Update `currentArticle.title` instead of `itemName` |
| `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts` | `ADD_CONTENT_PIECE` case (lines 436-458) | Add to `currentArticle.content` |
| `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts` | `REMOVE_CONTENT_PIECE` case (lines 460-475) | Remove from `currentArticle.content` |
| `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts` | `REORDER_CONTENT` case (lines 477-510) | Reorder `currentArticle.content` |
| `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts` | `canGoNext` useMemo (lines 892-919) | Check `currentArticle.content.length` |

### Files NOT to Modify (in this task)
| File | Reason |
|------|--------|
| `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx` | Task 5.3 handles display updates |
| `src/app/dashboard2/create/page.tsx` | Task 5.4 handles QR code generation |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | Depends on Task 5.3/5.4 changes |

---

## Technical Considerations

### TypeScript Impact
- The change is additive (new `currentArticle` property)
- Deprecated fields maintained for backward compatibility
- Existing components continue to work until explicitly migrated

### Migration Strategy
1. **Phase A (this task):** Add `currentArticle` to `CurrentItemState`, update reducer
2. **Phase B (Task 5.3):** Update `PreviewSaveStep` to read from `currentArticle`
3. **Phase C (Task 5.4):** Update QR code generation to use `itemName` (not article title)
4. **Phase D (future):** Remove deprecated fields after all consumers migrated

### State Shape Example

**Before (current):**
```typescript
currentItem: {
  room: 'kitchen',
  itemType: 'room-item',
  specificItem: 'Cabinets',
  itemName: 'How to Clean - Cabinets',  // WRONG: Article title, not item name
  purpose: 'how-to-clean',
  content: [{ id: '...', type: 'video', ... }],
  contentSource: 'create-new',
  contentType: 'video',
  tags: ['kitchen', 'cleaning']
}
```

**After (target):**
```typescript
currentItem: {
  room: 'kitchen',
  itemType: 'room-item',
  specificItem: 'Cabinets',
  itemName: 'Cabinets',                  // CORRECT: Physical item name
  tags: ['kitchen', 'cleaning'],
  currentArticle: {
    title: 'How to Clean',               // Article title derived from purpose
    purpose: 'how-to-clean',
    content: [{ id: '...', type: 'video', ... }]
  },
  contentSource: 'create-new',
  contentType: 'video',
  // Deprecated (mirrored for compatibility):
  purpose: 'how-to-clean',
  content: [{ id: '...', type: 'video', ... }]
}
```

---

## Testing Requirements

### Unit Tests to Update
- `src/components/ItemCreationWorkflow/hooks/__tests__/useWorkflowState.test.ts`
  - Test `currentArticle` initialization
  - Test `SELECT_PURPOSE` updates `currentArticle.title`
  - Test content actions update `currentArticle.content`

### New Test Cases
1. Verify `itemName` remains stable when purpose changes
2. Verify `currentArticle.title` changes when purpose selected
3. Verify backward compatibility (deprecated fields still work)
4. Verify `canGoNext` checks `currentArticle.content.length`

---

## Acceptance Criteria

1. [ ] `CurrentItemState` interface includes `currentArticle` nested object
2. [ ] `createInitialState()` initializes `currentArticle` correctly
3. [ ] `SELECT_ROOM` action creates `currentArticle` with empty values
4. [ ] `SELECT_PURPOSE` action updates `currentArticle.title` (not `itemName`)
5. [ ] Content actions (add/remove/reorder) modify `currentArticle.content`
6. [ ] Deprecated fields (`purpose`, `content`) are mirrored for compatibility
7. [ ] `canGoNext` computed value checks `currentArticle.content`
8. [ ] All existing unit tests pass (or are updated)
9. [ ] TypeScript compilation succeeds with no errors

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking existing tests | High | Medium | Update test assertions to match new structure |
| Components crash on undefined | Medium | High | Initialize `currentArticle` in all code paths |
| Reducer logic complexity | Medium | Medium | Keep deprecated fields mirrored for gradual migration |

---

## References

- **Implementation Plan:** `docs/prd/Plan-109-FAQBNB-Review-2026-01-11b-Complete-Implementation.md` (Phase 5)
- **Request Entry:** `docs/gen_requests.md` (REQ-209)
- **Related Types File:** `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts`
- **Reducer Implementation:** `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`
