/**
 * Unit tests for useAssetManagement hook utilities and reducer
 *
 * @module ItemManager/hooks/__tests__/useAssetManagement
 * @lastModified 2026-01-03
 */

import {
  createInitialState,
  getFileCategory,
  validateAssetFile,
  createPendingAsset,
  assetManagementReducer,
} from '../useAssetManagement';
import type { AssetManagementState, AssetManagementAction, PendingAsset } from '../../ItemManager.types';
import type { MediaItem } from '@/components/ItemCapture/ItemCapture.types';

// Mock URL.createObjectURL and URL.revokeObjectURL
const mockObjectUrls = new Map<string, boolean>();
let urlCounter = 0;

beforeEach(() => {
  urlCounter = 0;
  mockObjectUrls.clear();

  global.URL.createObjectURL = jest.fn((blob: Blob) => {
    const url = `blob:mock-url-${urlCounter++}`;
    mockObjectUrls.set(url, true);
    return url;
  });

  global.URL.revokeObjectURL = jest.fn((url: string) => {
    mockObjectUrls.delete(url);
  });
});

afterEach(() => {
  jest.restoreAllMocks();
});

// Helper to create mock File objects
function createMockFile(name: string, type: string, size: number): File {
  const file = new File([''], name, { type });
  Object.defineProperty(file, 'size', { value: size, writable: false });
  return file;
}

// Helper to create mock MediaItem
function createMockMediaItem(id: string, type: 'video' | 'image' | 'pdf'): MediaItem {
  return {
    id,
    type,
    file: new Blob(['mock content'], { type: type === 'pdf' ? 'application/pdf' : `${type}/mock` }),
    order: 0,
    metadata: {
      mimeType: type === 'pdf' ? 'application/pdf' : `${type}/mock`,
      fileSize: 1024,
      source: 'upload',
    },
  };
}

describe('useAssetManagement utilities', () => {
  describe('createInitialState', () => {
    it('should create empty initial state', () => {
      const state = createInitialState();

      expect(state.itemId).toBeNull();
      expect(state.originalAssets).toEqual([]);
      expect(state.pendingAdditions).toEqual([]);
      expect(state.pendingRemovals.size).toBe(0);
      expect(state.currentOrder).toEqual([]);
      expect(state.isDirty).toBe(false);
      expect(state.isCommitting).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should create independent instances', () => {
      const state1 = createInitialState();
      const state2 = createInitialState();

      expect(state1).not.toBe(state2);
      expect(state1.pendingRemovals).not.toBe(state2.pendingRemovals);
    });
  });

  describe('getFileCategory', () => {
    it('should identify video types', () => {
      expect(getFileCategory('video/mp4')).toBe('video');
      expect(getFileCategory('video/webm')).toBe('video');
      expect(getFileCategory('video/quicktime')).toBe('video');
      expect(getFileCategory('video/x-msvideo')).toBe('video');
    });

    it('should identify image types', () => {
      expect(getFileCategory('image/jpeg')).toBe('image');
      expect(getFileCategory('image/png')).toBe('image');
      expect(getFileCategory('image/gif')).toBe('image');
      expect(getFileCategory('image/webp')).toBe('image');
      expect(getFileCategory('image/heic')).toBe('image');
      expect(getFileCategory('image/heif')).toBe('image');
    });

    it('should identify PDF type', () => {
      expect(getFileCategory('application/pdf')).toBe('pdf');
    });

    it('should return null for unknown types', () => {
      expect(getFileCategory('text/plain')).toBeNull();
      expect(getFileCategory('application/json')).toBeNull();
      expect(getFileCategory('audio/mp3')).toBeNull();
    });

    it('should be case-insensitive', () => {
      expect(getFileCategory('VIDEO/MP4')).toBe('video');
      expect(getFileCategory('Image/JPEG')).toBe('image');
      expect(getFileCategory('APPLICATION/PDF')).toBe('pdf');
    });

    it('should handle unknown video subtypes via wildcard', () => {
      expect(getFileCategory('video/unknown')).toBe('video');
    });

    it('should handle unknown image subtypes via wildcard', () => {
      expect(getFileCategory('image/unknown')).toBe('image');
    });
  });

  describe('validateAssetFile', () => {
    it('should accept valid files', () => {
      const file = createMockFile('test.jpg', 'image/jpeg', 1000);
      const result = validateAssetFile(file, {});

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject files exceeding max size', () => {
      const file = createMockFile('test.jpg', 'image/jpeg', 200 * 1024 * 1024);
      const result = validateAssetFile(file, { maxSize: 100 * 1024 * 1024 });

      expect(result.valid).toBe(false);
      expect(result.error?.code).toBe('FILE_TOO_LARGE');
      expect(result.error?.message).toContain('100MB');
    });

    it('should reject unsupported file types', () => {
      const file = createMockFile('test.txt', 'text/plain', 1000);
      const result = validateAssetFile(file, {});

      expect(result.valid).toBe(false);
      expect(result.error?.code).toBe('INVALID_FILE_TYPE');
      expect(result.error?.message).toContain('text/plain');
    });

    it('should reject file types not in allowed list', () => {
      const file = createMockFile('test.pdf', 'application/pdf', 1000);
      const result = validateAssetFile(file, { allowedTypes: ['image', 'video'] });

      expect(result.valid).toBe(false);
      expect(result.error?.code).toBe('INVALID_FILE_TYPE');
      expect(result.error?.message).toContain('image, video');
    });

    it('should use default values when options not provided', () => {
      const file = createMockFile('test.mp4', 'video/mp4', 50 * 1024 * 1024);
      const result = validateAssetFile(file, {});

      expect(result.valid).toBe(true);
    });
  });

  describe('createPendingAsset', () => {
    it('should create pending asset with correct structure', () => {
      const file = createMockFile('test.jpg', 'image/jpeg', 1000);
      const asset = createPendingAsset(file);

      expect(asset.id).toMatch(/^pending-/);
      expect(asset.file).toBe(file);
      expect(asset.previewUrl).toContain('blob:mock-url');
      expect(asset.type).toBe('image');
      expect(asset.addedAt).toBeInstanceOf(Date);
    });

    it('should generate unique IDs', () => {
      const file1 = createMockFile('test1.jpg', 'image/jpeg', 1000);
      const file2 = createMockFile('test2.jpg', 'image/jpeg', 1000);

      const asset1 = createPendingAsset(file1);
      const asset2 = createPendingAsset(file2);

      expect(asset1.id).not.toBe(asset2.id);
    });

    it('should create object URL for preview', () => {
      const file = createMockFile('test.png', 'image/png', 1000);
      createPendingAsset(file);

      expect(URL.createObjectURL).toHaveBeenCalledWith(file);
    });

    it('should correctly identify video type', () => {
      const file = createMockFile('video.mp4', 'video/mp4', 1000);
      const asset = createPendingAsset(file);

      expect(asset.type).toBe('video');
    });

    it('should correctly identify PDF type', () => {
      const file = createMockFile('document.pdf', 'application/pdf', 1000);
      const asset = createPendingAsset(file);

      expect(asset.type).toBe('pdf');
    });
  });
});

describe('assetManagementReducer', () => {
  describe('START_SESSION action', () => {
    it('should initialize state with provided assets', () => {
      const state = createInitialState();
      const assets: MediaItem[] = [
        createMockMediaItem('asset-1', 'image'),
        createMockMediaItem('asset-2', 'video'),
      ];

      const newState = assetManagementReducer(state, {
        type: 'START_SESSION',
        payload: { itemId: 'item-123', assets },
      });

      expect(newState.itemId).toBe('item-123');
      expect(newState.originalAssets).toEqual(assets);
      expect(newState.currentOrder).toEqual(['asset-1', 'asset-2']);
      expect(newState.isDirty).toBe(false);
    });
  });

  describe('END_SESSION action', () => {
    it('should reset state to initial', () => {
      const state: AssetManagementState = {
        itemId: 'item-123',
        originalAssets: [createMockMediaItem('asset-1', 'image')],
        pendingAdditions: [],
        pendingRemovals: new Set(['asset-1']),
        currentOrder: [],
        isDirty: true,
        isCommitting: false,
        error: null,
      };

      const newState = assetManagementReducer(state, { type: 'END_SESSION' });

      expect(newState.itemId).toBeNull();
      expect(newState.originalAssets).toEqual([]);
      expect(newState.isDirty).toBe(false);
    });

    it('should revoke preview URLs of pending additions', () => {
      const pendingAsset: PendingAsset = {
        id: 'pending-1',
        file: createMockFile('test.jpg', 'image/jpeg', 1000),
        previewUrl: 'blob:mock-url-1',
        type: 'image',
        addedAt: new Date(),
      };

      const state: AssetManagementState = {
        itemId: 'item-123',
        originalAssets: [],
        pendingAdditions: [pendingAsset],
        pendingRemovals: new Set(),
        currentOrder: ['pending-1'],
        isDirty: true,
        isCommitting: false,
        error: null,
      };

      assetManagementReducer(state, { type: 'END_SESSION' });

      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url-1');
    });
  });

  describe('ADD_ASSET action', () => {
    it('should add asset to pendingAdditions and currentOrder', () => {
      const state: AssetManagementState = {
        itemId: 'item-123',
        originalAssets: [createMockMediaItem('asset-1', 'image')],
        pendingAdditions: [],
        pendingRemovals: new Set(),
        currentOrder: ['asset-1'],
        isDirty: false,
        isCommitting: false,
        error: null,
      };

      const pendingAsset: PendingAsset = {
        id: 'pending-1',
        file: createMockFile('test.jpg', 'image/jpeg', 1000),
        previewUrl: 'blob:mock-url-1',
        type: 'image',
        addedAt: new Date(),
      };

      const newState = assetManagementReducer(state, {
        type: 'ADD_ASSET',
        payload: pendingAsset,
      });

      expect(newState.pendingAdditions).toContain(pendingAsset);
      expect(newState.currentOrder).toEqual(['asset-1', 'pending-1']);
      expect(newState.isDirty).toBe(true);
      expect(newState.error).toBeNull();
    });
  });

  describe('REMOVE_ASSET action', () => {
    it('should remove pending asset entirely and revoke URL', () => {
      const pendingAsset: PendingAsset = {
        id: 'pending-1',
        file: createMockFile('test.jpg', 'image/jpeg', 1000),
        previewUrl: 'blob:mock-url-1',
        type: 'image',
        addedAt: new Date(),
      };

      const state: AssetManagementState = {
        itemId: 'item-123',
        originalAssets: [],
        pendingAdditions: [pendingAsset],
        pendingRemovals: new Set(),
        currentOrder: ['pending-1'],
        isDirty: true,
        isCommitting: false,
        error: null,
      };

      const newState = assetManagementReducer(state, {
        type: 'REMOVE_ASSET',
        payload: 'pending-1',
      });

      expect(newState.pendingAdditions).toEqual([]);
      expect(newState.currentOrder).toEqual([]);
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url-1');
    });

    it('should mark committed asset for removal', () => {
      const state: AssetManagementState = {
        itemId: 'item-123',
        originalAssets: [createMockMediaItem('asset-1', 'image')],
        pendingAdditions: [],
        pendingRemovals: new Set(),
        currentOrder: ['asset-1'],
        isDirty: false,
        isCommitting: false,
        error: null,
      };

      const newState = assetManagementReducer(state, {
        type: 'REMOVE_ASSET',
        payload: 'asset-1',
      });

      expect(newState.pendingRemovals.has('asset-1')).toBe(true);
      expect(newState.currentOrder).toEqual([]);
      expect(newState.isDirty).toBe(true);
    });
  });

  describe('UNDO_REMOVAL action', () => {
    it('should restore asset to currentOrder', () => {
      const state: AssetManagementState = {
        itemId: 'item-123',
        originalAssets: [
          createMockMediaItem('asset-1', 'image'),
          createMockMediaItem('asset-2', 'video'),
        ],
        pendingAdditions: [],
        pendingRemovals: new Set(['asset-1']),
        currentOrder: ['asset-2'],
        isDirty: true,
        isCommitting: false,
        error: null,
      };

      const newState = assetManagementReducer(state, {
        type: 'UNDO_REMOVAL',
        payload: 'asset-1',
      });

      expect(newState.pendingRemovals.has('asset-1')).toBe(false);
      expect(newState.currentOrder).toContain('asset-1');
    });

    it('should do nothing if asset is not marked for removal', () => {
      const state: AssetManagementState = {
        itemId: 'item-123',
        originalAssets: [createMockMediaItem('asset-1', 'image')],
        pendingAdditions: [],
        pendingRemovals: new Set(),
        currentOrder: ['asset-1'],
        isDirty: false,
        isCommitting: false,
        error: null,
      };

      const newState = assetManagementReducer(state, {
        type: 'UNDO_REMOVAL',
        payload: 'asset-1',
      });

      expect(newState).toBe(state);
    });
  });

  describe('REORDER_ASSETS action', () => {
    it('should reorder assets correctly', () => {
      const state: AssetManagementState = {
        itemId: 'item-123',
        originalAssets: [],
        pendingAdditions: [],
        pendingRemovals: new Set(),
        currentOrder: ['a', 'b', 'c', 'd'],
        isDirty: false,
        isCommitting: false,
        error: null,
      };

      const newState = assetManagementReducer(state, {
        type: 'REORDER_ASSETS',
        payload: { fromIndex: 0, toIndex: 2 },
      });

      expect(newState.currentOrder).toEqual(['b', 'c', 'a', 'd']);
      expect(newState.isDirty).toBe(true);
    });

    it('should do nothing for invalid indices', () => {
      const state: AssetManagementState = {
        itemId: 'item-123',
        originalAssets: [],
        pendingAdditions: [],
        pendingRemovals: new Set(),
        currentOrder: ['a', 'b'],
        isDirty: false,
        isCommitting: false,
        error: null,
      };

      const newState = assetManagementReducer(state, {
        type: 'REORDER_ASSETS',
        payload: { fromIndex: 5, toIndex: 0 },
      });

      expect(newState).toBe(state);
    });

    it('should do nothing when from equals to', () => {
      const state: AssetManagementState = {
        itemId: 'item-123',
        originalAssets: [],
        pendingAdditions: [],
        pendingRemovals: new Set(),
        currentOrder: ['a', 'b'],
        isDirty: false,
        isCommitting: false,
        error: null,
      };

      const newState = assetManagementReducer(state, {
        type: 'REORDER_ASSETS',
        payload: { fromIndex: 1, toIndex: 1 },
      });

      expect(newState).toBe(state);
    });
  });

  describe('DISCARD_CHANGES action', () => {
    it('should reset to original state while keeping session active', () => {
      const originalAsset = createMockMediaItem('asset-1', 'image');
      const pendingAsset: PendingAsset = {
        id: 'pending-1',
        file: createMockFile('test.jpg', 'image/jpeg', 1000),
        previewUrl: 'blob:mock-url-1',
        type: 'image',
        addedAt: new Date(),
      };

      const state: AssetManagementState = {
        itemId: 'item-123',
        originalAssets: [originalAsset],
        pendingAdditions: [pendingAsset],
        pendingRemovals: new Set(),
        currentOrder: ['asset-1', 'pending-1'],
        isDirty: true,
        isCommitting: false,
        error: null,
      };

      const newState = assetManagementReducer(state, { type: 'DISCARD_CHANGES' });

      expect(newState.itemId).toBe('item-123');
      expect(newState.originalAssets).toEqual([originalAsset]);
      expect(newState.pendingAdditions).toEqual([]);
      expect(newState.pendingRemovals.size).toBe(0);
      expect(newState.currentOrder).toEqual(['asset-1']);
      expect(newState.isDirty).toBe(false);
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url-1');
    });
  });

  describe('Commit actions', () => {
    it('START_COMMIT should set isCommitting to true', () => {
      const state = createInitialState();
      const newState = assetManagementReducer(state, { type: 'START_COMMIT' });

      expect(newState.isCommitting).toBe(true);
      expect(newState.error).toBeNull();
    });

    it('COMMIT_SUCCESS should reset state', () => {
      const state: AssetManagementState = {
        itemId: 'item-123',
        originalAssets: [],
        pendingAdditions: [],
        pendingRemovals: new Set(),
        currentOrder: [],
        isDirty: true,
        isCommitting: true,
        error: null,
      };

      const newState = assetManagementReducer(state, { type: 'COMMIT_SUCCESS' });

      expect(newState.itemId).toBeNull();
      expect(newState.isCommitting).toBe(false);
    });

    it('COMMIT_ERROR should set error and stop committing', () => {
      const state: AssetManagementState = {
        ...createInitialState(),
        isCommitting: true,
      };

      const newState = assetManagementReducer(state, {
        type: 'COMMIT_ERROR',
        payload: 'Network error',
      });

      expect(newState.isCommitting).toBe(false);
      expect(newState.error?.code).toBe('COMMIT_FAILED');
      expect(newState.error?.message).toBe('Network error');
    });
  });

  describe('Error actions', () => {
    it('SET_ERROR should set error state', () => {
      const state = createInitialState();
      const error = { code: 'FILE_TOO_LARGE' as const, message: 'File too large' };

      const newState = assetManagementReducer(state, {
        type: 'SET_ERROR',
        payload: error,
      });

      expect(newState.error).toEqual(error);
    });

    it('CLEAR_ERROR should clear error state', () => {
      const state: AssetManagementState = {
        ...createInitialState(),
        error: { code: 'FILE_TOO_LARGE', message: 'File too large' },
      };

      const newState = assetManagementReducer(state, { type: 'CLEAR_ERROR' });

      expect(newState.error).toBeNull();
    });
  });
});
