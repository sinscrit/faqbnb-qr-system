# REQ-E02-005: Extract Toast Notification Messages - Implementation Overview

*Generated: 2026-01-19 16:45:00 UTC*
*Last Modified: 2026-01-19 16:45:00 UTC*

## Reference

- **Request**: REQ-E02-005 (Extract Toast Notification Messages)
- **Source**: docs/gen_requests_epic2.md
- **Implementation Plan**: docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md
- **Type**: Enhancement
- **Phase**: 2H (Common & Shared Components)
- **Task ID**: 2H.5
- **Size**: M (Medium)
- **Epic**: Localization Epic 2 - Static UI Translation
- **Depends On**:
  - Epic 1 (L10N Foundation - next-intl setup)
  - REQ-E02-001 (Common Namespace Structure - must be completed first)

## Summary

Extract all hardcoded toast notification messages displayed throughout the application and replace them with references to localized translation keys. This task affects approximately 25+ locations across various components where success confirmations, error alerts, informational updates, and warning prompts are displayed. The estimated ~50 distinct notification strings need to be migrated to the i18n common.notifications namespace.

## Goals

1. Identify and catalog all toast notification and status message locations across the codebase (~25 locations)
2. Extract all hardcoded notification strings to the `common.notifications` namespace
3. Replace hardcoded strings with `useTranslations()` hook references
4. Implement proper ICU message format for dynamic content with variable interpolation
5. Ensure notifications display translated text based on user's language preference
6. Maintain accessibility features (ARIA live regions) with translated content
7. Follow consistent naming conventions for translation keys

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

### Existing Common Namespace (from REQ-E02-001)

After REQ-E02-001 completion, `/messages/en.json` will contain a base `common` namespace. This task adds the `notifications` sub-namespace.

### Estimated Scope

- **Files to modify**: ~25 component/page files
- **Distinct strings**: ~50 notification messages
- **New translation keys needed**: ~50
- **Strings with interpolation**: ~10 (requiring ICU format)
- **Categories**: Success, Error, Info, Warning

## Current Notification Patterns in Codebase

### Pattern Analysis

The codebase uses three primary patterns for displaying notifications:

#### Pattern 1: Success Message State with Banner Display

The most common pattern uses React state to show success banners:

```tsx
// Current: src/app/dashboard2/page.tsx
const [successMessage, setSuccessMessage] = useState<string | null>(null);

// On success:
setSuccessMessage('Property created successfully');
setTimeout(() => setSuccessMessage(null), 3000);

// In JSX:
{successMessage && (
  <div role="status" aria-live="polite" className="bg-[#00A699] text-white...">
    <CheckCircle className="w-5 h-5" />
    <span>{successMessage}</span>
  </div>
)}
```

**Locations using this pattern:**
- `/src/app/dashboard2/page.tsx` - Property created success
- `/src/app/dashboard2/properties/page.tsx` - Property updated/created success
- `/src/app/dashboard2/instructions/page.tsx` - Guide updated success

#### Pattern 2: In-Component Status Display

Some components display status messages inline:

```tsx
// Current: src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx
<div aria-live="polite" className="sr-only">
  {showSuccess && 'Item saved successfully'}
  {saveError && `Error: ${saveError}`}
</div>
```

**Locations using this pattern:**
- `/src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx`
- `/src/components/ItemCapture/components/steps/WhatsNextStep.tsx`

#### Pattern 3: Error State Display

Error messages are displayed with setError patterns:

```tsx
// Current: Various components
setError('Failed to update property');
setError(error instanceof Error ? error.message : 'Failed to load visit counts');

// In JSX:
{error && (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
    <p className="text-red-600">{error}</p>
  </div>
)}
```

**Locations using this pattern:**
- `/src/components/VisitCounter.tsx`
- `/src/components/ReactionButtons.tsx`
- `/src/components/PropertyForm.tsx`
- `/src/components/SimpleDashboard/PropertyEditModal.tsx`
- `/src/components/QRCodePrintManager.tsx`
- And many more...

#### Pattern 4: Alert-Based Notifications (Legacy)

Some admin/test pages use browser alerts (lower priority for translation):

```tsx
// Current: src/app/admin/system/back-office/page.tsx
alert('Access request approved successfully');
alert('Failed to approve access request');
```

### Current Notification Message Inventory

#### Success Messages (~15 strings)

| Location | Message |
|----------|---------|
| `/src/app/dashboard2/page.tsx:121` | "Property created successfully" |
| `/src/app/dashboard2/properties/page.tsx:51` | "Property updated successfully" |
| `/src/app/dashboard2/properties/page.tsx:74` | "Property created successfully" |
| `/src/app/dashboard2/instructions/page.tsx:333` | "Guide updated successfully" |
| `/src/components/ItemCreationWorkflow/.../PreviewSaveStep.tsx:854` | "Item saved successfully" |
| `/src/components/ItemCapture/.../WhatsNextStep.tsx:182` | "{itemName} has been saved successfully." |
| `/src/app/register/RegistrationPageContent.tsx:815` | "Account created successfully! Redirecting to dashboard..." |
| `/src/app/admin/system/back-office/page.tsx:144` | "Access request approved successfully" |
| `/src/app/admin/system/back-office/page.tsx:185` | "Email notification sent successfully" |

#### Error Messages (~25 strings)

| Location | Message |
|----------|---------|
| `/src/components/PropertyForm.tsx:106` | "Failed to save property. Please try again." |
| `/src/components/VisitCounter.tsx:130` | "Failed to load visit counts" |
| `/src/components/VisitCounter.tsx:248` | "Failed to load views" |
| `/src/components/QRCodePrintManager.tsx:282` | "Failed to generate QR codes" |
| `/src/components/QRCodePrintManager.tsx:430` | "Failed to export PDF. Please try again." |
| `/src/components/AnalyticsOverviewCards.tsx:92` | "Failed to load" |
| `/src/components/AnalyticsOverviewCards.tsx:226` | "Failed to load analytics data" |
| `/src/components/ItemDisplay.tsx:73` | "Failed to update reaction counts" |
| `/src/components/AccountSelector.tsx:95` | "Failed to switch account" |
| `/src/components/ReactionButtons.tsx:81` | "Failed to initialize session" |
| `/src/components/AnalyticsExport.tsx:182` | "Failed to fetch analytics data" |
| `/src/components/ReactionAnalytics.tsx:148` | "Failed to load reaction data" |
| `/src/components/MailingListSignup.tsx:99` | "Unable to subscribe. Please try again." |
| `/src/components/EmailPopup.tsx:107` | "Failed to send email. Please try again." |
| `/src/app/request-access/page.tsx:48` | "Failed to submit access request" |
| `/src/components/SimpleDashboard/PropertyEditModal.tsx:264` | "Failed to update property" |
| `/src/components/KPIDashboardOverview.tsx:353` | "Failed to load dashboard data" |
| `/src/app/admin/system/back-office/page.tsx:147` | "Failed to approve access request" |
| `/src/app/admin/system/back-office/page.tsx:177` | "Failed to deny access request" |
| `/src/app/admin/system/back-office/page.tsx:188` | "Failed to send email notification" |

#### Info/Warning Messages (~10 strings)

| Location | Message |
|----------|---------|
| `/src/components/SimpleDashboard/PropertyEditModal.tsx` | "Saving property changes..." (loading state) |
| Various loading states | "Loading...", "Saving...", "Deleting..." |

## Translation Namespace Structure

### Namespace: `common.notifications`

```json
{
  "common": {
    "notifications": {
      "success": {
        "propertyCreated": "Property created successfully",
        "propertyUpdated": "Property updated successfully",
        "propertySaved": "Property saved successfully",
        "itemSaved": "Item saved successfully",
        "itemSavedNamed": "{itemName} has been saved successfully",
        "guideUpdated": "Guide updated successfully",
        "articleUpdated": "Article updated successfully",
        "accountCreated": "Account created successfully! Redirecting to dashboard...",
        "accessApproved": "Access request approved successfully",
        "emailSent": "Email notification sent successfully",
        "changesSaved": "Changes saved successfully",
        "settingsUpdated": "Settings updated successfully",
        "fileUploaded": "File uploaded successfully",
        "copySuccess": "Copied to clipboard",
        "exportSuccess": "Export completed successfully"
      },
      "error": {
        "generic": "Something went wrong. Please try again.",
        "propertyCreate": "Failed to create property",
        "propertyUpdate": "Failed to update property",
        "propertySave": "Failed to save property. Please try again.",
        "itemSave": "Failed to save item",
        "loadData": "Failed to load data",
        "loadVisits": "Failed to load visit counts",
        "loadViews": "Failed to load views",
        "loadAnalytics": "Failed to load analytics data",
        "loadReactions": "Failed to load reaction data",
        "loadDashboard": "Failed to load dashboard data",
        "updateReaction": "Failed to update reaction counts",
        "generateQR": "Failed to generate QR codes",
        "exportPDF": "Failed to export PDF. Please try again.",
        "switchAccount": "Failed to switch account",
        "initSession": "Failed to initialize session",
        "fetchData": "Failed to fetch data",
        "subscribe": "Unable to subscribe. Please try again.",
        "sendEmail": "Failed to send email. Please try again.",
        "submitRequest": "Failed to submit access request",
        "approveRequest": "Failed to approve access request",
        "denyRequest": "Failed to deny access request",
        "sendNotification": "Failed to send email notification",
        "uploadFile": "Failed to upload file",
        "deleteItem": "Failed to delete item",
        "networkError": "Network error. Please check your connection.",
        "timeout": "Request timed out. Please try again.",
        "unauthorized": "You are not authorized to perform this action",
        "serverError": "Server error. Please try again later."
      },
      "info": {
        "saving": "Saving...",
        "loading": "Loading...",
        "deleting": "Deleting...",
        "processing": "Processing...",
        "uploading": "Uploading...",
        "redirecting": "Redirecting...",
        "pleaseWait": "Please wait...",
        "savingChanges": "Saving property changes...",
        "generatingPDF": "Generating PDF...",
        "loadingData": "Loading data..."
      },
      "warning": {
        "unsavedChanges": "You have unsaved changes",
        "sessionExpiring": "Your session is about to expire",
        "slowConnection": "Connection is slow. This may take a moment.",
        "offlineMode": "You appear to be offline"
      }
    }
  }
}
```

## Implementation Order

### Step 1: Create Notifications Namespace (Priority: High)

Add the `common.notifications` namespace to `/messages/en.json` with all categorized notification strings.

### Step 2: Update Dashboard Pages (Priority: High)

These pages have the most visible notification banners:

1. **`/src/app/dashboard2/page.tsx`** - Property success messages
2. **`/src/app/dashboard2/properties/page.tsx`** - Property CRUD messages
3. **`/src/app/dashboard2/instructions/page.tsx`** - Guide success messages

### Step 3: Update Workflow Components (Priority: High)

Critical user-facing notifications:

4. **`/src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx`** - Item save success/error
5. **`/src/components/ItemCapture/components/steps/WhatsNextStep.tsx`** - Save confirmation

### Step 4: Update Form and Modal Components (Priority: Medium)

6. **`/src/components/PropertyForm.tsx`** - Property form errors
7. **`/src/components/SimpleDashboard/PropertyEditModal.tsx`** - Edit modal errors
8. **`/src/components/SimpleDashboard/AddPropertyModal.tsx`** - Add modal errors

### Step 5: Update Analytics/Data Components (Priority: Medium)

9. **`/src/components/VisitCounter.tsx`** - Visit count errors
10. **`/src/components/AnalyticsOverviewCards.tsx`** - Analytics errors
11. **`/src/components/AnalyticsExport.tsx`** - Export errors
12. **`/src/components/ReactionAnalytics.tsx`** - Reaction data errors
13. **`/src/components/KPIDashboardOverview.tsx`** - Dashboard errors

### Step 6: Update Interaction Components (Priority: Medium)

14. **`/src/components/ReactionButtons.tsx`** - Reaction errors
15. **`/src/components/ItemDisplay.tsx`** - Display errors
16. **`/src/components/AccountSelector.tsx`** - Account switch errors

### Step 7: Update Utility Components (Priority: Medium)

17. **`/src/components/QRCodePrintManager.tsx`** - QR/PDF generation errors
18. **`/src/components/EmailPopup.tsx`** - Email errors
19. **`/src/components/MailingListSignup.tsx`** - Subscription errors

### Step 8: Update Request/Auth Pages (Priority: Lower)

20. **`/src/app/request-access/page.tsx`** - Access request errors
21. **`/src/app/register/RegistrationPageContent.tsx`** - Registration success

### Step 9: Update Admin Pages (Priority: Lower)

22. **`/src/app/admin/system/back-office/page.tsx`** - Admin action messages

## Authorized Files and Functions for Modification

### Translation Files to Modify

#### `/messages/en.json`

- **Purpose**: English translation source file
- **Modification**:
  - Add `common.notifications` namespace with success, error, info, and warning sub-namespaces
  - Implement ICU format for messages with variable interpolation

#### `/messages/fr.json`, `/messages/es.json`, `/messages/de.json`, `/messages/nl.json`, `/messages/it.json`

- **Purpose**: Non-English translation files
- **Modification**: Add same keys as en.json (with English placeholders initially)
- **Note**: Actual translations generated in separate task (2H.10)

### Component Files to Modify

#### Dashboard Pages

| File | Modifications |
|------|---------------|
| `/src/app/dashboard2/page.tsx` | Add `useTranslations('common.notifications')` hook; replace "Property created successfully" with `t('success.propertyCreated')` |
| `/src/app/dashboard2/properties/page.tsx` | Add `useTranslations('common.notifications')` hook; replace success messages with translation calls |
| `/src/app/dashboard2/instructions/page.tsx` | Add `useTranslations('common.notifications')` hook; replace "Guide updated successfully" |

#### Workflow Components

| File | Modifications |
|------|---------------|
| `/src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx` | Add `useTranslations('common.notifications')` hook; replace "Item saved successfully" and error patterns |
| `/src/components/ItemCapture/components/steps/WhatsNextStep.tsx` | Add `useTranslations('common.notifications')` hook; replace interpolated success message |

#### Form and Modal Components

| File | Modifications |
|------|---------------|
| `/src/components/PropertyForm.tsx` | Add `useTranslations('common.notifications')` hook; replace "Failed to save property..." |
| `/src/components/SimpleDashboard/PropertyEditModal.tsx` | Add `useTranslations('common.notifications')` hook; replace error messages and loading states |
| `/src/components/SimpleDashboard/AddPropertyModal.tsx` | Add `useTranslations('common.notifications')` hook if it contains notification messages |

#### Analytics and Data Components

| File | Modifications |
|------|---------------|
| `/src/components/VisitCounter.tsx` | Add `useTranslations('common.notifications')` hook; replace "Failed to load visit counts" and "Failed to load views" |
| `/src/components/AnalyticsOverviewCards.tsx` | Add `useTranslations('common.notifications')` hook; replace "Failed to load" and "Failed to load analytics data" |
| `/src/components/AnalyticsExport.tsx` | Add `useTranslations('common.notifications')` hook; replace "Failed to fetch analytics data" |
| `/src/components/ReactionAnalytics.tsx` | Add `useTranslations('common.notifications')` hook; replace "Failed to load reaction data" |
| `/src/components/KPIDashboardOverview.tsx` | Add `useTranslations('common.notifications')` hook; replace "Failed to load dashboard data" |

#### Interaction Components

| File | Modifications |
|------|---------------|
| `/src/components/ReactionButtons.tsx` | Add `useTranslations('common.notifications')` hook; replace "Failed to initialize session" |
| `/src/components/ItemDisplay.tsx` | Add `useTranslations('common.notifications')` hook; replace "Failed to update reaction counts" |
| `/src/components/AccountSelector.tsx` | Add `useTranslations('common.notifications')` hook; replace "Failed to switch account" |

#### Utility Components

| File | Modifications |
|------|---------------|
| `/src/components/QRCodePrintManager.tsx` | Add `useTranslations('common.notifications')` hook; replace QR and PDF generation error messages |
| `/src/components/EmailPopup.tsx` | Add `useTranslations('common.notifications')` hook; replace "Failed to send email..." |
| `/src/components/MailingListSignup.tsx` | Add `useTranslations('common.notifications')` hook; replace "Unable to subscribe..." |

#### Request and Auth Pages

| File | Modifications |
|------|---------------|
| `/src/app/request-access/page.tsx` | Add `useTranslations('common.notifications')` hook; replace "Failed to submit access request" |
| `/src/app/register/RegistrationPageContent.tsx` | Add `useTranslations('common.notifications')` hook; replace "Account created successfully..." |

#### Admin Pages

| File | Modifications |
|------|---------------|
| `/src/app/admin/system/back-office/page.tsx` | Add `useTranslations('common.notifications')` hook; replace alert messages with translation calls |

### Files NOT to Modify

- Console.log messages (for developers only, not user-facing)
- Test files (`__tests__/*.tsx`) - Testing handled separately
- API route files (`/src/app/api/*`) - Server-side, different translation approach
- Error utility files that generate error codes, not display messages

## Technical Specifications

### Import Pattern

Every component with notifications must import the useTranslations hook:

```typescript
'use client';
import { useTranslations } from 'next-intl';

function MyComponent() {
  const tNotifications = useTranslations('common.notifications');

  // Success notification
  setSuccessMessage(tNotifications('success.propertyCreated'));

  // Error notification
  setError(tNotifications('error.loadData'));

  // Info notification (loading)
  return <span>{tNotifications('info.saving')}</span>;
}
```

### Variable Interpolation Pattern (ICU Format)

For messages with dynamic values:

```json
{
  "common": {
    "notifications": {
      "success": {
        "itemSavedNamed": "{itemName} has been saved successfully"
      }
    }
  }
}
```

```typescript
tNotifications('success.itemSavedNamed', { itemName: item.name })
```

### Error Message with Fallback Pattern

For conditional error messages:

```typescript
// Before
setError(error instanceof Error ? error.message : 'Failed to load visit counts');

// After
setError(error instanceof Error ? error.message : tNotifications('error.loadVisits'));
```

### State-Based Notification Pattern

For components using state-based notifications:

```tsx
// Before
const [successMessage, setSuccessMessage] = useState<string | null>(null);
setSuccessMessage('Property created successfully');

// After
const tNotifications = useTranslations('common.notifications');
const [successMessage, setSuccessMessage] = useState<string | null>(null);
setSuccessMessage(tNotifications('success.propertyCreated'));
```

### ARIA Live Region Pattern

Ensure translated notifications work with screen readers:

```tsx
{successMessage && (
  <div
    role="status"
    aria-live="polite"
    className="bg-[#00A699] text-white px-4 py-3 rounded-xl"
  >
    <CheckCircle className="w-5 h-5" aria-hidden="true" />
    <span>{successMessage}</span>
  </div>
)}

// SR-only announcements
<div aria-live="polite" className="sr-only">
  {showSuccess && tNotifications('success.itemSaved')}
  {saveError && tNotifications('error.generic')}
</div>
```

## Translation Key Naming Convention

Following Plan-111 convention:
```
common.notifications.{category}.{action}{Context}
```

### Categories:
- `success` - Positive confirmations
- `error` - Failure notifications
- `info` - Informational/loading states
- `warning` - Caution notifications

### Rules:
- Use camelCase for multi-word keys: `propertyCreated`, `loadAnalytics`
- Action verb first: `save`, `load`, `create`, `update`, `delete`, `fetch`
- Context suffix when needed: `propertyCreated`, `propertySave`
- Generic fallbacks: `generic`, `loadData`

### Examples:
| Message | Translation Key |
|---------|-----------------|
| "Property created successfully" | `common.notifications.success.propertyCreated` |
| "Failed to load analytics data" | `common.notifications.error.loadAnalytics` |
| "Saving..." | `common.notifications.info.saving` |
| "{itemName} has been saved successfully" | `common.notifications.success.itemSavedNamed` |
| "You have unsaved changes" | `common.notifications.warning.unsavedChanges` |

## Success Validation Checklist

### Code Validation
- [ ] All ~25 notification locations have been identified and updated
- [ ] Each updated component imports `useTranslations` from 'next-intl'
- [ ] No hardcoded English notification text remains in modified components
- [ ] All dynamic messages use ICU format interpolation
- [ ] ARIA live regions maintain translated content

### Translation File Validation
- [ ] `/messages/en.json` contains complete `common.notifications` namespace
- [ ] All 6 language files have identical key structures
- [ ] ICU message formats are syntactically correct
- [ ] No duplicate keys within namespaces

### Functional Validation
- [ ] Application builds without errors: `npm run build`
- [ ] Success notifications display correct translated text
- [ ] Error notifications display correct translated text
- [ ] Info/loading states display correct translated text
- [ ] Variable interpolation works correctly (item names)
- [ ] Notifications display translated text when locale is changed
- [ ] No console warnings about missing translation keys

### Accessibility Validation
- [ ] ARIA live regions announce translated content
- [ ] Screen reader correctly announces notification changes
- [ ] Role="status" maintains proper behavior

## Dependencies

### Required (Already Completed)
- Epic 1: next-intl foundation must be in place
- REQ-E02-001: Common Namespace Structure must be complete

### Related Tasks
- Task 2H.10: Will generate translations for non-English languages
- Task 2J (Error Messages): Overlaps with error notification patterns

## Risk Assessment

- **Risk Level**: Low-Medium
- **Rationale**:
  - Simple string replacement in most cases
  - State-based notification pattern is straightforward
  - Some components have multiple notification points
  - ICU format needed only for ~10 strings

### Potential Issues

| Issue | Likelihood | Impact | Mitigation |
|-------|------------|--------|------------|
| Missing notification locations | Medium | Low | Use grep patterns to find all setError, setSuccessMessage calls |
| State update timing issues | Low | Low | Test notification display after translation changes |
| Longer translated text truncation | Low | Low | Notification banners use flexible layouts |
| Variable interpolation errors | Low | Medium | Test each interpolated message with various values |
| Console errors for missing keys | Low | Medium | Verify all keys exist before testing |

## Search Patterns for Discovery

Use these patterns to find all notification locations:

```bash
# Find success message state patterns
grep -rn "setSuccessMessage\|setSuccess\|showSuccess" --include="*.tsx" src/

# Find error message patterns
grep -rn "setError\(" --include="*.tsx" src/

# Find hardcoded success messages
grep -rn "successfully" --include="*.tsx" src/ | grep -v console | grep -v test

# Find hardcoded failure messages
grep -rn "Failed to\|Unable to\|Could not" --include="*.tsx" src/

# Find ARIA live regions (notification areas)
grep -rn "aria-live" --include="*.tsx" src/

# Find alert usage (legacy pattern)
grep -rn "alert\(" --include="*.tsx" src/
```

## Notes

### Reference Implementation

The dashboard pages provide a clear pattern for notification translation:

```typescript
// /src/app/dashboard2/page.tsx - Reference implementation
'use client';
import { useTranslations } from 'next-intl';

export default function Dashboard2Page() {
  const tNotifications = useTranslations('common.notifications');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handlePropertyAdded = async (newProperty: Property) => {
    // ... property creation logic
    setSuccessMessage(tNotifications('success.propertyCreated'));
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  return (
    <div>
      {successMessage && (
        <div role="status" aria-live="polite" className="bg-[#00A699] text-white...">
          <CheckCircle className="w-5 h-5" aria-hidden="true" />
          <span>{successMessage}</span>
        </div>
      )}
    </div>
  );
}
```

### Coordination with Other Tasks

- **Task 2H.1 (Common Namespace)**: Creates base structure; this task adds notifications sub-namespace
- **Task 2J (Error Messages)**: Some overlap with error notifications; coordinate to avoid duplication
- **Task 2H.7 (Loading States)**: Loading info messages may overlap; decide on namespace ownership

### Error Message Deduplication Strategy

Many error messages are similar (e.g., "Failed to load X"). Use a consistent pattern:
- Generic: `error.loadData` for "Failed to load data"
- Specific: `error.loadAnalytics` for "Failed to load analytics data"
- Allow components to use specific when context matters, generic as fallback

### Alert Migration (Future Consideration)

The admin pages use `alert()` for notifications. Consider whether to:
1. Replace alerts with proper toast components (separate task)
2. Translate alert messages as-is
3. Leave admin alerts in English (admin-only, lower priority)

**Recommendation**: Translate alert messages for consistency, but note that proper toast implementation may replace these in the future.

### Estimated Effort

Based on Plan-111, this task is estimated at ~50 strings across ~25 locations. This represents approximately 6% of Sub-Epic 2H's overall ~800 strings. Due to the repetitive nature of the changes, this M-sized task should take approximately 1 day.

---

*End of Implementation Overview*
