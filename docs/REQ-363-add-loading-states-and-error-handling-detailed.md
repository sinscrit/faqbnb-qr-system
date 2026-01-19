# REQ-363: Add Loading States and Error Handling - Detailed Task Breakdown

**Last Modified:** 2026-01-19 21:45 UTC
**Request ID:** REQ-363
**Type:** ENHANCEMENT
**Size:** M (Medium)
**Phase:** 7 - Integration & Polish
**Task ID:** 7.3
**Epic:** L10N Epic 5 - Owner Translation Management
**Overview Document:** `/docs/REQ-363-add-loading-states-and-error-handling-overview.md`
**Implementation Plan Reference:** `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`

---

## Document Purpose

This document breaks down REQ-363 into granular, actionable implementation tasks. Each task is designed to be approximately 1 story point and can be completed independently. Tasks follow the established patterns from existing codebase components.

---

## Prerequisites

Before starting implementation, verify the following dependencies exist:

| Dependency | Location | Verification Command |
|------------|----------|----------------------|
| Translation service types | `/src/lib/translation-service/translation-service.types.ts` | `cat src/lib/translation-service/translation-service.types.ts` |
| Job queue types | `/src/lib/job-queue/translation-jobs.types.ts` | `cat src/lib/job-queue/translation-jobs.types.ts` |
| TranslationManagement folder | `/src/components/TranslationManagement/` | `ls src/components/TranslationManagement/` |
| Lucide React icons | `package.json` | `grep lucide package.json` |
| Tailwind CSS utilities | `/src/lib/utils.ts` | `cat src/lib/utils.ts | grep "cn"` |

---

## Task Breakdown

### Phase A: Shared Utilities (Foundation)

#### Task A.1: Create Error Classification Types and Constants

**File:** `/src/components/TranslationManagement/utils/loading-error.ts`
**Type:** New File
**Estimated Effort:** 1 SP

**Description:**
Create TypeScript types and constants for standardized error classification across all translation components.

**Implementation Steps:**

1. Create the file at the specified path
2. Define `TranslationErrorType` union type with values: `'network' | 'server' | 'validation' | 'authorization' | 'timeout' | 'rate_limit' | 'conflict' | 'partial' | 'unknown'`
3. Define `TranslationError` interface:
   ```typescript
   interface TranslationError {
     type: TranslationErrorType;
     message: string;
     technicalMessage?: string;
     retryable: boolean;
     guidance: string;
   }
   ```
4. Create `ERROR_MESSAGES` constant mapping each error type to its default `TranslationError` object
5. Export all types and constants

**Error Messages to Include:**

| Type | Message | Retryable | Guidance |
|------|---------|-----------|----------|
| network | "Unable to connect. Please check your internet connection." | true | "Check your connection and try again." |
| server | "Something went wrong on our end." | true | "Wait a moment and try again." |
| validation | "Invalid input provided." | false | "Check your input and try again." |
| authorization | "You don't have permission for this action." | false | "Contact your account administrator." |
| timeout | "The request took too long." | true | "The server may be busy. Please try again." |
| rate_limit | "Too many requests. Please slow down." | true | "Wait a minute before trying again." |
| conflict | "This content was modified by someone else." | true | "Refresh and try again." |
| partial | "Some translations failed." | true | "Retry the failed items individually." |
| unknown | "An unexpected error occurred." | true | "Please try again or contact support." |

**Acceptance Criteria:**
- [ ] File exports `TranslationErrorType` type
- [ ] File exports `TranslationError` interface
- [ ] File exports `ERROR_MESSAGES` constant with all 9 error types
- [ ] All error messages are user-friendly (no technical jargon)
- [ ] TypeScript compiles without errors

---

#### Task A.2: Create Error Classification Utility Function

**File:** `/src/components/TranslationManagement/utils/loading-error.ts`
**Type:** Modify (append to file from Task A.1)
**Estimated Effort:** 1 SP

**Description:**
Add utility function to classify errors from API responses into the standardized error types.

**Implementation Steps:**

1. Add `classifyError(error: unknown): TranslationError` function
2. Handle these cases:
   - `error instanceof Error` with `message` containing "network" or "fetch" → network
   - HTTP status 401/403 → authorization
   - HTTP status 429 → rate_limit
   - HTTP status 408 or timeout keywords → timeout
   - HTTP status 409 → conflict
   - HTTP status 400 or validation keywords → validation
   - HTTP status 500+ → server
   - Default → unknown
3. Add `isRetryableError(error: TranslationError): boolean` helper
4. Add `getErrorMessage(type: TranslationErrorType): TranslationError` helper

**Function Signatures:**
```typescript
export function classifyError(error: unknown): TranslationError;
export function isRetryableError(error: TranslationError): boolean;
export function getErrorMessage(type: TranslationErrorType): TranslationError;
```

**Acceptance Criteria:**
- [ ] `classifyError` correctly identifies network errors
- [ ] `classifyError` correctly identifies HTTP status code errors
- [ ] `classifyError` returns `unknown` type for unclassified errors
- [ ] `isRetryableError` returns correct boolean based on error type
- [ ] Functions are exported and TypeScript compiles

---

#### Task A.3: Create Loading State Types and Constants

**File:** `/src/components/TranslationManagement/utils/loading-error.ts`
**Type:** Modify (append to file from Task A.2)
**Estimated Effort:** 0.5 SP

**Description:**
Add loading state types and size constants for consistent loading indicators.

**Implementation Steps:**

1. Add `LoadingContext` type: `'button' | 'panel' | 'inline' | 'skeleton'`
2. Add `LoadingSize` type: `'sm' | 'md' | 'lg'`
3. Add `LOADING_SIZES` constant mapping sizes to dimensions:
   ```typescript
   export const LOADING_SIZES = {
     sm: 'w-4 h-4',   // 16px - inline/buttons
     md: 'w-5 h-5',   // 20px - status indicators
     lg: 'w-6 h-6',   // 24px - panel loading
   } as const;
   ```

**Acceptance Criteria:**
- [ ] `LoadingContext` type is exported
- [ ] `LoadingSize` type is exported
- [ ] `LOADING_SIZES` constant matches design system specs
- [ ] TypeScript compiles without errors

---

#### Task A.4: Create API Fetch Utility with Retry Logic

**File:** `/src/components/TranslationManagement/utils/api.ts`
**Type:** New File
**Estimated Effort:** 1.5 SP

**Description:**
Create shared API utility function with built-in retry logic for translation operations.

**Implementation Steps:**

1. Create the file at the specified path
2. Import `classifyError`, `isRetryableError` from `./loading-error`
3. Define options interface:
   ```typescript
   interface ApiCallOptions {
     maxRetries?: number;        // default: 3
     retryDelay?: number;        // default: 1000ms
     timeout?: number;           // default: 30000ms
     onRetry?: (attempt: number, error: TranslationError) => void;
   }
   ```
4. Implement `fetchWithRetry<T>` function:
   - Use `AbortController` for timeout handling
   - Implement exponential backoff: `delay * Math.pow(2, attempt)`
   - Check `Retry-After` header for rate limits
   - Skip retry for non-retryable errors
   - Return `{ data: T | null; error: TranslationError | null }`

**Reference Pattern:** Follow the retry logic in `/src/lib/translation-service/` if exists

**Acceptance Criteria:**
- [ ] Function retries up to `maxRetries` times on retryable errors
- [ ] Function uses exponential backoff between retries
- [ ] Function respects `Retry-After` header when present
- [ ] Function times out after specified duration
- [ ] Function skips retry for non-retryable errors (validation, authorization)
- [ ] Function returns typed response object
- [ ] All code is TypeScript-safe

---

#### Task A.5: Create Toast Notification Utility

**File:** `/src/components/TranslationManagement/utils/notifications.ts`
**Type:** New File
**Estimated Effort:** 0.5 SP

**Description:**
Create utility functions for showing toast notifications. If a toast library exists in the project, integrate with it; otherwise, create a simple inline notification system.

**Implementation Steps:**

1. Create the file at the specified path
2. Define `ToastOptions` interface:
   ```typescript
   interface ToastOptions {
     type: 'success' | 'error' | 'warning' | 'info';
     message: string;
     duration?: number;  // default: 5000ms for error, 3000ms for others
     action?: { label: string; onClick: () => void };
   }
   ```
3. Export `showTranslationToast(options: ToastOptions): string` function
4. Export `dismissToast(id: string): void` function
5. If project uses a toast library (sonner, react-hot-toast), integrate with it
6. If no toast library, return a no-op with console.log for now (inline errors preferred)

**Acceptance Criteria:**
- [ ] `ToastOptions` interface is exported
- [ ] `showTranslationToast` function is exported
- [ ] `dismissToast` function is exported
- [ ] Functions don't throw errors even if toast library missing
- [ ] TypeScript compiles without errors

---

### Phase B: Shared UI Components

#### Task B.1: Create TranslationLoadingSpinner Component

**File:** `/src/components/TranslationManagement/shared/TranslationLoadingSpinner.tsx`
**Type:** New File
**Estimated Effort:** 0.5 SP

**Description:**
Create a reusable loading spinner component following the pattern from `ConfirmationModal.tsx`.

**Implementation Steps:**

1. Create directory `/src/components/TranslationManagement/shared/` if not exists
2. Create the component file
3. Import `Loader2` from `lucide-react`
4. Import `cn` from `@/lib/utils`
5. Import `LOADING_SIZES` from `../utils/loading-error`
6. Define props interface:
   ```typescript
   interface TranslationLoadingSpinnerProps {
     size?: 'sm' | 'md' | 'lg';
     className?: string;
     label?: string;  // For screen readers
   }
   ```
7. Implement component with:
   - `Loader2` icon with `animate-spin` class
   - Size from `LOADING_SIZES` mapping
   - Brand color `text-[#FF385C]`
   - `aria-hidden="true"` on icon
   - Optional `<span className="sr-only">` for label

**Reference:** `/src/components/ConfirmationModal.tsx` lines 52-53

**Acceptance Criteria:**
- [ ] Component renders at all three sizes
- [ ] Component uses brand pink color (#FF385C)
- [ ] Component has smooth spin animation
- [ ] Component has proper accessibility attributes
- [ ] Component accepts className for customization

---

#### Task B.2: Create TranslationErrorBanner Component

**File:** `/src/components/TranslationManagement/shared/TranslationErrorBanner.tsx`
**Type:** New File
**Estimated Effort:** 1 SP

**Description:**
Create a reusable error banner component following the pattern from `QRGenerationProgress.tsx` ErrorBanner.

**Implementation Steps:**

1. Import icons from `lucide-react`: `AlertCircle`, `RefreshCw`, `X`
2. Import `cn` from `@/lib/utils`
3. Import `TranslationError` from `../utils/loading-error`
4. Define props interface:
   ```typescript
   interface TranslationErrorBannerProps {
     error: TranslationError;
     onRetry?: () => void;
     onDismiss?: () => void;
     className?: string;
   }
   ```
5. Implement component with:
   - Red left border (`border-l-4 border-[#FF5A5F]`)
   - Light red background (`bg-red-50`)
   - `AlertCircle` icon in red
   - Error message and guidance text
   - Retry button (if `onRetry` provided AND `error.retryable`)
   - Dismiss button (X icon) if `onDismiss` provided
   - `role="alert"` and `aria-live="polite"` for accessibility

**Reference:** `/src/components/ItemCreationWorkflow/components/shared/QRGenerationProgress.tsx` lines 261-324

**Acceptance Criteria:**
- [ ] Component displays error message and guidance
- [ ] Retry button only shows for retryable errors
- [ ] Dismiss button (X) works correctly
- [ ] Component has proper ARIA attributes
- [ ] Component matches design system colors

---

#### Task B.3: Create TranslationLoadingSkeleton Component

**File:** `/src/components/TranslationManagement/shared/TranslationLoadingSkeleton.tsx`
**Type:** New File
**Estimated Effort:** 1 SP

**Description:**
Create skeleton loading components for different translation UI contexts following the pattern from `LoadingState.tsx`.

**Implementation Steps:**

1. Import `cn` from `@/lib/utils`
2. Define props interface:
   ```typescript
   interface TranslationLoadingSkeletonProps {
     variant: 'status-item' | 'progress-bar' | 'editor' | 'widget';
     count?: number;
     className?: string;
   }
   ```
3. Create internal skeleton components for each variant:
   - `StatusItemSkeleton`: Flag + language name + status badge (mimics TranslationStatusItem)
   - `ProgressBarSkeleton`: Full-width bar with text below
   - `EditorSkeleton`: Two-column layout with textarea placeholders
   - `WidgetSkeleton`: Card with counts and mini progress bar
4. Main component renders correct skeleton based on `variant`
5. Repeat `count` times if specified
6. Use `animate-pulse` class for shimmer effect
7. Add `role="status"`, `aria-busy="true"`, and sr-only text

**Reference:** `/src/components/ItemManager/components/shared/LoadingState.tsx`

**Acceptance Criteria:**
- [ ] All four skeleton variants render correctly
- [ ] Skeletons visually match their real component counterparts
- [ ] `count` prop creates multiple skeleton instances
- [ ] Proper accessibility attributes present
- [ ] Uses `animate-pulse` for shimmer effect

---

#### Task B.4: Create Shared Components Barrel Export

**File:** `/src/components/TranslationManagement/shared/index.ts`
**Type:** New File
**Estimated Effort:** 0.25 SP

**Description:**
Create barrel export file for shared components.

**Implementation Steps:**

1. Create the file at the specified path
2. Export all shared components:
   ```typescript
   export { TranslationLoadingSpinner } from './TranslationLoadingSpinner';
   export { TranslationErrorBanner } from './TranslationErrorBanner';
   export { TranslationLoadingSkeleton } from './TranslationLoadingSkeleton';

   // Re-export types
   export type { TranslationLoadingSpinnerProps } from './TranslationLoadingSpinner';
   export type { TranslationErrorBannerProps } from './TranslationErrorBanner';
   export type { TranslationLoadingSkeletonProps } from './TranslationLoadingSkeleton';
   ```

**Acceptance Criteria:**
- [ ] All three components are exported
- [ ] All prop types are exported
- [ ] Imports work from `./shared`

---

### Phase C: Component Updates - Preview Panel

#### Task C.1: Add Loading State to TranslationPreviewPanel

**File:** `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx`
**Type:** Modify
**Estimated Effort:** 1 SP

**Description:**
Add initial loading state with skeleton display when fetching translation status.

**Implementation Steps:**

1. Import `TranslationLoadingSkeleton` from `../shared`
2. Add `isLoading` to component state or props (check existing implementation)
3. Add conditional rendering:
   ```tsx
   if (isLoading) {
     return (
       <div className={panelClassName}>
         <header>{/* Keep header visible */}</header>
         <TranslationLoadingSkeleton variant="progress-bar" />
         <TranslationLoadingSkeleton variant="status-item" count={6} />
       </div>
     );
   }
   ```
4. Ensure header/title remains visible during loading
5. Ensure skeleton heights match real content to prevent layout shift

**Acceptance Criteria:**
- [ ] Skeleton displays while `isLoading` is true
- [ ] Panel header remains visible during loading
- [ ] No layout shift when content loads
- [ ] Six status item skeletons shown (one per language)

---

#### Task C.2: Add Error State to TranslationPreviewPanel

**File:** `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx`
**Type:** Modify
**Estimated Effort:** 1 SP

**Description:**
Add error handling with banner display and retry capability when status fetch fails.

**Implementation Steps:**

1. Import `TranslationErrorBanner` from `../shared`
2. Import `classifyError` from `../utils/loading-error`
3. Add `error` state variable: `const [error, setError] = useState<TranslationError | null>(null)`
4. In fetch/load logic, wrap in try-catch and classify errors
5. Add error display rendering:
   ```tsx
   {error && (
     <TranslationErrorBanner
       error={error}
       onRetry={handleRetryFetch}
       onDismiss={() => setError(null)}
     />
   )}
   ```
6. Implement `handleRetryFetch` that clears error and refetches

**Acceptance Criteria:**
- [ ] Error banner displays when fetch fails
- [ ] Retry button triggers refetch
- [ ] Error can be dismissed
- [ ] Error state clears on successful retry

---

#### Task C.3: Add Partial Loading State to TranslationPreviewPanel

**File:** `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx`
**Type:** Modify
**Estimated Effort:** 0.5 SP

**Description:**
Add handling for individual translation operations (re-translate, edit) showing loading on specific items.

**Implementation Steps:**

1. Add `processingLanguages` state: `Set<string>` to track which languages are processing
2. Pass `isProcessing` prop to each `TranslationStatusItem`:
   ```tsx
   <TranslationStatusItem
     ...
     isProcessing={processingLanguages.has(language)}
   />
   ```
3. Update add/remove from `processingLanguages` when operations start/complete
4. Disable "Re-translate All" button while any language is processing

**Acceptance Criteria:**
- [ ] Individual items show processing state correctly
- [ ] Bulk actions disabled during individual processing
- [ ] Processing state clears on operation complete

---

#### Task C.4: Add Loading State to TranslationStatusItem

**File:** `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx`
**Type:** Modify
**Estimated Effort:** 1 SP

**Description:**
Add per-item loading and error states for translation operations.

**Implementation Steps:**

1. Add new props to interface:
   ```typescript
   interface TranslationStatusItemProps {
     // ... existing props
     isProcessing?: boolean;
     itemError?: TranslationError | null;
     onRetryItem?: () => void;
   }
   ```
2. Update status icon rendering to show spinner when `isProcessing`:
   ```tsx
   const getStatusIcon = () => {
     if (isProcessing) {
       return <Loader2 className="w-5 h-5 text-[#FF385C] animate-spin" />;
     }
     // ... existing status icon logic
   };
   ```
3. Update status text to "Translating..." when processing
4. Disable Edit and Re-translate buttons when `isProcessing`
5. Show error tooltip/indicator when `itemError` present
6. Add `onRetryItem` button for failed items

**Reference:** `/src/components/ItemCreationWorkflow/components/shared/QRGenerationProgress.tsx` ItemStatusRow

**Acceptance Criteria:**
- [ ] Spinner shows during processing
- [ ] Buttons disabled during processing
- [ ] Error state displays with retry option
- [ ] Status text updates appropriately

---

#### Task C.5: Enhance TranslationProgressBar States

**File:** `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationProgressBar.tsx`
**Type:** Modify
**Estimated Effort:** 0.5 SP

**Description:**
Add animated states and color variations to the progress bar.

**Implementation Steps:**

1. Add CSS transition class: `transition-all duration-300`
2. Add pulse animation during active processing: `isProcessing && 'animate-pulse'`
3. Add color variations based on status:
   ```typescript
   const getProgressColor = () => {
     if (stats.failed === stats.total) return 'bg-[#FF5A5F]';  // All failed - red
     if (stats.failed > 0) return 'bg-amber-500';              // Some failed - amber
     if (stats.complete === stats.total) return 'bg-[#22C55E]'; // Complete - green
     return 'bg-[#FF385C]';                                    // Normal - brand pink
   };
   ```
4. Add `role="progressbar"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
5. Add screen reader announcement on completion (optional: use `aria-live`)

**Reference:** `/src/components/ItemCreationWorkflow/components/shared/QRGenerationProgress.tsx` ProgressBar

**Acceptance Criteria:**
- [ ] Progress bar width transitions smoothly
- [ ] Color changes based on success/failure states
- [ ] Proper ARIA attributes for accessibility
- [ ] Pulse animation during active processing

---

### Phase D: Component Updates - Editor & Widget

#### Task D.1: Add Loading State to TranslationEditor

**File:** `/src/components/TranslationManagement/TranslationEditor/TranslationEditor.tsx`
**Type:** Modify
**Estimated Effort:** 1 SP

**Description:**
Add save operation loading state to the translation editor modal.

**Implementation Steps:**

1. Import `TranslationLoadingSpinner` from `../shared`
2. Add `isSaving` state: `useState<boolean>(false)`
3. Update save button to show loading state:
   ```tsx
   <button
     type="submit"
     disabled={isSaving || !isDirty}
     className="..."
   >
     {isSaving ? (
       <>
         <TranslationLoadingSpinner size="sm" />
         <span>Saving...</span>
       </>
     ) : (
       'Save'
     )}
   </button>
   ```
4. Disable all inputs (textarea, buttons) during save
5. Disable Cancel button during save
6. Set `isSaving` true on submit, false on complete/error

**Acceptance Criteria:**
- [ ] Save button shows spinner and "Saving..." text
- [ ] All inputs disabled during save
- [ ] Cancel button disabled during save
- [ ] State resets on completion or error

---

#### Task D.2: Add Error Handling to TranslationEditor

**File:** `/src/components/TranslationManagement/TranslationEditor/TranslationEditor.tsx`
**Type:** Modify
**Estimated Effort:** 1 SP

**Description:**
Add inline error display for save failures with input preservation.

**Implementation Steps:**

1. Import `classifyError`, `TranslationError` from `../utils/loading-error`
2. Add `saveError` state: `useState<TranslationError | null>(null)`
3. In save handler, catch errors and classify:
   ```typescript
   try {
     await onSave(formData);
   } catch (err) {
     setSaveError(classifyError(err));
     return; // Don't close modal, preserve input
   }
   ```
4. Display inline error below textarea:
   ```tsx
   {saveError && (
     <div className="mt-2 p-2 bg-red-50 rounded text-sm text-[#FF5A5F]">
       <p>{saveError.message}</p>
       <p className="text-xs text-[#717171] mt-1">{saveError.guidance}</p>
     </div>
   )}
   ```
5. Clear error on next input change or retry
6. Add retry button within error display if retryable

**Acceptance Criteria:**
- [ ] Error message displays inline below textarea
- [ ] User input preserved on error
- [ ] Error clears on new input
- [ ] Retry button available for retryable errors

---

#### Task D.3: Add Success Feedback to TranslationEditor

**File:** `/src/components/TranslationManagement/TranslationEditor/TranslationEditor.tsx`
**Type:** Modify
**Estimated Effort:** 0.5 SP

**Description:**
Add brief success state before closing the editor.

**Implementation Steps:**

1. Import `Check` icon from `lucide-react`
2. Add `showSuccess` state: `useState<boolean>(false)`
3. On successful save:
   ```typescript
   await onSave(formData);
   setShowSuccess(true);
   setTimeout(() => {
     onCancel(); // Close modal
   }, 800); // Brief delay to show success
   ```
4. Display success indicator:
   ```tsx
   {showSuccess && (
     <div className="flex items-center gap-2 text-[#22C55E]">
       <Check className="w-5 h-5" />
       <span>Saved</span>
     </div>
   )}
   ```
5. Replace/hide Save button with success state

**Acceptance Criteria:**
- [ ] Success message briefly shows after save
- [ ] Modal closes automatically after success display
- [ ] Success uses green color (#22C55E)

---

#### Task D.4: Add Loading State to TranslationStatusWidget

**File:** `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.tsx`
**Type:** Modify
**Estimated Effort:** 0.5 SP

**Description:**
Add loading skeleton to the dashboard status widget.

**Implementation Steps:**

1. Import `TranslationLoadingSkeleton` from `../shared`
2. Check if widget has `isLoading` prop/state, add if not
3. Add conditional skeleton rendering:
   ```tsx
   if (isLoading) {
     return (
       <div className={widgetClassName}>
         <TranslationLoadingSkeleton variant="widget" />
       </div>
     );
   }
   ```
4. Ensure widget container maintains fixed dimensions

**Acceptance Criteria:**
- [ ] Skeleton displays while loading
- [ ] No layout shift when data loads
- [ ] Widget container size stays consistent

---

#### Task D.5: Add Error State to TranslationStatusWidget

**File:** `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.tsx`
**Type:** Modify
**Estimated Effort:** 0.5 SP

**Description:**
Add compact error display with retry link to the widget.

**Implementation Steps:**

1. Import `AlertCircle` from `lucide-react`
2. Add `error` state if not present
3. Add compact error display:
   ```tsx
   {error && (
     <div className="flex items-center gap-2 text-sm text-[#FF5A5F]">
       <AlertCircle className="w-4 h-4" />
       <span>Unable to load</span>
       <button onClick={refetch} className="underline">Retry</button>
     </div>
   )}
   ```
4. Keep widget visually consistent (compact error, not full banner)

**Acceptance Criteria:**
- [ ] Compact error message displays
- [ ] Retry link triggers refetch
- [ ] Error doesn't break widget layout

---

#### Task D.6: Add Refresh Indicator to TranslationStatusWidget

**File:** `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.tsx`
**Type:** Modify
**Estimated Effort:** 0.5 SP

**Description:**
Add subtle refresh indicator and last updated timestamp.

**Implementation Steps:**

1. Import `RefreshCw` from `lucide-react`
2. Add `isRefreshing` state for background refresh
3. Add `lastUpdated` state: `useState<Date | null>(null)`
4. Show small spinner during refresh:
   ```tsx
   {isRefreshing && (
     <RefreshCw className="w-3 h-3 text-[#717171] animate-spin" />
   )}
   ```
5. Display last updated time:
   ```tsx
   <span className="text-xs text-[#717171]">
     Updated {formatRelativeTime(lastUpdated)}
   </span>
   ```

**Acceptance Criteria:**
- [ ] Refresh spinner shows during background update
- [ ] Last updated timestamp displays
- [ ] Timestamp updates after each refresh

---

### Phase E: Component Updates - Bulk Operations

#### Task E.1: Add Progress State to BulkTranslationBar

**File:** `/src/components/TranslationManagement/BulkTranslationBar/BulkTranslationBar.tsx`
**Type:** Modify
**Estimated Effort:** 1 SP

**Description:**
Add progress indicator for bulk translation operations.

**Implementation Steps:**

1. Add `operationProgress` state:
   ```typescript
   interface BulkOperationProgress {
     isProcessing: boolean;
     total: number;
     completed: number;
     failed: number;
   }
   ```
2. Add progress bar during operation:
   ```tsx
   {progress.isProcessing && (
     <div className="flex items-center gap-3">
       <div className="flex-1 h-2 bg-gray-200 rounded-full">
         <div
           className="h-full bg-[#FF385C] rounded-full transition-all"
           style={{ width: `${(progress.completed / progress.total) * 100}%` }}
         />
       </div>
       <span className="text-sm text-[#717171]">
         Processing {progress.completed} of {progress.total}...
       </span>
     </div>
   )}
   ```
3. Add Cancel button during operation
4. Update parent handler to track progress

**Acceptance Criteria:**
- [ ] Progress bar shows during bulk operation
- [ ] Count updates as items complete
- [ ] Cancel button available during processing

---

#### Task E.2: Add Error Handling to BulkTranslationBar

**File:** `/src/components/TranslationManagement/BulkTranslationBar/BulkTranslationBar.tsx`
**Type:** Modify
**Estimated Effort:** 1 SP

**Description:**
Add error display for partial failures in bulk operations.

**Implementation Steps:**

1. Track failed items: `failedItems: string[]`
2. Display failure summary after operation:
   ```tsx
   {!progress.isProcessing && progress.failed > 0 && (
     <div className="flex items-center gap-3 p-2 bg-amber-50 rounded">
       <AlertCircle className="w-4 h-4 text-amber-500" />
       <span>{progress.failed} item(s) failed</span>
       <button onClick={handleRetryFailed} className="text-[#FF385C]">
         Retry Failed
       </button>
       <button onClick={handleSkipContinue} className="text-[#717171]">
         Skip & Continue
       </button>
     </div>
   )}
   ```
3. Implement `handleRetryFailed` to retry only failed items
4. Implement `handleSkipContinue` to clear failed state

**Acceptance Criteria:**
- [ ] Failed count displays after partial failure
- [ ] "Retry Failed" button re-processes failed items only
- [ ] "Skip & Continue" clears the error state

---

#### Task E.3: Add Success State to BulkTranslationBar

**File:** `/src/components/TranslationManagement/BulkTranslationBar/BulkTranslationBar.tsx`
**Type:** Modify
**Estimated Effort:** 0.5 SP

**Description:**
Add brief success message that auto-dismisses.

**Implementation Steps:**

1. Add `showSuccess` state
2. On all items complete successfully:
   ```typescript
   if (progress.failed === 0 && progress.completed === progress.total) {
     setShowSuccess(true);
     setTimeout(() => {
       setShowSuccess(false);
       resetProgress();
     }, 3000);
   }
   ```
3. Display success message:
   ```tsx
   {showSuccess && (
     <div className="flex items-center gap-2 text-[#22C55E]">
       <Check className="w-4 h-4" />
       <span>{progress.total} translations queued successfully</span>
     </div>
   )}
   ```

**Acceptance Criteria:**
- [ ] Success message shows after all complete
- [ ] Message auto-dismisses after 3 seconds
- [ ] Progress resets after dismiss

---

### Phase F: Hook Updates

#### Task F.1: Enhance useTranslationStatus Hook

**File:** `/src/hooks/useTranslationStatus.ts`
**Type:** Modify
**Estimated Effort:** 1 SP

**Description:**
Add enhanced return values for loading, refreshing, and error states.

**Implementation Steps:**

1. Import `TranslationError`, `classifyError` from components utils
2. Update return interface:
   ```typescript
   interface UseTranslationStatusReturn {
     data: TranslationStatusResponse | null;
     isLoading: boolean;       // Initial load
     isRefreshing: boolean;    // Background refresh
     error: TranslationError | null;
     refetch: () => Promise<void>;
     retry: () => Promise<void>;  // Clears error first
   }
   ```
3. Track separate `isLoading` vs `isRefreshing` states
4. Implement `retry` that clears error then calls refetch
5. Classify errors in catch blocks

**Acceptance Criteria:**
- [ ] `isLoading` only true on initial load
- [ ] `isRefreshing` true on subsequent fetches
- [ ] `error` contains classified error info
- [ ] `retry` clears error before refetching

---

#### Task F.2: Enhance useTranslationRealtime Hook

**File:** `/src/hooks/useTranslationRealtime.ts`
**Type:** Modify
**Estimated Effort:** 1 SP

**Description:**
Add connection state tracking and reconnection handling.

**Implementation Steps:**

1. Import `TranslationError`, `classifyError` from components utils
2. Update return interface:
   ```typescript
   interface UseTranslationRealtimeReturn {
     isConnected: boolean;
     isReconnecting: boolean;
     connectionError: TranslationError | null;
     lastUpdate: string | null;  // ISO timestamp
     reconnect: () => void;
   }
   ```
3. Track Supabase channel connection state
4. Implement `reconnect` to unsubscribe and resubscribe
5. Update `lastUpdate` timestamp on each received update
6. Handle connection errors (network, auth)

**Acceptance Criteria:**
- [ ] `isConnected` accurately reflects channel state
- [ ] `isReconnecting` shows during reconnection attempt
- [ ] `connectionError` set on connection failure
- [ ] `reconnect` successfully re-establishes connection
- [ ] `lastUpdate` updates on each received message

---

### Phase G: Barrel Exports & Integration

#### Task G.1: Update TranslationManagement Barrel Export

**File:** `/src/components/TranslationManagement/index.ts`
**Type:** Modify
**Estimated Effort:** 0.25 SP

**Description:**
Add new utilities and shared components to barrel export.

**Implementation Steps:**

1. Add utility exports:
   ```typescript
   // Utilities
   export * from './utils/loading-error';
   export * from './utils/api';
   export * from './utils/notifications';
   ```
2. Add shared component exports:
   ```typescript
   // Shared components
   export * from './shared';
   ```
3. Verify all existing exports still work

**Acceptance Criteria:**
- [ ] New utilities importable from main barrel
- [ ] Shared components importable from main barrel
- [ ] No breaking changes to existing exports

---

#### Task G.2: Create Utils Barrel Export

**File:** `/src/components/TranslationManagement/utils/index.ts`
**Type:** New File
**Estimated Effort:** 0.25 SP

**Description:**
Create barrel export for utility modules.

**Implementation Steps:**

1. Create the file at the specified path
2. Export all utilities:
   ```typescript
   export * from './loading-error';
   export * from './api';
   export * from './notifications';
   ```

**Acceptance Criteria:**
- [ ] All utilities accessible via `./utils`
- [ ] No circular dependency issues

---

## Testing Checklist

### Unit Tests (to be written)

| Component/Utility | Test Cases |
|-------------------|------------|
| `classifyError` | Classifies network errors, HTTP status codes, unknown errors |
| `isRetryableError` | Returns correct boolean for each error type |
| `fetchWithRetry` | Retries on retryable errors, stops on non-retryable, respects max |
| `TranslationLoadingSpinner` | Renders at all sizes, has correct ARIA |
| `TranslationErrorBanner` | Shows message, guidance, retry button when applicable |
| `TranslationLoadingSkeleton` | Renders all variants correctly |

### Integration Tests

| Scenario | Expected Behavior |
|----------|-------------------|
| Panel load failure | Error banner shows, retry refetches |
| Editor save failure | Inline error, input preserved, retry works |
| Bulk operation partial failure | Shows count, retry failed works |
| Realtime disconnect | Shows reconnecting, auto-reconnects |

### Manual Testing Checklist

- [ ] Disconnect network during panel load → error banner appears
- [ ] Save translation with simulated 500 error → error message, input preserved
- [ ] Bulk translate 10 items with 2 failures → "2 failed" message, retry button
- [ ] Rapid button clicks → only one operation executes
- [ ] Tab away and back → data refreshes without errors
- [ ] Slow network (throttle in DevTools) → loading states visible

---

## File Summary

### New Files to Create

| File Path | Task |
|-----------|------|
| `/src/components/TranslationManagement/utils/loading-error.ts` | A.1, A.2, A.3 |
| `/src/components/TranslationManagement/utils/api.ts` | A.4 |
| `/src/components/TranslationManagement/utils/notifications.ts` | A.5 |
| `/src/components/TranslationManagement/utils/index.ts` | G.2 |
| `/src/components/TranslationManagement/shared/TranslationLoadingSpinner.tsx` | B.1 |
| `/src/components/TranslationManagement/shared/TranslationErrorBanner.tsx` | B.2 |
| `/src/components/TranslationManagement/shared/TranslationLoadingSkeleton.tsx` | B.3 |
| `/src/components/TranslationManagement/shared/index.ts` | B.4 |

### Files to Modify

| File Path | Tasks |
|-----------|-------|
| `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx` | C.1, C.2, C.3 |
| `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx` | C.4 |
| `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationProgressBar.tsx` | C.5 |
| `/src/components/TranslationManagement/TranslationEditor/TranslationEditor.tsx` | D.1, D.2, D.3 |
| `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.tsx` | D.4, D.5, D.6 |
| `/src/components/TranslationManagement/BulkTranslationBar/BulkTranslationBar.tsx` | E.1, E.2, E.3 |
| `/src/components/TranslationManagement/index.ts` | G.1 |
| `/src/hooks/useTranslationStatus.ts` | F.1 |
| `/src/hooks/useTranslationRealtime.ts` | F.2 |

---

## Implementation Order

**Recommended sequence for implementation:**

1. **Phase A** (Foundation utilities) - Must complete first as other phases depend on these
2. **Phase B** (Shared UI components) - Can start after A.1-A.3 complete
3. **Phase F** (Hook updates) - Can run in parallel with Phase B
4. **Phase C** (Preview Panel) - Requires Phase A + B complete
5. **Phase D** (Editor & Widget) - Requires Phase A + B complete
6. **Phase E** (Bulk Operations) - Requires Phase A + B complete
7. **Phase G** (Barrel exports) - Complete last after all components done

**Parallelization opportunities:**
- Tasks within each phase can often run in parallel
- Phases C, D, E can run in parallel once A and B are complete
- Hook updates (Phase F) can run in parallel with B, C, D, E

---

## Acceptance Criteria Summary

From REQ-363 Requirements:

- [x] All components with async operations display loading spinners during data fetching
- [x] Loading indicators appear within or adjacent to the specific affected component area
- [x] Action buttons show loading spinners within the button and become disabled during operation
- [x] Failed API operations trigger clear, user-friendly error messages
- [x] Error messages distinguish between: network, server, validation, authorization errors
- [x] Every error notification includes a retry button for retryable errors
- [x] Retry actions preserve user input and context
- [x] Components prevent duplicate submissions by disabling during operations
- [x] Batch operations provide detailed feedback about successes and failures
- [x] Loading states do not cause layout shifts or visual jumps
- [x] Error handling covers timeout errors, rate limiting, and concurrent conflicts
- [x] Components recover gracefully from errors without page refresh
- [x] Error messages provide specific, actionable guidance
- [x] Patterns are consistent across all translation-related components

---

## References

- Overview Document: `/docs/REQ-363-add-loading-states-and-error-handling-overview.md`
- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md` (Task 7.3)
- Requirements: `/docs/gen_requests_epic5.md` (REQ-363)
- Existing Loading Pattern: `/src/components/ItemManager/components/shared/LoadingState.tsx`
- Existing Progress Pattern: `/src/components/ItemCreationWorkflow/components/shared/QRGenerationProgress.tsx`
- Existing Modal Pattern: `/src/components/ConfirmationModal.tsx`

---

*Detailed task breakdown generated for REQ-363 - Add Loading States and Error Handling*
