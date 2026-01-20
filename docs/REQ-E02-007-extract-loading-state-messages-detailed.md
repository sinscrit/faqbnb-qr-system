# REQ-E02-007: Extract Loading State Messages - Detailed Task Breakdown

*Generated: 2026-01-20 18:45:00 UTC*
*Last Modified: 2026-01-20 18:45:00 UTC*

## Document References

| Document | Path |
|----------|------|
| Overview | `docs/REQ-E02-007-extract-loading-state-messages-overview.md` |
| Request | `docs/gen_requests_epic2.md` (Request #7) |
| Implementation Plan | `docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md` |
| Epic | Localization Epic 2 - Static UI Translation |
| Sub-Epic | 2H - Common & Shared Components |
| Task ID | 2H.7 |

---

## Summary

This task extracts ~30 hardcoded loading state messages from ~40 component locations and replaces them with localized translation references using the `common.loading` namespace. Loading states are critical UX elements that provide feedback during data fetching, processing, and content loading. The current `/messages/en.json` has a basic `common.loading` string that will be expanded into a full sub-namespace with context-specific loading messages.

---

## Prerequisites

| Prerequisite | Status | Notes |
|--------------|--------|-------|
| Epic 1 Complete | Required | next-intl foundation must be in place |
| REQ-E02-001 Complete | Required | Common namespace structure must exist |
| `/messages/en.json` exists | Required | Base translation file with `common.loading` key |
| `useTranslations` hook available | Required | From next-intl |

---

## Task Breakdown

### TASK-001: Expand Loading Namespace Structure

**Priority:** High (Blocker)
**Estimated Points:** 1
**File:** `/messages/en.json`

#### Description
Expand the existing `common.loading` string in the English translation file into a full sub-namespace with all categorized loading state strings.

#### Implementation Steps

1. Open `/messages/en.json`
2. Locate the existing `common.loading` key (currently a simple string: "Loading...")
3. Replace it with a full namespace object containing categories:
   - `generic` - Reusable loading messages
   - `pages` - Page-specific loading messages
   - `components` - Component-specific loading messages
   - `media` - Media file loading messages
   - `auth` - Authentication loading messages
   - `oauth` - OAuth/external service loading messages
   - `aria` - ARIA accessibility labels
   - `status` - Status update messages (saving, deleting, etc.)

#### Code to Add

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

#### Verification
- [ ] All categories are present in the namespace
- [ ] JSON is valid (no syntax errors)
- [ ] Keys follow camelCase convention
- [ ] Existing `common.loading` simple string is replaced with namespace object
- [ ] Build passes: `npm run build`

---

### TASK-002: Add Loading Namespace to Other Language Files

**Priority:** High (Blocker)
**Estimated Points:** 1
**Files:** `/messages/fr.json`, `/messages/es.json`, `/messages/de.json`, `/messages/nl.json`, `/messages/it.json`

#### Description
Add the same `common.loading` namespace structure to all non-English language files with English placeholders (actual translations will be generated in Task 2H.10).

#### Implementation Steps

1. Copy the `common.loading` object from `en.json`
2. Paste into each language file, replacing their existing simple `common.loading` string
3. Verify JSON validity

#### Verification
- [ ] All 5 language files have identical key structure to en.json
- [ ] JSON is valid in all files
- [ ] No missing keys in any file

---

### TASK-003: Update LoadingIndicator Component

**Priority:** High
**Estimated Points:** 1
**File:** `/src/components/SimpleDashboard/LoadingIndicator.tsx`
**Lines to Modify:** 7 (import), 60-64 (component)

#### Description
Update the reusable LoadingIndicator component to use translations for the default label value.

#### Current Code (Lines 60-64)
```typescript
export function LoadingIndicator({
  size = 'md',
  label = 'Loading',
  color = 'brand',
  className,
}: LoadingIndicatorProps) {
```

#### Updated Code
```typescript
import { useTranslations } from 'next-intl';

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
      className={cn('inline-flex items-center justify-center', className)}
    >
      <Loader2
        className={cn(
          'animate-spin',
          sizeStyles[size],
          colorStyles[color]
        )}
        aria-hidden="true"
      />
      <span className="sr-only">{effectiveLabel}</span>
    </span>
  );
}
```

#### Verification
- [ ] `useTranslations` imported from 'next-intl'
- [ ] Default label prop changed from `'Loading'` to `undefined`
- [ ] Null coalescing used for effectiveLabel
- [ ] ARIA label uses effectiveLabel
- [ ] sr-only text uses effectiveLabel
- [ ] Component renders correctly with default translation

---

### TASK-004: Update LoadingState Component

**Priority:** High
**Estimated Points:** 1
**File:** `/src/components/ItemManager/components/shared/LoadingState.tsx`
**Lines to Modify:** 2 (import), 111, 116, 129, 138

#### Description
Update the ItemManager's LoadingState component to use translations for ARIA labels and screen reader text.

#### Current Code (Lines 111, 116, 129, 138)
```typescript
// Line 111 (list view)
aria-label="Loading items"
// Line 116 (list view sr-only)
<span className="sr-only">Loading items, please wait...</span>
// Line 129 (grid view)
aria-label="Loading items"
// Line 138 (grid view sr-only)
<span className="sr-only">Loading items, please wait...</span>
```

#### Updated Code
```typescript
'use client';
import { useTranslations } from 'next-intl';

export function LoadingState({
  viewMode = 'grid',
  itemCount,
  className,
}: LoadingStateProps) {
  const tLoading = useTranslations('common.loading');
  const count = itemCount ?? (viewMode === 'grid' ? DEFAULT_GRID_COUNT : DEFAULT_LIST_COUNT);

  if (viewMode === 'list') {
    return (
      <div
        role="status"
        aria-label={tLoading('aria.loadingItems')}
        aria-busy="true"
        className={cn('animate-pulse space-y-2', className)}
      >
        <span className="sr-only">{tLoading('aria.loadingItemsWait')}</span>
        {Array.from({ length: count }).map((_, index) => (
          <ListSkeletonRow key={index} />
        ))}
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-label={tLoading('aria.loadingItems')}
      aria-busy="true"
      className={cn(
        'animate-pulse grid gap-4',
        'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
        className
      )}
    >
      <span className="sr-only">{tLoading('aria.loadingItemsWait')}</span>
      {Array.from({ length: count }).map((_, index) => (
        <GridSkeletonCard key={index} />
      ))}
    </div>
  );
}
```

#### Verification
- [ ] `useTranslations` imported from 'next-intl'
- [ ] Both list and grid view ARIA labels use translation
- [ ] Both sr-only text spans use translation
- [ ] Component maintains 'use client' directive

---

### TASK-005: Update Login Page Loading State

**Priority:** High
**Estimated Points:** 1
**File:** `/src/app/login/page.tsx`
**Lines to Modify:** ~11

#### Description
Update the login page's "Loading login page..." message.

#### Current Code
```typescript
<p className="text-gray-600">Loading login page...</p>
```

#### Implementation Steps

1. Add `useTranslations` import
2. Create translation instance: `const tLoading = useTranslations('common.loading');`
3. Replace hardcoded text with: `{tLoading('pages.login')}`

#### Verification
- [ ] Loading message displays translated text
- [ ] No hardcoded English text remains

---

### TASK-006: Update Register Page Loading State

**Priority:** High
**Estimated Points:** 1
**File:** `/src/app/register/page.tsx`
**Lines to Modify:** ~11

#### Description
Update the register page's "Loading registration page..." message.

#### Code Pattern
```typescript
import { useTranslations } from 'next-intl';

// Inside component:
const tLoading = useTranslations('common.loading');

<p className="text-gray-600">{tLoading('pages.registration')}</p>
```

#### Verification
- [ ] Loading message displays translated text

---

### TASK-007: Update Dashboard Layout Loading State

**Priority:** High
**Estimated Points:** 1
**File:** `/src/app/dashboard/layout.tsx`
**Lines to Modify:** ~126

#### Description
Update the dashboard layout's "Loading dashboard..." message.

#### Current Code (Line ~126)
```typescript
<p className="text-gray-600">Loading dashboard...</p>
```

#### Code Pattern
```typescript
const tLoading = useTranslations('common.loading');
<p className="text-gray-600">{tLoading('pages.dashboard')}</p>
```

#### Verification
- [ ] Loading message translated

---

### TASK-008: Update Dashboard2 Layout Loading State

**Priority:** High
**Estimated Points:** 1
**File:** `/src/app/dashboard2/layout.tsx`
**Lines to Modify:** ~81

#### Description
Update the dashboard2 layout's "Loading dashboard..." message.

#### Code Pattern
```typescript
const tLoading = useTranslations('common.loading');
<p className="text-gray-600">{tLoading('pages.dashboard')}</p>
```

#### Verification
- [ ] Loading message translated

---

### TASK-009: Update Admin Layout Loading State

**Priority:** High
**Estimated Points:** 1
**File:** `/src/app/admin/layout.tsx`
**Lines to Modify:** ~161

#### Description
Update the admin layout's "Loading admin panel..." message.

#### Code Pattern
```typescript
const tLoading = useTranslations('common.loading');
<p className="text-gray-600">{tLoading('pages.adminPanel')}</p>
```

#### Verification
- [ ] Loading message translated

---

### TASK-010: Update Admin System Layout Loading State

**Priority:** High
**Estimated Points:** 1
**File:** `/src/app/admin/system/layout.tsx`
**Lines to Modify:** ~32

#### Description
Update the system admin layout's "Loading system admin panel..." message.

#### Code Pattern
```typescript
const tLoading = useTranslations('common.loading');
<p className="text-gray-600">{tLoading('pages.systemAdmin')}</p>
```

#### Verification
- [ ] Loading message translated

---

### TASK-011: Update User Layout Loading State

**Priority:** High
**Estimated Points:** 1
**File:** `/src/app/user/layout.tsx`
**Lines to Modify:** ~116

#### Description
Update the user layout's "Loading dashboard..." message.

#### Code Pattern
```typescript
const tLoading = useTranslations('common.loading');
<p className="text-gray-600">{tLoading('pages.dashboard')}</p>
```

#### Verification
- [ ] Loading message translated

---

### TASK-012: Update Dashboard Page Loading State

**Priority:** High
**Estimated Points:** 1
**File:** `/src/app/dashboard/page.tsx`
**Lines to Modify:** ~31

#### Description
Update the dashboard page's "Loading dashboard..." message.

#### Code Pattern
```typescript
const tLoading = useTranslations('common.loading');
<p className="text-gray-600">{tLoading('pages.dashboard')}</p>
```

#### Verification
- [ ] Loading message translated

---

### TASK-013: Update Analytics Page Loading State

**Priority:** Medium
**Estimated Points:** 1
**File:** `/src/app/dashboard/analytics/page.tsx`
**Lines to Modify:** ~110

#### Description
Update the analytics page's "Loading analytics..." message.

#### Code Pattern
```typescript
const tLoading = useTranslations('common.loading');
<p className="text-gray-600">{tLoading('pages.analytics')}</p>
```

#### Verification
- [ ] Loading message translated

---

### TASK-014: Update Items New Page Loading State

**Priority:** Medium
**Estimated Points:** 1
**File:** `/src/app/dashboard/items/new/page.tsx`
**Lines to Modify:** ~179

#### Description
Update the item creation page's "Loading item creation..." message.

#### Code Pattern
```typescript
const tLoading = useTranslations('common.loading');
<p className="text-gray-600">{tLoading('pages.itemCreation')}</p>
```

#### Verification
- [ ] Loading message translated

---

### TASK-015: Update Properties Page Loading State

**Priority:** Medium
**Estimated Points:** 1
**File:** `/src/app/dashboard/properties/page.tsx`
**Lines to Modify:** ~203

#### Description
Update the properties management page's "Loading properties management..." message.

#### Code Pattern
```typescript
const tLoading = useTranslations('common.loading');
<p className="text-gray-600">{tLoading('pages.propertiesManagement')}</p>
```

#### Verification
- [ ] Loading message translated

---

### TASK-016: Update Property New Page Loading State

**Priority:** Medium
**Estimated Points:** 1
**File:** `/src/app/dashboard/properties/new/page.tsx`
**Lines to Modify:** ~175

#### Description
Update the property creation page's "Loading property creation..." message.

#### Code Pattern
```typescript
const tLoading = useTranslations('common.loading');
<p className="text-gray-600">{tLoading('pages.propertyCreation')}</p>
```

#### Verification
- [ ] Loading message translated

---

### TASK-017: Update Item Edit Page Loading State (Dashboard)

**Priority:** Medium
**Estimated Points:** 1
**File:** `/src/app/dashboard/items/[publicId]/edit/page.tsx`
**Lines to Modify:** ~189

#### Description
Update the item edit page's "Loading item..." message.

#### Code Pattern
```typescript
const tLoading = useTranslations('common.loading');
<p className="text-gray-600">{tLoading('pages.item')}</p>
```

#### Verification
- [ ] Loading message translated

---

### TASK-018: Update Item Edit Page Loading State (Dashboard2)

**Priority:** Medium
**Estimated Points:** 1
**File:** `/src/app/dashboard2/items/[publicId]/edit/page.tsx`
**Lines to Modify:** ~188

#### Description
Update the dashboard2 item edit page's "Loading item..." message.

#### Code Pattern
```typescript
const tLoading = useTranslations('common.loading');
<p className="text-gray-600">{tLoading('pages.item')}</p>
```

#### Verification
- [ ] Loading message translated

---

### TASK-019: Update Property Detail Page Loading State

**Priority:** Medium
**Estimated Points:** 1
**File:** `/src/app/dashboard/properties/[propertyId]/page.tsx`
**Lines to Modify:** ~211

#### Description
Update the property detail page's "Loading property..." message.

#### Code Pattern
```typescript
const tLoading = useTranslations('common.loading');
<p className="text-gray-600">{tLoading('pages.property')}</p>
```

#### Verification
- [ ] Loading message translated

---

### TASK-020: Update Property Edit Page Loading State

**Priority:** Medium
**Estimated Points:** 1
**File:** `/src/app/dashboard/properties/[propertyId]/edit/page.tsx`
**Lines to Modify:** ~217

#### Description
Update the property edit page's "Loading property..." message.

#### Code Pattern
```typescript
const tLoading = useTranslations('common.loading');
<p className="text-gray-600">{tLoading('pages.property')}</p>
```

#### Verification
- [ ] Loading message translated

---

### TASK-021: Update ItemsManagement Component

**Priority:** Medium
**Estimated Points:** 1
**File:** `/src/components/ItemsManagement.tsx`
**Lines to Modify:** ~177

#### Description
Update the ItemsManagement component's "Loading items..." message.

#### Code Pattern
```typescript
const tLoading = useTranslations('common.loading');
<p className="text-gray-600">{tLoading('components.items')}</p>
```

#### Verification
- [ ] Loading message translated

---

### TASK-022: Update Dashboard2 Items Page Loading State

**Priority:** Medium
**Estimated Points:** 1
**File:** `/src/app/dashboard2/items/page.tsx`
**Lines to Modify:** ~215

#### Description
Update the dashboard2 items page's "Loading items..." message.

#### Code Pattern
```typescript
const tLoading = useTranslations('common.loading');
<p className="text-gray-600">{tLoading('components.items')}</p>
```

#### Verification
- [ ] Loading message translated

---

### TASK-023: Update PropertySelector Component

**Priority:** Medium
**Estimated Points:** 1
**File:** `/src/components/PropertySelector.tsx`
**Lines to Modify:** ~197, ~307

#### Description
Update the PropertySelector component's "Loading properties..." messages (appears in multiple locations).

#### Code Pattern
```typescript
const tLoading = useTranslations('common.loading');
<p className="text-gray-600">{tLoading('components.properties')}</p>
```

#### Verification
- [ ] Both loading message locations translated

---

### TASK-024: Update Admin Items New Page Loading State

**Priority:** Medium
**Estimated Points:** 1
**File:** `/src/app/admin/items/new/page.tsx`
**Lines to Modify:** ~107

#### Description
Update the admin items page's "Loading properties..." message.

#### Code Pattern
```typescript
const tLoading = useTranslations('common.loading');
<p className="text-gray-600">{tLoading('components.properties')}</p>
```

#### Verification
- [ ] Loading message translated

---

### TASK-025: Update UserAnalyticsTable Component

**Priority:** Medium
**Estimated Points:** 1
**File:** `/src/components/UserAnalyticsTable.tsx`
**Lines to Modify:** ~130

#### Description
Update the UserAnalyticsTable component's "Loading user analytics..." message.

#### Code Pattern
```typescript
const tLoading = useTranslations('common.loading');
<p className="text-gray-600">{tLoading('components.userAnalytics')}</p>
```

#### Verification
- [ ] Loading message translated

---

### TASK-026: Update AccessRequestTable Component

**Priority:** Medium
**Estimated Points:** 1
**File:** `/src/components/AccessRequestTable.tsx`
**Lines to Modify:** ~266

#### Description
Update the AccessRequestTable component's "Loading access requests..." message.

#### Code Pattern
```typescript
const tLoading = useTranslations('common.loading');
<p className="text-gray-600">{tLoading('components.accessRequests')}</p>
```

#### Verification
- [ ] Loading message translated

---

### TASK-027: Update Instructions Page Loading State

**Priority:** Medium
**Estimated Points:** 1
**File:** `/src/app/dashboard2/instructions/page.tsx`
**Lines to Modify:** ~259

#### Description
Update the instructions page's "Loading guides..." message.

#### Code Pattern
```typescript
const tLoading = useTranslations('common.loading');
<p className="text-gray-600">{tLoading('components.guides')}</p>
```

#### Verification
- [ ] Loading message translated

---

### TASK-028: Update QR Codes Print Page Loading State

**Priority:** Medium
**Estimated Points:** 1
**File:** `/src/app/print/qr-codes/[propertyId]/page.tsx`
**Lines to Modify:** ~47

#### Description
Update the QR codes print page's "Loading QR codes..." message.

#### Code Pattern
```typescript
const tLoading = useTranslations('common.loading');
<p className="text-gray-600">{tLoading('components.qrCodes')}</p>
```

#### Verification
- [ ] Loading message translated

---

### TASK-029: Update Article Edit Page Loading State

**Priority:** Medium
**Estimated Points:** 1
**File:** `/src/app/dashboard2/instructions/[articleId]/edit/page.tsx`
**Lines to Modify:** ~209

#### Description
Update the article edit page's "Loading article data..." message.

#### Code Pattern
```typescript
const tLoading = useTranslations('common.loading');
<p className="text-gray-600">{tLoading('components.articleData')}</p>
```

#### Verification
- [ ] Loading message translated

---

### TASK-030: Update AuthGuard Component

**Priority:** Medium
**Estimated Points:** 2
**File:** `/src/components/AuthGuard.tsx`
**Lines to Modify:** ~24, ~30, ~159, ~314, ~331, ~361

#### Description
Update the AuthGuard component's multiple authentication loading messages:
- "Authenticating..." (LoadingSpinner default)
- "Checking permissions..."
- "Checking system admin permissions..."
- "Please wait while we verify your credentials"

#### Current Code Locations
```typescript
// Line ~24: LoadingSpinner default message
function LoadingSpinner({ message = "Authenticating..." }) {
// Line ~30: Verification text
<p className="text-sm">Please wait while we verify your credentials</p>
// Lines ~159, ~314, ~361: Checking permissions
<LoadingSpinner message="Checking permissions..." />
// Line ~331: System admin check
<LoadingSpinner message="Checking system admin permissions..." />
```

#### Updated Code Pattern
```typescript
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

// Usage locations:
<LoadingSpinner message={tLoading('auth.checkingPermissions')} />
<LoadingSpinner message={tLoading('auth.checkingSystemPermissions')} />
```

#### Verification
- [ ] LoadingSpinner default message translated
- [ ] "Please wait while we verify your credentials" translated
- [ ] "Checking permissions..." messages translated
- [ ] "Checking system admin permissions..." translated
- [ ] All 5+ locations updated

---

### TASK-031: Update LoginPageContent Component

**Priority:** Medium
**Estimated Points:** 2
**File:** `/src/app/login/LoginPageContent.tsx`
**Lines to Modify:** ~134, ~165

#### Description
Update the LoginPageContent component's authentication loading messages:
- "Completing authentication..."
- "Loading authentication..."
- "Completing Google sign-in..."

#### Current Code Locations
```typescript
// Line ~134: Google sign-in
<p>Completing Google sign-in...</p>
// Line ~165: Auth completion/loading
"Completing authentication..." / "Loading authentication..."
```

#### Code Pattern
```typescript
const tLoading = useTranslations('common.loading');

// Google sign-in
<p>{tLoading('oauth.completingGoogleSignIn')}</p>
// Auth completion
{tLoading('auth.completingAuth')}
// Auth loading
{tLoading('auth.loadingAuth')}
```

#### Verification
- [ ] "Completing Google sign-in..." translated
- [ ] "Completing authentication..." translated
- [ ] "Loading authentication..." translated

---

### TASK-032: Update GoogleOAuthButton Component

**Priority:** Medium
**Estimated Points:** 1
**File:** `/src/components/GoogleOAuthButton.tsx`
**Lines to Modify:** ~116

#### Description
Update the GoogleOAuthButton component's "Connecting to Google..." loading message.

#### Current Code (Line ~116)
```typescript
<span>Connecting to Google...</span>
```

#### Code Pattern
```typescript
const tLoading = useTranslations('common.loading');
<span>{tLoading('oauth.connectingGoogle')}</span>
```

#### Verification
- [ ] "Connecting to Google..." translated
- [ ] Button loading state displays translated text

---

### TASK-033: Update VideoTrimmer Component

**Priority:** Lower
**Estimated Points:** 1
**File:** `/src/components/ItemCapture/editors/VideoTrimmer.tsx`
**Lines to Modify:** ~543

#### Description
Update the VideoTrimmer component's "Loading video..." message.

#### Code Pattern
```typescript
const tLoading = useTranslations('common.loading');
<p>{tLoading('media.video')}</p>
```

#### Verification
- [ ] Video loading message translated

---

### TASK-034: Update ImageCropper Component

**Priority:** Lower
**Estimated Points:** 1
**File:** `/src/components/ItemCapture/editors/ImageCropper.tsx`
**Lines to Modify:** ~400

#### Description
Update the ImageCropper component's "Loading image..." message.

#### Code Pattern
```typescript
const tLoading = useTranslations('common.loading');
<p>{tLoading('media.image')}</p>
```

#### Verification
- [ ] Image loading message translated

---

### TASK-035: Update ImageRotator Component

**Priority:** Lower
**Estimated Points:** 1
**File:** `/src/components/ItemCapture/editors/ImageRotator.tsx`
**Lines to Modify:** ~371

#### Description
Update the ImageRotator component's "Loading image..." message.

#### Code Pattern
```typescript
const tLoading = useTranslations('common.loading');
<p>{tLoading('media.image')}</p>
```

#### Verification
- [ ] Image loading message translated

---

### TASK-036: Update PDFViewer Component

**Priority:** Lower
**Estimated Points:** 1
**File:** `/src/components/ItemManager/components/ItemPreview/viewers/PDFViewer.tsx`
**Lines to Modify:** ~357

#### Description
Update the PDFViewer component's "Loading PDF..." message.

#### Code Pattern
```typescript
const tLoading = useTranslations('common.loading');
<p>{tLoading('media.pdf')}</p>
```

#### Verification
- [ ] PDF loading message translated

---

### TASK-037: Update GuideGrid ARIA Label

**Priority:** Medium
**Estimated Points:** 1
**File:** `/src/components/InstructionsTable/GuideGrid.tsx`
**Lines to Modify:** ~76

#### Description
Update the GuideGrid component's loading ARIA label.

#### Current Code (Line ~76)
```typescript
aria-label="Loading guides"
```

#### Code Pattern
```typescript
const tLoading = useTranslations('common.loading');
aria-label={tLoading('aria.loadingGuides')}
```

#### Verification
- [ ] ARIA label translated
- [ ] Screen readers announce translated content

---

### TASK-038: Update MediaEditorStep ARIA Label

**Priority:** Medium
**Estimated Points:** 1
**File:** `/src/components/ItemCapture/components/steps/MediaEditorStep.tsx`
**Lines to Modify:** ~79

#### Description
Update the MediaEditorStep component's loading ARIA label.

#### Current Code (Line ~79)
```typescript
aria-label="Loading editor"
```

#### Code Pattern
```typescript
const tLoading = useTranslations('common.loading');
aria-label={tLoading('aria.loadingEditor')}
```

#### Verification
- [ ] ARIA label translated

---

### TASK-039: Update ContentPreview ARIA Label

**Priority:** Medium
**Estimated Points:** 1
**File:** `/src/components/ItemCreationWorkflow/components/shared/ContentPreview.tsx`
**Lines to Modify:** ~373

#### Description
Update the ContentPreview component's loading ARIA label.

#### Current Code (Line ~373)
```typescript
aria-label="Loading content preview"
```

#### Code Pattern
```typescript
const tLoading = useTranslations('common.loading');
aria-label={tLoading('aria.loadingContentPreview')}
```

#### Verification
- [ ] ARIA label translated

---

### TASK-040: Update EngagementIndicator ARIA Label

**Priority:** Medium
**Estimated Points:** 1
**File:** `/src/components/ItemManager/components/shared/EngagementIndicator.tsx`
**Lines to Modify:** ~181

#### Description
Update the EngagementIndicator component's loading ARIA label.

#### Current Code (Line ~181)
```typescript
aria-label="Loading engagement indicator"
```

#### Code Pattern
```typescript
const tLoading = useTranslations('common.loading');
aria-label={tLoading('aria.loadingEngagement')}
```

#### Verification
- [ ] ARIA label translated

---

### TASK-041: Update VisitCountBadge ARIA Label

**Priority:** Medium
**Estimated Points:** 1
**File:** `/src/components/ItemManager/components/shared/VisitCountBadge.tsx`
**Lines to Modify:** ~91

#### Description
Update the VisitCountBadge component's loading ARIA label.

#### Current Code (Line ~91)
```typescript
aria-label="Loading view count"
```

#### Code Pattern
```typescript
const tLoading = useTranslations('common.loading');
aria-label={tLoading('aria.loadingViewCount')}
```

#### Verification
- [ ] ARIA label translated

---

### TASK-042: Update ReactionSummary ARIA Label

**Priority:** Medium
**Estimated Points:** 1
**File:** `/src/components/ItemManager/components/shared/ReactionSummary.tsx`
**Lines to Modify:** ~101

#### Description
Update the ReactionSummary component's loading ARIA label.

#### Current Code (Line ~101)
```typescript
aria-label="Loading reactions"
```

#### Code Pattern
```typescript
const tLoading = useTranslations('common.loading');
aria-label={tLoading('aria.loadingReactions')}
```

#### Verification
- [ ] ARIA label translated

---

### TASK-043: Update TextEditorStep ARIA Label

**Priority:** Lower
**Estimated Points:** 1
**File:** `/src/components/ItemCapture/components/steps/TextEditorStep.tsx`
**Lines to Modify:** ~31

#### Description
Update the TextEditorStep component's loading preview ARIA label.

#### Current Code (Line ~31)
```typescript
aria-label="Loading preview..."
```

#### Code Pattern
```typescript
const tLoading = useTranslations('common.loading');
aria-label={tLoading('media.preview')}
```

#### Verification
- [ ] ARIA label translated

---

### TASK-044: Final Verification and Build Test

**Priority:** High (Gating)
**Estimated Points:** 1

#### Description
Run build verification and comprehensive testing to ensure all loading states work correctly.

#### Verification Steps

1. **Build Check**
   ```bash
   npm run build
   ```
   - [ ] Build completes without errors
   - [ ] No TypeScript errors related to translations

2. **Missing Key Check**
   - [ ] No console warnings about missing translation keys

3. **Visual Verification**
   - [ ] Test loading states in multiple components
   - [ ] Verify LoadingIndicator uses translated default label
   - [ ] Verify LoadingState uses translated ARIA labels
   - [ ] Confirm ARIA labels include translated content

4. **Accessibility Validation**
   - [ ] role="status" maintains proper behavior with translations
   - [ ] aria-busy="true" continues to work correctly
   - [ ] Screen readers correctly announce loading state content

5. **Language Switch Test**
   - [ ] Loading states display translated text when locale changes

---

## Task Summary Table

| Task ID | Description | Priority | Points | File(s) |
|---------|-------------|----------|--------|---------|
| TASK-001 | Expand loading namespace in en.json | High | 1 | /messages/en.json |
| TASK-002 | Add namespace to other language files | High | 1 | /messages/*.json |
| TASK-003 | Update LoadingIndicator component | High | 1 | LoadingIndicator.tsx |
| TASK-004 | Update LoadingState component | High | 1 | LoadingState.tsx |
| TASK-005 | Update login page loading | High | 1 | login/page.tsx |
| TASK-006 | Update register page loading | High | 1 | register/page.tsx |
| TASK-007 | Update dashboard layout loading | High | 1 | dashboard/layout.tsx |
| TASK-008 | Update dashboard2 layout loading | High | 1 | dashboard2/layout.tsx |
| TASK-009 | Update admin layout loading | High | 1 | admin/layout.tsx |
| TASK-010 | Update admin system layout loading | High | 1 | admin/system/layout.tsx |
| TASK-011 | Update user layout loading | High | 1 | user/layout.tsx |
| TASK-012 | Update dashboard page loading | High | 1 | dashboard/page.tsx |
| TASK-013 | Update analytics page loading | Medium | 1 | analytics/page.tsx |
| TASK-014 | Update items new page loading | Medium | 1 | items/new/page.tsx |
| TASK-015 | Update properties page loading | Medium | 1 | properties/page.tsx |
| TASK-016 | Update property new page loading | Medium | 1 | properties/new/page.tsx |
| TASK-017 | Update item edit page loading (dashboard) | Medium | 1 | items/[publicId]/edit/page.tsx |
| TASK-018 | Update item edit page loading (dashboard2) | Medium | 1 | items/[publicId]/edit/page.tsx |
| TASK-019 | Update property detail page loading | Medium | 1 | properties/[propertyId]/page.tsx |
| TASK-020 | Update property edit page loading | Medium | 1 | properties/[propertyId]/edit/page.tsx |
| TASK-021 | Update ItemsManagement loading | Medium | 1 | ItemsManagement.tsx |
| TASK-022 | Update dashboard2 items page loading | Medium | 1 | items/page.tsx |
| TASK-023 | Update PropertySelector loading | Medium | 1 | PropertySelector.tsx |
| TASK-024 | Update admin items new page loading | Medium | 1 | admin/items/new/page.tsx |
| TASK-025 | Update UserAnalyticsTable loading | Medium | 1 | UserAnalyticsTable.tsx |
| TASK-026 | Update AccessRequestTable loading | Medium | 1 | AccessRequestTable.tsx |
| TASK-027 | Update instructions page loading | Medium | 1 | instructions/page.tsx |
| TASK-028 | Update QR codes print page loading | Medium | 1 | qr-codes/[propertyId]/page.tsx |
| TASK-029 | Update article edit page loading | Medium | 1 | instructions/[articleId]/edit/page.tsx |
| TASK-030 | Update AuthGuard component | Medium | 2 | AuthGuard.tsx |
| TASK-031 | Update LoginPageContent component | Medium | 2 | LoginPageContent.tsx |
| TASK-032 | Update GoogleOAuthButton component | Medium | 1 | GoogleOAuthButton.tsx |
| TASK-033 | Update VideoTrimmer component | Lower | 1 | VideoTrimmer.tsx |
| TASK-034 | Update ImageCropper component | Lower | 1 | ImageCropper.tsx |
| TASK-035 | Update ImageRotator component | Lower | 1 | ImageRotator.tsx |
| TASK-036 | Update PDFViewer component | Lower | 1 | PDFViewer.tsx |
| TASK-037 | Update GuideGrid ARIA label | Medium | 1 | GuideGrid.tsx |
| TASK-038 | Update MediaEditorStep ARIA label | Medium | 1 | MediaEditorStep.tsx |
| TASK-039 | Update ContentPreview ARIA label | Medium | 1 | ContentPreview.tsx |
| TASK-040 | Update EngagementIndicator ARIA label | Medium | 1 | EngagementIndicator.tsx |
| TASK-041 | Update VisitCountBadge ARIA label | Medium | 1 | VisitCountBadge.tsx |
| TASK-042 | Update ReactionSummary ARIA label | Medium | 1 | ReactionSummary.tsx |
| TASK-043 | Update TextEditorStep ARIA label | Lower | 1 | TextEditorStep.tsx |
| TASK-044 | Final verification | High | 1 | N/A |

**Total Estimated Points:** 48

---

## Execution Order

### Phase 1: Foundation (Tasks 1-2)
- TASK-001: Create/expand loading namespace structure
- TASK-002: Add namespace to other language files

### Phase 2: Core Loading Components (Tasks 3-4)
- TASK-003: LoadingIndicator (most reused component)
- TASK-004: LoadingState (ItemManager skeleton component)

### Phase 3: Layout Loading States (Tasks 5-12)
- TASK-005: Login page
- TASK-006: Register page
- TASK-007: Dashboard layout
- TASK-008: Dashboard2 layout
- TASK-009: Admin layout
- TASK-010: Admin system layout
- TASK-011: User layout
- TASK-012: Dashboard page

### Phase 4: Dashboard Page Loading States (Tasks 13-20)
- TASK-013: Analytics page
- TASK-014: Items new page
- TASK-015: Properties page
- TASK-016: Property new page
- TASK-017: Item edit page (dashboard)
- TASK-018: Item edit page (dashboard2)
- TASK-019: Property detail page
- TASK-020: Property edit page

### Phase 5: Component Loading States (Tasks 21-29)
- TASK-021: ItemsManagement
- TASK-022: Dashboard2 items page
- TASK-023: PropertySelector
- TASK-024: Admin items new page
- TASK-025: UserAnalyticsTable
- TASK-026: AccessRequestTable
- TASK-027: Instructions page
- TASK-028: QR codes print page
- TASK-029: Article edit page

### Phase 6: Authentication Components (Tasks 30-32)
- TASK-030: AuthGuard (multiple messages)
- TASK-031: LoginPageContent (multiple messages)
- TASK-032: GoogleOAuthButton

### Phase 7: Media Loading Components (Tasks 33-36)
- TASK-033: VideoTrimmer
- TASK-034: ImageCropper
- TASK-035: ImageRotator
- TASK-036: PDFViewer

### Phase 8: ARIA Label Updates (Tasks 37-43)
- TASK-037: GuideGrid
- TASK-038: MediaEditorStep
- TASK-039: ContentPreview
- TASK-040: EngagementIndicator
- TASK-041: VisitCountBadge
- TASK-042: ReactionSummary
- TASK-043: TextEditorStep

### Phase 9: Verification (Task 44)
- TASK-044: Final verification and build test

---

## Success Criteria

- [ ] All ~30 loading state strings extracted to `common.loading` namespace
- [ ] All ~40 component locations updated with `useTranslations` hook
- [ ] No hardcoded English loading state text remains in modified components
- [ ] LoadingIndicator component uses translated default label
- [ ] LoadingState component uses translated ARIA labels
- [ ] ARIA labels include translated content
- [ ] Screen reader text uses translated content
- [ ] Build passes without errors: `npm run build`
- [ ] No missing translation key warnings
- [ ] All 6 language files have identical key structure
- [ ] Loading states display translated text when locale is changed

---

## Notes

- **Do NOT modify test files** - Testing is handled separately
- **Do NOT modify console.log messages** - These are for developers only
- **Use `tLoading` as convention** for the translation instance name in loading-related components
- **Preserve existing styling** - Only change text content, not CSS
- **Use null coalescing (`??`)** for default values when optional props are involved
- **Maintain 'use client' directive** when adding hooks to client components

### Files NOT to Modify
- Console.log messages (for developers only, not user-facing)
- Test files (`__tests__/*.tsx`, `/src/app/test/**`) - Testing handled separately
- API route files (`/src/app/api/*`) - Server-side, different translation approach
- Comments and documentation strings
- Loading messages in SSR/Server Components that don't support client hooks (use getTranslations instead)

---

## Search Patterns for Discovery

If additional loading states need to be found, use these patterns:

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

---

## Dependencies

### Required (Must be Complete)
- Epic 1: next-intl foundation must be in place
- REQ-E02-001: Common Namespace Structure must be complete

### Related Tasks
- Task 2H.10: Will generate translations for non-English languages
- Task 2H.6 (Empty States): Some overlap with loading/empty state patterns - use shared generic namespace
- Task 2H.8 (Confirmation Dialogs): May share some status messages in `common.loading.status`

---

*End of Detailed Task Breakdown*
