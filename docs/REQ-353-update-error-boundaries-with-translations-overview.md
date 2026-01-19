# REQ-353: Update Error Boundaries with Translations

**Implementation Overview Document**

**Last Modified:** 2026-01-19
**Request Reference:** docs/gen_requests_epic2.md - REQ-353
**Implementation Plan Reference:** docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md
**Sub-Epic:** 2J - Error Messages & Validation
**Task ID:** 2J.6
**Type:** ENHANCEMENT
**Size:** S (Small)

---

## 1. Executive Summary

This task updates all error boundary components to display error messages, fallback UI text, and recovery actions in the user's preferred language by integrating with the next-intl translation system. Error boundaries catch JavaScript errors and display fallback UI, which currently shows hardcoded English text regardless of user language preference.

**Key Components to Update:**

| Component | Location | Hardcoded Strings |
|-----------|----------|-------------------|
| App Error Boundary | `/src/app/error.tsx` | 4 strings (title, description, error ID, button) |
| Global Error Boundary | `/src/app/global-error.tsx` | 4 strings (same as app error) |
| Item Not Found Page | `/src/app/item/[publicId]/not-found.tsx` | 5 strings (title, description, buttons, help text) |
| ItemDisplay Inline Errors | `/src/components/ItemDisplay.tsx` | 4 strings (not found, reaction errors) |

**Total Strings to Extract:** ~17 unique strings

**Implementation Strategy:** Use `useTranslations` hook for client components. Special handling for global error boundary which may render outside the translation provider context.

---

## 2. Current State Analysis

### 2.1 App Error Boundary (`/src/app/error.tsx`)

The primary error boundary for page-level errors. Currently displays hardcoded English:

**Hardcoded Strings:**
- `"Something went wrong!"` - Error title
- `"We apologize for the inconvenience. Our team has been notified of this error."` - Description
- `"Error ID: {digest}"` - Error reference label
- `"Try again"` - Recovery button

```typescript
// Current implementation (lines 23-45)
return (
  <div className="flex flex-col items-center justify-center min-h-[60vh] p-5">
    <div className="bg-white p-10 rounded-xl shadow-lg text-center max-w-lg">
      <h2 className="text-red-500 mb-4 text-2xl font-semibold">
        Something went wrong!           {/* Hardcoded */}
      </h2>
      <p className="text-gray-600 mb-6 leading-relaxed">
        We apologize for the inconvenience...  {/* Hardcoded */}
      </p>
      <button onClick={() => reset()} className="...">
        Try again                        {/* Hardcoded */}
      </button>
    </div>
  </div>
);
```

### 2.2 Global Error Boundary (`/src/app/global-error.tsx`)

Catches errors in the root layout. Uses inline styles because CSS may not be loaded:

**Hardcoded Strings:** Same as app error boundary

**Special Consideration:** This component renders outside the normal React tree and may not have access to the IntlProvider. Requires fallback strategy.

### 2.3 Item Not Found Page (`/src/app/item/[publicId]/not-found.tsx`)

Displays when a QR code item doesn't exist:

**Hardcoded Strings:**
- `"Item Not Found"` - Title
- `"The item you're looking for doesn't exist or may have been removed. Please check the QR code and try again."` - Description
- `"Go Back (Demo Mode)"` - Disabled button
- `"Return Home"` - Navigation link
- `"If you believe this is an error, please contact support."` - Help text

### 2.4 ItemDisplay Component (`/src/components/ItemDisplay.tsx`)

Contains inline error handling for item display:

**Hardcoded Strings:**
- `"Item Not Found"` - Fallback title (line 87)
- `"The requested item could not be found."` - Fallback description (line 88)
- `"Failed to update reaction counts"` - Error message (line 73)
- `"Reaction system temporarily unavailable"` - Error message (line 80)
- `"Dismiss"` - Button text (line 163)

---

## 3. Technical Approach

### 3.1 Client Component Pattern (App Error Boundary)

```typescript
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

### 3.2 Global Error Boundary Pattern (Fallback Strategy)

The global error boundary requires a fallback approach since it may render outside the translation provider:

```typescript
"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect, useState } from "react";

// Static fallback messages (English)
const FALLBACK = {
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
  const [messages, setMessages] = useState(FALLBACK);

  useEffect(() => {
    Sentry.captureException(error);

    // Attempt to load translations dynamically
    loadTranslations().then(setMessages).catch(() => {});
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
    const locale = document.cookie.match(/FAQBNB_LANG=(\w+)/)?.[1] || 'en';
    const messages = await import(`@/messages/${locale}.json`);
    return {
      title: messages.errors?.boundary?.title ?? FALLBACK.title,
      description: messages.errors?.boundary?.description ?? FALLBACK.description,
      errorId: messages.errors?.boundary?.errorId ?? FALLBACK.errorId,
      tryAgain: messages.errors?.boundary?.tryAgain ?? FALLBACK.tryAgain
    };
  } catch {
    return FALLBACK;
  }
}
```

### 3.3 Server Component Pattern (Not Found Page)

```typescript
import Link from 'next/link';
import { Search, ArrowLeft } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

export default async function NotFound() {
  const t = await getTranslations('errors.item');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center px-4">
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
    </div>
  );
}
```

---

## 4. Task Breakdown

### Task 4.1: Add Translation Keys to Errors Namespace
**File:** `/messages/en.json`
**Strings to Add:**

```json
{
  "errors": {
    "boundary": {
      "title": "Something went wrong!",
      "description": "We apologize for the inconvenience. Our team has been notified of this error.",
      "errorId": "Error ID: {digest}",
      "tryAgain": "Try again"
    },
    "item": {
      "notFoundTitle": "Item Not Found",
      "notFoundDescription": "The item you're looking for doesn't exist or may have been removed. Please check the QR code and try again.",
      "notFoundShort": "The requested item could not be found.",
      "returnHome": "Return Home",
      "goBack": "Go Back",
      "goBackDemo": "Go Back (Demo Mode)",
      "contactSupport": "If you believe this is an error, please contact support."
    },
    "reaction": {
      "updateFailed": "Failed to update reaction counts",
      "unavailable": "Reaction system temporarily unavailable",
      "dismiss": "Dismiss"
    }
  }
}
```

### Task 4.2: Update App Error Boundary
**File:** `/src/app/error.tsx`
- Add `useTranslations` import from `next-intl`
- Replace hardcoded strings with translation keys
- Maintain Sentry integration and existing styling

### Task 4.3: Update Global Error Boundary
**File:** `/src/app/global-error.tsx`
- Implement dynamic translation loading with fallback
- Preserve inline styles (required for root layout errors)
- Maintain Sentry integration

### Task 4.4: Update Item Not Found Page
**File:** `/src/app/item/[publicId]/not-found.tsx`
- Convert to async server component
- Add `getTranslations` from `next-intl/server`
- Replace hardcoded strings

### Task 4.5: Update ItemDisplay Inline Errors
**File:** `/src/components/ItemDisplay.tsx`
- Add `useTranslations` import
- Update item not found fallback (lines 83-91)
- Update reaction error messages (lines 66-81, 156-165)

### Task 4.6: Generate Non-English Translations
- Generate translations for: fr, es, de, nl, it
- Use AI translation or manual translation

---

## 5. Authorized Files and Functions for Modification

### 5.1 Files to Modify

| File Path | Functions/Areas | Changes |
|-----------|-----------------|---------|
| `/messages/en.json` | `errors.boundary`, `errors.item`, `errors.reaction` | Add translation keys |
| `/src/app/error.tsx` | `Error` component | Add useTranslations, replace strings |
| `/src/app/global-error.tsx` | `GlobalError` component | Add dynamic translation loader |
| `/src/app/item/[publicId]/not-found.tsx` | `NotFound` component | Convert to async, add getTranslations |
| `/src/components/ItemDisplay.tsx` | Fallback UI, error handlers | Add useTranslations, update messages |

### 5.2 Files to Reference (Read-Only)

| File Path | Purpose |
|-----------|---------|
| `/src/lib/i18n/config.ts` | Locale configuration, cookie name |
| `/src/components/LogoutButton.tsx` | Example of useTranslations pattern |
| `/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md` | Translation namespace conventions |

---

## 6. Dependencies

### 6.1 Upstream Dependencies

| Dependency | Status | Required |
|------------|--------|----------|
| Epic 1 Foundation (next-intl) | Complete | Yes |
| IntlProvider in layout | Complete | Yes |
| `errors` namespace structure | In progress | Yes |

### 6.2 Related Tasks in Sub-Epic 2J

| Task | Relationship |
|------|--------------|
| Task 2J.1 (Errors Namespace) | Provides namespace structure |
| Task 2J.7 (Generate Translations) | Generates non-English translations |

---

## 7. Acceptance Criteria

From REQ-353:

- [ ] All error boundary components retrieve and use translations for displayed text
- [ ] Error titles, descriptions, and instructions appear in the user's selected language
- [ ] Action buttons (reload, go home, try again, etc.) display translated labels
- [ ] Fallback behavior gracefully handles missing translations by showing English as default
- [ ] Error boundaries work correctly in both authenticated and guest contexts
- [ ] No hardcoded English strings remain in error boundary components

---

## 8. Integration Considerations

### 8.1 Error Boundary Reliability

Error boundaries must remain functional even when translations fail:
- Always provide English fallback strings
- Never let translation errors cascade to the error boundary
- Test with translation system unavailable

### 8.2 Global Error Boundary Constraints

| Constraint | Reason | Solution |
|------------|--------|----------|
| No React context | Renders outside provider | Dynamic import with fallback |
| No Tailwind CSS | CSS may not load | Inline styles (already done) |
| Must be client component | Uses reset() | "use client" directive |

### 8.3 Sentry Preservation

- Continue calling `Sentry.captureException(error)`
- Error digest should still display
- Translation changes must not affect error reporting

---

## 9. Risk Analysis

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Translation provider unavailable | Medium | High | Fallback English strings |
| Global error boundary translation failure | Medium | Medium | Dynamic loading with fallback |
| Layout issues with longer translations | Medium | Low | Test in all languages |
| Sentry integration broken | Low | Medium | Test error reporting |

---

## 10. Effort Estimate

| Task | Estimate |
|------|----------|
| Add translation keys | 30 min |
| Update app error boundary | 1 hour |
| Update global error boundary | 1.5 hours |
| Update item not found page | 45 min |
| Update ItemDisplay inline errors | 1 hour |
| Testing in all languages | 1 hour |
| **Total** | **~6 hours** |

---

## 11. Testing Strategy

### 11.1 Manual Testing Scenarios

| Scenario | Steps | Expected |
|----------|-------|----------|
| App error in English | Trigger React error | English error UI |
| App error in French | Set locale to fr, trigger error | French error UI |
| Global error | Trigger root layout error | Error with fallback or loaded translation |
| Translation failure | Block translation file, trigger error | English fallback displays |
| Item not found | Navigate to invalid item | Translated not found page |
| Reaction error | Trigger reaction failure | Translated error message |

### 11.2 Visual Regression

- Check text overflow in all languages
- Verify button widths accommodate longer translations
- Ensure no layout breaks with German (typically longest)

---

## 12. References

- [Request: docs/gen_requests_epic2.md - REQ-353](/docs/gen_requests_epic2.md)
- [Implementation Plan: docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Next.js Error Handling](https://nextjs.org/docs/app/building-your-application/routing/error-handling)
- [Related: REQ-320 Overview](/docs/REQ-320-update-error-boundaries-with-translations-overview.md)

---

*Document generated for FAQBNB L10N Epic 2 - Sub-Epic 2J: Error Messages & Validation*
*Note: This task overlaps with REQ-320 which covers the same scope (Task 2J.6)*
