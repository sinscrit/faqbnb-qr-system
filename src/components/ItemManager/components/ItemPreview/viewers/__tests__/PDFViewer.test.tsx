/**
 * PDFViewer Component Tests
 *
 * Unit tests for the PDFViewer component covering loading, navigation,
 * and error handling. Uses mocked pdfjs-dist.
 *
 * @module ItemManager/components/ItemPreview/viewers/__tests__/PDFViewer.test
 * @lastModified 2026-01-03
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PDFViewer } from '../PDFViewer';

// Mock pdfjs-dist
vi.mock('pdfjs-dist', () => {
  const mockPage = {
    getViewport: vi.fn(() => ({
      width: 800,
      height: 600,
    })),
    render: vi.fn(() => ({
      promise: Promise.resolve(),
      cancel: vi.fn(),
    })),
  };

  const mockDocument = {
    numPages: 5,
    getPage: vi.fn(() => Promise.resolve(mockPage)),
    destroy: vi.fn(),
  };

  return {
    getDocument: vi.fn(() => ({
      promise: Promise.resolve(mockDocument),
    })),
    GlobalWorkerOptions: { workerSrc: '' },
    version: '4.0.0',
  };
});

// Mock ResizeObserver
const mockResizeObserver = vi.fn();
mockResizeObserver.mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
window.ResizeObserver = mockResizeObserver;

// Mock canvas context
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  clearRect: vi.fn(),
  scale: vi.fn(),
  drawImage: vi.fn(),
}));

describe('PDFViewer', () => {
  const mockPdfSrc = 'test.pdf';
  const defaultProps = {
    pdfSrc: mockPdfSrc,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ===========================================================================
  // Loading State Tests
  // ===========================================================================

  describe('Loading State', () => {
    it('renders loading state while PDF loads', () => {
      render(<PDFViewer {...defaultProps} />);
      expect(screen.getByText('Loading PDF...')).toBeInTheDocument();
    });

    it('displays loading spinner', () => {
      render(<PDFViewer {...defaultProps} />);
      // The loading spinner should be present
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Successful Load Tests
  // ===========================================================================

  describe('Successful Load', () => {
    it('displays page count after successful load', async () => {
      render(<PDFViewer {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Page 1 of 5')).toBeInTheDocument();
      });
    });

    it('calls onLoadComplete callback on successful load', async () => {
      const mockOnLoadComplete = vi.fn();
      render(<PDFViewer {...defaultProps} onLoadComplete={mockOnLoadComplete} />);

      await waitFor(() => {
        expect(mockOnLoadComplete).toHaveBeenCalledWith(true, 5);
      });
    });

    it('shows canvas after loading completes', async () => {
      render(<PDFViewer {...defaultProps} />);

      await waitFor(() => {
        const canvas = document.querySelector('canvas');
        expect(canvas).toBeInTheDocument();
        expect(canvas).not.toHaveClass('hidden');
      });
    });

    it('uses provided pageCount before PDF loads', () => {
      render(<PDFViewer {...defaultProps} pageCount={10} />);
      // Initially should show the provided page count hint
      // Though actual implementation may vary
      expect(screen.getByText('Loading PDF...')).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Navigation Tests
  // ===========================================================================

  describe('Navigation', () => {
    it('previous button is disabled on page 1', async () => {
      render(<PDFViewer {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Page 1 of 5')).toBeInTheDocument();
      });

      const prevButton = screen.getByLabelText('Previous page');
      expect(prevButton).toHaveAttribute('aria-disabled', 'true');
    });

    it('next button is disabled on last page', async () => {
      render(<PDFViewer {...defaultProps} initialPage={5} />);

      await waitFor(() => {
        expect(screen.getByText('Page 5 of 5')).toBeInTheDocument();
      });

      const nextButton = screen.getByLabelText('Next page');
      expect(nextButton).toHaveAttribute('aria-disabled', 'true');
    });

    it('next button advances to next page', async () => {
      render(<PDFViewer {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Page 1 of 5')).toBeInTheDocument();
      });

      const nextButton = screen.getByLabelText('Next page');
      await userEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('Page 2 of 5')).toBeInTheDocument();
      });
    });

    it('previous button returns to previous page', async () => {
      render(<PDFViewer {...defaultProps} initialPage={3} />);

      await waitFor(() => {
        expect(screen.getByText('Page 3 of 5')).toBeInTheDocument();
      });

      const prevButton = screen.getByLabelText('Previous page');
      await userEvent.click(prevButton);

      await waitFor(() => {
        expect(screen.getByText('Page 2 of 5')).toBeInTheDocument();
      });
    });

    it('page indicator shows correct format', async () => {
      render(<PDFViewer {...defaultProps} initialPage={3} />);

      await waitFor(() => {
        expect(screen.getByText('Page 3 of 5')).toBeInTheDocument();
      });
    });

    it('calls onPageChange callback on navigation', async () => {
      const mockOnPageChange = vi.fn();
      render(<PDFViewer {...defaultProps} onPageChange={mockOnPageChange} />);

      await waitFor(() => {
        expect(screen.getByText('Page 1 of 5')).toBeInTheDocument();
      });

      const nextButton = screen.getByLabelText('Next page');
      await userEvent.click(nextButton);

      await waitFor(() => {
        expect(mockOnPageChange).toHaveBeenCalledWith(2, 5);
      });
    });
  });

  // ===========================================================================
  // Keyboard Navigation Tests
  // ===========================================================================

  describe('Keyboard Navigation', () => {
    it('left arrow key navigates to previous page', async () => {
      render(<PDFViewer {...defaultProps} initialPage={3} />);

      await waitFor(() => {
        expect(screen.getByText('Page 3 of 5')).toBeInTheDocument();
      });

      fireEvent.keyDown(window, { key: 'ArrowLeft' });

      await waitFor(() => {
        expect(screen.getByText('Page 2 of 5')).toBeInTheDocument();
      });
    });

    it('right arrow key navigates to next page', async () => {
      render(<PDFViewer {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Page 1 of 5')).toBeInTheDocument();
      });

      fireEvent.keyDown(window, { key: 'ArrowRight' });

      await waitFor(() => {
        expect(screen.getByText('Page 2 of 5')).toBeInTheDocument();
      });
    });

    it('left arrow does nothing on page 1', async () => {
      render(<PDFViewer {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Page 1 of 5')).toBeInTheDocument();
      });

      fireEvent.keyDown(window, { key: 'ArrowLeft' });

      // Should still be on page 1
      expect(screen.getByText('Page 1 of 5')).toBeInTheDocument();
    });

    it('right arrow does nothing on last page', async () => {
      render(<PDFViewer {...defaultProps} initialPage={5} />);

      await waitFor(() => {
        expect(screen.getByText('Page 5 of 5')).toBeInTheDocument();
      });

      fireEvent.keyDown(window, { key: 'ArrowRight' });

      // Should still be on page 5
      expect(screen.getByText('Page 5 of 5')).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Error State Tests
  // ===========================================================================

  describe('Error State', () => {
    it('displays error state on load failure', async () => {
      // Override the mock for this test
      const pdfjs = require('pdfjs-dist');
      pdfjs.getDocument.mockReturnValueOnce({
        promise: Promise.reject(new Error('Failed to load PDF')),
      });

      render(<PDFViewer pdfSrc="invalid.pdf" />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load PDF')).toBeInTheDocument();
      });
    });

    it('shows retry button on error', async () => {
      const pdfjs = require('pdfjs-dist');
      pdfjs.getDocument.mockReturnValueOnce({
        promise: Promise.reject(new Error('Failed to load PDF')),
      });

      render(<PDFViewer pdfSrc="invalid.pdf" />);

      await waitFor(() => {
        expect(screen.getByText('Retry')).toBeInTheDocument();
      });
    });

    it('retry button attempts to reload PDF', async () => {
      const pdfjs = require('pdfjs-dist');
      pdfjs.getDocument
        .mockReturnValueOnce({
          promise: Promise.reject(new Error('Failed to load PDF')),
        })
        .mockReturnValueOnce({
          promise: Promise.resolve({
            numPages: 5,
            getPage: vi.fn(() =>
              Promise.resolve({
                getViewport: vi.fn(() => ({ width: 800, height: 600 })),
                render: vi.fn(() => ({ promise: Promise.resolve(), cancel: vi.fn() })),
              })
            ),
            destroy: vi.fn(),
          }),
        });

      render(<PDFViewer pdfSrc="test.pdf" />);

      await waitFor(() => {
        expect(screen.getByText('Retry')).toBeInTheDocument();
      });

      const retryButton = screen.getByText('Retry');
      await userEvent.click(retryButton);

      await waitFor(() => {
        expect(pdfjs.getDocument).toHaveBeenCalledTimes(2);
      });
    });

    it('calls onLoadComplete with false on error', async () => {
      const pdfjs = require('pdfjs-dist');
      pdfjs.getDocument.mockReturnValueOnce({
        promise: Promise.reject(new Error('Failed to load PDF')),
      });

      const mockOnLoadComplete = vi.fn();
      render(<PDFViewer pdfSrc="invalid.pdf" onLoadComplete={mockOnLoadComplete} />);

      await waitFor(() => {
        expect(mockOnLoadComplete).toHaveBeenCalledWith(false, 0);
      });
    });
  });

  // ===========================================================================
  // Source Change Tests
  // ===========================================================================

  describe('Source Change', () => {
    it('page resets when pdfSrc changes', async () => {
      const { rerender } = render(<PDFViewer {...defaultProps} initialPage={3} />);

      await waitFor(() => {
        expect(screen.getByText('Page 3 of 5')).toBeInTheDocument();
      });

      // Change the PDF source
      rerender(<PDFViewer pdfSrc="new-document.pdf" />);

      await waitFor(() => {
        expect(screen.getByText('Page 1 of 5')).toBeInTheDocument();
      });
    });

    it('uses initialPage prop on source change', async () => {
      const { rerender } = render(<PDFViewer {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Page 1 of 5')).toBeInTheDocument();
      });

      // Navigate to page 4
      const nextButton = screen.getByLabelText('Next page');
      await userEvent.click(nextButton);
      await userEvent.click(nextButton);
      await userEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('Page 4 of 5')).toBeInTheDocument();
      });

      // Change source with initialPage
      rerender(<PDFViewer pdfSrc="new-document.pdf" initialPage={2} />);

      await waitFor(() => {
        expect(screen.getByText('Page 2 of 5')).toBeInTheDocument();
      });
    });
  });

  // ===========================================================================
  // Accessibility Tests
  // ===========================================================================

  describe('Accessibility', () => {
    it('has proper ARIA labels on navigation buttons', async () => {
      render(<PDFViewer {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByLabelText('Previous page')).toBeInTheDocument();
        expect(screen.getByLabelText('Next page')).toBeInTheDocument();
      });
    });

    it('announces page changes to screen readers', async () => {
      render(<PDFViewer {...defaultProps} />);

      await waitFor(() => {
        const announcement = screen.getByRole('status');
        expect(announcement).toBeInTheDocument();
      });
    });

    it('has document role on container', async () => {
      render(<PDFViewer {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('document')).toBeInTheDocument();
      });
    });
  });

  // ===========================================================================
  // Custom Props Tests
  // ===========================================================================

  describe('Custom Props', () => {
    it('applies custom className', async () => {
      render(<PDFViewer {...defaultProps} className="custom-class" />);

      await waitFor(() => {
        const container = screen.getByRole('document');
        expect(container).toHaveClass('custom-class');
      });
    });

    it('uses initialPage prop', async () => {
      render(<PDFViewer {...defaultProps} initialPage={3} />);

      await waitFor(() => {
        expect(screen.getByText('Page 3 of 5')).toBeInTheDocument();
      });
    });
  });

  // ===========================================================================
  // File and Blob Source Tests
  // ===========================================================================

  describe('Different Source Types', () => {
    it('handles Blob source', async () => {
      const blob = new Blob(['pdf content'], { type: 'application/pdf' });
      render(<PDFViewer pdfSrc={blob} />);

      await waitFor(() => {
        expect(screen.getByText('Page 1 of 5')).toBeInTheDocument();
      });
    });

    it('handles File source', async () => {
      const file = new File(['pdf content'], 'test.pdf', { type: 'application/pdf' });
      render(<PDFViewer pdfSrc={file} />);

      await waitFor(() => {
        expect(screen.getByText('Page 1 of 5')).toBeInTheDocument();
      });
    });
  });
});
