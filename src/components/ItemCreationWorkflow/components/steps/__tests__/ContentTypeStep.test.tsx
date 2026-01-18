/**
 * ContentTypeStep Component Tests
 *
 * Updated for REQ-162: Unified content options consolidation.
 * Tests all 5 content options, subtitle rendering, selection handling,
 * and keyboard navigation.
 *
 * @module ItemCreationWorkflow/components/steps/__tests__/ContentTypeStep.test
 * @lastModified 2026-01-10 (REQ-162 Consolidate Content Options)
 */

import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContentTypeStep } from '../ContentTypeStep';
import { UNIFIED_CONTENT_OPTIONS } from '../../../utils/constants';

describe('ContentTypeStep', () => {
  const defaultProps = {
    currentSelection: null,
    onSelectContent: vi.fn(),
    onNext: vi.fn(),
    canNext: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    cleanup();
  });

  // ===========================================================================
  // Rendering Tests - All 5 Unified Options
  // ===========================================================================

  describe('Rendering unified content options', () => {
    it('renders all 5 unified content options', () => {
      render(<ContentTypeStep {...defaultProps} />);

      expect(screen.getByText('Record Video')).toBeInTheDocument();
      expect(screen.getByText('Take Photo')).toBeInTheDocument();
      expect(screen.getByText('Write Text')).toBeInTheDocument();
      expect(screen.getByText('Upload File')).toBeInTheDocument();
      expect(screen.getByText('Add Link')).toBeInTheDocument();
    });

    it('renders exactly 5 radio buttons', () => {
      render(<ContentTypeStep {...defaultProps} />);

      const radioButtons = screen.getAllByRole('radio');
      expect(radioButtons).toHaveLength(5);
    });

    it('renders correct header for unified options', () => {
      render(<ContentTypeStep {...defaultProps} />);

      expect(screen.getByRole('heading')).toHaveTextContent(
        'What content would you like to add?'
      );
    });

    it('renders correct description for unified options', () => {
      render(<ContentTypeStep {...defaultProps} />);

      expect(screen.getByText('Choose how you want to add information for this item')).toBeInTheDocument();
    });

    it('renders Continue button', () => {
      render(<ContentTypeStep {...defaultProps} />);

      expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Subtitle Rendering Tests
  // ===========================================================================

  describe('Subtitle rendering', () => {
    it('displays subtitle for Upload File option', () => {
      render(<ContentTypeStep {...defaultProps} />);

      expect(screen.getByText('Video, Image, PDF, Text')).toBeInTheDocument();
    });

    it('does not render subtitles for options without them', () => {
      render(<ContentTypeStep {...defaultProps} />);

      // Record Video, Take Photo, Write Text, Add Link should not have subtitles
      const recordVideoCard = screen.getByText('Record Video').closest('button');
      const takePhotoCard = screen.getByText('Take Photo').closest('button');
      const writeTextCard = screen.getByText('Write Text').closest('button');
      const addLinkCard = screen.getByText('Add Link').closest('button');

      // Check that these cards don't have the subtitle text element (the subtitle container would have text-xs class)
      expect(recordVideoCard?.querySelectorAll('.text-xs, .sm\\:text-sm').length).toBeLessThanOrEqual(1);
      expect(takePhotoCard?.querySelectorAll('.text-xs, .sm\\:text-sm').length).toBeLessThanOrEqual(1);
      expect(writeTextCard?.querySelectorAll('.text-xs, .sm\\:text-sm').length).toBeLessThanOrEqual(1);
      expect(addLinkCard?.querySelectorAll('.text-xs, .sm\\:text-sm').length).toBeLessThanOrEqual(1);
    });
  });

  // ===========================================================================
  // Selection Tests
  // ===========================================================================

  describe('Selection', () => {
    it.each([
      ['Record Video', 'video', 'create-new'],
      ['Take Photo', 'photo', 'create-new'],
      ['Write Text', 'text', 'create-new'],
      ['Upload File', 'file-upload', 'existing'],
      ['Add Link', 'url', 'existing'],
    ])('selecting %s calls onSelectContent with (%s, %s)', async (label, contentType, contentSource) => {
      const mockSelect = vi.fn();
      render(<ContentTypeStep {...defaultProps} onSelectContent={mockSelect} />);

      fireEvent.click(screen.getByText(label));

      expect(mockSelect).toHaveBeenCalledWith(contentType, contentSource);
    });

    it('shows selected styling when option is selected', () => {
      render(
        <ContentTypeStep {...defaultProps} currentSelection="record-video" />
      );

      const selectedCard = screen.getByRole('radio', { checked: true });
      expect(selectedCard).toHaveClass('border-blue-500');
      expect(selectedCard).toHaveClass('bg-blue-50');
    });

    it('shows aria-checked true for selected option', () => {
      render(
        <ContentTypeStep {...defaultProps} currentSelection="upload-file" />
      );

      const uploadFileCard = screen.getByText('Upload File').closest('button');
      expect(uploadFileCard).toHaveAttribute('aria-checked', 'true');
    });

    it('displays checkmark on selected option', () => {
      render(<ContentTypeStep {...defaultProps} currentSelection="record-video" />);

      const selectedCard = screen.getByRole('radio', { checked: true });
      // Check icon exists via aria-hidden
      expect(selectedCard.querySelector('svg[aria-hidden="true"]')).not.toBeNull();
    });

    it('shows unselected state for non-selected options', () => {
      render(<ContentTypeStep {...defaultProps} currentSelection="record-video" />);

      const unselectedCards = screen.getAllByRole('radio', { checked: false });
      unselectedCards.forEach((card) => {
        expect(card).toHaveClass('border-gray-200');
        expect(card).toHaveClass('bg-white');
      });
    });

    it('auto-advances after selection', async () => {
      const mockNext = vi.fn();
      render(<ContentTypeStep {...defaultProps} onNext={mockNext} />);

      fireEvent.click(screen.getByText('Record Video'));

      // Advance timers to trigger auto-advance
      vi.advanceTimersByTime(200);

      expect(mockNext).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // Navigation Tests
  // ===========================================================================

  describe('Navigation', () => {
    it('enables Continue button when canNext is true', () => {
      render(<ContentTypeStep {...defaultProps} canNext={true} />);

      const button = screen.getByRole('button', { name: /continue/i });
      expect(button).not.toBeDisabled();
    });

    it('disables Continue button when canNext is false', () => {
      render(<ContentTypeStep {...defaultProps} canNext={false} />);

      const button = screen.getByRole('button', { name: /continue/i });
      expect(button).toBeDisabled();
    });

    it('calls onNext when Continue is clicked and canNext is true', async () => {
      vi.useRealTimers();
      const user = userEvent.setup();
      const mockOnNext = vi.fn();
      render(<ContentTypeStep {...defaultProps} canNext={true} onNext={mockOnNext} />);

      await user.click(screen.getByRole('button', { name: /continue/i }));

      expect(mockOnNext).toHaveBeenCalledTimes(1);
    });

    it('does not call onNext when Continue is clicked and canNext is false', () => {
      render(<ContentTypeStep {...defaultProps} canNext={false} />);

      fireEvent.click(screen.getByRole('button', { name: /continue/i }));

      expect(defaultProps.onNext).not.toHaveBeenCalled();
    });

    it('Continue button has disabled styling when canNext is false', () => {
      render(<ContentTypeStep {...defaultProps} canNext={false} />);

      const button = screen.getByRole('button', { name: /continue/i });
      expect(button).toHaveClass('bg-gray-200');
      expect(button).toHaveClass('cursor-not-allowed');
    });

    it('Continue button has enabled styling when canNext is true', () => {
      render(<ContentTypeStep {...defaultProps} canNext={true} currentSelection="record-video" />);

      const button = screen.getByRole('button', { name: /continue/i });
      expect(button).toHaveClass('bg-[#FF385C]');
    });

    it('Continue button has minimum touch target height', () => {
      render(<ContentTypeStep {...defaultProps} />);

      const button = screen.getByRole('button', { name: /continue/i });
      expect(button).toHaveClass('min-h-[56px]');
    });
  });

  // ===========================================================================
  // Accessibility Tests
  // ===========================================================================

  describe('Accessibility', () => {
    it('has radiogroup role on container', () => {
      render(<ContentTypeStep {...defaultProps} />);

      expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    });

    it('has aria-label on radiogroup', () => {
      render(<ContentTypeStep {...defaultProps} />);

      expect(screen.getByRole('radiogroup')).toHaveAttribute(
        'aria-label',
        'Select content type'
      );
    });

    it('supports keyboard selection with Enter key', async () => {
      vi.useRealTimers();
      const user = userEvent.setup();
      const mockSelect = vi.fn();
      render(<ContentTypeStep {...defaultProps} onSelectContent={mockSelect} />);

      const card = screen.getByText('Record Video').closest('button');
      card?.focus();
      await user.keyboard('{Enter}');

      expect(mockSelect).toHaveBeenCalledWith('video', 'create-new');
    });

    it('supports keyboard selection with Space key', async () => {
      vi.useRealTimers();
      const user = userEvent.setup();
      const mockSelect = vi.fn();
      render(<ContentTypeStep {...defaultProps} onSelectContent={mockSelect} />);

      const card = screen.getByText('Write Text').closest('button');
      card?.focus();
      await user.keyboard(' ');

      expect(mockSelect).toHaveBeenCalledWith('text', 'create-new');
    });

    it('each card has correct aria-checked state', () => {
      render(
        <ContentTypeStep {...defaultProps} currentSelection="upload-file" />
      );

      const uploadFileCard = screen.getByText('Upload File').closest('button');
      const recordVideoCard = screen.getByText('Record Video').closest('button');

      expect(uploadFileCard).toHaveAttribute('aria-checked', 'true');
      expect(recordVideoCard).toHaveAttribute('aria-checked', 'false');
    });

    it('has proper focus styling classes', () => {
      render(<ContentTypeStep {...defaultProps} />);

      const cards = screen.getAllByRole('radio');
      cards.forEach((card) => {
        expect(card).toHaveClass('focus-visible:ring-2');
        expect(card).toHaveClass('focus-visible:ring-blue-500');
      });
    });

    it('Continue button has aria-disabled when disabled', () => {
      render(<ContentTypeStep {...defaultProps} canNext={false} />);

      const button = screen.getByRole('button', { name: /continue/i });
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });

    it('cards are focusable and have correct focus classes', () => {
      render(<ContentTypeStep {...defaultProps} />);

      const radios = screen.getAllByRole('radio');
      radios.forEach((radio) => {
        expect(radio).toHaveClass('focus:outline-none');
        expect(radio).toHaveClass('focus-visible:ring-2');
        expect(radio).toHaveClass('focus-visible:ring-offset-2');
      });
    });

    it('has screen reader help text', () => {
      render(<ContentTypeStep {...defaultProps} />);

      expect(screen.getByText('Use arrow keys to navigate. Press Enter or Space to select.')).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Edge Cases and Additional Tests
  // ===========================================================================

  describe('Edge Cases', () => {
    it('applies custom className', () => {
      render(<ContentTypeStep {...defaultProps} className="custom-test-class" />);

      const container = screen
        .getByRole('heading', { name: /what content would you like to add/i })
        .closest('div[class*="flex-col"]');
      expect(container).toHaveClass('custom-test-class');
    });

    it('displays grid layout for cards', () => {
      render(<ContentTypeStep {...defaultProps} />);

      const radiogroup = screen.getByRole('radiogroup');
      expect(radiogroup).toHaveClass('grid');
      expect(radiogroup).toHaveClass('grid-cols-1');
      expect(radiogroup).toHaveClass('sm:grid-cols-2');
    });

    it('each card has proper touch optimization classes', () => {
      render(<ContentTypeStep {...defaultProps} />);

      const radios = screen.getAllByRole('radio');
      radios.forEach((radio) => {
        expect(radio).toHaveClass('touch-manipulation');
        expect(radio).toHaveClass('select-none');
      });
    });

    it('each card has transition classes', () => {
      render(<ContentTypeStep {...defaultProps} />);

      const radios = screen.getAllByRole('radio');
      radios.forEach((radio) => {
        expect(radio).toHaveClass('transition-all');
        expect(radio).toHaveClass('duration-200');
      });
    });

    it('matches UNIFIED_CONTENT_OPTIONS from constants', () => {
      render(<ContentTypeStep {...defaultProps} />);

      // Verify all options from constants are rendered
      UNIFIED_CONTENT_OPTIONS.forEach((option) => {
        expect(screen.getByText(option.label)).toBeInTheDocument();
      });
    });

    it('options are in correct order matching constants', () => {
      render(<ContentTypeStep {...defaultProps} />);

      const radios = screen.getAllByRole('radio');
      const labels = radios.map((radio) => {
        const labelEl = radio.querySelector('.text-base, .sm\\:text-lg');
        return labelEl?.textContent;
      });

      const expectedOrder = UNIFIED_CONTENT_OPTIONS.map((opt) => opt.label);
      expect(labels).toEqual(expectedOrder);
    });
  });
});
