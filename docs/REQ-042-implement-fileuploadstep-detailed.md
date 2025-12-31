# REQ-042: Implement FileUploadStep - Detailed Task Breakdown

**Generated:** 2025-12-31T08:29:06
**Last Modified:** 2025-12-31T08:29:06
**Overview Reference:** `/docs/REQ-042-implement-fileuploadstep-overview.md`
**Request Reference:** REQ-042 in `/docs/gen_requests.md`
**Implementation Plan Reference:** `/docs/prd/item-capture-implementation-plan.md`
**Phase:** 3 - File Upload & Text
**Task ID:** 3.2

---

## Document Purpose

This document provides step-by-step implementation tasks for the `FileUploadStep` component. Each task is scoped to approximately 1 story point (a few hours of focused work) and includes specific verification steps.

---

## Prerequisites

Before starting implementation, verify the following are complete:

| Prerequisite | Location | Status Check |
|--------------|----------|--------------|
| Phase 1 Complete | Tasks 1.1-1.5 | Directory structure exists |
| Task 3.1 Complete | `useFileUpload` hook | Verify hook exists at `src/components/ItemCapture/hooks/useFileUpload.ts` |
| ItemCapture directory | `src/components/ItemCapture/` | Verify directory exists |
| steps directory | `src/components/ItemCapture/components/steps/` | Create if not exists |
| constants.ts | `src/components/ItemCapture/utils/constants.ts` | Verify file exists with CAPTURE_CONSTRAINTS, SUPPORTED_FORMATS |
| ItemCapture.types.ts | `src/components/ItemCapture/ItemCapture.types.ts` | Verify ValidatedFile, FileRejection types exist |
| cn utility | `src/lib/utils.ts` | Verify cn() function exists |
| lucide-react | `package.json` | Verify lucide-react is installed |

---

## Authorized Files for Modification

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemCapture/components/steps/FileUploadStep.tsx` | Main step component |

### Files to Modify

| File Path | Modification | Reason |
|-----------|--------------|--------|
| `src/components/ItemCapture/index.ts` | Add `FileUploadStep` export | Public API |
| `src/components/ItemCapture/components/CaptureWizard.tsx` | Import and render FileUploadStep for 'upload-file' step | Wizard integration |

### Files to Reference (Read-Only)

| File Path | Reference Purpose |
|-----------|-------------------|
| `src/components/ItemCapture/hooks/useFileUpload.ts` | Hook API integration |
| `src/components/ItemCapture/hooks/useItemCaptureState.ts` | State dispatch pattern, useItemCaptureContext |
| `src/components/ItemCapture/ItemCapture.types.ts` | Type definitions (ValidatedFile, FileRejection, etc.) |
| `src/components/ItemCapture/utils/constants.ts` | CAPTURE_CONSTRAINTS, SUPPORTED_FORMATS |
| `src/lib/utils.ts` | cn() utility function |
| `src/components/ItemForm.tsx` | Form patterns, error display |
| `docs/REQ-041-create-usefileupload-hook-overview.md` | Hook specification |
| `docs/REQ-039-implement-photocapturestep-overview.md` | Sibling step pattern reference |

---

## Implementation Tasks

### Task 3.2.1: Create FileUploadStep Component File with Props Interface

**Objective:** Create the component file with proper TypeScript interface, imports, and basic structure.

**Estimated Time:** 30 minutes

**Dependencies:** Task 3.1 (useFileUpload hook) complete

**Implementation Steps:**

1. Create `src/components/ItemCapture/components/steps/FileUploadStep.tsx`

2. Add required imports:
   ```typescript
   'use client';

   import { useCallback } from 'react';
   import {
     Upload,
     Image,
     Video,
     FileText,
     File,
     X,
     AlertCircle,
     Plus
   } from 'lucide-react';
   import { cn } from '@/lib/utils';
   import { useFileUpload } from '../../hooks/useFileUpload';
   import { useItemCaptureContext } from '../../hooks/useItemCaptureState';
   import { SUPPORTED_FORMATS, CAPTURE_CONSTRAINTS } from '../../utils/constants';
   import type { ValidatedFile, FileRejection, FileUploadError } from '../../ItemCapture.types';
   ```

3. Define the props interface:
   ```typescript
   interface FileUploadStepProps {
     /** Optional CSS class name for the root element */
     className?: string;

     /** Whether to show the step in compact mode (for modal use) */
     compact?: boolean;
   }
   ```

4. Create component skeleton:
   ```typescript
   export function FileUploadStep({ className, compact = false }: FileUploadStepProps) {
     const { dispatch } = useItemCaptureContext();

     return (
       <div className={cn('space-y-4', className)}>
         {/* Component content will be added in subsequent tasks */}
         <div>FileUploadStep placeholder</div>
       </div>
     );
   }
   ```

5. Add default export and named export for flexibility

**Verification Steps:**

- [ ] File compiles without TypeScript errors
- [ ] Component can be imported in test file
- [ ] Props interface has JSDoc comments
- [ ] Run `npm run build` - no type errors

---

### Task 3.2.2: Implement useFileUpload Hook Integration

**Objective:** Integrate the useFileUpload hook with proper configuration and callback handlers.

**Estimated Time:** 45 minutes

**Dependencies:** Task 3.2.1 complete

**Implementation Steps:**

1. In `FileUploadStep.tsx`, add the `handleFilesAdded` callback:
   ```typescript
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
   ```

2. Initialize the useFileUpload hook with proper options:
   ```typescript
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
   ```

3. Implement `handleRemove` callback to sync with state machine:
   ```typescript
   const handleRemove = useCallback((id: string) => {
     removeFile(id);
     dispatch({ type: 'REMOVE_MEDIA', payload: id });
   }, [removeFile, dispatch]);
   ```

**Verification Steps:**

- [ ] Hook initializes without errors
- [ ] All required values are destructured from hook
- [ ] handleFilesAdded dispatches ADD_MEDIA action with correct payload
- [ ] handleRemove dispatches REMOVE_MEDIA action
- [ ] Constants are used for configuration values

---

### Task 3.2.3: Implement DropZone Component with Visual States

**Objective:** Create the drop zone area with proper visual feedback for different states (empty, drag active valid, drag active invalid, has files).

**Estimated Time:** 45 minutes

**Dependencies:** Task 3.2.2 complete

**Implementation Steps:**

1. Create the drop zone JSX structure with spread props:
   ```typescript
   <div
     {...getDropZoneProps()}
     className={cn(
       // Base styles
       'relative border-2 border-dashed rounded-xl',
       'flex flex-col items-center justify-center',
       'transition-colors duration-200 cursor-pointer',
       'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',

       // Size based on compact mode and file state
       hasFiles && !compact ? 'p-6 min-h-[120px]' : 'p-8 min-h-[200px]',

       // Default state
       !isDragActive && 'border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100',

       // Drag valid state
       isDragActive && isDragValid && 'border-blue-500 bg-blue-50',

       // Drag invalid state
       isDragActive && !isDragValid && 'border-red-500 bg-red-50'
     )}
   >
     <input {...getInputProps()} />
     {/* Content will be added in this task */}
   </div>
   ```

2. Add the icon container with state-based styling:
   ```typescript
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
   ```

3. Add conditional text content based on state:
   ```typescript
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
   ```

4. Add the `formatFileSize` helper function (can be placed before component or imported):
   ```typescript
   function formatFileSize(bytes: number): string {
     if (bytes === 0) return '0 B';
     const k = 1024;
     const sizes = ['B', 'KB', 'MB', 'GB'];
     const i = Math.floor(Math.log(bytes) / Math.log(k));
     return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
   }
   ```

**Verification Steps:**

- [ ] Drop zone renders with correct default styling
- [ ] Dragging valid file types shows blue border and "Drop files here"
- [ ] Dragging invalid file types shows red border and "Invalid file type"
- [ ] After files added, shows "Add more files" with Plus icon
- [ ] formatFileSize correctly formats byte values to human-readable strings
- [ ] Drop zone has proper focus ring for accessibility

---

### Task 3.2.4: Create FileCard Subcomponent for File Previews

**Objective:** Create a reusable FileCard component that displays file thumbnail, name, size, and remove button.

**Estimated Time:** 45 minutes

**Dependencies:** Task 3.2.1 complete

**Implementation Steps:**

1. Create the FileCard interface (within FileUploadStep.tsx or as separate internal component):
   ```typescript
   interface FileCardProps {
     file: ValidatedFile;
     onRemove: (id: string) => void;
   }
   ```

2. Implement the FileCard component:
   ```typescript
   function FileCard({ file, onRemove }: FileCardProps) {
     const icon = getFileIcon(file.category);
     const sizeLabel = formatFileSize(file.size);

     return (
       <div className="relative group bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
         {/* Thumbnail or Icon */}
         <div className="aspect-square rounded-md overflow-hidden bg-gray-100 mb-2 flex items-center justify-center relative">
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
           {file.category === 'video' && file.previewUrl && (
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

3. Implement the `getFileIcon` helper function:
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

**Verification Steps:**

- [ ] FileCard renders correctly for image files with preview
- [ ] FileCard renders correctly for video files with icon and play overlay
- [ ] FileCard renders correctly for PDF files with FileText icon
- [ ] File name is truncated with ellipsis if too long
- [ ] Full filename shows on hover (title attribute)
- [ ] Remove button is hidden by default, visible on hover
- [ ] Remove button is always visible when focused (keyboard navigation)
- [ ] Remove button has proper aria-label for screen readers

---

### Task 3.2.5: Implement FileList Grid Layout

**Objective:** Create a responsive grid that displays all uploaded files using FileCard components.

**Estimated Time:** 30 minutes

**Dependencies:** Task 3.2.4 complete

**Implementation Steps:**

1. Add the file grid section after the drop zone:
   ```typescript
   {hasFiles && (
     <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
       {files.map(file => (
         <FileCard
           key={file.id}
           file={file}
           onRemove={handleRemove}
         />
       ))}
     </div>
   )}
   ```

2. Update the grid to be responsive with proper breakpoints:
   - Mobile (default): 2 columns
   - Small (640px+): 3 columns
   - Medium (768px+): 4 columns

3. Add compact mode support for the grid:
   ```typescript
   {hasFiles && (
     <div className={cn(
       'grid gap-3',
       compact
         ? 'grid-cols-3 sm:grid-cols-4'
         : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
     )}>
       {files.map(file => (
         <FileCard
           key={file.id}
           file={file}
           onRemove={handleRemove}
         />
       ))}
     </div>
   )}
   ```

**Verification Steps:**

- [ ] Grid renders with 2 columns on mobile
- [ ] Grid expands to 3 columns at 640px
- [ ] Grid expands to 4 columns at 768px
- [ ] Each FileCard has proper gap spacing
- [ ] Compact mode reduces column sizes appropriately
- [ ] Files maintain correct order in grid
- [ ] Grid handles empty state (no render when no files)

---

### Task 3.2.6: Implement ErrorDisplay Component

**Objective:** Create a component to display hook-level errors and file rejections with dismiss functionality.

**Estimated Time:** 45 minutes

**Dependencies:** Task 3.2.1 complete

**Implementation Steps:**

1. Add state for tracking cleared rejections:
   ```typescript
   const [clearedRejections, setClearedRejections] = useState(false);

   // Reset cleared state when new rejections come in
   useEffect(() => {
     if (rejectedFiles.length > 0) {
       setClearedRejections(false);
     }
   }, [rejectedFiles]);
   ```

2. Create the ErrorDisplay component:
   ```typescript
   interface ErrorDisplayProps {
     error: FileUploadError | null;
     rejectedFiles: FileRejection[];
     onDismissError: () => void;
     onClearRejections: () => void;
     showRejections: boolean;
   }

   function ErrorDisplay({
     error,
     rejectedFiles,
     onDismissError,
     onClearRejections,
     showRejections
   }: ErrorDisplayProps) {
     if (!error && (!showRejections || rejectedFiles.length === 0)) return null;

     return (
       <div className="space-y-3">
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
               onClick={onDismissError}
               className="text-red-400 hover:text-red-600"
               aria-label="Dismiss error"
             >
               <X className="h-5 w-5" />
             </button>
           </div>
         )}

         {/* Rejected files list */}
         {showRejections && rejectedFiles.length > 0 && (
           <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
             <div className="flex items-center justify-between mb-2">
               <p className="text-yellow-800 font-medium">
                 {rejectedFiles.length} file{rejectedFiles.length > 1 ? 's' : ''} couldn't be added
               </p>
               <button
                 onClick={onClearRejections}
                 className="text-yellow-600 hover:text-yellow-800 text-sm underline"
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

3. Integrate ErrorDisplay into the main component:
   ```typescript
   <ErrorDisplay
     error={error}
     rejectedFiles={rejectedFiles}
     onDismissError={clearError}
     onClearRejections={() => setClearedRejections(true)}
     showRejections={!clearedRejections}
   />
   ```

**Verification Steps:**

- [ ] Error alert shows when `error` is present
- [ ] Error has correct ARIA role="alert" for accessibility
- [ ] Error can be dismissed with X button
- [ ] Rejected files show in yellow warning box
- [ ] Each rejected file shows filename and reason
- [ ] Rejections can be dismissed separately from errors
- [ ] Dismissing rejections hides the warning box
- [ ] New rejections re-show the warning box

---

### Task 3.2.7: Implement UploadProgress Indicator

**Objective:** Create a progress indicator showing file count and total size with visual progress bar.

**Estimated Time:** 30 minutes

**Dependencies:** Task 3.2.2 complete

**Implementation Steps:**

1. Create the UploadProgress component:
   ```typescript
   interface UploadProgressProps {
     fileCount: number;
     maxFiles: number;
     totalSize: number;
     maxTotalSize: number;
   }

   function UploadProgress({
     fileCount,
     maxFiles,
     totalSize,
     maxTotalSize
   }: UploadProgressProps) {
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
                 'h-full rounded-full transition-all duration-300',
                 sizePercent > 80 ? 'bg-red-500' : 'bg-blue-500'
               )}
               style={{ width: `${sizePercent}%` }}
               role="progressbar"
               aria-valuenow={sizePercent}
               aria-valuemin={0}
               aria-valuemax={100}
               aria-label="Upload size progress"
             />
           </div>
           <span>{sizeText}</span>
         </div>
       </div>
     );
   }
   ```

2. Integrate UploadProgress after the file grid:
   ```typescript
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

       <UploadProgress
         fileCount={files.length}
         maxFiles={CAPTURE_CONSTRAINTS.image.maxCount}
         totalSize={totalSize}
         maxTotalSize={CAPTURE_CONSTRAINTS.total.maxSize}
       />
     </>
   )}
   ```

**Verification Steps:**

- [ ] Progress indicator shows file count (e.g., "3/10 files")
- [ ] Progress indicator shows size with formatted values (e.g., "45.2 MB / 200 MB")
- [ ] Progress bar width reflects actual percentage
- [ ] Progress bar turns red when > 80% full
- [ ] Progress bar has proper ARIA attributes for accessibility
- [ ] Progress updates immediately when files added/removed

---

### Task 3.2.8: Add Accessibility Features

**Objective:** Ensure the component meets accessibility requirements with proper ARIA attributes and keyboard navigation.

**Estimated Time:** 30 minutes

**Dependencies:** Tasks 3.2.3, 3.2.4, 3.2.6, 3.2.7 complete

**Implementation Steps:**

1. Verify drop zone has proper ARIA attributes from getDropZoneProps():
   - `role="button"`
   - `tabIndex={0}`
   - `aria-label="Drop files here or click to select"`

2. Add keyboard event handling to drop zone:
   ```typescript
   const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
     if (e.key === 'Enter' || e.key === ' ') {
       e.preventDefault();
       openFilePicker();
     }
   }, [openFilePicker]);
   ```

3. Update drop zone props spread to include onKeyDown:
   ```typescript
   <div
     {...getDropZoneProps()}
     onKeyDown={handleKeyDown}
     // ... other props
   >
   ```

4. Ensure all error displays have proper roles:
   - Error alert: `role="alert"`
   - Warning box: Consider `role="status"` or leave implicit

5. Verify all interactive elements have visible focus indicators:
   - Drop zone: `focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`
   - Remove buttons: `focus:ring-2 focus:ring-red-500 focus:opacity-100`
   - Dismiss buttons: Ensure visible focus state

6. Add screen reader announcements for dynamic content:
   ```typescript
   // Consider adding aria-live region for file additions
   <div aria-live="polite" className="sr-only">
     {hasFiles && `${files.length} files uploaded`}
   </div>
   ```

**Verification Steps:**

- [ ] Tab key navigates to drop zone, then to remove buttons on cards
- [ ] Enter/Space on drop zone opens file picker
- [ ] Enter/Space on remove button removes file
- [ ] Focus ring visible on all interactive elements
- [ ] Screen reader announces errors when they appear
- [ ] Screen reader can read file count and names
- [ ] Keyboard navigation works without mouse

---

### Task 3.2.9: Add Responsive Design Adjustments

**Objective:** Ensure the component works well across all screen sizes and device types.

**Estimated Time:** 30 minutes

**Dependencies:** Tasks 3.2.3, 3.2.5 complete

**Implementation Steps:**

1. Verify touch targets meet minimum size (48px):
   - Drop zone click/tap area: Already large enough
   - Remove buttons: Ensure padding creates 48px tap target:
     ```typescript
     // Update FileCard remove button
     <button
       onClick={() => onRemove(file.id)}
       className={cn(
         'absolute top-1 right-1 p-2', // p-2 = 8px + icon = larger tap target
         'bg-red-100 text-red-600',
         'opacity-0 group-hover:opacity-100 sm:opacity-0',
         // Always visible on touch devices (no hover)
         'touch:opacity-100',
         'transition-opacity hover:bg-red-200',
         'focus:outline-none focus:ring-2 focus:ring-red-500 focus:opacity-100'
       )}
       aria-label={`Remove ${file.name}`}
     >
       <X className="h-5 w-5" />
     </button>
     ```

2. Add touch-friendly remove button visibility:
   ```typescript
   // Option: Always show remove buttons on mobile
   // Use media query or container query
   'opacity-100 sm:opacity-0 sm:group-hover:opacity-100'
   ```

3. Adjust drop zone height for different screens:
   ```typescript
   // Already handled with compact prop
   hasFiles && !compact ? 'p-6 min-h-[120px]' : 'p-8 min-h-[200px]'
   ```

4. Ensure text is readable at all sizes:
   - File names: Already truncated with `truncate` class
   - Size labels: Using `text-sm` and `text-xs` appropriately

5. Test grid responsiveness:
   - Mobile: Verify 2 columns work well
   - Tablet: Verify 3 columns don't feel cramped
   - Desktop: Verify 4 columns have adequate spacing

**Verification Steps:**

- [ ] Remove buttons are visible/tappable on touch devices
- [ ] Drop zone is easy to tap on mobile
- [ ] File grid doesn't overflow on small screens
- [ ] Text remains readable at all sizes
- [ ] No horizontal scroll on mobile
- [ ] Component works in landscape and portrait orientations

---

### Task 3.2.10: Integrate with CaptureWizard

**Objective:** Connect FileUploadStep to the wizard navigation so it renders for the 'upload-file' step.

**Estimated Time:** 30 minutes

**Dependencies:** Tasks 3.2.1-3.2.9 complete

**Implementation Steps:**

1. Open `src/components/ItemCapture/components/CaptureWizard.tsx`

2. Add import for FileUploadStep:
   ```typescript
   import { FileUploadStep } from './steps/FileUploadStep';
   ```

3. Find the step rendering logic and add the 'upload-file' case:
   ```typescript
   // Assuming switch/case or conditional rendering pattern
   case 'upload-file':
     return <FileUploadStep />;

   // Or if using object mapping:
   const stepComponents: Record<WizardStep, React.ComponentType> = {
     // ... other steps
     'upload-file': FileUploadStep,
     // ... other steps
   };
   ```

4. Verify step transitions work correctly:
   - Coming from ContentTypeStep (when user selects upload option)
   - Going to next step (review or add-more)

5. Handle any step-specific navigation requirements

**Verification Steps:**

- [ ] FileUploadStep renders when wizard step is 'upload-file'
- [ ] Can navigate to FileUploadStep from content type selection
- [ ] Can navigate away from FileUploadStep using wizard navigation
- [ ] Files persist in state when navigating back
- [ ] No errors in console during step transitions

---

### Task 3.2.11: Export FileUploadStep from Index

**Objective:** Add FileUploadStep to the public exports of the ItemCapture component.

**Estimated Time:** 15 minutes

**Dependencies:** Task 3.2.10 complete

**Implementation Steps:**

1. Open `src/components/ItemCapture/index.ts`

2. Add the FileUploadStep export:
   ```typescript
   // Components - Steps
   export { FileUploadStep } from './components/steps/FileUploadStep';
   ```

3. Verify the export works correctly

**Verification Steps:**

- [ ] Can import `FileUploadStep` from `@/components/ItemCapture`
- [ ] No circular dependency warnings
- [ ] TypeScript autocomplete works for the import
- [ ] `npm run build` passes

---

### Task 3.2.12: Manual Testing - Basic Upload Flow

**Objective:** Verify the basic file upload flow works correctly.

**Estimated Time:** 30 minutes

**Dependencies:** Tasks 3.2.1-3.2.11 complete

**Test Cases:**

1. **Click to Upload:**
   - [ ] Click drop zone opens file picker
   - [ ] Select a single image file → file appears in grid
   - [ ] Select multiple files → all valid files appear in grid
   - [ ] File card shows correct thumbnail (images), icon (videos, PDFs)
   - [ ] File card shows correct name and size

2. **File Type Filtering:**
   - [ ] File picker shows "accept" filter for allowed types
   - [ ] Invalid file types are rejected with clear error message
   - [ ] Error message lists allowed file types

3. **File Size Limits:**
   - [ ] Files exceeding per-file limit are rejected
   - [ ] Error shows file size and limit
   - [ ] Files exceeding total size limit are rejected
   - [ ] Progress bar updates to reflect size

4. **Max Files Limit:**
   - [ ] Can add up to max files (e.g., 10)
   - [ ] Attempting to add more shows error
   - [ ] After removing a file, can add another

5. **Remove File:**
   - [ ] Click remove button removes file
   - [ ] File count updates
   - [ ] Total size updates
   - [ ] Grid reflows correctly

**Verification Steps:**

- [ ] All test cases pass
- [ ] Document any issues found

---

### Task 3.2.13: Manual Testing - Drag and Drop Flow

**Objective:** Verify drag-and-drop functionality works correctly.

**Estimated Time:** 30 minutes

**Dependencies:** Tasks 3.2.1-3.2.11 complete

**Test Cases:**

1. **Basic Drag-Drop:**
   - [ ] Drag file over drop zone → zone changes to active state (blue)
   - [ ] Drop file → file is added to grid
   - [ ] Zone returns to normal state after drop

2. **Visual Feedback:**
   - [ ] Valid files show blue border during drag
   - [ ] Invalid files show red border during drag
   - [ ] "Drop files here" text appears for valid files
   - [ ] "Invalid file type" text appears for invalid files

3. **Nested Elements:**
   - [ ] Dragging over child elements doesn't flicker state
   - [ ] State remains active when moving over text inside zone
   - [ ] Only becomes inactive when leaving zone entirely

4. **Multiple Files:**
   - [ ] Can drop multiple files at once
   - [ ] Valid files are added, invalid files are rejected
   - [ ] Mixed batch shows rejection warning for invalid ones

5. **Browser Compatibility:**
   - [ ] Chrome: All features work
   - [ ] Firefox: All features work
   - [ ] Safari: All features work (note: touch drag may not work)
   - [ ] Edge: All features work

**Verification Steps:**

- [ ] All test cases pass on target browsers
- [ ] Document iOS/mobile limitations (drag-drop typically not supported)

---

### Task 3.2.14: Manual Testing - State Machine Integration

**Objective:** Verify FileUploadStep correctly integrates with the ItemCapture state machine.

**Estimated Time:** 30 minutes

**Dependencies:** Tasks 3.2.1-3.2.11 complete

**Test Cases:**

1. **ADD_MEDIA Dispatch:**
   - [ ] Adding file dispatches ADD_MEDIA action
   - [ ] MediaItem has correct id, type, file, metadata
   - [ ] metadata.source is 'upload'
   - [ ] metadata.mimeType is correct
   - [ ] metadata.originalFilename is correct

2. **REMOVE_MEDIA Dispatch:**
   - [ ] Removing file dispatches REMOVE_MEDIA action
   - [ ] Correct file ID is passed in payload
   - [ ] State machine removes the media item

3. **State Persistence:**
   - [ ] Navigate away from FileUploadStep
   - [ ] Navigate back to FileUploadStep
   - [ ] Files still appear in grid (if state persists)

4. **Review Step Integration:**
   - [ ] Navigate to review step
   - [ ] Uploaded files appear in review
   - [ ] Files have correct thumbnails/icons

**Verification Steps:**

- [ ] All state machine integrations work correctly
- [ ] No duplicate dispatches
- [ ] State remains consistent across navigation

---

### Task 3.2.15: Manual Testing - Accessibility

**Objective:** Verify the component meets accessibility requirements.

**Estimated Time:** 30 minutes

**Dependencies:** Tasks 3.2.1-3.2.11 complete

**Test Cases:**

1. **Keyboard Navigation:**
   - [ ] Tab focuses drop zone
   - [ ] Enter/Space opens file picker
   - [ ] Tab focuses remove buttons on file cards
   - [ ] Enter/Space on remove button removes file
   - [ ] Tab focuses dismiss buttons on errors

2. **Screen Reader Testing:**
   - [ ] Drop zone announces label
   - [ ] Errors are announced when they appear
   - [ ] File count/progress can be read
   - [ ] Remove button labels include filename

3. **Focus Indicators:**
   - [ ] Drop zone has visible focus ring
   - [ ] Remove buttons have visible focus ring
   - [ ] Dismiss buttons have visible focus ring

4. **Color Contrast:**
   - [ ] Text is readable on all backgrounds
   - [ ] Error/warning colors meet contrast requirements
   - [ ] Focus rings are visible

**Verification Steps:**

- [ ] Can complete all actions using keyboard only
- [ ] VoiceOver (macOS) or NVDA (Windows) works correctly
- [ ] No accessibility violations in browser dev tools audit

---

## Task Summary

| Task | Description | Est. Time | Status |
|------|-------------|-----------|--------|
| 3.2.1 | Create component file with props interface | 30 min | Pending |
| 3.2.2 | Implement useFileUpload hook integration | 45 min | Pending |
| 3.2.3 | Implement DropZone with visual states | 45 min | Pending |
| 3.2.4 | Create FileCard subcomponent | 45 min | Pending |
| 3.2.5 | Implement FileList grid layout | 30 min | Pending |
| 3.2.6 | Implement ErrorDisplay component | 45 min | Pending |
| 3.2.7 | Implement UploadProgress indicator | 30 min | Pending |
| 3.2.8 | Add accessibility features | 30 min | Pending |
| 3.2.9 | Add responsive design adjustments | 30 min | Pending |
| 3.2.10 | Integrate with CaptureWizard | 30 min | Pending |
| 3.2.11 | Export from index | 15 min | Pending |
| 3.2.12 | Manual testing - basic upload | 30 min | Pending |
| 3.2.13 | Manual testing - drag and drop | 30 min | Pending |
| 3.2.14 | Manual testing - state machine | 30 min | Pending |
| 3.2.15 | Manual testing - accessibility | 30 min | Pending |

**Total Estimated Time:** ~7.5 hours

---

## Acceptance Criteria Mapping

| Acceptance Criteria | Implementing Task(s) |
|--------------------|----------------------|
| Upload area responds to click events | 3.2.2, 3.2.3 |
| Drop zone visually changes when files dragged over | 3.2.3 |
| Each uploaded file displays appropriate icon | 3.2.4 |
| Progress indicator appears and updates | 3.2.7 |
| Error messages for invalid file types | 3.2.6 |
| Successfully uploaded files display as thumbnails | 3.2.4, 3.2.5 |
| Users can proceed to next wizard step | 3.2.10 |
| Clear feedback if proceeding without files | 3.2.6 (via state machine validation) |

---

## Definition of Done

- [ ] All 15 tasks completed and verified
- [ ] No TypeScript errors (`npm run build` passes)
- [ ] Component can be imported from `@/components/ItemCapture`
- [ ] All acceptance criteria met
- [ ] Works on Chrome, Firefox, Safari, Edge
- [ ] Keyboard navigation works for all actions
- [ ] Screen reader compatibility verified
- [ ] Touch targets meet 48px minimum
- [ ] Responsive design works on mobile and desktop
- [ ] Integration with useFileUpload hook complete
- [ ] Integration with state machine complete
- [ ] Integration with CaptureWizard complete

---

## Integration Notes

This component integrates with:

- **Task 3.1 - useFileUpload hook:** Provides all file handling logic
- **Task 3.3 - PDF Thumbnail:** Will enhance PDF previews (future)
- **State Machine:** Dispatches ADD_MEDIA and REMOVE_MEDIA actions
- **CaptureWizard:** Renders as the 'upload-file' step

The component follows the same patterns established in:
- PhotoCaptureStep (Task 2.4)
- VideoCaptureStep (Task 2.3)

---

## References

- [Overview Document](/docs/REQ-042-implement-fileuploadstep-overview.md)
- [Implementation Plan](/docs/prd/item-capture-implementation-plan.md)
- [useFileUpload Hook Overview](/docs/REQ-041-create-usefileupload-hook-overview.md)
- [PhotoCaptureStep Overview](/docs/REQ-039-implement-photocapturestep-overview.md) - Sibling step pattern
- [Drag and Drop API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API)
- [Lucide Icons](https://lucide.dev/icons/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
