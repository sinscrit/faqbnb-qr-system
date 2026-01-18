# Detailed Task Breakdown: REQ-179 - Update MetadataStep Field Labels

**Generated:** 2026-01-11 23:59:00
**Last Modified:** 2026-01-11 23:59:00
**Request:** REQ-179 - Update MetadataStep Field Labels for Item vs Article Clarity
**Phase:** 1 - Foundation & Critical Fixes
**Task ID:** Update MetadataStep field labels (Item Name vs Article Title)
**Parent Plan:** Plan-103-FAQBNB-Review-2026-01-11-Implementation.md
**Overview Document:** REQ-179-update-metadatastep-field-labels-item-name-vs-overview.md

---

## Summary

This document provides step-by-step implementation tasks for updating UI field labels in the MetadataStep component to properly distinguish between "Item Name" terminology. The changes are purely cosmetic/label updates - no data field names are modified.

**Goal:** Change "Title" label to "Item Name" across the ItemCapture wizard to align with the data model concept where:
- **Item** = A physical thing (e.g., "Steamer") that gets ONE QR code
- **Article** = Instructions/content about that item (e.g., "How to Clean")

---

## Authorized Files for Modification

| File | Path | Scope |
|------|------|-------|
| MetadataStep.tsx | `src/components/ItemCapture/components/steps/MetadataStep.tsx` | Labels, placeholder, helper text, validation messages, JSDoc |
| ReviewStep.tsx | `src/components/ItemCapture/components/steps/ReviewStep.tsx` | Display label in review section |
| ItemCapture.types.ts | `src/components/ItemCapture/ItemCapture.types.ts` | JSDoc comment for `title` field |

---

## Implementation Tasks

### Task 1: Update Module JSDoc Comment in MetadataStep
**File:** `src/components/ItemCapture/components/steps/MetadataStep.tsx`
**Lines:** 3-14
**Story Points:** 0.5

**Current State:**
```typescript
/**
 * MetadataStep Component
 *
 * First step in the ItemCapture wizard. Collects item metadata including:
 * - Title (required)
 * - Room (optional, with presets + custom input)
 * - Tags (optional, pill-based multi-select)
 * - Item Type (optional dropdown)
 *
 * @module ItemCapture/components/steps/MetadataStep
 * @lastModified 2026-01-08 (Label updates: Location->Room, Appliance Type->Item Type)
 */
```

**Required Changes:**
```typescript
/**
 * MetadataStep Component
 *
 * First step in the ItemCapture wizard. Collects item metadata including:
 * - Item Name (required) - the name of the physical item for QR code label
 * - Room (optional, with presets + custom input)
 * - Tags (optional, pill-based multi-select)
 * - Item Type (optional dropdown)
 *
 * @module ItemCapture/components/steps/MetadataStep
 * @lastModified 2026-01-11 (Label updates: Title->Item Name per REQ-179)
 */
```

**Verification:**
- [ ] JSDoc comment updated with correct terminology
- [ ] @lastModified date set to 2026-01-11
- [ ] REQ-179 reference included in lastModified

---

### Task 2: Update Validation Error Messages
**File:** `src/components/ItemCapture/components/steps/MetadataStep.tsx`
**Lines:** 53-58
**Story Points:** 0.5

**Current State:**
```typescript
// Title validation (required)
if (!metadata.title?.trim()) {
  errors.title = 'Title is required';
} else if (metadata.title.length > METADATA_CONSTRAINTS.title.maxLength) {
  errors.title = `Title must be ${METADATA_CONSTRAINTS.title.maxLength} characters or less`;
}
```

**Required Changes:**
```typescript
// Item Name validation (required)
if (!metadata.title?.trim()) {
  errors.title = 'Item name is required';
} else if (metadata.title.length > METADATA_CONSTRAINTS.title.maxLength) {
  errors.title = `Item name must be ${METADATA_CONSTRAINTS.title.maxLength} characters or less`;
}
```

**Verification:**
- [ ] Empty field validation shows "Item name is required"
- [ ] Max length validation shows "Item name must be..."
- [ ] Comment updated to "Item Name validation"

---

### Task 3: Update Title Label to "Item Name"
**File:** `src/components/ItemCapture/components/steps/MetadataStep.tsx`
**Lines:** 341-346
**Story Points:** 0.5

**Current State:**
```typescript
<label
  htmlFor={titleId}
  className="block text-sm font-medium text-gray-700 mb-2"
>
  Title <span className="text-red-500">*</span>
</label>
```

**Required Changes:**
```typescript
<label
  htmlFor={titleId}
  className="block text-sm font-medium text-gray-700 mb-2"
>
  Item Name <span className="text-red-500">*</span>
</label>
```

**Verification:**
- [ ] Label displays "Item Name" with required asterisk
- [ ] Label styling matches other form fields
- [ ] Accessibility: htmlFor links to correct input

---

### Task 4: Update Placeholder Text
**File:** `src/components/ItemCapture/components/steps/MetadataStep.tsx`
**Line:** 354
**Story Points:** 0.5

**Current State:**
```typescript
placeholder="Enter item title..."
```

**Required Changes:**
```typescript
placeholder="e.g., Steamer, Oven, Coffee Machine"
```

**Verification:**
- [ ] Placeholder shows example item names
- [ ] Placeholder text is helpful and descriptive
- [ ] Input field displays placeholder correctly when empty

---

### Task 5: Add Helper Text Below Item Name Field
**File:** `src/components/ItemCapture/components/steps/MetadataStep.tsx`
**Lines:** 376-378 (insert before character counter)
**Story Points:** 0.5

**Current State:**
```typescript
<p className="text-gray-500 text-xs mt-1">
  {metadata.title.length}/{METADATA_CONSTRAINTS.title.maxLength} characters
</p>
```

**Required Changes:**
```typescript
<p className="text-gray-500 text-xs mt-1">
  The name of the physical item. This will appear on the QR code label.
</p>
<p className="text-gray-400 text-xs mt-0.5">
  {metadata.title.length}/{METADATA_CONSTRAINTS.title.maxLength} characters
</p>
```

**Verification:**
- [ ] Helper text displays below input field
- [ ] Helper text uses text-gray-500, text-xs styling
- [ ] Character counter still displays correctly
- [ ] Character counter uses slightly lighter gray (text-gray-400)
- [ ] Spacing between elements is appropriate (mt-1, mt-0.5)

---

### Task 6: Update ReviewStep Label to "Item Name"
**File:** `src/components/ItemCapture/components/steps/ReviewStep.tsx`
**Lines:** 420-426
**Story Points:** 0.5

**Current State:**
```typescript
{/* Title */}
<div>
  <dt className="text-sm font-medium text-gray-500">Title</dt>
  <dd className="mt-1 text-sm text-gray-900">
    {metadata.title.trim() || <span className="text-gray-400">&mdash;</span>}
  </dd>
</div>
```

**Required Changes:**
```typescript
{/* Item Name */}
<div>
  <dt className="text-sm font-medium text-gray-500">Item Name</dt>
  <dd className="mt-1 text-sm text-gray-900">
    {metadata.title.trim() || <span className="text-gray-400">&mdash;</span>}
  </dd>
</div>
```

**Verification:**
- [ ] Review summary shows "Item Name" label
- [ ] Comment updated to "Item Name"
- [ ] Data binding unchanged (still uses metadata.title)
- [ ] Layout and styling preserved

---

### Task 7: Update Type Documentation Comment
**File:** `src/components/ItemCapture/ItemCapture.types.ts`
**Lines:** 261-263
**Story Points:** 0.5

**Current State:**
```typescript
export interface ItemMetadata {
  /** User-provided title */
  title: string;
```

**Required Changes:**
```typescript
export interface ItemMetadata {
  /** Item name - the name of the physical item (displayed on QR code label) */
  title: string;
```

**Verification:**
- [ ] JSDoc comment clarifies that title represents item name
- [ ] Comment explains QR code label connection
- [ ] Field name `title` remains unchanged (no breaking changes)

---

## Testing Tasks

### Task 8: Functional Testing - MetadataStep
**Story Points:** 0.5

**Test Cases:**
- [ ] Navigate to ItemCapture wizard
- [ ] Verify "Item Name" label displays with red asterisk
- [ ] Verify placeholder shows "e.g., Steamer, Oven, Coffee Machine"
- [ ] Verify helper text displays: "The name of the physical item. This will appear on the QR code label."
- [ ] Verify character counter still functions (shows X/100 characters)
- [ ] Clear the field and try to proceed - verify error shows "Item name is required"
- [ ] Enter 101+ characters - verify error shows "Item name must be 100 characters or less"

---

### Task 9: Functional Testing - ReviewStep
**Story Points:** 0.5

**Test Cases:**
- [ ] Complete MetadataStep with an item name (e.g., "Coffee Machine")
- [ ] Navigate through wizard to ReviewStep
- [ ] Verify "Item Details" section shows "Item Name" label
- [ ] Verify entered name displays correctly next to label
- [ ] Verify clicking Edit navigates back to MetadataStep

---

### Task 10: Visual/UI Testing
**Story Points:** 0.5

**Test Cases:**
- [ ] Verify label styling matches other form fields (font-medium, text-gray-700)
- [ ] Verify helper text styling (text-gray-500, text-xs)
- [ ] Verify character counter styling (text-gray-400, text-xs)
- [ ] Verify no layout shifts or spacing issues
- [ ] Test on mobile viewport (375px width) - verify layout remains intact
- [ ] Test on tablet viewport (768px width)
- [ ] Verify error state styling (border-red-300, bg-red-50) still works

---

### Task 11: Accessibility Verification
**Story Points:** 0.5

**Test Cases:**
- [ ] Verify label is properly associated with input (htmlFor={titleId})
- [ ] Verify aria-required="true" is present on input
- [ ] Verify aria-invalid updates correctly on validation errors
- [ ] Verify aria-describedby links to error message when present
- [ ] Test keyboard navigation: Tab to field, enter text, Tab away
- [ ] Verify screen reader announces "Item Name, required" (or similar)
- [ ] Verify validation error is announced via role="alert"

---

### Task 12: Regression Testing
**Story Points:** 0.5

**Test Cases:**
- [ ] Complete full ItemCapture workflow (MetadataStep → ContentType → Capture → Review → Submit)
- [ ] Verify item name value persists across step navigation
- [ ] Verify form submission includes correct title value in ItemRecord
- [ ] Verify back navigation preserves entered item name
- [ ] Check browser console for any errors
- [ ] Verify no TypeScript compilation errors (npm run build)

---

## Task Summary Table

| Task # | Description | File | Story Points | Status |
|--------|-------------|------|--------------|--------|
| 1 | Update module JSDoc comment | MetadataStep.tsx | 0.5 | [ ] |
| 2 | Update validation error messages | MetadataStep.tsx | 0.5 | [ ] |
| 3 | Update Title label to "Item Name" | MetadataStep.tsx | 0.5 | [ ] |
| 4 | Update placeholder text | MetadataStep.tsx | 0.5 | [ ] |
| 5 | Add helper text below field | MetadataStep.tsx | 0.5 | [ ] |
| 6 | Update ReviewStep label | ReviewStep.tsx | 0.5 | [ ] |
| 7 | Update type documentation | ItemCapture.types.ts | 0.5 | [ ] |
| 8 | Functional testing - MetadataStep | - | 0.5 | [ ] |
| 9 | Functional testing - ReviewStep | - | 0.5 | [ ] |
| 10 | Visual/UI testing | - | 0.5 | [ ] |
| 11 | Accessibility verification | - | 0.5 | [ ] |
| 12 | Regression testing | - | 0.5 | [ ] |
| **Total** | | | **6.0** | |

---

## Dependencies

### Upstream Dependencies
- None - This is a foundational task that can start immediately

### Downstream Blocks
- **Task 1.2:** Add helper text explaining Item = physical thing (partially covered by Task 5)
- **Phase 2 Tasks (REQ-3 & REQ-5):** Post-workflow menu uses correct "Item Name" terminology
- **Phase 3 Tasks (REQ-1):** Dashboard card labels may reference item terminology

---

## Parallel Execution Safety

**Files Modified by This Task:**
- `src/components/ItemCapture/components/steps/MetadataStep.tsx`
- `src/components/ItemCapture/components/steps/ReviewStep.tsx`
- `src/components/ItemCapture/ItemCapture.types.ts`

**Safe to Run in Parallel With:**
- REQ-1 (Dashboard Cards) - different component files
- REQ-4 (Navigation Menu) - different component files
- Task 1.3 (Verify QR code label uses Item Name) - different file (pdf-generator.ts)

**Conflicts With (Run Sequentially):**
- Task 1.2 (Add helper text) - overlaps with MetadataStep.tsx
- Task 1.4 (Update type documentation) - overlaps with ItemCapture.types.ts
- REQ-3/REQ-5 workflow changes if they modify ReviewStep.tsx

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Field name `title` vs display "Item Name" confusion | Low | Low | JSDoc comments explain the distinction |
| Internationalization impact | Medium | Low | i18n not currently implemented; labels are hardcoded |
| Test failures from changed error messages | Low | Low | Update any tests that check specific error message text |
| Mobile layout issues | Low | Medium | Test on mobile viewports in Task 10 |

---

## Implementation Notes

1. **Data Field Naming Convention:** The underlying field remains `title` in the code to avoid breaking changes. Only the UI label changes to "Item Name".

2. **Consistency:** After this change, the workflow should consistently use:
   - "Item Name" - for the physical item (e.g., "Steamer")
   - "Article" or "Instructions" - for content about the item (future enhancement)

3. **QR Code Integration:** The helper text explicitly mentions the QR code label to help users understand what this field is for.

4. **Character Counter Styling:** Changed from text-gray-500 to text-gray-400 to create visual hierarchy with the more important helper text above it.

---

## References

- [Overview Document](docs/REQ-179-update-metadatastep-field-labels-item-name-vs-overview.md)
- [Implementation Plan](docs/prd/Plan-103-FAQBNB-Review-2026-01-11-Implementation.md)
- [MetadataStep Component](src/components/ItemCapture/components/steps/MetadataStep.tsx)
- [ReviewStep Component](src/components/ItemCapture/components/steps/ReviewStep.tsx)
- [ItemCapture Types](src/components/ItemCapture/ItemCapture.types.ts)
