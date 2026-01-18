'use client';

/**
 * MediaThumbnail Component
 *
 * Provides consistent visual representation for video, image, and PDF media types
 * within the ItemCapture review flow. Features include:
 * - Size variants (small, medium, large)
 * - Type-specific overlays (play icon for video, document icon for PDF)
 * - Loading and error states
 * - Delete button with hover/touch support
 * - Object URL memory management
 *
 * @module ItemCapture/components/shared/MediaThumbnail
 * @lastModified 2025-12-31 (REQ-051)
 */

import { useState, useEffect, useMemo } from 'react';
import { Play, FileText, X, ImageIcon, Video } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MediaItem } from '../../ItemCapture.types';

/**
 * Props for the MediaThumbnail component.
 */
export interface MediaThumbnailProps {
  /** The media item to display */
  media: MediaItem;
  /** Callback when delete button is clicked */
  onDelete: (id: string) => void;
  /** Optional callback when thumbnail is clicked */
  onClick?: (id: string) => void;
  /** Whether content is being processed (shows spinner) */
  isLoading?: boolean;
  /** Size variant for the thumbnail */
  size?: 'small' | 'medium' | 'large';
  /** Additional CSS classes */
  className?: string;
}

/**
 * Size classes mapping for thumbnail dimensions.
 * - small: 80x80px
 * - medium: 120x120px
 * - large: 200x200px
 */
const sizeClasses = {
  small: 'w-20 h-20',
  medium: 'w-[120px] h-[120px]',
  large: 'w-[200px] h-[200px]',
} as const;

/**
 * MediaThumbnail Component
 *
 * Renders a thumbnail preview for media items with type-specific overlays,
 * loading states, and delete functionality.
 */
export function MediaThumbnail({
  media,
  onDelete,
  onClick,
  isLoading = false,
  size = 'medium',
  className,
}: MediaThumbnailProps) {
  // Image loading/error state
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Create object URL from thumbnail or file blob with proper cleanup
  const objectUrl = useMemo(() => {
    const blob = media.thumbnail || media.file;
    if (!blob) return null;
    return URL.createObjectURL(blob);
  }, [media.thumbnail, media.file]);

  // Cleanup object URL on unmount or when URL changes
  useEffect(() => {
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [objectUrl]);

  // Reset image state when media changes
  useEffect(() => {
    setImageError(false);
    setImageLoading(true);
  }, [media.id]);

  return (
    <div
      onClick={() => onClick?.(media.id)}
      className={cn(
        'group relative rounded-lg overflow-hidden bg-gray-100 cursor-pointer',
        sizeClasses[size],
        className
      )}
    >
      {/* Image/Video Thumbnail Display */}
      {media.type !== 'pdf' && !imageError && objectUrl && (
        <img
          src={objectUrl}
          alt={media.metadata.originalFilename || 'Media thumbnail'}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-200',
            imageLoading ? 'opacity-0' : 'opacity-100'
          )}
          onLoad={() => setImageLoading(false)}
          onError={() => {
            setImageError(true);
            setImageLoading(false);
          }}
        />
      )}

      {/* Loading State Display */}
      {(isLoading || (imageLoading && media.type !== 'pdf' && objectUrl)) && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        </div>
      )}

      {/* Video Play Icon Overlay */}
      {media.type === 'video' && !isLoading && !imageLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-black/50 text-white rounded-full p-2">
            <Play className="w-6 h-6 fill-current" />
          </div>
        </div>
      )}

      {/* PDF Icon with Page Count Display */}
      {media.type === 'pdf' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-blue-50">
          <FileText className="w-10 h-10 text-blue-500" />
          {media.metadata.pageCount !== undefined && (
            <span className="text-xs text-blue-700 mt-1">
              {media.metadata.pageCount} {media.metadata.pageCount === 1 ? 'page' : 'pages'}
            </span>
          )}
        </div>
      )}

      {/* Error State with Fallback Icon */}
      {imageError && media.type !== 'pdf' && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
          {media.type === 'video' ? (
            <Video className="w-8 h-8 text-gray-400" />
          ) : (
            <ImageIcon className="w-8 h-8 text-gray-400" />
          )}
        </div>
      )}

      {/* Delete Button Overlay */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(media.id);
        }}
        className={cn(
          'absolute top-1 right-1 p-1.5 rounded-full bg-black/60 text-white',
          'opacity-0 group-hover:opacity-100 transition-opacity',
          // Touch device support: always visible with reduced opacity on small screens
          'touch-manipulation',
          'sm:opacity-0 sm:group-hover:opacity-100',
          'max-sm:opacity-70',
          'hover:bg-red-600 focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white',
          'min-w-[32px] min-h-[32px] flex items-center justify-center'
        )}
        aria-label="Delete media"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export default MediaThumbnail;
