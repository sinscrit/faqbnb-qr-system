'use client';

/**
 * VideoTrimmer Component (V1 Simplified)
 *
 * Interactive video trimming component for selecting start and end points.
 * In V1, this component captures trim markers as metadata only - actual
 * video encoding is deferred to the server at upload time to avoid the
 * 25MB WASM payload of client-side FFmpeg.
 *
 * Features:
 * - Video preview with constrained playback (start to end marker)
 * - Visual timeline with draggable start/end markers
 * - Duration display showing trimmed vs original length
 * - Keyboard and touch accessibility
 * - Responsive layout from mobile to desktop
 *
 * This component is lazy-loaded only when user enters edit mode.
 * Import via: const VideoTrimmer = dynamic(() => import('./editors/VideoTrimmer'), { ssr: false });
 *
 * @module ItemCapture/editors/VideoTrimmer
 * @see docs/REQ-049-implement-videotrimmer-v1-simplified-detailed.md
 * @lastModified 2025-12-31 (REQ-049)
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  formatTime,
  validateTrim,
  timeToPercent,
  percentToTime,
  clampMarkerPosition,
} from './trimUtils';

// =============================================================================
// Type Definitions (Task 2)
// =============================================================================

/**
 * Trim descriptor containing marker positions for server-side processing
 */
export interface TrimDescriptor {
  /** Start point of trim in seconds */
  startTime: number;
  /** End point of trim in seconds */
  endTime: number;
  /** Original video duration for reference */
  originalDuration: number;
}

/**
 * Props for the VideoTrimmer component
 */
export interface VideoTrimmerProps {
  /** Source video as Blob, File, or object URL string */
  videoSrc: string | Blob | File;
  /** Initial trim descriptor (optional - for resuming edits) */
  initialTrim?: TrimDescriptor;
  /** Called when user confirms the trim selection */
  onTrimComplete: (trimDescriptor: TrimDescriptor) => void;
  /** Called when user cancels trimming */
  onCancel: () => void;
  /** Minimum allowed trim duration in seconds (default: 1) */
  minTrimDuration?: number;
  /** Optional CSS class for the container */
  className?: string;
  /** Show debug information (timestamps, etc.) */
  debug?: boolean;
}

/**
 * Which element is being dragged
 */
type DragTarget = 'start' | 'end' | null;

// =============================================================================
// Constants
// =============================================================================

const DEFAULT_MIN_TRIM_DURATION = 1; // seconds
const TOUCH_TARGET_SIZE = 44; // px (iOS minimum)

// =============================================================================
// Component Implementation
// =============================================================================

export default function VideoTrimmer({
  videoSrc,
  initialTrim,
  onTrimComplete,
  onCancel,
  minTrimDuration = DEFAULT_MIN_TRIM_DURATION,
  className,
  debug = false,
}: VideoTrimmerProps) {
  // === Refs ===
  const videoRef = useRef<HTMLVideoElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  // === State ===
  const [duration, setDuration] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [startMarker, setStartMarker] = useState(0);
  const [endMarker, setEndMarker] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDragging, setIsDragging] = useState<DragTarget>(null);
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  // =============================================================================
  // Video Source URL Handling (Task 3)
  // =============================================================================

  useEffect(() => {
    // Handle Blob/File sources by creating object URL
    if (typeof videoSrc !== 'string') {
      const url = URL.createObjectURL(videoSrc);
      setVideoUrl(url);
      return () => URL.revokeObjectURL(url);
    }

    // String URL - use directly
    setVideoUrl(videoSrc);
  }, [videoSrc]);

  // Reset state when video source changes (Task 11)
  useEffect(() => {
    setDuration(null);
    setCurrentTime(0);
    setStartMarker(0);
    setEndMarker(0);
    setIsPlaying(false);
    setIsLoaded(false);
    setError(null);
  }, [videoSrc]);

  // =============================================================================
  // Video Metadata Loading and Event Handlers (Task 4)
  // =============================================================================

  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const videoDuration = video.duration;
    if (!Number.isFinite(videoDuration) || videoDuration <= 0) {
      setError('Unable to determine video duration');
      return;
    }

    setDuration(videoDuration);
    setIsLoaded(true);
    setError(null);

    // Set initial markers
    if (initialTrim) {
      setStartMarker(initialTrim.startTime);
      setEndMarker(initialTrim.endTime);
      video.currentTime = initialTrim.startTime;
    } else {
      setStartMarker(0);
      setEndMarker(videoDuration);
      video.currentTime = 0;
    }

    setCurrentTime(video.currentTime);
  }, [initialTrim]);

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    setCurrentTime(video.currentTime);

    // Auto-pause at end marker during playback
    if (isPlaying && video.currentTime >= endMarker) {
      video.pause();
      setIsPlaying(false);
      video.currentTime = startMarker;
      setCurrentTime(startMarker);
    }
  }, [isPlaying, endMarker, startMarker]);

  const handlePlay = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const handleError = useCallback(() => {
    setError('Failed to load video. Please check the file and try again.');
    setIsLoaded(false);
  }, []);

  // Sync playback when markers change (Task 4)
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isLoaded) return;

    // If current time is outside trim region, reset to start marker
    if (video.currentTime < startMarker || video.currentTime > endMarker) {
      video.currentTime = startMarker;
      setCurrentTime(startMarker);
    }
  }, [startMarker, endMarker, isLoaded]);

  // =============================================================================
  // Playback Controls (Task 7)
  // =============================================================================

  const handlePlayPause = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      // Start from beginning of trim region if at end or before start
      if (video.currentTime < startMarker || video.currentTime >= endMarker) {
        video.currentTime = startMarker;
      }
      video.play().catch((err) => {
        console.error('Playback failed:', err);
        setError('Unable to play video. Please try again.');
      });
    }
  }, [isPlaying, startMarker, endMarker]);

  const handleSkipToStart = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = startMarker;
    setCurrentTime(startMarker);
    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    }
  }, [startMarker, isPlaying]);

  const handleSkipToEnd = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = endMarker;
    setCurrentTime(endMarker);
    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    }
  }, [endMarker, isPlaying]);

  // =============================================================================
  // Draggable Marker Interactions (Task 6)
  // =============================================================================

  const getTimeFromPointerPosition = useCallback(
    (clientX: number): number => {
      const timeline = timelineRef.current;
      if (!timeline || !duration) return 0;

      const rect = timeline.getBoundingClientRect();
      const x = clientX - rect.left;
      const percent = (x / rect.width) * 100;
      return percentToTime(percent, duration);
    },
    [duration]
  );

  const handleMarkerDragStart = useCallback(
    (marker: 'start' | 'end') =>
      (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(marker);

        // Pause video during drag
        if (videoRef.current && isPlaying) {
          videoRef.current.pause();
        }
      },
    [isPlaying]
  );

  const handleDragMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!isDragging || !duration) return;

      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const time = getTimeFromPointerPosition(clientX);

      if (isDragging === 'start') {
        const clamped = clampMarkerPosition(time, endMarker, true, duration, minTrimDuration);
        setStartMarker(clamped);
        // Update video position to show marker location
        if (videoRef.current) {
          videoRef.current.currentTime = clamped;
        }
      } else if (isDragging === 'end') {
        const clamped = clampMarkerPosition(time, startMarker, false, duration, minTrimDuration);
        setEndMarker(clamped);
        // Update video position to show marker location
        if (videoRef.current) {
          videoRef.current.currentTime = clamped;
        }
      }
    },
    [isDragging, duration, endMarker, startMarker, minTrimDuration, getTimeFromPointerPosition]
  );

  const handleDragEnd = useCallback(() => {
    setIsDragging(null);
  }, []);

  // Attach/detach global listeners during drag (Task 6)
  useEffect(() => {
    if (!isDragging) return;

    window.addEventListener('mousemove', handleDragMove);
    window.addEventListener('mouseup', handleDragEnd);
    window.addEventListener('touchmove', handleDragMove, { passive: false });
    window.addEventListener('touchend', handleDragEnd);

    return () => {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleDragMove);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  // Timeline click-to-seek (Task 6)
  const handleTimelineClick = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging) return;

      const time = getTimeFromPointerPosition(e.clientX);
      if (videoRef.current) {
        videoRef.current.currentTime = time;
        setCurrentTime(time);
      }
    },
    [isDragging, getTimeFromPointerPosition]
  );

  // =============================================================================
  // Keyboard Controls (Task 9)
  // =============================================================================

  const handleMarkerKeyDown = useCallback(
    (marker: 'start' | 'end') =>
      (e: React.KeyboardEvent) => {
        if (!duration) return;

        const step = e.shiftKey ? 5 : 1; // 5 seconds with shift, 1 second without
        const currentValue = marker === 'start' ? startMarker : endMarker;

        switch (e.key) {
          case 'ArrowLeft':
          case 'ArrowDown': {
            e.preventDefault();
            const newValueLeft = currentValue - step;
            if (marker === 'start') {
              setStartMarker(
                clampMarkerPosition(newValueLeft, endMarker, true, duration, minTrimDuration)
              );
            } else {
              setEndMarker(
                clampMarkerPosition(newValueLeft, startMarker, false, duration, minTrimDuration)
              );
            }
            break;
          }

          case 'ArrowRight':
          case 'ArrowUp': {
            e.preventDefault();
            const newValueRight = currentValue + step;
            if (marker === 'start') {
              setStartMarker(
                clampMarkerPosition(newValueRight, endMarker, true, duration, minTrimDuration)
              );
            } else {
              setEndMarker(
                clampMarkerPosition(newValueRight, startMarker, false, duration, minTrimDuration)
              );
            }
            break;
          }

          case 'Home':
            e.preventDefault();
            if (marker === 'start') {
              setStartMarker(0);
            }
            break;

          case 'End':
            e.preventDefault();
            if (marker === 'end') {
              setEndMarker(duration);
            }
            break;
        }
      },
    [duration, startMarker, endMarker, minTrimDuration]
  );

  // Global keyboard handler for spacebar and escape (Task 9)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if not in an input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        handlePlayPause();
      }

      if (e.key === 'Escape') {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePlayPause, onCancel]);

  // =============================================================================
  // Apply and Cancel Actions (Task 10)
  // =============================================================================

  const handleApplyTrim = useCallback(() => {
    if (!duration) return;

    const validation = validateTrim(startMarker, endMarker, duration, minTrimDuration);
    if (!validation.isValid) {
      setError(validation.error || 'Invalid trim selection');
      return;
    }

    const trimDescriptor: TrimDescriptor = {
      startTime: startMarker,
      endTime: endMarker,
      originalDuration: duration,
    };

    onTrimComplete(trimDescriptor);
  }, [duration, startMarker, endMarker, minTrimDuration, onTrimComplete]);

  const handleCancel = useCallback(() => {
    // Pause video
    if (videoRef.current) {
      videoRef.current.pause();
    }
    onCancel();
  }, [onCancel]);

  // Clear error when user adjusts markers (Task 10)
  useEffect(() => {
    if (error) {
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startMarker, endMarker]);

  // =============================================================================
  // Memory Cleanup (Task 11)
  // =============================================================================

  useEffect(() => {
    const video = videoRef.current;

    return () => {
      // Pause and unload video
      if (video) {
        video.pause();
        video.src = '';
        video.load();
      }
    };
  }, []);

  // =============================================================================
  // Render
  // =============================================================================

  return (
    <div
      className={cn(
        'flex flex-col h-full',
        'px-2 sm:px-4',
        className
      )}
    >
      {/* Error display (Task 13) */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          <p className="text-sm font-medium">Error</p>
          <p className="text-sm mt-1">{error}</p>
          <button
            onClick={() => {
              setError(null);
              // Reset video element
              if (videoRef.current && videoUrl) {
                videoRef.current.load();
              }
            }}
            className="mt-2 text-sm text-red-600 underline hover:text-red-800"
          >
            Try again
          </button>
        </div>
      )}

      {/* Video player area (Task 3, 12) */}
      <div className="relative flex-1 min-h-0 max-h-[45vh] sm:max-h-[50vh] lg:max-h-[55vh] bg-black rounded-lg overflow-hidden">
        {videoUrl && (
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full object-contain"
            preload="metadata"
            playsInline
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
            onPlay={handlePlay}
            onPause={handlePause}
            onError={handleError}
          />
        )}
        {/* Loading state (Task 13) */}
        {!isLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mb-3" />
            <span className="text-sm text-gray-600">Loading video...</span>
          </div>
        )}
      </div>

      {/* Timeline (Task 5, 6, 12) */}
      <div
        ref={timelineRef}
        className={cn(
          'relative mt-4 bg-gray-200 rounded cursor-pointer select-none',
          'h-10 sm:h-12'
        )}
        style={{ touchAction: 'none' }}
        onClick={handleTimelineClick}
      >
        {isLoaded && duration && (
          <>
            {/* Excluded region before start (dimmed) */}
            <div
              className="absolute h-full bg-gray-400/50 rounded-l"
              style={{
                left: 0,
                width: `${timeToPercent(startMarker, duration)}%`,
              }}
            />

            {/* Selected trim region (highlighted) */}
            <div
              className="absolute h-full bg-blue-200"
              style={{
                left: `${timeToPercent(startMarker, duration)}%`,
                width: `${timeToPercent(endMarker - startMarker, duration)}%`,
              }}
            />

            {/* Excluded region after end (dimmed) */}
            <div
              className="absolute h-full bg-gray-400/50 rounded-r"
              style={{
                left: `${timeToPercent(endMarker, duration)}%`,
                width: `${100 - timeToPercent(endMarker, duration)}%`,
              }}
            />

            {/* Start marker handle */}
            <div
              className={cn(
                'absolute top-0 h-full w-6 bg-blue-500 cursor-ew-resize',
                'flex items-center justify-center',
                'rounded-l border-r-2 border-blue-700',
                isDragging === 'start' && 'bg-blue-600 scale-105',
                'hover:bg-blue-600 transition-colors'
              )}
              style={{
                left: `calc(${timeToPercent(startMarker, duration)}% - 12px)`,
                minWidth: `${TOUCH_TARGET_SIZE}px`,
              }}
              role="slider"
              aria-label="Start trim point"
              aria-valuemin={0}
              aria-valuemax={duration}
              aria-valuenow={startMarker}
              aria-valuetext={formatTime(startMarker)}
              tabIndex={0}
              onMouseDown={handleMarkerDragStart('start')}
              onTouchStart={handleMarkerDragStart('start')}
              onKeyDown={handleMarkerKeyDown('start')}
            >
              <span className="text-white text-xs font-bold">S</span>
            </div>

            {/* End marker handle */}
            <div
              className={cn(
                'absolute top-0 h-full w-6 bg-blue-500 cursor-ew-resize',
                'flex items-center justify-center',
                'rounded-r border-l-2 border-blue-700',
                isDragging === 'end' && 'bg-blue-600 scale-105',
                'hover:bg-blue-600 transition-colors'
              )}
              style={{
                left: `calc(${timeToPercent(endMarker, duration)}% - 12px)`,
                minWidth: `${TOUCH_TARGET_SIZE}px`,
              }}
              role="slider"
              aria-label="End trim point"
              aria-valuemin={0}
              aria-valuemax={duration}
              aria-valuenow={endMarker}
              aria-valuetext={formatTime(endMarker)}
              tabIndex={0}
              onMouseDown={handleMarkerDragStart('end')}
              onTouchStart={handleMarkerDragStart('end')}
              onKeyDown={handleMarkerKeyDown('end')}
            >
              <span className="text-white text-xs font-bold">E</span>
            </div>

            {/* Current playhead position */}
            <div
              className="absolute top-0 w-1 h-full bg-red-500 pointer-events-none z-10"
              style={{
                left: `${timeToPercent(currentTime, duration)}%`,
              }}
            />
          </>
        )}
      </div>

      {/* Timeline labels */}
      {isLoaded && duration && (
        <div className="flex justify-between text-xs text-gray-500 mt-1 px-1">
          <span>0:00</span>
          <span>{formatTime(duration)}</span>
        </div>
      )}

      {/* Duration display (Task 8, 12) */}
      {isLoaded && duration && (
        <div className="mt-2 sm:mt-3 text-center">
          <div className="text-xs sm:text-sm text-gray-700">
            <span className="hidden sm:inline font-medium">Selection: </span>
            <span className="text-blue-600 font-mono">
              {formatTime(startMarker)} → {formatTime(endMarker)}
            </span>
            <span className="mx-1 sm:mx-2 text-gray-400">|</span>
            <span className="hidden sm:inline font-medium">Duration: </span>
            <span className="text-blue-600 font-mono">{formatTime(endMarker - startMarker)}</span>
            <span className="text-gray-500"> / {formatTime(duration)}</span>
          </div>

          {/* Current playhead position */}
          <div className="text-xs text-gray-500 mt-1">
            Current: <span className="font-mono">{formatTime(currentTime)}</span>
          </div>

          {/* Trim savings indicator */}
          {endMarker - startMarker < duration && (
            <div className="text-xs text-green-600 mt-1">
              Trimming {formatTime(duration - (endMarker - startMarker))} (
              {Math.round((1 - (endMarker - startMarker) / duration) * 100)}% reduction)
            </div>
          )}
        </div>
      )}

      {/* Playback controls (Task 7, 12) */}
      <div className="mt-3 sm:mt-4 flex justify-center items-center gap-1 sm:gap-2">
        <button
          onClick={handleSkipToStart}
          disabled={!isLoaded}
          className={cn(
            'p-3 rounded-full',
            'bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-colors'
          )}
          style={{ minWidth: TOUCH_TARGET_SIZE, minHeight: TOUCH_TARGET_SIZE }}
          aria-label="Skip to start marker"
        >
          <SkipBack className="w-5 h-5" />
        </button>

        <button
          onClick={handlePlayPause}
          disabled={!isLoaded}
          className={cn(
            'p-4 rounded-full',
            'bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-colors'
          )}
          style={{ minWidth: TOUCH_TARGET_SIZE + 8, minHeight: TOUCH_TARGET_SIZE + 8 }}
          aria-label={isPlaying ? 'Pause' : 'Play trimmed region'}
        >
          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
        </button>

        <button
          onClick={handleSkipToEnd}
          disabled={!isLoaded}
          className={cn(
            'p-3 rounded-full',
            'bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-colors'
          )}
          style={{ minWidth: TOUCH_TARGET_SIZE, minHeight: TOUCH_TARGET_SIZE }}
          aria-label="Skip to end marker"
        >
          <SkipForward className="w-5 h-5" />
        </button>
      </div>

      {/* Overlay during drag (Task 13) */}
      {isDragging && <div className="fixed inset-0 z-50 cursor-ew-resize" />}

      {/* Action buttons (Task 10, 12) */}
      <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
        <button
          onClick={handleCancel}
          className={cn(
            'px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg',
            'w-full sm:w-auto',
            'bg-gray-200 hover:bg-gray-300 text-gray-700',
            'transition-colors',
            'order-2 sm:order-1'
          )}
          style={{ minHeight: TOUCH_TARGET_SIZE }}
        >
          Cancel
        </button>

        <button
          onClick={handleApplyTrim}
          disabled={!isLoaded || !!error}
          className={cn(
            'px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg',
            'w-full sm:w-auto',
            'bg-blue-500 hover:bg-blue-600 text-white font-medium',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-colors',
            'order-1 sm:order-2'
          )}
          style={{ minHeight: TOUCH_TARGET_SIZE }}
        >
          Apply Trim
        </button>
      </div>

      {/* Debug info */}
      {debug && (
        <pre className="mt-4 p-2 bg-gray-100 text-xs overflow-auto rounded">
          {JSON.stringify(
            { duration, currentTime, startMarker, endMarker, isPlaying, isLoaded, isDragging },
            null,
            2
          )}
        </pre>
      )}
    </div>
  );
}
