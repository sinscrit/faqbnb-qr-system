/**
 * Unit Tests for BulkActionsBar Component
 *
 * Tests for rendering, action callbacks, loading states, accessibility, and responsiveness.
 *
 * @module ItemManager/components/BulkActions/__tests__/BulkActionsBar
 * @see docs/REQ-070-build-bulkactionsbar-component-detailed.md
 * @lastModified 2026-01-04 (REQ-070 Task 3.3.7)
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BulkActionsBar } from '../BulkActionsBar';

// =============================================================================
// Default Props Helper
// =============================================================================

const defaultProps = {
  selectedCount: 5,
  onDelete: jest.fn(),
  onAddTag: jest.fn(),
  onRemoveTag: jest.fn(),
  onExitSelection: jest.fn(),
};

const createProps = (overrides = {}) => ({
  ...defaultProps,
  onDelete: jest.fn(),
  onAddTag: jest.fn(),
  onRemoveTag: jest.fn(),
  onExitSelection: jest.fn(),
  ...overrides,
});

// =============================================================================
// Test Suite
// =============================================================================

describe('BulkActionsBar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===========================================================================
  // Rendering Tests
  // ===========================================================================

  describe('rendering', () => {
    it('renders when selectedCount > 0', () => {
      const props = createProps({ selectedCount: 5 });
      render(<BulkActionsBar {...props} />);

      expect(screen.getByRole('toolbar')).toBeInTheDocument();
    });

    it('does not render when selectedCount === 0', () => {
      const props = createProps({ selectedCount: 0 });
      const { container } = render(<BulkActionsBar {...props} />);

      expect(container.firstChild).toBeNull();
    });

    it('displays correct selection count', () => {
      const props = createProps({ selectedCount: 10 });
      render(<BulkActionsBar {...props} />);

      expect(screen.getByText('10 selected')).toBeInTheDocument();
    });

    it('displays singular "selected" with count of 1', () => {
      const props = createProps({ selectedCount: 1 });
      render(<BulkActionsBar {...props} />);

      expect(screen.getByText('1 selected')).toBeInTheDocument();
    });

    it('displays large selection counts correctly', () => {
      const props = createProps({ selectedCount: 100 });
      render(<BulkActionsBar {...props} />);

      expect(screen.getByText('100 selected')).toBeInTheDocument();
    });

    it('renders Delete button', () => {
      const props = createProps();
      render(<BulkActionsBar {...props} />);

      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    });

    it('renders Add Tag button', () => {
      const props = createProps();
      render(<BulkActionsBar {...props} />);

      expect(screen.getByRole('button', { name: /add tag/i })).toBeInTheDocument();
    });

    it('renders Remove Tag button', () => {
      const props = createProps();
      render(<BulkActionsBar {...props} />);

      expect(screen.getByRole('button', { name: /remove tag/i })).toBeInTheDocument();
    });

    it('renders Cancel button', () => {
      const props = createProps();
      render(<BulkActionsBar {...props} />);

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('shows Move button when multiPropertyMode is true', () => {
      const props = createProps({
        multiPropertyMode: true,
        onMoveToProperty: jest.fn(),
      });
      render(<BulkActionsBar {...props} />);

      expect(screen.getByRole('button', { name: /move to property/i })).toBeInTheDocument();
    });

    it('hides Move button when multiPropertyMode is false', () => {
      const props = createProps({ multiPropertyMode: false });
      render(<BulkActionsBar {...props} />);

      expect(screen.queryByRole('button', { name: /move to property/i })).not.toBeInTheDocument();
    });

    it('hides Move button when multiPropertyMode is true but onMoveToProperty is not provided', () => {
      const props = createProps({ multiPropertyMode: true, onMoveToProperty: undefined });
      render(<BulkActionsBar {...props} />);

      expect(screen.queryByRole('button', { name: /move to property/i })).not.toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Action Callback Tests
  // ===========================================================================

  describe('action callbacks', () => {
    it('calls onDelete when Delete button is clicked', async () => {
      const props = createProps();
      render(<BulkActionsBar {...props} />);

      await userEvent.click(screen.getByRole('button', { name: /delete/i }));

      expect(props.onDelete).toHaveBeenCalledTimes(1);
    });

    it('calls onAddTag when Add Tag button is clicked', async () => {
      const props = createProps();
      render(<BulkActionsBar {...props} />);

      await userEvent.click(screen.getByRole('button', { name: /add tag/i }));

      expect(props.onAddTag).toHaveBeenCalledTimes(1);
    });

    it('calls onRemoveTag when Remove Tag button is clicked', async () => {
      const props = createProps();
      render(<BulkActionsBar {...props} />);

      await userEvent.click(screen.getByRole('button', { name: /remove tag/i }));

      expect(props.onRemoveTag).toHaveBeenCalledTimes(1);
    });

    it('calls onExitSelection when Cancel button is clicked', async () => {
      const props = createProps();
      render(<BulkActionsBar {...props} />);

      await userEvent.click(screen.getByRole('button', { name: /cancel/i }));

      expect(props.onExitSelection).toHaveBeenCalledTimes(1);
    });

    it('calls onMoveToProperty when Move button is clicked', async () => {
      const onMoveToProperty = jest.fn();
      const props = createProps({
        multiPropertyMode: true,
        onMoveToProperty,
      });
      render(<BulkActionsBar {...props} />);

      await userEvent.click(screen.getByRole('button', { name: /move to property/i }));

      expect(onMoveToProperty).toHaveBeenCalledTimes(1);
    });
  });

  // ===========================================================================
  // Loading State Tests
  // ===========================================================================

  describe('loading state', () => {
    it('shows loading indicator when loading is true', () => {
      const props = createProps({ loading: true });
      render(<BulkActionsBar {...props} />);

      expect(screen.getByText('Processing...')).toBeInTheDocument();
    });

    it('hides action buttons when loading', () => {
      const props = createProps({ loading: true });
      render(<BulkActionsBar {...props} />);

      // Action buttons should not be in the document when loading
      expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /add tag/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /remove tag/i })).not.toBeInTheDocument();
    });

    it('still shows Cancel button when loading (but it is outside loading area)', () => {
      const props = createProps({ loading: true });
      render(<BulkActionsBar {...props} />);

      // Cancel button should still be accessible
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('does not call action callbacks when loading', async () => {
      const props = createProps({ loading: true });
      render(<BulkActionsBar {...props} />);

      // Action buttons are hidden during loading, so we verify they're not rendered
      // and therefore can't be clicked
      expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Accessibility Tests
  // ===========================================================================

  describe('accessibility', () => {
    it('has toolbar role', () => {
      const props = createProps();
      render(<BulkActionsBar {...props} />);

      expect(screen.getByRole('toolbar')).toBeInTheDocument();
    });

    it('has appropriate aria-label', () => {
      const props = createProps({ selectedCount: 5 });
      render(<BulkActionsBar {...props} />);

      const toolbar = screen.getByRole('toolbar');
      expect(toolbar).toHaveAttribute('aria-label', 'Bulk actions for 5 selected items');
    });

    it('aria-label uses singular for single item', () => {
      const props = createProps({ selectedCount: 1 });
      render(<BulkActionsBar {...props} />);

      const toolbar = screen.getByRole('toolbar');
      expect(toolbar).toHaveAttribute('aria-label', 'Bulk actions for 1 selected item');
    });

    it('all action buttons have aria-label attributes', () => {
      const props = createProps({
        multiPropertyMode: true,
        onMoveToProperty: jest.fn(),
      });
      render(<BulkActionsBar {...props} />);

      const deleteBtn = screen.getByRole('button', { name: /delete/i });
      const addTagBtn = screen.getByRole('button', { name: /add tag/i });
      const removeTagBtn = screen.getByRole('button', { name: /remove tag/i });
      const moveBtn = screen.getByRole('button', { name: /move to property/i });
      const cancelBtn = screen.getByRole('button', { name: /cancel/i });

      expect(deleteBtn).toHaveAttribute('aria-label');
      expect(addTagBtn).toHaveAttribute('aria-label');
      expect(removeTagBtn).toHaveAttribute('aria-label');
      expect(moveBtn).toHaveAttribute('aria-label');
      expect(cancelBtn).toHaveAttribute('aria-label');
    });

    it('all action buttons have title attributes for tooltips', () => {
      const props = createProps();
      render(<BulkActionsBar {...props} />);

      const deleteBtn = screen.getByRole('button', { name: /delete/i });
      const addTagBtn = screen.getByRole('button', { name: /add tag/i });
      const removeTagBtn = screen.getByRole('button', { name: /remove tag/i });
      const cancelBtn = screen.getByRole('button', { name: /cancel/i });

      expect(deleteBtn).toHaveAttribute('title');
      expect(addTagBtn).toHaveAttribute('title');
      expect(removeTagBtn).toHaveAttribute('title');
      expect(cancelBtn).toHaveAttribute('title');
    });

    it('includes screen reader text for selection count', () => {
      const props = createProps({ selectedCount: 5 });
      render(<BulkActionsBar {...props} />);

      // Check for sr-only text
      expect(screen.getByText(/Currently 5 items selected/)).toHaveClass('sr-only');
    });

    it('buttons are focusable via keyboard', async () => {
      const props = createProps();
      render(<BulkActionsBar {...props} />);

      const deleteBtn = screen.getByRole('button', { name: /delete/i });

      // Focus should be possible
      deleteBtn.focus();
      expect(document.activeElement).toBe(deleteBtn);
    });

    it('buttons respond to keyboard Enter key', async () => {
      const props = createProps();
      render(<BulkActionsBar {...props} />);

      const deleteBtn = screen.getByRole('button', { name: /delete/i });
      deleteBtn.focus();

      fireEvent.keyDown(deleteBtn, { key: 'Enter' });
      // Enter key on a button should trigger click
      // However, fireEvent.keyDown doesn't trigger click handler automatically for buttons
      // We need to use fireEvent.click or userEvent.keyboard
      await userEvent.keyboard('{Enter}');

      expect(props.onDelete).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // Styling and Layout Tests
  // ===========================================================================

  describe('styling and layout', () => {
    it('applies custom className', () => {
      const props = createProps({ className: 'custom-class' });
      render(<BulkActionsBar {...props} />);

      const toolbar = screen.getByRole('toolbar');
      expect(toolbar).toHaveClass('custom-class');
    });

    it('has fixed positioning styles', () => {
      const props = createProps();
      render(<BulkActionsBar {...props} />);

      const toolbar = screen.getByRole('toolbar');
      expect(toolbar).toHaveClass('fixed');
      expect(toolbar).toHaveClass('bottom-0');
    });

    it('has proper z-index for overlay', () => {
      const props = createProps();
      render(<BulkActionsBar {...props} />);

      const toolbar = screen.getByRole('toolbar');
      expect(toolbar).toHaveClass('z-40');
    });
  });

  // ===========================================================================
  // Edge Cases
  // ===========================================================================

  describe('edge cases', () => {
    it('handles rapid button clicks gracefully', async () => {
      const props = createProps();
      render(<BulkActionsBar {...props} />);

      const deleteBtn = screen.getByRole('button', { name: /delete/i });

      // Rapid clicks
      await userEvent.click(deleteBtn);
      await userEvent.click(deleteBtn);
      await userEvent.click(deleteBtn);

      expect(props.onDelete).toHaveBeenCalledTimes(3);
    });

    it('renders correctly with very large selection counts', () => {
      const props = createProps({ selectedCount: 9999 });
      render(<BulkActionsBar {...props} />);

      expect(screen.getByText('9999 selected')).toBeInTheDocument();
    });

    it('does not break with falsy multiPropertyMode but truthy onMoveToProperty', () => {
      const props = createProps({
        multiPropertyMode: false,
        onMoveToProperty: jest.fn(),
      });
      render(<BulkActionsBar {...props} />);

      // Move button should not appear because multiPropertyMode is false
      expect(screen.queryByRole('button', { name: /move to property/i })).not.toBeInTheDocument();
    });

    it('handles transition from loading to not loading', () => {
      const props = createProps({ loading: true });
      const { rerender } = render(<BulkActionsBar {...props} />);

      expect(screen.getByText('Processing...')).toBeInTheDocument();

      // Rerender with loading = false
      rerender(<BulkActionsBar {...createProps({ loading: false })} />);

      expect(screen.queryByText('Processing...')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    });

    it('handles transition from visible to hidden (selectedCount to 0)', () => {
      const props = createProps({ selectedCount: 5 });
      const { rerender, container } = render(<BulkActionsBar {...props} />);

      expect(screen.getByRole('toolbar')).toBeInTheDocument();

      // Rerender with selectedCount = 0
      rerender(<BulkActionsBar {...createProps({ selectedCount: 0 })} />);

      expect(container.firstChild).toBeNull();
    });
  });
});
