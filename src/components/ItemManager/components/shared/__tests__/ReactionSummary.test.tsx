/**
 * ReactionSummary Component Tests
 * @lastModified 2026-01-05 (REQ-091)
 */

import { render, screen } from '@testing-library/react';
import { ReactionSummary } from '../ReactionSummary';
import type { ItemReactionSummary } from '../../../ItemManager.types';

const mockReactions: ItemReactionSummary = {
  like: 10,
  love: 5,
  dislike: 2,
  confused: 1,
  total: 18,
};

describe('ReactionSummary', () => {
  it('renders reaction counts', () => {
    render(<ReactionSummary reactions={mockReactions} />);
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('returns null when total is 0', () => {
    const { container } = render(
      <ReactionSummary reactions={{ like: 0, love: 0, dislike: 0, confused: 0, total: 0 }} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('limits displayed reactions based on maxReactions', () => {
    render(<ReactionSummary reactions={mockReactions} maxReactions={2} />);
    // Should only show top 2 (like: 10, love: 5)
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.queryByText('2')).not.toBeInTheDocument();
  });

  it('shows loading skeleton when loading', () => {
    render(<ReactionSummary reactions={mockReactions} loading />);
    expect(screen.getByLabelText('Loading reactions')).toBeInTheDocument();
  });

  it('has correct aria-label with reaction counts', () => {
    render(<ReactionSummary reactions={mockReactions} maxReactions={2} />);
    expect(screen.getByRole('group')).toHaveAttribute(
      'aria-label',
      expect.stringContaining('10 likes')
    );
  });
});
