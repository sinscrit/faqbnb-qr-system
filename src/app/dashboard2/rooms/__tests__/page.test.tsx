// src/app/dashboard2/rooms/__tests__/page.test.tsx
// REQ-204: Unit tests for Rooms placeholder page
// Created: 2026-01-12
// Last Modified: 2026-01-12

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RoomsPage from '../page';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock AuthContext
const mockUseAuth = vi.fn();
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

describe('RoomsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Authentication', () => {
    it('shows login prompt when user is not authenticated', () => {
      mockUseAuth.mockReturnValue({ user: null });

      render(<RoomsPage />);

      expect(screen.getByText('Please log in to view rooms.')).toBeInTheDocument();
    });

    it('shows page content when user is authenticated', () => {
      mockUseAuth.mockReturnValue({ user: { id: '1', email: 'test@test.com' } });

      render(<RoomsPage />);

      expect(screen.getByRole('heading', { name: 'Rooms' })).toBeInTheDocument();
    });
  });

  describe('Page Content', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({ user: { id: '1', email: 'test@test.com' } });
    });

    it('renders page header with title and description', () => {
      render(<RoomsPage />);

      expect(screen.getByRole('heading', { level: 1, name: 'Rooms' })).toBeInTheDocument();
      expect(screen.getByText('View items organized by room location')).toBeInTheDocument();
    });

    it('renders placeholder content with "Coming Soon" message', () => {
      render(<RoomsPage />);

      expect(screen.getByRole('heading', { level: 2, name: 'Room Management Coming Soon' })).toBeInTheDocument();
      expect(screen.getByText(/Soon you'll be able to browse and manage items by room/)).toBeInTheDocument();
    });

    it('renders CTA link to items page', () => {
      render(<RoomsPage />);

      const link = screen.getByRole('link', { name: /View All Items/i });
      expect(link).toHaveAttribute('href', '/dashboard2/items');
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({ user: { id: '1', email: 'test@test.com' } });
    });

    it('CTA link is keyboard focusable', () => {
      render(<RoomsPage />);

      const link = screen.getByRole('link', { name: /View All Items/i });
      expect(link).not.toHaveAttribute('tabindex', '-1');
    });

    it('has proper heading hierarchy', () => {
      render(<RoomsPage />);

      const h1 = screen.getByRole('heading', { level: 1 });
      const h2 = screen.getByRole('heading', { level: 2 });

      expect(h1).toBeInTheDocument();
      expect(h2).toBeInTheDocument();
    });
  });
});
