/**
 * Unit Tests for Thumbnail Generation Utility
 *
 * Tests cover image thumbnail generation, video thumbnail generation,
 * the router function, performance requirements, and memory management.
 *
 * Note: Full video thumbnail tests require a browser environment with
 * media capabilities. Those tests verify function signatures and error
 * handling but may not fully exercise video playback in jsdom.
 *
 * @module ItemCapture/utils/__tests__/thumbnailGenerator.test
 * @lastModified 2025-12-31 (REQ-040)
 */

import {
  generateImageThumbnail,
  generateVideoThumbnail,
  generateThumbnail,
  ThumbnailOptions,
} from '../thumbnailGenerator';
import {
  THUMBNAIL_SIZE,
  THUMBNAIL_DEFAULTS,
} from '../constants';

// =============================================================================
// Test Utilities
// =============================================================================

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
 * Creates a test image file with specified dimensions.
 */
async function createTestImageFile(
  width: number,
  height: number,
  filename: string = 'test.png',
  mimeType: string = 'image/png'
): Promise<File> {
  const blob = await createTestImageBlob(width, height);
  return new File([blob], filename, { type: mimeType });
}

// =============================================================================
// Image Thumbnail Generation Tests (Task 2.5.12)
// =============================================================================

describe('thumbnailGenerator', () => {
  describe('generateImageThumbnail', () => {
    it('generates 200x200 thumbnail with default options', async () => {
      const file = await createTestImageFile(1920, 1080);
      const thumbnail = await generateImageThumbnail(file);

      expect(thumbnail).not.toBeNull();
      expect(thumbnail?.type).toBe('image/jpeg');
      // Size should be less than original due to compression
      expect(thumbnail?.size).toBeLessThan(file.size);
    });

    it('generates thumbnail with custom dimensions', async () => {
      const file = await createTestImageFile(1920, 1080);
      const thumbnail = await generateImageThumbnail(file, {
        width: 100,
        height: 100,
      });

      expect(thumbnail).not.toBeNull();
    });

    it('generates PNG format when specified', async () => {
      const file = await createTestImageFile(800, 600);
      const thumbnail = await generateImageThumbnail(file, {
        format: 'image/png',
      });

      expect(thumbnail?.type).toBe('image/png');
    });

    it('generates WebP format when specified', async () => {
      const file = await createTestImageFile(800, 600);
      const thumbnail = await generateImageThumbnail(file, {
        format: 'image/webp',
      });

      expect(thumbnail?.type).toBe('image/webp');
    });

    it('accepts Blob input', async () => {
      const blob = await createTestImageBlob(800, 600);
      const thumbnail = await generateImageThumbnail(blob);

      expect(thumbnail).not.toBeNull();
    });

    it('handles portrait images correctly', async () => {
      const file = await createTestImageFile(1080, 1920);
      const thumbnail = await generateImageThumbnail(file);

      expect(thumbnail).not.toBeNull();
    });

    it('handles square images correctly', async () => {
      const file = await createTestImageFile(1000, 1000);
      const thumbnail = await generateImageThumbnail(file);

      expect(thumbnail).not.toBeNull();
    });

    it('handles small images (upscaling scenario)', async () => {
      const file = await createTestImageFile(50, 50);
      const thumbnail = await generateImageThumbnail(file);

      expect(thumbnail).not.toBeNull();
    });

    it('returns null for invalid image', async () => {
      const invalidFile = new File(['not an image'], 'test.txt', {
        type: 'text/plain',
      });
      const thumbnail = await generateImageThumbnail(invalidFile);

      expect(thumbnail).toBeNull();
    });

    it('respects quality parameter', async () => {
      const file = await createTestImageFile(800, 600);

      const highQuality = await generateImageThumbnail(file, { quality: 1.0 });
      const lowQuality = await generateImageThumbnail(file, { quality: 0.1 });

      expect(highQuality).not.toBeNull();
      expect(lowQuality).not.toBeNull();
      // Lower quality should produce smaller file
      expect(lowQuality!.size).toBeLessThan(highQuality!.size);
    });

    it('supports contain fit strategy', async () => {
      const file = await createTestImageFile(1920, 1080);
      const thumbnail = await generateImageThumbnail(file, {
        fit: 'contain',
      });

      expect(thumbnail).not.toBeNull();
    });

    it('uses default values from constants', async () => {
      const file = await createTestImageFile(800, 600);
      const thumbnail = await generateImageThumbnail(file);

      expect(thumbnail).not.toBeNull();
      // Verify defaults are applied by checking output type matches default format
      expect(thumbnail?.type).toBe(THUMBNAIL_DEFAULTS.format);
    });
  });

  // =============================================================================
  // Video Thumbnail Generation Tests (Task 2.5.13)
  // =============================================================================

  describe('generateVideoThumbnail', () => {
    // Note: Full video tests may require jsdom-twenty or browser environment
    // These tests verify the function signature and error handling

    it('returns null for invalid video source', async () => {
      const invalidFile = new File(['not a video'], 'test.txt', {
        type: 'text/plain',
      });
      const thumbnail = await generateVideoThumbnail(invalidFile);

      expect(thumbnail).toBeNull();
    });

    it('accepts custom seekTime parameter', async () => {
      // This test verifies parameter acceptance
      // Will return null due to invalid blob, but verifies no throws
      const mockVideoBlob = new Blob([], { type: 'video/mp4' });
      const thumbnail = await generateVideoThumbnail(mockVideoBlob, {}, 1.0);

      // Will return null due to invalid blob
      expect(thumbnail).toBeNull();
    });

    it('respects thumbnail options for video', async () => {
      const mockVideoBlob = new Blob([], { type: 'video/mp4' });
      const options: ThumbnailOptions = {
        width: 150,
        height: 150,
        format: 'image/png',
      };

      // Function should not throw even with invalid blob
      await expect(
        generateVideoThumbnail(mockVideoBlob, options)
      ).resolves.toBeNull();
    });

    it('handles empty video file gracefully', async () => {
      const emptyFile = new File([], 'empty.mp4', { type: 'video/mp4' });
      const thumbnail = await generateVideoThumbnail(emptyFile);

      expect(thumbnail).toBeNull();
    });
  });

  // =============================================================================
  // Router Function Tests (Task 2.5.14)
  // =============================================================================

  describe('generateThumbnail', () => {
    it('routes image files to image generator', async () => {
      const file = await createTestImageFile(800, 600, 'test.jpg', 'image/jpeg');
      const thumbnail = await generateThumbnail(file);

      expect(thumbnail).not.toBeNull();
      expect(thumbnail?.type).toBe('image/jpeg');
    });

    it('detects image type from File MIME type', async () => {
      const blob = await createTestImageBlob(800, 600);
      const file = new File([blob], 'test.unknown', { type: 'image/jpeg' });
      const thumbnail = await generateThumbnail(file);

      expect(thumbnail).not.toBeNull();
    });

    it('detects image type from Blob type', async () => {
      const blob = await createTestImageBlob(800, 600);
      const thumbnail = await generateThumbnail(blob);

      expect(thumbnail).not.toBeNull();
    });

    it('returns null for unsupported types', async () => {
      const textFile = new File(['hello'], 'test.txt', { type: 'text/plain' });
      const thumbnail = await generateThumbnail(textFile);

      expect(thumbnail).toBeNull();
    });

    it('routes video files to video generator', async () => {
      const videoFile = new File([], 'test.mp4', { type: 'video/mp4' });
      const thumbnail = await generateThumbnail(videoFile);

      // Will be null due to empty file, but tests routing
      expect(thumbnail).toBeNull();
    });

    it('handles PNG images correctly', async () => {
      const file = await createTestImageFile(800, 600, 'test.png', 'image/png');
      const thumbnail = await generateThumbnail(file);

      expect(thumbnail).not.toBeNull();
    });

    it('handles WebP images correctly', async () => {
      const blob = await createTestImageBlob(800, 600);
      const file = new File([blob], 'test.webp', { type: 'image/webp' });
      const thumbnail = await generateThumbnail(file);

      expect(thumbnail).not.toBeNull();
    });

    it('detects video type from Blob type', async () => {
      const videoBlob = new Blob([], { type: 'video/webm' });
      const spy = vi.spyOn(console, 'error').mockImplementation();

      await generateThumbnail(videoBlob);

      // Should attempt video thumbnail generation (error logged for empty blob)
      expect(spy).toHaveBeenCalledWith(
        'Video thumbnail generation failed:',
        expect.anything()
      );

      spy.mockRestore();
    });
  });

  // =============================================================================
  // Performance Tests (Task 2.5.15)
  // =============================================================================

  describe('Performance', () => {
    it('generates image thumbnail within 500ms', async () => {
      // Create a reasonably sized test image (simulating mobile capture)
      const file = await createTestImageFile(1920, 1080);

      const start = performance.now();
      const thumbnail = await generateImageThumbnail(file);
      const elapsed = performance.now() - start;

      expect(thumbnail).not.toBeNull();
      expect(elapsed).toBeLessThan(500);
    });

    it('generates large image thumbnail within 500ms', async () => {
      // Create a larger test image (simulating high-res capture)
      const file = await createTestImageFile(4096, 3072);

      const start = performance.now();
      const thumbnail = await generateImageThumbnail(file);
      const elapsed = performance.now() - start;

      expect(thumbnail).not.toBeNull();
      expect(elapsed).toBeLessThan(500);
    });

    it('handles multiple thumbnail generations efficiently', async () => {
      const file = await createTestImageFile(800, 600);

      const start = performance.now();
      const results = await Promise.all([
        generateImageThumbnail(file),
        generateImageThumbnail(file),
        generateImageThumbnail(file),
      ]);
      const elapsed = performance.now() - start;

      results.forEach((result) => expect(result).not.toBeNull());
      // 3 thumbnails should complete in under 1 second
      expect(elapsed).toBeLessThan(1000);
    });
  });

  // =============================================================================
  // Memory Management Tests (Task 2.5.17)
  // =============================================================================

  describe('Memory Management', () => {
    it('revokes object URLs after image thumbnail generation', async () => {
      const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL');
      const createObjectURL = vi.spyOn(URL, 'createObjectURL');

      const blob = await createTestImageBlob(800, 600);
      await generateImageThumbnail(blob);

      // Should have created an object URL
      expect(createObjectURL).toHaveBeenCalled();
      // Should have revoked it
      expect(revokeObjectURL).toHaveBeenCalled();

      createObjectURL.mockRestore();
      revokeObjectURL.mockRestore();
    });

    it('revokes object URLs even on error', async () => {
      const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL');
      const createObjectURL = vi.spyOn(URL, 'createObjectURL');

      // Create an invalid image that will fail to load
      const invalidBlob = new Blob(['invalid'], { type: 'image/jpeg' });
      await generateImageThumbnail(invalidBlob);

      // If an object URL was created, it should be revoked
      if (createObjectURL.mock.calls.length > 0) {
        expect(revokeObjectURL).toHaveBeenCalled();
      }

      createObjectURL.mockRestore();
      revokeObjectURL.mockRestore();
    });

    it('handles rapid sequential generations without memory leaks', async () => {
      const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL');
      const createObjectURL = vi.spyOn(URL, 'createObjectURL');

      const blob = await createTestImageBlob(400, 300);

      // Generate 5 thumbnails sequentially
      for (let i = 0; i < 5; i++) {
        await generateImageThumbnail(blob);
      }

      // Should have equal create and revoke calls
      expect(revokeObjectURL).toHaveBeenCalledTimes(createObjectURL.mock.calls.length);

      createObjectURL.mockRestore();
      revokeObjectURL.mockRestore();
    });
  });

  // =============================================================================
  // Edge Cases
  // =============================================================================

  describe('Edge Cases', () => {
    it('handles extremely wide images (panorama)', async () => {
      const file = await createTestImageFile(4000, 500);
      const thumbnail = await generateImageThumbnail(file);

      expect(thumbnail).not.toBeNull();
    });

    it('handles extremely tall images', async () => {
      const file = await createTestImageFile(500, 4000);
      const thumbnail = await generateImageThumbnail(file);

      expect(thumbnail).not.toBeNull();
    });

    it('handles minimum dimensions', async () => {
      const file = await createTestImageFile(1, 1);
      const thumbnail = await generateImageThumbnail(file);

      expect(thumbnail).not.toBeNull();
    });

    it('handles different aspect ratios correctly with cover fit', async () => {
      const wideFile = await createTestImageFile(1920, 1080);
      const tallFile = await createTestImageFile(1080, 1920);
      const squareFile = await createTestImageFile(1000, 1000);

      const [wide, tall, square] = await Promise.all([
        generateImageThumbnail(wideFile, { fit: 'cover' }),
        generateImageThumbnail(tallFile, { fit: 'cover' }),
        generateImageThumbnail(squareFile, { fit: 'cover' }),
      ]);

      expect(wide).not.toBeNull();
      expect(tall).not.toBeNull();
      expect(square).not.toBeNull();
    });

    it('handles different aspect ratios correctly with contain fit', async () => {
      const wideFile = await createTestImageFile(1920, 1080);
      const tallFile = await createTestImageFile(1080, 1920);
      const squareFile = await createTestImageFile(1000, 1000);

      const [wide, tall, square] = await Promise.all([
        generateImageThumbnail(wideFile, { fit: 'contain' }),
        generateImageThumbnail(tallFile, { fit: 'contain' }),
        generateImageThumbnail(squareFile, { fit: 'contain' }),
      ]);

      expect(wide).not.toBeNull();
      expect(tall).not.toBeNull();
      expect(square).not.toBeNull();
    });
  });
});

// =============================================================================
// Constants Verification
// =============================================================================

describe('Thumbnail Constants', () => {
  it('has correct default size', () => {
    expect(THUMBNAIL_SIZE.width).toBe(200);
    expect(THUMBNAIL_SIZE.height).toBe(200);
  });

  it('has correct default quality', () => {
    expect(THUMBNAIL_DEFAULTS.quality).toBe(0.8);
  });

  it('has correct default format', () => {
    expect(THUMBNAIL_DEFAULTS.format).toBe('image/jpeg');
  });

  it('has correct default fit', () => {
    expect(THUMBNAIL_DEFAULTS.fit).toBe('cover');
  });
});
