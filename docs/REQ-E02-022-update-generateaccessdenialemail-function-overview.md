# Implementation Overview: Update `generateAccessDenialEmail` Function

**Document Created:** 2026-01-23 00:43
**Last Modified:** 2026-01-23 00:43

---

## Header

| Field | Value |
|-------|-------|
| Task Reference | Task 2I.4 (Sub-Epic 2I: Email Templates) |
| Source File | docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md |
| Implementation Plan | Epic 2 - L10N Static UI Translation |
| Original Plan Date | Not specified |
| Breakdown Created | 2026-01-23 00:43 |
| T-shirt Size | Small |
| Estimated Effort | 1-1.5 hours |
| Status | PENDING |

---

## Executive Summary

This task refactors the `generateAccessDenialEmail()` function in `/src/lib/email-templates.ts` to use the internationalization infrastructure created in Tasks 2I.1 and 2I.2. Following the same pattern established in Task 2I.3 for `generateAccessApprovalEmail()`, this function will be converted from hardcoded English strings to translation-based content generation.

**Key Deliverable:** A refactored `generateAccessDenialEmail()` function that replaces approximately 10-11 hardcoded English strings with translation calls, maintaining backward compatibility while preparing for multi-language email support.

**Current Function Signature:**
```typescript
function generateAccessDenialEmail(
  request: AccessRequest,
  reason?: string,
  accountName?: string
): EmailTemplate
```

**Target Function Signature (Task 2I.7 will add language param):**
```typescript
function generateAccessDenialEmail(
  request: AccessRequest,
  reason?: string,
  accountName?: string,
  language?: SupportedLanguage  // Added in Task 2I.7
): EmailTemplate
```

---

## Goals

### Primary Objectives

1. **Replace all hardcoded strings** in `generateAccessDenialEmail()` with `getEmailTranslation()` calls
2. **Follow Task 2I.3 pattern** for consistency (helper functions, language constant, structure)
3. **Use English as default** language for this task (parameter added in Task 2I.7)
4. **Preserve all existing functionality** (optional reason display, variable substitution)
5. **Maintain function signature** temporarily (no breaking changes)
6. **Handle conditional reason display** correctly with translations
7. **Maintain backward compatibility** with any existing callers

### Success Criteria

- [ ] All 10-11 hardcoded strings replaced with translation calls
- [ ] Function generates identical English output to current version
- [ ] Conditional reason display logic preserved
- [ ] Helper functions (`t()` and `tc()`) implemented like Task 2I.3
- [ ] No breaking changes to function signature or return type
- [ ] Translation keys match Task 2I.1 namespace structure
- [ ] Variable interpolation works correctly for all dynamic content
- [ ] Code follows Task 2I.3 pattern for consistency

### Assumptions & Clarifications

- **Assumption 1:** Language parameter added in Task 2I.7; this task uses `'en'` as default
- **Assumption 2:** Translation files from Task 2I.1 contain all required `accessDenial.*` keys
- **Assumption 3:** `getEmailTranslation()` utility from Task 2I.2 is fully functional
- **Assumption 4:** Task 2I.3 pattern (helper functions, structure) should be followed exactly
- **Assumption 5:** Optional `reason` parameter handling remains unchanged
- **Clarification Needed:** Should empty reason case display nothing or a default message?

---

## Technical Context

### Current State

**File:** `/src/lib/email-templates.ts` (546 lines)
**Function:** `generateAccessDenialEmail()` (lines 332-368, ~37 lines)

**Current Implementation Pattern:**
```typescript
export function generateAccessDenialEmail(
  request: AccessRequest,
  reason?: string,
  accountName?: string
): EmailTemplate {
  const requesterName = request.requester_name || 'there';
  const accountDisplayName = accountName || 'Account';

  return {
    subject: `Access Request Update: ${accountDisplayName}`,
    body: `Hello ${requesterName},

Thank you for your interest in accessing "${accountDisplayName}".

Unfortunately, we're unable to approve your access request at this time.

${reason ? `Reason: ${reason}` : ''}

Request Details:
• Account: ${accountDisplayName}
• Requested on: ${formatRequestDate(request.request_date)}

If you believe this is an error or have questions about this decision, please contact the account owner directly.

Best regards,
The FAQBNB Team

---
This is an automated message. Please do not reply to this email.`,
    variables: {
      requesterName,
      accountName: accountDisplayName,
      reason: reason || '',
      requestDate: formatRequestDate(request.request_date)
    }
  };
}
```

**Hardcoded Strings Count:** ~10-11 distinct strings
- 1 subject line
- 1 greeting
- 1 intro (thank you message)
- 1 denial message
- 1 reason line (conditional)
- 1 request details header
- 2 detail lines (account, date)
- 1 contact message
- 1 closing + team + footer (3 lines, using `common` namespace)

**Usage Points:**
- Currently no direct usage found in codebase (likely used via admin back-office routes)
- Part of email template system for access request management
- Called when access requests are denied

### Architecture Patterns

**Task 2I.3 Pattern (Already Implemented):**
```typescript
// Language constant
const language: SupportedLanguage = 'en';
// TODO: Task 2I.7 - Replace with parameter

// Helper to translate email content with namespace
const t = (key: string, vars?: Record<string, string | number>) =>
  getEmailTranslation(`accessApproval.${key}`, language, vars);

// Helper to translate common email content
const tc = (key: string) =>
  getEmailTranslation(`common.${key}`, language);

return {
  subject: t('subject', { accountName }),
  body: `${t('greeting', { name })} ... ${tc('footer')}`
};
```

**Translation Key Structure (from Task 2I.1):**
```
emails.accessDenial.subject
emails.accessDenial.greeting
emails.accessDenial.intro
emails.accessDenial.message
emails.accessDenial.reason
emails.accessDenial.requestDetails
emails.accessDenial.account
emails.accessDenial.requestedOn
emails.accessDenial.contact
emails.common.regards
emails.common.team
emails.common.footer
```

**Key Challenge:** Conditional reason display
```typescript
// Current: ${reason ? `Reason: ${reason}` : ''}
// Target: ${reason ? t('reason', { reason }) : ''}
```

---

## Implementation Plan

### Step 1: Update JSDoc Comments
**Description:** Update function documentation to reflect translation usage
**Rationale:** Start with documentation; establish context before code changes
**Estimated Effort:** 5 minutes (Small)

**Current JSDoc (line 329-331):**
```typescript
/**
 * Generate access denial email template
 */
```

**Update to:**
```typescript
/**
 * Generate access denial email template
 * Uses translations from emails.accessDenial namespace
 * Currently generates English emails only (language parameter added in Task 2I.7)
 *
 * @param request - Access request data
 * @param reason - Optional denial reason to include in email
 * @param accountName - Optional account name (defaults to 'Account')
 * @returns Email template with subject and body using translations
 *
 * @see Task 2I.1 - Translation namespace structure
 * @see Task 2I.2 - getEmailTranslation utility
 * @see Task 2I.3 - Pattern established for email translation
 * @see Task 2I.7 - Language parameter addition (future)
 */
```

### Step 2: Add Language Constant and Helper Functions
**Description:** Add language constant and translation helper functions following Task 2I.3 pattern
**Rationale:** Establish translation infrastructure using proven pattern
**Estimated Effort:** 10 minutes (Small)

**Add after variable initialization (after line 338):**
```typescript
export function generateAccessDenialEmail(
  request: AccessRequest,
  reason?: string,
  accountName?: string
  // TODO: Task 2I.7 - Add: language: SupportedLanguage = 'en'
): EmailTemplate {
  const requesterName = request.requester_name || 'there';
  const accountDisplayName = accountName || 'Account';

  // Language constant (defaults to English)
  const language: SupportedLanguage = 'en';
  // TODO: Task 2I.7 - Replace with parameter

  // Helper to translate email content with accessDenial namespace
  const t = (key: string, vars?: Record<string, string | number>) =>
    getEmailTranslation(`accessDenial.${key}`, language, vars);

  // Helper to translate common email content
  const tc = (key: string) =>
    getEmailTranslation(`common.${key}`, language);

  return {
    // ... rest of function
  };
}
```

**Note:** Helpers use `accessDenial` namespace prefix (not `accessApproval`)

### Step 3: Replace Subject Line
**Description:** Convert subject from template literal to translation call
**Rationale:** Simple first replacement to establish pattern
**Estimated Effort:** 5 minutes (Small)

**Current (line 341):**
```typescript
subject: `Access Request Update: ${accountDisplayName}`,
```

**Replace with:**
```typescript
subject: t('subject', { accountName: accountDisplayName }),
```

**Translation Key:** `emails.accessDenial.subject`
**Variables:** `{accountName}`

### Step 4: Replace Greeting
**Description:** Convert greeting line to translation call
**Rationale:** Single variable, straightforward replacement
**Estimated Effort:** 5 minutes (Small)

**Current (line 342):**
```typescript
body: `Hello ${requesterName},
```

**Replace with:**
```typescript
body: `${t('greeting', { name: requesterName })}
```

**Translation Key:** `emails.accessDenial.greeting`
**Variables:** `{name}`

### Step 5: Replace Intro Paragraph
**Description:** Convert thank you message to translation call
**Rationale:** Contains quoted account name variable
**Estimated Effort:** 5 minutes (Small)

**Current (line 344):**
```typescript
Thank you for your interest in accessing "${accountDisplayName}".
```

**Replace with:**
```typescript
${t('intro', { accountName: accountDisplayName })}
```

**Translation Key:** `emails.accessDenial.intro`
**Variables:** `{accountName}`

### Step 6: Replace Denial Message
**Description:** Convert denial message to translation call
**Rationale:** Static text, no variables
**Estimated Effort:** 5 minutes (Small)

**Current (line 346):**
```typescript
Unfortunately, we're unable to approve your access request at this time.
```

**Replace with:**
```typescript
${t('message')}
```

**Translation Key:** `emails.accessDenial.message`
**Variables:** none

### Step 7: Replace Conditional Reason Line
**Description:** Convert optional reason display to translation call
**Rationale:** Preserves conditional logic while using translation
**Estimated Effort:** 10 minutes (Small)

**Current (line 348):**
```typescript
${reason ? `Reason: ${reason}` : ''}
```

**Replace with:**
```typescript
${reason ? t('reason', { reason }) : ''}
```

**Translation Key:** `emails.accessDenial.reason`
**Variables:** `{reason}`

**Important:** Conditional logic preserved; empty string when no reason provided

### Step 8: Replace Request Details Section
**Description:** Convert "Request Details:" header and 2 detail lines
**Rationale:** Contains account name and date variables
**Estimated Effort:** 10 minutes (Small)

**Current (lines 350-352):**
```typescript
Request Details:
• Account: ${accountDisplayName}
• Requested on: ${formatRequestDate(request.request_date)}
```

**Replace with:**
```typescript
${t('requestDetails')}
• ${t('account', { accountName: accountDisplayName })}
• ${t('requestedOn', { date: formatRequestDate(request.request_date) })}
```

**Translation Keys:**
- `emails.accessDenial.requestDetails` (no variables)
- `emails.accessDenial.account` (variable: `{accountName}`)
- `emails.accessDenial.requestedOn` (variable: `{date}`)

**Note:** Uses same key names as `accessApproval` for consistency

### Step 9: Replace Contact Message
**Description:** Convert contact instruction to translation call
**Rationale:** Long static text, no variables
**Estimated Effort:** 5 minutes (Small)

**Current (line 354):**
```typescript
If you believe this is an error or have questions about this decision, please contact the account owner directly.
```

**Replace with:**
```typescript
${t('contact')}
```

**Translation Key:** `emails.accessDenial.contact`
**Variables:** none

### Step 10: Replace Closing, Team, and Footer
**Description:** Convert closing lines using common translations
**Rationale:** Shared across all email templates; use `common` namespace
**Estimated Effort:** 5 minutes (Small)

**Current (lines 356-360):**
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

**Note:** Same keys as Task 2I.3 (access approval email)

### Step 11: Update Variables Object
**Description:** Add `language` field to variables object for consistency
**Rationale:** Matches Task 2I.3 pattern; useful for debugging
**Estimated Effort:** 5 minutes (Small)

**Current (lines 361-366):**
```typescript
variables: {
  requesterName,
  accountName: accountDisplayName,
  reason: reason || '',
  requestDate: formatRequestDate(request.request_date)
}
```

**Update to:**
```typescript
variables: {
  requesterName,
  accountName: accountDisplayName,
  reason: reason || '',
  requestDate: formatRequestDate(request.request_date),
  language
}
```

**Note:** Adding `language` for consistency with Task 2I.3 implementation

### Step 12: Verify Formatting and Structure
**Description:** Ensure email structure matches original formatting
**Rationale:** Email appearance should be identical to current version
**Estimated Effort:** 10 minutes (Small)

**Verification Points:**
- [ ] Newlines preserved correctly
- [ ] Bullet points formatted correctly
- [ ] Empty line spacing matches original
- [ ] Conditional reason display works (shows when provided, hidden when not)
- [ ] All variables interpolate correctly

**Test Cases:**
1. With reason: `generateAccessDenialEmail(request, 'Invalid credentials', 'Test Account')`
2. Without reason: `generateAccessDenialEmail(request, undefined, 'Test Account')`
3. Default account name: `generateAccessDenialEmail(request, 'Reason')`

### Step 13: Review and Validate Against Task 2I.3 Pattern
**Description:** Compare implementation with `generateAccessApprovalEmail()` for consistency
**Rationale:** Ensure both functions follow same pattern and conventions
**Estimated Effort:** 10 minutes (Small)

**Consistency Checklist:**
- [ ] Language constant declared same way
- [ ] Helper functions (`t` and `tc`) named identically
- [ ] TODO comments match format
- [ ] JSDoc structure consistent
- [ ] Variable naming conventions aligned
- [ ] Common namespace usage identical
- [ ] Code formatting matches

---

## Authorized Files and Functions for Modification

> ⚠️ **APPROVED SCOPE**: Changes outside this list require review

### Primary File (MODIFY)

| File | Target | Type | Lines Modified | Purpose |
|------|--------|------|----------------|---------|
| `/src/lib/email-templates.ts` | `generateAccessDenialEmail()` | Modify | 329-368 (~40 lines) | Replace hardcoded strings with translation calls |
| `/src/lib/email-templates.ts` | JSDoc comments | Update | 329-331 | Update documentation |

### Files NOT Modified (Dependencies)

| File | Task | Reason |
|------|------|--------|
| `/src/lib/email-translations.ts` | Task 2I.2 | Translation utility already implemented |
| `/messages/*.json` | Task 2I.1 | Translation files already created |
| Any caller files | N/A | Function signature unchanged (no breaking changes) |

### Files Modified in Later Tasks

| File | Task | Change |
|------|------|--------|
| `/src/lib/email-templates.ts` | Task 2I.7 | Add `language` parameter to function signature |

---

## Dependencies

### Depends On (Completed First)

- **REQ-E02-019** (Task 2I.1): Create `emails` namespace and translation structure
  - **What it provides:** Translation files with `emails.accessDenial.*` keys
  - **Why critical:** Cannot call `getEmailTranslation()` without translation keys
  - **Specific keys needed:** 10-11 keys for access denial email

- **REQ-E02-020** (Task 2I.2): Create `getEmailTranslation` utility function
  - **What it provides:** `getEmailTranslation()` function to call
  - **Why critical:** Core translation mechanism
  - **Required API:** `getEmailTranslation(key, language, variables?): string`

- **REQ-E02-021** (Task 2I.3): Update `generateAccessApprovalEmail` function
  - **What it provides:** Established pattern for email translation refactoring
  - **Why critical:** Provides proven approach to follow for consistency
  - **Pattern elements:** Helper functions, language constant, structure

### Blocks (Requires This First)

- **REQ-E02-025** (Task 2I.7): Add language parameter to all email generation functions
  - **What we provide:** Refactored function with language constant placeholder
  - **Blocking reason:** Task 2I.7 converts constant to parameter
  - **Sequential dependency:** Easier to add parameter after refactoring complete

- **REQ-E02-026** (Task 2I.8): Generate translations for 5 non-English languages
  - **What we provide:** Validated English translation key usage
  - **Blocking reason:** Ensures keys work before translating them

### Parallel Safety

**Files touched by this task:**
- `/src/lib/email-templates.ts` (lines 329-368)

**Conflicts with:**
- **Task 2I.3** (Update `generateAccessApprovalEmail`) - ✅ COMPLETED (different function, minimal conflict)
- **Task 2I.5** (Update `generateBetaAccessApprovalEmail`) - Different function, same file
  - **Risk:** Medium - Both modify same file
  - **Mitigation:** Sequential execution recommended
- **Task 2I.6** (Update `generateRegistrationReminderEmail`) - Different function, same file
  - **Risk:** Medium - Both modify same file
  - **Mitigation:** Sequential execution recommended

**Safe to parallelize with:**
- **Task 2I.8** (Generate non-English translations) - Different files (`/messages/*.json`)
- **Any Epic 2 tasks from other sub-epics** - No file overlap

**Recommendation:** Run Tasks 2I.3, 2I.4, 2I.5, 2I.6 SEQUENTIALLY to avoid merge conflicts in `/src/lib/email-templates.ts`

### External Dependencies

**Runtime Dependencies:**
- Translation utility: `/src/lib/email-translations.ts`
- Translation files: `/messages/en.json` (specifically `emails.accessDenial.*` keys)
- Type definitions: `SupportedLanguage` from `/src/types`

**Build-Time Dependencies:**
- TypeScript compiler for type checking
- ESLint for code quality

---

## Risks and Considerations

### Potential Side Effects

1. **Translation Key Mismatches:**
   - **Risk:** Translation keys don't match Task 2I.1 namespace
   - **Impact:** Missing translations, fallback to keys in emails
   - **Mitigation:** Cross-reference Task 2I.1 documentation
   - **Severity:** High

2. **Conditional Reason Logic:**
   - **Risk:** Empty string behavior changes with translation
   - **Impact:** Extra whitespace or formatting issues when reason omitted
   - **Mitigation:** Test both with and without reason parameter
   - **Severity:** Medium

3. **Variable Name Mismatches:**
   - **Risk:** Variable names don't match translation placeholders
   - **Impact:** Variables not interpolated, `{placeholder}` shown
   - **Mitigation:** Verify variable names match Task 2I.1 spec
   - **Severity:** High

4. **Formatting Changes:**
   - **Risk:** Translation assembly changes email formatting
   - **Impact:** Emails look different from current version
   - **Mitigation:** Preserve whitespace carefully
   - **Severity:** Medium

5. **Consistency with Task 2I.3:**
   - **Risk:** Different pattern used than `generateAccessApprovalEmail`
   - **Impact:** Inconsistent codebase, harder maintenance
   - **Mitigation:** Follow Task 2I.3 pattern exactly
   - **Severity:** Low

### Testing Requirements

**Unit Tests:**
- [ ] Function generates valid EmailTemplate object
- [ ] Subject contains expected text and variables
- [ ] Body contains all expected sections
- [ ] Conditional reason display works (with and without reason)
- [ ] Variables object populated correctly
- [ ] All translation calls use correct keys
- [ ] Variable interpolation works for all dynamic content

**Integration Tests:**
- [ ] Email sending succeeds with new template
- [ ] Access denial flow works end-to-end
- [ ] Email rendering matches expectations

**Manual Testing:**
- [ ] Generate sample access denial email WITH reason
- [ ] Generate sample access denial email WITHOUT reason
- [ ] Verify output matches current English version
- [ ] Check formatting (spacing, newlines, bullet points)
- [ ] Verify all variables replaced correctly
- [ ] Test with missing account name (default "Account")

**QA Checklist:**
- [ ] All strings replaced with translation calls
- [ ] No ESLint warnings or errors
- [ ] TypeScript compiles without errors
- [ ] Function generates identical English output
- [ ] No breaking changes to function signature
- [ ] Conditional logic preserved correctly
- [ ] JSDoc comments updated and accurate
- [ ] Code follows Task 2I.3 pattern
- [ ] Git commit message: "[REQ-E02-022] Update generateAccessDenialEmail function"

### Open Questions

- [ ] **Q1:** Should the empty reason case (`reason === undefined`) display nothing or a default message?
  - **Current:** Empty string when no reason
  - **Options:**
    - A) Keep empty string (current behavior)
    - B) Add default "No specific reason provided" message
  - **Recommendation:** Option A - Preserve current behavior

- [ ] **Q2:** Should the translation structure support markdown or rich text in denial reasons?
  - **Current:** Plain text only
  - **Recommendation:** Keep plain text for simplicity

- [ ] **Q3:** Should we add a separate `footerSupport` key like Task 2I.3 might need?
  - **Current:** Access denial email has single footer line
  - **Note:** Access approval has two footer lines; denial has one
  - **Recommendation:** Use single `common.footer` key

---

## Out of Scope

**Explicitly NOT included in this task:**

1. **Adding language parameter** to function signature - Task 2I.7
2. **Updating function callers** to pass language - Task 2I.7
3. **Translating to non-English languages** - Task 2I.8
4. **Updating other email functions** - Tasks 2I.5, 2I.6
5. **Testing email generation in multiple languages** - Task 2I.9
6. **Modifying HTML email rendering** - Out of scope for Epic 2
7. **Changing email content or structure** - Only translation, not redesign
8. **Adding new denial reasons** or reason categories
9. **Updating EmailTemplate type definition** - No changes needed
10. **Modifying email sending logic** - `/src/lib/email-service.ts` unchanged
11. **Database schema changes** - No DB changes required
12. **Adding email templates** - Only refactoring existing template

---

## Success Metrics

### Quantitative Metrics

1. **String Replacement Count:** 10-11 hardcoded strings replaced
2. **Translation Keys Used:** 10-11 unique keys from `emails.accessDenial.*` namespace
3. **Lines Changed:** ~40 lines modified (function body refactoring)
4. **Build Errors:** 0 TypeScript compilation errors
5. **Lint Warnings:** 0 ESLint warnings
6. **Pattern Consistency:** 100% match with Task 2I.3 pattern

### Qualitative Metrics

1. **Code Readability:** Translation calls are clear and maintainable
2. **Backward Compatibility:** No breaking changes to function behavior
3. **Output Consistency:** Generated emails identical to current English version
4. **Pattern Adherence:** Follows Task 2I.3 pattern exactly
5. **Documentation Quality:** JSDoc comments accurate and helpful
6. **Code Review Approval:** Technical lead approves implementation

### Acceptance Criteria

**Task is complete when:**
- ✅ All hardcoded strings replaced with `getEmailTranslation()` calls
- ✅ Function generates identical English email output to current version
- ✅ Translation helper functions (`t` and `tc`) implemented like Task 2I.3
- ✅ Conditional reason display logic preserved and functional
- ✅ No changes to function signature (backward compatible)
- ✅ JSDoc comments updated with translation references
- ✅ Variables object includes `language` field
- ✅ TypeScript compiles without errors
- ✅ ESLint passes without warnings
- ✅ Pattern matches Task 2I.3 implementation
- ✅ Code review approved
- ✅ Git commit created: "[REQ-E02-022] Update generateAccessDenialEmail function"

---

## Implementation Notes

### Key Design Decisions

1. **Follow Task 2I.3 Pattern:**
   - **Decision:** Use exact same structure as `generateAccessApprovalEmail`
   - **Rationale:** Consistency across email templates; proven approach
   - **Trade-off:** Less flexibility vs guaranteed consistency

2. **Language Constant:**
   - **Decision:** Use `const language = 'en'` placeholder
   - **Rationale:** Matches Task 2I.3; prepares for Task 2I.7
   - **Trade-off:** Extra variable vs easier future conversion

3. **Conditional Reason Handling:**
   - **Decision:** Preserve `${reason ? t('reason', { reason }) : ''}` pattern
   - **Rationale:** Maintains current behavior; simple and predictable
   - **Trade-off:** Inline conditional vs separate logic

4. **Helper Function Naming:**
   - **Decision:** Use `t()` and `tc()` exactly as Task 2I.3
   - **Rationale:** Consistency; developer familiarity
   - **Trade-off:** Generic names vs descriptive names

5. **Variables Object:**
   - **Decision:** Add `language` field like Task 2I.3
   - **Rationale:** Consistency; debugging utility
   - **Trade-off:** Extra data vs useful metadata

### Comparison with Task 2I.3

**Similarities:**
- Same helper function pattern (`t` and `tc`)
- Same language constant approach
- Same TODO comment structure
- Same JSDoc format
- Same use of `common` namespace for closing

**Differences:**
- Simpler email (fewer sections than access approval)
- Conditional reason display (access approval doesn't have conditionals)
- No repeated code/link labels (access approval has these)
- Single footer line (access approval might have two)

**Complexity:** Lower than Task 2I.3
- Fewer translation keys (10-11 vs 22)
- Simpler structure (no multi-step instructions)
- Shorter function body (~37 lines vs ~59 lines)

### Alternative Approaches Considered

**Alternative 1: Extract conditional to separate helper**
```typescript
const formatReason = () => reason ? t('reason', { reason }) : '';
body: `... ${formatReason()} ...`
```
- **Pros:** Cleaner body template
- **Cons:** Unnecessary abstraction for single use
- **Decision:** Rejected - Keep inline for simplicity

**Alternative 2: Use default reason message**
```typescript
${reason ? t('reason', { reason }) : t('noReasonProvided')}
```
- **Pros:** More informative when no reason given
- **Cons:** Changes current behavior; requires new translation key
- **Decision:** Rejected - Preserve current empty string behavior

**Alternative 3: Combine all common closing lines into single key**
```typescript
${tc('emailClosing')}  // Contains regards, team, separator, footer
```
- **Pros:** Fewer translation calls
- **Cons:** Less flexible; doesn't match Task 2I.3 pattern
- **Decision:** Rejected - Follow Task 2I.3 pattern exactly

---

## Appendix A: Translation Key Mapping Reference

### Complete Access Denial Email Translation Keys

| # | Current String | Translation Key | Variables | Notes |
|---|----------------|-----------------|-----------|-------|
| 1 | `Access Request Update: ${accountDisplayName}` | `accessDenial.subject` | `{accountName}` | Subject line |
| 2 | `Hello ${requesterName},` | `accessDenial.greeting` | `{name}` | Opening greeting |
| 3 | `Thank you for your interest in accessing "${accountDisplayName}".` | `accessDenial.intro` | `{accountName}` | Thank you message |
| 4 | `Unfortunately, we're unable to approve your access request at this time.` | `accessDenial.message` | none | Denial message |
| 5 | `Reason: ${reason}` | `accessDenial.reason` | `{reason}` | Optional reason (conditional) |
| 6 | `Request Details:` | `accessDenial.requestDetails` | none | Section header |
| 7 | `Account: ${accountDisplayName}` | `accessDenial.account` | `{accountName}` | Detail line 1 |
| 8 | `Requested on: ${formatRequestDate(...)}` | `accessDenial.requestedOn` | `{date}` | Detail line 2 |
| 9 | `If you believe this is an error or have questions about this decision, please contact the account owner directly.` | `accessDenial.contact` | none | Contact message |
| 10 | `Best regards,` | `common.regards` | none | Closing |
| 11 | `The FAQBNB Team` | `common.team` | none | Team signature |
| 12 | `This is an automated message. Please do not reply to this email.` | `common.footer` | none | Footer |

**Total Keys:** 12 (9 from `accessDenial`, 3 from `common`)
**Conditional Keys:** 1 (reason - only displayed when provided)

---

## Appendix B: Before/After Code Comparison

### Before (Current Implementation)

```typescript
/**
 * Generate access denial email template
 */
export function generateAccessDenialEmail(
  request: AccessRequest,
  reason?: string,
  accountName?: string
): EmailTemplate {
  const requesterName = request.requester_name || 'there';
  const accountDisplayName = accountName || 'Account';

  return {
    subject: `Access Request Update: ${accountDisplayName}`,
    body: `Hello ${requesterName},

Thank you for your interest in accessing "${accountDisplayName}".

Unfortunately, we're unable to approve your access request at this time.

${reason ? `Reason: ${reason}` : ''}

Request Details:
• Account: ${accountDisplayName}
• Requested on: ${formatRequestDate(request.request_date)}

If you believe this is an error or have questions about this decision, please contact the account owner directly.

Best regards,
The FAQBNB Team

---
This is an automated message. Please do not reply to this email.`,
    variables: {
      requesterName,
      accountName: accountDisplayName,
      reason: reason || '',
      requestDate: formatRequestDate(request.request_date)
    }
  };
}
```

---

### After (Translation-Based Implementation)

```typescript
/**
 * Generate access denial email template
 * Uses translations from emails.accessDenial namespace
 * Currently generates English emails only (language parameter added in Task 2I.7)
 *
 * @param request - Access request data
 * @param reason - Optional denial reason to include in email
 * @param accountName - Optional account name (defaults to 'Account')
 * @returns Email template with subject and body using translations
 *
 * @see Task 2I.1 - Translation namespace structure
 * @see Task 2I.2 - getEmailTranslation utility
 * @see Task 2I.3 - Pattern established for email translation
 * @see Task 2I.7 - Language parameter addition (future)
 */
export function generateAccessDenialEmail(
  request: AccessRequest,
  reason?: string,
  accountName?: string
  // TODO: Task 2I.7 - Add: language: SupportedLanguage = 'en'
): EmailTemplate {
  const requesterName = request.requester_name || 'there';
  const accountDisplayName = accountName || 'Account';

  // Language constant (defaults to English)
  const language: SupportedLanguage = 'en';
  // TODO: Task 2I.7 - Replace with parameter

  // Helper to translate email content with accessDenial namespace
  const t = (key: string, vars?: Record<string, string | number>) =>
    getEmailTranslation(`accessDenial.${key}`, language, vars);

  // Helper to translate common email content
  const tc = (key: string) =>
    getEmailTranslation(`common.${key}`, language);

  return {
    subject: t('subject', { accountName: accountDisplayName }),
    body: `${t('greeting', { name: requesterName })}

${t('intro', { accountName: accountDisplayName })}

${t('message')}

${reason ? t('reason', { reason }) : ''}

${t('requestDetails')}
• ${t('account', { accountName: accountDisplayName })}
• ${t('requestedOn', { date: formatRequestDate(request.request_date) })}

${t('contact')}

${tc('regards')}
${tc('team')}

---
${tc('footer')}`,
    variables: {
      requesterName,
      accountName: accountDisplayName,
      reason: reason || '',
      requestDate: formatRequestDate(request.request_date),
      language
    }
  };
}
```

---

**Key Changes Summary:**
1. Updated JSDoc with translation references and Task 2I.3 reference
2. Added `language` constant (converted to parameter in Task 2I.7)
3. Created `t()` and `tc()` translation helper functions
4. Replaced all 12 hardcoded strings with translation calls
5. Preserved conditional reason display logic
6. Added `language` to variables object
7. Added TODO comments for Task 2I.7
8. Maintained backward compatibility (no signature changes)

---

**End of Document**

*Generated by Technical Lead Agent 02 for Epic 2 L10N - Sub-Epic 2I: Email Templates*
