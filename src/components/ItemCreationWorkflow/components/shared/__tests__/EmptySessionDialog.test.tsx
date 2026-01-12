/**
 * EmptySessionDialog Component Tests
 *
 * Tests for the empty session confirmation dialog that displays
 * when user attempts to complete a session without creating items.
 *
 * @module ItemCreationWorkflow/components/shared/__tests__/EmptySessionDialog.test
 * @lastModified 2026-01-05
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { EmptySessionDialog } from '../EmptySessionDialog';

describe('EmptySessionDialog', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onAddItems: vi.fn(),
    onExitSession: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ===========================================================================
  // Rendering Tests
  // ===========================================================================

  describe('Rendering', () => {
    it('renders when isOpen is true', () => {
      render(<EmptySessionDialog {...defaultProps} isOpen={true} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('does not render when isOpen is false', () => {
      render(<EmptySessionDialog {...defaultProps} isOpen={false} />);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('renders title', () => {
      render(<EmptySessionDialog {...defaultProps} />);

      expect(screen.getByText('No Items Added')).toBeInTheDocument();
    });

    it('renders description', () => {
      render(<EmptySessionDialog {...defaultProps} />);

      expect(
        screen.getByText('No items added yet. Add items or exit session?')
      ).toBeInTheDocument();
    });

    it('renders Add Items button', () => {
      render(<EmptySessionDialog {...defaultProps} />);

      expect(screen.getByRole('button', { name: /add items/i })).toBeInTheDocument();
    });

    it('renders Exit Session button', () => {
      render(<EmptySessionDialog {...defaultProps} />);

      expect(screen.getByRole('button', { name: /exit session/i })).toBeInTheDocument();
    });

    it('renders close button', () => {
      render(<EmptySessionDialog {...defaultProps} />);

      expect(screen.getByRole('button', { name: /close dialog/i })).toBeInTheDocument();
    });

    it('applies custom className to dialog container', () => {
      const { container } = render(
        <EmptySessionDialog {...defaultProps} className="custom-class" />
      );

      // Find the inner dialog container with the custom class
      const dialogContent = container.querySelector('.custom-class');
      expect(dialogContent).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Accessibility Tests
  // ===========================================================================

  describe('Accessibility', () => {
    it('has role="dialog"', () => {
      render(<EmptySessionDialog {...defaultProps} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('has aria-modal="true"', () => {
      render(<EmptySessionDialog {...defaultProps} />);

      expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    });

    it('has aria-labelledby pointing to title', () => {
      render(<EmptySessionDialog {...defaultProps} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-labelledby', 'empty-session-title');

      // Verify the title exists with correct ID
      expect(screen.getByText('No Items Added')).toHaveAttribute('id', 'empty-session-title');
    });

    it('has aria-describedby pointing to description', () => {
      render(<EmptySessionDialog {...defaultProps} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-describedby', 'empty-session-description');

      // Verify the description exists with correct ID
      expect(
        screen.getByText('No items added yet. Add items or exit session?')
      ).toHaveAttribute('id', 'empty-session-description');
    });

    it('close button has aria-label', () => {
      render(<EmptySessionDialog {...defaultProps} />);

      const closeButton = screen.getByRole('button', { name: /close dialog/i });
      expect(closeButton).toHaveAttribute('aria-label', 'Close dialog');
    });

    it('icons have aria-hidden', () => {
      const { container } = render(<EmptySessionDialog {...defaultProps} />);

      const hiddenIcons = container.querySelectorAll('[aria-hidden="true"]');
      expect(hiddenIcons.length).toBeGreaterThanOrEqual(3); // AlertCircle, Plus, LogOut, X
    });

    it('focuses first button when opened', () => {
      render(<EmptySessionDialog {...defaultProps} isOpen={true} />);

      const addItemsButton = screen.getByRole('button', { name: /add items/i });
      expect(document.activeElement).toBe(addItemsButton);
    });
  });

  // ===========================================================================
  // Button Interaction Tests
  // ===========================================================================

  describe('Button Interactions', () => {
    it('calls onAddItems when Add Items button is clicked', () => {
      render(<EmptySessionDialog {...defaultProps} />);

      const addItemsButton = screen.getByRole('button', { name: /add items/i });
      fireEvent.click(addItemsButton);

      expect(defaultProps.onAddItems).toHaveBeenCalledTimes(1);
    });

    it('calls onExitSession when Exit Session button is clicked', () => {
      render(<EmptySessionDialog {...defaultProps} />);

      const exitButton = screen.getByRole('button', { name: /exit session/i });
      fireEvent.click(exitButton);

      expect(defaultProps.onExitSession).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when close button is clicked', () => {
      render(<EmptySessionDialog {...defaultProps} />);

      const closeButton = screen.getByRole('button', { name: /close dialog/i });
      fireEvent.click(closeButton);

      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });
  });

  // ===========================================================================
  // Keyboard Interaction Tests
  // ===========================================================================

  describe('Keyboard Interactions', () => {
    it('calls onClose when Escape key is pressed', () => {
      render(<EmptySessionDialog {...defaultProps} />);

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose on other key presses', () => {
      render(<EmptySessionDialog {...defaultProps} />);

      fireEvent.keyDown(document, { key: 'Enter' });
      fireEvent.keyDown(document, { key: 'Tab' });
      fireEvent.keyDown(document, { key: 'Space' });

      expect(defaultProps.onClose).not.toHaveBeenCalled();
    });

    it('does not respond to Escape when dialog is closed', () => {
      render(<EmptySessionDialog {...defaultProps} isOpen={false} />);

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(defaultProps.onClose).not.toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // Backdrop Tests
  // ===========================================================================

  describe('Backdrop Click', () => {
    it('calls onClose when backdrop is clicked', () => {
      render(<EmptySessionDialog {...defaultProps} />);

      const backdrop = screen.getByRole('dialog').parentElement || screen.getByRole('dialog');
      fireEvent.click(backdrop);

      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose when dialog content is clicked', () => {
      render(<EmptySessionDialog {...defaultProps} />);

      const title = screen.getByText('No Items Added');
      fireEvent.click(title);

      expect(defaultProps.onClose).not.toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // Touch Target Tests
  // ===========================================================================

  describe('Touch Targets', () => {
    it('Add Items button meets minimum 48px touch target', () => {
      render(<EmptySessionDialog {...defaultProps} />);

      const button = screen.getByRole('button', { name: /add items/i });
      expect(button.className).toMatch(/min-h-\[48px\]/);
    });

    it('Exit Session button meets minimum 48px touch target', () => {
      render(<EmptySessionDialog {...defaultProps} />);

      const button = screen.getByRole('button', { name: /exit session/i });
      expect(button.className).toMatch(/min-h-\[48px\]/);
    });
  });

  // ===========================================================================
  // Styling Tests
  // ===========================================================================

  describe('Styling', () => {
    it('Add Items button uses primary brand color', () => {
      render(<EmptySessionDialog {...defaultProps} />);

      const button = screen.getByRole('button', { name: /add items/i });
      expect(button.className).toMatch(/bg-\[#FF385C\]/);
    });

    it('Exit Session button uses secondary styling', () => {
      render(<EmptySessionDialog {...defaultProps} />);

      const button = screen.getByRole('button', { name: /exit session/i });
      expect(button.className).toMatch(/bg-white/);
      expect(button.className).toMatch(/border/);
    });

    it('backdrop has blur effect', () => {
      const { container } = render(<EmptySessionDialog {...defaultProps} />);

      const backdrop = container.firstChild as HTMLElement;
      expect(backdrop.className).toContain('backdrop-blur');
    });

    it('dialog has rounded corners', () => {
      const { container } = render(<EmptySessionDialog {...defaultProps} />);

      const dialogContent = container.querySelector('.rounded-xl');
      expect(dialogContent).toBeInTheDocument();
    });

    it('dialog has shadow', () => {
      const { container } = render(<EmptySessionDialog {...defaultProps} />);

      const dialogContent = container.querySelector('.shadow-xl');
      expect(dialogContent).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Icon Tests
  // ===========================================================================

  describe('Icons', () => {
    it('renders info/alert icon', () => {
      const { container } = render(<EmptySessionDialog {...defaultProps} />);

      // Check for the blue icon container
      const iconContainer = container.querySelector('.bg-blue-100');
      expect(iconContainer).toBeInTheDocument();
    });

    it('Add Items button has Plus icon', () => {
      render(<EmptySessionDialog {...defaultProps} />);

      const button = screen.getByRole('button', { name: /add items/i });
      const icon = button.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('Exit Session button has LogOut icon', () => {
      render(<EmptySessionDialog {...defaultProps} />);

      const button = screen.getByRole('button', { name: /exit session/i });
      const icon = button.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Animation Tests
  // ===========================================================================

  describe('Animations', () => {
    it('backdrop has fade-in animation', () => {
      const { container } = render(<EmptySessionDialog {...defaultProps} />);

      const backdrop = container.firstChild as HTMLElement;
      expect(backdrop.className).toContain('fade-in');
    });

    it('dialog content has zoom-in animation', () => {
      const { container } = render(<EmptySessionDialog {...defaultProps} />);

      const dialogContent = container.querySelector('.zoom-in-95');
      expect(dialogContent).toBeInTheDocument();
    });
  });
});
