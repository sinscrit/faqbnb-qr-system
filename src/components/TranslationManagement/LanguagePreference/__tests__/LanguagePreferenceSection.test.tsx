/**
 * LanguagePreferenceSection Component Tests
 *
 * REQ-E05-025: Create LanguagePreferenceSection component
 * Epic 5 - Owner Translation Management, Phase 6, Task 6.1
 *
 * @created 2026-01-24
 * @lastModified 2026-01-24
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LanguagePreferenceSection } from '../LanguagePreferenceSection';
import type { LanguageOption } from '../LanguagePreferenceSection.types';

// Mock language options for testing
const mockLanguages: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
];

describe('LanguagePreferenceSection - Rendering', () => {
  let mockOnSave: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnSave = vi.fn().mockResolvedValue(undefined);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders with initial language selected from currentLanguage prop', () => {
    render(
      <LanguagePreferenceSection
        currentLanguage="fr"
        availableLanguages={mockLanguages}
        onSave={mockOnSave}
      />
    );

    const dropdown = screen.getByLabelText('Select language preference') as HTMLSelectElement;
    expect(dropdown.value).toBe('fr');
  });

  it('renders with first language if currentLanguage is null', () => {
    render(
      <LanguagePreferenceSection
        currentLanguage={null}
        availableLanguages={mockLanguages}
        onSave={mockOnSave}
      />
    );

    const dropdown = screen.getByLabelText('Select language preference') as HTMLSelectElement;
    expect(dropdown.value).toBe('en');
  });

  it('displays all available languages in dropdown', () => {
    render(
      <LanguagePreferenceSection
        currentLanguage="en"
        availableLanguages={mockLanguages}
        onSave={mockOnSave}
      />
    );

    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(3);
    expect(options[0]).toHaveTextContent('English');
    expect(options[1]).toHaveTextContent('French (Français)');
    expect(options[2]).toHaveTextContent('German (Deutsch)');
  });

  it('shows language name and native name correctly', () => {
    render(
      <LanguagePreferenceSection
        currentLanguage="en"
        availableLanguages={mockLanguages}
        onSave={mockOnSave}
      />
    );

    // English has same name and nativeName, should show only once
    expect(screen.getByText('English')).toBeInTheDocument();

    // French has different nativeName, should show both
    expect(screen.getByText('French (Français)')).toBeInTheDocument();
  });

  it('handles empty availableLanguages array gracefully', () => {
    render(
      <LanguagePreferenceSection
        currentLanguage={null}
        availableLanguages={[]}
        onSave={mockOnSave}
      />
    );

    const dropdown = screen.getByLabelText('Select language preference');
    expect(dropdown).toBeInTheDocument();
    const options = screen.queryAllByRole('option');
    expect(options).toHaveLength(0);
  });
});

describe('LanguagePreferenceSection - Save Functionality', () => {
  let mockOnSave: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnSave = vi.fn().mockResolvedValue(undefined);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('save button disabled when no changes made', () => {
    render(
      <LanguagePreferenceSection
        currentLanguage="en"
        availableLanguages={mockLanguages}
        onSave={mockOnSave}
      />
    );

    const saveButton = screen.getByRole('button', { name: /save/i });
    expect(saveButton).toBeDisabled();
  });

  it('save button enabled when language selection changes', () => {
    render(
      <LanguagePreferenceSection
        currentLanguage="en"
        availableLanguages={mockLanguages}
        onSave={mockOnSave}
      />
    );

    const dropdown = screen.getByLabelText('Select language preference');
    fireEvent.change(dropdown, { target: { value: 'fr' } });

    const saveButton = screen.getByRole('button', { name: /save/i });
    expect(saveButton).not.toBeDisabled();
  });

  it('save button disabled during save operation', async () => {
    const slowSave = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(
      <LanguagePreferenceSection
        currentLanguage="en"
        availableLanguages={mockLanguages}
        onSave={slowSave}
      />
    );

    const dropdown = screen.getByLabelText('Select language preference');
    fireEvent.change(dropdown, { target: { value: 'fr' } });

    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });

    const savingButton = screen.getByRole('button', { name: /saving/i });
    expect(savingButton).toBeDisabled();
  });

  it('shows loading spinner during save operation', async () => {
    const slowSave = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(
      <LanguagePreferenceSection
        currentLanguage="en"
        availableLanguages={mockLanguages}
        onSave={slowSave}
      />
    );

    const dropdown = screen.getByLabelText('Select language preference');
    fireEvent.change(dropdown, { target: { value: 'fr' } });

    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });
  });

  it('calls onSave with selected language code when Save clicked', async () => {
    render(
      <LanguagePreferenceSection
        currentLanguage="en"
        availableLanguages={mockLanguages}
        onSave={mockOnSave}
      />
    );

    const dropdown = screen.getByLabelText('Select language preference');
    fireEvent.change(dropdown, { target: { value: 'de' } });

    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith('de');
    });
  });

  it('displays success message after successful save', async () => {
    render(
      <LanguagePreferenceSection
        currentLanguage="en"
        availableLanguages={mockLanguages}
        onSave={mockOnSave}
      />
    );

    const dropdown = screen.getByLabelText('Select language preference');
    fireEvent.change(dropdown, { target: { value: 'fr' } });

    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Language preference saved successfully')).toBeInTheDocument();
    });
  });

  it('clears success message after 3 seconds', async () => {
    render(
      <LanguagePreferenceSection
        currentLanguage="en"
        availableLanguages={mockLanguages}
        onSave={mockOnSave}
      />
    );

    const dropdown = screen.getByLabelText('Select language preference');
    fireEvent.change(dropdown, { target: { value: 'fr' } });

    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Language preference saved successfully')).toBeInTheDocument();
    });

    // Advance timers by 3 seconds
    vi.advanceTimersByTime(3000);

    await waitFor(() => {
      expect(screen.queryByText('Language preference saved successfully')).not.toBeInTheDocument();
    });
  });

  it('displays error message when save fails', async () => {
    const failingSave = vi.fn().mockRejectedValue(new Error('Network error'));

    render(
      <LanguagePreferenceSection
        currentLanguage="en"
        availableLanguages={mockLanguages}
        onSave={failingSave}
      />
    );

    const dropdown = screen.getByLabelText('Select language preference');
    fireEvent.change(dropdown, { target: { value: 'fr' } });

    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('error message clears when user makes another change', async () => {
    const failingSave = vi.fn().mockRejectedValue(new Error('Network error'));

    render(
      <LanguagePreferenceSection
        currentLanguage="en"
        availableLanguages={mockLanguages}
        onSave={failingSave}
      />
    );

    const dropdown = screen.getByLabelText('Select language preference');
    fireEvent.change(dropdown, { target: { value: 'fr' } });

    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });

    // Change dropdown again
    fireEvent.change(dropdown, { target: { value: 'de' } });

    expect(screen.queryByText('Network error')).not.toBeInTheDocument();
  });

  it('save button disabled when disabled prop is true', () => {
    render(
      <LanguagePreferenceSection
        currentLanguage="en"
        availableLanguages={mockLanguages}
        onSave={mockOnSave}
        disabled={true}
      />
    );

    const dropdown = screen.getByLabelText('Select language preference');
    fireEvent.change(dropdown, { target: { value: 'fr' } });

    const saveButton = screen.getByRole('button', { name: /save/i });
    expect(saveButton).toBeDisabled();
  });
});

describe('LanguagePreferenceSection - Accessibility', () => {
  let mockOnSave: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnSave = vi.fn().mockResolvedValue(undefined);
  });

  it('dropdown has accessible label', () => {
    render(
      <LanguagePreferenceSection
        currentLanguage="en"
        availableLanguages={mockLanguages}
        onSave={mockOnSave}
      />
    );

    const dropdown = screen.getByLabelText('Select language preference');
    expect(dropdown).toBeInTheDocument();
  });

  it('save button has accessible label', () => {
    render(
      <LanguagePreferenceSection
        currentLanguage="en"
        availableLanguages={mockLanguages}
        onSave={mockOnSave}
      />
    );

    const saveButton = screen.getByRole('button', { name: /save language preference/i });
    expect(saveButton).toBeInTheDocument();
  });

  it('error message has role=alert', async () => {
    const failingSave = vi.fn().mockRejectedValue(new Error('Test error'));

    render(
      <LanguagePreferenceSection
        currentLanguage="en"
        availableLanguages={mockLanguages}
        onSave={failingSave}
      />
    );

    const dropdown = screen.getByLabelText('Select language preference');
    fireEvent.change(dropdown, { target: { value: 'fr' } });

    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveTextContent('Test error');
    });
  });

  it('success message has role=status', async () => {
    render(
      <LanguagePreferenceSection
        currentLanguage="en"
        availableLanguages={mockLanguages}
        onSave={mockOnSave}
      />
    );

    const dropdown = screen.getByLabelText('Select language preference');
    fireEvent.change(dropdown, { target: { value: 'fr' } });

    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      const status = screen.getByRole('status');
      expect(status).toBeInTheDocument();
      expect(status).toHaveTextContent('Language preference saved successfully');
    });
  });

  it('component is keyboard navigable', () => {
    render(
      <LanguagePreferenceSection
        currentLanguage="en"
        availableLanguages={mockLanguages}
        onSave={mockOnSave}
      />
    );

    const dropdown = screen.getByLabelText('Select language preference');
    const saveButton = screen.getByRole('button', { name: /save/i });

    // Both elements should be focusable
    expect(dropdown).not.toHaveAttribute('tabindex', '-1');
    expect(saveButton).not.toHaveAttribute('tabindex', '-1');
  });
});
