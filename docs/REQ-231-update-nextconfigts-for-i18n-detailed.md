# REQ-231: Update next.config.ts for i18n - Detailed Task Breakdown

**Generated:** 2026-01-18 14:50:00 UTC
**Last Modified:** 2026-01-18 14:50:00 UTC
**Request Reference:** REQ-231 - Configure Next.js Application for Internationalization Support
**Overview Document:** REQ-231-update-nextconfigts-for-i18n-overview.md
**Plan Reference:** Plan-110-L10N-Epic1-Foundation.md (Phase 2, Task 2.3)
**Status:** Ready for Implementation

---

## Executive Summary

This document provides granular, implementation-ready tasks for updating the Next.js configuration to support internationalization via the `next-intl` plugin. The implementation involves creating a root-level `i18n.ts` configuration file and modifying `next.config.ts` to chain the next-intl plugin with the existing Sentry configuration.

**Total Estimated Effort:** ~25 minutes
**Story Points:** 1

---

## Prerequisites Checklist

Before starting implementation, verify the following:

| Prerequisite | Verification Command | Expected Result |
|--------------|---------------------|-----------------|
| Task 2.1 complete: next-intl installed | `npm list next-intl` | `next-intl@x.x.x` listed |
| Task 2.1 complete: messages directory exists | `ls messages/` | `en.json`, `fr.json`, etc. exist |
| Task 2.2 complete: i18n config module exists | `ls src/lib/i18n/` | `config.ts`, `index.ts` exist |

**IMPORTANT:** If prerequisites are NOT met, this task CANNOT proceed. Return to Task 2.1 and 2.2 first.

---

## Task 2.3.1: Create Root-Level i18n.ts Configuration File

### Objective
Create the `i18n.ts` file at the project root level that next-intl requires for its plugin configuration. This file configures request-level locale detection and message file loading.

### File Details
- **Action:** CREATE new file
- **Path:** `/i18n.ts` (project root, same level as `next.config.ts`)
- **Estimated Time:** 5 minutes

### Implementation Steps

#### Step 2.3.1.1: Verify File Does Not Exist

```bash
# Check if file already exists
ls -la i18n.ts
# Expected: "No such file or directory" (file should not exist)
```

If file exists, read it and determine if it's the correct implementation or needs updating.

#### Step 2.3.1.2: Create the i18n.ts File

Create `/i18n.ts` with the following exact content:

```typescript
import { getRequestConfig } from 'next-intl/server';

// Supported locales for the application
// Must match the locale files in /messages/ directory
export const locales = ['en', 'fr', 'es', 'de', 'nl', 'it'] as const;
export type Locale = (typeof locales)[number];

// Default locale (source language for translations)
export const defaultLocale: Locale = 'en';

export default getRequestConfig(async ({ requestLocale }) => {
  // This function is called for every request
  // requestLocale comes from the routing configuration or middleware
  let locale = await requestLocale;

  // Validate locale and fallback to default if invalid
  if (!locale || !locales.includes(locale as Locale)) {
    locale = defaultLocale;
  }

  return {
    locale,
    // Dynamically import the appropriate message file
    messages: (await import(`./messages/${locale}.json`)).default
  };
});
```

#### Step 2.3.1.3: Verify File Created Correctly

```bash
# Verify file exists
ls -la i18n.ts
# Expected: File listed with correct permissions

# Verify TypeScript compiles
npx tsc --noEmit i18n.ts
# Expected: No errors (may show "Cannot find module" for messages - that's OK if messages not created yet)
```

### Acceptance Criteria for Task 2.3.1
- [ ] File `/i18n.ts` exists at project root
- [ ] File exports `locales` constant with 6 locale codes
- [ ] File exports `Locale` type
- [ ] File exports `defaultLocale` set to `'en'`
- [ ] File has default export using `getRequestConfig`
- [ ] TypeScript has no syntax errors in the file

### Rollback Instructions
```bash
# If issues occur, remove the file
rm i18n.ts
```

---

## Task 2.3.2: Update next.config.ts with next-intl Plugin

### Objective
Modify the existing `next.config.ts` to import and apply the `createNextIntlPlugin` wrapper, composing it with the existing Sentry configuration.

### File Details
- **Action:** MODIFY existing file
- **Path:** `/next.config.ts`
- **Estimated Time:** 5 minutes

### Current File State

The current `next.config.ts` (51 lines) has this structure:
- Lines 1-2: Imports (`NextConfig` type, `withSentryConfig`)
- Lines 4-6: Empty `nextConfig` object
- Lines 8-48: `sentryConfig` object
- Lines 50-51: Export with Sentry wrapper

### Implementation Steps

#### Step 2.3.2.1: Add next-intl Import

**Location:** After line 2 (after `withSentryConfig` import)

**Add this line:**
```typescript
import createNextIntlPlugin from 'next-intl/plugin';
```

**After modification, lines 1-3 should be:**
```typescript
import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import createNextIntlPlugin from 'next-intl/plugin';
```

#### Step 2.3.2.2: Create the next-intl Plugin Wrapper

**Location:** After the imports, before the `nextConfig` object (around line 4-5)

**Add these lines:**
```typescript

// Create the next-intl plugin wrapper
// By default, it expects i18n.ts in the project root
const withNextIntl = createNextIntlPlugin();
```

**After modification, lines 1-8 should be:**
```typescript
import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import createNextIntlPlugin from 'next-intl/plugin';

// Create the next-intl plugin wrapper
// By default, it expects i18n.ts in the project root
const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
```

#### Step 2.3.2.3: Update the Export Statement

**Location:** Last line of the file (currently line 51)

**Current line:**
```typescript
export default withSentryConfig(nextConfig, sentryConfig);
```

**Replace with:**
```typescript
// Apply plugins in composition order:
// 1. nextConfig (base configuration)
// 2. withNextIntl (i18n plugin - wraps config)
// 3. withSentryConfig (monitoring - must be outermost per Sentry docs)
export default withSentryConfig(withNextIntl(nextConfig), sentryConfig);
```

#### Step 2.3.2.4: Verify Complete Modified File

After all modifications, the complete `/next.config.ts` should be:

```typescript
import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import createNextIntlPlugin from 'next-intl/plugin';

// Create the next-intl plugin wrapper
// By default, it expects i18n.ts in the project root
const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  /* config options here */
};

// Sentry configuration options
// https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
const sentryConfig = {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Automatically annotate React components to show their full name in breadcrumbs and session replay
  reactComponentAnnotation: {
    enabled: true,
  },

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  // Hides source maps from generated client bundles
  hideSourceMaps: true,

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: true,
};

// Apply plugins in composition order:
// 1. nextConfig (base configuration)
// 2. withNextIntl (i18n plugin - wraps config)
// 3. withSentryConfig (monitoring - must be outermost per Sentry docs)
export default withSentryConfig(withNextIntl(nextConfig), sentryConfig);
```

### Acceptance Criteria for Task 2.3.2
- [ ] Import for `createNextIntlPlugin` added from `'next-intl/plugin'`
- [ ] `withNextIntl` constant created using `createNextIntlPlugin()`
- [ ] Export statement chains `withNextIntl` inside `withSentryConfig`
- [ ] Sentry remains as the outermost wrapper
- [ ] No TypeScript errors in the file
- [ ] File is syntactically valid

### Rollback Instructions
```bash
# Revert to previous version using git
git checkout next.config.ts
```

---

## Task 2.3.3: Verify TypeScript Compilation

### Objective
Ensure all configuration changes compile without TypeScript errors.

### Implementation Steps

#### Step 2.3.3.1: Run TypeScript Check

```bash
npx tsc --noEmit
```

**Expected Result:** No errors. Warnings about unused variables are acceptable.

#### Step 2.3.3.2: Fix Any Type Errors

If errors occur, they will likely be one of:

| Error | Cause | Solution |
|-------|-------|----------|
| `Cannot find module 'next-intl/plugin'` | next-intl not installed | Run `npm install next-intl` (Task 2.1) |
| `Cannot find module './messages/${locale}.json'` | Messages directory missing | Create messages/ directory (Task 2.1) |
| Type mismatch in `requestLocale` | next-intl version issue | Check next-intl version compatibility |

### Acceptance Criteria for Task 2.3.3
- [ ] `npx tsc --noEmit` completes without errors
- [ ] No type errors related to i18n configuration

---

## Task 2.3.4: Verify Build Process

### Objective
Confirm the Next.js build completes successfully with the new i18n configuration.

### Implementation Steps

#### Step 2.3.4.1: Run Production Build

```bash
npm run build
```

**Expected Result:** Build completes successfully. Look for:
- No errors mentioning `i18n`, `next-intl`, or locale configuration
- Build output shows normal compilation of pages
- Sentry source map upload (if CI environment) continues to work

#### Step 2.3.4.2: Check for i18n-Related Warnings

Review build output for any warnings containing:
- `next-intl`
- `locale`
- `i18n`
- `messages`

**Note:** Some warnings about missing translations are acceptable at this stage.

### Acceptance Criteria for Task 2.3.4
- [ ] `npm run build` completes without errors
- [ ] No critical i18n-related errors in build output
- [ ] Build artifacts are created in `.next/` directory

---

## Task 2.3.5: Verify Development Server

### Objective
Confirm the development server starts correctly with the new configuration.

### Implementation Steps

#### Step 2.3.5.1: Start Development Server

```bash
npm run dev
```

**Expected Result:** Server starts on http://localhost:3000 (or configured port).

#### Step 2.3.5.2: Check Console for Errors

Look for any error messages containing:
- `i18n`
- `next-intl`
- `locale`
- `getRequestConfig`

**Acceptable warnings:**
- Messages about missing translation keys (will be added in Task 2.5)
- Initial locale detection fallback messages

#### Step 2.3.5.3: Verify Existing Pages Load

Test that existing functionality is not broken:

```bash
# Test login page loads (or use browser)
curl -I http://localhost:3000/login
# Expected: HTTP 200 or redirect response

# Test dashboard loads (requires auth, use browser)
# Navigate to http://localhost:3000/dashboard
# Expected: Page loads (or redirects to login if not authenticated)
```

### Acceptance Criteria for Task 2.3.5
- [ ] `npm run dev` starts without errors
- [ ] No i18n-related errors in console output
- [ ] Existing login page loads correctly
- [ ] Existing authenticated pages load correctly (if tested)

---

## Task 2.3.6: Verify Sentry Integration

### Objective
Confirm that Sentry error tracking continues to function after adding the next-intl plugin wrapper.

### Implementation Steps

#### Step 2.3.6.1: Verify Sentry Configuration Preserved

The Sentry configuration should remain unchanged. Verify:
- `sentryConfig` object is unchanged
- `withSentryConfig` is the outermost wrapper
- Environment variables for Sentry are still recognized

#### Step 2.3.6.2: Test Error Reporting (Optional)

If Sentry is configured in the development environment:
1. Trigger a test error in the application
2. Check Sentry dashboard for the error
3. Confirm error reports include expected metadata

**Note:** This step may be skipped if Sentry is only active in production.

### Acceptance Criteria for Task 2.3.6
- [ ] Sentry configuration is preserved unchanged
- [ ] `withSentryConfig` remains as outermost wrapper
- [ ] No Sentry-related errors in console

---

## Final Verification Checklist

### Files Created
- [ ] `/i18n.ts` - Root-level i18n configuration file

### Files Modified
- [ ] `/next.config.ts` - Added next-intl plugin integration

### Verification Commands

```bash
# 1. Verify i18n.ts exists
test -f i18n.ts && echo "✓ i18n.ts exists" || echo "✗ i18n.ts missing"

# 2. Verify next-intl import in next.config.ts
grep -q "createNextIntlPlugin" next.config.ts && echo "✓ next-intl import found" || echo "✗ next-intl import missing"

# 3. Verify withNextIntl in export
grep -q "withNextIntl" next.config.ts && echo "✓ withNextIntl found" || echo "✗ withNextIntl missing"

# 4. TypeScript check
npx tsc --noEmit && echo "✓ TypeScript OK" || echo "✗ TypeScript errors"

# 5. Build check
npm run build && echo "✓ Build OK" || echo "✗ Build failed"
```

---

## Dependencies Summary

### Upstream Dependencies (Required Before This Task)

| Task ID | Description | Verification |
|---------|-------------|--------------|
| 2.1 | Install next-intl package | `npm list next-intl` |
| 2.1 | Create messages directory | `ls messages/*.json` |

### Downstream Dependencies (Blocked Until This Task Completes)

| Task ID | Description | Why Blocked |
|---------|-------------|-------------|
| 2.4 | Create IntlProvider wrapper | Requires plugin configured |
| 2.6 | Verify sample component | Requires full i18n stack |
| 5.2 | Update middleware | Plugin must be active |

---

## Troubleshooting Guide

### Problem: `Cannot find module 'next-intl/plugin'`

**Cause:** next-intl package not installed.

**Solution:**
```bash
npm install next-intl
```

### Problem: Build fails with "Cannot find module './messages/${locale}.json'"

**Cause:** Messages directory or locale files do not exist.

**Solution:**
1. Create the messages directory: `mkdir -p messages`
2. Create at least `messages/en.json` with minimal content:
```json
{
  "common": {
    "loading": "Loading..."
  }
}
```

### Problem: TypeScript error in `requestLocale` handling

**Cause:** Type inference issue with async locale handling.

**Solution:** Ensure the type assertion is correct:
```typescript
if (!locale || !locales.includes(locale as Locale)) {
```

### Problem: Sentry source maps not uploading

**Cause:** Plugin composition order may affect Sentry build step.

**Solution:** Verify `withSentryConfig` is the outermost wrapper. If issues persist, check Sentry documentation for Next.js 15 compatibility.

### Problem: Development server very slow to start

**Cause:** First-time compilation with i18n plugin.

**Solution:** This is normal for first start. Subsequent starts should be faster. Consider using `--turbopack` flag (already in `npm run dev` script).

---

## Success Criteria Summary

| Criterion | Metric |
|-----------|--------|
| i18n.ts file created | File exists at project root |
| next.config.ts updated | Contains next-intl plugin wrapper |
| TypeScript compiles | `npx tsc --noEmit` exits 0 |
| Build succeeds | `npm run build` exits 0 |
| Dev server starts | `npm run dev` starts without errors |
| Existing pages work | Login and dashboard pages load |
| Sentry works | No Sentry-related errors |

---

## Estimated Time Breakdown

| Task | Time |
|------|------|
| 2.3.1: Create i18n.ts | 5 min |
| 2.3.2: Update next.config.ts | 5 min |
| 2.3.3: Verify TypeScript | 3 min |
| 2.3.4: Verify Build | 5 min |
| 2.3.5: Verify Dev Server | 5 min |
| 2.3.6: Verify Sentry | 2 min |
| **Total** | **~25 min** |

---

## References

- [next-intl Plugin Configuration](https://next-intl-docs.vercel.app/docs/getting-started/app-router)
- [next-intl with Sentry](https://next-intl-docs.vercel.app/docs/environments/sentry)
- [Sentry Next.js Plugin Composition](https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/)
- Overview Document: `/docs/REQ-231-update-nextconfigts-for-i18n-overview.md`
- Implementation Plan: `/docs/prd/Plan-110-L10N-Epic1-Foundation.md`

---

*Document generated for FAQBNB Localization Epic 1 - Foundation, Phase 2, Task 2.3*
