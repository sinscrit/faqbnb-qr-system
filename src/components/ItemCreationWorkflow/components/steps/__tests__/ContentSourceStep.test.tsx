/**
 * ContentSourceStep Component Tests
 *
 * @module ItemCreationWorkflow/components/steps/__tests__/ContentSourceStep.test
 * @lastModified 2026-01-05
 */

import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContentSourceStep } from '../ContentSourceStep';

describe('ContentSourceStep', () => {
  const defaultProps = {
    currentContentSource: null as 'existing' | 'create-new' | null,
    onSelectContentSource: jest.fn(),
    onNext: jest.fn(),
    canNext: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===========================================================================
  // Task 8: Rendering Tests
  // ===========================================================================

  describe('Rendering', () => {
    it('renders both content source options', () => {
      render(<ContentSourceStep {...defaultProps} />);

      expect(screen.getByText('I have content')).toBeInTheDocument();
      expect(screen.getByText('Create now')).toBeInTheDocument();
    });

    it('displays description for each option', () => {
      render(<ContentSourceStep {...defaultProps} />);

      expect(screen.getByText(/Upload existing videos, photos, PDFs/i)).toBeInTheDocument();
      expect(screen.getByText(/Record videos, take photos/i)).toBeInTheDocument();
    });

    it('displays content type examples for each option', () => {
      render(<ContentSourceStep {...defaultProps} />);

      // Existing option examples
      expect(screen.getByText('Upload Video')).toBeInTheDocument();
      expect(screen.getByText('Upload Photo')).toBeInTheDocument();
      expect(screen.getByText('Upload PDF')).toBeInTheDocument();
      expect(screen.getByText('Paste Text')).toBeInTheDocument();
      expect(screen.getByText('Paste URL')).toBeInTheDocument();

      // Create new option examples
      expect(screen.getByText('Record Video')).toBeInTheDocument();
      expect(screen.getByText('Take Photo')).toBeInTheDocument();
      expect(screen.getByText('Write Text')).toBeInTheDocument();
    });

    it('renders step header with correct text', () => {
      render(<ContentSourceStep {...defaultProps} />);

      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('How would you like to add content?');
    });

    it('renders step description', () => {
      render(<ContentSourceStep {...defaultProps} />);

      expect(screen.getByText(/Choose whether to upload existing materials or create new content/i)).toBeInTheDocument();
    });

    it('renders Continue button', () => {
      render(<ContentSourceStep {...defaultProps} />);

      expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
    });

    it('renders two radio options', () => {
      render(<ContentSourceStep {...defaultProps} />);

      const radios = screen.getAllByRole('radio');
      expect(radios).toHaveLength(2);
    });
  });

  // ===========================================================================
  // Task 9: Selection Tests
  // ===========================================================================

  describe('Selection', () => {
    it('calls onSelectContentSource with existing when I have content is clicked', () => {
      render(<ContentSourceStep {...defaultProps} />);

      fireEvent.click(screen.getByText('I have content'));

      expect(defaultProps.onSelectContentSource).toHaveBeenCalledWith('existing');
      expect(defaultProps.onSelectContentSource).toHaveBeenCalledTimes(1);
    });

    it('calls onSelectContentSource with create-new when Create now is clicked', () => {
      render(<ContentSourceStep {...defaultProps} />);

      fireEvent.click(screen.getByText('Create now'));

      expect(defaultProps.onSelectContentSource).toHaveBeenCalledWith('create-new');
      expect(defaultProps.onSelectContentSource).toHaveBeenCalledTimes(1);
    });

    it('shows selected styling when existing option is selected', () => {
      render(<ContentSourceStep {...defaultProps} currentContentSource="existing" />);

      const selectedCard = screen.getByRole('radio', { checked: true });
      expect(selectedCard).toHaveClass('border-blue-500');
      expect(selectedCard).toHaveClass('bg-blue-50');
    });

    it('shows selected styling when create-new option is selected', () => {
      render(<ContentSourceStep {...defaultProps} currentContentSource="create-new" />);

      const selectedCard = screen.getByRole('radio', { checked: true });
      expect(selectedCard).toHaveClass('border-blue-500');
      expect(selectedCard).toHaveClass('bg-blue-50');
    });

    it('displays checkmark on selected option', () => {
      render(<ContentSourceStep {...defaultProps} currentContentSource="create-new" />);

      // The checkmark should be inside the selected card
      const selectedCard = screen.getByRole('radio', { checked: true });
      // Check icon exists via aria-hidden
      expect(selectedCard.querySelector('svg[aria-hidden="true"]')).not.toBeNull();
    });

    it('shows unselected state for non-selected option', () => {
      render(<ContentSourceStep {...defaultProps} currentContentSource="existing" />);

      const unselectedCard = screen.getByRole('radio', { checked: false });
      expect(unselectedCard).toHaveClass('border-gray-200');
      expect(unselectedCard).toHaveClass('bg-white');
    });

    it('example chips have selected styling when parent card is selected', () => {
      render(<ContentSourceStep {...defaultProps} currentContentSource="existing" />);

      const uploadVideoChip = screen.getByText('Upload Video');
      expect(uploadVideoChip).toHaveClass('bg-blue-100');
      expect(uploadVideoChip).toHaveClass('text-blue-700');
    });

    it('example chips have unselected styling when parent card is not selected', () => {
      render(<ContentSourceStep {...defaultProps} currentContentSource="create-new" />);

      const uploadVideoChip = screen.getByText('Upload Video');
      expect(uploadVideoChip).toHaveClass('bg-gray-100');
      expect(uploadVideoChip).toHaveClass('text-gray-600');
    });
  });

  // ===========================================================================
  // Task 10: Navigation Tests
  // ===========================================================================

  describe('Navigation', () => {
    it('enables Continue button when canNext is true', () => {
      render(<ContentSourceStep {...defaultProps} canNext={true} />);

      const button = screen.getByRole('button', { name: /continue/i });
      expect(button).not.toBeDisabled();
    });

    it('disables Continue button when canNext is false', () => {
      render(<ContentSourceStep {...defaultProps} canNext={false} />);

      const button = screen.getByRole('button', { name: /continue/i });
      expect(button).toBeDisabled();
    });

    it('calls onNext when Continue is clicked and canNext is true', async () => {
      const user = userEvent.setup();
      render(<ContentSourceStep {...defaultProps} canNext={true} />);

      await user.click(screen.getByRole('button', { name: /continue/i }));

      expect(defaultProps.onNext).toHaveBeenCalledTimes(1);
    });

    it('does not call onNext when Continue is clicked and canNext is false', () => {
      render(<ContentSourceStep {...defaultProps} canNext={false} />);

      fireEvent.click(screen.getByRole('button', { name: /continue/i }));

      expect(defaultProps.onNext).not.toHaveBeenCalled();
    });

    it('Continue button has disabled styling when canNext is false', () => {
      render(<ContentSourceStep {...defaultProps} canNext={false} />);

      const button = screen.getByRole('button', { name: /continue/i });
      expect(button).toHaveClass('bg-gray-200');
      expect(button).toHaveClass('cursor-not-allowed');
    });

    it('Continue button has enabled styling when canNext is true', () => {
      render(<ContentSourceStep {...defaultProps} canNext={true} currentContentSource="existing" />);

      const button = screen.getByRole('button', { name: /continue/i });
      expect(button).toHaveClass('bg-[#FF385C]');
    });

    it('Continue button has minimum touch target height', () => {
      render(<ContentSourceStep {...defaultProps} />);

      const button = screen.getByRole('button', { name: /continue/i });
      expect(button).toHaveClass('min-h-[56px]');
    });
  });

  // ===========================================================================
  // Task 11: Accessibility Tests
  // ===========================================================================

  describe('Accessibility', () => {
    it('has radiogroup role on container', () => {
      render(<ContentSourceStep {...defaultProps} />);

      expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    });

    it('has aria-label on radiogroup', () => {
      render(<ContentSourceStep {...defaultProps} />);

      expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-label', 'Select content source');
    });

    it('renders cards with radio role', () => {
      render(<ContentSourceStep {...defaultProps} />);

      const radios = screen.getAllByRole('radio');
      expect(radios).toHaveLength(2);
    });

    it('supports keyboard selection with Enter key', async () => {
      const user = userEvent.setup();
      render(<ContentSourceStep {...defaultProps} />);

      const card = screen.getByText('I have content').closest('button');
      card?.focus();
      await user.keyboard('{Enter}');

      expect(defaultProps.onSelectContentSource).toHaveBeenCalledWith('existing');
    });

    it('supports keyboard selection with Space key', async () => {
      const user = userEvent.setup();
      render(<ContentSourceStep {...defaultProps} />);

      const card = screen.getByText('Create now').closest('button');
      card?.focus();
      await user.keyboard(' ');

      expect(defaultProps.onSelectContentSource).toHaveBeenCalledWith('create-new');
    });

    it('updates aria-checked when selection changes', () => {
      const { rerender } = render(<ContentSourceStep {...defaultProps} />);

      const radios = screen.getAllByRole('radio');
      expect(radios[0]).toHaveAttribute('aria-checked', 'false');
      expect(radios[1]).toHaveAttribute('aria-checked', 'false');

      rerender(<ContentSourceStep {...defaultProps} currentContentSource="existing" />);
      expect(radios[0]).toHaveAttribute('aria-checked', 'true');
      expect(radios[1]).toHaveAttribute('aria-checked', 'false');
    });

    it('Continue button has aria-disabled when disabled', () => {
      render(<ContentSourceStep {...defaultProps} currentContentSource={null} canNext={false} />);

      const button = screen.getByRole('button', { name: /continue/i });
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });

    it('cards are focusable and have correct focus styling classes', () => {
      render(<ContentSourceStep {...defaultProps} />);

      const radios = screen.getAllByRole('radio');
      radios.forEach((radio) => {
        expect(radio).toHaveClass('focus:outline-none');
        expect(radio).toHaveClass('focus-visible:ring-2');
        expect(radio).toHaveClass('focus-visible:ring-blue-500');
      });
    });
  });

  // ===========================================================================
  // Additional Edge Case Tests
  // ===========================================================================

  describe('Edge Cases', () => {
    it('applies custom className', () => {
      render(<ContentSourceStep {...defaultProps} className="custom-test-class" />);

      const container = screen
        .getByRole('heading', { name: /how would you like to add content/i })
        .closest('div[class*="flex-col"]');
      expect(container).toHaveClass('custom-test-class');
    });

    it('renders with pre-selected content source if provided', () => {
      render(<ContentSourceStep {...defaultProps} currentContentSource="create-new" />);

      const createNowButton = screen.getByText('Create now').closest('button');
      expect(createNowButton).toHaveAttribute('aria-checked', 'true');
    });

    it('displays all content sources in vertical layout', () => {
      render(<ContentSourceStep {...defaultProps} />);

      const radiogroup = screen.getByRole('radiogroup');
      expect(radiogroup).toHaveClass('flex', 'flex-col', 'gap-4');
    });

    it('each card has proper touch optimization classes', () => {
      render(<ContentSourceStep {...defaultProps} />);

      const radios = screen.getAllByRole('radio');
      radios.forEach((radio) => {
        expect(radio).toHaveClass('touch-manipulation');
        expect(radio).toHaveClass('select-none');
      });
    });

    it('each card has transition classes', () => {
      render(<ContentSourceStep {...defaultProps} />);

      const radios = screen.getAllByRole('radio');
      radios.forEach((radio) => {
        expect(radio).toHaveClass('transition-all');
        expect(radio).toHaveClass('duration-200');
      });
    });
  });
});
