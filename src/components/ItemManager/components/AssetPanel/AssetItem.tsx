'use client';

/**
 * AssetItem Component
 *
 * Displays an individual media asset within the AssetPanel drawer.
 * Shows thumbnail preview, type indicator, metadata, and remove button.
 *
 * @module ItemManager/components/AssetPanel/AssetItem
 * @lastModified 2026-01-03 (REQ-084 Task 3 - Added drag handle support with DragHandleProps)
 */

import { useState, useEffect, useMemo } from 'react';
import {
  Play,
  FileText,
  X,
  Image as ImageIcon,
  Video,
  GripVertical,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MediaItem } from '@/components/ItemCapture';
import type { AssetItemProps, PendingAsset, DragHandleProps } from '../../ItemManager.types';
import { formatDuration, getAssetDisplayName } from '../../utils/formatUtils';

// =============================================================================
// Extended Props (combines AssetItemProps with DragHandleProps)
// =============================================================================

type ExtendedAssetItemProps = AssetItemProps & Partial<DragHandleProps>;

// =============================================================================
// Constants
// =============================================================================

const sizeClasses = {
  small: 'w-12 h-12',
  medium: 'w-16 h-16',
  large: 'w-20 h-20',
} as const;

// =============================================================================
// Type Guard
// =============================================================================

/**
 * Type guard to check if an asset is a PendingAsset.
 */
function isPendingAsset(asset: MediaItem | PendingAsset): asset is PendingAsset {
  return 'file' in asset && asset.file instanceof File;
}

// =============================================================================
// Component
// =============================================================================

/**
 * AssetItem - Displays a single asset in the AssetPanel.
 *
 * Features:
 * - Thumbnail preview with type-specific overlays
 * - Duration badge for videos
 * - Page count badge for PDFs
 * - Visual state indication (pending addition, pending removal)
 * - Remove/restore functionality
 * - Optional drag handle for reordering
 *
 * @example
 * ```tsx
 * <AssetItem
 *   asset={mediaItem}
 *   index={0}
 *   isPending={false}
 *   isMarkedForRemoval={false}
 *   onRemove={(id) => console.log('Remove:', id)}
 * />
 * ```
 */
export function AssetItem({
  asset,
  index,
  isPending = false,
  isMarkedForRemoval = false,
  onRemove,
  onRestore,
  onClick,
  className,
  size = 'medium',
  showDragHandle = false,
  dragHandleProps,
  isDragging = false,
}: ExtendedAssetItemProps) {
  // ===========================================================================
  // State
  // ===========================================================================

  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  // ===========================================================================
  // Computed Values
  // ===========================================================================

  const assetName = useMemo(() => getAssetDisplayName(asset), [asset]);

  // ===========================================================================
  // Effects
  // ===========================================================================

  // Create object URL for thumbnail and handle cleanup
  useEffect(() => {
    // Determine the blob source: thumbnail first, previewUrl for pending, then file
    let url: string | null = null;

    if (asset.thumbnail) {
      url = URL.createObjectURL(asset.thumbnail);
    } else if ('previewUrl' in asset && asset.previewUrl) {
      // PendingAsset has previewUrl already as a string
      url = asset.previewUrl;
    } else if (isPendingAsset(asset)) {
      // Create URL from file for pending assets
      url = URL.createObjectURL(asset.file);
    }

    setThumbnailUrl(url);

    // Cleanup: revoke object URL on unmount or when asset changes
    return () => {
      // Only revoke if we created the URL (not for previewUrl strings we didn't create)
      if (url && asset.thumbnail) {
        URL.revokeObjectURL(url);
      } else if (url && isPendingAsset(asset) && !('previewUrl' in asset && asset.previewUrl)) {
        URL.revokeObjectURL(url);
      }
    };
  }, [asset]);

  // Reset image error state when asset changes
  useEffect(() => {
    setImageError(false);
  }, [asset.id]);

  // ===========================================================================
  // Render
  // ===========================================================================

  return (
    <div
      onClick={() => onClick?.(asset.id)}
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg border',
        'transition-all duration-200',
        onClick && !isDragging && 'cursor-pointer hover:bg-gray-50',
        // Normal state
        !isPending && !isMarkedForRemoval && 'border-gray-200 bg-white',
        // Pending addition - green highlight
        isPending && !isMarkedForRemoval && 'border-green-300 bg-green-50',
        // Pending removal - red/dimmed
        isMarkedForRemoval && 'border-red-300 bg-red-50 opacity-60',
        // Dragging state - elevated with ring
        isDragging && 'shadow-lg ring-2 ring-blue-500 opacity-95 scale-[1.02] bg-white z-10',
        className
      )}
      role="listitem"
      aria-label={`${assetName}, ${asset.type}${isMarkedForRemoval ? ', marked for removal' : ''}${isDragging ? ', dragging' : ''}`}
    >
      {/* Drag Handle (optional) - hidden when marked for removal */}
      {showDragHandle && !isMarkedForRemoval && (
        <div
          {...dragHandleProps}
          className={cn(
            'shrink-0 p-2 cursor-grab active:cursor-grabbing',
            'text-gray-400 hover:text-gray-600',
            'touch-none select-none',
            'transition-colors duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:rounded',
            isDragging && 'cursor-grabbing'
          )}
          aria-label="Drag to reorder"
          role="button"
          tabIndex={0}
        >
          <GripVertical className="w-5 h-5" />
        </div>
      )}

      {/* Thumbnail Section */}
      <div
        className={cn(
          'relative rounded-md overflow-hidden bg-gray-100 shrink-0',
          sizeClasses[size]
        )}
      >
        {/* Thumbnail Image - for non-PDF types */}
        {thumbnailUrl && !imageError && asset.type !== 'pdf' && (
          <img
            src={thumbnailUrl}
            alt=""
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        )}

        {/* Video Play Overlay */}
        {asset.type === 'video' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black/50 text-white rounded-full p-1.5">
              <Play className="w-4 h-4 fill-current" />
            </div>
          </div>
        )}

        {/* PDF Icon Display */}
        {asset.type === 'pdf' && (
          <div className="absolute inset-0 flex items-center justify-center bg-blue-50">
            <FileText className="w-6 h-6 text-blue-500" />
          </div>
        )}

        {/* Error Fallback */}
        {imageError && asset.type !== 'pdf' && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            {asset.type === 'video' ? (
              <Video className="w-6 h-6 text-gray-400" />
            ) : (
              <ImageIcon className="w-6 h-6 text-gray-400" />
            )}
          </div>
        )}

        {/* No thumbnail fallback for images */}
        {!thumbnailUrl && !imageError && asset.type === 'image' && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <ImageIcon className="w-6 h-6 text-gray-400" />
          </div>
        )}

        {/* Duration Badge - Video */}
        {asset.type === 'video' && asset.metadata?.duration !== undefined && (
          <span className="absolute bottom-1 right-1 px-1.5 py-0.5 text-xs font-medium text-white bg-black/70 rounded">
            {formatDuration(asset.metadata.duration)}
          </span>
        )}

        {/* Page Count Badge - PDF */}
        {asset.type === 'pdf' && asset.metadata?.pageCount !== undefined && (
          <span className="absolute bottom-1 right-1 px-1.5 py-0.5 text-xs font-medium text-white bg-black/70 rounded">
            {asset.metadata.pageCount} {asset.metadata.pageCount === 1 ? 'page' : 'pages'}
          </span>
        )}
      </div>

      {/* Info Section */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            'text-sm font-medium text-gray-900 truncate',
            isMarkedForRemoval && 'line-through text-gray-500'
          )}
          title={assetName} // Show full name on hover
        >
          {assetName}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-gray-500 capitalize">
            {asset.type === 'pdf' ? 'PDF' : asset.type}
          </span>
          {isPending && !isMarkedForRemoval && (
            <span className="text-xs font-medium text-green-600 bg-green-100 px-1.5 py-0.5 rounded">
              New
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="shrink-0">
        {isMarkedForRemoval ? (
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent triggering onClick
              onRestore?.(asset.id);
            }}
            className={cn(
              'text-sm text-blue-600 hover:text-blue-700 font-medium',
              'px-2 py-1 rounded hover:bg-blue-50 transition-colors'
            )}
            aria-label="Restore this asset"
          >
            Restore
          </button>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent triggering onClick
              onRemove(asset.id);
            }}
            className={cn(
              'p-2 text-gray-400 hover:text-red-600 hover:bg-red-50',
              'rounded-lg transition-colors',
              // Touch-friendly minimum size
              'min-w-[44px] min-h-[44px] flex items-center justify-center'
            )}
            aria-label={`Remove ${assetName}`}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

export default AssetItem;
