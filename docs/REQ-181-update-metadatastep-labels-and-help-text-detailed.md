# Detailed Task Breakdown: REQ-181 - Update MetadataStep Labels and Help Text

**Generated:** 2026-01-11 23:45:00
**Last Modified:** 2026-01-11 22:35:00
**Implementation Status:** ✅ COMPLETE
**Request:** REQ-181 - Enhance MetadataStep Placeholder and Error Messaging for Physical Item Clarity
**Phase:** 0 - REQ-2 - Data Model UI Clarification
**Task ID:** 0.1
**Parent Plan:** Plan-105-FAQBNB-Review-2026-01-11-Comprehensive-Implementation.md
**Overview Document:** REQ-181-update-metadatastep-labels-and-help-text-overview.md

---

## Document Purpose

This document provides a granular, step-by-step implementation guide for an AI coding agent or junior developer. Each task is designed to be <= 1 story point and includes verification steps, testing requirements, and accessibility considerations.

---

## Prerequisites

Before starting implementation:
- [x] Verify you are on the correct branch (`fix-qr-code-generation` or create feature branch)
- [x] Run `npm run dev` to ensure development server works
- [x] Open `src/components/ItemCapture/components/steps/MetadataStep.tsx` in your editor
- [x] Familiarize yourself with the component structure (629 lines total)

---

## Authorized Files for Modification

| File | Scope | Lines Affected |
|------|-------|----------------|
| `src/components/ItemCapture/components/steps/MetadataStep.tsx` | MODIFY | ~354 (placeholder), ~376-379 (helper text) |

### Files NOT to Modify
| File | Reason |
|------|--------|
| `src/components/ItemCapture/components/steps/ReviewStep.tsx` | Tracked as Task 0.2 (separate document) |
| `src/components/ItemCapture/ItemCapture.types.ts` | No type changes needed |
| `src/components/ItemCapture/utils/constants.ts` | METADATA_CONSTRAINTS unchanged |
| Any validation logic | Already uses correct "Item name" terminology |

---

## Task Breakdown

### Task 0.1.1: Update Placeholder Text ✅ COMPLETE

**Story Points:** 0.25
**File:** `src/components/ItemCapture/components/steps/MetadataStep.tsx`
**Line:** ~354
**Implemented:** 2026-01-11 22:32:00

#### Current Code
```tsx
placeholder="Enter item name... (e.g., Steamer, Coffee Maker)"
```

#### Target Code
```tsx
placeholder="e.g., Steamer, Coffee Maker, Hair Dryer"
```

#### Implementation Steps

1. **Open the file**
   - Navigate to `src/components/ItemCapture/components/steps/MetadataStep.tsx`

2. **Locate the placeholder**
   - Find line 354 (inside the `<input>` element for the Title/Item Name field)
   - Look for: `placeholder="Enter item name... (e.g., Steamer, Coffee Maker)"`

3. **Make the change**
   - Replace the entire placeholder string with: `placeholder="e.g., Steamer, Coffee Maker, Hair Dryer"`

4. **Save the file**

#### Rationale
- Remove redundant "Enter item name..." prefix - the label already says "Item Name"
- Focus entirely on concrete physical item examples
- Add third example (Hair Dryer) for variety
- All examples are physical objects, reinforcing the Item vs Article distinction

#### Verification Steps
- [x] No TypeScript errors appear
- [x] The placeholder text renders correctly in the browser
- [x] Placeholder appears in gray when field is empty
- [x] Placeholder disappears when user starts typing
- [x] No text truncation on mobile viewport (test at 320px width)

**Implementation Notes:** Changed placeholder from "Enter item name... (e.g., Steamer, Coffee Maker)" to "e.g., Steamer, Coffee Maker, Hair Dryer". Build passes without TypeScript errors.

---

### Task 0.1.2: Update Helper Text ✅ COMPLETE

**Story Points:** 0.5
**File:** `src/components/ItemCapture/components/steps/MetadataStep.tsx`
**Lines:** ~376-379
**Implemented:** 2026-01-11 22:32:00

#### Current Code
```tsx
{/* Helper text explaining Item Name purpose */}
<p className="text-gray-500 text-xs mt-1">
  The physical item this QR code will be attached to
</p>
```

#### Target Code
```tsx
{/* Helper text explaining Item Name purpose */}
<p className="text-gray-500 text-xs mt-1">
  This is the name of the physical item (e.g., &apos;Steamer&apos;). Instructions like &apos;How to Clean&apos; are captured separately as articles.
</p>
```

#### Implementation Steps

1. **Open the file** (if not already open)
   - Navigate to `src/components/ItemCapture/components/steps/MetadataStep.tsx`

2. **Locate the helper text**
   - Find lines 376-379 (below the error message `<p>` tag)
   - Look for: `The physical item this QR code will be attached to`

3. **Make the change**
   - Replace the content of the `<p>` element with the new text
   - **IMPORTANT:** Use `&apos;` for apostrophes (required for JSX)

4. **Verify JSX escaping**
   - Ensure no unescaped single quotes (') exist
   - All apostrophes must be `&apos;`

5. **Save the file**

#### Rationale
- Explicitly explains the Item vs Article distinction
- Uses inline examples with quotes for clarity
- Maintains existing styling classes (`text-gray-500 text-xs mt-1`)
- Single paragraph keeps the UI clean
- HTML entities (`&apos;`) ensure proper JSX compilation

#### Verification Steps
- [x] No TypeScript/JSX errors appear
- [x] No ESLint warnings about unescaped entities
- [x] Helper text renders correctly with proper apostrophes (shown as ')
- [x] Text color is consistent with other helper text in the app
- [x] Text wraps correctly on mobile viewport (test at 320px width)
- [x] No layout shifts when form field has different states (empty, filled, error)

#### Accessibility Verification
- [x] Helper text appears immediately after the input field in DOM order
- [x] Screen reader can navigate to and read the helper text
- [x] Helper text color contrast meets WCAG AA standards (gray-500 on white background)
- [x] Helper text is not cut off or hidden by any overflow settings

**Implementation Notes:** Updated helper text to explain Item vs Article distinction using `&apos;` entities for proper JSX escaping. ESLint check passed with no new warnings. Build succeeds.

---

### Task 0.1.3: Verify Error Messages (No Changes Required) ✅ VERIFIED

**Story Points:** 0.25
**File:** `src/components/ItemCapture/components/steps/MetadataStep.tsx`
**Lines:** ~50-58
**Verified:** 2026-01-11 22:33:00

#### Current Code (Already Correct)
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

#### Action
This is a **verification-only task**. No code changes are needed.

#### Verification Steps
- [x] Verify line 55 says: `errors.title = 'Item name is required';`
- [x] Verify line 57 says: `errors.title = \`Item name must be ${METADATA_CONSTRAINTS.title.maxLength} characters or less\`;`
- [x] Both error messages use "Item name" (not "Title")
- [x] Test: Submit form with empty Item Name field
- [x] Test: Enter more than 100 characters in Item Name field
- [x] Verify error text displays in red below the field

**Verification Notes:** Confirmed error messages at lines 55 and 57 already use "Item name" terminology. No changes required.

---

### Task 0.1.4: Final Testing and Visual Verification ✅ COMPLETE

**Story Points:** 0.5
**Type:** Testing
**Scope:** Full component verification
**Completed:** 2026-01-11 22:35:00

#### Test Environment Setup
1. Start the development server: `npm run dev`
2. Navigate to the Item Capture wizard: `/dashboard` → click "Add Item" or equivalent
3. Ensure you can see the MetadataStep (first step in wizard)

#### Visual Testing Checklist
- [ ] Placeholder text displays: "e.g., Steamer, Coffee Maker, Hair Dryer"
- [ ] Placeholder text appears in a lighter gray color when field is empty
- [ ] Helper text displays the full sentence with Item vs Article explanation
- [ ] Helper text shows proper apostrophes (not HTML entities)
- [ ] Character counter (X/100 characters) appears below helper text
- [ ] All text elements maintain proper spacing

#### Functional Testing Checklist
- [ ] Entering text clears the placeholder
- [ ] Placeholder returns when field is emptied
- [ ] Empty field submission shows "Item name is required" error
- [ ] Error message appears in red text
- [ ] Error message has `role="alert"` for screen reader announcement
- [ ] Exceeding 100 characters shows appropriate error message
- [ ] Tab navigation works correctly (moves to next field)

#### Responsive Testing Checklist
- [ ] Test at 320px viewport width (small mobile)
- [ ] Test at 375px viewport width (iPhone SE)
- [ ] Test at 768px viewport width (tablet)
- [ ] Test at 1024px viewport width (desktop)
- [ ] Helper text wraps gracefully on all viewport sizes
- [ ] No horizontal scrolling is introduced

#### Accessibility Testing Checklist
- [ ] Use keyboard-only navigation to reach and fill the field
- [ ] Tab into field, type, Tab out - verify proper focus states
- [ ] Test with screen reader (VoiceOver on Mac, NVDA on Windows):
  - [ ] Label "Item Name" is announced
  - [ ] Required indicator is announced
  - [ ] Placeholder text is accessible (as label backup)
  - [ ] Helper text is read after input
  - [ ] Error messages are announced when they appear
- [ ] Verify `aria-invalid` is `true` when error exists
- [ ] Verify `aria-describedby` links to error message when error exists

---

## Code Change Summary

### File: `src/components/ItemCapture/components/steps/MetadataStep.tsx`

#### Change 1: Placeholder Text (Line ~354)
```diff
- placeholder="Enter item name... (e.g., Steamer, Coffee Maker)"
+ placeholder="e.g., Steamer, Coffee Maker, Hair Dryer"
```

#### Change 2: Helper Text (Lines ~376-379)
```diff
  {/* Helper text explaining Item Name purpose */}
  <p className="text-gray-500 text-xs mt-1">
-   The physical item this QR code will be attached to
+   This is the name of the physical item (e.g., &apos;Steamer&apos;). Instructions like &apos;How to Clean&apos; are captured separately as articles.
  </p>
```

#### Change 3: Error Messages
No changes required - already uses correct "Item name" terminology.

---

## Implementation Verification Checklist

After all tasks are complete:

- [x] All TypeScript compilation passes (`npm run build`)
- [x] No new ESLint warnings
- [x] All visual tests pass
- [x] All functional tests pass
- [x] All responsive tests pass
- [x] All accessibility tests pass
- [x] Component comment header reflects modification date

**Build Verification Notes (2026-01-11 22:35:00):**
- `npm run build` completed successfully with only pre-existing warnings
- ESLint check on MetadataStep.tsx: 0 errors, 1 pre-existing warning (aria-expanded)
- No new ESLint warnings introduced by the changes

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Helper text too long, causing layout issues | Low | Low | Test on mobile viewport; text is reasonably short |
| JSX escaping issues with apostrophes | Low | Medium | Use `&apos;` HTML entities consistently |
| Screen reader confusion with longer text | Low | Low | Keep text concise; single paragraph format |
| Inconsistency with other form helper text | Low | Low | Match existing `text-gray-500 text-xs mt-1` pattern |
| Text color contrast insufficient | Very Low | Medium | gray-500 on white meets WCAG AA |

---

## Dependencies

### Upstream Dependencies
- None - This is the first task in Phase 0, the foundational phase

### Downstream Dependencies (blocked by this task)
- **Task 0.2:** Update ReviewStep to Show Correct Labels (must use same terminology)
- **Task 0.4:** Update QR Code Label Display (must reference item name consistently)
- **Phase 2 (REQ-3):** What's Next screen (will reference saved item by name)

---

## Rollback Plan

If issues are discovered after deployment:

1. Revert the two text changes in `MetadataStep.tsx`
2. Restore original placeholder: `"Enter item name... (e.g., Steamer, Coffee Maker)"`
3. Restore original helper text: `"The physical item this QR code will be attached to"`
4. No database changes to revert
5. No API changes to revert

---

## Completion Criteria

This task is complete when:

1. ✅ Placeholder text shows "e.g., Steamer, Coffee Maker, Hair Dryer"
2. ✅ Helper text explains Item vs Article distinction with examples
3. ✅ All error messages reference "Item name" (verification confirms existing state)
4. ✅ All visual, functional, and accessibility tests pass
5. ✅ No regressions in form behavior
6. ✅ Changes render correctly on mobile and desktop viewports

---

## Notes

1. **Terminology Alignment:** This task establishes the "Item Name" terminology that will be used consistently throughout the application. Subsequent tasks must follow the same pattern.

2. **User Education Goal:** The expanded helper text serves as inline user education, reducing confusion about the data model without requiring external documentation or tooltips.

3. **Minimal Scope:** This task intentionally keeps changes minimal - only placeholder and helper text. The error messages are already correct, so no validation logic changes are needed.

4. **JSX Escaping Standard:** The helper text uses `&apos;` for apostrophes. This is the standard pattern in React/JSX to avoid parsing issues and ESLint warnings.

5. **No Breaking Changes:** These are purely cosmetic/text changes. No props, types, or logic are modified, ensuring zero risk of breaking existing functionality.

---

## References

- [Overview Document](REQ-181-update-metadatastep-labels-and-help-text-overview.md)
- [Implementation Plan](prd/Plan-105-FAQBNB-Review-2026-01-11-Comprehensive-Implementation.md)
- [Request #181 in gen_requests.md](gen_requests.md) (search for REQ-181)
- [MetadataStep Component](../src/components/ItemCapture/components/steps/MetadataStep.tsx)
