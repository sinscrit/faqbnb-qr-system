# REQ-314: Create useTranslationStatus Hook - Implementation Overview

**Document Version:** 1.0
**Created:** 2026-01-18 16:00:00 UTC
**Last Modified:** 2026-01-18 16:00:00 UTC
**Request Reference:** docs/gen_requests_epic5.md - Request #314
**Implementation Plan Reference:** docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md
**Epic:** L10N Epic 5 - Owner Translation Management
**Phase:** 2 - Core UI Components
**Task ID:** 2.6

---

## 1. Summary

Create a custom React hook `useTranslationStatus` that provides a standardized way to fetch translation status data from the backend API. The hook supports both single-entity queries (fetching translation status for a specific item, article, or link) and property-wide aggregate queries (fetching translation status for all translatable content within a property).

This hook follows existing codebase patterns from `useDashboardStats` and `usePropertyItemCounts`, implementing proper loading states, error handling, stale result prevention, and TypeScript type safety.

---

## 2. Dependencies

### Epic Dependencies (Required Before Implementation)
| Dependency | Source | Status | Description |
|------------|--------|--------|-------------|
| Translation tables | Epic 1 (Foundation) | Required | Tables: `article_translations`, `item_translations`, `link_translations` |
| Translation status API | REQ-304 (Epic 5 Task 1.1) | Required | `GET /api/translations/status` endpoint |
| TranslationManagement types | REQ-309 (Epic 5 Task 2.1) | Required | Shared type definitions |

### Package Dependencies (Already in Project)
| Package | Version | Usage |
|---------|---------|-------|
| React | 19.x | useState, useEffect, useCallback |
| TypeScript | 5.x | Type definitions |

---

## 3. Technical Context

### Existing Hook Patterns to Follow

**Primary Reference:** `src/hooks/useDashboardStats.ts`
- Demonstrates API fetching with authentication
- Uses `apiRequest()` wrapper from `@/lib/api`
- Implements stale flag pattern for race condition prevention
- Separates `isLoading` (initial) from `isRefreshing` (manual refresh)

**Secondary Reference:** `src/hooks/usePropertyItemCounts.ts`
- Demonstrates property-based filtering
- Shows parallel fetching pattern with `Promise.all()`
- Uses mounted ref to prevent state updates after unmount

### API Utility Reference
**File:** `src/lib/api.ts`
- `apiRequest<T>(endpoint, options, requireAuth)` - Central API wrapper
- `ApiError` class with `isAuthError()` and `isRetryable()` methods
- Automatic session refresh on 401/403 responses

---

## 4. API Contract

### Translation Status API (from REQ-304)

```typescript
// GET /api/translations/status
// Query Parameters:
//   entityType?: 'article' | 'item' | 'link'
//   entityId?: string (UUID)
//   status?: 'pending' | 'processing' | 'completed' | 'failed' | 'manual'
//   propertyId?: string (UUID)

interface TranslationStatusResponse {
  success: boolean;
  data?: {
    summary: {
      total: number;
      complete: number;
      partial: number;
      pending: number;
      failed: number;
    };
    items: TranslationStatusItem[];
  };
  error?: string;
}

interface TranslationStatusItem {
  entityType: 'article' | 'item' | 'link';
  entityId: string;
  name: string;
  sourceLanguage: SupportedLanguage;
  translations: {
    [K in SupportedLanguage]?: {
      status: 'pending' | 'processing' | 'completed' | 'failed' | 'manual';
      isStale?: boolean;
      translatedAt?: string;
      reviewedBy?: string;
    };
  };
}

type SupportedLanguage = 'en' | 'fr' | 'es' | 'de' | 'nl' | 'it';
```

---

## 5. Hook Interface Design

### Input Parameters

```typescript
interface UseTranslationStatusOptions {
  /** Entity ID for single-entity query. Mutually exclusive with propertyId for different query modes. */
  entityId?: string;

  /** Entity type when querying single entity */
  entityType?: 'article' | 'item' | 'link';

  /** Property ID for property-wide aggregate query */
  propertyId?: string;

  /** Optional status filter */
  status?: 'pending' | 'processing' | 'completed' | 'failed' | 'manual';

  /** Whether to auto-fetch on mount (default: true) */
  autoFetch?: boolean;
}
```

### Return Interface

```typescript
interface UseTranslationStatusReturn {
  /** Translation status data (null during loading or error) */
  data: TranslationStatusData | null;

  /** Initial loading state */
  isLoading: boolean;

  /** Manual refresh loading state */
  isRefreshing: boolean;

  /** Error message if request failed */
  error: string | null;

  /** Timestamp of last successful fetch */
  lastUpdated: Date | null;

  /** Manually trigger a refresh */
  refresh: () => Promise<void>;

  /** Reset state and clear data */
  reset: () => void;
}

interface TranslationStatusData {
  summary: TranslationSummary;
  items: TranslationStatusItem[];
}

interface TranslationSummary {
  total: number;
  complete: number;
  partial: number;
  pending: number;
  failed: number;
}
```

---

## 6. Implementation Tasks

### Task 6.1: Create Hook File Structure
**File:** `src/hooks/useTranslationStatus.ts`

Create the hook file with:
- 'use client' directive for Next.js App Router
- Import statements for React hooks and API utilities
- Debug prefix constant for logging consistency

### Task 6.2: Define TypeScript Interfaces
Define all interfaces locally in the hook file (will later import from shared types file):
- `UseTranslationStatusOptions` - Input parameters
- `UseTranslationStatusState` - Internal state
- `UseTranslationStatusReturn` - Public return type
- `TranslationStatusData` - Data structure
- `TranslationStatusItem` - Individual item structure

### Task 6.3: Implement Core State Management
Implement internal state using `useState<UseTranslationStatusState>`:
```typescript
const [state, setState] = useState<UseTranslationStatusState>({
  data: null,
  isLoading: autoFetch,
  isRefreshing: false,
  error: null,
  lastUpdated: null
});
```

### Task 6.4: Implement Fetch Function
Create `fetchStatus` callback with:
- Build query string from options (entityId, entityType, propertyId, status)
- Call `apiRequest<TranslationStatusResponse>` with `requireAuth: true`
- Handle success/error responses
- Update state appropriately
- Support `isRefresh` flag for differentiating initial load vs. refresh

### Task 6.5: Implement Stale Result Prevention
Add useEffect with stale flag pattern (per `useDashboardStats` pattern):
```typescript
useEffect(() => {
  let isStale = false;

  if (autoFetch) {
    doFetch();
  }

  return () => { isStale = true; };
}, [entityId, entityType, propertyId, status]);
```

### Task 6.6: Implement Refresh Function
Create memoized `refresh` callback:
- Check if already refreshing (prevent duplicate calls)
- Call `fetchStatus(true)` for refresh mode
- Log refresh attempts for debugging

### Task 6.7: Implement Reset Function
Create memoized `reset` callback:
- Reset state to initial values
- Clear data, error, and timestamps

### Task 6.8: Add JSDoc Documentation
Add comprehensive JSDoc comments:
- Hook description with usage examples
- Parameter documentation
- Return value documentation
- Cross-references to related components

---

## 7. Usage Examples

### Single Entity Query
```tsx
// Fetch translation status for a specific article
const { data, isLoading, error } = useTranslationStatus({
  entityId: articleId,
  entityType: 'article'
});

if (isLoading) return <Spinner />;
if (error) return <ErrorMessage>{error}</ErrorMessage>;

return (
  <TranslationPreviewPanel
    translations={data?.items[0]?.translations}
    summary={data?.summary}
  />
);
```

### Property-Wide Query
```tsx
// Fetch translation status for all entities in a property
const { data, isLoading, refresh } = useTranslationStatus({
  propertyId: selectedPropertyId
});

return (
  <TranslationStatusWidget
    summary={data?.summary}
    isLoading={isLoading}
    onRefresh={refresh}
  />
);
```

### With Status Filter
```tsx
// Fetch only failed translations
const { data } = useTranslationStatus({
  propertyId: selectedPropertyId,
  status: 'failed'
});
```

### Manual Fetch Control
```tsx
// Disable auto-fetch, manually control when to fetch
const { data, refresh, isLoading } = useTranslationStatus({
  autoFetch: false
});

const handleViewTranslations = useCallback(async () => {
  await refresh();
  setShowPanel(true);
}, [refresh]);
```

---

## 8. Error Handling Strategy

### Error Types to Handle
| Error Type | HTTP Status | User Message | Action |
|------------|-------------|--------------|--------|
| Authentication | 401/403 | "Please log in to view translations" | Redirect to login (handled by `apiRequest`) |
| Not Found | 404 | "Translation data not found" | Show empty state |
| Server Error | 500 | "Unable to load translations. Please try again." | Show retry button |
| Network Error | N/A | "Network error. Check your connection." | Show retry button |

### Error State Management
```typescript
catch (error) {
  if (isStale) return; // Don't update state if stale

  const errorMessage = error instanceof ApiError
    ? error.message
    : error instanceof Error
      ? error.message
      : 'An unexpected error occurred';

  setState(prev => ({
    ...prev,
    isLoading: false,
    isRefreshing: false,
    error: errorMessage
  }));
}
```

---

## 9. Authorized Files and Functions for Modification

### Files to CREATE

| File Path | Purpose |
|-----------|---------|
| `src/hooks/useTranslationStatus.ts` | Main hook implementation |

### Files to MODIFY

| File Path | Modification |
|-----------|--------------|
| `src/hooks/index.ts` | Export `useTranslationStatus` (if index exists) |

### Functions/Interfaces to USE (Read-Only Reference)

| File | Function/Interface | Usage |
|------|-------------------|-------|
| `src/lib/api.ts` | `apiRequest<T>()` | API fetching with auth |
| `src/lib/api.ts` | `ApiError` | Error type checking |
| `src/components/TranslationManagement/TranslationManagement.types.ts` | Type definitions | Import shared types (when available) |

---

## 10. Testing Considerations

### Unit Test Scenarios
1. **Initial fetch on mount** - Verify `isLoading` starts true, data populates on success
2. **Manual refresh** - Verify `isRefreshing` flag, prevents duplicate calls
3. **Stale result prevention** - Verify rapid parameter changes don't cause race conditions
4. **Error handling** - Verify error state for various failure scenarios
5. **autoFetch=false** - Verify no fetch on mount, manual refresh works
6. **Parameter changes** - Verify refetch when entityId/propertyId changes

### Mock Requirements
- Mock `apiRequest` from `@/lib/api`
- Mock successful responses with various data shapes
- Mock error responses (401, 404, 500, network errors)

---

## 11. Acceptance Criteria Verification

| Criteria | Implementation |
|----------|----------------|
| Hook accepts optional entity ID parameter | `options.entityId?: string` |
| Hook accepts optional property ID parameter | `options.propertyId?: string` |
| Hook returns loading boolean | `return { isLoading, isRefreshing }` |
| Hook returns error object | `return { error: string \| null }` |
| Hook returns data object | `return { data: TranslationStatusData \| null }` |
| Hook automatically refetches on parameter change | useEffect dependency array |
| Hook handles authentication errors | ApiError + apiRequest handling |
| Hook handles network failures gracefully | try/catch with error state |
| Hook provides TypeScript types | Full interface definitions |
| Hook supports multiple simultaneous consumers | Stateless hook pattern |

---

## 12. Related Documentation

- **Epic 5 Implementation Plan:** `docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- **Translation Status API Request:** `docs/gen_requests_epic5.md` (REQ-304)
- **Type Definitions Request:** `docs/gen_requests_epic5.md` (REQ-309)
- **Pattern Reference:** `src/hooks/useDashboardStats.ts`
- **API Utility Reference:** `src/lib/api.ts`

---

## 13. Implementation Checklist

- [ ] Create `src/hooks/useTranslationStatus.ts` file
- [ ] Add 'use client' directive
- [ ] Define TypeScript interfaces for options, state, and return types
- [ ] Implement `useState` for internal state management
- [ ] Implement `fetchStatus` callback with API integration
- [ ] Implement stale result prevention with useEffect
- [ ] Implement `refresh` callback with duplicate call prevention
- [ ] Implement `reset` callback
- [ ] Add comprehensive JSDoc documentation
- [ ] Add debug logging with consistent prefix
- [ ] Export hook from hooks index (if applicable)
- [ ] Verify TypeScript compilation passes
- [ ] Test basic functionality in development

---

*Document generated for FAQBNB L10N Epic 5 - Owner Translation Management implementation.*
