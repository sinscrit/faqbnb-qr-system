/**
 * ContentPieceCard Component Tests
 *
 * @module ItemCreationWorkflow/components/shared/__tests__/ContentPieceCard.test
 * @lastModified 2026-01-10 (REQ-169 Mobile visibility tests)
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import { ContentPieceCard } from '../ContentPieceCard';
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
  data: { type: 'video', file: new Blob(['video'], { type: 'video/mp4' }), duration: 45 },
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
  data: { type: 'pdf', file: new Blob(['pdf'], { type: 'application/pdf' }), pageCount: 5 },
  order: 0,
};

const mockTextContent: ContentPiece = {
  id: 'text-1',
  type: 'text',
  data: { type: 'text', text: 'This is sample text content for testing the preview display.' },
  order: 0,
};

const mockUrlContent: ContentPiece = {
  id: 'url-1',
  type: 'url',
  data: {
    type: 'url',
    url: 'https://example.com',
    title: 'Example Website',
    thumbnailUrl: 'https://example.com/thumb.jpg',
  },
  order: 0,
};

describe('ContentPieceCard', () => {
  const defaultProps = {
    content: mockPhotoContent,
    onRemove: vi.fn(),
    onRetake: vi.fn(),
    disabled: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ===========================================================================
  // Content Type Rendering Tests
  // ===========================================================================

  describe('content type rendering', () => {
    it('renders video preview with duration overlay', () => {
      render(<ContentPieceCard {...defaultProps} content={mockVideoContent} />);

      // Check for video type badge
      expect(screen.getByText('Video')).toBeInTheDocument();

      // Check for duration display (0:45)
      expect(screen.getByText('0:45')).toBeInTheDocument();
    });

    it('renders photo thumbnail', async () => {
      render(<ContentPieceCard {...defaultProps} content={mockPhotoContent} />);

      // Check for photo type badge
      expect(screen.getByText('Photo')).toBeInTheDocument();

      // Verify object URL was created
      await waitFor(() => {
        expect(mockCreateObjectURL).toHaveBeenCalled();
      });
    });

    it('renders PDF preview with page count', () => {
      render(<ContentPieceCard {...defaultProps} content={mockPdfContent} />);

      // Check for PDF type badge
      expect(screen.getByText('PDF')).toBeInTheDocument();

      // Check for page count
      expect(screen.getByText('5 pages')).toBeInTheDocument();
    });

    it('renders PDF preview with singular page count', () => {
      const singlePagePdf: ContentPiece = {
        ...mockPdfContent,
        data: { type: 'pdf', file: new Blob(['pdf'], { type: 'application/pdf' }), pageCount: 1 },
      };
      render(<ContentPieceCard {...defaultProps} content={singlePagePdf} />);

      expect(screen.getByText('1 page')).toBeInTheDocument();
    });

    it('renders text preview with truncation', () => {
      const longTextContent: ContentPiece = {
        ...mockTextContent,
        data: {
          type: 'text',
          text: 'A'.repeat(150), // Longer than 100 chars
        },
      };
      render(<ContentPieceCard {...defaultProps} content={longTextContent} />);

      // Check for Text type badge
      expect(screen.getByText('Text')).toBeInTheDocument();

      // The truncated text should end with ...
      const truncatedText = screen.getByText((content) => content.includes('...'));
      expect(truncatedText).toBeInTheDocument();
    });

    it('renders URL preview with metadata', () => {
      render(<ContentPieceCard {...defaultProps} content={mockUrlContent} />);

      // Check for Link type badge
      expect(screen.getByText('Link')).toBeInTheDocument();
    });

    it('renders URL preview without thumbnail using title', () => {
      const urlWithoutThumb: ContentPiece = {
        ...mockUrlContent,
        data: {
          type: 'url',
          url: 'https://example.com',
          title: 'Example Website',
        },
      };
      render(<ContentPieceCard {...defaultProps} content={urlWithoutThumb} />);

      expect(screen.getByText('Example Website')).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Action Button Tests
  // ===========================================================================

  describe('action buttons', () => {
    it('calls onRemove when remove button clicked', () => {
      render(<ContentPieceCard {...defaultProps} />);

      const removeButton = screen.getByRole('button', { name: /remove content/i });
      fireEvent.click(removeButton);

      expect(defaultProps.onRemove).toHaveBeenCalledWith('photo-1');
      expect(defaultProps.onRemove).toHaveBeenCalledTimes(1);
    });

    it('calls onRetake when retake button clicked', () => {
      render(<ContentPieceCard {...defaultProps} />);

      const retakeButton = screen.getByRole('button', { name: /retake content/i });
      fireEvent.click(retakeButton);

      expect(defaultProps.onRetake).toHaveBeenCalledWith('photo-1');
      expect(defaultProps.onRetake).toHaveBeenCalledTimes(1);
    });

    it('disables actions when disabled prop is true', () => {
      render(<ContentPieceCard {...defaultProps} disabled={true} />);

      const removeButton = screen.getByRole('button', { name: /remove content/i });
      const retakeButton = screen.getByRole('button', { name: /retake content/i });

      expect(removeButton).toBeDisabled();
      expect(retakeButton).toBeDisabled();
    });

    it('hides remove button when onRemove not provided', () => {
      render(<ContentPieceCard content={mockPhotoContent} onRetake={vi.fn()} />);

      expect(screen.queryByRole('button', { name: /remove content/i })).not.toBeInTheDocument();
    });

    it('hides retake button when onRetake not provided', () => {
      render(<ContentPieceCard content={mockPhotoContent} onRemove={vi.fn()} />);

      expect(screen.queryByRole('button', { name: /retake content/i })).not.toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Styling Tests
  // ===========================================================================

  describe('styling', () => {
    it('applies disabled styling when disabled', () => {
      render(<ContentPieceCard {...defaultProps} disabled={true} />);

      const card = screen.getByRole('listitem');
      expect(card).toHaveClass('opacity-60', 'pointer-events-none');
    });

    it('applies custom className', () => {
      render(<ContentPieceCard {...defaultProps} className="custom-test-class" />);

      const card = screen.getByRole('listitem');
      expect(card).toHaveClass('custom-test-class');
    });

    it('has correct type badge colors for video', () => {
      render(<ContentPieceCard {...defaultProps} content={mockVideoContent} />);

      const badge = screen.getByText('Video').parentElement;
      expect(badge).toHaveClass('bg-purple-100', 'text-purple-700');
    });

    it('has correct type badge colors for photo', () => {
      render(<ContentPieceCard {...defaultProps} content={mockPhotoContent} />);

      const badge = screen.getByText('Photo').parentElement;
      expect(badge).toHaveClass('bg-blue-100', 'text-blue-700');
    });

    it('has correct type badge colors for PDF', () => {
      render(<ContentPieceCard {...defaultProps} content={mockPdfContent} />);

      const badge = screen.getByText('PDF').parentElement;
      expect(badge).toHaveClass('bg-amber-100', 'text-amber-700');
    });

    it('has correct type badge colors for text', () => {
      render(<ContentPieceCard {...defaultProps} content={mockTextContent} />);

      const badge = screen.getByText('Text').parentElement;
      expect(badge).toHaveClass('bg-green-100', 'text-green-700');
    });

    it('has correct type badge colors for URL', () => {
      render(<ContentPieceCard {...defaultProps} content={mockUrlContent} />);

      const badge = screen.getByText('Link').parentElement;
      expect(badge).toHaveClass('bg-indigo-100', 'text-indigo-700');
    });
  });

  // ===========================================================================
  // Accessibility Tests
  // ===========================================================================

  describe('accessibility', () => {
    it('has appropriate aria-label on card', () => {
      render(<ContentPieceCard {...defaultProps} />);

      const card = screen.getByRole('listitem');
      expect(card).toHaveAttribute('aria-label', 'Photo content piece');
    });

    it('has aria-label on action buttons', () => {
      render(<ContentPieceCard {...defaultProps} />);

      expect(screen.getByRole('button', { name: /remove content/i })).toHaveAttribute('aria-label', 'Remove content');
      expect(screen.getByRole('button', { name: /retake content/i })).toHaveAttribute('aria-label', 'Retake content');
    });

    it('buttons are keyboard accessible', async () => {
      render(<ContentPieceCard {...defaultProps} />);

      const removeButton = screen.getByRole('button', { name: /remove content/i });
      removeButton.focus();
      expect(document.activeElement).toBe(removeButton);
    });

    it('has minimum touch target size on buttons', () => {
      render(<ContentPieceCard {...defaultProps} />);

      const removeButton = screen.getByRole('button', { name: /remove content/i });
      const retakeButton = screen.getByRole('button', { name: /retake content/i });

      expect(removeButton).toHaveClass('min-w-[44px]', 'min-h-[44px]');
      expect(retakeButton).toHaveClass('min-w-[44px]', 'min-h-[44px]');
    });
  });

  // ===========================================================================
  // Mobile Visibility Tests (REQ-169)
  // ===========================================================================

  describe('mobile visibility', () => {
    it('action buttons container has mobile-first visible classes', () => {
      const { container } = render(<ContentPieceCard {...defaultProps} />);

      // Find the action button container (div containing the buttons)
      const removeButton = screen.getByRole('button', { name: /remove content/i });
      const actionContainer = removeButton.parentElement?.parentElement;

      // Container should have opacity-100 for mobile visibility
      expect(actionContainer).toHaveClass('opacity-100');

      // Container should have md:opacity-0 for desktop hover behavior
      expect(actionContainer).toHaveClass('md:opacity-0');

      // Container should have md:group-hover:opacity-100 for desktop hover
      expect(actionContainer).toHaveClass('md:group-hover:opacity-100');

      // Container should have md:focus-within:opacity-100 for keyboard accessibility
      expect(actionContainer).toHaveClass('md:focus-within:opacity-100');
    });
  });

  // ===========================================================================
  // Cleanup Tests
  // ===========================================================================

  describe('cleanup', () => {
    it('revokes object URLs on unmount', () => {
      const { unmount } = render(<ContentPieceCard {...defaultProps} content={mockPhotoContent} />);

      unmount();

      expect(mockRevokeObjectURL).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // Edge Cases
  // ===========================================================================

  describe('edge cases', () => {
    it('handles video without duration', () => {
      const videoNoDuration: ContentPiece = {
        id: 'video-no-duration',
        type: 'video',
        data: { type: 'video', file: new Blob(['video'], { type: 'video/mp4' }) },
        order: 0,
      };

      render(<ContentPieceCard {...defaultProps} content={videoNoDuration} />);

      expect(screen.getByText('Video')).toBeInTheDocument();
      // Duration overlay should not be present
      expect(screen.queryByText(/:/)).not.toBeInTheDocument();
    });

    it('handles PDF without page count', () => {
      const pdfNoCount: ContentPiece = {
        id: 'pdf-no-count',
        type: 'pdf',
        data: { type: 'pdf', file: new Blob(['pdf'], { type: 'application/pdf' }) },
        order: 0,
      };

      render(<ContentPieceCard {...defaultProps} content={pdfNoCount} />);

      expect(screen.getByText('PDF')).toBeInTheDocument();
      expect(screen.queryByText(/page/)).not.toBeInTheDocument();
    });

    it('handles short text without truncation', () => {
      const shortText: ContentPiece = {
        id: 'text-short',
        type: 'text',
        data: { type: 'text', text: 'Short text' },
        order: 0,
      };

      render(<ContentPieceCard {...defaultProps} content={shortText} />);

      expect(screen.getByText('Short text')).toBeInTheDocument();
      expect(screen.queryByText('...')).not.toBeInTheDocument();
    });

    it('handles URL without title (falls back to hostname)', () => {
      const urlNoTitle: ContentPiece = {
        id: 'url-no-title',
        type: 'url',
        data: { type: 'url', url: 'https://example.com/page' },
        order: 0,
      };

      render(<ContentPieceCard {...defaultProps} content={urlNoTitle} />);

      expect(screen.getByText('example.com')).toBeInTheDocument();
    });
  });
});
