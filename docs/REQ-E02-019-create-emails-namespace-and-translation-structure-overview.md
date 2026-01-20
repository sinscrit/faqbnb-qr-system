# REQ-E02-019: Create Emails Namespace and Translation Structure - Implementation Overview

*Generated: 2026-01-20 09:45:00 UTC*
*Last Modified: 2026-01-20 09:45:00 UTC*

## Reference

- **Request**: REQ-E02-019 (Create Emails Namespace and Translation Structure)
- **Source**: docs/gen_requests_epic2.md
- **Implementation Plan**: docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md
- **Type**: New Feature
- **Phase**: 2I (Email Templates)
- **Task ID**: 2I.1
- **Size**: M (Medium)
- **Epic**: Localization Epic 2 - Static UI Translation
- **Depends On**: Epic 1 (L10N Foundation - next-intl setup)

## Summary

Create a dedicated `emails` namespace within the localization messages file containing all UI strings and content templates for transactional emails, notifications, and system-generated messages sent to users. This task establishes the translation structure that will enable email content to be sent in the recipient's preferred language.

## Goals

1. Create a well-organized `emails` namespace in `/messages/en.json` with categorized email content
2. Structure email strings by type: access approval, access denial, beta access, registration reminder
3. Separate email subjects from body content for independent translation
4. Include common email elements: greetings, signatures, footers, legal disclaimers
5. Support both plain text and HTML email template requirements
6. Document placeholder variables for dynamic content (user names, links, dates)
7. Enable server-side email generation in the recipient's preferred language

## Context from Implementation Plan

### Existing Email Templates

The current `/src/lib/email-templates.ts` contains four email generation functions with hardcoded English content:

| Function | Purpose | Estimated Strings |
|----------|---------|-------------------|
| `generateAccessApprovalEmail` | Account access granted notification | ~25 |
| `generateBetaAccessApprovalEmail` | Beta program welcome email | ~35 |
| `generateAccessDenialEmail` | Access request declined notification | ~15 |
| `generateRegistrationReminderEmail` | Pending registration follow-up | ~20 |

**Total Estimated Strings**: ~200 (including common elements)

### Current Email Structure (from `/src/lib/email-templates.ts`)

```typescript
// Current hardcoded structure
return {
  subject: `Access Granted: ${accountDisplayName} - Your Access Code`,
  body: `Hello ${requesterName},

Great news! Your access request for "${accountDisplayName}" has been approved.
...`
};
```

### Target Email Translation Approach (from Plan-111)

Email templates require a different approach from UI components since they:
- Are server-side only
- Must be sent in the recipient's preferred language (not the sender's)
- Use variable interpolation for personalization
- May need both plain text and HTML versions

### Translation Key Convention (from Plan-111)

```
emails.{emailType}.{element}
```

Examples:
- `emails.accessApproval.subject` - Access approval email subject line
- `emails.accessApproval.greeting` - Email greeting
- `emails.common.signature` - Common email signature
- `emails.common.footer` - Standard email footer

## Implementation Order

### Step 1: Analyze Existing Email Templates

Review `/src/lib/email-templates.ts` to:
- Extract all unique text strings from each email type
- Identify common elements shared across emails
- Document all dynamic placeholders (`{variable}` format)

### Step 2: Design Namespace Structure

Create categorized structure for email translations:

```json
{
  "emails": {
    "common": { ... },           // Shared elements
    "accessApproval": { ... },   // Account access granted
    "betaAccess": { ... },       // Beta program access
    "accessDenial": { ... },     // Access request declined
    "registrationReminder": { ... }  // Follow-up reminder
  }
}
```

### Step 3: Create English Translation Entries

Add all email strings to `/messages/en.json` with:
- Clear key naming
- Proper variable placeholders
- Comments/documentation for complex strings

### Step 4: Apply Structure to All Language Files

Update all 6 language files with the same structure:
- `/messages/en.json` (complete translations)
- `/messages/fr.json`, `/messages/es.json`, `/messages/de.json`, `/messages/nl.json`, `/messages/it.json` (English placeholders initially)

### Step 5: Validate JSON Structure

- Ensure valid JSON syntax
- Verify all placeholders are consistent
- Check for duplicate keys

## Authorized Files and Functions for Modification

### Files to Modify

#### `/messages/en.json`

- **Purpose**: English translation source file (source of truth)
- **Current State**: Contains `common`, `auth`, `dashboard`, `items`, `errors`, `language` namespaces
- **Modification Required**: Add new `emails` namespace with complete email content structure
- **Changes**:
  - Add `emails` root namespace
  - Create subcategories for each email type
  - Include common email elements (greetings, signatures, footers)
  - Document all placeholder variables

**Target Structure:**

```json
{
  "emails": {
    "common": {
      "greeting": "Hello {name},",
      "greetingGeneric": "Hello there,",
      "regards": "Best regards,",
      "team": "The FAQBNB Team",
      "betaTeam": "The FAQBNB Beta Team",
      "footer": "This is an automated message. Please do not reply to this email.",
      "footerSupport": "If you need assistance, please contact support through the FAQBNB platform.",
      "betaFooter": "You're part of something special! Thank you for joining our beta program.",
      "betaFooterSupport": "For beta support or feedback, please contact us through the platform or reply to this email.",
      "separator": "---",
      "accessCode": "Access Code",
      "account": "Account",
      "requestedOn": "Requested on",
      "platform": "Platform",
      "betaAccessGranted": "Beta Access Granted",
      "originalRequest": "Original Request"
    },
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
    },
    "betaAccess": {
      "subject": "Welcome to FAQBNB Beta - Access Granted!",
      "congratulations": "Congratulations! Your beta waitlist request has been approved, and you now have exclusive early access to FAQBNB!",
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
      "feature1": "Early access to all FAQBNB features",
      "feature2": "QR code generation and management tools",
      "feature3": "Analytics and insights dashboard",
      "feature4": "Priority support during the beta period",
      "feature5": "Direct feedback channel to influence product development",
      "betaNotesHeading": "Important Beta Program Notes:",
      "betaNote1": "Your access code provides full platform access during the beta period",
      "betaNote2": "As a beta user, your feedback is invaluable to us",
      "betaNote3": "Some features may be evolving - please share your experience!",
      "betaNote4": "Keep your access code secure and don't share it with others",
      "betaNote5": "Beta users will receive priority updates on new features",
      "excited": "We're excited to have you as part of our exclusive beta community!"
    },
    "accessDenial": {
      "subject": "Access Request Update: {accountName}",
      "intro": "Thank you for your interest in accessing \"{accountName}\".",
      "message": "Unfortunately, we're unable to approve your access request at this time.",
      "reasonLabel": "Reason: {reason}",
      "requestDetailsHeading": "Request Details:",
      "accountLabel": "Account: {accountName}",
      "requestedOnLabel": "Requested on: {requestDate}",
      "contactNote": "If you believe this is an error or have questions about this decision, please contact the account owner directly."
    },
    "registrationReminder": {
      "subject": "Reminder: Complete Your {accountName} Access Setup",
      "intro": "This is a friendly reminder that your access to \"{accountName}\" was approved {daysSinceApproval} days ago, but you haven't completed your registration yet.",
      "yourAccessCode": "Your Access Code: {accessCode}",
      "instructionsHeading": "To complete your access setup:",
      "step1": "Click this direct registration link: {directLink}",
      "step1Note": "(This link pre-fills your access code and email for convenience)",
      "step2": "Complete your account registration",
      "alternativeInstructions": "Alternative: Visit {registrationLink} and enter your access code: {accessCode}",
      "encouragement": "Your access code will remain valid, but completing your registration will allow you to start exploring the account's items and resources.",
      "contactNote": "If you no longer need access or have any questions, please let us know."
    }
  }
}
```

#### `/messages/fr.json`, `/messages/es.json`, `/messages/de.json`, `/messages/nl.json`, `/messages/it.json`

- **Purpose**: Non-English translation files
- **Modification Required**: Add same `emails` namespace structure (English placeholders initially)
- **Note**: Actual translations will be generated in Task 2I.8

### Files NOT to Modify (in this task)

- `/src/lib/email-templates.ts` - Will be updated in Tasks 2I.2-2I.7
- `/src/lib/i18n/config.ts` - No changes needed
- `/src/lib/i18n/index.ts` - No changes needed
- Any component files - Email templates are server-side only

### New Files to Create

#### `/src/lib/i18n/email-translations.ts` (Prepared for Task 2I.2)

This task creates the namespace structure. Task 2I.2 will create the utility function to consume it:

```typescript
// Preview of Task 2I.2 implementation
import { SupportedLanguage } from '@/types';

export function getEmailTranslation(
  key: string,
  language: SupportedLanguage,
  variables?: Record<string, string>
): string {
  // Implementation in Task 2I.2
}
```

## Technical Specifications

### Variable Placeholder Convention

All dynamic content uses `{variable}` syntax for consistency with ICU message format:

| Variable | Description | Used In |
|----------|-------------|---------|
| `{name}` | Recipient's name | Greetings |
| `{accountName}` | Account/organization name | Subject, body |
| `{accessCode}` | Generated access code | Body |
| `{requestDate}` | Date access was requested | Body |
| `{approvalDate}` | Date access was approved | Beta emails |
| `{directLink}` | Registration link with pre-filled code | Steps |
| `{registrationLink}` | Generic registration link | Reminder |
| `{daysSinceApproval}` | Days since approval | Reminder |
| `{reason}` | Denial reason | Denial email |

### Email Type Categories

| Category | Keys Count | Description |
|----------|------------|-------------|
| `common` | ~15 | Shared elements (greetings, signatures, labels) |
| `accessApproval` | ~18 | Account access granted notification |
| `betaAccess` | ~25 | Beta program welcome email |
| `accessDenial` | ~10 | Access request declined notification |
| `registrationReminder` | ~12 | Pending registration follow-up |

### Email Subject Line Considerations

Subject lines are separated for:
- Independent translation control
- Character limit awareness (50-60 characters recommended)
- A/B testing capability
- Preview text optimization

```json
{
  "accessApproval": {
    "subject": "Access Granted: {accountName} - Your Access Code"
  }
}
```

### HTML vs Plain Text Support

The namespace structure supports both formats:
- Plain text: Use translations directly
- HTML: Use translations within HTML templates (rendering handled by `renderEmailHTML`)

The current HTML rendering in `renderEmailHTML` will need to be updated in Tasks 2I.3-2I.6 to use translated strings.

## Usage Patterns

### Server-Side Email Translation (Preview of Task 2I.2)

```typescript
// Future usage pattern after Task 2I.2
import { getEmailTranslation } from '@/lib/i18n/email-translations';

const subject = getEmailTranslation(
  'accessApproval.subject',
  userLanguage,
  { accountName: 'Beach House' }
);
// Returns: "Access Granted: Beach House - Your Access Code"
```

### Direct Message Bundle Access

```typescript
import messages from '@/messages/en.json';

const subject = messages.emails.accessApproval.subject
  .replace('{accountName}', 'Beach House');
```

### Fallback Strategy

When a translation is missing:
1. Fall back to English
2. Log warning in development
3. Return key path in production (for debugging)

```typescript
const translation = messages[language]?.emails?.[key]
  || messages['en'].emails[key]
  || key;
```

## Migration Considerations

### Backward Compatibility

This task only creates the namespace structure. The email generation functions will continue to use hardcoded strings until Tasks 2I.3-2I.6 update them.

**Migration Order:**
1. **Task 2I.1** (this task): Create namespace structure
2. **Task 2I.2**: Create `getEmailTranslation` utility
3. **Tasks 2I.3-2I.6**: Update each email function to use translations
4. **Task 2I.7**: Add language parameter to all functions
5. **Task 2I.8**: Generate translations for non-English languages

### String Extraction from Current Templates

The following strings need to be extracted from `/src/lib/email-templates.ts`:

**From `generateAccessApprovalEmail`:**
- Subject line
- Greeting
- Main message paragraphs
- Instructions list items
- Important notes
- Sign-off

**From `generateBetaAccessApprovalEmail`:**
- Subject line (with emoji)
- Congratulations message
- "What to Expect" features list
- Beta-specific notes

**From `generateAccessDenialEmail`:**
- Subject line
- Intro message
- Denial message
- Contact note

**From `generateRegistrationReminderEmail`:**
- Subject line
- Reminder intro
- Instructions
- Encouragement message

## Success Validation Checklist

### Structure Validation
- [ ] `emails` namespace exists in `/messages/en.json`
- [ ] `emails.common` contains shared email elements (~15 strings)
- [ ] `emails.accessApproval` contains access approval content (~18 strings)
- [ ] `emails.betaAccess` contains beta welcome content (~25 strings)
- [ ] `emails.accessDenial` contains denial content (~10 strings)
- [ ] `emails.registrationReminder` contains reminder content (~12 strings)

### Placeholder Validation
- [ ] All dynamic variables use `{variable}` syntax
- [ ] Variable names are consistent across related strings
- [ ] All placeholders documented with descriptions

### JSON Validation
- [ ] `/messages/en.json` is valid JSON
- [ ] All 6 language files contain `emails` namespace
- [ ] No duplicate keys within namespaces
- [ ] No unterminated brackets or braces

### Content Validation
- [ ] Subject lines are concise (under 60 characters before interpolation)
- [ ] Body content matches existing email templates
- [ ] Tone is professional and consistent
- [ ] Instructions are clear and actionable

### Integration Validation
- [ ] Application builds without errors: `npm run build`
- [ ] JSON can be imported and parsed
- [ ] Placeholder interpolation works correctly

## Dependencies

### Required (Already Installed)
- `next-intl` - i18n framework (installed in Epic 1)
- TypeScript 5.x - Type checking

### No New Dependencies Required
This task only modifies JSON translation files.

## Risk Assessment

- **Risk Level**: Low
- **Rationale**:
  - Changes are additive (new namespace)
  - JSON files have no runtime execution risk
  - Email functionality unchanged until later tasks
  - Easy to validate with JSON linting
  - Rollback is straightforward (remove namespace)

### Potential Issues

| Issue | Likelihood | Impact | Mitigation |
|-------|------------|--------|------------|
| Missing placeholder in extraction | Medium | Low | Cross-reference with existing templates |
| Inconsistent variable naming | Low | Low | Document naming convention |
| JSON syntax errors | Low | Medium | Validate with JSON linter before commit |
| Email content mismatch | Low | Medium | Side-by-side comparison with existing emails |

## Acceptance Criteria Mapping

| Acceptance Criteria | Implementation |
|---------------------|----------------|
| Emails namespace created | Add `emails` key to `/messages/en.json` |
| Common elements included | `emails.common` with greetings, signatures, footers |
| Authentication emails included | `emails.accessApproval`, `emails.accessDenial` |
| Beta access emails included | `emails.betaAccess` |
| Registration reminder included | `emails.registrationReminder` |
| Subject lines separated | Each email type has `.subject` key |
| Placeholders documented | Variable descriptions in this overview |
| Consistent naming conventions | Follow `emails.{type}.{element}` pattern |
| Structure supports plain text and HTML | Strings are format-agnostic |

## Future Integration Points

This namespace structure will be consumed by:

1. **Task 2I.2**: `getEmailTranslation` utility function
2. **Task 2I.3**: Updated `generateAccessApprovalEmail`
3. **Task 2I.4**: Updated `generateAccessDenialEmail`
4. **Task 2I.5**: Updated `generateBetaAccessApprovalEmail`
5. **Task 2I.6**: Updated `generateRegistrationReminderEmail`
6. **Task 2I.7**: Language parameter addition
7. **Task 2I.8**: Non-English translation generation
8. **Task 2I.9**: Email testing in each language

## Notes

### Alignment with Plan-111

This implementation follows the exact structure specified in Plan-111, Section "Sub-Epic 2I: Email Templates":
- Same namespace organization
- Same email types covered
- Same variable interpolation pattern
- Same separation of subjects and bodies

### Email Content Characteristics

Transactional emails have specific requirements:
- **Deliverability**: Clear subject lines, professional tone
- **Accessibility**: Plain text versions, clear structure
- **Personalization**: Dynamic content with user/account names
- **Legal**: Proper footer with unsubscribe/contact info
- **Branding**: Consistent FAQBNB identity

### Character Set Considerations

For non-Latin scripts (future translations):
- Japanese and Chinese translations will require proper UTF-8 encoding
- Email clients have varying support for Unicode
- Subject lines should be ASCII-compatible when possible

### Translation Priority

For Task 2I.8, prioritize:
1. Subject lines (highest visibility)
2. Greeting and sign-off (brand consistency)
3. Action items/steps (user critical)
4. Informational paragraphs (lower priority)
5. Legal disclaimers (may require legal review)

---

*End of Implementation Overview*
