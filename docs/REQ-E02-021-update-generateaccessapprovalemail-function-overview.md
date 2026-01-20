# REQ-E02-021: Update `generateAccessApprovalEmail` Function for Localization - Implementation Overview

*Generated: 2026-01-20 16:30:00 UTC*
*Last Modified: 2026-01-20 16:30:00 UTC*

## Reference

- **Request**: REQ-E02-021 (Update generateAccessApprovalEmail Function for Localization)
- **Source**: docs/gen_requests_epic2.md
- **Implementation Plan**: docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md
- **Type**: Enhancement
- **Phase**: 2I (Email Templates)
- **Task ID**: 2I.3
- **Size**: S (Small)
- **Epic**: Localization Epic 2 - Static UI Translation
- **Depends On**:
  - Epic 1 (L10N Foundation - next-intl setup)
  - REQ-E02-019 (Task 2I.1 - Emails Namespace Structure)
  - REQ-E02-020 (Task 2I.2 - Email Translation Utility Function)

## Summary

Update the `generateAccessApprovalEmail` function in `/src/lib/email-templates.ts` to support multiple languages by utilizing the email translation utility and the emails namespace. This enables access approval emails to be sent in the recipient's preferred language rather than hardcoded English.

## Goals

1. Update the function signature to accept a language preference parameter
2. Replace all hardcoded English strings with calls to `getEmailTranslation`
3. Maintain backward compatibility with existing calling code
4. Preserve all existing functionality (subject, body, variables)
5. Implement graceful fallback to English when translations are unavailable
6. Support both plain text and HTML rendering with translated content
7. Ensure emails render correctly in all 6 supported languages

## Context from Implementation Plan

### Current Implementation

From `/src/lib/email-templates.ts` (lines 16-74), the current function has:

```typescript
export function generateAccessApprovalEmail(
  request: AccessRequest,
  accessCode: string,
  accountName?: string,
  baseUrl?: string
): EmailTemplate {
  const requesterName = request.requester_name || 'there';
  const isBetaRequest = request.source === AccessRequestSource.BETA_WAITLIST;

  // Handle beta requests differently
  if (isBetaRequest) {
    return generateBetaAccessApprovalEmail(request, accessCode, accountName, baseUrl);
  }

  const accountDisplayName = accountName || 'Account';
  const registrationLink = createRegistrationLink(baseUrl);
  const directRegistrationLink = createRegistrationLinkWithCode(accessCode, request.requester_email, baseUrl);

  return {
    subject: `Access Granted: ${accountDisplayName} - Your Access Code`,
    body: `Hello ${requesterName},

Great news! Your access request for "${accountDisplayName}" has been approved.
...`
  };
}
```

**Key observations:**
- Function accepts `AccessRequest`, `accessCode`, `accountName`, `baseUrl` parameters
- Delegates to `generateBetaAccessApprovalEmail` for beta waitlist requests
- Returns `EmailTemplate` with `subject`, `body`, and `variables`
- Contains approximately 25 hardcoded English strings

### API Route Usage

From `/src/app/api/admin/access-requests/[requestId]/grant/route.ts` (lines 250-256):

```typescript
emailData = email_template || generateAccessApprovalEmail(
  accessRequest,
  accessCode,
  accessRequest.account.name,
  baseUrl
);
```

The function is called from the grant access API route and must maintain compatibility with this calling pattern.

### Email Namespace Structure (from Task 2I.1)

The `emails.accessApproval` namespace provides these translation keys:

```json
{
  "accessApproval": {
    "subject": "Access Granted: {accountName} - Your Access Code",
    "intro": "Great news! Your access request for \"{accountName}\" has been approved.",
    "accessDetailsHeading": "Your Access Details:",
    "accountLabel": "Account: {accountName}",
    "accessCodeLabel": "Access Code: {accessCode}",
    "requestedOnLabel": "Requested on: {requestDate}",
    "instructionsHeading": "To complete your access setup:",
    "step1": "Click this direct registration link: {directLink}",
    "step1Note": "(This link pre-fills your access code and email for convenience)",
    "step2": "Complete your account registration",
    "step3": "Start exploring the items and resources",
    "yourAccessCode": "Your access code: {accessCode}",
    "directRegistrationLink": "Direct registration link: {directLink}",
    "notesHeading": "Important Notes:",
    "note1": "Keep your access code secure and don't share it with others",
    "note2": "Your access code will remain valid until you complete registration",
    "note3": "If you have any questions, please contact the account owner"
  }
}
```

### Email Translation Utility (from Task 2I.2)

The `getEmailTranslation` utility provides:

```typescript
import { getEmailTranslation } from '@/lib/l10n/emails';

// Usage
const subject = getEmailTranslation('accessApproval.subject', language, {
  accountName: 'Beach House'
});
```

## Implementation Order

### Step 1: Update Function Signature

Add optional `language` parameter while preserving backward compatibility:

```typescript
export function generateAccessApprovalEmail(
  request: AccessRequest,
  accessCode: string,
  accountName?: string,
  baseUrl?: string,
  language?: SupportedLanguage  // New parameter
): EmailTemplate
```

### Step 2: Create Translation Helper

Create a local translation helper for cleaner code:

```typescript
const t = (key: string) => getEmailTranslation(
  `accessApproval.${key}`,
  language || 'en',
  variables
);
```

### Step 3: Replace Subject Line

```typescript
// Before
subject: `Access Granted: ${accountDisplayName} - Your Access Code`

// After
subject: t('subject')
```

### Step 4: Replace Body Content

Replace each hardcoded string section with translation calls, maintaining the email structure.

### Step 5: Update Beta Request Delegation

Pass language parameter to `generateBetaAccessApprovalEmail`:

```typescript
if (isBetaRequest) {
  return generateBetaAccessApprovalEmail(request, accessCode, accountName, baseUrl, language);
}
```

### Step 6: Validate and Test

- Ensure email content matches original when `language='en'`
- Test rendering in all 6 supported languages
- Verify variable interpolation works correctly

## Authorized Files and Functions for Modification

### Files to Modify

#### `/src/lib/email-templates.ts`

- **Purpose**: Email template generation functions
- **Location**: Lines 16-74 (generateAccessApprovalEmail function)
- **Current State**: Contains hardcoded English strings
- **Modification Required**:
  - Add `language` parameter to function signature
  - Replace hardcoded strings with `getEmailTranslation` calls
  - Import email translation utility

**Changes to implement:**

1. **Add imports** (top of file):

```typescript
import { getEmailTranslation } from '@/lib/l10n/emails';
import { SupportedLanguage, DEFAULT_LANGUAGE } from '@/lib/translation-service/translation-service.types';
```

2. **Update function signature** (line 16-21):

```typescript
/**
 * Generate access approval email template
 * @param request - Access request data
 * @param accessCode - Generated access code
 * @param accountName - Optional account name
 * @param baseUrl - Optional base URL for links (defaults to getServerBaseUrl())
 * @param language - Optional language for email content (defaults to English)
 */
export function generateAccessApprovalEmail(
  request: AccessRequest,
  accessCode: string,
  accountName?: string,
  baseUrl?: string,
  language: SupportedLanguage = DEFAULT_LANGUAGE
): EmailTemplate
```

3. **Create variables object and translation helper** (inside function):

```typescript
const requesterName = request.requester_name || 'there';
const isBetaRequest = request.source === AccessRequestSource.BETA_WAITLIST;

// Handle beta requests differently
if (isBetaRequest) {
  return generateBetaAccessApprovalEmail(request, accessCode, accountName, baseUrl, language);
}

const accountDisplayName = accountName || 'Account';
const registrationLink = createRegistrationLink(baseUrl);
const directRegistrationLink = createRegistrationLinkWithCode(accessCode, request.requester_email, baseUrl);

// Variables for interpolation
const emailVariables = {
  name: requesterName,
  accountName: accountDisplayName,
  accessCode,
  requestDate: new Date(request.request_date).toLocaleDateString(),
  directLink: directRegistrationLink,
  registrationLink,
};

// Translation helper for this email type
const t = (key: string) => getEmailTranslation(key, language, emailVariables);
const tCommon = (key: string) => getEmailTranslation(`common.${key}`, language, emailVariables);
```

4. **Replace return statement** (lines 34-73):

```typescript
return {
  subject: t('accessApproval.subject'),
  body: `${tCommon('greeting')}

${t('accessApproval.intro')}

${t('accessApproval.accessDetailsHeading')}
- ${t('accessApproval.accountLabel')}
- ${t('accessApproval.accessCodeLabel')}
- ${t('accessApproval.requestedOnLabel')}

${t('accessApproval.instructionsHeading')}
1. ${t('accessApproval.step1')}
   ${t('accessApproval.step1Note')}
2. ${t('accessApproval.step2')}
3. ${t('accessApproval.step3')}

${t('accessApproval.yourAccessCode')}
${t('accessApproval.directRegistrationLink')}

${t('accessApproval.notesHeading')}
- ${t('accessApproval.note1')}
- ${t('accessApproval.note2')}
- ${t('accessApproval.note3')}

${tCommon('regards')}
${tCommon('team')}

${tCommon('separator')}
${tCommon('footer')}
${tCommon('footerSupport')}`,
  variables: {
    requesterName,
    accountName: accountDisplayName,
    accessCode,
    requestDate: new Date(request.request_date).toLocaleDateString(),
    registrationLink,
    directRegistrationLink
  }
};
```

### Files That May Need Updates (Calling Code)

#### `/src/app/api/admin/access-requests/[requestId]/grant/route.ts`

- **Location**: Lines 250-256
- **Current Call**: `generateAccessApprovalEmail(accessRequest, accessCode, accessRequest.account.name, baseUrl)`
- **Potential Change**: Add language parameter when user language preference is available

**Note**: This update is optional for backward compatibility. The function will default to English if no language is provided. This file should be updated in Task 2I.7 when adding language parameters to all email function calls.

### Files NOT to Modify (in this task)

- `/messages/*.json` - Already created in Task 2I.1
- `/src/lib/l10n/emails/*.ts` - Created in Task 2I.2
- `generateBetaAccessApprovalEmail` function - Will be updated in Task 2I.5
- `generateAccessDenialEmail` function - Will be updated in Task 2I.4
- `generateRegistrationReminderEmail` function - Will be updated in Task 2I.6
- API route files - Language parameter addition is Task 2I.7

## Technical Specifications

### Function Signature Update

```typescript
// Before
export function generateAccessApprovalEmail(
  request: AccessRequest,
  accessCode: string,
  accountName?: string,
  baseUrl?: string
): EmailTemplate

// After
export function generateAccessApprovalEmail(
  request: AccessRequest,
  accessCode: string,
  accountName?: string,
  baseUrl?: string,
  language: SupportedLanguage = DEFAULT_LANGUAGE
): EmailTemplate
```

### Translation Keys Used

| Translation Key | Purpose |
|-----------------|---------|
| `common.greeting` | Email greeting ("Hello {name},") |
| `common.regards` | Sign-off ("Best regards,") |
| `common.team` | Team signature ("The FAQBNB Team") |
| `common.separator` | Visual separator ("---") |
| `common.footer` | Footer disclaimer |
| `common.footerSupport` | Support contact info |
| `accessApproval.subject` | Email subject line |
| `accessApproval.intro` | Opening message |
| `accessApproval.accessDetailsHeading` | Section heading |
| `accessApproval.accountLabel` | Account line |
| `accessApproval.accessCodeLabel` | Access code line |
| `accessApproval.requestedOnLabel` | Request date line |
| `accessApproval.instructionsHeading` | Instructions section heading |
| `accessApproval.step1` | First step |
| `accessApproval.step1Note` | Note about step 1 |
| `accessApproval.step2` | Second step |
| `accessApproval.step3` | Third step |
| `accessApproval.yourAccessCode` | Access code display |
| `accessApproval.directRegistrationLink` | Registration link display |
| `accessApproval.notesHeading` | Important notes heading |
| `accessApproval.note1` | First note |
| `accessApproval.note2` | Second note |
| `accessApproval.note3` | Third note |

### Variables for Interpolation

| Variable | Type | Description |
|----------|------|-------------|
| `{name}` | string | Recipient's name or "there" |
| `{accountName}` | string | Account display name |
| `{accessCode}` | string | Generated 12-character access code |
| `{requestDate}` | string | Formatted request date |
| `{directLink}` | string | Pre-filled registration URL |
| `{registrationLink}` | string | Generic registration URL |

### Backward Compatibility

The function maintains backward compatibility by:

1. **Default parameter**: `language = DEFAULT_LANGUAGE` ensures English output when not specified
2. **Same return type**: Returns unchanged `EmailTemplate` interface
3. **Same parameter order**: Existing calls continue to work without modification
4. **Variables preserved**: The `variables` object in return value unchanged

### Fallback Behavior

| Scenario | Result |
|----------|--------|
| `language='en'` | Returns English content directly |
| `language='fr'` (translation exists) | Returns French content |
| `language='fr'` (translation missing) | Returns English fallback |
| `language=undefined` | Uses DEFAULT_LANGUAGE ('en') |
| Invalid language code | Falls back to English |

## Usage Patterns

### Basic Usage (English - Unchanged)

```typescript
// Existing calls continue to work
const emailTemplate = generateAccessApprovalEmail(
  accessRequest,
  'ABC123DEF456',
  'Beach House',
  'https://faqbnb.com'
);
// Returns English email
```

### With Language Specification

```typescript
// New usage with language parameter
const emailTemplate = generateAccessApprovalEmail(
  accessRequest,
  'ABC123DEF456',
  'Beach House',
  'https://faqbnb.com',
  'fr'  // French
);
// Returns French email
```

### With User Language Preference

```typescript
// Using user's stored language preference
const userLanguage = accessRequest.requester_language || 'en';
const emailTemplate = generateAccessApprovalEmail(
  accessRequest,
  accessCode,
  accountName,
  baseUrl,
  userLanguage as SupportedLanguage
);
```

## Success Validation Checklist

### Function Modification
- [ ] Function signature updated with `language` parameter
- [ ] Default value set to `DEFAULT_LANGUAGE` ('en')
- [ ] Email translation utility imported
- [ ] SupportedLanguage type imported

### Translation Integration
- [ ] Subject line retrieved from `accessApproval.subject`
- [ ] Greeting retrieved from `common.greeting`
- [ ] All body content retrieved from translation keys
- [ ] Variables properly passed to translation function
- [ ] Common elements (regards, footer) use `common.*` keys

### Backward Compatibility
- [ ] Existing calls without language parameter work correctly
- [ ] Return type remains `EmailTemplate`
- [ ] Variables object structure unchanged
- [ ] Beta request delegation includes language parameter

### Content Validation
- [ ] English output matches original content exactly
- [ ] All placeholders replaced correctly
- [ ] Email structure (headings, bullet points) preserved
- [ ] No hardcoded English strings remain

### Build Validation
- [ ] Application builds without errors: `npm run build`
- [ ] TypeScript type checking passes
- [ ] No circular import issues
- [ ] Import paths resolve correctly

### Testing
- [ ] Function generates correct English email
- [ ] Function generates correct French email
- [ ] Function generates correct Spanish email
- [ ] Variable interpolation works in all languages
- [ ] Fallback to English works when translation missing
- [ ] renderEmailHTML works with translated content

## Dependencies

### Required (Already Installed)
- TypeScript 5.x - Type checking
- Next.js 15.x - App Router support

### Internal Dependencies
- `/src/lib/l10n/emails/email-translations.ts` - `getEmailTranslation` function (Task 2I.2)
- `/src/lib/translation-service/translation-service.types.ts` - `SupportedLanguage`, `DEFAULT_LANGUAGE`
- `/messages/*.json` - Email translations in all 6 languages (Task 2I.1)
- `/src/types/admin.ts` - `AccessRequest`, `EmailTemplate`, `AccessRequestSource` types

### No New External Dependencies Required

This task only modifies the existing function to use the translation utilities created in earlier tasks.

## Risk Assessment

- **Risk Level**: Low-Medium
- **Rationale**:
  - Modifies existing production function
  - Maintains backward compatibility
  - English fallback ensures functionality
  - Email sending still works if translation fails
  - Easy to test and validate

### Potential Issues

| Issue | Likelihood | Impact | Mitigation |
|-------|------------|--------|------------|
| Missing translation key | Low | Medium | getEmailTranslation returns key path, fallback to English |
| Variable interpolation failure | Low | Medium | Test all languages, validate variable names |
| Email formatting issues | Low | Low | Compare output with original English version |
| Circular import | Low | High | Import from barrel exports, avoid deep imports |
| Type mismatch | Low | Medium | Use explicit SupportedLanguage type |

### Rollback Strategy

If issues occur:
1. Revert `language` parameter to function
2. Restore original hardcoded strings
3. Email functionality returns to English-only

## Acceptance Criteria Mapping

| Acceptance Criteria | Implementation |
|---------------------|----------------|
| Function accepts language preference | `language: SupportedLanguage` parameter |
| Uses email translation utility | Import and use `getEmailTranslation` |
| Subject from `emails.accessApproval.subject` | `t('accessApproval.subject')` |
| Greeting from `emails.common.greeting` | `tCommon('greeting')` |
| All content from translation keys | All strings replaced |
| Variables interpolated correctly | Pass `emailVariables` to translation function |
| Fallback to English | Default behavior of `getEmailTranslation` |
| Renders correctly in all languages | Validate email structure |
| No hardcoded English remains | Code review |
| Backward compatible | Default parameter value |
| HTML rendering works | Test `renderEmailHTML` with output |

## Related Tasks

### Prerequisites (Must Be Complete)
- **Task 2I.1** (REQ-E02-019): Emails namespace structure
- **Task 2I.2** (REQ-E02-020): getEmailTranslation utility function

### Parallel Tasks (Can Run Concurrently)
- **Task 2I.4**: Update `generateAccessDenialEmail`
- **Task 2I.5**: Update `generateBetaAccessApprovalEmail`
- **Task 2I.6**: Update `generateRegistrationReminderEmail`

### Dependent Tasks (Blocked Until Complete)
- **Task 2I.7**: Add language parameter to all email function calls in API routes
- **Task 2I.8**: Generate translations for non-English languages
- **Task 2I.9**: Test email generation in each language

## Notes

### Email Content Structure

The access approval email has these sections:
1. **Greeting**: "Hello {name},"
2. **Introduction**: Approval confirmation message
3. **Access Details**: Account, code, request date
4. **Instructions**: 3-step process to complete access
5. **Important Notes**: 3 security/usage notes
6. **Sign-off**: Regards and team name
7. **Footer**: Disclaimer and support info

Each section should be preserved in the translated output.

### Date Formatting

The `requestDate` is formatted using `toLocaleDateString()` which respects the system locale. For full localization, consider using `Intl.DateTimeFormat` with the target language:

```typescript
const requestDate = new Intl.DateTimeFormat(language, {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
}).format(new Date(request.request_date));
```

This enhancement can be added in this task or as a follow-up.

### Beta Request Handling

The function delegates to `generateBetaAccessApprovalEmail` for beta waitlist requests. The language parameter must be forwarded to maintain consistent localization:

```typescript
if (isBetaRequest) {
  return generateBetaAccessApprovalEmail(request, accessCode, accountName, baseUrl, language);
}
```

Note: `generateBetaAccessApprovalEmail` will be updated in Task 2I.5 to accept the language parameter. Until then, this delegation may cause a TypeScript error that needs to be handled (either with type casting or by completing Task 2I.5 first).

### HTML Email Rendering

The `renderEmailHTML` function (lines 224-300) wraps plain text content in HTML markup. It should continue to work with translated content since it operates on the returned `EmailTemplate.body` string. Verify that:
- Variable replacement works correctly in HTML context
- No HTML-unsafe characters in translations
- Email renders correctly in email clients

---

*End of Implementation Overview*
