# REQ-209: Update CurrentItemState - Detailed Task Breakdown

**Document Created:** 2026-01-12 21:30 UTC
**Last Modified:** 2026-01-12 16:47 UTC
**Request Type:** ENHANCEMENT
**Size:** M
**Phase:** 5 - Fix Data Model - Separate Item from Article (ITEM-02)
**Task ID:** 5.2
**Priority:** CRITICAL
**Overview Document:** docs/REQ-209-update-currentitemstate-overview.md

---

## Executive Summary

This task completes the migration of `CurrentItemState` to properly separate Item and Article concerns. The interface structure has already been updated in REQ-208, but the reducer logic in `useWorkflowState.ts` still uses the old flat structure. This detailed breakdown specifies all code changes needed to fully migrate the state management to use the new `currentArticle` nested object.

**Key Discovery:** The `CurrentItemState` interface already has `currentArticle` defined (lines 218-225 in types file), but the reducer still initializes and manipulates the old flat structure.

---

## Pre-Conditions

- [x] Task 5.1 (REQ-208) completed - Article interface added to types
- [x] `CurrentItemState` interface includes `currentArticle` nested object
- [x] Deprecated fields documented with JSDoc @deprecated tags

---

## Authorized Files for Modification

| File | Scope | Line References |
|------|-------|-----------------|
| `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts` | `createInitialState()` | Lines 123-139 |
| `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts` | `SELECT_ROOM` case | Lines 267-290 |
| `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts` | `SELECT_PURPOSE` case | Lines 363-398 |
| `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts` | `ADD_CONTENT_PIECE` case | Lines 438-460 |
| `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts` | `REMOVE_CONTENT_PIECE` case | Lines 462-477 |
| `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts` | `REORDER_CONTENT` case | Lines 479-512 |
| `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts` | `canGoNext` useMemo | Lines 902-929 |
| `src/components/ItemCreationWorkflow/hooks/__tests__/useWorkflowState.test.ts` | Test updates | Various |

### Files NOT to Modify (handled by downstream tasks)

| File | Handled By |
|------|------------|
| `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx` | Task 5.3 (REQ-210) |
| `src/app/dashboard2/create/page.tsx` | Task 5.4 (REQ-211) |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | Task 5.3/5.4 |

---

## Task Breakdown

### Task 1: Update `createInitialState()` to Initialize `currentArticle`

**File:** `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`
**Location:** Lines 123-139
**Story Points:** 0.5

#### Current Code (Lines 123-139)
```typescript
export const createInitialState = (): WorkflowState => ({
  currentStep: 'room-selection',
  stepHistory: [],
  canGoBack: false,
  session: {
    id: generateUUID(),
    startedAt: new Date(),
    currentStep: 'room-selection',
    items: [],
    currentItem: null,
  },
  currentItem: null,
  isSubmitting: false,
  isDirty: false,
  errors: {},
  submitError: null,
});
```

#### Changes Required
No changes to `createInitialState()` itself - it correctly initializes `currentItem` as `null`. The `currentArticle` object is created when a room is selected.

#### Acceptance Criteria
- [x] Verify `createInitialState()` returns `currentItem: null` (existing behavior is correct)

---

### Task 2: Update `SELECT_ROOM` Action to Initialize `currentArticle`

**File:** `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`
**Location:** Lines 267-290
**Story Points:** 1

#### Current Code (Lines 267-290)
```typescript
case 'SELECT_ROOM': {
  const roomType = action.payload;
  const itemType = roomType === 'general' ? 'general-info' : null;
  const newItem: CurrentItemState = {
    room: roomType,
    itemType: itemType as ItemType,
    specificItem: '',
    itemName: '',
    purpose: null,            // Flat structure
    contentSource: 'existing',
    contentType: null,
    content: [],              // Flat structure
    tags: [],
  };
  // ... rest of case
}
```

#### Target Code
```typescript
case 'SELECT_ROOM': {
  const roomType = action.payload;
  const itemType = roomType === 'general' ? 'general-info' : null;
  const newItem: CurrentItemState = {
    room: roomType,
    itemType: itemType as ItemType,
    specificItem: '',
    itemName: '',
    // New nested structure for article
    currentArticle: {
      title: '',
      purpose: null,
      content: [],
    },
    contentSource: 'existing',
    contentType: null,
    tags: [],
    // Deprecated fields (mirrored for backward compatibility)
    purpose: null,
    content: [],
  };
  return {
    ...state,
    currentItem: newItem,
    isDirty: true,
    session: {
      ...state.session,
      currentItem: newItem,
    },
  };
}
```

#### Acceptance Criteria
- [x] `SELECT_ROOM` creates `currentItem` with `currentArticle` nested object
- [x] `currentArticle` has `title: ''`, `purpose: null`, `content: []`
- [x] Deprecated fields `purpose` and `content` are also initialized (for backward compat)
- [x] TypeScript compiles without errors

**Implementation Notes (2026-01-12):**
- Updated `SELECT_ROOM` action to initialize `currentArticle` with empty title, null purpose, and empty content array
- Added deprecated fields `purpose: null` and `content: []` for backward compatibility
- Verified by unit tests in useWorkflowState.test.ts

---

### Task 3: Update `SELECT_PURPOSE` Action to Use `currentArticle.title`

**File:** `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`
**Location:** Lines 363-398
**Story Points:** 1

#### Current Code (Lines 363-398)
```typescript
case 'SELECT_PURPOSE': {
  if (!state.currentItem) return state;

  const purpose = action.payload;
  const articleTitle = generateArticleTitle({
    specificItem: state.currentItem.specificItem,
    purpose: purpose,
  });
  const autoTags = generateTags({
    room: state.currentItem.room,
    itemType: state.currentItem.itemType,
    purpose: purpose,
  });

  const updatedItem: CurrentItemState = {
    ...state.currentItem,
    purpose: purpose,                    // Updates flat structure
    itemName: articleTitle,              // WRONG: overwrites itemName
    tags: autoTags,
  };
  // ... rest
}
```

#### Target Code
```typescript
case 'SELECT_PURPOSE': {
  if (!state.currentItem) return state;

  const purpose = action.payload;

  // Generate article title (e.g., "How to Clean")
  const articleTitle = generateArticleTitle({
    specificItem: state.currentItem.specificItem,
    purpose: purpose,
  });

  // Auto-generate tags based on selections (REQ-177)
  const autoTags = generateTags({
    room: state.currentItem.room,
    itemType: state.currentItem.itemType,
    purpose: purpose,
  });

  const updatedItem: CurrentItemState = {
    ...state.currentItem,
    // Update nested currentArticle structure
    currentArticle: {
      ...state.currentItem.currentArticle,
      title: articleTitle,
      purpose: purpose,
    },
    // itemName stays as physical item name (NOT overwritten)
    tags: autoTags,
    // Mirror to deprecated fields for backward compatibility
    purpose: purpose,
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

#### Critical Behavioral Change
**BEFORE:** `itemName` was overwritten with article title like "How to Clean - Cabinets"
**AFTER:** `itemName` stays as physical item name; `currentArticle.title` holds article title

#### Acceptance Criteria
- [x] `SELECT_PURPOSE` updates `currentArticle.title` with generated article title
- [x] `SELECT_PURPOSE` updates `currentArticle.purpose` with the selected purpose
- [x] `itemName` is NOT overwritten by article title
- [x] Deprecated `purpose` field is still updated for backward compatibility
- [x] Tags are correctly generated and applied

**Implementation Notes (2026-01-12):**
- Updated `SELECT_PURPOSE` action to set `currentArticle.title` and `currentArticle.purpose`
- `itemName` now stays as physical item name (e.g., "Kitchen - Cabinets")
- `currentArticle.title` contains article title (e.g., "How to Clean - Cabinets")
- Verified by unit tests including "does NOT overwrite itemName with article title"

---

### Task 4: Update `SELECT_SPECIFIC_ITEM` to Preserve `currentArticle`

**File:** `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`
**Location:** Lines 309-327
**Story Points:** 0.5

#### Current Code (Lines 309-327)
```typescript
case 'SELECT_SPECIFIC_ITEM': {
  if (!state.currentItem) return state;
  const roomLabel = ROOM_LABELS[state.currentItem.room] || state.currentItem.room;
  const autoName = `${roomLabel} - ${action.payload}`;
  const updatedItem: CurrentItemState = {
    ...state.currentItem,
    specificItem: action.payload,
    itemName: autoName,
  };
  // ... rest
}
```

#### Changes Required
The spread operator `...state.currentItem` should preserve `currentArticle`. However, we should verify `itemName` is set to the ITEM name (e.g., "Kitchen - Cabinets"), not the article title.

**Current behavior is correct** - `itemName` is set to `${roomLabel} - ${specificItem}`, which represents the physical item's display name. No code changes needed, just verification.

#### Acceptance Criteria
- [x] Verify `SELECT_SPECIFIC_ITEM` sets `itemName` to item display name (e.g., "Kitchen - Cabinets")
- [x] Verify `currentArticle` is preserved via spread operator
- [x] Add test to confirm `currentArticle` is not lost

**Implementation Notes (2026-01-12):**
- `SELECT_SPECIFIC_ITEM` already uses spread operator `...state.currentItem` which preserves `currentArticle`
- No code changes needed - verified behavior is correct
- Unit tests confirm `itemName` is set correctly and `currentArticle` is preserved

---

### Task 5: Update `ADD_CONTENT_PIECE` to Use `currentArticle.content`

**File:** `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`
**Location:** Lines 438-460
**Story Points:** 1

#### Current Code (Lines 438-460)
```typescript
case 'ADD_CONTENT_PIECE': {
  if (!state.currentItem) return state;

  // Enforce maximum content pieces limit
  if (state.currentItem.content.length >= MAX_CONTENT_PIECES) {
    console.warn(`Cannot add content: maximum limit of ${MAX_CONTENT_PIECES} pieces reached`);
    return state;
  }

  const updatedItem: CurrentItemState = {
    ...state.currentItem,
    content: [...state.currentItem.content, action.payload],
  };
  // ... rest
}
```

#### Target Code
```typescript
case 'ADD_CONTENT_PIECE': {
  if (!state.currentItem) return state;

  const articleContent = state.currentItem.currentArticle?.content ?? [];

  // Enforce maximum content pieces limit
  if (articleContent.length >= MAX_CONTENT_PIECES) {
    console.warn(`Cannot add content: maximum limit of ${MAX_CONTENT_PIECES} pieces reached`);
    return state;
  }

  const newContent = [...articleContent, action.payload];

  const updatedItem: CurrentItemState = {
    ...state.currentItem,
    currentArticle: {
      ...state.currentItem.currentArticle,
      content: newContent,
    },
    // Mirror to deprecated field for backward compatibility
    content: newContent,
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

#### Acceptance Criteria
- [x] Content is added to `currentArticle.content` array
- [x] MAX_CONTENT_PIECES limit checks `currentArticle.content.length`
- [x] Deprecated `content` field is mirrored for backward compatibility
- [x] Existing tests pass after updating assertions

**Implementation Notes (2026-01-12):**
- Updated `ADD_CONTENT_PIECE` to add content to `currentArticle.content`
- Max content limit now checks `articleContent.length`
- Deprecated `content` field is mirrored for backward compatibility
- Updated unit tests to check `currentArticle.content`

---

### Task 6: Update `REMOVE_CONTENT_PIECE` to Use `currentArticle.content`

**File:** `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`
**Location:** Lines 462-477
**Story Points:** 0.5

#### Current Code (Lines 462-477)
```typescript
case 'REMOVE_CONTENT_PIECE': {
  if (!state.currentItem) return state;
  const updatedItem: CurrentItemState = {
    ...state.currentItem,
    content: state.currentItem.content.filter(c => c.id !== action.payload),
  };
  // ... rest
}
```

#### Target Code
```typescript
case 'REMOVE_CONTENT_PIECE': {
  if (!state.currentItem) return state;

  const articleContent = state.currentItem.currentArticle?.content ?? [];
  const filteredContent = articleContent.filter(c => c.id !== action.payload);

  const updatedItem: CurrentItemState = {
    ...state.currentItem,
    currentArticle: {
      ...state.currentItem.currentArticle,
      content: filteredContent,
    },
    // Mirror to deprecated field
    content: filteredContent,
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

#### Acceptance Criteria
- [x] Content removal filters `currentArticle.content` array
- [x] Deprecated `content` field is mirrored
- [x] Removal by ID works correctly

**Implementation Notes (2026-01-12):**
- Updated `REMOVE_CONTENT_PIECE` to filter from `currentArticle.content`
- Deprecated `content` field is mirrored
- Unit tests verify removal by ID works correctly

---

### Task 7: Update `REORDER_CONTENT` to Use `currentArticle.content`

**File:** `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`
**Location:** Lines 479-512
**Story Points:** 0.5

#### Current Code (Lines 479-512)
```typescript
case 'REORDER_CONTENT': {
  if (!state.currentItem) return state;
  const { fromIndex, toIndex } = action.payload;
  const content = [...state.currentItem.content];

  // Validate indices
  if (fromIndex < 0 || fromIndex >= content.length ||
      toIndex < 0 || toIndex >= content.length) {
    return state;
  }

  const [removed] = content.splice(fromIndex, 1);
  content.splice(toIndex, 0, removed);

  const reorderedContent = content.map((item, index) => ({
    ...item,
    order: index,
  }));

  const updatedItem: CurrentItemState = {
    ...state.currentItem,
    content: reorderedContent,
  };
  // ... rest
}
```

#### Target Code
```typescript
case 'REORDER_CONTENT': {
  if (!state.currentItem) return state;
  const { fromIndex, toIndex } = action.payload;
  const articleContent = [...(state.currentItem.currentArticle?.content ?? [])];

  // Validate indices
  if (fromIndex < 0 || fromIndex >= articleContent.length ||
      toIndex < 0 || toIndex >= articleContent.length) {
    return state;
  }

  const [removed] = articleContent.splice(fromIndex, 1);
  articleContent.splice(toIndex, 0, removed);

  // Update order property on each piece
  const reorderedContent = articleContent.map((item, index) => ({
    ...item,
    order: index,
  }));

  const updatedItem: CurrentItemState = {
    ...state.currentItem,
    currentArticle: {
      ...state.currentItem.currentArticle,
      content: reorderedContent,
    },
    // Mirror to deprecated field
    content: reorderedContent,
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

#### Acceptance Criteria
- [x] Reordering operates on `currentArticle.content` array
- [x] Order indices are validated against `currentArticle.content.length`
- [x] Order property updated on each piece
- [x] Deprecated `content` field is mirrored

**Implementation Notes (2026-01-12):**
- Updated `REORDER_CONTENT` to operate on `currentArticle.content`
- Index validation now checks `articleContent.length`
- Order property updated on each piece after reordering
- Deprecated `content` field is mirrored

---

### Task 8: Update `canGoNext` Computed Value

**File:** `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`
**Location:** Lines 902-929
**Story Points:** 0.5

#### Current Code (Partial - Lines 918-921)
```typescript
case 'media-capture':
  return (state.currentItem?.content?.length ?? 0) > 0;
case 'content-creation':
  return (state.currentItem?.content?.length ?? 0) > 0;
```

#### Target Code
```typescript
case 'media-capture':
  return (state.currentItem?.currentArticle?.content?.length ?? 0) > 0;
case 'content-creation':
  return (state.currentItem?.currentArticle?.content?.length ?? 0) > 0;
```

#### Acceptance Criteria
- [x] `canGoNext` checks `currentArticle.content.length` for media-capture step
- [x] `canGoNext` checks `currentArticle.content.length` for content-creation step
- [x] Navigation validation works correctly with new structure

**Implementation Notes (2026-01-12):**
- Updated `canGoNext` useMemo to check `currentArticle.content.length` for both media-capture and content-creation steps
- Navigation validation works correctly with new structure

---

### Task 9: Update Unit Tests for New State Structure

**File:** `src/components/ItemCreationWorkflow/hooks/__tests__/useWorkflowState.test.ts`
**Story Points:** 1

#### Test Cases to Add/Update

##### 9.1: Test `currentArticle` initialization in SELECT_ROOM
```typescript
describe('SELECT_ROOM action - currentArticle initialization', () => {
  it('initializes currentArticle with empty values', () => {
    const state = createInitialState();
    const newState = workflowReducer(state, { type: 'SELECT_ROOM', payload: 'kitchen' });

    expect(newState.currentItem?.currentArticle).toBeDefined();
    expect(newState.currentItem?.currentArticle.title).toBe('');
    expect(newState.currentItem?.currentArticle.purpose).toBeNull();
    expect(newState.currentItem?.currentArticle.content).toEqual([]);
  });

  it('initializes deprecated fields for backward compatibility', () => {
    const state = createInitialState();
    const newState = workflowReducer(state, { type: 'SELECT_ROOM', payload: 'kitchen' });

    expect(newState.currentItem?.purpose).toBeNull();
    expect(newState.currentItem?.content).toEqual([]);
  });
});
```

##### 9.2: Test `SELECT_PURPOSE` updates `currentArticle.title` (not `itemName`)
```typescript
describe('SELECT_PURPOSE action - currentArticle update', () => {
  it('updates currentArticle.title with article title, not itemName', () => {
    let state = createInitialState();
    state = workflowReducer(state, { type: 'SELECT_ROOM', payload: 'kitchen' });
    state = workflowReducer(state, { type: 'SELECT_ITEM_TYPE', payload: 'appliance' });
    state = workflowReducer(state, { type: 'SELECT_SPECIFIC_ITEM', payload: 'Cabinets' });

    const itemNameBefore = state.currentItem?.itemName;
    state = workflowReducer(state, { type: 'SELECT_PURPOSE', payload: 'how-to-clean' });

    // currentArticle.title should have article title
    expect(state.currentItem?.currentArticle.title).toContain('How to Clean');
    // itemName should NOT be changed to article title
    expect(state.currentItem?.itemName).toBe(itemNameBefore);
  });

  it('updates currentArticle.purpose', () => {
    let state = createInitialState();
    state = workflowReducer(state, { type: 'SELECT_ROOM', payload: 'kitchen' });
    state = workflowReducer(state, { type: 'SELECT_PURPOSE', payload: 'how-to-clean' });

    expect(state.currentItem?.currentArticle.purpose).toBe('how-to-clean');
    // Deprecated field also updated
    expect(state.currentItem?.purpose).toBe('how-to-clean');
  });
});
```

##### 9.3: Test content actions use `currentArticle.content`
```typescript
describe('Content actions - currentArticle.content', () => {
  const mockContentPiece: ContentPiece = {
    id: 'test-content-1',
    type: 'video',
    data: { type: 'video', file: new Blob() },
    order: 0,
  };

  it('ADD_CONTENT_PIECE adds to currentArticle.content', () => {
    let state = createInitialState();
    state = workflowReducer(state, { type: 'SELECT_ROOM', payload: 'kitchen' });
    state = workflowReducer(state, { type: 'ADD_CONTENT_PIECE', payload: mockContentPiece });

    expect(state.currentItem?.currentArticle.content).toHaveLength(1);
    expect(state.currentItem?.currentArticle.content[0].id).toBe('test-content-1');
    // Deprecated field also updated
    expect(state.currentItem?.content).toHaveLength(1);
  });

  it('REMOVE_CONTENT_PIECE removes from currentArticle.content', () => {
    let state = createInitialState();
    state = workflowReducer(state, { type: 'SELECT_ROOM', payload: 'kitchen' });
    state = workflowReducer(state, { type: 'ADD_CONTENT_PIECE', payload: mockContentPiece });
    state = workflowReducer(state, { type: 'REMOVE_CONTENT_PIECE', payload: 'test-content-1' });

    expect(state.currentItem?.currentArticle.content).toHaveLength(0);
    expect(state.currentItem?.content).toHaveLength(0);
  });

  it('REORDER_CONTENT reorders currentArticle.content', () => {
    const piece1 = { ...mockContentPiece, id: 'piece-1', order: 0 };
    const piece2 = { ...mockContentPiece, id: 'piece-2', order: 1 };

    let state = createInitialState();
    state = workflowReducer(state, { type: 'SELECT_ROOM', payload: 'kitchen' });
    state = workflowReducer(state, { type: 'ADD_CONTENT_PIECE', payload: piece1 });
    state = workflowReducer(state, { type: 'ADD_CONTENT_PIECE', payload: piece2 });
    state = workflowReducer(state, { type: 'REORDER_CONTENT', payload: { fromIndex: 0, toIndex: 1 } });

    expect(state.currentItem?.currentArticle.content[0].id).toBe('piece-2');
    expect(state.currentItem?.currentArticle.content[1].id).toBe('piece-1');
  });
});
```

##### 9.4: Test `canGoNext` checks `currentArticle.content`
```typescript
describe('canGoNext - currentArticle.content check', () => {
  it('media-capture step requires currentArticle.content.length > 0', () => {
    // This test should use the useWorkflowState hook
    // Verify canGoNext is false when currentArticle.content is empty
    // Verify canGoNext is true when currentArticle.content has items
  });
});
```

#### Acceptance Criteria
- [x] New test cases added for `currentArticle` initialization
- [x] Test cases verify `itemName` is NOT overwritten by article title
- [x] Test cases verify content actions use `currentArticle.content`
- [x] Test cases verify deprecated fields are mirrored
- [x] All existing tests pass (update assertions as needed)
- [x] Test coverage maintained or improved

**Implementation Notes (2026-01-12):**
- Added 4 new test cases for `currentArticle` initialization
- Added "does NOT overwrite itemName with article title" test
- Updated content tests to check `currentArticle.content` instead of flat `content`
- Updated full flow integration tests to verify separation
- All 101 tests pass

---

### Task 10: Run Tests and Verify TypeScript Compilation

**Story Points:** 0.5

#### Commands to Execute
```bash
# TypeScript compilation check
npm run type-check

# Run unit tests for useWorkflowState
npm test -- src/components/ItemCreationWorkflow/hooks/__tests__/useWorkflowState.test.ts

# Run all workflow-related tests
npm test -- src/components/ItemCreationWorkflow/
```

#### Acceptance Criteria
- [x] TypeScript compiles with no errors
- [x] All unit tests pass
- [x] No console warnings related to state structure
- [x] Build completes successfully

**Implementation Notes (2026-01-12):**
- TypeScript compiles without errors for modified files
- All 101 unit tests pass
- Build completes with pre-existing warnings (Supabase Edge Runtime) - not related to REQ-209 changes
- No new console warnings

---

## Verification Checklist

### Functional Verification
- [x] `SELECT_ROOM` creates `currentItem` with `currentArticle` object
- [x] `SELECT_PURPOSE` updates `currentArticle.title` (not `itemName`)
- [x] `itemName` remains the physical item name throughout workflow
- [x] Content actions (add/remove/reorder) modify `currentArticle.content`
- [x] Deprecated fields are mirrored for backward compatibility
- [x] `canGoNext` correctly checks `currentArticle.content.length`

### Backward Compatibility
- [x] Deprecated `purpose` field mirrors `currentArticle.purpose`
- [x] Deprecated `content` field mirrors `currentArticle.content`
- [x] Existing components continue to work (they can use either field)

### Test Coverage
- [x] New test cases for `currentArticle` initialization
- [x] New test cases for `SELECT_PURPOSE` behavior change
- [x] New test cases for content actions with new structure
- [x] All existing tests pass (updated assertions)

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Breaking existing components | Keep deprecated fields mirrored; gradual migration |
| Test failures | Update test assertions to match new structure |
| Runtime errors from undefined | Safe access with `?.` and `?? []` operators |
| TypeScript errors | Interface already updated; implementation follows |

---

## Post-Implementation Notes

After this task is complete:
1. **Task 5.3 (REQ-210)** can update `PreviewSaveStep` to read `currentArticle.title` for display
2. **Task 5.4 (REQ-211)** can update QR code generation to use `itemName` (physical item name)
3. **Future cleanup** can remove deprecated fields once all consumers are migrated

---

## References

- **Overview Document:** `docs/REQ-209-update-currentitemstate-overview.md`
- **Implementation Plan:** `docs/prd/Plan-109-FAQBNB-Review-2026-01-11b-Complete-Implementation.md` (Phase 5)
- **Types File:** `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts`
- **Hook File:** `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`
- **Test File:** `src/components/ItemCreationWorkflow/hooks/__tests__/useWorkflowState.test.ts`
