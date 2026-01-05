/**
 * CameraPermissionFallback Component Tests
 *
 * Tests for the camera permission fallback UI that displays
 * when camera access is denied or unavailable.
 *
 * @module ItemCreationWorkflow/components/shared/__tests__/CameraPermissionFallback.test
 * @lastModified 2026-01-05
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { CameraPermissionFallback } from '../CameraPermissionFallback';

describe('CameraPermissionFallback', () => {
  const defaultProps = {
    contentType: 'video' as const,
    onUploadFile: jest.fn(),
    onTryAgain: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===========================================================================
  // Rendering Tests - Video Content Type
  // ===========================================================================

  describe('Video Content Type', () => {
    it('renders correct title', () => {
      render(<CameraPermissionFallback {...defaultProps} contentType="video" />);

      expect(screen.getByText('Camera access not available')).toBeInTheDocument();
    });

    it('renders correct explanation for video', () => {
      render(<CameraPermissionFallback {...defaultProps} contentType="video" />);

      expect(
        screen.getByText(/To record a video, please allow camera access/)
      ).toBeInTheDocument();
    });

    it('renders upload video button', () => {
      render(<CameraPermissionFallback {...defaultProps} contentType="video" />);

      expect(
        screen.getByRole('button', { name: /upload video/i })
      ).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Rendering Tests - Photo Content Type
  // ===========================================================================

  describe('Photo Content Type', () => {
    it('renders correct explanation for photo', () => {
      render(<CameraPermissionFallback {...defaultProps} contentType="photo" />);

      expect(
        screen.getByText(/To record a photo, please allow camera access/)
      ).toBeInTheDocument();
    });

    it('renders upload photo button', () => {
      render(<CameraPermissionFallback {...defaultProps} contentType="photo" />);

      expect(
        screen.getByRole('button', { name: /upload photo/i })
      ).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Button Tests
  // ===========================================================================

  describe('Button Interactions', () => {
    it('calls onUploadFile when upload button is clicked', () => {
      render(<CameraPermissionFallback {...defaultProps} />);

      const uploadButton = screen.getByRole('button', { name: /upload video/i });
      fireEvent.click(uploadButton);

      expect(defaultProps.onUploadFile).toHaveBeenCalledTimes(1);
    });

    it('calls onTryAgain when try again button is clicked', () => {
      render(<CameraPermissionFallback {...defaultProps} />);

      const tryAgainButton = screen.getByRole('button', { name: /try camera again/i });
      fireEvent.click(tryAgainButton);

      expect(defaultProps.onTryAgain).toHaveBeenCalledTimes(1);
    });

    it('renders Try Camera Again button text', () => {
      render(<CameraPermissionFallback {...defaultProps} />);

      expect(screen.getByText('Try Camera Again')).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Accessibility Tests
  // ===========================================================================

  describe('Accessibility', () => {
    it('upload button has proper aria-label for video', () => {
      render(<CameraPermissionFallback {...defaultProps} contentType="video" />);

      const uploadButton = screen.getByRole('button', { name: /upload video/i });
      expect(uploadButton).toHaveAttribute('aria-label', 'Upload Video');
    });

    it('upload button has proper aria-label for photo', () => {
      render(<CameraPermissionFallback {...defaultProps} contentType="photo" />);

      const uploadButton = screen.getByRole('button', { name: /upload photo/i });
      expect(uploadButton).toHaveAttribute('aria-label', 'Upload Photo');
    });

    it('try again button has proper aria-label', () => {
      render(<CameraPermissionFallback {...defaultProps} />);

      const tryAgainButton = screen.getByRole('button', { name: /try camera again/i });
      expect(tryAgainButton).toHaveAttribute('aria-label', 'Try camera again');
    });

    it('icons have aria-hidden attribute', () => {
      const { container } = render(<CameraPermissionFallback {...defaultProps} />);

      const icons = container.querySelectorAll('[aria-hidden="true"]');
      expect(icons.length).toBeGreaterThanOrEqual(3); // Camera, Upload, RefreshCw, ExternalLink icons
    });
  });

  // ===========================================================================
  // Help Link Tests
  // ===========================================================================

  describe('Help Link', () => {
    it('renders help link with correct text', () => {
      render(<CameraPermissionFallback {...defaultProps} />);

      expect(
        screen.getByText('How to enable camera access')
      ).toBeInTheDocument();
    });

    it('help link opens in new tab', () => {
      render(<CameraPermissionFallback {...defaultProps} />);

      const link = screen.getByText('How to enable camera access');
      expect(link).toHaveAttribute('target', '_blank');
    });

    it('help link has noopener noreferrer for security', () => {
      render(<CameraPermissionFallback {...defaultProps} />);

      const link = screen.getByText('How to enable camera access');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('help link points to Chrome support page', () => {
      render(<CameraPermissionFallback {...defaultProps} />);

      const link = screen.getByText('How to enable camera access');
      expect(link).toHaveAttribute('href', 'https://support.google.com/chrome/answer/2693767');
    });
  });

  // ===========================================================================
  // Touch Target Tests
  // ===========================================================================

  describe('Touch Targets', () => {
    it('upload button meets minimum 48px touch target', () => {
      render(<CameraPermissionFallback {...defaultProps} />);

      const uploadButton = screen.getByRole('button', { name: /upload video/i });
      expect(uploadButton.className).toMatch(/min-h-\[48px\]/);
    });

    it('try again button meets minimum 48px touch target', () => {
      render(<CameraPermissionFallback {...defaultProps} />);

      const tryAgainButton = screen.getByRole('button', { name: /try camera again/i });
      expect(tryAgainButton.className).toMatch(/min-h-\[48px\]/);
    });
  });

  // ===========================================================================
  // Styling Tests
  // ===========================================================================

  describe('Styling', () => {
    it('applies custom className', () => {
      const { container } = render(
        <CameraPermissionFallback {...defaultProps} className="custom-class" />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('upload button is styled as primary action with brand color', () => {
      render(<CameraPermissionFallback {...defaultProps} />);

      const uploadButton = screen.getByRole('button', { name: /upload video/i });
      // Check for Airbnb brand color
      expect(uploadButton.className).toMatch(/bg-\[#FF385C\]/);
    });

    it('try again button is styled as secondary action', () => {
      render(<CameraPermissionFallback {...defaultProps} />);

      const tryAgainButton = screen.getByRole('button', { name: /try camera again/i });
      // Check for white/gray background indicating secondary
      expect(tryAgainButton.className).toMatch(/bg-white|bg-gray/);
    });

    it('has rounded-lg on buttons', () => {
      render(<CameraPermissionFallback {...defaultProps} />);

      const uploadButton = screen.getByRole('button', { name: /upload video/i });
      const tryAgainButton = screen.getByRole('button', { name: /try camera again/i });

      expect(uploadButton.className).toContain('rounded-lg');
      expect(tryAgainButton.className).toContain('rounded-lg');
    });
  });

  // ===========================================================================
  // Error Indicator Tests
  // ===========================================================================

  describe('Error Indicator', () => {
    it('renders camera icon', () => {
      const { container } = render(<CameraPermissionFallback {...defaultProps} />);

      // Check for camera icon container
      const iconContainer = container.querySelector('.bg-gray-200, .bg-gray-100');
      expect(iconContainer).toBeInTheDocument();
    });

    it('renders error badge with exclamation mark', () => {
      render(<CameraPermissionFallback {...defaultProps} />);

      // The component shows an exclamation mark as error indicator
      expect(screen.getByText('!')).toBeInTheDocument();
    });

    it('error badge has red background', () => {
      const { container } = render(<CameraPermissionFallback {...defaultProps} />);

      const errorBadge = container.querySelector('.bg-red-500');
      expect(errorBadge).toBeInTheDocument();
    });
  });
});
