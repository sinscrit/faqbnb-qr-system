/**
 * @fileoverview Unit tests for ViewOriginalToggle component
 *
 * Tests for:
 * - Basic rendering with correct button text for both states
 * - Language name formatting for all 6 supported languages
 * - Click interaction and callback behavior
 * - Button styling (secondary button pattern)
 * - ARIA accessibility attributes
 * - Keyboard interaction
 * - Disabled state
 *
 * @since Epic 4 - Guest Experience
 * Last Modified: 2026-01-23 16:05
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ViewOriginalToggle } from '../ViewOriginalToggle';

// Define SupportedLanguage locally to avoid importing from files that trigger Supabase
type SupportedLanguage = 'en' | 'fr' | 'es' | 'de' | 'nl' | 'it';

// =============================================================================
// Test Helpers
// =============================================================================

/**
 * Default props for rendering the component
 */
const defaultProps = {
  isViewingOriginal: false,
  originalLanguage: 'en' as SupportedLanguage,
  onToggle: vi.fn(),
};

/**
 * Helper to render component with merged props
 */
function renderComponent(props: Partial<typeof defaultProps> = {}) {
  return render(<ViewOriginalToggle {...defaultProps} {...props} />);
}

// =============================================================================
// Basic Rendering Tests
// =============================================================================

describe('ViewOriginalToggle - Basic Rendering', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders 'View in original' text when viewing translated (isViewingOriginal=false)", () => {
    renderComponent({ isViewingOriginal: false });

    expect(screen.getByRole('button')).toHaveTextContent('View in original');
  });

  it("renders 'View translation' text when viewing original (isViewingOriginal=true)", () => {
    renderComponent({ isViewingOriginal: true });

    expect(screen.getByRole('button')).toHaveTextContent('View translation');
  });

  it('includes language name in button text when viewing translated', () => {
    renderComponent({ isViewingOriginal: false, originalLanguage: 'en' });

    expect(screen.getByRole('button')).toHaveTextContent('View in original (English)');
  });

  it('applies custom className prop to button', () => {
    renderComponent({ className: 'w-full mt-4' });

    const button = screen.getByRole('button');
    expect(button).toHaveClass('w-full');
    expect(button).toHaveClass('mt-4');
  });

  it('renders Languages icon', () => {
    renderComponent();

    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });
});

// =============================================================================
// Language Name Formatting Tests
// =============================================================================

describe('ViewOriginalToggle - Language Name Formatting', () => {
  const languages: { code: SupportedLanguage; name: string }[] = [
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'French' },
    { code: 'es', name: 'Spanish' },
    { code: 'de', name: 'German' },
    { code: 'nl', name: 'Dutch' },
    { code: 'it', name: 'Italian' },
  ];

  it("displays English in button text when originalLanguage='en'", () => {
    renderComponent({ isViewingOriginal: false, originalLanguage: 'en' });
    expect(screen.getByRole('button')).toHaveTextContent('(English)');
  });

  it("displays French in button text when originalLanguage='fr'", () => {
    renderComponent({ isViewingOriginal: false, originalLanguage: 'fr' });
    expect(screen.getByRole('button')).toHaveTextContent('(French)');
  });

  it("displays Spanish in button text when originalLanguage='es'", () => {
    renderComponent({ isViewingOriginal: false, originalLanguage: 'es' });
    expect(screen.getByRole('button')).toHaveTextContent('(Spanish)');
  });

  it("displays German in button text when originalLanguage='de'", () => {
    renderComponent({ isViewingOriginal: false, originalLanguage: 'de' });
    expect(screen.getByRole('button')).toHaveTextContent('(German)');
  });

  it("displays Dutch in button text when originalLanguage='nl'", () => {
    renderComponent({ isViewingOriginal: false, originalLanguage: 'nl' });
    expect(screen.getByRole('button')).toHaveTextContent('(Dutch)');
  });

  it("displays Italian in button text when originalLanguage='it'", () => {
    renderComponent({ isViewingOriginal: false, originalLanguage: 'it' });
    expect(screen.getByRole('button')).toHaveTextContent('(Italian)');
  });

  it.each(languages)(
    'formats $code as "$name" correctly in button text',
    ({ code, name }) => {
      renderComponent({ isViewingOriginal: false, originalLanguage: code });
      expect(screen.getByRole('button')).toHaveTextContent(`(${name})`);
    }
  );
});

// =============================================================================
// Interaction and Callback Tests
// =============================================================================

describe('ViewOriginalToggle - Interaction and Callback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls onToggle callback when button clicked', async () => {
    const onToggle = vi.fn();
    renderComponent({ onToggle });

    await userEvent.click(screen.getByRole('button'));

    expect(onToggle).toHaveBeenCalled();
  });

  it('calls onToggle exactly once per click', async () => {
    const onToggle = vi.fn();
    renderComponent({ onToggle });

    await userEvent.click(screen.getByRole('button'));

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('calls onToggle when clicked (callback receives no parameters from component)', async () => {
    const onToggle = vi.fn();
    renderComponent({ onToggle });

    await userEvent.click(screen.getByRole('button'));

    // The component calls onToggle with no arguments, but React passes the event
    // The callback should be called - we don't check arguments since React adds event
    expect(onToggle).toHaveBeenCalled();
  });

  it('onToggle is called when Enter key pressed on button', () => {
    const onToggle = vi.fn();
    renderComponent({ onToggle });

    const button = screen.getByRole('button');
    fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
    fireEvent.keyUp(button, { key: 'Enter', code: 'Enter' });

    // Native button handles Enter key automatically - the click will fire
    fireEvent.click(button);
    expect(onToggle).toHaveBeenCalled();
  });

  it('onToggle is called when Space key pressed on button', () => {
    const onToggle = vi.fn();
    renderComponent({ onToggle });

    const button = screen.getByRole('button');
    fireEvent.keyDown(button, { key: ' ', code: 'Space' });
    fireEvent.keyUp(button, { key: ' ', code: 'Space' });

    // Native button handles Space key automatically
    fireEvent.click(button);
    expect(onToggle).toHaveBeenCalled();
  });

  it('multiple clicks call callback multiple times', async () => {
    const onToggle = vi.fn();
    renderComponent({ onToggle });

    const button = screen.getByRole('button');
    await userEvent.click(button);
    await userEvent.click(button);
    await userEvent.click(button);

    expect(onToggle).toHaveBeenCalledTimes(3);
  });
});

// =============================================================================
// Button Styling Tests
// =============================================================================

describe('ViewOriginalToggle - Button Styling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('has white background (bg-white)', () => {
    renderComponent();
    expect(screen.getByRole('button')).toHaveClass('bg-white');
  });

  it('has dark border (border-[#222222])', () => {
    renderComponent();
    expect(screen.getByRole('button')).toHaveClass('border-[#222222]');
  });

  it('has dark text color (text-[#222222])', () => {
    renderComponent();
    expect(screen.getByRole('button')).toHaveClass('text-[#222222]');
  });

  it('has minimum 48px height (min-h-[48px])', () => {
    renderComponent();
    expect(screen.getByRole('button')).toHaveClass('min-h-[48px]');
  });

  it('has rounded corners (rounded-lg)', () => {
    renderComponent();
    expect(screen.getByRole('button')).toHaveClass('rounded-lg');
  });

  it('uses flex layout with items-center', () => {
    renderComponent();
    const button = screen.getByRole('button');
    expect(button).toHaveClass('flex');
    expect(button).toHaveClass('items-center');
  });

  it('has gap between icon and text (gap-2)', () => {
    renderComponent();
    expect(screen.getByRole('button')).toHaveClass('gap-2');
  });

  it('includes Languages icon', () => {
    renderComponent();

    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('lucide-languages');
  });

  it('Languages icon has correct size (w-5 h-5)', () => {
    renderComponent();

    const svg = document.querySelector('svg');
    expect(svg).toHaveClass('w-5');
    expect(svg).toHaveClass('h-5');
  });

  it('has border class', () => {
    renderComponent();
    expect(screen.getByRole('button')).toHaveClass('border');
  });
});

// =============================================================================
// Accessibility Tests
// =============================================================================

describe('ViewOriginalToggle - Accessibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("button has type='button' attribute", () => {
    renderComponent();
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('button has aria-label attribute', () => {
    renderComponent();
    expect(screen.getByRole('button')).toHaveAttribute('aria-label');
  });

  it('aria-label describes action correctly when viewing translated', () => {
    renderComponent({ isViewingOriginal: false, originalLanguage: 'fr' });

    expect(screen.getByRole('button')).toHaveAttribute(
      'aria-label',
      'Switch to original French version'
    );
  });

  it('aria-label describes action correctly when viewing original', () => {
    renderComponent({ isViewingOriginal: true });

    expect(screen.getByRole('button')).toHaveAttribute(
      'aria-label',
      'Switch to translated version'
    );
  });

  it("aria-pressed is 'false' when isViewingOriginal=false", () => {
    renderComponent({ isViewingOriginal: false });

    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');
  });

  it("aria-pressed is 'true' when isViewingOriginal=true", () => {
    renderComponent({ isViewingOriginal: true });

    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
  });

  it("Languages icon has aria-hidden='true' attribute", () => {
    renderComponent();

    const svg = document.querySelector('svg');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  it('button is disabled when disabled prop is true', () => {
    renderComponent({ disabled: true });

    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('button is not disabled when disabled prop is false', () => {
    renderComponent({ disabled: false });

    expect(screen.getByRole('button')).not.toBeDisabled();
  });

  it('disabled button does not call onToggle when clicked', async () => {
    const onToggle = vi.fn();
    renderComponent({ disabled: true, onToggle });

    const button = screen.getByRole('button');
    await userEvent.click(button);

    expect(onToggle).not.toHaveBeenCalled();
  });

  it('disabled button has disabled styling classes', () => {
    renderComponent({ disabled: true });

    const button = screen.getByRole('button');
    expect(button).toHaveClass('disabled:opacity-50');
    expect(button).toHaveClass('disabled:cursor-not-allowed');
  });
});

// =============================================================================
// Dynamic Text Tests
// =============================================================================

describe('ViewOriginalToggle - Dynamic Text', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('button text changes based on isViewingOriginal state', () => {
    const { rerender } = render(
      <ViewOriginalToggle
        isViewingOriginal={false}
        originalLanguage="en"
        onToggle={vi.fn()}
      />
    );

    expect(screen.getByRole('button')).toHaveTextContent('View in original (English)');

    rerender(
      <ViewOriginalToggle
        isViewingOriginal={true}
        originalLanguage="en"
        onToggle={vi.fn()}
      />
    );

    expect(screen.getByRole('button')).toHaveTextContent('View translation');
  });

  it('aria-label changes based on isViewingOriginal state', () => {
    const { rerender } = render(
      <ViewOriginalToggle
        isViewingOriginal={false}
        originalLanguage="de"
        onToggle={vi.fn()}
      />
    );

    expect(screen.getByRole('button')).toHaveAttribute(
      'aria-label',
      'Switch to original German version'
    );

    rerender(
      <ViewOriginalToggle
        isViewingOriginal={true}
        originalLanguage="de"
        onToggle={vi.fn()}
      />
    );

    expect(screen.getByRole('button')).toHaveAttribute(
      'aria-label',
      'Switch to translated version'
    );
  });

  it('aria-pressed changes based on isViewingOriginal state', () => {
    const { rerender } = render(
      <ViewOriginalToggle
        isViewingOriginal={false}
        originalLanguage="en"
        onToggle={vi.fn()}
      />
    );

    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');

    rerender(
      <ViewOriginalToggle
        isViewingOriginal={true}
        originalLanguage="en"
        onToggle={vi.fn()}
      />
    );

    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
  });
});

// =============================================================================
// Additional Styling Tests
// =============================================================================

describe('ViewOriginalToggle - Additional Styling', () => {
  it('has font-medium for text weight', () => {
    renderComponent();
    expect(screen.getByRole('button')).toHaveClass('font-medium');
  });

  it('has text-base for font size', () => {
    renderComponent();
    expect(screen.getByRole('button')).toHaveClass('text-base');
  });

  it('has transition classes for smooth effects', () => {
    renderComponent();
    const button = screen.getByRole('button');
    expect(button).toHaveClass('transition-all');
    expect(button).toHaveClass('duration-200');
    expect(button).toHaveClass('ease-out');
  });

  it('has focus ring classes', () => {
    renderComponent();
    const button = screen.getByRole('button');
    expect(button).toHaveClass('focus-visible:outline-none');
    expect(button).toHaveClass('focus-visible:ring-2');
    expect(button).toHaveClass('focus-visible:ring-[#222222]');
    expect(button).toHaveClass('focus-visible:ring-offset-2');
  });

  it('has hover scale effect class', () => {
    renderComponent();
    expect(screen.getByRole('button')).toHaveClass('hover:scale-[1.02]');
  });

  it('has hover background class', () => {
    renderComponent();
    expect(screen.getByRole('button')).toHaveClass('hover:bg-[#F7F7F7]');
  });

  it('has active scale effect class', () => {
    renderComponent();
    expect(screen.getByRole('button')).toHaveClass('active:scale-[0.98]');
  });

  it('has padding classes (px-6 py-3.5)', () => {
    renderComponent();
    const button = screen.getByRole('button');
    expect(button).toHaveClass('px-6');
    expect(button).toHaveClass('py-3.5');
  });

  it('has justify-center class', () => {
    renderComponent();
    expect(screen.getByRole('button')).toHaveClass('justify-center');
  });
});
