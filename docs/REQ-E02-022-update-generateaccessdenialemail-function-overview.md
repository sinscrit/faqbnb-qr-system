# REQ-E02-022: Update `generateAccessDenialEmail` Function for Localization - Implementation Overview

*Generated: 2026-01-20 17:45:00 UTC*
*Last Modified: 2026-01-20 17:45:00 UTC*

## Reference

- **Request**: REQ-E02-022 (Update generateAccessDenialEmail Function for Localization)
- **Source**: docs/gen_requests_epic2.md
- **Implementation Plan**: docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md
- **Type**: Enhancement
- **Phase**: 2I (Email Templates)
- **Task ID**: 2I.4
- **Size**: S (Small)
- **Epic**: Localization Epic 2 - Static UI Translation
- **Depends On**:
  - Epic 1 (L10N Foundation - next-intl setup)
  - REQ-E02-019 (Task 2I.1 - Emails Namespace Structure)
  - REQ-E02-020 (Task 2I.2 - Email Translation Utility Function)

## Summary

Update the `generateAccessDenialEmail` function in `/src/lib/email-templates.ts` to support multiple languages by utilizing the email translation utility and the emails namespace. This enables access denial emails to be sent in the recipient's preferred language rather than hardcoded English.

## Goals

1. Update the function signature to accept a language preference parameter
2. Replace all hardcoded English strings with calls to `getEmailTranslation`
3. Maintain backward compatibility with existing calling code
4. Preserve all existing functionality (subject, body, variables)
5. Implement graceful fallback to English when translations are unavailable
6. Support both plain text and HTML rendering with translated content
7. Ensure emails render correctly in all 6 supported languages
8. Maintain professional, respectful tone across all languages when communicating denial

## Context from Implementation Plan

### Current Implementation

From `/src/lib/email-templates.ts` (lines 305-341), the current function has:

```typescript
/**
 * Generate access denial email template
 */
export function generateAccessDenialEmail(
  request: AccessRequest,
  reason?: string,
  accountName?: string
): EmailTemplate {
  const requesterName = request.requester_name || 'there';
  const accountDisplayName = accountName || 'Account';

  return {
    subject: `Access Request Update: ${accountDisplayName}`,
    body: `Hello ${requesterName},

Thank you for your interest in accessing "${accountDisplayName}".

Unfortunately, we're unable to approve your access request at this time.

${reason ? `Reason: ${reason}` : ''}

Request Details:
- Account: ${accountDisplayName}
- Requested on: ${new Date(request.request_date).toLocaleDateString()}

If you believe this is an error or have questions about this decision, please contact the account owner directly.

Best regards,
The FAQBNB Team

---
This is an automated message. Please do not reply to this email.`,
    variables: {
      requesterName,
      accountName: accountDisplayName,
      reason: reason || '',
      requestDate: new Date(request.request_date).toLocaleDateString()
    }
  };
}
```

**Key observations:**
- Function accepts `AccessRequest`, `reason`, `accountName` parameters
- Simpler structure than access approval email (fewer sections)
- Returns `EmailTemplate` with `subject`, `body`, and `variables`
- Contains approximately 12 hardcoded English strings
- Conditionally includes reason if provided
- Uses neutral, professional tone for negative notification

### Email Namespace Structure (from Task 2I.1)

The `emails.accessDenial` namespace provides these translation keys:

```json
{
  "accessDenial": {
    "subject": "Access Request Update: {accountName}",
    "intro": "Thank you for your interest in accessing \"{accountName}\".",
    "message": "Unfortunately, we're unable to approve your access request at this time.",
    "reasonLabel": "Reason: {reason}",
    "requestDetailsHeading": "Request Details:",
    "accountLabel": "Account: {accountName}",
    "requestedOnLabel": "Requested on: {requestDate}",
    "contactNote": "If you believe this is an error or have questions about this decision, please contact the account owner directly."
  }
}
```

### Email Translation Utility (from Task 2I.2)

The `getEmailTranslation` utility provides:

```typescript
import { getEmailTranslation } from '@/lib/l10n/emails';

// Usage
const subject = getEmailTranslation('accessDenial.subject', language, {
  accountName: 'Beach House'
});
```

## Implementation Order

### Step 1: Update Function Signature

Add optional `language` parameter while preserving backward compatibility:

```typescript
export function generateAccessDenialEmail(
  request: AccessRequest,
  reason?: string,
  accountName?: string,
  language?: SupportedLanguage  // New parameter
): EmailTemplate
```

### Step 2: Create Translation Helper

Create a local translation helper for cleaner code:

```typescript
const t = (key: string) => getEmailTranslation(
  key,
  language || 'en',
  emailVariables
);
```

### Step 3: Replace Subject Line

```typescript
// Before
subject: `Access Request Update: ${accountDisplayName}`

// After
subject: t('accessDenial.subject')
```

### Step 4: Replace Body Content

Replace each hardcoded string section with translation calls, maintaining the email structure and handling the optional reason field.

### Step 5: Handle Conditional Reason Section

The reason field is optional. Handle translation appropriately:

```typescript
// Only include reason section if reason is provided
const reasonSection = reason
  ? `\n${t('accessDenial.reasonLabel')}\n`
  : '';
```

### Step 6: Validate and Test

- Ensure email content matches original when `language='en'`
- Test rendering in all 6 supported languages
- Verify variable interpolation works correctly
- Verify optional reason handling works in all languages

## Authorized Files and Functions for Modification

### Files to Modify

#### `/src/lib/email-templates.ts`

- **Purpose**: Email template generation functions
- **Location**: Lines 305-341 (generateAccessDenialEmail function)
- **Current State**: Contains hardcoded English strings
- **Modification Required**:
  - Add `language` parameter to function signature
  - Replace hardcoded strings with `getEmailTranslation` calls
  - Import email translation utility (if not already imported from Task 2I.3)

**Changes to implement:**

1. **Add/verify imports** (top of file):

```typescript
import { getEmailTranslation } from '@/lib/l10n/emails';
import { SupportedLanguage, DEFAULT_LANGUAGE } from '@/lib/translation-service/translation-service.types';
```

2. **Update function signature** (line 305-309):

```typescript
/**
 * Generate access denial email template
 * @param request - Access request data
 * @param reason - Optional denial reason
 * @param accountName - Optional account name
 * @param language - Optional language for email content (defaults to English)
 */
export function generateAccessDenialEmail(
  request: AccessRequest,
  reason?: string,
  accountName?: string,
  language: SupportedLanguage = DEFAULT_LANGUAGE
): EmailTemplate
```

3. **Create variables object and translation helper** (inside function):

```typescript
const requesterName = request.requester_name || 'there';
const accountDisplayName = accountName || 'Account';

// Variables for interpolation
const emailVariables = {
  name: requesterName,
  accountName: accountDisplayName,
  reason: reason || '',
  requestDate: new Date(request.request_date).toLocaleDateString(),
};

// Translation helper for this email type
const t = (key: string) => getEmailTranslation(key, language, emailVariables);
const tCommon = (key: string) => getEmailTranslation(`common.${key}`, language, emailVariables);
```

4. **Replace return statement** (lines 313-341):

```typescript
// Conditionally include reason section
const reasonSection = reason
  ? `\n${t('accessDenial.reasonLabel')}\n`
  : '';

return {
  subject: t('accessDenial.subject'),
  body: `${tCommon('greeting')}

${t('accessDenial.intro')}

${t('accessDenial.message')}
${reasonSection}
${t('accessDenial.requestDetailsHeading')}
- ${t('accessDenial.accountLabel')}
- ${t('accessDenial.requestedOnLabel')}

${t('accessDenial.contactNote')}

${tCommon('regards')}
${tCommon('team')}

${tCommon('separator')}
${tCommon('footer')}`,
  variables: {
    requesterName,
    accountName: accountDisplayName,
    reason: reason || '',
    requestDate: new Date(request.request_date).toLocaleDateString()
  }
};
```

### Files That May Need Updates (Calling Code)

#### API Routes that call generateAccessDenialEmail

Based on codebase patterns, access denial may be called from:
- `/src/app/api/admin/access-requests/[requestId]/deny/route.ts` (if exists)
- Similar admin API routes

**Note**: These updates are optional for backward compatibility. The function will default to English if no language is provided. This file should be updated in Task 2I.7 when adding language parameters to all email function calls.

### Files NOT to Modify (in this task)

- `/messages/*.json` - Already created in Task 2I.1
- `/src/lib/l10n/emails/*.ts` - Created in Task 2I.2
- `generateAccessApprovalEmail` function - Already updated in Task 2I.3
- `generateBetaAccessApprovalEmail` function - Will be updated in Task 2I.5
- `generateRegistrationReminderEmail` function - Will be updated in Task 2I.6
- API route files - Language parameter addition is Task 2I.7

## Technical Specifications

### Function Signature Update

```typescript
// Before
export function generateAccessDenialEmail(
  request: AccessRequest,
  reason?: string,
  accountName?: string
): EmailTemplate

// After
export function generateAccessDenialEmail(
  request: AccessRequest,
  reason?: string,
  accountName?: string,
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
| `accessDenial.subject` | Email subject line |
| `accessDenial.intro` | Opening appreciation message |
| `accessDenial.message` | Denial notification |
| `accessDenial.reasonLabel` | Reason line (conditional) |
| `accessDenial.requestDetailsHeading` | Section heading |
| `accessDenial.accountLabel` | Account line |
| `accessDenial.requestedOnLabel` | Request date line |
| `accessDenial.contactNote` | Contact/escalation guidance |

### Variables for Interpolation

| Variable | Type | Description |
|----------|------|-------------|
| `{name}` | string | Recipient's name or "there" |
| `{accountName}` | string | Account display name |
| `{reason}` | string | Optional denial reason |
| `{requestDate}` | string | Formatted request date |

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

### Conditional Reason Handling

The denial reason is optional. The implementation handles this gracefully:

```typescript
// When reason is provided
const reasonSection = reason
  ? `\n${t('accessDenial.reasonLabel')}\n`  // "Reason: {reason}"
  : '';                                       // Empty string if no reason

// The reasonLabel translation already includes the {reason} variable
// e.g., "Reason: {reason}" becomes "Reason: User quota exceeded"
```

When reason is not provided:
- The reasonSection is empty
- No "Reason:" line appears in the email
- The email flows naturally without the optional section

## Usage Patterns

### Basic Usage (English - Unchanged)

```typescript
// Existing calls continue to work
const emailTemplate = generateAccessDenialEmail(
  accessRequest,
  'User quota exceeded',  // Optional reason
  'Beach House'
);
// Returns English email
```

### Without Reason (English - Unchanged)

```typescript
// No reason provided
const emailTemplate = generateAccessDenialEmail(
  accessRequest,
  undefined,  // No reason
  'Beach House'
);
// Returns English email without reason section
```

### With Language Specification

```typescript
// New usage with language parameter
const emailTemplate = generateAccessDenialEmail(
  accessRequest,
  'Quota utilisateur depassee',  // Reason in any language
  'Maison de Plage',
  'fr'  // French
);
// Returns French email
```

### With User Language Preference

```typescript
// Using user's stored language preference
const userLanguage = accessRequest.requester_language || 'en';
const emailTemplate = generateAccessDenialEmail(
  accessRequest,
  denialReason,
  accountName,
  userLanguage as SupportedLanguage
);
```

## Success Validation Checklist

### Function Modification
- [ ] Function signature updated with `language` parameter
- [ ] Default value set to `DEFAULT_LANGUAGE` ('en')
- [ ] Email translation utility imported (or already present from Task 2I.3)
- [ ] SupportedLanguage type imported (or already present)

### Translation Integration
- [ ] Subject line retrieved from `accessDenial.subject`
- [ ] Greeting retrieved from `common.greeting`
- [ ] All body content retrieved from translation keys
- [ ] Variables properly passed to translation function
- [ ] Common elements (regards, footer) use `common.*` keys
- [ ] Conditional reason section handled correctly

### Backward Compatibility
- [ ] Existing calls without language parameter work correctly
- [ ] Return type remains `EmailTemplate`
- [ ] Variables object structure unchanged
- [ ] Calls without reason continue to work

### Content Validation
- [ ] English output matches original content exactly
- [ ] All placeholders replaced correctly
- [ ] Email structure (headings, bullet points) preserved
- [ ] No hardcoded English strings remain
- [ ] Tone remains professional and respectful across languages

### Build Validation
- [ ] Application builds without errors: `npm run build`
- [ ] TypeScript type checking passes
- [ ] No circular import issues
- [ ] Import paths resolve correctly

### Testing
- [ ] Function generates correct English email with reason
- [ ] Function generates correct English email without reason
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
- `/src/types/admin.ts` - `AccessRequest`, `EmailTemplate` types

### No New External Dependencies Required

This task only modifies the existing function to use the translation utilities created in earlier tasks.

## Risk Assessment

- **Risk Level**: Low
- **Rationale**:
  - Modifies existing production function
  - Maintains backward compatibility
  - English fallback ensures functionality
  - Email sending still works if translation fails
  - Simpler structure than access approval email
  - Easy to test and validate

### Potential Issues

| Issue | Likelihood | Impact | Mitigation |
|-------|------------|--------|------------|
| Missing translation key | Low | Medium | getEmailTranslation returns key path, fallback to English |
| Variable interpolation failure | Low | Medium | Test all languages, validate variable names |
| Email formatting issues | Low | Low | Compare output with original English version |
| Reason handling edge case | Low | Low | Test with and without reason in all languages |
| Tone issues in translation | Low | Medium | Professional review of translations |

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
| Subject from `emails.accessDenial.subject` | `t('accessDenial.subject')` |
| Greeting from `emails.common.greeting` | `tCommon('greeting')` |
| All content from translation keys | All strings replaced |
| Variables interpolated correctly | Pass `emailVariables` to translation function |
| Fallback to English | Default behavior of `getEmailTranslation` |
| Renders correctly in all languages | Validate email structure |
| No hardcoded English remains | Code review |
| Backward compatible | Default parameter value |
| Reason section conditional | Only include when reason provided |
| Tone remains respectful | Professional review |
| HTML rendering works | Test `renderEmailHTML` with output |

## Related Tasks

### Prerequisites (Must Be Complete)
- **Task 2I.1** (REQ-E02-019): Emails namespace structure
- **Task 2I.2** (REQ-E02-020): getEmailTranslation utility function

### Parallel Tasks (Can Run Concurrently)
- **Task 2I.3**: Update `generateAccessApprovalEmail`
- **Task 2I.5**: Update `generateBetaAccessApprovalEmail`
- **Task 2I.6**: Update `generateRegistrationReminderEmail`

### Dependent Tasks (Blocked Until Complete)
- **Task 2I.7**: Add language parameter to all email function calls in API routes
- **Task 2I.8**: Generate translations for non-English languages
- **Task 2I.9**: Test email generation in each language

## Notes

### Email Content Structure

The access denial email has these sections:
1. **Greeting**: "Hello {name},"
2. **Introduction**: Appreciation for interest
3. **Denial Message**: Clear but professional denial
4. **Reason** (optional): Explanation if provided
5. **Request Details**: Account and request date
6. **Contact Note**: Guidance for questions/escalation
7. **Sign-off**: Regards and team name
8. **Footer**: Disclaimer

Each section should be preserved in the translated output.

### Tone Considerations

Access denial emails require special attention to tone:
- **Professional**: Business-appropriate language
- **Respectful**: Acknowledge the user's interest
- **Clear**: Unambiguous about the outcome
- **Helpful**: Provide guidance for next steps
- **Non-confrontational**: Avoid accusatory language

When generating translations for non-English languages (Task 2I.8), ensure:
- Professional tone maintained in all languages
- Cultural sensitivity respected
- Formal/informal address appropriate (e.g., "vous" vs "tu" in French)

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

### Optional Reason Field

The denial reason is optional in the function signature. When not provided:
- The `reason` variable will be an empty string
- The reasonLabel line should be conditionally excluded from the email
- The translated email should flow naturally without the reason section

Example without reason:
```
Hello John,

Thank you for your interest in accessing "Beach House".

Unfortunately, we're unable to approve your access request at this time.

Request Details:
...
```

Example with reason:
```
Hello John,

Thank you for your interest in accessing "Beach House".

Unfortunately, we're unable to approve your access request at this time.

Reason: User quota exceeded

Request Details:
...
```

### HTML Email Rendering

The `renderEmailHTML` function (lines 224-300) wraps plain text content in HTML markup. It should continue to work with translated content since it operates on the returned `EmailTemplate.body` string. Verify that:
- Variable replacement works correctly in HTML context
- No HTML-unsafe characters in translations
- Email renders correctly in email clients
- Denial emails maintain professional appearance in HTML format

---

*End of Implementation Overview*
