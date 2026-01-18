/**
 * Canvas-Based Crop Execution Utility
 *
 * This module provides utilities for executing image crop operations using the
 * HTML Canvas API, producing Blob outputs at the correct scale.
 *
 * @module ItemCapture/editors/cropUtils
 * @see docs/REQ-047-implement-imagecropper-detailed.md
 * @lastModified 2025-12-31
 */

import type { PixelCrop } from 'react-image-crop';

/**
 * Maximum dimension for output image to prevent memory issues on mobile devices.
 * Images larger than this will be proportionally scaled down.
 */
const MAX_OUTPUT_DIMENSION = 4096;

/**
 * Executes a crop operation on an image using the Canvas API.
 *
 * This function:
 * 1. Calculates scale factors between displayed and natural image dimensions
 * 2. Creates a canvas sized to the cropped area at natural scale
 * 3. Draws the cropped region from the source image
 * 4. Converts the canvas to a Blob with the specified format and quality
 *
 * @param image - The HTMLImageElement containing the source image
 * @param crop - The PixelCrop object defining the crop area (in displayed pixels)
 * @param outputFormat - The output image format ('image/jpeg', 'image/png', 'image/webp')
 * @param outputQuality - The output quality (0-1, only applies to jpeg/webp)
 * @returns Promise resolving to a Blob containing the cropped image
 * @throws Error if canvas context cannot be obtained or blob creation fails
 *
 * @example
 * ```typescript
 * const croppedBlob = await executeCrop(
 *   imageElement,
 *   { x: 10, y: 10, width: 100, height: 100, unit: 'px' },
 *   'image/jpeg',
 *   0.92
 * );
 * ```
 */
export async function executeCrop(
  image: HTMLImageElement,
  crop: PixelCrop,
  outputFormat: string,
  outputQuality: number
): Promise<Blob> {
  // Calculate scale factors between displayed and natural image size
  // The displayed size may differ from natural size due to CSS constraints
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  // Calculate the crop dimensions at natural scale
  let outputWidth = crop.width * scaleX;
  let outputHeight = crop.height * scaleY;

  // Scale down if the output would be too large (memory protection for mobile)
  let outputScale = 1;
  if (outputWidth > MAX_OUTPUT_DIMENSION || outputHeight > MAX_OUTPUT_DIMENSION) {
    outputScale = Math.min(
      MAX_OUTPUT_DIMENSION / outputWidth,
      MAX_OUTPUT_DIMENSION / outputHeight
    );
    outputWidth *= outputScale;
    outputHeight *= outputScale;
    console.info(
      `Scaling down cropped output from ${crop.width * scaleX}x${crop.height * scaleY} to ${Math.round(outputWidth)}x${Math.round(outputHeight)}`
    );
  }

  // Create canvas at the output size
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(outputWidth);
  canvas.height = Math.round(outputHeight);

  // Get 2D rendering context
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error(
      'Failed to get canvas 2D context. Your browser may not support this operation.'
    );
  }

  // For high-quality downscaling, use imageSmoothingQuality if available
  ctx.imageSmoothingEnabled = true;
  if ('imageSmoothingQuality' in ctx) {
    (ctx as CanvasRenderingContext2D & { imageSmoothingQuality: string }).imageSmoothingQuality = 'high';
  }

  // Draw the cropped region from the source image to the canvas
  // Using the 9-parameter version of drawImage for precise cropping:
  // drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
  ctx.drawImage(
    image,
    // Source rectangle (at natural scale)
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    // Destination rectangle (full canvas)
    0,
    0,
    canvas.width,
    canvas.height
  );

  // Convert canvas to blob using Promise wrapper
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, outputFormat, outputQuality);
  });

  if (!blob) {
    throw new Error(
      `Failed to create image blob. The ${outputFormat} format may not be supported by your browser.`
    );
  }

  return blob;
}

/**
 * Calculates the scale factors between displayed and natural image dimensions.
 * Useful for debugging or when you need to work with scaled coordinates.
 *
 * @param image - The HTMLImageElement to calculate scales for
 * @returns Object with scaleX and scaleY properties
 */
export function calculateScaleFactors(image: HTMLImageElement): {
  scaleX: number;
  scaleY: number;
} {
  return {
    scaleX: image.naturalWidth / image.width,
    scaleY: image.naturalHeight / image.height,
  };
}

/**
 * Validates that a crop region is valid (has positive dimensions).
 *
 * @param crop - The PixelCrop to validate
 * @param minWidth - Minimum allowed width (default: 1)
 * @param minHeight - Minimum allowed height (default: 1)
 * @returns True if the crop is valid
 */
export function isValidCrop(
  crop: PixelCrop | null | undefined,
  minWidth: number = 1,
  minHeight: number = 1
): boolean {
  if (!crop) return false;
  return crop.width >= minWidth && crop.height >= minHeight;
}

// Default export for convenience
export default executeCrop;
