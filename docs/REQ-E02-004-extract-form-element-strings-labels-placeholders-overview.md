# REQ-E02-004: Extract Form Element Strings (Labels, Placeholders, Hints)

**Implementation Overview Document**

| Field | Value |
|-------|-------|
| **Request ID** | REQ-E02-004 |
| **Type** | ENHANCEMENT |
| **Size** | L (Large) |
| **Phase** | 2H (Common & Shared Components) |
| **Task** | 2H.4 |
| **Priority** | High (Foundation for forms across entire app) |
| **Epic** | L10N Epic 2 - Static UI Translation |
| **Created** | 2026-01-19 |
| **Last Modified** | 2026-01-19 |

---

## 1. Summary

This task involves extracting all hardcoded form element text including field labels, input placeholders, helper text, and validation hints from form components throughout the application, and replacing them with localized translation references from the i18n common namespace. This is a foundational task that enables form localization across all feature areas.

---

## 2. Background & Context

### Current State
Form components throughout the application contain hardcoded English strings directly embedded in:
- Label elements (e.g., "Email Address", "Password", "Property Name")
- Placeholder attributes (e.g., "Enter your email", "Type here...")
- Helper text paragraphs (e.g., "This email is linked to your access code")
- Hint messages and character counters
- aria-label and title attributes for accessibility

### Epic 1 Foundation
The next-intl framework has been installed and configured in Epic 1:
- Translation files exist in `/messages/{locale}.json` for all 6 languages
- `useTranslations` hook is available for client components
- `getTranslations` is available for server components
- Basic `common` and `errors` namespaces already exist in the messages files
- LogoutButton serves as a reference implementation for translated components

### Why This Task Matters
- Forms are critical conversion points - users abandon forms they don't understand
- Form labels and placeholders provide essential context for data entry
- Non-English speakers need clear guidance on what information each field requires
- This task establishes patterns that will be reused across all feature-specific forms

---

## 3. Requirements Analysis

### Acceptance Criteria (from REQ-E02-004)
- [ ] All form components across the codebase are identified and documented
- [ ] Field labels for text inputs, selects, checkboxes, and radio buttons are extracted to i18n messages
- [ ] Input placeholder text is moved to translation keys with appropriate context
- [ ] Helper text and hint messages are added to the localization message bundle
- [ ] Each hardcoded form string is replaced with useTranslations hook references
- [ ] Forms render correctly in all supported languages without layout breaking
- [ ] Placeholder text and helper text adapt when the user changes language preference
- [ ] Form validation messages reference translated strings where applicable

### Scope Boundaries

**In Scope:**
- Form field labels
- Input placeholders
- Helper/hint text below fields
- Character counter text (e.g., "15/100 characters")
- Accessibility attributes (aria-label, title)
- Select option placeholder text (e.g., "Select property type...")
- Radio button and checkbox labels

**Out of Scope (handled by other tasks):**
- Form validation error messages (Task 2J.2 - Error Messages)
- Button text within forms (Task 2H.2 - Button Labels)
- Form titles and headers (various tasks)
- Toast notifications on form submit (Task 2H.5)

---

## 4. Technical Design

### Translation Namespace Structure

Extend the existing `common` namespace with a `form` sub-namespace:

```json
{
  "common": {
    "form": {
      "labels": {
        "email": "Email Address",
        "password": "Password",
        "confirmPassword": "Confirm Password",
        "fullName": "Full Name",
        "name": "Name",
        "title": "Title",
        "description": "Description",
        "url": "URL",
        "type": "Type",
        "address": "Address",
        "phone": "Phone Number",
        "accessCode": "Access Code"
      },
      "placeholders": {
        "email": "Enter your email address",
        "emailExample": "email@example.com",
        "password": "Enter your password",
        "passwordCreate": "Create a strong password",
        "passwordConfirm": "Confirm your password",
        "fullName": "John Doe",
        "name": "Enter name",
        "title": "Enter title",
        "description": "Enter description...",
        "url": "https://...",
        "urlOptional": "https://... (optional)",
        "search": "Search...",
        "select": "Select an option...",
        "typeOrSelect": "Type or select...",
        "accessCode": "Enter your 8+ character access code"
      },
      "hints": {
        "optional": "(optional)",
        "required": "(required)",
        "charactersRemaining": "{remaining} characters remaining",
        "charactersCount": "{count}/{max} characters",
        "minCharacters": "Minimum {min} characters",
        "maxCharacters": "Maximum {max} characters",
        "emailLinked": "This email is linked to your access code and cannot be changed.",
        "cannotBeChanged": "This field cannot be changed after creation.",
        "friendlyName": "A friendly name to identify this {item}"
      },
      "passwordStrength": {
        "label": "Password strength:",
        "enterPassword": "Enter password",
        "veryWeak": "Very Weak",
        "weak": "Weak",
        "fair": "Fair",
        "good": "Good",
        "strong": "Strong",
        "requirements": "Requirements:",
        "minChars": "At least {min} characters",
        "lowercase": "One lowercase letter",
        "uppercase": "One uppercase letter",
        "number": "One number",
        "special": "One special character"
      },
      "passwordMatch": {
        "match": "Passwords match",
        "noMatch": "Passwords do not match"
      },
      "accessibility": {
        "showPassword": "Show password",
        "hidePassword": "Hide password",
        "generateNew": "Generate new {item}",
        "testLink": "Test link",
        "removeItem": "Remove {item}",
        "selectMethod": "Select registration method"
      },
      "terms": {
        "agreeToTerms": "I agree to the",
        "termsOfService": "Terms of Service",
        "and": "and",
        "privacyPolicy": "Privacy Policy"
      }
    }
  }
}
```

### Implementation Pattern

**Before (hardcoded):**
```tsx
<label>Email Address</label>
<input
  placeholder="admin@faqbnb.com"
  aria-label="Email input"
/>
<p className="hint">This email is linked to your access code</p>
```

**After (translated):**
```tsx
import { useTranslations } from 'next-intl';

function MyForm() {
  const t = useTranslations('common.form');

  return (
    <>
      <label>{t('labels.email')}</label>
      <input
        placeholder={t('placeholders.emailExample')}
        aria-label={t('accessibility.emailInput')}
      />
      <p className="hint">{t('hints.emailLinked')}</p>
    </>
  );
}
```

### Character Counter Pattern

```tsx
// For dynamic character counts
<span>{t('hints.charactersCount', { count: value.length, max: 100 })}</span>
```

---

## 5. Implementation Tasks

### Task 5.1: Extend Common Namespace with Form Translations
**Effort:** 1 story point
- Add `common.form.labels` section to `/messages/en.json`
- Add `common.form.placeholders` section
- Add `common.form.hints` section
- Add `common.form.passwordStrength` section
- Add `common.form.accessibility` section
- Add `common.form.terms` section
- Ensure consistent naming conventions

### Task 5.2: Update LoginForm.tsx
**Effort:** 2 story points
- Extract ~15 hardcoded strings
- Import useTranslations hook
- Replace label text: "Email Address", "Password"
- Replace placeholders: "admin@faqbnb.com", "Enter your password"
- Replace checkbox label: "Remember me for 30 days"
- Replace helper text: "Access restricted to authorized administrators only"
- Replace aria-labels and titles
- Test form renders correctly in all locales

### Task 5.3: Update RegistrationForm.tsx
**Effort:** 3 story points (largest form component)
- Extract ~50 hardcoded strings
- Import useTranslations hook
- Replace all label text (email, password, confirm, full name, terms)
- Replace all placeholder text
- Replace password strength labels and requirements
- Replace password match indicators
- Replace terms agreement text with proper links
- Replace registration method labels ("Continue with Google", "Sign up with email")
- Replace helper text for email linked to access code
- Test form in all locales

### Task 5.4: Update PropertyForm.tsx
**Effort:** 2 story points
- Extract ~20 hardcoded strings
- Replace labels: "Property Owner", "Property Nickname", "Property Type", "Address"
- Replace placeholders with proper examples
- Replace select option placeholders
- Replace helper text and character counters
- Replace form titles

### Task 5.5: Update ItemForm.tsx
**Effort:** 2 story points
- Extract ~25 hardcoded strings
- Replace labels: "Public ID", "Item Name", "Property", "Description", "QR Code Image URL", etc.
- Replace resource/link section labels
- Replace placeholders for all inputs
- Replace helper text and hints
- Replace icon titles ("Generate new UUID", "Test link")

### Task 5.6: Update AccessCodeInput.tsx
**Effort:** 1 story point
- Extract ~15 hardcoded strings
- Replace labels for access code and email inputs
- Replace placeholders
- Replace validation hint text
- Replace info section text
- Replace button titles for show/hide

### Task 5.7: Update AddMediaLinkForm.tsx
**Effort:** 1 story point
- Extract ~10 hardcoded strings
- Replace labels: "Title", "URL", "Type", "Thumbnail URL"
- Replace placeholders
- Replace helper text about auto-detection

### Task 5.8: Update AddPropertyModal.tsx
**Effort:** 1 story point
- Extract form-specific strings
- Handle country dropdown labels (consider separate task for countries)
- Replace placeholder text

### Task 5.9: Update MetadataStep.tsx (ItemCapture)
**Effort:** 1 story point
- Extract search placeholders
- Replace room/tag input placeholders
- Replace hint text about max tags

### Task 5.10: Update Secondary Form Components
**Effort:** 2 story points
- GuideToolbar.tsx - search placeholder
- UserAnalyticsTable.tsx - search placeholder
- AnalyticsManagement.tsx - dropdown placeholders
- PropertySearchBar.tsx - search placeholder
- ProgressivePropertySection.tsx - search placeholder
- TextEditorStep.tsx - editor placeholder
- UrlInputStep.tsx - URL placeholder

### Task 5.11: Generate Translations for Non-English Languages
**Effort:** 1 story point
- Generate French translations
- Generate Spanish translations
- Generate German translations
- Generate Dutch translations
- Generate Italian translations
- Verify ICU format for interpolated strings

### Task 5.12: Update TypeScript Types
**Effort:** 0.5 story points
- Ensure form namespace types are properly exported
- Add type hints for translation keys if using typed i18n

**Total Estimated Effort:** ~17 story points

---

## 6. Authorized Files and Functions for Modification

### Translation Files (Required)

| File Path | Action | Purpose |
|-----------|--------|---------|
| `/messages/en.json` | MODIFY | Add `common.form` namespace with all form strings |
| `/messages/fr.json` | MODIFY | Add French translations for form namespace |
| `/messages/es.json` | MODIFY | Add Spanish translations for form namespace |
| `/messages/de.json` | MODIFY | Add German translations for form namespace |
| `/messages/nl.json` | MODIFY | Add Dutch translations for form namespace |
| `/messages/it.json` | MODIFY | Add Italian translations for form namespace |

### Primary Form Components (Required)

| File Path | Functions/Areas to Modify | Estimated Strings |
|-----------|---------------------------|-------------------|
| `/src/components/LoginForm.tsx` | All label JSX, placeholder attributes, checkbox labels, hint paragraphs | ~15 |
| `/src/components/RegistrationForm.tsx` | All labels, placeholders, password strength UI, terms text | ~50 |
| `/src/components/PropertyForm.tsx` | Form labels, placeholders, select options, helpers, titles | ~20 |
| `/src/components/ItemForm.tsx` | Labels, placeholders, helper text, icon titles | ~25 |
| `/src/components/AccessCodeInput.tsx` | Labels, placeholders, info text, button titles | ~15 |
| `/src/components/MediaManagement/AddMediaLinkForm.tsx` | Labels, placeholders, helper text | ~10 |
| `/src/components/SimpleDashboard/AddPropertyModal.tsx` | Form labels, placeholders, select options | ~10 |
| `/src/components/ItemCapture/components/steps/MetadataStep.tsx` | Search placeholders, hints | ~8 |

### Secondary Form Components (Optional - for search/filter inputs)

| File Path | Functions/Areas to Modify | Estimated Strings |
|-----------|---------------------------|-------------------|
| `/src/components/GuideToolbar.tsx` | Search input placeholder | ~2 |
| `/src/components/analytics/UserAnalyticsTable.tsx` | Search input placeholder | ~2 |
| `/src/components/analytics/AnalyticsManagement.tsx` | Dropdown placeholder | ~2 |
| `/src/components/SimpleDashboard/PropertySearchBar.tsx` | Search placeholder (if hardcoded) | ~2 |
| `/src/components/SimpleDashboard/ProgressivePropertySection.tsx` | Search placeholder | ~2 |
| `/src/components/ItemCapture/components/steps/TextEditorStep.tsx` | Editor placeholder | ~3 |
| `/src/components/ItemCapture/components/steps/UrlInputStep.tsx` | URL input placeholder | ~3 |

### Files NOT to Modify (Out of Scope)

| File Path | Reason |
|-----------|--------|
| Validation schema files (Zod) | Handled by Task 2J.5 |
| Error boundary components | Handled by Task 2J.6 |
| Button-only components | Handled by Task 2H.2 |
| Toast notification utilities | Handled by Task 2H.5 |

---

## 7. Dependencies

### Prerequisites (Must be complete)
- [x] Epic 1 Foundation complete (next-intl installed and configured)
- [x] Translation files exist for all 6 locales
- [x] `useTranslations` hook available
- [ ] Task 2H.1: Common namespace structure created

### Related Tasks (Can run in parallel)
- Task 2H.2: Extract button labels (separate strings)
- Task 2H.3: Extract modal/dialog strings (separate namespace)
- Task 2J.2: Form validation error messages (separate namespace)

### Dependent Tasks (Wait for this task)
- Task 2A.2-2A.4: Auth form translations (can use common form strings)
- Task 2F.2: Property form page translations
- Task 2C components: Workflow form steps

---

## 8. Testing Strategy

### Unit Testing
- Verify all translation keys exist in all 6 locale files
- Verify interpolation works correctly (character counts, etc.)
- Verify no missing translations at runtime

### Visual Testing
- Test each form in all 6 languages
- Verify no layout breaks due to longer translations
- Verify placeholders display correctly
- Verify accessibility attributes are translated

### Functional Testing
- Verify forms still function correctly after translation
- Verify form validation still works
- Verify character counters update correctly
- Verify password strength indicators display properly

### Regression Testing
- Run existing form tests to ensure no regressions
- Test form submission flows end-to-end

---

## 9. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Longer translations break form layouts | Medium | Medium | Design with 40% text expansion buffer |
| Missing translation keys at runtime | Low | High | Add build-time key validation script |
| Inconsistent naming conventions | Medium | Low | Establish naming guide before implementation |
| Breaking existing form functionality | Low | High | Run all existing tests after changes |
| RTL language support needed later | Medium | Low | Use CSS logical properties where possible |

---

## 10. Implementation Notes

### Naming Conventions

Follow these patterns for translation keys:
- Labels: `common.form.labels.{fieldName}` (e.g., `common.form.labels.email`)
- Placeholders: `common.form.placeholders.{context}` (e.g., `common.form.placeholders.emailExample`)
- Hints: `common.form.hints.{context}` (e.g., `common.form.hints.emailLinked`)
- Accessibility: `common.form.accessibility.{action}` (e.g., `common.form.accessibility.showPassword`)

### ICU Format for Interpolation

Use ICU message format for dynamic values:
```json
{
  "common.form.hints.charactersCount": "{count}/{max} characters",
  "common.form.hints.minCharacters": "Minimum {min} characters"
}
```

### Reference Implementation

Use `/src/components/LogoutButton.tsx` as a reference for how to properly use `useTranslations`:
```tsx
const t = useTranslations('auth');
const tCommon = useTranslations('common');

// Use multiple namespaces when needed
<button>{t('signOut')}</button>
<button>{tCommon('cancel')}</button>
```

### Country List Consideration

The country dropdown in AddPropertyModal.tsx contains 45+ hardcoded country names. Consider:
1. Using a separate `common.countries` namespace
2. Using a library like `i18n-iso-countries` for standardized country translations
3. Deferring full country localization to a separate task

---

## 11. Success Criteria

This task is complete when:
1. All identified form components have been updated to use translations
2. The `common.form` namespace is complete in all 6 language files
3. All forms render correctly in all supported languages
4. No hardcoded form strings remain in the modified components
5. Character counts and dynamic values interpolate correctly
6. All existing form tests pass
7. Visual QA confirms no layout issues

---

## 12. References

- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [PRD: L10N Epic 2](/docs/prd/PRD_L10N_Epic2_Static_UI_Translation.md)
- [Epic 1 Foundation](/docs/prd/Plan-110-L10N-Epic1-Foundation.md)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)

---

*Document generated for FAQBNB L10N Epic 2 - Task 2H.4*
