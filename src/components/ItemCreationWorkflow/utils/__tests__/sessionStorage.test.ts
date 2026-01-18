/**
 * Unit Tests for sessionStorage Utilities
 *
 * Tests the storage utilities for workflow state persistence.
 *
 * @module ItemCreationWorkflow/utils/__tests__/sessionStorage.test
 * @vitest-environment jsdom
 * @lastModified 2026-01-05 (REQ-096 Task 1.4)
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { WorkflowState, ContentPiece } from '../../ItemCreationWorkflow.types';
import {
  STORAGE_KEY_PREFIX,
  STORAGE_INDEX_KEY,
  MAX_SESSION_AGE_MS,
  isLocalStorageAvailable,
  getStorageKey,
  serializeState,
  deserializeState,
  saveWorkflowState,
  loadWorkflowState,
  loadMostRecentWorkflowState,
  clearWorkflowState,
  clearAllWorkflowStates,
  getActiveSessionIds,
  hasRecoverableSession,
  getContentNeedingReUpload,
} from '../sessionStorage';

// =============================================================================
// Test Helpers
// =============================================================================

/**
 * Creates a mock WorkflowState for testing.
 */
function createMockState(overrides: Partial<WorkflowState> = {}): WorkflowState {
  return {
    currentStep: 'room-selection',
    stepHistory: [],
    canGoBack: false,
    session: {
      id: 'test-session-123',
      startedAt: new Date('2026-01-05T10:00:00Z'),
      currentStep: 'room-selection',
      items: [],
      currentItem: null,
    },
    currentItem: null,
    isSubmitting: false,
    isDirty: false,
    errors: {},
    submitError: null,
    ...overrides,
  };
}

/**
 * Creates a mock ContentPiece for testing.
 */
function createMockContentPiece(type: 'text' | 'url' | 'video' | 'photo' | 'pdf'): ContentPiece {
  const base = {
    id: `piece-${type}`,
    type,
    order: 0,
  };

  switch (type) {
    case 'text':
      return { ...base, data: { type: 'text', text: 'Sample text content' } };
    case 'url':
      return {
        ...base,
        data: {
          type: 'url',
          url: 'https://example.com',
          title: 'Example Site',
          thumbnailUrl: 'https://example.com/thumb.jpg',
          faviconUrl: 'https://example.com/favicon.ico',
        },
      };
    case 'video':
      return {
        ...base,
        data: { type: 'video', file: new Blob(['video data']), duration: 30 },
        thumbnail: new Blob(['thumbnail']),
      };
    case 'photo':
      return {
        ...base,
        data: { type: 'photo', file: new Blob(['photo data']) },
        thumbnail: new Blob(['thumbnail']),
      };
    case 'pdf':
      return {
        ...base,
        data: { type: 'pdf', file: new Blob(['pdf data']), pageCount: 5 },
      };
  }
}

// =============================================================================
// localStorage Mock Setup
// =============================================================================

let mockStorage: Record<string, string> = {};

const localStorageMock = {
  getItem: vi.fn((key: string) => mockStorage[key] ?? null),
  setItem: vi.fn((key: string, value: string) => {
    mockStorage[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete mockStorage[key];
  }),
  clear: vi.fn(() => {
    mockStorage = {};
  }),
};

// =============================================================================
// Test Suites
// =============================================================================

describe('sessionStorage utilities', () => {
  beforeEach(() => {
    // Reset mock storage before each test
    mockStorage = {};
    vi.clearAllMocks();

    // Setup localStorage mock
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ===========================================================================
  // Constants Tests
  // ===========================================================================

  describe('constants', () => {
    it('has correct STORAGE_KEY_PREFIX', () => {
      expect(STORAGE_KEY_PREFIX).toBe('faqbnb_workflow_');
    });

    it('has correct STORAGE_INDEX_KEY', () => {
      expect(STORAGE_INDEX_KEY).toBe('faqbnb_workflow_sessions');
    });

    it('has correct MAX_SESSION_AGE_MS (24 hours)', () => {
      expect(MAX_SESSION_AGE_MS).toBe(24 * 60 * 60 * 1000);
    });
  });

  // ===========================================================================
  // isLocalStorageAvailable Tests
  // ===========================================================================

  describe('isLocalStorageAvailable', () => {
    it('returns true when localStorage is available', () => {
      expect(isLocalStorageAvailable()).toBe(true);
    });

    it('returns false when localStorage throws', () => {
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error('QuotaExceededError');
      });

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      expect(isLocalStorageAvailable()).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  // ===========================================================================
  // getStorageKey Tests
  // ===========================================================================

  describe('getStorageKey', () => {
    it('generates correct key format', () => {
      expect(getStorageKey('abc-123')).toBe('faqbnb_workflow_abc-123');
    });

    it('handles various session IDs', () => {
      expect(getStorageKey('session-1')).toBe('faqbnb_workflow_session-1');
      expect(getStorageKey('a1b2c3d4-e5f6-7890-abcd-ef1234567890')).toBe(
        'faqbnb_workflow_a1b2c3d4-e5f6-7890-abcd-ef1234567890'
      );
    });
  });

  // ===========================================================================
  // serializeState Tests
  // ===========================================================================

  describe('serializeState', () => {
    it('converts Date objects to ISO strings', () => {
      const state = createMockState();
      const serialized = serializeState(state);

      expect(serialized.session.startedAt).toBe('2026-01-05T10:00:00.000Z');
    });

    it('preserves text content data exactly', () => {
      const textPiece = createMockContentPiece('text');
      const state = createMockState({
        currentItem: {
          room: 'kitchen',
          itemType: 'appliance',
          specificItem: 'Fridge',
          itemName: 'Kitchen - Fridge',
          contentSource: 'create-new',
          contentType: 'text',
          content: [textPiece],
        },
      });

      const serialized = serializeState(state);

      expect(serialized.currentItem?.content[0].data).toEqual({
        type: 'text',
        text: 'Sample text content',
      });
    });

    it('preserves URL content data with all metadata', () => {
      const urlPiece = createMockContentPiece('url');
      const state = createMockState({
        currentItem: {
          room: 'kitchen',
          itemType: 'appliance',
          specificItem: 'Fridge',
          itemName: 'Kitchen - Fridge',
          contentSource: 'create-new',
          contentType: 'url',
          content: [urlPiece],
        },
      });

      const serialized = serializeState(state);

      expect(serialized.currentItem?.content[0].data).toEqual({
        type: 'url',
        url: 'https://example.com',
        title: 'Example Site',
        thumbnailUrl: 'https://example.com/thumb.jpg',
        faviconUrl: 'https://example.com/favicon.ico',
      });
    });

    it('marks binary content as needing re-upload', () => {
      const videoPiece = createMockContentPiece('video');
      const state = createMockState({
        currentItem: {
          room: 'kitchen',
          itemType: 'appliance',
          specificItem: 'Fridge',
          itemName: 'Kitchen - Fridge',
          contentSource: 'create-new',
          contentType: 'video',
          content: [videoPiece],
        },
      });

      const serialized = serializeState(state);

      expect(serialized.currentItem?.content[0].data).toEqual({
        type: 'video',
        needsReUpload: true,
        duration: 30,
      });
    });

    it('sets hasUnserializableContent flag for binary content', () => {
      const photoPiece = createMockContentPiece('photo');
      const state = createMockState({
        currentItem: {
          room: 'kitchen',
          itemType: 'appliance',
          specificItem: 'Fridge',
          itemName: 'Kitchen - Fridge',
          contentSource: 'create-new',
          contentType: 'photo',
          content: [photoPiece],
        },
      });

      const serialized = serializeState(state);

      expect(serialized.currentItem?.hasUnserializableContent).toBe(true);
    });

    it('does not set hasUnserializableContent for text/url only', () => {
      const textPiece = createMockContentPiece('text');
      const urlPiece = createMockContentPiece('url');
      const state = createMockState({
        currentItem: {
          room: 'kitchen',
          itemType: 'appliance',
          specificItem: 'Fridge',
          itemName: 'Kitchen - Fridge',
          contentSource: 'create-new',
          contentType: 'text',
          content: [textPiece, urlPiece],
        },
      });

      const serialized = serializeState(state);

      expect(serialized.currentItem?.hasUnserializableContent).toBe(false);
    });

    it('excludes thumbnail from content pieces', () => {
      const videoPiece = createMockContentPiece('video');
      expect(videoPiece.thumbnail).toBeDefined();

      const state = createMockState({
        currentItem: {
          room: 'kitchen',
          itemType: 'appliance',
          specificItem: 'Fridge',
          itemName: 'Kitchen - Fridge',
          contentSource: 'create-new',
          contentType: 'video',
          content: [videoPiece],
        },
      });

      const serialized = serializeState(state);

      expect((serialized.currentItem?.content[0] as any).thumbnail).toBeUndefined();
    });

    it('handles session with items', () => {
      const state = createMockState({
        session: {
          id: 'test-session-123',
          startedAt: new Date('2026-01-05T10:00:00Z'),
          currentStep: 'next-action',
          items: [
            {
              id: 'item-1',
              name: 'Kitchen - Fridge',
              room: 'kitchen',
              itemType: 'appliance',
              content: [createMockContentPiece('text')],
              createdAt: new Date('2026-01-05T11:00:00Z'),
              qrCodeUrl: 'https://example.com/qr/item-1',
            },
          ],
          currentItem: null,
        },
      });

      const serialized = serializeState(state);

      expect(serialized.session.items).toHaveLength(1);
      expect(serialized.session.items[0].createdAt).toBe('2026-01-05T11:00:00.000Z');
    });
  });

  // ===========================================================================
  // deserializeState Tests
  // ===========================================================================

  describe('deserializeState', () => {
    it('converts ISO strings back to Date objects', () => {
      const state = createMockState();
      const serialized = serializeState(state);
      const deserialized = deserializeState(serialized);

      expect(deserialized.session?.startedAt).toBeInstanceOf(Date);
      expect(deserialized.session?.startedAt?.toISOString()).toBe('2026-01-05T10:00:00.000Z');
    });

    it('restores RoomType and ItemType enums', () => {
      const state = createMockState({
        currentItem: {
          room: 'kitchen',
          itemType: 'appliance',
          specificItem: 'Fridge',
          itemName: 'Kitchen - Fridge',
          contentSource: 'create-new',
          contentType: 'text',
          content: [],
        },
      });

      const serialized = serializeState(state);
      const deserialized = deserializeState(serialized);

      expect(deserialized.currentItem?.room).toBe('kitchen');
      expect(deserialized.currentItem?.itemType).toBe('appliance');
    });

    it('sets isSubmitting and submitError to default values', () => {
      const state = createMockState({
        isSubmitting: true,
        submitError: 'Some error',
      });

      const serialized = serializeState(state);
      const deserialized = deserializeState(serialized);

      expect(deserialized.isSubmitting).toBe(false);
      expect(deserialized.submitError).toBeNull();
    });

    it('creates placeholder Blob for binary content', () => {
      const videoPiece = createMockContentPiece('video');
      const state = createMockState({
        currentItem: {
          room: 'kitchen',
          itemType: 'appliance',
          specificItem: 'Fridge',
          itemName: 'Kitchen - Fridge',
          contentSource: 'create-new',
          contentType: 'video',
          content: [videoPiece],
        },
      });

      const serialized = serializeState(state);
      const deserialized = deserializeState(serialized);

      const deserializedPiece = deserialized.currentItem?.content[0];
      expect(deserializedPiece?.data.type).toBe('video');
      if (deserializedPiece?.data.type === 'video') {
        expect(deserializedPiece.data.file).toBeInstanceOf(Blob);
        expect((deserializedPiece.data as any).needsReUpload).toBe(true);
      }
    });

    it('restores text content exactly', () => {
      const textPiece = createMockContentPiece('text');
      const state = createMockState({
        currentItem: {
          room: 'kitchen',
          itemType: 'appliance',
          specificItem: 'Fridge',
          itemName: 'Kitchen - Fridge',
          contentSource: 'create-new',
          contentType: 'text',
          content: [textPiece],
        },
      });

      const serialized = serializeState(state);
      const deserialized = deserializeState(serialized);

      const deserializedPiece = deserialized.currentItem?.content[0];
      expect(deserializedPiece?.data).toEqual({ type: 'text', text: 'Sample text content' });
    });

    it('restores URL content exactly', () => {
      const urlPiece = createMockContentPiece('url');
      const state = createMockState({
        currentItem: {
          room: 'kitchen',
          itemType: 'appliance',
          specificItem: 'Fridge',
          itemName: 'Kitchen - Fridge',
          contentSource: 'create-new',
          contentType: 'url',
          content: [urlPiece],
        },
      });

      const serialized = serializeState(state);
      const deserialized = deserializeState(serialized);

      const deserializedPiece = deserialized.currentItem?.content[0];
      expect(deserializedPiece?.data).toEqual({
        type: 'url',
        url: 'https://example.com',
        title: 'Example Site',
        thumbnailUrl: 'https://example.com/thumb.jpg',
        faviconUrl: 'https://example.com/favicon.ico',
      });
    });
  });

  // ===========================================================================
  // saveWorkflowState Tests
  // ===========================================================================

  describe('saveWorkflowState', () => {
    it('saves serialized state to localStorage', () => {
      const state = createMockState();

      const result = saveWorkflowState(state);

      expect(result).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'faqbnb_workflow_test-session-123',
        expect.any(String)
      );
    });

    it('includes savedAt timestamp', () => {
      const state = createMockState();

      saveWorkflowState(state);

      const storedValue = mockStorage['faqbnb_workflow_test-session-123'];
      const parsed = JSON.parse(storedValue);
      expect(parsed.savedAt).toBeDefined();
      expect(typeof parsed.savedAt).toBe('number');
    });

    it('updates session index', () => {
      const state = createMockState();

      saveWorkflowState(state);

      const indexValue = mockStorage[STORAGE_INDEX_KEY];
      expect(indexValue).toBeDefined();
      const parsed = JSON.parse(indexValue);
      expect(parsed).toContainEqual(expect.objectContaining({ id: 'test-session-123' }));
    });

    it('returns true on success', () => {
      const state = createMockState();
      expect(saveWorkflowState(state)).toBe(true);
    });

    it('returns false when localStorage throws', () => {
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error('QuotaExceeded');
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const state = createMockState();
      expect(saveWorkflowState(state)).toBe(false);
      consoleSpy.mockRestore();
    });
  });

  // ===========================================================================
  // loadWorkflowState Tests
  // ===========================================================================

  describe('loadWorkflowState', () => {
    it('loads and deserializes state from localStorage', () => {
      const state = createMockState();
      saveWorkflowState(state);

      const loaded = loadWorkflowState('test-session-123');

      expect(loaded).not.toBeNull();
      expect(loaded?.session?.id).toBe('test-session-123');
    });

    it('returns null for expired sessions', () => {
      const state = createMockState();
      saveWorkflowState(state);

      // Modify the savedAt to be expired
      const key = 'faqbnb_workflow_test-session-123';
      const stored = JSON.parse(mockStorage[key]);
      stored.savedAt = Date.now() - MAX_SESSION_AGE_MS - 1000; // Expired
      mockStorage[key] = JSON.stringify(stored);

      const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
      const loaded = loadWorkflowState('test-session-123');

      expect(loaded).toBeNull();
      consoleSpy.mockRestore();
    });

    it('clears expired sessions from storage', () => {
      const state = createMockState();
      saveWorkflowState(state);

      // Modify the savedAt to be expired
      const key = 'faqbnb_workflow_test-session-123';
      const stored = JSON.parse(mockStorage[key]);
      stored.savedAt = Date.now() - MAX_SESSION_AGE_MS - 1000;
      mockStorage[key] = JSON.stringify(stored);

      const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
      loadWorkflowState('test-session-123');

      expect(mockStorage[key]).toBeUndefined();
      consoleSpy.mockRestore();
    });

    it('returns null when key not found', () => {
      const loaded = loadWorkflowState('non-existent-session');
      expect(loaded).toBeNull();
    });

    it('clears invalid JSON from storage', () => {
      mockStorage['faqbnb_workflow_bad-session'] = 'not valid json';

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const loaded = loadWorkflowState('bad-session');

      expect(loaded).toBeNull();
      expect(mockStorage['faqbnb_workflow_bad-session']).toBeUndefined();
      consoleSpy.mockRestore();
    });
  });

  // ===========================================================================
  // loadMostRecentWorkflowState Tests
  // ===========================================================================

  describe('loadMostRecentWorkflowState', () => {
    it('returns most recent valid session', () => {
      // Save two sessions with different savedAt times
      const state1 = createMockState({ session: { ...createMockState().session, id: 'session-1' } });
      const state2 = createMockState({ session: { ...createMockState().session, id: 'session-2' } });

      saveWorkflowState(state1);
      saveWorkflowState(state2);

      const loaded = loadMostRecentWorkflowState();

      // session-2 was saved last, so it should be most recent
      expect(loaded?.session?.id).toBe('session-2');
    });

    it('skips expired sessions and tries next', () => {
      const state1 = createMockState({ session: { ...createMockState().session, id: 'session-1' } });
      const state2 = createMockState({ session: { ...createMockState().session, id: 'session-2' } });

      saveWorkflowState(state1);
      saveWorkflowState(state2);

      // Expire session-2 (the most recent)
      const key2 = 'faqbnb_workflow_session-2';
      const stored2 = JSON.parse(mockStorage[key2]);
      stored2.savedAt = Date.now() - MAX_SESSION_AGE_MS - 1000;
      mockStorage[key2] = JSON.stringify(stored2);

      const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
      const loaded = loadMostRecentWorkflowState();

      expect(loaded?.session?.id).toBe('session-1');
      consoleSpy.mockRestore();
    });

    it('returns null when no sessions exist', () => {
      const loaded = loadMostRecentWorkflowState();
      expect(loaded).toBeNull();
    });
  });

  // ===========================================================================
  // clearWorkflowState Tests
  // ===========================================================================

  describe('clearWorkflowState', () => {
    it('removes session from localStorage', () => {
      const state = createMockState();
      saveWorkflowState(state);

      clearWorkflowState('test-session-123');

      expect(mockStorage['faqbnb_workflow_test-session-123']).toBeUndefined();
    });

    it('removes session from index', () => {
      const state = createMockState();
      saveWorkflowState(state);

      clearWorkflowState('test-session-123');

      const index = JSON.parse(mockStorage[STORAGE_INDEX_KEY] || '[]');
      expect(index.find((e: any) => e.id === 'test-session-123')).toBeUndefined();
    });

    it('handles non-existent session gracefully', () => {
      // Should not throw
      expect(() => clearWorkflowState('non-existent')).not.toThrow();
    });
  });

  // ===========================================================================
  // clearAllWorkflowStates Tests
  // ===========================================================================

  describe('clearAllWorkflowStates', () => {
    it('removes all workflow sessions', () => {
      const state1 = createMockState({ session: { ...createMockState().session, id: 'session-1' } });
      const state2 = createMockState({ session: { ...createMockState().session, id: 'session-2' } });

      saveWorkflowState(state1);
      saveWorkflowState(state2);

      clearAllWorkflowStates();

      expect(mockStorage['faqbnb_workflow_session-1']).toBeUndefined();
      expect(mockStorage['faqbnb_workflow_session-2']).toBeUndefined();
    });

    it('removes index key', () => {
      const state = createMockState();
      saveWorkflowState(state);

      clearAllWorkflowStates();

      expect(mockStorage[STORAGE_INDEX_KEY]).toBeUndefined();
    });

    it('handles no sessions gracefully', () => {
      expect(() => clearAllWorkflowStates()).not.toThrow();
    });
  });

  // ===========================================================================
  // getActiveSessionIds Tests
  // ===========================================================================

  describe('getActiveSessionIds', () => {
    it('returns empty array when no sessions', () => {
      expect(getActiveSessionIds()).toEqual([]);
    });

    it('filters expired sessions', () => {
      const state = createMockState();
      saveWorkflowState(state);

      // Expire the session
      const key = 'faqbnb_workflow_test-session-123';
      const stored = JSON.parse(mockStorage[key]);
      stored.savedAt = Date.now() - MAX_SESSION_AGE_MS - 1000;
      mockStorage[key] = JSON.stringify(stored);

      // Also update the index entry
      const indexKey = STORAGE_INDEX_KEY;
      const index = JSON.parse(mockStorage[indexKey]);
      index[0].savedAt = Date.now() - MAX_SESSION_AGE_MS - 1000;
      mockStorage[indexKey] = JSON.stringify(index);

      expect(getActiveSessionIds()).toEqual([]);
    });

    it('orders by most recent first', () => {
      // Use Date.now() mock to control timing
      const now = Date.now();
      vi.spyOn(Date, 'now').mockReturnValueOnce(now).mockReturnValueOnce(now);

      const state1 = createMockState({ session: { ...createMockState().session, id: 'session-1' } });
      saveWorkflowState(state1);

      vi.spyOn(Date, 'now').mockReturnValueOnce(now + 1000).mockReturnValueOnce(now + 1000);
      const state2 = createMockState({ session: { ...createMockState().session, id: 'session-2' } });
      saveWorkflowState(state2);

      vi.restoreAllMocks();

      const ids = getActiveSessionIds();
      // session-2 was saved last, should be first
      expect(ids[0]).toBe('session-2');
      expect(ids[1]).toBe('session-1');
    });
  });

  // ===========================================================================
  // hasRecoverableSession Tests
  // ===========================================================================

  describe('hasRecoverableSession', () => {
    it('returns false when no sessions', () => {
      expect(hasRecoverableSession()).toBe(false);
    });

    it('returns true when sessions exist', () => {
      const state = createMockState();
      saveWorkflowState(state);

      expect(hasRecoverableSession()).toBe(true);
    });
  });

  // ===========================================================================
  // getContentNeedingReUpload Tests
  // ===========================================================================

  describe('getContentNeedingReUpload', () => {
    it('returns 0 when no content needs re-upload', () => {
      const state = createMockState({
        currentItem: {
          room: 'kitchen',
          itemType: 'appliance',
          specificItem: 'Fridge',
          itemName: 'Kitchen - Fridge',
          contentSource: 'create-new',
          contentType: 'text',
          content: [createMockContentPiece('text')],
        },
      });

      expect(getContentNeedingReUpload(state)).toBe(0);
    });

    it('counts binary content correctly in currentItem', () => {
      // Serialize and deserialize to simulate restored state
      const videoPiece = createMockContentPiece('video');
      const state = createMockState({
        currentItem: {
          room: 'kitchen',
          itemType: 'appliance',
          specificItem: 'Fridge',
          itemName: 'Kitchen - Fridge',
          contentSource: 'create-new',
          contentType: 'video',
          content: [videoPiece],
        },
      });

      const serialized = serializeState(state);
      const deserialized = deserializeState(serialized);

      expect(getContentNeedingReUpload(deserialized)).toBe(1);
    });

    it('counts binary content in session items', () => {
      const photoPiece = createMockContentPiece('photo');
      const pdfPiece = createMockContentPiece('pdf');
      const state = createMockState({
        session: {
          id: 'test-session-123',
          startedAt: new Date('2026-01-05T10:00:00Z'),
          currentStep: 'next-action',
          items: [
            {
              id: 'item-1',
              name: 'Kitchen - Fridge',
              room: 'kitchen',
              itemType: 'appliance',
              content: [photoPiece, pdfPiece],
              createdAt: new Date('2026-01-05T11:00:00Z'),
            },
          ],
          currentItem: null,
        },
      });

      const serialized = serializeState(state);
      const deserialized = deserializeState(serialized);

      expect(getContentNeedingReUpload(deserialized)).toBe(2);
    });
  });

  // ===========================================================================
  // Session Index Tests
  // ===========================================================================

  describe('session index', () => {
    it('tracks multiple sessions', () => {
      const state1 = createMockState({ session: { ...createMockState().session, id: 'session-1' } });
      const state2 = createMockState({ session: { ...createMockState().session, id: 'session-2' } });
      const state3 = createMockState({ session: { ...createMockState().session, id: 'session-3' } });

      saveWorkflowState(state1);
      saveWorkflowState(state2);
      saveWorkflowState(state3);

      const ids = getActiveSessionIds();
      expect(ids).toHaveLength(3);
    });

    it('limits to 10 sessions max', () => {
      // Save 12 sessions
      for (let i = 0; i < 12; i++) {
        const state = createMockState({
          session: { ...createMockState().session, id: `session-${i}` },
        });
        saveWorkflowState(state);
      }

      const ids = getActiveSessionIds();
      expect(ids.length).toBeLessThanOrEqual(10);
    });

    it('persists between operations', () => {
      const state1 = createMockState({ session: { ...createMockState().session, id: 'session-1' } });
      saveWorkflowState(state1);

      // Verify it's in the index
      expect(getActiveSessionIds()).toContain('session-1');

      // Save another session
      const state2 = createMockState({ session: { ...createMockState().session, id: 'session-2' } });
      saveWorkflowState(state2);

      // Both should be present
      const ids = getActiveSessionIds();
      expect(ids).toContain('session-1');
      expect(ids).toContain('session-2');
    });
  });
});
