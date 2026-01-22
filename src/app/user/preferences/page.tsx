'use client';
// Last Modified: 2026-01-22 - REQ-E02-016: Create preferences page

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale, type SupportedLanguage } from '@/contexts/LocaleContext';
import { useTheme, type Theme } from '@/contexts/ThemeContext';

// Common timezones with offsets
const COMMON_TIMEZONES = [
  { value: 'America/New_York', label: 'New York', offset: 'UTC-5' },
  { value: 'America/Chicago', label: 'Chicago', offset: 'UTC-6' },
  { value: 'America/Los_Angeles', label: 'Los Angeles', offset: 'UTC-8' },
  { value: 'Europe/London', label: 'London', offset: 'UTC+0' },
  { value: 'Europe/Paris', label: 'Paris', offset: 'UTC+1' },
  { value: 'Europe/Berlin', label: 'Berlin', offset: 'UTC+1' },
  { value: 'Asia/Tokyo', label: 'Tokyo', offset: 'UTC+9' },
  { value: 'Asia/Shanghai', label: 'Shanghai', offset: 'UTC+8' },
  { value: 'Australia/Sydney', label: 'Sydney', offset: 'UTC+11' },
  { value: 'Pacific/Auckland', label: 'Auckland', offset: 'UTC+13' },
];

// Reusable Toggle Switch Component
interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description: string;
}

function ToggleSwitch({ checked, onChange, label, description }: ToggleSwitchProps) {
  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-md">
      <div className="flex-1">
        <div className="font-medium text-gray-900 dark:text-gray-100">{label}</div>
        <div className="text-sm text-gray-600 dark:text-gray-300">{description}</div>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          checked ? 'bg-blue-600' : 'bg-gray-200'
        }`}
      >
        <span
          aria-hidden="true"
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

// Language Selector Section
function LanguageSection() {
  const t = useTranslations('settings.preferences');
  const { locale, setLocale, supportedLocales, getLocaleName } = useLocale();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocale = e.target.value as SupportedLanguage;
    setLoading(true);
    setSuccess(null);

    try {
      const result = await setLocale(newLocale);
      if (result.success) {
        const languageName = getLocaleName(newLocale, true);
        setSuccess(t('languageUpdated', { language: languageName }));
      }
    } catch (error) {
      console.error('Failed to change language:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-white dark:bg-gray-900 shadow rounded-lg p-6 mb-6">
      <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">{t('language')}</h2>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{t('languageDescription')}</p>

      <select
        value={locale}
        onChange={handleChange}
        disabled={loading}
        aria-label={t('languageSelectorAriaLabel')}
        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {supportedLocales.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.nativeName}
          </option>
        ))}
      </select>

      {success && (
        <div className="text-green-600 dark:text-green-400 text-sm mt-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
          {success}
        </div>
      )}
    </section>
  );
}

// Theme Selector Section
function ThemeSection() {
  const t = useTranslations('settings.preferences');
  const { theme, setTheme } = useTheme();
  const [success, setSuccess] = useState<string | null>(null);

  const themes: Theme[] = ['light', 'dark', 'system'];

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    const themeName = t(`themeOptions.${newTheme}`);
    setSuccess(t('themeUpdated', { theme: themeName }));
    // Clear success message after 3 seconds
    setTimeout(() => setSuccess(null), 3000);
  };

  return (
    <section className="bg-white dark:bg-gray-900 shadow rounded-lg p-6 mb-6">
      <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">{t('theme')}</h2>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{t('themeDescription')}</p>

      <div role="radiogroup" aria-label={t('themeSelectorAriaLabel')} className="space-y-2">
        {themes.map((themeOption) => (
          <label
            key={themeOption}
            className={`flex items-center p-3 border rounded-md cursor-pointer transition-colors ${
              theme === themeOption
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
            }`}
          >
            <input
              type="radio"
              name="theme"
              value={themeOption}
              checked={theme === themeOption}
              onChange={() => handleThemeChange(themeOption)}
              className="mr-3"
            />
            <span className="font-medium text-gray-900 dark:text-gray-100">{t(`themeOptions.${themeOption}`)}</span>
          </label>
        ))}
      </div>

      {success && (
        <div className="text-green-600 dark:text-green-400 text-sm mt-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
          {success}
        </div>
      )}
    </section>
  );
}

// Timezone Selector Section
function TimezoneSection() {
  const t = useTranslations('settings.preferences');
  const [timezone, setTimezoneState] = useState<string>(() => {
    // Auto-detect timezone on mount
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      return 'America/New_York';
    }
  });
  const [success, setSuccess] = useState<string | null>(null);

  const handleTimezoneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTimezone = e.target.value;
    setTimezoneState(newTimezone);
    setSuccess(t('timezoneUpdated', { timezone: newTimezone }));
    // Clear success message after 3 seconds
    setTimeout(() => setSuccess(null), 3000);
  };

  return (
    <section className="bg-white dark:bg-gray-900 shadow rounded-lg p-6 mb-6">
      <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">{t('timezone')}</h2>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{t('timezoneDescription')}</p>

      <select
        value={timezone}
        onChange={handleTimezoneChange}
        aria-label={t('timezoneSelectorAriaLabel')}
        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      >
        {COMMON_TIMEZONES.map((tz) => (
          <option key={tz.value} value={tz.value}>
            {tz.label} ({tz.offset})
          </option>
        ))}
      </select>

      {success && (
        <div className="text-green-600 text-sm mt-2 p-2 bg-green-50 border border-green-200 rounded">
          {success}
        </div>
      )}
    </section>
  );
}

// Notification Preferences Section
function NotificationsSection() {
  const t = useTranslations('settings.notifications');
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: false,
    itemUpdates: true,
    propertyUpdates: true,
    systemAnnouncements: true,
    weeklyDigest: false,
  });
  const [success, setSuccess] = useState<string | null>(null);

  const handleToggle = (key: keyof typeof preferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    setSuccess(t('notificationsUpdated'));
    // Clear success message after 3 seconds
    setTimeout(() => setSuccess(null), 3000);
  };

  return (
    <section className="bg-white dark:bg-gray-900 shadow rounded-lg p-6 mb-6">
      <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">{t('title')}</h2>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{t('subtitle')}</p>

      <div className="space-y-4">
        {(Object.keys(preferences) as Array<keyof typeof preferences>).map((key) => (
          <ToggleSwitch
            key={key}
            checked={preferences[key]}
            onChange={() => handleToggle(key)}
            label={t(key)}
            description={t(`${key}Description`)}
          />
        ))}
      </div>

      {success && (
        <div className="text-green-600 dark:text-green-400 text-sm mt-4 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
          {success}
        </div>
      )}
    </section>
  );
}

// Security Settings Section
function SecuritySection() {
  const t = useTranslations('settings.security');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessions, setSessions] = useState([
    {
      id: '1',
      device: 'Chrome on MacBook Pro',
      location: 'New York, USA',
      lastActive: '2026-01-22T20:30:00Z',
      isCurrent: true,
    },
    {
      id: '2',
      device: 'Safari on iPhone',
      location: 'New York, USA',
      lastActive: '2026-01-21T15:20:00Z',
      isCurrent: false,
    },
    {
      id: '3',
      device: 'Firefox on Windows PC',
      location: 'Los Angeles, USA',
      lastActive: '2026-01-20T10:15:00Z',
      isCurrent: false,
    },
  ]);
  const [success, setSuccess] = useState<string | null>(null);

  const handleToggle2FA = () => {
    const newState = !twoFactorEnabled;
    setTwoFactorEnabled(newState);
    const message = newState ? t('twoFactorEnabled') : t('twoFactorDisabled');
    setSuccess(message);
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleRevokeSession = (sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    setSuccess(t('securityUpdated'));
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleRevokeAll = () => {
    setSessions((prev) => prev.filter((s) => s.isCurrent));
    setSuccess(t('securityUpdated'));
    setTimeout(() => setSuccess(null), 3000);
  };

  const formatLastActive = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <section className="bg-white dark:bg-gray-900 shadow rounded-lg p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">{t('title')}</h2>

      {/* Two-Factor Authentication */}
      <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-gray-100">{t('twoFactorAuth')}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{t('twoFactorAuthDescription')}</p>
        <button
          onClick={handleToggle2FA}
          className={`px-4 py-2 rounded-md text-white transition-colors ${
            twoFactorEnabled
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {twoFactorEnabled ? t('disable2FA') : t('enable2FA')}
        </button>
      </div>

      {/* Active Sessions */}
      <div>
        <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-gray-100">{t('activeSessions')}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{t('activeSessionsDescription')}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {t('sessionsActive', { count: sessions.length })}
        </p>

        <div className="space-y-3">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="flex items-start justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-md"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 dark:text-gray-100">{session.device}</span>
                  {session.isCurrent && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400">
                      {t('currentDevice')}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{session.location}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t('lastActive', { date: formatLastActive(session.lastActive) })}
                </p>
              </div>
              {!session.isCurrent && (
                <button
                  onClick={() => handleRevokeSession(session.id)}
                  className="ml-4 px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                >
                  {t('revokeSession')}
                </button>
              )}
            </div>
          ))}
        </div>

        {sessions.length > 1 && (
          <button
            onClick={handleRevokeAll}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            {t('revokeAllOther')}
          </button>
        )}
      </div>

      {success && (
        <div className="text-green-600 dark:text-green-400 text-sm mt-4 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
          {success}
        </div>
      )}
    </section>
  );
}

export default function PreferencesPage() {
  const t = useTranslations('settings.preferences');

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 dark:bg-gray-800">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('title')}</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">{t('subtitle')}</p>
      </div>

      {/* Sections Container */}
      <div className="space-y-6">
        {/* Language Selector Section */}
        <LanguageSection />

        {/* Theme Selector Section */}
        <ThemeSection />

        {/* Timezone Selector Section */}
        <TimezoneSection />

        {/* Notification Preferences Section */}
        <NotificationsSection />

        {/* Security Settings Section */}
        <SecuritySection />
      </div>
    </div>
  );
}
