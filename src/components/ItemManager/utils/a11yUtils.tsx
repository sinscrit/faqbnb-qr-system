/**
 * Accessibility Utility Hooks and Helpers
 *
 * Provides reusable accessibility utilities for focus management,
 * announcements, and keyboard navigation across ItemManager components.
 *
 * @module ItemManager/utils/a11yUtils
 * @see docs/REQ-090-accessibility-audit-detailed.md
 * @lastModified 2026-01-03 (REQ-090 Task 1 - Initial creation)
 */

import {
  useEffect,
  useRef,
  useCallback,
  useState,
  type RefObject,
} from 'react';

// =============================================================================
// Constants
// =============================================================================

/**
 * Selector for all focusable elements within a container.
 * Used for focus trapping and keyboard navigation.
 */
export const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  '[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

// =============================================================================
// Types
// =============================================================================

/**
 * Options for the keyboard navigator utility.
 */
export interface KeyboardNavigatorOptions {
  /** Navigation axis: 'horizontal', 'vertical', or 'both' */
  orientation: 'horizontal' | 'vertical' | 'both';
  /** Whether navigation wraps from end to start and vice versa */
  wrap?: boolean;
  /** Total number of navigable items */
  itemCount: number;
  /** Callback when navigation changes the focused index */
  onNavigate: (index: number) => void;
  /** Current focused index */
  currentIndex: number;
}

/**
 * Politeness level for screen reader announcements.
 */
export type AnnouncementPoliteness = 'polite' | 'assertive';

// =============================================================================
// useFocusTrap Hook
// =============================================================================

/**
 * Hook that traps focus within a container when active.
 * Stores the previously focused element and restores focus on deactivation.
 *
 * @param containerRef - Ref to the container element to trap focus within
 * @param isActive - Whether the focus trap is currently active
 *
 * @example
 * ```tsx
 * function Modal({ isOpen, onClose }) {
 *   const modalRef = useRef<HTMLDivElement>(null);
 *   useFocusTrap(modalRef, isOpen);
 *
 *   return <div ref={modalRef}>...</div>;
 * }
 * ```
 */
export function useFocusTrap(
  containerRef: RefObject<HTMLElement>,
  isActive: boolean
): void {
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    // Store the currently focused element to restore later
    previouslyFocusedRef.current = document.activeElement as HTMLElement;

    const container = containerRef.current;

    // Get all focusable elements
    const getFocusableElements = () => {
      return Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      ).filter((el) => el.offsetParent !== null); // Filter out hidden elements
    };

    // Focus the first focusable element
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    } else {
      // If no focusable elements, make the container itself focusable
      container.setAttribute('tabindex', '-1');
      container.focus();
    }

    // Handle Tab key to cycle within container
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) {
        e.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        // Shift+Tab: if on first element, move to last
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab: if on last element, move to first
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);

      // Restore focus to previously focused element
      if (previouslyFocusedRef.current && previouslyFocusedRef.current.focus) {
        previouslyFocusedRef.current.focus();
      }
    };
  }, [isActive, containerRef]);
}

// =============================================================================
// useFocusRestore Hook
// =============================================================================

/**
 * Hook that stores the active element when opening and restores focus when closing.
 * Simpler alternative to useFocusTrap when focus trapping isn't needed.
 *
 * @param isOpen - Whether the modal/dialog is open
 *
 * @example
 * ```tsx
 * function Dialog({ isOpen, onClose }) {
 *   useFocusRestore(isOpen);
 *
 *   return isOpen ? <div>...</div> : null;
 * }
 * ```
 */
export function useFocusRestore(isOpen: boolean): void {
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element
      previouslyFocusedRef.current = document.activeElement as HTMLElement;
    } else if (previouslyFocusedRef.current) {
      // Restore focus when closing
      previouslyFocusedRef.current.focus();
      previouslyFocusedRef.current = null;
    }
  }, [isOpen]);
}

// =============================================================================
// useAnnounce Hook
// =============================================================================

/**
 * Hook that provides a function to announce messages to screen readers.
 * Returns both the announce function and an AnnouncerRegion component to render.
 *
 * @returns Object with announce function and AnnouncerRegion component
 *
 * @example
 * ```tsx
 * function ItemList({ items }) {
 *   const { announce, AnnouncerRegion } = useAnnounce();
 *
 *   const handleDelete = () => {
 *     // ... delete item
 *     announce('Item deleted');
 *   };
 *
 *   return (
 *     <div>
 *       <AnnouncerRegion />
 *       {items.map(item => ...)}
 *     </div>
 *   );
 * }
 * ```
 */
export function useAnnounce(): {
  announce: (message: string, politeness?: AnnouncementPoliteness) => void;
  AnnouncerRegion: React.FC;
} {
  const [politeMessage, setPoliteMessage] = useState('');
  const [assertiveMessage, setAssertiveMessage] = useState('');

  /**
   * Announce a message to screen readers.
   * Briefly clears the message before setting to ensure re-announcement.
   */
  const announce = useCallback(
    (message: string, politeness: AnnouncementPoliteness = 'polite') => {
      if (politeness === 'assertive') {
        // Clear then set to force re-announcement
        setAssertiveMessage('');
        setTimeout(() => setAssertiveMessage(message), 50);
      } else {
        setPoliteMessage('');
        setTimeout(() => setPoliteMessage(message), 50);
      }
    },
    []
  );

  /**
   * Announcer region component to render in JSX.
   * Contains visually hidden live regions for screen reader announcements.
   */
  const AnnouncerRegion: React.FC = useCallback(() => {
    return (
      <>
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        >
          {politeMessage}
        </div>
        <div
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
          className="sr-only"
        >
          {assertiveMessage}
        </div>
      </>
    );
  }, [politeMessage, assertiveMessage]);

  return { announce, AnnouncerRegion };
}

// =============================================================================
// createKeyboardNavigator Utility
// =============================================================================

/**
 * Creates a keyboard event handler for arrow key navigation.
 * Supports horizontal, vertical, or both navigation axes.
 *
 * @param options - Navigation configuration options
 * @returns Keyboard event handler function
 *
 * @example
 * ```tsx
 * function MenuList({ items }) {
 *   const [focusedIndex, setFocusedIndex] = useState(0);
 *
 *   const handleKeyDown = createKeyboardNavigator({
 *     orientation: 'vertical',
 *     wrap: true,
 *     itemCount: items.length,
 *     currentIndex: focusedIndex,
 *     onNavigate: setFocusedIndex,
 *   });
 *
 *   return (
 *     <ul onKeyDown={handleKeyDown}>
 *       {items.map((item, idx) => (
 *         <li key={item.id} tabIndex={idx === focusedIndex ? 0 : -1}>
 *           {item.label}
 *         </li>
 *       ))}
 *     </ul>
 *   );
 * }
 * ```
 */
export function createKeyboardNavigator(
  options: KeyboardNavigatorOptions
): (e: React.KeyboardEvent) => void {
  const { orientation, wrap = true, itemCount, onNavigate, currentIndex } = options;

  return (e: React.KeyboardEvent) => {
    if (itemCount === 0) return;

    let newIndex = currentIndex;
    const isHorizontal = orientation === 'horizontal' || orientation === 'both';
    const isVertical = orientation === 'vertical' || orientation === 'both';

    switch (e.key) {
      case 'ArrowRight':
        if (isHorizontal) {
          e.preventDefault();
          newIndex = currentIndex + 1;
          if (newIndex >= itemCount) {
            newIndex = wrap ? 0 : itemCount - 1;
          }
        }
        break;

      case 'ArrowLeft':
        if (isHorizontal) {
          e.preventDefault();
          newIndex = currentIndex - 1;
          if (newIndex < 0) {
            newIndex = wrap ? itemCount - 1 : 0;
          }
        }
        break;

      case 'ArrowDown':
        if (isVertical) {
          e.preventDefault();
          newIndex = currentIndex + 1;
          if (newIndex >= itemCount) {
            newIndex = wrap ? 0 : itemCount - 1;
          }
        }
        break;

      case 'ArrowUp':
        if (isVertical) {
          e.preventDefault();
          newIndex = currentIndex - 1;
          if (newIndex < 0) {
            newIndex = wrap ? itemCount - 1 : 0;
          }
        }
        break;

      case 'Home':
        e.preventDefault();
        newIndex = 0;
        break;

      case 'End':
        e.preventDefault();
        newIndex = itemCount - 1;
        break;

      default:
        return;
    }

    if (newIndex !== currentIndex) {
      onNavigate(newIndex);
    }
  };
}

// =============================================================================
// useRovingTabIndex Hook
// =============================================================================

/**
 * Hook that manages roving tabindex for a group of elements.
 * Only one element in the group is tabbable at a time.
 *
 * @param itemCount - Number of items in the group
 * @param initialIndex - Initial focused index (default: 0)
 * @returns Object with current index, setIndex, and keyboard handler
 *
 * @example
 * ```tsx
 * function Toolbar({ items }) {
 *   const { currentIndex, setIndex, handleKeyDown } = useRovingTabIndex(items.length);
 *
 *   return (
 *     <div role="toolbar" onKeyDown={handleKeyDown}>
 *       {items.map((item, idx) => (
 *         <button
 *           key={item.id}
 *           tabIndex={idx === currentIndex ? 0 : -1}
 *           onFocus={() => setIndex(idx)}
 *         >
 *           {item.label}
 *         </button>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useRovingTabIndex(
  itemCount: number,
  initialIndex: number = 0
): {
  currentIndex: number;
  setIndex: (index: number) => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
} {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const handler = createKeyboardNavigator({
        orientation: 'both',
        wrap: true,
        itemCount,
        currentIndex,
        onNavigate: setCurrentIndex,
      });
      handler(e);
    },
    [itemCount, currentIndex]
  );

  return {
    currentIndex,
    setIndex: setCurrentIndex,
    handleKeyDown,
  };
}

// =============================================================================
// getAriaDescribedBy Utility
// =============================================================================

/**
 * Helper to build aria-describedby string from multiple optional IDs.
 *
 * @param ids - Array of optional ID strings
 * @returns Combined ID string or undefined if no IDs
 *
 * @example
 * ```tsx
 * <input
 *   aria-describedby={getAriaDescribedBy([hintId, errorId])}
 * />
 * ```
 */
export function getAriaDescribedBy(
  ids: (string | undefined | null)[]
): string | undefined {
  const validIds = ids.filter(Boolean) as string[];
  return validIds.length > 0 ? validIds.join(' ') : undefined;
}

// =============================================================================
// Screen Reader Only Styles (CSS-in-JS compatible)
// =============================================================================

/**
 * CSS properties for visually hiding content while keeping it accessible to screen readers.
 * Use with styled-components, emotion, or inline styles.
 */
export const srOnlyStyles: React.CSSProperties = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  borderWidth: 0,
};
