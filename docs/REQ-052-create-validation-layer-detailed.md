# REQ-052: Create Validation Layer - Detailed Task Breakdown

**Document Created:** 2025-12-31T18:30:00
**Last Modified:** 2025-12-31T19:00:00
**Request Reference:** `/docs/gen_requests.md` - Request #052
**Overview Document:** `/docs/REQ-052-create-validation-layer-overview.md`
**Implementation Plan:** `/docs/prd/item-capture-implementation-plan.md`
**Phase:** 5 - Review & Polish
**Task ID:** 5.3
**Status:** COMPLETED

---

## Implementation Summary

All 16 tasks have been successfully completed. The validation layer is fully implemented and integrated.

### Files Created
- `src/components/ItemCapture/utils/validation.ts` - Pure validation functions
- `src/components/ItemCapture/hooks/useItemValidation.ts` - React validation hook
- `src/components/ItemCapture/components/shared/ValidationMessage.tsx` - Error/warning display component
- `src/components/ItemCapture/utils/__tests__/validation.test.ts` - Unit tests
- `src/components/ItemCapture/hooks/__tests__/useItemValidation.test.ts` - Integration tests

### Files Modified
- `src/components/ItemCapture/utils/constants.ts` - Added CAPTURE_CONSTRAINTS and SUPPORTED_FORMATS
- `src/components/ItemCapture/components/steps/ReviewStep.tsx` - Integrated validation hook and display
- `src/components/ItemCapture/hooks/useFileUpload.ts` - Added type-specific size validation
- `src/components/ItemCapture/index.ts` - Added exports for validation utilities
- `src/components/ItemCapture/hooks/index.ts` - Added useItemValidation export
- `src/components/ItemCapture/components/shared/index.ts` - Added ValidationMessage exports

---

## Executive Summary

This document breaks down the implementation of a comprehensive validation layer for the ItemCapture component into granular, actionable tasks. Each task is designed to be ≤ 1 story point (a few hours of focused work) and includes specific verification steps.

The validation layer ensures:
- Required metadata fields are validated before submission
- Content requirements are enforced (at least one media item or text)
- Individual file sizes are checked against type-specific limits
- Total upload size is calculated and validated
- Real-time validation feedback is provided to users

---

## Task Overview

| Task # | Title | Est. Hours | Dependencies |
|--------|-------|------------|--------------|
| 1 | Create capture constraints constants | 1-2 | None |
| 2 | Implement file size formatting utility | 1 | Task 1 |
| 3 | Implement title validation function | 1 | None |
| 4 | Implement content requirement validation | 1 | None |
| 5 | Implement file size validation function | 1-2 | Task 1 |
| 6 | Implement total size validation function | 1-2 | Task 1, 5 |
| 7 | Implement text length validation function | 1 | Task 1 |
| 8 | Implement image count validation function | 1 | Task 1 |
| 9 | Implement MIME type validation function | 1 | Task 1 |
| 10 | Create complete validation aggregator | 2-3 | Tasks 3-9 |
| 11 | Create ValidationMessage component | 2 | None |
| 12 | Create useItemValidation hook | 2-3 | Tasks 2, 10 |
| 13 | Integrate validation in ReviewStep | 2-3 | Tasks 11, 12 |
| 14 | Add pre-upload validation in useFileUpload | 1-2 | Task 5, 6 |
| 15 | Add unit tests for validation functions | 2-3 | Tasks 3-10 |
| 16 | Add integration tests for validation hook | 2 | Task 12, 15 |

**Total Estimated Time:** 20-28 hours

---

## Authorized Files for Modification

### Files to CREATE

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemCapture/utils/constants.ts` | Capture constraints and supported formats |
| `src/components/ItemCapture/utils/validation.ts` | Pure validation functions |
| `src/components/ItemCapture/hooks/useItemValidation.ts` | React validation hook |
| `src/components/ItemCapture/components/shared/ValidationMessage.tsx` | Error/warning display component |

### Files to MODIFY

| File Path | Modification |
|-----------|--------------|
| `src/components/ItemCapture/components/steps/ReviewStep.tsx` | Integrate useItemValidation hook |
| `src/components/ItemCapture/hooks/useFileUpload.ts` | Add pre-add validation |
| `src/components/ItemCapture/index.ts` | Export validation utilities |

### Reference Files (Read-Only)

| File Path | Pattern Reference |
|-----------|-------------------|
| `src/lib/access-validation.ts` | Validation result types pattern |
| `src/lib/error-utils.ts` | Error code and message patterns |
| `src/components/ItemForm.tsx` | Form validation and error display |
| `src/lib/utils.ts` | Utility function patterns |

---

## Detailed Task Breakdown

---

### Task 1: Create Capture Constraints Constants [x] COMPLETED

**File:** `src/components/ItemCapture/utils/constants.ts`

**Objective:** Create a centralized constants file defining all validation limits and supported formats.

**Implementation Notes:** Added CAPTURE_CONSTRAINTS and SUPPORTED_FORMATS constants to existing constants.ts file. Includes type-safe definitions with TypeScript readonly types.

**Implementation Requirements:**

1. Create the constants file with the following structure:
   ```typescript
   export const CAPTURE_CONSTRAINTS = {
     video: {
       maxDuration: 120,        // 2 minutes in seconds
       maxFileSize: 104857600,  // 100 MB
     },
     image: {
       maxFileSize: 20971520,   // 20 MB
       maxCount: 10,
     },
     pdf: {
       maxFileSize: 52428800,   // 50 MB
       maxPages: 50,
     },
     text: {
       maxLength: 5000,         // characters
     },
     total: {
       maxSize: 209715200,      // 200 MB total per item
     },
     title: {
       maxLength: 200,          // characters
     },
   };
   ```

2. Create supported formats constant:
   ```typescript
   export const SUPPORTED_FORMATS = {
     image: ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'],
     video: ['video/mp4', 'video/webm', 'video/quicktime'],
     pdf: ['application/pdf'],
   };
   ```

3. Add `'use client';` directive at top of file

**Acceptance Criteria:**
- [x] File exists at `src/components/ItemCapture/utils/constants.ts`
- [x] All constraint values match the implementation plan (Appendix B)
- [x] Constants are properly typed with TypeScript
- [x] File can be imported without errors

**Verification Steps:**
1. Run: `npx tsc --noEmit src/components/ItemCapture/utils/constants.ts`
2. Import in another file and verify IntelliSense shows correct types

---

### Task 2: Implement File Size Formatting Utility [x] COMPLETED

**File:** `src/components/ItemCapture/utils/validation.ts`

**Implementation Notes:** Created formatFileSize and parseFileSize functions with full support for B/KB/MB/GB units.

**Objective:** Create utility functions for formatting file sizes in human-readable format.

**Implementation Requirements:**

1. Create `formatFileSize(bytes: number): string` function:
   - Handle edge case: return '0 B' for 0 bytes
   - Use 1024 as the base (not 1000)
   - Support units: B, KB, MB, GB
   - Round to 1 decimal place
   - Example outputs: '0 B', '512 B', '1.5 KB', '25.3 MB', '1.2 GB'

2. Create `parseFileSize(sizeStr: string): number` function:
   - Parse strings like '100MB', '1.5GB', '500KB'
   - Case-insensitive unit matching
   - Return 0 for invalid strings
   - Support optional space between number and unit

**Code Pattern:**
```typescript
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
```

**Acceptance Criteria:**
- [x] `formatFileSize(0)` returns '0 B'
- [x] `formatFileSize(1024)` returns '1 KB'
- [x] `formatFileSize(1536)` returns '1.5 KB'
- [x] `formatFileSize(104857600)` returns '100 MB'
- [x] `parseFileSize('100MB')` returns 104857600
- [x] `parseFileSize('invalid')` returns 0

**Verification Steps:**
1. Write quick test cases in a scratch file
2. Verify TypeScript compilation succeeds

---

### Task 3: Implement Title Validation Function [x] COMPLETED

**File:** `src/components/ItemCapture/utils/validation.ts`

**Implementation Notes:** Implemented validateTitle function with empty/whitespace and max length checks.

**Objective:** Create a pure function to validate the item title field.

**Implementation Requirements:**

1. Define ValidationResult type:
   ```typescript
   export interface ValidationResult {
     isValid: boolean;
     error?: string;
   }
   ```

2. Create `validateTitle(title: string): ValidationResult` function:
   - Return error if title is empty or whitespace-only
   - Return error if title exceeds `CAPTURE_CONSTRAINTS.title.maxLength`
   - Include current length in over-limit error message
   - Return `{ isValid: true }` for valid titles

**Error Messages (following error-utils.ts patterns):**
- Empty: "Title is required"
- Too long: "Title must be 200 characters or less (current: {n})"

**Acceptance Criteria:**
- [x] `validateTitle('')` returns `{ isValid: false, error: 'Title is required' }`
- [x] `validateTitle('   ')` returns `{ isValid: false, error: 'Title is required' }`
- [x] `validateTitle('Valid Title')` returns `{ isValid: true }`
- [x] `validateTitle('x'.repeat(201))` includes current length in error

**Verification Steps:**
1. Unit test each edge case
2. Verify TypeScript types are correct

---

### Task 4: Implement Content Requirement Validation [x] COMPLETED

**File:** `src/components/ItemCapture/utils/validation.ts`

**Implementation Notes:** Implemented validateContentRequirement function checking for media or text content.

**Objective:** Create a function that validates at least one form of content exists.

**Implementation Requirements:**

1. Create `validateContentRequirement(mediaItems: MediaItem[], instructions: string): ValidationResult`:
   - Check if `mediaItems.length > 0` (has media)
   - Check if `instructions?.trim().length > 0` (has text)
   - Valid if EITHER condition is true
   - Return specific error message if both are empty

**Error Message:**
- "At least one media item or text instructions must be provided"

**Dependencies:**
- Import `MediaItem` type from `../ItemCapture.types` (or define inline if not available)

**Acceptance Criteria:**
- [x] Returns valid when mediaItems has items, no text
- [x] Returns valid when no media, instructions has text
- [x] Returns valid when both have content
- [x] Returns error when both are empty
- [x] Trims whitespace from instructions before checking

**Verification Steps:**
1. Test with empty arrays and empty strings
2. Test with populated arrays and text
3. Verify error message matches specification

---

### Task 5: Implement File Size Validation Function [x] COMPLETED

**File:** `src/components/ItemCapture/utils/validation.ts`

**Implementation Notes:** Implemented validateFileSize with type-specific limits for video (100MB), image (20MB), and PDF (50MB).

**Objective:** Create a function to validate individual file sizes against type-specific limits.

**Implementation Requirements:**

1. Create extended result type:
   ```typescript
   export interface FileSizeValidationResult {
     isValid: boolean;
     fileSize: number;
     maxAllowed: number;
     error?: string;
   }
   ```

2. Create `validateFileSize(file: File | Blob, mediaType: 'video' | 'image' | 'pdf'): FileSizeValidationResult`:
   - Look up max size from `CAPTURE_CONSTRAINTS[mediaType].maxFileSize`
   - Compare `file.size` against limit
   - Return file size and max in result for display purposes
   - Use `formatFileSize()` in error message

**Error Message Template:**
- "File exceeds {limit} limit (current: {size})"
- Example: "File exceeds 100 MB limit (current: 125 MB)"

**Acceptance Criteria:**
- [x] Video 50 MB file validates successfully (limit is 100 MB)
- [x] Video 150 MB file returns error with correct limits
- [x] Image 15 MB file validates successfully (limit is 20 MB)
- [x] Image 25 MB file returns error with correct limits
- [x] PDF 40 MB file validates successfully (limit is 50 MB)
- [x] Error message includes human-readable sizes

**Verification Steps:**
1. Create mock File objects with specific sizes
2. Verify error messages format correctly

---

### Task 6: Implement Total Size Validation Function [x] COMPLETED

**File:** `src/components/ItemCapture/utils/validation.ts`

**Implementation Notes:** Implemented validateTotalSize function with 200MB total limit.

**Objective:** Create a function to validate the combined size of all media items.

**Implementation Requirements:**

1. Create extended result type:
   ```typescript
   export interface TotalSizeValidationResult extends ValidationResult {
     currentSize: number;
   }
   ```

2. Create `validateTotalSize(mediaItems: MediaItem[]): TotalSizeValidationResult`:
   - Sum all `item.file?.size || 0` values
   - Compare against `CAPTURE_CONSTRAINTS.total.maxSize`
   - Return current total in result for display

**Error Message Template:**
- "Total upload size ({current}) exceeds {limit} limit"
- Example: "Total upload size (220 MB) exceeds 200 MB limit"

**Acceptance Criteria:**
- [x] Empty array returns valid with currentSize: 0
- [x] Items totaling 150 MB return valid
- [x] Items totaling 250 MB return error with correct sizes
- [x] Handles items with undefined/null file property

**Verification Steps:**
1. Test with mock MediaItem arrays
2. Verify size calculation is accurate

---

### Task 7: Implement Text Length Validation Function [x] COMPLETED

**File:** `src/components/ItemCapture/utils/validation.ts`

**Implementation Notes:** Implemented validateTextLength with 5000 character limit.

**Objective:** Create a function to validate instructions text length.

**Implementation Requirements:**

1. Create `validateTextLength(text: string): ValidationResult`:
   - Compare `text.length` against `CAPTURE_CONSTRAINTS.text.maxLength`
   - This is a warning, not a blocking error (per overview document)
   - Include current length in error message

**Error Message Template:**
- "Instructions exceed {limit} character limit (current: {count})"
- Example: "Instructions exceed 5000 character limit (current: 5234)"

**Acceptance Criteria:**
- [x] Empty string returns valid
- [x] 4999 characters returns valid
- [x] 5001 characters returns error with current count
- [x] Error message includes both limit and current count

**Verification Steps:**
1. Test boundary conditions (4999, 5000, 5001 characters)
2. Verify error message format

---

### Task 8: Implement Image Count Validation Function [x] COMPLETED

**File:** `src/components/ItemCapture/utils/validation.ts`

**Implementation Notes:** Implemented validateImageCount with 10 image limit (counts only type='image' items).

**Objective:** Create a function to validate the number of images doesn't exceed the limit.

**Implementation Requirements:**

1. Create `validateImageCount(mediaItems: MediaItem[]): ValidationResult`:
   - Filter items where `item.type === 'image'`
   - Compare count against `CAPTURE_CONSTRAINTS.image.maxCount`
   - Include current count in error message

**Error Message Template:**
- "Maximum {limit} photos allowed (current: {count})"
- Example: "Maximum 10 photos allowed (current: 12)"

**Acceptance Criteria:**
- [x] 9 images returns valid
- [x] 10 images returns valid
- [x] 11 images returns error
- [x] Only counts items with type 'image', not videos or PDFs

**Verification Steps:**
1. Test with mixed media types
2. Verify only images are counted

---

### Task 9: Implement MIME Type Validation Function [x] COMPLETED

**File:** `src/components/ItemCapture/utils/validation.ts`

**Implementation Notes:** Implemented validateMimeType with support for image/jpeg/png/webp/heic/heif, video/mp4/webm/quicktime, and application/pdf.

**Objective:** Create a function to validate file MIME types.

**Implementation Requirements:**

1. Create `validateMimeType(mimeType: string, mediaType: 'video' | 'image' | 'pdf'): ValidationResult`:
   - Look up allowed types from `SUPPORTED_FORMATS[mediaType]`
   - Check if `mimeType` is in allowed list
   - Return specific error message for unsupported types

**Error Message Template:**
- "File type '{type}' is not supported for {category}"
- Example: "File type 'audio/mp3' is not supported for video"

**Acceptance Criteria:**
- [x] 'image/jpeg' with 'image' type returns valid
- [x] 'image/heic' with 'image' type returns valid
- [x] 'audio/mp3' with 'video' type returns error
- [x] 'application/pdf' with 'pdf' type returns valid
- [x] Error message includes actual MIME type and category

**Verification Steps:**
1. Test all supported formats
2. Test unsupported format error messages

---

### Task 10: Create Complete Validation Aggregator [x] COMPLETED

**File:** `src/components/ItemCapture/utils/validation.ts`

**Implementation Notes:** Implemented validateItemCapture function aggregating all validators with separate errors and warnings.

**Objective:** Create a comprehensive validation function that runs all validators and aggregates results.

**Implementation Requirements:**

1. Define comprehensive result type:
   ```typescript
   export interface ItemCaptureValidation {
     isValid: boolean;
     errors: Record<string, string>;
     warnings: Record<string, string>;
     metadata: {
       title: ValidationResult;
       location: ValidationResult;
       tags: ValidationResult;
       applianceType: ValidationResult;
     };
     content: {
       hasMedia: boolean;
       hasText: boolean;
       hasContent: boolean;
       error?: string;
     };
     fileSize: {
       individual: FileSizeValidationResult[];
       total: {
         currentSize: number;
         maxAllowed: number;
         isValid: boolean;
         error?: string;
       };
     };
   }
   ```

2. Create `validateItemCapture(metadata: ItemMetadata, mediaItems: MediaItem[], instructions: string): ItemCaptureValidation`:
   - Run all individual validators
   - Collect errors and warnings separately
   - Text length errors go to warnings (non-blocking)
   - All other errors go to errors (blocking)
   - `isValid = Object.keys(errors).length === 0`

3. Error key naming convention:
   - `title` for title errors
   - `content` for content requirement errors
   - `fileSize_{mediaId}` for individual file size errors
   - `totalSize` for total size errors
   - `imageCount` for image count errors
   - `textLength` for text length warnings

**Acceptance Criteria:**
- [x] Returns isValid: true when all validations pass
- [x] Returns isValid: false when any error exists
- [x] Errors object contains all field-specific errors
- [x] Warnings object contains non-blocking issues
- [x] Text length issues are warnings, not errors
- [x] Individual file sizes are validated per item
- [x] Total size is calculated and validated

**Verification Steps:**
1. Test with fully valid data
2. Test with single error
3. Test with multiple errors
4. Verify warning vs error classification

---

### Task 11: Create ValidationMessage Component [x] COMPLETED

**File:** `src/components/ItemCapture/components/shared/ValidationMessage.tsx`

**Implementation Notes:** Created ValidationMessage and ValidationMessageList components with error/warning/info variants and accessibility support.

**Objective:** Create a reusable component for displaying validation errors and warnings.

**Implementation Requirements:**

1. Create component with props:
   ```typescript
   interface ValidationMessageProps {
     type: 'error' | 'warning' | 'info';
     message: string;
     className?: string;
   }
   ```

2. Styling requirements (following existing patterns):
   - Error: red background/border, AlertCircle icon
   - Warning: yellow background/border, AlertTriangle icon
   - Info: blue background/border, Info icon
   - Use Tailwind classes with `cn()` utility
   - Icons from lucide-react

3. Accessibility requirements:
   - Use appropriate ARIA attributes
   - Color-independent indicators (icons + text)

**Code Pattern:**
```typescript
const styles = {
  error: 'bg-red-50 border-red-200 text-red-700',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  info: 'bg-blue-50 border-blue-200 text-blue-700',
};
```

**Acceptance Criteria:**
- [x] Component renders with correct styling for each type
- [x] Icons match message type
- [x] className prop merges correctly
- [x] Component is accessible (screen reader friendly)

**Verification Steps:**
1. Visual inspection of all three types
2. Verify Tailwind classes apply correctly
3. Check accessibility with browser dev tools

---

### Task 12: Create useItemValidation Hook [x] COMPLETED

**File:** `src/components/ItemCapture/hooks/useItemValidation.ts`

**Implementation Notes:** Created hook with memoized validation, size calculations, and field validation.

**Objective:** Create a React hook that provides real-time validation state management.

**Implementation Requirements:**

1. Hook signature:
   ```typescript
   export function useItemValidation(
     metadata: ItemMetadata,
     mediaItems: MediaItem[],
     instructions: string
   ): {
     validation: ItemCaptureValidation;
     isValid: boolean;
     errors: Record<string, string>;
     warnings: Record<string, string>;
     validateField: (field: keyof ItemMetadata, value: string) => ValidationResult;
     validateAll: () => ItemCaptureValidation;
     calculateTotalSize: () => number;
     getRemainingSize: () => number;
     formatSize: (bytes: number) => string;
   }
   ```

2. Implementation requirements:
   - Use `useMemo` to memoize validation result
   - Re-validate when inputs change
   - Provide utility methods for size calculations
   - Export `formatFileSize` as `formatSize`

3. Performance considerations:
   - Memoize validation result based on input dependencies
   - Use `useCallback` for methods returned to consumers

**Acceptance Criteria:**
- [x] Validation updates when metadata changes
- [x] Validation updates when mediaItems changes
- [x] Validation updates when instructions changes
- [x] `isValid` reflects overall validation state
- [x] `calculateTotalSize()` returns correct sum
- [x] `getRemainingSize()` returns space left before limit

**Verification Steps:**
1. Test in React component with changing props
2. Verify memoization prevents unnecessary recalculations
3. Verify size calculations are accurate

---

### Task 13: Integrate Validation in ReviewStep [x] COMPLETED

**File:** `src/components/ItemCapture/components/steps/ReviewStep.tsx`

**Implementation Notes:** Integrated useItemValidation hook, added size indicator with progress bar, displays all errors and warnings.

**Objective:** Integrate the validation hook and display validation feedback in the ReviewStep component.

**Implementation Requirements:**

1. Import and use `useItemValidation` hook
2. Display size indicator:
   ```
   Total size: {current} / {max} ({remaining} remaining)
   ```

3. Display validation errors using `ValidationMessage` component
4. Display validation warnings using `ValidationMessage` component
5. Disable submit button when `!isValid || isSubmitting`
6. Apply appropriate button styling for disabled state

**Integration Pattern:**
```typescript
const {
  validation,
  isValid,
  errors,
  warnings,
  calculateTotalSize,
  getRemainingSize,
  formatSize,
} = useItemValidation(metadata, mediaItems, instructions);
```

**Acceptance Criteria:**
- [x] Size indicator displays current/max/remaining sizes
- [x] All validation errors display with error styling
- [x] All warnings display with warning styling
- [x] Submit button is disabled when validation fails
- [x] Submit button has correct visual disabled state
- [x] Validation updates in real-time as content changes

**Verification Steps:**
1. Test with missing title - verify error displays
2. Test with no content - verify error displays
3. Test with oversized file - verify error displays
4. Test with all valid - verify submit enabled
5. Visual inspection of styling

---

### Task 14: Add Pre-Upload Validation in useFileUpload [x] COMPLETED

**File:** `src/components/ItemCapture/hooks/useFileUpload.ts`

**Implementation Notes:** Enhanced validateFileInternal to use type-specific size limits from CAPTURE_CONSTRAINTS.

**Objective:** Add validation before files are added to prevent invalid files from being accepted.

**Implementation Requirements:**

1. Before adding a file to state:
   - Validate individual file size with `validateFileSize()`
   - Validate total size won't exceed limit
   - Validate MIME type with `validateMimeType()`

2. If validation fails:
   - Do not add file to state
   - Dispatch error to state (if state management supports)
   - Or return error from the handler

3. Calculate prospective total:
   ```typescript
   const currentTotal = state.mediaItems.reduce(
     (sum, item) => sum + (item.file?.size || 0),
     0
   );
   const prospectiveTotal = currentTotal + file.size;
   ```

**Error Message for Total Size:**
- "Adding this file would exceed the {limit} total limit"

**Acceptance Criteria:**
- [x] Oversized files are rejected before being added
- [x] Files that would exceed total limit are rejected
- [x] Invalid MIME types are rejected
- [x] User sees error message when file is rejected
- [x] Valid files are added successfully

**Verification Steps:**
1. Attempt to upload 150 MB video (should fail)
2. Upload multiple files until total limit approached
3. Verify next file is rejected appropriately

---

### Task 15: Add Unit Tests for Validation Functions [x] COMPLETED

**File:** `src/components/ItemCapture/utils/__tests__/validation.test.ts`

**Implementation Notes:** Created comprehensive test suite with 60+ test cases covering all validation functions.

**Objective:** Create comprehensive unit tests for all validation functions.

**Test Cases Required:**

1. **validateTitle tests:**
   - Empty string returns error
   - Whitespace-only returns error
   - Valid title returns success
   - Over-limit returns error with count

2. **validateContentRequirement tests:**
   - No media, no text returns error
   - Has media, no text returns valid
   - No media, has text returns valid
   - Has both returns valid
   - Whitespace-only text counts as empty

3. **validateFileSize tests:**
   - Video under limit returns valid
   - Video over limit returns error
   - Image under limit returns valid
   - Image over limit returns error
   - PDF under limit returns valid
   - PDF over limit returns error
   - Error includes human-readable sizes

4. **validateTotalSize tests:**
   - Empty array returns valid with 0 size
   - Under limit returns valid
   - Over limit returns error
   - Handles undefined file properties

5. **validateTextLength tests:**
   - Under limit returns valid
   - At limit returns valid
   - Over limit returns warning/error

6. **validateImageCount tests:**
   - Under limit returns valid
   - At limit returns valid
   - Over limit returns error
   - Only counts images, not videos/PDFs

7. **validateMimeType tests:**
   - All supported image formats valid
   - All supported video formats valid
   - PDF format valid
   - Unsupported format returns error

8. **validateItemCapture tests:**
   - All valid returns isValid: true
   - Single error returns isValid: false
   - Multiple errors all included
   - Warnings don't affect isValid

**Acceptance Criteria:**
- [x] All test cases pass
- [x] Tests cover edge cases
- [x] Tests are properly isolated
- [x] No flaky tests

**Verification Steps:**
1. Run: `npm test -- validation.test.ts`
2. Verify 100% of test cases pass

---

### Task 16: Add Integration Tests for Validation Hook [x] COMPLETED

**File:** `src/components/ItemCapture/hooks/__tests__/useItemValidation.test.ts`

**Implementation Notes:** Created integration test suite with 30+ test cases covering hook behavior, real-time updates, memoization, and content state.

**Objective:** Create integration tests for the useItemValidation hook.

**Test Cases Required:**

1. **Initial state tests:**
   - Hook returns valid initial structure
   - Empty metadata triggers title error
   - Empty content triggers content error

2. **Real-time update tests:**
   - Validation updates when title changes
   - Validation updates when media added
   - Validation updates when instructions change

3. **Size calculation tests:**
   - calculateTotalSize returns correct sum
   - getRemainingSize calculates correctly
   - formatSize returns human-readable strings

4. **Memoization tests:**
   - Same inputs don't trigger recalculation
   - Changed inputs trigger recalculation

**Test Setup Pattern:**
```typescript
import { renderHook, act } from '@testing-library/react';
import { useItemValidation } from '../useItemValidation';
```

**Acceptance Criteria:**
- [x] All integration tests pass
- [x] Hook behavior matches specification
- [x] Memoization works correctly

**Verification Steps:**
1. Run: `npm test -- useItemValidation.test.ts`
2. Verify all tests pass

---

## Implementation Order

The tasks should be completed in the following order to maintain proper dependency flow:

```
Phase A: Foundation (Tasks 1-2)
├── Task 1: Create constants (no dependencies)
└── Task 2: Create formatFileSize (depends on Task 1)

Phase B: Pure Validators (Tasks 3-9, can be parallelized)
├── Task 3: validateTitle
├── Task 4: validateContentRequirement
├── Task 5: validateFileSize (depends on Task 1)
├── Task 6: validateTotalSize (depends on Tasks 1, 5)
├── Task 7: validateTextLength (depends on Task 1)
├── Task 8: validateImageCount (depends on Task 1)
└── Task 9: validateMimeType (depends on Task 1)

Phase C: Aggregation (Task 10)
└── Task 10: validateItemCapture (depends on Tasks 3-9)

Phase D: React Integration (Tasks 11-14)
├── Task 11: ValidationMessage component (no dependencies)
├── Task 12: useItemValidation hook (depends on Tasks 2, 10)
├── Task 13: ReviewStep integration (depends on Tasks 11, 12)
└── Task 14: useFileUpload validation (depends on Tasks 5, 6)

Phase E: Testing (Tasks 15-16)
├── Task 15: Unit tests (depends on Tasks 3-10)
└── Task 16: Integration tests (depends on Task 12)
```

---

## Acceptance Criteria Mapping

From Request #052:

| Acceptance Criterion | Implementation Task |
|----------------------|---------------------|
| Submission cannot proceed when any required metadata field is empty/invalid | Tasks 3, 10, 13 |
| Submission cannot proceed when neither media files nor text content has been provided | Tasks 4, 10, 13 |
| Warning appears when a single file exceeds the maximum allowed size for its type | Tasks 5, 10, 14 |
| Warning appears when the total size of all files exceeds the maximum total upload size | Tasks 6, 10, 13 |
| Validation errors display specific, user-friendly messages | Tasks 3-9, 11 |
| Total upload size calculation accurately reflects the sum of all selected media files | Tasks 6, 12 |
| Validation state updates in real-time as users add or remove content | Tasks 12, 13 |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| MediaItem type not available | Define minimal interface inline if needed |
| ReviewStep doesn't exist yet | Task 13 can be deferred until ReviewStep is created |
| useFileUpload hook structure differs | Adapt integration approach to actual hook structure |
| TypeScript compilation errors | Run `tsc --noEmit` after each task |

---

## Manual Testing Checklist

After all tasks complete:

- [ ] Submit disabled when title empty
- [ ] Submit disabled when no content (no media, no text)
- [ ] Error message appears for empty title
- [ ] Error message appears for no content
- [ ] Warning appears for file exceeding type-specific size limit
- [ ] Warning appears for total size exceeding limit
- [ ] Total size indicator updates in real-time
- [ ] Submit enabled when all validations pass
- [ ] Error messages are specific and actionable
- [ ] All error/warning styling is correct
- [ ] Works on iPhone Safari
- [ ] Works on Android Chrome
- [ ] Works on desktop browsers

---

## Related Documentation

- [Overview Document](/docs/REQ-052-create-validation-layer-overview.md)
- [Implementation Plan](/docs/prd/item-capture-implementation-plan.md)
- [Request #052](/docs/gen_requests.md)
- [access-validation.ts](/src/lib/access-validation.ts) - Validation pattern reference
- [error-utils.ts](/src/lib/error-utils.ts) - Error message pattern reference
- [ItemForm.tsx](/src/components/ItemForm.tsx) - Form validation pattern reference
