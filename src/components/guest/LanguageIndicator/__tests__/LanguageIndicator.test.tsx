/**
 * @fileoverview Unit tests for LanguageIndicator component
 *
 * Tests for:
 * - Basic rendering with correct language names
 * - Language name formatting for all 6 supported languages
 * - Badge styling (pill shape, muted colors)
 * - ARIA accessibility attributes
 * - No interactive elements (purely informational)
 *
 * @since Epic 4 - Guest Experience
 * Last Modified: 2026-01-23 16:20
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

import { LanguageIndicator } from '../LanguageIndicator';

// Define SupportedLanguage locally to avoid importing from files that trigger Supabase
type SupportedLanguage = 'en' | 'fr' | 'es' | 'de' | 'nl' | 'it';

// =============================================================================
// Test Helpers
// =============================================================================

/**
 * Default props for rendering the component
 */
const defaultProps = {
  language: 'en' as SupportedLanguage,
};

/**
 * Helper to render component with merged props
 */
function renderComponent(props: Partial<typeof defaultProps> = {}) {
  return render(<LanguageIndicator {...defaultProps} {...props} />);
}

// =============================================================================
// Basic Rendering Tests
// =============================================================================

describe('LanguageIndicator - Basic Rendering', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders 'English' when language='en'", () => {
    renderComponent({ language: 'en' });

    expect(screen.getByText('English')).toBeInTheDocument();
  });

  it("renders 'French' when language='fr'", () => {
    renderComponent({ language: 'fr' });

    expect(screen.getByText('French')).toBeInTheDocument();
  });

  it("renders 'Spanish' when language='es'", () => {
    renderComponent({ language: 'es' });

    expect(screen.getByText('Spanish')).toBeInTheDocument();
  });

  it("renders 'German' when language='de'", () => {
    renderComponent({ language: 'de' });

    expect(screen.getByText('German')).toBeInTheDocument();
  });

  it("renders 'Dutch' when language='nl'", () => {
    renderComponent({ language: 'nl' });

    expect(screen.getByText('Dutch')).toBeInTheDocument();
  });

  it("renders 'Italian' when language='it'", () => {
    renderComponent({ language: 'it' });

    expect(screen.getByText('Italian')).toBeInTheDocument();
  });

  it('applies custom className prop', () => {
    renderComponent({ className: 'ml-2 custom-class' });

    const badge = screen.getByRole('status');
    expect(badge).toHaveClass('ml-2');
    expect(badge).toHaveClass('custom-class');
  });
});

// =============================================================================
// Language Name Formatting Tests
// =============================================================================

describe('LanguageIndicator - Language Name Formatting', () => {
  const languages: { code: SupportedLanguage; name: string }[] = [
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'French' },
    { code: 'es', name: 'Spanish' },
    { code: 'de', name: 'German' },
    { code: 'nl', name: 'Dutch' },
    { code: 'it', name: 'Italian' },
  ];

  it.each(languages)(
    'formats $code as "$name" correctly',
    ({ code, name }) => {
      renderComponent({ language: code });

      expect(screen.getByText(name)).toBeInTheDocument();
    }
  );

  it.each(languages)(
    'aria-label includes "$name" for language code $code',
    ({ code, name }) => {
      renderComponent({ language: code });

      const badge = screen.getByRole('status');
      expect(badge).toHaveAttribute('aria-label', `Content language: ${name}`);
    }
  );
});

// =============================================================================
// Badge Styling Tests
// =============================================================================

describe('LanguageIndicator - Badge Styling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('has muted gray background (bg-gray-100)', () => {
    renderComponent();

    const badge = screen.getByRole('status');
    expect(badge).toHaveClass('bg-gray-100');
  });

  it('has muted text color (text-gray-600)', () => {
    renderComponent();

    const badge = screen.getByRole('status');
    expect(badge).toHaveClass('text-gray-600');
  });

  it('has pill shape (rounded-full)', () => {
    renderComponent();

    const badge = screen.getByRole('status');
    expect(badge).toHaveClass('rounded-full');
  });

  it('has compact padding (px-2.5 py-0.5)', () => {
    renderComponent();

    const badge = screen.getByRole('status');
    expect(badge).toHaveClass('px-2.5');
    expect(badge).toHaveClass('py-0.5');
  });

  it('has small text size (text-xs)', () => {
    renderComponent();

    const badge = screen.getByRole('status');
    expect(badge).toHaveClass('text-xs');
  });

  it('has medium font weight (font-medium)', () => {
    renderComponent();

    const badge = screen.getByRole('status');
    expect(badge).toHaveClass('font-medium');
  });

  it('uses inline-flex layout', () => {
    renderComponent();

    const badge = screen.getByRole('status');
    expect(badge).toHaveClass('inline-flex');
  });

  it('has items-center for vertical alignment', () => {
    renderComponent();

    const badge = screen.getByRole('status');
    expect(badge).toHaveClass('items-center');
  });

  it('renders as a span element', () => {
    renderComponent();

    const badge = screen.getByRole('status');
    expect(badge.tagName).toBe('SPAN');
  });
});

// =============================================================================
// Accessibility Tests
// =============================================================================

describe('LanguageIndicator - Accessibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("has role='status' attribute", () => {
    renderComponent();

    const badge = screen.getByRole('status');
    expect(badge).toBeInTheDocument();
  });

  it('has aria-label attribute', () => {
    renderComponent();

    const badge = screen.getByRole('status');
    expect(badge).toHaveAttribute('aria-label');
  });

  it('aria-label includes "Content language:" prefix', () => {
    renderComponent({ language: 'en' });

    const badge = screen.getByRole('status');
    expect(badge).toHaveAttribute('aria-label', 'Content language: English');
  });

  it('aria-label includes formatted language name', () => {
    renderComponent({ language: 'fr' });

    const badge = screen.getByRole('status');
    expect(badge).toHaveAttribute('aria-label', 'Content language: French');
  });

  it('no interactive elements present (purely informational)', () => {
    renderComponent();

    // Should not have any buttons
    const buttons = screen.queryAllByRole('button');
    expect(buttons).toHaveLength(0);

    // Should not have any links
    const links = screen.queryAllByRole('link');
    expect(links).toHaveLength(0);
  });

  it('text content is accessible to screen readers', () => {
    renderComponent({ language: 'es' });

    const badge = screen.getByRole('status');
    expect(badge).toHaveTextContent('Spanish');
  });

  it('visible text matches aria-label language name', () => {
    renderComponent({ language: 'de' });

    const badge = screen.getByRole('status');
    const ariaLabel = badge.getAttribute('aria-label');
    const textContent = badge.textContent;

    // aria-label should contain the visible text
    expect(ariaLabel).toContain(textContent);
  });
});

// =============================================================================
// No Interactive Elements Tests
// =============================================================================

describe('LanguageIndicator - No Interactive Elements', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not have click handlers', () => {
    renderComponent();

    const badge = screen.getByRole('status');
    // onClick should not be defined on the element
    expect(badge).not.toHaveAttribute('onClick');
  });

  it('is not focusable by default', () => {
    renderComponent();

    const badge = screen.getByRole('status');
    // Should not have tabIndex attribute (or tabIndex=-1)
    const tabIndex = badge.getAttribute('tabindex');
    expect(tabIndex === null || tabIndex === '-1').toBe(true);
  });

  it('does not have hover cursor styles for interaction', () => {
    renderComponent();

    const badge = screen.getByRole('status');
    // Should not have pointer cursor classes
    expect(badge).not.toHaveClass('cursor-pointer');
  });

  it('renders only text content inside badge', () => {
    renderComponent({ language: 'nl' });

    const badge = screen.getByRole('status');
    // Should only contain the language name text
    expect(badge.childNodes).toHaveLength(1);
    expect(badge.textContent).toBe('Dutch');
  });
});

// =============================================================================
// Dynamic Language Change Tests
// =============================================================================

describe('LanguageIndicator - Dynamic Language Change', () => {
  it('updates text when language prop changes', () => {
    const { rerender } = render(<LanguageIndicator language="en" />);

    expect(screen.getByText('English')).toBeInTheDocument();

    rerender(<LanguageIndicator language="fr" />);

    expect(screen.getByText('French')).toBeInTheDocument();
    expect(screen.queryByText('English')).not.toBeInTheDocument();
  });

  it('updates aria-label when language prop changes', () => {
    const { rerender } = render(<LanguageIndicator language="en" />);

    expect(screen.getByRole('status')).toHaveAttribute(
      'aria-label',
      'Content language: English'
    );

    rerender(<LanguageIndicator language="it" />);

    expect(screen.getByRole('status')).toHaveAttribute(
      'aria-label',
      'Content language: Italian'
    );
  });
});

// =============================================================================
// Custom Styling Tests
// =============================================================================

describe('LanguageIndicator - Custom Styling', () => {
  it('merges custom className with default classes', () => {
    renderComponent({ className: 'mt-4' });

    const badge = screen.getByRole('status');
    // Should have both default and custom classes
    expect(badge).toHaveClass('bg-gray-100'); // default
    expect(badge).toHaveClass('mt-4'); // custom
  });

  it('allows margin classes for positioning', () => {
    renderComponent({ className: 'ml-2 mr-2' });

    const badge = screen.getByRole('status');
    expect(badge).toHaveClass('ml-2');
    expect(badge).toHaveClass('mr-2');
  });

  it('allows width/height override classes', () => {
    renderComponent({ className: 'w-20' });

    const badge = screen.getByRole('status');
    expect(badge).toHaveClass('w-20');
  });
});
