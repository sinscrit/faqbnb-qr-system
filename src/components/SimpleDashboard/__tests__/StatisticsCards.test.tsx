// src/components/SimpleDashboard/__tests__/StatisticsCards.test.tsx
// REQ-203: Navigation tests for StatisticsCards component
// Created: 2026-01-12 20:35:00 UTC

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { StatisticsCards } from '../StatisticsCards';
import { DashboardStats } from '@/hooks/useDashboardStats';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const mockStats: DashboardStats = {
  itemCount: 5,
  roomCount: 3,
  tagCount: 8,
  propertyContext: {
    isFiltered: false,
    propertyId: null,
    propertyName: null,
    totalProperties: 1,
  },
};

describe('StatisticsCards', () => {
  describe('Navigation', () => {
    it('renders Items card as a link to /dashboard2/items', () => {
      render(<StatisticsCards stats={mockStats} isLoading={false} />);

      const itemsLink = screen.getByRole('link', { name: /view items/i });
      expect(itemsLink).toHaveAttribute('href', '/dashboard2/items');
    });

    it('renders Rooms card as a link', () => {
      render(<StatisticsCards stats={mockStats} isLoading={false} />);

      const roomsLink = screen.getByRole('link', { name: /view rooms/i });
      expect(roomsLink).toHaveAttribute('href', '/dashboard2/items?filter=room');
    });

    it('renders Tags card as a link', () => {
      render(<StatisticsCards stats={mockStats} isLoading={false} />);

      const tagsLink = screen.getByRole('link', { name: /view tags/i });
      expect(tagsLink).toHaveAttribute('href', '/dashboard2/items?filter=tags');
    });
  });

  describe('Accessibility', () => {
    it('includes value in aria-label for screen readers', () => {
      render(<StatisticsCards stats={mockStats} isLoading={false} />);

      expect(screen.getByLabelText('View Items: 5')).toBeInTheDocument();
      expect(screen.getByLabelText('View Rooms: 3')).toBeInTheDocument();
      expect(screen.getByLabelText('View Tags: 8')).toBeInTheDocument();
    });

    it('cards are keyboard focusable', () => {
      render(<StatisticsCards stats={mockStats} isLoading={false} />);

      const links = screen.getAllByRole('link');
      links.forEach(link => {
        expect(link).not.toHaveAttribute('tabindex', '-1');
      });
    });
  });

  describe('Visual Affordance', () => {
    it('renders chevron icon on each card', () => {
      render(<StatisticsCards stats={mockStats} isLoading={false} />);

      // ChevronRight icons should be present (3 cards = 3 chevrons)
      const cards = screen.getAllByRole('link');
      expect(cards).toHaveLength(3);
    });
  });

  describe('Loading State', () => {
    it('shows skeleton during loading', () => {
      render(<StatisticsCards stats={null} isLoading={true} />);

      expect(screen.getByLabelText('Loading statistics')).toBeInTheDocument();
    });
  });
});
