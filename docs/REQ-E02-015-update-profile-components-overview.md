# Implementation Overview: Update Profile Components

## Header
| Field | Value |
|-------|-------|
| Request Reference | REQ-E02-015 |
| Source File | docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md |
| Original Request Date | Not specified |
| Breakdown Created | 2026-01-22 21:26 |
| Sub-Epic | 2G - Settings & Account |
| Task | 2G.3 |
| T-shirt Size | Medium |
| Estimated Effort | 6-10 hours |
| Status | PENDING |

---

## Executive Summary

This task implements internationalization for user profile components in the FAQBNB application. The work involves creating a new profile page with profile editing functionality that uses the `settings.profile.*` namespace established in Task 2G.1 (REQ-E02-013). Currently, the application has NO dedicated profile page - user information is only displayed in the header (email, role badge) without any profile management capabilities.

**Current State:**
- No profile page exists in `/src/app/user/` or `/src/app/dashboard2/`
- User interface (from `/src/types/index.ts`) includes: `email`, `fullName/full_name`, `profilePicture`, `role`, `is_admin`, `created_at`, `updated_at`
- Database table `admin_users` has `full_name` field
- User layout header displays email and role badge only
- No profile editing functionality
- `settings.profile.*` namespace with 15 translation keys ready to use (created in Task 2G.1)

**Target State:**
- New profile page at `/src/app/user/profile/page.tsx`
- Profile display section showing current profile information
- Profile edit form with display name and bio fields
- Profile photo upload/remove functionality (UI only for now)
- Use all 15 keys from `settings.profile.*` translations
- Client-side components using `useTranslations('settings.profile')`

**Scope:**
- ~15 translation keys from `settings.profile.*` namespace
- Create 1 new page component
- Create 2-3 form/section components
- Client-side only (no backend API calls for now)
- Image upload UI (without actual storage implementation)

**Out of Scope:**
- Backend API for profile updates (future work)
- Actual image upload/storage to S3/Supabase Storage (future work)
- Image cropping/resizing functionality (future work)
- OAuth profile sync (Google profile photo, etc.)
- Public profile viewing (future feature)

---

## Goals

### Primary Objectives

1. **Create User Profile Page**
   - New page at `/src/app/user/profile/page.tsx`
   - Display current profile information (display name, bio, profile photo)
   - Editable form for updating profile
   - Use `settings.profile.*` translations throughout
   - Client-side component with `'use client'` directive

2. **Implement Profile Display Section**
   - Show current display name (from `user.fullName` or `user.full_name`)
   - Show current bio (if stored - may need to add to user type)
   - Show current profile photo (from `user.profilePicture` or placeholder)
   - Read-only display with "Edit Profile" button

3. **Implement Profile Edit Form**
   - Display name input field
   - Bio textarea (with character limit: 500 chars)
   - Form validation (required fields, max lengths)
   - Save/Cancel buttons
   - Success/error message display

4. **Implement Profile Photo Management**
   - Display current profile photo or placeholder/avatar
   - "Upload Photo" button (file input)
   - "Remove Photo" button (if photo exists)
   - Preview uploaded image before save
   - UI only - no actual upload to storage yet

5. **Add Navigation Link**
   - Add "Profile" link to user layout navigation
   - Icon and label using translations

### Success Criteria

- ✅ Profile page accessible at `/user/profile`
- ✅ All visible strings use translations from `settings.profile.*`
- ✅ Display name and bio editable in form
- ✅ Profile photo upload UI functional (file selection)
- ✅ Form validates inputs (max lengths, required fields)
- ✅ Success messages displayed for updates
- ✅ No hardcoded English strings remain
- ✅ All interactive elements have proper aria-labels
- ✅ TypeScript compilation succeeds with no errors

---

## Technical Context

### Translation Namespace: `settings.profile`

Available keys (from `/messages/en.json` lines 3420-3438):

```json
{
  "settings": {
    "profile": {
      "title": "Profile",
      "subtitle": "Manage your public profile information",
      "displayName": "Display Name",
      "displayNamePlaceholder": "Enter your name",
      "displayNameAriaLabel": "Display name input field",
      "bio": "Bio",
      "bioPlaceholder": "Tell us about yourself",
      "bioMaxLength": "Bio must be 500 characters or less",
      "avatar": "Profile Photo",
      "uploadAvatar": "Upload Photo",
      "uploadAvatarAriaLabel": "Upload profile photo",
      "removeAvatar": "Remove Photo",
      "removeAvatarAriaLabel": "Remove profile photo",
      "avatarUpdated": "Profile photo updated",
      "avatarRemoved": "Profile photo removed",
      "saveChanges": "Save Changes",
      "savingChanges": "Saving...",
      "profileUpdated": "Profile updated successfully"
    }
  }
}
```

**Total Keys:** 15

### Current User Type Structure

**File:** `/src/types/index.ts` (lines 43-56)

```typescript
export interface User {
  id: string;
  email: string;
  fullName?: string;
  full_name: string | null;
  role: string | null;
  is_admin?: boolean | null;
  profilePicture?: string;
  authProvider?: string;
  created_at: string | null;
  updated_at: string | null;
  createdAt?: string;
  updatedAt?: string;
}
```

**Note:** The User type has both `fullName` and `full_name` (camelCase and snake_case). Profile components should handle both for compatibility.

**Missing Fields:**
- `bio` - Not currently in User interface, may need to add or use `full_name` as display name only
- **Decision:** For now, use local state for bio (future: add to database)

### Database Schema

**Table:** `admin_users` (from `/database/schema.sql`)

```sql
CREATE TABLE admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Current Fields:**
- `full_name` - Can store display name
- No `bio` field - May need migration in future
- No `profile_picture_url` field - May need migration in future

**For This Task:**
- Use `full_name` for display name
- Store bio in local state only (no persistence yet)
- Store profile picture URL in local state only (no persistence yet)

### Authentication Context

**File:** `/src/contexts/AuthContext.tsx`

**Available Data:**
- `user` - Current user object
- `user.email` - User email address
- `user.fullName` / `user.full_name` - Display name
- `user.profilePicture` - Profile photo URL (if exists)
- `user.created_at` - Account creation timestamp

**Hook Usage:**
```tsx
const { user } = useAuth();
```

### Component Patterns to Follow

**Pattern 1: Page Component with useTranslations**
```tsx
'use client';
import { useTranslations } from 'next-intl';

export default function ProfilePage() {
  const t = useTranslations('settings.profile');

  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('subtitle')}</p>
      {/* Content */}
    </div>
  );
}
```

**Pattern 2: Form Component with Validation**
```tsx
'use client';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

export function ProfileEditForm() {
  const t = useTranslations('settings.profile');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validation
    if (bio.length > 500) {
      setError(t('bioMaxLength'));
      return;
    }
    // Save (future: API call)
    setSuccess(t('profileUpdated'));
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="displayName">{t('displayName')}</label>
      <input
        id="displayName"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        placeholder={t('displayNamePlaceholder')}
        aria-label={t('displayNameAriaLabel')}
      />
      {/* More fields */}
      <button type="submit">{t('saveChanges')}</button>
    </form>
  );
}
```

**Pattern 3: Image Upload Component**
```tsx
export function ProfilePhotoUpload() {
  const t = useTranslations('settings.profile');
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      <label htmlFor="avatar">{t('avatar')}</label>
      <input
        type="file"
        id="avatar"
        accept="image/*"
        onChange={handleFileChange}
        aria-label={t('uploadAvatarAriaLabel')}
      />
      {preview && <img src={preview} alt="Profile preview" />}
      <button aria-label={t('removeAvatarAriaLabel')}>
        {t('removeAvatar')}
      </button>
    </div>
  );
}
```

### Existing Translation Patterns

From other components (PropertyForm, AccountSettings):

```tsx
// Multiple translation scopes
const t = useTranslations('settings.profile');
const tCommon = useTranslations('common');
const tActions = useTranslations('common.actions');

// Form validation with character limits
const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
  const value = e.target.value;
  if (value.length <= 500) {
    setBio(value);
    setError(null);
  } else {
    setError(t('bioMaxLength'));
  }
};

// Success notifications
setSuccessMessage(t('profileUpdated'));
setSuccessMessage(t('avatarUpdated'));
```

---

## Implementation Plan

### Step 1: Create Profile Page Component
**Description:** Create the main profile page at `/src/app/user/profile/page.tsx`
**Rationale:** Foundation for all profile UI, follows existing app structure
**Estimated Effort:** Small (1-2 hours)

**Implementation Details:**
- Create new file: `/src/app/user/profile/page.tsx`
- Client-side component (`'use client'`)
- Use `useTranslations('settings.profile')` hook
- Use `useAuth()` hook for user data
- Page structure:
  - Header with title and subtitle
  - Profile display section (current info)
  - Profile edit form section
  - Profile photo management section
- Style with Tailwind CSS (match existing pages)

**Key Components:**
```tsx
'use client';

import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

export default function ProfilePage() {
  const t = useTranslations('settings.profile');
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
        <p className="mt-2 text-gray-600">{t('subtitle')}</p>
      </div>

      {/* Profile sections */}
      <ProfileDisplaySection user={user} />
      <ProfileEditSection user={user} />
      <ProfilePhotoSection user={user} />
    </div>
  );
}
```

**Key Translations:**
- `t('title')` - Page title
- `t('subtitle')` - Page subtitle

---

### Step 2: Create Profile Display Section
**Description:** Display current profile information (read-only view)
**Rationale:** Show user their current profile before editing
**Estimated Effort:** Small (1 hour)

**Implementation Details:**
- Create component: `ProfileDisplaySection` (inline or separate file)
- Display fields:
  - Display name (from `user.fullName` or `user.full_name` or default to email username)
  - Email address (read-only, from `user.email`)
  - Bio (if exists, or placeholder text)
  - Profile photo (or placeholder avatar)
- Show "Edit Profile" button to toggle edit mode
- Style as info card with subtle background

**Default Display Name Logic:**
```tsx
const getDisplayName = (user: User | null) => {
  if (!user) return '';
  return user.fullName || user.full_name || user.email.split('@')[0];
};
```

**Component Structure:**
```tsx
function ProfileDisplaySection({ user }: { user: User | null }) {
  const t = useTranslations('settings.profile');

  return (
    <section className="mb-8 bg-white shadow rounded-lg p-6">
      <div className="flex items-center space-x-4">
        {/* Profile photo or placeholder */}
        <div className="w-20 h-20 rounded-full bg-gray-200">
          {user?.profilePicture ? (
            <img src={user.profilePicture} alt="Profile" className="w-full h-full rounded-full" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl text-gray-500">
              {user?.email?.[0]?.toUpperCase()}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold">{getDisplayName(user)}</h2>
          <p className="text-sm text-gray-600">{user?.email}</p>
        </div>
      </div>
    </section>
  );
}
```

---

### Step 3: Create Profile Edit Form Section
**Description:** Form for editing display name and bio
**Rationale:** Core profile management feature
**Estimated Effort:** Medium (2-3 hours)

**Implementation Details:**
- Create component: `ProfileEditSection`
- Form fields:
  - Display name input (with placeholder)
  - Bio textarea (with character counter: X/500)
  - Character limit validation for bio (500 chars max)
- Form state management with `useState`
- Submit handler (currently: show success message, no API call)
- Display success/error messages
- Save/Cancel buttons
- Proper aria-labels for all inputs

**Form Structure:**
```tsx
function ProfileEditSection({ user }: { user: User | null }) {
  const t = useTranslations('settings.profile');
  const [displayName, setDisplayName] = useState(user?.fullName || user?.full_name || '');
  const [bio, setBio] = useState(''); // Future: load from user.bio
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= 500) {
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

    try {
      // Future: API call to update profile
      // await updateProfile({ displayName, bio });

      setSuccess(t('profileUpdated'));
    } catch (err) {
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mb-8 bg-white shadow rounded-lg p-6">
      <h3 className="text-xl font-semibold mb-4">{t('title')}</h3>
      <form onSubmit={handleSubmit}>
        {/* Display Name */}
        <div className="mb-4">
          <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
            {t('displayName')}
          </label>
          <input
            type="text"
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder={t('displayNamePlaceholder')}
            aria-label={t('displayNameAriaLabel')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        {/* Bio */}
        <div className="mb-4">
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
            {t('bio')}
          </label>
          <textarea
            id="bio"
            value={bio}
            onChange={handleBioChange}
            placeholder={t('bioPlaceholder')}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
          <div className="text-sm text-gray-500 mt-1">
            {bio.length}/500
          </div>
        </div>

        {/* Buttons */}
        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? t('savingChanges') : t('saveChanges')}
          </button>
        </div>

        {/* Messages */}
        {success && <div className="mt-4 text-green-600">{success}</div>}
        {error && <div className="mt-4 text-red-600">{error}</div>}
      </form>
    </section>
  );
}
```

**Key Translations:**
- `t('displayName')` - Field label
- `t('displayNamePlaceholder')` - Input placeholder
- `t('displayNameAriaLabel')` - Input aria-label
- `t('bio')` - Textarea label
- `t('bioPlaceholder')` - Textarea placeholder
- `t('bioMaxLength')` - Validation error message
- `t('saveChanges')` - Button text
- `t('savingChanges')` - Loading state text
- `t('profileUpdated')` - Success message

---

### Step 4: Create Profile Photo Upload Section
**Description:** UI for uploading and managing profile photo
**Rationale:** Essential profile feature, visual identity
**Estimated Effort:** Medium (2-3 hours)

**Implementation Details:**
- Create component: `ProfilePhotoSection`
- Display current profile photo or placeholder avatar
- File input for photo upload (accept: image/*)
- Preview uploaded image before save
- "Upload Photo" button
- "Remove Photo" button (if photo exists)
- File size validation (max 5MB recommended)
- Image type validation (jpg, png, gif)
- Show success message: `t('avatarUpdated')`
- Show success message: `t('avatarRemoved')`
- UI only - no actual upload to storage yet

**Component Structure:**
```tsx
function ProfilePhotoSection({ user }: { user: User | null }) {
  const t = useTranslations('settings.profile');
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    if (!selectedFile.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setFile(selectedFile);
    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      // Future: Upload to storage
      // const url = await uploadProfilePhoto(file);
      // await updateUserProfile({ profilePicture: url });

      setSuccess(t('avatarUpdated'));
      setFile(null);
    } catch (err) {
      setError('Failed to upload photo');
    }
  };

  const handleRemove = async () => {
    try {
      // Future: Remove from storage
      // await updateUserProfile({ profilePicture: null });

      setSuccess(t('avatarRemoved'));
      setPreview(null);
    } catch (err) {
      setError('Failed to remove photo');
    }
  };

  const currentPhoto = preview || user?.profilePicture;

  return (
    <section className="mb-8 bg-white shadow rounded-lg p-6">
      <h3 className="text-xl font-semibold mb-4">{t('avatar')}</h3>

      {/* Current Photo */}
      <div className="flex items-center space-x-6 mb-4">
        <div className="w-32 h-32 rounded-full bg-gray-200 overflow-hidden">
          {currentPhoto ? (
            <img src={currentPhoto} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl text-gray-500">
              {user?.email?.[0]?.toUpperCase()}
            </div>
          )}
        </div>

        <div>
          {/* Upload Button */}
          <label
            htmlFor="photoUpload"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer"
            aria-label={t('uploadAvatarAriaLabel')}
          >
            {t('uploadAvatar')}
          </label>
          <input
            type="file"
            id="photoUpload"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Remove Button (if photo exists) */}
          {currentPhoto && (
            <button
              onClick={handleRemove}
              aria-label={t('removeAvatarAriaLabel')}
              className="ml-3 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              {t('removeAvatar')}
            </button>
          )}
        </div>
      </div>

      {/* Upload new file button (if file selected) */}
      {file && (
        <button
          onClick={handleUpload}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Save New Photo
        </button>
      )}

      {/* Messages */}
      {success && <div className="mt-4 text-green-600">{success}</div>}
      {error && <div className="mt-4 text-red-600">{error}</div>}
    </section>
  );
}
```

**Key Translations:**
- `t('avatar')` - Section title
- `t('uploadAvatar')` - Upload button text
- `t('uploadAvatarAriaLabel')` - Upload button aria-label
- `t('removeAvatar')` - Remove button text
- `t('removeAvatarAriaLabel')` - Remove button aria-label
- `t('avatarUpdated')` - Success message for upload
- `t('avatarRemoved')` - Success message for removal

---

### Step 5: Add Profile Navigation Link
**Description:** Add "Profile" link to user layout navigation
**Rationale:** Users need to discover and access profile page
**Estimated Effort:** Small (30 minutes)

**Implementation Details:**
- Update file: `/src/app/user/layout.tsx`
- Add navigation item to `navigationItems` array
- Insert after "Analytics", before "Account" or "Settings"
- Use profile icon (👤 or similar)
- Label: Use translation key

**Code Change:**
```tsx
const navigationItems = [
  { name: 'Dashboard', href: '/user', icon: '📊' },
  { name: 'Items', href: '/user/items', icon: '📦' },
  { name: 'Properties', href: '/user/properties', icon: '🏠' },
  { name: 'Analytics', href: '/user/analytics', icon: '📈' },
  { name: t('settings.profile.title'), href: '/user/profile', icon: '👤' }, // NEW
  { name: t('settings.title'), href: '/user/account', icon: '⚙️' }, // From Task 2G.2
  ...(isAdmin ? [{ name: 'Admin Panel', href: '/admin', icon: '👑' }] : [])
];
```

**Translation Key:**
- Use `settings.profile.title` ("Profile")
- Or use `common.navigation.profile` if more appropriate

---

### Step 6: Handle Missing Bio Field in User Type
**Description:** Add bio field to User interface (TypeScript only)
**Rationale:** Type safety for bio field in forms
**Estimated Effort:** Small (30 minutes)

**Implementation Details:**
- Update file: `/src/types/index.ts`
- Add optional `bio` field to User interface
- Document that bio is future feature (not in database yet)

**Type Update:**
```typescript
export interface User {
  id: string;
  email: string;
  fullName?: string;
  full_name: string | null;
  role: string | null;
  is_admin?: boolean | null;
  profilePicture?: string;
  bio?: string | null; // NEW: Future feature
  authProvider?: string;
  created_at: string | null;
  updated_at: string | null;
  createdAt?: string;
  updatedAt?: string;
}
```

**Note:** This is TypeScript-only change. Database migration for `bio` field is future work.

---

### Step 7: Implement Form Validation
**Description:** Client-side validation for profile form fields
**Rationale:** Prevent invalid data, good UX
**Estimated Effort:** Small (1 hour)

**Implementation Details:**
- Display name validation:
  - Max length: 100 characters (reasonable limit)
  - Optional field (can be empty)
- Bio validation:
  - Max length: 500 characters
  - Show character counter: "X/500"
  - Show error if exceeds limit
  - Optional field (can be empty)
- Real-time validation as user types
- Display validation errors inline

**Validation Logic:**
```tsx
const MAX_BIO_LENGTH = 500;
const MAX_NAME_LENGTH = 100;

const validateDisplayName = (name: string): string | null => {
  if (name.length > MAX_NAME_LENGTH) {
    return `Display name must be ${MAX_NAME_LENGTH} characters or less`;
  }
  return null;
};

const validateBio = (bio: string): string | null => {
  if (bio.length > MAX_BIO_LENGTH) {
    return t('bioMaxLength');
  }
  return null;
};
```

**Character Counter Component:**
```tsx
<div className="text-sm text-gray-500 mt-1">
  <span className={bio.length > MAX_BIO_LENGTH ? 'text-red-600' : ''}>
    {bio.length}/{MAX_BIO_LENGTH}
  </span>
</div>
```

---

### Step 8: Add Loading and Success States
**Description:** Proper loading states and feedback for form submissions
**Rationale:** Better UX, consistent with existing patterns
**Estimated Effort:** Small (1 hour)

**Implementation Details:**
- Add loading state: `const [loading, setLoading] = useState(false)`
- Add success state: `const [success, setSuccess] = useState<string | null>(null)`
- Add error state: `const [error, setError] = useState<string | null>(null)`
- Disable form inputs and buttons while loading
- Display success messages (green text, check icon)
- Display error messages (red text, alert icon)
- Auto-clear messages after 5 seconds (optional)

**Pattern:**
```tsx
const [loading, setLoading] = useState(false);
const [success, setSuccess] = useState<string | null>(null);
const [error, setError] = useState<string | null>(null);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError(null);
  setSuccess(null);

  try {
    // Validation
    const nameError = validateDisplayName(displayName);
    const bioError = validateBio(bio);
    if (nameError || bioError) {
      setError(nameError || bioError);
      return;
    }

    // API call (future)
    // await updateProfile({ displayName, bio });

    setSuccess(t('profileUpdated'));

    // Auto-clear success message after 5 seconds
    setTimeout(() => setSuccess(null), 5000);
  } catch (err) {
    setError('Failed to update profile');
  } finally {
    setLoading(false);
  }
};

return (
  <form onSubmit={handleSubmit}>
    {/* Form fields */}
    <button disabled={loading}>
      {loading ? t('savingChanges') : t('saveChanges')}
    </button>
    {error && (
      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-600">{error}</p>
      </div>
    )}
    {success && (
      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
        <p className="text-green-600">{success}</p>
      </div>
    )}
  </form>
);
```

---

### Step 9: Style and Responsive Design
**Description:** Ensure profile page is responsive and matches app styling
**Rationale:** Consistent UX across devices
**Estimated Effort:** Small (1 hour)

**Implementation Details:**
- Use Tailwind CSS (match existing pages)
- Responsive layout:
  - Desktop: Max width 3xl (768px), centered
  - Tablet: Full width with padding
  - Mobile: Stack sections vertically, smaller text
- Profile photo:
  - Desktop: 128px × 128px
  - Mobile: 80px × 80px
- Form inputs:
  - Full width on mobile
  - Adequate touch targets (min 44px height)
- Test on multiple screen sizes:
  - Mobile: 320px, 375px, 414px
  - Tablet: 768px, 1024px
  - Desktop: 1280px, 1920px

**Responsive Utilities:**
```tsx
// Profile photo size
<div className="w-20 h-20 md:w-32 md:h-32 rounded-full">

// Page container
<div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

// Form layout
<div className="space-y-6">
  <div className="sm:flex sm:space-x-4">
    {/* Horizontal on desktop, vertical on mobile */}
  </div>
</div>
```

---

### Step 10: Testing and Validation
**Description:** Manual testing of all profile functionality
**Rationale:** Ensure all features work correctly
**Estimated Effort:** Small (1-2 hours)

**Testing Checklist:**
- [ ] Profile page loads at `/user/profile`
- [ ] All text displays in English (from translations)
- [ ] Display name shows current user name or email
- [ ] Display name can be edited in form
- [ ] Bio can be entered in textarea
- [ ] Bio character counter works (X/500)
- [ ] Bio shows error when exceeds 500 chars
- [ ] Profile photo displays (or placeholder)
- [ ] File upload works (file selection)
- [ ] Image preview shows after file selection
- [ ] Remove photo button appears when photo exists
- [ ] Save button works and shows success message
- [ ] Loading state shows "Saving..." text
- [ ] Success messages display with green styling
- [ ] Error messages display with red styling
- [ ] Form disabled during loading
- [ ] Navigation includes "Profile" link
- [ ] Profile link highlights when on profile page
- [ ] All aria-labels present and correct
- [ ] No console errors or warnings
- [ ] TypeScript compilation succeeds
- [ ] Page is responsive (mobile, tablet, desktop)

**Translation Validation:**
- [ ] All 15 keys from `settings.profile.*` used
- [ ] No hardcoded English strings remain
- [ ] Proper fallback for missing translations

**Accessibility Testing:**
- [ ] Tab through all form elements
- [ ] Screen reader announces labels correctly
- [ ] All interactive elements have visible focus states
- [ ] Buttons have descriptive aria-labels
- [ ] Image upload has accessible file input

---

## Authorized Files and Functions for Modification

> ⚠️ **APPROVED SCOPE**: Changes outside this list require review

### New Files to Create

| File | Purpose | Type |
|------|---------|------|
| `/src/app/user/profile/page.tsx` | Main profile page component | Create |

### Existing Files to Modify

#### User Type

| File | Lines | Target | Modification |
|------|-------|--------|--------------|
| `/src/types/index.ts` | 43-56 | `User` interface | Add optional `bio` field |

#### User Layout (Navigation)

| File | Lines | Target | Modification |
|------|-------|--------|--------------|
| `/src/app/user/layout.tsx` | 1-20 | Imports | Add `useTranslations` import (if not already present from Task 2G.2) |
| `/src/app/user/layout.tsx` | 92-99 | `navigationItems` array | Add profile navigation item |

#### Translation Files (Reference Only)

| File | Lines | Purpose | Modification |
|------|-------|---------|--------------|
| `/messages/en.json` | 3420-3438 | Profile translations | Reference only (already created in Task 2G.1) |
| `/messages/fr.json` | ~3420-3438 | French placeholders | Reference (translations in Task 2G.6) |
| `/messages/es.json` | ~3420-3438 | Spanish placeholders | Reference (translations in Task 2G.6) |
| `/messages/de.json` | ~3420-3438 | German placeholders | Reference (translations in Task 2G.6) |
| `/messages/nl.json` | ~3420-3438 | Dutch placeholders | Reference (translations in Task 2G.6) |
| `/messages/it.json` | ~3420-3438 | Italian placeholders | Reference (translations in Task 2G.6) |

---

## Dependencies

### Depends On (Completed First)

- **REQ-E02-013** (Task 2G.1): Create `settings` namespace structure
  - **Status:** MUST be completed first
  - **Provides:** `settings.profile.*` translation keys (15 keys)
  - **Reason:** Cannot use translations that don't exist yet

- **Epic 1 - L10N Foundation**
  - **Status:** Completed
  - **Provides:** next-intl setup, useTranslations hook, translation file structure
  - **Reason:** Core i18n infrastructure required

### Blocks (Requires This First)

- **REQ-E02-089** (Task 2G.6): Generate translations for 5 non-English languages
  - **Status:** Blocked until this task completes
  - **Reason:** Need to see profile UI in context before translating
  - **Files:** `/messages/fr.json`, `/messages/es.json`, `/messages/de.json`, `/messages/nl.json`, `/messages/it.json`

### Parallel Safety

**Files Modified by This Task:**
- `/src/app/user/profile/page.tsx` (new file)
- `/src/types/index.ts` (User interface - add bio field)
- `/src/app/user/layout.tsx` (navigation array)

**Conflicts With:**
- **Task 2G.2** (Update account settings components) - Also modifies `/src/app/user/layout.tsx` navigation
  - **Resolution:** Both tasks add navigation items to same array
  - **Safe to parallelize:** NO (git merge conflict likely)
  - **Recommendation:** Run Task 2G.2 first, then 2G.3, then 2G.4

- **Task 2G.4** (Update preferences components) - Also modifies `/src/app/user/layout.tsx` navigation
  - **Resolution:** Both tasks add navigation items to same array
  - **Safe to parallelize:** NO
  - **Recommendation:** Sequential execution

- **Task 2G.5** (Update help page) - Modifies `/src/app/dashboard2/help/page.tsx`
  - **Resolution:** Different files, no conflicts
  - **Safe to parallelize:** YES

**Safe to Parallelize With:**
- Task 2G.5 (Help page) - Different files
- Any tasks not touching user layout or User type

### External Dependencies

- **next-intl library** - Translation hook (`useTranslations`)
- **React hooks** - useState, useEffect (for form state)
- **AuthContext** - useAuth hook (for user data)
- **Tailwind CSS** - Styling framework
- **Next.js App Router** - Page routing
- **FileReader API** - Image preview functionality (browser API)

---

## Risks and Considerations

### Potential Side Effects

1. **User Type Changes**
   - **Risk:** Adding `bio` field to User interface without database field
   - **Mitigation:** Mark as optional, document as future feature, use local state only
   - **Impact:** Low (TypeScript-only change)

2. **User Layout Navigation Conflicts**
   - **Risk:** Multiple tasks adding navigation items
   - **Mitigation:** Coordinate with Tasks 2G.2 and 2G.4, sequential execution
   - **Impact:** Medium (merge conflicts)

3. **Profile Photo Without Storage**
   - **Risk:** Users expect photo upload to persist
   - **Mitigation:** Show clear messaging that feature is coming soon, OR disable until backend ready
   - **Impact:** Medium (UX confusion)

4. **Bio Without Database Field**
   - **Risk:** Bio data not persisted
   - **Mitigation:** Use local state only, show message that feature is preview, OR disable until backend ready
   - **Impact:** Medium (UX confusion)

### Testing Requirements

1. **Translation Testing**
   - Verify all 15 keys from `settings.profile.*` display correctly
   - Test with missing translations (fallback behavior)
   - Test character counter with different lengths

2. **Form Validation Testing**
   - Test display name max length (100 chars)
   - Test bio max length (500 chars)
   - Test character counter accuracy
   - Test validation messages display

3. **Image Upload Testing**
   - Test file selection (various image types)
   - Test file size validation (>5MB should fail)
   - Test image preview display
   - Test non-image files rejected

4. **Accessibility Testing**
   - Test keyboard navigation (tab through forms)
   - Test screen reader announcements
   - Verify aria-labels present and accurate
   - Test focus states visible

5. **Responsive Design Testing**
   - Test on mobile (320px, 375px, 414px width)
   - Test on tablet (768px, 1024px width)
   - Test on desktop (1280px, 1920px width)
   - Verify profile photo scales appropriately
   - Verify forms and buttons usable on all sizes

### Open Questions

1. **Bio Field Storage**
   - [ ] Should we add `bio` field to database in this task?
   - [ ] Or keep bio in local state only for now?
   - **Recommendation:** Local state only for now (faster implementation, backend in future epic)

2. **Profile Photo Storage**
   - [ ] Which storage service? Supabase Storage or S3?
   - [ ] Should we implement upload in this task or defer?
   - **Recommendation:** UI only for now, storage implementation in future

3. **Display Name vs Full Name**
   - [ ] Should display name be separate from `full_name` in database?
   - [ ] Or overload `full_name` field for display name?
   - **Recommendation:** Use existing `full_name` field for now

4. **Profile Photo Defaults**
   - [ ] Should we generate avatar initials (like Gravatar)?
   - [ ] Or use simple placeholder icon?
   - **Recommendation:** Simple placeholder with first letter of email

5. **Public Profile Feature**
   - [ ] Is there a future requirement for public profiles (view other users)?
   - [ ] If yes, should we design with that in mind?
   - **Decision:** Out of scope for now, but good to keep in mind

---

## Out of Scope

The following items are explicitly **NOT** included in this task:

### Backend Implementation
- Profile update API endpoint (`/api/user/profile` PUT)
- Profile photo upload to storage (Supabase Storage / S3)
- Bio field database migration
- Profile data validation on server
- Profile photo processing (resize, crop, optimize)

### Advanced Profile Features
- OAuth profile sync (Google profile photo, name)
- Profile photo cropping UI
- Multiple profile photos / gallery
- Profile visibility settings (public/private)
- Profile completeness indicator
- Social media links
- Location/timezone information
- Custom profile URL/username

### User Preferences
- Language selection - Task 2G.4 (Preferences)
- Theme selection - Task 2G.4 (Preferences)
- Timezone selection - Task 2G.4 (Preferences)
- Email notification preferences - Future work

### Account Settings
- Email change - Task 2G.2 (Account Settings)
- Password change - Task 2G.2 (Account Settings)
- Account deletion - Task 2G.2 (Account Settings)
- Two-factor authentication - Task 2G.4 (Security)
- Active sessions - Task 2G.4 (Security)

### Public Profile Features
- View other users' profiles
- Profile search/discovery
- Follow/connections system
- Profile activity feed
- Profile badges/achievements

### Multi-Language Translation
- French translations - Task 2G.6
- Spanish translations - Task 2G.6
- German translations - Task 2G.6
- Dutch translations - Task 2G.6
- Italian translations - Task 2G.6

---

## Success Metrics

### Quantitative Metrics

1. **Translation Coverage**
   - Target: 100% of profile strings use translations
   - Measurement: Manual inspection, no hardcoded strings

2. **Translation Key Usage**
   - Target: Use all 15 keys from `settings.profile.*` namespace
   - Measurement: Count keys referenced vs. available in en.json

3. **TypeScript Compilation**
   - Target: 0 compilation errors
   - Measurement: `npm run typecheck` exit code

4. **Form Validation**
   - Target: 100% of validation rules working
   - Measurement: Test with invalid inputs (too long bio, etc.)

5. **Accessibility**
   - Target: All interactive elements have aria-labels
   - Measurement: Manual inspection, count aria-label attributes

### Qualitative Metrics

1. **Code Quality**
   - Consistent with existing component patterns
   - Proper TypeScript typing
   - Clean, readable code with comments
   - Follows project conventions

2. **User Experience**
   - Forms intuitive and easy to use
   - Clear feedback (success/error messages)
   - Image preview works smoothly
   - Character counter helpful

3. **Accessibility**
   - Keyboard navigation smooth
   - Screen readers announce correctly
   - Visual focus indicators clear
   - Color contrast meets WCAG standards

4. **Design Consistency**
   - Styling matches existing pages
   - Component patterns follow conventions
   - Translation usage matches other components

---

## Notes and Context

### Design Rationale

1. **Why Create Profile Page Now?**
   - Foundation for user identity features
   - Demonstrates translation patterns
   - Users expect profile management
   - Completes settings/account section

2. **Why Separate Display and Edit Sections?**
   - Clear separation of concerns
   - Better UX (read vs. edit modes)
   - Easier to test and maintain
   - Common pattern in profile UIs

3. **Why UI-Only (No Backend)?**
   - Focus of Epic 2 is internationalization
   - Faster implementation without backend complexity
   - Backend can be added incrementally
   - Demonstrates translation patterns clearly

4. **Why Add Bio Field to Type Without Database?**
   - Type safety for future feature
   - Allows UI development to proceed
   - Minimal change (optional field)
   - Documents future intent

### Historical Context

- **Epic 1 (L10N Foundation):** Established next-intl setup
- **Sub-Epics 2A-2F:** Translated 260+ components
- **Task 2G.1 (REQ-E02-013):** Created `settings` namespace with 150 keys
- **Task 2G.2 (REQ-E02-014):** Created account settings page
- **Current Task (2G.3):** Profile page implementation

### Future Considerations

1. **Backend Integration**
   - Profile update API: `/api/user/profile` (PUT)
   - Photo upload API: `/api/user/profile/photo` (POST)
   - Database fields to add: `bio`, `profile_picture_url`
   - Consider rate limiting for photo uploads

2. **Enhanced Features**
   - OAuth profile sync (pull name/photo from Google)
   - Profile photo cropping UI (react-image-crop)
   - Profile completeness indicator (% complete)
   - Profile preview (how others see you)

3. **Storage Implementation**
   - Supabase Storage for profile photos
   - Image optimization (resize to 256x256, 512x512)
   - CDN integration for fast delivery
   - Automatic cleanup of old photos

4. **Privacy Features**
   - Profile visibility settings (public/private/contacts)
   - Control what information is visible
   - Profile indexing options (searchable/not searchable)

### Related Documentation

- **Implementation Plan:** docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md (lines 1099-1171)
- **Sub-Epic 2G Overview:** REQ-E02-013 (Task 2G.1)
- **Account Settings:** REQ-E02-014 (Task 2G.2)
- **Translation Files:** `/messages/*.json`
- **User Type:** `/src/types/index.ts`
- **User Layout:** `/src/app/user/layout.tsx`

---

## Appendix

### A. Complete `settings.profile` Namespace Keys

From `/messages/en.json` lines 3420-3438:

```typescript
{
  "settings": {
    "profile": {
      "title": string,                        // "Profile"
      "subtitle": string,                     // "Manage your public profile information"
      "displayName": string,                  // "Display Name"
      "displayNamePlaceholder": string,       // "Enter your name"
      "displayNameAriaLabel": string,         // "Display name input field"
      "bio": string,                          // "Bio"
      "bioPlaceholder": string,               // "Tell us about yourself"
      "bioMaxLength": string,                 // "Bio must be 500 characters or less"
      "avatar": string,                       // "Profile Photo"
      "uploadAvatar": string,                 // "Upload Photo"
      "uploadAvatarAriaLabel": string,        // "Upload profile photo"
      "removeAvatar": string,                 // "Remove Photo"
      "removeAvatarAriaLabel": string,        // "Remove profile photo"
      "avatarUpdated": string,                // "Profile photo updated"
      "avatarRemoved": string,                // "Profile photo removed"
      "saveChanges": string,                  // "Save Changes"
      "savingChanges": string,                // "Saving..."
      "profileUpdated": string                // "Profile updated successfully"
    }
  }
}
```

**Total:** 15 keys

### B. User Type with Bio Field

**Updated Type (Target State):**

```typescript
export interface User {
  id: string;
  email: string;
  fullName?: string;
  full_name: string | null;
  role: string | null;
  is_admin?: boolean | null;
  profilePicture?: string;
  bio?: string | null; // NEW: Future feature
  authProvider?: string;
  created_at: string | null;
  updated_at: string | null;
  createdAt?: string;
  updatedAt?: string;
}
```

### C. Image Upload Validation

**File Type Validation:**
```tsx
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

const validateImageFile = (file: File): string | null => {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Please select a valid image file (JPG, PNG, GIF, or WebP)';
  }

  // 5MB limit
  const MAX_SIZE = 5 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    return 'Image size must be less than 5MB';
  }

  return null;
};
```

### D. Profile Photo Placeholder Component

**Simple Placeholder:**
```tsx
function ProfilePhotoPlaceholder({ email }: { email?: string }) {
  const initial = email?.[0]?.toUpperCase() || '?';

  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600 text-white text-4xl font-bold">
      {initial}
    </div>
  );
}
```

### E. Future Database Schema

**Proposed Migration (Future):**

```sql
-- Add bio and profile_picture_url to admin_users table
ALTER TABLE admin_users
ADD COLUMN bio TEXT,
ADD COLUMN profile_picture_url TEXT;

-- Add index for profile picture lookups
CREATE INDEX idx_admin_users_profile_picture ON admin_users(profile_picture_url);
```

---

**End of Document**

---

*Document generated: 2026-01-22 21:26*
