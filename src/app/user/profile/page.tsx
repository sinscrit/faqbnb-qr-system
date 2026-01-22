'use client';
// Last Modified: 2026-01-22 - REQ-E02-015: Create profile page

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import type { AuthUser } from '@/lib/auth';

// Constants for validation
const MAX_BIO_LENGTH = 500;
const MAX_NAME_LENGTH = 100;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

// Helper function to get display name
const getDisplayName = (user: AuthUser | null): string => {
  if (!user) return '';
  return user.fullName || user.email.split('@')[0];
};

// Account Info Display Section
function AccountInfoSection({ user }: { user: AuthUser | null }) {
  const t = useTranslations('settings.profile');

  if (!user) return null;

  const displayName = getDisplayName(user);
  const initials = user.email.charAt(0).toUpperCase();

  return (
    <section className="bg-white shadow rounded-lg p-6 mb-8">
      <div className="flex items-center space-x-4">
        {/* Profile Photo */}
        <div className="flex-shrink-0">
          {user.profilePicture ? (
            <img
              src={user.profilePicture}
              alt={displayName}
              className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover"
            />
          ) : (
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-2xl md:text-3xl font-semibold text-gray-600">
                {initials}
              </span>
            </div>
          )}
        </div>

        {/* User Info */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{displayName}</h2>
          <p className="text-sm text-gray-600">{user.email}</p>
        </div>
      </div>
    </section>
  );
}

// Profile Edit Form Section
function ProfileEditSection({ user }: { user: AuthUser | null }) {
  const t = useTranslations('settings.profile');
  const tValidation = useTranslations('common.validation');

  const [displayName, setDisplayName] = useState(user?.fullName || '');
  const [bio, setBio] = useState(''); // Future: user?.bio || ''
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_BIO_LENGTH) {
      setBio(value);
      setError(null);
    } else {
      setError(t('bioMaxLength'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Validation
    if (displayName.length > MAX_NAME_LENGTH) {
      setError(tValidation('tooLong', { max: MAX_NAME_LENGTH }));
      setLoading(false);
      return;
    }

    // TODO: API call will be added in future task
    // Simulate success for now
    setTimeout(() => {
      setSuccess(t('profileUpdated'));
      setLoading(false);
    }, 1000);
  };

  if (!user) return null;

  return (
    <section className="bg-white shadow rounded-lg p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
            {t('displayName')}
          </label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            disabled={loading}
            placeholder={t('displayNamePlaceholder')}
            aria-label={t('displayNameAriaLabel')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
            {t('bio')}
          </label>
          <textarea
            id="bio"
            value={bio}
            onChange={handleBioChange}
            disabled={loading}
            placeholder={t('bioPlaceholder')}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <div className={`text-xs mt-1 ${bio.length > MAX_BIO_LENGTH ? 'text-red-600' : 'text-gray-500'}`}>
            {bio.length}/{MAX_BIO_LENGTH}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? t('savingChanges') : t('saveChanges')}
        </button>

        {error && (
          <div className="text-red-600 text-sm mt-2 p-2 bg-red-50 border border-red-200 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="text-green-600 text-sm mt-2 p-2 bg-green-50 border border-green-200 rounded">
            {success}
          </div>
        )}
      </form>
    </section>
  );
}

// Profile Photo Upload Section
function ProfilePhotoSection({ user }: { user: AuthUser | null }) {
  const t = useTranslations('settings.profile');

  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      setError('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError('File size must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
      setFile(selectedFile);
      setError(null);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;

    // TODO: API call will be added in future task
    // Simulate upload
    setTimeout(() => {
      setSuccess(t('avatarUpdated'));
      setFile(null);
    }, 1000);
  };

  const handleRemove = async () => {
    // TODO: API call will be added in future task
    // Simulate remove
    setTimeout(() => {
      setPreview(null);
      setFile(null);
      setSuccess(t('avatarRemoved'));
    }, 500);
  };

  if (!user) return null;

  const currentPhoto = preview || user.profilePicture;
  const initials = user.email.charAt(0).toUpperCase();

  return (
    <section className="bg-white shadow rounded-lg p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4">{t('avatar')}</h2>

      <div className="flex items-center space-x-6">
        {/* Profile Photo Display */}
        <div className="flex-shrink-0">
          {currentPhoto ? (
            <img
              src={currentPhoto}
              alt="Profile"
              className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover"
            />
          ) : (
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-4xl md:text-5xl font-semibold text-gray-600">
                {initials}
              </span>
            </div>
          )}
        </div>

        {/* Upload Controls */}
        <div className="flex-1 space-y-3">
          <input
            type="file"
            id="photoUpload"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <label
            htmlFor="photoUpload"
            aria-label={t('uploadAvatarAriaLabel')}
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 cursor-pointer transition-colors"
          >
            {t('uploadAvatar')}
          </label>

          {(currentPhoto || preview) && (
            <button
              onClick={handleRemove}
              aria-label={t('removeAvatarAriaLabel')}
              className="block bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              {t('removeAvatar')}
            </button>
          )}

          {file && (
            <button
              onClick={handleUpload}
              className="block bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              Save New Photo
            </button>
          )}

          {error && (
            <div className="text-red-600 text-sm p-2 bg-red-50 border border-red-200 rounded">
              {error}
            </div>
          )}
          {success && (
            <div className="text-green-600 text-sm p-2 bg-green-50 border border-green-200 rounded">
              {success}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default function ProfilePage() {
  const t = useTranslations('settings.profile');
  const { user } = useAuth();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
        <p className="mt-2 text-gray-600">{t('subtitle')}</p>
      </div>

      {/* Account Info Section */}
      <AccountInfoSection user={user} />

      {/* Profile Edit Form Section */}
      <ProfileEditSection user={user} />

      {/* Profile Photo Upload Section */}
      <ProfilePhotoSection user={user} />
    </div>
  );
}
