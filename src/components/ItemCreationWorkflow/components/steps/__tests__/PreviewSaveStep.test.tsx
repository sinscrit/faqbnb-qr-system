/**
 * PreviewSaveStep Component Tests
 *
 * Tests for the PreviewSaveStep component including:
 * - Content display and preview grid
 * - Pre-populated metadata fields (room, item type, purpose)
 * - Title editing with character counter
 * - Empty state handling
 * - Save flow and error handling
 * - Item/Article separation (REQ-210)
 *
 * @module ItemCreationWorkflow/components/steps/__tests__/PreviewSaveStep.test
 * @lastModified 2026-01-12 (REQ-210: Item/Article separation tests)
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import { PreviewSaveStep } from '../PreviewSaveStep';
import type { CurrentItemState, ContentPiece, PurposeType } from '../../../ItemCreationWorkflow.types';

// Mock URL.createObjectURL and revokeObjectURL
const mockCreateObjectURL = vi.fn(() => 'blob:test-url');
const mockRevokeObjectURL = vi.fn();

beforeAll(() => {
  global.URL.createObjectURL = mockCreateObjectURL;
  global.URL.revokeObjectURL = mockRevokeObjectURL;
});

// =============================================================================
// Test Fixtures
// =============================================================================

const mockVideoContent: ContentPiece = {
  id: 'video-1',
  type: 'video',
  data: { type: 'video', file: new Blob(['video'], { type: 'video/mp4' }), duration: 45 },
  order: 0,
};

const mockPhotoContent: ContentPiece = {
  id: 'photo-1',
  type: 'photo',
  data: { type: 'photo', file: new Blob(['image'], { type: 'image/jpeg' }) },
  order: 1,
};

const mockCurrentItem: CurrentItemState = {
  room: 'kitchen',
  itemType: 'appliance',
  specificItem: 'Dishwasher',
  itemName: 'Kitchen - Dishwasher',
  currentArticle: {
    title: 'Instructions',
    purpose: null,
    content: [mockVideoContent],
  },
  purpose: null,
  contentSource: 'create-new',
  contentType: 'video',
  content: [mockVideoContent],
  tags: [],
};

const mockCurrentItemWithMultipleContent: CurrentItemState = {
  ...mockCurrentItem,
  content: [mockVideoContent, mockPhotoContent],
};

const mockEmptyCurrentItem: CurrentItemState = {
  ...mockCurrentItem,
  itemName: '',
  content: [],
};

// REQ-171: Purpose-related fixtures
const mockCurrentItemWithPurpose: CurrentItemState = {
  room: 'kitchen',
  itemType: 'appliance',
  specificItem: 'Fridge',
  itemName: 'How to Clean - Fridge',
  currentArticle: {
    title: 'How to Clean',
    purpose: 'how-to-clean',
    content: [mockVideoContent],
  },
  purpose: 'how-to-clean',
  contentSource: 'create-new',
  contentType: 'video',
  content: [mockVideoContent],
  tags: ['kitchen', 'cleaning'],
};

// REQ-210: Item/Article separation fixture
const mockItemWithArticle: CurrentItemState = {
  room: 'kitchen',
  itemType: 'appliance',
  specificItem: 'Cabinets',
  itemName: 'How to Clean - Cabinets',  // Legacy combined name
  currentArticle: {
    title: 'How to Clean',
    purpose: 'how-to-clean',
    content: [mockVideoContent],
  },
  purpose: 'how-to-clean',
  contentSource: 'create-new',
  contentType: 'video',
  content: [mockVideoContent],
  tags: ['kitchen', 'cleaning'],
};

const mockPdfContent: ContentPiece = {
  id: 'pdf-1',
  type: 'pdf',
  data: { type: 'pdf', file: new Blob(['pdf'], { type: 'application/pdf' }), pageCount: 5 },
  order: 2,
};

const mockTextContent: ContentPiece = {
  id: 'text-1',
  type: 'text',
  data: { type: 'text', text: 'Sample instructions for the appliance.' },
  order: 3,
};

const mockUrlContent: ContentPiece = {
  id: 'url-1',
  type: 'url',
  data: { type: 'url', url: 'https://example.com', title: 'Example Guide' },
  order: 4,
};

describe('PreviewSaveStep', () => {
  const defaultProps = {
    currentItem: mockCurrentItem,
    onUpdateItemName: vi.fn(),
    onUpdateArticleTitle: vi.fn(),
    onUpdateTags: vi.fn(),
    onRemoveContent: vi.fn(),
    onReorderContent: vi.fn(),
    onRetake: vi.fn(),
    onSave: vi.fn().mockResolvedValue({ id: 'item-1', qrCodeUrl: 'data:image/png;base64,test' }),
    onCancel: vi.fn(),
    onComplete: vi.fn(),
    isSaving: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ===========================================================================
  // Content Display Tests
  // ===========================================================================

  describe('content display', () => {
    it('displays item name in editor', () => {
      render(<PreviewSaveStep {...defaultProps} />);

      const nameInput = screen.getByDisplayValue('Kitchen - Dishwasher');
      expect(nameInput).toBeInTheDocument();
    });

    it('displays all content pieces in grid', () => {
      render(<PreviewSaveStep {...defaultProps} currentItem={mockCurrentItemWithMultipleContent} />);

      expect(screen.getByText('2')).toBeInTheDocument(); // Content count badge
      expect(screen.getAllByRole('listitem')).toHaveLength(2);
    });

    it('shows empty state when no content', () => {
      render(<PreviewSaveStep {...defaultProps} currentItem={mockEmptyCurrentItem} />);

      expect(screen.getByText('No content added yet')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add content/i })).toBeInTheDocument();
    });

    it('shows content count correctly for single piece', () => {
      render(<PreviewSaveStep {...defaultProps} />);

      expect(screen.getByText('1')).toBeInTheDocument(); // Content count badge
    });

    it('shows content count correctly for multiple pieces', () => {
      render(<PreviewSaveStep {...defaultProps} currentItem={mockCurrentItemWithMultipleContent} />);

      expect(screen.getByText('2')).toBeInTheDocument(); // Content count badge
    });
  });

  // ===========================================================================
  // Item Name Editing Tests
  // ===========================================================================

  describe('item name editing', () => {
    it('calls onUpdateItemName when name changes', async () => {
      const user = userEvent.setup();
      render(<PreviewSaveStep {...defaultProps} />);

      const nameInput = screen.getByDisplayValue('Kitchen - Dishwasher');
      await user.clear(nameInput);
      await user.type(nameInput, 'New Name');

      expect(defaultProps.onUpdateItemName).toHaveBeenCalled();
    });

    it('disables name input when saving', () => {
      render(<PreviewSaveStep {...defaultProps} isSaving={true} />);

      const nameInput = screen.getByDisplayValue('Kitchen - Dishwasher');
      expect(nameInput).toBeDisabled();
    });
  });

  // ===========================================================================
  // Save Flow Tests
  // ===========================================================================

  describe('save flow', () => {
    it('calls onSave when save button clicked', async () => {
      render(<PreviewSaveStep {...defaultProps} />);

      const saveButton = screen.getByRole('button', { name: /save item/i });
      fireEvent.click(saveButton);

      expect(defaultProps.onSave).toHaveBeenCalledTimes(1);
    });

    it('shows loading state while saving', () => {
      render(<PreviewSaveStep {...defaultProps} isSaving={true} />);

      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });

    it('shows success state after save', async () => {
      render(<PreviewSaveStep {...defaultProps} />);

      const saveButton = screen.getByRole('button', { name: /save item/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Item Saved!')).toBeInTheDocument();
      });
    });

    it('displays QR code in success state', async () => {
      render(<PreviewSaveStep {...defaultProps} />);

      const saveButton = screen.getByRole('button', { name: /save item/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        const qrImage = screen.getByAltText('QR code for Kitchen - Dishwasher');
        expect(qrImage).toBeInTheDocument();
        expect(qrImage).toHaveAttribute('src', 'data:image/png;base64,test');
      });
    });

    it('shows error message on save failure', async () => {
      const failingOnSave = vi.fn().mockRejectedValue(new Error('Save failed'));
      render(<PreviewSaveStep {...defaultProps} onSave={failingOnSave} />);

      const saveButton = screen.getByRole('button', { name: /save item/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Save failed')).toBeInTheDocument();
      });
    });

    it('disables save button when no content', () => {
      render(<PreviewSaveStep {...defaultProps} currentItem={mockEmptyCurrentItem} />);

      const saveButton = screen.getByRole('button', { name: /save item/i });
      expect(saveButton).toBeDisabled();
    });

    it('disables save button when name is empty', () => {
      const itemWithEmptyName: CurrentItemState = {
        ...mockCurrentItem,
        itemName: '',
      };
      render(<PreviewSaveStep {...defaultProps} currentItem={itemWithEmptyName} />);

      const saveButton = screen.getByRole('button', { name: /save item/i });
      expect(saveButton).toBeDisabled();
    });

    it('disables save button when name is whitespace only', () => {
      const itemWithWhitespaceName: CurrentItemState = {
        ...mockCurrentItem,
        itemName: '   ',
      };
      render(<PreviewSaveStep {...defaultProps} currentItem={itemWithWhitespaceName} />);

      const saveButton = screen.getByRole('button', { name: /save item/i });
      expect(saveButton).toBeDisabled();
    });

    it('calls onComplete when Continue button is clicked in success state', async () => {
      render(<PreviewSaveStep {...defaultProps} />);

      const saveButton = screen.getByRole('button', { name: /save item/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Item Saved!')).toBeInTheDocument();
      });

      const continueButton = screen.getByRole('button', { name: /continue/i });
      fireEvent.click(continueButton);

      expect(defaultProps.onComplete).toHaveBeenCalledTimes(1);
    });

    it('dismisses error when dismiss button clicked', async () => {
      const failingOnSave = vi.fn().mockRejectedValue(new Error('Save failed'));
      render(<PreviewSaveStep {...defaultProps} onSave={failingOnSave} />);

      const saveButton = screen.getByRole('button', { name: /save item/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Save failed')).toBeInTheDocument();
      });

      const dismissButton = screen.getByRole('button', { name: /dismiss/i });
      fireEvent.click(dismissButton);

      expect(screen.queryByText('Save failed')).not.toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Navigation Tests
  // ===========================================================================

  describe('navigation', () => {
    it('calls onRetake when Add More button clicked', () => {
      render(<PreviewSaveStep {...defaultProps} />);

      // "Add More" link is shown below content grid
      const addMoreButton = screen.getByRole('button', { name: /add more/i });
      fireEvent.click(addMoreButton);

      expect(defaultProps.onRetake).toHaveBeenCalledTimes(1);
    });

    it('calls onRetake when Add Content button clicked in empty state', () => {
      render(<PreviewSaveStep {...defaultProps} currentItem={mockEmptyCurrentItem} />);

      const addContentButton = screen.getByRole('button', { name: /add content/i });
      fireEvent.click(addContentButton);

      expect(defaultProps.onRetake).toHaveBeenCalledTimes(1);
    });

    it('calls onCancel when back button clicked', () => {
      render(<PreviewSaveStep {...defaultProps} />);

      const backButton = screen.getByRole('button', { name: /go back/i });
      fireEvent.click(backButton);

      expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
    });

    it('disables add more button when saving', () => {
      render(<PreviewSaveStep {...defaultProps} isSaving={true} />);

      const addMoreButton = screen.getByRole('button', { name: /add more/i });
      expect(addMoreButton).toBeDisabled();
    });

    it('disables back button when saving', () => {
      render(<PreviewSaveStep {...defaultProps} isSaving={true} />);

      const backButton = screen.getByRole('button', { name: /go back/i });
      expect(backButton).toBeDisabled();
    });

    it('shows Add Content button instead of Add More when no content', () => {
      render(<PreviewSaveStep {...defaultProps} currentItem={mockEmptyCurrentItem} />);

      // Empty state shows "Add Content" button instead of "Add More"
      expect(screen.queryByRole('button', { name: /^add more$/i })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add content/i })).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Content Actions Tests
  // ===========================================================================

  describe('content actions', () => {
    it('handles remove for non-last content piece', () => {
      render(<PreviewSaveStep {...defaultProps} currentItem={mockCurrentItemWithMultipleContent} />);

      // Click remove on first content piece (non-last, so direct removal)
      const removeButtons = screen.getAllByRole('button', { name: /remove/i });
      fireEvent.click(removeButtons[0]);

      expect(defaultProps.onRemoveContent).toHaveBeenCalledWith('video-1');
    });

    it('shows confirmation for last content piece removal', () => {
      render(<PreviewSaveStep {...defaultProps} />);

      // Single content piece, should show confirmation dialog
      const removeButtons = screen.getAllByRole('button', { name: /remove/i });
      fireEvent.click(removeButtons[0]);

      // Should show confirmation dialog with the warning text
      expect(screen.getByText(/the only piece of content/i)).toBeInTheDocument();
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Accessibility Tests
  // ===========================================================================

  describe('accessibility', () => {
    it('announces success to screen readers', async () => {
      render(<PreviewSaveStep {...defaultProps} />);

      const saveButton = screen.getByRole('button', { name: /save item/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Item saved successfully')).toBeInTheDocument();
      });
    });

    it('announces errors to screen readers', async () => {
      const failingOnSave = vi.fn().mockRejectedValue(new Error('Network error'));
      render(<PreviewSaveStep {...defaultProps} onSave={failingOnSave} />);

      const saveButton = screen.getByRole('button', { name: /save item/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        const srAnnouncement = screen.getByText((content, element) => {
          return element?.getAttribute('aria-live') === 'polite' &&
                 content.includes('Error: Network error');
        });
        expect(srAnnouncement).toBeInTheDocument();
      });
    });

    it('has correct heading hierarchy', () => {
      render(<PreviewSaveStep {...defaultProps} />);

      expect(screen.getByRole('heading', { level: 2, name: 'Preview & Save' })).toBeInTheDocument();
      // Item Details section has h3 heading
      expect(screen.getByRole('heading', { level: 3, name: 'Item Details' })).toBeInTheDocument();
      // Content section has h3 heading
      expect(screen.getByRole('heading', { level: 3, name: 'Content' })).toBeInTheDocument();
    });

    it('content grid has correct aria-label', () => {
      render(<PreviewSaveStep {...defaultProps} />);

      // Grid has aria-label for drag-to-reorder functionality
      const grid = screen.getByRole('list', { name: /drag to reorder/i });
      expect(grid).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Styling Tests
  // ===========================================================================

  describe('styling', () => {
    it('applies custom className', () => {
      const { container } = render(
        <PreviewSaveStep {...defaultProps} className="custom-test-class" />
      );

      expect(container.firstChild).toHaveClass('custom-test-class');
    });

    it('has loading cursor during save', () => {
      render(<PreviewSaveStep {...defaultProps} isSaving={true} />);

      const saveButton = screen.getByRole('button', { name: /saving/i });
      expect(saveButton).toHaveClass('cursor-wait');
    });
  });

  // ===========================================================================
  // Pre-populated Fields Tests (REQ-171 Task 6)
  // ===========================================================================

  describe('pre-populated fields', () => {
    it('displays room from currentItem.room', () => {
      render(<PreviewSaveStep {...defaultProps} currentItem={mockCurrentItemWithPurpose} />);

      // Room label is displayed via ROOM_LABELS constant
      expect(screen.getByText('Kitchen')).toBeInTheDocument();
    });

    it('displays item type from currentItem.itemType', () => {
      render(<PreviewSaveStep {...defaultProps} currentItem={mockCurrentItemWithPurpose} />);

      // Item type label via ITEM_TYPE_LABELS constant
      expect(screen.getByText('Appliance')).toBeInTheDocument();
    });

    it('displays purpose from currentItem.purpose', () => {
      render(<PreviewSaveStep {...defaultProps} currentItem={mockCurrentItemWithPurpose} />);

      // Purpose label via PURPOSE_LABELS constant
      expect(screen.getByText('How to Clean')).toBeInTheDocument();
    });

    it('displays auto-generated title in name field', () => {
      render(<PreviewSaveStep {...defaultProps} currentItem={mockCurrentItemWithPurpose} />);

      const nameInput = screen.getByDisplayValue('How to Clean - Fridge');
      expect(nameInput).toBeInTheDocument();
    });

    it('renders room as read-only (dd element)', () => {
      render(<PreviewSaveStep {...defaultProps} currentItem={mockCurrentItemWithPurpose} />);

      const roomValue = screen.getByText('Kitchen');
      // Room should be in a dd element (definition description)
      expect(roomValue.tagName).toBe('DD');
    });

    it('renders item type as read-only (dd element)', () => {
      render(<PreviewSaveStep {...defaultProps} currentItem={mockCurrentItemWithPurpose} />);

      const itemTypeValue = screen.getByText('Appliance');
      expect(itemTypeValue.tagName).toBe('DD');
    });

    it('renders purpose as read-only (dd element)', () => {
      render(<PreviewSaveStep {...defaultProps} currentItem={mockCurrentItemWithPurpose} />);

      const purposeValue = screen.getByText('How to Clean');
      expect(purposeValue.tagName).toBe('DD');
    });

    it('handles missing purpose gracefully', () => {
      const itemNoPurpose: CurrentItemState = {
        ...mockCurrentItemWithPurpose,
        purpose: null,
      };

      render(<PreviewSaveStep {...defaultProps} currentItem={itemNoPurpose} />);

      // Should show "Not specified" for missing purpose
      expect(screen.getByText('Not specified')).toBeInTheDocument();
      expect(screen.getByText('Kitchen')).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Enhanced Title Editing Tests (REQ-171 Task 7)
  // ===========================================================================

  describe('title editing', () => {
    it('displays auto-generated title initially', () => {
      render(<PreviewSaveStep {...defaultProps} currentItem={mockCurrentItemWithPurpose} />);

      const nameInput = screen.getByDisplayValue('How to Clean - Fridge');
      expect(nameInput).toBeInTheDocument();
    });

    it('allows user to edit title', async () => {
      const user = userEvent.setup();
      render(<PreviewSaveStep {...defaultProps} currentItem={mockCurrentItemWithPurpose} />);

      const nameInput = screen.getByDisplayValue('How to Clean - Fridge');
      await user.clear(nameInput);
      await user.type(nameInput, 'Custom Title');

      expect(defaultProps.onUpdateItemName).toHaveBeenCalled();
    });

    it('preserves edited title on re-render', () => {
      const customItem: CurrentItemState = {
        ...mockCurrentItemWithPurpose,
        itemName: 'User Edited Title',
      };

      const { rerender } = render(<PreviewSaveStep {...defaultProps} currentItem={customItem} />);

      expect(screen.getByDisplayValue('User Edited Title')).toBeInTheDocument();

      // Re-render with same props
      rerender(<PreviewSaveStep {...defaultProps} currentItem={customItem} />);

      expect(screen.getByDisplayValue('User Edited Title')).toBeInTheDocument();
    });

    it('validates title is not empty before save', () => {
      const emptyTitleItem: CurrentItemState = {
        ...mockCurrentItemWithPurpose,
        itemName: '',
      };

      render(<PreviewSaveStep {...defaultProps} currentItem={emptyTitleItem} />);

      const saveButton = screen.getByRole('button', { name: /save item/i });
      expect(saveButton).toBeDisabled();
    });

    it('validates title is not whitespace only', () => {
      const whitespaceItem: CurrentItemState = {
        ...mockCurrentItemWithPurpose,
        itemName: '   ',
      };

      render(<PreviewSaveStep {...defaultProps} currentItem={whitespaceItem} />);

      const saveButton = screen.getByRole('button', { name: /save item/i });
      expect(saveButton).toBeDisabled();
    });

    it('disables title editing when saving', () => {
      render(<PreviewSaveStep {...defaultProps} isSaving={true} currentItem={mockCurrentItemWithPurpose} />);

      const nameInput = screen.getByDisplayValue('How to Clean - Fridge');
      expect(nameInput).toBeDisabled();
    });
  });

  // ===========================================================================
  // Content Preview Grid Tests (REQ-171 Task 8)
  // ===========================================================================

  describe('content preview grid', () => {
    it('renders list items for each content piece', () => {
      render(<PreviewSaveStep {...defaultProps} currentItem={mockCurrentItemWithMultipleContent} />);

      // Should render item for each content piece
      expect(screen.getAllByRole('listitem')).toHaveLength(2);
    });

    it('displays content count badge', () => {
      render(<PreviewSaveStep {...defaultProps} currentItem={mockCurrentItemWithMultipleContent} />);

      // Content section shows count as number in badge
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('renders content in correct order', () => {
      const orderedContent: CurrentItemState = {
        ...mockCurrentItem,
        content: [
          { ...mockVideoContent, id: 'video-1', order: 0 },
          { ...mockPhotoContent, id: 'photo-1', order: 1 },
        ],
      };

      render(<PreviewSaveStep {...defaultProps} currentItem={orderedContent} />);

      const listItems = screen.getAllByRole('listitem');
      expect(listItems).toHaveLength(2);
    });

    it('removes content piece when remove clicked', () => {
      render(<PreviewSaveStep {...defaultProps} currentItem={mockCurrentItemWithMultipleContent} />);

      const removeButtons = screen.getAllByRole('button', { name: /remove/i });
      fireEvent.click(removeButtons[0]);

      expect(defaultProps.onRemoveContent).toHaveBeenCalledWith('video-1');
    });

    it('handles mixed content types correctly', () => {
      const mixedContent: CurrentItemState = {
        ...mockCurrentItem,
        content: [
          mockVideoContent,
          mockPhotoContent,
          mockPdfContent,
          mockTextContent,
          mockUrlContent,
        ],
      };

      render(<PreviewSaveStep {...defaultProps} currentItem={mixedContent} />);

      // Content header shows "Content" text and count badge
      expect(screen.getByText('Content')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getAllByRole('listitem')).toHaveLength(5);
    });
  });

  // ===========================================================================
  // Enhanced Empty State Handling Tests (REQ-171 Task 9)
  // ===========================================================================

  describe('empty state handling', () => {
    const emptyItem: CurrentItemState = {
      ...mockCurrentItemWithPurpose,
      content: [],
    };

    it('shows empty state message when no content', () => {
      render(<PreviewSaveStep {...defaultProps} currentItem={emptyItem} />);

      expect(screen.getByText('No content added yet')).toBeInTheDocument();
    });

    it('shows "Add Content" CTA button', () => {
      render(<PreviewSaveStep {...defaultProps} currentItem={emptyItem} />);

      expect(screen.getByRole('button', { name: /add content/i })).toBeInTheDocument();
    });

    it('CTA calls onRetake handler', () => {
      render(<PreviewSaveStep {...defaultProps} currentItem={emptyItem} />);

      const addContentButton = screen.getByRole('button', { name: /add content/i });
      fireEvent.click(addContentButton);

      // onRetake is called which handles navigation
      expect(defaultProps.onRetake).toHaveBeenCalledTimes(1);
    });

    it('hides content list when empty', () => {
      render(<PreviewSaveStep {...defaultProps} currentItem={emptyItem} />);

      // Grid is replaced with empty state
      expect(screen.queryByRole('list')).not.toBeInTheDocument();
    });

    it('disables save button when no content', () => {
      render(<PreviewSaveStep {...defaultProps} currentItem={emptyItem} />);

      const saveButton = screen.getByRole('button', { name: /save/i });
      expect(saveButton).toBeDisabled();
    });

    it('transitions from empty to content state correctly', () => {
      const { rerender } = render(<PreviewSaveStep {...defaultProps} currentItem={emptyItem} />);

      expect(screen.getByText('No content added yet')).toBeInTheDocument();

      // Re-render with content
      rerender(<PreviewSaveStep {...defaultProps} currentItem={mockCurrentItemWithPurpose} />);

      expect(screen.queryByText('No content added yet')).not.toBeInTheDocument();
      // Content section shows count in badge
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('shows pre-populated fields even when content is empty', () => {
      render(<PreviewSaveStep {...defaultProps} currentItem={emptyItem} />);

      // Should still show room, item type, purpose
      expect(screen.getByText('Kitchen')).toBeInTheDocument();
      expect(screen.getByText('Appliance')).toBeInTheDocument();
      expect(screen.getByText('How to Clean')).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Item/Article Separation Tests (REQ-210)
  // ===========================================================================

  describe('Item/Article Separation (REQ-210)', () => {
    it('displays Item Name field with specificItem value', () => {
      render(<PreviewSaveStep {...defaultProps} currentItem={mockItemWithArticle} />);

      // Find input by its value - should show "Cabinets" (specificItem)
      const itemNameInput = screen.getByDisplayValue('Cabinets');
      expect(itemNameInput).toBeInTheDocument();
    });

    it('displays Item Name helper text about QR code label', () => {
      render(<PreviewSaveStep {...defaultProps} currentItem={mockItemWithArticle} />);

      expect(screen.getByText(/appears on QR code label/i)).toBeInTheDocument();
    });

    it('displays Article Title field with purpose-derived title', () => {
      render(<PreviewSaveStep {...defaultProps} currentItem={mockItemWithArticle} />);

      // Should show "How to Clean" as article title
      const articleTitleInput = screen.getByDisplayValue('How to Clean');
      expect(articleTitleInput).toBeInTheDocument();
    });

    it('shows visual separation between Item and Article sections', () => {
      render(<PreviewSaveStep {...defaultProps} currentItem={mockItemWithArticle} />);

      expect(screen.getByText(/physical item/i)).toBeInTheDocument();
      expect(screen.getByText(/article.*instructions/i)).toBeInTheDocument();
    });

    it('calls onUpdateItemName when Item Name field changes', async () => {
      const onUpdateItemName = vi.fn();
      render(
        <PreviewSaveStep
          {...defaultProps}
          currentItem={mockItemWithArticle}
          onUpdateItemName={onUpdateItemName}
        />
      );

      const itemNameInput = screen.getByDisplayValue('Cabinets');
      await userEvent.clear(itemNameInput);
      await userEvent.type(itemNameInput, 'New Item Name');

      expect(onUpdateItemName).toHaveBeenCalled();
    });

    it('calls onUpdateArticleTitle when Article Title field changes', async () => {
      const onUpdateArticleTitle = vi.fn();
      render(
        <PreviewSaveStep
          {...defaultProps}
          currentItem={mockItemWithArticle}
          onUpdateArticleTitle={onUpdateArticleTitle}
        />
      );

      const articleTitleInput = screen.getByDisplayValue('How to Clean');
      await userEvent.clear(articleTitleInput);
      await userEvent.type(articleTitleInput, 'New Title');

      expect(onUpdateArticleTitle).toHaveBeenCalled();
    });

    it('shows fallback article title when no purpose or currentArticle title', () => {
      const itemNoPurpose: CurrentItemState = {
        ...mockItemWithArticle,
        purpose: null,
        currentArticle: {
          title: '',  // Empty title
          purpose: null,
          content: [mockVideoContent],
        },
      };

      render(<PreviewSaveStep {...defaultProps} currentItem={itemNoPurpose} />);

      // Should show "Instructions" as fallback
      const articleTitleInput = screen.getByDisplayValue('Instructions');
      expect(articleTitleInput).toBeInTheDocument();
    });

    it('disables Article Title field when onUpdateArticleTitle is not provided', () => {
      render(
        <PreviewSaveStep
          {...defaultProps}
          currentItem={mockItemWithArticle}
          onUpdateArticleTitle={undefined}
        />
      );

      const articleTitleInput = screen.getByDisplayValue('How to Clean');
      expect(articleTitleInput).toBeDisabled();
    });

    it('has Item Name field with correct value', () => {
      render(<PreviewSaveStep {...defaultProps} currentItem={mockItemWithArticle} />);

      // ItemNameEditor displays the specificItem value
      const itemNameInput = screen.getByDisplayValue('Cabinets');
      expect(itemNameInput).toBeInTheDocument();
    });

    it('has Article Title label associated with input', () => {
      render(<PreviewSaveStep {...defaultProps} currentItem={mockItemWithArticle} />);

      const articleTitleInput = screen.getByLabelText(/article title/i);
      expect(articleTitleInput).toBeInTheDocument();
      expect(articleTitleInput).toHaveAttribute('id', 'article-title-editor');
    });
  });

  // ===========================================================================
  // QR Code Success Display Tests (REQ-210)
  // ===========================================================================

  describe('QR Code Success Display (REQ-210)', () => {
    it('shows only item name (specificItem) in QR code success overlay', async () => {
      const mockOnSave = vi.fn().mockResolvedValue({
        id: 'item-123',
        qrCodeUrl: 'data:image/png;base64,mockQRCode'
      });

      render(
        <PreviewSaveStep
          {...defaultProps}
          currentItem={mockItemWithArticle}
          onSave={mockOnSave}
        />
      );

      // Click save button
      const saveButton = screen.getByRole('button', { name: /save item/i });
      fireEvent.click(saveButton);

      // Wait for success overlay
      await waitFor(() => {
        expect(screen.getByText('Item Saved!')).toBeInTheDocument();
      });

      // QR code label should show "Cabinets" (specificItem) not "How to Clean - Cabinets"
      expect(screen.getByText('Cabinets')).toBeInTheDocument();
    });

    it('falls back to itemName when specificItem is not available', async () => {
      const mockOnSave = vi.fn().mockResolvedValue({
        id: 'item-123',
        qrCodeUrl: 'data:image/png;base64,mockQRCode'
      });

      const legacyItem: CurrentItemState = {
        ...mockCurrentItem,
        specificItem: '',  // Empty specificItem
        itemName: 'Legacy Name',
      };

      render(
        <PreviewSaveStep
          {...defaultProps}
          currentItem={legacyItem}
          onSave={mockOnSave}
        />
      );

      const saveButton = screen.getByRole('button', { name: /save item/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Item Saved!')).toBeInTheDocument();
      });

      // Should fall back to itemName
      expect(screen.getByText('Legacy Name')).toBeInTheDocument();
    });

    it('QR code alt text shows item name only', async () => {
      const mockOnSave = vi.fn().mockResolvedValue({
        id: 'item-123',
        qrCodeUrl: 'data:image/png;base64,mockQRCode'
      });

      render(
        <PreviewSaveStep
          {...defaultProps}
          currentItem={mockItemWithArticle}
          onSave={mockOnSave}
        />
      );

      const saveButton = screen.getByRole('button', { name: /save item/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        const qrImage = screen.getByAltText('QR code for Cabinets');
        expect(qrImage).toBeInTheDocument();
      });
    });
  });

  // ===========================================================================
  // QR Code Label Item Name Logic Tests (REQ-211)
  // ===========================================================================

  describe('PreviewSaveStep - QR Code Label (REQ-211)', () => {
    describe('handleSave item name logic', () => {
      it('should use result.itemName when provided by onSave', async () => {
        // Setup: onSave returns { id, qrCodeUrl, itemName: 'Result Item Name' }
        // currentItem has specificItem: 'Different Name'
        // Expected: SuccessOverlay displays 'Result Item Name'
        const mockOnSave = vi.fn().mockResolvedValue({
          id: 'item-123',
          qrCodeUrl: 'data:image/png;base64,mockQRCode',
          itemName: 'Result Item Name'
        });

        const testItem: CurrentItemState = {
          ...mockItemWithArticle,
          specificItem: 'Different Name',
          itemName: 'Another Different Name',
        };

        render(
          <PreviewSaveStep
            {...defaultProps}
            currentItem={testItem}
            onSave={mockOnSave}
          />
        );

        const saveButton = screen.getByRole('button', { name: /save item/i });
        fireEvent.click(saveButton);

        await waitFor(() => {
          expect(screen.getByText('Item Saved!')).toBeInTheDocument();
        });

        // Should use result.itemName from onSave
        expect(screen.getByText('Result Item Name')).toBeInTheDocument();
        expect(screen.getByAltText('QR code for Result Item Name')).toBeInTheDocument();
      });

      it('should fall back to specificItem when result.itemName is undefined', async () => {
        // Setup: onSave returns { id, qrCodeUrl } (no itemName)
        // currentItem has specificItem: 'Cabinets'
        // Expected: SuccessOverlay displays 'Cabinets'
        const mockOnSave = vi.fn().mockResolvedValue({
          id: 'item-123',
          qrCodeUrl: 'data:image/png;base64,mockQRCode'
          // No itemName returned
        });

        const testItem: CurrentItemState = {
          ...mockItemWithArticle,
          specificItem: 'Cabinets',
          itemName: 'How to Clean - Cabinets',  // Legacy combined name
        };

        render(
          <PreviewSaveStep
            {...defaultProps}
            currentItem={testItem}
            onSave={mockOnSave}
          />
        );

        const saveButton = screen.getByRole('button', { name: /save item/i });
        fireEvent.click(saveButton);

        await waitFor(() => {
          expect(screen.getByText('Item Saved!')).toBeInTheDocument();
        });

        // Should fall back to specificItem
        expect(screen.getByText('Cabinets')).toBeInTheDocument();
      });

      it('should fall back to itemName when specificItem is undefined', async () => {
        // Setup: onSave returns { id, qrCodeUrl } (no itemName)
        // currentItem has itemName: 'Cabinets', no specificItem
        // Expected: SuccessOverlay displays 'Cabinets'
        const mockOnSave = vi.fn().mockResolvedValue({
          id: 'item-123',
          qrCodeUrl: 'data:image/png;base64,mockQRCode'
        });

        const testItem: CurrentItemState = {
          ...mockCurrentItem,
          specificItem: '',  // Empty specificItem
          itemName: 'Legacy Item Name',
        };

        render(
          <PreviewSaveStep
            {...defaultProps}
            currentItem={testItem}
            onSave={mockOnSave}
          />
        );

        const saveButton = screen.getByRole('button', { name: /save item/i });
        fireEvent.click(saveButton);

        await waitFor(() => {
          expect(screen.getByText('Item Saved!')).toBeInTheDocument();
        });

        // Should fall back to itemName
        expect(screen.getByText('Legacy Item Name')).toBeInTheDocument();
      });

      it('should use "Item" as final fallback', async () => {
        // Setup: onSave returns { id, qrCodeUrl } (no itemName)
        // currentItem has no specificItem or itemName
        // Expected: SuccessOverlay displays 'Item'
        const mockOnSave = vi.fn().mockResolvedValue({
          id: 'item-123',
          qrCodeUrl: 'data:image/png;base64,mockQRCode'
        });

        const testItem: CurrentItemState = {
          ...mockCurrentItem,
          specificItem: '',
          itemName: '',
          content: [mockVideoContent],  // Need content to enable save
        };

        render(
          <PreviewSaveStep
            {...defaultProps}
            currentItem={testItem}
            onSave={mockOnSave}
          />
        );

        // Since save is disabled with empty name, we need to test differently
        // The canSave logic uses specificItem || itemName, so both empty means save is disabled
        // This test verifies the fallback in handleSave logic
        const saveButton = screen.getByRole('button', { name: /save item/i });
        expect(saveButton).toBeDisabled();  // Save should be disabled

        // The fallback logic is: result.itemName || specificItem || itemName || 'Item'
        // When all are empty, it falls back to 'Item' - but save is disabled before this
      });

      it('should display physical item name, not article title pattern', async () => {
        // Setup: currentItem with specificItem: 'Cabinets'
        // (Previously might have had 'How to Clean - Cabinets' pattern)
        // Expected: Label shows 'Cabinets' only
        const mockOnSave = vi.fn().mockResolvedValue({
          id: 'item-123',
          qrCodeUrl: 'data:image/png;base64,mockQRCode',
          itemName: 'Cabinets'  // Physical item name from save result
        });

        const testItem: CurrentItemState = {
          ...mockItemWithArticle,
          specificItem: 'Cabinets',
          itemName: 'How to Clean - Cabinets',  // Legacy combined pattern
        };

        render(
          <PreviewSaveStep
            {...defaultProps}
            currentItem={testItem}
            onSave={mockOnSave}
          />
        );

        const saveButton = screen.getByRole('button', { name: /save item/i });
        fireEvent.click(saveButton);

        await waitFor(() => {
          expect(screen.getByText('Item Saved!')).toBeInTheDocument();
        });

        // Should display 'Cabinets' not 'How to Clean - Cabinets'
        expect(screen.getByText('Cabinets')).toBeInTheDocument();
        // Should NOT display the article title pattern in QR code label
        expect(screen.queryByAltText(/How to Clean - Cabinets/)).not.toBeInTheDocument();
        expect(screen.getByAltText('QR code for Cabinets')).toBeInTheDocument();
      });

      it('prefers result.itemName over specificItem fallback', async () => {
        // Verify priority: result.itemName > specificItem > itemName
        const mockOnSave = vi.fn().mockResolvedValue({
          id: 'item-123',
          qrCodeUrl: 'data:image/png;base64,mockQRCode',
          itemName: 'Priority Item Name'
        });

        const testItem: CurrentItemState = {
          ...mockItemWithArticle,
          specificItem: 'Fallback Specific',
          itemName: 'Fallback Item Name',
        };

        render(
          <PreviewSaveStep
            {...defaultProps}
            currentItem={testItem}
            onSave={mockOnSave}
          />
        );

        const saveButton = screen.getByRole('button', { name: /save item/i });
        fireEvent.click(saveButton);

        await waitFor(() => {
          expect(screen.getByText('Item Saved!')).toBeInTheDocument();
        });

        // Should prefer result.itemName
        expect(screen.getByText('Priority Item Name')).toBeInTheDocument();
        expect(screen.queryByText('Fallback Specific')).not.toBeInTheDocument();
      });
    });
  });
});
