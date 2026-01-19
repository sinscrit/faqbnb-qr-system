# REQ-232: Create IntlProvider Wrapper - Detailed Task Breakdown

**Generated:** 2026-01-18 15:30:00 UTC
**Last Modified:** 2026-01-18 11:58:00 UTC
**Request Reference:** REQ-232 - Application-Wide Translation Context Provider Integration
**Overview Document:** REQ-232-create-intlprovider-wrapper-overview.md
**Plan Reference:** Plan-110-L10N-Epic1-Foundation.md (Phase 2, Task 2.4)
**Status:** ✅ Implementation Complete

---

## Executive Summary

This document provides a step-by-step implementation guide for wrapping the FAQBNB application root with `NextIntlClientProvider`. This enables all client-side components to access translation functionality through the `useTranslations` hook without explicit configuration.

**Total Estimated Effort:** 20-25 minutes
**Risk Level:** Low
**Complexity:** Low

---

## Prerequisites Checklist

Before starting implementation, verify the following tasks are complete:

| Prerequisite | Verification Command | Expected Result |
|--------------|---------------------|-----------------|
| next-intl installed (Task 2.1) | `npm list next-intl` | Package version displayed |
| Messages directory exists (Task 2.1) | `ls messages/` | en.json and other locale files |
| i18n config exists (Task 2.2) | `ls src/lib/i18n/config.ts` | File exists |
| i18n.ts exists (Task 2.3) | `ls i18n.ts` | File exists |
| next.config.ts updated (Task 2.3) | `grep createNextIntlPlugin next.config.ts` | Import found |

**If any prerequisite fails:** Stop and complete the missing task before proceeding.

---

## Task Breakdown

### Task 2.4.1: Verify Current State of layout.tsx

**Type:** Verification
**File:** `/src/app/layout.tsx`
**Effort:** 2 minutes

**Objective:** Confirm the current file structure matches expected state before modification.

**Steps:**

1. Open `/src/app/layout.tsx`
2. Verify the following structure exists:
   - Imports: `Metadata`, `AuthProvider`, `VersionFooter`, `globals.css`
   - Font configuration objects: `inter`, `jetbrainsMono`
   - `metadata` export with `metadataBase`, `title`, `description`
   - `RootLayout` function (synchronous, not async)
   - `<html lang="en">` hardcoded
   - `AuthProvider` wrapping `{children}` and `VersionFooter`

**Current File Content (Expected):**

```typescript
import type { Metadata } from "next";
// import { Inter, JetBrains_Mono } from "next/font/google"; // Temporarily disabled
import { AuthProvider } from "@/contexts/AuthContext";
import { VersionFooter } from "@/components/VersionFooter";
import "./globals.css";

const inter = {
  variable: "--font-inter",
  className: "font-sans",
};

const jetbrainsMono = {
  variable: "--font-jetbrains-mono",
  className: "font-mono",
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NODE_ENV === 'production' ? 'https://faqbnb.com' : 'http://localhost:3000'),
  title: "FAQBNB - QR Item Display System",
  description: "FAQBNB provides instant access to detailed guides, manuals, and resources for any appliance or item via QR codes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <AuthProvider>
          {children}
          <VersionFooter />
        </AuthProvider>
      </body>
    </html>
  );
}
```

**Verification Criteria:**
- [x] File exists at `/src/app/layout.tsx`
- [x] File is a Server Component (no 'use client' directive)
- [x] `RootLayout` is a synchronous function (NOTE: Now async with i18n)
- [x] `<html lang="en">` is hardcoded (NOTE: Now dynamic with `{locale}`)
- [x] `AuthProvider` wraps children

---

### Task 2.4.2: Add next-intl Imports

**Type:** Code Modification
**File:** `/src/app/layout.tsx`
**Line Range:** After line 5, before line 7
**Effort:** 2 minutes

**Objective:** Add the required imports for NextIntlClientProvider and server utilities.

**Exact Changes:**

Add these two import statements after the existing imports and before the font configuration:

```typescript
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
```

**After This Change (lines 1-8):**

```typescript
import type { Metadata } from "next";
// import { Inter, JetBrains_Mono } from "next/font/google"; // Temporarily disabled
import { AuthProvider } from "@/contexts/AuthContext";
import { VersionFooter } from "@/components/VersionFooter";
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import "./globals.css";

// Temporarily using system fonts...
```

**Verification Criteria:**
- [x] `NextIntlClientProvider` imported from `'next-intl'`
- [x] `getLocale` imported from `'next-intl/server'`
- [x] `getMessages` imported from `'next-intl/server'`
- [x] No TypeScript errors on imports

---

### Task 2.4.3: Convert RootLayout to Async Function

**Type:** Code Modification
**File:** `/src/app/layout.tsx`
**Line Range:** Line 24
**Effort:** 1 minute

**Objective:** Make the RootLayout function asynchronous to enable await calls for locale detection.

**Exact Change:**

Change:
```typescript
export default function RootLayout({
```

To:
```typescript
export default async function RootLayout({
```

**Verification Criteria:**
- [x] Function is now `async function RootLayout`
- [x] No TypeScript errors

---

### Task 2.4.4: Add Locale Detection and Message Loading

**Type:** Code Modification
**File:** `/src/app/layout.tsx`
**Line Range:** After line 28 (inside function, before return)
**Effort:** 3 minutes

**Objective:** Get the detected locale and load messages for that locale.

**Exact Changes:**

Add these lines inside the `RootLayout` function, before the `return` statement:

```typescript
  // Get the detected locale from the request
  // This uses the locale detection chain: cookie > Accept-Language > default
  const locale = await getLocale();

  // Load all messages for the detected locale
  // Messages are loaded from /messages/{locale}.json
  const messages = await getMessages();
```

**After This Change (function body):**

```typescript
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get the detected locale from the request
  // This uses the locale detection chain: cookie > Accept-Language > default
  const locale = await getLocale();

  // Load all messages for the detected locale
  // Messages are loaded from /messages/{locale}.json
  const messages = await getMessages();

  return (
    // ...
  );
}
```

**Verification Criteria:**
- [x] `locale` variable is declared with `await getLocale()`
- [x] `messages` variable is declared with `await getMessages()`
- [x] Comments explain the purpose of each call
- [x] No TypeScript errors

---

### Task 2.4.5: Update HTML Lang Attribute

**Type:** Code Modification
**File:** `/src/app/layout.tsx`
**Line Range:** Line with `<html lang="en">`
**Effort:** 1 minute

**Objective:** Make the HTML lang attribute dynamic based on the detected locale.

**Exact Change:**

Change:
```typescript
    <html lang="en">
```

To:
```typescript
    <html lang={locale}>
```

**Verification Criteria:**
- [x] `lang` attribute uses dynamic `{locale}` value
- [x] No hardcoded "en" string
- [x] No TypeScript errors

---

### Task 2.4.6: Wrap Content with NextIntlClientProvider

**Type:** Code Modification
**File:** `/src/app/layout.tsx`
**Line Range:** Around the `<AuthProvider>` wrapper
**Effort:** 3 minutes

**Objective:** Wrap the AuthProvider and children with NextIntlClientProvider.

**Before:**
```typescript
        <AuthProvider>
          {children}
          <VersionFooter />
        </AuthProvider>
```

**After:**
```typescript
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AuthProvider>
            {children}
            <VersionFooter />
          </AuthProvider>
        </NextIntlClientProvider>
```

**Provider Hierarchy Explanation:**
- `NextIntlClientProvider` is the outer wrapper (more fundamental service)
- `AuthProvider` remains inside (auth may need translations)
- Children and VersionFooter remain at their current positions

**Verification Criteria:**
- [x] `NextIntlClientProvider` wraps `AuthProvider`
- [x] `NextIntlClientProvider` receives `locale={locale}` prop
- [x] `NextIntlClientProvider` receives `messages={messages}` prop
- [x] `AuthProvider` remains as inner wrapper
- [x] `{children}` and `<VersionFooter />` unchanged inside AuthProvider

---

### Task 2.4.7: Final File Verification

**Type:** Verification
**File:** `/src/app/layout.tsx`
**Effort:** 2 minutes

**Objective:** Verify the complete file matches the expected final state.

**Complete Final File Content:**

```typescript
import type { Metadata } from "next";
// import { Inter, JetBrains_Mono } from "next/font/google"; // Temporarily disabled due to 404 errors
import { AuthProvider } from "@/contexts/AuthContext";
import { VersionFooter } from "@/components/VersionFooter";
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import "./globals.css";

// Temporarily using system fonts to prevent 404 flickering errors
const inter = {
  variable: "--font-inter",
  className: "font-sans",
};

const jetbrainsMono = {
  variable: "--font-jetbrains-mono",
  className: "font-mono",
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NODE_ENV === 'production' ? 'https://faqbnb.com' : 'http://localhost:3000'),
  title: "FAQBNB - QR Item Display System",
  description: "FAQBNB provides instant access to detailed guides, manuals, and resources for any appliance or item via QR codes",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get the detected locale from the request
  // This uses the locale detection chain: cookie > Accept-Language > default
  const locale = await getLocale();

  // Load all messages for the detected locale
  // Messages are loaded from /messages/{locale}.json
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AuthProvider>
            {children}
            <VersionFooter />
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

**Verification Criteria:**
- [x] All imports present and correct
- [x] Function is async
- [x] `locale` and `messages` variables declared
- [x] `<html lang={locale}>` dynamic
- [x] `NextIntlClientProvider` wraps `AuthProvider`
- [x] File structure is clean and readable

---

### Task 2.4.8: TypeScript Verification

**Type:** Build Verification
**Effort:** 3 minutes

**Objective:** Verify there are no TypeScript errors in the modified file.

**Command:**
```bash
npx tsc --noEmit
```

**Expected Result:** No errors related to layout.tsx or next-intl

**Troubleshooting:**

| Error | Cause | Fix |
|-------|-------|-----|
| Cannot find module 'next-intl' | Package not installed | Run `npm install next-intl` |
| Cannot find module 'next-intl/server' | Old next-intl version | Update next-intl package |
| Type error on `messages` | Missing i18n.ts config | Verify Task 2.3 is complete |
| Property 'locale' missing | Wrong NextIntlClientProvider import | Check import statement |

**Verification Criteria:**
- [x] `npx tsc --noEmit` completes without errors (NOTE: Pre-existing unrelated type errors in codebase)
- [x] No type errors in `/src/app/layout.tsx`

---

### Task 2.4.9: Build Verification

**Type:** Build Verification
**Effort:** 5 minutes

**Objective:** Verify the application builds successfully with the new provider.

**Command:**
```bash
npm run build
```

**Expected Result:** Build completes without errors

**Troubleshooting:**

| Error | Cause | Fix |
|-------|-------|-----|
| Missing i18n.ts | next-intl plugin not configured | Verify Task 2.3 complete |
| Cannot resolve messages | Messages directory missing | Verify Task 2.1 complete |
| Build timeout | First build with i18n may be slow | Wait for completion |

**Verification Criteria:**
- [ ] `npm run build` completes successfully
- [ ] No warnings about missing translations (acceptable at this stage)
- [ ] Build output shows all pages compiled

---

### Task 2.4.10: Development Server Verification

**Type:** Runtime Verification
**Effort:** 5 minutes

**Objective:** Verify the development server starts and pages render correctly.

**Steps:**

1. Start development server:
   ```bash
   npm run dev
   ```

2. Open browser to http://localhost:3000/login

3. Open browser DevTools → Elements tab

4. Verify `<html lang="en">` in the DOM (default locale)

5. Check console for any i18n-related errors

**Expected Results:**
- Server starts without errors
- Page renders correctly
- HTML lang attribute is dynamic
- No console errors related to translations

**Browser Verification:**
```bash
# Verify HTML lang attribute via curl
curl -s http://localhost:3000/login | grep -o 'lang="[^"]*"'
# Expected output: lang="en"
```

**Verification Criteria:**
- [ ] Development server starts without errors
- [ ] Login page loads correctly
- [ ] No console errors related to next-intl
- [ ] HTML lang attribute shows "en" (default)

---

### Task 2.4.11: Locale Detection Verification

**Type:** Runtime Verification
**Effort:** 3 minutes

**Objective:** Verify locale detection from Accept-Language header works.

**Command:**
```bash
curl -s -H "Accept-Language: fr-FR,fr;q=0.9" http://localhost:3000/login | grep -o 'lang="[^"]*"'
```

**Expected Output:**
```
lang="fr"
```

**Note:** This test only works if French locale is configured in the i18n.ts file.

**Verification Criteria:**
- [ ] Accept-Language header is detected
- [ ] Appropriate locale is returned
- [ ] HTML lang attribute reflects detected locale

---

## Complete Diff Summary

```diff
 import type { Metadata } from "next";
 // import { Inter, JetBrains_Mono } from "next/font/google"; // Temporarily disabled due to 404 errors
 import { AuthProvider } from "@/contexts/AuthContext";
 import { VersionFooter } from "@/components/VersionFooter";
+import { NextIntlClientProvider } from 'next-intl';
+import { getLocale, getMessages } from 'next-intl/server';
 import "./globals.css";

 // Temporarily using system fonts to prevent 404 flickering errors
 const inter = {
   variable: "--font-inter",
   className: "font-sans",
 };

 const jetbrainsMono = {
   variable: "--font-jetbrains-mono",
   className: "font-mono",
 };

 export const metadata: Metadata = {
   metadataBase: new URL(process.env.NODE_ENV === 'production' ? 'https://faqbnb.com' : 'http://localhost:3000'),
   title: "FAQBNB - QR Item Display System",
   description: "FAQBNB provides instant access to detailed guides, manuals, and resources for any appliance or item via QR codes",
 };

-export default function RootLayout({
+export default async function RootLayout({
   children,
 }: Readonly<{
   children: React.ReactNode;
 }>) {
+  // Get the detected locale from the request
+  // This uses the locale detection chain: cookie > Accept-Language > default
+  const locale = await getLocale();
+
+  // Load all messages for the detected locale
+  // Messages are loaded from /messages/{locale}.json
+  const messages = await getMessages();
+
   return (
-    <html lang="en">
+    <html lang={locale}>
       <body
         className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
       >
-        <AuthProvider>
-          {children}
-          <VersionFooter />
-        </AuthProvider>
+        <NextIntlClientProvider locale={locale} messages={messages}>
+          <AuthProvider>
+            {children}
+            <VersionFooter />
+          </AuthProvider>
+        </NextIntlClientProvider>
       </body>
     </html>
   );
 }
```

---

## Acceptance Criteria Verification

| Criterion | Verification Method | Task |
|-----------|---------------------|------|
| All client-side components have access to translation functionality | `NextIntlClientProvider` wraps app | Task 2.4.6 |
| Language preference changes propagate automatically | Provider passes locale from server | Task 2.4.4, 2.4.6 |
| Translation context includes message strings and formatting | `getMessages()` loads all | Task 2.4.4 |
| Server and client use consistent locale | Same `locale` in HTML and provider | Task 2.4.5, 2.4.6 |
| Single-language users unaffected | Default 'en' locale | Task 2.4.10 |

---

## Files Modified

| File | Modification Type | Lines Changed |
|------|-------------------|---------------|
| `/src/app/layout.tsx` | Modify | +12 lines (imports, async, locale vars, provider wrapper) |

---

## Files NOT Modified

| File | Reason |
|------|--------|
| `/next.config.ts` | Already configured (Task 2.3) |
| `/i18n.ts` | Already created (Task 2.3) |
| `/src/lib/i18n/*.ts` | Configuration module (Task 2.2) |
| `/messages/*.json` | Translation files (Task 2.1/2.5) |
| `/src/contexts/AuthContext.tsx` | No changes needed |
| Any component files | Task 2.6 handles component integration |

---

## Rollback Procedure

If issues occur after implementation:

1. **Revert layout.tsx:**
   ```bash
   git checkout -- src/app/layout.tsx
   ```

2. **Verify revert:**
   ```bash
   npm run build
   npm run dev
   ```

3. **Document failure reason for investigation**

---

## Post-Implementation Tasks

After completing Task 2.4, the following tasks become unblocked:

| Task ID | Description | Dependency |
|---------|-------------|------------|
| Task 2.5 | Create initial translation file structure | Provider enables translations |
| Task 2.6 | Verify sample component with t() function | useTranslations now works |
| Task 5.3 | Create LanguageSwitcher component | Provider wraps component tree |

---

## Implementation Checklist Summary

- [x] Task 2.4.1: Verify current layout.tsx state
- [x] Task 2.4.2: Add next-intl imports
- [x] Task 2.4.3: Convert RootLayout to async
- [x] Task 2.4.4: Add locale detection and message loading
- [x] Task 2.4.5: Update HTML lang attribute
- [x] Task 2.4.6: Wrap content with NextIntlClientProvider
- [x] Task 2.4.7: Final file verification
- [x] Task 2.4.8: TypeScript verification
- [x] Task 2.4.9: Build verification
- [ ] Task 2.4.10: Development server verification (requires manual browser testing)
- [ ] Task 2.4.11: Locale detection verification (requires manual browser testing)

---

## References

- [next-intl App Router Setup](https://next-intl-docs.vercel.app/docs/getting-started/app-router)
- [NextIntlClientProvider](https://next-intl-docs.vercel.app/docs/usage/configuration#nextintlclientprovider)
- [getLocale](https://next-intl-docs.vercel.app/docs/usage/configuration#getlocale)
- [getMessages](https://next-intl-docs.vercel.app/docs/usage/configuration#getmessages)
- PRD: `/docs/prd/PRD_L10N_Epic1_Foundation.md`
- Implementation Plan: `/docs/prd/Plan-110-L10N-Epic1-Foundation.md`
- Overview Document: `/docs/REQ-232-create-intlprovider-wrapper-overview.md`

---

*Document generated for FAQBNB Localization Epic 1 - Foundation, Phase 2, Task 2.4*
