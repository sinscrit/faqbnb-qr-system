# REQ-043: Add PDF Thumbnail Generation - Detailed Task Breakdown

**Generated:** 2025-12-31T22:10:00
**Last Modified:** 2025-12-31T22:10:00
**Request Reference:** REQ-043 in `/docs/gen_requests.md`
**Overview Document:** `/docs/REQ-043-add-pdf-thumbnail-generation-overview.md`
**Implementation Plan Reference:** `/docs/prd/item-capture-implementation-plan.md`
**Phase:** 3 - File Upload & Text
**Task ID:** 3.3

---

## Document Purpose

This document provides granular, implementation-ready task breakdown for REQ-043: Add PDF Thumbnail Generation. Each task is designed to be ≤ 1 story point (a few hours of focused work) and includes specific verification steps.

---

## Prerequisites

Before starting implementation, verify:

- [ ] Phase 1 is complete (state machine, wizard navigation)
- [ ] Task 3.1 (useFileUpload hook) is complete
- [ ] Task 3.2 (FileUploadStep) is complete
- [ ] pdfjs-dist is installed (`npm list pdfjs-dist` should show v4.10.38+)
- [ ] lucide-react is installed (`npm list lucide-react` should show v0.525.0+)

---

## Authorized Files and Functions for Modification

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemCapture/utils/pdfConstants.ts` | PDF error types and constants |
| `src/components/ItemCapture/hooks/usePDFThumbnail.ts` | PDF thumbnail hook with loading/error states |
| `src/components/ItemCapture/components/shared/PDFPlaceholder.tsx` | Placeholder component for PDF errors |
| `src/components/ItemCapture/components/shared/PageCountBadge.tsx` | Page count badge component |

### Files to Modify

| File Path | Modification | Reason |
|-----------|--------------|--------|
| `src/components/ItemCapture/utils/pdfThumbnailGenerator.ts` | Enhance with error handling, timeout, structured result | Core enhancement |
| `src/components/ItemCapture/components/steps/FileUploadStep.tsx` | Integrate PDF thumbnail hook, add page count badge | UI integration |
| `src/components/ItemCapture/index.ts` | Export new components and hooks | Public API |
| `src/components/ItemCapture/ItemCapture.types.ts` | Add PDFThumbnailResult and related types | Type definitions |

### Files NOT to Modify

- `src/lib/utils.ts` - General utilities, not component-specific
- `src/types/index.ts` - Global types, PDF types go in ItemCapture.types.ts
- Any files outside `src/components/ItemCapture/` directory
- `package.json` - pdfjs-dist already installed

---

## Task Breakdown

### Task 3.3.1: Define PDF Error Types and Constants

**Objective:** Create a constants file with PDF error codes, processing constraints, and user-friendly error messages.

**File:** `src/components/ItemCapture/utils/pdfConstants.ts`

**Subtasks:**

1. Create the new file `src/components/ItemCapture/utils/pdfConstants.ts`
2. Define `PDFErrorCode` union type with all error codes:
   - `PDF_PASSWORD_PROTECTED`
   - `PDF_CORRUPT`
   - `PDF_EMPTY`
   - `PDF_TIMEOUT`
   - `PDF_LOAD_FAILED`
   - `CANVAS_RENDER_FAILED`
   - `UNKNOWN_ERROR`
3. Define `PDF_CONSTRAINTS` object with:
   - `THUMBNAIL_TIMEOUT: 2000` (milliseconds)
   - `MAX_PDF_SIZE_FOR_THUMBNAIL: 50 * 1024 * 1024` (50MB)
   - `THUMBNAIL_SCALE: 0.5`
   - `THUMBNAIL_QUALITY: 0.8`
4. Define `PDF_ERROR_MESSAGES` record mapping each `PDFErrorCode` to:
   - `title`: Short error title (e.g., "Protected PDF")
   - `description`: User-friendly explanation
5. Export all types and constants

**Verification:**
- [ ] File compiles without TypeScript errors
- [ ] All 7 error codes are defined
- [ ] All constraint values are defined as constants
- [ ] All error codes have corresponding messages
- [ ] Run `npx tsc --noEmit` to verify no type errors

**Estimated Time:** 20 minutes

---

### Task 3.3.2: Define TypeScript Interfaces for PDF Thumbnail Result

**Objective:** Add PDFThumbnailResult and related interfaces to the types file.

**File:** `src/components/ItemCapture/ItemCapture.types.ts` (create if not exists)

**Subtasks:**

1. Import `PDFErrorCode` from `./utils/pdfConstants`
2. Define `PDFThumbnailError` interface:
   ```typescript
   interface PDFThumbnailError {
     code: PDFErrorCode;
     message: string;
     userMessage: string;
   }
   ```
3. Define `PDFThumbnailResult` interface:
   ```typescript
   interface PDFThumbnailResult {
     thumbnail: Blob | null;
     pageCount: number;
     error?: PDFThumbnailError;
     isPasswordProtected: boolean;
     isCorrupt: boolean;
   }
   ```
4. Export all interfaces

**Verification:**
- [ ] File compiles without TypeScript errors
- [ ] Interfaces match the specification in the overview document
- [ ] Run `npx tsc --noEmit` to verify no type errors

**Estimated Time:** 15 minutes

---

### Task 3.3.3: Enhance pdfThumbnailGenerator - Add Helper Functions

**Objective:** Add helper functions for error creation and result construction to the existing pdfThumbnailGenerator.ts.

**File:** `src/components/ItemCapture/utils/pdfThumbnailGenerator.ts`

**Subtasks:**

1. Add imports for constants and types:
   ```typescript
   import { PDF_CONSTRAINTS, PDFErrorCode, PDF_ERROR_MESSAGES } from './pdfConstants';
   import type { PDFThumbnailResult, PDFThumbnailError } from '../ItemCapture.types';
   ```
2. Add `createResult()` helper function that constructs `PDFThumbnailResult` with defaults:
   - `thumbnail: null`
   - `pageCount: 0`
   - `isPasswordProtected: false`
   - `isCorrupt: false`
3. Add `createError()` helper function that creates `PDFThumbnailError` from error code:
   - Takes `code: PDFErrorCode` and optional `customMessage?: string`
   - Looks up title/description from `PDF_ERROR_MESSAGES`
   - Returns structured error object
4. Ensure existing functions still work (backward compatibility)

**Verification:**
- [ ] Existing `generatePDFThumbnail()` and `getPDFPageCount()` still work
- [ ] Helper functions are properly typed
- [ ] No TypeScript errors
- [ ] Run `npx tsc --noEmit` to verify

**Estimated Time:** 25 minutes

---

### Task 3.3.4: Enhance pdfThumbnailGenerator - Add Error Handler

**Objective:** Add comprehensive error handling for pdfjs-dist errors.

**File:** `src/components/ItemCapture/utils/pdfThumbnailGenerator.ts`

**Subtasks:**

1. Add `handlePDFError()` function that classifies errors:
   - Check for password-protected: `PasswordException`, message includes "password"
   - Check for corrupt: `InvalidPDFException`, message includes "Invalid PDF" or "corrupted"
   - Check for abort: `AbortError`, message includes "Aborted"
   - Default to `UNKNOWN_ERROR`
2. Function should return `PDFThumbnailResult` with appropriate flags:
   - `isPasswordProtected: true` for password errors
   - `isCorrupt: true` for corruption errors
3. Log unknown errors to console for debugging

**Verification:**
- [ ] Function handles password-protected PDF errors correctly
- [ ] Function handles corrupt PDF errors correctly
- [ ] Function handles abort/timeout errors correctly
- [ ] Unknown errors are logged and return UNKNOWN_ERROR
- [ ] Run `npx tsc --noEmit` to verify no type errors

**Estimated Time:** 30 minutes

---

### Task 3.3.5: Implement generatePDFThumbnailWithMetadata Function

**Objective:** Create the new main function that combines thumbnail generation with error handling and metadata.

**File:** `src/components/ItemCapture/utils/pdfThumbnailGenerator.ts`

**Subtasks:**

1. Add new async function `generatePDFThumbnailWithMetadata(file: File, signal?: AbortSignal): Promise<PDFThumbnailResult>`
2. Add file size check:
   - If `file.size > PDF_CONSTRAINTS.MAX_PDF_SIZE_FOR_THUMBNAIL`, return early with `PDF_LOAD_FAILED` error
3. Add abort signal check before loading:
   - If `signal?.aborted`, return with `PDF_TIMEOUT` error
4. Wrap existing pdfjs logic in try-catch:
   - Dynamic import pdfjs-dist
   - Configure worker from CDN
   - Get arrayBuffer from file
   - Load PDF document
   - Check for empty PDF (`pdf.numPages === 0`)
   - Get first page and render to canvas
   - Convert canvas to blob
   - Return success result with thumbnail, pageCount, and flags
5. Call `handlePDFError()` in catch block
6. Add abort signal listener that destroys the loading task:
   ```typescript
   const abortPromise = signal
     ? new Promise<never>((_, reject) => {
         signal.addEventListener('abort', () => {
           loadingTask.destroy();
           reject(new DOMException('Aborted', 'AbortError'));
         });
       })
     : null;
   ```
7. Race the loading promise against abort promise
8. Cleanup: call `page.cleanup()` and `pdf.destroy()` after successful render

**Verification:**
- [ ] Function returns thumbnail blob for valid PDFs
- [ ] Function returns correct pageCount
- [ ] Function returns error for oversized files
- [ ] Function handles abort signal correctly
- [ ] Empty PDFs return PDF_EMPTY error
- [ ] Manual test with a sample PDF file
- [ ] Run `npx tsc --noEmit` to verify no type errors

**Estimated Time:** 45 minutes

---

### Task 3.3.6: Update Legacy Functions for Backward Compatibility

**Objective:** Update existing `generatePDFThumbnail()` and `getPDFPageCount()` to use the new function internally.

**File:** `src/components/ItemCapture/utils/pdfThumbnailGenerator.ts`

**Subtasks:**

1. Add `@deprecated` JSDoc comment to `generatePDFThumbnail()`
2. Update `generatePDFThumbnail()` implementation:
   ```typescript
   export async function generatePDFThumbnail(file: File): Promise<Blob | null> {
     const result = await generatePDFThumbnailWithMetadata(file);
     return result.thumbnail;
   }
   ```
3. Add `@deprecated` JSDoc comment to `getPDFPageCount()`
4. Update `getPDFPageCount()` implementation:
   ```typescript
   export async function getPDFPageCount(file: File): Promise<number> {
     const result = await generatePDFThumbnailWithMetadata(file);
     return result.pageCount;
   }
   ```
5. Export `generatePDFThumbnailWithMetadata` and all types

**Verification:**
- [ ] Legacy functions still return correct types
- [ ] Legacy functions use new implementation internally
- [ ] No breaking changes to existing API
- [ ] Run `npx tsc --noEmit` to verify no type errors

**Estimated Time:** 15 minutes

---

### Task 3.3.7: Create PDFPlaceholder Component

**Objective:** Create a visual placeholder component for PDF error states.

**File:** `src/components/ItemCapture/components/shared/PDFPlaceholder.tsx`

**Subtasks:**

1. Create directory structure if needed: `src/components/ItemCapture/components/shared/`
2. Create `PDFPlaceholder.tsx` with `'use client'` directive
3. Import icons from lucide-react: `FileText`, `Lock`, `AlertTriangle`, `FileWarning`
4. Import `cn` utility from `@/lib/utils`
5. Import `PDFErrorCode` from constants
6. Define `PDFPlaceholderProps` interface:
   - `errorCode?: PDFErrorCode`
   - `isPasswordProtected?: boolean`
   - `isCorrupt?: boolean`
   - `isLoading?: boolean`
   - `className?: string`
7. Implement component logic:
   - If `isLoading`: Show pulsing FileText icon with gray background
   - If `isPasswordProtected`: Show Lock icon with amber colors
   - If `isCorrupt`: Show FileWarning icon with red colors
   - If `errorCode` (other error): Show AlertTriangle with orange colors
   - Default: Show FileText with red/pink colors
8. Use Tailwind classes for styling, allow className override

**Verification:**
- [ ] Component renders correctly in loading state
- [ ] Component shows lock icon for password-protected
- [ ] Component shows warning icon for corrupt
- [ ] Component shows generic error icon for other errors
- [ ] Component is properly typed
- [ ] Run `npx tsc --noEmit` to verify no type errors

**Estimated Time:** 30 minutes

---

### Task 3.3.8: Create PageCountBadge Component

**Objective:** Create a badge component to display PDF page count.

**File:** `src/components/ItemCapture/components/shared/PageCountBadge.tsx`

**Subtasks:**

1. Create `PageCountBadge.tsx` with `'use client'` directive
2. Import `cn` utility from `@/lib/utils`
3. Define `PageCountBadgeProps` interface:
   - `pageCount: number`
   - `className?: string`
4. Implement component:
   - If `pageCount <= 0`, return `null`
   - Format label: "1 page" for single page, "{n} pages" for multiple
   - Style as small badge with dark semi-transparent background
   - Position absolute at bottom-right corner
   - Use `cn()` for className merging

**Verification:**
- [ ] Component returns null for pageCount <= 0
- [ ] Component shows "1 page" for pageCount === 1
- [ ] Component shows "X pages" for pageCount > 1
- [ ] Component styling matches design (bottom-right, semi-transparent)
- [ ] Run `npx tsc --noEmit` to verify no type errors

**Estimated Time:** 15 minutes

---

### Task 3.3.9: Create usePDFThumbnail Hook - State and Types

**Objective:** Create the hook file with state types and initial structure.

**File:** `src/components/ItemCapture/hooks/usePDFThumbnail.ts`

**Subtasks:**

1. Create directory structure if needed: `src/components/ItemCapture/hooks/`
2. Create `usePDFThumbnail.ts` with `'use client'` directive
3. Import React hooks: `useState`, `useEffect`, `useRef`, `useCallback`
4. Import types from `../utils/pdfThumbnailGenerator`
5. Import `PDF_CONSTRAINTS` from `../utils/pdfConstants`
6. Define `PDFThumbnailState` interface:
   - `thumbnailUrl: string | null`
   - `pageCount: number`
   - `isLoading: boolean`
   - `error: PDFThumbnailError | null`
   - `isPasswordProtected: boolean`
   - `isCorrupt: boolean`
7. Define `initialState` constant with default values
8. Export hook signature: `function usePDFThumbnail(file: File | null): PDFThumbnailState`

**Verification:**
- [ ] File structure is correct
- [ ] Types are properly defined
- [ ] No TypeScript errors
- [ ] Run `npx tsc --noEmit` to verify

**Estimated Time:** 20 minutes

---

### Task 3.3.10: Implement usePDFThumbnail Hook - Core Logic

**Objective:** Implement the main hook logic with cleanup and abort handling.

**File:** `src/components/ItemCapture/hooks/usePDFThumbnail.ts`

**Subtasks:**

1. Add refs for tracking:
   - `abortControllerRef` - for cancellation
   - `thumbnailUrlRef` - for object URL cleanup
   - `isUnmountedRef` - for preventing state updates after unmount
2. Implement `cleanup()` callback:
   - Abort pending operation if `abortControllerRef.current` exists
   - Revoke object URL if `thumbnailUrlRef.current` exists
3. Implement main `useEffect` for file processing:
   - Call cleanup on file change
   - Return early if no file or not a PDF (check MIME type and extension)
   - Set loading state
   - Create AbortController with timeout using `PDF_CONSTRAINTS.THUMBNAIL_TIMEOUT`
   - Dynamic import and call `generatePDFThumbnailWithMetadata`
   - Create object URL from result thumbnail
   - Update state with result
   - Clear timeout in finally block
4. Add cleanup effect for unmount:
   - Set `isUnmountedRef.current = true`
   - Call cleanup function
5. Return state

**Verification:**
- [ ] Hook returns correct state for valid PDF
- [ ] Hook sets loading state during processing
- [ ] Hook returns error state for invalid PDFs
- [ ] Hook cleans up object URLs on file change
- [ ] Hook cancels pending operation on file change
- [ ] Hook handles unmount correctly
- [ ] Run `npx tsc --noEmit` to verify no type errors

**Estimated Time:** 45 minutes

---

### Task 3.3.11: Create FileUploadStep Component Structure

**Objective:** Create the FileUploadStep component with basic structure (if it doesn't exist).

**Note:** This task assumes FileUploadStep.tsx needs to be created. If it already exists from Task 3.2, skip to Task 3.3.12.

**File:** `src/components/ItemCapture/components/steps/FileUploadStep.tsx`

**Subtasks:**

1. Create directory structure if needed: `src/components/ItemCapture/components/steps/`
2. Create `FileUploadStep.tsx` with `'use client'` directive
3. Define basic component structure with props interface
4. Add placeholder file grid for uploaded files
5. Export component

**Verification:**
- [ ] Component renders without errors
- [ ] Directory structure is correct
- [ ] Run `npx tsc --noEmit` to verify no type errors

**Estimated Time:** 30 minutes (skip if exists)

---

### Task 3.3.12: Integrate PDF Thumbnail into FileCard Component

**Objective:** Update the FileCard component (within FileUploadStep) to display PDF thumbnails and page count.

**File:** `src/components/ItemCapture/components/steps/FileUploadStep.tsx`

**Subtasks:**

1. Import new dependencies at top of file:
   - `usePDFThumbnail` from `../../hooks/usePDFThumbnail`
   - `PDFPlaceholder` from `../shared/PDFPlaceholder`
   - `PageCountBadge` from `../shared/PageCountBadge`
2. In FileCard component (or create if needed):
   - Detect if file is PDF by checking `file.type === 'application/pdf'` or file extension
   - Call `usePDFThumbnail(isPDF ? file : null)`
3. Update thumbnail display area:
   - If loading: Show `<PDFPlaceholder isLoading />`
   - If thumbnailUrl exists: Show `<img src={thumbnailUrl} />`
   - If no thumbnail but not loading: Show `<PDFPlaceholder errorCode={...} />`
4. Add PageCountBadge when pageCount > 0:
   ```tsx
   {pdfState.pageCount > 0 && (
     <PageCountBadge pageCount={pdfState.pageCount} />
   )}
   ```
5. Show error message in file info section if error exists

**Verification:**
- [ ] PDF files show loading state during thumbnail generation
- [ ] PDF files show generated thumbnail when available
- [ ] PDF files show placeholder when thumbnail fails
- [ ] Page count badge appears for PDFs with pages
- [ ] Error message appears for failed thumbnails
- [ ] Non-PDF files are not affected
- [ ] Run `npx tsc --noEmit` to verify no type errors

**Estimated Time:** 45 minutes

---

### Task 3.3.13: Update Exports in index.ts

**Objective:** Export new components and hooks from the ItemCapture barrel export.

**File:** `src/components/ItemCapture/index.ts` (create if not exists)

**Subtasks:**

1. Create or update `src/components/ItemCapture/index.ts`
2. Export types:
   - `PDFThumbnailResult`
   - `PDFThumbnailError`
   - `PDFErrorCode`
3. Export components:
   - `PDFPlaceholder`
   - `PageCountBadge`
4. Export hooks:
   - `usePDFThumbnail`
5. Export utility functions:
   - `generatePDFThumbnailWithMetadata`
6. Re-export constants:
   - `PDF_CONSTRAINTS`
   - `PDF_ERROR_MESSAGES`

**Verification:**
- [ ] All exports are accessible from `@/components/ItemCapture`
- [ ] No circular dependency errors
- [ ] Run `npx tsc --noEmit` to verify no type errors

**Estimated Time:** 15 minutes

---

### Task 3.3.14: Manual Testing - Valid PDF Files

**Objective:** Test PDF thumbnail generation with various valid PDF files.

**Test Files Needed:**
- Small PDF (< 1MB, 1-3 pages)
- Medium PDF (1-10MB, 10-50 pages)
- Large PDF (10-50MB, 100+ pages)

**Test Steps:**

1. Start development server: `npm run dev`
2. Navigate to the FileUploadStep in the ItemCapture wizard
3. Upload a small PDF:
   - [ ] Loading state appears
   - [ ] Thumbnail generates within 2 seconds
   - [ ] Page count badge shows correct count
   - [ ] Thumbnail is readable and correct aspect ratio
4. Upload a medium PDF:
   - [ ] Loading state appears
   - [ ] Thumbnail generates within 2 seconds
   - [ ] Page count badge shows correct count
5. Upload a large PDF:
   - [ ] If under 50MB: thumbnail generates (may take longer)
   - [ ] If over 50MB: shows placeholder with appropriate message
6. Upload multiple PDFs:
   - [ ] Each gets its own thumbnail
   - [ ] No memory leaks (check DevTools)
7. Remove a PDF and add new one:
   - [ ] Previous object URLs are revoked
   - [ ] New thumbnail generates correctly

**Verification:**
- [ ] All test cases pass
- [ ] No console errors
- [ ] No memory leaks in DevTools

**Estimated Time:** 30 minutes

---

### Task 3.3.15: Manual Testing - Error Cases

**Objective:** Test PDF thumbnail generation with error cases.

**Test Files Needed:**
- Password-protected PDF
- Corrupt/damaged PDF
- Empty PDF (0 pages)
- Non-PDF file renamed to .pdf

**Test Steps:**

1. Upload password-protected PDF:
   - [ ] Lock icon placeholder appears
   - [ ] "Protected PDF" message shown
   - [ ] File can still be kept in upload list
2. Upload corrupt PDF:
   - [ ] Warning icon placeholder appears
   - [ ] "Damaged PDF" message shown
   - [ ] File can still be kept in upload list
3. Upload empty PDF (if available):
   - [ ] Appropriate placeholder appears
   - [ ] "Empty PDF" message shown
4. Upload non-PDF disguised as PDF:
   - [ ] Error is handled gracefully
   - [ ] Appropriate placeholder shown
5. Test rapid file switching:
   - [ ] Upload PDF, immediately remove and upload another
   - [ ] Previous operation is cancelled
   - [ ] New file processes correctly
   - [ ] No stale thumbnails appear

**Verification:**
- [ ] All error cases handled gracefully
- [ ] User can proceed with upload despite thumbnail failures
- [ ] No uncaught exceptions
- [ ] Error messages are user-friendly

**Estimated Time:** 30 minutes

---

### Task 3.3.16: Manual Testing - Performance and Memory

**Objective:** Verify performance and memory characteristics.

**Test Steps:**

1. Open browser DevTools → Performance panel
2. Upload a medium PDF (5-10MB):
   - [ ] Main thread blocked < 100ms
   - [ ] No jank during thumbnail generation
3. Open DevTools → Memory panel
4. Take heap snapshot
5. Upload 5 PDFs
6. Remove all PDFs
7. Take another heap snapshot:
   - [ ] No significant memory increase
   - [ ] Object URLs properly revoked
8. Monitor console for memory warnings

**Verification:**
- [ ] Performance targets met
- [ ] No memory leaks
- [ ] Object URLs cleaned up

**Estimated Time:** 15 minutes

---

## Task Summary Table

| Task ID | Description | Depends On | Estimated Time |
|---------|-------------|------------|----------------|
| 3.3.1 | Define PDF error types and constants | - | 20 min |
| 3.3.2 | Define TypeScript interfaces | 3.3.1 | 15 min |
| 3.3.3 | Add helper functions to pdfThumbnailGenerator | 3.3.1, 3.3.2 | 25 min |
| 3.3.4 | Add error handler to pdfThumbnailGenerator | 3.3.3 | 30 min |
| 3.3.5 | Implement generatePDFThumbnailWithMetadata | 3.3.4 | 45 min |
| 3.3.6 | Update legacy functions | 3.3.5 | 15 min |
| 3.3.7 | Create PDFPlaceholder component | 3.3.1 | 30 min |
| 3.3.8 | Create PageCountBadge component | - | 15 min |
| 3.3.9 | Create usePDFThumbnail hook structure | 3.3.5 | 20 min |
| 3.3.10 | Implement usePDFThumbnail core logic | 3.3.9 | 45 min |
| 3.3.11 | Create FileUploadStep structure | - | 30 min* |
| 3.3.12 | Integrate PDF thumbnail into FileCard | 3.3.7, 3.3.8, 3.3.10 | 45 min |
| 3.3.13 | Update exports in index.ts | All above | 15 min |
| 3.3.14 | Manual testing - valid PDFs | 3.3.12 | 30 min |
| 3.3.15 | Manual testing - error cases | 3.3.12 | 30 min |
| 3.3.16 | Manual testing - performance | 3.3.14 | 15 min |

**Total Estimated Time:** ~6 hours 15 minutes
*Task 3.3.11 can be skipped if FileUploadStep already exists

---

## Dependency Graph

```
3.3.1 (Constants)
   │
   ├──► 3.3.2 (Types)
   │       │
   │       └──► 3.3.3 (Helpers)
   │               │
   │               └──► 3.3.4 (Error Handler)
   │                       │
   │                       └──► 3.3.5 (Main Function)
   │                               │
   │                               ├──► 3.3.6 (Legacy Compat)
   │                               │
   │                               └──► 3.3.9 (Hook Structure)
   │                                       │
   │                                       └──► 3.3.10 (Hook Logic)
   │                                               │
   └──► 3.3.7 (PDFPlaceholder)                     │
           │                                        │
           └──────────┐                             │
                      │                             │
3.3.8 (PageCountBadge)├─────────────────────────────┘
                      │
                      └──► 3.3.12 (FileCard Integration)
                              │
                              └──► 3.3.13 (Exports)
                                      │
                                      └──► 3.3.14, 3.3.15, 3.3.16 (Testing)
```

---

## Success Criteria Checklist

Based on REQ-043 Acceptance Criteria from gen_requests.md:

- [ ] Uploaded PDF files display a thumbnail preview showing the first page of the document
- [ ] Page count metadata appears next to each PDF thumbnail (e.g., "3 pages")
- [ ] Corrupt PDF files display a placeholder image with a message indicating the file cannot be previewed
- [ ] Password-protected PDFs display a placeholder image with a message indicating the file is protected
- [ ] Thumbnail generation completes within 2 seconds for PDFs under 10MB
- [ ] System handles PDFs with zero pages or malformed structure without crashing
- [ ] Generated thumbnails maintain readable aspect ratio and quality
- [ ] Users can still proceed with upload even when thumbnail generation fails

Additional Technical Criteria from Overview:

- [ ] Enhanced pdfThumbnailGenerator maintains backward compatibility
- [ ] usePDFThumbnail hook properly manages object URL lifecycle
- [ ] Abort controller correctly cancels pending operations
- [ ] Error states correctly map to user-friendly messages
- [ ] PDFPlaceholder displays appropriate icons for each error type

---

## Implementation Order Recommendation

For sequential implementation:

1. **Day 1 Morning:** Tasks 3.3.1 → 3.3.2 → 3.3.3 → 3.3.4 (Foundation)
2. **Day 1 Afternoon:** Tasks 3.3.5 → 3.3.6 → 3.3.7 → 3.3.8 (Core + Components)
3. **Day 2 Morning:** Tasks 3.3.9 → 3.3.10 → 3.3.11 (if needed) (Hook)
4. **Day 2 Afternoon:** Tasks 3.3.12 → 3.3.13 → 3.3.14 → 3.3.15 → 3.3.16 (Integration + Testing)

For parallel implementation with 2 developers:

**Developer A:** 3.3.1 → 3.3.2 → 3.3.3 → 3.3.4 → 3.3.5 → 3.3.6 → 3.3.9 → 3.3.10
**Developer B:** (wait for 3.3.1) → 3.3.7 → 3.3.8 → (wait for 3.3.10) → 3.3.11 → 3.3.12
**Together:** 3.3.13 → 3.3.14 → 3.3.15 → 3.3.16

---

## References

- [REQ-043 Overview Document](/docs/REQ-043-add-pdf-thumbnail-generation-overview.md)
- [REQ-043 in gen_requests.md](/docs/gen_requests.md)
- [Implementation Plan](/docs/prd/item-capture-implementation-plan.md)
- [Existing pdfThumbnailGenerator.ts](/src/components/ItemCapture/utils/pdfThumbnailGenerator.ts)
- [PDF.js Documentation](https://mozilla.github.io/pdf.js/)
- [AbortController - MDN](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)
