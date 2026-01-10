/**
 * Accessibility Test Utilities for ItemCreationWorkflow
 *
 * Provides reusable helpers for automated accessibility testing using
 * vitest-axe and testing-library. Supports axe-core compliance checks,
 * ARIA attribute verification, keyboard navigation testing, and focus
 * visible validation.
 *
 * @module ItemCreationWorkflow/__tests__/helpers/a11yTestUtils
 * @see docs/REQ-174-accessibility-audit-detailed.md
 * @lastModified 2026-01-10 (REQ-174 Accessibility Audit)
 */

import { axe } from 'vitest-axe';
import type { AxeMatchers } from 'vitest-axe';
import { fireEvent } from '@testing-library/react';
import { expect } from 'vitest';

// Type augmentation for vitest-axe matchers
// The actual extension is done in vitest.setup.ts
declare module 'vitest' {
  interface Assertion<T> extends AxeMatchers {}
  interface AsymmetricMatchersContaining extends AxeMatchers {}
}

// =============================================================================
// Types
// =============================================================================

/**
 * Configuration for axe-core accessibility scan
 */
export interface AxeConfig {
  /** Rules to disable (e.g., for known acceptable issues) */
  disabledRules?: string[];
  /** Additional axe-core run options */
  options?: Record<string, unknown>;
}

/**
 * Result of a keyboard navigation simulation
 */
export interface KeyboardNavigationResult {
  /** Final focused element after navigation */
  focusedElement: HTMLElement | null;
  /** Sequence of elements that received focus */
  focusPath: HTMLElement[];
}

// =============================================================================
// Axe-core Compliance Helpers
// =============================================================================

/**
 * Runs axe-core accessibility check on a rendered component container.
 * Throws assertion error if any violations are found.
 *
 * @param container - The container element from render result
 * @param config - Optional configuration for the axe scan
 *
 * @example
 * ```ts
 * const { container } = render(<PurposeStep {...props} />);
 * await checkA11y(container);
 * ```
 */
export async function checkA11y(
  container: HTMLElement,
  config?: AxeConfig
): Promise<void> {
  const axeOptions: Record<string, unknown> = {};

  if (config?.disabledRules?.length) {
    axeOptions.rules = config.disabledRules.reduce(
      (rules, ruleId) => ({ ...rules, [ruleId]: { enabled: false } }),
      {}
    );
  }

  if (config?.options) {
    Object.assign(axeOptions, config.options);
  }

  const results = await axe(container, axeOptions);
  expect(results).toHaveNoViolations();
}

/**
 * Runs axe-core and returns detailed violation information without asserting.
 * Useful for debugging or getting violation details for reporting.
 *
 * @param container - The container element to scan
 * @returns Axe-core results object
 */
export async function getA11yViolations(container: HTMLElement) {
  const results = await axe(container);
  return results.violations;
}

// =============================================================================
// ARIA Attribute Verification
// =============================================================================

/**
 * Verifies that an element has the expected ARIA attributes with correct values.
 * Throws assertion error if any attribute is missing or has wrong value.
 *
 * @param element - The element to check
 * @param expectedAttributes - Map of attribute names to expected values
 *
 * @example
 * ```ts
 * verifyAriaAttributes(button, {
 *   'role': 'radio',
 *   'aria-checked': 'true',
 *   'aria-describedby': 'help-text'
 * });
 * ```
 */
export function verifyAriaAttributes(
  element: HTMLElement,
  expectedAttributes: Record<string, string>
): void {
  for (const [attr, expectedValue] of Object.entries(expectedAttributes)) {
    const actualValue = element.getAttribute(attr);
    expect(actualValue, `Expected ${attr}="${expectedValue}", got ${attr}="${actualValue}"`).toBe(expectedValue);
  }
}

/**
 * Checks if an element has any of the specified ARIA roles.
 *
 * @param element - The element to check
 * @param roles - Array of acceptable role values
 * @returns True if element has one of the specified roles
 */
export function hasAriaRole(element: HTMLElement, roles: string[]): boolean {
  const role = element.getAttribute('role');
  return role !== null && roles.includes(role);
}

/**
 * Verifies that aria-describedby references an existing element with content.
 *
 * @param element - The element with aria-describedby
 */
export function verifyAriaDescribedBy(element: HTMLElement): void {
  const describedBy = element.getAttribute('aria-describedby');
  expect(describedBy).not.toBeNull();

  if (describedBy) {
    const descriptionEl = document.getElementById(describedBy);
    expect(descriptionEl).not.toBeNull();
    expect(descriptionEl?.textContent?.trim().length).toBeGreaterThan(0);
  }
}

// =============================================================================
// Keyboard Navigation Testing
// =============================================================================

/**
 * Simulates keyboard navigation through elements using specified keys.
 * Returns information about focus changes during navigation.
 *
 * @param container - Container element to start navigation from
 * @param keys - Array of key names to simulate (e.g., ['Tab', 'ArrowDown', 'Enter'])
 * @param startElement - Optional starting element (defaults to first focusable)
 * @returns Navigation result with final focus and focus path
 *
 * @example
 * ```ts
 * const result = simulateKeyboardNavigation(container, [
 *   'Tab', 'ArrowDown', 'ArrowDown', 'Enter'
 * ]);
 * expect(result.focusedElement).toHaveTextContent('Option 3');
 * ```
 */
export function simulateKeyboardNavigation(
  container: HTMLElement,
  keys: string[],
  startElement?: HTMLElement
): KeyboardNavigationResult {
  const focusPath: HTMLElement[] = [];

  // Set initial focus
  if (startElement) {
    startElement.focus();
  } else {
    // Find first focusable element
    const firstFocusable = container.querySelector<HTMLElement>(
      'button, [tabindex="0"], input, select, textarea, a[href]'
    );
    if (firstFocusable) {
      firstFocusable.focus();
    }
  }

  if (document.activeElement instanceof HTMLElement) {
    focusPath.push(document.activeElement);
  }

  // Simulate each key press
  for (const key of keys) {
    const activeElement = document.activeElement as HTMLElement | null;
    if (!activeElement) continue;

    fireEvent.keyDown(activeElement, { key });

    // Track focus changes
    if (
      document.activeElement instanceof HTMLElement &&
      document.activeElement !== focusPath[focusPath.length - 1]
    ) {
      focusPath.push(document.activeElement);
    }
  }

  return {
    focusedElement: document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null,
    focusPath,
  };
}

/**
 * Simulates Tab key navigation and returns the tab order.
 *
 * @param container - Container to navigate within
 * @param maxTabs - Maximum number of Tab presses (default: 20)
 * @returns Array of elements in tab order
 */
export function getTabOrder(container: HTMLElement, maxTabs = 20): HTMLElement[] {
  const tabOrder: HTMLElement[] = [];
  const startElement = document.activeElement;

  // Focus container or first element
  container.focus();

  for (let i = 0; i < maxTabs; i++) {
    fireEvent.keyDown(document.activeElement || container, {
      key: 'Tab',
      bubbles: true,
    });

    const focused = document.activeElement as HTMLElement;

    // Stop if we've cycled back to start or left container
    if (tabOrder.includes(focused) || !container.contains(focused)) {
      break;
    }

    if (focused) {
      tabOrder.push(focused);
    }
  }

  // Restore original focus
  if (startElement instanceof HTMLElement) {
    startElement.focus();
  }

  return tabOrder;
}

// =============================================================================
// Focus Visible Verification
// =============================================================================

/**
 * Checks that an element has visible focus indicator styles.
 * This checks for common focus indicator patterns (outline, ring, etc.).
 *
 * @param element - The element to check
 * @returns True if focus indicator is likely visible
 *
 * @example
 * ```ts
 * button.focus();
 * expect(hasFocusIndicator(button)).toBe(true);
 * ```
 */
export function hasFocusIndicator(element: HTMLElement): boolean {
  const styles = window.getComputedStyle(element);

  // Check for outline
  const hasOutline =
    styles.outlineStyle !== 'none' &&
    styles.outlineWidth !== '0px';

  // Check for box-shadow (often used for focus rings)
  const hasBoxShadow = styles.boxShadow !== 'none';

  // Check for border changes (compare pseudo-focused state if possible)
  const hasBorder = styles.borderWidth !== '0px';

  // Check for focus-related CSS classes
  const hasFocusClass =
    element.classList.contains('focus') ||
    element.classList.contains('focus-visible') ||
    element.matches(':focus-visible');

  return hasOutline || hasBoxShadow || hasFocusClass || hasBorder;
}

/**
 * Verifies that all interactive elements in a container have focus indicators.
 *
 * @param container - Container to check
 * @returns Object with pass status and any elements missing focus indicators
 */
export function verifyAllFocusIndicators(container: HTMLElement): {
  pass: boolean;
  missingIndicators: HTMLElement[];
} {
  const interactiveElements = container.querySelectorAll<HTMLElement>(
    'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  const missingIndicators: HTMLElement[] = [];

  interactiveElements.forEach((element) => {
    element.focus();
    if (!hasFocusIndicator(element)) {
      missingIndicators.push(element);
    }
    element.blur();
  });

  return {
    pass: missingIndicators.length === 0,
    missingIndicators,
  };
}

// =============================================================================
// Screen Reader Announcement Helpers
// =============================================================================

/**
 * Gets the content of aria-live regions in the document.
 *
 * @returns Array of live region contents
 */
export function getLiveRegionContents(): string[] {
  const liveRegions = document.querySelectorAll<HTMLElement>(
    '[aria-live], [role="status"], [role="alert"]'
  );

  return Array.from(liveRegions)
    .map((el) => el.textContent?.trim() || '')
    .filter((content) => content.length > 0);
}

/**
 * Waits for a live region announcement matching the pattern.
 *
 * @param pattern - RegExp or string to match announcement
 * @param timeout - Maximum wait time in ms
 * @returns True if announcement was found
 */
export async function waitForAnnouncement(
  pattern: RegExp | string,
  timeout = 1000
): Promise<boolean> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const contents = getLiveRegionContents();
    const found = contents.some((content) =>
      typeof pattern === 'string'
        ? content.includes(pattern)
        : pattern.test(content)
    );

    if (found) return true;

    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  return false;
}

// =============================================================================
// Heading Hierarchy Verification
// =============================================================================

/**
 * Verifies proper heading hierarchy (h1 -> h2 -> h3, no skipped levels).
 *
 * @param container - Container to check
 * @returns Object with pass status and any hierarchy issues
 */
export function verifyHeadingHierarchy(container: HTMLElement): {
  pass: boolean;
  issues: string[];
} {
  const headings = container.querySelectorAll<HTMLHeadingElement>(
    'h1, h2, h3, h4, h5, h6'
  );

  const issues: string[] = [];
  let previousLevel = 0;

  headings.forEach((heading) => {
    const level = parseInt(heading.tagName[1], 10);

    // First heading can be any level
    if (previousLevel === 0) {
      previousLevel = level;
      return;
    }

    // Heading level should not skip more than one level
    if (level > previousLevel + 1) {
      issues.push(
        `Skipped heading level: ${heading.tagName} after h${previousLevel}`
      );
    }

    previousLevel = level;
  });

  return {
    pass: issues.length === 0,
    issues,
  };
}

// =============================================================================
// Color Contrast Helpers (basic check)
// =============================================================================

/**
 * Checks if text color has sufficient contrast with background.
 * Note: This is a simplified check. For comprehensive contrast testing,
 * use axe-core which includes proper contrast ratio calculation.
 *
 * @param element - Element to check
 * @returns True if contrast appears sufficient
 */
export function hasVisibleText(element: HTMLElement): boolean {
  const styles = window.getComputedStyle(element);

  // Check if text is visible (not transparent, not same color as background)
  const color = styles.color;
  const backgroundColor = styles.backgroundColor;

  // Very basic check - colors should be different
  // For actual contrast ratio, rely on axe-core
  return color !== backgroundColor;
}
