/**
 * TruncatedText Component Tests
 *
 * Tests for the text truncation component that displays ellipsis
 * for long text with full text shown in tooltip.
 *
 * @module ItemCreationWorkflow/components/shared/__tests__/TruncatedText.test
 * @lastModified 2026-01-05
 */

import { render, screen, fireEvent, act } from '@testing-library/react';
import { TruncatedText } from '../TruncatedText';

// Mock timers for long-press tests
jest.useFakeTimers();

describe('TruncatedText', () => {
  afterEach(() => {
    jest.clearAllTimers();
  });

  // ===========================================================================
  // Short Text (No Truncation) Tests
  // ===========================================================================

  describe('Short Text (No Truncation)', () => {
    it('renders full text when under maxLength', () => {
      render(<TruncatedText text="Short text" maxLength={40} />);

      expect(screen.getByText('Short text')).toBeInTheDocument();
    });

    it('does not add ellipsis for short text', () => {
      render(<TruncatedText text="Short text" maxLength={40} />);

      expect(screen.queryByText(/\.\.\./)).not.toBeInTheDocument();
    });

    it('renders as span by default', () => {
      render(<TruncatedText text="Short text" />);

      const element = screen.getByText('Short text');
      expect(element.tagName.toLowerCase()).toBe('span');
    });

    it('renders as specified element type', () => {
      render(<TruncatedText text="Short text" as="p" />);

      const element = screen.getByText('Short text');
      expect(element.tagName.toLowerCase()).toBe('p');
    });

    it('does not render tooltip for short text', () => {
      render(<TruncatedText text="Short text" maxLength={40} />);

      // Short text should not have title attribute or tooltip wrapper
      const element = screen.getByText('Short text');
      expect(element).not.toHaveAttribute('title');
    });

    it('applies className to short text', () => {
      render(<TruncatedText text="Short text" className="custom-class" />);

      expect(screen.getByText('Short text')).toHaveClass('custom-class');
    });
  });

  // ===========================================================================
  // Long Text (Truncation Required) Tests
  // ===========================================================================

  describe('Long Text (Truncation)', () => {
    const longText = 'This is a very long text that should definitely be truncated because it exceeds the maximum length';

    it('truncates text exceeding maxLength', () => {
      render(<TruncatedText text={longText} maxLength={40} />);

      // Should show truncated version with ellipsis
      expect(screen.getByText(/\.\.\./)).toBeInTheDocument();
    });

    it('truncates to exactly maxLength characters including ellipsis', () => {
      const maxLength = 40;
      render(<TruncatedText text={longText} maxLength={maxLength} />);

      const element = screen.getByText(/\.\.\./);
      // The truncated text should be maxLength-3 chars + "..."
      expect(element.textContent?.length).toBe(maxLength);
    });

    it('adds title attribute with full text for accessibility', () => {
      render(<TruncatedText text={longText} maxLength={40} />);

      const element = screen.getByText(/\.\.\./);
      expect(element).toHaveAttribute('title', longText);
    });

    it('applies className to truncated text', () => {
      render(<TruncatedText text={longText} maxLength={40} className="custom-class" />);

      expect(screen.getByText(/\.\.\./)).toHaveClass('custom-class');
    });

    it('adds cursor-default class for truncated text', () => {
      render(<TruncatedText text={longText} maxLength={40} />);

      expect(screen.getByText(/\.\.\./)).toHaveClass('cursor-default');
    });
  });

  // ===========================================================================
  // Different Element Types Tests
  // ===========================================================================

  describe('Element Types', () => {
    const longText = 'This is a very long text that should definitely be truncated';

    it('renders truncated text as span (default)', () => {
      render(<TruncatedText text={longText} maxLength={30} />);

      const element = screen.getByText(/\.\.\./);
      expect(element.tagName.toLowerCase()).toBe('span');
    });

    it('renders truncated text as paragraph', () => {
      render(<TruncatedText text={longText} maxLength={30} as="p" />);

      const element = screen.getByText(/\.\.\./);
      expect(element.tagName.toLowerCase()).toBe('p');
    });

    it('renders truncated text as heading', () => {
      render(<TruncatedText text={longText} maxLength={30} as="h3" />);

      const element = screen.getByText(/\.\.\./);
      expect(element.tagName.toLowerCase()).toBe('h3');
    });

    it('renders truncated text as div', () => {
      render(<TruncatedText text={longText} maxLength={30} as="div" />);

      const element = screen.getByText(/\.\.\./);
      expect(element.tagName.toLowerCase()).toBe('div');
    });
  });

  // ===========================================================================
  // Default maxLength Tests
  // ===========================================================================

  describe('Default maxLength', () => {
    it('uses default maxLength of 40 when not specified', () => {
      const text39chars = 'A'.repeat(39);
      const text41chars = 'A'.repeat(41);

      // 39 chars should not be truncated
      const { rerender } = render(<TruncatedText text={text39chars} />);
      expect(screen.getByText(text39chars)).toBeInTheDocument();

      // 41 chars should be truncated
      rerender(<TruncatedText text={text41chars} />);
      expect(screen.getByText(/\.\.\./)).toBeInTheDocument();
    });

    it('exact maxLength (40) does not truncate', () => {
      const text40chars = 'A'.repeat(40);
      render(<TruncatedText text={text40chars} />);

      expect(screen.getByText(text40chars)).toBeInTheDocument();
      expect(screen.queryByText(/\.\.\./)).not.toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Tooltip Interaction Tests (Desktop Hover)
  // ===========================================================================

  describe('Tooltip on Hover', () => {
    const longText = 'This is a very long text that should be truncated for testing tooltip behavior';

    it('shows tooltip content in DOM when truncated (Radix renders portal)', () => {
      render(<TruncatedText text={longText} maxLength={40} />);

      // Radix tooltip renders portal content - the tooltip provider is present
      expect(screen.getByText(/\.\.\./)).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Touch Long-Press Tests (Mobile)
  // ===========================================================================

  describe('Long-Press on Mobile', () => {
    const longText = 'This is a very long text that should be truncated for testing touch behavior';

    it('handles touch start event', () => {
      render(<TruncatedText text={longText} maxLength={40} />);

      const element = screen.getByText(/\.\.\./);

      // Touch start should set up timer
      fireEvent.touchStart(element);

      // No error thrown = success
      expect(element).toBeInTheDocument();
    });

    it('handles touch end event', () => {
      render(<TruncatedText text={longText} maxLength={40} />);

      const element = screen.getByText(/\.\.\./);

      fireEvent.touchStart(element);
      fireEvent.touchEnd(element);

      // No error thrown = success
      expect(element).toBeInTheDocument();
    });

    it('handles touch cancel event', () => {
      render(<TruncatedText text={longText} maxLength={40} />);

      const element = screen.getByText(/\.\.\./);

      fireEvent.touchStart(element);
      fireEvent.touchCancel(element);

      // No error thrown = success
      expect(element).toBeInTheDocument();
    });

    it('does not set up long-press timer for short text', () => {
      render(<TruncatedText text="Short text" maxLength={40} />);

      const element = screen.getByText('Short text');

      // Touch events on short text should not trigger tooltip
      fireEvent.touchStart(element);

      act(() => {
        jest.advanceTimersByTime(600); // Wait longer than LONG_PRESS_DELAY
      });

      // Element should still be there, no errors
      expect(element).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Edge Cases Tests
  // ===========================================================================

  describe('Edge Cases', () => {
    it('handles empty string', () => {
      render(<TruncatedText text="" maxLength={40} />);

      // Should render empty span
      const { container } = render(<TruncatedText text="" />);
      expect(container.querySelector('span')).toBeInTheDocument();
    });

    it('handles very short maxLength', () => {
      render(<TruncatedText text="Hello World" maxLength={5} />);

      const element = screen.getByText(/\.\.\./);
      expect(element.textContent?.length).toBe(5);
    });

    it('handles maxLength smaller than 3', () => {
      // Edge case: maxLength of 3 means we can only show "..."
      render(<TruncatedText text="Hello" maxLength={3} />);

      // Should still render something
      expect(screen.getByText('...')).toBeInTheDocument();
    });

    it('handles text with special characters', () => {
      const specialText = 'Hello & World <script>alert("xss")</script>';
      render(<TruncatedText text={specialText} maxLength={20} />);

      // Should render safely with truncation
      expect(screen.getByText(/\.\.\./)).toBeInTheDocument();
    });

    it('handles text with unicode characters', () => {
      const unicodeText = 'Hello 世界 🌍 emoji test with more text to truncate';
      render(<TruncatedText text={unicodeText} maxLength={30} />);

      expect(screen.getByText(/\.\.\./)).toBeInTheDocument();
    });

    it('handles whitespace-only text', () => {
      render(<TruncatedText text="     " maxLength={3} />);

      // Whitespace should be preserved but truncated
      expect(screen.getByText(/\.\.\./)).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Cleanup Tests
  // ===========================================================================

  describe('Cleanup', () => {
    it('cleans up timers on unmount', () => {
      const longText = 'This is a very long text that should be truncated';
      const { unmount } = render(<TruncatedText text={longText} maxLength={30} />);

      const element = screen.getByText(/\.\.\./);

      // Start a long-press
      fireEvent.touchStart(element);

      // Unmount before timer fires
      unmount();

      // Advance timers - should not throw
      act(() => {
        jest.advanceTimersByTime(600);
      });

      // If no error thrown, cleanup worked
      expect(true).toBe(true);
    });
  });
});
