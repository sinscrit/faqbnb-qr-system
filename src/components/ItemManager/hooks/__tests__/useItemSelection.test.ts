/**
 * Unit tests for useItemSelection hook
 *
 * @module ItemManager/hooks/__tests__/useItemSelection.test
 * @see docs/prd/item-capture-manager-implementation-plan.md (Phase 3, Task 3.1)
 * @lastModified 2026-01-04 (REQ-068 - Initial test suite)
 */

import { renderHook, act } from '@testing-library/react';
import { useItemSelection } from '../useItemSelection';
import type { UseItemSelectionOptions } from '../useItemSelection';

// =============================================================================
// Mock Items for Testing
// =============================================================================

const mockItems = [
  { id: '1', title: 'Item 1' },
  { id: '2', title: 'Item 2' },
  { id: '3', title: 'Item 3' },
  { id: '4', title: 'Item 4' },
  { id: '5', title: 'Item 5' },
];

const mockIds = mockItems.map((item) => item.id);

// =============================================================================
// Initial State Tests
// =============================================================================

describe('useItemSelection', () => {
  describe('Initial State', () => {
    it('should have empty selection by default', () => {
      const { result } = renderHook(() => useItemSelection());

      expect(result.current.selectedIds.size).toBe(0);
      expect(result.current.selectedCount).toBe(0);
      expect(result.current.isSelectionMode).toBe(false);
      expect(result.current.hasSelection).toBe(false);
      expect(result.current.canSelectMore).toBe(true);
      expect(result.current.isMaxSelected).toBe(false);
    });

    it('should respect initialSelection option', () => {
      const { result } = renderHook(() =>
        useItemSelection({ initialSelection: ['1', '2'] })
      );

      expect(result.current.selectedIds.size).toBe(2);
      expect(result.current.selectedCount).toBe(2);
      expect(result.current.isSelectionMode).toBe(true);
      expect(result.current.hasSelection).toBe(true);
      expect(result.current.isSelected('1')).toBe(true);
      expect(result.current.isSelected('2')).toBe(true);
      expect(result.current.isSelected('3')).toBe(false);
    });

    it('should use custom maxSelection', () => {
      const { result } = renderHook(() =>
        useItemSelection({ maxSelection: 3, initialSelection: ['1', '2', '3'] })
      );

      expect(result.current.isMaxSelected).toBe(true);
      expect(result.current.canSelectMore).toBe(false);
    });

    it('should use default maxSelection of 100', () => {
      const { result } = renderHook(() => useItemSelection());

      expect(result.current.canSelectMore).toBe(true);
      expect(result.current.isMaxSelected).toBe(false);
    });
  });

  // ===========================================================================
  // Item-Level Actions Tests
  // ===========================================================================

  describe('Item-Level Actions', () => {
    describe('selectItem', () => {
      it('should add item to selection', () => {
        const { result } = renderHook(() => useItemSelection());

        act(() => {
          result.current.selectItem('1');
        });

        expect(result.current.isSelected('1')).toBe(true);
        expect(result.current.selectedCount).toBe(1);
      });

      it('should auto-enter selection mode', () => {
        const { result } = renderHook(() => useItemSelection());

        expect(result.current.isSelectionMode).toBe(false);

        act(() => {
          result.current.selectItem('1');
        });

        expect(result.current.isSelectionMode).toBe(true);
      });

      it('should not exceed maxSelection', () => {
        const { result } = renderHook(() =>
          useItemSelection({ maxSelection: 2 })
        );

        act(() => {
          result.current.selectItem('1');
          result.current.selectItem('2');
          result.current.selectItem('3');
        });

        expect(result.current.selectedCount).toBe(2);
        expect(result.current.isSelected('3')).toBe(false);
      });

      it('should ignore duplicate selections', () => {
        const { result } = renderHook(() => useItemSelection());

        act(() => {
          result.current.selectItem('1');
          result.current.selectItem('1');
        });

        expect(result.current.selectedCount).toBe(1);
      });

      it('should update canSelectMore when approaching max', () => {
        const { result } = renderHook(() =>
          useItemSelection({ maxSelection: 2 })
        );

        expect(result.current.canSelectMore).toBe(true);

        act(() => {
          result.current.selectItem('1');
        });

        expect(result.current.canSelectMore).toBe(true);

        act(() => {
          result.current.selectItem('2');
        });

        expect(result.current.canSelectMore).toBe(false);
        expect(result.current.isMaxSelected).toBe(true);
      });
    });

    describe('deselectItem', () => {
      it('should remove item from selection', () => {
        const { result } = renderHook(() =>
          useItemSelection({ initialSelection: ['1', '2'] })
        );

        act(() => {
          result.current.deselectItem('1');
        });

        expect(result.current.isSelected('1')).toBe(false);
        expect(result.current.selectedCount).toBe(1);
      });

      it('should auto-exit selection mode when empty', () => {
        const { result } = renderHook(() =>
          useItemSelection({ initialSelection: ['1'] })
        );

        expect(result.current.isSelectionMode).toBe(true);

        act(() => {
          result.current.deselectItem('1');
        });

        expect(result.current.isSelectionMode).toBe(false);
      });

      it('should be no-op for unselected items', () => {
        const { result } = renderHook(() =>
          useItemSelection({ initialSelection: ['1'] })
        );

        act(() => {
          result.current.deselectItem('2');
        });

        expect(result.current.selectedCount).toBe(1);
        expect(result.current.isSelected('1')).toBe(true);
      });
    });

    describe('toggleItem', () => {
      it('should select unselected items', () => {
        const { result } = renderHook(() => useItemSelection());

        act(() => {
          result.current.toggleItem('1');
        });

        expect(result.current.isSelected('1')).toBe(true);
      });

      it('should deselect selected items', () => {
        const { result } = renderHook(() =>
          useItemSelection({ initialSelection: ['1'] })
        );

        act(() => {
          result.current.toggleItem('1');
        });

        expect(result.current.isSelected('1')).toBe(false);
      });

      it('should respect maxSelection when toggling on', () => {
        const { result } = renderHook(() =>
          useItemSelection({ maxSelection: 1, initialSelection: ['1'] })
        );

        act(() => {
          result.current.toggleItem('2');
        });

        expect(result.current.isSelected('2')).toBe(false);
        expect(result.current.selectedCount).toBe(1);
      });
    });

    describe('isSelected', () => {
      it('should return true for selected items', () => {
        const { result } = renderHook(() =>
          useItemSelection({ initialSelection: ['1', '2'] })
        );

        expect(result.current.isSelected('1')).toBe(true);
        expect(result.current.isSelected('2')).toBe(true);
      });

      it('should return false for unselected items', () => {
        const { result } = renderHook(() =>
          useItemSelection({ initialSelection: ['1'] })
        );

        expect(result.current.isSelected('2')).toBe(false);
        expect(result.current.isSelected('3')).toBe(false);
      });

      it('should update when selection changes', () => {
        const { result } = renderHook(() => useItemSelection());

        expect(result.current.isSelected('1')).toBe(false);

        act(() => {
          result.current.selectItem('1');
        });

        expect(result.current.isSelected('1')).toBe(true);
      });
    });
  });

  // ===========================================================================
  // Bulk Actions Tests
  // ===========================================================================

  describe('Bulk Actions', () => {
    describe('selectAll', () => {
      it('should replace current selection', () => {
        const { result } = renderHook(() =>
          useItemSelection({ initialSelection: ['1'] })
        );

        act(() => {
          result.current.selectAll(['2', '3']);
        });

        expect(result.current.isSelected('1')).toBe(false);
        expect(result.current.isSelected('2')).toBe(true);
        expect(result.current.isSelected('3')).toBe(true);
        expect(result.current.selectedCount).toBe(2);
      });

      it('should respect maxSelection', () => {
        const { result } = renderHook(() =>
          useItemSelection({ maxSelection: 2 })
        );

        act(() => {
          result.current.selectAll(['1', '2', '3', '4']);
        });

        expect(result.current.selectedCount).toBe(2);
        expect(result.current.isSelected('1')).toBe(true);
        expect(result.current.isSelected('2')).toBe(true);
        expect(result.current.isSelected('3')).toBe(false);
      });

      it('should enter selection mode', () => {
        const { result } = renderHook(() => useItemSelection());

        expect(result.current.isSelectionMode).toBe(false);

        act(() => {
          result.current.selectAll(['1', '2']);
        });

        expect(result.current.isSelectionMode).toBe(true);
      });

      it('should handle empty array', () => {
        const { result } = renderHook(() =>
          useItemSelection({ initialSelection: ['1', '2'] })
        );

        act(() => {
          result.current.selectAll([]);
        });

        expect(result.current.selectedCount).toBe(0);
        expect(result.current.isSelectionMode).toBe(false);
      });
    });

    describe('selectMultiple', () => {
      it('should add to existing selection', () => {
        const { result } = renderHook(() =>
          useItemSelection({ initialSelection: ['1'] })
        );

        act(() => {
          result.current.selectMultiple(['2', '3']);
        });

        expect(result.current.isSelected('1')).toBe(true);
        expect(result.current.isSelected('2')).toBe(true);
        expect(result.current.isSelected('3')).toBe(true);
        expect(result.current.selectedCount).toBe(3);
      });

      it('should stop at maxSelection limit', () => {
        const { result } = renderHook(() =>
          useItemSelection({ maxSelection: 3, initialSelection: ['1'] })
        );

        act(() => {
          result.current.selectMultiple(['2', '3', '4', '5']);
        });

        expect(result.current.selectedCount).toBe(3);
        expect(result.current.isMaxSelected).toBe(true);
      });

      it('should handle duplicates gracefully', () => {
        const { result } = renderHook(() =>
          useItemSelection({ initialSelection: ['1'] })
        );

        act(() => {
          result.current.selectMultiple(['1', '2', '1']);
        });

        expect(result.current.selectedCount).toBe(2);
      });
    });

    describe('deselectMultiple', () => {
      it('should remove specified items', () => {
        const { result } = renderHook(() =>
          useItemSelection({ initialSelection: ['1', '2', '3', '4'] })
        );

        act(() => {
          result.current.deselectMultiple(['2', '3']);
        });

        expect(result.current.isSelected('1')).toBe(true);
        expect(result.current.isSelected('2')).toBe(false);
        expect(result.current.isSelected('3')).toBe(false);
        expect(result.current.isSelected('4')).toBe(true);
        expect(result.current.selectedCount).toBe(2);
      });

      it('should handle items not in selection', () => {
        const { result } = renderHook(() =>
          useItemSelection({ initialSelection: ['1', '2'] })
        );

        act(() => {
          result.current.deselectMultiple(['3', '4']);
        });

        expect(result.current.selectedCount).toBe(2);
      });

      it('should auto-exit mode if selection becomes empty', () => {
        const { result } = renderHook(() =>
          useItemSelection({ initialSelection: ['1', '2'] })
        );

        act(() => {
          result.current.deselectMultiple(['1', '2']);
        });

        expect(result.current.selectedCount).toBe(0);
        expect(result.current.isSelectionMode).toBe(false);
      });
    });

    describe('clearSelection', () => {
      it('should empty selection and exit mode', () => {
        const { result } = renderHook(() =>
          useItemSelection({ initialSelection: ['1', '2'] })
        );

        act(() => {
          result.current.clearSelection();
        });

        expect(result.current.selectedCount).toBe(0);
        expect(result.current.isSelectionMode).toBe(false);
        expect(result.current.hasSelection).toBe(false);
      });

      it('should be safe to call when already empty', () => {
        const { result } = renderHook(() => useItemSelection());

        act(() => {
          result.current.clearSelection();
        });

        expect(result.current.selectedCount).toBe(0);
        expect(result.current.isSelectionMode).toBe(false);
      });
    });
  });

  // ===========================================================================
  // Mode Control Tests
  // ===========================================================================

  describe('Mode Control', () => {
    describe('enterSelectionMode', () => {
      it('should activate selection mode', () => {
        const { result } = renderHook(() => useItemSelection());

        expect(result.current.isSelectionMode).toBe(false);

        act(() => {
          result.current.enterSelectionMode();
        });

        expect(result.current.isSelectionMode).toBe(true);
      });

      it('should preserve existing selection', () => {
        const { result } = renderHook(() =>
          useItemSelection({ initialSelection: ['1'] })
        );

        act(() => {
          result.current.enterSelectionMode();
        });

        expect(result.current.isSelectionMode).toBe(true);
        expect(result.current.selectedCount).toBe(1);
      });

      it('should be no-op if already in selection mode', () => {
        const { result } = renderHook(() =>
          useItemSelection({ initialSelection: ['1'] })
        );

        expect(result.current.isSelectionMode).toBe(true);

        act(() => {
          result.current.enterSelectionMode();
        });

        expect(result.current.isSelectionMode).toBe(true);
        expect(result.current.selectedCount).toBe(1);
      });
    });

    describe('exitSelectionMode', () => {
      it('should deactivate mode and clear selection', () => {
        const { result } = renderHook(() =>
          useItemSelection({ initialSelection: ['1', '2'] })
        );

        act(() => {
          result.current.exitSelectionMode();
        });

        expect(result.current.isSelectionMode).toBe(false);
        expect(result.current.selectedCount).toBe(0);
      });

      it('should be safe to call when not in selection mode', () => {
        const { result } = renderHook(() => useItemSelection());

        act(() => {
          result.current.exitSelectionMode();
        });

        expect(result.current.isSelectionMode).toBe(false);
        expect(result.current.selectedCount).toBe(0);
      });
    });

    describe('toggleSelectionMode', () => {
      it('should enter mode when off', () => {
        const { result } = renderHook(() => useItemSelection());

        act(() => {
          result.current.toggleSelectionMode();
        });

        expect(result.current.isSelectionMode).toBe(true);
      });

      it('should exit and clear when on', () => {
        const { result } = renderHook(() =>
          useItemSelection({ initialSelection: ['1', '2'] })
        );

        act(() => {
          result.current.toggleSelectionMode();
        });

        expect(result.current.isSelectionMode).toBe(false);
        expect(result.current.selectedCount).toBe(0);
      });

      it('should toggle multiple times correctly', () => {
        const { result } = renderHook(() => useItemSelection());

        // Off -> On
        act(() => {
          result.current.toggleSelectionMode();
        });
        expect(result.current.isSelectionMode).toBe(true);

        // Select some items while in mode
        act(() => {
          result.current.selectItem('1');
        });
        expect(result.current.selectedCount).toBe(1);

        // On -> Off (clears selection)
        act(() => {
          result.current.toggleSelectionMode();
        });
        expect(result.current.isSelectionMode).toBe(false);
        expect(result.current.selectedCount).toBe(0);

        // Off -> On again
        act(() => {
          result.current.toggleSelectionMode();
        });
        expect(result.current.isSelectionMode).toBe(true);
      });
    });
  });

  // ===========================================================================
  // Constraint Tests
  // ===========================================================================

  describe('Constraints', () => {
    it('should enforce maxSelection across operations', () => {
      const { result } = renderHook(() =>
        useItemSelection({ maxSelection: 3 })
      );

      act(() => {
        result.current.selectMultiple(['1', '2']);
      });

      expect(result.current.canSelectMore).toBe(true);

      act(() => {
        result.current.selectItem('3');
      });

      expect(result.current.isMaxSelected).toBe(true);
      expect(result.current.canSelectMore).toBe(false);

      // Should not add more
      act(() => {
        result.current.selectItem('4');
      });

      expect(result.current.selectedCount).toBe(3);
    });

    it('should update computed values correctly when at boundary', () => {
      const { result } = renderHook(() =>
        useItemSelection({ maxSelection: 2, initialSelection: ['1', '2'] })
      );

      expect(result.current.selectedCount).toBe(2);
      expect(result.current.isMaxSelected).toBe(true);
      expect(result.current.canSelectMore).toBe(false);

      act(() => {
        result.current.deselectItem('1');
      });

      expect(result.current.selectedCount).toBe(1);
      expect(result.current.isMaxSelected).toBe(false);
      expect(result.current.canSelectMore).toBe(true);
    });

    it('should handle maxSelection of 1', () => {
      const { result } = renderHook(() =>
        useItemSelection({ maxSelection: 1 })
      );

      act(() => {
        result.current.selectItem('1');
      });

      expect(result.current.selectedCount).toBe(1);
      expect(result.current.isMaxSelected).toBe(true);
      expect(result.current.canSelectMore).toBe(false);

      // Try to select another
      act(() => {
        result.current.selectItem('2');
      });

      expect(result.current.selectedCount).toBe(1);
      expect(result.current.isSelected('1')).toBe(true);
      expect(result.current.isSelected('2')).toBe(false);
    });
  });

  // ===========================================================================
  // Callback Tests
  // ===========================================================================

  describe('Callbacks', () => {
    it('should call onSelectionChange when selection changes', () => {
      const onSelectionChange = jest.fn();
      const { result } = renderHook(() =>
        useItemSelection({ onSelectionChange })
      );

      act(() => {
        result.current.selectItem('1');
      });

      expect(onSelectionChange).toHaveBeenCalledWith(['1']);
    });

    it('should call onSelectionChange with array of IDs', () => {
      const onSelectionChange = jest.fn();
      const { result } = renderHook(() =>
        useItemSelection({ onSelectionChange })
      );

      act(() => {
        result.current.selectMultiple(['1', '2', '3']);
      });

      expect(onSelectionChange).toHaveBeenCalled();
      const callArg = onSelectionChange.mock.calls[0][0];
      expect(Array.isArray(callArg)).toBe(true);
      expect(callArg).toContain('1');
      expect(callArg).toContain('2');
      expect(callArg).toContain('3');
    });

    it('should call onSelectionChange when clearing', () => {
      const onSelectionChange = jest.fn();
      const { result } = renderHook(() =>
        useItemSelection({ onSelectionChange, initialSelection: ['1', '2'] })
      );

      onSelectionChange.mockClear();

      act(() => {
        result.current.clearSelection();
      });

      expect(onSelectionChange).toHaveBeenCalledWith([]);
    });
  });

  // ===========================================================================
  // Utility Tests
  // ===========================================================================

  describe('Utilities', () => {
    describe('getSelectedItems', () => {
      it('should filter items correctly', () => {
        const { result } = renderHook(() =>
          useItemSelection({ initialSelection: ['1', '3'] })
        );

        const items = [
          { id: '1', name: 'One' },
          { id: '2', name: 'Two' },
          { id: '3', name: 'Three' },
        ];

        const selected = result.current.getSelectedItems(items);

        expect(selected).toHaveLength(2);
        expect(selected[0].name).toBe('One');
        expect(selected[1].name).toBe('Three');
      });

      it('should preserve item properties', () => {
        const { result } = renderHook(() =>
          useItemSelection({ initialSelection: ['1'] })
        );

        const items = [
          { id: '1', name: 'One', extra: 'data', nested: { value: 42 } },
        ];

        const selected = result.current.getSelectedItems(items);

        expect(selected[0].extra).toBe('data');
        expect(selected[0].nested.value).toBe(42);
      });

      it('should return empty array when no items match', () => {
        const { result } = renderHook(() =>
          useItemSelection({ initialSelection: ['99'] })
        );

        const items = [
          { id: '1', name: 'One' },
          { id: '2', name: 'Two' },
        ];

        const selected = result.current.getSelectedItems(items);

        expect(selected).toHaveLength(0);
      });

      it('should update when selection changes', () => {
        const { result } = renderHook(() => useItemSelection());

        const items = [
          { id: '1', name: 'One' },
          { id: '2', name: 'Two' },
        ];

        expect(result.current.getSelectedItems(items)).toHaveLength(0);

        act(() => {
          result.current.selectItem('1');
        });

        expect(result.current.getSelectedItems(items)).toHaveLength(1);
        expect(result.current.getSelectedItems(items)[0].id).toBe('1');
      });
    });

    describe('getSelectedArray', () => {
      it('should return array of IDs', () => {
        const { result } = renderHook(() =>
          useItemSelection({ initialSelection: ['1', '2'] })
        );

        const ids = result.current.getSelectedArray();

        expect(Array.isArray(ids)).toBe(true);
        expect(ids).toContain('1');
        expect(ids).toContain('2');
      });

      it('should return empty array when nothing selected', () => {
        const { result } = renderHook(() => useItemSelection());

        const ids = result.current.getSelectedArray();

        expect(ids).toHaveLength(0);
      });

      it('should update when selection changes', () => {
        const { result } = renderHook(() => useItemSelection());

        expect(result.current.getSelectedArray()).toHaveLength(0);

        act(() => {
          result.current.selectMultiple(['1', '2', '3']);
        });

        expect(result.current.getSelectedArray()).toHaveLength(3);
      });
    });
  });

  // ===========================================================================
  // Hook Export Verification
  // ===========================================================================

  describe('Hook Exports', () => {
    it('hook module exports useItemSelection function', async () => {
      const module = await import('../useItemSelection');

      expect(module.useItemSelection).toBeDefined();
      expect(typeof module.useItemSelection).toBe('function');
    });

    it('hook module has default export', async () => {
      const module = await import('../useItemSelection');

      expect(module.default).toBeDefined();
      expect(typeof module.default).toBe('function');
      expect(module.default).toBe(module.useItemSelection);
    });

    it('hook can be imported from barrel export', async () => {
      const module = await import('../index');

      expect(module.useItemSelection).toBeDefined();
      expect(typeof module.useItemSelection).toBe('function');
    });
  });
});
