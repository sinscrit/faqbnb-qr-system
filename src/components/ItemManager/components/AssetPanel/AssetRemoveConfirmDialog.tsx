'use client';

/**
 * AssetRemoveConfirmDialog Component
 *
 * Displays a confirmation dialog when removing an asset from the asset panel.
 * Shows the asset's thumbnail preview, type indicator, and metadata to help
 * users confirm they are removing the correct item.
 *
 * Features:
 * - Visual preview of the asset being removed
 * - Type-specific overlays (play icon for video, document icon for PDF)
 * - Metadata display (duration for videos, page count for PDFs)
 * - Keyboard accessibility (Escape to dismiss)
 * - Click-outside to dismiss
 * - Destructive action styling for Remove button
 * - Loading state during removal
 *
 * @module ItemManager/components/AssetPanel/AssetRemoveConfirmDialog
 * @see docs/REQ-085-add-asset-remove-confirmation-detailed.md
 * @lastModified 2026-01-03 (REQ-085)
 *
 * @example
 * ```tsx
 * <AssetRemoveConfirmDialog
 *   isOpen={assetToRemove !== null}
 *   asset={assetToRemove}
 *   onConfirm={handleConfirmRemove}
 *   onCancel={handleCancelRemove}
 *   isRemoving={isRemoving}
 * />
 * ```
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Play,
  FileText,
  Trash2,
  Loader2,
  Video,
  Image as ImageIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import type { MediaItem } from '@/components/ItemCapture';
import type { PendingAsset } from '../../ItemManager.types';

// =============================================================================
// Types
// =============================================================================

/**
 * Props for the AssetRemoveConfirmDialog component.
 */
export interface AssetRemoveConfirmDialogProps {
  /** Controls dialog visibility */
  isOpen: boolean;
  /** The asset being confirmed for removal (MediaItem or PendingAsset) */
  asset: MediaItem | PendingAsset | null;
  /** Called when user confirms removal */
  onConfirm: () => void;
  /** Called when user cancels or dismisses the dialog */
  onCancel: () => void;
  /** Optional loading state during removal */
  isRemoving?: boolean;
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Formats a duration in seconds to a human-readable string.
 *
 * @param seconds - Duration in seconds
 * @returns Formatted string (M:SS or H:MM:SS for videos >= 1 hour)
 */
function formatDuration(seconds: number): string {
  if (!seconds || seconds < 0) return '0:00';

  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Gets the display name for an asset.
 *
 * @param asset - The asset to get the name for
 * @returns The display name (filename or type-based fallback)
 */
function getAssetDisplayName(asset: MediaItem | PendingAsset): string {
  // Try to get filename from metadata
  if ('metadata' in asset && asset.metadata?.originalFilename) {
    return asset.metadata.originalFilename;
  }
  // For pending assets, try to get name from file
  if ('file' in asset && asset.file instanceof File) {
    return asset.file.name;
  }
  // Fallback to type-based name
  return asset.type === 'pdf' ? 'PDF Document' : `${asset.type.charAt(0).toUpperCase() + asset.type.slice(1)}`;
}

/**
 * Gets the translation key for the type-specific title
 */
function getTitleKey(type: 'video' | 'image' | 'pdf' | 'url'): string {
  switch (type) {
    case 'video':
      return 'titleVideo';
    case 'image':
      return 'titlePhoto';
    case 'pdf':
      return 'titlePdf';
    default:
      return 'titleGeneric';
  }
}

/**
 * Gets the translation key for the type label
 */
function getTypeLabelKey(type: 'video' | 'image' | 'pdf' | 'url'): string {
  switch (type) {
    case 'video':
      return 'typeVideo';
    case 'image':
      return 'typePhoto';
    case 'pdf':
      return 'typePdf';
    default:
      return 'typeGeneric';
  }
}

// =============================================================================
// Component
// =============================================================================

/**
 * AssetRemoveConfirmDialog - Confirmation dialog for asset removal.
 *
 * Displays a modal dialog with a preview of the asset being removed,
 * along with Cancel and Remove buttons.
 */
export function AssetRemoveConfirmDialog({
  isOpen,
  asset,
  onConfirm,
  onCancel,
  isRemoving = false,
}: AssetRemoveConfirmDialogProps) {
  // ===========================================================================
  // Translations
  // ===========================================================================
  const tAsset = useTranslations('media.dialogs.assetRemove');
  const tCommon = useTranslations('common.actions');

  // ===========================================================================
  // State
  // ===========================================================================

  const [imageError, setImageError] = useState(false);

  // ===========================================================================
  // Thumbnail URL Management
  // ===========================================================================

  // Create object URL from thumbnail or file blob
  const thumbnailUrl = useMemo(() => {
    if (!asset) return null;

    // Try thumbnail first
    if (asset.thumbnail) {
      return URL.createObjectURL(asset.thumbnail);
    }

    // For pending assets, try previewUrl or create from file
    if ('previewUrl' in asset && asset.previewUrl) {
      return asset.previewUrl;
    }

    if ('file' in asset && asset.file) {
      // Only create URL for image/video, not PDF
      if (asset.type !== 'pdf') {
        return URL.createObjectURL(asset.file);
      }
    }

    return null;
  }, [asset]);

  // Cleanup object URL on unmount or when URL changes
  useEffect(() => {
    return () => {
      // Only revoke URLs we created (not previewUrl strings from PendingAsset)
      if (thumbnailUrl && asset) {
        const isOurUrl = asset.thumbnail ||
          ('file' in asset && asset.file && !('previewUrl' in asset && asset.previewUrl === thumbnailUrl));
        if (isOurUrl) {
          URL.revokeObjectURL(thumbnailUrl);
        }
      }
    };
  }, [thumbnailUrl, asset]);

  // Reset image error when asset changes
  useEffect(() => {
    setImageError(false);
  }, [asset?.id]);

  // ===========================================================================
  // Keyboard Handler
  // ===========================================================================

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isRemoving) {
        onCancel();
      }
    },
    [onCancel, isRemoving]
  );

  // Attach/detach keyboard listener
  useEffect(() => {
    if (!isOpen) return;

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKeyDown]);

  // ===========================================================================
  // Early Return
  // ===========================================================================

  // Don't render if not open or no asset
  if (!isOpen || !asset) return null;

  // ===========================================================================
  // Derived Values
  // ===========================================================================

  const assetName = getAssetDisplayName(asset);
  const typeLabel = tAsset(getTypeLabelKey(asset.type));
  const duration = 'metadata' in asset ? asset.metadata?.duration : undefined;
  const pageCount = 'metadata' in asset ? asset.metadata?.pageCount : undefined;

  // ===========================================================================
  // Render
  // ===========================================================================

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
        onClick={isRemoving ? undefined : onCancel}
        aria-hidden="true"
      >
        {/* Dialog card */}
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="asset-remove-dialog-title"
          className="bg-white rounded-lg p-6 max-w-md mx-4 w-full shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Title */}
          <h3
            id="asset-remove-dialog-title"
            className="text-lg font-medium text-gray-900 mb-4 text-center"
          >
            {tAsset(getTitleKey(asset.type))}
          </h3>

          {/* Thumbnail Preview Section */}
          <div className="flex flex-col items-center mb-6">
            {/* Thumbnail Container */}
            <div
              className={cn(
                'relative w-32 h-32 rounded-lg overflow-hidden bg-gray-100',
                'flex items-center justify-center'
              )}
            >
              {/* Image/Video Thumbnail */}
              {asset.type !== 'pdf' && thumbnailUrl && !imageError && (
                <img
                  src={thumbnailUrl}
                  alt={assetName}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              )}

              {/* Video Play Overlay */}
              {asset.type === 'video' && thumbnailUrl && !imageError && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black/50 text-white rounded-full p-2">
                    <Play className="w-6 h-6 fill-current" />
                  </div>
                </div>
              )}

              {/* PDF Icon Display */}
              {asset.type === 'pdf' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-blue-50">
                  <FileText className="w-10 h-10 text-blue-500" />
                </div>
              )}

              {/* Error Fallback for Images/Videos */}
              {imageError && asset.type !== 'pdf' && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  {asset.type === 'video' ? (
                    <Video className="w-8 h-8 text-gray-400" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  )}
                </div>
              )}

              {/* No thumbnail fallback */}
              {!thumbnailUrl && !imageError && asset.type === 'image' && (
                <ImageIcon className="w-8 h-8 text-gray-400" />
              )}
            </div>

            {/* Type Badge */}
            <div className="flex items-center gap-1.5 mt-3 text-sm text-gray-600">
              {asset.type === 'video' && <Video className="w-4 h-4" />}
              {asset.type === 'image' && <ImageIcon className="w-4 h-4" />}
              {asset.type === 'pdf' && <FileText className="w-4 h-4" />}
              <span>{typeLabel}</span>
            </div>

            {/* Metadata Display */}
            {asset.type === 'video' && duration !== undefined && (
              <p className="text-sm text-gray-600 mt-1">
                {tAsset('duration', { duration: formatDuration(duration) })}
              </p>
            )}

            {asset.type === 'pdf' && pageCount !== undefined && (
              <p className="text-sm text-gray-600 mt-1">
                {tAsset('pages', { count: pageCount })}
              </p>
            )}

            {/* Optional filename (truncated) */}
            <p
              className="text-xs text-gray-500 mt-2 max-w-[200px] truncate"
              title={assetName}
            >
              {assetName}
            </p>
          </div>

          {/* Warning Message */}
          <p className="text-gray-600 text-center mb-6">
            {tAsset('warning')}
          </p>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            {/* Cancel Button */}
            <button
              onClick={onCancel}
              disabled={isRemoving}
              className={cn(
                'flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md',
                'hover:bg-gray-200 disabled:opacity-50 transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-gray-500'
              )}
              aria-label={tAsset('cancelRemoval')}
            >
              {tCommon('cancel')}
            </button>

            {/* Remove Button */}
            <button
              onClick={onConfirm}
              disabled={isRemoving}
              className={cn(
                'flex-1 px-4 py-2 text-white bg-red-600 rounded-md',
                'hover:bg-red-700 disabled:opacity-50 transition-colors',
                'flex items-center justify-center gap-2',
                'focus:outline-none focus:ring-2 focus:ring-red-500'
              )}
              aria-label={tAsset('removeAsset')}
            >
              {isRemoving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  {tCommon('remove')}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default AssetRemoveConfirmDialog;
