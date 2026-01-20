# REQ-E02-007: Extract Loading State Messages - Implementation Overview

*Generated: 2026-01-20 17:12:00 UTC*
*Last Modified: 2026-01-20 17:12:00 UTC*

## Reference

- **Request**: REQ-E02-007 (Extract Loading State Messages)
- **Source**: docs/gen_requests_epic2.md
- **Implementation Plan**: docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md
- **Type**: Enhancement
- **Phase**: 2H (Common & Shared Components)
- **Task ID**: 2H.7
- **Size**: M (Medium)
- **Epic**: Localization Epic 2 - Static UI Translation
- **Depends On**:
  - Epic 1 (L10N Foundation - next-intl setup)
  - REQ-E02-001 (Common Namespace Structure - must be completed first)

## Summary

Extract all hardcoded loading state messages displayed during data fetching, processing, or content loading. Replace them with references to localized translation keys. This task affects approximately 40+ locations across various components where loading messages, spinner text, skeleton placeholder labels, and processing status messages are displayed. The estimated ~30 distinct loading state strings need to be migrated to the i18n `common.loading` namespace.

## Goals

1. Identify and catalog all loading state messages across the codebase (~40 locations)
2. Extract all hardcoded loading strings to the `common.loading` namespace
3. Replace hardcoded strings with `useTranslations()` hook references
4. Ensure loading states display translated text based on user's language preference
5. Maintain accessibility features (ARIA labels, screen reader text) with translated content
6. Follow consistent naming conventions for translation keys
7. Update reusable loading components to support translations

## Context from Implementation Plan

### Existing Infrastructure (Epic 1 Foundation)

The localization foundation from Epic 1 is already in place:

| Component | Location | Status |
|-----------|----------|--------|
| next-intl package | `package.json` | Installed (v4.7.0) |
| i18n config | `/src/lib/i18n/config.ts` | Configured |
| IntlProvider | `/src/app/layout.tsx` | Integrated |
| Translation files | `/messages/*.json` | 6 languages (en, fr, es, de, nl, it) |
| useTranslations hook | next-intl | Available |
| Language detection | `/src/lib/i18n/language-detection.ts` | Configured |

### Existing Common Namespace

The `/messages/en.json` file already contains a basic `common.loading` key:
```json
{
  "common": {
    "loading": "Loading..."
  }
}
```

This task expands this into a full `common.loading` sub-namespace with context-specific loading messages.

### Estimated Scope

- **Files to modify**: ~35 component/page files
- **Distinct strings**: ~30 loading state messages
- **New translation keys needed**: ~30
- **Categories**: Generic, Authentication, Pages, Components, Media, Data Processing

## Current Loading State Patterns in Codebase

### Pattern Analysis

The codebase uses four primary patterns for displaying loading states:

#### Pattern 1: Reusable LoadingIndicator Component

A unified loading spinner component in SimpleDashboard:

```tsx
// Current: src/components/SimpleDashboard/LoadingIndicator.tsx
export function LoadingIndicator({
  size = 'md',
  label = 'Loading',  // <-- Default hardcoded label
  color = 'brand',
  className,
}: LoadingIndicatorProps) {
  return (
    <span role="status" aria-label={label}>
      <Loader2 className="animate-spin" />
      <span className="sr-only">{label}</span>
    </span>
  );
}
```

**Usage locations:**
- Various dashboard components
- Widget components

#### Pattern 2: LoadingState Component (ItemManager)

A skeleton-based loading component for item lists:

```tsx
// Current: src/components/ItemManager/components/shared/LoadingState.tsx
<div
  role="status"
  aria-label="Loading items"  // <-- Hardcoded aria-label
  aria-busy="true"
>
  <span className="sr-only">Loading items, please wait...</span>  // <-- Hardcoded sr text
  {/* Skeleton cards */}
</div>
```

**Usage locations:**
- `/src/components/ItemManager/ItemManager.tsx`
- Various item management views

#### Pattern 3: Inline Spinner with Message

Loading spinners with text rendered directly in component JSX:

```tsx
// Current: src/app/dashboard/layout.tsx
<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
<p className="text-gray-600">Loading dashboard...</p>  // <-- Hardcoded message
```

**Usage locations:**
- `/src/app/login/page.tsx` - "Loading login page..."
- `/src/app/register/page.tsx` - "Loading registration page..."
- `/src/app/dashboard/layout.tsx` - "Loading dashboard..."
- `/src/app/dashboard2/layout.tsx` - "Loading dashboard..."
- `/src/app/admin/layout.tsx` - "Loading admin panel..."
- Many more page components

#### Pattern 4: Button Loading State

Buttons showing loading state during async operations:

```tsx
// Current: src/components/GoogleOAuthButton.tsx
<button disabled={isLoading}>
  {isLoading ? (
    <>
      <Loader2 className="animate-spin" />
      <span>Connecting to Google...</span>  // <-- Hardcoded message
    </>
  ) : (
    <span>Continue with Google</span>
  )}
</button>
```

**Usage locations:**
- `/src/components/GoogleOAuthButton.tsx`
- Various form submission buttons

### Current Loading State Message Inventory

#### Generic Loading Messages (~8 strings)

| Location | Message |
|----------|---------|
| `/src/components/SimpleDashboard/LoadingIndicator.tsx:63` | "Loading" (default label) |
| `/src/components/ItemManager/components/shared/LoadingState.tsx:111,129` | "Loading items" (aria-label) |
| `/src/components/ItemManager/components/shared/LoadingState.tsx:116,138` | "Loading items, please wait..." (sr-only) |
| Various pages | "Loading..." (generic fallback) |

#### Page Loading Messages (~15 strings)

| Location | Message |
|----------|---------|
| `/src/app/login/page.tsx:11` | "Loading login page..." |
| `/src/app/register/page.tsx:11` | "Loading registration page..." |
| `/src/app/dashboard/page.tsx:31` | "Loading dashboard..." |
| `/src/app/dashboard/layout.tsx:126` | "Loading dashboard..." |
| `/src/app/dashboard2/layout.tsx:81` | "Loading dashboard..." |
| `/src/app/admin/layout.tsx:161` | "Loading admin panel..." |
| `/src/app/admin/system/layout.tsx:32` | "Loading system admin panel..." |
| `/src/app/user/layout.tsx:116` | "Loading dashboard..." |
| `/src/app/dashboard/analytics/page.tsx:110` | "Loading analytics..." |
| `/src/app/dashboard/items/new/page.tsx:179` | "Loading item creation..." |
| `/src/app/dashboard/properties/page.tsx:203` | "Loading properties management..." |
| `/src/app/dashboard/properties/new/page.tsx:175` | "Loading property creation..." |
| `/src/app/dashboard/items/[publicId]/edit/page.tsx:189` | "Loading item..." |
| `/src/app/dashboard2/items/[publicId]/edit/page.tsx:188` | "Loading item..." |
| `/src/app/dashboard/properties/[propertyId]/page.tsx:211` | "Loading property..." |
| `/src/app/dashboard/properties/[propertyId]/edit/page.tsx:217` | "Loading property..." |

#### Component Loading Messages (~10 strings)

| Location | Message |
|----------|---------|
| `/src/components/ItemsManagement.tsx:177` | "Loading items..." |
| `/src/app/dashboard2/items/page.tsx:215` | "Loading items..." |
| `/src/components/PropertySelector.tsx:197,307` | "Loading properties..." |
| `/src/app/admin/items/new/page.tsx:107` | "Loading properties..." |
| `/src/components/UserAnalyticsTable.tsx:130` | "Loading user analytics..." |
| `/src/components/AccessRequestTable.tsx:266` | "Loading access requests..." |
| `/src/app/dashboard2/instructions/page.tsx:259` | "Loading guides..." |
| `/src/app/print/qr-codes/[propertyId]/page.tsx:47` | "Loading QR codes..." |
| `/src/app/dashboard2/instructions/[articleId]/edit/page.tsx:209` | "Loading article data..." |

#### Media Loading Messages (~4 strings)

| Location | Message |
|----------|---------|
| `/src/components/ItemCapture/editors/VideoTrimmer.tsx:543` | "Loading video..." |
| `/src/components/ItemCapture/editors/ImageCropper.tsx:400` | "Loading image..." |
| `/src/components/ItemCapture/editors/ImageRotator.tsx:371` | "Loading image..." |
| `/src/components/ItemManager/components/ItemPreview/viewers/PDFViewer.tsx:357` | "Loading PDF..." |

#### Authentication Loading Messages (~6 strings)

| Location | Message |
|----------|---------|
| `/src/components/AuthGuard.tsx:24` | "Authenticating..." (LoadingSpinner default) |
| `/src/components/AuthGuard.tsx:159,314,331,361` | "Checking permissions..." |
| `/src/components/AuthGuard.tsx:331` | "Checking system admin permissions..." |
| `/src/components/AuthGuard.tsx:30` | "Please wait while we verify your credentials" |
| `/src/app/login/LoginPageContent.tsx:165` | "Completing authentication..." |
| `/src/app/login/LoginPageContent.tsx:165` | "Loading authentication..." |

#### OAuth/External Service Messages (~2 strings)

| Location | Message |
|----------|---------|
| `/src/components/GoogleOAuthButton.tsx:116` | "Connecting to Google..." |
| `/src/app/login/LoginPageContent.tsx:134` | "Completing Google sign-in..." |

#### ARIA Accessibility Labels (~8 strings)

| Location | Message |
|----------|---------|
| `/src/components/ItemManager/components/shared/LoadingState.tsx:111,129` | "Loading items" |
| `/src/components/InstructionsTable/GuideGrid.tsx:76` | "Loading guides" |
| `/src/components/ItemCapture/components/steps/MediaEditorStep.tsx:79` | "Loading editor" |
| `/src/components/ItemCreationWorkflow/components/shared/ContentPreview.tsx:373` | "Loading content preview" |
| `/src/components/ItemManager/components/shared/EngagementIndicator.tsx:181` | "Loading engagement indicator" |
| `/src/components/ItemManager/components/shared/VisitCountBadge.tsx:91` | "Loading view count" |
| `/src/components/ItemManager/components/shared/ReactionSummary.tsx:101` | "Loading reactions" |
| `/src/components/ItemCapture/components/steps/TextEditorStep.tsx:31` | "Loading preview..." |

## Translation Namespace Structure

### Namespace: `common.loading`

```json
{
  "common": {
    "loading": {
      "generic": {
        "loading": "Loading...",
        "pleaseWait": "Please wait...",
        "loadingData": "Loading data...",
        "processing": "Processing..."
      },
      "pages": {
        "login": "Loading login page...",
        "registration": "Loading registration page...",
        "dashboard": "Loading dashboard...",
        "adminPanel": "Loading admin panel...",
        "systemAdmin": "Loading system admin panel...",
        "analytics": "Loading analytics...",
        "itemCreation": "Loading item creation...",
        "propertiesManagement": "Loading properties management...",
        "propertyCreation": "Loading property creation...",
        "item": "Loading item...",
        "property": "Loading property..."
      },
      "components": {
        "items": "Loading items...",
        "properties": "Loading properties...",
        "userAnalytics": "Loading user analytics...",
        "accessRequests": "Loading access requests...",
        "guides": "Loading guides...",
        "qrCodes": "Loading QR codes...",
        "articleData": "Loading article data..."
      },
      "media": {
        "video": "Loading video...",
        "image": "Loading image...",
        "pdf": "Loading PDF...",
        "preview": "Loading preview..."
      },
      "auth": {
        "authenticating": "Authenticating...",
        "checkingPermissions": "Checking permissions...",
        "checkingSystemPermissions": "Checking system admin permissions...",
        "verifyingCredentials": "Please wait while we verify your credentials",
        "completingAuth": "Completing authentication...",
        "loadingAuth": "Loading authentication..."
      },
      "oauth": {
        "connectingGoogle": "Connecting to Google...",
        "completingGoogleSignIn": "Completing Google sign-in..."
      },
      "aria": {
        "loadingItems": "Loading items",
        "loadingItemsWait": "Loading items, please wait...",
        "loadingGuides": "Loading guides",
        "loadingEditor": "Loading editor",
        "loadingContentPreview": "Loading content preview",
        "loadingEngagement": "Loading engagement indicator",
        "loadingViewCount": "Loading view count",
        "loadingReactions": "Loading reactions"
      },
      "status": {
        "saving": "Saving...",
        "deleting": "Deleting...",
        "uploading": "Uploading...",
        "downloading": "Downloading...",
        "fetching": "Fetching data..."
      }
    }
  }
}
```

## Implementation Order

### Step 1: Expand Loading Namespace (Priority: High)

Expand the existing `common.loading` string in `/messages/en.json` into the full namespace structure above.

### Step 2: Update Reusable Loading Components (Priority: High)

These are the foundation components used across the application:

1. **`/src/components/SimpleDashboard/LoadingIndicator.tsx`** - Update default label to use translation, add hook
2. **`/src/components/ItemManager/components/shared/LoadingState.tsx`** - Replace hardcoded aria-label and sr-only text

### Step 3: Update Layout/Page Loading States (Priority: High)

3. **`/src/app/login/page.tsx`** - Replace "Loading login page..."
4. **`/src/app/register/page.tsx`** - Replace "Loading registration page..."
5. **`/src/app/dashboard/layout.tsx`** - Replace "Loading dashboard..."
6. **`/src/app/dashboard2/layout.tsx`** - Replace "Loading dashboard..."
7. **`/src/app/admin/layout.tsx`** - Replace "Loading admin panel..."
8. **`/src/app/admin/system/layout.tsx`** - Replace "Loading system admin panel..."
9. **`/src/app/user/layout.tsx`** - Replace "Loading dashboard..."

### Step 4: Update Dashboard Page Loading States (Priority: High)

10. **`/src/app/dashboard/page.tsx`** - Replace "Loading dashboard..."
11. **`/src/app/dashboard/analytics/page.tsx`** - Replace "Loading analytics..."
12. **`/src/app/dashboard/items/new/page.tsx`** - Replace "Loading item creation..."
13. **`/src/app/dashboard/properties/page.tsx`** - Replace "Loading properties management..."
14. **`/src/app/dashboard/properties/new/page.tsx`** - Replace "Loading property creation..."

### Step 5: Update Item/Property Detail Page Loading States (Priority: Medium)

15. **`/src/app/dashboard/items/[publicId]/edit/page.tsx`** - Replace "Loading item..."
16. **`/src/app/dashboard2/items/[publicId]/edit/page.tsx`** - Replace "Loading item..."
17. **`/src/app/dashboard/properties/[propertyId]/page.tsx`** - Replace "Loading property..."
18. **`/src/app/dashboard/properties/[propertyId]/edit/page.tsx`** - Replace "Loading property..."

### Step 6: Update Component Loading States (Priority: Medium)

19. **`/src/components/ItemsManagement.tsx`** - Replace "Loading items..."
20. **`/src/app/dashboard2/items/page.tsx`** - Replace "Loading items..."
21. **`/src/components/PropertySelector.tsx`** - Replace "Loading properties..."
22. **`/src/components/UserAnalyticsTable.tsx`** - Replace "Loading user analytics..."
23. **`/src/components/AccessRequestTable.tsx`** - Replace "Loading access requests..."
24. **`/src/app/dashboard2/instructions/page.tsx`** - Replace "Loading guides..."
25. **`/src/app/dashboard2/instructions/[articleId]/edit/page.tsx`** - Replace "Loading article data..."

### Step 7: Update Authentication Components (Priority: Medium)

26. **`/src/components/AuthGuard.tsx`** - Replace all authentication loading messages
27. **`/src/app/login/LoginPageContent.tsx`** - Replace authentication loading messages

### Step 8: Update OAuth Components (Priority: Medium)

28. **`/src/components/GoogleOAuthButton.tsx`** - Replace "Connecting to Google..."

### Step 9: Update Media Loading Components (Priority: Lower)

29. **`/src/components/ItemCapture/editors/VideoTrimmer.tsx`** - Replace "Loading video..."
30. **`/src/components/ItemCapture/editors/ImageCropper.tsx`** - Replace "Loading image..."
31. **`/src/components/ItemCapture/editors/ImageRotator.tsx`** - Replace "Loading image..."
32. **`/src/components/ItemManager/components/ItemPreview/viewers/PDFViewer.tsx`** - Replace "Loading PDF..."

### Step 10: Update ARIA Labels (Priority: Medium)

33. **`/src/components/InstructionsTable/GuideGrid.tsx`** - Replace aria-label
34. **`/src/components/ItemCapture/components/steps/MediaEditorStep.tsx`** - Replace aria-label
35. **`/src/components/ItemCreationWorkflow/components/shared/ContentPreview.tsx`** - Replace aria-label
36. **`/src/components/ItemManager/components/shared/EngagementIndicator.tsx`** - Replace aria-label
37. **`/src/components/ItemManager/components/shared/VisitCountBadge.tsx`** - Replace aria-label
38. **`/src/components/ItemManager/components/shared/ReactionSummary.tsx`** - Replace aria-label
39. **`/src/components/ItemCapture/components/steps/TextEditorStep.tsx`** - Replace aria-label

## Authorized Files and Functions for Modification

### Translation Files to Modify

#### `/messages/en.json`

- **Purpose**: English translation source file
- **Modification**:
  - Expand `common.loading` from single string to full namespace
  - Add all sub-categories (generic, pages, components, media, auth, oauth, aria, status)

#### `/messages/fr.json`, `/messages/es.json`, `/messages/de.json`, `/messages/nl.json`, `/messages/it.json`

- **Purpose**: Non-English translation files
- **Modification**: Add same keys as en.json (with English placeholders initially)
- **Note**: Actual translations generated in separate task (2H.10)

### Component Files to Modify

#### Reusable Loading Components

| File | Modifications |
|------|---------------|
| `/src/components/SimpleDashboard/LoadingIndicator.tsx` | Add `useTranslations('common.loading')` hook; update default `label` prop to use `t('generic.loading')` |
| `/src/components/ItemManager/components/shared/LoadingState.tsx` | Add `useTranslations('common.loading')` hook; replace `aria-label="Loading items"` with `t('aria.loadingItems')`; replace sr-only text with `t('aria.loadingItemsWait')` |

#### Layout Components

| File | Modifications |
|------|---------------|
| `/src/app/login/page.tsx` | Add `useTranslations('common.loading')` hook; replace "Loading login page..." with `t('pages.login')` |
| `/src/app/register/page.tsx` | Add `useTranslations('common.loading')` hook; replace "Loading registration page..." with `t('pages.registration')` |
| `/src/app/dashboard/layout.tsx` | Add `useTranslations('common.loading')` hook; replace "Loading dashboard..." with `t('pages.dashboard')` |
| `/src/app/dashboard2/layout.tsx` | Add `useTranslations('common.loading')` hook; replace "Loading dashboard..." with `t('pages.dashboard')` |
| `/src/app/admin/layout.tsx` | Add `useTranslations('common.loading')` hook; replace "Loading admin panel..." with `t('pages.adminPanel')` |
| `/src/app/admin/system/layout.tsx` | Add `useTranslations('common.loading')` hook; replace "Loading system admin panel..." with `t('pages.systemAdmin')` |
| `/src/app/user/layout.tsx` | Add `useTranslations('common.loading')` hook; replace "Loading dashboard..." with `t('pages.dashboard')` |

#### Dashboard Page Components

| File | Modifications |
|------|---------------|
| `/src/app/dashboard/page.tsx` | Add `useTranslations('common.loading')` hook; replace "Loading dashboard..." with `t('pages.dashboard')` |
| `/src/app/dashboard/analytics/page.tsx` | Add `useTranslations('common.loading')` hook; replace "Loading analytics..." with `t('pages.analytics')` |
| `/src/app/dashboard/items/new/page.tsx` | Add `useTranslations('common.loading')` hook; replace "Loading item creation..." with `t('pages.itemCreation')` |
| `/src/app/dashboard/properties/page.tsx` | Add `useTranslations('common.loading')` hook; replace "Loading properties management..." with `t('pages.propertiesManagement')` |
| `/src/app/dashboard/properties/new/page.tsx` | Add `useTranslations('common.loading')` hook; replace "Loading property creation..." with `t('pages.propertyCreation')` |

#### Item/Property Detail Pages

| File | Modifications |
|------|---------------|
| `/src/app/dashboard/items/[publicId]/edit/page.tsx` | Add `useTranslations('common.loading')` hook; replace "Loading item..." with `t('pages.item')` |
| `/src/app/dashboard2/items/[publicId]/edit/page.tsx` | Add `useTranslations('common.loading')` hook; replace "Loading item..." with `t('pages.item')` |
| `/src/app/dashboard/properties/[propertyId]/page.tsx` | Add `useTranslations('common.loading')` hook; replace "Loading property..." with `t('pages.property')` |
| `/src/app/dashboard/properties/[propertyId]/edit/page.tsx` | Add `useTranslations('common.loading')` hook; replace "Loading property..." with `t('pages.property')` |

#### Component Loading States

| File | Modifications |
|------|---------------|
| `/src/components/ItemsManagement.tsx` | Add `useTranslations('common.loading')` hook; replace "Loading items..." with `t('components.items')` |
| `/src/app/dashboard2/items/page.tsx` | Add `useTranslations('common.loading')` hook; replace "Loading items..." with `t('components.items')` |
| `/src/components/PropertySelector.tsx` | Add `useTranslations('common.loading')` hook; replace "Loading properties..." with `t('components.properties')` |
| `/src/components/UserAnalyticsTable.tsx` | Add `useTranslations('common.loading')` hook; replace "Loading user analytics..." with `t('components.userAnalytics')` |
| `/src/components/AccessRequestTable.tsx` | Add `useTranslations('common.loading')` hook; replace "Loading access requests..." with `t('components.accessRequests')` |
| `/src/app/dashboard2/instructions/page.tsx` | Add `useTranslations('common.loading')` hook; replace "Loading guides..." with `t('components.guides')` |
| `/src/app/dashboard2/instructions/[articleId]/edit/page.tsx` | Add `useTranslations('common.loading')` hook; replace "Loading article data..." with `t('components.articleData')` |
| `/src/app/print/qr-codes/[propertyId]/page.tsx` | Add `useTranslations('common.loading')` hook; replace "Loading QR codes..." with `t('components.qrCodes')` |

#### Authentication Components

| File | Modifications |
|------|---------------|
| `/src/components/AuthGuard.tsx` | Add `useTranslations('common.loading')` hook; replace "Authenticating..." with `t('auth.authenticating')`; replace "Checking permissions..." with `t('auth.checkingPermissions')`; replace "Checking system admin permissions..." with `t('auth.checkingSystemPermissions')`; replace "Please wait while we verify your credentials" with `t('auth.verifyingCredentials')` |
| `/src/app/login/LoginPageContent.tsx` | Add `useTranslations('common.loading')` hook; replace "Completing authentication..." with `t('auth.completingAuth')`; replace "Loading authentication..." with `t('auth.loadingAuth')`; replace "Completing Google sign-in..." with `t('oauth.completingGoogleSignIn')` |

#### OAuth Components

| File | Modifications |
|------|---------------|
| `/src/components/GoogleOAuthButton.tsx` | Add `useTranslations('common.loading')` hook; replace "Connecting to Google..." with `t('oauth.connectingGoogle')` |

#### Media Loading Components

| File | Modifications |
|------|---------------|
| `/src/components/ItemCapture/editors/VideoTrimmer.tsx` | Add `useTranslations('common.loading')` hook; replace "Loading video..." with `t('media.video')` |
| `/src/components/ItemCapture/editors/ImageCropper.tsx` | Add `useTranslations('common.loading')` hook; replace "Loading image..." with `t('media.image')` |
| `/src/components/ItemCapture/editors/ImageRotator.tsx` | Add `useTranslations('common.loading')` hook; replace "Loading image..." with `t('media.image')` |
| `/src/components/ItemManager/components/ItemPreview/viewers/PDFViewer.tsx` | Add `useTranslations('common.loading')` hook; replace "Loading PDF..." with `t('media.pdf')` |

#### ARIA Label Updates

| File | Modifications |
|------|---------------|
| `/src/components/InstructionsTable/GuideGrid.tsx` | Add `useTranslations('common.loading')` hook; replace `aria-label="Loading guides"` with `t('aria.loadingGuides')` |
| `/src/components/ItemCapture/components/steps/MediaEditorStep.tsx` | Add `useTranslations('common.loading')` hook; replace `aria-label="Loading editor"` with `t('aria.loadingEditor')` |
| `/src/components/ItemCreationWorkflow/components/shared/ContentPreview.tsx` | Add `useTranslations('common.loading')` hook; replace `aria-label="Loading content preview"` with `t('aria.loadingContentPreview')` |
| `/src/components/ItemManager/components/shared/EngagementIndicator.tsx` | Add `useTranslations('common.loading')` hook; replace `aria-label="Loading engagement indicator"` with `t('aria.loadingEngagement')` |
| `/src/components/ItemManager/components/shared/VisitCountBadge.tsx` | Add `useTranslations('common.loading')` hook; replace `aria-label="Loading view count"` with `t('aria.loadingViewCount')` |
| `/src/components/ItemManager/components/shared/ReactionSummary.tsx` | Add `useTranslations('common.loading')` hook; replace `aria-label="Loading reactions"` with `t('aria.loadingReactions')` |
| `/src/components/ItemCapture/components/steps/TextEditorStep.tsx` | Add `useTranslations('common.loading')` hook; replace `aria-label="Loading preview..."` with `t('media.preview')` |

### Files NOT to Modify

- Console.log messages (for developers only, not user-facing)
- Test files (`__tests__/*.tsx`, `/src/app/test/**`) - Testing handled separately
- API route files (`/src/app/api/*`) - Server-side, different translation approach
- Comments and documentation strings
- Loading messages in SSR/Server Components that don't support client hooks (use getTranslations instead)

## Technical Specifications

### Import Pattern for Client Components

Every client component with loading states must import the useTranslations hook:

```typescript
'use client';
import { useTranslations } from 'next-intl';

function MyComponent() {
  const tLoading = useTranslations('common.loading');

  if (isLoading) {
    return <div>{tLoading('pages.dashboard')}</div>;
  }

  return <div>Content</div>;
}
```

### LoadingIndicator Component Update Pattern

```tsx
// Before
export function LoadingIndicator({
  size = 'md',
  label = 'Loading',  // Hardcoded default
  color = 'brand',
  className,
}: LoadingIndicatorProps) {
  return (
    <span role="status" aria-label={label}>
      <Loader2 className="animate-spin" />
      <span className="sr-only">{label}</span>
    </span>
  );
}

// After
import { useTranslations } from 'next-intl';

export function LoadingIndicator({
  size = 'md',
  label,  // Now optional, defaults to translated string
  color = 'brand',
  className,
}: LoadingIndicatorProps) {
  const tLoading = useTranslations('common.loading');
  const effectiveLabel = label ?? tLoading('generic.loading');

  return (
    <span role="status" aria-label={effectiveLabel}>
      <Loader2 className="animate-spin" />
      <span className="sr-only">{effectiveLabel}</span>
    </span>
  );
}
```

### LoadingState Component Update Pattern

```tsx
// Before
<div
  role="status"
  aria-label="Loading items"
  aria-busy="true"
>
  <span className="sr-only">Loading items, please wait...</span>
  {/* Skeleton cards */}
</div>

// After
import { useTranslations } from 'next-intl';

export function LoadingState({ viewMode = 'grid', ... }: LoadingStateProps) {
  const tLoading = useTranslations('common.loading');

  return (
    <div
      role="status"
      aria-label={tLoading('aria.loadingItems')}
      aria-busy="true"
    >
      <span className="sr-only">{tLoading('aria.loadingItemsWait')}</span>
      {/* Skeleton cards */}
    </div>
  );
}
```

### Page Loading State Update Pattern

```tsx
// Before
export default function DashboardLayout({ children }) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    );
  }
  return children;
}

// After
'use client';
import { useTranslations } from 'next-intl';

export default function DashboardLayout({ children }) {
  const tLoading = useTranslations('common.loading');

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-gray-600">{tLoading('pages.dashboard')}</p>
      </div>
    );
  }
  return children;
}
```

### AuthGuard Update Pattern

```tsx
// Before
function LoadingSpinner({ message = "Authenticating..." }) {
  return (
    <div>
      <p>{message}</p>
      <p className="text-sm">Please wait while we verify your credentials</p>
    </div>
  );
}

// After
import { useTranslations } from 'next-intl';

function LoadingSpinner({ message }: { message?: string }) {
  const tLoading = useTranslations('common.loading');
  const effectiveMessage = message ?? tLoading('auth.authenticating');

  return (
    <div>
      <p>{effectiveMessage}</p>
      <p className="text-sm">{tLoading('auth.verifyingCredentials')}</p>
    </div>
  );
}
```

## Translation Key Naming Convention

Following Plan-111 convention:
```
common.loading.{category}.{variant}
```

### Categories:
- `generic` - Reusable generic loading messages
- `pages` - Page-specific loading messages
- `components` - Component-specific loading messages
- `media` - Media file loading messages
- `auth` - Authentication loading messages
- `oauth` - OAuth/external service loading messages
- `aria` - ARIA accessibility labels
- `status` - Status update messages (saving, deleting, etc.)

### Rules:
- Use camelCase for multi-word keys: `loadingItems`, `checkingPermissions`
- Use descriptive names that indicate context
- ARIA labels should be concise (used in aria-label attribute)
- Screen reader text can be more detailed

### Examples:
| Message | Translation Key |
|---------|-----------------|
| "Loading..." | `common.loading.generic.loading` |
| "Loading dashboard..." | `common.loading.pages.dashboard` |
| "Loading items..." | `common.loading.components.items` |
| "Loading video..." | `common.loading.media.video` |
| "Authenticating..." | `common.loading.auth.authenticating` |
| "Connecting to Google..." | `common.loading.oauth.connectingGoogle` |
| "Loading items" (aria-label) | `common.loading.aria.loadingItems` |
| "Saving..." | `common.loading.status.saving` |

## Success Validation Checklist

### Code Validation
- [ ] All ~40 loading state locations have been identified and updated
- [ ] Each updated component imports `useTranslations` from 'next-intl'
- [ ] No hardcoded English loading text remains in modified components
- [ ] ARIA labels use translated content
- [ ] Screen reader text uses translated content

### Translation File Validation
- [ ] `/messages/en.json` contains complete `common.loading` namespace
- [ ] All 6 language files have identical key structures
- [ ] No duplicate keys within namespaces

### Functional Validation
- [ ] Application builds without errors: `npm run build`
- [ ] Loading messages display correct translated text
- [ ] LoadingIndicator component uses translated default label
- [ ] LoadingState component uses translated aria-labels
- [ ] Page loading states display translated messages
- [ ] Loading states display translated text when locale is changed
- [ ] No console warnings about missing translation keys

### Accessibility Validation
- [ ] ARIA labels include translated content
- [ ] Screen readers correctly announce loading state content
- [ ] role="status" maintains proper behavior with translations
- [ ] aria-busy="true" continues to work correctly

## Dependencies

### Required (Already Completed)
- Epic 1: next-intl foundation must be in place
- REQ-E02-001: Common Namespace Structure must be complete

### Related Tasks
- Task 2H.10: Will generate translations for non-English languages
- Task 2H.6 (Empty States): Some overlap with loading/empty state patterns
- Task 2H.8 (Confirmation Dialogs): May share some status messages

## Risk Assessment

- **Risk Level**: Low
- **Rationale**:
  - Straightforward string replacement in most cases
  - Two main reusable components cover many locations
  - No complex ICU format needed (no pluralization or interpolation)
  - Clear patterns established

### Potential Issues

| Issue | Likelihood | Impact | Mitigation |
|-------|------------|--------|------------|
| Missing loading state locations | Medium | Low | Use grep patterns to find all loading messages |
| Component already has useTranslations | Medium | Low | Check for existing imports, use aliased hook name (tLoading) |
| Server component needs translation | Low | Medium | Use getTranslations from next-intl/server |
| Default prop handling | Low | Low | Use null coalescing for defaults |

## Search Patterns for Discovery

Use these patterns to find all loading state locations:

```bash
# Find "Loading" text patterns
grep -rn "Loading\.\.\." --include="*.tsx" src/ | grep -v test | grep -v console

# Find "Loading " prefix patterns (loading something)
grep -rn "\"Loading [a-z]" --include="*.tsx" src/ | grep -v test

# Find "loading" in aria-label
grep -rn "aria-label=\"[Ll]oading" --include="*.tsx" src/

# Find spinner with text patterns
grep -rn "animate-spin" --include="*.tsx" src/ | head -50

# Find "Please wait" patterns
grep -rn "Please wait\|please wait" --include="*.tsx" src/

# Find LoadingIndicator usage
grep -rn "LoadingIndicator\|LoadingState" --include="*.tsx" src/

# Find sr-only loading text
grep -rn "sr-only.*[Ll]oading\|className=\"sr-only" --include="*.tsx" src/

# Find "Authenticating" patterns
grep -rn "Authenticating\|Checking permissions" --include="*.tsx" src/

# Find Google/OAuth loading patterns
grep -rn "Connecting to\|Completing.*sign" --include="*.tsx" src/
```

## Notes

### Reference Implementation

The LoadingIndicator component provides a good pattern for how to use translations:

```typescript
// /src/components/SimpleDashboard/LoadingIndicator.tsx - Reference implementation
'use client';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';

export function LoadingIndicator({
  size = 'md',
  label,
  color = 'brand',
  className,
}: LoadingIndicatorProps) {
  const tLoading = useTranslations('common.loading');
  const effectiveLabel = label ?? tLoading('generic.loading');

  return (
    <span
      role="status"
      aria-label={effectiveLabel}
      className={className}
    >
      <Loader2 className="animate-spin" aria-hidden="true" />
      <span className="sr-only">{effectiveLabel}</span>
    </span>
  );
}
```

### Coordination with Other Tasks

- **Task 2H.1 (Common Namespace)**: Creates base structure; this task adds/expands loading sub-namespace
- **Task 2H.6 (Empty States)**: Empty states are distinct but may appear alongside loading states
- **Task 2H.5 (Toast Notifications)**: Some overlap with status messages (saving, deleting)

### Loading State Deduplication Strategy

Many loading messages are similar. Use this approach:
- `generic` namespace for truly reusable phrases ("Loading...", "Please wait...")
- Category-specific namespaces for context-specific messages
- Components can pass custom labels when needed, fallback to translated defaults

### Estimated Effort

Based on Plan-111, this task is estimated at ~30 strings across ~40 locations. This represents approximately 4% of Sub-Epic 2H's overall ~800 strings. Due to the straightforward nature of the changes and reusable component patterns, this M-sized task should take approximately 0.5-1 day.

---

*End of Implementation Overview*
