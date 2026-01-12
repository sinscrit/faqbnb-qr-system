# Implementation Breakdown: REQ-181 - Update MetadataStep Labels and Help Text

**Generated:** 2026-01-11 16:30:00
**Last Modified:** 2026-01-11 16:30:00
**Request:** REQ-181 - Enhance MetadataStep Placeholder and Error Messaging for Physical Item Clarity
**Phase:** 0 - REQ-2 - Data Model UI Clarification
**Task ID:** 0.1
**Parent Plan:** Plan-105-FAQBNB-Review-2026-01-11-Comprehensive-Implementation.md

---

## Overview

This task enhances the MetadataStep component to provide clearer guidance distinguishing between "Item" (physical object) and "Article" (instructional content). The changes include:
1. Enhanced placeholder text emphasizing physical item names only
2. Helper text explaining the Item vs Article distinction
3. Error messages that consistently reference "Item name" instead of "Title"

This is part of Phase 0 (REQ-2) which establishes the foundational terminology used throughout subsequent phases.

---

## Current State Analysis

### MetadataStep Component (src/components/ItemCapture/components/steps/MetadataStep.tsx)

**Current Placeholder Text (line ~354):**
```tsx
placeholder="Enter item name... (e.g., Steamer, Coffee Maker)"
```
- Status: GOOD - Already shows physical item examples
- Enhancement: Could be more emphatic about physical-only names

**Current Helper Text (lines ~376-379):**
```tsx
{/* Helper text explaining Item Name purpose */}
<p className="text-gray-500 text-xs mt-1">
  The physical item this QR code will be attached to
</p>
```
- Status: PARTIAL - Mentions physical item but lacks Item vs Article explanation
- Enhancement: Add second line explaining article distinction

**Current Error Messages (lines ~50-58):**
```tsx
// Item Name validation (required)
if (!metadata.title?.trim()) {
  errors.title = 'Item name is required';
} else if (metadata.title.length > METADATA_CONSTRAINTS.title.maxLength) {
  errors.title = `Item name must be ${METADATA_CONSTRAINTS.title.maxLength} characters or less`;
}
```
- Status: GOOD - Already uses "Item name" terminology
- Enhancement: Verify all error paths use consistent terminology

**Current Label (line ~345):**
```tsx
<label htmlFor={titleId} className="...">
  Item Name <span className="text-red-500">*</span>
</label>
```
- Status: GOOD - Label already changed from "Title" to "Item Name" (REQ-2 Task 0.1 applied previously)

### Related File: ReviewStep.tsx

**Current Label (lines ~420-425):**
```tsx
{/* Title */}
<div>
  <dt className="text-sm font-medium text-gray-500">Title</dt>
  <dd className="mt-1 text-sm text-gray-900">
    {metadata.title.trim() || <span className="text-gray-400">&mdash;</span>}
  </dd>
</div>
```
- Status: NEEDS UPDATE - Still shows "Title" instead of "Item Name"
- Note: This is tracked as Task 0.2 in the implementation plan; this overview focuses on Task 0.1

---

## Implementation Tasks

### Task 0.1.1: Enhance Placeholder Text
**File:** `src/components/ItemCapture/components/steps/MetadataStep.tsx`
**Lines:** ~354
**Effort:** 0.05 hours

**Current State:**
```tsx
placeholder="Enter item name... (e.g., Steamer, Coffee Maker)"
```

**Required Change:**
```tsx
placeholder="e.g., Steamer, Coffee Maker, Hair Dryer"
```

**Rationale:**
- Remove redundant "Enter item name..." prefix - the label already says "Item Name"
- Focus entirely on concrete physical item examples
- Examples are all physical objects, reinforcing the Item vs Article distinction

---

### Task 0.1.2: Add Expanded Helper Text
**File:** `src/components/ItemCapture/components/steps/MetadataStep.tsx`
**Lines:** ~376-379
**Effort:** 0.1 hours

**Current State:**
```tsx
{/* Helper text explaining Item Name purpose */}
<p className="text-gray-500 text-xs mt-1">
  The physical item this QR code will be attached to
</p>
```

**Required Change:**
```tsx
{/* Helper text explaining Item Name purpose */}
<p className="text-gray-500 text-xs mt-1">
  This is the name of the physical item (e.g., &apos;Steamer&apos;). Instructions like &apos;How to Clean&apos; are captured separately as articles.
</p>
```

**Design Notes:**
- Single paragraph with inline guidance
- Uses quotes around examples for clarity
- Uses HTML entities (`&apos;`) for proper JSX escaping
- Text color `text-gray-500` matches existing helper text pattern
- Font size `text-xs` matches existing pattern

---

### Task 0.1.3: Verify Error Message Consistency
**File:** `src/components/ItemCapture/components/steps/MetadataStep.tsx`
**Lines:** ~50-58 (validateMetadata function)
**Effort:** 0.05 hours

**Current State (already correct):**
```tsx
export function validateMetadata(metadata: ItemMetadata): Record<string, string> {
  const errors: Record<string, string> = {};

  // Item Name validation (required)
  if (!metadata.title?.trim()) {
    errors.title = 'Item name is required';
  } else if (metadata.title.length > METADATA_CONSTRAINTS.title.maxLength) {
    errors.title = `Item name must be ${METADATA_CONSTRAINTS.title.maxLength} characters or less`;
  }
  // ...
}
```

**Action:** Verify - no changes needed
- Both error messages already use "Item name" terminology
- Required validation says "Item name is required"
- Max length validation says "Item name must be X characters or less"

---

## Authorized Files and Functions for Modification

| File | Scope | Functions/Sections |
|------|-------|-------------------|
| `src/components/ItemCapture/components/steps/MetadataStep.tsx` | MODIFY | Input placeholder (line ~354), Helper text `<p>` element (lines ~376-379) |

### Sections NOT to Modify (in scope of this task)
| Section | Reason |
|---------|--------|
| ReviewStep.tsx "Title" label | Tracked as Task 0.2 (separate overview document) |
| validateMetadata function | Already correct - verification only |
| QR code label display | Tracked as Task 0.4 (separate overview document) |
| METADATA_CONSTRAINTS | No changes needed |

---

## Dependencies

### Depends On (upstream)
- None - This is the first task in Phase 0, the foundational phase

### Blocks (downstream)
- **Task 0.2:** Update ReviewStep to Show Correct Labels - While not technically dependent, should use same terminology
- **Phase 1 (REQ-5):** Workflow step count fix - Will reference items using correct terminology
- **Phase 2 (REQ-3):** What's Next screen - Will use Item Name terminology for saved item display

### Parallel Safety
- **Files touched:**
  - `src/components/ItemCapture/components/steps/MetadataStep.tsx` (lines ~354, ~376-379 only)
- **Conflicts with:**
  - Task 0.2 (ReviewStep labels) - Different file, no conflict
  - Task 0.4 (QR code labels) - Different files, no conflict
- **Safe to parallelize with:**
  - Phase 3 tasks (REQ-1: Dashboard cards) - Different files
  - Phase 4 tasks (REQ-4: Navigation menu) - Different files
  - All other tasks - This task modifies only MetadataStep placeholder and helper text

**Recommendation:** This task can safely run in parallel with all other tasks. No coordination required.

---

## Testing Requirements

### Visual Testing
- [ ] Placeholder text displays: "e.g., Steamer, Coffee Maker, Hair Dryer"
- [ ] Placeholder text appears in gray when field is empty
- [ ] Helper text displays the full Item vs Article explanation
- [ ] Helper text wraps properly on mobile viewports
- [ ] Helper text color (`text-gray-500`) is consistent with other helper text
- [ ] Helper text font size (`text-xs`) is consistent with character counter below

### Functional Testing
- [ ] Entering text clears the placeholder
- [ ] Empty field submission shows "Item name is required" error
- [ ] Exceeding max length shows appropriate "Item name must be..." error
- [ ] Error message styling (red text) unchanged
- [ ] Tab navigation behavior unchanged

### Accessibility Testing
- [ ] Helper text is read by screen readers after the input
- [ ] Error messages are announced when they appear (role="alert" preserved)
- [ ] aria-describedby properly links error to input field
- [ ] Color contrast of helper text meets WCAG AA standards

### Regression Testing
- [ ] Form submission still works correctly
- [ ] Form validation behavior unchanged
- [ ] No layout shifts from text changes
- [ ] Character counter still displays correctly below helper text

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Helper text too long, causing layout issues | Low | Low | Test on mobile viewport; text is short enough |
| JSX escaping issues with apostrophes | Low | Medium | Use `&apos;` HTML entities |
| Screen reader confusion with longer text | Low | Low | Keep text concise; single paragraph |
| Inconsistency with other form helper text | Low | Low | Match existing `text-gray-500 text-xs` pattern |

---

## Code Change Summary

### MetadataStep.tsx Changes

**Change 1: Placeholder Text (line ~354)**
```diff
- placeholder="Enter item name... (e.g., Steamer, Coffee Maker)"
+ placeholder="e.g., Steamer, Coffee Maker, Hair Dryer"
```

**Change 2: Helper Text (lines ~376-379)**
```diff
  {/* Helper text explaining Item Name purpose */}
  <p className="text-gray-500 text-xs mt-1">
-   The physical item this QR code will be attached to
+   This is the name of the physical item (e.g., &apos;Steamer&apos;). Instructions like &apos;How to Clean&apos; are captured separately as articles.
  </p>
```

---

## Notes

1. **Terminology Alignment:** This task establishes the "Item Name" terminology that will be used consistently throughout the application. Subsequent tasks (ReviewStep, QR labels) must follow the same pattern.

2. **User Education Goal:** The expanded helper text serves as inline user education, reducing confusion about the data model without requiring external documentation.

3. **Minimal Scope:** This task intentionally keeps changes minimal - only placeholder and helper text. The error messages are already correct, so no validation logic changes are needed.

4. **JSX Escaping:** The helper text uses `&apos;` for apostrophes to avoid JSX parsing issues. This is the standard pattern in the codebase.

---

## References

- [Implementation Plan](/Users/shinyqk/Documents/mastuff/proj/ai_stuff/aibnb/faqbnb_manus/docs/prd/Plan-105-FAQBNB-Review-2026-01-11-Comprehensive-Implementation.md)
- [Request #181 in gen_requests.md](/Users/shinyqk/Documents/mastuff/proj/ai_stuff/aibnb/faqbnb_manus/docs/gen_requests.md)
- [MetadataStep Component](/Users/shinyqk/Documents/mastuff/proj/ai_stuff/aibnb/faqbnb_manus/src/components/ItemCapture/components/steps/MetadataStep.tsx)
- [ReviewStep Component](/Users/shinyqk/Documents/mastuff/proj/ai_stuff/aibnb/faqbnb_manus/src/components/ItemCapture/components/steps/ReviewStep.tsx)
