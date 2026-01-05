/**
 * SessionProgressBar Component Tests
 *
 * @module ItemCreationWorkflow/components/shared/__tests__/SessionProgressBar.test
 * @lastModified 2026-01-05
 */

import { render, screen } from '@testing-library/react';
import { SessionProgressBar } from '../SessionProgressBar';

describe('SessionProgressBar', () => {
  it('renders with zero items created', () => {
    render(<SessionProgressBar itemsCreated={0} />);
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute('aria-valuenow', '0');
    expect(screen.getByText('0 items created')).toBeInTheDocument();
  });

  it('renders with items created', () => {
    render(<SessionProgressBar itemsCreated={10} />);
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '10');
    expect(screen.getByText('10 items created')).toBeInTheDocument();
  });

  it('calculates correct progress percentage', () => {
    const { container } = render(<SessionProgressBar itemsCreated={25} maxItems={50} />);
    // The inner div represents 50% progress
    const progressFill = container.querySelector('[style*="width: 50%"]');
    expect(progressFill).toBeInTheDocument();
  });

  it('respects custom maxItems prop', () => {
    render(<SessionProgressBar itemsCreated={5} maxItems={10} />);
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuemax', '10');
  });

  it('uses default maxItems from config when not provided', () => {
    render(<SessionProgressBar itemsCreated={5} />);
    const progressBar = screen.getByRole('progressbar');
    // Default is 50 from WORKFLOW_CONFIG_DEFAULTS
    expect(progressBar).toHaveAttribute('aria-valuemax', '50');
  });

  it('hides count text when showCount is false', () => {
    render(<SessionProgressBar itemsCreated={10} showCount={false} />);
    expect(screen.queryByText('10 items created')).not.toBeInTheDocument();
  });

  it('shows count text by default', () => {
    render(<SessionProgressBar itemsCreated={10} />);
    expect(screen.getByText('10 items created')).toBeInTheDocument();
  });

  it('has correct ARIA attributes', () => {
    render(<SessionProgressBar itemsCreated={15} maxItems={30} />);
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '15');
    expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    expect(progressBar).toHaveAttribute('aria-valuemax', '30');
    expect(progressBar).toHaveAttribute('aria-label', 'Session progress: 15 items created');
  });

  it('applies custom className', () => {
    const { container } = render(
      <SessionProgressBar itemsCreated={5} className="custom-class" />
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('clamps progress at 100% when items exceed max', () => {
    const { container } = render(<SessionProgressBar itemsCreated={60} maxItems={50} />);
    // Progress should be clamped at 100%
    const progressFill = container.querySelector('[style*="width: 100%"]');
    expect(progressFill).toBeInTheDocument();
  });

  it('updates aria-label when itemsCreated changes', () => {
    const { rerender } = render(<SessionProgressBar itemsCreated={5} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-label',
      'Session progress: 5 items created'
    );

    rerender(<SessionProgressBar itemsCreated={15} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-label',
      'Session progress: 15 items created'
    );
  });

  it('renders progress bar with rounded-full styling', () => {
    const { container } = render(<SessionProgressBar itemsCreated={5} />);
    const progressContainer = container.querySelector('.rounded-full');
    expect(progressContainer).toBeInTheDocument();
  });
});
