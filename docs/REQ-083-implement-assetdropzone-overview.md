# REQ-083: Implement AssetDropZone Component - Technical Overview

**Document Created:** 2026-01-03
**Last Modified:** 2026-01-03
**Request Reference:** REQ-083 in `/docs/gen_requests.md`
**Implementation Plan Reference:** `/docs/prd/item-capture-manager-implementation-plan.md`
**Phase:** 5 - Asset Management
**Task ID:** 5.4
**Estimated Effort:** 2-3 story points

---

## Summary

Implement the `AssetDropZone` component as a drag-and-drop file upload area within the `AssetPanel`. This component provides an intuitive interface for users to add media files by either dragging them from their file system or clicking to open a file picker dialog. It includes visual feedback during drag operations, file type validation, and a preview queue showing files ready for upload.

The component integrates with the `useAssetManagement` hook (Task 5.1) via the parent `AssetPanel` (Task 5.2), leveraging validated file handling patterns established in the existing `useFileUpload` hook from `ItemCapture`.

---

## Technical Context

### Existing Stack
| Technology | Version | Notes |
|------------|---------|-------|
| Next.js | 15.5.9 | With Turbopack |
| React | 19.1.0 | |
| TypeScript | 5.x | Strict mode enabled |
| Tailwind CSS | 4.x | Utility-first styling |
| Lucide React | 0.525.0 | Icon library |
| Utility | `cn()` | Class merging from `src/lib/utils.ts` |

### Relevant Existing Patterns

| Pattern | Source File | Notes |
|---------|-------------|-------|
| Drag-and-drop upload | `src/components/ItemCapture/components/steps/FileUploadStep.tsx` | Complete drop zone UI with visual feedback, file grid, progress display |
| File upload hook | `src/components/ItemCapture/hooks/useFileUpload.ts` | Comprehensive validation, drag-and-drop events, preview URL management, `getDropZoneProps`/`getInputProps` pattern |
| File validation | `src/components/ItemCapture/hooks/useFileUpload.ts` | MIME type validation, size limits, type-specific constraints |
| Thumbnail display | `src/components/ItemCapture/components/shared/MediaThumbnail.tsx` | Object URL management, type indicators |
| PDF thumbnail | `src/components/ItemCapture/hooks/usePDFThumbnail.ts` | PDF first-page thumbnail generation |
| Constants | `src/components/ItemCapture/utils/constants.ts` | `SUPPORTED_IMAGE_TYPES`, `SUPPORTED_VIDEO_TYPES`, `CAPTURE_CONSTRAINTS` |

### Target Architecture (from Implementation Plan)

```
src/components/ItemManager/
├── components/
│   ├── AssetPanel/
│   │   ├── AssetPanel.tsx        (Task 5.2 - parent container)
│   │   ├── AssetItem.tsx         (Task 5.3 - individual asset display)
│   │   └── AssetDropZone.tsx     <-- THIS TASK
```

---

## Dependencies

### Phase Dependencies
- **Requires:** Task 5.2 (AssetPanel component) - Parent container that embeds AssetDropZone
- **Requires:** Task 5.1 (useAssetManagement hook) - State management, indirectly via AssetPanel props
- **Blocks:** Task 5.5 (Drag-and-Drop Reorder) - May share drag-and-drop patterns

### Task Dependencies
```
5.1 useAssetManagement Hook
         │
         ▼
5.2 AssetPanel Component
         │
    ┌────┴────┐
    ▼         ▼
  5.3       5.4
AssetItem  AssetDropZone  <-- THIS TASK
         │
         ▼
5.5 Drag-and-Drop Reorder
```

### Type Dependencies

From `ItemCapture` hooks (reuse patterns):
```typescript
import type {
  ValidatedFile,
  FileRejection,
  FileUploadError,
  FileCategory,
} from '@/components/ItemCapture/ItemCapture.types';
```

From `ItemManager` types:
```typescript
import type { PendingAsset } from '../../ItemManager.types';
```

---

## Implementation Requirements

### Core Functionality

1. **Drag-and-Drop File Upload Area**
   - Clearly defined drop zone with visible boundaries
   - Visual feedback when files are dragged over the zone (border/background change)
   - Accept files dropped from desktop or file manager
   - Support multiple file drops in single operation
   - Handle drag enter, over, leave, and drop events properly

2. **File Picker Click Fallback**
   - Clicking anywhere on the drop zone opens native file picker
   - Hidden file input element for form integration
   - Support multiple file selection via `multiple` attribute
   - Reset input value after selection to allow re-selecting same file

3. **File Type Validation**
   - Validate files against allowed MIME types (video, image, pdf)
   - Show immediate feedback for unsupported file types
   - Distinguish valid vs. invalid drag operations visually
   - Display user-friendly error messages for rejected files

4. **Preview of Queued Files**
   - Display thumbnails for images (via object URL)
   - Display video thumbnails or video icon overlay
   - Display PDF icon with page count badge
   - Show file name and size for each queued file
   - Allow removal of individual queued files before upload

5. **Integration with AssetPanel**
   - Callback to parent when files are validated and ready
   - Files passed to `useAssetManagement.addAssets()`
   - Clear queue after files are added to pending state
   - Respect `allowedMediaTypes` and `maxFileSize` from parent config

6. **Accessibility**
   - Keyboard activation (Enter/Space to open file picker)
   - ARIA attributes for drop zone role
   - Screen reader announcements for drag states
   - Focus management with visible focus indicators

### Component Props

```typescript
/**
 * Props for the AssetDropZone component.
 * Provides file upload area with drag-and-drop and click-to-select.
 */
export interface AssetDropZoneProps {
  /** Callback when valid files are selected/dropped */
  onFilesSelected: (files: File[]) => void;

  /** Allowed media types for validation */
  allowedMediaTypes?: ('video' | 'image' | 'pdf')[];

  /** Maximum file size in bytes (default: 100MB) */
  maxFileSize?: number;

  /** Maximum number of files allowed (default: 10) */
  maxFiles?: number;

  /** Whether multiple file selection is allowed (default: true) */
  multiple?: boolean;

  /** Current count of existing files (for max files validation) */
  currentFileCount?: number;

  /** Whether the drop zone is disabled */
  disabled?: boolean;

  /** Compact mode for smaller display (in scrolling list) */
  compact?: boolean;

  /** Optional additional CSS classes */
  className?: string;
}
```

### Internal State

```typescript
interface AssetDropZoneState {
  /** Files currently queued for upload */
  queuedFiles: QueuedFile[];

  /** Files rejected due to validation errors */
  rejectedFiles: FileRejection[];

  /** Whether a drag operation is active over the zone */
  isDragActive: boolean;

  /** Whether the current drag contains valid file types */
  isDragValid: boolean;

  /** Hook-level error state */
  error: FileUploadError | null;

  /** Total size of queued files */
  totalSize: number;
}

interface QueuedFile {
  /** Unique ID for this queued file */
  id: string;

  /** The original File object */
  file: File;

  /** File name */
  name: string;

  /** File size in bytes */
  size: number;

  /** MIME type */
  mimeType: string;

  /** File category (image, video, pdf, other) */
  category: FileCategory;

  /** Preview URL (object URL for images/videos) */
  previewUrl?: string;
}
```

---

## Visual Design

### Layout Structure

**Empty State (No Files Queued):**
```
┌────────────────────────────────────────┐
│                                        │
│           ┌──────────────┐            │
│           │    ↑         │            │
│           │   Upload     │            │
│           │    Icon      │            │
│           └──────────────┘            │
│                                        │
│    Drag files here or click to browse  │
│                                        │
│    Supports images, videos, and PDFs   │
│    Max 100MB per file                  │
│                                        │
└────────────────────────────────────────┘
```

**Drag Active State (Valid Files):**
```
┌────────────────────────────────────────┐
│  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │
│  ┃                                   ┃ │
│  ┃         Drop files here           ┃ │  ← Blue border, blue background
│  ┃                                   ┃ │
│  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
└────────────────────────────────────────┘
```

**Drag Active State (Invalid Files):**
```
┌────────────────────────────────────────┐
│  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │
│  ┃                                   ┃ │
│  ┃       Invalid file type           ┃ │  ← Red border, red background
│  ┃                                   ┃ │
│  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
└────────────────────────────────────────┘
```

**Files Queued State:**
```
┌────────────────────────────────────────┐
│  ┌─────────┐  ┌─────────┐  ┌────────┐ │
│  │ [thumb] │  │ [thumb] │  │ [+Add] │ │
│  │ photo.jpg │  │ video.mp4│  │ More   │ │
│  │ 2.3 MB [X]│ │ 15 MB [X]│  │        │ │
│  └─────────┘  └─────────┘  └────────┘ │
│                                        │
│  2 files selected • 17.3 MB total      │
│                                        │
└────────────────────────────────────────┘
```

### Tailwind Implementation

```tsx
// Drop Zone Container
<div
  {...getDropZoneProps()}
  className={cn(
    // Base styles
    'relative border-2 border-dashed rounded-xl',
    'flex flex-col items-center justify-center',
    'transition-all duration-200 cursor-pointer',
    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',

    // Size based on compact mode and file state
    compact ? 'p-4 min-h-[100px]' : 'p-6 min-h-[160px]',
    hasQueuedFiles && 'min-h-0 p-4',

    // Default state
    !isDragActive && !disabled &&
      'border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100',

    // Drag valid state
    isDragActive && isDragValid &&
      'border-blue-500 bg-blue-50 border-solid',

    // Drag invalid state
    isDragActive && !isDragValid &&
      'border-red-500 bg-red-50 border-solid',

    // Disabled state
    disabled && 'opacity-50 cursor-not-allowed pointer-events-none',

    className
  )}
>
  <input {...getInputProps()} />

  {/* Content based on state */}
  {isDragActive ? (
    isDragValid ? (
      <div className="text-blue-600 text-center">
        <Upload className="w-8 h-8 mx-auto mb-2" />
        <p className="font-medium">Drop files here</p>
      </div>
    ) : (
      <div className="text-red-600 text-center">
        <AlertCircle className="w-8 h-8 mx-auto mb-2" />
        <p className="font-medium">Invalid file type</p>
      </div>
    )
  ) : hasQueuedFiles ? (
    <div className="flex items-center gap-2 text-gray-600">
      <Plus className="w-5 h-5" />
      <span>Add more files</span>
    </div>
  ) : (
    <>
      <Upload className="w-10 h-10 text-gray-400 mb-3" />
      <p className="text-gray-700 font-medium text-center">
        Drag files here or click to browse
      </p>
      <p className="text-gray-500 text-sm mt-1 text-center">
        Supports images, videos, and PDFs
      </p>
      <p className="text-gray-400 text-xs mt-2">
        Max {maxFiles} files, {formatFileSize(maxFileSize)} each
      </p>
    </>
  )}
</div>

// Queued File Card
<div className="relative group bg-white rounded-lg border border-gray-200 p-2 shadow-sm">
  <div className="aspect-square rounded-md overflow-hidden bg-gray-100 mb-2 flex items-center justify-center relative">
    {previewUrl && category === 'image' && (
      <img src={previewUrl} alt={name} className="w-full h-full object-cover" />
    )}
    {previewUrl && category === 'video' && (
      <>
        <video src={previewUrl} className="w-full h-full object-cover" muted />
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <Play className="w-6 h-6 text-white fill-current" />
        </div>
      </>
    )}
    {category === 'pdf' && (
      <FileText className="w-8 h-8 text-red-500" />
    )}
  </div>

  <p className="text-xs font-medium text-gray-700 truncate" title={name}>
    {name}
  </p>
  <p className="text-xs text-gray-500">{formatFileSize(size)}</p>

  <button
    onClick={() => onRemoveQueued(id)}
    className={cn(
      'absolute top-1 right-1 p-1.5 rounded-full',
      'bg-red-100 text-red-600',
      'opacity-100 sm:opacity-0 sm:group-hover:opacity-100',
      'transition-opacity hover:bg-red-200',
      'focus:outline-none focus:ring-2 focus:ring-red-500 focus:opacity-100'
    )}
    aria-label={`Remove ${name}`}
  >
    <X className="w-3 h-3" />
  </button>
</div>
```

---

## Implementation Approach

### Option 1: Reuse useFileUpload Hook (Recommended)

Leverage the existing `useFileUpload` hook from ItemCapture which already provides:
- Drag-and-drop event handling
- File validation
- Preview URL management
- `getDropZoneProps()` and `getInputProps()` factories

```typescript
'use client';

import { useCallback, useEffect } from 'react';
import { Upload, Plus, X, AlertCircle, FileText, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFileUpload } from '@/components/ItemCapture/hooks/useFileUpload';
import type { ValidatedFile } from '@/components/ItemCapture/ItemCapture.types';

export interface AssetDropZoneProps {
  onFilesSelected: (files: File[]) => void;
  allowedMediaTypes?: ('video' | 'image' | 'pdf')[];
  maxFileSize?: number;
  maxFiles?: number;
  multiple?: boolean;
  currentFileCount?: number;
  disabled?: boolean;
  compact?: boolean;
  className?: string;
}

export function AssetDropZone({
  onFilesSelected,
  allowedMediaTypes = ['video', 'image', 'pdf'],
  maxFileSize = 100 * 1024 * 1024, // 100MB
  maxFiles = 10,
  multiple = true,
  currentFileCount = 0,
  disabled = false,
  compact = false,
  className,
}: AssetDropZoneProps) {
  // Build allowed MIME types from allowedMediaTypes
  const allowedMimeTypes = useMemo(() => {
    const types: string[] = [];
    if (allowedMediaTypes.includes('image')) {
      types.push('image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif');
    }
    if (allowedMediaTypes.includes('video')) {
      types.push('video/mp4', 'video/quicktime', 'video/webm');
    }
    if (allowedMediaTypes.includes('pdf')) {
      types.push('application/pdf');
    }
    return types;
  }, [allowedMediaTypes]);

  // Handle files added - pass to parent
  const handleFilesAdded = useCallback((validatedFiles: ValidatedFile[]) => {
    const files = validatedFiles.map(vf => vf.file);
    onFilesSelected(files);
  }, [onFilesSelected]);

  const {
    files,
    rejectedFiles,
    isDragActive,
    isDragValid,
    error,
    hasFiles,
    removeFile,
    getDropZoneProps,
    getInputProps,
    clearError,
    clearFiles,
  } = useFileUpload({
    allowedMimeTypes,
    maxFileSize,
    maxFiles: maxFiles - currentFileCount,
    multiple,
    onFilesAdded: handleFilesAdded,
  });

  // Clear files after they've been passed to parent
  useEffect(() => {
    if (hasFiles) {
      // Files have been passed to parent via callback
      // Clear local queue since they're now in pending state
      clearFiles();
    }
  }, [hasFiles, clearFiles]);

  const dropZoneProps = getDropZoneProps();
  const inputProps = getInputProps();

  return (
    <div className={cn('space-y-3', className)}>
      {/* Error Display */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-700">{error.message}</p>
            <button
              onClick={clearError}
              className="text-red-600 text-xs underline mt-1"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Rejected Files Display */}
      {rejectedFiles.length > 0 && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
          <p className="text-yellow-800 font-medium mb-1">
            {rejectedFiles.length} file{rejectedFiles.length > 1 ? 's' : ''} couldn't be added
          </p>
          <ul className="space-y-1">
            {rejectedFiles.map((rejection, index) => (
              <li key={index} className="text-yellow-700 text-xs">
                <span className="font-medium">{rejection.file.name}</span>
                {' — '}{rejection.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Drop Zone */}
      <div
        {...dropZoneProps}
        className={cn(
          'relative border-2 border-dashed rounded-xl',
          'flex flex-col items-center justify-center',
          'transition-all duration-200 cursor-pointer',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          compact ? 'p-4 min-h-[80px]' : 'p-6 min-h-[140px]',
          !isDragActive && !disabled &&
            'border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100',
          isDragActive && isDragValid &&
            'border-blue-500 bg-blue-50 border-solid',
          isDragActive && !isDragValid &&
            'border-red-500 bg-red-50 border-solid',
          disabled && 'opacity-50 cursor-not-allowed pointer-events-none'
        )}
        aria-disabled={disabled}
      >
        <input {...inputProps} />

        {isDragActive ? (
          isDragValid ? (
            <div className="text-blue-600 text-center">
              <Upload className="w-8 h-8 mx-auto mb-2" />
              <p className="font-medium">Drop files here</p>
            </div>
          ) : (
            <div className="text-red-600 text-center">
              <AlertCircle className="w-8 h-8 mx-auto mb-2" />
              <p className="font-medium">Invalid file type</p>
            </div>
          )
        ) : (
          <>
            <Upload className={cn(
              'text-gray-400 mb-2',
              compact ? 'w-6 h-6' : 'w-8 h-8'
            )} />
            <p className={cn(
              'text-gray-700 font-medium text-center',
              compact && 'text-sm'
            )}>
              Drag files here or click to browse
            </p>
            {!compact && (
              <>
                <p className="text-gray-500 text-sm mt-1 text-center">
                  Supports {allowedMediaTypes.join(', ')} files
                </p>
                <p className="text-gray-400 text-xs mt-2">
                  Max {formatFileSize(maxFileSize)} per file
                </p>
              </>
            )}
          </>
        )}
      </div>

      {/* Screen reader announcements */}
      <div aria-live="polite" className="sr-only">
        {isDragActive && isDragValid && 'Drop zone active. Release to upload files.'}
        {isDragActive && !isDragValid && 'Invalid file type. Cannot drop this file.'}
      </div>
    </div>
  );
}

// Utility function
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export default AssetDropZone;
```

### Option 2: Self-Contained Implementation

If isolation from ItemCapture is preferred, implement drag-and-drop handlers inline. This option provides more control but requires duplicating logic from `useFileUpload`.

The recommended approach is Option 1, as it reuses battle-tested code and maintains consistency.

---

## Authorized Files and Functions for Modification

### Files to Create

| File | Purpose |
|------|---------|
| `src/components/ItemManager/components/AssetPanel/AssetDropZone.tsx` | Main drop zone component |

### Files to Modify

| File | Change |
|------|--------|
| `src/components/ItemManager/components/AssetPanel/index.ts` | Export AssetDropZone component |
| `src/components/ItemManager/components/AssetPanel/AssetPanel.tsx` | Integrate AssetDropZone, replace "Add Media" button placeholder |
| `src/components/ItemManager/ItemManager.types.ts` | Add `AssetDropZoneProps` interface if not importing from ItemCapture |

### Functions/Components to Create

| Name | Location | Purpose |
|------|----------|---------|
| `AssetDropZone` | `AssetPanel/AssetDropZone.tsx` | Main drop zone component |
| `formatFileSize` | `AssetPanel/AssetDropZone.tsx` or shared util | Format bytes to human-readable string |

### Pattern Reuse

| Pattern | Source | Application |
|---------|--------|-------------|
| `useFileUpload` hook | `ItemCapture/hooks/useFileUpload.ts` | All drag-drop logic, validation, preview URLs |
| `getDropZoneProps` | `useFileUpload` | Spreads event handlers onto container |
| `getInputProps` | `useFileUpload` | Spreads attributes onto hidden input |
| Visual states | `FileUploadStep.tsx` | Border/background color transitions |

---

## Acceptance Criteria

From REQ-083:

- [ ] User can drag one or multiple files from their file system onto the drop zone area
- [ ] User can click on the drop zone to open a file picker dialog
- [ ] Drop zone provides visual feedback when files are dragged over it (highlight, border change, or similar indicator)
- [ ] Files with unsupported types are rejected with a clear error message
- [ ] Accepted files appear in a queue with preview information (file name, size, and thumbnail/icon)
- [ ] User can see all queued files before confirming upload
- [ ] Drop zone clearly indicates its purpose when no files are queued (e.g., instructional text or icon)

### Additional Technical Criteria

- [ ] Component uses `'use client'` directive
- [ ] TypeScript strict mode compliance with no `any` types
- [ ] Reuses `useFileUpload` hook from ItemCapture for consistency
- [ ] Object URLs are properly cleaned up on file removal and unmount
- [ ] Keyboard accessible (Enter/Space opens file picker)
- [ ] ARIA attributes for drop zone semantics
- [ ] Responsive design (compact mode for panel integration)
- [ ] Touch-friendly file removal (visible remove button on mobile)
- [ ] Follows FileUploadStep visual patterns for consistency

---

## Edge Cases

1. **Max Files Exceeded**
   - Show error message when trying to add more than allowed
   - Prevent drop/selection of additional files
   - Consider `currentFileCount` prop from parent

2. **Large File Rejection**
   - Show specific error with file name and size limit
   - Display rejected file separately from valid ones

3. **Empty Drop (No Files)**
   - Handle DataTransfer with no file items gracefully
   - May occur from text drag or browser quirks

4. **Same File Re-selected**
   - Reset input value to allow selecting same file again
   - Generate new UUID for duplicate file

5. **Mixed Valid/Invalid Files**
   - Accept valid files, reject invalid ones
   - Show both success (added) and rejection messages

6. **Drag Leave False Positive**
   - Use drag counter pattern to avoid flickering
   - Only reset isDragActive when counter reaches 0

7. **PDF Thumbnail Generation Delay**
   - Show loading placeholder while generating
   - Use icon fallback if generation fails

8. **Very Long File Names**
   - Truncate with ellipsis in preview card
   - Show full name on hover via `title` attribute

9. **Component Disabled State**
   - Prevent all interactions when `disabled` prop is true
   - Visual indication of disabled state

10. **Rapid File Additions**
    - Queue should handle rapid successive drops
    - Batch callback to parent when appropriate

---

## Testing Approach

### Unit Tests

- [ ] Renders drop zone with default instructional text
- [ ] Opens file picker on click
- [ ] Opens file picker on Enter/Space key
- [ ] Shows drag active state when files dragged over
- [ ] Shows valid drag state for allowed file types
- [ ] Shows invalid drag state for disallowed file types
- [ ] Calls `onFilesSelected` with valid files on drop
- [ ] Calls `onFilesSelected` with valid files on file picker selection
- [ ] Shows rejection message for invalid files
- [ ] Respects `maxFileSize` validation
- [ ] Respects `allowedMediaTypes` validation
- [ ] Renders in compact mode correctly
- [ ] Disabled state prevents interaction

### Integration Tests

- [ ] AssetDropZone works within AssetPanel context
- [ ] Files selected trigger `addAssets` in useAssetManagement
- [ ] Queue displays correctly with mixed file types
- [ ] Rejection dismissal works

### Manual Testing Checklist

- [ ] Desktop Chrome: drag-and-drop from file manager
- [ ] Desktop Firefox: drag-and-drop visual feedback
- [ ] Desktop Safari: file picker opens correctly
- [ ] Mobile Safari: click opens file picker (no drag-drop on mobile)
- [ ] Mobile Chrome: touch on drop zone opens picker
- [ ] VoiceOver: announces drop zone purpose
- [ ] Keyboard: Tab to zone, Enter opens picker
- [ ] Video files show play icon overlay
- [ ] PDF files show document icon
- [ ] Image files show thumbnail preview
- [ ] Long file names truncate with ellipsis

### Test Harness Addition

Add to `/src/app/test/item-manager/page.tsx`:

```tsx
// AssetDropZone test section
<section className="mt-8 p-4 border rounded">
  <h2 className="text-lg font-bold mb-4">AssetDropZone States</h2>

  {/* Default State */}
  <div className="mb-4">
    <h3 className="text-sm font-medium mb-2">Default</h3>
    <AssetDropZone
      onFilesSelected={(files) => console.log('Files selected:', files)}
      allowedMediaTypes={['video', 'image', 'pdf']}
      maxFileSize={100 * 1024 * 1024}
    />
  </div>

  {/* Compact Mode */}
  <div className="mb-4">
    <h3 className="text-sm font-medium mb-2">Compact Mode</h3>
    <AssetDropZone
      onFilesSelected={(files) => console.log('Files selected:', files)}
      compact={true}
    />
  </div>

  {/* Disabled State */}
  <div className="mb-4">
    <h3 className="text-sm font-medium mb-2">Disabled</h3>
    <AssetDropZone
      onFilesSelected={(files) => console.log('Files selected:', files)}
      disabled={true}
    />
  </div>

  {/* Image Only */}
  <div className="mb-4">
    <h3 className="text-sm font-medium mb-2">Images Only</h3>
    <AssetDropZone
      onFilesSelected={(files) => console.log('Files selected:', files)}
      allowedMediaTypes={['image']}
    />
  </div>
</section>
```

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Object URL memory leaks | Medium | Medium | Use `useFileUpload` hook which handles cleanup automatically |
| Browser compatibility for drag-drop | Low | Medium | Use standard HTML5 drag-drop APIs; tested in FileUploadStep |
| Mobile drag-drop not supported | N/A | N/A | Click-to-select is primary interaction on mobile |
| PDF thumbnail generation slow | Medium | Low | Show loading state, fallback to icon |
| Large file preview performance | Medium | Low | Use thumbnails, not full files; limit preview size |
| Drag events bubble incorrectly | Low | Low | Use drag counter pattern from useFileUpload |

---

## Future Enhancements

1. **Upload Progress Indicator**
   - Show progress bar during actual file upload
   - Currently files go to pending state immediately

2. **Drag-and-Drop from Other Sources**
   - Support dropping images from web pages (URLs)
   - Support pasting from clipboard

3. **Camera Capture Integration**
   - Quick capture button to open camera
   - Direct upload from camera on mobile

4. **File Preview Expansion**
   - Click on queued file to see larger preview
   - Video playback preview

5. **Batch Error Handling**
   - More detailed error breakdown per file
   - Retry failed files individually

6. **Animation Polish**
   - Smooth transitions for drag states
   - File card appear animations

---

## References

- [Implementation Plan - Phase 5 Task 5.4](/docs/prd/item-capture-manager-implementation-plan.md#phase-5-asset-management-estimated-3-4-days)
- [REQ-081 AssetPanel Overview](/docs/REQ-081-build-assetpanel-component-overview.md)
- [REQ-080 useAssetManagement Hook Overview](/docs/REQ-080-create-useassetmanagement-hook-overview.md)
- [REQ-082 AssetItem Overview](/docs/REQ-082-implement-assetitem-component-overview.md)
- [FileUploadStep Component](/src/components/ItemCapture/components/steps/FileUploadStep.tsx)
- [useFileUpload Hook](/src/components/ItemCapture/hooks/useFileUpload.ts)
- [REQ-083 in gen_requests.md](/docs/gen_requests.md)

---

## Document History

| Date | Author | Changes |
|------|--------|---------|
| 2026-01-03 | Tech Lead Agent | Initial document creation |
