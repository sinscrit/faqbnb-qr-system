# REQ-E02-022: Update `generateAccessDenialEmail` Function - Detailed Task Breakdown

*Generated: 2026-01-20 18:30:00 UTC*
*Last Modified: 2026-01-20 18:30:00 UTC*

## Reference

- **Request ID**: REQ-E02-022
- **Overview Document**: docs/REQ-E02-022-update-generateaccessdenialemail-function-overview.md
- **Requirements Source**: docs/gen_requests_epic2.md (Request #22)
- **Implementation Plan**: docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md
- **Sub-Epic**: 2I - Email Templates
- **Task ID**: 2I.4
- **Title**: Update `generateAccessDenialEmail` function
- **Size**: S (Small)
- **Type**: Enhancement
- **Depends On**:
  - Epic 1 (L10N Foundation - next-intl setup)
  - REQ-E02-019 (Task 2I.1 - Emails Namespace Structure)
  - REQ-E02-020 (Task 2I.2 - Email Translation Utility Function)

---

## Executive Summary

This task updates the `generateAccessDenialEmail` function in `/src/lib/email-templates.ts` to support multi-language email generation. The function currently contains ~12 hardcoded English strings that will be replaced with calls to the `getEmailTranslation` utility created in Task 2I.2. The implementation maintains full backward compatibility while enabling access denial emails to be sent in the recipient's preferred language. Special attention is given to maintaining a professional and respectful tone across all languages when communicating a negative outcome.

---

## Pre-Implementation Checklist

Before starting implementation, verify the following dependencies are complete:

- [ ] Epic 1 foundation is complete (next-intl installed and configured)
- [ ] Task 2I.1 (REQ-E02-019) is complete - emails namespace exists in `/messages/*.json`
- [ ] Task 2I.2 (REQ-E02-020) is complete - `getEmailTranslation` utility exists at `/src/lib/l10n/emails/`
- [ ] `SupportedLanguage` and `DEFAULT_LANGUAGE` types are available from translation service

---

## Task Breakdown

### Task 1: Verify/Add Imports for Translation Utilities

**File**: `/src/lib/email-templates.ts`
**Location**: Lines 1-7 (top of file)
**Estimated Effort**: 5 minutes
**Story Points**: 0.25

#### Current State (Lines 1-7)

```typescript
import { AccessRequest, EmailTemplate, AccessRequestSource } from '@/types/admin';
import { getServerBaseUrl } from './config';

/**
 * Email Template Utilities for REQ-016: System Admin Back Office
 * Last Modified: 2026-01-15 - Updated to use getServerBaseUrl for proper domain handling
 */
```

#### Target State

If Task 2I.3 (generateAccessApprovalEmail) has already been completed, imports should already exist. If not, add:

```typescript
import { AccessRequest, EmailTemplate, AccessRequestSource } from '@/types/admin';
import { getServerBaseUrl } from './config';
import { getEmailTranslation } from '@/lib/l10n/emails';
import { SupportedLanguage, DEFAULT_LANGUAGE } from '@/lib/translation-service/translation-service.types';

/**
 * Email Template Utilities for REQ-016: System Admin Back Office
 * Last Modified: 2026-01-20 - Added localization support for email templates
 */
```

#### Implementation Steps

1. Open `/src/lib/email-templates.ts`
2. Check if imports from Task 2I.3 already exist
3. If not, add import for `getEmailTranslation` from `@/lib/l10n/emails`
4. If not, add import for `SupportedLanguage` and `DEFAULT_LANGUAGE` from translation service types
5. Update the "Last Modified" comment to reflect current date and localization addition

#### Acceptance Criteria

- [ ] `getEmailTranslation` is imported from correct path
- [ ] `SupportedLanguage` type is imported
- [ ] `DEFAULT_LANGUAGE` constant is imported
- [ ] No import errors in IDE
- [ ] File compiles without TypeScript errors

---

### Task 2: Update Function Signature with Language Parameter

**File**: `/src/lib/email-templates.ts`
**Location**: Lines 302-309 (function signature and JSDoc)
**Estimated Effort**: 10 minutes
**Story Points**: 0.5

#### Current State (Lines 302-309)

```typescript
/**
 * Generate access denial email template
 */
export function generateAccessDenialEmail(
  request: AccessRequest,
  reason?: string,
  accountName?: string
): EmailTemplate {
```

#### Target State

```typescript
/**
 * Generate access denial email template
 * @param request - Access request data
 * @param reason - Optional denial reason
 * @param accountName - Optional account name
 * @param language - Preferred language for email content (defaults to English)
 */
export function generateAccessDenialEmail(
  request: AccessRequest,
  reason?: string,
  accountName?: string,
  language: SupportedLanguage = DEFAULT_LANGUAGE
): EmailTemplate {
```

#### Implementation Steps

1. Add `@param` JSDoc entries for all parameters (currently missing)
2. Add `@param language` JSDoc entry describing the new parameter
3. Add `language: SupportedLanguage = DEFAULT_LANGUAGE` as the fourth parameter
4. Ensure parameter has default value for backward compatibility
5. Verify TypeScript compiles without errors

#### Acceptance Criteria

- [ ] New `language` parameter added with correct type `SupportedLanguage`
- [ ] Default value set to `DEFAULT_LANGUAGE` for backward compatibility
- [ ] JSDoc updated with all parameter descriptions
- [ ] Existing calls without language parameter still work (backward compatible)
- [ ] TypeScript compiles without errors

---

### Task 3: Create Email Variables Object and Translation Helpers

**File**: `/src/lib/email-templates.ts`
**Location**: After line 311 (after `accountDisplayName` declaration)
**Estimated Effort**: 15 minutes
**Story Points**: 0.75

#### Current State (Lines 310-311)

```typescript
  const requesterName = request.requester_name || 'there';
  const accountDisplayName = accountName || 'Account';
```

#### Target State

```typescript
  const requesterName = request.requester_name || 'there';
  const accountDisplayName = accountName || 'Account';

  // Variables for translation interpolation
  const emailVariables = {
    name: requesterName,
    accountName: accountDisplayName,
    reason: reason || '',
    requestDate: new Date(request.request_date).toLocaleDateString(language, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
  };

  // Translation helper functions
  const t = (key: string) => getEmailTranslation(key, language, emailVariables);
  const tCommon = (key: string) => getEmailTranslation(`common.${key}`, language, emailVariables);
```

#### Implementation Steps

1. Create `emailVariables` object containing all dynamic values for interpolation
2. Use `toLocaleDateString` with language parameter for localized date formatting
3. Create `t` helper function for `accessDenial.*` translation keys
4. Create `tCommon` helper function for `common.*` translation keys (greeting, footer, etc.)

#### Acceptance Criteria

- [ ] `emailVariables` object contains all required interpolation values
- [ ] Date formatting respects the `language` parameter
- [ ] `t` helper retrieves translations from `accessDenial.*` namespace
- [ ] `tCommon` helper retrieves translations from `common.*` namespace
- [ ] Variable names match those defined in email translation keys from Task 2I.1

---

### Task 4: Replace Subject Line with Translation

**File**: `/src/lib/email-templates.ts`
**Location**: Line 314 (subject in return statement)
**Estimated Effort**: 5 minutes
**Story Points**: 0.25

#### Current State (Line 314)

```typescript
    subject: `Access Request Update: ${accountDisplayName}`,
```

#### Target State

```typescript
    subject: t('accessDenial.subject'),
```

#### Implementation Steps

1. Replace hardcoded subject string template with `t('accessDenial.subject')` call
2. Verify translation key exists in `/messages/en.json` emails namespace

#### Expected Translation Key (from Task 2I.1)

```json
{
  "emails": {
    "accessDenial": {
      "subject": "Access Request Update: {accountName}"
    }
  }
}
```

#### Acceptance Criteria

- [ ] Subject line uses `t('accessDenial.subject')` call
- [ ] English output matches original: "Access Request Update: {accountName}"
- [ ] `{accountName}` is properly interpolated from `emailVariables`

---

### Task 5: Handle Conditional Reason Section

**File**: `/src/lib/email-templates.ts`
**Location**: Before return statement (new code)
**Estimated Effort**: 10 minutes
**Story Points**: 0.5

#### Implementation

The denial reason is optional. Create a conditional section that only appears when a reason is provided:

```typescript
  // Conditionally include reason section
  const reasonSection = reason
    ? `\n${t('accessDenial.reasonLabel')}\n`
    : '';
```

#### Expected Translation Key

```json
{
  "emails": {
    "accessDenial": {
      "reasonLabel": "Reason: {reason}"
    }
  }
}
```

#### Acceptance Criteria

- [ ] Reason section only appears when `reason` parameter is provided
- [ ] When reason is empty/undefined, no "Reason:" line appears in email
- [ ] Translation key properly interpolates the `{reason}` variable
- [ ] Email flows naturally both with and without the reason section

---

### Task 6: Replace Email Body Content with Translations

**File**: `/src/lib/email-templates.ts`
**Location**: Lines 315-333 (body in return statement)
**Estimated Effort**: 25 minutes
**Story Points**: 1.5

#### Current State (Lines 315-333)

```typescript
    body: `Hello ${requesterName},

Thank you for your interest in accessing "${accountDisplayName}".

Unfortunately, we're unable to approve your access request at this time.

${reason ? `Reason: ${reason}` : ''}

Request Details:
• Account: ${accountDisplayName}
• Requested on: ${new Date(request.request_date).toLocaleDateString()}

If you believe this is an error or have questions about this decision, please contact the account owner directly.

Best regards,
The FAQBNB Team

---
This is an automated message. Please do not reply to this email.`,
```

#### Target State

```typescript
    body: `${tCommon('greeting')}

${t('accessDenial.intro')}

${t('accessDenial.message')}
${reasonSection}
${t('accessDenial.requestDetailsHeading')}
- ${t('accessDenial.accountLabel')}
- ${t('accessDenial.requestedOnLabel')}

${t('accessDenial.contactNote')}

${tCommon('regards')}
${tCommon('team')}

${tCommon('separator')}
${tCommon('footer')}`,
```

#### Translation Key Mapping

| Original Text | Translation Key |
|---------------|-----------------|
| `Hello ${requesterName},` | `common.greeting` |
| `Thank you for your interest in accessing "${accountDisplayName}".` | `accessDenial.intro` |
| `Unfortunately, we're unable to approve your access request at this time.` | `accessDenial.message` |
| `Reason: ${reason}` | `accessDenial.reasonLabel` (conditional) |
| `Request Details:` | `accessDenial.requestDetailsHeading` |
| `Account: ${accountDisplayName}` | `accessDenial.accountLabel` |
| `Requested on: ${date}` | `accessDenial.requestedOnLabel` |
| `If you believe this is an error...` | `accessDenial.contactNote` |
| `Best regards,` | `common.regards` |
| `The FAQBNB Team` | `common.team` |
| `---` | `common.separator` |
| `This is an automated message...` | `common.footer` |

#### Expected Translation Keys (from Task 2I.1)

```json
{
  "emails": {
    "common": {
      "greeting": "Hello {name},",
      "regards": "Best regards,",
      "team": "The FAQBNB Team",
      "separator": "---",
      "footer": "This is an automated message. Please do not reply to this email."
    },
    "accessDenial": {
      "subject": "Access Request Update: {accountName}",
      "intro": "Thank you for your interest in accessing \"{accountName}\".",
      "message": "Unfortunately, we're unable to approve your access request at this time.",
      "reasonLabel": "Reason: {reason}",
      "requestDetailsHeading": "Request Details:",
      "accountLabel": "Account: {accountName}",
      "requestedOnLabel": "Requested on: {requestDate}",
      "contactNote": "If you believe this is an error or have questions about this decision, please contact the account owner directly."
    }
  }
}
```

#### Implementation Steps

1. Replace greeting with `tCommon('greeting')`
2. Replace intro message with `t('accessDenial.intro')`
3. Replace denial message with `t('accessDenial.message')`
4. Use the `reasonSection` variable (from Task 5) for conditional reason display
5. Replace request details heading with `t('accessDenial.requestDetailsHeading')`
6. Replace account label line with `t('accessDenial.accountLabel')`
7. Replace requested on label with `t('accessDenial.requestedOnLabel')`
8. Replace contact note with `t('accessDenial.contactNote')`
9. Replace sign-off with `tCommon('regards')` and `tCommon('team')`
10. Replace footer with `tCommon('separator')` and `tCommon('footer')`

#### Acceptance Criteria

- [ ] All 12 hardcoded strings are replaced with translation function calls
- [ ] Email structure (sections, bullet points) is preserved
- [ ] All variable interpolations work correctly
- [ ] English output matches original email content exactly
- [ ] No hardcoded English text remains in the body
- [ ] Conditional reason section works correctly

---

### Task 7: Preserve Variables Object in Return Statement

**File**: `/src/lib/email-templates.ts`
**Location**: Lines 334-339 (variables in return statement)
**Estimated Effort**: 5 minutes
**Story Points**: 0.25

#### Current State (Lines 334-339)

```typescript
    variables: {
      requesterName,
      accountName: accountDisplayName,
      reason: reason || '',
      requestDate: new Date(request.request_date).toLocaleDateString()
    }
```

#### Target State

```typescript
    variables: {
      requesterName,
      accountName: accountDisplayName,
      reason: reason || '',
      requestDate: new Date(request.request_date).toLocaleDateString(language, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      language
    }
```

#### Implementation Steps

1. Keep the existing variables for backward compatibility with `renderEmailHTML`
2. Update `requestDate` to use localized date formatting
3. Add `language` to variables for downstream use/debugging

#### Acceptance Criteria

- [ ] Variables object structure maintained for backward compatibility
- [ ] `requestDate` uses localized formatting
- [ ] `renderEmailHTML` function continues to work with returned template

---

### Task 8: Verify Build and Type Checking

**File**: N/A (Full project)
**Estimated Effort**: 10 minutes
**Story Points**: 0.5

#### Implementation Steps

1. Run TypeScript compiler: `npx tsc --noEmit`
2. Run build: `npm run build`
3. Fix any type errors or import issues
4. Verify no circular dependencies introduced

#### Commands to Execute

```bash
# Type checking
npx tsc --noEmit

# Full build
npm run build

# Check for circular imports (if available)
npx madge --circular src/lib/email-templates.ts
```

#### Acceptance Criteria

- [ ] TypeScript compiles without errors
- [ ] `npm run build` succeeds
- [ ] No circular import warnings
- [ ] Import paths resolve correctly

---

### Task 9: Create Unit Tests for Translation Integration

**File**: `/src/lib/__tests__/email-templates.test.ts` (new or existing)
**Estimated Effort**: 25 minutes
**Story Points**: 1.5

#### Test Cases to Implement

```typescript
import { generateAccessDenialEmail } from '../email-templates';
import { AccessRequest, AccessRequestSource } from '@/types/admin';

describe('generateAccessDenialEmail', () => {
  const mockRequest: AccessRequest = {
    id: 'test-id',
    requester_name: 'John Doe',
    requester_email: 'john@example.com',
    request_date: '2026-01-15T10:00:00Z',
    source: AccessRequestSource.MANUAL,
    status: 'denied',
    account_id: 'account-123',
    account: { id: 'account-123', name: 'Beach House' }
  };

  describe('backward compatibility', () => {
    it('should generate English email when no language specified', () => {
      const result = generateAccessDenialEmail(
        mockRequest,
        'User quota exceeded',
        'Beach House'
      );

      expect(result.subject).toContain('Access Request Update');
      expect(result.body).toContain('Hello John Doe');
      expect(result.body).toContain('Beach House');
    });

    it('should return EmailTemplate with required fields', () => {
      const result = generateAccessDenialEmail(
        mockRequest,
        'User quota exceeded',
        'Beach House'
      );

      expect(result).toHaveProperty('subject');
      expect(result).toHaveProperty('body');
      expect(result).toHaveProperty('variables');
    });

    it('should work without reason parameter', () => {
      const result = generateAccessDenialEmail(
        mockRequest,
        undefined,
        'Beach House'
      );

      expect(result.body).not.toContain('Reason:');
      expect(result.subject).toContain('Beach House');
    });
  });

  describe('language support', () => {
    it('should generate English email when language is "en"', () => {
      const result = generateAccessDenialEmail(
        mockRequest,
        'User quota exceeded',
        'Beach House',
        'en'
      );

      expect(result.subject).toContain('Access Request Update');
      expect(result.body).toContain('Hello');
    });

    it('should generate French email when language is "fr"', () => {
      const result = generateAccessDenialEmail(
        mockRequest,
        'Quota utilisateur depassee',
        'Beach House',
        'fr'
      );

      // Verify French content (actual text depends on translations)
      expect(result.subject).toBeTruthy();
      expect(result.body).toBeTruthy();
    });

    it('should fallback to English for unsupported language', () => {
      const result = generateAccessDenialEmail(
        mockRequest,
        'Some reason',
        'Beach House',
        'xyz' as any // Invalid language
      );

      // Should fallback to English
      expect(result.subject).toContain('Access Request Update');
    });
  });

  describe('conditional reason handling', () => {
    it('should include reason when provided', () => {
      const result = generateAccessDenialEmail(
        mockRequest,
        'User quota exceeded',
        'Beach House',
        'en'
      );

      expect(result.body).toContain('Reason:');
      expect(result.body).toContain('User quota exceeded');
    });

    it('should omit reason section when reason is undefined', () => {
      const result = generateAccessDenialEmail(
        mockRequest,
        undefined,
        'Beach House',
        'en'
      );

      expect(result.body).not.toContain('Reason:');
    });

    it('should omit reason section when reason is empty string', () => {
      const result = generateAccessDenialEmail(
        mockRequest,
        '',
        'Beach House',
        'en'
      );

      expect(result.body).not.toContain('Reason:');
    });
  });

  describe('variable interpolation', () => {
    it('should interpolate account name correctly', () => {
      const result = generateAccessDenialEmail(
        mockRequest,
        'Some reason',
        'My Beach House',
        'en'
      );

      expect(result.subject).toContain('My Beach House');
      expect(result.body).toContain('My Beach House');
    });

    it('should interpolate requester name correctly', () => {
      const result = generateAccessDenialEmail(
        mockRequest,
        'Some reason',
        'Beach House',
        'en'
      );

      expect(result.body).toContain('John Doe');
    });

    it('should use fallback name when requester_name is empty', () => {
      const requestWithoutName = { ...mockRequest, requester_name: '' };
      const result = generateAccessDenialEmail(
        requestWithoutName,
        'Some reason',
        'Beach House',
        'en'
      );

      expect(result.body).toContain('there');
    });

    it('should use default account name when not provided', () => {
      const result = generateAccessDenialEmail(
        mockRequest,
        'Some reason',
        undefined,
        'en'
      );

      expect(result.body).toContain('Account');
    });
  });

  describe('professional tone', () => {
    it('should maintain respectful tone in denial message', () => {
      const result = generateAccessDenialEmail(
        mockRequest,
        'Some reason',
        'Beach House',
        'en'
      );

      // Check for polite language
      expect(result.body).toContain('Thank you for your interest');
      expect(result.body).toContain('Unfortunately');
      expect(result.body).not.toContain('rejected');
      expect(result.body).not.toContain('denied');
    });
  });
});
```

#### Implementation Steps

1. Create or update test file at `/src/lib/__tests__/email-templates.test.ts`
2. Add test cases for backward compatibility
3. Add test cases for each supported language
4. Add test cases for conditional reason handling
5. Add test cases for variable interpolation
6. Add test cases for professional tone
7. Run tests: `npm test -- email-templates`

#### Acceptance Criteria

- [ ] All test cases pass
- [ ] Backward compatibility tests verify existing calls work
- [ ] Language-specific tests verify translations load
- [ ] Conditional reason tests pass
- [ ] Variable interpolation tests pass
- [ ] Tone/messaging tests pass

---

### Task 10: Manual Verification in All Languages

**Estimated Effort**: 15 minutes
**Story Points**: 0.75

#### Verification Script

Create a temporary script to verify email generation:

```typescript
// scripts/verify-denial-email-translations.ts
import { generateAccessDenialEmail } from '../src/lib/email-templates';
import { AccessRequestSource } from '../src/types/admin';

const SUPPORTED_LANGUAGES = ['en', 'fr', 'es', 'de', 'nl', 'it'] as const;

const mockRequest = {
  id: 'test-id',
  requester_name: 'Test User',
  requester_email: 'test@example.com',
  request_date: '2026-01-15T10:00:00Z',
  source: AccessRequestSource.MANUAL,
  status: 'denied' as const,
  account_id: 'account-123',
  account: { id: 'account-123', name: 'Beach House' }
};

console.log('=== Access Denial Email Translation Verification ===\n');

// Test with reason
console.log('--- WITH REASON ---');
for (const lang of SUPPORTED_LANGUAGES) {
  console.log(`\n--- Language: ${lang.toUpperCase()} ---`);
  const email = generateAccessDenialEmail(
    mockRequest,
    'User quota exceeded',
    'Beach House',
    lang
  );

  console.log(`Subject: ${email.subject}`);
  console.log(`Body preview (first 300 chars):\n${email.body.substring(0, 300)}...`);
}

// Test without reason
console.log('\n\n--- WITHOUT REASON ---');
for (const lang of SUPPORTED_LANGUAGES) {
  console.log(`\n--- Language: ${lang.toUpperCase()} ---`);
  const email = generateAccessDenialEmail(
    mockRequest,
    undefined,
    'Beach House',
    lang
  );

  console.log(`Subject: ${email.subject}`);
  console.log(`Body preview (first 300 chars):\n${email.body.substring(0, 300)}...`);
}
```

#### Verification Checklist

For each of the 6 supported languages (en, fr, es, de, nl, it):

**With Reason:**

- [ ] **English (en)**
  - Subject contains "Access Request Update"
  - Greeting contains "Hello"
  - Reason section is present
  - Tone is professional and respectful

- [ ] **French (fr)**
  - Subject translated appropriately
  - Greeting translated (e.g., "Bonjour")
  - Reason section present with French label
  - Variables interpolated correctly

- [ ] **Spanish (es)**
  - Subject translated appropriately
  - Greeting translated (e.g., "Hola")
  - Reason section present with Spanish label
  - Variables interpolated correctly

- [ ] **German (de)**
  - Subject translated appropriately
  - Greeting translated (e.g., "Hallo")
  - Formal tone maintained (Sie vs du)
  - Variables interpolated correctly

- [ ] **Dutch (nl)**
  - Subject translated appropriately
  - Greeting translated
  - Variables interpolated correctly

- [ ] **Italian (it)**
  - Subject translated appropriately
  - Greeting translated (e.g., "Ciao" or formal)
  - Variables interpolated correctly

**Without Reason:**

- [ ] All languages: Reason section is NOT present
- [ ] All languages: Email flows naturally without the reason line
- [ ] All languages: No extra blank lines where reason would be

#### Acceptance Criteria

- [ ] All 6 languages generate valid email content
- [ ] No missing translation placeholders (no `{key}` appearing in output)
- [ ] Variable interpolation works in all languages
- [ ] Email structure is consistent across languages
- [ ] Date formatting respects locale
- [ ] Conditional reason section works correctly in all languages
- [ ] Professional tone maintained across all languages

---

## Complete Implementation Checklist

### Code Changes

- [ ] **Task 1**: Import statements verified/added (getEmailTranslation, SupportedLanguage, DEFAULT_LANGUAGE)
- [ ] **Task 2**: Function signature updated with `language` parameter
- [ ] **Task 3**: `emailVariables` object and translation helpers created
- [ ] **Task 4**: Subject line uses translation function
- [ ] **Task 5**: Conditional reason section implemented
- [ ] **Task 6**: Email body uses translation functions (12 strings replaced)
- [ ] **Task 7**: Variables object preserved with localized date

### Quality Assurance

- [ ] **Task 8**: Build passes without errors
- [ ] **Task 9**: Unit tests pass
- [ ] **Task 10**: Manual verification in all 6 languages complete

### Documentation

- [ ] Code comments updated with localization references
- [ ] JSDoc updated for new parameter and existing parameters
- [ ] "Last Modified" date updated in file header (if not already by Task 2I.3)

---

## Complete Code Example

Here is the complete updated function for reference:

```typescript
/**
 * Generate access denial email template
 * @param request - Access request data
 * @param reason - Optional denial reason
 * @param accountName - Optional account name
 * @param language - Preferred language for email content (defaults to English)
 */
export function generateAccessDenialEmail(
  request: AccessRequest,
  reason?: string,
  accountName?: string,
  language: SupportedLanguage = DEFAULT_LANGUAGE
): EmailTemplate {
  const requesterName = request.requester_name || 'there';
  const accountDisplayName = accountName || 'Account';

  // Variables for translation interpolation
  const emailVariables = {
    name: requesterName,
    accountName: accountDisplayName,
    reason: reason || '',
    requestDate: new Date(request.request_date).toLocaleDateString(language, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
  };

  // Translation helper functions
  const t = (key: string) => getEmailTranslation(key, language, emailVariables);
  const tCommon = (key: string) => getEmailTranslation(`common.${key}`, language, emailVariables);

  // Conditionally include reason section
  const reasonSection = reason
    ? `\n${t('accessDenial.reasonLabel')}\n`
    : '';

  return {
    subject: t('accessDenial.subject'),
    body: `${tCommon('greeting')}

${t('accessDenial.intro')}

${t('accessDenial.message')}
${reasonSection}
${t('accessDenial.requestDetailsHeading')}
- ${t('accessDenial.accountLabel')}
- ${t('accessDenial.requestedOnLabel')}

${t('accessDenial.contactNote')}

${tCommon('regards')}
${tCommon('team')}

${tCommon('separator')}
${tCommon('footer')}`,
    variables: {
      requesterName,
      accountName: accountDisplayName,
      reason: reason || '',
      requestDate: new Date(request.request_date).toLocaleDateString(language, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      language
    }
  };
}
```

---

## Files Modified Summary

| File | Change Type | Description |
|------|-------------|-------------|
| `/src/lib/email-templates.ts` | Modified | Add language support to `generateAccessDenialEmail` |
| `/src/lib/__tests__/email-templates.test.ts` | Created/Modified | Unit tests for translation integration |

---

## Dependencies on Other Tasks

### Upstream Dependencies (Required Before Starting)

| Task | Description | Status Check |
|------|-------------|--------------|
| 2I.1 (REQ-E02-019) | Emails namespace in messages files | Check `/messages/en.json` has `emails.accessDenial.*` keys |
| 2I.2 (REQ-E02-020) | `getEmailTranslation` utility | Check `/src/lib/l10n/emails/` exists |

### Parallel Tasks (Can Run Concurrently)

| Task | Description |
|------|-------------|
| 2I.3 (REQ-E02-021) | Update `generateAccessApprovalEmail` (may share imports) |
| 2I.5 | Update `generateBetaAccessApprovalEmail` |
| 2I.6 | Update `generateRegistrationReminderEmail` |

### Downstream Dependencies (Blocked by This Task)

| Task | Description |
|------|-------------|
| 2I.7 | Add language parameter to all email function calls in API routes |
| 2I.8 | Generate translations for 5 non-English languages |
| 2I.9 | Test email generation in each language |

---

## Risk Mitigation

### Potential Issues and Solutions

| Issue | Likelihood | Solution |
|-------|------------|----------|
| Missing translation keys | Medium | Run verification script; getEmailTranslation returns key path as fallback |
| Variable name mismatch | Low | Match variable names exactly with Task 2I.1 specification |
| Date formatting issues | Low | Use Intl.DateTimeFormat with explicit options |
| Reason section formatting | Low | Test both with and without reason in all languages |
| Tone issues in translations | Medium | Professional review of translations in Task 2I.8 |

### Rollback Plan

If issues are discovered in production:

1. Revert the `language` parameter (change default to always use 'en')
2. Remove translation function calls, restore original hardcoded strings
3. Email functionality returns to English-only mode

---

## Success Validation

### Automated Checks

```bash
# Run after implementation
npm run build              # Must pass
npm run test -- email-templates  # Must pass
npx tsc --noEmit           # Must pass
```

### Manual Checks

1. Generate email with default parameters (no language) - should produce English email
2. Generate email with `language='en'` - should produce identical English email
3. Generate email with `language='fr'` - should produce French email
4. Generate email with reason provided - reason section should appear
5. Generate email without reason - reason section should NOT appear
6. Verify variable interpolation in non-English languages
7. Test with missing requester_name (should use "there" fallback)
8. Verify professional tone maintained across all languages

---

## Estimated Total Effort

| Task | Story Points | Time Estimate |
|------|--------------|---------------|
| Task 1: Verify/Add Imports | 0.25 | 5 min |
| Task 2: Update Signature | 0.5 | 10 min |
| Task 3: Variables & Helpers | 0.75 | 15 min |
| Task 4: Subject Line | 0.25 | 5 min |
| Task 5: Conditional Reason | 0.5 | 10 min |
| Task 6: Body Content | 1.5 | 25 min |
| Task 7: Preserve Variables | 0.25 | 5 min |
| Task 8: Build Verification | 0.5 | 10 min |
| Task 9: Unit Tests | 1.5 | 25 min |
| Task 10: Manual Verification | 0.75 | 15 min |
| **Total** | **6.75** | **~2 hours** |

---

## Special Considerations

### Tone and Messaging

Access denial emails require special attention to tone:

- **Professional**: Business-appropriate language
- **Respectful**: Acknowledge the user's interest
- **Clear**: Unambiguous about the outcome
- **Helpful**: Provide guidance for next steps (contact owner)
- **Non-confrontational**: Avoid accusatory language

When translations are generated in Task 2I.8, ensure:
- Professional tone maintained in all languages
- Cultural sensitivity respected
- Formal/informal address appropriate (e.g., "vous" vs "tu" in French, "Sie" vs "du" in German)
- Negative outcome communicated respectfully

### Conditional Content

The optional reason field adds complexity:
- When present: Include "Reason: {reason}" line
- When absent: Email should flow naturally without the reason section
- No extra blank lines should appear when reason is omitted
- Test both scenarios in all languages

---

*End of Detailed Task Breakdown*
