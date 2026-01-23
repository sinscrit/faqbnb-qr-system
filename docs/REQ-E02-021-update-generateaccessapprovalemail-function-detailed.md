# Detailed Task Breakdown: Update `generateAccessApprovalEmail` Function

**Document Created:** 2026-01-23 01:15
**Last Modified:** 2026-01-23 00:30

---

## Header

| Field | Value |
|-------|-------|
| Request ID | REQ-E02-021 |
| Task Reference | Task 2I.3 (Sub-Epic 2I: Email Templates) |
| Source Document | docs/REQ-E02-021-update-generateaccessapprovalemail-function-overview.md |
| T-shirt Size | Small |
| Estimated Effort | 1.5-2 hours |
| Status | COMPLETED |

---

## Overview

This specification details the implementation for refactoring the `generateAccessApprovalEmail()` function in `/src/lib/email-templates.ts` to use the internationalization infrastructure created in Tasks 2I.1 and 2I.2. The function currently returns hardcoded English strings and will be refactored to use the `getEmailTranslation()` utility while maintaining backward compatibility.

**Key Goals:**
- Replace ~18-22 hardcoded English strings with translation calls
- Maintain function signature (language parameter added in Task 2I.7)
- Use English ('en') as default language for this task
- Preserve all existing functionality and backward compatibility

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

## Implementation Tasks

### Task 1: Add Translation Utility Imports

- [x] **1.1** Locate the imports section at the top of `/src/lib/email-templates.ts` (lines 1-2) ---implemented: Located import section at lines 1-2---
- [x] **1.2** Add import for `getEmailTranslation` function: `import { getEmailTranslation } from '@/lib/email-translations';` ---implemented: Added getEmailTranslation import---
- [x] **1.3** Add import for `SupportedLanguage` type: `import { SupportedLanguage } from '@/types';` ---implemented: Added SupportedLanguage import---
- [x] **1.4** Verify imports are placed after existing imports and before any code ---implemented: Imports added after line 2 as specified---
- [x] **1.5** Ensure no duplicate imports exist ---implemented: No duplicates present---
- [x] **1.6** Run type check to verify imports resolve correctly: `npm run typecheck` ---ts-check: passed (0 errors, baseline: 0)---

**Acceptance Criteria:**
- Imports added after line 2 in correct syntax
- No TypeScript errors related to imports
- Both `getEmailTranslation` and `SupportedLanguage` are imported correctly

---

### Task 2: Add Language Constant and Translation Helpers

- [x] **2.1** Locate the `generateAccessApprovalEmail()` function (starts at line 19) ---implemented: Located function at line 21---
- [x] **2.2** After the function signature and opening brace, add a language constant: `const language: SupportedLanguage = 'en';` ---implemented: Added language constant---
- [x] **2.3** Add a TODO comment: `// TODO: Task 2I.7 - Replace with parameter` ---implemented: Added TODO comment---
- [x] **2.4** Add a translation helper function for accessApproval namespace ---implemented: Added t() helper with correct signature---
- [x] **2.5** Add a translation helper function for common namespace ---implemented: Added tc() helper---
- [x] **2.6** Add a comment above helper functions: `// Helper to translate email content with accessApproval namespace` ---implemented: Added descriptive comments---
- [x] **2.7** Verify helpers are defined before any translation calls are made ---implemented: Helpers defined before return statement---
- [x] **2.8** Run type check to ensure no TypeScript errors: `npm run typecheck` ---ts-check: passed (0 errors, baseline: 0)---

**Acceptance Criteria:**
- Language constant defined with correct type
- Both helper functions (`t` and `tc`) defined correctly
- TODO comment added for future reference
- No type errors from helper functions

---

### Task 3: Replace Subject Line with Translation

- [ ] **3.1** Locate the subject line in the return statement (line 38)
- [x] **3.2** ---implemented: Located and replaced--- Identify current subject: `` `Access Granted: ${accountDisplayName} - Your Access Code` ``
- [x] **3.3** ---implemented: Replaced with translation call--- Replace with translation call: `subject: t('subject', { accountName: accountDisplayName }),`
- [x] **3.4** ---implemented: Variable name is accountName--- Verify the variable name is `accountName` (not `accountDisplayName`) to match translation key
- [x] **3.5** ---implemented: Template literal removed--- Remove the template literal syntax (backticks)
- [x] **3.6** ---implemented: Comma present--- Ensure comma is present after the subject line
- [x] **3.7** ---ts-check: passed (0 errors, baseline: 0)--- Run type check: `npm run typecheck`

**Acceptance Criteria:**
- Subject line replaced with `t('subject', { accountName: accountDisplayName })`
- Translation key `emails.accessApproval.subject` will be used
- Variable mapping correct: `accountName` → `accountDisplayName`

---

### Task 4: Replace Email Greeting

- [x] **4.1** Locate the email body opening in the return statement (line 39) ---implemented: Located greeting---
- [x] **4.2** Identify current greeting: `` `Hello ${requesterName},` `` ---implemented: Identified---
- [x] **4.3** Replace with: `` body: `${t('greeting', { name: requesterName })}` `` ---implemented: Replaced with translation call---
- [x] **4.4** Ensure the greeting is on the first line of the body template literal ---implemented: Greeting on first line---
- [x] **4.5** Verify newline after greeting is preserved ---implemented: Newlines preserved---
- [x] **4.6** Verify variable name is `name` (not `requesterName`) to match translation key ---implemented: Variable name correct---

**Acceptance Criteria:**
- Greeting replaced with `t('greeting', { name: requesterName })`
- Formatting preserved with proper newlines

---

### Task 5: Replace Intro Paragraph

- [x] ---implemented: Completed--- **5.1** Locate the intro paragraph (line 41)
- [x] ---implemented: Completed--- **5.2** Identify current text: `` Great news! Your access request for "${accountDisplayName}" has been approved. ``
- [x] ---implemented: Completed--- **5.3** Replace with: `${t('intro', { accountName: accountDisplayName })}`
- [x] ---implemented: Completed--- **5.4** Ensure blank lines before and after intro are preserved
- [x] ---implemented: Completed--- **5.5** Verify variable name is `accountName` to match translation key

**Acceptance Criteria:**
- Intro paragraph replaced with `t('intro', { accountName: accountDisplayName })`
- Formatting with blank lines preserved

---

### Task 6: Replace Access Details Section Header

- [x] ---implemented: Completed--- **6.1** Locate "Your Access Details:" text (line 43)
- [x] ---implemented: Completed--- **6.2** Replace with: `${t('accessDetails')}`
- [x] ---implemented: Completed--- **6.3** Ensure the line is followed by the bullet list
- [x] ---implemented: Completed--- **6.4** Verify no variables are passed (header only)
- [x] ---implemented: Completed--- **6.5** Preserve newline after header

**Acceptance Criteria:**
- Section header replaced with `t('accessDetails')`
- Translation key has no variables

---

### Task 7: Replace Access Details Bullet Items

- [x] ---implemented: Completed--- **7.1** Locate the first bullet point (line 44): `` • Account: ${accountDisplayName} ``
- [x] ---implemented: Completed--- **7.2** Replace with: `• ${t('account', { accountName: accountDisplayName })}`
- [x] ---implemented: Completed--- **7.3** Locate the second bullet point (line 45): `` • Access Code: ${accessCode} ``
- [x] ---implemented: Completed--- **7.4** Replace with: `• ${t('accessCode', { accessCode })}`
- [x] ---implemented: Completed--- **7.5** Locate the third bullet point (line 46): `` • Requested on: ${formatRequestDate(request.request_date)} ``
- [x] ---implemented: Completed--- **7.6** Replace with: `• ${t('requestedOn', { date: formatRequestDate(request.request_date) })}`
- [x] ---implemented: Completed--- **7.7** Verify bullet symbols (•) are preserved
- [x] ---implemented: Completed--- **7.8** Ensure proper spacing and newlines between bullets

**Acceptance Criteria:**
- All three bullet items replaced with translation calls
- Variables mapped correctly: `accountName`, `accessCode`, `date`
- Bullet formatting preserved

---

### Task 8: Replace Instructions Section Header

- [x] ---implemented: Completed--- **8.1** Locate "To complete your access setup:" text (line 48)
- [x] ---implemented: Completed--- **8.2** Replace with: `${t('instructions')}`
- [x] ---implemented: Completed--- **8.3** Ensure blank line before the section
- [x] ---implemented: Completed--- **8.4** Verify the line is followed by numbered list
- [x] ---implemented: Completed--- **8.5** Preserve newline after header

**Acceptance Criteria:**
- Instructions header replaced with `t('instructions')`
- Formatting preserved with proper spacing

---

### Task 9: Replace Instruction Step 1 and Note

- [x] ---implemented: Completed--- **9.1** Locate step 1 text (line 49): `` 1. Click this direct registration link: ${directRegistrationLink} ``
- [x] ---implemented: Completed--- **9.2** Replace with: `1. ${t('step1', { link: directRegistrationLink })}`
- [x] ---implemented: Completed--- **9.3** Locate step 1 note (line 50): `   (This link pre-fills your access code and email for convenience)`
- [x] ---implemented: Completed--- **9.4** Replace with: `   ${t('step1Note')}`
- [x] ---implemented: Completed--- **9.5** Verify indentation (3 spaces) is preserved for the note
- [x] ---implemented: Completed--- **9.6** Ensure variable name is `link` (not `directRegistrationLink`)

**Acceptance Criteria:**
- Step 1 replaced with `t('step1', { link: directRegistrationLink })`
- Step 1 note replaced with `t('step1Note')`
- Indentation and numbering preserved

---

### Task 10: Replace Instruction Steps 2 and 3

- [x] ---implemented: Completed--- **10.1** Locate step 2 text (line 51): `2. Complete your account registration`
- [x] ---implemented: Completed--- **10.2** Replace with: `2. ${t('step2')}`
- [x] ---implemented: Completed--- **10.3** Locate step 3 text (line 52): `3. Start exploring the items and resources`
- [x] ---implemented: Completed--- **10.4** Replace with: `3. ${t('step3')}`
- [x] ---implemented: Completed--- **10.5** Verify no variables are passed (static text)
- [x] ---implemented: Completed--- **10.6** Ensure numbering (2. and 3.) is preserved

**Acceptance Criteria:**
- Step 2 replaced with `t('step2')`
- Step 3 replaced with `t('step3')`
- Numbering format preserved

---

### Task 11: Replace Repeated Access Code and Link Lines

- [x] ---implemented: Completed--- **11.1** Locate repeated access code line (line 54): `` Your access code: ${accessCode} ``
- [x] ---implemented: Completed--- **11.2** Replace with: `${t('accessCodeLabel', { accessCode })}`
- [x] ---implemented: Completed--- **11.3** Locate repeated registration link line (line 55): `` Direct registration link: ${directRegistrationLink} ``
- [x] ---implemented: Completed--- **11.4** Replace with: `${t('directLinkLabel', { link: directRegistrationLink })}`
- [x] ---implemented: Completed--- **11.5** Ensure blank line before these lines is preserved
- [x] ---implemented: Completed--- **11.6** Verify variable names: `accessCode` and `link`

**Acceptance Criteria:**
- Access code line replaced with `t('accessCodeLabel', { accessCode })`
- Link line replaced with `t('directLinkLabel', { link: directRegistrationLink })`
- Variables mapped correctly

---

### Task 12: Replace Important Notes Section Header

- [x] ---implemented: Completed--- **12.1** Locate "Important Notes:" text (line 57)
- [x] ---implemented: Completed--- **12.2** Replace with: `${t('notes')}`
- [x] ---implemented: Completed--- **12.3** Ensure blank line before the section
- [x] ---implemented: Completed--- **12.4** Verify the line is followed by bullet list
- [x] ---implemented: Completed--- **12.5** Preserve newline after header

**Acceptance Criteria:**
- Notes header replaced with `t('notes')`
- Formatting preserved

---

### Task 13: Replace Important Notes Bullet Items

- [x] ---implemented: Completed--- **13.1** Locate note 1 (line 58): `- Keep your access code secure and don't share it with others`
- [x] ---implemented: Completed--- **13.2** Replace with: `- ${t('note1')}`
- [x] ---implemented: Completed--- **13.3** Locate note 2 (line 59): `- Your access code will remain valid until you complete registration`
- [x] ---implemented: Completed--- **13.4** Replace with: `- ${t('note2')}`
- [x] ---implemented: Completed--- **13.5** Locate note 3 (line 60): `- If you have any questions, please contact the account owner`
- [x] ---implemented: Completed--- **13.6** Replace with: `- ${t('note3')}`
- [x] ---implemented: Completed--- **13.7** Verify bullet symbols (-) are preserved
- [x] ---implemented: Completed--- **13.8** Ensure no variables are passed (static text)

**Acceptance Criteria:**
- All three note items replaced with translation calls
- No variables needed
- Bullet formatting preserved

---

### Task 14: Replace Closing, Team Signature, and Footer

- [x] ---implemented: Completed--- **14.1** Locate "Best regards," text (line 62)
- [x] ---implemented: Completed--- **14.2** Replace with: `${tc('regards')}`
- [x] ---implemented: Completed--- **14.3** Locate "The FAQBNB Team" text (line 63)
- [x] ---implemented: Completed--- **14.4** Replace with: `${tc('team')}`
- [x] ---implemented: Completed--- **14.5** Locate footer separator line (line 65): `---`
- [x] ---implemented: Completed--- **14.6** Keep separator as-is (not translated)
- [x] ---implemented: Completed--- **14.7** Locate first footer line (line 66): `This is an automated message. Please do not reply to this email.`
- [x] ---implemented: Completed--- **14.8** Replace with: `${tc('footer')}`
- [x] ---implemented: Completed--- **14.9** Locate second footer line (line 67): `If you need assistance, please contact support through the FAQBNB platform.`
- [x] ---implemented: Completed--- **14.10** Replace with: `${tc('footerSupport')}`
- [x] ---implemented: Completed--- **14.11** Ensure blank line before closing section
- [x] ---implemented: Completed--- **14.12** Verify all calls use `tc()` helper (common namespace)

**Acceptance Criteria:**
- Closing replaced with `tc('regards')`
- Team signature replaced with `tc('team')`
- Footer lines replaced with `tc('footer')` and `tc('footerSupport')`
- Separator line preserved
- Blank lines preserved

---

### Task 15: Update JSDoc Comments

- [x] ---implemented: Completed--- **15.1** Locate the JSDoc comment block for `generateAccessApprovalEmail()` (lines 12-18)
- [x] ---implemented: Completed--- **15.2** Add a new line after the existing description: `Uses translations from emails.accessApproval namespace`
- [x] ---implemented: Completed--- **15.3** Add a new line: `Currently generates English emails only (language parameter added in Task 2I.7)`
- [x] ---implemented: Completed--- **15.4** Update the `@param accountName` description to include: `(defaults to 'Account')`
- [x] ---implemented: Completed--- **15.5** Add a new line for returns: `@returns Email template with subject and body using translations`
- [x] ---implemented: Completed--- **15.6** Add see references:
  ```
  @see Task 2I.1 - Translation namespace structure
  @see Task 2I.2 - getEmailTranslation utility
  @see Task 2I.7 - Language parameter addition (future)
  ```
- [x] ---implemented: Completed--- **15.7** Ensure proper JSDoc syntax with asterisks aligned
- [x] ---implemented: Completed--- **15.8** Verify all parameter descriptions are accurate

**Acceptance Criteria:**
- JSDoc updated with translation information
- All @see references added
- Proper JSDoc formatting maintained

---

### Task 16: Add TODO Comment for Function Signature

- [x] ---implemented: Completed--- **16.1** Locate the function signature closing parenthesis (line 23)
- [x] ---implemented: Completed--- **16.2** Add a comment on the line before the closing parenthesis: `// TODO: Task 2I.7 - Add: language: SupportedLanguage = 'en'`
- [x] ---implemented: Completed--- **16.3** Ensure comment is indented properly
- [x] ---implemented: Completed--- **16.4** Verify comment clearly indicates future change

**Acceptance Criteria:**
- TODO comment added in correct location
- Comment clearly references Task 2I.7

---

### Task 17: Verify Variables Object Unchanged

- [x] ---implemented: Completed--- **17.1** Locate the variables object in the return statement (lines 68-76)
- [x] ---implemented: Completed--- **17.2** Verify the object contains all original properties:
  - `requesterName`
  - `accountName: accountDisplayName`
  - `accessCode`
  - `requestDate: formatRequestDate(request.request_date)`
  - `registrationLink`
  - `directRegistrationLink`
- [x] ---implemented: Completed--- **17.3** Ensure no properties are removed
- [x] ---implemented: Completed--- **17.4** Optionally add `language` property for debugging: `language`
- [x] ---implemented: Completed--- **17.5** Verify object syntax is correct

**Acceptance Criteria:**
- Variables object preserved for backward compatibility
- All original properties present
- Object syntax valid

---

### Task 18: Verify Beta Request Routing Preserved

- [x] ---implemented: Completed--- **18.1** Locate the beta request check (lines 26-30)
- [x] ---implemented: Completed--- **18.2** Verify the condition remains unchanged: `if (isBetaRequest)`
- [x] ---implemented: Completed--- **18.3** Ensure the call to `generateBetaAccessApprovalEmail()` is unchanged
- [x] ---implemented: Completed--- **18.4** Verify the function returns early for beta requests
- [x] ---implemented: Completed--- **18.5** Add comment if needed: `// Handle beta requests differently (unchanged)`

**Acceptance Criteria:**
- Beta request routing logic unchanged
- Early return preserved
- Routing to beta email function works correctly

---

### Task 19: Run Type Checking and Linting

- [x] ---implemented: Completed--- **19.1** Run TypeScript type check: `npm run typecheck`
- [x] ---implemented: Completed--- **19.2** Verify no TypeScript errors related to the refactored function
- [x] ---implemented: Completed--- **19.3** Run ESLint: `npm run lint`
- [x] ---implemented: Completed--- **19.4** Fix any linting warnings or errors
- [x] ---implemented: Completed--- **19.5** Verify no unused imports
- [x] ---implemented: Completed--- **19.6** Ensure proper formatting (use Prettier if configured)

**Acceptance Criteria:**
- `npm run typecheck` passes with no errors
- `npm run lint` passes with no warnings
- Code is properly formatted

---

### Task 20: Run Existing Test Suite

- [x] ---implemented: Completed--- **20.1** Run all tests: `npm run test`
- [x] ---implemented: Completed--- **20.2** Verify `/src/__tests__/beta-access-requests.test.ts` passes
- [x] ---implemented: Completed--- **20.3** Verify `/src/__tests__/back-office.test.ts` passes
- [x] ---implemented: Completed--- **20.4** Check for any email-related test failures
- [x] ---implemented: Completed--- **20.5** If tests fail, investigate whether it's due to translation key mismatches
- [x] ---implemented: Completed--- **20.6** Verify no tests needed modification (backward compatibility)
- [x] ---implemented: Completed--- **20.7** Check test output for any unexpected warnings

**Acceptance Criteria:**
- All existing tests pass without modification
- No test failures related to email generation
- Test output clean with no warnings

---

### Task 21: Manual Testing and Verification

- [x] ---implemented: Completed--- **21.1** Create a test script or use existing code to generate a sample access approval email
- [x] ---implemented: Completed--- **21.2** Call `generateAccessApprovalEmail()` with sample data
- [x] ---implemented: Completed--- **21.3** Inspect the returned email subject
- [x] ---implemented: Completed--- **21.4** Verify subject matches expected format
- [x] ---implemented: Completed--- **21.5** Inspect the returned email body
- [x] ---implemented: Completed--- **21.6** Verify all sections are present: greeting, intro, details, instructions, notes, closing
- [x] ---implemented: Completed--- **21.7** Verify all variables are interpolated correctly
- [x] ---implemented: Completed--- **21.8** Check formatting: newlines, spacing, bullets, numbering
- [x] ---implemented: Completed--- **21.9** Compare output with a sample email from current implementation
- [x] ---implemented: Completed--- **21.10** Verify output is identical to current English version

**Acceptance Criteria:**
- Generated email subject is correct
- Generated email body contains all expected sections
- Variables interpolated correctly (no `{placeholder}` visible)
- Formatting matches current implementation
- Output identical to current English version

---

### Task 22: Test with Edge Cases

- [x] ---implemented: Completed--- **22.1** Test with missing `accountName` parameter (should default to 'Account')
- [x] ---implemented: Completed--- **22.2** Verify subject and body use default value correctly
- [x] ---implemented: Completed--- **22.3** Test with beta request (should route to `generateBetaAccessApprovalEmail`)
- [x] ---implemented: Completed--- **22.4** Verify beta emails are not affected by changes
- [x] ---implemented: Completed--- **22.5** Test with special characters in requester name
- [x] ---implemented: Completed--- **22.6** Verify special characters are handled correctly in translations
- [x] ---implemented: Completed--- **22.7** Test with very long account names
- [x] ---implemented: Completed--- **22.8** Verify formatting doesn't break with long strings

**Acceptance Criteria:**
- Default account name works correctly
- Beta request routing works
- Special characters handled properly
- Long strings don't break formatting

---

### Task 23: Verify Translation Key Coverage

- [x] ---implemented: Completed--- **23.1** Count all translation calls in the refactored function
- [x] ---implemented: Completed--- **23.2** Verify at least 18-22 strings replaced with translation calls
- [x] ---implemented: Completed--- **23.3** Cross-reference with translation files to ensure all keys exist
- [x] ---implemented: Completed--- **23.4** Check `messages/en.json` for `emails.accessApproval.*` keys
- [x] ---implemented: Completed--- **23.5** Verify the following keys exist:
  - `subject`, `greeting`, `intro`
  - `accessDetails`, `account`, `accessCode`, `requestedOn`
  - `instructions`, `step1`, `step1Note`, `step2`, `step3`
  - `accessCodeLabel`, `directLinkLabel`
  - `notes`, `note1`, `note2`, `note3`
- [x] ---implemented: Completed--- **23.6** Check `messages/en.json` for `emails.common.*` keys
- [x] ---implemented: Completed--- **23.7** Verify the following keys exist:
  - `regards`, `team`, `footer`, `footerSupport`
- [x] ---implemented: Completed--- **23.8** If any keys are missing, document them for Task 2I.1 updates

**Acceptance Criteria:**
- All translation keys used in function exist in English translation file
- No missing translation keys
- Documentation updated if new keys discovered

---

### Task 24: Build the Project

- [x] ---implemented: Completed--- **24.1** Run the build command: `npm run build`
- [x] ---implemented: Completed--- **24.2** Verify build completes successfully
- [x] ---implemented: Completed--- **24.3** Check for any build warnings
- [x] ---implemented: Completed--- **24.4** Verify no errors in build output
- [x] ---implemented: Completed--- **24.5** If build fails, investigate and fix errors
- [x] ---implemented: Completed--- **24.6** Ensure the refactored function is included in build output

**Acceptance Criteria:**
- `npm run build` completes successfully
- No build errors
- Build output includes refactored function

---

### Task 25: Code Review and Documentation

- [x] ---implemented: Completed--- **25.1** Review all changes for code quality
- [x] ---implemented: Completed--- **25.2** Verify translation helper functions are clear and maintainable
- [x] ---implemented: Completed--- **25.3** Ensure all variable mappings are correct
- [x] ---implemented: Completed--- **25.4** Check that formatting (newlines, spacing) is preserved
- [x] ---implemented: Completed--- **25.5** Verify JSDoc comments are accurate and helpful
- [x] ---implemented: Completed--- **25.6** Ensure TODO comments are clear for Task 2I.7
- [x] ---implemented: Completed--- **25.7** Review code for consistency with existing patterns
- [x] ---implemented: Completed--- **25.8** Check for any hardcoded strings that were missed
- [x] ---implemented: Completed--- **25.9** Verify backward compatibility is maintained
- [x] ---implemented: Completed--- **25.10** Document any new translation keys discovered during implementation

**Acceptance Criteria:**
- Code passes quality review
- All hardcoded strings replaced
- Documentation complete and accurate
- Backward compatibility maintained
- Any new keys documented for Task 2I.8

---

## Validation Checklist

Before marking this request as complete, verify:

- [x] All 18-22 hardcoded strings replaced with `getEmailTranslation()` calls
- [x] Function generates identical English email output to current version
- [x] Translation helper functions (`t` and `tc`) implemented correctly
- [x] All existing test suites pass without modification
- [x] No changes to function signature (maintains backward compatibility)
- [x] JSDoc comments updated with translation references
- [x] Beta request routing preserved and functional
- [x] Variables object maintained for backward compatibility
- [x] TypeScript compiles without errors (`npm run typecheck`)
- [x] ESLint passes without warnings (`npm run lint`)
- [x] Build succeeds (`npm run build`)
- [x] Manual testing confirms identical output
- [x] Edge cases tested (missing accountName, beta requests)
- [x] All translation keys exist in `messages/en.json`
- [x] Code review completed
- [x] TODO comments added for Task 2I.7

---

## Dependencies

### Required Completions (Blocking)
- **REQ-E02-019** (Task 2I.1): Translation namespace structure must exist
- **REQ-E02-020** (Task 2I.2): `getEmailTranslation` utility must be implemented

### Blocks These Tasks
- **REQ-E02-025** (Task 2I.7): Add language parameter to email functions
- **REQ-E02-026** (Task 2I.8): Generate non-English translations

---

## Notes

- This task intentionally does NOT add the language parameter to the function signature (that's Task 2I.7)
- The language constant `'en'` is used as a placeholder for easy conversion later
- Some translation keys may need to be added to Task 2I.1 structure if not already present:
  - `accessApproval.step1Note`
  - `accessApproval.accessCodeLabel`
  - `accessApproval.directLinkLabel`
  - `common.footerSupport`
- If translation keys are missing, they will fall back to English or return the key itself
- Manual testing should verify output is IDENTICAL to current implementation

---

**Total Tasks:** 25
**Total Subtasks:** ~250
**Estimated Total Effort:** 1.5-2 hours

---

*Document created by Tech Lead Agent - Task 2I.3 Detailed Specification*
*Last Modified: 2026-01-23 01:15*
