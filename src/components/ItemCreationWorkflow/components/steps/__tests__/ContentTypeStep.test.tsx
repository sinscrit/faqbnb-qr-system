/**
 * ContentTypeStep Component Tests
 *
 * @module ItemCreationWorkflow/components/steps/__tests__/ContentTypeStep.test
 * @lastModified 2026-01-05
 */

import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContentTypeStep } from '../ContentTypeStep';

describe('ContentTypeStep', () => {
  const defaultPropsExisting = {
    currentContentSource: 'existing' as const,
    currentContentType: null,
    onSelectContentType: jest.fn(),
    onNext: jest.fn(),
    canNext: false,
  };

  const defaultPropsCreateNew = {
    currentContentSource: 'create-new' as const,
    currentContentType: null,
    onSelectContentType: jest.fn(),
    onNext: jest.fn(),
    canNext: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===========================================================================
  // Task 6: Rendering Tests - Existing Content Source
  // ===========================================================================

  describe('Rendering for existing content source', () => {
    it('renders exactly five content type options', () => {
      render(<ContentTypeStep {...defaultPropsExisting} />);

      const radioButtons = screen.getAllByRole('radio');
      expect(radioButtons).toHaveLength(5);
    });

    it('displays correct labels for existing content', () => {
      render(<ContentTypeStep {...defaultPropsExisting} />);

      expect(screen.getByText('Upload Video')).toBeInTheDocument();
      expect(screen.getByText('Upload Photo')).toBeInTheDocument();
      expect(screen.getByText('Upload PDF')).toBeInTheDocument();
      expect(screen.getByText('Paste Text')).toBeInTheDocument();
      expect(screen.getByText('Paste URL')).toBeInTheDocument();
    });

    it('renders correct header for upload context', () => {
      render(<ContentTypeStep {...defaultPropsExisting} />);

      expect(screen.getByRole('heading')).toHaveTextContent(
        'What type of content will you upload?'
      );
    });

    it('renders correct description for existing content', () => {
      render(<ContentTypeStep {...defaultPropsExisting} />);

      expect(screen.getByText('Select the format of your existing content')).toBeInTheDocument();
    });

    it('renders Continue button', () => {
      render(<ContentTypeStep {...defaultPropsExisting} />);

      expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Rendering Tests - Create New Content Source
  // ===========================================================================

  describe('Rendering for create-new content source', () => {
    it('renders exactly three content type options', () => {
      render(<ContentTypeStep {...defaultPropsCreateNew} />);

      const radioButtons = screen.getAllByRole('radio');
      expect(radioButtons).toHaveLength(3);
    });

    it('displays correct labels for create-new content', () => {
      render(<ContentTypeStep {...defaultPropsCreateNew} />);

      expect(screen.getByText('Record Video')).toBeInTheDocument();
      expect(screen.getByText('Take Photo')).toBeInTheDocument();
      expect(screen.getByText('Write Text')).toBeInTheDocument();
    });

    it('renders correct header for creation context', () => {
      render(<ContentTypeStep {...defaultPropsCreateNew} />);

      expect(screen.getByRole('heading')).toHaveTextContent(
        'What type of content will you create?'
      );
    });

    it('renders correct description for create-new content', () => {
      render(<ContentTypeStep {...defaultPropsCreateNew} />);

      expect(screen.getByText('Choose how you want to capture this item')).toBeInTheDocument();
    });

    it('does not show upload-only options', () => {
      render(<ContentTypeStep {...defaultPropsCreateNew} />);

      expect(screen.queryByText('Upload PDF')).not.toBeInTheDocument();
      expect(screen.queryByText('Paste URL')).not.toBeInTheDocument();
      expect(screen.queryByText('Upload Video')).not.toBeInTheDocument();
      expect(screen.queryByText('Upload Photo')).not.toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Task 7: Selection Tests
  // ===========================================================================

  describe('Selection', () => {
    it('calls onSelectContentType with video when Upload Video is clicked', () => {
      render(<ContentTypeStep {...defaultPropsExisting} />);

      fireEvent.click(screen.getByText('Upload Video'));

      expect(defaultPropsExisting.onSelectContentType).toHaveBeenCalledWith('video');
    });

    it('calls onSelectContentType with photo when Upload Photo is clicked', () => {
      render(<ContentTypeStep {...defaultPropsExisting} />);

      fireEvent.click(screen.getByText('Upload Photo'));

      expect(defaultPropsExisting.onSelectContentType).toHaveBeenCalledWith('photo');
    });

    it('calls onSelectContentType with pdf when Upload PDF is clicked', () => {
      render(<ContentTypeStep {...defaultPropsExisting} />);

      fireEvent.click(screen.getByText('Upload PDF'));

      expect(defaultPropsExisting.onSelectContentType).toHaveBeenCalledWith('pdf');
    });

    it('calls onSelectContentType with text when Paste Text is clicked', () => {
      render(<ContentTypeStep {...defaultPropsExisting} />);

      fireEvent.click(screen.getByText('Paste Text'));

      expect(defaultPropsExisting.onSelectContentType).toHaveBeenCalledWith('text');
    });

    it('calls onSelectContentType with url when Paste URL is clicked', () => {
      render(<ContentTypeStep {...defaultPropsExisting} />);

      fireEvent.click(screen.getByText('Paste URL'));

      expect(defaultPropsExisting.onSelectContentType).toHaveBeenCalledWith('url');
    });

    it('calls onSelectContentType with video when Record Video is clicked', () => {
      render(<ContentTypeStep {...defaultPropsCreateNew} />);

      fireEvent.click(screen.getByText('Record Video'));

      expect(defaultPropsCreateNew.onSelectContentType).toHaveBeenCalledWith('video');
    });

    it('calls onSelectContentType with photo when Take Photo is clicked', () => {
      render(<ContentTypeStep {...defaultPropsCreateNew} />);

      fireEvent.click(screen.getByText('Take Photo'));

      expect(defaultPropsCreateNew.onSelectContentType).toHaveBeenCalledWith('photo');
    });

    it('calls onSelectContentType with text when Write Text is clicked', () => {
      render(<ContentTypeStep {...defaultPropsCreateNew} />);

      fireEvent.click(screen.getByText('Write Text'));

      expect(defaultPropsCreateNew.onSelectContentType).toHaveBeenCalledWith('text');
    });

    it('shows selected styling when option is selected', () => {
      render(
        <ContentTypeStep {...defaultPropsExisting} currentContentType="video" />
      );

      const selectedCard = screen.getByRole('radio', { checked: true });
      expect(selectedCard).toHaveClass('border-blue-500');
      expect(selectedCard).toHaveClass('bg-blue-50');
    });

    it('shows aria-checked true for selected option', () => {
      render(
        <ContentTypeStep {...defaultPropsExisting} currentContentType="pdf" />
      );

      const pdfCard = screen.getByText('Upload PDF').closest('button');
      expect(pdfCard).toHaveAttribute('aria-checked', 'true');
    });

    it('displays checkmark on selected option', () => {
      render(<ContentTypeStep {...defaultPropsExisting} currentContentType="video" />);

      const selectedCard = screen.getByRole('radio', { checked: true });
      // Check icon exists via aria-hidden
      expect(selectedCard.querySelector('svg[aria-hidden="true"]')).not.toBeNull();
    });

    it('shows unselected state for non-selected options', () => {
      render(<ContentTypeStep {...defaultPropsExisting} currentContentType="video" />);

      const unselectedCards = screen.getAllByRole('radio', { checked: false });
      unselectedCards.forEach((card) => {
        expect(card).toHaveClass('border-gray-200');
        expect(card).toHaveClass('bg-white');
      });
    });
  });

  // ===========================================================================
  // Navigation Tests
  // ===========================================================================

  describe('Navigation', () => {
    it('enables Continue button when canNext is true', () => {
      render(<ContentTypeStep {...defaultPropsExisting} canNext={true} />);

      const button = screen.getByRole('button', { name: /continue/i });
      expect(button).not.toBeDisabled();
    });

    it('disables Continue button when canNext is false', () => {
      render(<ContentTypeStep {...defaultPropsExisting} canNext={false} />);

      const button = screen.getByRole('button', { name: /continue/i });
      expect(button).toBeDisabled();
    });

    it('calls onNext when Continue is clicked and canNext is true', async () => {
      const user = userEvent.setup();
      render(<ContentTypeStep {...defaultPropsExisting} canNext={true} />);

      await user.click(screen.getByRole('button', { name: /continue/i }));

      expect(defaultPropsExisting.onNext).toHaveBeenCalledTimes(1);
    });

    it('does not call onNext when Continue is clicked and canNext is false', () => {
      render(<ContentTypeStep {...defaultPropsExisting} canNext={false} />);

      fireEvent.click(screen.getByRole('button', { name: /continue/i }));

      expect(defaultPropsExisting.onNext).not.toHaveBeenCalled();
    });

    it('Continue button has disabled styling when canNext is false', () => {
      render(<ContentTypeStep {...defaultPropsExisting} canNext={false} />);

      const button = screen.getByRole('button', { name: /continue/i });
      expect(button).toHaveClass('bg-gray-200');
      expect(button).toHaveClass('cursor-not-allowed');
    });

    it('Continue button has enabled styling when canNext is true', () => {
      render(<ContentTypeStep {...defaultPropsExisting} canNext={true} currentContentType="video" />);

      const button = screen.getByRole('button', { name: /continue/i });
      expect(button).toHaveClass('bg-[#FF385C]');
    });

    it('Continue button has minimum touch target height', () => {
      render(<ContentTypeStep {...defaultPropsExisting} />);

      const button = screen.getByRole('button', { name: /continue/i });
      expect(button).toHaveClass('min-h-[56px]');
    });
  });

  // ===========================================================================
  // Task 8: Accessibility Tests
  // ===========================================================================

  describe('Accessibility', () => {
    it('has radiogroup role on container', () => {
      render(<ContentTypeStep {...defaultPropsExisting} />);

      expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    });

    it('has aria-label on radiogroup', () => {
      render(<ContentTypeStep {...defaultPropsExisting} />);

      expect(screen.getByRole('radiogroup')).toHaveAttribute(
        'aria-label',
        'Select content type'
      );
    });

    it('supports keyboard selection with Enter key', async () => {
      const user = userEvent.setup();
      render(<ContentTypeStep {...defaultPropsExisting} />);

      const card = screen.getByText('Upload Video').closest('button');
      card?.focus();
      await user.keyboard('{Enter}');

      expect(defaultPropsExisting.onSelectContentType).toHaveBeenCalledWith('video');
    });

    it('supports keyboard selection with Space key', async () => {
      const user = userEvent.setup();
      render(<ContentTypeStep {...defaultPropsCreateNew} />);

      const card = screen.getByText('Write Text').closest('button');
      card?.focus();
      await user.keyboard(' ');

      expect(defaultPropsCreateNew.onSelectContentType).toHaveBeenCalledWith('text');
    });

    it('each card has correct aria-checked state', () => {
      render(
        <ContentTypeStep {...defaultPropsExisting} currentContentType="pdf" />
      );

      const pdfCard = screen.getByText('Upload PDF').closest('button');
      const videoCard = screen.getByText('Upload Video').closest('button');

      expect(pdfCard).toHaveAttribute('aria-checked', 'true');
      expect(videoCard).toHaveAttribute('aria-checked', 'false');
    });

    it('has proper focus styling classes', () => {
      render(<ContentTypeStep {...defaultPropsExisting} />);

      const cards = screen.getAllByRole('radio');
      cards.forEach((card) => {
        expect(card).toHaveClass('focus-visible:ring-2');
        expect(card).toHaveClass('focus-visible:ring-blue-500');
      });
    });

    it('Continue button has aria-disabled when disabled', () => {
      render(<ContentTypeStep {...defaultPropsExisting} canNext={false} />);

      const button = screen.getByRole('button', { name: /continue/i });
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });

    it('cards are focusable and have correct focus classes', () => {
      render(<ContentTypeStep {...defaultPropsExisting} />);

      const radios = screen.getAllByRole('radio');
      radios.forEach((radio) => {
        expect(radio).toHaveClass('focus:outline-none');
        expect(radio).toHaveClass('focus-visible:ring-2');
        expect(radio).toHaveClass('focus-visible:ring-offset-2');
      });
    });
  });

  // ===========================================================================
  // Edge Cases and Additional Tests
  // ===========================================================================

  describe('Edge Cases', () => {
    it('applies custom className', () => {
      render(<ContentTypeStep {...defaultPropsExisting} className="custom-test-class" />);

      const container = screen
        .getByRole('heading', { name: /what type of content will you upload/i })
        .closest('div[class*="flex-col"]');
      expect(container).toHaveClass('custom-test-class');
    });

    it('renders with pre-selected content type if provided', () => {
      render(<ContentTypeStep {...defaultPropsExisting} currentContentType="photo" />);

      const photoButton = screen.getByText('Upload Photo').closest('button');
      expect(photoButton).toHaveAttribute('aria-checked', 'true');
    });

    it('displays grid layout for cards', () => {
      render(<ContentTypeStep {...defaultPropsExisting} />);

      const radiogroup = screen.getByRole('radiogroup');
      expect(radiogroup).toHaveClass('grid');
      expect(radiogroup).toHaveClass('grid-cols-1');
      expect(radiogroup).toHaveClass('sm:grid-cols-2');
    });

    it('each card has proper touch optimization classes', () => {
      render(<ContentTypeStep {...defaultPropsExisting} />);

      const radios = screen.getAllByRole('radio');
      radios.forEach((radio) => {
        expect(radio).toHaveClass('touch-manipulation');
        expect(radio).toHaveClass('select-none');
      });
    });

    it('each card has transition classes', () => {
      render(<ContentTypeStep {...defaultPropsExisting} />);

      const radios = screen.getAllByRole('radio');
      radios.forEach((radio) => {
        expect(radio).toHaveClass('transition-all');
        expect(radio).toHaveClass('duration-200');
      });
    });

    it('renders different options based on content source', () => {
      const { rerender } = render(<ContentTypeStep {...defaultPropsExisting} />);
      expect(screen.getAllByRole('radio')).toHaveLength(5);

      rerender(<ContentTypeStep {...defaultPropsCreateNew} />);
      expect(screen.getAllByRole('radio')).toHaveLength(3);
    });

    it('updates header text when content source changes', () => {
      const { rerender } = render(<ContentTypeStep {...defaultPropsExisting} />);
      expect(screen.getByRole('heading')).toHaveTextContent('What type of content will you upload?');

      rerender(<ContentTypeStep {...defaultPropsCreateNew} />);
      expect(screen.getByRole('heading')).toHaveTextContent('What type of content will you create?');
    });
  });
});
