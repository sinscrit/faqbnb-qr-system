/**
 * RoomSelectionStep Component Tests
 *
 * @module ItemCreationWorkflow/components/steps/__tests__/RoomSelectionStep.test
 * @lastModified 2026-01-05
 */

import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RoomSelectionStep } from '../RoomSelectionStep';

describe('RoomSelectionStep', () => {
  const defaultProps = {
    currentRoom: null,
    onSelectRoom: vi.fn(),
    onNext: vi.fn(),
    canNext: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ===========================================================================
  // Task 9: Rendering Tests
  // ===========================================================================

  describe('Rendering', () => {
    it('renders step title "Select a Room"', () => {
      render(<RoomSelectionStep {...defaultProps} />);
      expect(
        screen.getByRole('heading', { name: /select a room/i })
      ).toBeInTheDocument();
    });

    it('renders step description', () => {
      render(<RoomSelectionStep {...defaultProps} />);
      expect(
        screen.getByText(/choose where this item is located/i)
      ).toBeInTheDocument();
    });

    it('renders all 9 room options', () => {
      render(<RoomSelectionStep {...defaultProps} />);
      const roomButtons = screen.getAllByRole('radio');
      expect(roomButtons).toHaveLength(9);
    });

    it('renders room labels correctly', () => {
      render(<RoomSelectionStep {...defaultProps} />);
      expect(screen.getByText('Kitchen')).toBeInTheDocument();
      expect(screen.getByText('Laundry Room')).toBeInTheDocument();
      expect(screen.getByText('Bedroom')).toBeInTheDocument();
      expect(screen.getByText('Bathroom')).toBeInTheDocument();
      expect(screen.getByText('Living Room')).toBeInTheDocument();
      expect(screen.getByText('Garage')).toBeInTheDocument();
      expect(screen.getByText('Outdoor/Patio')).toBeInTheDocument();
      expect(screen.getByText('General/Whole Property')).toBeInTheDocument();
      expect(screen.getByText('Other')).toBeInTheDocument();
    });

    it('renders Continue button', () => {
      render(<RoomSelectionStep {...defaultProps} />);
      expect(
        screen.getByRole('button', { name: /continue/i })
      ).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Task 10: Selection Interaction Tests
  // ===========================================================================

  describe('Selection', () => {
    it('calls onSelectRoom when clicking a room', () => {
      render(<RoomSelectionStep {...defaultProps} />);
      fireEvent.click(screen.getByText('Kitchen'));
      expect(defaultProps.onSelectRoom).toHaveBeenCalledWith('kitchen');
    });

    it('calls onSelectRoom with correct room type for each option', () => {
      render(<RoomSelectionStep {...defaultProps} />);

      const roomMappings = [
        { label: 'Kitchen', type: 'kitchen' },
        { label: 'Laundry Room', type: 'laundry' },
        { label: 'Bedroom', type: 'bedroom' },
        { label: 'Bathroom', type: 'bathroom' },
        { label: 'Living Room', type: 'living-room' },
        { label: 'Garage', type: 'garage' },
        { label: 'Outdoor/Patio', type: 'outdoor' },
        { label: 'General/Whole Property', type: 'general' },
        { label: 'Other', type: 'other' },
      ];

      roomMappings.forEach(({ label, type }) => {
        vi.clearAllMocks();
        fireEvent.click(screen.getByText(label));
        expect(defaultProps.onSelectRoom).toHaveBeenCalledWith(type);
      });
    });

    it('shows selected state for currentRoom', () => {
      render(<RoomSelectionStep {...defaultProps} currentRoom="kitchen" />);
      const kitchenButton = screen.getByText('Kitchen').closest('button');
      expect(kitchenButton).toHaveAttribute('aria-checked', 'true');
    });

    it('shows unselected state for other rooms', () => {
      render(<RoomSelectionStep {...defaultProps} currentRoom="kitchen" />);
      const bedroomButton = screen.getByText('Bedroom').closest('button');
      expect(bedroomButton).toHaveAttribute('aria-checked', 'false');
    });
  });

  // ===========================================================================
  // Task 11: "Other" Option Tests
  // ===========================================================================

  describe('"Other" Option', () => {
    it('does not show custom input when "Other" is not selected', () => {
      render(<RoomSelectionStep {...defaultProps} currentRoom="kitchen" />);
      expect(
        screen.queryByLabelText(/enter room name/i)
      ).not.toBeInTheDocument();
    });

    it('shows custom input when "Other" is selected', () => {
      render(<RoomSelectionStep {...defaultProps} currentRoom="other" />);
      expect(screen.getByLabelText(/enter room name/i)).toBeInTheDocument();
    });

    it('allows text entry in custom room input', async () => {
      const user = userEvent.setup();
      render(<RoomSelectionStep {...defaultProps} currentRoom="other" />);

      const input = screen.getByLabelText(/enter room name/i);
      await user.type(input, 'Home Office');

      expect(input).toHaveValue('Home Office');
    });

    it('has placeholder text in custom input', () => {
      render(<RoomSelectionStep {...defaultProps} currentRoom="other" />);
      const input = screen.getByLabelText(/enter room name/i);
      expect(input).toHaveAttribute(
        'placeholder',
        expect.stringContaining('Home Office')
      );
    });

    it('enforces maxLength on custom input', () => {
      render(<RoomSelectionStep {...defaultProps} currentRoom="other" />);
      const input = screen.getByLabelText(/enter room name/i);
      expect(input).toHaveAttribute('maxLength', '50');
    });

    it('shows character limit hint', () => {
      render(<RoomSelectionStep {...defaultProps} currentRoom="other" />);
      expect(screen.getByText(/maximum 50 characters/i)).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Task 12: Navigation and Validation Tests
  // ===========================================================================

  describe('Navigation', () => {
    it('Continue button is disabled when no room selected', () => {
      render(<RoomSelectionStep {...defaultProps} currentRoom={null} />);
      const button = screen.getByRole('button', { name: /continue/i });
      expect(button).toBeDisabled();
    });

    it('Continue button is enabled when a room is selected', () => {
      render(
        <RoomSelectionStep
          {...defaultProps}
          currentRoom="kitchen"
          canNext={true}
        />
      );
      const button = screen.getByRole('button', { name: /continue/i });
      expect(button).not.toBeDisabled();
    });

    it('Continue button is disabled when "Other" selected but input is empty', () => {
      render(<RoomSelectionStep {...defaultProps} currentRoom="other" />);
      const button = screen.getByRole('button', { name: /continue/i });
      expect(button).toBeDisabled();
    });

    it('Continue button is disabled when "Other" selected with only whitespace', async () => {
      const user = userEvent.setup();
      render(<RoomSelectionStep {...defaultProps} currentRoom="other" />);

      const input = screen.getByLabelText(/enter room name/i);
      await user.type(input, '   ');

      const button = screen.getByRole('button', { name: /continue/i });
      expect(button).toBeDisabled();
    });

    it('Continue button is enabled when "Other" selected with valid input', async () => {
      const user = userEvent.setup();
      render(<RoomSelectionStep {...defaultProps} currentRoom="other" />);

      const input = screen.getByLabelText(/enter room name/i);
      await user.type(input, 'Wine Cellar');

      const button = screen.getByRole('button', { name: /continue/i });
      expect(button).not.toBeDisabled();
    });

    it('calls onNext when Continue is clicked with valid selection', async () => {
      const user = userEvent.setup();
      render(
        <RoomSelectionStep
          {...defaultProps}
          currentRoom="kitchen"
          canNext={true}
        />
      );

      await user.click(screen.getByRole('button', { name: /continue/i }));

      expect(defaultProps.onNext).toHaveBeenCalledTimes(1);
    });

    it('does not call onNext when Continue is clicked with invalid selection', () => {
      render(<RoomSelectionStep {...defaultProps} currentRoom={null} />);

      const button = screen.getByRole('button', { name: /continue/i });
      fireEvent.click(button);

      expect(defaultProps.onNext).not.toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // Task 13: Accessibility Tests
  // ===========================================================================

  describe('Accessibility', () => {
    it('has radiogroup role on grid container', () => {
      render(<RoomSelectionStep {...defaultProps} />);
      expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    });

    it('has aria-label on radiogroup', () => {
      render(<RoomSelectionStep {...defaultProps} />);
      expect(screen.getByRole('radiogroup')).toHaveAttribute(
        'aria-label',
        expect.stringContaining('room')
      );
    });

    it('all room options have radio role', () => {
      render(<RoomSelectionStep {...defaultProps} />);
      const radios = screen.getAllByRole('radio');
      expect(radios).toHaveLength(9);
    });

    it('custom input has proper label association', () => {
      render(<RoomSelectionStep {...defaultProps} currentRoom="other" />);
      const input = screen.getByLabelText(/enter room name/i);
      expect(input).toHaveAttribute('id', 'custom-room-input');
    });

    it('custom input has aria-required', () => {
      render(<RoomSelectionStep {...defaultProps} currentRoom="other" />);
      const input = screen.getByLabelText(/enter room name/i);
      expect(input).toHaveAttribute('aria-required', 'true');
    });

    it('custom input has aria-describedby for hint', () => {
      render(<RoomSelectionStep {...defaultProps} currentRoom="other" />);
      const input = screen.getByLabelText(/enter room name/i);
      expect(input).toHaveAttribute('aria-describedby', 'custom-room-hint');
    });

    it('Continue button has aria-disabled when disabled', () => {
      render(<RoomSelectionStep {...defaultProps} currentRoom={null} />);
      const button = screen.getByRole('button', { name: /continue/i });
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });
  });

  // ===========================================================================
  // Additional Edge Case Tests
  // ===========================================================================

  describe('Edge Cases', () => {
    it('applies custom className', () => {
      render(
        <RoomSelectionStep {...defaultProps} className="custom-test-class" />
      );
      const container = screen
        .getByRole('heading', { name: /select a room/i })
        .closest('div[class*="flex-col"]');
      expect(container).toHaveClass('custom-test-class');
    });

    it('Continue button has correct disabled styling', () => {
      render(<RoomSelectionStep {...defaultProps} currentRoom={null} />);
      const button = screen.getByRole('button', { name: /continue/i });
      expect(button).toHaveClass('bg-gray-200', 'text-gray-400');
    });

    it('Continue button has correct enabled styling', () => {
      render(<RoomSelectionStep {...defaultProps} currentRoom="kitchen" />);
      const button = screen.getByRole('button', { name: /continue/i });
      expect(button).toHaveClass('bg-[#FF385C]', 'text-white');
    });

    it('Continue button has minimum touch target height', () => {
      render(<RoomSelectionStep {...defaultProps} />);
      const button = screen.getByRole('button', { name: /continue/i });
      expect(button).toHaveClass('min-h-[56px]');
    });
  });
});
