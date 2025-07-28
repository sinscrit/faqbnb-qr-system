'use client';

import React, { useMemo, useCallback, useState, useRef, useEffect } from 'react';
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
 * BUG FIX: Virtualized item component for better performance
 */
interface VirtualizedItemProps {
  item: QRCodePrintItem;
  qrSizeClass: string;
  showLabels: boolean;
  isVisible: boolean;
}

const VirtualizedQRItem = React.memo(({ item, qrSizeClass, showLabels, isVisible }: VirtualizedItemProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // BUG FIX: Only render when visible to improve performance
  if (!isVisible) {
    return (
      <div className={cn(
        "qr-item flex flex-col items-center space-y-2",
        "print:break-inside-avoid print:space-y-1",
        qrSizeClass
      )}>
        <div className="qr-code-container animate-pulse bg-gray-200 rounded" />
      </div>
    );
  }

  return (
    <div
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
        {item.isLoading ? (
          <div className="flex flex-col items-center justify-center space-y-2 p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
            <span className="text-xs text-gray-500">Generating...</span>
          </div>
        ) : item.qrCodeDataUrl ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="animate-pulse w-full h-full bg-gray-200 rounded" />
              </div>
            )}
            <img
              src={item.qrCodeDataUrl}
              alt={`QR Code for ${item.item.name}`}
              className={cn(
                "qr-code-image max-w-full max-h-full object-contain",
                imageLoaded ? 'opacity-100' : 'opacity-0'
              )}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageLoaded(false)}
              loading="lazy"
            />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-2 p-4 text-gray-500">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-xs">Failed to load</span>
          </div>
        )}
      </div>

      {/* Item Label */}
      {showLabels && (
        <div className="qr-item-label text-center max-w-full">
          <p className="text-sm font-medium text-gray-900 print:text-black truncate">
            {item.item.name}
          </p>
          <p className="text-xs text-gray-500 print:text-gray-700 font-mono">
            {item.item.public_id.slice(0, 8)}...
          </p>
        </div>
      )}
    </div>
  );
});

VirtualizedQRItem.displayName = 'VirtualizedQRItem';

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
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleItems, setVisibleItems] = useState<Set<string>>(new Set());

  // BUG FIX: Memoize print items with better performance
  const printItems: QRCodePrintItem[] = useMemo(() => {
    return items.map(item => ({
      item,
      qrCodeDataUrl: qrCodes.get(item.id),
      isLoading: isGenerating && !qrCodes.has(item.id)
    }));
  }, [items, qrCodes, isGenerating]);

  // BUG FIX: Memoize CSS classes to prevent re-calculations
  const { gridClass, qrSizeClass } = useMemo(() => ({
    gridClass: getGridColumnsClass(printSettings.itemsPerRow),
    qrSizeClass: getQRSizeClass(printSettings.qrSize)
  }), [printSettings.itemsPerRow, printSettings.qrSize]);

  // Calculate total pages needed
  const totalPages = useMemo(() => {
    return calculatePrintPages(items.length, printSettings.itemsPerRow);
  }, [items.length, printSettings.itemsPerRow]);

  // BUG FIX: Virtualization for large item lists
  useEffect(() => {
    const updateVisibleItems = () => {
      if (!containerRef.current || printItems.length <= 20) {
        // Show all items if list is small
        setVisibleItems(new Set(printItems.map(item => item.item.id)));
        return;
      }

      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();
      const items = container.querySelectorAll('.qr-item');
      const visible = new Set<string>();

      items.forEach((item, index) => {
        const itemRect = item.getBoundingClientRect();
        const isVisible = itemRect.top < containerRect.bottom + 200 && 
                         itemRect.bottom > containerRect.top - 200;
        
        if (isVisible && printItems[index]) {
          visible.add(printItems[index].item.id);
        }
      });

      setVisibleItems(visible);
    };

    // BUG FIX: Throttled scroll handler for performance
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateVisibleItems();
          ticking = false;
        });
        ticking = true;
      }
    };

    const container = containerRef.current;
    if (container && printItems.length > 20) {
      container.addEventListener('scroll', handleScroll, { passive: true });
      updateVisibleItems(); // Initial check
    } else {
      setVisibleItems(new Set(printItems.map(item => item.item.id)));
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [printItems]);

  // Handle print functionality
  const handlePrint = useCallback(() => {
    if (onPrint) {
      onPrint();
    }
    
    // BUG FIX: Ensure all images are loaded before printing
    const images = document.querySelectorAll('.qr-code-image');
    const imagePromises = Array.from(images).map(img => {
      return new Promise<void>((resolve) => {
        if ((img as HTMLImageElement).complete) {
          resolve();
        } else {
          img.addEventListener('load', () => resolve());
          img.addEventListener('error', () => resolve()); // Continue even if some images fail
        }
      });
    });

    Promise.all(imagePromises).then(() => {
      setTimeout(() => {
        window.print();
      }, 100);
    });
  }, [onPrint]);

  /**
   * BUG FIX: Optimized QR grid rendering with virtualization
   */
  const renderQRGrid = useCallback(() => {
    return (
      <div 
        ref={containerRef}
        className={cn(
          "qr-grid grid gap-4 p-4 max-h-96 overflow-y-auto",
          gridClass,
          // Print-specific classes
          "print:gap-2 print:p-2 print:max-h-none print:overflow-visible"
        )}
      >
        {printItems.map((printItem) => (
          <VirtualizedQRItem
            key={printItem.item.id}
            item={printItem}
            qrSizeClass={qrSizeClass}
            showLabels={printSettings.showLabels}
            isVisible={visibleItems.has(printItem.item.id)}
          />
        ))}
      </div>
    );
  }, [printItems, gridClass, qrSizeClass, printSettings.showLabels, visibleItems]);

  /**
   * BUG FIX: Memoized statistics calculation
   */
  const stats = useMemo(() => {
    const total = printItems.length;
    const generated = printItems.filter(item => item.qrCodeDataUrl).length;
    const loading = printItems.filter(item => item.isLoading).length;
    const failed = total - generated - loading;

    return { total, generated, loading, failed };
  }, [printItems]);

  return (
    <div className={cn("qr-print-preview", className)}>
      {/* Header with stats and print button */}
      <div className="flex justify-between items-center mb-4 print:hidden">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Print Preview
          </h3>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>Total: {stats.total}</span>
            <span className="text-green-600">Generated: {stats.generated}</span>
            {stats.loading > 0 && <span className="text-blue-600">Loading: {stats.loading}</span>}
            {stats.failed > 0 && <span className="text-red-600">Failed: {stats.failed}</span>}
            <span>Pages: {totalPages}</span>
          </div>
        </div>
        
        <button
          onClick={handlePrint}
          disabled={isGenerating || stats.generated === 0}
          className={cn(
            "px-4 py-2 rounded-md font-medium transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
            isGenerating || stats.generated === 0
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          )}
        >
          {isGenerating ? 'Generating...' : 'Print QR Codes'}
        </button>
      </div>

      {/* QR Grid */}
      {printItems.length > 0 ? (
        renderQRGrid()
      ) : (
        <div className="text-center py-12 text-gray-500">
          <svg className="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <p>No items selected for QR code generation</p>
        </div>
      )}

      {/* Generation Progress */}
      {isGenerating && (
        <div className="mt-4 print:hidden">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900">
                  Generating QR codes... ({stats.generated}/{stats.total})
                </p>
                <div className="mt-2 bg-blue-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(stats.generated / stats.total) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 