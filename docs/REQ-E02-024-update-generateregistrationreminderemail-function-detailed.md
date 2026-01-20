# REQ-E02-024: Update `generateRegistrationReminderEmail` Function - Detailed Task Breakdown

*Generated: 2026-01-20 03:45:00 UTC*
*Last Modified: 2026-01-20 03:45:00 UTC*

## Reference

- **Request**: REQ-E02-024 (Update generateRegistrationReminderEmail Function for Localization)
- **Overview Document**: docs/REQ-E02-024-update-generateregistrationreminderemail-function-overview.md
- **Requirements Source**: docs/gen_requests_epic2.md (Request #24)
- **Implementation Plan**: docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md
- **Type**: Enhancement
- **Phase**: 2I (Email Templates)
- **Task ID**: 2I.6
- **Size**: S (Small)
- **Epic**: Localization Epic 2 - Static UI Translation
- **Depends On**:
  - Epic 1 (L10N Foundation - next-intl setup)
  - REQ-E02-019 (Task 2I.1 - Emails Namespace Structure)
  - REQ-E02-020 (Task 2I.2 - Email Translation Utility Function)

---

## Executive Summary

This document provides granular, implementation-ready tasks to update the `generateRegistrationReminderEmail` function in `/src/lib/email-templates.ts` to support multiple languages. The function currently generates registration reminder emails with hardcoded English strings. After implementation, the function will accept a language parameter and use the `getEmailTranslation` utility to render content in any of the 6 supported languages.

**Current State**: Function at lines 351-396 generates English-only emails
**Target State**: Function supports all 6 languages (en, fr, es, de, nl, it) with fallback to English

---

## Prerequisites Checklist

Before starting implementation, verify these dependencies are complete:

- [ ] **Epic 1 Complete**: next-intl installed and configured
- [ ] **Task 2I.1 Complete**: `/messages/*.json` files contain `emails.registrationReminder` namespace
- [ ] **Task 2I.2 Complete**: `getEmailTranslation` utility exists at `/src/lib/l10n/emails/email-translations.ts`
- [ ] **SupportedLanguage Type Available**: Type exists at `/src/lib/translation-service/translation-service.types.ts`

---

## Task Breakdown

### Task 1: Verify Prerequisites and Review Dependencies

**Objective**: Confirm all required dependencies exist and understand their interfaces

**Estimated Effort**: 10 minutes

**Steps**:

1.1. **Verify email translation utility exists**
```bash
# Check if the utility file exists
ls -la /src/lib/l10n/emails/email-translations.ts
```

1.2. **Verify translation keys exist in English messages file**
```bash
# Check for registrationReminder namespace in en.json
grep -n "registrationReminder" /messages/en.json
```

1.3. **Review getEmailTranslation function signature**
- Read `/src/lib/l10n/emails/email-translations.ts`
- Note the function parameters: `(key: string, language: SupportedLanguage, variables?: Record<string, string | number>)`
- Note the fallback behavior: returns English if translation unavailable

1.4. **Review SupportedLanguage type definition**
- Read `/src/lib/translation-service/translation-service.types.ts`
- Confirm `DEFAULT_LANGUAGE` constant exists and equals `'en'`
- Confirm type includes: `'en' | 'fr' | 'es' | 'de' | 'nl' | 'it'`

**Acceptance Criteria**:
- [ ] `getEmailTranslation` function exists and is importable
- [ ] `registrationReminder` namespace exists in `/messages/en.json`
- [ ] `SupportedLanguage` type is available
- [ ] `DEFAULT_LANGUAGE` constant is available

---

### Task 2: Add Required Imports

**Objective**: Add the necessary imports to `/src/lib/email-templates.ts`

**Estimated Effort**: 5 minutes

**File**: `/src/lib/email-templates.ts`
**Location**: Top of file (lines 1-3)

**Steps**:

2.1. **Check existing imports** (line 1-3)
```typescript
// Current imports
import { AccessRequest, EmailTemplate, AccessRequestSource } from '@/types/admin';
import { getServerBaseUrl } from './config';
```

2.2. **Add email translation utility import**

If not already present from earlier tasks (2I.3, 2I.4, 2I.5), add:
```typescript
import { getEmailTranslation } from '@/lib/l10n/emails';
```

2.3. **Add SupportedLanguage type import**

If not already present from earlier tasks, add:
```typescript
import { SupportedLanguage, DEFAULT_LANGUAGE } from '@/lib/translation-service/translation-service.types';
```

**Final imports should look like**:
```typescript
import { AccessRequest, EmailTemplate, AccessRequestSource } from '@/types/admin';
import { getServerBaseUrl } from './config';
import { getEmailTranslation } from '@/lib/l10n/emails';
import { SupportedLanguage, DEFAULT_LANGUAGE } from '@/lib/translation-service/translation-service.types';
```

**Acceptance Criteria**:
- [ ] `getEmailTranslation` is imported
- [ ] `SupportedLanguage` type is imported
- [ ] `DEFAULT_LANGUAGE` constant is imported
- [ ] No TypeScript import errors

---

### Task 3: Update Function Signature

**Objective**: Add optional `language` parameter to the function signature

**Estimated Effort**: 5 minutes

**File**: `/src/lib/email-templates.ts`
**Location**: Lines 343-357 (function declaration)

**Steps**:

3.1. **Update JSDoc comment** (lines 343-350)

Replace:
```typescript
/**
 * Generate reminder email for pending registration
 * @param request - Access request data
 * @param accessCode - Generated access code
 * @param daysSinceApproval - Number of days since approval
 * @param accountName - Optional account name
 * @param baseUrl - Optional base URL for links (defaults to getServerBaseUrl())
 */
```

With:
```typescript
/**
 * Generate reminder email for pending registration
 * @param request - Access request data
 * @param accessCode - Generated access code
 * @param daysSinceApproval - Number of days since approval
 * @param accountName - Optional account name
 * @param baseUrl - Optional base URL for links (defaults to getServerBaseUrl())
 * @param language - Optional language for email content (defaults to English)
 */
```

3.2. **Update function signature** (lines 351-357)

Replace:
```typescript
export function generateRegistrationReminderEmail(
  request: AccessRequest,
  accessCode: string,
  daysSinceApproval: number,
  accountName?: string,
  baseUrl?: string
): EmailTemplate {
```

With:
```typescript
export function generateRegistrationReminderEmail(
  request: AccessRequest,
  accessCode: string,
  daysSinceApproval: number,
  accountName?: string,
  baseUrl?: string,
  language: SupportedLanguage = DEFAULT_LANGUAGE
): EmailTemplate {
```

**Acceptance Criteria**:
- [ ] Function signature includes `language: SupportedLanguage = DEFAULT_LANGUAGE` parameter
- [ ] JSDoc includes `@param language` documentation
- [ ] TypeScript compiles without errors
- [ ] Backward compatibility maintained (existing calls work without language parameter)

---

### Task 4: Create Translation Variables Object

**Objective**: Create variables object for translation interpolation

**Estimated Effort**: 5 minutes

**File**: `/src/lib/email-templates.ts`
**Location**: Inside function, after existing variable declarations (after line 361)

**Steps**:

4.1. **Identify current variable declarations** (lines 358-361)
```typescript
const requesterName = request.requester_name || 'there';
const accountDisplayName = accountName || 'Account';
const registrationLink = createRegistrationLink(baseUrl);
const directRegistrationLink = createRegistrationLinkWithCode(accessCode, request.requester_email, baseUrl);
```

4.2. **Add translation variables object** (after line 361)

Add the following code:
```typescript
// Variables for translation interpolation
const emailVariables = {
  name: requesterName,
  accountName: accountDisplayName,
  accessCode,
  days: daysSinceApproval.toString(),
  directLink: directRegistrationLink,
  registrationLink,
};
```

**Acceptance Criteria**:
- [ ] `emailVariables` object created with all required variables
- [ ] `days` is converted to string for interpolation
- [ ] All variables match translation key placeholders

---

### Task 5: Create Translation Helper Functions

**Objective**: Create local helper functions for cleaner translation calls

**Estimated Effort**: 5 minutes

**File**: `/src/lib/email-templates.ts`
**Location**: Inside function, after `emailVariables` declaration

**Steps**:

5.1. **Add translation helper functions**

Add the following code after the `emailVariables` declaration:
```typescript
// Translation helpers for this email type
const t = (key: string) => getEmailTranslation(key, language, emailVariables);
const tCommon = (key: string) => getEmailTranslation(`common.${key}`, language, emailVariables);
```

**Note**: These helpers:
- `t()` - Translates registration reminder specific keys
- `tCommon()` - Translates common email elements (greeting, footer, etc.)

**Acceptance Criteria**:
- [ ] `t` helper function created for email-specific translations
- [ ] `tCommon` helper function created for common translations
- [ ] Both helpers pass `language` and `emailVariables` to `getEmailTranslation`

---

### Task 6: Replace Subject Line

**Objective**: Replace hardcoded subject line with translated version

**Estimated Effort**: 5 minutes

**File**: `/src/lib/email-templates.ts`
**Location**: Return statement, `subject` property (line 364)

**Steps**:

6.1. **Identify current subject line**
```typescript
subject: `Reminder: Complete Your ${accountDisplayName} Access Setup`,
```

6.2. **Replace with translation call**
```typescript
subject: t('registrationReminder.subject'),
```

**Translation Key Required** (`/messages/en.json`):
```json
{
  "emails": {
    "registrationReminder": {
      "subject": "Reminder: Complete Your {accountName} Access Setup"
    }
  }
}
```

**Acceptance Criteria**:
- [ ] Subject line uses `t('registrationReminder.subject')`
- [ ] Translation key includes `{accountName}` placeholder
- [ ] English output matches original: "Reminder: Complete Your [AccountName] Access Setup"

---

### Task 7: Replace Email Body Content

**Objective**: Replace all hardcoded body strings with translated versions

**Estimated Effort**: 15 minutes

**File**: `/src/lib/email-templates.ts`
**Location**: Return statement, `body` property (lines 365-386)

**Steps**:

7.1. **Review current body structure** (lines 365-386)

Current content sections:
1. Greeting: "Hello {name},"
2. Intro: Reminder message with days count
3. Access code display
4. Instructions heading
5. Step 1: Direct link instruction
6. Step 1 note: Convenience explanation
7. Step 2: Complete registration
8. Alternative option
9. Motivation message
10. Opt-out message
11. Regards
12. Team name
13. Separator
14. Footer

7.2. **Replace body with translation calls**

Replace the entire body template (lines 365-386):

**BEFORE**:
```typescript
body: `Hello ${requesterName},

This is a friendly reminder that your access to "${accountDisplayName}" was approved ${daysSinceApproval} days ago, but you haven't completed your registration yet.

Your Access Code: ${accessCode}

To complete your access setup:
1. Click this direct registration link: ${directRegistrationLink}
   (This link pre-fills your access code and email for convenience)
2. Complete your account registration

Alternative: Visit ${registrationLink} and enter your access code: ${accessCode}

Your access code will remain valid, but completing your registration will allow you to start exploring the account's items and resources.

If you no longer need access or have any questions, please let us know.

Best regards,
The FAQBNB Team

---
This is an automated message. Please do not reply to this email.`,
```

**AFTER**:
```typescript
body: `${tCommon('greeting')}

${t('registrationReminder.intro')}

${t('registrationReminder.accessCodeLabel')}

${t('registrationReminder.instructionsHeading')}
1. ${t('registrationReminder.step1')}
   ${t('registrationReminder.step1Note')}
2. ${t('registrationReminder.step2')}

${t('registrationReminder.alternative')}

${t('registrationReminder.motivation')}

${t('registrationReminder.optOut')}

${tCommon('regards')}
${tCommon('team')}

${tCommon('separator')}
${tCommon('footer')}`,
```

**Translation Keys Required** (`/messages/en.json`):
```json
{
  "emails": {
    "common": {
      "greeting": "Hello {name},",
      "regards": "Best regards,",
      "team": "The FAQBNB Team",
      "separator": "---",
      "footer": "This is an automated message. Please do not reply to this email."
    },
    "registrationReminder": {
      "subject": "Reminder: Complete Your {accountName} Access Setup",
      "intro": "This is a friendly reminder that your access to \"{accountName}\" was approved {days} days ago, but you haven't completed your registration yet.",
      "accessCodeLabel": "Your Access Code: {accessCode}",
      "instructionsHeading": "To complete your access setup:",
      "step1": "Click this direct registration link: {directLink}",
      "step1Note": "(This link pre-fills your access code and email for convenience)",
      "step2": "Complete your account registration",
      "alternative": "Alternative: Visit {registrationLink} and enter your access code: {accessCode}",
      "motivation": "Your access code will remain valid, but completing your registration will allow you to start exploring the account's items and resources.",
      "optOut": "If you no longer need access or have any questions, please let us know."
    }
  }
}
```

**Acceptance Criteria**:
- [ ] All hardcoded strings replaced with translation calls
- [ ] Email body structure preserved (paragraphs, numbered steps)
- [ ] All placeholders properly interpolated
- [ ] English output matches original content exactly

---

### Task 8: Preserve Variables Object (No Changes Needed)

**Objective**: Ensure the `variables` property in the return value remains unchanged

**Estimated Effort**: 2 minutes

**File**: `/src/lib/email-templates.ts`
**Location**: Return statement, `variables` property (lines 387-394)

**Steps**:

8.1. **Verify variables object remains unchanged**

The current variables object should stay as-is for backward compatibility:
```typescript
variables: {
  requesterName,
  accountName: accountDisplayName,
  accessCode,
  daysSinceApproval: daysSinceApproval.toString(),
  registrationLink,
  directRegistrationLink
}
```

**Note**: The `variables` object is used by external systems for additional processing. Do not modify this structure.

**Acceptance Criteria**:
- [ ] Variables object structure unchanged
- [ ] `daysSinceApproval` remains as string in variables
- [ ] All existing variable names preserved

---

### Task 9: Verify Complete Function Implementation

**Objective**: Review the complete updated function

**Estimated Effort**: 5 minutes

**Complete Updated Function**:

```typescript
/**
 * Generate reminder email for pending registration
 * @param request - Access request data
 * @param accessCode - Generated access code
 * @param daysSinceApproval - Number of days since approval
 * @param accountName - Optional account name
 * @param baseUrl - Optional base URL for links (defaults to getServerBaseUrl())
 * @param language - Optional language for email content (defaults to English)
 */
export function generateRegistrationReminderEmail(
  request: AccessRequest,
  accessCode: string,
  daysSinceApproval: number,
  accountName?: string,
  baseUrl?: string,
  language: SupportedLanguage = DEFAULT_LANGUAGE
): EmailTemplate {
  const requesterName = request.requester_name || 'there';
  const accountDisplayName = accountName || 'Account';
  const registrationLink = createRegistrationLink(baseUrl);
  const directRegistrationLink = createRegistrationLinkWithCode(accessCode, request.requester_email, baseUrl);

  // Variables for translation interpolation
  const emailVariables = {
    name: requesterName,
    accountName: accountDisplayName,
    accessCode,
    days: daysSinceApproval.toString(),
    directLink: directRegistrationLink,
    registrationLink,
  };

  // Translation helpers for this email type
  const t = (key: string) => getEmailTranslation(key, language, emailVariables);
  const tCommon = (key: string) => getEmailTranslation(`common.${key}`, language, emailVariables);

  return {
    subject: t('registrationReminder.subject'),
    body: `${tCommon('greeting')}

${t('registrationReminder.intro')}

${t('registrationReminder.accessCodeLabel')}

${t('registrationReminder.instructionsHeading')}
1. ${t('registrationReminder.step1')}
   ${t('registrationReminder.step1Note')}
2. ${t('registrationReminder.step2')}

${t('registrationReminder.alternative')}

${t('registrationReminder.motivation')}

${t('registrationReminder.optOut')}

${tCommon('regards')}
${tCommon('team')}

${tCommon('separator')}
${tCommon('footer')}`,
    variables: {
      requesterName,
      accountName: accountDisplayName,
      accessCode,
      daysSinceApproval: daysSinceApproval.toString(),
      registrationLink,
      directRegistrationLink
    }
  };
}
```

**Acceptance Criteria**:
- [ ] Function compiles without TypeScript errors
- [ ] All translation calls use correct key paths
- [ ] Variables object structure unchanged
- [ ] Return type remains `EmailTemplate`

---

### Task 10: Build and Type Check

**Objective**: Verify the application builds without errors

**Estimated Effort**: 5 minutes

**Steps**:

10.1. **Run TypeScript type checking**
```bash
npx tsc --noEmit
```

10.2. **Run Next.js build**
```bash
npm run build
```

10.3. **Fix any errors**
- Resolve import path issues
- Fix type mismatches
- Address missing translations

**Acceptance Criteria**:
- [ ] TypeScript type checking passes
- [ ] Next.js build succeeds
- [ ] No circular import issues
- [ ] No runtime errors in development

---

### Task 11: Test English Output

**Objective**: Verify English email output matches original exactly

**Estimated Effort**: 10 minutes

**Steps**:

11.1. **Create test script or use REPL**

```typescript
// Test file or console test
import { generateRegistrationReminderEmail } from '@/lib/email-templates';

const testRequest = {
  id: 'test-id',
  requester_email: 'test@example.com',
  requester_name: 'John Doe',
  request_date: new Date().toISOString(),
  status: 'approved',
  source: 'DIRECT_REQUEST'
};

// Test without language (should default to English)
const emailNoLang = generateRegistrationReminderEmail(
  testRequest,
  'ABC123DEF456',
  7,
  'Beach House',
  'https://faqbnb.com'
);

// Test with explicit English
const emailEn = generateRegistrationReminderEmail(
  testRequest,
  'ABC123DEF456',
  7,
  'Beach House',
  'https://faqbnb.com',
  'en'
);

console.log('Subject:', emailEn.subject);
console.log('Body:', emailEn.body);
```

11.2. **Compare output with original**

**Expected Subject**:
```
Reminder: Complete Your Beach House Access Setup
```

**Expected Body** (structure):
```
Hello John Doe,

This is a friendly reminder that your access to "Beach House" was approved 7 days ago, but you haven't completed your registration yet.

Your Access Code: ABC123DEF456

To complete your access setup:
1. Click this direct registration link: https://faqbnb.com/register?code=ABC123DEF456&email=test%40example.com
   (This link pre-fills your access code and email for convenience)
2. Complete your account registration

Alternative: Visit https://faqbnb.com/register and enter your access code: ABC123DEF456

Your access code will remain valid, but completing your registration will allow you to start exploring the account's items and resources.

If you no longer need access or have any questions, please let us know.

Best regards,
The FAQBNB Team

---
This is an automated message. Please do not reply to this email.
```

**Acceptance Criteria**:
- [ ] English output matches original exactly
- [ ] Subject line correctly interpolates account name
- [ ] Body correctly interpolates all variables (name, account, days, links, code)
- [ ] Numbered steps preserved
- [ ] No missing newlines or formatting issues

---

### Task 12: Test Non-English Languages

**Objective**: Verify email renders correctly in all supported languages

**Estimated Effort**: 15 minutes

**Steps**:

12.1. **Test French output**
```typescript
const emailFr = generateRegistrationReminderEmail(
  testRequest,
  'ABC123DEF456',
  7,
  'Beach House',
  'https://faqbnb.com',
  'fr'
);
console.log('French Subject:', emailFr.subject);
console.log('French Body:', emailFr.body);
```

12.2. **Test Spanish output**
```typescript
const emailEs = generateRegistrationReminderEmail(
  testRequest,
  'ABC123DEF456',
  7,
  'Beach House',
  'https://faqbnb.com',
  'es'
);
```

12.3. **Test German output**
```typescript
const emailDe = generateRegistrationReminderEmail(
  testRequest,
  'ABC123DEF456',
  7,
  'Beach House',
  'https://faqbnb.com',
  'de'
);
```

12.4. **Test Dutch output**
```typescript
const emailNl = generateRegistrationReminderEmail(
  testRequest,
  'ABC123DEF456',
  7,
  'Beach House',
  'https://faqbnb.com',
  'nl'
);
```

12.5. **Test Italian output**
```typescript
const emailIt = generateRegistrationReminderEmail(
  testRequest,
  'ABC123DEF456',
  7,
  'Beach House',
  'https://faqbnb.com',
  'it'
);
```

12.6. **Verify for each language**:
- Subject line is translated
- Body content is translated
- All variables are interpolated correctly
- No raw translation keys visible (e.g., `registrationReminder.subject`)
- Encouraging, friendly tone maintained

**Acceptance Criteria**:
- [ ] French email renders with correct translations
- [ ] Spanish email renders with correct translations
- [ ] German email renders with correct translations
- [ ] Dutch email renders with correct translations
- [ ] Italian email renders with correct translations
- [ ] All variable interpolations work in all languages
- [ ] Days count displays correctly in all languages

---

### Task 13: Test Fallback Behavior

**Objective**: Verify fallback to English when translation is missing

**Estimated Effort**: 5 minutes

**Steps**:

13.1. **Test with invalid language code**
```typescript
// This should fallback to English gracefully
const emailInvalid = generateRegistrationReminderEmail(
  testRequest,
  'ABC123DEF456',
  7,
  'Beach House',
  'https://faqbnb.com',
  'xx' as SupportedLanguage  // Invalid code
);
```

13.2. **Verify fallback behavior**
- Output should be in English
- No errors thrown
- No raw keys visible

**Acceptance Criteria**:
- [ ] Invalid language codes fallback to English
- [ ] Missing translations fallback to English
- [ ] No runtime errors on fallback

---

### Task 14: Test HTML Rendering

**Objective**: Verify `renderEmailHTML` works with translated content

**Estimated Effort**: 5 minutes

**Steps**:

14.1. **Test HTML rendering**
```typescript
import { generateRegistrationReminderEmail, renderEmailHTML } from '@/lib/email-templates';

const email = generateRegistrationReminderEmail(
  testRequest,
  'ABC123DEF456',
  7,
  'Beach House',
  'https://faqbnb.com',
  'fr'  // French
);

const htmlContent = renderEmailHTML(email);
console.log('HTML Output:', htmlContent);
```

14.2. **Verify HTML output**
- HTML structure is valid
- Content is properly escaped
- No HTML-unsafe characters in translations
- Styling applied correctly

**Acceptance Criteria**:
- [ ] HTML renders correctly with translated content
- [ ] No HTML escaping issues
- [ ] Email displays correctly in email clients (if testable)

---

### Task 15: Test Days Count Edge Cases

**Objective**: Verify days count handles edge cases correctly

**Estimated Effort**: 5 minutes

**Steps**:

15.1. **Test with 1 day**
```typescript
const email1Day = generateRegistrationReminderEmail(
  testRequest,
  'ABC123DEF456',
  1,  // Singular
  'Beach House'
);
// Should display: "...was approved 1 days ago..."
// Note: Pluralization handling depends on translation utility
```

15.2. **Test with large number**
```typescript
const email30Days = generateRegistrationReminderEmail(
  testRequest,
  'ABC123DEF456',
  30,
  'Beach House'
);
```

15.3. **Test with zero (edge case)**
```typescript
const email0Days = generateRegistrationReminderEmail(
  testRequest,
  'ABC123DEF456',
  0,
  'Beach House'
);
```

**Note**: If ICU pluralization is needed (e.g., "1 day" vs "7 days"), this should be handled in the translation files using ICU format.

**Acceptance Criteria**:
- [ ] 1 day displays correctly (pluralization if supported)
- [ ] Large numbers display correctly
- [ ] Zero days displays correctly (edge case)

---

### Task 16: Test Backward Compatibility

**Objective**: Verify existing code continues to work without modification

**Estimated Effort**: 5 minutes

**Steps**:

16.1. **Test existing call pattern**
```typescript
// Existing call without language parameter should still work
const emailOldStyle = generateRegistrationReminderEmail(
  request,
  'ABC123DEF456',
  7,
  'Beach House',
  'https://faqbnb.com'
);
// Should return English email
```

16.2. **Test minimal call pattern**
```typescript
// Minimal required parameters
const emailMinimal = generateRegistrationReminderEmail(
  request,
  'ABC123DEF456',
  3
);
// Should work with default account name and English
```

**Acceptance Criteria**:
- [ ] Existing calls without language parameter work
- [ ] Default parameter value used when not specified
- [ ] No TypeScript errors for existing call sites

---

### Task 17: Final Code Review

**Objective**: Review implementation for quality and consistency

**Estimated Effort**: 10 minutes

**Steps**:

17.1. **Review code against checklist**:
- [ ] No hardcoded English strings remain (except in translation files)
- [ ] Translation keys follow naming convention: `namespace.component.element`
- [ ] All variables properly interpolated
- [ ] Code is readable and maintainable
- [ ] JSDoc complete and accurate
- [ ] Consistent with other email function implementations (2I.3, 2I.4, 2I.5)

17.2. **Review translation files**:
- [ ] All translation keys exist in `/messages/en.json`
- [ ] Keys are properly structured under `emails.registrationReminder`
- [ ] Common keys exist under `emails.common`
- [ ] Placeholders match variable names exactly

17.3. **Check for consistency with other email functions**:
- [ ] Same import pattern used
- [ ] Same translation helper pattern used
- [ ] Same variable naming conventions

**Acceptance Criteria**:
- [ ] Code review complete
- [ ] All quality checks pass
- [ ] Implementation matches other email functions

---

## Translation Keys Reference

### Complete Translation Keys Needed

**Location**: `/messages/en.json` (and all language files)

```json
{
  "emails": {
    "common": {
      "greeting": "Hello {name},",
      "regards": "Best regards,",
      "team": "The FAQBNB Team",
      "separator": "---",
      "footer": "This is an automated message. Please do not reply to this email."
    },
    "registrationReminder": {
      "subject": "Reminder: Complete Your {accountName} Access Setup",
      "intro": "This is a friendly reminder that your access to \"{accountName}\" was approved {days} days ago, but you haven't completed your registration yet.",
      "accessCodeLabel": "Your Access Code: {accessCode}",
      "instructionsHeading": "To complete your access setup:",
      "step1": "Click this direct registration link: {directLink}",
      "step1Note": "(This link pre-fills your access code and email for convenience)",
      "step2": "Complete your account registration",
      "alternative": "Alternative: Visit {registrationLink} and enter your access code: {accessCode}",
      "motivation": "Your access code will remain valid, but completing your registration will allow you to start exploring the account's items and resources.",
      "optOut": "If you no longer need access or have any questions, please let us know."
    }
  }
}
```

### Variable Reference

| Variable | Type | Description | Example Value |
|----------|------|-------------|---------------|
| `{name}` | string | Recipient's name or "there" | "John Doe" |
| `{accountName}` | string | Account display name | "Beach House" |
| `{accessCode}` | string | 12-character access code | "ABC123DEF456" |
| `{days}` | string | Days since approval | "7" |
| `{directLink}` | string | Pre-filled registration URL | "https://..." |
| `{registrationLink}` | string | Generic registration URL | "https://.../register" |

---

## Success Validation Checklist

### Implementation Complete
- [ ] Function signature updated with `language` parameter
- [ ] Default value set to `DEFAULT_LANGUAGE` ('en')
- [ ] Email translation utility imported
- [ ] SupportedLanguage type imported

### Translation Integration
- [ ] Subject line from `registrationReminder.subject`
- [ ] Greeting from `common.greeting`
- [ ] Intro message from `registrationReminder.intro`
- [ ] Access code display from `registrationReminder.accessCodeLabel`
- [ ] Instructions from `registrationReminder.instructionsHeading/step1/step2`
- [ ] Alternative option from `registrationReminder.alternative`
- [ ] Motivation message from `registrationReminder.motivation`
- [ ] Opt-out message from `registrationReminder.optOut`
- [ ] Common elements (regards, footer) from `common.*` keys

### Testing Complete
- [ ] English output matches original exactly
- [ ] French translation works correctly
- [ ] Spanish translation works correctly
- [ ] German translation works correctly
- [ ] Dutch translation works correctly
- [ ] Italian translation works correctly
- [ ] Fallback to English works when translation missing
- [ ] HTML rendering works with translated content
- [ ] Backward compatibility maintained

### Build Validation
- [ ] TypeScript type checking passes: `npx tsc --noEmit`
- [ ] Next.js build succeeds: `npm run build`
- [ ] No circular import issues

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Missing translation key | Low | Medium | `getEmailTranslation` returns key path, verify in testing |
| Variable interpolation failure | Low | Medium | Test all languages with all variable combinations |
| Days count pluralization | Medium | Low | Use ICU format in translations if needed |
| Email formatting issues | Low | Low | Compare output with original |
| Circular import | Low | High | Import from barrel exports |
| Tone inconsistency | Medium | Medium | Review all language translations for friendly tone |

### Rollback Plan

If critical issues arise:
1. Remove `language` parameter from function
2. Restore original hardcoded strings
3. Email functionality returns to English-only
4. Deploy hotfix

---

## Related Tasks

### Prerequisites (Must Be Complete)
- **Task 2I.1** (REQ-E02-019): Emails namespace structure - REQUIRED
- **Task 2I.2** (REQ-E02-020): getEmailTranslation utility - REQUIRED

### Parallel Tasks (Can Run Concurrently)
- **Task 2I.3** (REQ-E02-021): Update `generateAccessApprovalEmail`
- **Task 2I.4** (REQ-E02-022): Update `generateAccessDenialEmail`
- **Task 2I.5** (REQ-E02-023): Update `generateBetaAccessApprovalEmail`

### Dependent Tasks (Blocked Until This Task Complete)
- **Task 2I.7**: Add language parameter to API route calls
- **Task 2I.8**: Generate non-English translations
- **Task 2I.9**: Test email generation in each language

---

## Notes

### Implementation Pattern

This task follows the same pattern as Tasks 2I.3, 2I.4, and 2I.5. The key differences:
- This email includes `daysSinceApproval` variable for personalization
- The tone is encouraging and non-urgent (reminder, not notification)
- The content structure includes numbered steps

### Tone Considerations

When reviewing translations, ensure the friendly, encouraging tone is maintained:
- "Friendly reminder" should sound gentle, not demanding
- "Motivation" section should be inviting, not pushy
- "Opt-out" option should feel welcoming, not dismissive

### Pluralization Note

The intro message contains "{days} days ago" which may need pluralization handling:
- English: "1 day ago" vs "7 days ago"
- Different languages have different pluralization rules

If ICU pluralization is supported:
```json
{
  "intro": "This is a friendly reminder that your access to \"{accountName}\" was approved {days, plural, =1 {# day} other {# days}} ago, but you haven't completed your registration yet."
}
```

If not supported, use simple format and handle in code or accept approximate translation.

---

*End of Detailed Task Breakdown*
