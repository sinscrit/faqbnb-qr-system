# REQ-E02-027: Test Email Generation in All Supported Languages

## Document Information

| Field | Value |
|-------|-------|
| **Request ID** | REQ-E02-027 |
| **Title** | Test Email Generation in All Supported Languages |
| **Type** | ENHANCEMENT |
| **Size** | M (Medium) |
| **Phase** | 2I (Email Templates) |
| **Task ID** | 2I.9 |
| **Epic** | L10N Epic 2 - Static UI Translation |
| **Sub-Epic** | 2I - Email Templates |
| **Created** | 2026-01-20 |
| **Last Modified** | 2026-01-20 17:45:00 UTC |
| **Plan Reference** | Plan-111-L10N-Epic2-Static-UI-Translation.md |

---

## Summary

All email generation functions should be tested to verify they correctly generate emails in each of the six supported languages: English (en), Spanish (es), French (fr), German (de), Dutch (nl), and Italian (it). This task validates that the email localization implementation from previous tasks (2I.1-2I.8) functions correctly, including translation key resolution, dynamic content interpolation, fallback behavior, and proper rendering across all email types.

---

## Dependencies

### Prerequisites (Must Be Complete Before This Task)

| Task ID | Description | Status |
|---------|-------------|--------|
| 2I.1 | Create emails namespace and translation structure | Required |
| 2I.2 | Create `getEmailTranslation` utility function | Required |
| 2I.3 | Update `generateAccessApprovalEmail` function | Required |
| 2I.4 | Update `generateAccessDenialEmail` function | Required |
| 2I.5 | Update `generateBetaAccessApprovalEmail` function | Required |
| 2I.6 | Update `generateRegistrationReminderEmail` function | Required |
| 2I.7 | Add language parameter to all email generation functions | Required |
| 2I.8 | Generate translations for 5 non-English languages | Required |

### Foundation Dependencies (Epic 1)

| Component | Location | Purpose |
|-----------|----------|---------|
| i18n config | `/src/lib/i18n/config.ts` | Locale definitions (en, fr, es, de, nl, it) |
| Message files | `/messages/*.json` | Translation storage with emails namespace |

---

## Current State Analysis

### Email Generation Functions to Test

Located in `/src/lib/email-templates.ts`:

| Function | Description | Estimated Test Cases |
|----------|-------------|---------------------|
| `generateAccessApprovalEmail` | Access request approval notification | 6 languages x 2 scenarios = 12 |
| `generateAccessDenialEmail` | Access request denial notification | 6 languages x 2 scenarios = 12 |
| `generateBetaAccessApprovalEmail` | Beta program acceptance email | 6 languages x 1 scenario = 6 |
| `generateRegistrationReminderEmail` | Incomplete registration reminder | 6 languages x 2 scenarios = 12 |
| **Total Test Cases** | | **~42 minimum** |

### Existing Test Infrastructure

- **Test Framework**: Vitest (as seen in existing tests)
- **Existing Tests**: `/src/__tests__/beta-access-requests.test.ts` tests email generation
- **Mock Patterns**: Uses `vi.mock()` for dependencies
- **Email Service**: `MockEmailService` in `/src/lib/email-service.ts` for development testing

### Email Template Structure

Current templates return `EmailTemplate` interface:
```typescript
interface EmailTemplate {
  subject: string;
  body: string;
  variables: Record<string, string>;
}
```

### Translation Files to Verify

| File | Contains Emails Namespace |
|------|---------------------------|
| `/messages/en.json` | Yes (source) |
| `/messages/fr.json` | Yes (French) |
| `/messages/es.json` | Yes (Spanish) |
| `/messages/de.json` | Yes (German) |
| `/messages/nl.json` | Yes (Dutch) |
| `/messages/it.json` | Yes (Italian) |

---

## Implementation Approach

### Testing Strategy

#### 1. Unit Tests for Email Generation Functions

Create comprehensive unit tests that verify each email generation function:
- Accepts language parameter correctly
- Returns properly translated content for each language
- Preserves all interpolation variables
- Falls back to English when translation is missing

#### 2. Integration Tests for Email Service

Test the email service integration:
- `MockEmailService.sendApprovalEmail` with localized templates
- Proper template validation with translated content
- Email rendering (HTML and plain text) in all languages

#### 3. Translation Validation Tests

Automated checks for translation completeness:
- All translation keys exist in all language files
- All interpolation variables are preserved
- Character encoding is correct
- No empty or placeholder strings

### Test Categories

#### A. Language Parameter Acceptance Tests
- Verify each function accepts language parameter
- Verify default behavior (English) when language not specified
- Verify handling of invalid language codes

#### B. Translation Resolution Tests
- Verify correct translation keys are used
- Verify translations load from correct locale files
- Verify fallback chain works (requested -> English)

#### C. Dynamic Content Interpolation Tests
- Verify `{requesterName}` interpolates correctly in all languages
- Verify `{accountName}` interpolates correctly
- Verify `{accessCode}` appears in generated emails
- Verify `{directRegistrationLink}` is properly embedded
- Verify date formatting respects locale

#### D. Email Structure Tests
- Verify subject line is translated
- Verify body content is translated
- Verify all sections (greeting, body, notes, footer) are translated
- Verify HTML rendering preserves translated content

#### E. Edge Case Tests
- Missing translation key handling
- Empty translation value handling
- Special character encoding (accents, umlauts)
- Very long translated strings

---

## Expected Test Suite Structure

```typescript
// /src/__tests__/email-localization.test.ts

describe('Email Localization Tests - REQ-E02-027', () => {

  describe('Language Parameter Support', () => {
    // Tests for each email function accepting language param
  });

  describe('generateAccessApprovalEmail - All Languages', () => {
    describe('English (en)', () => { /* tests */ });
    describe('French (fr)', () => { /* tests */ });
    describe('Spanish (es)', () => { /* tests */ });
    describe('German (de)', () => { /* tests */ });
    describe('Dutch (nl)', () => { /* tests */ });
    describe('Italian (it)', () => { /* tests */ });
  });

  describe('generateAccessDenialEmail - All Languages', () => {
    // Similar structure
  });

  describe('generateBetaAccessApprovalEmail - All Languages', () => {
    // Similar structure
  });

  describe('generateRegistrationReminderEmail - All Languages', () => {
    // Similar structure
  });

  describe('Dynamic Content Interpolation', () => {
    // Tests for variable substitution in each language
  });

  describe('Fallback Behavior', () => {
    // Tests for English fallback when translation missing
  });

  describe('Character Encoding', () => {
    // Tests for special characters in each language
  });

  describe('HTML Rendering', () => {
    // Tests for renderEmailHTML with localized content
  });
});
```

---

## Authorized Files and Functions for Modification

### Files to Create

| File Path | Action | Purpose |
|-----------|--------|---------|
| `/src/__tests__/email-localization.test.ts` | Create | Main test suite for email localization |

### Files to Modify

| File Path | Action | Purpose |
|-----------|--------|---------|
| `/src/__tests__/beta-access-requests.test.ts` | Modify (optional) | Add localization test cases to existing tests |

### Files to Reference (Read-Only)

| File | Purpose |
|------|---------|
| `/src/lib/email-templates.ts` | Email generation functions to test |
| `/src/lib/email-service.ts` | Email service and validation utilities |
| `/messages/en.json` | English translations (source of truth) |
| `/messages/fr.json` | French translations |
| `/messages/es.json` | Spanish translations |
| `/messages/de.json` | German translations |
| `/messages/nl.json` | Dutch translations |
| `/messages/it.json` | Italian translations |
| `/src/types/admin.ts` | `AccessRequest`, `EmailTemplate` types |

### Functions to Test

| Function | File | Test Coverage |
|----------|------|---------------|
| `generateAccessApprovalEmail` | email-templates.ts | Full localization |
| `generateAccessDenialEmail` | email-templates.ts | Full localization |
| `generateBetaAccessApprovalEmail` | email-templates.ts | Full localization |
| `generateRegistrationReminderEmail` | email-templates.ts | Full localization |
| `renderEmailHTML` | email-templates.ts | HTML rendering with translations |
| `validateEmailTemplate` | email-templates.ts | Validation with translated content |
| `getEmailTranslation` | (new utility) | Translation retrieval |

---

## Acceptance Criteria

### Test Suite Coverage

- [ ] Test suite created at `/src/__tests__/email-localization.test.ts`
- [ ] All four email generation functions have tests for all six languages
- [ ] Tests verify subject lines render in correct language
- [ ] Tests verify body content renders in correct language
- [ ] Tests verify dynamic content interpolates correctly in all languages

### Language-Specific Verification

- [ ] English (en) - All emails generate correctly with English content
- [ ] Spanish (es) - All emails generate correctly with Spanish content
- [ ] French (fr) - All emails generate correctly with French content
- [ ] German (de) - All emails generate correctly with German content
- [ ] Dutch (nl) - All emails generate correctly with Dutch content
- [ ] Italian (it) - All emails generate correctly with Italian content

### Interpolation Tests

- [ ] `{requesterName}` interpolates correctly in all languages
- [ ] `{accountName}` interpolates correctly in all languages
- [ ] `{accessCode}` appears correctly in generated emails
- [ ] `{directRegistrationLink}` is properly embedded
- [ ] `{requestDate}` formats appropriately
- [ ] `{daysSinceApproval}` (for reminders) interpolates correctly
- [ ] `{reason}` (for denials) interpolates when provided

### Fallback Behavior Tests

- [ ] When translation key is missing, falls back to English
- [ ] When invalid language code provided, defaults to English
- [ ] Fallback does not cause email generation failures
- [ ] Fallback does not cause exceptions

### Character Encoding Tests

- [ ] French accents (é, è, ê, ç, à, û) display correctly
- [ ] Spanish accents (á, é, í, ñ, ü) display correctly
- [ ] German umlauts and eszett (ä, ö, ü, ß) display correctly
- [ ] Dutch special characters display correctly
- [ ] Italian accents (à, è, é, ì, ò, ù) display correctly

### HTML Rendering Tests

- [ ] `renderEmailHTML` produces valid HTML with translated content
- [ ] HTML structure is preserved across all languages
- [ ] Special characters are properly HTML-encoded
- [ ] Email styling applies correctly regardless of language

### Quality Verification

- [ ] All tests pass for all supported languages
- [ ] Test coverage report shows >90% coverage for email templates
- [ ] No hardcoded English strings in email generation path
- [ ] Test results documented with any issues identified
- [ ] All identified issues have remediation plans

---

## Test Data Requirements

### Mock Access Request

```typescript
const mockAccessRequest: AccessRequest = {
  id: 'test-request-123',
  requester_email: 'test@example.com',
  requester_name: 'Test User',
  account_id: 'account-456',
  request_date: '2026-01-15T10:00:00Z',
  status: AccessRequestStatus.APPROVED,
  source: AccessRequestSource.DIRECT_REQUEST,
  created_at: '2026-01-15T10:00:00Z',
  updated_at: '2026-01-20T14:00:00Z'
};
```

### Test Languages Array

```typescript
const SUPPORTED_LANGUAGES = ['en', 'es', 'fr', 'de', 'nl', 'it'] as const;
type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];
```

### Expected Translations Sample (for assertion)

French subject line example:
```typescript
expect(result.subject).toContain('Accès Accordé'); // or equivalent French
```

---

## Implementation Tasks

### Task Breakdown

| # | Task | Est. Effort |
|---|------|-------------|
| 1 | Create test file structure and imports | 15 min |
| 2 | Write language parameter acceptance tests | 30 min |
| 3 | Write `generateAccessApprovalEmail` tests for all 6 languages | 45 min |
| 4 | Write `generateAccessDenialEmail` tests for all 6 languages | 45 min |
| 5 | Write `generateBetaAccessApprovalEmail` tests for all 6 languages | 45 min |
| 6 | Write `generateRegistrationReminderEmail` tests for all 6 languages | 45 min |
| 7 | Write interpolation verification tests | 30 min |
| 8 | Write fallback behavior tests | 30 min |
| 9 | Write character encoding tests | 30 min |
| 10 | Write HTML rendering tests | 30 min |
| 11 | Run full test suite and document results | 30 min |
| 12 | Fix any identified issues and re-test | Variable |

**Total Estimated Effort**: ~5.5 hours (excluding issue remediation)

---

## Test Execution Commands

```bash
# Run all email localization tests
npm test -- src/__tests__/email-localization.test.ts

# Run with coverage report
npm test -- --coverage src/__tests__/email-localization.test.ts

# Run specific language tests
npm test -- src/__tests__/email-localization.test.ts -t "French"

# Run in watch mode during development
npm test -- --watch src/__tests__/email-localization.test.ts
```

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Total test cases | ≥42 |
| Test pass rate | 100% |
| Languages covered | 6/6 |
| Email functions covered | 4/4 |
| Code coverage | ≥90% for email-templates.ts |
| Character encoding issues | 0 |
| Interpolation failures | 0 |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Translation keys not yet implemented | Medium | High | Verify 2I.1-2I.8 complete first |
| Character encoding issues in test assertions | Medium | Medium | Use Unicode-aware string comparison |
| Mock data doesn't cover edge cases | Low | Medium | Add comprehensive test fixtures |
| HTML rendering differences per language | Low | Low | Focus on content correctness |
| Test flakiness due to date/time | Low | Low | Mock date functions |

---

## Related Documentation

- [Plan-111-L10N-Epic2-Static-UI-Translation.md](./prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [REQ-E02-026 - Generate Translations Overview](./REQ-E02-026-generate-translations-for-5-non-english-languages-overview.md)
- [Existing Email Tests](../src/__tests__/beta-access-requests.test.ts)
- [Email Templates Source](../src/lib/email-templates.ts)
- [Email Service](../src/lib/email-service.ts)

---

## Notes

- This is the final task in the Email Templates sub-epic (2I), serving as validation for all previous work
- Tests should be written to be maintainable and serve as documentation for expected email behavior
- Consider adding snapshot tests for email content if translations are stable
- Test results may reveal gaps in translations that should be reported back to Task 2I.8
- Integration with CI/CD should run these tests on every commit affecting email templates or translations
