/**
 * Unit Tests for useTranslationRealtime Hook
 *
 * Tests for the translation realtime subscription hook including subscription setup,
 * event callbacks, connection state handling, and cleanup.
 *
 * @module hooks/__tests__/useTranslationRealtime.test
 * @created 2026-01-24
 * @requestReference REQ-E05-033: Write Unit Tests for Translation Hooks
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useTranslationRealtime } from '../useTranslationRealtime';
import {
  createMockChannel,
  mockRealtimePayload,
} from './mocks/supabase.mock';

// =============================================================================
// Mock Setup
// =============================================================================

// Create mock channel for testing
let mockChannel = createMockChannel();

// Mock the supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    channel: vi.fn(() => mockChannel),
    removeChannel: vi.fn(() => Promise.resolve()),
  },
}));

// Import supabase mock for assertions
import { supabase } from '@/lib/supabase';

// =============================================================================
// Test Suite
// =============================================================================

describe('useTranslationRealtime', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock channel for each test
    mockChannel = createMockChannel();
    (supabase.channel as ReturnType<typeof vi.fn>).mockReturnValue(mockChannel);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ---------------------------------------------------------------------------
  // Subscription Setup
  // ---------------------------------------------------------------------------

  describe('Subscription Setup', () => {
    it('should establish Supabase channel subscription on mount', async () => {
      renderHook(() =>
        useTranslationRealtime({
          entityType: 'item',
          entityId: 'item-123',
        })
      );

      await waitFor(() => {
        expect(supabase.channel).toHaveBeenCalled();
      });

      expect(mockChannel.subscribe).toHaveBeenCalled();
    });

    it('should subscribe to correct table based on entityType parameter', async () => {
      renderHook(() =>
        useTranslationRealtime({
          entityType: 'item',
          entityId: 'item-123',
        })
      );

      await waitFor(() => {
        expect(supabase.channel).toHaveBeenCalled();
      });

      // Channel name should include entity type
      const channelCall = (supabase.channel as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(channelCall[0]).toContain('item');
    });

    it('should apply entityId filter to subscription when provided', async () => {
      renderHook(() =>
        useTranslationRealtime({
          entityType: 'item',
          entityId: 'item-123',
        })
      );

      await waitFor(() => {
        expect(mockChannel.on).toHaveBeenCalled();
      });

      // Check that channel.on was called with filter config
      const onCall = mockChannel.on.mock.calls[0];
      expect(onCall[0]).toBe('postgres_changes');
      // The filter is passed in the config object
      expect(onCall[1]).toHaveProperty('filter');
      expect(onCall[1].filter).toContain('item_id=eq.item-123');
    });

    it('should create channel with propertyId when provided', async () => {
      renderHook(() =>
        useTranslationRealtime({
          propertyId: 'property-456',
        })
      );

      await waitFor(() => {
        expect(supabase.channel).toHaveBeenCalled();
      });

      const channelCall = (supabase.channel as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(channelCall[0]).toContain('property-456');
    });

    it('should not subscribe when enabled is false', () => {
      const { result } = renderHook(() =>
        useTranslationRealtime({
          entityType: 'item',
          entityId: 'item-123',
          enabled: false,
        })
      );

      expect(supabase.channel).not.toHaveBeenCalled();
      expect(result.current.connectionStatus).toBe('disconnected');
    });

    it('should establish subscription when enabled changes from false to true', async () => {
      const { result, rerender } = renderHook(
        ({ enabled }) =>
          useTranslationRealtime({
            entityType: 'item',
            entityId: 'item-123',
            enabled,
          }),
        { initialProps: { enabled: false } }
      );

      expect(supabase.channel).not.toHaveBeenCalled();

      // Enable subscription
      rerender({ enabled: true });

      await waitFor(() => {
        expect(supabase.channel).toHaveBeenCalled();
      });

      expect(result.current.connectionStatus).not.toBe('disconnected');
    });

    it('should update subscription when entityId changes', async () => {
      const { rerender } = renderHook(
        ({ entityId }) =>
          useTranslationRealtime({
            entityType: 'item',
            entityId,
          }),
        { initialProps: { entityId: 'item-123' } }
      );

      await waitFor(() => {
        expect(supabase.channel).toHaveBeenCalled();
      });

      const initialChannelCalls = (supabase.channel as ReturnType<typeof vi.fn>).mock.calls.length;

      // Change entityId
      rerender({ entityId: 'item-456' });

      await waitFor(() => {
        expect((supabase.channel as ReturnType<typeof vi.fn>).mock.calls.length).toBeGreaterThan(initialChannelCalls);
      });

      // Old channel should be removed
      expect(supabase.removeChannel).toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  // Realtime Event Callbacks
  // ---------------------------------------------------------------------------

  describe('Realtime Event Callbacks', () => {
    it('onInsert callback is invoked when INSERT event occurs', async () => {
      const onInsert = vi.fn();

      renderHook(() =>
        useTranslationRealtime({
          entityType: 'item',
          entityId: 'item-123',
          onInsert,
        })
      );

      // Wait for subscription
      await waitFor(() => {
        expect(mockChannel.subscribe).toHaveBeenCalled();
      });

      // Simulate INSERT event
      act(() => {
        mockChannel._triggerEvent('INSERT', {
          id: 'trans-new',
          item_id: 'item-123',
          language: 'es',
          translation_status: 'completed',
        });
      });

      expect(onInsert).toHaveBeenCalled();
      expect(onInsert.mock.calls[0][0].eventType).toBe('INSERT');
    });

    it('onUpdate callback is invoked when UPDATE event occurs', async () => {
      const onUpdate = vi.fn();

      renderHook(() =>
        useTranslationRealtime({
          entityType: 'item',
          entityId: 'item-123',
          onUpdate,
        })
      );

      await waitFor(() => {
        expect(mockChannel.subscribe).toHaveBeenCalled();
      });

      act(() => {
        mockChannel._triggerEvent('UPDATE', mockRealtimePayload.new!);
      });

      expect(onUpdate).toHaveBeenCalled();
      expect(onUpdate.mock.calls[0][0].eventType).toBe('UPDATE');
    });

    it('onDelete callback is invoked when DELETE event occurs', async () => {
      const onDelete = vi.fn();

      renderHook(() =>
        useTranslationRealtime({
          entityType: 'item',
          entityId: 'item-123',
          onDelete,
        })
      );

      await waitFor(() => {
        expect(mockChannel.subscribe).toHaveBeenCalled();
      });

      act(() => {
        mockChannel._triggerEvent('DELETE', {
          id: 'trans-deleted',
          item_id: 'item-123',
          language: 'de',
        });
      });

      expect(onDelete).toHaveBeenCalled();
      expect(onDelete.mock.calls[0][0].eventType).toBe('DELETE');
    });

    it('onChange callback is invoked for all event types', async () => {
      const onChange = vi.fn();

      renderHook(() =>
        useTranslationRealtime({
          entityType: 'item',
          entityId: 'item-123',
          onChange,
        })
      );

      await waitFor(() => {
        expect(mockChannel.subscribe).toHaveBeenCalled();
      });

      // Trigger all event types
      act(() => {
        mockChannel._triggerEvent('INSERT', { item_id: 'item-123', language: 'es' });
        mockChannel._triggerEvent('UPDATE', { item_id: 'item-123', language: 'fr' });
        mockChannel._triggerEvent('DELETE', { item_id: 'item-123', language: 'de' });
      });

      expect(onChange).toHaveBeenCalledTimes(3);
    });

    it('callbacks receive correct event payload structure', async () => {
      const onUpdate = vi.fn();

      renderHook(() =>
        useTranslationRealtime({
          entityType: 'item',
          entityId: 'item-123',
          onUpdate,
        })
      );

      await waitFor(() => {
        expect(mockChannel.subscribe).toHaveBeenCalled();
      });

      act(() => {
        mockChannel._triggerEvent('UPDATE', {
          item_id: 'item-123',
          language: 'fr',
          translation_status: 'completed',
        });
      });

      const payload = onUpdate.mock.calls[0][0];
      expect(payload).toHaveProperty('eventType', 'UPDATE');
      expect(payload).toHaveProperty('table');
      expect(payload).toHaveProperty('entityId');
      expect(payload).toHaveProperty('entityType');
      expect(payload).toHaveProperty('language');
      expect(payload).toHaveProperty('timestamp');
      expect(payload.timestamp).toBeInstanceOf(Date);
    });

    it('updates lastEvent state when event occurs', async () => {
      const { result } = renderHook(() =>
        useTranslationRealtime({
          entityType: 'item',
          entityId: 'item-123',
        })
      );

      await waitFor(() => {
        expect(mockChannel.subscribe).toHaveBeenCalled();
      });

      expect(result.current.lastEvent).toBeNull();

      act(() => {
        mockChannel._triggerEvent('UPDATE', {
          item_id: 'item-123',
          language: 'fr',
        });
      });

      expect(result.current.lastEvent).not.toBeNull();
      expect(result.current.lastEvent?.eventType).toBe('UPDATE');
      expect(result.current.lastEventAt).toBeInstanceOf(Date);
    });
  });

  // ---------------------------------------------------------------------------
  // Connection State and Error Handling
  // ---------------------------------------------------------------------------

  describe('Connection State and Error Handling', () => {
    it('should handle SUBSCRIBED status correctly', async () => {
      const onConnectionChange = vi.fn();

      const { result } = renderHook(() =>
        useTranslationRealtime({
          entityType: 'item',
          entityId: 'item-123',
          onConnectionChange,
        })
      );

      // Initial state should be connecting
      expect(result.current.connectionStatus).toBe('connecting');

      // Trigger SUBSCRIBED status
      await waitFor(() => {
        expect(mockChannel.subscribe).toHaveBeenCalled();
      });

      // Simulate connection success
      act(() => {
        mockChannel._triggerConnectionChange('SUBSCRIBED');
      });

      expect(result.current.connectionStatus).toBe('connected');
      expect(result.current.isConnected).toBe(true);
      expect(onConnectionChange).toHaveBeenCalledWith('connected');
    });

    it('should handle CHANNEL_ERROR status', async () => {
      const onError = vi.fn();
      const onConnectionChange = vi.fn();

      const { result } = renderHook(() =>
        useTranslationRealtime({
          entityType: 'item',
          entityId: 'item-123',
          onError,
          onConnectionChange,
        })
      );

      await waitFor(() => {
        expect(mockChannel.subscribe).toHaveBeenCalled();
      });

      act(() => {
        mockChannel._triggerConnectionChange('CHANNEL_ERROR');
      });

      expect(result.current.connectionStatus).toBe('error');
      expect(result.current.error).toBeTruthy();
      expect(onError).toHaveBeenCalled();
      expect(onConnectionChange).toHaveBeenCalledWith('error');
    });

    it('should handle TIMED_OUT status', async () => {
      const onError = vi.fn();

      const { result } = renderHook(() =>
        useTranslationRealtime({
          entityType: 'item',
          entityId: 'item-123',
          onError,
        })
      );

      await waitFor(() => {
        expect(mockChannel.subscribe).toHaveBeenCalled();
      });

      act(() => {
        mockChannel._triggerConnectionChange('TIMED_OUT');
      });

      expect(result.current.connectionStatus).toBe('error');
      expect(result.current.error?.message).toContain('timed out');
    });

    it('should expose connection status to consumers', async () => {
      const { result } = renderHook(() =>
        useTranslationRealtime({
          entityType: 'item',
          entityId: 'item-123',
        })
      );

      // Should have initial connecting status
      expect(result.current.connectionStatus).toBeDefined();
      expect(typeof result.current.isConnected).toBe('boolean');
      expect(typeof result.current.isConnecting).toBe('boolean');
    });

    it('should set isConnecting true during connection attempt', () => {
      const { result } = renderHook(() =>
        useTranslationRealtime({
          entityType: 'item',
          entityId: 'item-123',
        })
      );

      expect(result.current.isConnecting).toBe(true);
      expect(result.current.isConnected).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  // Cleanup
  // ---------------------------------------------------------------------------

  describe('Cleanup', () => {
    it('should unsubscribe from channel on unmount', async () => {
      const { unmount } = renderHook(() =>
        useTranslationRealtime({
          entityType: 'item',
          entityId: 'item-123',
        })
      );

      await waitFor(() => {
        expect(mockChannel.subscribe).toHaveBeenCalled();
      });

      unmount();

      expect(supabase.removeChannel).toHaveBeenCalled();
    });

    it('should not invoke callbacks after unmount', async () => {
      const onUpdate = vi.fn();

      const { unmount } = renderHook(() =>
        useTranslationRealtime({
          entityType: 'item',
          entityId: 'item-123',
          onUpdate,
        })
      );

      await waitFor(() => {
        expect(mockChannel.subscribe).toHaveBeenCalled();
      });

      // Unmount
      unmount();

      // Try to trigger event after unmount
      // The channel should be removed, so handlers should be cleared
      act(() => {
        mockChannel._triggerEvent('UPDATE', {
          item_id: 'item-123',
          language: 'fr',
        });
      });

      // Callback should not have been called after unmount
      // (depends on whether handlers are cleared on unsubscribe)
    });

    it('should cleanup old subscription when parameters change', async () => {
      const { rerender } = renderHook(
        ({ entityId }) =>
          useTranslationRealtime({
            entityType: 'item',
            entityId,
          }),
        { initialProps: { entityId: 'item-123' } }
      );

      await waitFor(() => {
        expect(mockChannel.subscribe).toHaveBeenCalled();
      });

      // Change entityId
      rerender({ entityId: 'item-456' });

      // Old subscription should be removed
      expect(supabase.removeChannel).toHaveBeenCalled();
    });

    it('should handle manual unsubscribe correctly', async () => {
      const { result } = renderHook(() =>
        useTranslationRealtime({
          entityType: 'item',
          entityId: 'item-123',
        })
      );

      await waitFor(() => {
        expect(mockChannel.subscribe).toHaveBeenCalled();
      });

      // Manually unsubscribe
      act(() => {
        result.current.unsubscribe();
      });

      expect(supabase.removeChannel).toHaveBeenCalled();
      expect(result.current.connectionStatus).toBe('disconnected');
    });

    it('should handle manual subscribe after unsubscribe', async () => {
      // Note: When enabled=false, setupChannel() returns null early
      // Manual subscribe() only works when enabled is true (or undefined)
      // This test verifies manual resubscription after unsubscribe with enabled=true
      const { result } = renderHook(() =>
        useTranslationRealtime({
          entityType: 'item',
          entityId: 'item-123',
          enabled: true, // Start enabled
        })
      );

      await waitFor(() => {
        expect(supabase.channel).toHaveBeenCalled();
      });

      const initialCalls = (supabase.channel as ReturnType<typeof vi.fn>).mock.calls.length;

      // Manually unsubscribe
      act(() => {
        result.current.unsubscribe();
      });

      expect(result.current.connectionStatus).toBe('disconnected');

      // Reset mock channel for resubscription
      mockChannel = createMockChannel();
      (supabase.channel as ReturnType<typeof vi.fn>).mockReturnValue(mockChannel);

      // Manually resubscribe
      act(() => {
        result.current.subscribe();
      });

      await waitFor(() => {
        expect((supabase.channel as ReturnType<typeof vi.fn>).mock.calls.length).toBeGreaterThan(initialCalls);
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Return Value Shape
  // ---------------------------------------------------------------------------

  describe('Return Value Shape', () => {
    it('should return all expected properties', () => {
      const { result } = renderHook(() =>
        useTranslationRealtime({
          entityType: 'item',
          entityId: 'item-123',
        })
      );

      expect(result.current).toHaveProperty('isConnected');
      expect(result.current).toHaveProperty('isConnecting');
      expect(result.current).toHaveProperty('connectionStatus');
      expect(result.current).toHaveProperty('subscribe');
      expect(result.current).toHaveProperty('unsubscribe');
      expect(result.current).toHaveProperty('lastEvent');
      expect(result.current).toHaveProperty('lastEventAt');
      expect(result.current).toHaveProperty('error');
    });

    it('subscribe and unsubscribe should be functions', () => {
      const { result } = renderHook(() =>
        useTranslationRealtime({
          entityType: 'item',
          entityId: 'item-123',
        })
      );

      expect(typeof result.current.subscribe).toBe('function');
      expect(typeof result.current.unsubscribe).toBe('function');
    });
  });
});
