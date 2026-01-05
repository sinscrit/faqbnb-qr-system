/**
 * SuggestionButton Component Tests
 *
 * @module ItemCreationWorkflow/components/shared/__tests__/SuggestionButton
 * @lastModified 2026-01-05
 */

import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SuggestionButton } from '../SuggestionButton';

describe('SuggestionButton', () => {
  const mockOnSelect = jest.fn();

  beforeEach(() => {
    mockOnSelect.mockClear();
  });

  // ===========================================================================
  // Rendering Tests
  // ===========================================================================

  describe('Rendering', () => {
    it('renders label text', () => {
      render(
        <SuggestionButton
          label="Refrigerator"
          isSelected={false}
          isCreated={false}
          onSelect={mockOnSelect}
        />
      );

      expect(screen.getByText('Refrigerator')).toBeInTheDocument();
    });

    it('renders as a button element', () => {
      render(
        <SuggestionButton
          label="Refrigerator"
          isSelected={false}
          isCreated={false}
          onSelect={mockOnSelect}
        />
      );

      expect(screen.getByRole('radio')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(
        <SuggestionButton
          label="Refrigerator"
          isSelected={false}
          isCreated={false}
          onSelect={mockOnSelect}
          className="custom-class"
        />
      );

      expect(screen.getByRole('radio')).toHaveClass('custom-class');
    });
  });

  // ===========================================================================
  // Selected State Tests
  // ===========================================================================

  describe('Selected State', () => {
    it('shows checkmark when selected', () => {
      render(
        <SuggestionButton
          label="Refrigerator"
          isSelected={true}
          isCreated={false}
          onSelect={mockOnSelect}
        />
      );

      expect(screen.getByRole('radio')).toHaveAttribute('aria-checked', 'true');
    });

    it('has selected styling when isSelected is true', () => {
      render(
        <SuggestionButton
          label="Refrigerator"
          isSelected={true}
          isCreated={false}
          onSelect={mockOnSelect}
        />
      );

      const button = screen.getByRole('radio');
      expect(button).toHaveClass('border-blue-500', 'bg-blue-50', 'text-blue-700');
    });

    it('has unselected styling when isSelected is false', () => {
      render(
        <SuggestionButton
          label="Refrigerator"
          isSelected={false}
          isCreated={false}
          onSelect={mockOnSelect}
        />
      );

      const button = screen.getByRole('radio');
      expect(button).toHaveClass('border-gray-200', 'bg-white', 'text-[#222222]');
    });

    it('shows aria-checked=false when not selected', () => {
      render(
        <SuggestionButton
          label="Refrigerator"
          isSelected={false}
          isCreated={false}
          onSelect={mockOnSelect}
        />
      );

      expect(screen.getByRole('radio')).toHaveAttribute('aria-checked', 'false');
    });
  });

  // ===========================================================================
  // Created (Disabled) State Tests
  // ===========================================================================

  describe('Created State', () => {
    it('shows "Created" label when isCreated is true', () => {
      render(
        <SuggestionButton
          label="Refrigerator"
          isSelected={false}
          isCreated={true}
          onSelect={mockOnSelect}
        />
      );

      expect(screen.getByText('Created')).toBeInTheDocument();
    });

    it('is disabled when isCreated is true', () => {
      render(
        <SuggestionButton
          label="Refrigerator"
          isSelected={false}
          isCreated={true}
          onSelect={mockOnSelect}
        />
      );

      expect(screen.getByRole('radio')).toBeDisabled();
    });

    it('has aria-disabled when isCreated is true', () => {
      render(
        <SuggestionButton
          label="Refrigerator"
          isSelected={false}
          isCreated={true}
          onSelect={mockOnSelect}
        />
      );

      expect(screen.getByRole('radio')).toHaveAttribute('aria-disabled', 'true');
    });

    it('has disabled styling when isCreated is true', () => {
      render(
        <SuggestionButton
          label="Refrigerator"
          isSelected={false}
          isCreated={true}
          onSelect={mockOnSelect}
        />
      );

      const button = screen.getByRole('radio');
      expect(button).toHaveClass('border-gray-200', 'bg-gray-50', 'text-gray-400', 'cursor-not-allowed');
    });

    it('does not call onSelect when clicked while created (disabled)', () => {
      render(
        <SuggestionButton
          label="Refrigerator"
          isSelected={false}
          isCreated={true}
          onSelect={mockOnSelect}
        />
      );

      fireEvent.click(screen.getByRole('radio'));
      expect(mockOnSelect).not.toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // Interaction Tests
  // ===========================================================================

  describe('Interactions', () => {
    it('calls onSelect when clicked (and not created)', () => {
      render(
        <SuggestionButton
          label="Refrigerator"
          isSelected={false}
          isCreated={false}
          onSelect={mockOnSelect}
        />
      );

      fireEvent.click(screen.getByRole('radio'));
      expect(mockOnSelect).toHaveBeenCalledWith('Refrigerator');
    });

    it('calls onSelect with label value', () => {
      render(
        <SuggestionButton
          label="Stove/Oven"
          isSelected={false}
          isCreated={false}
          onSelect={mockOnSelect}
        />
      );

      fireEvent.click(screen.getByRole('radio'));
      expect(mockOnSelect).toHaveBeenCalledWith('Stove/Oven');
    });

    it('calls onSelect on Enter key press', async () => {
      const user = userEvent.setup();
      render(
        <SuggestionButton
          label="Refrigerator"
          isSelected={false}
          isCreated={false}
          onSelect={mockOnSelect}
        />
      );

      const button = screen.getByRole('radio');
      button.focus();
      await user.keyboard('{Enter}');

      expect(mockOnSelect).toHaveBeenCalledWith('Refrigerator');
    });

    it('calls onSelect on Space key press', async () => {
      const user = userEvent.setup();
      render(
        <SuggestionButton
          label="Refrigerator"
          isSelected={false}
          isCreated={false}
          onSelect={mockOnSelect}
        />
      );

      const button = screen.getByRole('radio');
      button.focus();
      await user.keyboard(' ');

      expect(mockOnSelect).toHaveBeenCalledWith('Refrigerator');
    });

    it('does not call onSelect on Enter key when created', async () => {
      const user = userEvent.setup();
      render(
        <SuggestionButton
          label="Refrigerator"
          isSelected={false}
          isCreated={true}
          onSelect={mockOnSelect}
        />
      );

      const button = screen.getByRole('radio');
      button.focus();
      await user.keyboard('{Enter}');

      expect(mockOnSelect).not.toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // Accessibility Tests
  // ===========================================================================

  describe('Accessibility', () => {
    it('has role="radio"', () => {
      render(
        <SuggestionButton
          label="Refrigerator"
          isSelected={false}
          isCreated={false}
          onSelect={mockOnSelect}
        />
      );

      expect(screen.getByRole('radio')).toBeInTheDocument();
    });

    it('has type="button" to prevent form submission', () => {
      render(
        <SuggestionButton
          label="Refrigerator"
          isSelected={false}
          isCreated={false}
          onSelect={mockOnSelect}
        />
      );

      expect(screen.getByRole('radio')).toHaveAttribute('type', 'button');
    });

    it('has minimum touch target height of 48px', () => {
      render(
        <SuggestionButton
          label="Refrigerator"
          isSelected={false}
          isCreated={false}
          onSelect={mockOnSelect}
        />
      );

      expect(screen.getByRole('radio')).toHaveClass('min-h-[48px]');
    });

    it('has focus ring styles for keyboard navigation', () => {
      render(
        <SuggestionButton
          label="Refrigerator"
          isSelected={false}
          isCreated={false}
          onSelect={mockOnSelect}
        />
      );

      const button = screen.getByRole('radio');
      expect(button).toHaveClass('focus-visible:ring-2', 'focus-visible:ring-blue-500');
    });
  });

  // ===========================================================================
  // Edge Cases Tests
  // ===========================================================================

  describe('Edge Cases', () => {
    it('handles labels with special characters', () => {
      render(
        <SuggestionButton
          label="Stove/Oven"
          isSelected={false}
          isCreated={false}
          onSelect={mockOnSelect}
        />
      );

      expect(screen.getByText('Stove/Oven')).toBeInTheDocument();
    });

    it('handles labels with spaces', () => {
      render(
        <SuggestionButton
          label="TV/Smart TV"
          isSelected={false}
          isCreated={false}
          onSelect={mockOnSelect}
        />
      );

      expect(screen.getByText('TV/Smart TV')).toBeInTheDocument();
    });

    it('handles "Other..." label', () => {
      render(
        <SuggestionButton
          label="Other..."
          isSelected={false}
          isCreated={false}
          onSelect={mockOnSelect}
        />
      );

      expect(screen.getByText('Other...')).toBeInTheDocument();
      fireEvent.click(screen.getByRole('radio'));
      expect(mockOnSelect).toHaveBeenCalledWith('Other...');
    });

    it('does not show checkmark or Created when neither selected nor created', () => {
      render(
        <SuggestionButton
          label="Refrigerator"
          isSelected={false}
          isCreated={false}
          onSelect={mockOnSelect}
        />
      );

      expect(screen.queryByText('Created')).not.toBeInTheDocument();
      // The SVG checkmark shouldn't be present either (no Check icon)
    });
  });
});
