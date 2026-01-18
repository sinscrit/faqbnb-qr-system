# Detailed Task Breakdown: REQ-210 - Update PreviewSaveStep Display

**Document Created:** 2026-01-12 22:15 UTC
**Last Modified:** 2026-01-12 17:07 UTC (Implementation complete)
**Request ID:** REQ-210
**Type:** ENHANCEMENT
**Size:** M
**Phase:** 5 - Fix Data Model - Separate Item from Article (ITEM-02)
**Task ID:** 5.3
**Priority:** CRITICAL

---

## Overview

This document provides granular, actionable tasks for updating the PreviewSaveStep component to display physical Item properties separately from Article properties, showing "Item Name" for the physical object and "Article Title" for the purpose-derived instructional content.

### Source Documents

- Overview: `docs/REQ-210-update-previewsavestep-display-overview.md`
- Implementation Plan: `docs/prd/Plan-109-FAQBNB-Review-2026-01-11b-Complete-Implementation.md`
- Request: `docs/gen_requests.md` (REQ-210)

### Dependencies

- **Upstream:** Task 5.1 (Type definitions), Task 5.2 (CurrentItemState restructure)
- **Downstream:** Task 5.4 (QR code generation)

---

## Authorized Files for Modification

| File | Component/Function | Modification Type |
|------|-------------------|-------------------|
| `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx` | `ItemDetailsSection`, `ItemDetailsSectionProps`, `SuccessOverlay`, `handleSave`, `PreviewSaveStepProps` | MODIFY |
| `src/components/ItemCreationWorkflow/components/steps/__tests__/PreviewSaveStep.test.tsx` | Test cases | ADD/MODIFY |

---

## Task Breakdown

### Task 5.3.1: Update ItemDetailsSectionProps Interface

**File:** `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx`
**Lines:** 175-180
**Story Points:** 0.5

#### Current Code (lines 175-180):
```typescript
interface ItemDetailsSectionProps {
  currentItem: CurrentItemState;
  onUpdateItemName: (name: string) => void;
  onUpdateTags: (tags: string[]) => void;
  disabled?: boolean;
}
```

#### Required Changes:
1. Add optional `onUpdateArticleTitle` callback prop for article title updates

#### Target Code:
```typescript
interface ItemDetailsSectionProps {
  currentItem: CurrentItemState;
  /** Callback when physical item name changes (QR code label) */
  onUpdateItemName: (name: string) => void;
  /** Callback when article title changes (optional, defaults to derived from purpose) */
  onUpdateArticleTitle?: (title: string) => void;
  /** Callback when tags change */
  onUpdateTags: (tags: string[]) => void;
  disabled?: boolean;
}
```

#### Verification:
- [ ] TypeScript compiles without errors
- [ ] Interface JSDoc comments describe prop purposes

---

### Task 5.3.2: Add Item Name Field to ItemDetailsSection

**File:** `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx`
**Lines:** 182-235
**Story Points:** 1

#### Current Behavior:
- Single editable field labeled "Article Title" displays `currentItem.itemName`
- No visual separation between item identity and article content

#### Required Changes:
1. Add "Item Name" field that displays `currentItem.specificItem`
2. Include helper text "(appears on QR code label)"
3. Place before the "Article Title" field

#### Implementation:
Insert after the Tags Editor section (after line 218, before line 220):

```typescript
{/* Item Name field - physical item name for QR code label */}
<div className="mt-6 pt-6 border-t border-gray-100">
  <label
    htmlFor="item-name-input"
    className="block text-sm font-medium text-[#717171] mb-1"
  >
    Item Name
  </label>
  <span className="text-xs text-gray-500 block mb-2">
    (appears on QR code label)
  </span>
  <ItemNameEditor
    id="item-name-input"
    value={currentItem.specificItem}
    onChange={onUpdateItemName}
    disabled={disabled}
    maxLength={50}
    placeholder="Enter item name"
    aria-describedby="item-name-helper"
  />
</div>
```

#### Verification:
- [ ] Item Name field displays `specificItem` value (e.g., "Cabinets")
- [ ] Field includes helper text about QR code label
- [ ] Field is editable and calls `onUpdateItemName` on change
- [ ] Field has proper ARIA labeling

---

### Task 5.3.3: Update Article Title Field Logic

**File:** `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx`
**Lines:** 220-232
**Story Points:** 1

#### Current Behavior (lines 220-232):
```typescript
{/* Editable Title - using existing ItemNameEditor */}
<div className="mt-6 pt-6 border-t border-gray-100">
  <label className="block text-sm font-medium text-[#717171] mb-2">
    Article Title
  </label>
  <ItemNameEditor
    value={currentItem.itemName}
    onChange={onUpdateItemName}
    disabled={disabled}
    maxLength={100}
    placeholder="Enter article title"
  />
</div>
```

#### Required Changes:
1. Derive article title from `currentArticle.title` or fallback to `PURPOSE_LABELS[purpose]`
2. Update label to clearly indicate this is for article/instruction content
3. Remove duplicate border-t since Item Name field now has it

#### Implementation:
```typescript
{/* Article Title field - purpose-derived title for instructional content */}
<div className="mt-4">
  <label
    htmlFor="article-title-input"
    className="block text-sm font-medium text-[#717171] mb-2"
  >
    Article Title
  </label>
  <ItemNameEditor
    id="article-title-input"
    value={
      currentItem.currentArticle?.title ||
      (currentItem.purpose
        ? PURPOSE_LABELS[currentItem.purpose as PurposeTypeConst]
        : 'Instructions')
    }
    onChange={onUpdateArticleTitle || (() => {})}
    disabled={disabled || !onUpdateArticleTitle}
    maxLength={100}
    placeholder="Enter article title"
    aria-describedby="article-title-helper"
  />
</div>
```

#### Verification:
- [ ] Article Title displays purpose-derived value (e.g., "How to Clean")
- [ ] Article Title is editable if `onUpdateArticleTitle` callback provided
- [ ] Article Title shows correct fallback when no purpose selected
- [ ] Visual separation between Item Name and Article Title fields

---

### Task 5.3.4: Add Visual Section Grouping

**File:** `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx`
**Lines:** 188-235
**Story Points:** 0.5

#### Required Changes:
1. Add section subheadings for "Item Properties" and "Article Properties"
2. Apply visual grouping via CSS classes

#### Implementation:
Update ItemDetailsSection structure:

```typescript
function ItemDetailsSection({
  currentItem,
  onUpdateItemName,
  onUpdateArticleTitle,
  onUpdateTags,
  disabled,
}: ItemDetailsSectionProps) {
  // Derive article title from purpose
  const articleTitle = currentItem.currentArticle?.title ||
    (currentItem.purpose
      ? PURPOSE_LABELS[currentItem.purpose as PurposeTypeConst]
      : 'Instructions');

  return (
    <section
      className="bg-white rounded-lg border border-gray-200 p-6"
      aria-labelledby="item-details-heading"
    >
      <h3
        id="item-details-heading"
        className="text-lg font-medium text-[#222222] mb-4"
      >
        Item Details
      </h3>

      {/* Item Properties Group */}
      <div className="space-y-4 pb-4 border-b border-gray-100">
        <h4 className="text-sm font-semibold text-[#484848] uppercase tracking-wide">
          Physical Item
        </h4>

        {/* Read-only metadata fields */}
        <ItemDetailsDisplay
          room={currentItem.room}
          itemType={currentItem.itemType}
          purpose={currentItem.purpose}
        />

        {/* Item Name field */}
        <div>
          <label
            htmlFor="item-name-input"
            className="block text-sm font-medium text-[#717171] mb-1"
          >
            Item Name
          </label>
          <span className="text-xs text-gray-500 block mb-2">
            (appears on QR code label)
          </span>
          <ItemNameEditor
            id="item-name-input"
            value={currentItem.specificItem}
            onChange={onUpdateItemName}
            disabled={disabled}
            maxLength={50}
            placeholder="Enter item name"
          />
        </div>
      </div>

      {/* Article Properties Group */}
      <div className="space-y-4 pt-4 pb-4 border-b border-gray-100">
        <h4 className="text-sm font-semibold text-[#484848] uppercase tracking-wide">
          Article / Instructions
        </h4>

        {/* Article Title field */}
        <div>
          <label
            htmlFor="article-title-input"
            className="block text-sm font-medium text-[#717171] mb-2"
          >
            Article Title
          </label>
          <ItemNameEditor
            id="article-title-input"
            value={articleTitle}
            onChange={onUpdateArticleTitle || (() => {})}
            disabled={disabled || !onUpdateArticleTitle}
            maxLength={100}
            placeholder="Enter article title"
          />
        </div>
      </div>

      {/* Tags (applies to both item and article) */}
      <div className="pt-4">
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
    </section>
  );
}
```

#### Verification:
- [ ] "Physical Item" section header visible
- [ ] "Article / Instructions" section header visible
- [ ] Visual separation via borders between sections
- [ ] Tags section at bottom (applies to both)

---

### Task 5.3.5: Update SuccessOverlay to Show Item Name Only

**File:** `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx`
**Lines:** 382-424, 552-567
**Story Points:** 0.5

#### Current Behavior:
- `handleSave` captures `currentItem.itemName` which may include article title
- `SuccessOverlay` displays this combined value under the QR code

#### Required Changes:
1. Update `handleSave` to capture `specificItem` for QR code label
2. Ensure `SuccessOverlay` receives physical item name only

#### Implementation:

Update handleSave (lines 552-567):
```typescript
const handleSave = useCallback(async () => {
  // Use specificItem for QR code label (physical item name only)
  // Falls back to itemName for backward compatibility
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

#### Verification:
- [ ] QR code success overlay shows item name only (e.g., "Cabinets")
- [ ] QR code success overlay does NOT show article title (e.g., NOT "How to Clean - Cabinets")
- [ ] Backward compatible with existing data that uses `itemName`

---

### Task 5.3.6: Update PreviewSaveStepProps Interface

**File:** `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx`
**Lines:** 65-88
**Story Points:** 0.5

#### Current Interface (lines 65-88):
```typescript
export interface PreviewSaveStepProps {
  currentItem: CurrentItemState;
  onUpdateItemName: (name: string) => void;
  onUpdateTags: (tags: string[]) => void;
  // ... other props
}
```

#### Required Changes:
Add optional `onUpdateArticleTitle` callback:

```typescript
export interface PreviewSaveStepProps {
  /** Current item state from workflow */
  currentItem: CurrentItemState;
  /** Callback when physical item name changes (for QR code label) */
  onUpdateItemName: (name: string) => void;
  /** Callback when article title changes (optional) */
  onUpdateArticleTitle?: (title: string) => void;
  /** Callback when tags change (REQ-177) */
  onUpdateTags: (tags: string[]) => void;
  // ... rest of existing props unchanged
}
```

#### Verification:
- [ ] Interface includes `onUpdateArticleTitle` as optional prop
- [ ] JSDoc comments document prop purposes
- [ ] TypeScript compiles without errors

---

### Task 5.3.7: Wire onUpdateArticleTitle Callback

**File:** `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx`
**Lines:** 430-442, 634-639
**Story Points:** 0.5

#### Required Changes:
1. Accept `onUpdateArticleTitle` in component destructuring
2. Pass to `ItemDetailsSection`

#### Implementation:

Update component signature (line 430):
```typescript
export function PreviewSaveStep({
  currentItem,
  onUpdateItemName,
  onUpdateArticleTitle,  // NEW
  onUpdateTags,
  // ... rest unchanged
}: PreviewSaveStepProps) {
```

Update ItemDetailsSection call (around line 634):
```typescript
<ItemDetailsSection
  currentItem={currentItem}
  onUpdateItemName={onUpdateItemName}
  onUpdateArticleTitle={onUpdateArticleTitle}
  onUpdateTags={onUpdateTags}
  disabled={isSaving}
/>
```

#### Verification:
- [ ] `onUpdateArticleTitle` prop accepted by component
- [ ] `onUpdateArticleTitle` passed to `ItemDetailsSection`
- [ ] Component renders without errors when prop is undefined

---

## Testing Tasks

### Task 5.3.8: Add Unit Tests for Item Name Field

**File:** `src/components/ItemCreationWorkflow/components/steps/__tests__/PreviewSaveStep.test.tsx`
**Story Points:** 1

#### Test Cases to Add:

```typescript
describe('PreviewSaveStep - Item/Article Separation', () => {
  // Test fixture with proper currentArticle structure
  const mockItemWithArticle: CurrentItemState = {
    room: 'kitchen',
    itemType: 'appliance',
    specificItem: 'Cabinets',
    itemName: 'How to Clean - Cabinets',  // Legacy combined name
    currentArticle: {
      title: 'How to Clean',
      purpose: 'how-to-clean',
      content: [mockVideoContent],
    },
    purpose: 'how-to-clean',
    contentSource: 'create-new',
    contentType: 'video',
    content: [mockVideoContent],
    tags: ['kitchen', 'cleaning'],
  };

  it('displays Item Name field with specificItem value', () => {
    render(<PreviewSaveStep {...defaultProps} currentItem={mockItemWithArticle} />);

    // Find input by its value - should show "Cabinets" not "How to Clean - Cabinets"
    const itemNameInput = screen.getByDisplayValue('Cabinets');
    expect(itemNameInput).toBeInTheDocument();
  });

  it('displays Item Name helper text about QR code label', () => {
    render(<PreviewSaveStep {...defaultProps} currentItem={mockItemWithArticle} />);

    expect(screen.getByText(/appears on QR code label/i)).toBeInTheDocument();
  });

  it('displays Article Title field with purpose-derived title', () => {
    render(<PreviewSaveStep {...defaultProps} currentItem={mockItemWithArticle} />);

    // Should show "How to Clean" as article title
    const articleTitleInput = screen.getByDisplayValue('How to Clean');
    expect(articleTitleInput).toBeInTheDocument();
  });

  it('shows visual separation between Item and Article sections', () => {
    render(<PreviewSaveStep {...defaultProps} currentItem={mockItemWithArticle} />);

    expect(screen.getByText(/physical item/i)).toBeInTheDocument();
    expect(screen.getByText(/article.*instructions/i)).toBeInTheDocument();
  });

  it('calls onUpdateItemName when Item Name field changes', async () => {
    const onUpdateItemName = vi.fn();
    render(
      <PreviewSaveStep
        {...defaultProps}
        currentItem={mockItemWithArticle}
        onUpdateItemName={onUpdateItemName}
      />
    );

    const itemNameInput = screen.getByDisplayValue('Cabinets');
    await userEvent.clear(itemNameInput);
    await userEvent.type(itemNameInput, 'New Item Name');

    expect(onUpdateItemName).toHaveBeenCalled();
  });
});
```

#### Verification:
- [ ] All new test cases pass
- [ ] Tests verify Item Name displays `specificItem`
- [ ] Tests verify Article Title displays purpose-derived title
- [ ] Tests verify visual section separation

---

### Task 5.3.9: Add Unit Tests for QR Code Label

**File:** `src/components/ItemCreationWorkflow/components/steps/__tests__/PreviewSaveStep.test.tsx`
**Story Points:** 0.5

#### Test Cases to Add:

```typescript
describe('PreviewSaveStep - QR Code Success Display', () => {
  it('shows only item name in QR code success overlay', async () => {
    const mockOnSave = vi.fn().mockResolvedValue({
      id: 'item-123',
      qrCodeUrl: 'data:image/png;base64,mockQRCode'
    });

    render(
      <PreviewSaveStep
        {...defaultProps}
        currentItem={{
          ...mockItemWithArticle,
          specificItem: 'Cabinets',
          itemName: 'How to Clean - Cabinets',
        }}
        onSave={mockOnSave}
      />
    );

    // Click save button
    const saveButton = screen.getByRole('button', { name: /save item/i });
    await userEvent.click(saveButton);

    // Wait for success overlay
    await waitFor(() => {
      expect(screen.getByText('Item Saved!')).toBeInTheDocument();
    });

    // QR code label should show "Cabinets" not "How to Clean - Cabinets"
    expect(screen.getByText('Cabinets')).toBeInTheDocument();
    expect(screen.queryByText('How to Clean - Cabinets')).not.toBeInTheDocument();
  });
});
```

#### Verification:
- [ ] Test verifies QR label shows item name only
- [ ] Test confirms article title NOT in QR label

---

### Task 5.3.10: Add Accessibility Tests

**File:** `src/components/ItemCreationWorkflow/components/steps/__tests__/PreviewSaveStep.a11y.test.tsx`
**Story Points:** 0.5

#### Test Cases to Add:

```typescript
describe('PreviewSaveStep - Item/Article Separation Accessibility', () => {
  it('has proper ARIA labels for Item Name field', () => {
    render(<PreviewSaveStep {...defaultProps} currentItem={mockItemWithArticle} />);

    const itemNameInput = screen.getByLabelText(/item name/i);
    expect(itemNameInput).toBeInTheDocument();
    expect(itemNameInput).toHaveAttribute('id', 'item-name-input');
  });

  it('has proper ARIA labels for Article Title field', () => {
    render(<PreviewSaveStep {...defaultProps} currentItem={mockItemWithArticle} />);

    const articleTitleInput = screen.getByLabelText(/article title/i);
    expect(articleTitleInput).toBeInTheDocument();
    expect(articleTitleInput).toHaveAttribute('id', 'article-title-input');
  });

  it('section headings are keyboard navigable', () => {
    render(<PreviewSaveStep {...defaultProps} currentItem={mockItemWithArticle} />);

    // Verify headings exist for screen reader navigation
    expect(screen.getByRole('heading', { name: /item details/i })).toBeInTheDocument();
  });
});
```

#### Verification:
- [ ] All accessibility tests pass
- [ ] ARIA labels properly associated with inputs
- [ ] Section headings provide navigation landmarks

---

## Integration Notes

### Parent Component Wiring (Future Task)

The `onUpdateArticleTitle` callback will need to be wired in:
- `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`
- May require new action type `SET_ARTICLE_TITLE` in `WorkflowAction` union

This is documented as Task 5.3.5 in the overview but deferred if Task 5.2 (CurrentItemState restructure) is not yet complete. The current implementation makes `onUpdateArticleTitle` optional to maintain backward compatibility.

### Backward Compatibility

- `specificItem` field already exists in `CurrentItemState`
- `currentArticle` object exists from Task 5.2 (REQ-208)
- Legacy `itemName` and `content` fields retained for backward compatibility
- QR code label logic falls back to `itemName` if `specificItem` not available

---

## Acceptance Criteria Checklist

| Criteria | Task | Status |
|----------|------|--------|
| PreviewSaveStep displays an "Item Name" field showing the physical item name | Task 5.3.2 | [x] |
| PreviewSaveStep displays an "Article Title" field showing the purpose-derived title | Task 5.3.3 | [x] |
| QR code preview section shows only the item name | Task 5.3.5 | [x] |
| Visual layout clearly distinguishes item vs article properties | Task 5.3.4 | [x] |
| Field labels use consistent terminology | Tasks 5.3.2, 5.3.3 | [x] |
| Distinction clear on desktop and mobile layouts | Task 5.3.4 | [x] |
| Helper text refers to "Item Name" for QR code label | Task 5.3.2 | [x] |
| Review step reflects data to be saved | Task 5.3.5 | [x] |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Type errors from interface changes | Props are optional with fallbacks |
| Breaking existing tests | Update test fixtures with new structure |
| Parent component not passing callback | `onUpdateArticleTitle` optional, UI graceful when undefined |
| Mobile layout issues | Test responsive layout, use existing Tailwind patterns |

---

## References

- **Overview Document:** `docs/REQ-210-update-previewsavestep-display-overview.md`
- **Implementation Plan:** `docs/prd/Plan-109-FAQBNB-Review-2026-01-11b-Complete-Implementation.md`
- **Request:** `docs/gen_requests.md` (REQ-210)
- **Related Types:** `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts`
- **Component Under Modification:** `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx`
