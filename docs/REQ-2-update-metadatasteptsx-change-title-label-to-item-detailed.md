# Detailed Task Breakdown: REQ-2 Task 0.1 - Update MetadataStep Title Label to Item Name

**Generated:** 2026-01-11 12:15:00 UTC
**Last Modified:** 2026-01-11 12:15:00 UTC
**Request:** REQ-2 - Fix Data Model (Item vs Article Separation)
**Phase:** 0 - REQ-2 (CRITICAL)
**Task ID:** 0.1
**Parent Plan:** Plan-104-FAQBNB-Review-2026-01-11-Implementation.md
**Overview Document:** REQ-2-update-metadatasteptsx-change-title-label-to-item-overview.md

---

## Executive Summary

This document provides granular, implementation-ready tasks for updating the "Title" label to "Item Name" in the MetadataStep component. This change is part of the CRITICAL REQ-2 data model fix that establishes correct terminology distinguishing Items (physical objects) from Articles (content/instructions).

### Data Model Context

| Concept | Description | Example |
|---------|-------------|---------|
| **Item** | A physical thing. Gets ONE QR code. | Fridge, Oven, Steamer |
| **Article** | Instructions/content about an item. Multiple per item. | "How to Clean", "How to Turn Off" |
| **QR Code** | ONE per Item (not per article) | Scan "Fridge" → see all articles |

---

## Authorized Files for Modification

| File | Scope |
|------|-------|
| `src/components/ItemCapture/components/steps/MetadataStep.tsx` | MODIFY ONLY |

### Specific Line Ranges (Verified Against Current Source)

| Lines | Section | Change Description |
|-------|---------|-------------------|
| 3-14 | Module JSDoc | Update component documentation |
| 53-58 | `validateMetadata()` | Update error message strings |
| 345 | Title label | Change "Title" to "Item Name" |
| 354 | Input placeholder | Update placeholder text |
| 376-378 | Character counter | Add helper text before counter |

---

## Implementation Tasks

### Task 0.1.1: Update Label Text from "Title" to "Item Name"

**Story Points:** 0.25
**File:** `src/components/ItemCapture/components/steps/MetadataStep.tsx`
**Line:** 345

#### Current Code (Line 345)
```tsx
          Title <span className="text-red-500">*</span>
```

#### Target Code
```tsx
          Item Name <span className="text-red-500">*</span>
```

#### Implementation Steps
1. Open `src/components/ItemCapture/components/steps/MetadataStep.tsx`
2. Navigate to line 345
3. Change `Title` to `Item Name`
4. Ensure the required indicator `<span className="text-red-500">*</span>` remains unchanged
5. Save the file

#### Verification
- [ ] Label displays "Item Name" followed by red asterisk
- [ ] Label styling unchanged (text-sm font-medium text-gray-700)
- [ ] No TypeScript errors
- [ ] Build completes without warnings

---

### Task 0.1.2: Update Placeholder Text

**Story Points:** 0.25
**File:** `src/components/ItemCapture/components/steps/MetadataStep.tsx`
**Line:** 354

#### Current Code (Line 354)
```tsx
            placeholder="Enter item title..."
```

#### Target Code
```tsx
            placeholder="Enter item name... (e.g., Steamer, Coffee Maker)"
```

#### Implementation Steps
1. Navigate to line 354 in `MetadataStep.tsx`
2. Update the placeholder attribute value
3. Include practical examples to guide users
4. Save the file

#### Verification
- [ ] Placeholder shows "Enter item name... (e.g., Steamer, Coffee Maker)"
- [ ] Input field functions correctly
- [ ] Text truncates appropriately on smaller screens
- [ ] No TypeScript errors

---

### Task 0.1.3: Add Helper Text Below Input Field

**Story Points:** 0.5
**File:** `src/components/ItemCapture/components/steps/MetadataStep.tsx`
**Location:** After error message block (line 375), before character counter (line 376)

#### Current Code (Lines 375-378)
```tsx
        )}
        <p className="text-gray-500 text-xs mt-1">
          {metadata.title.length}/{METADATA_CONSTRAINTS.title.maxLength} characters
        </p>
```

#### Target Code
```tsx
        )}
        {/* Helper text explaining Item Name purpose */}
        <p className="text-gray-500 text-xs mt-1">
          The physical item this QR code will be attached to
        </p>
        <p className="text-gray-400 text-xs mt-0.5">
          {metadata.title.length}/{METADATA_CONSTRAINTS.title.maxLength} characters
        </p>
```

#### Implementation Steps
1. Navigate to line 375-376 in `MetadataStep.tsx`
2. Add the helper text paragraph before the character counter
3. Use `text-gray-500` for primary helper text
4. Change character counter to `text-gray-400` for visual hierarchy
5. Adjust margin from `mt-1` to `mt-0.5` on character counter for tighter spacing
6. Save the file

#### Verification
- [ ] Helper text "The physical item this QR code will be attached to" appears below input
- [ ] Character counter remains functional and visible
- [ ] Visual hierarchy: helper text slightly more prominent than counter
- [ ] Spacing between elements is consistent
- [ ] Mobile view displays correctly without overflow
- [ ] No TypeScript errors

#### Accessibility Verification
- [ ] Helper text is readable by screen readers
- [ ] Color contrast meets WCAG AA standards (gray-500 on white)
- [ ] Text size is legible (text-xs = 0.75rem)

---

### Task 0.1.4: Update Validation Error Messages

**Story Points:** 0.25
**File:** `src/components/ItemCapture/components/steps/MetadataStep.tsx`
**Lines:** 53-58 (inside `validateMetadata` function)

#### Current Code (Lines 53-58)
```tsx
  // Title validation (required)
  if (!metadata.title?.trim()) {
    errors.title = 'Title is required';
  } else if (metadata.title.length > METADATA_CONSTRAINTS.title.maxLength) {
    errors.title = `Title must be ${METADATA_CONSTRAINTS.title.maxLength} characters or less`;
  }
```

#### Target Code
```tsx
  // Item Name validation (required)
  if (!metadata.title?.trim()) {
    errors.title = 'Item name is required';
  } else if (metadata.title.length > METADATA_CONSTRAINTS.title.maxLength) {
    errors.title = `Item name must be ${METADATA_CONSTRAINTS.title.maxLength} characters or less`;
  }
```

#### Implementation Steps
1. Navigate to lines 53-58 in `MetadataStep.tsx`
2. Update comment from "Title validation" to "Item Name validation"
3. Change error message from `'Title is required'` to `'Item name is required'`
4. Change error message from `Title must be` to `Item name must be`
5. Save the file

#### Verification
- [ ] Empty field shows error "Item name is required"
- [ ] Exceeding max length shows "Item name must be X characters or less"
- [ ] Error message displays in red below the input field
- [ ] Error clears when valid input is provided
- [ ] No TypeScript errors

#### Testing Scenarios
1. Submit form with empty Item Name field → "Item name is required"
2. Enter text exceeding 100 characters → "Item name must be 100 characters or less"
3. Enter valid text → No error displayed

---

### Task 0.1.5: Update Component JSDoc Comment

**Story Points:** 0.25
**File:** `src/components/ItemCapture/components/steps/MetadataStep.tsx`
**Lines:** 3-14 (module JSDoc block)

#### Current Code (Lines 3-14)
```tsx
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

#### Target Code
```tsx
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

#### Implementation Steps
1. Navigate to lines 3-14 in `MetadataStep.tsx`
2. Change `- Title (required)` to `- Item Name (required) - the physical item this QR code will be attached to`
3. Update `@lastModified` date to `2026-01-11`
4. Update modification description to reference REQ-2 Task 0.1
5. Save the file

#### Verification
- [ ] JSDoc accurately describes the component
- [ ] Date reflects current modification date
- [ ] Change description is clear and traceable to the request

---

## Testing Tasks

### Task 0.1.6: Functional Testing

**Story Points:** 0.5
**Type:** Manual Testing

#### Test Cases

| # | Test Case | Expected Result | Status |
|---|-----------|-----------------|--------|
| 1 | Load MetadataStep in workflow | "Item Name" label with red asterisk displays | [ ] |
| 2 | Click into Item Name field | Placeholder "Enter item name... (e.g., Steamer, Coffee Maker)" visible | [ ] |
| 3 | View below input field | Helper text "The physical item this QR code will be attached to" visible | [ ] |
| 4 | Submit with empty Item Name | Error "Item name is required" displays | [ ] |
| 5 | Enter >100 characters | Error "Item name must be 100 characters or less" displays | [ ] |
| 6 | Enter valid Item Name | No error, character counter updates | [ ] |
| 7 | Proceed to next step | Item Name value persists in form state | [ ] |

#### Verification Steps
1. Start the development server: `npm run dev`
2. Navigate to Item Capture workflow
3. Execute each test case in sequence
4. Document any failures with screenshots

---

### Task 0.1.7: Visual Regression Testing

**Story Points:** 0.25
**Type:** Manual Testing

#### Visual Checkpoints

| # | Checkpoint | Expected | Status |
|---|------------|----------|--------|
| 1 | Label font and color | `font-medium text-gray-700` (same as other labels) | [ ] |
| 2 | Helper text color | `text-gray-500` (distinguishable but subtle) | [ ] |
| 3 | Character counter color | `text-gray-400` (lighter than helper text) | [ ] |
| 4 | Spacing consistency | Matches Room, Tags, Item Type field spacing | [ ] |
| 5 | Mobile layout (320px) | No text overflow, readable on small screens | [ ] |
| 6 | Tablet layout (768px) | Proper alignment and spacing | [ ] |
| 7 | Desktop layout (1024px+) | Full form visible without scrolling | [ ] |

#### Verification Steps
1. Use browser DevTools to test responsive breakpoints
2. Compare visual appearance with other form fields
3. Check for any layout shifts or spacing inconsistencies

---

### Task 0.1.8: Accessibility Verification

**Story Points:** 0.25
**Type:** Manual Testing

#### ARIA and Accessibility Checks

| # | Check | Expected | Status |
|---|-------|----------|--------|
| 1 | Label association | `htmlFor` matches input `id` | [ ] |
| 2 | Required indicator | `aria-required="true"` present | [ ] |
| 3 | Error announcement | `aria-invalid` and `aria-describedby` work correctly | [ ] |
| 4 | Keyboard navigation | Tab through form fields works | [ ] |
| 5 | Screen reader test | Label reads "Item Name, required" | [ ] |
| 6 | Color contrast | Helper text passes WCAG AA (4.5:1 ratio) | [ ] |

#### Verification Steps
1. Use axe DevTools or similar accessibility checker
2. Test keyboard-only navigation through the form
3. Test with VoiceOver (macOS) or NVDA (Windows) if available

---

### Task 0.1.9: Build Verification

**Story Points:** 0.25
**Type:** Automated

#### Commands to Execute
```bash
# Type checking
npm run type-check

# Build verification
npm run build

# Start production build
npm run start
```

#### Expected Results
- [ ] No TypeScript errors
- [ ] Build completes successfully
- [ ] No console warnings related to MetadataStep
- [ ] Production build runs without runtime errors

---

## Consolidated Verification Checklist

### Pre-Implementation
- [ ] Verified MetadataStep.tsx exists at expected path
- [ ] Confirmed line numbers match current codebase
- [ ] No uncommitted changes in target file

### Post-Implementation
- [ ] All 5 code changes implemented (Tasks 0.1.1-0.1.5)
- [ ] No TypeScript errors
- [ ] Build passes
- [ ] Manual testing complete (Task 0.1.6)
- [ ] Visual regression verified (Task 0.1.7)
- [ ] Accessibility verified (Task 0.1.8)
- [ ] Build verification passed (Task 0.1.9)

### Commit Requirements
- [ ] All tests passing
- [ ] Commit message follows convention: `fix(ui): Update Title label to Item Name in MetadataStep (REQ-2 Task 0.1)`
- [ ] Changes limited to authorized file only

---

## Dependencies

### Upstream (Must Complete First)
- None - This is the foundational task in Phase 0

### Downstream (Blocked Until Complete)
- **Task 0.2:** Update ReviewStep.tsx - Change summary label from "Title" to "Item Name"
- **Task 0.3:** Update type documentation in ItemCapture.types.ts
- **Task 0.4:** Verify QR code generation uses Item Name correctly

### Parallel Safety
- **Safe to parallelize with:** REQ-1, REQ-4 tasks (different files)
- **Potential conflict with:** REQ-179 (same file - MetadataStep.tsx)

---

## Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Test assertions check old error text | Low | Low | Search test files for "Title is required" string |
| Merge conflict with REQ-179 | Medium | Medium | Coordinate implementation order; REQ-179 touches same file |
| Regression in form validation | Low | Medium | Run full manual test suite |

---

## Effort Summary

| Task | Description | Story Points |
|------|-------------|--------------|
| 0.1.1 | Update label text | 0.25 |
| 0.1.2 | Update placeholder text | 0.25 |
| 0.1.3 | Add helper text | 0.5 |
| 0.1.4 | Update validation error messages | 0.25 |
| 0.1.5 | Update component JSDoc | 0.25 |
| 0.1.6 | Functional testing | 0.5 |
| 0.1.7 | Visual regression testing | 0.25 |
| 0.1.8 | Accessibility verification | 0.25 |
| 0.1.9 | Build verification | 0.25 |
| **Total** | | **2.75** |

---

## References

- [Implementation Plan](./prd/Plan-104-FAQBNB-Review-2026-01-11-Implementation.md)
- [Overview Document](./REQ-2-update-metadatasteptsx-change-title-label-to-item-overview.md)
- [MetadataStep Component](../src/components/ItemCapture/components/steps/MetadataStep.tsx)
- [ItemCapture Types](../src/components/ItemCapture/ItemCapture.types.ts)

---

**Document Status:** Ready for Implementation
**Reviewer:** [Pending]
**Approved:** [Pending]
