'use client';

/**
 * Account Settings Page
 *
 * Dashboard page for managing account-level preferences including language settings.
 * Fetches current preferences from API and integrates LanguagePreferenceSection component.
 *
 * REQ-E05-027: Integrate into account settings (or profile)
 * Epic 5 - Owner Translation Management, Phase 6, Task 6.3
 *
 * @route /dashboard2/settings
 * @created 2026-01-24
 * @lastModified 2026-01-24
 */

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from 'next-intl';
import { Loader2, Settings } from 'lucide-react';
import { LanguagePreferenceSection } from '@/components/TranslationManagement/LanguagePreference';
import { getLanguageOptions } from '@/lib/i18n';

/**
 * Account Settings Page Component
 * Manages account preferences with API integration
 */
export default function AccountSettingsPage() {
  const { user, currentAccount } = useAuth();
  const t = useTranslations('settings');

  // State for current language preference
  const [currentLanguage, setCurrentLanguage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Extract account ID
  const accountId = currentAccount?.id;

  // Fetch current preferences on mount
  useEffect(() => {
    async function fetchPreferences() {
      if (!accountId) {
        setError('No account ID available');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/accounts/${accountId}/preferences`, {
          method: 'GET',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch preferences');
        }

        const data = await response.json();

        if (data.success) {
          setCurrentLanguage(data.data.preferences.preferredLanguage);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load preferences';
        setError(message);
        console.error('Error fetching preferences:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchPreferences();
  }, [accountId]);

  /**
   * Handle saving language preference
   * Calls PUT API to update preference
   */
  async function handleSaveLanguagePreference(languageCode: string): Promise<void> {
    if (!accountId) {
      throw new Error('No account ID available');
    }

    const response = await fetch(`/api/accounts/${accountId}/preferences`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ preferredLanguage: languageCode }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to save preference');
    }

    const data = await response.json();

    if (data.success) {
      setCurrentLanguage(data.data.preferences.preferredLanguage);
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF385C]" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Settings className="w-8 h-8 text-gray-700" />
          <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
        </div>
        <p className="text-gray-600">{t('description')}</p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Settings Sections */}
      <div className="space-y-8">
        {/* Language Preference Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <LanguagePreferenceSection
            currentLanguage={currentLanguage}
            availableLanguages={getLanguageOptions()}
            onSave={handleSaveLanguagePreference}
          />
        </div>

        {/* Future sections can be added here */}
      </div>
    </div>
  );
}
