# Implementation Overview: Add Language Parameter to All Email Generation Functions

**Document Created:** 2026-01-23 02:19
**Last Modified:** 2026-01-23 02:19

---

## Header

| Field | Value |
|-------|-------|
| Task Reference | Task 2I.7 (Sub-Epic 2I: Email Templates) |
| Source File | docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md |
| Implementation Plan | Epic 2 - L10N Static UI Translation |
| Original Plan Date | Not specified |
| Breakdown Created | 2026-01-23 02:19 |
| T-shirt Size | Medium |
| Estimated Effort | 2-3 hours |
| Status | PENDING |

---

## Executive Summary

This task adds a `language` parameter to all four email generation functions in `/src/lib/email-templates.ts`, enabling emails to be generated in the recipient's preferred language. Tasks 2I.3-2I.6 have already refactored the functions to use translation calls with a hardcoded `'en'` language constant and `// TODO: Task 2I.7` comments marking where to add the parameter.

**Key Deliverables:**
1. Add `language: SupportedLanguage = 'en'` parameter to all four email functions
2. Update all callers to optionally pass the language parameter
3. Remove TODO comments and hardcoded language constants
4. Update JSDoc documentation
5. Ensure backward compatibility with default English

**Functions to Update:**
1. `generateAccessApprovalEmail()` - lines 29-101
2. `generateBetaAccessApprovalEmail()` - lines 120-198
3. `generateAccessDenialEmail()` - lines 366-416
4. `generateRegistrationReminderEmail()` - lines 434-492

**Callers to Update:**
1. `/src/components/EmailPopup.tsx` - line 42
2. `/src/app/api/admin/access-requests/[requestId]/grant/route.ts` - line 288
3. `/src/__tests__/beta-access-requests.test.ts` - multiple test cases
4. `/src/__tests__/back-office.test.ts` - multiple test cases

---

## Goals

### Primary Objectives

1. **Add language parameter** to all four email generation functions with default `'en'`
2. **Convert language constant** to use the parameter instead of hardcoded `'en'`
3. **Update all function callers** to support optional language parameter
4. **Maintain backward compatibility** - existing callers without language continue to work
5. **Update internal call** from `generateAccessApprovalEmail` to `generateBetaAccessApprovalEmail`
6. **Remove TODO comments** that were placeholders for this task
7. **Update JSDoc documentation** to document the new parameter

### Success Criteria

- [ ] All four functions accept `language: SupportedLanguage = 'en'` parameter
- [ ] Hardcoded `const language: SupportedLanguage = 'en'` removed from all functions
- [ ] All TODO comments referencing Task 2I.7 removed
- [ ] All callers continue to work without passing language (backward compatible)
- [ ] Internal beta routing passes language parameter correctly
- [ ] JSDoc comments updated with new parameter documentation
- [ ] All existing tests pass without modification
- [ ] TypeScript compiles without errors
- [ ] ESLint passes without warnings

### Assumptions & Clarifications

- **Assumption 1:** Default language is `'en'` (English) for backward compatibility
- **Assumption 2:** Language parameter is always optional (last parameter with default value)
- **Assumption 3:** Callers can determine recipient's preferred language externally
- **Assumption 4:** `SupportedLanguage` type is already imported from `@/types`
- **Assumption 5:** Translation files for all 6 languages already exist (Task 2I.8)
- **Clarification:** Test files should NOT be updated to pass language - they test default behavior

---

## Technical Context

### Current State

**File:** `/src/lib/email-templates.ts` (640 lines)

**Current Pattern (from Tasks 2I.3-2I.6):**
```typescript
export function generateAccessApprovalEmail(
  request: AccessRequest,
  accessCode: string,
  accountName?: string,
  baseUrl?: string
  // TODO: Task 2I.7 - Add: language: SupportedLanguage = 'en'
): EmailTemplate {
  // Language constant (defaults to English)
  const language: SupportedLanguage = 'en';
  // TODO: Task 2I.7 - Replace with parameter

  const t = (key: string, vars?: Record<string, string | number>) =>
    getEmailTranslation(`accessApproval.${key}`, language, vars);
  // ... rest of function
}
```

**Target Pattern (after this task):**
```typescript
export function generateAccessApprovalEmail(
  request: AccessRequest,
  accessCode: string,
  accountName?: string,
  baseUrl?: string,
  language: SupportedLanguage = 'en'
): EmailTemplate {
  const t = (key: string, vars?: Record<string, string | number>) =>
    getEmailTranslation(`accessApproval.${key}`, language, vars);
  // ... rest of function
}
```

### Functions to Modify

| Function | Lines | Current Params | New Param Position |
|----------|-------|----------------|-------------------|
| `generateAccessApprovalEmail` | 29-101 | 4 params | 5th (after baseUrl) |
| `generateBetaAccessApprovalEmail` | 120-198 | 4 params | 5th (after baseUrl) |
| `generateAccessDenialEmail` | 366-416 | 3 params | 4th (after accountName) |
| `generateRegistrationReminderEmail` | 434-492 | 5 params | 6th (after baseUrl) |

### Internal Call Chain

**Important:** `generateAccessApprovalEmail` calls `generateBetaAccessApprovalEmail` for beta requests:

```typescript
// Line 40-42 in generateAccessApprovalEmail
if (isBetaRequest) {
  return generateBetaAccessApprovalEmail(request, accessCode, accountName, baseUrl);
}
```

This internal call MUST be updated to pass the language parameter:
```typescript
if (isBetaRequest) {
  return generateBetaAccessApprovalEmail(request, accessCode, accountName, baseUrl, language);
}
```

### Callers to Update

| File | Line | Function Called | Current Call |
|------|------|-----------------|--------------|
| `EmailPopup.tsx` | 42 | `generateAccessApprovalEmail` | `generateAccessApprovalEmail(request, accessCode, accountName)` |
| `grant/route.ts` | 288 | `generateAccessApprovalEmail` | `generateAccessApprovalEmail(...)` |
| `beta-access-requests.test.ts` | 282, 294, 308, 322, 329 | Both functions | Various test calls |
| `back-office.test.ts` | 138, 302 | `generateAccessApprovalEmail` | Test calls |

**Note:** Test files should NOT be modified to pass language - they test default English behavior.

---

## Implementation Plan

### Step 1: Update `generateAccessApprovalEmail` Function Signature
**Description:** Add language parameter and remove TODO comments
**Rationale:** Primary function; establishes pattern for others
**Estimated Effort:** 10 minutes (Small)

**Current (lines 29-35):**
```typescript
export function generateAccessApprovalEmail(
  request: AccessRequest,
  accessCode: string,
  accountName?: string,
  baseUrl?: string
  // TODO: Task 2I.7 - Add: language: SupportedLanguage = 'en'
): EmailTemplate {
```

**Replace with:**
```typescript
export function generateAccessApprovalEmail(
  request: AccessRequest,
  accessCode: string,
  accountName?: string,
  baseUrl?: string,
  language: SupportedLanguage = 'en'
): EmailTemplate {
```

### Step 2: Remove Language Constant from `generateAccessApprovalEmail`
**Description:** Remove the hardcoded language constant since parameter now provides it
**Rationale:** Parameter replaces the constant
**Estimated Effort:** 5 minutes (Small)

**Current (lines 48-50):**
```typescript
  // Language constant (defaults to English)
  const language: SupportedLanguage = 'en';
  // TODO: Task 2I.7 - Replace with parameter
```

**Action:** Delete these 3 lines entirely (the `language` parameter now provides the value)

### Step 3: Update Internal Beta Call in `generateAccessApprovalEmail`
**Description:** Pass language parameter to `generateBetaAccessApprovalEmail`
**Rationale:** Beta emails should use the same language as requested
**Estimated Effort:** 5 minutes (Small)

**Current (lines 40-42):**
```typescript
  if (isBetaRequest) {
    return generateBetaAccessApprovalEmail(request, accessCode, accountName, baseUrl);
  }
```

**Replace with:**
```typescript
  if (isBetaRequest) {
    return generateBetaAccessApprovalEmail(request, accessCode, accountName, baseUrl, language);
  }
```

### Step 4: Update JSDoc for `generateAccessApprovalEmail`
**Description:** Update documentation to include language parameter
**Rationale:** Keep documentation accurate
**Estimated Effort:** 5 minutes (Small)

**Current JSDoc (lines 14-28):**
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

**Replace with:**
```typescript
/**
 * Generate access approval email template
 * Uses translations from emails.accessApproval namespace
 * Supports all 6 languages: en, fr, es, de, nl, it
 *
 * @param request - Access request data
 * @param accessCode - Generated access code
 * @param accountName - Optional account name (defaults to 'Account')
 * @param baseUrl - Optional base URL for links (defaults to getServerBaseUrl())
 * @param language - Language for email content (defaults to 'en')
 * @returns Email template with subject and body using translations
 *
 * @see Task 2I.1 - Translation namespace structure
 * @see Task 2I.2 - getEmailTranslation utility
 */
```

### Step 5: Update `generateBetaAccessApprovalEmail` Function Signature
**Description:** Add language parameter and remove TODO comments
**Rationale:** Same pattern as primary function
**Estimated Effort:** 10 minutes (Small)

**Current (lines 120-126):**
```typescript
export function generateBetaAccessApprovalEmail(
  request: AccessRequest,
  accessCode: string,
  accountName?: string,
  baseUrl?: string
  // TODO: Task 2I.7 - Add: language: SupportedLanguage = 'en'
): EmailTemplate {
```

**Replace with:**
```typescript
export function generateBetaAccessApprovalEmail(
  request: AccessRequest,
  accessCode: string,
  accountName?: string,
  baseUrl?: string,
  language: SupportedLanguage = 'en'
): EmailTemplate {
```

### Step 6: Remove Language Constant from `generateBetaAccessApprovalEmail`
**Description:** Remove the hardcoded language constant
**Rationale:** Parameter replaces the constant
**Estimated Effort:** 5 minutes (Small)

**Current (lines 132-134):**
```typescript
  // Language constant (defaults to English)
  const language: SupportedLanguage = 'en';
  // TODO: Task 2I.7 - Replace with parameter
```

**Action:** Delete these 3 lines entirely

### Step 7: Update JSDoc for `generateBetaAccessApprovalEmail`
**Description:** Update documentation to include language parameter
**Rationale:** Keep documentation accurate
**Estimated Effort:** 5 minutes (Small)

**Update JSDoc (lines 103-119) similarly to Step 4:**
- Remove "Currently generates English emails only" line
- Remove "@see Task 2I.7 - Language parameter addition (future)"
- Add "@param language - Language for email content (defaults to 'en')"
- Add "Supports all 6 languages: en, fr, es, de, nl, it"

### Step 8: Update `generateAccessDenialEmail` Function Signature
**Description:** Add language parameter and remove TODO comments
**Rationale:** Same pattern as other functions
**Estimated Effort:** 10 minutes (Small)

**Current (lines 366-371):**
```typescript
export function generateAccessDenialEmail(
  request: AccessRequest,
  reason?: string,
  accountName?: string
  // TODO: Task 2I.7 - Add: language: SupportedLanguage = 'en'
): EmailTemplate {
```

**Replace with:**
```typescript
export function generateAccessDenialEmail(
  request: AccessRequest,
  reason?: string,
  accountName?: string,
  language: SupportedLanguage = 'en'
): EmailTemplate {
```

### Step 9: Remove Language Constant from `generateAccessDenialEmail`
**Description:** Remove the hardcoded language constant
**Rationale:** Parameter replaces the constant
**Estimated Effort:** 5 minutes (Small)

**Current (lines 375-377):**
```typescript
  // Language constant (defaults to English)
  const language: SupportedLanguage = 'en';
  // TODO: Task 2I.7 - Replace with parameter
```

**Action:** Delete these 3 lines entirely

### Step 10: Update JSDoc for `generateAccessDenialEmail`
**Description:** Update documentation to include language parameter
**Rationale:** Keep documentation accurate
**Estimated Effort:** 5 minutes (Small)

**Update JSDoc (lines 351-365) similarly to previous steps**

### Step 11: Update `generateRegistrationReminderEmail` Function Signature
**Description:** Add language parameter and remove TODO comments
**Rationale:** Last function to update
**Estimated Effort:** 10 minutes (Small)

**Current (lines 434-440):**
```typescript
export function generateRegistrationReminderEmail(
  request: AccessRequest,
  accessCode: string,
  daysSinceApproval: number,
  accountName?: string,
  baseUrl?: string
): EmailTemplate {
```

**Replace with:**
```typescript
export function generateRegistrationReminderEmail(
  request: AccessRequest,
  accessCode: string,
  daysSinceApproval: number,
  accountName?: string,
  baseUrl?: string,
  language: SupportedLanguage = 'en'
): EmailTemplate {
```

### Step 12: Remove Language Constant from `generateRegistrationReminderEmail`
**Description:** Remove the hardcoded language constant
**Rationale:** Parameter replaces the constant
**Estimated Effort:** 5 minutes (Small)

**Current (lines 446-448):**
```typescript
  // Language constant (defaults to English)
  // TODO: Task 2I.7 - Replace with language parameter
  const language: SupportedLanguage = 'en';
```

**Action:** Delete these 3 lines entirely

### Step 13: Update JSDoc for `generateRegistrationReminderEmail`
**Description:** Update documentation to include language parameter
**Rationale:** Keep documentation accurate
**Estimated Effort:** 5 minutes (Small)

**Update JSDoc (lines 418-433) similarly to previous steps**

### Step 14: Verify All TODO Comments Removed
**Description:** Search for and remove any remaining Task 2I.7 TODO comments
**Rationale:** Clean up placeholders from previous tasks
**Estimated Effort:** 5 minutes (Small)

**Search pattern:** `// TODO: Task 2I.7`

**Expected locations to verify (all should be removed):**
- Line 34 (comment before parameter)
- Lines 48-50 (constant and comment)
- Line 125 (comment before parameter)
- Lines 132-134 (constant and comment)
- Line 370 (comment before parameter)
- Lines 375-377 (constant and comment)
- Line 447-448 (constant and comment)

### Step 15: Update EmailPopup.tsx Caller (Optional Enhancement)
**Description:** Optionally add language support to EmailPopup component
**Rationale:** Allows preview in different languages
**Estimated Effort:** 15 minutes (Medium)

**Current (line 42):**
```typescript
const template = generateAccessApprovalEmail(
  request,
  accessCode,
  accountName
);
```

**Option A - Keep backward compatible (no change):**
The function will use default `'en'` language. No changes needed.

**Option B - Add language prop to component:**
```typescript
interface EmailPopupProps {
  request: AccessRequest;
  accessCode: string;
  accountName?: string;
  language?: SupportedLanguage;  // New optional prop
}

// In component:
const template = generateAccessApprovalEmail(
  request,
  accessCode,
  accountName,
  undefined,  // baseUrl
  language    // language from props
);
```

**Recommendation:** Option A for this task; Option B can be added in a future enhancement

### Step 16: Update API Route Caller (Optional Enhancement)
**Description:** Optionally add language support to grant API route
**Rationale:** Allows sending emails in user's preferred language
**Estimated Effort:** 15 minutes (Medium)

**Current (line 288 in grant/route.ts):**
```typescript
emailData = email_template || generateAccessApprovalEmail(
  request,
  accessCode,
  accountName,
  baseUrl
);
```

**Option A - Keep backward compatible (no change):**
The function will use default `'en'` language. No changes needed for Task 2I.7.

**Option B - Add language from user preference:**
```typescript
// Get language from user preference or request data
const userLanguage = request.preferred_language || 'en';

emailData = email_template || generateAccessApprovalEmail(
  request,
  accessCode,
  accountName,
  baseUrl,
  userLanguage as SupportedLanguage
);
```

**Recommendation:** Option A for this task; Option B requires user preference infrastructure

### Step 17: Run Tests to Verify Backward Compatibility
**Description:** Execute existing test suite to ensure no regressions
**Rationale:** All tests should pass without modification
**Estimated Effort:** 10 minutes (Small)

**Test Files:**
- `/src/__tests__/beta-access-requests.test.ts`
- `/src/__tests__/back-office.test.ts`

**Expected Results:**
- All tests pass without modification
- Functions use default `'en'` language when no parameter passed
- Email output unchanged from previous implementation

### Step 18: TypeScript and Lint Verification
**Description:** Run typecheck and linting
**Rationale:** Ensure code quality standards
**Estimated Effort:** 5 minutes (Small)

**Commands:**
```bash
npm run typecheck
npm run lint
```

**Expected Results:**
- TypeScript compiles without errors
- ESLint passes without warnings
- All function signatures are valid

---

## Authorized Files and Functions for Modification

> ⚠️ **APPROVED SCOPE**: Changes outside this list require review

### Primary File (MODIFY)

| File | Target | Type | Lines Modified | Purpose |
|------|--------|------|----------------|---------|
| `/src/lib/email-templates.ts` | `generateAccessApprovalEmail()` | Modify | 14-101 | Add language param, update JSDoc, remove constant |
| `/src/lib/email-templates.ts` | `generateBetaAccessApprovalEmail()` | Modify | 103-198 | Add language param, update JSDoc, remove constant |
| `/src/lib/email-templates.ts` | `generateAccessDenialEmail()` | Modify | 351-416 | Add language param, update JSDoc, remove constant |
| `/src/lib/email-templates.ts` | `generateRegistrationReminderEmail()` | Modify | 418-492 | Add language param, update JSDoc, remove constant |

### Optional Files (MODIFY - Enhancement Only)

| File | Target | Type | Purpose |
|------|--------|------|---------|
| `/src/components/EmailPopup.tsx` | `EmailPopup` component | Extend | Add optional language prop |
| `/src/app/api/admin/access-requests/[requestId]/grant/route.ts` | `POST handler` | Extend | Add language support to email generation |

### Files NOT Modified

| File | Reason |
|------|--------|
| `/src/lib/email-translations.ts` | Task 2I.2 - Already implemented |
| `/messages/*.json` | Task 2I.1, 2I.8 - Translation files separate task |
| `/src/__tests__/*.test.ts` | Tests verify default behavior; should NOT pass language |

---

## Dependencies

### Depends On (Completed First)

- **REQ-E02-019** (Task 2I.1): Create `emails` namespace and translation structure
  - **What it provides:** Translation keys in all `/messages/*.json` files
  - **Why critical:** Function translations depend on these keys existing

- **REQ-E02-020** (Task 2I.2): Create `getEmailTranslation` utility function
  - **What it provides:** `getEmailTranslation(key, language, vars)` function
  - **Why critical:** All email functions call this utility

- **REQ-E02-021** (Task 2I.3): Update `generateAccessApprovalEmail` function
  - **What it provides:** Function body using translations with TODO placeholders

- **REQ-E02-022** (Task 2I.4): Update `generateAccessDenialEmail` function
  - **What it provides:** Function body using translations with TODO placeholders

- **REQ-E02-023** (Task 2I.5): Update `generateBetaAccessApprovalEmail` function
  - **What it provides:** Function body using translations with TODO placeholders

- **REQ-E02-024** (Task 2I.6): Update `generateRegistrationReminderEmail` function
  - **What it provides:** Function body using translations with TODO placeholders

### Blocks (Requires This First)

- **REQ-E02-026** (Task 2I.8): Generate translations for 5 non-English languages
  - **What we provide:** Fully functional email generation with language parameter
  - **Blocking reason:** Translation testing requires ability to generate non-English emails

- **REQ-E02-027** (Task 2I.9): Test email generation in each language
  - **What we provide:** Complete email generation API with language support
  - **Blocking reason:** Testing requires language parameter to be available

### Parallel Safety

**Files touched by this task:**
- `/src/lib/email-templates.ts` (function signatures and JSDoc)

**Conflicts with:**
- **Tasks 2I.3-2I.6** - ALREADY COMPLETED; no conflict
- **Task 2I.8** - Different files (`/messages/*.json`); SAFE to parallelize

**Safe to parallelize with:**
- **Task 2I.8** (Generate non-English translations) - Different files
- **Any other Epic 2 sub-epic tasks** - No file overlap

### External Dependencies

**Runtime Dependencies:**
- `SupportedLanguage` type from `/src/types` (already imported)
- `getEmailTranslation` from `/src/lib/email-translations.ts` (already imported)
- Translation files in `/messages/*.json` (created in Task 2I.1)

**Build-Time Dependencies:**
- TypeScript compiler for type checking
- ESLint for code quality

---

## Risks and Considerations

### Potential Side Effects

1. **API Breaking Changes (Mitigated):**
   - **Risk:** Changing function signatures could break callers
   - **Impact:** Compilation errors, runtime failures
   - **Mitigation:** Default parameter value (`= 'en'`) ensures backward compatibility
   - **Severity:** Low (default value prevents breaking)

2. **Internal Call Chain Break:**
   - **Risk:** Forgetting to update `generateBetaAccessApprovalEmail` call in `generateAccessApprovalEmail`
   - **Impact:** Beta emails always in English regardless of language parameter
   - **Mitigation:** Step 3 explicitly addresses this; review checklist includes it
   - **Severity:** Medium

3. **Parameter Order Issues:**
   - **Risk:** Callers passing positional arguments may have issues
   - **Impact:** Wrong values in parameters
   - **Mitigation:** New parameter is last with default; existing calls unchanged
   - **Severity:** Low

4. **Translation Fallback:**
   - **Risk:** If translation missing for requested language, unclear behavior
   - **Impact:** Potentially mixed-language emails or key display
   - **Mitigation:** `getEmailTranslation` already has English fallback
   - **Severity:** Low (handled by Task 2I.2)

5. **Test Coverage:**
   - **Risk:** No tests for non-English language generation
   - **Impact:** Bugs in non-English emails not caught
   - **Mitigation:** Task 2I.9 adds language testing; existing tests verify English default
   - **Severity:** Low (covered by future task)

### Testing Requirements

**Unit Tests (Existing - Should Pass):**
- [ ] `generateAccessApprovalEmail` generates valid template (default English)
- [ ] `generateBetaAccessApprovalEmail` generates valid template (default English)
- [ ] `generateAccessDenialEmail` generates valid template (default English)
- [ ] `generateRegistrationReminderEmail` generates valid template (default English)
- [ ] Beta request routing still works
- [ ] Variable interpolation works correctly

**Manual Testing:**
- [ ] Call each function without language parameter - verify English output
- [ ] Call each function with `'en'` - verify English output
- [ ] Call each function with `'fr'` - verify French output (requires Task 2I.8)
- [ ] Verify internal beta call passes language correctly
- [ ] Check EmailPopup renders correctly
- [ ] Check API grant route works correctly

**TypeScript Verification:**
- [ ] All function signatures compile
- [ ] All callers compile without changes
- [ ] No implicit `any` errors
- [ ] Parameter types are correct

### Open Questions

- [ ] **Q1:** Should callers be updated to pass language from user preferences?
  - **Current Decision:** No - callers use default `'en'`; future enhancement
  - **Rationale:** Task scope is adding parameter; usage is separate concern
  - **Future:** Consider adding user language preference lookup to API routes

- [ ] **Q2:** Should `EmailPopup` component have language selector for preview?
  - **Current Decision:** No - out of scope for this task
  - **Rationale:** Preview component is admin-only; enhancement deferred
  - **Future:** Add language dropdown to EmailPopup for multi-language preview

- [ ] **Q3:** How is recipient's preferred language determined?
  - **Current Decision:** Not this task's concern
  - **Rationale:** Language comes from caller; caller determines source
  - **Future:** Could come from AccessRequest, user profile, or API request

---

## Out of Scope

**Explicitly NOT included in this task:**

1. **Updating callers to pass non-default language** - Future enhancement
2. **Adding language selector UI to EmailPopup** - Future enhancement
3. **Determining user language preference** - Infrastructure not yet built
4. **Adding language to AccessRequest database** - Schema change not required
5. **Generating non-English translations** - Task 2I.8
6. **Testing all languages** - Task 2I.9
7. **Modifying test files to pass language** - Tests verify default behavior
8. **HTML email template changes** - Only parameter addition
9. **Email sending logic changes** - Out of scope

---

## Success Metrics

### Quantitative Metrics

1. **Functions Updated:** 4/4 email generation functions
2. **TODO Comments Removed:** All Task 2I.7 references (~7 occurrences)
3. **New Parameter Added:** `language: SupportedLanguage = 'en'` to all functions
4. **Lines Changed:** ~80-100 lines (signatures + JSDoc + constant removal)
5. **Test Pass Rate:** 100% of existing tests pass
6. **Build Errors:** 0 TypeScript compilation errors
7. **Lint Warnings:** 0 ESLint warnings

### Acceptance Criteria

**Task is complete when:**
- ✅ `generateAccessApprovalEmail` has `language: SupportedLanguage = 'en'` parameter
- ✅ `generateBetaAccessApprovalEmail` has `language: SupportedLanguage = 'en'` parameter
- ✅ `generateAccessDenialEmail` has `language: SupportedLanguage = 'en'` parameter
- ✅ `generateRegistrationReminderEmail` has `language: SupportedLanguage = 'en'` parameter
- ✅ Internal beta call passes language parameter
- ✅ All `const language: SupportedLanguage = 'en'` constants removed
- ✅ All `// TODO: Task 2I.7` comments removed
- ✅ JSDoc updated with `@param language` documentation
- ✅ All existing tests pass without modification
- ✅ TypeScript compiles without errors
- ✅ ESLint passes without warnings
- ✅ Git commit created: "[REQ-E02-025] Add language parameter to all email generation functions"

---

## Appendix A: Function Signature Changes Summary

### Before (Current State)

```typescript
// generateAccessApprovalEmail
export function generateAccessApprovalEmail(
  request: AccessRequest,
  accessCode: string,
  accountName?: string,
  baseUrl?: string
): EmailTemplate

// generateBetaAccessApprovalEmail
export function generateBetaAccessApprovalEmail(
  request: AccessRequest,
  accessCode: string,
  accountName?: string,
  baseUrl?: string
): EmailTemplate

// generateAccessDenialEmail
export function generateAccessDenialEmail(
  request: AccessRequest,
  reason?: string,
  accountName?: string
): EmailTemplate

// generateRegistrationReminderEmail
export function generateRegistrationReminderEmail(
  request: AccessRequest,
  accessCode: string,
  daysSinceApproval: number,
  accountName?: string,
  baseUrl?: string
): EmailTemplate
```

### After (Target State)

```typescript
// generateAccessApprovalEmail
export function generateAccessApprovalEmail(
  request: AccessRequest,
  accessCode: string,
  accountName?: string,
  baseUrl?: string,
  language: SupportedLanguage = 'en'
): EmailTemplate

// generateBetaAccessApprovalEmail
export function generateBetaAccessApprovalEmail(
  request: AccessRequest,
  accessCode: string,
  accountName?: string,
  baseUrl?: string,
  language: SupportedLanguage = 'en'
): EmailTemplate

// generateAccessDenialEmail
export function generateAccessDenialEmail(
  request: AccessRequest,
  reason?: string,
  accountName?: string,
  language: SupportedLanguage = 'en'
): EmailTemplate

// generateRegistrationReminderEmail
export function generateRegistrationReminderEmail(
  request: AccessRequest,
  accessCode: string,
  daysSinceApproval: number,
  accountName?: string,
  baseUrl?: string,
  language: SupportedLanguage = 'en'
): EmailTemplate
```

---

## Appendix B: Checklist for Each Function

### Function: `generateAccessApprovalEmail`
- [ ] Add `language: SupportedLanguage = 'en'` parameter (line 34)
- [ ] Update internal beta call to pass language (line 41)
- [ ] Remove `const language: SupportedLanguage = 'en'` (line 49)
- [ ] Remove TODO comments (lines 34, 50)
- [ ] Update JSDoc to document language param (lines 14-28)
- [ ] Remove "Task 2I.7" references from JSDoc

### Function: `generateBetaAccessApprovalEmail`
- [ ] Add `language: SupportedLanguage = 'en'` parameter (line 125)
- [ ] Remove `const language: SupportedLanguage = 'en'` (line 133)
- [ ] Remove TODO comments (lines 125, 134)
- [ ] Update JSDoc to document language param (lines 103-119)
- [ ] Remove "Task 2I.7" references from JSDoc

### Function: `generateAccessDenialEmail`
- [ ] Add `language: SupportedLanguage = 'en'` parameter (line 370)
- [ ] Remove `const language: SupportedLanguage = 'en'` (line 376)
- [ ] Remove TODO comments (lines 370, 377)
- [ ] Update JSDoc to document language param (lines 351-365)
- [ ] Remove "Task 2I.7" references from JSDoc

### Function: `generateRegistrationReminderEmail`
- [ ] Add `language: SupportedLanguage = 'en'` parameter (line 440)
- [ ] Remove `const language: SupportedLanguage = 'en'` (line 448)
- [ ] Remove TODO comments (lines 447-448)
- [ ] Update JSDoc to document language param (lines 418-433)
- [ ] Remove "Task 2I.7" references from JSDoc

---

**End of Document**

*Generated by Technical Lead Agent 02 for Epic 2 L10N - Sub-Epic 2I: Email Templates*
