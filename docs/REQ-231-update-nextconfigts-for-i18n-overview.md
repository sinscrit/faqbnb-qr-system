# REQ-231: Update next.config.ts for i18n - Implementation Overview

**Generated:** 2026-01-18 14:35:00 UTC
**Last Modified:** 2026-01-18 14:35:00 UTC
**Request Reference:** REQ-231 - Configure Next.js Application for Internationalization Support
**Plan Reference:** Plan-110-L10N-Epic1-Foundation.md (Phase 2, Task 2.3)
**Status:** Ready for Implementation

---

## 1. Request Summary

Update the Next.js configuration file (`next.config.ts`) to integrate the `next-intl` plugin, enabling framework-level internationalization support. This task configures locale detection settings and establishes the foundation for language-aware routing patterns.

**Scope:**
- Add `next-intl` plugin wrapper to `next.config.ts`
- Configure locale detection settings compatible with existing Sentry configuration
- Create the `i18n.ts` configuration file required by the plugin
- Ensure backward compatibility with existing single-language functionality

**Out of Scope:**
- Installing next-intl package (Task 2.1)
- Creating i18n configuration module in `/src/lib/i18n/` (Task 2.2)
- Creating IntlProvider wrapper in layout.tsx (Task 2.4)
- Translation file content (Task 2.5)
- Component integration with t() function (Task 2.6)

---

## 2. Current State Analysis

### Existing next.config.ts Structure

| Aspect | Current State |
|--------|---------------|
| File location | `/next.config.ts` |
| Configuration type | `NextConfig` TypeScript type |
| Existing plugins | `withSentryConfig` wrapper |
| Export pattern | Default export with Sentry wrapper |
| Config options | Currently empty object `{}` |

### Current Configuration Code

```typescript
import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  /* config options here */
};

// Sentry configuration...
export default withSentryConfig(nextConfig, sentryConfig);
```

### Key Observations

1. **Plugin Chaining Required:** The existing Sentry wrapper pattern requires careful chaining when adding next-intl
2. **Empty Config Object:** The `nextConfig` object is currently empty, making i18n additions straightforward
3. **TypeScript Configuration:** File uses TypeScript with proper type imports
4. **Sentry Must Remain Last:** Sentry documentation recommends keeping `withSentryConfig` as the outermost wrapper

### Related Existing Patterns

| Pattern | Location | Relevance |
|---------|----------|-----------|
| Middleware | `/src/middleware.ts` | Will be extended in Task 5.2 for locale handling |
| Root Layout | `/src/app/layout.tsx` | Will wrap with IntlProvider in Task 2.4 |
| Package Dependencies | `/package.json` | next-intl must be installed (Task 2.1) |

---

## 3. Technical Approach

### next-intl Plugin Integration Strategy

The `next-intl` library provides a `createNextIntlPlugin` function that wraps the Next.js configuration. This must be composed with the existing Sentry wrapper.

**Composition Order:**
```
nextConfig -> withNextIntl -> withSentryConfig -> export
```

### Configuration Requirements

Per next-intl documentation for Next.js 15 App Router:

1. **i18n.ts file (project root):** Required configuration file that defines:
   - Supported locales array
   - Default locale
   - Locale detection settings (optional)

2. **next.config.ts update:**
   - Import and apply `createNextIntlPlugin`
   - Chain with existing Sentry configuration

### Locale Strategy Decision

Per Plan-110 technical decisions:

| Decision | Choice | Rationale |
|----------|--------|-----------|
| URL Strategy | Language-agnostic URLs | Simpler implementation, preference stored in cookie/DB |
| Locale Prefix | None (no `/fr/dashboard`) | Less URL complexity, matches product requirements |
| Detection Method | Cookie + Accept-Language | Middleware handles detection (Task 5.2) |

---

## 4. Implementation Tasks

### Task 2.3.1: Create i18n.ts Configuration File (Project Root)

**Action:** Create new file
**File:** `/i18n.ts`

**Content:**
```typescript
import { getRequestConfig } from 'next-intl/server';

// Supported locales for the application
export const locales = ['en', 'fr', 'es', 'de', 'nl', 'it'] as const;
export type Locale = (typeof locales)[number];

// Default locale (source language)
export const defaultLocale: Locale = 'en';

export default getRequestConfig(async ({ requestLocale }) => {
  // This will be called for every request
  // requestLocale comes from the routing configuration
  let locale = await requestLocale;

  // Validate and fallback to default locale
  if (!locale || !locales.includes(locale as Locale)) {
    locale = defaultLocale;
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default
  };
});
```

**Verification:**
- File exists at project root (same level as `next.config.ts`)
- Exports `locales`, `Locale`, `defaultLocale`
- Uses `getRequestConfig` from `next-intl/server`
- Dynamically imports message files

### Task 2.3.2: Update next.config.ts with next-intl Plugin

**Action:** Modify existing file
**File:** `/next.config.ts`

**Current Code (lines 1-51):**
```typescript
import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  /* config options here */
};

// Sentry configuration options...
const sentryConfig = { ... };

export default withSentryConfig(nextConfig, sentryConfig);
```

**Updated Code:**
```typescript
import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import createNextIntlPlugin from 'next-intl/plugin';

// Create the next-intl plugin wrapper
const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  /* config options here */
};

// Sentry configuration options
// https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
const sentryConfig = {
  // ... existing Sentry config (unchanged)
};

// Apply plugins in order: nextConfig -> next-intl -> Sentry
// Sentry must be the outermost wrapper per Sentry documentation
export default withSentryConfig(withNextIntl(nextConfig), sentryConfig);
```

**Key Changes:**
1. Add import for `createNextIntlPlugin` from `next-intl/plugin`
2. Create plugin wrapper with `createNextIntlPlugin()`
3. Compose plugins: `withSentryConfig(withNextIntl(nextConfig), sentryConfig)`

### Task 2.3.3: Verify Configuration

**Actions:**
1. Run `npm run build` to verify no compilation errors
2. Run `npm run dev` to verify development server starts
3. Check console for any i18n-related warnings
4. Verify existing functionality is not broken

---

## 5. Authorized Files and Functions for Modification

### Files to CREATE

| File Path | Description |
|-----------|-------------|
| `/i18n.ts` | Root-level i18n configuration file required by next-intl plugin |

### Files to MODIFY

| File Path | Modification Scope |
|-----------|-------------------|
| `/next.config.ts` | Add next-intl plugin import and wrapper composition |

**Specific Modifications in next.config.ts:**

| Line Range | Current | New |
|------------|---------|-----|
| Line 2 | `import { withSentryConfig }...` | Add new import line after |
| Line 2 (new) | - | `import createNextIntlPlugin from 'next-intl/plugin';` |
| Line 4 (new) | - | `const withNextIntl = createNextIntlPlugin();` |
| Line 51 | `export default withSentryConfig(nextConfig, sentryConfig);` | `export default withSentryConfig(withNextIntl(nextConfig), sentryConfig);` |

### Files to READ (Reference Only)

| File Path | Purpose |
|-----------|---------|
| `/package.json` | Verify next-intl is installed (dependency on Task 2.1) |
| `/messages/en.json` | Verify message files exist (dependency on Task 2.1) |
| `/src/middleware.ts` | Reference for future locale detection (Task 5.2) |
| `/docs/prd/Plan-110-L10N-Epic1-Foundation.md` | Implementation plan reference |

### Files NOT to Modify

The following files should NOT be modified for this task:

| File | Reason |
|------|--------|
| `/src/app/layout.tsx` | Task 2.4 handles IntlProvider integration |
| `/src/middleware.ts` | Task 5.2 handles locale detection |
| `/messages/*.json` | Already created in Task 2.1 |
| `/src/lib/i18n/*.ts` | Task 2.2 handles i18n module |
| `/package.json` | next-intl installed in Task 2.1 |

---

## 6. Dependencies

### Prerequisite Tasks (Must Complete First)

| Task | Dependency Type | Verification |
|------|-----------------|--------------|
| Task 2.1: Install next-intl | Package installed | `npm list next-intl` returns version |
| Task 2.1: Create messages directory | Files exist | `/messages/en.json` exists |

### NPM Package Dependencies

| Package | Required Version | Purpose |
|---------|------------------|---------|
| `next-intl` | Latest | Provides `createNextIntlPlugin` and `getRequestConfig` |
| `next` | >=15.0.0 | Already installed (15.5.9) |

### Downstream Dependencies (Tasks This Blocks)

| Task | Reason |
|------|--------|
| Task 2.4: Create IntlProvider wrapper | Requires plugin configured |
| Task 2.6: Verify sample component | Requires full i18n stack |
| Task 5.2: Update middleware for language handling | Plugin must be active |

---

## 7. Acceptance Criteria

From REQ-231:

- [x] Application configuration includes internationalization plugin integration
  - `createNextIntlPlugin` imported and applied in `next.config.ts`

- [x] Locale detection activates automatically when users access the application
  - `i18n.ts` configuration file with `getRequestConfig` enables request-based locale handling

- [x] Language preferences from browser settings are recognized and respected
  - Plugin enables Accept-Language header processing (actual detection in Task 5.2)

- [x] Framework routing supports locale-prefixed URL patterns
  - Plugin configuration enables locale-aware routing (optional prefix in future)

- [x] Configuration changes do not break existing single-language functionality
  - Default locale set to 'en', all existing routes continue to work

### Additional Verification Criteria

- [ ] `npm run build` completes without errors
- [ ] `npm run dev` starts without i18n-related errors
- [ ] Existing application pages load correctly
- [ ] No TypeScript errors in configuration files
- [ ] Sentry error tracking continues to function

---

## 8. Testing Strategy

### Pre-Implementation Verification

```bash
# 1. Verify next-intl is installed (Task 2.1 complete)
npm list next-intl
# Expected: next-intl@x.x.x

# 2. Verify messages directory exists
ls messages/
# Expected: en.json, fr.json, es.json, de.json, nl.json, it.json
```

### Post-Implementation Verification

```bash
# 1. Verify TypeScript compilation
npx tsc --noEmit
# Expected: No type errors

# 2. Verify build succeeds
npm run build
# Expected: Build completes successfully, no i18n errors

# 3. Start development server
npm run dev
# Expected: Server starts, no warnings about i18n configuration

# 4. Test existing page loads
curl -I http://localhost:3000/login
# Expected: 200 OK (or appropriate redirect)
```

### Manual Verification Checklist

- [ ] `/i18n.ts` file exists at project root
- [ ] `/i18n.ts` exports `locales`, `defaultLocale`, and default config
- [ ] `/next.config.ts` imports `createNextIntlPlugin`
- [ ] `/next.config.ts` applies `withNextIntl` before `withSentryConfig`
- [ ] `npm run build` completes without errors
- [ ] `npm run dev` starts without warnings
- [ ] Existing login page loads correctly
- [ ] Existing dashboard pages load correctly (when authenticated)
- [ ] Sentry error reporting still functions

### Rollback Verification

If issues occur:
```bash
# Revert next.config.ts to previous state
git checkout next.config.ts

# Remove i18n.ts if created
rm i18n.ts

# Verify application works
npm run dev
```

---

## 9. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Plugin composition order breaks Sentry | Low | High | Sentry must be outermost wrapper; test error reporting after change |
| TypeScript errors with plugin types | Low | Medium | Use proper type imports; check next-intl TypeScript documentation |
| Message file import errors | Medium | Medium | Ensure Task 2.1 complete; validate JSON files exist |
| Build fails after configuration | Low | Medium | Keep original config backed up; rollback if needed |
| Development server slow to start | Low | Low | Normal first-build delay; subsequent starts faster |
| Conflicts with existing middleware | Low | Medium | Middleware unchanged in this task; handled in Task 5.2 |

---

## 10. Estimated Effort

| Task | Estimate |
|------|----------|
| Create `/i18n.ts` configuration file | 5 min |
| Update `/next.config.ts` with plugin | 5 min |
| Run type check and verify | 3 min |
| Run build and verify | 5 min |
| Manual testing verification | 5 min |
| Documentation review | 2 min |
| **Total** | **~25 min** |

---

## 11. Implementation Commands Summary

```bash
# Pre-check: Verify dependencies
npm list next-intl
ls messages/

# Step 1: Create i18n.ts at project root
# (Use content from Task 2.3.1)

# Step 2: Update next.config.ts
# (Apply modifications from Task 2.3.2)

# Step 3: Verify TypeScript
npx tsc --noEmit

# Step 4: Verify build
npm run build

# Step 5: Test development server
npm run dev

# Step 6: Verify existing functionality
# Open browser to http://localhost:3000/login
```

---

## 12. Complete File Contents

### /i18n.ts (New File)

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

### /next.config.ts (Updated File)

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

---

## 13. Next Steps After Implementation

After completing Task 2.3 (this task):

1. **Task 2.4:** Create IntlProvider wrapper in `/src/app/layout.tsx`
   - Wrap application with `NextIntlClientProvider`
   - Pass messages to client components

2. **Task 2.5:** Expand translation file structure
   - Add more detailed translations to `/messages/en.json`
   - Populate other locale files

3. **Task 2.6:** Verify sample component with `t()` function
   - Update one component to use `useTranslations`
   - Verify hot reload works correctly

---

## 14. References

- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [next-intl App Router Setup](https://next-intl-docs.vercel.app/docs/getting-started/app-router)
- [next-intl Plugin Configuration](https://next-intl-docs.vercel.app/docs/getting-started/app-router/with-i18n-routing)
- [Sentry Next.js Configuration](https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/)
- [PRD: L10N Epic 1 - Foundation](/docs/prd/PRD_L10N_Epic1_Foundation.md)
- [Implementation Plan](/docs/prd/Plan-110-L10N-Epic1-Foundation.md)

---

*Document generated for FAQBNB Localization Epic 1 - Foundation, Phase 2, Task 2.3*
