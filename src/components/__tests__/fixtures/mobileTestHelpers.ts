/**
 * @fileoverview Mobile Test Helper Utilities
 *
 * Provides viewport simulation, touch target validation, and responsive style
 * checking utilities for mobile responsiveness testing of guest-facing components.
 *
 * @module tests/fixtures/mobileTestHelpers
 * @see REQ-E04-025 - Mobile responsiveness testing
 * @created 2026-01-23
 *
 * @description
 * This module provides utilities for:
 * - Simulating mobile viewport sizes (320px to 768px)
 * - Validating WCAG 2.5.5 touch target requirements (44x44px minimum)
 * - Checking responsive styles on elements
 * - Simulating touch events for mobile interaction testing
 *
 * @example
 * ```typescript
 * import {
 *   MOBILE_BREAKPOINTS,
 *   renderWithMobileViewport,
 *   isTouchTargetAccessible,
 * } from './mobileTestHelpers';
 *
 * test('button meets touch target requirements', () => {
 *   renderWithMobileViewport(<MyButton />, MOBILE_BREAKPOINTS.small);
 *   const button = screen.getByRole('button');
 *   expect(isTouchTargetAccessible(button)).toBe(true);
 * });
 * ```
 */

import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement } from 'react';

// =============================================================================
// Section 1: Breakpoint Constants
// =============================================================================

/**
 * Standard mobile viewport breakpoints for testing.
 *
 * @constant
 * @description
 * - small (320px): Smallest common mobile viewport (iPhone SE, small Android)
 * - medium (375px): Most common mobile size (iPhone 12/13/14 standard)
 * - large (414px): Larger phones (iPhone Plus/Pro Max series)
 * - tablet (768px): Upper bound of mobile testing (iPad, small tablets)
 *
 * @example
 * ```typescript
 * setMobileViewport(MOBILE_BREAKPOINTS.small); // 320px
 * setMobileViewport(MOBILE_BREAKPOINTS.medium); // 375px
 * ```
 */
export const MOBILE_BREAKPOINTS = {
  /** Smallest common mobile viewport (320px) - iPhone SE */
  small: 320,
  /** Most common mobile size (375px) - iPhone 12/13/14 */
  medium: 375,
  /** Larger phones (414px) - iPhone Plus/Pro Max */
  large: 414,
  /** Tablet size (768px) - iPad, upper bound of mobile testing */
  tablet: 768,
} as const;

/** Type for mobile breakpoint keys */
export type MobileBreakpoint = keyof typeof MOBILE_BREAKPOINTS;

// =============================================================================
// Section 2: Viewport Simulation
// =============================================================================

/**
 * Sets the window.innerWidth to simulate a mobile viewport.
 *
 * @param width - The viewport width in pixels
 *
 * @description
 * Modifies window.innerWidth using Object.defineProperty and dispatches
 * a resize event to trigger any responsive behavior in the component.
 * This is necessary because JSDOM doesn't support window resizing natively.
 *
 * @example
 * ```typescript
 * // Simulate iPhone SE viewport
 * setMobileViewport(320);
 *
 * // Use breakpoint constant
 * setMobileViewport(MOBILE_BREAKPOINTS.medium);
 * ```
 */
export function setMobileViewport(width: number): void {
  // Set window.innerWidth using Object.defineProperty (required for JSDOM)
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });

  // Dispatch resize event to trigger responsive handlers
  window.dispatchEvent(new Event('resize'));
}

/**
 * Renders a React component with a simulated mobile viewport.
 *
 * @param ui - The React element to render
 * @param width - The viewport width (defaults to MOBILE_BREAKPOINTS.medium)
 * @param options - Additional render options from React Testing Library
 * @returns The render result from React Testing Library
 *
 * @description
 * Convenience function that sets the mobile viewport before rendering.
 * This ensures the component initializes with the correct viewport size.
 *
 * @example
 * ```typescript
 * // Render at default medium (375px) viewport
 * const { getByRole } = renderWithMobileViewport(<MyComponent />);
 *
 * // Render at specific viewport
 * renderWithMobileViewport(
 *   <MyComponent />,
 *   MOBILE_BREAKPOINTS.small
 * );
 *
 * // With custom render options
 * renderWithMobileViewport(
 *   <MyComponent />,
 *   MOBILE_BREAKPOINTS.tablet,
 *   { container: document.body }
 * );
 * ```
 */
export function renderWithMobileViewport(
  ui: ReactElement,
  width: number = MOBILE_BREAKPOINTS.medium,
  options?: RenderOptions
) {
  // Set viewport before rendering
  setMobileViewport(width);

  // Render and return the result
  return render(ui, options);
}

// =============================================================================
// Section 3: Touch Target Validation
// =============================================================================

/**
 * Minimum touch target size in pixels (WCAG 2.5.5 guideline).
 *
 * @constant
 * @description
 * WCAG 2.5.5 (Target Size Enhanced) recommends a minimum touch target
 * size of 44x44 CSS pixels for better mobile usability.
 *
 * @see https://www.w3.org/WAI/WCAG21/Understanding/target-size.html
 */
export const MIN_TOUCH_TARGET_SIZE = 44;

/**
 * Validates that an element meets WCAG 2.5.5 touch target size requirements.
 *
 * @param element - The DOM element to validate
 * @returns true if the element is at least 44x44 pixels
 *
 * @description
 * Touch targets should be at least 44x44 CSS pixels to ensure users can
 * accurately tap interactive elements on mobile devices. This function
 * uses getBoundingClientRect() to get the actual rendered dimensions.
 *
 * @example
 * ```typescript
 * const button = screen.getByRole('button');
 * expect(isTouchTargetAccessible(button)).toBe(true);
 *
 * // With assertion message
 * if (!isTouchTargetAccessible(button)) {
 *   const rect = button.getBoundingClientRect();
 *   console.log(`Button is ${rect.width}x${rect.height}px, needs 44x44px`);
 * }
 * ```
 */
export function isTouchTargetAccessible(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  return rect.width >= MIN_TOUCH_TARGET_SIZE && rect.height >= MIN_TOUCH_TARGET_SIZE;
}

/**
 * Gets the touch target dimensions for an element.
 *
 * @param element - The DOM element to measure
 * @returns Object with width, height, and whether it meets requirements
 *
 * @description
 * Returns detailed information about an element's touch target size,
 * useful for debugging failing touch target tests.
 *
 * @example
 * ```typescript
 * const button = screen.getByRole('button');
 * const info = getTouchTargetInfo(button);
 * console.log(`Width: ${info.width}, Height: ${info.height}`);
 * console.log(`Meets requirements: ${info.meetsRequirements}`);
 * ```
 */
export function getTouchTargetInfo(element: HTMLElement): {
  width: number;
  height: number;
  meetsRequirements: boolean;
} {
  const rect = element.getBoundingClientRect();
  return {
    width: rect.width,
    height: rect.height,
    meetsRequirements: rect.width >= MIN_TOUCH_TARGET_SIZE && rect.height >= MIN_TOUCH_TARGET_SIZE,
  };
}

// =============================================================================
// Section 4: Responsive Style Helpers
// =============================================================================

/**
 * Responsive style information for an element.
 *
 * @interface ResponsiveStyles
 */
export interface ResponsiveStyles {
  /** CSS display value */
  display: string;
  /** Rendered width in pixels */
  width: number;
  /** Rendered height in pixels */
  height: number;
  /** CSS fontSize value */
  fontSize: string;
  /** CSS padding value */
  padding: string;
  /** CSS overflow value */
  overflow: string;
  /** CSS position value */
  position: string;
}

/**
 * Gets responsive style information for an element.
 *
 * @param element - The DOM element to analyze
 * @returns Object containing key responsive CSS properties and dimensions
 *
 * @description
 * Retrieves computed styles and bounding dimensions useful for
 * responsive testing. Combines getComputedStyle() for CSS values
 * with getBoundingClientRect() for actual rendered dimensions.
 *
 * @example
 * ```typescript
 * const banner = screen.getByRole('status');
 * const styles = getResponsiveStyles(banner);
 *
 * // Check for overflow issues
 * expect(styles.width).toBeLessThanOrEqual(MOBILE_BREAKPOINTS.small);
 *
 * // Check text size
 * expect(parseInt(styles.fontSize)).toBeGreaterThanOrEqual(14);
 * ```
 */
export function getResponsiveStyles(element: HTMLElement): ResponsiveStyles {
  const computed = window.getComputedStyle(element);
  const rect = element.getBoundingClientRect();

  return {
    display: computed.display,
    width: rect.width,
    height: rect.height,
    fontSize: computed.fontSize,
    padding: computed.padding,
    overflow: computed.overflow,
    position: computed.position,
  };
}

// =============================================================================
// Section 5: Touch Event Simulation
// =============================================================================

/**
 * Simulates a touch event on an element.
 *
 * @param element - The DOM element to touch
 * @param eventType - The touch event type (default: 'touchstart')
 *
 * @description
 * Creates and dispatches a TouchEvent with a single Touch point centered
 * on the element. Useful for testing touch-specific interactions that
 * differ from mouse click events.
 *
 * Note: JSDOM has limited TouchEvent support. For comprehensive touch
 * testing, consider using a browser-based testing tool like Playwright.
 *
 * @example
 * ```typescript
 * const button = screen.getByRole('button');
 * simulateTouch(button); // touchstart
 * simulateTouch(button, 'touchend');
 * ```
 */
export function simulateTouch(
  element: HTMLElement,
  eventType: 'touchstart' | 'touchend' | 'touchmove' = 'touchstart'
): void {
  const rect = element.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  // Create Touch object
  const touch = new Touch({
    identifier: Date.now(),
    target: element,
    clientX: centerX,
    clientY: centerY,
    screenX: centerX,
    screenY: centerY,
    pageX: centerX,
    pageY: centerY,
    radiusX: 2.5,
    radiusY: 2.5,
    rotationAngle: 10,
    force: 0.5,
  });

  // Create and dispatch TouchEvent
  const touchEvent = new TouchEvent(eventType, {
    bubbles: true,
    cancelable: true,
    touches: [touch],
    targetTouches: [touch],
    changedTouches: [touch],
  });

  element.dispatchEvent(touchEvent);
}

// =============================================================================
// Section 6: Viewport Bounds Validation
// =============================================================================

/**
 * Checks if an element is fully visible within the current viewport.
 *
 * @param element - The DOM element to check
 * @returns Object with visibility information
 *
 * @description
 * Validates that an element's bounding box is within the viewport bounds.
 * Useful for testing that dropdowns, menus, and banners don't extend
 * beyond the screen on narrow mobile viewports.
 *
 * @example
 * ```typescript
 * const dropdown = screen.getByRole('menu');
 * const bounds = isWithinViewport(dropdown);
 *
 * expect(bounds.isFullyVisible).toBe(true);
 * expect(bounds.right).toBeLessThanOrEqual(window.innerWidth);
 * ```
 */
export function isWithinViewport(element: HTMLElement): {
  isFullyVisible: boolean;
  left: number;
  right: number;
  top: number;
  bottom: number;
  overflowLeft: boolean;
  overflowRight: boolean;
  overflowTop: boolean;
  overflowBottom: boolean;
} {
  const rect = element.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  const overflowLeft = rect.left < 0;
  const overflowRight = rect.right > viewportWidth;
  const overflowTop = rect.top < 0;
  const overflowBottom = rect.bottom > viewportHeight;

  return {
    isFullyVisible: !overflowLeft && !overflowRight && !overflowTop && !overflowBottom,
    left: rect.left,
    right: rect.right,
    top: rect.top,
    bottom: rect.bottom,
    overflowLeft,
    overflowRight,
    overflowTop,
    overflowBottom,
  };
}

// =============================================================================
// Section 7: Text Legibility Helpers
// =============================================================================

/**
 * Minimum font size for body text legibility on mobile (14px).
 *
 * @constant
 */
export const MIN_BODY_FONT_SIZE = 14;

/**
 * Minimum font size for small/auxiliary text (12px).
 *
 * @constant
 */
export const MIN_SMALL_FONT_SIZE = 12;

/**
 * Checks if an element's font size meets mobile legibility requirements.
 *
 * @param element - The DOM element to check
 * @param minSize - Minimum font size in pixels (default: MIN_BODY_FONT_SIZE)
 * @returns true if font size meets the minimum requirement
 *
 * @example
 * ```typescript
 * const text = screen.getByText('Welcome');
 * expect(isTextLegible(text)).toBe(true); // >= 14px
 *
 * const smallText = screen.getByText('Footnote');
 * expect(isTextLegible(smallText, MIN_SMALL_FONT_SIZE)).toBe(true); // >= 12px
 * ```
 */
export function isTextLegible(
  element: HTMLElement,
  minSize: number = MIN_BODY_FONT_SIZE
): boolean {
  const computed = window.getComputedStyle(element);
  const fontSize = parseFloat(computed.fontSize);
  return fontSize >= minSize;
}

/**
 * Gets the font size of an element in pixels.
 *
 * @param element - The DOM element to measure
 * @returns Font size in pixels as a number
 */
export function getFontSize(element: HTMLElement): number {
  const computed = window.getComputedStyle(element);
  return parseFloat(computed.fontSize);
}
