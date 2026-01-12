/**
 * SessionSummaryStep Component Tests
 *
 * @module ItemCreationWorkflow/components/steps/__tests__/SessionSummaryStep.test
 * @lastModified 2026-01-05 (REQ-109 Session Summary Step)
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SessionSummaryStep } from '../SessionSummaryStep';
import type { SessionItem, ContentPiece } from '../../../ItemCreationWorkflow.types';

// Mock URL.createObjectURL and revokeObjectURL (needed for SessionItemCard thumbnails)
const mockCreateObjectURL = vi.fn(() => 'blob:test-url');
const mockRevokeObjectURL = vi.fn();

beforeAll(() => {
  global.URL.createObjectURL = mockCreateObjectURL;
  global.URL.revokeObjectURL = mockRevokeObjectURL;
});

beforeEach(() => {
  vi.clearAllMocks();
});

// =============================================================================
// Test Fixtures
// =============================================================================

const mockPhotoContent: ContentPiece = {
  id: 'photo-1',
  type: 'photo',
  data: { type: 'photo', file: new Blob(['image'], { type: 'image/jpeg' }) },
  order: 0,
};

const createMockSessionItem = (overrides?: Partial<SessionItem>): SessionItem => ({
  id: 'item-' + Math.random().toString(36).substr(2, 9),
  name: 'Test Item',
  room: 'kitchen',
  itemType: 'appliance',
  content: [mockPhotoContent],
  createdAt: new Date('2026-01-05T10:00:00Z'),
  ...overrides,
});

describe('SessionSummaryStep', () => {
  const defaultProps = {
    sessionItems: [
      createMockSessionItem({ id: 'item-1', name: 'Dishwasher' }),
      createMockSessionItem({ id: 'item-2', name: 'Refrigerator' }),
    ],
    existingItems: [],
    isLoadingExisting: false,
    onEditItem: vi.fn(),
    onRemoveItem: vi.fn(),
    onAddMoreItems: vi.fn(),
    onProceedToPrint: vi.fn(),
    onFinishWithoutPrint: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ===========================================================================
  // Basic Rendering Tests
  // ===========================================================================

  describe('basic rendering', () => {
    it('renders page title', () => {
      render(<SessionSummaryStep {...defaultProps} />);
      expect(screen.getByText('Session Summary')).toBeInTheDocument();
    });

    it('renders subtitle', () => {
      render(<SessionSummaryStep {...defaultProps} />);
      expect(screen.getByText('Review your items before printing')).toBeInTheDocument();
    });

    it('renders new items section heading with count', () => {
      render(<SessionSummaryStep {...defaultProps} />);
      expect(screen.getByText('New Items in This Session (2)')).toBeInTheDocument();
    });

    it('renders session progress bar', () => {
      render(<SessionSummaryStep {...defaultProps} />);
      // SessionProgressBar should be present
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('renders session items', () => {
      render(<SessionSummaryStep {...defaultProps} />);
      expect(screen.getByText('Dishwasher')).toBeInTheDocument();
      expect(screen.getByText('Refrigerator')).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Empty State Tests
  // ===========================================================================

  describe('empty state', () => {
    it('renders empty state when no session items', () => {
      render(<SessionSummaryStep {...defaultProps} sessionItems={[]} />);

      expect(screen.getByText('No items yet')).toBeInTheDocument();
      expect(screen.getByText(/haven't created any items/)).toBeInTheDocument();
    });

    it('renders Add First Item button in empty state', () => {
      render(<SessionSummaryStep {...defaultProps} sessionItems={[]} />);

      const addButton = screen.getByRole('button', { name: /add first item/i });
      expect(addButton).toBeInTheDocument();
    });

    it('calls onAddMoreItems when Add First Item clicked', () => {
      render(<SessionSummaryStep {...defaultProps} sessionItems={[]} />);

      fireEvent.click(screen.getByRole('button', { name: /add first item/i }));
      expect(defaultProps.onAddMoreItems).toHaveBeenCalledTimes(1);
    });
  });

  // ===========================================================================
  // Session Items Section Tests
  // ===========================================================================

  describe('session items section', () => {
    it('renders all session items', () => {
      const threeItems = [
        createMockSessionItem({ id: 'item-1', name: 'Item One' }),
        createMockSessionItem({ id: 'item-2', name: 'Item Two' }),
        createMockSessionItem({ id: 'item-3', name: 'Item Three' }),
      ];
      render(<SessionSummaryStep {...defaultProps} sessionItems={threeItems} />);

      expect(screen.getByText('Item One')).toBeInTheDocument();
      expect(screen.getByText('Item Two')).toBeInTheDocument();
      expect(screen.getByText('Item Three')).toBeInTheDocument();
    });

    it('renders Add More Items button when items exist', () => {
      render(<SessionSummaryStep {...defaultProps} />);

      expect(screen.getByRole('button', { name: /add more items/i })).toBeInTheDocument();
    });

    it('calls onAddMoreItems when Add More Items clicked', () => {
      render(<SessionSummaryStep {...defaultProps} />);

      fireEvent.click(screen.getByRole('button', { name: /add more items/i }));
      expect(defaultProps.onAddMoreItems).toHaveBeenCalledTimes(1);
    });

    it('has visual accent on new items section', () => {
      render(<SessionSummaryStep {...defaultProps} />);

      // The new items container should have left border accent
      const itemsContainer = screen.getByText('Dishwasher').closest('.border-l-2');
      expect(itemsContainer).toHaveClass('border-[#FF385C]');
    });
  });

  // ===========================================================================
  // Existing Items Section Tests
  // ===========================================================================

  describe('existing items section', () => {
    const propsWithExisting = {
      ...defaultProps,
      existingItems: [
        createMockSessionItem({ id: 'existing-1', name: 'Existing Item 1' }),
        createMockSessionItem({ id: 'existing-2', name: 'Existing Item 2' }),
      ],
    };

    it('renders collapsible section when existing items present', () => {
      render(<SessionSummaryStep {...propsWithExisting} />);

      expect(screen.getByText('Previously Created Items (2)')).toBeInTheDocument();
    });

    it('existing items section is collapsed by default', () => {
      render(<SessionSummaryStep {...propsWithExisting} />);

      // Existing items should not be visible initially
      expect(screen.queryByText('Existing Item 1')).not.toBeInTheDocument();
    });

    it('expands when trigger clicked', () => {
      render(<SessionSummaryStep {...propsWithExisting} />);

      // Click the collapsible trigger
      fireEvent.click(screen.getByText('Previously Created Items (2)'));

      // Now existing items should be visible
      expect(screen.getByText('Existing Item 1')).toBeInTheDocument();
      expect(screen.getByText('Existing Item 2')).toBeInTheDocument();
    });

    it('shows loading skeleton when loading', () => {
      render(<SessionSummaryStep {...propsWithExisting} isLoadingExisting={true} />);

      // Click to expand
      fireEvent.click(screen.getByText('Previously Created Items (2)'));

      // Should show animated skeleton
      const skeleton = document.querySelector('.animate-pulse');
      expect(skeleton).toBeInTheDocument();
    });

    it('does not show existing section when no existing items', () => {
      render(<SessionSummaryStep {...defaultProps} existingItems={[]} />);

      expect(screen.queryByText(/Previously Created Items/)).not.toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Item Actions Tests
  // ===========================================================================

  describe('item actions', () => {
    it('calls onEditItem when edit button clicked', () => {
      render(<SessionSummaryStep {...defaultProps} />);

      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      fireEvent.click(editButtons[0]);

      expect(defaultProps.onEditItem).toHaveBeenCalledWith('item-1');
    });

    it('shows remove confirmation dialog when remove clicked', () => {
      render(<SessionSummaryStep {...defaultProps} />);

      const removeButtons = screen.getAllByRole('button', { name: /remove/i });
      fireEvent.click(removeButtons[0]);

      // Dialog should appear
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      expect(screen.getByText('Remove Item?')).toBeInTheDocument();
    });

    it('calls onRemoveItem after confirmation', () => {
      render(<SessionSummaryStep {...defaultProps} />);

      // Click remove on first item
      const removeButtons = screen.getAllByRole('button', { name: /remove/i });
      fireEvent.click(removeButtons[0]);

      // Confirm removal
      fireEvent.click(screen.getByText('Remove'));

      expect(defaultProps.onRemoveItem).toHaveBeenCalledWith('item-1');
    });

    it('closes dialog when cancel clicked', () => {
      render(<SessionSummaryStep {...defaultProps} />);

      // Click remove on first item
      const removeButtons = screen.getAllByRole('button', { name: /remove/i });
      fireEvent.click(removeButtons[0]);

      // Cancel removal
      fireEvent.click(screen.getByText('Cancel'));

      // Dialog should close
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      expect(defaultProps.onRemoveItem).not.toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // Footer Button Tests
  // ===========================================================================

  describe('footer buttons', () => {
    it('renders Print QR Codes button', () => {
      render(<SessionSummaryStep {...defaultProps} />);

      expect(screen.getByRole('button', { name: /print qr codes/i })).toBeInTheDocument();
    });

    it('renders Skip & Finish button', () => {
      render(<SessionSummaryStep {...defaultProps} />);

      expect(screen.getByRole('button', { name: /skip & finish/i })).toBeInTheDocument();
    });

    it('calls onProceedToPrint when Print QR Codes clicked', () => {
      render(<SessionSummaryStep {...defaultProps} />);

      fireEvent.click(screen.getByRole('button', { name: /print qr codes/i }));
      expect(defaultProps.onProceedToPrint).toHaveBeenCalledTimes(1);
    });

    it('calls onFinishWithoutPrint when Skip & Finish clicked', () => {
      render(<SessionSummaryStep {...defaultProps} />);

      fireEvent.click(screen.getByRole('button', { name: /skip & finish/i }));
      expect(defaultProps.onFinishWithoutPrint).toHaveBeenCalledTimes(1);
    });

    it('disables footer buttons when no session items', () => {
      render(<SessionSummaryStep {...defaultProps} sessionItems={[]} />);

      expect(screen.getByRole('button', { name: /print qr codes/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /skip & finish/i })).toBeDisabled();
    });

    it('enables footer buttons when session items exist', () => {
      render(<SessionSummaryStep {...defaultProps} />);

      expect(screen.getByRole('button', { name: /print qr codes/i })).not.toBeDisabled();
      expect(screen.getByRole('button', { name: /skip & finish/i })).not.toBeDisabled();
    });
  });

  // ===========================================================================
  // Accessibility Tests
  // ===========================================================================

  describe('accessibility', () => {
    it('has accessible heading structure', () => {
      render(<SessionSummaryStep {...defaultProps} />);

      expect(screen.getByRole('heading', { level: 2, name: 'Session Summary' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 3, name: /New Items in This Session/ })).toBeInTheDocument();
    });

    it('has appropriate section landmarks', () => {
      render(<SessionSummaryStep {...defaultProps} />);

      // New items section should have aria-labelledby
      const newItemsSection = screen.getByRole('region', { name: /new items/i });
      expect(newItemsSection).toBeInTheDocument();
    });

    it('has screen reader announcements', () => {
      render(<SessionSummaryStep {...defaultProps} />);

      const srAnnouncement = document.querySelector('[aria-live="polite"].sr-only');
      expect(srAnnouncement).toBeInTheDocument();
      expect(srAnnouncement?.textContent).toContain('2 items created');
    });

    it('buttons have minimum touch target size', () => {
      render(<SessionSummaryStep {...defaultProps} />);

      const printButton = screen.getByRole('button', { name: /print qr codes/i });
      const skipButton = screen.getByRole('button', { name: /skip & finish/i });

      expect(printButton).toHaveClass('min-h-[48px]');
      expect(skipButton).toHaveClass('min-h-[48px]');
    });
  });

  // ===========================================================================
  // Styling Tests
  // ===========================================================================

  describe('styling', () => {
    it('applies custom className', () => {
      render(<SessionSummaryStep {...defaultProps} className="custom-test-class" />);

      // The root container should have the custom class
      const container = document.querySelector('.custom-test-class');
      expect(container).toBeInTheDocument();
    });

    it('has sticky footer', () => {
      render(<SessionSummaryStep {...defaultProps} />);

      const footer = screen.getByRole('button', { name: /print qr codes/i }).closest('.sticky');
      expect(footer).toHaveClass('bottom-0');
    });
  });
});
