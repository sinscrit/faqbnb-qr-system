/**
 * Unit Tests for ItemCapture Validation Functions
 *
 * Comprehensive tests for all validation functions in validation.ts.
 *
 * @module ItemCapture/utils/__tests__/validation.test
 * @see docs/REQ-052-create-validation-layer-detailed.md
 * @lastModified 2025-12-31 (REQ-052 Task 15)
 */

import {
  formatFileSize,
  parseFileSize,
  validateTitle,
  validateContentRequirement,
  validateFileSize,
  validateTotalSize,
  validateTextLength,
  validateImageCount,
  validateMimeType,
  validateItemCapture,
  getMediaTypeFromMime,
  calculateRemainingSize,
  calculateTotalSize,
  wouldExceedTotalSize,
} from '../validation';
import { CAPTURE_CONSTRAINTS, SUPPORTED_FORMATS } from '../constants';
import type { MediaItem, ItemMetadata } from '../../ItemCapture.types';

// =============================================================================
// Test Helpers
// =============================================================================

/**
 * Create a mock MediaItem for testing.
 */
function createMockMediaItem(
  overrides: Partial<MediaItem> = {}
): MediaItem {
  const size = overrides.file?.size ?? 1024 * 1024; // 1MB default
  return {
    id: overrides.id ?? 'test-id',
    type: overrides.type ?? 'image',
    file: overrides.file ?? new Blob([new ArrayBuffer(size)]) as File,
    order: overrides.order ?? 0,
    metadata: overrides.metadata ?? {
      mimeType: 'image/jpeg',
      fileSize: size,
      source: 'upload',
    },
    ...overrides,
  };
}

/**
 * Create a mock File with specified size.
 */
function createMockFile(size: number, type: string = 'image/jpeg'): File {
  const blob = new Blob([new ArrayBuffer(size)], { type });
  return new File([blob], 'test.jpg', { type });
}

/**
 * Create mock ItemMetadata for testing.
 */
function createMockMetadata(overrides: Partial<ItemMetadata> = {}): ItemMetadata {
  return {
    title: 'Test Title',
    ...overrides,
  };
}

// =============================================================================
// formatFileSize Tests
// =============================================================================

describe('formatFileSize', () => {
  it('returns "0 B" for 0 bytes', () => {
    expect(formatFileSize(0)).toBe('0 B');
  });

  it('formats bytes correctly', () => {
    expect(formatFileSize(512)).toBe('512 B');
    expect(formatFileSize(1)).toBe('1 B');
  });

  it('formats kilobytes correctly', () => {
    expect(formatFileSize(1024)).toBe('1 KB');
    expect(formatFileSize(1536)).toBe('1.5 KB');
    expect(formatFileSize(2048)).toBe('2 KB');
  });

  it('formats megabytes correctly', () => {
    expect(formatFileSize(1024 * 1024)).toBe('1 MB');
    expect(formatFileSize(1.5 * 1024 * 1024)).toBe('1.5 MB');
    expect(formatFileSize(100 * 1024 * 1024)).toBe('100 MB');
  });

  it('formats gigabytes correctly', () => {
    expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB');
    expect(formatFileSize(1.5 * 1024 * 1024 * 1024)).toBe('1.5 GB');
  });

  it('rounds to 1 decimal place', () => {
    expect(formatFileSize(1536)).toBe('1.5 KB');
    expect(formatFileSize(1587)).toBe('1.5 KB'); // rounds down
    expect(formatFileSize(1638)).toBe('1.6 KB'); // rounds up
  });
});

// =============================================================================
// parseFileSize Tests
// =============================================================================

describe('parseFileSize', () => {
  it('parses bytes correctly', () => {
    expect(parseFileSize('100B')).toBe(100);
    expect(parseFileSize('100 B')).toBe(100);
  });

  it('parses kilobytes correctly', () => {
    expect(parseFileSize('100KB')).toBe(102400);
    expect(parseFileSize('100 KB')).toBe(102400);
    expect(parseFileSize('100kb')).toBe(102400); // case insensitive
  });

  it('parses megabytes correctly', () => {
    expect(parseFileSize('100MB')).toBe(104857600);
    expect(parseFileSize('100 MB')).toBe(104857600);
    expect(parseFileSize('1.5MB')).toBe(1572864);
  });

  it('parses gigabytes correctly', () => {
    expect(parseFileSize('1GB')).toBe(1073741824);
    expect(parseFileSize('1.5GB')).toBe(1610612736);
  });

  it('returns 0 for invalid strings', () => {
    expect(parseFileSize('')).toBe(0);
    expect(parseFileSize('invalid')).toBe(0);
    expect(parseFileSize('100')).toBe(0); // no unit
    expect(parseFileSize('MB')).toBe(0); // no number
  });

  it('handles edge cases', () => {
    expect(parseFileSize('0MB')).toBe(0);
    expect(parseFileSize('0.5KB')).toBe(512);
  });
});

// =============================================================================
// validateTitle Tests
// =============================================================================

describe('validateTitle', () => {
  it('returns error for empty string', () => {
    const result = validateTitle('');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Title is required');
  });

  it('returns error for whitespace-only string', () => {
    const result = validateTitle('   ');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Title is required');
  });

  it('returns valid for non-empty title', () => {
    const result = validateTitle('Valid Title');
    expect(result.isValid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('returns error when title exceeds max length', () => {
    const longTitle = 'x'.repeat(CAPTURE_CONSTRAINTS.title.maxLength + 1);
    const result = validateTitle(longTitle);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('characters or less');
    expect(result.error).toContain('current: 201');
  });

  it('returns valid for title at max length', () => {
    const maxTitle = 'x'.repeat(CAPTURE_CONSTRAINTS.title.maxLength);
    const result = validateTitle(maxTitle);
    expect(result.isValid).toBe(true);
  });
});

// =============================================================================
// validateContentRequirement Tests
// =============================================================================

describe('validateContentRequirement', () => {
  it('returns error when both media and text are empty', () => {
    const result = validateContentRequirement([], '');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('At least one media item or text instructions');
  });

  it('returns error when media is empty and text is whitespace', () => {
    const result = validateContentRequirement([], '   ');
    expect(result.isValid).toBe(false);
  });

  it('returns valid when media exists but no text', () => {
    const mediaItems = [createMockMediaItem()];
    const result = validateContentRequirement(mediaItems, '');
    expect(result.isValid).toBe(true);
  });

  it('returns valid when text exists but no media', () => {
    const result = validateContentRequirement([], 'Some instructions');
    expect(result.isValid).toBe(true);
  });

  it('returns valid when both media and text exist', () => {
    const mediaItems = [createMockMediaItem()];
    const result = validateContentRequirement(mediaItems, 'Some instructions');
    expect(result.isValid).toBe(true);
  });
});

// =============================================================================
// validateFileSize Tests
// =============================================================================

describe('validateFileSize', () => {
  describe('video files', () => {
    it('validates video under limit successfully', () => {
      const file = createMockFile(50 * 1024 * 1024, 'video/mp4'); // 50 MB
      const result = validateFileSize(file, 'video');
      expect(result.isValid).toBe(true);
      expect(result.fileSize).toBe(50 * 1024 * 1024);
      expect(result.maxAllowed).toBe(CAPTURE_CONSTRAINTS.video.maxFileSize);
    });

    it('returns error for video over limit', () => {
      const file = createMockFile(150 * 1024 * 1024, 'video/mp4'); // 150 MB
      const result = validateFileSize(file, 'video');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('exceeds');
      expect(result.error).toContain('100 MB');
    });
  });

  describe('image files', () => {
    it('validates image under limit successfully', () => {
      const file = createMockFile(15 * 1024 * 1024, 'image/jpeg'); // 15 MB
      const result = validateFileSize(file, 'image');
      expect(result.isValid).toBe(true);
      expect(result.maxAllowed).toBe(CAPTURE_CONSTRAINTS.image.maxFileSize);
    });

    it('returns error for image over limit', () => {
      const file = createMockFile(25 * 1024 * 1024, 'image/jpeg'); // 25 MB
      const result = validateFileSize(file, 'image');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('exceeds');
    });
  });

  describe('PDF files', () => {
    it('validates PDF under limit successfully', () => {
      const file = createMockFile(40 * 1024 * 1024, 'application/pdf'); // 40 MB
      const result = validateFileSize(file, 'pdf');
      expect(result.isValid).toBe(true);
      expect(result.maxAllowed).toBe(CAPTURE_CONSTRAINTS.pdf.maxFileSize);
    });

    it('returns error for PDF over limit', () => {
      const file = createMockFile(60 * 1024 * 1024, 'application/pdf'); // 60 MB
      const result = validateFileSize(file, 'pdf');
      expect(result.isValid).toBe(false);
    });
  });

  it('includes human-readable sizes in error message', () => {
    const file = createMockFile(25 * 1024 * 1024, 'image/jpeg'); // 25 MB
    const result = validateFileSize(file, 'image');
    expect(result.error).toMatch(/\d+(\.\d+)?\s*(MB|GB)/);
  });
});

// =============================================================================
// validateTotalSize Tests
// =============================================================================

describe('validateTotalSize', () => {
  it('returns valid with currentSize: 0 for empty array', () => {
    const result = validateTotalSize([]);
    expect(result.isValid).toBe(true);
    expect(result.currentSize).toBe(0);
  });

  it('returns valid for items under limit', () => {
    const mediaItems = [
      createMockMediaItem({ file: createMockFile(50 * 1024 * 1024) }),
      createMockMediaItem({ file: createMockFile(50 * 1024 * 1024) }),
    ];
    const result = validateTotalSize(mediaItems);
    expect(result.isValid).toBe(true);
    expect(result.currentSize).toBe(100 * 1024 * 1024);
  });

  it('returns error for items over limit', () => {
    const mediaItems = [
      createMockMediaItem({ file: createMockFile(100 * 1024 * 1024) }),
      createMockMediaItem({ file: createMockFile(100 * 1024 * 1024) }),
      createMockMediaItem({ file: createMockFile(50 * 1024 * 1024) }),
    ];
    const result = validateTotalSize(mediaItems);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('exceeds');
    expect(result.currentSize).toBe(250 * 1024 * 1024);
  });

  it('handles items with undefined file property', () => {
    const mediaItems = [
      createMockMediaItem({ file: createMockFile(50 * 1024 * 1024) }),
      { ...createMockMediaItem(), file: undefined } as unknown as MediaItem,
    ];
    const result = validateTotalSize(mediaItems);
    expect(result.isValid).toBe(true);
    expect(result.currentSize).toBe(50 * 1024 * 1024);
  });
});

// =============================================================================
// validateTextLength Tests
// =============================================================================

describe('validateTextLength', () => {
  it('returns valid for empty string', () => {
    const result = validateTextLength('');
    expect(result.isValid).toBe(true);
  });

  it('returns valid for text under limit', () => {
    const text = 'x'.repeat(4999);
    const result = validateTextLength(text);
    expect(result.isValid).toBe(true);
  });

  it('returns valid for text at exactly the limit', () => {
    const text = 'x'.repeat(CAPTURE_CONSTRAINTS.text.maxLength);
    const result = validateTextLength(text);
    expect(result.isValid).toBe(true);
  });

  it('returns error for text over limit', () => {
    const text = 'x'.repeat(CAPTURE_CONSTRAINTS.text.maxLength + 1);
    const result = validateTextLength(text);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('exceed');
    expect(result.error).toContain(`current: ${CAPTURE_CONSTRAINTS.text.maxLength + 1}`);
  });

  it('includes both limit and current count in error', () => {
    const text = 'x'.repeat(5234);
    const result = validateTextLength(text);
    expect(result.error).toContain('5000');
    expect(result.error).toContain('5234');
  });
});

// =============================================================================
// validateImageCount Tests
// =============================================================================

describe('validateImageCount', () => {
  it('returns valid for fewer images than limit', () => {
    const mediaItems = Array(9).fill(null).map(() => createMockMediaItem({ type: 'image' }));
    const result = validateImageCount(mediaItems);
    expect(result.isValid).toBe(true);
  });

  it('returns valid for exactly the limit', () => {
    const mediaItems = Array(CAPTURE_CONSTRAINTS.image.maxCount).fill(null).map(() =>
      createMockMediaItem({ type: 'image' })
    );
    const result = validateImageCount(mediaItems);
    expect(result.isValid).toBe(true);
  });

  it('returns error for more images than limit', () => {
    const mediaItems = Array(11).fill(null).map(() => createMockMediaItem({ type: 'image' }));
    const result = validateImageCount(mediaItems);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('Maximum');
    expect(result.error).toContain('10');
    expect(result.error).toContain('current: 11');
  });

  it('only counts images, not videos or PDFs', () => {
    const mediaItems = [
      ...Array(8).fill(null).map(() => createMockMediaItem({ type: 'image' })),
      createMockMediaItem({ type: 'video' }),
      createMockMediaItem({ type: 'pdf' }),
      createMockMediaItem({ type: 'video' }),
      createMockMediaItem({ type: 'pdf' }),
    ];
    const result = validateImageCount(mediaItems);
    expect(result.isValid).toBe(true);
  });
});

// =============================================================================
// validateMimeType Tests
// =============================================================================

describe('validateMimeType', () => {
  describe('image MIME types', () => {
    it.each(SUPPORTED_FORMATS.image as readonly string[])(
      'validates %s as a valid image type',
      (mimeType) => {
        const result = validateMimeType(mimeType, 'image');
        expect(result.isValid).toBe(true);
      }
    );

    it('returns error for unsupported image type', () => {
      const result = validateMimeType('image/bmp', 'image');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("'image/bmp'");
      expect(result.error).toContain('image');
    });
  });

  describe('video MIME types', () => {
    it.each(SUPPORTED_FORMATS.video as readonly string[])(
      'validates %s as a valid video type',
      (mimeType) => {
        const result = validateMimeType(mimeType, 'video');
        expect(result.isValid).toBe(true);
      }
    );

    it('returns error for unsupported video type', () => {
      const result = validateMimeType('audio/mp3', 'video');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("'audio/mp3'");
      expect(result.error).toContain('video');
    });
  });

  describe('PDF MIME types', () => {
    it('validates application/pdf as valid', () => {
      const result = validateMimeType('application/pdf', 'pdf');
      expect(result.isValid).toBe(true);
    });

    it('returns error for non-PDF type', () => {
      const result = validateMimeType('text/plain', 'pdf');
      expect(result.isValid).toBe(false);
    });
  });
});

// =============================================================================
// getMediaTypeFromMime Tests
// =============================================================================

describe('getMediaTypeFromMime', () => {
  it('returns "image" for supported image MIME types', () => {
    expect(getMediaTypeFromMime('image/jpeg')).toBe('image');
    expect(getMediaTypeFromMime('image/png')).toBe('image');
  });

  it('returns "video" for supported video MIME types', () => {
    expect(getMediaTypeFromMime('video/mp4')).toBe('video');
    expect(getMediaTypeFromMime('video/webm')).toBe('video');
  });

  it('returns "pdf" for PDF MIME type', () => {
    expect(getMediaTypeFromMime('application/pdf')).toBe('pdf');
  });

  it('returns null for unsupported MIME types', () => {
    expect(getMediaTypeFromMime('audio/mp3')).toBeNull();
    expect(getMediaTypeFromMime('text/plain')).toBeNull();
    expect(getMediaTypeFromMime('')).toBeNull();
  });
});

// =============================================================================
// validateItemCapture Tests
// =============================================================================

describe('validateItemCapture', () => {
  it('returns isValid: true when all validations pass', () => {
    const metadata = createMockMetadata({ title: 'Valid Title' });
    const mediaItems = [createMockMediaItem({ file: createMockFile(1024 * 1024) })];
    const instructions = 'Some instructions';

    const result = validateItemCapture(metadata, mediaItems, instructions);

    expect(result.isValid).toBe(true);
    expect(Object.keys(result.errors)).toHaveLength(0);
  });

  it('returns isValid: false when title is empty', () => {
    const metadata = createMockMetadata({ title: '' });
    const mediaItems = [createMockMediaItem()];
    const instructions = '';

    const result = validateItemCapture(metadata, mediaItems, instructions);

    expect(result.isValid).toBe(false);
    expect(result.errors['title']).toBeDefined();
  });

  it('returns isValid: false when no content', () => {
    const metadata = createMockMetadata({ title: 'Valid Title' });
    const mediaItems: MediaItem[] = [];
    const instructions = '';

    const result = validateItemCapture(metadata, mediaItems, instructions);

    expect(result.isValid).toBe(false);
    expect(result.errors['content']).toBeDefined();
  });

  it('includes multiple errors when multiple validations fail', () => {
    const metadata = createMockMetadata({ title: '' });
    const mediaItems: MediaItem[] = [];
    const instructions = '';

    const result = validateItemCapture(metadata, mediaItems, instructions);

    expect(result.isValid).toBe(false);
    expect(result.errors['title']).toBeDefined();
    expect(result.errors['content']).toBeDefined();
  });

  it('text length issues are warnings, not errors', () => {
    const metadata = createMockMetadata({ title: 'Valid Title' });
    const mediaItems = [createMockMediaItem()];
    const instructions = 'x'.repeat(5001); // Exceeds limit

    const result = validateItemCapture(metadata, mediaItems, instructions);

    expect(result.isValid).toBe(true); // Still valid because it's a warning
    expect(result.warnings['textLength']).toBeDefined();
    expect(result.errors['textLength']).toBeUndefined();
  });

  it('validates individual file sizes', () => {
    const metadata = createMockMetadata({ title: 'Valid Title' });
    const mediaItems = [
      createMockMediaItem({
        id: 'oversized',
        type: 'image',
        file: createMockFile(25 * 1024 * 1024) // 25MB, over 20MB limit
      }),
    ];
    const instructions = '';

    const result = validateItemCapture(metadata, mediaItems, instructions);

    expect(result.isValid).toBe(false);
    expect(result.errors['fileSize_oversized']).toBeDefined();
  });

  it('validates total size', () => {
    const metadata = createMockMetadata({ title: 'Valid Title' });
    const mediaItems = [
      createMockMediaItem({ file: createMockFile(100 * 1024 * 1024) }),
      createMockMediaItem({ file: createMockFile(100 * 1024 * 1024) }),
      createMockMediaItem({ file: createMockFile(50 * 1024 * 1024) }),
    ]; // Total 250MB, over 200MB limit
    const instructions = '';

    const result = validateItemCapture(metadata, mediaItems, instructions);

    expect(result.isValid).toBe(false);
    expect(result.errors['totalSize']).toBeDefined();
  });

  it('includes content analysis in result', () => {
    const metadata = createMockMetadata({ title: 'Test' });
    const mediaItems = [createMockMediaItem()];
    const instructions = 'Some text';

    const result = validateItemCapture(metadata, mediaItems, instructions);

    expect(result.content.hasMedia).toBe(true);
    expect(result.content.hasText).toBe(true);
    expect(result.content.hasContent).toBe(true);
  });

  it('includes file size analysis in result', () => {
    const metadata = createMockMetadata({ title: 'Test' });
    const mediaItems = [createMockMediaItem({ file: createMockFile(5 * 1024 * 1024) })];
    const instructions = '';

    const result = validateItemCapture(metadata, mediaItems, instructions);

    expect(result.fileSize.total.currentSize).toBe(5 * 1024 * 1024);
    expect(result.fileSize.total.maxAllowed).toBe(CAPTURE_CONSTRAINTS.total.maxSize);
    expect(result.fileSize.individual).toHaveLength(1);
  });
});

// =============================================================================
// calculateRemainingSize Tests
// =============================================================================

describe('calculateRemainingSize', () => {
  it('returns max size for empty array', () => {
    const result = calculateRemainingSize([]);
    expect(result).toBe(CAPTURE_CONSTRAINTS.total.maxSize);
  });

  it('calculates remaining correctly', () => {
    const mediaItems = [createMockMediaItem({ file: createMockFile(50 * 1024 * 1024) })];
    const result = calculateRemainingSize(mediaItems);
    expect(result).toBe(CAPTURE_CONSTRAINTS.total.maxSize - 50 * 1024 * 1024);
  });

  it('returns 0 when at or over limit', () => {
    const mediaItems = [createMockMediaItem({ file: createMockFile(300 * 1024 * 1024) })];
    const result = calculateRemainingSize(mediaItems);
    expect(result).toBe(0);
  });
});

// =============================================================================
// calculateTotalSize Tests
// =============================================================================

describe('calculateTotalSize', () => {
  it('returns 0 for empty array', () => {
    expect(calculateTotalSize([])).toBe(0);
  });

  it('calculates total correctly', () => {
    const mediaItems = [
      createMockMediaItem({ file: createMockFile(10 * 1024 * 1024) }),
      createMockMediaItem({ file: createMockFile(20 * 1024 * 1024) }),
    ];
    expect(calculateTotalSize(mediaItems)).toBe(30 * 1024 * 1024);
  });
});

// =============================================================================
// wouldExceedTotalSize Tests
// =============================================================================

describe('wouldExceedTotalSize', () => {
  it('returns false when adding file would stay under limit', () => {
    const mediaItems = [createMockMediaItem({ file: createMockFile(50 * 1024 * 1024) })];
    const newFileSize = 50 * 1024 * 1024;
    expect(wouldExceedTotalSize(mediaItems, newFileSize)).toBe(false);
  });

  it('returns true when adding file would exceed limit', () => {
    const mediaItems = [createMockMediaItem({ file: createMockFile(150 * 1024 * 1024) })];
    const newFileSize = 100 * 1024 * 1024;
    expect(wouldExceedTotalSize(mediaItems, newFileSize)).toBe(true);
  });

  it('returns true when adding file would exactly reach limit + 1', () => {
    const currentSize = CAPTURE_CONSTRAINTS.total.maxSize - 1024;
    const mediaItems = [createMockMediaItem({ file: createMockFile(currentSize) })];
    const newFileSize = 1025; // Would exceed by 1 byte
    expect(wouldExceedTotalSize(mediaItems, newFileSize)).toBe(true);
  });
});
