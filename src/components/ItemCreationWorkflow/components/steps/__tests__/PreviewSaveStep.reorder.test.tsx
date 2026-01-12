/**
 * PreviewSaveStep Content Reordering Tests
 *
 * Integration tests for drag-and-drop content reordering functionality
 * in the PreviewSaveStep component.
 *
 * @module ItemCreationWorkflow/components/steps/__tests__/PreviewSaveStep.reorder
 * @see docs/REQ-108-multi-content-item-support-detailed.md
 * @lastModified 2026-01-05
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PreviewSaveStep } from '../PreviewSaveStep';
import type { CurrentItemState, ContentPiece } from '../../../ItemCreationWorkflow.types';
import { MAX_CONTENT_PIECES } from '../../../utils/constants';

// Mock @dnd-kit modules
vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => <div data-testid="dnd-context">{children}</div>,
  closestCenter: vi.fn(),
  KeyboardSensor: vi.fn(),
  PointerSensor: vi.fn(),
  TouchSensor: vi.fn(),
  useSensor: vi.fn(() => ({})),
  useSensors: vi.fn(() => []),
  DragOverlay: ({ children }: { children: React.ReactNode }) => <div data-testid="drag-overlay">{children}</div>,
}));

vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => <div data-testid="sortable-context">{children}</div>,
  sortableKeyboardCoordinates: vi.fn(),
  rectSortingStrategy: {},
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
}));

vi.mock('@dnd-kit/modifiers', () => ({
  restrictToParentElement: {},
}));

// =============================================================================
// Test Helpers
// =============================================================================

const createMockContentPiece = (index: number, type: 'photo' | 'video' = 'photo'): ContentPiece => ({
  id: `content-${index}`,
  type,
  data: type === 'photo'
    ? { type: 'photo', file: new File([''], `test-${index}.jpg`, { type: 'image/jpeg' }) }
    : { type: 'video', file: new File([''], `test-${index}.mp4`, { type: 'video/mp4' }), duration: 30 },
  order: index,
});

const createMockItem = (contentCount: number): CurrentItemState => {
  const content = Array.from({ length: contentCount }, (_, i) => createMockContentPiece(i));
  return {
    room: 'kitchen',
    itemType: 'appliance',
    specificItem: 'Refrigerator',
    itemName: 'Kitchen - Refrigerator',
    currentArticle: {
      title: 'Instructions',
      purpose: null,
      content: content,
    },
    contentSource: 'existing',
    contentType: 'photo',
    content: content,
    tags: [],
  };
};

const defaultMockProps = {
  onUpdateItemName: vi.fn(),
  onUpdateArticleTitle: vi.fn(),
  onUpdateTags: vi.fn(),
  onRemoveContent: vi.fn(),
  onReorderContent: vi.fn(),
  onRetake: vi.fn(),
  onSave: vi.fn().mockResolvedValue({ id: 'item-1', qrCodeUrl: 'data:image/png;base64,...' }),
  onCancel: vi.fn(),
  onComplete: vi.fn(),
};

// =============================================================================
// Tests
// =============================================================================

describe('PreviewSaveStep Content Reordering', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('content display', () => {
    it('displays all content pieces', () => {
      render(
        <PreviewSaveStep
          currentItem={createMockItem(3)}
          {...defaultMockProps}
        />
      );
      expect(screen.getAllByRole('listitem')).toHaveLength(3);
    });

    it('displays correct number for single piece', () => {
      render(
        <PreviewSaveStep
          currentItem={createMockItem(1)}
          {...defaultMockProps}
        />
      );
      expect(screen.getAllByRole('listitem')).toHaveLength(1);
    });

    it('displays correct number at max pieces', () => {
      render(
        <PreviewSaveStep
          currentItem={createMockItem(MAX_CONTENT_PIECES)}
          {...defaultMockProps}
        />
      );
      expect(screen.getAllByRole('listitem')).toHaveLength(MAX_CONTENT_PIECES);
    });
  });

  describe('drag handle visibility', () => {
    it('shows drag handles when multiple content pieces exist', () => {
      render(
        <PreviewSaveStep
          currentItem={createMockItem(2)}
          {...defaultMockProps}
        />
      );
      expect(screen.getAllByLabelText('Drag to reorder')).toHaveLength(2);
    });

    it('hides drag handles when only one content piece', () => {
      render(
        <PreviewSaveStep
          currentItem={createMockItem(1)}
          {...defaultMockProps}
        />
      );
      expect(screen.queryByLabelText('Drag to reorder')).not.toBeInTheDocument();
    });
  });

  describe('content counter', () => {
    it('displays content counter with max limit', () => {
      render(
        <PreviewSaveStep
          currentItem={createMockItem(5)}
          {...defaultMockProps}
        />
      );
      expect(screen.getByText(`Content (5 of ${MAX_CONTENT_PIECES} pieces)`)).toBeInTheDocument();
    });

    it('updates counter when content count changes', () => {
      const { rerender } = render(
        <PreviewSaveStep
          currentItem={createMockItem(3)}
          {...defaultMockProps}
        />
      );
      expect(screen.getByText(`Content (3 of ${MAX_CONTENT_PIECES} pieces)`)).toBeInTheDocument();

      rerender(
        <PreviewSaveStep
          currentItem={createMockItem(5)}
          {...defaultMockProps}
        />
      );
      expect(screen.getByText(`Content (5 of ${MAX_CONTENT_PIECES} pieces)`)).toBeInTheDocument();
    });
  });

  describe('maximum reached indicator', () => {
    it('shows maximum reached message at limit', () => {
      render(
        <PreviewSaveStep
          currentItem={createMockItem(MAX_CONTENT_PIECES)}
          {...defaultMockProps}
        />
      );
      expect(screen.getByText('Maximum reached')).toBeInTheDocument();
    });

    it('hides maximum reached message below limit', () => {
      render(
        <PreviewSaveStep
          currentItem={createMockItem(MAX_CONTENT_PIECES - 1)}
          {...defaultMockProps}
        />
      );
      expect(screen.queryByText('Maximum reached')).not.toBeInTheDocument();
    });
  });

  describe('last piece removal confirmation', () => {
    it('shows confirmation dialog when removing last piece', async () => {
      const user = userEvent.setup();
      render(
        <PreviewSaveStep
          currentItem={createMockItem(1)}
          {...defaultMockProps}
        />
      );

      // Hover to reveal remove button
      const contentCard = screen.getByRole('listitem');
      await user.hover(contentCard);

      // Click remove
      const removeButton = screen.getByLabelText('Remove content');
      await user.click(removeButton);

      // Confirm dialog appears
      expect(screen.getByText('Remove Last Content?')).toBeInTheDocument();
      expect(screen.getByText(/This is the only piece of content/)).toBeInTheDocument();
    });

    it('closes dialog when Keep is clicked', async () => {
      const user = userEvent.setup();
      render(
        <PreviewSaveStep
          currentItem={createMockItem(1)}
          {...defaultMockProps}
        />
      );

      // Open dialog
      const contentCard = screen.getByRole('listitem');
      await user.hover(contentCard);
      await user.click(screen.getByLabelText('Remove content'));

      // Click Keep
      await user.click(screen.getByText('Keep'));

      // Dialog should close
      await waitFor(() => {
        expect(screen.queryByText('Remove Last Content?')).not.toBeInTheDocument();
      });

      // onRemoveContent should not be called
      expect(defaultMockProps.onRemoveContent).not.toHaveBeenCalled();
    });

    it('removes content when Remove is confirmed', async () => {
      const user = userEvent.setup();
      render(
        <PreviewSaveStep
          currentItem={createMockItem(1)}
          {...defaultMockProps}
        />
      );

      // Open dialog
      const contentCard = screen.getByRole('listitem');
      await user.hover(contentCard);
      await user.click(screen.getByLabelText('Remove content'));

      // Click Remove
      await user.click(screen.getByText('Remove'));

      // onRemoveContent should be called
      expect(defaultMockProps.onRemoveContent).toHaveBeenCalledWith('content-0');
    });

    it('removes content without confirmation for non-last pieces', async () => {
      const user = userEvent.setup();
      render(
        <PreviewSaveStep
          currentItem={createMockItem(2)}
          {...defaultMockProps}
        />
      );

      // Hover to reveal remove button
      const contentCards = screen.getAllByRole('listitem');
      await user.hover(contentCards[0]);

      // Click remove
      const removeButtons = screen.getAllByLabelText('Remove content');
      await user.click(removeButtons[0]);

      // Should call onRemoveContent directly
      expect(defaultMockProps.onRemoveContent).toHaveBeenCalledWith('content-0');

      // No confirmation dialog
      expect(screen.queryByText('Remove Last Content?')).not.toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('shows empty state when no content', () => {
      render(
        <PreviewSaveStep
          currentItem={createMockItem(0)}
          {...defaultMockProps}
        />
      );
      expect(screen.getByText('No content added yet')).toBeInTheDocument();
      expect(screen.getByText('Add Content')).toBeInTheDocument();
    });

    it('calls onRetake when Add Content is clicked', async () => {
      const user = userEvent.setup();
      render(
        <PreviewSaveStep
          currentItem={createMockItem(0)}
          {...defaultMockProps}
        />
      );

      await user.click(screen.getByText('Add Content'));
      expect(defaultMockProps.onRetake).toHaveBeenCalled();
    });
  });

  describe('disabled state', () => {
    it('disables drag handles during save', () => {
      render(
        <PreviewSaveStep
          currentItem={createMockItem(3)}
          isSaving={true}
          {...defaultMockProps}
        />
      );
      // When disabled, drag handles should not be shown
      expect(screen.queryByLabelText('Drag to reorder')).not.toBeInTheDocument();
    });
  });

  describe('DndContext integration', () => {
    it('renders DndContext wrapper', () => {
      render(
        <PreviewSaveStep
          currentItem={createMockItem(2)}
          {...defaultMockProps}
        />
      );
      expect(screen.getByTestId('dnd-context')).toBeInTheDocument();
    });

    it('renders SortableContext wrapper', () => {
      render(
        <PreviewSaveStep
          currentItem={createMockItem(2)}
          {...defaultMockProps}
        />
      );
      expect(screen.getByTestId('sortable-context')).toBeInTheDocument();
    });

    it('does not render drag contexts when empty', () => {
      render(
        <PreviewSaveStep
          currentItem={createMockItem(0)}
          {...defaultMockProps}
        />
      );
      expect(screen.queryByTestId('dnd-context')).not.toBeInTheDocument();
    });
  });
});
