# REQ-E02-026: Generate Translations for Email Templates Namespace

## Document Information

| Field | Value |
|-------|-------|
| **Request ID** | REQ-E02-026 |
| **Title** | Generate Translations for Email Templates Namespace |
| **Type** | NEW FEATURE |
| **Size** | M (Medium) |
| **Phase** | 2I (Email Templates) |
| **Task ID** | 2I.8 |
| **Epic** | L10N Epic 2 - Static UI Translation |
| **Sub-Epic** | 2I - Email Templates |
| **Created** | 2026-01-20 |
| **Last Modified** | 2026-01-20 |
| **Plan Reference** | Plan-111-L10N-Epic2-Static-UI-Translation.md |

---

## Summary

Translation files for all email templates namespace strings should be generated for the five supported non-English languages: Spanish (es), French (fr), German (de), Dutch (nl), and Italian (it). This task creates complete translations for all email content extracted from email generation functions including access approval emails, access denial emails, beta access approval emails, and registration reminder emails.

---

## Dependencies

### Prerequisites (Must Be Complete Before This Task)

| Task ID | Description | Status |
|---------|-------------|--------|
| 2I.1 | Create emails namespace and translation structure in `/messages/en.json` | Required |
| 2I.2 | Create `getEmailTranslation` utility function | Required |
| 2I.3 | Update `generateAccessApprovalEmail` function | Required |
| 2I.4 | Update `generateAccessDenialEmail` function | Required |
| 2I.5 | Update `generateBetaAccessApprovalEmail` function | Required |
| 2I.6 | Update `generateRegistrationReminderEmail` function | Required |
| 2I.7 | Add language parameter to all email generation functions | Required |

### Foundation Dependencies (Epic 1)

| Component | Location | Purpose |
|-----------|----------|---------|
| i18n config | `/src/lib/i18n/config.ts` | Locale definitions (en, fr, es, de, nl, it) |
| Message files structure | `/messages/*.json` | Translation file organization |

---

## Current State Analysis

### Existing Email Templates

The current email generation functions in `/src/lib/email-templates.ts` contain hardcoded English content:

1. **generateAccessApprovalEmail** (~25 translatable strings)
   - Subject line, greeting, approval message, access details section
   - Registration instructions, important notes, signature

2. **generateAccessDenialEmail** (~15 translatable strings)
   - Subject line, greeting, denial message
   - Request details, contact information, signature

3. **generateBetaAccessApprovalEmail** (~35 translatable strings)
   - Subject line with emoji, congratulations message
   - Beta access details, getting started section
   - Feature list, important notes, signature

4. **generateRegistrationReminderEmail** (~20 translatable strings)
   - Subject line, greeting, reminder message
   - Registration instructions, encouragement, signature

### Existing Translation Infrastructure

- **Supported Languages**: English (en), French (fr), Spanish (es), German (de), Dutch (nl), Italian (it)
- **Translation Files**: Located in `/messages/` directory
- **Current Structure**: Namespaces for common, auth, dashboard, items, errors, language

### Estimated Email String Count

| Email Type | Estimated Strings |
|------------|-------------------|
| Common elements (greetings, footers, signatures) | ~15 |
| Access Approval | ~25 |
| Access Denial | ~15 |
| Beta Access Approval | ~35 |
| Registration Reminder | ~20 |
| **Total** | **~110 strings** |

---

## Implementation Approach

### Translation Strategy

1. **Quality Priority**: Use professional-quality translations appropriate for email communications
2. **Tone Consistency**: Maintain friendly, professional tone across all languages
3. **Formality Level**: Follow language-specific conventions (e.g., formal "vous" in French business emails)
4. **Cultural Adaptation**: Adapt phrasing for cultural appropriateness while maintaining message intent

### Translation Categories

#### Common Email Elements
- Greetings and closings
- Signature blocks
- Footer disclaimers
- Common phrases (e.g., "Best regards", "Important Notes")

#### Email-Specific Content
- Subject lines (concise, clear for inbox display)
- Body content paragraphs
- Call-to-action text
- Instructional steps
- Warning/informational notes

### Interpolation Variables

Ensure all translations preserve these placeholder patterns:
- `{requesterName}` - Recipient's name
- `{accountName}` / `{accountDisplayName}` - Account or property name
- `{accessCode}` - Generated access code
- `{requestDate}` - Date of original request
- `{directRegistrationLink}` - Registration URL with pre-filled data
- `{registrationLink}` - Base registration URL
- `{daysSinceApproval}` - Days elapsed since approval
- `{reason}` - Denial reason (optional)

---

## Expected Namespace Structure

```json
{
  "emails": {
    "common": {
      "greeting": "Hello {name},",
      "regards": "Best regards,",
      "team": "The FAQBNB Team",
      "footer": "This is an automated message. Please do not reply to this email.",
      "footerSupport": "If you need assistance, please contact support through the FAQBNB platform.",
      "importantNotes": "Important Notes:",
      "accessDetails": "Your Access Details:",
      "toCompleteSetup": "To complete your access setup:"
    },
    "accessApproval": {
      "subject": "Access Granted: {accountName} - Your Access Code",
      "intro": "Great news! Your access request for \"{accountName}\" has been approved.",
      "account": "Account: {accountName}",
      "code": "Access Code: {accessCode}",
      "requestedOn": "Requested on: {date}",
      "step1": "Click this direct registration link: {link}",
      "step1Note": "(This link pre-fills your access code and email for convenience)",
      "step2": "Complete your account registration",
      "step3": "Start exploring the items and resources",
      "yourCode": "Your access code: {accessCode}",
      "directLink": "Direct registration link: {link}",
      "note1": "Keep your access code secure and don't share it with others",
      "note2": "Your access code will remain valid until you complete registration",
      "note3": "If you have any questions, please contact the account owner"
    },
    "accessDenial": {
      "subject": "Access Request Update: {accountName}",
      "intro": "Thank you for your interest in accessing \"{accountName}\".",
      "message": "Unfortunately, we're unable to approve your access request at this time.",
      "reason": "Reason: {reason}",
      "requestDetails": "Request Details:",
      "contactOwner": "If you believe this is an error or have questions about this decision, please contact the account owner directly."
    },
    "betaAccess": {
      "subject": "Welcome to FAQBNB Beta - Access Granted!",
      "congratulations": "Congratulations! Your beta waitlist request has been approved, and you now have exclusive early access to FAQBNB!",
      "detailsTitle": "Your Beta Access Details:",
      "platform": "Platform: {accountName}",
      "accessGranted": "Beta Access Granted: {date}",
      "originalRequest": "Original Request: {date}",
      "gettingStarted": "Getting Started with Your Beta Access:",
      "yourCode": "Your beta access code: {accessCode}",
      "whatToExpect": "What to Expect:",
      "feature1": "Early access to all FAQBNB features",
      "feature2": "QR code generation and management tools",
      "feature3": "Analytics and insights dashboard",
      "feature4": "Priority support during the beta period",
      "feature5": "Direct feedback channel to influence product development",
      "betaNotes": "Important Beta Program Notes:",
      "betaNote1": "Your access code provides full platform access during the beta period",
      "betaNote2": "As a beta user, your feedback is invaluable to us",
      "betaNote3": "Some features may be evolving - please share your experience!",
      "betaNote4": "Keep your access code secure and don't share it with others",
      "betaNote5": "Beta users will receive priority updates on new features",
      "excitement": "We're excited to have you as part of our exclusive beta community!",
      "betaTeam": "The FAQBNB Beta Team",
      "betaFooter": "You're part of something special! Thank you for joining our beta program.",
      "betaSupport": "For beta support or feedback, please contact us through the platform or reply to this email."
    },
    "registrationReminder": {
      "subject": "Reminder: Complete Your {accountName} Access Setup",
      "intro": "This is a friendly reminder that your access to \"{accountName}\" was approved {days} days ago, but you haven't completed your registration yet.",
      "yourCode": "Your Access Code: {accessCode}",
      "alternative": "Alternative: Visit {link} and enter your access code: {code}",
      "codeValid": "Your access code will remain valid, but completing your registration will allow you to start exploring the account's items and resources.",
      "noLongerNeed": "If you no longer need access or have any questions, please let us know."
    }
  }
}
```

---

## Authorized Files and Functions for Modification

### Files to Create/Modify

| File Path | Action | Purpose |
|-----------|--------|---------|
| `/messages/en.json` | Modify | Add/verify `emails` namespace structure |
| `/messages/fr.json` | Modify | Add French translations for `emails` namespace |
| `/messages/es.json` | Modify | Add Spanish translations for `emails` namespace |
| `/messages/de.json` | Modify | Add German translations for `emails` namespace |
| `/messages/nl.json` | Modify | Add Dutch translations for `emails` namespace |
| `/messages/it.json` | Modify | Add Italian translations for `emails` namespace |

### Functions to Reference (Read-Only)

| File | Function | Purpose |
|------|----------|---------|
| `/src/lib/email-templates.ts` | `generateAccessApprovalEmail` | Source strings for access approval |
| `/src/lib/email-templates.ts` | `generateAccessDenialEmail` | Source strings for access denial |
| `/src/lib/email-templates.ts` | `generateBetaAccessApprovalEmail` | Source strings for beta approval |
| `/src/lib/email-templates.ts` | `generateRegistrationReminderEmail` | Source strings for reminders |

---

## Acceptance Criteria

### Translation Completeness

- [ ] French translation file includes complete translations for all `emails` namespace strings
- [ ] Spanish translation file includes complete translations for all `emails` namespace strings
- [ ] German translation file includes complete translations for all `emails` namespace strings
- [ ] Dutch translation file includes complete translations for all `emails` namespace strings
- [ ] Italian translation file includes complete translations for all `emails` namespace strings

### Translation Quality

- [ ] All translations maintain semantic accuracy with source English text
- [ ] Email subject lines are concise, clear, and inbox-appropriate in each language
- [ ] Email greetings follow culturally appropriate formality levels
- [ ] Body content maintains professional, friendly tone appropriate for transactional emails
- [ ] Call-to-action text is clear, action-oriented, and motivating
- [ ] Legal disclaimers and footer text maintain appropriate formality and clarity

### Technical Requirements

- [ ] All interpolation variables (`{name}`, `{accountName}`, etc.) are preserved correctly
- [ ] Character encoding is correct for all scripts (including special characters: e, e, u, n, etc.)
- [ ] Translations are grammatically correct and naturally phrased
- [ ] No English strings remain as placeholders in any language file
- [ ] Translation files follow established namespace hierarchy structure

### Tone and Cultural Adaptation

- [ ] Motivational/welcoming tones in approval emails translate naturally
- [ ] Sensitive tones in denial emails maintain respectfulness and empathy
- [ ] Formal vs. informal address handled appropriately per language (e.g., vous/tu in French, Sie/du in German)
- [ ] Email length and structure remain appropriate for inbox readability

---

## Translation Guidelines by Language

### French (fr)
- Use formal "vous" address for business communication
- Maintain professional but warm tone
- Preserve accent characters (e, e, a, u, c, etc.)

### Spanish (es)
- Use formal "usted" for business communication
- Consider Latin American Spanish (neutral) as primary variant
- Preserve accent characters (a, e, i, n, u, etc.)

### German (de)
- Use formal "Sie" address for business communication
- German tends to be more formal in business contexts
- Preserve umlauts (a, o, u) and eszett (ss)

### Dutch (nl)
- Use formal "u" address
- Direct but polite communication style
- Similar structure to German but more concise

### Italian (it)
- Use formal "Lei" address for business communication
- Maintain warm, relationship-focused tone
- Preserve accent characters (a, e, i, o, u)

---

## Implementation Tasks

### Task Breakdown

| # | Task | Est. Effort |
|---|------|-------------|
| 1 | Verify English `emails` namespace in `/messages/en.json` | 15 min |
| 2 | Create French translations for `emails` namespace | 45 min |
| 3 | Create Spanish translations for `emails` namespace | 45 min |
| 4 | Create German translations for `emails` namespace | 45 min |
| 5 | Create Dutch translations for `emails` namespace | 45 min |
| 6 | Create Italian translations for `emails` namespace | 45 min |
| 7 | Verify all interpolation variables preserved | 15 min |
| 8 | Review translations for consistency and quality | 30 min |

**Total Estimated Effort**: ~4.5 hours

---

## Testing Strategy

### Verification Steps

1. **Structure Validation**
   - Verify all language files have identical key structure
   - Check for missing keys using JSON diff tools

2. **Variable Preservation**
   - Verify all `{placeholder}` patterns exist in translations
   - Test interpolation with sample data

3. **Character Encoding**
   - Verify special characters display correctly
   - Test in email preview contexts

4. **Integration Testing**
   - Generate test emails in each language
   - Verify email renders correctly in email clients

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Translation quality issues | Medium | Medium | Review by native speakers if available |
| Missing placeholders in translations | Low | High | Automated validation script |
| Character encoding issues | Low | Medium | UTF-8 encoding verification |
| Inconsistent terminology | Medium | Low | Maintain translation glossary |
| Cultural inappropriateness | Low | Medium | Follow language-specific guidelines |

---

## Related Documentation

- [Plan-111-L10N-Epic2-Static-UI-Translation.md](./prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [PRD_L10N_Epic2_Static_UI_Translation.md](./prd/PRD_L10N_Epic2_Static_UI_Translation.md)
- [i18n Configuration](../src/lib/i18n/config.ts)
- [Email Templates Source](../src/lib/email-templates.ts)

---

## Notes

- This task should be executed after all email generation functions have been updated to use the translation utility (Tasks 2I.1-2I.7)
- Translations should be generated using AI translation with context awareness for email-specific terminology
- Consider creating a translation glossary for email-specific terms to ensure consistency
- Email translations may require periodic review as the source content evolves
