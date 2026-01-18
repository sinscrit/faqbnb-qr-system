/**
 * Rotation Utility Functions
 *
 * Canvas-based utility functions for rotating images in 90-degree increments.
 * Provides image rotation processing and calculation helpers.
 *
 * @module ItemCapture/editors/rotationUtils
 * @see docs/REQ-048-implement-imagerotator-detailed.md
 * @lastModified 2025-12-31
 */

// =============================================================================
// Type Definitions
// =============================================================================

/**
 * Rotation in 90-degree increments.
 * Limited to these values for consistent behavior.
 */
export type RotationDegrees = 0 | 90 | 180 | 270;

// =============================================================================
// Error Messages
// =============================================================================

export const ROTATION_ERROR_MESSAGES = {
  IMAGE_LOAD_FAILED: 'Failed to load image. Please try again.',
  ROTATION_FAILED: 'Failed to rotate image. Please try again.',
  CANVAS_UNAVAILABLE: 'Your browser does not support image editing.',
  MEMORY_ERROR: 'Not enough memory to process image. Try closing other tabs.',
  BLOB_CREATION_FAILED: 'Failed to create image output. Please try again.',
} as const;

// =============================================================================
// Rotation Calculation Functions
// =============================================================================

/**
 * Calculate the next rotation value based on direction.
 *
 * @param current - Current rotation in degrees (0, 90, 180, or 270)
 * @param direction - Direction to rotate ('left' for counter-clockwise, 'right' for clockwise)
 * @returns The new rotation value
 *
 * @example
 * calculateNextRotation(0, 'right') // Returns 90
 * calculateNextRotation(270, 'right') // Returns 0 (wraps around)
 * calculateNextRotation(0, 'left') // Returns 270
 */
export function calculateNextRotation(
  current: RotationDegrees,
  direction: 'left' | 'right'
): RotationDegrees {
  if (direction === 'right') {
    return ((current + 90) % 360) as RotationDegrees;
  } else {
    return ((current - 90 + 360) % 360) as RotationDegrees;
  }
}

// =============================================================================
// Image Rotation Functions
// =============================================================================

/**
 * Rotate an image by the specified degrees using canvas.
 *
 * Uses HTML5 Canvas API to perform actual pixel rotation of the image.
 * For 90 or 270 degrees, the canvas dimensions are swapped.
 *
 * @param source - Source image as Blob
 * @param degrees - Rotation in degrees (0, 90, 180, or 270)
 * @param outputFormat - Output image format (default: 'image/jpeg')
 * @param quality - Output quality 0-1 (default: 0.92)
 * @returns Promise resolving to the rotated image as Blob
 *
 * @throws Error if image loading fails
 * @throws Error if canvas context is unavailable
 * @throws Error if blob creation fails
 *
 * @example
 * const rotatedBlob = await rotateImage(imageBlob, 90, 'image/jpeg', 0.92);
 */
export async function rotateImage(
  source: Blob,
  degrees: RotationDegrees,
  outputFormat: 'image/jpeg' | 'image/png' = 'image/jpeg',
  quality: number = 0.92
): Promise<Blob> {
  // If no rotation needed, return original
  if (degrees === 0) {
    return source;
  }

  // Create object URL for the source blob
  const objectUrl = URL.createObjectURL(source);

  try {
    // Load image from blob
    const image = await loadImage(objectUrl);

    // Create canvas with rotated dimensions
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error(ROTATION_ERROR_MESSAGES.CANVAS_UNAVAILABLE);
    }

    // For 90 or 270 degrees, swap width and height
    const swapDimensions = degrees === 90 || degrees === 270;
    canvas.width = swapDimensions ? image.height : image.width;
    canvas.height = swapDimensions ? image.width : image.height;

    // Move to center, rotate, and draw image
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((degrees * Math.PI) / 180);
    ctx.drawImage(image, -image.width / 2, -image.height / 2);

    // Convert canvas to blob
    const rotatedBlob = await canvasToBlob(canvas, outputFormat, quality);

    return rotatedBlob;
  } finally {
    // Always clean up the object URL
    URL.revokeObjectURL(objectUrl);
  }
}

/**
 * Load an image from a URL.
 *
 * @param url - URL of the image to load
 * @returns Promise resolving to the loaded HTMLImageElement
 *
 * @throws Error if image loading fails
 */
function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      resolve(img);
    };

    img.onerror = () => {
      reject(new Error(ROTATION_ERROR_MESSAGES.IMAGE_LOAD_FAILED));
    };

    // Required for cross-origin images
    img.crossOrigin = 'anonymous';
    img.src = url;
  });
}

/**
 * Convert canvas to Blob.
 *
 * @param canvas - Canvas element to convert
 * @param format - Output format
 * @param quality - Output quality (0-1)
 * @returns Promise resolving to Blob
 *
 * @throws Error if blob creation fails
 */
function canvasToBlob(
  canvas: HTMLCanvasElement,
  format: string,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error(ROTATION_ERROR_MESSAGES.BLOB_CREATION_FAILED));
        }
      },
      format,
      quality
    );
  });
}

/**
 * Convert degrees to radians.
 *
 * @param degrees - Angle in degrees
 * @returns Angle in radians
 */
export function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}
