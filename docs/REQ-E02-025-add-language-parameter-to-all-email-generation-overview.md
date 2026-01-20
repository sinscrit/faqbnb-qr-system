# REQ-E02-025: Add Language Parameter to All Email Generation Functions - Implementation Overview

*Generated: 2026-01-20 19:45:00 UTC*
*Last Modified: 2026-01-20 19:45:00 UTC*

## Reference

- **Request**: REQ-E02-025 (Add Language Parameter to All Email Generation Functions)
- **Source**: docs/gen_requests_epic2.md
- **Implementation Plan**: docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md
- **Type**: Enhancement
- **Phase**: 2I (Email Templates)
- **Task ID**: 2I.7
- **Size**: M (Medium)
- **Epic**: Localization Epic 2 - Static UI Translation
- **Depends On**:
  - Epic 1 (L10N Foundation - next-intl setup)
  - REQ-E02-019 (Task 2I.1 - Emails Namespace Structure)
  - REQ-E02-020 (Task 2I.2 - Email Translation Utility Function)
  - REQ-E02-021 (Task 2I.3 - Update `generateAccessApprovalEmail`)
  - REQ-E02-022 (Task 2I.4 - Update `generateAccessDenialEmail`)
  - REQ-E02-023 (Task 2I.5 - Update `generateBetaAccessApprovalEmail`)
  - REQ-E02-024 (Task 2I.6 - Update `generateRegistrationReminderEmail`)

## Summary

Ensure all email generation functions throughout the codebase consistently accept a language parameter to enable email content generation in the recipient's preferred language. This task focuses on:

1. **Auditing all email generation function calls** across the codebase
2. **Updating calling code** to pass the recipient's language preference
3. **Establishing consistent patterns** for language parameter handling
4. **Documenting standards** for future email function implementations
5. **Creating linting/review guidelines** to enforce language parameter inclusion

This is the integration task that connects the localized email generation functions (created in Tasks 2I.3-2I.6) with the actual code paths that invoke them.

## Goals

1. Ensure every call to an email generation function passes the recipient's language preference
2. Establish a consistent naming convention for the language parameter across all functions
3. Implement fallback logic for cases where language preference is unavailable
4. Update API routes and server-side code to retrieve and pass user language preferences
5. Create code patterns and documentation for maintainability
6. Verify all email types can be sent in all 6 supported languages
7. Prevent regression by establishing guidelines for new email function implementations

## Context from Implementation Plan

### Email Generation Functions (from `/src/lib/email-templates.ts`)

After Tasks 2I.3-2I.6, these functions should all accept a `language` parameter:

| Function | Location | Parameters |
|----------|----------|------------|
| `generateAccessApprovalEmail` | Lines 16-74 | `request, accessCode, accountName?, baseUrl?, language?` |
| `generateBetaAccessApprovalEmail` | Lines 84-149 | `request, accessCode, accountName?, baseUrl?, language?` |
| `generateAccessDenialEmail` | Lines 305-341 | `request, reason?, accountName?, language?` |
| `generateRegistrationReminderEmail` | Lines 351-396 | `request, accessCode, daysSinceApproval, accountName?, baseUrl?, language?` |

### Current Calling Locations

Based on codebase analysis, these locations call email generation functions:

| File | Function Called | Current Call Pattern |
|------|-----------------|---------------------|
| `/src/app/api/admin/access-requests/[requestId]/grant/route.ts` | `generateAccessApprovalEmail` | Lines 251-256 |
| Test files | All functions | Various test patterns |
| `/src/components/EmailPopup.tsx` | Email preview | Component rendering |

### Language Preference Sources

User language preferences can be determined from:

1. **User account settings**: Stored language preference in user profile (if available)
2. **Access request metadata**: Could store requester's preferred language
3. **Request context**: Accept-Language header parsing
4. **System default**: Fall back to English ('en')

## Implementation Order

### Step 1: Audit All Email Function Calls

Identify all locations where email generation functions are invoked.

### Step 2: Define Language Resolution Strategy

Establish how to determine recipient language for each call site:

```typescript
// Priority order for language determination
function getRecipientLanguage(
  request: AccessRequest,
  requestContext?: NextRequest
): SupportedLanguage {
  // 1. Check access request metadata for stored language preference
  if (request.metadata?.language && isSupportedLanguage(request.metadata.language)) {
    return request.metadata.language;
  }

  // 2. Check request context (Accept-Language header)
  if (requestContext) {
    const acceptLanguage = requestContext.headers.get('accept-language');
    const parsed = parseAcceptLanguage(acceptLanguage);
    if (parsed && isSupportedLanguage(parsed)) {
      return parsed;
    }
  }

  // 3. Fall back to default
  return DEFAULT_LANGUAGE;
}
```

### Step 3: Update API Routes

Add language parameter to all email generation calls in API routes.

### Step 4: Update Test Files

Ensure tests cover language parameter for all email functions.

### Step 5: Create Documentation and Guidelines

Document patterns for future implementations and code reviews.

### Step 6: Add Linting/Validation (Optional)

Create ESLint rules or pre-commit hooks to enforce language parameter usage.

## Authorized Files and Functions for Modification

### Files to Modify

#### `/src/app/api/admin/access-requests/[requestId]/grant/route.ts`

- **Purpose**: API endpoint for granting access requests
- **Current State**: Calls `generateAccessApprovalEmail` without language parameter
- **Modification Required**:
  - Import language utilities
  - Determine recipient language
  - Pass language to email generation function

**Changes to implement:**

1. **Add imports** (top of file):

```typescript
import {
  SupportedLanguage,
  DEFAULT_LANGUAGE,
  isSupportedLanguage
} from '@/lib/translation-service/translation-service.types';
```

2. **Add language resolution function** (or import if created separately):

```typescript
/**
 * Determine the recipient's preferred language for email content
 * @param accessRequest - The access request containing requester info
 * @param request - The incoming HTTP request (for Accept-Language header)
 * @returns The determined language or default
 */
function getRecipientLanguage(
  accessRequest: AccessRequest,
  request: NextRequest
): SupportedLanguage {
  // Check access request metadata for stored language preference
  const metadataLanguage = accessRequest.metadata?.preferredLanguage;
  if (metadataLanguage && isSupportedLanguage(metadataLanguage)) {
    return metadataLanguage as SupportedLanguage;
  }

  // Check Accept-Language header as fallback
  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage) {
    // Parse first language from header (e.g., "fr-FR,fr;q=0.9,en;q=0.8" -> "fr")
    const primaryLanguage = acceptLanguage.split(',')[0]?.split('-')[0]?.toLowerCase();
    if (primaryLanguage && isSupportedLanguage(primaryLanguage)) {
      return primaryLanguage as SupportedLanguage;
    }
  }

  return DEFAULT_LANGUAGE;
}
```

3. **Update email generation call** (around line 251-256):

```typescript
// Before
emailData = email_template || generateAccessApprovalEmail(
  accessRequest,
  accessCode,
  accessRequest.account.name,
  baseUrl
);

// After
const recipientLanguage = getRecipientLanguage(accessRequest, request);
emailData = email_template || generateAccessApprovalEmail(
  accessRequest,
  accessCode,
  accessRequest.account.name,
  baseUrl,
  recipientLanguage
);
```

#### `/src/lib/email-service.ts`

- **Purpose**: Email service abstraction layer
- **Current State**: May not handle language preferences
- **Modification Required**:
  - Consider adding language to email metadata
  - Ensure language is logged for debugging

**Optional enhancement:**

```typescript
export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  deliveryStatus: 'sent' | 'failed' | 'pending';
  timestamp: string;
  language?: SupportedLanguage; // Add for tracking
}
```

### Files to Create

#### `/src/lib/l10n/emails/language-resolution.ts`

- **Purpose**: Centralized language resolution utilities for email generation
- **Contents**:

```typescript
/**
 * Language Resolution Utilities for Email Generation
 * Part of REQ-E02-025: Add Language Parameter to All Email Generation Functions
 *
 * Provides utilities to determine recipient language preference for email content.
 *
 * @module l10n/emails/language-resolution
 * @created 2026-01-20
 */

import { NextRequest } from 'next/server';
import { AccessRequest } from '@/types/admin';
import {
  SupportedLanguage,
  DEFAULT_LANGUAGE,
  isSupportedLanguage,
} from '@/lib/translation-service/translation-service.types';

/**
 * Priority order for language resolution:
 * 1. Explicit language in access request metadata
 * 2. Accept-Language header from request context
 * 3. Default language (English)
 */

/**
 * Parse Accept-Language header and return the first supported language.
 *
 * @param acceptLanguage - Accept-Language header value
 * @returns First supported language or undefined
 *
 * @example
 * parseAcceptLanguage('fr-FR,fr;q=0.9,en;q=0.8') // Returns 'fr'
 * parseAcceptLanguage('zh-CN,en;q=0.8') // Returns 'en' (zh not supported)
 */
export function parseAcceptLanguage(
  acceptLanguage: string | null
): SupportedLanguage | undefined {
  if (!acceptLanguage) return undefined;

  // Parse and sort by quality value
  const languages = acceptLanguage
    .split(',')
    .map((lang) => {
      const [code, quality] = lang.trim().split(';q=');
      return {
        code: code.split('-')[0].toLowerCase(), // 'fr-FR' -> 'fr'
        quality: quality ? parseFloat(quality) : 1.0,
      };
    })
    .sort((a, b) => b.quality - a.quality);

  // Return first supported language
  for (const { code } of languages) {
    if (isSupportedLanguage(code)) {
      return code as SupportedLanguage;
    }
  }

  return undefined;
}

/**
 * Determine the recipient's preferred language for email content.
 *
 * Checks multiple sources in priority order:
 * 1. Access request metadata (preferredLanguage field)
 * 2. Accept-Language header from HTTP request
 * 3. System default language
 *
 * @param accessRequest - The access request containing requester info
 * @param request - Optional HTTP request for Accept-Language header
 * @returns The determined SupportedLanguage
 *
 * @example
 * // With metadata preference
 * const language = getRecipientLanguage(
 *   { ...request, metadata: { preferredLanguage: 'fr' } },
 *   nextRequest
 * );
 * // Returns 'fr'
 *
 * @example
 * // Without metadata, uses Accept-Language
 * const language = getRecipientLanguage(
 *   requestWithoutMetadata,
 *   requestWithFrenchHeader
 * );
 * // Returns 'fr' if Accept-Language: fr-FR
 */
export function getRecipientLanguage(
  accessRequest: AccessRequest,
  request?: NextRequest
): SupportedLanguage {
  // 1. Check access request metadata for explicit preference
  const metadataLanguage = accessRequest.metadata?.preferredLanguage;
  if (
    typeof metadataLanguage === 'string' &&
    isSupportedLanguage(metadataLanguage)
  ) {
    return metadataLanguage;
  }

  // 2. Check Accept-Language header from request context
  if (request) {
    const acceptLanguage = request.headers.get('accept-language');
    const parsed = parseAcceptLanguage(acceptLanguage);
    if (parsed) {
      return parsed;
    }
  }

  // 3. Fall back to default
  return DEFAULT_LANGUAGE;
}

/**
 * Get language for a specific email address (future enhancement).
 *
 * This could be extended to lookup user preferences from database.
 *
 * @param email - Recipient email address
 * @returns Language preference or default
 */
export async function getLanguageByEmail(
  email: string
): Promise<SupportedLanguage> {
  // Future: Implement database lookup for user language preference
  // For now, return default
  return DEFAULT_LANGUAGE;
}

/**
 * Determine if language should be logged for debugging.
 *
 * @returns true in development environment
 */
export function shouldLogLanguageResolution(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Log language resolution decision for debugging.
 *
 * @param context - Context description (e.g., "AccessApprovalEmail")
 * @param resolved - The resolved language
 * @param source - How the language was determined
 */
export function logLanguageResolution(
  context: string,
  resolved: SupportedLanguage,
  source: 'metadata' | 'accept-language' | 'default'
): void {
  if (shouldLogLanguageResolution()) {
    console.log(`[Email Language] ${context}: ${resolved} (from ${source})`);
  }
}
```

#### `/src/lib/l10n/emails/index.ts` (Update)

- **Purpose**: Barrel export for email utilities
- **Modification Required**: Add language resolution exports

```typescript
// Add to existing exports
export * from './language-resolution';
```

### Files to Modify (Test Files)

#### `/src/__tests__/back-office.test.ts`

- **Purpose**: Test suite for admin back office functionality
- **Modification Required**:
  - Add tests for email generation with language parameter
  - Test language fallback behavior

**Test additions:**

```typescript
describe('Email Generation with Language Support', () => {
  it('should generate access approval email in English (default)', () => {
    const email = generateAccessApprovalEmail(
      mockAccessRequest,
      'ABC123DEF456',
      'Test Account',
      'https://example.com'
    );
    expect(email.subject).toContain('Access Granted');
  });

  it('should generate access approval email in French', () => {
    const email = generateAccessApprovalEmail(
      mockAccessRequest,
      'ABC123DEF456',
      'Test Account',
      'https://example.com',
      'fr'
    );
    expect(email.subject).toContain('Accès Accordé');
  });

  it('should fallback to English for unsupported language', () => {
    const email = generateAccessApprovalEmail(
      mockAccessRequest,
      'ABC123DEF456',
      'Test Account',
      'https://example.com',
      'invalid' as SupportedLanguage
    );
    expect(email.subject).toContain('Access Granted');
  });
});
```

#### `/src/__tests__/beta-access-requests.test.ts`

- **Purpose**: Test suite for beta access functionality
- **Modification Required**:
  - Add tests for beta email generation with language parameter

### Files NOT to Modify (in this task)

- `/src/lib/email-templates.ts` - Already updated in Tasks 2I.3-2I.6
- `/messages/*.json` - Already created in Task 2I.1
- `/src/lib/l10n/emails/email-translations.ts` - Created in Task 2I.2
- Component files - Email generation is server-side only

## Technical Specifications

### Language Parameter Convention

All email generation functions should follow this convention:

```typescript
export function generate[EmailType]Email(
  // ... existing parameters
  language: SupportedLanguage = DEFAULT_LANGUAGE
): EmailTemplate
```

- **Parameter name**: `language` (consistent across all functions)
- **Type**: `SupportedLanguage` from translation-service types
- **Default**: `DEFAULT_LANGUAGE` ('en') for backward compatibility
- **Position**: Last optional parameter

### Language Resolution Priority

```
1. Access Request Metadata (metadata.preferredLanguage)
   ↓ (if not available or invalid)
2. HTTP Accept-Language Header
   ↓ (if not available or invalid)
3. System Default ('en')
```

### Integration Points

| Call Site | Language Source | Notes |
|-----------|-----------------|-------|
| Grant API route | Request metadata + Accept-Language | Primary integration point |
| Denial API route (if exists) | Request metadata + Accept-Language | Similar pattern |
| Scheduled reminder jobs | Stored user preference | May need database lookup |
| Admin manual send | Admin-selected language | Could add UI selector |

### Error Handling

```typescript
// Handle invalid language codes gracefully
const resolvedLanguage = isSupportedLanguage(providedLanguage)
  ? providedLanguage
  : DEFAULT_LANGUAGE;

// Log warnings in development
if (providedLanguage && !isSupportedLanguage(providedLanguage)) {
  console.warn(`[Email] Invalid language code: ${providedLanguage}, using default`);
}
```

## Usage Patterns

### In API Routes

```typescript
import { getRecipientLanguage } from '@/lib/l10n/emails';

export async function POST(request: NextRequest, ...) {
  // ... existing logic ...

  const recipientLanguage = getRecipientLanguage(accessRequest, request);

  const emailTemplate = generateAccessApprovalEmail(
    accessRequest,
    accessCode,
    accountName,
    baseUrl,
    recipientLanguage
  );

  // ... send email ...
}
```

### In Scheduled Jobs

```typescript
import { DEFAULT_LANGUAGE } from '@/lib/translation-service/translation-service.types';

async function sendReminderEmails() {
  for (const request of pendingRequests) {
    // Use stored preference or default
    const language = request.metadata?.preferredLanguage || DEFAULT_LANGUAGE;

    const email = generateRegistrationReminderEmail(
      request,
      accessCode,
      daysSinceApproval,
      accountName,
      baseUrl,
      language
    );

    await sendEmail(request.requester_email, email);
  }
}
```

### In Email Preview Components

```typescript
import { useState } from 'react';

function EmailPopup({ accessRequest }) {
  const [previewLanguage, setPreviewLanguage] = useState<SupportedLanguage>('en');

  const emailTemplate = generateAccessApprovalEmail(
    accessRequest,
    accessCode,
    accountName,
    baseUrl,
    previewLanguage
  );

  return (
    <div>
      <LanguageSelector value={previewLanguage} onChange={setPreviewLanguage} />
      <EmailPreview template={emailTemplate} />
    </div>
  );
}
```

## Success Validation Checklist

### Function Call Updates
- [ ] All `generateAccessApprovalEmail` calls pass language parameter
- [ ] All `generateBetaAccessApprovalEmail` calls pass language parameter
- [ ] All `generateAccessDenialEmail` calls pass language parameter
- [ ] All `generateRegistrationReminderEmail` calls pass language parameter

### Language Resolution
- [ ] `getRecipientLanguage` utility function is created
- [ ] `parseAcceptLanguage` helper function is created
- [ ] Language resolution follows priority order
- [ ] Invalid language codes fall back to English gracefully

### API Route Integration
- [ ] `/src/app/api/admin/access-requests/[requestId]/grant/route.ts` updated
- [ ] Language imports added to API routes
- [ ] Recipient language determined before email generation
- [ ] Language passed to email generation function

### Consistency
- [ ] All email functions use same parameter name (`language`)
- [ ] All email functions use same default value (`DEFAULT_LANGUAGE`)
- [ ] All email functions use same type (`SupportedLanguage`)

### Testing
- [ ] Unit tests for language resolution functions
- [ ] Unit tests for email generation with each language
- [ ] Integration tests for API routes with Accept-Language headers
- [ ] Fallback behavior tested

### Documentation
- [ ] Code comments document language resolution logic
- [ ] JSDoc for all new utility functions
- [ ] README or CLAUDE.md updated with email localization notes

### Build Validation
- [ ] Application builds without errors: `npm run build`
- [ ] TypeScript type checking passes
- [ ] No circular import issues
- [ ] All tests pass

## Dependencies

### Required (Already Installed)
- TypeScript 5.x - Type checking
- Next.js 15.x - App Router support

### Internal Dependencies
- `/src/lib/l10n/emails/email-translations.ts` - Email translation utility (Task 2I.2)
- `/src/lib/translation-service/translation-service.types.ts` - `SupportedLanguage`, `DEFAULT_LANGUAGE`, `isSupportedLanguage`
- `/messages/*.json` - Email translations in all 6 languages (Task 2I.1)
- `/src/types/admin.ts` - `AccessRequest`, `EmailTemplate` types

### Task Dependencies
- Task 2I.1 (REQ-E02-019): Emails namespace structure
- Task 2I.2 (REQ-E02-020): getEmailTranslation utility function
- Task 2I.3 (REQ-E02-021): Updated `generateAccessApprovalEmail`
- Task 2I.4 (REQ-E02-022): Updated `generateAccessDenialEmail`
- Task 2I.5 (REQ-E02-023): Updated `generateBetaAccessApprovalEmail`
- Task 2I.6 (REQ-E02-024): Updated `generateRegistrationReminderEmail`

### No New External Dependencies Required

This task only modifies calling code to pass language parameters.

## Risk Assessment

- **Risk Level**: Low to Medium
- **Rationale**:
  - Modifies calling code but email functions have defaults
  - Backward compatibility preserved through default parameters
  - English fallback ensures functionality
  - Multiple integration points require careful testing

### Potential Issues

| Issue | Likelihood | Impact | Mitigation |
|-------|------------|--------|------------|
| Missing language parameter in call | Low | Low | Default to English |
| Accept-Language parsing errors | Low | Low | Graceful fallback to default |
| Language not stored in request metadata | Medium | Low | Use Accept-Language as fallback |
| Inconsistent language resolution | Medium | Medium | Centralized utility function |
| Test coverage gaps | Medium | Medium | Add comprehensive test cases |
| Future email functions missing parameter | Medium | Low | Documentation and code review guidelines |

### Rollback Strategy

If issues occur:
1. Language parameter is optional with default value
2. Remove language parameter from calling code
3. Email functions continue to work with English output

## Acceptance Criteria Mapping

| Acceptance Criteria | Implementation |
|---------------------|----------------|
| All email functions accept language parameter | Verified in Tasks 2I.3-2I.6 |
| Consistent parameter naming | `language: SupportedLanguage` |
| Appropriate default value | `DEFAULT_LANGUAGE` ('en') |
| All functions use translation utility | `getEmailTranslation` usage |
| Calling code passes language | Updated API routes |
| Language from user preferences | `getRecipientLanguage` utility |
| Fallback for unavailable preference | Priority-based resolution |
| No function without language support | Audit all email functions |
| Code review guidelines | Documentation created |
| Email renders in all languages | Integration testing |
| Tests verify language handling | Test cases added |
| Migration guide for changes | Documentation |

## Related Tasks

### Prerequisites (Must Be Complete)
- **Task 2I.1** (REQ-E02-019): Emails namespace structure
- **Task 2I.2** (REQ-E02-020): getEmailTranslation utility function
- **Task 2I.3** (REQ-E02-021): Update `generateAccessApprovalEmail`
- **Task 2I.4** (REQ-E02-022): Update `generateAccessDenialEmail`
- **Task 2I.5** (REQ-E02-023): Update `generateBetaAccessApprovalEmail`
- **Task 2I.6** (REQ-E02-024): Update `generateRegistrationReminderEmail`

### Dependent Tasks (Blocked Until Complete)
- **Task 2I.8**: Generate translations for non-English languages
- **Task 2I.9**: Test email generation in each language

## Notes

### Storing User Language Preferences

For enhanced personalization, consider extending the `AccessRequest` type or user profile to store language preference:

```typescript
// In access_requests table or metadata
{
  metadata: {
    preferredLanguage: 'fr',
    languageSource: 'user_selection' | 'browser_detection' | 'default'
  }
}
```

### Admin Override

Admins sending emails manually could be given a language selector:

```typescript
// In admin UI
<Select
  label="Email Language"
  value={selectedLanguage}
  options={SUPPORTED_LANGUAGES}
  onChange={setSelectedLanguage}
/>
```

### Future Enhancements

1. **Database-backed language preferences**: Store user language in profile
2. **Language detection from email domain**: Heuristic for geographic inference
3. **Multi-language email**: Send email in multiple languages
4. **Language confirmation**: Ask recipient to confirm preferred language on registration

### Code Review Guidelines for New Email Functions

When reviewing code that adds new email generation functions:

1. **Verify language parameter exists**: Function should accept `language: SupportedLanguage = DEFAULT_LANGUAGE`
2. **Verify translation utility usage**: Function should use `getEmailTranslation` for all user-facing strings
3. **Verify fallback behavior**: Function should work correctly with missing translations
4. **Verify calling code**: All call sites should pass recipient language preference

### Linting Rule Suggestion

Consider adding a custom ESLint rule to flag email generation function calls without language parameter:

```javascript
// .eslintrc.js
rules: {
  'project/require-email-language-param': 'warn'
}
```

This would help catch missing language parameters during development.

---

*End of Implementation Overview*
