# Implementation Overview: Update `generateRegistrationReminderEmail` Function

**Document Created:** 2026-01-23 02:03
**Last Modified:** 2026-01-23 02:03

---

## Header

| Field | Value |
|-------|-------|
| Task Reference | Task 2I.6 (Sub-Epic 2I: Email Templates) |
| Source File | docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md |
| Implementation Plan | Epic 2 - L10N Static UI Translation |
| Original Plan Date | Not specified |
| Breakdown Created | 2026-01-23 02:03 |
| T-shirt Size | Small |
| Estimated Effort | 1-1.5 hours |
| Status | PENDING |

---

## Executive Summary

This task refactors the `generateRegistrationReminderEmail()` function in `/src/lib/email-templates.ts` to use the internationalization infrastructure created in Tasks 2I.1 and 2I.2. Currently, the function returns hardcoded English strings. After this task, it will use the `getEmailTranslation()` utility to generate emails in the recipient's preferred language.

**Key Deliverable:** A refactored `generateRegistrationReminderEmail()` function that replaces approximately 10-12 hardcoded English strings with translation calls, while maintaining backward compatibility and preparing for future language parameter support.

**Current Function Signature:**
```typescript
function generateRegistrationReminderEmail(
  request: AccessRequest,
  accessCode: string,
  daysSinceApproval: number,
  accountName?: string,
  baseUrl?: string
): EmailTemplate
```

**Target Function Signature (Task 2I.7 will add language param):**
```typescript
function generateRegistrationReminderEmail(
  request: AccessRequest,
  accessCode: string,
  daysSinceApproval: number,
  accountName?: string,
  baseUrl?: string,
  language?: SupportedLanguage  // Added in Task 2I.7
): EmailTemplate
```

---

## Goals

### Primary Objectives

1. **Replace all hardcoded strings** in `generateRegistrationReminderEmail()` with `getEmailTranslation()` calls
2. **Maintain function signature** temporarily (language parameter added in Task 2I.7)
3. **Use English as default** language for this task (parameter comes later)
4. **Preserve all existing functionality** (variable substitution, link generation)
5. **Update variable mapping** from function locals to translation keys
6. **Maintain backward compatibility** with existing callers
7. **Preserve email structure** exactly (same content, different source)

### Success Criteria

- [ ] All 10-12 hardcoded strings replaced with translation calls
- [ ] Function generates identical English output to current version
- [ ] No breaking changes to function signature or return type
- [ ] All existing test cases pass without modification
- [ ] Translation keys match Task 2I.1 namespace structure (`emails.registrationReminder.*`)
- [ ] Variable interpolation works correctly for all dynamic content
- [ ] Code follows established patterns from Tasks 2I.3-2I.5

### Assumptions & Clarifications

- **Assumption 1:** Language parameter will be added in Task 2I.7; this task uses `'en'` as default
- **Assumption 2:** Translation files from Task 2I.1 contain all required `registrationReminder.*` keys
- **Assumption 3:** `getEmailTranslation()` utility from Task 2I.2 is fully implemented and tested
- **Assumption 4:** Email structure and content remain unchanged; only the source changes
- **Assumption 5:** Imports for translation utility already exist in file (added in Task 2I.3)

---

## Technical Context

### Current State

**File:** `/src/lib/email-templates.ts` (619 lines)
**Function:** `generateRegistrationReminderEmail()` (lines 426-471, ~46 lines)

**Current Implementation Pattern:**
```typescript
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
...hardcoded English strings...`,
    variables: { ... }
  };
}
```

**Hardcoded Strings Count:** ~10-12 distinct strings
- 1 subject line
- 1 greeting
- 1 main message (includes `{days}` variable)
- 1 access code label
- 1 instructions header
- 2 instruction steps
- 1 alternative method line
- 1 closing paragraph
- 1 questions line
- 1 closing/signature
- 1 team name
- 1 footer

**Translation Keys Available (from `/messages/en.json` lines 4316-4327):**
```json
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
}
```

**Existing Imports (from Tasks 2I.3-2I.5):**
```typescript
import { AccessRequest, EmailTemplate, AccessRequestSource } from '@/types/admin';
import { getServerBaseUrl } from './config';
import { getEmailTranslation } from '@/lib/email-translations';
import { SupportedLanguage } from '@/types';
```

### Usage Points

The function may be called from:
1. Scheduled tasks or cron jobs for reminder emails
2. Admin back-office interface for manual reminder sending
3. Email service tests

---

## Implementation Plan

### Step 1: Add Language Constant and Translation Helpers
**Description:** Add language constant and create inline helper functions for translations
**Rationale:** Follow established pattern from Tasks 2I.3-2I.5; prepare for Task 2I.7
**Estimated Effort:** 5 minutes (Small)

**Add after function parameters (line ~433):**
```typescript
export function generateRegistrationReminderEmail(
  request: AccessRequest,
  accessCode: string,
  daysSinceApproval: number,
  accountName?: string,
  baseUrl?: string
  // TODO: Task 2I.7 - Add: language: SupportedLanguage = 'en'
): EmailTemplate {
  // Language constant (defaults to English)
  const language: SupportedLanguage = 'en';
  // TODO: Task 2I.7 - Replace with parameter

  // Helper to translate email content with registrationReminder namespace
  const t = (key: string, vars?: Record<string, string | number>) =>
    getEmailTranslation(`registrationReminder.${key}`, language, vars);

  // Helper for common translations (regards, team, footer)
  const tc = (key: string) =>
    getEmailTranslation(`common.${key}`, language);

  const requesterName = request.requester_name || 'there';
  // ... rest of function
}
```

### Step 2: Replace Subject Line with Translation
**Description:** Convert subject from template literal to translation call
**Rationale:** First, simplest replacement to establish pattern
**Estimated Effort:** 5 minutes (Small)

**Current (line 438):**
```typescript
subject: `Reminder: Complete Your ${accountDisplayName} Access Setup`,
```

**Replace with:**
```typescript
subject: t('subject', { accountName: accountDisplayName }),
```

**Translation Key:** `emails.registrationReminder.subject`
**Variables:** `{accountName}`

### Step 3: Replace Email Body Greeting
**Description:** Convert greeting line to translation call
**Rationale:** Simple replacement with single variable
**Estimated Effort:** 5 minutes (Small)

**Current (line 440):**
```typescript
body: `Hello ${requesterName},
```

**Replace with:**
```typescript
body: `${t('greeting', { name: requesterName })}
```

**Translation Key:** `emails.registrationReminder.greeting`
**Variables:** `{name}`

### Step 4: Replace Main Message
**Description:** Convert main reminder message to translation call
**Rationale:** Contains three variables (accountName, days)
**Estimated Effort:** 5 minutes (Small)

**Current (line 442):**
```typescript
This is a friendly reminder that your access to "${accountDisplayName}" was approved ${daysSinceApproval} days ago, but you haven't completed your registration yet.
```

**Replace with:**
```typescript
${t('message', { accountName: accountDisplayName, days: daysSinceApproval })}
```

**Translation Key:** `emails.registrationReminder.message`
**Variables:** `{accountName}`, `{days}`

### Step 5: Replace Access Code Label
**Description:** Convert access code display line to translation call
**Rationale:** Contains accessCode variable
**Estimated Effort:** 5 minutes (Small)

**Current (line 444):**
```typescript
Your Access Code: ${accessCode}
```

**Replace with:**
```typescript
${t('accessCodeLabel', { accessCode })}
```

**Translation Key:** `emails.registrationReminder.accessCodeLabel`
**Variables:** `{accessCode}`

### Step 6: Replace Instructions Section
**Description:** Convert instructions header and steps to translation calls
**Rationale:** Contains link variable in step 1
**Estimated Effort:** 10 minutes (Small)

**Current (lines 446-448):**
```typescript
To complete your access setup:
1. Click this direct registration link: ${directRegistrationLink}
   (This link pre-fills your access code and email for convenience)
2. Complete your account registration
```

**Replace with:**
```typescript
${t('instructions')}
1. ${t('step1', { link: directRegistrationLink })}
   ${t('step1Note')}
2. ${t('step2')}
```

**Translation Keys:**
- `emails.registrationReminder.instructions` (no variables)
- `emails.registrationReminder.step1` (variable: `{link}`)
- `emails.registrationReminder.step1Note` (no variables) - May need to add this key
- `emails.registrationReminder.step2` (no variables)

**Note:** Check if `step1Note` key exists; if not, it may need to be added to translation files

### Step 7: Replace Alternative Method Line
**Description:** Convert alternative registration method line to translation call
**Rationale:** Contains two variables (registrationLink, accessCode)
**Estimated Effort:** 5 minutes (Small)

**Current (line 450):**
```typescript
Alternative: Visit ${registrationLink} and enter your access code: ${accessCode}
```

**Replace with:**
```typescript
${t('alternative', { registrationLink, accessCode })}
```

**Translation Key:** `emails.registrationReminder.alternative`
**Variables:** `{registrationLink}`, `{accessCode}`

### Step 8: Replace Closing Paragraph
**Description:** Convert closing paragraph to translation call
**Rationale:** Static text encouraging registration completion
**Estimated Effort:** 5 minutes (Small)

**Current (line 452):**
```typescript
Your access code will remain valid, but completing your registration will allow you to start exploring the account's items and resources.
```

**Replace with:**
```typescript
${t('closing')}
```

**Translation Key:** `emails.registrationReminder.closing`
**Variables:** none

### Step 9: Replace Questions Line
**Description:** Convert questions/help line to translation call
**Rationale:** Static text
**Estimated Effort:** 5 minutes (Small)

**Current (line 454):**
```typescript
If you no longer need access or have any questions, please let us know.
```

**Replace with:**
```typescript
${t('questions')}
```

**Translation Key:** `emails.registrationReminder.questions`
**Variables:** none

### Step 10: Replace Closing, Team Signature, and Footer
**Description:** Convert closing lines using common translations
**Rationale:** Shared across all email templates; use `common` namespace
**Estimated Effort:** 5 minutes (Small)

**Current (lines 456-461):**
```typescript
Best regards,
The FAQBNB Team

---
This is an automated message. Please do not reply to this email.
```

**Replace with:**
```typescript
${tc('regards')}
${tc('team')}

---
${tc('footer')}
```

**Translation Keys:**
- `emails.common.regards` (no variables)
- `emails.common.team` (no variables)
- `emails.common.footer` (no variables)

### Step 11: Update JSDoc Comments
**Description:** Update function documentation to reflect translation usage
**Rationale:** Keep documentation accurate and helpful
**Estimated Effort:** 5 minutes (Small)

**Current JSDoc (lines 418-425):**
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

**Update to:**
```typescript
/**
 * Generate reminder email for pending registration
 * Uses translations from emails.registrationReminder namespace
 * Currently generates English emails only (language parameter added in Task 2I.7)
 *
 * @param request - Access request data
 * @param accessCode - Generated access code
 * @param daysSinceApproval - Number of days since approval
 * @param accountName - Optional account name (defaults to 'Account')
 * @param baseUrl - Optional base URL for links (defaults to getServerBaseUrl())
 * @returns Email template with subject and body using translations
 *
 * @see Task 2I.1 - Translation namespace structure
 * @see Task 2I.2 - getEmailTranslation utility
 * @see Task 2I.7 - Language parameter addition (future)
 */
```

### Step 12: Update Variables Object
**Description:** Ensure variables object includes language for debugging
**Rationale:** Backward compatibility with existing code; aids debugging
**Estimated Effort:** 5 minutes (Small)

**Current variables object (lines 463-469):**
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

**Update to:**
```typescript
variables: {
  requesterName,
  accountName: accountDisplayName,
  accessCode,
  daysSinceApproval: daysSinceApproval.toString(),
  registrationLink,
  directRegistrationLink,
  language
}
```

### Step 13: Test Function Output
**Description:** Verify function generates identical English output
**Rationale:** Ensure no regression in email content
**Estimated Effort:** 10 minutes (Small)

**Test Actions:**
1. Run existing tests that cover this function
2. Manually generate a test email and compare output
3. Verify all variables are interpolated correctly
4. Check formatting (newlines, spacing) matches original

---

## Authorized Files and Functions for Modification

> ⚠️ **APPROVED SCOPE**: Changes outside this list require review

### Primary File (MODIFY)

| File | Target | Type | Lines Modified | Purpose |
|------|--------|------|----------------|---------|
| `/src/lib/email-templates.ts` | `generateRegistrationReminderEmail()` | Modify | 418-471 (~54 lines) | Replace hardcoded strings with translation calls |
| `/src/lib/email-templates.ts` | JSDoc comments | Update | 418-425 | Update documentation |

### Files NOT Modified (Dependencies)

| File | Task | Reason |
|------|------|--------|
| `/src/lib/email-translations.ts` | Task 2I.2 | Translation utility already implemented |
| `/messages/*.json` | Task 2I.1 | Translation files already created with `registrationReminder` namespace |
| Callers of this function | N/A | Callers unchanged (no signature change) |

### Files Modified in Later Tasks

| File | Task | Change |
|------|------|--------|
| `/src/lib/email-templates.ts` | Task 2I.7 | Add `language` parameter to function signature |

---

## Dependencies

### Depends On (Completed First)

- **REQ-E02-019** (Task 2I.1): Create `emails` namespace and translation structure
  - **What it provides:** Translation files with `emails.registrationReminder.*` keys
  - **Why critical:** Cannot call `getEmailTranslation()` without translation keys existing
  - **Keys verified:** All 10 keys exist in `/messages/en.json` lines 4316-4327

- **REQ-E02-020** (Task 2I.2): Create `getEmailTranslation` utility function
  - **What it provides:** `getEmailTranslation()` function to call
  - **Why critical:** Core translation mechanism; this task's primary dependency

- **REQ-E02-021** (Task 2I.3): Update `generateAccessApprovalEmail` function
  - **What it provides:** Established pattern for email translation refactoring
  - **Why critical:** Imports already added to file; pattern to follow

- **REQ-E02-022** (Task 2I.4): Update `generateAccessDenialEmail` function
  - **What it provides:** Continued pattern usage
  - **Why critical:** Sequential execution to avoid merge conflicts

- **REQ-E02-023** (Task 2I.5): Update `generateBetaAccessApprovalEmail` function
  - **What it provides:** Completed prior email function
  - **Why critical:** Sequential execution to avoid merge conflicts

### Blocks (Requires This First)

- **REQ-E02-025** (Task 2I.7): Add language parameter to all email generation functions
  - **What we provide:** Refactored function body using translations with placeholder language constant
  - **Blocking reason:** Task 2I.7 converts `const language = 'en'` to parameter; needs refactored body first

- **REQ-E02-026** (Task 2I.8): Generate translations for 5 non-English languages
  - **What we provide:** Validated English translation key usage
  - **Blocking reason:** Ensures all translation keys work before translating them

### Parallel Safety

**Files touched by this task:**
- `/src/lib/email-templates.ts` (lines 418-471)

**Conflicts with:**
- **Tasks 2I.3, 2I.4, 2I.5** - Different functions, same file - ALREADY COMPLETED
- **Task 2I.7** - Same file, will modify function signature

**Safe to parallelize with:**
- **Task 2I.8** (Generate non-English translations) - Different files (`/messages/*.json`)
- **Any Epic 2 tasks from other sub-epics** - No file overlap

**Recommendation:** This is the last email function to refactor before Task 2I.7; execute sequentially

### External Dependencies

**Runtime Dependencies:**
- Translation utility: `/src/lib/email-translations.ts`
- Translation files: `/messages/en.json` (specifically `emails.registrationReminder.*` keys)
- Type definitions: `SupportedLanguage` from `/src/types`

**Build-Time Dependencies:**
- TypeScript compiler for type checking
- ESLint for code quality

---

## Risks and Considerations

### Potential Side Effects

1. **Translation Key Mismatches:**
   - **Risk:** Translation keys don't match Task 2I.1 namespace structure
   - **Impact:** Missing translations, fallback to keys displayed in emails
   - **Mitigation:** Keys verified in `/messages/en.json` lines 4316-4327
   - **Severity:** Low (keys already verified)

2. **Variable Name Mismatches:**
   - **Risk:** Variable names in translation calls don't match translation placeholders
   - **Impact:** Variables not interpolated, `{placeholder}` shown in email
   - **Mitigation:** Verify variable names match translation file
   - **Severity:** Medium

3. **Missing `step1Note` Key:**
   - **Risk:** The step1 parenthetical note "(This link pre-fills...)" may not have a key
   - **Impact:** Need to add key or combine with step1
   - **Mitigation:** Check translation file; add key if missing or adapt implementation
   - **Severity:** Low (easy to resolve)

4. **Formatting Changes:**
   - **Risk:** Translation-based assembly changes email formatting (spacing, newlines)
   - **Impact:** Emails look different from current version
   - **Mitigation:** Carefully preserve whitespace and formatting in string assembly
   - **Severity:** Medium

5. **Backward Compatibility:**
   - **Risk:** Existing callers break due to unexpected changes
   - **Impact:** Scheduled tasks or admin interface errors
   - **Mitigation:** No signature changes; comprehensive testing
   - **Severity:** Low (pattern well-established from prior tasks)

### Testing Requirements

**Unit Tests:**
- [ ] Function generates valid EmailTemplate object
- [ ] Subject contains expected text and variables
- [ ] Body contains all expected sections
- [ ] Variables object populated correctly
- [ ] All translation calls use correct keys
- [ ] Variable interpolation works for all dynamic content
- [ ] `daysSinceApproval` displays correctly in message

**Integration Tests:**
- [ ] Any scheduled tasks using this function still work
- [ ] Admin interface reminder sending still works (if applicable)
- [ ] Existing tests pass without modification

**Manual Testing:**
- [ ] Generate sample registration reminder email
- [ ] Verify output matches current English version exactly
- [ ] Check formatting (spacing, newlines, bullet points)
- [ ] Verify all variables replaced correctly
- [ ] Test with various `daysSinceApproval` values (1, 3, 7, etc.)
- [ ] Test with missing account name (default "Account")

### Open Questions

- [ ] **Q1:** Does the current implementation include the "(This link pre-fills...)" note after step 1?
  - **Analysis:** Looking at current implementation (lines 447-448), yes it does include this
  - **Issue:** `registrationReminder` namespace may not have `step1Note` key
  - **Resolution:** Either add key to translation file or include in `step1` translation
  - **Recommendation:** Check translation file; if missing, add key or adapt implementation

- [ ] **Q2:** Should `daysSinceApproval` remain as number or be formatted as string?
  - **Current:** Stored in variables as `.toString()` but used as number in translation
  - **Recommendation:** Pass as number to translation; `getEmailTranslation` handles conversion

---

## Out of Scope

**Explicitly NOT included in this task:**

1. **Adding language parameter** to function signature - Task 2I.7
2. **Updating function callers** to pass language - Task 2I.7
3. **Translating to non-English languages** - Task 2I.8
4. **Updating other email functions** - Already completed in Tasks 2I.3-2I.5
5. **Testing email generation in multiple languages** - Task 2I.9
6. **Modifying HTML email rendering** - Out of scope for Epic 2
7. **Changing email content or structure** - Only translation, not redesign
8. **Modifying email scheduling logic** - Out of scope
9. **Database schema changes** - No DB changes required

---

## Success Metrics

### Quantitative Metrics

1. **String Replacement Count:** 10-12 hardcoded strings replaced with translation calls
2. **Test Pass Rate:** 100% of existing tests pass without modification
3. **Lines Changed:** ~50 lines modified (function body refactoring)
4. **Translation Keys Used:** 10-12 unique keys from `emails.registrationReminder.*` and `emails.common.*`
5. **Build Errors:** 0 TypeScript compilation errors
6. **Lint Warnings:** 0 ESLint warnings

### Acceptance Criteria

**Task is complete when:**
- ✅ All hardcoded strings replaced with `getEmailTranslation()` calls
- ✅ Function generates identical English email output to current version
- ✅ Translation helper functions (`t` and `tc`) implemented
- ✅ All existing test suites pass without modification
- ✅ No changes to function signature (maintains backward compatibility)
- ✅ JSDoc comments updated with translation references
- ✅ Variables object maintained for backward compatibility
- ✅ TypeScript compiles without errors
- ✅ ESLint passes without warnings
- ✅ Git commit created: "[REQ-E02-024] Update generateRegistrationReminderEmail function"

---

## Appendix A: Translation Key Mapping Reference

### Complete Registration Reminder Email Translation Keys

| # | Current String | Translation Key | Variables | Notes |
|---|----------------|-----------------|-----------|-------|
| 1 | `Reminder: Complete Your ${accountDisplayName} Access Setup` | `registrationReminder.subject` | `{accountName}` | Subject line |
| 2 | `Hello ${requesterName},` | `registrationReminder.greeting` | `{name}` | Opening greeting |
| 3 | `This is a friendly reminder that your access to "${accountDisplayName}" was approved ${daysSinceApproval} days ago...` | `registrationReminder.message` | `{accountName}`, `{days}` | Main message |
| 4 | `Your Access Code: ${accessCode}` | `registrationReminder.accessCodeLabel` | `{accessCode}` | Access code display |
| 5 | `To complete your access setup:` | `registrationReminder.instructions` | none | Instructions header |
| 6 | `Click this direct registration link: ${directRegistrationLink}` | `registrationReminder.step1` | `{link}` | Step 1 |
| 7 | `(This link pre-fills your access code and email for convenience)` | `registrationReminder.step1Note` | none | Step 1 note - MAY NEED TO ADD |
| 8 | `Complete your account registration` | `registrationReminder.step2` | none | Step 2 |
| 9 | `Alternative: Visit ${registrationLink} and enter your access code: ${accessCode}` | `registrationReminder.alternative` | `{registrationLink}`, `{accessCode}` | Alternative method |
| 10 | `Your access code will remain valid...` | `registrationReminder.closing` | none | Closing paragraph |
| 11 | `If you no longer need access or have any questions, please let us know.` | `registrationReminder.questions` | none | Questions line |
| 12 | `Best regards,` | `common.regards` | none | Closing |
| 13 | `The FAQBNB Team` | `common.team` | none | Team signature |
| 14 | `This is an automated message. Please do not reply to this email.` | `common.footer` | none | Footer |

**Total Keys:** 14 (11 from `registrationReminder`, 3 from `common`)
**Keys Verified in Translation File:** 10/11 (step1Note may need verification/addition)

---

## Appendix B: Before/After Code Comparison

### Before (Current Implementation)

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

---

### After (Translation-Based Implementation)

```typescript
/**
 * Generate reminder email for pending registration
 * Uses translations from emails.registrationReminder namespace
 * Currently generates English emails only (language parameter added in Task 2I.7)
 *
 * @param request - Access request data
 * @param accessCode - Generated access code
 * @param daysSinceApproval - Number of days since approval
 * @param accountName - Optional account name (defaults to 'Account')
 * @param baseUrl - Optional base URL for links (defaults to getServerBaseUrl())
 * @returns Email template with subject and body using translations
 *
 * @see Task 2I.1 - Translation namespace structure
 * @see Task 2I.2 - getEmailTranslation utility
 * @see Task 2I.7 - Language parameter addition (future)
 */
export function generateRegistrationReminderEmail(
  request: AccessRequest,
  accessCode: string,
  daysSinceApproval: number,
  accountName?: string,
  baseUrl?: string
  // TODO: Task 2I.7 - Add: language: SupportedLanguage = 'en'
): EmailTemplate {
  // Language constant (defaults to English)
  const language: SupportedLanguage = 'en';
  // TODO: Task 2I.7 - Replace with parameter

  // Helper to translate email content with registrationReminder namespace
  const t = (key: string, vars?: Record<string, string | number>) =>
    getEmailTranslation(`registrationReminder.${key}`, language, vars);

  // Helper for common translations (regards, team, footer)
  const tc = (key: string) =>
    getEmailTranslation(`common.${key}`, language);

  const requesterName = request.requester_name || 'there';
  const accountDisplayName = accountName || 'Account';
  const registrationLink = createRegistrationLink(baseUrl);
  const directRegistrationLink = createRegistrationLinkWithCode(accessCode, request.requester_email, baseUrl);

  return {
    subject: t('subject', { accountName: accountDisplayName }),
    body: `${t('greeting', { name: requesterName })}

${t('message', { accountName: accountDisplayName, days: daysSinceApproval })}

${t('accessCodeLabel', { accessCode })}

${t('instructions')}
1. ${t('step1', { link: directRegistrationLink })}
   ${t('step1Note')}
2. ${t('step2')}

${t('alternative', { registrationLink, accessCode })}

${t('closing')}

${t('questions')}

${tc('regards')}
${tc('team')}

---
${tc('footer')}`,
    variables: {
      requesterName,
      accountName: accountDisplayName,
      accessCode,
      daysSinceApproval: daysSinceApproval.toString(),
      registrationLink,
      directRegistrationLink,
      language
    }
  };
}
```

---

**Key Changes Summary:**
1. Added `language` constant (converted to parameter in Task 2I.7)
2. Created `t()` and `tc()` translation helper functions
3. Replaced all 14 hardcoded strings with translation calls
4. Updated JSDoc comments with translation references
5. Added TODO comments for Task 2I.7
6. Added `language` to variables object for debugging
7. Preserved all existing functionality (variable substitution, link generation)

---

**Note on `step1Note` Key:**
If the translation file does not include `step1Note`, the implementation has two options:
1. **Add key:** Add `"step1Note": "(This link pre-fills your access code and email for convenience)"` to translation files
2. **Combine:** Include the note text within the `step1` translation itself

The current translation file at lines 4316-4327 does NOT include `step1Note`. The implementation should either:
- Add this key to the translation files before implementation, OR
- Omit this parenthetical note from the reminder email to match the translation structure

---

**End of Document**

*Generated by Technical Lead Agent 02 for Epic 2 L10N - Sub-Epic 2I: Email Templates*
