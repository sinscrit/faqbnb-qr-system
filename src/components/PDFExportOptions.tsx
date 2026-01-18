'use client';

import React from 'react';
import { PDFExportSettings } from '@/types/pdf';
import { cn } from '@/lib/utils';

/**
 * Props for the PDFExportOptions component
 */
interface PDFExportOptionsProps {
  /** Current PDF export settings */
  settings: PDFExportSettings;
  /** Callback when settings change */
  onSettingsChange: (settings: Partial<PDFExportSettings>) => void;
  /** Callback when user wants to export PDF */
  onExport?: () => void;
  /** Optional class name for styling */
  className?: string;
  /** Whether controls are disabled during PDF generation */
  disabled?: boolean;
  /** Whether to show the export button */
  showExportButton?: boolean;
  /** Loading state for PDF generation */
  isGenerating?: boolean;
}

/**
 * PDFExportOptions component for configuring PDF export settings
 */
export function PDFExportOptions({
  settings,
  onSettingsChange,
  onExport,
  className,
  disabled = false,
  showExportButton = true,
  isGenerating = false
}: PDFExportOptionsProps) {
  
  /**
   * Handle page format change
   */
  const handlePageFormatChange = (format: 'A4' | 'Letter'): void => {
    onSettingsChange({ pageFormat: format });
  };

  /**
   * Handle margin change
   */
  const handleMarginChange = (margins: number): void => {
    onSettingsChange({ margins });
  };

  /**
   * Handle QR size change
   */
  const handleQRSizeChange = (qrSize: number): void => {
    onSettingsChange({ qrSize });
  };

  /**
   * Handle cutlines toggle
   */
  const handleCutlinesToggle = (includeCutlines: boolean): void => {
    onSettingsChange({ includeCutlines });
  };

  /**
   * Handle labels toggle
   */
  const handleLabelsToggle = (includeLabels: boolean): void => {
    onSettingsChange({ includeLabels });
  };

  /**
   * Render page format selector
   */
  const renderPageFormatSelector = (): JSX.Element => {
    const formats = [
      { 
        value: 'A4', 
        label: 'A4', 
        dimensions: '210 × 297 mm',
        description: 'International standard (8.3" × 11.7")'
      },
      { 
        value: 'Letter', 
        label: 'US Letter', 
        dimensions: '216 × 279 mm',
        description: 'US standard (8.5" × 11")'
      }
    ] as const;

    return (
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Page Format
        </label>
        <div className="grid grid-cols-1 gap-3">
          {formats.map(({ value, label, dimensions, description }) => (
            <label
              key={value}
              className={cn(
                "relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200",
                disabled && "opacity-50 cursor-not-allowed",
                settings.pageFormat === value
                  ? "border-blue-500 bg-blue-50 text-blue-900"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
              )}
            >
              <input
                type="radio"
                name="pageFormat"
                value={value}
                checked={settings.pageFormat === value}
                onChange={() => !disabled && handlePageFormatChange(value)}
                disabled={disabled}
                className="sr-only"
              />
              
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {/* Visual page representation */}
                    <div className={cn(
                      "flex items-center justify-center rounded border-2 mr-3 transition-all duration-200",
                      value === 'A4' ? "w-6 h-8" : "w-6 h-7", // Proportional to actual page sizes
                      settings.pageFormat === value
                        ? "border-blue-500 bg-blue-100"
                        : "border-gray-300 bg-gray-100"
                    )}>
                      <div className={cn(
                        "border rounded-sm",
                        value === 'A4' ? "w-4 h-6" : "w-4 h-5",
                        settings.pageFormat === value
                          ? "border-blue-400 bg-blue-50"
                          : "border-gray-400 bg-white"
                      )} />
                    </div>
                    
                    <div>
                      <div className="font-medium">{label}</div>
                      <div className="text-xs text-gray-500">{dimensions}</div>
                    </div>
                  </div>
                  
                  {settings.pageFormat === value && (
                    <div className="text-blue-500">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                
                <p className={cn(
                  "text-xs mt-1",
                  settings.pageFormat === value ? "text-blue-700" : "text-gray-600"
                )}>
                  {description}
                </p>
              </div>
            </label>
          ))}
        </div>
      </div>
    );
  };

  /**
   * Render margin configuration
   */
  const renderMarginConfig = (): JSX.Element => {
    return (
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Page Margins
        </label>
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <input
              type="range"
              min="5"
              max="25"
              step="1"
              value={settings.margins}
              onChange={(e) => !disabled && handleMarginChange(parseInt(e.target.value))}
              disabled={disabled}
              className={cn(
                "flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer",
                disabled && "opacity-50 cursor-not-allowed",
                "slider"
              )}
            />
            <div className="flex items-center space-x-1 min-w-[60px]">
              <input
                type="number"
                min="5"
                max="25"
                value={settings.margins}
                onChange={(e) => !disabled && handleMarginChange(Math.max(5, Math.min(25, parseInt(e.target.value) || 5)))}
                disabled={disabled}
                className={cn(
                  "w-12 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                  disabled && "opacity-50 cursor-not-allowed bg-gray-100"
                )}
              />
              <span className="text-sm text-gray-500">mm</span>
            </div>
          </div>
          <p className="text-xs text-gray-600">
            Space around the edges of the page (5-25mm). Larger margins ensure content stays within printer limits.
          </p>
        </div>
      </div>
    );
  };

  /**
   * Render QR size configuration
   */
  const renderQRSizeConfig = (): JSX.Element => {
    return (
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          QR Code Size
        </label>
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <input
              type="range"
              min="20"
              max="60"
              step="5"
              value={settings.qrSize}
              onChange={(e) => !disabled && handleQRSizeChange(parseInt(e.target.value))}
              disabled={disabled}
              className={cn(
                "flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer",
                disabled && "opacity-50 cursor-not-allowed",
                "slider"
              )}
            />
            <div className="flex items-center space-x-1 min-w-[60px]">
              <input
                type="number"
                min="20"
                max="60"
                step="5"
                value={settings.qrSize}
                onChange={(e) => !disabled && handleQRSizeChange(Math.max(20, Math.min(60, parseInt(e.target.value) || 20)))}
                disabled={disabled}
                className={cn(
                  "w-12 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                  disabled && "opacity-50 cursor-not-allowed bg-gray-100"
                )}
              />
              <span className="text-sm text-gray-500">mm</span>
            </div>
          </div>
          
          {/* QR Size Visual Indicator */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div 
                className="border-2 border-gray-400 bg-gray-100 rounded flex items-center justify-center"
                style={{ 
                  width: Math.max(12, settings.qrSize * 0.4), 
                  height: Math.max(12, settings.qrSize * 0.4) 
                }}
              >
                <div 
                  className="bg-gray-700 rounded-sm"
                  style={{ 
                    width: Math.max(8, settings.qrSize * 0.3), 
                    height: Math.max(8, settings.qrSize * 0.3) 
                  }}
                />
              </div>
              <span className="text-xs text-gray-600">
                Preview ({settings.qrSize}mm)
              </span>
            </div>
          </div>
          
          <p className="text-xs text-gray-600">
            Size of each QR code (20-60mm). Larger codes are easier to scan but fit fewer per page.
          </p>
        </div>
      </div>
    );
  };

  /**
   * Render PDF-specific options
   */
  const renderPDFOptions = (): JSX.Element => {
    return (
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          PDF Options
        </label>
        
        <div className="space-y-3">
          {/* Include Cutlines Option */}
          <label className={cn(
            "flex items-start space-x-3 p-3 border rounded-lg cursor-pointer transition-all duration-200",
            disabled && "opacity-50 cursor-not-allowed",
            "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
          )}>
            <input
              type="checkbox"
              checked={settings.includeCutlines}
              onChange={(e) => !disabled && handleCutlinesToggle(e.target.checked)}
              disabled={disabled}
              className="mt-0.5 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <div className="flex-1">
              <div className="font-medium text-gray-900">Include Cutlines</div>
              <p className="text-sm text-gray-600 mt-1">
                Add precise cutting guides around each QR code for professional trimming and alignment.
              </p>
            </div>
          </label>

          {/* Include Labels Option */}
          <label className={cn(
            "flex items-start space-x-3 p-3 border rounded-lg cursor-pointer transition-all duration-200",
            disabled && "opacity-50 cursor-not-allowed",
            "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
          )}>
            <input
              type="checkbox"
              checked={settings.includeLabels}
              onChange={(e) => !disabled && handleLabelsToggle(e.target.checked)}
              disabled={disabled}
              className="mt-0.5 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <div className="flex-1">
              <div className="font-medium text-gray-900">Include Item Labels</div>
              <p className="text-sm text-gray-600 mt-1">
                Add item names below each QR code for easy identification when printed.
              </p>
            </div>
          </label>
        </div>
      </div>
    );
  };

  /**
   * Render export button
   */
  const renderExportButton = (): JSX.Element | null => {
    if (!showExportButton || !onExport) return null;

    return (
      <div className="pt-4 border-t border-gray-200">
        <button
          onClick={onExport}
          disabled={disabled || isGenerating}
          className={cn(
            "w-full flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-all duration-200",
            disabled || isGenerating
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          )}
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating PDF...
            </>
          ) : (
            <>
              <svg className="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export PDF
            </>
          )}
        </button>
      </div>
    );
  };

  return (
    <div className={cn("space-y-6", className)}>
      {renderPageFormatSelector()}
      {renderMarginConfig()}
      {renderQRSizeConfig()}
      {renderPDFOptions()}
      {renderExportButton()}
      
      {/* Custom styles for sliders */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .slider:disabled::-webkit-slider-thumb {
          background: #9ca3af;
          cursor: not-allowed;
        }
        
        .slider:disabled::-moz-range-thumb {
          background: #9ca3af;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}