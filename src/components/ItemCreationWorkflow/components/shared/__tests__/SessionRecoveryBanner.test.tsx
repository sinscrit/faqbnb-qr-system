/**
 * SessionRecoveryBanner Component Tests
 *
 * Tests for the session recovery banner that displays when a previous
 * session has been recovered from localStorage.
 *
 * @module ItemCreationWorkflow/components/shared/__tests__/SessionRecoveryBanner.test
 * @lastModified 2026-01-05
 */

import { render, screen, fireEvent, act } from '@testing-library/react';
import { SessionRecoveryBanner } from '../SessionRecoveryBanner';

// Mock timers for auto-dismiss tests
jest.useFakeTimers();

describe('SessionRecoveryBanner', () => {
  const defaultProps = {
    itemCount: 3,
    contentNeedingReUpload: 0,
    onContinue: jest.fn(),
    onStartFresh: jest.fn(),
    onDismiss: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.useFakeTimers();
  });

  // ===========================================================================
  // Rendering Tests
  // ===========================================================================

  describe('Rendering', () => {
    it('renders the banner', () => {
      render(<SessionRecoveryBanner {...defaultProps} />);

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('renders the recovery title', () => {
      render(<SessionRecoveryBanner {...defaultProps} />);

      expect(
        screen.getByText('Your previous session has been restored')
      ).toBeInTheDocument();
    });

    it('displays correct item count (singular)', () => {
      render(<SessionRecoveryBanner {...defaultProps} itemCount={1} />);

      expect(screen.getByText(/1 item/)).toBeInTheDocument();
    });

    it('displays correct item count (plural)', () => {
      render(<SessionRecoveryBanner {...defaultProps} itemCount={5} />);

      expect(screen.getByText(/5 items/)).toBeInTheDocument();
    });

    it('displays content needing re-upload (singular)', () => {
      render(
        <SessionRecoveryBanner {...defaultProps} contentNeedingReUpload={1} />
      );

      expect(screen.getByText(/1 piece needs re-upload/)).toBeInTheDocument();
    });

    it('displays content needing re-upload (plural)', () => {
      render(
        <SessionRecoveryBanner {...defaultProps} contentNeedingReUpload={3} />
      );

      expect(screen.getByText(/3 pieces need re-upload/)).toBeInTheDocument();
    });

    it('does not display re-upload message when count is 0', () => {
      render(
        <SessionRecoveryBanner {...defaultProps} contentNeedingReUpload={0} />
      );

      expect(screen.queryByText(/re-upload/)).not.toBeInTheDocument();
    });

    it('renders Continue Session button', () => {
      render(<SessionRecoveryBanner {...defaultProps} />);

      expect(
        screen.getByRole('button', { name: /continue session/i })
      ).toBeInTheDocument();
    });

    it('renders Start Fresh button', () => {
      render(<SessionRecoveryBanner {...defaultProps} />);

      expect(
        screen.getByRole('button', { name: /start fresh/i })
      ).toBeInTheDocument();
    });

    it('renders dismiss button', () => {
      render(<SessionRecoveryBanner {...defaultProps} />);

      expect(
        screen.getByRole('button', { name: /dismiss/i })
      ).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(
        <SessionRecoveryBanner {...defaultProps} className="custom-class" />
      );

      expect(screen.getByRole('alert')).toHaveClass('custom-class');
    });
  });

  // ===========================================================================
  // Accessibility Tests
  // ===========================================================================

  describe('Accessibility', () => {
    it('has role="alert"', () => {
      render(<SessionRecoveryBanner {...defaultProps} />);

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('has aria-live="polite"', () => {
      render(<SessionRecoveryBanner {...defaultProps} />);

      expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'polite');
    });

    it('dismiss button has aria-label', () => {
      render(<SessionRecoveryBanner {...defaultProps} />);

      const dismissButton = screen.getByRole('button', { name: /dismiss/i });
      expect(dismissButton).toHaveAttribute('aria-label', 'Dismiss notification');
    });

    it('icons have aria-hidden', () => {
      const { container } = render(<SessionRecoveryBanner {...defaultProps} />);

      const hiddenIcons = container.querySelectorAll('[aria-hidden="true"]');
      expect(hiddenIcons.length).toBeGreaterThanOrEqual(3);
    });
  });

  // ===========================================================================
  // Button Interaction Tests
  // ===========================================================================

  describe('Button Interactions', () => {
    it('calls onContinue and hides when Continue button is clicked', () => {
      render(<SessionRecoveryBanner {...defaultProps} />);

      const continueButton = screen.getByRole('button', {
        name: /continue session/i,
      });
      fireEvent.click(continueButton);

      expect(defaultProps.onContinue).toHaveBeenCalledTimes(1);
    });

    it('calls onStartFresh and hides when Start Fresh button is clicked', () => {
      render(<SessionRecoveryBanner {...defaultProps} />);

      const startFreshButton = screen.getByRole('button', {
        name: /start fresh/i,
      });
      fireEvent.click(startFreshButton);

      expect(defaultProps.onStartFresh).toHaveBeenCalledTimes(1);
    });

    it('calls onDismiss and hides when dismiss button is clicked', () => {
      render(<SessionRecoveryBanner {...defaultProps} />);

      const dismissButton = screen.getByRole('button', { name: /dismiss/i });
      fireEvent.click(dismissButton);

      expect(defaultProps.onDismiss).toHaveBeenCalledTimes(1);
    });

    it('hides banner after Continue is clicked', () => {
      render(<SessionRecoveryBanner {...defaultProps} />);

      const continueButton = screen.getByRole('button', {
        name: /continue session/i,
      });
      fireEvent.click(continueButton);

      // Banner should be hidden after action
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('hides banner after Start Fresh is clicked', () => {
      render(<SessionRecoveryBanner {...defaultProps} />);

      const startFreshButton = screen.getByRole('button', {
        name: /start fresh/i,
      });
      fireEvent.click(startFreshButton);

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Auto-Dismiss Tests
  // ===========================================================================

  describe('Auto-Dismiss', () => {
    it('auto-dismisses after default delay (10 seconds)', () => {
      render(<SessionRecoveryBanner {...defaultProps} autoDismiss={true} />);

      expect(screen.getByRole('alert')).toBeInTheDocument();

      act(() => {
        jest.advanceTimersByTime(10000);
      });

      expect(defaultProps.onDismiss).toHaveBeenCalledTimes(1);
    });

    it('auto-dismisses after custom delay', () => {
      render(
        <SessionRecoveryBanner
          {...defaultProps}
          autoDismiss={true}
          autoDismissDelay={5000}
        />
      );

      act(() => {
        jest.advanceTimersByTime(4999);
      });

      expect(defaultProps.onDismiss).not.toHaveBeenCalled();

      act(() => {
        jest.advanceTimersByTime(1);
      });

      expect(defaultProps.onDismiss).toHaveBeenCalledTimes(1);
    });

    it('does not auto-dismiss when autoDismiss is false', () => {
      render(<SessionRecoveryBanner {...defaultProps} autoDismiss={false} />);

      act(() => {
        jest.advanceTimersByTime(20000);
      });

      expect(defaultProps.onDismiss).not.toHaveBeenCalled();
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('renders progress bar when autoDismiss is true', () => {
      const { container } = render(
        <SessionRecoveryBanner {...defaultProps} autoDismiss={true} />
      );

      const progressBar = container.querySelector('.bg-green-400');
      expect(progressBar).toBeInTheDocument();
    });

    it('does not render progress bar when autoDismiss is false', () => {
      const { container } = render(
        <SessionRecoveryBanner {...defaultProps} autoDismiss={false} />
      );

      const progressBar = container.querySelector('.bg-green-400');
      expect(progressBar).not.toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Progress Bar Tests
  // ===========================================================================

  describe('Progress Bar', () => {
    it('progress bar has aria-hidden', () => {
      const { container } = render(
        <SessionRecoveryBanner {...defaultProps} autoDismiss={true} />
      );

      const progressBar = container.querySelector('.bg-green-400');
      expect(progressBar).toHaveAttribute('aria-hidden', 'true');
    });

    it('progress bar width starts at 100%', () => {
      const { container } = render(
        <SessionRecoveryBanner {...defaultProps} autoDismiss={true} />
      );

      const progressBar = container.querySelector('.bg-green-400') as HTMLElement;
      expect(progressBar.style.width).toBe('100%');
    });
  });

  // ===========================================================================
  // Touch Target Tests
  // ===========================================================================

  describe('Touch Targets', () => {
    it('Continue button has minimum touch target', () => {
      render(<SessionRecoveryBanner {...defaultProps} />);

      const button = screen.getByRole('button', { name: /continue session/i });
      // Check for min-h on mobile
      expect(button.className).toMatch(/min-h-\[44px\]/);
    });

    it('Start Fresh button has minimum touch target', () => {
      render(<SessionRecoveryBanner {...defaultProps} />);

      const button = screen.getByRole('button', { name: /start fresh/i });
      expect(button.className).toMatch(/min-h-\[44px\]/);
    });
  });

  // ===========================================================================
  // Styling Tests
  // ===========================================================================

  describe('Styling', () => {
    it('has green success background', () => {
      render(<SessionRecoveryBanner {...defaultProps} />);

      expect(screen.getByRole('alert').className).toContain('bg-green-50');
    });

    it('has green border', () => {
      render(<SessionRecoveryBanner {...defaultProps} />);

      expect(screen.getByRole('alert').className).toContain('border-green-200');
    });

    it('Continue button has green primary styling', () => {
      render(<SessionRecoveryBanner {...defaultProps} />);

      const button = screen.getByRole('button', { name: /continue session/i });
      expect(button.className).toContain('bg-green-600');
    });

    it('Start Fresh button has secondary styling', () => {
      render(<SessionRecoveryBanner {...defaultProps} />);

      const button = screen.getByRole('button', { name: /start fresh/i });
      expect(button.className).toContain('bg-white');
      expect(button.className).toContain('border');
    });
  });

  // ===========================================================================
  // Re-upload Warning Tests
  // ===========================================================================

  describe('Re-upload Warning', () => {
    it('shows upload icon when content needs re-upload', () => {
      const { container } = render(
        <SessionRecoveryBanner {...defaultProps} contentNeedingReUpload={2} />
      );

      // Check for upload icon in amber/warning color
      const warningSpan = container.querySelector('.text-amber-700');
      expect(warningSpan).toBeInTheDocument();
    });

    it('warning text uses amber color', () => {
      const { container } = render(
        <SessionRecoveryBanner {...defaultProps} contentNeedingReUpload={1} />
      );

      const warningText = container.querySelector('.text-amber-700');
      expect(warningText).toBeInTheDocument();
    });
  });
});
