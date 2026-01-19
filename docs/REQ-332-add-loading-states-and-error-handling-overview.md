# REQ-332: Implement Loading States and Error Handling for Translation Components

**Date Created:** 2026-01-18
**Last Modified:** 2026-01-18
**Type:** ENHANCEMENT
**Size:** L (Large)
**Phase:** 7 - Integration & Polish
**Task ID:** 7.3
**Status:** Planning

---

## Overview

This document provides a technical implementation breakdown for adding comprehensive loading states, error handling, and retry mechanisms to all translation management components. This enhancement ensures users receive appropriate visual feedback during asynchronous operations and can gracefully recover from API failures.

### Related Documents
- **PRD Reference:** `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- **Epic Request File:** `/docs/gen_requests_epic5.md` (REQ-332)
- **Epic 1 Dependencies:** Translation tables, Translation service, Job queue

### Prerequisites
- REQ-304 through REQ-331 (Translation Management components) must be implemented or stubbed
- TranslationPreviewPanel, TranslationStatusWidget, TranslationEditor, LanguagePreferenceSection, BulkTranslationBar, and Translation Management page components exist

---

## Current State Analysis

### Identified Components Requiring Enhancement

Based on the implementation plan, the following components require loading states and error handling:

| Component | Location | Current State |
|-----------|----------|---------------|
| TranslationPreviewPanel | `/src/components/TranslationManagement/TranslationPreviewPanel/` | Needs loading spinner |
| TranslationStatusWidget | `/src/components/TranslationManagement/TranslationStatusWidget/` | Needs skeleton loading |
| TranslationEditor | `/src/components/TranslationManagement/TranslationEditor/` | Needs save loading state |
| TranslationProgressBar | `/src/components/TranslationManagement/TranslationPreviewPanel/` | Needs animated processing state |
| LanguagePreferenceSection | `/src/components/TranslationManagement/LanguagePreference/` | Needs save button loading |
| BulkTranslationBar | `/src/components/TranslationManagement/BulkTranslationBar/` | Needs progress indicator |
| Translation Management Page | `/src/app/dashboard2/translations/page.tsx` | Needs full-page loading |

### Existing Patterns to Follow

The codebase has established patterns for loading and error handling:

1. **LoadingIndicator Component** (`/src/components/SimpleDashboard/LoadingIndicator.tsx`)
   - Unified spinner with size variants (sm/md/lg)
   - Color presets: brand (#FF385C), white, muted
   - ARIA-compliant with `role="status"` and `aria-label`

2. **LoadingState Component** (`/src/components/ItemManager/components/shared/LoadingState.tsx`)
   - Skeleton animations using `animate-pulse`
   - Grid and list view support
   - Screen reader text with `sr-only` class

3. **NetworkErrorIndicator Component** (`/src/components/ItemCreationWorkflow/components/shared/NetworkErrorIndicator.tsx`)
   - Error alert with retry and proceed options
   - Amber color scheme for warnings
   - `isRetrying` state with animated spinner

4. **Error Utilities** (`/src/lib/error-utils.ts`)
   - `translateErrorMessage()` for user-friendly messages
   - `classifyError()` for error type/severity classification
   - `getErrorDisplayDuration()` for auto-dismiss timing

5. **Success/Error Banner Pattern** (`/src/app/dashboard2/page.tsx`)
   - Success: Green (#00A699) with auto-dismiss after 3 seconds
   - Error: Red (#FF385C) with `role="alert"`
   - Animation: `animate-in fade-in slide-in-from-top-2`

---

## Implementation Tasks

### Task 1: Create Shared Error Toast/Notification Component

**New File:** `/src/components/TranslationManagement/shared/TranslationToast.tsx`

Create a reusable toast notification component for translation operations:

```typescript
// Types to implement
interface TranslationToastProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onDismiss: () => void;
  onRetry?: () => void;
  autoDismissMs?: number; // 0 = no auto-dismiss
}
```

**Patterns to follow:**
- Use existing success message pattern from `/src/app/dashboard2/page.tsx`
- Apply `role="alert"` for errors, `role="status"` for success
- Include retry button for failed operations
- Auto-dismiss non-critical errors after configured duration

---

### Task 2: TranslationPreviewPanel Loading State

**File to Modify:** `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx`

**Changes:**
1. Add loading spinner while fetching translation status data
2. Display skeleton placeholders for translation status items
3. Show error state with retry button if fetch fails

**Implementation Details:**
```typescript
// State additions
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

// Loading state UI
{isLoading ? (
  <div className="space-y-3 animate-pulse">
    {/* Skeleton for source content */}
    <div className="h-20 bg-gray-200 rounded-lg" />
    {/* Skeleton for 6 language rows */}
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="h-16 bg-gray-200 rounded-lg" />
    ))}
  </div>
) : error ? (
  <TranslationErrorState
    message={error}
    onRetry={handleRefetch}
  />
) : (
  // Normal content
)}
```

---

### Task 3: TranslationStatusWidget Dashboard Skeleton

**File to Modify:** `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.tsx`

**Changes:**
1. Implement skeleton loading matching dashboard card structure
2. Add error state with compact retry option
3. Handle empty state gracefully

**Implementation Details:**
```typescript
// Skeleton structure matching widget layout
function TranslationStatusWidgetSkeleton() {
  return (
    <div role="status" aria-busy="true" className="animate-pulse">
      <span className="sr-only">Loading translation status...</span>
      {/* Progress bar skeleton */}
      <div className="h-4 bg-gray-200 rounded-full w-full mb-4" />
      {/* Status counts skeleton - 4 items */}
      <div className="grid grid-cols-2 gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-12 bg-gray-200 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
```

---

### Task 4: TranslationEditor Save Loading State

**File to Modify:** `/src/components/TranslationManagement/TranslationEditor/TranslationEditor.tsx`

**Changes:**
1. Add loading state to Save button during API call
2. Disable form inputs while saving
3. Show error message if save fails with retry option
4. Display success feedback before closing

**Implementation Details:**
```typescript
// Save button with loading state
<button
  type="submit"
  disabled={isSaving || !isDirty}
  className={cn(
    'px-4 py-2 rounded-lg font-medium',
    isSaving
      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
      : 'bg-[#FF385C] text-white hover:bg-[#E31C5F]'
  )}
>
  {isSaving ? (
    <span className="inline-flex items-center gap-2">
      <LoadingIndicator size="sm" color="muted" />
      Saving...
    </span>
  ) : (
    'Save Translation'
  )}
</button>

// Error display after failed save
{saveError && (
  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg" role="alert">
    <p className="text-sm text-[#FF385C]">{saveError}</p>
    <button onClick={handleRetry} className="text-sm text-[#FF385C] underline mt-1">
      Try again
    </button>
  </div>
)}
```

---

### Task 5: TranslationProgressBar Animated States

**File to Modify:** `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationProgressBar.tsx`

**Changes:**
1. Add animated gradient/pulse when translations are processing
2. Ensure smooth transitions between states
3. Add appropriate ARIA labels for progress updates

**Implementation Details:**
```typescript
// Processing animation class
const progressBarClasses = cn(
  'h-2 rounded-full transition-all duration-300',
  isProcessing
    ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 animate-[shimmer_2s_ease-in-out_infinite]'
    : 'bg-green-500'
);

// ARIA for progress
<div
  role="progressbar"
  aria-valuenow={completedCount}
  aria-valuemin={0}
  aria-valuemax={totalCount}
  aria-label={`${completedCount} of ${totalCount} translations complete${isProcessing ? ', processing' : ''}`}
>
```

---

### Task 6: LanguagePreferenceSection Loading State

**File to Modify:** `/src/components/TranslationManagement/LanguagePreference/LanguagePreferenceSection.tsx`

**Changes:**
1. Add loading state on save button (like AddPropertyModal pattern)
2. Show success confirmation after save
3. Handle save errors with retry option

**Implementation Details:**
```typescript
// Button states
<button
  onClick={handleSave}
  disabled={isSaving || !hasChanged}
  className={cn(
    'px-4 py-2 rounded-lg font-medium transition-colors',
    isSaving && 'cursor-not-allowed opacity-70'
  )}
>
  {isSaving ? (
    <span className="inline-flex items-center gap-2">
      <LoadingIndicator size="sm" />
      Saving...
    </span>
  ) : (
    'Save Preference'
  )}
</button>

// Success message (auto-dismiss after 3s)
{successMessage && (
  <div role="status" className="text-sm text-[#00A699] mt-2">
    ✓ {successMessage}
  </div>
)}
```

---

### Task 7: BulkTranslationBar Progress Indicator

**File to Modify:** `/src/components/TranslationManagement/BulkTranslationBar/BulkTranslationBar.tsx`

**Changes:**
1. Add progress indicator during bulk operations
2. Show "Processing X of Y items" format
3. Handle partial failures with success/failure counts
4. Provide retry for failed items

**Implementation Details:**
```typescript
// Progress state
interface BulkOperationProgress {
  isProcessing: boolean;
  current: number;
  total: number;
  succeeded: number;
  failed: string[]; // Array of failed item IDs
}

// Progress display
{progress.isProcessing && (
  <div className="flex items-center gap-3">
    <LoadingIndicator size="sm" />
    <span className="text-sm">
      Processing {progress.current} of {progress.total} items...
    </span>
  </div>
)}

// Completion with partial failure
{!progress.isProcessing && progress.failed.length > 0 && (
  <div className="flex items-center gap-2 text-sm">
    <span className="text-[#00A699]">
      {progress.succeeded} succeeded
    </span>
    <span className="text-[#FF385C]">
      {progress.failed.length} failed
    </span>
    <button
      onClick={() => handleRetryFailed(progress.failed)}
      className="text-[#FF385C] underline"
    >
      Retry failed
    </button>
  </div>
)}
```

---

### Task 8: Translation Management Page Loading States

**File to Modify:** `/src/app/dashboard2/translations/page.tsx`

**Changes:**
1. Full-page loading state during initial fetch
2. Loading indicator during filter changes (non-blocking)
3. Error state for failed data fetch with retry
4. Empty state when no content matches filters

**Implementation Details:**
```typescript
// Initial loading state
if (isLoading && !data) {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-6">Translation Management</h1>
      <div className="animate-pulse space-y-4">
        {/* Filter bar skeleton */}
        <div className="flex gap-4">
          <div className="h-10 w-40 bg-gray-200 rounded-lg" />
          <div className="h-10 w-40 bg-gray-200 rounded-lg" />
          <div className="h-10 w-40 bg-gray-200 rounded-lg" />
        </div>
        {/* Table skeleton */}
        <div className="space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}

// Error state
if (error) {
  return (
    <div className="p-8 text-center">
      <div className="inline-flex flex-col items-center gap-4 p-6 bg-red-50 rounded-lg">
        <AlertCircle className="w-12 h-12 text-[#FF385C]" />
        <p className="text-[#FF385C]">{error}</p>
        <button
          onClick={handleRefetch}
          className="px-4 py-2 bg-[#FF385C] text-white rounded-lg"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
```

---

### Task 9: Create TranslationErrorState Shared Component

**New File:** `/src/components/TranslationManagement/shared/TranslationErrorState.tsx`

Reusable error state component for translation components:

```typescript
interface TranslationErrorStateProps {
  message: string;
  onRetry: () => void;
  isRetrying?: boolean;
  className?: string;
}

export function TranslationErrorState({
  message,
  onRetry,
  isRetrying = false,
  className,
}: TranslationErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center gap-4 p-6',
        'bg-red-50 border border-red-200 rounded-lg',
        className
      )}
    >
      <AlertCircle className="w-8 h-8 text-[#FF385C]" aria-hidden="true" />
      <p className="text-sm text-[#FF385C] text-center">{message}</p>
      <button
        onClick={onRetry}
        disabled={isRetrying}
        className={cn(
          'inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium',
          isRetrying
            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
            : 'bg-[#FF385C] text-white hover:bg-[#E31C5F]'
        )}
      >
        {isRetrying ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            Retrying...
          </>
        ) : (
          <>
            <RefreshCw className="w-4 h-4" />
            Try Again
          </>
        )}
      </button>
    </div>
  );
}
```

---

### Task 10: Update Hook Error Handling

**Files to Modify:**
- `/src/hooks/useTranslationStatus.ts`
- `/src/hooks/useTranslationRealtime.ts`

**Changes:**
1. Add proper error state handling
2. Return structured error objects
3. Provide refetch/retry functions
4. Handle network and authentication errors specifically

**Implementation Pattern:**
```typescript
// Hook return type
interface UseTranslationStatusReturn {
  data: TranslationStatusResponse | null;
  isLoading: boolean;
  isRefreshing: boolean; // Separate state for refetch
  error: TranslationError | null;
  refetch: () => Promise<void>;
}

interface TranslationError {
  type: 'network' | 'authentication' | 'validation' | 'server';
  message: string;
  retryable: boolean;
}
```

---

## Authorized Files and Functions for Modification

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/components/TranslationManagement/shared/TranslationToast.tsx` | Reusable toast notification |
| `/src/components/TranslationManagement/shared/TranslationErrorState.tsx` | Reusable error state |
| `/src/components/TranslationManagement/shared/TranslationLoadingSkeleton.tsx` | Reusable skeletons |
| `/src/components/TranslationManagement/shared/index.ts` | Shared exports |

### Files to Modify

| File Path | Modifications |
|-----------|---------------|
| `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx` | Add loading state, error handling |
| `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationProgressBar.tsx` | Add animated processing state |
| `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.tsx` | Add skeleton loading, error state |
| `/src/components/TranslationManagement/TranslationEditor/TranslationEditor.tsx` | Add save loading, error handling |
| `/src/components/TranslationManagement/LanguagePreference/LanguagePreferenceSection.tsx` | Add save loading, success feedback |
| `/src/components/TranslationManagement/BulkTranslationBar/BulkTranslationBar.tsx` | Add progress indicator, partial failure handling |
| `/src/app/dashboard2/translations/page.tsx` | Add page loading, error, empty states |
| `/src/hooks/useTranslationStatus.ts` | Add error handling, retry function |
| `/src/hooks/useTranslationRealtime.ts` | Add connection error handling |

### Functions to Add/Modify

| Component | Functions |
|-----------|-----------|
| TranslationPreviewPanel | `handleRefetch()`, skeleton rendering |
| TranslationEditor | `handleRetrySave()`, error state management |
| BulkTranslationBar | `handleRetryFailed()`, progress tracking |
| useTranslationStatus | `refetch()`, error classification |
| useTranslationRealtime | `handleConnectionError()`, `reconnect()` |

---

## UI Specifications

### Loading Indicator Colors
- **Brand (Primary):** #FF385C (Airbnb red)
- **Muted:** #717171 (gray)
- **White:** #FFFFFF (on dark backgrounds)

### Status Colors
- **Success:** #00A699 (Airbnb green)
- **Error:** #FF385C (Airbnb red)
- **Warning:** #F59E0B (amber-500)
- **Processing:** #F59E0B (amber gradient)

### Animation Classes
- **Spinner:** `animate-spin`
- **Skeleton pulse:** `animate-pulse`
- **Shimmer:** Custom keyframe for processing gradient
- **Fade in:** `animate-in fade-in slide-in-from-top-2 duration-300`

### Accessibility Requirements
- All loading states: `role="status"`, `aria-busy="true"`
- All error states: `role="alert"`, `aria-live="assertive"`
- Screen reader text: `sr-only` class for hidden labels
- Keyboard accessible retry buttons
- Focus management after error recovery

---

## Error Message Guidelines

### User-Friendly Error Messages

| Error Type | User Message |
|------------|--------------|
| Network Error | "Unable to connect. Please check your internet connection and try again." |
| Authentication Error | "Your session has expired. Please log in again to continue." |
| Validation Error | "The translation could not be saved. Please check your input and try again." |
| Server Error | "Something went wrong on our end. Please try again in a few moments." |
| Translation Failed | "Translation failed for {language}. Click retry to try again." |
| Bulk Partial Failure | "{X} items succeeded, {Y} items failed. Click retry to attempt failed items again." |

### Auto-Dismiss Timings
- **Success messages:** 3 seconds
- **Warning messages:** 5 seconds
- **Non-critical errors:** 8 seconds
- **Critical errors (auth/action required):** No auto-dismiss

---

## Testing Considerations

### Test Scenarios
1. Loading state displays correctly on initial fetch
2. Skeleton matches component structure
3. Error state shows with correct message
4. Retry button triggers refetch
5. Retry button shows loading state during retry
6. Partial failure shows correct counts
7. Failed items can be retried individually
8. Success message auto-dismisses
9. Error message persists for critical errors
10. ARIA attributes are correct for all states

### Accessibility Testing
- Screen reader announces loading states
- Screen reader announces errors
- Focus moves appropriately after error recovery
- Keyboard navigation works for retry buttons

---

## Dependencies

### Internal Dependencies
- `LoadingIndicator` from `/src/components/SimpleDashboard/LoadingIndicator.tsx`
- `cn` utility from `/src/lib/utils`
- Error utilities from `/src/lib/error-utils.ts`

### External Dependencies
- `lucide-react` for icons (Loader2, AlertCircle, RefreshCw, CheckCircle)
- `@radix-ui/react-dialog` for modals (already in use)

---

## Acceptance Criteria

- [ ] TranslationPreviewPanel displays loading spinner while fetching translation status data
- [ ] TranslationStatusWidget displays skeleton placeholders during dashboard load
- [ ] TranslationEditor modal shows loading state during save operations
- [ ] LanguagePreferenceSection shows loading state on save button during preference updates
- [ ] BulkTranslationBar displays progress indicator during bulk re-translation operations
- [ ] Translation Management page shows loading state during initial data fetch and filter changes
- [ ] All API failures trigger user-friendly error messages via toast notifications or inline alerts
- [ ] Error messages distinguish between network errors, authentication failures, validation errors, and server errors
- [ ] Error messages provide clear explanations in non-technical language
- [ ] Failed operations display retry buttons positioned adjacent to error messages
- [ ] Retry buttons re-attempt the failed operation without requiring user to re-enter data
- [ ] Components handle partial bulk operation failures by showing success and failure counts separately
- [ ] Partial failures display lists showing which items succeeded and which failed with retry options
- [ ] Loading states use accessible ARIA labels for screen readers
- [ ] Error messages are keyboard accessible and can be dismissed via keyboard
- [ ] Toast notifications auto-dismiss after appropriate timeout for non-critical errors
- [ ] Critical errors requiring user action remain visible until explicitly dismissed
- [ ] Components maintain responsive layout during loading and error states
- [ ] Loading indicators do not block user interface unnecessarily when operations can run in background
- [ ] Error handling prevents component crashes and application state corruption

---

## Implementation Order

1. Create shared components (TranslationToast, TranslationErrorState, TranslationLoadingSkeleton)
2. Update hooks (useTranslationStatus, useTranslationRealtime) with error handling
3. Add loading/error states to TranslationPreviewPanel
4. Add loading/error states to TranslationEditor
5. Add skeleton to TranslationStatusWidget
6. Add loading/success to LanguagePreferenceSection
7. Add progress/retry to BulkTranslationBar
8. Add full page states to Translation Management page
9. Add animated states to TranslationProgressBar
10. Integration testing and accessibility review

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Inconsistent error handling | Medium | Medium | Create shared error components |
| Loading state flicker | Low | Low | Add minimum display time (300ms) |
| Memory leaks from async ops | Low | Medium | Use abort controllers, cleanup on unmount |
| Retry loops | Low | High | Add retry limits, exponential backoff |
| Missing accessibility | Medium | Medium | Follow existing patterns, test with screen reader |

---

*Document generated for FAQBNB L10N Epic 5 - REQ-332*
