# REQ-315: Create useTranslationRealtime Hook - Implementation Breakdown

**Document Created:** 2026-01-18
**Last Modified:** 2026-01-18
**Request ID:** REQ-315
**Type:** NEW FEATURE
**Size:** M (Medium)
**Phase:** 2 - Core UI Components
**Task ID:** 2.7
**Epic:** L10N Epic 5 - Owner Translation Management
**Implementation Plan Reference:** `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`

---

## Summary

Create a React hook that establishes Supabase realtime subscriptions to translation table changes, enabling automatic UI updates when translations complete, fail, or change status without requiring manual page refresh.

---

## Background and Context

### Current State

No realtime subscription mechanism exists in the FAQBNB codebase to push translation status updates to the client. The existing hooks (`useDashboardStats`, `usePropertyItemCounts`, etc.) all rely on manual fetch calls with polling or explicit refresh triggers. Property owners currently have no way to see live translation progress.

### Business Need

Property owners who request translations or re-translations need immediate visual feedback when processing completes. The current requirement to manually refresh eliminates user confidence that their requests are being processed and creates frustration during translation workflows.

### Dependencies

| Dependency | Source | Required |
|------------|--------|----------|
| Translation tables | Epic 1 Foundation | Yes - `article_translations`, `item_translations`, `link_translations` |
| Translation status enum | Epic 1 Foundation | Yes - `'pending' | 'processing' | 'completed' | 'failed' | 'manual'` |
| Supabase client | `/src/lib/supabase.ts` | Yes - Browser client with auth |
| AuthContext | `/src/contexts/AuthContext.tsx` | Yes - Current user/account |
| TranslationManagement types | Task 2.1 (REQ-309) | Yes - Shared type definitions |

---

## Technical Design

### Hook Interface

```typescript
// File: /src/hooks/useTranslationRealtime.ts

/**
 * REQ-315: Realtime subscription hook for translation status updates
 *
 * Establishes Supabase realtime subscriptions to translation table changes,
 * filtered by the authenticated user's account. Automatically updates local
 * state when translations are inserted, updated, or deleted.
 */

interface UseTranslationRealtimeOptions {
  /** Specific entity ID to scope subscription (optional) */
  entityId?: string;
  /** Entity type filter: 'article' | 'item' | 'link' | 'all' */
  entityType?: 'article' | 'item' | 'link' | 'all';
  /** Property ID to scope subscription (optional) */
  propertyId?: string;
  /** Whether the subscription is enabled (default: true) */
  enabled?: boolean;
  /** Callback fired when any translation event is received */
  onTranslationEvent?: (event: TranslationRealtimeEvent) => void;
}

interface TranslationRealtimeEvent {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  table: 'article_translations' | 'item_translations' | 'link_translations';
  entityId: string;
  language: SupportedLanguage;
  oldRecord?: TranslationRecord;
  newRecord?: TranslationRecord;
  timestamp: string;
}

interface TranslationRecord {
  id: string;
  entityId: string;
  language: SupportedLanguage;
  status: TranslationStatusType;
  content?: TranslationContent;
  translatedAt?: string;
  reviewedBy?: string;
  isStale?: boolean;
}

interface UseTranslationRealtimeReturn {
  /** Whether the subscription is currently connected */
  isConnected: boolean;
  /** Current connection status: 'connecting' | 'connected' | 'disconnected' | 'error' */
  connectionStatus: ConnectionStatus;
  /** Most recent events received (last 10) */
  recentEvents: TranslationRealtimeEvent[];
  /** Error details if connection failed */
  error: string | null;
  /** Manually reconnect the subscription */
  reconnect: () => void;
  /** Disconnect the subscription */
  disconnect: () => void;
}
```

### Supabase Realtime Channel Structure

```typescript
// Channel naming convention for filtering
const channelName = `translation-updates:${accountId}:${entityType}:${entityId || 'all'}`;

// Subscribe to multiple tables through a single channel
const channel = supabase
  .channel(channelName)
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'article_translations',
      filter: `account_id=eq.${accountId}`
    },
    handleArticleTranslationChange
  )
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'item_translations',
      filter: `account_id=eq.${accountId}`
    },
    handleItemTranslationChange
  )
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'link_translations',
      filter: `account_id=eq.${accountId}`
    },
    handleLinkTranslationChange
  )
  .subscribe((status) => {
    if (status === 'SUBSCRIBED') {
      setConnectionStatus('connected');
      setIsConnected(true);
    }
  });
```

### State Management

```typescript
interface RealtimeState {
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  recentEvents: TranslationRealtimeEvent[];
  error: string | null;
  subscriptionId: string | null;
}
```

### Cleanup Pattern

The hook must properly unsubscribe when:
1. Component unmounts
2. Parameters (entityId, propertyId, entityType) change
3. User calls `disconnect()`
4. Authentication state changes (user logs out)

```typescript
useEffect(() => {
  if (!enabled || !accountId) return;

  const channel = setupChannel();

  return () => {
    console.log(`${DEBUG_PREFIX} Cleanup: unsubscribing from channel`);
    supabase.removeChannel(channel);
  };
}, [accountId, entityId, propertyId, entityType, enabled]);
```

---

## Implementation Tasks

### Task 2.7.1: Create hook file with type definitions
**Estimated Effort:** 0.5 story points

Create the base hook file with all TypeScript interfaces and type definitions.

**Acceptance Criteria:**
- [ ] Hook file created at `/src/hooks/useTranslationRealtime.ts`
- [ ] All interface definitions exported
- [ ] JSDoc comments for all public types
- [ ] `'use client'` directive at top of file

### Task 2.7.2: Implement Supabase channel subscription setup
**Estimated Effort:** 1 story point

Implement the core channel subscription logic with multi-table support.

**Acceptance Criteria:**
- [ ] Creates properly named channel based on parameters
- [ ] Subscribes to `article_translations`, `item_translations`, `link_translations` tables
- [ ] Applies account-based filtering via Supabase filter
- [ ] Handles all event types: INSERT, UPDATE, DELETE
- [ ] Updates connection status state correctly

### Task 2.7.3: Implement event handling and state updates
**Estimated Effort:** 1 story point

Create event handlers that process incoming realtime events and update local state.

**Acceptance Criteria:**
- [ ] Parses payload from Supabase realtime events
- [ ] Transforms database records to TypeScript types
- [ ] Maintains rolling buffer of recent events (last 10)
- [ ] Calls `onTranslationEvent` callback when provided
- [ ] Handles malformed payloads gracefully

### Task 2.7.4: Implement cleanup and resubscription logic
**Estimated Effort:** 0.5 story points

Ensure proper cleanup on unmount and parameter changes.

**Acceptance Criteria:**
- [ ] Removes channel on component unmount
- [ ] Resubscribes when entityId/propertyId/entityType change
- [ ] Implements `reconnect()` function
- [ ] Implements `disconnect()` function
- [ ] No memory leaks or orphaned subscriptions

### Task 2.7.5: Implement error handling and connection recovery
**Estimated Effort:** 0.5 story points

Handle connection errors and implement recovery mechanisms.

**Acceptance Criteria:**
- [ ] Detects and reports connection errors
- [ ] Sets appropriate error state with user-friendly message
- [ ] Supports manual reconnection via `reconnect()` function
- [ ] Logs errors with DEBUG_PREFIX pattern

### Task 2.7.6: Add debug logging and performance monitoring
**Estimated Effort:** 0.25 story points

Add comprehensive logging following codebase patterns.

**Acceptance Criteria:**
- [ ] Uses DEBUG_PREFIX pattern (`'🔄 TRANSLATION_REALTIME:'`)
- [ ] Logs subscription lifecycle events
- [ ] Logs received events (at appropriate verbosity)
- [ ] Does not impact performance in production

### Task 2.7.7: Export hook from index file
**Estimated Effort:** 0.25 story points

Ensure proper module exports.

**Acceptance Criteria:**
- [ ] Hook exported from `/src/hooks/useTranslationRealtime.ts`
- [ ] Types re-exported for consumers
- [ ] Import path works correctly in consuming components

---

## Authorized Files and Functions for Modification

### New Files (Create)

| File Path | Purpose |
|-----------|---------|
| `/src/hooks/useTranslationRealtime.ts` | Main hook implementation |

### Files to Modify

| File Path | Modification |
|-----------|--------------|
| `/src/types/index.ts` | Add `SupportedLanguage` and `TranslationStatusType` exports if not present |

### Dependencies Required (From Other Tasks)

| Dependency | Task | File Path |
|------------|------|-----------|
| `TranslationManagement.types.ts` | 2.1 (REQ-309) | `/src/components/TranslationManagement/TranslationManagement.types.ts` |
| Translation table columns | 1.4 (REQ-307) | Database migration |
| TypeScript database types | 1.5 (REQ-308) | `/src/lib/supabase.ts` |

---

## Integration Points

### Consuming Components

The hook will be used by:

1. **TranslationPreviewPanel** (Task 2.2)
   - Subscribe to updates for a specific entity
   - Auto-refresh UI when translation status changes

2. **TranslationStatusWidget** (Task 3.1)
   - Subscribe to property-wide translation updates
   - Update summary counts in real-time

3. **TranslationStatusColumn** (Task 3.2)
   - Subscribe to updates for items in view
   - Update status indicators as translations complete

### Usage Example

```tsx
// In TranslationPreviewPanel.tsx
import { useTranslationRealtime } from '@/hooks/useTranslationRealtime';
import { useTranslationStatus } from '@/hooks/useTranslationStatus';

export function TranslationPreviewPanel({ entityType, entityId }: Props) {
  const { data: translations, refresh } = useTranslationStatus({ entityId });

  // Subscribe to realtime updates for this specific entity
  const { isConnected, error } = useTranslationRealtime({
    entityId,
    entityType,
    onTranslationEvent: (event) => {
      // Refresh data when we receive an update
      refresh();
    }
  });

  return (
    <div>
      {!isConnected && <ConnectionWarning />}
      {/* ... panel content ... */}
    </div>
  );
}
```

---

## Testing Requirements

### Unit Tests

| Test Case | Description |
|-----------|-------------|
| Subscription creation | Verify channel is created with correct name and filters |
| Event handling | Verify INSERT/UPDATE/DELETE events are processed correctly |
| Cleanup on unmount | Verify channel is removed when component unmounts |
| Parameter change resubscription | Verify new subscription when entityId changes |
| Error state handling | Verify error state is set on connection failure |
| Callback invocation | Verify `onTranslationEvent` is called for each event |
| Disabled state | Verify no subscription when `enabled: false` |

### Integration Tests

| Test Case | Description |
|-----------|-------------|
| Full lifecycle | Subscribe → receive event → update state → unmount |
| Multiple instances | Multiple components using hook don't conflict |
| Auth context integration | Subscription uses correct account ID from auth |

### Mock Requirements

```typescript
// Mock Supabase realtime for testing
jest.mock('@/lib/supabase', () => ({
  supabase: {
    channel: jest.fn().mockReturnValue({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn().mockImplementation((callback) => {
        callback('SUBSCRIBED');
        return { unsubscribe: jest.fn() };
      })
    }),
    removeChannel: jest.fn()
  }
}));
```

---

## Acceptance Criteria (from REQ-315)

- [ ] Hook establishes Supabase realtime subscription when mounted
- [ ] Hook filters subscription to only receive updates for the authenticated user's account
- [ ] Hook accepts optional entity ID parameter to scope subscription to specific entity
- [ ] Hook accepts optional property ID parameter to scope subscription to specific property
- [ ] Hook automatically updates local state when translation insert events are received
- [ ] Hook automatically updates local state when translation update events are received
- [ ] Hook automatically updates local state when translation delete events are received
- [ ] Hook cleanly unsubscribes from realtime channel when component unmounts
- [ ] Hook resubscribes with new filters when parameters change
- [ ] Hook handles realtime connection errors gracefully without crashing
- [ ] Hook provides TypeScript types for subscription data payloads
- [ ] Hook can be used by multiple components simultaneously without conflicts
- [ ] UI components using the hook re-render automatically when translation status changes

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Supabase realtime reliability | Medium | Medium | Implement manual refresh fallback, show connection status indicator |
| Subscription filter performance | Low | Low | Use indexed columns (account_id) for filtering |
| Memory leaks from orphaned subscriptions | Medium | High | Comprehensive cleanup in useEffect, test with React DevTools |
| Multiple subscriptions consuming bandwidth | Low | Medium | Consolidate subscriptions where possible, use shared channel |
| RLS policies blocking realtime updates | Medium | High | Ensure RLS allows SELECT for authenticated users on translation tables |

---

## Performance Considerations

1. **Channel Reuse**: Multiple components subscribing to the same entity should share a channel if possible (future optimization)
2. **Event Batching**: Consider debouncing rapid-fire events to reduce re-renders
3. **Selective Re-rendering**: Only trigger re-renders for relevant status changes
4. **Connection Pooling**: Supabase handles this, but monitor connection count in production

---

## Related Documentation

- [Supabase Realtime Documentation](https://supabase.com/docs/guides/realtime)
- [Supabase Realtime Postgres Changes](https://supabase.com/docs/guides/realtime/postgres-changes)
- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- PRD: `/docs/prd/PRD_L10N_Epic5_Owner_Translation_Management.md`

---

## Effort Estimate

| Task | Estimate |
|------|----------|
| Task 2.7.1: Type definitions | 0.5 SP |
| Task 2.7.2: Channel subscription | 1.0 SP |
| Task 2.7.3: Event handling | 1.0 SP |
| Task 2.7.4: Cleanup logic | 0.5 SP |
| Task 2.7.5: Error handling | 0.5 SP |
| Task 2.7.6: Debug logging | 0.25 SP |
| Task 2.7.7: Exports | 0.25 SP |
| **Total** | **4.0 SP** |

---

## Appendix: Existing Hook Patterns Reference

### Pattern from `useDashboardStats.ts`

```typescript
// State structure pattern
interface UseHookState {
  data: DataType | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  lastUpdated: number | null;
}

// Cleanup pattern with stale flag
useEffect(() => {
  let isStale = false;
  doFetch();
  return () => { isStale = true; };
}, [dependencies]);

// Debug logging pattern
const DEBUG_PREFIX = '📊 DASHBOARD_STATS_HOOK:';
console.log(`${DEBUG_PREFIX} fetchStats called`, { isRefresh });
```

### Supabase Client Usage

```typescript
// From /src/lib/supabase.ts
import { supabase } from '@/lib/supabase';

// Client is already configured with auth persistence
// Use for realtime subscriptions:
const channel = supabase.channel('my-channel');
```
