# REQ-E02-021: Update `generateAccessApprovalEmail` Function - Detailed Task Breakdown

*Generated: 2026-01-20 16:45:00 UTC*
*Last Modified: 2026-01-20 16:45:00 UTC*

## Reference

- **Request ID**: REQ-E02-021
- **Overview Document**: docs/REQ-E02-021-update-generateaccessapprovalemail-function-overview.md
- **Requirements Source**: docs/gen_requests_epic2.md (Request #21)
- **Implementation Plan**: docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md
- **Sub-Epic**: 2I - Email Templates
- **Task ID**: 2I.3
- **Title**: Update `generateAccessApprovalEmail` function
- **Size**: S (Small)
- **Type**: Enhancement
- **Depends On**:
  - Epic 1 (L10N Foundation - next-intl setup)
  - REQ-E02-019 (Task 2I.1 - Emails Namespace Structure)
  - REQ-E02-020 (Task 2I.2 - Email Translation Utility Function)

---

## Executive Summary

This task updates the `generateAccessApprovalEmail` function in `/src/lib/email-templates.ts` to support multi-language email generation. The function currently contains ~25 hardcoded English strings that will be replaced with calls to the `getEmailTranslation` utility created in Task 2I.2. The implementation maintains full backward compatibility while enabling access approval emails to be sent in the recipient's preferred language.

---

## Pre-Implementation Checklist

Before starting implementation, verify the following dependencies are complete:

- [ ] Epic 1 foundation is complete (next-intl installed and configured)
- [ ] Task 2I.1 (REQ-E02-019) is complete - emails namespace exists in `/messages/*.json`
- [ ] Task 2I.2 (REQ-E02-020) is complete - `getEmailTranslation` utility exists at `/src/lib/l10n/emails/`
- [ ] `SupportedLanguage` and `DEFAULT_LANGUAGE` types are available from translation service

---

## Task Breakdown

### Task 1: Add Imports for Translation Utilities

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
2. Add import for `getEmailTranslation` from `@/lib/l10n/emails`
3. Add import for `SupportedLanguage` and `DEFAULT_LANGUAGE` from translation service types
4. Update the "Last Modified" comment to reflect current date and localization addition

#### Acceptance Criteria

- [ ] `getEmailTranslation` is imported from correct path
- [ ] `SupportedLanguage` type is imported
- [ ] `DEFAULT_LANGUAGE` constant is imported
- [ ] No import errors in IDE
- [ ] File compiles without TypeScript errors

---

### Task 2: Update Function Signature with Language Parameter

**File**: `/src/lib/email-templates.ts`
**Location**: Lines 9-21 (function signature and JSDoc)
**Estimated Effort**: 10 minutes
**Story Points**: 0.5

#### Current State (Lines 9-21)

```typescript
/**
 * Generate access approval email template
 * @param request - Access request data
 * @param accessCode - Generated access code
 * @param accountName - Optional account name
 * @param baseUrl - Optional base URL for links (defaults to getServerBaseUrl())
 */
export function generateAccessApprovalEmail(
  request: AccessRequest,
  accessCode: string,
  accountName?: string,
  baseUrl?: string
): EmailTemplate {
```

#### Target State

```typescript
/**
 * Generate access approval email template
 * @param request - Access request data
 * @param accessCode - Generated access code
 * @param accountName - Optional account name
 * @param baseUrl - Optional base URL for links (defaults to getServerBaseUrl())
 * @param language - Preferred language for email content (defaults to English)
 */
export function generateAccessApprovalEmail(
  request: AccessRequest,
  accessCode: string,
  accountName?: string,
  baseUrl?: string,
  language: SupportedLanguage = DEFAULT_LANGUAGE
): EmailTemplate {
```

#### Implementation Steps

1. Add `@param language` JSDoc entry describing the new parameter
2. Add `language: SupportedLanguage = DEFAULT_LANGUAGE` as the fifth parameter
3. Ensure parameter has default value for backward compatibility
4. Verify TypeScript compiles without errors

#### Acceptance Criteria

- [ ] New `language` parameter added with correct type `SupportedLanguage`
- [ ] Default value set to `DEFAULT_LANGUAGE` for backward compatibility
- [ ] JSDoc updated with new parameter description
- [ ] Existing calls without language parameter still work (backward compatible)
- [ ] TypeScript compiles without errors

---

### Task 3: Update Beta Request Delegation

**File**: `/src/lib/email-templates.ts`
**Location**: Lines 26-28 (beta request handling)
**Estimated Effort**: 5 minutes
**Story Points**: 0.25

#### Current State (Lines 26-28)

```typescript
  // Handle beta requests differently
  if (isBetaRequest) {
    return generateBetaAccessApprovalEmail(request, accessCode, accountName, baseUrl);
  }
```

#### Target State

```typescript
  // Handle beta requests differently
  if (isBetaRequest) {
    return generateBetaAccessApprovalEmail(request, accessCode, accountName, baseUrl, language);
  }
```

#### Implementation Steps

1. Add `language` parameter to the `generateBetaAccessApprovalEmail` function call
2. Note: This will cause a TypeScript error until Task 2I.5 updates `generateBetaAccessApprovalEmail`

#### Handling TypeScript Error

Since `generateBetaAccessApprovalEmail` will be updated in Task 2I.5, you have two options:

**Option A (Recommended if Task 2I.5 is not yet complete):**
Use type assertion temporarily:
```typescript
return generateBetaAccessApprovalEmail(request, accessCode, accountName, baseUrl, language as string);
```

**Option B (If Task 2I.5 is complete):**
No special handling needed - just pass `language` directly.

#### Acceptance Criteria

- [ ] `language` parameter is forwarded to beta email function
- [ ] Code handles TypeScript compatibility appropriately
- [ ] Beta access approval emails will use correct language when Task 2I.5 is complete

---

### Task 4: Create Email Variables Object

**File**: `/src/lib/email-templates.ts`
**Location**: After line 32 (after `directRegistrationLink` declaration)
**Estimated Effort**: 10 minutes
**Story Points**: 0.5

#### Current State (Lines 30-32)

```typescript
  const accountDisplayName = accountName || 'Account';
  const registrationLink = createRegistrationLink(baseUrl);
  const directRegistrationLink = createRegistrationLinkWithCode(accessCode, request.requester_email, baseUrl);
```

#### Target State

```typescript
  const accountDisplayName = accountName || 'Account';
  const registrationLink = createRegistrationLink(baseUrl);
  const directRegistrationLink = createRegistrationLinkWithCode(accessCode, request.requester_email, baseUrl);

  // Variables for translation interpolation
  const emailVariables = {
    name: requesterName,
    accountName: accountDisplayName,
    accessCode,
    requestDate: new Date(request.request_date).toLocaleDateString(language, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    directLink: directRegistrationLink,
    registrationLink,
  };

  // Translation helper functions
  const t = (key: string) => getEmailTranslation(key, language, emailVariables);
  const tCommon = (key: string) => getEmailTranslation(`common.${key}`, language, emailVariables);
```

#### Implementation Steps

1. Create `emailVariables` object containing all dynamic values for interpolation
2. Use `toLocaleDateString` with language parameter for localized date formatting
3. Create `t` helper function for `accessApproval.*` translation keys
4. Create `tCommon` helper function for `common.*` translation keys (greeting, footer, etc.)

#### Acceptance Criteria

- [ ] `emailVariables` object contains all required interpolation values
- [ ] Date formatting respects the `language` parameter
- [ ] `t` helper retrieves translations from `accessApproval.*` namespace
- [ ] `tCommon` helper retrieves translations from `common.*` namespace
- [ ] Variable names match those defined in email translation keys from Task 2I.1

---

### Task 5: Replace Subject Line with Translation

**File**: `/src/lib/email-templates.ts`
**Location**: Line 35 (subject in return statement)
**Estimated Effort**: 5 minutes
**Story Points**: 0.25

#### Current State (Line 35)

```typescript
    subject: `Access Granted: ${accountDisplayName} - Your Access Code`,
```

#### Target State

```typescript
    subject: t('accessApproval.subject'),
```

#### Implementation Steps

1. Replace hardcoded subject string template with `t('accessApproval.subject')` call
2. Verify translation key exists in `/messages/en.json` emails namespace

#### Expected Translation Key (from Task 2I.1)

```json
{
  "emails": {
    "accessApproval": {
      "subject": "Access Granted: {accountName} - Your Access Code"
    }
  }
}
```

#### Acceptance Criteria

- [ ] Subject line uses `t('accessApproval.subject')` call
- [ ] English output matches original: "Access Granted: {accountName} - Your Access Code"
- [ ] `{accountName}` is properly interpolated from `emailVariables`

---

### Task 6: Replace Email Body Content with Translations

**File**: `/src/lib/email-templates.ts`
**Location**: Lines 36-64 (body in return statement)
**Estimated Effort**: 30 minutes
**Story Points**: 2

#### Current State (Lines 36-64)

```typescript
    body: `Hello ${requesterName},

Great news! Your access request for "${accountDisplayName}" has been approved.

Your Access Details:
• Account: ${accountDisplayName}
• Access Code: ${accessCode}
• Requested on: ${new Date(request.request_date).toLocaleDateString()}

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
```

#### Target State

```typescript
    body: `${tCommon('greeting')}

${t('accessApproval.intro')}

${t('accessApproval.accessDetailsHeading')}
- ${t('accessApproval.accountLabel')}
- ${t('accessApproval.accessCodeLabel')}
- ${t('accessApproval.requestedOnLabel')}

${t('accessApproval.instructionsHeading')}
1. ${t('accessApproval.step1')}
   ${t('accessApproval.step1Note')}
2. ${t('accessApproval.step2')}
3. ${t('accessApproval.step3')}

${t('accessApproval.yourAccessCode')}
${t('accessApproval.directRegistrationLink')}

${t('accessApproval.notesHeading')}
- ${t('accessApproval.note1')}
- ${t('accessApproval.note2')}
- ${t('accessApproval.note3')}

${tCommon('regards')}
${tCommon('team')}

${tCommon('separator')}
${tCommon('footer')}
${tCommon('footerSupport')}`,
```

#### Translation Key Mapping

| Original Text | Translation Key |
|---------------|-----------------|
| `Hello ${requesterName},` | `common.greeting` |
| `Great news! Your access request...` | `accessApproval.intro` |
| `Your Access Details:` | `accessApproval.accessDetailsHeading` |
| `Account: ${accountDisplayName}` | `accessApproval.accountLabel` |
| `Access Code: ${accessCode}` | `accessApproval.accessCodeLabel` |
| `Requested on: ${date}` | `accessApproval.requestedOnLabel` |
| `To complete your access setup:` | `accessApproval.instructionsHeading` |
| `1. Click this direct registration link...` | `accessApproval.step1` |
| `(This link pre-fills...)` | `accessApproval.step1Note` |
| `2. Complete your account registration` | `accessApproval.step2` |
| `3. Start exploring...` | `accessApproval.step3` |
| `Your access code: ${accessCode}` | `accessApproval.yourAccessCode` |
| `Direct registration link: ${link}` | `accessApproval.directRegistrationLink` |
| `Important Notes:` | `accessApproval.notesHeading` |
| Note about keeping code secure | `accessApproval.note1` |
| Note about code validity | `accessApproval.note2` |
| Note about contacting owner | `accessApproval.note3` |
| `Best regards,` | `common.regards` |
| `The FAQBNB Team` | `common.team` |
| `---` | `common.separator` |
| Automated message disclaimer | `common.footer` |
| Support contact info | `common.footerSupport` |

#### Implementation Steps

1. Replace greeting with `tCommon('greeting')`
2. Replace intro message with `t('accessApproval.intro')`
3. Replace access details section heading with `t('accessApproval.accessDetailsHeading')`
4. Replace each bullet point with appropriate translation key
5. Replace instructions section heading with `t('accessApproval.instructionsHeading')`
6. Replace each numbered step with appropriate translation key
7. Replace access code display line with `t('accessApproval.yourAccessCode')`
8. Replace direct link display with `t('accessApproval.directRegistrationLink')`
9. Replace notes section heading with `t('accessApproval.notesHeading')`
10. Replace each note with appropriate translation key
11. Replace sign-off with `tCommon('regards')` and `tCommon('team')`
12. Replace footer with `tCommon('separator')`, `tCommon('footer')`, `tCommon('footerSupport')`

#### Acceptance Criteria

- [ ] All 25 hardcoded strings are replaced with translation function calls
- [ ] Email structure (sections, bullet points, numbered list) is preserved
- [ ] All variable interpolations work correctly
- [ ] English output matches original email content exactly
- [ ] No hardcoded English text remains in the body

---

### Task 7: Preserve Variables Object in Return Statement

**File**: `/src/lib/email-templates.ts`
**Location**: Lines 65-72 (variables in return statement)
**Estimated Effort**: 5 minutes
**Story Points**: 0.25

#### Current State (Lines 65-72)

```typescript
    variables: {
      requesterName,
      accountName: accountDisplayName,
      accessCode,
      requestDate: new Date(request.request_date).toLocaleDateString(),
      registrationLink,
      directRegistrationLink
    }
```

#### Target State

```typescript
    variables: {
      requesterName,
      accountName: accountDisplayName,
      accessCode,
      requestDate: new Date(request.request_date).toLocaleDateString(language, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      registrationLink,
      directRegistrationLink,
      language
    }
```

#### Implementation Steps

1. Keep the existing variables for backward compatibility with `renderEmailHTML`
2. Update `requestDate` to use localized date formatting
3. Optionally add `language` to variables for downstream use

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
**Estimated Effort**: 30 minutes
**Story Points**: 2

#### Test Cases to Implement

```typescript
import { generateAccessApprovalEmail } from '../email-templates';
import { AccessRequest, AccessRequestSource } from '@/types/admin';

describe('generateAccessApprovalEmail', () => {
  const mockRequest: AccessRequest = {
    id: 'test-id',
    requester_name: 'John Doe',
    requester_email: 'john@example.com',
    request_date: '2026-01-15T10:00:00Z',
    source: AccessRequestSource.MANUAL,
    status: 'approved',
    account_id: 'account-123',
    account: { id: 'account-123', name: 'Beach House' }
  };

  describe('backward compatibility', () => {
    it('should generate English email when no language specified', () => {
      const result = generateAccessApprovalEmail(
        mockRequest,
        'ABC123DEF456',
        'Beach House',
        'https://example.com'
      );

      expect(result.subject).toContain('Access Granted');
      expect(result.body).toContain('Hello John Doe');
      expect(result.body).toContain('ABC123DEF456');
    });

    it('should return EmailTemplate with required fields', () => {
      const result = generateAccessApprovalEmail(
        mockRequest,
        'ABC123DEF456',
        'Beach House'
      );

      expect(result).toHaveProperty('subject');
      expect(result).toHaveProperty('body');
      expect(result).toHaveProperty('variables');
    });
  });

  describe('language support', () => {
    it('should generate English email when language is "en"', () => {
      const result = generateAccessApprovalEmail(
        mockRequest,
        'ABC123DEF456',
        'Beach House',
        'https://example.com',
        'en'
      );

      expect(result.subject).toContain('Access Granted');
      expect(result.body).toContain('Hello');
    });

    it('should generate French email when language is "fr"', () => {
      const result = generateAccessApprovalEmail(
        mockRequest,
        'ABC123DEF456',
        'Beach House',
        'https://example.com',
        'fr'
      );

      // Verify French content (actual text depends on translations)
      expect(result.subject).toBeTruthy();
      expect(result.body).toBeTruthy();
    });

    it('should fallback to English for unsupported language', () => {
      const result = generateAccessApprovalEmail(
        mockRequest,
        'ABC123DEF456',
        'Beach House',
        'https://example.com',
        'xyz' as any // Invalid language
      );

      // Should fallback to English
      expect(result.subject).toContain('Access Granted');
    });
  });

  describe('variable interpolation', () => {
    it('should interpolate account name correctly', () => {
      const result = generateAccessApprovalEmail(
        mockRequest,
        'ABC123DEF456',
        'My Beach House',
        'https://example.com',
        'en'
      );

      expect(result.subject).toContain('My Beach House');
      expect(result.body).toContain('My Beach House');
    });

    it('should interpolate access code correctly', () => {
      const result = generateAccessApprovalEmail(
        mockRequest,
        'XYZ789ABC123',
        'Beach House',
        'https://example.com',
        'en'
      );

      expect(result.body).toContain('XYZ789ABC123');
    });

    it('should interpolate requester name correctly', () => {
      const result = generateAccessApprovalEmail(
        mockRequest,
        'ABC123DEF456',
        'Beach House',
        'https://example.com',
        'en'
      );

      expect(result.body).toContain('John Doe');
    });

    it('should use fallback name when requester_name is empty', () => {
      const requestWithoutName = { ...mockRequest, requester_name: '' };
      const result = generateAccessApprovalEmail(
        requestWithoutName,
        'ABC123DEF456',
        'Beach House',
        'https://example.com',
        'en'
      );

      expect(result.body).toContain('there');
    });
  });

  describe('beta request delegation', () => {
    it('should delegate to beta email function for beta requests', () => {
      const betaRequest = {
        ...mockRequest,
        source: AccessRequestSource.BETA_WAITLIST
      };
      const result = generateAccessApprovalEmail(
        betaRequest,
        'ABC123DEF456',
        'Beach House',
        'https://example.com',
        'en'
      );

      // Beta emails have different content
      expect(result.subject).toContain('Beta');
    });
  });
});
```

#### Implementation Steps

1. Create or update test file at `/src/lib/__tests__/email-templates.test.ts`
2. Add test cases for backward compatibility
3. Add test cases for each supported language
4. Add test cases for variable interpolation
5. Add test cases for fallback behavior
6. Run tests: `npm test -- email-templates`

#### Acceptance Criteria

- [ ] All test cases pass
- [ ] Backward compatibility tests verify existing calls work
- [ ] Language-specific tests verify translations load
- [ ] Variable interpolation tests pass
- [ ] Fallback behavior tests pass

---

### Task 10: Manual Verification in All Languages

**Estimated Effort**: 20 minutes
**Story Points**: 1

#### Verification Script

Create a temporary script to verify email generation:

```typescript
// scripts/verify-email-translations.ts
import { generateAccessApprovalEmail } from '../src/lib/email-templates';
import { AccessRequestSource } from '../src/types/admin';

const SUPPORTED_LANGUAGES = ['en', 'fr', 'es', 'de', 'nl', 'it'] as const;

const mockRequest = {
  id: 'test-id',
  requester_name: 'Test User',
  requester_email: 'test@example.com',
  request_date: '2026-01-15T10:00:00Z',
  source: AccessRequestSource.MANUAL,
  status: 'approved' as const,
  account_id: 'account-123',
  account: { id: 'account-123', name: 'Beach House' }
};

console.log('=== Email Translation Verification ===\n');

for (const lang of SUPPORTED_LANGUAGES) {
  console.log(`\n--- Language: ${lang.toUpperCase()} ---`);
  const email = generateAccessApprovalEmail(
    mockRequest,
    'ABC123DEF456',
    'Beach House',
    'https://faqbnb.com',
    lang
  );

  console.log(`Subject: ${email.subject}`);
  console.log(`Body preview (first 200 chars):\n${email.body.substring(0, 200)}...`);
  console.log(`\nVariables:`, email.variables);
}
```

#### Verification Checklist

For each of the 6 supported languages (en, fr, es, de, nl, it):

- [ ] **English (en)**
  - Subject contains "Access Granted"
  - Greeting contains "Hello"
  - All sections present and formatted correctly

- [ ] **French (fr)**
  - Subject translated (e.g., "Accès Accordé")
  - Greeting translated (e.g., "Bonjour")
  - Variables interpolated correctly

- [ ] **Spanish (es)**
  - Subject translated (e.g., "Acceso Concedido")
  - Greeting translated (e.g., "Hola")
  - Variables interpolated correctly

- [ ] **German (de)**
  - Subject translated (e.g., "Zugang Gewährt")
  - Greeting translated (e.g., "Hallo")
  - Variables interpolated correctly

- [ ] **Dutch (nl)**
  - Subject translated (e.g., "Toegang Verleend")
  - Greeting translated (e.g., "Hallo")
  - Variables interpolated correctly

- [ ] **Italian (it)**
  - Subject translated (e.g., "Accesso Concesso")
  - Greeting translated (e.g., "Ciao")
  - Variables interpolated correctly

#### Acceptance Criteria

- [ ] All 6 languages generate valid email content
- [ ] No missing translation placeholders (no `{key}` appearing in output)
- [ ] Variable interpolation works in all languages
- [ ] Email structure is consistent across languages
- [ ] Date formatting respects locale

---

## Complete Implementation Checklist

### Code Changes

- [ ] **Task 1**: Import statements added (getEmailTranslation, SupportedLanguage, DEFAULT_LANGUAGE)
- [ ] **Task 2**: Function signature updated with `language` parameter
- [ ] **Task 3**: Beta request delegation forwards `language` parameter
- [ ] **Task 4**: `emailVariables` object and translation helpers created
- [ ] **Task 5**: Subject line uses translation function
- [ ] **Task 6**: Email body uses translation functions (25 strings replaced)
- [ ] **Task 7**: Variables object preserved with localized date

### Quality Assurance

- [ ] **Task 8**: Build passes without errors
- [ ] **Task 9**: Unit tests pass
- [ ] **Task 10**: Manual verification in all 6 languages complete

### Documentation

- [ ] Code comments updated with localization references
- [ ] JSDoc updated for new parameter
- [ ] "Last Modified" date updated in file header

---

## Files Modified Summary

| File | Change Type | Description |
|------|-------------|-------------|
| `/src/lib/email-templates.ts` | Modified | Add language support to `generateAccessApprovalEmail` |
| `/src/lib/__tests__/email-templates.test.ts` | Created/Modified | Unit tests for translation integration |

---

## Dependencies on Other Tasks

### Upstream Dependencies (Required Before Starting)

| Task | Description | Status Check |
|------|-------------|--------------|
| 2I.1 (REQ-E02-019) | Emails namespace in messages files | Check `/messages/en.json` has `emails.accessApproval.*` keys |
| 2I.2 (REQ-E02-020) | `getEmailTranslation` utility | Check `/src/lib/l10n/emails/` exists |

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
| TypeScript error with beta function | High (if Task 2I.5 not done) | Use type assertion or complete Task 2I.5 first |
| Variable name mismatch | Low | Match variable names exactly with Task 2I.1 specification |
| Date formatting issues | Low | Use Intl.DateTimeFormat with explicit options |

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
4. Verify variable interpolation in non-English languages
5. Test with missing requester_name (should use "there" fallback)

---

## Estimated Total Effort

| Task | Story Points | Time Estimate |
|------|--------------|---------------|
| Task 1: Add Imports | 0.25 | 5 min |
| Task 2: Update Signature | 0.5 | 10 min |
| Task 3: Beta Delegation | 0.25 | 5 min |
| Task 4: Variables Object | 0.5 | 10 min |
| Task 5: Subject Line | 0.25 | 5 min |
| Task 6: Body Content | 2 | 30 min |
| Task 7: Preserve Variables | 0.25 | 5 min |
| Task 8: Build Verification | 0.5 | 10 min |
| Task 9: Unit Tests | 2 | 30 min |
| Task 10: Manual Verification | 1 | 20 min |
| **Total** | **7.5** | **~2-2.5 hours** |

---

*End of Detailed Task Breakdown*
