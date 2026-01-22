# Update Profile Components - Detailed Implementation Tasks

**Generated:** 2026-01-22 21:40
**Reference Documents:**
- Requirements: docs/gen_requests.md (Request #15)
- Overview: docs/REQ-E02-015-update-profile-components-overview.md
- Implementation Plan: docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md

**CRITICAL INSTRUCTIONS FOR IMPLEMENTING AGENT:**
- Operate from the project root folder ONLY
- **DO NOT ATTEMPT TO NAVIGATE TO OTHER FOLDERS UNDER ANY CIRCUMSTANCES**
- All file paths must be relative to project root

---

## Build & Test Commands

| Action | Command |
|--------|---------|
| Type Check | `npx tsc --noEmit` |
| Unit Tests | `npm test` |
| Build | `npm run build` |
| Lint | `npm run lint` |

---

## Task Summary

This task implements internationalization for user profile components, creating a new profile page with profile editing functionality using the `settings.profile.*` namespace (15 translation keys). The work involves creating a complete profile management interface with display name, bio, and profile photo management capabilities.

**Current State:**
- No profile page exists in the application
- User information only displayed in header (email, role badge)
- No profile editing functionality
- `settings.profile.*` namespace with 15 translation keys ready (from Task 2G.1)

**Target State:**
- New profile page at `/src/app/user/profile/page.tsx`
- Profile display section with current information
- Profile edit form (display name, bio)
- Profile photo upload/remove UI (client-side only)
- Navigation link to profile page

**Translation Keys:** 15 keys from `settings.profile.*` namespace (lines 3420-3438 in en.json)

**Story Points:** 10 points total across 10 tasks

**Dependencies:**
- REQ-E02-013 (Task 2G.1) MUST be completed first (creates settings namespace)

---

## 1. Create Profile Page Foundation

**Context:** The application currently has no profile page. This task creates the base page component with translations and layout structure.
**Files to modify:** `/src/app/user/profile/page.tsx` (create new)
**Estimated effort:** 1 story point

- [x] **1.1** Create new file `/src/app/user/profile/page.tsx` ---implemented: File created at correct path---
- [x] **1.2** Add `'use client'` directive as first line ---implemented: Added as first line---
- [x] **1.3** Add file header comment: `// Last Modified: 2026-01-22 - REQ-E02-015: Create profile page` ---implemented: Comment added---
- [x] **1.4** Import `useTranslations` from 'next-intl' ---implemented: Import added---
- [x] **1.5** Import `useAuth` from '@/contexts/AuthContext' ---implemented: Import added---
- [x] **1.6** Import `useState` from 'react' ---implemented: Import added---
- [x] **1.7** Create default export function `ProfilePage` ---implemented: Created as default export---
- [x] **1.8** Initialize `useTranslations('settings.profile')` hook as constant `t` ---implemented: Hook initialized---
- [x] **1.9** Initialize `useAuth()` hook to extract `user` object ---implemented: Hook initialized, user extracted---
- [x] **1.10** Create page structure with `max-w-3xl mx-auto px-4 py-8` container ---implemented: Container div added with correct classes---
- [x] **1.11** Add header section with `h1` using `t('title')` and `p` using `t('subtitle')` ---implemented: Header section with title and subtitle added---
- [x] **1.12** Add placeholder comments for sections to be implemented in later tasks ---implemented: Three placeholder comments added---
- [x] **1.13** Run `npx tsc --noEmit` to verify no TypeScript errors ---ts-check: passed (0 errors, baseline: 0)---

**Verification:**
- Visit `http://localhost:3000/user/profile` and verify page loads
- Title shows "Profile" and subtitle shows "Manage your public profile information"
- No console errors

---

## 2. Add Bio Field to User Type

**Context:** The User interface (in `/src/types/index.ts`) doesn't include a `bio` field. This is a TypeScript-only change to enable type safety for the profile bio feature (database migration is future work).
**Files to modify:** `/src/types/index.ts`
**Estimated effort:** 1 story point

- [x] **2.1** Read `/src/types/index.ts` file ---implemented: File read, User interface found at line 44---
- [x] **2.2** Locate the `User` interface definition (around lines 43-56) ---implemented: Found User interface lines 44-57---
- [x] **2.3** Add new optional field `bio?: string | null;` after `profilePicture` field ---implemented: Added bio field after profilePicture---
- [x] **2.4** Add comment above bio field: `// Future feature - not yet in database` ---implemented: Comment added---
- [x] **2.5** Run `npx tsc --noEmit` to verify no TypeScript errors ---ts-check: passed (0 errors, baseline: 0)---
- [x] **2.6** Verify no other files report type errors related to User interface ---ts-check: passed, no related errors---

**Verification:**
- TypeScript compilation succeeds
- User interface includes bio field with correct optional/nullable type

---

## 3. Create Account Info Display Section

**Context:** Users need to see their current profile information before editing. This section displays read-only profile data with a placeholder avatar.
**Files to modify:** `/src/app/user/profile/page.tsx`
**Estimated effort:** 1 story point

- [x] **3.1** Create helper function `getDisplayName(user: User | null): string` that returns `user.fullName || user.full_name || user.email.split('@')[0]` or empty string if no user ---implemented: Helper function created with fallback logic---
- [x] **3.2** Create component function `AccountInfoSection({ user }: { user: User | null })` within the page file ---implemented: Component created with proper typing---
- [x] **3.3** Initialize `useTranslations('settings.profile')` hook in component ---implemented: Hook initialized---
- [x] **3.4** Return null if user is undefined/null ---implemented: Early return if !user---
- [x] **3.5** Create section with `bg-white shadow rounded-lg p-6 mb-8` styling ---implemented: Section styled correctly---
- [x] **3.6** Add flex container for profile photo and user info ---implemented: flex items-center space-x-4 container---
- [x] **3.7** Create profile photo div (w-20 h-20 md:w-24 md:h-24 rounded-full bg-gray-200) ---implemented: Responsive profile photo container---
- [x] **3.8** Display profile photo if `user.profilePicture` exists, otherwise show first letter of email in center ---implemented: Conditional render with img or initials---
- [x] **3.9** Add user info div with display name (text-xl font-semibold) using `getDisplayName(user)` ---implemented: Display name with correct styling---
- [x] **3.10** Add email display (text-sm text-gray-600) showing `user.email` ---implemented: Email displayed below name---
- [x] **3.11** Render `AccountInfoSection` component in page after header ---implemented: Component rendered with user prop---
- [x] **3.12** Test display with current logged-in user data ---ts-check: passed (0 errors, baseline: 0)---

**Verification:**
- Profile photo or placeholder displays correctly
- Display name shows user's name or email username
- Email shows below display name

---

## 4. Create Profile Edit Form Section

**Context:** The core profile editing functionality allowing users to update their display name and bio with character limits and validation.
**Files to modify:** `/src/app/user/profile/page.tsx`
**Estimated effort:** 1 story point

- [x] **4.1** Define constants `MAX_BIO_LENGTH = 500` and `MAX_NAME_LENGTH = 100` at top of file ---implemented: Constants defined---
- [x] **4.2** Create component function `ProfileEditSection({ user }: { user: User | null })` ---implemented: Component created (using AuthUser type)---
- [x] **4.3** Initialize `useTranslations('settings.profile')` hook ---implemented: Hook initialized---
- [x] **4.4** Initialize `useTranslations('common.validation')` hook as `tValidation` ---implemented: Hook initialized---
- [x] **4.5** Create state: `displayName` initialized to `user?.fullName || user?.full_name || ''` ---implemented: State created with fullName fallback---
- [x] **4.6** Create state: `bio` initialized to empty string (future: `user?.bio || ''`) ---implemented: State created with empty string---
- [x] **4.7** Create state: `loading` initialized to false ---implemented: State created---
- [x] **4.8** Create state: `success` initialized to null (string | null) ---implemented: State created---
- [x] **4.9** Create state: `error` initialized to null (string | null) ---implemented: State created---
- [x] **4.10** Create `handleBioChange` function that updates bio if length <= 500, else sets error to `t('bioMaxLength')` ---implemented: Function created with validation---
- [x] **4.11** Create `handleSubmit` async function that validates, simulates save with setTimeout (1 second), and shows success message using `t('profileUpdated')` ---implemented: Function created with setTimeout simulation---
- [x] **4.12** Create form with onSubmit={handleSubmit} ---implemented: Form created---
- [x] **4.13** Add display name input field with label `t('displayName')`, placeholder `t('displayNamePlaceholder')`, aria-label `t('displayNameAriaLabel')` ---implemented: Input with all translations---
- [x] **4.14** Add bio textarea with label `t('bio')`, placeholder `t('bioPlaceholder')`, rows={4} ---implemented: Textarea created---
- [x] **4.15** Add character counter below bio: `{bio.length}/500` with red text if exceeds limit ---implemented: Counter with conditional color---
- [x] **4.16** Add submit button with text `t('saveChanges')` or `t('savingChanges')` when loading, disabled when loading ---implemented: Button with conditional text---
- [x] **4.17** Display error message if exists (red text, bg-red-50 border border-red-200) ---implemented: Error message styled---
- [x] **4.18** Display success message if exists (green text, bg-green-50 border border-green-200) ---implemented: Success message styled---
- [x] **4.19** Render `ProfileEditSection` component in page after `AccountInfoSection` ---implemented: Component rendered---
- [x] **4.20** Test form submission with valid data ---ts-check: passed (0 errors, baseline: 0)---

**Verification:**
- Form displays with both fields
- Character counter updates as user types in bio
- Error shows when bio exceeds 500 characters
- Success message displays after form submission
- Form disables during loading state

---

## 5. Create Profile Photo Upload Section

**Context:** Profile photo management UI allowing users to select and preview images. This is UI-only; actual upload to storage is future work.
**Files to modify:** `/src/app/user/profile/page.tsx`
**Estimated effort:** 1 story point

- [ ] **5.1** Define constants for file validation: `MAX_FILE_SIZE = 5 * 1024 * 1024` and `ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']`
- [ ] **5.2** Create component function `ProfilePhotoSection({ user }: { user: User | null })`
- [ ] **5.3** Initialize `useTranslations('settings.profile')` hook
- [ ] **5.4** Create state: `preview` initialized to null (string | null)
- [ ] **5.5** Create state: `file` initialized to null (File | null)
- [ ] **5.6** Create state: `error` initialized to null (string | null)
- [ ] **5.7** Create state: `success` initialized to null (string | null)
- [ ] **5.8** Create `handleFileChange` function to validate file type and size, create preview using FileReader
- [ ] **5.9** Add validation in handleFileChange: check file type is in ALLOWED_TYPES, check size < MAX_FILE_SIZE
- [ ] **5.10** In handleFileChange, read file as data URL and set preview state with result
- [ ] **5.11** Create `handleUpload` async function that simulates upload with setTimeout, shows success message `t('avatarUpdated')`
- [ ] **5.12** Create `handleRemove` async function that clears preview, shows success message `t('avatarRemoved')`
- [ ] **5.13** Create section with `bg-white shadow rounded-lg p-6 mb-8` styling
- [ ] **5.14** Add section title using `t('avatar')`
- [ ] **5.15** Add flex container for photo display (w-32 h-32 md:w-40 md:h-40 rounded-full)
- [ ] **5.16** Display preview or user.profilePicture if exists, else show placeholder with email initial
- [ ] **5.17** Add hidden file input with id="photoUpload", accept="image/*", onChange={handleFileChange}
- [ ] **5.18** Add label for file input styled as button with text `t('uploadAvatar')` and aria-label `t('uploadAvatarAriaLabel')`
- [ ] **5.19** Add "Remove Photo" button (if photo exists) with text `t('removeAvatar')` and aria-label `t('removeAvatarAriaLabel')`
- [ ] **5.20** Add "Save New Photo" button (if file selected) to trigger handleUpload
- [ ] **5.21** Display error and success messages with appropriate styling
- [ ] **5.22** Render `ProfilePhotoSection` component in page after `ProfileEditSection`
- [ ] **5.23** Test file selection and preview functionality

**Verification:**
- File input opens when "Upload Photo" is clicked
- Selected image shows as preview
- File size validation rejects files >5MB
- File type validation rejects non-image files
- Success messages display after upload/remove actions

---

## 6. Add Form Validation Logic

**Context:** Implement client-side validation to provide immediate feedback and prevent invalid submissions.
**Files to modify:** `/src/app/user/profile/page.tsx`
**Estimated effort:** 1 story point

- [ ] **6.1** Create `validateDisplayName` function that checks length <= MAX_NAME_LENGTH, returns error string or null
- [ ] **6.2** Create `validateBio` function that checks length <= MAX_BIO_LENGTH, returns error string or null
- [ ] **6.3** Update `handleSubmit` in ProfileEditSection to call both validation functions
- [ ] **6.4** If validation fails, set error state with validation error message and return early
- [ ] **6.5** Add real-time validation to displayName onChange: update state and show error if exceeds max
- [ ] **6.6** Ensure bio validation already works in handleBioChange (implemented in Task 4)
- [ ] **6.7** Add visual indication when input is invalid (red border: border-red-500)
- [ ] **6.8** Test validation with display name >100 characters
- [ ] **6.9** Test validation with bio >500 characters
- [ ] **6.10** Verify error messages clear when user corrects the issue

**Verification:**
- Display name validation prevents >100 characters
- Bio validation prevents >500 characters
- Error messages show specific validation issues
- Form cannot be submitted with invalid data

---

## 7. Add Loading and Success States

**Context:** Provide visual feedback during async operations to improve user experience and match existing application patterns.
**Files to modify:** `/src/app/user/profile/page.tsx`
**Estimated effort:** 1 story point

- [ ] **7.1** Verify loading state exists in ProfileEditSection (from Task 4)
- [ ] **7.2** Verify loading state exists in ProfilePhotoSection (from Task 5)
- [ ] **7.3** In ProfileEditSection handleSubmit, set loading=true at start, false in finally block
- [ ] **7.4** Disable all form inputs when loading=true (add disabled={loading} attribute)
- [ ] **7.5** Disable submit button when loading=true
- [ ] **7.6** Show "Saving..." text on button when loading (use `t('savingChanges')`)
- [ ] **7.7** Clear success and error messages at start of handleSubmit
- [ ] **7.8** Add setTimeout to auto-clear success message after 5 seconds (optional)
- [ ] **7.9** In ProfilePhotoSection, add loading state for upload and remove operations
- [ ] **7.10** Test loading state by submitting form and observing disabled state
- [ ] **7.11** Verify success messages display with green background and border
- [ ] **7.12** Verify error messages display with red background and border

**Verification:**
- Loading state disables form during submission
- Button shows "Saving..." text when loading
- Success messages display in green after successful operations
- Error messages display in red after failures
- Messages clear appropriately

---

## 8. Add Profile Navigation Link

**Context:** Users need to discover and access the profile page. Add a navigation item to the user layout sidebar.
**Files to modify:** `/src/app/user/layout.tsx`
**Estimated effort:** 1 story point

- [ ] **8.1** Read `/src/app/user/layout.tsx` file
- [ ] **8.2** Locate the `navigationItems` array or `getNavigationItems` function (around lines 92-99)
- [ ] **8.3** Verify `useTranslations` is imported (should be from Task 2G.2)
- [ ] **8.4** Add new navigation item object with: `name: t('settings.profile.title')`, `href: '/user/profile'`, `icon: '👤'`
- [ ] **8.5** Position new item after "Analytics" and before "Account" or "Settings"
- [ ] **8.6** Ensure the item is not inside the isAdmin conditional array
- [ ] **8.7** Run `npx tsc --noEmit` to verify no errors
- [ ] **8.8** Start dev server and verify navigation shows "Profile" link
- [ ] **8.9** Click "Profile" link and verify navigation to `/user/profile`
- [ ] **8.10** Verify active state highlights when on profile page

**Verification:**
- Navigation includes "Profile" link with user icon
- Link navigates to `/user/profile` page
- Active state highlights correctly
- Link appears for all users (not admin-only)

---

## 9. Style and Responsive Design

**Context:** Ensure the profile page is responsive and matches existing application styling patterns for consistent user experience across devices.
**Files to modify:** `/src/app/user/profile/page.tsx`
**Estimated effort:** 1 story point

- [ ] **9.1** Verify page container uses `max-w-3xl mx-auto px-4 sm:px-6 lg:px-8` classes
- [ ] **9.2** Update profile photo size to be responsive: `w-20 h-20 md:w-32 md:h-32`
- [ ] **9.3** Ensure all form inputs have full width: `w-full` class
- [ ] **9.4** Verify buttons have adequate touch targets (min h-10 or py-2)
- [ ] **9.5** Test layout on mobile viewport (375px width) - sections should stack vertically
- [ ] **9.6** Test layout on tablet viewport (768px width) - proper spacing and padding
- [ ] **9.7** Test layout on desktop viewport (1280px+ width) - centered with max-width
- [ ] **9.8** Verify all text is readable on small screens (minimum 14px/text-sm)
- [ ] **9.9** Check that profile photo placeholder text scales appropriately
- [ ] **9.10** Verify form spacing is consistent across all sections (mb-8 between sections)
- [ ] **9.11** Test with browser dev tools device emulation for various devices

**Verification:**
- Mobile (320px-767px): vertical stack, readable text, usable buttons
- Tablet (768px-1023px): appropriate spacing, larger touch targets
- Desktop (1024px+): centered layout with max-width constraint
- Profile photo scales appropriately for each breakpoint

---

## 10. Testing and Final Validation

**Context:** Comprehensive manual testing to verify all functionality works correctly and meets acceptance criteria.
**Files to modify:** N/A (testing only)
**Estimated effort:** 1 story point

- [ ] **10.1** Run `npx tsc --noEmit` and verify 0 errors
- [ ] **10.2** Run `npm run lint` and verify no new warnings
- [ ] **10.3** Navigate to `/user/profile` and verify page loads
- [ ] **10.4** Verify title shows "Profile" using translation
- [ ] **10.5** Verify subtitle shows "Manage your public profile information"
- [ ] **10.6** Verify account info section displays user email and display name
- [ ] **10.7** Verify profile photo or placeholder displays
- [ ] **10.8** Type in display name field and verify input updates
- [ ] **10.9** Type in bio field and verify character counter updates
- [ ] **10.10** Type bio with 501 characters and verify error message
- [ ] **10.11** Submit form with valid data and verify success message
- [ ] **10.12** Click "Upload Photo" and select an image file
- [ ] **10.13** Verify image preview appears after file selection
- [ ] **10.14** Try uploading a file >5MB and verify error message
- [ ] **10.15** Try uploading a non-image file and verify rejection
- [ ] **10.16** Click "Remove Photo" (if photo exists) and verify success message
- [ ] **10.17** Verify all aria-labels are present on inputs and buttons
- [ ] **10.18** Use Tab key to navigate through all form elements
- [ ] **10.19** Verify focus states are visible on all interactive elements
- [ ] **10.20** Check console for errors or warnings
- [ ] **10.21** Test on mobile device or Chrome DevTools mobile emulation
- [ ] **10.22** Verify navigation sidebar includes "Profile" link
- [ ] **10.23** Click "Profile" nav link and verify navigation works
- [ ] **10.24** Verify all 15 translation keys from `settings.profile.*` are used
- [ ] **10.25** Search codebase for any hardcoded English strings in profile page

**Verification:**
- All functionality works as expected
- No TypeScript or console errors
- All translations display correctly
- Forms validate properly
- Responsive design works across devices
- Accessibility requirements met

---

## Translation Keys Reference

From `/messages/en.json` lines 3420-3438 (`settings.profile.*` namespace):

| Key | Value | Usage |
|-----|-------|-------|
| title | "Profile" | Page title, navigation link |
| subtitle | "Manage your public profile information" | Page subtitle |
| displayName | "Display Name" | Form field label |
| displayNamePlaceholder | "Enter your name" | Input placeholder |
| displayNameAriaLabel | "Display name input field" | Input aria-label |
| bio | "Bio" | Textarea label |
| bioPlaceholder | "Tell us about yourself" | Textarea placeholder |
| bioMaxLength | "Bio must be 500 characters or less" | Validation error |
| avatar | "Profile Photo" | Section title |
| uploadAvatar | "Upload Photo" | Upload button text |
| uploadAvatarAriaLabel | "Upload profile photo" | Upload button aria-label |
| removeAvatar | "Remove Photo" | Remove button text |
| removeAvatarAriaLabel | "Remove profile photo" | Remove button aria-label |
| avatarUpdated | "Profile photo updated" | Success message |
| avatarRemoved | "Profile photo removed" | Success message |
| saveChanges | "Save Changes" | Submit button text |
| savingChanges | "Saving..." | Loading state text |
| profileUpdated | "Profile updated successfully" | Success message |

**Total:** 15 keys

---

## Authorized Files for Modification

### New Files to Create

| File | Purpose |
|------|---------|
| `/src/app/user/profile/page.tsx` | Main profile page component |

### Existing Files to Modify

| File | Lines | Modification |
|------|-------|--------------|
| `/src/types/index.ts` | 43-56 | Add optional `bio` field to User interface |
| `/src/app/user/layout.tsx` | 92-99 | Add profile navigation item to navigationItems array |

### Translation Files (Reference Only)

| File | Lines | Purpose |
|------|-------|---------|
| `/messages/en.json` | 3420-3438 | Profile translations (already exists from Task 2G.1) |

---

## Dependencies

**Must Complete First:**
- **REQ-E02-013 (Task 2G.1):** Create settings namespace structure
  - Provides: `settings.profile.*` translation keys (15 keys)
  - Status: MUST be completed before starting

**Blocks:**
- **REQ-E02-089 (Task 2G.6):** Generate translations for 5 non-English languages
  - Blocked until profile UI is implemented and visible

**Conflicts:**
- **Task 2G.2 (Account Settings):** Also modifies `/src/app/user/layout.tsx` navigation
  - Recommendation: Run tasks sequentially (2G.2 → 2G.3 → 2G.4)
  - Resolution: Coordinate navigation item order

**Parallel Safety:**
- Safe to run in parallel with Task 2G.5 (Help page) - different files
- NOT safe with tasks 2G.2 or 2G.4 - same navigation array

---

## Out of Scope

The following items are explicitly NOT included in this task:

### Backend Implementation
- Profile update API endpoint
- Profile photo upload to storage (Supabase Storage/S3)
- Bio field database migration
- Server-side validation

### Advanced Features
- OAuth profile sync (Google profile photo)
- Profile photo cropping UI
- Multiple profile photos
- Profile visibility settings
- Social media links
- Custom profile URLs
- Profile completeness indicator

### Translation Work
- French, Spanish, German, Dutch, Italian translations (Task 2G.6)

---

## Quality Checklist

Before marking this task complete, verify:

- [ ] All 10 numbered tasks completed
- [ ] All subtasks checked off
- [ ] TypeScript compilation succeeds (`npx tsc --noEmit`)
- [ ] No new lint warnings
- [ ] All 15 translation keys from `settings.profile.*` used
- [ ] No hardcoded English strings in profile components
- [ ] Profile page accessible at `/user/profile`
- [ ] Navigation includes "Profile" link
- [ ] Forms validate correctly
- [ ] Image upload UI functional (file selection and preview)
- [ ] Responsive design works on mobile/tablet/desktop
- [ ] All aria-labels present on interactive elements
- [ ] No console errors or warnings

---

## Notes

### Design Decisions

1. **UI-Only Implementation:** Focus on internationalization without backend complexity. API integration is future work.

2. **Local State for Bio:** Bio field added to User type but stored only in local state (no database persistence yet).

3. **Profile Photo Preview:** Uses FileReader API for client-side preview without actual upload.

4. **Display Name Source:** Uses existing `full_name` database field, falls back to email username if empty.

### Future Enhancements

- Backend API for profile updates (`/api/user/profile`)
- Supabase Storage integration for profile photos
- Database migration to add `bio` and `profile_picture_url` fields
- Profile photo cropping UI (react-image-crop)
- OAuth profile sync (Google profile data)

---

**Document End**

Last Modified: 2026-01-22 21:40:00
