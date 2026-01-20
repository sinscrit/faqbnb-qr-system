# REQ-E02-024: Update `generateRegistrationReminderEmail` Function for Localization - Implementation Overview

*Generated: 2026-01-20 03:15:00 UTC*
*Last Modified: 2026-01-20 03:15:00 UTC*

## Reference

- **Request**: REQ-E02-024 (Update generateRegistrationReminderEmail Function for Localization)
- **Source**: docs/gen_requests_epic2.md
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

## Summary

Update the `generateRegistrationReminderEmail` function in `/src/lib/email-templates.ts` to support multiple languages by utilizing the email translation utility and the emails namespace. This enables registration reminder emails to be sent in the recipient's preferred language rather than hardcoded English, ensuring users who started but haven't completed registration receive re-engagement communications in their native language.

## Goals

1. Update the function signature to accept a language preference parameter
2. Replace all hardcoded English strings with calls to `getEmailTranslation`
3. Maintain backward compatibility with existing calling code
4. Preserve all existing functionality (subject, body, variables)
5. Implement graceful fallback to English when translations are unavailable
6. Support both plain text and HTML rendering with translated content
7. Ensure emails render correctly in all 6 supported languages
8. Maintain the encouraging, helpful tone of reminder emails across all languages

## Context from Implementation Plan

### Current Implementation

From `/src/lib/email-templates.ts` (lines 343-396), the current function has:

```typescript
/**
 * Generate reminder email for pending registration
 * @param request - Access request data
 * @param accessCode - Generated access code
 * @param daysSinceApproval - Number of days since approval
 * @param accountName - Optional account name
 * @param baseUrl - Optional base URL for links (defaults to getServerBaseUrl())
 */
export function generateRegistrationReminderEmail(
  request: AccessRequest,
  accessCode: string,
  daysSinceApproval: number,
  accountName?: string,
  baseUrl?: string
): EmailTemplate {
  const requesterName = request.requester_name || 'there';
  const accountDisplayName = accountName || 'Account';
  const registrationLink = createRegistrationLink(baseUrl);
  const directRegistrationLink = createRegistrationLinkWithCode(accessCode, request.requester_email, baseUrl);

  return {
    subject: `Reminder: Complete Your ${accountDisplayName} Access Setup`,
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

**Key observations:**
- Function accepts `AccessRequest`, `accessCode`, `daysSinceApproval`, `accountName`, `baseUrl` parameters
- Returns `EmailTemplate` with `subject`, `body`, and `variables`
- Contains approximately 15 hardcoded English strings
- Has a friendly, encouraging, non-urgent tone
- Includes `daysSinceApproval` dynamic value for personalization
- Provides both direct registration link and alternative manual entry option
- Includes motivational messaging about benefits of completing registration

### Email Namespace Structure (from Task 2I.1)

The `emails.registrationReminder` namespace should provide these translation keys:

```json
{
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
```

### Email Translation Utility (from Task 2I.2)

The `getEmailTranslation` utility provides:

```typescript
import { getEmailTranslation } from '@/lib/l10n/emails';

// Usage
const subject = getEmailTranslation('registrationReminder.subject', language, {
  accountName: 'Beach House'
});
```

## Implementation Order

### Step 1: Update Function Signature

Add optional `language` parameter while preserving backward compatibility:

```typescript
export function generateRegistrationReminderEmail(
  request: AccessRequest,
  accessCode: string,
  daysSinceApproval: number,
  accountName?: string,
  baseUrl?: string,
  language?: SupportedLanguage  // New parameter
): EmailTemplate
```

### Step 2: Create Translation Helper

Create a local translation helper for cleaner code:

```typescript
const t = (key: string) => getEmailTranslation(
  key,
  language || 'en',
  variables
);
```

### Step 3: Replace Subject Line

```typescript
// Before
subject: `Reminder: Complete Your ${accountDisplayName} Access Setup`

// After
subject: t('registrationReminder.subject')
```

### Step 4: Replace Body Content

Replace each hardcoded string section with translation calls, maintaining the email structure and ensuring the encouraging tone is preserved across all languages.

### Step 5: Validate and Test

- Ensure email content matches original when `language='en'`
- Test rendering in all 6 supported languages
- Verify variable interpolation works correctly (especially `daysSinceApproval`)

## Authorized Files and Functions for Modification

### Files to Modify

#### `/src/lib/email-templates.ts`

- **Purpose**: Email template generation functions
- **Location**: Lines 343-396 (generateRegistrationReminderEmail function)
- **Current State**: Contains hardcoded English strings
- **Modification Required**:
  - Add `language` parameter to function signature
  - Replace hardcoded strings with `getEmailTranslation` calls
  - Import email translation utility (if not already imported from earlier tasks)

**Changes to implement:**

1. **Add/verify imports** (top of file, if not already present from Task 2I.3):

```typescript
import { getEmailTranslation } from '@/lib/l10n/emails';
import { SupportedLanguage, DEFAULT_LANGUAGE } from '@/lib/translation-service/translation-service.types';
```

2. **Update function signature** (line 351-357):

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
): EmailTemplate
```

3. **Create variables object and translation helper** (inside function):

```typescript
const requesterName = request.requester_name || 'there';
const accountDisplayName = accountName || 'Account';
const registrationLink = createRegistrationLink(baseUrl);
const directRegistrationLink = createRegistrationLinkWithCode(accessCode, request.requester_email, baseUrl);

// Variables for interpolation
const emailVariables = {
  name: requesterName,
  accountName: accountDisplayName,
  accessCode,
  days: daysSinceApproval.toString(),
  directLink: directRegistrationLink,
  registrationLink,
};

// Translation helper for this email type
const t = (key: string) => getEmailTranslation(key, language, emailVariables);
const tCommon = (key: string) => getEmailTranslation(`common.${key}`, language, emailVariables);
```

4. **Replace return statement** (lines 363-396):

```typescript
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
```

### Files That May Need Updates (Calling Code)

#### API Routes or Scheduled Jobs Calling This Function

- **Current Call Pattern**: `generateRegistrationReminderEmail(request, accessCode, days, accountName, baseUrl)`
- **Required Change**: Add language parameter when user language preference is available

**Note**: This update is optional for backward compatibility. The function will default to English if no language is provided. This file should be updated in Task 2I.7 when adding language parameters to all email function calls.

### Files NOT to Modify (in this task)

- `/messages/*.json` - Already created in Task 2I.1
- `/src/lib/l10n/emails/*.ts` - Created in Task 2I.2
- `generateAccessApprovalEmail` function - Updated in Task 2I.3
- `generateAccessDenialEmail` function - Updated in Task 2I.4
- `generateBetaAccessApprovalEmail` function - Updated in Task 2I.5
- API route files - Language parameter addition is Task 2I.7

## Technical Specifications

### Function Signature Update

```typescript
// Before
export function generateRegistrationReminderEmail(
  request: AccessRequest,
  accessCode: string,
  daysSinceApproval: number,
  accountName?: string,
  baseUrl?: string
): EmailTemplate

// After
export function generateRegistrationReminderEmail(
  request: AccessRequest,
  accessCode: string,
  daysSinceApproval: number,
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
| `registrationReminder.subject` | Email subject line |
| `registrationReminder.intro` | Opening reminder message with days count |
| `registrationReminder.accessCodeLabel` | Access code display |
| `registrationReminder.instructionsHeading` | Instructions section heading |
| `registrationReminder.step1` | First step (direct link) |
| `registrationReminder.step1Note` | Note about convenience pre-fill |
| `registrationReminder.step2` | Second step (complete registration) |
| `registrationReminder.alternative` | Alternative manual entry option |
| `registrationReminder.motivation` | Motivational message about benefits |
| `registrationReminder.optOut` | Opt-out and questions message |

### Variables for Interpolation

| Variable | Type | Description |
|----------|------|-------------|
| `{name}` | string | Recipient's name or "there" |
| `{accountName}` | string | Account display name |
| `{accessCode}` | string | Generated 12-character access code |
| `{days}` | string | Number of days since approval (e.g., "3", "7") |
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
const emailTemplate = generateRegistrationReminderEmail(
  accessRequest,
  'ABC123DEF456',
  7,  // 7 days since approval
  'Beach House',
  'https://faqbnb.com'
);
// Returns English email
```

### With Language Specification

```typescript
// New usage with language parameter
const emailTemplate = generateRegistrationReminderEmail(
  accessRequest,
  'ABC123DEF456',
  7,
  'Beach House',
  'https://faqbnb.com',
  'es'  // Spanish
);
// Returns Spanish email
```

### With User Language Preference

```typescript
// Using user's stored language preference
const userLanguage = accessRequest.requester_language || 'en';
const emailTemplate = generateRegistrationReminderEmail(
  accessRequest,
  accessCode,
  daysSinceApproval,
  accountName,
  baseUrl,
  userLanguage as SupportedLanguage
);
```

## Success Validation Checklist

### Function Modification
- [ ] Function signature updated with `language` parameter
- [ ] Default value set to `DEFAULT_LANGUAGE` ('en')
- [ ] Email translation utility imported (if not already present)
- [ ] SupportedLanguage type imported (if not already present)

### Translation Integration
- [ ] Subject line retrieved from `registrationReminder.subject`
- [ ] Greeting retrieved from `common.greeting`
- [ ] Intro message with days count retrieved from `registrationReminder.intro`
- [ ] Access code display retrieved from `registrationReminder.accessCodeLabel`
- [ ] Instructions section retrieved from `registrationReminder.*` keys
- [ ] Alternative option retrieved from `registrationReminder.alternative`
- [ ] Motivation message retrieved from `registrationReminder.motivation`
- [ ] Opt-out message retrieved from `registrationReminder.optOut`
- [ ] Common elements (regards, footer) use `common.*` keys
- [ ] Variables properly passed to translation function

### Backward Compatibility
- [ ] Existing calls without language parameter work correctly
- [ ] Return type remains `EmailTemplate`
- [ ] Variables object structure unchanged (includes `daysSinceApproval`)

### Content Validation
- [ ] English output matches original content exactly
- [ ] All placeholders replaced correctly
- [ ] Email structure (headings, numbered steps) preserved
- [ ] Days count displays correctly in all languages
- [ ] No hardcoded English strings remain
- [ ] Encouraging, helpful tone maintained across languages

### Build Validation
- [ ] Application builds without errors: `npm run build`
- [ ] TypeScript type checking passes
- [ ] No circular import issues
- [ ] Import paths resolve correctly

### Testing
- [ ] Function generates correct English email
- [ ] Function generates correct French email
- [ ] Function generates correct Spanish email
- [ ] Function generates correct German email
- [ ] Function generates correct Dutch email
- [ ] Function generates correct Italian email
- [ ] Variable interpolation works in all languages (especially `{days}`)
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
- `/src/types/admin.ts` - `AccessRequest`, `EmailTemplate` types
- `/src/lib/config.ts` - `getServerBaseUrl` function

### No New External Dependencies Required

This task only modifies the existing function to use the translation utilities created in earlier tasks.

## Risk Assessment

- **Risk Level**: Low
- **Rationale**:
  - Modifies existing production function
  - Maintains backward compatibility
  - English fallback ensures functionality
  - Email sending still works if translation fails
  - Easy to test and validate
  - Simpler email structure than beta approval email

### Potential Issues

| Issue | Likelihood | Impact | Mitigation |
|-------|------------|--------|------------|
| Missing translation key | Low | Medium | getEmailTranslation returns key path, fallback to English |
| Variable interpolation failure | Low | Medium | Test all languages, validate variable names |
| Days pluralization issues | Medium | Low | Use proper ICU format in translations |
| Email formatting issues | Low | Low | Compare output with original English version |
| Circular import | Low | High | Import from barrel exports, avoid deep imports |
| Type mismatch | Low | Medium | Use explicit SupportedLanguage type |
| Tone inconsistency in translations | Medium | Medium | Review translations for encouraging tone |

### Rollback Strategy

If issues occur:
1. Revert `language` parameter from function
2. Restore original hardcoded strings
3. Email functionality returns to English-only

## Acceptance Criteria Mapping

| Acceptance Criteria | Implementation |
|---------------------|----------------|
| Function accepts language preference | `language: SupportedLanguage` parameter |
| Uses email translation utility | Import and use `getEmailTranslation` |
| Subject from `emails.registrationReminder.subject` | `t('registrationReminder.subject')` |
| Greeting from `emails.common.greeting` | `tCommon('greeting')` |
| All content from translation keys | All strings replaced |
| Days count interpolated correctly | Pass `days: daysSinceApproval.toString()` to translation function |
| Fallback to English | Default behavior of `getEmailTranslation` |
| Renders correctly in all languages | Validate email structure |
| No hardcoded English remains | Code review |
| Backward compatible | Default parameter value |
| HTML rendering works | Test `renderEmailHTML` with output |
| Encouraging tone maintained | Review translated content for helpful tone |

## Related Tasks

### Prerequisites (Must Be Complete)
- **Task 2I.1** (REQ-E02-019): Emails namespace structure
- **Task 2I.2** (REQ-E02-020): getEmailTranslation utility function

### Parallel Tasks (Can Run Concurrently)
- **Task 2I.3** (REQ-E02-021): Update `generateAccessApprovalEmail`
- **Task 2I.4** (REQ-E02-022): Update `generateAccessDenialEmail`
- **Task 2I.5** (REQ-E02-023): Update `generateBetaAccessApprovalEmail`

### Dependent Tasks (Blocked Until Complete)
- **Task 2I.7**: Add language parameter to all email function calls in API routes
- **Task 2I.8**: Generate translations for non-English languages
- **Task 2I.9**: Test email generation in each language

## Notes

### Email Content Structure

The registration reminder email has these sections:
1. **Greeting**: "Hello {name},"
2. **Introduction**: Reminder message with days since approval
3. **Access Code Display**: Shows the access code prominently
4. **Instructions**: 2-step process to complete registration
5. **Alternative Option**: Manual entry instructions
6. **Motivation**: Benefits of completing registration
7. **Opt-Out**: Message for those who no longer need access
8. **Sign-off**: Regards and team name
9. **Footer**: Disclaimer

Each section should be preserved in the translated output with appropriate tone.

### Pluralization for Days Count

The `daysSinceApproval` value requires careful handling in translations. Languages have different pluralization rules:

```json
{
  "intro": "This is a friendly reminder that your access to \"{accountName}\" was approved {days, plural, =1 {# day} other {# days}} ago, but you haven't completed your registration yet."
}
```

The ICU format handles pluralization automatically when the translation utility supports it. Verify the `getEmailTranslation` utility supports ICU pluralization or adjust translations accordingly.

### Alternative Pluralization Approach

If ICU format is not supported, provide separate translation keys:

```json
{
  "introSingular": "...was approved 1 day ago...",
  "introPlural": "...was approved {days} days ago..."
}
```

And handle the selection in code:

```typescript
const introKey = daysSinceApproval === 1
  ? 'registrationReminder.introSingular'
  : 'registrationReminder.introPlural';
```

### Tone Considerations for Translations

The registration reminder email has a deliberately friendly, non-pushy tone. When reviewing translations, ensure:

1. **"Friendly reminder" conveys gentleness**: The phrase should not sound demanding
2. **Motivation is encouraging, not urgent**: "start exploring" should feel inviting
3. **Opt-out option is welcoming**: Users should feel comfortable declining
4. **Formal vs informal**: Languages with formal/informal distinction should use appropriately friendly register

### HTML Email Rendering

The `renderEmailHTML` function (lines 224-300 in email-templates.ts) wraps plain text content in HTML markup. It should continue to work with translated content since it operates on the returned `EmailTemplate.body` string. Verify that:
- Variable replacement works correctly in HTML context
- No HTML-unsafe characters in translations
- Days count renders correctly in HTML
- Email renders correctly across email clients

### Use Case Scenarios

The registration reminder email may be sent in various scenarios:

1. **Automated reminder after 3 days**: Common first reminder
2. **Automated reminder after 7 days**: Second reminder
3. **Manual resend by admin**: Custom timing
4. **Re-engagement campaign**: Batch sending to dormant approvals

All scenarios should work with the localized function by passing the appropriate `daysSinceApproval` value.

---

*End of Implementation Overview*
