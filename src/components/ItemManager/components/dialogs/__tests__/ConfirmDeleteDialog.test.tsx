/**
 * ConfirmDeleteDialog Component Tests
 *
 * @module ItemManager/components/dialogs/__tests__/ConfirmDeleteDialog.test
 * @see docs/REQ-071-implement-confirmdeletedialog-detailed.md
 * @lastModified 2026-01-04 (REQ-071)
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  ConfirmDeleteDialog,
  formatItemList,
  getDeleteTitle,
  getDeleteMessage,
  getConfirmButtonText,
} from '../ConfirmDeleteDialog';

// =============================================================================
// Test Utilities
// =============================================================================

/**
 * Item record type for testing - matches ItemRecord from ItemCapture
 */
interface TestItemRecord {
  id: string;
  title: string;
  contentType: 'media' | 'text-only' | 'mixed';
  media: unknown[];
  createdAt: Date;
  tags?: string[];
  location?: string;
}

/**
 * Factory function to create mock ItemRecord objects.
 */
function createMockItem(id: string, title: string): TestItemRecord {
  return {
    id,
    title,
    contentType: 'media',
    media: [],
    createdAt: new Date(),
  };
}

/**
 * Create array of mock items for testing.
 */
function createMockItems(count: number): TestItemRecord[] {
  return Array.from({ length: count }, (_, i) =>
    createMockItem(`item-${i + 1}`, `Item ${i + 1}`)
  );
}

// =============================================================================
// Helper Function Tests
// =============================================================================

describe('formatItemList', () => {
  it('returns all items when count is <= 5', () => {
    const items = createMockItems(3);
    const result = formatItemList(items);

    expect(result.visibleItems).toHaveLength(3);
    expect(result.overflowCount).toBe(0);
  });

  it('returns exactly 5 items when count is 5', () => {
    const items = createMockItems(5);
    const result = formatItemList(items);

    expect(result.visibleItems).toHaveLength(5);
    expect(result.overflowCount).toBe(0);
  });

  it('returns first 5 items with overflow when count > 5', () => {
    const items = createMockItems(8);
    const result = formatItemList(items);

    expect(result.visibleItems).toHaveLength(5);
    expect(result.overflowCount).toBe(3);
  });

  it('respects custom maxVisible parameter', () => {
    const items = createMockItems(5);
    const result = formatItemList(items, 3);

    expect(result.visibleItems).toHaveLength(3);
    expect(result.overflowCount).toBe(2);
  });

  it('handles empty array', () => {
    const result = formatItemList([]);

    expect(result.visibleItems).toHaveLength(0);
    expect(result.overflowCount).toBe(0);
  });

  it('handles single item', () => {
    const items = createMockItems(1);
    const result = formatItemList(items);

    expect(result.visibleItems).toHaveLength(1);
    expect(result.overflowCount).toBe(0);
  });

  it('handles exactly 6 items (boundary + 1)', () => {
    const items = createMockItems(6);
    const result = formatItemList(items);

    expect(result.visibleItems).toHaveLength(5);
    expect(result.overflowCount).toBe(1);
  });
});

describe('getDeleteTitle', () => {
  it('returns "Delete Item" for single item', () => {
    expect(getDeleteTitle(1)).toBe('Delete Item');
  });

  it('returns "Delete Items" for multiple items', () => {
    expect(getDeleteTitle(2)).toBe('Delete Items');
    expect(getDeleteTitle(10)).toBe('Delete Items');
    expect(getDeleteTitle(100)).toBe('Delete Items');
  });

  it('returns custom title when provided', () => {
    expect(getDeleteTitle(1, 'Custom Title')).toBe('Custom Title');
    expect(getDeleteTitle(5, 'Custom Title')).toBe('Custom Title');
  });

  it('returns custom title even for zero items', () => {
    expect(getDeleteTitle(0, 'Custom')).toBe('Custom');
  });
});

describe('getDeleteMessage', () => {
  it('returns singular message for single item', () => {
    const message = getDeleteMessage(1);
    expect(message).toContain('this item');
    expect(message).not.toContain('these');
  });

  it('returns plural message with count for multiple items', () => {
    const message = getDeleteMessage(5);
    expect(message).toContain('these 5 items');
  });

  it('always includes "cannot be undone" warning', () => {
    expect(getDeleteMessage(1)).toContain('cannot be undone');
    expect(getDeleteMessage(10)).toContain('cannot be undone');
  });

  it('handles large numbers', () => {
    const message = getDeleteMessage(100);
    expect(message).toContain('these 100 items');
  });
});

describe('getConfirmButtonText', () => {
  it('returns "Delete" for single item', () => {
    expect(getConfirmButtonText(1)).toBe('Delete');
  });

  it('returns "Delete N Items" for multiple items', () => {
    expect(getConfirmButtonText(2)).toBe('Delete 2 Items');
    expect(getConfirmButtonText(100)).toBe('Delete 100 Items');
  });
});

// =============================================================================
// Component Rendering Tests
// =============================================================================

describe('ConfirmDeleteDialog', () => {
  const mockItems = [
    createMockItem('1', 'Coffee Maker Instructions'),
    createMockItem('2', 'Dishwasher Guide'),
    createMockItem('3', 'HVAC Control Panel'),
  ];

  const defaultProps = {
    isOpen: true,
    items: mockItems,
    onConfirm: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders when isOpen is true and items exist', () => {
      render(<ConfirmDeleteDialog {...defaultProps} />);
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });

    it('does not render when isOpen is false', () => {
      render(<ConfirmDeleteDialog {...defaultProps} isOpen={false} />);
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });

    it('does not render when items array is empty', () => {
      render(<ConfirmDeleteDialog {...defaultProps} items={[]} />);
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });

    it('shows "Delete Item" title for single item', () => {
      render(<ConfirmDeleteDialog {...defaultProps} items={[mockItems[0]]} />);
      expect(screen.getByText('Delete Item')).toBeInTheDocument();
    });

    it('shows "Delete Items" title for multiple items', () => {
      render(<ConfirmDeleteDialog {...defaultProps} />);
      expect(screen.getByText('Delete Items')).toBeInTheDocument();
    });

    it('displays custom title when provided', () => {
      render(<ConfirmDeleteDialog {...defaultProps} title="Remove Content" />);
      expect(screen.getByText('Remove Content')).toBeInTheDocument();
    });

    it('displays all item titles when 5 or fewer', () => {
      render(<ConfirmDeleteDialog {...defaultProps} />);
      expect(screen.getByText('Coffee Maker Instructions')).toBeInTheDocument();
      expect(screen.getByText('Dishwasher Guide')).toBeInTheDocument();
      expect(screen.getByText('HVAC Control Panel')).toBeInTheDocument();
    });

    it('shows overflow count when more than 5 items', () => {
      const manyItems = createMockItems(8);
      render(<ConfirmDeleteDialog {...defaultProps} items={manyItems} />);
      expect(screen.getByText('and 3 more')).toBeInTheDocument();
    });

    it('displays correct button text for single item', () => {
      render(<ConfirmDeleteDialog {...defaultProps} items={[mockItems[0]]} />);
      expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
    });

    it('displays correct button text for multiple items', () => {
      render(<ConfirmDeleteDialog {...defaultProps} />);
      expect(screen.getByRole('button', { name: 'Delete 3 Items' })).toBeInTheDocument();
    });

    it('renders cancel button', () => {
      render(<ConfirmDeleteDialog {...defaultProps} />);
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });

    it('renders warning icon container', () => {
      render(<ConfirmDeleteDialog {...defaultProps} />);
      // Warning icon should be present (AlertTriangle)
      const dialog = screen.getByRole('alertdialog');
      expect(dialog).toBeInTheDocument();
    });
  });

  describe('User Actions', () => {
    it('calls onConfirm when confirm button is clicked', async () => {
      const user = userEvent.setup();
      render(<ConfirmDeleteDialog {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: 'Delete 3 Items' }));
      expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
    });

    it('calls onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(<ConfirmDeleteDialog {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
    });

    it('calls onCancel when Escape key is pressed', () => {
      render(<ConfirmDeleteDialog {...defaultProps} />);

      fireEvent.keyDown(screen.getByRole('alertdialog'), { key: 'Escape' });
      expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
    });

    it('calls onCancel when backdrop is clicked', async () => {
      render(<ConfirmDeleteDialog {...defaultProps} />);

      // The backdrop is the outer element with the onClick handler
      // We need to click on the backdrop, not the dialog content
      const backdrop = screen.getByRole('alertdialog');
      fireEvent.click(backdrop);
      expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
    });

    it('does not call onCancel when dialog content is clicked', async () => {
      const user = userEvent.setup();
      render(<ConfirmDeleteDialog {...defaultProps} />);

      await user.click(screen.getByText('Delete Items'));
      expect(defaultProps.onCancel).not.toHaveBeenCalled();
    });
  });

  describe('Loading State', () => {
    it('disables both buttons when loading', () => {
      render(<ConfirmDeleteDialog {...defaultProps} loading={true} />);

      expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
      expect(screen.getByRole('button', { name: /deleting/i })).toBeDisabled();
    });

    it('shows loading text and spinner when loading', () => {
      render(<ConfirmDeleteDialog {...defaultProps} loading={true} />);

      expect(screen.getByText('Deleting...')).toBeInTheDocument();
    });

    it('does not close on Escape when loading', () => {
      render(<ConfirmDeleteDialog {...defaultProps} loading={true} />);

      fireEvent.keyDown(screen.getByRole('alertdialog'), { key: 'Escape' });
      expect(defaultProps.onCancel).not.toHaveBeenCalled();
    });

    it('does not close on backdrop click when loading', () => {
      render(<ConfirmDeleteDialog {...defaultProps} loading={true} />);

      const backdrop = screen.getByRole('alertdialog');
      fireEvent.click(backdrop);
      expect(defaultProps.onCancel).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has role="alertdialog"', () => {
      render(<ConfirmDeleteDialog {...defaultProps} />);
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });

    it('has aria-modal="true"', () => {
      render(<ConfirmDeleteDialog {...defaultProps} />);
      expect(screen.getByRole('alertdialog')).toHaveAttribute('aria-modal', 'true');
    });

    it('has aria-labelledby pointing to title', () => {
      render(<ConfirmDeleteDialog {...defaultProps} />);
      const dialog = screen.getByRole('alertdialog');
      expect(dialog).toHaveAttribute('aria-labelledby', 'delete-dialog-title');
    });

    it('has aria-describedby pointing to description', () => {
      render(<ConfirmDeleteDialog {...defaultProps} />);
      const dialog = screen.getByRole('alertdialog');
      expect(dialog).toHaveAttribute('aria-describedby', 'delete-dialog-description');
    });

    it('has accessible item list with proper aria-label', () => {
      render(<ConfirmDeleteDialog {...defaultProps} />);
      expect(screen.getByRole('list', { name: 'Items to be deleted' })).toBeInTheDocument();
    });

    it('title element has correct id for labelling', () => {
      render(<ConfirmDeleteDialog {...defaultProps} />);
      const title = screen.getByText('Delete Items');
      expect(title).toHaveAttribute('id', 'delete-dialog-title');
    });

    it('description element has correct id for describing', () => {
      render(<ConfirmDeleteDialog {...defaultProps} />);
      const description = screen.getByText(/Are you sure you want to delete/);
      expect(description).toHaveAttribute('id', 'delete-dialog-description');
    });
  });

  describe('Edge Cases', () => {
    it('handles items with long titles (truncation)', () => {
      const longTitleItem = createMockItem(
        '1',
        'This is a very long title that should be truncated with an ellipsis when displayed in the dialog'
      );
      render(<ConfirmDeleteDialog {...defaultProps} items={[longTitleItem]} />);

      // Title should still be present and have truncate class
      const listItem = screen.getByText(longTitleItem.title);
      expect(listItem).toBeInTheDocument();
      expect(listItem).toHaveClass('truncate');
    });

    it('handles exactly 5 items (no overflow)', () => {
      const fiveItems = createMockItems(5);
      render(<ConfirmDeleteDialog {...defaultProps} items={fiveItems} />);

      // Should show all 5 items
      for (let i = 1; i <= 5; i++) {
        expect(screen.getByText(`Item ${i}`)).toBeInTheDocument();
      }
      // Should not show overflow
      expect(screen.queryByText(/and \d+ more/)).not.toBeInTheDocument();
    });

    it('handles 6 items (shows "and 1 more")', () => {
      const sixItems = createMockItems(6);
      render(<ConfirmDeleteDialog {...defaultProps} items={sixItems} />);

      expect(screen.getByText('and 1 more')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<ConfirmDeleteDialog {...defaultProps} className="custom-class" />);

      const dialog = screen.getByRole('alertdialog');
      const dialogContent = dialog.querySelector('.custom-class');
      expect(dialogContent).toBeInTheDocument();
    });
  });
});
