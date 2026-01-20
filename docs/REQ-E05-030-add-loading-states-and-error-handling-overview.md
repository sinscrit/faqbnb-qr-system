# Implementation Overview: REQ-E05-030 - Add Loading States and Error Handling

**Document Created:** 2026-01-20
**Last Modified:** 2026-01-20
**Request ID:** REQ-E05-030
**Epic:** Epic 5 - Owner Translation Management
**Phase:** 7 - Integration & Polish
**Task ID:** 7.3
**Implementation Plan Reference:** `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`

---

## Request Summary

All translation management components need consistent loading states with proper spinners and error handling with actionable retry mechanisms to provide users with clear feedback during asynchronous operations and recovery paths when operations fail.

### Source Request Details

**From:** `docs/gen_requests_epic5.md` - REQ-E05-031

**Task Context:**
- Phase: 7 - Integration & Polish
- Task ID: 7.3
- Title: Add loading states and error handling
- Details: All components: proper loading spinners, Error toasts/messages for API failures, Retry buttons for failed operations

---

## Technical Context

### Existing Patterns in Codebase

| Pattern | Location | Usage for This Task |
|---------|----------|---------------------|
| LoadingState Component | `/src/components/ItemManager/components/shared/LoadingState.tsx` | Skeleton loaders with `animate-pulse`, supports grid/list views |
| Button Loading States | `/src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx` | `Loader2` icon with `animate-spin`, text change during loading |
| Inline Error Display | `/src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx` | Error box with dismiss button, `bg-red-50 border-red-200` |
| Retry Logic Library | `/src/lib/translation-service/utils/retry.ts` | `withRetry()`, `retryOperation()`, exponential backoff, jitter |
| API Error Response | `/src/app/api/admin/accounts/route.ts` | `{ success: false, error, code }` format |
| PropertyContext Pattern | `/src/contexts/PropertyContext.tsx` | `isLoading`, `error`, `refreshProperties()` pattern |
| KPI Skeleton | `/src/components/KPIDashboardOverview.tsx` | Card-level skeleton with `loading` prop |

### Dependencies

| Dependency | Source | Status |
|------------|--------|--------|
| Translation status API | REQ-E05-001 | Required |
| Translation update API | REQ-E05-002 | Required |
| Retranslate API | REQ-E05-003 | Required |
| TranslationPreviewPanel | REQ-E05-007 | Required |
| TranslationStatusItem | REQ-E05-008 | Required |
| TranslationProgressBar | REQ-E05-009 | Required |
| TranslationEditor | REQ-E05-010 | Required |
| useTranslationStatus hook | REQ-E05-011 | Required |
| useTranslationRealtime hook | REQ-E05-012 | Required |
| TranslationStatusWidget | REQ-E05-013 | Required |
| TranslationStatusColumn | REQ-E05-014 | Required |
| TranslationStatusFilter | REQ-E05-015 | Required |
| BulkTranslationBar | REQ-E05-018 | Required |
| LanguageSelectorDialog | REQ-E05-019 | Required |
| LanguagePreferenceSection | REQ-E05-026 | Required |

### Key Components Requiring Loading/Error States

1. **TranslationPreviewPanel** - Initial data fetch, action operations
2. **TranslationStatusWidget** - Dashboard summary load
3. **TranslationStatusColumn** - Per-row status fetch in tables
4. **TranslationEditor** - Save operation
5. **LanguagePreferenceSection** - Preference save operation
6. **BulkTranslationBar** - Bulk job queue creation
7. **useTranslationStatus hook** - Data fetching states
8. **useTranslationRealtime hook** - Connection status

---

## Implementation Approach

### Phase 1: Shared Loading Components (Foundation)

#### Task 1.1: Create Skeleton Loader for Translation Status Rows
Create a reusable skeleton component for language status rows in the preview panel.

**Component:** `TranslationStatusItemSkeleton`
**Location:** `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItemSkeleton.tsx`

**Requirements:**
- Match approximate dimensions of loaded `TranslationStatusItem`
- Use `animate-pulse` pattern from existing `LoadingState.tsx`
- Include flag placeholder, language name placeholder, status placeholder
- Consistent height (48px) to prevent layout shift

#### Task 1.2: Create Shimmer Effect for Progress Bar
Add shimmer loading state to `TranslationProgressBar`.

**Location:** Modify `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationProgressBar.tsx`

**Requirements:**
- Add `loading?: boolean` prop
- Show animated shimmer when loading
- Maintain fixed dimensions during loading

#### Task 1.3: Create Loading Dots for Table Status Column
Create compact loading indicator for inline table columns.

**Component:** Part of `TranslationStatusColumn`
**Location:** `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.tsx`

**Requirements:**
- 6 gray dots with subtle pulse animation
- Fixed width (80-100px) matching loaded state
- Accessible loading announcement

### Phase 2: Error Display Components

#### Task 2.1: Create Translation Error Toast Component
Create a toast-like notification for transient errors.

**Component:** `TranslationErrorToast`
**Location:** `/src/components/TranslationManagement/shared/TranslationErrorToast.tsx`

**Requirements:**
- Slide-in from top-right corner
- Auto-dismiss after 5 seconds
- Manual dismiss button
- Retry action button
- Error icon and message
- Accessible `role="alert"` and `aria-live="assertive"`

**Visual Spec:**
```
┌─────────────────────────────────────────┐
│ ⚠ Something went wrong              [X] │
│ Failed to load translation status.       │
│                                         │
│                         [Try Again]     │
└─────────────────────────────────────────┘
```

#### Task 2.2: Create Inline Error Alert Component
Create reusable inline error alert for contextual errors.

**Component:** `TranslationErrorAlert`
**Location:** `/src/components/TranslationManagement/shared/TranslationErrorAlert.tsx`

**Requirements:**
- Full-width error box following existing pattern
- Red background (`bg-red-50 border-red-200`)
- Error icon, message text, dismiss button
- Optional retry button
- Follow pattern from `PreviewSaveStep.tsx`

#### Task 2.3: Create Error Messages Utility
Create centralized error message mapping for translation operations.

**Utility:** `getTranslationErrorMessage`
**Location:** `/src/components/TranslationManagement/utils/errorMessages.ts`

**Error Message Mapping:**
| Error Code/Status | User-Friendly Message |
|-------------------|----------------------|
| 403 Forbidden | "You don't have permission to perform this action." |
| 404 Not Found | "The requested content could not be found." |
| 429 Rate Limited | "Too many requests. Please wait a moment and try again." |
| 500 Server Error | "Something went wrong on our end. Please try again in a moment." |
| Network Timeout | "The request took too long. Please check your connection and try again." |
| `TRANSLATION_FAILED` | "Translation failed for {language}. Click retry to try again." |
| `SAVE_FAILED` | "Failed to save changes. Please try again." |
| Generic | "An unexpected error occurred. Please try again." |

### Phase 3: Hook Loading/Error State Integration

#### Task 3.1: Enhance useTranslationStatus Hook
Add comprehensive loading and error states to the translation status hook.

**Location:** `/src/hooks/useTranslationStatus.ts`

**Enhancements:**
```typescript
interface UseTranslationStatusReturn {
  // Existing
  data: TranslationStatusResponse | null;

  // Loading states
  isLoading: boolean;           // Initial load in progress
  isRefetching: boolean;        // Refresh in progress (data exists)

  // Error states
  error: TranslationError | null;
  errorMessage: string | null;  // User-friendly message

  // Actions
  refresh: () => Promise<void>;
  retry: () => Promise<void>;   // Retry last failed operation
  clearError: () => void;

  // Status
  lastUpdated: Date | null;
  isStale: boolean;             // Data older than threshold
}

interface TranslationError {
  code: string;
  status?: number;
  message: string;
  retryable: boolean;
}
```

**Retry Logic Integration:**
- Use existing `withRetry` from `/src/lib/translation-service/utils/retry.ts`
- 3 automatic retries with exponential backoff
- Expose retry function for manual retry

#### Task 3.2: Enhance useTranslationRealtime Hook
Add connection status and error handling.

**Location:** `/src/hooks/useTranslationRealtime.ts`

**Enhancements:**
```typescript
interface UseTranslationRealtimeReturn {
  // Connection status
  connectionStatus: 'connected' | 'connecting' | 'disconnected' | 'error';

  // Error state
  connectionError: Error | null;

  // Actions
  reconnect: () => void;
  disconnect: () => void;
}
```

**Requirements:**
- Automatic reconnection with backoff
- Expose connection status indicator
- Subtle UI feedback for connection issues

### Phase 4: Component-Level Integration

#### Task 4.1: TranslationPreviewPanel Loading States
Add loading states throughout the preview panel.

**Location:** `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx`

**Requirements:**
- Show skeleton rows while fetching status
- Disable action buttons during operations
- Show inline error if status fetch fails
- Loading overlay for re-translate actions
- Minimum 300ms loading display to prevent flashing

#### Task 4.2: TranslationStatusWidget Loading States
Add loading states to dashboard widget.

**Location:** `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.tsx`

**Requirements:**
- Shimmer effect on progress bar during load
- Skeleton for status counts (4 placeholder boxes)
- Error state with retry button
- Zero state handling (no content yet)

#### Task 4.3: TranslationEditor Loading States
Add loading states to translation editor modal.

**Location:** `/src/components/TranslationManagement/TranslationEditor/TranslationEditor.tsx`

**Requirements:**
- Loading overlay with spinner during save
- Disable all controls during save
- Button text change: "Save" → "Saving..."
- Error display below textarea if save fails
- Keep modal open on error for retry

#### Task 4.4: LanguagePreferenceSection Loading States
Add loading states to language preference section.

**Location:** `/src/components/TranslationManagement/LanguagePreference/LanguagePreferenceSection.tsx`

**Requirements:**
- Spinner icon in save button during operation
- Disable dropdown during save
- Error toast if save fails
- Revert dropdown to previous value on error

#### Task 4.5: BulkTranslationBar Loading States
Add loading states to bulk action bar.

**Location:** `/src/components/TranslationManagement/BulkTranslationBar/BulkTranslationBar.tsx`

**Requirements:**
- Progress indicator during bulk job creation
- "Processing 5 of 12 items..." text update
- Disable action buttons during operation
- Error state showing which items failed
- Partial success handling

### Phase 5: Retry Mechanism Implementation

#### Task 5.1: Create Retry Button Component
Create reusable retry button component.

**Component:** `RetryButton`
**Location:** `/src/components/TranslationManagement/shared/RetryButton.tsx`

**Props:**
```typescript
interface RetryButtonProps {
  onClick: () => void | Promise<void>;
  isRetrying?: boolean;
  variant?: 'primary' | 'secondary' | 'link';
  size?: 'sm' | 'md';
  label?: string;           // Default: "Try Again"
  className?: string;
}
```

**Requirements:**
- Show loading spinner during retry
- Disable button during retry
- Accessible label and states

#### Task 5.2: Implement Retry for Failed Translation Jobs
Add retry functionality to TranslationStatusItem.

**Location:** `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx`

**Requirements:**
- "Retry" button visible only for failed status
- Call retranslate API for single language
- Update status on success
- Show error if retry fails

#### Task 5.3: Implement Bulk Retry for Failed Operations
Add retry for partial bulk operation failures.

**Location:** `/src/components/TranslationManagement/BulkTranslationBar/BulkTranslationBar.tsx`

**Requirements:**
- Track failed items during bulk operation
- Show "Retry Failed ({n})" button after partial failure
- Retry only failed items, not all selected

### Phase 6: Accessibility Enhancements

#### Task 6.1: ARIA Live Region for Status Changes
Add screen reader announcements for loading and error states.

**Requirements:**
- `aria-live="polite"` for loading state changes
- `aria-live="assertive"` for error messages
- `role="status"` for loading indicators
- `role="alert"` for error messages

#### Task 6.2: Focus Management on Error
Manage focus when errors appear.

**Requirements:**
- Move focus to error message when displayed
- Return focus to triggering element after dismissal
- Focus trap in error modals if applicable

#### Task 6.3: Non-Color Error Indication
Ensure errors are not indicated by color alone.

**Requirements:**
- Error icon alongside red color
- Text label describing error state
- WCAG compliant contrast ratios

### Phase 7: Error Boundary Implementation

#### Task 7.1: Create Translation Error Boundary
Create error boundary for translation management components.

**Component:** `TranslationErrorBoundary`
**Location:** `/src/components/TranslationManagement/shared/TranslationErrorBoundary.tsx`

**Requirements:**
- Catch unexpected React errors
- Display fallback UI with reload option
- Log error details for debugging
- Preserve error reference ID for support

---

## Authorized Files and Functions for Modification

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItemSkeleton.tsx` | Skeleton loader for status rows |
| `/src/components/TranslationManagement/shared/TranslationErrorToast.tsx` | Toast notification for transient errors |
| `/src/components/TranslationManagement/shared/TranslationErrorAlert.tsx` | Inline error alert component |
| `/src/components/TranslationManagement/shared/RetryButton.tsx` | Reusable retry button |
| `/src/components/TranslationManagement/shared/TranslationErrorBoundary.tsx` | Error boundary component |
| `/src/components/TranslationManagement/shared/index.ts` | Barrel exports for shared components |
| `/src/components/TranslationManagement/utils/errorMessages.ts` | Error message mapping utility |

### Existing Files to Modify

| File Path | Functions/Sections to Modify |
|-----------|------------------------------|
| `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx` | Add loading states, error handling, skeleton display |
| `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx` | Add retry button for failed status, loading states for actions |
| `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationProgressBar.tsx` | Add `loading` prop, shimmer effect |
| `/src/components/TranslationManagement/TranslationEditor/TranslationEditor.tsx` | Add loading overlay, error display, save state management |
| `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.tsx` | Add skeleton loading, error state with retry |
| `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.tsx` | Add loading dots, error state indicator |
| `/src/components/TranslationManagement/TranslationStatusFilter/TranslationStatusFilter.tsx` | Add loading state during filter application |
| `/src/components/TranslationManagement/BulkTranslationBar/BulkTranslationBar.tsx` | Add progress indicator, error handling, partial failure retry |
| `/src/components/TranslationManagement/BulkTranslationBar/LanguageSelectorDialog.tsx` | Add loading state during confirm |
| `/src/components/TranslationManagement/LanguagePreference/LanguagePreferenceSection.tsx` | Add save loading state, error handling |
| `/src/hooks/useTranslationStatus.ts` | Enhance with retry logic, error states, loading states |
| `/src/hooks/useTranslationRealtime.ts` | Add connection status, error handling, reconnect function |
| `/src/components/TranslationManagement/index.ts` | Export shared components |

### API Routes (No Changes Required)
Existing API routes already return proper error formats. Loading/error handling is client-side only.

---

## Integration Points

### With Existing Retry Library
Leverage `/src/lib/translation-service/utils/retry.ts`:
- Use `withRetry` wrapper for API calls in hooks
- Use `RetryPresets.standard` for most operations
- Use `RetryPresets.aggressive` for realtime reconnection
- Use `isRetryableError` to determine if retry UI should show

### With Existing Loading Patterns
Follow patterns from:
- `LoadingState.tsx` - Skeleton structure with `animate-pulse`
- `PreviewSaveStep.tsx` - Button loading with `Loader2` icon
- `PropertyContext.tsx` - Hook state management pattern

### With Existing Error Patterns
Follow patterns from:
- `PreviewSaveStep.tsx` - Inline error box with dismiss
- API routes - `{ success: false, error, code }` format
- `TranslationResult<T>` type - Discriminated union for results

---

## Testing Requirements

### Unit Tests

| Test | Location | Coverage |
|------|----------|----------|
| Error message mapping | `errorMessages.test.ts` | All error codes return appropriate messages |
| Retry button states | `RetryButton.test.tsx` | Loading, disabled, click handler |
| Error toast display | `TranslationErrorToast.test.tsx` | Show, auto-dismiss, manual dismiss, retry |
| Hook loading states | `useTranslationStatus.test.ts` | Initial load, refresh, error, retry |

### Integration Tests

| Test | Description |
|------|-------------|
| Preview panel loading | Panel shows skeleton, then real content |
| Widget error recovery | Widget shows error, user clicks retry, data loads |
| Editor save error | Save fails, error shows, retry succeeds |
| Bulk operation partial failure | Some items fail, retry failed button works |

### Accessibility Tests

| Test | Description |
|------|-------------|
| Screen reader announcements | Loading and error states announced |
| Focus management | Focus moves to error, returns on dismiss |
| Keyboard navigation | Retry buttons accessible via keyboard |

---

## Visual Specifications

### Loading States

| Component | Loading Indicator | Duration |
|-----------|-------------------|----------|
| TranslationPreviewPanel | 6 skeleton rows | Min 300ms |
| TranslationStatusWidget | Shimmer progress + 4 skeleton counts | Min 300ms |
| TranslationStatusColumn | 6 gray pulsing dots | Until data |
| TranslationEditor | Full overlay with centered spinner | Until complete |
| LanguagePreferenceSection | Spinner in save button | Until complete |
| BulkTranslationBar | "Processing X of Y..." | Until complete |

### Error States

| Error Type | Display | Color | Action |
|------------|---------|-------|--------|
| Transient (network, timeout) | Toast notification | Red/Orange border | Auto-dismiss + Retry |
| Contextual (validation) | Inline alert | Red background | Dismiss |
| Permission (403) | Inline alert | Red background | Dismiss only |
| Critical (boundary) | Full component fallback | Muted gray | Reload page |

### Tailwind Classes Reference

```typescript
// Loading skeleton
'animate-pulse bg-gray-200 rounded'

// Loading spinner
'animate-spin' // with Loader2 icon

// Error box
'p-4 bg-red-50 border border-red-200 rounded-lg'

// Error text
'text-red-600 text-sm'

// Retry button (link style)
'text-red-700 underline text-sm hover:text-red-800'

// Disabled button
'opacity-50 cursor-not-allowed'
```

---

## Acceptance Criteria Mapping

| PRD/Request Criteria | Implementation Task |
|----------------------|---------------------|
| TranslationPreviewPanel displays skeleton loader | Task 4.1 |
| TranslationStatusWidget shows shimmer effect | Task 4.2 |
| TranslationStatusColumn displays loading dots | Task 1.3 |
| Language preference dropdown shows spinner | Task 4.4 |
| Translation editor displays loading overlay | Task 4.3 |
| Bulk translation bar shows progress indicator | Task 4.5 |
| API mutation operations disable buttons | All Task 4.x |
| Disabled buttons display loading spinner | All Task 4.x |
| Loading states use consistent component | Task 1.1-1.3 |
| Loading indicators maintain minimum 300ms | Task 4.1-4.5 |
| Error messages display in toast for transient | Task 2.1 |
| Error messages display as inline alerts | Task 2.2 |
| Error messages avoid technical jargon | Task 2.3 |
| 403 errors display permission message | Task 2.3 |
| 404 errors display not found message | Task 2.3 |
| 500 errors display server error message | Task 2.3 |
| Network timeout errors display message | Task 2.3 |
| Every error state includes retry button | Task 5.1 |
| Retry implements exponential backoff | Task 3.1 |
| Maximum retry attempts limited to 3 | Task 3.1 |
| Translation status fetch failures show retry | Task 4.1 |
| Translation save failures keep modal open | Task 4.3 |
| Bulk operation failures show breakdown | Task 4.5 |
| Partial bulk failures allow retry of failed only | Task 5.3 |
| Language preference save failures revert | Task 4.4 |
| Realtime subscription errors show warning | Task 3.2 |
| Subscription reconnection automatic | Task 3.2 |
| Loading skeletons prevent layout shift | Task 1.1-1.3 |
| Error boundaries catch React errors | Task 7.1 |
| All async operations include timeout | Task 3.1 |
| Loading states accessible with ARIA | Task 6.1 |
| Screen readers announce states | Task 6.1 |
| Color not only indicator of errors | Task 6.3 |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Inconsistent loading indicators | Medium | Medium | Create shared components, document patterns |
| Poor error message mapping | Low | High | Centralized error utility, comprehensive mapping |
| Retry storms on server issues | Low | Medium | Exponential backoff, max attempts limit |
| Layout shift from loading states | Medium | Low | Fixed dimensions, skeleton matching loaded size |
| Toast notification conflicts | Low | Low | Queue management, stacking behavior |
| Accessibility gaps in error states | Medium | Medium | Focus management, ARIA attributes, testing |

---

## Notes

- **No toast library exists** in current codebase. Error toasts will be implemented as custom component.
- **Existing retry library** in `/src/lib/translation-service/utils/retry.ts` should be reused.
- **Loading minimum duration** of 300ms prevents flashing on fast connections.
- **Error boundaries** should not wrap entire pages, only translation management sections.
- **Partial bulk failures** should track which specific items failed for targeted retry.

---

## References

- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- Request Source: `/docs/gen_requests_epic5.md` - REQ-E05-031
- Existing LoadingState: `/src/components/ItemManager/components/shared/LoadingState.tsx`
- Existing Retry Utility: `/src/lib/translation-service/utils/retry.ts`
- Existing Error Pattern: `/src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx`
