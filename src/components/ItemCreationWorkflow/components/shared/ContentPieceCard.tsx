'use client';

/**
 * ContentPieceCard Component
 *
 * Displays individual content piece with type-appropriate preview.
 * Supports video, photo, PDF, text, and URL content types with
 * remove/retake actions and optional drag handles for reordering.
 *
 * @example
 * ```tsx
 * <ContentPieceCard
 *   content={contentPiece}
 *   onRemove={(id) => removeContentPiece(id)}
 *   onRetake={(id) => handleRetake(id)}
 *   showDragHandle={true}
 * />
 * ```
 *
 * @module ItemCreationWorkflow/components/shared/ContentPieceCard
 * @see PreviewSaveStep for usage context
 * @see SortableContentPieceCard for sortable version
 * @lastModified 2026-01-22 (REQ-E02-066 i18n translations)
 */

import { useState, useEffect, useRef } from 'react';
import { Video, Image, FileText, Type, Link, Trash2, RotateCcw, Play, GripVertical } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { TranslationFn } from '@/types/i18n';
import { cn } from '@/lib/utils';
import type { ContentPiece, ContentData } from '../../ItemCreationWorkflow.types';

// =============================================================================
// Types
// =============================================================================

export interface ContentPieceCardProps {
  /** Content piece data from workflow state */
  content: ContentPiece;
  /** Callback when remove is clicked */
  onRemove?: (id: string) => void;
  /** Callback when retake/replace is clicked */
  onRetake?: (id: string) => void;
  /** Whether actions are disabled (during save) */
  disabled?: boolean;
  /** Whether to show drag handle for reordering */
  showDragHandle?: boolean;
  /** Props to spread on drag handle element (from useSortable) */
  dragHandleProps?: Record<string, unknown>;
  /** Whether this card is currently being dragged */
  isDragging?: boolean;
  /** Optional CSS class */
  className?: string;
  /** Whether this card is used inside a SortableContext (parent has listitem role) */
  isInSortableContext?: boolean;
}

// =============================================================================
// Constants
// =============================================================================

/** Content type config with i18n translation keys */
const TYPE_CONFIG = {
  video: { icon: Video, color: 'bg-purple-100 text-purple-700', labelKey: 'video' },
  photo: { icon: Image, color: 'bg-blue-100 text-blue-700', labelKey: 'photo' },
  pdf: { icon: FileText, color: 'bg-amber-100 text-amber-700', labelKey: 'pdf' },
  text: { icon: Type, color: 'bg-green-100 text-green-700', labelKey: 'text' },
  url: { icon: Link, color: 'bg-indigo-100 text-indigo-700', labelKey: 'url' },
} as const;

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Format duration in seconds to MM:SS format
 */
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// =============================================================================
// Sub-Components for Content Type Rendering
// =============================================================================

interface VideoPreviewProps {
  data: Extract<ContentData, { type: 'video' }>;
  urlsRef: React.MutableRefObject<string[]>;
}

function VideoPreview({ data, urlsRef }: VideoPreviewProps) {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

  useEffect(() => {
    if (data.file) {
      const url = URL.createObjectURL(data.file);
      urlsRef.current.push(url);
      setThumbnailUrl(url);
    }
    return () => {
      // URL will be revoked by parent component cleanup
    };
  }, [data.file, urlsRef]);

  return (
    <div className="relative w-full h-full">
      {thumbnailUrl ? (
        <video
          src={thumbnailUrl}
          className="w-full h-full object-cover"
          preload="metadata"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
          <Video className="w-8 h-8 text-gray-400" aria-hidden="true" />
        </div>
      )}
      {/* Play button overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
        <Play className="w-8 h-8 text-white" aria-hidden="true" />
      </div>
      {/* Duration overlay */}
      {data.duration && (
        <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/70 text-white text-xs rounded">
          {formatDuration(data.duration)}
        </div>
      )}
    </div>
  );
}

interface PhotoPreviewProps {
  data: Extract<ContentData, { type: 'photo' }>;
  urlsRef: React.MutableRefObject<string[]>;
  /** REQ-E02-066: Translation function for i18n */
  t: TranslationFn;
}

function PhotoPreview({ data, urlsRef, t }: PhotoPreviewProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (data.file) {
      const url = URL.createObjectURL(data.file);
      urlsRef.current.push(url);
      setImageUrl(url);
    }
    return () => {
      // URL will be revoked by parent component cleanup
    };
  }, [data.file, urlsRef]);

  return imageUrl ? (
    <img
      src={imageUrl}
      alt={t('photoAlt')}
      className="w-full h-full object-cover"
    />
  ) : (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <Image className="w-8 h-8 text-gray-400" aria-hidden="true" />
    </div>
  );
}

interface PdfPreviewProps {
  data: Extract<ContentData, { type: 'pdf' }>;
  /** REQ-E02-066: Translation function for i18n */
  t: TranslationFn;
}

function PdfPreview({ data, t }: PdfPreviewProps) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-amber-50">
      <FileText className="w-10 h-10 text-amber-600" aria-hidden="true" />
      {data.pageCount && (
        <span className="mt-1 text-xs text-amber-700">
          {t('pageCount', { count: data.pageCount })}
        </span>
      )}
    </div>
  );
}

interface TextPreviewProps {
  data: Extract<ContentData, { type: 'text' }>;
}

function TextPreview({ data }: TextPreviewProps) {
  const truncatedText = data.text.length > 100
    ? data.text.substring(0, 100) + '...'
    : data.text;

  return (
    <div className="w-full h-full flex items-center justify-center p-2 bg-green-50">
      <p className="text-xs text-green-800 line-clamp-4 text-center">
        {truncatedText}
      </p>
    </div>
  );
}

interface UrlPreviewProps {
  data: Extract<ContentData, { type: 'url' }>;
}

function UrlPreviewContent({ data }: UrlPreviewProps) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-2 bg-indigo-50">
      {data.thumbnailUrl ? (
        <img
          src={data.thumbnailUrl}
          alt={data.title || 'URL preview'}
          className="w-full h-full object-cover"
        />
      ) : (
        <>
          {data.faviconUrl && (
            <img
              src={data.faviconUrl}
              alt=""
              className="w-6 h-6 mb-1"
            />
          )}
          <Link className="w-6 h-6 text-indigo-600 mb-1" aria-hidden="true" />
          <p className="text-xs text-indigo-800 text-center line-clamp-2">
            {data.title || new URL(data.url).hostname}
          </p>
        </>
      )}
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export function ContentPieceCard({
  content,
  onRemove,
  onRetake,
  disabled = false,
  showDragHandle = false,
  dragHandleProps,
  isDragging = false,
  className,
  isInSortableContext = false,
}: ContentPieceCardProps) {
  // REQ-E02-066: Translation hook for content piece card
  const t = useTranslations('workflow.shared.content');

  // Ref for tracking object URLs for cleanup
  const urlsRef = useRef<string[]>([]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      urlsRef.current.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  const config = TYPE_CONFIG[content.type];
  const TypeIcon = config.icon;

  // Render content based on type
  const renderContent = () => {
    switch (content.type) {
      case 'video':
        return <VideoPreview data={content.data as Extract<ContentData, { type: 'video' }>} urlsRef={urlsRef} />;
      case 'photo':
        return <PhotoPreview data={content.data as Extract<ContentData, { type: 'photo' }>} urlsRef={urlsRef} t={t} />;
      case 'pdf':
        return <PdfPreview data={content.data as Extract<ContentData, { type: 'pdf' }>} t={t} />;
      case 'text':
        return <TextPreview data={content.data as Extract<ContentData, { type: 'text' }>} />;
      case 'url':
        return <UrlPreviewContent data={content.data as Extract<ContentData, { type: 'url' }>} />;
      default:
        return null;
    }
  };

  // Only use role="listitem" when not in a sortable context
  // When in sortable context, the parent wrapper has the listitem role
  const containerRole = isInSortableContext ? undefined : 'listitem';
  const typeLabel = t(`types.${config.labelKey}`);
  const containerAriaLabel = isInSortableContext ? undefined : t('contentPreviewAriaLabel', { type: typeLabel });

  return (
    <div
      className={cn(
        'relative group rounded-lg overflow-hidden border border-gray-200 bg-white',
        'aspect-square shadow-sm',
        disabled && 'opacity-60 pointer-events-none',
        isDragging && 'ring-2 ring-[#FF385C] shadow-lg',
        className
      )}
      role={containerRole}
      aria-label={containerAriaLabel}
    >
      {/* Content preview */}
      {renderContent()}

      {/* Type badge (top-left) */}
      <div
        className={cn(
          'absolute top-1 left-1 flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium',
          config.color
        )}
        aria-hidden="true"
      >
        <TypeIcon className="w-3 h-3" />
        <span>{typeLabel}</span>
      </div>

      {/* Drag Handle (top-right, visible when showDragHandle is true) */}
      {showDragHandle && (
        <button
          type="button"
          {...dragHandleProps}
          className={cn(
            'absolute top-1 right-1 z-10',
            'p-1.5 bg-white/90 backdrop-blur-sm rounded',
            'cursor-grab active:cursor-grabbing touch-none',
            'min-w-[48px] min-h-[48px] flex items-center justify-center',
            'hover:bg-white hover:shadow-sm transition-all',
            'focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:ring-offset-1'
          )}
          aria-label={t('dragToReorder')}
        >
          <GripVertical className="w-5 h-5 text-gray-600" />
        </button>
      )}

      {/* Action buttons (bottom) - always visible on mobile, hover on desktop */}
      <div className={cn(
        'absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2',
        'transition-opacity',
        // Mobile: always visible
        'opacity-100',
        // Desktop (md+): hover to show
        'md:opacity-0 md:group-hover:opacity-100 md:focus-within:opacity-100'
      )}>
        <div className="flex items-center justify-center gap-2">
          {/* Retake button */}
          {onRetake && (
            <button
              type="button"
              onClick={() => onRetake(content.id)}
              disabled={disabled}
              className={cn(
                'p-1.5 bg-white rounded hover:bg-gray-100 transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:ring-offset-2',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'min-w-[48px] min-h-[48px] flex items-center justify-center'
              )}
              aria-label={t('retakeContent')}
            >
              <RotateCcw className="w-4 h-4 text-gray-700" />
            </button>
          )}
          {/* Remove button */}
          {onRemove && (
            <button
              type="button"
              onClick={() => onRemove(content.id)}
              disabled={disabled}
              className={cn(
                'p-1.5 bg-white rounded hover:bg-red-100 transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'min-w-[48px] min-h-[48px] flex items-center justify-center'
              )}
              aria-label={t('removeContent')}
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ContentPieceCard;
