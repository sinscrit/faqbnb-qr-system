'use client';

/**
 * ItemPreviewModal Component
 *
 * A responsive modal/drawer for displaying item preview content.
 * - Desktop/tablet (≥768px): Centered modal overlay
 * - Mobile (<768px): Slide-up drawer from bottom
 *
 * Uses Radix UI Dialog for accessibility (focus trap, ARIA, keyboard nav).
 *
 * @module ItemManager/components/ItemPreview
 * @see docs/REQ-074-create-itempreviewmodal-component-detailed.md
 * @lastModified 2026-01-03 (REQ-074 Task 3)
 */

import { useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ItemPreviewModalProps } from '../../ItemManager.types';

// =============================================================================
// Main Component
// =============================================================================

export function ItemPreviewModal({
  isOpen,
  onClose,
  item,
  title,
  children,
  className,
  contentClassName,
}: ItemPreviewModalProps) {
  // Derive display title
  const displayTitle = title ?? item?.title ?? 'Item Preview';

  // ---------------------------------------------------------------------------
  // iOS Safari scroll lock fix
  // Radix Dialog handles scroll lock, but iOS Safari can be problematic.
  // This is an additional fallback for consistent cross-browser behavior.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (isOpen) {
      // Store original scroll position
      const scrollY = window.scrollY;

      // Apply iOS scroll lock fix
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';

      return () => {
        // Restore original styles
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        // Restore scroll position
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        {/* Overlay backdrop */}
        <Dialog.Overlay
          className={cn(
            'fixed inset-0 z-50 bg-black/50',
            'data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out'
          )}
        />

        {/* Content container */}
        <Dialog.Content
          className={cn(
            // Base styles
            'fixed z-50 bg-white shadow-lg outline-none',
            'overflow-hidden flex flex-col',

            // Desktop: centered modal
            'md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2',
            'md:max-w-[640px] md:w-[calc(100%-2rem)] md:max-h-[90vh]',
            'md:rounded-lg',

            // Mobile: slide-up drawer
            'max-md:inset-x-0 max-md:bottom-0',
            'max-md:max-h-[85vh] max-md:rounded-t-xl',

            // Animations
            'data-[state=open]:animate-modal-in data-[state=closed]:animate-modal-out',
            'max-md:data-[state=open]:animate-drawer-in max-md:data-[state=closed]:animate-drawer-out',

            // Animation duration
            'duration-300',

            className
          )}
          onPointerDownOutside={(e) => e.preventDefault()} // Handled by overlay
        >
          {/* Header with title and close button */}
          <div className="relative flex items-center justify-between p-4 md:p-6 border-b border-gray-200">
            {/* Mobile drag handle indicator */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-gray-300 md:hidden" />

            <Dialog.Title className="text-lg font-semibold text-gray-900 pr-8 truncate mt-2 md:mt-0">
              {displayTitle}
            </Dialog.Title>

            <Dialog.Close asChild>
              <button
                className={cn(
                  'absolute right-3 top-3 md:right-4 md:top-4',
                  'flex items-center justify-center',
                  'w-10 h-10 md:w-12 md:h-12', // 40px mobile, 48px desktop touch target
                  'rounded-full',
                  'text-gray-500 hover:text-gray-700',
                  'hover:bg-gray-100 focus:bg-gray-100',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                  'transition-colors'
                )}
                aria-label="Close preview"
              >
                <X className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </Dialog.Close>
          </div>

          {/* Content area */}
          <div
            className={cn(
              'flex-1 overflow-y-auto p-4 md:p-6',
              contentClassName
            )}
          >
            {children}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default ItemPreviewModal;
