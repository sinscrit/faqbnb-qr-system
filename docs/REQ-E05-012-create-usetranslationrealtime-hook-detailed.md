# REQ-E05-012: Create useTranslationRealtime Hook - DETAILED TASK BREAKDOWN

**Generated**: 2026-01-22 23:01
**Request**: REQ-E05-012
**Epic**: Epic 5 - Owner Translation Management
**Phase**: 2 - Core UI Components
**Task ID**: 2.7

---

## Build & Test Commands

```bash
# Type checking
npm run typecheck

# Linting
npm run lint

# Build
npm run build

# Run development server
npm run dev

# Manual testing approach
# 1. Navigate to property dashboard
# 2. Open TranslationPreviewPanel (when implemented)
# 3. Open browser DevTools console
# 4. Trigger translation updates via Supabase Studio
# 5. Observe console logs showing realtime events
# 6. Verify callbacks are invoked and UI updates
```

---

## Task 1: Create Hook File with Base Structure

**Context**: Establish the hook file with imports and basic structure following React hooks best practices.

**Files to modify**:
- `/src/hooks/useTranslationRealtime.ts` (create new file)

**Estimated effort**: 15 minutes

**Subtasks**:
- [ ] **1.1** Create new file at `/src/hooks/useTranslationRealtime.ts`
- [ ] **1.2** Add 'use client' directive at top of file (required for Supabase realtime)
- [ ] **1.3** Import React hooks: `useState`, `useEffect`, `useCallback`, `useMemo`, `useRef` from 'react'
- [ ] **1.4** Import `supabase` from `@/lib/supabase` (line 708 reference)
- [ ] **1.5** Add TODO comment for type imports from TranslationManagement.types.ts (REQ-E05-006 dependency)
- [ ] **1.6** Create skeleton function `useTranslationRealtime` with empty body
- [ ] **1.7** Add initial comment explaining hook purpose (brief, will expand in Task 10)

---

## Task 2: Define TypeScript Interface for Hook Options

**Context**: Create the options interface that consumers pass to configure the hook, supporting single entity or property-wide subscriptions.

**Files to modify**:
- `/src/hooks/useTranslationRealtime.ts`

**Estimated effort**: 20 minutes

**Subtasks**:
- [ ] **2.1** Define `UseTranslationRealtimeOptions` interface with JSDoc comment
- [ ] **2.2** Add `entityId?: string` field with comment "Subscribe to updates for specific entity"
- [ ] **2.3** Add `entityType?: 'item' | 'article' | 'link' | 'tag'` field with comment "Entity type for single entity subscription"
- [ ] **2.4** Add `propertyId?: string` field with comment "Subscribe to all entities for a property"
- [ ] **2.5** Add `enabled?: boolean` field with comment "Enable/disable subscription (default: true)"
- [ ] **2.6** Add `onInsert?: (payload: TranslationRealtimePayload) => void` callback field
- [ ] **2.7** Add `onUpdate?: (payload: TranslationRealtimePayload) => void` callback field
- [ ] **2.8** Add `onDelete?: (payload: TranslationRealtimePayload) => void` callback field
- [ ] **2.9** Add `onChange?: (payload: TranslationRealtimePayload) => void` callback field (triggered for all events)
- [ ] **2.10** Add `onError?: (error: Error) => void` callback field
- [ ] **2.11** Add `onConnectionChange?: (status: ConnectionStatus) => void` callback field
- [ ] **2.12** Export interface with `export` keyword

---

## Task 3: Define TypeScript Interface for Hook Return Value

**Context**: Define the object structure returned by the hook, providing connection state and control functions.

**Files to modify**:
- `/src/hooks/useTranslationRealtime.ts`

**Estimated effort**: 15 minutes

**Subtasks**:
- [ ] **3.1** Define `UseTranslationRealtimeReturn` interface with JSDoc comment
- [ ] **3.2** Add `isConnected: boolean` field with comment "True when realtime connection is established"
- [ ] **3.3** Add `isConnecting: boolean` field with comment "True when connection is in progress"
- [ ] **3.4** Add `connectionStatus: ConnectionStatus` field
- [ ] **3.5** Add `subscribe: () => void` method field with comment "Manually start subscription"
- [ ] **3.6** Add `unsubscribe: () => void` method field with comment "Manually stop subscription"
- [ ] **3.7** Add `lastEvent: TranslationRealtimePayload | null` field
- [ ] **3.8** Add `lastEventAt: Date | null` field
- [ ] **3.9** Add `error: Error | null` field
- [ ] **3.10** Export interface with `export` keyword

---

## Task 4: Define ConnectionStatus Type

**Context**: Create type for connection state values used throughout the hook.

**Files to modify**:
- `/src/hooks/useTranslationRealtime.ts`

**Estimated effort**: 5 minutes

**Subtasks**:
- [ ] **4.1** Define `ConnectionStatus` type as union: `'connected' | 'disconnected' | 'connecting' | 'error'`
- [ ] **4.2** Add JSDoc comment explaining each state
- [ ] **4.3** Export type with `export` keyword

---

## Task 5: Define TranslationRealtimePayload Interface

**Context**: Create the normalized payload structure that transforms Supabase's raw realtime event into a consistent format.

**Files to modify**:
- `/src/hooks/useTranslationRealtime.ts`

**Estimated effort**: 20 minutes

**Subtasks**:
- [ ] **5.1** Define `TranslationRealtimePayload` interface with JSDoc comment
- [ ] **5.2** Add `eventType: 'INSERT' | 'UPDATE' | 'DELETE'` field
- [ ] **5.3** Add `table: 'item_translations' | 'article_translations' | 'link_translations' | 'tag_translations'` field
- [ ] **5.4** Add `entityId: string` field with comment "ID of the translated entity"
- [ ] **5.5** Add `entityType: 'item' | 'article' | 'link' | 'tag'` field
- [ ] **5.6** Add `language: string` field (TODO: replace with SupportedLanguage when REQ-E05-006 complete)
- [ ] **5.7** Add `status?: string` field (TODO: replace with TranslationStatus when REQ-E05-006 complete)
- [ ] **5.8** Add `old?: Record<string, unknown>` field with comment "Previous record (for UPDATE/DELETE)"
- [ ] **5.9** Add `new?: Record<string, unknown>` field with comment "New record (for INSERT/UPDATE)"
- [ ] **5.10** Add `timestamp: Date` field
- [ ] **5.11** Export interface with `export` keyword

---

## Task 6: Define Internal Hook State Interface

**Context**: Create interface for internal state management within the hook.

**Files to modify**:
- `/src/hooks/useTranslationRealtime.ts`

**Estimated effort**: 10 minutes

**Subtasks**:
- [ ] **6.1** Define `UseTranslationRealtimeState` interface (not exported)
- [ ] **6.2** Add `connectionStatus: ConnectionStatus` field
- [ ] **6.3** Add `lastEvent: TranslationRealtimePayload | null` field
- [ ] **6.4** Add `lastEventAt: number | null` field (using timestamp number for state)
- [ ] **6.5** Add `error: Error | null` field
- [ ] **6.6** Do NOT export (internal only)

---

## Task 7: Create Table Name Mapping Constants

**Context**: Define mappings from entity types to table names for Supabase queries.

**Files to modify**:
- `/src/hooks/useTranslationRealtime.ts`

**Estimated effort**: 10 minutes

**Subtasks**:
- [ ] **7.1** Define `ENTITY_TO_TABLE_MAP` constant with `as const` assertion
- [ ] **7.2** Add mapping: `item: 'item_translations'`
- [ ] **7.3** Add mapping: `article: 'article_translations'`
- [ ] **7.4** Add mapping: `link: 'link_translations'`
- [ ] **7.5** Add mapping: `tag: 'tag_translations'`
- [ ] **7.6** Add JSDoc comment explaining purpose

---

## Task 8: Create ID Column Mapping Constants

**Context**: Define mappings from entity types to their foreign key column names in translation tables.

**Files to modify**:
- `/src/hooks/useTranslationRealtime.ts`

**Estimated effort**: 10 minutes

**Subtasks**:
- [ ] **8.1** Define `ENTITY_TO_ID_COLUMN_MAP` constant with `as const` assertion
- [ ] **8.2** Add mapping: `item: 'item_id'`
- [ ] **8.3** Add mapping: `article: 'article_id'`
- [ ] **8.4** Add mapping: `link: 'link_id'`
- [ ] **8.5** Add mapping: `tag: 'tag_id'`
- [ ] **8.6** Add JSDoc comment explaining purpose

---

## Task 9: Implement getTableConfig Helper Function

**Context**: Create helper that returns table name and ID column for an entity type.

**Files to modify**:
- `/src/hooks/useTranslationRealtime.ts`

**Estimated effort**: 15 minutes

**Subtasks**:
- [ ] **9.1** Define function signature: `function getTableConfig(entityType: string): { table: string; idColumn: string }`
- [ ] **9.2** Add JSDoc comment with @param and @returns
- [ ] **9.3** Return object with `table: ENTITY_TO_TABLE_MAP[entityType]`
- [ ] **9.4** Include `idColumn: ENTITY_TO_ID_COLUMN_MAP[entityType]` in return object
- [ ] **9.5** Place function before main hook function

---

## Task 10: Implement transformPayload Helper Function

**Context**: Transform Supabase's raw realtime payload into our normalized TranslationRealtimePayload format.

**Files to modify**:
- `/src/hooks/useTranslationRealtime.ts`

**Estimated effort**: 30 minutes

**Subtasks**:
- [ ] **10.1** Define function signature: `function transformPayload(supabasePayload: any, table: string): TranslationRealtimePayload`
- [ ] **10.2** Add comprehensive JSDoc comment explaining transformation logic
- [ ] **10.3** Extract entity type from table name: `table.replace('_translations', '') as 'item' | 'article' | 'link' | 'tag'`
- [ ] **10.4** Call `getTableConfig(entityType)` to get ID column name
- [ ] **10.5** Extract record from `supabasePayload.new || supabasePayload.old`
- [ ] **10.6** Extract entity ID: `record?.[idColumn]`
- [ ] **10.7** Build return object with `eventType` from `supabasePayload.eventType`
- [ ] **10.8** Add `table` (cast to proper type)
- [ ] **10.9** Add `entityId` and `entityType`
- [ ] **10.10** Add `language` from `record?.language`
- [ ] **10.11** Add `status` from `record?.translation_status || record?.status` (handle both column names)
- [ ] **10.12** Add `old: supabasePayload.old`
- [ ] **10.13** Add `new: supabasePayload.new`
- [ ] **10.14** Add `timestamp: new Date(supabasePayload.commit_timestamp || Date.now())`
- [ ] **10.15** Return constructed payload

---

## Task 11: Implement isBrowser Helper Function

**Context**: Check if code is running in browser (not server-side rendering) since Supabase realtime requires browser environment.

**Files to modify**:
- `/src/hooks/useTranslationRealtime.ts`

**Estimated effort**: 5 minutes

**Subtasks**:
- [ ] **11.1** Define function: `function isBrowser(): boolean`
- [ ] **11.2** Add JSDoc comment explaining SSR safety
- [ ] **11.3** Return `typeof window !== 'undefined'`

---

## Task 12: Initialize Hook State with useState

**Context**: Set up React state to track connection status, events, and errors.

**Files to modify**:
- `/src/hooks/useTranslationRealtime.ts`

**Estimated effort**: 15 minutes

**Subtasks**:
- [ ] **12.1** Update function signature: `export function useTranslationRealtime(options: UseTranslationRealtimeOptions): UseTranslationRealtimeReturn`
- [ ] **12.2** Add `useState` call with `UseTranslationRealtimeState` type
- [ ] **12.3** Initialize `connectionStatus` to `'connecting'` if `options.enabled !== false`, otherwise `'disconnected'`
- [ ] **12.4** Initialize `lastEvent` to `null`
- [ ] **12.5** Initialize `lastEventAt` to `null`
- [ ] **12.6** Initialize `error` to `null`
- [ ] **12.7** Destructure to `[state, setState]`

---

## Task 13: Create Channel Reference with useRef

**Context**: Store Supabase channel reference to enable manual subscribe/unsubscribe.

**Files to modify**:
- `/src/hooks/useTranslationRealtime.ts`

**Estimated effort**: 5 minutes

**Subtasks**:
- [ ] **13.1** Add `useRef` call: `const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)`
- [ ] **13.2** Place after useState declaration

---

## Task 14: Implement setupChannel Function - Part 1 (Structure)

**Context**: Create the core function that establishes Supabase realtime channel with proper guards and channel naming.

**Files to modify**:
- `/src/hooks/useTranslationRealtime.ts`

**Estimated effort**: 20 minutes

**Subtasks**:
- [ ] **14.1** Define function: `const setupChannel = useCallback(() => { ... }, [dependencies])`
- [ ] **14.2** Add SSR guard: `if (!isBrowser() || options.enabled === false) { return null; }`
- [ ] **14.3** Create channel name based on filter type using ternary
- [ ] **14.4** If `options.entityId`: use `translation-updates-${options.entityType}-${options.entityId}`
- [ ] **14.5** Else if `options.propertyId`: use `translation-updates-property-${options.propertyId}`
- [ ] **14.6** Else: use `translation-updates-all`
- [ ] **14.7** Add console.log: `useTranslationRealtime: Setting up channel "${channelName}"`
- [ ] **14.8** Update state to `connectionStatus: 'connecting'` using setState
- [ ] **14.9** Create channel: `const channel = supabase.channel(channelName)`

---

## Task 15: Implement setupChannel Function - Part 2 (Table Subscriptions)

**Context**: Subscribe to postgres_changes events on all translation tables with appropriate filters.

**Files to modify**:
- `/src/hooks/useTranslationRealtime.ts`

**Estimated effort**: 40 minutes

**Subtasks**:
- [ ] **15.1** Define tables array: `const tables: Array<'item' | 'article' | 'link' | 'tag'> = ['item', 'article', 'link', 'tag']`
- [ ] **15.2** Add forEach loop: `tables.forEach((entityType) => { ... })`
- [ ] **15.3** Skip iteration if `options.entityType` is set and doesn't match current entityType
- [ ] **15.4** Call `getTableConfig(entityType)` to get table name and ID column
- [ ] **15.5** Build filter string: if `options.entityId && options.entityType`, set `filter = \`${idColumn}=eq.${options.entityId}\``
- [ ] **15.6** Otherwise set `filter = undefined`
- [ ] **15.7** Add comment about property filtering relying on RLS policies
- [ ] **15.8** Call `channel.on('postgres_changes', config, handler)`
- [ ] **15.9** Set config object with `event: '*'` (all events)
- [ ] **15.10** Set `schema: 'public'`
- [ ] **15.11** Set `table` to table name from config
- [ ] **15.12** Set `filter` (if defined)

---

## Task 16: Implement setupChannel Function - Part 3 (Event Handler)

**Context**: Handle incoming realtime events, transform payload, update state, and invoke callbacks.

**Files to modify**:
- `/src/hooks/useTranslationRealtime.ts`

**Estimated effort**: 35 minutes

**Subtasks**:
- [ ] **16.1** Define handler function: `(payload) => { ... }`
- [ ] **16.2** Add console.log: `useTranslationRealtime: Event on ${table}` with payload
- [ ] **16.3** Transform payload: `const transformedPayload = transformPayload(payload, table)`
- [ ] **16.4** Update state with setState: set `lastEvent` to transformedPayload
- [ ] **16.5** Set `lastEventAt` to `Date.now()`
- [ ] **16.6** Check if `payload.eventType === 'INSERT'` and `options.onInsert` exists, call it
- [ ] **16.7** Check if `payload.eventType === 'UPDATE'` and `options.onUpdate` exists, call it
- [ ] **16.8** Check if `payload.eventType === 'DELETE'` and `options.onDelete` exists, call it
- [ ] **16.9** Check if `options.onChange` exists, call it (for all event types)
- [ ] **16.10** Pass `transformedPayload` to all callback invocations

---

## Task 17: Implement setupChannel Function - Part 4 (Channel Subscribe with Status)

**Context**: Subscribe to the channel with status callback that tracks connection state changes.

**Files to modify**:
- `/src/hooks/useTranslationRealtime.ts`

**Estimated effort**: 30 minutes

**Subtasks**:
- [ ] **17.1** After forEach loop, call `channel.subscribe((status) => { ... })`
- [ ] **17.2** Add console.log: `useTranslationRealtime: Channel status changed to "${status}"`
- [ ] **17.3** Declare variable: `let connectionStatus: ConnectionStatus`
- [ ] **17.4** If `status === 'SUBSCRIBED'`, set `connectionStatus = 'connected'`
- [ ] **17.5** Else if `status === 'CHANNEL_ERROR'`, set `connectionStatus = 'error'`
- [ ] **17.6** For CHANNEL_ERROR, create error: `const error = new Error('Realtime channel error')`
- [ ] **17.7** Update state with error using setState
- [ ] **17.8** Call `options.onError?.(error)` if exists
- [ ] **17.9** Else if `status === 'TIMED_OUT'`, set `connectionStatus = 'error'`
- [ ] **17.10** For TIMED_OUT, create error: `const error = new Error('Realtime connection timed out')`
- [ ] **17.11** Update state with error using setState
- [ ] **17.12** Call `options.onError?.(error)` if exists
- [ ] **17.13** Else (other statuses), set `connectionStatus = 'connecting'`
- [ ] **17.14** Update state with new connectionStatus using setState
- [ ] **17.15** Call `options.onConnectionChange?.(connectionStatus)` if exists
- [ ] **17.16** Return channel from setupChannel function

---

## Task 18: Add setupChannel useCallback Dependencies

**Context**: Define dependency array for useCallback to ensure proper re-creation when options change.

**Files to modify**:
- `/src/hooks/useTranslationRealtime.ts`

**Estimated effort**: 10 minutes

**Subtasks**:
- [ ] **18.1** Add dependency array as second argument to useCallback
- [ ] **18.2** Include `options.enabled`
- [ ] **18.3** Include `options.entityId`
- [ ] **18.4** Include `options.entityType`
- [ ] **18.5** Include `options.propertyId`
- [ ] **18.6** Include `options.onInsert`
- [ ] **18.7** Include `options.onUpdate`
- [ ] **18.8** Include `options.onDelete`
- [ ] **18.9** Include `options.onChange`
- [ ] **18.10** Include `options.onError`
- [ ] **18.11** Include `options.onConnectionChange`

---

## Task 19: Implement Main useEffect for Auto-Subscribe

**Context**: Automatically establish subscription on mount and when relevant options change.

**Files to modify**:
- `/src/hooks/useTranslationRealtime.ts`

**Estimated effort**: 20 minutes

**Subtasks**:
- [ ] **19.1** Add useEffect: `useEffect(() => { ... }, [dependencies])`
- [ ] **19.2** Add SSR guard: if `!isBrowser() || options.enabled === false`, update state to disconnected and return
- [ ] **19.3** Call `const channel = setupChannel()`
- [ ] **19.4** Guard check: if `!channel`, return early
- [ ] **19.5** Store channel in ref: `channelRef.current = channel`
- [ ] **19.6** Return cleanup function: `return () => { ... }`
- [ ] **19.7** In cleanup, add console.log: `useTranslationRealtime: Cleaning up channel subscription`
- [ ] **19.8** In cleanup, check if channel exists, call `supabase.removeChannel(channel)`
- [ ] **19.9** In cleanup, set `channelRef.current = null`
- [ ] **19.10** In cleanup, update state to `connectionStatus: 'disconnected'`

---

## Task 20: Add useEffect Dependencies

**Context**: Define dependency array to trigger re-subscription when filter options change.

**Files to modify**:
- `/src/hooks/useTranslationRealtime.ts`

**Estimated effort**: 5 minutes

**Subtasks**:
- [ ] **20.1** Add dependency array to useEffect
- [ ] **20.2** Include `options.enabled`
- [ ] **20.3** Include `options.entityId`
- [ ] **20.4** Include `options.entityType`
- [ ] **20.5** Include `options.propertyId`
- [ ] **20.6** Include `setupChannel` function

---

## Task 21: Implement Manual subscribe Function

**Context**: Create function to manually start subscription when not using auto-subscribe.

**Files to modify**:
- `/src/hooks/useTranslationRealtime.ts`

**Estimated effort**: 15 minutes

**Subtasks**:
- [ ] **21.1** Define function: `const subscribe = useCallback(() => { ... }, [setupChannel])`
- [ ] **21.2** Add SSR guard: if `!isBrowser()`, log warning and return
- [ ] **21.3** Check if already subscribed: if `channelRef.current`, log warning and return
- [ ] **21.4** Add console.log: `useTranslationRealtime: Manual subscribe triggered`
- [ ] **21.5** Call `const channel = setupChannel()`
- [ ] **21.6** Store in ref: `channelRef.current = channel`
- [ ] **21.7** Place function after useEffect

---

## Task 22: Implement Manual unsubscribe Function

**Context**: Create function to manually stop subscription and clean up channel.

**Files to modify**:
- `/src/hooks/useTranslationRealtime.ts`

**Estimated effort**: 15 minutes

**Subtasks**:
- [ ] **22.1** Define function: `const unsubscribe = useCallback(() => { ... }, [])`
- [ ] **22.2** Check if no subscription: if `!channelRef.current`, log warning and return
- [ ] **22.3** Add console.log: `useTranslationRealtime: Manual unsubscribe triggered`
- [ ] **22.4** Call `supabase.removeChannel(channelRef.current)`
- [ ] **22.5** Set `channelRef.current = null`
- [ ] **22.6** Update state to `connectionStatus: 'disconnected'`
- [ ] **22.7** Place function after subscribe function

---

## Task 23: Implement Return Value with useMemo

**Context**: Construct and memoize the return object with connection state and control functions.

**Files to modify**:
- `/src/hooks/useTranslationRealtime.ts`

**Estimated effort**: 20 minutes

**Subtasks**:
- [ ] **23.1** Define return: `return useMemo<UseTranslationRealtimeReturn>(() => ({ ... }), [dependencies])`
- [ ] **23.2** Add `isConnected` computed from `state.connectionStatus === 'connected'`
- [ ] **23.3** Add `isConnecting` computed from `state.connectionStatus === 'connecting'`
- [ ] **23.4** Add `connectionStatus: state.connectionStatus`
- [ ] **23.5** Add `subscribe` function reference
- [ ] **23.6** Add `unsubscribe` function reference
- [ ] **23.7** Add `lastEvent: state.lastEvent`
- [ ] **23.8** Add `lastEventAt` computed: `state.lastEventAt ? new Date(state.lastEventAt) : null`
- [ ] **23.9** Add `error: state.error`
- [ ] **23.10** Add dependency array: `[state, subscribe, unsubscribe]`

---

## Task 24: Add Comprehensive JSDoc to Hook Function

**Context**: Document the hook with detailed JSDoc including purpose, features, parameters, return value, and usage examples.

**Files to modify**:
- `/src/hooks/useTranslationRealtime.ts`

**Estimated effort**: 30 minutes

**Subtasks**:
- [ ] **24.1** Add JSDoc block above function: `/**`
- [ ] **24.2** Add description: "Custom React hook for Supabase realtime subscriptions to translation tables"
- [ ] **24.3** Add blank line and longer description about subscribing to translation events
- [ ] **24.4** Add "Features:" section listing 7 key features (auto-subscribe, filtering, callbacks, state tracking, etc.)
- [ ] **24.5** Add `@param options` with description
- [ ] **24.6** Add `@returns` with description
- [ ] **24.7** Add first `@example` showing auto-refresh pattern with useTranslationStatus integration
- [ ] **24.8** Add second `@example` showing manual subscription control with enabled=false
- [ ] **24.9** Add third `@example` showing conditional subscription based on panel state
- [ ] **24.10** Close JSDoc block with `*/`

---

## Task 25: Export Hook and Types from Barrel File

**Context**: Add exports to `/src/hooks/index.ts` to enable clean imports from centralized location.

**Files to modify**:
- `/src/hooks/index.ts`

**Estimated effort**: 10 minutes

**Subtasks**:
- [ ] **25.1** Open `/src/hooks/index.ts` file
- [ ] **25.2** Find or create "Translation Hooks" section with comment header
- [ ] **25.3** Add export for useTranslationStatus if not already present (from REQ-E05-011)
- [ ] **25.4** Add named export: `export { useTranslationRealtime } from './useTranslationRealtime'`
- [ ] **25.5** Add type exports: `export type { UseTranslationRealtimeOptions } from './useTranslationRealtime'`
- [ ] **25.6** Add type export: `export type { UseTranslationRealtimeReturn } from './useTranslationRealtime'`
- [ ] **25.7** Add type export: `export type { TranslationRealtimePayload } from './useTranslationRealtime'`
- [ ] **25.8** Add type export: `export type { ConnectionStatus } from './useTranslationRealtime'`
- [ ] **25.9** Verify alphabetical or logical ordering of exports
- [ ] **25.10** Save file

---

## Task 26: Verify TypeScript Compilation

**Context**: Ensure the hook compiles without errors and types are correctly inferred.

**Files to modify**:
- None (verification only)

**Estimated effort**: 10 minutes

**Subtasks**:
- [ ] **26.1** Run `npm run typecheck` from project root
- [ ] **26.2** Verify no TypeScript errors in useTranslationRealtime.ts
- [ ] **26.3** Verify no errors in hooks/index.ts
- [ ] **26.4** Check that options interface has correct property types
- [ ] **26.5** Check that return type has correct property types
- [ ] **26.6** Verify TranslationRealtimePayload structure matches expectations
- [ ] **26.7** Test import in another file: `import { useTranslationRealtime } from '@/hooks'`
- [ ] **26.8** Verify IDE autocomplete works for options and return value

---

## Task 27: Create Manual Test Component (Optional Dev Tool)

**Context**: Create a simple test component to verify hook behavior during development.

**Files to modify**:
- Create `/src/components/dev/TranslationRealtimeTest.tsx` (temporary file)

**Estimated effort**: 20 minutes

**Subtasks**:
- [ ] **27.1** Create file at `/src/components/dev/TranslationRealtimeTest.tsx`
- [ ] **27.2** Add 'use client' directive
- [ ] **27.3** Import useTranslationRealtime from @/hooks
- [ ] **27.4** Import useState from react
- [ ] **27.5** Create component: `export default function TranslationRealtimeTest()`
- [ ] **27.6** Add state for entityId: `const [entityId, setEntityId] = useState('')`
- [ ] **27.7** Add state for events list: `const [events, setEvents] = useState<any[]>([])`
- [ ] **27.8** Call hook with test options: pass entityId, entityType='item', enabled=!!entityId
- [ ] **27.9** Pass onChange callback that adds event to events array
- [ ] **27.10** Render input for entityId with label
- [ ] **27.11** Render connection status badge
- [ ] **27.12** Render list of received events with timestamp
- [ ] **27.13** Add button to clear events list
- [ ] **27.14** Add instructions comment at top explaining how to test

---

## Task 28: Manual Testing - Connection Setup

**Context**: Verify hook establishes Supabase realtime connection correctly.

**Files to modify**:
- None (manual testing)

**Estimated effort**: 15 minutes

**Subtasks**:
- [ ] **28.1** Add test component to a page: `import TranslationRealtimeTest from '@/components/dev/TranslationRealtimeTest'`
- [ ] **28.2** Start dev server: `npm run dev`
- [ ] **28.3** Navigate to page with test component
- [ ] **28.4** Open browser DevTools console
- [ ] **28.5** Verify console log: "Setting up channel" appears
- [ ] **28.6** Verify console log: "Channel status changed to SUBSCRIBED" appears
- [ ] **28.7** Check connection status badge shows "connected"
- [ ] **28.8** Verify no error messages in console
- [ ] **28.9** Check Network tab for WebSocket connection to Supabase

---

## Task 29: Manual Testing - INSERT Event

**Context**: Verify hook receives and processes INSERT events when translation is created.

**Files to modify**:
- None (manual testing)

**Estimated effort**: 15 minutes

**Subtasks**:
- [ ] **29.1** Get a valid item_id from database (check Supabase Studio)
- [ ] **29.2** Enter item ID in test component input
- [ ] **29.3** Open Supabase Studio in separate tab
- [ ] **29.4** Navigate to item_translations table
- [ ] **29.5** Insert new row with item_id, language='es', status='pending'
- [ ] **29.6** Switch back to app browser tab
- [ ] **29.7** Verify console log shows "Event on item_translations"
- [ ] **29.8** Verify events list in component shows new event
- [ ] **29.9** Check event payload has eventType='INSERT'
- [ ] **29.10** Verify entity ID matches inserted item_id
- [ ] **29.11** Verify language field is 'es'

---

## Task 30: Manual Testing - UPDATE Event

**Context**: Verify hook receives and processes UPDATE events when translation is modified.

**Files to modify**:
- None (manual testing)

**Estimated effort**: 15 minutes

**Subtasks**:
- [ ] **30.1** Keep test component open with same entity ID
- [ ] **30.2** In Supabase Studio, find the translation row created in Task 29
- [ ] **30.3** Update the status field to 'complete'
- [ ] **30.4** Switch back to app browser tab
- [ ] **30.5** Verify console log shows "Event on item_translations"
- [ ] **30.6** Verify events list shows UPDATE event
- [ ] **30.7** Check event payload has eventType='UPDATE'
- [ ] **30.8** Verify payload.old has status='pending'
- [ ] **30.9** Verify payload.new has status='complete'
- [ ] **30.10** Confirm lastEventAt timestamp is updated

---

## Task 31: Manual Testing - DELETE Event

**Context**: Verify hook receives and processes DELETE events when translation is removed.

**Files to modify**:
- None (manual testing)

**Estimated effort**: 10 minutes

**Subtasks**:
- [ ] **31.1** Keep test component open with same entity ID
- [ ] **31.2** In Supabase Studio, delete the translation row
- [ ] **31.3** Switch back to app browser tab
- [ ] **31.4** Verify console log shows "Event on item_translations"
- [ ] **31.5** Verify events list shows DELETE event
- [ ] **31.6** Check event payload has eventType='DELETE'
- [ ] **31.7** Verify payload.old contains the deleted row data
- [ ] **31.8** Verify payload.new is null or undefined

---

## Task 32: Manual Testing - Callback Invocation

**Context**: Verify all callback functions are invoked correctly for their respective event types.

**Files to modify**:
- `/src/components/dev/TranslationRealtimeTest.tsx`

**Estimated effort**: 20 minutes

**Subtasks**:
- [ ] **32.1** Modify test component to add state for callback tracking
- [ ] **32.2** Add onInsert callback that logs and updates state
- [ ] **32.3** Add onUpdate callback that logs and updates state
- [ ] **32.4** Add onDelete callback that logs and updates state
- [ ] **32.5** Add onChange callback that logs to console
- [ ] **32.6** Render callback invocation counts in component
- [ ] **32.7** Perform INSERT via Supabase Studio
- [ ] **32.8** Verify onInsert count increments and onChange is called
- [ ] **32.9** Perform UPDATE via Supabase Studio
- [ ] **32.10** Verify onUpdate count increments and onChange is called
- [ ] **32.11** Perform DELETE via Supabase Studio
- [ ] **32.12** Verify onDelete count increments and onChange is called

---

## Task 33: Manual Testing - Enabled Toggle

**Context**: Verify enabled flag controls subscription lifecycle.

**Files to modify**:
- `/src/components/dev/TranslationRealtimeTest.tsx`

**Estimated effort**: 15 minutes

**Subtasks**:
- [ ] **33.1** Modify test component to add enabled toggle checkbox
- [ ] **33.2** Pass enabled state to hook options
- [ ] **33.3** Start with enabled=false
- [ ] **33.4** Verify connection status shows "disconnected"
- [ ] **33.5** Verify no channel setup console logs appear
- [ ] **33.6** Toggle enabled to true
- [ ] **33.7** Verify "Setting up channel" log appears
- [ ] **33.8** Verify connection status changes to "connected"
- [ ] **33.9** Toggle enabled back to false
- [ ] **33.10** Verify "Cleaning up channel subscription" log appears
- [ ] **33.11** Verify connection status changes to "disconnected"

---

## Task 34: Manual Testing - Manual Subscribe/Unsubscribe

**Context**: Verify manual control functions work correctly.

**Files to modify**:
- `/src/components/dev/TranslationRealtimeTest.tsx`

**Estimated effort**: 15 minutes

**Subtasks**:
- [ ] **34.1** Modify test component to add Subscribe and Unsubscribe buttons
- [ ] **34.2** Pass enabled=false to hook options
- [ ] **34.3** Wire subscribe button to call subscribe() from hook return
- [ ] **34.4** Wire unsubscribe button to call unsubscribe() from hook return
- [ ] **34.5** Click Subscribe button
- [ ] **34.6** Verify "Manual subscribe triggered" log appears
- [ ] **34.7** Verify connection status changes to "connected"
- [ ] **34.8** Click Subscribe again
- [ ] **34.9** Verify warning log: "Already subscribed"
- [ ] **34.10** Click Unsubscribe button
- [ ] **34.11** Verify "Manual unsubscribe triggered" log appears
- [ ] **34.12** Verify connection status changes to "disconnected"

---

## Task 35: Manual Testing - Multiple Tables

**Context**: Verify hook receives events from all translation tables (item, article, link, tag).

**Files to modify**:
- None (manual testing)

**Estimated effort**: 20 minutes

**Subtasks**:
- [ ] **35.1** Modify test component to accept entityType prop
- [ ] **35.2** Test with entityType='item' and insert into item_translations
- [ ] **35.3** Verify event received and table field is 'item_translations'
- [ ] **35.4** Change to entityType='article' with valid article_id
- [ ] **35.5** Insert into article_translations via Supabase Studio
- [ ] **35.6** Verify event received and table field is 'article_translations'
- [ ] **35.7** Change to entityType='link' with valid link_id
- [ ] **35.8** Insert into link_translations via Supabase Studio
- [ ] **35.9** Verify event received and table field is 'link_translations'
- [ ] **35.10** Change to entityType='tag' with valid tag_id (if tag translations implemented)
- [ ] **35.11** Verify event received and table field is 'tag_translations' (or skip if not yet implemented)

---

## Task 36: Manual Testing - Cleanup on Unmount

**Context**: Verify subscription is properly cleaned up when component unmounts to prevent memory leaks.

**Files to modify**:
- None (manual testing)

**Estimated effort**: 10 minutes

**Subtasks**:
- [ ] **36.1** Keep test component mounted with active subscription
- [ ] **36.2** Verify connection status shows "connected"
- [ ] **36.3** Navigate away from page (or conditionally unmount component)
- [ ] **36.4** Check console for "Cleaning up channel subscription" log
- [ ] **36.5** Check Network tab to verify WebSocket closes (if only subscription)
- [ ] **36.6** Navigate back to page
- [ ] **36.7** Verify new subscription is established with fresh logs
- [ ] **36.8** Verify no duplicate subscriptions (check console logs)
- [ ] **36.9** Repeat mount/unmount cycle 3 times
- [ ] **36.10** Verify no errors or warnings about memory leaks

---

## Task 37: Manual Testing - Property Filter (RLS-Dependent)

**Context**: Verify propertyId filter works correctly (depends on RLS policies being configured).

**Files to modify**:
- `/src/components/dev/TranslationRealtimeTest.tsx`

**Estimated effort**: 15 minutes

**Subtasks**:
- [ ] **37.1** Modify test component to accept propertyId instead of entityId
- [ ] **37.2** Pass propertyId option to hook (remove entityId and entityType)
- [ ] **37.3** Get valid property_id from database that user owns
- [ ] **37.4** Enter property ID in test component
- [ ] **37.5** Verify channel name includes "property-{id}" in console log
- [ ] **37.6** Insert translation for any entity in that property
- [ ] **37.7** Verify event is received
- [ ] **37.8** Insert translation for entity in different property
- [ ] **37.9** Verify event is NOT received (filtered by RLS)
- [ ] **37.10** Note: If RLS not yet configured for propertyId filtering, document as future test requirement

---

## Task 38: Integration Testing - useTranslationStatus Auto-Refetch Pattern

**Context**: Verify hook integrates correctly with useTranslationStatus for automatic UI refresh.

**Files to modify**:
- `/src/components/dev/TranslationRealtimeTest.tsx`

**Estimated effort**: 20 minutes

**Subtasks**:
- [ ] **38.1** Import useTranslationStatus from @/hooks (if REQ-E05-011 complete)
- [ ] **38.2** Modify test component to call both hooks
- [ ] **38.3** Add state to track refetch count: `const [refetchCount, setRefetchCount] = useState(0)`
- [ ] **38.4** Get refetch function from useTranslationStatus
- [ ] **38.5** Pass onChange callback to useTranslationRealtime that calls refetch and increments count
- [ ] **38.6** Render translation status data from useTranslationStatus
- [ ] **38.7** Render refetch count
- [ ] **38.8** Insert translation via Supabase Studio
- [ ] **38.9** Verify onChange callback fires
- [ ] **38.10** Verify refetch count increments
- [ ] **38.11** Verify translation status data updates with new translation
- [ ] **38.12** Update translation status via Supabase Studio
- [ ] **38.13** Verify UI reflects updated status without manual refresh

---

## Task 39: Error Handling Testing - Connection Errors

**Context**: Verify hook handles connection errors gracefully and invokes error callbacks.

**Files to modify**:
- `/src/components/dev/TranslationRealtimeTest.tsx`

**Estimated effort**: 15 minutes

**Subtasks**:
- [ ] **39.1** Modify test component to track errors: `const [errors, setErrors] = useState<Error[]>([])`
- [ ] **39.2** Pass onError callback that adds error to errors array
- [ ] **39.3** Pass onConnectionChange callback that logs status changes
- [ ] **39.4** Render error list in component
- [ ] **39.5** Start subscription with valid options
- [ ] **39.6** Simulate network disconnect (disable Wi-Fi or use DevTools offline mode)
- [ ] **39.7** Wait for connection timeout (~30 seconds)
- [ ] **39.8** Verify connectionStatus changes to 'error'
- [ ] **39.9** Verify onError callback invoked with timeout error
- [ ] **39.10** Re-enable network
- [ ] **39.11** Verify Supabase client attempts reconnection automatically
- [ ] **39.12** Verify connectionStatus returns to 'connected' (or verify manual reconnection needed)

---

## Task 40: SSR Safety Testing

**Context**: Verify hook doesn't crash or cause hydration errors in SSR environment.

**Files to modify**:
- None (testing only)

**Estimated effort**: 10 minutes

**Subtasks**:
- [ ] **40.1** Verify test component has 'use client' directive (required for realtime)
- [ ] **40.2** Build app for production: `npm run build`
- [ ] **40.3** Verify no build errors related to useTranslationRealtime
- [ ] **40.4** Start production server: `npm start`
- [ ] **40.5** Navigate to page with test component
- [ ] **40.6** Check browser console for hydration warnings
- [ ] **40.7** Verify component renders correctly
- [ ] **40.8** Check server logs for any SSR-related errors
- [ ] **40.9** Verify hook returns disconnected state during SSR (if server-side rendering this component)
- [ ] **40.10** Verify subscription establishes only after client hydration

---

## Task 41: Performance Testing - Multiple Hook Instances

**Context**: Verify multiple instances of the hook can run simultaneously without conflicts.

**Files to modify**:
- Create `/src/components/dev/MultipleRealtimeTest.tsx`

**Estimated effort**: 20 minutes

**Subtasks**:
- [ ] **41.1** Create new test component that renders 3 instances of useTranslationRealtime
- [ ] **41.2** Each instance should subscribe to different entity IDs
- [ ] **41.3** Render connection status for each instance separately
- [ ] **41.4** Render event counts for each instance
- [ ] **41.5** Start all subscriptions
- [ ] **41.6** Verify each has unique channel name in console logs
- [ ] **41.7** Insert translation for first entity
- [ ] **41.8** Verify only first instance receives event
- [ ] **41.9** Insert translation for second entity
- [ ] **41.10** Verify only second instance receives event
- [ ] **41.11** Verify no cross-contamination between instances
- [ ] **41.12** Verify Network tab shows single WebSocket connection (Supabase multiplexing)

---

## Task 42: Documentation - Add Hook Usage to CLAUDE.md

**Context**: Document the new hook in project documentation for future reference.

**Files to modify**:
- `/CLAUDE.md`

**Estimated effort**: 15 minutes

**Subtasks**:
- [ ] **42.1** Open `/CLAUDE.md` file
- [ ] **42.2** Find or create "Realtime Subscriptions" section
- [ ] **42.3** Add heading: "### useTranslationRealtime Hook"
- [ ] **42.4** Add brief description of hook purpose
- [ ] **42.5** Add code example showing basic usage with useTranslationStatus integration
- [ ] **42.6** Add note about 'use client' requirement
- [ ] **42.7** Add note about Supabase Realtime being enabled in project settings
- [ ] **42.8** Add note about RLS policies filtering events
- [ ] **42.9** Add common pattern examples (conditional subscription, manual control)
- [ ] **42.10** Update "Last Modified" date at top of CLAUDE.md
- [ ] **42.11** Save file

---

## Task 43: Code Review - Self-Review Checklist

**Context**: Perform thorough self-review before considering task complete.

**Files to modify**:
- None (review only)

**Estimated effort**: 20 minutes

**Subtasks**:
- [ ] **43.1** Verify all TypeScript types are exported correctly
- [ ] **43.2** Verify all console.log statements are helpful for debugging
- [ ] **43.3** Check that all callback dependencies are in useCallback arrays
- [ ] **43.4** Check that all state/ref dependencies are in useEffect arrays
- [ ] **43.5** Verify isBrowser() check is present in all appropriate places
- [ ] **43.6** Verify cleanup function in useEffect removes channel correctly
- [ ] **43.7** Check that transformPayload handles all three event types (INSERT/UPDATE/DELETE)
- [ ] **43.8** Verify payload transformation extracts correct field names (snake_case from DB)
- [ ] **43.9** Check that channel naming is unique and descriptive
- [ ] **43.10** Verify onConnectionChange callback receives correct status values
- [ ] **43.11** Verify all error cases invoke onError callback
- [ ] **43.12** Check that manual subscribe/unsubscribe have proper guards
- [ ] **43.13** Verify useMemo dependencies are correct for return value
- [ ] **43.14** Check JSDoc is comprehensive with examples
- [ ] **43.15** Verify exports in hooks/index.ts are correct

---

## Task 44: Cleanup and Finalization

**Context**: Remove temporary test files and finalize implementation.

**Files to modify**:
- `/src/components/dev/TranslationRealtimeTest.tsx` (delete)
- `/src/components/dev/MultipleRealtimeTest.tsx` (delete)

**Estimated effort**: 10 minutes

**Subtasks**:
- [ ] **44.1** Remove or comment out test component imports from pages
- [ ] **44.2** Delete `/src/components/dev/TranslationRealtimeTest.tsx` (or move to .gitignore dev folder)
- [ ] **44.3** Delete `/src/components/dev/MultipleRealtimeTest.tsx` (or move to .gitignore dev folder)
- [ ] **44.4** Run final typecheck: `npm run typecheck`
- [ ] **44.5** Run lint: `npm run lint`
- [ ] **44.6** Fix any lint warnings in useTranslationRealtime.ts
- [ ] **44.7** Run build: `npm run build`
- [ ] **44.8** Verify no build errors
- [ ] **44.9** Commit hook implementation with message: "[REQ-E05-012] Create useTranslationRealtime hook"
- [ ] **44.10** Update pipeline state or task tracker to mark REQ-E05-012 complete

---

**END OF DETAILED TASK BREAKDOWN**

*Total Estimated Effort: ~10-12 hours*
*Total Tasks: 44*
*Total Subtasks: 325*

---

## Notes

- All subtask checkboxes are intentionally UNCHECKED (- [ ])
- Implementation agent will check off subtasks as completed
- This is a SPECIFICATION document for future work
- Hook depends on REQ-E05-006 for shared types (can use local types initially)
- Hook integrates with REQ-E05-011 (useTranslationStatus) for auto-refresh pattern
- Supabase Realtime must be enabled in project settings
- RLS policies must be configured for proper event filtering
- Test component files are temporary dev tools and should not be committed to production

---

*Document Last Modified: 2026-01-22 23:01*
