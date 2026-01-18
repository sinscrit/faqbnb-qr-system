'use client';

/**
 * VideoPlayer Component
 *
 * A full-featured video player with custom controls including:
 * - Play/pause toggle
 * - Seek bar with progress display
 * - Volume controls with mute toggle
 * - Full-screen support
 * - Auto-hiding controls during playback
 * - Full keyboard accessibility
 *
 * @module ItemManager/components/ItemPreview/VideoPlayer
 * @lastModified 2026-01-03 (REQ-076)
 */

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
  Play,
  Pause,
  Volume2,
  Volume1,
  VolumeX,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MediaItem } from '@/components/ItemCapture/ItemCapture.types';
import {
  formatTime,
  clampVolume,
  requestFullscreen,
  exitFullscreen,
  getFullscreenElement,
  isFullscreenSupported,
} from './videoPlayerUtils';

// =============================================================================
// Types
// =============================================================================

export interface VideoPlayerProps {
  /** Video source - can be MediaItem, Blob, File, or URL string */
  src: MediaItem | Blob | File | string;
  /** Poster image URL for video thumbnail */
  poster?: string;
  /** Auto-play video on load */
  autoPlay?: boolean;
  /** Loop video playback */
  loop?: boolean;
  /** Start video muted */
  muted?: boolean;
  /** Callback when video ends */
  onEnded?: () => void;
  /** Callback when video error occurs */
  onError?: (error: string) => void;
  /** Additional CSS classes */
  className?: string;
}

// =============================================================================
// Constants
// =============================================================================

const HIDE_CONTROLS_DELAY = 3000; // ms
const TOUCH_TARGET_SIZE = 44; // px (minimum for touch targets)

// =============================================================================
// Component
// =============================================================================

export function VideoPlayer({
  src,
  poster,
  autoPlay = false,
  loop = false,
  muted = false,
  onEnded,
  onError,
  className,
}: VideoPlayerProps) {
  // ---------------------------------------------------------------------------
  // Refs
  // ---------------------------------------------------------------------------
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // ---------------------------------------------------------------------------
  // State - Video Source
  // ---------------------------------------------------------------------------
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // State - Video Playback
  // ---------------------------------------------------------------------------
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // State - Volume
  // ---------------------------------------------------------------------------
  const [volume, setVolumeState] = useState(1);
  const [isMuted, setIsMuted] = useState(muted);
  const [lastVolume, setLastVolume] = useState(1);

  // ---------------------------------------------------------------------------
  // State - Fullscreen
  // ---------------------------------------------------------------------------
  const [isFullscreen, setIsFullscreen] = useState(false);

  // ---------------------------------------------------------------------------
  // State - Controls Visibility
  // ---------------------------------------------------------------------------
  const [controlsVisible, setControlsVisible] = useState(true);
  const [lastInteraction, setLastInteraction] = useState(Date.now());

  // ---------------------------------------------------------------------------
  // State - Seeking
  // ---------------------------------------------------------------------------
  const [isSeeking, setIsSeeking] = useState(false);

  // ---------------------------------------------------------------------------
  // Video Source URL Handling
  // ---------------------------------------------------------------------------
  useEffect(() => {
    let objectUrl: string | null = null;

    if (src instanceof Blob || src instanceof File) {
      objectUrl = URL.createObjectURL(src);
      setVideoUrl(objectUrl);
    } else if (typeof src === 'string') {
      setVideoUrl(src);
    } else if (src && 'file' in src) {
      // MediaItem - extract file property
      if (src.file instanceof Blob) {
        objectUrl = URL.createObjectURL(src.file);
        setVideoUrl(objectUrl);
      }
    }

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [src]);

  // ---------------------------------------------------------------------------
  // Video Event Handlers
  // ---------------------------------------------------------------------------
  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    setDuration(video.duration);
    setIsLoading(false);
    setError(null);
  }, []);

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video || isSeeking) return;

    setCurrentTime(video.currentTime);
  }, [isSeeking]);

  const handlePlay = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    onEnded?.();
  }, [onEnded]);

  const handleVideoError = useCallback(() => {
    const errorMessage = 'Failed to load video. Please check the file and try again.';
    setError(errorMessage);
    setIsLoading(false);
    onError?.(errorMessage);
  }, [onError]);

  // ---------------------------------------------------------------------------
  // Playback Controls
  // ---------------------------------------------------------------------------
  const togglePlayback = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play().catch((err) => {
        console.error('Playback failed:', err);
      });
    }
  }, [isPlaying]);

  const skipBackward = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = Math.max(0, video.currentTime - 10);
    setCurrentTime(video.currentTime);
    setLastInteraction(Date.now());
  }, []);

  const skipForward = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = Math.min(duration, video.currentTime + 10);
    setCurrentTime(video.currentTime);
    setLastInteraction(Date.now());
  }, [duration]);

  // ---------------------------------------------------------------------------
  // Seeking
  // ---------------------------------------------------------------------------
  const handleSeekChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const video = videoRef.current;
      if (!video) return;

      const newTime = parseFloat(e.target.value);
      video.currentTime = newTime;
      setCurrentTime(newTime);
    },
    []
  );

  const handleSeekStart = useCallback(() => {
    setIsSeeking(true);
  }, []);

  const handleSeekEnd = useCallback(() => {
    setIsSeeking(false);
    setLastInteraction(Date.now());
  }, []);

  // ---------------------------------------------------------------------------
  // Volume Controls
  // ---------------------------------------------------------------------------
  const setVolume = useCallback(
    (newVolume: number) => {
      const video = videoRef.current;
      const clamped = clampVolume(newVolume);

      setVolumeState(clamped);

      if (video) {
        video.volume = clamped;
        if (clamped > 0 && isMuted) {
          video.muted = false;
          setIsMuted(false);
        }
      }

      if (clamped > 0) {
        setLastVolume(clamped);
      }
    },
    [isMuted]
  );

  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setVolume(parseFloat(e.target.value));
      setLastInteraction(Date.now());
    },
    [setVolume]
  );

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isMuted) {
      // Unmute
      const restoreVolume = lastVolume > 0 ? lastVolume : 0.5;
      video.muted = false;
      video.volume = restoreVolume;
      setIsMuted(false);
      setVolumeState(restoreVolume);
    } else {
      // Mute
      setLastVolume(volume);
      video.muted = true;
      setIsMuted(true);
    }

    setLastInteraction(Date.now());
  }, [isMuted, lastVolume, volume]);

  // ---------------------------------------------------------------------------
  // Fullscreen
  // ---------------------------------------------------------------------------
  const toggleFullscreen = useCallback(async () => {
    const container = containerRef.current;
    if (!container) return;

    try {
      if (!isFullscreen) {
        await requestFullscreen(container);
      } else {
        await exitFullscreen();
      }
    } catch (err) {
      console.error('Fullscreen error:', err);
    }
  }, [isFullscreen]);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(getFullscreenElement() !== null);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Controls Auto-Hide
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!isPlaying) {
      setControlsVisible(true);
      return;
    }

    const timer = setTimeout(() => {
      setControlsVisible(false);
    }, HIDE_CONTROLS_DELAY);

    return () => clearTimeout(timer);
  }, [isPlaying, lastInteraction]);

  const handleInteraction = useCallback(() => {
    setControlsVisible(true);
    setLastInteraction(Date.now());
  }, []);

  // ---------------------------------------------------------------------------
  // Keyboard Controls
  // ---------------------------------------------------------------------------
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const video = videoRef.current;
      if (!video) return;

      switch (e.key) {
        case ' ':
          e.preventDefault(); // Prevent page scroll
          togglePlayback();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          video.currentTime = Math.max(0, video.currentTime - 5);
          setCurrentTime(video.currentTime);
          break;
        case 'ArrowRight':
          e.preventDefault();
          video.currentTime = Math.min(duration, video.currentTime + 5);
          setCurrentTime(video.currentTime);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(Math.min(1, volume + 0.1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(Math.max(0, volume - 0.1));
          break;
        case 'm':
        case 'M':
          toggleMute();
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
      }

      setLastInteraction(Date.now());
    },
    [togglePlayback, duration, setVolume, volume, toggleMute, toggleFullscreen]
  );

  // ---------------------------------------------------------------------------
  // Volume Icon
  // ---------------------------------------------------------------------------
  const VolumeIcon = useMemo(() => {
    if (isMuted || volume === 0) return VolumeX;
    if (volume <= 0.5) return Volume1;
    return Volume2;
  }, [isMuted, volume]);

  // ---------------------------------------------------------------------------
  // Progress Percentage
  // ---------------------------------------------------------------------------
  const progressPercent = useMemo(() => {
    if (duration === 0) return 0;
    return (currentTime / duration) * 100;
  }, [currentTime, duration]);

  // ---------------------------------------------------------------------------
  // Sync volume with video on mount
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.volume = volume;
      video.muted = muted;
    }
  }, [volume, muted]);

  // ---------------------------------------------------------------------------
  // Render - Loading State
  // ---------------------------------------------------------------------------
  if (!videoUrl) {
    return (
      <div
        className={cn(
          'relative flex items-center justify-center bg-black rounded-lg',
          'min-h-[200px]',
          className
        )}
      >
        <div className="w-8 h-8 border-2 border-gray-400 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render - Error State
  // ---------------------------------------------------------------------------
  if (error) {
    return (
      <div
        className={cn(
          'relative flex flex-col items-center justify-center bg-gray-900 rounded-lg p-4',
          'min-h-[200px]',
          className
        )}
      >
        <div className="text-red-400 text-center">
          <p className="font-medium">Video Error</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div
      ref={containerRef}
      className={cn(
        'relative bg-black rounded-lg overflow-hidden group',
        isFullscreen && 'fixed inset-0 z-50 rounded-none',
        className
      )}
      onMouseMove={handleInteraction}
      onTouchStart={handleInteraction}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label="Video player"
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={videoUrl}
        poster={poster}
        className={cn(
          'w-full h-full object-contain',
          isFullscreen && 'max-h-screen'
        )}
        playsInline
        {...({ 'webkit-playsinline': 'true' } as React.HTMLAttributes<HTMLVideoElement>)}
        preload="metadata"
        autoPlay={autoPlay}
        loop={loop}
        onClick={togglePlayback}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={handleEnded}
        onError={handleVideoError}
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="w-10 h-10 border-3 border-gray-400 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {/* Center Play Button (when paused) */}
      {!isPlaying && !isLoading && (
        <button
          onClick={togglePlayback}
          className={cn(
            'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
            'bg-black/60 hover:bg-black/80 text-white rounded-full p-4',
            'transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white'
          )}
          style={{ minWidth: TOUCH_TARGET_SIZE + 16, minHeight: TOUCH_TARGET_SIZE + 16 }}
          aria-label="Play video"
        >
          <Play className="w-10 h-10 fill-current" />
        </button>
      )}

      {/* Controls Overlay */}
      <div
        className={cn(
          'absolute inset-x-0 bottom-0 px-3 py-2',
          'bg-gradient-to-t from-black/80 via-black/40 to-transparent',
          'transition-opacity duration-300',
          controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
      >
        {/* Progress Bar */}
        <div className="mb-2">
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={currentTime}
            onChange={handleSeekChange}
            onMouseDown={handleSeekStart}
            onMouseUp={handleSeekEnd}
            onTouchStart={handleSeekStart}
            onTouchEnd={handleSeekEnd}
            className="w-full h-1 bg-gray-600 rounded-full appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3
              [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer
              [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3
              [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white
              [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${progressPercent}%, #4b5563 ${progressPercent}%, #4b5563 100%)`,
            }}
            aria-label="Seek"
            aria-valuemin={0}
            aria-valuemax={duration}
            aria-valuenow={currentTime}
          />
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between gap-2">
          {/* Left Controls */}
          <div className="flex items-center gap-1">
            {/* Skip Backward */}
            <button
              onClick={skipBackward}
              className={cn(
                'p-2 text-white hover:bg-white/20 rounded-full transition-colors',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-white'
              )}
              style={{ minWidth: TOUCH_TARGET_SIZE, minHeight: TOUCH_TARGET_SIZE }}
              aria-label="Skip backward 10 seconds"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            {/* Play/Pause */}
            <button
              onClick={togglePlayback}
              className={cn(
                'p-2 text-white hover:bg-white/20 rounded-full transition-colors',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-white'
              )}
              style={{ minWidth: TOUCH_TARGET_SIZE, minHeight: TOUCH_TARGET_SIZE }}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 fill-current" />
              )}
            </button>

            {/* Skip Forward */}
            <button
              onClick={skipForward}
              className={cn(
                'p-2 text-white hover:bg-white/20 rounded-full transition-colors',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-white'
              )}
              style={{ minWidth: TOUCH_TARGET_SIZE, minHeight: TOUCH_TARGET_SIZE }}
              aria-label="Skip forward 10 seconds"
            >
              <SkipForward className="w-5 h-5" />
            </button>

            {/* Volume */}
            <div className="flex items-center gap-1 ml-1">
              <button
                onClick={toggleMute}
                className={cn(
                  'p-2 text-white hover:bg-white/20 rounded-full transition-colors',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-white'
                )}
                style={{ minWidth: TOUCH_TARGET_SIZE, minHeight: TOUCH_TARGET_SIZE }}
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                <VolumeIcon className="w-5 h-5" />
              </button>

              {/* Volume Slider - hidden on mobile */}
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="hidden sm:block w-20 h-1 bg-gray-600 rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3
                  [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer
                  [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3
                  [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white
                  [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
                aria-label="Volume"
              />
            </div>
          </div>

          {/* Center - Time Display */}
          <div className="text-white text-sm font-mono hidden sm:block">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-1">
            {/* Time Display (mobile) */}
            <div className="text-white text-xs font-mono sm:hidden">
              {formatTime(currentTime)}
            </div>

            {/* Fullscreen */}
            {isFullscreenSupported() && (
              <button
                onClick={toggleFullscreen}
                className={cn(
                  'p-2 text-white hover:bg-white/20 rounded-full transition-colors',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-white'
                )}
                style={{ minWidth: TOUCH_TARGET_SIZE, minHeight: TOUCH_TARGET_SIZE }}
                aria-label={isFullscreen ? 'Exit full screen' : 'Enter full screen'}
              >
                {isFullscreen ? (
                  <Minimize className="w-5 h-5" />
                ) : (
                  <Maximize className="w-5 h-5" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Focus indicator */}
      <div className="absolute inset-0 pointer-events-none ring-2 ring-blue-500 ring-inset opacity-0 focus-visible:opacity-100" />
    </div>
  );
}

export default VideoPlayer;
