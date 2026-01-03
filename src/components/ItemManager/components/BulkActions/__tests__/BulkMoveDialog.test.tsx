/**
 * Unit Tests for BulkMoveDialog Component
 *
 * Tests for rendering, property selection, item preview, accessibility, and interactions.
 *
 * @module ItemManager/components/BulkActions/__tests__/BulkMoveDialog
 * @see docs/REQ-073-implement-bulkmovedialog-detailed.md
 * @lastModified 2026-01-03 (REQ-073 Task 3.6.9)
 */

import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BulkMoveDialog, type Property } from '../BulkMoveDialog';
import type { ItemRecord } from '@/components/ItemCapture/ItemCapture.types';

// =============================================================================
// Mock Data
// =============================================================================

const mockItems: (ItemRecord & { propertyId?: string })[] = [
  {
    id: '1',
    title: 'Coffee Maker',
    propertyId: 'prop-1',
    contentType: 'media',
    media: [],
    createdAt: new Date('2026-01-01'),
  },
  {
    id: '2',
    title: 'Dishwasher',
    propertyId: 'prop-1',
    contentType: 'media',
    media: [],
    createdAt: new Date('2026-01-02'),
  },
  {
    id: '3',
    title: 'Thermostat',
    propertyId: 'prop-2',
    contentType: 'media',
    media: [],
    createdAt: new Date('2026-01-03'),
  },
];

const mockProperties: Property[] = [
  { id: 'prop-1', nickname: 'Mountain Cabin', address: '123 Mountain Rd' },
  { id: 'prop-2', nickname: 'Beach House', address: '456 Ocean Ave' },
  { id: 'prop-3', nickname: 'Downtown Loft', address: '789 Main St' },
];

// =============================================================================
// Default Props Helper
// =============================================================================

const createDefaultProps = (overrides = {}) => ({
  selectedItems: mockItems.slice(0, 2),
  properties: mockProperties,
  onConfirm: jest.fn(),
  onCancel: jest.fn(),
  loading: false,
  ...overrides,
});

// =============================================================================
// Test Suite
// =============================================================================

describe('BulkMoveDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset body overflow
    document.body.style.overflow = '';
  });

  // ===========================================================================
  // Rendering Tests
  // ===========================================================================

  describe('rendering', () => {
    it('renders dialog with property selector', () => {
      const props = createDefaultProps();
      render(<BulkMoveDialog {...props} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Destination property')).toBeInTheDocument();
    });

    it('shows correct item count in header', () => {
      const props = createDefaultProps({ selectedItems: mockItems });
      render(<BulkMoveDialog {...props} />);

      expect(screen.getByText(/Move 3 Items to Another Property/i)).toBeInTheDocument();
    });

    it('shows singular "Item" for single item', () => {
      const props = createDefaultProps({ selectedItems: [mockItems[0]] });
      render(<BulkMoveDialog {...props} />);

      expect(screen.getByText(/Move 1 Item to Another Property/i)).toBeInTheDocument();
    });

    it('renders close button', () => {
      const props = createDefaultProps();
      render(<BulkMoveDialog {...props} />);

      expect(screen.getByLabelText('Close dialog')).toBeInTheDocument();
    });

    it('renders cancel and confirm buttons', () => {
      const props = createDefaultProps();
      render(<BulkMoveDialog {...props} />);

      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Move \d+ Item/i })).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Item Preview Tests
  // ===========================================================================

  describe('item preview list', () => {
    it('shows item titles in preview list', () => {
      const props = createDefaultProps();
      render(<BulkMoveDialog {...props} />);

      expect(screen.getByText('Coffee Maker')).toBeInTheDocument();
      expect(screen.getByText('Dishwasher')).toBeInTheDocument();
    });

    it('shows source property names for items with propertyId', () => {
      const props = createDefaultProps();
      render(<BulkMoveDialog {...props} />);

      // Items from prop-1 should show "Mountain Cabin"
      expect(screen.getByText('from: Mountain Cabin')).toBeInTheDocument();
    });

    it('shows overflow message for more than 5 items', () => {
      const manyItems = Array.from({ length: 10 }, (_, i) => ({
        ...mockItems[0],
        id: `item-${i}`,
        title: `Item ${i + 1}`,
      }));
      const props = createDefaultProps({ selectedItems: manyItems });
      render(<BulkMoveDialog {...props} />);

      expect(screen.getByText('(and 5 more...)')).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Property Dropdown Tests
  // ===========================================================================

  describe('property dropdown', () => {
    it('filters out current property from options', () => {
      const props = createDefaultProps({ currentPropertyId: 'prop-1' });
      render(<BulkMoveDialog {...props} />);

      // Click to open dropdown
      fireEvent.click(screen.getByRole('button', { name: /Select destination property/i }));

      // Mountain Cabin (prop-1) should NOT be in options
      expect(screen.queryByRole('option', { name: /Mountain Cabin/i })).not.toBeInTheDocument();

      // Other properties should be visible
      expect(screen.getByRole('option', { name: /Beach House/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /Downtown Loft/i })).toBeInTheDocument();
    });

    it('opens dropdown on click', () => {
      const props = createDefaultProps();
      render(<BulkMoveDialog {...props} />);

      const dropdownButton = screen.getByRole('button', { name: /Select destination property/i });
      fireEvent.click(dropdownButton);

      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('updates display when property is selected', async () => {
      const props = createDefaultProps();
      render(<BulkMoveDialog {...props} />);

      const dropdownButton = screen.getByRole('button', { name: /Select destination property/i });
      fireEvent.click(dropdownButton);

      const beachHouseOption = screen.getByRole('option', { name: /Beach House/i });
      fireEvent.click(beachHouseOption);

      // Dropdown should close and show selected value
      expect(screen.getByText('Beach House')).toBeInTheDocument();
    });

    it('closes dropdown when clicking outside', () => {
      const props = createDefaultProps();
      render(<BulkMoveDialog {...props} />);

      const dropdownButton = screen.getByRole('button', { name: /Select destination property/i });
      fireEvent.click(dropdownButton);

      expect(screen.getByRole('listbox')).toBeInTheDocument();

      // Click outside
      fireEvent.mouseDown(document.body);

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('shows empty message when no properties available', () => {
      const props = createDefaultProps({
        properties: mockProperties.filter((p) => p.id === 'prop-1'),
        currentPropertyId: 'prop-1',
      });
      render(<BulkMoveDialog {...props} />);

      expect(screen.getByText('No other properties available')).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Keyboard Navigation Tests
  // ===========================================================================

  describe('keyboard navigation', () => {
    it('closes dialog on Escape key', () => {
      const props = createDefaultProps();
      render(<BulkMoveDialog {...props} />);

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(props.onCancel).toHaveBeenCalled();
    });

    it('navigates dropdown with arrow keys', () => {
      const props = createDefaultProps();
      render(<BulkMoveDialog {...props} />);

      const dropdownButton = screen.getByRole('button', { name: /Select destination property/i });
      dropdownButton.focus();

      // Open with ArrowDown
      fireEvent.keyDown(dropdownButton, { key: 'ArrowDown' });
      expect(screen.getByRole('listbox')).toBeInTheDocument();

      // Navigate down
      fireEvent.keyDown(dropdownButton, { key: 'ArrowDown' });
      fireEvent.keyDown(dropdownButton, { key: 'ArrowDown' });

      // Select with Enter
      fireEvent.keyDown(dropdownButton, { key: 'Enter' });

      // Dropdown should close
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('closes dropdown with Escape key', () => {
      const props = createDefaultProps();
      render(<BulkMoveDialog {...props} />);

      const dropdownButton = screen.getByRole('button', { name: /Select destination property/i });
      fireEvent.click(dropdownButton);

      expect(screen.getByRole('listbox')).toBeInTheDocument();

      fireEvent.keyDown(dropdownButton, { key: 'Escape' });

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Button State Tests
  // ===========================================================================

  describe('button states', () => {
    it('confirm button is disabled when no property selected', () => {
      const props = createDefaultProps();
      render(<BulkMoveDialog {...props} />);

      const confirmButton = screen.getByRole('button', { name: /Move \d+ Item/i });
      expect(confirmButton).toBeDisabled();
    });

    it('confirm button is enabled after selecting property', () => {
      const props = createDefaultProps();
      render(<BulkMoveDialog {...props} />);

      // Select a property
      const dropdownButton = screen.getByRole('button', { name: /Select destination property/i });
      fireEvent.click(dropdownButton);
      fireEvent.click(screen.getByRole('option', { name: /Beach House/i }));

      const confirmButton = screen.getByRole('button', { name: /Move \d+ Item/i });
      expect(confirmButton).not.toBeDisabled();
    });

    it('confirm button is disabled during loading', () => {
      const props = createDefaultProps({ loading: true });
      render(<BulkMoveDialog {...props} />);

      // Select a property first
      const dropdownButton = screen.getByRole('button', { name: /Select destination property/i });
      fireEvent.click(dropdownButton);

      // Button should still be disabled due to loading
      const confirmButton = screen.getByRole('button', { name: /Move \d+ Item/i });
      expect(confirmButton).toBeDisabled();
    });
  });

  // ===========================================================================
  // Callback Tests
  // ===========================================================================

  describe('callbacks', () => {
    it('calls onConfirm with selected property ID', () => {
      const props = createDefaultProps();
      render(<BulkMoveDialog {...props} />);

      // Select a property
      const dropdownButton = screen.getByRole('button', { name: /Select destination property/i });
      fireEvent.click(dropdownButton);
      fireEvent.click(screen.getByRole('option', { name: /Beach House/i }));

      // Click confirm
      const confirmButton = screen.getByRole('button', { name: /Move \d+ Item/i });
      fireEvent.click(confirmButton);

      expect(props.onConfirm).toHaveBeenCalledWith('prop-2');
    });

    it('calls onCancel when Cancel button is clicked', () => {
      const props = createDefaultProps();
      render(<BulkMoveDialog {...props} />);

      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(props.onCancel).toHaveBeenCalled();
    });

    it('calls onCancel when close button is clicked', () => {
      const props = createDefaultProps();
      render(<BulkMoveDialog {...props} />);

      fireEvent.click(screen.getByLabelText('Close dialog'));

      expect(props.onCancel).toHaveBeenCalled();
    });

    it('calls onCancel when backdrop is clicked', () => {
      const props = createDefaultProps();
      const { container } = render(<BulkMoveDialog {...props} />);

      // Click on the backdrop (first child which is the overlay)
      const backdrop = container.firstChild as HTMLElement;
      fireEvent.click(backdrop);

      expect(props.onCancel).toHaveBeenCalled();
    });

    it('does not call onCancel when clicking inside dialog', () => {
      const props = createDefaultProps();
      render(<BulkMoveDialog {...props} />);

      fireEvent.click(screen.getByRole('dialog'));

      expect(props.onCancel).not.toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // Loading State Tests
  // ===========================================================================

  describe('loading state', () => {
    it('disables dropdown when loading', () => {
      const props = createDefaultProps({ loading: true });
      render(<BulkMoveDialog {...props} />);

      const dropdownButton = screen.getByRole('button', { name: /Select destination property/i });
      expect(dropdownButton).toBeDisabled();
    });

    it('shows spinner on confirm button when loading', () => {
      const props = createDefaultProps({ loading: true });
      const { container } = render(<BulkMoveDialog {...props} />);

      // Check for the Loader2 icon (animated spinner)
      const confirmButton = screen.getByRole('button', { name: /Move \d+ Item/i });
      const spinner = confirmButton.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('does not close on Escape when loading', () => {
      const props = createDefaultProps({ loading: true });
      render(<BulkMoveDialog {...props} />);

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(props.onCancel).not.toHaveBeenCalled();
    });

    it('does not close on backdrop click when loading', () => {
      const props = createDefaultProps({ loading: true });
      const { container } = render(<BulkMoveDialog {...props} />);

      const backdrop = container.firstChild as HTMLElement;
      fireEvent.click(backdrop);

      expect(props.onCancel).not.toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // Accessibility Tests
  // ===========================================================================

  describe('accessibility', () => {
    it('has correct dialog role and aria-modal', () => {
      const props = createDefaultProps();
      render(<BulkMoveDialog {...props} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('dialog has aria-labelledby pointing to title', () => {
      const props = createDefaultProps();
      render(<BulkMoveDialog {...props} />);

      const dialog = screen.getByRole('dialog');
      const labelledBy = dialog.getAttribute('aria-labelledby');
      expect(labelledBy).toBeTruthy();

      // The title should have this ID
      const title = screen.getByText(/Move \d+ Item/i);
      expect(title).toHaveAttribute('id', labelledBy);
    });

    it('dropdown button has correct aria attributes', () => {
      const props = createDefaultProps();
      render(<BulkMoveDialog {...props} />);

      const dropdownButton = screen.getByRole('button', { name: /Select destination property/i });
      expect(dropdownButton).toHaveAttribute('aria-haspopup', 'listbox');
      expect(dropdownButton).toHaveAttribute('aria-expanded', 'false');

      fireEvent.click(dropdownButton);

      expect(dropdownButton).toHaveAttribute('aria-expanded', 'true');
    });

    it('dropdown options have correct role and aria-selected', () => {
      const props = createDefaultProps();
      render(<BulkMoveDialog {...props} />);

      const dropdownButton = screen.getByRole('button', { name: /Select destination property/i });
      fireEvent.click(dropdownButton);

      const options = screen.getAllByRole('option');
      expect(options.length).toBeGreaterThan(0);

      options.forEach((option) => {
        expect(option).toHaveAttribute('aria-selected');
      });
    });

    it('prevents body scroll when dialog is open', () => {
      const props = createDefaultProps();
      render(<BulkMoveDialog {...props} />);

      expect(document.body.style.overflow).toBe('hidden');
    });
  });

  // ===========================================================================
  // Edge Cases
  // ===========================================================================

  describe('edge cases', () => {
    it('handles empty properties array', () => {
      const props = createDefaultProps({ properties: [] });
      render(<BulkMoveDialog {...props} />);

      expect(screen.getByText('No other properties available')).toBeInTheDocument();
    });

    it('handles items without propertyId', () => {
      const itemsWithoutPropertyId = mockItems.map((item) => ({
        ...item,
        propertyId: undefined,
      }));
      const props = createDefaultProps({ selectedItems: itemsWithoutPropertyId });
      render(<BulkMoveDialog {...props} />);

      // Should still render item titles
      expect(screen.getByText('Coffee Maker')).toBeInTheDocument();

      // Should not show "from:" text for items without propertyId
      expect(screen.queryByText(/from:/)).not.toBeInTheDocument();
    });

    it('handles property with only name (no nickname)', () => {
      const propertiesWithName = [
        { id: 'prop-1', name: 'Property One' },
        { id: 'prop-2', name: 'Property Two' },
      ];
      const props = createDefaultProps({ properties: propertiesWithName });
      render(<BulkMoveDialog {...props} />);

      const dropdownButton = screen.getByRole('button', { name: /Select destination property/i });
      fireEvent.click(dropdownButton);

      expect(screen.getByRole('option', { name: /Property One/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /Property Two/i })).toBeInTheDocument();
    });
  });
});
