/**
 * ItemNameEditor Component Tests
 *
 * @module ItemCreationWorkflow/components/shared/__tests__/ItemNameEditor
 * @lastModified 2026-01-05
 */

import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ItemNameEditor } from '../ItemNameEditor';

describe('ItemNameEditor', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  // ===========================================================================
  // Rendering Tests
  // ===========================================================================

  describe('Rendering', () => {
    it('renders input with current value', () => {
      render(
        <ItemNameEditor value="Kitchen - Refrigerator" onChange={mockOnChange} />
      );

      expect(screen.getByRole('textbox')).toHaveValue('Kitchen - Refrigerator');
    });

    it('renders label "Item Name"', () => {
      render(<ItemNameEditor value="" onChange={mockOnChange} />);

      expect(screen.getByText('Item Name')).toBeInTheDocument();
    });

    it('renders hint text', () => {
      render(<ItemNameEditor value="" onChange={mockOnChange} />);

      expect(screen.getByText('This name will appear on the QR code label')).toBeInTheDocument();
    });

    it('renders pencil icon', () => {
      render(<ItemNameEditor value="" onChange={mockOnChange} />);

      const label = screen.getByText('Item Name').closest('label');
      expect(label?.querySelector('svg')).toBeInTheDocument();
    });

    it('renders placeholder text', () => {
      render(
        <ItemNameEditor value="" onChange={mockOnChange} placeholder="Custom placeholder" />
      );

      expect(screen.getByPlaceholderText('Custom placeholder')).toBeInTheDocument();
    });

    it('uses default placeholder when not provided', () => {
      render(<ItemNameEditor value="" onChange={mockOnChange} />);

      expect(screen.getByPlaceholderText('Enter item name')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(
        <ItemNameEditor value="" onChange={mockOnChange} className="custom-class" />
      );

      const container = screen.getByText('Item Name').closest('div');
      expect(container).toHaveClass('custom-class');
    });
  });

  // ===========================================================================
  // Input Interaction Tests
  // ===========================================================================

  describe('Input Interactions', () => {
    it('calls onChange when text changes', () => {
      render(<ItemNameEditor value="" onChange={mockOnChange} />);

      fireEvent.change(screen.getByRole('textbox'), {
        target: { value: 'New Name' },
      });

      expect(mockOnChange).toHaveBeenCalledWith('New Name');
    });

    it('calls onChange with user typing', async () => {
      const user = userEvent.setup();
      render(<ItemNameEditor value="" onChange={mockOnChange} />);

      await user.type(screen.getByRole('textbox'), 'Test');

      expect(mockOnChange).toHaveBeenCalledTimes(4);
      expect(mockOnChange).toHaveBeenLastCalledWith('t');
    });

    it('respects maxLength attribute', () => {
      render(
        <ItemNameEditor value="" onChange={mockOnChange} maxLength={50} />
      );

      expect(screen.getByRole('textbox')).toHaveAttribute('maxLength', '50');
    });
  });

  // ===========================================================================
  // Character Counter Tests
  // ===========================================================================

  describe('Character Counter', () => {
    it('shows character counter', () => {
      render(
        <ItemNameEditor value="Test" onChange={mockOnChange} maxLength={100} />
      );

      expect(screen.getByText('4/100')).toBeInTheDocument();
    });

    it('updates counter based on value length', () => {
      render(
        <ItemNameEditor value="Hello World" onChange={mockOnChange} maxLength={100} />
      );

      expect(screen.getByText('11/100')).toBeInTheDocument();
    });

    it('shows counter in amber when near limit (80%+)', () => {
      render(
        <ItemNameEditor
          value="A".repeat(85)
          onChange={mockOnChange}
          maxLength={100}
        />
      );

      const counter = screen.getByText('85/100');
      expect(counter).toHaveClass('text-amber-600');
    });

    it('shows counter in gray when not near limit', () => {
      render(
        <ItemNameEditor value="Test" onChange={mockOnChange} maxLength={100} />
      );

      const counter = screen.getByText('4/100');
      expect(counter).toHaveClass('text-[#717171]');
    });

    it('shows correct counter with custom maxLength', () => {
      render(
        <ItemNameEditor value="Test" onChange={mockOnChange} maxLength={50} />
      );

      expect(screen.getByText('4/50')).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Disabled State Tests
  // ===========================================================================

  describe('Disabled State', () => {
    it('disabled state prevents input', () => {
      render(<ItemNameEditor value="Test" onChange={mockOnChange} disabled />);

      expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('has disabled styling when disabled', () => {
      render(<ItemNameEditor value="Test" onChange={mockOnChange} disabled />);

      expect(screen.getByRole('textbox')).toHaveClass('bg-gray-100', 'border-gray-200', 'cursor-not-allowed');
    });

    it('does not call onChange when disabled and typed into', async () => {
      const user = userEvent.setup();
      render(<ItemNameEditor value="Test" onChange={mockOnChange} disabled />);

      // Attempt to type (should not work because it's disabled)
      const input = screen.getByRole('textbox');
      await user.click(input);

      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // Accessibility Tests
  // ===========================================================================

  describe('Accessibility', () => {
    it('has accessible label', () => {
      render(<ItemNameEditor value="" onChange={mockOnChange} />);

      expect(screen.getByLabelText(/item name/i)).toBeInTheDocument();
    });

    it('has aria-describedby for hint', () => {
      render(<ItemNameEditor value="" onChange={mockOnChange} />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby', 'item-name-hint');
    });

    it('has id attribute for label association', () => {
      render(<ItemNameEditor value="" onChange={mockOnChange} />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('id', 'item-name-editor');
    });

    it('character counter has aria-live attribute', () => {
      render(
        <ItemNameEditor value="Test" onChange={mockOnChange} maxLength={100} />
      );

      const counter = screen.getByText('4/100');
      expect(counter).toHaveAttribute('aria-live', 'polite');
    });
  });

  // ===========================================================================
  // Styling Tests
  // ===========================================================================

  describe('Styling', () => {
    it('has proper input styling', () => {
      render(<ItemNameEditor value="" onChange={mockOnChange} />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('w-full', 'px-4', 'py-3', 'border-2', 'rounded-lg');
    });

    it('has focus styling', () => {
      render(<ItemNameEditor value="" onChange={mockOnChange} />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('focus:outline-none', 'focus:border-[#222222]');
    });

    it('has proper text styling', () => {
      render(<ItemNameEditor value="" onChange={mockOnChange} />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('text-base', 'text-[#222222]', 'placeholder:text-[#717171]');
    });
  });

  // ===========================================================================
  // Edge Cases Tests
  // ===========================================================================

  describe('Edge Cases', () => {
    it('handles empty value', () => {
      render(<ItemNameEditor value="" onChange={mockOnChange} />);

      expect(screen.getByRole('textbox')).toHaveValue('');
      expect(screen.getByText('0/100')).toBeInTheDocument();
    });

    it('handles long values', () => {
      const longValue = 'A'.repeat(100);
      render(
        <ItemNameEditor value={longValue} onChange={mockOnChange} maxLength={100} />
      );

      expect(screen.getByRole('textbox')).toHaveValue(longValue);
      expect(screen.getByText('100/100')).toBeInTheDocument();
    });

    it('handles values with special characters', () => {
      render(
        <ItemNameEditor value="Kitchen - Stove/Oven" onChange={mockOnChange} />
      );

      expect(screen.getByRole('textbox')).toHaveValue('Kitchen - Stove/Oven');
    });

    it('uses default maxLength of 100', () => {
      render(<ItemNameEditor value="" onChange={mockOnChange} />);

      expect(screen.getByRole('textbox')).toHaveAttribute('maxLength', '100');
    });
  });
});
