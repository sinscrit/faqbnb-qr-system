# Implementation Overview: Update `generateAccessApprovalEmail` Function

**Document Created:** 2026-01-23 00:08
**Last Modified:** 2026-01-23 00:08

---

## Header

| Field | Value |
|-------|-------|
| Task Reference | Task 2I.3 (Sub-Epic 2I: Email Templates) |
| Source File | docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md |
| Implementation Plan | Epic 2 - L10N Static UI Translation |
| Original Plan Date | Not specified |
| Breakdown Created | 2026-01-23 00:08 |
| T-shirt Size | Small |
| Estimated Effort | 1.5-2 hours |
| Status | PENDING |

---

## Executive Summary

This task refactors the `generateAccessApprovalEmail()` function in `/src/lib/email-templates.ts` to use the internationalization infrastructure created in Tasks 2I.1 and 2I.2. Currently, the function returns hardcoded English strings. After this task, it will use the `getEmailTranslation()` utility to generate emails in the recipient's preferred language.

**Key Deliverable:** A refactored `generateAccessApprovalEmail()` function that replaces approximately 18-20 hardcoded English strings with translation calls, while maintaining backward compatibility and adding language parameter support.

**Current Function Signature:**
```typescript
function generateAccessApprovalEmail(
  request: AccessRequest,
  accessCode: string,
  accountName?: string,
  baseUrl?: string
): EmailTemplate
```

**Target Function Signature (Task 2I.7 will add language param):**
```typescript
function generateAccessApprovalEmail(
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

1. **Replace all hardcoded strings** in `generateAccessApprovalEmail()` with `getEmailTranslation()` calls
2. **Maintain function signature** temporarily (language parameter added in Task 2I.7)
3. **Use English as default** language for this task (parameter comes later)
4. **Preserve all existing functionality** (beta request routing, variable substitution, link generation)
5. **Update variable mapping** from function locals to translation keys
6. **Maintain backward compatibility** with existing callers
7. **Preserve email structure** exactly (same content, different source)

### Success Criteria

- [ ] All 18-20 hardcoded strings replaced with translation calls
- [ ] Function generates identical English output to current version
- [ ] No breaking changes to function signature or return type
- [ ] All existing test cases pass without modification
- [ ] Translation keys match Task 2I.1 namespace structure
- [ ] Variable interpolation works correctly for all dynamic content
- [ ] Beta request routing still works (delegates to `generateBetaAccessApprovalEmail`)
- [ ] Code follows existing patterns and conventions

### Assumptions & Clarifications

- **Assumption 1:** Language parameter will be added in Task 2I.7; this task uses `'en'` as default
- **Assumption 2:** Translation files from Task 2I.1 are complete and contain all required keys
- **Assumption 3:** `getEmailTranslation()` utility from Task 2I.2 is fully implemented and tested
- **Assumption 4:** Email structure and content remain unchanged; only the source changes
- **Assumption 5:** Existing callers (API route, tests) continue to work without changes
- **Clarification Needed:** Should the function log warnings if translations are missing, or rely on `getEmailTranslation()` fallback?

---

## Technical Context

### Current State

**File:** `/src/lib/email-templates.ts` (546 lines)
**Function:** `generateAccessApprovalEmail()` (lines 19-77, ~59 lines)

**Current Implementation Pattern:**
```typescript
return {
  subject: `Access Granted: ${accountDisplayName} - Your Access Code`,
  body: `Hello ${requesterName},

Great news! Your access request for "${accountDisplayName}" has been approved.
...`,
  variables: { ... }
};
```

**Hardcoded Strings Count:** ~18-20 distinct strings
- 1 subject line
- 1 greeting
- 1 intro paragraph
- 3 "Access Details" section items
- 1 instructions header
- 3 instruction steps
- 1 notes header
- 3 note items
- 1 closing
- 1 team signature
- 1 footer

**Usage Points:**
1. `/src/app/api/admin/access-requests/[requestId]/grant/route.ts` (line 288)
   - Called during access request approval process
   - Provides: `request`, `accessCode`, `accountName`, `baseUrl`
2. `/src/components/EmailPopup.tsx` - Email preview component
3. `/src/__tests__/beta-access-requests.test.ts` - Beta access tests
4. `/src/__tests__/back-office.test.ts` - Back office integration tests

### Architecture Patterns

**Translation Call Pattern (from Task 2I.2):**
```typescript
import { getEmailTranslation } from '@/lib/email-translations';

const text = getEmailTranslation(
  'accessApproval.subject',
  'en',
  { accountName: 'Test' }
);
```

**Current Variable Structure:**
```typescript
variables: {
  requesterName: string,
  accountName: string,
  accessCode: string,
  requestDate: string,
  registrationLink: string,
  directRegistrationLink: string
}
```

**Translation Key Structure (from Task 2I.1):**
```
emails.accessApproval.subject
emails.accessApproval.greeting
emails.accessApproval.intro
emails.accessApproval.accessDetails
emails.accessApproval.account
emails.accessApproval.accessCode
emails.accessApproval.requestedOn
emails.accessApproval.instructions
emails.accessApproval.step1
emails.accessApproval.step2
emails.accessApproval.step3
emails.accessApproval.notes
emails.accessApproval.note1
emails.accessApproval.note2
emails.accessApproval.note3
emails.common.regards
emails.common.team
emails.common.footer
```

---

## Implementation Plan

### Step 1: Add Import for Translation Utility
**Description:** Import `getEmailTranslation` and `SupportedLanguage` at top of file
**Rationale:** Enable translation functionality; prepare for Task 2I.7 language parameter
**Estimated Effort:** 5 minutes (Small)

**Current imports (lines 1-2):**
```typescript
import { AccessRequest, EmailTemplate, AccessRequestSource } from '@/types/admin';
import { getServerBaseUrl } from './config';
```

**Add:**
```typescript
import { getEmailTranslation } from '@/lib/email-translations';
import { SupportedLanguage } from '@/types';
```

**File:** `/src/lib/email-templates.ts`
**Location:** After line 2

### Step 2: Create Translation Helper Constant
**Description:** Define language constant for this task (will become parameter in Task 2I.7)
**Rationale:** Centralize language value; easy to replace with parameter later
**Estimated Effort:** 5 minutes (Small)

**Add at top of function (line ~25):**
```typescript
export function generateAccessApprovalEmail(
  request: AccessRequest,
  accessCode: string,
  accountName?: string,
  baseUrl?: string
): EmailTemplate {
  const language: SupportedLanguage = 'en'; // TODO: Task 2I.7 - convert to parameter

  const requesterName = request.requester_name || 'there';
  const isBetaRequest = request.source === AccessRequestSource.BETA_WAITLIST;
  // ... rest of function
}
```

**Note:** Comment indicates this will become a parameter in Task 2I.7

### Step 3: Create Translation Wrapper Helper
**Description:** Create inline helper function to simplify translation calls
**Rationale:** Reduce repetition; improve code readability; consistent prefix
**Estimated Effort:** 10 minutes (Small)

**Add after language constant:**
```typescript
// Helper to translate email content with accessApproval namespace
const t = (key: string, vars?: Record<string, string | number>) =>
  getEmailTranslation(`accessApproval.${key}`, language, vars);

// Helper for common translations (regards, team, footer)
const tc = (key: string) =>
  getEmailTranslation(`common.${key}`, language);
```

**Usage Example:**
```typescript
// Instead of: getEmailTranslation('accessApproval.subject', 'en', { accountName })
// Use: t('subject', { accountName })

// Instead of: getEmailTranslation('common.footer', 'en')
// Use: tc('footer')
```

### Step 4: Replace Subject Line with Translation
**Description:** Convert subject from template literal to translation call
**Rationale:** First, simplest replacement to establish pattern
**Estimated Effort:** 5 minutes (Small)

**Current (line 38):**
```typescript
subject: `Access Granted: ${accountDisplayName} - Your Access Code`,
```

**Replace with:**
```typescript
subject: t('subject', { accountName: accountDisplayName }),
```

**Translation Key:** `emails.accessApproval.subject`
**Variables:** `{accountName}`

### Step 5: Replace Email Body Greeting
**Description:** Convert greeting line to translation call
**Rationale:** Simple replacement with single variable
**Estimated Effort:** 5 minutes (Small)

**Current (line 39):**
```typescript
body: `Hello ${requesterName},
```

**Replace with:**
```typescript
body: `${t('greeting', { name: requesterName })}
```

**Translation Key:** `emails.accessApproval.greeting`
**Variables:** `{name}`

### Step 6: Replace Intro Paragraph
**Description:** Convert intro paragraph to translation call
**Rationale:** Contains quoted account name variable
**Estimated Effort:** 5 minutes (Small)

**Current (line 41):**
```typescript
Great news! Your access request for "${accountDisplayName}" has been approved.
```

**Replace with:**
```typescript
${t('intro', { accountName: accountDisplayName })}
```

**Translation Key:** `emails.accessApproval.intro`
**Variables:** `{accountName}`

### Step 7: Replace Access Details Section
**Description:** Convert "Your Access Details:" header and 3 detail lines
**Rationale:** Contains multiple variables (accountName, accessCode, date)
**Estimated Effort:** 15 minutes (Small)

**Current (lines 43-46):**
```typescript
Your Access Details:
• Account: ${accountDisplayName}
• Access Code: ${accessCode}
• Requested on: ${formatRequestDate(request.request_date)}
```

**Replace with:**
```typescript
${t('accessDetails')}
• ${t('account', { accountName: accountDisplayName })}
• ${t('accessCode', { accessCode })}
• ${t('requestedOn', { date: formatRequestDate(request.request_date) })}
```

**Translation Keys:**
- `emails.accessApproval.accessDetails` (no variables)
- `emails.accessApproval.account` (variable: `{accountName}`)
- `emails.accessApproval.accessCode` (variable: `{accessCode}`)
- `emails.accessApproval.requestedOn` (variable: `{date}`)

### Step 8: Replace Instructions Section
**Description:** Convert instructions header and 3 numbered steps
**Rationale:** Step 1 contains link variable, steps 2-3 are static
**Estimated Effort:** 15 minutes (Small)

**Current (lines 48-52):**
```typescript
To complete your access setup:
1. Click this direct registration link: ${directRegistrationLink}
   (This link pre-fills your access code and email for convenience)
2. Complete your account registration
3. Start exploring the items and resources
```

**Replace with:**
```typescript
${t('instructions')}
1. ${t('step1', { link: directRegistrationLink })}
   ${t('step1Note')}
2. ${t('step2')}
3. ${t('step3')}
```

**Translation Keys:**
- `emails.accessApproval.instructions` (no variables)
- `emails.accessApproval.step1` (variable: `{link}`)
- `emails.accessApproval.step1Note` (no variables) - NEW key for note text
- `emails.accessApproval.step2` (no variables)
- `emails.accessApproval.step3` (no variables)

**Note:** The "(This link pre-fills...)" text should be a separate translation key for proper translation

### Step 9: Replace Repeated Access Code and Link Lines
**Description:** Convert repeated access code display lines (lines 54-55)
**Rationale:** These lines repeat information; should use same translation keys
**Estimated Effort:** 5 minutes (Small)

**Current (lines 54-55):**
```typescript
Your access code: ${accessCode}
Direct registration link: ${directRegistrationLink}
```

**Replace with:**
```typescript
${t('accessCodeLabel', { accessCode })}
${t('directLinkLabel', { link: directRegistrationLink })}
```

**Translation Keys:**
- `emails.accessApproval.accessCodeLabel` (variable: `{accessCode}`)
- `emails.accessApproval.directLinkLabel` (variable: `{link}`)

**Note:** These keys may need to be added to Task 2I.1 structure if not already present

### Step 10: Replace Important Notes Section
**Description:** Convert notes header and 3 bullet points
**Rationale:** All static text, no variables
**Estimated Effort:** 10 minutes (Small)

**Current (lines 57-60):**
```typescript
Important Notes:
- Keep your access code secure and don't share it with others
- Your access code will remain valid until you complete registration
- If you have any questions, please contact the account owner
```

**Replace with:**
```typescript
${t('notes')}
- ${t('note1')}
- ${t('note2')}
- ${t('note3')}
```

**Translation Keys:**
- `emails.accessApproval.notes` (no variables)
- `emails.accessApproval.note1` (no variables)
- `emails.accessApproval.note2` (no variables)
- `emails.accessApproval.note3` (no variables)

### Step 11: Replace Closing, Team Signature, and Footer
**Description:** Convert closing lines using common translations
**Rationale:** Shared across all email templates; use `common` namespace
**Estimated Effort:** 10 minutes (Small)

**Current (lines 62-67):**
```typescript
Best regards,
The FAQBNB Team

---
This is an automated message. Please do not reply to this email.
If you need assistance, please contact support through the FAQBNB platform.
```

**Replace with:**
```typescript
${tc('regards')}
${tc('team')}

---
${tc('footer')}
${tc('footerSupport')}
```

**Translation Keys:**
- `emails.common.regards` (no variables)
- `emails.common.team` (no variables)
- `emails.common.footer` (no variables)
- `emails.common.footerSupport` (no variables) - NEW key for support line

**Note:** Check if `footerSupport` key exists in Task 2I.1 structure; may need to be added

### Step 12: Update JSDoc Comments
**Description:** Update function documentation to reflect translation usage
**Rationale:** Keep documentation accurate and helpful
**Estimated Effort:** 10 minutes (Small)

**Current JSDoc (lines 12-18):**
```typescript
/**
 * Generate access approval email template
 * @param request - Access request data
 * @param accessCode - Generated access code
 * @param accountName - Optional account name
 * @param baseUrl - Optional base URL for links (defaults to getServerBaseUrl())
 */
```

**Update to:**
```typescript
/**
 * Generate access approval email template
 * Uses translations from emails.accessApproval namespace
 * Currently generates English emails only (language parameter added in Task 2I.7)
 *
 * @param request - Access request data
 * @param accessCode - Generated access code
 * @param accountName - Optional account name (defaults to 'Account')
 * @param baseUrl - Optional base URL for links (defaults to getServerBaseUrl())
 * @returns Email template with subject and body using translations
 *
 * @see Task 2I.1 - Translation namespace structure
 * @see Task 2I.2 - getEmailTranslation utility
 * @see Task 2I.7 - Language parameter addition (future)
 */
```

### Step 13: Verify and Clean Up Variables Object
**Description:** Ensure variables object is still populated correctly for backward compatibility
**Rationale:** Existing code may depend on this object for email rendering or testing
**Estimated Effort:** 10 minutes (Small)

**Current variables object (lines 68-76):**
```typescript
variables: {
  requesterName,
  accountName: accountDisplayName,
  accessCode,
  requestDate: formatRequestDate(request.request_date),
  registrationLink,
  directRegistrationLink
}
```

**Keep as-is or update to match new usage:**
```typescript
variables: {
  requesterName,
  accountName: accountDisplayName,
  accessCode,
  requestDate: formatRequestDate(request.request_date),
  registrationLink,
  directRegistrationLink,
  language // Add language for debugging/logging
}
```

**Decision:** Keep existing variables for backward compatibility

### Step 14: Add Inline Comments for Future Task References
**Description:** Add TODO comments marking areas for Task 2I.7
**Rationale:** Helps next task identify what needs to change
**Estimated Effort:** 5 minutes (Small)

**Add comments:**
```typescript
export function generateAccessApprovalEmail(
  request: AccessRequest,
  accessCode: string,
  accountName?: string,
  baseUrl?: string
  // TODO: Task 2I.7 - Add: language: SupportedLanguage = 'en'
): EmailTemplate {
  const language: SupportedLanguage = 'en'; // TODO: Task 2I.7 - Replace with parameter
  // ... rest of function
}
```

### Step 15: Test with Existing Test Suite
**Description:** Run existing tests to ensure no breaking changes
**Rationale:** Verify backward compatibility before committing
**Estimated Effort:** 15 minutes (Medium)

**Test Files to Run:**
- `/src/__tests__/beta-access-requests.test.ts`
- `/src/__tests__/back-office.test.ts`
- Any email-related integration tests

**Expected Results:**
- All tests pass without modification
- Email output matches previous English output
- Function signature unchanged (no breaking changes)

**If tests fail:**
- Check translation key mapping
- Verify variable names match
- Ensure formatting (newlines, spacing) is preserved

---

## Authorized Files and Functions for Modification

> ⚠️ **APPROVED SCOPE**: Changes outside this list require review

### Primary File (MODIFY)

| File | Target | Type | Lines Modified | Purpose |
|------|--------|------|----------------|---------|
| `/src/lib/email-templates.ts` | `generateAccessApprovalEmail()` | Modify | 19-77 (~59 lines) | Replace hardcoded strings with translation calls |
| `/src/lib/email-templates.ts` | Imports section | Extend | 1-2 | Add translation utility imports |
| `/src/lib/email-templates.ts` | JSDoc comments | Update | 12-18 | Update documentation |

### Files NOT Modified (Dependencies)

| File | Task | Reason |
|------|------|--------|
| `/src/lib/email-translations.ts` | Task 2I.2 | Translation utility already implemented |
| `/messages/*.json` | Task 2I.1 | Translation files already created |
| `/src/app/api/admin/access-requests/[requestId]/grant/route.ts` | N/A | Caller unchanged (no signature change) |
| `/src/components/EmailPopup.tsx` | N/A | Consumer unchanged |
| `/src/__tests__/*.test.ts` | N/A | Tests should pass without changes |

### Files Modified in Later Tasks

| File | Task | Change |
|------|------|--------|
| `/src/lib/email-templates.ts` | Task 2I.7 | Add `language` parameter to function signature |

---

## Dependencies

### Depends On (Completed First)

- **REQ-E02-019** (Task 2I.1): Create `emails` namespace and translation structure
  - **What it provides:** Translation files with `emails.accessApproval.*` keys
  - **Why critical:** Cannot call `getEmailTranslation()` without translation keys existing
  - **Specific keys needed:** All 18-20 keys listed in implementation plan

- **REQ-E02-020** (Task 2I.2): Create `getEmailTranslation` utility function
  - **What it provides:** `getEmailTranslation()` function to call
  - **Why critical:** Core translation mechanism; this task's primary dependency
  - **Required API:** `getEmailTranslation(key, language, variables?): string`

### Blocks (Requires This First)

- **REQ-E02-025** (Task 2I.7): Add language parameter to all email generation functions
  - **What we provide:** Refactored function body using translations with placeholder language constant
  - **Blocking reason:** Task 2I.7 converts `const language = 'en'` to parameter; needs refactored body first
  - **Sequential dependency:** Task 2I.7 is simpler if this task completes first

- **REQ-E02-026** (Task 2I.8): Generate translations for 5 non-English languages
  - **What we provide:** Validated English translation key usage
  - **Blocking reason:** Ensures all translation keys work before translating them
  - **Best practice:** Verify English works before spending effort on translations

### Parallel Safety

**Files touched by this task:**
- `/src/lib/email-templates.ts` (lines 1-2, 12-18, 19-77)

**Conflicts with:**
- **Task 2I.4** (Update `generateAccessDenialEmail`) - Different function, same file
  - **Risk:** Medium - Both modify same file
  - **Mitigation:** Sequential execution recommended

- **Task 2I.5** (Update `generateBetaAccessApprovalEmail`) - Different function, same file
  - **Risk:** Medium - Both modify same file
  - **Mitigation:** Sequential execution recommended

- **Task 2I.6** (Update `generateRegistrationReminderEmail`) - Different function, same file
  - **Risk:** Medium - Both modify same file
  - **Mitigation:** Sequential execution recommended

**Safe to parallelize with:**
- **Task 2I.8** (Generate non-English translations) - Different files (`/messages/*.json`)
- **Any Epic 2 tasks from other sub-epics** - No file overlap

**Recommendation:** Run Tasks 2I.3, 2I.4, 2I.5, 2I.6 SEQUENTIALLY due to shared file modification

### External Dependencies

**Runtime Dependencies:**
- Translation utility: `/src/lib/email-translations.ts`
- Translation files: `/messages/en.json` (specifically `emails.accessApproval.*` keys)
- Type definitions: `SupportedLanguage` from `/src/types`

**Build-Time Dependencies:**
- TypeScript compiler for type checking
- ESLint for code quality

**Testing Dependencies:**
- Jest/Vitest test framework
- Existing test suites for email generation

---

## Risks and Considerations

### Potential Side Effects

1. **Translation Key Mismatches:**
   - **Risk:** Translation keys don't match Task 2I.1 namespace structure
   - **Impact:** Missing translations, fallback to keys displayed in emails
   - **Mitigation:** Cross-reference Task 2I.1 Appendix A mapping table
   - **Severity:** High

2. **Variable Name Mismatches:**
   - **Risk:** Variable names in translation calls don't match translation placeholders
   - **Impact:** Variables not interpolated, `{placeholder}` shown in email
   - **Mitigation:** Verify variable names match Task 2I.1 documentation
   - **Severity:** High

3. **Formatting Changes:**
   - **Risk:** Translation-based assembly changes email formatting (spacing, newlines)
   - **Impact:** Emails look different from current version
   - **Mitigation:** Carefully preserve whitespace and formatting in string assembly
   - **Severity:** Medium

4. **Performance Degradation:**
   - **Risk:** Translation lookup adds latency to email generation
   - **Impact:** Slower email generation
   - **Mitigation:** Task 2I.2 caching should minimize impact (<1ms per call)
   - **Severity:** Low

5. **Beta Request Routing:**
   - **Risk:** Beta request detection breaks due to refactoring
   - **Impact:** Beta users receive wrong email template
   - **Mitigation:** Preserve existing `if (isBetaRequest)` logic exactly
   - **Severity:** Medium

6. **Backward Compatibility:**
   - **Risk:** Existing callers break due to unexpected changes
   - **Impact:** API route errors, test failures
   - **Mitigation:** No signature changes; comprehensive testing
   - **Severity:** High

### Testing Requirements

**Unit Tests:**
- [ ] Function generates valid EmailTemplate object
- [ ] Subject contains expected text and variables
- [ ] Body contains all expected sections
- [ ] Variables object populated correctly
- [ ] Beta requests still route to `generateBetaAccessApprovalEmail`
- [ ] All translation calls use correct keys
- [ ] Variable interpolation works for all dynamic content

**Integration Tests:**
- [ ] API route `/api/admin/access-requests/[requestId]/grant` still works
- [ ] Email sending succeeds with new template
- [ ] EmailPopup component displays email correctly
- [ ] Existing back-office tests pass

**Manual Testing:**
- [ ] Generate sample access approval email
- [ ] Verify output matches current English version exactly
- [ ] Check formatting (spacing, newlines, bullet points)
- [ ] Verify all variables replaced correctly
- [ ] Test with missing account name (default "Account")
- [ ] Test with beta request (routes to beta email)

**QA Checklist:**
- [ ] All existing tests pass without modification
- [ ] No ESLint warnings or errors
- [ ] TypeScript compiles without errors
- [ ] Function generates identical English output
- [ ] No breaking changes to function signature
- [ ] JSDoc comments updated and accurate
- [ ] Code follows existing file conventions
- [ ] Git commit message follows pattern: "[REQ-E02-021] Update generateAccessApprovalEmail function"

### Open Questions

- [ ] **Q1:** Should we add new translation keys for sub-elements (e.g., `step1Note`, `accessCodeLabel`)?
  - **Current state:** Task 2I.1 may not include all granular keys
  - **Options:**
    - A) Add new keys to translation files as needed
    - B) Combine text elements to match existing keys
    - C) Update Task 2I.1 to include additional keys
  - **Recommendation:** Option A - Add keys as discovered during implementation
  - **Action Required:** Document new keys for Task 2I.8 translation

- [ ] **Q2:** Should the `variables` object in the return value be updated or kept as-is?
  - **Current:** Contains all interpolation variables
  - **Options:**
    - A) Keep existing structure for backward compatibility
    - B) Add `language` field for debugging
    - C) Remove variables (not used after translation)
  - **Recommendation:** Option A - Preserve for compatibility

- [ ] **Q3:** How should we handle the support line in footer (second footer line)?
  - **Current:** "If you need assistance, please contact support through the FAQBNB platform."
  - **Issue:** Not documented in Task 2I.1 common namespace
  - **Options:**
    - A) Add `emails.common.footerSupport` key
    - B) Combine with main footer as single key
    - C) Make it part of `accessApproval` namespace
  - **Recommendation:** Option A - Add to common namespace for reuse

- [ ] **Q4:** Should we preserve the exact formatting (newlines, spacing) or can translations define structure?
  - **Current:** Hardcoded newlines and spacing
  - **Recommendation:** Preserve existing structure for consistency; translations contain text only

---

## Out of Scope

**Explicitly NOT included in this task:**

1. **Adding language parameter** to function signature - Task 2I.7
2. **Updating function callers** to pass language - Task 2I.7
3. **Translating to non-English languages** - Task 2I.8
4. **Updating other email functions** - Tasks 2I.4, 2I.5, 2I.6
5. **Testing email generation in multiple languages** - Task 2I.9
6. **Modifying HTML email rendering** - Out of scope for Epic 2
7. **Changing email content or structure** - Only translation, not redesign
8. **Updating EmailTemplate type definition** - No changes needed
9. **Modifying email sending logic** - `/src/lib/email-service.ts` unchanged
10. **Database schema changes** - No DB changes required
11. **Adding new email templates** - Only refactoring existing template
12. **Locale detection logic** - Handled by caller in Task 2I.7

---

## Success Metrics

### Quantitative Metrics

1. **String Replacement Count:** 18-20 hardcoded strings replaced with translation calls
2. **Test Pass Rate:** 100% of existing tests pass without modification
3. **Lines Changed:** ~60 lines modified (function body refactoring)
4. **Translation Keys Used:** 18-20 unique keys from `emails.accessApproval.*` namespace
5. **Build Errors:** 0 TypeScript compilation errors
6. **Lint Warnings:** 0 ESLint warnings

### Qualitative Metrics

1. **Code Readability:** Translation calls are clear and maintainable
2. **Backward Compatibility:** No breaking changes to function behavior
3. **Output Consistency:** Generated emails identical to current English version
4. **Documentation Quality:** JSDoc comments accurate and helpful
5. **Code Review Approval:** Technical lead approves implementation

### Acceptance Criteria

**Task is complete when:**
- ✅ All hardcoded strings replaced with `getEmailTranslation()` calls
- ✅ Function generates identical English email output to current version
- ✅ Translation helper functions (`t` and `tc`) implemented
- ✅ All existing test suites pass without modification
- ✅ No changes to function signature (maintains backward compatibility)
- ✅ JSDoc comments updated with translation references
- ✅ Beta request routing preserved and functional
- ✅ Variables object maintained for backward compatibility
- ✅ TypeScript compiles without errors
- ✅ ESLint passes without warnings
- ✅ Code review approved
- ✅ Git commit created: "[REQ-E02-021] Update generateAccessApprovalEmail function"

---

## Implementation Notes

### Key Design Decisions

1. **Translation Helper Functions:**
   - **Decision:** Create inline `t()` and `tc()` helpers
   - **Rationale:** Reduces repetition, improves readability, consistent namespace prefix
   - **Trade-off:** Additional lines of code vs cleaner translation calls

2. **Language Constant:**
   - **Decision:** Use `const language = 'en'` placeholder
   - **Rationale:** Prepares for Task 2I.7 parameter; minimal refactoring needed later
   - **Trade-off:** Extra variable vs easier future conversion

3. **Preserve Variables Object:**
   - **Decision:** Keep existing `variables` object unchanged
   - **Rationale:** Backward compatibility; may be used by consumers
   - **Trade-off:** Redundant data vs compatibility guarantee

4. **Sequential String Assembly:**
   - **Decision:** Maintain string concatenation structure
   - **Rationale:** Preserves formatting exactly; predictable output
   - **Trade-off:** More complex code vs guaranteed identical output

5. **No Caller Changes:**
   - **Decision:** No changes to function signature or callers
   - **Rationale:** Minimize blast radius; isolate changes to this function
   - **Trade-off:** Task 2I.7 will need to update callers vs doing it all at once

### Alternative Approaches Considered

**Alternative 1: Add language parameter immediately (combine with Task 2I.7)**
- **Pros:** One-time refactoring, fewer tasks
- **Cons:** Larger change scope, more risk, requires updating all callers immediately
- **Decision:** Rejected - Incremental approach is safer

**Alternative 2: Use template literal tags for translations**
- **Example:** ``email`accessApproval.subject ${{accountName}}` ``
- **Pros:** More DSL-like, type-safe variables
- **Cons:** Unusual syntax, requires custom implementation
- **Decision:** Rejected - Function call syntax is clearer

**Alternative 3: Load all translations into object, destructure keys**
- **Example:** `const { subject, greeting, intro } = loadAccessApprovalTranslations('en');`
- **Pros:** All keys in one place, autocomplete friendly
- **Cons:** More memory, less flexible, couples to structure
- **Decision:** Rejected - Individual calls are more flexible

**Alternative 4: Create dedicated email builder class**
- **Example:** `new AccessApprovalEmailBuilder(language).build(request, accessCode)`
- **Pros:** More OOP, easier to test, better encapsulation
- **Cons:** Over-engineering for simple use case, breaks existing patterns
- **Decision:** Rejected - Functional approach matches existing codebase

---

## Appendix A: Translation Key Mapping Reference

### Complete Access Approval Email Translation Keys

| # | Current String | Translation Key | Variables | Notes |
|---|----------------|-----------------|-----------|-------|
| 1 | `Access Granted: ${accountDisplayName} - Your Access Code` | `accessApproval.subject` | `{accountName}` | Subject line |
| 2 | `Hello ${requesterName},` | `accessApproval.greeting` | `{name}` | Opening greeting |
| 3 | `Great news! Your access request for "${accountDisplayName}" has been approved.` | `accessApproval.intro` | `{accountName}` | Intro paragraph |
| 4 | `Your Access Details:` | `accessApproval.accessDetails` | none | Section header |
| 5 | `Account: ${accountDisplayName}` | `accessApproval.account` | `{accountName}` | Detail line 1 |
| 6 | `Access Code: ${accessCode}` | `accessApproval.accessCode` | `{accessCode}` | Detail line 2 |
| 7 | `Requested on: ${formatRequestDate(...)}` | `accessApproval.requestedOn` | `{date}` | Detail line 3 |
| 8 | `To complete your access setup:` | `accessApproval.instructions` | none | Instructions header |
| 9 | `Click this direct registration link: ${directRegistrationLink}` | `accessApproval.step1` | `{link}` | Step 1 |
| 10 | `(This link pre-fills your access code and email for convenience)` | `accessApproval.step1Note` | none | Step 1 note - NEW KEY |
| 11 | `Complete your account registration` | `accessApproval.step2` | none | Step 2 |
| 12 | `Start exploring the items and resources` | `accessApproval.step3` | none | Step 3 |
| 13 | `Your access code: ${accessCode}` | `accessApproval.accessCodeLabel` | `{accessCode}` | Repeated code - NEW KEY |
| 14 | `Direct registration link: ${directRegistrationLink}` | `accessApproval.directLinkLabel` | `{link}` | Repeated link - NEW KEY |
| 15 | `Important Notes:` | `accessApproval.notes` | none | Notes header |
| 16 | `Keep your access code secure and don't share it with others` | `accessApproval.note1` | none | Note 1 |
| 17 | `Your access code will remain valid until you complete registration` | `accessApproval.note2` | none | Note 2 |
| 18 | `If you have any questions, please contact the account owner` | `accessApproval.note3` | none | Note 3 |
| 19 | `Best regards,` | `common.regards` | none | Closing |
| 20 | `The FAQBNB Team` | `common.team` | none | Team signature |
| 21 | `This is an automated message. Please do not reply to this email.` | `common.footer` | none | Footer line 1 |
| 22 | `If you need assistance, please contact support through the FAQBNB platform.` | `common.footerSupport` | none | Footer line 2 - NEW KEY |

**Total Keys:** 22 (19 from `accessApproval`, 3 from `common`)
**New Keys Required:** 4 (step1Note, accessCodeLabel, directLinkLabel, footerSupport)

---

## Appendix B: Before/After Code Comparison

### Before (Current Implementation)

```typescript
export function generateAccessApprovalEmail(
  request: AccessRequest,
  accessCode: string,
  accountName?: string,
  baseUrl?: string
): EmailTemplate {
  const requesterName = request.requester_name || 'there';
  const isBetaRequest = request.source === AccessRequestSource.BETA_WAITLIST;

  if (isBetaRequest) {
    return generateBetaAccessApprovalEmail(request, accessCode, accountName, baseUrl);
  }

  const accountDisplayName = accountName || 'Account';
  const registrationLink = createRegistrationLink(baseUrl);
  const directRegistrationLink = createRegistrationLinkWithCode(accessCode, request.requester_email, baseUrl);

  return {
    subject: `Access Granted: ${accountDisplayName} - Your Access Code`,
    body: `Hello ${requesterName},

Great news! Your access request for "${accountDisplayName}" has been approved.

Your Access Details:
• Account: ${accountDisplayName}
• Access Code: ${accessCode}
• Requested on: ${formatRequestDate(request.request_date)}

To complete your access setup:
1. Click this direct registration link: ${directRegistrationLink}
   (This link pre-fills your access code and email for convenience)
2. Complete your account registration
3. Start exploring the items and resources

Your access code: ${accessCode}
Direct registration link: ${directRegistrationLink}

Important Notes:
- Keep your access code secure and don't share it with others
- Your access code will remain valid until you complete registration
- If you have any questions, please contact the account owner

Best regards,
The FAQBNB Team

---
This is an automated message. Please do not reply to this email.
If you need assistance, please contact support through the FAQBNB platform.`,
    variables: {
      requesterName,
      accountName: accountDisplayName,
      accessCode,
      requestDate: formatRequestDate(request.request_date),
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
 * Generate access approval email template
 * Uses translations from emails.accessApproval namespace
 * Currently generates English emails only (language parameter added in Task 2I.7)
 *
 * @param request - Access request data
 * @param accessCode - Generated access code
 * @param accountName - Optional account name (defaults to 'Account')
 * @param baseUrl - Optional base URL for links (defaults to getServerBaseUrl())
 * @returns Email template with subject and body using translations
 *
 * @see Task 2I.1 - Translation namespace structure
 * @see Task 2I.2 - getEmailTranslation utility
 * @see Task 2I.7 - Language parameter addition (future)
 */
export function generateAccessApprovalEmail(
  request: AccessRequest,
  accessCode: string,
  accountName?: string,
  baseUrl?: string
  // TODO: Task 2I.7 - Add: language: SupportedLanguage = 'en'
): EmailTemplate {
  const language: SupportedLanguage = 'en'; // TODO: Task 2I.7 - Replace with parameter

  // Helper to translate email content with accessApproval namespace
  const t = (key: string, vars?: Record<string, string | number>) =>
    getEmailTranslation(`accessApproval.${key}`, language, vars);

  // Helper for common translations (regards, team, footer)
  const tc = (key: string) =>
    getEmailTranslation(`common.${key}`, language);

  const requesterName = request.requester_name || 'there';
  const isBetaRequest = request.source === AccessRequestSource.BETA_WAITLIST;

  // Handle beta requests differently (unchanged)
  if (isBetaRequest) {
    return generateBetaAccessApprovalEmail(request, accessCode, accountName, baseUrl);
  }

  const accountDisplayName = accountName || 'Account';
  const registrationLink = createRegistrationLink(baseUrl);
  const directRegistrationLink = createRegistrationLinkWithCode(accessCode, request.requester_email, baseUrl);

  return {
    subject: t('subject', { accountName: accountDisplayName }),
    body: `${t('greeting', { name: requesterName })}

${t('intro', { accountName: accountDisplayName })}

${t('accessDetails')}
• ${t('account', { accountName: accountDisplayName })}
• ${t('accessCode', { accessCode })}
• ${t('requestedOn', { date: formatRequestDate(request.request_date) })}

${t('instructions')}
1. ${t('step1', { link: directRegistrationLink })}
   ${t('step1Note')}
2. ${t('step2')}
3. ${t('step3')}

${t('accessCodeLabel', { accessCode })}
${t('directLinkLabel', { link: directRegistrationLink })}

${t('notes')}
- ${t('note1')}
- ${t('note2')}
- ${t('note3')}

${tc('regards')}
${tc('team')}

---
${tc('footer')}
${tc('footerSupport')}`,
    variables: {
      requesterName,
      accountName: accountDisplayName,
      accessCode,
      requestDate: formatRequestDate(request.request_date),
      registrationLink,
      directRegistrationLink
    }
  };
}
```

---

**Key Changes Summary:**
1. Added imports for `getEmailTranslation` and `SupportedLanguage`
2. Added `language` constant (converted to parameter in Task 2I.7)
3. Created `t()` and `tc()` translation helper functions
4. Replaced all 22 hardcoded strings with translation calls
5. Updated JSDoc comments with translation references
6. Added TODO comments for Task 2I.7
7. Preserved all existing functionality (beta routing, variables object, link generation)

---

**End of Document**

*Generated by Technical Lead Agent 02 for Epic 2 L10N - Sub-Epic 2I: Email Templates*
