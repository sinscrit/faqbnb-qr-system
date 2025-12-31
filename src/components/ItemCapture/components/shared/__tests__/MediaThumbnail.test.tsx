/**
 * Unit Tests for MediaThumbnail Component
 *
 * Tests for rendering, size variants, type-specific overlays, loading/error states,
 * delete button, click handlers, and memory cleanup.
 *
 * @module ItemCapture/components/shared/__tests__/MediaThumbnail
 * @lastModified 2025-12-31 (REQ-051)
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MediaThumbnail, MediaThumbnailProps } from '../MediaThumbnail';

// Type definition for tests
interface MediaItem {
  id: string;
  type: 'video' | 'image' | 'pdf';
  file: File | Blob;
  thumbnail?: Blob;
  order: number;
  metadata: {
    duration?: number;
    dimensions?: { width: number; height: number };
    originalFilename?: string;
    pageCount?: number;
    mimeType: string;
    fileSize: number;
    source: 'capture' | 'upload';
    edits?: {
      cropped?: boolean;
      rotated?: number;
      trimStart?: number;
      trimEnd?: number;
    };
  };
}

// =============================================================================
// Mock URL.createObjectURL and URL.revokeObjectURL
// =============================================================================

const mockObjectUrls: string[] = [];
let mockUrlCounter = 0;

const originalCreateObjectURL = URL.createObjectURL;
const originalRevokeObjectURL = URL.revokeObjectURL;

beforeAll(() => {
  URL.createObjectURL = jest.fn((blob: Blob) => {
    const url = `blob:mock-url-${++mockUrlCounter}`;
    mockObjectUrls.push(url);
    return url;
  });

  URL.revokeObjectURL = jest.fn((url: string) => {
    const index = mockObjectUrls.indexOf(url);
    if (index > -1) {
      mockObjectUrls.splice(index, 1);
    }
  });
});

afterAll(() => {
  URL.createObjectURL = originalCreateObjectURL;
  URL.revokeObjectURL = originalRevokeObjectURL;
});

beforeEach(() => {
  mockObjectUrls.length = 0;
  mockUrlCounter = 0;
  jest.clearAllMocks();
});

// =============================================================================
// Test Helpers
// =============================================================================

function createMockMediaItem(
  type: 'video' | 'image' | 'pdf',
  overrides: Partial<MediaItem> = {}
): MediaItem {
  const baseItem: MediaItem = {
    id: `test-${type}-${Date.now()}`,
    type,
    file: new Blob(['test content'], { type: type === 'pdf' ? 'application/pdf' : `${type}/*` }),
    order: 0,
    metadata: {
      mimeType: type === 'pdf' ? 'application/pdf' : `${type}/jpeg`,
      fileSize: 1024,
      source: 'capture',
    },
  };

  return { ...baseItem, ...overrides };
}

function renderMediaThumbnail(props: Partial<MediaThumbnailProps> = {}) {
  const defaultProps: MediaThumbnailProps = {
    media: createMockMediaItem('image'),
    onDelete: jest.fn(),
    ...props,
  };

  return render(<MediaThumbnail {...defaultProps} />);
}

// =============================================================================
// Rendering Tests
// =============================================================================

describe('MediaThumbnail - Rendering', () => {
  it('renders without crashing with minimal props', () => {
    const { container } = renderMediaThumbnail();
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders at correct size for small variant', () => {
    const { container } = renderMediaThumbnail({ size: 'small' });
    const thumbnail = container.firstChild as HTMLElement;
    expect(thumbnail).toHaveClass('w-20', 'h-20');
  });

  it('renders at correct size for medium variant (default)', () => {
    const { container } = renderMediaThumbnail();
    const thumbnail = container.firstChild as HTMLElement;
    expect(thumbnail).toHaveClass('w-[120px]', 'h-[120px]');
  });

  it('renders at correct size for large variant', () => {
    const { container } = renderMediaThumbnail({ size: 'large' });
    const thumbnail = container.firstChild as HTMLElement;
    expect(thumbnail).toHaveClass('w-[200px]', 'h-[200px]');
  });

  it('applies custom className correctly', () => {
    const { container } = renderMediaThumbnail({ className: 'custom-class' });
    const thumbnail = container.firstChild as HTMLElement;
    expect(thumbnail).toHaveClass('custom-class');
  });

  it('applies base styling classes', () => {
    const { container } = renderMediaThumbnail();
    const thumbnail = container.firstChild as HTMLElement;
    expect(thumbnail).toHaveClass('group', 'relative', 'rounded-lg', 'overflow-hidden', 'bg-gray-100', 'cursor-pointer');
  });
});

// =============================================================================
// Image Display Tests
// =============================================================================

describe('MediaThumbnail - Image Display', () => {
  it('displays image thumbnail from Blob', async () => {
    const imageMedia = createMockMediaItem('image', {
      thumbnail: new Blob(['thumbnail'], { type: 'image/jpeg' }),
    });

    renderMediaThumbnail({ media: imageMedia });

    const img = screen.getByRole('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', expect.stringContaining('blob:mock-url'));
  });

  it('displays video thumbnail from Blob', () => {
    const videoMedia = createMockMediaItem('video', {
      thumbnail: new Blob(['thumbnail'], { type: 'image/jpeg' }),
    });

    renderMediaThumbnail({ media: videoMedia });

    const img = screen.getByRole('img');
    expect(img).toBeInTheDocument();
  });

  it('does not display image for PDF type', () => {
    const pdfMedia = createMockMediaItem('pdf');

    renderMediaThumbnail({ media: pdfMedia });

    const img = screen.queryByRole('img');
    expect(img).not.toBeInTheDocument();
  });

  it('uses alt text from originalFilename when available', () => {
    const imageMedia = createMockMediaItem('image', {
      metadata: {
        mimeType: 'image/jpeg',
        fileSize: 1024,
        source: 'upload',
        originalFilename: 'my-photo.jpg',
      },
    });

    renderMediaThumbnail({ media: imageMedia });

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('alt', 'my-photo.jpg');
  });

  it('uses default alt text when originalFilename is not available', () => {
    const imageMedia = createMockMediaItem('image');

    renderMediaThumbnail({ media: imageMedia });

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('alt', 'Media thumbnail');
  });
});

// =============================================================================
// Loading State Tests
// =============================================================================

describe('MediaThumbnail - Loading State', () => {
  it('shows spinner when isLoading prop is true', () => {
    renderMediaThumbnail({ isLoading: true });

    // Look for spinner element (has animate-spin class)
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('shows spinner while image is loading', () => {
    const imageMedia = createMockMediaItem('image');
    renderMediaThumbnail({ media: imageMedia });

    // Initially shows spinner because image hasn't loaded yet
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('hides spinner after image loads', async () => {
    const imageMedia = createMockMediaItem('image', {
      thumbnail: new Blob(['thumbnail'], { type: 'image/jpeg' }),
    });

    renderMediaThumbnail({ media: imageMedia });

    const img = screen.getByRole('img');
    fireEvent.load(img);

    await waitFor(() => {
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).not.toBeInTheDocument();
    });
  });

  it('does not show image loading spinner for PDF type (only isLoading prop)', () => {
    const pdfMedia = createMockMediaItem('pdf');

    renderMediaThumbnail({ media: pdfMedia, isLoading: false });

    // PDF type should not trigger image loading spinner
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).not.toBeInTheDocument();
  });
});

// =============================================================================
// Type-Specific Overlay Tests
// =============================================================================

describe('MediaThumbnail - Video Play Icon', () => {
  it('shows play icon for video type after loading', async () => {
    const videoMedia = createMockMediaItem('video', {
      thumbnail: new Blob(['thumbnail'], { type: 'image/jpeg' }),
    });

    renderMediaThumbnail({ media: videoMedia });

    const img = screen.getByRole('img');
    fireEvent.load(img);

    await waitFor(() => {
      // Look for the play icon container with fill-current class
      const playIcon = document.querySelector('.fill-current');
      expect(playIcon).toBeInTheDocument();
    });
  });

  it('does not show play icon for image type', async () => {
    const imageMedia = createMockMediaItem('image', {
      thumbnail: new Blob(['thumbnail'], { type: 'image/jpeg' }),
    });

    renderMediaThumbnail({ media: imageMedia });

    const img = screen.getByRole('img');
    fireEvent.load(img);

    await waitFor(() => {
      // fill-current is specific to the Play icon in our component
      const playIconContainer = document.querySelector('.bg-black\\/50');
      expect(playIconContainer).not.toBeInTheDocument();
    });
  });

  it('does not show play icon during loading state', () => {
    const videoMedia = createMockMediaItem('video');

    renderMediaThumbnail({ media: videoMedia, isLoading: true });

    // During loading, play icon should not appear
    const playIconContainer = document.querySelector('.bg-black\\/50');
    expect(playIconContainer).not.toBeInTheDocument();
  });
});

describe('MediaThumbnail - PDF Icon', () => {
  it('shows document icon for PDF type', () => {
    const pdfMedia = createMockMediaItem('pdf');

    renderMediaThumbnail({ media: pdfMedia });

    // PDF displays in a blue container
    const pdfContainer = document.querySelector('.bg-blue-50');
    expect(pdfContainer).toBeInTheDocument();
  });

  it('shows page count for PDF when metadata includes pageCount', () => {
    const pdfMedia = createMockMediaItem('pdf', {
      metadata: {
        mimeType: 'application/pdf',
        fileSize: 1024,
        source: 'upload',
        pageCount: 5,
      },
    });

    renderMediaThumbnail({ media: pdfMedia });

    expect(screen.getByText('5 pages')).toBeInTheDocument();
  });

  it('shows singular "page" for single-page PDF', () => {
    const pdfMedia = createMockMediaItem('pdf', {
      metadata: {
        mimeType: 'application/pdf',
        fileSize: 1024,
        source: 'upload',
        pageCount: 1,
      },
    });

    renderMediaThumbnail({ media: pdfMedia });

    expect(screen.getByText('1 page')).toBeInTheDocument();
  });

  it('hides page count when pageCount is undefined', () => {
    const pdfMedia = createMockMediaItem('pdf');

    renderMediaThumbnail({ media: pdfMedia });

    expect(screen.queryByText(/page/)).not.toBeInTheDocument();
  });
});

// =============================================================================
// Error State Tests
// =============================================================================

describe('MediaThumbnail - Error State', () => {
  it('shows fallback icon when image fails to load', async () => {
    const imageMedia = createMockMediaItem('image');

    renderMediaThumbnail({ media: imageMedia });

    const img = screen.getByRole('img');
    fireEvent.error(img);

    await waitFor(() => {
      // Error state shows gradient background
      const fallbackContainer = document.querySelector('.bg-gradient-to-br');
      expect(fallbackContainer).toBeInTheDocument();
    });
  });

  it('shows correct fallback icon for video type on error', async () => {
    const videoMedia = createMockMediaItem('video');

    renderMediaThumbnail({ media: videoMedia });

    const img = screen.getByRole('img');
    fireEvent.error(img);

    await waitFor(() => {
      // Should show video fallback icon
      const fallbackContainer = document.querySelector('.bg-gradient-to-br');
      expect(fallbackContainer).toBeInTheDocument();
    });
  });

  it('does not show fallback for PDF type (has its own display)', () => {
    const pdfMedia = createMockMediaItem('pdf');

    renderMediaThumbnail({ media: pdfMedia });

    // PDF should not show the image error fallback
    const fallbackContainer = document.querySelector('.bg-gradient-to-br');
    expect(fallbackContainer).not.toBeInTheDocument();
  });
});

// =============================================================================
// Delete Button Tests
// =============================================================================

describe('MediaThumbnail - Delete Button', () => {
  it('renders delete button with correct aria-label', () => {
    renderMediaThumbnail();

    const deleteButton = screen.getByRole('button', { name: /delete media/i });
    expect(deleteButton).toBeInTheDocument();
  });

  it('calls onDelete with correct id when delete button is clicked', () => {
    const onDelete = jest.fn();
    const imageMedia = createMockMediaItem('image', { id: 'test-media-123' });

    renderMediaThumbnail({ media: imageMedia, onDelete });

    const deleteButton = screen.getByRole('button', { name: /delete media/i });
    fireEvent.click(deleteButton);

    expect(onDelete).toHaveBeenCalledWith('test-media-123');
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('delete click does not trigger container onClick', () => {
    const onDelete = jest.fn();
    const onClick = jest.fn();

    renderMediaThumbnail({ onDelete, onClick });

    const deleteButton = screen.getByRole('button', { name: /delete media/i });
    fireEvent.click(deleteButton);

    expect(onDelete).toHaveBeenCalled();
    expect(onClick).not.toHaveBeenCalled();
  });

  it('delete button has hover state class', () => {
    renderMediaThumbnail();

    const deleteButton = screen.getByRole('button', { name: /delete media/i });
    expect(deleteButton).toHaveClass('hover:bg-red-600');
  });
});

// =============================================================================
// Click Handler Tests
// =============================================================================

describe('MediaThumbnail - Click Handler', () => {
  it('container onClick calls onClick prop with media id', () => {
    const onClick = jest.fn();
    const imageMedia = createMockMediaItem('image', { id: 'click-test-456' });

    const { container } = renderMediaThumbnail({ media: imageMedia, onClick });

    const thumbnail = container.firstChild as HTMLElement;
    fireEvent.click(thumbnail);

    expect(onClick).toHaveBeenCalledWith('click-test-456');
  });

  it('component works without onClick prop', () => {
    const { container } = renderMediaThumbnail({ onClick: undefined });

    const thumbnail = container.firstChild as HTMLElement;

    // Should not throw when clicking without onClick handler
    expect(() => fireEvent.click(thumbnail)).not.toThrow();
  });
});

// =============================================================================
// Memory Cleanup Tests
// =============================================================================

describe('MediaThumbnail - Memory Cleanup', () => {
  it('creates object URL from blob', () => {
    const imageMedia = createMockMediaItem('image');

    renderMediaThumbnail({ media: imageMedia });

    expect(URL.createObjectURL).toHaveBeenCalled();
  });

  it('revokes object URL on unmount', () => {
    const imageMedia = createMockMediaItem('image');

    const { unmount } = renderMediaThumbnail({ media: imageMedia });

    const createCallCount = (URL.createObjectURL as jest.Mock).mock.calls.length;
    expect(createCallCount).toBeGreaterThan(0);

    unmount();

    expect(URL.revokeObjectURL).toHaveBeenCalled();
  });

  it('uses thumbnail blob when available over file blob', () => {
    const thumbnailBlob = new Blob(['thumbnail data'], { type: 'image/jpeg' });
    const fileBlob = new Blob(['file data'], { type: 'image/jpeg' });

    const imageMedia = createMockMediaItem('image', {
      thumbnail: thumbnailBlob,
      file: fileBlob,
    });

    renderMediaThumbnail({ media: imageMedia });

    // The first call should be with the thumbnail blob (preferred)
    expect(URL.createObjectURL).toHaveBeenCalledWith(thumbnailBlob);
  });

  it('falls back to file blob when thumbnail is not available', () => {
    const fileBlob = new Blob(['file data'], { type: 'image/jpeg' });

    const imageMedia = createMockMediaItem('image', {
      file: fileBlob,
      thumbnail: undefined,
    });

    renderMediaThumbnail({ media: imageMedia });

    expect(URL.createObjectURL).toHaveBeenCalledWith(fileBlob);
  });
});

// =============================================================================
// Integration Scenarios
// =============================================================================

describe('MediaThumbnail - Integration Scenarios', () => {
  it('handles complete image workflow: load -> display -> delete', async () => {
    const onDelete = jest.fn();
    const imageMedia = createMockMediaItem('image', {
      id: 'workflow-test',
      thumbnail: new Blob(['thumbnail'], { type: 'image/jpeg' }),
    });

    renderMediaThumbnail({ media: imageMedia, onDelete });

    // Initial: spinner shown
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();

    // Load image
    const img = screen.getByRole('img');
    fireEvent.load(img);

    // After load: spinner hidden, image visible
    await waitFor(() => {
      expect(document.querySelector('.animate-spin')).not.toBeInTheDocument();
      expect(img).toHaveClass('opacity-100');
    });

    // Click delete
    const deleteButton = screen.getByRole('button', { name: /delete media/i });
    fireEvent.click(deleteButton);

    expect(onDelete).toHaveBeenCalledWith('workflow-test');
  });

  it('handles video thumbnail with play overlay', async () => {
    const onClick = jest.fn();
    const videoMedia = createMockMediaItem('video', {
      id: 'video-workflow',
      thumbnail: new Blob(['thumbnail'], { type: 'image/jpeg' }),
      metadata: {
        mimeType: 'video/mp4',
        fileSize: 10240,
        source: 'capture',
        duration: 30,
      },
    });

    renderMediaThumbnail({ media: videoMedia, onClick });

    // Load thumbnail
    const img = screen.getByRole('img');
    fireEvent.load(img);

    // After load: play overlay should appear
    await waitFor(() => {
      const playOverlay = document.querySelector('.bg-black\\/50');
      expect(playOverlay).toBeInTheDocument();
    });

    // Click thumbnail (not delete button)
    const { container } = render(<div />); // dummy for reference
    const thumbnailContainer = document.querySelector('.group');
    if (thumbnailContainer) {
      fireEvent.click(thumbnailContainer);
    }

    // Should have been called from earlier render
    expect(onClick).toHaveBeenCalledWith('video-workflow');
  });

  it('handles PDF with page count display', () => {
    const pdfMedia = createMockMediaItem('pdf', {
      id: 'pdf-workflow',
      metadata: {
        mimeType: 'application/pdf',
        fileSize: 5120,
        source: 'upload',
        pageCount: 12,
        originalFilename: 'document.pdf',
      },
    });

    renderMediaThumbnail({ media: pdfMedia });

    // PDF should show document icon and page count
    expect(document.querySelector('.bg-blue-50')).toBeInTheDocument();
    expect(screen.getByText('12 pages')).toBeInTheDocument();

    // Should not create objectURL for display (PDF shows icon)
    // but may create for internal handling - this is implementation detail
  });
});
