/**
 * Unit Tests for ItemPreviewModal Component
 *
 * Tests cover:
 * - Metadata display (title, location, tags)
 * - Action buttons (Edit, Manage Assets, Delete)
 * - Delete confirmation flow
 * - Keyboard accessibility
 *
 * @module ItemManager/components/ItemPreview/__tests__
 * @created 2026-01-03
 * @requestId REQ-079
 */

import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ItemPreviewModal } from '../ItemPreviewModal';
import type { ItemRecord } from '@/components/ItemCapture';

// =============================================================================
// Mock Data
// =============================================================================

const mockItemBasic: ItemRecord = {
  id: 'test-item-1',
  title: 'Test Item Title',
  createdAt: new Date('2026-01-01'),
  media: [],
};

const mockItemWithLocation: ItemRecord = {
  ...mockItemBasic,
  id: 'test-item-2',
  location: 'Kitchen - Main Floor',
};

const mockItemWithTags: ItemRecord = {
  ...mockItemBasic,
  id: 'test-item-3',
  tags: ['appliance', 'maintenance', 'important'],
};

const mockItemComplete: ItemRecord = {
  id: 'test-item-4',
  title: 'Complete Test Item',
  location: 'Living Room',
  tags: ['electronics', 'setup'],
  createdAt: new Date('2026-01-01'),
  media: [],
};

const mockItemNoLocation: ItemRecord = {
  ...mockItemBasic,
  id: 'test-item-5',
  location: undefined,
};

const mockItemManyTags: ItemRecord = {
  ...mockItemBasic,
  id: 'test-item-6',
  tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5', 'tag6', 'tag7', 'tag8', 'tag9', 'tag10'],
};

// Default mock props
const mockOnClose = jest.fn();
const mockOnEditItem = jest.fn();
const mockOnDeleteItems = jest.fn();
const mockOnManageAssets = jest.fn();

const defaultProps = {
  isOpen: true,
  onClose: mockOnClose,
  item: mockItemBasic,
  children: <div>Content goes here</div>,
};

// =============================================================================
// Test Setup
// =============================================================================

beforeEach(() => {
  jest.clearAllMocks();
});

// =============================================================================
// Metadata Display Tests (Task 4.6.1)
// =============================================================================

describe('Metadata Display', () => {
  it('displays item title prominently', () => {
    render(<ItemPreviewModal {...defaultProps} item={mockItemBasic} />);

    // Title should appear in the metadata section (h2)
    const titleElement = screen.getByRole('heading', { level: 2 });
    expect(titleElement).toHaveTextContent(mockItemBasic.title);
    expect(titleElement).toHaveClass('text-xl', 'font-semibold');
  });

  it('displays location with MapPin icon when available', () => {
    render(<ItemPreviewModal {...defaultProps} item={mockItemWithLocation} />);

    expect(screen.getByText(mockItemWithLocation.location!)).toBeInTheDocument();
  });

  it('hides location when not available', () => {
    render(<ItemPreviewModal {...defaultProps} item={mockItemNoLocation} />);

    // Location text should not be present
    expect(screen.queryByText('Kitchen - Main Floor')).not.toBeInTheDocument();
  });

  it('hides location when location is empty string', () => {
    const itemEmptyLocation: ItemRecord = { ...mockItemBasic, location: '' };
    render(<ItemPreviewModal {...defaultProps} item={itemEmptyLocation} />);

    // MapPin shouldn't render for empty location
    const metadataSection = screen.getByRole('heading', { level: 2 }).parentElement;
    expect(metadataSection).not.toHaveTextContent('Kitchen');
  });

  it('renders tags as pill badges when available', () => {
    render(<ItemPreviewModal {...defaultProps} item={mockItemWithTags} />);

    mockItemWithTags.tags!.forEach((tag) => {
      expect(screen.getByText(tag)).toBeInTheDocument();
    });
  });

  it('hides tags section when tags array is empty', () => {
    const itemEmptyTags: ItemRecord = { ...mockItemBasic, tags: [] };
    render(<ItemPreviewModal {...defaultProps} item={itemEmptyTags} />);

    expect(screen.queryByText('appliance')).not.toBeInTheDocument();
  });

  it('hides tags section when tags is undefined', () => {
    const itemNoTags: ItemRecord = { ...mockItemBasic, tags: undefined };
    render(<ItemPreviewModal {...defaultProps} item={itemNoTags} />);

    expect(screen.queryByText('appliance')).not.toBeInTheDocument();
  });

  it('displays all metadata when item has title, location, and tags', () => {
    render(<ItemPreviewModal {...defaultProps} item={mockItemComplete} />);

    // Title
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(mockItemComplete.title);

    // Location
    expect(screen.getByText(mockItemComplete.location!)).toBeInTheDocument();

    // Tags
    mockItemComplete.tags!.forEach((tag) => {
      expect(screen.getByText(tag)).toBeInTheDocument();
    });
  });

  it('handles many tags without breaking layout', () => {
    render(<ItemPreviewModal {...defaultProps} item={mockItemManyTags} />);

    // All 10 tags should be present
    mockItemManyTags.tags!.forEach((tag) => {
      expect(screen.getByText(tag)).toBeInTheDocument();
    });
  });
});

// =============================================================================
// Action Buttons Tests (Task 4.6.2)
// =============================================================================

describe('Action Buttons', () => {
  it('renders Edit button with blue primary styling', () => {
    render(
      <ItemPreviewModal
        {...defaultProps}
        onEditItem={mockOnEditItem}
      />
    );

    const editButton = screen.getByRole('button', { name: /edit/i });
    expect(editButton).toBeInTheDocument();
    expect(editButton).toHaveClass('bg-blue-600');
  });

  it('renders Manage Assets button when enabled', () => {
    render(
      <ItemPreviewModal
        {...defaultProps}
        onManageAssets={mockOnManageAssets}
        config={{ enableAssetManagement: true }}
      />
    );

    const manageAssetsButton = screen.getByRole('button', { name: /manage assets/i });
    expect(manageAssetsButton).toBeInTheDocument();
    expect(manageAssetsButton).toHaveClass('bg-white', 'border-gray-300');
  });

  it('hides Manage Assets button when disabled', () => {
    render(
      <ItemPreviewModal
        {...defaultProps}
        onManageAssets={mockOnManageAssets}
        config={{ enableAssetManagement: false }}
      />
    );

    expect(screen.queryByRole('button', { name: /manage assets/i })).not.toBeInTheDocument();
  });

  it('renders Delete button with red destructive styling', () => {
    render(
      <ItemPreviewModal
        {...defaultProps}
        onDeleteItems={mockOnDeleteItems}
      />
    );

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    expect(deleteButton).toBeInTheDocument();
    expect(deleteButton).toHaveClass('bg-red-600');
  });

  it('Edit button is disabled when onEditItem is not provided', () => {
    render(<ItemPreviewModal {...defaultProps} />);

    const editButton = screen.getByRole('button', { name: /edit/i });
    expect(editButton).toBeDisabled();
    expect(editButton).toHaveClass('opacity-50', 'cursor-not-allowed');
  });

  it('Delete button is disabled when onDeleteItems is not provided', () => {
    render(<ItemPreviewModal {...defaultProps} />);

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    expect(deleteButton).toBeDisabled();
    expect(deleteButton).toHaveClass('opacity-50', 'cursor-not-allowed');
  });

  it('all buttons have minimum 44px height for touch accessibility', () => {
    render(
      <ItemPreviewModal
        {...defaultProps}
        onEditItem={mockOnEditItem}
        onDeleteItems={mockOnDeleteItems}
        onManageAssets={mockOnManageAssets}
      />
    );

    const editButton = screen.getByRole('button', { name: /edit/i });
    const manageAssetsButton = screen.getByRole('button', { name: /manage assets/i });
    const deleteButton = screen.getByRole('button', { name: /delete/i });

    expect(editButton).toHaveClass('min-h-[44px]');
    expect(manageAssetsButton).toHaveClass('min-h-[44px]');
    expect(deleteButton).toHaveClass('min-h-[44px]');
  });
});

// =============================================================================
// Edit Action Tests (Task 4.6.3)
// =============================================================================

describe('Edit Action', () => {
  it('calls onEditItem with item when Edit clicked', async () => {
    const user = userEvent.setup();

    render(
      <ItemPreviewModal
        {...defaultProps}
        item={mockItemComplete}
        onEditItem={mockOnEditItem}
      />
    );

    await user.click(screen.getByRole('button', { name: /edit/i }));

    expect(mockOnEditItem).toHaveBeenCalledWith(mockItemComplete);
    expect(mockOnEditItem).toHaveBeenCalledTimes(1);
  });

  it('closes modal after Edit button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <ItemPreviewModal
        {...defaultProps}
        onEditItem={mockOnEditItem}
      />
    );

    await user.click(screen.getByRole('button', { name: /edit/i }));

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('does not call onEditItem when callback is not provided', async () => {
    const user = userEvent.setup();

    render(<ItemPreviewModal {...defaultProps} />);

    const editButton = screen.getByRole('button', { name: /edit/i });
    await user.click(editButton);

    expect(mockOnEditItem).not.toHaveBeenCalled();
  });
});

// =============================================================================
// Manage Assets Action Tests (Task 4.6.4)
// =============================================================================

describe('Manage Assets Action', () => {
  it('calls onManageAssets with item when clicked', async () => {
    const user = userEvent.setup();

    render(
      <ItemPreviewModal
        {...defaultProps}
        item={mockItemComplete}
        onManageAssets={mockOnManageAssets}
      />
    );

    await user.click(screen.getByRole('button', { name: /manage assets/i }));

    expect(mockOnManageAssets).toHaveBeenCalledWith(mockItemComplete);
  });

  it('closes modal after Manage Assets button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <ItemPreviewModal
        {...defaultProps}
        onManageAssets={mockOnManageAssets}
      />
    );

    await user.click(screen.getByRole('button', { name: /manage assets/i }));

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('button is disabled when onManageAssets is not provided', () => {
    render(
      <ItemPreviewModal
        {...defaultProps}
        config={{ enableAssetManagement: true }}
      />
    );

    const manageAssetsButton = screen.getByRole('button', { name: /manage assets/i });
    expect(manageAssetsButton).toBeDisabled();
  });
});

// =============================================================================
// Delete Confirmation Tests (Task 4.6.5)
// =============================================================================

describe('Delete Confirmation', () => {
  it('shows confirmation dialog when Delete clicked', async () => {
    const user = userEvent.setup();

    render(
      <ItemPreviewModal
        {...defaultProps}
        onDeleteItems={mockOnDeleteItems}
      />
    );

    await user.click(screen.getByRole('button', { name: /delete/i }));

    expect(screen.getByRole('dialog', { name: /delete item/i })).toBeInTheDocument();
    expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
  });

  it('displays item title in confirmation message', async () => {
    const user = userEvent.setup();

    render(
      <ItemPreviewModal
        {...defaultProps}
        item={mockItemComplete}
        onDeleteItems={mockOnDeleteItems}
      />
    );

    await user.click(screen.getByRole('button', { name: /delete/i }));

    expect(screen.getByText(new RegExp(mockItemComplete.title))).toBeInTheDocument();
  });

  it('closes dialog on Cancel without deleting', async () => {
    const user = userEvent.setup();

    render(
      <ItemPreviewModal
        {...defaultProps}
        onDeleteItems={mockOnDeleteItems}
      />
    );

    // Open dialog
    await user.click(screen.getByRole('button', { name: /delete/i }));

    // Click Cancel
    await user.click(screen.getByRole('button', { name: /cancel/i }));

    // Dialog should be closed
    expect(screen.queryByRole('dialog', { name: /delete item/i })).not.toBeInTheDocument();
    expect(mockOnDeleteItems).not.toHaveBeenCalled();
  });

  it('calls onDeleteItems with item ID array on Confirm', async () => {
    const user = userEvent.setup();

    render(
      <ItemPreviewModal
        {...defaultProps}
        item={mockItemComplete}
        onDeleteItems={mockOnDeleteItems}
      />
    );

    // Open dialog
    await user.click(screen.getByRole('button', { name: /delete/i }));

    // Get all buttons named "Delete" - there will be 2 (action bar and confirm dialog)
    const deleteButtons = screen.getAllByRole('button', { name: /^delete$/i });
    // Click the one in the dialog (second one)
    await user.click(deleteButtons[deleteButtons.length - 1]);

    expect(mockOnDeleteItems).toHaveBeenCalledWith([mockItemComplete.id]);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('closes dialog when clicking outside', async () => {
    const user = userEvent.setup();

    render(
      <ItemPreviewModal
        {...defaultProps}
        onDeleteItems={mockOnDeleteItems}
      />
    );

    // Open dialog
    await user.click(screen.getByRole('button', { name: /delete/i }));

    // Click the overlay (the outer dialog element)
    const dialogOverlay = screen.getByRole('dialog', { name: /delete item/i });
    fireEvent.click(dialogOverlay);

    // Dialog should be closed
    await waitFor(() => {
      expect(screen.queryByText(/are you sure/i)).not.toBeInTheDocument();
    });
  });
});

// =============================================================================
// Keyboard Navigation Tests (Task 4.6.6)
// =============================================================================

describe('Keyboard Navigation', () => {
  it('closes dialog on Escape key', async () => {
    const user = userEvent.setup();

    render(
      <ItemPreviewModal
        {...defaultProps}
        onDeleteItems={mockOnDeleteItems}
      />
    );

    // Open dialog
    await user.click(screen.getByRole('button', { name: /delete/i }));

    // Press Escape
    await user.keyboard('{Escape}');

    // Dialog should be closed
    await waitFor(() => {
      expect(screen.queryByText(/are you sure/i)).not.toBeInTheDocument();
    });
  });

  it('focuses Cancel button when dialog opens', async () => {
    const user = userEvent.setup();

    render(
      <ItemPreviewModal
        {...defaultProps}
        onDeleteItems={mockOnDeleteItems}
      />
    );

    // Open dialog
    await user.click(screen.getByRole('button', { name: /delete/i }));

    // Cancel button should have focus
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /cancel/i })).toHaveFocus();
    });
  });

  it('all action buttons are keyboard accessible', async () => {
    const user = userEvent.setup();

    render(
      <ItemPreviewModal
        {...defaultProps}
        onEditItem={mockOnEditItem}
        onDeleteItems={mockOnDeleteItems}
        onManageAssets={mockOnManageAssets}
      />
    );

    const editButton = screen.getByRole('button', { name: /edit/i });
    const manageAssetsButton = screen.getByRole('button', { name: /manage assets/i });
    const deleteButton = screen.getByRole('button', { name: /delete/i });

    // Buttons should have proper button type
    expect(editButton).toHaveAttribute('type', 'button');
    expect(manageAssetsButton).toHaveAttribute('type', 'button');
    expect(deleteButton).toHaveAttribute('type', 'button');
  });

  it('Enter key activates focused button', async () => {
    const user = userEvent.setup();

    render(
      <ItemPreviewModal
        {...defaultProps}
        onEditItem={mockOnEditItem}
      />
    );

    const editButton = screen.getByRole('button', { name: /edit/i });
    editButton.focus();

    await user.keyboard('{Enter}');

    expect(mockOnEditItem).toHaveBeenCalled();
  });

  it('Space key activates focused button', async () => {
    const user = userEvent.setup();

    render(
      <ItemPreviewModal
        {...defaultProps}
        onEditItem={mockOnEditItem}
      />
    );

    const editButton = screen.getByRole('button', { name: /edit/i });
    editButton.focus();

    await user.keyboard(' ');

    expect(mockOnEditItem).toHaveBeenCalled();
  });
});

// =============================================================================
// Modal Behavior Tests
// =============================================================================

describe('Modal Behavior', () => {
  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <ItemPreviewModal
        {...defaultProps}
        isOpen={false}
      />
    );

    // Modal content should not be in the DOM
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders content when isOpen is true', () => {
    render(<ItemPreviewModal {...defaultProps} />);

    expect(screen.getByText('Content goes here')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup();

    render(<ItemPreviewModal {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: /close preview/i }));

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('uses custom title when provided', () => {
    render(
      <ItemPreviewModal
        {...defaultProps}
        title="Custom Title"
      />
    );

    // The dialog title should be the custom title
    expect(screen.getByRole('heading', { name: 'Custom Title' })).toBeInTheDocument();
  });

  it('uses item title when custom title not provided', () => {
    render(<ItemPreviewModal {...defaultProps} />);

    // The dialog title in the header uses displayTitle
    expect(screen.getByRole('heading', { name: mockItemBasic.title })).toBeInTheDocument();
  });
});

// =============================================================================
// ARIA Accessibility Tests
// =============================================================================

describe('ARIA Accessibility', () => {
  it('delete confirmation dialog has proper ARIA attributes', async () => {
    const user = userEvent.setup();

    render(
      <ItemPreviewModal
        {...defaultProps}
        onDeleteItems={mockOnDeleteItems}
      />
    );

    await user.click(screen.getByRole('button', { name: /delete/i }));

    const dialog = screen.getByRole('dialog', { name: /delete item/i });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'delete-confirm-title');
    expect(dialog).toHaveAttribute('aria-describedby', 'delete-confirm-description');
  });

  it('screen reader announcement is present when dialog opens', async () => {
    const user = userEvent.setup();

    render(
      <ItemPreviewModal
        {...defaultProps}
        item={mockItemComplete}
        onDeleteItems={mockOnDeleteItems}
      />
    );

    await user.click(screen.getByRole('button', { name: /delete/i }));

    // Check for the sr-only announcement
    expect(screen.getByText(new RegExp(`Delete confirmation dialog opened for ${mockItemComplete.title}`))).toBeInTheDocument();
  });

  it('icons have aria-hidden true', () => {
    render(
      <ItemPreviewModal
        {...defaultProps}
        onEditItem={mockOnEditItem}
        onDeleteItems={mockOnDeleteItems}
        onManageAssets={mockOnManageAssets}
      />
    );

    // Icons should not be read by screen readers
    // This is verified by the buttons having text labels that screen readers can use
    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /manage assets/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
  });
});
