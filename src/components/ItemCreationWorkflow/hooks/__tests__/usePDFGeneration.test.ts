/**
 * usePDFGeneration Hook Tests
 *
 * @module ItemCreationWorkflow/hooks/__tests__/usePDFGeneration
 * @see docs/REQ-112-pdf-generation-integration-overview.md
 * @lastModified 2026-01-05 (REQ-112 PDF Generation Integration)
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { usePDFGeneration } from '../usePDFGeneration';
import {
  generatePDFFromQRCodes,
  downloadPDFBlob,
  convertPDFToBlob,
} from '@/lib/pdf-generator';
import type { PDFExportSettings } from '@/types/pdf';
import type { SessionItem } from '../../ItemCreationWorkflow.types';

// Mock the pdf-generator library
jest.mock('@/lib/pdf-generator');

const mockedGeneratePDFFromQRCodes = generatePDFFromQRCodes as jest.MockedFunction<typeof generatePDFFromQRCodes>;
const mockedDownloadPDFBlob = downloadPDFBlob as jest.MockedFunction<typeof downloadPDFBlob>;
const mockedConvertPDFToBlob = convertPDFToBlob as jest.MockedFunction<typeof convertPDFToBlob>;

// =============================================================================
// Test Fixtures
// =============================================================================

const createDefaultSettings = (): PDFExportSettings => ({
  pageFormat: 'Letter',
  margins: 10,
  qrSize: 40,
  qrSizeMm: 40,
  includeCutlines: true,
  includeLabels: true,
  showLabels: true,
  itemsPerRow: 4,
});

const createMockSessionItem = (id: string, name: string, qrCodeUrl?: string): SessionItem => ({
  id,
  name,
  room: 'kitchen',
  itemType: 'appliance',
  content: [],
  createdAt: new Date(),
  qrCodeUrl,
});

const createMockPDFBytes = (): Uint8Array => {
  // Mock PDF header bytes
  return new Uint8Array([0x25, 0x50, 0x44, 0x46]);
};

// =============================================================================
// Test Suites
// =============================================================================

describe('usePDFGeneration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===========================================================================
  // Initialization Tests
  // ===========================================================================

  describe('initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() =>
        usePDFGeneration({ settings: createDefaultSettings() })
      );

      expect(result.current.isGenerating).toBe(false);
      expect(result.current.progress).toBeNull();
      expect(result.current.error).toBeNull();
    });

    it('should provide generatePDF function', () => {
      const { result } = renderHook(() =>
        usePDFGeneration({ settings: createDefaultSettings() })
      );

      expect(typeof result.current.generatePDF).toBe('function');
    });

    it('should provide downloadPDF function', () => {
      const { result } = renderHook(() =>
        usePDFGeneration({ settings: createDefaultSettings() })
      );

      expect(typeof result.current.downloadPDF).toBe('function');
    });

    it('should provide clearError function', () => {
      const { result } = renderHook(() =>
        usePDFGeneration({ settings: createDefaultSettings() })
      );

      expect(typeof result.current.clearError).toBe('function');
    });
  });

  // ===========================================================================
  // PDF Generation Tests
  // ===========================================================================

  describe('generatePDF', () => {
    it('should generate PDF successfully from items and QR codes', async () => {
      const mockPDFBytes = createMockPDFBytes();
      const mockBlob = new Blob([mockPDFBytes], { type: 'application/pdf' });

      mockedGeneratePDFFromQRCodes.mockResolvedValue({
        success: true,
        pdfBytes: mockPDFBytes,
      });
      mockedConvertPDFToBlob.mockReturnValue(mockBlob);

      const { result } = renderHook(() =>
        usePDFGeneration({ settings: createDefaultSettings() })
      );

      const items = [
        createMockSessionItem('item-1', 'Test Item 1'),
        createMockSessionItem('item-2', 'Test Item 2'),
      ];
      const qrCodes = new Map([
        ['item-1', 'data:image/png;base64,test1'],
        ['item-2', 'data:image/png;base64,test2'],
      ]);

      let blob: Blob | null = null;

      await act(async () => {
        blob = await result.current.generatePDF(items, qrCodes);
      });

      expect(blob).toBe(mockBlob);
      expect(mockedGeneratePDFFromQRCodes).toHaveBeenCalled();
      expect(result.current.isGenerating).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should set isGenerating to true while generating', async () => {
      let resolveGeneration: (value: any) => void;
      const generationPromise = new Promise((resolve) => {
        resolveGeneration = resolve;
      });

      mockedGeneratePDFFromQRCodes.mockReturnValue(generationPromise as any);

      const { result } = renderHook(() =>
        usePDFGeneration({ settings: createDefaultSettings() })
      );

      const items = [createMockSessionItem('item-1', 'Test Item')];
      const qrCodes = new Map([['item-1', 'data:image/png;base64,test']]);

      // Start generation (don't await)
      act(() => {
        result.current.generatePDF(items, qrCodes);
      });

      expect(result.current.isGenerating).toBe(true);

      // Complete generation
      await act(async () => {
        resolveGeneration!({ success: true, pdfBytes: createMockPDFBytes() });
        await generationPromise;
      });
    });

    it('should handle generation error', async () => {
      mockedGeneratePDFFromQRCodes.mockResolvedValue({
        success: false,
        error: 'PDF generation failed',
        pdfBytes: null,
      });

      const { result } = renderHook(() =>
        usePDFGeneration({ settings: createDefaultSettings() })
      );

      const items = [createMockSessionItem('item-1', 'Test Item')];
      const qrCodes = new Map([['item-1', 'data:image/png;base64,test']]);

      let blob: Blob | null = null;

      await act(async () => {
        blob = await result.current.generatePDF(items, qrCodes);
      });

      expect(blob).toBeNull();
      expect(result.current.error).toBe('PDF generation failed');
      expect(result.current.isGenerating).toBe(false);
    });

    it('should handle thrown exceptions during generation', async () => {
      mockedGeneratePDFFromQRCodes.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() =>
        usePDFGeneration({ settings: createDefaultSettings() })
      );

      const items = [createMockSessionItem('item-1', 'Test Item')];
      const qrCodes = new Map([['item-1', 'data:image/png;base64,test']]);

      let blob: Blob | null = null;

      await act(async () => {
        blob = await result.current.generatePDF(items, qrCodes);
      });

      expect(blob).toBeNull();
      expect(result.current.error).toBe('Network error');
    });

    it('should error when no QR codes are available', async () => {
      const { result } = renderHook(() =>
        usePDFGeneration({ settings: createDefaultSettings() })
      );

      const items = [createMockSessionItem('item-1', 'Test Item')];
      const qrCodes = new Map<string, string>(); // Empty map

      let blob: Blob | null = null;

      await act(async () => {
        blob = await result.current.generatePDF(items, qrCodes);
      });

      expect(blob).toBeNull();
      expect(result.current.error).toBe('No QR codes available for PDF generation');
    });

    it('should use QR code from item if not in provided map', async () => {
      const mockPDFBytes = createMockPDFBytes();
      const mockBlob = new Blob([mockPDFBytes], { type: 'application/pdf' });

      mockedGeneratePDFFromQRCodes.mockResolvedValue({
        success: true,
        pdfBytes: mockPDFBytes,
      });
      mockedConvertPDFToBlob.mockReturnValue(mockBlob);

      const { result } = renderHook(() =>
        usePDFGeneration({ settings: createDefaultSettings() })
      );

      // Item has qrCodeUrl but map doesn't have it
      const items = [createMockSessionItem('item-1', 'Test Item', 'existing-qr-url')];
      const qrCodes = new Map<string, string>();

      await act(async () => {
        await result.current.generatePDF(items, qrCodes);
      });

      expect(mockedGeneratePDFFromQRCodes).toHaveBeenCalled();
    });

    it('should call onProgress callback during generation', async () => {
      const mockPDFBytes = createMockPDFBytes();
      const mockBlob = new Blob([mockPDFBytes], { type: 'application/pdf' });

      mockedGeneratePDFFromQRCodes.mockImplementation(async (urlMap, settings, options) => {
        // Simulate progress callbacks
        options?.onProgress?.({ step: 'Generating QR codes', percentage: 25 });
        options?.onProgress?.({ step: 'Creating PDF', percentage: 75 });
        options?.onProgress?.({ step: 'Complete', percentage: 100 });
        return { success: true, pdfBytes: mockPDFBytes };
      });
      mockedConvertPDFToBlob.mockReturnValue(mockBlob);

      const onProgress = jest.fn();
      const { result } = renderHook(() =>
        usePDFGeneration({ settings: createDefaultSettings(), onProgress })
      );

      const items = [createMockSessionItem('item-1', 'Test Item')];
      const qrCodes = new Map([['item-1', 'data:image/png;base64,test']]);

      await act(async () => {
        await result.current.generatePDF(items, qrCodes);
      });

      expect(onProgress).toHaveBeenCalledWith(expect.objectContaining({ percentage: 25 }));
      expect(onProgress).toHaveBeenCalledWith(expect.objectContaining({ percentage: 75 }));
    });
  });

  // ===========================================================================
  // Download PDF Tests
  // ===========================================================================

  describe('downloadPDF', () => {
    it('should call downloadPDFBlob with blob and filename', () => {
      const { result } = renderHook(() =>
        usePDFGeneration({ settings: createDefaultSettings() })
      );

      const mockBlob = new Blob(['test'], { type: 'application/pdf' });

      act(() => {
        result.current.downloadPDF(mockBlob, 'custom-name.pdf');
      });

      expect(mockedDownloadPDFBlob).toHaveBeenCalledWith(mockBlob, 'custom-name.pdf');
    });

    it('should generate default filename when not provided', () => {
      const { result } = renderHook(() =>
        usePDFGeneration({ settings: createDefaultSettings() })
      );

      const mockBlob = new Blob(['test'], { type: 'application/pdf' });

      act(() => {
        result.current.downloadPDF(mockBlob);
      });

      // Should be called with a date-based filename
      expect(mockedDownloadPDFBlob).toHaveBeenCalledWith(
        mockBlob,
        expect.stringMatching(/^qr-codes-\d{4}-\d{2}-\d{2}\.pdf$/)
      );
    });
  });

  // ===========================================================================
  // Clear Error Tests
  // ===========================================================================

  describe('clearError', () => {
    it('should clear error state', async () => {
      mockedGeneratePDFFromQRCodes.mockResolvedValue({
        success: false,
        error: 'Test error',
        pdfBytes: null,
      });

      const { result } = renderHook(() =>
        usePDFGeneration({ settings: createDefaultSettings() })
      );

      const items = [createMockSessionItem('item-1', 'Test Item')];
      const qrCodes = new Map([['item-1', 'data:image/png;base64,test']]);

      // Generate error
      await act(async () => {
        await result.current.generatePDF(items, qrCodes);
      });

      expect(result.current.error).toBe('Test error');

      // Clear error
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  // ===========================================================================
  // Settings Updates Tests
  // ===========================================================================

  describe('settings updates', () => {
    it('should use updated settings for generation', async () => {
      const mockPDFBytes = createMockPDFBytes();
      const mockBlob = new Blob([mockPDFBytes], { type: 'application/pdf' });

      mockedGeneratePDFFromQRCodes.mockResolvedValue({
        success: true,
        pdfBytes: mockPDFBytes,
      });
      mockedConvertPDFToBlob.mockReturnValue(mockBlob);

      const initialSettings = createDefaultSettings();
      const { result, rerender } = renderHook(
        ({ settings }) => usePDFGeneration({ settings }),
        { initialProps: { settings: initialSettings } }
      );

      // Update settings
      const updatedSettings = { ...initialSettings, pageFormat: 'A4' as const };
      rerender({ settings: updatedSettings });

      const items = [createMockSessionItem('item-1', 'Test Item')];
      const qrCodes = new Map([['item-1', 'data:image/png;base64,test']]);

      await act(async () => {
        await result.current.generatePDF(items, qrCodes);
      });

      expect(mockedGeneratePDFFromQRCodes).toHaveBeenCalledWith(
        expect.any(Map),
        expect.objectContaining({ pageFormat: 'A4' }),
        expect.anything()
      );
    });
  });
});
