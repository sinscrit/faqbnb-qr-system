/**
 * @fileoverview Unit tests for MissingTranslationBanner component
 *
 * Tests for:
 * - Basic rendering with correct language names
 * - Visual elements (gray background, icon, styling)
 * - ARIA accessibility attributes
 * - Message format variations
 * - All supported language combinations
 *
 * @since Epic 4 - Guest Experience
 * Last Modified: 2026-01-23 15:50
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

import { MissingTranslationBanner } from '../MissingTranslationBanner';

// Define SupportedLanguage locally to avoid importing from files that trigger Supabase
type SupportedLanguage = 'en' | 'fr' | 'es' | 'de' | 'nl' | 'it';

// =============================================================================
// Test Helpers
// =============================================================================

/**
 * Default props for rendering the component
 */
const defaultProps = {
  requestedLanguage: 'fr' as SupportedLanguage,
  fallbackLanguage: 'en' as SupportedLanguage,
};

/**
 * Helper to render component with merged props
 */
function renderComponent(props: Partial<typeof defaultProps> = {}) {
  return render(<MissingTranslationBanner {...defaultProps} {...props} />);
}

// =============================================================================
// Basic Rendering Tests
// =============================================================================

describe('MissingTranslationBanner - Basic Rendering', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with correct requested language (French)', () => {
    renderComponent({ requestedLanguage: 'fr' });

    expect(screen.getByText('French')).toBeInTheDocument();
  });

  it('renders with correct fallback language (English)', () => {
    renderComponent({ fallbackLanguage: 'en' });

    expect(screen.getByText('English')).toBeInTheDocument();
  });

  it("displays 'translation not available' message", () => {
    renderComponent();

    expect(screen.getByText(/translation not available/)).toBeInTheDocument();
  });

  it("displays 'Showing content in' message", () => {
    renderComponent();

    expect(screen.getByText(/Showing content in/)).toBeInTheDocument();
  });

  it('applies custom className prop to container', () => {
    renderComponent({ className: 'mb-6 custom-class' });

    const banner = screen.getByRole('status');
    expect(banner).toHaveClass('mb-6');
    expect(banner).toHaveClass('custom-class');
  });

  it('displays full message format correctly', () => {
    renderComponent({ requestedLanguage: 'fr', fallbackLanguage: 'en' });

    const banner = screen.getByRole('status');
    expect(banner).toHaveTextContent(
      'French translation not available. Showing content in English.'
    );
  });
});

// =============================================================================
// Language Name Formatting Tests
// =============================================================================

describe('MissingTranslationBanner - Language Name Formatting', () => {
  const languages: { code: SupportedLanguage; name: string }[] = [
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'French' },
    { code: 'es', name: 'Spanish' },
    { code: 'de', name: 'German' },
    { code: 'nl', name: 'Dutch' },
    { code: 'it', name: 'Italian' },
  ];

  it.each(languages)(
    'formats $code as "$name" for requested language',
    ({ code, name }) => {
      // Use a different fallback than requested to avoid duplicate text issues
      const fallback = code === 'de' ? 'en' : 'de';
      renderComponent({ requestedLanguage: code, fallbackLanguage: fallback as SupportedLanguage });

      expect(screen.getByText(name)).toBeInTheDocument();
    }
  );

  it.each(languages)(
    'formats $code as "$name" for fallback language',
    ({ code, name }) => {
      // Use a different requested than fallback to avoid duplicate text issues
      const requested = code === 'es' ? 'de' : 'es';
      renderComponent({ requestedLanguage: requested as SupportedLanguage, fallbackLanguage: code });

      expect(screen.getByText(name)).toBeInTheDocument();
    }
  );

  it('handles all language combinations correctly', () => {
    // Test a specific non-English fallback combination
    renderComponent({ requestedLanguage: 'de', fallbackLanguage: 'fr' });

    const banner = screen.getByRole('status');
    expect(banner).toHaveTextContent(
      'German translation not available. Showing content in French.'
    );
  });
});

// =============================================================================
// Visual Elements Tests
// =============================================================================

describe('MissingTranslationBanner - Visual Elements', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('has correct muted background color (bg-gray-50)', () => {
    renderComponent();

    const banner = screen.getByRole('status');
    expect(banner).toHaveClass('bg-gray-50');
  });

  it('has border with gray-200 color', () => {
    renderComponent();

    const banner = screen.getByRole('status');
    expect(banner).toHaveClass('border');
    expect(banner).toHaveClass('border-gray-200');
  });

  it('renders Info icon', () => {
    renderComponent();

    // Lucide icons are rendered as SVGs
    const iconContainer = document.querySelector('.bg-gray-100.rounded-full');
    expect(iconContainer).toBeInTheDocument();

    const svg = iconContainer?.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('Info icon has aria-hidden attribute', () => {
    renderComponent();

    const svg = document.querySelector('svg');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  it('icon has gray-500 color (text-gray-500)', () => {
    renderComponent();

    const svg = document.querySelector('svg');
    expect(svg).toHaveClass('text-gray-500');
  });

  it('icon container has gray-100 background (bg-gray-100)', () => {
    renderComponent();

    const iconContainer = document.querySelector('.bg-gray-100');
    expect(iconContainer).toBeInTheDocument();
    expect(iconContainer).toHaveClass('rounded-full');
  });

  it('language names are bolded (strong elements)', () => {
    renderComponent({ requestedLanguage: 'fr', fallbackLanguage: 'en' });

    const frenchStrong = screen.getByText('French');
    const englishStrong = screen.getByText('English');

    expect(frenchStrong.tagName).toBe('STRONG');
    expect(englishStrong.tagName).toBe('STRONG');
  });

  it('text has gray-600 color (text-gray-600)', () => {
    renderComponent();

    const paragraph = document.querySelector('p');
    expect(paragraph).toHaveClass('text-gray-600');
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

  it('uses flex layout with items-center', () => {
    renderComponent();

    const banner = screen.getByRole('status');
    expect(banner).toHaveClass('flex');
    expect(banner).toHaveClass('items-center');
  });

  it('has gap-3 spacing between elements', () => {
    renderComponent();

    const banner = screen.getByRole('status');
    expect(banner).toHaveClass('gap-3');
  });

  it('has p-4 padding', () => {
    renderComponent();

    const banner = screen.getByRole('status');
    expect(banner).toHaveClass('p-4');
  });
});

// =============================================================================
// Accessibility Tests
// =============================================================================

describe('MissingTranslationBanner - Accessibility', () => {
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

  it("Info icon has aria-hidden='true' attribute", () => {
    renderComponent();

    const svg = document.querySelector('svg');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
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
    renderComponent({ requestedLanguage: 'es', fallbackLanguage: 'en' });

    const banner = screen.getByRole('status');
    expect(banner).toHaveTextContent('Spanish');
    expect(banner).toHaveTextContent('English');
    expect(banner).toHaveTextContent('translation not available');
    expect(banner).toHaveTextContent('Showing content in');
  });

  it('strong tags are properly structured for emphasis', () => {
    renderComponent({ requestedLanguage: 'de', fallbackLanguage: 'it' });

    const strongElements = document.querySelectorAll('strong');
    expect(strongElements).toHaveLength(2);
    expect(strongElements[0]).toHaveTextContent('German');
    expect(strongElements[1]).toHaveTextContent('Italian');
  });
});

// =============================================================================
// Message Format Variations Tests
// =============================================================================

describe('MissingTranslationBanner - Message Format Variations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('message format for French → English fallback', () => {
    renderComponent({ requestedLanguage: 'fr', fallbackLanguage: 'en' });

    const banner = screen.getByRole('status');
    expect(banner).toHaveTextContent(
      'French translation not available. Showing content in English.'
    );
  });

  it('message format for Spanish → English fallback', () => {
    renderComponent({ requestedLanguage: 'es', fallbackLanguage: 'en' });

    const banner = screen.getByRole('status');
    expect(banner).toHaveTextContent(
      'Spanish translation not available. Showing content in English.'
    );
  });

  it('message format for German → French fallback (non-English fallback)', () => {
    renderComponent({ requestedLanguage: 'de', fallbackLanguage: 'fr' });

    const banner = screen.getByRole('status');
    expect(banner).toHaveTextContent(
      'German translation not available. Showing content in French.'
    );
  });

  it('message format for Dutch → English fallback', () => {
    renderComponent({ requestedLanguage: 'nl', fallbackLanguage: 'en' });

    const banner = screen.getByRole('status');
    expect(banner).toHaveTextContent(
      'Dutch translation not available. Showing content in English.'
    );
  });

  it('message format for Italian → English fallback', () => {
    renderComponent({ requestedLanguage: 'it', fallbackLanguage: 'en' });

    const banner = screen.getByRole('status');
    expect(banner).toHaveTextContent(
      'Italian translation not available. Showing content in English.'
    );
  });

  it('both language names are present in message', () => {
    renderComponent({ requestedLanguage: 'nl', fallbackLanguage: 'de' });

    expect(screen.getByText('Dutch')).toBeInTheDocument();
    expect(screen.getByText('German')).toBeInTheDocument();
  });

  it("message contains 'not available' text", () => {
    renderComponent();

    expect(screen.getByText(/not available/)).toBeInTheDocument();
  });

  it("message contains 'Showing content in' text", () => {
    renderComponent();

    expect(screen.getByText(/Showing content in/)).toBeInTheDocument();
  });

  it('message ends with period', () => {
    renderComponent();

    const banner = screen.getByRole('status');
    const textContent = banner.textContent || '';
    expect(textContent.trim().endsWith('.')).toBe(true);
  });
});

// =============================================================================
// All Supported Languages Test
// =============================================================================

describe('MissingTranslationBanner - All Supported Languages', () => {
  const languages: { code: SupportedLanguage; name: string }[] = [
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'French' },
    { code: 'es', name: 'Spanish' },
    { code: 'de', name: 'German' },
    { code: 'nl', name: 'Dutch' },
    { code: 'it', name: 'Italian' },
  ];

  it.each(languages)(
    'correctly displays $code as "$name" when requested',
    ({ code, name }) => {
      renderComponent({ requestedLanguage: code, fallbackLanguage: 'en' });

      const banner = screen.getByRole('status');
      expect(banner).toHaveTextContent(
        `${name} translation not available. Showing content in English.`
      );
    }
  );

  it.each(languages)(
    'correctly displays $code as "$name" when fallback',
    ({ code, name }) => {
      renderComponent({ requestedLanguage: 'fr', fallbackLanguage: code });

      const banner = screen.getByRole('status');
      expect(banner).toHaveTextContent(
        `French translation not available. Showing content in ${name}.`
      );
    }
  );
});
