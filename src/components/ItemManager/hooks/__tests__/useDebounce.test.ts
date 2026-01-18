/**
 * Tests for useDebounce hook
 *
 * @see docs/prd/item-capture-manager-implementation-plan.md (Phase 2, Task 2.3)
 * @lastModified 2026-01-04 (REQ-064 - Initial test suite)
 */

import { renderHook, act } from '@testing-library/react';
import { useDebounce, DEFAULT_DEBOUNCE_MS } from '../useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('initial value', () => {
    it('returns initial value immediately', () => {
      const { result } = renderHook(() => useDebounce('initial', 300));
      expect(result.current).toBe('initial');
    });

    it('works with different types', () => {
      const { result: stringResult } = renderHook(() => useDebounce('string', 300));
      expect(stringResult.current).toBe('string');

      const { result: numberResult } = renderHook(() => useDebounce(42, 300));
      expect(numberResult.current).toBe(42);

      const { result: objectResult } = renderHook(() => useDebounce({ key: 'value' }, 300));
      expect(objectResult.current).toEqual({ key: 'value' });

      const { result: boolResult } = renderHook(() => useDebounce(true, 300));
      expect(boolResult.current).toBe(true);
    });
  });

  describe('debouncing behavior', () => {
    it('does not update value immediately on change', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 300),
        { initialProps: { value: 'initial' } }
      );

      rerender({ value: 'updated' });
      expect(result.current).toBe('initial');
    });

    it('updates value after delay', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 300),
        { initialProps: { value: 'initial' } }
      );

      rerender({ value: 'updated' });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current).toBe('updated');
    });

    it('only emits latest value after rapid changes', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 300),
        { initialProps: { value: 'a' } }
      );

      rerender({ value: 'ab' });
      act(() => { jest.advanceTimersByTime(100); });

      rerender({ value: 'abc' });
      act(() => { jest.advanceTimersByTime(100); });

      rerender({ value: 'abcd' });
      act(() => { jest.advanceTimersByTime(300); });

      expect(result.current).toBe('abcd');
    });

    it('resets timer on each value change', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 300),
        { initialProps: { value: 'initial' } }
      );

      rerender({ value: 'first' });
      act(() => { jest.advanceTimersByTime(200); });

      // Still on initial because 300ms hasn't passed
      expect(result.current).toBe('initial');

      rerender({ value: 'second' });
      act(() => { jest.advanceTimersByTime(200); });

      // Still initial - timer was reset when value changed to 'second'
      expect(result.current).toBe('initial');

      act(() => { jest.advanceTimersByTime(100); });

      // Now should be 'second' (300ms from last change)
      expect(result.current).toBe('second');
    });
  });

  describe('zero delay', () => {
    it('updates immediately when delay is 0', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 0),
        { initialProps: { value: 'initial' } }
      );

      rerender({ value: 'updated' });
      expect(result.current).toBe('updated');
    });

    it('updates immediately when delay is negative', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, -100),
        { initialProps: { value: 'initial' } }
      );

      rerender({ value: 'updated' });
      expect(result.current).toBe('updated');
    });
  });

  describe('cleanup', () => {
    it('cancels pending update on unmount', () => {
      const { result, rerender, unmount } = renderHook(
        ({ value }) => useDebounce(value, 300),
        { initialProps: { value: 'initial' } }
      );

      rerender({ value: 'updated' });
      unmount();

      // Should not throw or cause memory leaks
      act(() => {
        jest.advanceTimersByTime(300);
      });

      // Value should still be 'initial' (last rendered value before unmount)
      expect(result.current).toBe('initial');
    });

    it('clears previous timeout when value changes', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 300),
        { initialProps: { value: 'initial' } }
      );

      rerender({ value: 'first' });
      rerender({ value: 'second' });

      // Only 'second' should be emitted after delay
      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current).toBe('second');
    });
  });

  describe('delay changes', () => {
    it('respects delay changes', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: 'initial', delay: 300 } }
      );

      rerender({ value: 'updated', delay: 500 });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      // Should not have updated yet (new delay is 500)
      expect(result.current).toBe('initial');

      act(() => {
        jest.advanceTimersByTime(200);
      });

      // Now should be updated (500ms total)
      expect(result.current).toBe('updated');
    });
  });

  describe('DEFAULT_DEBOUNCE_MS constant', () => {
    it('exports DEFAULT_DEBOUNCE_MS as 300', () => {
      expect(DEFAULT_DEBOUNCE_MS).toBe(300);
    });
  });
});
