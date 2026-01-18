/**
 * EmptyStateCard Component Tests
 *
 * Tests for the reusable empty state card component
 * that displays friendly messages with CTAs.
 *
 * REQ-137: Empty State Guidance with Contextual CTAs
 *
 * @module SimpleDashboard/__tests__/EmptyStateCard.test
 * @lastModified 2026-01-06
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { Home, Package } from 'lucide-react';
import { EmptyStateCard } from '../EmptyStateCard';

describe('EmptyStateCard', () => {
  // ===========================================================================
  // Required Props Tests
  // ===========================================================================

  describe('Required Props', () => {
    it('renders with required props (title, description)', () => {
      render(
        <EmptyStateCard
          title="Test Title"
          description="Test description text"
        />
      );

      expect(screen.getByText('Test Title')).toBeInTheDocument();
      expect(screen.getByText('Test description text')).toBeInTheDocument();
    });

    it('renders title as h3 element', () => {
      render(
        <EmptyStateCard
          title="Test Title"
          description="Test description"
        />
      );

      const title = screen.getByText('Test Title');
      expect(title.tagName.toLowerCase()).toBe('h3');
    });

    it('renders description as p element', () => {
      render(
        <EmptyStateCard
          title="Test Title"
          description="Test description"
        />
      );

      const description = screen.getByText('Test description');
      expect(description.tagName.toLowerCase()).toBe('p');
    });
  });

  // ===========================================================================
  // Icon Tests
  // ===========================================================================

  describe('Icon Prop', () => {
    it('renders with optional icon prop', () => {
      render(
        <EmptyStateCard
          icon={Home}
          title="Test Title"
          description="Test description"
        />
      );

      // Icon should be present and hidden from screen readers
      const iconContainer = document.querySelector('[aria-hidden="true"]');
      expect(iconContainer).toBeInTheDocument();
    });

    it('renders without icon when not provided', () => {
      render(
        <EmptyStateCard
          title="Test Title"
          description="Test description"
        />
      );

      // Should not have an icon container with aria-hidden
      const iconContainer = document.querySelector('[aria-hidden="true"]');
      expect(iconContainer).not.toBeInTheDocument();
    });

    it('icon is hidden from screen readers', () => {
      render(
        <EmptyStateCard
          icon={Package}
          title="Test Title"
          description="Test description"
        />
      );

      const hiddenIcon = document.querySelector('[aria-hidden="true"]');
      expect(hiddenIcon).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // CTA Button Tests
  // ===========================================================================

  describe('CTA Button', () => {
    it('renders without action when actionLabel/onAction not provided', () => {
      render(
        <EmptyStateCard
          title="Test Title"
          description="Test description"
        />
      );

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('renders CTA button when actionLabel and onAction provided', () => {
      const mockOnAction = vi.fn();

      render(
        <EmptyStateCard
          title="Test Title"
          description="Test description"
          actionLabel="Click Me"
          onAction={mockOnAction}
        />
      );

      expect(screen.getByRole('button', { name: 'Click Me' })).toBeInTheDocument();
    });

    it('calls onAction callback when CTA clicked', () => {
      const mockOnAction = vi.fn();

      render(
        <EmptyStateCard
          title="Test Title"
          description="Test description"
          actionLabel="Click Me"
          onAction={mockOnAction}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: 'Click Me' }));
      expect(mockOnAction).toHaveBeenCalledTimes(1);
    });

    it('does not render button when only actionLabel provided', () => {
      render(
        <EmptyStateCard
          title="Test Title"
          description="Test description"
          actionLabel="Click Me"
        />
      );

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('does not render button when only onAction provided', () => {
      const mockOnAction = vi.fn();

      render(
        <EmptyStateCard
          title="Test Title"
          description="Test description"
          onAction={mockOnAction}
        />
      );

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('CTA button is keyboard accessible', () => {
      const mockOnAction = vi.fn();

      render(
        <EmptyStateCard
          title="Test Title"
          description="Test description"
          actionLabel="Click Me"
          onAction={mockOnAction}
        />
      );

      const button = screen.getByRole('button', { name: 'Click Me' });

      // Simulate keyboard interaction (Enter key)
      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
      fireEvent.click(button);

      expect(mockOnAction).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // Variant Styling Tests
  // ===========================================================================

  describe('Variants', () => {
    it('applies correct variant styling for "default"', () => {
      render(
        <EmptyStateCard
          icon={Home}
          title="Test Title"
          description="Test description"
          variant="default"
        />
      );

      // Default variant should have py-12 padding
      const container = screen.getByRole('status');
      expect(container).toHaveClass('py-12');
    });

    it('applies correct variant styling for "welcome"', () => {
      render(
        <EmptyStateCard
          icon={Home}
          title="Test Title"
          description="Test description"
          variant="welcome"
        />
      );

      // Welcome variant should have py-16 padding
      const container = screen.getByRole('status');
      expect(container).toHaveClass('py-16');
    });

    it('applies correct variant styling for "subtle"', () => {
      render(
        <EmptyStateCard
          icon={Home}
          title="Test Title"
          description="Test description"
          variant="subtle"
        />
      );

      // Subtle variant should have py-8 padding
      const container = screen.getByRole('status');
      expect(container).toHaveClass('py-8');
    });

    it('uses default variant when not specified', () => {
      render(
        <EmptyStateCard
          title="Test Title"
          description="Test description"
        />
      );

      const container = screen.getByRole('status');
      expect(container).toHaveClass('py-12');
    });
  });

  // ===========================================================================
  // ClassName Tests
  // ===========================================================================

  describe('Custom className', () => {
    it('applies custom className', () => {
      render(
        <EmptyStateCard
          title="Test Title"
          description="Test description"
          className="custom-test-class"
        />
      );

      const container = screen.getByRole('status');
      expect(container).toHaveClass('custom-test-class');
    });

    it('merges custom className with default classes', () => {
      render(
        <EmptyStateCard
          title="Test Title"
          description="Test description"
          className="custom-test-class"
        />
      );

      const container = screen.getByRole('status');
      expect(container).toHaveClass('flex');
      expect(container).toHaveClass('flex-col');
      expect(container).toHaveClass('items-center');
      expect(container).toHaveClass('custom-test-class');
    });
  });

  // ===========================================================================
  // Accessibility Tests
  // ===========================================================================

  describe('Accessibility', () => {
    it('has correct accessibility attributes', () => {
      render(
        <EmptyStateCard
          title="Welcome"
          description="Get started by adding items"
        />
      );

      const container = screen.getByRole('status');
      expect(container).toHaveAttribute('aria-label', 'Welcome. Get started by adding items');
    });

    it('has role="status" on container', () => {
      render(
        <EmptyStateCard
          title="Test Title"
          description="Test description"
        />
      );

      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('button has aria-label matching actionLabel', () => {
      const mockOnAction = vi.fn();

      render(
        <EmptyStateCard
          title="Test Title"
          description="Test description"
          actionLabel="Add Item"
          onAction={mockOnAction}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Add Item');
    });

    it('combines title and description in aria-label', () => {
      render(
        <EmptyStateCard
          title="No Items"
          description="Create your first item to get started"
        />
      );

      const container = screen.getByRole('status');
      expect(container).toHaveAttribute('aria-label', 'No Items. Create your first item to get started');
    });
  });

  // ===========================================================================
  // Content Specification Tests
  // ===========================================================================

  describe('Content Specifications', () => {
    it('renders new user dashboard content correctly', () => {
      const mockOnAction = vi.fn();

      render(
        <EmptyStateCard
          icon={Home}
          title="Welcome to FAQBNB!"
          description="Get started by adding your first property. Then you can create QR codes to help guests find what they need."
          actionLabel="Add Your First Property"
          onAction={mockOnAction}
          variant="welcome"
        />
      );

      expect(screen.getByText('Welcome to FAQBNB!')).toBeInTheDocument();
      expect(screen.getByText(/Get started by adding your first property/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Add Your First Property' })).toBeInTheDocument();
    });

    it('renders statistics empty state content correctly', () => {
      const mockOnAction = vi.fn();

      render(
        <EmptyStateCard
          icon={Package}
          title="Start tracking your items"
          description="Once you create items, you'll see helpful stats about how guests use your QR codes."
          actionLabel="Create Item"
          onAction={mockOnAction}
        />
      );

      expect(screen.getByText('Start tracking your items')).toBeInTheDocument();
      expect(screen.getByText(/Once you create items/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Create Item' })).toBeInTheDocument();
    });

    it('renders property section empty state content correctly', () => {
      const mockOnAction = vi.fn();

      render(
        <EmptyStateCard
          icon={Home}
          title="Let's add your property"
          description="A property is where your items live - like a vacation rental or home."
          actionLabel="Add Property"
          onAction={mockOnAction}
          variant="subtle"
        />
      );

      expect(screen.getByText("Let's add your property")).toBeInTheDocument();
      expect(screen.getByText(/A property is where your items live/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Add Property' })).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Visual Styling Tests (Airbnb Design System)
  // ===========================================================================

  describe('Airbnb Design System', () => {
    it('title has correct text color class', () => {
      render(
        <EmptyStateCard
          title="Test Title"
          description="Test description"
        />
      );

      const title = screen.getByText('Test Title');
      expect(title).toHaveClass('text-[#222222]');
    });

    it('description has correct text color class', () => {
      render(
        <EmptyStateCard
          title="Test Title"
          description="Test description"
        />
      );

      const description = screen.getByText('Test description');
      expect(description).toHaveClass('text-[#717171]');
    });

    it('title has correct font styling', () => {
      render(
        <EmptyStateCard
          title="Test Title"
          description="Test description"
        />
      );

      const title = screen.getByText('Test Title');
      expect(title).toHaveClass('font-bold');
    });
  });
});
