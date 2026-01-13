/**
 * WhatsNextStep Component Tests
 *
 * Tests for rendering, callbacks, styling, accessibility,
 * and navigation control absence (REQ-190).
 *
 * @module ItemCapture/components/steps/__tests__/WhatsNextStep
 * @lastModified 2026-01-12 16:50:00 (REQ-190 - Added navigation control absence tests)
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WhatsNextStep } from '../WhatsNextStep';

describe('WhatsNextStep', () => {
  const defaultProps = {
    savedItemId: 'test-item-123',
    savedItemName: 'Test Steamer',
    onEditInstructions: vi.fn(),
    onAddNewInstructions: vi.fn(),
    onCreateNewItem: vi.fn(),
    onDone: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ===========================================================================
  // Rendering Tests
  // ===========================================================================

  describe('Rendering', () => {
    it('renders success message with item name', () => {
      render(<WhatsNextStep {...defaultProps} />);

      expect(screen.getByText('Item Saved!')).toBeInTheDocument();
      expect(screen.getByText('Test Steamer')).toBeInTheDocument();
      expect(screen.getByText(/has been saved successfully/)).toBeInTheDocument();
    });

    it('renders the call to action prompt', () => {
      render(<WhatsNextStep {...defaultProps} />);

      expect(screen.getByText('What would you like to do next?')).toBeInTheDocument();
    });

    it('renders all four action options', () => {
      render(<WhatsNextStep {...defaultProps} />);

      expect(screen.getByRole('button', { name: /Edit Guide/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Add New Guide/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Create New Item/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Done - Return to Dashboard/i })).toBeInTheDocument();
    });

    it('displays item name in Add New Guide description', () => {
      render(<WhatsNextStep {...defaultProps} />);

      expect(screen.getByText(/Create different guide for "Test Steamer"/)).toBeInTheDocument();
    });

    it('renders action descriptions correctly', () => {
      render(<WhatsNextStep {...defaultProps} />);

      expect(screen.getByText('Review and modify the guide you just created')).toBeInTheDocument();
      expect(screen.getByText('Start fresh with a different item')).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Callback Tests
  // ===========================================================================

  describe('Callbacks', () => {
    it('calls onEditInstructions when Edit Guide is clicked', () => {
      render(<WhatsNextStep {...defaultProps} />);

      fireEvent.click(screen.getByRole('button', { name: /Edit Guide/i }));

      expect(defaultProps.onEditInstructions).toHaveBeenCalledTimes(1);
    });

    it('calls onAddNewInstructions when Add New Guide is clicked', () => {
      render(<WhatsNextStep {...defaultProps} />);

      fireEvent.click(screen.getByRole('button', { name: /Add New Guide/i }));

      expect(defaultProps.onAddNewInstructions).toHaveBeenCalledTimes(1);
    });

    it('calls onCreateNewItem when Create New Item is clicked', () => {
      render(<WhatsNextStep {...defaultProps} />);

      fireEvent.click(screen.getByRole('button', { name: /Create New Item/i }));

      expect(defaultProps.onCreateNewItem).toHaveBeenCalledTimes(1);
    });

    it('calls onDone when Done button is clicked', () => {
      render(<WhatsNextStep {...defaultProps} />);

      fireEvent.click(screen.getByRole('button', { name: /Done/i }));

      expect(defaultProps.onDone).toHaveBeenCalledTimes(1);
    });
  });

  // ===========================================================================
  // Styling Tests
  // ===========================================================================

  describe('Styling', () => {
    it('applies custom className', () => {
      const { container } = render(
        <WhatsNextStep {...defaultProps} className="custom-class" />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('Add New Guide has primary variant styling', () => {
      render(<WhatsNextStep {...defaultProps} />);

      const addNewButton = screen.getByRole('button', { name: /Add New Guide/i });
      expect(addNewButton).toHaveClass('border-blue-500');
      expect(addNewButton).toHaveClass('bg-blue-50');
    });

    it('Edit Guide has default variant styling', () => {
      render(<WhatsNextStep {...defaultProps} />);

      const editButton = screen.getByRole('button', { name: /Edit Guide/i });
      expect(editButton).toHaveClass('border-gray-200');
    });

    it('Create New Item has default variant styling', () => {
      render(<WhatsNextStep {...defaultProps} />);

      const createButton = screen.getByRole('button', { name: /Create New Item/i });
      expect(createButton).toHaveClass('border-gray-200');
    });

    it('renders green checkmark icon container', () => {
      const { container } = render(<WhatsNextStep {...defaultProps} />);

      const checkmarkContainer = container.querySelector('.bg-green-100');
      expect(checkmarkContainer).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Accessibility Tests
  // ===========================================================================

  describe('Accessibility', () => {
    it('has accessible region role', () => {
      render(<WhatsNextStep {...defaultProps} />);

      expect(screen.getByRole('region')).toBeInTheDocument();
    });

    it('has aria-labelledby referencing the heading', () => {
      render(<WhatsNextStep {...defaultProps} />);

      const region = screen.getByRole('region');
      expect(region).toHaveAttribute('aria-labelledby', 'whats-next-heading');
    });

    it('heading has correct id for aria-labelledby', () => {
      render(<WhatsNextStep {...defaultProps} />);

      const heading = screen.getByRole('heading', { name: 'Item Saved!' });
      expect(heading).toHaveAttribute('id', 'whats-next-heading');
    });

    it('all buttons are keyboard focusable', () => {
      render(<WhatsNextStep {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBe(4);

      buttons.forEach(button => {
        expect(button).not.toHaveAttribute('tabindex', '-1');
      });
    });

    it('buttons have type="button" to prevent form submission', () => {
      render(<WhatsNextStep {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAttribute('type', 'button');
      });
    });

    it('icons have aria-hidden attribute', () => {
      const { container } = render(<WhatsNextStep {...defaultProps} />);

      const svgs = container.querySelectorAll('svg');
      svgs.forEach(svg => {
        expect(svg).toHaveAttribute('aria-hidden', 'true');
      });
    });

    it('action buttons have visible focus ring classes', () => {
      render(<WhatsNextStep {...defaultProps} />);

      const editButton = screen.getByRole('button', { name: /Edit Guide/i });
      expect(editButton).toHaveClass('focus:ring-2');
      expect(editButton).toHaveClass('focus:ring-blue-500');
    });
  });

  // ===========================================================================
  // Navigation Control Absence Tests (REQ-190)
  // ===========================================================================

  describe('Navigation Control Absence (REQ-190)', () => {
    it('does not render a back button', () => {
      render(<WhatsNextStep {...defaultProps} />);

      // Check for absence of back button by role and text
      expect(screen.queryByRole('button', { name: /back/i })).not.toBeInTheDocument();
      expect(screen.queryByText(/back/i)).not.toBeInTheDocument();
    });

    it('does not render a cancel button', () => {
      render(<WhatsNextStep {...defaultProps} />);

      // Check for absence of cancel button by role and text
      expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument();
      expect(screen.queryByText(/cancel/i)).not.toBeInTheDocument();
    });

    it('does not render progress indicator text', () => {
      render(<WhatsNextStep {...defaultProps} />);

      // Should not contain any step counter text
      expect(screen.queryByText(/step \d+ of \d+/i)).not.toBeInTheDocument();
    });

    it('renders exactly 4 action buttons (Edit, Add, Create, Done)', () => {
      render(<WhatsNextStep {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      // 3 action cards + 1 Done button = 4 total buttons
      expect(buttons).toHaveLength(4);

      // Verify each specific button exists
      expect(screen.getByRole('button', { name: /Edit Guide/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Add New Guide/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Create New Item/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Done/i })).toBeInTheDocument();
    });

    it('has no onBack, onCancel, or showProgress in component props', () => {
      // This test validates the component interface
      // WhatsNextStep props should only contain action callbacks
      const propsInterface: (keyof typeof defaultProps)[] = [
        'savedItemId',
        'savedItemName',
        'onEditInstructions',
        'onAddNewInstructions',
        'onCreateNewItem',
        'onDone',
      ];

      // Verify props don't include navigation-related names
      expect(propsInterface).not.toContain('onBack');
      expect(propsInterface).not.toContain('onCancel');
      expect(propsInterface).not.toContain('showProgress');
      expect(propsInterface).not.toContain('currentStep');
    });
  });

  // ===========================================================================
  // Integration Tests
  // ===========================================================================

  describe('Integration', () => {
    it('renders correctly with different item names', () => {
      const { rerender } = render(
        <WhatsNextStep {...defaultProps} savedItemName="Coffee Maker" />
      );

      expect(screen.getByText('Coffee Maker')).toBeInTheDocument();
      expect(screen.getByText(/Create different instructions for "Coffee Maker"/)).toBeInTheDocument();

      rerender(
        <WhatsNextStep {...defaultProps} savedItemName="Washing Machine" />
      );

      expect(screen.getByText('Washing Machine')).toBeInTheDocument();
      expect(screen.getByText(/Create different instructions for "Washing Machine"/)).toBeInTheDocument();
    });

    it('handles empty item name gracefully', () => {
      render(<WhatsNextStep {...defaultProps} savedItemName="" />);

      expect(screen.getByText('Item Saved!')).toBeInTheDocument();
      expect(screen.getByText(/has been saved successfully/)).toBeInTheDocument();
    });

    it('handles special characters in item name', () => {
      render(<WhatsNextStep {...defaultProps} savedItemName={'Tom\'s "Special" Blender'} />);

      expect(screen.getByText('Tom\'s "Special" Blender')).toBeInTheDocument();
    });
  });
});
