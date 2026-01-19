# REQ-344: Create useTranslationRealtime Hook - Detailed Task Breakdown

**Generated:** 2026-01-19 00:00:00 UTC
**Last Modified:** 2026-01-19 00:00:00 UTC
**Request Type:** NEW FEATURE
**Size:** M (Medium)
**Epic:** Epic 5 - Owner Translation Management
**Phase:** 2 - Core UI Components
**Task ID:** 2.7
**Implementation Plan Reference:** `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
**Overview Document:** `/docs/REQ-344-create-usetranslationrealtime-hook-overview.md`

---

## Summary

Implement a React hook that subscribes to real-time database changes for translation status updates using Supabase Realtime. The hook enables UI components to automatically refresh when translation jobs complete, eliminating the need for manual page refreshes or polling intervals.

---

## Prerequisites Checklist

Before starting implementation, verify:

- [ ] Translation tables exist in database (`article_translations`, `item_translations`, `link_translations`, `tag_translations`) - Epic 1 (REQ-227)
- [ ] RLS policies configured for translation tables - Epic 1 (REQ-226)
- [ ] Supabase client available at `/src/lib/supabase.ts`
- [ ] `useLanguagePreference` hook exists with `SupportedLanguage` type export
- [ ] AuthContext available for user session access

---

## Task Breakdown

### Task 1: Create Hook File with Type Definitions
**Estimated Effort:** 1 story point
**File:** `/src/hooks/useTranslationRealtime.ts`

#### 1.1 Create the hook file with header comments

```typescript
// src/hooks/useTranslationRealtime.ts
// REQ-344: Realtime Translation Status Updates Hook
// Created: 2026-01-19
// Last Modified: 2026-01-19

'use client';
```

#### 1.2 Add required imports

```typescript
import { useState, useEffect, useCallback, useRef } from 'react';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { SupportedLanguage } from '@/hooks/useLanguagePreference';
```

#### 1.3 Define exported type definitions

Create the following types that will be exported for use by consumer components:

| Type Name | Purpose |
|-----------|---------|
| `TranslationEntityType` | Union type: `'item' \| 'article' \| 'link' \| 'tag'` |
| `TranslationStatusValue` | Union type: `'pending' \| 'processing' \| 'completed' \| 'failed' \| 'manual'` |
| `TranslationUpdate` | Interface for realtime update payload data |
| `UseTranslationRealtimeOptions` | Interface for hook input parameters |
| `UseTranslationRealtimeReturn` | Interface for hook return value |

**Implementation Details:**

```typescript
/**
 * Entity types that support translations
 */
export type TranslationEntityType = 'item' | 'article' | 'link' | 'tag';

/**
 * Translation status enum values (matches database)
 */
export type TranslationStatusValue = 'pending' | 'processing' | 'completed' | 'failed' | 'manual';

/**
 * Realtime translation update payload
 */
export interface TranslationUpdate {
  /** Database event type */
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  /** Entity type (item, article, link, tag) */
  entityType: TranslationEntityType;
  /** Entity ID (FK to parent entity) */
  entityId: string;
  /** Target language code */
  language: SupportedLanguage;
  /** Current translation status */
  status: TranslationStatusValue;
  /** When translation completed */
  translatedAt: string | null;
  /** Full record data */
  record: Record<string, unknown>;
}

/**
 * Hook parameters for filtering realtime updates
 */
export interface UseTranslationRealtimeOptions {
  /** Entity type to subscribe to (required) */
  entityType: TranslationEntityType;
  /** Specific entity ID to filter updates (optional - if omitted, receives all updates for entity type) */
  entityId?: string;
  /** Callback when translation update received */
  onUpdate?: (update: TranslationUpdate) => void;
  /** Whether subscription is enabled (default: true) */
  enabled?: boolean;
}

/**
 * Hook return value
 */
export interface UseTranslationRealtimeReturn {
  /** Latest translation update received */
  latestUpdate: TranslationUpdate | null;
  /** Array of recent updates (last 10) */
  recentUpdates: TranslationUpdate[];
  /** Whether currently connected to realtime channel */
  isConnected: boolean;
  /** Whether subscription is initializing */
  isConnecting: boolean;
  /** Connection error message if any */
  error: string | null;
  /** Manually trigger reconnection */
  reconnect: () => void;
  /** Clear all cached updates */
  clearUpdates: () => void;
}
```

**Acceptance Criteria:**
- [ ] All type definitions exported from the module
- [ ] Types follow existing hook patterns (see `useLanguagePreference.ts`)
- [ ] JSDoc comments on all exported types
- [ ] Types are compatible with Supabase realtime payload structure

---

### Task 2: Implement Table Mapping Utilities
**Estimated Effort:** 0.5 story points
**File:** `/src/hooks/useTranslationRealtime.ts`

#### 2.1 Create table name mapping function

```typescript
/**
 * Map entity type to database table name
 */
const getTableName = (type: TranslationEntityType): string => {
  const tableMap: Record<TranslationEntityType, string> = {
    item: 'item_translations',
    article: 'article_translations',
    link: 'link_translations',
    tag: 'tag_translations',
  };
  return tableMap[type];
};
```

#### 2.2 Create foreign key column mapping function

```typescript
/**
 * Map entity type to foreign key column name
 */
const getForeignKeyColumn = (type: TranslationEntityType): string => {
  const fkMap: Record<TranslationEntityType, string> = {
    item: 'item_id',
    article: 'article_id',
    link: 'link_id',
    tag: 'tag_key', // Tags use tag_key instead of tag_id
  };
  return fkMap[type];
};
```

**Acceptance Criteria:**
- [ ] `getTableName` returns correct table for each entity type
- [ ] `getForeignKeyColumn` returns correct FK column for each entity type
- [ ] Special handling for `tag` entity type which uses `tag_key` instead of `tag_id`

---

### Task 3: Implement Hook State Management
**Estimated Effort:** 1 story point
**File:** `/src/hooks/useTranslationRealtime.ts`

#### 3.1 Create the main hook function signature

```typescript
/**
 * Hook for subscribing to realtime translation updates via Supabase.
 *
 * @example
 * ```tsx
 * const { latestUpdate, isConnected, error } = useTranslationRealtime({
 *   entityType: 'item',
 *   entityId: itemId,
 *   onUpdate: (update) => console.log('Translation updated:', update),
 * });
 * ```
 */
export function useTranslationRealtime(
  options: UseTranslationRealtimeOptions
): UseTranslationRealtimeReturn {
  // Implementation here
}
```

#### 3.2 Destructure options with defaults

```typescript
const { entityType, entityId, onUpdate, enabled = true } = options;
```

#### 3.3 Initialize state variables

```typescript
// State
const [latestUpdate, setLatestUpdate] = useState<TranslationUpdate | null>(null);
const [recentUpdates, setRecentUpdates] = useState<TranslationUpdate[]>([]);
const [isConnected, setIsConnected] = useState(false);
const [isConnecting, setIsConnecting] = useState(false);
const [error, setError] = useState<string | null>(null);
```

#### 3.4 Create refs for cleanup and callback stability

```typescript
// Refs for cleanup and callback stability
const channelRef = useRef<RealtimeChannel | null>(null);
const onUpdateRef = useRef(onUpdate);
const reconnectCounterRef = useRef(0);

// Keep callback ref current
useEffect(() => {
  onUpdateRef.current = onUpdate;
}, [onUpdate]);
```

**Acceptance Criteria:**
- [ ] Hook follows React hooks rules (conditional logic after hooks)
- [ ] State initialized with appropriate defaults
- [ ] Refs used for mutable values that shouldn't trigger re-renders
- [ ] Callback ref pattern used to avoid stale closures

---

### Task 4: Implement Payload Handler
**Estimated Effort:** 1 story point
**File:** `/src/hooks/useTranslationRealtime.ts`

#### 4.1 Create payload handler with memoization

```typescript
/**
 * Handle incoming realtime payload and transform to TranslationUpdate
 */
const handlePayload = useCallback((
  payload: RealtimePostgresChangesPayload<Record<string, unknown>>,
  type: TranslationEntityType
) => {
  const { eventType, new: newRecord, old: oldRecord } = payload;
  const record = (newRecord || oldRecord) as Record<string, unknown>;

  if (!record) {
    console.warn('[useTranslationRealtime] Received payload with no record data');
    return;
  }

  const fkColumn = getForeignKeyColumn(type);

  const update: TranslationUpdate = {
    eventType: eventType as TranslationUpdate['eventType'],
    entityType: type,
    entityId: String(record[fkColumn] || ''),
    language: (record.language as SupportedLanguage) || 'en',
    status: (record.translation_status as TranslationStatusValue) || 'pending',
    translatedAt: record.translated_at as string | null,
    record,
  };

  // Update state
  setLatestUpdate(update);
  setRecentUpdates((prev) => [update, ...prev.slice(0, 9)]); // Keep last 10

  // Call external callback if provided
  if (onUpdateRef.current) {
    onUpdateRef.current(update);
  }

  console.log(`[useTranslationRealtime] ${eventType} received:`, {
    entityType: type,
    entityId: update.entityId,
    language: update.language,
    status: update.status,
  });
}, []);
```

**Acceptance Criteria:**
- [ ] Handler extracts correct fields from payload
- [ ] Handler handles both INSERT/UPDATE (new record) and DELETE (old record)
- [ ] Defensive parsing with fallback values for missing fields
- [ ] External callback invoked via ref to avoid stale closure
- [ ] Recent updates array limited to 10 items
- [ ] Debug logging included with `[useTranslationRealtime]` prefix

---

### Task 5: Implement Subscription Effect
**Estimated Effort:** 2 story points
**File:** `/src/hooks/useTranslationRealtime.ts`

#### 5.1 Create subscription setup effect

```typescript
useEffect(() => {
  // Skip if disabled
  if (!enabled) {
    // Clean up existing subscription if disabled
    if (channelRef.current) {
      console.log('[useTranslationRealtime] Disabled, cleaning up subscription');
      channelRef.current.unsubscribe();
      channelRef.current = null;
    }
    setIsConnected(false);
    setIsConnecting(false);
    return;
  }

  const tableName = getTableName(entityType);
  const fkColumn = getForeignKeyColumn(entityType);

  // Build channel name for unique identification
  const channelName = entityId
    ? `${tableName}:${entityId}:${reconnectCounterRef.current}`
    : `${tableName}:all:${reconnectCounterRef.current}`;

  setIsConnecting(true);
  setError(null);

  console.log(`[useTranslationRealtime] Setting up subscription to ${channelName}`);

  // Build subscription filter (only if entityId provided)
  const filter = entityId ? `${fkColumn}=eq.${entityId}` : undefined;

  // Create realtime channel subscription
  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: '*', // Listen to INSERT, UPDATE, DELETE
        schema: 'public',
        table: tableName,
        ...(filter && { filter }),
      },
      (payload) => handlePayload(payload, entityType)
    )
    .subscribe((status, err) => {
      if (status === 'SUBSCRIBED') {
        setIsConnected(true);
        setIsConnecting(false);
        setError(null);
        console.log(`[useTranslationRealtime] Connected to ${channelName}`);
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        setIsConnected(false);
        setIsConnecting(false);
        setError(err?.message || `Connection ${status.toLowerCase()}`);
        console.error(`[useTranslationRealtime] ${status}:`, err);
      } else if (status === 'CLOSED') {
        setIsConnected(false);
        setIsConnecting(false);
        console.log(`[useTranslationRealtime] Channel ${channelName} closed`);
      }
    });

  channelRef.current = channel;

  // Cleanup on unmount or dependency change
  return () => {
    console.log(`[useTranslationRealtime] Unsubscribing from ${channelName}`);
    channel.unsubscribe();
    channelRef.current = null;
  };
}, [entityType, entityId, enabled, handlePayload, reconnectCounterRef.current]);
```

**Key Implementation Notes:**
- Include `reconnectCounterRef.current` in channel name to force new channel on reconnect
- Conditionally apply filter only when `entityId` is provided
- Handle all subscription status states: `SUBSCRIBED`, `CHANNEL_ERROR`, `TIMED_OUT`, `CLOSED`
- Proper cleanup in effect return function

**Acceptance Criteria:**
- [ ] Subscription established when `enabled=true`
- [ ] Subscription cleaned up when `enabled=false` or component unmounts
- [ ] Filter applied when `entityId` provided
- [ ] No filter when `entityId` omitted (receives all updates for entity type)
- [ ] Connection status properly tracked
- [ ] Error state set on connection failures
- [ ] Effect dependencies correct to prevent infinite loops

---

### Task 6: Implement Utility Functions
**Estimated Effort:** 0.5 story points
**File:** `/src/hooks/useTranslationRealtime.ts`

#### 6.1 Implement reconnect function

```typescript
/**
 * Manually trigger reconnection to realtime channel
 */
const reconnect = useCallback(() => {
  console.log('[useTranslationRealtime] Manual reconnect triggered');

  // Unsubscribe from current channel
  if (channelRef.current) {
    channelRef.current.unsubscribe();
    channelRef.current = null;
  }

  // Increment counter to force effect re-run with new channel name
  reconnectCounterRef.current += 1;

  // Reset states
  setIsConnected(false);
  setIsConnecting(true);
  setError(null);
}, []);
```

#### 6.2 Implement clearUpdates function

```typescript
/**
 * Clear all cached translation updates
 */
const clearUpdates = useCallback(() => {
  setLatestUpdate(null);
  setRecentUpdates([]);
  console.log('[useTranslationRealtime] Updates cleared');
}, []);
```

**Acceptance Criteria:**
- [ ] `reconnect` properly tears down existing subscription
- [ ] `reconnect` triggers new subscription setup
- [ ] `clearUpdates` resets both latestUpdate and recentUpdates
- [ ] Both functions are memoized with useCallback

---

### Task 7: Implement Hook Return Value
**Estimated Effort:** 0.5 story points
**File:** `/src/hooks/useTranslationRealtime.ts`

#### 7.1 Return the hook value object

```typescript
return {
  latestUpdate,
  recentUpdates,
  isConnected,
  isConnecting,
  error,
  reconnect,
  clearUpdates,
};
```

#### 7.2 Add default export

```typescript
export default useTranslationRealtime;
```

**Acceptance Criteria:**
- [ ] Return object matches `UseTranslationRealtimeReturn` interface
- [ ] Named export and default export both available

---

### Task 8: Update Type Exports (Optional)
**Estimated Effort:** 0.5 story points
**File:** `/src/types/index.ts`

If a centralized types export file exists, add exports for the hook types:

```typescript
// Translation realtime types (REQ-344)
export type {
  TranslationEntityType,
  TranslationStatusValue,
  TranslationUpdate,
  UseTranslationRealtimeOptions,
  UseTranslationRealtimeReturn,
} from '@/hooks/useTranslationRealtime';
```

**Acceptance Criteria:**
- [ ] Types exported from central types file (if pattern exists)
- [ ] Or skip if project doesn't use centralized type exports

---

### Task 9: Create/Update Hooks Index Export (Optional)
**Estimated Effort:** 0.5 story points
**File:** `/src/hooks/index.ts`

If a hooks index file exists, add the export:

```typescript
export { useTranslationRealtime } from './useTranslationRealtime';
export type {
  TranslationEntityType,
  TranslationStatusValue,
  TranslationUpdate,
  UseTranslationRealtimeOptions,
  UseTranslationRealtimeReturn,
} from './useTranslationRealtime';
```

**Acceptance Criteria:**
- [ ] Hook exported from index file (if pattern exists)
- [ ] Or skip if project doesn't use hooks index

---

## Verification Checklist

After implementation, verify:

### Functional Verification
- [ ] Hook compiles without TypeScript errors
- [ ] Hook subscribes to correct table based on `entityType`
- [ ] Filter correctly applied when `entityId` provided
- [ ] Updates received when translation records change in database
- [ ] `latestUpdate` contains correct transformed data
- [ ] `recentUpdates` maintains last 10 updates
- [ ] `onUpdate` callback invoked with each update
- [ ] Subscription cleaned up on unmount (no memory leaks)
- [ ] `enabled=false` prevents subscription
- [ ] `reconnect()` successfully re-establishes connection
- [ ] `clearUpdates()` resets update state

### Error Handling Verification
- [ ] Connection errors populate `error` state
- [ ] `isConnecting` true during connection attempt
- [ ] `isConnected` false when disconnected or error
- [ ] Graceful handling when Supabase client unavailable

### Integration Verification
- [ ] Multiple components can use hook simultaneously
- [ ] Different entity types can be subscribed independently
- [ ] Works correctly with item, article, link, and tag entity types

---

## Testing Notes

### Manual Testing Scenarios

1. **Basic Subscription Test**
   - Mount component with hook
   - Verify `isConnecting` becomes true, then `isConnected` becomes true
   - Insert/update translation record in database
   - Verify `latestUpdate` populated with correct data

2. **Entity Filter Test**
   - Subscribe to specific `entityId`
   - Update translation for matching entity - should receive update
   - Update translation for different entity - should NOT receive update

3. **Cleanup Test**
   - Mount and unmount component
   - Verify no console warnings about memory leaks
   - Verify channel properly unsubscribed

4. **Reconnect Test**
   - Call `reconnect()` function
   - Verify new subscription established

5. **Disabled Test**
   - Set `enabled=false`
   - Verify no subscription active
   - Verify `isConnected=false`

### Unit Test Recommendations (for REQ-334)

```typescript
// Mock Supabase realtime
jest.mock('@/lib/supabase', () => ({
  supabase: {
    channel: jest.fn(() => ({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn((callback) => {
        callback('SUBSCRIBED', null);
        return { unsubscribe: jest.fn() };
      }),
      unsubscribe: jest.fn(),
    })),
  },
}));
```

---

## Database Tables Referenced (Read-Only)

| Table | Purpose | Filter Column |
|-------|---------|---------------|
| `item_translations` | Item name/description translations | `item_id` |
| `article_translations` | Article title/description translations | `article_id` |
| `link_translations` | Link title translations | `link_id` |
| `tag_translations` | Tag label translations | `tag_key` |

---

## Dependencies

### Internal Dependencies
| Dependency | File | Required For |
|------------|------|--------------|
| Supabase client | `/src/lib/supabase.ts` | Realtime subscription API |
| SupportedLanguage type | `/src/hooks/useLanguagePreference.ts` | Language code typing |

### External Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| `@supabase/supabase-js` | Existing | Realtime channel types |
| `react` | Existing | Hooks API |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Realtime connection drops silently | Connection status tracking, `reconnect()` function |
| Memory leak from orphaned subscriptions | Strict cleanup in useEffect return |
| High message volume overwhelming UI | Limit `recentUpdates` to 10 items |
| Filter not working correctly | Validate filter syntax in implementation |
| Type mismatches with DB payload | Defensive parsing with fallback values |

---

## Related Tasks

| Task | Relationship |
|------|--------------|
| REQ-310 (TranslationPreviewPanel) | Primary consumer |
| REQ-314 (useTranslationStatus) | Companion hook for initial fetch |
| REQ-334 (Unit tests) | Test suite for this hook |
| REQ-309 (TranslationManagement types) | Shared type definitions |

---

## Definition of Done

- [ ] Hook file created at `/src/hooks/useTranslationRealtime.ts`
- [ ] All TypeScript types defined and exported
- [ ] Hook subscribes to Supabase realtime channels correctly
- [ ] Entity type filtering works for all 4 entity types
- [ ] Entity ID filtering works when provided
- [ ] Connection status properly tracked (isConnected, isConnecting)
- [ ] Error handling implemented for connection failures
- [ ] Cleanup implemented to prevent memory leaks
- [ ] `reconnect()` function works
- [ ] `clearUpdates()` function works
- [ ] JSDoc documentation added
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] Manual testing completed per verification checklist

---

*Document created for FAQBNB Localization Epic 5 - Owner Translation Management*
*Task 2.7: Create useTranslationRealtime hook*
