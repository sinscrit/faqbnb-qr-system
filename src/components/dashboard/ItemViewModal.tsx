'use client';

/**
 * ItemViewModal Component
 *
 * Modal for viewing item details in the dashboard.
 * Displays item metadata, links, and action buttons.
 * Explicitly excludes QR code display per REQ-142.
 *
 * REQ-142: Enhanced Item Management
 * @created 2026-01-08
 */

import { useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import {
  X,
  MapPin,
  Edit,
  Trash2,
  Calendar,
  Link as LinkIcon,
  FileText,
  Youtube,
  Image as ImageIcon,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ItemViewModalProps, ItemWithDetails, ItemLink } from '@/types';

// Link type icon mapping
const linkTypeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  youtube: Youtube,
  pdf: FileText,
  image: ImageIcon,
  text: FileText,
};

// Format date for display
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function ItemViewModal({
  isOpen,
  onClose,
  item,
  onEdit,
  onDelete,
}: ItemViewModalProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';

      return () => {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  if (!item) return null;

  const handleEdit = () => {
    onEdit?.(item);
    onClose();
  };

  const handleDelete = () => {
    onDelete?.(item);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        {/* Backdrop */}
        <Dialog.Overlay
          className={cn(
            'fixed inset-0 z-50 bg-black/50',
            'data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out'
          )}
        />

        {/* Modal Content */}
        <Dialog.Content
          className={cn(
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
            'duration-300'
          )}
        >
          {/* Header */}
          <div className="relative flex items-center justify-between p-4 md:p-6 border-b border-gray-200">
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-gray-300 md:hidden" />

            <Dialog.Title className="text-lg font-semibold text-gray-900 pr-8 truncate mt-2 md:mt-0">
              {item.name}
            </Dialog.Title>

            <Dialog.Close asChild>
              <button
                className={cn(
                  'absolute right-3 top-3 md:right-4 md:top-4',
                  'flex items-center justify-center',
                  'w-10 h-10 md:w-12 md:h-12',
                  'rounded-full',
                  'text-gray-500 hover:text-gray-700',
                  'hover:bg-gray-100 focus:bg-gray-100',
                  'focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:ring-offset-2',
                  'transition-colors'
                )}
                aria-label="Close"
              >
                <X className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </Dialog.Close>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            {/* Description */}
            {item.description && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
                <p className="text-gray-700">{item.description}</p>
              </div>
            )}

            {/* Property */}
            {item.property && (
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <MapPin className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                <span>{item.property.nickname}</span>
              </div>
            )}

            {/* Timestamps */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-6">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" aria-hidden="true" />
                <span>Created: {formatDate(item.createdAt)}</span>
              </div>
              {item.updatedAt && item.updatedAt !== item.createdAt && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" aria-hidden="true" />
                  <span>Updated: {formatDate(item.updatedAt)}</span>
                </div>
              )}
            </div>

            {/* Links Section */}
            {item.links && item.links.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" />
                  Resources ({item.links.length})
                </h3>
                <div className="space-y-2">
                  {item.links.map((link: ItemLink, index: number) => {
                    const IconComponent = linkTypeIcons[link.link_type] || LinkIcon;
                    return (
                      <a
                        key={link.id || index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          'flex items-center gap-3 p-3 rounded-lg',
                          'bg-gray-50 hover:bg-gray-100',
                          'transition-colors group'
                        )}
                      >
                        <IconComponent className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-700 truncate">{link.title}</div>
                          <div className="text-xs text-gray-500 truncate">{link.url}</div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Empty links state */}
            {(!item.links || item.links.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                <LinkIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No resources attached to this item</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 px-4 md:px-6 py-4 border-t border-gray-200">
            {/* Edit Button */}
            <button
              type="button"
              onClick={handleEdit}
              disabled={!onEdit}
              className={cn(
                'inline-flex items-center justify-center gap-2 px-4 py-2',
                'bg-[#FF385C] text-white rounded-lg',
                'hover:bg-[#E31C5F] transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:ring-offset-2',
                'min-h-[44px]',
                !onEdit && 'opacity-50 cursor-not-allowed'
              )}
            >
              <Edit className="w-4 h-4" aria-hidden="true" />
              <span>Edit Item</span>
            </button>

            {/* Delete Button */}
            <button
              type="button"
              onClick={handleDelete}
              disabled={!onDelete}
              className={cn(
                'inline-flex items-center justify-center gap-2 px-4 py-2',
                'bg-red-600 text-white rounded-lg',
                'hover:bg-red-700 transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
                'min-h-[44px] sm:ml-auto',
                !onDelete && 'opacity-50 cursor-not-allowed'
              )}
            >
              <Trash2 className="w-4 h-4" aria-hidden="true" />
              <span>Delete</span>
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default ItemViewModal;
