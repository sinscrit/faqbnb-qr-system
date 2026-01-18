/**
 * Unit tests for cropUtils utility functions
 *
 * @module ItemCapture/editors/__tests__/cropUtils.test
 * @see docs/REQ-047-implement-imagecropper-detailed.md
 * @lastModified 2025-12-31
 */

import { executeCrop, calculateScaleFactors, isValidCrop } from '../cropUtils';
import type { PixelCrop } from 'react-image-crop';

// =============================================================================
// Test Utilities
// =============================================================================

/**
 * Creates a mock HTMLImageElement with specified dimensions
 */
function createMockImage(
  width: number,
  height: number,
  naturalWidth: number,
  naturalHeight: number
): HTMLImageElement {
  const img = document.createElement('img');

  // Mock displayed dimensions (CSS-constrained)
  Object.defineProperty(img, 'width', { value: width, writable: false });
  Object.defineProperty(img, 'height', { value: height, writable: false });

  // Mock natural (original) dimensions
  Object.defineProperty(img, 'naturalWidth', {
    value: naturalWidth,
    writable: false,
  });
  Object.defineProperty(img, 'naturalHeight', {
    value: naturalHeight,
    writable: false,
  });

  return img;
}

/**
 * Creates a test image blob with specified dimensions and color.
 */
async function createTestImageBlob(
  width: number,
  height: number,
  color: string = '#FF0000'
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), 'image/png');
  });
}

/**
 * Creates a real image element from a blob and waits for it to load
 */
async function createRealImageFromBlob(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = document.createElement('img');
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };

    img.src = url;
  });
}

/**
 * Creates a valid PixelCrop object for testing
 */
function createTestCrop(
  x: number = 10,
  y: number = 10,
  width: number = 100,
  height: number = 100
): PixelCrop {
  return {
    unit: 'px',
    x,
    y,
    width,
    height,
  };
}

// =============================================================================
// executeCrop Tests (Task 13)
// =============================================================================

describe('cropUtils', () => {
  describe('executeCrop', () => {
    it('returns a valid Blob for normal inputs', async () => {
      const blob = await createTestImageBlob(400, 300);
      const image = await createRealImageFromBlob(blob);
      const crop = createTestCrop(10, 10, 100, 100);

      const result = await executeCrop(image, crop, 'image/jpeg', 0.92);

      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe('image/jpeg');
      expect(result.size).toBeGreaterThan(0);
    });

    it('produces JPEG output when format is image/jpeg', async () => {
      const blob = await createTestImageBlob(200, 200);
      const image = await createRealImageFromBlob(blob);
      const crop = createTestCrop(0, 0, 100, 100);

      const result = await executeCrop(image, crop, 'image/jpeg', 0.9);

      expect(result.type).toBe('image/jpeg');
    });

    it('produces PNG output when format is image/png', async () => {
      const blob = await createTestImageBlob(200, 200);
      const image = await createRealImageFromBlob(blob);
      const crop = createTestCrop(0, 0, 100, 100);

      const result = await executeCrop(image, crop, 'image/png', 1.0);

      expect(result.type).toBe('image/png');
    });

    it('produces WebP output when format is image/webp', async () => {
      const blob = await createTestImageBlob(200, 200);
      const image = await createRealImageFromBlob(blob);
      const crop = createTestCrop(0, 0, 100, 100);

      const result = await executeCrop(image, crop, 'image/webp', 0.9);

      expect(result.type).toBe('image/webp');
    });

    it('respects quality parameter (lower quality = smaller size)', async () => {
      const blob = await createTestImageBlob(400, 400);
      const image = await createRealImageFromBlob(blob);
      const crop = createTestCrop(0, 0, 200, 200);

      const highQuality = await executeCrop(image, crop, 'image/jpeg', 1.0);
      const lowQuality = await executeCrop(image, crop, 'image/jpeg', 0.1);

      expect(lowQuality.size).toBeLessThan(highQuality.size);
    });

    it('correctly crops a portion of the image', async () => {
      // Create a 2-color image: left half red, right half blue
      const canvas = document.createElement('canvas');
      canvas.width = 200;
      canvas.height = 100;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#FF0000';
      ctx.fillRect(0, 0, 100, 100);
      ctx.fillStyle = '#0000FF';
      ctx.fillRect(100, 0, 100, 100);

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/png');
      });

      const image = await createRealImageFromBlob(blob);

      // Crop just the left (red) side
      const crop = createTestCrop(0, 0, 100, 100);
      const result = await executeCrop(image, crop, 'image/png', 1.0);

      expect(result).toBeInstanceOf(Blob);
      expect(result.size).toBeGreaterThan(0);
    });

    it('handles crops at image edges', async () => {
      const blob = await createTestImageBlob(200, 200);
      const image = await createRealImageFromBlob(blob);

      // Crop at bottom-right corner
      const crop = createTestCrop(100, 100, 100, 100);
      const result = await executeCrop(image, crop, 'image/jpeg', 0.9);

      expect(result).toBeInstanceOf(Blob);
    });

    it('handles small crop dimensions', async () => {
      const blob = await createTestImageBlob(200, 200);
      const image = await createRealImageFromBlob(blob);

      const crop = createTestCrop(0, 0, 10, 10);
      const result = await executeCrop(image, crop, 'image/jpeg', 0.9);

      expect(result).toBeInstanceOf(Blob);
    });

    it('handles crop covering entire image', async () => {
      const blob = await createTestImageBlob(200, 200);
      const image = await createRealImageFromBlob(blob);

      const crop = createTestCrop(0, 0, 200, 200);
      const result = await executeCrop(image, crop, 'image/jpeg', 0.9);

      expect(result).toBeInstanceOf(Blob);
    });
  });

  // =============================================================================
  // calculateScaleFactors Tests
  // =============================================================================

  describe('calculateScaleFactors', () => {
    it('returns 1:1 scale for image displayed at natural size', () => {
      const img = createMockImage(800, 600, 800, 600);
      const { scaleX, scaleY } = calculateScaleFactors(img);

      expect(scaleX).toBe(1);
      expect(scaleY).toBe(1);
    });

    it('returns 2x scale when natural is twice displayed', () => {
      const img = createMockImage(400, 300, 800, 600);
      const { scaleX, scaleY } = calculateScaleFactors(img);

      expect(scaleX).toBe(2);
      expect(scaleY).toBe(2);
    });

    it('returns 0.5x scale when displayed is twice natural', () => {
      const img = createMockImage(1600, 1200, 800, 600);
      const { scaleX, scaleY } = calculateScaleFactors(img);

      expect(scaleX).toBe(0.5);
      expect(scaleY).toBe(0.5);
    });

    it('handles non-uniform scaling', () => {
      const img = createMockImage(200, 100, 800, 600);
      const { scaleX, scaleY } = calculateScaleFactors(img);

      expect(scaleX).toBe(4);
      expect(scaleY).toBe(6);
    });

    it('handles very small displayed dimensions', () => {
      const img = createMockImage(50, 50, 4000, 3000);
      const { scaleX, scaleY } = calculateScaleFactors(img);

      expect(scaleX).toBe(80);
      expect(scaleY).toBe(60);
    });
  });

  // =============================================================================
  // isValidCrop Tests
  // =============================================================================

  describe('isValidCrop', () => {
    it('returns true for valid crop with positive dimensions', () => {
      const crop = createTestCrop(0, 0, 100, 100);
      expect(isValidCrop(crop)).toBe(true);
    });

    it('returns true for minimum dimensions (1x1)', () => {
      const crop = createTestCrop(0, 0, 1, 1);
      expect(isValidCrop(crop)).toBe(true);
    });

    it('returns false for null crop', () => {
      expect(isValidCrop(null)).toBe(false);
    });

    it('returns false for undefined crop', () => {
      expect(isValidCrop(undefined)).toBe(false);
    });

    it('returns false when width is 0', () => {
      const crop = createTestCrop(0, 0, 0, 100);
      expect(isValidCrop(crop)).toBe(false);
    });

    it('returns false when height is 0', () => {
      const crop = createTestCrop(0, 0, 100, 0);
      expect(isValidCrop(crop)).toBe(false);
    });

    it('respects custom minWidth parameter', () => {
      const crop = createTestCrop(0, 0, 50, 100);
      expect(isValidCrop(crop, 50)).toBe(true);
      expect(isValidCrop(crop, 51)).toBe(false);
    });

    it('respects custom minHeight parameter', () => {
      const crop = createTestCrop(0, 0, 100, 50);
      expect(isValidCrop(crop, 1, 50)).toBe(true);
      expect(isValidCrop(crop, 1, 51)).toBe(false);
    });

    it('validates both minWidth and minHeight together', () => {
      const crop = createTestCrop(0, 0, 50, 50);
      expect(isValidCrop(crop, 50, 50)).toBe(true);
      expect(isValidCrop(crop, 51, 50)).toBe(false);
      expect(isValidCrop(crop, 50, 51)).toBe(false);
    });
  });

  // =============================================================================
  // Edge Cases
  // =============================================================================

  describe('Edge Cases', () => {
    it('handles panoramic (very wide) images', async () => {
      const blob = await createTestImageBlob(2000, 200);
      const image = await createRealImageFromBlob(blob);

      const crop = createTestCrop(500, 0, 1000, 200);
      const result = await executeCrop(image, crop, 'image/jpeg', 0.9);

      expect(result).toBeInstanceOf(Blob);
    });

    it('handles portrait (very tall) images', async () => {
      const blob = await createTestImageBlob(200, 2000);
      const image = await createRealImageFromBlob(blob);

      const crop = createTestCrop(0, 500, 200, 1000);
      const result = await executeCrop(image, crop, 'image/jpeg', 0.9);

      expect(result).toBeInstanceOf(Blob);
    });

    it('handles square crop from non-square image', async () => {
      const blob = await createTestImageBlob(800, 600);
      const image = await createRealImageFromBlob(blob);

      const crop = createTestCrop(100, 100, 400, 400);
      const result = await executeCrop(image, crop, 'image/jpeg', 0.9);

      expect(result).toBeInstanceOf(Blob);
    });

    it('handles 16:9 crop from 4:3 image', async () => {
      const blob = await createTestImageBlob(800, 600); // 4:3
      const image = await createRealImageFromBlob(blob);

      // Create a 16:9 crop (width * 9/16 = height)
      const crop = createTestCrop(0, 100, 800, 450); // 800 * 9/16 = 450
      const result = await executeCrop(image, crop, 'image/jpeg', 0.9);

      expect(result).toBeInstanceOf(Blob);
    });

    it('handles 1:1 crop from wide image', async () => {
      const blob = await createTestImageBlob(1000, 400);
      const image = await createRealImageFromBlob(blob);

      const crop = createTestCrop(300, 0, 400, 400);
      const result = await executeCrop(image, crop, 'image/jpeg', 0.9);

      expect(result).toBeInstanceOf(Blob);
    });
  });

  // =============================================================================
  // Performance Tests
  // =============================================================================

  describe('Performance', () => {
    it('executes crop within 100ms for standard images', async () => {
      const blob = await createTestImageBlob(800, 600);
      const image = await createRealImageFromBlob(blob);
      const crop = createTestCrop(0, 0, 400, 300);

      const start = performance.now();
      await executeCrop(image, crop, 'image/jpeg', 0.9);
      const elapsed = performance.now() - start;

      expect(elapsed).toBeLessThan(100);
    });

    it('handles multiple sequential crops efficiently', async () => {
      const blob = await createTestImageBlob(400, 400);
      const image = await createRealImageFromBlob(blob);
      const crops = [
        createTestCrop(0, 0, 200, 200),
        createTestCrop(100, 100, 200, 200),
        createTestCrop(200, 200, 200, 200),
      ];

      const start = performance.now();
      for (const crop of crops) {
        await executeCrop(image, crop, 'image/jpeg', 0.9);
      }
      const elapsed = performance.now() - start;

      // 3 crops should complete in under 300ms
      expect(elapsed).toBeLessThan(300);
    });
  });
});
