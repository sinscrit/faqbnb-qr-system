# REQ-042: Implement FileUploadStep - Technical Implementation Overview

**Generated:** 2025-12-31T19:30:00
**Last Modified:** 2025-12-31T19:30:00
**Request Reference:** REQ-042 in `/docs/gen_requests.md`
**Implementation Plan Reference:** `/docs/prd/item-capture-implementation-plan.md`
**Phase:** 3 - File Upload & Text
**Task ID:** 3.2

---

## Executive Summary

This document provides a technical implementation breakdown for `FileUploadStep`, a wizard step component that provides an intuitive file upload interface supporting both click-to-select and drag-and-drop interactions. The component integrates with the `useFileUpload` hook (REQ-041) to handle file validation, selection, and preview generation.

FileUploadStep is part of Phase 3 (File Upload & Text), Track A, and directly depends on the `useFileUpload` hook (Task 3.1). It enables Task 3.3 (PDF thumbnail generation) by providing the upload interface that triggers PDF file processing.

---

## Scope

### In Scope
- Click-to-upload area that triggers native file picker
- Drag-and-drop zone with visual feedback for drag states
- File type icons based on file category (image, video, PDF)
- Progress indication for file count and total size
- Error message display for rejected/invalid files
- Thumbnail preview for uploaded images
- File removal functionality
- Integration with `useFileUpload` hook
- Responsive design for mobile and desktop
- Accessibility (ARIA labels, keyboard navigation)

### Out of Scope
- The `useFileUpload` hook implementation (Task 3.1 - separate component)
- PDF thumbnail generation logic (Task 3.3 - separate utility)
- Actual file upload to server/storage (handled by parent application after capture)
- Video playback preview (thumbnails only)
- File compression or format conversion
- Editing uploaded files (handled by MediaEditorStep)

---

## Dependencies

### Hard Dependencies (Must Complete First)

| Dependency | Status | Location |
|------------|--------|----------|
| Phase 1 Complete | Required | Tasks 1.1-1.5 |
| useFileUpload hook | Required | Task 3.1 - `src/components/ItemCapture/hooks/useFileUpload.ts` |
| ItemCapture.types.ts | Required | `src/components/ItemCapture/ItemCapture.types.ts` |
| constants.ts | Required | `src/components/ItemCapture/utils/constants.ts` |
| useItemCaptureState hook | Required | Task 1.2 - for state dispatch |

### Soft Dependencies (Can Develop in Parallel)

| Dependency | Status | Notes |
|------------|--------|-------|
| Task 3.3 - PDF Thumbnail | Parallel | Enhances PDF preview display |
| Task 2.5 - Thumbnail Generator | Parallel | Used for image/video thumbnails |
| ValidationMessage component | Optional | May already exist from Phase 1 |

### External Dependencies

| Dependency | Notes |
|------------|-------|
| lucide-react | Already installed - icons for file types and actions |
| Tailwind CSS | Already configured - styling |
| cn() utility | `src/lib/utils.ts` - class merging |

---

## Technical Approach

### Architecture Decision: Thin Component Over useFileUpload Hook

**Decision:** FileUploadStep is a presentation component that delegates all file handling logic to the `useFileUpload` hook.

**Rationale:**
- Separation of concerns: UI rendering vs. file management
- Hook handles validation, drag-drop events, and state management
- Component focuses on visual feedback and user interaction
- Matches established patterns from PhotoCaptureStep/VideoCaptureStep
- Enables easier testing of business logic in hook isolation

### Component Structure

```
FileUploadStep/
├── Core Component
│   ├── DropZone - Drag-and-drop area with visual states
│   ├── FileList - Grid of uploaded file previews
│   ├── FileCard - Individual file preview with actions
│   └── ErrorDisplay - Rejected files and error messages
└── Integration
    ├── useFileUpload hook - File handling
    ├── useItemCaptureContext - State dispatch
    └── Constants - Limits and formats
```

### Visual State Matrix

| State | isDragActive | isDragValid | hasFiles | error | Visual Treatment |
|-------|--------------|-------------|----------|-------|------------------|
| Empty | false | - | false | null | Dashed border, upload prompt |
| Drag Valid | true | true | any | any | Blue border, blue background, "Drop files here" |
| Drag Invalid | true | false | any | any | Red border, red background, "Invalid file type" |
| Has Files | false | - | true | null | File grid visible, "Add more" option |
| Has Error | false | - | any | error | Error alert visible above drop zone |
| Has Rejections | false | - | any | null | Rejection list visible below drop zone |

---

## Interface Design

### Component Props Interface

```typescript
interface FileUploadStepProps {
  /** Optional CSS class name for the root element */
  className?: string;

  /** Whether to show the step in compact mode (for modal use) */
  compact?: boolean;
}
```

The component retrieves state from context rather than props, following the established wizard step pattern.

### Integration with useFileUpload Hook

```typescript
// Internal hook usage
const {
  files,           // ValidatedFile[] - accepted files
  rejectedFiles,   // FileRejection[] - rejected files with reasons
  isDragActive,    // boolean - drag operation in progress
  isDragValid,     // boolean - dragged items are valid types
  error,           // FileUploadError | null - hook-level errors
  totalSize,       // number - cumulative size in bytes
  hasFiles,        // boolean - files.length > 0
  inputRef,        // RefObject - hidden file input
  openFilePicker,  // () => void - trigger file dialog
  removeFile,      // (id: string) => void - remove by ID
  clearFiles,      // () => void - clear all files
  getDropZoneProps, // () => DropZoneProps - spread on drop zone
  getInputProps,   // () => InputProps - spread on input
  clearError,      // () => void - dismiss error
} = useFileUpload(options);
```

### Type Interfaces (from useFileUpload)

```typescript
interface ValidatedFile {
  id: string;
  file: File;
  mimeType: string;
  size: number;
  name: string;
  extension: string;
  category: 'image' | 'video' | 'pdf' | 'other';
  previewUrl?: string;
  addedAt: Date;
}

interface FileRejection {
  file: File;
  code: FileRejectionCode;
  message: string;
  action: string;
}
```

---

## Implementation Tasks

### Task Breakdown

| Task | Description | Estimate | Depends On |
|------|-------------|----------|------------|
| 3.2.1 | Create component file with props interface | 15 min | Task 3.1 complete |
| 3.2.2 | Implement DropZone area with hook integration | 45 min | 3.2.1 |
| 3.2.3 | Implement visual states for drag feedback | 30 min | 3.2.2 |
| 3.2.4 | Create FileCard subcomponent for previews | 45 min | 3.2.1 |
| 3.2.5 | Implement FileList grid layout | 30 min | 3.2.4 |
| 3.2.6 | Add file type icons for each category | 20 min | 3.2.4 |
| 3.2.7 | Implement error/rejection display | 30 min | 3.2.1 |
| 3.2.8 | Add progress/count indicators | 20 min | 3.2.5 |
| 3.2.9 | Connect to ItemCapture state machine | 30 min | 3.2.2 |
| 3.2.10 | Accessibility audit and fixes | 30 min | 3.2.1-3.2.9 |
| 3.2.11 | Responsive design adjustments | 20 min | 3.2.5 |
| 3.2.12 | Manual testing across browsers | 45 min | All above |

**Total Estimated Time:** ~6 hours (1 day)

---

## Detailed Implementation Specifications

### 1. DropZone Component Structure

```tsx
<div
  {...getDropZoneProps()}
  className={cn(
    // Base styles
    'relative border-2 border-dashed rounded-xl p-8',
    'flex flex-col items-center justify-center',
    'min-h-[200px] transition-colors duration-200',
    'cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',

    // Default state
    !isDragActive && 'border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100',

    // Drag valid state
    isDragActive && isDragValid && 'border-blue-500 bg-blue-50',

    // Drag invalid state
    isDragActive && !isDragValid && 'border-red-500 bg-red-50',
  )}
>
  <input {...getInputProps()} />

  {/* Icon */}
  <div className={cn(
    'p-4 rounded-full mb-4',
    isDragActive && isDragValid && 'bg-blue-100 text-blue-600',
    isDragActive && !isDragValid && 'bg-red-100 text-red-600',
    !isDragActive && 'bg-gray-200 text-gray-500'
  )}>
    <Upload className="h-8 w-8" />
  </div>

  {/* Text content based on state */}
  {isDragActive ? (
    isDragValid ? (
      <p className="text-blue-600 font-medium">Drop files here</p>
    ) : (
      <p className="text-red-600 font-medium">Invalid file type</p>
    )
  ) : (
    <>
      <p className="text-gray-700 font-medium">
        Drag files here or click to browse
      </p>
      <p className="text-gray-500 text-sm mt-2">
        Supports images, videos, and PDF files
      </p>
    </>
  )}

  {/* Constraints info */}
  <p className="text-gray-400 text-xs mt-4">
    Max 10 files, 100MB each, 200MB total
  </p>
</div>
```

### 2. FileCard Component

```tsx
interface FileCardProps {
  file: ValidatedFile;
  onRemove: (id: string) => void;
}

function FileCard({ file, onRemove }: FileCardProps) {
  const icon = getFileIcon(file.category);
  const sizeLabel = formatFileSize(file.size);

  return (
    <div className="relative group bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
      {/* Thumbnail or Icon */}
      <div className="aspect-square rounded-md overflow-hidden bg-gray-100 mb-2 flex items-center justify-center">
        {file.previewUrl && file.category === 'image' ? (
          <img
            src={file.previewUrl}
            alt={file.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="p-4">
            {icon}
          </div>
        )}

        {/* Video play indicator overlay */}
        {file.category === 'video' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <Video className="h-8 w-8 text-white" />
          </div>
        )}
      </div>

      {/* File info */}
      <p className="text-sm font-medium text-gray-700 truncate" title={file.name}>
        {file.name}
      </p>
      <p className="text-xs text-gray-500">{sizeLabel}</p>

      {/* Remove button - visible on hover */}
      <button
        onClick={() => onRemove(file.id)}
        className={cn(
          'absolute top-2 right-2 p-1.5 rounded-full',
          'bg-red-100 text-red-600 opacity-0 group-hover:opacity-100',
          'transition-opacity hover:bg-red-200',
          'focus:outline-none focus:ring-2 focus:ring-red-500 focus:opacity-100'
        )}
        aria-label={`Remove ${file.name}`}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
```

### 3. File Type Icons

```typescript
function getFileIcon(category: ValidatedFile['category']): React.ReactNode {
  const iconClass = 'h-12 w-12';

  switch (category) {
    case 'image':
      return <Image className={cn(iconClass, 'text-green-500')} />;
    case 'video':
      return <Video className={cn(iconClass, 'text-purple-500')} />;
    case 'pdf':
      return <FileText className={cn(iconClass, 'text-red-500')} />;
    default:
      return <File className={cn(iconClass, 'text-gray-500')} />;
  }
}
```

### 4. Error Display Component

```tsx
function ErrorDisplay({
  error,
  rejectedFiles,
  onDismiss,
  onClearRejections
}: {
  error: FileUploadError | null;
  rejectedFiles: FileRejection[];
  onDismiss: () => void;
  onClearRejections: () => void;
}) {
  if (!error && rejectedFiles.length === 0) return null;

  return (
    <div className="space-y-3 mb-4">
      {/* Hook-level error */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg"
        >
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-800 font-medium">{error.message}</p>
            <p className="text-red-600 text-sm mt-1">{error.action}</p>
          </div>
          <button
            onClick={onDismiss}
            className="text-red-400 hover:text-red-600"
            aria-label="Dismiss error"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Rejected files list */}
      {rejectedFiles.length > 0 && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-yellow-800 font-medium">
              {rejectedFiles.length} file{rejectedFiles.length > 1 ? 's' : ''} couldn't be added
            </p>
            <button
              onClick={onClearRejections}
              className="text-yellow-600 hover:text-yellow-800 text-sm"
            >
              Dismiss
            </button>
          </div>
          <ul className="space-y-1">
            {rejectedFiles.map((rejection, index) => (
              <li key={index} className="text-sm text-yellow-700">
                <span className="font-medium">{rejection.file.name}</span>
                {' — '}{rejection.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

### 5. Progress Indicator

```tsx
function UploadProgress({
  fileCount,
  maxFiles,
  totalSize,
  maxTotalSize
}: {
  fileCount: number;
  maxFiles: number;
  totalSize: number;
  maxTotalSize: number;
}) {
  const sizePercent = Math.min((totalSize / maxTotalSize) * 100, 100);
  const countText = `${fileCount}/${maxFiles} files`;
  const sizeText = `${formatFileSize(totalSize)} / ${formatFileSize(maxTotalSize)}`;

  return (
    <div className="flex items-center justify-between text-sm text-gray-600 mt-4">
      <span>{countText}</span>
      <div className="flex items-center gap-2">
        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all',
              sizePercent > 80 ? 'bg-red-500' : 'bg-blue-500'
            )}
            style={{ width: `${sizePercent}%` }}
          />
        </div>
        <span>{sizeText}</span>
      </div>
    </div>
  );
}
```

### 6. Complete FileUploadStep Component

```tsx
'use client';

import { useCallback } from 'react';
import { Upload, Image, Video, FileText, File, X, AlertCircle, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFileUpload } from '../hooks/useFileUpload';
import { useItemCaptureContext } from '../hooks/useItemCaptureState';
import { SUPPORTED_FORMATS, CAPTURE_CONSTRAINTS } from '../utils/constants';

interface FileUploadStepProps {
  className?: string;
  compact?: boolean;
}

export function FileUploadStep({ className, compact = false }: FileUploadStepProps) {
  const { dispatch } = useItemCaptureContext();

  const handleFilesAdded = useCallback((newFiles: ValidatedFile[]) => {
    newFiles.forEach(vf => {
      dispatch({
        type: 'ADD_MEDIA',
        payload: {
          id: vf.id,
          type: vf.category === 'pdf' ? 'pdf' : vf.category,
          file: vf.file,
          thumbnail: undefined, // Will be generated by thumbnail utility
          order: 0, // State machine will assign proper order
          metadata: {
            mimeType: vf.mimeType,
            fileSize: vf.size,
            originalFilename: vf.name,
            source: 'upload'
          }
        }
      });
    });
  }, [dispatch]);

  const {
    files,
    rejectedFiles,
    isDragActive,
    isDragValid,
    error,
    totalSize,
    hasFiles,
    removeFile,
    getDropZoneProps,
    getInputProps,
    clearError
  } = useFileUpload({
    allowedMimeTypes: [
      ...SUPPORTED_FORMATS.image,
      ...SUPPORTED_FORMATS.video,
      ...SUPPORTED_FORMATS.pdf
    ],
    maxFileSize: CAPTURE_CONSTRAINTS.image.maxFileSize,
    maxTotalSize: CAPTURE_CONSTRAINTS.total.maxSize,
    maxFiles: CAPTURE_CONSTRAINTS.image.maxCount,
    onFilesAdded: handleFilesAdded
  });

  const handleRemove = useCallback((id: string) => {
    removeFile(id);
    dispatch({ type: 'REMOVE_MEDIA', payload: id });
  }, [removeFile, dispatch]);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Error Display */}
      <ErrorDisplay
        error={error}
        rejectedFiles={rejectedFiles}
        onDismiss={clearError}
        onClearRejections={() => {/* Clear rejections from local state */}}
      />

      {/* Drop Zone */}
      <div
        {...getDropZoneProps()}
        className={cn(
          'relative border-2 border-dashed rounded-xl',
          'flex flex-col items-center justify-center',
          'transition-colors duration-200 cursor-pointer',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',

          // Size based on compact mode and file state
          hasFiles && !compact ? 'p-6 min-h-[120px]' : 'p-8 min-h-[200px]',

          // Color states
          !isDragActive && 'border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100',
          isDragActive && isDragValid && 'border-blue-500 bg-blue-50',
          isDragActive && !isDragValid && 'border-red-500 bg-red-50'
        )}
      >
        <input {...getInputProps()} />

        {/* Icon */}
        {!hasFiles && (
          <div className={cn(
            'p-4 rounded-full mb-4',
            isDragActive && isDragValid && 'bg-blue-100 text-blue-600',
            isDragActive && !isDragValid && 'bg-red-100 text-red-600',
            !isDragActive && 'bg-gray-200 text-gray-500'
          )}>
            <Upload className="h-8 w-8" />
          </div>
        )}

        {/* Text content */}
        {isDragActive ? (
          isDragValid ? (
            <p className="text-blue-600 font-medium">Drop files here</p>
          ) : (
            <p className="text-red-600 font-medium">Invalid file type</p>
          )
        ) : hasFiles ? (
          <div className="flex items-center gap-2 text-gray-600">
            <Plus className="h-5 w-5" />
            <span>Add more files</span>
          </div>
        ) : (
          <>
            <p className="text-gray-700 font-medium">
              Drag files here or click to browse
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Supports images, videos, and PDF files
            </p>
            <p className="text-gray-400 text-xs mt-4">
              Max {CAPTURE_CONSTRAINTS.image.maxCount} files, {formatFileSize(CAPTURE_CONSTRAINTS.image.maxFileSize)} each
            </p>
          </>
        )}
      </div>

      {/* File Grid */}
      {hasFiles && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {files.map(file => (
              <FileCard
                key={file.id}
                file={file}
                onRemove={handleRemove}
              />
            ))}
          </div>

          {/* Progress Indicator */}
          <UploadProgress
            fileCount={files.length}
            maxFiles={CAPTURE_CONSTRAINTS.image.maxCount}
            totalSize={totalSize}
            maxTotalSize={CAPTURE_CONSTRAINTS.total.maxSize}
          />
        </>
      )}
    </div>
  );
}

// Helper function
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
```

---

## Authorized Files and Functions for Modification

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemCapture/components/steps/FileUploadStep.tsx` | Main step component |

### Files to Modify

| File Path | Modification | Reason |
|-----------|--------------|--------|
| `src/components/ItemCapture/index.ts` | Add `FileUploadStep` export | Public API |
| `src/components/ItemCapture/components/CaptureWizard.tsx` | Import and render FileUploadStep for 'upload-file' step | Integration |

### Files to Reference (Read-Only)

| File Path | Reference Purpose |
|-----------|-------------------|
| `src/components/ItemCapture/hooks/useFileUpload.ts` | Hook API integration |
| `src/components/ItemCapture/hooks/useItemCaptureState.ts` | State dispatch pattern |
| `src/components/ItemCapture/ItemCapture.types.ts` | Type definitions |
| `src/components/ItemCapture/utils/constants.ts` | Limits and format constants |
| `src/lib/utils.ts` | cn() utility |
| `src/components/ItemForm.tsx` | Form patterns, error display |
| `docs/REQ-041-create-usefileupload-hook-overview.md` | Hook specification |

---

## Styling Specifications

### Tailwind Classes Reference

| Element | Classes | Notes |
|---------|---------|-------|
| Drop Zone (default) | `border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100` | Neutral state |
| Drop Zone (drag valid) | `border-blue-500 bg-blue-50` | Accepting drop |
| Drop Zone (drag invalid) | `border-red-500 bg-red-50` | Rejecting drop |
| File Card | `bg-white border border-gray-200 rounded-lg shadow-sm` | Card container |
| Remove Button | `bg-red-100 text-red-600 hover:bg-red-200` | On hover visible |
| Error Alert | `bg-red-50 border border-red-200` | Error messages |
| Warning Alert | `bg-yellow-50 border border-yellow-200` | Rejection list |
| Progress Bar | `h-2 bg-gray-200 rounded-full` with `bg-blue-500`/`bg-red-500` fill | Size indicator |

### Responsive Breakpoints

| Breakpoint | Grid Columns | Touch Target | Drop Zone Min Height |
|------------|--------------|--------------|---------------------|
| Mobile (default) | 2 | 48px min | 200px (empty), 120px (has files) |
| sm (640px+) | 3 | 44px min | 200px |
| md (768px+) | 4 | 44px min | 200px |

---

## Accessibility Requirements

### ARIA Attributes

| Element | Attribute | Value |
|---------|-----------|-------|
| Drop Zone | `role` | `"button"` |
| Drop Zone | `tabIndex` | `0` |
| Drop Zone | `aria-label` | `"Drop files here or click to select"` |
| Hidden Input | `aria-hidden` | `true` |
| Error Alert | `role` | `"alert"` |
| Remove Button | `aria-label` | `"Remove {filename}"` |

### Keyboard Navigation

| Key | Action |
|-----|--------|
| Tab | Focus drop zone, then file cards |
| Enter/Space | When drop zone focused: open file picker |
| Enter/Space | When remove button focused: remove file |
| Escape | Close any expanded error details |

### Screen Reader Announcements

- File added: Announce "File {name} added successfully"
- File rejected: Announce rejection message
- Files cleared: Announce "All files removed"

---

## Testing Strategy

### Unit Test Coverage

| Test Case | Description |
|-----------|-------------|
| Render empty | Shows drop zone with prompt text |
| Render with files | Shows file grid with previews |
| Drag valid | Blue styling applied when isDragActive && isDragValid |
| Drag invalid | Red styling applied when isDragActive && !isDragValid |
| Click opens picker | openFilePicker called on zone click |
| Remove file | removeFile and dispatch called with correct ID |
| Error display | Error alert renders with correct message |
| Rejection display | Warning box shows rejected files |

### Integration Test Scenarios

| Scenario | Steps | Expected Result |
|----------|-------|-----------------|
| Add image | Click zone → Select .jpg | File appears in grid with thumbnail |
| Add PDF | Click zone → Select .pdf | File appears with PDF icon |
| Remove file | Click remove button | File removed from grid and state |
| Drag enter | Drag file over zone | Zone changes to active styling |
| Drag leave | Drag file away | Zone returns to default styling |
| Add to state | Add file | MediaItem dispatched to state machine |

### Manual Testing Matrix

| Platform | Browser | Priority | Notes |
|----------|---------|----------|-------|
| iOS 16+ | Safari | High | Touch-based selection, no drag-drop |
| Android | Chrome | High | Touch-based selection |
| Desktop | Chrome | High | Full drag-drop support |
| Desktop | Firefox | Medium | Verify drag events |
| Desktop | Edge | Low | Chromium-based |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Hook not complete | Medium | Blocking | Stub hook interface for parallel dev |
| Thumbnail loading slow | Medium | Low | Show loading state, lazy load |
| Large file grid scroll | Low | Medium | Virtualize if >20 files |
| Touch drag-drop issues | High | Low | Primary interaction is tap-to-select on mobile |
| Preview URL memory | Low | High | Hook handles cleanup; verify on file removal |

---

## Success Criteria

Based on REQ-042 Acceptance Criteria:

- [ ] Upload area responds to click events and opens the native file picker
- [ ] Drop zone visually changes appearance when files are dragged over it
- [ ] Each uploaded file displays an appropriate icon based on its file type
- [ ] Progress indicator appears and updates during file upload
- [ ] Error messages appear immediately when invalid file types are selected
- [ ] Successfully uploaded files display as thumbnail previews
- [ ] Users can proceed to the next wizard step after successful upload
- [ ] Users receive clear feedback if they attempt to proceed without uploading files

Additional Technical Criteria:

- [ ] Component integrates correctly with useFileUpload hook
- [ ] State machine receives MediaItem for each added file
- [ ] File removal updates both local and global state
- [ ] Responsive grid adapts to all breakpoints
- [ ] All interactive elements meet 48px touch target minimum
- [ ] Keyboard navigation works for all actions
- [ ] Screen readers announce state changes

---

## References

- [Drag and Drop API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API)
- [Implementation Plan](/docs/prd/item-capture-implementation-plan.md)
- [REQ-041 useFileUpload Overview](/docs/REQ-041-create-usefileupload-hook-overview.md)
- [REQ-039 PhotoCaptureStep Overview](/docs/REQ-039-implement-photocapturestep-overview.md) - Sibling step pattern
- [ItemForm.tsx](/src/components/ItemForm.tsx) - Form and error patterns
- [Lucide Icons](https://lucide.dev/icons/) - Icon reference
