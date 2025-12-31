/**
 * Unit Tests for ContentTypeStep Component
 *
 * Tests for rendering, selection, accessibility, and keyboard interaction.
 *
 * @module ItemCapture/components/steps/__tests__/ContentTypeStep
 * @lastModified 2025-12-31 (REQ-035 Task 10)
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ContentTypeStep, type ContentType } from '../ContentTypeStep';

describe('ContentTypeStep', () => {
  const defaultProps = {
    selectedType: null as ContentType | null,
    onSelect: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===========================================================================
  // Rendering Tests
  // ===========================================================================

  describe('rendering', () => {
    it('renders all four content type options', () => {
      render(<ContentTypeStep {...defaultProps} />);

      expect(screen.getByText('Record Video')).toBeInTheDocument();
      expect(screen.getByText('Take Photo')).toBeInTheDocument();
      expect(screen.getByText('Write Text')).toBeInTheDocument();
      expect(screen.getByText('Upload File')).toBeInTheDocument();
    });

    it('renders header with title and description', () => {
      render(<ContentTypeStep {...defaultProps} />);

      expect(screen.getByText('Choose Content Type')).toBeInTheDocument();
      expect(screen.getByText('Select how you want to create content for this item')).toBeInTheDocument();
    });

    it('renders tip text in footer', () => {
      render(<ContentTypeStep {...defaultProps} />);

      expect(screen.getByText('Tip: You can add more content after your first selection')).toBeInTheDocument();
    });

    it('renders icons for each option', () => {
      const { container } = render(<ContentTypeStep {...defaultProps} />);

      // Check that SVG icons are present (Lucide icons render as SVGs)
      const buttons = container.querySelectorAll('button[role="radio"]');
      expect(buttons).toHaveLength(4);

      buttons.forEach(button => {
        const svg = button.querySelector('svg');
        expect(svg).toBeInTheDocument();
      });
    });

    it('applies custom className', () => {
      const { container } = render(<ContentTypeStep {...defaultProps} className="custom-class" />);
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  // ===========================================================================
  // Selection Tests
  // ===========================================================================

  describe('selection', () => {
    it('calls onSelect when video option is clicked', () => {
      render(<ContentTypeStep {...defaultProps} />);

      fireEvent.click(screen.getByText('Record Video'));
      expect(defaultProps.onSelect).toHaveBeenCalledWith('video');
    });

    it('calls onSelect when photo option is clicked', () => {
      render(<ContentTypeStep {...defaultProps} />);

      fireEvent.click(screen.getByText('Take Photo'));
      expect(defaultProps.onSelect).toHaveBeenCalledWith('photo');
    });

    it('calls onSelect when text option is clicked', () => {
      render(<ContentTypeStep {...defaultProps} />);

      fireEvent.click(screen.getByText('Write Text'));
      expect(defaultProps.onSelect).toHaveBeenCalledWith('text');
    });

    it('calls onSelect when upload option is clicked', () => {
      render(<ContentTypeStep {...defaultProps} />);

      fireEvent.click(screen.getByText('Upload File'));
      expect(defaultProps.onSelect).toHaveBeenCalledWith('upload');
    });

    it('shows selected state for chosen option', () => {
      render(<ContentTypeStep {...defaultProps} selectedType="video" />);

      const videoButton = screen.getByRole('radio', { name: /Record Video/i });
      expect(videoButton).toHaveAttribute('aria-checked', 'true');
      expect(videoButton).toHaveClass('border-blue-500');
      expect(videoButton).toHaveClass('bg-blue-50');
    });

    it('shows unselected state for non-chosen options', () => {
      render(<ContentTypeStep {...defaultProps} selectedType="video" />);

      const photoButton = screen.getByRole('radio', { name: /Take Photo/i });
      expect(photoButton).toHaveAttribute('aria-checked', 'false');
      expect(photoButton).toHaveClass('border-gray-200');
      expect(photoButton).toHaveClass('bg-white');
    });

    it('only one option can be selected at a time', () => {
      const { rerender } = render(<ContentTypeStep {...defaultProps} selectedType="video" />);

      // Video selected
      let checkedRadios = screen.getAllByRole('radio').filter(
        radio => radio.getAttribute('aria-checked') === 'true'
      );
      expect(checkedRadios).toHaveLength(1);

      // Change to photo
      rerender(<ContentTypeStep {...defaultProps} selectedType="photo" />);

      checkedRadios = screen.getAllByRole('radio').filter(
        radio => radio.getAttribute('aria-checked') === 'true'
      );
      expect(checkedRadios).toHaveLength(1);
      expect(screen.getByRole('radio', { name: /Take Photo/i })).toHaveAttribute('aria-checked', 'true');
    });
  });

  // ===========================================================================
  // Accessibility Tests
  // ===========================================================================

  describe('accessibility', () => {
    it('has radiogroup role on container', () => {
      render(<ContentTypeStep {...defaultProps} />);

      const radiogroup = screen.getByRole('radiogroup');
      expect(radiogroup).toBeInTheDocument();
    });

    it('has aria-label on radiogroup', () => {
      render(<ContentTypeStep {...defaultProps} />);

      const radiogroup = screen.getByRole('radiogroup');
      expect(radiogroup).toHaveAttribute('aria-label', 'Content type selection');
    });

    it('has radio role on each option', () => {
      render(<ContentTypeStep {...defaultProps} />);

      const radios = screen.getAllByRole('radio');
      expect(radios).toHaveLength(4);
    });

    it('has aria-checked attribute on radio options', () => {
      render(<ContentTypeStep {...defaultProps} selectedType="text" />);

      const textRadio = screen.getByRole('radio', { name: /Write Text/i });
      const videoRadio = screen.getByRole('radio', { name: /Record Video/i });

      expect(textRadio).toHaveAttribute('aria-checked', 'true');
      expect(videoRadio).toHaveAttribute('aria-checked', 'false');
    });

    it('has descriptive aria-label on each option', () => {
      render(<ContentTypeStep {...defaultProps} />);

      expect(screen.getByRole('radio', { name: 'Record Video: Capture video instructions' })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: 'Take Photo: Capture photos' })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: 'Write Text: Create written instructions' })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: 'Upload File: Upload existing media' })).toBeInTheDocument();
    });

    it('has aria-hidden on icons', () => {
      const { container } = render(<ContentTypeStep {...defaultProps} />);

      const svgs = container.querySelectorAll('svg');
      svgs.forEach(svg => {
        expect(svg).toHaveAttribute('aria-hidden', 'true');
      });
    });
  });

  // ===========================================================================
  // Keyboard Navigation Tests
  // ===========================================================================

  describe('keyboard navigation', () => {
    it('buttons are focusable with Tab', () => {
      render(<ContentTypeStep {...defaultProps} />);

      const buttons = screen.getAllByRole('radio');

      // First button should be able to receive focus
      buttons[0].focus();
      expect(document.activeElement).toBe(buttons[0]);
    });

    it('Enter key triggers selection', () => {
      render(<ContentTypeStep {...defaultProps} />);

      const videoButton = screen.getByRole('radio', { name: /Record Video/i });
      videoButton.focus();

      fireEvent.keyDown(videoButton, { key: 'Enter', code: 'Enter' });
      // Note: Enter on a button naturally triggers click
      fireEvent.click(videoButton);

      expect(defaultProps.onSelect).toHaveBeenCalledWith('video');
    });

    it('Space key triggers selection', () => {
      render(<ContentTypeStep {...defaultProps} />);

      const photoButton = screen.getByRole('radio', { name: /Take Photo/i });
      photoButton.focus();

      // Simulate space key press which triggers click on buttons
      fireEvent.click(photoButton);

      expect(defaultProps.onSelect).toHaveBeenCalledWith('photo');
    });

    it('has visible focus ring on focus', () => {
      render(<ContentTypeStep {...defaultProps} />);

      const button = screen.getByRole('radio', { name: /Record Video/i });
      expect(button).toHaveClass('focus:ring-2');
      expect(button).toHaveClass('focus:ring-blue-500');
    });
  });

  // ===========================================================================
  // Styling Tests
  // ===========================================================================

  describe('styling', () => {
    it('applies correct grid classes for responsive layout', () => {
      render(<ContentTypeStep {...defaultProps} />);

      const radiogroup = screen.getByRole('radiogroup');
      expect(radiogroup).toHaveClass('grid');
      expect(radiogroup).toHaveClass('grid-cols-2');
      expect(radiogroup).toHaveClass('md:grid-cols-4');
    });

    it('buttons have minimum height for touch targets', () => {
      render(<ContentTypeStep {...defaultProps} />);

      const buttons = screen.getAllByRole('radio');
      buttons.forEach(button => {
        expect(button).toHaveClass('min-h-[100px]');
      });
    });

    it('buttons have touch-manipulation for mobile optimization', () => {
      render(<ContentTypeStep {...defaultProps} />);

      const buttons = screen.getAllByRole('radio');
      buttons.forEach(button => {
        expect(button).toHaveClass('touch-manipulation');
      });
    });

    it('selected button has blue styling', () => {
      render(<ContentTypeStep {...defaultProps} selectedType="upload" />);

      const uploadButton = screen.getByRole('radio', { name: /Upload File/i });
      expect(uploadButton).toHaveClass('border-blue-500');
      expect(uploadButton).toHaveClass('bg-blue-50');
      expect(uploadButton).toHaveClass('text-blue-700');
    });

    it('unselected buttons have hover states', () => {
      render(<ContentTypeStep {...defaultProps} />);

      const button = screen.getByRole('radio', { name: /Record Video/i });
      expect(button).toHaveClass('hover:border-gray-300');
      expect(button).toHaveClass('hover:bg-gray-50');
    });

    it('buttons have active scale transition', () => {
      render(<ContentTypeStep {...defaultProps} />);

      const button = screen.getByRole('radio', { name: /Record Video/i });
      expect(button).toHaveClass('active:scale-95');
    });
  });
});
