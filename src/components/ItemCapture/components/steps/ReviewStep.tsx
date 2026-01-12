'use client';

/**
 * ReviewStep Component
 *
 * Final step of the ItemCapture wizard where users can review all captured
 * content before submission. Displays item details summary (Item Name, Room,
 * Item Type, Content Purpose, Tags), media gallery, and instructions preview
 * with options to edit, reorder, or remove items.
 *
 * @module ItemCapture/components/steps/ReviewStep
 * @lastModified 2026-01-12 (REQ-183 - Added Content Purpose display in metadata section)
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import {
  Edit,
  Trash2,
  ChevronUp,
  ChevronDown,
  Check,
  X,
  Loader2,
  Video,
  Image as ImageIcon,
  FileText,
  Play,
  Plus,
  HardDrive,
  Link as LinkIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MediaItem, ItemMetadata, ApplianceType, UrlItem } from '../../ItemCapture.types';
import type { PurposeType } from '@/types';
import { UrlPreview } from '../shared/UrlPreview';
import { APPLIANCE_TYPES, CONTENT_PURPOSE_OPTIONS } from '../../utils/constants';
import { useItemValidation } from '../../hooks/useItemValidation';
import { ValidationMessage, ValidationMessageList } from '../shared/ValidationMessage';

// =============================================================================
// Lazy-loaded ReactMarkdown
// =============================================================================

const ReactMarkdown = dynamic(() => import('react-markdown'), {
  ssr: false,
  loading: () => <div className="animate-pulse h-20 bg-gray-100 rounded" />,
});

// =============================================================================
// Types
// =============================================================================

/**
 * Props for the ReviewStep component.
 */
export interface ReviewStepProps {
  /** All captured metadata */
  metadata: ItemMetadata;
  /** Array of media items */
  mediaItems: MediaItem[];
  /** Array of URL items */
  urlItems: UrlItem[];
  /** Markdown-formatted instructions */
  instructions: string;
  /** Submit callback */
  onSubmit: () => void;
  /** Cancel callback */
  onCancel: () => void;
  /** Navigation callback to edit a specific section */
  onEditSection: (section: 'metadata' | 'content-type' | 'capture' | 'text' | 'url') => void;
  /** Remove media callback */
  onRemoveMedia: (mediaId: string) => void;
  /** Remove URL callback */
  onRemoveUrl: (urlId: string) => void;
  /** Reorder media callback */
  onReorderMedia: (mediaId: string, direction: 'up' | 'down') => void;
  /** Edit media callback */
  onEditMedia: (mediaId: string) => void;
  /** Loading state (optional) */
  isSubmitting?: boolean;
  /** CSS class (optional) */
  className?: string;
  /** Debug mode (optional) */
  debug?: boolean;
}

/**
 * Props for the MediaItemCard sub-component.
 */
interface MediaItemCardProps {
  item: MediaItem;
  index: number;
  totalItems: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  onEdit: () => void;
  urlsRef: React.MutableRefObject<string[]>;
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get the display label for an appliance type
 */
function getApplianceTypeLabel(type: ApplianceType): string {
  const typeEntry = APPLIANCE_TYPES.find(t => t.value === type);
  return typeEntry?.label ?? type;
}

/**
 * Get user-friendly label for a content purpose value.
 * @param purpose - The PurposeType value
 * @returns The display label or the raw value if not found
 * @see REQ-183
 */
function getContentPurposeLabel(purpose: PurposeType): string {
  const option = CONTENT_PURPOSE_OPTIONS.find(opt => opt.value === purpose);
  return option?.label || purpose;
}

// =============================================================================
// MediaItemCard Sub-Component
// =============================================================================

/**
 * Card component for displaying individual media item thumbnails
 * with action buttons for reorder, remove, and edit.
 */
function MediaItemCard({
  item,
  index,
  totalItems,
  onMoveUp,
  onMoveDown,
  onRemove,
  onEdit,
  urlsRef,
}: MediaItemCardProps) {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

  // Generate object URL for thumbnail
  useEffect(() => {
    if (item.thumbnail) {
      const url = URL.createObjectURL(item.thumbnail);
      urlsRef.current.push(url);
      setThumbnailUrl(url);
      return () => {
        // URL will be revoked when component unmounts via parent cleanup
      };
    }
  }, [item.thumbnail, urlsRef]);

  // Type configuration for badges
  const typeConfig = {
    video: { icon: Video, color: 'bg-purple-100 text-purple-700', label: 'Video' },
    image: { icon: ImageIcon, color: 'bg-blue-100 text-blue-700', label: 'Photo' },
    pdf: { icon: FileText, color: 'bg-amber-100 text-amber-700', label: 'PDF' },
  };

  const config = typeConfig[item.type];
  const TypeIcon = config.icon;

  return (
    <div
      className="relative group"
      role="listitem"
      aria-label={`${config.label} ${index + 1} of ${totalItems}`}
    >
      {/* Thumbnail button */}
      <button
        type="button"
        onClick={onEdit}
        className="w-full aspect-square rounded-lg overflow-hidden bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label={`Edit ${config.label} ${index + 1}`}
      >
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={`${config.label} ${index + 1}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <TypeIcon className="w-8 h-8 text-gray-400" aria-hidden="true" />
          </div>
        )}

        {/* Video play overlay */}
        {item.type === 'video' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
            <Play className="w-8 h-8 text-white" aria-hidden="true" />
          </div>
        )}
      </button>

      {/* Type badge (top-left) */}
      <div
        className={cn(
          'absolute top-1 left-1 flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium',
          config.color
        )}
        aria-hidden="true"
      >
        <TypeIcon className="w-3 h-3" />
        <span>{config.label}</span>
      </div>

      {/* Order badge (top-right) */}
      <div
        className="absolute top-1 right-1 flex items-center justify-center w-5 h-5 rounded-full bg-gray-900 text-white text-xs font-medium"
        aria-hidden="true"
      >
        {index + 1}
      </div>

      {/* Action buttons (bottom) - visible on hover */}
      <div
        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity"
      >
        <div className="flex items-center justify-center gap-1">
          {/* Move up button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMoveUp();
            }}
            disabled={index === 0}
            className="p-1 bg-white rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Move up"
          >
            <ChevronUp className="w-4 h-4 text-gray-700" />
          </button>

          {/* Move down button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMoveDown();
            }}
            disabled={index === totalItems - 1}
            className="p-1 bg-white rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Move down"
          >
            <ChevronDown className="w-4 h-4 text-gray-700" />
          </button>

          {/* Remove button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="p-1 bg-white rounded hover:bg-red-100 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
            aria-label="Remove"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// ReviewStep Component
// =============================================================================

/**
 * ReviewStep is the final step of the ItemCapture wizard.
 *
 * Features:
 * - Metadata summary with edit navigation
 * - Media gallery with reorder/remove/edit actions
 * - Markdown instructions preview
 * - Validation warning for incomplete content
 * - Submit and Cancel with confirmation modals
 * - Full keyboard and screen reader support
 *
 * @example
 * ```tsx
 * <ReviewStep
 *   metadata={state.metadata}
 *   mediaItems={state.mediaItems}
 *   instructions={state.instructions}
 *   onSubmit={handleSubmit}
 *   onCancel={handleCancel}
 *   onEditSection={handleEditSection}
 *   onRemoveMedia={handleRemoveMedia}
 *   onReorderMedia={handleReorderMedia}
 *   onEditMedia={handleEditMedia}
 *   isSubmitting={isSubmitting}
 * />
 * ```
 */
export function ReviewStep({
  metadata,
  mediaItems,
  urlItems,
  instructions,
  onSubmit,
  onCancel,
  onEditSection,
  onRemoveMedia,
  onRemoveUrl,
  onReorderMedia,
  onEditMedia,
  isSubmitting = false,
  className,
  debug = false,
}: ReviewStepProps) {
  // Internal state
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  // Ref for cleanup
  const urlsRef = useRef<string[]>([]);

  // Validation hook
  const {
    isValid,
    errors,
    warnings,
    calculateTotalSize,
    getRemainingSize,
    formatSize,
    maxTotalSize,
    hasContent,
  } = useItemValidation(metadata, mediaItems, urlItems, instructions);

  // Calculate size values
  const totalSize = calculateTotalSize();
  const remainingSize = getRemainingSize();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      urlsRef.current.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  // Debug logging
  useEffect(() => {
    if (debug) {
      console.log('[ReviewStep] State:', {
        metadata,
        mediaItemsCount: mediaItems.length,
        instructionsLength: instructions.length,
        isValid,
        hasContent,
        totalSize: formatSize(totalSize),
        remainingSize: formatSize(remainingSize),
        errors,
        warnings,
      });
    }
  }, [debug, metadata, mediaItems.length, instructions.length, isValid, hasContent, totalSize, remainingSize, errors, warnings, formatSize]);

  // ==========================================================================
  // Handlers
  // ==========================================================================

  /**
   * Handle media item reorder with screen reader announcement
   */
  const handleReorder = useCallback((mediaId: string, direction: 'up' | 'down') => {
    onReorderMedia(mediaId, direction);
    const index = mediaItems.findIndex(item => item.id === mediaId);
    const newPosition = direction === 'up' ? index : index + 2;
    setAnnouncement(`Item moved to position ${newPosition}`);
  }, [onReorderMedia, mediaItems]);

  /**
   * Handle media item removal confirmation
   */
  const handleConfirmRemove = useCallback(() => {
    if (confirmDeleteId) {
      onRemoveMedia(confirmDeleteId);
      setAnnouncement('Item removed');
      setConfirmDeleteId(null);
    }
  }, [confirmDeleteId, onRemoveMedia]);

  /**
   * Handle cancel confirmation
   */
  const handleConfirmCancel = useCallback(() => {
    setShowCancelConfirm(false);
    onCancel();
  }, [onCancel]);

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      {/* Page Title */}
      <h2 className="text-xl font-semibold text-gray-900">Review Your Item</h2>

      {/* =================================================================== */}
      {/* Section 1: Metadata Summary */}
      {/* =================================================================== */}
      <section
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        aria-labelledby="metadata-heading"
      >
        {/* Section header */}
        <div className="flex items-center justify-between mb-4">
          <h3 id="metadata-heading" className="text-lg font-medium text-gray-900">
            Item Details
          </h3>
          <button
            type="button"
            onClick={() => onEditSection('metadata')}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
            aria-label="Edit item details"
          >
            <Edit className="w-4 h-4" aria-hidden="true" />
            <span>Edit</span>
          </button>
        </div>

        {/* Description list */}
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Item Name */}
          <div>
            <dt className="text-sm font-medium text-gray-500">Item Name</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {metadata.title.trim() || <span className="text-gray-400">&mdash;</span>}
            </dd>
          </div>

          {/* Room (conditional) */}
          {metadata.location && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Room</dt>
              <dd className="mt-1 text-sm text-gray-900">{metadata.location}</dd>
            </div>
          )}

          {/* Item Type (conditional) */}
          {metadata.applianceType && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Item Type</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {getApplianceTypeLabel(metadata.applianceType)}
              </dd>
            </div>
          )}

          {/* Content Purpose (conditional) - REQ-183 */}
          {metadata.contentPurpose && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Content Purpose</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {getContentPurposeLabel(metadata.contentPurpose)}
              </dd>
            </div>
          )}

          {/* Tags (conditional, spans 2 columns) */}
          {metadata.tags && metadata.tags.length > 0 && (
            <div className="md:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Tags</dt>
              <dd className="mt-1 flex flex-wrap gap-2">
                {metadata.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    {tag}
                  </span>
                ))}
              </dd>
            </div>
          )}

        </dl>

        {/* QR Code Label Preview */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            <span className="font-medium">QR Code Label:</span>{' '}
            {metadata.title.trim() || <span className="italic">Item Name</span>}
          </p>
        </div>
      </section>

      {/* =================================================================== */}
      {/* Section 2: Media Gallery */}
      {/* =================================================================== */}
      <section
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        aria-labelledby="media-heading"
      >
        {/* Section header */}
        <div className="flex items-center justify-between mb-4">
          <h3 id="media-heading" className="text-lg font-medium text-gray-900">
            Media &amp; Files ({mediaItems.length} {mediaItems.length === 1 ? 'item' : 'items'})
          </h3>
          <button
            type="button"
            onClick={() => onEditSection('content-type')}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
            aria-label="Add more media"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Add More</span>
          </button>
        </div>

        {/* Empty state */}
        {mediaItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 px-4 border-2 border-dashed border-gray-300 rounded-lg">
            <ImageIcon className="w-12 h-12 text-gray-400 mb-3" aria-hidden="true" />
            <p className="text-gray-500 mb-3">No media items added yet</p>
            <button
              type="button"
              onClick={() => onEditSection('content-type')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Add Media
            </button>
          </div>
        ) : (
          /* Media grid */
          <div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
            role="list"
            aria-label="Media items"
          >
            {mediaItems.map((item, index) => (
              <MediaItemCard
                key={item.id}
                item={item}
                index={index}
                totalItems={mediaItems.length}
                onMoveUp={() => handleReorder(item.id, 'up')}
                onMoveDown={() => handleReorder(item.id, 'down')}
                onRemove={() => setConfirmDeleteId(item.id)}
                onEdit={() => onEditMedia(item.id)}
                urlsRef={urlsRef}
              />
            ))}
          </div>
        )}
      </section>

      {/* =================================================================== */}
      {/* Section 3: URL Links */}
      {/* =================================================================== */}
      <section
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        aria-labelledby="urls-heading"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 id="urls-heading" className="text-lg font-medium text-gray-900">
            Links ({urlItems.length} {urlItems.length === 1 ? 'link' : 'links'})
          </h3>
          <button
            type="button"
            onClick={() => onEditSection('url')}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
            aria-label="Add more links"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Add Link</span>
          </button>
        </div>

        {urlItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 px-4 border-2 border-dashed border-gray-300 rounded-lg">
            <LinkIcon className="w-12 h-12 text-gray-400 mb-3" aria-hidden="true" />
            <p className="text-gray-500 mb-3">No links added yet</p>
            <button
              type="button"
              onClick={() => onEditSection('url')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Add Link
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {urlItems.map((urlItem) => (
              <UrlPreview
                key={urlItem.id}
                metadata={urlItem.metadata}
                size="medium"
                onRemove={() => onRemoveUrl(urlItem.id)}
                showExternalIcon
              />
            ))}
          </div>
        )}
      </section>

      {/* =================================================================== */}
      {/* Section 4: Instructions Preview */}
      {/* =================================================================== */}
      <section
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        aria-labelledby="instructions-heading"
      >
        {/* Section header */}
        <div className="flex items-center justify-between mb-4">
          <h3 id="instructions-heading" className="text-lg font-medium text-gray-900">
            Instructions
          </h3>
          <button
            type="button"
            onClick={() => onEditSection('text')}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
            aria-label="Edit instructions"
          >
            <Edit className="w-4 h-4" aria-hidden="true" />
            <span>Edit</span>
          </button>
        </div>

        {/* Instructions content */}
        {instructions.trim() ? (
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown>{instructions}</ReactMarkdown>
          </div>
        ) : (
          <div className="text-gray-500 italic">
            No instructions added.{' '}
            <button
              type="button"
              onClick={() => onEditSection('text')}
              className="text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            >
              Add instructions
            </button>
          </div>
        )}
      </section>

      {/* =================================================================== */}
      {/* Size Indicator */}
      {/* =================================================================== */}
      {mediaItems.length > 0 && (
        <div
          className="bg-gray-50 rounded-lg border border-gray-200 p-4"
          aria-label="Upload size summary"
        >
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <HardDrive className="w-4 h-4 text-gray-400" aria-hidden="true" />
            <span>
              Total size: <span className="font-medium text-gray-900">{formatSize(totalSize)}</span>
              {' / '}
              <span className="text-gray-500">{formatSize(maxTotalSize)}</span>
              {' ('}
              <span className={remainingSize > 0 ? 'text-green-600' : 'text-red-600'}>
                {formatSize(remainingSize)} remaining
              </span>
              {')'}
            </span>
          </div>
          {/* Progress bar */}
          <div className="mt-2 h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full transition-all',
                totalSize / maxTotalSize > 0.9
                  ? 'bg-red-500'
                  : totalSize / maxTotalSize > 0.7
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
              )}
              style={{ width: `${Math.min(100, (totalSize / maxTotalSize) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* Validation Errors */}
      {/* =================================================================== */}
      {Object.keys(errors).length > 0 && (
        <div className="space-y-2">
          {Object.entries(errors).map(([key, message]) => (
            <ValidationMessage
              key={key}
              type="error"
              message={message}
            />
          ))}
        </div>
      )}

      {/* =================================================================== */}
      {/* Validation Warnings */}
      {/* =================================================================== */}
      {Object.keys(warnings).length > 0 && (
        <div className="space-y-2">
          {Object.entries(warnings).map(([key, message]) => (
            <ValidationMessage
              key={key}
              type="warning"
              message={message}
            />
          ))}
        </div>
      )}

      {/* =================================================================== */}
      {/* Action Buttons */}
      {/* =================================================================== */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        {/* Cancel button */}
        <button
          type="button"
          onClick={() => setShowCancelConfirm(true)}
          disabled={isSubmitting}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded"
        >
          <X className="w-4 h-4" aria-hidden="true" />
          <span>Cancel</span>
        </button>

        {/* Submit button */}
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting || !isValid}
          className={cn(
            'flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
            isSubmitting && 'cursor-wait'
          )}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              <span>Submitting...</span>
            </>
          ) : (
            <>
              <Check className="w-4 h-4" aria-hidden="true" />
              <span>Submit</span>
            </>
          )}
        </button>
      </div>

      {/* =================================================================== */}
      {/* Delete Confirmation Modal */}
      {/* =================================================================== */}
      {confirmDeleteId && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
          aria-describedby="delete-modal-description"
        >
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4 w-full">
            <h3 id="delete-modal-title" className="text-lg font-medium text-gray-900 mb-4">
              Remove this item?
            </h3>
            <p id="delete-modal-description" className="text-gray-600 mb-6">
              This action cannot be undone. The media item will be permanently removed.
            </p>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Keep
              </button>
              <button
                type="button"
                onClick={handleConfirmRemove}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* Cancel Confirmation Modal */}
      {/* =================================================================== */}
      {showCancelConfirm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-modal-title"
          aria-describedby="cancel-modal-description"
        >
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4 w-full">
            <h3 id="cancel-modal-title" className="text-lg font-medium text-gray-900 mb-4">
              Discard all changes?
            </h3>
            <p id="cancel-modal-description" className="text-gray-600 mb-6">
              All captured media and entered information will be lost. This cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Continue Editing
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* Screen Reader Announcement Region */}
      {/* =================================================================== */}
      <div aria-live="polite" className="sr-only">
        {announcement}
      </div>
    </div>
  );
}

export default ReviewStep;
