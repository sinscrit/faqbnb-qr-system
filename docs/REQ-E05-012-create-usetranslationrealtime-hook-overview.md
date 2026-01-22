# Implementation Overview: Create useTranslationRealtime Hook

## Header
| Field | Value |
|-------|-------|
| Request Reference | REQ-E05-012 |
| Source File | docs/gen_requests_epic5.md |
| Original Request Date | 2026-01-22 14:30 |
| Breakdown Created | 2026-01-22 19:22 |
| T-shirt Size | M |
| Estimated Effort | 7-9 hours |

## Goals

Create a custom React hook that establishes Supabase realtime subscriptions to translation tables (item_translations, article_translations, link_translations, tag_translations), enabling the UI to automatically refresh when translations are inserted, updated, or deleted. The hook manages connection lifecycle, provides callback mechanisms for change notifications, handles reconnection gracefully, and integrates seamlessly with useTranslationStatus for automatic data refresh.

**Technical Requirements:**
- Subscribe to INSERT, UPDATE, DELETE events on 4 translation tables
- Support filtering by specific entity (entityId + entityType) or property (propertyId)
- Provide callback props: onInsert, onUpdate, onDelete, onChange, onError, onConnectionChange
- Track connection state: connected, connecting, disconnected, error
- Automatically establish subscription on mount when enabled=true
- Clean up subscription on unmount to prevent memory leaks
- Support manual subscribe/unsubscribe functions
- Transform Supabase payload to consistent TranslationRealtimePayload format
- Handle SSR safety (no realtime in server environment)
- Integrate with useTranslationStatus for auto-refresh pattern

### Assumptions & Clarifications

- **Discovery**: Supabase client exported from @/lib/supabase.ts with createBrowserClient (lines 708-715)
- **Discovery**: No existing realtime subscription patterns in codebase - this is the first
- **Discovery**: Database type definitions available in supabase.ts for translation tables
- **Assumption**: Supabase Realtime is enabled on the project (must be configured in Supabase dashboard)
- **Assumption**: Translation tables have Row-Level Security (RLS) policies that filter to user's owned entities
- **Assumption**: Realtime subscriptions respect RLS policies (Supabase behavior)
- **Assumption**: Each translation table has columns: id, [entity]_id, language, status, translation_status
- **Clarification needed**: Should hook automatically reconnect with exponential backoff on connection errors?
- **Clarification needed**: Should hook support multiple channels for different filters simultaneously?

## Implementation Plan

### Step 1: Define TypeScript Interfaces and Types
- **Description**: Create comprehensive type definitions for hook options, return value, and realtime payload
- **Rationale**: Establish type safety foundation before implementation
- **Estimated Effort**: 30 minutes

Type definitions to create:

```typescript
/**
 * Options for useTranslationRealtime hook
 */
export interface UseTranslationRealtimeOptions {
  /** Subscribe to updates for specific entity */
  entityId?: string;
  /** Entity type for single entity subscription */
  entityType?: 'item' | 'article' | 'link' | 'tag';
  /** Subscribe to all entities for a property */
  propertyId?: string;
  /** Enable/disable subscription (default: true) */
  enabled?: boolean;
  /** Callback for INSERT events */
  onInsert?: (payload: TranslationRealtimePayload) => void;
  /** Callback for UPDATE events */
  onUpdate?: (payload: TranslationRealtimePayload) => void;
  /** Callback for DELETE events */
  onDelete?: (payload: TranslationRealtimePayload) => void;
  /** Callback for any change event */
  onChange?: (payload: TranslationRealtimePayload) => void;
  /** Error callback */
  onError?: (error: Error) => void;
  /** Connection status change callback */
  onConnectionChange?: (status: ConnectionStatus) => void;
}

/**
 * Return value from useTranslationRealtime hook
 */
export interface UseTranslationRealtimeReturn {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  connectionStatus: ConnectionStatus;

  // Actions
  subscribe: () => void;
  unsubscribe: () => void;

  // Metadata
  lastEvent: TranslationRealtimePayload | null;
  lastEventAt: Date | null;
  error: Error | null;
}

/**
 * Connection status enum
 */
export type ConnectionStatus = 'connected' | 'disconnected' | 'connecting' | 'error';

/**
 * Realtime event payload (transformed from Supabase payload)
 */
export interface TranslationRealtimePayload {
  /** Event type */
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  /** Source table */
  table: 'item_translations' | 'article_translations' | 'link_translations' | 'tag_translations';
  /** Entity ID */
  entityId: string;
  /** Entity type */
  entityType: 'item' | 'article' | 'link' | 'tag';
  /** Translation language */
  language: SupportedLanguage;
  /** Translation status (if available) */
  status?: TranslationStatus;
  /** Previous record (for UPDATE/DELETE) */
  old?: Record<string, unknown>;
  /** New record (for INSERT/UPDATE) */
  new?: Record<string, unknown>;
  /** Event timestamp */
  timestamp: Date;
}

/**
 * Internal hook state
 */
interface UseTranslationRealtimeState {
  connectionStatus: ConnectionStatus;
  lastEvent: TranslationRealtimePayload | null;
  lastEventAt: number | null;
  error: Error | null;
}
```

Import types from TranslationManagement.types.ts: SupportedLanguage, TranslationStatus.

### Step 2: Create Table Name and ID Column Mapping Helper
- **Description**: Build helper to map entity types to table names and ID columns
- **Rationale**: Centralize table/column naming logic for maintainability
- **Estimated Effort**: 20 minutes

Helper constants and function:

```typescript
/**
 * Mapping of entity types to translation table names
 */
const ENTITY_TO_TABLE_MAP: Record<string, string> = {
  item: 'item_translations',
  article: 'article_translations',
  link: 'link_translations',
  tag: 'tag_translations',
} as const;

/**
 * Mapping of entity types to ID column names
 */
const ENTITY_TO_ID_COLUMN_MAP: Record<string, string> = {
  item: 'item_id',
  article: 'article_id',
  link: 'link_id',
  tag: 'tag_id',
} as const;

/**
 * Gets table name and ID column for entity type
 */
function getTableConfig(entityType: string): { table: string; idColumn: string } {
  return {
    table: ENTITY_TO_TABLE_MAP[entityType],
    idColumn: ENTITY_TO_ID_COLUMN_MAP[entityType],
  };
}
```

### Step 3: Implement Payload Transformation Function
- **Description**: Create function to transform Supabase realtime payload to our consistent format
- **Rationale**: Abstract Supabase-specific payload structure from hook consumers
- **Estimated Effort**: 45 minutes

Transformation function:

```typescript
/**
 * Transforms Supabase realtime payload to TranslationRealtimePayload
 */
function transformPayload(
  supabasePayload: any,
  table: string
): TranslationRealtimePayload {
  // Determine entity type from table name
  const entityType = table.replace('_translations', '') as 'item' | 'article' | 'link' | 'tag';
  const { idColumn } = getTableConfig(entityType);

  // Extract entity ID from new or old record
  const record = supabasePayload.new || supabasePayload.old;
  const entityId = record?.[idColumn];

  return {
    eventType: supabasePayload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
    table: table as any,
    entityId,
    entityType,
    language: record?.language,
    status: record?.translation_status || record?.status,
    old: supabasePayload.old,
    new: supabasePayload.new,
    timestamp: new Date(supabasePayload.commit_timestamp || Date.now()),
  };
}
```

This handles variations in Supabase payload structure across different event types.

### Step 4: Implement SSR Safety Check
- **Description**: Add helper to detect server-side rendering and skip realtime
- **Rationale**: Supabase realtime uses WebSockets which don't work in SSR
- **Estimated Effort**: 15 minutes

SSR check:

```typescript
/**
 * Checks if code is running in browser (not SSR)
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined';
}
```

Use this guard at the start of effects to skip realtime setup during SSR.

### Step 5: Implement Hook State Management with useState
- **Description**: Set up React state for connection status, events, and errors
- **Rationale**: Manage component-level state following React hooks best practices
- **Estimated Effort**: 20 minutes

State initialization:

```typescript
const [state, setState] = useState<UseTranslationRealtimeState>({
  connectionStatus: options.enabled !== false ? 'connecting' : 'disconnected',
  lastEvent: null,
  lastEventAt: null,
  error: null,
});
```

### Step 6: Implement Channel Setup Logic with Multiple Table Subscriptions
- **Description**: Create function that sets up Supabase channel with subscriptions to all translation tables
- **Rationale**: Core realtime functionality with proper filtering
- **Estimated Effort**: 90 minutes

Channel setup function:

```typescript
const setupChannel = useCallback(() => {
  if (!isBrowser() || options.enabled === false) {
    return null;
  }

  // Create unique channel name
  const channelName = options.entityId
    ? `translation-updates-${options.entityType}-${options.entityId}`
    : options.propertyId
    ? `translation-updates-property-${options.propertyId}`
    : 'translation-updates-all';

  console.log(`useTranslationRealtime: Setting up channel "${channelName}"`);

  setState(prev => ({ ...prev, connectionStatus: 'connecting' }));

  // Create channel
  const channel = supabase.channel(channelName);

  // Subscribe to each translation table
  const tables: Array<'item' | 'article' | 'link' | 'tag'> = ['item', 'article', 'link', 'tag'];

  tables.forEach((entityType) => {
    // Skip if specific entity type requested and this isn't it
    if (options.entityType && options.entityType !== entityType) {
      return;
    }

    const { table, idColumn } = getTableConfig(entityType);

    // Build filter
    let filter: string | undefined;
    if (options.entityId && options.entityType) {
      filter = `${idColumn}=eq.${options.entityId}`;
    }
    // Note: propertyId filtering requires RLS policies on database side

    channel.on(
      'postgres_changes',
      {
        event: '*', // INSERT, UPDATE, DELETE
        schema: 'public',
        table,
        filter,
      },
      (payload) => {
        console.log(`useTranslationRealtime: Event on ${table}`, payload);

        const transformedPayload = transformPayload(payload, table);

        // Update state
        setState(prev => ({
          ...prev,
          lastEvent: transformedPayload,
          lastEventAt: Date.now(),
        }));

        // Call appropriate callbacks
        if (payload.eventType === 'INSERT' && options.onInsert) {
          options.onInsert(transformedPayload);
        }
        if (payload.eventType === 'UPDATE' && options.onUpdate) {
          options.onUpdate(transformedPayload);
        }
        if (payload.eventType === 'DELETE' && options.onDelete) {
          options.onDelete(transformedPayload);
        }
        if (options.onChange) {
          options.onChange(transformedPayload);
        }
      }
    );
  });

  // Subscribe to channel with status callback
  channel.subscribe((status) => {
    console.log(`useTranslationRealtime: Channel status changed to "${status}"`);

    let connectionStatus: ConnectionStatus;
    if (status === 'SUBSCRIBED') {
      connectionStatus = 'connected';
    } else if (status === 'CHANNEL_ERROR') {
      connectionStatus = 'error';
      const error = new Error('Realtime channel error');
      setState(prev => ({ ...prev, error }));
      options.onError?.(error);
    } else if (status === 'TIMED_OUT') {
      connectionStatus = 'error';
      const error = new Error('Realtime connection timed out');
      setState(prev => ({ ...prev, error }));
      options.onError?.(error);
    } else {
      connectionStatus = 'connecting';
    }

    setState(prev => ({ ...prev, connectionStatus }));
    options.onConnectionChange?.(connectionStatus);
  });

  return channel;
}, [
  options.enabled,
  options.entityId,
  options.entityType,
  options.propertyId,
  options.onInsert,
  options.onUpdate,
  options.onDelete,
  options.onChange,
  options.onError,
  options.onConnectionChange,
]);
```

Pattern reference: Supabase documentation for realtime channels.

### Step 7: Implement Main useEffect for Auto-Subscribe with Cleanup
- **Description**: Create effect that establishes subscription on mount and cleans up on unmount
- **Rationale**: Automatic subscription management with proper cleanup
- **Estimated Effort**: 60 minutes

Main effect:

```typescript
useEffect(() => {
  if (!isBrowser() || options.enabled === false) {
    setState(prev => ({ ...prev, connectionStatus: 'disconnected' }));
    return;
  }

  const channel = setupChannel();

  if (!channel) {
    return;
  }

  // Store channel ref for manual unsubscribe
  channelRef.current = channel;

  // Cleanup: unsubscribe on unmount or when options change
  return () => {
    console.log('useTranslationRealtime: Cleaning up channel subscription');
    if (channel) {
      supabase.removeChannel(channel);
      channelRef.current = null;
    }
    setState(prev => ({ ...prev, connectionStatus: 'disconnected' }));
  };
}, [
  options.enabled,
  options.entityId,
  options.entityType,
  options.propertyId,
  setupChannel,
]);
```

Use useRef to store channel reference for manual control:

```typescript
const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
```

### Step 8: Implement Manual Subscribe and Unsubscribe Functions
- **Description**: Create functions for manual subscription control
- **Rationale**: Support use cases where parent component controls subscription timing
- **Estimated Effort**: 30 minutes

Manual control functions:

```typescript
const subscribe = useCallback(() => {
  if (!isBrowser()) {
    console.warn('useTranslationRealtime: Cannot subscribe in SSR');
    return;
  }

  if (channelRef.current) {
    console.warn('useTranslationRealtime: Already subscribed');
    return;
  }

  console.log('useTranslationRealtime: Manual subscribe triggered');
  const channel = setupChannel();
  channelRef.current = channel;
}, [setupChannel]);

const unsubscribe = useCallback(() => {
  if (!channelRef.current) {
    console.warn('useTranslationRealtime: No active subscription to unsubscribe');
    return;
  }

  console.log('useTranslationRealtime: Manual unsubscribe triggered');
  supabase.removeChannel(channelRef.current);
  channelRef.current = null;
  setState(prev => ({ ...prev, connectionStatus: 'disconnected' }));
}, []);
```

### Step 9: Implement Return Value with Computed Properties
- **Description**: Create return object with state and action functions
- **Rationale**: Provide ergonomic API with clear semantics
- **Estimated Effort**: 20 minutes

Return value:

```typescript
return useMemo<UseTranslationRealtimeReturn>(() => ({
  // Connection state
  isConnected: state.connectionStatus === 'connected',
  isConnecting: state.connectionStatus === 'connecting',
  connectionStatus: state.connectionStatus,

  // Actions
  subscribe,
  unsubscribe,

  // Metadata
  lastEvent: state.lastEvent,
  lastEventAt: state.lastEventAt ? new Date(state.lastEventAt) : null,
  error: state.error,
}), [state, subscribe, unsubscribe]);
```

Use useMemo to prevent unnecessary re-renders.

### Step 10: Add JSDoc Documentation with Examples
- **Description**: Document hook function with comprehensive JSDoc comments
- **Rationale**: Provide clear API documentation for developers
- **Estimated Effort**: 30 minutes

JSDoc header:

```typescript
/**
 * Custom React hook for Supabase realtime subscriptions to translation tables
 *
 * Establishes realtime subscriptions to item_translations, article_translations,
 * link_translations, and tag_translations tables. Provides callbacks for INSERT,
 * UPDATE, and DELETE events.
 *
 * Features:
 * - Auto-subscribes on mount (when enabled=true)
 * - Filters by specific entity or entire property
 * - Callback notifications for all event types
 * - Connection state tracking
 * - Manual subscribe/unsubscribe control
 * - Automatic cleanup on unmount
 * - SSR-safe (skips subscription in server environment)
 *
 * @param options - Hook configuration options
 * @returns Hook return object with connection state and actions
 *
 * @example
 * // Auto-refresh translation status on changes
 * const { data, refetch } = useTranslationStatus({ entityId: 'item-123', entityType: 'item' });
 * useTranslationRealtime({
 *   entityId: 'item-123',
 *   entityType: 'item',
 *   onChange: () => refetch(),
 * });
 *
 * @example
 * // Manual subscription control
 * const { subscribe, unsubscribe, isConnected } = useTranslationRealtime({
 *   propertyId: 'prop-456',
 *   enabled: false,
 * });
 * // Later: subscribe() / unsubscribe()
 *
 * @example
 * // Conditional subscription based on panel state
 * useTranslationRealtime({
 *   entityId: selectedItem?.id,
 *   entityType: 'item',
 *   enabled: isPanelOpen && !!selectedItem,
 *   onUpdate: (payload) => {
 *     if (payload.status === 'complete') {
 *       toast.success(`${payload.language} translation completed`);
 *     }
 *   },
 * });
 */
export function useTranslationRealtime(
  options: UseTranslationRealtimeOptions
): UseTranslationRealtimeReturn {
  // Implementation...
}
```

### Step 11: Export Hook and Types from Barrel File
- **Description**: Add exports to src/hooks/index.ts barrel file
- **Rationale**: Enable clean imports from centralized location
- **Estimated Effort**: 10 minutes

Add to hooks/index.ts:

```typescript
// ============ Translation Hooks ============

export { useTranslationStatus } from './useTranslationStatus';
export { useTranslationRealtime } from './useTranslationRealtime';
export type {
  UseTranslationRealtimeOptions,
  UseTranslationRealtimeReturn,
  TranslationRealtimePayload,
  ConnectionStatus,
} from './useTranslationRealtime';
```

### Step 12: Manual Testing Checklist
- **Description**: Test hook with various configurations and scenarios
- **Rationale**: Ensure all functionality works correctly before integration
- **Estimated Effort**: 90 minutes

Test scenarios:
- [ ] **Single entity subscription**: Connects and receives events for specific entity
- [ ] **Property subscription**: Receives events for all entities in property
- [ ] **Connection states**: isConnected, isConnecting reflect actual state
- [ ] **INSERT events**: onInsert callback triggered when translation created
- [ ] **UPDATE events**: onUpdate callback triggered when translation updated
- [ ] **DELETE events**: onDelete callback triggered when translation deleted
- [ ] **onChange callback**: Triggered for all event types
- [ ] **onError callback**: Triggered on connection errors
- [ ] **onConnectionChange**: Called when connection status changes
- [ ] **lastEvent**: Populated with most recent payload
- [ ] **lastEventAt**: Timestamp updated on events
- [ ] **Manual subscribe**: subscribe() establishes connection
- [ ] **Manual unsubscribe**: unsubscribe() closes connection
- [ ] **enabled=false**: No subscription established
- [ ] **enabled change**: Subscription starts when enabled changes to true
- [ ] **Cleanup**: Subscription removed on unmount (no memory leak)
- [ ] **SSR safety**: No errors in server environment
- [ ] **Multiple tables**: Events received from all translation tables
- [ ] **Filter works**: Only events matching entityId received
- [ ] **Payload transformation**: TranslationRealtimePayload has correct structure
- [ ] **Reconnection**: Connection re-established after temporary disconnect

## Authorized Files and Functions for Modification

> ⚠️ **APPROVED SCOPE**: Changes outside this list require review

### New Files to Create
| File | Target | Type |
|------|--------|------|
| `/src/hooks/useTranslationRealtime.ts` | — | Create |

### Existing Files to Modify
| File | Target | Type |
|------|--------|------|
| `/src/hooks/index.ts` | Export statements | Modify - add useTranslationRealtime exports |

### Existing Files to Reference (Read-Only)
| File | Purpose |
|------|------------|
| `/src/lib/supabase.ts` | Import supabase client (line 708) |
| `/src/hooks/useTranslationStatus.ts` | Pattern reference for integration example |
| `/src/components/TranslationManagement/TranslationManagement.types.ts` | Import types (when REQ-E05-006 is completed) |

## Dependencies

### Depends On (Completed First)
- **REQ-E05-006**: TranslationManagement Types File
  - Provides: SupportedLanguage, TranslationStatus types
  - Status: Pending (not yet created)
  - Note: Hook can use temporary local types initially
  - Reason: Hook needs these types for payload structure
- **REQ-E05-011**: useTranslationStatus Hook
  - Provides: Integration pattern example (auto-refresh on realtime events)
  - Reason: Common use case is triggering refetch on realtime updates
  - Status: Should be completed for best integration examples
- **Existing**: Supabase client from @/lib/supabase (lines 708-715)
- **Existing**: React 18+ with hooks
- **External**: Supabase Realtime must be enabled in Supabase project settings

### Blocks (Requires This First)
- **REQ-E05-007**: TranslationPreviewPanel Component - will use this hook for live updates
- **Future**: Any translation management UI component that needs real-time updates
- **Integration**: Dashboard widgets showing live translation progress

### Parallel Safety
- **Files touched**:
  - `/src/hooks/useTranslationRealtime.ts` (new file)
  - `/src/hooks/index.ts` (export addition)
- **Conflicts with**: None - new hook in hooks directory
- **Safe to parallelize with**:
  - All Epic 5 UI component tasks (different scope)
  - REQ-E05-011 (useTranslationStatus) - different file, but better to complete first for integration
  - REQ-E05-001-003 (API endpoints) - different scope

### External Dependencies
- React 18+ with hooks (useState, useEffect, useCallback, useMemo, useRef)
- @supabase/supabase-js (Supabase JavaScript client)
- @supabase/ssr (for createBrowserClient)
- Supabase Realtime service enabled on project
- TypeScript 5.x with strict mode

## Risks and Considerations

### Potential Side Effects
- **WebSocket connection limits**: Browser limit on concurrent WebSocket connections
  - Mitigation: Supabase multiplexes channels over single WebSocket
  - Mitigation: Document best practice of single realtime subscription per component tree

- **Memory leaks**: Failed cleanup could cause memory/connection leaks
  - Mitigation: Comprehensive cleanup in useEffect return function
  - Mitigation: Test unmount behavior thoroughly

- **RLS policy dependency**: Realtime events respect RLS, but must be configured correctly
  - Mitigation: Document RLS requirements in hook JSDoc
  - Mitigation: Test with different user contexts

- **SSR hydration mismatch**: If not careful, SSR and client state could mismatch
  - Mitigation: isBrowser() check prevents SSR execution
  - Mitigation: Mark components using this hook with 'use client'

- **Callback closure issues**: Stale closures could capture old callback references
  - Mitigation: Include callbacks in useCallback dependencies
  - Mitigation: Document in JSDoc that callbacks should be stable (useCallback)

### Testing Requirements
- **Unit tests**:
  - Table/column mapping functions return correct values
  - Payload transformation creates correct structure
  - SSR check returns false in server environment
  - State updates correctly on connection status changes

- **Integration tests**:
  - Hook establishes Supabase channel subscription
  - Callbacks triggered on INSERT/UPDATE/DELETE events
  - Cleanup removes subscription on unmount
  - Manual subscribe/unsubscribe functions work
  - enabled flag controls subscription

- **Manual tests** (requires Supabase Realtime enabled):
  - Create translation in database, verify onInsert callback
  - Update translation, verify onUpdate callback
  - Delete translation, verify onDelete callback
  - Disconnect network, verify error state
  - Reconnect network, verify connection restored

- **Realtime tests** (Supabase Studio or direct DB access):
  - Insert row in item_translations via Studio, verify UI updates
  - Update translation_status column, verify callback triggered
  - Verify RLS policies filter events correctly

### Open Questions
- [ ] Should hook automatically reconnect with exponential backoff on connection errors?
  - Recommendation: No, rely on Supabase client's built-in reconnection logic
  - Rationale: Supabase handles reconnection automatically
- [ ] Should hook support subscribing to multiple channels simultaneously?
  - Recommendation: No, keep hook simple with single channel
  - Rationale: Parent can instantiate multiple hook instances if needed
- [ ] Should hook debounce rapid events to prevent callback spam?
  - Recommendation: No debouncing in hook, let parent component handle if needed
  - Rationale: Keep hook as thin wrapper over Supabase realtime
- [ ] Should hook track event history beyond last event?
  - Recommendation: No, only track lastEvent for simplicity
  - Rationale: Parent can maintain history if needed for their use case
- [ ] Should hook validate that Supabase Realtime is enabled before subscribing?
  - Recommendation: No, let Supabase client handle and surface errors
  - Rationale: Error callback will receive connection errors

## Out of Scope

The following are explicitly **not** included in this task:
- Automatic reconnection with exponential backoff (rely on Supabase client)
- Event history tracking beyond lastEvent
- Event debouncing or throttling (parent component responsibility)
- Multiple simultaneous channel subscriptions (use multiple hook instances)
- Offline queue for missed events (Supabase limitation)
- Event replay from history (Supabase doesn't support)
- Conflict resolution for concurrent updates (application logic)
- Optimistic updates or local state synchronization
- Broadcasting presence information (separate Supabase feature)
- Custom WebSocket message handling (Supabase abstraction)
- Connection quality metrics (latency, packet loss)
- Rate limiting or quota management
- Authentication token refresh on connection (Supabase handles)
- Binary data or file streaming
- P2P messaging between clients
- Channel encryption beyond Supabase defaults
- Custom serialization/deserialization
- TypeScript code generation from database schema
- Database migration or schema updates
- RLS policy creation or modification (database admin task)
- Supabase project configuration (enable Realtime in dashboard)

## Special Notes

### Supabase Realtime Architecture

Supabase Realtime uses PostgreSQL's logical replication feature:
1. Database captures changes via Write-Ahead Log (WAL)
2. Changes are streamed to Realtime server
3. Realtime server broadcasts to WebSocket clients
4. RLS policies filter events per client

**Important**: Realtime must be enabled in Supabase project settings.

### RLS Policy Requirements

For realtime subscriptions to respect user ownership:

**item_translations RLS policy example:**
```sql
CREATE POLICY "Users can read own item translations"
ON item_translations FOR SELECT
USING (
  item_id IN (
    SELECT id FROM items WHERE property_id IN (
      SELECT id FROM properties WHERE user_id = auth.uid()
    )
  )
);
```

Similar policies needed for article_translations, link_translations, tag_translations.

**Critical**: Realtime events are filtered by SELECT policies (not INSERT/UPDATE/DELETE).

### Channel Naming Convention

The hook creates unique channel names to prevent collisions:
- Single entity: `translation-updates-item-abc123`
- Property filter: `translation-updates-property-prop456`
- All updates: `translation-updates-all`

This enables multiple components to subscribe independently.

### Event Payload Structure

Supabase realtime payload varies by event type:

**INSERT:**
```javascript
{
  eventType: 'INSERT',
  new: { id: '...', item_id: '...', language: 'es', ... },
  old: null,
  commit_timestamp: '2026-01-22T19:22:00Z'
}
```

**UPDATE:**
```javascript
{
  eventType: 'UPDATE',
  new: { id: '...', item_id: '...', status: 'complete', ... },
  old: { id: '...', item_id: '...', status: 'pending', ... },
  commit_timestamp: '2026-01-22T19:22:05Z'
}
```

**DELETE:**
```javascript
{
  eventType: 'DELETE',
  new: null,
  old: { id: '...', item_id: '...', ... },
  commit_timestamp: '2026-01-22T19:22:10Z'
}
```

The `transformPayload` function normalizes these into consistent structure.

### Integration with useTranslationStatus

Common pattern: Auto-refresh translation status when realtime events occur:

```typescript
function TranslationPanel({ entityId }: { entityId: string }) {
  const { data, refetch } = useTranslationStatus({
    entityId,
    entityType: 'item',
  });

  useTranslationRealtime({
    entityId,
    entityType: 'item',
    onChange: (payload) => {
      console.log('Translation changed, refetching status...', payload);
      refetch();
    },
  });

  return <TranslationStatusList items={data.items} />;
}
```

This creates seamless real-time experience without polling.

### Connection Lifecycle

1. **Mount with enabled=true**: Hook calls setupChannel() → creates channel → subscribes → status='connecting' → SUBSCRIBED → status='connected'
2. **Options change**: Cleanup unsubscribes old channel → new channel created with updated filters
3. **enabled changes to false**: Unsubscribes → status='disconnected'
4. **Unmount**: Cleanup function calls removeChannel() → status='disconnected'

### Performance Considerations

Realtime subscriptions are lightweight but have limits:
- Each subscription uses single WebSocket connection (Supabase multiplexes)
- Browser limit: ~6 WebSocket connections per domain
- Supabase multiplexes all channels over 1-2 connections
- Recommended: ≤ 10 simultaneous subscriptions per page

**Best Practice**: Subscribe at highest component in tree, pass data down via props/context.

### Error Handling Strategy

Connection errors surface through:
1. `connectionStatus: 'error'`
2. `error` state populated
3. `onError` callback invoked

Supabase client automatically attempts reconnection.

**Graceful Degradation**: If realtime fails, UI still works with manual refresh.

### SSR and Hydration Safety

The hook is SSR-safe via `isBrowser()` check:
- Server: Hook does nothing, returns disconnected state
- Client: Hook establishes subscription after hydration

**Important**: Components using this hook should have 'use client' directive.

### Future Enhancement Opportunities

Potential improvements for future iterations:
1. **Presence tracking**: Show which users are viewing translation panel
2. **Typing indicators**: Show when other users are editing translations
3. **Conflict detection**: Warn when multiple users edit same translation
4. **Event history**: Maintain sliding window of recent events
5. **Connection quality metrics**: Track latency and packet loss
6. **Automatic retry**: Exponential backoff on persistent errors
7. **Batch event processing**: Debounce rapid events
8. **Offline queue**: Queue events when offline, sync when reconnected
9. **Custom filters**: Filter events client-side beyond database filters
10. **Performance monitoring**: Track subscription overhead

---
*Document generated: 2026-01-22 19:22*
