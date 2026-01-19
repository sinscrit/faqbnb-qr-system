# REQ-344: Create useTranslationRealtime Hook

**Generated:** 2026-01-19 00:00:00 UTC
**Last Modified:** 2026-01-19 00:00:00 UTC
**Request Type:** NEW FEATURE
**Size:** M (Medium)
**Epic:** Epic 5 - Owner Translation Management
**Phase:** 2 - Core UI Components
**Task ID:** 2.7
**Implementation Plan Reference:** `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`

---

## Overview

This task implements a React hook that subscribes to real-time database changes for translation status updates using Supabase Realtime. The hook enables UI components to automatically refresh when translation jobs complete, eliminating the need for manual page refreshes or polling intervals.

### Problem Statement

When translations are processing in the background, users must manually refresh the page or wait for polling intervals to see updated translation status. There is no immediate feedback when a translation job completes successfully or fails, creating uncertainty about whether translations are ready.

### Solution

Create a `useTranslationRealtime` hook that:
- Subscribes to Supabase realtime channels for translation table updates
- Filters updates based on entity type and entity ID parameters
- Automatically updates local state when translation records change (INSERT, UPDATE, DELETE events)
- Properly cleans up subscriptions on component unmount
- Handles connection errors gracefully with automatic reconnection
- Works for items, articles, links, and tags translation updates

---

## Dependencies

### Epic Dependencies

| Dependency | Source | Status | Notes |
|------------|--------|--------|-------|
| Translation tables schema | Epic 1 (REQ-227) | Required | `article_translations`, `item_translations`, `link_translations`, `tag_translations` |
| Translation jobs table | Epic 1 (REQ-227) | Required | `translation_jobs` for job status tracking |
| RLS policies for translation tables | Epic 1 (REQ-226) | Required | Row-level security for authenticated access |
| TranslationManagement types | Epic 5 (REQ-309) | Required | Shared type definitions |

### Technical Dependencies

| Dependency | Location | Purpose |
|------------|----------|---------|
| Supabase client | `/src/lib/supabase.ts` | Realtime subscription API |
| AuthContext | `/src/contexts/AuthContext.tsx` | User authentication for filtering |
| Language types | `/src/hooks/useLanguagePreference.ts` | `SupportedLanguage` type |

---

## Technical Context

### Existing Patterns to Follow

| Pattern | File | Description |
|---------|------|-------------|
| Hook structure | `/src/hooks/useDashboardStats.ts` | State management, loading/error states, cleanup |
| Language preference hook | `/src/hooks/useLanguagePreference.ts` | Auth integration, type exports, JSDoc documentation |
| Auth integration | `/src/contexts/AuthContext.tsx` | User and session access |
| Supabase client | `/src/lib/supabase.ts` | `supabase` export for realtime subscriptions |

### Supabase Realtime API

```typescript
// Supabase realtime channel subscription pattern
const channel = supabase
  .channel('translation-updates')
  .on(
    'postgres_changes',
    {
      event: '*', // INSERT, UPDATE, DELETE
      schema: 'public',
      table: 'item_translations',
      filter: `item_id=eq.${entityId}`,
    },
    (payload) => handleChange(payload)
  )
  .subscribe((status) => handleStatus(status));

// Cleanup
channel.unsubscribe();
```

### Translation Table Structure (from Epic 1)

```typescript
// Translation status values
type TranslationStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'manual';

// Common fields across translation tables
interface TranslationRecord {
  id: string;
  language: string;
  translation_status: string;
  translated_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}
```

---

## Implementation Specification

### File Location

```
/src/hooks/useTranslationRealtime.ts
```

### Interface Definitions

```typescript
// src/hooks/useTranslationRealtime.ts

import { SupportedLanguage } from '@/hooks/useLanguagePreference';

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

### Implementation Details

#### 1. Hook Setup and State Management

```typescript
export function useTranslationRealtime(
  options: UseTranslationRealtimeOptions
): UseTranslationRealtimeReturn {
  const { entityType, entityId, onUpdate, enabled = true } = options;

  // State
  const [latestUpdate, setLatestUpdate] = useState<TranslationUpdate | null>(null);
  const [recentUpdates, setRecentUpdates] = useState<TranslationUpdate[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs for cleanup and callback stability
  const channelRef = useRef<RealtimeChannel | null>(null);
  const onUpdateRef = useRef(onUpdate);

  // Keep callback ref current
  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);
}
```

#### 2. Table Mapping

```typescript
// Map entity type to database table
const getTableName = (type: TranslationEntityType): string => {
  const tableMap: Record<TranslationEntityType, string> = {
    item: 'item_translations',
    article: 'article_translations',
    link: 'link_translations',
    tag: 'tag_translations',
  };
  return tableMap[type];
};

// Map entity type to foreign key column
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

#### 3. Subscription Setup

```typescript
useEffect(() => {
  if (!enabled) {
    // Clean up existing subscription if disabled
    if (channelRef.current) {
      channelRef.current.unsubscribe();
      channelRef.current = null;
    }
    setIsConnected(false);
    return;
  }

  const tableName = getTableName(entityType);
  const fkColumn = getForeignKeyColumn(entityType);

  // Build channel name for unique identification
  const channelName = entityId
    ? `${tableName}:${entityId}`
    : `${tableName}:all`;

  setIsConnecting(true);
  setError(null);

  // Build subscription filter
  const filter = entityId ? `${fkColumn}=eq.${entityId}` : undefined;

  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: tableName,
        filter,
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
      }
    });

  channelRef.current = channel;

  // Cleanup on unmount or dependency change
  return () => {
    console.log(`[useTranslationRealtime] Unsubscribing from ${channelName}`);
    channel.unsubscribe();
    channelRef.current = null;
  };
}, [entityType, entityId, enabled]);
```

#### 4. Payload Handler

```typescript
const handlePayload = useCallback((
  payload: RealtimePostgresChangesPayload<Record<string, unknown>>,
  type: TranslationEntityType
) => {
  const { eventType, new: newRecord, old: oldRecord } = payload;
  const record = (newRecord || oldRecord) as Record<string, unknown>;

  if (!record) return;

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

#### 5. Utility Functions

```typescript
const reconnect = useCallback(() => {
  if (channelRef.current) {
    channelRef.current.unsubscribe();
    channelRef.current = null;
  }
  // Force re-run of subscription effect by toggling a counter
  setIsConnecting(true);
  // Effect will re-run due to isConnecting change pattern
}, []);

const clearUpdates = useCallback(() => {
  setLatestUpdate(null);
  setRecentUpdates([]);
}, []);
```

---

## Authorized Files and Functions for Modification

### New Files (Create)

| File Path | Purpose |
|-----------|---------|
| `/src/hooks/useTranslationRealtime.ts` | Main hook implementation |
| `/src/hooks/__tests__/useTranslationRealtime.test.ts` | Unit tests (optional, see REQ-334) |

### Files to Potentially Modify

| File Path | Change Type | Reason |
|-----------|-------------|--------|
| `/src/types/index.ts` | Add export | Export translation realtime types if needed |
| `/src/hooks/index.ts` | Add export | Export hook for easier imports (create if doesn't exist) |

### Database Tables (Read-Only Access)

| Table | Access Type | Purpose |
|-------|-------------|---------|
| `item_translations` | SUBSCRIBE | Realtime updates for item translations |
| `article_translations` | SUBSCRIBE | Realtime updates for article translations |
| `link_translations` | SUBSCRIBE | Realtime updates for link translations |
| `tag_translations` | SUBSCRIBE | Realtime updates for tag translations |

---

## Usage Examples

### Basic Usage - Single Entity Subscription

```tsx
// In TranslationPreviewPanel component
import { useTranslationRealtime } from '@/hooks/useTranslationRealtime';

function TranslationPreviewPanel({ entityType, entityId, onClose }) {
  const [translations, setTranslations] = useState({});

  // Subscribe to realtime updates for this specific entity
  const { latestUpdate, isConnected, error } = useTranslationRealtime({
    entityType,
    entityId,
    onUpdate: (update) => {
      // Update local state when translation completes
      setTranslations((prev) => ({
        ...prev,
        [update.language]: {
          status: update.status,
          translatedAt: update.translatedAt,
        },
      }));
    },
  });

  return (
    <div className="translation-panel">
      {/* Connection indicator */}
      {isConnected ? (
        <span className="text-green-500">Live updates enabled</span>
      ) : error ? (
        <span className="text-red-500">{error}</span>
      ) : null}

      {/* Translation status rows */}
      {/* ... */}
    </div>
  );
}
```

### Multiple Subscriptions

```tsx
// In dashboard widget monitoring multiple entity types
function TranslationDashboardWidget({ propertyId }) {
  // Subscribe to item translation updates
  const { recentUpdates: itemUpdates } = useTranslationRealtime({
    entityType: 'item',
  });

  // Subscribe to article translation updates
  const { recentUpdates: articleUpdates } = useTranslationRealtime({
    entityType: 'article',
  });

  // Combine and display recent activity
  const allUpdates = [...itemUpdates, ...articleUpdates]
    .sort((a, b) => /* sort by time */)
    .slice(0, 5);

  return <RecentActivityList updates={allUpdates} />;
}
```

### Conditional Subscription

```tsx
// Only subscribe when panel is open
function ArticleEditor({ articleId }) {
  const [showPreview, setShowPreview] = useState(false);

  const { latestUpdate } = useTranslationRealtime({
    entityType: 'article',
    entityId: articleId,
    enabled: showPreview, // Only subscribe when preview is visible
  });

  return (
    <>
      <Editor articleId={articleId} />
      <button onClick={() => setShowPreview(true)}>Show Translations</button>
      {showPreview && (
        <TranslationPreview
          latestUpdate={latestUpdate}
          onClose={() => setShowPreview(false)}
        />
      )}
    </>
  );
}
```

---

## Acceptance Criteria

| Criteria | Verification |
|----------|--------------|
| Hook subscribes to Supabase realtime channel for translation table updates | Test subscription setup and teardown |
| UI components automatically re-render when subscribed translation records change | Test state updates on payload receipt |
| Hook accepts entity type and entity ID parameters to filter relevant updates | Test filter parameter functionality |
| Subscription is properly cleaned up when component unmounts to prevent memory leaks | Test cleanup function execution |
| Hook returns current translation status and a loading state | Verify return value shape |
| Multiple components can subscribe to the same translation updates without conflicts | Test concurrent subscriptions |
| Connection errors are handled gracefully with automatic reconnection attempts | Test error handling and reconnect function |
| Hook works correctly for items, articles, links, and tags translation updates | Test all four entity types |

---

## Testing Notes

### Unit Test Coverage (REQ-334)

1. **Subscription Setup**
   - Verify channel creation with correct table name
   - Verify filter applied when entityId provided
   - Verify no filter when entityId omitted

2. **Event Handling**
   - Mock INSERT event and verify state update
   - Mock UPDATE event and verify state update
   - Mock DELETE event and verify state update
   - Verify onUpdate callback is called

3. **Cleanup**
   - Verify unsubscribe called on unmount
   - Verify unsubscribe called when options change

4. **Error Handling**
   - Mock CHANNEL_ERROR and verify error state
   - Mock TIMED_OUT and verify error state
   - Verify reconnect function resets connection

### Mock Setup

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

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Realtime connection drops silently | Implement connection status tracking, provide reconnect function |
| Memory leak from orphaned subscriptions | Strict cleanup in useEffect return, use refs for channel |
| High message volume overwhelming UI | Debounce state updates, limit recentUpdates array size |
| Filter not working correctly | Validate filter syntax, test with actual Supabase instance |
| Type mismatches with database payload | Defensive parsing with fallback values, runtime type guards |

---

## Related Tasks

| Task | File | Relationship |
|------|------|--------------|
| REQ-309 | `/src/components/TranslationManagement/TranslationManagement.types.ts` | Shared types (may need to import/export) |
| REQ-314 | `/src/hooks/useTranslationStatus.ts` | Companion hook for fetching status (use realtime for updates) |
| REQ-310 | `TranslationPreviewPanel.tsx` | Primary consumer of this hook |
| REQ-334 | Unit tests | Test suite for this hook |

---

## Notes

- The hook follows established patterns from `useDashboardStats.ts` and `useLanguagePreference.ts`
- Supabase Realtime requires RLS policies to be configured (done in Epic 1, REQ-226)
- The hook is designed to be composable - multiple instances can run independently
- Consider adding a `useTranslationRealtimeContext` wrapper if many components need the same subscription to avoid duplicate channels

---

*Document created for FAQBNB Localization Epic 5 - Owner Translation Management*
