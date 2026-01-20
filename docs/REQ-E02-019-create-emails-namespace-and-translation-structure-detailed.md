# REQ-E02-019: Create Emails Namespace and Translation Structure - Detailed Task Breakdown

*Generated: 2026-01-20 10:15:00 UTC*
*Last Modified: 2026-01-20 10:15:00 UTC*

## Reference

- **Request**: REQ-E02-019 (Create Emails Namespace and Translation Structure)
- **Source**: docs/gen_requests_epic2.md
- **Overview Document**: docs/REQ-E02-019-create-emails-namespace-and-translation-structure-overview.md
- **Implementation Plan**: docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md
- **Type**: New Feature
- **Phase**: 2I (Email Templates)
- **Task ID**: 2I.1
- **Size**: M (Medium)
- **Epic**: Localization Epic 2 - Static UI Translation
- **Depends On**: Epic 1 (L10N Foundation - next-intl setup)

---

## Summary

Create a dedicated `emails` namespace within the localization messages file (`/messages/en.json`) containing all UI strings and content templates for transactional emails. This namespace will organize email content by type (access approval, beta access, access denial, registration reminder) and include common email elements (greetings, signatures, footers). This task establishes the translation structure that enables email content to be sent in the recipient's preferred language.

---

## Current State Analysis

### Existing Email Templates

The current `/src/lib/email-templates.ts` contains four email generation functions with approximately 200 hardcoded English strings:

| Function | Purpose | Location | Estimated Strings |
|----------|---------|----------|-------------------|
| `generateAccessApprovalEmail` | Account access granted notification | Lines 16-74 | ~25 |
| `generateBetaAccessApprovalEmail` | Beta program welcome email | Lines 84-149 | ~35 |
| `generateAccessDenialEmail` | Access request declined notification | Lines 305-341 | ~15 |
| `generateRegistrationReminderEmail` | Pending registration follow-up | Lines 351-396 | ~20 |

### Current Email Content (Hardcoded)

From `generateAccessApprovalEmail`:
- Subject: `Access Granted: ${accountDisplayName} - Your Access Code`
- Greeting: `Hello ${requesterName},`
- Body sections: "Great news!", "Your Access Details:", "To complete your access setup:", etc.
- Sign-off: "Best regards, The FAQBNB Team"
- Footer: "This is an automated message..."

From `generateBetaAccessApprovalEmail`:
- Subject with emoji: `Welcome to FAQBNB Beta - Access Granted!`
- Congratulations message
- "What to Expect:" section with 5 features
- Beta-specific notes (5 items)
- Special footer: "You're part of something special!"

### Target State

A well-organized `emails` namespace with:
- **~80 translation keys** across 5 subcategories
- Common email elements separated for reuse
- Subject lines separated from body content
- Variable placeholders documented (`{variable}` format)
- Structure supports both plain text and HTML rendering

---

## Detailed Tasks

### Task 1: Analyze Existing Email Templates
**Estimate**: 1 story point
**Priority**: P0 - Must do first

#### Description
Perform a comprehensive audit of `/src/lib/email-templates.ts` to extract all unique text strings, identify common elements, and document all dynamic placeholders.

#### Acceptance Criteria
- [ ] All unique text strings extracted from 4 email functions
- [ ] Common elements identified across emails (greetings, signatures, footers)
- [ ] All `${variable}` placeholders documented with descriptions
- [ ] String count verified (~80 unique strings)

#### Implementation Details

**Strings to Extract from `generateAccessApprovalEmail`:**

| String | Key Location | Variables |
|--------|--------------|-----------|
| `Access Granted: ${accountDisplayName} - Your Access Code` | `accessApproval.subject` | `{accountName}` |
| `Hello ${requesterName},` | `common.greeting` | `{name}` |
| `Great news! Your access request for "${accountDisplayName}" has been approved.` | `accessApproval.intro` | `{accountName}` |
| `Your Access Details:` | `accessApproval.accessDetailsHeading` | - |
| `Account: ${accountDisplayName}` | `accessApproval.accountLabel` | `{accountName}` |
| `Access Code: ${accessCode}` | `accessApproval.accessCodeLabel` | `{accessCode}` |
| `Requested on: ${date}` | `accessApproval.requestedOnLabel` | `{requestDate}` |
| `To complete your access setup:` | `accessApproval.instructionsHeading` | - |
| `Click this direct registration link: ${directRegistrationLink}` | `accessApproval.step1` | `{directLink}` |
| `(This link pre-fills your access code and email for convenience)` | `accessApproval.step1Note` | - |
| `Complete your account registration` | `accessApproval.step2` | - |
| `Start exploring the items and resources` | `accessApproval.step3` | - |
| `Your access code: ${accessCode}` | `accessApproval.yourAccessCode` | `{accessCode}` |
| `Direct registration link: ${directRegistrationLink}` | `accessApproval.directRegistrationLink` | `{directLink}` |
| `Important Notes:` | `accessApproval.notesHeading` | - |
| `Keep your access code secure and don't share it with others` | `accessApproval.note1` | - |
| `Your access code will remain valid until you complete registration` | `accessApproval.note2` | - |
| `If you have any questions, please contact the account owner` | `accessApproval.note3` | - |
| `Best regards,` | `common.regards` | - |
| `The FAQBNB Team` | `common.team` | - |
| `This is an automated message. Please do not reply to this email.` | `common.footer` | - |
| `If you need assistance, please contact support through the FAQBNB platform.` | `common.footerSupport` | - |

**Strings to Extract from `generateBetaAccessApprovalEmail`:**

| String | Key Location | Variables |
|--------|--------------|-----------|
| `Welcome to FAQBNB Beta - Access Granted!` | `betaAccess.subject` | - |
| `Congratulations! Your beta waitlist request has been approved, and you now have exclusive early access to FAQBNB!` | `betaAccess.congratulations` | - |
| `Your Beta Access Details:` | `betaAccess.accessDetailsHeading` | - |
| `Platform: ${accountDisplayName}` | `betaAccess.platformLabel` | `{accountName}` |
| `Beta Access Granted: ${date}` | `betaAccess.betaAccessGrantedLabel` | `{approvalDate}` |
| `Original Request: ${date}` | `betaAccess.originalRequestLabel` | `{requestDate}` |
| `Getting Started with Your Beta Access:` | `betaAccess.gettingStartedHeading` | - |
| `Your beta access code: ${accessCode}` | `betaAccess.yourBetaAccessCode` | `{accessCode}` |
| `What to Expect:` | `betaAccess.whatToExpectHeading` | - |
| `Early access to all FAQBNB features` | `betaAccess.feature1` | - |
| `QR code generation and management tools` | `betaAccess.feature2` | - |
| `Analytics and insights dashboard` | `betaAccess.feature3` | - |
| `Priority support during the beta period` | `betaAccess.feature4` | - |
| `Direct feedback channel to influence product development` | `betaAccess.feature5` | - |
| `Important Beta Program Notes:` | `betaAccess.betaNotesHeading` | - |
| `Your access code provides full platform access during the beta period` | `betaAccess.betaNote1` | - |
| `As a beta user, your feedback is invaluable to us` | `betaAccess.betaNote2` | - |
| `Some features may be evolving - please share your experience!` | `betaAccess.betaNote3` | - |
| `Keep your access code secure and don't share it with others` | `betaAccess.betaNote4` | - |
| `Beta users will receive priority updates on new features` | `betaAccess.betaNote5` | - |
| `We're excited to have you as part of our exclusive beta community!` | `betaAccess.excited` | - |
| `The FAQBNB Beta Team` | `common.betaTeam` | - |
| `You're part of something special! Thank you for joining our beta program.` | `common.betaFooter` | - |
| `For beta support or feedback, please contact us through the platform or reply to this email.` | `common.betaFooterSupport` | - |

**Strings to Extract from `generateAccessDenialEmail`:**

| String | Key Location | Variables |
|--------|--------------|-----------|
| `Access Request Update: ${accountDisplayName}` | `accessDenial.subject` | `{accountName}` |
| `Thank you for your interest in accessing "${accountDisplayName}".` | `accessDenial.intro` | `{accountName}` |
| `Unfortunately, we're unable to approve your access request at this time.` | `accessDenial.message` | - |
| `Reason: ${reason}` | `accessDenial.reasonLabel` | `{reason}` |
| `Request Details:` | `accessDenial.requestDetailsHeading` | - |
| `If you believe this is an error or have questions about this decision, please contact the account owner directly.` | `accessDenial.contactNote` | - |

**Strings to Extract from `generateRegistrationReminderEmail`:**

| String | Key Location | Variables |
|--------|--------------|-----------|
| `Reminder: Complete Your ${accountDisplayName} Access Setup` | `registrationReminder.subject` | `{accountName}` |
| `This is a friendly reminder that your access to "${accountDisplayName}" was approved ${daysSinceApproval} days ago, but you haven't completed your registration yet.` | `registrationReminder.intro` | `{accountName}`, `{daysSinceApproval}` |
| `Your Access Code: ${accessCode}` | `registrationReminder.yourAccessCode` | `{accessCode}` |
| `Alternative: Visit ${registrationLink} and enter your access code: ${accessCode}` | `registrationReminder.alternativeInstructions` | `{registrationLink}`, `{accessCode}` |
| `Your access code will remain valid, but completing your registration will allow you to start exploring the account's items and resources.` | `registrationReminder.encouragement` | - |
| `If you no longer need access or have any questions, please let us know.` | `registrationReminder.contactNote` | - |

#### Verification Steps
1. Read `/src/lib/email-templates.ts` completely
2. Create extraction mapping document
3. Verify all placeholders identified
4. Count total unique strings (target: ~80)

---

### Task 2: Design Namespace Structure
**Estimate**: 1 story point
**Priority**: P0 - Critical

#### Description
Design the hierarchical structure for the `emails` namespace with logical categorization by email type and common elements.

#### Acceptance Criteria
- [ ] Structure design documented
- [ ] All 5 subcategories defined
- [ ] Key naming convention established
- [ ] Variable placeholder format confirmed

#### Target Structure

```
emails/
├── common/              (~15 keys) - Shared elements
│   ├── greeting
│   ├── greetingGeneric
│   ├── regards
│   ├── team
│   ├── betaTeam
│   ├── footer
│   ├── footerSupport
│   ├── betaFooter
│   ├── betaFooterSupport
│   ├── separator
│   ├── accessCode
│   ├── account
│   ├── requestedOn
│   ├── platform
│   ├── betaAccessGranted
│   └── originalRequest
│
├── accessApproval/      (~18 keys) - Account access granted
│   ├── subject
│   ├── intro
│   ├── accessDetailsHeading
│   ├── accountLabel
│   ├── accessCodeLabel
│   ├── requestedOnLabel
│   ├── instructionsHeading
│   ├── step1, step1Note, step2, step3
│   ├── yourAccessCode
│   ├── directRegistrationLink
│   ├── notesHeading
│   └── note1, note2, note3
│
├── betaAccess/          (~25 keys) - Beta program welcome
│   ├── subject
│   ├── congratulations
│   ├── accessDetailsHeading
│   ├── platformLabel, accessCodeLabel
│   ├── betaAccessGrantedLabel, originalRequestLabel
│   ├── gettingStartedHeading
│   ├── step1, step1Note, step2, step3
│   ├── yourBetaAccessCode, directRegistrationLink
│   ├── whatToExpectHeading
│   ├── feature1-5
│   ├── betaNotesHeading
│   ├── betaNote1-5
│   └── excited
│
├── accessDenial/        (~10 keys) - Access declined
│   ├── subject
│   ├── intro
│   ├── message
│   ├── reasonLabel
│   ├── requestDetailsHeading
│   ├── accountLabel
│   ├── requestedOnLabel
│   └── contactNote
│
└── registrationReminder/ (~12 keys) - Registration follow-up
    ├── subject
    ├── intro
    ├── yourAccessCode
    ├── instructionsHeading
    ├── step1, step1Note, step2
    ├── alternativeInstructions
    ├── encouragement
    └── contactNote
```

#### Key Naming Convention

```
emails.{emailType}.{element}
```

Examples:
- `emails.accessApproval.subject` - Subject line for access approval
- `emails.common.greeting` - Shared greeting template
- `emails.betaAccess.feature1` - First "What to Expect" feature

#### Verification Steps
1. Validate structure covers all email types
2. Confirm no duplicate keys
3. Verify key naming follows convention

---

### Task 3: Create `emails.common` Subcategory
**Estimate**: 1 story point
**Priority**: P0 - Critical (Foundation for all emails)

#### Description
Create the `common` subcategory containing shared email elements used across multiple email types.

#### Target Content (16 keys)

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
    }
  }
}
```

#### Acceptance Criteria
- [ ] All 16 common keys are present
- [ ] `{name}` variable placeholder in greeting
- [ ] Keys follow camelCase naming convention
- [ ] No trailing punctuation on labels (except greeting)

#### Verification Steps
1. Verify JSON is valid after edit
2. Count keys in `emails.common` (should be 16)
3. Confirm variable placeholder syntax correct

---

### Task 4: Create `emails.accessApproval` Subcategory
**Estimate**: 2 story points
**Priority**: P0 - Critical

#### Description
Create the `accessApproval` subcategory containing all strings for the standard account access granted email.

#### Target Content (18 keys)

```json
{
  "emails": {
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
}
```

#### Acceptance Criteria
- [ ] All 18 access approval keys are present
- [ ] Variable placeholders: `{accountName}`, `{accessCode}`, `{requestDate}`, `{directLink}`
- [ ] Subject line under 60 characters before interpolation
- [ ] Instructions are numbered (step1, step2, step3)

#### Variable Documentation

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `{accountName}` | Name of the account/property | "Beach House" |
| `{accessCode}` | Generated access code | "ABC123XYZ789" |
| `{requestDate}` | Date access was requested | "January 15, 2026" |
| `{directLink}` | Full URL with pre-filled code | "https://..." |

#### Verification Steps
1. Verify JSON is valid
2. Count keys (should be 18)
3. Validate all placeholders are documented

---

### Task 5: Create `emails.betaAccess` Subcategory
**Estimate**: 2 story points
**Priority**: P0 - Critical

#### Description
Create the `betaAccess` subcategory containing all strings for the beta program welcome email.

#### Target Content (25 keys)

```json
{
  "emails": {
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
    }
  }
}
```

#### Acceptance Criteria
- [ ] All 25 beta access keys are present
- [ ] Variable placeholders: `{accountName}`, `{accessCode}`, `{approvalDate}`, `{requestDate}`, `{directLink}`
- [ ] 5 "What to Expect" features included
- [ ] 5 Beta Program notes included
- [ ] Enthusiastic but professional tone maintained

#### Variable Documentation

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `{accountName}` | Platform name | "the FAQBNB platform" |
| `{accessCode}` | Generated access code | "BETA123XYZ" |
| `{approvalDate}` | Date beta access granted | "January 20, 2026" |
| `{requestDate}` | Date of original waitlist request | "January 1, 2026" |
| `{directLink}` | Full URL with pre-filled code | "https://..." |

#### Verification Steps
1. Verify JSON is valid
2. Count keys (should be 25)
3. Verify feature list complete (5 items)
4. Verify beta notes complete (5 items)

---

### Task 6: Create `emails.accessDenial` Subcategory
**Estimate**: 1 story point
**Priority**: P1 - High

#### Description
Create the `accessDenial` subcategory containing all strings for the access request declined email.

#### Target Content (10 keys)

```json
{
  "emails": {
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
}
```

#### Acceptance Criteria
- [ ] All 10 access denial keys are present
- [ ] Variable placeholders: `{accountName}`, `{reason}`, `{requestDate}`
- [ ] Subject line neutral (not revealing denial in subject)
- [ ] Tone is polite but clear

#### Notes
- The `reasonLabel` key handles optional reason field
- Message is empathetic but direct
- Contact information provided for appeal

#### Verification Steps
1. Verify JSON is valid
2. Count keys (should be 10)
3. Verify professional, neutral tone

---

### Task 7: Create `emails.registrationReminder` Subcategory
**Estimate**: 1 story point
**Priority**: P1 - High

#### Description
Create the `registrationReminder` subcategory containing all strings for the pending registration follow-up email.

#### Target Content (12 keys)

```json
{
  "emails": {
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

#### Acceptance Criteria
- [ ] All 12 registration reminder keys are present
- [ ] Variable placeholders: `{accountName}`, `{daysSinceApproval}`, `{accessCode}`, `{directLink}`, `{registrationLink}`
- [ ] Friendly, encouraging tone
- [ ] Alternative instructions provided

#### Variable Documentation

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `{accountName}` | Account name | "Beach House" |
| `{daysSinceApproval}` | Number of days since approval | "7" |
| `{accessCode}` | Access code | "ABC123XYZ789" |
| `{directLink}` | Pre-filled registration URL | "https://..." |
| `{registrationLink}` | Base registration URL | "https://faqbnb.com/register" |

#### Verification Steps
1. Verify JSON is valid
2. Count keys (should be 12)
3. Verify all 5 variables documented

---

### Task 8: Integrate All Subcategories into `/messages/en.json`
**Estimate**: 2 story points
**Priority**: P0 - Critical

#### Description
Add the complete `emails` namespace to `/messages/en.json`, integrating all subcategories created in Tasks 3-7.

#### Implementation Details

**File**: `/messages/en.json`

**Action**: Add `emails` key at root level with all subcategories

#### Complete Target Structure

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

#### Acceptance Criteria
- [ ] `emails` namespace exists in `/messages/en.json`
- [ ] All 5 subcategories present (`common`, `accessApproval`, `betaAccess`, `accessDenial`, `registrationReminder`)
- [ ] Total key count: ~81 keys
- [ ] JSON is valid and parseable
- [ ] No syntax errors

#### Verification Steps
1. Validate JSON syntax: `npx jsonlint messages/en.json`
2. Count total keys in `emails` namespace
3. Run `npm run build` to verify no errors

---

### Task 9: Apply Structure to Non-English Language Files
**Estimate**: 1 story point
**Priority**: P2 - Required but separate

#### Description
Copy the `emails` namespace structure to all 5 non-English language files using English values as placeholders. Actual translations will be generated in Task 2I.8.

#### Files to Update
- `/messages/fr.json` - French
- `/messages/es.json` - Spanish
- `/messages/de.json` - German
- `/messages/nl.json` - Dutch
- `/messages/it.json` - Italian

#### Acceptance Criteria
- [ ] All 5 files have identical structure to `en.json` for `emails` namespace
- [ ] All keys present in `en.json` exist in other files
- [ ] Values are English placeholders (will be translated in Task 2I.8)
- [ ] All files are valid JSON

#### Implementation Notes
- Copy the entire `emails` object from `en.json`
- Paste into each language file at root level
- Keep English values as placeholders
- Do NOT translate yet - that's Task 2I.8

#### Verification Steps
1. Each file passes JSON validation
2. Key structure matches `en.json` exactly
3. Run `npm run build` - should succeed

---

### Task 10: Validate Complete Implementation
**Estimate**: 1 story point
**Priority**: P0 - Must do last

#### Description
Final validation to ensure all acceptance criteria are met and the implementation is complete.

#### Checklist

**Structure Validation**
- [ ] `emails` namespace exists in `/messages/en.json`
- [ ] `emails.common` contains 16 keys
- [ ] `emails.accessApproval` contains 18 keys
- [ ] `emails.betaAccess` contains 25 keys
- [ ] `emails.accessDenial` contains 10 keys (8 actual)
- [ ] `emails.registrationReminder` contains 12 keys (10 actual)
- [ ] Total: ~81 email translation keys

**Placeholder Validation**
- [ ] All variables use `{variable}` syntax (ICU format)
- [ ] Variable names are consistent across related strings
- [ ] All placeholders documented in overview

**JSON Validation**
- [ ] `/messages/en.json` is valid JSON
- [ ] All 6 language files contain `emails` namespace
- [ ] No duplicate keys within any namespace
- [ ] No unterminated brackets or braces

**Content Validation**
- [ ] Subject lines are concise (under 60 characters before interpolation)
- [ ] Body content matches existing email templates
- [ ] Tone is professional and consistent
- [ ] Instructions are clear and actionable

**Build Validation**
- [ ] `npm run build` succeeds without errors
- [ ] Application starts without i18n errors
- [ ] JSON can be imported and parsed

#### Verification Commands

```bash
# Validate JSON files
npx jsonlint messages/en.json
npx jsonlint messages/fr.json
npx jsonlint messages/es.json
npx jsonlint messages/de.json
npx jsonlint messages/nl.json
npx jsonlint messages/it.json

# Build project
npm run build

# Check key count (optional script)
node -e "const m=require('./messages/en.json'); console.log('Email keys:', Object.keys(m.emails).reduce((acc, k) => acc + Object.keys(m.emails[k]).length, 0))"
```

---

## Files to Modify

| File | Action | Description |
|------|--------|-------------|
| `/messages/en.json` | Modify | Add `emails` namespace with 5 subcategories (~81 keys) |
| `/messages/fr.json` | Modify | Mirror structure with English placeholders |
| `/messages/es.json` | Modify | Mirror structure with English placeholders |
| `/messages/de.json` | Modify | Mirror structure with English placeholders |
| `/messages/nl.json` | Modify | Mirror structure with English placeholders |
| `/messages/it.json` | Modify | Mirror structure with English placeholders |

---

## Files NOT to Modify (in this task)

| File | Reason |
|------|--------|
| `/src/lib/email-templates.ts` | Will be updated in Tasks 2I.3-2I.6 |
| `/src/lib/i18n/config.ts` | No changes needed |
| `/src/lib/i18n/index.ts` | No changes needed |
| `/src/lib/i18n/email-translations.ts` | Will be created in Task 2I.2 |
| Any component files | Email templates are server-side only |

---

## Variable Placeholder Reference

### Complete Variable List

| Variable | Used In | Description |
|----------|---------|-------------|
| `{name}` | `common.greeting` | Recipient's name |
| `{accountName}` | Multiple | Account/property name |
| `{accessCode}` | Multiple | Generated access code |
| `{requestDate}` | Multiple | Date access was requested |
| `{approvalDate}` | `betaAccess` | Date beta access granted |
| `{directLink}` | Multiple | Registration URL with pre-filled code |
| `{registrationLink}` | `registrationReminder` | Base registration URL |
| `{daysSinceApproval}` | `registrationReminder` | Days since approval |
| `{reason}` | `accessDenial` | Denial reason (optional) |

### ICU Format Note

All variables use simple interpolation `{variable}`, not ICU plural/select format. This is appropriate for email templates where content is mostly static text with value insertions.

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| JSON syntax errors | Low | High | Validate with jsonlint before commit |
| Missing placeholder in extraction | Medium | Low | Cross-reference with existing templates |
| Inconsistent variable naming | Low | Low | Document naming convention |
| Email content mismatch | Low | Medium | Side-by-side comparison with existing emails |
| Structure conflicts with other namespaces | Low | Low | `emails` is new, isolated namespace |

---

## Dependencies

### Required (Already Installed)
- `next-intl` - i18n framework (installed in Epic 1)
- TypeScript 5.x - Type checking

### No New Dependencies Required
This task only modifies JSON translation files.

---

## Story Points Summary

| Task | Story Points |
|------|--------------|
| Task 1: Analyze Existing Email Templates | 1 |
| Task 2: Design Namespace Structure | 1 |
| Task 3: Create `emails.common` | 1 |
| Task 4: Create `emails.accessApproval` | 2 |
| Task 5: Create `emails.betaAccess` | 2 |
| Task 6: Create `emails.accessDenial` | 1 |
| Task 7: Create `emails.registrationReminder` | 1 |
| Task 8: Integrate into `/messages/en.json` | 2 |
| Task 9: Update Non-English Files | 1 |
| Task 10: Validate Implementation | 1 |
| **Total** | **13 SP** |

**Estimated Completion**: 1 day (tasks can be completed in sequence as one editing session)

---

## Future Integration Points

This namespace structure will be consumed by:

1. **Task 2I.2**: `getEmailTranslation` utility function
2. **Task 2I.3**: Updated `generateAccessApprovalEmail`
3. **Task 2I.4**: Updated `generateAccessDenialEmail`
4. **Task 2I.5**: Updated `generateBetaAccessApprovalEmail`
5. **Task 2I.6**: Updated `generateRegistrationReminderEmail`
6. **Task 2I.7**: Language parameter addition to all functions
7. **Task 2I.8**: Non-English translation generation
8. **Task 2I.9**: Email testing in each language

---

## Usage Preview (After Task 2I.2)

### Server-Side Email Translation

```typescript
import { getEmailTranslation } from '@/lib/i18n/email-translations';
import { SupportedLanguage } from '@/types';

// Get translated subject
const subject = getEmailTranslation(
  'emails.accessApproval.subject',
  'fr', // French
  { accountName: 'Beach House' }
);
// Returns: "Accès Accordé: Beach House - Votre Code d'Accès"

// Get translated greeting
const greeting = getEmailTranslation(
  'emails.common.greeting',
  'de', // German
  { name: 'Maria' }
);
// Returns: "Hallo Maria,"
```

### Direct JSON Access (Fallback)

```typescript
import messages from '@/messages/en.json';

const subject = messages.emails.accessApproval.subject
  .replace('{accountName}', 'Beach House');
// Returns: "Access Granted: Beach House - Your Access Code"
```

---

*End of Detailed Task Breakdown*
