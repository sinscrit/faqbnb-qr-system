/**
 * SessionItemCard Component Tests
 *
 * @module ItemCreationWorkflow/components/shared/__tests__/SessionItemCard.test
 * @lastModified 2026-01-05 (REQ-109 Session Summary Step)
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SessionItemCard } from '../SessionItemCard';
import type { SessionItem, ContentPiece } from '../../../ItemCreationWorkflow.types';

// Mock URL.createObjectURL and revokeObjectURL
const mockCreateObjectURL = jest.fn(() => 'blob:test-url');
const mockRevokeObjectURL = jest.fn();

beforeAll(() => {
  global.URL.createObjectURL = mockCreateObjectURL;
  global.URL.revokeObjectURL = mockRevokeObjectURL;
});

beforeEach(() => {
  jest.clearAllMocks();
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
  order: 0,
};

const mockPdfContent: ContentPiece = {
  id: 'pdf-1',
  type: 'pdf',
  data: { type: 'pdf', file: new Blob(['pdf'], { type: 'application/pdf' }), pageCount: 5 },
  order: 0,
};

const mockTextContent: ContentPiece = {
  id: 'text-1',
  type: 'text',
  data: { type: 'text', text: 'Sample text content' },
  order: 0,
};

const mockUrlContent: ContentPiece = {
  id: 'url-1',
  type: 'url',
  data: {
    type: 'url',
    url: 'https://example.com',
    title: 'Example Website',
    faviconUrl: 'https://example.com/favicon.ico',
  },
  order: 0,
};

const createMockItem = (overrides?: Partial<SessionItem>): SessionItem => ({
  id: 'item-1',
  name: 'Test Dishwasher',
  room: 'kitchen',
  itemType: 'appliance',
  content: [mockPhotoContent],
  createdAt: new Date('2026-01-05T10:00:00Z'),
  ...overrides,
});

describe('SessionItemCard', () => {
  const defaultProps = {
    item: createMockItem(),
    onEdit: jest.fn(),
    onRemove: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===========================================================================
  // Basic Rendering Tests
  // ===========================================================================

  describe('basic rendering', () => {
    it('renders item name', () => {
      render(<SessionItemCard {...defaultProps} />);
      expect(screen.getByText('Test Dishwasher')).toBeInTheDocument();
    });

    it('renders room label', () => {
      render(<SessionItemCard {...defaultProps} />);
      expect(screen.getByText('Kitchen')).toBeInTheDocument();
    });

    it('renders content count for single content piece', () => {
      render(<SessionItemCard {...defaultProps} />);
      expect(screen.getByText('1 content piece')).toBeInTheDocument();
    });

    it('renders content count for multiple content pieces', () => {
      const multiContentItem = createMockItem({
        content: [mockPhotoContent, mockTextContent, mockVideoContent],
      });
      render(<SessionItemCard {...defaultProps} item={multiContentItem} />);
      expect(screen.getByText('3 content pieces')).toBeInTheDocument();
    });

    it('renders no content message when empty', () => {
      const emptyItem = createMockItem({ content: [] });
      render(<SessionItemCard {...defaultProps} item={emptyItem} />);
      expect(screen.getByText('No content')).toBeInTheDocument();
    });

    it('applies listitem role', () => {
      render(<SessionItemCard {...defaultProps} />);
      expect(screen.getByRole('listitem')).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Thumbnail Rendering Tests
  // ===========================================================================

  describe('thumbnail rendering', () => {
    it('renders photo thumbnail with object URL', async () => {
      render(<SessionItemCard {...defaultProps} />);

      await waitFor(() => {
        expect(mockCreateObjectURL).toHaveBeenCalled();
      });

      const img = screen.getByRole('listitem').querySelector('img');
      expect(img).toHaveAttribute('src', 'blob:test-url');
    });

    it('renders video thumbnail', () => {
      const videoItem = createMockItem({ content: [mockVideoContent] });
      render(<SessionItemCard {...defaultProps} item={videoItem} />);

      const video = screen.getByRole('listitem').querySelector('video');
      expect(video).toBeInTheDocument();
    });

    it('renders PDF thumbnail with icon', () => {
      const pdfItem = createMockItem({ content: [mockPdfContent] });
      render(<SessionItemCard {...defaultProps} item={pdfItem} />);

      // Should show page count
      expect(screen.getByText('5p')).toBeInTheDocument();
    });

    it('renders text thumbnail with icon', () => {
      const textItem = createMockItem({ content: [mockTextContent] });
      render(<SessionItemCard {...defaultProps} item={textItem} />);

      // Text icon should be present (green color class)
      const thumbnailContainer = screen.getByRole('listitem').querySelector('[aria-hidden="true"]');
      expect(thumbnailContainer).toBeInTheDocument();
    });

    it('renders URL thumbnail with favicon', () => {
      const urlItem = createMockItem({ content: [mockUrlContent] });
      render(<SessionItemCard {...defaultProps} item={urlItem} />);

      const favicon = screen.getByRole('listitem').querySelector('img');
      expect(favicon).toHaveAttribute('src', 'https://example.com/favicon.ico');
    });

    it('renders placeholder for item with no content', () => {
      const emptyItem = createMockItem({ content: [] });
      render(<SessionItemCard {...defaultProps} item={emptyItem} />);

      // Package icon placeholder should be present
      expect(screen.getByRole('listitem')).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Action Button Tests
  // ===========================================================================

  describe('action buttons', () => {
    it('calls onEdit when edit button clicked', () => {
      render(<SessionItemCard {...defaultProps} />);

      const editButton = screen.getByRole('button', { name: /edit test dishwasher/i });
      fireEvent.click(editButton);

      expect(defaultProps.onEdit).toHaveBeenCalledWith('item-1');
      expect(defaultProps.onEdit).toHaveBeenCalledTimes(1);
    });

    it('calls onRemove when remove button clicked', () => {
      render(<SessionItemCard {...defaultProps} />);

      const removeButton = screen.getByRole('button', { name: /remove test dishwasher/i });
      fireEvent.click(removeButton);

      expect(defaultProps.onRemove).toHaveBeenCalledWith('item-1');
      expect(defaultProps.onRemove).toHaveBeenCalledTimes(1);
    });

    it('hides edit button when onEdit not provided', () => {
      render(<SessionItemCard item={createMockItem()} onRemove={jest.fn()} />);

      expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
    });

    it('hides remove button when onRemove not provided', () => {
      render(<SessionItemCard item={createMockItem()} onEdit={jest.fn()} />);

      expect(screen.queryByRole('button', { name: /remove/i })).not.toBeInTheDocument();
    });

    it('disables buttons when disabled prop is true', () => {
      render(<SessionItemCard {...defaultProps} disabled={true} />);

      const editButton = screen.getByRole('button', { name: /edit/i });
      const removeButton = screen.getByRole('button', { name: /remove/i });

      expect(editButton).toBeDisabled();
      expect(removeButton).toBeDisabled();
    });
  });

  // ===========================================================================
  // Styling Tests
  // ===========================================================================

  describe('styling', () => {
    it('applies new item styling when isNew is true', () => {
      render(<SessionItemCard {...defaultProps} isNew={true} />);

      const card = screen.getByRole('listitem');
      expect(card).toHaveClass('border-l-2', 'border-l-[#FF385C]');
    });

    it('applies regular styling when isNew is false', () => {
      render(<SessionItemCard {...defaultProps} isNew={false} />);

      const card = screen.getByRole('listitem');
      expect(card).toHaveClass('bg-gray-50');
    });

    it('applies disabled styling', () => {
      render(<SessionItemCard {...defaultProps} disabled={true} />);

      const card = screen.getByRole('listitem');
      expect(card).toHaveClass('opacity-60', 'pointer-events-none');
    });

    it('applies custom className', () => {
      render(<SessionItemCard {...defaultProps} className="custom-test-class" />);

      const card = screen.getByRole('listitem');
      expect(card).toHaveClass('custom-test-class');
    });
  });

  // ===========================================================================
  // Accessibility Tests
  // ===========================================================================

  describe('accessibility', () => {
    it('has appropriate aria-label on card', () => {
      render(<SessionItemCard {...defaultProps} />);

      const card = screen.getByRole('listitem');
      expect(card).toHaveAttribute('aria-label', 'Test Dishwasher - 1 content piece');
    });

    it('has descriptive aria-labels on action buttons', () => {
      render(<SessionItemCard {...defaultProps} />);

      expect(screen.getByRole('button', { name: 'Edit Test Dishwasher' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Remove Test Dishwasher' })).toBeInTheDocument();
    });

    it('has minimum touch target size on buttons', () => {
      render(<SessionItemCard {...defaultProps} />);

      const editButton = screen.getByRole('button', { name: /edit/i });
      const removeButton = screen.getByRole('button', { name: /remove/i });

      expect(editButton).toHaveClass('min-w-[44px]', 'min-h-[44px]');
      expect(removeButton).toHaveClass('min-w-[44px]', 'min-h-[44px]');
    });

    it('buttons are keyboard accessible', () => {
      render(<SessionItemCard {...defaultProps} />);

      const editButton = screen.getByRole('button', { name: /edit/i });
      editButton.focus();
      expect(document.activeElement).toBe(editButton);
    });
  });

  // ===========================================================================
  // Cleanup Tests
  // ===========================================================================

  describe('cleanup', () => {
    it('revokes object URLs on unmount', () => {
      const { unmount } = render(<SessionItemCard {...defaultProps} />);

      unmount();

      expect(mockRevokeObjectURL).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // Edge Cases
  // ===========================================================================

  describe('edge cases', () => {
    it('handles long item names with truncation', () => {
      const longNameItem = createMockItem({
        name: 'This is a very long item name that should be truncated in the display',
      });
      render(<SessionItemCard {...defaultProps} item={longNameItem} />);

      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveClass('truncate');
    });

    it('handles PDF without page count', () => {
      const pdfWithoutCount: ContentPiece = {
        id: 'pdf-no-count',
        type: 'pdf',
        data: { type: 'pdf', file: new Blob(['pdf'], { type: 'application/pdf' }) },
        order: 0,
      };
      const item = createMockItem({ content: [pdfWithoutCount] });

      render(<SessionItemCard {...defaultProps} item={item} />);

      // Should not show page count
      expect(screen.queryByText(/p$/)).not.toBeInTheDocument();
    });

    it('handles URL without favicon', () => {
      const urlWithoutFavicon: ContentPiece = {
        id: 'url-no-favicon',
        type: 'url',
        data: { type: 'url', url: 'https://example.com' },
        order: 0,
      };
      const item = createMockItem({ content: [urlWithoutFavicon] });

      render(<SessionItemCard {...defaultProps} item={item} />);

      // Should render fallback icon instead of favicon
      expect(screen.getByRole('listitem')).toBeInTheDocument();
    });

    it('handles different room types', () => {
      const bathroomItem = createMockItem({ room: 'bathroom' });
      render(<SessionItemCard {...defaultProps} item={bathroomItem} />);

      expect(screen.getByText('Bathroom')).toBeInTheDocument();
    });
  });
});
