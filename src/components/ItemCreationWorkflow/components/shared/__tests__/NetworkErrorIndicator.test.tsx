/**
 * NetworkErrorIndicator Component Tests
 *
 * Tests for the network error indicator component that displays
 * retry and proceed options when URL preview fails due to connectivity issues.
 *
 * @module ItemCreationWorkflow/components/shared/__tests__/NetworkErrorIndicator.test
 * @lastModified 2026-01-05
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { NetworkErrorIndicator } from '../NetworkErrorIndicator';

describe('NetworkErrorIndicator', () => {
  const defaultProps = {
    onRetry: jest.fn(),
    onProceedWithoutPreview: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===========================================================================
  // Rendering Tests
  // ===========================================================================

  describe('Rendering', () => {
    it('renders with default error message', () => {
      render(<NetworkErrorIndicator {...defaultProps} />);

      expect(screen.getByText('Preview unavailable')).toBeInTheDocument();
      expect(
        screen.getByText(/Unable to load preview due to network connectivity issues/)
      ).toBeInTheDocument();
    });

    it('renders with custom error message', () => {
      const customMessage = 'Custom network error message';
      render(
        <NetworkErrorIndicator {...defaultProps} errorMessage={customMessage} />
      );

      expect(screen.getByText(customMessage)).toBeInTheDocument();
    });

    it('renders Try Again button', () => {
      render(<NetworkErrorIndicator {...defaultProps} />);

      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });

    it('renders Proceed Without Preview button', () => {
      render(<NetworkErrorIndicator {...defaultProps} />);

      expect(
        screen.getByRole('button', { name: /continue without preview/i })
      ).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <NetworkErrorIndicator {...defaultProps} className="custom-class" />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  // ===========================================================================
  // Accessibility Tests
  // ===========================================================================

  describe('Accessibility', () => {
    it('has role="alert" on container', () => {
      render(<NetworkErrorIndicator {...defaultProps} />);

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('has aria-live="polite" on container', () => {
      render(<NetworkErrorIndicator {...defaultProps} />);

      const alert = screen.getByRole('alert');
      expect(alert).toHaveAttribute('aria-live', 'polite');
    });

    it('has proper aria-label on retry button', () => {
      render(<NetworkErrorIndicator {...defaultProps} />);

      const retryButton = screen.getByRole('button', { name: /try again/i });
      expect(retryButton).toHaveAttribute('aria-label', 'Try again');
    });

    it('has proper aria-label on proceed button', () => {
      render(<NetworkErrorIndicator {...defaultProps} />);

      const proceedButton = screen.getByRole('button', { name: /continue without preview/i });
      expect(proceedButton).toHaveAttribute('aria-label', 'Continue without preview');
    });
  });

  // ===========================================================================
  // Button Interaction Tests
  // ===========================================================================

  describe('Button Interactions', () => {
    it('calls onRetry when Try Again button is clicked', () => {
      render(<NetworkErrorIndicator {...defaultProps} />);

      const retryButton = screen.getByRole('button', { name: /try again/i });
      fireEvent.click(retryButton);

      expect(defaultProps.onRetry).toHaveBeenCalledTimes(1);
    });

    it('calls onProceedWithoutPreview when Proceed button is clicked', () => {
      render(<NetworkErrorIndicator {...defaultProps} />);

      const proceedButton = screen.getByRole('button', { name: /continue without preview/i });
      fireEvent.click(proceedButton);

      expect(defaultProps.onProceedWithoutPreview).toHaveBeenCalledTimes(1);
    });
  });

  // ===========================================================================
  // Loading State Tests
  // ===========================================================================

  describe('Loading State', () => {
    it('shows loading spinner when isRetrying is true', () => {
      render(<NetworkErrorIndicator {...defaultProps} isRetrying={true} />);

      // Button text should change to "Retrying..."
      expect(screen.getByText('Retrying...')).toBeInTheDocument();
    });

    it('updates aria-label when isRetrying is true', () => {
      render(<NetworkErrorIndicator {...defaultProps} isRetrying={true} />);

      const retryButton = screen.getByRole('button', { name: /retrying/i });
      expect(retryButton).toHaveAttribute('aria-label', 'Retrying...');
    });

    it('disables retry button when isRetrying is true', () => {
      render(<NetworkErrorIndicator {...defaultProps} isRetrying={true} />);

      const retryButton = screen.getByRole('button', { name: /retrying/i });
      expect(retryButton).toBeDisabled();
    });

    it('disables proceed button when isRetrying is true', () => {
      render(<NetworkErrorIndicator {...defaultProps} isRetrying={true} />);

      const proceedButton = screen.getByRole('button', { name: /continue without preview/i });
      expect(proceedButton).toBeDisabled();
    });

    it('has animate-spin class on icon when isRetrying is true', () => {
      const { container } = render(
        <NetworkErrorIndicator {...defaultProps} isRetrying={true} />
      );

      // Find the spinning icon inside the retry button
      const spinningIcon = container.querySelector('.animate-spin');
      expect(spinningIcon).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Touch Target Tests
  // ===========================================================================

  describe('Touch Targets', () => {
    it('retry button meets minimum 48px touch target on mobile', () => {
      render(<NetworkErrorIndicator {...defaultProps} />);

      const retryButton = screen.getByRole('button', { name: /try again/i });
      // Check for min-h-[48px] class (mobile touch target)
      expect(retryButton.className).toMatch(/min-h-\[48px\]/);
    });

    it('proceed button meets minimum 48px touch target on mobile', () => {
      render(<NetworkErrorIndicator {...defaultProps} />);

      const proceedButton = screen.getByRole('button', { name: /continue without preview/i });
      // Check for min-h-[48px] class (mobile touch target)
      expect(proceedButton.className).toMatch(/min-h-\[48px\]/);
    });
  });

  // ===========================================================================
  // Styling Tests
  // ===========================================================================

  describe('Styling', () => {
    it('has amber warning background color', () => {
      render(<NetworkErrorIndicator {...defaultProps} />);

      const alert = screen.getByRole('alert');
      expect(alert.className).toContain('bg-amber-50');
    });

    it('has amber border color', () => {
      render(<NetworkErrorIndicator {...defaultProps} />);

      const alert = screen.getByRole('alert');
      expect(alert.className).toContain('border-amber-200');
    });

    it('has rounded-lg border radius', () => {
      render(<NetworkErrorIndicator {...defaultProps} />);

      const alert = screen.getByRole('alert');
      expect(alert.className).toContain('rounded-lg');
    });
  });
});
