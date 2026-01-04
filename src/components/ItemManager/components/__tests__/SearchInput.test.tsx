/**
 * Tests for SearchInput component
 *
 * @see docs/prd/item-capture-manager-implementation-plan.md (Phase 2, Task 2.3)
 * @lastModified 2026-01-04 (REQ-064 - Initial test suite)
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchInput } from '../SearchInput';

describe('SearchInput', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('rendering', () => {
    it('renders with default placeholder', () => {
      render(<SearchInput value="" onChange={() => {}} />);
      expect(screen.getByPlaceholderText('Search items...')).toBeInTheDocument();
    });

    it('renders with custom placeholder', () => {
      render(<SearchInput value="" onChange={() => {}} placeholder="Find items" />);
      expect(screen.getByPlaceholderText('Find items')).toBeInTheDocument();
    });

    it('shows search icon', () => {
      render(<SearchInput value="" onChange={() => {}} />);
      // Search icon should be present (aria-hidden)
      expect(screen.getByRole('searchbox')).toBeInTheDocument();
    });

    it('renders with provided value', () => {
      render(<SearchInput value="test value" onChange={() => {}} />);
      expect(screen.getByRole('searchbox')).toHaveValue('test value');
    });
  });

  describe('typing behavior', () => {
    it('updates local value immediately on typing', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<SearchInput value="" onChange={() => {}} />);

      const input = screen.getByRole('searchbox');
      await user.type(input, 'test');

      expect(input).toHaveValue('test');
    });

    it('debounces onChange callback', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      render(<SearchInput value="" onChange={onChange} debounceMs={300} />);

      const input = screen.getByRole('searchbox');
      await user.type(input, 'test');

      // onChange should not be called yet
      expect(onChange).not.toHaveBeenCalled();

      // Advance timers past debounce delay
      jest.advanceTimersByTime(300);

      expect(onChange).toHaveBeenCalledWith('test');
    });

    it('only calls onChange once for rapid typing', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      render(<SearchInput value="" onChange={onChange} debounceMs={300} />);

      const input = screen.getByRole('searchbox');
      await user.type(input, 'abc');

      // Advance past debounce
      jest.advanceTimersByTime(300);

      // Should be called once with final value
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith('abc');
    });
  });

  describe('clear button', () => {
    it('shows clear button when input has value', () => {
      render(<SearchInput value="test" onChange={() => {}} />);
      expect(screen.getByLabelText('Clear search')).toBeInTheDocument();
    });

    it('hides clear button when input is empty', () => {
      render(<SearchInput value="" onChange={() => {}} />);
      expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument();
    });

    it('hides clear button when disabled', () => {
      render(<SearchInput value="test" onChange={() => {}} disabled />);
      expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument();
    });

    it('clears input immediately when clear button clicked', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      render(<SearchInput value="test" onChange={onChange} />);

      const clearButton = screen.getByLabelText('Clear search');
      await user.click(clearButton);

      // Should call onChange immediately with empty string (bypass debounce)
      expect(onChange).toHaveBeenCalledWith('');
    });

    it('refocuses input after clearing', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      render(<SearchInput value="test" onChange={() => {}} />);

      const input = screen.getByRole('searchbox');
      const clearButton = screen.getByLabelText('Clear search');

      await user.click(clearButton);

      expect(input).toHaveFocus();
    });
  });

  describe('keyboard shortcuts', () => {
    it('clears input on Escape key when has value', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      render(<SearchInput value="" onChange={onChange} />);

      const input = screen.getByRole('searchbox');
      await user.type(input, 'test');
      await user.keyboard('{Escape}');

      expect(onChange).toHaveBeenCalledWith('');
    });

    it('blurs input on Escape when empty', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      render(<SearchInput value="" onChange={() => {}} />);

      const input = screen.getByRole('searchbox');
      input.focus();
      expect(input).toHaveFocus();

      await user.keyboard('{Escape}');

      expect(input).not.toHaveFocus();
    });
  });

  describe('disabled state', () => {
    it('disables input when disabled prop is true', () => {
      render(<SearchInput value="" onChange={() => {}} disabled />);
      expect(screen.getByRole('searchbox')).toBeDisabled();
    });

    it('applies disabled styling', () => {
      render(<SearchInput value="" onChange={() => {}} disabled />);
      const input = screen.getByRole('searchbox');
      expect(input).toHaveClass('bg-gray-50');
      expect(input).toHaveClass('cursor-not-allowed');
    });

    it('prevents typing when disabled', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      render(<SearchInput value="" onChange={onChange} disabled />);

      const input = screen.getByRole('searchbox');
      await user.type(input, 'test');

      // Input should not receive the typed text
      expect(input).toHaveValue('');
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('has correct accessibility attributes', () => {
      render(<SearchInput value="" onChange={() => {}} placeholder="Search" />);

      const input = screen.getByRole('searchbox');
      expect(input).toHaveAttribute('aria-label', 'Search');
    });

    it('has searchbox role', () => {
      render(<SearchInput value="" onChange={() => {}} />);
      expect(screen.getByRole('searchbox')).toBeInTheDocument();
    });

    it('clear button has aria-label', () => {
      render(<SearchInput value="test" onChange={() => {}} />);
      expect(screen.getByLabelText('Clear search')).toBeInTheDocument();
    });

    it('search icon is hidden from screen readers', () => {
      const { container } = render(<SearchInput value="" onChange={() => {}} />);
      const icon = container.querySelector('svg');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('custom props', () => {
    it('applies custom className to container', () => {
      const { container } = render(
        <SearchInput value="" onChange={() => {}} className="custom-class" />
      );
      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('applies custom inputClassName to input', () => {
      render(
        <SearchInput value="" onChange={() => {}} inputClassName="input-custom" />
      );
      expect(screen.getByRole('searchbox')).toHaveClass('input-custom');
    });

    it('passes id prop to input', () => {
      render(<SearchInput value="" onChange={() => {}} id="search-field" />);
      expect(screen.getByRole('searchbox')).toHaveAttribute('id', 'search-field');
    });

    it('calls onFocus callback when focused', async () => {
      const onFocus = jest.fn();
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      render(<SearchInput value="" onChange={() => {}} onFocus={onFocus} />);

      const input = screen.getByRole('searchbox');
      await user.click(input);

      expect(onFocus).toHaveBeenCalled();
    });

    it('calls onBlur callback when blurred', async () => {
      const onBlur = jest.fn();
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      render(
        <>
          <SearchInput value="" onChange={() => {}} onBlur={onBlur} />
          <button>Other</button>
        </>
      );

      const input = screen.getByRole('searchbox');
      await user.click(input);
      await user.click(screen.getByText('Other'));

      expect(onBlur).toHaveBeenCalled();
    });
  });

  describe('controlled component', () => {
    it('syncs with external value changes', () => {
      const { rerender } = render(
        <SearchInput value="initial" onChange={() => {}} />
      );

      expect(screen.getByRole('searchbox')).toHaveValue('initial');

      rerender(<SearchInput value="updated" onChange={() => {}} />);

      expect(screen.getByRole('searchbox')).toHaveValue('updated');
    });
  });

  describe('zero debounce', () => {
    it('calls onChange immediately when debounceMs is 0', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      render(<SearchInput value="" onChange={onChange} debounceMs={0} />);

      const input = screen.getByRole('searchbox');
      await user.type(input, 't');

      // Should call immediately for each character
      expect(onChange).toHaveBeenCalledWith('t');
    });
  });
});
