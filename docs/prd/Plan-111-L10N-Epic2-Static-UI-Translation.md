# Implementation Plan: Localization Epic 2 - Static UI Translation

**Generated:** 2026-01-17 22:45:00 UTC
**Last Modified:** 2026-01-17 22:45:00 UTC
**PRD Reference:** PRD_L10N_Epic2_Static_UI_Translation.md
**Epic Size:** XXL (Extra Extra Large)
**Priority:** P1 - High
**Depends On:** Epic 1 (Plan-110-L10N-Epic1-Foundation.md)

---

## Overview

This implementation plan covers the extraction of approximately 3,200+ hardcoded UI strings from 275+ React components and translating them to all 6 supported languages (English, French, Spanish, German, Dutch, Italian). The plan is organized into 10 sub-epics corresponding to feature areas, with the largest efforts in Item Creation Workflow (~500 strings) and Common Components (~800 strings). This epic assumes Epic 1's i18n foundation (next-intl) is complete and the translation infrastructure is operational.

**Total Scope:**
- Components to Update: 275+
- Estimated Unique Strings: ~3,200
- Languages: 6 (en, fr, es, de, nl, it)
- Total Translation Entries: ~19,200

---

## Technical Context

### Existing Stack

| Technology | Details |
|------------|---------|
| **Framework** | Next.js 15.5.9 with App Router |
| **Language** | TypeScript 5.x (strict mode) |
| **Styling** | Tailwind CSS 4.x |
| **State Management** | React Context + useReducer (AuthContext, PropertyContext patterns) |
| **UI Components** | Radix UI primitives, Heroicons, Lucide React |
| **Authentication** | Supabase Auth with AuthContext |
| **Build Tool** | Next.js with Turbopack |
| **i18n Framework** | next-intl (to be installed in Epic 1) |

### Dependencies from Epic 1

This epic requires the following from Epic 1 to be complete:

| Dependency | Location | Purpose |
|------------|----------|---------|
| next-intl package | `package.json` | i18n framework |
| i18n config | `/src/lib/i18n/config.ts` | Locale configuration |
| IntlProvider | `/src/app/layout.tsx` | Provider wrapper |
| Translation files | `/messages/*.json` | Translation storage |
| useTranslations hook | next-intl | Client component translations |
| getTranslations | next-intl/server | Server component translations |

### New Dependencies Required

None - all dependencies are provided by Epic 1.

---

## Architecture

### Translation File Structure

After Epic 2 completion, the `/messages/` folder will have this structure:

```
/messages
├── en.json              # English (source of truth) - ~3,200 keys
├── fr.json              # French
├── es.json              # Spanish
├── de.json              # German
├── nl.json              # Dutch
└── it.json              # Italian
```

### Namespace Organization

```json
{
  "_meta": {
    "language": "en",
    "version": "2.0.0",
    "lastUpdated": "2026-01-XX"
  },
  "common": { },          // Sub-Epic 2H: ~800 strings
  "auth": { },            // Sub-Epic 2A: ~150 strings
  "dashboard": { },       // Sub-Epic 2B: ~200 strings
  "items": { },           // Sub-Epic 2D: ~400 strings
  "workflow": { },        // Sub-Epic 2C: ~500 strings
  "articles": { },        // Sub-Epic 2E: ~300 strings
  "properties": { },      // Sub-Epic 2F: ~200 strings
  "settings": { },        // Sub-Epic 2G: ~150 strings
  "errors": { },          // Sub-Epic 2J: ~300 strings
  "emails": { }           // Sub-Epic 2I: ~200 strings
}
```

### Translation Key Convention

```
{namespace}.{component/area}.{element}.{variant?}
```

Examples:
```json
{
  "auth.login.title": "Sign in to your account",
  "auth.login.button.submit": "Sign In",
  "auth.login.error.invalidCredentials": "Invalid email or password",
  "common.actions.save": "Save",
  "common.actions.cancel": "Cancel",
  "workflow.step.roomSelection.title": "Select a Room",
  "items.list.empty.title": "No items yet",
  "errors.validation.required": "This field is required"
}
```

---

## Integration Contract

### Component Update Pattern - Client Components

```typescript
// Before (hardcoded strings)
function LoginButton() {
  return <button>Sign In</button>;
}

// After (translated)
import { useTranslations } from 'next-intl';

function LoginButton() {
  const t = useTranslations('auth.login');
  return <button>{t('button.submit')}</button>;
}
```

### Component Update Pattern - Server Components

```typescript
// Before
async function DashboardHeader() {
  return <h1>Dashboard</h1>;
}

// After
import { getTranslations } from 'next-intl/server';

async function DashboardHeader() {
  const t = await getTranslations('dashboard');
  return <h1>{t('title')}</h1>;
}
```

### Attribute Translations

```tsx
// Translate all user-visible attributes
<input
  placeholder={t('form.email.placeholder')}
  aria-label={t('form.email.ariaLabel')}
  title={t('form.email.tooltip')}
/>
```

### Pluralization Pattern (ICU Format)

```json
{
  "items.count": "{count, plural, =0 {No items} one {# item} other {# items}}"
}
```

```tsx
t('items.count', { count: itemCount })
```

### Variable Interpolation

```json
{
  "items.deleteConfirm": "Are you sure you want to delete \"{itemName}\"?"
}
```

```tsx
t('items.deleteConfirm', { itemName: item.name })
```

---

## Implementation Approach

### Recommended Order

Execute sub-epics in this order to maximize reuse and minimize rework:

1. **Sub-Epic 2H: Common & Shared** - Foundation for all other sub-epics
2. **Sub-Epic 2J: Error Messages & Validation** - Cross-cutting concern
3. **Sub-Epic 2A: Authentication & Registration** - Entry point
4. **Sub-Epic 2B: Dashboard & Navigation** - Core navigation
5. **Sub-Epic 2G: Settings & Account** - Lower complexity
6. **Sub-Epic 2F: Property Management** - Moderate complexity
7. **Sub-Epic 2D: Item Management** - High usage area
8. **Sub-Epic 2E: Article & Content** - Content management
9. **Sub-Epic 2C: Item Creation Workflow** - Largest component set
10. **Sub-Epic 2I: Email Templates** - Different translation mechanism

---

## Sub-Epic 2H: Common & Shared Components

**Estimated Strings:** ~800
**Priority:** FIRST - Foundation for all other sub-epics
**Estimated Effort:** 3-4 days

### Components to Update

| Component | Location | Estimated Strings |
|-----------|----------|-------------------|
| Buttons (global patterns) | Various | ~50 |
| Modals/Dialogs | Various | ~100 |
| Form elements | Various | ~150 |
| Toast notifications | Various | ~50 |
| Empty states | Various | ~80 |
| Loading states | Various | ~30 |
| Error boundaries | Various | ~40 |
| Confirmation dialogs | Various | ~60 |
| Date/Time formatting | Various | ~30 |
| Pagination | Various | ~20 |
| Status indicators | Various | ~40 |
| Navigation labels | Various | ~50 |
| Tooltips | Various | ~100 |

### Translation Namespace: `common`

```json
{
  "common": {
    "actions": {
      "save": "Save",
      "cancel": "Cancel",
      "delete": "Delete",
      "edit": "Edit",
      "create": "Create",
      "submit": "Submit",
      "close": "Close",
      "back": "Back",
      "next": "Next",
      "confirm": "Confirm",
      "done": "Done",
      "continue": "Continue",
      "retry": "Retry",
      "refresh": "Refresh",
      "loading": "Loading...",
      "search": "Search",
      "filter": "Filter",
      "sort": "Sort",
      "clear": "Clear",
      "reset": "Reset",
      "apply": "Apply",
      "view": "View",
      "viewAll": "View All",
      "showMore": "Show More",
      "showLess": "Show Less",
      "selectAll": "Select All",
      "deselectAll": "Deselect All"
    },
    "status": {
      "loading": "Loading...",
      "saving": "Saving...",
      "deleting": "Deleting...",
      "success": "Success",
      "error": "Error",
      "pending": "Pending",
      "completed": "Completed",
      "failed": "Failed",
      "active": "Active",
      "inactive": "Inactive",
      "enabled": "Enabled",
      "disabled": "Disabled"
    },
    "confirmation": {
      "title": "Confirm Action",
      "deleteTitle": "Confirm Delete",
      "deleteMessage": "Are you sure you want to delete this? This action cannot be undone.",
      "unsavedChanges": "You have unsaved changes. Are you sure you want to leave?",
      "yes": "Yes",
      "no": "No"
    },
    "empty": {
      "noData": "No data available",
      "noResults": "No results found",
      "tryAgain": "Try again with different filters"
    },
    "time": {
      "justNow": "Just now",
      "minutesAgo": "{count} {count, plural, one {minute} other {minutes}} ago",
      "hoursAgo": "{count} {count, plural, one {hour} other {hours}} ago",
      "daysAgo": "{count} {count, plural, one {day} other {days}} ago",
      "today": "Today",
      "yesterday": "Yesterday"
    },
    "pagination": {
      "previous": "Previous",
      "next": "Next",
      "page": "Page {current} of {total}",
      "showing": "Showing {start} to {end} of {total}"
    },
    "validation": {
      "required": "This field is required",
      "invalidEmail": "Please enter a valid email address",
      "tooShort": "Must be at least {min} characters",
      "tooLong": "Must be less than {max} characters"
    }
  }
}
```

### Tasks

- [ ] **Task 2H.1:** Create `common` namespace structure in `/messages/en.json`
- [ ] **Task 2H.2:** Extract button labels across all components
- [ ] **Task 2H.3:** Extract modal/dialog strings
- [ ] **Task 2H.4:** Extract form element strings (labels, placeholders, hints)
- [ ] **Task 2H.5:** Extract toast notification messages
- [ ] **Task 2H.6:** Extract empty state messages
- [ ] **Task 2H.7:** Extract loading state messages
- [ ] **Task 2H.8:** Extract confirmation dialog messages
- [ ] **Task 2H.9:** Create date/time formatting translations
- [ ] **Task 2H.10:** Generate translations for all 5 non-English languages
- [ ] **Task 2H.11:** Create `useCommonTranslations` convenience hook (optional)

### Files to Modify (Sample)

| File | String Count (Est.) |
|------|---------------------|
| `/src/components/ConfirmationModal.tsx` | ~15 |
| `/src/components/SimpleDashboard/EmptyStateCard.tsx` | ~10 |
| `/src/components/SimpleDashboard/LoadingIndicator.tsx` | ~5 |
| `/src/components/ItemManager/components/shared/LoadingState.tsx` | ~5 |
| `/src/components/ItemManager/components/shared/EmptyState.tsx` | ~10 |
| `/src/components/ItemManager/components/dialogs/ConfirmDeleteDialog.tsx` | ~15 |

---

## Sub-Epic 2J: Error Messages & Validation

**Estimated Strings:** ~300
**Priority:** Second - Cross-cutting concern
**Estimated Effort:** 2-3 days

### Categories

1. **Form Validation Messages** (~100 strings)
2. **API Error Messages** (~80 strings)
3. **Network Error Messages** (~30 strings)
4. **Permission Error Messages** (~40 strings)
5. **Business Logic Errors** (~50 strings)

### Translation Namespace: `errors`

```json
{
  "errors": {
    "form": {
      "required": "This field is required",
      "email": "Please enter a valid email address",
      "password": {
        "required": "Password is required",
        "tooShort": "Password must be at least {min} characters",
        "tooWeak": "Password must include uppercase, lowercase, and numbers",
        "mismatch": "Passwords do not match"
      },
      "maxLength": "Maximum {max} characters allowed",
      "minLength": "Minimum {min} characters required",
      "invalidFormat": "Invalid format",
      "invalidUrl": "Please enter a valid URL",
      "invalidPhone": "Please enter a valid phone number"
    },
    "api": {
      "generic": "Something went wrong. Please try again.",
      "notFound": "The requested resource was not found",
      "unauthorized": "You are not authorized to perform this action",
      "forbidden": "Access denied",
      "conflict": "This resource already exists",
      "serverError": "Server error. Please try again later.",
      "timeout": "Request timed out. Please try again."
    },
    "network": {
      "offline": "You appear to be offline. Please check your connection.",
      "connectionFailed": "Unable to connect to the server",
      "slowConnection": "Connection is slow. This may take a moment."
    },
    "auth": {
      "invalidCredentials": "Invalid email or password",
      "emailNotVerified": "Please verify your email address",
      "sessionExpired": "Your session has expired. Please sign in again.",
      "accountLocked": "Account has been locked. Contact support.",
      "accessDenied": "Access denied to this resource"
    },
    "item": {
      "notFound": "Item not found",
      "createFailed": "Failed to create item",
      "updateFailed": "Failed to update item",
      "deleteFailed": "Failed to delete item",
      "duplicateName": "An item with this name already exists"
    },
    "property": {
      "notFound": "Property not found",
      "createFailed": "Failed to create property",
      "updateFailed": "Failed to update property",
      "deleteFailed": "Failed to delete property"
    },
    "file": {
      "tooLarge": "File size exceeds {max}MB limit",
      "invalidType": "Invalid file type. Allowed: {types}",
      "uploadFailed": "File upload failed. Please try again."
    }
  }
}
```

### Tasks

- [ ] **Task 2J.1:** Create `errors` namespace structure
- [ ] **Task 2J.2:** Audit all form validation messages across components
- [ ] **Task 2J.3:** Audit all API error handling and messages
- [ ] **Task 2J.4:** Create centralized error message utility
- [ ] **Task 2J.5:** Update Zod schemas to use translated messages
- [ ] **Task 2J.6:** Update error boundaries with translations
- [ ] **Task 2J.7:** Generate translations for 5 non-English languages

### Centralized Error Translation Utility

```typescript
// /src/lib/i18n/error-translations.ts
import { useTranslations } from 'next-intl';

export function useErrorTranslations() {
  const t = useTranslations('errors');

  return {
    getFormError: (key: string, params?: Record<string, unknown>) =>
      t(`form.${key}`, params),
    getApiError: (key: string) => t(`api.${key}`),
    getNetworkError: (key: string) => t(`network.${key}`),
  };
}
```

---

## Sub-Epic 2A: Authentication & Registration

**Estimated Strings:** ~150
**Priority:** Third - Entry point to application
**Estimated Effort:** 1-2 days

### Components to Update

| Component | Location | Estimated Strings |
|-----------|----------|-------------------|
| LoginPageContent | `/src/app/login/LoginPageContent.tsx` | ~40 |
| LoginForm | `/src/components/LoginForm.tsx` | ~30 |
| RegistrationForm | `/src/components/RegistrationForm.tsx` | ~50 |
| GoogleOAuthButton | `/src/components/GoogleOAuthButton.tsx` | ~10 |
| Register page | `/src/app/register/page.tsx` | ~15 |
| Auth callback | `/src/app/auth/callback/page.tsx` | ~5 |

### Translation Namespace: `auth`

```json
{
  "auth": {
    "login": {
      "title": "Sign in to your account",
      "subtitle": "Access the FAQBNB administration panel",
      "emailLabel": "Email address",
      "emailPlaceholder": "Enter your email",
      "passwordLabel": "Password",
      "passwordPlaceholder": "Enter your password",
      "submitButton": "Sign In",
      "googleButton": "Continue with Google",
      "forgotPassword": "Forgot password?",
      "noAccount": "Don't have an account?",
      "signUp": "Sign up",
      "backToHome": "Back to Home",
      "clearSession": "Clear Session",
      "secureAccess": "Secure Access",
      "secureAccessDescription": "This area is restricted to authorized administrators only. All access attempts are logged and monitored.",
      "loading": {
        "authenticating": "Completing authentication...",
        "loading": "Loading authentication..."
      },
      "messages": {
        "success": "Login successful! Redirecting...",
        "completingGoogle": "Completing Google sign-in..."
      }
    },
    "register": {
      "title": "Create your account",
      "subtitle": "Join FAQBNB and start managing your properties",
      "fullNameLabel": "Full Name",
      "fullNamePlaceholder": "John Doe",
      "fullNameOptional": "(optional)",
      "emailLabel": "Email Address",
      "emailLinked": "This email is linked to your access code and cannot be changed.",
      "passwordLabel": "Password",
      "passwordPlaceholder": "Create a strong password",
      "confirmPasswordLabel": "Confirm Password",
      "confirmPasswordPlaceholder": "Confirm your password",
      "termsLabel": "I agree to the",
      "termsOfService": "Terms of Service",
      "and": "and",
      "privacyPolicy": "Privacy Policy",
      "submitButton": "Create Account",
      "creating": "Creating Account...",
      "googleOption": "Continue with Google",
      "googleDescription": "Quick sign-up using your Google account",
      "emailOption": "Sign up with email",
      "emailDescription": "Create a password for your account",
      "chooseMethod": "Choose how to create your account",
      "accessCodeInfo": "Access code:",
      "accountLinked": "Your account will be linked to your verified access code",
      "passwordStrength": {
        "label": "Password strength:",
        "veryWeak": "Very Weak",
        "weak": "Weak",
        "fair": "Fair",
        "good": "Good",
        "strong": "Strong",
        "requirements": "Requirements:",
        "minChars": "At least 8 characters",
        "lowercase": "One lowercase letter",
        "uppercase": "One uppercase letter",
        "number": "One number",
        "special": "One special character"
      },
      "passwordMatch": {
        "match": "Passwords match",
        "noMatch": "Passwords do not match"
      },
      "connectingGoogle": "Connecting to Google...",
      "failed": "Registration Failed"
    },
    "logout": {
      "button": "Sign Out",
      "loggingOut": "Signing out..."
    },
    "accessCode": {
      "label": "Access Code",
      "placeholder": "Enter your access code",
      "validating": "Validating access code...",
      "invalid": "Invalid access code",
      "expired": "Access code has expired"
    }
  }
}
```

### Tasks

- [ ] **Task 2A.1:** Create `auth` namespace structure
- [ ] **Task 2A.2:** Update `/src/app/login/LoginPageContent.tsx`
- [ ] **Task 2A.3:** Update `/src/components/LoginForm.tsx`
- [ ] **Task 2A.4:** Update `/src/components/RegistrationForm.tsx` (largest file)
- [ ] **Task 2A.5:** Update `/src/components/GoogleOAuthButton.tsx`
- [ ] **Task 2A.6:** Update `/src/app/register/page.tsx`
- [ ] **Task 2A.7:** Update `/src/app/register/success/page.tsx`
- [ ] **Task 2A.8:** Update `/src/app/register/complete/page.tsx`
- [ ] **Task 2A.9:** Generate translations for 5 non-English languages
- [ ] **Task 2A.10:** Test all auth flows in each language

---

## Sub-Epic 2B: Dashboard & Navigation

**Estimated Strings:** ~200
**Priority:** Fourth - Core navigation
**Estimated Effort:** 2-3 days

### Components to Update

| Component | Location | Estimated Strings |
|-----------|----------|-------------------|
| Dashboard2 page | `/src/app/dashboard2/page.tsx` | ~30 |
| Dashboard2 layout | `/src/app/dashboard2/layout.tsx` | ~20 |
| StatisticsCards | `/src/components/SimpleDashboard/StatisticsCards.tsx` | ~15 |
| PropertySection | `/src/components/SimpleDashboard/PropertySection.tsx` | ~25 |
| ActionButtons | `/src/components/SimpleDashboard/ActionButtons.tsx` | ~20 |
| EmptyStateCard | `/src/components/SimpleDashboard/EmptyStateCard.tsx` | ~15 |
| Navigation menus | Various | ~40 |
| Sidebar components | Various | ~35 |

### Translation Namespace: `dashboard`

```json
{
  "dashboard": {
    "title": "Dashboard",
    "welcome": "Welcome back, {name}!",
    "overview": "Overview",
    "nav": {
      "dashboard": "Dashboard",
      "items": "Items",
      "properties": "Properties",
      "rooms": "Rooms",
      "tags": "Tags",
      "instructions": "Instructions",
      "analytics": "Analytics",
      "settings": "Settings",
      "help": "Help",
      "create": "Create",
      "print": "Print"
    },
    "stats": {
      "items": "Items",
      "itemsCount": "{count, plural, =0 {No items} one {# item} other {# items}}",
      "rooms": "Rooms",
      "roomsCount": "{count, plural, =0 {No rooms} one {# room} other {# rooms}}",
      "tags": "Tags",
      "tagsCount": "{count, plural, =0 {No tags} one {# tag} other {# tags}}",
      "properties": "Properties",
      "allProperties": "(all properties)",
      "loadingStats": "Loading statistics"
    },
    "actions": {
      "newItem": "New QR Code Item",
      "addProperty": "Add Property",
      "viewAll": "View All",
      "quickActions": "Quick Actions"
    },
    "empty": {
      "title": "Start adding new QR Code items and create guides/instructions",
      "description": "Create your first item to get started",
      "newUserWelcome": "Welcome to FAQBNB!",
      "newUserDescription": "Let's set up your first property and create some QR code items."
    },
    "property": {
      "selectProperty": "Select Property",
      "allProperties": "All Properties",
      "noProperties": "No properties yet",
      "addFirst": "Add your first property"
    },
    "settings": {
      "title": "Dashboard Settings",
      "advancedTools": "Advanced Tools",
      "portfolioView": "Portfolio View"
    }
  }
}
```

### Tasks

- [ ] **Task 2B.1:** Create `dashboard` namespace structure
- [ ] **Task 2B.2:** Update `/src/app/dashboard2/page.tsx`
- [ ] **Task 2B.3:** Update `/src/app/dashboard2/layout.tsx`
- [ ] **Task 2B.4:** Update all SimpleDashboard components
- [ ] **Task 2B.5:** Update navigation/sidebar components
- [ ] **Task 2B.6:** Update page metadata with translations
- [ ] **Task 2B.7:** Generate translations for 5 non-English languages

---

## Sub-Epic 2C: Item Creation Workflow

**Estimated Strings:** ~500
**Priority:** Ninth - Largest component set
**Estimated Effort:** 5-7 days

### Component Count: 86+ files

This is the largest sub-epic with the most components. The ItemCreationWorkflow has:
- 8 step components
- 5 adapter components
- 25+ shared components
- Multiple dialog components

### Components to Update (Major)

| Component | Location | Estimated Strings |
|-----------|----------|-------------------|
| ItemCreationWorkflow | `/src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | ~30 |
| RoomSelectionStep | `.../steps/RoomSelectionStep.tsx` | ~40 |
| ItemTypeStep | `.../steps/ItemTypeStep.tsx` | ~40 |
| SpecificItemStep | `.../steps/SpecificItemStep.tsx` | ~30 |
| PurposeStep | `.../steps/PurposeStep.tsx` | ~35 |
| ContentTypeStep | `.../steps/ContentTypeStep.tsx` | ~40 |
| MediaCaptureStep | `.../steps/MediaCaptureStep.tsx` | ~45 |
| PreviewSaveStep | `.../steps/PreviewSaveStep.tsx` | ~50 |
| SessionSummaryStep | `.../steps/SessionSummaryStep.tsx` | ~40 |
| Shared components | `.../shared/*.tsx` | ~150 |

### Translation Namespace: `workflow`

```json
{
  "workflow": {
    "header": {
      "step": "Step {current} of {total}",
      "exit": "Exit",
      "back": "Back"
    },
    "steps": {
      "roomSelection": {
        "title": "Select a Room",
        "subtitle": "Choose where this item is located",
        "searchPlaceholder": "Search rooms...",
        "noRooms": "No rooms found",
        "addRoom": "Add Room",
        "customRoom": "Custom Room"
      },
      "itemType": {
        "title": "What type of item?",
        "subtitle": "Select the category that best describes your item",
        "appliance": "Appliance",
        "furniture": "Furniture",
        "electronic": "Electronic",
        "utility": "Utility",
        "other": "Other"
      },
      "specificItem": {
        "title": "Which specific item?",
        "subtitle": "Choose or enter the exact item name",
        "searchPlaceholder": "Search or type item name...",
        "suggestions": "Suggestions",
        "custom": "Use custom name"
      },
      "purpose": {
        "title": "What's the purpose?",
        "subtitle": "Select the main purpose for this content",
        "howToUse": "How to Use",
        "troubleshooting": "Troubleshooting",
        "maintenance": "Maintenance",
        "safety": "Safety Information",
        "warranty": "Warranty & Support",
        "other": "Other"
      },
      "contentType": {
        "title": "How do you want to add content?",
        "subtitle": "Choose how to provide instructions",
        "photo": "Take Photo",
        "video": "Record Video",
        "upload": "Upload File",
        "text": "Write Text",
        "link": "Add Link"
      },
      "mediaCapture": {
        "title": "Capture Content",
        "takePhoto": "Take Photo",
        "recordVideo": "Record Video",
        "retake": "Retake",
        "useThis": "Use This",
        "cameraPermission": "Camera access is required",
        "cameraPermissionDescription": "Please allow camera access to capture photos or videos."
      },
      "preview": {
        "title": "Review & Save",
        "subtitle": "Review your item before saving",
        "itemName": "Item Name",
        "description": "Description",
        "tags": "Tags",
        "content": "Content",
        "addMore": "Add More Content",
        "reorder": "Reorder Content",
        "save": "Save Item",
        "saving": "Saving..."
      },
      "sessionSummary": {
        "title": "Session Complete!",
        "subtitle": "You created {count} {count, plural, one {item} other {items}}",
        "printOptions": "Print QR Codes",
        "createAnother": "Create Another Item",
        "viewItems": "View Items",
        "done": "Done"
      }
    },
    "dialogs": {
      "confirmExit": {
        "title": "Exit Item Creation?",
        "message": "You have unsaved changes. Are you sure you want to exit?",
        "stay": "Stay",
        "exit": "Exit"
      },
      "removeItem": {
        "title": "Remove Item?",
        "message": "Are you sure you want to remove this item from the session?"
      },
      "emptySession": {
        "title": "No Items Added",
        "message": "You haven't added any items yet. Add at least one item to continue."
      }
    },
    "content": {
      "pieces": "Content Pieces",
      "piece": "{count, plural, one {# piece} other {# pieces}} of content",
      "dragToReorder": "Drag to reorder",
      "remove": "Remove"
    },
    "validation": {
      "nameRequired": "Item name is required",
      "contentRequired": "At least one content piece is required",
      "roomRequired": "Please select a room"
    }
  }
}
```

### Tasks

- [ ] **Task 2C.1:** Create `workflow` namespace structure
- [ ] **Task 2C.2:** Update main ItemCreationWorkflow component
- [ ] **Task 2C.3:** Update RoomSelectionStep
- [ ] **Task 2C.4:** Update ItemTypeStep
- [ ] **Task 2C.5:** Update SpecificItemStep
- [ ] **Task 2C.6:** Update PurposeStep
- [ ] **Task 2C.7:** Update ContentTypeStep
- [ ] **Task 2C.8:** Update MediaCaptureStep and adapters
- [ ] **Task 2C.9:** Update PreviewSaveStep
- [ ] **Task 2C.10:** Update SessionSummaryStep
- [ ] **Task 2C.11:** Update all shared components (25+ files)
- [ ] **Task 2C.12:** Update all dialog components
- [ ] **Task 2C.13:** Generate translations for 5 non-English languages
- [ ] **Task 2C.14:** Test complete workflow in each language

---

## Sub-Epic 2D: Item Management

**Estimated Strings:** ~400
**Priority:** Seventh - High usage area
**Estimated Effort:** 3-4 days

### Components to Update

| Component | Location | Estimated Strings |
|-----------|----------|-------------------|
| ItemManager | `/src/components/ItemManager/` | ~200 |
| ItemGrid | `.../ItemGrid.tsx` | ~30 |
| ItemCard | `.../ItemCard.tsx` | ~40 |
| FilterPanel | `.../FilterPanel.tsx` | ~50 |
| SortMenu | `.../SortMenu.tsx` | ~20 |
| BulkActions | `.../BulkActions/` | ~40 |
| Item pages | `/src/app/dashboard2/items/` | ~20 |

### Translation Namespace: `items`

```json
{
  "items": {
    "title": "Items",
    "subtitle": "Manage your QR code items",
    "list": {
      "empty": {
        "title": "No items yet",
        "description": "Create your first QR code item to get started",
        "action": "Create Item"
      },
      "noResults": "No items match your filters"
    },
    "card": {
      "views": "{count, plural, one {# view} other {# views}}",
      "pieces": "{count, plural, one {# piece} other {# pieces}} of content",
      "noContent": "No content yet"
    },
    "actions": {
      "create": "New Item",
      "edit": "Edit",
      "delete": "Delete",
      "duplicate": "Duplicate",
      "viewQR": "View QR Code",
      "print": "Print",
      "share": "Share"
    },
    "filters": {
      "title": "Filters",
      "property": "Property",
      "room": "Room",
      "tag": "Tag",
      "contentType": "Content Type",
      "status": "Status",
      "clearAll": "Clear All"
    },
    "sort": {
      "title": "Sort By",
      "newest": "Newest First",
      "oldest": "Oldest First",
      "nameAZ": "Name (A-Z)",
      "nameZA": "Name (Z-A)",
      "mostViewed": "Most Viewed"
    },
    "bulk": {
      "selected": "{count} selected",
      "delete": "Delete Selected",
      "move": "Move to Property",
      "addTags": "Add Tags",
      "print": "Print Selected"
    },
    "detail": {
      "title": "Item Details",
      "qrCode": "QR Code",
      "analytics": "Analytics",
      "content": "Content",
      "settings": "Settings"
    },
    "delete": {
      "title": "Delete Item",
      "message": "Are you sure you want to delete \"{name}\"? This action cannot be undone.",
      "confirm": "Delete Item"
    }
  }
}
```

### Tasks

- [ ] **Task 2D.1:** Create `items` namespace structure
- [ ] **Task 2D.2:** Update ItemManager component family
- [ ] **Task 2D.3:** Update ItemGrid and ItemCard
- [ ] **Task 2D.4:** Update filter and sort components
- [ ] **Task 2D.5:** Update bulk action dialogs
- [ ] **Task 2D.6:** Update item detail/edit pages
- [ ] **Task 2D.7:** Generate translations for 5 non-English languages

---

## Sub-Epic 2E: Article & Content Management

**Estimated Strings:** ~300
**Priority:** Eighth - Content management
**Estimated Effort:** 2-3 days

### Components to Update

| Component | Location | Estimated Strings |
|-----------|----------|-------------------|
| MarkdownEditor | `/src/components/ItemCapture/editors/MarkdownEditor.tsx` | ~40 |
| ImageCropper | `.../editors/ImageCropper.tsx` | ~20 |
| VideoTrimmer | `.../editors/VideoTrimmer.tsx` | ~25 |
| MediaGallery | `/src/components/ItemManager/.../MediaGallery.tsx` | ~30 |
| AssetPanel | `.../AssetPanel/` | ~60 |
| Instructions pages | `/src/app/dashboard2/instructions/` | ~50 |

### Translation Namespace: `articles`

```json
{
  "articles": {
    "title": "Instructions",
    "subtitle": "Manage content and instructions",
    "editor": {
      "title": "Edit Content",
      "preview": "Preview",
      "edit": "Edit",
      "formatting": {
        "bold": "Bold",
        "italic": "Italic",
        "heading": "Heading",
        "list": "List",
        "link": "Link",
        "image": "Image"
      },
      "placeholder": "Write your instructions here..."
    },
    "media": {
      "upload": "Upload Media",
      "dragDrop": "Drag and drop files here",
      "or": "or",
      "browse": "Browse files",
      "supportedFormats": "Supported formats: {formats}",
      "maxSize": "Maximum file size: {size}MB"
    },
    "crop": {
      "title": "Crop Image",
      "aspectRatio": "Aspect Ratio",
      "freeform": "Freeform",
      "square": "Square",
      "landscape": "Landscape",
      "portrait": "Portrait",
      "apply": "Apply Crop",
      "reset": "Reset"
    },
    "video": {
      "title": "Trim Video",
      "startTime": "Start Time",
      "endTime": "End Time",
      "duration": "Duration: {duration}",
      "apply": "Apply Trim"
    },
    "purposes": {
      "howToUse": "How to Use",
      "troubleshooting": "Troubleshooting",
      "maintenance": "Maintenance",
      "safety": "Safety Information",
      "warranty": "Warranty & Support",
      "other": "Other"
    }
  }
}
```

### Tasks

- [ ] **Task 2E.1:** Create `articles` namespace structure
- [ ] **Task 2E.2:** Update editor components
- [ ] **Task 2E.3:** Update media handling components
- [ ] **Task 2E.4:** Update crop/trim utilities
- [ ] **Task 2E.5:** Update instructions pages
- [ ] **Task 2E.6:** Generate translations for 5 non-English languages

---

## Sub-Epic 2F: Property Management

**Estimated Strings:** ~200
**Priority:** Sixth - Moderate complexity
**Estimated Effort:** 2 days

### Components to Update

| Component | Location | Estimated Strings |
|-----------|----------|-------------------|
| PropertyForm | `/src/components/PropertyForm.tsx` | ~40 |
| PropertyEditModal | `/src/components/SimpleDashboard/PropertyEditModal.tsx` | ~30 |
| AddPropertyModal | `/src/components/SimpleDashboard/AddPropertyModal.tsx` | ~30 |
| Properties pages | `/src/app/dashboard2/properties/` | ~50 |
| PropertySelector | `/src/components/PropertySelector.tsx` | ~20 |

### Translation Namespace: `properties`

```json
{
  "properties": {
    "title": "Properties",
    "subtitle": "Manage your properties",
    "list": {
      "empty": {
        "title": "No properties yet",
        "description": "Add your first property to organize your items",
        "action": "Add Property"
      }
    },
    "form": {
      "name": "Property Name",
      "namePlaceholder": "e.g., Beach House, Downtown Apartment",
      "address": "Address",
      "addressPlaceholder": "Enter property address",
      "type": "Property Type",
      "types": {
        "apartment": "Apartment",
        "house": "House",
        "condo": "Condo",
        "townhouse": "Townhouse",
        "cabin": "Cabin",
        "villa": "Villa",
        "other": "Other"
      },
      "description": "Description",
      "descriptionPlaceholder": "Optional property description"
    },
    "actions": {
      "add": "Add Property",
      "edit": "Edit Property",
      "delete": "Delete Property",
      "view": "View Property"
    },
    "modal": {
      "addTitle": "Add New Property",
      "editTitle": "Edit Property",
      "saving": "Saving...",
      "deleting": "Deleting..."
    },
    "delete": {
      "title": "Delete Property",
      "message": "Are you sure you want to delete \"{name}\"? All items in this property will be moved to \"Unassigned\".",
      "confirm": "Delete Property"
    },
    "selector": {
      "selectProperty": "Select Property",
      "allProperties": "All Properties",
      "unassigned": "Unassigned"
    }
  }
}
```

### Tasks

- [ ] **Task 2F.1:** Create `properties` namespace structure
- [ ] **Task 2F.2:** Update PropertyForm
- [ ] **Task 2F.3:** Update property modals
- [ ] **Task 2F.4:** Update property pages
- [ ] **Task 2F.5:** Update PropertySelector
- [ ] **Task 2F.6:** Generate translations for 5 non-English languages

---

## Sub-Epic 2G: Settings & Account

**Estimated Strings:** ~150
**Priority:** Fifth - Lower complexity
**Estimated Effort:** 1-2 days

### Components to Update

| Component | Location | Estimated Strings |
|-----------|----------|-------------------|
| Account settings | Various | ~50 |
| User profile | Various | ~40 |
| Preferences | Various | ~30 |
| Help page | `/src/app/dashboard2/help/page.tsx` | ~30 |

### Translation Namespace: `settings`

```json
{
  "settings": {
    "title": "Settings",
    "subtitle": "Manage your account settings",
    "sections": {
      "account": "Account",
      "profile": "Profile",
      "preferences": "Preferences",
      "notifications": "Notifications",
      "security": "Security"
    },
    "account": {
      "email": "Email Address",
      "emailDescription": "Your account email address",
      "changeEmail": "Change Email",
      "deleteAccount": "Delete Account",
      "deleteWarning": "This action is permanent and cannot be undone."
    },
    "profile": {
      "name": "Display Name",
      "avatar": "Profile Photo",
      "uploadAvatar": "Upload Photo",
      "removeAvatar": "Remove Photo"
    },
    "preferences": {
      "language": "Language",
      "languageDescription": "Choose your preferred language",
      "theme": "Theme",
      "themeOptions": {
        "light": "Light",
        "dark": "Dark",
        "system": "System"
      },
      "timezone": "Timezone"
    },
    "help": {
      "title": "Help & Support",
      "gettingStarted": "Getting Started",
      "faq": "FAQ",
      "contact": "Contact Support",
      "documentation": "Documentation"
    }
  }
}
```

### Tasks

- [ ] **Task 2G.1:** Create `settings` namespace structure
- [ ] **Task 2G.2:** Update account settings components
- [ ] **Task 2G.3:** Update profile components
- [ ] **Task 2G.4:** Update preferences components
- [ ] **Task 2G.5:** Update help page
- [ ] **Task 2G.6:** Generate translations for 5 non-English languages

---

## Sub-Epic 2I: Email Templates

**Estimated Strings:** ~200
**Priority:** Tenth - Different translation mechanism
**Estimated Effort:** 2-3 days

### Files to Update

| File | Estimated Strings |
|------|-------------------|
| `/src/lib/email-templates.ts` | ~200 |

### Translation Approach

Email templates require a different approach since they are server-side only and may be sent in the recipient's preferred language:

```typescript
// /src/lib/email-translations.ts
import { SupportedLanguage } from '@/types';

type EmailTranslations = {
  [key: string]: {
    [lang in SupportedLanguage]: string;
  };
};

const emailTranslations: EmailTranslations = {
  'accessApproval.subject': {
    en: 'Access Granted: {accountName} - Your Access Code',
    fr: 'Acces Accorde: {accountName} - Votre Code d\'Acces',
    es: 'Acceso Concedido: {accountName} - Tu Codigo de Acceso',
    de: 'Zugang gewahrt: {accountName} - Ihr Zugangscode',
    nl: 'Toegang Verleend: {accountName} - Uw Toegangscode',
    it: 'Accesso Concesso: {accountName} - Il Tuo Codice di Accesso'
  },
  // ... more translations
};

export function getEmailTranslation(
  key: string,
  language: SupportedLanguage,
  variables?: Record<string, string>
): string {
  const template = emailTranslations[key]?.[language] || emailTranslations[key]?.['en'];
  if (!template) return key;

  return Object.entries(variables || {}).reduce(
    (text, [key, value]) => text.replace(`{${key}}`, value),
    template
  );
}
```

### Translation Namespace: `emails`

```json
{
  "emails": {
    "accessApproval": {
      "subject": "Access Granted: {accountName} - Your Access Code",
      "greeting": "Hello {name},",
      "intro": "Great news! Your access request for \"{accountName}\" has been approved.",
      "accessDetails": "Your Access Details:",
      "account": "Account: {accountName}",
      "accessCode": "Access Code: {accessCode}",
      "requestedOn": "Requested on: {date}",
      "instructions": "To complete your access setup:",
      "step1": "Click this direct registration link: {link}",
      "step2": "Complete your account registration",
      "step3": "Start exploring the items and resources",
      "notes": "Important Notes:",
      "note1": "Keep your access code secure and don't share it with others",
      "note2": "Your access code will remain valid until you complete registration",
      "note3": "If you have any questions, please contact the account owner",
      "regards": "Best regards,",
      "team": "The FAQBNB Team",
      "footer": "This is an automated message. Please do not reply to this email."
    },
    "accessDenial": {
      "subject": "Access Request Update: {accountName}",
      "greeting": "Hello {name},",
      "intro": "Thank you for your interest in accessing \"{accountName}\".",
      "message": "Unfortunately, we're unable to approve your access request at this time.",
      "reason": "Reason: {reason}",
      "contact": "If you believe this is an error or have questions about this decision, please contact the account owner directly."
    },
    "betaAccess": {
      "subject": "Welcome to FAQBNB Beta - Access Granted!",
      "congratulations": "Congratulations! Your beta waitlist request has been approved!",
      "whatToExpect": "What to Expect:",
      "feature1": "Early access to all FAQBNB features",
      "feature2": "QR code generation and management tools",
      "feature3": "Analytics and insights dashboard",
      "feature4": "Priority support during the beta period",
      "feature5": "Direct feedback channel to influence product development"
    },
    "registrationReminder": {
      "subject": "Reminder: Complete Your {accountName} Access Setup",
      "message": "This is a friendly reminder that your access was approved {days} days ago, but you haven't completed your registration yet."
    }
  }
}
```

### Tasks

- [ ] **Task 2I.1:** Create `emails` namespace and translation structure
- [ ] **Task 2I.2:** Create `getEmailTranslation` utility function
- [ ] **Task 2I.3:** Update `generateAccessApprovalEmail` function
- [ ] **Task 2I.4:** Update `generateAccessDenialEmail` function
- [ ] **Task 2I.5:** Update `generateBetaAccessApprovalEmail` function
- [ ] **Task 2I.6:** Update `generateRegistrationReminderEmail` function
- [ ] **Task 2I.7:** Add language parameter to all email generation functions
- [ ] **Task 2I.8:** Generate translations for 5 non-English languages
- [ ] **Task 2I.9:** Test email generation in each language

---

## Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Translation Key Structure | Nested JSON with dot notation | Matches next-intl convention, organized by feature |
| Namespace Organization | By feature area (auth, dashboard, etc.) | Enables code-splitting and maintainability |
| Pluralization | ICU format | Industry standard, well-supported by next-intl |
| Email Templates | Separate translation mechanism | Server-side only, different language selection logic |
| String Extraction Order | Common first, then by complexity | Maximizes reuse, minimizes rework |
| Machine Translation | AI (Claude/OpenAI) | Context-aware, domain-appropriate |

---

## Quality Assurance

### QC-1: Missing Translation Check

Create a script to verify all keys exist in all language files:

```bash
# /scripts/i18n-check.ts
npm run i18n:check
```

### QC-2: Unused Key Detection

Identify translation keys not used in code:

```bash
npm run i18n:unused
```

### QC-3: Visual Regression Testing

Test all pages in all languages for layout issues:
- Text overflow
- Button truncation
- Layout breaks due to longer text

### QC-4: Translation Completeness Audit

Before marking complete, verify:
- [ ] All 6 language files have identical key structures
- [ ] No hardcoded strings remain in components
- [ ] Pluralization works correctly
- [ ] Variable interpolation works correctly
- [ ] Date/time formatting respects locale

---

## Effort Estimate

| Sub-Epic | Strings | Estimate | Confidence |
|----------|---------|----------|------------|
| 2H: Common & Shared | ~800 | 3-4 days | High |
| 2J: Error Messages | ~300 | 2-3 days | High |
| 2A: Auth & Registration | ~150 | 1-2 days | High |
| 2B: Dashboard & Navigation | ~200 | 2-3 days | High |
| 2G: Settings & Account | ~150 | 1-2 days | High |
| 2F: Property Management | ~200 | 2 days | High |
| 2D: Item Management | ~400 | 3-4 days | Medium |
| 2E: Article & Content | ~300 | 2-3 days | Medium |
| 2C: Item Creation Workflow | ~500 | 5-7 days | Medium |
| 2I: Email Templates | ~200 | 2-3 days | High |
| **Total** | **~3,200** | **24-35 days** | Medium |

**Notes:**
- Estimates assume single developer
- Translation generation (AI) is not included in extraction time
- QA and testing add 3-5 days
- Parallel work possible between independent sub-epics
- Buffer recommended for edge cases and rework

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| More strings than estimated | High | Medium | Time-box extraction per sub-epic, iterate |
| Translation quality issues | Medium | Medium | Professional review for critical text, maintain glossary |
| Layout breaks in other languages | Medium | Low | Design with 40% text expansion in mind |
| Missing translations in production | Low | High | Build-time checks, runtime fallbacks |
| Epic 1 not complete | Medium | Critical | Block Epic 2 start until Epic 1 foundation verified |
| Key naming inconsistencies | Medium | Medium | Establish naming convention early, lint rules |
| Context switching overhead | Medium | Low | Group related components in extraction sessions |

---

## Open Questions

1. **Translation Review Process:** Should machine translations be flagged for human review? If so, which strings are critical?
   - *Recommendation:* Flag all strings, prioritize auth and error messages for review

2. **Fallback Strategy:** What happens when a translation is missing at runtime?
   - *Recommendation:* Fall back to English with console warning in development

3. **String Extraction Tooling:** Should we use i18n-ally VSCode extension or custom scripts?
   - *Recommendation:* Start with i18n-ally, supplement with grep-based scripts

4. **Terminology Glossary:** Should we maintain a formal glossary of translated terms?
   - *Recommendation:* Yes, create `/docs/i18n/glossary.md` with key terms

---

## File Changes Summary

### New Files

| File Path | Purpose |
|-----------|---------|
| `/messages/en.json` | English translations (expanded from Epic 1 stub) |
| `/messages/fr.json` | French translations |
| `/messages/es.json` | Spanish translations |
| `/messages/de.json` | German translations |
| `/messages/nl.json` | Dutch translations |
| `/messages/it.json` | Italian translations |
| `/src/lib/i18n/email-translations.ts` | Email template translations |
| `/scripts/i18n-check.ts` | Missing translation checker |
| `/scripts/i18n-unused.ts` | Unused key detector |
| `/docs/i18n/glossary.md` | Translation glossary |

### Modified Files (275+ components)

All component files in:
- `/src/app/login/`
- `/src/app/register/`
- `/src/app/dashboard2/`
- `/src/components/SimpleDashboard/`
- `/src/components/ItemCreationWorkflow/`
- `/src/components/ItemManager/`
- `/src/components/ItemCapture/`
- `/src/lib/email-templates.ts`
- And many more...

---

## Acceptance Criteria Mapping

| PRD Criteria | Implementation Task |
|--------------|---------------------|
| AC-1: All 275+ components updated | All sub-epic tasks |
| AC-1: Zero hardcoded user-facing strings | Verification in all sub-epics |
| AC-1: All strings use t() function | Component update tasks |
| AC-2: en.json complete and organized | Task 2H.1, all namespace tasks |
| AC-2: All 5 other language files complete | Translation generation tasks |
| AC-2: No missing keys in any language | QC-1 task |
| AC-3: Pluralizations use ICU format | Verified in string extraction |
| AC-3: Dynamic values use interpolation | Verified in string extraction |
| AC-3: No string concatenation | Verified in code review |
| AC-4: All email templates translated | Sub-Epic 2I |
| AC-4: Email language selection works | Task 2I.7 |
| AC-4: Fallback to English works | Task 2I.7 |
| AC-5: All form validation translated | Sub-Epic 2J |
| AC-5: All API errors translated | Sub-Epic 2J |
| AC-6: Missing translation check passes | QC-1 |
| AC-6: Visual QA complete | QC-3 |
| AC-6: No layout breaks | QC-3 |

---

## References

- [PRD: Localization Epic 2](/docs/prd/PRD_L10N_Epic2_Static_UI_Translation.md)
- [PRD: Localization Epic 1](/docs/prd/PRD_L10N_Epic1_Foundation.md)
- [Plan: Localization Epic 1](/docs/prd/Plan-110-L10N-Epic1-Foundation.md)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)

---

## Appendix A: Component Inventory by Sub-Epic

### Sub-Epic 2A: Authentication (8 files)
```
/src/app/login/LoginPageContent.tsx
/src/app/login/page.tsx
/src/app/register/page.tsx
/src/app/register/success/page.tsx
/src/app/register/complete/page.tsx
/src/components/LoginForm.tsx
/src/components/RegistrationForm.tsx
/src/components/GoogleOAuthButton.tsx
```

### Sub-Epic 2B: Dashboard (15+ files)
```
/src/app/dashboard2/page.tsx
/src/app/dashboard2/layout.tsx
/src/components/SimpleDashboard/StatisticsCards.tsx
/src/components/SimpleDashboard/PropertySection.tsx
/src/components/SimpleDashboard/ActionButtons.tsx
/src/components/SimpleDashboard/EmptyStateCard.tsx
/src/components/SimpleDashboard/PropertyEditModal.tsx
/src/components/SimpleDashboard/AddPropertyModal.tsx
/src/components/SimpleDashboard/PortfolioSummary.tsx
/src/components/SimpleDashboard/PropertySearchBar.tsx
/src/components/SimpleDashboard/PropertyGroupingControl.tsx
/src/components/SimpleDashboard/BulkOperationsToolbar.tsx
/src/components/SimpleDashboard/AdvancedDashboardTools.tsx
/src/components/SimpleDashboard/DashboardSettingsPopover.tsx
/src/components/SimpleDashboard/LoadingIndicator.tsx
```

### Sub-Epic 2C: Item Creation Workflow (86+ files)
See `/src/components/ItemCreationWorkflow/` directory

### Sub-Epic 2D: Item Management (40+ files)
See `/src/components/ItemManager/` directory

### Sub-Epic 2E: Article & Content (20+ files)
See `/src/components/ItemCapture/editors/` and related

### Sub-Epic 2F: Property Management (10+ files)
```
/src/components/PropertyForm.tsx
/src/components/PropertySelector.tsx
/src/app/dashboard2/properties/page.tsx
... and modals from SimpleDashboard
```

### Sub-Epic 2G: Settings (8+ files)
```
/src/app/dashboard2/help/page.tsx
/src/app/dashboard2/settings/ (if exists)
... various settings components
```

### Sub-Epic 2I: Email Templates (1 file)
```
/src/lib/email-templates.ts
```

---

## Appendix B: Sample Translation Workflow

### Step 1: Extract strings from component

```tsx
// Before: /src/components/SimpleDashboard/EmptyStateCard.tsx
<h3>Start adding new QR Code items</h3>
<p>Create your first item to get started</p>
<button>New QR Code Item</button>
```

### Step 2: Create translation keys

```json
// /messages/en.json
{
  "dashboard": {
    "empty": {
      "title": "Start adding new QR Code items",
      "description": "Create your first item to get started",
      "action": "New QR Code Item"
    }
  }
}
```

### Step 3: Update component

```tsx
// After: /src/components/SimpleDashboard/EmptyStateCard.tsx
import { useTranslations } from 'next-intl';

function EmptyStateCard() {
  const t = useTranslations('dashboard.empty');

  return (
    <>
      <h3>{t('title')}</h3>
      <p>{t('description')}</p>
      <button>{t('action')}</button>
    </>
  );
}
```

### Step 4: Generate translations

```json
// /messages/fr.json
{
  "dashboard": {
    "empty": {
      "title": "Commencez a ajouter des articles QR Code",
      "description": "Creez votre premier article pour commencer",
      "action": "Nouvel Article QR Code"
    }
  }
}
```

---

*Plan generated for FAQBNB Localization Epic 2 - Static UI Translation*
