# REQ-041: Create useFileUpload Hook - Detailed Task Breakdown

**Generated:** 2025-12-31T15:30:00
**Last Modified:** 2025-12-31T15:30:00
**Overview Reference:** `/docs/REQ-041-create-usefileupload-hook-overview.md`
**Request Reference:** REQ-041 in `/docs/gen_requests.md`
**Implementation Plan Reference:** `/docs/prd/item-capture-implementation-plan.md`
**Phase:** 3 - File Upload & Text
**Task ID:** 3.1

---

## Document Purpose

This document provides step-by-step implementation tasks for the `useFileUpload` hook. Each task is scoped to approximately 1 story point (a few hours of focused work) and includes specific verification steps.

---

## Prerequisites

Before starting implementation, verify the following are complete:

| Prerequisite | Location | Status Check |
|--------------|----------|--------------|
| Phase 1 Complete | Tasks 1.1-1.5 | Directory structure exists |
| ItemCapture directory | `src/components/ItemCapture/` | Verify directory exists |
| hooks directory | `src/components/ItemCapture/hooks/` | Create if not exists |
| constants.ts | `src/components/ItemCapture/utils/constants.ts` | Verify file exists with CAPTURE_CONSTRAINTS |

---

## Authorized Files for Modification

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemCapture/hooks/useFileUpload.ts` | Main hook implementation |

### Files to Modify

| File Path | Modification | Reason |
|-----------|--------------|--------|
| `src/components/ItemCapture/ItemCapture.types.ts` | Add file upload type interfaces | Type definitions |
| `src/components/ItemCapture/index.ts` | Export `useFileUpload` hook | Public API |

### Files to Reference (Read-Only)

| File Path | Reference Purpose |
|-----------|-------------------|
| `src/hooks/useQRCodeGeneration.ts` | Pattern reference for state management, cleanup, refs |
| `src/components/ItemCapture/utils/constants.ts` | File size limits, supported formats |
| `src/lib/utils.ts` | Utility patterns (cn function, etc.) |

---

## Implementation Tasks

### Task 3.1.1: Create TypeScript Interfaces for File Upload

**Objective:** Define all TypeScript interfaces required for the useFileUpload hook in ItemCapture.types.ts.

**Estimated Time:** 30 minutes

**Dependencies:** Phase 1 complete (ItemCapture directory structure exists)

**Implementation Steps:**

1. Open `src/components/ItemCapture/ItemCapture.types.ts` (create if not exists)
2. Add the following type definitions:

   - `UseFileUploadOptions` interface:
     - `allowedMimeTypes?: string[]` - Array of allowed MIME types
     - `maxFileSize?: number` - Maximum file size in bytes per file
     - `maxTotalSize?: number` - Maximum total size for all files
     - `multiple?: boolean` - Allow multiple file selection
     - `maxFiles?: number` - Maximum number of files
     - `accept?: string` - Accept attribute for file input
     - `onFilesAdded?: (files: ValidatedFile[]) => void` - Callback when files added
     - `onFilesRejected?: (rejections: FileRejection[]) => void` - Callback when files rejected
     - `debug?: boolean` - Enable debug logging

   - `UseFileUploadReturn` interface with all return values from the hook

   - `ValidatedFile` interface:
     - `id: string` - Unique UUID
     - `file: File` - Original File object
     - `mimeType: string` - Validated MIME type
     - `size: number` - File size in bytes
     - `name: string` - Original filename
     - `extension: string` - Lowercase extension
     - `category: 'image' | 'video' | 'pdf' | 'other'` - File category
     - `previewUrl?: string` - Object URL for preview
     - `addedAt: Date` - Timestamp

   - `FileRejection` interface:
     - `file: File` - Original File object
     - `code: FileRejectionCode` - Error code
     - `message: string` - User-friendly message
     - `action: string` - Suggested action

   - `FileRejectionCode` type union:
     - `'FILE_TYPE_NOT_ALLOWED'`
     - `'FILE_TOO_LARGE'`
     - `'TOTAL_SIZE_EXCEEDED'`
     - `'MAX_FILES_EXCEEDED'`
     - `'EMPTY_FILE'`
     - `'VALIDATION_ERROR'`

   - `FileUploadError` interface for hook-level errors

   - `DropZoneProps` and `InputProps` interfaces for props factories

**Verification Steps:**

- [ ] File compiles without TypeScript errors
- [ ] All interfaces have JSDoc comments
- [ ] Types are exported from the file
- [ ] Run `npm run build` - no type errors

---

### Task 3.1.2: Implement File Validation Logic

**Objective:** Create the core validation function that checks file type, size, and generates file metadata.

**Estimated Time:** 45 minutes

**Dependencies:** Task 3.1.1 complete

**Implementation Steps:**

1. Create `src/components/ItemCapture/hooks/useFileUpload.ts`
2. Import types from `ItemCapture.types.ts`
3. Import constants from `utils/constants.ts` (SUPPORTED_FORMATS, CAPTURE_CONSTRAINTS)
4. Implement utility functions:

   - `generateUUID(): string` - Generate unique file ID (follow pattern from existing codebase)

   - `categorizeFile(mimeType: string): ValidatedFile['category']`:
     - Check `mimeType.startsWith('image/')` → 'image'
     - Check `mimeType.startsWith('video/')` → 'video'
     - Check `mimeType === 'application/pdf'` → 'pdf'
     - Default → 'other'

   - `getAllowedTypeLabels(mimeTypes: string[]): string[]`:
     - Map MIME type patterns to user-friendly labels
     - Handle wildcards like `image/*`

   - `getExtensionFromFilename(filename: string): string`:
     - Extract and lowercase extension
     - Handle edge cases (no extension, multiple dots)

5. Implement `validateFile(file: File, options: ValidationOptions): FileValidationResult`:
   - Check if file is empty (size === 0)
   - Check MIME type against allowed list
   - Check file size against maximum limit
   - Extract metadata (extension, category)
   - Return validation result with rejection details if invalid

**Code Pattern Reference:** Follow error handling pattern from `useQRCodeGeneration.ts:176-197`

**Verification Steps:**

- [ ] Empty files are rejected with `EMPTY_FILE` code
- [ ] Unknown MIME types are rejected with clear message listing allowed types
- [ ] Files exceeding size limit show both file size and limit in message
- [ ] Valid files return complete metadata
- [ ] Unit test validation with various file types

---

### Task 3.1.3: Implement File Input Management

**Objective:** Create the hidden file input management including ref, click-to-open, and change handler.

**Estimated Time:** 45 minutes

**Dependencies:** Task 3.1.1 complete

**Implementation Steps:**

1. In `useFileUpload.ts`, add state and refs:
   - `inputRef = useRef<HTMLInputElement>(null)` - Reference to hidden input
   - `isUnmountedRef = useRef(false)` - Track mount state (pattern from useQRCodeGeneration.ts:81)

2. Implement `openFilePicker()`:
   - Guard against unmounted component
   - Reset input value before triggering click (allows re-selecting same file)
   - Call `inputRef.current?.click()`

3. Implement `handleInputChange(e: React.ChangeEvent<HTMLInputElement>)`:
   - Extract files from `e.target.files`
   - Guard against empty selection
   - Call internal file processing function
   - Reset input value after processing

4. Implement `getInputProps(): InputProps`:
   - Return object with:
     - `type: 'file'`
     - `ref: inputRef`
     - `onChange: handleInputChange`
     - `accept: accept || allowedMimeTypes.join(',')`
     - `multiple: multiple`
     - `style: { display: 'none' }`
     - `'aria-hidden': true`

5. Add cleanup effect:
   - Set `isUnmountedRef.current = true` on unmount
   - Pattern from `useQRCodeGeneration.ts:88-111`

**Verification Steps:**

- [ ] `openFilePicker()` triggers native file dialog
- [ ] `getInputProps()` returns correctly typed props object
- [ ] Accept attribute correctly filters file types in browser
- [ ] Multiple selection works when enabled
- [ ] Single selection enforced when `multiple: false`

---

### Task 3.1.4: Implement Drag-and-Drop Handlers

**Objective:** Create drag-and-drop event handlers with visual state feedback and proper nested element handling.

**Estimated Time:** 1 hour

**Dependencies:** Task 3.1.1 complete

**Implementation Steps:**

1. Add drag-related state:
   - `isDragActive: boolean` - Whether drag is over drop zone
   - `isDragValid: boolean` - Whether dragged items appear valid

2. Add drag counter ref:
   - `dragCounterRef = useRef(0)` - Handle nested element enter/leave events

3. Implement `handleDragEnter(e: React.DragEvent)`:
   - `e.preventDefault()` and `e.stopPropagation()`
   - Increment `dragCounterRef.current`
   - If counter becomes 1:
     - Set `isDragActive = true`
     - Check `e.dataTransfer.items` for valid file types
     - Set `isDragValid` based on type check

4. Implement `handleDragOver(e: React.DragEvent)`:
   - `e.preventDefault()` and `e.stopPropagation()`
   - Set `e.dataTransfer.dropEffect = 'copy'`

5. Implement `handleDragLeave(e: React.DragEvent)`:
   - `e.preventDefault()` and `e.stopPropagation()`
   - Decrement `dragCounterRef.current`
   - If counter becomes 0:
     - Set `isDragActive = false`
     - Set `isDragValid = false`

6. Implement `handleDrop(e: React.DragEvent)`:
   - `e.preventDefault()` and `e.stopPropagation()`
   - Reset `dragCounterRef.current = 0`
   - Set `isDragActive = false`
   - Set `isDragValid = false`
   - Extract files from `e.dataTransfer.files`
   - Call internal file processing function

7. Memoize all handlers with `useCallback` including proper dependencies

**Key Implementation Detail:** The drag counter pattern prevents flicker when dragging over nested child elements within the drop zone.

**Verification Steps:**

- [ ] `isDragActive` becomes true when dragging over drop zone
- [ ] `isDragActive` remains true when hovering over nested elements
- [ ] `isDragActive` becomes false when leaving drop zone completely
- [ ] `isDragValid` reflects whether dragged file types are acceptable
- [ ] Files are processed correctly on drop
- [ ] All state resets properly after drop

---

### Task 3.1.5: Implement File List State Management

**Objective:** Create state management for the validated file list including add, remove, and clear operations.

**Estimated Time:** 45 minutes

**Dependencies:** Task 3.1.2 complete

**Implementation Steps:**

1. Add file list state:
   - `files: ValidatedFile[]` - Array of validated files
   - `rejectedFiles: FileRejection[]` - Array of rejected files
   - `totalSize: number` - Sum of all file sizes
   - `error: FileUploadError | null` - Hook-level error

2. Implement `addFilesInternal(fileList: FileList | File[])`:
   - Convert to array with `Array.from(fileList)`
   - Check remaining slots: `maxFiles - files.length`
   - If no slots, set error and return
   - Limit processing to remaining slots
   - For each file:
     - Call `validateFile()`
     - If valid, check cumulative total size
     - If passes total size check:
       - Generate UUID
       - Create preview URL with `URL.createObjectURL()`
       - Track URL in ref for cleanup
       - Add to valid files array
       - Update cumulative size
     - If fails, add to rejections array
   - Update state atomically:
     - Add valid files to `files`
     - Update `totalSize`
     - Update `rejectedFiles`
   - Call `onFilesAdded` callback if files added
   - Call `onFilesRejected` callback if rejections exist

3. Implement `removeFile(indexOrId: number | string)`:
   - Find file by index or ID
   - Revoke preview URL
   - Remove from tracked URLs ref
   - Update `totalSize`
   - Filter file from array

4. Implement `clearFiles()`:
   - Revoke all preview URLs
   - Clear tracked URLs ref
   - Reset `files` to empty array
   - Reset `totalSize` to 0
   - Clear `rejectedFiles`
   - Clear `error`

5. Add computed properties:
   - `hasFiles: boolean` = `files.length > 0`

**Verification Steps:**

- [ ] Files are added with unique IDs
- [ ] Total size is correctly calculated
- [ ] Preview URLs are created for each file
- [ ] Removing a file updates total size correctly
- [ ] Clearing files resets all state
- [ ] Max files limit is enforced
- [ ] Total size limit is enforced

---

### Task 3.1.6: Implement Error Handling and User Messages

**Objective:** Create comprehensive error handling with user-friendly messages and suggested actions.

**Estimated Time:** 30 minutes

**Dependencies:** Task 3.1.2 complete

**Implementation Steps:**

1. Create error message constants object:
   ```typescript
   const ERROR_MESSAGES = {
     FILE_TYPE_NOT_ALLOWED: {
       getMessage: (filename: string, allowedLabels: string[]) =>
         `"${filename}" is not a supported file type`,
       getAction: (allowedLabels: string[]) =>
         `Allowed types: ${allowedLabels.join(', ')}`
     },
     FILE_TOO_LARGE: {
       getMessage: (filename: string, fileSizeMB: string, maxSizeMB: string) =>
         `"${filename}" (${fileSizeMB}MB) exceeds the ${maxSizeMB}MB limit`,
       getAction: () => 'Please select a smaller file or compress this one'
     },
     TOTAL_SIZE_EXCEEDED: {
       getMessage: (filename: string) =>
         `Adding "${filename}" would exceed the total size limit`,
       getAction: (maxTotalMB: string) =>
         `Total limit is ${maxTotalMB}MB`
     },
     MAX_FILES_EXCEEDED: {
       getMessage: (maxFiles: number) =>
         `Maximum of ${maxFiles} files allowed`,
       getAction: () => 'Remove some files before adding more'
     },
     EMPTY_FILE: {
       getMessage: () => 'This file appears to be empty',
       getAction: () => 'Please select a different file'
     }
   };
   ```

2. Create helper functions:
   - `formatFileSize(bytes: number): string` - Convert bytes to human-readable MB/KB
   - `createRejection(file: File, code: FileRejectionCode, ...params): FileRejection`

3. Implement `clearError()`:
   - Set `error` to null

4. Ensure all validation failures create FileRejection objects with:
   - Specific error code
   - User-friendly message
   - Actionable suggestion

**Verification Steps:**

- [ ] All error codes have corresponding messages
- [ ] Messages include relevant context (filename, sizes)
- [ ] Actions are specific and helpful
- [ ] File sizes are formatted readably (KB for small, MB for large)
- [ ] `clearError()` works correctly

---

### Task 3.1.7: Implement Props Factory Functions

**Objective:** Create `getDropZoneProps()` and `getInputProps()` factory functions that return properly typed props objects.

**Estimated Time:** 30 minutes

**Dependencies:** Tasks 3.1.3 and 3.1.4 complete

**Implementation Steps:**

1. Implement `getDropZoneProps(): DropZoneProps`:
   - Memoize with `useCallback`
   - Return object with:
     - `onDragEnter: handleDragEnter`
     - `onDragOver: handleDragOver`
     - `onDragLeave: handleDragLeave`
     - `onDrop: handleDrop`
     - `onClick: openFilePicker`
     - `role: 'button'`
     - `tabIndex: 0`
     - `'aria-label': 'Drop files here or click to select'`

2. Implement `getInputProps(): InputProps`:
   - Memoize with `useCallback`
   - Return object with:
     - `type: 'file'`
     - `ref: inputRef`
     - `onChange: handleInputChange`
     - `accept: accept || allowedMimeTypes.join(',')`
     - `multiple: multiple`
     - `style: { display: 'none' }`
     - `'aria-hidden': true`

3. Add keyboard support to drop zone:
   - Handle Enter and Space keys to trigger file picker

**Verification Steps:**

- [ ] `getDropZoneProps()` returns stable reference (memoized)
- [ ] `getInputProps()` returns stable reference (memoized)
- [ ] Spreading `getDropZoneProps()` enables all drag-drop functionality
- [ ] Spreading `getInputProps()` creates working hidden input
- [ ] Keyboard navigation works (Tab focus, Enter/Space to open)
- [ ] Accessibility attributes are present

---

### Task 3.1.8: Implement Preview URL Generation with Cleanup

**Objective:** Create preview URLs for files with proper tracking and cleanup to prevent memory leaks.

**Estimated Time:** 30 minutes

**Dependencies:** Task 3.1.5 complete

**Implementation Steps:**

1. Add preview URL tracking ref:
   - `previewUrlsRef = useRef<Set<string>>(new Set())`

2. Implement `createPreviewUrl(file: File): string`:
   - Create URL with `URL.createObjectURL(file)`
   - Add to `previewUrlsRef.current`
   - Return URL

3. Update `removeFile()` to revoke preview URLs:
   - Get file's `previewUrl`
   - Call `URL.revokeObjectURL(url)`
   - Remove from `previewUrlsRef.current`

4. Update `clearFiles()` to revoke all preview URLs:
   - Iterate over `previewUrlsRef.current`
   - Call `URL.revokeObjectURL()` for each
   - Clear the Set

5. Ensure preview URL is created in `addFilesInternal()`:
   - After validation passes
   - Store in `ValidatedFile.previewUrl`

**Pattern Reference:** Follow cleanup pattern from `useQRCodeGeneration.ts:88-111`

**Verification Steps:**

- [ ] Preview URLs are created for each valid file
- [ ] URLs are correctly revoked when file is removed
- [ ] URLs are correctly revoked when files are cleared
- [ ] No memory leaks after repeated add/remove cycles
- [ ] Browser developer tools show no orphaned blob URLs

---

### Task 3.1.9: Implement Cleanup and Memory Management

**Objective:** Ensure proper cleanup on component unmount and prevent state updates to unmounted components.

**Estimated Time:** 30 minutes

**Dependencies:** Tasks 3.1.5 and 3.1.8 complete

**Implementation Steps:**

1. Add unmount tracking ref (if not already present):
   - `isUnmountedRef = useRef(false)`

2. Implement cleanup effect:
   ```typescript
   useEffect(() => {
     return () => {
       isUnmountedRef.current = true;

       // Revoke all preview URLs
       previewUrlsRef.current.forEach(url => {
         URL.revokeObjectURL(url);
       });
       previewUrlsRef.current.clear();
     };
   }, []);
   ```

3. Guard all state updates:
   - Wrap `setFiles`, `setRejectedFiles`, `setError`, `setTotalSize` calls
   - Check `if (isUnmountedRef.current) return;` before updates
   - Example pattern from `useQRCodeGeneration.ts:261-266`

4. Guard callback invocations:
   - Check mount state before calling `onFilesAdded` or `onFilesRejected`

5. Add debug logging (when `debug: true`):
   - Log file additions and removals
   - Log validation rejections
   - Log cleanup operations

**Verification Steps:**

- [ ] No React warnings about state updates on unmounted component
- [ ] Preview URLs are revoked on unmount
- [ ] Callbacks are not invoked after unmount
- [ ] Debug logs appear when debug mode enabled
- [ ] Memory profiling shows no leaks after component unmount/remount

---

### Task 3.1.10: Implement validateFile Utility Export

**Objective:** Export the `validateFile` function for external use (e.g., pre-validation before adding files).

**Estimated Time:** 15 minutes

**Dependencies:** Task 3.1.2 complete

**Implementation Steps:**

1. Expose `validateFile` in hook return:
   ```typescript
   return {
     // ... other returns
     validateFile: (file: File): FileValidationResult => {
       return validateFile(file, {
         allowedMimeTypes,
         maxFileSize,
       });
     }
   };
   ```

2. Ensure `FileValidationResult` type is exported from `ItemCapture.types.ts`

**Verification Steps:**

- [ ] `validateFile` can be called from consuming component
- [ ] Returns correct validation result without adding file
- [ ] Useful for showing validation feedback before confirming add

---

### Task 3.1.11: Export Hook from ItemCapture Index

**Objective:** Add useFileUpload to the public exports of the ItemCapture component.

**Estimated Time:** 15 minutes

**Dependencies:** Tasks 3.1.1-3.1.10 complete

**Implementation Steps:**

1. Open `src/components/ItemCapture/index.ts` (create if not exists)

2. Add exports:
   ```typescript
   // Hooks
   export { useFileUpload } from './hooks/useFileUpload';

   // Types
   export type {
     UseFileUploadOptions,
     UseFileUploadReturn,
     ValidatedFile,
     FileRejection,
     FileRejectionCode,
     FileUploadError,
     FileValidationResult,
     DropZoneProps,
     InputProps,
   } from './ItemCapture.types';
   ```

3. Verify re-exports work correctly

**Verification Steps:**

- [ ] Can import `useFileUpload` from `@/components/ItemCapture`
- [ ] Can import all type definitions
- [ ] No circular dependency warnings
- [ ] TypeScript autocomplete works in consuming components

---

### Task 3.1.12: Manual Testing - File Picker Flow

**Objective:** Verify file picker functionality across scenarios.

**Estimated Time:** 30 minutes

**Dependencies:** Tasks 3.1.1-3.1.11 complete

**Test Cases:**

1. **Single File Selection:**
   - [ ] Click drop zone opens file picker
   - [ ] Selecting valid file adds it to list
   - [ ] File appears with correct metadata (name, size, type)
   - [ ] Preview URL is created and accessible

2. **Multiple File Selection:**
   - [ ] Multiple files can be selected at once
   - [ ] All valid files are added
   - [ ] Total size is calculated correctly

3. **File Type Filtering:**
   - [ ] File picker only shows allowed types (via accept attribute)
   - [ ] Selecting via "All Files" still validates correctly
   - [ ] Invalid types are rejected with clear message

4. **File Size Limit:**
   - [ ] Files exceeding limit are rejected
   - [ ] Error message shows actual and allowed sizes
   - [ ] Valid files in same batch are still accepted

5. **Max Files Limit:**
   - [ ] Cannot add more than maxFiles
   - [ ] Clear message shown when limit reached
   - [ ] After removing file, can add again

**Verification Steps:**

- [ ] All test cases pass
- [ ] Document any browser-specific issues

---

### Task 3.1.13: Manual Testing - Drag and Drop Flow

**Objective:** Verify drag-and-drop functionality across scenarios and browsers.

**Estimated Time:** 30 minutes

**Dependencies:** Tasks 3.1.1-3.1.11 complete

**Test Cases:**

1. **Basic Drag-Drop:**
   - [ ] Dragging file over zone shows `isDragActive` state
   - [ ] Dropping file adds it to list
   - [ ] Zone returns to normal state after drop

2. **Visual Feedback:**
   - [ ] `isDragActive` is true during drag
   - [ ] `isDragValid` reflects file type validity
   - [ ] Styling can be applied based on these states

3. **Nested Elements:**
   - [ ] Dragging over child elements doesn't flicker
   - [ ] `isDragActive` remains true when over children
   - [ ] Only becomes false when leaving entire zone

4. **Invalid Files:**
   - [ ] `isDragValid` is false for invalid types
   - [ ] Invalid files are rejected on drop
   - [ ] Valid files in same drop are accepted

5. **Browser Compatibility:**
   - [ ] Chrome: All features work
   - [ ] Firefox: All features work
   - [ ] Safari: All features work (with known limitations)
   - [ ] Edge: All features work

**Verification Steps:**

- [ ] All test cases pass on target browsers
- [ ] Document iOS Safari limitations (touch drag not supported)

---

### Task 3.1.14: Manual Testing - Memory and Cleanup

**Objective:** Verify no memory leaks occur during normal usage.

**Estimated Time:** 30 minutes

**Dependencies:** Tasks 3.1.1-3.1.11 complete

**Test Cases:**

1. **Add/Remove Cycle:**
   - [ ] Add 5 files
   - [ ] Remove each file individually
   - [ ] Check browser memory (should return to baseline)
   - [ ] Check for orphaned blob URLs

2. **Clear All:**
   - [ ] Add 5 files
   - [ ] Call clearFiles()
   - [ ] Verify all preview URLs revoked
   - [ ] Memory returns to baseline

3. **Component Unmount:**
   - [ ] Add 5 files
   - [ ] Unmount component
   - [ ] No console warnings about state updates
   - [ ] Preview URLs are revoked

4. **Rapid Operations:**
   - [ ] Quickly add and remove files
   - [ ] No race conditions
   - [ ] State remains consistent

**Verification Steps:**

- [ ] Memory profiler shows no leaks
- [ ] No console warnings during any test
- [ ] All blob URLs properly cleaned up

---

## Task Summary

| Task | Description | Est. Time | Status |
|------|-------------|-----------|--------|
| 3.1.1 | Create TypeScript interfaces | 30 min | Pending |
| 3.1.2 | Implement file validation logic | 45 min | Pending |
| 3.1.3 | Implement file input management | 45 min | Pending |
| 3.1.4 | Implement drag-and-drop handlers | 1 hr | Pending |
| 3.1.5 | Implement file list state management | 45 min | Pending |
| 3.1.6 | Implement error handling | 30 min | Pending |
| 3.1.7 | Implement props factories | 30 min | Pending |
| 3.1.8 | Implement preview URL generation | 30 min | Pending |
| 3.1.9 | Implement cleanup and memory management | 30 min | Pending |
| 3.1.10 | Export validateFile utility | 15 min | Pending |
| 3.1.11 | Export hook from index | 15 min | Pending |
| 3.1.12 | Manual testing - file picker | 30 min | Pending |
| 3.1.13 | Manual testing - drag and drop | 30 min | Pending |
| 3.1.14 | Manual testing - memory/cleanup | 30 min | Pending |

**Total Estimated Time:** ~7.5 hours

---

## Acceptance Criteria Mapping

| Acceptance Criteria | Implementing Task(s) |
|--------------------|--------------------|
| Users can click to open file browser | 3.1.3, 3.1.7 |
| Users can drag and drop files | 3.1.4, 3.1.7 |
| System validates file type | 3.1.2 |
| System validates file size | 3.1.2 |
| Clear feedback for rejected files | 3.1.6 |
| Multiple file selection | 3.1.5 |
| Visual drag feedback (isDragActive) | 3.1.4 |
| Rejected files don't block valid ones | 3.1.5 |

---

## Definition of Done

- [ ] All 14 tasks completed and verified
- [ ] No TypeScript errors (`npm run build` passes)
- [ ] Hook can be imported from `@/components/ItemCapture`
- [ ] All acceptance criteria met
- [ ] No memory leaks observed
- [ ] Works on Chrome, Firefox, Safari, Edge
- [ ] iOS Safari limitations documented
- [ ] Code follows patterns from `useQRCodeGeneration.ts`

---

## Integration Notes

This hook will be consumed by:
- **Task 3.2 - FileUploadStep:** Will use `getDropZoneProps()`, `getInputProps()`, `files`, `isDragActive` for UI
- **Task 3.3 - PDF Thumbnail:** Will process files with `category === 'pdf'`
- **State Machine:** `onFilesAdded` callback will dispatch `ADD_MEDIA` actions

Example integration pattern shown in overview document's "Usage Pattern in FileUploadStep" section.

---

## References

- [Overview Document](/docs/REQ-041-create-usefileupload-hook-overview.md)
- [Implementation Plan](/docs/prd/item-capture-implementation-plan.md)
- [useQRCodeGeneration.ts](/src/hooks/useQRCodeGeneration.ts) - Pattern reference
- [File API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/File)
- [DataTransfer API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer)
- [URL.createObjectURL - MDN](https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL)
