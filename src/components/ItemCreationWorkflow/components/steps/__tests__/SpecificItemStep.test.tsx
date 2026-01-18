/**
 * SpecificItemStep Component Tests
 *
 * @module ItemCreationWorkflow/components/steps/__tests__/SpecificItemStep
 * @lastModified 2026-01-05
 */

import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SpecificItemStep } from '../SpecificItemStep';
import type { SessionItem } from '../../../ItemCreationWorkflow.types';

describe('SpecificItemStep', () => {
  const defaultProps = {
    currentRoom: 'kitchen' as const,
    currentItemType: 'appliance' as const,
    currentSpecificItem: '',
    currentItemName: '',
    existingSessionItems: [] as SessionItem[],
    onSelectSpecificItem: vi.fn(),
    onSetItemName: vi.fn(),
    onNext: vi.fn(),
    canNext: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ===========================================================================
  // Rendering Tests
  // ===========================================================================

  describe('Rendering', () => {
    it('renders step title "What specific item?"', () => {
      render(<SpecificItemStep {...defaultProps} />);
      expect(
        screen.getByRole('heading', { name: /what specific item/i })
      ).toBeInTheDocument();
    });

    it('renders step description with room name', () => {
      render(<SpecificItemStep {...defaultProps} />);
      expect(
        screen.getByText(/select from suggestions or enter a custom item for kitchen/i)
      ).toBeInTheDocument();
    });

    it('renders suggestions from useSuggestions hook', () => {
      render(<SpecificItemStep {...defaultProps} />);

      expect(screen.getByText('Stove/Oven')).toBeInTheDocument();
      expect(screen.getByText('Refrigerator')).toBeInTheDocument();
      expect(screen.getByText('Microwave')).toBeInTheDocument();
    });

    it('renders "Other..." option', () => {
      render(<SpecificItemStep {...defaultProps} />);
      expect(screen.getByText('Other...')).toBeInTheDocument();
    });

    it('renders Continue button', () => {
      render(<SpecificItemStep {...defaultProps} />);
      expect(
        screen.getByRole('button', { name: /continue/i })
      ).toBeInTheDocument();
    });

    it('renders "Suggestions" section header', () => {
      render(<SpecificItemStep {...defaultProps} />);
      expect(screen.getByText('Suggestions')).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Selection Tests
  // ===========================================================================

  describe('Selection', () => {
    it('calls onSelectSpecificItem when clicking a suggestion', () => {
      render(<SpecificItemStep {...defaultProps} />);

      fireEvent.click(screen.getByText('Refrigerator'));
      expect(defaultProps.onSelectSpecificItem).toHaveBeenCalledWith('Refrigerator');
    });

    it('calls onSelectSpecificItem for each suggestion type', () => {
      const suggestions = ['Stove/Oven', 'Refrigerator', 'Microwave'];

      suggestions.forEach((suggestion) => {
        vi.clearAllMocks();
        const { unmount } = render(<SpecificItemStep {...defaultProps} />);
        fireEvent.click(screen.getByText(suggestion));
        expect(defaultProps.onSelectSpecificItem).toHaveBeenCalledWith(suggestion);
        unmount();
      });
    });

    it('shows selected state for currentSpecificItem', () => {
      render(
        <SpecificItemStep
          {...defaultProps}
          currentSpecificItem="Refrigerator"
        />
      );

      const refrigeratorButton = screen.getByText('Refrigerator').closest('button');
      expect(refrigeratorButton).toHaveAttribute('aria-checked', 'true');
    });
  });

  // ===========================================================================
  // ItemNameEditor Integration Tests
  // ===========================================================================

  describe('ItemNameEditor', () => {
    it('shows ItemNameEditor when item is selected', () => {
      render(
        <SpecificItemStep
          {...defaultProps}
          currentSpecificItem="Refrigerator"
          currentItemName="Kitchen - Refrigerator"
        />
      );

      expect(screen.getByLabelText(/item name/i)).toBeInTheDocument();
      expect(screen.getByDisplayValue('Kitchen - Refrigerator')).toBeInTheDocument();
    });

    it('does not show ItemNameEditor when no item selected', () => {
      render(<SpecificItemStep {...defaultProps} />);

      expect(screen.queryByLabelText(/item name/i)).not.toBeInTheDocument();
    });

    it('calls onSetItemName when editing item name', () => {
      render(
        <SpecificItemStep
          {...defaultProps}
          currentSpecificItem="Refrigerator"
          currentItemName="Kitchen - Refrigerator"
        />
      );

      fireEvent.change(screen.getByLabelText(/item name/i), {
        target: { value: 'Custom Name' },
      });

      expect(defaultProps.onSetItemName).toHaveBeenCalledWith('Custom Name');
    });
  });

  // ===========================================================================
  // Continue Button Tests
  // ===========================================================================

  describe('Continue Button', () => {
    it('Continue button disabled when no item selected', () => {
      render(<SpecificItemStep {...defaultProps} canNext={false} />);

      const button = screen.getByRole('button', { name: /continue/i });
      expect(button).toBeDisabled();
    });

    it('Continue button enabled when item selected', () => {
      render(
        <SpecificItemStep
          {...defaultProps}
          currentSpecificItem="Refrigerator"
          canNext={true}
        />
      );

      const button = screen.getByRole('button', { name: /continue/i });
      expect(button).toBeEnabled();
    });

    it('Continue button calls onNext', async () => {
      const user = userEvent.setup();
      render(
        <SpecificItemStep
          {...defaultProps}
          currentSpecificItem="Refrigerator"
          canNext={true}
        />
      );

      await user.click(screen.getByRole('button', { name: /continue/i }));
      expect(defaultProps.onNext).toHaveBeenCalled();
    });

    it('Continue button does not call onNext when disabled', () => {
      render(<SpecificItemStep {...defaultProps} canNext={false} />);

      fireEvent.click(screen.getByRole('button', { name: /continue/i }));
      expect(defaultProps.onNext).not.toHaveBeenCalled();
    });

    it('Continue button has disabled styling when canNext is false', () => {
      render(<SpecificItemStep {...defaultProps} canNext={false} />);

      const button = screen.getByRole('button', { name: /continue/i });
      expect(button).toHaveClass('bg-gray-200', 'text-gray-400', 'cursor-not-allowed');
    });

    it('Continue button has enabled styling when canNext is true', () => {
      render(
        <SpecificItemStep
          {...defaultProps}
          currentSpecificItem="Refrigerator"
          canNext={true}
        />
      );

      const button = screen.getByRole('button', { name: /continue/i });
      expect(button).toHaveClass('bg-[#FF385C]', 'text-white');
    });

    it('Continue button has minimum touch target height', () => {
      render(<SpecificItemStep {...defaultProps} />);

      const button = screen.getByRole('button', { name: /continue/i });
      expect(button).toHaveClass('min-h-[56px]');
    });
  });

  // ===========================================================================
  // "Other" Custom Input Tests
  // ===========================================================================

  describe('Custom Input (Other)', () => {
    it('"Other" option enables custom input', () => {
      render(<SpecificItemStep {...defaultProps} />);

      fireEvent.click(screen.getByText('Other...'));
      expect(screen.getByPlaceholderText(/e.g., Coffee Maker/i)).toBeInTheDocument();
    });

    it('typing in custom input calls onSelectSpecificItem', async () => {
      const user = userEvent.setup();
      render(<SpecificItemStep {...defaultProps} />);

      fireEvent.click(screen.getByText('Other...'));
      const input = screen.getByPlaceholderText(/e.g., Coffee Maker/i);
      await user.type(input, 'Custom Item');

      expect(defaultProps.onSelectSpecificItem).toHaveBeenCalled();
    });

    it('selecting suggestion after custom input clears custom mode', () => {
      render(<SpecificItemStep {...defaultProps} />);

      // First click Other
      fireEvent.click(screen.getByText('Other...'));
      expect(screen.getByPlaceholderText(/e.g., Coffee Maker/i)).toBeInTheDocument();

      // Then click a suggestion
      fireEvent.click(screen.getByText('Refrigerator'));

      // Custom input should be gone
      expect(screen.queryByPlaceholderText(/e.g., Coffee Maker/i)).not.toBeInTheDocument();
    });

    it('custom input has autoFocus when in custom mode', () => {
      render(<SpecificItemStep {...defaultProps} />);

      fireEvent.click(screen.getByText('Other...'));
      const input = screen.getByPlaceholderText(/e.g., Coffee Maker/i);

      expect(input).toHaveAttribute('autofocus');
    });
  });

  // ===========================================================================
  // Created Items (Disabled) Tests
  // ===========================================================================

  describe('Created Items', () => {
    const mockSessionItem = (name: string): SessionItem => ({
      id: crypto.randomUUID(),
      name,
      room: 'kitchen',
      itemType: 'appliance',
      content: [],
      createdAt: new Date(),
    });

    it('shows grayed out state for already created items', () => {
      render(
        <SpecificItemStep
          {...defaultProps}
          existingSessionItems={[
            mockSessionItem('Kitchen - Refrigerator'),
          ]}
        />
      );

      const refrigeratorButton = screen.getByText('Refrigerator').closest('button');
      expect(refrigeratorButton).toBeDisabled();
      expect(screen.getByText('Created')).toBeInTheDocument();
    });

    it('allows clicking non-created items when some are created', () => {
      render(
        <SpecificItemStep
          {...defaultProps}
          existingSessionItems={[
            mockSessionItem('Kitchen - Refrigerator'),
          ]}
        />
      );

      const ovenButton = screen.getByText('Stove/Oven').closest('button');
      expect(ovenButton).not.toBeDisabled();

      fireEvent.click(screen.getByText('Stove/Oven'));
      expect(defaultProps.onSelectSpecificItem).toHaveBeenCalledWith('Stove/Oven');
    });
  });

  // ===========================================================================
  // Room with No Suggestions Tests
  // ===========================================================================

  describe('Room with No Suggestions', () => {
    it('shows custom input by default for "other" room', () => {
      render(
        <SpecificItemStep
          {...defaultProps}
          currentRoom="other"
        />
      );

      expect(screen.getByPlaceholderText(/e.g., Coffee Maker/i)).toBeInTheDocument();
    });

    it('does not show "Suggestions" header for "other" room', () => {
      render(
        <SpecificItemStep
          {...defaultProps}
          currentRoom="other"
        />
      );

      expect(screen.queryByText('Suggestions')).not.toBeInTheDocument();
    });

    it('shows "Enter item name" label for room without suggestions', () => {
      render(
        <SpecificItemStep
          {...defaultProps}
          currentRoom="other"
        />
      );

      expect(screen.getByText('Enter item name')).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Accessibility Tests
  // ===========================================================================

  describe('Accessibility', () => {
    it('has radiogroup role on suggestions container', () => {
      render(<SpecificItemStep {...defaultProps} />);
      expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    });

    it('has aria-label on radiogroup', () => {
      render(<SpecificItemStep {...defaultProps} />);
      expect(screen.getByRole('radiogroup')).toHaveAttribute(
        'aria-label',
        expect.stringContaining('specific item')
      );
    });

    it('Continue button has aria-disabled when disabled', () => {
      render(<SpecificItemStep {...defaultProps} canNext={false} />);

      const button = screen.getByRole('button', { name: /continue/i });
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });

    it('custom input has aria-required', () => {
      render(
        <SpecificItemStep
          {...defaultProps}
          currentRoom="other"
        />
      );

      const input = screen.getByPlaceholderText(/e.g., Coffee Maker/i);
      expect(input).toHaveAttribute('aria-required', 'true');
    });
  });

  // ===========================================================================
  // Edge Cases Tests
  // ===========================================================================

  describe('Edge Cases', () => {
    it('applies custom className', () => {
      render(
        <SpecificItemStep {...defaultProps} className="custom-test-class" />
      );

      const container = screen
        .getByRole('heading', { name: /what specific item/i })
        .closest('div[class*="flex-col"]');
      expect(container).toHaveClass('custom-test-class');
    });

    it('renders correct room label for different rooms', () => {
      render(
        <SpecificItemStep
          {...defaultProps}
          currentRoom="bathroom"
          currentItemType="appliance"
        />
      );

      expect(
        screen.getByText(/select from suggestions or enter a custom item for bathroom/i)
      ).toBeInTheDocument();
    });

    it('shows living room label correctly', () => {
      render(
        <SpecificItemStep
          {...defaultProps}
          currentRoom="living-room"
          currentItemType="appliance"
        />
      );

      expect(
        screen.getByText(/select from suggestions or enter a custom item for living room/i)
      ).toBeInTheDocument();
    });

    it('grid layout has correct responsive classes', () => {
      render(<SpecificItemStep {...defaultProps} />);

      const radiogroup = screen.getByRole('radiogroup');
      expect(radiogroup).toHaveClass('grid', 'grid-cols-2', 'sm:grid-cols-3', 'gap-3');
    });
  });
});
