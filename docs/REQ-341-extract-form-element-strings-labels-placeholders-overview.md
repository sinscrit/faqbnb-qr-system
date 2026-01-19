# REQ-341: Extract Form Element Strings for Internationalization

**Overview Document**
**Date Created:** 2026-01-19
**Last Modified:** 2026-01-19
**Task ID:** 2H.4
**Sub-Epic:** 2H - Common & Shared Components
**Type:** ENHANCEMENT
**Size:** L (Large)
**Status:** Planning

---

## Summary

Extract all hardcoded form element strings (labels, placeholders, validation messages, and hints) from form components across the FAQBNB application and replace them with translation keys using the established next-intl i18n system.

---

## Current State Analysis

### Existing i18n Infrastructure

The application already has next-intl v4.7.0 configured with:

| Component | Location | Status |
|-----------|----------|--------|
| next-intl package | `package.json` | Installed |
| Locale configuration | `/src/lib/i18n/config.ts` | Complete |
| Translation files | `/messages/*.json` | 6 languages (en, fr, es, de, nl, it) |
| useTranslations hook | LogoutButton.tsx | Working example |

### Reference Implementation Pattern

From `/src/components/LogoutButton.tsx`:
```typescript
import { useTranslations } from 'next-intl';

function Component() {
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');

  return <button>{t('signOut')}</button>;
}
```

### Forms Requiring Translation

| Form Component | Location | Estimated Strings |
|----------------|----------|-------------------|
| LoginForm | `/src/components/LoginForm.tsx` | ~25 |
| RegistrationForm | `/src/components/RegistrationForm.tsx` | ~45 |
| PropertyForm | `/src/components/PropertyForm.tsx` | ~20 |
| ItemForm | `/src/components/ItemForm.tsx` | ~35 |
| AccessCodeInput | `/src/components/AccessCodeInput.tsx` | ~15 |
| SearchInput | `/src/components/ItemManager/components/SearchInput.tsx` | ~3 |
| AddMediaLinkForm | `/src/components/MediaManagement/AddMediaLinkForm.tsx` | ~12 |
| **Total** | | **~155 strings** |

---

## Implementation Approach

### Translation Namespace Structure

The form strings will be organized under a new `forms` namespace within the existing translation structure:

```json
{
  "forms": {
    "login": {
      "labels": { ... },
      "placeholders": { ... },
      "hints": { ... },
      "validation": { ... }
    },
    "registration": { ... },
    "property": { ... },
    "item": { ... },
    "accessCode": { ... },
    "search": { ... },
    "mediaLink": { ... },
    "common": {
      "labels": { ... },
      "validation": { ... }
    }
  }
}
```

### Translation Key Convention

Following the pattern established in Plan-111:
```
forms.{formName}.{category}.{fieldName}.{variant?}
```

Examples:
- `forms.login.labels.email` → "Email Address"
- `forms.login.placeholders.email` → "admin@faqbnb.com"
- `forms.login.validation.email.required` → "Email is required"
- `forms.login.validation.email.invalid` → "Please enter a valid email address"
- `forms.common.validation.required` → "This field is required"

---

## Detailed String Inventory

### 1. LoginForm (`/src/components/LoginForm.tsx`)

**Labels:**
| Current String | Translation Key |
|----------------|-----------------|
| "Email Address" | `forms.login.labels.email` |
| "Password" | `forms.login.labels.password` |
| "Remember me for 30 days" | `forms.login.labels.rememberMe` |

**Placeholders:**
| Current String | Translation Key |
|----------------|-----------------|
| "admin@faqbnb.com" | `forms.login.placeholders.email` |
| "Enter your password" | `forms.login.placeholders.password` |

**Hints:**
| Current String | Translation Key |
|----------------|-----------------|
| "Access restricted to authorized administrators only" | `forms.login.hints.adminAccess` |

**Validation Messages:**
| Current String | Translation Key |
|----------------|-----------------|
| "Email is required" | `forms.login.validation.email.required` |
| "Please enter a valid email address" | `forms.login.validation.email.invalid` |
| "Password is required" | `forms.login.validation.password.required` |
| "Password must be at least 6 characters" | `forms.login.validation.password.tooShort` |
| "Authentication Failed" | `forms.login.validation.authFailed` |
| "Invalid email or password..." | `forms.login.validation.invalidCredentials` |
| "Access denied. Admin privileges are required." | `forms.login.validation.accessDenied` |

**Button Labels:**
| Current String | Translation Key |
|----------------|-----------------|
| "Signing In..." | `forms.login.buttons.signingIn` |
| "Sign In with Email" | `forms.login.buttons.signIn` |
| "Or continue with email" | `forms.login.buttons.continueWithEmail` |

### 2. RegistrationForm (`/src/components/RegistrationForm.tsx`)

**Labels:**
| Current String | Translation Key |
|----------------|-----------------|
| "Email Address" | `forms.registration.labels.email` |
| "Full Name (optional)" | `forms.registration.labels.fullName` |
| "Password" | `forms.registration.labels.password` |
| "Confirm Password" | `forms.registration.labels.confirmPassword` |
| "I agree to the Terms of Service and Privacy Policy" | `forms.registration.labels.termsAgreement` |

**Placeholders:**
| Current String | Translation Key |
|----------------|-----------------|
| "email@example.com" | `forms.registration.placeholders.email` |
| "John Doe" | `forms.registration.placeholders.fullName` |
| "Create a strong password" | `forms.registration.placeholders.password` |
| "Confirm your password" | `forms.registration.placeholders.confirmPassword` |

**Hints:**
| Current String | Translation Key |
|----------------|-----------------|
| "This email is linked to your access code..." | `forms.registration.hints.emailLinked` |
| "Your account will be linked to your verified access code" | `forms.registration.hints.accessCodeLinked` |
| "Choose how to create your account" | `forms.registration.hints.chooseMethod` |

**Password Strength Labels:**
| Current String | Translation Key |
|----------------|-----------------|
| "Very Weak" | `forms.registration.passwordStrength.veryWeak` |
| "Weak" | `forms.registration.passwordStrength.weak` |
| "Fair" | `forms.registration.passwordStrength.fair` |
| "Good" | `forms.registration.passwordStrength.good` |
| "Strong" | `forms.registration.passwordStrength.strong` |
| "Requirements:" | `forms.registration.passwordStrength.requirements` |
| "At least 8 characters" | `forms.registration.passwordStrength.minChars` |
| "One lowercase letter" | `forms.registration.passwordStrength.lowercase` |
| "One uppercase letter" | `forms.registration.passwordStrength.uppercase` |
| "One number" | `forms.registration.passwordStrength.number` |
| "Passwords match" | `forms.registration.passwordMatch.match` |
| "Passwords do not match" | `forms.registration.passwordMatch.noMatch` |

**Validation Messages:**
| Current String | Translation Key |
|----------------|-----------------|
| "Email is required" | `forms.registration.validation.email.required` |
| "Please enter a valid email address" | `forms.registration.validation.email.invalid` |
| "Password is required" | `forms.registration.validation.password.required` |
| "Password must be at least 8 characters" | `forms.registration.validation.password.minLength` |
| "Password must contain at least one lowercase letter" | `forms.registration.validation.password.lowercase` |
| "Password must contain at least one uppercase letter" | `forms.registration.validation.password.uppercase` |
| "Password must contain at least one number" | `forms.registration.validation.password.number` |
| "Please confirm your password" | `forms.registration.validation.confirmPassword.required` |
| "Passwords do not match" | `forms.registration.validation.confirmPassword.mismatch` |
| "Name must be at least 2 characters" | `forms.registration.validation.name.tooShort` |
| "You must agree to the terms and conditions" | `forms.registration.validation.terms.required` |

**Button Labels:**
| Current String | Translation Key |
|----------------|-----------------|
| "Connecting to Google..." | `forms.registration.buttons.connectingGoogle` |
| "Create Account" | `forms.registration.buttons.createAccount` |
| "Creating Account..." | `forms.registration.buttons.creatingAccount` |
| "Continue with Google" | `forms.registration.buttons.continueGoogle` |
| "Sign up with email" | `forms.registration.buttons.signUpEmail` |

### 3. PropertyForm (`/src/components/PropertyForm.tsx`)

**Labels:**
| Current String | Translation Key |
|----------------|-----------------|
| "Property Owner" | `forms.property.labels.owner` |
| "Property Nickname" | `forms.property.labels.nickname` |
| "Property Type" | `forms.property.labels.type` |
| "Address (Optional)" | `forms.property.labels.address` |

**Placeholders:**
| Current String | Translation Key |
|----------------|-----------------|
| "Select property owner..." | `forms.property.placeholders.owner` |
| "e.g., Main Office, Home, Vacation House" | `forms.property.placeholders.nickname` |
| "Select property type..." | `forms.property.placeholders.type` |
| "e.g., 123 Main St, Anytown, State 12345" | `forms.property.placeholders.address` |

**Hints:**
| Current String | Translation Key |
|----------------|-----------------|
| "A friendly name to identify this property ({count}/100)" | `forms.property.hints.nickname` |
| "Physical address or location description ({count}/500)" | `forms.property.hints.address` |
| "Property owner cannot be changed after creation" | `forms.property.hints.ownerLocked` |

**Validation Messages:**
| Current String | Translation Key |
|----------------|-----------------|
| "Property nickname is required" | `forms.property.validation.nickname.required` |
| "Property nickname must be 100 characters or less" | `forms.property.validation.nickname.tooLong` |
| "Property type is required" | `forms.property.validation.type.required` |
| "Address must be 500 characters or less" | `forms.property.validation.address.tooLong` |

### 4. ItemForm (`/src/components/ItemForm.tsx`)

**Labels:**
| Current String | Translation Key |
|----------------|-----------------|
| "Public ID" | `forms.item.labels.publicId` |
| "Item Name" | `forms.item.labels.name` |
| "Property" | `forms.item.labels.property` |
| "Description" | `forms.item.labels.description` |
| "QR Code Image URL (optional)" | `forms.item.labels.qrCodeUrl` |
| "Resources & Links" | `forms.item.labels.resources` |
| "Title" | `forms.item.labels.linkTitle` |
| "Type" | `forms.item.labels.linkType` |
| "URL" | `forms.item.labels.linkUrl` |
| "Custom Thumbnail URL" | `forms.item.labels.thumbnailUrl` |

**Placeholders:**
| Current String | Translation Key |
|----------------|-----------------|
| "UUID will be generated automatically" | `forms.item.placeholders.publicId` |
| "e.g., Samsung Washing Machine" | `forms.item.placeholders.name` |
| "Select a property..." | `forms.item.placeholders.property` |
| "Describe the item, its location, or any important details..." | `forms.item.placeholders.description` |
| "https://example.com/qr-code.png" | `forms.item.placeholders.qrCodeUrl` |
| "e.g., User Manual" | `forms.item.placeholders.linkTitle` |
| "https://..." | `forms.item.placeholders.linkUrl` |
| "https://... (optional)" | `forms.item.placeholders.thumbnailUrl` |

**Hints:**
| Current String | Translation Key |
|----------------|-----------------|
| "This UUID will be used in the QR code URL..." | `forms.item.hints.publicId` |
| "Select the property where this item is located..." | `forms.item.hints.property` |
| "URL to the QR code image for this item..." | `forms.item.hints.qrCodeUrl` |
| "Leave empty to auto-generate thumbnails" | `forms.item.hints.thumbnailUrl` |
| "No resources added yet" | `forms.item.hints.noResources` |
| "Add Your First Resource" | `forms.item.hints.addFirstResource` |
| "No properties available. Please create a property first..." | `forms.item.hints.noProperties` |

**Validation Messages:**
| Current String | Translation Key |
|----------------|-----------------|
| "Public ID is required" | `forms.item.validation.publicId.required` |
| "Public ID must be a valid UUID format" | `forms.item.validation.publicId.invalidFormat` |
| "Name is required" | `forms.item.validation.name.required` |
| "Property selection is required" | `forms.item.validation.property.required` |
| "Please enter a valid QR code image URL" | `forms.item.validation.qrCodeUrl.invalid` |
| "Title is required" | `forms.item.validation.linkTitle.required` |
| "URL is required" | `forms.item.validation.linkUrl.required` |
| "Please enter a valid URL" | `forms.item.validation.linkUrl.invalid` |
| "Please enter a valid thumbnail URL" | `forms.item.validation.thumbnailUrl.invalid` |

### 5. AccessCodeInput (`/src/components/AccessCodeInput.tsx`)

**Labels:**
| Current String | Translation Key |
|----------------|-----------------|
| "Access Code" | `forms.accessCode.labels.code` |
| "Email Address" | `forms.accessCode.labels.email` |
| "Manual Registration Entry" | `forms.accessCode.labels.title` |

**Placeholders:**
| Current String | Translation Key |
|----------------|-----------------|
| "Enter your 8+ character access code" | `forms.accessCode.placeholders.code` |
| "Enter your email address" | `forms.accessCode.placeholders.email` |

**Hints:**
| Current String | Translation Key |
|----------------|-----------------|
| "Enter your access code and email address to proceed with registration." | `forms.accessCode.hints.instructions` |
| "Access code should be 8+ characters long and contain only letters and numbers" | `forms.accessCode.hints.format` |

**Validation Messages:**
| Current String | Translation Key |
|----------------|-----------------|
| "Access code is required" | `forms.accessCode.validation.code.required` |
| "Access code should be 8+ characters" | `forms.accessCode.validation.code.tooShort` |
| "Access code should contain only letters and numbers" | `forms.accessCode.validation.code.invalidChars` |
| "Valid access code format" | `forms.accessCode.validation.code.valid` |
| "Email is required" | `forms.accessCode.validation.email.required` |
| "Please enter a valid email address" | `forms.accessCode.validation.email.invalid` |
| "Valid email format" | `forms.accessCode.validation.email.valid` |

### 6. SearchInput (`/src/components/ItemManager/components/SearchInput.tsx`)

**Placeholders:**
| Current String | Translation Key |
|----------------|-----------------|
| "Search items..." | `forms.search.placeholders.items` |

### 7. AddMediaLinkForm (`/src/components/MediaManagement/AddMediaLinkForm.tsx`)

**Labels:**
| Current String | Translation Key |
|----------------|-----------------|
| "Title" | `forms.mediaLink.labels.title` |
| "URL" | `forms.mediaLink.labels.url` |
| "Type" | `forms.mediaLink.labels.type` |
| "Thumbnail URL (optional)" | `forms.mediaLink.labels.thumbnailUrl` |

**Placeholders:**
| Current String | Translation Key |
|----------------|-----------------|
| "e.g., Product Manual" | `forms.mediaLink.placeholders.title` |
| "https://..." | `forms.mediaLink.placeholders.url` |

**Hints:**
| Current String | Translation Key |
|----------------|-----------------|
| "Type is auto-detected from URL but can be changed" | `forms.mediaLink.hints.typeAutoDetect` |

**Validation Messages:**
| Current String | Translation Key |
|----------------|-----------------|
| "Please enter a valid URL" | `forms.mediaLink.validation.url.invalid` |

### 8. Common Form Validation (Reusable)

These can be reused across multiple forms:

| Current String | Translation Key |
|----------------|-----------------|
| "This field is required" | `forms.common.validation.required` |
| "Please enter a valid email address" | `forms.common.validation.invalidEmail` |
| "Please enter a valid URL" | `forms.common.validation.invalidUrl` |
| "Must be at least {min} characters" | `forms.common.validation.minLength` |
| "Must be no more than {max} characters" | `forms.common.validation.maxLength` |

---

## Authorized Files and Functions for Modification

### Translation Files (New Strings)

| File | Action | Scope |
|------|--------|-------|
| `/messages/en.json` | Add | `forms` namespace with all form strings |
| `/messages/fr.json` | Add | `forms` namespace (French translations) |
| `/messages/es.json` | Add | `forms` namespace (Spanish translations) |
| `/messages/de.json` | Add | `forms` namespace (German translations) |
| `/messages/nl.json` | Add | `forms` namespace (Dutch translations) |
| `/messages/it.json` | Add | `forms` namespace (Italian translations) |

### Component Files (Modify)

| File | Functions/Components to Modify |
|------|--------------------------------|
| `/src/components/LoginForm.tsx` | `LoginForm` component, `validateField`, `validateForm` |
| `/src/components/RegistrationForm.tsx` | `RegistrationForm` component, `validateField`, `validateForm` |
| `/src/components/PropertyForm.tsx` | `PropertyForm` component, `validateForm` |
| `/src/components/ItemForm.tsx` | `ItemForm` component, `validateForm` |
| `/src/components/AccessCodeInput.tsx` | `AccessCodeInput` component, validation functions |
| `/src/components/ItemManager/components/SearchInput.tsx` | `SearchInput` component |
| `/src/components/MediaManagement/AddMediaLinkForm.tsx` | `AddMediaLinkForm` component |

### Modification Pattern per Component

Each component file will require:

1. **Import Statement Addition:**
```typescript
import { useTranslations } from 'next-intl';
```

2. **Hook Initialization in Component:**
```typescript
const t = useTranslations('forms.{formName}');
const tCommon = useTranslations('forms.common');
```

3. **String Replacement Pattern:**
```typescript
// Before
<label>Email Address</label>
<input placeholder="admin@faqbnb.com" />
{errors.email && <p>{errors.email}</p>}

// After
<label>{t('labels.email')}</label>
<input placeholder={t('placeholders.email')} />
{errors.email && <p>{t(`validation.email.${errors.email}`)}</p>}
```

4. **Validation Function Updates:**
```typescript
// Before
if (!value) return 'Email is required';

// After
if (!value) return 'required'; // Return key, not full message
// Translate at display time: t(`validation.email.${error}`)
```

---

## Dependencies

### Prerequisites (Must be complete from Epic 1)

| Dependency | Source | Status |
|------------|--------|--------|
| next-intl package installed | REQ-229 | Complete |
| i18n config module | REQ-230 | Complete |
| next.config.ts integration | REQ-231 | Complete |
| IntlProvider wrapper | REQ-232 | Complete |
| Translation file structure | REQ-233 | Complete |

### Related Tasks in Sub-Epic 2H

| Task | Description | Dependency |
|------|-------------|------------|
| 2H.1 | Create common namespace structure | None |
| 2H.2 | Extract button labels | 2H.1 |
| 2H.3 | Extract modal/dialog strings | 2H.1 |
| **2H.4** | **Extract form element strings (this task)** | 2H.1, 2H.2 |
| 2H.5 | Extract toast notification messages | 2H.1 |

---

## Implementation Tasks

### Phase 1: Translation File Setup

1. **Task 1.1:** Add `forms` namespace structure to `/messages/en.json`
   - Create hierarchical structure for all 7 forms
   - Include labels, placeholders, hints, validation sub-sections
   - Include common reusable strings

2. **Task 1.2:** Propagate structure to all 5 non-English language files
   - Use English text as placeholder initially
   - Mark for translation generation in subsequent task

### Phase 2: Component Updates

3. **Task 2.1:** Update LoginForm.tsx
   - Import useTranslations hook
   - Replace all hardcoded labels, placeholders, hints
   - Update validation messages to use translation keys
   - Test form functionality

4. **Task 2.2:** Update RegistrationForm.tsx
   - Import useTranslations hook
   - Replace all hardcoded strings (45+ strings)
   - Handle password strength indicators
   - Update validation logic
   - Test registration flow

5. **Task 2.3:** Update PropertyForm.tsx
   - Import useTranslations hook
   - Replace labels, placeholders, hints
   - Update validation messages
   - Handle character count hints with interpolation

6. **Task 2.4:** Update ItemForm.tsx
   - Import useTranslations hook
   - Replace all form strings (35+ strings)
   - Handle dynamic link section translations
   - Update validation messages

7. **Task 2.5:** Update AccessCodeInput.tsx
   - Import useTranslations hook
   - Replace labels, placeholders, hints
   - Update validation feedback messages

8. **Task 2.6:** Update SearchInput.tsx
   - Import useTranslations hook
   - Replace placeholder text

9. **Task 2.7:** Update AddMediaLinkForm.tsx
   - Import useTranslations hook
   - Replace labels, placeholders, hints
   - Update validation messages

### Phase 3: Validation & Testing

10. **Task 3.1:** Verify all forms render correctly with translations
11. **Task 3.2:** Test validation messages appear in correct language
12. **Task 3.3:** Test language switching on forms
13. **Task 3.4:** Verify no hardcoded English strings remain

### Phase 4: Translation Generation

14. **Task 4.1:** Generate translations for 5 non-English languages
    - French (fr)
    - Spanish (es)
    - German (de)
    - Dutch (nl)
    - Italian (it)

---

## Acceptance Criteria

- [ ] All form components are identified and catalogued including authentication forms, profile forms, content creation forms, and admin forms
- [ ] Input field labels are extracted to translation keys following the pattern `forms.[formName].labels.[fieldName]`
- [ ] Placeholder text is extracted to translation keys following the pattern `forms.[formName].placeholders.[fieldName]`
- [ ] Helper text and hints are extracted to translation keys following the pattern `forms.[formName].hints.[fieldName]`
- [ ] Field-specific validation messages are extracted to translation keys following the pattern `forms.[formName].validation.[fieldName].[errorType]`
- [ ] Common validation messages are organized in the `forms.common.validation` namespace for reuse across forms
- [ ] Required field indicators use translation keys for consistency
- [ ] All extracted strings are added to en.json with complete English translations
- [ ] All extracted strings are propagated to other language files (de.json, es.json, fr.json, it.json, nl.json)
- [ ] Forms correctly display translated content when user switches language
- [ ] Validation messages appear in the correct language when triggered
- [ ] No hardcoded English form strings remain in any component
- [ ] Dynamic validation messages that include field values or counts use proper translation interpolation
- [ ] Forms maintain accessibility attributes with translated ARIA labels where applicable
- [ ] TypeScript types are updated to reflect the new translation key structure
- [ ] All forms function correctly with no regressions in validation logic or submission behavior

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Validation logic regression | Medium | High | Comprehensive testing after each component update |
| Missing strings discovered during implementation | Medium | Low | Track and add as discovered |
| Interpolation errors in dynamic messages | Low | Medium | Test character count hints thoroughly |
| TypeScript type mismatches | Low | Low | Update types incrementally |

---

## Estimated Effort

| Phase | Tasks | Estimated Effort |
|-------|-------|------------------|
| Phase 1: Translation Setup | 2 tasks | 2-3 hours |
| Phase 2: Component Updates | 7 tasks | 6-8 hours |
| Phase 3: Validation & Testing | 4 tasks | 2-3 hours |
| Phase 4: Translation Generation | 1 task | 1-2 hours |
| **Total** | **14 tasks** | **11-16 hours** |

---

## References

- [REQ-341 Request Details](/docs/gen_requests_epic2.md)
- [Plan-111: L10N Epic 2 - Static UI Translation](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Existing i18n Config](/src/lib/i18n/config.ts)
- [Reference Implementation: LogoutButton.tsx](/src/components/LogoutButton.tsx)
