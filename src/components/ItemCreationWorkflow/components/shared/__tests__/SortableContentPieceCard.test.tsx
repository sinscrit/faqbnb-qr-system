/**
 * SortableContentPieceCard Component Tests
 *
 * Unit tests for the sortable wrapper component that integrates
 * ContentPieceCard with @dnd-kit's useSortable hook.
 *
 * @module ItemCreationWorkflow/components/shared/__tests__/SortableContentPieceCard
 * @see docs/REQ-108-multi-content-item-support-detailed.md
 * @lastModified 2026-01-10 (REQ-169 vitest migration)
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SortableContentPieceCard } from '../SortableContentPieceCard';
import type { ContentPiece } from '../../../ItemCreationWorkflow.types';

// Mock @dnd-kit/sortable
const mockUseSortable = vi.fn();
vi.mock('@dnd-kit/sortable', () => ({
  useSortable: (args: unknown) => mockUseSortable(args),
}));

// Mock @dnd-kit/utilities
vi.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Transform: {
      toString: vi.fn((transform) =>
        transform ? `translate(${transform.x || 0}px, ${transform.y || 0}px)` : null
      ),
    },
  },
}));

// =============================================================================
// Test Data
// =============================================================================

const mockPhotoContent: ContentPiece = {
  id: 'test-photo-1',
  type: 'photo',
  data: {
    type: 'photo',
    file: new File([''], 'test.jpg', { type: 'image/jpeg' })
  },
  order: 0,
};

const mockVideoContent: ContentPiece = {
  id: 'test-video-1',
  type: 'video',
  data: {
    type: 'video',
    file: new File([''], 'test.mp4', { type: 'video/mp4' }),
    duration: 30,
  },
  order: 1,
};

// Default mock return value
const defaultUseSortableReturn = {
  attributes: { 'data-sortable': 'true' },
  listeners: { 'data-listeners': 'true' },
  setNodeRef: vi.fn(),
  transform: null,
  transition: null,
  isDragging: false,
};

// =============================================================================
// Tests
// =============================================================================

describe('SortableContentPieceCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSortable.mockReturnValue(defaultUseSortableReturn);
  });

  describe('rendering', () => {
    it('renders ContentPieceCard with content', () => {
      render(
        <SortableContentPieceCard
          id="test-1"
          content={mockPhotoContent}
          totalCount={2}
        />
      );
      expect(screen.getByRole('listitem')).toBeInTheDocument();
      expect(screen.getByText('Photo')).toBeInTheDocument();
    });

    it('renders with video content', () => {
      render(
        <SortableContentPieceCard
          id="test-1"
          content={mockVideoContent}
          totalCount={2}
        />
      );
      expect(screen.getByRole('listitem')).toBeInTheDocument();
      expect(screen.getByText('Video')).toBeInTheDocument();
    });

    it('passes correct id to useSortable', () => {
      render(
        <SortableContentPieceCard
          id="unique-id-123"
          content={mockPhotoContent}
          totalCount={2}
        />
      );
      expect(mockUseSortable).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'unique-id-123' })
      );
    });
  });

  describe('drag handle visibility', () => {
    it('shows drag handle when totalCount > 1', () => {
      render(
        <SortableContentPieceCard
          id="test-1"
          content={mockPhotoContent}
          totalCount={2}
        />
      );
      expect(screen.getByLabelText('Drag to reorder')).toBeInTheDocument();
    });

    it('hides drag handle when totalCount is 1', () => {
      render(
        <SortableContentPieceCard
          id="test-1"
          content={mockPhotoContent}
          totalCount={1}
        />
      );
      expect(screen.queryByLabelText('Drag to reorder')).not.toBeInTheDocument();
    });

    it('hides drag handle when totalCount is 0', () => {
      render(
        <SortableContentPieceCard
          id="test-1"
          content={mockPhotoContent}
          totalCount={0}
        />
      );
      expect(screen.queryByLabelText('Drag to reorder')).not.toBeInTheDocument();
    });

    it('hides drag handle when disabled, even with multiple items', () => {
      render(
        <SortableContentPieceCard
          id="test-1"
          content={mockPhotoContent}
          totalCount={5}
          disabled={true}
        />
      );
      expect(screen.queryByLabelText('Drag to reorder')).not.toBeInTheDocument();
    });
  });

  describe('disabled state', () => {
    it('passes disabled to useSortable', () => {
      render(
        <SortableContentPieceCard
          id="test-1"
          content={mockPhotoContent}
          totalCount={2}
          disabled={true}
        />
      );
      expect(mockUseSortable).toHaveBeenCalledWith(
        expect.objectContaining({ disabled: true })
      );
    });

    it('passes disabled=false to useSortable by default', () => {
      render(
        <SortableContentPieceCard
          id="test-1"
          content={mockPhotoContent}
          totalCount={2}
        />
      );
      expect(mockUseSortable).toHaveBeenCalledWith(
        expect.objectContaining({ disabled: false })
      );
    });
  });

  describe('dragging state', () => {
    it('applies reduced opacity when isDragging', () => {
      mockUseSortable.mockReturnValue({
        ...defaultUseSortableReturn,
        isDragging: true,
      });

      const { container } = render(
        <SortableContentPieceCard
          id="test-1"
          content={mockPhotoContent}
          totalCount={2}
        />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.style.opacity).toBe('0.5');
    });

    it('applies full opacity when not dragging', () => {
      mockUseSortable.mockReturnValue({
        ...defaultUseSortableReturn,
        isDragging: false,
      });

      const { container } = render(
        <SortableContentPieceCard
          id="test-1"
          content={mockPhotoContent}
          totalCount={2}
        />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.style.opacity).toBe('1');
    });

    it('applies elevated z-index when dragging', () => {
      mockUseSortable.mockReturnValue({
        ...defaultUseSortableReturn,
        isDragging: true,
      });

      const { container } = render(
        <SortableContentPieceCard
          id="test-1"
          content={mockPhotoContent}
          totalCount={2}
        />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.style.zIndex).toBe('10');
    });
  });

  describe('transform and transition', () => {
    it('applies transform from useSortable', () => {
      mockUseSortable.mockReturnValue({
        ...defaultUseSortableReturn,
        transform: { x: 100, y: 50 },
      });

      const { container } = render(
        <SortableContentPieceCard
          id="test-1"
          content={mockPhotoContent}
          totalCount={2}
        />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.style.transform).toBe('translate(100px, 50px)');
    });

    it('applies transition from useSortable', () => {
      mockUseSortable.mockReturnValue({
        ...defaultUseSortableReturn,
        transition: 'transform 200ms ease',
      });

      const { container } = render(
        <SortableContentPieceCard
          id="test-1"
          content={mockPhotoContent}
          totalCount={2}
        />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.style.transition).toBe('transform 200ms ease');
    });
  });

  describe('callbacks', () => {
    it('calls onRemove with correct id', async () => {
      const mockOnRemove = vi.fn();
      const user = await import('@testing-library/user-event');

      render(
        <SortableContentPieceCard
          id="test-1"
          content={mockPhotoContent}
          onRemove={mockOnRemove}
          totalCount={2}
        />
      );

      // Hover over the card to reveal actions
      const card = screen.getByRole('listitem');
      await user.default.hover(card);

      // Click remove button
      const removeButton = screen.getByLabelText('Remove content');
      await user.default.click(removeButton);

      expect(mockOnRemove).toHaveBeenCalledWith('test-photo-1');
    });

    it('calls onRetake with correct id', async () => {
      const mockOnRetake = vi.fn();
      const user = await import('@testing-library/user-event');

      render(
        <SortableContentPieceCard
          id="test-1"
          content={mockPhotoContent}
          onRetake={mockOnRetake}
          totalCount={2}
        />
      );

      // Hover over the card to reveal actions
      const card = screen.getByRole('listitem');
      await user.default.hover(card);

      // Click retake button
      const retakeButton = screen.getByLabelText('Retake content');
      await user.default.click(retakeButton);

      expect(mockOnRetake).toHaveBeenCalledWith('test-photo-1');
    });
  });
});
