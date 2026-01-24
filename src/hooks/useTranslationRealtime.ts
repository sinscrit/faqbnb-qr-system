'use client';

/**
 * useTranslationRealtime Hook
 *
 * Custom React hook for Supabase realtime subscriptions to translation tables.
 * Subscribes to INSERT, UPDATE, and DELETE events on translation tables and
 * invokes callbacks when changes occur.
 *
 * Features:
 * - Auto-subscribe on mount with cleanup on unmount
 * - Filter by specific entity (entityId + entityType) or property-wide (propertyId)
 * - Individual callbacks for INSERT, UPDATE, DELETE events
 * - Generic onChange callback for all event types
 * - Connection status tracking (connected, disconnected, connecting, error)
 * - Manual subscribe/unsubscribe control functions
 * - SSR-safe implementation (no-op on server)
 *
 * @module hooks/useTranslationRealtime
 * @see docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md
 * @created 2026-01-24
 * @requestReference REQ-E05-012
 *
 * @param options - Configuration options for the realtime subscription
 * @returns Object containing connection state, control functions, and last event data
 *
 * @example
 * // Auto-refresh pattern with useTranslationStatus
 * const { refetch } = useTranslationStatus({ propertyId });
 * useTranslationRealtime({
 *   propertyId,
 *   onChange: () => refetch(),
 * });
 *
 * @example
 * // Manual subscription control
 * const { subscribe, unsubscribe, isConnected } = useTranslationRealtime({
 *   entityId: itemId,
 *   entityType: 'item',
 *   enabled: false, // Don't auto-subscribe
 * });
 * // Later: subscribe() when panel opens, unsubscribe() when it closes
 *
 * @example
 * // Conditional subscription based on panel visibility
 * const [isPanelOpen, setIsPanelOpen] = useState(false);
 * useTranslationRealtime({
 *   entityId: itemId,
 *   entityType: 'item',
 *   enabled: isPanelOpen,
 *   onUpdate: (payload) => {
 *     console.log('Translation updated:', payload);
 *   },
 * });
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from '@/lib/supabase';

// =============================================================================
// Type Definitions
// =============================================================================

/**
 * Connection status values for the realtime subscription.
 * - 'connected': Channel is subscribed and receiving events
 * - 'disconnected': Channel is not subscribed
 * - 'connecting': Channel subscription is in progress
 * - 'error': Channel encountered an error
 */
export type ConnectionStatus = 'connected' | 'disconnected' | 'connecting' | 'error';

/**
 * Normalized payload structure for translation realtime events.
 * Transforms Supabase's raw realtime event into a consistent format.
 */
export interface TranslationRealtimePayload {
  /** Type of database event */
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  /** Name of the translation table */
  table: 'item_translations' | 'article_translations' | 'link_translations' | 'tag_translations';
  /** ID of the translated entity */
  entityId: string;
  /** Type of entity being translated */
  entityType: 'item' | 'article' | 'link' | 'tag';
  /** Language code of the translation */
  language: string;
  /** Translation status (pending, completed, failed, etc.) */
  status?: string;
  /** Previous record data (for UPDATE/DELETE events) */
  old?: Record<string, unknown>;
  /** New record data (for INSERT/UPDATE events) */
  new?: Record<string, unknown>;
  /** Timestamp of the event */
  timestamp: Date;
}

/**
 * Options for configuring the useTranslationRealtime hook.
 *
 * Provide either (entityId + entityType) for single entity subscription,
 * OR propertyId for property-wide subscription. Cannot provide both.
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
  /** Callback invoked when a translation is inserted */
  onInsert?: (payload: TranslationRealtimePayload) => void;
  /** Callback invoked when a translation is updated */
  onUpdate?: (payload: TranslationRealtimePayload) => void;
  /** Callback invoked when a translation is deleted */
  onDelete?: (payload: TranslationRealtimePayload) => void;
  /** Callback invoked for all event types (INSERT, UPDATE, DELETE) */
  onChange?: (payload: TranslationRealtimePayload) => void;
  /** Callback invoked when an error occurs */
  onError?: (error: Error) => void;
  /** Callback invoked when connection status changes */
  onConnectionChange?: (status: ConnectionStatus) => void;
}

/**
 * Return value from the useTranslationRealtime hook.
 * Provides connection state and control functions.
 */
export interface UseTranslationRealtimeReturn {
  /** True when realtime connection is established */
  isConnected: boolean;
  /** True when connection is in progress */
  isConnecting: boolean;
  /** Current connection status */
  connectionStatus: ConnectionStatus;
  /** Manually start subscription */
  subscribe: () => void;
  /** Manually stop subscription */
  unsubscribe: () => void;
  /** Last event received */
  lastEvent: TranslationRealtimePayload | null;
  /** Timestamp of last event */
  lastEventAt: Date | null;
  /** Error object if any */
  error: Error | null;
}

/**
 * Internal state interface for the hook.
 */
interface UseTranslationRealtimeState {
  connectionStatus: ConnectionStatus;
  lastEvent: TranslationRealtimePayload | null;
  lastEventAt: number | null;
  error: Error | null;
}

// =============================================================================
// Constants
// =============================================================================

/**
 * Mapping from entity types to their corresponding translation table names.
 */
const ENTITY_TO_TABLE_MAP = {
  item: 'item_translations',
  article: 'article_translations',
  link: 'link_translations',
  tag: 'tag_translations',
} as const;

/**
 * Mapping from entity types to their foreign key column names in translation tables.
 */
const ENTITY_TO_ID_COLUMN_MAP = {
  item: 'item_id',
  article: 'article_id',
  link: 'link_id',
  tag: 'tag_id',
} as const;

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Check if code is running in browser (not server-side rendering).
 * Supabase realtime requires browser environment.
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Returns table name and ID column for an entity type.
 * @param entityType - The type of entity
 * @returns Object with table name and ID column name
 */
function getTableConfig(entityType: string): { table: string; idColumn: string } {
  return {
    table: ENTITY_TO_TABLE_MAP[entityType as keyof typeof ENTITY_TO_TABLE_MAP],
    idColumn: ENTITY_TO_ID_COLUMN_MAP[entityType as keyof typeof ENTITY_TO_ID_COLUMN_MAP],
  };
}

/**
 * Transform Supabase's raw realtime payload into our normalized TranslationRealtimePayload format.
 *
 * @param supabasePayload - Raw payload from Supabase realtime event
 * @param table - Name of the table that triggered the event
 * @returns Normalized TranslationRealtimePayload
 */
function transformPayload(
  supabasePayload: {
    eventType: 'INSERT' | 'UPDATE' | 'DELETE';
    new?: Record<string, unknown>;
    old?: Record<string, unknown>;
    commit_timestamp?: string;
  },
  table: string
): TranslationRealtimePayload {
  // Extract entity type from table name (e.g., 'item_translations' -> 'item')
  const entityType = table.replace('_translations', '') as 'item' | 'article' | 'link' | 'tag';

  // Get the ID column name for this entity type
  const { idColumn } = getTableConfig(entityType);

  // Get record data from new or old (depending on event type)
  const record = supabasePayload.new || supabasePayload.old;

  // Extract entity ID using the appropriate column
  const entityId = (record?.[idColumn] as string) || '';

  return {
    eventType: supabasePayload.eventType,
    table: table as TranslationRealtimePayload['table'],
    entityId,
    entityType,
    language: (record?.language as string) || '',
    status: (record?.translation_status as string) || (record?.status as string),
    old: supabasePayload.old,
    new: supabasePayload.new,
    timestamp: new Date(supabasePayload.commit_timestamp || Date.now()),
  };
}

// =============================================================================
// Main Hook
// =============================================================================

export function useTranslationRealtime(
  options: UseTranslationRealtimeOptions
): UseTranslationRealtimeReturn {
  // Determine initial connection status based on enabled option
  const initialStatus: ConnectionStatus =
    options.enabled !== false ? 'connecting' : 'disconnected';

  // Initialize state
  const [state, setState] = useState<UseTranslationRealtimeState>({
    connectionStatus: initialStatus,
    lastEvent: null,
    lastEventAt: null,
    error: null,
  });

  // Create channel reference for manual control
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Setup channel function
  const setupChannel = useCallback(() => {
    // SSR guard
    if (!isBrowser() || options.enabled === false) {
      return null;
    }

    // Create unique channel name based on filter type
    let channelName: string;
    if (options.entityId && options.entityType) {
      channelName = `translation-updates-${options.entityType}-${options.entityId}`;
    } else if (options.propertyId) {
      channelName = `translation-updates-property-${options.propertyId}`;
    } else {
      channelName = 'translation-updates-all';
    }

    console.log(`useTranslationRealtime: Setting up channel "${channelName}"`);

    // Update state to connecting
    setState((prev) => ({ ...prev, connectionStatus: 'connecting', error: null }));

    // Create channel
    const channel = supabase.channel(channelName);

    // Define tables to subscribe to
    const tables: Array<'item' | 'article' | 'link' | 'tag'> = ['item', 'article', 'link', 'tag'];

    // Subscribe to each translation table
    tables.forEach((entityType) => {
      // Skip if filtering by specific entity type and this isn't it
      if (options.entityType && options.entityType !== entityType) {
        return;
      }

      const { table, idColumn } = getTableConfig(entityType);

      // Build filter string if filtering by specific entity
      let filter: string | undefined;
      if (options.entityId && options.entityType) {
        filter = `${idColumn}=eq.${options.entityId}`;
      }
      // Note: propertyId filtering relies on RLS policies

      // Subscribe to postgres changes
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          ...(filter ? { filter } : {}),
        },
        (payload) => {
          console.log(`useTranslationRealtime: Event on ${table}`, payload);

          // Transform payload
          const transformedPayload = transformPayload(
            payload as {
              eventType: 'INSERT' | 'UPDATE' | 'DELETE';
              new?: Record<string, unknown>;
              old?: Record<string, unknown>;
              commit_timestamp?: string;
            },
            table
          );

          // Update state with new event
          setState((prev) => ({
            ...prev,
            lastEvent: transformedPayload,
            lastEventAt: Date.now(),
          }));

          // Invoke appropriate callback based on event type
          if (payload.eventType === 'INSERT' && options.onInsert) {
            options.onInsert(transformedPayload);
          }
          if (payload.eventType === 'UPDATE' && options.onUpdate) {
            options.onUpdate(transformedPayload);
          }
          if (payload.eventType === 'DELETE' && options.onDelete) {
            options.onDelete(transformedPayload);
          }

          // Always invoke onChange for all event types
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
        setState((prev) => ({ ...prev, connectionStatus, error: null }));
      } else if (status === 'CHANNEL_ERROR') {
        connectionStatus = 'error';
        const error = new Error('Realtime channel error');
        setState((prev) => ({ ...prev, connectionStatus, error }));
        options.onError?.(error);
      } else if (status === 'TIMED_OUT') {
        connectionStatus = 'error';
        const error = new Error('Realtime connection timed out');
        setState((prev) => ({ ...prev, connectionStatus, error }));
        options.onError?.(error);
      } else {
        connectionStatus = 'connecting';
        setState((prev) => ({ ...prev, connectionStatus }));
      }

      // Invoke connection change callback if provided
      options.onConnectionChange?.(connectionStatus);
    });

    return channel;
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Auto-subscribe effect
  useEffect(() => {
    // SSR guard and enabled check
    if (!isBrowser() || options.enabled === false) {
      setState((prev) => ({ ...prev, connectionStatus: 'disconnected' }));
      return;
    }

    // Setup channel
    const channel = setupChannel();
    if (!channel) return;

    // Store channel reference
    channelRef.current = channel;

    // Cleanup function
    return () => {
      console.log('useTranslationRealtime: Cleaning up channel subscription');
      if (channel) {
        supabase.removeChannel(channel);
      }
      channelRef.current = null;
      setState((prev) => ({ ...prev, connectionStatus: 'disconnected' }));
    };
  }, [
    options.enabled,
    options.entityId,
    options.entityType,
    options.propertyId,
    setupChannel,
  ]);

  // Manual subscribe function
  const subscribe = useCallback(() => {
    if (!isBrowser()) {
      console.warn('useTranslationRealtime: Cannot subscribe in SSR environment');
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

  // Manual unsubscribe function
  const unsubscribe = useCallback(() => {
    if (!channelRef.current) {
      console.warn('useTranslationRealtime: Not subscribed');
      return;
    }
    console.log('useTranslationRealtime: Manual unsubscribe triggered');
    supabase.removeChannel(channelRef.current);
    channelRef.current = null;
    setState((prev) => ({ ...prev, connectionStatus: 'disconnected' }));
  }, []);

  // Memoized return value
  return useMemo<UseTranslationRealtimeReturn>(
    () => ({
      isConnected: state.connectionStatus === 'connected',
      isConnecting: state.connectionStatus === 'connecting',
      connectionStatus: state.connectionStatus,
      subscribe,
      unsubscribe,
      lastEvent: state.lastEvent,
      lastEventAt: state.lastEventAt ? new Date(state.lastEventAt) : null,
      error: state.error,
    }),
    [state, subscribe, unsubscribe]
  );
}
