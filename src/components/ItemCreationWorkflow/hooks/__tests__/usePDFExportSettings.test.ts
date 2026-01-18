/**
 * usePDFExportSettings Hook Tests
 *
 * @module ItemCreationWorkflow/hooks/__tests__/usePDFExportSettings
 * @see docs/REQ-112-pdf-generation-integration-overview.md
 * @lastModified 2026-01-05 (REQ-112 PDF Generation Integration)
 */

import { renderHook, act } from '@testing-library/react';
import { usePDFExportSettings, DEFAULT_PDF_EXPORT_SETTINGS } from '../usePDFExportSettings';

// =============================================================================
// Test Suites
// =============================================================================

describe('usePDFExportSettings', () => {
  // ===========================================================================
  // Initialization Tests
  // ===========================================================================

  describe('initialization', () => {
    it('should initialize with default settings', () => {
      const { result } = renderHook(() => usePDFExportSettings());

      expect(result.current.settings.pageFormat).toBe('Letter');
      expect(result.current.settings.margins).toBe(10);
      expect(result.current.settings.qrSize).toBe(40);
      expect(result.current.settings.includeCutlines).toBe(true);
      expect(result.current.settings.includeLabels).toBe(true);
      expect(result.current.settings.itemsPerRow).toBe(4);
    });

    it('should respect initial settings for partial overrides', () => {
      const { result } = renderHook(() =>
        usePDFExportSettings({ initialSettings: { pageFormat: 'A4', qrSize: 50 } })
      );

      expect(result.current.settings.pageFormat).toBe('A4');
      expect(result.current.settings.qrSize).toBe(50);
      expect(result.current.settings.margins).toBe(10); // Default preserved
      expect(result.current.settings.includeCutlines).toBe(true); // Default preserved
    });

    it('should keep qrSizeMm in sync with qrSize on initialization', () => {
      const { result } = renderHook(() =>
        usePDFExportSettings({ initialSettings: { qrSize: 55 } })
      );

      expect(result.current.settings.qrSize).toBe(55);
      expect(result.current.settings.qrSizeMm).toBe(55);
    });

    it('should keep showLabels in sync with includeLabels on initialization', () => {
      const { result } = renderHook(() =>
        usePDFExportSettings({ initialSettings: { includeLabels: false } })
      );

      expect(result.current.settings.includeLabels).toBe(false);
      expect(result.current.settings.showLabels).toBe(false);
    });
  });

  // ===========================================================================
  // Update Settings Tests
  // ===========================================================================

  describe('updateSettings', () => {
    it('should update individual settings without resetting others', () => {
      const { result } = renderHook(() => usePDFExportSettings());

      act(() => {
        result.current.updateSettings({ qrSize: 60 });
      });

      expect(result.current.settings.qrSize).toBe(60);
      expect(result.current.settings.pageFormat).toBe('Letter');
      expect(result.current.settings.margins).toBe(10);
    });

    it('should update multiple settings at once', () => {
      const { result } = renderHook(() => usePDFExportSettings());

      act(() => {
        result.current.updateSettings({
          pageFormat: 'A4',
          margins: 15,
          qrSize: 45,
        });
      });

      expect(result.current.settings.pageFormat).toBe('A4');
      expect(result.current.settings.margins).toBe(15);
      expect(result.current.settings.qrSize).toBe(45);
    });

    it('should handle multiple sequential updates', () => {
      const { result } = renderHook(() => usePDFExportSettings());

      act(() => {
        result.current.updateSettings({ qrSize: 50 });
      });

      act(() => {
        result.current.updateSettings({ includeCutlines: false });
      });

      expect(result.current.settings.qrSize).toBe(50);
      expect(result.current.settings.includeCutlines).toBe(false);
    });

    it('should keep qrSizeMm in sync when qrSize is updated', () => {
      const { result } = renderHook(() => usePDFExportSettings());

      act(() => {
        result.current.updateSettings({ qrSize: 35 });
      });

      expect(result.current.settings.qrSize).toBe(35);
      expect(result.current.settings.qrSizeMm).toBe(35);
    });

    it('should keep showLabels in sync when includeLabels is updated', () => {
      const { result } = renderHook(() => usePDFExportSettings());

      act(() => {
        result.current.updateSettings({ includeLabels: false });
      });

      expect(result.current.settings.includeLabels).toBe(false);
      expect(result.current.settings.showLabels).toBe(false);
    });

    it('should toggle boolean settings correctly', () => {
      const { result } = renderHook(() => usePDFExportSettings());

      // Initial state
      expect(result.current.settings.includeCutlines).toBe(true);

      act(() => {
        result.current.updateSettings({ includeCutlines: false });
      });

      expect(result.current.settings.includeCutlines).toBe(false);

      act(() => {
        result.current.updateSettings({ includeCutlines: true });
      });

      expect(result.current.settings.includeCutlines).toBe(true);
    });
  });

  // ===========================================================================
  // Reset to Defaults Tests
  // ===========================================================================

  describe('resetToDefaults', () => {
    it('should reset all settings to defaults', () => {
      const { result } = renderHook(() => usePDFExportSettings());

      // Change some settings
      act(() => {
        result.current.updateSettings({
          pageFormat: 'A4',
          qrSize: 60,
          margins: 20,
          includeCutlines: false,
          includeLabels: false,
        });
      });

      // Verify changes
      expect(result.current.settings.pageFormat).toBe('A4');
      expect(result.current.settings.qrSize).toBe(60);

      // Reset to defaults
      act(() => {
        result.current.resetToDefaults();
      });

      // Verify reset
      expect(result.current.settings).toEqual(DEFAULT_PDF_EXPORT_SETTINGS);
    });

    it('should be idempotent - calling multiple times has same result', () => {
      const { result } = renderHook(() => usePDFExportSettings());

      // Change settings
      act(() => {
        result.current.updateSettings({ pageFormat: 'A4', qrSize: 55 });
      });

      // Reset multiple times
      act(() => {
        result.current.resetToDefaults();
      });

      const firstReset = { ...result.current.settings };

      act(() => {
        result.current.resetToDefaults();
      });

      expect(result.current.settings).toEqual(firstReset);
    });
  });

  // ===========================================================================
  // DEFAULT_PDF_EXPORT_SETTINGS Constant Tests
  // ===========================================================================

  describe('DEFAULT_PDF_EXPORT_SETTINGS', () => {
    it('should have the correct default values as per specification', () => {
      expect(DEFAULT_PDF_EXPORT_SETTINGS.pageFormat).toBe('Letter');
      expect(DEFAULT_PDF_EXPORT_SETTINGS.margins).toBe(10);
      expect(DEFAULT_PDF_EXPORT_SETTINGS.qrSize).toBe(40);
      expect(DEFAULT_PDF_EXPORT_SETTINGS.includeCutlines).toBe(true);
      expect(DEFAULT_PDF_EXPORT_SETTINGS.includeLabels).toBe(true);
      expect(DEFAULT_PDF_EXPORT_SETTINGS.itemsPerRow).toBe(4);
    });

    it('should have consistent qrSizeMm and qrSize values', () => {
      expect(DEFAULT_PDF_EXPORT_SETTINGS.qrSizeMm).toBe(DEFAULT_PDF_EXPORT_SETTINGS.qrSize);
    });

    it('should have consistent showLabels and includeLabels values', () => {
      expect(DEFAULT_PDF_EXPORT_SETTINGS.showLabels).toBe(DEFAULT_PDF_EXPORT_SETTINGS.includeLabels);
    });
  });

  // ===========================================================================
  // Edge Cases Tests
  // ===========================================================================

  describe('edge cases', () => {
    it('should handle empty initialSettings object', () => {
      const { result } = renderHook(() =>
        usePDFExportSettings({ initialSettings: {} })
      );

      expect(result.current.settings).toEqual(DEFAULT_PDF_EXPORT_SETTINGS);
    });

    it('should handle undefined initialSettings', () => {
      const { result } = renderHook(() =>
        usePDFExportSettings({ initialSettings: undefined })
      );

      expect(result.current.settings).toEqual(DEFAULT_PDF_EXPORT_SETTINGS);
    });

    it('should handle empty options object', () => {
      const { result } = renderHook(() => usePDFExportSettings({}));

      expect(result.current.settings).toEqual(DEFAULT_PDF_EXPORT_SETTINGS);
    });

    it('should preserve settings across re-renders', () => {
      const { result, rerender } = renderHook(() => usePDFExportSettings());

      act(() => {
        result.current.updateSettings({ qrSize: 55 });
      });

      // Re-render the hook
      rerender();

      expect(result.current.settings.qrSize).toBe(55);
    });
  });
});
