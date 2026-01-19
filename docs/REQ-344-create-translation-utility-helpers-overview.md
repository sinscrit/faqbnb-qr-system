# REQ-344: Create Translation Utility Helpers - Technical Implementation Overview

**Document Created:** 2026-01-19 16:25:00
**Last Modified:** 2026-01-19 16:25:00
**Request Reference:** REQ-344 (Translation Utility Helpers for Content Merging and Language Selection)
**Implementation Plan Reference:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`
**Phase:** 2 - Translation Data Layer
**Task ID:** 2.4

---

## 1. Executive Summary

This document provides the technical implementation breakdown for creating translation utility helper functions for the guest-facing localization experience. Task 2.4 creates pure, reusable utility functions that power translation merging, language selection fallback, and language display formatting across all guest-facing features.

### Scope

The utilities will provide:
- `translation-utils.ts` - Pure functions for translation operations
- `mergeTranslation()` - Merge original content with translation data
- `getDisplayLanguage()` - Determine best available language for display
- `formatLanguageName()` - Format language codes for UI display
- Type-safe implementations following established codebase patterns

### Key Characteristics

- **Pure Functions:** All utilities are pure functions with no side effects, making them easily testable
- **Type Safety:** Full TypeScript typing with strict mode compliance
- **Reusability:** Functions designed for use by API endpoints, components, and hooks
- **Consistency:** Centralizes translation logic to ensure uniform behavior across all features

### Dependencies

- **Epic 1 Completion Required:** Depends on i18n configuration from `/src/lib/i18n/config.ts` for language metadata and supported locales
- **Parallel Work:** Can be developed independently from Phase 3 UI components; provides foundation for API endpoints (Tasks 2.2, 2.3) and component rendering
- **Types Required:** Uses `SupportedLocale`, `LocaleMetadata` from existing i18n config

---

## 2. Technical Context

### 2.1 Existing Stack & Patterns

| Technology | Details | Source |
|------------|---------|--------|
| Framework | Next.js 15.5.9 with React 19.1.0 | `package.json` |
| Language | TypeScript 5.x (strict mode) | `tsconfig.json` |
| Utility Pattern | Pure functions in separate utils files | `/src/lib/i18n/config.ts` |
| i18n Base | Existing i18n configuration with locale metadata | `/src/lib/i18n/config.ts` |

### 2.2 Reference Patterns from Codebase

**Primary Pattern Reference:** `/src/lib/i18n/config.ts`
- Pure utility functions with comprehensive JSDoc documentation
- Type guards for validation
- Const assertions for type-safe constants
- Named exports following barrel export pattern

**Secondary Pattern Reference:** `/src/lib/i18n/language-detection.ts`
- Server-side language utilities
- Cookie and header handling patterns
- Priority-based detection logic

**Locale Context Reference:** `/src/contexts/LocaleContext.tsx`
- `SUPPORTED_LOCALES` constant with full metadata
- Language name formatting patterns
- Type definitions for locale options

### 2.3 Existing Types and Constants

The following types and constants already exist and should be reused:

```typescript
// From /src/lib/i18n/config.ts
export const locales = ['en', 'fr', 'es', 'de', 'nl', 'it'] as const;
export type SupportedLocale = (typeof locales)[number];
export const DEFAULT_LOCALE: SupportedLocale = 'en';

export interface LocaleMetadata {
  code: SupportedLocale;
  name: string;        // English name
  nativeName: string;  // Native name
  flag?: string;       // Optional flag emoji
}

export const localeMetadata: Record<SupportedLocale, LocaleMetadata>;
```

### 2.4 Integration Contract from Implementation Plan

The utilities must support the following interfaces from the Epic 4 plan:

```typescript
// Expected usage pattern from Plan-111
mergeTranslation(original: T, translation: Partial<T> | null): T;
getDisplayLanguage(requested: SupportedLocale, available: SupportedLocale[], source: SupportedLocale): SupportedLocale;
formatLanguageName(code: SupportedLocale, native?: boolean): string;
```

---

## 3. Implementation Approach

### 3.1 Utility Architecture

The utilities follow a pure function pattern where:
- Functions receive all required data as parameters
- No external state dependencies or side effects
- Predictable outputs for given inputs
- Easy to unit test in isolation

### 3.2 translation-utils.ts Design

```typescript
// Core functions to implement

/**
 * Merge original content with translation data.
 * Translation values override original values for non-null/undefined fields.
 */
export function mergeTranslation<T extends Record<string, unknown>>(
  original: T,
  translation: Partial<T> | null | undefined
): T;

/**
 * Determine the best language to display based on availability.
 * Returns requested language if available, otherwise falls back to source.
 */
export function getDisplayLanguage(
  requested: SupportedLocale,
  available: SupportedLocale[],
  source: SupportedLocale
): SupportedLocale;

/**
 * Format a language code into a human-readable display name.
 * Supports both English and native language name formats.
 */
export function formatLanguageName(
  code: string,
  native?: boolean
): string;

/**
 * Check if a translation has meaningful content (not empty/null).
 */
export function hasTranslationContent(translation: unknown): boolean;

/**
 * Create a translation metadata object for API responses.
 */
export function createTranslationMeta(
  requestedLanguage: SupportedLocale,
  displayLanguage: SupportedLocale,
  sourceLanguage: SupportedLocale,
  availableTranslations: SupportedLocale[],
  isShowingTranslation: boolean
): TranslationMeta;
```

### 3.3 mergeTranslation Algorithm

Merges original content with translation overlay using shallow merge with null-check:

```typescript
function mergeTranslation<T extends Record<string, unknown>>(
  original: T,
  translation: Partial<T> | null | undefined
): T {
  // Return original unchanged if no translation provided
  if (!translation) return original;

  // Create shallow copy to avoid mutation
  const merged = { ...original };

  // Iterate through translation keys
  for (const key of Object.keys(translation) as Array<keyof T>) {
    const translatedValue = translation[key];

    // Only override if translation value is meaningful (not null/undefined/empty string)
    if (translatedValue !== null && translatedValue !== undefined && translatedValue !== '') {
      merged[key] = translatedValue as T[keyof T];
    }
  }

  return merged;
}
```

### 3.4 getDisplayLanguage Algorithm

Implements fallback logic for language selection:

```typescript
function getDisplayLanguage(
  requested: SupportedLocale,
  available: SupportedLocale[],
  source: SupportedLocale
): SupportedLocale {
  // Handle edge cases
  if (!requested || !available || available.length === 0) {
    return source;
  }

  // Check if requested language is available
  if (available.includes(requested)) {
    return requested;
  }

  // Fallback to source language
  return source;
}
```

### 3.5 formatLanguageName Design

Leverages existing locale metadata for consistent formatting:

```typescript
import { localeMetadata, isValidLocale } from '@/lib/i18n/config';

function formatLanguageName(code: string, native = false): string {
  // Validate and lookup locale metadata
  if (!isValidLocale(code)) {
    // Return code as fallback for unrecognized codes
    return code;
  }

  const metadata = localeMetadata[code];
  if (!metadata) {
    return code;
  }

  return native ? metadata.nativeName : metadata.name;
}
```

---

## 4. Authorized Files and Functions for Modification

### 4.1 Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/lib/translations/translation-utils.ts` | Translation utility helper functions |
| `/src/lib/translations/index.ts` | Barrel exports for translations module |
| `/src/lib/translations/__tests__/translation-utils.test.ts` | Unit tests for translation utilities |

### 4.2 Files to Modify

| File Path | Modification |
|-----------|--------------|
| `/src/lib/translations/index.ts` | Add exports for translation-utils (create if not exists) |

### 4.3 Functions to Implement

#### translation-utils.ts Functions

| Function | Purpose |
|----------|---------|
| `mergeTranslation` | Merge original content object with translation overlay, preserving original values for null/undefined translation fields |
| `getDisplayLanguage` | Determine best language to display based on requested, available, and source languages |
| `formatLanguageName` | Format language code into human-readable display name with native language option |
| `hasTranslationContent` | Check if a translation object contains meaningful (non-empty) content |
| `createTranslationMeta` | Create standardized translation metadata object for API responses |
| `isTranslationComplete` | Check if translation has all required fields populated |
| `getTranslationStatus` | Determine translation completeness status ('complete', 'partial', 'missing') |

#### Types to Define

| Type/Interface | Purpose |
|----------------|---------|
| `TranslationMeta` | Metadata about translation state for API responses |
| `TranslationStatus` | Union type for translation completeness states |
| `MergeableContent` | Generic constraint for content objects that can be merged |

#### Constants

| Constant | Purpose |
|----------|---------|
| `TRANSLATION_FIELDS_ITEM` | Array of translatable field names for items |
| `TRANSLATION_FIELDS_ARTICLE` | Array of translatable field names for articles |
| `TRANSLATION_FIELDS_LINK` | Array of translatable field names for links |

---

## 5. Detailed Task Breakdown

### Task 2.4.1: Create translation-utils.ts

**File:** `/src/lib/translations/translation-utils.ts`

**Implementation:**

```typescript
/**
 * Translation Utilities for Guest Experience
 *
 * Pure utility functions for translation operations including
 * content merging, language selection, and display formatting.
 * All functions are side-effect free and easily testable.
 *
 * REQ-344: Create Translation Utility Helpers for Content Merging and Language Selection
 * Plan-111: L10N Epic 4 - Guest Experience, Phase 2, Task 2.4
 *
 * @module lib/translations/translation-utils
 * @created 2026-01-19
 * @lastModified 2026-01-19
 */

import {
  type SupportedLocale,
  localeMetadata,
  isValidLocale,
  DEFAULT_LOCALE,
} from '@/lib/i18n/config';

// =============================================================================
// Types
// =============================================================================

/**
 * Translation status indicating completeness level.
 */
export type TranslationStatus = 'complete' | 'partial' | 'missing';

/**
 * Metadata about translation state for API responses.
 * Used by GuestContentResponse to communicate translation context.
 */
export interface TranslationMeta {
  /** Language that was requested by the guest */
  requestedLanguage: SupportedLocale;
  /** Language actually being displayed */
  displayLanguage: SupportedLocale;
  /** Original/source language of the content */
  sourceLanguage: SupportedLocale;
  /** Languages that have translations available */
  availableTranslations: SupportedLocale[];
  /** Whether content is showing a translation vs original */
  isShowingTranslation: boolean;
  /** Completeness status of the translation */
  translationStatus?: TranslationStatus;
}

/**
 * Generic constraint for objects that can be merged with translations.
 */
export type MergeableContent = Record<string, unknown>;

// =============================================================================
// Constants
// =============================================================================

/**
 * Translatable field names for items.
 */
export const TRANSLATION_FIELDS_ITEM = ['name', 'description'] as const;

/**
 * Translatable field names for articles.
 */
export const TRANSLATION_FIELDS_ARTICLE = ['title', 'description'] as const;

/**
 * Translatable field names for links.
 */
export const TRANSLATION_FIELDS_LINK = ['title'] as const;

/**
 * Translatable field names for tags.
 */
export const TRANSLATION_FIELDS_TAG = ['displayValue'] as const;

// =============================================================================
// Content Merging Functions
// =============================================================================

/**
 * Merge original content with translation data.
 * Translation values override original values for non-null/undefined fields.
 * Creates a new object without mutating inputs.
 *
 * @param original - Original content object
 * @param translation - Translation overlay (can be null/undefined)
 * @returns Merged object with translations applied
 *
 * @example
 * const original = { name: 'Coffee Machine', description: 'Makes coffee' };
 * const translation = { name: 'Kaffeemaschine', description: null };
 * const merged = mergeTranslation(original, translation);
 * // Result: { name: 'Kaffeemaschine', description: 'Makes coffee' }
 *
 * @example
 * // Handles null translation gracefully
 * const result = mergeTranslation(original, null);
 * // Result: returns original unchanged
 */
export function mergeTranslation<T extends MergeableContent>(
  original: T,
  translation: Partial<T> | null | undefined
): T {
  // Return original unchanged if no translation provided
  if (!translation) {
    return original;
  }

  // Create shallow copy to avoid mutation
  const merged = { ...original };

  // Iterate through translation keys and apply non-null values
  for (const key of Object.keys(translation) as Array<keyof T>) {
    const translatedValue = translation[key];

    // Only override if translation value is meaningful
    // (not null, undefined, or empty string)
    if (
      translatedValue !== null &&
      translatedValue !== undefined &&
      translatedValue !== ''
    ) {
      merged[key] = translatedValue as T[keyof T];
    }
  }

  return merged;
}

/**
 * Check if a translation object contains meaningful (non-empty) content.
 *
 * @param translation - Translation object to check
 * @returns true if translation has at least one non-empty field
 *
 * @example
 * hasTranslationContent({ name: 'Kaffeemaschine' }) // true
 * hasTranslationContent({ name: null, description: '' }) // false
 * hasTranslationContent(null) // false
 */
export function hasTranslationContent(
  translation: MergeableContent | null | undefined
): boolean {
  if (!translation) {
    return false;
  }

  return Object.values(translation).some(
    (value) => value !== null && value !== undefined && value !== ''
  );
}

/**
 * Check if a translation has all required fields populated.
 *
 * @param translation - Translation object to check
 * @param requiredFields - Array of field names that must be present
 * @returns true if all required fields have non-empty values
 *
 * @example
 * isTranslationComplete({ name: 'Test', description: 'Desc' }, ['name', 'description']) // true
 * isTranslationComplete({ name: 'Test', description: null }, ['name', 'description']) // false
 */
export function isTranslationComplete(
  translation: MergeableContent | null | undefined,
  requiredFields: readonly string[]
): boolean {
  if (!translation) {
    return false;
  }

  return requiredFields.every((field) => {
    const value = translation[field];
    return value !== null && value !== undefined && value !== '';
  });
}

/**
 * Determine translation completeness status.
 *
 * @param translation - Translation object to check
 * @param requiredFields - Array of field names that should be translated
 * @returns Translation status: 'complete', 'partial', or 'missing'
 *
 * @example
 * getTranslationStatus({ name: 'Test', description: 'Desc' }, ['name', 'description']) // 'complete'
 * getTranslationStatus({ name: 'Test', description: null }, ['name', 'description']) // 'partial'
 * getTranslationStatus(null, ['name', 'description']) // 'missing'
 */
export function getTranslationStatus(
  translation: MergeableContent | null | undefined,
  requiredFields: readonly string[]
): TranslationStatus {
  if (!translation || !hasTranslationContent(translation)) {
    return 'missing';
  }

  const populatedCount = requiredFields.filter((field) => {
    const value = translation[field];
    return value !== null && value !== undefined && value !== '';
  }).length;

  if (populatedCount === 0) {
    return 'missing';
  }

  if (populatedCount === requiredFields.length) {
    return 'complete';
  }

  return 'partial';
}

// =============================================================================
// Language Selection Functions
// =============================================================================

/**
 * Determine the best language to display based on availability.
 * Returns requested language if available, otherwise falls back to source.
 *
 * @param requested - Language requested by the guest
 * @param available - Languages that have translations available
 * @param source - Original/source language of the content
 * @returns Best language to display
 *
 * @example
 * getDisplayLanguage('fr', ['en', 'fr', 'de'], 'en') // 'fr' (requested is available)
 * getDisplayLanguage('es', ['en', 'fr', 'de'], 'en') // 'en' (fallback to source)
 * getDisplayLanguage('fr', [], 'en') // 'en' (no translations, use source)
 *
 * @example
 * // Edge case handling
 * getDisplayLanguage(null as any, ['en', 'fr'], 'en') // 'en' (invalid requested)
 * getDisplayLanguage('fr', null as any, 'en') // 'en' (invalid available)
 */
export function getDisplayLanguage(
  requested: SupportedLocale | string | null | undefined,
  available: SupportedLocale[] | null | undefined,
  source: SupportedLocale
): SupportedLocale {
  // Handle invalid inputs with sensible defaults
  if (!requested) {
    return source;
  }

  if (!available || !Array.isArray(available) || available.length === 0) {
    return source;
  }

  // Validate requested is a supported locale
  if (!isValidLocale(requested)) {
    return source;
  }

  // Check if requested language is available
  if (available.includes(requested as SupportedLocale)) {
    return requested as SupportedLocale;
  }

  // Fallback to source language
  return source;
}

// =============================================================================
// Language Display Functions
// =============================================================================

/**
 * Format a language code into a human-readable display name.
 * Supports both English and native language name formats.
 *
 * @param code - Language code to format (e.g., 'en', 'fr', 'de')
 * @param native - Whether to return native language name (default: false)
 * @returns Formatted language name, or the code itself if unrecognized
 *
 * @example
 * formatLanguageName('de') // 'German'
 * formatLanguageName('de', false) // 'German'
 * formatLanguageName('de', true) // 'Deutsch'
 * formatLanguageName('unknown') // 'unknown' (fallback)
 * formatLanguageName('EN') // 'English' (case handled via validation)
 */
export function formatLanguageName(
  code: string | null | undefined,
  native = false
): string {
  // Handle null/undefined
  if (!code) {
    return DEFAULT_LOCALE;
  }

  // Normalize to lowercase for lookup
  const normalizedCode = code.toLowerCase();

  // Validate and lookup locale metadata
  if (!isValidLocale(normalizedCode)) {
    // Return original code as fallback for unrecognized codes
    return code;
  }

  const metadata = localeMetadata[normalizedCode as SupportedLocale];
  if (!metadata) {
    return code;
  }

  return native ? metadata.nativeName : metadata.name;
}

/**
 * Get both English and native names for a language code.
 *
 * @param code - Language code to format
 * @returns Object with both name formats, or null if unrecognized
 *
 * @example
 * getLanguageNames('de')
 * // { english: 'German', native: 'Deutsch', flag: '...' }
 */
export function getLanguageNames(code: string): {
  english: string;
  native: string;
  flag?: string;
} | null {
  if (!isValidLocale(code)) {
    return null;
  }

  const metadata = localeMetadata[code as SupportedLocale];
  if (!metadata) {
    return null;
  }

  return {
    english: metadata.name,
    native: metadata.nativeName,
    flag: metadata.flag,
  };
}

// =============================================================================
// Metadata Creation Functions
// =============================================================================

/**
 * Create a standardized translation metadata object for API responses.
 *
 * @param requestedLanguage - Language requested by the guest
 * @param displayLanguage - Language actually being displayed
 * @param sourceLanguage - Original language of the content
 * @param availableTranslations - Languages with available translations
 * @param translationStatus - Optional status of translation completeness
 * @returns TranslationMeta object for API response
 *
 * @example
 * createTranslationMeta('fr', 'fr', 'en', ['en', 'fr', 'de'])
 * // Returns full metadata object for guest content response
 */
export function createTranslationMeta(
  requestedLanguage: SupportedLocale,
  displayLanguage: SupportedLocale,
  sourceLanguage: SupportedLocale,
  availableTranslations: SupportedLocale[],
  translationStatus?: TranslationStatus
): TranslationMeta {
  const isShowingTranslation =
    displayLanguage !== sourceLanguage && availableTranslations.includes(displayLanguage);

  return {
    requestedLanguage,
    displayLanguage,
    sourceLanguage,
    availableTranslations,
    isShowingTranslation,
    translationStatus,
  };
}

/**
 * Determine if content should be shown as translated based on languages.
 *
 * @param displayLanguage - Language being displayed
 * @param sourceLanguage - Original content language
 * @returns true if displaying a translation, false if showing original
 */
export function isShowingTranslation(
  displayLanguage: SupportedLocale,
  sourceLanguage: SupportedLocale
): boolean {
  return displayLanguage !== sourceLanguage;
}
```

### Task 2.4.2: Create Translations Module Barrel Export

**File:** `/src/lib/translations/index.ts`

```typescript
/**
 * Translations Module Exports
 *
 * Centralized exports for translation utilities.
 *
 * @module lib/translations
 * @created 2026-01-19
 * @lastModified 2026-01-19
 */

// Translation utility functions
export {
  // Content merging
  mergeTranslation,
  hasTranslationContent,
  isTranslationComplete,
  getTranslationStatus,
  // Language selection
  getDisplayLanguage,
  // Language display
  formatLanguageName,
  getLanguageNames,
  // Metadata creation
  createTranslationMeta,
  isShowingTranslation,
  // Constants
  TRANSLATION_FIELDS_ITEM,
  TRANSLATION_FIELDS_ARTICLE,
  TRANSLATION_FIELDS_LINK,
  TRANSLATION_FIELDS_TAG,
} from './translation-utils';

// Types
export type {
  TranslationMeta,
  TranslationStatus,
  MergeableContent,
} from './translation-utils';
```

### Task 2.4.3: Create Unit Tests

**File:** `/src/lib/translations/__tests__/translation-utils.test.ts`

**Test Cases to Implement:**

```typescript
/**
 * Unit tests for translation-utils
 *
 * @module lib/translations/__tests__/translation-utils.test
 */

import { describe, it, expect } from 'vitest';
import {
  mergeTranslation,
  hasTranslationContent,
  isTranslationComplete,
  getTranslationStatus,
  getDisplayLanguage,
  formatLanguageName,
  getLanguageNames,
  createTranslationMeta,
  isShowingTranslation,
  TRANSLATION_FIELDS_ITEM,
} from '../translation-utils';

describe('translation-utils', () => {
  // ==========================================================================
  // mergeTranslation tests
  // ==========================================================================
  describe('mergeTranslation', () => {
    it('should return original unchanged when translation is null', () => {
      const original = { name: 'Coffee Machine', description: 'Makes coffee' };
      const result = mergeTranslation(original, null);
      expect(result).toEqual(original);
      expect(result).not.toBe(original); // Should not be same reference
    });

    it('should return original unchanged when translation is undefined', () => {
      const original = { name: 'Coffee Machine', description: 'Makes coffee' };
      const result = mergeTranslation(original, undefined);
      expect(result).toEqual(original);
    });

    it('should override fields with non-null translation values', () => {
      const original = { name: 'Coffee Machine', description: 'Makes coffee' };
      const translation = { name: 'Kaffeemaschine' };
      const result = mergeTranslation(original, translation);
      expect(result).toEqual({ name: 'Kaffeemaschine', description: 'Makes coffee' });
    });

    it('should preserve original fields when translation values are null', () => {
      const original = { name: 'Coffee Machine', description: 'Makes coffee' };
      const translation = { name: 'Kaffeemaschine', description: null };
      const result = mergeTranslation(original, translation);
      expect(result.description).toBe('Makes coffee');
    });

    it('should preserve original fields when translation values are empty string', () => {
      const original = { name: 'Coffee Machine', description: 'Makes coffee' };
      const translation = { name: 'Kaffeemaschine', description: '' };
      const result = mergeTranslation(original, translation);
      expect(result.description).toBe('Makes coffee');
    });

    it('should not mutate the original object', () => {
      const original = { name: 'Coffee Machine', description: 'Makes coffee' };
      const translation = { name: 'Kaffeemaschine' };
      const result = mergeTranslation(original, translation);
      expect(original.name).toBe('Coffee Machine');
      expect(result.name).toBe('Kaffeemaschine');
    });

    it('should handle objects with nested properties (shallow merge)', () => {
      const original = { name: 'Test', meta: { id: 1 } };
      const translation = { name: 'Translated' };
      const result = mergeTranslation(original, translation);
      expect(result.meta).toBe(original.meta); // Same reference (shallow)
    });
  });

  // ==========================================================================
  // hasTranslationContent tests
  // ==========================================================================
  describe('hasTranslationContent', () => {
    it('should return false for null translation', () => {
      expect(hasTranslationContent(null)).toBe(false);
    });

    it('should return false for undefined translation', () => {
      expect(hasTranslationContent(undefined)).toBe(false);
    });

    it('should return false when all fields are null', () => {
      expect(hasTranslationContent({ name: null, description: null })).toBe(false);
    });

    it('should return false when all fields are empty strings', () => {
      expect(hasTranslationContent({ name: '', description: '' })).toBe(false);
    });

    it('should return true when at least one field has content', () => {
      expect(hasTranslationContent({ name: 'Test', description: null })).toBe(true);
    });

    it('should return true when all fields have content', () => {
      expect(hasTranslationContent({ name: 'Test', description: 'Desc' })).toBe(true);
    });
  });

  // ==========================================================================
  // isTranslationComplete tests
  // ==========================================================================
  describe('isTranslationComplete', () => {
    it('should return false for null translation', () => {
      expect(isTranslationComplete(null, ['name', 'description'])).toBe(false);
    });

    it('should return true when all required fields are populated', () => {
      const translation = { name: 'Test', description: 'Desc' };
      expect(isTranslationComplete(translation, ['name', 'description'])).toBe(true);
    });

    it('should return false when any required field is null', () => {
      const translation = { name: 'Test', description: null };
      expect(isTranslationComplete(translation, ['name', 'description'])).toBe(false);
    });

    it('should return false when any required field is empty string', () => {
      const translation = { name: 'Test', description: '' };
      expect(isTranslationComplete(translation, ['name', 'description'])).toBe(false);
    });

    it('should return true with empty required fields array', () => {
      expect(isTranslationComplete({ name: 'Test' }, [])).toBe(true);
    });
  });

  // ==========================================================================
  // getTranslationStatus tests
  // ==========================================================================
  describe('getTranslationStatus', () => {
    it('should return "missing" for null translation', () => {
      expect(getTranslationStatus(null, ['name', 'description'])).toBe('missing');
    });

    it('should return "missing" when no fields have content', () => {
      expect(getTranslationStatus({ name: null, description: '' }, ['name', 'description'])).toBe('missing');
    });

    it('should return "complete" when all fields have content', () => {
      expect(getTranslationStatus({ name: 'Test', description: 'Desc' }, ['name', 'description'])).toBe('complete');
    });

    it('should return "partial" when some but not all fields have content', () => {
      expect(getTranslationStatus({ name: 'Test', description: null }, ['name', 'description'])).toBe('partial');
    });
  });

  // ==========================================================================
  // getDisplayLanguage tests
  // ==========================================================================
  describe('getDisplayLanguage', () => {
    it('should return requested language when available', () => {
      expect(getDisplayLanguage('fr', ['en', 'fr', 'de'], 'en')).toBe('fr');
    });

    it('should return source language when requested is not available', () => {
      expect(getDisplayLanguage('es', ['en', 'fr', 'de'], 'en')).toBe('en');
    });

    it('should return source language when available array is empty', () => {
      expect(getDisplayLanguage('fr', [], 'en')).toBe('en');
    });

    it('should return source language when requested is null', () => {
      expect(getDisplayLanguage(null as any, ['en', 'fr'], 'en')).toBe('en');
    });

    it('should return source language when available is null', () => {
      expect(getDisplayLanguage('fr', null as any, 'en')).toBe('en');
    });

    it('should return source language when requested is not a valid locale', () => {
      expect(getDisplayLanguage('xyz', ['en', 'fr'], 'en')).toBe('en');
    });

    it('should handle case where requested equals source and is available', () => {
      expect(getDisplayLanguage('en', ['en', 'fr'], 'en')).toBe('en');
    });
  });

  // ==========================================================================
  // formatLanguageName tests
  // ==========================================================================
  describe('formatLanguageName', () => {
    it('should return English name by default', () => {
      expect(formatLanguageName('de')).toBe('German');
    });

    it('should return English name when native is false', () => {
      expect(formatLanguageName('de', false)).toBe('German');
    });

    it('should return native name when native is true', () => {
      expect(formatLanguageName('de', true)).toBe('Deutsch');
    });

    it('should return the code itself for unrecognized codes', () => {
      expect(formatLanguageName('unknown')).toBe('unknown');
    });

    it('should handle null input', () => {
      expect(formatLanguageName(null)).toBe('en'); // DEFAULT_LOCALE
    });

    it('should handle undefined input', () => {
      expect(formatLanguageName(undefined)).toBe('en'); // DEFAULT_LOCALE
    });

    it('should handle all supported languages', () => {
      expect(formatLanguageName('en')).toBe('English');
      expect(formatLanguageName('fr')).toBe('French');
      expect(formatLanguageName('es')).toBe('Spanish');
      expect(formatLanguageName('de')).toBe('German');
      expect(formatLanguageName('nl')).toBe('Dutch');
      expect(formatLanguageName('it')).toBe('Italian');
    });

    it('should handle all supported languages with native flag', () => {
      expect(formatLanguageName('en', true)).toBe('English');
      expect(formatLanguageName('fr', true)).toBe('Français');
      expect(formatLanguageName('es', true)).toBe('Español');
      expect(formatLanguageName('de', true)).toBe('Deutsch');
      expect(formatLanguageName('nl', true)).toBe('Nederlands');
      expect(formatLanguageName('it', true)).toBe('Italiano');
    });
  });

  // ==========================================================================
  // getLanguageNames tests
  // ==========================================================================
  describe('getLanguageNames', () => {
    it('should return both English and native names for valid code', () => {
      const result = getLanguageNames('de');
      expect(result).toEqual({
        english: 'German',
        native: 'Deutsch',
        flag: expect.any(String),
      });
    });

    it('should return null for invalid code', () => {
      expect(getLanguageNames('invalid')).toBeNull();
    });
  });

  // ==========================================================================
  // createTranslationMeta tests
  // ==========================================================================
  describe('createTranslationMeta', () => {
    it('should create metadata with isShowingTranslation true when displaying translation', () => {
      const meta = createTranslationMeta('fr', 'fr', 'en', ['en', 'fr', 'de']);
      expect(meta.isShowingTranslation).toBe(true);
      expect(meta.requestedLanguage).toBe('fr');
      expect(meta.displayLanguage).toBe('fr');
      expect(meta.sourceLanguage).toBe('en');
    });

    it('should create metadata with isShowingTranslation false when displaying source', () => {
      const meta = createTranslationMeta('es', 'en', 'en', ['en', 'fr', 'de']);
      expect(meta.isShowingTranslation).toBe(false);
    });

    it('should include translation status when provided', () => {
      const meta = createTranslationMeta('fr', 'fr', 'en', ['en', 'fr'], 'complete');
      expect(meta.translationStatus).toBe('complete');
    });
  });

  // ==========================================================================
  // isShowingTranslation tests
  // ==========================================================================
  describe('isShowingTranslation', () => {
    it('should return true when display differs from source', () => {
      expect(isShowingTranslation('fr', 'en')).toBe(true);
    });

    it('should return false when display equals source', () => {
      expect(isShowingTranslation('en', 'en')).toBe(false);
    });
  });
});
```

---

## 6. Testing Requirements

### 6.1 Unit Test Coverage Requirements

| Function | Minimum Coverage |
|----------|------------------|
| `mergeTranslation` | 100% branch coverage |
| `hasTranslationContent` | 100% branch coverage |
| `isTranslationComplete` | 100% branch coverage |
| `getTranslationStatus` | 100% branch coverage |
| `getDisplayLanguage` | 100% branch coverage |
| `formatLanguageName` | 100% branch coverage |
| `createTranslationMeta` | 90% line coverage |

### 6.2 Edge Cases to Test

1. **Null/undefined handling:**
   - Null translation objects
   - Undefined translation objects
   - Empty objects `{}`
   - Mixed null/valid values

2. **String edge cases:**
   - Empty strings `''`
   - Whitespace-only strings
   - Very long strings

3. **Language code validation:**
   - Invalid language codes
   - Case variations (uppercase, mixed case)
   - Empty/null language codes

4. **Array edge cases:**
   - Empty available languages array
   - Duplicate entries in arrays
   - Null array inputs

---

## 7. Acceptance Criteria

From REQ-344 and implementation plan:

- [ ] `mergeTranslation` function accepts original and translation objects as parameters
- [ ] `mergeTranslation` creates a new merged object without mutating inputs
- [ ] `mergeTranslation` preserves original fields when translation fields are null/undefined/empty
- [ ] `mergeTranslation` overrides original fields with translation values when present
- [ ] `mergeTranslation` handles nested objects with shallow merge correctly
- [ ] `mergeTranslation` handles edge cases (empty objects, null inputs) gracefully
- [ ] `getDisplayLanguage` returns requested language when available in array
- [ ] `getDisplayLanguage` returns source language when requested is unavailable
- [ ] `getDisplayLanguage` handles edge cases (empty arrays, null values, undefined)
- [ ] `getDisplayLanguage` returns predictable default for invalid inputs
- [ ] `formatLanguageName` returns English display name by default
- [ ] `formatLanguageName` returns native language name when native flag is true
- [ ] `formatLanguageName` handles all six supported language codes correctly
- [ ] `formatLanguageName` returns the code itself for unrecognized codes
- [ ] All functions include proper TypeScript type definitions
- [ ] All functions include comprehensive JSDoc comments with examples
- [ ] Functions are exported as named exports from barrel file
- [ ] Module follows project's established coding conventions

### Technical Acceptance Criteria:

- [ ] All functions are pure (no side effects)
- [ ] TypeScript strict mode passes without errors
- [ ] Unit tests achieve 95%+ coverage
- [ ] Functions handle null/undefined gracefully
- [ ] Code follows established patterns from `/src/lib/i18n/config.ts`

---

## 8. Integration Notes

### 8.1 Usage by API Endpoints

The utilities will be consumed by the public item API (Task 2.2) and language availability API (Task 2.3):

```typescript
// In /src/app/api/public/items/[publicId]/route.ts
import {
  mergeTranslation,
  getDisplayLanguage,
  createTranslationMeta,
  getTranslationStatus,
  TRANSLATION_FIELDS_ITEM,
} from '@/lib/translations';

// Merge item with translation
const mergedItem = mergeTranslation(item, translation);

// Determine display language
const displayLang = getDisplayLanguage(requestedLang, availableLangs, item.sourceLanguage);

// Create response metadata
const meta = createTranslationMeta(
  requestedLang,
  displayLang,
  item.sourceLanguage,
  availableLangs,
  getTranslationStatus(translation, TRANSLATION_FIELDS_ITEM)
);
```

### 8.2 Usage by Components

The utilities will be consumed by guest UI components (Phase 3):

```typescript
// In ItemDisplay.tsx component
import { formatLanguageName, isShowingTranslation } from '@/lib/translations';

// Format language for banner display
const sourceName = formatLanguageName(sourceLanguage, false);
const nativeName = formatLanguageName(currentLanguage, true);

// Determine if showing translation
const showBanner = isShowingTranslation(displayLanguage, sourceLanguage);
```

### 8.3 Relationship to Other Phase 2 Tasks

| Task | Relationship |
|------|--------------|
| 2.1 (fetch-translations.ts) | Uses these utilities for merging fetched translations with original content |
| 2.2 (Public Item API) | Uses `mergeTranslation`, `getDisplayLanguage`, `createTranslationMeta` |
| 2.3 (Language Availability API) | Uses `formatLanguageName` for response formatting |

### 8.4 Relationship to Phase 3 Components

| Component | Usage |
|-----------|-------|
| TranslationBanner | Uses `formatLanguageName` for source language display |
| MissingTranslationBanner | Uses `formatLanguageName` for requested/display language names |
| GuestLanguageSwitcher | Uses `formatLanguageName` with native flag for dropdown |
| ItemDisplay | Uses `isShowingTranslation` for banner visibility logic |

---

## 9. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Type mismatches with translation table data | Low | Medium | Use generic type constraint; verify with actual database types |
| Performance with large content objects | Low | Low | Shallow merge is O(n) for key count, acceptable for typical objects |
| Locale metadata changes in i18n config | Low | Medium | Import from config; changes automatically propagate |
| Edge case in merge logic missing | Medium | Low | Comprehensive unit tests covering all edge cases |

---

## 10. File Structure After Implementation

```
src/lib/
├── i18n/
│   ├── index.ts                    # Existing i18n exports
│   ├── config.ts                   # Locale configuration (reference)
│   ├── language-detection.ts       # Language detection utilities (reference)
│   └── guest-language.ts           # Guest-specific utilities (from Task 1.2)
└── translations/
    ├── index.ts                    # NEW: Barrel exports for translations
    ├── translation-utils.ts        # NEW: Translation utility helpers
    ├── fetch-translations.ts       # From Task 2.1
    └── __tests__/
        └── translation-utils.test.ts  # NEW: Unit tests
```

---

## 11. References

- [Implementation Plan](/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md) - Phase 2, Task 2.4
- [Epic 4 Requests](/docs/gen_requests_epic4.md) - REQ-344 specification
- [i18n Configuration](/src/lib/i18n/config.ts) - Locale metadata and type definitions
- [LocaleContext](/src/contexts/LocaleContext.tsx) - Client-side locale management patterns
- [Language Detection](/src/lib/i18n/language-detection.ts) - Server-side language utilities

---

**Document Version:** 1.0
**Status:** Ready for Implementation
