/**
 * Integration Tests for useItemValidation Hook
 *
 * Tests the useItemValidation hook's behavior including real-time updates,
 * memoization, and utility functions.
 *
 * @module ItemCapture/hooks/__tests__/useItemValidation.test
 * @see docs/REQ-052-create-validation-layer-detailed.md
 * @lastModified 2025-12-31 (REQ-052 Task 16)
 */

import { renderHook, act } from '@testing-library/react';
import { useItemValidation } from '../useItemValidation';
import { CAPTURE_CONSTRAINTS } from '../../utils/constants';
import type { MediaItem, ItemMetadata } from '../../ItemCapture.types';

// =============================================================================
// Test Helpers
// =============================================================================

/**
 * Create a mock MediaItem for testing.
 */
function createMockMediaItem(overrides: Partial<MediaItem> = {}): MediaItem {
  const size = overrides.file?.size ?? 1024 * 1024; // 1MB default
  return {
    id: overrides.id ?? `test-${Math.random().toString(36).substr(2, 9)}`,
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
// Initial State Tests
// =============================================================================

describe('useItemValidation - initial state', () => {
  it('returns valid initial structure', () => {
    const metadata = createMockMetadata({ title: 'Valid Title' });
    const mediaItems = [createMockMediaItem()];
    const instructions = 'Some instructions';

    const { result } = renderHook(() =>
      useItemValidation(metadata, mediaItems, instructions)
    );

    expect(result.current).toHaveProperty('validation');
    expect(result.current).toHaveProperty('isValid');
    expect(result.current).toHaveProperty('errors');
    expect(result.current).toHaveProperty('warnings');
    expect(result.current).toHaveProperty('validateField');
    expect(result.current).toHaveProperty('validateAll');
    expect(result.current).toHaveProperty('calculateTotalSize');
    expect(result.current).toHaveProperty('getRemainingSize');
    expect(result.current).toHaveProperty('formatSize');
    expect(result.current).toHaveProperty('maxTotalSize');
    expect(result.current).toHaveProperty('hasContent');
    expect(result.current).toHaveProperty('hasMedia');
    expect(result.current).toHaveProperty('hasText');
  });

  it('triggers title error for empty metadata', () => {
    const metadata = createMockMetadata({ title: '' });
    const mediaItems = [createMockMediaItem()];
    const instructions = '';

    const { result } = renderHook(() =>
      useItemValidation(metadata, mediaItems, instructions)
    );

    expect(result.current.isValid).toBe(false);
    expect(result.current.errors['title']).toBeDefined();
  });

  it('triggers content error for empty content', () => {
    const metadata = createMockMetadata({ title: 'Valid Title' });
    const mediaItems: MediaItem[] = [];
    const instructions = '';

    const { result } = renderHook(() =>
      useItemValidation(metadata, mediaItems, instructions)
    );

    expect(result.current.isValid).toBe(false);
    expect(result.current.errors['content']).toBeDefined();
  });

  it('returns valid when all inputs are valid', () => {
    const metadata = createMockMetadata({ title: 'Valid Title' });
    const mediaItems = [createMockMediaItem()];
    const instructions = 'Some instructions';

    const { result } = renderHook(() =>
      useItemValidation(metadata, mediaItems, instructions)
    );

    expect(result.current.isValid).toBe(true);
    expect(Object.keys(result.current.errors)).toHaveLength(0);
  });
});

// =============================================================================
// Real-time Update Tests
// =============================================================================

describe('useItemValidation - real-time updates', () => {
  it('updates validation when title changes', () => {
    let metadata = createMockMetadata({ title: '' });
    const mediaItems = [createMockMediaItem()];
    const instructions = '';

    const { result, rerender } = renderHook(
      ({ metadata: m, mediaItems: mi, instructions: i }) =>
        useItemValidation(m, mi, i),
      {
        initialProps: { metadata, mediaItems, instructions },
      }
    );

    // Initially invalid (no title)
    expect(result.current.isValid).toBe(false);
    expect(result.current.errors['title']).toBeDefined();

    // Update with valid title
    metadata = createMockMetadata({ title: 'New Valid Title' });
    rerender({ metadata, mediaItems, instructions });

    // Now valid
    expect(result.current.isValid).toBe(true);
    expect(result.current.errors['title']).toBeUndefined();
  });

  it('updates validation when media is added', () => {
    const metadata = createMockMetadata({ title: 'Valid Title' });
    let mediaItems: MediaItem[] = [];
    const instructions = '';

    const { result, rerender } = renderHook(
      ({ metadata: m, mediaItems: mi, instructions: i }) =>
        useItemValidation(m, mi, i),
      {
        initialProps: { metadata, mediaItems, instructions },
      }
    );

    // Initially invalid (no content)
    expect(result.current.isValid).toBe(false);
    expect(result.current.hasMedia).toBe(false);
    expect(result.current.hasContent).toBe(false);

    // Add media
    mediaItems = [createMockMediaItem()];
    rerender({ metadata, mediaItems, instructions });

    // Now valid
    expect(result.current.isValid).toBe(true);
    expect(result.current.hasMedia).toBe(true);
    expect(result.current.hasContent).toBe(true);
  });

  it('updates validation when instructions change', () => {
    const metadata = createMockMetadata({ title: 'Valid Title' });
    const mediaItems: MediaItem[] = [];
    let instructions = '';

    const { result, rerender } = renderHook(
      ({ metadata: m, mediaItems: mi, instructions: i }) =>
        useItemValidation(m, mi, i),
      {
        initialProps: { metadata, mediaItems, instructions },
      }
    );

    // Initially invalid (no content)
    expect(result.current.isValid).toBe(false);
    expect(result.current.hasText).toBe(false);

    // Add instructions
    instructions = 'Some new instructions';
    rerender({ metadata, mediaItems, instructions });

    // Now valid
    expect(result.current.isValid).toBe(true);
    expect(result.current.hasText).toBe(true);
  });

  it('updates total size when media is added or removed', () => {
    const metadata = createMockMetadata({ title: 'Valid Title' });
    const file1 = createMockFile(10 * 1024 * 1024); // 10 MB
    const file2 = createMockFile(20 * 1024 * 1024); // 20 MB
    let mediaItems = [createMockMediaItem({ file: file1 })];
    const instructions = '';

    const { result, rerender } = renderHook(
      ({ metadata: m, mediaItems: mi, instructions: i }) =>
        useItemValidation(m, mi, i),
      {
        initialProps: { metadata, mediaItems, instructions },
      }
    );

    // Initial size
    expect(result.current.calculateTotalSize()).toBe(10 * 1024 * 1024);

    // Add another media item
    mediaItems = [
      createMockMediaItem({ file: file1 }),
      createMockMediaItem({ file: file2 }),
    ];
    rerender({ metadata, mediaItems, instructions });

    // Size updated
    expect(result.current.calculateTotalSize()).toBe(30 * 1024 * 1024);
  });
});

// =============================================================================
// Size Calculation Tests
// =============================================================================

describe('useItemValidation - size calculations', () => {
  it('calculateTotalSize returns correct sum', () => {
    const metadata = createMockMetadata({ title: 'Valid Title' });
    const mediaItems = [
      createMockMediaItem({ file: createMockFile(10 * 1024 * 1024) }),
      createMockMediaItem({ file: createMockFile(15 * 1024 * 1024) }),
      createMockMediaItem({ file: createMockFile(5 * 1024 * 1024) }),
    ];
    const instructions = '';

    const { result } = renderHook(() =>
      useItemValidation(metadata, mediaItems, instructions)
    );

    expect(result.current.calculateTotalSize()).toBe(30 * 1024 * 1024);
  });

  it('getRemainingSize calculates correctly', () => {
    const metadata = createMockMetadata({ title: 'Valid Title' });
    const mediaItems = [
      createMockMediaItem({ file: createMockFile(50 * 1024 * 1024) }),
    ];
    const instructions = '';

    const { result } = renderHook(() =>
      useItemValidation(metadata, mediaItems, instructions)
    );

    const expected = CAPTURE_CONSTRAINTS.total.maxSize - 50 * 1024 * 1024;
    expect(result.current.getRemainingSize()).toBe(expected);
  });

  it('formatSize returns human-readable strings', () => {
    const metadata = createMockMetadata({ title: 'Valid Title' });
    const mediaItems = [createMockMediaItem()];
    const instructions = '';

    const { result } = renderHook(() =>
      useItemValidation(metadata, mediaItems, instructions)
    );

    expect(result.current.formatSize(1024)).toBe('1 KB');
    expect(result.current.formatSize(1024 * 1024)).toBe('1 MB');
    expect(result.current.formatSize(0)).toBe('0 B');
  });

  it('maxTotalSize returns correct constraint value', () => {
    const metadata = createMockMetadata({ title: 'Valid Title' });
    const mediaItems = [createMockMediaItem()];
    const instructions = '';

    const { result } = renderHook(() =>
      useItemValidation(metadata, mediaItems, instructions)
    );

    expect(result.current.maxTotalSize).toBe(CAPTURE_CONSTRAINTS.total.maxSize);
  });
});

// =============================================================================
// Field Validation Tests
// =============================================================================

describe('useItemValidation - validateField', () => {
  it('validates title field correctly', () => {
    const metadata = createMockMetadata({ title: 'Valid Title' });
    const mediaItems = [createMockMediaItem()];
    const instructions = '';

    const { result } = renderHook(() =>
      useItemValidation(metadata, mediaItems, instructions)
    );

    // Valid title
    const validResult = result.current.validateField('title', 'New Title');
    expect(validResult.isValid).toBe(true);

    // Invalid title (empty)
    const invalidResult = result.current.validateField('title', '');
    expect(invalidResult.isValid).toBe(false);
    expect(invalidResult.error).toBeDefined();
  });

  it('returns valid for optional fields', () => {
    const metadata = createMockMetadata({ title: 'Valid Title' });
    const mediaItems = [createMockMediaItem()];
    const instructions = '';

    const { result } = renderHook(() =>
      useItemValidation(metadata, mediaItems, instructions)
    );

    expect(result.current.validateField('location', '').isValid).toBe(true);
    expect(result.current.validateField('tags', '').isValid).toBe(true);
    expect(result.current.validateField('applianceType', '').isValid).toBe(true);
  });
});

// =============================================================================
// Memoization Tests
// =============================================================================

describe('useItemValidation - memoization', () => {
  it('returns same validation object reference when inputs unchanged', () => {
    const metadata = createMockMetadata({ title: 'Valid Title' });
    const mediaItems = [createMockMediaItem()];
    const instructions = 'Some instructions';

    const { result, rerender } = renderHook(
      ({ metadata: m, mediaItems: mi, instructions: i }) =>
        useItemValidation(m, mi, i),
      {
        initialProps: { metadata, mediaItems, instructions },
      }
    );

    const firstValidation = result.current.validation;

    // Rerender with same inputs
    rerender({ metadata, mediaItems, instructions });

    const secondValidation = result.current.validation;

    // Should be the same reference (memoized)
    expect(firstValidation).toBe(secondValidation);
  });

  it('returns new validation object when inputs change', () => {
    let metadata = createMockMetadata({ title: 'Valid Title' });
    const mediaItems = [createMockMediaItem()];
    const instructions = 'Some instructions';

    const { result, rerender } = renderHook(
      ({ metadata: m, mediaItems: mi, instructions: i }) =>
        useItemValidation(m, mi, i),
      {
        initialProps: { metadata, mediaItems, instructions },
      }
    );

    const firstValidation = result.current.validation;

    // Change metadata
    metadata = createMockMetadata({ title: 'New Title' });
    rerender({ metadata, mediaItems, instructions });

    const secondValidation = result.current.validation;

    // Should be different reference (recalculated)
    expect(firstValidation).not.toBe(secondValidation);
  });
});

// =============================================================================
// Content State Tests
// =============================================================================

describe('useItemValidation - content state', () => {
  it('hasContent is true when media exists', () => {
    const metadata = createMockMetadata({ title: 'Valid Title' });
    const mediaItems = [createMockMediaItem()];
    const instructions = '';

    const { result } = renderHook(() =>
      useItemValidation(metadata, mediaItems, instructions)
    );

    expect(result.current.hasMedia).toBe(true);
    expect(result.current.hasText).toBe(false);
    expect(result.current.hasContent).toBe(true);
  });

  it('hasContent is true when text exists', () => {
    const metadata = createMockMetadata({ title: 'Valid Title' });
    const mediaItems: MediaItem[] = [];
    const instructions = 'Some instructions';

    const { result } = renderHook(() =>
      useItemValidation(metadata, mediaItems, instructions)
    );

    expect(result.current.hasMedia).toBe(false);
    expect(result.current.hasText).toBe(true);
    expect(result.current.hasContent).toBe(true);
  });

  it('hasContent is true when both exist', () => {
    const metadata = createMockMetadata({ title: 'Valid Title' });
    const mediaItems = [createMockMediaItem()];
    const instructions = 'Some instructions';

    const { result } = renderHook(() =>
      useItemValidation(metadata, mediaItems, instructions)
    );

    expect(result.current.hasMedia).toBe(true);
    expect(result.current.hasText).toBe(true);
    expect(result.current.hasContent).toBe(true);
  });

  it('hasContent is false when neither exists', () => {
    const metadata = createMockMetadata({ title: 'Valid Title' });
    const mediaItems: MediaItem[] = [];
    const instructions = '';

    const { result } = renderHook(() =>
      useItemValidation(metadata, mediaItems, instructions)
    );

    expect(result.current.hasMedia).toBe(false);
    expect(result.current.hasText).toBe(false);
    expect(result.current.hasContent).toBe(false);
  });
});

// =============================================================================
// Warnings vs Errors Tests
// =============================================================================

describe('useItemValidation - warnings vs errors', () => {
  it('text length issues appear as warnings, not errors', () => {
    const metadata = createMockMetadata({ title: 'Valid Title' });
    const mediaItems = [createMockMediaItem()];
    const instructions = 'x'.repeat(CAPTURE_CONSTRAINTS.text.maxLength + 1);

    const { result } = renderHook(() =>
      useItemValidation(metadata, mediaItems, instructions)
    );

    expect(result.current.isValid).toBe(true); // Still valid
    expect(result.current.warnings['textLength']).toBeDefined();
    expect(result.current.errors['textLength']).toBeUndefined();
  });

  it('title issues appear as errors', () => {
    const metadata = createMockMetadata({ title: '' });
    const mediaItems = [createMockMediaItem()];
    const instructions = '';

    const { result } = renderHook(() =>
      useItemValidation(metadata, mediaItems, instructions)
    );

    expect(result.current.isValid).toBe(false);
    expect(result.current.errors['title']).toBeDefined();
  });
});

// =============================================================================
// validateAll Tests
// =============================================================================

describe('useItemValidation - validateAll', () => {
  it('returns same result as validation property', () => {
    const metadata = createMockMetadata({ title: 'Valid Title' });
    const mediaItems = [createMockMediaItem()];
    const instructions = 'Some instructions';

    const { result } = renderHook(() =>
      useItemValidation(metadata, mediaItems, instructions)
    );

    const validateAllResult = result.current.validateAll();

    expect(validateAllResult.isValid).toBe(result.current.validation.isValid);
    expect(validateAllResult.errors).toEqual(result.current.validation.errors);
    expect(validateAllResult.warnings).toEqual(result.current.validation.warnings);
  });
});
