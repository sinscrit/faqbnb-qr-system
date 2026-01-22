'use client';
// Last Modified: 2026-01-22 HH:MM - REQ-E02-014: Create account settings page

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';

// Helper functions for date/time formatting
const formatDate = (isoDate: string | undefined) => {
  if (!isoDate) return 'N/A';
  return new Date(isoDate).toLocaleDateString();
};

const formatTime = (isoDate: string | undefined) => {
  if (!isoDate) return 'N/A';
  return new Date(isoDate).toLocaleTimeString();
};

// Account Information Display Section
function AccountInfoSection() {
  const t = useTranslations('settings.account');
  const { user, session } = useAuth();

  if (!user) return null;

  // Get timestamps from session metadata if available
  const createdAt = session?.user?.created_at;
  const lastSignIn = session?.user?.last_sign_in_at;

  return (
    <section className="mb-8 bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">{t('email')}</h2>
      <p className="text-sm text-gray-600 mb-2">{t('emailDescription')}</p>
      <p className="text-gray-900 font-medium">{user.email}</p>

      {(createdAt || lastSignIn) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          {createdAt && (
            <p className="text-sm text-gray-500">
              {t('accountCreated', { date: formatDate(createdAt) })}
            </p>
          )}
          {lastSignIn && (
            <p className="text-sm text-gray-500 mt-1">
              {t('lastLogin', {
                date: formatDate(lastSignIn),
                time: formatTime(lastSignIn)
              })}
            </p>
          )}
        </div>
      )}
    </section>
  );
}

// Email Change Section with Form
function EmailChangeSection() {
  const t = useTranslations('settings.account');
  const tValidation = useTranslations('common.validation');

  const [newEmail, setNewEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Basic validation
    if (!newEmail || !confirmEmail || !currentPassword) {
      setError(tValidation('required'));
      setLoading(false);
      return;
    }

    if (newEmail !== confirmEmail) {
      setError(tValidation('emailMismatch'));
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      setError(tValidation('invalidEmail'));
      setLoading(false);
      return;
    }

    // TODO: API call will be added in future task
    // Simulate success for now
    setTimeout(() => {
      setSuccess(t('emailUpdated', { email: newEmail }));
      setNewEmail('');
      setConfirmEmail('');
      setCurrentPassword('');
      setLoading(false);
    }, 1000);
  };

  return (
    <section className="mb-8 bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">{t('changeEmail')}</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="newEmail" className="block text-sm font-medium text-gray-700">
            {t('email')}
          </label>
          <input
            id="newEmail"
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            disabled={loading}
            aria-label={t('emailInputAriaLabel')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="confirmEmail" className="block text-sm font-medium text-gray-700">
            Confirm New Email
          </label>
          <input
            id="confirmEmail"
            type="email"
            value={confirmEmail}
            onChange={(e) => setConfirmEmail(e.target.value)}
            disabled={loading}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="currentPasswordEmail" className="block text-sm font-medium text-gray-700">
            {t('currentPassword')}
          </label>
          <input
            id="currentPasswordEmail"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            disabled={loading}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          aria-label={t('changeEmailButtonAriaLabel')}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Updating...' : t('changeEmail')}
        </button>

        {error && (
          <div className="text-red-600 text-sm mt-2 p-2 bg-red-50 rounded">{error}</div>
        )}
        {success && (
          <div className="text-green-600 text-sm mt-2 p-2 bg-green-50 rounded">{success}</div>
        )}
      </form>
    </section>
  );
}

// Password Change Section with Form
function PasswordChangeSection() {
  const t = useTranslations('settings.account');
  const tValidation = useTranslations('common.validation');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError(tValidation('required'));
      setLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setError(tValidation('passwordTooShort'));
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(tValidation('passwordMismatch'));
      setLoading(false);
      return;
    }

    // TODO: API call will be added in future task
    setTimeout(() => {
      setSuccess(t('passwordUpdated'));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setLoading(false);
    }, 1000);
  };

  return (
    <section className="mb-8 bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">{t('changePassword')}</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="currentPasswordPwd" className="block text-sm font-medium text-gray-700">
            {t('currentPassword')}
          </label>
          <input
            id="currentPasswordPwd"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            disabled={loading}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
            {t('newPassword')}
          </label>
          <input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={loading}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            {t('confirmPassword')}
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Updating...' : t('changePassword')}
        </button>

        {error && (
          <div className="text-red-600 text-sm mt-2 p-2 bg-red-50 rounded">{error}</div>
        )}
        {success && (
          <div className="text-green-600 text-sm mt-2 p-2 bg-green-50 rounded">{success}</div>
        )}
      </form>
    </section>
  );
}

// Account Deletion Section with Confirmation Dialog
function AccountDeletionSection() {
  const t = useTranslations('settings.account');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleDelete = () => {
    // TODO: API call will be added in future task
    console.log('Account deletion requested');
    setShowConfirmDialog(false);
    // In future: signOut() and redirect to homepage
  };

  return (
    <section className="mb-8 bg-red-50 border-2 border-red-200 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-red-900 mb-2">
        {t('deleteAccount')}
      </h2>
      <p className="text-red-700 text-sm mb-4">
        {t('deleteWarning')}
      </p>

      <button
        onClick={() => setShowConfirmDialog(true)}
        aria-label={t('deleteAccountButtonAriaLabel')}
        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
      >
        {t('deleteAccount')}
      </button>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('deleteAccount')}
            </h3>
            <p className="text-gray-700 mb-6">
              {t('deleteConfirmation')}
            </p>
            <p className="text-red-600 text-sm mb-6">
              {t('deleteWarning')}
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default function AccountSettingsPage() {
  const t = useTranslations('settings.account');
  const { user } = useAuth();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
        <p className="mt-2 text-gray-600">{t('subtitle')}</p>
      </div>

      {/* Account Information Section */}
      <AccountInfoSection />

      {/* Email Change Section */}
      <EmailChangeSection />

      {/* Password Change Section */}
      <PasswordChangeSection />

      {/* Account Deletion Section */}
      <AccountDeletionSection />
    </div>
  );
}
