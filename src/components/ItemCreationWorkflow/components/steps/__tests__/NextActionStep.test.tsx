/**
 * NextActionStep Component Tests
 *
 * @module ItemCreationWorkflow/components/steps/__tests__/NextActionStep.test
 * @lastModified 2026-01-05
 */

import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextActionStep } from '../NextActionStep';
import type { SessionItem } from '../../../ItemCreationWorkflow.types';

describe('NextActionStep', () => {
  // Mock session item for testing
  const mockSessionItem: SessionItem = {
    id: 'test-id-123',
    name: 'Kitchen - Dishwasher',
    room: 'kitchen',
    itemType: 'appliance',
    content: [],
    createdAt: new Date('2026-01-05T10:00:00Z'),
  };

  const defaultProps = {
    itemsCreated: 1,
    lastSavedItem: mockSessionItem,
    onAddMore: jest.fn(),
    onTagNewItem: jest.fn(),
    onDone: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===========================================================================
  // Rendering Tests
  // ===========================================================================

  describe('Rendering', () => {
    it('renders "What\'s Next?" header', () => {
      render(<NextActionStep {...defaultProps} />);

      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent("What's Next?");
    });

    it('displays session progress with correct item count', () => {
      render(<NextActionStep {...defaultProps} itemsCreated={5} />);

      expect(screen.getByText('5 items created')).toBeInTheDocument();
    });

    it('shows "Add More" card when lastSavedItem is provided', () => {
      render(<NextActionStep {...defaultProps} />);

      expect(screen.getByText('Add More to This Item')).toBeInTheDocument();
    });

    it('hides "Add More" card when lastSavedItem is null', () => {
      render(<NextActionStep {...defaultProps} lastSavedItem={null} />);

      expect(screen.queryByText('Add More to This Item')).not.toBeInTheDocument();
    });

    it('displays last item name in "Add More" description', () => {
      render(<NextActionStep {...defaultProps} />);

      expect(screen.getByText(/Add another video, photo, or document to "Kitchen - Dishwasher"/)).toBeInTheDocument();
    });

    it('truncates long item names in "Add More" description', () => {
      const longNameItem: SessionItem = {
        ...mockSessionItem,
        name: 'Kitchen - Super Long Dishwasher Model Name That Should Be Truncated',
      };
      render(<NextActionStep {...defaultProps} lastSavedItem={longNameItem} />);

      // Should truncate to ~40 chars with ellipsis
      const description = screen.getByText(/Add another video, photo, or document to/);
      expect(description.textContent).toContain('...');
    });

    it('always shows "Tag New Item" card', () => {
      render(<NextActionStep {...defaultProps} lastSavedItem={null} />);

      expect(screen.getByText('Tag New Item')).toBeInTheDocument();
      expect(screen.getByText('Start creating another item for your property')).toBeInTheDocument();
    });

    it('always shows "I\'m Done" card', () => {
      render(<NextActionStep {...defaultProps} lastSavedItem={null} />);

      expect(screen.getByText("I'm Done")).toBeInTheDocument();
      expect(screen.getByText('Review your items and print QR codes')).toBeInTheDocument();
    });

    it('renders step description', () => {
      render(<NextActionStep {...defaultProps} />);

      expect(screen.getByText("Choose what you'd like to do next")).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<NextActionStep {...defaultProps} className="custom-test-class" />);

      const container = screen
        .getByRole('heading', { name: /what's next/i })
        .closest('div[class*="flex-col"]');
      expect(container).toHaveClass('custom-test-class');
    });
  });

  // ===========================================================================
  // Click Interaction Tests
  // ===========================================================================

  describe('Click Interactions', () => {
    it('calls onAddMore when "Add More" is clicked', async () => {
      const user = userEvent.setup();
      render(<NextActionStep {...defaultProps} />);

      await user.click(screen.getByText('Add More to This Item'));

      expect(defaultProps.onAddMore).toHaveBeenCalledTimes(1);
    });

    it('calls onTagNewItem when "Tag New Item" is clicked', async () => {
      const user = userEvent.setup();
      render(<NextActionStep {...defaultProps} />);

      await user.click(screen.getByText('Tag New Item'));

      expect(defaultProps.onTagNewItem).toHaveBeenCalledTimes(1);
    });

    it('calls onDone when "I\'m Done" is clicked', async () => {
      const user = userEvent.setup();
      render(<NextActionStep {...defaultProps} />);

      await user.click(screen.getByText("I'm Done"));

      expect(defaultProps.onDone).toHaveBeenCalledTimes(1);
    });

    it('only calls the correct callback for each card', async () => {
      const user = userEvent.setup();
      render(<NextActionStep {...defaultProps} />);

      await user.click(screen.getByText('Tag New Item'));

      expect(defaultProps.onTagNewItem).toHaveBeenCalledTimes(1);
      expect(defaultProps.onAddMore).not.toHaveBeenCalled();
      expect(defaultProps.onDone).not.toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // Keyboard Interaction Tests
  // ===========================================================================

  describe('Keyboard Interactions', () => {
    it('supports keyboard navigation with Enter key on "Add More"', async () => {
      const user = userEvent.setup();
      render(<NextActionStep {...defaultProps} />);

      const addMoreCard = screen.getByText('Add More to This Item').closest('[role="button"]');
      addMoreCard?.focus();
      await user.keyboard('{Enter}');

      expect(defaultProps.onAddMore).toHaveBeenCalledTimes(1);
    });

    it('supports keyboard navigation with Space key on "Tag New Item"', async () => {
      const user = userEvent.setup();
      render(<NextActionStep {...defaultProps} />);

      const tagNewCard = screen.getByText('Tag New Item').closest('[role="button"]');
      tagNewCard?.focus();
      await user.keyboard(' ');

      expect(defaultProps.onTagNewItem).toHaveBeenCalledTimes(1);
    });

    it('supports keyboard navigation with Enter key on "I\'m Done"', async () => {
      const user = userEvent.setup();
      render(<NextActionStep {...defaultProps} />);

      const doneCard = screen.getByText("I'm Done").closest('[role="button"]');
      doneCard?.focus();
      await user.keyboard('{Enter}');

      expect(defaultProps.onDone).toHaveBeenCalledTimes(1);
    });

    it('all cards are focusable', () => {
      render(<NextActionStep {...defaultProps} />);

      const cards = screen.getAllByRole('button');
      cards.forEach((card) => {
        expect(card).toHaveAttribute('tabIndex', '0');
      });
    });
  });

  // ===========================================================================
  // Accessibility Tests
  // ===========================================================================

  describe('Accessibility', () => {
    it('has correct accessibility attributes on container', () => {
      render(<NextActionStep {...defaultProps} />);

      const container = screen.getByLabelText('Choose your next action');
      expect(container).toBeInTheDocument();
    });

    it('has correct role on cards', () => {
      render(<NextActionStep {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThanOrEqual(2);
    });

    it('cards have aria-label combining title and description', () => {
      render(<NextActionStep {...defaultProps} />);

      const tagNewCard = screen.getByRole('button', {
        name: /Tag New Item: Start creating another item for your property/i,
      });
      expect(tagNewCard).toBeInTheDocument();
    });

    it('has visible focus indicators on all cards', () => {
      render(<NextActionStep {...defaultProps} />);

      const cards = screen.getAllByRole('button');
      cards.forEach((card) => {
        expect(card).toHaveClass('focus:ring-2');
        expect(card).toHaveClass('focus:ring-[#FF385C]');
      });
    });

    it('has role="group" on action cards container', () => {
      render(<NextActionStep {...defaultProps} />);

      expect(screen.getByRole('group')).toBeInTheDocument();
    });

    it('has aria-label on action cards container', () => {
      render(<NextActionStep {...defaultProps} />);

      expect(screen.getByRole('group')).toHaveAttribute('aria-label', 'Action options');
    });

    it('has role="status" on session progress area', () => {
      render(<NextActionStep {...defaultProps} />);

      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('has aria-live="polite" on session progress area', () => {
      render(<NextActionStep {...defaultProps} />);

      const statusElement = screen.getByRole('status');
      expect(statusElement).toHaveAttribute('aria-live', 'polite');
    });

    it('has screen reader announcement for step title', () => {
      render(<NextActionStep {...defaultProps} itemsCreated={3} />);

      // Find the sr-only announcement div
      const srOnlyDiv = document.querySelector('.sr-only');
      expect(srOnlyDiv?.textContent).toContain('3 items created');
    });
  });

  // ===========================================================================
  // Session Progress Tests
  // ===========================================================================

  describe('Session Progress', () => {
    it('displays zero items created correctly', () => {
      render(<NextActionStep {...defaultProps} itemsCreated={0} lastSavedItem={null} />);

      expect(screen.getByText('0 items created')).toBeInTheDocument();
    });

    it('displays many items created correctly', () => {
      render(<NextActionStep {...defaultProps} itemsCreated={42} />);

      expect(screen.getByText('42 items created')).toBeInTheDocument();
    });

    it('progress bar has correct accessibility attributes', () => {
      render(<NextActionStep {...defaultProps} itemsCreated={5} />);

      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '5');
      expect(progressbar).toHaveAttribute('aria-valuemin', '0');
    });
  });

  // ===========================================================================
  // Icon and Styling Tests
  // ===========================================================================

  describe('Icons and Styling', () => {
    it('renders Plus icon for Add More card', () => {
      render(<NextActionStep {...defaultProps} />);

      const addMoreCard = screen.getByText('Add More to This Item').closest('[role="button"]');
      expect(addMoreCard?.querySelector('svg')).toBeInTheDocument();
    });

    it('renders Tag icon for Tag New Item card', () => {
      render(<NextActionStep {...defaultProps} />);

      const tagNewCard = screen.getByText('Tag New Item').closest('[role="button"]');
      expect(tagNewCard?.querySelector('svg')).toBeInTheDocument();
    });

    it('renders Check icon for Done card', () => {
      render(<NextActionStep {...defaultProps} />);

      const doneCard = screen.getByText("I'm Done").closest('[role="button"]');
      expect(doneCard?.querySelector('svg')).toBeInTheDocument();
    });

    it('Add More icon has blue background', () => {
      render(<NextActionStep {...defaultProps} />);

      const addMoreCard = screen.getByText('Add More to This Item').closest('[role="button"]');
      const iconCircle = addMoreCard?.querySelector('.bg-blue-100');
      expect(iconCircle).toBeInTheDocument();
    });

    it('Tag New Item icon has green background', () => {
      render(<NextActionStep {...defaultProps} />);

      const tagNewCard = screen.getByText('Tag New Item').closest('[role="button"]');
      const iconCircle = tagNewCard?.querySelector('.bg-green-100');
      expect(iconCircle).toBeInTheDocument();
    });

    it('Done icon has brand pink background', () => {
      render(<NextActionStep {...defaultProps} />);

      const doneCard = screen.getByText("I'm Done").closest('[role="button"]');
      const iconCircle = doneCard?.querySelector('[class*="bg-\\[\\#FF385C\\]"]');
      expect(iconCircle).toBeInTheDocument();
    });

    it('cards have minimum height for touch targets', () => {
      render(<NextActionStep {...defaultProps} />);

      const cards = screen.getAllByRole('button');
      cards.forEach((card) => {
        expect(card).toHaveClass('min-h-[80px]');
      });
    });

    it('cards have hover state class', () => {
      render(<NextActionStep {...defaultProps} />);

      const cards = screen.getAllByRole('button');
      cards.forEach((card) => {
        expect(card).toHaveClass('hover:bg-gray-50');
      });
    });

    it('cards have select-none to prevent text selection on touch', () => {
      render(<NextActionStep {...defaultProps} />);

      const cards = screen.getAllByRole('button');
      cards.forEach((card) => {
        expect(card).toHaveClass('select-none');
      });
    });
  });

  // ===========================================================================
  // Edge Cases
  // ===========================================================================

  describe('Edge Cases', () => {
    it('handles item name with no separator', () => {
      const simpleItem: SessionItem = {
        ...mockSessionItem,
        name: 'SimpleName',
      };
      render(<NextActionStep {...defaultProps} lastSavedItem={simpleItem} />);

      expect(screen.getByText(/Add another video, photo, or document to "SimpleName"/)).toBeInTheDocument();
    });

    it('handles empty item name gracefully', () => {
      const emptyNameItem: SessionItem = {
        ...mockSessionItem,
        name: '',
      };
      render(<NextActionStep {...defaultProps} lastSavedItem={emptyNameItem} />);

      // Should fall back to "this item"
      expect(screen.getByText(/Add another video, photo, or document to "this item"/)).toBeInTheDocument();
    });

    it('renders correctly with zero items but with last saved item', () => {
      render(<NextActionStep {...defaultProps} itemsCreated={0} />);

      // Should still show the Add More card since lastSavedItem exists
      expect(screen.getByText('Add More to This Item')).toBeInTheDocument();
      expect(screen.getByText('0 items created')).toBeInTheDocument();
    });

    it('shows two cards when lastSavedItem is null', () => {
      render(<NextActionStep {...defaultProps} lastSavedItem={null} />);

      const cards = screen.getAllByRole('button');
      expect(cards).toHaveLength(2); // Only Tag New Item and I'm Done
    });

    it('shows three cards when lastSavedItem is provided', () => {
      render(<NextActionStep {...defaultProps} />);

      const cards = screen.getAllByRole('button');
      expect(cards).toHaveLength(3); // Add More, Tag New Item, and I'm Done
    });
  });
});
