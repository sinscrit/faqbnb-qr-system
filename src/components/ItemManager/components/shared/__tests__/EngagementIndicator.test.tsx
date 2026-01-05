/**
 * EngagementIndicator Component Tests
 * @lastModified 2026-01-05 (REQ-091)
 */

import { render, screen } from '@testing-library/react';
import { EngagementIndicator } from '../EngagementIndicator';
import type { ItemVisitStats, ItemReactionSummary } from '../../../ItemManager.types';

const highEngagementStats: ItemVisitStats = {
  last24Hours: 20,
  last7Days: 100,
  last30Days: 300,
  last365Days: 1000,
  allTime: 1500,
};

const lowEngagementStats: ItemVisitStats = {
  last24Hours: 0,
  last7Days: 2,
  last30Days: 5,
  last365Days: 10,
  allTime: 15,
};

describe('EngagementIndicator', () => {
  it('shows high engagement for items with many views', () => {
    render(<EngagementIndicator visitStats={highEngagementStats} />);
    expect(screen.getByText('high')).toBeInTheDocument();
  });

  it('shows low engagement for items with few views', () => {
    render(<EngagementIndicator visitStats={lowEngagementStats} />);
    expect(screen.getByText('low')).toBeInTheDocument();
  });

  it('considers reactions in engagement calculation', () => {
    const highReactions: ItemReactionSummary = {
      like: 15, love: 5, dislike: 0, confused: 0, total: 20,
    };
    render(<EngagementIndicator visitStats={lowEngagementStats} reactions={highReactions} />);
    expect(screen.getByText('high')).toBeInTheDocument();
  });

  it('renders dot variant correctly', () => {
    const { container } = render(
      <EngagementIndicator visitStats={highEngagementStats} variant="dot" />
    );
    const dot = container.querySelector('span');
    expect(dot).toHaveClass('rounded-full');
    expect(dot).toHaveClass('w-2');
  });

  it('renders icon variant correctly', () => {
    render(<EngagementIndicator visitStats={highEngagementStats} variant="icon" />);
    expect(screen.getByLabelText('High engagement')).toBeInTheDocument();
  });

  it('shows loading skeleton when loading', () => {
    render(<EngagementIndicator loading />);
    expect(screen.getByLabelText('Loading engagement indicator')).toBeInTheDocument();
  });

  it('respects custom thresholds', () => {
    render(
      <EngagementIndicator
        visitStats={lowEngagementStats}
        thresholds={{ highViews: 1, mediumViews: 0 }}
      />
    );
    expect(screen.getByText('high')).toBeInTheDocument();
  });
});
