'use client';

import React, { useMemo, useCallback } from 'react';
import { Item, QRPrintSettings } from '@/types';
import { cn, getQRSizeClass, getGridColumnsClass, calculatePrintPages } from '@/lib/utils';

/**
 * Props for the QRCodePrintPreview component
 */
interface QRCodePrintPreviewProps {
  /** Array of items to display */
  items: Item[];
  /** Map of generated QR codes (itemId -> dataUrl) */
  qrCodes: Map<string, string>;
  /** Print settings configuration */
  printSettings: QRPrintSettings;
  /** Whether QR codes are still being generated */
  isGenerating?: boolean;
  /** Optional class name for styling */
  className?: string;
  /** Callback when print is initiated */
  onPrint?: () => void;
}

/**
 * Individual QR code item for print display
 */
interface QRCodePrintItem {
  item: Item;
  qrCodeDataUrl?: string;
  isLoading: boolean;
}

/**
 * QRCodePrintPreview component for displaying and printing QR codes
 */
export function QRCodePrintPreview({
  items,
  qrCodes,
  printSettings,
  isGenerating = false,
  className,
  onPrint
}: QRCodePrintPreviewProps) {

  // Prepare items with QR code data for display
  const printItems: QRCodePrintItem[] = useMemo(() => {
    return items.map(item => ({
      item,
      qrCodeDataUrl: qrCodes.get(item.id),
      isLoading: isGenerating && !qrCodes.has(item.id)
    }));
  }, [items, qrCodes, isGenerating]);

  // Calculate total pages needed
  const totalPages = useMemo(() => {
    return calculatePrintPages(items.length, printSettings.itemsPerRow);
  }, [items.length, printSettings.itemsPerRow]);

  // Handle print functionality
  const handlePrint = useCallback(() => {
    if (onPrint) {
      onPrint();
    }
    
    // Trigger browser print dialog
    setTimeout(() => {
      window.print();
    }, 100);
  }, [onPrint]);

  /**
   * Render the QR code grid layout
   */
  const renderQRGrid = () => {
    const gridClass = getGridColumnsClass(printSettings.itemsPerRow);
    const qrSizeClass = getQRSizeClass(printSettings.qrSize);

    return (
      <div className={cn(
        "qr-grid grid gap-4 p-4",
        gridClass,
        // Print-specific classes
        "print:gap-2 print:p-2"
      )}>
        {printItems.map(({ item, qrCodeDataUrl, isLoading }) => (
          <div
            key={item.id}
            className={cn(
              "qr-item flex flex-col items-center space-y-2",
              "print:break-inside-avoid print:space-y-1"
            )}
          >
            {/* QR Code Display */}
            <div className={cn(
              "qr-code-container relative border border-gray-200 rounded bg-white flex items-center justify-center",
              qrSizeClass,
              "print:border-gray-400"
            )}>
              {isLoading ? (
                // Loading state
                <div className="animate-pulse flex items-center justify-center w-full h-full">
                  <div className="bg-gray-300 rounded w-3/4 h-3/4"></div>
                </div>
              ) : qrCodeDataUrl ? (
                // Generated QR Code
                <img
                  src={qrCodeDataUrl}
                  alt={`QR code for ${item.name}`}
                  className={cn(
                    "qr-code-image w-full h-full object-contain p-1",
                    "print:p-0.5"
                  )}
                />
              ) : (
                // Error or missing QR code
                <div className="flex flex-col items-center justify-center w-full h-full text-gray-400 p-2">
                  <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 18.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span className="text-xs text-center">Failed</span>
                </div>
              )}
            </div>

            {/* Item Label */}
            {printSettings.showLabels && (
              <div className={cn(
                "qr-item-label text-center w-full",
                "print:text-xs"
              )}>
                <p className={cn(
                  "text-sm font-medium text-gray-900 truncate",
                  "print:text-xs print:font-normal"
                )}>
                  {item.name}
                </p>
                <p className={cn(
                  "text-xs text-gray-500 truncate",
                  "print:text-xs print:hidden" // Hide public ID in print to save space
                )}>
                  {item.public_id}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  /**
   * Render print header (visible only when printing)
   */
  const renderPrintHeader = () => {
    return (
      <div className="hidden print:block print:mb-4">
        <h1 className="text-lg font-bold text-center text-gray-900">
          QR Codes - Property Items
        </h1>
        <div className="text-center text-sm text-gray-600 mt-1">
          Generated on {new Date().toLocaleDateString()} • {items.length} items
        </div>
      </div>
    );
  };

  /**
   * Render generation progress
   */
  const renderGenerationProgress = () => {
    if (!isGenerating) return null;

    const completed = qrCodes.size;
    const total = items.length;
    const percentage = total > 0 ? (completed / total) * 100 : 0;

    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-blue-900">
            Generating QR Codes...
          </span>
          <span className="text-sm text-blue-700">
            {completed} / {total}
          </span>
        </div>
        <div className="w-full bg-blue-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="text-xs text-blue-700 mt-2">
          Please wait while QR codes are being generated...
        </p>
      </div>
    );
  };

  /**
   * Render preview controls
   */
  const renderPreviewControls = () => {
    const readyToPrint = qrCodes.size > 0 && !isGenerating;
    
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4 print:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-700">
              <span className="font-medium">{qrCodes.size}</span> of <span className="font-medium">{items.length}</span> QR codes ready
            </div>
            <div className="text-sm text-gray-700">
              <span className="font-medium">{totalPages}</span> page{totalPages !== 1 ? 's' : ''} estimated
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              disabled={!readyToPrint}
              className={cn(
                "flex items-center px-4 py-2 rounded-md font-medium transition-all duration-200",
                readyToPrint
                  ? "bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              )}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print QR Codes
            </button>
            
            {readyToPrint && (
              <div className="text-xs text-gray-500 text-center">
                <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Ctrl+P</kbd>
                <br />shortcut
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  /**
   * Render print statistics
   */
  const renderPrintStatistics = () => {
    const failedCount = items.length - qrCodes.size;
    
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4 print:hidden">
        <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-600">{qrCodes.size}</div>
          <div className="text-gray-600">Generated</div>
        </div>
        
        {failedCount > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-red-600">{failedCount}</div>
            <div className="text-gray-600">Failed</div>
          </div>
        )}
        
        <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-blue-600">{printSettings.itemsPerRow}</div>
          <div className="text-gray-600">Per Row</div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-purple-600">{totalPages}</div>
          <div className="text-gray-600">Pages</div>
        </div>
      </div>
    );
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Print Header (print only) */}
      {renderPrintHeader()}
      
      {/* Generation Progress */}
      {renderGenerationProgress()}
      
      {/* Preview Controls */}
      {renderPreviewControls()}
      
      {/* Print Statistics */}
      {renderPrintStatistics()}
      
      {/* Main Content Area */}
      <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
        {items.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Items Selected</h3>
            <p className="text-gray-600">
              Please go back and select some items to generate QR codes for printing.
            </p>
          </div>
        ) : (
          <>
            {/* Preview Label */}
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 print:hidden">
              <h3 className="text-sm font-medium text-gray-900 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Print Preview
                <span className="ml-2 text-xs text-gray-500">
                  ({printSettings.qrSize} QR codes, {printSettings.itemsPerRow} per row)
                </span>
              </h3>
            </div>
            
            {/* QR Grid */}
            {renderQRGrid()}
          </>
        )}
      </div>
      
      {/* Print Instructions */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 print:hidden">
        <h4 className="font-medium text-yellow-900 mb-2 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Printing Tips
        </h4>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• Use high-quality paper for better QR code scanning</li>
          <li>• Ensure your printer is set to actual size (no scaling)</li>
          <li>• Test scan one QR code before printing all pages</li>
          <li>• Consider using a laser printer for sharper output</li>
        </ul>
      </div>
    </div>
  );
} 