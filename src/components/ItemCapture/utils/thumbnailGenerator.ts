/**
 * Thumbnail Generation Utility
 *
 * This module is lazy-loaded only when thumbnail generation is needed.
 * It should NOT be imported directly - use dynamic import:
 *
 * @example
 * const { generateThumbnail } = await import('@/components/ItemCapture/utils/thumbnailGenerator');
 * const thumbnail = await generateThumbnail(file);
 *
 * @module ItemCapture/utils/thumbnailGenerator
 * @lastModified 2025-12-31 (REQ-040)
 */

import {
  THUMBNAIL_SIZE,
  THUMBNAIL_DEFAULTS,
  THUMBNAIL_TIMEOUT,
  VIDEO_SEEK_TIME,
  SUPPORTED_IMAGE_TYPES,
  SUPPORTED_VIDEO_TYPES,
} from './constants';

// =============================================================================
// Type Definitions (Task 2.5.2)
// =============================================================================

/**
 * Configuration options for thumbnail generation
 */
export interface ThumbnailOptions {
  /** Target width in pixels (default: 200) */
  width?: number;
  /** Target height in pixels (default: 200) */
  height?: number;
  /** JPEG quality 0-1 (default: 0.8) */
  quality?: number;
  /** Output format (default: 'image/jpeg') */
  format?: 'image/jpeg' | 'image/png' | 'image/webp';
  /** Fit strategy: 'cover' crops to fill, 'contain' fits within bounds */
  fit?: 'cover' | 'contain';
}

/**
 * Internal interface for calculated fit dimensions
 */
interface FitDimensions {
  sourceX: number;
  sourceY: number;
  sourceWidth: number;
  sourceHeight: number;
  destX: number;
  destY: number;
  destWidth: number;
  destHeight: number;
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Calculates source crop and destination dimensions based on fit strategy.
 *
 * For 'cover': Scales source to completely fill target, cropping as needed.
 * For 'contain': Scales source to fit within target, may leave empty space.
 *
 * @param sourceWidth - Width of the source image/video
 * @param sourceHeight - Height of the source image/video
 * @param targetWidth - Target thumbnail width
 * @param targetHeight - Target thumbnail height
 * @param fit - Fit strategy ('cover' or 'contain')
 * @returns Calculated dimensions for drawImage
 */
function calculateFitDimensions(
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
  targetHeight: number,
  fit: 'cover' | 'contain'
): FitDimensions {
  const sourceAspect = sourceWidth / sourceHeight;
  const targetAspect = targetWidth / targetHeight;

  if (fit === 'cover') {
    // Scale to fill target completely, crop excess
    let cropWidth: number;
    let cropHeight: number;
    let cropX: number;
    let cropY: number;

    if (sourceAspect > targetAspect) {
      // Source is wider - crop sides
      cropHeight = sourceHeight;
      cropWidth = sourceHeight * targetAspect;
      cropX = (sourceWidth - cropWidth) / 2;
      cropY = 0;
    } else {
      // Source is taller - crop top/bottom
      cropWidth = sourceWidth;
      cropHeight = sourceWidth / targetAspect;
      cropX = 0;
      cropY = (sourceHeight - cropHeight) / 2;
    }

    return {
      sourceX: cropX,
      sourceY: cropY,
      sourceWidth: cropWidth,
      sourceHeight: cropHeight,
      destX: 0,
      destY: 0,
      destWidth: targetWidth,
      destHeight: targetHeight,
    };
  } else {
    // 'contain': Scale to fit within target, may letterbox
    let destWidth: number;
    let destHeight: number;

    if (sourceAspect > targetAspect) {
      // Source is wider - fit to width
      destWidth = targetWidth;
      destHeight = targetWidth / sourceAspect;
    } else {
      // Source is taller - fit to height
      destHeight = targetHeight;
      destWidth = targetHeight * sourceAspect;
    }

    // Center the destination
    const destX = (targetWidth - destWidth) / 2;
    const destY = (targetHeight - destHeight) / 2;

    return {
      sourceX: 0,
      sourceY: 0,
      sourceWidth: sourceWidth,
      sourceHeight: sourceHeight,
      destX,
      destY,
      destWidth,
      destHeight,
    };
  }
}

/**
 * Draws an image or video element to a canvas with the specified options.
 *
 * @param source - HTMLImageElement or HTMLVideoElement to draw
 * @param options - Required thumbnail options
 * @returns Canvas element with the drawn content, or null if context unavailable
 */
function drawToCanvas(
  source: HTMLImageElement | HTMLVideoElement,
  options: Required<ThumbnailOptions>
): HTMLCanvasElement | null {
  const canvas = document.createElement('canvas');
  canvas.width = options.width;
  canvas.height = options.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Get source dimensions
  const sourceWidth = source instanceof HTMLVideoElement
    ? source.videoWidth
    : source.naturalWidth;
  const sourceHeight = source instanceof HTMLVideoElement
    ? source.videoHeight
    : source.naturalHeight;

  // Handle edge case of zero dimensions
  if (sourceWidth === 0 || sourceHeight === 0) {
    return null;
  }

  // For 'contain' fit, fill background with white first
  if (options.fit === 'contain') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, options.width, options.height);
  }

  const dims = calculateFitDimensions(
    sourceWidth,
    sourceHeight,
    options.width,
    options.height,
    options.fit
  );

  ctx.drawImage(
    source,
    dims.sourceX,
    dims.sourceY,
    dims.sourceWidth,
    dims.sourceHeight,
    dims.destX,
    dims.destY,
    dims.destWidth,
    dims.destHeight
  );

  return canvas;
}

/**
 * Converts a canvas to a Blob using the specified format and quality.
 *
 * @param canvas - HTMLCanvasElement to convert
 * @param format - Output MIME type
 * @param quality - Quality setting for lossy formats (0-1)
 * @returns Promise resolving to Blob or null
 */
function canvasToBlob(
  canvas: HTMLCanvasElement,
  format: string,
  quality: number
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob),
      format,
      quality
    );
  });
}

/**
 * Loads an image from various source types with timeout handling.
 *
 * @param source - File, Blob, or URL string
 * @returns Promise resolving to loaded HTMLImageElement
 * @throws Error if load fails or times out
 */
function loadImage(source: File | Blob | string): Promise<HTMLImageElement> {
  let objectUrl: string | null = null;
  let src: string;

  if (source instanceof Blob) {
    objectUrl = URL.createObjectURL(source);
    src = objectUrl;
  } else {
    src = source;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error('Image load timeout'));
    }, THUMBNAIL_TIMEOUT);

    const cleanup = () => {
      clearTimeout(timeout);
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };

    img.onload = () => {
      cleanup();
      resolve(img);
    };

    img.onerror = () => {
      cleanup();
      reject(new Error('Image load failed'));
    };

    img.src = src;
  });
}

/**
 * Loads a video and seeks to a specific frame for thumbnail extraction.
 *
 * @param source - File, Blob, URL string, or HTMLVideoElement
 * @param seekTime - Time in seconds to seek to
 * @returns Promise resolving to video element at the specified frame
 * @throws Error if load fails or times out
 */
function loadVideoFrame(
  source: File | Blob | string | HTMLVideoElement,
  seekTime: number
): Promise<{ video: HTMLVideoElement; cleanup: () => void }> {
  let video: HTMLVideoElement;
  let objectUrl: string | null = null;
  let shouldCleanupVideo = false;

  if (source instanceof HTMLVideoElement) {
    video = source;
  } else {
    video = document.createElement('video');
    shouldCleanupVideo = true;

    if (source instanceof Blob) {
      objectUrl = URL.createObjectURL(source);
      video.src = objectUrl;
    } else {
      video.src = source;
    }
  }

  // Set video attributes for frame extraction
  video.muted = true;
  video.playsInline = true;
  video.preload = 'metadata';

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      doCleanup();
      reject(new Error('Video load timeout'));
    }, THUMBNAIL_TIMEOUT);

    const doCleanup = () => {
      clearTimeout(timeout);
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      if (shouldCleanupVideo) {
        video.pause();
        video.src = '';
        video.load();
      }
    };

    const handleLoadedMetadata = () => {
      // Clamp seekTime to video duration
      const targetTime = Math.min(seekTime, Math.max(0, video.duration - 0.1));
      video.currentTime = Math.max(0, targetTime);
    };

    const handleSeeked = () => {
      clearTimeout(timeout);
      // Return cleanup function for caller to invoke after drawing
      resolve({
        video,
        cleanup: () => {
          if (objectUrl) URL.revokeObjectURL(objectUrl);
          if (shouldCleanupVideo) {
            video.pause();
            video.src = '';
            video.load();
          }
        },
      });
    };

    const handleError = () => {
      doCleanup();
      reject(new Error('Video load failed'));
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata, { once: true });
    video.addEventListener('seeked', handleSeeked, { once: true });
    video.addEventListener('error', handleError, { once: true });

    // If source is already an HTMLVideoElement that's ready, trigger seek
    if (source instanceof HTMLVideoElement && video.readyState >= 1) {
      handleLoadedMetadata();
    }
  });
}

/**
 * Detects whether a source is an image, video, or unknown type.
 *
 * @param source - File, Blob, or URL string
 * @returns 'image', 'video', or 'unknown'
 */
function getMediaType(source: File | Blob | string): 'image' | 'video' | 'unknown' {
  let mimeType: string | undefined;

  if (source instanceof File) {
    mimeType = source.type;
  } else if (source instanceof Blob) {
    mimeType = source.type;
  } else {
    // For string URLs, try to infer from extension
    const ext = source.split('.').pop()?.toLowerCase().split('?')[0];
    const imageExts = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    const videoExts = ['mp4', 'webm', 'mov'];

    if (ext && imageExts.includes(ext)) return 'image';
    if (ext && videoExts.includes(ext)) return 'video';
    return 'unknown';
  }

  if (mimeType && SUPPORTED_IMAGE_TYPES.includes(mimeType as typeof SUPPORTED_IMAGE_TYPES[number])) {
    return 'image';
  }
  if (mimeType && SUPPORTED_VIDEO_TYPES.includes(mimeType as typeof SUPPORTED_VIDEO_TYPES[number])) {
    return 'video';
  }
  return 'unknown';
}

/**
 * Merges user options with defaults to create complete options object.
 */
function mergeOptions(options?: ThumbnailOptions): Required<ThumbnailOptions> {
  return {
    width: options?.width ?? THUMBNAIL_SIZE.width,
    height: options?.height ?? THUMBNAIL_SIZE.height,
    quality: options?.quality ?? THUMBNAIL_DEFAULTS.quality,
    format: options?.format ?? THUMBNAIL_DEFAULTS.format,
    fit: options?.fit ?? THUMBNAIL_DEFAULTS.fit,
  };
}

// =============================================================================
// Public API
// =============================================================================

/**
 * Generates a thumbnail from an image source.
 *
 * @param imageSource - File, Blob, or URL string of the image
 * @param options - Optional thumbnail configuration
 * @returns Promise resolving to thumbnail Blob or null on failure
 *
 * @example
 * const thumbnail = await generateImageThumbnail(imageFile);
 * const customThumbnail = await generateImageThumbnail(imageUrl, {
 *   width: 150,
 *   height: 150,
 *   format: 'image/png'
 * });
 */
export async function generateImageThumbnail(
  imageSource: File | Blob | string,
  options?: ThumbnailOptions
): Promise<Blob | null> {
  const opts = mergeOptions(options);

  try {
    const img = await loadImage(imageSource);
    const canvas = drawToCanvas(img, opts);
    if (!canvas) return null;
    return canvasToBlob(canvas, opts.format, opts.quality);
  } catch (error) {
    console.error('Image thumbnail generation failed:', error);
    return null;
  }
}

/**
 * Generates a thumbnail from a video source by extracting a frame.
 *
 * @param videoSource - File, Blob, URL string, or HTMLVideoElement
 * @param options - Optional thumbnail configuration
 * @param seekTime - Time in seconds to extract frame from (default: 0.5)
 * @returns Promise resolving to thumbnail Blob or null on failure
 *
 * @example
 * const thumbnail = await generateVideoThumbnail(videoFile);
 * const customThumbnail = await generateVideoThumbnail(videoBlob, {
 *   width: 150,
 *   height: 150
 * }, 2.0); // Extract frame at 2 seconds
 */
export async function generateVideoThumbnail(
  videoSource: File | Blob | string | HTMLVideoElement,
  options?: ThumbnailOptions,
  seekTime?: number
): Promise<Blob | null> {
  const opts = mergeOptions(options);
  const targetTime = seekTime ?? VIDEO_SEEK_TIME;

  try {
    const { video, cleanup } = await loadVideoFrame(videoSource, targetTime);
    const canvas = drawToCanvas(video, opts);
    cleanup();

    if (!canvas) return null;
    return canvasToBlob(canvas, opts.format, opts.quality);
  } catch (error) {
    console.error('Video thumbnail generation failed:', error);
    return null;
  }
}

/**
 * Generates a thumbnail from any supported media source.
 * Automatically detects the media type and routes to the appropriate generator.
 *
 * @param source - File, Blob, or URL string of the media
 * @param options - Optional thumbnail configuration
 * @returns Promise resolving to thumbnail Blob or null on failure
 *
 * @example
 * // Auto-detects type from MIME type or file extension
 * const thumbnail = await generateThumbnail(mediaFile);
 *
 * // Works with URLs too (infers type from extension)
 * const thumbnail = await generateThumbnail('https://example.com/photo.jpg');
 */
export async function generateThumbnail(
  source: File | Blob | string,
  options?: ThumbnailOptions
): Promise<Blob | null> {
  const mediaType = getMediaType(source);

  switch (mediaType) {
    case 'image':
      return generateImageThumbnail(source, options);
    case 'video':
      return generateVideoThumbnail(source, options);
    default:
      console.error('Unsupported media type for thumbnail generation');
      return null;
  }
}
