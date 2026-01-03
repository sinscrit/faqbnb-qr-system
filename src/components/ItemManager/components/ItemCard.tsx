'use client';

/**
 * ItemCard Component
 *
 * A card component for displaying items in the grid view of ItemManager.
 * Features include:
 * - Thumbnail display with Object URL management
 * - Content type badge with appropriate colors
 * - Selection checkbox for bulk operations
 * - Hover and focus states for accessibility
 * - Keyboard navigation support
 * - Inline editing of title, location, and tags (REQ-087, REQ-088)
 *
 * @module ItemManager/components/ItemCard
 * @lastModified 2026-01-03 (REQ-090 Task 6 - Enhanced accessibility)
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Play, FileText, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { InlineEdit, TagsInlineEdit, TagChip } from './shared';
import type { ItemCardProps } from '../ItemManager.types';

/**
 * Helper function to determine badge info based on content type and media type.
 * Returns label and appropriate CSS classes for each content type.
 */
function getContentTypeBadge(contentType: string, firstMediaType?: string) {
  if (contentType === 'text-only') {
    return { label: 'TEXT', classes: 'bg-purple-100 text-purple-800 border-purple-200' };
  }
  if (contentType === 'pdf-only') {
    return { label: 'PDF', classes: 'bg-blue-100 text-blue-800 border-blue-200' };
  }
  if (contentType === 'mixed') {
    return { label: 'MIXED', classes: 'bg-orange-100 text-orange-800 border-orange-200' };
  }
  // contentType === 'media'
  if (firstMediaType === 'video') {
    return { label: 'VIDEO', classes: 'bg-red-100 text-red-800 border-red-200' };
  }
  if (firstMediaType === 'image') {
    return { label: 'PHOTO', classes: 'bg-green-100 text-green-800 border-green-200' };
  }
  if (firstMediaType === 'pdf') {
    return { label: 'PDF', classes: 'bg-blue-100 text-blue-800 border-blue-200' };
  }
  return { label: 'MEDIA', classes: 'bg-gray-100 text-gray-800 border-gray-200' };
}

/**
 * ItemCard Component
 *
 * Renders a card for a single item in the grid view with thumbnail,
 * title, location, content type badge, and selection checkbox.
 */
export function ItemCard({
  item,
  onPreviewClick,
  onSelectionChange,
  isSelected,
  isSelectionMode,
  className,
  enableInlineEdit,
  onUpdateItem,
  existingTags,
}: ItemCardProps) {
  // Image loading/error state
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Calculate effective inline edit state - disable when in selection mode
  const effectiveEnableInlineEdit = enableInlineEdit && !isSelectionMode && !!onUpdateItem;

  // Title save handler
  const handleTitleSave = useCallback(async (newTitle: string) => {
    if (!onUpdateItem) return;
    await onUpdateItem({ ...item, title: newTitle });
  }, [item, onUpdateItem]);

  // Location save handler
  const handleLocationSave = useCallback(async (newLocation: string) => {
    if (!onUpdateItem) return;
    await onUpdateItem({
      ...item,
      location: newLocation || undefined,
    });
  }, [item, onUpdateItem]);

  // Tags save handler
  const handleTagsSave = useCallback(async (newTags: string[]) => {
    if (!onUpdateItem) return;
    await onUpdateItem({
      ...item,
      tags: newTags.length > 0 ? newTags : undefined,
    });
  }, [item, onUpdateItem]);

  // Create object URL from thumbnail or file blob with proper cleanup
  const objectUrl = useMemo(() => {
    const firstMedia = item.media[0];
    if (!firstMedia) return null;
    const blob = firstMedia.thumbnail || (firstMedia.type === 'image' ? firstMedia.file : null);
    if (!blob) return null;
    return URL.createObjectURL(blob);
  }, [item.media]);

  // Cleanup object URL on unmount or when URL changes
  useEffect(() => {
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [objectUrl]);

  // Reset image state when item changes
  useEffect(() => {
    setImageError(false);
    setImageLoading(true);
  }, [item.id]);

  // Get content type badge info
  const badge = getContentTypeBadge(item.contentType, item.media[0]?.type);

  // Get fallback icon based on content type and media type
  const getFallbackIcon = () => {
    const firstMediaType = item.media[0]?.type;

    if (item.contentType === 'text-only') {
      return <FileText className="w-10 h-10 text-purple-400" />;
    }
    if (item.contentType === 'pdf-only' || firstMediaType === 'pdf') {
      return <FileText className="w-10 h-10 text-blue-400" />;
    }
    if (firstMediaType === 'video') {
      return <Play className="w-10 h-10 text-red-400" />;
    }
    if (firstMediaType === 'image') {
      return <ImageIcon className="w-10 h-10 text-green-400" />;
    }
    return <FileText className="w-10 h-10 text-purple-400" />;
  };

  // Handle card click (for preview)
  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger preview if clicking checkbox or inline edit areas
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.closest('input') || target.closest('[data-inline-edit]')) {
      return;
    }
    onPreviewClick(item);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onPreviewClick(item);
    }
  };

  // Build aria-label with full context
  const ariaLabel = isSelectionMode
    ? `${item.title}. ${item.location ? `Location: ${item.location}.` : ''} ${badge.label} content. ${isSelected ? 'Selected.' : 'Not selected.'} Press Enter to ${isSelected ? 'deselect' : 'select'}, or click to preview.`
    : `${item.title}. ${item.location ? `Location: ${item.location}.` : ''} ${badge.label} content. Press Enter to preview.`;

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      aria-pressed={isSelectionMode ? isSelected : undefined}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      className={cn(
        'group cursor-pointer bg-white rounded-xl shadow-sm border border-gray-200',
        'hover:shadow-lg hover:border-gray-300 transition-all duration-200 overflow-hidden',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
        isSelected && 'border-blue-500 ring-2 ring-blue-200',
        className
      )}
    >
      {/* Thumbnail Section */}
      <div className="relative aspect-video bg-gray-100 overflow-hidden">
        {/* Thumbnail Image */}
        {objectUrl && !imageError && (
          <img
            src={objectUrl}
            alt={`${item.title} thumbnail`}
            className={cn(
              'w-full h-full object-cover transition-all duration-200 group-hover:scale-105',
              imageLoading ? 'opacity-0' : 'opacity-100'
            )}
            onLoad={() => setImageLoading(false)}
            onError={() => {
              setImageError(true);
              setImageLoading(false);
            }}
          />
        )}

        {/* Loading Spinner */}
        {imageLoading && objectUrl && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          </div>
        )}

        {/* Fallback Icon (when no thumbnail or error) */}
        {(!objectUrl || imageError) && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
            {getFallbackIcon()}
          </div>
        )}

        {/* Selection Checkbox - 48px touch target on mobile */}
        {isSelectionMode && (
          <label
            className={cn(
              'absolute top-1 left-1 z-10',
              'flex items-center justify-center cursor-pointer',
              'min-h-[48px] min-w-[48px] md:min-h-0 md:min-w-0',
              'md:top-2 md:left-2'
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation();
                onSelectionChange(item.id, e.target.checked);
              }}
              className={cn(
                'w-5 h-5 rounded border-gray-300 text-blue-600',
                'focus:ring-blue-500 bg-white/80 cursor-pointer',
                'shadow-sm hover:border-blue-400'
              )}
              aria-label={`Select ${item.title}`}
            />
          </label>
        )}

        {/* Content Type Badge */}
        <div className="absolute top-2 right-2 z-10">
          <span
            className={cn(
              'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border',
              badge.classes
            )}
          >
            {badge.label}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4">
        {effectiveEnableInlineEdit ? (
          <div data-inline-edit onClick={(e) => e.stopPropagation()}>
            <InlineEdit
              value={item.title}
              onSave={handleTitleSave}
              placeholder="Enter title..."
              ariaLabel={`Edit title for ${item.title}`}
              maxLength={100}
              minLength={1}
              className="font-semibold text-gray-900 text-sm leading-tight"
              displayClassName="line-clamp-2 group-hover:text-blue-600 transition-colors"
            />
          </div>
        ) : (
          <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
            {item.title}
          </h3>
        )}
        {effectiveEnableInlineEdit ? (
          <div data-inline-edit onClick={(e) => e.stopPropagation()} className="mt-1">
            <InlineEdit
              value={item.location || ''}
              onSave={handleLocationSave}
              placeholder="Add location..."
              ariaLabel={`Edit location for ${item.title}`}
              maxLength={100}
              allowEmpty
              className="text-xs text-gray-500"
              displayClassName="truncate"
            />
          </div>
        ) : (
          item.location && (
            <p className="text-xs text-gray-500 mt-1 truncate">
              {item.location}
            </p>
          )
        )}

        {/* Tags Section */}
        {effectiveEnableInlineEdit ? (
          <div data-inline-edit onClick={(e) => e.stopPropagation()} className="mt-2">
            <TagsInlineEdit
              tags={item.tags || []}
              onSave={handleTagsSave}
              existingTags={existingTags}
              placeholder="Add tags..."
              ariaLabel={`Edit tags for ${item.title}`}
            />
          </div>
        ) : (
          item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {item.tags.slice(0, 3).map((tag) => (
                <TagChip key={tag} tag={tag} variant="outline" />
              ))}
              {item.tags.length > 3 && (
                <span className="text-xs text-gray-500 ml-1">
                  +{item.tags.length - 3} more
                </span>
              )}
            </div>
          )
        )}
      </div>
    </article>
  );
}

export default ItemCard;
