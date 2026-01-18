# Implementation Breakdown: REQ-2 Task 0.1 - Update MetadataStep Title Label to Item Name

**Generated:** 2026-01-11 23:58:00 UTC
**Last Modified:** 2026-01-11 23:58:00 UTC
**Request:** REQ-2 - Fix Data Model (Item vs Article Separation)
**Phase:** 0 - REQ-2 (CRITICAL)
**Task ID:** 0.1
**Parent Plan:** Plan-104-FAQBNB-Review-2026-01-11-Implementation.md

---

## Overview

This task updates the "Title" label in the MetadataStep component to "Item Name" to properly distinguish between Item and Article terminology. This is part of the CRITICAL data model fix (REQ-2) that establishes the correct terminology foundation for the entire application.

### Data Model Context

| Concept | Description | Example |
|---------|-------------|---------|
| **Item** | A physical thing. Gets ONE QR code. | Fridge, Oven, Steamer |
| **Article** | Instructions/content about an item. Multiple per item. | "How to Clean", "How to Turn Off" |
| **QR Code** | ONE per Item (not per article) | Scan "Fridge" -> see all articles |

The current UI shows "Title" which is ambiguous. Users may confuse this with Article Title (e.g., "How to Clean - Steamer"). The change to "Item Name" makes it explicit that this field captures the physical item name (e.g., "Steamer").

---

## Current State Analysis

### MetadataStep Component
**File:** `src/components/ItemCapture/components/steps/MetadataStep.tsx`
**Last Modified:** 2026-01-08

#### Title Field Label (Lines 340-346)
```typescript
{/* Title Field (Required) */}
<div>
  <label
    htmlFor={titleId}
    className="block text-sm font-medium text-gray-700 mb-2"
  >
    Title <span className="text-red-500">*</span>
  </label>
```

#### Placeholder Text (Line 354)
```typescript
placeholder="Enter item title..."
```

#### Character Counter (Lines 376-378)
```typescript
<p className="text-gray-500 text-xs mt-1">
  {metadata.title.length}/{METADATA_CONSTRAINTS.title.maxLength} characters
</p>
```

There is currently no helper text explaining what should be entered in this field.

### Validation Error Messages (Lines 53-58)
```typescript
// Title validation (required)
if (!metadata.title?.trim()) {
  errors.title = 'Title is required';
} else if (metadata.title.length > METADATA_CONSTRAINTS.title.maxLength) {
  errors.title = `Title must be ${METADATA_CONSTRAINTS.title.maxLength} characters or less`;
}
```

---

## Required Changes Summary

| Change | Location | Description |
|--------|----------|-------------|
| Label Text | Line 345 | "Title" -> "Item Name" |
| Placeholder | Line 354 | "Enter item title..." -> "Enter item name..." |
| Helper Text | After line 375 | Add: "The physical item this QR code will be attached to" |
| Error Messages | Lines 55, 57 | "Title is required" -> "Item name is required" |

---

## Implementation Tasks

### Task 0.1.1: Update Label Text
**File:** `src/components/ItemCapture/components/steps/MetadataStep.tsx`
**Line:** 345
**Effort:** 0.05 hours

**Current:**
```typescript
Title <span className="text-red-500">*</span>
```

**Target:**
```typescript
Item Name <span className="text-red-500">*</span>
```

---

### Task 0.1.2: Update Placeholder Text
**File:** `src/components/ItemCapture/components/steps/MetadataStep.tsx`
**Line:** 354
**Effort:** 0.05 hours

**Current:**
```typescript
placeholder="Enter item title..."
```

**Target:**
```typescript
placeholder="Enter item name... (e.g., Steamer, Coffee Maker)"
```

---

### Task 0.1.3: Add Helper Text
**File:** `src/components/ItemCapture/components/steps/MetadataStep.tsx`
**Location:** After the error message block (line 375), before the character counter
**Effort:** 0.1 hours

**Add helper text to clarify the field purpose:**
```typescript
{/* Helper text explaining Item Name */}
<p className="text-gray-500 text-xs mt-1">
  The physical item this QR code will be attached to
</p>
<p className="text-gray-400 text-xs mt-0.5">
  {metadata.title.length}/{METADATA_CONSTRAINTS.title.maxLength} characters
</p>
```

---

### Task 0.1.4: Update Validation Error Messages
**File:** `src/components/ItemCapture/components/steps/MetadataStep.tsx`
**Lines:** 53-58
**Effort:** 0.05 hours

**Current:**
```typescript
// Title validation (required)
if (!metadata.title?.trim()) {
  errors.title = 'Title is required';
} else if (metadata.title.length > METADATA_CONSTRAINTS.title.maxLength) {
  errors.title = `Title must be ${METADATA_CONSTRAINTS.title.maxLength} characters or less`;
}
```

**Target:**
```typescript
// Item Name validation (required)
if (!metadata.title?.trim()) {
  errors.title = 'Item name is required';
} else if (metadata.title.length > METADATA_CONSTRAINTS.title.maxLength) {
  errors.title = `Item name must be ${METADATA_CONSTRAINTS.title.maxLength} characters or less`;
}
```

---

### Task 0.1.5: Update Component JSDoc Comment
**File:** `src/components/ItemCapture/components/steps/MetadataStep.tsx`
**Lines:** 3-14
**Effort:** 0.05 hours

**Current:**
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

**Target:**
```typescript
/**
 * MetadataStep Component
 *
 * First step in the ItemCapture wizard. Collects item metadata including:
 * - Item Name (required) - the physical item this QR code will be attached to
 * - Room (optional, with presets + custom input)
 * - Tags (optional, pill-based multi-select)
 * - Item Type (optional dropdown)
 *
 * @module ItemCapture/components/steps/MetadataStep
 * @lastModified 2026-01-11 (REQ-2 Task 0.1: Title->Item Name label change)
 */
```

---

## Authorized Files and Functions for Modification

| File | Scope | Functions/Sections |
|------|-------|-------------------|
| `src/components/ItemCapture/components/steps/MetadataStep.tsx` | MODIFY | JSDoc comment (lines 3-14), `validateMetadata()` function (lines 50-79), Title label element (line 345), placeholder attribute (line 354), helper text area (lines 375-378) |

### Specific Line Ranges

| File | Line(s) | Change Description |
|------|---------|-------------------|
| `MetadataStep.tsx` | 3-14 | Update module JSDoc comment |
| `MetadataStep.tsx` | 53-58 | Update validation error messages |
| `MetadataStep.tsx` | 345 | Change "Title" label to "Item Name" |
| `MetadataStep.tsx` | 354 | Update placeholder text |
| `MetadataStep.tsx` | 375-378 | Add helper text before character counter |

---

## Dependencies

### Depends On (upstream)
<!-- Tasks that MUST complete before this task can start -->
- None - This is the foundational task in Phase 0 and can start immediately

### Blocks (downstream)
<!-- Tasks that cannot start until this task completes -->
- **Task 0.2:** Update ReviewStep.tsx - Change summary label from "Title" to "Item Name" (uses same terminology established here)
- **Task 0.3:** Update type documentation in ItemCapture.types.ts (JSDoc comments should match UI terminology)
- **Task 0.4:** Verify QR code generation uses Item Name correctly (label source clarification)
- **Phase 1 Tasks (REQ-5):** Step count fix depends on correct data model terminology
- **Phase 2 Tasks (REQ-3):** Post-workflow menu uses correct "Item Name" terminology
- **Phase 3 Tasks (REQ-1):** Dashboard cards may reference item terminology

### Parallel Safety
- **Files touched:**
  - `src/components/ItemCapture/components/steps/MetadataStep.tsx`
- **Conflicts with:**
  - Task 0.2 (ReviewStep.tsx) - Different file, NO conflict
  - Task 0.3 (ItemCapture.types.ts) - Different file, NO conflict
  - Task 0.4 (QR code verification) - Different file, NO conflict
  - REQ-179 Tasks - SAME file MetadataStep.tsx, POTENTIAL CONFLICT
- **Safe to parallelize with:**
  - Task 0.2, 0.3, 0.4 in Phase 0 (all touch different files)
  - Phase 3 Tasks (REQ-1 - UserDashboard.tsx, KPIDashboardOverview.tsx)
  - Phase 4 Tasks (REQ-4 - RoleBasedNavigation.tsx, dashboard/layout.tsx)

**Recommendation:** Execute Task 0.1 first and complete it before moving to Task 0.2, 0.3, 0.4 as they depend on the terminology established here. Tasks 0.2, 0.3, 0.4 can then run in parallel.

---

## Testing Requirements

### Functional Testing
- [ ] MetadataStep displays "Item Name" label for the first required field
- [ ] Placeholder text shows: "Enter item name... (e.g., Steamer, Coffee Maker)"
- [ ] Helper text appears below the input field
- [ ] Validation error shows "Item name is required" when field is empty
- [ ] Character counter still functions correctly
- [ ] Form submission works with the renamed field

### Visual Testing
- [ ] Label styling matches other form fields (font-medium, text-gray-700)
- [ ] Helper text has appropriate color (text-gray-500) and size (text-xs)
- [ ] No layout shifts or spacing issues introduced
- [ ] Mobile view displays correctly

### Regression Testing
- [ ] Form submission still works correctly
- [ ] Title/name value is properly stored in state (field name remains `title`)
- [ ] Existing validation logic still functions
- [ ] No errors in browser console

### Cross-Browser Testing
- [ ] Chrome desktop and mobile
- [ ] Safari desktop and mobile
- [ ] Firefox desktop

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Field name `title` vs display "Item Name" confusion | Low | Low | Update JSDoc comments to explain the mapping |
| Test failures from changed error messages | Low | Low | Search for and update any tests checking specific error text |
| Overlapping changes with REQ-179 | Medium | Medium | Coordinate with REQ-179 implementation; may need to merge changes |
| Regression in form validation | Low | Medium | Run full MetadataStep test suite after changes |

---

## Implementation Notes

1. **Data Field Naming Convention:** The underlying field remains `title` in TypeScript code to avoid breaking changes. Only the UI label changes to "Item Name".

2. **QR Code Label Source:** According to the implementation plan, QR code labels should display the Item Name only (e.g., "Steamer"), not the Article title (e.g., "How to Clean - Steamer").

3. **Terminology Clarification:**
   - **Item** = Physical object (Steamer, Coffee Machine, etc.)
   - **Article** = Instructions/content about that item
   - One Item can have multiple Articles

4. **Helper Text Purpose:** The helper text "The physical item this QR code will be attached to" helps users understand that:
   - This is the name of the physical object
   - This will appear on the QR code label
   - This is NOT the article/instruction title

---

## Estimated Effort

| Task | Description | Effort |
|------|-------------|--------|
| 0.1.1 | Update label text | 0.05 hours |
| 0.1.2 | Update placeholder text | 0.05 hours |
| 0.1.3 | Add helper text | 0.1 hours |
| 0.1.4 | Update validation error messages | 0.05 hours |
| 0.1.5 | Update component JSDoc comment | 0.05 hours |
| Testing | Manual verification | 0.2 hours |
| **Total** | | **0.5 hours** |

---

## References

- [Implementation Plan](./prd/Plan-104-FAQBNB-Review-2026-01-11-Implementation.md)
- [MetadataStep Component](../src/components/ItemCapture/components/steps/MetadataStep.tsx)
- [ItemCapture Types](../src/components/ItemCapture/ItemCapture.types.ts)
- [Related REQ-179 Overview](./REQ-179-update-metadatastep-field-labels-item-name-vs-overview.md)
