# REQ-E02-020: Create `getEmailTranslation` Utility Function - Detailed Task Breakdown

*Generated: 2026-01-20 15:45:00 UTC*
*Last Modified: 2026-01-20 15:45:00 UTC*

## Reference

- **Request**: REQ-E02-020 (Create Email Translation Utility Function)
- **Source**: docs/gen_requests_epic2.md
- **Overview Document**: docs/REQ-E02-020-create-getemailtranslation-utility-function-overview.md
- **Implementation Plan**: docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md
- **Type**: New Feature
- **Phase**: 2I (Email Templates)
- **Task ID**: 2I.2
- **Size**: S (Small)
- **Epic**: Localization Epic 2 - Static UI Translation
- **Depends On**:
  - Epic 1 (L10N Foundation - next-intl setup)
  - REQ-E02-019 (Task 2I.1 - Emails Namespace Structure)

---

## Summary

Create a dedicated server-side utility function `getEmailTranslation` to retrieve email translations from the message bundles, enabling email templates to display content in the recipient's preferred language. This function serves as the bridge between the `emails` namespace translations (created in Task 2I.1) and the email generation functions in `/src/lib/email-templates.ts`.

---

## Current State Analysis

### Existing Translation Infrastructure

**Translation Service Types** (`/src/lib/translation-service/translation-service.types.ts`):
- `SupportedLanguage` type: `'en' | 'fr' | 'es' | 'de' | 'nl' | 'it'`
- `DEFAULT_LANGUAGE` constant: `'en'`
- `isSupportedLanguage()` type guard function
- `getLanguageInfo()` helper function
- `getOtherLanguages()` helper function

**Message Files** (`/messages/*.json`):
- `en.json`, `fr.json`, `es.json`, `de.json`, `nl.json`, `it.json`
- All files contain existing namespaces: `common`, `auth`, `dashboard`, `items`, `errors`, `language`
- `emails` namespace added in Task 2I.1

### Target State

A utility module providing:
- **Primary function**: `getEmailTranslation()` - Retrieve single translation with variable interpolation
- **Extended function**: `getEmailTranslationWithInfo()` - Same with metadata (fallback status, language used)
- **Section function**: `getEmailSection()` - Retrieve all keys for an email category
- **Helper functions**: `interpolateVariables()`, `hasEmailTranslations()`, `getLanguagesWithEmailTranslations()`
- **Type exports**: `EmailVariables`, `EmailTranslationKey`, `EmailCategory`, etc.

---

## Detailed Tasks

### Task 1: Create Directory Structure and Barrel Exports
**Estimate**: 1 story point
**Priority**: P0 - Must do first

#### Description
Create the `/src/lib/l10n/emails/` directory structure with proper barrel exports for clean imports.

#### Files to Create

**`/src/lib/l10n/emails/index.ts`**
```typescript
/**
 * Email Translation Utilities
 * Part of REQ-E02-020: Create getEmailTranslation Utility Function
 *
 * @module l10n/emails
 * @created 2026-01-20
 */

export * from './email-translations';
export * from './types';
```

**`/src/lib/l10n/index.ts`** (Create if not exists)
```typescript
/**
 * Localization Utilities
 * Central barrel export for all l10n utilities
 *
 * @module l10n
 * @created 2026-01-20
 */

// Export email translation utilities
export * from './emails';
```

#### Acceptance Criteria
- [ ] Directory `/src/lib/l10n/emails/` exists
- [ ] `/src/lib/l10n/emails/index.ts` created with exports
- [ ] `/src/lib/l10n/index.ts` created with email re-exports
- [ ] Import path `@/lib/l10n/emails` works correctly

#### Verification Steps
1. Verify directory structure created
2. Check TypeScript recognizes the module paths
3. No import errors when building

---

### Task 2: Create Type Definitions
**Estimate**: 2 story points
**Priority**: P0 - Critical (Foundation for implementation)

#### Description
Create comprehensive TypeScript type definitions for email translations, ensuring type safety for all functions.

#### File to Create: `/src/lib/l10n/emails/types.ts`

```typescript
/**
 * Email Translation Types
 * Part of REQ-E02-020: Email Translation Utility Function
 *
 * Provides type definitions for email translation utilities.
 *
 * @module l10n/emails/types
 * @created 2026-01-20
 */

import { SupportedLanguage } from '@/lib/translation-service/translation-service.types';

// ============================================================================
// Email Category Types
// ============================================================================

/**
 * Email content categories matching the emails namespace structure.
 * Corresponds to subcategories in /messages/*.json emails namespace.
 */
export type EmailCategory =
  | 'common'
  | 'accessApproval'
  | 'betaAccess'
  | 'accessDenial'
  | 'registrationReminder';

/**
 * Common email element keys available in emails.common namespace.
 */
export type CommonEmailKey =
  | 'greeting'
  | 'greetingGeneric'
  | 'regards'
  | 'team'
  | 'betaTeam'
  | 'footer'
  | 'footerSupport'
  | 'betaFooter'
  | 'betaFooterSupport'
  | 'separator'
  | 'accessCode'
  | 'account'
  | 'requestedOn'
  | 'platform'
  | 'betaAccessGranted'
  | 'originalRequest';

// ============================================================================
// Translation Key Types
// ============================================================================

/**
 * Dot-notation path to email translation key.
 * Can be specified with or without 'emails.' prefix.
 *
 * @example
 * 'accessApproval.subject'        // Without prefix (preferred)
 * 'emails.accessApproval.subject' // With prefix (also works)
 * 'common.greeting'               // Common element
 */
export type EmailTranslationKey = string;

// ============================================================================
// Variable Types
// ============================================================================

/**
 * Variables that can be interpolated into email translations.
 * These correspond to {variable} placeholders in translation strings.
 *
 * @example
 * const variables: EmailVariables = {
 *   name: 'John',
 *   accountName: 'Beach House',
 *   accessCode: 'ABC123DEF456'
 * };
 */
export interface EmailVariables {
  /** Recipient's name (used in greeting) */
  name?: string;

  /** Account or property name */
  accountName?: string;

  /** Generated access code */
  accessCode?: string;

  /** Date access was requested (formatted string) */
  requestDate?: string;

  /** Date access was approved (formatted string) */
  approvalDate?: string;

  /** Full URL with pre-filled registration data */
  directLink?: string;

  /** Base registration URL */
  registrationLink?: string;

  /** Number of days since approval */
  daysSinceApproval?: string | number;

  /** Denial reason (optional) */
  reason?: string;

  /** Allow additional string/number variables */
  [key: string]: string | number | undefined;
}

// ============================================================================
// Result Types
// ============================================================================

/**
 * Result of email translation retrieval with metadata.
 * Provides additional context about how the translation was resolved.
 */
export interface EmailTranslationResult {
  /** Translated text with variables interpolated */
  text: string;

  /** Whether fallback to English was used */
  isFallback: boolean;

  /** The language that was actually used */
  language: SupportedLanguage;
}

/**
 * Complete email content for a template type.
 * Contains all translated strings for an email category.
 */
export interface EmailContent {
  /** Email subject line */
  subject: string;

  /** All other sections as key-value pairs */
  sections: Record<string, string>;
}

// ============================================================================
// Options Types
// ============================================================================

/**
 * Options for getEmailTranslation function.
 * Allows customization of translation retrieval behavior.
 */
export interface GetEmailTranslationOptions {
  /**
   * Fallback language if requested language unavailable.
   * @default 'en'
   */
  fallbackLanguage?: SupportedLanguage;

  /**
   * Whether to return key path if translation missing.
   * If false, returns empty string.
   * @default true
   */
  returnKeyOnMissing?: boolean;

  /**
   * Whether to log warnings for missing translations.
   * Only active in development mode.
   * @default true (in development)
   */
  logWarnings?: boolean;
}

// ============================================================================
// Re-exports for convenience
// ============================================================================

export type { SupportedLanguage } from '@/lib/translation-service/translation-service.types';
```

#### Acceptance Criteria
- [ ] `EmailCategory` type covers all 5 email categories
- [ ] `CommonEmailKey` type covers all 16 common keys
- [ ] `EmailVariables` interface includes all documented variables
- [ ] `EmailTranslationResult` includes text, isFallback, language
- [ ] `GetEmailTranslationOptions` provides configurable behavior
- [ ] Types compile without errors
- [ ] JSDoc comments explain each type's purpose

#### Verification Steps
1. TypeScript compilation succeeds
2. Types are accessible from barrel export
3. IntelliSense provides type information

---

### Task 3: Implement Interpolation Helper Function
**Estimate**: 1 story point
**Priority**: P0 - Required by main function

#### Description
Create the `interpolateVariables` helper function that replaces `{variable}` placeholders with provided values.

#### Implementation in `/src/lib/l10n/emails/email-translations.ts`

```typescript
/**
 * Interpolate variables into a translation string.
 * Replaces {variable} placeholders with provided values.
 *
 * @param template - Translation string with {variable} placeholders
 * @param variables - Values to interpolate
 * @returns String with variables replaced
 *
 * @example
 * interpolateVariables('Hello {name}!', { name: 'John' })
 * // Returns: 'Hello John!'
 *
 * @example
 * interpolateVariables('Approved {daysSinceApproval} days ago', { daysSinceApproval: 7 })
 * // Returns: 'Approved 7 days ago'
 */
export function interpolateVariables(
  template: string,
  variables?: EmailVariables
): string {
  if (!variables || !template) return template;

  return Object.entries(variables).reduce((text, [key, value]) => {
    // Skip undefined or null values
    if (value === undefined || value === null) return text;

    // Create regex for global replacement of {key}
    const regex = new RegExp(`\\{${key}\\}`, 'g');

    // Convert value to string and replace all occurrences
    return text.replace(regex, String(value));
  }, template);
}
```

#### Acceptance Criteria
- [ ] Replaces `{variable}` placeholders correctly
- [ ] Handles multiple occurrences of same variable
- [ ] Skips `undefined` and `null` values
- [ ] Converts numbers to strings automatically
- [ ] Returns original template if no variables provided
- [ ] Returns original template if template is empty/falsy

#### Test Cases

| Input Template | Variables | Expected Output |
|---------------|-----------|-----------------|
| `'Hello {name}!'` | `{ name: 'John' }` | `'Hello John!'` |
| `'Code: {code}, again: {code}'` | `{ code: 'ABC' }` | `'Code: ABC, again: ABC'` |
| `'{count} days ago'` | `{ count: 7 }` | `'7 days ago'` |
| `'Hello {name}!'` | `{ name: undefined }` | `'Hello {name}!'` |
| `'Hello {name}!'` | `undefined` | `'Hello {name}!'` |
| `''` | `{ name: 'John' }` | `''` |

#### Verification Steps
1. Create test cases for all scenarios
2. Verify global replacement works
3. Verify undefined handling works

---

### Task 4: Implement Message Loading and Caching
**Estimate**: 2 story points
**Priority**: P0 - Critical for performance

#### Description
Import all message files and create the language-to-messages mapping for server-side access.

#### Implementation in `/src/lib/l10n/emails/email-translations.ts`

```typescript
/**
 * Email Translation Utility
 * Part of REQ-E02-020: Create getEmailTranslation Utility Function
 *
 * Provides server-side utilities for retrieving translated email content
 * based on recipient language preferences.
 *
 * @module l10n/emails/email-translations
 * @created 2026-01-20
 */

import {
  SupportedLanguage,
  DEFAULT_LANGUAGE,
  isSupportedLanguage,
} from '@/lib/translation-service/translation-service.types';

import type {
  EmailTranslationKey,
  EmailVariables,
  EmailTranslationResult,
  GetEmailTranslationOptions,
  EmailCategory,
} from './types';

// ============================================================================
// Message Imports (Server-Side Static Import)
// ============================================================================

// Import all message files for server-side access
// These are loaded once at module initialization
import enMessages from '@/messages/en.json';
import frMessages from '@/messages/fr.json';
import esMessages from '@/messages/es.json';
import deMessages from '@/messages/de.json';
import nlMessages from '@/messages/nl.json';
import itMessages from '@/messages/it.json';

/**
 * Map of language codes to message bundles.
 * Used for quick lookup during translation retrieval.
 */
const messagesByLanguage: Record<SupportedLanguage, typeof enMessages> = {
  en: enMessages,
  fr: frMessages,
  es: esMessages,
  de: deMessages,
  nl: nlMessages,
  it: itMessages,
};

// ============================================================================
// Default Options
// ============================================================================

/**
 * Default options for translation retrieval.
 */
const defaultOptions: Required<GetEmailTranslationOptions> = {
  fallbackLanguage: DEFAULT_LANGUAGE,
  returnKeyOnMissing: true,
  logWarnings: process.env.NODE_ENV === 'development',
};
```

#### Acceptance Criteria
- [ ] All 6 language files imported correctly
- [ ] `messagesByLanguage` map is properly typed
- [ ] Default options use `DEFAULT_LANGUAGE` from types
- [ ] Development-only logging configured via `NODE_ENV`

#### Verification Steps
1. Build succeeds with imports
2. No circular dependency issues
3. Messages accessible at runtime

---

### Task 5: Implement Nested Value Retrieval Helper
**Estimate**: 1 story point
**Priority**: P0 - Required by main function

#### Description
Create a helper function to retrieve nested values from the message object using dot-notation paths.

#### Implementation

```typescript
/**
 * Get a nested value from an object using dot notation path.
 *
 * @param obj - Object to traverse
 * @param path - Dot-separated path (e.g., 'emails.accessApproval.subject')
 * @returns Value at path or undefined if not found
 *
 * @internal
 */
function getNestedValue(obj: Record<string, unknown>, path: string): string | undefined {
  const parts = path.split('.');
  let current: unknown = obj;

  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }

  return typeof current === 'string' ? current : undefined;
}
```

#### Acceptance Criteria
- [ ] Correctly traverses nested objects
- [ ] Returns `undefined` for missing paths
- [ ] Returns `undefined` for non-string leaf values
- [ ] Handles empty path segments gracefully

#### Test Cases

| Object | Path | Expected |
|--------|------|----------|
| `{ a: { b: 'value' } }` | `'a.b'` | `'value'` |
| `{ a: { b: 'value' } }` | `'a.c'` | `undefined` |
| `{ a: { b: 123 } }` | `'a.b'` | `undefined` |
| `{ a: null }` | `'a.b'` | `undefined` |

---

### Task 6: Implement Primary `getEmailTranslation` Function
**Estimate**: 3 story points
**Priority**: P0 - Core functionality

#### Description
Implement the main `getEmailTranslation` function that retrieves translated email strings with variable interpolation and fallback handling.

#### Implementation

```typescript
/**
 * Retrieve a translated email string for the specified language.
 *
 * This function looks up email translations from the message bundles,
 * automatically falling back to English if the translation is unavailable
 * in the requested language.
 *
 * @param key - Dot-notation path to translation (e.g., 'accessApproval.subject')
 * @param language - Target language for translation
 * @param variables - Optional variables to interpolate into the translation
 * @param options - Optional configuration for translation retrieval
 * @returns Translated string with variables interpolated
 *
 * @example
 * // Basic usage
 * const subject = getEmailTranslation('accessApproval.subject', 'fr', {
 *   accountName: 'Beach House'
 * });
 * // Returns: "Accès Accordé: Beach House - Votre Code d'Accès"
 *
 * @example
 * // With custom options
 * const greeting = getEmailTranslation('common.greeting', 'de', {
 *   name: 'Hans'
 * }, { returnKeyOnMissing: false });
 */
export function getEmailTranslation(
  key: EmailTranslationKey,
  language: SupportedLanguage | string,
  variables?: EmailVariables,
  options?: GetEmailTranslationOptions
): string {
  const opts = { ...defaultOptions, ...options };

  // Validate language code, fall back if invalid
  const targetLanguage: SupportedLanguage = isSupportedLanguage(language)
    ? language
    : opts.fallbackLanguage;

  // Prepend 'emails.' if not already present
  const fullKey = key.startsWith('emails.') ? key : `emails.${key}`;

  // Try target language first
  const messages = messagesByLanguage[targetLanguage];
  let translation = getNestedValue(messages as unknown as Record<string, unknown>, fullKey);

  // Fallback to English if not found
  if (!translation && targetLanguage !== 'en') {
    if (opts.logWarnings) {
      console.warn(
        `[Email Translation] Missing translation for key "${fullKey}" in language "${targetLanguage}", falling back to English`
      );
    }
    const fallbackMessages = messagesByLanguage[opts.fallbackLanguage];
    translation = getNestedValue(fallbackMessages as unknown as Record<string, unknown>, fullKey);
  }

  // Handle missing translation
  if (!translation) {
    if (opts.logWarnings) {
      console.warn(`[Email Translation] Translation key not found: "${fullKey}"`);
    }
    return opts.returnKeyOnMissing ? key : '';
  }

  // Interpolate variables and return
  return interpolateVariables(translation, variables);
}
```

#### Acceptance Criteria
- [ ] Returns translated string for valid key and language
- [ ] Automatically prepends `emails.` if not present
- [ ] Falls back to English when translation missing
- [ ] Falls back to English for invalid language codes
- [ ] Interpolates variables correctly
- [ ] Returns key path when translation missing (default)
- [ ] Returns empty string when `returnKeyOnMissing: false`
- [ ] Logs warnings in development mode
- [ ] Does not log warnings in production

#### Test Scenarios

| Scenario | Key | Language | Variables | Expected Behavior |
|----------|-----|----------|-----------|-------------------|
| Valid translation | `'accessApproval.subject'` | `'en'` | `{ accountName: 'Test' }` | Returns translated string |
| Missing in target | `'accessApproval.subject'` | `'fr'` | `{}` | Falls back to English |
| Invalid language | `'common.greeting'` | `'xx'` | `{}` | Uses English |
| Missing key | `'nonexistent.key'` | `'en'` | `{}` | Returns key path |
| With `emails.` prefix | `'emails.common.greeting'` | `'en'` | `{}` | Works correctly |

---

### Task 7: Implement `getEmailTranslationWithInfo` Function
**Estimate**: 2 story points
**Priority**: P1 - Extended functionality

#### Description
Implement a version of the translation function that returns metadata about how the translation was resolved.

#### Implementation

```typescript
/**
 * Retrieve a translated email string with metadata about the retrieval.
 *
 * @param key - Dot-notation path to translation
 * @param language - Target language for translation
 * @param variables - Optional variables to interpolate
 * @param options - Optional configuration
 * @returns Object with translated text and metadata
 *
 * @example
 * const result = getEmailTranslationWithInfo('accessApproval.subject', 'fr', {
 *   accountName: 'Beach House'
 * });
 * console.log(result.text);       // Translated text
 * console.log(result.isFallback); // true if English fallback was used
 * console.log(result.language);   // 'fr' or 'en' (actual language used)
 */
export function getEmailTranslationWithInfo(
  key: EmailTranslationKey,
  language: SupportedLanguage | string,
  variables?: EmailVariables,
  options?: GetEmailTranslationOptions
): EmailTranslationResult {
  const opts = { ...defaultOptions, ...options };

  const targetLanguage: SupportedLanguage = isSupportedLanguage(language)
    ? language
    : opts.fallbackLanguage;

  const fullKey = key.startsWith('emails.') ? key : `emails.${key}`;

  const messages = messagesByLanguage[targetLanguage];
  let translation = getNestedValue(messages as unknown as Record<string, unknown>, fullKey);
  let isFallback = false;
  let actualLanguage = targetLanguage;

  if (!translation && targetLanguage !== 'en') {
    isFallback = true;
    actualLanguage = 'en';
    const fallbackMessages = messagesByLanguage['en'];
    translation = getNestedValue(fallbackMessages as unknown as Record<string, unknown>, fullKey);
  }

  const text = translation
    ? interpolateVariables(translation, variables)
    : opts.returnKeyOnMissing
    ? key
    : '';

  return {
    text,
    isFallback,
    language: actualLanguage,
  };
}
```

#### Acceptance Criteria
- [ ] Returns `EmailTranslationResult` object
- [ ] `text` contains the translated string
- [ ] `isFallback` is `true` when English fallback used
- [ ] `language` indicates actual language used
- [ ] All other behavior matches `getEmailTranslation`

---

### Task 8: Implement `getEmailSection` Function
**Estimate**: 2 story points
**Priority**: P1 - Bulk retrieval

#### Description
Implement a function to retrieve all translations for a specific email category at once, useful for generating complete emails.

#### Implementation

```typescript
/**
 * Retrieve all translations for a specific email category.
 *
 * @param category - Email category (e.g., 'accessApproval', 'common')
 * @param language - Target language
 * @param variables - Variables to interpolate into all strings
 * @returns Object with all translated strings for the category
 *
 * @example
 * const accessApproval = getEmailSection('accessApproval', 'es', {
 *   accountName: 'Casa de Playa',
 *   accessCode: 'ABC123DEF456'
 * });
 * console.log(accessApproval.subject);
 * console.log(accessApproval.intro);
 */
export function getEmailSection(
  category: EmailCategory,
  language: SupportedLanguage | string,
  variables?: EmailVariables
): Record<string, string> {
  const targetLanguage: SupportedLanguage = isSupportedLanguage(language)
    ? language
    : DEFAULT_LANGUAGE;

  const messages = messagesByLanguage[targetLanguage];
  const emailMessages = (messages as unknown as Record<string, unknown>).emails as Record<string, unknown> | undefined;
  const sectionMessages = emailMessages?.[category] as Record<string, string> | undefined;

  if (!sectionMessages) {
    // Fallback to English
    const enMessages = messagesByLanguage['en'];
    const enEmailMessages = (enMessages as unknown as Record<string, unknown>).emails as Record<string, unknown>;
    const enSection = enEmailMessages?.[category] as Record<string, string>;

    if (!enSection) return {};

    return Object.fromEntries(
      Object.entries(enSection).map(([key, value]) => [
        key,
        interpolateVariables(value, variables),
      ])
    );
  }

  return Object.fromEntries(
    Object.entries(sectionMessages).map(([key, value]) => [
      key,
      interpolateVariables(value, variables),
    ])
  );
}
```

#### Acceptance Criteria
- [ ] Returns all keys for specified category
- [ ] Interpolates variables into all returned strings
- [ ] Falls back to English if category missing
- [ ] Returns empty object if category not found anywhere
- [ ] Works with all 5 email categories

---

### Task 9: Implement Utility Helper Functions
**Estimate**: 1 story point
**Priority**: P2 - Nice to have

#### Description
Implement additional utility functions for checking translation availability.

#### Implementation

```typescript
/**
 * Check if email translations exist for a given language.
 *
 * @param language - Language to check
 * @returns true if emails namespace exists for language
 */
export function hasEmailTranslations(language: SupportedLanguage | string): boolean {
  if (!isSupportedLanguage(language)) return false;

  const messages = messagesByLanguage[language];
  const emailMessages = (messages as unknown as Record<string, unknown>).emails;

  return emailMessages !== undefined && Object.keys(emailMessages).length > 0;
}

/**
 * Get all supported languages that have email translations.
 *
 * @returns Array of language codes with email translations
 */
export function getLanguagesWithEmailTranslations(): SupportedLanguage[] {
  return (Object.keys(messagesByLanguage) as SupportedLanguage[]).filter(
    (lang) => hasEmailTranslations(lang)
  );
}
```

#### Acceptance Criteria
- [ ] `hasEmailTranslations` returns true for languages with emails namespace
- [ ] `hasEmailTranslations` returns false for invalid languages
- [ ] `getLanguagesWithEmailTranslations` returns array of valid languages

---

### Task 10: Update Type Exports
**Estimate**: 1 story point
**Priority**: P2 - Integration

#### Description
Ensure email translation types are exported from the central types location for external use.

#### File to Modify: `/src/types/index.ts`

Add the following export:

```typescript
// Email translation types
export type {
  EmailVariables,
  EmailTranslationKey,
  EmailCategory,
  EmailTranslationResult,
  GetEmailTranslationOptions,
} from '@/lib/l10n/emails/types';
```

#### Acceptance Criteria
- [ ] Types accessible from `@/types`
- [ ] No breaking changes to existing exports
- [ ] Import works correctly

---

### Task 11: Write Unit Tests
**Estimate**: 3 story points
**Priority**: P1 - Quality assurance

#### Description
Create comprehensive unit tests for all email translation functions.

#### File to Create: `/src/lib/l10n/emails/__tests__/email-translations.test.ts`

```typescript
/**
 * Email Translation Utility Tests
 * Part of REQ-E02-020
 *
 * @created 2026-01-20
 */

import {
  getEmailTranslation,
  getEmailTranslationWithInfo,
  getEmailSection,
  interpolateVariables,
  hasEmailTranslations,
  getLanguagesWithEmailTranslations,
} from '../email-translations';

describe('interpolateVariables', () => {
  it('replaces single variable', () => {
    expect(interpolateVariables('Hello {name}!', { name: 'John' }))
      .toBe('Hello John!');
  });

  it('replaces multiple occurrences', () => {
    expect(interpolateVariables('{x} + {x} = 2{x}', { x: 'a' }))
      .toBe('a + a = 2a');
  });

  it('converts numbers to strings', () => {
    expect(interpolateVariables('{count} days', { count: 7 }))
      .toBe('7 days');
  });

  it('skips undefined values', () => {
    expect(interpolateVariables('Hello {name}!', { name: undefined }))
      .toBe('Hello {name}!');
  });

  it('returns template if no variables', () => {
    expect(interpolateVariables('Hello!', undefined))
      .toBe('Hello!');
  });

  it('handles empty template', () => {
    expect(interpolateVariables('', { name: 'John' }))
      .toBe('');
  });
});

describe('getEmailTranslation', () => {
  it('returns English translation for valid key', () => {
    const result = getEmailTranslation('common.greeting', 'en', { name: 'Test' });
    expect(result).toBe('Hello Test,');
  });

  it('falls back to English for missing translation', () => {
    // Assumes fr.json has emails.common.greeting or falls back to en
    const result = getEmailTranslation('common.greeting', 'fr', { name: 'Test' });
    expect(result).toBeTruthy();
  });

  it('handles invalid language code', () => {
    const result = getEmailTranslation('common.greeting', 'invalid', { name: 'Test' });
    expect(result).toBe('Hello Test,');
  });

  it('prepends emails. prefix automatically', () => {
    const withPrefix = getEmailTranslation('emails.common.greeting', 'en', { name: 'A' });
    const withoutPrefix = getEmailTranslation('common.greeting', 'en', { name: 'A' });
    expect(withPrefix).toBe(withoutPrefix);
  });

  it('returns key for missing translation by default', () => {
    const result = getEmailTranslation('nonexistent.key', 'en');
    expect(result).toBe('nonexistent.key');
  });

  it('returns empty string when returnKeyOnMissing is false', () => {
    const result = getEmailTranslation('nonexistent.key', 'en', {}, {
      returnKeyOnMissing: false
    });
    expect(result).toBe('');
  });
});

describe('getEmailTranslationWithInfo', () => {
  it('returns result object with correct structure', () => {
    const result = getEmailTranslationWithInfo('common.greeting', 'en', { name: 'Test' });
    expect(result).toHaveProperty('text');
    expect(result).toHaveProperty('isFallback');
    expect(result).toHaveProperty('language');
  });

  it('isFallback is false when translation found', () => {
    const result = getEmailTranslationWithInfo('common.greeting', 'en', { name: 'Test' });
    expect(result.isFallback).toBe(false);
    expect(result.language).toBe('en');
  });
});

describe('getEmailSection', () => {
  it('returns all keys for common section', () => {
    const section = getEmailSection('common', 'en');
    expect(section).toHaveProperty('greeting');
    expect(section).toHaveProperty('regards');
    expect(section).toHaveProperty('team');
  });

  it('interpolates variables in all values', () => {
    const section = getEmailSection('common', 'en', { name: 'Test' });
    expect(section.greeting).toBe('Hello Test,');
  });

  it('returns empty object for invalid category', () => {
    const section = getEmailSection('invalidCategory' as any, 'en');
    expect(section).toEqual({});
  });
});

describe('hasEmailTranslations', () => {
  it('returns true for English', () => {
    expect(hasEmailTranslations('en')).toBe(true);
  });

  it('returns false for invalid language', () => {
    expect(hasEmailTranslations('invalid')).toBe(false);
  });
});

describe('getLanguagesWithEmailTranslations', () => {
  it('returns array of supported languages', () => {
    const languages = getLanguagesWithEmailTranslations();
    expect(Array.isArray(languages)).toBe(true);
    expect(languages).toContain('en');
  });
});
```

#### Acceptance Criteria
- [ ] Tests for `interpolateVariables` (6 tests)
- [ ] Tests for `getEmailTranslation` (7 tests)
- [ ] Tests for `getEmailTranslationWithInfo` (2 tests)
- [ ] Tests for `getEmailSection` (3 tests)
- [ ] Tests for `hasEmailTranslations` (2 tests)
- [ ] Tests for `getLanguagesWithEmailTranslations` (1 test)
- [ ] All tests pass

#### Verification Steps
1. Run `npm test -- email-translations.test.ts`
2. All tests pass
3. Coverage report shows adequate coverage

---

### Task 12: Validate Complete Implementation
**Estimate**: 1 story point
**Priority**: P0 - Must do last

#### Description
Final validation to ensure all acceptance criteria are met and integration works correctly.

#### Checklist

**File Structure**
- [ ] `/src/lib/l10n/emails/types.ts` exists
- [ ] `/src/lib/l10n/emails/email-translations.ts` exists
- [ ] `/src/lib/l10n/emails/index.ts` exists
- [ ] `/src/lib/l10n/index.ts` exists

**Function Implementation**
- [ ] `getEmailTranslation` is exported and works
- [ ] `getEmailTranslationWithInfo` is exported and works
- [ ] `getEmailSection` is exported and works
- [ ] `interpolateVariables` is exported and works
- [ ] `hasEmailTranslations` is exported and works
- [ ] `getLanguagesWithEmailTranslations` is exported and works

**Type Safety**
- [ ] `EmailCategory` type is defined
- [ ] `EmailVariables` interface is defined
- [ ] `EmailTranslationKey` type is defined
- [ ] `EmailTranslationResult` interface is defined
- [ ] `GetEmailTranslationOptions` interface is defined

**Fallback Behavior**
- [ ] Falls back to English when translation missing
- [ ] Handles invalid language codes gracefully
- [ ] Logs warnings in development only

**Build Validation**
- [ ] `npm run build` succeeds
- [ ] No TypeScript errors
- [ ] No import errors
- [ ] Tests pass

#### Verification Commands

```bash
# Build project
npm run build

# Run tests
npm test -- email-translations.test.ts

# Type check
npx tsc --noEmit

# Test import (in Node REPL or test file)
# import { getEmailTranslation } from '@/lib/l10n/emails';
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `/src/lib/l10n/emails/types.ts` | TypeScript type definitions |
| `/src/lib/l10n/emails/email-translations.ts` | Core utility functions |
| `/src/lib/l10n/emails/index.ts` | Barrel exports for module |
| `/src/lib/l10n/index.ts` | Top-level l10n barrel export |
| `/src/lib/l10n/emails/__tests__/email-translations.test.ts` | Unit tests |

## Files to Modify

| File | Modification |
|------|--------------|
| `/src/types/index.ts` | Add email type exports |

## Files NOT to Modify (in this task)

| File | Reason |
|------|--------|
| `/src/lib/email-templates.ts` | Will be updated in Tasks 2I.3-2I.6 |
| `/messages/*.json` | Already created in Task 2I.1 |
| `/src/lib/i18n/config.ts` | No changes needed |
| Any component files | Email templates are server-side only |

---

## Variable Placeholder Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `{name}` | Recipient's name | `"John"` |
| `{accountName}` | Account/property name | `"Beach House"` |
| `{accessCode}` | Generated access code | `"ABC123DEF456"` |
| `{requestDate}` | Date access was requested | `"January 15, 2026"` |
| `{approvalDate}` | Date beta access granted | `"January 20, 2026"` |
| `{directLink}` | Registration URL with pre-filled code | `"https://..."` |
| `{registrationLink}` | Base registration URL | `"https://faqbnb.com/register"` |
| `{daysSinceApproval}` | Days since approval | `"7"` |
| `{reason}` | Denial reason (optional) | `"Not on waitlist"` |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| JSON import issues in edge runtime | Low | Medium | Test in edge environment early |
| Circular import with types | Low | Medium | Keep imports one-directional |
| Type inference issues | Low | Low | Use explicit type annotations |
| Missing emails namespace in messages | Low | High | Verify Task 2I.1 complete first |
| Test environment setup issues | Medium | Low | Mock message files if needed |

---

## Dependencies

### Required (Already Installed)
- TypeScript 5.x - Type checking
- Next.js 15.x - App Router support
- Jest/Vitest - Testing framework

### Internal Dependencies
- `/src/lib/translation-service/translation-service.types.ts` - `SupportedLanguage` type
- `/messages/*.json` - Translation message files (from Task 2I.1)

### No New External Dependencies Required

---

## Story Points Summary

| Task | Story Points |
|------|--------------|
| Task 1: Create Directory Structure | 1 |
| Task 2: Create Type Definitions | 2 |
| Task 3: Implement Interpolation Helper | 1 |
| Task 4: Implement Message Loading | 2 |
| Task 5: Implement Nested Value Retrieval | 1 |
| Task 6: Implement `getEmailTranslation` | 3 |
| Task 7: Implement `getEmailTranslationWithInfo` | 2 |
| Task 8: Implement `getEmailSection` | 2 |
| Task 9: Implement Utility Helpers | 1 |
| Task 10: Update Type Exports | 1 |
| Task 11: Write Unit Tests | 3 |
| Task 12: Validate Implementation | 1 |
| **Total** | **20 SP** |

**Estimated Completion**: 1-2 days

---

## Future Integration Points

This utility function will be consumed by:

1. **Task 2I.3**: Updated `generateAccessApprovalEmail`
2. **Task 2I.4**: Updated `generateAccessDenialEmail`
3. **Task 2I.5**: Updated `generateBetaAccessApprovalEmail`
4. **Task 2I.6**: Updated `generateRegistrationReminderEmail`
5. **Task 2I.7**: Language parameter addition to all functions
6. **Task 2I.9**: Email testing in each language

---

## Usage Examples (After Implementation)

### Basic Usage

```typescript
import { getEmailTranslation } from '@/lib/l10n/emails';

// Get translated email subject
const subject = getEmailTranslation('accessApproval.subject', 'fr', {
  accountName: 'Beach House'
});
// Returns: "Accès Accordé: Beach House - Votre Code d'Accès"
```

### With Email Generation Function

```typescript
import { getEmailTranslation, getEmailSection } from '@/lib/l10n/emails';
import { SupportedLanguage } from '@/types';

export function generateLocalizedAccessApprovalEmail(
  request: AccessRequest,
  accessCode: string,
  accountName: string,
  language: SupportedLanguage
): EmailTemplate {
  const variables = {
    name: request.requester_name || 'there',
    accountName,
    accessCode,
    requestDate: new Date(request.request_date).toLocaleDateString(),
    directLink: createRegistrationLink(accessCode, request.requester_email),
  };

  const t = (key: string) => getEmailTranslation(key, language, variables);

  return {
    subject: t('accessApproval.subject'),
    body: `${t('common.greeting')}

${t('accessApproval.intro')}

${t('accessApproval.accessDetailsHeading')}
${t('accessApproval.accountLabel')}
${t('accessApproval.accessCodeLabel')}
${t('accessApproval.requestedOnLabel')}

${t('accessApproval.instructionsHeading')}
1. ${t('accessApproval.step1')}
   ${t('accessApproval.step1Note')}
2. ${t('accessApproval.step2')}
3. ${t('accessApproval.step3')}

${t('common.regards')}
${t('common.team')}

${t('common.separator')}
${t('common.footer')}`,
    variables,
  };
}
```

### Using Section Retrieval

```typescript
import { getEmailSection } from '@/lib/l10n/emails';

const approvalStrings = getEmailSection('accessApproval', userLanguage, {
  accountName: 'Beach House',
  accessCode: 'ABC123DEF456',
});

console.log(approvalStrings.subject);
console.log(approvalStrings.intro);
console.log(approvalStrings.step1);
```

### With Fallback Metadata

```typescript
import { getEmailTranslationWithInfo } from '@/lib/l10n/emails';

const result = getEmailTranslationWithInfo('accessApproval.subject', 'fr', {
  accountName: 'Beach House'
});

if (result.isFallback) {
  console.log(`Using English fallback (requested: ${result.language})`);
}
console.log(result.text);
```

---

*End of Detailed Task Breakdown*
