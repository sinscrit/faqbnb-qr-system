/**
 * RemoveItemDialog Component Tests
 *
 * @module ItemCreationWorkflow/components/shared/__tests__/RemoveItemDialog.test
 * @lastModified 2026-01-05 (REQ-109 Session Summary Step)
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { RemoveItemDialog } from '../RemoveItemDialog';

describe('RemoveItemDialog', () => {
  const defaultProps = {
    isOpen: true,
    itemName: 'Test Dishwasher',
    onClose: vi.fn(),
    onConfirmRemove: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ===========================================================================
  // Visibility Tests
  // ===========================================================================

  describe('visibility', () => {
    it('returns null when isOpen is false', () => {
      const { container } = render(<RemoveItemDialog {...defaultProps} isOpen={false} />);
      expect(container.firstChild).toBeNull();
    });

    it('renders dialog when isOpen is true', () => {
      render(<RemoveItemDialog {...defaultProps} />);
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Content Tests
  // ===========================================================================

  describe('content', () => {
    it('displays title "Remove Item?"', () => {
      render(<RemoveItemDialog {...defaultProps} />);
      expect(screen.getByText('Remove Item?')).toBeInTheDocument();
    });

    it('displays item name in description', () => {
      render(<RemoveItemDialog {...defaultProps} />);
      expect(screen.getByText(/Test Dishwasher/)).toBeInTheDocument();
    });

    it('displays warning about action being irreversible', () => {
      render(<RemoveItemDialog {...defaultProps} />);
      expect(screen.getByText(/cannot be undone/)).toBeInTheDocument();
    });

    it('truncates long item names', () => {
      const longName = 'A'.repeat(60);
      render(<RemoveItemDialog {...defaultProps} itemName={longName} />);

      // Should truncate to 47 chars + ...
      const truncatedName = 'A'.repeat(47) + '...';
      expect(screen.getByText(new RegExp(truncatedName))).toBeInTheDocument();
    });

    it('does not truncate short item names', () => {
      render(<RemoveItemDialog {...defaultProps} itemName="Short Name" />);
      expect(screen.getByText(/Short Name/)).toBeInTheDocument();
    });

    it('renders Cancel and Remove buttons', () => {
      render(<RemoveItemDialog {...defaultProps} />);
      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Remove')).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Interaction Tests
  // ===========================================================================

  describe('interactions', () => {
    it('calls onClose when Cancel clicked', () => {
      render(<RemoveItemDialog {...defaultProps} />);
      fireEvent.click(screen.getByText('Cancel'));
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onConfirmRemove when Remove clicked', () => {
      render(<RemoveItemDialog {...defaultProps} />);
      fireEvent.click(screen.getByText('Remove'));
      expect(defaultProps.onConfirmRemove).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when backdrop clicked', () => {
      render(<RemoveItemDialog {...defaultProps} />);
      const backdrop = screen.getByRole('alertdialog');
      fireEvent.click(backdrop);
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose when dialog content clicked', () => {
      render(<RemoveItemDialog {...defaultProps} />);
      // Click on the title inside the dialog content
      fireEvent.click(screen.getByText('Remove Item?'));
      expect(defaultProps.onClose).not.toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // Keyboard Navigation Tests
  // ===========================================================================

  describe('keyboard navigation', () => {
    it('calls onClose when Escape pressed', () => {
      render(<RemoveItemDialog {...defaultProps} />);
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose for other key presses', () => {
      render(<RemoveItemDialog {...defaultProps} />);
      fireEvent.keyDown(document, { key: 'Enter' });
      expect(defaultProps.onClose).not.toHaveBeenCalled();
    });

    it('focuses the cancel button when dialog opens', () => {
      render(<RemoveItemDialog {...defaultProps} />);

      // The Cancel button should be focused (safer default for destructive dialog)
      const cancelButton = screen.getByText('Cancel');
      expect(document.activeElement).toBe(cancelButton);
    });
  });

  // ===========================================================================
  // Accessibility Tests
  // ===========================================================================

  describe('accessibility', () => {
    it('has correct aria attributes', () => {
      render(<RemoveItemDialog {...defaultProps} />);
      const dialog = screen.getByRole('alertdialog');

      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'remove-dialog-title');
      expect(dialog).toHaveAttribute('aria-describedby', 'remove-dialog-description');
    });

    it('title has correct id for aria-labelledby', () => {
      render(<RemoveItemDialog {...defaultProps} />);
      const title = screen.getByText('Remove Item?');
      expect(title).toHaveAttribute('id', 'remove-dialog-title');
    });

    it('description has correct id for aria-describedby', () => {
      render(<RemoveItemDialog {...defaultProps} />);
      const description = screen.getByText(/cannot be undone/);
      expect(description).toHaveAttribute('id', 'remove-dialog-description');
    });

    it('buttons have minimum touch target size', () => {
      render(<RemoveItemDialog {...defaultProps} />);

      const cancelButton = screen.getByText('Cancel');
      const removeButton = screen.getByText('Remove');

      expect(cancelButton).toHaveClass('min-h-[44px]');
      expect(removeButton).toHaveClass('min-h-[44px]');
    });
  });

  // ===========================================================================
  // Styling Tests
  // ===========================================================================

  describe('styling', () => {
    it('applies custom className', () => {
      render(<RemoveItemDialog {...defaultProps} className="custom-class" />);

      // Find the dialog content container (white card)
      const dialogContent = screen.getByRole('alertdialog').querySelector('.custom-class');
      expect(dialogContent).toBeInTheDocument();
    });

    it('has red styling on Remove button', () => {
      render(<RemoveItemDialog {...defaultProps} />);

      const removeButton = screen.getByText('Remove');
      // Check for inline style (Airbnb red)
      expect(removeButton).toHaveStyle({ backgroundColor: '#FF5A5F' });
    });
  });
});
