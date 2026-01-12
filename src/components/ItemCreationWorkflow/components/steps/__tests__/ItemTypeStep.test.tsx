/**
 * ItemTypeStep Component Tests
 *
 * @module ItemCreationWorkflow/components/steps/__tests__/ItemTypeStep.test
 * @lastModified 2026-01-05
 */

import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ItemTypeStep } from '../ItemTypeStep';

describe('ItemTypeStep', () => {
  const defaultProps = {
    currentItemType: null as const,
    onSelectItemType: vi.fn(),
    onNext: vi.fn(),
    canNext: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ===========================================================================
  // Task 8: Rendering Tests
  // ===========================================================================

  describe('Rendering', () => {
    it('renders step title "What type of item is this?"', () => {
      render(<ItemTypeStep {...defaultProps} />);
      expect(
        screen.getByRole('heading', { name: /what type of item is this/i })
      ).toBeInTheDocument();
    });

    it('renders step description', () => {
      render(<ItemTypeStep {...defaultProps} />);
      expect(
        screen.getByText(/choose the category that best describes/i)
      ).toBeInTheDocument();
    });

    it('renders all 3 item type options', () => {
      render(<ItemTypeStep {...defaultProps} />);
      const radioButtons = screen.getAllByRole('radio');
      expect(radioButtons).toHaveLength(3);
    });

    it('renders item type labels correctly', () => {
      render(<ItemTypeStep {...defaultProps} />);
      expect(screen.getByText('Appliance')).toBeInTheDocument();
      expect(screen.getByText('Room Item')).toBeInTheDocument();
      expect(screen.getByText('General Info')).toBeInTheDocument();
    });

    it('renders item type descriptions', () => {
      render(<ItemTypeStep {...defaultProps} />);
      expect(screen.getByText(/washer, dryer, stove/i)).toBeInTheDocument();
      expect(screen.getByText(/pantry, cabinets, closet/i)).toBeInTheDocument();
      expect(screen.getByText(/trash schedule, wifi info/i)).toBeInTheDocument();
    });

    it('renders Continue button', () => {
      render(<ItemTypeStep {...defaultProps} />);
      expect(
        screen.getByRole('button', { name: /continue/i })
      ).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Task 9: Selection Interaction Tests
  // ===========================================================================

  describe('Selection', () => {
    it('calls onSelectItemType when clicking Appliance', () => {
      render(<ItemTypeStep {...defaultProps} />);
      fireEvent.click(screen.getByText('Appliance'));
      expect(defaultProps.onSelectItemType).toHaveBeenCalledWith('appliance');
    });

    it('calls onSelectItemType when clicking Room Item', () => {
      render(<ItemTypeStep {...defaultProps} />);
      fireEvent.click(screen.getByText('Room Item'));
      expect(defaultProps.onSelectItemType).toHaveBeenCalledWith('room-item');
    });

    it('calls onSelectItemType when clicking General Info', () => {
      render(<ItemTypeStep {...defaultProps} />);
      fireEvent.click(screen.getByText('General Info'));
      expect(defaultProps.onSelectItemType).toHaveBeenCalledWith('general-info');
    });

    it('shows selected state for currentItemType', () => {
      render(<ItemTypeStep {...defaultProps} currentItemType="appliance" />);
      const applianceButton = screen.getByText('Appliance').closest('button');
      expect(applianceButton).toHaveAttribute('aria-checked', 'true');
    });

    it('shows unselected state for other item types', () => {
      render(<ItemTypeStep {...defaultProps} currentItemType="appliance" />);
      const roomItemButton = screen.getByText('Room Item').closest('button');
      expect(roomItemButton).toHaveAttribute('aria-checked', 'false');
    });

    it('calls onSelectItemType with correct type for each option', () => {
      const typeMappings = [
        { label: 'Appliance', type: 'appliance' },
        { label: 'Room Item', type: 'room-item' },
        { label: 'General Info', type: 'general-info' },
      ];

      typeMappings.forEach(({ label, type }) => {
        vi.clearAllMocks();
        const { unmount } = render(<ItemTypeStep {...defaultProps} />);
        fireEvent.click(screen.getByText(label));
        expect(defaultProps.onSelectItemType).toHaveBeenCalledWith(type);
        unmount();
      });
    });
  });

  // ===========================================================================
  // Task 10: Navigation and Validation Tests
  // ===========================================================================

  describe('Navigation', () => {
    it('Continue button is disabled when no item type selected', () => {
      render(
        <ItemTypeStep {...defaultProps} currentItemType={null} canNext={false} />
      );
      const button = screen.getByRole('button', { name: /continue/i });
      expect(button).toBeDisabled();
    });

    it('Continue button is enabled when an item type is selected', () => {
      render(
        <ItemTypeStep
          {...defaultProps}
          currentItemType="appliance"
          canNext={true}
        />
      );
      const button = screen.getByRole('button', { name: /continue/i });
      expect(button).not.toBeDisabled();
    });

    it('calls onNext when Continue is clicked with valid selection', async () => {
      const user = userEvent.setup();
      render(
        <ItemTypeStep
          {...defaultProps}
          currentItemType="appliance"
          canNext={true}
        />
      );

      await user.click(screen.getByRole('button', { name: /continue/i }));

      expect(defaultProps.onNext).toHaveBeenCalledTimes(1);
    });

    it('does not call onNext when Continue is clicked without selection', () => {
      render(
        <ItemTypeStep {...defaultProps} currentItemType={null} canNext={false} />
      );

      const button = screen.getByRole('button', { name: /continue/i });
      fireEvent.click(button);

      expect(defaultProps.onNext).not.toHaveBeenCalled();
    });

    it('Continue button has disabled styling when canNext is false', () => {
      render(<ItemTypeStep {...defaultProps} canNext={false} />);
      const button = screen.getByRole('button', { name: /continue/i });
      expect(button).toHaveClass('bg-gray-200');
      expect(button).toHaveClass('cursor-not-allowed');
    });

    it('Continue button has enabled styling when canNext is true', () => {
      render(
        <ItemTypeStep
          {...defaultProps}
          currentItemType="appliance"
          canNext={true}
        />
      );
      const button = screen.getByRole('button', { name: /continue/i });
      expect(button).toHaveClass('bg-[#FF385C]');
    });
  });

  // ===========================================================================
  // Task 11: Accessibility Tests
  // ===========================================================================

  describe('Accessibility', () => {
    it('has radiogroup role on cards container', () => {
      render(<ItemTypeStep {...defaultProps} />);
      expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    });

    it('has aria-label on radiogroup', () => {
      render(<ItemTypeStep {...defaultProps} />);
      expect(screen.getByRole('radiogroup')).toHaveAttribute(
        'aria-label',
        expect.stringContaining('item type')
      );
    });

    it('all item type options have radio role', () => {
      render(<ItemTypeStep {...defaultProps} />);
      const radios = screen.getAllByRole('radio');
      expect(radios).toHaveLength(3);
    });

    it('each card has aria-describedby for description', () => {
      render(<ItemTypeStep {...defaultProps} />);
      const radios = screen.getAllByRole('radio');
      radios.forEach((radio) => {
        expect(radio).toHaveAttribute('aria-describedby');
      });
    });

    it('supports keyboard navigation with Enter key', async () => {
      const user = userEvent.setup();
      render(<ItemTypeStep {...defaultProps} />);

      const applianceCard = screen.getByText('Appliance').closest('button');
      applianceCard?.focus();
      await user.keyboard('{Enter}');

      expect(defaultProps.onSelectItemType).toHaveBeenCalledWith('appliance');
    });

    it('supports keyboard navigation with Space key', async () => {
      const user = userEvent.setup();
      render(<ItemTypeStep {...defaultProps} />);

      const applianceCard = screen.getByText('Appliance').closest('button');
      applianceCard?.focus();
      await user.keyboard(' ');

      expect(defaultProps.onSelectItemType).toHaveBeenCalledWith('appliance');
    });

    it('Continue button has aria-disabled when disabled', () => {
      render(
        <ItemTypeStep {...defaultProps} currentItemType={null} canNext={false} />
      );
      const button = screen.getByRole('button', { name: /continue/i });
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });
  });

  // ===========================================================================
  // Task 12: Skip Logic Verification Tests
  // ===========================================================================

  describe('Skip Logic Integration Notes', () => {
    /**
     * The auto-skip logic for "General" room is handled by the state machine
     * in useWorkflowState.ts, not by this component. When room === 'general':
     *
     * 1. SELECT_ROOM action auto-sets itemType to 'general-info' (lines 210-221)
     * 2. getNextStep() returns 'specific-item-selection' instead of 'item-type-selection'
     * 3. The ItemTypeStep component is never rendered
     *
     * These tests document the expected behavior but the actual skip logic
     * is tested in useWorkflowState.test.ts integration tests.
     */

    it('component renders normally when passed valid props', () => {
      // This verifies the component works when it IS rendered
      // (i.e., when room is NOT 'general')
      render(<ItemTypeStep {...defaultProps} />);
      expect(screen.getByRole('heading')).toBeInTheDocument();
    });

    it('renders with pre-selected item type if provided', () => {
      // This could happen if user navigates back to this step
      render(<ItemTypeStep {...defaultProps} currentItemType="room-item" />);
      const roomItemButton = screen.getByText('Room Item').closest('button');
      expect(roomItemButton).toHaveAttribute('aria-checked', 'true');
    });
  });

  // ===========================================================================
  // Additional Edge Case Tests
  // ===========================================================================

  describe('Edge Cases', () => {
    it('applies custom className', () => {
      render(
        <ItemTypeStep {...defaultProps} className="custom-test-class" />
      );
      const container = screen
        .getByRole('heading', { name: /what type of item is this/i })
        .closest('div[class*="flex-col"]');
      expect(container).toHaveClass('custom-test-class');
    });

    it('Continue button has correct disabled styling', () => {
      render(<ItemTypeStep {...defaultProps} currentItemType={null} />);
      const button = screen.getByRole('button', { name: /continue/i });
      expect(button).toHaveClass('bg-gray-200', 'text-gray-400');
    });

    it('Continue button has correct enabled styling', () => {
      render(
        <ItemTypeStep
          {...defaultProps}
          currentItemType="appliance"
          canNext={true}
        />
      );
      const button = screen.getByRole('button', { name: /continue/i });
      expect(button).toHaveClass('bg-[#FF385C]', 'text-white');
    });

    it('Continue button has minimum touch target height', () => {
      render(<ItemTypeStep {...defaultProps} />);
      const button = screen.getByRole('button', { name: /continue/i });
      expect(button).toHaveClass('min-h-[56px]');
    });

    it('displays all three item types in vertical layout', () => {
      render(<ItemTypeStep {...defaultProps} />);
      const radiogroup = screen.getByRole('radiogroup');
      expect(radiogroup).toHaveClass('flex', 'flex-col', 'gap-4');
    });
  });
});
