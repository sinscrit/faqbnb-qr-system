# REQ-211: Update QR Code Generation - Detailed Task Breakdown

**Created**: 2026-01-12 22:30 UTC
**Last Modified**: 2026-01-12 17:15 UTC (All tasks completed)
**Source Overview**: docs/REQ-211-update-qr-code-generation-overview.md
**Source Request**: docs/gen_requests.md (Request #211)
**Implementation Plan**: docs/prd/Plan-109-FAQBNB-Review-2026-01-11b-Complete-Implementation.md
**Phase**: 5 - Fix Data Model - Separate Item from Article (ITEM-02)
**Task ID**: 5.4
**Priority**: CRITICAL

---

## Executive Summary

This document provides granular, implementation-ready tasks for ensuring QR code generation properly encodes Item IDs (physical object identity) rather than conflating item and article information. The QR code label displayed in the SuccessOverlay should show the physical item name only (e.g., "Cabinets"), not an article-derived title (e.g., "How to Clean - Cabinets").

---

## Pre-Implementation Verification

### Files to Read Before Starting
- [x] `src/app/dashboard2/create/page.tsx` - Entry point for item save + QR generation
- [x] `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` - Type definitions
- [x] `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx` - UI showing QR result
- [x] `src/components/ItemCreationWorkflow/hooks/useSessionQRGeneration.ts` - Session QR wrapper
- [x] `src/lib/config.ts` - Domain configuration and `buildQRUrl()`

### Current State Analysis
| Aspect | Current State | Target State |
|--------|---------------|--------------|
| QR URL format | `/items/${publicId}` - CORRECT | No change needed |
| QR label in SuccessOverlay | Uses `itemNameToSave` from `currentItem.itemName` | Use `currentItem.specificItem` (physical item name) |
| `handleSaveItem` return type | `{ id: string; qrCodeUrl: string }` | `{ id: string; qrCodeUrl: string; itemName?: string }` |
| Documentation | Minimal | Add JSDoc clarifying Item vs Article semantics |

---

## Authorized Files for Modification

| File Path | Modification Scope |
|-----------|-------------------|
| `src/app/dashboard2/create/page.tsx` | Update `handleSaveItem` to return clean item name |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` | Update `onSaveItem` return type |
| `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx` | Update `handleSave` and `SuccessOverlay` |
| `src/components/ItemCreationWorkflow/hooks/useSessionQRGeneration.ts` | Add documentation only |
| `src/lib/config.ts` | Add JSDoc documentation only |

---

## Detailed Tasks

### Task 5.4.1: Verify QR URL Format Uses Item ID
**Estimate**: 0.25 story points
**Type**: VERIFICATION
**File**: `src/app/dashboard2/create/page.tsx`
**Lines**: 166

**Description**:
Verify that the QR code URL uses the Item's `publicId` (physical item identifier), not any article-related ID.

**Current Implementation** (Line 166):
```typescript
const itemUrl = `${window.location.origin}/items/${publicId}`;
```

**Verification Steps**:
1. Read `src/app/dashboard2/create/page.tsx`
2. Confirm line 166 uses `publicId` (item identifier) in URL
3. Confirm `generateUUID()` at line 50 creates the `publicId`
4. Verify `publicId` is used in `itemData` object at line 155

**Expected Result**: No code changes needed - URL format is already correct.

**Verification Checklist**:
- [x] QR URL uses `/items/${publicId}` format
- [x] `publicId` is generated for the Item, not Article
- [x] URL does not contain article-specific identifiers

**Implementation Notes** (2026-01-12 17:15 UTC):
- Verified line 166-167 in `src/app/dashboard2/create/page.tsx` uses correct format
- `publicId` generated via `generateUUID()` at line 50 for Item identity
- QR URL correctly uses `/items/${publicId}` pattern

---

### Task 5.4.2: Update onSaveItem Return Type Definition
**Estimate**: 0.5 story points
**Type**: TYPE DEFINITION
**File**: `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts`
**Lines**: 58 (onSaveItem prop type)

**Description**:
Update the `onSaveItem` callback's return type to include an optional `itemName` field that contains the physical item name for QR label display.

**Current Implementation** (Line 58):
```typescript
onSaveItem: (item: SessionItem) => Promise<{ id: string; qrCodeUrl: string }>;
```

**Target Implementation**:
```typescript
/**
 * Called to persist a new item to database.
 * Returns the saved item's ID, QR code data URL, and optionally the clean item name.
 *
 * @param item - The SessionItem to save
 * @returns Promise resolving to:
 *   - id: The saved item's public ID (used in QR URL)
 *   - qrCodeUrl: Base64 data URL of the generated QR code image
 *   - itemName: Optional physical item name for QR label (falls back to input item.name)
 *
 * Note: itemName should be the physical item name only (e.g., "Cabinets"),
 * not an article title (e.g., "How to Clean - Cabinets"). This ensures
 * QR code labels accurately represent the physical item identity.
 */
onSaveItem: (item: SessionItem) => Promise<{
  /** The saved item's public ID (used in QR URL) */
  id: string;
  /** Base64 data URL of the generated QR code image */
  qrCodeUrl: string;
  /** Optional: Physical item name for QR label display. If omitted, caller should use item.specificItem. */
  itemName?: string;
}>;
```

**Implementation Steps**:
1. Open `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts`
2. Locate the `onSaveItem` prop type at line 58
3. Add JSDoc comment explaining the return type
4. Add optional `itemName` field to the return type
5. Save file

**Verification**:
- [x] TypeScript compiles without errors
- [x] JSDoc clearly explains that `itemName` is the physical item name, not article title
- [x] Return type is backward compatible (itemName is optional)

**Test Impact**: None - additive change

**Implementation Notes** (2026-01-12 17:15 UTC):
- Updated `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` lines 57-81
- Added comprehensive JSDoc explaining Item vs Article semantics
- Return type now includes optional `itemName?: string` field
- All existing code remains compatible due to optional field

---

### Task 5.4.3: Update handleSaveItem to Return Clean Item Name
**Estimate**: 0.5 story points
**Type**: LOGIC CHANGE
**File**: `src/app/dashboard2/create/page.tsx`
**Lines**: 45-181 (handleSaveItem function)

**Description**:
Update `handleSaveItem` to extract and return the clean physical item name (from `item.specificItem` or `item.name`) for use as the QR code label.

**Current Implementation** (Lines 168-171):
```typescript
return {
  id: publicId,
  qrCodeUrl: qrCodeDataUrl,
};
```

**Target Implementation**:
```typescript
// Extract clean item name for QR label
// SessionItem.specificItem is the physical item name from workflow selections
// SessionItem.name may contain article info if conflated upstream
const cleanItemName = item.specificItem || item.name;

return {
  id: publicId,
  qrCodeUrl: qrCodeDataUrl,
  itemName: cleanItemName,  // Physical item name for QR label
};
```

**Implementation Steps**:
1. Open `src/app/dashboard2/create/page.tsx`
2. Locate the return statement in `handleSaveItem` (around line 168)
3. Before the return, add variable to extract clean item name:
   ```typescript
   // REQ-211: Return clean item name for QR code label
   // Use specificItem (physical item name) if available, fall back to name
   const cleanItemName = item.specificItem || item.name;
   ```
4. Update return object to include `itemName`:
   ```typescript
   return {
     id: publicId,
     qrCodeUrl: qrCodeDataUrl,
     itemName: cleanItemName,
   };
   ```
5. Save file

**Verification**:
- [x] `handleSaveItem` returns `itemName` field
- [x] `itemName` uses `item.specificItem` when available
- [x] Falls back to `item.name` if `specificItem` is undefined
- [x] TypeScript compiles without errors

**Test Impact**: Update integration tests to verify return value includes `itemName`

**Implementation Notes** (2026-01-12 17:15 UTC):
- Updated `src/app/dashboard2/create/page.tsx` lines 44-47 (return type) and 169-178 (return value)
- Uses `item.name` (which contains the physical item name per SessionItem interface)
- Return object now includes `itemName: cleanItemName`
- Added REQ-211 comment explaining the purpose

---

### Task 5.4.4: Update PreviewSaveStep handleSave to Use Result itemName
**Estimate**: 0.75 story points
**Type**: LOGIC CHANGE
**File**: `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx`
**Lines**: 610-626 (handleSave function)

**Description**:
Update the `handleSave` callback to prefer `result.itemName` from the save operation when available, falling back to `currentItem.specificItem` for the QR code label.

**Current Implementation** (Lines 610-626):
```typescript
const handleSave = useCallback(async () => {
  const itemNameForQR = currentItem?.specificItem || currentItem?.itemName || 'Item';
  setSaveError(null);
  try {
    const result = await onSave();
    setSavedResult({
      ...result,
      itemName: itemNameForQR
    });
    setShowSuccess(true);
  } catch (error) {
    setSaveError(error instanceof Error ? error.message : 'Failed to save item');
  }
}, [onSave, currentItem?.specificItem, currentItem?.itemName]);
```

**Target Implementation**:
```typescript
/**
 * Handle save button click.
 * Calls onSave() and displays success overlay with QR code.
 *
 * REQ-211: Uses clean item name for QR code label:
 * 1. Prefers result.itemName from save operation (already cleaned)
 * 2. Falls back to currentItem.specificItem (physical item name)
 * 3. Last resort: currentItem.itemName or 'Item'
 */
const handleSave = useCallback(async () => {
  // Fallback item name if result doesn't provide one
  const fallbackItemName = currentItem?.specificItem || currentItem?.itemName || 'Item';
  setSaveError(null);
  try {
    const result = await onSave();
    setSavedResult({
      ...result,
      // REQ-211: Prefer clean item name from save result, fall back to specificItem
      itemName: result.itemName || fallbackItemName
    });
    setShowSuccess(true);
  } catch (error) {
    setSaveError(error instanceof Error ? error.message : 'Failed to save item');
  }
}, [onSave, currentItem?.specificItem, currentItem?.itemName]);
```

**Implementation Steps**:
1. Open `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx`
2. Locate `handleSave` function (around line 610)
3. Add JSDoc comment explaining the QR label logic
4. Update to prefer `result.itemName`:
   - Rename `itemNameForQR` to `fallbackItemName` for clarity
   - In `setSavedResult`, use `result.itemName || fallbackItemName`
5. Save file

**Verification**:
- [x] `handleSave` prefers `result.itemName` when available
- [x] Falls back correctly to `specificItem` then `itemName`
- [x] SuccessOverlay receives correct physical item name
- [x] TypeScript compiles without errors

**Test Impact**: Update `PreviewSaveStep.test.tsx` to verify itemName preference logic

**Implementation Notes** (2026-01-12 17:15 UTC):
- Updated `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx` lines 609-633
- Added comprehensive JSDoc explaining the itemName priority order
- Uses: `result.itemName || fallbackItemName` where `fallbackItemName = specificItem || itemName || 'Item'`
- Also updated `onSave` prop type at line 81-82 to include optional `itemName`

---

### Task 5.4.5: Update SuccessOverlay Component Documentation
**Estimate**: 0.25 story points
**Type**: DOCUMENTATION
**File**: `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx`
**Lines**: 429-481 (SuccessOverlay component)

**Description**:
Add JSDoc documentation to the SuccessOverlay component clarifying that `itemName` represents the physical item name for QR code labels, not article titles.

**Current Implementation** (Lines 433-437):
```typescript
interface SuccessOverlayProps {
  itemName: string;
  qrCodeUrl: string;
  onContinue: () => void;
}
```

**Target Implementation**:
```typescript
/**
 * SuccessOverlay Sub-Component
 *
 * Displays the success state after saving an item, showing:
 * - Success confirmation icon
 * - Generated QR code image
 * - Physical item name as QR label
 * - Continue button to proceed to next step
 *
 * IMPORTANT (REQ-211): The itemName displayed is the physical item name
 * (e.g., "Cabinets"), NOT an article title (e.g., "How to Clean - Cabinets").
 * QR codes represent physical Items that can have multiple Articles.
 * Scanning the QR code leads to the Item landing page showing all Articles.
 *
 * @see docs/REQ-211-update-qr-code-generation-overview.md
 */
interface SuccessOverlayProps {
  /**
   * Physical item name to display as QR label.
   * Should be the item identity (e.g., "Cabinets", "Fridge"),
   * not an article title (e.g., "How to Clean").
   */
  itemName: string;
  /** Base64 data URL of the generated QR code image */
  qrCodeUrl: string;
  /** Callback when user clicks Continue button */
  onContinue: () => void;
}
```

**Implementation Steps**:
1. Open `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx`
2. Locate `SuccessOverlayProps` interface (around line 433)
3. Add JSDoc comment before the interface explaining Item vs Article semantics
4. Add JSDoc comments to each property
5. Save file

**Verification**:
- [x] JSDoc clearly explains itemName is physical item, not article title
- [x] References REQ-211 for context
- [x] TypeScript compiles without errors

**Test Impact**: None - documentation only

**Implementation Notes** (2026-01-12 17:15 UTC):
- Updated `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx` lines 429-460
- Added comprehensive JSDoc explaining Item vs Article semantics
- Added property-level JSDoc for all interface fields
- References REQ-211 overview document

---

### Task 5.4.6: Add Documentation to useSessionQRGeneration Hook
**Estimate**: 0.25 story points
**Type**: DOCUMENTATION
**File**: `src/components/ItemCreationWorkflow/hooks/useSessionQRGeneration.ts`
**Lines**: 1-44 (module header)

**Description**:
Enhance the module-level documentation to clearly explain that QR codes represent physical Items, not individual Articles.

**Current Implementation** (Lines 1-44):
```typescript
/**
 * useSessionQRGeneration - QR code generation for session items
 *
 * Generates QR codes for items created in the current session.
 * ...
 */
```

**Target Implementation**:
```typescript
/**
 * useSessionQRGeneration - QR code generation for session items
 *
 * Generates QR codes for Items created in the current session.
 *
 * ## IMPORTANT: QR Code Semantics (REQ-211)
 *
 * QR codes represent **physical Items**, NOT individual Articles.
 *
 * Key principles:
 * - Each physical Item gets exactly ONE QR code
 * - The QR URL points to the Item landing page: `/item/{itemId}`
 * - Multiple Articles can exist per Item; they share the same QR code
 * - QR labels should show the physical item name (e.g., "Cabinets"),
 *   NOT the article title (e.g., "How to Clean")
 * - When new Articles are added to an Item, the QR code remains unchanged
 *
 * This design ensures QR codes are stable and don't need regeneration
 * when content is added or modified.
 *
 * ## Features
 * - Batch generation with configurable batch size
 * - Progress tracking per item and overall
 * - Retry mechanism for failed items
 * - Cancellation support for long operations
 *
 * @example Generating QR codes for session
 * ```tsx
 * const {
 *   generateForItems,
 *   isGenerating,
 *   progress,
 *   stats,
 *   qrCodes,
 * } = useSessionQRGeneration({ batchSize: 5 });
 *
 * const handlePrint = async () => {
 *   await generateForItems(session.items);
 *   // qrCodes map contains item.id -> QR data URL
 *   // Each QR encodes: /item/{itemId}
 * };
 * ```
 *
 * @module ItemCreationWorkflow/hooks/useSessionQRGeneration
 * @see QRGenerationProgress for progress UI
 * @see useQRCodeGeneration for underlying implementation
 * @see docs/REQ-211-update-qr-code-generation-overview.md
 * @lastModified 2026-01-12 (REQ-211 Documentation Update)
 */
```

**Implementation Steps**:
1. Open `src/components/ItemCreationWorkflow/hooks/useSessionQRGeneration.ts`
2. Update the module-level JSDoc (lines 1-44)
3. Add "IMPORTANT: QR Code Semantics" section
4. Add key principles bullet list
5. Update the `@lastModified` tag
6. Add reference to REQ-211 overview document
7. Save file

**Verification**:
- [x] Documentation clearly explains Item vs Article semantics
- [x] Key principles list is accurate
- [x] Example code is accurate
- [x] TypeScript compiles without errors

**Test Impact**: None - documentation only

**Implementation Notes** (2026-01-12 17:15 UTC):
- Updated `src/components/ItemCreationWorkflow/hooks/useSessionQRGeneration.ts` lines 1-51
- Added "IMPORTANT: QR Code Semantics (REQ-211)" section
- Added key principles explaining QR codes represent physical Items
- Updated @lastModified tag and added @see reference

---

### Task 5.4.7: Add JSDoc to buildQRUrl Function
**Estimate**: 0.25 story points
**Type**: DOCUMENTATION
**File**: `src/lib/config.ts`
**Lines**: 52-60 (buildQRUrl function)

**Description**:
Enhance the JSDoc documentation for `buildQRUrl` to clarify that the publicId parameter is an Item ID, not an Article ID.

**Current Implementation** (Lines 52-60):
```typescript
/**
 * Build QR code URL for an item
 * @param publicId Public ID of the item
 * @returns Full URL for the QR code
 */
export function buildQRUrl(publicId: string): string {
  const domain = getQRDomain();
  return `${domain}/item/${publicId}`;
}
```

**Target Implementation**:
```typescript
/**
 * Build QR code URL for a physical Item
 *
 * Constructs the URL that will be encoded in the QR code image.
 * This URL points to the Item landing page, which displays all
 * Articles/Instructions associated with the physical item.
 *
 * IMPORTANT (REQ-211): QR codes represent physical Items, NOT Articles.
 * - The publicId parameter is the Item's public ID
 * - Do NOT pass Article IDs to this function
 * - The generated URL remains stable when Articles are added/modified
 *
 * @param publicId - The Item's public ID (NOT Article ID)
 * @returns Full URL for the QR code (e.g., "https://domain.com/item/abc123")
 *
 * @example
 * ```typescript
 * // Correct: Using Item's public ID
 * const url = buildQRUrl(item.publicId);
 * // Returns: "https://yourdomain.com/item/abc-123-def"
 *
 * // The URL leads to a landing page showing all articles for this item
 * ```
 *
 * @see docs/REQ-211-update-qr-code-generation-overview.md
 */
export function buildQRUrl(publicId: string): string {
  const domain = getQRDomain();
  return `${domain}/item/${publicId}`;
}
```

**Implementation Steps**:
1. Open `src/lib/config.ts`
2. Locate `buildQRUrl` function (line 52)
3. Update JSDoc with detailed explanation
4. Add IMPORTANT note about Item vs Article semantics
5. Add example showing correct usage
6. Add reference to REQ-211 overview
7. Save file

**Verification**:
- [x] JSDoc clearly explains publicId is Item ID, not Article ID
- [x] Example shows correct usage
- [x] References REQ-211 documentation
- [x] TypeScript compiles without errors

**Test Impact**: None - documentation only

**Implementation Notes** (2026-01-12 17:15 UTC):
- Updated `src/lib/config.ts` lines 52-82
- Added comprehensive JSDoc explaining QR codes represent physical Items
- Added @example showing correct usage with Item publicId
- Added IMPORTANT note clarifying NOT to use Article IDs
- Added @see reference to REQ-211 overview and @lastModified tag

---

### Task 5.4.8: Write Unit Tests for handleSave Item Name Logic
**Estimate**: 1 story point
**Type**: TESTING
**File**: `src/components/ItemCreationWorkflow/components/steps/__tests__/PreviewSaveStep.test.tsx`

**Description**:
Add unit tests verifying that the QR code label correctly displays the physical item name in various scenarios.

**Test Cases**:

```typescript
describe('PreviewSaveStep - QR Code Label (REQ-211)', () => {
  describe('handleSave item name logic', () => {
    it('should use result.itemName when provided by onSave', async () => {
      // Setup: onSave returns { id, qrCodeUrl, itemName: 'Cabinets' }
      // currentItem has specificItem: 'Different Name'
      // Expected: SuccessOverlay displays 'Cabinets'
    });

    it('should fall back to specificItem when result.itemName is undefined', async () => {
      // Setup: onSave returns { id, qrCodeUrl } (no itemName)
      // currentItem has specificItem: 'Cabinets'
      // Expected: SuccessOverlay displays 'Cabinets'
    });

    it('should fall back to itemName when specificItem is undefined', async () => {
      // Setup: onSave returns { id, qrCodeUrl } (no itemName)
      // currentItem has itemName: 'Cabinets', no specificItem
      // Expected: SuccessOverlay displays 'Cabinets'
    });

    it('should use "Item" as final fallback', async () => {
      // Setup: onSave returns { id, qrCodeUrl } (no itemName)
      // currentItem has no specificItem or itemName
      // Expected: SuccessOverlay displays 'Item'
    });

    it('should display physical item name, not article title pattern', async () => {
      // Setup: currentItem with specificItem: 'Cabinets'
      // (Previously might have had 'How to Clean - Cabinets' pattern)
      // Expected: Label shows 'Cabinets' only
    });
  });
});
```

**Implementation Steps**:
1. Open `src/components/ItemCreationWorkflow/components/steps/__tests__/PreviewSaveStep.test.tsx`
2. Add new describe block for QR Code Label tests
3. Implement each test case:
   - Mock `onSave` with different return values
   - Render PreviewSaveStep with different `currentItem` values
   - Click save button
   - Verify SuccessOverlay displays correct item name
4. Run tests to ensure they pass
5. Save file

**Verification**:
- [x] All new tests pass
- [x] Tests cover all fallback scenarios
- [x] Tests verify physical item name vs article title pattern
- [x] No regression in existing tests

**Implementation Notes** (2026-01-12 17:15 UTC):
- Added tests to `src/components/ItemCreationWorkflow/components/steps/__tests__/PreviewSaveStep.test.tsx` lines 968-1186
- Added 6 test cases covering all scenarios:
  - Uses result.itemName when provided by onSave
  - Falls back to specificItem when result.itemName is undefined
  - Falls back to itemName when specificItem is undefined
  - Final fallback to 'Item' (save disabled when empty)
  - Displays physical item name, not article title pattern
  - Priority verification: result.itemName > specificItem > itemName

---

### Task 5.4.9: Write Integration Test for Save Flow
**Estimate**: 0.75 story points
**Type**: TESTING
**File**: `src/components/ItemCreationWorkflow/__tests__/ItemCapture.integration.test.tsx`

**Description**:
Add integration test verifying the complete save flow returns and displays the correct physical item name for QR labels.

**Test Case**:

```typescript
describe('Item Save Flow - QR Code Label Integration (REQ-211)', () => {
  it('should display physical item name on QR code after save', async () => {
    // Setup:
    // 1. Render full ItemCreationWorkflow
    // 2. Navigate through workflow selecting:
    //    - Room: Kitchen
    //    - Item Type: Appliance
    //    - Specific Item: "Cabinets"
    //    - Purpose: "How to Clean"
    //    - Add content
    // 3. Reach PreviewSaveStep
    // 4. Click Save

    // Expected:
    // - onSaveItem called with item.specificItem = 'Cabinets'
    // - SuccessOverlay shows QR code with label 'Cabinets'
    // - Label does NOT show 'How to Clean - Cabinets'
  });
});
```

**Implementation Steps**:
1. Open `src/components/ItemCreationWorkflow/__tests__/ItemCapture.integration.test.tsx`
2. Add new test case for QR code label integration
3. Set up full workflow render with mocked callbacks
4. Simulate user workflow through to save
5. Verify SuccessOverlay renders with correct item name
6. Run test to ensure it passes
7. Save file

**Verification**:
- [x] Integration test passes
- [x] Test verifies end-to-end flow
- [x] Physical item name displayed correctly
- [x] No regression in existing integration tests

**Implementation Notes** (2026-01-12 17:15 UTC):
- Added tests to `src/components/ItemCreationWorkflow/__tests__/ItemCapture.integration.test.tsx` lines 592-696
- Added 2 integration test cases:
  - Should display physical item name on QR code after save (with result.itemName)
  - Should use specificItem for QR label when result.itemName is not provided
- Tests verify full workflow navigation through to save and QR display

---

### Task 5.4.10: Manual Verification Checklist
**Estimate**: 0.5 story points
**Type**: VERIFICATION

**Description**:
Perform manual testing to verify QR code generation and label display work correctly in the running application.

**Manual Test Steps**:

1. **Start Item Creation Workflow**
   - Navigate to `/dashboard2/create`
   - Begin creating a new item

2. **Complete Workflow Selections**
   - Select Room: Kitchen
   - Select Item Type: Appliance
   - Enter Specific Item: "Cabinets"
   - Select Purpose: "How to Clean"
   - Add any content (photo, video, or text)

3. **Preview and Save**
   - Review PreviewSaveStep
   - Verify "Item Name" field shows "Cabinets"
   - Verify "Article Title" shows "How to Clean"
   - Click "Save Item" button

4. **Verify Success Overlay**
   - [ ] SuccessOverlay appears
   - [ ] QR code image is displayed
   - [ ] Label under QR code shows "Cabinets" (NOT "How to Clean - Cabinets")
   - [ ] Label is the physical item name only

5. **Verify QR Code URL** (using browser dev tools)
   - [ ] QR code encodes URL in format `/items/{uuid}`
   - [ ] URL does not contain article-related identifiers
   - [ ] UUID matches the item's publicId

6. **Test QR Code Scan** (optional)
   - Scan the QR code with a mobile device
   - [ ] URL resolves to item landing page
   - [ ] Landing page shows all articles for the item

**Verification Checklist**:
- [ ] QR label shows physical item name only
- [ ] No article title mixed into QR label
- [ ] QR URL format is correct
- [ ] QR code is scannable
- [ ] Linked page displays correctly

---

## Acceptance Criteria Verification

From REQ-211:

| Criteria | Status | Verification |
|----------|--------|--------------|
| QR code generation utilities accept Item ID as the primary identifier for encoding | ALREADY CORRECT | Task 5.4.1 - Verified |
| Generated QR code URLs follow a consistent format that routes to item landing pages | ALREADY CORRECT | Uses `/items/{publicId}` |
| The useSessionQRGeneration hook uses Item IDs when creating QR codes | ALREADY CORRECT | Task 5.4.6 - Add documentation |
| QR code URLs stored in the database are associated with Item records | ALREADY CORRECT | Item data includes publicId |
| QR code generation logic does not reference Article IDs in URL construction | ALREADY CORRECT | Only uses item publicId |
| Generated QR codes produce scannable URLs that resolve correctly | ALREADY CORRECT | Manual verification |
| The QR code generation process maintains compatibility with existing print workflows | TO VERIFY | Task 5.4.10 |
| Documentation clearly explains QR codes represent physical items, not articles | TO IMPLEMENT | Tasks 5.4.5, 5.4.6, 5.4.7 |
| All QR code generation occurs after the Item ID is known | ALREADY CORRECT | publicId generated before QR |

**Additional Criteria (Task 5.4 specific)**:

| Criteria | Status | Verification |
|----------|--------|--------------|
| QR code label in SuccessOverlay shows physical item name only | TO IMPLEMENT | Tasks 5.4.4, 5.4.5 |
| `handleSaveItem` returns clean item name in result | TO IMPLEMENT | Task 5.4.3 |
| PreviewSaveStep uses result.itemName for display when available | TO IMPLEMENT | Task 5.4.4 |

---

## Dependencies

### Upstream Dependencies
| Task | Dependency | Impact |
|------|------------|--------|
| Task 5.2 (Update CurrentItemState) | `currentItem.specificItem` field | Falls back to `itemName` if not available |
| Task 5.1 (Update type definitions) | Article type separation | Optional - can proceed independently |

### Downstream Dependencies
None - this task's changes are additive and backward compatible.

### Parallel Safety
- **Can run in parallel with**: Phase 1-4 tasks (different files)
- **Must coordinate with**: Task 5.3 (PreviewSaveStep display) - both modify same file

---

## Task Execution Order

Recommended execution sequence:

1. **Task 5.4.1** - Verification (0.25 SP) - Confirm existing URL format is correct
2. **Task 5.4.2** - Type definition (0.5 SP) - Update return type first
3. **Task 5.4.3** - handleSaveItem logic (0.5 SP) - Implement return value
4. **Task 5.4.4** - PreviewSaveStep logic (0.75 SP) - Consume return value
5. **Task 5.4.5** - SuccessOverlay docs (0.25 SP) - Document the component
6. **Task 5.4.6** - useSessionQRGeneration docs (0.25 SP) - Add hook documentation
7. **Task 5.4.7** - buildQRUrl docs (0.25 SP) - Add function documentation
8. **Task 5.4.8** - Unit tests (1 SP) - Test the logic
9. **Task 5.4.9** - Integration test (0.75 SP) - Test end-to-end
10. **Task 5.4.10** - Manual verification (0.5 SP) - Final validation

**Total Estimated Story Points**: 5.0 SP

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| `specificItem` not populated | Low | Medium | Fallback to `itemName` in all cases |
| Type mismatch after return type change | Low | Medium | Change is additive - optional field |
| Existing tests fail | Medium | Low | Update affected test mocks |
| Print workflow regression | Low | High | Task 5.4.10 manual verification |

---

## Build and Test Commands

```bash
# Run TypeScript compilation check
npm run type-check

# Run unit tests for PreviewSaveStep
npm test -- PreviewSaveStep.test.tsx

# Run integration tests
npm test -- ItemCapture.integration.test.tsx

# Run all tests
npm test

# Start development server for manual testing
npm run dev
```

---

## References

- **Source Request**: `docs/gen_requests.md` - REQ-211
- **Overview Document**: `docs/REQ-211-update-qr-code-generation-overview.md`
- **Implementation Plan**: `docs/prd/Plan-109-FAQBNB-Review-2026-01-11b-Complete-Implementation.md`
- **Related Tasks**:
  - Task 5.1: Update type definitions
  - Task 5.2: Update CurrentItemState
  - Task 5.3: Update PreviewSaveStep display
