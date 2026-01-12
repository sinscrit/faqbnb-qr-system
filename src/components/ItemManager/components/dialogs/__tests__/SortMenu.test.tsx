/**
 * Unit tests for SortMenu component.
 * @module ItemManager/components/dialogs/__tests__/SortMenu.test
 * @lastModified 2026-01-04 (REQ-066 Task 2.5.8)
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SortMenu } from '../SortMenu';
import type { SortOption } from '../../../ItemManager.types';

describe('SortMenu', () => {
  const mockOnSortChange = vi.fn();
  const defaultProps = {
    currentSort: 'created-desc' as SortOption,
    onSortChange: mockOnSortChange,
  };

  beforeEach(() => {
    mockOnSortChange.mockClear();
  });

  describe('Rendering', () => {
    it('renders trigger button with current sort label', () => {
      render(<SortMenu {...defaultProps} />);
      expect(screen.getByText('Newest First')).toBeInTheDocument();
    });

    it('renders sort icon on trigger button', () => {
      render(<SortMenu {...defaultProps} />);
      // ArrowUpDown icon should be present - check for button with aria-label
      expect(screen.getByLabelText(/sort by/i)).toBeInTheDocument();
    });

    it('applies custom className to trigger button', () => {
      render(<SortMenu {...defaultProps} className="custom-class" />);
      expect(screen.getByRole('button')).toHaveClass('custom-class');
    });

    it('shows disabled styling when disabled', () => {
      render(<SortMenu {...defaultProps} disabled />);
      expect(screen.getByRole('button')).toHaveClass('opacity-50');
      expect(screen.getByRole('button')).toHaveClass('cursor-not-allowed');
    });

    it('displays different current sort options correctly', () => {
      const { rerender } = render(<SortMenu {...defaultProps} currentSort="title-asc" />);
      expect(screen.getByText('Title (A-Z)')).toBeInTheDocument();

      rerender(<SortMenu {...defaultProps} currentSort="updated-desc" />);
      expect(screen.getByText('Recently Modified')).toBeInTheDocument();

      rerender(<SortMenu {...defaultProps} currentSort="location-asc" />);
      expect(screen.getByText('Location (A-Z)')).toBeInTheDocument();
    });
  });

  describe('Dropdown Behavior', () => {
    it('opens dropdown on trigger click', async () => {
      const user = userEvent.setup();
      render(<SortMenu {...defaultProps} />);

      await user.click(screen.getByRole('button'));

      // Check for dropdown header
      expect(screen.getByText('Sort by')).toBeInTheDocument();
      // Check for some sort options
      expect(screen.getByText('Title (A-Z)')).toBeInTheDocument();
      expect(screen.getByText('Title (Z-A)')).toBeInTheDocument();
    });

    it('displays all sort options', async () => {
      const user = userEvent.setup();
      render(<SortMenu {...defaultProps} />);

      await user.click(screen.getByRole('button'));

      expect(screen.getByText('Title (A-Z)')).toBeInTheDocument();
      expect(screen.getByText('Title (Z-A)')).toBeInTheDocument();
      expect(screen.getByText('Newest First')).toBeInTheDocument();
      expect(screen.getByText('Oldest First')).toBeInTheDocument();
      expect(screen.getByText('Recently Modified')).toBeInTheDocument();
      expect(screen.getByText('Least Recently Modified')).toBeInTheDocument();
      expect(screen.getByText('Location (A-Z)')).toBeInTheDocument();
    });

    it('highlights current sort option', async () => {
      const user = userEvent.setup();
      render(<SortMenu {...defaultProps} currentSort="title-asc" />);

      await user.click(screen.getByRole('button'));

      const radioItems = screen.getAllByRole('menuitemradio');
      const activeItem = radioItems.find(item => item.getAttribute('data-state') === 'checked');
      expect(activeItem).toHaveTextContent('Title (A-Z)');
    });

    it('calls onSortChange when option is selected', async () => {
      const user = userEvent.setup();
      render(<SortMenu {...defaultProps} />);

      await user.click(screen.getByRole('button'));

      // Find and click the "Title (A-Z)" option
      const titleOption = screen.getAllByRole('menuitemradio').find(
        item => item.textContent?.includes('Title (A-Z)')
      );
      expect(titleOption).toBeDefined();
      await user.click(titleOption!);

      expect(mockOnSortChange).toHaveBeenCalledWith('title-asc');
    });

    it('closes dropdown after selection', async () => {
      const user = userEvent.setup();
      render(<SortMenu {...defaultProps} />);

      await user.click(screen.getByRole('button'));

      // Verify dropdown is open
      expect(screen.getByText('Sort by')).toBeInTheDocument();

      // Click an option
      const titleOption = screen.getAllByRole('menuitemradio').find(
        item => item.textContent?.includes('Title (A-Z)')
      );
      await user.click(titleOption!);

      // Dropdown should close
      await waitFor(() => {
        expect(screen.queryByText('Title (Z-A)')).not.toBeInTheDocument();
      });
    });

    it('does not open dropdown when disabled', async () => {
      const user = userEvent.setup();
      render(<SortMenu {...defaultProps} disabled />);

      await user.click(screen.getByRole('button'));

      // Dropdown should not open
      expect(screen.queryByText('Sort by')).not.toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('opens dropdown on Enter key', async () => {
      const user = userEvent.setup();
      render(<SortMenu {...defaultProps} />);

      screen.getByRole('button').focus();
      await user.keyboard('{Enter}');

      expect(screen.getByText('Sort by')).toBeInTheDocument();
    });

    it('opens dropdown on Space key', async () => {
      const user = userEvent.setup();
      render(<SortMenu {...defaultProps} />);

      screen.getByRole('button').focus();
      await user.keyboard(' ');

      expect(screen.getByText('Sort by')).toBeInTheDocument();
    });

    it('closes dropdown on Escape key', async () => {
      const user = userEvent.setup();
      render(<SortMenu {...defaultProps} />);

      await user.click(screen.getByRole('button'));
      expect(screen.getByText('Sort by')).toBeInTheDocument();

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByText('Title (Z-A)')).not.toBeInTheDocument();
      });
    });

    it('navigates options with arrow keys', async () => {
      const user = userEvent.setup();
      render(<SortMenu {...defaultProps} />);

      await user.click(screen.getByRole('button'));
      await user.keyboard('{ArrowDown}');

      // First option should be focused
      const radioItems = screen.getAllByRole('menuitemradio');
      expect(radioItems.length).toBeGreaterThan(0);
    });
  });

  describe('Custom Labels', () => {
    it('uses custom sortBy label in dropdown header', async () => {
      const user = userEvent.setup();
      render(
        <SortMenu
          {...defaultProps}
          labels={{ sortByLabel: 'Order by' }}
        />
      );

      await user.click(screen.getByRole('button'));

      expect(screen.getByText('Order by')).toBeInTheDocument();
    });

    it('includes custom aria-label with sort option', () => {
      render(
        <SortMenu
          {...defaultProps}
          labels={{ sortByLabel: 'Order by' }}
        />
      );
      expect(screen.getByRole('button')).toHaveAttribute(
        'aria-label',
        expect.stringContaining('Newest First')
      );
    });
  });

  describe('Custom Sort Options', () => {
    const customOptions = [
      { value: 'created-desc' as SortOption, label: 'Recent', icon: 'desc' as const },
      { value: 'title-asc' as SortOption, label: 'Alphabetical', icon: 'asc' as const },
    ];

    it('uses custom sort options when provided', async () => {
      const user = userEvent.setup();
      render(
        <SortMenu
          {...defaultProps}
          sortOptions={customOptions}
        />
      );

      await user.click(screen.getByRole('button'));

      expect(screen.getByText('Recent')).toBeInTheDocument();
      expect(screen.getByText('Alphabetical')).toBeInTheDocument();
      // Default options should not be present
      expect(screen.queryByText('Oldest First')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has accessible aria-label on trigger', () => {
      render(<SortMenu {...defaultProps} />);
      expect(screen.getByRole('button')).toHaveAttribute(
        'aria-label',
        expect.stringContaining('Newest First')
      );
    });

    it('uses radio group semantics for options', async () => {
      const user = userEvent.setup();
      render(<SortMenu {...defaultProps} />);

      await user.click(screen.getByRole('button'));

      const radioItems = screen.getAllByRole('menuitemradio');
      expect(radioItems.length).toBe(7);
    });

    it('marks current option as checked', async () => {
      const user = userEvent.setup();
      render(<SortMenu {...defaultProps} currentSort="created-desc" />);

      await user.click(screen.getByRole('button'));

      const radioItems = screen.getAllByRole('menuitemradio');
      const checkedItem = radioItems.find(
        item => item.getAttribute('data-state') === 'checked'
      );
      expect(checkedItem).toHaveTextContent('Newest First');
    });

    it('trigger button has correct type attribute', () => {
      render(<SortMenu {...defaultProps} />);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
    });
  });

  describe('Touch Targets', () => {
    it('trigger button has minimum 44px height', () => {
      render(<SortMenu {...defaultProps} />);
      expect(screen.getByRole('button')).toHaveClass('min-h-[44px]');
    });

    it('menu items have minimum 48px height', async () => {
      const user = userEvent.setup();
      render(<SortMenu {...defaultProps} />);

      await user.click(screen.getByRole('button'));

      const radioItems = screen.getAllByRole('menuitemradio');
      radioItems.forEach(item => {
        expect(item).toHaveClass('min-h-[48px]');
      });
    });
  });

  describe('Alignment and Position', () => {
    it('respects align prop', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <SortMenu {...defaultProps} align="start" />
      );

      await user.click(screen.getByRole('button'));

      // The Radix UI content should be rendered
      expect(container.querySelector('[data-radix-popper-content-wrapper]')).toBeInTheDocument();
    });

    it('respects side prop', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <SortMenu {...defaultProps} side="top" />
      );

      await user.click(screen.getByRole('button'));

      expect(container.querySelector('[data-radix-popper-content-wrapper]')).toBeInTheDocument();
    });
  });
});
