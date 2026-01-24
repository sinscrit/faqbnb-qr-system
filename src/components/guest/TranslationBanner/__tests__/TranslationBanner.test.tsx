/**
 * @fileoverview Unit tests for TranslationBanner component
 *
 * Tests for:
 * - Basic rendering with correct source language display
 * - Visual elements (background color, icon, button styling)
 * - ARIA accessibility attributes
 * - Interaction and callback behavior
 * - Responsive layout classes
 * - Keyboard navigation
 *
 * @since Epic 4 - Guest Experience
 * Last Modified: 2026-01-23 15:25
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { TranslationBanner } from '../TranslationBanner';

// Define SupportedLanguage locally to avoid importing from files that trigger Supabase
type SupportedLanguage = 'en' | 'fr' | 'es' | 'de' | 'nl' | 'it';

// =============================================================================
// Test Helpers
// =============================================================================

/**
 * Default props for rendering the component
 */
const defaultProps = {
  sourceLanguage: 'fr' as SupportedLanguage,
  onViewOriginal: vi.fn(),
};

/**
 * Helper to render component with merged props
 */
function renderComponent(props: Partial<typeof defaultProps> = {}) {
  return render(<TranslationBanner {...defaultProps} {...props} />);
}

// =============================================================================
// Basic Rendering Tests
// =============================================================================

describe('TranslationBanner - Basic Rendering', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with correct source language (French)', () => {
    renderComponent({ sourceLanguage: 'fr' });

    expect(screen.getByText('French')).toBeInTheDocument();
    expect(screen.getByText(/Translated from/)).toBeInTheDocument();
  });

  it('renders with correct source language (Spanish)', () => {
    renderComponent({ sourceLanguage: 'es' });

    expect(screen.getByText('Spanish')).toBeInTheDocument();
  });

  it('renders with correct source language (German)', () => {
    renderComponent({ sourceLanguage: 'de' });

    expect(screen.getByText('German')).toBeInTheDocument();
  });

  it('renders with correct source language (Dutch)', () => {
    renderComponent({ sourceLanguage: 'nl' });

    expect(screen.getByText('Dutch')).toBeInTheDocument();
  });

  it('renders with correct source language (Italian)', () => {
    renderComponent({ sourceLanguage: 'it' });

    expect(screen.getByText('Italian')).toBeInTheDocument();
  });

  it('renders with correct source language (English)', () => {
    renderComponent({ sourceLanguage: 'en' });

    expect(screen.getByText('English')).toBeInTheDocument();
  });

  it("displays 'Translated from' text with language name", () => {
    renderComponent({ sourceLanguage: 'fr' });

    const banner = screen.getByRole('status');
    expect(banner).toHaveTextContent('Translated from French');
  });

  it('applies custom className prop to container', () => {
    renderComponent({ className: 'mb-6 custom-class' });

    const banner = screen.getByRole('status');
    expect(banner).toHaveClass('mb-6');
    expect(banner).toHaveClass('custom-class');
  });
});

// =============================================================================
// Visual Elements Tests
// =============================================================================

describe('TranslationBanner - Visual Elements', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('has correct background color (#E3F2FD)', () => {
    renderComponent();

    const banner = screen.getByRole('status');
    expect(banner).toHaveClass('bg-[#E3F2FD]');
  });

  it('has border with blue-200 color', () => {
    renderComponent();

    const banner = screen.getByRole('status');
    expect(banner).toHaveClass('border');
    expect(banner).toHaveClass('border-blue-200');
  });

  it('renders Globe icon', () => {
    renderComponent();

    // Lucide icons are rendered as SVGs
    const iconContainer = document.querySelector('.bg-blue-100.rounded-full');
    expect(iconContainer).toBeInTheDocument();

    const svg = iconContainer?.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('Globe icon has aria-hidden attribute', () => {
    renderComponent();

    const svg = document.querySelector('svg');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  it('language name is bolded (strong element)', () => {
    renderComponent({ sourceLanguage: 'fr' });

    const strongElement = screen.getByText('French');
    expect(strongElement.tagName).toBe('STRONG');
  });

  it('View original button has underline', () => {
    renderComponent();

    const button = screen.getByRole('button', { name: /view original/i });
    expect(button).toHaveClass('underline');
  });

  it('View original button has correct text color (blue-700)', () => {
    renderComponent();

    const button = screen.getByRole('button', { name: /view original/i });
    expect(button).toHaveClass('text-blue-700');
  });

  it('container has rounded corners (rounded-lg)', () => {
    renderComponent();

    const banner = screen.getByRole('status');
    expect(banner).toHaveClass('rounded-lg');
  });

  it('container has shadow (shadow-sm)', () => {
    renderComponent();

    const banner = screen.getByRole('status');
    expect(banner).toHaveClass('shadow-sm');
  });
});

// =============================================================================
// Accessibility Tests
// =============================================================================

describe('TranslationBanner - Accessibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("container has role='status' attribute", () => {
    renderComponent();

    const banner = screen.getByRole('status');
    expect(banner).toBeInTheDocument();
  });

  it("container has aria-live='polite' attribute", () => {
    renderComponent();

    const banner = screen.getByRole('status');
    expect(banner).toHaveAttribute('aria-live', 'polite');
  });

  it('View original is a button element (not anchor)', () => {
    renderComponent();

    const button = screen.getByRole('button', { name: /view original/i });
    expect(button.tagName).toBe('BUTTON');
  });

  it("button has type='button' attribute", () => {
    renderComponent();

    const button = screen.getByRole('button', { name: /view original/i });
    expect(button).toHaveAttribute('type', 'button');
  });

  it('button is keyboard accessible (can be focused)', () => {
    renderComponent();

    const button = screen.getByRole('button', { name: /view original/i });
    button.focus();
    expect(document.activeElement).toBe(button);
  });

  it('button activates with Enter key press', async () => {
    const onViewOriginal = vi.fn();
    renderComponent({ onViewOriginal });

    const button = screen.getByRole('button', { name: /view original/i });
    button.focus();
    await userEvent.keyboard('{Enter}');

    expect(onViewOriginal).toHaveBeenCalledTimes(1);
  });

  it('button activates with Space key press', async () => {
    const onViewOriginal = vi.fn();
    renderComponent({ onViewOriginal });

    const button = screen.getByRole('button', { name: /view original/i });
    button.focus();
    await userEvent.keyboard(' ');

    expect(onViewOriginal).toHaveBeenCalledTimes(1);
  });

  it('button has focus ring classes', () => {
    renderComponent();

    const button = screen.getByRole('button', { name: /view original/i });
    expect(button).toHaveClass('focus:ring-2');
    expect(button).toHaveClass('focus:ring-blue-500');
    expect(button).toHaveClass('focus:ring-offset-2');
  });
});

// =============================================================================
// Interaction and Callback Tests
// =============================================================================

describe('TranslationBanner - Interaction and Callback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls onViewOriginal callback when button clicked', async () => {
    const onViewOriginal = vi.fn();
    renderComponent({ onViewOriginal });

    const button = screen.getByRole('button', { name: /view original/i });
    await userEvent.click(button);

    expect(onViewOriginal).toHaveBeenCalled();
  });

  it('calls onViewOriginal exactly once per click', async () => {
    const onViewOriginal = vi.fn();
    renderComponent({ onViewOriginal });

    const button = screen.getByRole('button', { name: /view original/i });
    await userEvent.click(button);

    expect(onViewOriginal).toHaveBeenCalledTimes(1);
  });

  it('calls onViewOriginal when button clicked (callback invoked)', async () => {
    const onViewOriginal = vi.fn();
    renderComponent({ onViewOriginal });

    const button = screen.getByRole('button', { name: /view original/i });
    await userEvent.click(button);

    // Callback is invoked - the event is passed by React's onClick but
    // the component implementation handles this (parent doesn't need event)
    expect(onViewOriginal).toHaveBeenCalled();
  });

  it('onViewOriginal is called when Enter key pressed on button', async () => {
    const onViewOriginal = vi.fn();
    renderComponent({ onViewOriginal });

    const button = screen.getByRole('button', { name: /view original/i });
    button.focus();
    await userEvent.keyboard('{Enter}');

    expect(onViewOriginal).toHaveBeenCalled();
  });

  it('onViewOriginal is called when Space key pressed on button', async () => {
    const onViewOriginal = vi.fn();
    renderComponent({ onViewOriginal });

    const button = screen.getByRole('button', { name: /view original/i });
    button.focus();
    await userEvent.keyboard(' ');

    expect(onViewOriginal).toHaveBeenCalled();
  });

  it('multiple clicks call callback multiple times', async () => {
    const onViewOriginal = vi.fn();
    renderComponent({ onViewOriginal });

    const button = screen.getByRole('button', { name: /view original/i });
    await userEvent.click(button);
    await userEvent.click(button);
    await userEvent.click(button);

    expect(onViewOriginal).toHaveBeenCalledTimes(3);
  });
});

// =============================================================================
// Responsive Layout Tests
// =============================================================================

describe('TranslationBanner - Responsive Layout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('has flex-col class for mobile layout', () => {
    renderComponent();

    const banner = screen.getByRole('status');
    expect(banner).toHaveClass('flex-col');
  });

  it('has sm:flex-row class for tablet/desktop layout', () => {
    renderComponent();

    const banner = screen.getByRole('status');
    expect(banner).toHaveClass('sm:flex-row');
  });

  it('has items-start alignment for mobile', () => {
    renderComponent();

    const banner = screen.getByRole('status');
    expect(banner).toHaveClass('items-start');
  });

  it('has sm:items-center alignment for tablet/desktop', () => {
    renderComponent();

    const banner = screen.getByRole('status');
    expect(banner).toHaveClass('sm:items-center');
  });

  it('button has flex-shrink-0 to prevent shrinking', () => {
    renderComponent();

    const button = screen.getByRole('button', { name: /view original/i });
    expect(button).toHaveClass('flex-shrink-0');
  });

  it('container has appropriate gap spacing (gap-3 sm:gap-4)', () => {
    renderComponent();

    const banner = screen.getByRole('status');
    expect(banner).toHaveClass('gap-3');
    expect(banner).toHaveClass('sm:gap-4');
  });
});

// =============================================================================
// All Supported Languages Test
// =============================================================================

describe('TranslationBanner - All Supported Languages', () => {
  const languages: { code: SupportedLanguage; name: string }[] = [
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'French' },
    { code: 'es', name: 'Spanish' },
    { code: 'de', name: 'German' },
    { code: 'nl', name: 'Dutch' },
    { code: 'it', name: 'Italian' },
  ];

  it.each(languages)(
    'correctly displays $code as "$name"',
    ({ code, name }) => {
      renderComponent({ sourceLanguage: code });

      expect(screen.getByText(name)).toBeInTheDocument();
    }
  );
});
