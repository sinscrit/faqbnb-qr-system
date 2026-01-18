/**
 * WorkflowHeader Component Tests
 *
 * @module ItemCreationWorkflow/components/shared/__tests__/WorkflowHeader.test
 * @lastModified 2026-01-12 (REQ-198 showStepCounter prop tests)
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { WorkflowHeader } from '../WorkflowHeader';

describe('WorkflowHeader', () => {
  const defaultProps = {
    currentStepIndex: 2,
    totalSteps: 9,
    progressPercent: 30,
    canGoBack: true,
    onBack: vi.fn(),
    onExit: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders step indicator correctly', () => {
    render(<WorkflowHeader {...defaultProps} />);
    expect(screen.getByText('Step 3 of 9')).toBeInTheDocument();
  });

  it('shows back button when canGoBack is true', () => {
    render(<WorkflowHeader {...defaultProps} />);
    expect(screen.getByLabelText('Go back to previous step')).toBeInTheDocument();
  });

  it('hides back button when canGoBack is false', () => {
    render(<WorkflowHeader {...defaultProps} canGoBack={false} />);
    expect(screen.queryByLabelText('Go back to previous step')).not.toBeInTheDocument();
  });

  it('calls onBack when back button clicked', () => {
    render(<WorkflowHeader {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('Go back to previous step'));
    expect(defaultProps.onBack).toHaveBeenCalledTimes(1);
  });

  it('shows exit button when onExit is provided', () => {
    render(<WorkflowHeader {...defaultProps} />);
    expect(screen.getByLabelText('Exit workflow')).toBeInTheDocument();
  });

  it('hides exit button when onExit is undefined', () => {
    render(<WorkflowHeader {...defaultProps} onExit={undefined} />);
    expect(screen.queryByLabelText('Exit workflow')).not.toBeInTheDocument();
  });

  it('calls onExit when exit button clicked', () => {
    render(<WorkflowHeader {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('Exit workflow'));
    expect(defaultProps.onExit).toHaveBeenCalledTimes(1);
  });

  it('renders progress bar with correct aria attributes', () => {
    render(<WorkflowHeader {...defaultProps} />);
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '30');
    expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    expect(progressBar).toHaveAttribute('aria-valuemax', '100');
  });

  it('renders progress bar with correct aria-label', () => {
    render(<WorkflowHeader {...defaultProps} />);
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-label', 'Step 3 of 9');
  });

  it('updates step indicator when props change', () => {
    const { rerender } = render(<WorkflowHeader {...defaultProps} />);
    expect(screen.getByText('Step 3 of 9')).toBeInTheDocument();

    rerender(<WorkflowHeader {...defaultProps} currentStepIndex={5} />);
    expect(screen.getByText('Step 6 of 9')).toBeInTheDocument();
  });

  it('updates progress bar when progressPercent changes', () => {
    const { rerender } = render(<WorkflowHeader {...defaultProps} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '30');

    rerender(<WorkflowHeader {...defaultProps} progressPercent={75} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '75');
  });

  it('applies custom className', () => {
    const { container } = render(
      <WorkflowHeader {...defaultProps} className="custom-class" />
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('maintains header element structure', () => {
    render(<WorkflowHeader {...defaultProps} />);
    expect(screen.getByRole('banner')).toBeInTheDocument(); // <header> has role="banner"
  });

  // =============================================================================
  // showStepCounter prop tests (REQ-198)
  // =============================================================================

  describe('showStepCounter prop', () => {
    it('shows step indicator and progress bar by default (no prop)', () => {
      render(<WorkflowHeader {...defaultProps} />);

      // Step indicator should be visible
      expect(screen.getByText('Step 3 of 9')).toBeInTheDocument();

      // Progress bar should be visible
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('shows step indicator and progress bar when showStepCounter is true', () => {
      render(<WorkflowHeader {...defaultProps} showStepCounter={true} />);

      expect(screen.getByText('Step 3 of 9')).toBeInTheDocument();
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('hides step indicator when showStepCounter is false', () => {
      render(<WorkflowHeader {...defaultProps} showStepCounter={false} />);

      expect(screen.queryByText('Step 3 of 9')).not.toBeInTheDocument();
      expect(screen.queryByText(/Step \d+ of \d+/)).not.toBeInTheDocument();
    });

    it('hides progress bar when showStepCounter is false', () => {
      render(<WorkflowHeader {...defaultProps} showStepCounter={false} />);

      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    it('keeps exit button visible when showStepCounter is false', () => {
      render(<WorkflowHeader {...defaultProps} showStepCounter={false} />);

      expect(screen.getByLabelText('Exit workflow')).toBeInTheDocument();
    });

    it('maintains header element structure when showStepCounter is false', () => {
      render(<WorkflowHeader {...defaultProps} showStepCounter={false} />);

      // Header element should still exist
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    it('keeps back button behavior when showStepCounter is false', () => {
      const onBack = vi.fn();
      render(
        <WorkflowHeader
          {...defaultProps}
          showStepCounter={false}
          canGoBack={true}
          onBack={onBack}
        />
      );

      const backButton = screen.getByLabelText('Go back to previous step');
      expect(backButton).toBeInTheDocument();

      fireEvent.click(backButton);
      expect(onBack).toHaveBeenCalledTimes(1);
    });

    it('hides back button when both showStepCounter is false and canGoBack is false', () => {
      render(
        <WorkflowHeader
          {...defaultProps}
          showStepCounter={false}
          canGoBack={false}
        />
      );

      expect(screen.queryByLabelText('Go back to previous step')).not.toBeInTheDocument();
    });

    it('calls onExit when exit button clicked with showStepCounter false', () => {
      const onExit = vi.fn();
      render(
        <WorkflowHeader
          {...defaultProps}
          showStepCounter={false}
          onExit={onExit}
        />
      );

      fireEvent.click(screen.getByLabelText('Exit workflow'));
      expect(onExit).toHaveBeenCalledTimes(1);
    });
  });

  // =============================================================================
  // Post-workflow configuration tests (REQ-202)
  // =============================================================================

  describe('post-workflow configuration (REQ-202)', () => {
    it('renders correctly with canGoBack=false and showStepCounter=false (post-workflow state)', () => {
      render(
        <WorkflowHeader
          {...defaultProps}
          canGoBack={false}
          showStepCounter={false}
        />
      );

      // Back button should NOT be rendered
      expect(screen.queryByLabelText('Go back to previous step')).not.toBeInTheDocument();

      // Step counter should NOT be rendered
      expect(screen.queryByText(/Step \d+ of \d+/)).not.toBeInTheDocument();

      // Progress bar should NOT be rendered
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();

      // Exit button SHOULD still be rendered
      expect(screen.getByLabelText('Exit workflow')).toBeInTheDocument();

      // Header structure should remain
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    it('maintains accessibility with post-workflow configuration', () => {
      render(
        <WorkflowHeader
          {...defaultProps}
          canGoBack={false}
          showStepCounter={false}
        />
      );

      // Exit button should be keyboard focusable
      const exitButton = screen.getByLabelText('Exit workflow');
      expect(exitButton).not.toHaveAttribute('tabindex', '-1');

      // No orphaned interactive elements - only exit button
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(1); // Only exit button
    });

    it('maintains consistent layout when all optional elements are hidden', () => {
      const { container } = render(
        <WorkflowHeader
          {...defaultProps}
          canGoBack={false}
          showStepCounter={false}
        />
      );

      // Header element should exist
      const header = screen.getByRole('banner');
      expect(header).toBeInTheDocument();

      // Navigation controls container should still exist
      const navControls = container.querySelector('.flex.items-center.justify-between');
      expect(navControls).toBeInTheDocument();
    });

    it('exit button remains functional in post-workflow state', () => {
      const onExit = vi.fn();
      render(
        <WorkflowHeader
          {...defaultProps}
          canGoBack={false}
          showStepCounter={false}
          onExit={onExit}
        />
      );

      fireEvent.click(screen.getByLabelText('Exit workflow'));
      expect(onExit).toHaveBeenCalledTimes(1);
    });
  });
});
