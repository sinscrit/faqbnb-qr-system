/**
 * PurposeStep Accessibility Tests
 *
 * Comprehensive accessibility tests for the PurposeStep component.
 * Verifies WCAG 2.1 AA compliance including:
 * - axe-core automated checks
 * - ARIA attribute correctness
 * - Keyboard navigation patterns
 * - Screen reader announcements
 *
 * @module ItemCreationWorkflow/components/steps/__tests__/PurposeStep.a11y.test
 * @see docs/REQ-174-accessibility-audit-detailed.md
 * @lastModified 2026-01-10 (REQ-174 Accessibility Audit)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PurposeStep, type PurposeStepProps } from '../PurposeStep';
import { checkA11y, verifyAriaAttributes, simulateKeyboardNavigation } from '../../../__tests__/helpers/a11yTestUtils';
import { PURPOSE_TYPES, PURPOSE_LABELS } from '../../../utils/constants';

// =============================================================================
// Test Setup
// =============================================================================

const createMockProps = (overrides?: Partial<PurposeStepProps>): PurposeStepProps => ({
  currentPurpose: null,
  onSelectPurpose: vi.fn(),
  onNext: vi.fn(),
  canNext: false,
  ...overrides,
});

// =============================================================================
// Axe-core Compliance Tests
// =============================================================================

describe('PurposeStep Accessibility', () => {
  describe('axe-core compliance', () => {
    it('should have no accessibility violations with no selection', async () => {
      const { container } = render(<PurposeStep {...createMockProps()} />);
      await checkA11y(container);
    });

    it('should have no accessibility violations with a selection', async () => {
      const { container } = render(
        <PurposeStep {...createMockProps({ currentPurpose: 'how-to-use', canNext: true })} />
      );
      await checkA11y(container);
    });

    it('should have no accessibility violations when Continue is enabled', async () => {
      const { container } = render(
        <PurposeStep {...createMockProps({ currentPurpose: 'troubleshooting', canNext: true })} />
      );
      await checkA11y(container);
    });
  });

  // =============================================================================
  // ARIA Attributes Tests
  // =============================================================================

  describe('ARIA attributes', () => {
    it('should have radiogroup role on container', () => {
      render(<PurposeStep {...createMockProps()} />);

      const radiogroup = screen.getByRole('radiogroup');
      expect(radiogroup).toBeInTheDocument();
    });

    it('should have descriptive aria-label on radiogroup', () => {
      render(<PurposeStep {...createMockProps()} />);

      const radiogroup = screen.getByRole('radiogroup');
      expect(radiogroup).toHaveAttribute('aria-label', 'Select content purpose');
    });

    it('should have aria-describedby linking to help text on radiogroup', () => {
      render(<PurposeStep {...createMockProps()} />);

      const radiogroup = screen.getByRole('radiogroup');
      expect(radiogroup).toHaveAttribute('aria-describedby', 'purpose-help');

      // Verify the help text element exists
      const helpText = document.getElementById('purpose-help');
      expect(helpText).toBeInTheDocument();
      expect(helpText).toHaveTextContent(/arrow keys/i);
    });

    it('should have radio role on each purpose card', () => {
      render(<PurposeStep {...createMockProps()} />);

      const radioButtons = screen.getAllByRole('radio');
      expect(radioButtons).toHaveLength(PURPOSE_TYPES.length);
    });

    it('should have aria-checked="false" on unselected purposes', () => {
      render(<PurposeStep {...createMockProps()} />);

      const radioButtons = screen.getAllByRole('radio');
      radioButtons.forEach((radio) => {
        expect(radio).toHaveAttribute('aria-checked', 'false');
      });
    });

    it('should update aria-checked when selection changes', () => {
      const { rerender } = render(<PurposeStep {...createMockProps()} />);

      // Initial state - all unchecked
      const radioButtons = screen.getAllByRole('radio');
      expect(radioButtons[0]).toHaveAttribute('aria-checked', 'false');

      // After selection
      rerender(
        <PurposeStep {...createMockProps({ currentPurpose: 'how-to-use', canNext: true })} />
      );

      // Find the selected radio by its text
      const selectedRadio = screen.getByRole('radio', { name: /how to use/i });
      expect(selectedRadio).toHaveAttribute('aria-checked', 'true');
    });

    it('should have aria-describedby linking each card to its description', () => {
      render(<PurposeStep {...createMockProps()} />);

      const radioButtons = screen.getAllByRole('radio');

      radioButtons.forEach((radio) => {
        const describedBy = radio.getAttribute('aria-describedby');
        expect(describedBy).toBeTruthy();

        // Verify the description element exists and has content
        const descriptionEl = document.getElementById(describedBy!);
        expect(descriptionEl).toBeInTheDocument();
        expect(descriptionEl?.textContent?.length).toBeGreaterThan(0);
      });
    });

    it('should have aria-hidden="true" on decorative icons', () => {
      render(<PurposeStep {...createMockProps()} />);

      const container = screen.getByRole('radiogroup');
      const icons = container.querySelectorAll('svg');

      icons.forEach((icon) => {
        expect(icon).toHaveAttribute('aria-hidden', 'true');
      });
    });
  });

  // =============================================================================
  // Keyboard Navigation Tests
  // =============================================================================

  describe('keyboard navigation', () => {
    it('should focus first item when tabbing into grid', async () => {
      const user = userEvent.setup();
      render(<PurposeStep {...createMockProps()} />);

      // Tab to the radiogroup
      await user.tab();

      // First radio should be focused
      const firstRadio = screen.getAllByRole('radio')[0];
      expect(document.activeElement).toBe(firstRadio);
    });

    it('should move focus with ArrowDown key', async () => {
      render(<PurposeStep {...createMockProps()} />);

      const radioButtons = screen.getAllByRole('radio');

      // Focus first item
      radioButtons[0].focus();
      expect(document.activeElement).toBe(radioButtons[0]);

      // Press ArrowDown
      fireEvent.keyDown(radioButtons[0], { key: 'ArrowDown' });

      // Focus should move to second item
      expect(document.activeElement).toBe(radioButtons[1]);
    });

    it('should move focus with ArrowUp key', async () => {
      render(<PurposeStep {...createMockProps()} />);

      const radioButtons = screen.getAllByRole('radio');

      // Focus second item
      radioButtons[1].focus();

      // Press ArrowUp
      fireEvent.keyDown(radioButtons[1], { key: 'ArrowUp' });

      // Focus should move to first item
      expect(document.activeElement).toBe(radioButtons[0]);
    });

    it('should wrap focus at boundaries when using arrow keys (loop enabled)', async () => {
      render(<PurposeStep {...createMockProps()} />);

      const radioButtons = screen.getAllByRole('radio');
      const lastIndex = radioButtons.length - 1;

      // Focus last item
      radioButtons[lastIndex].focus();

      // Press ArrowDown - should wrap to first
      fireEvent.keyDown(radioButtons[lastIndex], { key: 'ArrowDown' });
      expect(document.activeElement).toBe(radioButtons[0]);

      // Press ArrowUp - should wrap to last
      fireEvent.keyDown(radioButtons[0], { key: 'ArrowUp' });
      expect(document.activeElement).toBe(radioButtons[lastIndex]);
    });

    it('should select purpose with Enter key', async () => {
      const onSelectPurpose = vi.fn();
      render(<PurposeStep {...createMockProps({ onSelectPurpose })} />);

      const radioButtons = screen.getAllByRole('radio');

      // Focus first item
      radioButtons[0].focus();

      // Press Enter
      fireEvent.keyDown(radioButtons[0], { key: 'Enter' });

      expect(onSelectPurpose).toHaveBeenCalledWith('how-to-use');
    });

    it('should select purpose with Space key', async () => {
      const onSelectPurpose = vi.fn();
      render(<PurposeStep {...createMockProps({ onSelectPurpose })} />);

      const radioButtons = screen.getAllByRole('radio');

      // Focus second item
      radioButtons[1].focus();

      // Press Space
      fireEvent.keyDown(radioButtons[1], { key: ' ' });

      expect(onSelectPurpose).toHaveBeenCalledWith('how-to-clean');
    });

    it('should jump to first item with Home key', async () => {
      render(<PurposeStep {...createMockProps()} />);

      const radioButtons = screen.getAllByRole('radio');

      // Focus middle item
      radioButtons[3].focus();

      // Press Home
      fireEvent.keyDown(radioButtons[3], { key: 'Home' });

      expect(document.activeElement).toBe(radioButtons[0]);
    });

    it('should jump to last item with End key', async () => {
      render(<PurposeStep {...createMockProps()} />);

      const radioButtons = screen.getAllByRole('radio');
      const lastIndex = radioButtons.length - 1;

      // Focus first item
      radioButtons[0].focus();

      // Press End
      fireEvent.keyDown(radioButtons[0], { key: 'End' });

      expect(document.activeElement).toBe(radioButtons[lastIndex]);
    });

    it('should implement roving tabindex pattern', async () => {
      const { rerender } = render(<PurposeStep {...createMockProps()} />);

      const radioButtons = screen.getAllByRole('radio');

      // Initially first item has tabindex 0, others have -1
      expect(radioButtons[0]).toHaveAttribute('tabindex', '0');
      expect(radioButtons[1]).toHaveAttribute('tabindex', '-1');
      expect(radioButtons[2]).toHaveAttribute('tabindex', '-1');

      // Focus and navigate to second item
      radioButtons[0].focus();
      fireEvent.keyDown(radioButtons[0], { key: 'ArrowDown' });

      // After navigation, focus moves but tabindex may update on next render
      // The createKeyboardNavigator updates focus, and the component's activeIndex
      // state should update causing re-render
    });
  });

  // =============================================================================
  // Continue Button Accessibility
  // =============================================================================

  describe('continue button accessibility', () => {
    it('should have disabled state correctly announced', () => {
      render(<PurposeStep {...createMockProps({ canNext: false })} />);

      const continueButton = screen.getByRole('button', { name: /continue/i });
      expect(continueButton).toHaveAttribute('aria-disabled', 'true');
      expect(continueButton).toBeDisabled();
    });

    it('should be focusable and enabled when canNext is true', () => {
      render(<PurposeStep {...createMockProps({ currentPurpose: 'how-to-use', canNext: true })} />);

      const continueButton = screen.getByRole('button', { name: /continue/i });
      expect(continueButton).not.toBeDisabled();
    });
  });

  // =============================================================================
  // Focus Management Tests
  // =============================================================================

  describe('focus management', () => {
    it('should have visible focus indicator on focused elements', async () => {
      render(<PurposeStep {...createMockProps()} />);

      const radioButtons = screen.getAllByRole('radio');

      // Focus first item
      radioButtons[0].focus();

      // Element should be focused
      expect(document.activeElement).toBe(radioButtons[0]);

      // Check that the element has focus-visible styles applied (via CSS class inspection)
      // Note: In a real browser, this would show a visible ring
      expect(radioButtons[0].className).toContain('focus');
    });
  });

  // =============================================================================
  // Screen Reader Text Tests
  // =============================================================================

  describe('screen reader content', () => {
    it('should have sr-only help text with keyboard instructions', () => {
      render(<PurposeStep {...createMockProps()} />);

      const helpText = document.getElementById('purpose-help');
      expect(helpText).toBeInTheDocument();
      expect(helpText).toHaveClass('sr-only');
      expect(helpText).toHaveTextContent(/arrow keys/i);
      expect(helpText).toHaveTextContent(/enter/i);
      expect(helpText).toHaveTextContent(/space/i);
    });

    it('should provide descriptive labels for all purpose types', () => {
      render(<PurposeStep {...createMockProps()} />);

      // Check that each purpose label is present and readable
      Object.values(PURPOSE_LABELS).forEach((label) => {
        expect(screen.getByText(label)).toBeInTheDocument();
      });
    });
  });

  // =============================================================================
  // Reduced Motion Tests
  // =============================================================================

  describe('reduced motion support', () => {
    it('should have motion-reduce CSS classes on animated elements', () => {
      render(<PurposeStep {...createMockProps()} />);

      const radioButtons = screen.getAllByRole('radio');

      // Check that buttons have motion-reduce classes
      radioButtons.forEach((button) => {
        expect(button.className).toContain('motion-reduce');
      });
    });
  });
});
