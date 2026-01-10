'use client';

/**
 * ContentPreview Component
 *
 * Displays standardized, visually informative previews of various content types.
 * Supports video, photo, PDF, text, and URL content with size variants and loading states.
 *
 * @example
 * ```tsx
 * <ContentPreview
 *   content={contentPiece}
 *   size="medium"
 *   showTypeBadge={true}
 * />
 * ```
 *
 * @module ItemCreationWorkflow/components/shared/ContentPreview
 * @see PreviewSaveStep for primary usage context
 * @lastModified 2026-01-10 (REQ-174 Accessibility Audit)
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import { Video, Image, FileText, Type, Link, Play, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ContentPiece, ContentData, ContentType } from '../../ItemCreationWorkflow.types';

// =============================================================================
// Types
// =============================================================================

export type ContentPreviewSize = 'small' | 'medium' | 'large';

export interface ContentPreviewProps {
  /** Content piece to preview */
  content: ContentPiece;
  /** Size variant for different contexts */
  size?: ContentPreviewSize;
  /** Whether to show the type badge (Video/Photo/PDF/etc.) */
  showTypeBadge?: boolean;
  /** Whether to show remove button */
  showRemove?: boolean;
  /** Callback when remove is clicked */
  onRemove?: () => void;
  /** Whether the preview is in a loading state */
  isLoading?: boolean;
  /** Optional CSS class for container */
  className?: string;
}

// =============================================================================
// Constants
// =============================================================================

/** Size configuration with pixel dimensions and text sizing */
export const SIZE_CONFIG: Record<ContentPreviewSize, { width: number; height: number; iconSize: string; textSize: string }> = {
  small: { width: 80, height: 80, iconSize: 'w-5 h-5', textSize: 'text-[10px]' },
  medium: { width: 120, height: 120, iconSize: 'w-8 h-8', textSize: 'text-xs' },
  large: { width: 200, height: 200, iconSize: 'w-10 h-10', textSize: 'text-sm' },
};

/** Content type configuration with icon, color theme, and display label */
export const TYPE_CONFIG: Record<ContentType, { icon: typeof Video; color: string; label: string }> = {
  video: { icon: Video, color: 'bg-purple-100 text-purple-700', label: 'Video' },
  photo: { icon: Image, color: 'bg-blue-100 text-blue-700', label: 'Photo' },
  pdf: { icon: FileText, color: 'bg-amber-100 text-amber-700', label: 'PDF' },
  text: { icon: Type, color: 'bg-green-100 text-green-700', label: 'Text' },
  url: { icon: Link, color: 'bg-indigo-100 text-indigo-700', label: 'Link' },
};

// =============================================================================
// Helper Functions
// =============================================================================

/** Format duration in seconds to MM:SS format */
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// =============================================================================
// Sub-Components
// =============================================================================

// -----------------------------------------------------------------------------
// Video Preview
// -----------------------------------------------------------------------------

interface VideoPreviewProps {
  data: Extract<ContentData, { type: 'video' }>;
  size: ContentPreviewSize;
  urlsRef: React.MutableRefObject<string[]>;
}

function VideoPreview({ data, size, urlsRef }: VideoPreviewProps) {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const sizeConfig = SIZE_CONFIG[size];

  useEffect(() => {
    if (data.file) {
      const url = URL.createObjectURL(data.file);
      urlsRef.current.push(url);
      setThumbnailUrl(url);
    }
    return () => {
      // URL cleanup handled by parent component
    };
  }, [data.file, urlsRef]);

  return (
    <div className="relative w-full h-full">
      {thumbnailUrl ? (
        <video
          src={thumbnailUrl}
          className="w-full h-full object-cover"
          preload="metadata"
          aria-hidden="true"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
          <Video className={cn(sizeConfig.iconSize, 'text-gray-400')} aria-hidden="true" />
        </div>
      )}
      {/* Play button overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
        <Play className={cn(sizeConfig.iconSize, 'text-white')} aria-hidden="true" />
      </div>
      {/* Duration badge */}
      {data.duration != null && (
        <div className={cn(
          'absolute bottom-1 right-1 px-1 py-0.5 bg-black/70 text-white rounded',
          sizeConfig.textSize
        )}>
          {formatDuration(data.duration)}
        </div>
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Photo Preview
// -----------------------------------------------------------------------------

interface PhotoPreviewProps {
  data: Extract<ContentData, { type: 'photo' }>;
  size: ContentPreviewSize;
  urlsRef: React.MutableRefObject<string[]>;
  /** Content title for alt text */
  contentTitle?: string;
}

function PhotoPreview({ data, size, urlsRef, contentTitle }: PhotoPreviewProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  const sizeConfig = SIZE_CONFIG[size];

  useEffect(() => {
    if (data.file) {
      const url = URL.createObjectURL(data.file);
      urlsRef.current.push(url);
      setImageUrl(url);
      setHasError(false);
    }
    return () => {
      // URL cleanup handled by parent component
    };
  }, [data.file, urlsRef]);

  if (hasError || !imageUrl) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <Image className={cn(sizeConfig.iconSize, 'text-gray-400')} aria-hidden="true" />
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={contentTitle ? `Photo: ${contentTitle}` : 'Photo content preview'}
      className="w-full h-full object-cover"
      onError={() => setHasError(true)}
    />
  );
}

// -----------------------------------------------------------------------------
// PDF Preview
// -----------------------------------------------------------------------------

interface PdfPreviewProps {
  data: Extract<ContentData, { type: 'pdf' }>;
  size: ContentPreviewSize;
}

function PdfPreview({ data, size }: PdfPreviewProps) {
  const sizeConfig = SIZE_CONFIG[size];

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-amber-50">
      <FileText className={cn(sizeConfig.iconSize, 'text-amber-600')} aria-hidden="true" />
      {data.pageCount != null && (
        <span className={cn('mt-1 text-amber-700', sizeConfig.textSize)}>
          {data.pageCount} {data.pageCount === 1 ? 'page' : 'pages'}
        </span>
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Text Preview
// -----------------------------------------------------------------------------

interface TextPreviewProps {
  data: Extract<ContentData, { type: 'text' }>;
  size: ContentPreviewSize;
}

/** Maximum characters to display per size */
const TEXT_TRUNCATE_LIMITS: Record<ContentPreviewSize, number> = {
  small: 40,
  medium: 80,
  large: 150,
};

/** Line clamp classes per size */
const LINE_CLAMP_CLASSES: Record<ContentPreviewSize, string> = {
  small: 'line-clamp-2',
  medium: 'line-clamp-3',
  large: 'line-clamp-5',
};

function TextPreview({ data, size }: TextPreviewProps) {
  const sizeConfig = SIZE_CONFIG[size];
  const limit = TEXT_TRUNCATE_LIMITS[size];
  const lineClamp = LINE_CLAMP_CLASSES[size];

  const truncatedText = useMemo(() => {
    if (data.text.length > limit) {
      return data.text.substring(0, limit) + '...';
    }
    return data.text;
  }, [data.text, limit]);

  return (
    <div className="w-full h-full flex items-center justify-center p-2 bg-green-50">
      <p className={cn(
        'text-green-800 text-center',
        sizeConfig.textSize,
        lineClamp
      )}>
        {truncatedText}
      </p>
    </div>
  );
}

// -----------------------------------------------------------------------------
// URL Preview
// -----------------------------------------------------------------------------

interface UrlPreviewProps {
  data: Extract<ContentData, { type: 'url' }>;
  size: ContentPreviewSize;
}

function UrlPreview({ data, size }: UrlPreviewProps) {
  const sizeConfig = SIZE_CONFIG[size];

  // Extract domain from URL for fallback display
  const domain = useMemo(() => {
    try {
      return new URL(data.url).hostname;
    } catch {
      return data.url;
    }
  }, [data.url]);

  // If thumbnail available, show full image preview
  if (data.thumbnailUrl) {
    return (
      <img
        src={data.thumbnailUrl}
        alt={data.title ? `Link preview: ${data.title}` : `Link preview for ${domain}`}
        className="w-full h-full object-cover"
      />
    );
  }

  // Otherwise show favicon + title + domain
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-2 bg-indigo-50">
      {data.faviconUrl ? (
        <img
          src={data.faviconUrl}
          alt=""
          aria-hidden="true"
          className={cn(
            size === 'small' ? 'w-4 h-4' : 'w-6 h-6',
            'mb-1'
          )}
        />
      ) : (
        <Link
          className={cn(
            size === 'small' ? 'w-4 h-4' : 'w-6 h-6',
            'text-indigo-600 mb-1'
          )}
          aria-hidden="true"
        />
      )}
      <p className={cn(
        'text-indigo-800 text-center',
        sizeConfig.textSize,
        size === 'small' ? 'line-clamp-1' : 'line-clamp-2'
      )}>
        {data.title || domain}
      </p>
      {size !== 'small' && data.title && (
        <p className={cn('text-indigo-600 text-center line-clamp-1', SIZE_CONFIG.small.textSize)}>
          {domain}
        </p>
      )}
    </div>
  );
}

// =============================================================================
// Loading Skeleton
// =============================================================================

interface PreviewSkeletonProps {
  size: ContentPreviewSize;
  contentType?: ContentType;
}

function PreviewSkeleton({ size, contentType }: PreviewSkeletonProps) {
  // Get background color based on content type (or default gray)
  const getBgColor = () => {
    if (!contentType) return 'bg-gray-100';
    // Map content type to lighter background
    const colorMap: Record<ContentType, string> = {
      video: 'bg-purple-50',
      photo: 'bg-blue-50',
      pdf: 'bg-amber-50',
      text: 'bg-green-50',
      url: 'bg-indigo-50',
    };
    return colorMap[contentType];
  };

  return (
    <div
      className={cn(
        'w-full h-full flex flex-col items-center justify-center animate-pulse',
        getBgColor()
      )}
      role="status"
      aria-busy="true"
      aria-label="Loading content preview"
    >
      {/* Icon placeholder */}
      <div className={cn(
        'rounded bg-gray-200',
        size === 'small' ? 'w-5 h-5' : size === 'medium' ? 'w-8 h-8' : 'w-10 h-10'
      )} />
      {/* Text placeholder */}
      {size !== 'small' && (
        <div className="mt-2 w-3/4 h-3 rounded bg-gray-200" />
      )}
      {/* Screen reader announcement */}
      <span className="sr-only">Loading preview...</span>
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export function ContentPreview({
  content,
  size = 'medium',
  showTypeBadge = true,
  showRemove = false,
  onRemove,
  isLoading = false,
  className,
}: ContentPreviewProps) {
  // Track object URLs for cleanup
  const urlsRef = useRef<string[]>([]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    const urls = urlsRef.current;
    return () => {
      urls.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  const sizeConfig = SIZE_CONFIG[size];
  const typeConfig = TYPE_CONFIG[content.type];
  const TypeIcon = typeConfig.icon;

  // Render content based on type
  const renderContent = () => {
    if (isLoading) {
      return <PreviewSkeleton size={size} contentType={content.type} />;
    }

    switch (content.type) {
      case 'video':
        return <VideoPreview data={content.data as Extract<ContentData, { type: 'video' }>} size={size} urlsRef={urlsRef} />;
      case 'photo':
        return <PhotoPreview data={content.data as Extract<ContentData, { type: 'photo' }>} size={size} urlsRef={urlsRef} />;
      case 'pdf':
        return <PdfPreview data={content.data as Extract<ContentData, { type: 'pdf' }>} size={size} />;
      case 'text':
        return <TextPreview data={content.data as Extract<ContentData, { type: 'text' }>} size={size} />;
      case 'url':
        return <UrlPreview data={content.data as Extract<ContentData, { type: 'url' }>} size={size} />;
      default:
        return null;
    }
  };

  // Use role="figure" when interactive controls are present, otherwise role="img"
  // This avoids nested-interactive violation when remove button is shown
  const containerRole = showRemove && onRemove ? 'figure' : 'img';

  return (
    <div
      className={cn(
        'relative group rounded-lg overflow-hidden border border-gray-200 bg-white',
        className
      )}
      style={{ width: sizeConfig.width, height: sizeConfig.height }}
      role={containerRole}
      aria-label={`${typeConfig.label} content preview`}
    >
      {/* Content preview */}
      {renderContent()}

      {/* Type badge (top-left) */}
      {showTypeBadge && (
        <div
          className={cn(
            'absolute top-1 left-1 flex items-center gap-0.5 px-1 py-0.5 rounded font-medium',
            typeConfig.color,
            size === 'small' ? 'text-[8px]' : 'text-xs'
          )}
          aria-hidden="true"
        >
          <TypeIcon className={size === 'small' ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
          {size !== 'small' && <span>{typeConfig.label}</span>}
        </div>
      )}

      {/* Remove button (top-right, visible on hover) */}
      {showRemove && onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className={cn(
            'absolute top-1 right-1 p-1 bg-white/90 rounded-full',
            'opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity',
            'hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500',
            'min-w-[28px] min-h-[28px] flex items-center justify-center'
          )}
          aria-label={`Remove ${typeConfig.label.toLowerCase()} content`}
        >
          <X className="w-3.5 h-3.5 text-red-600" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

export default ContentPreview;
