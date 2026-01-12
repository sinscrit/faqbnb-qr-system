/**
 * useSessionQRGeneration Hook Tests
 *
 * @module ItemCreationWorkflow/hooks/__tests__/useSessionQRGeneration
 * @see docs/REQ-111-qr-code-integration-overview.md
 * @lastModified 2026-01-05 (REQ-111 QR Code Integration)
 */

import { renderHook, waitFor, act } from '@testing-library/react';
import { useSessionQRGeneration } from '../useSessionQRGeneration';
import { useQRCodeGeneration } from '@/hooks/useQRCodeGeneration';
import type { SessionItem } from '../../ItemCreationWorkflow.types';

// Mock the underlying useQRCodeGeneration hook
vi.mock('@/hooks/useQRCodeGeneration');

const mockedUseQRCodeGeneration = useQRCodeGeneration as vi.MockedFunction<typeof useQRCodeGeneration>;

// =============================================================================
// Test Fixtures
// =============================================================================

const createMockSessionItem = (id: string, name: string, qrCodeUrl?: string): SessionItem => ({
  id,
  name,
  room: 'kitchen',
  itemType: 'appliance',
  content: [
    {
      id: `content-${id}`,
      type: 'text',
      data: { type: 'text', text: 'Test content' },
      order: 0,
      createdAt: new Date(),
    }
  ],
  createdAt: new Date(),
  qrCodeUrl,
});

const createDefaultMockHook = () => ({
  qrCodes: new Map<string, string>(),
  isGenerating: false,
  progress: 0,
  error: null,
  failedItems: new Set<string>(),
  generateQRCodes: vi.fn().mockResolvedValue(undefined),
  retryFailedItems: vi.fn().mockResolvedValue(undefined),
  clearQRCache: vi.fn(),
  getStats: vi.fn().mockReturnValue({
    total: 0,
    completed: 0,
    failed: 0,
    remaining: 0,
  }),
});

// =============================================================================
// Test Suites
// =============================================================================

describe('useSessionQRGeneration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ===========================================================================
  // Initialization Tests
  // ===========================================================================

  describe('initialization', () => {
    it('initializes with default options', () => {
      const mockHook = createDefaultMockHook();
      mockedUseQRCodeGeneration.mockReturnValue(mockHook);

      const { result } = renderHook(() => useSessionQRGeneration());

      expect(mockedUseQRCodeGeneration).toHaveBeenCalledWith({
        batchSize: 5,
        baseUrl: undefined,
        enableRetry: true,
        maxRetries: 2,
      });
      expect(result.current.isGenerating).toBe(false);
      expect(result.current.progress).toBe(0);
      expect(result.current.error).toBeNull();
    });

    it('passes custom options to underlying hook', () => {
      const mockHook = createDefaultMockHook();
      mockedUseQRCodeGeneration.mockReturnValue(mockHook);

      renderHook(() => useSessionQRGeneration({
        batchSize: 10,
        baseUrl: 'https://example.com',
      }));

      expect(mockedUseQRCodeGeneration).toHaveBeenCalledWith({
        batchSize: 10,
        baseUrl: 'https://example.com',
        enableRetry: true,
        maxRetries: 2,
      });
    });
  });

  // ===========================================================================
  // QR Code Generation Tests
  // ===========================================================================

  describe('generateForItems', () => {
    it('transforms SessionItems to Items and calls generateQRCodes', async () => {
      const mockGenerateQRCodes = vi.fn().mockResolvedValue(undefined);
      const mockHook = {
        ...createDefaultMockHook(),
        generateQRCodes: mockGenerateQRCodes,
      };
      mockedUseQRCodeGeneration.mockReturnValue(mockHook);

      const { result } = renderHook(() => useSessionQRGeneration());

      const sessionItems = [
        createMockSessionItem('item-1', 'Test Item 1'),
        createMockSessionItem('item-2', 'Test Item 2'),
      ];

      await act(async () => {
        await result.current.generateForItems(sessionItems);
      });

      expect(mockGenerateQRCodes).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({
          id: 'item-1',
          public_id: 'item-1',
          name: 'Test Item 1',
          room: 'kitchen',
          item_type: 'appliance',
        }),
        expect.objectContaining({
          id: 'item-2',
          public_id: 'item-2',
          name: 'Test Item 2',
        }),
      ]));
    });

    it('skips items that already have qrCodeUrl', async () => {
      const mockGenerateQRCodes = vi.fn().mockResolvedValue(undefined);
      const mockHook = {
        ...createDefaultMockHook(),
        generateQRCodes: mockGenerateQRCodes,
      };
      mockedUseQRCodeGeneration.mockReturnValue(mockHook);

      const { result } = renderHook(() => useSessionQRGeneration());

      const sessionItems = [
        createMockSessionItem('item-1', 'Test Item 1', 'existing-qr-url'),
        createMockSessionItem('item-2', 'Test Item 2'),
      ];

      await act(async () => {
        await result.current.generateForItems(sessionItems);
      });

      // Only item-2 should be passed
      expect(mockGenerateQRCodes).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({ id: 'item-2' }),
      ]));
      expect(mockGenerateQRCodes.mock.calls[0][0]).toHaveLength(1);
    });

    it('does not call generateQRCodes when all items already have QR codes', async () => {
      const mockGenerateQRCodes = vi.fn().mockResolvedValue(undefined);
      const mockHook = {
        ...createDefaultMockHook(),
        generateQRCodes: mockGenerateQRCodes,
      };
      mockedUseQRCodeGeneration.mockReturnValue(mockHook);

      const { result } = renderHook(() => useSessionQRGeneration());

      const sessionItems = [
        createMockSessionItem('item-1', 'Test Item 1', 'qr-1'),
        createMockSessionItem('item-2', 'Test Item 2', 'qr-2'),
      ];

      await act(async () => {
        await result.current.generateForItems(sessionItems);
      });

      expect(mockGenerateQRCodes).not.toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // Retry Tests
  // ===========================================================================

  describe('retryFailed', () => {
    it('retries only failed items', async () => {
      const mockRetryFailedItems = vi.fn().mockResolvedValue(undefined);
      const mockHook = {
        ...createDefaultMockHook(),
        failedItems: new Set(['item-1']),
        retryFailedItems: mockRetryFailedItems,
      };
      mockedUseQRCodeGeneration.mockReturnValue(mockHook);

      const { result } = renderHook(() => useSessionQRGeneration());

      const sessionItems = [
        createMockSessionItem('item-1', 'Failed Item'),
        createMockSessionItem('item-2', 'Success Item'),
      ];

      await act(async () => {
        await result.current.retryFailed(sessionItems);
      });

      // Only item-1 should be retried
      expect(mockRetryFailedItems).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({ id: 'item-1' }),
      ]));
      expect(mockRetryFailedItems.mock.calls[0][0]).toHaveLength(1);
    });

    it('does nothing when no items have failed', async () => {
      const mockRetryFailedItems = vi.fn().mockResolvedValue(undefined);
      const mockHook = {
        ...createDefaultMockHook(),
        failedItems: new Set<string>(),
        retryFailedItems: mockRetryFailedItems,
      };
      mockedUseQRCodeGeneration.mockReturnValue(mockHook);

      const { result } = renderHook(() => useSessionQRGeneration());

      const sessionItems = [
        createMockSessionItem('item-1', 'Item 1'),
        createMockSessionItem('item-2', 'Item 2'),
      ];

      await act(async () => {
        await result.current.retryFailed(sessionItems);
      });

      expect(mockRetryFailedItems).not.toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // Cancel Tests
  // ===========================================================================

  describe('cancel', () => {
    it('calls clearQRCache to abort generation', () => {
      const mockClearQRCache = vi.fn();
      const mockHook = {
        ...createDefaultMockHook(),
        clearQRCache: mockClearQRCache,
      };
      mockedUseQRCodeGeneration.mockReturnValue(mockHook);

      const { result } = renderHook(() => useSessionQRGeneration());

      act(() => {
        result.current.cancel();
      });

      expect(mockClearQRCache).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // Stats Tests
  // ===========================================================================

  describe('stats', () => {
    it('returns stats from underlying hook', () => {
      const expectedStats = {
        total: 5,
        completed: 3,
        failed: 1,
        remaining: 1,
      };

      const mockHook = {
        ...createDefaultMockHook(),
        getStats: vi.fn().mockReturnValue(expectedStats),
      };
      mockedUseQRCodeGeneration.mockReturnValue(mockHook);

      const { result } = renderHook(() => useSessionQRGeneration());

      expect(result.current.stats).toEqual(expectedStats);
    });
  });

  // ===========================================================================
  // Item Status Tests
  // ===========================================================================

  describe('itemStatuses', () => {
    it('marks completed items correctly', () => {
      const qrCodes = new Map<string, string>([
        ['item-1', 'qr-code-1'],
        ['item-2', 'qr-code-2'],
      ]);

      const mockHook = {
        ...createDefaultMockHook(),
        qrCodes,
      };
      mockedUseQRCodeGeneration.mockReturnValue(mockHook);

      const { result } = renderHook(() => useSessionQRGeneration());

      expect(result.current.itemStatuses.get('item-1')).toBe('completed');
      expect(result.current.itemStatuses.get('item-2')).toBe('completed');
    });

    it('marks failed items correctly', () => {
      const mockHook = {
        ...createDefaultMockHook(),
        failedItems: new Set(['item-3', 'item-4']),
      };
      mockedUseQRCodeGeneration.mockReturnValue(mockHook);

      const { result } = renderHook(() => useSessionQRGeneration());

      expect(result.current.itemStatuses.get('item-3')).toBe('failed');
      expect(result.current.itemStatuses.get('item-4')).toBe('failed');
    });
  });

  // ===========================================================================
  // State Passthrough Tests
  // ===========================================================================

  describe('state passthrough', () => {
    it('passes through qrCodes from underlying hook', () => {
      const qrCodes = new Map<string, string>([
        ['item-1', 'qr-1'],
      ]);

      const mockHook = {
        ...createDefaultMockHook(),
        qrCodes,
      };
      mockedUseQRCodeGeneration.mockReturnValue(mockHook);

      const { result } = renderHook(() => useSessionQRGeneration());

      expect(result.current.qrCodes).toBe(qrCodes);
    });

    it('passes through isGenerating from underlying hook', () => {
      const mockHook = {
        ...createDefaultMockHook(),
        isGenerating: true,
      };
      mockedUseQRCodeGeneration.mockReturnValue(mockHook);

      const { result } = renderHook(() => useSessionQRGeneration());

      expect(result.current.isGenerating).toBe(true);
    });

    it('passes through progress from underlying hook', () => {
      const mockHook = {
        ...createDefaultMockHook(),
        progress: 75,
      };
      mockedUseQRCodeGeneration.mockReturnValue(mockHook);

      const { result } = renderHook(() => useSessionQRGeneration());

      expect(result.current.progress).toBe(75);
    });

    it('passes through error from underlying hook', () => {
      const mockHook = {
        ...createDefaultMockHook(),
        error: 'Network error',
      };
      mockedUseQRCodeGeneration.mockReturnValue(mockHook);

      const { result } = renderHook(() => useSessionQRGeneration());

      expect(result.current.error).toBe('Network error');
    });
  });
});
