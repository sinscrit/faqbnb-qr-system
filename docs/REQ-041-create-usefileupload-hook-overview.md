# REQ-041: Create useFileUpload Hook - Technical Implementation Overview

**Generated:** 2025-12-31T14:45:00
**Last Modified:** 2025-12-31T14:45:00
**Request Reference:** REQ-041 in `/docs/gen_requests.md`
**Implementation Plan Reference:** `/docs/prd/item-capture-implementation-plan.md`
**Phase:** 3 - File Upload & Text
**Task ID:** 3.1

---

## Executive Summary

This document provides a technical implementation breakdown for the `useFileUpload` hook, which manages file input operations including traditional file picker selection and drag-and-drop interactions, with comprehensive MIME type and size validation for the ItemCapture component.

The hook is a key foundation for Phase 3 (File Upload & Text) and directly enables Task 3.2 (FileUploadStep) and Task 3.3 (PDF thumbnail generation). It runs on Track A of Phase 3, which is completely independent from Track B (Text/Markdown editing) and can be developed in parallel.

---

## Scope

### In Scope
- Hidden file input element management with programmatic triggering
- Drag-and-drop zone event handling (`dragenter`, `dragover`, `dragleave`, `drop`)
- MIME type validation against configurable allowed types list
- File size validation against configurable maximum limits
- Multiple file selection support with per-file validation
- User-friendly error messages for rejected files
- Visual state feedback for drag-and-drop interactions (isDragActive)
- File list management (add, remove, clear)
- Clean separation of valid vs rejected files in multi-file selection

### Out of Scope
- PDF thumbnail generation (Task 3.3 - separate utility)
- File upload to server/storage (handled by parent application)
- Image/video preview rendering (handled by FileUploadStep)
- File compression or format conversion
- Progress indicators for upload operations (no actual upload in V1)

---

## Dependencies

### Hard Dependencies (Must Complete First)
| Dependency | Status | Location |
|------------|--------|----------|
| Phase 1 Complete | Required | Tasks 1.1-1.5 |
| ItemCapture.types.ts | Required | `src/components/ItemCapture/ItemCapture.types.ts` |
| Directory structure | Required | Task 1.1 |
| constants.ts | Required | `src/components/ItemCapture/utils/constants.ts` |

### Soft Dependencies (Can Develop in Parallel)
| Dependency | Status | Notes |
|------------|--------|-------|
| Task 3.2 - FileUploadStep | Parallel | Component consumes hook |
| Task 3.3 - PDF Thumbnail | Parallel | Processes files from hook |
| Track B (3.4, 3.5) | Parallel | Independent markdown track |

### External Dependencies
| Dependency | Notes |
|------------|-------|
| Native File API | Browser-native (no package required) |
| DataTransfer API | Browser-native for drag-drop (no package required) |

---

## Technical Approach

### Architecture Decision: Native APIs Without Wrapper Libraries

**Decision:** Use native `File`, `FileList`, and `DataTransfer` APIs directly (no react-dropzone or similar)

**Rationale:**
- Zero additional bundle size
- Full control over validation logic and error messaging
- Simpler integration with ItemCapture state machine
- Matches implementation plan's dependency-minimization strategy for Phase 3
- Native APIs are well-supported across target browsers (iOS Safari 15+, Chrome, Firefox, Edge)

### State Management Approach

The hook uses `useState` and `useRef` for internal state, returning a clean interface for the parent component. It does NOT manage wizard state - that responsibility belongs to `useItemCaptureState`.

The hook follows the established patterns from `useQRCodeGeneration.ts`:
- Uses `useRef` for DOM element references
- Uses `useCallback` for memoized handlers
- Includes proper cleanup on unmount
- Guards state updates against unmounted components

### Validation Strategy

1. **Type-First Validation:** Check MIME type before size to fail fast on unsupported formats
2. **Per-File Validation:** Each file validated independently; valid files accepted even when batch contains invalid ones
3. **Non-Blocking Rejections:** Invalid files collected with error reasons; flow continues with valid files
4. **Clear Error Messages:** User-friendly descriptions with actionable guidance

---

## Interface Design

### Hook Options Interface

```typescript
/**
 * Configuration options for useFileUpload hook
 */
interface UseFileUploadOptions {
  /** Allowed MIME types (default: images, video, PDF from constants) */
  allowedMimeTypes?: string[];

  /** Maximum file size in bytes per file (default: from constants - 100MB) */
  maxFileSize?: number;

  /** Maximum total size in bytes for all files (default: from constants - 200MB) */
  maxTotalSize?: number;

  /** Allow multiple file selection (default: true) */
  multiple?: boolean;

  /** Maximum number of files (default: 10) */
  maxFiles?: number;

  /** Accept attribute for file input (auto-generated from allowedMimeTypes) */
  accept?: string;

  /** Callback when files are successfully added */
  onFilesAdded?: (files: ValidatedFile[]) => void;

  /** Callback when files are rejected */
  onFilesRejected?: (rejections: FileRejection[]) => void;

  /** Enable debug logging (default: false) */
  debug?: boolean;
}
```

### Hook Return Interface

```typescript
/**
 * Return value from useFileUpload hook
 */
interface UseFileUploadReturn {
  // === File State ===
  /** Array of validated, accepted files */
  files: ValidatedFile[];

  /** Array of rejected files with reasons */
  rejectedFiles: FileRejection[];

  /** Total size of all accepted files in bytes */
  totalSize: number;

  /** Whether any files are currently selected */
  hasFiles: boolean;

  // === Drag State ===
  /** Whether a drag operation is active over the drop zone */
  isDragActive: boolean;

  /** Whether the dragged items are valid file types */
  isDragValid: boolean;

  // === Error State ===
  /** Current error message (for total size exceeded, max files, etc.) */
  error: FileUploadError | null;

  // === Input Ref ===
  /** Ref to attach to hidden file input element */
  inputRef: React.RefObject<HTMLInputElement>;

  // === File Actions ===
  /** Open native file picker dialog */
  openFilePicker: () => void;

  /** Remove a file by index or id */
  removeFile: (indexOrId: number | string) => void;

  /** Clear all files and reset state */
  clearFiles: () => void;

  /** Add files programmatically (validates before adding) */
  addFiles: (files: FileList | File[]) => void;

  // === Drag-Drop Handlers ===
  /** Props to spread on the drop zone element */
  getDropZoneProps: () => DropZoneProps;

  /** Props to spread on the file input element */
  getInputProps: () => InputProps;

  // === Utility ===
  /** Clear current error */
  clearError: () => void;

  /** Get validation result for a file without adding it */
  validateFile: (file: File) => FileValidationResult;
}
```

### Supporting Type Interfaces

```typescript
/**
 * A file that passed validation
 */
interface ValidatedFile {
  /** Unique ID for this file (generated UUID) */
  id: string;

  /** The original File object */
  file: File;

  /** Validated MIME type */
  mimeType: string;

  /** File size in bytes */
  size: number;

  /** Original filename */
  name: string;

  /** File extension (lowercase, without dot) */
  extension: string;

  /** Category based on MIME type */
  category: 'image' | 'video' | 'pdf' | 'other';

  /** Object URL for preview (caller must revoke) */
  previewUrl?: string;

  /** Timestamp when file was added */
  addedAt: Date;
}

/**
 * A file that failed validation
 */
interface FileRejection {
  /** The original File object */
  file: File;

  /** Error code for programmatic handling */
  code: FileRejectionCode;

  /** User-friendly error message */
  message: string;

  /** Suggested action for the user */
  action: string;
}

type FileRejectionCode =
  | 'FILE_TYPE_NOT_ALLOWED'
  | 'FILE_TOO_LARGE'
  | 'TOTAL_SIZE_EXCEEDED'
  | 'MAX_FILES_EXCEEDED'
  | 'EMPTY_FILE'
  | 'VALIDATION_ERROR';

/**
 * Error for hook-level issues
 */
interface FileUploadError {
  code: FileUploadErrorCode;
  message: string;
  action: string;
}

type FileUploadErrorCode =
  | 'MAX_FILES_EXCEEDED'
  | 'TOTAL_SIZE_EXCEEDED'
  | 'BROWSER_NOT_SUPPORTED';

/**
 * Validation result for a single file
 */
interface FileValidationResult {
  valid: boolean;
  file: File;
  rejection?: FileRejection;
  validated?: Omit<ValidatedFile, 'id' | 'addedAt' | 'previewUrl'>;
}

/**
 * Props for the drop zone element
 */
interface DropZoneProps {
  onDragEnter: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onClick: () => void;
  role: 'button';
  tabIndex: number;
  'aria-label': string;
}

/**
 * Props for the hidden file input element
 */
interface InputProps {
  type: 'file';
  ref: React.RefObject<HTMLInputElement>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  accept: string;
  multiple: boolean;
  style: { display: 'none' };
  'aria-hidden': true;
}
```

---

## Implementation Tasks

### Task Breakdown

| Task | Description | Estimate | Depends On |
|------|-------------|----------|------------|
| 3.1.1 | Create hook file with TypeScript interfaces | 30 min | Phase 1 complete |
| 3.1.2 | Implement file validation logic | 45 min | 3.1.1 |
| 3.1.3 | Implement file input management | 45 min | 3.1.1 |
| 3.1.4 | Implement drag-and-drop handlers | 1 hr | 3.1.1 |
| 3.1.5 | Implement file list state management | 45 min | 3.1.2 |
| 3.1.6 | Implement error handling & user messages | 30 min | 3.1.2 |
| 3.1.7 | Add props factories (getDropZoneProps, getInputProps) | 30 min | 3.1.3, 3.1.4 |
| 3.1.8 | Add preview URL generation with cleanup | 30 min | 3.1.5 |
| 3.1.9 | Add cleanup & memory management | 30 min | 3.1.5, 3.1.8 |
| 3.1.10 | Manual testing across browsers | 1 hr | 3.1.1-3.1.9 |

**Total Estimated Time:** ~7 hours (1 day)

---

## Key Implementation Details

### 1. File Validation Logic

```typescript
const validateFile = useCallback((file: File): FileValidationResult => {
  // Check for empty file
  if (file.size === 0) {
    return {
      valid: false,
      file,
      rejection: {
        file,
        code: 'EMPTY_FILE',
        message: 'This file appears to be empty',
        action: 'Please select a different file'
      }
    };
  }

  // Check MIME type
  const mimeType = file.type.toLowerCase();
  if (!allowedMimeTypes.some(type => mimeType.startsWith(type.replace('/*', '/')))) {
    const allowedLabels = getAllowedTypeLabels(allowedMimeTypes);
    return {
      valid: false,
      file,
      rejection: {
        file,
        code: 'FILE_TYPE_NOT_ALLOWED',
        message: `"${file.name}" is not a supported file type`,
        action: `Allowed types: ${allowedLabels.join(', ')}`
      }
    };
  }

  // Check file size
  if (file.size > maxFileSize) {
    const maxSizeMB = (maxFileSize / (1024 * 1024)).toFixed(0);
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      file,
      rejection: {
        file,
        code: 'FILE_TOO_LARGE',
        message: `"${file.name}" (${fileSizeMB}MB) exceeds the ${maxSizeMB}MB limit`,
        action: 'Please select a smaller file or compress this one'
      }
    };
  }

  // Extract file info
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  const category = categorizeFile(mimeType);

  return {
    valid: true,
    file,
    validated: {
      file,
      mimeType,
      size: file.size,
      name: file.name,
      extension,
      category
    }
  };
}, [allowedMimeTypes, maxFileSize]);
```

### 2. Drag-and-Drop Handler Implementation

```typescript
// Drag counter ref to handle nested elements
const dragCounterRef = useRef(0);

const handleDragEnter = useCallback((e: React.DragEvent) => {
  e.preventDefault();
  e.stopPropagation();

  dragCounterRef.current++;

  if (dragCounterRef.current === 1) {
    setIsDragActive(true);

    // Check if dragged items are potentially valid
    const items = e.dataTransfer.items;
    if (items && items.length > 0) {
      const hasValidType = Array.from(items).some(item => {
        if (item.kind === 'file') {
          return allowedMimeTypes.some(type =>
            item.type.startsWith(type.replace('/*', '/'))
          );
        }
        return false;
      });
      setIsDragValid(hasValidType);
    }
  }
}, [allowedMimeTypes]);

const handleDragLeave = useCallback((e: React.DragEvent) => {
  e.preventDefault();
  e.stopPropagation();

  dragCounterRef.current--;

  if (dragCounterRef.current === 0) {
    setIsDragActive(false);
    setIsDragValid(false);
  }
}, []);

const handleDrop = useCallback((e: React.DragEvent) => {
  e.preventDefault();
  e.stopPropagation();

  // Reset drag state
  dragCounterRef.current = 0;
  setIsDragActive(false);
  setIsDragValid(false);

  const droppedFiles = e.dataTransfer.files;
  if (droppedFiles.length > 0) {
    addFilesInternal(droppedFiles);
  }
}, [addFilesInternal]);
```

### 3. Multiple File Processing with Partial Success

```typescript
const addFilesInternal = useCallback((fileList: FileList | File[]) => {
  const filesArray = Array.from(fileList);

  // Check max files limit
  const remainingSlots = maxFiles - files.length;
  if (remainingSlots <= 0) {
    setError({
      code: 'MAX_FILES_EXCEEDED',
      message: `Maximum of ${maxFiles} files allowed`,
      action: 'Remove some files before adding more'
    });
    return;
  }

  // Limit to remaining slots
  const filesToProcess = filesArray.slice(0, remainingSlots);
  const newValidFiles: ValidatedFile[] = [];
  const newRejections: FileRejection[] = [];
  let newTotalSize = totalSize;

  for (const file of filesToProcess) {
    const result = validateFile(file);

    if (result.valid && result.validated) {
      // Check total size constraint
      if (newTotalSize + file.size > maxTotalSize) {
        newRejections.push({
          file,
          code: 'TOTAL_SIZE_EXCEEDED',
          message: `Adding "${file.name}" would exceed the total size limit`,
          action: `Total limit is ${(maxTotalSize / (1024 * 1024)).toFixed(0)}MB`
        });
        continue;
      }

      // Create validated file with ID and preview URL
      const validatedFile: ValidatedFile = {
        ...result.validated,
        id: generateUUID(),
        addedAt: new Date(),
        previewUrl: URL.createObjectURL(file)
      };

      newValidFiles.push(validatedFile);
      newTotalSize += file.size;
    } else if (result.rejection) {
      newRejections.push(result.rejection);
    }
  }

  // Notify about extra files beyond limit
  if (filesArray.length > filesToProcess.length) {
    const skipped = filesArray.length - filesToProcess.length;
    setError({
      code: 'MAX_FILES_EXCEEDED',
      message: `${skipped} file(s) were not added (limit: ${maxFiles})`,
      action: 'Remove some files to add more'
    });
  }

  // Update state
  if (newValidFiles.length > 0) {
    setFiles(prev => [...prev, ...newValidFiles]);
    setTotalSize(newTotalSize);
    onFilesAdded?.(newValidFiles);
  }

  if (newRejections.length > 0) {
    setRejectedFiles(prev => [...prev, ...newRejections]);
    onFilesRejected?.(newRejections);
  }
}, [files.length, maxFiles, maxTotalSize, totalSize, validateFile, onFilesAdded, onFilesRejected]);
```

### 4. Memory Leak Prevention (Following Codebase Patterns)

Based on patterns from `useQRCodeGeneration.ts`:

```typescript
// Track mounted state
const isUnmountedRef = useRef(false);

// Store preview URLs for cleanup
const previewUrlsRef = useRef<Set<string>>(new Set());

// Cleanup on unmount
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

// Track preview URLs when created
const createPreviewUrl = useCallback((file: File): string => {
  const url = URL.createObjectURL(file);
  previewUrlsRef.current.add(url);
  return url;
}, []);

// Cleanup preview URL when file removed
const removeFile = useCallback((indexOrId: number | string) => {
  setFiles(prev => {
    const index = typeof indexOrId === 'number'
      ? indexOrId
      : prev.findIndex(f => f.id === indexOrId);

    if (index < 0 || index >= prev.length) return prev;

    const file = prev[index];

    // Revoke preview URL
    if (file.previewUrl) {
      URL.revokeObjectURL(file.previewUrl);
      previewUrlsRef.current.delete(file.previewUrl);
    }

    // Update total size
    setTotalSize(current => current - file.size);

    // Return new array without the file
    return prev.filter((_, i) => i !== index);
  });
}, []);
```

### 5. Props Factory Functions

```typescript
const getDropZoneProps = useCallback((): DropZoneProps => ({
  onDragEnter: handleDragEnter,
  onDragOver: handleDragOver,
  onDragLeave: handleDragLeave,
  onDrop: handleDrop,
  onClick: openFilePicker,
  role: 'button',
  tabIndex: 0,
  'aria-label': 'Drop files here or click to select'
}), [handleDragEnter, handleDragOver, handleDragLeave, handleDrop, openFilePicker]);

const getInputProps = useCallback((): InputProps => ({
  type: 'file',
  ref: inputRef,
  onChange: handleInputChange,
  accept: accept || allowedMimeTypes.join(','),
  multiple,
  style: { display: 'none' },
  'aria-hidden': true
}), [handleInputChange, accept, allowedMimeTypes, multiple]);
```

### 6. File Categorization Utility

```typescript
const categorizeFile = (mimeType: string): ValidatedFile['category'] => {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType === 'application/pdf') return 'pdf';
  return 'other';
};

const getAllowedTypeLabels = (mimeTypes: string[]): string[] => {
  const labels: string[] = [];

  if (mimeTypes.some(t => t.startsWith('image/'))) labels.push('Images');
  if (mimeTypes.some(t => t.startsWith('video/'))) labels.push('Videos');
  if (mimeTypes.includes('application/pdf')) labels.push('PDF');

  return labels.length > 0 ? labels : ['Files'];
};
```

---

## Authorized Files and Functions for Modification

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemCapture/hooks/useFileUpload.ts` | Main hook implementation |

### Files to Modify

| File Path | Modification | Reason |
|-----------|--------------|--------|
| `src/components/ItemCapture/ItemCapture.types.ts` | Add `UseFileUploadOptions`, `UseFileUploadReturn`, `ValidatedFile`, `FileRejection`, `FileUploadError` interfaces | Type definitions |
| `src/components/ItemCapture/index.ts` | Export `useFileUpload` hook | Public API |

### Files to Reference (Read-Only)

| File Path | Reference Purpose |
|-----------|-------------------|
| `src/hooks/useQRCodeGeneration.ts` | Pattern reference for state management, cleanup |
| `src/components/ItemCapture/utils/constants.ts` | File size limits, supported formats |
| `src/lib/utils.ts` | Utility patterns |
| `docs/REQ-036-create-usemediacapture-hook-overview.md` | Sibling hook interface patterns |

---

## Error Handling Strategy

### Error Classification

| Error Type | Recovery Strategy | User Guidance |
|------------|-------------------|---------------|
| File Type Not Allowed | Non-blocking | Show allowed types, file continues rejected |
| File Too Large | Non-blocking | Show size limit, suggest compression |
| Total Size Exceeded | Blocking | Must remove files before adding more |
| Max Files Exceeded | Blocking | Must remove files before adding more |
| Empty File | Non-blocking | Request different file |

### Error Message Format

All error messages follow the pattern established in `useMediaCapture`:

```typescript
{
  code: 'FILE_TOO_LARGE',
  message: '"vacation-video.mp4" (150MB) exceeds the 100MB limit',
  action: 'Please select a smaller file or compress this one'
}
```

---

## Testing Strategy

### Unit Test Coverage

| Test Case | Description |
|-----------|-------------|
| Validation Logic | All MIME types correctly validated |
| Size Validation | Files over limit rejected with correct message |
| Multiple Files | Valid files accepted even when batch contains invalid |
| Max Files Limit | Excess files handled gracefully |
| Total Size Limit | Cumulative size tracked correctly |
| Empty File | Zero-byte files rejected |
| UUID Generation | Each file gets unique ID |
| Preview URLs | Created on add, revoked on remove |
| Cleanup | All URLs revoked on unmount |

### Integration Test Scenarios

| Scenario | Steps | Expected Result |
|----------|-------|-----------------|
| Click Upload | Click zone → Select file | File added to list |
| Drag Valid | Drag image → Drop | isDragValid=true, file added |
| Drag Invalid | Drag .exe → Drop | isDragValid=false, file rejected |
| Mixed Batch | Select 3 images + 1 .exe | 3 files added, 1 rejection |
| Remove File | Add file → Remove | File removed, preview URL revoked |
| Clear All | Add files → Clear | All files removed, all URLs revoked |
| Max Files | Add 10 files → Add 1 more | Error shown, new file rejected |

### Manual Testing Matrix

| Platform | Browser | Priority |
|----------|---------|----------|
| iOS 16+ | Safari | High (touch drag limited) |
| Android | Chrome | High |
| Desktop | Chrome | High |
| Desktop | Firefox | Medium |
| Desktop | Edge | Low |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Memory leak from preview URLs | Medium | High | Ref tracking + cleanup on unmount |
| Drag counter edge cases | Medium | Low | Reset on drop, defensive checks |
| Large file blocking UI | Low | Medium | Process validation async if needed |
| MIME type detection unreliable | Low | Medium | Use extension as fallback |
| iOS Safari drag-drop limitations | High | Medium | Touch devices primarily use tap-to-select |

---

## Open Questions

1. **Preview URL lifecycle:** Should the hook revoke preview URLs, or should this responsibility be on the consumer (FileUploadStep)?
   - **Recommendation:** Hook manages preview URLs to prevent leaks; consumer uses them as read-only

2. **Re-validation on edit:** If file list is edited externally, should the hook re-validate?
   - **Recommendation:** No external editing; hook is the single source of truth for its file list

3. **Duplicate file detection:** Should we warn when the same file (by name + size) is added twice?
   - **Recommendation:** Defer to V2; simple equality check could have false positives

4. **HEIC support:** iOS users may upload HEIC images. Should we handle conversion?
   - **Recommendation:** Accept HEIC; conversion is a Phase 4 concern or backend responsibility

---

## Success Criteria

Based on REQ-041 Acceptance Criteria:

- [ ] Users can click to open a file browser and select one or more files
- [ ] Users can drag files from their desktop or file manager and drop them onto a designated zone
- [ ] The system validates each file's type against an allowed list before accepting it
- [ ] The system validates each file's size against a maximum limit before accepting it
- [ ] Users receive clear feedback when a file is rejected due to type or size restrictions
- [ ] Multiple files can be selected simultaneously when enabled
- [ ] Visual feedback indicates when the drag-and-drop zone is active and ready to receive files
- [ ] Rejected files do not interrupt the acceptance of valid files in a multi-file selection

Additional Technical Criteria:

- [ ] No memory leaks from unreleased Object URLs
- [ ] Hook returns stable references (memoized callbacks)
- [ ] All state updates guarded against unmounted component
- [ ] TypeScript types correctly infer all return values
- [ ] Works correctly with ItemCapture state machine

---

## Integration with ItemCapture

### Usage Pattern in FileUploadStep

```tsx
// FileUploadStep.tsx (Task 3.2)
import { useFileUpload } from '../hooks/useFileUpload';
import { useItemCaptureContext } from '../hooks/useItemCaptureState';

export function FileUploadStep() {
  const { dispatch } = useItemCaptureContext();

  const {
    files,
    rejectedFiles,
    isDragActive,
    isDragValid,
    getDropZoneProps,
    getInputProps,
    removeFile,
    clearFiles,
    error
  } = useFileUpload({
    allowedMimeTypes: SUPPORTED_FORMATS.image.concat(
      SUPPORTED_FORMATS.video,
      SUPPORTED_FORMATS.pdf
    ),
    maxFileSize: CAPTURE_CONSTRAINTS.image.maxFileSize,
    maxTotalSize: CAPTURE_CONSTRAINTS.total.maxSize,
    maxFiles: 10,
    onFilesAdded: (newFiles) => {
      // Convert to MediaItem format for state machine
      newFiles.forEach(vf => {
        dispatch({
          type: 'ADD_MEDIA',
          payload: {
            id: vf.id,
            type: vf.category === 'pdf' ? 'pdf' : vf.category,
            file: vf.file,
            order: files.length,
            metadata: {
              mimeType: vf.mimeType,
              fileSize: vf.size,
              originalFilename: vf.name,
              source: 'upload'
            }
          }
        });
      });
    }
  });

  return (
    <div
      {...getDropZoneProps()}
      className={cn(
        'border-2 border-dashed rounded-lg p-8 text-center',
        isDragActive && 'border-blue-500 bg-blue-50',
        isDragActive && !isDragValid && 'border-red-500 bg-red-50'
      )}
    >
      <input {...getInputProps()} />
      {/* ... UI content ... */}
    </div>
  );
}
```

---

## Constants Integration

The hook uses constants from `src/components/ItemCapture/utils/constants.ts`:

```typescript
// Default values derived from constants
const DEFAULT_OPTIONS: Partial<UseFileUploadOptions> = {
  allowedMimeTypes: [
    ...SUPPORTED_FORMATS.image,
    ...SUPPORTED_FORMATS.video,
    ...SUPPORTED_FORMATS.pdf
  ],
  maxFileSize: CAPTURE_CONSTRAINTS.image.maxFileSize, // 20MB for images
  maxTotalSize: CAPTURE_CONSTRAINTS.total.maxSize,    // 200MB total
  maxFiles: CAPTURE_CONSTRAINTS.image.maxCount,       // 10 files
  multiple: true,
  debug: false
};
```

---

## References

- [File API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/File)
- [DataTransfer API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer)
- [Drag and Drop API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API)
- [URL.createObjectURL - MDN](https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL)
- [Implementation Plan](/docs/prd/item-capture-implementation-plan.md)
- [useQRCodeGeneration.ts](/src/hooks/useQRCodeGeneration.ts) - Hook pattern reference
- [REQ-036 useMediaCapture Overview](/docs/REQ-036-create-usemediacapture-hook-overview.md) - Sibling hook reference
