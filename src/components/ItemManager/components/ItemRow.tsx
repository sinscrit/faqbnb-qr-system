'use client';

/**
 * ItemRow Component
 *
 * Displays an individual item in the ItemManager list view.
 * Features thumbnail preview, comprehensive metadata display,
 * kebab action menu, selection mode support, and inline editing
 * of title, location, and tags (REQ-087, REQ-088).
 *
 * @module ItemManager/components/ItemRow
 * @lastModified 2026-01-03 (REQ-090 Task 7 - Enhanced accessibility)
 */

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  MoreVertical,
  Edit,
  Trash2,
  Layers,
  Copy,
  Play,
  FileText,
  ImageIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { InlineEdit, TagsInlineEdit, TagChip } from './shared';
import type { ItemRowProps } from '../ItemManager.types';

/**
 * Maximum number of tags to display before showing overflow count.
 */
const MAX_VISIBLE_TAGS = 3;

/**
 * Helper function to format date in a readable format.
 * @param date - Date to format
 * @returns Formatted date string (e.g., "Jan 3, 2026")
 */
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

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
  return { label: 'PHOTO', classes: 'bg-green-100 text-green-800 border-green-200' };
}

/**
 * ItemRow Component
 *
 * Renders a row for a single item in the list view with thumbnail,
 * comprehensive metadata, selection checkbox, and kebab menu actions.
 */
export function ItemRow({
  item,
  onPreviewClick,
  onSelectionChange,
  isSelected,
  isSelectionMode,
  onEdit,
  onDelete,
  onManageAssets,
  onDuplicate,
  className,
  enableInlineEdit,
  onUpdateItem,
  existingTags,
}: ItemRowProps) {
  // Image loading/error state
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Menu state
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  // Click-outside detection for menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  // Get content type badge info
  const badge = getContentTypeBadge(item.contentType, item.media[0]?.type);

  // Get fallback icon based on content type and media type
  const getFallbackIcon = () => {
    const firstMedia = item.media[0];
    if (!firstMedia) {
      if (item.contentType === 'text-only') {
        return <FileText className="w-6 h-6 text-purple-400" />;
      }
      if (item.contentType === 'pdf-only') {
        return <FileText className="w-6 h-6 text-blue-400" />;
      }
      return <ImageIcon className="w-6 h-6 text-gray-400" />;
    }

    switch (firstMedia.type) {
      case 'video':
        return <Play className="w-6 h-6 text-red-400" />;
      case 'pdf':
        return <FileText className="w-6 h-6 text-blue-400" />;
      case 'image':
      default:
        return <ImageIcon className="w-6 h-6 text-green-400" />;
    }
  };

  // Render tags with overflow handling
  const renderTags = () => {
    if (!item.tags?.length) return null;

    const visibleTags = item.tags.slice(0, MAX_VISIBLE_TAGS);
    const remainingCount = item.tags.length - MAX_VISIBLE_TAGS;

    return (
      <div className="flex flex-wrap gap-1">
        {visibleTags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200"
          >
            {tag}
          </span>
        ))}
        {remainingCount > 0 && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-500">
            +{remainingCount}
          </span>
        )}
      </div>
    );
  };

  // Define menu items
  const menuItems = [
    { icon: Edit, label: 'Edit', onClick: () => onEdit(item), show: true },
    { icon: Layers, label: 'Manage Assets', onClick: () => onManageAssets?.(item), show: !!onManageAssets },
    { icon: Copy, label: 'Duplicate', onClick: () => onDuplicate?.(item), show: !!onDuplicate },
    { icon: Trash2, label: 'Delete', onClick: () => onDelete(item), show: true, danger: true },
  ];

  // Handle row click (for preview)
  const handleRowClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'BUTTON' ||
      target.closest('button') ||
      target.closest('[role="menu"]') ||
      target.closest('[data-inline-edit]')
    ) {
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
    if (e.key === 'Escape' && menuOpen) {
      setMenuOpen(false);
    }
  };

  // Build comprehensive aria-label
  const ariaLabel = `${item.title}. ${item.location ? `Location: ${item.location}.` : ''} ${badge.label} content. Created ${formatDate(item.createdAt)}.${isSelectionMode ? ` ${isSelected ? 'Selected.' : 'Not selected.'}` : ''}`;

  return (
    <div
      role="row"
      tabIndex={0}
      aria-label={ariaLabel}
      aria-selected={isSelectionMode ? isSelected : undefined}
      onClick={handleRowClick}
      onKeyDown={handleKeyDown}
      className={cn(
        'flex items-center gap-4 px-4 py-3 bg-white border-b border-gray-200',
        'hover:bg-gray-50 transition-colors cursor-pointer',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500',
        isSelected && 'bg-blue-50 border-l-4 border-l-blue-500',
        className
      )}
    >
      {/* Selection Checkbox - 48px touch target on mobile */}
      {isSelectionMode && (
        <label
          className={cn(
            'flex-shrink-0 flex items-center justify-center cursor-pointer',
            'min-h-[48px] min-w-[48px] md:min-h-0 md:min-w-0 md:w-8'
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
            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            aria-label={`Select ${item.title}`}
          />
        </label>
      )}

      {/* Thumbnail Area (Task 3) */}
      <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-gray-100 relative">
        {/* Thumbnail Image */}
        {objectUrl && !imageError && (
          <img
            src={objectUrl}
            alt={`${item.title} thumbnail`}
            className={cn(
              'w-full h-full object-cover',
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
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          </div>
        )}

        {/* Fallback Icon (when no thumbnail or error) */}
        {(!objectUrl || imageError) && (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
            {getFallbackIcon()}
          </div>
        )}
      </div>

      {/* Title and Description Section (Task 4) */}
      <div className="flex-1 min-w-0">
        {effectiveEnableInlineEdit ? (
          <div data-inline-edit onClick={(e) => e.stopPropagation()}>
            <InlineEdit
              value={item.title}
              onSave={handleTitleSave}
              placeholder="Enter title..."
              ariaLabel={`Edit title for ${item.title}`}
              maxLength={100}
              minLength={1}
              className="font-medium text-gray-900"
              displayClassName="truncate"
              inputClassName="text-base"
            />
          </div>
        ) : (
          <h3 className="font-medium text-gray-900 truncate">
            {item.title}
          </h3>
        )}
        {item.instructions && (
          <p className="text-sm text-gray-500 truncate">
            {item.instructions}
          </p>
        )}
      </div>

      {/* Location Column (Task 5) */}
      <div className="hidden md:flex w-24 items-center">
        {effectiveEnableInlineEdit ? (
          <div data-inline-edit onClick={(e) => e.stopPropagation()} className="w-full">
            <InlineEdit
              value={item.location || ''}
              onSave={handleLocationSave}
              placeholder="Add location"
              ariaLabel={`Edit location for ${item.title}`}
              maxLength={100}
              allowEmpty
              className="text-sm text-gray-500 w-full"
              displayClassName="truncate"
            />
          </div>
        ) : (
          <span className="text-sm text-gray-500 truncate">
            {item.location || '-'}
          </span>
        )}
      </div>

      {/* Content Type Badge (Task 6) */}
      <div className="hidden sm:flex w-20 items-center">
        <span
          className={cn(
            'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
            badge.classes
          )}
        >
          {badge.label}
        </span>
      </div>

      {/* Tags Column (Task 7, REQ-088) */}
      <div className="hidden lg:flex w-40">
        {effectiveEnableInlineEdit ? (
          <div data-inline-edit onClick={(e) => e.stopPropagation()} className="w-full">
            <TagsInlineEdit
              tags={item.tags || []}
              onSave={handleTagsSave}
              existingTags={existingTags}
              placeholder="Add tags..."
              ariaLabel={`Edit tags for ${item.title}`}
            />
          </div>
        ) : (
          renderTags()
        )}
      </div>

      {/* Date Column (Task 8) */}
      <div className="hidden md:flex w-28 items-center text-sm text-gray-500">
        {formatDate(item.createdAt)}
      </div>

      {/* Kebab Menu - 48px touch target on mobile */}
      <div className="flex-shrink-0 relative" ref={menuRef}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen(!menuOpen);
          }}
          className={cn(
            'flex items-center justify-center',
            'text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg',
            'transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
            'min-h-[48px] min-w-[48px] md:min-h-0 md:min-w-0 md:p-2',
            'touch-manipulation [-webkit-tap-highlight-color:transparent]'
          )}
          aria-label="Item actions"
          aria-haspopup="true"
          aria-expanded={menuOpen}
        >
          <MoreVertical className="w-5 h-5" />
        </button>

        {menuOpen && (
          <div
            role="menu"
            aria-label={`Actions for ${item.title}`}
            className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20"
          >
            {menuItems
              .filter((menuItem) => menuItem.show !== false)
              .map((menuItem) => (
                <button
                  key={menuItem.label}
                  role="menuitem"
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    menuItem.onClick();
                    setMenuOpen(false);
                  }}
                  className={cn(
                    'w-full flex items-center gap-2 px-4 text-sm text-left',
                    'min-h-[48px]',
                    'hover:bg-gray-50 transition-colors',
                    'focus:outline-none focus:bg-gray-100',
                    'touch-manipulation',
                    menuItem.danger ? 'text-red-600 hover:bg-red-50 focus:bg-red-50' : 'text-gray-700'
                  )}
                >
                  <menuItem.icon className="w-4 h-4" aria-hidden="true" />
                  {menuItem.label}
                </button>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ItemRow;
