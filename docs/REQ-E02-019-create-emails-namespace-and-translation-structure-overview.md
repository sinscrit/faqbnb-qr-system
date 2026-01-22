# Implementation Overview: Create `emails` Namespace and Translation Structure

**Document Created:** 2026-01-22 22:59
**Last Modified:** 2026-01-22 22:59

---

## Header

| Field | Value |
|-------|-------|
| Task Reference | Task 2I.1 (Sub-Epic 2I: Email Templates) |
| Source File | docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md |
| Implementation Plan | Epic 2 - L10N Static UI Translation |
| Original Plan Date | Not specified |
| Breakdown Created | 2026-01-22 22:59 |
| T-shirt Size | Small |
| Estimated Effort | 2-3 hours |
| Status | PENDING |

---

## Executive Summary

This task establishes the foundational translation structure for email templates in the FAQBNB application. Unlike client-side UI components that use next-intl hooks, email templates are server-side and require a custom translation mechanism. This task creates the `emails` namespace structure with approximately 60-80 translation keys covering access approval, access denial, beta welcome, and registration reminder emails across 4 distinct email templates.

**Key Deliverable:** A complete `emails` namespace in all 6 translation files (`/messages/{locale}.json`) with properly structured, hierarchical translation keys ready for server-side email generation.

---

## Goals

### Primary Objectives

1. **Create `emails` namespace structure** in `/messages/en.json` with ~60-80 translation keys
2. **Replicate namespace structure** to all 5 non-English translation files (fr, es, de, nl, it)
3. **Organize translations hierarchically** by email template type (accessApproval, accessDenial, betaAccess, registrationReminder)
4. **Support variable interpolation** using ICU message format syntax (`{variableName}`)
5. **Maintain consistency** with existing translation conventions and structure

### Success Criteria

- [ ] `emails` namespace exists in all 6 language files
- [ ] All 4 email template sub-namespaces are complete (accessApproval, accessDenial, betaAccess, registrationReminder)
- [ ] Variable placeholders use consistent ICU format (`{accountName}`, `{accessCode}`, etc.)
- [ ] English translations match current hardcoded email content in `/src/lib/email-templates.ts`
- [ ] Non-English files have English placeholder text (to be translated in Task 2I.8)
- [ ] Translation structure supports all current email generation functions

### Assumptions & Clarifications

- **Assumption 1:** Email translations will be accessed server-side via a custom `getEmailTranslation()` utility (Task 2I.2)
- **Assumption 2:** Variable interpolation will use simple `{key}` replacement, not full ICU MessageFormat features (no pluralization in emails)
- **Assumption 3:** Non-English translations in this task are English placeholders; actual translations come in Task 2I.8
- **Assumption 4:** Email HTML structure remains unchanged; only text content is extracted to translations
- **Clarification Needed:** Should emoji characters (🚀, 🎉, ✨, etc.) in beta emails be preserved across all languages or localized?

---

## Technical Context

### Current State

**Email Template System:**
- Location: `/src/lib/email-templates.ts` (547 lines)
- 4 main email generation functions:
  1. `generateAccessApprovalEmail()` - Lines 19-77
  2. `generateBetaAccessApprovalEmail()` - Lines 87-152
  3. `generateAccessDenialEmail()` - Lines 308-344
  4. `generateRegistrationReminderEmail()` - Lines 354-399

**Current Email Content:** All email text is hardcoded as template literals within these functions

**Translation System:**
- Framework: next-intl (Epic 1 foundation - REQ-250)
- Translation files: `/messages/{locale}.json` (6 languages: en, fr, es, de, nl, it)
- File sizes: 170-180KB each, ~4,000+ lines
- Supported languages defined in: `/src/contexts/LocaleContext.tsx` (line 24)
  ```typescript
  export type SupportedLanguage = 'en' | 'fr' | 'es' | 'de' | 'nl' | 'it';
  ```

**Key Difference:** Email templates are server-side only and cannot use next-intl's `useTranslations()` hook (client-side only)

### Architecture Patterns

**Translation File Structure:**
```json
{
  "common": { /* ~800 keys - REQ-E02-001 */ },
  "auth": { /* ~150 keys - REQ-E02-007 */ },
  "dashboard": { /* ~300 keys - REQ-E02-013 */ },
  "items": { /* ~400 keys - REQ-E02-055 */ },
  "settings": { /* ~150 keys - REQ-E02-013 */ },
  "emails": { /* NEW - ~60-80 keys */ }
}
```

**Email-Specific Requirements:**
1. **Variable Interpolation:** Use `{variableName}` syntax for dynamic content
2. **No Pluralization:** Emails don't require ICU plural forms (counts are always written out)
3. **Formal Tone:** All emails use professional, formal language
4. **Consistent Naming:** Translation keys use camelCase with hierarchical dot notation

---

## Implementation Plan

### Step 1: Analyze Current Email Templates
**Description:** Extract all hardcoded text strings from the 4 email generation functions in `/src/lib/email-templates.ts`
**Rationale:** Must ensure 100% coverage of existing email content before creating translation structure
**Estimated Effort:** 30 minutes (Small)

**Key Extraction Points:**
- Subject lines (4 subjects)
- Greeting patterns (1 greeting template: "Hello {name},")
- Body paragraphs (15-20 paragraphs across 4 emails)
- List items (instructions, features, notes)
- Call-to-action text (links, buttons)
- Footer text (automated message disclaimer, team signature)

**Variables to Identify:**
- `{name}` / `{requesterName}`
- `{accountName}` / `{accountDisplayName}`
- `{accessCode}`
- `{date}` / `{requestDate}`
- `{link}` / `{directRegistrationLink}` / `{registrationLink}`
- `{reason}`
- `{days}` / `{daysSinceApproval}`

### Step 2: Design Translation Namespace Structure
**Description:** Create hierarchical namespace design for `emails` with 4 sub-namespaces
**Rationale:** Logical organization by email type enables maintainable, scalable translation structure
**Estimated Effort:** 20 minutes (Small)

**Namespace Structure:**
```json
{
  "emails": {
    "accessApproval": {
      "subject": "...",
      "greeting": "...",
      "intro": "...",
      "accessDetails": "...",
      "account": "...",
      "accessCode": "...",
      "requestedOn": "...",
      "instructions": "...",
      "step1": "...",
      "step2": "...",
      "step3": "...",
      "notes": "...",
      "note1": "...",
      "note2": "...",
      "note3": "...",
      "regards": "...",
      "team": "...",
      "footer": "..."
    },
    "accessDenial": {
      "subject": "...",
      "greeting": "...",
      "intro": "...",
      "message": "...",
      "reason": "...",
      "requestDetails": "...",
      "contact": "...",
      "regards": "...",
      "team": "...",
      "footer": "..."
    },
    "betaAccess": {
      "subject": "...",
      "greeting": "...",
      "congratulations": "...",
      "accessDetails": "...",
      "gettingStarted": "...",
      "step1": "...",
      "step2": "...",
      "step3": "...",
      "whatToExpect": "...",
      "feature1": "...",
      "feature2": "...",
      "feature3": "...",
      "feature4": "...",
      "feature5": "...",
      "betaNotes": "...",
      "note1": "...",
      "note2": "...",
      "note3": "...",
      "note4": "...",
      "note5": "...",
      "excited": "...",
      "regards": "...",
      "team": "...",
      "footer": "..."
    },
    "registrationReminder": {
      "subject": "...",
      "greeting": "...",
      "message": "...",
      "accessCode": "...",
      "instructions": "...",
      "step1": "...",
      "step2": "...",
      "alternative": "...",
      "closing": "...",
      "regards": "...",
      "team": "...",
      "footer": "..."
    },
    "common": {
      "regards": "Best regards,",
      "team": "The FAQBNB Team",
      "footer": "This is an automated message. Please do not reply to this email."
    }
  }
}
```

**Design Decision:** Include a `common` sub-namespace for shared strings across emails (regards, team signature, footer)

### Step 3: Create English Translation Structure
**Description:** Add complete `emails` namespace to `/messages/en.json` with all ~60-80 keys
**Rationale:** English is the source language; all other languages will copy this structure
**Estimated Effort:** 45 minutes (Small)

**File:** `/messages/en.json`
**Location:** Add new `emails` namespace at end of file (before closing brace)
**Current file size:** 4,274 lines, 165KB
**New content:** ~150-200 lines

**Implementation Approach:**
1. Open `/messages/en.json` in editor
2. Navigate to end of file (before final `}`)
3. Add comma after last existing namespace
4. Insert complete `emails` namespace structure
5. Verify JSON validity with linter
6. Ensure proper indentation (2 spaces)

**Variable Syntax:**
```json
"subject": "Access Granted: {accountName} - Your Access Code",
"greeting": "Hello {name},",
"intro": "Great news! Your access request for \"{accountName}\" has been approved.",
"account": "Account: {accountName}",
"accessCode": "Access Code: {accessCode}",
"requestedOn": "Requested on: {date}"
```

### Step 4: Replicate Structure to French Translation File
**Description:** Copy `emails` namespace structure to `/messages/fr.json` with English placeholder text
**Rationale:** Establish structure in all language files; actual translations come in Task 2I.8
**Estimated Effort:** 10 minutes (Small)

**File:** `/messages/fr.json`
**Action:** Copy entire `emails` namespace from `en.json` to `fr.json`
**Content:** Identical to English version (placeholders)
**Note:** Add comment indicating placeholder status (Task 2I.8 will replace)

### Step 5: Replicate Structure to Spanish Translation File
**Description:** Copy `emails` namespace structure to `/messages/es.json` with English placeholder text
**Rationale:** Consistent structure across all language files
**Estimated Effort:** 10 minutes (Small)

**File:** `/messages/es.json`
**Action:** Copy entire `emails` namespace from `en.json` to `es.json`

### Step 6: Replicate Structure to German Translation File
**Description:** Copy `emails` namespace structure to `/messages/de.json` with English placeholder text
**Rationale:** Consistent structure across all language files
**Estimated Effort:** 10 minutes (Small)

**File:** `/messages/de.json`
**Action:** Copy entire `emails` namespace from `en.json` to `de.json`

### Step 7: Replicate Structure to Dutch Translation File
**Description:** Copy `emails` namespace structure to `/messages/nl.json` with English placeholder text
**Rationale:** Consistent structure across all language files
**Estimated Effort:** 10 minutes (Small)

**File:** `/messages/nl.json`
**Action:** Copy entire `emails` namespace from `en.json` to `nl.json`

### Step 8: Replicate Structure to Italian Translation File
**Description:** Copy `emails` namespace structure to `/messages/it.json` with English placeholder text
**Rationale:** Consistent structure across all language files
**Estimated Effort:** 10 minutes (Small)

**File:** `/messages/it.json`
**Action:** Copy entire `emails` namespace from `en.json` to `it.json`

### Step 9: Validate JSON Syntax Across All Files
**Description:** Run JSON linter/validator on all 6 modified translation files
**Rationale:** Catch syntax errors early before they cause runtime issues
**Estimated Effort:** 15 minutes (Small)

**Validation Steps:**
1. Use `npm run typecheck` or JSON linter
2. Verify no trailing commas
3. Verify proper escaping of quotes in strings (e.g., `don't` → `don\\'t`)
4. Verify all variable placeholders use consistent format
5. Check file encoding (UTF-8)
6. Verify no duplicate keys

**Test Command:**
```bash
# Validate JSON syntax
node -e "console.log('Valid JSON')" < messages/en.json
node -e "console.log('Valid JSON')" < messages/fr.json
# ... repeat for all files
```

### Step 10: Document Translation Key Mapping
**Description:** Create reference document mapping email template variables to translation keys
**Rationale:** Enables Task 2I.2 (utility function) and Tasks 2I.3-2I.6 (email function updates) to proceed smoothly
**Estimated Effort:** 20 minutes (Small)

**Deliverable:** Markdown table in this document's Appendix showing:
- Email function name
- Current variable
- Translation key path
- Example usage

**Example Mapping:**
| Email Function | Variable | Translation Key | Example |
|----------------|----------|-----------------|---------|
| `generateAccessApprovalEmail` | `subject` | `emails.accessApproval.subject` | Access Granted: {accountName}... |
| `generateAccessApprovalEmail` | Body intro | `emails.accessApproval.intro` | Great news! Your access... |

---

## Authorized Files and Functions for Modification

> ⚠️ **APPROVED SCOPE**: Changes outside this list require review

### Translation Files (CREATE `emails` namespace)

| File | Target | Type | Lines Modified |
|------|--------|------|----------------|
| `/messages/en.json` | `emails` namespace | Create | End of file (~4274+) |
| `/messages/fr.json` | `emails` namespace | Create | End of file (~4000+) |
| `/messages/es.json` | `emails` namespace | Create | End of file (~4000+) |
| `/messages/de.json` | `emails` namespace | Create | End of file (~4000+) |
| `/messages/nl.json` | `emails` namespace | Create | End of file (~4000+) |
| `/messages/it.json` | `emails` namespace | Create | End of file (~4000+) |

### Documentation (UPDATE)

| File | Target | Type | Lines Modified |
|------|--------|------|----------------|
| This document | Appendix A: Translation Key Mapping | Extend | End of document |

**Note:** This task does NOT modify `/src/lib/email-templates.ts` - those changes come in Tasks 2I.3-2I.7

---

## Dependencies

### Depends On (Completed First)

- **REQ-250** (Epic 1): Application-Specific Locale Context Wrapper - Provides `SupportedLanguage` type definition
- **REQ-E02-001** (Task 2H.1): Create `common` namespace structure - Established translation file conventions and structure patterns

**What They Provide:**
- REQ-250: `SupportedLanguage` type used in utility function design
- REQ-E02-001: Namespace organization patterns, camelCase key naming, hierarchical structure examples

### Blocks (Requires This First)

- **REQ-E02-020** (Task 2I.2): Create `getEmailTranslation` utility function - Cannot implement without translation structure
- **REQ-E02-021** (Task 2I.3): Update `generateAccessApprovalEmail` function - Requires translation keys to exist
- **REQ-E02-022** (Task 2I.4): Update `generateAccessDenialEmail` function - Requires translation keys to exist
- **REQ-E02-023** (Task 2I.5): Update `generateBetaAccessApprovalEmail` function - Requires translation keys to exist
- **REQ-E02-024** (Task 2I.6): Update `generateRegistrationReminderEmail` function - Requires translation keys to exist
- **REQ-E02-026** (Task 2I.8): Generate translations for 5 non-English languages - Requires English source structure to exist

**What We Provide:**
- Complete `emails` namespace structure with ~60-80 translation keys
- Consistent variable placeholder syntax across all email types
- Foundation for server-side translation utility function
- English source content for machine translation in Task 2I.8

### Parallel Safety

**Files touched by this task:**
- `/messages/en.json`
- `/messages/fr.json`
- `/messages/es.json`
- `/messages/de.json`
- `/messages/nl.json`
- `/messages/it.json`

**Conflicts with:**
- **Any other Epic 2 task running concurrently** that modifies translation files
- **Specifically risky:** Tasks 2A-2H (other sub-epics) that may add content to same translation files

**Safe to parallelize with:**
- Task 2I.2-2I.7 (Email function updates) - These modify `/src/lib/` files, not translation files
- Any tasks modifying React components only
- Any tasks modifying API endpoints only

**Recommendation:** Run Task 2I.1 FIRST before any other Sub-Epic 2I tasks, but it can run in parallel with implementation work from other sub-epics (2A-2H) if they've already completed their translation structure tasks

### External Dependencies

- **JSON Parser:** Node.js built-in JSON parser for validation
- **Text Editor:** Any editor supporting JSON syntax (VS Code recommended)
- **Translation Files:** Existing `/messages/{locale}.json` files with proper structure

---

## Risks and Considerations

### Potential Side Effects

1. **File Size Growth:** Each translation file will grow by ~5-8KB (~150-200 lines)
   - **Mitigation:** Acceptable growth; files remain under 200KB

2. **JSON Syntax Errors:** Manual editing of large JSON files risks syntax errors
   - **Mitigation:** Step 9 validates all files; use JSON linter in editor

3. **Variable Name Inconsistencies:** Different variable names in different emails
   - **Mitigation:** Document all variables in Appendix; use consistent naming (e.g., always `{accountName}`, not `{account}`)

4. **Translation File Conflicts:** Concurrent edits by other tasks
   - **Mitigation:** See Parallel Safety section; coordinate with pipeline orchestrator

5. **Emoji Rendering Issues:** Beta email contains emoji (🚀, 🎉, ✨)
   - **Mitigation:** Test email rendering across mail clients; document emoji preservation decision

### Testing Requirements

**Manual Testing:**
1. **JSON Validation:** All 6 translation files parse without errors
2. **Key Completeness:** All emails have corresponding translation keys
3. **Variable Syntax:** All `{variable}` placeholders use consistent format
4. **Structure Verification:** Namespace hierarchy matches design in Step 2

**Automated Testing (Future):**
- Task 2I.9 will create email generation tests that validate translation key usage
- Epic 2 QC script (Plan-111 lines 1307-1314) will verify key presence across all languages

**QA Checklist:**
- [ ] All 6 language files parse as valid JSON
- [ ] `emails` namespace exists in all 6 files
- [ ] All 4 sub-namespaces present: accessApproval, accessDenial, betaAccess, registrationReminder
- [ ] Variable placeholders consistently use `{variableName}` syntax
- [ ] English content matches current email-templates.ts strings
- [ ] Non-English files contain English placeholder text
- [ ] No duplicate keys within `emails` namespace

### Open Questions

- [ ] **Q1:** Should emoji characters (🚀, 🎉, ✨, 📱, 📊, 🛠️, 💌) in beta emails be preserved in all language translations?
  - **Options:**
    - A) Keep emojis in all languages (universal visual elements)
    - B) Remove emojis (professional tone across all markets)
    - C) Make emojis configurable per language
  - **Recommendation:** Option A - Emojis are universal and enhance beta excitement tone

- [ ] **Q2:** Should the footer disclaimer be identical across all emails or customizable per email type?
  - **Current:** Identical footer in all emails: "This is an automated message. Please do not reply to this email."
  - **Recommendation:** Keep identical via `emails.common.footer` for consistency

- [ ] **Q3:** Should beta team signature differ from standard team signature?
  - **Current:** Beta uses "The FAQBNB Beta Team" vs standard "The FAQBNB Team"
  - **Recommendation:** Create separate keys: `emails.common.team` and `emails.betaAccess.team`

---

## Out of Scope

**Explicitly NOT included in this task:**

1. **Creating `getEmailTranslation()` utility function** - Task 2I.2
2. **Updating email generation functions** to use translations - Tasks 2I.3-2I.6
3. **Adding language parameter** to email functions - Task 2I.7
4. **Translating to non-English languages** - Task 2I.8 (this task only creates English placeholders)
5. **Testing email generation** in multiple languages - Task 2I.9
6. **Modifying email HTML rendering** - HTML structure remains unchanged
7. **Creating new email templates** - Only translating existing 4 templates
8. **Updating email send functionality** - No changes to email delivery logic
9. **Database schema changes** - No migration needed for this task
10. **Adding new languages** beyond the existing 6 - Out of scope for Epic 2

---

## Success Metrics

### Quantitative Metrics

1. **Translation Coverage:** 100% of hardcoded email strings extracted (target: 60-80 keys)
2. **File Coverage:** `emails` namespace added to all 6 language files (target: 6/6)
3. **JSON Validity:** All 6 modified files parse without errors (target: 0 errors)
4. **Key Consistency:** All language files have identical key structure (target: 100% match)
5. **Variable Consistency:** All placeholder variables use `{variableName}` format (target: 100%)

### Qualitative Metrics

1. **Code Review Approval:** Technical lead approves namespace structure design
2. **Maintainability:** Future developers can easily add new email templates to namespace
3. **Clarity:** Translation keys clearly map to email content sections
4. **Consistency:** Namespace follows same patterns as other Epic 2 namespaces (common, auth, dashboard, etc.)

### Acceptance Criteria

**Task is complete when:**
- ✅ `/messages/en.json` contains complete `emails` namespace with ~60-80 keys
- ✅ All 5 non-English translation files contain identical structure with English placeholders
- ✅ All 6 files validate as proper JSON syntax
- ✅ Appendix A documents all translation keys with variable mappings
- ✅ No existing translation keys were modified or removed
- ✅ Git commit created with descriptive message: "[REQ-E02-019] Create emails namespace and translation structure"

---

## Implementation Notes

### Key Decisions Made

1. **Namespace Location:** Added at end of translation files (before closing brace) to avoid disrupting existing content
2. **Common Sub-namespace:** Created `emails.common` for shared strings (regards, team, footer) to enable reuse across email types
3. **Variable Naming:** Standardized on `{accountName}`, `{accessCode}`, `{name}`, etc. (camelCase, descriptive)
4. **Placeholder Strategy:** Non-English files get English text initially; Task 2I.8 replaces with proper translations
5. **Beta Email Special Handling:** Beta email gets its own complete sub-namespace due to significantly different content

### Alternative Approaches Considered

**Alternative 1: Use next-intl on server-side**
- **Pros:** Reuse existing translation infrastructure
- **Cons:** next-intl hooks are client-side only; server-side usage requires different approach
- **Decision:** Rejected - Use custom utility function (Task 2I.2) instead

**Alternative 2: Flat namespace structure (emails.accessApprovalSubject vs emails.accessApproval.subject)**
- **Pros:** Simpler key paths
- **Cons:** Less maintainable, harder to organize, inconsistent with other namespaces
- **Decision:** Rejected - Use hierarchical structure for consistency

**Alternative 3: Separate translation files per email type**
- **Pros:** Smaller files, easier to manage individual emails
- **Cons:** Breaks existing translation file structure, complicates utility function, inconsistent with Epic 2 approach
- **Decision:** Rejected - Keep all translations in main translation files

---

## Appendix A: Translation Key Mapping

### Access Approval Email (Standard)

**Function:** `generateAccessApprovalEmail()` (lines 19-77)

| Content | Current String | Translation Key | Variables |
|---------|----------------|-----------------|-----------|
| Subject | `Access Granted: ${accountDisplayName} - Your Access Code` | `emails.accessApproval.subject` | `{accountName}` |
| Greeting | `Hello ${requesterName},` | `emails.accessApproval.greeting` | `{name}` |
| Intro | `Great news! Your access request for "${accountDisplayName}" has been approved.` | `emails.accessApproval.intro` | `{accountName}` |
| Section Header | `Your Access Details:` | `emails.accessApproval.accessDetails` | none |
| Account Line | `Account: ${accountDisplayName}` | `emails.accessApproval.account` | `{accountName}` |
| Code Line | `Access Code: ${accessCode}` | `emails.accessApproval.accessCode` | `{accessCode}` |
| Date Line | `Requested on: ${formatRequestDate(request.request_date)}` | `emails.accessApproval.requestedOn` | `{date}` |
| Instructions Header | `To complete your access setup:` | `emails.accessApproval.instructions` | none |
| Step 1 | `Click this direct registration link: ${directRegistrationLink}` | `emails.accessApproval.step1` | `{link}` |
| Step 2 | `Complete your account registration` | `emails.accessApproval.step2` | none |
| Step 3 | `Start exploring the items and resources` | `emails.accessApproval.step3` | none |
| Notes Header | `Important Notes:` | `emails.accessApproval.notes` | none |
| Note 1 | `Keep your access code secure and don't share it with others` | `emails.accessApproval.note1` | none |
| Note 2 | `Your access code will remain valid until you complete registration` | `emails.accessApproval.note2` | none |
| Note 3 | `If you have any questions, please contact the account owner` | `emails.accessApproval.note3` | none |
| Closing | `Best regards,` | `emails.common.regards` | none |
| Team | `The FAQBNB Team` | `emails.common.team` | none |
| Footer | `This is an automated message. Please do not reply to this email.` | `emails.common.footer` | none |

### Access Denial Email

**Function:** `generateAccessDenialEmail()` (lines 308-344)

| Content | Current String | Translation Key | Variables |
|---------|----------------|-----------------|-----------|
| Subject | `Access Request Update: ${accountDisplayName}` | `emails.accessDenial.subject` | `{accountName}` |
| Greeting | `Hello ${requesterName},` | `emails.accessDenial.greeting` | `{name}` |
| Intro | `Thank you for your interest in accessing "${accountDisplayName}".` | `emails.accessDenial.intro` | `{accountName}` |
| Message | `Unfortunately, we're unable to approve your access request at this time.` | `emails.accessDenial.message` | none |
| Reason | `Reason: ${reason}` | `emails.accessDenial.reason` | `{reason}` |
| Details Header | `Request Details:` | `emails.accessDenial.requestDetails` | none |
| Contact | `If you believe this is an error or have questions about this decision, please contact the account owner directly.` | `emails.accessDenial.contact` | none |
| Closing | `Best regards,` | `emails.common.regards` | none |
| Team | `The FAQBNB Team` | `emails.common.team` | none |
| Footer | `This is an automated message. Please do not reply to this email.` | `emails.common.footer` | none |

### Beta Access Approval Email

**Function:** `generateBetaAccessApprovalEmail()` (lines 87-152)

| Content | Current String | Translation Key | Variables |
|---------|----------------|-----------------|-----------|
| Subject | `🚀 Welcome to FAQBNB Beta - Access Granted!` | `emails.betaAccess.subject` | none |
| Greeting | `Hello ${requesterName},` | `emails.betaAccess.greeting` | `{name}` |
| Congratulations | `🎉 Congratulations! Your beta waitlist request has been approved, and you now have exclusive early access to FAQBNB!` | `emails.betaAccess.congratulations` | none |
| Access Details Header | `Your Beta Access Details:` | `emails.betaAccess.accessDetails` | none |
| Getting Started Header | `Getting Started with Your Beta Access:` | `emails.betaAccess.gettingStarted` | none |
| Step 1 | `Click this direct registration link: ${directRegistrationLink}` | `emails.betaAccess.step1` | `{link}` |
| Step 2 | `Complete your account registration` | `emails.betaAccess.step2` | none |
| Step 3 | `Start exploring the platform features and capabilities` | `emails.betaAccess.step3` | none |
| What to Expect Header | `What to Expect:` | `emails.betaAccess.whatToExpect` | none |
| Feature 1 | `✨ Early access to all FAQBNB features` | `emails.betaAccess.feature1` | none |
| Feature 2 | `📱 QR code generation and management tools` | `emails.betaAccess.feature2` | none |
| Feature 3 | `📊 Analytics and insights dashboard` | `emails.betaAccess.feature3` | none |
| Feature 4 | `🛠️ Priority support during the beta period` | `emails.betaAccess.feature4` | none |
| Feature 5 | `💌 Direct feedback channel to influence product development` | `emails.betaAccess.feature5` | none |
| Beta Notes Header | `Important Beta Program Notes:` | `emails.betaAccess.betaNotes` | none |
| Beta Note 1 | `Your access code provides full platform access during the beta period` | `emails.betaAccess.note1` | none |
| Beta Note 2 | `As a beta user, your feedback is invaluable to us` | `emails.betaAccess.note2` | none |
| Beta Note 3 | `Some features may be evolving - please share your experience!` | `emails.betaAccess.note3` | none |
| Beta Note 4 | `Keep your access code secure and don't share it with others` | `emails.betaAccess.note4` | none |
| Beta Note 5 | `Beta users will receive priority updates on new features` | `emails.betaAccess.note5` | none |
| Excited | `We're excited to have you as part of our exclusive beta community!` | `emails.betaAccess.excited` | none |
| Closing | `Best regards,` | `emails.common.regards` | none |
| Team | `The FAQBNB Beta Team` | `emails.betaAccess.team` | none |
| Footer Special | `🚀 You're part of something special! Thank you for joining our beta program.` | `emails.betaAccess.footer` | none |

### Registration Reminder Email

**Function:** `generateRegistrationReminderEmail()` (lines 354-399)

| Content | Current String | Translation Key | Variables |
|---------|----------------|-----------------|-----------|
| Subject | `Reminder: Complete Your ${accountDisplayName} Access Setup` | `emails.registrationReminder.subject` | `{accountName}` |
| Greeting | `Hello ${requesterName},` | `emails.registrationReminder.greeting` | `{name}` |
| Message | `This is a friendly reminder that your access to "${accountDisplayName}" was approved ${daysSinceApproval} days ago, but you haven't completed your registration yet.` | `emails.registrationReminder.message` | `{accountName}`, `{days}` |
| Access Code Line | `Your Access Code: ${accessCode}` | `emails.registrationReminder.accessCode` | `{accessCode}` |
| Instructions Header | `To complete your access setup:` | `emails.registrationReminder.instructions` | none |
| Step 1 | `Click this direct registration link: ${directRegistrationLink}` | `emails.registrationReminder.step1` | `{link}` |
| Step 2 | `Complete your account registration` | `emails.registrationReminder.step2` | none |
| Alternative | `Alternative: Visit ${registrationLink} and enter your access code: ${accessCode}` | `emails.registrationReminder.alternative` | `{registrationLink}`, `{accessCode}` |
| Closing Message | `Your access code will remain valid, but completing your registration will allow you to start exploring the account's items and resources.` | `emails.registrationReminder.closing` | none |
| Closing | `Best regards,` | `emails.common.regards` | none |
| Team | `The FAQBNB Team` | `emails.common.team` | none |
| Footer | `This is an automated message. Please do not reply to this email.` | `emails.common.footer` | none |

---

## Appendix B: Complete English Namespace Structure

```json
{
  "emails": {
    "accessApproval": {
      "subject": "Access Granted: {accountName} - Your Access Code",
      "greeting": "Hello {name},",
      "intro": "Great news! Your access request for \"{accountName}\" has been approved.",
      "accessDetails": "Your Access Details:",
      "account": "Account: {accountName}",
      "accessCode": "Access Code: {accessCode}",
      "requestedOn": "Requested on: {date}",
      "instructions": "To complete your access setup:",
      "step1": "Click this direct registration link: {link}",
      "step2": "Complete your account registration",
      "step3": "Start exploring the items and resources",
      "notes": "Important Notes:",
      "note1": "Keep your access code secure and don't share it with others",
      "note2": "Your access code will remain valid until you complete registration",
      "note3": "If you have any questions, please contact the account owner"
    },
    "accessDenial": {
      "subject": "Access Request Update: {accountName}",
      "greeting": "Hello {name},",
      "intro": "Thank you for your interest in accessing \"{accountName}\".",
      "message": "Unfortunately, we're unable to approve your access request at this time.",
      "reason": "Reason: {reason}",
      "requestDetails": "Request Details:",
      "account": "Account: {accountName}",
      "requestedOn": "Requested on: {date}",
      "contact": "If you believe this is an error or have questions about this decision, please contact the account owner directly."
    },
    "betaAccess": {
      "subject": "🚀 Welcome to FAQBNB Beta - Access Granted!",
      "greeting": "Hello {name},",
      "congratulations": "🎉 Congratulations! Your beta waitlist request has been approved, and you now have exclusive early access to FAQBNB!",
      "accessDetails": "Your Beta Access Details:",
      "platform": "Platform: {accountName}",
      "accessCode": "Access Code: {accessCode}",
      "betaAccessGranted": "Beta Access Granted: {approvalDate}",
      "originalRequest": "Original Request: {requestDate}",
      "gettingStarted": "Getting Started with Your Beta Access:",
      "step1": "Click this direct registration link: {link}",
      "step2": "Complete your account registration",
      "step3": "Start exploring the platform features and capabilities",
      "accessCodeLabel": "Your beta access code: {accessCode}",
      "directLinkLabel": "Direct registration link: {link}",
      "whatToExpect": "What to Expect:",
      "feature1": "✨ Early access to all FAQBNB features",
      "feature2": "📱 QR code generation and management tools",
      "feature3": "📊 Analytics and insights dashboard",
      "feature4": "🛠️ Priority support during the beta period",
      "feature5": "💌 Direct feedback channel to influence product development",
      "betaNotes": "Important Beta Program Notes:",
      "note1": "Your access code provides full platform access during the beta period",
      "note2": "As a beta user, your feedback is invaluable to us",
      "note3": "Some features may be evolving - please share your experience!",
      "note4": "Keep your access code secure and don't share it with others",
      "note5": "Beta users will receive priority updates on new features",
      "excited": "We're excited to have you as part of our exclusive beta community!",
      "team": "The FAQBNB Beta Team",
      "footer": "🚀 You're part of something special! Thank you for joining our beta program.\nFor beta support or feedback, please contact us through the platform or reply to this email."
    },
    "registrationReminder": {
      "subject": "Reminder: Complete Your {accountName} Access Setup",
      "greeting": "Hello {name},",
      "message": "This is a friendly reminder that your access to \"{accountName}\" was approved {days} days ago, but you haven't completed your registration yet.",
      "accessCodeLabel": "Your Access Code: {accessCode}",
      "instructions": "To complete your access setup:",
      "step1": "Click this direct registration link: {link}",
      "step2": "Complete your account registration",
      "alternative": "Alternative: Visit {registrationLink} and enter your access code: {accessCode}",
      "closing": "Your access code will remain valid, but completing your registration will allow you to start exploring the account's items and resources.",
      "questions": "If you no longer need access or have any questions, please let us know."
    },
    "common": {
      "regards": "Best regards,",
      "team": "The FAQBNB Team",
      "footer": "This is an automated message. Please do not reply to this email.",
      "accountLabel": "Account: {accountName}",
      "accessCodeLabel": "Access Code: {accessCode}",
      "requestedOnLabel": "Requested on: {date}"
    }
  }
}
```

---

**End of Document**

*Generated by Technical Lead Agent 02 for Epic 2 L10N - Sub-Epic 2I: Email Templates*
