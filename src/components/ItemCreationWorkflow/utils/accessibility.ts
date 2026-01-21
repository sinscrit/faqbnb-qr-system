'use client';

/**
 * Accessibility Utilities for ItemCreationWorkflow
 *
 * Provides reusable hooks and utilities for accessibility features including:
 * - Reduced motion detection
 * - Focus trapping for modals/dialogs
 * - Screen reader announcements
 * - Focus management on mount
 * - Keyboard navigation helpers
 *
 * @module ItemCreationWorkflow/utils/accessibility
 * @see docs/REQ-114-accessibility-mobile-optimization-overview.md
 * @lastModified 2026-01-10 (REQ-174 Accessibility Audit)
 */

import { useEffect, useRef, useState, useCallback } from 'react';

// =============================================================================
// Constants
// =============================================================================

/** Selector for all focusable elements within a container */
const FOCUSABLE_ELEMENTS_SELECTOR = [
  'button:not([disabled])',
  'a[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

// =============================================================================
// useReducedMotion Hook
// =============================================================================

/**
 * Hook to detect user's reduced motion preference.
 * Returns true if the user prefers reduced motion (accessibility setting).
 *
 * @returns {boolean} True if prefers-reduced-motion: reduce is set
 *
 * @example
 * const prefersReducedMotion = useReducedMotion();
 * if (prefersReducedMotion) {
 *   // Skip animations
 * }
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Handle SSR - check if window is available
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Set initial value
    setPrefersReducedMotion(mediaQuery.matches);

    // Listen for changes
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    // Modern browsers use addEventListener, older use addListener
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  return prefersReducedMotion;
}

// =============================================================================
// useFocusTrap Hook
// =============================================================================

/**
 * Hook to trap focus within a container element (for modals/dialogs).
 * When active, Tab and Shift+Tab will cycle focus within the container.
 *
 * @param containerRef - Ref to the container element
 * @param isActive - Whether the focus trap is active
 *
 * @example
 * const dialogRef = useRef<HTMLDivElement>(null);
 * useFocusTrap(dialogRef, isDialogOpen);
 */
export function useFocusTrap(
  containerRef: React.RefObject<HTMLElement | null>,
  isActive: boolean
): void {
  // Store the previously focused element to restore focus when trap is deactivated
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;

    // Store the currently focused element before trapping
    previousFocusRef.current = document.activeElement as HTMLElement;

    /**
     * Gets all focusable elements within the container
     */
    const getFocusableElements = (): HTMLElement[] => {
      const elements = container.querySelectorAll<HTMLElement>(FOCUSABLE_ELEMENTS_SELECTOR);
      return Array.from(elements);
    };

    /**
     * Handles keydown events to trap focus
     */
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      // Shift + Tab: moving backwards
      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab: moving forwards
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    // Add event listener
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);

      // Restore focus to previously focused element when trap is deactivated
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        // Use setTimeout to ensure DOM has updated
        setTimeout(() => {
          previousFocusRef.current?.focus();
        }, 0);
      }
    };
  }, [containerRef, isActive]);
}

// =============================================================================
// useAnnounce Hook
// =============================================================================

/**
 * Hook to announce messages to screen readers via a live region.
 *
 * @returns Object with announce and clearAnnouncement functions
 *
 * @example
 * const { announce } = useAnnounce();
 * announce('Step 2 of 9: Select item type');
 * announce('Error: Please select a room', 'assertive');
 */
export function useAnnounce(): {
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
  clearAnnouncement: () => void;
} {
  const announcementRef = useRef<HTMLDivElement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Create or get the announcement element
  useEffect(() => {
    // Check if element already exists
    let element = document.getElementById('a11y-announcer') as HTMLDivElement | null;

    if (!element) {
      element = document.createElement('div');
      element.id = 'a11y-announcer';
      element.setAttribute('role', 'status');
      element.setAttribute('aria-live', 'polite');
      element.setAttribute('aria-atomic', 'true');
      // Screen-reader only styles
      element.style.cssText = `
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      `;
      document.body.appendChild(element);
    }

    announcementRef.current = element;

    return () => {
      // Clean up timeout on unmount
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!announcementRef.current) return;

    // Update aria-live attribute based on priority
    announcementRef.current.setAttribute('aria-live', priority);

    // Clear existing content first (helps ensure announcement is made)
    announcementRef.current.textContent = '';

    // Set new message after a brief delay to ensure screen readers pick it up
    requestAnimationFrame(() => {
      if (announcementRef.current) {
        announcementRef.current.textContent = message;
      }
    });

    // Auto-clear after a delay
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      if (announcementRef.current) {
        announcementRef.current.textContent = '';
      }
    }, 5000);
  }, []);

  const clearAnnouncement = useCallback(() => {
    if (announcementRef.current) {
      announcementRef.current.textContent = '';
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  return { announce, clearAnnouncement };
}

// =============================================================================
// useFocusOnMount Hook
// =============================================================================

/**
 * Hook to focus an element when it mounts (or when condition becomes true).
 * Useful for focusing step headings when navigating between workflow steps.
 *
 * @param elementRef - Ref to the element to focus
 * @param shouldFocus - Whether to focus the element (default: true)
 *
 * @example
 * const headingRef = useRef<HTMLHeadingElement>(null);
 * useFocusOnMount(headingRef, isStepActive);
 */
export function useFocusOnMount(
  elementRef: React.RefObject<HTMLElement>,
  shouldFocus: boolean = true
): void {
  useEffect(() => {
    if (shouldFocus && elementRef.current) {
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        elementRef.current?.focus();
      });
    }
  }, [elementRef, shouldFocus]);
}

// =============================================================================
// Keyboard Navigation Utility
// =============================================================================

/**
 * Configuration for keyboard navigator
 */
export interface KeyboardNavigatorConfig {
  /** Array of focusable item elements */
  items: HTMLElement[];
  /** Navigation orientation */
  orientation: 'horizontal' | 'vertical' | 'grid';
  /** Number of columns (required for grid orientation) */
  columns?: number;
  /** Whether navigation should loop at boundaries */
  loop?: boolean;
  /** Callback when an item is selected (Enter/Space) */
  onSelect?: (index: number) => void;
  /** Callback when focus moves to a new index */
  onFocusChange?: (index: number) => void;
}

/**
 * Creates a keyboard event handler for navigating through a list of items.
 * Supports horizontal, vertical, and grid navigation patterns.
 *
 * @param config - Configuration for the keyboard navigator
 * @returns Keyboard event handler function
 *
 * @example
 * const handleKeyDown = createKeyboardNavigator({
 *   items: cardRefs.current.filter(Boolean),
 *   orientation: 'grid',
 *   columns: 4,
 *   loop: true,
 *   onSelect: (index) => selectItem(index),
 *   onFocusChange: (index) => setActiveIndex(index)
 * });
 */
export function createKeyboardNavigator(config: KeyboardNavigatorConfig): (event: React.KeyboardEvent) => void {
  const {
    items,
    orientation,
    columns = 1,
    loop = false,
    onSelect,
    onFocusChange,
  } = config;

  return (event: React.KeyboardEvent) => {
    if (items.length === 0) return;

    // Find current focused item index
    const currentIndex = items.findIndex(item => item === document.activeElement);
    if (currentIndex === -1) return;

    let nextIndex = currentIndex;
    let handled = false;

    switch (event.key) {
      case 'ArrowRight': {
        if (orientation === 'horizontal' || orientation === 'grid') {
          nextIndex = currentIndex + 1;
          if (nextIndex >= items.length) {
            nextIndex = loop ? 0 : items.length - 1;
          }
          handled = true;
        }
        break;
      }

      case 'ArrowLeft': {
        if (orientation === 'horizontal' || orientation === 'grid') {
          nextIndex = currentIndex - 1;
          if (nextIndex < 0) {
            nextIndex = loop ? items.length - 1 : 0;
          }
          handled = true;
        }
        break;
      }

      case 'ArrowDown': {
        if (orientation === 'vertical') {
          nextIndex = currentIndex + 1;
          if (nextIndex >= items.length) {
            nextIndex = loop ? 0 : items.length - 1;
          }
          handled = true;
        } else if (orientation === 'grid') {
          nextIndex = currentIndex + columns;
          if (nextIndex >= items.length) {
            nextIndex = loop ? currentIndex % columns : currentIndex;
          }
          handled = true;
        }
        break;
      }

      case 'ArrowUp': {
        if (orientation === 'vertical') {
          nextIndex = currentIndex - 1;
          if (nextIndex < 0) {
            nextIndex = loop ? items.length - 1 : 0;
          }
          handled = true;
        } else if (orientation === 'grid') {
          nextIndex = currentIndex - columns;
          if (nextIndex < 0) {
            // Calculate the position in the last row
            const lastRowStart = Math.floor((items.length - 1) / columns) * columns;
            const targetColumn = currentIndex % columns;
            const lastRowIndex = lastRowStart + targetColumn;
            nextIndex = loop ? Math.min(lastRowIndex, items.length - 1) : currentIndex;
          }
          handled = true;
        }
        break;
      }

      case 'Home': {
        nextIndex = 0;
        handled = true;
        break;
      }

      case 'End': {
        nextIndex = items.length - 1;
        handled = true;
        break;
      }

      case 'Enter':
      case ' ': {
        if (onSelect) {
          event.preventDefault();
          onSelect(currentIndex);
        }
        return;
      }
    }

    if (handled) {
      event.preventDefault();

      // Focus the new item
      if (nextIndex !== currentIndex && items[nextIndex]) {
        items[nextIndex].focus();

        // Notify about focus change
        if (onFocusChange) {
          onFocusChange(nextIndex);
        }
      }
    }
  };
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Gets all focusable elements within a container.
 *
 * @param container - Container element to search within
 * @returns Array of focusable elements
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const elements = container.querySelectorAll<HTMLElement>(FOCUSABLE_ELEMENTS_SELECTOR);
  return Array.from(elements);
}

/**
 * Moves focus to the first focusable element in a container.
 *
 * @param container - Container element to search within
 * @returns True if focus was successfully moved
 */
export function focusFirstElement(container: HTMLElement): boolean {
  const focusableElements = getFocusableElements(container);
  if (focusableElements.length > 0) {
    focusableElements[0].focus();
    return true;
  }
  return false;
}

/**
 * Generates a descriptive step announcement for screen readers.
 *
 * @param currentStep - Current step number (1-based)
 * @param totalSteps - Total number of steps
 * @param stepName - Human-readable step name
 * @returns Formatted announcement string
 */
export function getStepAnnouncement(
  currentStep: number,
  totalSteps: number,
  stepName: string
): string {
  return `Step ${currentStep} of ${totalSteps}: ${stepName}`;
}

/**
 * Step names for announcement purposes
 * Updated for REQ-176: Added media-capture step
 */
export const STEP_NAMES: Record<string, string> = {
  'room-selection': 'Select a room',
  'item-type-selection': 'Choose item type',
  'specific-item-selection': 'Name your item',
  'purpose-selection': 'Select purpose',
  'content-type-selection': 'Choose content type',
  'media-capture': 'Capture content',         // NEW - REQ-176
  'content-creation': 'Create content',
  'preview-save': 'Preview and save',
  'next-action': 'Choose next action',
  'session-summary': 'Session summary',
};
