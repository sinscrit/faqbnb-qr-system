'use client';

/**
 * usePDFExportSettings - PDF export configuration state management
 *
 * Manages user preferences for PDF export including page format, margins,
 * QR code size, and label options. Settings are session-scoped and reset
 * when the workflow completes.
 *
 * ## Default Settings
 * - Page Format: Letter (US standard)
 * - Margins: 10mm
 * - QR Size: 40mm (optimal for scanning)
 * - Layout: 4 items per row
 * - Cutlines/Labels: Enabled
 *
 * @example Configuring PDF export
 * ```tsx
 * const { settings, updateSettings, resetToDefaults } = usePDFExportSettings({
 *   initialSettings: { pageFormat: 'A4' },
 * });
 *
 * return (
 *   <PDFExportDialog
 *     settings={settings}
 *     onSettingsChange={updateSettings}
 *     onReset={resetToDefaults}
 *   />
 * );
 * ```
 *
 * @module ItemCreationWorkflow/hooks/usePDFExportSettings
 * @see PDFExportDialog for settings UI
 * @see usePDFGeneration for using settings in generation
 * @lastModified 2026-01-05 (REQ-118 Documentation Updates)
 */

import { useState, useCallback } from 'react';
import type { PDFExportSettings, PDFPageFormat } from '@/types/pdf';

// =============================================================================
// Type Definitions (Task 6.4.1)
// =============================================================================

/**
 * Options for configuring the usePDFExportSettings hook.
 */
export interface UsePDFExportSettingsOptions {
  /** Initial settings to override defaults */
  initialSettings?: Partial<PDFExportSettings>;
}

/**
 * Return type for the usePDFExportSettings hook.
 */
export interface UsePDFExportSettingsReturn {
  /** Current PDF export settings */
  settings: PDFExportSettings;
  /** Update one or more settings */
  updateSettings: (updates: Partial<PDFExportSettings>) => void;
  /** Reset all settings to defaults */
  resetToDefaults: () => void;
}

// =============================================================================
// Constants (Task 6.4.1)
// =============================================================================

/**
 * Default PDF export settings optimized for QR code printing.
 * - Letter: US default paper size
 * - 10mm margins: Professional printing standard
 * - 40mm QR codes: Optimal scanning size
 * - Cutlines and labels: Enabled for usability
 * - 4 items per row: Balanced layout
 */
export const DEFAULT_PDF_EXPORT_SETTINGS: PDFExportSettings = {
  // Page settings
  pageFormat: 'Letter' as PDFPageFormat,
  margins: 10, // 10mm margins

  // QR code settings
  qrSize: 40, // 40mm QR codes - optimal for scanning

  // Display options
  includeCutlines: true,
  includeLabels: true,

  // Layout
  itemsPerRow: 4,

  // Required inherited QRPrintSettings fields
  qrSizeMm: 40,
  showLabels: true,
};

// =============================================================================
// Core Implementation (Task 6.4.1)
// =============================================================================

/**
 * Custom hook for managing PDF export settings state.
 * Provides session-scoped settings with sensible defaults and
 * partial update capability.
 *
 * @param options - Configuration options for the hook
 * @returns Hook return with settings state and update methods
 *
 * @example
 * ```typescript
 * const { settings, updateSettings, resetToDefaults } = usePDFExportSettings();
 *
 * // Update a single setting
 * updateSettings({ qrSize: 50 });
 *
 * // Update multiple settings
 * updateSettings({ pageFormat: 'A4', margins: 15 });
 *
 * // Reset to defaults
 * resetToDefaults();
 * ```
 */
export function usePDFExportSettings(
  options: UsePDFExportSettingsOptions = {}
): UsePDFExportSettingsReturn {
  const { initialSettings } = options;

  // Initialize state by merging defaults with any provided initial settings
  const [settings, setSettings] = useState<PDFExportSettings>(() => ({
    ...DEFAULT_PDF_EXPORT_SETTINGS,
    ...initialSettings,
    // Ensure qrSizeMm stays in sync with qrSize
    qrSizeMm: initialSettings?.qrSize ?? DEFAULT_PDF_EXPORT_SETTINGS.qrSize,
    // Ensure showLabels stays in sync with includeLabels
    showLabels: initialSettings?.includeLabels ?? DEFAULT_PDF_EXPORT_SETTINGS.includeLabels,
  }));

  /**
   * Update one or more settings without resetting other values.
   * Merges the provided updates with the current settings state.
   */
  const updateSettings = useCallback((updates: Partial<PDFExportSettings>) => {
    setSettings(current => {
      const newSettings = { ...current, ...updates };

      // qrSize is already updated from the spread above
      // No need to sync qrSizeMm as it's been removed from the interface

      // Keep showLabels in sync with includeLabels if includeLabels was updated
      if (updates.includeLabels !== undefined) {
        newSettings.showLabels = updates.includeLabels;
      }

      return newSettings;
    });
  }, []);

  /**
   * Reset all settings to their default values.
   */
  const resetToDefaults = useCallback(() => {
    setSettings(DEFAULT_PDF_EXPORT_SETTINGS);
  }, []);

  return {
    settings,
    updateSettings,
    resetToDefaults,
  };
}

export default usePDFExportSettings;
