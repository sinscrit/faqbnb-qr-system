# REQ-E05-011: Create useTranslationRealtime Hook - Implementation Overview

**Request ID:** REQ-E05-011
**Date:** 2026-01-20
**Type:** NEW FEATURE
**Size:** M
**Phase:** 2 - Core UI Components
**Task ID:** 2.7
**Epic:** L10N Epic 5 - Owner Translation Management
**Last Modified:** 2026-01-20 18:45 UTC

---

## Summary

Create a React hook that subscribes to Supabase Realtime channels to receive instant translation status updates when translations complete or fail, eliminating the need for polling intervals and providing a responsive, live user experience.

---

## Background & Context

### Problem Statement
Currently, translation status information only updates when components explicitly refetch data through polling intervals or manual refresh actions. This creates several issues:
- Delays in reflecting completed translations
- Unnecessary server load through frequent polling requests
- A stale feeling interface that doesn't match modern web application expectations

### Dependencies
- **Epic 1 (Foundation):** Translation tables (`item_translations`, `article_translations`, `link_translations`) must exist with appropriate schemas
- **Epic 3 (Dynamic Content Translation):** Translation job processing system that updates translation records
- **Epic 5 Task 2.6:** `useTranslationStatus` hook for initial data fetching (complementary hook)
- **Supabase Realtime:** Must be enabled for the relevant translation tables via Publications

### Related Documents
- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- Request Source: `/docs/gen_requests_epic5.md` (REQ-E05-012)

---

## Technical Approach

### Architecture Overview

The hook will create Supabase Realtime channel subscriptions that listen for Postgres changes (INSERT/UPDATE events) on translation tables. When a translation record is created or updated, the hook will:

1. Filter events based on provided entity reference or property scope
2. Debounce rapid successive updates to prevent excessive re-renders
3. Trigger a callback function with the updated translation data
4. Provide connection status indicators for UI feedback

### Data Flow

```
Translation Job Completes
    │
    ▼
Database UPDATE/INSERT on translation table
    │
    ▼
Supabase Realtime broadcasts postgres_changes event
    │
    ▼
useTranslationRealtime hook receives event
    │
    ├── Filter by entity reference / property scope
    │
    ├── Debounce (100ms)
    │
    └── Execute callback with updated translation record
         │
         └── UI updates instantly (e.g., progress bar, status indicator)
```

### Supabase Realtime Channel Pattern (JavaScript/TypeScript)

Based on Supabase documentation, the channel subscription pattern for Postgres changes:

```typescript
const channel = supabase
  .channel('translation-updates')
  .on(
    'postgres_changes',
    {
      event: '*',        // Listen to INSERT and UPDATE
      schema: 'public',
      table: 'item_translations',
      filter: 'item_id=eq.{entityId}'  // Optional row-level filter
    },
    (payload) => handleTranslationUpdate(payload)
  )
  .subscribe()
```

---

## Existing Patterns to Follow

### Hook Structure Pattern
File: `/src/hooks/useDashboardStats.ts`
- Uses `useState` for managing loading, error, and data states
- Implements cleanup via `isStale` flag pattern for race conditions
- Uses `useCallback` for memoized functions
- Includes DEBUG_PREFIX logging pattern

### Hook Structure Pattern
File: `/src/hooks/useLanguagePreference.ts`
- Exports constants and types alongside the hook
- Uses clear JSDoc comments
- Handles client-side only operations with `'use client'` directive
- Implements optimistic updates with rollback on error

### Supabase Client Access
File: `/src/lib/supabase.ts`
- Browser client exported as `supabase` for realtime subscriptions
- Database types include translation tables: `item_translations`, `article_translations`, `link_translations`
- Translation status values: `'pending' | 'processing' | 'completed' | 'failed' | 'manual'`

### Language Constants
File: `/src/hooks/useLanguagePreference.ts`
- `SUPPORTED_LANGUAGES = ['en', 'fr', 'es', 'de', 'nl', 'it']`
- `SupportedLanguage` type already defined

---

## Implementation Tasks

### Task 1: Create Hook File Structure
Create `/src/hooks/useTranslationRealtime.ts` with:
- `'use client'` directive (client-side only)
- Type definitions for parameters and return values
- Export interface `UseTranslationRealtimeOptions`
- Export interface `UseTranslationRealtimeReturn`
- Export type `ConnectionStatus`

### Task 2: Implement Connection Management
- Create channel subscription on mount
- Implement connection status tracking (`'connecting' | 'connected' | 'disconnected' | 'error'`)
- Handle subscription lifecycle (subscribe on mount, unsubscribe on unmount)
- Re-establish subscription when parameters change

### Task 3: Implement Event Filtering
- Subscribe to `postgres_changes` for translation tables:
  - `item_translations`
  - `article_translations`
  - `link_translations`
- Filter events by:
  - Entity reference (`entityType` + `entityId`) for single-entity subscriptions
  - Property ownership for property-wide subscriptions
- Support both INSERT and UPDATE events

### Task 4: Implement Debouncing
- Debounce rapid successive updates (100ms default)
- Use timer-based debounce pattern
- Clear pending debounce timers on unmount/parameter change

### Task 5: Implement Callback Execution
- Execute user-provided callback with updated translation record
- Transform Supabase payload to standardized translation update format
- Handle cases where callback is not provided (passive subscription)

### Task 6: Implement Cleanup & Error Handling
- Proper cleanup on unmount (remove channel subscription)
- Handle disconnection and automatic reconnection scenarios
- Handle subscription errors gracefully without crashing component
- Clear pending timers and subscriptions when parameters change

### Task 7: Add React StrictMode Compatibility
- Handle double-mounting in development mode
- Prevent duplicate subscriptions

---

## Authorized Files and Functions for Modification

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/hooks/useTranslationRealtime.ts` | Main hook implementation |

### Files to Modify

| File Path | Changes |
|-----------|---------|
| `/src/types/index.ts` | Add export for translation realtime types if needed |

### Dependencies Used (Existing)

| File Path | Usage |
|-----------|-------|
| `/src/lib/supabase.ts` | Import `supabase` client for realtime subscriptions |
| `/src/hooks/useLanguagePreference.ts` | Reference `SupportedLanguage` type |

---

## Interface Specifications

### Hook Parameters

```typescript
interface UseTranslationRealtimeOptions {
  /** Entity type for single-entity subscriptions */
  entityType?: 'item' | 'article' | 'link';

  /** Entity ID for single-entity subscriptions */
  entityId?: string;

  /** Property ID for property-wide subscriptions */
  propertyId?: string;

  /** Callback when translation update is received */
  onUpdate?: (update: TranslationRealtimeUpdate) => void;

  /** Whether the subscription is enabled (default: true) */
  enabled?: boolean;

  /** Debounce interval in ms (default: 100) */
  debounceMs?: number;
}
```

### Hook Return Value

```typescript
interface UseTranslationRealtimeReturn {
  /** Current connection status */
  connectionStatus: ConnectionStatus;

  /** Manually reconnect if disconnected */
  reconnect: () => void;

  /** Pause subscriptions (e.g., when tab is hidden) */
  pause: () => void;

  /** Resume subscriptions */
  resume: () => void;

  /** Whether subscription is currently active */
  isSubscribed: boolean;
}

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';
```

### Translation Update Payload

```typescript
interface TranslationRealtimeUpdate {
  /** Event type */
  eventType: 'INSERT' | 'UPDATE';

  /** Entity type that was updated */
  entityType: 'item' | 'article' | 'link';

  /** Entity ID that was updated */
  entityId: string;

  /** Language code */
  language: SupportedLanguage;

  /** New translation status */
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'manual';

  /** Full translation record from database */
  record: TranslationRecord;

  /** Timestamp of the update */
  timestamp: string;
}

interface TranslationRecord {
  id: string;
  language: string;
  translation_status: string;
  translated_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  // Content fields vary by entity type
  [key: string]: unknown;
}
```

---

## Usage Examples

### Single Entity Subscription

```tsx
// In TranslationPreviewPanel component
const { connectionStatus, isSubscribed } = useTranslationRealtime({
  entityType: 'article',
  entityId: articleId,
  onUpdate: (update) => {
    // Refresh status display when translation completes
    if (update.status === 'completed' || update.status === 'failed') {
      refetchTranslationStatus();
    }
  },
});
```

### Property-Wide Subscription

```tsx
// In TranslationStatusWidget (dashboard)
const { connectionStatus } = useTranslationRealtime({
  propertyId: selectedPropertyId,
  onUpdate: (update) => {
    // Update summary counts when any translation changes
    updateTranslationCounts(update);
  },
});
```

### Integration with useTranslationStatus

```tsx
function TranslationPreviewPanel({ entityType, entityId }) {
  // Initial data fetch + polling fallback
  const { data, isLoading, refresh } = useTranslationStatus({
    entityType,
    entityId,
  });

  // Realtime updates
  useTranslationRealtime({
    entityType,
    entityId,
    onUpdate: () => {
      // Trigger refresh when realtime update received
      refresh();
    },
  });

  return (/* ... */);
}
```

---

## Technical Considerations

### Supabase Realtime Prerequisites
1. Translation tables must be added to `supabase_realtime` publication:
   ```sql
   ALTER PUBLICATION supabase_realtime ADD TABLE item_translations;
   ALTER PUBLICATION supabase_realtime ADD TABLE article_translations;
   ALTER PUBLICATION supabase_realtime ADD TABLE link_translations;
   ```

2. Row Level Security policies must allow SELECT for the authenticated user on translation tables

### Performance Considerations
- Channel subscriptions are lightweight but should be cleaned up properly
- Debouncing prevents UI thrashing during rapid translation completions
- Consider using a single shared channel for multiple components subscribing to the same entity

### Error Recovery
- Automatic reconnection handled by Supabase client
- Manual `reconnect()` function for user-triggered recovery
- Graceful degradation: if realtime fails, components fall back to polling via `useTranslationStatus`

### Browser Visibility (Optional Enhancement)
- Consider pausing subscriptions when tab is not visible to save resources
- Use `document.visibilitychange` event listener
- Resume subscriptions when tab becomes visible again

---

## Acceptance Criteria Mapping

| Acceptance Criteria | Implementation |
|---------------------|----------------|
| Hook file created at `/src/hooks/useTranslationRealtime.ts` | Task 1 |
| Hook accepts entity reference parameters (entityType and entityId) | Task 3 |
| Hook accepts propertyId parameter for property-wide subscriptions | Task 3 |
| Hook accepts optional callback function for updates | Task 5 |
| Hook creates Supabase Realtime channel subscription on mount | Task 2 |
| Hook subscribes to INSERT events on translation tables | Task 3 |
| Hook subscribes to UPDATE events on translation tables | Task 3 |
| Hook filters events to match provided entity reference | Task 3 |
| Hook triggers callback with updated translation record | Task 5 |
| Hook unsubscribes from channel when component unmounts | Task 6 |
| Hook re-establishes subscription when parameters change | Task 2 |
| Hook handles subscription errors gracefully | Task 6 |
| Hook debounces rapid successive updates (100ms) | Task 4 |
| Hook provides connection status indicator | Task 2 |
| Hook cleans up pending timers on unmount | Task 6 |
| Hook works correctly with React StrictMode | Task 7 |
| Hook prevents memory leaks through proper cleanup | Task 6 |
| TypeScript type definitions included | Task 1 |

---

## Testing Considerations

### Unit Tests
- Mock Supabase realtime channel
- Test subscription lifecycle (mount/unmount)
- Test parameter changes trigger resubscription
- Test debounce behavior
- Test callback execution with various payloads
- Test error handling scenarios

### Integration Tests
- Test with actual Supabase realtime (test environment)
- Verify events received when database updates occur
- Test reconnection after disconnect

---

## Out of Scope

- Admin/cross-property subscriptions (only owner's content)
- Tag translation realtime updates (lower priority)
- Translation job queue monitoring (separate feature)
- Batch subscription optimization (future enhancement)

---

## References

- [Supabase Realtime Postgres Changes](https://supabase.com/docs/guides/realtime/postgres-changes)
- [Supabase JavaScript Client Realtime](https://supabase.com/docs/reference/javascript/subscribe)
- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- Related Hook: `/src/hooks/useDashboardStats.ts`
- Supabase Client: `/src/lib/supabase.ts`
