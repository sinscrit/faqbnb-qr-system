'use client';

import React from 'react';
import { QRPrintSettings } from '@/types';
import { cn } from '@/lib/utils';

/**
 * Props for the PrintLayoutControls component
 */
interface PrintLayoutControlsProps {
  /** Current print settings */
  printSettings: QRPrintSettings;
  /** Callback when print settings change */
  onSettingsChange: (settings: Partial<QRPrintSettings>) => void;
  /** Optional class name for styling */
  className?: string;
  /** Whether controls are disabled during QR generation */
  disabled?: boolean;
}

/**
 * PrintLayoutControls component for configuring QR code print layout settings
 */
export function PrintLayoutControls({
  printSettings,
  onSettingsChange,
  className,
  disabled = false
}: PrintLayoutControlsProps) {
  
  /**
   * Handle QR size change
   */
  const handleSizeChange = (size: 'small' | 'medium' | 'large'): void => {
    onSettingsChange({ qrSize: size });
  };

  /**
   * Handle layout change (items per row)
   */
  const handleLayoutChange = (itemsPerRow: number): void => {
    onSettingsChange({ itemsPerRow: itemsPerRow as 2 | 3 | 4 | 6 });
  };

  /**
   * Handle labels toggle
   */
  const handleLabelsToggle = (showLabels: boolean): void => {
    onSettingsChange({ showLabels });
  };

  /**
   * Render QR size selector with visual indicators
   */
  const renderSizeSelector = (): JSX.Element => {
    const sizes = [
      { value: 'small', label: 'Small', dimension: '1"', description: 'Compact, fits more items' },
      { value: 'medium', label: 'Medium', dimension: '1.5"', description: 'Balanced size and readability' },
      { value: 'large', label: 'Large', dimension: '2"', description: 'Easy to scan, takes more space' }
    ] as const;

    return (
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          QR Code Size
        </label>
        <div className="grid grid-cols-1 gap-3">
          {sizes.map(({ value, label, dimension, description }) => (
            <label
              key={value}
              className={cn(
                "relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200",
                disabled && "opacity-50 cursor-not-allowed",
                printSettings.qrSize === value
                  ? "border-blue-500 bg-blue-50 text-blue-900"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
              )}
            >
              <input
                type="radio"
                name="qrSize"
                value={value}
                checked={printSettings.qrSize === value}
                onChange={() => !disabled && handleSizeChange(value)}
                disabled={disabled}
                className="sr-only"
              />
              
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={cn(
                      "flex items-center justify-center rounded border-2 mr-3 transition-all duration-200",
                      value === 'small' ? "w-6 h-6" : value === 'medium' ? "w-8 h-8" : "w-10 h-10",
                      printSettings.qrSize === value
                        ? "border-blue-500 bg-blue-100"
                        : "border-gray-300 bg-gray-100"
                    )}>
                      <div className={cn(
                        "bg-gray-800 rounded-sm",
                        value === 'small' ? "w-3 h-3" : value === 'medium' ? "w-4 h-4" : "w-6 h-6"
                      )} />
                    </div>
                    
                    <div>
                      <span className="font-medium">{label}</span>
                      <span className="ml-2 text-sm text-gray-500">({dimension})</span>
                    </div>
                  </div>
                  
                  {printSettings.qrSize === value && (
                    <div className="text-blue-500">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                
                <p className="text-sm text-gray-600 mt-1 ml-9">{description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>
    );
  };

  /**
   * Render grid layout selector with visual preview
   */
  const renderLayoutSelector = (): JSX.Element => {
    const layouts = [
      { value: 2, label: '2 per row', description: 'Large QR codes, good for detailed viewing' },
      { value: 3, label: '3 per row', description: 'Balanced layout, recommended for most uses' },
      { value: 4, label: '4 per row', description: 'Compact layout, fits more items per page' },
      { value: 6, label: '6 per row', description: 'Maximum density, best for many small items' }
    ];

    return (
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Items per Row
        </label>
        <div className="grid grid-cols-2 gap-3">
          {layouts.map(({ value, label, description }) => (
            <label
              key={value}
              className={cn(
                "relative flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-all duration-200",
                disabled && "opacity-50 cursor-not-allowed",
                printSettings.itemsPerRow === value
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
              )}
            >
              <input
                type="radio"
                name="itemsPerRow"
                value={value}
                checked={printSettings.itemsPerRow === value}
                onChange={() => !disabled && handleLayoutChange(value)}
                disabled={disabled}
                className="sr-only"
              />
              
              <div className="flex items-center justify-between mb-2">
                <span className={cn(
                  "font-medium",
                  printSettings.itemsPerRow === value ? "text-blue-900" : "text-gray-900"
                )}>
                  {label}
                </span>
                {printSettings.itemsPerRow === value && (
                  <div className="text-blue-500">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              
              {/* Visual grid preview */}
              <div className="mb-3">
                <div className={cn(
                  "grid gap-1 mx-auto",
                  value === 2 ? "grid-cols-2 w-16" :
                  value === 3 ? "grid-cols-3 w-20" :
                  value === 4 ? "grid-cols-4 w-24" :
                  "grid-cols-6 w-32"
                )}>
                  {Array.from({ length: value }, (_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "aspect-square rounded border",
                        printSettings.itemsPerRow === value
                          ? "bg-blue-200 border-blue-300"
                          : "bg-gray-200 border-gray-300"
                      )}
                    />
                  ))}
                </div>
              </div>
              
              <p className={cn(
                "text-xs text-center",
                printSettings.itemsPerRow === value ? "text-blue-700" : "text-gray-600"
              )}>
                {description}
              </p>
            </label>
          ))}
        </div>
      </div>
    );
  };

  /**
   * Render additional print options
   */
  const renderAdditionalOptions = (): JSX.Element => {
    return (
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          Additional Options
        </label>
        
        <div className="space-y-3">
          {/* Show Labels Option */}
          <label className={cn(
            "flex items-start space-x-3 p-3 border rounded-lg cursor-pointer transition-all duration-200",
            disabled && "opacity-50 cursor-not-allowed",
            "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
          )}>
            <input
              type="checkbox"
              checked={printSettings.showLabels}
              onChange={(e) => !disabled && handleLabelsToggle(e.target.checked)}
              disabled={disabled}
              className="mt-0.5 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <div className="flex-1">
              <div className="font-medium text-gray-900">Show Item Labels</div>
              <p className="text-sm text-gray-600 mt-1">
                Include item names below each QR code. Helps identify items when printed.
              </p>
            </div>
          </label>

          {/* QR URL Display Option */}
          <label className={cn(
            "flex items-start space-x-3 p-3 border rounded-lg cursor-pointer transition-all duration-200",
            disabled && "opacity-50 cursor-not-allowed",
            "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
          )}>
            <input
              type="checkbox"
              checked={false} // This could be a future feature
              onChange={() => {}} // Placeholder for future implementation
              disabled={true} // Disabled for now
              className="mt-0.5 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <div className="flex-1">
              <div className="font-medium text-gray-400">Show QR URLs (Coming Soon)</div>
              <p className="text-sm text-gray-500 mt-1">
                Display the full URL below each QR code for reference.
              </p>
            </div>
          </label>

          {/* Page Break Option */}
          <label className={cn(
            "flex items-start space-x-3 p-3 border rounded-lg cursor-pointer transition-all duration-200",
            disabled && "opacity-50 cursor-not-allowed",
            "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
          )}>
            <input
              type="checkbox"
              checked={true} // Default to avoiding page breaks
              onChange={() => {}} // This could be configurable in the future
              disabled={true} // Fixed behavior for now
              className="mt-0.5 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <div className="flex-1">
              <div className="font-medium text-gray-400">Avoid Page Breaks (Enabled)</div>
              <p className="text-sm text-gray-500 mt-1">
                Prevent QR codes from being cut across page boundaries.
              </p>
            </div>
          </label>
        </div>
      </div>
    );
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Print Layout Configuration
        </h3>
        <p className="text-gray-600">
          Customize how your QR codes will be arranged and displayed when printed
        </p>
      </div>

      {/* Main Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Size Selector */}
        <div className="space-y-4">
          {renderSizeSelector()}
        </div>

        {/* Right Column - Layout Selector */}
        <div className="space-y-4">
          {renderLayoutSelector()}
        </div>
      </div>

      {/* Additional Options */}
      <div>
        {renderAdditionalOptions()}
      </div>

      {/* Print Preview Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-3 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Print Preview Summary
        </h4>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center p-2 bg-white rounded border">
            <div className="font-medium text-blue-900">QR Size</div>
            <div className="text-blue-700 capitalize">{printSettings.qrSize}</div>
            <div className="text-xs text-gray-600 mt-1">
              {printSettings.qrSize === 'small' ? '1 inch' : 
               printSettings.qrSize === 'large' ? '2 inches' : '1.5 inches'}
            </div>
          </div>
          
          <div className="text-center p-2 bg-white rounded border">
            <div className="font-medium text-blue-900">Layout</div>
            <div className="text-blue-700">{printSettings.itemsPerRow} per row</div>
            <div className="text-xs text-gray-600 mt-1">Grid layout</div>
          </div>
          
          <div className="text-center p-2 bg-white rounded border">
            <div className="font-medium text-blue-900">Labels</div>
            <div className="text-blue-700">{printSettings.showLabels ? 'Enabled' : 'Disabled'}</div>
            <div className="text-xs text-gray-600 mt-1">Item names</div>
          </div>
          
          <div className="text-center p-2 bg-white rounded border">
            <div className="font-medium text-blue-900">Print Mode</div>
            <div className="text-blue-700">Optimized</div>
            <div className="text-xs text-gray-600 mt-1">High quality</div>
          </div>
        </div>
      </div>

      {/* Help Text */}
      <div className="text-center text-sm text-gray-500">
        💡 <strong>Tip:</strong> Choose larger QR codes for better scanning reliability, 
        or smaller codes to fit more items per page.
      </div>
    </div>
  );
} 