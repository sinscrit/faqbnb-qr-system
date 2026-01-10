/**
 * PurposeStep Component Tests
 *
 * Comprehensive unit tests for the PurposeStep component which handles
 * purpose/intent selection in the item creation workflow.
 *
 * @module ItemCreationWorkflow/components/steps/__tests__/PurposeStep.test
 * @lastModified 2026-01-10 (REQ-159)
 */

import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PurposeStep } from '../PurposeStep';
import { PURPOSE_TYPES, PURPOSE_LABELS, PURPOSE_DESCRIPTIONS } from '../../../utils/constants';
import type { PurposeType } from '../../../ItemCreationWorkflow.types';

describe('PurposeStep', () => {
  const defaultProps = {
    currentPurpose: null as PurposeType | null,
    onSelectPurpose: vi.fn(),
    onNext: vi.fn(),
    canNext: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  // ===========================================================================
  // Task 2: Rendering Tests
  // ===========================================================================

  describe('Rendering', () => {
    it('renders step title "What\'s the purpose of this content?"', () => {
      render(<PurposeStep {...defaultProps} />);
      expect(
        screen.getByRole('heading', { name: /what's the purpose of this content/i })
      ).toBeInTheDocument();
    });

    it('renders step description', () => {
      render(<PurposeStep {...defaultProps} />);
      expect(
        screen.getByText(/choose what you want to help guests with/i)
      ).toBeInTheDocument();
    });

    it('renders all 7 purpose type options', () => {
      render(<PurposeStep {...defaultProps} />);
      const radioButtons = screen.getAllByRole('radio');
      expect(radioButtons).toHaveLength(7);
    });

    it('renders purpose type labels correctly', () => {
      render(<PurposeStep {...defaultProps} />);
      expect(screen.getByText('How to Use')).toBeInTheDocument();
      expect(screen.getByText('How to Clean')).toBeInTheDocument();
      expect(screen.getByText('Troubleshooting')).toBeInTheDocument();
      expect(screen.getByText('Safety Information')).toBeInTheDocument();
      expect(screen.getByText('Maintenance')).toBeInTheDocument();
      expect(screen.getByText('Features & Tips')).toBeInTheDocument();
      expect(screen.getByText('Other')).toBeInTheDocument();
    });

    it('renders purpose type descriptions', () => {
      render(<PurposeStep {...defaultProps} />);
      expect(screen.getByText(/operating instructions and controls/i)).toBeInTheDocument();
      expect(screen.getByText(/cleaning and care instructions/i)).toBeInTheDocument();
      expect(screen.getByText(/common issues and fixes/i)).toBeInTheDocument();
      expect(screen.getByText(/safety warnings and precautions/i)).toBeInTheDocument();
      expect(screen.getByText(/regular maintenance tasks/i)).toBeInTheDocument();
      expect(screen.getByText(/special features and tips/i)).toBeInTheDocument();
      expect(screen.getByText(/general information/i)).toBeInTheDocument();
    });

    it('renders icons for each purpose type', () => {
      render(<PurposeStep {...defaultProps} />);
      const radios = screen.getAllByRole('radio');
      radios.forEach((radio) => {
        const icon = radio.querySelector('svg[aria-hidden="true"]');
        expect(icon).not.toBeNull();
      });
    });

    it('renders Continue button', () => {
      render(<PurposeStep {...defaultProps} />);
      expect(
        screen.getByRole('button', { name: /continue/i })
      ).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<PurposeStep {...defaultProps} className="custom-test-class" />);
      const container = screen
        .getByRole('heading', { name: /what's the purpose of this content/i })
        .closest('div.flex-col');
      expect(container).toHaveClass('custom-test-class');
    });
  });

  // ===========================================================================
  // Task 3: Selection State Management Tests
  // ===========================================================================

  describe('Selection State Management', () => {
    it('calls onSelectPurpose when clicking How to Use', () => {
      render(<PurposeStep {...defaultProps} />);
      fireEvent.click(screen.getByText('How to Use'));
      expect(defaultProps.onSelectPurpose).toHaveBeenCalledWith('how-to-use');
    });

    it('calls onSelectPurpose when clicking How to Clean', () => {
      render(<PurposeStep {...defaultProps} />);
      fireEvent.click(screen.getByText('How to Clean'));
      expect(defaultProps.onSelectPurpose).toHaveBeenCalledWith('how-to-clean');
    });

    it('calls onSelectPurpose when clicking Troubleshooting', () => {
      render(<PurposeStep {...defaultProps} />);
      fireEvent.click(screen.getByText('Troubleshooting'));
      expect(defaultProps.onSelectPurpose).toHaveBeenCalledWith('troubleshooting');
    });

    it('calls onSelectPurpose when clicking Safety Information', () => {
      render(<PurposeStep {...defaultProps} />);
      fireEvent.click(screen.getByText('Safety Information'));
      expect(defaultProps.onSelectPurpose).toHaveBeenCalledWith('safety-info');
    });

    it('calls onSelectPurpose when clicking Maintenance', () => {
      render(<PurposeStep {...defaultProps} />);
      fireEvent.click(screen.getByText('Maintenance'));
      expect(defaultProps.onSelectPurpose).toHaveBeenCalledWith('maintenance');
    });

    it('calls onSelectPurpose when clicking Features & Tips', () => {
      render(<PurposeStep {...defaultProps} />);
      fireEvent.click(screen.getByText('Features & Tips'));
      expect(defaultProps.onSelectPurpose).toHaveBeenCalledWith('features');
    });

    it('calls onSelectPurpose when clicking Other', () => {
      render(<PurposeStep {...defaultProps} />);
      fireEvent.click(screen.getByText('Other'));
      expect(defaultProps.onSelectPurpose).toHaveBeenCalledWith('other');
    });

    it('shows selected state for currentPurpose', () => {
      render(<PurposeStep {...defaultProps} currentPurpose="how-to-clean" />);
      const cleanButton = screen.getByText('How to Clean').closest('button');
      expect(cleanButton).toHaveAttribute('aria-checked', 'true');
    });

    it('shows unselected state for non-selected purposes', () => {
      render(<PurposeStep {...defaultProps} currentPurpose="how-to-use" />);
      const cleanButton = screen.getByText('How to Clean').closest('button');
      expect(cleanButton).toHaveAttribute('aria-checked', 'false');
    });

    it('only one purpose can be selected at a time', () => {
      render(<PurposeStep {...defaultProps} currentPurpose="troubleshooting" />);
      const radios = screen.getAllByRole('radio');
      const checkedRadios = radios.filter(
        (radio) => radio.getAttribute('aria-checked') === 'true'
      );
      expect(checkedRadios).toHaveLength(1);
    });

    it('calls onSelectPurpose with correct type for each option', () => {
      const typeMappings = [
        { label: 'How to Use', type: 'how-to-use' },
        { label: 'How to Clean', type: 'how-to-clean' },
        { label: 'Troubleshooting', type: 'troubleshooting' },
        { label: 'Safety Information', type: 'safety-info' },
        { label: 'Maintenance', type: 'maintenance' },
        { label: 'Features & Tips', type: 'features' },
        { label: 'Other', type: 'other' },
      ];

      typeMappings.forEach(({ label, type }) => {
        vi.clearAllMocks();
        const { unmount } = render(<PurposeStep {...defaultProps} />);
        fireEvent.click(screen.getByText(label));
        expect(defaultProps.onSelectPurpose).toHaveBeenCalledWith(type);
        unmount();
      });
    });
  });

  // ===========================================================================
  // Task 4: Auto-advance Behavior Tests
  // ===========================================================================

  describe('Auto-advance Behavior', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.runOnlyPendingTimers();
      vi.useRealTimers();
    });

    it('provides visual feedback immediately on selection', () => {
      render(<PurposeStep {...defaultProps} />);
      fireEvent.click(screen.getByText('How to Use'));
      expect(defaultProps.onSelectPurpose).toHaveBeenCalledWith('how-to-use');
    });

    it('calls onNext after brief delay for visual feedback', () => {
      render(<PurposeStep {...defaultProps} />);

      fireEvent.click(screen.getByText('How to Use'));

      // Verify immediate selection callback
      expect(defaultProps.onSelectPurpose).toHaveBeenCalledWith('how-to-use');

      // Verify onNext not called immediately
      expect(defaultProps.onNext).not.toHaveBeenCalled();

      // Fast-forward timers (150ms is the auto-advance delay in PurposeStep)
      act(() => {
        vi.advanceTimersByTime(150);
      });

      // Verify onNext called after delay
      expect(defaultProps.onNext).toHaveBeenCalledTimes(1);
    });

    it('each selection triggers onNext after delay', () => {
      render(<PurposeStep {...defaultProps} />);

      // Click first option
      fireEvent.click(screen.getByText('How to Use'));

      // Advance past timer
      act(() => {
        vi.advanceTimersByTime(200);
      });

      // onNext should have been called
      expect(defaultProps.onNext).toHaveBeenCalledTimes(1);
    });

    it('auto-advance works for all purpose types', () => {
      PURPOSE_TYPES.forEach((purposeType) => {
        vi.clearAllMocks();
        const { unmount } = render(<PurposeStep {...defaultProps} />);

        const label = PURPOSE_LABELS[purposeType];
        fireEvent.click(screen.getByText(label));

        act(() => {
          vi.advanceTimersByTime(200);
        });

        expect(defaultProps.onNext).toHaveBeenCalledTimes(1);
        unmount();
      });
    });

    it('handles rapid selection changes gracefully', () => {
      render(<PurposeStep {...defaultProps} />);

      // Rapidly click multiple options
      fireEvent.click(screen.getByText('How to Use'));
      fireEvent.click(screen.getByText('How to Clean'));
      fireEvent.click(screen.getByText('Troubleshooting'));

      // All selections should be registered
      expect(defaultProps.onSelectPurpose).toHaveBeenCalledTimes(3);

      // Advance past all timers
      act(() => {
        vi.advanceTimersByTime(500);
      });

      // Multiple onNext calls may occur (one per selection timeout)
      expect(defaultProps.onNext).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // Task 5: Keyboard Navigation Tests
  // ===========================================================================

  describe('Keyboard Navigation', () => {
    it('purpose cards are focusable with Tab', () => {
      render(<PurposeStep {...defaultProps} />);
      const firstCard = screen.getByText('How to Use').closest('button');
      expect(firstCard).not.toBeNull();
      firstCard?.focus();
      expect(document.activeElement).toBe(firstCard);
    });

    it('Enter key triggers selection', async () => {
      const user = userEvent.setup();
      render(<PurposeStep {...defaultProps} />);

      const howToUseCard = screen.getByText('How to Use').closest('button');
      howToUseCard?.focus();
      await user.keyboard('{Enter}');

      expect(defaultProps.onSelectPurpose).toHaveBeenCalledWith('how-to-use');
    });

    it('Space key triggers selection', async () => {
      const user = userEvent.setup();
      render(<PurposeStep {...defaultProps} />);

      const cleanCard = screen.getByText('How to Clean').closest('button');
      cleanCard?.focus();
      await user.keyboard(' ');

      expect(defaultProps.onSelectPurpose).toHaveBeenCalledWith('how-to-clean');
    });

    it('has visible focus ring classes on cards', () => {
      render(<PurposeStep {...defaultProps} />);
      const radios = screen.getAllByRole('radio');
      radios.forEach((radio) => {
        expect(radio).toHaveClass('focus-visible:ring-2');
      });
    });

    it('cards have proper focus outline classes', () => {
      render(<PurposeStep {...defaultProps} />);
      const radios = screen.getAllByRole('radio');
      radios.forEach((radio) => {
        expect(radio).toHaveClass('focus:outline-none');
        expect(radio).toHaveClass('focus-visible:ring-2');
        expect(radio).toHaveClass('focus-visible:ring-offset-2');
      });
    });
  });

  // ===========================================================================
  // Task 6: Accessibility Tests
  // ===========================================================================

  describe('Accessibility', () => {
    it('has radiogroup role on cards container', () => {
      render(<PurposeStep {...defaultProps} />);
      expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    });

    it('has aria-label on radiogroup', () => {
      render(<PurposeStep {...defaultProps} />);
      expect(screen.getByRole('radiogroup')).toHaveAttribute(
        'aria-label',
        expect.stringMatching(/purpose|content/i)
      );
    });

    it('all purpose options have radio role', () => {
      render(<PurposeStep {...defaultProps} />);
      const radios = screen.getAllByRole('radio');
      expect(radios).toHaveLength(7);
    });

    it('each card has aria-checked attribute', () => {
      render(<PurposeStep {...defaultProps} />);
      const radios = screen.getAllByRole('radio');
      radios.forEach((radio) => {
        expect(radio).toHaveAttribute('aria-checked');
      });
    });

    it('aria-checked is true for selected purpose', () => {
      render(<PurposeStep {...defaultProps} currentPurpose="maintenance" />);
      const maintenanceCard = screen.getByText('Maintenance').closest('button');
      expect(maintenanceCard).toHaveAttribute('aria-checked', 'true');
    });

    it('aria-checked is false for unselected purposes', () => {
      render(<PurposeStep {...defaultProps} currentPurpose="maintenance" />);
      const otherCard = screen.getByText('Other').closest('button');
      expect(otherCard).toHaveAttribute('aria-checked', 'false');
    });

    it('each card has aria-describedby for description', () => {
      render(<PurposeStep {...defaultProps} />);
      const radios = screen.getAllByRole('radio');
      radios.forEach((radio) => {
        expect(radio).toHaveAttribute('aria-describedby');
      });
    });

    it('icons have aria-hidden="true"', () => {
      render(<PurposeStep {...defaultProps} />);
      const radios = screen.getAllByRole('radio');
      radios.forEach((radio) => {
        const icon = radio.querySelector('svg');
        expect(icon).toHaveAttribute('aria-hidden', 'true');
      });
    });

    it('has descriptive aria-describedby on radiogroup', () => {
      render(<PurposeStep {...defaultProps} />);
      const radiogroup = screen.getByRole('radiogroup');
      expect(radiogroup).toHaveAttribute('aria-describedby', 'purpose-help');
    });

    it('has screen reader help text', () => {
      render(<PurposeStep {...defaultProps} />);
      const helpText = screen.getByText(/use up and down arrow keys/i);
      expect(helpText).toBeInTheDocument();
      expect(helpText).toHaveClass('sr-only');
    });

    it('Continue button has aria-disabled when disabled', () => {
      render(<PurposeStep {...defaultProps} currentPurpose={null} canNext={false} />);
      const button = screen.getByRole('button', { name: /continue/i });
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });
  });

  // ===========================================================================
  // Task 7: Navigation and Edge Case Tests
  // ===========================================================================

  describe('Navigation', () => {
    it('Continue button is disabled when no purpose selected', () => {
      render(<PurposeStep {...defaultProps} currentPurpose={null} canNext={false} />);
      const button = screen.getByRole('button', { name: /continue/i });
      expect(button).toBeDisabled();
    });

    it('Continue button is enabled when a purpose is selected', () => {
      render(<PurposeStep {...defaultProps} currentPurpose="how-to-use" canNext={true} />);
      const button = screen.getByRole('button', { name: /continue/i });
      expect(button).not.toBeDisabled();
    });

    it('calls onNext when Continue is clicked with valid selection', () => {
      render(<PurposeStep {...defaultProps} currentPurpose="how-to-use" canNext={true} />);

      fireEvent.click(screen.getByRole('button', { name: /continue/i }));

      expect(defaultProps.onNext).toHaveBeenCalled();
    });

    it('does not call onNext when Continue is clicked without selection', () => {
      render(<PurposeStep {...defaultProps} currentPurpose={null} canNext={false} />);

      const button = screen.getByRole('button', { name: /continue/i });
      fireEvent.click(button);

      expect(defaultProps.onNext).not.toHaveBeenCalled();
    });

    it('Continue button has disabled styling when canNext is false', () => {
      render(<PurposeStep {...defaultProps} canNext={false} />);
      const button = screen.getByRole('button', { name: /continue/i });
      expect(button).toHaveClass('bg-gray-200');
      expect(button).toHaveClass('cursor-not-allowed');
    });

    it('Continue button has enabled styling when canNext is true', () => {
      render(<PurposeStep {...defaultProps} currentPurpose="how-to-use" canNext={true} />);
      const button = screen.getByRole('button', { name: /continue/i });
      expect(button).toHaveClass('bg-[#FF385C]');
    });
  });

  describe('Edge Cases', () => {
    it('renders with pre-selected purpose if provided', () => {
      render(<PurposeStep {...defaultProps} currentPurpose="safety-info" />);
      const safetyButton = screen.getByText('Safety Information').closest('button');
      expect(safetyButton).toHaveAttribute('aria-checked', 'true');
    });

    it('handles rapid selection changes without errors', () => {
      render(<PurposeStep {...defaultProps} />);

      // Rapidly click multiple options
      fireEvent.click(screen.getByText('How to Use'));
      fireEvent.click(screen.getByText('How to Clean'));
      fireEvent.click(screen.getByText('Troubleshooting'));
      fireEvent.click(screen.getByText('Safety Information'));

      // Should not throw errors, all selections trigger onSelectPurpose
      expect(defaultProps.onSelectPurpose).toHaveBeenCalledTimes(4);
    });

    it('component can be unmounted safely', () => {
      const { unmount } = render(<PurposeStep {...defaultProps} />);

      fireEvent.click(screen.getByText('How to Use'));

      // Unmount should not throw
      expect(() => unmount()).not.toThrow();
    });

    it('renders with all PURPOSE_TYPES from constants', () => {
      render(<PurposeStep {...defaultProps} />);
      PURPOSE_TYPES.forEach((purposeType) => {
        const label = PURPOSE_LABELS[purposeType];
        expect(screen.getByText(label)).toBeInTheDocument();
      });
    });

    it('renders with all PURPOSE_DESCRIPTIONS from constants', () => {
      render(<PurposeStep {...defaultProps} />);
      PURPOSE_TYPES.forEach((purposeType) => {
        const description = PURPOSE_DESCRIPTIONS[purposeType];
        expect(screen.getByText(description)).toBeInTheDocument();
      });
    });
  });

  // ===========================================================================
  // Task 8: Styling Tests
  // ===========================================================================

  describe('Styling', () => {
    it('applies correct flex column classes for layout', () => {
      render(<PurposeStep {...defaultProps} />);
      const radiogroup = screen.getByRole('radiogroup');
      expect(radiogroup).toHaveClass('flex');
      expect(radiogroup).toHaveClass('flex-col');
    });

    it('displays gap between purpose cards', () => {
      render(<PurposeStep {...defaultProps} />);
      const radiogroup = screen.getByRole('radiogroup');
      expect(radiogroup).toHaveClass('gap-4');
    });

    it('buttons have minimum touch target size', () => {
      render(<PurposeStep {...defaultProps} />);
      const radios = screen.getAllByRole('radio');
      radios.forEach((radio) => {
        // Verify minimum height class (100px or larger on mobile)
        const hasMinHeight =
          radio.classList.contains('min-h-[100px]') ||
          radio.classList.contains('sm:min-h-[120px]');
        expect(hasMinHeight).toBe(true);
      });
    });

    it('buttons have touch-manipulation for mobile', () => {
      render(<PurposeStep {...defaultProps} />);
      const radios = screen.getAllByRole('radio');
      radios.forEach((radio) => {
        expect(radio).toHaveClass('touch-manipulation');
      });
    });

    it('Continue button has minimum touch target height', () => {
      render(<PurposeStep {...defaultProps} />);
      const button = screen.getByRole('button', { name: /continue/i });
      expect(button).toHaveClass('min-h-[56px]');
    });

    it('selected button has correct styling', () => {
      render(<PurposeStep {...defaultProps} currentPurpose="how-to-use" />);
      const selectedCard = screen.getByText('How to Use').closest('button');
      expect(selectedCard).toHaveClass('border-blue-500');
      expect(selectedCard).toHaveClass('bg-blue-50');
    });

    it('unselected buttons have proper base styling', () => {
      render(<PurposeStep {...defaultProps} currentPurpose="how-to-use" />);
      const unselectedCard = screen.getByText('How to Clean').closest('button');
      expect(unselectedCard).toHaveClass('border-gray-200');
      expect(unselectedCard).toHaveClass('bg-white');
    });

    it('buttons have transition classes', () => {
      render(<PurposeStep {...defaultProps} />);
      const radios = screen.getAllByRole('radio');
      radios.forEach((radio) => {
        expect(radio).toHaveClass('transition-all');
        expect(radio).toHaveClass('duration-200');
      });
    });

    it('Continue button has correct disabled styling', () => {
      render(<PurposeStep {...defaultProps} currentPurpose={null} />);
      const button = screen.getByRole('button', { name: /continue/i });
      expect(button).toHaveClass('bg-gray-200', 'text-gray-400');
    });

    it('Continue button has correct enabled styling', () => {
      render(<PurposeStep {...defaultProps} currentPurpose="how-to-use" canNext={true} />);
      const button = screen.getByRole('button', { name: /continue/i });
      expect(button).toHaveClass('bg-[#FF385C]', 'text-white');
    });
  });

  // ===========================================================================
  // Visual Indicator Tests
  // ===========================================================================

  describe('Visual Indicators', () => {
    it('shows checkmark indicator for selected purpose', () => {
      render(<PurposeStep {...defaultProps} currentPurpose="how-to-use" />);
      const selectedCard = screen.getByText('How to Use').closest('button');
      // The checkmark is a Check icon inside the selected button
      const checkmark = selectedCard?.querySelector('.text-blue-600');
      expect(checkmark).toBeInTheDocument();
    });

    it('does not show checkmark for unselected purposes', () => {
      render(<PurposeStep {...defaultProps} currentPurpose="how-to-use" />);
      const unselectedCard = screen.getByText('How to Clean').closest('button');
      // Unselected cards should not have a checkmark
      // The Check icon is only rendered when isSelected is true
      const children = unselectedCard?.querySelectorAll('svg');
      // Should only have 1 svg (the purpose icon), not the checkmark
      expect(children?.length).toBe(1);
    });

    it('icon has correct color when selected', () => {
      render(<PurposeStep {...defaultProps} currentPurpose="how-to-use" />);
      const selectedCard = screen.getByText('How to Use').closest('button');
      const iconContainer = selectedCard?.querySelector('.bg-blue-100');
      expect(iconContainer).toBeInTheDocument();
    });

    it('icon has correct color when not selected', () => {
      render(<PurposeStep {...defaultProps} currentPurpose="how-to-use" />);
      const unselectedCard = screen.getByText('How to Clean').closest('button');
      const iconContainer = unselectedCard?.querySelector('.bg-gray-100');
      expect(iconContainer).toBeInTheDocument();
    });
  });
});
