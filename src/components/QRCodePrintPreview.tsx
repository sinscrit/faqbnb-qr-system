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
 * BUG FIX: Task 17 - Browser detection for mobile responsiveness
 */
const isMobile = typeof window !== 'undefined' && 
  ('ontouchstart' in window || navigator.maxTouchPoints > 0);

const isIOS = typeof window !== 'undefined' && 
  /iPad|iPhone|iPod/.test(navigator.userAgent);

const isSafari = typeof window !== 'undefined' && 
  /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

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
  const [touchStarted, setTouchStarted] = useState(false);
  
  // BUG FIX: Task 17 - Touch event handling for mobile devices
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStarted(true);
    // Prevent default touch behavior that might interfere with selection
    if (isMobile) {
      e.preventDefault();
    }
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    setTouchStarted(false);
    // Restore normal touch behavior
    if (isMobile) {
      e.preventDefault();
    }
  }, []);
  
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
        "qr-item flex flex-col items-center",
        "print:break-inside-avoid",
        // BUG FIX: Task 17 - Mobile-specific styling
        isMobile && "touch-manipulation select-none",
        touchStarted && "opacity-75 transform scale-95 transition-all duration-150"
      )}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* REQ-012 PHASE 3: 225x225 Container with Label Above QR Code */}
      <div className={cn(
        "qr-container relative border border-gray-200 rounded bg-white flex flex-col items-center justify-start p-2",
        // REQ-012: Fixed 225x225 container size (overrides qrSizeClass)
        "w-56 h-56", // 14rem = 224px ≈ 225px
        "print:border-gray-400",
        // BUG FIX: Task 17 - Mobile responsive sizing
        isMobile && "min-w-0 min-h-0"
      )}>
        {/* Item Label - Positioned Above QR Code */}
        {showLabels && (
          <div className={cn(
            "qr-item-label text-center w-full mb-1",
            // BUG FIX: Task 17 - Mobile label styling
            isMobile && "px-1"
          )}>
            <p className={cn(
              "text-sm font-medium text-gray-900 print:text-black truncate",
              isMobile && "text-xs" // Smaller text on mobile
            )}>
              {item.item.name}
            </p>
          </div>
        )}

        {/* QR Code Display - 200x200 centered */}
        <div className={cn(
          "qr-code-container relative flex items-center justify-center flex-1",
          // REQ-012: Fixed 200x200 QR code size
          "w-50 h-50", // 12.5rem = 200px
          "max-w-50 max-h-50"
        )}>
        {item.isLoading ? (
          <div className="flex flex-col items-center justify-center space-y-2 p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
            <span className={cn(
              "text-xs text-gray-500",
              isMobile && "text-xs" // Ensure readable text on mobile
            )}>Generating...</span>
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
                imageLoaded ? 'opacity-100' : 'opacity-0',
                // BUG FIX: Task 17 - Mobile image optimization
                isMobile && "touch-callout-none user-select-none"
              )}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageLoaded(false)}
              loading="lazy"
              // BUG FIX: Task 17 - Prevent context menu on mobile
              onContextMenu={isMobile ? (e) => e.preventDefault() : undefined}
              // BUG FIX: iOS-specific image handling
              style={isIOS ? { WebkitTouchCallout: 'none', WebkitUserSelect: 'none' } : undefined}
            />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-2 p-4 text-gray-500">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className={cn(
              "text-xs",
              isMobile && "text-xs" // Ensure readable text on mobile
            )}>Failed to load</span>
          </div>
        )}
        </div>
      </div>
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
  const { gridClass, qrSizeClass } = useMemo(() => {
    let adjustedItemsPerRow = printSettings.itemsPerRow;
    
    // BUG FIX: Task 17 - Mobile responsive grid adjustment
    if (isMobile) {
      // Reduce items per row on mobile for better usability
      adjustedItemsPerRow = Math.min(printSettings.itemsPerRow, 2) as 2 | 3 | 4 | 6;
    }
    
    return {
      gridClass: getGridColumnsClass(adjustedItemsPerRow),
      qrSizeClass: getQRSizeClass(printSettings.qrSize)
    };
  }, [printSettings.itemsPerRow, printSettings.qrSize]);

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
        const frameFunction = typeof requestAnimationFrame !== 'undefined' ? requestAnimationFrame : 
          (callback: FrameRequestCallback) => setTimeout(callback, 16);
        
        frameFunction(() => {
          updateVisibleItems();
          ticking = false;
        });
        ticking = true;
      }
    };

    // BUG FIX: Task 17 - Touch scroll handling for mobile
    const handleTouchScroll = (e: TouchEvent) => {
      // Handle touch scrolling on mobile devices
      if (isMobile) {
        handleScroll();
      }
    };

    const container = containerRef.current;
    if (container && printItems.length > 20) {
      container.addEventListener('scroll', handleScroll, { passive: true });
      
      // BUG FIX: Task 17 - Add touch event listeners for mobile
      if (isMobile) {
        container.addEventListener('touchmove', handleTouchScroll, { passive: true });
        container.addEventListener('touchend', handleScroll, { passive: true });
      }
      
      updateVisibleItems(); // Initial check
    } else {
      setVisibleItems(new Set(printItems.map(item => item.item.id)));
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
        
        if (isMobile) {
          container.removeEventListener('touchmove', handleTouchScroll);
          container.removeEventListener('touchend', handleScroll);
        }
      }
    };
  }, [printItems]);

  // BUG FIX: Task 17 - Enhanced print functionality with mobile browser support
  const handlePrint = useCallback(() => {
    if (onPrint) {
      onPrint();
    }
    
    // BUG FIX: Task 17 - Mobile browser print handling
    if (isMobile) {
      // Mobile browsers have limited print support
      if (isSafari && isIOS) {
        // iOS Safari specific handling
        alert('To print on iOS Safari, please use the Share button and select Print');
        return;
      } else if (navigator.share && printItems.length > 0) {
        // Use Web Share API if available
        const firstQR = printItems.find(item => item.qrCodeDataUrl);
        if (firstQR) {
          navigator.share({
            title: `QR Codes for ${printItems.length} items`,
            text: `Generated QR codes for printing`,
            url: window.location.href
          }).catch(console.error);
          return;
        }
      }
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
      // BUG FIX: Task 17 - Browser-specific print timing
      const delay = isSafari ? 200 : 100;
    setTimeout(() => {
        if (typeof window !== 'undefined' && window.print) {
      window.print();
        } else {
          console.warn('Print functionality not available in this browser');
        }
      }, delay);
    });
  }, [onPrint, printItems]);

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
          "print:gap-2 print:p-2 print:max-h-none print:overflow-visible",
          // BUG FIX: Task 17 - Mobile-specific styling
          isMobile && "max-h-80 gap-2 p-2 touch-pan-y",
          // BUG FIX: Safari-specific styling
          isSafari && "webkit-overflow-scrolling-touch"
        )}
        // BUG FIX: Task 17 - Touch handling attributes for mobile
        style={isMobile ? {
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-y'
        } : undefined}
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
      <div className={cn(
        "flex justify-between items-center mb-4 print:hidden",
        // BUG FIX: Task 17 - Mobile responsive header
        isMobile && "flex-col space-y-2 items-stretch"
      )}>
        <div className="flex-1">
          <h3 className={cn(
            "text-lg font-semibold text-gray-900 mb-2",
            isMobile && "text-base" // Smaller on mobile
          )}>
            Print Preview
          </h3>
          <div className={cn(
            "flex items-center space-x-4 text-sm text-gray-600",
            isMobile && "flex-wrap gap-2 space-x-0 text-xs" // Mobile layout
          )}>
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
              : "bg-blue-600 text-white hover:bg-blue-700",
            // BUG FIX: Task 17 - Mobile button styling
            isMobile && "w-full py-3 text-sm"
          )}
          // BUG FIX: Task 17 - Touch-friendly button attributes
          style={isMobile ? { touchAction: 'manipulation' } : undefined}
        >
          {isGenerating ? 'Generating...' : isMobile ? 'Print / Share QR Codes' : 'Print QR Codes'}
            </button>
      </div>

      {/* QR Grid */}
      {printItems.length > 0 ? (
        renderQRGrid()
      ) : (
        <div className={cn(
          "text-center py-12 text-gray-500",
          isMobile && "py-8" // Smaller padding on mobile
        )}>
          <svg className="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <p className={cn(
            "text-base",
            isMobile && "text-sm px-4" // Smaller text and padding on mobile
          )}>No items selected for QR code generation</p>
          </div>
        )}
      
      {/* Generation Progress */}
      {isGenerating && (
        <div className="mt-4 print:hidden">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent" />
              <div className="flex-1">
                <p className={cn(
                  "text-sm font-medium text-blue-900",
                  isMobile && "text-xs" // Smaller text on mobile
                )}>
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

      {/* BUG FIX: Task 17 - Mobile-specific help text */}
      {isMobile && stats.generated > 0 && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md print:hidden">
          <p className="text-xs text-amber-800">
            📱 <strong>Mobile Tip:</strong> To save QR codes on mobile, long-press individual QR codes or use the Print/Share button above.
          </p>
      </div>
      )}
    </div>
  );
} 