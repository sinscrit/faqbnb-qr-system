/**
 * BottomSheet Component
 *
 * Mobile-optimized bottom sheet component that slides up from the bottom.
 * Supports swipe-to-dismiss gesture, backdrop tap-to-close, and proper focus management.
 *
 * @module ItemManager/components/shared/BottomSheet
 * @lastModified 2026-01-22 (REQ-E02-079 Task 4) - Added i18n for close aria-label
 */

'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

// =============================================================================
// Types
// =============================================================================

export interface BottomSheetProps {
  /** Whether the sheet is open */
  isOpen: boolean;
  /** Callback when sheet should close */
  onClose: () => void;
  /** Sheet content */
  children: React.ReactNode;
  /** Optional title displayed in sheet header */
  title?: string;
  /** Additional CSS classes for the sheet container */
  className?: string;
  /** Show drag handle indicator (default: true) */
  showDragHandle?: boolean;
  /** Enable swipe to dismiss (default: true) */
  swipeToDismiss?: boolean;
  /** Swipe distance threshold to trigger dismiss in pixels (default: 100) */
  swipeThreshold?: number;
  /** Maximum height as percentage of viewport (default: 90) */
  maxHeightPercent?: number;
}

// =============================================================================
// Component Implementation
// =============================================================================

export function BottomSheet({
  isOpen,
  onClose,
  children,
  title,
  className,
  showDragHandle = true,
  swipeToDismiss = true,
  swipeThreshold = 100,
  maxHeightPercent = 90,
}: BottomSheetProps) {
  const t = useTranslations('common');
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef<number | null>(null);
  const currentOffsetY = useRef<number>(0);
  const isDragging = useRef<boolean>(false);

  // Lock body scroll when sheet is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Focus management - focus the sheet when opened
  useEffect(() => {
    if (isOpen && sheetRef.current) {
      sheetRef.current.focus();
    }
  }, [isOpen]);

  // Touch event handlers for swipe-to-dismiss
  const handleTouchStart = useCallback(
    (event: React.TouchEvent) => {
      if (!swipeToDismiss) return;
      dragStartY.current = event.touches[0].clientY;
      isDragging.current = true;

      // Disable transition during drag
      if (sheetRef.current) {
        sheetRef.current.style.transition = 'none';
      }
    },
    [swipeToDismiss]
  );

  const handleTouchMove = useCallback(
    (event: React.TouchEvent) => {
      if (!swipeToDismiss || dragStartY.current === null || !isDragging.current)
        return;

      const currentY = event.touches[0].clientY;
      const offset = currentY - dragStartY.current;

      // Only allow downward drag (positive offset)
      if (offset > 0) {
        currentOffsetY.current = offset;
        if (sheetRef.current) {
          sheetRef.current.style.transform = `translateY(${offset}px)`;
        }
      }
    },
    [swipeToDismiss]
  );

  const handleTouchEnd = useCallback(() => {
    if (!swipeToDismiss || !isDragging.current) return;

    isDragging.current = false;

    // Re-enable transition
    if (sheetRef.current) {
      sheetRef.current.style.transition = 'transform 0.3s ease-out';
    }

    // Check if drag exceeded threshold
    if (currentOffsetY.current > swipeThreshold) {
      onClose();
    } else {
      // Snap back to open position
      if (sheetRef.current) {
        sheetRef.current.style.transform = 'translateY(0)';
      }
    }

    // Reset values
    dragStartY.current = null;
    currentOffsetY.current = 0;
  }, [swipeToDismiss, swipeThreshold, onClose]);

  // Handle backdrop click
  const handleBackdropClick = useCallback(
    (event: React.MouseEvent) => {
      if (event.target === event.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      role="presentation"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 transition-opacity duration-300"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'bottom-sheet-title' : undefined}
        tabIndex={-1}
        className={cn(
          'relative w-full bg-white rounded-t-2xl shadow-2xl',
          'transition-transform duration-300 ease-out',
          'animate-in slide-in-from-bottom',
          'focus:outline-none',
          className
        )}
        style={{ maxHeight: `${maxHeightPercent}vh` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag Handle */}
        {showDragHandle && (
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 bg-gray-300 rounded-full" />
          </div>
        )}

        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h2
              id="bottom-sheet-title"
              className="text-lg font-semibold text-gray-900"
            >
              {title}
            </h2>
            <button
              onClick={onClose}
              className={cn(
                'flex items-center justify-center',
                'min-h-[44px] min-w-[44px]',
                'rounded-full',
                'text-gray-500 hover:text-gray-700 hover:bg-gray-100',
                'transition-colors',
                'touch-manipulation'
              )}
              aria-label={t('dialog.close')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Content */}
        <div
          className="overflow-y-auto overscroll-contain"
          style={{ maxHeight: `calc(${maxHeightPercent}vh - 80px)` }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export default BottomSheet;
