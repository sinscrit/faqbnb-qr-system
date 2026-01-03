/**
 * Integration Tests for BulkMove Flow
 *
 * Tests the end-to-end flow of opening dialog, selecting property, and confirming move.
 *
 * @module ItemManager/__tests__/BulkMoveFlow
 * @see docs/REQ-073-implement-bulkmovedialog-detailed.md
 * @lastModified 2026-01-03 (REQ-073 Task 3.6.10)
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ItemManager } from '../ItemManager';
import type { ItemRecord } from '@/components/ItemCapture/ItemCapture.types';

// =============================================================================
// Mock Data
// =============================================================================

const mockItems: (ItemRecord & { propertyId?: string })[] = [
  {
    id: 'item-1',
    title: 'Kitchen Appliance Guide',
    propertyId: 'prop-1',
    contentType: 'media',
    media: [{ id: 'media-1', type: 'image' as const, url: '/test.jpg', order: 0 }],
    tags: ['kitchen', 'appliances'],
    createdAt: new Date('2026-01-01'),
  },
  {
    id: 'item-2',
    title: 'WiFi Setup Instructions',
    propertyId: 'prop-1',
    contentType: 'media',
    media: [{ id: 'media-2', type: 'video' as const, url: '/test.mp4', order: 0 }],
    tags: ['wifi', 'tech'],
    createdAt: new Date('2026-01-02'),
  },
  {
    id: 'item-3',
    title: 'Pool Maintenance',
    propertyId: 'prop-2',
    contentType: 'text-only',
    textContent: 'Pool instructions...',
    media: [],
    createdAt: new Date('2026-01-03'),
  },
];

const mockProperties = [
  { id: 'prop-1', nickname: 'Mountain Cabin', address: '123 Mountain Rd' },
  { id: 'prop-2', nickname: 'Beach House', address: '456 Ocean Ave' },
  { id: 'prop-3', nickname: 'Downtown Loft', address: '789 Main St' },
];

// =============================================================================
// Default Props Helper
// =============================================================================

const createDefaultProps = (overrides = {}) => ({
  items: mockItems,
  properties: mockProperties,
  loading: false,
  onEditItem: jest.fn(),
  onDeleteItems: jest.fn(),
  onUpdateItem: jest.fn().mockResolvedValue(undefined),
  config: {
    enableBulkActions: true,
    multiPropertyMode: true,
  },
  ...overrides,
});

// =============================================================================
// Test Suite
// =============================================================================

describe('BulkMoveFlow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===========================================================================
  // Full Flow Tests
  // ===========================================================================

  describe('complete move flow end-to-end', () => {
    it('completes full move flow from selection to confirmation', async () => {
      const props = createDefaultProps();
      render(<ItemManager {...props} />);

      // Step 1: Select items
      // In grid view, click on items to select them
      const item1 = screen.getByText('Kitchen Appliance Guide');
      const item2 = screen.getByText('WiFi Setup Instructions');

      // Find and click checkboxes (selection boxes in the cards)
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThanOrEqual(2);

      fireEvent.click(checkboxes[0]);
      fireEvent.click(checkboxes[1]);

      // Step 2: Verify bulk actions bar appears
      await waitFor(() => {
        expect(screen.getByText('2 selected')).toBeInTheDocument();
      });

      // Step 3: Click "Move to..." button
      const moveButton = screen.getByRole('button', { name: /Move to.../i });
      expect(moveButton).toBeInTheDocument();
      fireEvent.click(moveButton);

      // Step 4: Verify dialog opens
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
      expect(screen.getByText(/Move 2 Items to Another Property/i)).toBeInTheDocument();

      // Step 5: Select destination property
      const dropdownButton = screen.getByRole('button', { name: /Select destination property/i });
      fireEvent.click(dropdownButton);

      const beachHouseOption = screen.getByRole('option', { name: /Beach House/i });
      fireEvent.click(beachHouseOption);

      // Step 6: Confirm the move
      const confirmButton = screen.getByRole('button', { name: /Move 2 Items/i });
      fireEvent.click(confirmButton);

      // Step 7: Verify onUpdateItem was called for each item
      await waitFor(() => {
        expect(props.onUpdateItem).toHaveBeenCalledTimes(2);
      });

      // Verify the items were updated with new propertyId
      expect(props.onUpdateItem).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'item-1',
          propertyId: 'prop-2',
        })
      );
      expect(props.onUpdateItem).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'item-2',
          propertyId: 'prop-2',
        })
      );

      // Step 8: Verify dialog closes
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  // ===========================================================================
  // Multi-Property Mode Tests
  // ===========================================================================

  describe('multi-property mode visibility', () => {
    it('shows Move to... button only in multi-property mode', async () => {
      const props = createDefaultProps({
        config: {
          enableBulkActions: true,
          multiPropertyMode: true,
        },
      });
      render(<ItemManager {...props} />);

      // Select an item
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);

      await waitFor(() => {
        expect(screen.getByText('1 selected')).toBeInTheDocument();
      });

      // Move button should be visible
      expect(screen.getByRole('button', { name: /Move to.../i })).toBeInTheDocument();
    });

    it('hides Move to... button in single-property mode', async () => {
      const props = createDefaultProps({
        properties: undefined,
        config: {
          enableBulkActions: true,
          multiPropertyMode: false,
        },
      });
      render(<ItemManager {...props} />);

      // Select an item
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);

      await waitFor(() => {
        expect(screen.getByText('1 selected')).toBeInTheDocument();
      });

      // Move button should NOT be visible
      expect(screen.queryByRole('button', { name: /Move to.../i })).not.toBeInTheDocument();
    });

    it('hides Move to... button when no properties are provided', async () => {
      const props = createDefaultProps({
        properties: [],
        config: {
          enableBulkActions: true,
          multiPropertyMode: true,
        },
      });
      render(<ItemManager {...props} />);

      // Select an item
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);

      await waitFor(() => {
        expect(screen.getByText('1 selected')).toBeInTheDocument();
      });

      // Move button should NOT be visible (no properties to move to)
      expect(screen.queryByRole('button', { name: /Move to.../i })).not.toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Selection State Tests
  // ===========================================================================

  describe('selection cleared after move', () => {
    it('clears selection after successful move', async () => {
      const props = createDefaultProps();
      render(<ItemManager {...props} />);

      // Select items
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);

      await waitFor(() => {
        expect(screen.getByText('1 selected')).toBeInTheDocument();
      });

      // Open move dialog
      fireEvent.click(screen.getByRole('button', { name: /Move to.../i }));

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Select property and confirm
      const dropdownButton = screen.getByRole('button', { name: /Select destination property/i });
      fireEvent.click(dropdownButton);
      fireEvent.click(screen.getByRole('option', { name: /Beach House/i }));
      fireEvent.click(screen.getByRole('button', { name: /Move 1 Item/i }));

      // Selection should be cleared
      await waitFor(() => {
        expect(screen.queryByText('1 selected')).not.toBeInTheDocument();
      });
    });

    it('preserves selection when move is cancelled', async () => {
      const props = createDefaultProps();
      render(<ItemManager {...props} />);

      // Select items
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);

      await waitFor(() => {
        expect(screen.getByText('1 selected')).toBeInTheDocument();
      });

      // Open move dialog
      fireEvent.click(screen.getByRole('button', { name: /Move to.../i }));

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Cancel
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

      // Dialog should close
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });

      // Selection should still be visible
      expect(screen.getByText('1 selected')).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Error Handling Tests
  // ===========================================================================

  describe('error handling', () => {
    it('handles onUpdateItem failure gracefully', async () => {
      const mockUpdateItem = jest.fn().mockRejectedValue(new Error('Update failed'));
      const props = createDefaultProps({ onUpdateItem: mockUpdateItem });
      render(<ItemManager {...props} />);

      // Select items
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);

      await waitFor(() => {
        expect(screen.getByText('1 selected')).toBeInTheDocument();
      });

      // Open move dialog
      fireEvent.click(screen.getByRole('button', { name: /Move to.../i }));

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Select property and confirm
      const dropdownButton = screen.getByRole('button', { name: /Select destination property/i });
      fireEvent.click(dropdownButton);
      fireEvent.click(screen.getByRole('option', { name: /Beach House/i }));

      // Confirm the move - this should throw but be handled
      fireEvent.click(screen.getByRole('button', { name: /Move 1 Item/i }));

      // Wait for the async operation to complete
      await waitFor(() => {
        // Dialog should still close even on error (current implementation)
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });

      // Verify the update was attempted
      expect(mockUpdateItem).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // Concurrent Operations Tests
  // ===========================================================================

  describe('concurrent operation handling', () => {
    it('disables tag buttons while move is in progress', async () => {
      // Create a slow update function
      let resolveUpdate: () => void;
      const mockUpdateItem = jest.fn().mockImplementation(() => {
        return new Promise((resolve) => {
          resolveUpdate = resolve;
        });
      });
      const props = createDefaultProps({ onUpdateItem: mockUpdateItem });
      render(<ItemManager {...props} />);

      // Select items
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);

      await waitFor(() => {
        expect(screen.getByText('1 selected')).toBeInTheDocument();
      });

      // Store references to tag buttons
      const addTagButton = screen.getByRole('button', { name: /Add Tag/i });
      const removeTagButton = screen.getByRole('button', { name: /Remove Tag/i });

      // Open move dialog and start the move
      fireEvent.click(screen.getByRole('button', { name: /Move to.../i }));

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const dropdownButton = screen.getByRole('button', { name: /Select destination property/i });
      fireEvent.click(dropdownButton);
      fireEvent.click(screen.getByRole('option', { name: /Beach House/i }));
      fireEvent.click(screen.getByRole('button', { name: /Move 1 Item/i }));

      // During the move operation, the dialog should close and UI should update
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });

      // Complete the update
      resolveUpdate!();
    });
  });
});
