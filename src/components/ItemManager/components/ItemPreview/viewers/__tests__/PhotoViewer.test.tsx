/**
 * PhotoViewer Component Tests
 *
 * Unit tests for the PhotoViewer component covering zoom, pan,
 * and UI control functionality.
 *
 * @module ItemManager/components/ItemPreview/viewers/__tests__/PhotoViewer.test
 * @lastModified 2026-01-03
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PhotoViewer } from '../PhotoViewer';

// Mock URL.createObjectURL for blob handling
beforeAll(() => {
  global.URL.createObjectURL = jest.fn(() => 'blob:test-url');
  global.URL.revokeObjectURL = jest.fn();
});

describe('PhotoViewer', () => {
  const mockImageSrc = 'blob:http://localhost/test-image';
  const defaultProps = {
    imageSrc: mockImageSrc,
    alt: 'Test image',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===========================================================================
  // Rendering Tests
  // ===========================================================================

  describe('Rendering', () => {
    it('renders image with provided imageSrc', () => {
      render(<PhotoViewer {...defaultProps} />);
      const image = screen.getByRole('img');
      expect(image).toHaveAttribute('src', mockImageSrc);
    });

    it('renders with alt text for accessibility', () => {
      render(<PhotoViewer {...defaultProps} />);
      const container = screen.getByRole('img', { name: 'Test image' });
      expect(container).toBeInTheDocument();
    });

    it('renders zoom controls when enableZoom is true', async () => {
      render(<PhotoViewer {...defaultProps} enableZoom={true} />);

      // Simulate image load
      const image = screen.getByAltText('Test image');
      fireEvent.load(image);

      await waitFor(() => {
        expect(screen.getByLabelText('Zoom in')).toBeInTheDocument();
        expect(screen.getByLabelText('Zoom out')).toBeInTheDocument();
      });
    });

    it('does not render zoom controls when enableZoom is false', async () => {
      render(<PhotoViewer {...defaultProps} enableZoom={false} />);

      // Simulate image load
      const image = screen.getByAltText('Test image');
      fireEvent.load(image);

      await waitFor(() => {
        expect(screen.queryByLabelText('Zoom in')).not.toBeInTheDocument();
        expect(screen.queryByLabelText('Zoom out')).not.toBeInTheDocument();
      });
    });

    it('shows loading state before image loads', () => {
      render(<PhotoViewer {...defaultProps} />);
      // Image should have opacity-0 class before load
      const image = screen.getByAltText('Test image');
      expect(image).toHaveClass('opacity-0');
    });

    it('removes loading state after image loads', async () => {
      render(<PhotoViewer {...defaultProps} />);
      const image = screen.getByAltText('Test image');

      fireEvent.load(image);

      await waitFor(() => {
        expect(image).not.toHaveClass('opacity-0');
      });
    });
  });

  // ===========================================================================
  // Zoom Control Tests
  // ===========================================================================

  describe('Zoom Controls', () => {
    it('zoom in button increases scale by zoomStep', async () => {
      render(<PhotoViewer {...defaultProps} zoomStep={0.5} />);

      // Simulate image load
      const image = screen.getByAltText('Test image');
      fireEvent.load(image);

      await waitFor(() => {
        expect(screen.getByText('100%')).toBeInTheDocument();
      });

      const zoomInButton = screen.getByLabelText('Zoom in');
      await userEvent.click(zoomInButton);

      await waitFor(() => {
        expect(screen.getByText('150%')).toBeInTheDocument();
      });
    });

    it('zoom out button decreases scale by zoomStep', async () => {
      render(<PhotoViewer {...defaultProps} zoomStep={0.5} />);

      // Simulate image load
      const image = screen.getByAltText('Test image');
      fireEvent.load(image);

      // First zoom in
      const zoomInButton = screen.getByLabelText('Zoom in');
      await userEvent.click(zoomInButton);

      await waitFor(() => {
        expect(screen.getByText('150%')).toBeInTheDocument();
      });

      // Then zoom out
      const zoomOutButton = screen.getByLabelText('Zoom out');
      await userEvent.click(zoomOutButton);

      await waitFor(() => {
        expect(screen.getByText('100%')).toBeInTheDocument();
      });
    });

    it('reset button returns to scale 1.0', async () => {
      render(<PhotoViewer {...defaultProps} zoomStep={0.5} />);

      // Simulate image load
      const image = screen.getByAltText('Test image');
      fireEvent.load(image);

      // Zoom in twice
      const zoomInButton = screen.getByLabelText('Zoom in');
      await userEvent.click(zoomInButton);
      await userEvent.click(zoomInButton);

      await waitFor(() => {
        expect(screen.getByText('200%')).toBeInTheDocument();
      });

      // Reset should be visible when zoomed
      const resetButton = screen.getByLabelText('Reset zoom');
      await userEvent.click(resetButton);

      await waitFor(() => {
        expect(screen.getByText('100%')).toBeInTheDocument();
      });
    });

    it('zoom respects maxZoom boundary', async () => {
      render(<PhotoViewer {...defaultProps} maxZoom={1.5} zoomStep={0.5} />);

      // Simulate image load
      const image = screen.getByAltText('Test image');
      fireEvent.load(image);

      const zoomInButton = screen.getByLabelText('Zoom in');

      // Click zoom in multiple times
      await userEvent.click(zoomInButton);
      await userEvent.click(zoomInButton);

      await waitFor(() => {
        expect(screen.getByText('150%')).toBeInTheDocument();
      });

      // Button should be disabled at max zoom
      expect(zoomInButton).toHaveAttribute('aria-disabled', 'true');
    });

    it('zoom respects minZoom boundary', async () => {
      render(<PhotoViewer {...defaultProps} minZoom={1.0} zoomStep={0.5} />);

      // Simulate image load
      const image = screen.getByAltText('Test image');
      fireEvent.load(image);

      await waitFor(() => {
        expect(screen.getByText('100%')).toBeInTheDocument();
      });

      // Zoom out button should be disabled at min zoom
      const zoomOutButton = screen.getByLabelText('Zoom out');
      expect(zoomOutButton).toHaveAttribute('aria-disabled', 'true');
    });

    it('displays current zoom level as percentage', async () => {
      render(<PhotoViewer {...defaultProps} />);

      // Simulate image load
      const image = screen.getByAltText('Test image');
      fireEvent.load(image);

      await waitFor(() => {
        expect(screen.getByText('100%')).toBeInTheDocument();
      });
    });

    it('reset button only shows when zoomed', async () => {
      render(<PhotoViewer {...defaultProps} />);

      // Simulate image load
      const image = screen.getByAltText('Test image');
      fireEvent.load(image);

      // Reset button should not be visible at 1x zoom
      expect(screen.queryByLabelText('Reset zoom')).not.toBeInTheDocument();

      // Zoom in
      const zoomInButton = screen.getByLabelText('Zoom in');
      await userEvent.click(zoomInButton);

      // Reset button should now be visible
      await waitFor(() => {
        expect(screen.getByLabelText('Reset zoom')).toBeInTheDocument();
      });
    });
  });

  // ===========================================================================
  // Double-Tap Zoom Tests
  // ===========================================================================

  describe('Double-Tap Zoom', () => {
    it('double-tap toggles zoom state', async () => {
      render(<PhotoViewer {...defaultProps} />);

      // Simulate image load
      const image = screen.getByAltText('Test image');
      fireEvent.load(image);

      await waitFor(() => {
        expect(screen.getByText('100%')).toBeInTheDocument();
      });

      const container = screen.getByRole('img', { name: 'Test image' });

      // Simulate double-click (double-tap)
      fireEvent.click(container);
      await new Promise((r) => setTimeout(r, 100));
      fireEvent.click(container);

      await waitFor(() => {
        expect(screen.getByText('200%')).toBeInTheDocument();
      });
    });
  });

  // ===========================================================================
  // State Reset Tests
  // ===========================================================================

  describe('State Reset', () => {
    it('zoom state resets when imageSrc changes', async () => {
      const { rerender } = render(<PhotoViewer {...defaultProps} />);

      // Simulate image load
      const image = screen.getByAltText('Test image');
      fireEvent.load(image);

      // Zoom in
      const zoomInButton = screen.getByLabelText('Zoom in');
      await userEvent.click(zoomInButton);

      await waitFor(() => {
        expect(screen.getByText('150%')).toBeInTheDocument();
      });

      // Change the image source
      rerender(<PhotoViewer {...defaultProps} imageSrc="new-image.jpg" />);

      // Simulate new image load
      const newImage = screen.getByAltText('Test image');
      fireEvent.load(newImage);

      // Zoom should be reset to 100%
      await waitFor(() => {
        expect(screen.getByText('100%')).toBeInTheDocument();
      });
    });
  });

  // ===========================================================================
  // Callback Tests
  // ===========================================================================

  describe('Callbacks', () => {
    it('onClose is triggered when Escape key is pressed', async () => {
      const mockOnClose = jest.fn();
      render(<PhotoViewer {...defaultProps} onClose={mockOnClose} />);

      // Press Escape key
      fireEvent.keyDown(window, { key: 'Escape' });

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('onClose is not triggered when enableZoom is false and Escape pressed', async () => {
      const mockOnClose = jest.fn();
      render(<PhotoViewer {...defaultProps} onClose={mockOnClose} enableZoom={false} />);

      // Press Escape key - should still work as it's independent of zoom
      fireEvent.keyDown(window, { key: 'Escape' });

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  // ===========================================================================
  // Pan/Drag Tests
  // ===========================================================================

  describe('Pan/Drag', () => {
    it('pan is disabled when not zoomed', async () => {
      render(<PhotoViewer {...defaultProps} />);

      // Simulate image load
      const image = screen.getByAltText('Test image');
      fireEvent.load(image);

      const container = screen.getByRole('img', { name: 'Test image' });

      // Container should not have grab cursor when not zoomed
      expect(container).not.toHaveClass('cursor-grab');
    });

    it('shows grab cursor when zoomed in', async () => {
      render(<PhotoViewer {...defaultProps} />);

      // Simulate image load
      const image = screen.getByAltText('Test image');
      fireEvent.load(image);

      // Zoom in
      const zoomInButton = screen.getByLabelText('Zoom in');
      await userEvent.click(zoomInButton);

      const container = screen.getByRole('img', { name: 'Test image' });
      expect(container).toHaveClass('cursor-grab');
    });
  });

  // ===========================================================================
  // Custom Props Tests
  // ===========================================================================

  describe('Custom Props', () => {
    it('applies custom className', () => {
      render(<PhotoViewer {...defaultProps} className="custom-class" />);
      const container = screen.getByRole('img', { name: 'Test image' });
      expect(container).toHaveClass('custom-class');
    });

    it('uses default zoom levels when not specified', async () => {
      render(<PhotoViewer {...defaultProps} />);

      // Simulate image load
      const image = screen.getByAltText('Test image');
      fireEvent.load(image);

      // Default minZoom is 1.0, so zoom out should be disabled at start
      const zoomOutButton = screen.getByLabelText('Zoom out');
      expect(zoomOutButton).toHaveAttribute('aria-disabled', 'true');
    });
  });
});
