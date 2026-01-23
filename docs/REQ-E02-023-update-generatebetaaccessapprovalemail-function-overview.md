# Implementation Overview: Update `generateBetaAccessApprovalEmail` Function

**Document Created:** 2026-01-23 01:09
**Last Modified:** 2026-01-23 01:09

---

## Header

| Field | Value |
|-------|-------|
| Task Reference | Task 2I.5 (Sub-Epic 2I: Email Templates) |
| Source File | docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md |
| Implementation Plan | Epic 2 - L10N Static UI Translation |
| Original Plan Date | Not specified |
| Breakdown Created | 2026-01-23 01:09 |
| T-shirt Size | Medium |
| Estimated Effort | 2-2.5 hours |
| Status | PENDING |

---

## Executive Summary

This task refactors the `generateBetaAccessApprovalEmail()` function in `/src/lib/email-templates.ts` to use the internationalization infrastructure created in Tasks 2I.1 and 2I.2. This is the most complex email template in the system, containing approximately 30+ hardcoded strings including emoji-prefixed feature highlights, multi-section content, and a distinctive beta-themed closing. Following the established pattern from Tasks 2I.3 and 2I.4, this function will use translation calls while preserving its unique beta program branding.

**Key Deliverable:** A refactored `generateBetaAccessApprovalEmail()` function that replaces approximately 30-35 hardcoded English strings with translation calls, maintaining backward compatibility and preserving emoji-rich beta program branding.

**Current Function Signature:**
```typescript
function generateBetaAccessApprovalEmail(
  request: AccessRequest,
  accessCode: string,
  accountName?: string,
  baseUrl?: string
): EmailTemplate
```

**Target Function Signature (Task 2I.7 will add language param):**
```typescript
function generateBetaAccessApprovalEmail(
  request: AccessRequest,
  accessCode: string,
  accountName?: string,
  baseUrl?: string,
  language?: SupportedLanguage  // Added in Task 2I.7
): EmailTemplate
```

---

## Goals

### Primary Objectives

1. **Replace all hardcoded strings** (~30-35 strings) in `generateBetaAccessApprovalEmail()` with `getEmailTranslation()` calls
2. **Follow established pattern** from Tasks 2I.3 and 2I.4 for consistency
3. **Preserve emoji branding** (🚀, 🎉, ✨, 📱, 📊, 🛠️, 💌) in translation keys
4. **Use English as default** language (parameter added in Task 2I.7)
5. **Maintain unique beta elements:**
   - Beta-specific team signature ("The FAQBNB Beta Team")
   - Special footer with rocket emoji
   - "What to Expect" features section
   - "Important Beta Program Notes" section
6. **Maintain backward compatibility** with existing callers
7. **Use `betaAccess` namespace** (not `common`) for beta-specific content

### Success Criteria

- [ ] All 30-35 hardcoded strings replaced with translation calls
- [ ] Function generates identical English output to current version
- [ ] Emojis preserved in subject and throughout email
- [ ] Beta-specific closing (team + footer) uses `betaAccess` namespace
- [ ] Helper functions (`t()`) implemented consistently with prior tasks
- [ ] No breaking changes to function signature or return type
- [ ] Translation keys match Task 2I.1 `betaAccess` namespace structure
- [ ] Code follows established Task 2I.3/2I.4 pattern

### Assumptions & Clarifications

- **Assumption 1:** Language parameter added in Task 2I.7; this task uses `'en'` as default
- **Assumption 2:** Translation files from Task 2I.1 contain all required `betaAccess.*` keys
- **Assumption 3:** Emojis are included in translation strings (not separate)
- **Assumption 4:** Beta email uses `betaAccess.team` and `betaAccess.footer` (not `common.*`)
- **Assumption 5:** `common.regards` is still used for "Best regards," line
- **Clarification:** Emojis should be preserved in all language translations (universal visual elements)

---

## Technical Context

### Current State

**File:** `/src/lib/email-templates.ts` (546 lines)
**Function:** `generateBetaAccessApprovalEmail()` (lines 103-176, ~74 lines)
**Complexity:** HIGHEST of all email templates (30-35 strings, multiple sections)

**Current Implementation Pattern:**
```typescript
return {
  subject: `🚀 Welcome to FAQBNB Beta - Access Granted!`,
  body: `Hello ${requesterName},

🎉 Congratulations! Your beta waitlist request has been approved...

Your Beta Access Details:
• Platform: ${accountDisplayName}
• Access Code: ${accessCode}
• Beta Access Granted: ${new Date().toLocaleDateString()}
• Original Request: ${formatRequestDate(request.request_date)}

Getting Started with Your Beta Access:
1. Click this direct registration link: ${directRegistrationLink}
...

What to Expect:
✨ Early access to all FAQBNB features
📱 QR code generation and management tools
...

Important Beta Program Notes:
- Your access code provides full platform access...
...

We're excited to have you as part of our exclusive beta community!

Best regards,
The FAQBNB Beta Team

---
🚀 You're part of something special! Thank you for joining our beta program.`,
  variables: { ... }
};
```

**Email Sections (8 distinct sections):**
1. Subject line (with 🚀 emoji)
2. Greeting + Congratulations (with 🎉 emoji)
3. Beta Access Details (4 lines)
4. Getting Started instructions (3 steps)
5. Access code/link repeat (2 lines)
6. What to Expect features (5 items with emojis)
7. Important Beta Notes (5 bullet points)
8. Closing (excited message + regards + beta team + special footer)

**Hardcoded Strings Count:** ~30-35 distinct strings
- 1 subject line (with emoji)
- 1 greeting
- 1 congratulations message (with emoji)
- 1 access details header
- 4 access detail lines (platform, code, granted date, request date)
- 1 getting started header
- 3 instruction steps
- 2 access code/link labels
- 1 what to expect header
- 5 feature items (with emojis)
- 1 beta notes header
- 5 note items
- 1 excited closing message
- 1 regards
- 1 beta team signature
- 1 special beta footer (with emoji)

**Usage Points:**
- Called from `generateAccessApprovalEmail()` when `isBetaRequest === true` (line 41)
- Part of beta waitlist approval flow

### Architecture Patterns

**Established Pattern (Tasks 2I.3, 2I.4):**
```typescript
// Language constant
const language: SupportedLanguage = 'en';
// TODO: Task 2I.7 - Replace with parameter

// Helper to translate with namespace
const t = (key: string, vars?: Record<string, string | number>) =>
  getEmailTranslation(`betaAccess.${key}`, language, vars);

// Note: This function uses betaAccess namespace, not common for team/footer
```

**Key Difference from Other Emails:**
- Uses `betaAccess.team` instead of `common.team`
- Uses `betaAccess.footer` instead of `common.footer`
- Still uses `common.regards` for "Best regards,"

**Translation Key Structure (from Task 2I.1):**
```
emails.betaAccess.subject                 🚀 Welcome to FAQBNB Beta...
emails.betaAccess.greeting                Hello {name},
emails.betaAccess.congratulations         🎉 Congratulations!...
emails.betaAccess.accessDetails           Your Beta Access Details:
emails.betaAccess.platform                Platform: {accountName}
emails.betaAccess.accessCode              Access Code: {accessCode}
emails.betaAccess.betaAccessGranted       Beta Access Granted: {approvalDate}
emails.betaAccess.originalRequest         Original Request: {requestDate}
emails.betaAccess.gettingStarted          Getting Started with Your Beta Access:
emails.betaAccess.step1                   Click this direct registration link: {link}
emails.betaAccess.step1Note               (This link pre-fills your access code...)
emails.betaAccess.step2                   Complete your account registration
emails.betaAccess.step3                   Start exploring the platform features...
emails.betaAccess.accessCodeLabel         Your beta access code: {accessCode}
emails.betaAccess.directLinkLabel         Direct registration link: {link}
emails.betaAccess.whatToExpect            What to Expect:
emails.betaAccess.feature1                ✨ Early access to all FAQBNB features
emails.betaAccess.feature2                📱 QR code generation and management tools
emails.betaAccess.feature3                📊 Analytics and insights dashboard
emails.betaAccess.feature4                🛠️ Priority support during the beta period
emails.betaAccess.feature5                💌 Direct feedback channel...
emails.betaAccess.betaNotes               Important Beta Program Notes:
emails.betaAccess.note1                   Your access code provides full platform access...
emails.betaAccess.note2                   As a beta user, your feedback is invaluable...
emails.betaAccess.note3                   Some features may be evolving...
emails.betaAccess.note4                   Keep your access code secure...
emails.betaAccess.note5                   Beta users will receive priority updates...
emails.betaAccess.excited                 We're excited to have you as part of...
emails.common.regards                     Best regards,
emails.betaAccess.team                    The FAQBNB Beta Team
emails.betaAccess.footer                  🚀 You're part of something special!...
emails.betaAccess.footerSupport           For beta support or feedback...
```

---

## Implementation Plan

### Step 1: Update JSDoc Comments
**Description:** Update function documentation to reflect translation usage
**Rationale:** Start with documentation; establish context before code changes
**Estimated Effort:** 5 minutes (Small)

**Current JSDoc (lines 103-110):**
```typescript
/**
 * Generate beta access approval email template
 * For users who signed up through the beta waitlist
 * @param request - Access request data
 * @param accessCode - Generated access code
 * @param accountName - Optional account name
 * @param baseUrl - Optional base URL for links (defaults to getServerBaseUrl())
 */
```

**Update to:**
```typescript
/**
 * Generate beta access approval email template
 * For users who signed up through the beta waitlist
 * Uses translations from emails.betaAccess namespace
 * Currently generates English emails only (language parameter added in Task 2I.7)
 *
 * @param request - Access request data
 * @param accessCode - Generated access code
 * @param accountName - Optional account name (defaults to 'the FAQBNB platform')
 * @param baseUrl - Optional base URL for links (defaults to getServerBaseUrl())
 * @returns Email template with subject and body using translations
 *
 * @see Task 2I.1 - Translation namespace structure
 * @see Task 2I.2 - getEmailTranslation utility
 * @see Task 2I.3 - Pattern established for email translation
 * @see Task 2I.7 - Language parameter addition (future)
 */
```

### Step 2: Add Language Constant and Helper Functions
**Description:** Add language constant and translation helper functions following established pattern
**Rationale:** Establish translation infrastructure consistent with Tasks 2I.3/2I.4
**Estimated Effort:** 10 minutes (Small)

**Add after variable initialization (after line 120):**
```typescript
export function generateBetaAccessApprovalEmail(
  request: AccessRequest,
  accessCode: string,
  accountName?: string,
  baseUrl?: string
  // TODO: Task 2I.7 - Add: language: SupportedLanguage = 'en'
): EmailTemplate {
  const requesterName = request.requester_name || 'there';
  const accountDisplayName = accountName || 'the FAQBNB platform';
  const registrationLink = createRegistrationLink(baseUrl);
  const directRegistrationLink = createRegistrationLinkWithCode(accessCode, request.requester_email, baseUrl);

  // Language constant (defaults to English)
  const language: SupportedLanguage = 'en';
  // TODO: Task 2I.7 - Replace with parameter

  // Helper to translate email content with betaAccess namespace
  const t = (key: string, vars?: Record<string, string | number>) =>
    getEmailTranslation(`betaAccess.${key}`, language, vars);

  // Helper to translate common email content (only for regards)
  const tc = (key: string) =>
    getEmailTranslation(`common.${key}`, language);

  return {
    // ... rest of function
  };
}
```

**Note:** `tc()` only used for `common.regards`; team and footer use `betaAccess` namespace

### Step 3: Replace Subject Line
**Description:** Convert subject with emoji to translation call
**Rationale:** Simple first replacement; emoji preserved in translation key
**Estimated Effort:** 5 minutes (Small)

**Current (line 123):**
```typescript
subject: `🚀 Welcome to FAQBNB Beta - Access Granted!`,
```

**Replace with:**
```typescript
subject: t('subject'),
```

**Translation Key:** `emails.betaAccess.subject`
**Variables:** none (emoji is part of translation string)

### Step 4: Replace Greeting and Congratulations
**Description:** Convert opening section (greeting + congratulations message)
**Rationale:** Grouped as they form the email opening
**Estimated Effort:** 5 minutes (Small)

**Current (lines 124-126):**
```typescript
body: `Hello ${requesterName},

🎉 Congratulations! Your beta waitlist request has been approved, and you now have exclusive early access to FAQBNB!
```

**Replace with:**
```typescript
body: `${t('greeting', { name: requesterName })}

${t('congratulations')}
```

**Translation Keys:**
- `emails.betaAccess.greeting` (variable: `{name}`)
- `emails.betaAccess.congratulations` (no variables, includes 🎉 emoji)

### Step 5: Replace Beta Access Details Section
**Description:** Convert "Your Beta Access Details:" header and 4 detail lines
**Rationale:** Contains multiple variables (account, code, dates)
**Estimated Effort:** 15 minutes (Small)

**Current (lines 128-132):**
```typescript
Your Beta Access Details:
• Platform: ${accountDisplayName}
• Access Code: ${accessCode}
• Beta Access Granted: ${new Date().toLocaleDateString()}
• Original Request: ${formatRequestDate(request.request_date)}
```

**Replace with:**
```typescript
${t('accessDetails')}
• ${t('platform', { accountName: accountDisplayName })}
• ${t('accessCode', { accessCode })}
• ${t('betaAccessGranted', { approvalDate: new Date().toLocaleDateString() })}
• ${t('originalRequest', { requestDate: formatRequestDate(request.request_date) })}
```

**Translation Keys:**
- `emails.betaAccess.accessDetails` (no variables)
- `emails.betaAccess.platform` (variable: `{accountName}`)
- `emails.betaAccess.accessCode` (variable: `{accessCode}`)
- `emails.betaAccess.betaAccessGranted` (variable: `{approvalDate}`)
- `emails.betaAccess.originalRequest` (variable: `{requestDate}`)

### Step 6: Replace Getting Started Section
**Description:** Convert instructions header and 3 numbered steps
**Rationale:** Step 1 contains link variable, step 1 note is separate, steps 2-3 static
**Estimated Effort:** 10 minutes (Small)

**Current (lines 134-138):**
```typescript
Getting Started with Your Beta Access:
1. Click this direct registration link: ${directRegistrationLink}
   (This link pre-fills your access code and email for convenience)
2. Complete your account registration
3. Start exploring the platform features and capabilities
```

**Replace with:**
```typescript
${t('gettingStarted')}
1. ${t('step1', { link: directRegistrationLink })}
   ${t('step1Note')}
2. ${t('step2')}
3. ${t('step3')}
```

**Translation Keys:**
- `emails.betaAccess.gettingStarted` (no variables)
- `emails.betaAccess.step1` (variable: `{link}`)
- `emails.betaAccess.step1Note` (no variables)
- `emails.betaAccess.step2` (no variables)
- `emails.betaAccess.step3` (no variables)

### Step 7: Replace Repeated Access Code and Link Lines
**Description:** Convert repeated access code and link display
**Rationale:** Same pattern as Task 2I.3 access approval
**Estimated Effort:** 5 minutes (Small)

**Current (lines 140-141):**
```typescript
Your beta access code: ${accessCode}
Direct registration link: ${directRegistrationLink}
```

**Replace with:**
```typescript
${t('accessCodeLabel', { accessCode })}
${t('directLinkLabel', { link: directRegistrationLink })}
```

**Translation Keys:**
- `emails.betaAccess.accessCodeLabel` (variable: `{accessCode}`)
- `emails.betaAccess.directLinkLabel` (variable: `{link}`)

### Step 8: Replace What to Expect Section
**Description:** Convert "What to Expect:" header and 5 emoji-prefixed features
**Rationale:** Static text but emojis preserved in translation strings
**Estimated Effort:** 15 minutes (Small)

**Current (lines 143-148):**
```typescript
What to Expect:
✨ Early access to all FAQBNB features
📱 QR code generation and management tools
📊 Analytics and insights dashboard
🛠️ Priority support during the beta period
💌 Direct feedback channel to influence product development
```

**Replace with:**
```typescript
${t('whatToExpect')}
${t('feature1')}
${t('feature2')}
${t('feature3')}
${t('feature4')}
${t('feature5')}
```

**Translation Keys:**
- `emails.betaAccess.whatToExpect` (no variables)
- `emails.betaAccess.feature1` (no variables, includes ✨ emoji)
- `emails.betaAccess.feature2` (no variables, includes 📱 emoji)
- `emails.betaAccess.feature3` (no variables, includes 📊 emoji)
- `emails.betaAccess.feature4` (no variables, includes 🛠️ emoji)
- `emails.betaAccess.feature5` (no variables, includes 💌 emoji)

### Step 9: Replace Important Beta Notes Section
**Description:** Convert "Important Beta Program Notes:" header and 5 bullet points
**Rationale:** All static text, no variables
**Estimated Effort:** 15 minutes (Small)

**Current (lines 150-155):**
```typescript
Important Beta Program Notes:
- Your access code provides full platform access during the beta period
- As a beta user, your feedback is invaluable to us
- Some features may be evolving - please share your experience!
- Keep your access code secure and don't share it with others
- Beta users will receive priority updates on new features
```

**Replace with:**
```typescript
${t('betaNotes')}
- ${t('note1')}
- ${t('note2')}
- ${t('note3')}
- ${t('note4')}
- ${t('note5')}
```

**Translation Keys:**
- `emails.betaAccess.betaNotes` (no variables)
- `emails.betaAccess.note1` (no variables)
- `emails.betaAccess.note2` (no variables)
- `emails.betaAccess.note3` (no variables)
- `emails.betaAccess.note4` (no variables)
- `emails.betaAccess.note5` (no variables)

### Step 10: Replace Excited Closing Message
**Description:** Convert the excited community message
**Rationale:** Single static line before regards
**Estimated Effort:** 5 minutes (Small)

**Current (line 157):**
```typescript
We're excited to have you as part of our exclusive beta community!
```

**Replace with:**
```typescript
${t('excited')}
```

**Translation Key:** `emails.betaAccess.excited` (no variables)

### Step 11: Replace Regards, Team, and Footer
**Description:** Convert closing section with beta-specific elements
**Rationale:** Uses `common.regards` but `betaAccess.team` and `betaAccess.footer`
**Estimated Effort:** 10 minutes (Small)

**Current (lines 159-164):**
```typescript
Best regards,
The FAQBNB Beta Team

---
🚀 You're part of something special! Thank you for joining our beta program.
For beta support or feedback, please contact us through the platform or reply to this email.
```

**Replace with:**
```typescript
${tc('regards')}
${t('team')}

---
${t('footer')}
${t('footerSupport')}
```

**Translation Keys:**
- `emails.common.regards` (no variables) - Via `tc()` helper
- `emails.betaAccess.team` (no variables) - Beta-specific team name
- `emails.betaAccess.footer` (no variables, includes 🚀 emoji)
- `emails.betaAccess.footerSupport` (no variables) - Support line

**Key Decision:** Beta email uses its own team and footer (not `common.*`)

### Step 12: Update Variables Object
**Description:** Add `language` field to variables object for consistency
**Rationale:** Matches established pattern from Tasks 2I.3/2I.4
**Estimated Effort:** 5 minutes (Small)

**Current (lines 165-174):**
```typescript
variables: {
  requesterName,
  accountName: accountDisplayName,
  accessCode,
  requestDate: formatRequestDate(request.request_date),
  approvalDate: new Date().toLocaleDateString(),
  registrationLink,
  directRegistrationLink,
  userEmail: request.requester_email
}
```

**Update to:**
```typescript
variables: {
  requesterName,
  accountName: accountDisplayName,
  accessCode,
  requestDate: formatRequestDate(request.request_date),
  approvalDate: new Date().toLocaleDateString(),
  registrationLink,
  directRegistrationLink,
  userEmail: request.requester_email,
  language
}
```

### Step 13: Verify Formatting and Structure
**Description:** Ensure email structure matches original formatting exactly
**Rationale:** Email appearance should be identical to current version
**Estimated Effort:** 15 minutes (Medium)

**Verification Points:**
- [ ] All emojis appear correctly (🚀, 🎉, ✨, 📱, 📊, 🛠️, 💌)
- [ ] Newlines and spacing match original
- [ ] Bullet points (•) formatted correctly in details section
- [ ] Dashes (-) formatted correctly in notes section
- [ ] Numbered steps (1. 2. 3.) formatted correctly
- [ ] All variables interpolate correctly
- [ ] Horizontal rule (---) in correct position

**Test Cases:**
1. With account name: `generateBetaAccessApprovalEmail(request, code, 'Test Platform')`
2. Default account name: `generateBetaAccessApprovalEmail(request, code)`
3. Verify date formatting in both date fields

---

## Authorized Files and Functions for Modification

> ⚠️ **APPROVED SCOPE**: Changes outside this list require review

### Primary File (MODIFY)

| File | Target | Type | Lines Modified | Purpose |
|------|--------|------|----------------|---------|
| `/src/lib/email-templates.ts` | `generateBetaAccessApprovalEmail()` | Modify | 103-176 (~74 lines) | Replace hardcoded strings with translation calls |
| `/src/lib/email-templates.ts` | JSDoc comments | Update | 103-110 | Update documentation |

### Files NOT Modified (Dependencies)

| File | Task | Reason |
|------|------|--------|
| `/src/lib/email-translations.ts` | Task 2I.2 | Translation utility already implemented |
| `/messages/*.json` | Task 2I.1 | Translation files already created |
| Any caller files | N/A | Function signature unchanged |

### Files Modified in Later Tasks

| File | Task | Change |
|------|------|--------|
| `/src/lib/email-templates.ts` | Task 2I.7 | Add `language` parameter to function signature |

---

## Dependencies

### Depends On (Completed First)

- **REQ-E02-019** (Task 2I.1): Create `emails` namespace and translation structure
  - **What it provides:** Translation files with `emails.betaAccess.*` keys (~25-30 keys)
  - **Why critical:** Cannot call `getEmailTranslation()` without keys existing
  - **Specific keys needed:** All betaAccess namespace keys

- **REQ-E02-020** (Task 2I.2): Create `getEmailTranslation` utility function
  - **What it provides:** `getEmailTranslation()` function to call
  - **Why critical:** Core translation mechanism
  - **Required API:** `getEmailTranslation(key, language, variables?): string`

- **REQ-E02-021** (Task 2I.3): Update `generateAccessApprovalEmail` function
  - **What it provides:** Established pattern for email translation refactoring
  - **Why critical:** Pattern to follow for consistency
  - **Pattern elements:** Helper functions, language constant, TODO comments

- **REQ-E02-022** (Task 2I.4): Update `generateAccessDenialEmail` function
  - **What it provides:** Second confirmation of pattern
  - **Why relevant:** Ensures consistent approach across all emails

### Blocks (Requires This First)

- **REQ-E02-025** (Task 2I.7): Add language parameter to all email generation functions
  - **What we provide:** Refactored function with language constant placeholder
  - **Blocking reason:** Task 2I.7 converts constant to parameter
  - **Sequential dependency:** Easier to add parameter after refactoring complete

- **REQ-E02-026** (Task 2I.8): Generate translations for 5 non-English languages
  - **What we provide:** Validated English translation key usage for beta emails
  - **Blocking reason:** Ensures betaAccess keys work before translating them

### Parallel Safety

**Files touched by this task:**
- `/src/lib/email-templates.ts` (lines 103-176)

**Conflicts with:**
- **Task 2I.3** (Update `generateAccessApprovalEmail`) - ✅ ALREADY COMPLETED
- **Task 2I.4** (Update `generateAccessDenialEmail`) - ✅ ALREADY COMPLETED
- **Task 2I.6** (Update `generateRegistrationReminderEmail`) - Different function, same file
  - **Risk:** Medium - Both modify same file
  - **Mitigation:** Sequential execution recommended

**Safe to parallelize with:**
- **Task 2I.8** (Generate non-English translations) - Different files (`/messages/*.json`)
- **Any Epic 2 tasks from other sub-epics** - No file overlap

**Recommendation:** Run Task 2I.5 and Task 2I.6 SEQUENTIALLY to avoid merge conflicts

### External Dependencies

**Runtime Dependencies:**
- Translation utility: `/src/lib/email-translations.ts`
- Translation files: `/messages/en.json` (specifically `emails.betaAccess.*` keys)
- Type definitions: `SupportedLanguage` from `/src/types`

**Build-Time Dependencies:**
- TypeScript compiler for type checking
- ESLint for code quality

---

## Risks and Considerations

### Potential Side Effects

1. **Emoji Rendering Issues:**
   - **Risk:** Emojis not displayed correctly in some email clients
   - **Impact:** Beta emails lose distinctive visual branding
   - **Mitigation:** Emojis are in translation strings, not code; test across clients
   - **Severity:** Low (existing behavior maintained)

2. **Translation Key Mismatches:**
   - **Risk:** Translation keys don't match Task 2I.1 namespace
   - **Impact:** Missing translations, fallback to keys
   - **Mitigation:** Cross-reference Task 2I.1 Appendix documentation
   - **Severity:** High

3. **Beta Team vs Common Team:**
   - **Risk:** Accidentally using `common.team` instead of `betaAccess.team`
   - **Impact:** Wrong team signature in beta emails
   - **Mitigation:** Explicit helper usage; code review
   - **Severity:** Medium

4. **Variable Name Mismatches:**
   - **Risk:** Variable names don't match translation placeholders
   - **Impact:** Uninterpolated placeholders in email
   - **Mitigation:** Follow Task 2I.1 mapping exactly
   - **Severity:** High

5. **Formatting Changes:**
   - **Risk:** Translation assembly changes email formatting
   - **Impact:** Beta emails look different from current version
   - **Mitigation:** Preserve whitespace carefully; comprehensive testing
   - **Severity:** Medium

6. **Breaking Access Approval Flow:**
   - **Risk:** `generateAccessApprovalEmail` calls this function for beta requests
   - **Impact:** Beta approval emails fail
   - **Mitigation:** No signature changes; test beta flow specifically
   - **Severity:** High

### Testing Requirements

**Unit Tests:**
- [ ] Function generates valid EmailTemplate object
- [ ] Subject contains rocket emoji and expected text
- [ ] All 8 sections present in body
- [ ] All emojis render correctly (7 distinct emojis)
- [ ] Variables object populated correctly
- [ ] All translation calls use correct keys
- [ ] Variable interpolation works for all dynamic content

**Integration Tests:**
- [ ] Beta request routing from `generateAccessApprovalEmail` works
- [ ] Email sending succeeds with new template
- [ ] Access approval flow handles beta requests correctly

**Manual Testing:**
- [ ] Generate sample beta email with custom account name
- [ ] Generate sample beta email with default account name
- [ ] Verify all emojis visible: 🚀, 🎉, ✨, 📱, 📊, 🛠️, 💌
- [ ] Verify output matches current English version exactly
- [ ] Check formatting (spacing, bullets, dashes, numbers)
- [ ] Test beta approval flow end-to-end

**QA Checklist:**
- [ ] All 30-35 strings replaced with translation calls
- [ ] All emojis preserved and visible
- [ ] Beta-specific team signature used (not common.team)
- [ ] Beta-specific footer used (not common.footer)
- [ ] No ESLint warnings or errors
- [ ] TypeScript compiles without errors
- [ ] Function generates identical English output
- [ ] No breaking changes to function signature
- [ ] Pattern matches Tasks 2I.3/2I.4
- [ ] Git commit message: "[REQ-E02-023] Update generateBetaAccessApprovalEmail function"

### Open Questions

- [ ] **Q1:** Should emojis be removed or localized for certain languages in Task 2I.8?
  - **Current:** Emojis included in English translation strings
  - **Options:**
    - A) Keep emojis in all languages (universal visual elements)
    - B) Remove emojis for formal language markets
    - C) Let translators decide per language
  - **Recommendation:** Option A - Emojis are universal and enhance beta excitement

- [ ] **Q2:** Should beta team signature vary by language?
  - **Current:** "The FAQBNB Beta Team"
  - **Options:**
    - A) Same text in all languages
    - B) Translate to "L'équipe FAQBNB Beta" etc.
  - **Recommendation:** Option B - Translate team name for natural language flow

- [ ] **Q3:** Should the approval date use locale-specific formatting?
  - **Current:** `new Date().toLocaleDateString()` (browser locale)
  - **Issue:** Server-side email generation may not have locale context
  - **Recommendation:** Future improvement; current behavior is acceptable

---

## Out of Scope

**Explicitly NOT included in this task:**

1. **Adding language parameter** to function signature - Task 2I.7
2. **Updating function callers** to pass language - Task 2I.7
3. **Translating to non-English languages** - Task 2I.8
4. **Updating other email functions** - Task 2I.6
5. **Testing email generation in multiple languages** - Task 2I.9
6. **Modifying HTML email rendering** - Out of scope for Epic 2
7. **Changing email content or structure** - Only translation, not redesign
8. **Locale-specific date formatting** - Future enhancement
9. **Updating EmailTemplate type definition** - No changes needed
10. **Modifying email sending logic** - `/src/lib/email-service.ts` unchanged
11. **Database schema changes** - No DB changes required
12. **Adding new beta features to email** - Content unchanged

---

## Success Metrics

### Quantitative Metrics

1. **String Replacement Count:** 30-35 hardcoded strings replaced
2. **Translation Keys Used:** ~30 unique keys from `emails.betaAccess.*` namespace
3. **Emoji Count Preserved:** 7 distinct emojis (🚀, 🎉, ✨, 📱, 📊, 🛠️, 💌)
4. **Lines Changed:** ~74 lines modified (function body refactoring)
5. **Build Errors:** 0 TypeScript compilation errors
6. **Lint Warnings:** 0 ESLint warnings
7. **Pattern Consistency:** 100% match with Tasks 2I.3/2I.4 pattern

### Qualitative Metrics

1. **Code Readability:** Translation calls are clear and maintainable
2. **Backward Compatibility:** No breaking changes to function behavior
3. **Output Consistency:** Generated emails identical to current English version
4. **Emoji Preservation:** All emojis render correctly in output
5. **Pattern Adherence:** Follows established Task 2I.3/2I.4 pattern
6. **Documentation Quality:** JSDoc comments accurate and helpful
7. **Code Review Approval:** Technical lead approves implementation

### Acceptance Criteria

**Task is complete when:**
- ✅ All hardcoded strings replaced with `getEmailTranslation()` calls
- ✅ Function generates identical English email output to current version
- ✅ All 7 emojis preserved and rendered correctly
- ✅ Translation helper functions (`t` and `tc`) implemented consistently
- ✅ Beta-specific team and footer use `betaAccess` namespace (not `common`)
- ✅ No changes to function signature (backward compatible)
- ✅ JSDoc comments updated with translation references
- ✅ Variables object includes `language` field
- ✅ TypeScript compiles without errors
- ✅ ESLint passes without warnings
- ✅ Beta request routing still works via `generateAccessApprovalEmail`
- ✅ Code review approved
- ✅ Git commit created: "[REQ-E02-023] Update generateBetaAccessApprovalEmail function"

---

## Implementation Notes

### Key Design Decisions

1. **Beta-Specific Namespace Usage:**
   - **Decision:** Use `betaAccess.team` and `betaAccess.footer` instead of `common.*`
   - **Rationale:** Beta emails have distinctive branding that differs from standard emails
   - **Trade-off:** Separate translation keys vs unified common keys

2. **Emoji Handling:**
   - **Decision:** Include emojis in translation strings, not as separate elements
   - **Rationale:** Simpler translation management; emojis are part of the message
   - **Trade-off:** Can't easily remove emojis per-language vs simpler implementation

3. **Follow Established Pattern:**
   - **Decision:** Use exact same structure as Tasks 2I.3/2I.4
   - **Rationale:** Consistency across all email templates
   - **Trade-off:** Some redundant helper definitions vs guaranteed consistency

4. **Common Regards Only:**
   - **Decision:** Use `tc('regards')` but `t('team')` and `t('footer')`
   - **Rationale:** "Best regards," is universal; team and footer are beta-specific
   - **Trade-off:** Mixed namespace usage vs accurate content segregation

5. **Language Constant:**
   - **Decision:** Use `const language = 'en'` placeholder
   - **Rationale:** Matches Tasks 2I.3/2I.4; prepares for Task 2I.7
   - **Trade-off:** Extra variable vs easier future conversion

### Comparison with Prior Tasks

**Compared to Task 2I.3 (Access Approval):**
- More strings (30-35 vs 22)
- More sections (8 vs 5-6)
- Emoji-rich content (7 emojis vs 0)
- Different closing (betaAccess.team vs common.team)
- Higher complexity overall

**Compared to Task 2I.4 (Access Denial):**
- Much more complex (30-35 vs 12 strings)
- Multiple feature bullet points (5 items)
- Multiple note bullet points (5 items)
- Unique footer with emoji
- No conditional logic (denial has optional reason)

**Estimated Effort:** 2-2.5 hours (highest among email templates)

---

## Appendix A: Translation Key Mapping Reference

### Complete Beta Access Approval Email Translation Keys

| # | Current String | Translation Key | Variables | Notes |
|---|----------------|-----------------|-----------|-------|
| 1 | `🚀 Welcome to FAQBNB Beta - Access Granted!` | `betaAccess.subject` | none | Subject with emoji |
| 2 | `Hello ${requesterName},` | `betaAccess.greeting` | `{name}` | Opening greeting |
| 3 | `🎉 Congratulations! Your beta waitlist request...` | `betaAccess.congratulations` | none | With emoji |
| 4 | `Your Beta Access Details:` | `betaAccess.accessDetails` | none | Section header |
| 5 | `Platform: ${accountDisplayName}` | `betaAccess.platform` | `{accountName}` | Detail line 1 |
| 6 | `Access Code: ${accessCode}` | `betaAccess.accessCode` | `{accessCode}` | Detail line 2 |
| 7 | `Beta Access Granted: ${date}` | `betaAccess.betaAccessGranted` | `{approvalDate}` | Detail line 3 |
| 8 | `Original Request: ${date}` | `betaAccess.originalRequest` | `{requestDate}` | Detail line 4 |
| 9 | `Getting Started with Your Beta Access:` | `betaAccess.gettingStarted` | none | Section header |
| 10 | `Click this direct registration link: ${link}` | `betaAccess.step1` | `{link}` | Step 1 |
| 11 | `(This link pre-fills your access code...)` | `betaAccess.step1Note` | none | Step 1 note |
| 12 | `Complete your account registration` | `betaAccess.step2` | none | Step 2 |
| 13 | `Start exploring the platform features...` | `betaAccess.step3` | none | Step 3 |
| 14 | `Your beta access code: ${accessCode}` | `betaAccess.accessCodeLabel` | `{accessCode}` | Repeated code |
| 15 | `Direct registration link: ${link}` | `betaAccess.directLinkLabel` | `{link}` | Repeated link |
| 16 | `What to Expect:` | `betaAccess.whatToExpect` | none | Section header |
| 17 | `✨ Early access to all FAQBNB features` | `betaAccess.feature1` | none | With emoji |
| 18 | `📱 QR code generation and management tools` | `betaAccess.feature2` | none | With emoji |
| 19 | `📊 Analytics and insights dashboard` | `betaAccess.feature3` | none | With emoji |
| 20 | `🛠️ Priority support during the beta period` | `betaAccess.feature4` | none | With emoji |
| 21 | `💌 Direct feedback channel...` | `betaAccess.feature5` | none | With emoji |
| 22 | `Important Beta Program Notes:` | `betaAccess.betaNotes` | none | Section header |
| 23 | `Your access code provides full platform access...` | `betaAccess.note1` | none | Note 1 |
| 24 | `As a beta user, your feedback is invaluable...` | `betaAccess.note2` | none | Note 2 |
| 25 | `Some features may be evolving...` | `betaAccess.note3` | none | Note 3 |
| 26 | `Keep your access code secure...` | `betaAccess.note4` | none | Note 4 |
| 27 | `Beta users will receive priority updates...` | `betaAccess.note5` | none | Note 5 |
| 28 | `We're excited to have you as part of...` | `betaAccess.excited` | none | Closing message |
| 29 | `Best regards,` | `common.regards` | none | Via tc() helper |
| 30 | `The FAQBNB Beta Team` | `betaAccess.team` | none | Beta-specific |
| 31 | `🚀 You're part of something special!...` | `betaAccess.footer` | none | With emoji |
| 32 | `For beta support or feedback...` | `betaAccess.footerSupport` | none | Support line |

**Total Keys:** 32 (30 from `betaAccess`, 2 from `common`)
**Emoji Keys:** 8 keys contain emojis (subject, congratulations, feature1-5, footer)

---

## Appendix B: Before/After Code Comparison

### Before (Current Implementation - lines 103-176)

```typescript
/**
 * Generate beta access approval email template
 * For users who signed up through the beta waitlist
 * @param request - Access request data
 * @param accessCode - Generated access code
 * @param accountName - Optional account name
 * @param baseUrl - Optional base URL for links (defaults to getServerBaseUrl())
 */
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
• Beta Access Granted: ${new Date().toLocaleDateString()}
• Original Request: ${formatRequestDate(request.request_date)}

Getting Started with Your Beta Access:
1. Click this direct registration link: ${directRegistrationLink}
   (This link pre-fills your access code and email for convenience)
2. Complete your account registration
3. Start exploring the platform features and capabilities

Your beta access code: ${accessCode}
Direct registration link: ${directRegistrationLink}

What to Expect:
✨ Early access to all FAQBNB features
📱 QR code generation and management tools
📊 Analytics and insights dashboard
🛠️ Priority support during the beta period
💌 Direct feedback channel to influence product development

Important Beta Program Notes:
- Your access code provides full platform access during the beta period
- As a beta user, your feedback is invaluable to us
- Some features may be evolving - please share your experience!
- Keep your access code secure and don't share it with others
- Beta users will receive priority updates on new features

We're excited to have you as part of our exclusive beta community!

Best regards,
The FAQBNB Beta Team

---
🚀 You're part of something special! Thank you for joining our beta program.
For beta support or feedback, please contact us through the platform or reply to this email.`,
    variables: {
      requesterName,
      accountName: accountDisplayName,
      accessCode,
      requestDate: formatRequestDate(request.request_date),
      approvalDate: new Date().toLocaleDateString(),
      registrationLink,
      directRegistrationLink,
      userEmail: request.requester_email
    }
  };
}
```

---

### After (Translation-Based Implementation)

```typescript
/**
 * Generate beta access approval email template
 * For users who signed up through the beta waitlist
 * Uses translations from emails.betaAccess namespace
 * Currently generates English emails only (language parameter added in Task 2I.7)
 *
 * @param request - Access request data
 * @param accessCode - Generated access code
 * @param accountName - Optional account name (defaults to 'the FAQBNB platform')
 * @param baseUrl - Optional base URL for links (defaults to getServerBaseUrl())
 * @returns Email template with subject and body using translations
 *
 * @see Task 2I.1 - Translation namespace structure
 * @see Task 2I.2 - getEmailTranslation utility
 * @see Task 2I.3 - Pattern established for email translation
 * @see Task 2I.7 - Language parameter addition (future)
 */
export function generateBetaAccessApprovalEmail(
  request: AccessRequest,
  accessCode: string,
  accountName?: string,
  baseUrl?: string
  // TODO: Task 2I.7 - Add: language: SupportedLanguage = 'en'
): EmailTemplate {
  const requesterName = request.requester_name || 'there';
  const accountDisplayName = accountName || 'the FAQBNB platform';
  const registrationLink = createRegistrationLink(baseUrl);
  const directRegistrationLink = createRegistrationLinkWithCode(accessCode, request.requester_email, baseUrl);

  // Language constant (defaults to English)
  const language: SupportedLanguage = 'en';
  // TODO: Task 2I.7 - Replace with parameter

  // Helper to translate email content with betaAccess namespace
  const t = (key: string, vars?: Record<string, string | number>) =>
    getEmailTranslation(`betaAccess.${key}`, language, vars);

  // Helper to translate common email content (only for regards)
  const tc = (key: string) =>
    getEmailTranslation(`common.${key}`, language);

  return {
    subject: t('subject'),
    body: `${t('greeting', { name: requesterName })}

${t('congratulations')}

${t('accessDetails')}
• ${t('platform', { accountName: accountDisplayName })}
• ${t('accessCode', { accessCode })}
• ${t('betaAccessGranted', { approvalDate: new Date().toLocaleDateString() })}
• ${t('originalRequest', { requestDate: formatRequestDate(request.request_date) })}

${t('gettingStarted')}
1. ${t('step1', { link: directRegistrationLink })}
   ${t('step1Note')}
2. ${t('step2')}
3. ${t('step3')}

${t('accessCodeLabel', { accessCode })}
${t('directLinkLabel', { link: directRegistrationLink })}

${t('whatToExpect')}
${t('feature1')}
${t('feature2')}
${t('feature3')}
${t('feature4')}
${t('feature5')}

${t('betaNotes')}
- ${t('note1')}
- ${t('note2')}
- ${t('note3')}
- ${t('note4')}
- ${t('note5')}

${t('excited')}

${tc('regards')}
${t('team')}

---
${t('footer')}
${t('footerSupport')}`,
    variables: {
      requesterName,
      accountName: accountDisplayName,
      accessCode,
      requestDate: formatRequestDate(request.request_date),
      approvalDate: new Date().toLocaleDateString(),
      registrationLink,
      directRegistrationLink,
      userEmail: request.requester_email,
      language
    }
  };
}
```

---

**Key Changes Summary:**
1. Updated JSDoc with translation references
2. Added `language` constant (converted to parameter in Task 2I.7)
3. Created `t()` helper for `betaAccess` namespace
4. Created `tc()` helper for `common` namespace (only for regards)
5. Replaced all 32 hardcoded strings with translation calls
6. Preserved all emojis (in translation strings)
7. Used `betaAccess.team` instead of `common.team`
8. Used `betaAccess.footer` instead of `common.footer`
9. Added `language` to variables object
10. Added TODO comments for Task 2I.7
11. Maintained backward compatibility (no signature changes)

---

**End of Document**

*Generated by Technical Lead Agent 02 for Epic 2 L10N - Sub-Epic 2I: Email Templates*
