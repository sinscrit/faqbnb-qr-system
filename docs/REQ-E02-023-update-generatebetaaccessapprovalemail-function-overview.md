# REQ-E02-023: Update `generateBetaAccessApprovalEmail` Function for Localization - Implementation Overview

*Generated: 2026-01-20 18:30:00 UTC*
*Last Modified: 2026-01-20 18:30:00 UTC*

## Reference

- **Request**: REQ-E02-023 (Update generateBetaAccessApprovalEmail Function for Localization)
- **Source**: docs/gen_requests_epic2.md
- **Implementation Plan**: docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md
- **Type**: Enhancement
- **Phase**: 2I (Email Templates)
- **Task ID**: 2I.5
- **Size**: S (Small)
- **Epic**: Localization Epic 2 - Static UI Translation
- **Depends On**:
  - Epic 1 (L10N Foundation - next-intl setup)
  - REQ-E02-019 (Task 2I.1 - Emails Namespace Structure)
  - REQ-E02-020 (Task 2I.2 - Email Translation Utility Function)

## Summary

Update the `generateBetaAccessApprovalEmail` function in `/src/lib/email-templates.ts` to support multiple languages by utilizing the email translation utility and the emails namespace. This enables beta access approval emails to be sent in the recipient's preferred language rather than hardcoded English, ensuring international users receive welcoming onboarding communications in their native language.

## Goals

1. Update the function signature to accept a language preference parameter
2. Replace all hardcoded English strings with calls to `getEmailTranslation`
3. Maintain backward compatibility with existing calling code
4. Preserve all existing functionality (subject, body, variables, emoji indicators)
5. Implement graceful fallback to English when translations are unavailable
6. Support both plain text and HTML rendering with translated content
7. Ensure emails render correctly in all 6 supported languages
8. Maintain the welcoming, enthusiastic tone of the beta welcome email across all languages

## Context from Implementation Plan

### Current Implementation

From `/src/lib/email-templates.ts` (lines 77-149), the current function has:

```typescript
export function generateBetaAccessApprovalEmail(
  request: AccessRequest,
  accessCode: string,
  accountName?: string,
  baseUrl?: string
): EmailTemplate {
  const requesterName = request.requester_name || 'there';
  const accountDisplayName = accountName || 'the FAQBNB platform';
  const registrationLink = createRegistrationLink(baseUrl);
  const directRegistrationLink = createRegistrationLinkWithCode(accessCode, request.requester_email, baseUrl);

  return {
    subject: `🚀 Welcome to FAQBNB Beta - Access Granted!`,
    body: `Hello ${requesterName},

🎉 Congratulations! Your beta waitlist request has been approved, and you now have exclusive early access to FAQBNB!

Your Beta Access Details:
• Platform: ${accountDisplayName}
• Access Code: ${accessCode}
...`
  };
}
```

**Key observations:**
- Function accepts `AccessRequest`, `accessCode`, `accountName`, `baseUrl` parameters
- Called by `generateAccessApprovalEmail` when `request.source === AccessRequestSource.BETA_WAITLIST`
- Returns `EmailTemplate` with `subject`, `body`, and `variables`
- Contains approximately 35 hardcoded English strings
- Includes emoji characters (🚀, 🎉, ✨, 📱, 📊, 🛠️, 💌) for visual appeal
- Has a more enthusiastic, celebratory tone compared to standard access approval
- Includes "What to Expect" section with feature highlights
- Includes "Beta Program Notes" section with beta-specific guidance

### Function Call Chain

From `/src/lib/email-templates.ts` (lines 23-28):

```typescript
// Handle beta requests differently
if (isBetaRequest) {
  return generateBetaAccessApprovalEmail(request, accessCode, accountName, baseUrl);
}
```

The function is called internally from `generateAccessApprovalEmail` when the request source is `BETA_WAITLIST`.

### Email Namespace Structure (from Task 2I.1)

The `emails.betaAccess` namespace should provide these translation keys:

```json
{
  "betaAccess": {
    "subject": "🚀 Welcome to FAQBNB Beta - Access Granted!",
    "congratulations": "🎉 Congratulations! Your beta waitlist request has been approved, and you now have exclusive early access to FAQBNB!",
    "accessDetailsHeading": "Your Beta Access Details:",
    "platformLabel": "Platform: {accountName}",
    "accessCodeLabel": "Access Code: {accessCode}",
    "betaAccessGrantedLabel": "Beta Access Granted: {approvalDate}",
    "originalRequestLabel": "Original Request: {requestDate}",
    "gettingStartedHeading": "Getting Started with Your Beta Access:",
    "step1": "Click this direct registration link: {directLink}",
    "step1Note": "(This link pre-fills your access code and email for convenience)",
    "step2": "Complete your account registration",
    "step3": "Start exploring the platform features and capabilities",
    "yourBetaAccessCode": "Your beta access code: {accessCode}",
    "directRegistrationLink": "Direct registration link: {directLink}",
    "whatToExpectHeading": "What to Expect:",
    "feature1": "✨ Early access to all FAQBNB features",
    "feature2": "📱 QR code generation and management tools",
    "feature3": "📊 Analytics and insights dashboard",
    "feature4": "🛠️ Priority support during the beta period",
    "feature5": "💌 Direct feedback channel to influence product development",
    "betaProgramNotesHeading": "Important Beta Program Notes:",
    "note1": "Your access code provides full platform access during the beta period",
    "note2": "As a beta user, your feedback is invaluable to us",
    "note3": "Some features may be evolving - please share your experience!",
    "note4": "Keep your access code secure and don't share it with others",
    "note5": "Beta users will receive priority updates on new features",
    "excitement": "We're excited to have you as part of our exclusive beta community!"
  }
}
```

### Email Translation Utility (from Task 2I.2)

The `getEmailTranslation` utility provides:

```typescript
import { getEmailTranslation } from '@/lib/l10n/emails';

// Usage
const subject = getEmailTranslation('betaAccess.subject', language);
```

## Implementation Order

### Step 1: Update Function Signature

Add optional `language` parameter while preserving backward compatibility:

```typescript
export function generateBetaAccessApprovalEmail(
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
  key,
  language || 'en',
  variables
);
```

### Step 3: Replace Subject Line

```typescript
// Before
subject: `🚀 Welcome to FAQBNB Beta - Access Granted!`

// After
subject: t('betaAccess.subject')
```

### Step 4: Replace Body Content

Replace each hardcoded string section with translation calls, maintaining the email structure and ensuring emoji characters are preserved appropriately in translations.

### Step 5: Validate and Test

- Ensure email content matches original when `language='en'`
- Test rendering in all 6 supported languages
- Verify variable interpolation works correctly
- Confirm emoji characters display correctly across email clients

## Authorized Files and Functions for Modification

### Files to Modify

#### `/src/lib/email-templates.ts`

- **Purpose**: Email template generation functions
- **Location**: Lines 77-149 (generateBetaAccessApprovalEmail function)
- **Current State**: Contains hardcoded English strings with emoji characters
- **Modification Required**:
  - Add `language` parameter to function signature
  - Replace hardcoded strings with `getEmailTranslation` calls
  - Import email translation utility (if not already imported from Task 2I.3)

**Changes to implement:**

1. **Add/verify imports** (top of file, if not already present from Task 2I.3):

```typescript
import { getEmailTranslation } from '@/lib/l10n/emails';
import { SupportedLanguage, DEFAULT_LANGUAGE } from '@/lib/translation-service/translation-service.types';
```

2. **Update function signature** (line 84-89):

```typescript
/**
 * Generate beta access approval email template
 * For users who signed up through the beta waitlist
 * @param request - Access request data
 * @param accessCode - Generated access code
 * @param accountName - Optional account name
 * @param baseUrl - Optional base URL for links (defaults to getServerBaseUrl())
 * @param language - Optional language for email content (defaults to English)
 */
export function generateBetaAccessApprovalEmail(
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
const accountDisplayName = accountName || 'the FAQBNB platform';
const registrationLink = createRegistrationLink(baseUrl);
const directRegistrationLink = createRegistrationLinkWithCode(accessCode, request.requester_email, baseUrl);

// Variables for interpolation
const emailVariables = {
  name: requesterName,
  accountName: accountDisplayName,
  accessCode,
  requestDate: new Date(request.request_date).toLocaleDateString(),
  approvalDate: new Date().toLocaleDateString(),
  directLink: directRegistrationLink,
  registrationLink,
};

// Translation helper for this email type
const t = (key: string) => getEmailTranslation(key, language, emailVariables);
const tCommon = (key: string) => getEmailTranslation(`common.${key}`, language, emailVariables);
```

4. **Replace return statement** (lines 95-148):

```typescript
return {
  subject: t('betaAccess.subject'),
  body: `${tCommon('greeting')}

${t('betaAccess.congratulations')}

${t('betaAccess.accessDetailsHeading')}
- ${t('betaAccess.platformLabel')}
- ${t('betaAccess.accessCodeLabel')}
- ${t('betaAccess.betaAccessGrantedLabel')}
- ${t('betaAccess.originalRequestLabel')}

${t('betaAccess.gettingStartedHeading')}
1. ${t('betaAccess.step1')}
   ${t('betaAccess.step1Note')}
2. ${t('betaAccess.step2')}
3. ${t('betaAccess.step3')}

${t('betaAccess.yourBetaAccessCode')}
${t('betaAccess.directRegistrationLink')}

${t('betaAccess.whatToExpectHeading')}
${t('betaAccess.feature1')}
${t('betaAccess.feature2')}
${t('betaAccess.feature3')}
${t('betaAccess.feature4')}
${t('betaAccess.feature5')}

${t('betaAccess.betaProgramNotesHeading')}
- ${t('betaAccess.note1')}
- ${t('betaAccess.note2')}
- ${t('betaAccess.note3')}
- ${t('betaAccess.note4')}
- ${t('betaAccess.note5')}

${t('betaAccess.excitement')}

${tCommon('regards')}
${tCommon('betaTeam')}

${tCommon('separator')}
${tCommon('betaFooter')}
${tCommon('betaFooterSupport')}`,
  variables: {
    requesterName,
    accountName: accountDisplayName,
    accessCode,
    requestDate: new Date(request.request_date).toLocaleDateString(),
    approvalDate: new Date().toLocaleDateString(),
    registrationLink,
    directRegistrationLink,
    userEmail: request.requester_email
  }
};
```

### Files That May Need Updates (Calling Code)

#### `/src/lib/email-templates.ts` - generateAccessApprovalEmail function

- **Location**: Lines 26-27
- **Current Call**: `return generateBetaAccessApprovalEmail(request, accessCode, accountName, baseUrl);`
- **Required Change**: Forward the language parameter

```typescript
// Before
if (isBetaRequest) {
  return generateBetaAccessApprovalEmail(request, accessCode, accountName, baseUrl);
}

// After (should be done in Task 2I.3, verify it's in place)
if (isBetaRequest) {
  return generateBetaAccessApprovalEmail(request, accessCode, accountName, baseUrl, language);
}
```

**Note**: If Task 2I.3 is completed first, the `generateAccessApprovalEmail` function should already be forwarding the language parameter. Verify this is in place.

### Files NOT to Modify (in this task)

- `/messages/*.json` - Already created in Task 2I.1
- `/src/lib/l10n/emails/*.ts` - Created in Task 2I.2
- `generateAccessApprovalEmail` function (except delegation call) - Updated in Task 2I.3
- `generateAccessDenialEmail` function - Updated in Task 2I.4
- `generateRegistrationReminderEmail` function - Will be updated in Task 2I.6
- API route files - Language parameter addition is Task 2I.7

## Technical Specifications

### Function Signature Update

```typescript
// Before
export function generateBetaAccessApprovalEmail(
  request: AccessRequest,
  accessCode: string,
  accountName?: string,
  baseUrl?: string
): EmailTemplate

// After
export function generateBetaAccessApprovalEmail(
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
| `common.betaTeam` | Beta team signature ("The FAQBNB Beta Team") |
| `common.separator` | Visual separator ("---") |
| `common.betaFooter` | Beta-specific footer (🚀 You're part of something special!) |
| `common.betaFooterSupport` | Beta support contact info |
| `betaAccess.subject` | Email subject line (with 🚀 emoji) |
| `betaAccess.congratulations` | Opening celebration message (with 🎉 emoji) |
| `betaAccess.accessDetailsHeading` | Access details section heading |
| `betaAccess.platformLabel` | Platform line |
| `betaAccess.accessCodeLabel` | Access code line |
| `betaAccess.betaAccessGrantedLabel` | Approval date line |
| `betaAccess.originalRequestLabel` | Request date line |
| `betaAccess.gettingStartedHeading` | Getting started section heading |
| `betaAccess.step1` | First step |
| `betaAccess.step1Note` | Note about step 1 |
| `betaAccess.step2` | Second step |
| `betaAccess.step3` | Third step |
| `betaAccess.yourBetaAccessCode` | Access code display |
| `betaAccess.directRegistrationLink` | Registration link display |
| `betaAccess.whatToExpectHeading` | What to expect section heading |
| `betaAccess.feature1` | Feature 1 (with ✨ emoji) |
| `betaAccess.feature2` | Feature 2 (with 📱 emoji) |
| `betaAccess.feature3` | Feature 3 (with 📊 emoji) |
| `betaAccess.feature4` | Feature 4 (with 🛠️ emoji) |
| `betaAccess.feature5` | Feature 5 (with 💌 emoji) |
| `betaAccess.betaProgramNotesHeading` | Important notes heading |
| `betaAccess.note1` - `betaAccess.note5` | Five beta program notes |
| `betaAccess.excitement` | Closing excitement message |

### Variables for Interpolation

| Variable | Type | Description |
|----------|------|-------------|
| `{name}` | string | Recipient's name or "there" |
| `{accountName}` | string | Account/platform display name |
| `{accessCode}` | string | Generated 12-character access code |
| `{requestDate}` | string | Formatted original request date |
| `{approvalDate}` | string | Formatted approval date |
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

### Emoji Handling in Translations

The beta email uses several emoji characters for visual appeal. Translation guidelines:

1. **Keep emojis in translations**: Emojis are universal and should be preserved
2. **Subject line emoji**: 🚀 at start of subject is intentional branding
3. **Feature list emojis**: ✨📱📊🛠️💌 provide visual scanning aids
4. **Footer emoji**: 🚀 reinforces beta branding

Translators should preserve emoji placement while translating surrounding text.

## Usage Patterns

### Basic Usage (English - Unchanged)

```typescript
// Existing internal calls continue to work
const emailTemplate = generateBetaAccessApprovalEmail(
  accessRequest,
  'ABC123DEF456',
  'FAQBNB Platform',
  'https://faqbnb.com'
);
// Returns English email
```

### With Language Specification

```typescript
// New usage with language parameter
const emailTemplate = generateBetaAccessApprovalEmail(
  accessRequest,
  'ABC123DEF456',
  'FAQBNB Platform',
  'https://faqbnb.com',
  'es'  // Spanish
);
// Returns Spanish email with preserved emojis
```

### Called from generateAccessApprovalEmail

```typescript
// When request.source === AccessRequestSource.BETA_WAITLIST
// The generateAccessApprovalEmail function delegates:
if (isBetaRequest) {
  return generateBetaAccessApprovalEmail(request, accessCode, accountName, baseUrl, language);
}
```

## Success Validation Checklist

### Function Modification
- [ ] Function signature updated with `language` parameter
- [ ] Default value set to `DEFAULT_LANGUAGE` ('en')
- [ ] Email translation utility imported (if not already present)
- [ ] SupportedLanguage type imported (if not already present)

### Translation Integration
- [ ] Subject line retrieved from `betaAccess.subject`
- [ ] Greeting retrieved from `common.greeting`
- [ ] Congratulations message retrieved from `betaAccess.congratulations`
- [ ] All access details retrieved from `betaAccess.*` keys
- [ ] All getting started steps retrieved from `betaAccess.*` keys
- [ ] All feature highlights retrieved from `betaAccess.feature*` keys
- [ ] All beta program notes retrieved from `betaAccess.note*` keys
- [ ] Closing excitement message retrieved from `betaAccess.excitement`
- [ ] Common elements (regards, footer) use `common.*` keys
- [ ] Variables properly passed to translation function

### Backward Compatibility
- [ ] Existing calls from `generateAccessApprovalEmail` work correctly
- [ ] Return type remains `EmailTemplate`
- [ ] Variables object structure unchanged
- [ ] Delegation from `generateAccessApprovalEmail` includes language parameter

### Content Validation
- [ ] English output matches original content exactly
- [ ] All placeholders replaced correctly
- [ ] Email structure (headings, bullet points, feature list) preserved
- [ ] Emoji characters preserved in all language outputs
- [ ] No hardcoded English strings remain
- [ ] Enthusiastic, welcoming tone maintained across languages

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
- [ ] Variable interpolation works in all languages
- [ ] Fallback to English works when translation missing
- [ ] Emoji characters display correctly
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

- **Risk Level**: Low-Medium
- **Rationale**:
  - Modifies existing production function
  - Maintains backward compatibility
  - English fallback ensures functionality
  - Email sending still works if translation fails
  - Easy to test and validate
  - Function is internal (called by generateAccessApprovalEmail)

### Potential Issues

| Issue | Likelihood | Impact | Mitigation |
|-------|------------|--------|------------|
| Missing translation key | Low | Medium | getEmailTranslation returns key path, fallback to English |
| Variable interpolation failure | Low | Medium | Test all languages, validate variable names |
| Emoji rendering in translations | Low | Low | Keep emojis in translation files |
| Email formatting issues | Low | Low | Compare output with original English version |
| Circular import | Low | High | Import from barrel exports, avoid deep imports |
| Type mismatch | Low | Medium | Use explicit SupportedLanguage type |
| Tone inconsistency in translations | Medium | Medium | Review translations for enthusiastic tone |

### Rollback Strategy

If issues occur:
1. Revert `language` parameter from function
2. Restore original hardcoded strings
3. Email functionality returns to English-only
4. Update delegation call in generateAccessApprovalEmail

## Acceptance Criteria Mapping

| Acceptance Criteria | Implementation |
|---------------------|----------------|
| Function accepts language preference | `language: SupportedLanguage` parameter |
| Uses email translation utility | Import and use `getEmailTranslation` |
| Subject from `emails.betaAccess.subject` | `t('betaAccess.subject')` |
| Greeting from `emails.common.greeting` | `tCommon('greeting')` |
| All content from translation keys | All strings replaced |
| Variables interpolated correctly | Pass `emailVariables` to translation function |
| Fallback to English | Default behavior of `getEmailTranslation` |
| Renders correctly in all languages | Validate email structure |
| No hardcoded English remains | Code review |
| Backward compatible | Default parameter value |
| HTML rendering works | Test `renderEmailHTML` with output |
| Welcome tone maintained | Review translated content for enthusiasm |
| Emoji characters preserved | Emojis included in translation keys |

## Related Tasks

### Prerequisites (Must Be Complete)
- **Task 2I.1** (REQ-E02-019): Emails namespace structure
- **Task 2I.2** (REQ-E02-020): getEmailTranslation utility function
- **Task 2I.3** (REQ-E02-021): Update generateAccessApprovalEmail (for language parameter forwarding)

### Parallel Tasks (Can Run Concurrently)
- **Task 2I.4** (REQ-E02-022): Update `generateAccessDenialEmail`
- **Task 2I.6**: Update `generateRegistrationReminderEmail`

### Dependent Tasks (Blocked Until Complete)
- **Task 2I.7**: Add language parameter to all email function calls in API routes
- **Task 2I.8**: Generate translations for non-English languages
- **Task 2I.9**: Test email generation in each language

## Notes

### Email Content Structure

The beta access approval email has these sections:
1. **Greeting**: "Hello {name},"
2. **Congratulations**: Celebration message with 🎉 emoji
3. **Beta Access Details**: Platform, code, approval date, request date
4. **Getting Started**: 3-step process to complete access
5. **What to Expect**: 5 feature highlights with emojis
6. **Beta Program Notes**: 5 important notes for beta users
7. **Closing Excitement**: Welcoming message
8. **Sign-off**: Regards and beta team name
9. **Footer**: Beta-specific disclaimer with 🚀 emoji

Each section should be preserved in the translated output with appropriate tone.

### Date Formatting

The function uses two date values:
- `requestDate`: Original waitlist signup date
- `approvalDate`: Current date when approval is processed

Both are formatted using `toLocaleDateString()`. For full localization, consider using `Intl.DateTimeFormat` with the target language:

```typescript
const formatDate = (date: Date) => new Intl.DateTimeFormat(language, {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
}).format(date);

const requestDate = formatDate(new Date(request.request_date));
const approvalDate = formatDate(new Date());
```

This enhancement can be added in this task or as a follow-up.

### Tone Considerations for Translations

The beta email has a distinctly enthusiastic, celebratory tone compared to the standard access approval email. When reviewing translations, ensure:

1. **Congratulations convey excitement**: The 🎉 emoji alone isn't sufficient; the text should feel celebratory
2. **Feature highlights sound appealing**: Each feature should be presented positively
3. **Closing message maintains warmth**: "We're excited to have you" should translate to equivalent warmth
4. **Formal vs informal**: Languages with formal/informal distinction should use appropriately welcoming register

### HTML Email Rendering

The `renderEmailHTML` function (lines 224-300 in email-templates.ts) wraps plain text content in HTML markup. It should continue to work with translated content since it operates on the returned `EmailTemplate.body` string. Verify that:
- Variable replacement works correctly in HTML context
- No HTML-unsafe characters in translations
- Emoji characters render correctly in HTML
- Email renders correctly across email clients

### Emoji Support in Email Clients

Most modern email clients support emoji characters. However, verify:
- Gmail (web, iOS, Android)
- Apple Mail
- Outlook (desktop, web)
- Mobile email clients

If emoji rendering issues occur in specific clients, consider using HTML entity codes or images as fallback.

---

*End of Implementation Overview*
