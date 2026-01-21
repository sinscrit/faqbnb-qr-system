'use client';

/**
 * PhotoViewer Component
 *
 * Interactive photo viewer with zoom and pan functionality for the
 * ItemPreview modal. Supports double-tap zoom, pinch-to-zoom gestures,
 * and button-based zoom controls.
 *
 * Features:
 * - Double-tap/click to toggle zoom
 * - Pinch-to-zoom gesture on touch devices
 * - Pan/drag when zoomed in
 * - Zoom control buttons (+, -, reset)
 * - Boundary constraints for panning
 * - Accessibility support
 *
 * @module ItemManager/components/ItemPreview/viewers/PhotoViewer
 * @lastModified 2026-01-03
 */

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// =============================================================================
// Types
// =============================================================================

/**
 * Props for the PhotoViewer component.
 */
export interface PhotoViewerProps {
  /** Object URL or source URL of the image */
  imageSrc: string;
  /** Alt text for accessibility */
  alt?: string;
  /** Callback when viewer requests close (optional) */
  onClose?: () => void;
  /** Whether to enable zoom functionality (default: true) */
  enableZoom?: boolean;
  /** Maximum zoom level (default: 3.0) */
  maxZoom?: number;
  /** Minimum zoom level (default: 1.0) */
  minZoom?: number;
  /** Zoom increment for buttons (default: 0.5) */
  zoomStep?: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Internal state for zoom and pan tracking.
 */
interface PhotoViewerState {
  scale: number;
  position: { x: number; y: number };
  isZoomed: boolean;
  isDragging: boolean;
}

// =============================================================================
// Constants
// =============================================================================

const DOUBLE_TAP_THRESHOLD = 300; // ms
const DEFAULT_ZOOM_LEVEL = 2.0;

// =============================================================================
// Component
// =============================================================================

export function PhotoViewer({
  imageSrc,
  alt = 'Image',
  onClose,
  enableZoom = true,
  maxZoom = 3.0,
  minZoom = 1.0,
  zoomStep = 0.5,
  className,
}: PhotoViewerProps) {
  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isZoomed, setIsZoomed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  // ---------------------------------------------------------------------------
  // Refs
  // ---------------------------------------------------------------------------
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const lastTapRef = useRef<number>(0);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const positionStartRef = useRef({ x: 0, y: 0 });
  const initialPinchDistanceRef = useRef<number>(0);
  const initialScaleRef = useRef<number>(1);
  const isPinchingRef = useRef(false);

  // ---------------------------------------------------------------------------
  // Derived State
  // ---------------------------------------------------------------------------
  const canZoomIn = scale < maxZoom;
  const canZoomOut = scale > minZoom;
  const zoomPercentage = Math.round(scale * 100);

  // ---------------------------------------------------------------------------
  // Helper Functions
  // ---------------------------------------------------------------------------

  /**
   * Clamp a value between min and max bounds.
   */
  const clamp = useCallback((value: number, min: number, max: number) => {
    return Math.min(Math.max(value, min), max);
  }, []);

  /**
   * Calculate pan boundaries based on zoom level and image dimensions.
   */
  const calculateBounds = useCallback(() => {
    if (!containerRef.current || !imageRef.current) {
      return { minX: 0, maxX: 0, minY: 0, maxY: 0 };
    }

    const containerRect = containerRef.current.getBoundingClientRect();
    const imageRect = imageRef.current.getBoundingClientRect();

    // Calculate overflow at current scale
    const scaledWidth = imageRect.width;
    const scaledHeight = imageRect.height;

    const overflowX = Math.max(0, (scaledWidth * scale - containerRect.width) / 2);
    const overflowY = Math.max(0, (scaledHeight * scale - containerRect.height) / 2);

    return {
      minX: -overflowX,
      maxX: overflowX,
      minY: -overflowY,
      maxY: overflowY,
    };
  }, [scale]);

  /**
   * Constrain position to boundaries.
   */
  const constrainPosition = useCallback(
    (x: number, y: number) => {
      const bounds = calculateBounds();
      return {
        x: clamp(x, bounds.minX, bounds.maxX),
        y: clamp(y, bounds.minY, bounds.maxY),
      };
    },
    [calculateBounds, clamp]
  );

  /**
   * Calculate distance between two touch points.
   */
  const getDistance = useCallback((touch1: Touch, touch2: Touch): number => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  // ---------------------------------------------------------------------------
  // Zoom Functions
  // ---------------------------------------------------------------------------

  /**
   * Reset zoom to 1x and center position.
   */
  const resetZoom = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setIsZoomed(false);
  }, []);

  /**
   * Zoom to a specific scale level.
   */
  const zoomTo = useCallback(
    (newScale: number) => {
      const clampedScale = clamp(newScale, minZoom, maxZoom);
      setScale(clampedScale);
      setIsZoomed(clampedScale > 1);

      // Reset position if returning to 1x zoom
      if (clampedScale <= 1) {
        setPosition({ x: 0, y: 0 });
      }
    },
    [clamp, minZoom, maxZoom]
  );

  /**
   * Zoom in by one step.
   */
  const zoomIn = useCallback(() => {
    zoomTo(scale + zoomStep);
  }, [scale, zoomStep, zoomTo]);

  /**
   * Zoom out by one step.
   */
  const zoomOut = useCallback(() => {
    zoomTo(scale - zoomStep);
  }, [scale, zoomStep, zoomTo]);

  // ---------------------------------------------------------------------------
  // Double-Tap/Click Handler
  // ---------------------------------------------------------------------------

  const handleDoubleTap = useCallback(
    (clientX: number, clientY: number) => {
      if (!enableZoom) return;

      if (isZoomed) {
        resetZoom();
      } else {
        // Zoom to default level
        zoomTo(DEFAULT_ZOOM_LEVEL);
      }
    },
    [enableZoom, isZoomed, resetZoom, zoomTo]
  );

  const handleTap = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!enableZoom) return;

      const now = Date.now();
      const clientX = 'touches' in e ? e.touches[0]?.clientX || 0 : e.clientX;
      const clientY = 'touches' in e ? e.touches[0]?.clientY || 0 : e.clientY;

      if (now - lastTapRef.current < DOUBLE_TAP_THRESHOLD) {
        handleDoubleTap(clientX, clientY);
        lastTapRef.current = 0;
      } else {
        lastTapRef.current = now;
      }
    },
    [enableZoom, handleDoubleTap]
  );

  // ---------------------------------------------------------------------------
  // Pinch-to-Zoom Handlers
  // ---------------------------------------------------------------------------

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2) {
        // Pinch start
        e.preventDefault();
        isPinchingRef.current = true;
        initialPinchDistanceRef.current = getDistance(e.touches[0] as Touch, e.touches[1] as Touch);
        initialScaleRef.current = scale;
      } else if (e.touches.length === 1 && isZoomed) {
        // Drag start
        setIsDragging(true);
        dragStartRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
        positionStartRef.current = { ...position };
      }
    },
    [getDistance, isZoomed, position, scale]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2 && isPinchingRef.current) {
        // Pinch move
        e.preventDefault();
        const currentDistance = getDistance(e.touches[0] as Touch, e.touches[1] as Touch);
        const scaleFactor = currentDistance / initialPinchDistanceRef.current;
        const newScale = clamp(
          initialScaleRef.current * scaleFactor,
          minZoom,
          maxZoom
        );
        setScale(newScale);
        setIsZoomed(newScale > 1);
      } else if (e.touches.length === 1 && isDragging && isZoomed) {
        // Drag move
        const dx = e.touches[0].clientX - dragStartRef.current.x;
        const dy = e.touches[0].clientY - dragStartRef.current.y;
        const newPosition = constrainPosition(
          positionStartRef.current.x + dx,
          positionStartRef.current.y + dy
        );
        setPosition(newPosition);
      }
    },
    [clamp, constrainPosition, getDistance, isDragging, isZoomed, maxZoom, minZoom]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length < 2) {
        isPinchingRef.current = false;
      }
      if (e.touches.length === 0) {
        setIsDragging(false);
      }

      // Reset position if zoom returned to 1x
      if (scale <= 1) {
        setPosition({ x: 0, y: 0 });
        setIsZoomed(false);
      }
    },
    [scale]
  );

  // ---------------------------------------------------------------------------
  // Mouse Drag Handlers
  // ---------------------------------------------------------------------------

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!isZoomed) return;

      e.preventDefault();
      setIsDragging(true);
      dragStartRef.current = { x: e.clientX, y: e.clientY };
      positionStartRef.current = { ...position };
    },
    [isZoomed, position]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging || !isZoomed) return;

      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      const newPosition = constrainPosition(
        positionStartRef.current.x + dx,
        positionStartRef.current.y + dy
      );
      setPosition(newPosition);
    },
    [constrainPosition, isDragging, isZoomed]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // ---------------------------------------------------------------------------
  // Keyboard Handler
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // ---------------------------------------------------------------------------
  // Reset on imageSrc Change
  // ---------------------------------------------------------------------------

  useEffect(() => {
    resetZoom();
    setIsImageLoaded(false);
  }, [imageSrc, resetZoom]);

  // ---------------------------------------------------------------------------
  // Transform Style
  // ---------------------------------------------------------------------------

  const transformStyle = useMemo(
    () => ({
      transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
      transition: isDragging || isPinchingRef.current ? 'none' : 'transform 0.2s ease-out',
    }),
    [position, scale, isDragging]
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-full h-full flex items-center justify-center',
        'overflow-hidden select-none',
        isZoomed && 'cursor-grab',
        isDragging && 'cursor-grabbing',
        className
      )}
      style={{ touchAction: enableZoom ? 'none' : 'auto' }}
      role="img"
      aria-label={alt}
      onClick={handleTap}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Image */}
      <img
        ref={imageRef}
        src={imageSrc}
        alt={alt}
        className={cn(
          'max-w-full max-h-full object-contain',
          'pointer-events-none',
          !isImageLoaded && 'opacity-0'
        )}
        style={transformStyle}
        onLoad={() => setIsImageLoaded(true)}
        draggable={false}
      />

      {/* Loading placeholder */}
      {!isImageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
        </div>
      )}

      {/* Zoom Controls */}
      {enableZoom && isImageLoaded && (
        <div
          className={cn(
            'absolute bottom-4 left-1/2 -translate-x-1/2 z-10',
            'flex items-center gap-2 px-3 py-2 rounded-full',
            'bg-black/60 backdrop-blur-sm shadow-lg'
          )}
        >
          {/* Zoom Out Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              zoomOut();
            }}
            disabled={!canZoomOut}
            className={cn(
              'w-11 h-11 flex items-center justify-center rounded-full',
              'text-white transition-colors',
              'hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white',
              !canZoomOut && 'opacity-40 cursor-not-allowed hover:bg-transparent'
            )}
            aria-label="Zoom out"
            aria-disabled={!canZoomOut}
          >
            <ZoomOut className="w-5 h-5" />
          </button>

          {/* Zoom Level Indicator */}
          <span
            className="min-w-[48px] text-center text-sm font-medium text-white"
            aria-live="polite"
          >
            {zoomPercentage}%
          </span>

          {/* Zoom In Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              zoomIn();
            }}
            disabled={!canZoomIn}
            className={cn(
              'w-11 h-11 flex items-center justify-center rounded-full',
              'text-white transition-colors',
              'hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white',
              !canZoomIn && 'opacity-40 cursor-not-allowed hover:bg-transparent'
            )}
            aria-label="Zoom in"
            aria-disabled={!canZoomIn}
          >
            <ZoomIn className="w-5 h-5" />
          </button>

          {/* Reset Button */}
          {isZoomed && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                resetZoom();
              }}
              className={cn(
                'w-11 h-11 flex items-center justify-center rounded-full',
                'text-white transition-colors',
                'hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white'
              )}
              aria-label="Reset zoom"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default PhotoViewer;
