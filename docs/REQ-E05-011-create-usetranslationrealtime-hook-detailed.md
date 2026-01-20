# REQ-E05-011: Create useTranslationRealtime Hook - Detailed Task Breakdown

**Request ID:** REQ-E05-011
**Date:** 2026-01-20
**Type:** NEW FEATURE
**Size:** M
**Phase:** 2 - Core UI Components
**Task ID:** 2.7
**Epic:** L10N Epic 5 - Owner Translation Management
**Last Modified:** 2026-01-20 19:30 UTC

---

## Document References

- **Overview Document:** `/docs/REQ-E05-011-create-usetranslationrealtime-hook-overview.md`
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- **Requirements Source:** `/docs/gen_requests_epic5.md` (REQ-E05-012)

---

## Summary

Create a React hook that subscribes to Supabase Realtime channels to receive instant translation status updates when translations complete or fail, eliminating the need for polling intervals and providing a responsive, live user experience.

---

## Prerequisites

Before starting implementation, verify the following are in place:

1. **Supabase Realtime Publication:** Translation tables must be added to the Supabase Realtime publication:
   ```sql
   ALTER PUBLICATION supabase_realtime ADD TABLE item_translations;
   ALTER PUBLICATION supabase_realtime ADD TABLE article_translations;
   ALTER PUBLICATION supabase_realtime ADD TABLE link_translations;
   ```

2. **Row Level Security:** RLS policies must allow SELECT for authenticated users on translation tables

3. **Existing Dependencies:**
   - `/src/lib/supabase.ts` - Supabase client with Realtime support
   - `/src/hooks/useLanguagePreference.ts` - `SupportedLanguage` type reference

---

## Task Breakdown

### Task 1: Create Hook File Structure and Type Definitions
**Estimate:** 1 story point
**File:** `/src/hooks/useTranslationRealtime.ts`

#### 1.1 Create File with Module Structure

Create the hook file with the following structure:

```typescript
// src/hooks/useTranslationRealtime.ts
// REQ-E05-011: Realtime Translation Updates Subscription Hook
// Created: 2026-01-20
// Last Modified: 2026-01-20 19:30 UTC

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { SupportedLanguage } from '@/hooks/useLanguagePreference';

// ============ Constants ============

const DEBUG_PREFIX = '🔄 TRANSLATION_REALTIME:';
const DEFAULT_DEBOUNCE_MS = 100;
const CHANNEL_PREFIX = 'translation-updates';

// Translation tables to subscribe to
const TRANSLATION_TABLES = ['item_translations', 'article_translations', 'link_translations'] as const;
type TranslationTable = typeof TRANSLATION_TABLES[number];
```

#### 1.2 Define Type Definitions

Add the following type definitions after constants:

```typescript
// ============ Type Definitions ============

/**
 * Connection status for realtime subscription
 */
export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

/**
 * Entity type for translation subscriptions
 */
export type TranslationEntityType = 'item' | 'article' | 'link';

/**
 * Translation status values (matches database schema)
 */
export type TranslationStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'manual';

/**
 * Translation record from database
 */
export interface TranslationRecord {
  id: string;
  language: string;
  translation_status: TranslationStatus;
  translated_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  // Entity-specific ID field (item_id, article_id, or link_id)
  item_id?: string;
  article_id?: string;
  link_id?: string;
  // Content fields vary by entity type
  name?: string;
  title?: string;
  description?: string | null;
  [key: string]: unknown;
}

/**
 * Realtime update payload sent to callback
 */
export interface TranslationRealtimeUpdate {
  /** Event type (INSERT for new translation, UPDATE for status change) */
  eventType: 'INSERT' | 'UPDATE';

  /** Entity type that was updated */
  entityType: TranslationEntityType;

  /** Entity ID that was updated */
  entityId: string;

  /** Language code */
  language: SupportedLanguage;

  /** New translation status */
  status: TranslationStatus;

  /** Full translation record from database */
  record: TranslationRecord;

  /** Timestamp of the update (ISO string) */
  timestamp: string;
}

/**
 * Hook configuration options
 */
export interface UseTranslationRealtimeOptions {
  /** Entity type for single-entity subscriptions */
  entityType?: TranslationEntityType;

  /** Entity ID for single-entity subscriptions */
  entityId?: string;

  /** Property ID for property-wide subscriptions (subscribes to all entities within property) */
  propertyId?: string;

  /** Callback when translation update is received */
  onUpdate?: (update: TranslationRealtimeUpdate) => void;

  /** Whether the subscription is enabled (default: true) */
  enabled?: boolean;

  /** Debounce interval in ms (default: 100) */
  debounceMs?: number;
}

/**
 * Hook return value
 */
export interface UseTranslationRealtimeReturn {
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
```

#### 1.3 Acceptance Criteria for Task 1
- [ ] File created at `/src/hooks/useTranslationRealtime.ts`
- [ ] `'use client'` directive present at top of file
- [ ] All type definitions exported
- [ ] `ConnectionStatus` type defined with 4 states
- [ ] `TranslationRealtimeUpdate` interface matches overview spec
- [ ] `UseTranslationRealtimeOptions` interface includes all parameters
- [ ] `UseTranslationRealtimeReturn` interface includes all return values
- [ ] Constants defined for debug prefix, debounce, and channel name

---

### Task 2: Implement Utility Functions
**Estimate:** 0.5 story points
**File:** `/src/hooks/useTranslationRealtime.ts`

#### 2.1 Create Entity ID Extraction Utility

Add utility function to extract entity ID from translation record:

```typescript
// ============ Utility Functions ============

/**
 * Extract entity ID from translation record based on table name
 */
function getEntityIdFromRecord(record: TranslationRecord, table: TranslationTable): string | null {
  switch (table) {
    case 'item_translations':
      return record.item_id ?? null;
    case 'article_translations':
      return record.article_id ?? null;
    case 'link_translations':
      return record.link_id ?? null;
    default:
      return null;
  }
}

/**
 * Map table name to entity type
 */
function tableToEntityType(table: TranslationTable): TranslationEntityType {
  const mapping: Record<TranslationTable, TranslationEntityType> = {
    'item_translations': 'item',
    'article_translations': 'article',
    'link_translations': 'link',
  };
  return mapping[table];
}

/**
 * Map entity type to table name
 */
function entityTypeToTable(entityType: TranslationEntityType): TranslationTable {
  const mapping: Record<TranslationEntityType, TranslationTable> = {
    'item': 'item_translations',
    'article': 'article_translations',
    'link': 'link_translations',
  };
  return mapping[entityType];
}

/**
 * Generate unique channel name for subscription
 */
function generateChannelName(options: UseTranslationRealtimeOptions): string {
  const { entityType, entityId, propertyId } = options;

  if (entityType && entityId) {
    return `${CHANNEL_PREFIX}-${entityType}-${entityId}`;
  }
  if (propertyId) {
    return `${CHANNEL_PREFIX}-property-${propertyId}`;
  }
  return `${CHANNEL_PREFIX}-global-${Date.now()}`;
}
```

#### 2.2 Acceptance Criteria for Task 2
- [ ] `getEntityIdFromRecord` function correctly extracts ID for all table types
- [ ] `tableToEntityType` function maps all 3 translation tables
- [ ] `entityTypeToTable` function maps all 3 entity types
- [ ] `generateChannelName` creates unique channel names
- [ ] Channel names follow pattern: `translation-updates-{entityType}-{entityId}` or `translation-updates-property-{propertyId}`

---

### Task 3: Implement Core Hook Logic
**Estimate:** 2 story points
**File:** `/src/hooks/useTranslationRealtime.ts`

#### 3.1 Create Main Hook Function

Implement the main hook function with state and refs:

```typescript
// ============ Main Hook ============

/**
 * React hook for subscribing to realtime translation updates.
 *
 * Subscribes to Supabase Realtime channels for translation record changes,
 * automatically triggers UI updates when translations complete or change status,
 * and properly cleans up subscriptions when components unmount.
 *
 * @param options - Configuration options for the subscription
 * @returns Object with connection status and control functions
 *
 * @example
 * ```tsx
 * // Single entity subscription
 * const { connectionStatus, isSubscribed } = useTranslationRealtime({
 *   entityType: 'article',
 *   entityId: articleId,
 *   onUpdate: (update) => {
 *     if (update.status === 'completed') {
 *       refetchData();
 *     }
 *   },
 * });
 *
 * // Property-wide subscription
 * const { connectionStatus } = useTranslationRealtime({
 *   propertyId: selectedPropertyId,
 *   onUpdate: (update) => {
 *     updateTranslationCounts(update);
 *   },
 * });
 * ```
 */
export function useTranslationRealtime(
  options: UseTranslationRealtimeOptions = {}
): UseTranslationRealtimeReturn {
  const {
    entityType,
    entityId,
    propertyId,
    onUpdate,
    enabled = true,
    debounceMs = DEFAULT_DEBOUNCE_MS,
  } = options;

  // ============ State ============
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // ============ Refs ============
  const channelRef = useRef<RealtimeChannel | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const onUpdateRef = useRef(onUpdate);
  const mountedRef = useRef(true);

  // Keep onUpdate ref current to avoid stale closures
  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);
```

#### 3.2 Acceptance Criteria for Task 3
- [ ] Hook function created with proper TypeScript signature
- [ ] All options destructured with defaults
- [ ] State variables: `connectionStatus`, `isSubscribed`, `isPaused`
- [ ] Refs: `channelRef`, `debounceTimerRef`, `onUpdateRef`, `mountedRef`
- [ ] `onUpdateRef` kept current via useEffect to prevent stale closures
- [ ] JSDoc comments with usage examples

---

### Task 4: Implement Event Handling and Debouncing
**Estimate:** 1.5 story points
**File:** `/src/hooks/useTranslationRealtime.ts`

#### 4.1 Create Event Handler Function

Add the event handler inside the hook:

```typescript
  // ============ Event Handling ============

  /**
   * Handle translation table change event
   */
  const handleTranslationChange = useCallback((
    payload: RealtimePostgresChangesPayload<TranslationRecord>,
    table: TranslationTable
  ) => {
    // Only process INSERT and UPDATE events
    if (payload.eventType !== 'INSERT' && payload.eventType !== 'UPDATE') {
      console.log(`${DEBUG_PREFIX} Ignoring event type: ${payload.eventType}`);
      return;
    }

    const record = payload.new as TranslationRecord;
    if (!record) {
      console.warn(`${DEBUG_PREFIX} No record in payload`);
      return;
    }

    // Extract entity ID based on table
    const recordEntityId = getEntityIdFromRecord(record, table);
    if (!recordEntityId) {
      console.warn(`${DEBUG_PREFIX} Could not extract entity ID from record`);
      return;
    }

    // Filter by entity reference if specified
    if (entityType && entityId) {
      const targetTable = entityTypeToTable(entityType);
      if (table !== targetTable || recordEntityId !== entityId) {
        console.log(`${DEBUG_PREFIX} Event filtered out (entity mismatch)`);
        return;
      }
    }

    // Note: Property-wide filtering would require a join with parent tables
    // For now, property-wide subscriptions receive all events and filter client-side
    // This could be optimized with database functions in the future

    console.log(`${DEBUG_PREFIX} Processing event`, {
      eventType: payload.eventType,
      table,
      entityId: recordEntityId,
      language: record.language,
      status: record.translation_status,
    });

    // Build update payload
    const update: TranslationRealtimeUpdate = {
      eventType: payload.eventType as 'INSERT' | 'UPDATE',
      entityType: tableToEntityType(table),
      entityId: recordEntityId,
      language: record.language as SupportedLanguage,
      status: record.translation_status as TranslationStatus,
      record,
      timestamp: new Date().toISOString(),
    };

    // Debounce callback execution
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      if (!mountedRef.current) {
        console.log(`${DEBUG_PREFIX} Component unmounted, skipping callback`);
        return;
      }

      if (onUpdateRef.current) {
        console.log(`${DEBUG_PREFIX} Executing callback for`, update.entityType, update.entityId);
        onUpdateRef.current(update);
      }
    }, debounceMs);
  }, [entityType, entityId, debounceMs]);
```

#### 4.2 Acceptance Criteria for Task 4
- [ ] `handleTranslationChange` function created with proper signature
- [ ] Only processes INSERT and UPDATE events (ignores DELETE)
- [ ] Extracts entity ID from record using utility function
- [ ] Filters events when entityType/entityId are specified
- [ ] Builds `TranslationRealtimeUpdate` payload correctly
- [ ] Implements debouncing with configurable interval
- [ ] Clears pending debounce timer before setting new one
- [ ] Checks `mountedRef` before executing callback
- [ ] Uses `onUpdateRef.current` to avoid stale closure

---

### Task 5: Implement Channel Subscription Management
**Estimate:** 2 story points
**File:** `/src/hooks/useTranslationRealtime.ts`

#### 5.1 Create Subscription Setup Function

Add the subscription management functions:

```typescript
  // ============ Subscription Management ============

  /**
   * Create and configure realtime channel subscription
   */
  const setupSubscription = useCallback(() => {
    // Don't setup if disabled or paused
    if (!enabled || isPaused) {
      console.log(`${DEBUG_PREFIX} Subscription setup skipped`, { enabled, isPaused });
      return;
    }

    // Cleanup existing channel first
    if (channelRef.current) {
      console.log(`${DEBUG_PREFIX} Cleaning up existing channel before setup`);
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    const channelName = generateChannelName(options);
    console.log(`${DEBUG_PREFIX} Setting up channel: ${channelName}`);

    setConnectionStatus('connecting');

    // Create new channel
    const channel = supabase.channel(channelName);

    // Subscribe to each translation table
    // For single-entity subscriptions, only subscribe to the relevant table
    const tablesToSubscribe: TranslationTable[] = entityType
      ? [entityTypeToTable(entityType)]
      : TRANSLATION_TABLES.slice(); // All tables for property-wide

    tablesToSubscribe.forEach((table) => {
      // Build filter string for row-level filtering
      // Note: Supabase realtime filter syntax uses PostgREST format
      let filter: string | undefined;
      if (entityType && entityId) {
        const idColumn = `${entityType}_id`;
        filter = `${idColumn}=eq.${entityId}`;
      }

      channel.on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT and UPDATE (DELETE is rare for translations)
          schema: 'public',
          table,
          filter,
        },
        (payload) => handleTranslationChange(payload as RealtimePostgresChangesPayload<TranslationRecord>, table)
      );

      console.log(`${DEBUG_PREFIX} Subscribed to ${table}`, { filter });
    });

    // Handle connection status changes
    channel.subscribe((status) => {
      console.log(`${DEBUG_PREFIX} Channel status: ${status}`);

      if (!mountedRef.current) return;

      switch (status) {
        case 'SUBSCRIBED':
          setConnectionStatus('connected');
          setIsSubscribed(true);
          break;
        case 'CHANNEL_ERROR':
          setConnectionStatus('error');
          setIsSubscribed(false);
          break;
        case 'TIMED_OUT':
          setConnectionStatus('error');
          setIsSubscribed(false);
          break;
        case 'CLOSED':
          setConnectionStatus('disconnected');
          setIsSubscribed(false);
          break;
      }
    });

    channelRef.current = channel;
  }, [enabled, isPaused, entityType, entityId, options, handleTranslationChange]);
```

#### 5.2 Create Cleanup Function

Add the cleanup function:

```typescript
  /**
   * Cleanup channel subscription and pending timers
   */
  const cleanup = useCallback(() => {
    console.log(`${DEBUG_PREFIX} Cleanup called`);

    // Clear debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    // Remove channel subscription
    if (channelRef.current) {
      console.log(`${DEBUG_PREFIX} Removing channel`);
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    setIsSubscribed(false);
    setConnectionStatus('disconnected');
  }, []);
```

#### 5.3 Acceptance Criteria for Task 5
- [ ] `setupSubscription` function created
- [ ] Checks `enabled` and `isPaused` before setup
- [ ] Cleans up existing channel before creating new one
- [ ] Generates unique channel name
- [ ] Subscribes to correct tables based on entityType (single table or all)
- [ ] Applies row-level filter when entityType/entityId provided
- [ ] Handles all subscription status changes (SUBSCRIBED, CHANNEL_ERROR, TIMED_OUT, CLOSED)
- [ ] Updates `connectionStatus` and `isSubscribed` state appropriately
- [ ] `cleanup` function clears debounce timer and removes channel

---

### Task 6: Implement Control Functions
**Estimate:** 1 story point
**File:** `/src/hooks/useTranslationRealtime.ts`

#### 6.1 Create Control Functions

Add the user-callable control functions:

```typescript
  // ============ Control Functions ============

  /**
   * Manually reconnect to realtime channel
   */
  const reconnect = useCallback(() => {
    console.log(`${DEBUG_PREFIX} Manual reconnect requested`);
    cleanup();
    setIsPaused(false);
    // setupSubscription will be called by the effect when state updates
  }, [cleanup]);

  /**
   * Pause realtime subscriptions (e.g., when tab is hidden)
   */
  const pause = useCallback(() => {
    console.log(`${DEBUG_PREFIX} Pause requested`);
    setIsPaused(true);
    cleanup();
  }, [cleanup]);

  /**
   * Resume realtime subscriptions
   */
  const resume = useCallback(() => {
    console.log(`${DEBUG_PREFIX} Resume requested`);
    setIsPaused(false);
    // setupSubscription will be called by the effect when isPaused changes
  }, []);
```

#### 6.2 Acceptance Criteria for Task 6
- [ ] `reconnect` function calls cleanup and resets pause state
- [ ] `pause` function sets isPaused to true and calls cleanup
- [ ] `resume` function sets isPaused to false
- [ ] All functions use useCallback for stable references
- [ ] Control functions log debug messages

---

### Task 7: Implement Lifecycle Effects
**Estimate:** 1.5 story points
**File:** `/src/hooks/useTranslationRealtime.ts`

#### 7.1 Create Main Subscription Effect

Add the useEffect hooks for lifecycle management:

```typescript
  // ============ Effects ============

  /**
   * Main subscription effect
   * Sets up subscription when enabled and parameters change
   * Handles React StrictMode double-mounting
   */
  useEffect(() => {
    mountedRef.current = true;

    console.log(`${DEBUG_PREFIX} Effect triggered`, {
      enabled,
      isPaused,
      entityType,
      entityId,
      propertyId,
    });

    // Setup subscription if enabled and not paused
    if (enabled && !isPaused) {
      // Small delay to handle StrictMode double-mounting
      const timeoutId = setTimeout(() => {
        if (mountedRef.current) {
          setupSubscription();
        }
      }, 0);

      return () => {
        clearTimeout(timeoutId);
        mountedRef.current = false;
        cleanup();
      };
    }

    // Cleanup if disabled or paused
    return () => {
      mountedRef.current = false;
      cleanup();
    };
  }, [enabled, isPaused, entityType, entityId, propertyId, setupSubscription, cleanup]);
```

#### 7.2 Add Optional Visibility Change Handler

Add visibility change handler for optional tab visibility optimization:

```typescript
  /**
   * Optional: Handle tab visibility changes
   * Pauses subscriptions when tab is hidden to save resources
   * Uncomment if this optimization is desired
   */
  /*
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        console.log(`${DEBUG_PREFIX} Tab hidden, pausing subscription`);
        pause();
      } else {
        console.log(`${DEBUG_PREFIX} Tab visible, resuming subscription`);
        resume();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [pause, resume]);
  */
```

#### 7.3 Return Hook Values

Add the return statement:

```typescript
  // ============ Return ============

  return {
    connectionStatus,
    reconnect,
    pause,
    resume,
    isSubscribed,
  };
}

export default useTranslationRealtime;
```

#### 7.4 Acceptance Criteria for Task 7
- [ ] Main useEffect sets up subscription when enabled and not paused
- [ ] Effect properly handles React StrictMode double-mounting with setTimeout
- [ ] Effect cleanup runs on unmount and parameter changes
- [ ] `mountedRef` is set to true on mount and false on cleanup
- [ ] Dependencies array includes all relevant parameters
- [ ] Visibility change handler is included (commented) as optional enhancement
- [ ] Hook returns all specified values in `UseTranslationRealtimeReturn` interface

---

### Task 8: Export from Types Index
**Estimate:** 0.5 story points
**File:** `/src/types/index.ts`

#### 8.1 Add Type Exports

Add exports for the hook types:

```typescript
// Translation Realtime Hook Types (REQ-E05-011)
export type {
  ConnectionStatus,
  TranslationEntityType,
  TranslationStatus,
  TranslationRecord,
  TranslationRealtimeUpdate,
  UseTranslationRealtimeOptions,
  UseTranslationRealtimeReturn,
} from '@/hooks/useTranslationRealtime';
```

#### 8.2 Acceptance Criteria for Task 8
- [ ] All public types exported from `/src/types/index.ts`
- [ ] Types can be imported from `@/types`
- [ ] No circular dependency issues

---

### Task 9: Verify Supabase Realtime Configuration
**Estimate:** 0.5 story points
**Database Migration**

#### 9.1 Verify or Apply Realtime Publication

Execute via Supabase MCP or dashboard:

```sql
-- Check if tables are in realtime publication
SELECT
  schemaname,
  tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime';

-- Add tables if not present
ALTER PUBLICATION supabase_realtime ADD TABLE item_translations;
ALTER PUBLICATION supabase_realtime ADD TABLE article_translations;
ALTER PUBLICATION supabase_realtime ADD TABLE link_translations;
```

#### 9.2 Acceptance Criteria for Task 9
- [ ] `item_translations` is in `supabase_realtime` publication
- [ ] `article_translations` is in `supabase_realtime` publication
- [ ] `link_translations` is in `supabase_realtime` publication
- [ ] Verified via SQL query

---

## Complete File Implementation

The complete implementation should result in a file approximately 350-400 lines with the following structure:

```
src/hooks/useTranslationRealtime.ts
├── Header comment with request ID and dates
├── 'use client' directive
├── Imports
├── Constants
├── Type Definitions (exported)
│   ├── ConnectionStatus
│   ├── TranslationEntityType
│   ├── TranslationStatus
│   ├── TranslationRecord
│   ├── TranslationRealtimeUpdate
│   ├── UseTranslationRealtimeOptions
│   └── UseTranslationRealtimeReturn
├── Utility Functions
│   ├── getEntityIdFromRecord
│   ├── tableToEntityType
│   ├── entityTypeToTable
│   └── generateChannelName
├── useTranslationRealtime Hook (exported)
│   ├── State declarations
│   ├── Refs declarations
│   ├── handleTranslationChange callback
│   ├── setupSubscription callback
│   ├── cleanup callback
│   ├── reconnect callback
│   ├── pause callback
│   ├── resume callback
│   ├── Main subscription effect
│   ├── (Optional) Visibility change effect
│   └── Return statement
└── default export
```

---

## Testing Checklist

### Unit Tests to Create

| Test Case | Description |
|-----------|-------------|
| Initial state | Hook returns `connectionStatus: 'disconnected'` and `isSubscribed: false` when first rendered |
| Subscription setup | When enabled, hook creates Supabase channel and subscribes |
| Single entity filter | Events are filtered when `entityType` and `entityId` are provided |
| Property-wide subscription | All tables are subscribed when only `propertyId` is provided |
| Callback execution | `onUpdate` callback is called with correct payload when event received |
| Debounce behavior | Rapid events are debounced (only last callback executed within interval) |
| Unmount cleanup | Channel is removed and timers cleared on component unmount |
| Parameter change | Subscription is re-established when parameters change |
| Reconnect function | `reconnect()` cleans up and re-establishes subscription |
| Pause/Resume | `pause()` disconnects, `resume()` reconnects |
| Connection status | Status updates correctly for all subscription states |
| StrictMode | No duplicate subscriptions in React StrictMode |

### Integration Test Scenarios

| Scenario | Steps |
|----------|-------|
| Realtime update received | 1. Subscribe to entity, 2. Update translation in DB, 3. Verify callback received |
| Multiple updates | 1. Subscribe, 2. Send rapid updates, 3. Verify debouncing works |
| Disconnect recovery | 1. Subscribe, 2. Simulate disconnect, 3. Call reconnect, 4. Verify subscription restored |

---

## Usage Examples

### Single Entity Subscription

```tsx
import { useTranslationRealtime } from '@/hooks/useTranslationRealtime';

function ArticleEditor({ articleId }: { articleId: string }) {
  const { connectionStatus, isSubscribed } = useTranslationRealtime({
    entityType: 'article',
    entityId: articleId,
    onUpdate: (update) => {
      console.log('Translation update:', update);
      if (update.status === 'completed') {
        // Refresh translation display
        refetchTranslations();
      }
    },
  });

  return (
    <div>
      <span>Realtime: {isSubscribed ? '🟢' : '⚪'} {connectionStatus}</span>
      {/* Editor content */}
    </div>
  );
}
```

### Property-Wide Subscription

```tsx
function TranslationDashboard({ propertyId }: { propertyId: string }) {
  const [counts, setCounts] = useState({ pending: 0, completed: 0, failed: 0 });

  const { connectionStatus } = useTranslationRealtime({
    propertyId,
    onUpdate: (update) => {
      // Update counts based on status change
      setCounts(prev => ({
        ...prev,
        [update.status]: prev[update.status] + 1,
      }));
    },
  });

  return (
    <div>
      <StatusBadge status={connectionStatus} />
      <TranslationCountsWidget counts={counts} />
    </div>
  );
}
```

### Combined with useTranslationStatus

```tsx
function TranslationPreviewPanel({ entityType, entityId }) {
  // Initial data fetch
  const { data, isLoading, refresh } = useTranslationStatus({
    entityType,
    entityId,
  });

  // Realtime updates trigger refresh
  const { connectionStatus } = useTranslationRealtime({
    entityType,
    entityId,
    onUpdate: () => {
      // Refresh data when any translation updates
      refresh();
    },
  });

  return (
    <Panel>
      <ConnectionIndicator status={connectionStatus} />
      {isLoading ? <Spinner /> : <TranslationList data={data} />}
    </Panel>
  );
}
```

---

## Acceptance Criteria Summary

| Criteria | Task |
|----------|------|
| Hook file created at `/src/hooks/useTranslationRealtime.ts` | Task 1 |
| Hook accepts entity reference parameters (entityType and entityId) | Task 1, 3 |
| Hook accepts propertyId parameter for property-wide subscriptions | Task 1, 3 |
| Hook accepts optional callback function for updates | Task 1, 3 |
| Hook creates Supabase Realtime channel subscription on mount | Task 5 |
| Hook subscribes to INSERT events on translation tables | Task 5 |
| Hook subscribes to UPDATE events on translation tables | Task 5 |
| Hook filters events to match provided entity reference | Task 4 |
| Hook triggers callback with updated translation record | Task 4 |
| Hook unsubscribes from channel when component unmounts | Task 7 |
| Hook re-establishes subscription when parameters change | Task 7 |
| Hook handles subscription errors gracefully | Task 5 |
| Hook debounces rapid successive updates (100ms) | Task 4 |
| Hook provides connection status indicator | Task 3, 5 |
| Hook cleans up pending timers on unmount | Task 5, 7 |
| Hook works correctly with React StrictMode | Task 7 |
| Hook prevents memory leaks through proper cleanup | Task 5, 7 |
| TypeScript type definitions included | Task 1, 8 |

---

## Dependencies

### From This Codebase
- `/src/lib/supabase.ts` - Supabase client with Realtime support
- `/src/hooks/useLanguagePreference.ts` - `SupportedLanguage` type

### External
- `@supabase/supabase-js` - Supabase JavaScript client (already installed)

---

## Out of Scope

- Admin/cross-property subscriptions (only owner's content)
- Tag translation realtime updates (lower priority)
- Translation job queue monitoring (separate feature)
- Batch subscription optimization (future enhancement)
- Server-side property filtering (requires database functions)

---

## References

- [Supabase Realtime Postgres Changes](https://supabase.com/docs/guides/realtime/postgres-changes)
- [Supabase JavaScript Client Realtime](https://supabase.com/docs/reference/javascript/subscribe)
- Overview Document: `/docs/REQ-E05-011-create-usetranslationrealtime-hook-overview.md`
- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- Related Hook Pattern: `/src/hooks/useDashboardStats.ts`
- Related Hook Pattern: `/src/hooks/useLanguagePreference.ts`
- Supabase Client: `/src/lib/supabase.ts`
