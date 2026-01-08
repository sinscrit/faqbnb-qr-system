'use client';

/**
 * MediaLinkItem Component
 *
 * Displays a single media link with preview, edit, and delete actions.
 * Supports different link types: youtube, pdf, image, text.
 *
 * @module MediaManagement/MediaLinkItem
 * @see docs/req-143-media-management-Overview.md
 */

import { useState, useCallback } from 'react';
import {
  Youtube,
  FileText,
  Image as ImageIcon,
  Link as LinkIcon,
  Pencil,
  Trash2,
  GripVertical,
  Check,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MediaLinkItemProps, EditableMediaLink } from './MediaManagement.types';
import { LINK_TYPE_OPTIONS } from './MediaManagement.types';

/**
 * Returns the appropriate icon component based on link type
 */
function getLinkTypeIcon(linkType: string): React.ReactNode {
  switch (linkType) {
    case 'youtube':
      return <Youtube className="w-5 h-5 text-red-500" />;
    case 'pdf':
      return <FileText className="w-5 h-5 text-blue-500" />;
    case 'image':
      return <ImageIcon className="w-5 h-5 text-green-500" />;
    case 'text':
    default:
      return <LinkIcon className="w-5 h-5 text-gray-500" />;
  }
}

/**
 * Extracts YouTube video ID from various URL formats
 */
function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

/**
 * Renders the appropriate preview for the link type
 */
function LinkPreview({ link }: { link: EditableMediaLink }) {
  // For YouTube, extract video ID and show thumbnail
  if (link.linkType === 'youtube') {
    const videoId = extractYouTubeId(link.url);
    const thumbnailUrl = link.thumbnailUrl ||
      (videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null);

    if (thumbnailUrl) {
      return (
        <div className="relative w-16 h-16 rounded-md overflow-hidden bg-gray-100">
          <img src={thumbnailUrl} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black/50 text-white rounded-full p-1">
              <Youtube className="w-4 h-4" />
            </div>
          </div>
        </div>
      );
    }
  }

  // For images, show thumbnail if available
  if (link.linkType === 'image' && link.thumbnailUrl) {
    return (
      <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-100">
        <img src={link.thumbnailUrl} alt="" className="w-full h-full object-cover" />
      </div>
    );
  }

  // Default: show type icon
  return (
    <div className="w-16 h-16 rounded-md bg-gray-100 flex items-center justify-center">
      {getLinkTypeIcon(link.linkType)}
    </div>
  );
}

export function MediaLinkItem({
  link,
  index,
  isEditing = false,
  onEdit,
  onDelete,
  onSave,
  onCancelEdit,
  showDragHandle = false,
  dragHandleProps,
  isDragging = false,
}: MediaLinkItemProps) {
  // Local state for inline editing
  const [editTitle, setEditTitle] = useState(link.title);
  const [editUrl, setEditUrl] = useState(link.url);
  const [editType, setEditType] = useState(link.linkType);

  // Reset edit state when entering edit mode
  const handleStartEdit = useCallback(() => {
    setEditTitle(link.title);
    setEditUrl(link.url);
    setEditType(link.linkType);
    onEdit(link);
  }, [link, onEdit]);

  // Save changes
  const handleSave = useCallback(() => {
    onSave({
      ...link,
      title: editTitle.trim(),
      url: editUrl.trim(),
      linkType: editType,
    });
  }, [link, editTitle, editUrl, editType, onSave]);

  // Validate URL
  const isValidUrl = useCallback((url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }, []);

  const canSave = editTitle.trim() && editUrl.trim() && isValidUrl(editUrl);

  // View mode render
  if (!isEditing) {
    return (
      <div
        className={cn(
          'flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-white',
          'transition-all duration-200',
          isDragging && 'shadow-lg ring-2 ring-blue-500 opacity-95'
        )}
      >
        {/* Drag Handle */}
        {showDragHandle && (
          <div
            {...dragHandleProps}
            className="shrink-0 cursor-grab active:cursor-grabbing p-2 text-gray-400 hover:text-gray-600"
            aria-label="Drag to reorder"
          >
            <GripVertical className="w-5 h-5" />
          </div>
        )}

        {/* Preview */}
        <LinkPreview link={link} />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{link.title}</p>
          <p className="text-xs text-gray-500 truncate">{link.url}</p>
          <span className="text-xs text-gray-400 capitalize">{link.linkType}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleStartEdit}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            aria-label="Edit link"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(link)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            aria-label="Delete link"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Edit mode render
  return (
    <div className="p-4 rounded-lg border-2 border-blue-500 bg-blue-50">
      <div className="space-y-3">
        {/* Title Input */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter title"
          />
        </div>

        {/* URL Input */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">URL</label>
          <input
            type="url"
            value={editUrl}
            onChange={(e) => setEditUrl(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://..."
          />
        </div>

        {/* Type Dropdown */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
          <select
            value={editType}
            onChange={(e) => setEditType(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {LINK_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onCancelEdit}
            className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="px-3 py-1.5 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          >
            <Check className="w-4 h-4" />
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default MediaLinkItem;
