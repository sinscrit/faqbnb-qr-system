# Detailed Task Breakdown: Update `generateRegistrationReminderEmail` Function

**Document Created:** 2026-01-23 03:45
**Last Modified:** 2026-01-23 02:55

**Reference Documents:**
- Overview: docs/REQ-E02-024-update-generateregistrationreminderemail-function-overview.md
- Implementation Plan: docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md
- Requirements: docs/gen_requests.md (Request #24)

**CRITICAL INSTRUCTIONS FOR IMPLEMENTING AGENT:**
- Operate from the project root folder ONLY
- **DO NOT ATTEMPT TO NAVIGATE TO OTHER FOLDERS UNDER ANY CIRCUMSTANCES**
- All file paths must be relative to project root

---

## Header

| Field | Value |
|-------|-------|
| Request ID | REQ-E02-024 |
| Task Reference | Task 2I.6 (Sub-Epic 2I: Email Templates) |
| Source Document | docs/REQ-E02-024-update-generateregistrationreminderemail-function-overview.md |
| T-shirt Size | Small |
| Estimated Effort | 1-1.5 hours |
| Status | PENDING |

---

## Overview

This specification details the implementation for refactoring the `generateRegistrationReminderEmail()` function in `/src/lib/email-templates.ts` to use the internationalization infrastructure created in Tasks 2I.1 and 2I.2. Following the same pattern established in Tasks 2I.3-2I.5, this function will be converted from hardcoded English strings to translation-based content generation.

**Key Goals:**
- Replace ~10-12 hardcoded English strings with translation calls
- Follow Task 2I.3-2I.5 pattern for consistency (helper functions, language constant, structure)
- Maintain function signature (language parameter added in Task 2I.7)
- Use `tc()` helper for common namespace (regards, team, footer) - NOT t()
- Handle missing `step1Note` translation key
- Maintain backward compatibility

**IMPORTANT NOTE:** Unlike `generateBetaAccessApprovalEmail()` which uses `t('team')` and `t('footer')` from its own namespace, `generateRegistrationReminderEmail()` uses `tc('team')` and `tc('footer')` from the `common` namespace.

---

## Build & Test Commands

```bash
# Type check
npm run typecheck

# Run tests
npm run test

# Run full linting
npm run lint

# Build the project
npm run build
```

---

## Pre-Implementation Task: Add Missing Translation Key

**Context:** The `registrationReminder` namespace is missing the `step1Note` key that exists in other email namespaces. This key is needed for the parenthetical note after step 1.

**IMPORTANT:** This task MUST be completed BEFORE proceeding with the main implementation tasks.

### Task 0: Add `step1Note` Key to Translation Files

**Context:** The current `registrationReminder` namespace (lines 4316-4327 in `/messages/en.json`) does not include the `step1Note` key that is used in other email templates for the convenience note after step 1.
**Files to modify:** `/messages/en.json`, `/messages/fr.json`, `/messages/es.json`, `/messages/de.json`, `/messages/nl.json`, `/messages/it.json`
**Estimated effort:** 1 story point

- [x] **0.1** Open `/messages/en.json` and locate the `registrationReminder` namespace (lines 4316-4327) ---implemented: Located and added step1Note---
- [x] **0.2** Add `step1Note` key after `step1` key: `"step1Note": "(This link pre-fills your access code and email for convenience)"` ---implemented: Added to en.json---
- [x] **0.3** Open `/messages/fr.json` and add to `registrationReminder`: `"step1Note": "(Ce lien pré-remplit votre code d'accès et votre email pour votre commodité)"` ---implemented: Added to fr.json---
- [x] **0.4** Open `/messages/es.json` and add to `registrationReminder`: `"step1Note": "(Este enlace pre-completa su código de acceso y correo electrónico para su comodidad)"` ---implemented: Added to es.json---
- [x] **0.5** Open `/messages/de.json` and add to `registrationReminder`: `"step1Note": "(Dieser Link füllt Ihren Zugangscode und Ihre E-Mail zur Bequemlichkeit aus)"` ---implemented: Added to de.json---
- [x] **0.6** Open `/messages/nl.json` and add to `registrationReminder`: `"step1Note": "(Deze link vult uw toegangscode en e-mail vooraf in voor uw gemak)"` ---implemented: Added to nl.json---
- [x] **0.7** Open `/messages/it.json` and add to `registrationReminder`: `"step1Note": "(Questo link precompila il tuo codice di accesso e l'email per comodità)"` ---implemented: Added to it.json---
- [x] **0.8** Run type check to verify JSON syntax: `npm run typecheck` ---ts-check: passed (7 errors in unrelated module, baseline maintained)---

**Acceptance Criteria:**
- `step1Note` key added to all 6 translation files
- JSON syntax remains valid
- Key placement is consistent (after `step1` in each file)

---

## Implementation Tasks

### Task 1: Update JSDoc Comments

**Context:** The current JSDoc comment for `generateRegistrationReminderEmail()` is minimal and doesn't reflect the translation infrastructure being used.
**Files to modify:** `/src/lib/email-templates.ts` (lines 418-425)
**Estimated effort:** 1 story point

- [x] **1.1** Locate the JSDoc comment block for `generateRegistrationReminderEmail()` at lines 418-425 ---implemented: Located JSDoc---
- [x] **1.2** Update the description to include: "Uses translations from emails.registrationReminder namespace" ---implemented: Added---
- [x] **1.3** Add a line: "Currently generates English emails only (language parameter added in Task 2I.7)" ---implemented: Added---
- [x] **1.4** Add `@param request - Access request data` documentation ---implemented: Already present---
- [x] **1.5** Add `@param accessCode - Generated access code` documentation ---implemented: Already present---
- [x] **1.6** Add `@param daysSinceApproval - Number of days since approval` documentation ---implemented: Already present---
- [x] **1.7** Add `@param accountName - Optional account name (defaults to 'Account')` documentation ---implemented: Updated with default---
- [x] **1.8** Add `@param baseUrl - Optional base URL for links (defaults to getServerBaseUrl())` documentation ---implemented: Already present---
- [x] **1.9** Add `@returns Email template with subject and body using translations` documentation ---implemented: Added---
- [x] **1.10** Add `@see Task 2I.1 - Translation namespace structure` reference ---implemented: Added---
- [x] **1.11** Add `@see Task 2I.2 - getEmailTranslation utility` reference ---implemented: Added---
- [x] **1.12** Add `@see Task 2I.7 - Language parameter addition (future)` reference ---implemented: Added---
- [x] **1.13** Ensure JSDoc formatting is correct with proper asterisk alignment ---implemented: Verified correct---
- [x] **1.14** Run type check to verify JSDoc syntax: `npm run typecheck` ---ts-check: passed (baseline errors only)---

---

### Task 2: Add Language Constant and Translation Helper Functions

**Context:** Following the pattern established in Tasks 2I.3-2I.5, we need to add a language constant and helper functions to simplify translation calls.
**Files to modify:** `/src/lib/email-templates.ts` (inside `generateRegistrationReminderEmail()` function)
**Estimated effort:** 1 story point

- [ ] **2.1** Locate the function signature for `generateRegistrationReminderEmail()` (line 426)
- [ ] **2.2** Add a TODO comment before the closing parenthesis: `// TODO: Task 2I.7 - Add: language: SupportedLanguage = 'en'`
- [ ] **2.3** After the function opening brace, add a language constant: `const language: SupportedLanguage = 'en';`
- [ ] **2.4** Add a TODO comment: `// TODO: Task 2I.7 - Replace with parameter`
- [ ] **2.5** Add a comment: `// Helper to translate email content with registrationReminder namespace`
- [ ] **2.6** Add translation helper function for registrationReminder namespace:
  ```typescript
  const t = (key: string, vars?: Record<string, string | number>) =>
    getEmailTranslation(`registrationReminder.${key}`, language, vars);
  ```
- [ ] **2.7** Add a comment: `// Helper to translate common email content`
- [ ] **2.8** Add translation helper function for common namespace:
  ```typescript
  const tc = (key: string) =>
    getEmailTranslation(`common.${key}`, language);
  ```
- [ ] **2.9** Verify helpers are placed before existing variable declarations
- [ ] **2.10** Run type check: `npm run typecheck`

---

### Task 3: Replace Subject Line with Translation

**Context:** Convert the hardcoded subject line to use the translation utility.
**Files to modify:** `/src/lib/email-templates.ts` (line ~438)
**Estimated effort:** 1 story point

- [ ] **3.1** Locate the subject line in the return statement
- [ ] **3.2** Identify current subject: `` `Reminder: Complete Your ${accountDisplayName} Access Setup` ``
- [ ] **3.3** Replace with translation call: `subject: t('subject', { accountName: accountDisplayName }),`
- [ ] **3.4** Verify the variable name is `accountName` (not `accountDisplayName`) to match translation key
- [ ] **3.5** Ensure comma is present after the subject line
- [ ] **3.6** Run type check: `npm run typecheck`

**Acceptance Criteria:**
- Subject replaced with `t('subject', { accountName: accountDisplayName })`
- Translation key `emails.registrationReminder.subject` will be used
- Variable mapping correct: `accountName` → `accountDisplayName`

---

### Task 4: Replace Email Greeting

**Context:** Convert the greeting line to use translation.
**Files to modify:** `/src/lib/email-templates.ts` (line ~440)
**Estimated effort:** 1 story point

- [ ] **4.1** Locate the email body opening
- [ ] **4.2** Identify current greeting: `` `Hello ${requesterName},` ``
- [ ] **4.3** Replace with: `` body: `${t('greeting', { name: requesterName })}` ``
- [ ] **4.4** Ensure the greeting is on the first line of the body template literal
- [ ] **4.5** Verify newline after greeting is preserved (two blank lines before message)
- [ ] **4.6** Verify variable name is `name` (not `requesterName`) to match translation key

**Acceptance Criteria:**
- Greeting replaced with `t('greeting', { name: requesterName })`
- Formatting preserved with proper newlines

---

### Task 5: Replace Main Message

**Context:** Convert the main reminder message to use translation.
**Files to modify:** `/src/lib/email-templates.ts` (line ~442)
**Estimated effort:** 1 story point

- [ ] **5.1** Locate the main message paragraph
- [ ] **5.2** Identify current text: `` This is a friendly reminder that your access to "${accountDisplayName}" was approved ${daysSinceApproval} days ago... ``
- [ ] **5.3** Replace with: `${t('message', { accountName: accountDisplayName, days: daysSinceApproval })}`
- [ ] **5.4** Verify variable names: `accountName` and `days`
- [ ] **5.5** Ensure blank lines before and after are preserved

**Acceptance Criteria:**
- Message replaced with `t('message', { accountName: accountDisplayName, days: daysSinceApproval })`
- Two variables mapped correctly

---

### Task 6: Replace Access Code Label

**Context:** Convert the access code display line to use translation.
**Files to modify:** `/src/lib/email-templates.ts` (line ~444)
**Estimated effort:** 1 story point

- [ ] **6.1** Locate the access code label line
- [ ] **6.2** Identify current text: `` Your Access Code: ${accessCode} ``
- [ ] **6.3** Replace with: `${t('accessCodeLabel', { accessCode })}`
- [ ] **6.4** Verify variable name is `accessCode`
- [ ] **6.5** Ensure blank lines before and after are preserved

**Acceptance Criteria:**
- Access code label replaced with `t('accessCodeLabel', { accessCode })`
- Variable mapped correctly

---

### Task 7: Replace Instructions Header

**Context:** Convert the instructions header to use translation.
**Files to modify:** `/src/lib/email-templates.ts` (line ~446)
**Estimated effort:** 1 story point

- [ ] **7.1** Locate the instructions header line
- [ ] **7.2** Identify current text: `To complete your access setup:`
- [ ] **7.3** Replace with: `${t('instructions')}`
- [ ] **7.4** Verify no variables are passed (static text)
- [ ] **7.5** Ensure the line is followed by numbered steps

**Acceptance Criteria:**
- Instructions header replaced with `t('instructions')`
- No variables needed

---

### Task 8: Replace Step 1 and Step 1 Note

**Context:** Convert step 1 and its parenthetical note to use translations.
**Files to modify:** `/src/lib/email-templates.ts` (lines ~447-448)
**Estimated effort:** 1 story point

- [ ] **8.1** Locate step 1 text
- [ ] **8.2** Identify current text: `` 1. Click this direct registration link: ${directRegistrationLink} ``
- [ ] **8.3** Replace with: `1. ${t('step1', { link: directRegistrationLink })}`
- [ ] **8.4** Locate step 1 note (parenthetical text)
- [ ] **8.5** Identify current text: `(This link pre-fills your access code and email for convenience)`
- [ ] **8.6** Replace with: `   ${t('step1Note')}`
- [ ] **8.7** Verify variable name is `link` for step1
- [ ] **8.8** Verify step1Note has no variables
- [ ] **8.9** Ensure proper indentation (3 spaces for note under step)

**Acceptance Criteria:**
- Step 1 replaced with `t('step1', { link: directRegistrationLink })`
- Step 1 note replaced with `t('step1Note')`
- Proper indentation preserved

---

### Task 9: Replace Step 2

**Context:** Convert step 2 to use translation.
**Files to modify:** `/src/lib/email-templates.ts` (line ~449)
**Estimated effort:** 1 story point

- [ ] **9.1** Locate step 2 text
- [ ] **9.2** Identify current text: `2. Complete your account registration`
- [ ] **9.3** Replace with: `2. ${t('step2')}`
- [ ] **9.4** Verify no variables are passed (static text)
- [ ] **9.5** Ensure newline after step 2

**Acceptance Criteria:**
- Step 2 replaced with `t('step2')`
- No variables needed

---

### Task 10: Replace Alternative Method Line

**Context:** Convert the alternative registration method line to use translation.
**Files to modify:** `/src/lib/email-templates.ts` (line ~450)
**Estimated effort:** 1 story point

- [ ] **10.1** Locate the alternative method line
- [ ] **10.2** Identify current text: `` Alternative: Visit ${registrationLink} and enter your access code: ${accessCode} ``
- [ ] **10.3** Replace with: `${t('alternative', { registrationLink, accessCode })}`
- [ ] **10.4** Verify variable names: `registrationLink` and `accessCode`
- [ ] **10.5** Ensure blank line before this line

**Acceptance Criteria:**
- Alternative line replaced with `t('alternative', { registrationLink, accessCode })`
- Two variables mapped correctly

---

### Task 11: Replace Closing Paragraph

**Context:** Convert the closing paragraph to use translation.
**Files to modify:** `/src/lib/email-templates.ts` (line ~452)
**Estimated effort:** 1 story point

- [ ] **11.1** Locate the closing paragraph
- [ ] **11.2** Identify current text: `Your access code will remain valid, but completing your registration...`
- [ ] **11.3** Replace with: `${t('closing')}`
- [ ] **11.4** Verify no variables are passed (static text)
- [ ] **11.5** Ensure blank lines before and after are preserved

**Acceptance Criteria:**
- Closing paragraph replaced with `t('closing')`
- No variables needed

---

### Task 12: Replace Questions Line

**Context:** Convert the questions/help line to use translation.
**Files to modify:** `/src/lib/email-templates.ts` (line ~454)
**Estimated effort:** 1 story point

- [ ] **12.1** Locate the questions line
- [ ] **12.2** Identify current text: `If you no longer need access or have any questions, please let us know.`
- [ ] **12.3** Replace with: `${t('questions')}`
- [ ] **12.4** Verify no variables are passed (static text)
- [ ] **12.5** Ensure blank line after this line

**Acceptance Criteria:**
- Questions line replaced with `t('questions')`
- No variables needed

---

### Task 13: Replace Closing, Team Signature, and Footer

**Context:** Convert closing lines using common translations - IMPORTANT: use `tc()` NOT `t()`.
**Files to modify:** `/src/lib/email-templates.ts` (lines ~456-461)
**Estimated effort:** 1 story point

**CRITICAL:** Unlike `generateBetaAccessApprovalEmail()` which uses `t('team')` and `t('footer')`, this function uses `tc('team')` and `tc('footer')` from the **common** namespace.

- [ ] **13.1** Locate "Best regards," text
- [ ] **13.2** Replace with: `${tc('regards')}`
- [ ] **13.3** Locate "The FAQBNB Team" text
- [ ] **13.4** Replace with: `${tc('team')}`
- [ ] **13.5** Locate footer separator line: `---`
- [ ] **13.6** Keep separator as-is (not translated)
- [ ] **13.7** Locate footer line: `This is an automated message. Please do not reply to this email.`
- [ ] **13.8** Replace with: `${tc('footer')}`
- [ ] **13.9** Ensure blank line before closing section
- [ ] **13.10** Verify ALL calls use `tc()` helper (common namespace), NOT `t()`

**Acceptance Criteria:**
- Closing replaced with `tc('regards')`
- Team signature replaced with `tc('team')`
- Footer line replaced with `tc('footer')`
- Separator line preserved
- Blank lines preserved
- ALL use `tc()` (common namespace)

---

### Task 14: Update Variables Object

**Context:** Add `language` field to variables object for consistency with previous tasks.
**Files to modify:** `/src/lib/email-templates.ts` (lines ~463-469)
**Estimated effort:** 1 story point

- [ ] **14.1** Locate the variables object in the return statement
- [ ] **14.2** Verify the object contains all original properties:
  - `requesterName`
  - `accountName: accountDisplayName`
  - `accessCode`
  - `daysSinceApproval: daysSinceApproval.toString()`
  - `registrationLink`
  - `directRegistrationLink`
- [ ] **14.3** Add `language` property at the end: `language`
- [ ] **14.4** Ensure proper comma placement
- [ ] **14.5** Verify object syntax is correct
- [ ] **14.6** Run type check: `npm run typecheck`

**Acceptance Criteria:**
- Variables object includes all original properties
- `language` field added for debugging/logging
- Object syntax valid

---

### Task 15: Run Type Checking and Linting

**Context:** Verify the refactored function passes all quality checks.
**Files to modify:** None (verification only)
**Estimated effort:** 1 story point

- [ ] **15.1** Run TypeScript type check: `npm run typecheck`
- [ ] **15.2** Verify no TypeScript errors related to the refactored function
- [ ] **15.3** Check for any type errors in translation calls
- [ ] **15.4** Run ESLint: `npm run lint`
- [ ] **15.5** Fix any linting warnings or errors in the function
- [ ] **15.6** Verify no unused imports
- [ ] **15.7** Ensure proper code formatting (indentation, spacing)

**Acceptance Criteria:**
- `npm run typecheck` passes with no errors
- `npm run lint` passes with no warnings
- Code is properly formatted

---

### Task 16: Run Existing Test Suite

**Context:** Verify backward compatibility by running all existing tests.
**Files to modify:** None (verification only)
**Estimated effort:** 1 story point

- [ ] **16.1** Run all tests: `npm run test`
- [ ] **16.2** Verify no test failures related to email generation
- [ ] **16.3** Check for any email-related test warnings
- [ ] **16.4** If tests fail, investigate whether it's due to translation key mismatches
- [ ] **16.5** Verify no tests needed modification (backward compatibility maintained)
- [ ] **16.6** Check test output for unexpected warnings
- [ ] **16.7** Document any test failures for investigation

**Acceptance Criteria:**
- All existing tests pass without modification
- No test failures related to email reminder
- Test output clean with no warnings

---

### Task 17: Manual Testing - Standard Case

**Context:** Manually verify the function generates correct output with standard parameters.
**Files to modify:** None (testing only)
**Estimated effort:** 1 story point

- [ ] **17.1** Verify function signature is unchanged
- [ ] **17.2** Verify subject uses `t('subject', { accountName })` translation
- [ ] **17.3** Verify greeting uses `t('greeting', { name })` translation
- [ ] **17.4** Verify message uses `t('message', { accountName, days })` translation
- [ ] **17.5** Verify access code label uses `t('accessCodeLabel', { accessCode })` translation
- [ ] **17.6** Verify instructions uses `t('instructions')` translation
- [ ] **17.7** Verify step1 uses `t('step1', { link })` translation
- [ ] **17.8** Verify step1Note uses `t('step1Note')` translation
- [ ] **17.9** Verify step2 uses `t('step2')` translation
- [ ] **17.10** Verify alternative uses `t('alternative', { registrationLink, accessCode })` translation
- [ ] **17.11** Verify closing uses `t('closing')` translation
- [ ] **17.12** Verify questions uses `t('questions')` translation
- [ ] **17.13** Verify regards uses `tc('regards')` from COMMON namespace
- [ ] **17.14** Verify team uses `tc('team')` from COMMON namespace
- [ ] **17.15** Verify footer uses `tc('footer')` from COMMON namespace

**Acceptance Criteria:**
- All translation calls verified correct
- Common namespace used for regards/team/footer
- Function signature unchanged

---

### Task 18: Manual Testing - Edge Cases

**Context:** Test edge cases like missing account name, various daysSinceApproval values, etc.
**Files to modify:** None (testing only)
**Estimated effort:** 1 story point

- [ ] **18.1** Test with missing `accountName` parameter
- [ ] **18.2** Verify default value 'Account' is used in translations
- [ ] **18.3** Test with `daysSinceApproval = 1` (singular day)
- [ ] **18.4** Test with `daysSinceApproval = 0`
- [ ] **18.5** Test with `daysSinceApproval = 30` (large number)
- [ ] **18.6** Test with special characters in requester name (e.g., "José García")
- [ ] **18.7** Verify special characters are handled correctly in translations
- [ ] **18.8** Test with very long account names (50+ characters)
- [ ] **18.9** Verify formatting doesn't break with long strings
- [ ] **18.10** Test with missing requester_name in request (should default to 'there')

**Acceptance Criteria:**
- Default account name works correctly
- Various daysSinceApproval values work
- Special characters handled properly
- Long strings don't break formatting
- Missing requester name defaults correctly

---

### Task 19: Verify Translation Key Coverage

**Context:** Ensure all translation keys used in the function exist in the English translation file.
**Files to modify:** None (verification only)
**Estimated effort:** 1 story point

- [ ] **19.1** Count all translation calls in the refactored function
- [ ] **19.2** Verify 12-14 strings replaced with translation calls
- [ ] **19.3** Check for `emails.registrationReminder.subject` key
- [ ] **19.4** Check for `emails.registrationReminder.greeting` key
- [ ] **19.5** Check for `emails.registrationReminder.message` key
- [ ] **19.6** Check for `emails.registrationReminder.accessCodeLabel` key
- [ ] **19.7** Check for `emails.registrationReminder.instructions` key
- [ ] **19.8** Check for `emails.registrationReminder.step1` key
- [ ] **19.9** Check for `emails.registrationReminder.step1Note` key (added in Task 0)
- [ ] **19.10** Check for `emails.registrationReminder.step2` key
- [ ] **19.11** Check for `emails.registrationReminder.alternative` key
- [ ] **19.12** Check for `emails.registrationReminder.closing` key
- [ ] **19.13** Check for `emails.registrationReminder.questions` key
- [ ] **19.14** Check for `emails.common.regards` key
- [ ] **19.15** Check for `emails.common.team` key
- [ ] **19.16** Check for `emails.common.footer` key
- [ ] **19.17** Document any missing keys

**Acceptance Criteria:**
- All translation keys used exist in translation files
- No missing translation keys
- Documentation updated if keys are missing

---

### Task 20: Verify Pattern Consistency with Previous Tasks

**Context:** Compare implementation with previous email refactoring tasks to ensure consistency.
**Files to modify:** None (verification only)
**Estimated effort:** 1 story point

- [ ] **20.1** Compare language constant declaration with Tasks 2I.3-2I.5
- [ ] **20.2** Compare helper function names (`t` and `tc`) - verify identical
- [ ] **20.3** Compare helper function implementations - verify same pattern
- [ ] **20.4** Compare TODO comment format - verify matches
- [ ] **20.5** Compare JSDoc structure - verify consistent
- [ ] **20.6** Compare variable naming conventions - verify aligned
- [ ] **20.7** Compare common namespace usage - verify `tc()` used for regards/team/footer
- [ ] **20.8** Compare code indentation and formatting - verify matches
- [ ] **20.9** Document any inconsistencies found

**Acceptance Criteria:**
- Language constant declared same way
- Helper functions named identically
- TODO comments match format
- JSDoc structure consistent
- Variable naming aligned
- Common namespace usage correct (`tc()`)
- Code formatting matches

---

### Task 21: Build the Project

**Context:** Verify the refactored function builds successfully.
**Files to modify:** None (verification only)
**Estimated effort:** 1 story point

- [ ] **21.1** Run the build command: `npm run build`
- [ ] **21.2** Verify build completes successfully
- [ ] **21.3** Check for any build warnings related to email templates
- [ ] **21.4** Verify no errors in build output
- [ ] **21.5** If build fails, investigate and document errors
- [ ] **21.6** Ensure the refactored function is included in build output
- [ ] **21.7** Check build artifacts for any issues

**Acceptance Criteria:**
- `npm run build` completes successfully
- No build errors
- No warnings related to the refactored function
- Build output includes refactored function

---

### Task 22: Code Review and Final Validation

**Context:** Perform final quality review before marking task complete.
**Files to modify:** None (review only)
**Estimated effort:** 1 story point

- [ ] **22.1** Review all changes for code quality
- [ ] **22.2** Verify translation helper functions are clear and maintainable
- [ ] **22.3** Ensure all variable mappings are correct
- [ ] **22.4** Check that formatting (newlines, spacing) is preserved
- [ ] **22.5** Verify JSDoc comments are accurate and helpful
- [ ] **22.6** Ensure TODO comments are clear for Task 2I.7
- [ ] **22.7** Review code for consistency with Tasks 2I.3-2I.5 pattern
- [ ] **22.8** Check for any hardcoded strings that were missed
- [ ] **22.9** Verify backward compatibility is maintained (no signature changes)
- [ ] **22.10** Check that all 12-14 strings were replaced
- [ ] **22.11** Review variables object for completeness
- [ ] **22.12** Verify `tc()` is used for common namespace (NOT `t()`)
- [ ] **22.13** Document any remaining issues or concerns

**Acceptance Criteria:**
- Code passes quality review
- All hardcoded strings replaced
- Pattern matches Tasks 2I.3-2I.5
- Documentation complete and accurate
- Backward compatibility maintained
- Common namespace uses `tc()` correctly

---

## Validation Checklist

Before marking this request as complete, verify:

- [ ] `step1Note` key added to all 6 translation files (Task 0)
- [ ] All 12-14 hardcoded strings replaced with `getEmailTranslation()` calls
- [ ] Function generates identical English email output to current version
- [ ] Translation helper functions (`t` and `tc`) implemented like Tasks 2I.3-2I.5
- [ ] `tc()` used for common namespace (regards, team, footer) - NOT `t()`
- [ ] No changes to function signature (maintains backward compatibility)
- [ ] JSDoc comments updated with translation references
- [ ] Variables object includes `language` field
- [ ] TypeScript compiles without errors (`npm run typecheck`)
- [ ] ESLint passes without warnings (`npm run lint`)
- [ ] Build succeeds (`npm run build`)
- [ ] Manual testing confirms correct translation usage
- [ ] Edge cases tested (missing accountName, various daysSinceApproval, special characters)
- [ ] All translation keys exist in `messages/en.json`
- [ ] Pattern consistent with Tasks 2I.3-2I.5 implementation
- [ ] Code review completed

---

## Dependencies

### Required Completions (Blocking)
- **REQ-E02-019** (Task 2I.1): Translation namespace structure must exist
- **REQ-E02-020** (Task 2I.2): `getEmailTranslation` utility must be implemented
- **REQ-E02-021** (Task 2I.3): `generateAccessApprovalEmail` pattern established
- **REQ-E02-022** (Task 2I.4): `generateAccessDenialEmail` completed
- **REQ-E02-023** (Task 2I.5): `generateBetaAccessApprovalEmail` completed

### Blocks These Tasks
- **REQ-E02-025** (Task 2I.7): Add language parameter to email functions
- **REQ-E02-026** (Task 2I.8): Generate non-English translations

### Parallel Safety
**Files touched:** `/src/lib/email-templates.ts` (lines 418-471), `/messages/*.json`
**Conflicts with:** Tasks 2I.3-2I.5 (same file - already completed), Task 2I.7 (will modify signature)
**Recommendation:** This is the LAST email function to refactor before Task 2I.7

---

## Notes

- This task follows the exact pattern established in Tasks 2I.3-2I.5 for consistency
- The language constant `'en'` is a placeholder for Task 2I.7
- **IMPORTANT:** Unlike betaAccessApproval, this function uses `tc('team')` and `tc('footer')` (common namespace)
- The `step1Note` key must be added to translation files BEFORE implementation (Task 0)
- This is the last email function to refactor before Task 2I.7 adds the language parameter

---

## Appendix A: Translation Key Mapping Reference

### Complete Registration Reminder Email Translation Keys

| # | Current String | Translation Key | Variables | Notes |
|---|----------------|-----------------|-----------|-------|
| 1 | `Reminder: Complete Your ${accountDisplayName} Access Setup` | `registrationReminder.subject` | `{accountName}` | Subject line |
| 2 | `Hello ${requesterName},` | `registrationReminder.greeting` | `{name}` | Opening greeting |
| 3 | `This is a friendly reminder that your access...` | `registrationReminder.message` | `{accountName}`, `{days}` | Main message |
| 4 | `Your Access Code: ${accessCode}` | `registrationReminder.accessCodeLabel` | `{accessCode}` | Access code display |
| 5 | `To complete your access setup:` | `registrationReminder.instructions` | none | Instructions header |
| 6 | `Click this direct registration link: ${directRegistrationLink}` | `registrationReminder.step1` | `{link}` | Step 1 |
| 7 | `(This link pre-fills your access code and email...)` | `registrationReminder.step1Note` | none | Step 1 note - **ADDED IN TASK 0** |
| 8 | `Complete your account registration` | `registrationReminder.step2` | none | Step 2 |
| 9 | `Alternative: Visit ${registrationLink} and enter...` | `registrationReminder.alternative` | `{registrationLink}`, `{accessCode}` | Alternative method |
| 10 | `Your access code will remain valid...` | `registrationReminder.closing` | none | Closing paragraph |
| 11 | `If you no longer need access or have any questions...` | `registrationReminder.questions` | none | Questions line |
| 12 | `Best regards,` | `common.regards` | none | Closing - **uses tc()** |
| 13 | `The FAQBNB Team` | `common.team` | none | Team signature - **uses tc()** |
| 14 | `This is an automated message...` | `common.footer` | none | Footer - **uses tc()** |

**Total Keys:** 14 (11 from `registrationReminder`, 3 from `common`)
**Keys requiring addition:** 1 (`step1Note` - Task 0)

---

**Total Tasks:** 23 (including Task 0)
**Total Subtasks:** ~180
**Estimated Total Effort:** 1-1.5 hours

---

*Document created by Senior Developer Agent - Task 2I.6 Detailed Specification*
*Last Modified: 2026-01-23 03:45*
