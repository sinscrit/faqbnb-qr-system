// src/app/dashboard2/tags/__tests__/page.test.tsx
// REQ-204: Unit tests for Tags placeholder page
// Created: 2026-01-12
// Last Modified: 2026-01-12

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TagsPage from '../page';

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

describe('TagsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Authentication', () => {
    it('shows login prompt when user is not authenticated', () => {
      mockUseAuth.mockReturnValue({ user: null });

      render(<TagsPage />);

      expect(screen.getByText('Please log in to view tags.')).toBeInTheDocument();
    });

    it('shows page content when user is authenticated', () => {
      mockUseAuth.mockReturnValue({ user: { id: '1', email: 'test@test.com' } });

      render(<TagsPage />);

      expect(screen.getByRole('heading', { name: 'Tags' })).toBeInTheDocument();
    });
  });

  describe('Page Content', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({ user: { id: '1', email: 'test@test.com' } });
    });

    it('renders page header with title and description', () => {
      render(<TagsPage />);

      expect(screen.getByRole('heading', { level: 1, name: 'Tags' })).toBeInTheDocument();
      expect(screen.getByText('View items organized by tags')).toBeInTheDocument();
    });

    it('renders placeholder content with "Coming Soon" message', () => {
      render(<TagsPage />);

      expect(screen.getByRole('heading', { level: 2, name: 'Tag Management Coming Soon' })).toBeInTheDocument();
      expect(screen.getByText(/Soon you'll be able to browse and filter items by tags/)).toBeInTheDocument();
    });

    it('renders CTA link to items page', () => {
      render(<TagsPage />);

      const link = screen.getByRole('link', { name: /View All Items/i });
      expect(link).toHaveAttribute('href', '/dashboard2/items');
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({ user: { id: '1', email: 'test@test.com' } });
    });

    it('CTA link is keyboard focusable', () => {
      render(<TagsPage />);

      const link = screen.getByRole('link', { name: /View All Items/i });
      expect(link).not.toHaveAttribute('tabindex', '-1');
    });

    it('has proper heading hierarchy', () => {
      render(<TagsPage />);

      const h1 = screen.getByRole('heading', { level: 1 });
      const h2 = screen.getByRole('heading', { level: 2 });

      expect(h1).toBeInTheDocument();
      expect(h2).toBeInTheDocument();
    });
  });
});
