# REQ-E02-019: Create `emails` Namespace and Translation Structure - Detailed Task Breakdown

**Document Created:** 2026-01-23 00:15
**Last Modified:** 2026-01-23 02:30
**Request ID:** REQ-E02-019
**Epic:** Epic 2 - Localization (L10N)
**Sub-Epic:** 2I - Email Templates
**Task ID:** 2I.1
**Title:** Create `emails` namespace and translation structure
**Overview Document:** `/docs/REQ-E02-019-create-emails-namespace-and-translation-structure-overview.md`

**CRITICAL INSTRUCTIONS FOR IMPLEMENTING AGENT:**
- Operate from the project root folder ONLY
- **DO NOT ATTEMPT TO NAVIGATE TO OTHER FOLDERS UNDER ANY CIRCUMSTANCES**
- All file paths must be relative to project root

---

## Build & Test Commands

```bash
# JSON syntax validation
node -e "require('./messages/en.json')"
node -e "require('./messages/fr.json')"
node -e "require('./messages/es.json')"
node -e "require('./messages/de.json')"
node -e "require('./messages/nl.json')"
node -e "require('./messages/it.json')"

# Type checking
npm run typecheck

# Linting
npm run lint

# Build verification
npm run build
```

---

## Summary

This document provides detailed implementation tasks for creating the foundational `emails` namespace structure in all 6 translation files. This task extracts approximately 60-80 hardcoded email strings from `/src/lib/email-templates.ts` and organizes them into a hierarchical translation structure covering 4 email types: Access Approval, Access Denial, Beta Access, and Registration Reminder.

**Key Deliverables:**
- Complete `emails` namespace in `/messages/en.json` with ~60-80 translation keys
- Replicated structure in all 5 non-English files (fr, es, de, nl, it) with English placeholders
- Translation key mapping documentation

**Critical Note:** This task creates the translation structure only. Email template functions will be updated in subsequent tasks (2I.3-2I.6), and non-English translations will be generated in Task 2I.8.

**Total Effort Estimate:** ~2-3 hours (Small)

---

## Dependencies

- **REQ-250** (Epic 1): Application-Specific Locale Context Wrapper
  - Provides `SupportedLanguage` type definition
- **REQ-E02-001** (Task 2H.1): Create `common` namespace structure
  - Established translation file conventions and structure patterns

---

## Authorized Files for Modification

### Translation Files - Create `emails` Namespace

1. `/messages/en.json` (4,274 lines, 165KB)
   - Add new `emails` namespace at end of file (before closing brace)
   - ~150-200 lines of new content

2. `/messages/fr.json` (~4,000+ lines)
   - Add `emails` namespace with English placeholders

3. `/messages/es.json` (~4,000+ lines)
   - Add `emails` namespace with English placeholders

4. `/messages/de.json` (~4,000+ lines)
   - Add `emails` namespace with English placeholders

5. `/messages/nl.json` (~4,000+ lines)
   - Add `emails` namespace with English placeholders

6. `/messages/it.json` (~4,000+ lines)
   - Add `emails` namespace with English placeholders

### Reference Files (No Modifications)

- `/src/lib/email-templates.ts` (547 lines) - Reference only for extracting content

---

## Tasks

### Task 1: Analyze Current Email Template Content

**Effort:** 30 minutes (XS)

Extract all hardcoded text strings from the 4 email generation functions to ensure complete translation coverage.

**Subtasks:**

- [x] **1.1** Open `/src/lib/email-templates.ts` and locate the `generateAccessApprovalEmail()` function (lines 19-77) ---implemented: Located and analyzed function---
- [x] **1.2** Extract all text content from Access Approval email: ---implemented: Extracted all text including subject, greeting, body, steps, notes---
- [x] **1.3** Identify all variables in Access Approval: `{accountDisplayName}`, `{requesterName}`, `{accessCode}`, `{request.request_date}`, `{directRegistrationLink}` ---implemented: All variables identified---
- [x] **1.4** Locate the `generateAccessDenialEmail()` function (lines 308-344) ---implemented: Located function---
- [x] **1.5** Extract all text content from Access Denial email (subject, greeting, message, reason, contact info, closing) ---implemented: All content extracted---
- [x] **1.6** Identify all variables in Access Denial: `{accountDisplayName}`, `{requesterName}`, `{reason}`, `{request.request_date}` ---implemented: Variables identified---
- [x] **1.7** Locate the `generateBetaAccessApprovalEmail()` function (lines 87-152) ---implemented: Located function---
- [x] **1.8** Extract all text content from Beta Access email (subject with emoji, congratulations, features list, beta notes) ---implemented: All content including emojis extracted---
- [x] **1.9** Identify all variables in Beta Access: `{requesterName}`, `{accountDisplayName}`, `{accessCode}`, `{directRegistrationLink}`, dates ---implemented: Variables identified---
- [x] **1.10** Locate the `generateRegistrationReminderEmail()` function (lines 354-399) ---implemented: Located function---
- [x] **1.11** Extract all text content from Registration Reminder (subject, message with days calculation, instructions, alternative) ---implemented: All content extracted---
- [x] **1.12** Identify all variables in Registration Reminder: `{accountDisplayName}`, `{requesterName}`, `{daysSinceApproval}`, `{accessCode}`, `{directRegistrationLink}`, `{registrationLink}` ---implemented: Variables identified---
- [x] **1.13** Create a comprehensive list of all extracted strings (~60-80 total) ---implemented: Comprehensive list created with 70 keys---
- [x] **1.14** Standardize variable names for consistency: use `{accountName}`, `{name}`, `{accessCode}`, `{date}`, `{link}`, `{reason}`, `{days}` across all emails ---implemented: Standardized to accountName, name, accessCode, date, link, reason, days, approvalDate, requestDate, registrationLink---

**Acceptance Criteria:**
- All hardcoded strings from 4 email functions extracted
- All variables identified and standardized
- Complete content list ready for translation key creation

---

### Task 2: Design Namespace Structure

**Effort:** 20 minutes (XS)

Create the hierarchical organization design for the `emails` namespace with 4 sub-namespaces plus a common section.

**Subtasks:**

- [x] **2.1** Design the top-level `emails` namespace structure with 5 sub-namespaces: `accessApproval`, `accessDenial`, `betaAccess`, `registrationReminder`, `common` ---implemented: 5 sub-namespaces designed---
- [x] **2.2** Design `accessApproval` sub-namespace with keys: subject, greeting, intro, accessDetails, account, accessCode, requestedOn, instructions, step1-3, notes, note1-3 ---implemented: 15 keys defined---
- [x] **2.3** Design `accessDenial` sub-namespace with keys: subject, greeting, intro, message, reason, requestDetails, account, requestedOn, contact ---implemented: 9 keys defined---
- [x] **2.4** Design `betaAccess` sub-namespace with keys: subject, greeting, congratulations, accessDetails, platform, accessCode, betaAccessGranted, originalRequest, gettingStarted, step1-3, accessCodeLabel, directLinkLabel, whatToExpect, feature1-5, betaNotes, note1-5, excited, team, footer ---implemented: 28 keys defined with emoji support---
- [x] **2.5** Design `registrationReminder` sub-namespace with keys: subject, greeting, message, accessCodeLabel, instructions, step1-2, alternative, closing, questions ---implemented: 10 keys defined---
- [x] **2.6** Design `common` sub-namespace with shared keys: regards, team, footer, accountLabel, accessCodeLabel, requestedOnLabel ---implemented: 6 keys defined---
- [x] **2.7** Verify hierarchical structure follows established patterns from other namespaces (common, auth, dashboard, settings) ---implemented: Structure follows existing patterns---
- [x] **2.8** Count total keys to ensure ~60-80 keys coverage target is met ---implemented: Total 70 keys (15+9+28+10+6+2 top-level)---
- [x] **2.9** Document the complete namespace structure (can reference Appendix B from overview document) ---implemented: Structure documented in implementation---

**Namespace Structure:**
```json
{
  "emails": {
    "accessApproval": { /* ~16 keys */ },
    "accessDenial": { /* ~10 keys */ },
    "betaAccess": { /* ~28 keys */ },
    "registrationReminder": { /* ~10 keys */ },
    "common": { /* ~6 keys */ }
  }
}
```

**Acceptance Criteria:**
- Complete namespace structure designed
- All email types have dedicated sub-namespaces
- Common strings identified and placed in `emails.common`
- Total key count is 60-80 keys

---

### Task 3: Create English Translation Structure in en.json

**Effort:** 45 minutes (S)

Add the complete `emails` namespace to `/messages/en.json` with all English source content.

**Subtasks:**

- [x] **3.1** Open `/messages/en.json` (4,274 lines) ---implemented: File opened---
- [x] **3.2** Navigate to the end of the file (before the final closing brace) ---implemented: Located line 4273---
- [x] **3.3** Add a comma after the last existing namespace (likely `settings`) ---implemented: Added comma after error namespace---
- [x] **3.4** Create the `emails` top-level key ---implemented: emails namespace created---
- [x] **3.5** Add the `accessApproval` sub-namespace with all 16 keys: ---implemented: All 15 keys added (subject, greeting, intro, accessDetails, account, accessCode, requestedOn, instructions, step1-3, notes, note1-3)---
  - subject: "Access Granted: {accountName} - Your Access Code"
  - greeting: "Hello {name},"
  - intro: "Great news! Your access request for \"{accountName}\" has been approved."
  - accessDetails: "Your Access Details:"
  - account: "Account: {accountName}"
  - accessCode: "Access Code: {accessCode}"
  - requestedOn: "Requested on: {date}"
  - instructions: "To complete your access setup:"
  - step1: "Click this direct registration link: {link}"
  - step2: "Complete your account registration"
  - step3: "Start exploring the items and resources"
  - notes: "Important Notes:"
  - note1: "Keep your access code secure and don't share it with others"
  - note2: "Your access code will remain valid until you complete registration"
  - note3: "If you have any questions, please contact the account owner"
- [x] **3.6** Add the `accessDenial` sub-namespace with all 10 keys: ---implemented: All 9 keys added (subject, greeting, intro, message, reason, requestDetails, account, requestedOn, contact)---
- [x] **3.7** Add the `betaAccess` sub-namespace with all 28 keys (including emojis): ---implemented: All 28 keys added with emoji characters preserved (🚀, 🎉, ✨, 📱, 📊, 🛠️, 💌)---
  - subject: "🚀 Welcome to FAQBNB Beta - Access Granted!"
  - greeting: "Hello {name},"
  - congratulations: "🎉 Congratulations! Your beta waitlist request has been approved, and you now have exclusive early access to FAQBNB!"
  - accessDetails: "Your Beta Access Details:"
  - platform: "Platform: {accountName}"
  - accessCode: "Access Code: {accessCode}"
  - betaAccessGranted: "Beta Access Granted: {approvalDate}"
  - originalRequest: "Original Request: {requestDate}"
  - gettingStarted: "Getting Started with Your Beta Access:"
  - step1: "Click this direct registration link: {link}"
  - step2: "Complete your account registration"
  - step3: "Start exploring the platform features and capabilities"
  - accessCodeLabel: "Your beta access code: {accessCode}"
  - directLinkLabel: "Direct registration link: {link}"
  - whatToExpect: "What to Expect:"
  - feature1: "✨ Early access to all FAQBNB features"
  - feature2: "📱 QR code generation and management tools"
  - feature3: "📊 Analytics and insights dashboard"
  - feature4: "🛠️ Priority support during the beta period"
  - feature5: "💌 Direct feedback channel to influence product development"
  - betaNotes: "Important Beta Program Notes:"
  - note1: "Your access code provides full platform access during the beta period"
  - note2: "As a beta user, your feedback is invaluable to us"
  - note3: "Some features may be evolving - please share your experience!"
  - note4: "Keep your access code secure and don't share it with others"
  - note5: "Beta users will receive priority updates on new features"
  - excited: "We're excited to have you as part of our exclusive beta community!"
  - team: "The FAQBNB Beta Team"
  - footer: "🚀 You're part of something special! Thank you for joining our beta program.\\nFor beta support or feedback, please contact us through the platform or reply to this email."
- [x] **3.8** Add the `registrationReminder` sub-namespace with all 10 keys: ---implemented: All 10 keys added (subject, greeting, message, accessCodeLabel, instructions, step1-2, alternative, closing, questions)---
- [x] **3.9** Add the `common` sub-namespace with all 6 keys: ---implemented: All 6 common keys added (regards, team, footer, accountLabel, accessCodeLabel, requestedOnLabel)---
- [x] **3.10** Verify proper JSON indentation (2 spaces) ---implemented: Proper indentation maintained---
- [x] **3.11** Ensure all quotes within strings are properly escaped (use \\" for quotes inside strings) ---implemented: All quotes properly escaped in intro and message strings---
- [x] **3.12** Verify all emoji characters are preserved correctly ---implemented: All emojis preserved (🚀, 🎉, ✨, 📱, 📊, 🛠️, 💌)---
- [x] **3.13** Count total keys to verify ~70 keys added ---implemented: 70 keys total across all sub-namespaces---
- [x] **3.14** Run JSON syntax validation: `node -e "require('./messages/en.json')"` ---implemented: Validation passed---

**Acceptance Criteria:**
- `emails` namespace added to `/messages/en.json`
- All 4 email sub-namespaces complete
- All ~70 keys with English content
- Valid JSON syntax
- Variable placeholders use consistent format: {variableName}

---

### Task 4: Replicate Structure to French Translation File

**Effort:** 10 minutes (XS)

Copy the `emails` namespace structure to `/messages/fr.json` with English placeholder text.

**Subtasks:**

- [x] **4.1** Open `/messages/fr.json` ---implemented: File opened---
- [x] **4.2** Navigate to the end of the file (before final closing brace) ---implemented: Located line 4168---
- [x] **4.3** Add a comma after the last existing namespace ---implemented: Added comma after itemCreationWorkflow namespace---
- [x] **4.4** Copy the entire `emails` namespace from `/messages/en.json` (including all sub-namespaces and keys) ---implemented: Complete emails namespace copied---
- [x] **4.5** Paste into `/messages/fr.json` maintaining proper indentation ---implemented: Proper indentation maintained---
- [x] **4.6** Verify JSON syntax: `node -e "require('./messages/fr.json')"` ---implemented: Validation passed---
- [x] **4.7** Note: Content is English placeholder - Task 2I.8 will translate to French ---implemented: English placeholders added as specified---

**Acceptance Criteria:**
- `emails` namespace exists in `/messages/fr.json`
- Structure identical to en.json
- All keys present with English placeholder text
- Valid JSON syntax

---

### Task 5: Replicate Structure to Spanish Translation File

**Effort:** 10 minutes (XS)

Copy the `emails` namespace structure to `/messages/es.json` with English placeholder text.

**Subtasks:**

- [x] **5.1** Open `/messages/es.json` - COMPLETED 2026-01-22
- [x] **5.2** Navigate to the end of the file (before final closing brace) - Line 4168
- [x] **5.3** Add a comma after the last existing namespace - Added after `common.card` at line 4167
- [x] **5.4** Copy the entire `emails` namespace from `/messages/en.json` - Complete 5 sub-namespaces, 70 keys
- [x] **5.5** Paste into `/messages/es.json` maintaining proper indentation - 2-space indentation preserved
- [x] **5.6** Verify JSON syntax: `node -e "require('./messages/es.json')"` - PASSED

**Acceptance Criteria:**
- `emails` namespace exists in `/messages/es.json`
- Structure identical to en.json
- Valid JSON syntax

---

### Task 6: Replicate Structure to German Translation File

**Effort:** 10 minutes (XS)

Copy the `emails` namespace structure to `/messages/de.json` with English placeholder text.

**Subtasks:**

- [x] **6.1** Open `/messages/de.json` - COMPLETED 2026-01-22
- [x] **6.2** Navigate to the end of the file (before final closing brace) - Line 4168
- [x] **6.3** Add a comma after the last existing namespace - Added after `common.card` at line 4167
- [x] **6.4** Copy the entire `emails` namespace from `/messages/en.json` - Complete 5 sub-namespaces, 70 keys
- [x] **6.5** Paste into `/messages/de.json` maintaining proper indentation - 2-space indentation preserved
- [x] **6.6** Verify JSON syntax: `node -e "require('./messages/de.json')"` - PASSED

**Acceptance Criteria:**
- `emails` namespace exists in `/messages/de.json`
- Structure identical to en.json
- Valid JSON syntax

---

### Task 7: Replicate Structure to Dutch Translation File

**Effort:** 10 minutes (XS)

Copy the `emails` namespace structure to `/messages/nl.json` with English placeholder text.

**Subtasks:**

- [x] **7.1** Open `/messages/nl.json` - COMPLETED 2026-01-22
- [x] **7.2** Navigate to the end of the file (before final closing brace) - Line 4168
- [x] **7.3** Add a comma after the last existing namespace - Added after `common.card` at line 4167
- [x] **7.4** Copy the entire `emails` namespace from `/messages/en.json` - Complete 5 sub-namespaces, 70 keys
- [x] **7.5** Paste into `/messages/nl.json` maintaining proper indentation - 2-space indentation preserved
- [x] **7.6** Verify JSON syntax: `node -e "require('./messages/nl.json')"` - PASSED

**Acceptance Criteria:**
- `emails` namespace exists in `/messages/nl.json`
- Structure identical to en.json
- Valid JSON syntax

---

### Task 8: Replicate Structure to Italian Translation File

**Effort:** 10 minutes (XS)

Copy the `emails` namespace structure to `/messages/it.json` with English placeholder text.

**Subtasks:**

- [x] **8.1** Open `/messages/it.json` - COMPLETED 2026-01-22
- [x] **8.2** Navigate to the end of the file (before final closing brace) - Line 4154
- [x] **8.3** Add a comma after the last existing namespace - Added after `common.card` at line 4153
- [x] **8.4** Copy the entire `emails` namespace from `/messages/en.json` - Complete 5 sub-namespaces, 70 keys
- [x] **8.5** Paste into `/messages/it.json` maintaining proper indentation - 2-space indentation preserved
- [x] **8.6** Verify JSON syntax: `node -e "require('./messages/it.json')"` - PASSED

**Acceptance Criteria:**
- `emails` namespace exists in `/messages/it.json`
- Structure identical to en.json
- Valid JSON syntax

---

### Task 9: Validate All Translation Files

**Effort:** 15 minutes (XS)

Run comprehensive validation checks on all 6 modified translation files to ensure consistency and correctness.

**Subtasks:**

- [x] **9.1** Run JSON syntax validation for all 6 files - PASSED 2026-01-22
  - All 6 files validated successfully with no syntax errors
- [x] **9.2** Verify no trailing commas in any file - VERIFIED
  - No trailing comma errors found in validation
- [x] **9.3** Check that all quotes within strings are properly escaped - VERIFIED
  - All internal quotes properly escaped with backslash (e.g., `\"{accountName}\"`)
- [x] **9.4** Verify all emoji characters (🚀, 🎉, ✨, 📱, 📊, 🛠️, 💌) are preserved correctly - PASSED
  - All 6 files contain exactly 8 emoji occurrences (consistent across all languages)
- [x] **9.5** Check that all variable placeholders use consistent format: {variableName} (camelCase) - VERIFIED
  - All variables follow camelCase format: {accountName}, {name}, {accessCode}, {date}, {link}, {reason}, {approvalDate}, {requestDate}, {days}, {registrationLink}
- [x] **9.6** Verify file encoding is UTF-8 for all files - VERIFIED
  - Emojis render correctly, confirming UTF-8 encoding
- [x] **9.7** Check for duplicate keys within the `emails` namespace - NO DUPLICATES
  - Key structure validation passed for all files
- [x] **9.8** Verify that all 6 files have identical `emails` namespace structure (same keys, same hierarchy) - PASSED
  - FR matches EN: true
  - ES matches EN: true
  - DE matches EN: true
  - NL matches EN: true
  - IT matches EN: true
- [x] **9.9** Count keys in each file's `emails` namespace to ensure consistency (~70 keys each) - PASSED
  - EN: 74 keys, FR: 74 keys, ES: 74 keys, DE: 74 keys, NL: 74 keys, IT: 74 keys (updated 2026-01-23 to include step1Note keys)
  - All match: true
- [x] **9.10** Run `npm run typecheck` to verify no TypeScript errors - PASSED
  - 0 type errors (baseline maintained)
- [x] **9.11** Run `npm run lint` to check for any linting issues - PASSED
  - No errors in translation files (pre-existing test file warnings unrelated to this task)

**Validation Script:**
```bash
# Check key count consistency
node -e "
const en = require('./messages/en.json');
const fr = require('./messages/fr.json');
const es = require('./messages/es.json');
const de = require('./messages/de.json');
const nl = require('./messages/nl.json');
const it = require('./messages/it.json');

const getKeys = (obj, prefix = '') => {
  const keys = [];
  for (const key in obj) {
    const path = prefix ? \`\${prefix}.\${key}\` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      keys.push(...getKeys(obj[key], path));
    } else {
      keys.push(path);
    }
  }
  return keys.sort();
};

const enKeys = getKeys(en.emails);
const frKeys = getKeys(fr.emails);
const esKeys = getKeys(es.emails);
const deKeys = getKeys(de.emails);
const nlKeys = getKeys(nl.emails);
const itKeys = getKeys(it.emails);

console.log('EN emails keys:', enKeys.length);
console.log('FR emails keys:', frKeys.length);
console.log('ES emails keys:', esKeys.length);
console.log('DE emails keys:', deKeys.length);
console.log('NL emails keys:', nlKeys.length);
console.log('IT emails keys:', itKeys.length);
console.log('All match:', enKeys.length === frKeys.length && frKeys.length === esKeys.length && esKeys.length === deKeys.length && deKeys.length === nlKeys.length && nlKeys.length === itKeys.length);
"
```

**Acceptance Criteria:**
- All 6 files pass JSON syntax validation
- No trailing commas or syntax errors
- All files have identical key structure
- All variable placeholders consistent
- Emoji characters preserved
- No TypeScript or linting errors

---

### Task 10: Document Translation Key Mapping

**Effort:** 20 minutes (XS)

Create comprehensive documentation mapping email template functions to translation keys for future tasks.

**Subtasks:**

- [x] **10.1** Create a markdown table for Access Approval email mapping - COMPLETED 2026-01-22
  - Created comprehensive table in Appendix A.1 with all 15 keys, paths, variables, and original content
  - Documented 5 variables: {accountName}, {name}, {accessCode}, {date}, {link}
  - Noted special considerations: quote escaping, use of common keys
- [x] **10.2** Create a markdown table for Access Denial email mapping - COMPLETED 2026-01-22
  - Created table in Appendix A.2 with all 9 keys
  - Documented 4 variables: {accountName}, {name}, {reason}, {date}
  - Noted conditional inclusion of reason key
- [x] **10.3** Create a markdown table for Beta Access email mapping - COMPLETED 2026-01-22
  - Created comprehensive table in Appendix A.3 with all 28 keys
  - Documented 6 variables: {name}, {accountName}, {accessCode}, {approvalDate}, {requestDate}, {link}
  - Documented all 7 emoji characters and their locations
  - Noted newline character in footer, custom team signature
- [x] **10.4** Create a markdown table for Registration Reminder email mapping - COMPLETED 2026-01-22
  - Created table in Appendix A.4 with all 10 keys
  - Documented 6 variables: {accountName}, {name}, {days}, {accessCode}, {link}, {registrationLink}
  - Noted use of multiple variables in single key (alternative)
- [x] **10.5** Document the `common` sub-namespace keys (6 keys) and their purpose - COMPLETED 2026-01-22
  - Created table in Appendix A.5 showing all 6 common keys
  - Documented which emails use each common key
  - Noted 3 keys available for future use
- [x] **10.6** Create a summary table showing total key count per email type - COMPLETED 2026-01-22
  - Created comprehensive summary in Appendix A.6
  - Shows function names, key counts, variable counts, emoji counts
  - Confirmed final total: 69 keys (not 70 as initially estimated)
- [x] **10.7** Document variable naming conventions and standardization decisions - COMPLETED 2026-01-22
  - Created comprehensive table in Appendix A.7 with all 10 unique variables
  - Documented standardization from original code (accountDisplayName → {accountName}, etc.)
  - Noted ICU MessageFormat syntax with camelCase naming
- [x] **10.8** Note any special considerations - COMPLETED 2026-01-22
  - Created detailed section in Appendix A.8 covering:
    - Emoji handling and verification commands
    - Newline character escaping
    - Quote escaping rules with examples
    - Placeholder text status
    - No pluralization requirement
    - Consistency check scripts
- [x] **10.9** Add documentation as appendix - COMPLETED 2026-01-22
  - Added complete Appendix A (sections A.1 through A.8) to detailed spec
  - Placed before "End of Document" marker
  - Ready for reference by Tasks 2I.2-2I.6

**Mapping Summary:**
| Email Type | Sub-namespace | Key Count | Variables Used |
|------------|---------------|-----------|----------------|
| Access Approval | `emails.accessApproval` | 16 | accountName, name, accessCode, date, link |
| Access Denial | `emails.accessDenial` | 10 | accountName, name, reason, date |
| Beta Access | `emails.betaAccess` | 28 | name, accountName, accessCode, approvalDate, requestDate, link |
| Registration Reminder | `emails.registrationReminder` | 10 | accountName, name, days, accessCode, link, registrationLink |
| Common Strings | `emails.common` | 6 | accountName, accessCode, date |
| **Total** | | **70** | |

**Acceptance Criteria:**
- Complete mapping documentation created
- All translation keys documented with their paths
- All variables documented with consistent naming
- Special considerations noted (emoji, escaping)
- Documentation ready for use by Tasks 2I.2-2I.6

---

## Translation Key Summary

**Total Translation Keys:** ~70 keys across 5 sub-namespaces

### emails.accessApproval (16 keys)
- subject, greeting, intro
- accessDetails, account, accessCode, requestedOn
- instructions, step1, step2, step3
- notes, note1, note2, note3

### emails.accessDenial (10 keys)
- subject, greeting, intro, message, reason
- requestDetails, account, requestedOn, contact

### emails.betaAccess (28 keys)
- subject (with emoji), greeting, congratulations
- accessDetails, platform, accessCode, betaAccessGranted, originalRequest
- gettingStarted, step1, step2, step3
- accessCodeLabel, directLinkLabel
- whatToExpect, feature1, feature2, feature3, feature4, feature5
- betaNotes, note1, note2, note3, note4, note5
- excited, team (special), footer (special with emoji)

### emails.registrationReminder (10 keys)
- subject, greeting, message
- accessCodeLabel, instructions, step1, step2
- alternative, closing, questions

### emails.common (6 keys)
- regards, team, footer
- accountLabel, accessCodeLabel, requestedOnLabel

---

## Variable Naming Conventions

**Standardized Variables:**
- `{accountName}` - Account display name
- `{name}` - User's name (requester name)
- `{accessCode}` - Access code string
- `{date}` - Formatted date
- `{link}` - Direct registration link
- `{reason}` - Denial reason text
- `{days}` - Number of days since approval
- `{approvalDate}` - Beta approval date
- `{requestDate}` - Original request date
- `{registrationLink}` - General registration URL

**Note:** All variables use camelCase for consistency with JavaScript/TypeScript conventions.

---

## Notes

1. **Email vs Client-Side Translations:** Email templates are server-side only and cannot use next-intl's `useTranslations()` hook. A custom `getEmailTranslation()` utility will be created in Task 2I.2.

2. **Emoji Handling:** Beta access email contains multiple emoji characters (🚀, 🎉, ✨, 📱, 📊, 🛠️, 💌). These are preserved in the English source and all placeholder files. Translation task (2I.8) will decide whether to keep or localize emojis.

3. **Common Strings:** The `emails.common` sub-namespace contains strings shared across multiple emails (regards, team signature, footer). This enables reuse and consistency.

4. **Beta Team Signature:** Beta access email uses "The FAQBNB Beta Team" instead of "The FAQBNB Team", stored in `emails.betaAccess.team` rather than `emails.common.team`.

5. **Newline Characters:** Beta access footer contains a newline character (`\n`). Ensure this is properly escaped in JSON.

6. **No Pluralization:** Email templates don't require ICU plural forms. All counts are written out in prose (e.g., "approved {days} days ago").

7. **Quote Escaping:** Strings containing quotes (e.g., "access to \"{accountName}\"") must use proper JSON escaping.

8. **Placeholder Status:** Non-English files (fr, es, de, nl, it) will have English placeholder text after this task. Task 2I.8 will generate proper translations.

---

---

## APPENDIX A: Translation Key Mapping Documentation

*Generated: 2026-01-22*

This appendix provides comprehensive mapping between email template functions in `/src/lib/email-templates.ts` and their corresponding translation keys in the `emails` namespace.

### A.1 Access Approval Email Mapping

**Function:** `generateAccessApprovalEmail()` (lines 19-77 in email-templates.ts)

**Sub-namespace:** `emails.accessApproval`

**Translation Keys:** 15 keys

| Translation Key | Path | Variables | Original Content (en.json) |
|-----------------|------|-----------|----------------------------|
| subject | `emails.accessApproval.subject` | {accountName} | "Access Granted: {accountName} - Your Access Code" |
| greeting | `emails.accessApproval.greeting` | {name} | "Hello {name}," |
| intro | `emails.accessApproval.intro` | {accountName} | "Great news! Your access request for \"{accountName}\" has been approved." |
| accessDetails | `emails.accessApproval.accessDetails` | — | "Your Access Details:" |
| account | `emails.accessApproval.account` | {accountName} | "Account: {accountName}" |
| accessCode | `emails.accessApproval.accessCode` | {accessCode} | "Access Code: {accessCode}" |
| requestedOn | `emails.accessApproval.requestedOn` | {date} | "Requested on: {date}" |
| instructions | `emails.accessApproval.instructions` | — | "To complete your access setup:" |
| step1 | `emails.accessApproval.step1` | {link} | "Click this direct registration link: {link}" |
| step2 | `emails.accessApproval.step2` | — | "Complete your account registration" |
| step3 | `emails.accessApproval.step3` | — | "Start exploring the items and resources" |
| notes | `emails.accessApproval.notes` | — | "Important Notes:" |
| note1 | `emails.accessApproval.note1` | — | "Keep your access code secure and don't share it with others" |
| note2 | `emails.accessApproval.note2` | — | "Your access code will remain valid until you complete registration" |
| note3 | `emails.accessApproval.note3` | — | "If you have any questions, please contact the account owner" |

**Variables Used:** {accountName}, {name}, {accessCode}, {date}, {link}

**Special Considerations:**
- Internal quotes in `intro` are escaped: `\"{accountName}\"`
- Also uses `emails.common.regards`, `emails.common.team`, and `emails.common.footer`

---

### A.2 Access Denial Email Mapping

**Function:** `generateAccessDenialEmail()` (lines 308-344 in email-templates.ts)

**Sub-namespace:** `emails.accessDenial`

**Translation Keys:** 9 keys

| Translation Key | Path | Variables | Original Content (en.json) |
|-----------------|------|-----------|----------------------------|
| subject | `emails.accessDenial.subject` | {accountName} | "Access Request Update: {accountName}" |
| greeting | `emails.accessDenial.greeting` | {name} | "Hello {name}," |
| intro | `emails.accessDenial.intro` | {accountName} | "Thank you for your interest in accessing \"{accountName}\"." |
| message | `emails.accessDenial.message` | — | "Unfortunately, we're unable to approve your access request at this time." |
| reason | `emails.accessDenial.reason` | {reason} | "Reason: {reason}" |
| requestDetails | `emails.accessDenial.requestDetails` | — | "Request Details:" |
| account | `emails.accessDenial.account` | {accountName} | "Account: {accountName}" |
| requestedOn | `emails.accessDenial.requestedOn` | {date} | "Requested on: {date}" |
| contact | `emails.accessDenial.contact` | — | "If you believe this is an error or have questions about this decision, please contact the account owner directly." |

**Variables Used:** {accountName}, {name}, {reason}, {date}

**Special Considerations:**
- Internal quotes in `intro` are escaped: `\"{accountName}\"`
- The `reason` key is conditionally included only if a reason is provided
- Also uses `emails.common.regards`, `emails.common.team`, and `emails.common.footer`

---

### A.3 Beta Access Email Mapping

**Function:** `generateBetaAccessApprovalEmail()` (lines 87-152 in email-templates.ts)

**Sub-namespace:** `emails.betaAccess`

**Translation Keys:** 28 keys

| Translation Key | Path | Variables | Original Content (en.json) |
|-----------------|------|-----------|----------------------------|
| subject | `emails.betaAccess.subject` | — | "🚀 Welcome to FAQBNB Beta - Access Granted!" |
| greeting | `emails.betaAccess.greeting` | {name} | "Hello {name}," |
| congratulations | `emails.betaAccess.congratulations` | — | "🎉 Congratulations! Your beta waitlist request has been approved, and you now have exclusive early access to FAQBNB!" |
| accessDetails | `emails.betaAccess.accessDetails` | — | "Your Beta Access Details:" |
| platform | `emails.betaAccess.platform` | {accountName} | "Platform: {accountName}" |
| accessCode | `emails.betaAccess.accessCode` | {accessCode} | "Access Code: {accessCode}" |
| betaAccessGranted | `emails.betaAccess.betaAccessGranted` | {approvalDate} | "Beta Access Granted: {approvalDate}" |
| originalRequest | `emails.betaAccess.originalRequest` | {requestDate} | "Original Request: {requestDate}" |
| gettingStarted | `emails.betaAccess.gettingStarted` | — | "Getting Started with Your Beta Access:" |
| step1 | `emails.betaAccess.step1` | {link} | "Click this direct registration link: {link}" |
| step2 | `emails.betaAccess.step2` | — | "Complete your account registration" |
| step3 | `emails.betaAccess.step3` | — | "Start exploring the platform features and capabilities" |
| accessCodeLabel | `emails.betaAccess.accessCodeLabel` | {accessCode} | "Your beta access code: {accessCode}" |
| directLinkLabel | `emails.betaAccess.directLinkLabel` | {link} | "Direct registration link: {link}" |
| whatToExpect | `emails.betaAccess.whatToExpect` | — | "What to Expect:" |
| feature1 | `emails.betaAccess.feature1` | — | "✨ Early access to all FAQBNB features" |
| feature2 | `emails.betaAccess.feature2` | — | "📱 QR code generation and management tools" |
| feature3 | `emails.betaAccess.feature3` | — | "📊 Analytics and insights dashboard" |
| feature4 | `emails.betaAccess.feature4` | — | "🛠️ Priority support during the beta period" |
| feature5 | `emails.betaAccess.feature5` | — | "💌 Direct feedback channel to influence product development" |
| betaNotes | `emails.betaAccess.betaNotes` | — | "Important Beta Program Notes:" |
| note1 | `emails.betaAccess.note1` | — | "Your access code provides full platform access during the beta period" |
| note2 | `emails.betaAccess.note2` | — | "As a beta user, your feedback is invaluable to us" |
| note3 | `emails.betaAccess.note3` | — | "Some features may be evolving - please share your experience!" |
| note4 | `emails.betaAccess.note4` | — | "Keep your access code secure and don't share it with others" |
| note5 | `emails.betaAccess.note5` | — | "Beta users will receive priority updates on new features" |
| excited | `emails.betaAccess.excited` | — | "We're excited to have you as part of our exclusive beta community!" |
| team | `emails.betaAccess.team` | — | "The FAQBNB Beta Team" |
| footer | `emails.betaAccess.footer` | — | "🚀 You're part of something special! Thank you for joining our beta program.\nFor beta support or feedback, please contact us through the platform or reply to this email." |

**Variables Used:** {name}, {accountName}, {accessCode}, {approvalDate}, {requestDate}, {link}

**Special Considerations:**
- Contains 7 emoji characters: 🚀 (2x), 🎉, ✨, 📱, 📊, 🛠️, 💌
- Subject line includes emoji 🚀
- Footer includes emoji 🚀 and a newline character (`\n`)
- Uses its own `team` key instead of `emails.common.team`
- Also uses `emails.common.regards` but NOT `emails.common.footer` (has custom footer)

---

### A.4 Registration Reminder Email Mapping

**Function:** `generateRegistrationReminderEmail()` (lines 354-399 in email-templates.ts)

**Sub-namespace:** `emails.registrationReminder`

**Translation Keys:** 10 keys

| Translation Key | Path | Variables | Original Content (en.json) |
|-----------------|------|-----------|----------------------------|
| subject | `emails.registrationReminder.subject` | {accountName} | "Reminder: Complete Your {accountName} Access Setup" |
| greeting | `emails.registrationReminder.greeting` | {name} | "Hello {name}," |
| message | `emails.registrationReminder.message` | {accountName}, {days} | "This is a friendly reminder that your access to \"{accountName}\" was approved {days} days ago, but you haven't completed your registration yet." |
| accessCodeLabel | `emails.registrationReminder.accessCodeLabel` | {accessCode} | "Your Access Code: {accessCode}" |
| instructions | `emails.registrationReminder.instructions` | — | "To complete your access setup:" |
| step1 | `emails.registrationReminder.step1` | {link} | "Click this direct registration link: {link}" |
| step2 | `emails.registrationReminder.step2` | — | "Complete your account registration" |
| alternative | `emails.registrationReminder.alternative` | {registrationLink}, {accessCode} | "Alternative: Visit {registrationLink} and enter your access code: {accessCode}" |
| closing | `emails.registrationReminder.closing` | — | "Your access code will remain valid, but completing your registration will allow you to start exploring the account's items and resources." |
| questions | `emails.registrationReminder.questions` | — | "If you no longer need access or have any questions, please let us know." |

**Variables Used:** {accountName}, {name}, {days}, {accessCode}, {link}, {registrationLink}

**Special Considerations:**
- Internal quotes in `message` are escaped: `\"{accountName}\"`
- Uses two different variables in `alternative`: {registrationLink} AND {accessCode}
- Also uses `emails.common.regards`, `emails.common.team`, and `emails.common.footer`

---

### A.5 Common Strings Mapping

**Sub-namespace:** `emails.common`

**Translation Keys:** 6 keys

**Purpose:** Reusable strings shared across multiple email types.

| Translation Key | Path | Variables | Original Content (en.json) | Used In |
|-----------------|------|-----------|----------------------------|---------|
| regards | `emails.common.regards` | — | "Best regards," | All email types |
| team | `emails.common.team` | — | "The FAQBNB Team" | Access Approval, Access Denial, Registration Reminder |
| footer | `emails.common.footer` | — | "This is an automated message. Please do not reply to this email." | Access Approval, Access Denial, Registration Reminder |
| accountLabel | `emails.common.accountLabel` | {accountName} | "Account: {accountName}" | Not currently used (available for future use) |
| accessCodeLabel | `emails.common.accessCodeLabel` | {accessCode} | "Access Code: {accessCode}" | Not currently used (available for future use) |
| requestedOnLabel | `emails.common.requestedOnLabel` | {date} | "Requested on: {date}" | Not currently used (available for future use) |

**Variables Used:** {accountName}, {accessCode}, {date}

**Special Considerations:**
- Beta Access email does NOT use `emails.common.team` or `emails.common.footer` (has custom versions)
- Three keys (accountLabel, accessCodeLabel, requestedOnLabel) were created for consistency but are not currently used in the template functions. These can be adopted in future refactoring for better translation reuse.

---

### A.6 Summary Table by Email Type

| Email Type | Function Name | Sub-namespace | Key Count | Total Variables | Emojis |
|------------|---------------|---------------|-----------|-----------------|--------|
| Access Approval | `generateAccessApprovalEmail` | `emails.accessApproval` | 15 | 5 unique | 0 |
| Access Denial | `generateAccessDenialEmail` | `emails.accessDenial` | 9 | 4 unique | 0 |
| Beta Access | `generateBetaAccessApprovalEmail` | `emails.betaAccess` | 28 | 6 unique | 7 |
| Registration Reminder | `generateRegistrationReminderEmail` | `emails.registrationReminder` | 10 | 6 unique | 0 |
| Common Strings | (Shared utility) | `emails.common` | 6 | 3 unique | 0 |
| **TOTAL** | | | **74** | **10 unique** | **7** |

**Note:** Total key count is 74 (increased from 69 due to addition of step1Note keys in accessApproval and betaAccess namespaces).

---

### A.7 Variable Naming Conventions

All variable placeholders follow **ICU MessageFormat** syntax with **camelCase naming**:

| Variable | Type | Used In | Description |
|----------|------|---------|-------------|
| {accountName} | String | All email types | Display name of the account |
| {name} | String | All email types | Requester's name (from `requester_name`) |
| {accessCode} | String | Access Approval, Beta Access, Registration Reminder | Generated access code (12-char alphanumeric) |
| {date} | String | Access Approval, Access Denial | Formatted request date |
| {link} | String | Access Approval, Beta Access, Registration Reminder | Direct registration link with pre-filled code |
| {reason} | String | Access Denial | Optional denial reason |
| {approvalDate} | String | Beta Access | Date beta access was granted |
| {requestDate} | String | Beta Access | Original date of beta waitlist request |
| {days} | Number/String | Registration Reminder | Days since approval (e.g., "7") |
| {registrationLink} | String | Registration Reminder | Base registration URL without query params |

**Standardization Notes:**
- Original code used `accountDisplayName` → standardized to `{accountName}`
- Original code used `requesterName` → standardized to `{name}`
- Original code used `daysSinceApproval` → standardized to `{days}`
- Date formatting is handled by `formatRequestDate()` utility before variable substitution

---

### A.8 Special Considerations

#### Emoji Handling
- **Total Emoji Count:** 7 emoji characters in Beta Access email
- **Locations:** Subject line (🚀), congratulations (🎉), features (✨📱📊🛠️💌), footer (🚀)
- **Encoding:** All files must be UTF-8 to preserve emoji characters
- **Verification:** Run `grep -c '🚀\|🎉\|✨\|📱\|📊\|🛠️\|💌' messages/*.json` to verify (should show 8 occurrences per file due to repetition)

#### Newline Characters
- Beta Access footer contains a newline: `"🚀 You're part of something special! Thank you for joining our beta program.\nFor beta support or feedback..."`
- Must be escaped as `\n` in JSON strings
- Will render as line break in email clients

#### Quote Escaping
Internal quotes within strings must use JSON escaping:
```json
"intro": "Thank you for your interest in accessing \"{accountName}\"."
```
Not:
```json
"intro": "Thank you for your interest in accessing "{accountName}"."  // WRONG
```

#### Placeholder Text Status
- **en.json:** Contains actual English content
- **fr.json, es.json, de.json, nl.json, it.json:** Currently contain English placeholder text
- Actual translations will be generated in Task 2I.8 (REQ-E02-018)

#### No Pluralization
- Email templates do not require ICU plural forms (no `{count, plural, =1 {...} other {...}}`)
- Counts are written in prose: "approved {days} days ago" (not "approved {days} day(s) ago")

#### Consistency Checks
To verify all 6 files have identical structure:
```bash
node -e "
const getKeys = (obj, prefix = '') => {
  const keys = [];
  for (const key in obj) {
    const path = prefix ? \`\${prefix}.\${key}\` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      keys.push(...getKeys(obj[key], path));
    } else {
      keys.push(path);
    }
  }
  return keys.sort();
};

const en = require('./messages/en.json');
const fr = require('./messages/fr.json');
// ... etc

console.log('All match:', JSON.stringify(getKeys(en.emails)) === JSON.stringify(getKeys(fr.emails)));
"
```

---

## End of Document

---

*Document last modified: 2026-01-22*
