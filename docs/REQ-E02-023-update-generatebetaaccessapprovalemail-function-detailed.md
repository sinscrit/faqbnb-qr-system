# Detailed Task Breakdown: Update `generateBetaAccessApprovalEmail` Function

**Document Created:** 2026-01-23 01:20
**Last Modified:** 2026-01-23 02:15

**Reference Documents:**
- Overview: docs/REQ-E02-023-update-generatebetaaccessapprovalemail-function-overview.md
- Implementation Plan: docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md
- Requirements: docs/gen_requests.md (Request #23)

**CRITICAL INSTRUCTIONS FOR IMPLEMENTING AGENT:**
- Operate from the project root folder ONLY
- **DO NOT ATTEMPT TO NAVIGATE TO OTHER FOLDERS UNDER ANY CIRCUMSTANCES**
- All file paths must be relative to project root

---

## Header

| Field | Value |
|-------|-------|
| Request ID | REQ-E02-023 |
| Task Reference | Task 2I.5 (Sub-Epic 2I: Email Templates) |
| Source Document | docs/REQ-E02-023-update-generatebetaaccessapprovalemail-function-overview.md |
| T-shirt Size | Medium |
| Estimated Effort | 2-2.5 hours |
| Status | COMPLETED |

---

## Overview

This specification details the implementation for refactoring the `generateBetaAccessApprovalEmail()` function in `/src/lib/email-templates.ts` to use the internationalization infrastructure created in Tasks 2I.1 and 2I.2. This is the most complex email template in the system, containing approximately 30+ hardcoded strings including emoji-prefixed feature highlights, multi-section content, and a distinctive beta-themed closing.

**Key Goals:**
- Replace ~30-35 hardcoded English strings with translation calls
- Follow established pattern from Tasks 2I.3 and 2I.4 for consistency
- Preserve emoji branding (🚀, 🎉, ✨, 📱, 📊, 🛠️, 💌) in translation keys
- Use `betaAccess` namespace for beta-specific team and footer (not `common`)
- Maintain function signature (language parameter added in Task 2I.7)
- Maintain backward compatibility

---

## Build & Test Commands

| Action | Command |
|--------|---------|
| Type Check | `npm run typecheck` |
| Unit Tests | `npm run test` |
| Build | `npm run build` |
| Lint | `npm run lint` |

---

## Implementation Tasks

### Task 1: Update JSDoc Comments

**Context:** The current JSDoc comment needs to reflect the translation infrastructure being used, following the pattern from Tasks 2I.3 and 2I.4.
**Files to modify:** `/src/lib/email-templates.ts` (lines 103-110)
**Estimated effort:** 1 story point

- [x] **1.1** Locate the JSDoc comment block for `generateBetaAccessApprovalEmail()` at lines 103-110
- [x] **1.2** Keep existing description: "Generate beta access approval email template"
- [x] **1.3** Keep existing line: "For users who signed up through the beta waitlist"
- [x] **1.4** Add new line: "Uses translations from emails.betaAccess namespace"
- [x] **1.5** Add new line: "Currently generates English emails only (language parameter added in Task 2I.7)"
- [x] **1.6** Add `@param request - Access request data` documentation
- [x] **1.7** Add `@param accessCode - Generated access code` documentation
- [x] **1.8** Add `@param accountName - Optional account name (defaults to 'the FAQBNB platform')` documentation
- [x] **1.9** Add `@param baseUrl - Optional base URL for links (defaults to getServerBaseUrl())` documentation
- [x] **1.10** Add `@returns Email template with subject and body using translations` documentation
- [x] **1.11** Add `@see Task 2I.1 - Translation namespace structure` reference
- [x] **1.12** Add `@see Task 2I.2 - getEmailTranslation utility` reference
- [x] **1.13** Add `@see Task 2I.3 - Pattern established for email translation` reference
- [x] **1.14** Add `@see Task 2I.7 - Language parameter addition (future)` reference
- [x] **1.15** Ensure JSDoc formatting is correct with proper asterisk alignment
- [x] **1.16** Run type check to verify JSDoc syntax: `npm run typecheck`

---

### Task 2: Add Language Constant and Translation Helper Functions

**Context:** Following the pattern established in Tasks 2I.3 and 2I.4, add a language constant and helper functions. Note: This function uses `betaAccess` namespace for team/footer instead of `common`.
**Files to modify:** `/src/lib/email-templates.ts` (inside `generateBetaAccessApprovalEmail()` function)
**Estimated effort:** 1 story point

- [x] **2.1** Locate the function signature for `generateBetaAccessApprovalEmail()` (around line 111)
- [x] **2.2** Add a TODO comment before the closing parenthesis: `// TODO: Task 2I.7 - Add: language: SupportedLanguage = 'en'`
- [x] **2.3** After variable initialization (after `const directRegistrationLink = ...`), add a blank line
- [x] **2.4** Add comment: `// Language constant (defaults to English)`
- [x] **2.5** Add language constant: `const language: SupportedLanguage = 'en';`
- [x] **2.6** Add TODO comment: `// TODO: Task 2I.7 - Replace with parameter`
- [x] **2.7** Add blank line
- [x] **2.8** Add comment: `// Helper to translate email content with betaAccess namespace`
- [x] **2.9** Add translation helper function for betaAccess namespace:
  ```typescript
  const t = (key: string, vars?: Record<string, string | number>) =>
    getEmailTranslation(`betaAccess.${key}`, language, vars);
  ```
- [x] **2.10** Add blank line
- [x] **2.11** Add comment: `// Helper to translate common email content (only for regards)`
- [x] **2.12** Add translation helper function for common namespace:
  ```typescript
  const tc = (key: string) =>
    getEmailTranslation(`common.${key}`, language);
  ```
- [x] **2.13** Verify helpers are placed before the return statement
- [x] **2.14** Run type check: `npm run typecheck`

---

### Task 3: Replace Subject Line with Translation

**Context:** Convert the hardcoded subject line (with 🚀 emoji) to use translation.
**Files to modify:** `/src/lib/email-templates.ts` (around line 123)
**Estimated effort:** 1 story point

- [x] **3.1** Locate the subject line in the return statement
- [x] **3.2** Identify current subject: `` `🚀 Welcome to FAQBNB Beta - Access Granted!` ``
- [x] **3.3** Replace with translation call: `subject: t('subject'),`
- [x] **3.4** Verify no variables are passed (emoji is part of translation string)
- [x] **3.5** Ensure comma is present after the subject line
- [x] **3.6** Run type check: `npm run typecheck`

**Acceptance Criteria:**
- Subject replaced with `t('subject')`
- Translation key `emails.betaAccess.subject` will be used (includes 🚀 emoji)
- No variables needed

---

### Task 4: Replace Greeting

**Context:** Convert the greeting line to use translation.
**Files to modify:** `/src/lib/email-templates.ts` (around line 124)
**Estimated effort:** 1 story point

- [x] **4.1** Locate the email body opening
- [x] **4.2** Identify current greeting: `` `Hello ${requesterName},` ``
- [x] **4.3** Replace with: `` body: `${t('greeting', { name: requesterName })}` ``
- [x] **4.4** Ensure the greeting is on the first line of the body template literal
- [x] **4.5** Verify two blank lines after greeting (before congratulations)
- [x] **4.6** Verify variable name is `name` (not `requesterName`) to match translation key

**Acceptance Criteria:**
- Greeting replaced with `t('greeting', { name: requesterName })`
- Formatting preserved with proper newlines

---

### Task 5: Replace Congratulations Message

**Context:** Convert the congratulations message (with 🎉 emoji) to use translation.
**Files to modify:** `/src/lib/email-templates.ts` (around line 126)
**Estimated effort:** 1 story point

- [x] **5.1** Locate the congratulations paragraph
- [x] **5.2** Identify current text: `🎉 Congratulations! Your beta waitlist request has been approved, and you now have exclusive early access to FAQBNB!`
- [x] **5.3** Replace with: `${t('congratulations')}`
- [x] **5.4** Ensure blank lines before and after are preserved
- [x] **5.5** Verify no variables are passed (emoji is part of translation string)

**Acceptance Criteria:**
- Congratulations replaced with `t('congratulations')`
- Translation includes 🎉 emoji

---

### Task 6: Replace Beta Access Details Section Header

**Context:** Convert the "Your Beta Access Details:" header to use translation.
**Files to modify:** `/src/lib/email-templates.ts` (around line 128)
**Estimated effort:** 1 story point

- [x] **6.1** Locate "Your Beta Access Details:" text
- [x] **6.2** Replace with: `${t('accessDetails')}`
- [x] **6.3** Ensure the line is followed by the bullet list
- [x] **6.4** Verify no variables are passed (header only)
- [x] **6.5** Preserve newline after header

**Acceptance Criteria:**
- Section header replaced with `t('accessDetails')`

---

### Task 7: Replace Beta Access Details Bullet Items

**Context:** Convert the four detail lines (platform, access code, granted date, request date) to use translation.
**Files to modify:** `/src/lib/email-templates.ts` (lines 129-132)
**Estimated effort:** 1 story point

- [x] **7.1** Locate the first bullet point: `` • Platform: ${accountDisplayName} ``
- [x] **7.2** Replace with: `• ${t('platform', { accountName: accountDisplayName })}`
- [x] **7.3** Locate the second bullet point: `` • Access Code: ${accessCode} ``
- [x] **7.4** Replace with: `• ${t('accessCode', { accessCode })}`
- [x] **7.5** Locate the third bullet point: `` • Beta Access Granted: ${new Date().toLocaleDateString()} ``
- [x] **7.6** Replace with: `• ${t('betaAccessGranted', { approvalDate: new Date().toLocaleDateString() })}`
- [x] **7.7** Locate the fourth bullet point: `` • Original Request: ${formatRequestDate(request.request_date)} ``
- [x] **7.8** Replace with: `• ${t('originalRequest', { requestDate: formatRequestDate(request.request_date) })}`
- [x] **7.9** Verify bullet symbols (•) are preserved
- [x] **7.10** Ensure proper spacing and newlines between bullets
- [x] **7.11** Verify variable names: `accountName`, `accessCode`, `approvalDate`, `requestDate`

**Acceptance Criteria:**
- All four bullet items replaced with translation calls
- Variables mapped correctly
- Bullet formatting preserved

---

### Task 8: Replace Getting Started Section Header

**Context:** Convert the "Getting Started with Your Beta Access:" header to use translation.
**Files to modify:** `/src/lib/email-templates.ts` (around line 134)
**Estimated effort:** 1 story point

- [x] **8.1** Locate "Getting Started with Your Beta Access:" text
- [x] **8.2** Replace with: `${t('gettingStarted')}`
- [x] **8.3** Ensure blank line before the section
- [x] **8.4** Verify the line is followed by numbered list
- [x] **8.5** Preserve newline after header

**Acceptance Criteria:**
- Instructions header replaced with `t('gettingStarted')`

---

### Task 9: Replace Getting Started Step 1 and Note

**Context:** Convert step 1 (with link variable) and its note to use translation.
**Files to modify:** `/src/lib/email-templates.ts` (lines 135-136)
**Estimated effort:** 1 story point

- [x] **9.1** Locate step 1 text: `` 1. Click this direct registration link: ${directRegistrationLink} ``
- [x] **9.2** Replace with: `1. ${t('step1', { link: directRegistrationLink })}`
- [x] **9.3** Locate step 1 note: `   (This link pre-fills your access code and email for convenience)`
- [x] **9.4** Replace with: `   ${t('step1Note')}`
- [x] **9.5** Verify indentation (3 spaces) is preserved for the note
- [x] **9.6** Ensure variable name is `link` (not `directRegistrationLink`)

**Acceptance Criteria:**
- Step 1 replaced with `t('step1', { link: directRegistrationLink })`
- Step 1 note replaced with `t('step1Note')`
- Indentation preserved

---

### Task 10: Replace Getting Started Steps 2 and 3

**Context:** Convert steps 2 and 3 (static text) to use translation.
**Files to modify:** `/src/lib/email-templates.ts` (lines 137-138)
**Estimated effort:** 1 story point

- [x] **10.1** Locate step 2 text: `2. Complete your account registration`
- [x] **10.2** Replace with: `2. ${t('step2')}`
- [x] **10.3** Locate step 3 text: `3. Start exploring the platform features and capabilities`
- [x] **10.4** Replace with: `3. ${t('step3')}`
- [x] **10.5** Verify no variables are passed (static text)
- [x] **10.6** Ensure numbering (2. and 3.) is preserved

**Acceptance Criteria:**
- Step 2 replaced with `t('step2')`
- Step 3 replaced with `t('step3')`

---

### Task 11: Replace Repeated Access Code and Link Lines

**Context:** Convert the repeated access code and link display lines.
**Files to modify:** `/src/lib/email-templates.ts` (lines 140-141)
**Estimated effort:** 1 story point

- [x] **11.1** Locate repeated access code line: `` Your beta access code: ${accessCode} ``
- [x] **11.2** Replace with: `${t('accessCodeLabel', { accessCode })}`
- [x] **11.3** Locate repeated registration link line: `` Direct registration link: ${directRegistrationLink} ``
- [x] **11.4** Replace with: `${t('directLinkLabel', { link: directRegistrationLink })}`
- [x] **11.5** Ensure blank line before these lines is preserved
- [x] **11.6** Verify variable names: `accessCode` and `link`

**Acceptance Criteria:**
- Access code line replaced with `t('accessCodeLabel', { accessCode })`
- Link line replaced with `t('directLinkLabel', { link: directRegistrationLink })`

---

### Task 12: Replace What to Expect Section Header

**Context:** Convert the "What to Expect:" header to use translation.
**Files to modify:** `/src/lib/email-templates.ts` (around line 143)
**Estimated effort:** 1 story point

- [x] **12.1** Locate "What to Expect:" text
- [x] **12.2** Replace with: `${t('whatToExpect')}`
- [x] **12.3** Ensure blank line before the section
- [x] **12.4** Verify the line is followed by feature list
- [x] **12.5** Preserve newline after header

**Acceptance Criteria:**
- Section header replaced with `t('whatToExpect')`

---

### Task 13: Replace What to Expect Feature Items

**Context:** Convert the 5 emoji-prefixed feature items to use translation. Emojis are included in translation strings.
**Files to modify:** `/src/lib/email-templates.ts` (lines 144-148)
**Estimated effort:** 1 story point

- [x] **13.1** Locate feature 1: `✨ Early access to all FAQBNB features`
- [x] **13.2** Replace with: `${t('feature1')}`
- [x] **13.3** Locate feature 2: `📱 QR code generation and management tools`
- [x] **13.4** Replace with: `${t('feature2')}`
- [x] **13.5** Locate feature 3: `📊 Analytics and insights dashboard`
- [x] **13.6** Replace with: `${t('feature3')}`
- [x] **13.7** Locate feature 4: `🛠️ Priority support during the beta period`
- [x] **13.8** Replace with: `${t('feature4')}`
- [x] **13.9** Locate feature 5: `💌 Direct feedback channel to influence product development`
- [x] **13.10** Replace with: `${t('feature5')}`
- [x] **13.11** Verify no variables are passed (emojis are part of translation strings)
- [x] **13.12** Ensure proper newlines between feature items

**Acceptance Criteria:**
- All 5 feature items replaced with translation calls
- Emojis preserved in translation strings (✨, 📱, 📊, 🛠️, 💌)
- No variables needed

---

### Task 14: Replace Important Beta Notes Section Header

**Context:** Convert the "Important Beta Program Notes:" header to use translation.
**Files to modify:** `/src/lib/email-templates.ts` (around line 150)
**Estimated effort:** 1 story point

- [x] **14.1** Locate "Important Beta Program Notes:" text
- [x] **14.2** Replace with: `${t('betaNotes')}`
- [x] **14.3** Ensure blank line before the section
- [x] **14.4** Verify the line is followed by bullet list
- [x] **14.5** Preserve newline after header

**Acceptance Criteria:**
- Section header replaced with `t('betaNotes')`

---

### Task 15: Replace Important Beta Notes Bullet Items

**Context:** Convert the 5 note items to use translation.
**Files to modify:** `/src/lib/email-templates.ts` (lines 151-155)
**Estimated effort:** 1 story point

- [x] **15.1** Locate note 1: `- Your access code provides full platform access during the beta period`
- [x] **15.2** Replace with: `- ${t('note1')}`
- [x] **15.3** Locate note 2: `- As a beta user, your feedback is invaluable to us`
- [x] **15.4** Replace with: `- ${t('note2')}`
- [x] **15.5** Locate note 3: `- Some features may be evolving - please share your experience!`
- [x] **15.6** Replace with: `- ${t('note3')}`
- [x] **15.7** Locate note 4: `- Keep your access code secure and don't share it with others`
- [x] **15.8** Replace with: `- ${t('note4')}`
- [x] **15.9** Locate note 5: `- Beta users will receive priority updates on new features`
- [x] **15.10** Replace with: `- ${t('note5')}`
- [x] **15.11** Verify bullet symbols (-) are preserved
- [x] **15.12** Ensure no variables are passed (static text)

**Acceptance Criteria:**
- All 5 note items replaced with translation calls
- Bullet formatting preserved

---

### Task 16: Replace Excited Closing Message

**Context:** Convert the excited community message to use translation.
**Files to modify:** `/src/lib/email-templates.ts` (around line 157)
**Estimated effort:** 1 story point

- [x] **16.1** Locate the excited message: `We're excited to have you as part of our exclusive beta community!`
- [x] **16.2** Replace with: `${t('excited')}`
- [x] **16.3** Ensure blank line before this message
- [x] **16.4** Verify no variables are passed (static text)

**Acceptance Criteria:**
- Excited closing message replaced with `t('excited')`

---

### Task 17: Replace Closing, Team Signature, and Footer

**Context:** Convert closing section. IMPORTANT: Uses `tc('regards')` for Best regards but `t('team')` and `t('footer')` for beta-specific content.
**Files to modify:** `/src/lib/email-templates.ts` (lines 159-164)
**Estimated effort:** 1 story point

- [x] **17.1** Locate "Best regards," text (line 159)
- [x] **17.2** Replace with: `${tc('regards')}` (uses common namespace)
- [x] **17.3** Locate "The FAQBNB Beta Team" text (line 160)
- [x] **17.4** Replace with: `${t('team')}` (uses betaAccess namespace, NOT common)
- [x] **17.5** Locate footer separator line (line 162): `---`
- [x] **17.6** Keep separator as-is (not translated)
- [x] **17.7** Locate first footer line (line 163): `🚀 You're part of something special! Thank you for joining our beta program.`
- [x] **17.8** Replace with: `${t('footer')}` (uses betaAccess namespace, NOT common; includes 🚀 emoji)
- [x] **17.9** ~~Locate second footer line~~ (Not needed - footer key contains both lines with newline)
- [x] **17.10** ~~Replace with footerSupport~~ (footer key includes support text via newline)
- [x] **17.11** Ensure blank line before closing section
- [x] **17.12** Verify `tc()` used ONLY for regards, `t()` for team and footer

**Acceptance Criteria:**
- Regards replaced with `tc('regards')` (common namespace)
- Team signature replaced with `t('team')` (betaAccess namespace, NOT common)
- Footer replaced with `t('footer')` (contains both lines with newline in translation)
- Separator line preserved
- Blank lines preserved

---

### Task 18: Update Variables Object

**Context:** Add `language` field to variables object for consistency with Tasks 2I.3 and 2I.4.
**Files to modify:** `/src/lib/email-templates.ts` (lines 165-174)
**Estimated effort:** 1 story point

- [x] **18.1** Locate the variables object in the return statement
- [x] **18.2** Verify the object contains all original properties:
  - `requesterName`
  - `accountName: accountDisplayName`
  - `accessCode`
  - `requestDate: formatRequestDate(request.request_date)`
  - `approvalDate: new Date().toLocaleDateString()`
  - `registrationLink`
  - `directRegistrationLink`
  - `userEmail: request.requester_email`
- [x] **18.3** Add `language` property at the end: `language`
- [x] **18.4** Ensure proper comma placement
- [x] **18.5** Verify object syntax is correct
- [x] **18.6** Run type check: `npm run typecheck`

**Acceptance Criteria:**
- Variables object includes all original properties
- `language` field added for debugging/logging
- Object syntax valid

---

### Task 19: Run Type Checking and Linting

**Context:** Verify the refactored function passes all quality checks.
**Files to modify:** None (verification only)
**Estimated effort:** 1 story point

- [x] **19.1** Run TypeScript type check: `npm run typecheck`
- [x] **19.2** Verify no TypeScript errors related to the refactored function
- [x] **19.3** Check for any type errors in translation calls
- [x] **19.4** Run ESLint: `npm run lint`
- [x] **19.5** Fix any linting warnings or errors in the function
- [x] **19.6** Verify no unused imports
- [x] **19.7** Ensure proper code formatting (indentation, spacing)

**Acceptance Criteria:**
- `npm run typecheck` passes with no errors
- `npm run lint` passes with no warnings
- Code is properly formatted

---

### Task 20: Run Existing Test Suite

**Context:** Verify backward compatibility by running all existing tests.
**Files to modify:** None (verification only)
**Estimated effort:** 1 story point

- [x] **20.1** Run all tests: `npm run test`
- [x] **20.2** Verify no test failures related to email generation
- [x] **20.3** Check for any beta access email test failures
- [x] **20.4** If tests fail, investigate whether it's due to translation key mismatches
- [x] **20.5** Verify beta request routing from `generateAccessApprovalEmail` still works
- [x] **20.6** Verify no tests needed modification (backward compatibility maintained)
- [x] **20.7** Check test output for unexpected warnings

**Acceptance Criteria:**
- All existing tests pass without modification
- No test failures related to beta email
- Beta request routing works correctly

---

### Task 21: Manual Testing - Standard Beta Email

**Context:** Manually test the function with custom account name to verify output.
**Files to modify:** None (testing only)
**Estimated effort:** 1 story point

- [x] **21.1** Create a test to generate a sample beta email WITH account name
- [x] **21.2** Call `generateBetaAccessApprovalEmail(request, code, 'Test Platform')`
- [x] **21.3** Inspect the returned email subject
- [x] **21.4** Verify subject contains rocket emoji: "🚀 Welcome to FAQBNB Beta..."
- [x] **21.5** Inspect the returned email body
- [x] **21.6** Verify greeting is present with requester name
- [x] **21.7** Verify congratulations message contains 🎉 emoji
- [x] **21.8** Verify beta access details section with 4 bullet items
- [x] **21.9** Verify getting started section with 3 numbered steps
- [x] **21.10** Verify repeated access code and link
- [x] **21.11** Verify What to Expect section with 5 feature items (each with emoji)
- [x] **21.12** Verify Important Beta Notes section with 5 bullet items
- [x] **21.13** Verify excited closing message
- [x] **21.14** Verify closing: "Best regards," + "The FAQBNB Beta Team"
- [x] **21.15** Verify footer with 🚀 emoji and support line
- [x] **21.16** Check formatting: newlines, spacing, bullets, numbers, horizontal rule

**Acceptance Criteria:**
- Email subject contains rocket emoji
- All 8 sections present and correctly formatted
- All 7 emojis visible: 🚀, 🎉, ✨, 📱, 📊, 🛠️, 💌
- Variables interpolated correctly

---

### Task 22: Manual Testing - Default Account Name

**Context:** Test the function with default account name.
**Files to modify:** None (testing only)
**Estimated effort:** 1 story point

- [x] **22.1** Create a test to generate a sample beta email WITHOUT account name
- [x] **22.2** Call `generateBetaAccessApprovalEmail(request, code)`
- [x] **22.3** Inspect the returned email body
- [x] **22.4** Verify platform detail shows default: "the FAQBNB platform"
- [x] **22.5** Verify all other sections are present and correct
- [x] **22.6** Compare formatting with custom account name version
- [x] **22.7** Ensure no `undefined` or `null` text appears in body

**Acceptance Criteria:**
- Default account name "the FAQBNB platform" is used correctly
- All sections present and correct
- Formatting consistent

---

### Task 23: Manual Testing - Beta Request Routing

**Context:** Verify that beta requests still route correctly from `generateAccessApprovalEmail`.
**Files to modify:** None (testing only)
**Estimated effort:** 1 story point

- [x] **23.1** Verify `generateAccessApprovalEmail` calls this function for beta requests
- [x] **23.2** Test with a request where `source === AccessRequestSource.BETA_WAITLIST`
- [x] **23.3** Verify the beta email template is used (not standard approval)
- [x] **23.4** Verify all beta-specific content appears (emojis, features, notes)
- [x] **23.5** Verify the routing logic is unchanged

**Acceptance Criteria:**
- Beta request routing works via `generateAccessApprovalEmail`
- Beta-specific template is used for beta requests
- All beta content renders correctly

---

### Task 24: Verify All Emojis Render Correctly

**Context:** This email contains 7 distinct emojis that must be preserved.
**Files to modify:** None (verification only)
**Estimated effort:** 1 story point

- [x] **24.1** Verify 🚀 (rocket) appears in subject
- [x] **24.2** Verify 🎉 (party) appears in congratulations
- [x] **24.3** Verify ✨ (sparkles) appears in feature1
- [x] **24.4** Verify 📱 (phone) appears in feature2
- [x] **24.5** Verify 📊 (chart) appears in feature3
- [x] **24.6** Verify 🛠️ (tools) appears in feature4
- [x] **24.7** Verify 💌 (letter) appears in feature5
- [x] **24.8** Verify 🚀 (rocket) appears in footer
- [x] **24.9** Document any emoji rendering issues for email client testing

**Acceptance Criteria:**
- All 7 distinct emojis render correctly in output
- Emojis are part of translation strings, not hardcoded

---

### Task 25: Verify Translation Key Coverage

**Context:** Ensure all translation keys used exist in the English translation file.
**Files to modify:** None (verification only)
**Estimated effort:** 1 story point

- [x] **25.1** Count all translation calls in the refactored function
- [x] **25.2** Verify 30-35 strings replaced with translation calls
- [x] **25.3** Open `messages/en.json` file
- [x] **25.4** Check for `emails.betaAccess.subject` key
- [x] **25.5** Check for `emails.betaAccess.greeting` key
- [x] **25.6** Check for `emails.betaAccess.congratulations` key
- [x] **25.7** Check for `emails.betaAccess.accessDetails` key
- [x] **25.8** Check for `emails.betaAccess.platform` key
- [x] **25.9** Check for `emails.betaAccess.accessCode` key
- [x] **25.10** Check for `emails.betaAccess.betaAccessGranted` key
- [x] **25.11** Check for `emails.betaAccess.originalRequest` key
- [x] **25.12** Check for `emails.betaAccess.gettingStarted` key
- [x] **25.13** Check for `emails.betaAccess.step1`, `step1Note`, `step2`, `step3` keys
- [x] **25.14** Check for `emails.betaAccess.accessCodeLabel` key
- [x] **25.15** Check for `emails.betaAccess.directLinkLabel` key
- [x] **25.16** Check for `emails.betaAccess.whatToExpect` key
- [x] **25.17** Check for `emails.betaAccess.feature1` through `feature5` keys
- [x] **25.18** Check for `emails.betaAccess.betaNotes` key
- [x] **25.19** Check for `emails.betaAccess.note1` through `note5` keys
- [x] **25.20** Check for `emails.betaAccess.excited` key
- [x] **25.21** Check for `emails.common.regards` key
- [x] **25.22** Check for `emails.betaAccess.team` key (NOT common.team)
- [x] **25.23** Check for `emails.betaAccess.footer` key (NOT common.footer)
- [x] **25.24** ~~Check for footerSupport~~ (not needed - footer contains both lines)
- [x] **25.25** Document any missing keys for Task 2I.1 updates

**Acceptance Criteria:**
- All translation keys used exist in English translation file
- No missing translation keys
- Beta-specific keys verified (team, footer)

---

### Task 26: Verify Pattern Consistency with Tasks 2I.3 and 2I.4

**Context:** Compare implementation with prior email refactoring tasks to ensure consistency.
**Files to modify:** None (verification only)
**Estimated effort:** 1 story point

- [x] **26.1** Open `/src/lib/email-templates.ts` and locate `generateAccessApprovalEmail()` function
- [x] **26.2** Compare language constant declaration - verify same format
- [x] **26.3** Compare helper function names (`t` and `tc`) - verify identical
- [x] **26.4** Compare helper function implementations - verify same pattern
- [x] **26.5** Compare TODO comment format - verify matches
- [x] **26.6** Compare JSDoc structure - verify consistent
- [x] **26.7** Compare variable naming conventions - verify aligned
- [x] **26.8** Note key difference: betaAccess uses `t('team')` and `t('footer')` instead of `tc('team')` and `tc('footer')`
- [x] **26.9** Verify `tc()` is ONLY used for `regards` in this function
- [x] **26.10** Document any inconsistencies found

**Acceptance Criteria:**
- Pattern follows Tasks 2I.3/2I.4 structure
- Key difference (beta-specific team/footer) is intentional and documented
- Helper functions consistent

---

### Task 27: Build the Project

**Context:** Verify the refactored function builds successfully.
**Files to modify:** None (verification only)
**Estimated effort:** 1 story point

- [x] **27.1** Run the build command: `npm run build`
- [x] **27.2** Verify build completes successfully
- [x] **27.3** Check for any build warnings related to email templates
- [x] **27.4** Verify no errors in build output
- [x] **27.5** If build fails, investigate and document errors
- [x] **27.6** Ensure the refactored function is included in build output

**Acceptance Criteria:**
- `npm run build` completes successfully
- No build errors
- No warnings related to the refactored function

---

### Task 28: Code Review and Final Validation

**Context:** Perform final quality review before marking task complete.
**Files to modify:** None (review only)
**Estimated effort:** 1 story point

- [x] **28.1** Review all changes for code quality
- [x] **28.2** Verify translation helper functions are clear and maintainable
- [x] **28.3** Ensure all variable mappings are correct
- [x] **28.4** Check that formatting (newlines, spacing, bullets, numbers) is preserved
- [x] **28.5** Verify JSDoc comments are accurate and helpful
- [x] **28.6** Ensure TODO comments are clear for Task 2I.7
- [x] **28.7** Review code for consistency with Tasks 2I.3/2I.4 pattern
- [x] **28.8** Check for any hardcoded strings that were missed
- [x] **28.9** Verify backward compatibility is maintained (no signature changes)
- [x] **28.10** Verify all 7 emojis are preserved in translation calls
- [x] **28.11** Verify beta-specific team and footer use `betaAccess` namespace
- [x] **28.12** Check that all 30-35 strings were replaced
- [x] **28.13** Review variables object for completeness
- [x] **28.14** Document any remaining issues or concerns

**Acceptance Criteria:**
- Code passes quality review
- All hardcoded strings replaced
- Pattern matches Tasks 2I.3/2I.4
- Beta-specific elements use correct namespace
- Emojis preserved
- Backward compatibility maintained

---

## Validation Checklist

Before marking this request as complete, verify:

- [x] All 30-35 hardcoded strings replaced with `getEmailTranslation()` calls
- [x] Function generates identical English email output to current version
- [x] All 7 emojis preserved and rendered correctly (🚀, 🎉, ✨, 📱, 📊, 🛠️, 💌)
- [x] Translation helper functions (`t` and `tc`) implemented consistently
- [x] Beta-specific team uses `t('team')` NOT `tc('team')`
- [x] Beta-specific footer uses `t('footer')` NOT `tc('footer')`
- [x] Only `tc('regards')` uses common namespace
- [x] No changes to function signature (maintains backward compatibility)
- [x] JSDoc comments updated with translation references
- [x] Variables object includes `language` field
- [x] TypeScript compiles without errors (`npm run typecheck`)
- [x] ESLint passes without warnings (`npm run lint`)
- [x] Build succeeds (`npm run build`)
- [x] Manual testing confirms identical output
- [x] Beta request routing from `generateAccessApprovalEmail` still works
- [x] All translation keys exist in `messages/en.json`
- [x] Pattern consistent with Tasks 2I.3/2I.4 implementation
- [x] Code review completed

---

## Dependencies

### Required Completions (Blocking)
- **REQ-E02-019** (Task 2I.1): Translation namespace structure must exist
- **REQ-E02-020** (Task 2I.2): `getEmailTranslation` utility must be implemented
- **REQ-E02-021** (Task 2I.3): `generateAccessApprovalEmail` pattern established
- **REQ-E02-022** (Task 2I.4): `generateAccessDenialEmail` pattern confirmed

### Blocks These Tasks
- **REQ-E02-025** (Task 2I.7): Add language parameter to email functions
- **REQ-E02-026** (Task 2I.8): Generate non-English translations

### Parallel Safety
**Files touched:** `/src/lib/email-templates.ts` (lines 103-176)
**Conflicts with:** Task 2I.6 (same file)
**Recommendation:** Run Tasks 2I.5 and 2I.6 SEQUENTIALLY

---

## Notes

- This is the MOST COMPLEX email template (~74 lines, 30-35 strings, 8 sections)
- Helper function namespace prefix is `betaAccess` (not `accessApproval` or `accessDenial`)
- KEY DIFFERENCE: Uses `t('team')` and `t('footer')` instead of `tc('team')` and `tc('footer')`
- Only `tc('regards')` uses the common namespace - for "Best regards," text
- Contains 7 distinct emojis that must be preserved: 🚀, 🎉, ✨, 📱, 📊, 🛠️, 💌
- Emojis are included in translation strings (not separate elements)
- Beta email is called FROM `generateAccessApprovalEmail()` when `isBetaRequest === true`
- Estimated effort is higher than other email tasks due to complexity

---

**Total Tasks:** 28
**Total Subtasks:** ~350
**Estimated Total Effort:** 2-2.5 hours

---

*Document created by Senior Developer Agent - Task 2I.5 Detailed Specification*
*Last Modified: 2026-01-23 01:20*
