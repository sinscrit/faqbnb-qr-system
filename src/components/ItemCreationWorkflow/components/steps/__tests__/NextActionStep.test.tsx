/**
 * WhatsNextStep Integration Tests
 *
 * Tests the WhatsNextStep component as used in ItemCreationWorkflow.
 * This component replaces NextActionStep for the post-workflow menu (REQ-201).
 *
 * @module ItemCreationWorkflow/components/steps/__tests__/NextActionStep.test
 * @lastModified 2026-01-12 (REQ-201 WhatsNextStep integration)
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WhatsNextStep } from '@/components/ItemCapture/components/steps/WhatsNextStep';

describe('WhatsNextStep (Post-Workflow Menu)', () => {
  const defaultProps = {
    savedItemId: 'test-uuid-123',
    savedItemName: 'Kitchen Cabinets',
    onEditInstructions: vi.fn(),
    onAddNewInstructions: vi.fn(),
    onCreateNewItem: vi.fn(),
    onDone: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ===========================================================================
  // Success Confirmation Header Tests
  // ===========================================================================

  describe('Success Confirmation Header', () => {
    it('renders success heading "Item Saved!"', () => {
      render(<WhatsNextStep {...defaultProps} />);

      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Item Saved!');
    });

    it('displays saved item name in confirmation message', () => {
      render(<WhatsNextStep {...defaultProps} savedItemName="Dishwasher" />);

      // The confirmation message includes both the item name and "has been saved successfully"
      expect(screen.getByText(/has been saved successfully/)).toBeInTheDocument();
      // Find the item name in the confirmation message header area (in a span with font-medium class)
      const itemNameSpan = document.querySelector('.font-medium');
      expect(itemNameSpan).toHaveTextContent('Dishwasher');
    });

    it('displays "What would you like to do next?" prompt', () => {
      render(<WhatsNextStep {...defaultProps} />);

      expect(screen.getByText(/What would you like to do next/)).toBeInTheDocument();
    });

    it('renders green checkmark icon', () => {
      render(<WhatsNextStep {...defaultProps} />);

      // Find the success icon container
      const iconContainer = document.querySelector('.bg-green-100');
      expect(iconContainer).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Action Card Rendering Tests
  // ===========================================================================

  describe('Action Cards Rendering', () => {
    it('renders four action options', () => {
      render(<WhatsNextStep {...defaultProps} />);

      expect(screen.getByText('Edit Instructions')).toBeInTheDocument();
      expect(screen.getByText('Add New Instructions')).toBeInTheDocument();
      expect(screen.getByText('Create New Item')).toBeInTheDocument();
      expect(screen.getByText(/Done - Return to Dashboard/)).toBeInTheDocument();
    });

    it('renders Edit Instructions with correct description', () => {
      render(<WhatsNextStep {...defaultProps} />);

      expect(screen.getByText('Review and modify the instructions you just created')).toBeInTheDocument();
    });

    it('renders Add New Instructions with dynamic item name', () => {
      render(<WhatsNextStep {...defaultProps} savedItemName="Fridge" />);

      expect(screen.getByText(/Create different instructions for "Fridge"/)).toBeInTheDocument();
    });

    it('renders Create New Item with correct description', () => {
      render(<WhatsNextStep {...defaultProps} />);

      expect(screen.getByText('Start fresh with a different item')).toBeInTheDocument();
    });

    it('Add New Instructions has primary styling (emphasized)', () => {
      render(<WhatsNextStep {...defaultProps} />);

      const addNewButton = screen.getByText('Add New Instructions').closest('button');
      expect(addNewButton).toHaveClass('border-blue-500');
      expect(addNewButton).toHaveClass('bg-blue-50');
    });

    it('Done button is separated by border', () => {
      render(<WhatsNextStep {...defaultProps} />);

      const doneButton = screen.getByText(/Done - Return to Dashboard/).closest('button');
      const container = doneButton?.closest('.border-t');
      expect(container).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Callback Tests
  // ===========================================================================

  describe('Callback Interactions', () => {
    it('calls onEditInstructions when Edit Instructions is clicked', async () => {
      const user = userEvent.setup();
      render(<WhatsNextStep {...defaultProps} />);

      await user.click(screen.getByText('Edit Instructions'));

      expect(defaultProps.onEditInstructions).toHaveBeenCalledTimes(1);
    });

    it('calls onAddNewInstructions when Add New Instructions is clicked', async () => {
      const user = userEvent.setup();
      render(<WhatsNextStep {...defaultProps} />);

      await user.click(screen.getByText('Add New Instructions'));

      expect(defaultProps.onAddNewInstructions).toHaveBeenCalledTimes(1);
    });

    it('calls onCreateNewItem when Create New Item is clicked', async () => {
      const user = userEvent.setup();
      render(<WhatsNextStep {...defaultProps} />);

      await user.click(screen.getByText('Create New Item'));

      expect(defaultProps.onCreateNewItem).toHaveBeenCalledTimes(1);
    });

    it('calls onDone when Done button is clicked', async () => {
      const user = userEvent.setup();
      render(<WhatsNextStep {...defaultProps} />);

      await user.click(screen.getByText(/Done - Return to Dashboard/));

      expect(defaultProps.onDone).toHaveBeenCalledTimes(1);
    });

    it('only calls the correct callback for each action', async () => {
      const user = userEvent.setup();
      render(<WhatsNextStep {...defaultProps} />);

      await user.click(screen.getByText('Create New Item'));

      expect(defaultProps.onCreateNewItem).toHaveBeenCalledTimes(1);
      expect(defaultProps.onEditInstructions).not.toHaveBeenCalled();
      expect(defaultProps.onAddNewInstructions).not.toHaveBeenCalled();
      expect(defaultProps.onDone).not.toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // Keyboard Navigation Tests
  // ===========================================================================

  describe('Keyboard Navigation', () => {
    it('action cards are focusable', () => {
      render(<WhatsNextStep {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button.tabIndex).toBeGreaterThanOrEqual(0);
      });
    });

    it('supports Enter key on Edit Instructions', async () => {
      const user = userEvent.setup();
      render(<WhatsNextStep {...defaultProps} />);

      const editButton = screen.getByText('Edit Instructions').closest('button');
      editButton?.focus();
      await user.keyboard('{Enter}');

      expect(defaultProps.onEditInstructions).toHaveBeenCalledTimes(1);
    });

    it('supports Space key on Add New Instructions', async () => {
      const user = userEvent.setup();
      render(<WhatsNextStep {...defaultProps} />);

      const addNewButton = screen.getByText('Add New Instructions').closest('button');
      addNewButton?.focus();
      await user.keyboard(' ');

      expect(defaultProps.onAddNewInstructions).toHaveBeenCalledTimes(1);
    });
  });

  // ===========================================================================
  // Accessibility Tests
  // ===========================================================================

  describe('Accessibility', () => {
    it('has region role with proper label', () => {
      render(<WhatsNextStep {...defaultProps} />);

      const region = screen.getByRole('region');
      expect(region).toHaveAttribute('aria-labelledby', 'whats-next-heading');
    });

    it('heading has correct id for aria-labelledby', () => {
      render(<WhatsNextStep {...defaultProps} />);

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveAttribute('id', 'whats-next-heading');
    });

    it('action buttons have visible focus indicators', () => {
      render(<WhatsNextStep {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button.className).toMatch(/focus:ring/);
      });
    });

    it('icons are hidden from screen readers', () => {
      render(<WhatsNextStep {...defaultProps} />);

      const icons = document.querySelectorAll('[aria-hidden="true"]');
      expect(icons.length).toBeGreaterThan(0);
    });
  });

  // ===========================================================================
  // Edge Cases
  // ===========================================================================

  describe('Edge Cases', () => {
    it('handles long item names in Add New Instructions description', () => {
      render(
        <WhatsNextStep
          {...defaultProps}
          savedItemName="Very Long Kitchen Cabinet Name That Should Still Display"
        />
      );

      expect(
        screen.getByText(/Create different instructions for "Very Long Kitchen Cabinet Name/)
      ).toBeInTheDocument();
    });

    it('handles special characters in item name', () => {
      render(<WhatsNextStep {...defaultProps} savedItemName='Item "with" quotes & symbols' />);

      // Find the item name in the confirmation message header area (in a span with font-medium class)
      const itemNameSpan = document.querySelector('.font-medium');
      expect(itemNameSpan).toHaveTextContent('Item "with" quotes & symbols');
    });

    it('applies custom className prop', () => {
      render(<WhatsNextStep {...defaultProps} className="custom-test-class" />);

      const container = screen.getByRole('region');
      expect(container).toHaveClass('custom-test-class');
    });
  });

  // ===========================================================================
  // Visual Styling Tests
  // ===========================================================================

  describe('Visual Styling', () => {
    it('Edit Instructions has default styling', () => {
      render(<WhatsNextStep {...defaultProps} />);

      const editButton = screen.getByText('Edit Instructions').closest('button');
      expect(editButton).toHaveClass('border-gray-200');
    });

    it('Create New Item has default styling', () => {
      render(<WhatsNextStep {...defaultProps} />);

      const createButton = screen.getByText('Create New Item').closest('button');
      expect(createButton).toHaveClass('border-gray-200');
    });

    it('renders correct icons for each action', () => {
      render(<WhatsNextStep {...defaultProps} />);

      // Each action card should have an SVG icon
      const buttons = screen.getAllByRole('button');
      buttons.slice(0, 3).forEach((button) => {
        expect(button.querySelector('svg')).toBeInTheDocument();
      });
    });
  });
});

// ===========================================================================
// Integration Note
// ===========================================================================
// The WhatsNextStep component is re-exported from ItemCreationWorkflow/components/steps
// via the barrel export. This re-export is verified through the actual usage in
// ItemCreationWorkflow.tsx which imports WhatsNextStep and uses it in the next-action case.
