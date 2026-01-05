/**
 * PreviewSaveStep Component Tests
 *
 * @module ItemCreationWorkflow/components/steps/__tests__/PreviewSaveStep.test
 * @lastModified 2026-01-05
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PreviewSaveStep } from '../PreviewSaveStep';
import type { CurrentItemState, ContentPiece } from '../../../ItemCreationWorkflow.types';

// Mock URL.createObjectURL and revokeObjectURL
const mockCreateObjectURL = jest.fn(() => 'blob:test-url');
const mockRevokeObjectURL = jest.fn();

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
  contentSource: 'create-new',
  contentType: 'video',
  content: [mockVideoContent],
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

describe('PreviewSaveStep', () => {
  const defaultProps = {
    currentItem: mockCurrentItem,
    onUpdateItemName: jest.fn(),
    onRemoveContent: jest.fn(),
    onReorderContent: jest.fn(),
    onRetake: jest.fn(),
    onSave: jest.fn().mockResolvedValue({ id: 'item-1', qrCodeUrl: 'data:image/png;base64,test' }),
    onCancel: jest.fn(),
    onComplete: jest.fn(),
    isSaving: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
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

      expect(screen.getByText('Content (2 pieces)')).toBeInTheDocument();
      expect(screen.getAllByRole('listitem')).toHaveLength(2);
    });

    it('shows empty state when no content', () => {
      render(<PreviewSaveStep {...defaultProps} currentItem={mockEmptyCurrentItem} />);

      expect(screen.getByText('No content added yet')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add content/i })).toBeInTheDocument();
    });

    it('shows content count correctly for single piece', () => {
      render(<PreviewSaveStep {...defaultProps} />);

      expect(screen.getByText('Content (1 piece)')).toBeInTheDocument();
    });

    it('shows content count correctly for multiple pieces', () => {
      render(<PreviewSaveStep {...defaultProps} currentItem={mockCurrentItemWithMultipleContent} />);

      expect(screen.getByText('Content (2 pieces)')).toBeInTheDocument();
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
      const failingOnSave = jest.fn().mockRejectedValue(new Error('Save failed'));
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
      const failingOnSave = jest.fn().mockRejectedValue(new Error('Save failed'));
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
    it('calls onRetake when retake button clicked', () => {
      render(<PreviewSaveStep {...defaultProps} />);

      const retakeButton = screen.getByRole('button', { name: /retake \/ replace all/i });
      fireEvent.click(retakeButton);

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

    it('disables retake button when saving', () => {
      render(<PreviewSaveStep {...defaultProps} isSaving={true} />);

      const retakeButton = screen.getByRole('button', { name: /retake \/ replace all/i });
      expect(retakeButton).toBeDisabled();
    });

    it('disables back button when saving', () => {
      render(<PreviewSaveStep {...defaultProps} isSaving={true} />);

      const backButton = screen.getByRole('button', { name: /go back/i });
      expect(backButton).toBeDisabled();
    });

    it('hides retake all button when no content', () => {
      render(<PreviewSaveStep {...defaultProps} currentItem={mockEmptyCurrentItem} />);

      expect(screen.queryByRole('button', { name: /retake \/ replace all/i })).not.toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Content Actions Tests
  // ===========================================================================

  describe('content actions', () => {
    it('calls onRemoveContent when content card remove is clicked', () => {
      render(<PreviewSaveStep {...defaultProps} />);

      const removeButtons = screen.getAllByRole('button', { name: /remove content/i });
      fireEvent.click(removeButtons[0]);

      expect(defaultProps.onRemoveContent).toHaveBeenCalledWith('video-1');
    });

    it('calls onRetake when content card retake is clicked', () => {
      render(<PreviewSaveStep {...defaultProps} />);

      const retakeButtons = screen.getAllByRole('button', { name: /retake content/i });
      fireEvent.click(retakeButtons[0]);

      expect(defaultProps.onRetake).toHaveBeenCalledTimes(1);
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
      const failingOnSave = jest.fn().mockRejectedValue(new Error('Network error'));
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
      expect(screen.getByRole('heading', { level: 3, name: 'Item Name' })).toBeInTheDocument();
    });

    it('content grid has correct aria-label', () => {
      render(<PreviewSaveStep {...defaultProps} />);

      const grid = screen.getByRole('list', { name: 'Content pieces' });
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
});
