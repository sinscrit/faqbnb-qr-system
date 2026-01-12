# Implementation Breakdown: REQ-210 - Update PreviewSaveStep Display to Separate Item Name from Article Title

**Document Created:** 2026-01-12 21:30 UTC
**Last Modified:** 2026-01-12 21:30 UTC
**Request ID:** REQ-210
**Type:** ENHANCEMENT
**Size:** M
**Phase:** 5 - Fix Data Model - Separate Item from Article (ITEM-02)
**Task ID:** 5.3
**Priority:** CRITICAL

---

## Summary

The PreviewSaveStep component should display physical Item properties separately from Article properties, showing "Item Name" for the physical object and "Article Title" for the purpose-derived instructional content, with QR code previews showing only the item name.

---

## Current Behavior Analysis

### PreviewSaveStep.tsx Current State (lines 175-235)

The current `ItemDetailsSection` sub-component displays:
1. **Read-only metadata fields:** Room, Item Type, Purpose (via `ItemDetailsDisplay`)
2. **Tags Editor:** For tag management
3. **Editable title field:** Labeled "Article Title" but uses `currentItem.itemName`

### Current Issues Identified

1. **Field Labeling Confusion:**
   - The editable field is labeled "Article Title" but the value comes from `currentItem.itemName`
   - There is no separate display for the physical item name vs the article title
   - Users cannot distinguish between what appears on the QR code label vs the article content

2. **QR Code Preview (SuccessOverlay, lines 382-424):**
   - Shows `itemName` under the QR code (line 403-405)
   - This is correct behavior BUT `itemName` currently conflates item + article title
   - Example: Shows "How to Clean - Cabinets" when it should show just "Cabinets"

3. **CurrentItemState Structure:**
   - `specificItem`: Contains the physical item name (e.g., "Cabinets")
   - `itemName`: Contains the display name which may include purpose prefix
   - `purpose`: Contains the selected purpose type (e.g., "how-to-clean")

---

## Target Behavior

### Display Fields

1. **"Item Name" field (read-only or editable):**
   - Shows the physical item name (e.g., "Cabinets", "Refrigerator", "Thermostat")
   - Value source: `currentItem.specificItem`
   - This is what appears on the QR code label

2. **"Article Title" field (editable):**
   - Shows the purpose-derived article title (e.g., "How to Clean", "How to Use")
   - Value source: Derived from `currentItem.purpose` via `PURPOSE_LABELS`
   - Can be customized by user

3. **QR Code Preview:**
   - Shows only the item name, NOT the article title
   - Example: QR code label shows "Cabinets" not "How to Clean - Cabinets"

### Visual Layout

```
+------------------------------------------+
| Item Details                             |
+------------------------------------------+
| Room          | Item Type    | Purpose   |
| Kitchen       | Room Item    | How to... |
+------------------------------------------+
| Tags                                     |
| [kitchen] [room-item] [cleaning]         |
+------------------------------------------+
| Item Name (appears on QR code)           |
| [Cabinets                           ]    |
+------------------------------------------+
| Article Title                            |
| [How to Clean                       ]    |
+------------------------------------------+
```

---

## Dependencies

### Depends On (upstream)

- **Task 5.1:** Update type definitions - `CurrentItemState` must include `currentArticle.title` field for the restructured data model
- **Task 5.2:** Update `CurrentItemState` - The interface restructure must be complete to provide `currentArticle.title` as a separate field from `itemName`/`specificItem`

### Blocks (downstream)

- **Task 5.4:** Update QR code generation - Depends on this task to confirm the correct field (`specificItem` or `itemName`) is used for QR label text
- **Phase 2 Tasks (ITEM-03):** What's Next screen may reference the saved item and article titles from PreviewSaveStep

### Parallel Safety

- **Files touched:**
  - `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx`

- **Conflicts with:**
  - Task 5.1 and 5.2 (modifies types that this component consumes)

- **Safe to parallelize with:**
  - Phase 3 (ITEM-01): Dashboard cards - different component tree
  - Phase 4 (ITEM-04): Navigation menu - different component tree
  - Phase 1 (ITEM-05): Step count fix - modifies constants and header, not PreviewSaveStep content

---

## Implementation Tasks

### Task 5.3.1: Update ItemDetailsSection to show Item Name separately

**File:** `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx`

**Location:** Lines 175-235 (ItemDetailsSection sub-component)

**Changes Required:**

1. Add a new read-only or editable "Item Name" field that displays `currentItem.specificItem`
2. Change the existing editable field from "Article Title" using `itemName` to properly derive title from purpose

**Specific Code Changes:**

```typescript
// In ItemDetailsSection (around line 188-234)
function ItemDetailsSection({
  currentItem,
  onUpdateItemName,
  onUpdateArticleTitle,  // NEW prop for article title changes
  onUpdateTags,
  disabled,
}: ItemDetailsSectionProps) {
  // Derive article title from purpose
  const articleTitle = currentItem.purpose
    ? PURPOSE_LABELS[currentItem.purpose as PurposeTypeConst]
    : 'Instructions';

  return (
    <section ...>
      {/* Read-only metadata fields */}
      <ItemDetailsDisplay ... />

      {/* Tags Editor */}
      ...

      {/* NEW: Item Name field - what appears on QR code */}
      <div className="mt-6 pt-6 border-t border-gray-100">
        <label className="block text-sm font-medium text-[#717171] mb-2">
          Item Name
          <span className="text-xs text-gray-500 ml-2">(appears on QR code label)</span>
        </label>
        <ItemNameEditor
          value={currentItem.specificItem}
          onChange={onUpdateItemName}
          disabled={disabled}
          maxLength={50}
          placeholder="Enter item name"
        />
      </div>

      {/* Article Title field - the instructional content title */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-[#717171] mb-2">
          Article Title
        </label>
        <ItemNameEditor
          value={articleTitle}
          onChange={onUpdateArticleTitle}
          disabled={disabled}
          maxLength={100}
          placeholder="Enter article title"
        />
      </div>
    </section>
  );
}
```

### Task 5.3.2: Update SuccessOverlay QR code label display

**File:** `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx`

**Location:** Lines 382-424 (SuccessOverlay sub-component)

**Current Code (lines 397-405):**
```typescript
<div className="p-4 bg-white border border-gray-200 rounded-lg inline-block mb-4 shadow-sm">
  <img
    src={qrCodeUrl}
    alt={`QR code for ${itemName}`}
    className="w-40 h-40"
  />
  <p className="mt-2 text-sm font-medium text-[#222222]">
    {itemName}
  </p>
</div>
```

**Changes Required:**
- Ensure `itemName` passed to `SuccessOverlay` is the physical item name, not the article title
- This requires tracing back to where `savedResult.itemName` is set (line 559-561)

**Current save logic (lines 552-567):**
```typescript
const handleSave = useCallback(async () => {
  const itemNameToSave = currentItem?.itemName || 'Item';  // BUG: Uses itemName which may include article title
  ...
});
```

**Required Change:**
```typescript
const handleSave = useCallback(async () => {
  // Use specificItem for QR code label (physical item name only)
  const itemNameForQR = currentItem?.specificItem || currentItem?.itemName || 'Item';
  ...
});
```

### Task 5.3.3: Add visual section grouping

**File:** `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx`

**Changes Required:**
Add visual separation between Item properties and Article properties using:
- Section headers or dividers
- Background color differentiation
- Clear labeling

**Proposed Structure:**
```typescript
<section className="bg-white rounded-lg border border-gray-200 p-6">
  <h3 className="text-lg font-medium text-[#222222] mb-4">
    Item Details
  </h3>

  {/* Item Properties Group */}
  <div className="space-y-4 pb-4 border-b border-gray-100">
    <ItemDetailsDisplay room={...} itemType={...} />
    <div>
      <label>Item Name <span className="text-xs">(QR code label)</span></label>
      <ItemNameEditor value={currentItem.specificItem} ... />
    </div>
  </div>

  {/* Article Properties Group */}
  <div className="space-y-4 pt-4">
    <div>
      <label>Article Title</label>
      <ItemNameEditor value={articleTitle} ... />
    </div>
    <div>
      <label>Purpose</label>
      <dd>{purposeLabel}</dd>
    </div>
  </div>

  {/* Tags (applies to both) */}
  <div className="mt-4 pt-4 border-t border-gray-100">
    <TagsEditor ... />
  </div>
</section>
```

### Task 5.3.4: Update PreviewSaveStepProps interface

**File:** `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx`

**Location:** Lines 65-88 (PreviewSaveStepProps interface)

**Current Interface:**
```typescript
export interface PreviewSaveStepProps {
  currentItem: CurrentItemState;
  onUpdateItemName: (name: string) => void;  // Currently updates itemName
  onUpdateTags: (tags: string[]) => void;
  // ... other props
}
```

**Required Changes:**
```typescript
export interface PreviewSaveStepProps {
  currentItem: CurrentItemState;
  /** Callback when physical item name changes (QR code label) */
  onUpdateItemName: (name: string) => void;
  /** Callback when article title changes */
  onUpdateArticleTitle?: (title: string) => void;  // NEW
  onUpdateTags: (tags: string[]) => void;
  // ... other props
}
```

### Task 5.3.5: Update parent component callback wiring

**File:** `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`

**Changes Required:**
- Add new action type `SET_ARTICLE_TITLE` or similar
- Wire `onUpdateArticleTitle` callback to dispatch

**Note:** This depends on Task 5.2 (CurrentItemState restructure) being complete.

---

## Authorized Files and Functions for Modification

### Primary File

| File | Functions/Components | Modification Type |
|------|---------------------|-------------------|
| `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx` | `ItemDetailsSection`, `ItemDetailsSectionProps`, `SuccessOverlay`, `SuccessOverlayProps`, `PreviewSaveStepProps`, `handleSave` | MODIFY |

### Supporting Files

| File | Functions/Components | Modification Type |
|------|---------------------|-------------------|
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | Callback wiring for `onUpdateArticleTitle` | MODIFY |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` | `WorkflowAction` (add `SET_ARTICLE_TITLE`) | MODIFY (if Task 5.2 not complete) |
| `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts` | Reducer handling for article title | MODIFY |
| `src/components/ItemCreationWorkflow/utils/constants.ts` | `PURPOSE_LABELS` (read-only reference) | NONE |

### Files NOT to Modify

- `src/app/dashboard2/create/page.tsx` - QR generation uses `item.name` from SessionItem, not affected by this UI change
- `src/components/ItemCreationWorkflow/hooks/useSessionQRGeneration.ts` - Uses `item.name` from transformed items
- `src/lib/qrcode-utils.ts` - Low-level QR generation, unchanged

---

## Acceptance Criteria Mapping

| Acceptance Criteria | Implementation Task | Verification |
|---------------------|-------------------|--------------|
| PreviewSaveStep displays an "Item Name" field showing the physical item name | Task 5.3.1 | Field exists with correct label and value |
| PreviewSaveStep displays an "Article Title" field showing purpose-derived title | Task 5.3.1 | Field exists with purpose-derived value |
| QR code preview section shows only the item name | Task 5.3.2 | SuccessOverlay shows specificItem only |
| Visual layout distinguishes item vs article properties | Task 5.3.3 | Visual grouping present |
| Field labels use consistent terminology | Task 5.3.1, 5.3.4 | "Item Name" and "Article Title" used consistently |
| Distinction is clear on desktop and mobile | Task 5.3.3 | Responsive layout maintained |
| Helper text refers to "Item Name" for physical objects | Task 5.3.1 | "(appears on QR code label)" helper text added |
| Review step reflects data to be saved | Task 5.3.2 | savedResult uses correct field |

---

## Testing Requirements

### Unit Tests to Update

| Test File | Test Cases to Add/Update |
|-----------|-------------------------|
| `src/components/ItemCreationWorkflow/components/steps/__tests__/PreviewSaveStep.test.tsx` | - Test Item Name field displays `specificItem` value |
| | - Test Article Title field displays purpose-derived title |
| | - Test QR code success overlay shows item name only |
| | - Test visual separation between Item and Article sections |

### New Test Cases

```typescript
describe('PreviewSaveStep - Item/Article Separation', () => {
  it('displays Item Name field with specificItem value', () => {
    // Verify the Item Name field shows "Cabinets" not "How to Clean - Cabinets"
  });

  it('displays Article Title field with purpose-derived title', () => {
    // Verify Article Title shows "How to Clean" derived from purpose
  });

  it('shows only item name in QR code success overlay', () => {
    // Verify QR code label shows "Cabinets" not full title
  });

  it('has visual separation between Item and Article sections', () => {
    // Verify section grouping or visual dividers exist
  });

  it('includes helper text indicating QR code label', () => {
    // Verify "(appears on QR code label)" is present
  });
});
```

### Integration Tests

| Test File | Scenarios |
|-----------|-----------|
| `src/components/ItemCreationWorkflow/__tests__/ItemCapture.integration.test.tsx` | Complete workflow saves correct item name and article title separately |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Field mapping confusion during transition | Medium | Medium | Clear JSDoc comments, deprecation warnings |
| Breaking existing tests that expect combined title | High | Medium | Update test fixtures to use separated fields |
| Parent component not passing new callback | Low | High | Make `onUpdateArticleTitle` optional with fallback |
| Mobile layout issues with extra fields | Medium | Medium | Test responsive layout before merge |

---

## Estimated Effort

| Task | Effort |
|------|--------|
| Task 5.3.1: Update ItemDetailsSection | 1 hour |
| Task 5.3.2: Update SuccessOverlay | 30 min |
| Task 5.3.3: Add visual section grouping | 30 min |
| Task 5.3.4: Update props interface | 15 min |
| Task 5.3.5: Wire parent callbacks | 30 min |
| Testing | 1 hour |
| **Total** | **~4 hours** |

---

## References

- **Request:** docs/gen_requests.md - REQ-210
- **Implementation Plan:** docs/prd/Plan-109-FAQBNB-Review-2026-01-11b-Complete-Implementation.md (Phase 5, Task 5.3)
- **Related Tasks:** Task 5.1 (Type definitions), Task 5.2 (CurrentItemState), Task 5.4 (QR generation)
- **Component Documentation:** PreviewSaveStep.tsx header comments (lines 1-25)
- **Design System:** Airbnb DLS colors in constants.ts
