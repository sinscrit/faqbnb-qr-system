# PRD: Localization Epic 2 - Static UI Translation

**Document ID:** PRD_L10N_Epic2
**Created:** 2026-01-17
**Last Modified:** 2026-01-17
**Status:** Draft
**Epic Size:** XXL (Extra Extra Large)
**Priority:** P1 - High
**Depends On:** Epic 1 (Foundation)

---

## 1. Executive Summary

This epic covers the extraction and translation of all static UI strings throughout the FAQBNB application. With approximately 5,193+ hardcoded strings across 275+ React components, this is the largest effort in the localization initiative. The goal is to externalize all user-facing text into translation files and provide translations for all 6 supported languages.

### Scope Summary
- **Components to Update:** 275+
- **Estimated Strings:** 5,193+
- **Languages:** 6 (en, fr, es, de, nl, it)
- **Total Translation Entries:** ~31,000 (5,193 x 6)

---

## 2. Goals & Objectives

### Primary Goals
1. Extract all hardcoded UI strings from React components into translation files
2. Replace hardcoded strings with translation function calls (`t()`)
3. Provide complete translations for all 6 languages
4. Maintain visual and functional parity across all languages
5. Establish patterns and tooling for ongoing translation maintenance

### Success Criteria
- Zero hardcoded user-facing strings in components
- All UI elements display correctly in all 6 languages
- No layout breaks due to text length variations
- Translation files are well-organized and maintainable
- Automated tooling to detect missing translations

---

## 3. Scope Breakdown

Due to the size of this epic, it should be broken into sub-epics by feature area:

### Sub-Epic 2A: Authentication & Registration
**Estimated Strings:** ~150
**Components:**
- `/src/app/login/LoginPageContent.tsx`
- `/src/components/GoogleOAuthButton.tsx`
- `/src/components/RegistrationForm.tsx`
- `/src/app/register/page.tsx`
- `/src/app/auth/callback/page.tsx`
- Related auth components

**String Categories:**
- Sign in/Sign out buttons
- Form labels and placeholders
- Validation error messages
- OAuth flow messages
- Registration instructions
- Password requirements

### Sub-Epic 2B: Dashboard & Navigation
**Estimated Strings:** ~200
**Components:**
- `/src/app/dashboard2/layout.tsx`
- `/src/app/dashboard2/page.tsx`
- `/src/components/SimpleDashboard/`
- `/src/components/DashboardNav/`
- Navigation menus
- Sidebar components

**String Categories:**
- Navigation labels (Dashboard, Items, Guides, Properties)
- Page titles
- Breadcrumbs
- Loading states
- Empty states
- Statistics labels

### Sub-Epic 2C: Item Creation Workflow
**Estimated Strings:** ~500
**Components:**
- `/src/components/ItemCreationWorkflow/` (86+ files)
- `/src/components/ItemCapture/`
- All step components
- Form components

**String Categories:**
- Step titles and descriptions
- Form labels and placeholders
- Help text and tooltips
- Validation messages
- Success/error messages
- Button labels
- Progress indicators

### Sub-Epic 2D: Item Management
**Estimated Strings:** ~400
**Components:**
- `/src/app/dashboard2/items/page.tsx`
- `/src/components/ItemManager/`
- Item list views
- Item detail views
- Edit forms
- Delete confirmations

**String Categories:**
- List headers and actions
- Filter labels
- Sort options
- Bulk action labels
- Confirmation dialogs
- Status messages

### Sub-Epic 2E: Article & Content Management
**Estimated Strings:** ~300
**Components:**
- Article editor components
- Content type selectors
- Media upload components
- Link management

**String Categories:**
- Editor labels
- Content type names
- Media upload instructions
- Link form labels
- Purpose categories (How to Use, Troubleshooting, etc.)

### Sub-Epic 2F: Property Management
**Estimated Strings:** ~200
**Components:**
- `/src/app/dashboard2/properties/`
- Property forms
- Property list views

**String Categories:**
- Property form labels
- Property type names
- Address fields
- Property settings

### Sub-Epic 2G: Settings & Account
**Estimated Strings:** ~150
**Components:**
- Account settings
- User profile
- Preferences

**String Categories:**
- Settings labels
- Profile fields
- Preference options
- Account actions

### Sub-Epic 2H: Common & Shared Components
**Estimated Strings:** ~800
**Components:**
- `/src/components/ui/` (shadcn components)
- Buttons, modals, dialogs
- Form elements
- Toast notifications
- Error boundaries

**String Categories:**
- Common actions (Save, Cancel, Delete, Edit)
- Confirmation messages
- Loading text
- Error messages
- Success messages
- Placeholder text

### Sub-Epic 2I: Email Templates
**Estimated Strings:** ~200
**Files:**
- `/src/lib/email-templates.ts`

**String Categories:**
- Email subjects
- Email body content
- Call-to-action text
- Footer text
- Legal disclaimers

### Sub-Epic 2J: Error Messages & Validation
**Estimated Strings:** ~300
**Locations:**
- Form validation messages
- API error responses
- Network error messages
- Permission error messages

**String Categories:**
- Required field messages
- Format validation messages
- Length validation messages
- Server error messages
- Permission denied messages

---

## 4. Functional Requirements

### 4.1 String Extraction

#### FR-1.1: Translation Key Convention
All translation keys must follow this naming convention:
```
{namespace}.{component/page}.{element}.{variant?}
```

Examples:
```json
{
  "auth.login.title": "Sign in to your account",
  "auth.login.button.submit": "Sign In",
  "auth.login.button.google": "Continue with Google",
  "auth.login.error.invalidCredentials": "Invalid email or password",
  "common.actions.save": "Save",
  "common.actions.cancel": "Cancel"
}
```

#### FR-1.2: Namespace Organization
```
/messages/en.json
{
  "common": { ... },      // Shared across app
  "auth": { ... },        // Authentication
  "dashboard": { ... },   // Dashboard pages
  "items": { ... },       // Item management
  "articles": { ... },    // Article/content
  "properties": { ... },  // Property management
  "settings": { ... },    // Settings/preferences
  "errors": { ... },      // Error messages
  "emails": { ... }       // Email templates
}
```

#### FR-1.3: Pluralization Support
Use ICU message format for plurals:
```json
{
  "items.count": "{count, plural, =0 {No items} one {# item} other {# items}}"
}
```

#### FR-1.4: Variable Interpolation
Use named placeholders for dynamic values:
```json
{
  "items.deleteConfirm": "Are you sure you want to delete \"{itemName}\"?"
}
```

### 4.2 Component Updates

#### FR-2.1: Hook Usage Pattern
All components must use the `useTranslations` hook:
```typescript
import { useTranslations } from 'next-intl';

function MyComponent() {
  const t = useTranslations('namespace');
  return <h1>{t('page.title')}</h1>;
}
```

#### FR-2.2: Server Components
For server components, use `getTranslations`:
```typescript
import { getTranslations } from 'next-intl/server';

async function MyServerComponent() {
  const t = await getTranslations('namespace');
  return <h1>{t('page.title')}</h1>;
}
```

#### FR-2.3: Attribute Translations
Translate all user-visible attributes:
```tsx
<input
  placeholder={t('form.email.placeholder')}
  aria-label={t('form.email.ariaLabel')}
/>
```

#### FR-2.4: Title and Meta Tags
Page titles and meta descriptions must be translated:
```typescript
export async function generateMetadata({ params: { locale } }) {
  const t = await getTranslations({ locale, namespace: 'metadata' });
  return {
    title: t('dashboard.title'),
    description: t('dashboard.description')
  };
}
```

### 4.3 Translation Files

#### FR-3.1: File Structure
Each language gets its own JSON file:
```
/messages
  /en.json    (English - source of truth)
  /fr.json    (French)
  /es.json    (Spanish)
  /de.json    (German)
  /nl.json    (Dutch)
  /it.json    (Italian)
```

#### FR-3.2: English as Source
English (en.json) is the source of truth. Other language files must:
- Have the same key structure as English
- Be complete (no missing keys)
- Mark machine translations for review

#### FR-3.3: Translation Metadata
Include metadata in each file:
```json
{
  "_meta": {
    "language": "fr",
    "lastUpdated": "2026-01-17",
    "translatedBy": "machine",
    "reviewStatus": "pending"
  },
  "common": { ... }
}
```

### 4.4 Email Templates

#### FR-4.1: Template Structure
Email templates must support language parameter:
```typescript
function getAccessApprovalEmail(
  recipientName: string,
  accessCode: string,
  language: string = 'en'
): EmailTemplate {
  const t = getEmailTranslations(language);
  return {
    subject: t('accessApproval.subject'),
    body: t('accessApproval.body', { name: recipientName, code: accessCode })
  };
}
```

#### FR-4.2: Email Language Selection
Emails should be sent in:
1. Recipient's preferred language (if known)
2. Account's preferred language
3. English (fallback)

### 4.5 Validation Messages

#### FR-5.1: Form Validation
All form validation libraries must use translated messages:
```typescript
const schema = z.object({
  email: z.string()
    .min(1, t('errors.required'))
    .email(t('errors.invalidEmail')),
  password: z.string()
    .min(6, t('errors.passwordTooShort', { min: 6 }))
});
```

#### FR-5.2: Server-Side Errors
API responses with error messages must include translation keys:
```json
{
  "success": false,
  "error": "errors.itemNotFound",
  "fallbackMessage": "Item not found"
}
```

---

## 5. Translation Quality Requirements

### 5.1 Translation Sources

#### Primary: AI Translation
Use Claude/OpenAI for initial translation with:
- Context about the application domain (property rental, QR codes)
- Character limits for UI elements
- Tone guidance (professional but friendly)

#### Secondary: Professional Review (Future)
Mark all machine translations for potential professional review.

### 5.2 Translation Guidelines

#### TG-1: Tone & Voice
- Professional but approachable
- Clear and concise
- Consistent terminology across the app

#### TG-2: Terminology Consistency
Maintain a glossary of key terms:
| English | French | Spanish | German | Dutch | Italian |
|---------|--------|---------|--------|-------|---------|
| Item | Article | Articulo | Artikel | Item | Articolo |
| Property | Propriete | Propiedad | Immobilie | Eigendom | Proprieta |
| QR Code | Code QR | Codigo QR | QR-Code | QR-code | Codice QR |
| Guide | Guide | Guia | Anleitung | Gids | Guida |
| Dashboard | Tableau de bord | Panel | Dashboard | Dashboard | Dashboard |

#### TG-3: Length Considerations
- Button text: Keep under 20 characters where possible
- Labels: Account for 30-40% expansion from English
- Avoid truncation - adjust layouts if needed

### 5.3 Quality Checks

#### QC-1: Missing Translation Detection
Build-time check for missing translations:
```bash
npm run i18n:check
```
Should fail if any key exists in en.json but not in other languages.

#### QC-2: Unused Key Detection
Identify translation keys not used in code:
```bash
npm run i18n:unused
```

#### QC-3: Visual Regression Testing
Test all pages in all languages for layout issues.

---

## 6. Implementation Approach

### 6.1 Recommended Order
1. Set up tooling and infrastructure
2. Extract common/shared strings first
3. Work through sub-epics in order (2A through 2J)
4. Generate machine translations
5. Visual QA in all languages
6. Fix layout issues

### 6.2 Extraction Tooling
Consider using:
- **i18n-ally** VSCode extension for string extraction
- Custom script to find hardcoded strings
- Regular expressions to identify patterns

### 6.3 Parallel Work Strategy
- String extraction can be done by multiple developers
- Translation generation is automated
- QA can be parallelized by language

---

## 7. Non-Functional Requirements

### NFR-1: Performance
- Translation files should be code-split by route
- Lazy load non-critical translations
- Cache translations aggressively

### NFR-2: Bundle Size
- Total translation files < 500KB per language
- Use tree-shaking for unused translations

### NFR-3: Developer Experience
- TypeScript support for translation keys
- Autocomplete for translation functions
- Clear error messages for missing translations

### NFR-4: Maintainability
- Single source of truth (en.json)
- Automated sync for other languages
- Clear documentation for adding new strings

---

## 8. Acceptance Criteria

### AC-1: String Extraction Complete
- [ ] All 275+ components updated
- [ ] Zero hardcoded user-facing strings
- [ ] All strings use `t()` function

### AC-2: Translation Files Complete
- [ ] en.json complete and organized
- [ ] All 5 other language files complete
- [ ] No missing keys in any language

### AC-3: Pluralization & Variables
- [ ] All pluralizations use ICU format
- [ ] All dynamic values use interpolation
- [ ] No string concatenation for translations

### AC-4: Email Templates
- [ ] All email templates translated
- [ ] Email language selection works
- [ ] Fallback to English works

### AC-5: Validation Messages
- [ ] All form validation translated
- [ ] All API errors translated
- [ ] Fallback messages exist

### AC-6: Quality Assurance
- [ ] Missing translation check passes
- [ ] Visual QA in all languages complete
- [ ] No layout breaks in any language

---

## 9. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Scope creep (more strings than estimated) | High | Medium | Time-box extraction, iterate |
| Translation quality issues | Medium | Medium | Professional review for critical text |
| Layout breaks in other languages | Medium | Low | Design with 40% text expansion in mind |
| Missing translations in production | Low | High | Build-time checks, runtime fallbacks |
| Developer resistance to new patterns | Medium | Medium | Clear documentation, tooling support |

---

## 10. Dependencies

### Upstream
- Epic 1 Foundation (i18n framework must be set up)

### Downstream
- Epic 4 Guest Experience (depends on UI being translated)

---

## 11. Out of Scope

- User-generated content translation (Epic 3)
- Guest language experience (Epic 4)
- Translation review UI (Epic 5)
- New feature development during translation
- RTL language support

---

## 12. Effort Estimation by Sub-Epic

| Sub-Epic | Strings | Size | Notes |
|----------|---------|------|-------|
| 2A: Auth & Registration | ~150 | S | Clear boundaries |
| 2B: Dashboard & Navigation | ~200 | S | Core flow |
| 2C: Item Creation Workflow | ~500 | L | Many components |
| 2D: Item Management | ~400 | M | Medium complexity |
| 2E: Article & Content | ~300 | M | Editor complexity |
| 2F: Property Management | ~200 | S | Straightforward |
| 2G: Settings & Account | ~150 | S | Small scope |
| 2H: Common & Shared | ~800 | L | Widely used |
| 2I: Email Templates | ~200 | M | Different format |
| 2J: Error Messages | ~300 | M | Scattered locations |
| **Total** | **~3,200** | **XXL** | Full scope |

Note: Original estimate of 5,193 strings included duplicates and comments. Actual unique user-facing strings estimated at ~3,200.

---

## 13. Appendix

### A. Sample Translation File Structure
```json
{
  "_meta": {
    "language": "en",
    "version": "1.0.0",
    "lastUpdated": "2026-01-17"
  },
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
      "confirm": "Confirm"
    },
    "status": {
      "loading": "Loading...",
      "saving": "Saving...",
      "success": "Success",
      "error": "Error",
      "pending": "Pending"
    }
  },
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
      "signUp": "Sign up"
    }
  }
}
```

### B. Component Update Example
**Before:**
```tsx
function LoginButton() {
  return (
    <button className="btn-primary">
      Sign In
    </button>
  );
}
```

**After:**
```tsx
import { useTranslations } from 'next-intl';

function LoginButton() {
  const t = useTranslations('auth.login');
  return (
    <button className="btn-primary">
      {t('submitButton')}
    </button>
  );
}
```
