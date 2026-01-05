/**
 * WorkflowHeader Component Tests
 *
 * @module ItemCreationWorkflow/components/shared/__tests__/WorkflowHeader.test
 * @lastModified 2026-01-05
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { WorkflowHeader } from '../WorkflowHeader';

describe('WorkflowHeader', () => {
  const defaultProps = {
    currentStepIndex: 2,
    totalSteps: 9,
    progressPercent: 30,
    canGoBack: true,
    onBack: jest.fn(),
    onExit: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
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
});
