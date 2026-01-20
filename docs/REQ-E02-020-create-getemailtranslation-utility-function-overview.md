# REQ-E02-020: Create `getEmailTranslation` Utility Function - Implementation Overview

*Generated: 2026-01-20 14:30:00 UTC*
*Last Modified: 2026-01-20 14:30:00 UTC*

## Reference

- **Request**: REQ-E02-020 (Create Email Translation Utility Function)
- **Source**: docs/gen_requests_epic2.md
- **Implementation Plan**: docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md
- **Type**: New Feature
- **Phase**: 2I (Email Templates)
- **Task ID**: 2I.2
- **Size**: S (Small)
- **Epic**: Localization Epic 2 - Static UI Translation
- **Depends On**:
  - Epic 1 (L10N Foundation - next-intl setup)
  - REQ-E02-019 (Task 2I.1 - Emails Namespace Structure)

## Summary

Create a dedicated utility function `getEmailTranslation` to retrieve email translations for system-generated emails, enabling email templates to display content in the recipient's preferred language. This function serves as the bridge between the email namespace translations (created in Task 2I.1) and the email generation functions in `/src/lib/email-templates.ts`.

## Goals

1. Create a type-safe utility function for retrieving email translations from the messages bundle
2. Support language selection based on recipient preference
3. Implement graceful fallback to English when translations are unavailable
4. Support variable interpolation for dynamic content (user names, links, dates)
5. Work seamlessly in server-side rendering contexts (API routes, server components)
6. Provide clear TypeScript types for email content keys
7. Enable both plain text and HTML email template consumption

## Context from Implementation Plan

### Plan-111 Reference Implementation

From `/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md`, Section "Sub-Epic 2I: Email Templates":

```typescript
// /src/lib/i18n/email-translations.ts
import { SupportedLanguage } from '@/types';

type EmailTranslations = {
  [key: string]: {
    [lang in SupportedLanguage]: string;
  };
};

export function getEmailTranslation(
  key: string,
  language: SupportedLanguage,
  variables?: Record<string, string>
): string {
  const template = emailTranslations[key]?.[language] || emailTranslations[key]?.['en'];
  if (!template) return key;

  return Object.entries(variables || {}).reduce(
    (text, [key, value]) => text.replace(`{${key}}`, value),
    template
  );
}
```

### Existing Translation Service Patterns

The codebase has established patterns in `/src/lib/translation-service/`:

**Type Definitions (`translation-service.types.ts`):**
```typescript
export type SupportedLanguage = 'en' | 'fr' | 'es' | 'de' | 'nl' | 'it';
export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';
export function isSupportedLanguage(code: string): code is SupportedLanguage;
```

**Utility Functions:**
- `isSupportedLanguage()` - Type guard for language validation
- `getLanguageInfo()` - Language metadata lookup
- `getOtherLanguages()` - Get all languages except specified

### Existing Email Template Structure

From `/src/lib/email-templates.ts`:
```typescript
export interface EmailTemplate {
  subject: string;
  body: string;
  variables: Record<string, string>;
}
```

### Email Namespace Structure (Task 2I.1)

The `emails` namespace in `/messages/en.json` follows this structure:
```json
{
  "emails": {
    "common": { "greeting": "Hello {name}," ... },
    "accessApproval": { "subject": "...", "intro": "..." ... },
    "betaAccess": { ... },
    "accessDenial": { ... },
    "registrationReminder": { ... }
  }
}
```

## Implementation Order

### Step 1: Create Type Definitions

Define TypeScript types for email translation keys and function signatures.

### Step 2: Implement Core Translation Function

Create `getEmailTranslation` with:
- Language message loading
- Key path resolution
- Fallback handling
- Variable interpolation

### Step 3: Add Helper Functions

Implement supporting utilities:
- `getEmailSubject()` - Subject-specific retrieval
- `getEmailSection()` - Retrieve multiple keys for an email type
- `interpolateVariables()` - Variable replacement helper

### Step 4: Add Server-Side Support

Ensure function works in:
- API routes
- Server actions
- Edge functions

### Step 5: Write Unit Tests

Create tests for:
- Basic translation retrieval
- Fallback to English
- Variable interpolation
- Invalid key handling
- Type safety

## Authorized Files and Functions for Modification

### Files to Create

#### `/src/lib/l10n/emails/index.ts`

- **Purpose**: Main entry point for email translation utilities
- **Exports**: All email translation functions and types
- **Pattern**: Barrel export file

```typescript
export * from './email-translations';
export * from './types';
```

#### `/src/lib/l10n/emails/types.ts`

- **Purpose**: TypeScript type definitions for email translations
- **Contents**:

```typescript
/**
 * Email Translation Types
 * Part of REQ-E02-020: Email Translation Utility Function
 *
 * @created 2026-01-20
 */

import { SupportedLanguage } from '@/lib/translation-service/translation-service.types';

/**
 * Email content categories matching the emails namespace structure
 */
export type EmailCategory =
  | 'common'
  | 'accessApproval'
  | 'betaAccess'
  | 'accessDenial'
  | 'registrationReminder';

/**
 * Common email element keys
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

/**
 * Dot-notation path to email translation key
 * Example: 'accessApproval.subject', 'common.greeting'
 */
export type EmailTranslationKey = string;

/**
 * Variables that can be interpolated into email translations
 */
export interface EmailVariables {
  name?: string;
  accountName?: string;
  accessCode?: string;
  requestDate?: string;
  approvalDate?: string;
  directLink?: string;
  registrationLink?: string;
  daysSinceApproval?: string | number;
  reason?: string;
  [key: string]: string | number | undefined;
}

/**
 * Result of email translation retrieval
 */
export interface EmailTranslationResult {
  /** Translated text with variables interpolated */
  text: string;
  /** Whether fallback to English was used */
  isFallback: boolean;
  /** The language used */
  language: SupportedLanguage;
}

/**
 * Options for getEmailTranslation function
 */
export interface GetEmailTranslationOptions {
  /** Fallback language if requested language unavailable */
  fallbackLanguage?: SupportedLanguage;
  /** Whether to return key if translation missing (vs empty string) */
  returnKeyOnMissing?: boolean;
  /** Whether to log warnings for missing translations */
  logWarnings?: boolean;
}

/**
 * Complete email content for a template type
 */
export interface EmailContent {
  subject: string;
  sections: Record<string, string>;
}
```

#### `/src/lib/l10n/emails/email-translations.ts`

- **Purpose**: Core email translation utility function
- **Contents**:

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

// Import all message files for server-side access
import enMessages from '@/messages/en.json';
import frMessages from '@/messages/fr.json';
import esMessages from '@/messages/es.json';
import deMessages from '@/messages/de.json';
import nlMessages from '@/messages/nl.json';
import itMessages from '@/messages/it.json';

/**
 * Map of language codes to message bundles
 */
const messagesByLanguage: Record<SupportedLanguage, typeof enMessages> = {
  en: enMessages,
  fr: frMessages,
  es: esMessages,
  de: deMessages,
  nl: nlMessages,
  it: itMessages,
};

/**
 * Default options for translation retrieval
 */
const defaultOptions: Required<GetEmailTranslationOptions> = {
  fallbackLanguage: DEFAULT_LANGUAGE,
  returnKeyOnMissing: true,
  logWarnings: process.env.NODE_ENV === 'development',
};

/**
 * Interpolate variables into a translation string.
 * Replaces {variable} placeholders with provided values.
 *
 * @param template - Translation string with placeholders
 * @param variables - Values to interpolate
 * @returns String with variables replaced
 *
 * @example
 * interpolateVariables('Hello {name}!', { name: 'John' })
 * // Returns: 'Hello John!'
 */
export function interpolateVariables(
  template: string,
  variables?: EmailVariables
): string {
  if (!variables || !template) return template;

  return Object.entries(variables).reduce((text, [key, value]) => {
    if (value === undefined || value === null) return text;
    const regex = new RegExp(`\\{${key}\\}`, 'g');
    return text.replace(regex, String(value));
  }, template);
}

/**
 * Get a nested value from an object using dot notation path.
 *
 * @param obj - Object to traverse
 * @param path - Dot-separated path (e.g., 'emails.accessApproval.subject')
 * @returns Value at path or undefined
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

  // Validate language code
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
 * console.log(result.isFallback); // true if English fallback was used
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

### Files to Modify

#### `/src/lib/l10n/index.ts` (Create if not exists)

- **Purpose**: Barrel export for l10n utilities
- **Modification Required**: Add email translation exports

```typescript
// Export email translation utilities
export * from './emails';
```

#### `/src/types/index.ts`

- **Purpose**: Central type exports
- **Modification Required**: Re-export email translation types
- **Location of change**: Add export for new email types

```typescript
// Add this line to existing exports
export type {
  EmailVariables,
  EmailTranslationKey,
  EmailCategory
} from '@/lib/l10n/emails/types';
```

### Files NOT to Modify (in this task)

- `/src/lib/email-templates.ts` - Will be updated in Tasks 2I.3-2I.6
- `/messages/*.json` - Already created in Task 2I.1
- `/src/lib/i18n/config.ts` - No changes needed
- Component files - Email templates are server-side only

## Technical Specifications

### Function Signatures

```typescript
// Primary function
function getEmailTranslation(
  key: EmailTranslationKey,
  language: SupportedLanguage | string,
  variables?: EmailVariables,
  options?: GetEmailTranslationOptions
): string;

// With metadata
function getEmailTranslationWithInfo(
  key: EmailTranslationKey,
  language: SupportedLanguage | string,
  variables?: EmailVariables,
  options?: GetEmailTranslationOptions
): EmailTranslationResult;

// Get entire section
function getEmailSection(
  category: EmailCategory,
  language: SupportedLanguage | string,
  variables?: EmailVariables
): Record<string, string>;

// Utility helpers
function interpolateVariables(template: string, variables?: EmailVariables): string;
function hasEmailTranslations(language: SupportedLanguage | string): boolean;
function getLanguagesWithEmailTranslations(): SupportedLanguage[];
```

### Variable Interpolation Rules

1. Variables use `{variableName}` syntax
2. Missing variables are left as-is in the string
3. `undefined` and `null` values are skipped
4. Numbers are converted to strings automatically
5. Global replacement (all occurrences) of each variable

### Fallback Behavior

| Scenario | Result |
|----------|--------|
| Translation exists in target language | Return translated string |
| Missing in target, exists in English | Return English + log warning (dev) |
| Missing in all languages | Return key path (configurable) |
| Invalid language code | Use English as default |

### Server-Side Context Support

The function works in these contexts:
- **API Routes**: `/app/api/*/route.ts`
- **Server Actions**: Functions with `'use server'`
- **Server Components**: Async components
- **Edge Functions**: Vercel/Cloudflare edge runtime

### Error Handling

```typescript
// Invalid language code - graceful fallback
getEmailTranslation('key', 'invalid-lang'); // Uses 'en'

// Missing key - returns key path
getEmailTranslation('nonexistent.key', 'en'); // Returns 'nonexistent.key'

// Missing key with option - returns empty
getEmailTranslation('nonexistent.key', 'en', {}, { returnKeyOnMissing: false }); // Returns ''
```

## Usage Patterns

### Basic Usage

```typescript
import { getEmailTranslation } from '@/lib/l10n/emails';

// Get translated email subject
const subject = getEmailTranslation('accessApproval.subject', 'fr', {
  accountName: 'Beach House'
});
// Returns: "Acces Accorde: Beach House - Votre Code d'Acces"
```

### With Email Generation Function

```typescript
import { getEmailTranslation, getEmailSection } from '@/lib/l10n/emails';

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
    directLink: createRegistrationLinkWithCode(accessCode, request.requester_email),
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

### Using getEmailSection for Bulk Retrieval

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

### With Translation Metadata

```typescript
import { getEmailTranslationWithInfo } from '@/lib/l10n/emails';

const result = getEmailTranslationWithInfo('accessApproval.subject', 'fr', {
  accountName: 'Beach House'
});

console.log(result.text);      // Translated text
console.log(result.isFallback); // true if English fallback used
console.log(result.language);   // Actual language used
```

## Success Validation Checklist

### Function Implementation
- [ ] `getEmailTranslation` function is implemented
- [ ] `getEmailTranslationWithInfo` function is implemented
- [ ] `getEmailSection` function is implemented
- [ ] `interpolateVariables` helper is implemented
- [ ] `hasEmailTranslations` helper is implemented
- [ ] `getLanguagesWithEmailTranslations` helper is implemented

### Type Safety
- [ ] `EmailTranslationKey` type is defined
- [ ] `EmailVariables` interface is defined
- [ ] `EmailTranslationResult` interface is defined
- [ ] `GetEmailTranslationOptions` interface is defined
- [ ] `EmailCategory` type is defined
- [ ] All functions have proper TypeScript signatures

### Fallback Behavior
- [ ] Falls back to English when translation missing
- [ ] Returns key path when translation not found (default)
- [ ] Supports `returnKeyOnMissing: false` option
- [ ] Logs warnings in development mode
- [ ] Handles invalid language codes gracefully

### Variable Interpolation
- [ ] Replaces `{variable}` placeholders
- [ ] Handles missing variables gracefully
- [ ] Supports multiple occurrences of same variable
- [ ] Converts numbers to strings
- [ ] Ignores `undefined` and `null` values

### Server-Side Support
- [ ] Works in API routes
- [ ] Works in server components
- [ ] Works in server actions
- [ ] No client-side dependencies (useState, useEffect, etc.)

### Integration
- [ ] Application builds without errors: `npm run build`
- [ ] All 6 language files can be imported
- [ ] Function exports are accessible from barrel file
- [ ] Types are properly exported

### Testing
- [ ] Basic translation retrieval works
- [ ] Fallback to English works
- [ ] Variable interpolation works
- [ ] Invalid key handling works
- [ ] Invalid language handling works

## Dependencies

### Required (Already Installed)
- TypeScript 5.x - Type checking
- Next.js 15.x - App Router support

### Internal Dependencies
- `/src/lib/translation-service/translation-service.types.ts` - `SupportedLanguage` type
- `/messages/*.json` - Translation message files (from Task 2I.1)

### No New External Dependencies Required
This task only creates utility functions using existing dependencies.

## Risk Assessment

- **Risk Level**: Low
- **Rationale**:
  - Utility function with no side effects
  - Does not modify existing functionality
  - Extensive use of existing patterns
  - Easy to test in isolation
  - Rollback is straightforward

### Potential Issues

| Issue | Likelihood | Impact | Mitigation |
|-------|------------|--------|------------|
| JSON import issues in edge runtime | Low | Medium | Test in edge runtime early |
| Circular import with types | Low | Medium | Keep imports one-directional |
| Large bundle size from message imports | Low | Low | Tree-shaking for unused languages |
| Type inference issues | Low | Low | Explicit type annotations |

## Acceptance Criteria Mapping

| Acceptance Criteria | Implementation |
|---------------------|----------------|
| Utility function created | `/src/lib/l10n/emails/email-translations.ts` |
| Accepts language preference | `language: SupportedLanguage` parameter |
| Accepts email content key | `key: EmailTranslationKey` parameter |
| Retrieves from emails namespace | Prepends `emails.` to key path |
| Fallback to English | Check English messages when target missing |
| Supports variable interpolation | `interpolateVariables()` helper |
| Returns subject and body | `getEmailSection()` for bulk retrieval |
| Works in server-side contexts | No client hooks or browser APIs |
| Type-safe key access | TypeScript types for all parameters |
| Handles missing translations | Configurable via options |
| Documented with examples | JSDoc comments on all functions |
| Importable by email utilities | Exported from barrel file |

## Future Integration Points

This utility function will be consumed by:

1. **Task 2I.3**: Updated `generateAccessApprovalEmail`
2. **Task 2I.4**: Updated `generateAccessDenialEmail`
3. **Task 2I.5**: Updated `generateBetaAccessApprovalEmail`
4. **Task 2I.6**: Updated `generateRegistrationReminderEmail`
5. **Task 2I.7**: Language parameter addition to all functions
6. **Task 2I.9**: Email testing in each language

## Notes

### Design Decisions

1. **Direct JSON imports**: Import all message files directly for server-side use, avoiding dynamic imports which complicate server components.

2. **Prepend `emails.` automatically**: Keys passed without `emails.` prefix are automatically prefixed, reducing verbosity in calling code.

3. **Separate `getEmailSection` function**: Enables efficient bulk retrieval of all strings for a template type, reducing function calls.

4. **Configurable options**: `GetEmailTranslationOptions` allows per-call customization of fallback behavior without global settings.

5. **Development warnings**: Console warnings in development help catch missing translations during development without affecting production.

### Pattern Consistency

This implementation follows established patterns from:
- `/src/lib/translation-service/` - Type definitions and utility functions
- `/src/contexts/LocaleContext.tsx` - Language handling patterns
- `next-intl` conventions - ICU message format for interpolation

### Performance Considerations

- Message files are loaded once at module initialization
- No runtime network requests for translations
- Object traversal is minimal (dot-notation path parsing)
- Variable interpolation uses efficient regex replacement

---

*End of Implementation Overview*
