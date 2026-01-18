'use client';

/**
 * UrlPreview Component
 *
 * Reusable component for displaying URL item previews with
 * thumbnail, title, domain, and external link indicator.
 *
 * @module ItemCapture/components/shared/UrlPreview
 * @lastModified 2026-01-05 (REQ-092)
 */

import React, { useState } from 'react';
import { ExternalLink, Globe, Play, Link as LinkIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UrlMetadata } from '../../ItemCapture.types';

export interface UrlPreviewProps {
  /** URL metadata to display */
  metadata: UrlMetadata;
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
  /** Whether the preview is clickable */
  onClick?: () => void;
  /** Show remove button */
  onRemove?: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Show external link icon */
  showExternalIcon?: boolean;
}

export default function UrlPreview({
  metadata,
  size = 'medium',
  onClick,
  onRemove,
  className,
  showExternalIcon = false,
}: UrlPreviewProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const isYouTube = metadata.linkType === 'youtube';
  const hasThumbnail = metadata.thumbnailUrl && !imageError;

  // Size-specific dimensions
  const dimensions = {
    small: { width: 'w-12', height: 'h-12', image: 'w-12 h-12' },
    medium: { width: 'w-20', height: 'h-20', image: 'w-20 h-20' },
    large: { width: 'w-32', height: 'h-24', image: 'w-32 h-24' },
  }[size];

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  return (
    <div
      className={cn(
        'relative bg-white rounded-lg border border-gray-200 transition-all',
        onClick && 'cursor-pointer hover:shadow-md hover:border-gray-300',
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyPress={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className={cn('flex gap-3', size === 'small' ? 'p-2' : 'p-4')}>
        {/* Thumbnail */}
        <div className={cn('flex-shrink-0 relative', dimensions.image)}>
          {hasThumbnail ? (
            <div className="relative w-full h-full bg-gray-100 rounded overflow-hidden">
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <div className="w-6 h-6 border-2 border-gray-300 border-t-cyan-600 rounded-full animate-spin" />
                </div>
              )}
              <img
                src={metadata.thumbnailUrl}
                alt={metadata.title}
                className="w-full h-full object-cover"
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
              {isYouTube && !imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                    <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className={cn(
              'w-full h-full bg-gray-100 rounded flex items-center justify-center',
              dimensions.image
            )}>
              <LinkIcon className={cn(
                'text-gray-400',
                size === 'small' ? 'w-4 h-4' : size === 'medium' ? 'w-6 h-6' : 'w-8 h-8'
              )} />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h4 className={cn(
            'font-medium text-gray-900',
            size === 'small' ? 'text-sm line-clamp-1' : size === 'medium' ? 'text-base line-clamp-2' : 'text-lg line-clamp-2',
            'mb-1'
          )}>
            {metadata.title}
          </h4>

          {/* Description (medium and large only) */}
          {size !== 'small' && metadata.description && (
            <p className={cn(
              'text-gray-600 mb-2',
              size === 'medium' ? 'text-sm line-clamp-2' : 'text-base line-clamp-3'
            )}>
              {metadata.description}
            </p>
          )}

          {/* Domain and URL */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Domain Badge */}
            <span className={cn(
              'inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium',
              size === 'small' ? 'text-xs' : 'text-sm',
              isYouTube
                ? 'bg-red-100 text-red-800'
                : 'bg-gray-100 text-gray-700'
            )}>
              {metadata.faviconUrl && !imageError ? (
                <img
                  src={metadata.faviconUrl}
                  alt=""
                  className="w-3 h-3"
                  onError={() => setImageError(true)}
                />
              ) : (
                <Globe className="w-3 h-3" />
              )}
              {metadata.domain}
            </span>

            {/* URL (medium and large only) */}
            {size !== 'small' && (
              <span className={cn(
                'text-gray-500 truncate',
                size === 'medium' ? 'text-xs' : 'text-sm'
              )}>
                {metadata.url}
              </span>
            )}

            {/* External Link Icon */}
            {showExternalIcon && (
              <ExternalLink className={cn(
                'text-gray-400 flex-shrink-0',
                size === 'small' ? 'w-3 h-3' : 'w-4 h-4'
              )} />
            )}
          </div>
        </div>
      </div>

      {/* Remove Button */}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className={cn(
            'absolute top-2 right-2 p-1.5 bg-white rounded-full border border-gray-200',
            'hover:bg-red-50 hover:border-red-300 hover:text-red-600',
            'focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
            'transition-colors shadow-sm'
          )}
          aria-label="Remove link"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// Named export for testing
export { UrlPreview };
