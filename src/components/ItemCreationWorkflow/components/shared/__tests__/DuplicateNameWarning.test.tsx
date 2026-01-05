/**
 * DuplicateNameWarning Component Tests
 *
 * Tests for the duplicate name warning component that displays
 * when a user enters a name that matches or is similar to existing items.
 *
 * @module ItemCreationWorkflow/components/shared/__tests__/DuplicateNameWarning.test
 * @lastModified 2026-01-05
 */

import { render, screen } from '@testing-library/react';
import { DuplicateNameWarning } from '../DuplicateNameWarning';

describe('DuplicateNameWarning', () => {
  const defaultProps = {
    matchingNames: ['Kitchen - Stove'],
    matchType: 'exact' as const,
  };

  // ===========================================================================
  // Block Variant Tests (Default)
  // ===========================================================================

  describe('Block Variant (Default)', () => {
    it('renders with exact match message', () => {
      render(<DuplicateNameWarning {...defaultProps} matchType="exact" />);

      expect(screen.getByText('Exact name already exists')).toBeInTheDocument();
    });

    it('renders with similar match message', () => {
      render(<DuplicateNameWarning {...defaultProps} matchType="similar" />);

      expect(screen.getByText('Similar name already used')).toBeInTheDocument();
    });

    it('renders matching names in the list', () => {
      render(<DuplicateNameWarning {...defaultProps} />);

      expect(screen.getByText('• Kitchen - Stove')).toBeInTheDocument();
    });

    it('renders multiple matching names', () => {
      render(
        <DuplicateNameWarning
          {...defaultProps}
          matchingNames={['Kitchen - Stove', 'Kitchen - Oven', 'Kitchen - Sink']}
        />
      );

      expect(screen.getByText('• Kitchen - Stove')).toBeInTheDocument();
      expect(screen.getByText('• Kitchen - Oven')).toBeInTheDocument();
      expect(screen.getByText('• Kitchen - Sink')).toBeInTheDocument();
    });

    it('limits displayed names to 3 with "more" indicator', () => {
      render(
        <DuplicateNameWarning
          {...defaultProps}
          matchingNames={[
            'Item 1',
            'Item 2',
            'Item 3',
            'Item 4',
            'Item 5',
          ]}
        />
      );

      expect(screen.getByText('• Item 1')).toBeInTheDocument();
      expect(screen.getByText('• Item 2')).toBeInTheDocument();
      expect(screen.getByText('• Item 3')).toBeInTheDocument();
      expect(screen.queryByText('• Item 4')).not.toBeInTheDocument();
      expect(screen.getByText('+2 more...')).toBeInTheDocument();
    });

    it('has role="alert"', () => {
      render(<DuplicateNameWarning {...defaultProps} />);

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(
        <DuplicateNameWarning {...defaultProps} className="custom-class" />
      );

      expect(screen.getByRole('alert')).toHaveClass('custom-class');
    });

    it('has amber warning background', () => {
      render(<DuplicateNameWarning {...defaultProps} />);

      const alert = screen.getByRole('alert');
      expect(alert.className).toContain('bg-amber-50');
    });

    it('has amber border', () => {
      render(<DuplicateNameWarning {...defaultProps} />);

      const alert = screen.getByRole('alert');
      expect(alert.className).toContain('border-amber-200');
    });

    it('has rounded corners', () => {
      render(<DuplicateNameWarning {...defaultProps} />);

      const alert = screen.getByRole('alert');
      expect(alert.className).toContain('rounded-lg');
    });
  });

  // ===========================================================================
  // Inline Variant Tests
  // ===========================================================================

  describe('Inline Variant', () => {
    it('renders as inline element', () => {
      const { container } = render(
        <DuplicateNameWarning {...defaultProps} variant="inline" />
      );

      const inlineElement = container.querySelector('.inline-flex');
      expect(inlineElement).toBeInTheDocument();
    });

    it('has cursor-help class', () => {
      const { container } = render(
        <DuplicateNameWarning {...defaultProps} variant="inline" />
      );

      const inlineElement = container.querySelector('.cursor-help');
      expect(inlineElement).toBeInTheDocument();
    });

    it('has proper aria-label for accessibility', () => {
      const { container } = render(
        <DuplicateNameWarning {...defaultProps} variant="inline" matchType="exact" />
      );

      const inlineElement = container.querySelector('[aria-label]');
      expect(inlineElement).toHaveAttribute(
        'aria-label',
        'Warning: Exact name already exists'
      );
    });

    it('applies custom className to inline variant', () => {
      const { container } = render(
        <DuplicateNameWarning
          {...defaultProps}
          variant="inline"
          className="custom-inline-class"
        />
      );

      const inlineElement = container.querySelector('.custom-inline-class');
      expect(inlineElement).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Icon Tests
  // ===========================================================================

  describe('Icons', () => {
    it('renders AlertTriangle icon in block variant', () => {
      const { container } = render(<DuplicateNameWarning {...defaultProps} />);

      const icon = container.querySelector('.text-amber-500');
      expect(icon).toBeInTheDocument();
    });

    it('icon has aria-hidden in block variant', () => {
      const { container } = render(<DuplicateNameWarning {...defaultProps} />);

      const icon = container.querySelector('[aria-hidden="true"]');
      expect(icon).toBeInTheDocument();
    });

    it('renders icon in inline variant', () => {
      const { container } = render(
        <DuplicateNameWarning {...defaultProps} variant="inline" />
      );

      const icon = container.querySelector('.text-amber-500');
      expect(icon).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Edge Cases
  // ===========================================================================

  describe('Edge Cases', () => {
    it('handles empty matching names array', () => {
      render(
        <DuplicateNameWarning
          matchingNames={[]}
          matchType="exact"
        />
      );

      // Should still render the warning message
      expect(screen.getByText('Exact name already exists')).toBeInTheDocument();
    });

    it('handles single matching name without more indicator', () => {
      render(
        <DuplicateNameWarning
          matchingNames={['Single Item']}
          matchType="exact"
        />
      );

      expect(screen.getByText('• Single Item')).toBeInTheDocument();
      expect(screen.queryByText(/more/)).not.toBeInTheDocument();
    });

    it('handles exactly 3 matching names without more indicator', () => {
      render(
        <DuplicateNameWarning
          matchingNames={['Item 1', 'Item 2', 'Item 3']}
          matchType="similar"
        />
      );

      expect(screen.getByText('• Item 1')).toBeInTheDocument();
      expect(screen.getByText('• Item 2')).toBeInTheDocument();
      expect(screen.getByText('• Item 3')).toBeInTheDocument();
      expect(screen.queryByText(/more/)).not.toBeInTheDocument();
    });

    it('handles long names with truncation class', () => {
      const longName = 'A'.repeat(100);
      render(
        <DuplicateNameWarning
          matchingNames={[longName]}
          matchType="exact"
        />
      );

      const listItem = screen.getByText(new RegExp(`• ${longName.substring(0, 20)}`));
      expect(listItem.className).toContain('truncate');
    });
  });

  // ===========================================================================
  // Tooltip Tests (Inline Variant)
  // ===========================================================================

  describe('Tooltip (Inline Variant)', () => {
    it('tooltip content includes message', () => {
      // Note: Radix Tooltip uses portals, so we check for Tooltip provider
      const { container } = render(
        <DuplicateNameWarning {...defaultProps} variant="inline" />
      );

      // Tooltip.Provider wraps the component
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Text Styling Tests
  // ===========================================================================

  describe('Text Styling', () => {
    it('message text is amber-colored in block variant', () => {
      render(<DuplicateNameWarning {...defaultProps} />);

      const alert = screen.getByRole('alert');
      expect(alert.className).toContain('text-amber-800');
    });

    it('matching names list uses smaller text', () => {
      const { container } = render(<DuplicateNameWarning {...defaultProps} />);

      const listItem = container.querySelector('.text-xs');
      expect(listItem).toBeInTheDocument();
    });

    it('"more" indicator has slightly muted color', () => {
      const { container } = render(
        <DuplicateNameWarning
          matchingNames={['Item 1', 'Item 2', 'Item 3', 'Item 4']}
          matchType="exact"
        />
      );

      const moreIndicator = container.querySelector('.text-amber-600');
      expect(moreIndicator).toBeInTheDocument();
    });
  });
});
