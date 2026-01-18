'use client';

/**
 * SessionItemCard Component
 *
 * Displays individual session item in the summary view with thumbnail,
 * item info, and action buttons (edit/remove). New items are highlighted
 * with accent border styling.
 *
 * @example
 * ```tsx
 * <SessionItemCard
 *   item={sessionItem}
 *   isNew={true}
 *   onEdit={(id) => handleEdit(id)}
 *   onRemove={(id) => handleRemove(id)}
 * />
 * ```
 *
 * @module ItemCreationWorkflow/components/shared/SessionItemCard
 * @see SessionSummaryStep for usage context
 * @lastModified 2026-01-05 (REQ-118 Documentation Updates)
 */

import { useEffect, useRef } from 'react';
import { Video, Image, FileText, Type, Link, Edit2, Trash2, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SessionItem, ContentPiece, ContentType, ContentData } from '../../ItemCreationWorkflow.types';
import { ROOM_LABELS } from '../../utils/constants';
import type { RoomTypeConst } from '../../utils/constants';
import { TruncatedText } from './TruncatedText';

// =============================================================================
// Types
// =============================================================================

export interface SessionItemCardProps {
  /** Session item data */
  item: SessionItem;
  /** Whether this item was created in the current session (shows accent styling) */
  isNew?: boolean;
  /** Callback when edit button is clicked */
  onEdit?: (itemId: string) => void;
  /** Callback when remove button is clicked */
  onRemove?: (itemId: string) => void;
  /** Whether actions are disabled */
  disabled?: boolean;
  /** Optional CSS class */
  className?: string;
}

// =============================================================================
// Constants
// =============================================================================

const TYPE_CONFIG = {
  video: { icon: Video, color: 'bg-purple-100 text-purple-600' },
  photo: { icon: Image, color: 'bg-blue-100 text-blue-600' },
  pdf: { icon: FileText, color: 'bg-amber-100 text-amber-600' },
  text: { icon: Type, color: 'bg-green-100 text-green-600' },
  url: { icon: Link, color: 'bg-indigo-100 text-indigo-600' },
} as const;

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Gets the thumbnail element for the first content piece of an item.
 * Returns the appropriate visual representation based on content type.
 */
function getItemThumbnail(
  content: ContentPiece[],
  urlsRef: React.MutableRefObject<string[]>
): { type: ContentType; element: React.ReactNode } | null {
  if (content.length === 0) return null;

  const firstContent = content[0];
  const config = TYPE_CONFIG[firstContent.type];
  const TypeIcon = config.icon;

  switch (firstContent.type) {
    case 'video': {
      const videoData = firstContent.data as Extract<ContentData, { type: 'video' }>;
      if (videoData.file) {
        const url = URL.createObjectURL(videoData.file);
        urlsRef.current.push(url);
        return {
          type: 'video',
          element: (
            <div className="relative w-full h-full">
              <video
                src={url}
                className="w-full h-full object-cover"
                preload="metadata"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <Video className="w-5 h-5 text-white" aria-hidden="true" />
              </div>
            </div>
          ),
        };
      }
      return {
        type: 'video',
        element: (
          <div className={cn('w-full h-full flex items-center justify-center', config.color)}>
            <TypeIcon className="w-6 h-6" aria-hidden="true" />
          </div>
        ),
      };
    }

    case 'photo': {
      const photoData = firstContent.data as Extract<ContentData, { type: 'photo' }>;
      if (photoData.file) {
        const url = URL.createObjectURL(photoData.file);
        urlsRef.current.push(url);
        return {
          type: 'photo',
          element: (
            <img
              src={url}
              alt="Item photo"
              className="w-full h-full object-cover"
            />
          ),
        };
      }
      return {
        type: 'photo',
        element: (
          <div className={cn('w-full h-full flex items-center justify-center', config.color)}>
            <TypeIcon className="w-6 h-6" aria-hidden="true" />
          </div>
        ),
      };
    }

    case 'pdf': {
      const pdfData = firstContent.data as Extract<ContentData, { type: 'pdf' }>;
      return {
        type: 'pdf',
        element: (
          <div className={cn('w-full h-full flex flex-col items-center justify-center', config.color)}>
            <TypeIcon className="w-6 h-6" aria-hidden="true" />
            {pdfData.pageCount && (
              <span className="text-[10px] mt-0.5">{pdfData.pageCount}p</span>
            )}
          </div>
        ),
      };
    }

    case 'text': {
      return {
        type: 'text',
        element: (
          <div className={cn('w-full h-full flex items-center justify-center', config.color)}>
            <TypeIcon className="w-6 h-6" aria-hidden="true" />
          </div>
        ),
      };
    }

    case 'url': {
      const urlData = firstContent.data as Extract<ContentData, { type: 'url' }>;
      if (urlData.faviconUrl) {
        return {
          type: 'url',
          element: (
            <div className={cn('w-full h-full flex items-center justify-center', config.color)}>
              <img
                src={urlData.faviconUrl}
                alt=""
                className="w-6 h-6"
              />
            </div>
          ),
        };
      }
      return {
        type: 'url',
        element: (
          <div className={cn('w-full h-full flex items-center justify-center', config.color)}>
            <TypeIcon className="w-6 h-6" aria-hidden="true" />
          </div>
        ),
      };
    }

    default:
      return null;
  }
}

/**
 * Returns the content count label text.
 */
function getContentCountLabel(count: number): string {
  if (count === 0) return 'No content';
  if (count === 1) return '1 content piece';
  return `${count} content pieces`;
}

// =============================================================================
// Main Component
// =============================================================================

export function SessionItemCard({
  item,
  isNew = false,
  onEdit,
  onRemove,
  disabled = false,
  className,
}: SessionItemCardProps) {
  // Ref for tracking object URLs for cleanup
  const urlsRef = useRef<string[]>([]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      urlsRef.current.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  // Get thumbnail for the item
  const thumbnail = getItemThumbnail(item.content, urlsRef);
  const roomLabel = ROOM_LABELS[item.room as RoomTypeConst] || item.room;

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg',
        'border border-gray-200 bg-white',
        'transition-all duration-150',
        // New item styling
        isNew && 'border-l-2 border-l-[#FF385C] bg-white',
        !isNew && 'bg-gray-50',
        // Hover and focus states
        !disabled && 'hover:shadow-sm hover:border-gray-300',
        disabled && 'opacity-60 pointer-events-none',
        className
      )}
      role="listitem"
      aria-label={`${item.name} - ${getContentCountLabel(item.content.length)}`}
    >
      {/* Thumbnail Container */}
      <div
        className={cn(
          'w-12 h-12 rounded-md overflow-hidden flex-shrink-0',
          'bg-gray-100'
        )}
        aria-hidden="true"
      >
        {thumbnail ? (
          thumbnail.element
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <Package className="w-6 h-6 text-gray-400" aria-hidden="true" />
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="flex-1 min-w-0">
        <TruncatedText
          text={item.name}
          maxLength={40}
          as="h3"
          className="text-base font-medium text-[#222222]"
        />
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-sm text-[#717171]">
            {getContentCountLabel(item.content.length)}
          </span>
          <span
            className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700"
            aria-label={`Room: ${roomLabel}`}
          >
            {roomLabel}
          </span>
        </div>
      </div>

      {/* Actions Section */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {/* Edit Button */}
        {onEdit && (
          <button
            type="button"
            onClick={() => onEdit(item.id)}
            disabled={disabled}
            className={cn(
              'p-2.5 rounded-lg',
              'text-gray-500 hover:text-gray-700 hover:bg-gray-100',
              'transition-colors duration-150',
              'focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:ring-offset-1',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'min-w-[44px] min-h-[44px] flex items-center justify-center'
            )}
            aria-label={`Edit ${item.name}`}
          >
            <Edit2 className="w-5 h-5" />
          </button>
        )}

        {/* Remove Button */}
        {onRemove && (
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            disabled={disabled}
            className={cn(
              'p-2.5 rounded-lg',
              'text-gray-500 hover:text-red-600 hover:bg-red-50',
              'transition-colors duration-150',
              'focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'min-w-[44px] min-h-[44px] flex items-center justify-center'
            )}
            aria-label={`Remove ${item.name}`}
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}

export default SessionItemCard;
