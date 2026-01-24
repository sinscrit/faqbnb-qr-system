/**
 * LanguagePreferenceSection Component Types
 *
 * TypeScript interfaces for the LanguagePreferenceSection component.
 * Defines props, state, and data structures for language preference selection.
 *
 * REQ-E05-025: Create LanguagePreferenceSection component
 * Epic 5 - Owner Translation Management, Phase 6, Task 6.1
 *
 * @created 2026-01-24
 * @lastModified 2026-01-24
 */

/**
 * Represents a language option for the preference selector.
 * Used to populate dropdown options with human-readable names.
 */
export interface LanguageOption {
  /** ISO 639-1 language code (e.g., 'en', 'fr', 'de') */
  code: string;
  /** Display name in English (e.g., 'English', 'French', 'German') */
  name: string;
  /** Native language name (e.g., 'English', 'Français', 'Deutsch') - optional if same as name */
  nativeName?: string;
}

/**
 * Props for the LanguagePreferenceSection component.
 * Defines the interface for parent components to control the preference selector.
 */
export interface LanguagePreferenceSectionProps {
  /** Currently saved language preference code, or null if not set */
  currentLanguage: string | null;
  /** Array of available languages to display in dropdown */
  availableLanguages: LanguageOption[];
  /** Callback when user saves a new language preference. Receives the selected language code. */
  onSave: (languageCode: string) => Promise<void>;
  /** When true, disables the dropdown and save button (e.g., during parent operations) */
  disabled?: boolean;
  /** Additional CSS class names for the container element */
  className?: string;
}

/**
 * Internal state structure for the LanguagePreferenceSection component.
 * Documented for reference - actual state uses individual useState calls.
 */
export interface LanguagePreferenceSectionState {
  /** Currently selected language code in the dropdown */
  selectedLanguage: string;
  /** True while the save operation is in progress */
  isSaving: boolean;
  /** Error message from failed save operation, or null if no error */
  error: string | null;
  /** Success message after successful save, or null if not shown */
  successMessage: string | null;
}
