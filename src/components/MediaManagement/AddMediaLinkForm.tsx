'use client';

/**
 * AddMediaLinkForm Component
 *
 * Form for adding new media links with URL validation
 * and type auto-detection.
 *
 * @module MediaManagement/AddMediaLinkForm
 */

import { useState, useCallback, useEffect } from 'react';
import { Plus, X, Link as LinkIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AddMediaLinkFormProps } from './MediaManagement.types';
import { LINK_TYPE_OPTIONS } from './MediaManagement.types';
import type { LinkType } from '@/types';

/**
 * Validates a URL string
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Auto-detects link type from URL
 */
function detectLinkType(url: string): LinkType {
  const lowerUrl = url.toLowerCase();

  // YouTube detection
  if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
    return 'youtube';
  }

  // PDF detection
  if (lowerUrl.endsWith('.pdf')) {
    return 'pdf';
  }

  // Image detection
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  if (imageExtensions.some(ext => lowerUrl.endsWith(ext))) {
    return 'image';
  }

  // Default to text/web link
  return 'text';
}

export function AddMediaLinkForm({
  onAdd,
  onCancel,
  isExpanded = false,
}: AddMediaLinkFormProps) {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [linkType, setLinkType] = useState<LinkType>('text');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [showThumbnailField, setShowThumbnailField] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);

  // Auto-detect type when URL changes
  useEffect(() => {
    if (url && isValidUrl(url)) {
      const detectedType = detectLinkType(url);
      setLinkType(detectedType);
      setUrlError(null);
    } else if (url && !isValidUrl(url)) {
      setUrlError('Please enter a valid URL');
    } else {
      setUrlError(null);
    }
  }, [url]);

  // Reset form
  const resetForm = useCallback(() => {
    setTitle('');
    setUrl('');
    setLinkType('text');
    setThumbnailUrl('');
    setShowThumbnailField(false);
    setUrlError(null);
  }, []);

  // Handle cancel
  const handleCancel = useCallback(() => {
    resetForm();
    onCancel();
  }, [resetForm, onCancel]);

  // Handle submit
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      return;
    }

    if (!url.trim() || !isValidUrl(url)) {
      setUrlError('Please enter a valid URL');
      return;
    }

    onAdd({
      title: title.trim(),
      url: url.trim(),
      linkType,
      thumbnailUrl: thumbnailUrl.trim() || undefined,
    });

    resetForm();
  }, [title, url, linkType, thumbnailUrl, onAdd, resetForm]);

  const canSubmit = title.trim() && url.trim() && isValidUrl(url);

  if (!isExpanded) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
      <div className="space-y-4">
        {/* Title */}
        <div>
          <label htmlFor="new-link-title" className="block text-sm font-medium text-gray-700 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            id="new-link-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#FF385C] focus:border-transparent"
            placeholder="e.g., Product Manual"
            required
          />
        </div>

        {/* URL */}
        <div>
          <label htmlFor="new-link-url" className="block text-sm font-medium text-gray-700 mb-1">
            URL <span className="text-red-500">*</span>
          </label>
          <input
            id="new-link-url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className={cn(
              'w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-[#FF385C] focus:border-transparent',
              urlError ? 'border-red-500' : 'border-gray-300'
            )}
            placeholder="https://..."
            required
          />
          {urlError && (
            <p className="mt-1 text-xs text-red-500">{urlError}</p>
          )}
        </div>

        {/* Type */}
        <div>
          <label htmlFor="new-link-type" className="block text-sm font-medium text-gray-700 mb-1">
            Type
          </label>
          <select
            id="new-link-type"
            value={linkType}
            onChange={(e) => setLinkType(e.target.value as LinkType)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#FF385C] focus:border-transparent"
          >
            {LINK_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">
            Type is auto-detected from URL but can be changed
          </p>
        </div>

        {/* Optional Thumbnail URL */}
        {(linkType === 'image' || showThumbnailField) && (
          <div>
            <label htmlFor="new-link-thumbnail" className="block text-sm font-medium text-gray-700 mb-1">
              Thumbnail URL (optional)
            </label>
            <input
              id="new-link-thumbnail"
              type="url"
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#FF385C] focus:border-transparent"
              placeholder="https://..."
            />
          </div>
        )}

        {/* Show thumbnail field toggle for non-image types */}
        {linkType !== 'image' && !showThumbnailField && (
          <button
            type="button"
            onClick={() => setShowThumbnailField(true)}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            + Add custom thumbnail
          </button>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            className="px-4 py-2 text-sm text-white bg-[#FF385C] hover:bg-[#E31C5F] rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Link
          </button>
        </div>
      </div>
    </form>
  );
}

export default AddMediaLinkForm;
