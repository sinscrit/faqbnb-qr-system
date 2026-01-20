# Detailed Task Breakdown: REQ-E05-030 - Add Loading States and Error Handling

**Document Created:** 2026-01-20
**Last Modified:** 2026-01-20
**Request ID:** REQ-E05-030
**Epic:** Epic 5 - Owner Translation Management
**Phase:** 7 - Integration & Polish
**Task ID:** 7.3
**Implementation Plan Reference:** `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
**Overview Document:** `/docs/REQ-E05-030-add-loading-states-and-error-handling-overview.md`

---

## Executive Summary

This document provides granular, actionable tasks for implementing comprehensive loading states and error handling across all translation management UI components. The implementation ensures users receive clear visual feedback during asynchronous operations and have actionable recovery paths when operations fail.

**Total Estimated Tasks:** 24 tasks across 7 phases
**Dependencies:** Requires all translation management components from REQ-E05-001 through REQ-E05-029

---

## Task Breakdown

### Phase 1: Shared Loading Components (Foundation)

#### Task 1.1: Create TranslationStatusItemSkeleton Component
**Priority:** High | **Complexity:** Low | **Estimated Size:** S

**Description:** Create a reusable skeleton loader component for translation status rows that displays while data is loading.

**File to Create:** `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItemSkeleton.tsx`

**Implementation Steps:**
1. Create new file with 'use client' directive
2. Implement skeleton row matching TranslationStatusItem dimensions:
   - Flag placeholder (24x16px rounded rectangle)
   - Language name placeholder (80px width)
   - Status indicator placeholder (16px circle)
   - Preview text placeholder (200px width)
   - Action buttons placeholder (2x 32px squares)
3. Apply `animate-pulse` class from Tailwind
4. Set fixed height of 48px to prevent layout shift
5. Add `role="status"` and `aria-busy="true"` for accessibility
6. Export component from index.ts

**Code Pattern Reference:**
```typescript
// Follow pattern from /src/components/ItemManager/components/shared/LoadingState.tsx
<div
  role="status"
  aria-label="Loading translation status"
  aria-busy="true"
  className="animate-pulse flex items-center gap-3 p-3 h-12"
>
  <div className="w-6 h-4 bg-gray-200 rounded" /> {/* Flag */}
  <div className="w-20 h-4 bg-gray-200 rounded" /> {/* Language */}
  <div className="w-4 h-4 bg-gray-200 rounded-full" /> {/* Status */}
  <div className="flex-1 h-4 bg-gray-200 rounded max-w-[200px]" /> {/* Preview */}
  <div className="flex gap-2">
    <div className="w-8 h-8 bg-gray-200 rounded" />
    <div className="w-8 h-8 bg-gray-200 rounded" />
  </div>
</div>
```

**Acceptance Criteria:**
- [ ] Skeleton matches approximate dimensions of loaded TranslationStatusItem
- [ ] Uses `animate-pulse` animation
- [ ] Fixed height of 48px maintained
- [ ] Accessible with proper ARIA attributes
- [ ] Exported from component index

---

#### Task 1.2: Add Loading State to TranslationProgressBar
**Priority:** High | **Complexity:** Low | **Estimated Size:** S

**Description:** Enhance TranslationProgressBar with shimmer loading state when data is being fetched.

**File to Modify:** `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationProgressBar.tsx`

**Implementation Steps:**
1. Add `loading?: boolean` prop to component interface
2. Create shimmer effect using CSS animation:
   ```css
   @keyframes shimmer {
     0% { transform: translateX(-100%); }
     100% { transform: translateX(100%); }
   }
   ```
3. When `loading=true`, show progress bar with shimmer overlay
4. Maintain fixed dimensions during loading
5. Hide text content during loading (show placeholder)

**Code Changes:**
```typescript
interface TranslationProgressBarProps {
  total: number;
  completed: number;
  loading?: boolean; // ADD
  className?: string;
}

// In render:
{loading ? (
  <div className="relative overflow-hidden h-2 bg-gray-200 rounded-full">
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-300 to-transparent animate-[shimmer_1.5s_infinite]" />
  </div>
) : (
  // existing progress bar render
)}
```

**Acceptance Criteria:**
- [ ] `loading` prop added to interface
- [ ] Shimmer animation displays when loading
- [ ] Fixed dimensions maintained during loading
- [ ] No layout shift when transitioning to loaded state

---

#### Task 1.3: Add Loading Dots to TranslationStatusColumn
**Priority:** High | **Complexity:** Low | **Estimated Size:** S

**Description:** Create compact loading indicator (6 gray dots) for inline table column display.

**File to Modify:** `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.tsx`

**Implementation Steps:**
1. Add `loading?: boolean` prop to component interface
2. Create LoadingDots sub-component:
   - 6 small dots (6px diameter) with subtle pulse animation
   - Fixed width container (80-100px) matching loaded state
   - Staggered animation timing for visual interest
3. Return LoadingDots when `loading=true`
4. Add `aria-label="Loading translation status"` when loading

**Code Pattern:**
```typescript
function LoadingDots() {
  return (
    <div
      className="flex items-center gap-1.5 w-[90px]"
      role="status"
      aria-label="Loading translation status"
    >
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-pulse"
          style={{ animationDelay: `${i * 100}ms` }}
        />
      ))}
    </div>
  );
}
```

**Acceptance Criteria:**
- [ ] 6 gray dots with pulse animation
- [ ] Fixed width (80-100px) matching loaded state
- [ ] Accessible loading announcement
- [ ] Component returns dots when loading prop is true

---

### Phase 2: Error Display Components

#### Task 2.1: Create TranslationErrorToast Component
**Priority:** High | **Complexity:** Medium | **Estimated Size:** M

**Description:** Create toast notification component for transient errors with auto-dismiss and retry functionality.

**File to Create:** `/src/components/TranslationManagement/shared/TranslationErrorToast.tsx`

**Implementation Steps:**
1. Create new file with 'use client' directive
2. Define props interface:
   ```typescript
   interface TranslationErrorToastProps {
     message: string;
     onRetry?: () => void;
     onDismiss: () => void;
     autoDismissMs?: number; // default 5000
   }
   ```
3. Implement slide-in animation from top-right corner
4. Add auto-dismiss timer with cleanup
5. Add manual dismiss button (X icon)
6. Add retry action button (if onRetry provided)
7. Use error icon (AlertTriangle from lucide-react)
8. Apply `role="alert"` and `aria-live="assertive"`
9. Implement CSS transitions for enter/exit

**Visual Layout:**
```
┌─────────────────────────────────────────┐
│ ⚠ Something went wrong              [X] │
│ Failed to load translation status.       │
│                                         │
│                         [Try Again]     │
└─────────────────────────────────────────┘
```

**Styling:**
```typescript
// Container styles
'fixed top-4 right-4 z-50 max-w-sm p-4'
'bg-white border border-red-200 rounded-lg shadow-lg'
'animate-in slide-in-from-top-2 fade-in duration-300'

// Error text
'text-red-600 text-sm'

// Retry button
'px-3 py-1.5 text-red-700 hover:bg-red-50 rounded text-sm font-medium'
```

**Acceptance Criteria:**
- [ ] Slides in from top-right corner
- [ ] Auto-dismisses after 5 seconds (configurable)
- [ ] Manual dismiss button works
- [ ] Retry action button appears when onRetry provided
- [ ] Accessible with `role="alert"` and `aria-live="assertive"`
- [ ] Exit animation on dismiss

---

#### Task 2.2: Create TranslationErrorAlert Component
**Priority:** High | **Complexity:** Low | **Estimated Size:** S

**Description:** Create inline error alert component for contextual errors following existing PreviewSaveStep pattern.

**File to Create:** `/src/components/TranslationManagement/shared/TranslationErrorAlert.tsx`

**Implementation Steps:**
1. Create new file with 'use client' directive
2. Define props interface:
   ```typescript
   interface TranslationErrorAlertProps {
     message: string;
     onDismiss?: () => void;
     onRetry?: () => void;
     className?: string;
   }
   ```
3. Follow pattern from PreviewSaveStep.tsx error display:
   - Red background: `bg-red-50 border-red-200`
   - Error icon (AlertCircle)
   - Dismiss button
   - Optional retry button
4. Add proper ARIA attributes

**Code Pattern (from PreviewSaveStep.tsx:810-821):**
```typescript
<div className={cn("p-4 bg-red-50 border border-red-200 rounded-lg", className)}>
  <div className="flex items-start gap-3">
    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
    <div className="flex-1">
      <p className="text-red-600 text-sm">{message}</p>
      <div className="mt-2 flex gap-2">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="text-red-700 underline text-sm hover:text-red-800"
          >
            Try Again
          </button>
        )}
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="text-red-700 underline text-sm hover:text-red-800"
          >
            Dismiss
          </button>
        )}
      </div>
    </div>
  </div>
</div>
```

**Acceptance Criteria:**
- [ ] Follows existing PreviewSaveStep error pattern
- [ ] Uses `bg-red-50 border-red-200` styling
- [ ] Error icon displayed
- [ ] Optional dismiss and retry buttons
- [ ] Accessible with proper roles

---

#### Task 2.3: Create Error Messages Utility
**Priority:** High | **Complexity:** Low | **Estimated Size:** S

**Description:** Create centralized error message mapping utility for translation operations.

**File to Create:** `/src/components/TranslationManagement/utils/errorMessages.ts`

**Implementation Steps:**
1. Create utility file with error code to message mapping
2. Define TranslationError interface
3. Implement getTranslationErrorMessage function
4. Handle HTTP status codes and custom error codes
5. Provide sensible defaults for unknown errors

**Code Implementation:**
```typescript
/**
 * Translation Error Message Utility
 * @module TranslationManagement/utils/errorMessages
 * @created 2026-01-20
 */

export interface TranslationError {
  code?: string;
  status?: number;
  message?: string;
}

const ERROR_MESSAGES: Record<string, string> = {
  // HTTP Status Codes
  '403': "You don't have permission to perform this action.",
  '404': "The requested content could not be found.",
  '429': "Too many requests. Please wait a moment and try again.",
  '500': "Something went wrong on our end. Please try again in a moment.",
  '502': "We're having trouble connecting. Please try again in a moment.",
  '503': "The service is temporarily unavailable. Please try again later.",
  '504': "The request took too long. Please try again.",

  // Custom Error Codes
  'TRANSLATION_FAILED': "Translation failed. Click retry to try again.",
  'SAVE_FAILED': "Failed to save changes. Please try again.",
  'FETCH_FAILED': "Failed to load data. Please try again.",
  'NETWORK_ERROR': "Please check your connection and try again.",
  'TIMEOUT': "The request took too long. Please check your connection and try again.",
  'UNAUTHORIZED': "Please sign in to continue.",
  'VALIDATION_ERROR': "Please check your input and try again.",
  'CONNECTION_LOST': "Connection lost. Reconnecting...",
};

/**
 * Get user-friendly error message for translation operations
 */
export function getTranslationErrorMessage(error: TranslationError | Error | unknown): string {
  // Handle null/undefined
  if (!error) {
    return "An unexpected error occurred. Please try again.";
  }

  // Handle TranslationError with code
  if (typeof error === 'object' && error !== null) {
    const err = error as TranslationError;

    // Check for custom code
    if (err.code && ERROR_MESSAGES[err.code]) {
      return ERROR_MESSAGES[err.code];
    }

    // Check for HTTP status
    if (err.status && ERROR_MESSAGES[String(err.status)]) {
      return ERROR_MESSAGES[String(err.status)];
    }
  }

  // Check for standard Error message patterns
  const message = error instanceof Error ? error.message.toLowerCase() : '';

  if (message.includes('timeout')) {
    return ERROR_MESSAGES['TIMEOUT'];
  }
  if (message.includes('network') || message.includes('fetch')) {
    return ERROR_MESSAGES['NETWORK_ERROR'];
  }

  // Default message
  return "An unexpected error occurred. Please try again.";
}

/**
 * Determine if an error is retryable
 */
export function isTranslationErrorRetryable(error: TranslationError | Error | unknown): boolean {
  if (!error || typeof error !== 'object') return true;

  const err = error as TranslationError;

  // Non-retryable status codes
  const nonRetryableStatuses = [400, 401, 403, 404, 422];
  if (err.status && nonRetryableStatuses.includes(err.status)) {
    return false;
  }

  // Non-retryable error codes
  const nonRetryableCodes = ['UNAUTHORIZED', 'FORBIDDEN', 'NOT_FOUND', 'VALIDATION_ERROR'];
  if (err.code && nonRetryableCodes.includes(err.code)) {
    return false;
  }

  return true;
}
```

**Acceptance Criteria:**
- [ ] All error codes from spec mapped to user-friendly messages
- [ ] HTTP status codes handled (403, 404, 429, 500, etc.)
- [ ] Network/timeout errors detected from message patterns
- [ ] Default fallback message provided
- [ ] `isTranslationErrorRetryable` helper function implemented

---

### Phase 3: Hook Loading/Error State Enhancement

#### Task 3.1: Enhance useTranslationStatus Hook with Loading/Error States
**Priority:** Critical | **Complexity:** Medium | **Estimated Size:** M

**Description:** Enhance the translation status hook with comprehensive loading states, error handling, and retry functionality.

**File to Modify:** `/src/hooks/useTranslationStatus.ts`

**Implementation Steps:**
1. Update return interface with enhanced states:
   ```typescript
   interface UseTranslationStatusReturn {
     data: TranslationStatusResponse | null;
     isLoading: boolean;           // Initial load
     isRefetching: boolean;        // Refresh in progress
     error: TranslationError | null;
     errorMessage: string | null;  // User-friendly message
     refresh: () => Promise<void>;
     retry: () => Promise<void>;   // Retry last failed operation
     clearError: () => void;
     lastUpdated: Date | null;
     isStale: boolean;             // Data older than threshold
   }
   ```

2. Implement loading state management:
   ```typescript
   const [isLoading, setIsLoading] = useState(true);
   const [isRefetching, setIsRefetching] = useState(false);
   ```

3. Integrate with existing retry library:
   ```typescript
   import { withRetry, RetryPresets } from '@/lib/translation-service/utils/retry';
   ```

4. Implement error state with user-friendly messages:
   ```typescript
   import { getTranslationErrorMessage, isTranslationErrorRetryable } from '@/components/TranslationManagement/utils/errorMessages';
   ```

5. Add automatic retry with exponential backoff (3 attempts)

6. Implement manual retry function

7. Track last successful fetch timestamp

8. Calculate staleness (data older than 5 minutes)

**Code Structure:**
```typescript
export function useTranslationStatus(params: UseTranslationStatusParams): UseTranslationStatusReturn {
  const [state, setState] = useState<{
    data: TranslationStatusResponse | null;
    error: TranslationError | null;
    isLoading: boolean;
    isRefetching: boolean;
    lastUpdated: Date | null;
  }>({
    data: null,
    error: null,
    isLoading: true,
    isRefetching: false,
    lastUpdated: null,
  });

  const lastParamsRef = useRef(params);

  const fetchStatus = useCallback(async (isRefresh: boolean = false) => {
    setState(prev => ({
      ...prev,
      isLoading: !isRefresh && !prev.data,
      isRefetching: isRefresh,
      error: null,
    }));

    const result = await withRetry(
      () => fetchTranslationStatusAPI(params),
      {
        ...RetryPresets.standard,
        maxRetries: 3,
        onRetry: (attempt, error, delay) => {
          console.warn(`[useTranslationStatus] Retry ${attempt}, waiting ${delay}ms`);
        },
      }
    );

    if (result.success) {
      setState({
        data: result.data!,
        error: null,
        isLoading: false,
        isRefetching: false,
        lastUpdated: new Date(),
      });
    } else {
      setState(prev => ({
        ...prev,
        error: result.error as TranslationError,
        isLoading: false,
        isRefetching: false,
      }));
    }
  }, [params]);

  // ... rest of implementation
}
```

**Acceptance Criteria:**
- [ ] `isLoading` true during initial fetch
- [ ] `isRefetching` true during refresh (data already exists)
- [ ] `error` and `errorMessage` populated on failure
- [ ] `retry()` function available and working
- [ ] Automatic retry with exponential backoff (3 attempts)
- [ ] `clearError()` function to dismiss error
- [ ] `lastUpdated` timestamp tracked
- [ ] `isStale` computed based on age threshold

---

#### Task 3.2: Enhance useTranslationRealtime Hook with Connection Status
**Priority:** High | **Complexity:** Medium | **Estimated Size:** M

**Description:** Add connection status tracking and error handling to the realtime subscription hook.

**File to Modify:** `/src/hooks/useTranslationRealtime.ts`

**Implementation Steps:**
1. Update return interface with connection status:
   ```typescript
   interface UseTranslationRealtimeReturn {
     connectionStatus: 'connected' | 'connecting' | 'disconnected' | 'error';
     connectionError: Error | null;
     reconnect: () => void;
     disconnect: () => void;
   }
   ```

2. Track Supabase channel connection states

3. Implement automatic reconnection with aggressive backoff:
   ```typescript
   import { withRetry, RetryPresets } from '@/lib/translation-service/utils/retry';
   // Use RetryPresets.aggressive for reconnection
   ```

4. Add connection error state

5. Expose manual reconnect function

6. Add disconnect function for cleanup

**Code Structure:**
```typescript
export function useTranslationRealtime(params: UseTranslationRealtimeParams): UseTranslationRealtimeReturn {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [connectionError, setConnectionError] = useState<Error | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const reconnectAttemptRef = useRef(0);

  const connect = useCallback(async () => {
    setConnectionStatus('connecting');
    setConnectionError(null);

    try {
      const channel = supabase
        .channel(`translations:${params.entityId}`)
        .on('postgres_changes', /* ... */)
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            setConnectionStatus('connected');
            reconnectAttemptRef.current = 0;
          } else if (status === 'CHANNEL_ERROR') {
            setConnectionStatus('error');
            // Trigger reconnect with backoff
            scheduleReconnect();
          }
        });

      channelRef.current = channel;
    } catch (error) {
      setConnectionStatus('error');
      setConnectionError(error as Error);
    }
  }, [params]);

  const scheduleReconnect = useCallback(() => {
    const delay = calculateRetryDelay(reconnectAttemptRef.current, RetryPresets.aggressive);
    reconnectAttemptRef.current++;

    if (reconnectAttemptRef.current <= 5) {
      setTimeout(() => connect(), delay);
    }
  }, [connect]);

  const reconnect = useCallback(() => {
    reconnectAttemptRef.current = 0;
    connect();
  }, [connect]);

  const disconnect = useCallback(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    setConnectionStatus('disconnected');
  }, []);

  // ... rest of implementation
}
```

**Acceptance Criteria:**
- [ ] `connectionStatus` updates as connection state changes
- [ ] `connectionError` populated on connection failure
- [ ] Automatic reconnection with exponential backoff
- [ ] `reconnect()` function for manual reconnection
- [ ] `disconnect()` function for cleanup
- [ ] Maximum reconnect attempts limited (5 attempts)

---

### Phase 4: Component-Level Integration

#### Task 4.1: Add Loading States to TranslationPreviewPanel
**Priority:** Critical | **Complexity:** Medium | **Estimated Size:** M

**Description:** Integrate skeleton loading, error display, and minimum loading duration into the preview panel.

**File to Modify:** `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx`

**Implementation Steps:**
1. Import skeleton and error components:
   ```typescript
   import { TranslationStatusItemSkeleton } from './TranslationStatusItemSkeleton';
   import { TranslationErrorAlert } from '../shared/TranslationErrorAlert';
   ```

2. Add minimum loading duration (300ms) to prevent flashing:
   ```typescript
   const [minLoadingMet, setMinLoadingMet] = useState(false);

   useEffect(() => {
     const timer = setTimeout(() => setMinLoadingMet(true), 300);
     return () => clearTimeout(timer);
   }, []);

   const showLoading = isLoading || !minLoadingMet;
   ```

3. Show 6 skeleton rows while loading

4. Disable action buttons during operations

5. Add loading overlay for re-translate actions

6. Show inline error with retry if fetch fails

**Code Changes:**
```typescript
// In render:
{showLoading ? (
  <div className="space-y-2">
    {Array.from({ length: 6 }).map((_, i) => (
      <TranslationStatusItemSkeleton key={i} />
    ))}
  </div>
) : error ? (
  <TranslationErrorAlert
    message={errorMessage || "Failed to load translation status"}
    onRetry={retry}
    onDismiss={clearError}
  />
) : (
  // Existing language list render
)}

// Action button loading state
<button
  disabled={isRetranslating || isLoading}
  className={cn(
    'px-3 py-1.5 rounded text-sm font-medium',
    isRetranslating && 'opacity-50 cursor-wait'
  )}
>
  {isRetranslating ? (
    <><Loader2 className="w-4 h-4 animate-spin mr-1" /> Retranslating...</>
  ) : (
    'Re-translate'
  )}
</button>
```

**Acceptance Criteria:**
- [ ] 6 skeleton rows display while loading
- [ ] Minimum 300ms loading display to prevent flashing
- [ ] Action buttons disabled during operations
- [ ] Loading overlay for re-translate actions
- [ ] Inline error with retry button on failure
- [ ] Smooth transition from loading to loaded state

---

#### Task 4.2: Add Loading States to TranslationStatusWidget
**Priority:** High | **Complexity:** Low | **Estimated Size:** S

**Description:** Add shimmer effect and skeleton loading to the dashboard widget.

**File to Modify:** `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.tsx`

**Implementation Steps:**
1. Add `loading` prop to TranslationProgressBar usage
2. Create skeleton for status counts (4 placeholder boxes)
3. Add error state with retry button
4. Handle zero state when no content exists yet

**Code Changes:**
```typescript
// Loading state
{isLoading ? (
  <div className="space-y-4">
    <TranslationProgressBar loading total={0} completed={0} />
    <div className="grid grid-cols-4 gap-2">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded" />
          <div className="h-3 bg-gray-200 rounded mt-1 w-16" />
        </div>
      ))}
    </div>
  </div>
) : error ? (
  <TranslationErrorAlert
    message={errorMessage}
    onRetry={retry}
  />
) : (
  // Existing widget content
)}
```

**Acceptance Criteria:**
- [ ] Shimmer effect on progress bar during load
- [ ] 4 skeleton boxes for status counts
- [ ] Error state with retry button
- [ ] Zero state handling for empty content
- [ ] No layout shift during loading

---

#### Task 4.3: Add Loading States to TranslationEditor
**Priority:** High | **Complexity:** Low | **Estimated Size:** S

**Description:** Add loading overlay during save operation with button state changes.

**File to Modify:** `/src/components/TranslationManagement/TranslationEditor/TranslationEditor.tsx`

**Implementation Steps:**
1. Add `isSaving` state
2. Create loading overlay with centered spinner
3. Disable all controls during save
4. Change button text: "Save" -> "Saving..."
5. Keep modal open on error for retry
6. Show error below textarea if save fails

**Code Changes:**
```typescript
const [isSaving, setIsSaving] = useState(false);
const [saveError, setSaveError] = useState<string | null>(null);

const handleSave = async () => {
  setIsSaving(true);
  setSaveError(null);
  try {
    await onSave(editedContent);
    // Success - modal closes via parent
  } catch (error) {
    setSaveError(getTranslationErrorMessage(error));
    // Keep modal open for retry
  } finally {
    setIsSaving(false);
  }
};

// In render:
{isSaving && (
  <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-lg">
    <Loader2 className="w-8 h-8 animate-spin text-[#FF385C]" />
  </div>
)}

<textarea
  disabled={isSaving}
  // ...
/>

{saveError && (
  <p className="mt-2 text-red-600 text-sm">{saveError}</p>
)}

<button
  disabled={isSaving || !isDirty}
  className={cn(
    'px-4 py-2 bg-[#FF385C] text-white rounded-lg',
    isSaving && 'opacity-50 cursor-wait'
  )}
>
  {isSaving ? (
    <><Loader2 className="w-4 h-4 animate-spin inline mr-2" />Saving...</>
  ) : (
    'Save'
  )}
</button>
```

**Acceptance Criteria:**
- [ ] Loading overlay with spinner during save
- [ ] All controls disabled during save
- [ ] Button text changes to "Saving..."
- [ ] Error displayed below textarea on failure
- [ ] Modal stays open on error for retry

---

#### Task 4.4: Add Loading States to LanguagePreferenceSection
**Priority:** Medium | **Complexity:** Low | **Estimated Size:** S

**Description:** Add loading spinner in save button and error handling for preference save.

**File to Modify:** `/src/components/TranslationManagement/LanguagePreference/LanguagePreferenceSection.tsx`

**Implementation Steps:**
1. Add `isSaving` state
2. Show spinner icon in save button during operation
3. Disable dropdown during save
4. Show error toast if save fails
5. Revert dropdown to previous value on error

**Code Changes:**
```typescript
const [isSaving, setIsSaving] = useState(false);
const [saveError, setSaveError] = useState<string | null>(null);
const previousValueRef = useRef(selectedLanguage);

const handleSave = async () => {
  setIsSaving(true);
  setSaveError(null);
  try {
    await savePreference(selectedLanguage);
    previousValueRef.current = selectedLanguage;
    // Show success toast
  } catch (error) {
    setSaveError(getTranslationErrorMessage(error));
    // Revert to previous value
    setSelectedLanguage(previousValueRef.current);
    // Show error toast
  } finally {
    setIsSaving(false);
  }
};

// In render:
<select
  disabled={isSaving}
  // ...
/>

<button
  disabled={isSaving || selectedLanguage === previousValueRef.current}
>
  {isSaving ? (
    <><Loader2 className="w-4 h-4 animate-spin inline mr-2" />Saving...</>
  ) : (
    'Save'
  )}
</button>
```

**Acceptance Criteria:**
- [ ] Spinner icon in save button during save
- [ ] Dropdown disabled during save
- [ ] Error toast displayed on failure
- [ ] Dropdown reverts to previous value on error

---

#### Task 4.5: Add Loading States to BulkTranslationBar
**Priority:** High | **Complexity:** Medium | **Estimated Size:** M

**Description:** Add progress indicator and error handling for bulk translation operations.

**File to Modify:** `/src/components/TranslationManagement/BulkTranslationBar/BulkTranslationBar.tsx`

**Implementation Steps:**
1. Add progress tracking state:
   ```typescript
   const [progress, setProgress] = useState({ current: 0, total: 0, isProcessing: false });
   const [failedItems, setFailedItems] = useState<string[]>([]);
   ```

2. Show progress text during bulk operation: "Processing X of Y items..."

3. Disable action buttons during operation

4. Track which items failed during operation

5. Show partial success handling with breakdown

6. Add "Retry Failed (N)" button for partial failures

**Code Changes:**
```typescript
// Progress display
{progress.isProcessing && (
  <div className="flex items-center gap-2">
    <Loader2 className="w-4 h-4 animate-spin" />
    <span className="text-sm text-gray-600">
      Processing {progress.current} of {progress.total} items...
    </span>
  </div>
)}

// After completion with failures
{failedItems.length > 0 && (
  <div className="flex items-center gap-2">
    <span className="text-sm text-amber-600">
      {progress.total - failedItems.length} succeeded, {failedItems.length} failed
    </span>
    <button
      onClick={handleRetryFailed}
      className="px-3 py-1.5 text-amber-700 hover:bg-amber-50 rounded text-sm"
    >
      Retry Failed ({failedItems.length})
    </button>
  </div>
)}
```

**Acceptance Criteria:**
- [ ] Progress text shows "Processing X of Y items..."
- [ ] Buttons disabled during operation
- [ ] Failed items tracked
- [ ] Partial success breakdown displayed
- [ ] "Retry Failed (N)" button for failed items only

---

### Phase 5: Retry Mechanism Implementation

#### Task 5.1: Create RetryButton Component
**Priority:** High | **Complexity:** Low | **Estimated Size:** S

**Description:** Create reusable retry button component with loading state.

**File to Create:** `/src/components/TranslationManagement/shared/RetryButton.tsx`

**Implementation Steps:**
1. Define props interface:
   ```typescript
   interface RetryButtonProps {
     onClick: () => void | Promise<void>;
     isRetrying?: boolean;
     variant?: 'primary' | 'secondary' | 'link';
     size?: 'sm' | 'md';
     label?: string;  // Default: "Try Again"
     className?: string;
   }
   ```

2. Implement button with loading spinner

3. Handle async onClick with internal loading state

4. Style variants for different contexts

**Code Implementation:**
```typescript
'use client';

import { useState, useCallback } from 'react';
import { Loader2, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RetryButtonProps {
  onClick: () => void | Promise<void>;
  isRetrying?: boolean;
  variant?: 'primary' | 'secondary' | 'link';
  size?: 'sm' | 'md';
  label?: string;
  className?: string;
}

const variantStyles = {
  primary: 'bg-[#FF385C] text-white hover:bg-[#E31C5F]',
  secondary: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
  link: 'text-[#FF385C] hover:text-[#E31C5F] underline',
};

const sizeStyles = {
  sm: 'px-2 py-1 text-sm',
  md: 'px-4 py-2',
};

export function RetryButton({
  onClick,
  isRetrying: externalIsRetrying,
  variant = 'secondary',
  size = 'sm',
  label = 'Try Again',
  className,
}: RetryButtonProps) {
  const [internalRetrying, setInternalRetrying] = useState(false);
  const isRetrying = externalIsRetrying ?? internalRetrying;

  const handleClick = useCallback(async () => {
    if (isRetrying) return;

    setInternalRetrying(true);
    try {
      await onClick();
    } finally {
      setInternalRetrying(false);
    }
  }, [onClick, isRetrying]);

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isRetrying}
      aria-busy={isRetrying}
      className={cn(
        'inline-flex items-center gap-1.5 rounded font-medium transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {isRetrying ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
          <span>Retrying...</span>
        </>
      ) : (
        <>
          <RotateCcw className="w-4 h-4" aria-hidden="true" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}

export default RetryButton;
```

**Acceptance Criteria:**
- [ ] Shows loading spinner during retry
- [ ] Button disabled during retry
- [ ] Handles async onClick
- [ ] Multiple style variants (primary, secondary, link)
- [ ] Accessible labels and states

---

#### Task 5.2: Add Retry to TranslationStatusItem for Failed Jobs
**Priority:** High | **Complexity:** Low | **Estimated Size:** S

**Description:** Add retry functionality to individual failed translation status items.

**File to Modify:** `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx`

**Implementation Steps:**
1. Import RetryButton component
2. Show "Retry" button only for failed status
3. Call retranslate API for single language on click
4. Update status optimistically then confirm on success
5. Show error if retry fails

**Code Changes:**
```typescript
import { RetryButton } from '../shared/RetryButton';

// In render, action buttons area:
{status === 'failed' && (
  <RetryButton
    onClick={() => onRetry?.(language)}
    isRetrying={isRetryingThis}
    size="sm"
    label="Retry"
  />
)}
```

**Acceptance Criteria:**
- [ ] Retry button visible only for failed status
- [ ] Calls retranslate API for single language
- [ ] Updates status on success
- [ ] Shows error if retry fails

---

#### Task 5.3: Add Bulk Retry for Partial Failures
**Priority:** Medium | **Complexity:** Medium | **Estimated Size:** M

**Description:** Implement retry functionality for only failed items in bulk operations.

**File to Modify:** `/src/components/TranslationManagement/BulkTranslationBar/BulkTranslationBar.tsx`

**Implementation Steps:**
1. Track failed item IDs during bulk operation
2. Add "Retry Failed (N)" button after partial failure
3. Implement retry that only processes failed items
4. Clear failed items list on successful retry or dismiss

**Code Changes:**
```typescript
const [failedItems, setFailedItems] = useState<{ id: string; error: string }[]>([]);

const handleBulkOperation = async () => {
  setProgress({ current: 0, total: selectedItems.length, isProcessing: true });
  const failed: typeof failedItems = [];

  for (let i = 0; i < selectedItems.length; i++) {
    setProgress(prev => ({ ...prev, current: i + 1 }));
    try {
      await retranslateItem(selectedItems[i]);
    } catch (error) {
      failed.push({ id: selectedItems[i], error: getTranslationErrorMessage(error) });
    }
  }

  setFailedItems(failed);
  setProgress(prev => ({ ...prev, isProcessing: false }));
};

const handleRetryFailed = async () => {
  const failedIds = failedItems.map(f => f.id);
  setProgress({ current: 0, total: failedIds.length, isProcessing: true });
  const stillFailed: typeof failedItems = [];

  for (let i = 0; i < failedIds.length; i++) {
    setProgress(prev => ({ ...prev, current: i + 1 }));
    try {
      await retranslateItem(failedIds[i]);
    } catch (error) {
      stillFailed.push({ id: failedIds[i], error: getTranslationErrorMessage(error) });
    }
  }

  setFailedItems(stillFailed);
  setProgress(prev => ({ ...prev, isProcessing: false }));
};
```

**Acceptance Criteria:**
- [ ] Failed items tracked during bulk operation
- [ ] "Retry Failed (N)" button appears after partial failure
- [ ] Retry only processes failed items
- [ ] Progress updates during retry
- [ ] List cleared on full success

---

### Phase 6: Accessibility Enhancements

#### Task 6.1: Add ARIA Live Regions for Status Changes
**Priority:** High | **Complexity:** Low | **Estimated Size:** S

**Description:** Add screen reader announcements for loading and error state changes.

**Files to Modify:** All Phase 4 component files

**Implementation Steps:**
1. Add `aria-live="polite"` regions for loading state changes
2. Add `aria-live="assertive"` regions for error messages
3. Add `role="status"` to loading indicators
4. Add `role="alert"` to error messages

**Code Pattern:**
```typescript
// Add to each component
<div aria-live="polite" className="sr-only">
  {isLoading && 'Loading translation status...'}
  {!isLoading && data && 'Translation status loaded'}
</div>

<div aria-live="assertive" className="sr-only">
  {error && `Error: ${errorMessage}`}
</div>
```

**Acceptance Criteria:**
- [ ] Loading states announced via `aria-live="polite"`
- [ ] Errors announced via `aria-live="assertive"`
- [ ] `role="status"` on loading indicators
- [ ] `role="alert"` on error messages

---

#### Task 6.2: Implement Focus Management on Error
**Priority:** Medium | **Complexity:** Low | **Estimated Size:** S

**Description:** Manage focus appropriately when errors appear and are dismissed.

**Files to Modify:** TranslationErrorAlert, TranslationErrorToast

**Implementation Steps:**
1. Move focus to error message when displayed
2. Store previously focused element
3. Return focus on dismissal
4. Implement focus trap in error modals if applicable

**Code Pattern:**
```typescript
const previousFocusRef = useRef<HTMLElement | null>(null);
const alertRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  if (error) {
    previousFocusRef.current = document.activeElement as HTMLElement;
    alertRef.current?.focus();
  }

  return () => {
    if (previousFocusRef.current) {
      previousFocusRef.current.focus();
    }
  };
}, [error]);

// In render:
<div
  ref={alertRef}
  tabIndex={-1}
  role="alert"
  // ...
/>
```

**Acceptance Criteria:**
- [ ] Focus moves to error message when displayed
- [ ] Previous focus element stored
- [ ] Focus returns on dismissal
- [ ] No focus trap unless modal

---

#### Task 6.3: Ensure Non-Color Error Indication
**Priority:** Medium | **Complexity:** Low | **Estimated Size:** S

**Description:** Verify errors are indicated by more than just color.

**Files to Review/Modify:** All error display components

**Implementation Steps:**
1. Audit all error displays for color-only indication
2. Add error icon alongside red color
3. Add text label describing error state
4. Verify WCAG compliant contrast ratios

**Code Review Checklist:**
- [ ] TranslationErrorToast has AlertTriangle icon
- [ ] TranslationErrorAlert has AlertCircle icon
- [ ] Error states have text labels not just colors
- [ ] Red text meets 4.5:1 contrast ratio

**Acceptance Criteria:**
- [ ] All errors have icon + color indication
- [ ] All errors have text description
- [ ] Contrast ratios meet WCAG AA (4.5:1)

---

### Phase 7: Error Boundary Implementation

#### Task 7.1: Create TranslationErrorBoundary Component
**Priority:** High | **Complexity:** Medium | **Estimated Size:** M

**Description:** Create error boundary to catch unexpected React errors in translation components.

**File to Create:** `/src/components/TranslationManagement/shared/TranslationErrorBoundary.tsx`

**Implementation Steps:**
1. Create class component with error boundary lifecycle
2. Implement `getDerivedStateFromError` for state update
3. Implement `componentDidCatch` for error logging
4. Create fallback UI with reload option
5. Generate and display error reference ID for support
6. Export wrapper component for easy usage

**Code Implementation:**
```typescript
'use client';

import { Component, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorId: string | null;
}

export class TranslationErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorId: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Generate unique error ID for support reference
    const errorId = `TRN-${Date.now().toString(36).toUpperCase()}`;
    return { hasError: true, error, errorId };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error for debugging
    console.error('[TranslationErrorBoundary] Caught error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
    });

    // TODO: Send to error tracking service
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorId: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg text-center">
          <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Something went wrong
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            We encountered an unexpected error while loading translation management.
          </p>

          {this.state.errorId && (
            <p className="text-xs text-gray-500 mb-4">
              Error Reference: {this.state.errorId}
            </p>
          )}

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <RotateCcw className="w-4 h-4" />
              Try Again
            </button>
            <button
              onClick={this.handleReload}
              className="px-4 py-2 text-sm font-medium text-white bg-[#FF385C] rounded-lg hover:bg-[#E31C5F]"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default TranslationErrorBoundary;
```

**Acceptance Criteria:**
- [ ] Catches unexpected React errors
- [ ] Displays user-friendly fallback UI
- [ ] Shows reload page option
- [ ] Generates error reference ID
- [ ] Logs error details for debugging
- [ ] Supports custom fallback prop

---

#### Task 7.2: Create Shared Components Index File
**Priority:** Low | **Complexity:** Low | **Estimated Size:** S

**Description:** Create barrel export file for all shared translation management components.

**File to Create:** `/src/components/TranslationManagement/shared/index.ts`

**Implementation:**
```typescript
/**
 * Shared Translation Management Components
 * @module TranslationManagement/shared
 * @created 2026-01-20
 */

export { TranslationErrorToast } from './TranslationErrorToast';
export { TranslationErrorAlert } from './TranslationErrorAlert';
export { RetryButton } from './RetryButton';
export { TranslationErrorBoundary } from './TranslationErrorBoundary';
```

**Acceptance Criteria:**
- [ ] All shared components exported
- [ ] Module documentation comment added

---

#### Task 7.3: Update Main Index with Shared Exports
**Priority:** Low | **Complexity:** Low | **Estimated Size:** S

**Description:** Update main TranslationManagement index to include shared exports.

**File to Modify:** `/src/components/TranslationManagement/index.ts`

**Code Addition:**
```typescript
// Add to existing exports
export * from './shared';
export * from './utils/errorMessages';
```

**Acceptance Criteria:**
- [ ] Shared components exported from main index
- [ ] Error messages utility exported

---

## Testing Requirements

### Unit Tests

| Test File | Coverage Requirements |
|-----------|----------------------|
| `errorMessages.test.ts` | All error codes return appropriate messages, default fallback works |
| `RetryButton.test.tsx` | Loading state, disabled state, async onClick handling |
| `TranslationErrorToast.test.tsx` | Display, auto-dismiss timer, manual dismiss, retry action |
| `TranslationErrorAlert.test.tsx` | Display, dismiss button, retry button, accessibility |
| `useTranslationStatus.test.ts` | Loading states, error states, retry function, staleness calculation |

### Integration Tests

| Test | Description |
|------|-------------|
| Preview panel loading flow | Panel shows skeleton -> real content on load success |
| Widget error recovery | Widget shows error -> user clicks retry -> data loads |
| Editor save error | Save fails -> error shows -> retry succeeds |
| Bulk partial failure | Some items fail -> retry failed button -> retries only failed |

### Accessibility Tests

| Test | Description |
|------|-------------|
| Screen reader announcements | Loading and error states announced appropriately |
| Focus management | Focus moves to error, returns on dismiss |
| Keyboard navigation | Retry buttons accessible via keyboard |
| Color independence | Errors visible without color perception |

---

## File Summary

### New Files to Create (8 files)

| File Path | Task |
|-----------|------|
| `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItemSkeleton.tsx` | 1.1 |
| `/src/components/TranslationManagement/shared/TranslationErrorToast.tsx` | 2.1 |
| `/src/components/TranslationManagement/shared/TranslationErrorAlert.tsx` | 2.2 |
| `/src/components/TranslationManagement/shared/RetryButton.tsx` | 5.1 |
| `/src/components/TranslationManagement/shared/TranslationErrorBoundary.tsx` | 7.1 |
| `/src/components/TranslationManagement/shared/index.ts` | 7.2 |
| `/src/components/TranslationManagement/utils/errorMessages.ts` | 2.3 |

### Existing Files to Modify (12 files)

| File Path | Tasks |
|-----------|-------|
| `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationProgressBar.tsx` | 1.2 |
| `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.tsx` | 1.3 |
| `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx` | 4.1 |
| `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.tsx` | 4.2 |
| `/src/components/TranslationManagement/TranslationEditor/TranslationEditor.tsx` | 4.3 |
| `/src/components/TranslationManagement/LanguagePreference/LanguagePreferenceSection.tsx` | 4.4 |
| `/src/components/TranslationManagement/BulkTranslationBar/BulkTranslationBar.tsx` | 4.5, 5.3 |
| `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx` | 5.2 |
| `/src/hooks/useTranslationStatus.ts` | 3.1 |
| `/src/hooks/useTranslationRealtime.ts` | 3.2 |
| `/src/components/TranslationManagement/index.ts` | 7.3 |

---

## Implementation Order

**Recommended execution sequence:**

1. **Phase 1** (Tasks 1.1-1.3): Foundation loading components
2. **Phase 2** (Tasks 2.1-2.3): Error display components
3. **Phase 3** (Tasks 3.1-3.2): Hook enhancements (critical path)
4. **Phase 4** (Tasks 4.1-4.5): Component integration
5. **Phase 5** (Tasks 5.1-5.3): Retry mechanisms
6. **Phase 6** (Tasks 6.1-6.3): Accessibility
7. **Phase 7** (Tasks 7.1-7.3): Error boundary and exports

**Dependencies:**
- Phase 2 depends on Phase 1 patterns
- Phase 4 depends on Phases 1-3
- Phase 5 depends on Phase 2 (RetryButton uses error patterns)
- Phase 6 can be done in parallel with Phase 4-5
- Phase 7 can be done last as cleanup

---

## Visual Specifications Reference

### Loading States

| Component | Indicator | Min Duration |
|-----------|-----------|--------------|
| TranslationPreviewPanel | 6 skeleton rows | 300ms |
| TranslationStatusWidget | Shimmer + 4 skeleton counts | 300ms |
| TranslationStatusColumn | 6 pulsing dots | Until data |
| TranslationEditor | Full overlay spinner | Until complete |
| LanguagePreferenceSection | Button spinner | Until complete |
| BulkTranslationBar | "Processing X of Y..." | Until complete |

### Tailwind Classes Reference

```typescript
// Loading skeleton
'animate-pulse bg-gray-200 rounded'

// Loading spinner (use with Loader2 icon)
'animate-spin'

// Error box
'p-4 bg-red-50 border border-red-200 rounded-lg'

// Error text
'text-red-600 text-sm'

// Retry button (link style)
'text-red-700 underline text-sm hover:text-red-800'

// Disabled button
'opacity-50 cursor-not-allowed'

// Toast slide-in
'animate-in slide-in-from-top-2 fade-in duration-300'
```

---

## References

- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- Overview Document: `/docs/REQ-E05-030-add-loading-states-and-error-handling-overview.md`
- Request Source: `/docs/gen_requests_epic5.md` - REQ-E05-031
- Existing LoadingState: `/src/components/ItemManager/components/shared/LoadingState.tsx`
- Existing Retry Utility: `/src/lib/translation-service/utils/retry.ts`
- Existing Error Pattern: `/src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx`
