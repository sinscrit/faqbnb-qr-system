# REQ-211: Update QR Code Generation to Encode Item IDs

**Created**: 2026-01-12 21:45 UTC
**Last Modified**: 2026-01-12 21:45 UTC
**Type**: ENHANCEMENT
**Size**: M
**Priority**: CRITICAL
**Phase**: 5 - Fix Data Model - Separate Item from Article (ITEM-02)
**Task ID**: 5.4

---

## Executive Summary

This task ensures QR code generation encodes Item IDs that link to the physical item's landing page, rather than encoding direct links to individual article content. This is a key part of the data model separation between Items (physical objects) and Articles (instructional content).

---

## Background

### Request Summary
QR code generation should encode Item IDs that link to the physical item's landing page, which then displays all associated articles, rather than encoding direct links to individual article content.

### Current Behavior
The current QR code generation system works correctly in terms of URL structure - it generates URLs in the format `/item/{publicId}`. However, the system conflates Item and Article concepts at various layers:

1. **In `create/page.tsx` (handleSaveItem)**: The QR code is generated using the item's `publicId`, but the `itemName` used throughout the flow may include article-related content (e.g., "How to Clean - Cabinets" instead of just "Cabinets")

2. **In `useSessionQRGeneration.ts`**: The hook correctly maps `item.id` and `item.name`, but upstream state may have article content mixed into item identity

3. **In `useQRCodeGeneration.ts`**: Uses `item.public_id` for URL generation (`/item/${item.public_id}`), which is correct

4. **In `qrcode-utils.ts` and `config.ts`**: URL building via `buildQRUrl(publicId)` correctly produces `/item/{publicId}` format

### Expected Behavior
1. QR codes encode URLs based purely on Item ID (physical object identity)
2. The URL format remains `/item/{itemId}` or `/items/{itemId}`
3. Item name displayed on QR labels shows only the physical item name (e.g., "Cabinets"), not article titles
4. The QR generation process receives clean item metadata separate from article metadata
5. Storage of QR code URL remains with the Item record, not Article records

---

## Technical Investigation

### QR Code Generation Flow Analysis

```
User completes PreviewSaveStep
        ↓
handleSave() in PreviewSaveStep.tsx calls onSave prop
        ↓
onSave is handleSaveItem() in create/page.tsx
        ↓
handleSaveItem:
  1. Generates publicId via generateUUID()
  2. Calls adminApi.createItem(itemData)
  3. Builds itemUrl: `${window.location.origin}/items/${publicId}`
  4. Calls generateQRCode(itemUrl) from qrcode-utils.ts
  5. Returns { id: publicId, qrCodeUrl: qrCodeDataUrl }
        ↓
PreviewSaveStep receives result, shows in SuccessOverlay
        ↓
SuccessOverlay displays:
  - qrCodeUrl (image)
  - itemName (label) ← This may contain article info
```

### Files Currently Involved in QR Generation

| File | Role | Current State |
|------|------|---------------|
| `src/app/dashboard2/create/page.tsx` | Entry point for save + QR generation | Uses `item.name` which may contain article info |
| `src/lib/qrcode-utils.ts` | Core QR code generation utilities | URL structure is correct |
| `src/lib/config.ts` | Domain configuration + `buildQRUrl()` | Uses `/item/{publicId}` - correct |
| `src/hooks/useQRCodeGeneration.ts` | React hook for batch QR generation | Uses `item.public_id` - correct |
| `src/components/ItemCreationWorkflow/hooks/useSessionQRGeneration.ts` | Session-specific QR wrapper | Passes item data correctly |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` | Type definitions | Needs Item vs Article separation |
| `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx` | UI showing QR result | Displays `itemName` which may be conflated |

### Key Findings

1. **URL Structure is Correct**: The QR URL format `/item/{publicId}` already links to item landing pages

2. **Label Display is Conflated**: The `itemName` field in `CurrentItemState` combines item name with purpose, leading to QR labels like "How to Clean - Cabinets" instead of "Cabinets"

3. **Data Flow Gap**: When `handleSaveItem` is called, it receives a `SessionItem` with a `name` field that may already contain the conflated "purpose + item" value

4. **Type Definitions Need Update**: `SessionItem.name` should be the physical item name only; article title should be separate

---

## Scope of Changes

### What This Task Covers (Task 5.4)
1. Verify QR URL generation uses Item ID (already correct)
2. Ensure QR code label displays item name only (not article title)
3. Update data flow to separate item name from article title in QR context
4. Add JSDoc documentation clarifying QR codes represent Items, not Articles

### What This Task Does NOT Cover
- Database schema changes (covered in broader ITEM-02 scope)
- Full type definition restructuring (Task 5.1)
- PreviewSaveStep field label updates (Task 5.3)
- `CurrentItemState` refactoring (Task 5.2)

---

## Implementation Tasks

### Task 5.4.1: Verify QR URL Format Uses Item ID

**File**: `src/app/dashboard2/create/page.tsx`
**Lines**: 162-171

**Verification**:
- Current implementation at line 166: `const itemUrl = \`${window.location.origin}/items/${publicId}\`;`
- This correctly uses `publicId` which represents the Item ID
- **Status**: ✅ Already correct - no changes needed

### Task 5.4.2: Update handleSaveItem to Separate Item Name

**File**: `src/app/dashboard2/create/page.tsx`
**Lines**: 45-181 (handleSaveItem function)

**Current Issue**:
```typescript
const itemData = {
  publicId,
  name: item.name,  // May contain "How to Clean - Cabinets"
  // ...
};
```

**Required Changes**:
1. Extract clean item name (physical object only) for:
   - Database storage
   - QR code label return value
2. Pass article information separately

**Implementation**:
```typescript
// Extract clean item name (specificItem without purpose prefix)
const cleanItemName = item.specificItem || item.name.replace(/^(How to .+? - )/, '');

const itemData = {
  publicId,
  name: cleanItemName,  // Physical item name only
  // ...
};

// Return clean item name for QR label
return {
  id: publicId,
  qrCodeUrl: qrCodeDataUrl,
  itemName: cleanItemName,  // NEW: separate from item.name
};
```

### Task 5.4.3: Update Return Type for onSaveItem

**File**: `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts`
**Lines**: 58 (onSaveItem prop type)

**Current**:
```typescript
onSaveItem: (item: SessionItem) => Promise<{ id: string; qrCodeUrl: string }>;
```

**Updated**:
```typescript
/**
 * Called to persist a new item to database.
 * Returns the saved item's ID and QR code data.
 * Note: itemName in return should be the physical item name only (not article title).
 */
onSaveItem: (item: SessionItem) => Promise<{
  id: string;
  qrCodeUrl: string;
  /** Physical item name for QR label display (optional, falls back to input item.name) */
  itemName?: string;
}>;
```

### Task 5.4.4: Update PreviewSaveStep to Use Clean Item Name

**File**: `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx`
**Lines**: 551-567 (handleSave function)

**Current**:
```typescript
const handleSave = useCallback(async () => {
  const itemNameToSave = currentItem?.itemName || 'Item';
  // ...
  setSavedResult({
    ...result,
    itemName: itemNameToSave  // Uses potentially conflated name
  });
}, [onSave, currentItem?.itemName]);
```

**Updated**:
```typescript
const handleSave = useCallback(async () => {
  // Prefer clean item name from save result, fall back to specificItem (physical item)
  const fallbackItemName = currentItem?.specificItem || currentItem?.itemName || 'Item';
  setSaveError(null);
  try {
    const result = await onSave();
    setSavedResult({
      ...result,
      // Use itemName from result if provided (clean item name), otherwise fallback
      itemName: result.itemName || fallbackItemName
    });
    setShowSuccess(true);
  } catch (error) {
    setSaveError(error instanceof Error ? error.message : 'Failed to save item');
  }
}, [onSave, currentItem?.specificItem, currentItem?.itemName]);
```

### Task 5.4.5: Update SuccessOverlay Label

**File**: `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx`
**Lines**: 382-424 (SuccessOverlay component)

**Current**: Displays `{itemName}` under QR code

**Update**: Add JSDoc/comment clarifying this should be physical item name:
```typescript
/**
 * SuccessOverlay Sub-Component
 *
 * Shows the success state after saving an item with the generated QR code.
 * The itemName displayed is the physical item name (not article title) since
 * QR codes represent physical items, not individual articles.
 */
interface SuccessOverlayProps {
  /** Physical item name to display as QR label */
  itemName: string;
  /** Generated QR code data URL */
  qrCodeUrl: string;
  onContinue: () => void;
}
```

### Task 5.4.6: Add Documentation to useSessionQRGeneration

**File**: `src/components/ItemCreationWorkflow/hooks/useSessionQRGeneration.ts`
**Lines**: 1-44 (module documentation)

**Add clarification**:
```typescript
/**
 * useSessionQRGeneration - QR code generation for session items
 *
 * Generates QR codes for Items created in the current session.
 *
 * IMPORTANT: QR codes represent physical Items, not Articles.
 * - Each physical Item gets exactly ONE QR code
 * - The QR URL points to the Item landing page: /item/{itemId}
 * - Multiple Articles can exist per Item; they share the same QR code
 * - QR labels should show the physical item name (e.g., "Cabinets")
 *   not the article title (e.g., "How to Clean")
 *
 * @example Generating QR codes for session
 * // ...existing example...
 */
```

### Task 5.4.7: Verify buildQRUrl Uses Correct Path

**File**: `src/lib/config.ts`
**Lines**: 56-60

**Verification**:
```typescript
export function buildQRUrl(publicId: string): string {
  const domain = getQRDomain();
  return `${domain}/item/${publicId}`;  // ✅ Uses /item/{id} - correct
}
```

**Action**: Add JSDoc documentation:
```typescript
/**
 * Build QR code URL for a physical Item
 *
 * QR codes link to Item landing pages, which display all associated Articles.
 * This ensures QR codes remain stable when Articles are added/modified.
 *
 * @param publicId - The Item's public ID (NOT Article ID)
 * @returns Full URL for the QR code (e.g., https://domain.com/item/abc123)
 */
export function buildQRUrl(publicId: string): string {
  const domain = getQRDomain();
  return `${domain}/item/${publicId}`;
}
```

---

## Authorized Files and Functions for Modification

### Files Authorized for Modification

| File Path | Authorized Modifications |
|-----------|-------------------------|
| `src/app/dashboard2/create/page.tsx` | Update `handleSaveItem` to extract clean item name for QR label |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` | Update `onSaveItem` return type to include optional `itemName` |
| `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx` | Update `handleSave` and `SuccessOverlay` to use clean item name |
| `src/components/ItemCreationWorkflow/hooks/useSessionQRGeneration.ts` | Add documentation clarifying Item vs Article QR semantics |
| `src/lib/config.ts` | Add JSDoc to `buildQRUrl` clarifying Item ID usage |

### Functions Authorized for Modification

| Function | File | Modification Type |
|----------|------|-------------------|
| `handleSaveItem` | `create/page.tsx` | Logic change - extract clean item name |
| `handleSave` | `PreviewSaveStep.tsx` | Logic change - prefer result.itemName |
| `SuccessOverlay` | `PreviewSaveStep.tsx` | Documentation only |
| `buildQRUrl` | `config.ts` | Documentation only |
| `useSessionQRGeneration` | `useSessionQRGeneration.ts` | Documentation only |

### Files Authorized for Read-Only Reference

| File Path | Reference Purpose |
|-----------|-------------------|
| `src/lib/qrcode-utils.ts` | Verify QR generation does not embed article info |
| `src/hooks/useQRCodeGeneration.ts` | Verify hook uses item.public_id correctly |
| `src/components/ItemCreationWorkflow/utils/constants.ts` | Reference for label constants |

---

## Dependencies

### Depends On (upstream)
- **Task 5.1** (Update type definitions): The `onSaveItem` return type change in this task is a minor additive change that can proceed independently, but full type restructuring in 5.1 provides cleaner separation
- **Task 5.2** (Update CurrentItemState): This task's access to `currentItem.specificItem` depends on 5.2 ensuring this field is properly populated

### Blocks (downstream)
- None directly - this task's changes are additive and backward compatible

### Parallel Safety
- **Files touched by this task**:
  - `src/app/dashboard2/create/page.tsx` - `handleSaveItem` function only
  - `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` - additive change to return type
  - `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx` - `handleSave` and `SuccessOverlay`
  - `src/components/ItemCreationWorkflow/hooks/useSessionQRGeneration.ts` - documentation only
  - `src/lib/config.ts` - documentation only

- **Conflicts with**:
  - **Task 5.1** (Update type definitions) - both modify `ItemCreationWorkflow.types.ts`
  - **Task 5.3** (Update PreviewSaveStep display) - both modify `PreviewSaveStep.tsx`

- **Safe to parallelize with**:
  - **Phase 1** (ITEM-05) tasks - different files (constants.ts, WorkflowHeader.tsx)
  - **Phase 2** (ITEM-03) tasks - different files (NextActionStep.tsx)
  - **Phase 3** (ITEM-01) tasks - different files (StatisticsCards.tsx)
  - **Phase 4** (ITEM-04) tasks - different files (layout.tsx)

### Recommended Execution Order
Execute within Phase 5 after Tasks 5.1 and 5.2, or coordinate carefully if parallel:
1. Task 5.1 (type definitions) - establishes foundation
2. Task 5.2 (CurrentItemState) - ensures specificItem is available
3. **Task 5.4 (this task)** - uses the clean item name
4. Task 5.3 (PreviewSaveStep display) - can share PreviewSaveStep changes

---

## Testing Requirements

### Unit Tests to Update
- `src/components/ItemCreationWorkflow/components/steps/__tests__/PreviewSaveStep.test.tsx`
  - Test that SuccessOverlay displays clean item name
  - Test that handleSave prefers result.itemName over currentItem.itemName

### New Test Cases
1. **QR label shows item name only**: Verify QR code label displays "Cabinets" not "How to Clean - Cabinets"
2. **handleSaveItem returns clean name**: Verify `result.itemName` contains physical item name
3. **Fallback behavior**: Verify fallback to `specificItem` when `result.itemName` not provided

### Manual Verification
1. Create an item via workflow with purpose "How to Clean" and item "Cabinets"
2. After save, verify QR code label shows "Cabinets" (not "How to Clean - Cabinets")
3. Verify the generated QR URL is `/items/{id}` format
4. Scan QR code and verify it routes to item landing page

---

## Acceptance Criteria

From REQ-211:
- [x] QR code generation utilities accept Item ID as the primary identifier for encoding (already implemented)
- [x] Generated QR code URLs follow a consistent format that routes to item landing pages (already `/item/{id}`)
- [ ] The useSessionQRGeneration hook uses Item IDs when creating QR codes (verify + document)
- [ ] QR code URLs stored in the database are associated with Item records, not Article records (handled in save)
- [x] QR code generation logic does not reference Article IDs in URL construction (already correct)
- [x] Generated QR codes produce scannable URLs that resolve correctly to item landing pages (already correct)
- [ ] The QR code generation process maintains compatibility with existing print workflows (verify)
- [ ] Documentation clearly explains that QR codes represent physical items, not individual articles (add docs)
- [ ] All QR code generation occurs after the Item ID is known or can be deterministically generated (already correct)

**Additional criteria for this task**:
- [ ] QR code label in SuccessOverlay shows physical item name only
- [ ] `handleSaveItem` returns clean item name in result
- [ ] PreviewSaveStep uses result.itemName for display when available

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking existing save flow | Low | High | Changes are additive; existing behavior preserved as fallback |
| Incorrect name extraction | Medium | Medium | Use `specificItem` which is always the physical item name |
| Test failures | Medium | Low | Update affected tests as part of implementation |

---

## References

- **Source Request**: `docs/gen_requests.md` - REQ-211
- **Implementation Plan**: `docs/prd/Plan-109-FAQBNB-Review-2026-01-11b-Complete-Implementation.md`
- **Related Tasks**:
  - Task 5.1: Update type definitions
  - Task 5.2: Update CurrentItemState
  - Task 5.3: Update PreviewSaveStep display
- **Route Verification**: `/dashboard2/create` → `create/page.tsx` → `ItemCreationWorkflow`
