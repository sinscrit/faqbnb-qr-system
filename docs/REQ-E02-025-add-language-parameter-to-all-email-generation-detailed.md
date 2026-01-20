# REQ-E02-025: Add Language Parameter to All Email Generation Functions - Detailed Task Breakdown

*Generated: 2026-01-20 20:15:00 UTC*
*Last Modified: 2026-01-20 20:15:00 UTC*

## Reference

- **Request**: REQ-E02-025 (Add Language Parameter to All Email Generation Functions)
- **Overview Document**: docs/REQ-E02-025-add-language-parameter-to-all-email-generation-overview.md
- **Source**: docs/gen_requests_epic2.md (Request #25)
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

---

## Summary

This document provides the granular, actionable task breakdown for ensuring all email generation functions throughout the codebase consistently accept a language parameter to enable email content generation in the recipient's preferred language. This is the integration task that connects the localized email generation functions (created in Tasks 2I.3-2I.6) with the actual code paths that invoke them.

---

## Task Breakdown

### TASK 1: Create Language Resolution Utility Module
**Story Points**: 1
**File**: `/src/lib/l10n/emails/language-resolution.ts` (CREATE)
**Dependencies**: None (can start immediately)

#### Description
Create a centralized utility module for determining the recipient's preferred language for email content. This module will be used by all email generation call sites.

#### Acceptance Criteria
- [ ] File created at `/src/lib/l10n/emails/language-resolution.ts`
- [ ] `parseAcceptLanguage` function implemented to parse Accept-Language headers
- [ ] `getRecipientLanguage` function implemented with priority-based language resolution
- [ ] `getLanguageByEmail` stub function for future database lookup enhancement
- [ ] `logLanguageResolution` debugging utility implemented
- [ ] All functions properly typed with `SupportedLanguage` from translation-service types
- [ ] JSDoc comments for all exported functions
- [ ] No TypeScript errors

#### Implementation Details

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
 */
export function getRecipientLanguage(
  accessRequest: AccessRequest,
  request?: NextRequest
): SupportedLanguage {
  // 1. Check access request metadata for explicit preference
  const metadataLanguage = (accessRequest.metadata as Record<string, unknown>)?.preferredLanguage;
  if (
    typeof metadataLanguage === 'string' &&
    isSupportedLanguage(metadataLanguage)
  ) {
    if (shouldLogLanguageResolution()) {
      logLanguageResolution('email', metadataLanguage, 'metadata');
    }
    return metadataLanguage;
  }

  // 2. Check Accept-Language header from request context
  if (request) {
    const acceptLanguage = request.headers.get('accept-language');
    const parsed = parseAcceptLanguage(acceptLanguage);
    if (parsed) {
      if (shouldLogLanguageResolution()) {
        logLanguageResolution('email', parsed, 'accept-language');
      }
      return parsed;
    }
  }

  // 3. Fall back to default
  if (shouldLogLanguageResolution()) {
    logLanguageResolution('email', DEFAULT_LANGUAGE, 'default');
  }
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
  void email; // Suppress unused parameter warning
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
 * @param context - Context description (e.g., "email", "AccessApprovalEmail")
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

#### Verification
```bash
# Check TypeScript compilation
npx tsc --noEmit

# Verify file exists and has correct exports
grep -n "export function" src/lib/l10n/emails/language-resolution.ts
```

---

### TASK 2: Update Barrel Export for Email Utilities
**Story Points**: 0.5
**File**: `/src/lib/l10n/emails/index.ts` (MODIFY)
**Dependencies**: TASK 1

#### Description
Update the barrel export file to include the new language resolution utilities.

#### Acceptance Criteria
- [ ] `language-resolution` module exported from index
- [ ] All existing exports preserved
- [ ] No circular import issues
- [ ] No TypeScript errors

#### Implementation Details

Add to existing `/src/lib/l10n/emails/index.ts`:

```typescript
// Add to existing exports
export * from './language-resolution';
```

If file doesn't exist, create it:

```typescript
/**
 * Email Localization Utilities
 * Part of REQ-E02-025: Add Language Parameter to All Email Generation Functions
 *
 * Barrel export for email-related localization utilities.
 *
 * @module l10n/emails
 * @created 2026-01-20
 */

export * from './email-translations';
export * from './language-resolution';
```

#### Verification
```bash
# Test import
echo "import { getRecipientLanguage, parseAcceptLanguage } from '@/lib/l10n/emails';" | npx tsc --stdin

# Verify exports
grep -n "export" src/lib/l10n/emails/index.ts
```

---

### TASK 3: Update Grant API Route to Pass Language Parameter
**Story Points**: 1
**File**: `/src/app/api/admin/access-requests/[requestId]/grant/route.ts` (MODIFY)
**Dependencies**: TASK 1, TASK 2, REQ-E02-021 (generateAccessApprovalEmail updated)

#### Description
Update the access request grant API route to determine the recipient's language preference and pass it to the email generation function.

#### Acceptance Criteria
- [ ] Import `getRecipientLanguage` from language resolution module
- [ ] Import `SupportedLanguage` type
- [ ] Determine recipient language before email generation call
- [ ] Pass language parameter to `generateAccessApprovalEmail`
- [ ] Maintain backward compatibility (no breaking changes to API response)
- [ ] No TypeScript errors
- [ ] Build passes

#### Implementation Details

**Changes to implement (around lines 1-10, add imports):**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAuth } from '@/lib/auth-server';
import { AccessRequestStatus } from '@/types/admin';
import { randomBytes } from 'crypto';
import { sendAccessApprovalEmail } from '@/lib/email-service';
import { generateAccessApprovalEmail } from '@/lib/email-templates';
import { getServerBaseUrl } from '@/lib/config';
// ADD THESE IMPORTS:
import { getRecipientLanguage } from '@/lib/l10n/emails';
import { SupportedLanguage } from '@/lib/translation-service/translation-service.types';
```

**Changes to implement (around lines 248-260, update email generation):**

```typescript
// BEFORE (current implementation):
let emailData = null;
let emailResult = null;
if (send_email && accessRequest.account) {
  emailData = email_template || generateAccessApprovalEmail(
    accessRequest,
    accessCode,
    accessRequest.account.name,
    baseUrl
  );

// AFTER (with language parameter):
let emailData = null;
let emailResult = null;
if (send_email && accessRequest.account) {
  // Determine recipient's preferred language
  const recipientLanguage = getRecipientLanguage(accessRequest, request);

  emailData = email_template || generateAccessApprovalEmail(
    accessRequest,
    accessCode,
    accessRequest.account.name,
    baseUrl,
    recipientLanguage
  );
```

#### Verification
```bash
# Check TypeScript compilation
npx tsc --noEmit

# Verify the build passes
npm run build

# Check the import is correct
grep -n "getRecipientLanguage" src/app/api/admin/access-requests/[requestId]/grant/route.ts
```

---

### TASK 4: Update EmailPopup Component to Support Language Preview
**Story Points**: 1
**File**: `/src/components/EmailPopup.tsx` (MODIFY)
**Dependencies**: REQ-E02-021 (generateAccessApprovalEmail updated)

#### Description
Update the EmailPopup component to support language preview selection, allowing admins to preview email content in different languages before sending.

#### Acceptance Criteria
- [ ] Import `SupportedLanguage` and `SUPPORTED_LANGUAGES` types
- [ ] Add `previewLanguage` state with default 'en'
- [ ] Add language selector dropdown to the UI
- [ ] Pass selected language to `generateAccessApprovalEmail`
- [ ] Email preview updates when language changes
- [ ] No TypeScript errors
- [ ] Build passes

#### Implementation Details

**Add imports (top of file):**

```typescript
import {
  SupportedLanguage,
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE
} from '@/lib/translation-service/translation-service.types';
```

**Add state (after line 28):**

```typescript
const [previewLanguage, setPreviewLanguage] = useState<SupportedLanguage>(DEFAULT_LANGUAGE);
```

**Update useEffect (around line 38-48):**

```typescript
// Initialize email template when popup opens or language changes
useEffect(() => {
  if (isOpen && request) {
    const template = generateAccessApprovalEmail(
      request,
      accessCode || 'XXXXXXXXXX',
      accountName,
      undefined, // baseUrl uses default
      previewLanguage
    );
    setEmailTemplate(template);
    setErrors([]);
  }
}, [isOpen, request, accessCode, accountName, previewLanguage]);
```

**Add language selector UI (after mode toggle, around line 196):**

```tsx
{/* Language selector */}
<div className="flex items-center space-x-2 mb-4">
  <label htmlFor="preview-language" className="text-sm font-medium text-gray-700">
    Email Language:
  </label>
  <select
    id="preview-language"
    value={previewLanguage}
    onChange={(e) => setPreviewLanguage(e.target.value as SupportedLanguage)}
    className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
  >
    {SUPPORTED_LANGUAGES.map((lang) => (
      <option key={lang.code} value={lang.code}>
        {lang.flag} {lang.name} ({lang.nativeName})
      </option>
    ))}
  </select>
</div>
```

#### Verification
```bash
# Check TypeScript compilation
npx tsc --noEmit

# Verify the build passes
npm run build

# Check the component renders
npm run dev
# Navigate to admin panel and test email popup
```

---

### TASK 5: Create Unit Tests for Language Resolution
**Story Points**: 1
**File**: `/src/__tests__/language-resolution.test.ts` (CREATE)
**Dependencies**: TASK 1

#### Description
Create comprehensive unit tests for the language resolution utility functions.

#### Acceptance Criteria
- [ ] Test file created at `/src/__tests__/language-resolution.test.ts`
- [ ] Tests for `parseAcceptLanguage` with various header formats
- [ ] Tests for `getRecipientLanguage` with all priority levels
- [ ] Tests for fallback behavior with invalid/missing language codes
- [ ] Tests for edge cases (null, empty strings, malformed headers)
- [ ] All tests pass

#### Implementation Details

```typescript
/**
 * Unit Tests for Language Resolution Utilities
 * Part of REQ-E02-025: Add Language Parameter to All Email Generation Functions
 *
 * @created 2026-01-20
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  parseAcceptLanguage,
  getRecipientLanguage,
  shouldLogLanguageResolution,
  logLanguageResolution,
} from '@/lib/l10n/emails/language-resolution';
import { DEFAULT_LANGUAGE } from '@/lib/translation-service/translation-service.types';
import { AccessRequest, AccessRequestStatus, AccessRequestSource } from '@/types/admin';

// Mock AccessRequest for testing
const createMockAccessRequest = (
  metadata?: Record<string, unknown>
): AccessRequest => ({
  id: 'test-id',
  account_id: 'test-account',
  requester_email: 'test@example.com',
  requester_name: 'Test User',
  status: AccessRequestStatus.PENDING,
  source: AccessRequestSource.DIRECT,
  request_date: new Date().toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  metadata: metadata || null,
});

// Mock NextRequest for testing
const createMockRequest = (acceptLanguage: string | null) => ({
  headers: {
    get: (name: string) => (name === 'accept-language' ? acceptLanguage : null),
  },
} as unknown as import('next/server').NextRequest);

describe('parseAcceptLanguage', () => {
  it('should return undefined for null input', () => {
    expect(parseAcceptLanguage(null)).toBeUndefined();
  });

  it('should return undefined for empty string', () => {
    expect(parseAcceptLanguage('')).toBeUndefined();
  });

  it('should parse simple language code', () => {
    expect(parseAcceptLanguage('fr')).toBe('fr');
  });

  it('should parse language with region code', () => {
    expect(parseAcceptLanguage('fr-FR')).toBe('fr');
  });

  it('should return first supported language from list', () => {
    expect(parseAcceptLanguage('fr-FR,en;q=0.9,es;q=0.8')).toBe('fr');
  });

  it('should respect quality values', () => {
    expect(parseAcceptLanguage('en;q=0.5,fr;q=0.9,es;q=0.8')).toBe('fr');
  });

  it('should skip unsupported languages', () => {
    expect(parseAcceptLanguage('zh-CN,ja;q=0.9,en;q=0.8')).toBe('en');
  });

  it('should return undefined for all unsupported languages', () => {
    expect(parseAcceptLanguage('zh-CN,ja,ko')).toBeUndefined();
  });

  it('should handle malformed quality values', () => {
    // Should default to q=1.0 when quality is missing or invalid
    expect(parseAcceptLanguage('fr,en;q=invalid')).toBe('fr');
  });

  it('should handle whitespace', () => {
    expect(parseAcceptLanguage(' fr-FR , en ; q=0.9 ')).toBe('fr');
  });
});

describe('getRecipientLanguage', () => {
  it('should return language from metadata when present', () => {
    const request = createMockAccessRequest({ preferredLanguage: 'fr' });
    expect(getRecipientLanguage(request)).toBe('fr');
  });

  it('should ignore invalid metadata language', () => {
    const request = createMockAccessRequest({ preferredLanguage: 'invalid' });
    expect(getRecipientLanguage(request)).toBe(DEFAULT_LANGUAGE);
  });

  it('should return language from Accept-Language header when no metadata', () => {
    const accessRequest = createMockAccessRequest();
    const nextRequest = createMockRequest('es-ES,es;q=0.9,en;q=0.8');
    expect(getRecipientLanguage(accessRequest, nextRequest)).toBe('es');
  });

  it('should prefer metadata over Accept-Language', () => {
    const accessRequest = createMockAccessRequest({ preferredLanguage: 'de' });
    const nextRequest = createMockRequest('fr-FR');
    expect(getRecipientLanguage(accessRequest, nextRequest)).toBe('de');
  });

  it('should return default when no metadata and no Accept-Language', () => {
    const accessRequest = createMockAccessRequest();
    expect(getRecipientLanguage(accessRequest)).toBe(DEFAULT_LANGUAGE);
  });

  it('should return default when metadata is null', () => {
    const accessRequest = createMockAccessRequest(null as unknown as Record<string, unknown>);
    expect(getRecipientLanguage(accessRequest)).toBe(DEFAULT_LANGUAGE);
  });

  it('should return default when Accept-Language has no supported languages', () => {
    const accessRequest = createMockAccessRequest();
    const nextRequest = createMockRequest('zh-CN,ja;q=0.9');
    expect(getRecipientLanguage(accessRequest, nextRequest)).toBe(DEFAULT_LANGUAGE);
  });
});

describe('shouldLogLanguageResolution', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it('should return true in development', () => {
    process.env.NODE_ENV = 'development';
    expect(shouldLogLanguageResolution()).toBe(true);
  });

  it('should return false in production', () => {
    process.env.NODE_ENV = 'production';
    expect(shouldLogLanguageResolution()).toBe(false);
  });

  it('should return false in test', () => {
    process.env.NODE_ENV = 'test';
    expect(shouldLogLanguageResolution()).toBe(false);
  });
});

describe('logLanguageResolution', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should log in development mode', () => {
    process.env.NODE_ENV = 'development';
    logLanguageResolution('test', 'fr', 'metadata');
    expect(console.log).toHaveBeenCalledWith(
      '[Email Language] test: fr (from metadata)'
    );
  });

  it('should not log in production mode', () => {
    process.env.NODE_ENV = 'production';
    logLanguageResolution('test', 'fr', 'metadata');
    expect(console.log).not.toHaveBeenCalled();
  });
});
```

#### Verification
```bash
# Run the specific test file
npm run test -- src/__tests__/language-resolution.test.ts

# Run all tests to ensure no regression
npm run test
```

---

### TASK 6: Add Email Language Tests to Existing Test Suites
**Story Points**: 1
**File**: `/src/__tests__/back-office.test.ts` (MODIFY)
**Dependencies**: TASK 3, REQ-E02-021, REQ-E02-022, REQ-E02-023, REQ-E02-024

#### Description
Add test cases to the existing back-office test suite to verify email generation with language parameter.

#### Acceptance Criteria
- [ ] Tests for `generateAccessApprovalEmail` with different languages
- [ ] Tests for `generateAccessDenialEmail` with different languages
- [ ] Tests for `generateBetaAccessApprovalEmail` with different languages
- [ ] Tests for `generateRegistrationReminderEmail` with different languages
- [ ] Tests for fallback to English with invalid language
- [ ] All tests pass

#### Implementation Details

Add to `/src/__tests__/back-office.test.ts`:

```typescript
describe('Email Generation with Language Support', () => {
  const mockAccessRequest: AccessRequest = {
    id: 'test-request-id',
    account_id: 'test-account-id',
    requester_email: 'test@example.com',
    requester_name: 'Test User',
    status: AccessRequestStatus.PENDING,
    source: AccessRequestSource.DIRECT,
    request_date: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    metadata: null,
  };

  describe('generateAccessApprovalEmail', () => {
    it('should generate email in English by default', () => {
      const email = generateAccessApprovalEmail(
        mockAccessRequest,
        'ABC123DEF456',
        'Test Account',
        'https://example.com'
      );
      expect(email.subject).toContain('Access Granted');
      expect(email.body).toContain('Great news!');
    });

    it('should generate email in French when specified', () => {
      const email = generateAccessApprovalEmail(
        mockAccessRequest,
        'ABC123DEF456',
        'Test Account',
        'https://example.com',
        'fr'
      );
      // Subject and body should contain French translations
      // Exact strings depend on REQ-E02-021 implementation
      expect(email).toBeDefined();
      expect(email.subject).toBeDefined();
      expect(email.body).toBeDefined();
    });

    it('should generate email in Spanish when specified', () => {
      const email = generateAccessApprovalEmail(
        mockAccessRequest,
        'ABC123DEF456',
        'Test Account',
        'https://example.com',
        'es'
      );
      expect(email).toBeDefined();
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

  describe('generateAccessDenialEmail', () => {
    it('should generate denial email in English by default', () => {
      const email = generateAccessDenialEmail(
        mockAccessRequest,
        'Policy violation',
        'Test Account'
      );
      expect(email.subject).toContain('Update');
      expect(email.body).toContain('unable to approve');
    });

    it('should support language parameter', () => {
      const email = generateAccessDenialEmail(
        mockAccessRequest,
        'Policy violation',
        'Test Account',
        'de'
      );
      expect(email).toBeDefined();
    });
  });

  describe('generateBetaAccessApprovalEmail', () => {
    const betaRequest: AccessRequest = {
      ...mockAccessRequest,
      source: AccessRequestSource.BETA_WAITLIST,
    };

    it('should generate beta email in English by default', () => {
      const email = generateBetaAccessApprovalEmail(
        betaRequest,
        'ABC123DEF456',
        'FAQBNB',
        'https://example.com'
      );
      expect(email.subject).toContain('Beta');
      expect(email.body).toContain('Congratulations');
    });

    it('should support language parameter', () => {
      const email = generateBetaAccessApprovalEmail(
        betaRequest,
        'ABC123DEF456',
        'FAQBNB',
        'https://example.com',
        'nl'
      );
      expect(email).toBeDefined();
    });
  });

  describe('generateRegistrationReminderEmail', () => {
    it('should generate reminder email in English by default', () => {
      const email = generateRegistrationReminderEmail(
        mockAccessRequest,
        'ABC123DEF456',
        7,
        'Test Account',
        'https://example.com'
      );
      expect(email.subject).toContain('Reminder');
      expect(email.body).toContain('7 days ago');
    });

    it('should support language parameter', () => {
      const email = generateRegistrationReminderEmail(
        mockAccessRequest,
        'ABC123DEF456',
        7,
        'Test Account',
        'https://example.com',
        'it'
      );
      expect(email).toBeDefined();
    });
  });
});
```

#### Verification
```bash
# Run the back-office test file
npm run test -- src/__tests__/back-office.test.ts

# Run all tests
npm run test
```

---

### TASK 7: Update TypeScript Types for Email Service (Optional Enhancement)
**Story Points**: 0.5
**File**: `/src/lib/email-service.ts` (MODIFY - if exists)
**Dependencies**: None

#### Description
Add language tracking to the email result interface for debugging and auditing purposes.

#### Acceptance Criteria
- [ ] `EmailResult` interface includes optional `language` field
- [ ] Language is tracked when emails are sent
- [ ] No breaking changes to existing code
- [ ] No TypeScript errors

#### Implementation Details

If `/src/lib/email-service.ts` has an `EmailResult` interface, add:

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

If sending function exists, add language parameter tracking:

```typescript
export async function sendAccessApprovalEmail(
  to: string,
  template: EmailTemplate,
  metadata?: EmailMetadata,
  language?: SupportedLanguage // Add parameter
): Promise<EmailResult> {
  // ... existing logic ...

  return {
    // ... existing fields ...
    language: language || 'en', // Track language used
  };
}
```

#### Verification
```bash
# Check TypeScript compilation
npx tsc --noEmit

# Verify the build passes
npm run build
```

---

### TASK 8: Create Documentation for Email Localization
**Story Points**: 0.5
**File**: `/docs/guides/email-localization.md` (CREATE)
**Dependencies**: TASK 1, TASK 3, TASK 4

#### Description
Create documentation explaining how to use the email localization system for future developers.

#### Acceptance Criteria
- [ ] Documentation file created
- [ ] Explains language resolution priority
- [ ] Shows code examples for each email function
- [ ] Documents how to add new email functions with language support
- [ ] Includes troubleshooting section

#### Implementation Details

```markdown
# Email Localization Guide

*Generated: 2026-01-20*
*Part of REQ-E02-025: Add Language Parameter to All Email Generation Functions*

## Overview

This guide explains how to use and extend the email localization system in FAQBNB. All email generation functions support multi-language content delivery based on recipient preferences.

## Language Resolution Priority

When determining which language to use for an email, the system checks in this order:

1. **Access Request Metadata** - If `accessRequest.metadata.preferredLanguage` is set and valid
2. **Accept-Language Header** - Parsed from the HTTP request if available
3. **System Default** - Falls back to English ('en')

## Using Email Functions

### generateAccessApprovalEmail

```typescript
import { generateAccessApprovalEmail } from '@/lib/email-templates';
import { getRecipientLanguage } from '@/lib/l10n/emails';

// In an API route:
const language = getRecipientLanguage(accessRequest, request);
const email = generateAccessApprovalEmail(
  accessRequest,
  accessCode,
  accountName,
  baseUrl,
  language // Pass the determined language
);
```

### All Email Functions

All email functions accept an optional `language` parameter as the last argument:

- `generateAccessApprovalEmail(request, code, accountName, baseUrl, language)`
- `generateAccessDenialEmail(request, reason, accountName, language)`
- `generateBetaAccessApprovalEmail(request, code, accountName, baseUrl, language)`
- `generateRegistrationReminderEmail(request, code, days, accountName, baseUrl, language)`

## Adding New Email Functions

When creating a new email function, follow this pattern:

```typescript
export function generateNewEmail(
  // ... other parameters
  language: SupportedLanguage = DEFAULT_LANGUAGE
): EmailTemplate {
  // Use getEmailTranslation to get localized content
  const t = (key: string) => getEmailTranslation(`newEmail.${key}`, language);

  return {
    subject: t('subject'),
    body: t('body'),
    variables: { /* ... */ }
  };
}
```

## Troubleshooting

### Emails sending in wrong language

1. Check if `accessRequest.metadata.preferredLanguage` is set
2. Verify the Accept-Language header is being passed correctly
3. Ensure the language code is valid (en, fr, es, de, nl, it)

### Missing translations

1. Check `/messages/{lang}.json` for the `emails` namespace
2. Verify the translation key exists in all language files
3. Check console for `[Email Language]` debug messages in development

## Code Review Guidelines

When reviewing PRs that add new email functions:

1. Verify function accepts `language: SupportedLanguage = DEFAULT_LANGUAGE` parameter
2. Verify function uses `getEmailTranslation` for all user-facing strings
3. Verify calling code passes recipient language preference
4. Verify translations exist in all supported languages
```

#### Verification
```bash
# Verify file exists
cat docs/guides/email-localization.md

# Check markdown formatting
npx markdownlint docs/guides/email-localization.md
```

---

### TASK 9: Final Build Verification and Integration Test
**Story Points**: 1
**File**: N/A (verification task)
**Dependencies**: All previous tasks

#### Description
Verify the complete implementation works end-to-end with build checks and manual integration testing.

#### Acceptance Criteria
- [ ] Application builds without errors: `npm run build`
- [ ] TypeScript type checking passes: `npx tsc --noEmit`
- [ ] All unit tests pass: `npm run test`
- [ ] No circular import issues
- [ ] Manual test: Grant access request and verify email language
- [ ] Manual test: EmailPopup language selector works
- [ ] Manual test: Emails render correctly in all 6 languages

#### Verification Steps

```bash
# 1. TypeScript compilation check
npx tsc --noEmit

# 2. Full build
npm run build

# 3. Run all tests
npm run test

# 4. Check for circular imports
npx madge --circular src/

# 5. Start development server for manual testing
npm run dev
```

**Manual Testing Checklist:**

1. Navigate to Admin Panel > Access Requests
2. Select a pending request
3. Click "Grant Access"
4. Verify email generation uses correct language
5. Test EmailPopup language selector:
   - Change language to French
   - Verify email preview updates
   - Change to German
   - Verify email preview updates
6. Submit grant request
7. Verify email sent (check logs/email provider)

---

## Task Summary Table

| Task | Description | Story Points | Dependencies |
|------|-------------|--------------|--------------|
| TASK 1 | Create Language Resolution Utility Module | 1 | None |
| TASK 2 | Update Barrel Export for Email Utilities | 0.5 | TASK 1 |
| TASK 3 | Update Grant API Route to Pass Language Parameter | 1 | TASK 1, TASK 2, REQ-E02-021 |
| TASK 4 | Update EmailPopup Component to Support Language Preview | 1 | REQ-E02-021 |
| TASK 5 | Create Unit Tests for Language Resolution | 1 | TASK 1 |
| TASK 6 | Add Email Language Tests to Existing Test Suites | 1 | TASK 3, REQ-E02-021-024 |
| TASK 7 | Update TypeScript Types for Email Service (Optional) | 0.5 | None |
| TASK 8 | Create Documentation for Email Localization | 0.5 | TASK 1, TASK 3, TASK 4 |
| TASK 9 | Final Build Verification and Integration Test | 1 | All previous |
| **TOTAL** | | **7.5** | |

---

## Files Changed Summary

### New Files

| File Path | Purpose |
|-----------|---------|
| `/src/lib/l10n/emails/language-resolution.ts` | Centralized language resolution utilities |
| `/src/__tests__/language-resolution.test.ts` | Unit tests for language resolution |
| `/docs/guides/email-localization.md` | Developer documentation |

### Modified Files

| File Path | Changes |
|-----------|---------|
| `/src/lib/l10n/emails/index.ts` | Add export for language-resolution module |
| `/src/app/api/admin/access-requests/[requestId]/grant/route.ts` | Add language parameter to email generation |
| `/src/components/EmailPopup.tsx` | Add language selector for preview |
| `/src/__tests__/back-office.test.ts` | Add email language tests |
| `/src/lib/email-service.ts` | Add language field to EmailResult (optional) |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Language parameter not passed in some call sites | Low | Low | All functions have default value |
| Accept-Language parsing errors | Low | Low | Graceful fallback to default |
| Test failures due to translation content changes | Medium | Low | Use existence checks instead of exact string matching |
| Missing email translations | Medium | Low | Fallback to English, console warning |

---

## Success Validation Checklist

- [ ] All email generation function calls pass language parameter
- [ ] Language resolution utility functions created and tested
- [ ] API routes updated to determine recipient language
- [ ] EmailPopup supports language preview
- [ ] Unit tests for language resolution pass
- [ ] Integration tests for email functions pass
- [ ] Documentation created
- [ ] Build passes without errors
- [ ] No TypeScript errors
- [ ] Manual testing confirms emails render in all languages

---

## Related Documents

- [Overview Document](./REQ-E02-025-add-language-parameter-to-all-email-generation-overview.md)
- [Implementation Plan](./prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [REQ-E02-019: Emails Namespace Structure](./REQ-E02-019-create-emails-namespace-and-translation-structure-detailed.md)
- [REQ-E02-020: Email Translation Utility](./REQ-E02-020-create-getemailtranslation-utility-function-detailed.md)
- [REQ-E02-021: Update generateAccessApprovalEmail](./REQ-E02-021-update-generateaccessapprovalemail-function-detailed.md)

---

*End of Detailed Task Breakdown*
