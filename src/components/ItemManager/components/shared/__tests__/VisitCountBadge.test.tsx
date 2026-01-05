/**
 * VisitCountBadge Component Tests
 * @lastModified 2026-01-05 (REQ-091)
 */

import { render, screen } from '@testing-library/react';
import { VisitCountBadge } from '../VisitCountBadge';

describe('VisitCountBadge', () => {
  it('renders count correctly', () => {
    render(<VisitCountBadge count={42} />);
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('formats thousands with K suffix', () => {
    render(<VisitCountBadge count={1500} />);
    expect(screen.getByText('1.5K')).toBeInTheDocument();
  });

  it('formats large numbers correctly', () => {
    render(<VisitCountBadge count={15000} />);
    expect(screen.getByText('15K')).toBeInTheDocument();
  });

  it('shows loading skeleton when loading', () => {
    render(<VisitCountBadge count={0} loading />);
    expect(screen.getByLabelText('Loading view count')).toBeInTheDocument();
  });

  it('has correct aria-label', () => {
    render(<VisitCountBadge count={100} />);
    expect(screen.getByLabelText('100 views')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<VisitCountBadge count={10} className="test-class" />);
    expect(container.firstChild).toHaveClass('test-class');
  });
});
