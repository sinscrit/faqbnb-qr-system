# REQ-E02-033: Audit All Form Validation Messages Across Components - Implementation Overview

*Generated: 2026-01-20 12:30:00 UTC*
*Last Modified: 2026-01-20 12:30:00 UTC*

## Reference

- **Request**: REQ-E02-033 (Audit All Form Validation Messages Across Components)
- **Source**: docs/gen_requests_epic2.md
- **Implementation Plan**: docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md
- **Type**: Enhancement
- **Phase**: 2J (Error Messages & Validation)
- **Task ID**: 2J.2
- **Size**: M (Medium)
- **Epic**: Localization Epic 2 - Static UI Translation
- **Depends On**:
  - Epic 1 (L10N Foundation - next-intl setup)
  - Task 2J.1 (REQ-E02-032: Create Errors Namespace Structure)

## Summary

Systematically audit all form validation messages across the FAQBNB application, document their locations and patterns, and migrate them to use translation keys from the centralized `errors` namespace. This task ensures consistent, translatable validation feedback for all user-facing forms.

## Goals

1. Perform a comprehensive audit of all form validation messages across the application
2. Document each message with its location, validation rule type, and affected forms
3. Identify duplicate and near-duplicate messages for consolidation
4. Create a migration plan mapping messages to `errors` namespace keys
5. Update all validation sources to use translation functions
6. Establish consistent terminology for common validation types
7. Enable internationalized validation feedback for non-English speakers

## Context from Implementation Plan

### Existing Infrastructure (Epic 1 Foundation)

The localization foundation from Epic 1 is already in place:

| Component | Location | Status |
|-----------|----------|--------|
| next-intl package | `package.json` | Installed |
| i18n config | `/src/lib/i18n/config.ts` | Configured |
| IntlProvider | `/src/app/layout.tsx` | Integrated |
| Translation files | `/messages/*.json` | 6 languages (en, fr, es, de, nl, it) |
| useTranslations hook | next-intl | Available |

### Pre-Requisite: Errors Namespace (Task 2J.1)

This task depends on the `errors` namespace structure created in Task 2J.1 (REQ-E02-032):

```json
{
  "errors": {
    "form": { ... },
    "api": { ... },
    "network": { ... },
    "auth": { ... },
    "item": { ... },
    "property": { ... },
    "file": { ... },
    "system": { ... }
  }
}
```

### Validation Pattern Discovery

**Key Finding**: The codebase uses **custom validation functions** rather than Zod schemas. All validation is implemented using:
- React hooks with `useState` for form data and error state
- Inline validation functions with regex pattern matching
- Custom async validation (access codes)
- Manual error state management
- Real-time validation on field change

## Comprehensive Validation Message Inventory

### 1. Authentication Forms

#### `/src/components/LoginForm.tsx`

| Message | Validation Rule | Priority |
|---------|-----------------|----------|
| "Email is required" | Required field | High |
| "Please enter a valid email address" | Email format | High |
| "Password is required" | Required field | High |
| "Password must be at least 6 characters" | Min length | High |
| "Invalid email or password. Please check your credentials and try again." | Auth failure | High |
| "Access denied. Admin privileges are required." | Permission | High |
| "Authentication Failed" | Error header | High |

#### `/src/components/RegistrationForm.tsx`

| Message | Validation Rule | Priority |
|---------|-----------------|----------|
| "Email is required" | Required field | High |
| "Please enter a valid email address" | Email format | High |
| "Password is required" | Required field | High |
| "Password must be at least 8 characters" | Min length | High |
| "Password must contain at least one lowercase letter" | Pattern | High |
| "Password must contain at least one uppercase letter" | Pattern | High |
| "Password must contain at least one number" | Pattern | High |
| "Please confirm your password" | Required field | High |
| "Passwords do not match" | Match validation | High |
| "Name must be at least 2 characters" | Min length | Medium |
| "You must agree to the terms and conditions" | Checkbox required | High |
| "Registration Failed" | Error header | High |
| "Email does not match the access request" | Business logic | High |

**Password Strength Indicator Messages:**
| Message | Context |
|---------|---------|
| "Requirements:" | Header |
| "At least 8 characters" | Requirement |
| "One lowercase letter" | Requirement |
| "One uppercase letter" | Requirement |
| "One number" | Requirement |
| "One special character" | Requirement |
| "Very Weak" / "Weak" / "Fair" / "Good" / "Strong" | Strength level |
| "Passwords match" / "Passwords do not match" | Match status |

### 2. Property Forms

#### `/src/components/PropertyForm.tsx`

| Message | Validation Rule | Priority |
|---------|-----------------|----------|
| "Property nickname is required" | Required field | High |
| "Property nickname must be 100 characters or less" | Max length | Medium |
| "Property type is required" | Required field | High |
| "Address must be 500 characters or less" | Max length | Low |
| "Failed to save property. Please try again." | Submit error | High |

### 3. Item Forms

#### `/src/components/ItemForm.tsx`

| Message | Validation Rule | Priority |
|---------|-----------------|----------|
| "Public ID is required" | Required field | Medium |
| "Public ID must be a valid UUID format" | Format | Medium |
| "Name is required" | Required field | High |
| "Property selection is required" | Required field | High |
| "Please enter a valid QR code image URL" | URL format | Low |
| "Title is required" (for links) | Required field | High |
| "URL is required" (for links) | Required field | High |
| "Please enter a valid URL" | URL format | High |
| "Please enter a valid thumbnail URL" | URL format | Low |
| "Please fill in both title and URL before testing the link." | Complete fields | Medium |

### 4. Item Capture Validation

#### `/src/components/ItemCapture/utils/validation.ts`

| Message | Validation Rule | Priority |
|---------|-----------------|----------|
| "Title is required" | Required field | High |
| "Title must be {max} characters or less (current: {current})" | Max length | High |
| "At least one media item, link, or text instructions must be provided" | Content required | High |
| "File exceeds {max} limit (current: {current})" | File size | High |
| "Total upload size ({total}) exceeds {max} limit" | Total size | High |
| "Instructions exceed {max} character limit (current: {current})" | Max length | Medium |
| "URL is required" | Required field | High |
| "URL exceeds {max} character limit" | Max length | Medium |
| "Only http and https URLs are allowed" | Protocol | High |
| "Invalid URL format" | Format | High |
| "Maximum {max} links allowed (current: {current})" | Count limit | Medium |
| "Maximum {max} photos allowed (current: {current})" | Count limit | Medium |
| "File type '{mimeType}' is not supported for {mediaType}" | File type | High |

### 5. Access Code Validation

#### `/src/lib/access-validation.ts`

| Message | Validation Rule | Priority |
|---------|-----------------|----------|
| "Access code validation failed" | Generic | High |
| "Email does not match the access request" | Business logic | High |
| "This access code has already been used for registration" | Already used | High |
| "Access code is not approved for registration" | Status check | High |
| "Internal error during validation" | System | Medium |
| "Access code is required" | Required field | High |
| "Access code must be a string" | Type check | Low |
| "Access code must be 12 characters long" | Length | High |
| "Access code must contain only uppercase letters and numbers" | Pattern | High |
| "Email is required" | Required field | High |
| "Email must be a string" | Type check | Low |
| "Invalid email format" | Format | High |

### 6. API Route Validation

#### `/src/app/api/auth/register/route.ts`

| Message | Validation Rule | Priority |
|---------|-----------------|----------|
| "Too many registration attempts. Please try again in 15 minutes." | Rate limit | High |
| "Invalid request body" | Parse error | Medium |
| "Email and password are required" | Required fields | High |
| "Invalid access code" | Validation failure | High |
| "Please enter a valid email address" | Email format | High |
| "Password must be at least 8 characters long and contain at least one letter and one number" | Password pattern | High |
| "Passwords do not match" | Match validation | High |

#### `/src/app/api/auth/validate-code/route.ts`

| Message | Validation Rule | Priority |
|---------|-----------------|----------|
| "Too many validation attempts. Please try again later." | Rate limit | High |
| "Both code and email parameters are required" | Required fields | High |
| "Invalid access code format" | Format | High |
| "Invalid email format" | Format | High |

#### `/src/app/api/url-metadata/route.ts`

| Message | Validation Rule | Priority |
|---------|-----------------|----------|
| "URL is required" | Required field | High |
| "URL exceeds {max} character limit" | Max length | Medium |
| "Blocked protocol: {protocol}" | Security | High |
| "Only http and https URLs are allowed" | Protocol | High |
| "Local and private IP addresses are not allowed" | Security | High |
| "Invalid URL format" | Format | High |

### 7. Error Translation Utility

#### `/src/lib/error-utils.ts`

| Message | Error Type | Priority |
|---------|------------|----------|
| "Email does not match the access request" | Business | High |
| "User already registered - please try logging in instead" | Conflict | High |
| "Invalid access code - please check your invitation" | Validation | High |
| "Connection error - please check your internet and try again" | Network | High |
| "OAuth session expired - please sign in with Google again" | Auth | High |
| "OAuth registration conflict - account may already exist" | Conflict | High |
| "OAuth authentication failed - please try again" | Auth | High |
| "Something went wrong - please try again" | Generic | High |

## Message Consolidation Analysis

### Duplicate Messages to Consolidate

| Duplicate Message | Locations | Consolidated Key |
|-------------------|-----------|------------------|
| "Email is required" | LoginForm, RegistrationForm, access-validation | `errors.form.email.required` |
| "Please enter a valid email address" | LoginForm, RegistrationForm, API routes | `errors.form.email.invalid` |
| "Password is required" | LoginForm, RegistrationForm | `errors.form.password.required` |
| "Passwords do not match" | RegistrationForm, API routes | `errors.form.password.mismatch` |
| "URL is required" | ItemForm, validation.ts | `errors.form.url.required` |
| "Invalid URL format" | ItemForm, validation.ts, API routes | `errors.form.url.invalid` |
| "Title is required" | ItemForm, validation.ts | `errors.form.title.required` |

### Near-Duplicates to Standardize

| Variant Messages | Standardized Form | Key |
|------------------|-------------------|-----|
| "Password must be at least 6 characters" (login) / "Password must be at least 8 characters" (register) | "Password must be at least {min} characters" | `errors.form.password.tooShort` |
| "Email does not match the access request" (multiple) | Keep as-is (specific business logic) | `errors.auth.emailMismatch` |

## Implementation Order

### Phase 1: Audit Documentation (This Task - Research)

1. **Step 1.1**: Document all validation messages in forms
2. **Step 1.2**: Document all validation messages in utilities
3. **Step 1.3**: Document all validation messages in API routes
4. **Step 1.4**: Identify duplicates and consolidation opportunities
5. **Step 1.5**: Create migration mapping to `errors` namespace keys

### Phase 2: Client Component Migration

1. **Step 2.1**: Update `/src/components/LoginForm.tsx`
2. **Step 2.2**: Update `/src/components/RegistrationForm.tsx`
3. **Step 2.3**: Update `/src/components/PropertyForm.tsx`
4. **Step 2.4**: Update `/src/components/ItemForm.tsx`

### Phase 3: Utility Function Migration

1. **Step 3.1**: Update `/src/components/ItemCapture/utils/validation.ts`
2. **Step 3.2**: Update `/src/lib/access-validation.ts`
3. **Step 3.3**: Update `/src/lib/error-utils.ts`

### Phase 4: API Route Migration

1. **Step 4.1**: Update `/src/app/api/auth/register/route.ts`
2. **Step 4.2**: Update `/src/app/api/auth/validate-code/route.ts`
3. **Step 4.3**: Update `/src/app/api/url-metadata/route.ts`

### Phase 5: Verification

1. **Step 5.1**: Test all forms display localized validation
2. **Step 5.2**: Verify no hardcoded strings remain
3. **Step 5.3**: Test language switching for validation messages

## Authorized Files and Functions for Modification

### Files to Modify

#### Client Components

##### `/src/components/LoginForm.tsx`

- **Purpose**: Login form with email/password validation
- **Current State**: Inline validation with hardcoded English messages
- **Modification Required**: Import `useTranslations`, replace hardcoded strings
- **Functions to Modify**:
  - Form validation logic (email regex check)
  - Password validation
  - Error message display
- **Estimated Strings**: 7

##### `/src/components/RegistrationForm.tsx`

- **Purpose**: Registration form with comprehensive validation
- **Current State**: Complex inline validation with password strength indicator
- **Modification Required**: Import `useTranslations`, replace all hardcoded strings
- **Functions to Modify**:
  - Email validation
  - Password validation and strength checking
  - Password match validation
  - Terms agreement validation
  - Error display components
- **Estimated Strings**: 25+

##### `/src/components/PropertyForm.tsx`

- **Purpose**: Property creation/editing form
- **Current State**: Inline validation with hardcoded messages
- **Modification Required**: Import `useTranslations`, update validation messages
- **Functions to Modify**:
  - Property nickname validation
  - Property type validation
  - Address validation
  - Form submission error handling
- **Estimated Strings**: 5

##### `/src/components/ItemForm.tsx`

- **Purpose**: Item creation/editing form with links
- **Current State**: Inline validation with hardcoded messages
- **Modification Required**: Import `useTranslations`, update validation messages
- **Functions to Modify**:
  - Name validation
  - Property selection validation
  - Link URL/title validation
  - UUID format validation
- **Estimated Strings**: 10

#### Utility Files

##### `/src/components/ItemCapture/utils/validation.ts`

- **Purpose**: Comprehensive validation utilities for item capture
- **Current State**: Pure functions returning hardcoded error strings
- **Modification Required**: Accept translation function as parameter OR create wrapper
- **Functions to Modify**:
  - `validateTitle()`
  - `validateContentRequirement()`
  - `validateFileSize()`
  - `validateTotalSize()`
  - `validateTextLength()`
  - `validateUrl()`
  - `validateUrlCount()`
  - `validateImageCount()`
  - `validateMimeType()`
- **Estimated Strings**: 12
- **Note**: These are pure functions; may need architecture decision on how to inject translations

##### `/src/lib/access-validation.ts`

- **Purpose**: Access code validation for registration
- **Current State**: Server-side validation with hardcoded messages
- **Modification Required**: Consider server-side translation approach
- **Functions to Modify**:
  - `validateAccessCodeForRegistration()`
  - `validateAccessCodeFormat()`
  - `validateEmailFormat()`
- **Estimated Strings**: 12
- **Note**: Server-side file; may use `getTranslations` from next-intl/server

##### `/src/lib/error-utils.ts`

- **Purpose**: Error translation utility
- **Current State**: Centralized error message mapping
- **Modification Required**: Replace hardcoded messages with translation calls
- **Functions to Modify**:
  - `translateErrorMessage()`
  - Error message constants
- **Estimated Strings**: 8

#### API Routes

##### `/src/app/api/auth/register/route.ts`

- **Purpose**: Registration API endpoint
- **Current State**: Validation messages hardcoded in response
- **Modification Required**: Use server-side translations
- **Functions to Modify**:
  - Request validation
  - Error response generation
- **Estimated Strings**: 7

##### `/src/app/api/auth/validate-code/route.ts`

- **Purpose**: Access code validation API
- **Current State**: Hardcoded validation messages
- **Modification Required**: Use server-side translations
- **Functions to Modify**:
  - Parameter validation
  - Error response generation
- **Estimated Strings**: 4

##### `/src/app/api/url-metadata/route.ts`

- **Purpose**: URL metadata fetching with validation
- **Current State**: Security-focused validation messages
- **Modification Required**: Use server-side translations
- **Functions to Modify**:
  - URL validation
  - Protocol checking
  - Error response generation
- **Estimated Strings**: 6

### Files to Update (Translation Files)

#### `/messages/en.json`

- **Purpose**: English source translations
- **Modification Required**: Ensure all form validation keys exist in `errors.form` namespace
- **Keys to Verify/Add**:
  - `errors.form.required`
  - `errors.form.email.required`
  - `errors.form.email.invalid`
  - `errors.form.password.required`
  - `errors.form.password.tooShort`
  - `errors.form.password.tooWeak`
  - `errors.form.password.mismatch`
  - `errors.form.password.noLowercase`
  - `errors.form.password.noUppercase`
  - `errors.form.password.noNumber`
  - `errors.form.password.noSpecial`
  - `errors.form.url.required`
  - `errors.form.url.invalid`
  - `errors.form.url.tooLong`
  - `errors.form.url.blockedProtocol`
  - `errors.form.title.required`
  - `errors.form.title.tooLong`
  - `errors.form.maxLength`
  - `errors.form.minLength`
  - `errors.form.termsRequired`
  - `errors.form.content.required`
  - `errors.file.tooLarge`
  - `errors.file.totalTooLarge`
  - `errors.file.invalidType`
  - `errors.file.countExceeded`
  - `errors.auth.emailMismatch`
  - `errors.auth.accessCodeUsed`
  - `errors.auth.accessCodeNotApproved`
  - `errors.auth.accessCodeFormat`
  - `errors.system.rateLimit`

### Files NOT to Modify

- `/src/lib/i18n/config.ts` - No changes needed
- `/src/lib/i18n/index.ts` - No changes needed
- `/src/app/layout.tsx` - IntlProvider already configured
- `/src/types/index.ts` - Error codes remain unchanged (separate from messages)
- Zod schemas - Not present in this codebase
- React Hook Form configs - Not used in this codebase

## Technical Specifications

### Client Component Pattern

```typescript
'use client';
import { useTranslations } from 'next-intl';

function LoginForm() {
  const t = useTranslations('errors.form');

  const validateEmail = (email: string): string | null => {
    if (!email) return t('email.required');
    if (!emailRegex.test(email)) return t('email.invalid');
    return null;
  };

  const validatePassword = (password: string): string | null => {
    if (!password) return t('password.required');
    if (password.length < 6) return t('password.tooShort', { min: 6 });
    return null;
  };
}
```

### Server Component / API Route Pattern

```typescript
import { getTranslations } from 'next-intl/server';

export async function POST(request: Request) {
  const t = await getTranslations('errors');

  if (!email) {
    return NextResponse.json(
      { error: t('form.email.required') },
      { status: 400 }
    );
  }
}
```

### Pure Validation Function Pattern

For utility files with pure validation functions, create a wrapper hook:

```typescript
// /src/hooks/useValidationMessages.ts
'use client';
import { useTranslations } from 'next-intl';

export function useValidationMessages() {
  const t = useTranslations('errors');

  return {
    titleRequired: t('form.title.required'),
    titleTooLong: (max: number, current: number) =>
      t('form.title.tooLong', { max, current }),
    fileTooLarge: (max: string, current: string) =>
      t('file.tooLarge', { max, current }),
    // ... other messages
  };
}
```

Then in components:

```typescript
function ItemCaptureForm() {
  const messages = useValidationMessages();

  const validation = validateItemCapture(metadata, mediaItems, urlItems, instructions);

  // Map validation results to translated messages
  const displayError = validation.errors.title
    ? messages.titleRequired
    : null;
}
```

### Alternative: Translation Key Return Pattern

Modify validation functions to return translation keys instead of strings:

```typescript
// Before
export function validateTitle(title: string): ValidationResult {
  if (trimmedTitle.length === 0) {
    return { isValid: false, error: 'Title is required' };
  }
}

// After
export function validateTitle(title: string): ValidationResult {
  if (trimmedTitle.length === 0) {
    return {
      isValid: false,
      errorKey: 'form.title.required',
      errorParams: {}
    };
  }
}
```

## Migration Mapping

### Form Validation Messages → errors.form

| Current Message | Translation Key |
|-----------------|-----------------|
| "Email is required" | `errors.form.email.required` |
| "Please enter a valid email address" | `errors.form.email.invalid` |
| "Password is required" | `errors.form.password.required` |
| "Password must be at least {N} characters" | `errors.form.password.tooShort` |
| "Password must contain at least one lowercase letter" | `errors.form.password.noLowercase` |
| "Password must contain at least one uppercase letter" | `errors.form.password.noUppercase` |
| "Password must contain at least one number" | `errors.form.password.noNumber` |
| "Passwords do not match" | `errors.form.password.mismatch` |
| "Name must be at least 2 characters" | `errors.form.minLength` |
| "You must agree to the terms and conditions" | `errors.form.termsRequired` |
| "Title is required" | `errors.form.title.required` |
| "Title must be X characters or less" | `errors.form.title.tooLong` |
| "URL is required" | `errors.form.url.required` |
| "Invalid URL format" | `errors.form.url.invalid` |
| "URL exceeds X character limit" | `errors.form.url.tooLong` |
| "Only http and https URLs are allowed" | `errors.form.url.protocolNotAllowed` |
| "Property nickname is required" | `errors.form.propertyName.required` |
| "Property type is required" | `errors.form.propertyType.required` |
| "At least one media item, link, or text instructions must be provided" | `errors.form.content.required` |

### File Validation Messages → errors.file

| Current Message | Translation Key |
|-----------------|-----------------|
| "File exceeds X limit" | `errors.file.tooLarge` |
| "Total upload size exceeds X limit" | `errors.file.totalTooLarge` |
| "File type 'X' is not supported for Y" | `errors.file.invalidType` |
| "Maximum X links allowed" | `errors.file.linkCountExceeded` |
| "Maximum X photos allowed" | `errors.file.photoCountExceeded` |

### Auth Validation Messages → errors.auth

| Current Message | Translation Key |
|-----------------|-----------------|
| "Invalid email or password" | `errors.auth.invalidCredentials` |
| "Access denied. Admin privileges required." | `errors.auth.accessDenied` |
| "Email does not match the access request" | `errors.auth.emailMismatch` |
| "This access code has already been used" | `errors.auth.accessCodeUsed` |
| "Access code is not approved for registration" | `errors.auth.accessCodeNotApproved` |
| "Access code must be 12 characters long" | `errors.auth.accessCodeLength` |
| "Access code must contain only uppercase letters and numbers" | `errors.auth.accessCodeFormat` |

### System Messages → errors.system

| Current Message | Translation Key |
|-----------------|-----------------|
| "Too many registration attempts. Please try again in 15 minutes." | `errors.system.rateLimitRegistration` |
| "Too many validation attempts. Please try again later." | `errors.system.rateLimitValidation` |
| "Something went wrong - please try again" | `errors.system.genericError` |
| "Internal error during validation" | `errors.system.internalError` |

## Success Validation Checklist

### Audit Completeness

- [ ] All authentication forms audited (login, registration)
- [ ] All property management forms audited
- [ ] All item creation workflow forms audited
- [ ] All article/media forms audited
- [ ] All settings/preferences forms audited
- [ ] All access request forms audited
- [ ] All API route validations audited

### Migration Completeness

- [ ] All validation messages in `/src/components/LoginForm.tsx` migrated
- [ ] All validation messages in `/src/components/RegistrationForm.tsx` migrated
- [ ] All validation messages in `/src/components/PropertyForm.tsx` migrated
- [ ] All validation messages in `/src/components/ItemForm.tsx` migrated
- [ ] All validation messages in `/src/components/ItemCapture/utils/validation.ts` migrated
- [ ] All validation messages in `/src/lib/access-validation.ts` migrated
- [ ] All validation messages in `/src/lib/error-utils.ts` migrated
- [ ] All validation messages in API routes migrated

### Functionality Verification

- [ ] Login form shows localized validation errors
- [ ] Registration form shows localized validation errors
- [ ] Password strength indicator shows localized messages
- [ ] Property form shows localized validation errors
- [ ] Item form shows localized validation errors
- [ ] File upload validation shows localized errors
- [ ] API responses return localized error messages
- [ ] Language switching updates validation messages

### Code Quality

- [ ] No hardcoded validation strings remain in modified files
- [ ] Variable interpolation works correctly ({min}, {max}, {current})
- [ ] Consistent use of translation hooks across components
- [ ] Application builds without errors
- [ ] All tests pass (if applicable)

## Estimated String Count

| Category | Count |
|----------|-------|
| Authentication Forms | ~32 |
| Property Forms | ~5 |
| Item Forms | ~10 |
| Item Capture Validation | ~12 |
| Access Code Validation | ~12 |
| Error Utilities | ~8 |
| API Routes | ~17 |
| **Total** | **~96** |

After consolidation of duplicates: **~60-70 unique strings**

## Risk Assessment

- **Risk Level**: Medium
- **Rationale**:
  - Multiple files across different areas of the application
  - Mix of client and server components require different translation approaches
  - Pure validation functions need architecture decision
  - High-traffic authentication flows must remain functional

### Potential Issues

| Issue | Likelihood | Impact | Mitigation |
|-------|------------|--------|------------|
| Breaking validation logic | Low | High | Test all forms thoroughly after changes |
| Missing translation keys | Medium | Medium | Verify all keys exist before deployment |
| Server component translation issues | Medium | Medium | Test API routes with different locales |
| Performance impact from translation lookups | Low | Low | Translations are lightweight lookups |
| Pure function architecture change | Medium | Medium | Consider wrapper hooks vs key return patterns |

## Dependencies

### Required (Already Installed)

- `next-intl` - i18n framework (installed in Epic 1)
- TypeScript 5.x - Type checking

### No New Dependencies Required

This task only modifies existing component files and translation files.

## Future Integration Points

This audit and migration will be consumed by:

1. **Task 2J.3**: API error handling updates (builds on API route patterns here)
2. **Task 2J.4**: Centralized error message utility (extends error-utils.ts patterns)
3. **Task 2J.5**: Zod schema updates (not applicable - no Zod in codebase)
4. **Task 2J.6**: Error boundary translations
5. **Task 2J.7**: Generate translations for 5 non-English languages

## Notes

### Alignment with Plan-111

This implementation follows the structure specified in Plan-111, Section "Sub-Epic 2J: Error Messages & Validation", Task 2J.2.

### No Zod Schemas Found

Contrary to the implementation plan's assumption about Zod schemas, this codebase uses:
- Custom inline validation functions
- Regex pattern matching
- Manual error state management

This simplifies the migration in some ways (no Zod error maps to configure) but requires updating validation functions directly.

### Password Strength Indicator

The RegistrationForm has a complex password strength indicator with 5+ levels and multiple requirement messages. These should be migrated to:

```json
{
  "auth": {
    "register": {
      "passwordStrength": {
        "label": "Password strength:",
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
      }
    }
  }
}
```

### Recommended Architecture Decision

For pure validation functions in `/src/components/ItemCapture/utils/validation.ts`:

**Recommended Approach**: Create a wrapper hook that maps validation results to translated messages, rather than modifying the pure functions themselves. This:
- Preserves testability of pure validation logic
- Keeps validation utilities framework-agnostic
- Centralizes translation logic in one place

---

*End of Implementation Overview*
