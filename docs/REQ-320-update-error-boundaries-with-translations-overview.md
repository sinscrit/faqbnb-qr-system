# REQ-320: Update Error Boundaries with Translations

**Implementation Overview Document**

**Last Modified:** 2026-01-18
**Request Reference:** docs/gen_requests_epic2.md - REQ-320
**Implementation Plan Reference:** docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md
**Sub-Epic:** 2J - Error Messages & Validation
**Task ID:** 2J.6
**Type:** ENHANCEMENT
**Size:** M (Medium)

---

## 1. Executive Summary

This task updates all error boundary components to display error messages, fallback UI text, and recovery actions in the user's preferred language by integrating with the translation system. Error boundaries are React components that catch JavaScript errors anywhere in their child component tree and display a fallback UI.

**Key Observations from Codebase Analysis:**

| Component | Location | Current State |
|-----------|----------|---------------|
| App Error Boundary | `/src/app/error.tsx` | Hardcoded English strings, uses Sentry |
| Global Error Boundary | `/src/app/global-error.tsx` | Hardcoded English strings, inline styles (no Tailwind), uses Sentry |
| Item Not Found Page | `/src/app/item/[publicId]/not-found.tsx` | Hardcoded English strings |
| Inline Error Handling | `/src/components/ItemDisplay.tsx` | Hardcoded "Item Not Found" and reaction error messages |

**Implementation Strategy:** Update each error boundary to use `useTranslations` hook (client-side) to retrieve error messages from the `errors` namespace. Special handling is required for the global error boundary which cannot use React context due to rendering outside the normal component tree.

---

## 2. Current State Analysis

### 2.1 App Error Boundary (`/src/app/error.tsx`)

The primary error boundary for page-level errors:

```typescript
// Current implementation - hardcoded strings
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-5">
      <div className="bg-white p-10 rounded-xl shadow-lg text-center max-w-lg">
        <h2 className="text-red-500 mb-4 text-2xl font-semibold">
          Something went wrong!                  <!-- Hardcoded -->
        </h2>
        <p className="text-gray-600 mb-6 leading-relaxed">
          We apologize for the inconvenience. Our team has been notified of this error.  <!-- Hardcoded -->
        </p>
        {error.digest && (
          <p className="text-xs text-gray-400 mb-4 font-mono">
            Error ID: {error.digest}            <!-- Hardcoded -->
          </p>
        )}
        <button onClick={() => reset()} className="...">
          Try again                              <!-- Hardcoded -->
        </button>
      </div>
    </div>
  );
}
```

**Strings to Extract:**
- `"Something went wrong!"` - Title
- `"We apologize for the inconvenience. Our team has been notified of this error."` - Description
- `"Error ID: {digest}"` - Error reference with interpolation
- `"Try again"` - Recovery button label

### 2.2 Global Error Boundary (`/src/app/global-error.tsx`)

Catches errors in the root layout itself. Uses inline styles instead of Tailwind because CSS may not be loaded when this renders:

```typescript
// Current implementation - hardcoded strings, inline styles
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div style={{...}}>
          <div style={{...}}>
            <h1 style={{color: '#dc3545', marginBottom: '16px', fontSize: '24px'}}>
              Something went wrong!              <!-- Hardcoded -->
            </h1>
            <p style={{...}}>
              We apologize for the inconvenience. Our team has been notified of this error.  <!-- Hardcoded -->
            </p>
            {error.digest && (
              <p style={{...}}>
                Error ID: {error.digest}         <!-- Hardcoded -->
              </p>
            )}
            <button onClick={() => reset()} style={{...}}>
              Try again                          <!-- Hardcoded -->
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
```

**Special Consideration:** This component renders outside the normal React tree and may not have access to translation providers. Requires special handling (see Section 3.3).

### 2.3 Item Not Found Page (`/src/app/item/[publicId]/not-found.tsx`)

Displays when a QR code item doesn't exist:

```typescript
// Current implementation - hardcoded strings
export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Item Not Found                         <!-- Hardcoded -->
        </h1>
        <p className="text-gray-600 mb-8 leading-relaxed">
          The item you're looking for doesn't exist or may have been removed.
          Please check the QR code and try again.  <!-- Hardcoded -->
        </p>
        <button className="..." disabled>
          Go Back (Demo Mode)                    <!-- Hardcoded -->
        </button>
        <Link href="/" className="...">
          Return Home                            <!-- Hardcoded -->
        </Link>
        <p className="text-sm text-gray-500">
          If you believe this is an error, please contact support.  <!-- Hardcoded -->
        </p>
      </div>
    </div>
  );
}
```

**Strings to Extract:**
- `"Item Not Found"` - Title
- `"The item you're looking for doesn't exist or may have been removed. Please check the QR code and try again."` - Description
- `"Go Back (Demo Mode)"` - Disabled button label
- `"Return Home"` - Navigation link label
- `"If you believe this is an error, please contact support."` - Help text

### 2.4 Inline Error UI in ItemDisplay (`/src/components/ItemDisplay.tsx`)

Contains inline error display for missing items and reaction errors:

```typescript
// Lines 83-91: Item not found fallback
if (!item) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Item Not Found</h1>  <!-- Hardcoded -->
        <p className="text-gray-600">The requested item could not be found.</p>    <!-- Hardcoded -->
      </div>
    </div>
  );
}

// Lines 66-81: Reaction error handling
const handleReactionChange = (newCounts: ReactionCounts) => {
  try {
    setReactionCounts(newCounts);
    setReactionError(null);
  } catch (error) {
    setReactionError('Failed to update reaction counts');  <!-- Hardcoded -->
  }
};

const handleReactionError = (error: Error) => {
  setReactionError('Reaction system temporarily unavailable');  <!-- Hardcoded -->
};

// Lines 156-165: Reaction error display
{reactionError && (
  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
    <p className="text-sm text-red-600">{reactionError}</p>
    <button onClick={() => setReactionError(null)} className="...">
      Dismiss                                    <!-- Hardcoded -->
    </button>
  </div>
)}
```

---

## 3. Technical Approach

### 3.1 Translation Integration Pattern for Error Boundaries

Since error boundaries are client components (`"use client"`), they can use the `useTranslations` hook:

```typescript
// Updated pattern for src/app/error.tsx
"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { useTranslations } from 'next-intl';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('errors.boundary');

  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-5">
      <div className="bg-white p-10 rounded-xl shadow-lg text-center max-w-lg">
        <h2 className="text-red-500 mb-4 text-2xl font-semibold">
          {t('title')}
        </h2>
        <p className="text-gray-600 mb-6 leading-relaxed">
          {t('description')}
        </p>
        {error.digest && (
          <p className="text-xs text-gray-400 mb-4 font-mono">
            {t('errorId', { digest: error.digest })}
          </p>
        )}
        <button onClick={() => reset()} className="...">
          {t('tryAgain')}
        </button>
      </div>
    </div>
  );
}
```

### 3.2 Not Found Page Pattern

The not-found page can use either `useTranslations` (client) or `getTranslations` (server). Since it's a simple static page, server-side translation is preferred:

```typescript
// Updated pattern for src/app/item/[publicId]/not-found.tsx
import Link from 'next/link';
import { Search, ArrowLeft } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

export default async function NotFound() {
  const t = await getTranslations('errors.item');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        {t('notFoundTitle')}
      </h1>
      <p className="text-gray-600 mb-8 leading-relaxed">
        {t('notFoundDescription')}
      </p>
      <Link href="/" className="...">
        {t('returnHome')}
      </Link>
      <p className="text-sm text-gray-500">
        {t('contactSupport')}
      </p>
    </div>
  );
}
```

### 3.3 Global Error Boundary - Special Handling

The global error boundary presents a unique challenge: it renders outside the normal component tree and the translation provider may not be available. Two approaches:

**Option A: Fallback English with Best-Effort Translation (Recommended)**

```typescript
// src/app/global-error.tsx
"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect, useState } from "react";

// Static fallback messages (English)
const FALLBACK_MESSAGES = {
  title: "Something went wrong!",
  description: "We apologize for the inconvenience. Our team has been notified of this error.",
  errorId: "Error ID:",
  tryAgain: "Try again"
};

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [messages, setMessages] = useState(FALLBACK_MESSAGES);

  useEffect(() => {
    Sentry.captureException(error);

    // Attempt to load translations dynamically
    // If this fails, fallback messages are already set
    loadTranslations().then(setMessages).catch(() => {
      // Keep fallback messages on failure
    });
  }, [error]);

  return (
    <html>
      <body>
        <div style={{...}}>
          <h1 style={{...}}>{messages.title}</h1>
          <p style={{...}}>{messages.description}</p>
          {error.digest && (
            <p style={{...}}>{messages.errorId} {error.digest}</p>
          )}
          <button onClick={() => reset()} style={{...}}>
            {messages.tryAgain}
          </button>
        </div>
      </body>
    </html>
  );
}

async function loadTranslations() {
  try {
    // Get locale from cookie or browser
    const locale = document.cookie.match(/NEXT_LOCALE=(\w+)/)?.[1] || 'en';
    const messages = await import(`@/messages/${locale}.json`);
    return {
      title: messages.errors?.boundary?.title ?? FALLBACK_MESSAGES.title,
      description: messages.errors?.boundary?.description ?? FALLBACK_MESSAGES.description,
      errorId: messages.errors?.boundary?.errorId ?? FALLBACK_MESSAGES.errorId,
      tryAgain: messages.common?.actions?.tryAgain ?? FALLBACK_MESSAGES.tryAgain
    };
  } catch {
    return FALLBACK_MESSAGES;
  }
}
```

**Option B: Always Use English for Global Errors**

Accept that global errors (root layout failures) will always display in English. This is simpler and ensures the error boundary never fails due to translation issues.

**Recommendation:** Option A provides best-effort translation while maintaining reliability through fallbacks.

---

## 4. Task Breakdown

### Task 4.1: Add Error Boundary Translation Keys to Errors Namespace
**Effort:** 1 hour
**File:** `/messages/en.json`

Add the following keys to the errors namespace:

```json
{
  "errors": {
    "boundary": {
      "title": "Something went wrong!",
      "description": "We apologize for the inconvenience. Our team has been notified of this error.",
      "errorId": "Error ID: {digest}",
      "tryAgain": "Try again",
      "reload": "Reload page",
      "goBack": "Go back"
    },
    "item": {
      "notFoundTitle": "Item Not Found",
      "notFoundDescription": "The item you're looking for doesn't exist or may have been removed. Please check the QR code and try again.",
      "returnHome": "Return Home",
      "goBack": "Go Back",
      "contactSupport": "If you believe this is an error, please contact support."
    },
    "reaction": {
      "updateFailed": "Failed to update reaction counts",
      "unavailable": "Reaction system temporarily unavailable"
    }
  }
}
```

### Task 4.2: Update App Error Boundary (`/src/app/error.tsx`)
**Effort:** 1-2 hours
**File:** `/src/app/error.tsx`

- Import `useTranslations` from `next-intl`
- Replace hardcoded strings with translation keys from `errors.boundary`
- Maintain Sentry integration
- Preserve existing UI styling
- Test error display in all supported languages

### Task 4.3: Update Global Error Boundary (`/src/app/global-error.tsx`)
**Effort:** 2-3 hours
**File:** `/src/app/global-error.tsx`

- Implement best-effort translation with fallback pattern
- Create dynamic translation loader function
- Preserve inline styles (required for root layout errors)
- Maintain Sentry integration
- Test fallback behavior when translations fail to load
- Test translation loading when available

### Task 4.4: Update Item Not Found Page (`/src/app/item/[publicId]/not-found.tsx`)
**Effort:** 1-2 hours
**File:** `/src/app/item/[publicId]/not-found.tsx`

- Convert to async server component if not already
- Import `getTranslations` from `next-intl/server`
- Replace hardcoded strings with translation keys
- Maintain existing UI styling and icons
- Test in all supported languages

### Task 4.5: Update ItemDisplay Inline Error UI (`/src/components/ItemDisplay.tsx`)
**Effort:** 1-2 hours
**File:** `/src/components/ItemDisplay.tsx`

- Import `useTranslations` hook
- Update item not found fallback UI (lines 83-91)
- Update reaction error messages (lines 66-81)
- Update error dismiss button text (lines 156-165)
- Maintain existing functionality and styling

### Task 4.6: Create Fallback Messages Utility
**Effort:** 1 hour
**File:** `/src/lib/i18n/fallback-messages.ts`

Create a utility for consistent fallback messages:

```typescript
// src/lib/i18n/fallback-messages.ts
export const ERROR_BOUNDARY_FALLBACKS = {
  'errors.boundary.title': 'Something went wrong!',
  'errors.boundary.description': 'We apologize for the inconvenience. Our team has been notified of this error.',
  'errors.boundary.tryAgain': 'Try again',
  'errors.boundary.errorId': 'Error ID:',
  'errors.item.notFoundTitle': 'Item Not Found',
  'errors.item.notFoundDescription': 'The item you\'re looking for doesn\'t exist or may have been removed.',
  'errors.item.returnHome': 'Return Home',
  'errors.item.contactSupport': 'If you believe this is an error, please contact support.'
};

export function getFallback(key: keyof typeof ERROR_BOUNDARY_FALLBACKS): string {
  return ERROR_BOUNDARY_FALLBACKS[key];
}
```

### Task 4.7: Test Error Boundaries in All Languages
**Effort:** 2 hours
**Testing only**

- Trigger error scenarios in each supported language
- Verify global error boundary fallback behavior
- Verify app error boundary translation
- Verify item not found page translation
- Verify no text overflow or layout issues with longer translations
- Document any issues found

---

## 5. Authorized Files and Functions for Modification

### 5.1 New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/lib/i18n/fallback-messages.ts` | Fallback English messages for error boundaries |

### 5.2 Existing Files to Modify

| File Path | Functions/Areas to Modify | Changes |
|-----------|---------------------------|---------|
| `/src/app/error.tsx` | `Error` component | Add useTranslations, replace hardcoded strings |
| `/src/app/global-error.tsx` | `GlobalError` component | Add dynamic translation loader with fallback |
| `/src/app/item/[publicId]/not-found.tsx` | `NotFound` component | Convert to async, add getTranslations |
| `/src/components/ItemDisplay.tsx` | Item not found fallback, reaction error handling | Add useTranslations, update error messages |
| `/messages/en.json` | `errors.boundary`, `errors.item`, `errors.reaction` sections | Add error boundary translation keys |

### 5.3 Files to Reference (Read-Only)

| File Path | Purpose |
|-----------|---------|
| `/src/lib/error-utils.ts` | Existing error handling patterns |
| `/src/types/index.ts` | Error type definitions |
| `/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md` | Translation namespace structure reference |
| `/docs/REQ-315-create-errors-namespace-structure-overview.md` | Errors namespace documentation |

---

## 6. Translation Keys Structure

Complete translation keys to be added to `/messages/en.json`:

```json
{
  "errors": {
    "boundary": {
      "_description": "Error boundary UI messages for unexpected errors",
      "title": "Something went wrong!",
      "description": "We apologize for the inconvenience. Our team has been notified of this error.",
      "errorId": "Error ID: {digest}",
      "tryAgain": "Try again",
      "reload": "Reload page",
      "goBack": "Go back",
      "returnHome": "Return Home"
    },
    "item": {
      "_description": "Item-specific error messages including not found",
      "notFoundTitle": "Item Not Found",
      "notFoundDescription": "The item you're looking for doesn't exist or may have been removed. Please check the QR code and try again.",
      "notFoundShort": "The requested item could not be found.",
      "returnHome": "Return Home",
      "goBack": "Go Back",
      "goBackDemo": "Go Back (Demo Mode)",
      "contactSupport": "If you believe this is an error, please contact support."
    },
    "reaction": {
      "_description": "Reaction system error messages",
      "updateFailed": "Failed to update reaction counts",
      "unavailable": "Reaction system temporarily unavailable",
      "dismiss": "Dismiss"
    }
  }
}
```

---

## 7. Integration Considerations

### 7.1 Error Boundary Reliability

Error boundaries must remain functional even when the translation system fails. This is critical because:

1. Error boundaries are the last line of defense for user experience
2. If the error boundary itself fails, users see a blank page or browser error
3. Translation loading could fail for the same reason the original error occurred

**Mitigation:** All error boundaries must have fallback English strings that render if translation fails.

### 7.2 Global Error Boundary Constraints

The global error boundary (`global-error.tsx`) has special constraints:

| Constraint | Reason | Solution |
|------------|--------|----------|
| Cannot use React context | Renders outside provider tree | Dynamic import of translations |
| Cannot use Tailwind | CSS may not be loaded | Inline styles (already implemented) |
| Must be client component | Uses `reset()` function | `"use client"` directive |
| Cannot use hooks directly | May render before hydration | useEffect for translation loading |

### 7.3 Sentry Integration Preservation

All error boundaries currently integrate with Sentry for error reporting. This integration must be preserved:

- Continue calling `Sentry.captureException(error)`
- Error metadata should still include digest
- Translation changes should not affect error reporting

---

## 8. Dependencies

### 8.1 Upstream Dependencies

| Dependency | Status | Required For |
|------------|--------|--------------|
| Epic 1 Foundation (next-intl) | Must be complete | Translation hooks and functions |
| REQ-315 (Errors Namespace) | Should be complete | Namespace structure for error keys |

### 8.2 Related Tasks

| Task | Relationship |
|------|--------------|
| Task 2J.1 (Errors Namespace) | Provides namespace structure this task uses |
| Task 2J.4 (Error Utility) | May provide helper functions for error translation |
| Task 2J.7 (Generate Translations) | Will generate non-English translations for these keys |

---

## 9. Acceptance Criteria

From REQ-320 requirements:

- [ ] All error boundary components have been identified and catalogued
- [ ] Error boundary fallback UI headings and titles use translation keys instead of hardcoded English strings
- [ ] Error descriptions and explanatory text in error boundaries are internationalized
- [ ] Recovery action button labels such as retry, reload, or go back reference translation keys from the common namespace
- [ ] Error reporting prompts and contact support messages use translated text where present
- [ ] All error boundaries reference translation keys from appropriate error categories in the errors namespace
- [ ] The translation integration pattern handles cases where the translation system itself may be unavailable or failed
- [ ] Fallback English text is available when translation retrieval fails to ensure error boundaries always render
- [ ] Error boundary functionality including error catching, logging, and recovery actions remains unchanged
- [ ] Translated error messages maintain appropriate clarity and tone for unexpected error scenarios
- [ ] Error boundaries display correctly in all supported languages without text overflow or layout issues
- [ ] The implementation does not introduce new failure modes that could prevent error boundaries from functioning
- [ ] Documentation or code comments explain the pattern for integrating translations with error boundaries
- [ ] Common error boundary types share consistent translation keys across different instances throughout the application

---

## 10. Testing Strategy

### 10.1 Unit Tests

- Test translation key resolution for each error boundary
- Test fallback behavior when translation loading fails
- Test dynamic parameter interpolation (e.g., error digest)

### 10.2 Integration Tests

- Trigger errors and verify correct language display
- Switch languages and verify error messages update
- Test global error boundary with translation provider failure

### 10.3 Manual Testing

| Scenario | Test Steps | Expected Result |
|----------|------------|-----------------|
| App error in English | Trigger React error | See translated error UI in English |
| App error in French | Set locale to French, trigger error | See French error messages |
| Global error | Trigger root layout error | See error with fallback English or loaded translation |
| Translation failure | Block translation file, trigger error | Fallback English messages display |
| Item not found | Navigate to invalid item | See translated not found page |
| Reaction error | Trigger reaction system failure | See translated error message |

---

## 11. Risk Analysis

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Epic 1 not complete | Medium | Critical | Verify next-intl is installed before starting |
| Translation provider unavailable in error boundary | Medium | High | Implement fallback messages for all error text |
| Global error boundary translation failure | Medium | Medium | Dynamic loading with graceful fallback |
| Sentry integration broken | Low | Medium | Test error reporting after changes |
| Layout issues with longer translations | Medium | Low | Test in all languages, allow for 40% text expansion |
| Error boundary itself throws | Low | Critical | Extensive testing, simple implementation |

---

## 12. Effort Estimate

| Task | Estimate | Confidence |
|------|----------|------------|
| Add translation keys to errors namespace | 1 hour | High |
| Update app error boundary | 1-2 hours | High |
| Update global error boundary | 2-3 hours | Medium |
| Update item not found page | 1-2 hours | High |
| Update ItemDisplay inline errors | 1-2 hours | High |
| Create fallback messages utility | 1 hour | High |
| Testing in all languages | 2 hours | High |
| **Total** | **9-13 hours** | High |

---

## 13. References

- [Request Document: docs/gen_requests_epic2.md - REQ-320](/docs/gen_requests_epic2.md)
- [Implementation Plan: docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [REQ-315: Errors Namespace Structure](/docs/REQ-315-create-errors-namespace-structure-overview.md)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Next.js Error Handling](https://nextjs.org/docs/app/building-your-application/routing/error-handling)
- [Existing App Error Boundary: /src/app/error.tsx](/src/app/error.tsx)
- [Existing Global Error Boundary: /src/app/global-error.tsx](/src/app/global-error.tsx)

---

*Document generated for FAQBNB L10N Epic 2 - Sub-Epic 2J: Error Messages & Validation*
