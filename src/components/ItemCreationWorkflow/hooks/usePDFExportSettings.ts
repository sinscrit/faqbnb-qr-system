'use client';

/**
 * usePDFExportSettings Hook
 *
 * Manages PDF export settings state with sensible defaults for the workflow.
 * Settings are session-only (no persistence to localStorage for V1).
 *
 * @module ItemCreationWorkflow/hooks/usePDFExportSettings
 * @see docs/REQ-112-pdf-generation-integration-overview.md
 * @lastModified 2026-01-05 (REQ-112 PDF Generation Integration)
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

      // Keep qrSizeMm in sync with qrSize if qrSize was updated
      if (updates.qrSize !== undefined) {
        newSettings.qrSizeMm = updates.qrSize;
      }

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
