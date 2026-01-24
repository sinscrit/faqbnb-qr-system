'use client';

/**
 * LanguagePreferenceSection Component
 *
 * A standalone settings section for selecting owner's preferred language for translations.
 * Features dropdown selection, save button with loading states, and success/error feedback.
 *
 * REQ-E05-025: Create LanguagePreferenceSection component
 * Epic 5 - Owner Translation Management, Phase 6, Task 6.1
 *
 * @created 2026-01-24
 * @lastModified 2026-01-24
 */

import { useState, useCallback, useEffect } from 'react';
import { Globe, Check, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LanguagePreferenceSectionProps } from './LanguagePreferenceSection.types';

/**
 * Language preference selector component for owner translation management.
 * Allows owners to select their preferred language for managing translations.
 */
export function LanguagePreferenceSection({
  currentLanguage,
  availableLanguages,
  onSave,
  disabled = false,
  className,
}: LanguagePreferenceSectionProps) {
  // Selected language in the dropdown
  const [selectedLanguage, setSelectedLanguage] = useState<string>(
    currentLanguage || availableLanguages[0]?.code || ''
  );

  // Save operation in progress
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Error message from save operation
  const [error, setError] = useState<string | null>(null);

  // Success message after save
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sync selectedLanguage when currentLanguage prop changes
  useEffect(() => {
    if (currentLanguage !== null) {
      setSelectedLanguage(currentLanguage);
    }
  }, [currentLanguage]);

  // Auto-clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Handle save button click
  const handleSave = useCallback(async () => {
    if (isSaving || disabled) return;

    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await onSave(selectedLanguage);
      setSuccessMessage('Language preference saved successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save language preference');
    } finally {
      setIsSaving(false);
    }
  }, [isSaving, disabled, onSave, selectedLanguage]);

  // Clear error when selection changes
  const handleSelectionChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLanguage(e.target.value);
    setError(null);
  }, []);

  // Check if there are unsaved changes
  const hasChanges = selectedLanguage !== currentLanguage;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <Globe className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-medium text-gray-900">Language Preference</h3>
      </div>

      {/* Help Text */}
      <p className="text-sm text-gray-600">
        Select your preferred language for viewing and managing translations. This determines
        which language version you see by default when editing content.
      </p>

      {/* Form Controls */}
      <div className="flex items-center gap-3">
        {/* Language Dropdown */}
        <select
          value={selectedLanguage}
          onChange={handleSelectionChange}
          disabled={disabled || isSaving}
          aria-label="Select language preference"
          className={cn(
            'px-3 py-2 border rounded-lg max-w-xs',
            'text-gray-900 bg-white',
            'focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:border-transparent',
            'transition-colors duration-150',
            disabled || isSaving
              ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
              : 'border-gray-300 hover:border-gray-400'
          )}
        >
          {availableLanguages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.nativeName && lang.nativeName !== lang.name
                ? `${lang.name} (${lang.nativeName})`
                : lang.name}
            </option>
          ))}
        </select>

        {/* Save Button */}
        <button
          type="button"
          onClick={handleSave}
          disabled={disabled || isSaving || !hasChanges}
          aria-label={isSaving ? 'Saving language preference...' : 'Save language preference'}
          className={cn(
            'px-4 py-2 rounded-lg font-medium',
            'flex items-center gap-2',
            'transition-colors duration-150',
            disabled || isSaving || !hasChanges
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-[#FF385C] text-white hover:bg-[#E31C5F]'
          )}
        >
          {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div
          role="alert"
          className="flex items-center gap-2 text-sm text-red-600"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div
          role="status"
          className="flex items-center gap-2 text-sm text-green-600"
        >
          <Check className="w-4 h-4 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}
    </div>
  );
}

export default LanguagePreferenceSection;
