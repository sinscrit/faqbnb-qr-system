# Implementation Overview: REQ-208 - Update Type Definitions to Separate Item from Article

**Created:** 2026-01-12 21:30:00 UTC
**Last Modified:** 2026-01-12 21:30:00 UTC
**Request ID:** REQ-208
**Implementation Plan Reference:** Plan-109-FAQBNB-Review-2026-01-11b-Complete-Implementation.md
**Phase:** 5 - Fix Data Model - Separate Item from Article (ITEM-02)
**Task ID:** 5.1
**Priority:** CRITICAL

---

## Summary

This task updates the type definitions in `ItemCreationWorkflow.types.ts` to establish a clear separation between physical Items and their associated Article/Instruction content. The goal is to create a one-to-many relationship where each Item can have multiple Articles with different purposes (how-to-clean, how-to-use, troubleshooting, etc.).

---

## Current State Analysis

### Current Type Structure (`ItemCreationWorkflow.types.ts:160-217`)

The current `SessionItem` interface conflates the physical item with its content:

```typescript
export interface SessionItem {
  id: string;
  name: string;           // Currently stores "How to Clean - Cabinets" (mixed)
  room: RoomType;
  itemType: ItemType;
  content: ContentPiece[]; // Content directly on item
  createdAt: Date;
  qrCodeUrl?: string;
  tags?: string[];
}
```

The `CurrentItemState` interface (lines 160-187) also mixes item properties with content:

```typescript
export interface CurrentItemState {
  room: RoomType;
  itemType: ItemType;
  specificItem: string;     // Physical item name
  itemName: string;         // Display name (purpose + item)
  purpose: PurposeType | null;  // Purpose for content
  contentSource: 'existing' | 'create-new';
  contentType: ContentType | null;
  content: ContentPiece[];
  tags: string[];
}
```

### Problems with Current Approach

1. **Conflated Identity:** Item name includes purpose ("How to Clean - Cabinets") instead of just the physical item ("Cabinets")
2. **QR Code Label:** QR codes display the mixed name instead of just the item name
3. **No Multi-Article Support:** Cannot create multiple article types for one physical item
4. **Content Coupling:** Content pieces are directly on the item, not organized by article

---

## Target State

### New Article Interface

Add a new `Article` interface that represents instructional content:

```typescript
/**
 * An Article/Instruction associated with an Item.
 * Multiple articles can exist per item.
 */
export interface Article {
  /** Unique article identifier */
  id: string;
  /** Article title (equals purpose label, e.g., "How to Clean") */
  title: string;
  /** Purpose type that determines the article title */
  purpose: PurposeType;
  /** Content pieces for this article */
  content: ContentPiece[];
  /** When the article was created */
  createdAt: Date;
}
```

### Updated SessionItem Interface

Modify `SessionItem` to properly separate physical item from content:

```typescript
/**
 * A physical Item that gets ONE QR code.
 * Updated to separate item name from article content.
 */
export interface SessionItem {
  /** Unique item identifier (UUID) */
  id: string;
  /** Physical item name (e.g., "Cabinets", "Fridge") - appears on QR code */
  name: string;
  /** Room where the item is located */
  room: RoomType;
  /** Item type category */
  itemType: ItemType;
  /** When the item was created */
  createdAt: Date;
  /** Generated QR code URL (populated after save) */
  qrCodeUrl?: string;
  /** Tags for categorization */
  tags?: string[];
  /** Articles/instructions for this item */
  articles?: Article[];

  // Legacy field - kept for compatibility
  /** @deprecated Use articles[].content instead */
  content?: ContentPiece[];
}
```

### Updated CurrentItemState Interface

Restructure to clearly separate item properties from current article being created:

```typescript
export interface CurrentItemState {
  /** Selected room */
  room: RoomType;
  /** Selected item type */
  itemType: ItemType;
  /** Physical item name only (e.g., "Cabinets") */
  specificItem: string;
  /** Physical item name - equals specificItem, shown on QR code */
  itemName: string;
  /** Current article being created */
  currentArticle: {
    /** Article title derived from purpose (e.g., "How to Clean") */
    title: string;
    /** Purpose selection */
    purpose: PurposeType | null;
    /** Content pieces for this article */
    content: ContentPiece[];
  };
  /** Content source for current article */
  contentSource: 'existing' | 'create-new';
  /** Selected content type for current piece */
  contentType: ContentType | null;
  /** Tags for the item */
  tags: string[];

  // Legacy fields - kept for compatibility
  /** @deprecated Use currentArticle.purpose */
  purpose?: PurposeType | null;
  /** @deprecated Use currentArticle.content */
  content?: ContentPiece[];
}
```

---

## Implementation Steps

### Step 1: Add Article Interface
**File:** `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts`
**Location:** After line 111 (after PurposeType definition)

Add the new `Article` interface with proper JSDoc documentation. Place it in a new section called "Article Types".

### Step 2: Update SessionItem Interface
**File:** `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts`
**Location:** Lines 193-217

- Add optional `articles?: Article[]` field
- Mark existing `content?: ContentPiece[]` as `@deprecated`
- Update JSDoc comment to clarify this is a physical item

### Step 3: Update CurrentItemState Interface
**File:** `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts`
**Location:** Lines 160-187

- Add `currentArticle` nested object with title, purpose, content
- Keep `purpose` and `content` as deprecated optional fields for backward compatibility
- Update JSDoc to clarify `itemName` equals `specificItem` and appears on QR code

### Step 4: Export Article Type
**File:** `src/components/ItemCreationWorkflow/index.ts`

Add `Article` to the type exports.

### Step 5: Update Type Re-exports (if needed)
**File:** `src/types/index.ts`

Check if `SessionItem` or `CurrentItemState` are re-exported and update accordingly.

---

## Authorized Files and Functions for Modification

### Primary Files

| File | Lines | Modification Type |
|------|-------|-------------------|
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` | 111-217 | Add Article interface, modify SessionItem and CurrentItemState |
| `src/components/ItemCreationWorkflow/index.ts` | Exports section | Add Article type export |

### Secondary Files (Read-only verification)

| File | Purpose |
|------|---------|
| `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts` | Verify impact on state management |
| `src/components/ItemCreationWorkflow/hooks/useSessionQRGeneration.ts` | Verify QR generation uses item.name |
| `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx` | UI displays (separate task 5.3) |
| `src/app/dashboard2/create/page.tsx` | Item save handler (separate task 5.4) |

---

## Dependencies

### Depends On (upstream)

- **None for type definitions only**
  This task modifies type definitions which are the foundation for other changes. It does not depend on any other Phase 5 tasks.

### Blocks (downstream)

- **Task 5.2 (Update CurrentItemState):** Cannot begin until Article interface exists
- **Task 5.3 (Update PreviewSaveStep display):** Needs updated types to reference Article.title vs SessionItem.name
- **Task 5.4 (Update QR code generation):** Needs SessionItem.name to be the physical item name

### Parallel Safety

**Files touched by this task:**
- `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts`
- `src/components/ItemCreationWorkflow/index.ts`

**Conflicts with:**
- **Task 5.2:** Also modifies `ItemCreationWorkflow.types.ts` (CurrentItemState section)
- Must complete Task 5.1 before 5.2 to avoid merge conflicts

**Safe to parallelize with:**
- **Phase 1 (ITEM-05):** Modifies `constants.ts`, not types
- **Phase 2 (ITEM-03):** Modifies `NextActionStep.tsx`, not types
- **Phase 3 (ITEM-01):** Modifies `StatisticsCards.tsx`, not types
- **Phase 4 (ITEM-04):** Modifies `layout.tsx`, not types

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking existing code referencing `SessionItem.content` | High | High | Keep `content` field as deprecated for compatibility |
| Type errors in tests | Medium | Medium | Update test mock factories after type changes |
| Breaking state management in `useWorkflowState` | Low | High | Deprecation approach maintains backward compatibility |

---

## Testing Requirements

### Unit Tests to Verify

- `src/components/ItemCreationWorkflow/__tests__/helpers/mockFactories.ts` - Update mock item factories
- Type compilation check - Ensure no TypeScript errors after changes

### No New Tests Required

This task is type-only. Behavioral testing is covered by downstream tasks (5.3, 5.4).

---

## Acceptance Criteria (from REQ-208)

- [ ] Article interface includes id, title, purpose, content array, and createdAt timestamp
- [ ] Article purpose field uses PurposeType enum that drives the article title
- [ ] SessionItem interface includes physical item attributes: id, name, room, itemType, createdAt
- [ ] SessionItem interface includes an optional articles array containing Article objects
- [ ] SessionItem retains a deprecated content field marked with @deprecated JSDoc for compatibility
- [ ] QR code URL field remains on SessionItem as an optional property
- [ ] Tags remain on SessionItem as optional property for item categorization
- [ ] Type definitions include proper JSDoc comments explaining the purpose and usage of each field
- [ ] The one-to-many relationship between Item and Article is clear from the type structure
- [ ] All date fields use Date type consistently across both interfaces

---

## References

- **Source PRD:** `docs/prd/intake/prd-CPL-FAQBNB-Review-2026-01-11b-20260112-132632.md`
- **Implementation Plan:** `docs/prd/Plan-109-FAQBNB-Review-2026-01-11b-Complete-Implementation.md` (Phase 5)
- **Request Details:** `docs/gen_requests.md` (REQ-208)
- **Current Types:** `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts`
