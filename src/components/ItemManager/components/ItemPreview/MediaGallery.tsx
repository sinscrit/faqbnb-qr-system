'use client';

/**
 * MediaGallery Component
 *
 * Swipeable media carousel for displaying multiple media items with
 * touch gestures, thumbnail navigation, and full-screen support.
 *
 * Features:
 * - Touch-based swipe navigation for mobile
 * - Arrow button and keyboard navigation for desktop
 * - Thumbnail strip with auto-scroll to active item
 * - Full-screen mode with overlay
 * - Media type indicators (video play, PDF page count)
 * - Accessible with ARIA labels and keyboard support
 *
 * @module ItemManager/components/ItemPreview/MediaGallery
 * @lastModified 2026-01-03 (REQ-077 - PhotoViewer and PDFViewer integration)
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Play,
  FileText,
  ImageIcon,
  Video,
  Link as LinkIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MediaItem } from '@/components/ItemCapture/ItemCapture.types';
import { VideoPlayer } from './VideoPlayer';
import { PhotoViewer, PDFViewer } from './viewers';

// =============================================================================
// Types
// =============================================================================

/**
 * Props for the MediaGallery component.
 */
export interface MediaGalleryProps {
  /** Array of media items to display */
  mediaItems: MediaItem[];
  /** Currently active media index (controlled) */
  activeIndex?: number;
  /** Callback when active index changes */
  onActiveIndexChange?: (index: number) => void;
  /** Callback when media item is clicked/tapped (for detail view) */
  onMediaClick?: (item: MediaItem, index: number) => void;
  /** Whether to enable full-screen toggle */
  enableFullScreen?: boolean;
  /** Whether gallery is in full-screen mode (controlled) */
  isFullScreen?: boolean;
  /** Callback when full-screen state changes */
  onFullScreenChange?: (isFullScreen: boolean) => void;
  /** Whether to show thumbnail strip */
  showThumbnails?: boolean;
  /** Initial index to display (uncontrolled mode) */
  initialIndex?: number;
  /** Optional CSS class for customization */
  className?: string;
  /** Debug mode for development */
  debug?: boolean;
}

// =============================================================================
// Constants
// =============================================================================

/**
 * Media type configuration for badges and icons.
 */
const MEDIA_TYPE_CONFIG = {
  video: {
    Icon: Play,
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-700',
    label: 'Video',
  },
  image: {
    Icon: ImageIcon,
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
    label: 'Photo',
  },
  pdf: {
    Icon: FileText,
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-700',
    label: 'PDF',
  },
  url: {
    Icon: LinkIcon,
    bgColor: 'bg-emerald-100',
    textColor: 'text-emerald-700',
    label: 'Link',
  },
} as const;

const MIN_SWIPE_DISTANCE = 50; // pixels

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Format video duration from seconds to MM:SS format.
 */
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// =============================================================================
// Internal Components
// =============================================================================

/**
 * Media type badge component.
 */
function MediaTypeBadge({
  type,
  showLabel = false,
}: {
  type: 'video' | 'image' | 'pdf' | 'url';
  showLabel?: boolean;
}) {
  const config = MEDIA_TYPE_CONFIG[type];
  const { Icon } = config;

  return (
    <div
      className={cn(
        'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
        config.bgColor,
        config.textColor
      )}
    >
      <Icon className="w-3 h-3" />
      {showLabel && <span>{config.label}</span>}
    </div>
  );
}

/**
 * Gallery thumbnail button component.
 */
function GalleryThumbnail({
  item,
  isActive,
  onClick,
  thumbnailUrl,
}: {
  item: MediaItem;
  isActive: boolean;
  onClick: () => void;
  thumbnailUrl: string | undefined;
}) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Reset states when item changes
  useEffect(() => {
    setImageError(false);
    setImageLoading(true);
  }, [item.id]);

  const config = MEDIA_TYPE_CONFIG[item.type];
  const { Icon } = config;

  return (
    <button
      onClick={onClick}
      className={cn(
        'relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
        'transition-all duration-200',
        isActive && 'ring-2 ring-blue-500'
      )}
      role="tab"
      aria-selected={isActive}
      tabIndex={isActive ? 0 : -1}
      aria-label={`View ${item.type} ${item.metadata.originalFilename || ''}`}
    >
      {/* Thumbnail image */}
      {thumbnailUrl && !imageError && item.type !== 'pdf' && (
        <img
          src={thumbnailUrl}
          alt=""
          className={cn(
            'w-full h-full object-cover',
            imageLoading && 'opacity-0'
          )}
          onLoad={() => setImageLoading(false)}
          onError={() => setImageError(true)}
        />
      )}

      {/* Loading state */}
      {imageLoading && !imageError && item.type !== 'pdf' && thumbnailUrl && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}

      {/* PDF or error fallback */}
      {(item.type === 'pdf' || imageError || !thumbnailUrl) && (
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center',
            item.type === 'pdf' ? 'bg-amber-50' : 'bg-gray-100'
          )}
        >
          <Icon
            className={cn(
              'w-6 h-6',
              item.type === 'pdf' ? 'text-amber-500' : 'text-gray-400'
            )}
          />
        </div>
      )}

      {/* Video play indicator */}
      {item.type === 'video' && !imageError && thumbnailUrl && !imageLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-black/50 text-white rounded-full p-1">
            <Play className="w-3 h-3 fill-current" />
          </div>
        </div>
      )}
    </button>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export function MediaGallery({
  mediaItems,
  activeIndex: controlledIndex,
  onActiveIndexChange,
  onMediaClick,
  enableFullScreen = true,
  isFullScreen: controlledFullScreen,
  onFullScreenChange,
  showThumbnails = true,
  initialIndex = 0,
  className,
  debug = false,
}: MediaGalleryProps) {
  // ---------------------------------------------------------------------------
  // Controlled/Uncontrolled state management
  // ---------------------------------------------------------------------------
  const isControlled = controlledIndex !== undefined;
  const [uncontrolledIndex, setUncontrolledIndex] = useState(initialIndex);
  const activeIndex = isControlled ? controlledIndex : uncontrolledIndex;

  const isFullScreenControlled = controlledFullScreen !== undefined;
  const [uncontrolledFullScreen, setUncontrolledFullScreen] = useState(false);
  const isFullScreen = isFullScreenControlled
    ? controlledFullScreen
    : uncontrolledFullScreen;

  // Clamp activeIndex to valid range
  const safeActiveIndex = useMemo(
    () => Math.max(0, Math.min(activeIndex, Math.max(0, mediaItems.length - 1))),
    [activeIndex, mediaItems.length]
  );

  // ---------------------------------------------------------------------------
  // Refs
  // ---------------------------------------------------------------------------
  const urlsRef = useRef<string[]>([]);
  const thumbnailStripRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const galleryRef = useRef<HTMLDivElement>(null);

  // ---------------------------------------------------------------------------
  // Touch state
  // ---------------------------------------------------------------------------
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isSwiping, setIsSwiping] = useState(false);

  // ---------------------------------------------------------------------------
  // Image loading/error state
  // ---------------------------------------------------------------------------
  const [loadErrors, setLoadErrors] = useState<Record<string, boolean>>({});
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {}
  );

  // ---------------------------------------------------------------------------
  // Accessibility announcement
  // ---------------------------------------------------------------------------
  const [announcement, setAnnouncement] = useState('');

  // ---------------------------------------------------------------------------
  // Video playback state
  // ---------------------------------------------------------------------------
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // Object URL management
  // ---------------------------------------------------------------------------
  const createTrackedUrl = useCallback((blob: Blob): string => {
    const url = URL.createObjectURL(blob);
    urlsRef.current.push(url);
    return url;
  }, []);

  const mediaUrls = useMemo(() => {
    // Clear old URLs first
    urlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    urlsRef.current = [];

    return mediaItems.reduce(
      (acc, item) => {
        const blob = item.thumbnail || item.file;
        if (blob) {
          acc[item.id] = createTrackedUrl(blob);
        } else if (item.type === 'url' && item.metadata?.thumbnailUrl) {
          acc[item.id] = item.metadata.thumbnailUrl;
        }
        return acc;
      },
      {} as Record<string, string>
    );
  }, [mediaItems, createTrackedUrl]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      urlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Navigation handlers
  // ---------------------------------------------------------------------------
  const goToIndex = useCallback(
    (index: number) => {
      const clampedIndex = Math.max(0, Math.min(index, mediaItems.length - 1));
      // Stop video playback when navigating away
      setPlayingVideoId(null);
      if (!isControlled) {
        setUncontrolledIndex(clampedIndex);
      }
      onActiveIndexChange?.(clampedIndex);
    },
    [isControlled, mediaItems.length, onActiveIndexChange]
  );

  const goToNext = useCallback(() => {
    if (safeActiveIndex < mediaItems.length - 1) {
      goToIndex(safeActiveIndex + 1);
    }
  }, [safeActiveIndex, mediaItems.length, goToIndex]);

  const goToPrev = useCallback(() => {
    if (safeActiveIndex > 0) {
      goToIndex(safeActiveIndex - 1);
    }
  }, [safeActiveIndex, goToIndex]);

  // ---------------------------------------------------------------------------
  // Keyboard navigation
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToPrev, goToNext]);

  // ---------------------------------------------------------------------------
  // Touch handlers
  // ---------------------------------------------------------------------------
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setIsSwiping(false);
  }, []);

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      setTouchEnd(e.targetTouches[0].clientX);
      if (touchStart !== null) {
        const distance = Math.abs(touchStart - e.targetTouches[0].clientX);
        if (distance > 10) {
          setIsSwiping(true);
        }
      }
    },
    [touchStart]
  );

  const onTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > MIN_SWIPE_DISTANCE;
    const isRightSwipe = distance < -MIN_SWIPE_DISTANCE;

    if (isLeftSwipe && safeActiveIndex < mediaItems.length - 1) {
      goToNext();
    } else if (isRightSwipe && safeActiveIndex > 0) {
      goToPrev();
    }

    setTouchStart(null);
    setTouchEnd(null);
    setIsSwiping(false);
  }, [
    touchStart,
    touchEnd,
    safeActiveIndex,
    mediaItems.length,
    goToNext,
    goToPrev,
  ]);

  // ---------------------------------------------------------------------------
  // Full-screen handlers
  // ---------------------------------------------------------------------------
  const enterFullScreen = useCallback(() => {
    previousFocusRef.current = document.activeElement as HTMLElement;
    if (!isFullScreenControlled) {
      setUncontrolledFullScreen(true);
    }
    onFullScreenChange?.(true);
  }, [isFullScreenControlled, onFullScreenChange]);

  const exitFullScreen = useCallback(() => {
    if (!isFullScreenControlled) {
      setUncontrolledFullScreen(false);
    }
    onFullScreenChange?.(false);
    // Return focus
    setTimeout(() => {
      previousFocusRef.current?.focus();
    }, 0);
  }, [isFullScreenControlled, onFullScreenChange]);

  // Escape key handler for full-screen
  useEffect(() => {
    if (!isFullScreen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        exitFullScreen();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isFullScreen, exitFullScreen]);

  // ---------------------------------------------------------------------------
  // Auto-scroll thumbnail strip to active item
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const strip = thumbnailStripRef.current;
    if (!strip || !showThumbnails) return;

    const activeThumbnail = strip.children[safeActiveIndex] as HTMLElement;
    if (activeThumbnail) {
      activeThumbnail.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [safeActiveIndex, showThumbnails]);

  // ---------------------------------------------------------------------------
  // Accessibility announcements
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (mediaItems.length === 0) return;
    const item = mediaItems[safeActiveIndex];
    if (!item) return;
    const typeLabel = MEDIA_TYPE_CONFIG[item.type].label;
    setAnnouncement(`${typeLabel} ${safeActiveIndex + 1} of ${mediaItems.length}`);
  }, [safeActiveIndex, mediaItems]);

  // ---------------------------------------------------------------------------
  // Handle dynamic mediaItems changes
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (safeActiveIndex >= mediaItems.length && mediaItems.length > 0) {
      goToIndex(mediaItems.length - 1);
    }
  }, [mediaItems.length, safeActiveIndex, goToIndex]);

  // Handle out-of-bounds index reset
  useEffect(() => {
    if (activeIndex !== safeActiveIndex && mediaItems.length > 0) {
      onActiveIndexChange?.(safeActiveIndex);
    }
  }, [activeIndex, safeActiveIndex, onActiveIndexChange, mediaItems.length]);

  // ---------------------------------------------------------------------------
  // Debug logging
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (debug) {
      console.log('[MediaGallery]', {
        itemCount: mediaItems.length,
        activeIndex: safeActiveIndex,
        isFullScreen,
      });
    }
  }, [debug, mediaItems.length, safeActiveIndex, isFullScreen]);

  // ---------------------------------------------------------------------------
  // Image handlers
  // ---------------------------------------------------------------------------
  const handleImageError = useCallback((itemId: string) => {
    setLoadErrors((prev) => ({ ...prev, [itemId]: true }));
    setLoadingStates((prev) => ({ ...prev, [itemId]: false }));
  }, []);

  const handleImageLoad = useCallback((itemId: string) => {
    setLoadingStates((prev) => ({ ...prev, [itemId]: false }));
  }, []);

  // ---------------------------------------------------------------------------
  // Carousel style
  // ---------------------------------------------------------------------------
  const carouselStyle = useMemo(
    () => ({
      transform: `translateX(-${safeActiveIndex * 100}%)`,
      transition: 'transform 300ms ease-out',
    }),
    [safeActiveIndex]
  );

  // ---------------------------------------------------------------------------
  // Render helpers
  // ---------------------------------------------------------------------------
  const isSingleItem = mediaItems.length === 1;

  const renderMediaItem = useCallback(
    (item: MediaItem, idx: number, inFullScreen = false) => {
      const url = mediaUrls[item.id];
      const hasError = loadErrors[item.id];
      const isLoading = loadingStates[item.id] !== false;
      const config = MEDIA_TYPE_CONFIG[item.type];
      const { Icon } = config;
      const isVideoPlaying = playingVideoId === item.id;

      const containerClasses = inFullScreen
        ? 'max-w-full max-h-full flex items-center justify-center'
        : 'w-full h-full flex items-center justify-center';

      const mediaClasses = inFullScreen
        ? 'max-w-full max-h-[80vh] object-contain'
        : 'max-w-full max-h-full object-contain';

      // Handler to start video playback
      const handleVideoClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (item.type === 'video' && !isSwiping) {
          setPlayingVideoId(item.id);
        }
      };

      return (
        <div
          className={containerClasses}
          onClick={() => {
            if (!isSwiping && item.type !== 'video') {
              onMediaClick?.(item, idx);
            }
          }}
        >
          {/* Video Player - when video is playing */}
          {item.type === 'video' && isVideoPlaying && (
            <VideoPlayer
              key={item.id}
              src={item}
              poster={url}
              className={cn(
                'w-full h-full',
                inFullScreen && 'max-h-[80vh]'
              )}
              onEnded={() => setPlayingVideoId(null)}
              onError={(error) => {
                console.error('Video error:', error);
                handleImageError(item.id);
              }}
            />
          )}

          {/* Video thumbnail - when not playing */}
          {item.type === 'video' && !isVideoPlaying && !hasError && url && (
            <div
              className="relative w-full h-full cursor-pointer"
              onClick={handleVideoClick}
            >
              <img
                src={url}
                alt={item.metadata.originalFilename || `video ${idx + 1}`}
                className={cn(
                  mediaClasses,
                  'transition-opacity duration-200',
                  isLoading ? 'opacity-0' : 'opacity-100'
                )}
                onLoad={() => handleImageLoad(item.id)}
                onError={() => handleImageError(item.id)}
              />
              {/* Video play overlay */}
              {!isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black/60 hover:bg-black/80 text-white rounded-full p-4 transition-colors">
                    <Play className="w-12 h-12 fill-current" />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Image display - PhotoViewer in full-screen, simple img otherwise */}
          {item.type === 'image' && !hasError && url && (
            inFullScreen ? (
              <PhotoViewer
                key={item.id}
                imageSrc={url}
                alt={item.metadata.originalFilename || `image ${idx + 1}`}
                className="w-full h-full max-h-[80vh]"
              />
            ) : (
              <img
                src={url}
                alt={item.metadata.originalFilename || `image ${idx + 1}`}
                className={cn(
                  mediaClasses,
                  'transition-opacity duration-200',
                  isLoading ? 'opacity-0' : 'opacity-100'
                )}
                onLoad={() => handleImageLoad(item.id)}
                onError={() => handleImageError(item.id)}
              />
            )
          )}

          {/* Loading state */}
          {isLoading && item.type !== 'pdf' && url && !hasError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
              <div className="w-8 h-8 border-2 border-gray-400 border-t-white rounded-full animate-spin" />
            </div>
          )}

          {/* PDF display - PDFViewer in full-screen, placeholder otherwise */}
          {item.type === 'pdf' && (
            inFullScreen && item.file ? (
              <PDFViewer
                key={item.id}
                pdfSrc={item.file}
                pageCount={item.metadata.pageCount}
                className="w-full h-full max-h-[80vh]"
                onPageChange={(page, total) => {
                  // Optional: Log page changes for debugging
                  if (debug) {
                    console.log(`[MediaGallery] PDF page: ${page}/${total}`);
                  }
                }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full bg-gray-800 px-4">
                <FileText className="w-24 h-24 text-amber-400" />
                <span className="text-white text-lg mt-4">
                  {item.metadata.originalFilename || 'PDF Document'}
                </span>
                {item.metadata.pageCount !== undefined && (
                  <span className="text-amber-300 text-sm mt-1">
                    {item.metadata.pageCount}{' '}
                    {item.metadata.pageCount === 1 ? 'page' : 'pages'}
                  </span>
                )}
              </div>
            )
          )}

          {/* URL display */}
          {item.type === 'url' && (
            <div className="flex flex-col items-center justify-center h-full bg-gray-800 px-4 text-center">
              <LinkIcon className="w-16 h-16 text-emerald-400" />
              <span className="text-white text-base mt-4">
                {item.metadata.pageTitle || item.metadata.url || 'Link'}
              </span>
              {item.metadata.domain && (
                <span className="text-emerald-200 text-sm mt-1">
                  {item.metadata.domain}
                </span>
              )}
            </div>
          )}

          {/* Error/fallback display */}
          {(hasError || !url) && item.type !== 'pdf' && (
            <div className="flex flex-col items-center justify-center h-full bg-gray-800">
              {item.type === 'video' ? (
                <>
                  <Video className="w-16 h-16 text-gray-400" />
                  <span className="text-gray-400 text-sm mt-2">Video</span>
                </>
              ) : item.type === 'url' ? (
                <>
                  <LinkIcon className="w-16 h-16 text-gray-400" />
                  <span className="text-gray-400 text-sm mt-2">Link</span>
                </>
              ) : (
                <>
                  <ImageIcon className="w-16 h-16 text-gray-400" />
                  <span className="text-gray-400 text-sm mt-2">Image</span>
                </>
              )}
            </div>
          )}

          {/* Video duration badge */}
          {item.type === 'video' &&
            item.metadata.duration !== undefined &&
            !isLoading && (
              <div className="absolute bottom-4 right-4 bg-black/60 text-white text-sm px-2 py-1 rounded">
                {formatDuration(item.metadata.duration)}
              </div>
            )}

          {/* PDF page count badge */}
          {item.type === 'pdf' && item.metadata.pageCount !== undefined && (
            <div className="absolute bottom-4 right-4 bg-amber-100 text-amber-700 text-sm px-2 py-1 rounded">
              {item.metadata.pageCount}{' '}
              {item.metadata.pageCount === 1 ? 'page' : 'pages'}
            </div>
          )}
        </div>
      );
    },
    [
      mediaUrls,
      loadErrors,
      loadingStates,
      isSwiping,
      onMediaClick,
      handleImageLoad,
      handleImageError,
      playingVideoId,
      debug,
    ]
  );

  // ---------------------------------------------------------------------------
  // Empty state
  // ---------------------------------------------------------------------------
  if (mediaItems.length === 0) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center h-64 bg-gray-100 rounded-lg gap-2',
          className
        )}
      >
        <ImageIcon className="w-12 h-12 text-gray-300" />
        <p className="text-gray-500 text-sm">No media to display</p>
      </div>
    );
  }

  const currentItem = mediaItems[safeActiveIndex];

  // ---------------------------------------------------------------------------
  // Full-screen overlay
  // ---------------------------------------------------------------------------
  const fullScreenOverlay = isFullScreen && (
    <div
      className="fixed inset-0 z-50 bg-black flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label="Media gallery full screen"
      onClick={(e) => {
        // Exit on backdrop click
        if (e.target === e.currentTarget) {
          exitFullScreen();
        }
      }}
    >
      {/* Close button */}
      <button
        onClick={exitFullScreen}
        className={cn(
          'absolute top-4 right-4 z-10 p-3 rounded-full',
          'bg-white/10 hover:bg-white/20 text-white',
          'transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white'
        )}
        aria-label="Exit full screen"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Type badge and counter */}
      <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
        <MediaTypeBadge type={currentItem.type} showLabel />
        <span className="text-sm text-white bg-black/50 px-2 py-1 rounded">
          {safeActiveIndex + 1} / {mediaItems.length}
        </span>
      </div>

      {/* Full-screen carousel */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="relative w-full h-full flex items-center justify-center">
          {renderMediaItem(currentItem, safeActiveIndex, true)}
        </div>
      </div>

      {/* Navigation arrows in full-screen */}
      {!isSingleItem && safeActiveIndex > 0 && (
        <button
          onClick={goToPrev}
          className={cn(
            'absolute left-4 top-1/2 -translate-y-1/2 z-10',
            'w-14 h-14 flex items-center justify-center rounded-full',
            'bg-white/10 hover:bg-white/20 text-white',
            'transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white'
          )}
          aria-label="Previous media"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
      )}
      {!isSingleItem && safeActiveIndex < mediaItems.length - 1 && (
        <button
          onClick={goToNext}
          className={cn(
            'absolute right-4 top-1/2 -translate-y-1/2 z-10',
            'w-14 h-14 flex items-center justify-center rounded-full',
            'bg-white/10 hover:bg-white/20 text-white',
            'transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white'
          )}
          aria-label="Next media"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      )}

      {/* Thumbnail strip in full-screen */}
      {showThumbnails && !isSingleItem && (
        <div className="flex-shrink-0 pb-4 px-4">
          <div
            ref={thumbnailStripRef}
            className="flex gap-2 overflow-x-auto py-2 justify-center"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
            role="tablist"
            aria-label="Media thumbnails"
          >
            {mediaItems.map((item, idx) => (
              <GalleryThumbnail
                key={item.id}
                item={item}
                isActive={idx === safeActiveIndex}
                onClick={() => goToIndex(idx)}
                thumbnailUrl={mediaUrls[item.id]}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // ---------------------------------------------------------------------------
  // Main render
  // ---------------------------------------------------------------------------
  return (
    <>
      {/* Screen reader announcement */}
      <div
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {announcement}
      </div>

      <div
        ref={galleryRef}
        className={cn('relative', className)}
        role="region"
        aria-roledescription="carousel"
        aria-label={`Media gallery, ${mediaItems.length} items`}
      >
        {/* Main carousel area */}
        <div
          className="relative overflow-hidden bg-gray-900 min-h-[300px] md:min-h-[400px] max-h-[60vh] rounded-lg"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Type badge and counter */}
          <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
            <MediaTypeBadge type={currentItem.type} showLabel />
            {!isSingleItem && (
              <span className="text-sm text-white bg-black/50 px-2 py-1 rounded">
                {safeActiveIndex + 1} / {mediaItems.length}
              </span>
            )}
          </div>

          {/* Full-screen button */}
          {enableFullScreen && (
            <button
              onClick={enterFullScreen}
              className={cn(
                'absolute top-4 right-4 z-10 p-2 rounded-full',
                'bg-black/50 hover:bg-black/70 text-white',
                'transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white'
              )}
              aria-label="Enter full screen"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
          )}

          {/* Carousel track */}
          <div
            className="flex will-change-transform h-full min-h-[300px] md:min-h-[400px]"
            style={carouselStyle}
          >
            {mediaItems.map((item, idx) => (
              <div
                key={item.id}
                className="w-full flex-shrink-0 flex items-center justify-center relative"
              >
                {renderMediaItem(item, idx)}
              </div>
            ))}
          </div>

          {/* Left Arrow - hidden on mobile and at first item */}
          {!isSingleItem && safeActiveIndex > 0 && (
            <button
              onClick={goToPrev}
              className={cn(
                'hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-10',
                'w-12 h-12 items-center justify-center rounded-full',
                'bg-white/80 hover:bg-white shadow-lg transition-colors',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500'
              )}
              aria-label="Previous media"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Right Arrow - hidden on mobile and at last item */}
          {!isSingleItem && safeActiveIndex < mediaItems.length - 1 && (
            <button
              onClick={goToNext}
              className={cn(
                'hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-10',
                'w-12 h-12 items-center justify-center rounded-full',
                'bg-white/80 hover:bg-white shadow-lg transition-colors',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500'
              )}
              aria-label="Next media"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Mobile swipe indicators */}
        {!isSingleItem && (
          <div className="flex md:hidden justify-center gap-1.5 mt-3">
            {mediaItems.map((_, idx) => (
              <div
                key={idx}
                className={cn(
                  'w-2 h-2 rounded-full transition-colors',
                  idx === safeActiveIndex ? 'bg-blue-500' : 'bg-gray-300'
                )}
              />
            ))}
          </div>
        )}

        {/* Thumbnail strip - hidden for single item */}
        {showThumbnails && !isSingleItem && (
          <div
            ref={thumbnailStripRef}
            className="hidden md:flex gap-2 overflow-x-auto py-3 px-1 scrollbar-hide"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
            role="tablist"
            aria-label="Media thumbnails"
          >
            {mediaItems.map((item, idx) => (
              <GalleryThumbnail
                key={item.id}
                item={item}
                isActive={idx === safeActiveIndex}
                onClick={() => goToIndex(idx)}
                thumbnailUrl={mediaUrls[item.id]}
              />
            ))}
          </div>
        )}
      </div>

      {/* Full-screen overlay portal */}
      {fullScreenOverlay}
    </>
  );
}

export default MediaGallery;
