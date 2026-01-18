/**
 * ContentPreview Component Tests
 *
 * @module ItemCreationWorkflow/components/shared/__tests__/ContentPreview.test
 * @lastModified 2026-01-10
 */

import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ContentPreview } from '../ContentPreview';
import type { ContentPiece } from '../../../ItemCreationWorkflow.types';

// Mock URL.createObjectURL and revokeObjectURL
const mockCreateObjectURL = vi.fn(() => 'blob:test-url');
const mockRevokeObjectURL = vi.fn();

beforeAll(() => {
  global.URL.createObjectURL = mockCreateObjectURL;
  global.URL.revokeObjectURL = mockRevokeObjectURL;
});

beforeEach(() => {
  vi.clearAllMocks();
});

// =============================================================================
// Test Fixtures
// =============================================================================

const mockVideoContent: ContentPiece = {
  id: 'video-1',
  type: 'video',
  data: { type: 'video', file: new Blob(['video'], { type: 'video/mp4' }), duration: 90 },
  order: 0,
};

const mockPhotoContent: ContentPiece = {
  id: 'photo-1',
  type: 'photo',
  data: { type: 'photo', file: new Blob(['image'], { type: 'image/jpeg' }) },
  order: 0,
};

const mockPdfContent: ContentPiece = {
  id: 'pdf-1',
  type: 'pdf',
  data: { type: 'pdf', file: new Blob(['pdf'], { type: 'application/pdf' }), pageCount: 12 },
  order: 0,
};

const mockTextContent: ContentPiece = {
  id: 'text-1',
  type: 'text',
  data: { type: 'text', text: 'Sample text content for testing the preview component.' },
  order: 0,
};

const mockUrlContent: ContentPiece = {
  id: 'url-1',
  type: 'url',
  data: {
    type: 'url',
    url: 'https://example.com',
    title: 'Example Website',
    faviconUrl: 'https://example.com/favicon.ico',
  },
  order: 0,
};

describe('ContentPreview', () => {
  // ===========================================================================
  // Content Type Rendering Tests
  // ===========================================================================

  describe('content type rendering', () => {
    it('renders video preview with duration badge', async () => {
      render(<ContentPreview content={mockVideoContent} />);

      expect(screen.getByText('Video')).toBeInTheDocument();
      expect(screen.getByText('1:30')).toBeInTheDocument(); // 90 seconds = 1:30

      await waitFor(() => {
        expect(mockCreateObjectURL).toHaveBeenCalled();
      });
    });

    it('renders photo preview', async () => {
      render(<ContentPreview content={mockPhotoContent} />);

      expect(screen.getByText('Photo')).toBeInTheDocument();

      await waitFor(() => {
        expect(mockCreateObjectURL).toHaveBeenCalled();
      });
    });

    it('renders PDF preview with page count', () => {
      render(<ContentPreview content={mockPdfContent} />);

      expect(screen.getByText('PDF')).toBeInTheDocument();
      expect(screen.getByText('12 pages')).toBeInTheDocument();
    });

    it('renders PDF preview with singular page count', () => {
      const singlePagePdf: ContentPiece = {
        ...mockPdfContent,
        data: { type: 'pdf', file: new Blob(['pdf'], { type: 'application/pdf' }), pageCount: 1 },
      };
      render(<ContentPreview content={singlePagePdf} />);

      expect(screen.getByText('1 page')).toBeInTheDocument();
    });

    it('renders text preview with truncated content', () => {
      render(<ContentPreview content={mockTextContent} />);

      expect(screen.getByText('Text')).toBeInTheDocument();
      // Text should be visible (under truncation limit for medium size)
      expect(screen.getByText(/Sample text content/)).toBeInTheDocument();
    });

    it('renders URL preview with title', () => {
      render(<ContentPreview content={mockUrlContent} />);

      expect(screen.getByText('Link')).toBeInTheDocument();
      expect(screen.getByText('Example Website')).toBeInTheDocument();
    });

    it('renders URL preview with domain when no title', () => {
      const urlNoTitle: ContentPiece = {
        ...mockUrlContent,
        data: { type: 'url', url: 'https://example.com/page' },
      };
      render(<ContentPreview content={urlNoTitle} />);

      expect(screen.getByText('example.com')).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Size Variant Tests
  // ===========================================================================

  describe('size variants', () => {
    it('renders small size with correct dimensions', () => {
      const { container } = render(<ContentPreview content={mockPhotoContent} size="small" />);

      const preview = container.firstChild as HTMLElement;
      expect(preview).toHaveStyle({ width: '80px', height: '80px' });
    });

    it('renders medium size with correct dimensions', () => {
      const { container } = render(<ContentPreview content={mockPhotoContent} size="medium" />);

      const preview = container.firstChild as HTMLElement;
      expect(preview).toHaveStyle({ width: '120px', height: '120px' });
    });

    it('renders large size with correct dimensions', () => {
      const { container } = render(<ContentPreview content={mockPhotoContent} size="large" />);

      const preview = container.firstChild as HTMLElement;
      expect(preview).toHaveStyle({ width: '200px', height: '200px' });
    });

    it('hides type label in small size', () => {
      render(<ContentPreview content={mockPhotoContent} size="small" />);

      // Icon should be present but label text should not
      expect(screen.queryByText('Photo')).not.toBeInTheDocument();
    });

    it('defaults to medium size', () => {
      const { container } = render(<ContentPreview content={mockPhotoContent} />);

      const preview = container.firstChild as HTMLElement;
      expect(preview).toHaveStyle({ width: '120px', height: '120px' });
    });
  });

  // ===========================================================================
  // Loading State Tests
  // ===========================================================================

  describe('loading state', () => {
    it('shows loading skeleton when isLoading is true', () => {
      render(<ContentPreview content={mockPhotoContent} isLoading={true} />);

      expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
      expect(screen.getByText('Loading preview...')).toBeInTheDocument();
    });

    it('shows content when isLoading is false', () => {
      render(<ContentPreview content={mockPhotoContent} isLoading={false} />);

      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('skeleton has type-specific background color', () => {
      const { container } = render(<ContentPreview content={mockPhotoContent} isLoading={true} />);
      const skeleton = container.querySelector('[role="status"]');
      expect(skeleton).toHaveClass('bg-blue-50'); // photo type color
    });
  });

  // ===========================================================================
  // Type Badge Tests
  // ===========================================================================

  describe('type badge', () => {
    it('shows type badge by default', () => {
      render(<ContentPreview content={mockPhotoContent} />);

      expect(screen.getByText('Photo')).toBeInTheDocument();
    });

    it('hides type badge when showTypeBadge is false', () => {
      render(<ContentPreview content={mockPhotoContent} showTypeBadge={false} />);

      expect(screen.queryByText('Photo')).not.toBeInTheDocument();
    });

    it('has correct badge colors for each type', () => {
      // Video - purple
      const { rerender } = render(<ContentPreview content={mockVideoContent} />);
      expect(screen.getByText('Video').parentElement).toHaveClass('bg-purple-100', 'text-purple-700');

      // Photo - blue
      rerender(<ContentPreview content={mockPhotoContent} />);
      expect(screen.getByText('Photo').parentElement).toHaveClass('bg-blue-100', 'text-blue-700');

      // PDF - amber
      rerender(<ContentPreview content={mockPdfContent} />);
      expect(screen.getByText('PDF').parentElement).toHaveClass('bg-amber-100', 'text-amber-700');

      // Text - green
      rerender(<ContentPreview content={mockTextContent} />);
      expect(screen.getByText('Text').parentElement).toHaveClass('bg-green-100', 'text-green-700');

      // URL - indigo
      rerender(<ContentPreview content={mockUrlContent} />);
      expect(screen.getByText('Link').parentElement).toHaveClass('bg-indigo-100', 'text-indigo-700');
    });
  });

  // ===========================================================================
  // Remove Button Tests
  // ===========================================================================

  describe('remove button', () => {
    it('shows remove button when showRemove is true', () => {
      render(<ContentPreview content={mockPhotoContent} showRemove={true} onRemove={vi.fn()} />);

      expect(screen.getByRole('button', { name: /remove content/i })).toBeInTheDocument();
    });

    it('hides remove button when showRemove is false', () => {
      render(<ContentPreview content={mockPhotoContent} showRemove={false} />);

      expect(screen.queryByRole('button', { name: /remove content/i })).not.toBeInTheDocument();
    });

    it('hides remove button when onRemove not provided', () => {
      render(<ContentPreview content={mockPhotoContent} showRemove={true} />);

      expect(screen.queryByRole('button', { name: /remove content/i })).not.toBeInTheDocument();
    });

    it('calls onRemove when remove button clicked', () => {
      const mockOnRemove = vi.fn();
      render(<ContentPreview content={mockPhotoContent} showRemove={true} onRemove={mockOnRemove} />);

      const removeButton = screen.getByRole('button', { name: /remove content/i });
      removeButton.click();

      expect(mockOnRemove).toHaveBeenCalledTimes(1);
    });
  });

  // ===========================================================================
  // Cleanup Tests
  // ===========================================================================

  describe('cleanup', () => {
    it('revokes object URLs on unmount', async () => {
      const { unmount } = render(<ContentPreview content={mockPhotoContent} />);

      await waitFor(() => {
        expect(mockCreateObjectURL).toHaveBeenCalled();
      });

      unmount();

      expect(mockRevokeObjectURL).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // Accessibility Tests
  // ===========================================================================

  describe('accessibility', () => {
    it('has appropriate aria-label on container', () => {
      const { container } = render(<ContentPreview content={mockPhotoContent} />);

      const previewContainer = container.firstChild as HTMLElement;
      expect(previewContainer).toHaveAttribute('role', 'img');
      expect(previewContainer).toHaveAttribute('aria-label', 'Photo content preview');
    });

    it('remove button has accessible label', () => {
      render(<ContentPreview content={mockPhotoContent} showRemove={true} onRemove={vi.fn()} />);

      expect(screen.getByRole('button', { name: /remove content/i })).toHaveAttribute('aria-label', 'Remove content');
    });

    it('loading state has aria-busy', () => {
      render(<ContentPreview content={mockPhotoContent} isLoading={true} />);

      expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
    });

    it('type badge is aria-hidden', () => {
      render(<ContentPreview content={mockPhotoContent} />);

      const badge = screen.getByText('Photo').parentElement;
      expect(badge).toHaveAttribute('aria-hidden', 'true');
    });
  });

  // ===========================================================================
  // Edge Cases
  // ===========================================================================

  describe('edge cases', () => {
    it('handles video without duration', async () => {
      const videoNoDuration: ContentPiece = {
        id: 'video-no-duration',
        type: 'video',
        data: { type: 'video', file: new Blob(['video'], { type: 'video/mp4' }) },
        order: 0,
      };

      render(<ContentPreview content={videoNoDuration} />);

      expect(screen.getByText('Video')).toBeInTheDocument();
      // Duration badge should not be present
      expect(screen.queryByText(/:/)).not.toBeInTheDocument();
    });

    it('handles PDF without page count', () => {
      const pdfNoCount: ContentPiece = {
        id: 'pdf-no-count',
        type: 'pdf',
        data: { type: 'pdf', file: new Blob(['pdf'], { type: 'application/pdf' }) },
        order: 0,
      };

      render(<ContentPreview content={pdfNoCount} />);

      expect(screen.getByText('PDF')).toBeInTheDocument();
      expect(screen.queryByText(/page/)).not.toBeInTheDocument();
    });

    it('handles long text with truncation', () => {
      const longTextContent: ContentPiece = {
        id: 'text-long',
        type: 'text',
        data: { type: 'text', text: 'A'.repeat(200) }, // Longer than truncation limit
        order: 0,
      };

      render(<ContentPreview content={longTextContent} size="medium" />);

      // The truncated text should end with ...
      const truncatedText = screen.getByText((content) => content.includes('...'));
      expect(truncatedText).toBeInTheDocument();
    });

    it('handles URL with thumbnail', () => {
      const urlWithThumb: ContentPiece = {
        ...mockUrlContent,
        data: {
          type: 'url',
          url: 'https://example.com',
          title: 'Example Website',
          thumbnailUrl: 'https://example.com/thumb.jpg',
        },
      };

      render(<ContentPreview content={urlWithThumb} />);

      // Should show thumbnail image instead of favicon + title layout
      const img = screen.getByAltText('Example Website');
      expect(img).toHaveAttribute('src', 'https://example.com/thumb.jpg');
    });

    it('applies custom className', () => {
      const { container } = render(
        <ContentPreview content={mockPhotoContent} className="custom-test-class" />
      );

      const preview = container.firstChild as HTMLElement;
      expect(preview).toHaveClass('custom-test-class');
    });
  });
});
