# Implementation Breakdown: REQ-179 - Update MetadataStep Field Labels

**Generated:** 2026-01-11 23:45:00
**Last Modified:** 2026-01-11 23:45:00
**Request:** REQ-179 - Update MetadataStep Field Labels for Item vs Article Clarity
**Phase:** 1 - Foundation & Critical Fixes (REQ-2: Data Model Clarity)
**Task ID:** 1.1
**Parent Plan:** Plan-103-FAQBNB-Review-2026-01-11-Implementation.md

---

## Overview

This task updates field labels in the MetadataStep component to properly distinguish between "Item Name" and "Article Title" terminology. The goal is to align UI labels with the underlying data model where:
- **Item** = A physical thing (e.g., "Steamer") that gets ONE QR code
- **Article** = Instructions/content about that item (e.g., "How to Clean")

The current "Title" label is ambiguous and should be clarified to "Item Name" to match the data model intent.

## Current State Analysis

### MetadataStep Component
**File:** `src/components/ItemCapture/components/steps/MetadataStep.tsx`
**Last Modified:** 2026-01-08 (Label updates: Location->Room, Appliance Type->Item Type)

#### Current Field Labels (Lines 339-379)
```typescript
{/* Title Field (Required) */}
<label htmlFor={titleId} className="...">
  Title <span className="text-red-500">*</span>
</label>
<input
  ...
  placeholder="Enter item title..."
  ...
/>
```

#### Current Step Header (Lines 331-337)
```typescript
<h2 className="text-xl font-semibold text-gray-900">Item Details</h2>
<p className="text-sm text-gray-600 mt-1">
  Enter basic information about this item
</p>
```

### ReviewStep Component
**File:** `src/components/ItemCapture/components/steps/ReviewStep.tsx`
**Lines:** 419-426

```typescript
{/* Title */}
<div>
  <dt className="text-sm font-medium text-gray-500">Title</dt>
  <dd className="mt-1 text-sm text-gray-900">
    {metadata.title.trim() || <span className="text-gray-400">&mdash;</span>}
  </dd>
</div>
```

### Data Model Types
**File:** `src/components/ItemCapture/ItemCapture.types.ts`
**Lines:** 259-273

```typescript
export interface ItemMetadata {
  /** User-provided title */
  title: string;
  /** Optional location within property */
  location?: string;
  /** Optional tags for categorization */
  tags?: string[];
  /** Optional appliance type */
  applianceType?: ApplianceType;
}
```

The type uses `title` for the field name, which maps to `item.name` in the database schema. The label change is purely cosmetic in the UI.

---

## Implementation Tasks

### Task 1.1.1: Update Title Label to "Item Name" in MetadataStep
**File:** `src/components/ItemCapture/components/steps/MetadataStep.tsx`
**Effort:** 0.1 hours

**Current State (Lines 340-346):**
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

---

### Task 1.1.2: Update Placeholder Text in MetadataStep
**File:** `src/components/ItemCapture/components/steps/MetadataStep.tsx`
**Effort:** 0.05 hours

**Current State (Line 354):**
```typescript
placeholder="Enter item title..."
```

**Required Changes:**
```typescript
placeholder="e.g., Steamer, Oven, Coffee Machine"
```

---

### Task 1.1.3: Add Helper Text Below Item Name Field
**File:** `src/components/ItemCapture/components/steps/MetadataStep.tsx`
**Effort:** 0.1 hours

**Location:** After the error message block (around line 375), before the character counter.

**Current State (Lines 376-378):**
```typescript
<p className="text-gray-500 text-xs mt-1">
  {metadata.title.length}/{METADATA_CONSTRAINTS.title.maxLength} characters
</p>
```

**Required Changes:**
Add helper text above the character counter:
```typescript
<p className="text-gray-500 text-xs mt-1">
  The name of the physical item. This will appear on the QR code label.
</p>
<p className="text-gray-400 text-xs mt-0.5">
  {metadata.title.length}/{METADATA_CONSTRAINTS.title.maxLength} characters
</p>
```

---

### Task 1.1.4: Update Validation Error Message
**File:** `src/components/ItemCapture/components/steps/MetadataStep.tsx`
**Effort:** 0.05 hours

**Current State (Lines 53-58):**
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

---

### Task 1.1.5: Update ReviewStep Label to "Item Name"
**File:** `src/components/ItemCapture/components/steps/ReviewStep.tsx`
**Effort:** 0.05 hours

**Current State (Lines 420-426):**
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

---

### Task 1.1.6: Update Type Documentation Comment
**File:** `src/components/ItemCapture/ItemCapture.types.ts`
**Effort:** 0.05 hours

**Current State (Lines 261-263):**
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

---

### Task 1.1.7: Update Module Documentation Comment
**File:** `src/components/ItemCapture/components/steps/MetadataStep.tsx`
**Effort:** 0.05 hours

**Current State (Lines 3-13):**
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

---

## Authorized Files and Functions for Modification

| File | Scope | Functions/Sections |
|------|-------|-------------------|
| `src/components/ItemCapture/components/steps/MetadataStep.tsx` | MODIFY | JSDoc comment, `validateMetadata()`, label elements, placeholder text, helper text |
| `src/components/ItemCapture/components/steps/ReviewStep.tsx` | MODIFY | JSX label text (line 422) |
| `src/components/ItemCapture/ItemCapture.types.ts` | MODIFY | `ItemMetadata` interface JSDoc comment |

### Specific Line Ranges

| File | Line(s) | Change Description |
|------|---------|-------------------|
| `MetadataStep.tsx` | 3-14 | Update module JSDoc comment |
| `MetadataStep.tsx` | 53-58 | Update validation error messages |
| `MetadataStep.tsx` | 340-346 | Change "Title" label to "Item Name" |
| `MetadataStep.tsx` | 354 | Update placeholder text |
| `MetadataStep.tsx` | 376-378 | Add helper text and adjust character counter |
| `ReviewStep.tsx` | 420-426 | Change "Title" to "Item Name" in review display |
| `ItemCapture.types.ts` | 262 | Update JSDoc comment for title field |

---

## Dependencies

### Depends On (upstream)
- None - This is a foundational task in Phase 1 that can start immediately

### Blocks (downstream)
- **Task 1.2:** Add helper text explaining Item = physical thing - Partially overlaps (helper text in this task)
- **Phase 2 Tasks (REQ-3 & REQ-5):** Post-workflow menu uses correct "Item Name" terminology
- **Phase 3 Tasks (REQ-1):** Dashboard card labels may reference item terminology

### Parallel Safety
- **Files touched:**
  - `src/components/ItemCapture/components/steps/MetadataStep.tsx`
  - `src/components/ItemCapture/components/steps/ReviewStep.tsx`
  - `src/components/ItemCapture/ItemCapture.types.ts`
- **Conflicts with:**
  - Task 1.2 (Add helper text) - touches MetadataStep.tsx (helper text section)
  - Task 1.4 (Update type documentation) - touches ItemCapture.types.ts
- **Safe to parallelize with:**
  - Task 1.3 (Verify QR code label) - different files (pdf-generator.ts)
  - Task 1.5 (Test item creation) - testing task, runs after implementation
  - Phase 3 Tasks (REQ-1, REQ-4) - different component files

**Recommendation:** Execute Tasks 1.1, 1.2, and 1.4 sequentially as they touch overlapping files, or consolidate them into a single implementation session.

---

## Testing Requirements

### Functional Testing
- [ ] MetadataStep displays "Item Name" label for the first required field
- [ ] Placeholder text shows example items: "e.g., Steamer, Oven, Coffee Machine"
- [ ] Helper text appears below the input: "The name of the physical item..."
- [ ] Validation error shows "Item name is required" when field is empty
- [ ] Character counter still functions correctly
- [ ] ReviewStep displays "Item Name" label in the summary section

### Visual Testing
- [ ] Label styling matches other form fields (font-medium, text-gray-700)
- [ ] Helper text has appropriate color (text-gray-500) and size (text-xs)
- [ ] No layout shifts or spacing issues introduced
- [ ] Mobile view displays correctly

### Regression Testing
- [ ] Form submission still works correctly
- [ ] Title/name value is properly stored in state
- [ ] Existing validation logic still functions
- [ ] No errors in browser console

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Field name `title` vs display "Item Name" confusion | Low | Low | Add JSDoc comments explaining the distinction |
| Internationalization impact | Medium | Medium | Note: i18n not currently implemented; labels are hardcoded |
| Test failures from changed error messages | Low | Low | Update any tests that check specific error message text |

---

## Notes

1. **Data Field Naming Convention:** The underlying field remains `title` in the code to avoid breaking changes. Only the UI label changes to "Item Name".

2. **QR Code Label Source:** According to the implementation plan, QR code labels should use `item.name` from the database, which corresponds to `metadata.title` in the wizard state.

3. **Future Enhancement:** Consider adding an "Article Title" or "Purpose" field in a subsequent step to capture article-level metadata (e.g., "How to Clean", "Troubleshooting Guide").

4. **Terminology Clarification:**
   - **Item** = Physical object (Steamer, Coffee Machine, etc.)
   - **Article** = Instructions/content about that item
   - One Item can have multiple Articles

---

## References

- [Implementation Plan](/Users/shinyqk/Documents/mastuff/proj/ai_stuff/aibnb/faqbnb_manus/docs/prd/Plan-103-FAQBNB-Review-2026-01-11-Implementation.md)
- [Request Definition](/Users/shinyqk/Documents/mastuff/proj/ai_stuff/aibnb/faqbnb_manus/docs/gen_requests.md#req-179)
- [MetadataStep Component](/Users/shinyqk/Documents/mastuff/proj/ai_stuff/aibnb/faqbnb_manus/src/components/ItemCapture/components/steps/MetadataStep.tsx)
- [ReviewStep Component](/Users/shinyqk/Documents/mastuff/proj/ai_stuff/aibnb/faqbnb_manus/src/components/ItemCapture/components/steps/ReviewStep.tsx)
- [ItemCapture Types](/Users/shinyqk/Documents/mastuff/proj/ai_stuff/aibnb/faqbnb_manus/src/components/ItemCapture/ItemCapture.types.ts)
