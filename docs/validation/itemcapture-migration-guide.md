# ItemCapture Validation Migration Guide

**REQ-E02-036: Update Zod Schemas to Use Translated Messages**

Last Modified: 2026-01-22

This document outlines the migration path for integrating the ItemCapture validation utilities with the new Zod-based i18n validation system.

## Current Implementation Overview

The ItemCapture component has a well-structured validation system in `/src/components/ItemCapture/utils/validation.ts` with:

1. **Typed validation results** - `ValidationResult`, `FileSizeValidationResult`, etc.
2. **Individual validators** - `validateTitle`, `validateFileSize`, `validateUrl`, etc.
3. **Aggregated validation** - `validateItemCapture()` combines all validators
4. **Helper utilities** - `formatFileSize`, `calculateRemainingSize`, etc.

### Current Error Messages (Hardcoded English)

```typescript
// Current: Hardcoded strings in validation.ts
validateTitle(title) // "Title is required"
validateFileSize(file, type) // "File exceeds 20 MB limit (current: 25 MB)"
validateContentRequirement(...) // "At least one media item, link, or text instructions must be provided"
validateUrl(url) // "URL is required", "Invalid URL format"
```

## Migration Strategy

### Option A: Full Zod Migration (Recommended for consistency)

Replace individual validators with Zod schema factories and integrate with the existing `createItemMetadataSchema` and `createUrlSchema`.

### Option B: Wrapper Approach (Lower risk)

Keep existing validation logic but wrap error messages with translation calls.

## Option A: Full Zod Migration

### Step 1: Create ItemCapture-Specific Schema Factories

Add to `/src/lib/validation/schema-factories.ts`:

```typescript
// =============================================================================
// ItemCapture Validation Schemas (REQ-E02-036 Migration)
// =============================================================================

import { CAPTURE_CONSTRAINTS, URL_CONSTRAINTS } from '@/components/ItemCapture/utils/constants';

/**
 * Creates a schema for validating item capture metadata.
 * Extended version with full ItemCapture constraints.
 */
export function createItemCaptureMetadataSchema(t: TranslationFunction) {
  return z.object({
    title: z
      .string({ error: t('form.required') })
      .min(1, { error: t('form.required') })
      .max(CAPTURE_CONSTRAINTS.title.maxLength, {
        error: t('form.maxLength', { max: CAPTURE_CONSTRAINTS.title.maxLength })
      }),
    description: z
      .string()
      .max(CAPTURE_CONSTRAINTS.description?.maxLength || 5000, {
        error: t('form.maxLength', { max: 5000 })
      })
      .optional(),
    location: z.string().optional(),
    applianceType: z.string().optional(),
  });
}

/**
 * Creates a schema for validating individual URLs in ItemCapture.
 */
export function createItemCaptureUrlSchema(t: TranslationFunction) {
  return z.object({
    url: z
      .string({ error: t('form.required') })
      .min(1, { error: t('form.required') })
      .url({ error: t('form.invalidUrl') })
      .max(URL_CONSTRAINTS.maxUrlLength, {
        error: t('form.maxLength', { max: URL_CONSTRAINTS.maxUrlLength })
      })
      .refine(
        (url) => {
          try {
            const parsed = new URL(url);
            return ['http:', 'https:'].includes(parsed.protocol);
          } catch {
            return false;
          }
        },
        { message: t('itemCapture.urlProtocolRequired') }
      ),
    title: z
      .string()
      .max(200, { error: t('form.maxLength', { max: 200 }) })
      .optional(),
  });
}

/**
 * Creates a schema for validating text instructions length.
 */
export function createInstructionsSchema(t: TranslationFunction) {
  return z
    .string()
    .max(CAPTURE_CONSTRAINTS.text.maxLength, {
      error: t('form.maxLength', { max: CAPTURE_CONSTRAINTS.text.maxLength })
    })
    .optional();
}
```

### Step 2: Add New Translation Keys

Add to `/messages/en.json` under the `errors` namespace:

```json
{
  "errors": {
    "itemCapture": {
      "contentRequired": "At least one media item, link, or text instructions must be provided",
      "contentRequiredNoUrls": "At least one media item or text instructions must be provided",
      "fileSizeExceeded": "File exceeds {maxSize} limit (current: {currentSize})",
      "totalSizeExceeded": "Total upload size ({currentSize}) exceeds {maxSize} limit",
      "maxPhotosExceeded": "Maximum {max} photos allowed (current: {current})",
      "maxLinksExceeded": "Maximum {max} links allowed (current: {current})",
      "urlProtocolRequired": "Only http and https URLs are allowed",
      "unsupportedFileType": "File type '{type}' is not supported for {mediaType}"
    }
  }
}
```

### Step 3: Create ItemCapture Validation Hook

Create `/src/components/ItemCapture/hooks/useItemCaptureValidation.ts`:

```typescript
'use client';

/**
 * ItemCapture Validation Hook with i18n Support
 * REQ-E02-036: Integration with Zod-based translated validation
 */

import { useTranslations } from 'next-intl';
import { useMemo, useCallback } from 'react';
import type { TranslationFunction } from '@/lib/validation/zod-i18n';
import {
  createItemCaptureMetadataSchema,
  createItemCaptureUrlSchema,
  createInstructionsSchema,
} from '@/lib/validation';
import { CAPTURE_CONSTRAINTS, URL_CONSTRAINTS } from '../utils/constants';
import { formatFileSize } from '../utils/validation';
import type { ItemMetadata, MediaItem, UrlItem } from '../ItemCapture.types';

export interface ItemCaptureValidation {
  isValid: boolean;
  errors: Record<string, string>;
  warnings: Record<string, string>;
}

export function useItemCaptureValidation() {
  const t = useTranslations('errors') as TranslationFunction;

  // Create schemas with translations
  const metadataSchema = useMemo(
    () => createItemCaptureMetadataSchema(t),
    [t]
  );

  const urlSchema = useMemo(
    () => createItemCaptureUrlSchema(t),
    [t]
  );

  const instructionsSchema = useMemo(
    () => createInstructionsSchema(t),
    [t]
  );

  /**
   * Validate title using Zod schema
   */
  const validateTitle = useCallback(
    (title: string) => {
      const result = metadataSchema.shape.title.safeParse(title);
      if (!result.success) {
        return result.error.issues[0]?.message;
      }
      return undefined;
    },
    [metadataSchema]
  );

  /**
   * Validate URL using Zod schema
   */
  const validateUrl = useCallback(
    (url: string) => {
      const result = urlSchema.shape.url.safeParse(url);
      if (!result.success) {
        return result.error.issues[0]?.message;
      }
      return undefined;
    },
    [urlSchema]
  );

  /**
   * Validate file size with translated messages
   */
  const validateFileSize = useCallback(
    (file: File | Blob, mediaType: 'video' | 'image' | 'pdf') => {
      const maxAllowed = CAPTURE_CONSTRAINTS[mediaType].maxFileSize;
      if (file.size > maxAllowed) {
        return t('itemCapture.fileSizeExceeded', {
          maxSize: formatFileSize(maxAllowed),
          currentSize: formatFileSize(file.size),
        });
      }
      return undefined;
    },
    [t]
  );

  /**
   * Validate total size with translated messages
   */
  const validateTotalSize = useCallback(
    (mediaItems: MediaItem[]) => {
      const currentSize = mediaItems.reduce((sum, item) => sum + (item.file?.size || 0), 0);
      const maxAllowed = CAPTURE_CONSTRAINTS.total.maxSize;
      if (currentSize > maxAllowed) {
        return t('itemCapture.totalSizeExceeded', {
          currentSize: formatFileSize(currentSize),
          maxSize: formatFileSize(maxAllowed),
        });
      }
      return undefined;
    },
    [t]
  );

  /**
   * Validate content requirement with translated messages
   */
  const validateContentRequirement = useCallback(
    (mediaItems: MediaItem[], urlItems: UrlItem[], instructions: string) => {
      const hasMedia = mediaItems.length > 0;
      const hasUrls = urlItems.length > 0;
      const hasText = instructions?.trim().length > 0;

      if (!hasMedia && !hasUrls && !hasText) {
        return hasUrls !== undefined
          ? t('itemCapture.contentRequired')
          : t('itemCapture.contentRequiredNoUrls');
      }
      return undefined;
    },
    [t]
  );

  /**
   * Validate image count with translated messages
   */
  const validateImageCount = useCallback(
    (mediaItems: MediaItem[]) => {
      const imageCount = mediaItems.filter(item => item.type === 'image').length;
      const maxCount = CAPTURE_CONSTRAINTS.image.maxCount;
      if (imageCount > maxCount) {
        return t('itemCapture.maxPhotosExceeded', {
          max: maxCount,
          current: imageCount,
        });
      }
      return undefined;
    },
    [t]
  );

  /**
   * Validate URL count with translated messages
   */
  const validateUrlCount = useCallback(
    (urlItems: UrlItem[]) => {
      if (urlItems.length > URL_CONSTRAINTS.maxUrls) {
        return t('itemCapture.maxLinksExceeded', {
          max: URL_CONSTRAINTS.maxUrls,
          current: urlItems.length,
        });
      }
      return undefined;
    },
    [t]
  );

  /**
   * Run all validations and return aggregated result
   */
  const validateAll = useCallback(
    (
      metadata: ItemMetadata,
      mediaItems: MediaItem[],
      urlItems: UrlItem[],
      instructions: string
    ): ItemCaptureValidation => {
      const errors: Record<string, string> = {};
      const warnings: Record<string, string> = {};

      // Title validation
      const titleError = validateTitle(metadata.title);
      if (titleError) errors.title = titleError;

      // Content requirement
      const contentError = validateContentRequirement(mediaItems, urlItems, instructions);
      if (contentError) errors.content = contentError;

      // Image count
      const imageCountError = validateImageCount(mediaItems);
      if (imageCountError) errors.imageCount = imageCountError;

      // URL count
      const urlCountError = validateUrlCount(urlItems);
      if (urlCountError) errors.urlCount = urlCountError;

      // Total size
      const totalSizeError = validateTotalSize(mediaItems);
      if (totalSizeError) errors.totalSize = totalSizeError;

      // Individual file sizes
      for (const item of mediaItems) {
        if (item.type !== 'url' && item.file) {
          const fileSizeError = validateFileSize(item.file, item.type);
          if (fileSizeError) errors[`fileSize_${item.id}`] = fileSizeError;
        }
      }

      // Instructions length (warning only)
      const instructionsResult = instructionsSchema.safeParse(instructions);
      if (!instructionsResult.success) {
        warnings.textLength = instructionsResult.error.issues[0]?.message || '';
      }

      return {
        isValid: Object.keys(errors).length === 0,
        errors,
        warnings,
      };
    },
    [
      validateTitle,
      validateContentRequirement,
      validateImageCount,
      validateUrlCount,
      validateTotalSize,
      validateFileSize,
      instructionsSchema,
    ]
  );

  return {
    validateTitle,
    validateUrl,
    validateFileSize,
    validateTotalSize,
    validateContentRequirement,
    validateImageCount,
    validateUrlCount,
    validateAll,
  };
}
```

### Step 4: Update ItemCapture Component

```diff
// src/components/ItemCapture/ItemCapture.tsx

- import { validateItemCapture } from './utils/validation';
+ import { useItemCaptureValidation } from './hooks/useItemCaptureValidation';

export function ItemCapture({ ... }: ItemCaptureProps) {
+ const { validateAll } = useItemCaptureValidation();

  const handleSubmit = useCallback(() => {
    // Run validation
-   const validation = validateItemCapture(
-     state.metadata,
-     state.mediaItems,
-     state.urlItems,
-     state.instructions
-   );
+   const validation = validateAll(
+     state.metadata,
+     state.mediaItems,
+     state.urlItems,
+     state.instructions
+   );

    if (!validation.isValid) {
      // ... rest unchanged
    }
  }, [...]);
}
```

## Option B: Wrapper Approach

If a full migration is too risky, wrap existing validators with translation calls:

### Create Translation Wrapper

```typescript
// src/components/ItemCapture/utils/validation-i18n.ts

import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import * as validation from './validation';
import type { TranslationFunction } from '@/lib/validation/zod-i18n';

/**
 * Creates translated versions of validation functions.
 * Wraps existing validation logic with i18n messages.
 */
export function useTranslatedValidation() {
  const t = useTranslations('errors') as TranslationFunction;

  return useMemo(() => ({
    validateTitle: (title: string) => {
      const result = validation.validateTitle(title);
      if (!result.isValid) {
        // Map hardcoded messages to translation keys
        if (result.error === 'Title is required') {
          return { ...result, error: t('form.required') };
        }
        if (result.error?.includes('characters or less')) {
          return { ...result, error: t('form.maxLength', { max: 200 }) };
        }
      }
      return result;
    },

    validateUrl: (url: string) => {
      const result = validation.validateUrl(url);
      if (!result.isValid) {
        if (result.error === 'URL is required') {
          return { ...result, error: t('form.required') };
        }
        if (result.error === 'Invalid URL format') {
          return { ...result, error: t('form.invalidUrl') };
        }
        if (result.error?.includes('Only http and https')) {
          return { ...result, error: t('itemCapture.urlProtocolRequired') };
        }
      }
      return result;
    },

    // ... wrap other validators similarly
  }), [t]);
}
```

## Migration Checklist

- [ ] Add new translation keys to all language files
- [ ] Create ItemCapture-specific schema factories (Option A)
- [ ] Create `useItemCaptureValidation` hook
- [ ] Update ItemCapture component to use new hook
- [ ] Update step components (MetadataStep, UrlInputStep, etc.)
- [ ] Update tests to mock translations
- [ ] Verify all error messages display correctly in all locales
- [ ] Remove or deprecate old validation utilities

## Testing the Migration

```typescript
// src/components/ItemCapture/hooks/__tests__/useItemCaptureValidation.test.ts

import { vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useItemCaptureValidation } from '../useItemCaptureValidation';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, params?: Record<string, string | number>) => {
    if (params) {
      let result = key;
      for (const [k, v] of Object.entries(params)) {
        result += `{${k}:${v}}`;
      }
      return `[${result}]`;
    }
    return `[${key}]`;
  },
}));

describe('useItemCaptureValidation', () => {
  it('returns translated error for empty title', () => {
    const { result } = renderHook(() => useItemCaptureValidation());

    const error = result.current.validateTitle('');
    expect(error).toBe('[form.required]');
  });

  it('validates all fields and aggregates errors', () => {
    const { result } = renderHook(() => useItemCaptureValidation());

    const validation = result.current.validateAll(
      { title: '' },
      [],
      [],
      ''
    );

    expect(validation.isValid).toBe(false);
    expect(validation.errors.title).toBe('[form.required]');
    expect(validation.errors.content).toContain('[itemCapture.');
  });
});
```

## Rollback Plan

If issues arise:

1. Revert to importing `validateItemCapture` from `./utils/validation`
2. Remove the `useItemCaptureValidation` hook import
3. Old hardcoded English messages will still work

The original validation utilities in `utils/validation.ts` can remain as a fallback.
