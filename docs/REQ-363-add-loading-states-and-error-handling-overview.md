# REQ-363: Add Loading States and Error Handling to All Translation Components

**Last Modified:** 2026-01-19 17:30 UTC
**Request ID:** REQ-363
**Type:** ENHANCEMENT
**Size:** M (Medium)
**Phase:** 7 - Integration & Polish
**Task ID:** 7.3
**Epic:** L10N Epic 5 - Owner Translation Management
**Implementation Plan Reference:** `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`

---

## Summary

All translation management components must display appropriate loading indicators during asynchronous operations and provide clear error messages with retry capabilities when operations fail. This ensures a polished, professional user experience where property owners always understand system state and can recover from failures without losing work.

---

## Dependencies

### Required from Previous Phases (Epic 1 & Epic 5)

| Dependency | Location | Status |
|------------|----------|--------|
| Translation service types | `/src/lib/translation-service/translation-service.types.ts` | Exists |
| Job queue types | `/src/lib/job-queue/translation-jobs.types.ts` | Exists |
| TranslationManagement components | `/src/components/TranslationManagement/` | Required (from Phase 2) |
| Translation status API | `/src/app/api/translations/status/route.ts` | Required (from Phase 1) |
| Update translation API | `/src/app/api/translations/[entityType]/[entityId]/[language]/route.ts` | Required (from Phase 1) |
| Re-translate API | `/src/app/api/translations/retranslate/route.ts` | Required (from Phase 1) |
| useTranslationStatus hook | `/src/hooks/useTranslationStatus.ts` | Required (from Phase 2) |
| useTranslationRealtime hook | `/src/hooks/useTranslationRealtime.ts` | Required (from Phase 2) |

### Existing Patterns to Follow

| Pattern | Location | Purpose |
|---------|----------|---------|
| Skeleton Loading | `/src/components/ItemManager/components/shared/LoadingState.tsx` | Grid/list skeleton pattern with `animate-pulse` |
| Progress with Retry | `/src/components/ItemCreationWorkflow/components/shared/QRGenerationProgress.tsx` | Progress bar, per-item status, retry buttons, error banner |
| Confirmation Modal | `/src/components/ConfirmationModal.tsx` | Modal with `Loader2` spinner in button |
| Delete Dialog | `/src/components/ItemManager/components/dialogs/ConfirmDeleteDialog.tsx` | Dialog with loading state, keyboard handling |
| Bulk Operations | `/src/components/ItemManager/components/BulkActions/BulkTagDialog.tsx` | Bulk action with loading disabled state |

---

## Existing Loading/Error Patterns Analysis

### Loading Spinner Pattern
```tsx
// From ConfirmationModal.tsx - Button with inline spinner
import { Loader2 } from 'lucide-react';

<button disabled={loading}>
  {loading ? (
    <Loader2 className="w-4 h-4 animate-spin" />
  ) : (
    confirmText
  )}
</button>
```

### Skeleton Loading Pattern
```tsx
// From LoadingState.tsx - Skeleton with accessibility
<div
  role="status"
  aria-label="Loading items"
  aria-busy="true"
  className={cn('animate-pulse', className)}
>
  <span className="sr-only">Loading items, please wait...</span>
  {/* Skeleton elements */}
</div>
```

### Error Banner Pattern
```tsx
// From QRGenerationProgress.tsx - Error with retry
<div
  role="alert"
  aria-live="polite"
  className="flex flex-col gap-3 p-3 rounded-lg bg-red-50 border-l-4 border-[#FF5A5F]"
>
  <div className="flex items-start gap-2">
    <AlertCircle className="w-5 h-5 text-[#FF5A5F]" />
    <p className="text-sm text-[#222222]">{message}</p>
  </div>
  <button onClick={onRetryAll}>
    <RefreshCw className="w-4 h-4" /> Retry Failed
  </button>
</div>
```

### Progress Indicator Pattern
```tsx
// From QRGenerationProgress.tsx - Progress bar
<div
  role="progressbar"
  aria-valuenow={progress}
  aria-valuemin={0}
  aria-valuemax={100}
>
  <div
    className="h-full rounded-full transition-all duration-300 bg-[#FF385C]"
    style={{ width: `${progress}%` }}
  />
</div>
```

---

## Technical Approach

### 1. Error Type Classification

Define standardized error types for consistent messaging:

```typescript
// Error categories for translation operations
type TranslationErrorType =
  | 'network'      // Network connectivity issues
  | 'server'       // Server errors (500s)
  | 'validation'   // Invalid input data
  | 'authorization'// Permission denied
  | 'timeout'      // Request timeout
  | 'rate_limit'   // API rate limiting
  | 'conflict'     // Concurrent edit conflict
  | 'partial'      // Batch operation partial failure
  | 'unknown';     // Unclassified errors

interface TranslationError {
  type: TranslationErrorType;
  message: string;           // User-friendly message
  technicalMessage?: string; // For logging
  retryable: boolean;
  guidance: string;          // Actionable next steps
}
```

### 2. Toast Notification Integration

Use inline error/success displays with optional toast support:

```typescript
// Error message mapping
const ERROR_MESSAGES: Record<TranslationErrorType, TranslationError> = {
  network: {
    type: 'network',
    message: 'Unable to connect. Please check your internet connection.',
    retryable: true,
    guidance: 'Check your connection and try again.'
  },
  server: {
    type: 'server',
    message: 'Something went wrong on our end.',
    retryable: true,
    guidance: 'Wait a moment and try again.'
  },
  timeout: {
    type: 'timeout',
    message: 'The request took too long.',
    retryable: true,
    guidance: 'The server may be busy. Please try again.'
  },
  rate_limit: {
    type: 'rate_limit',
    message: 'Too many requests. Please slow down.',
    retryable: true,
    guidance: 'Wait a minute before trying again.'
  },
  authorization: {
    type: 'authorization',
    message: 'You don\'t have permission for this action.',
    retryable: false,
    guidance: 'Contact your account administrator.'
  },
  validation: {
    type: 'validation',
    message: 'Invalid input provided.',
    retryable: false,
    guidance: 'Check your input and try again.'
  },
  conflict: {
    type: 'conflict',
    message: 'This content was modified by someone else.',
    retryable: true,
    guidance: 'Refresh and try again.'
  },
  partial: {
    type: 'partial',
    message: 'Some translations failed.',
    retryable: true,
    guidance: 'Retry the failed items individually.'
  },
  unknown: {
    type: 'unknown',
    message: 'An unexpected error occurred.',
    retryable: true,
    guidance: 'Please try again or contact support.'
  }
};
```

### 3. Loading State Utilities

Create shared utilities for consistent loading states:

```typescript
// Loading state types for different UI contexts
type LoadingContext =
  | 'button'     // Inline spinner in button
  | 'panel'      // Full panel/section overlay
  | 'inline'     // Inline next to content
  | 'skeleton';  // Skeleton placeholder

interface LoadingStateProps {
  context: LoadingContext;
  message?: string;
  className?: string;
}
```

---

## Implementation Tasks

### Task 1: Create Shared Loading/Error Utilities

**File:** `/src/components/TranslationManagement/utils/loading-error.ts`

Create utilities for consistent loading and error handling:

- `classifyError(error: unknown): TranslationError` - Classify errors from API responses
- `getErrorMessage(type: TranslationErrorType): string` - Get user-friendly messages
- `isRetryableError(error: TranslationError): boolean` - Check if error can be retried
- Error message constants for all error types
- Loading spinner size constants (sm: 16px, md: 20px, lg: 24px)

### Task 2: Create TranslationLoadingSpinner Component

**File:** `/src/components/TranslationManagement/shared/TranslationLoadingSpinner.tsx`

Reusable loading spinner following existing patterns:

```typescript
interface TranslationLoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string; // For screen readers
}
```

Features:
- Uses `Loader2` from lucide-react with `animate-spin`
- Three sizes matching existing design system
- `aria-hidden="true"` with optional sr-only label
- Color matches primary brand (#FF385C)

### Task 3: Create TranslationErrorBanner Component

**File:** `/src/components/TranslationManagement/shared/TranslationErrorBanner.tsx`

Reusable error banner following QRGenerationProgress pattern:

```typescript
interface TranslationErrorBannerProps {
  error: TranslationError;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}
```

Features:
- Red left border with AlertCircle icon
- User-friendly message with guidance text
- Retry button (if error is retryable)
- Dismiss button (X icon)
- `role="alert"` with `aria-live="polite"`

### Task 4: Create TranslationLoadingSkeleton Component

**File:** `/src/components/TranslationManagement/shared/TranslationLoadingSkeleton.tsx`

Skeleton loaders for different translation components:

```typescript
interface TranslationLoadingSkeletonProps {
  variant: 'status-item' | 'progress-bar' | 'editor' | 'widget';
  count?: number;
  className?: string;
}
```

Features:
- Matches visual structure of real components
- `animate-pulse` class for shimmer effect
- `role="status"` with `aria-busy="true"`
- Screen reader text

### Task 5: Update TranslationPreviewPanel with Loading States

**File:** `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx` (modify)

Add loading and error handling:

1. **Initial Loading State:**
   - Show skeleton while fetching translation status
   - Skeleton for source content area
   - Skeleton for language status list

2. **Error State:**
   - Show TranslationErrorBanner if status fetch fails
   - Retry button to refetch status

3. **Partial Loading:**
   - Individual status items show loading state during re-translation
   - Disable Edit/Retry buttons while processing

### Task 6: Update TranslationStatusItem with Loading States

**File:** `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx` (modify)

Add per-item loading and error states:

1. **Processing State:**
   - Animated spinner icon (replacing static pending icon)
   - "Translating..." text
   - Disable action buttons

2. **Error State:**
   - Red X icon
   - "Failed" status with error tooltip
   - Retry button enabled

3. **Button Loading:**
   - Edit button shows spinner when saving
   - Re-translate button shows spinner when queued

### Task 7: Update TranslationProgressBar with Enhanced States

**File:** `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationProgressBar.tsx` (modify)

Enhance progress indicator:

1. **Animated Progress:**
   - Smooth width transitions (CSS `transition-all`)
   - Pulse animation during active processing

2. **Status Colors:**
   - Normal: Brand pink (#FF385C)
   - Some failures: Amber (#F59E0B)
   - All failed: Red (#FF5A5F)
   - Complete: Green (#22C55E)

3. **Accessibility:**
   - `role="progressbar"` with aria values
   - Screen reader announcement on completion

### Task 8: Update TranslationEditor with Loading States

**File:** `/src/components/TranslationManagement/TranslationEditor/TranslationEditor.tsx` (modify)

Add loading and error handling to editor modal:

1. **Save Operation:**
   - Save button shows spinner and "Saving..."
   - Disable all inputs during save
   - Cancel button disabled during save

2. **Error Handling:**
   - Show inline error below text area
   - Highlight invalid fields
   - Preserve user input on error

3. **Success Feedback:**
   - Brief success state before closing
   - "Saved" text with checkmark

### Task 9: Update TranslationStatusWidget with Loading States

**File:** `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.tsx` (modify)

Add widget loading and error states:

1. **Loading State:**
   - Skeleton for counts and progress bar
   - Loading text in place of summary

2. **Error State:**
   - Compact error message
   - Retry link

3. **Refresh Indicator:**
   - Subtle spinner during background refresh
   - Last updated timestamp

### Task 10: Update BulkTranslationBar with Operation States

**File:** `/src/components/TranslationManagement/BulkTranslationBar/BulkTranslationBar.tsx` (modify)

Add bulk operation loading and error states:

1. **Processing State:**
   - Progress bar during bulk operation
   - Cancel button available
   - "Processing X of Y items..."

2. **Error Handling:**
   - Show count of failed items
   - "Retry Failed" button
   - "Skip & Continue" option

3. **Success State:**
   - Brief success message
   - Auto-dismiss after 3 seconds

### Task 11: Update Hooks with Loading/Error States

**Files:**
- `/src/hooks/useTranslationStatus.ts` (modify)
- `/src/hooks/useTranslationRealtime.ts` (modify)

Enhance hooks with proper state management:

```typescript
interface UseTranslationStatusReturn {
  data: TranslationStatusResponse | null;
  isLoading: boolean;
  isRefreshing: boolean; // Background refresh
  error: TranslationError | null;
  refetch: () => Promise<void>;
  retry: () => Promise<void>; // Same as refetch but clears error first
}

interface UseTranslationRealtimeReturn {
  isConnected: boolean;
  isReconnecting: boolean;
  connectionError: TranslationError | null;
  lastUpdate: string | null;
  reconnect: () => void;
}
```

### Task 12: Add Retry Logic to API Call Utilities

**File:** `/src/components/TranslationManagement/utils/api.ts`

Create shared API utilities with retry logic:

```typescript
interface ApiCallOptions {
  maxRetries?: number;
  retryDelay?: number;
  onRetry?: (attempt: number, error: TranslationError) => void;
}

async function fetchWithRetry<T>(
  url: string,
  options: RequestInit,
  apiOptions?: ApiCallOptions
): Promise<{ data: T | null; error: TranslationError | null }>
```

Features:
- Exponential backoff (base delay * 2^attempt)
- Respect rate limit headers
- Skip retry for non-retryable errors
- Timeout handling with AbortController

### Task 13: Create Shared Toast Notification Utility

**File:** `/src/components/TranslationManagement/utils/notifications.ts`

Toast notification utilities (if toast library available, else inline):

```typescript
interface ToastOptions {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
  action?: { label: string; onClick: () => void };
}

function showTranslationToast(options: ToastOptions): void;
function dismissToast(id: string): void;
```

### Task 14: Update Barrel Exports

**File:** `/src/components/TranslationManagement/index.ts` (modify)

Export new utilities and components:

```typescript
// Shared utilities
export * from './utils/loading-error';
export * from './utils/api';
export * from './utils/notifications';

// Shared components
export { TranslationLoadingSpinner } from './shared/TranslationLoadingSpinner';
export { TranslationErrorBanner } from './shared/TranslationErrorBanner';
export { TranslationLoadingSkeleton } from './shared/TranslationLoadingSkeleton';
```

---

## Authorized Files and Functions for Modification

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/components/TranslationManagement/utils/loading-error.ts` | Error classification utilities |
| `/src/components/TranslationManagement/utils/api.ts` | API call utilities with retry |
| `/src/components/TranslationManagement/utils/notifications.ts` | Toast notification utilities |
| `/src/components/TranslationManagement/shared/TranslationLoadingSpinner.tsx` | Reusable loading spinner |
| `/src/components/TranslationManagement/shared/TranslationErrorBanner.tsx` | Reusable error banner |
| `/src/components/TranslationManagement/shared/TranslationLoadingSkeleton.tsx` | Skeleton loading states |
| `/src/components/TranslationManagement/shared/index.ts` | Shared components barrel export |

### Files to Modify

| File Path | Functions/Sections to Modify |
|-----------|------------------------------|
| `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx` | Add `isLoading`, `error` state; render skeleton/error banner |
| `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx` | Add `isProcessing`, `error` props; button loading states |
| `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationProgressBar.tsx` | Add animated states; color variations |
| `/src/components/TranslationManagement/TranslationEditor/TranslationEditor.tsx` | Add `isSaving` state; error display; success feedback |
| `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.tsx` | Add loading skeleton; error state; refresh indicator |
| `/src/components/TranslationManagement/BulkTranslationBar/BulkTranslationBar.tsx` | Add progress state; error handling; cancel support |
| `/src/components/TranslationManagement/index.ts` | Add new exports |
| `/src/hooks/useTranslationStatus.ts` | Add `isRefreshing`, `error`, `retry` to return |
| `/src/hooks/useTranslationRealtime.ts` | Add `isReconnecting`, `connectionError`, `reconnect` |

---

## UI Visual Specifications

### Loading Spinner Sizes

| Size | Dimensions | Use Case |
|------|------------|----------|
| sm | 16x16px (`w-4 h-4`) | Inline in buttons |
| md | 20x20px (`w-5 h-5`) | Status indicators |
| lg | 24x24px (`w-6 h-6`) | Panel loading states |

### Error Banner Colors

| Element | Tailwind Class | Hex |
|---------|----------------|-----|
| Border | `border-[#FF5A5F]` | #FF5A5F |
| Background | `bg-red-50` | #FEF2F2 |
| Icon | `text-[#FF5A5F]` | #FF5A5F |
| Text | `text-[#222222]` | #222222 |

### Loading State Colors

| State | Tailwind Class | Use |
|-------|----------------|-----|
| Normal Progress | `bg-[#FF385C]` | Active progress |
| Warning | `bg-amber-500` | Partial failures |
| Error | `bg-[#FF5A5F]` | All failed |
| Success | `bg-[#22C55E]` | Complete |

---

## Acceptance Criteria Checklist

- [ ] All components with async operations display loading spinners during data fetching
- [ ] Loading indicators appear within or adjacent to the specific affected component area
- [ ] Action buttons show loading spinners within the button and become disabled during operation
- [ ] Failed API operations trigger clear, user-friendly error messages
- [ ] Error messages distinguish between: network, server, validation, authorization errors
- [ ] Every error notification includes a retry button for retryable errors
- [ ] Retry actions preserve user input and context
- [ ] Components prevent duplicate submissions by disabling during operations
- [ ] Batch operations provide detailed feedback about successes and failures
- [ ] Loading states do not cause layout shifts or visual jumps
- [ ] Error handling covers timeout errors, rate limiting, and concurrent conflicts
- [ ] Components recover gracefully from errors without page refresh
- [ ] Error messages provide specific, actionable guidance
- [ ] Patterns are consistent across all translation-related components

---

## Testing Strategy

### Unit Tests

| Component | Tests |
|-----------|-------|
| TranslationLoadingSpinner | Renders at all sizes; has correct aria labels |
| TranslationErrorBanner | Renders error message; retry button works; dismiss works |
| TranslationLoadingSkeleton | Renders all variants; has accessibility attributes |
| loading-error utilities | `classifyError` correctly classifies all error types |
| api utilities | Retry logic works; respects max retries; handles timeout |

### Integration Tests

| Scenario | Test |
|----------|------|
| Panel load failure | Shows error banner; retry button refetches |
| Editor save failure | Shows inline error; preserves input; retry works |
| Bulk operation partial failure | Shows failure count; retry failed button works |
| Realtime reconnection | Shows reconnecting state; auto-reconnects |

### Manual E2E Tests

| Test Case | Expected Behavior |
|-----------|-------------------|
| Disconnect network during panel load | Error banner appears; reconnect and retry works |
| Save with server error (simulate 500) | Error message shown; input preserved; retry succeeds |
| Bulk translate 10 items with 2 failures | Progress shows 8/10; retry failed button appears |
| Rapid button clicks during operation | Only one operation executes; no duplicates |

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Layout shifts during loading | Medium | Low | Fixed height containers; skeleton matches content size |
| Over-aggressive error display | Medium | Medium | Debounce errors; consolidate multiple failures |
| Retry loops | Low | High | Exponential backoff; max retry limit; user must trigger after max |
| Accessibility compliance | Low | Medium | ARIA roles; screen reader testing; focus management |

---

## References

- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md` (Task 7.3)
- Request Document: `/docs/gen_requests_epic5.md` (REQ-363)
- Existing Loading Pattern: `/src/components/ItemManager/components/shared/LoadingState.tsx`
- Existing Progress Pattern: `/src/components/ItemCreationWorkflow/components/shared/QRGenerationProgress.tsx`
- Existing Modal Pattern: `/src/components/ConfirmationModal.tsx`
- Translation Types: `/src/lib/translation-service/translation-service.types.ts`
- Job Queue Types: `/src/lib/job-queue/translation-jobs.types.ts`

---

*Overview document generated for REQ-363 - Add Loading States and Error Handling*
