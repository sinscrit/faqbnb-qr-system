# REQ-308: Extract Toast Notification Messages for Internationalization

**Technical Lead Implementation Breakdown**

---

## Document Metadata

| Field | Value |
|-------|-------|
| **Request ID** | REQ-308 |
| **Title** | Extract Toast Notification Messages for Internationalization |
| **Type** | ENHANCEMENT |
| **Size** | M (Medium) |
| **Epic** | L10N Epic 2 - Static UI Translation |
| **Sub-Epic** | 2H - Common & Shared Components |
| **Task ID** | 2H.5 |
| **Priority** | High (Foundation for localized user feedback) |
| **Created** | 2026-01-18 |
| **Last Modified** | 2026-01-18 |

---

## Overview

This request involves extracting all toast notification and status message strings from hardcoded text to translation keys, enabling internationalized user feedback across the application. The codebase uses a custom notification pattern (state-based messages with `setMessage`, `setError`, `setSuccess`) and banner components rather than a third-party toast library.

### Background

The FAQBNB application displays user feedback through:
1. **Inline status messages** - Error/success states displayed within components
2. **Banner notifications** - SessionRecoveryBanner, NetworkErrorIndicator, etc.
3. **Tier change notifications** - useTierChangeNotification hook messages
4. **Progress/status indicators** - QRGenerationProgress, loading states
5. **Modal alert messages** - In-context feedback within dialogs

---

## Technical Context

### Current Notification Pattern

The application does NOT use a centralized toast library (like react-hot-toast or sonner). Instead, notifications are handled through:

1. **State-based error/success messages:**
```typescript
const [error, setError] = useState<string | null>(null);
const [success, setSuccess] = useState(false);
// ...
setError('Failed to load dashboard data');
setError('Network error. Please try again.');
```

2. **Notification hook messages:**
```typescript
// src/hooks/useTierChangeNotification.ts
const TIER_CHANGE_MESSAGES: Record<DashboardTier, string> = {
  single: 'Dashboard simplified for single property',
  few: 'Property selector now available',
  multiple: 'Filtering and grouping controls now available',
  many: 'Advanced tools now available',
};
```

3. **Banner component messages:**
```typescript
// SessionRecoveryBanner.tsx
<h3>Your previous session has been restored</h3>
<p>{itemCount} {itemCount === 1 ? 'item' : 'items'}</p>
```

4. **Progress indicator messages:**
```typescript
// QRGenerationProgress.tsx
statusMessage = 'Complete!';
statusMessage = `${stats.completed} completed, ${stats.failed} failed`;
statusMessage = 'Generation failed';
```

### Dependencies from Epic 1

| Dependency | Status | Purpose |
|------------|--------|---------|
| next-intl | Required | i18n framework |
| useTranslations hook | Required | Client component translations |
| getTranslations | Required | Server component translations |
| `/messages/en.json` | Required | Translation storage |

---

## Scope Analysis

### Files Containing Notification Messages

Based on codebase analysis, the following files contain toast/notification strings:

#### High Priority - Custom Notification Components

| File | Estimated Strings | Pattern |
|------|-------------------|---------|
| `/src/hooks/useTierChangeNotification.ts` | 4 | Constant object |
| `/src/components/ItemCreationWorkflow/components/shared/SessionRecoveryBanner.tsx` | 8 | JSX hardcoded |
| `/src/components/ItemCreationWorkflow/components/shared/NetworkErrorIndicator.tsx` | 5 | JSX hardcoded |
| `/src/components/ItemCreationWorkflow/components/shared/QRGenerationProgress.tsx` | 12 | JSX + logic |
| `/src/components/SimpleDashboard/LoadingIndicator.tsx` | 3 | JSX hardcoded |

#### Medium Priority - Error/Success State Messages

| File | Estimated Strings | Pattern |
|------|-------------------|---------|
| `/src/components/ReactionButtons.tsx` | 2 | setError calls |
| `/src/components/UserDashboard.tsx` | 1 | setError calls |
| `/src/components/KPIDashboardOverview.tsx` | 1 | setError calls |
| `/src/app/request-access/page.tsx` | 3 | setError/success |
| `/src/app/simple-login/page.tsx` | 3 | setError calls |
| `/src/components/VisitCounter.tsx` | 1 | setError calls |
| `/src/components/EmailPopup.tsx` | 1 | Error array |
| `/src/app/register/RegistrationPageContent.tsx` | 5+ | statusMessage |
| `/src/app/login/LoginPageContent.tsx` | 3+ | statusMessage |
| `/src/components/RegistrationForm.tsx` | 5+ | Error messages |
| `/src/components/GoogleOAuthButton.tsx` | 2 | Error states |

#### Lower Priority - Dashboard & Item Management

| File | Estimated Strings | Pattern |
|------|-------------------|---------|
| `/src/app/dashboard/items/page.tsx` | 2 | Permission errors |
| `/src/app/dashboard/items/new/page.tsx` | 3 | Validation errors |
| `/src/app/dashboard/items/[publicId]/edit/page.tsx` | 4 | setError calls |
| `/src/app/dashboard/properties/page.tsx` | 2 | Permission errors |
| `/src/app/dashboard/properties/new/page.tsx` | 3 | Validation errors |
| `/src/app/dashboard/properties/[propertyId]/page.tsx` | 5 | setError calls |
| `/src/app/dashboard/properties/[propertyId]/edit/page.tsx` | 4 | setError calls |
| `/src/components/ItemCapture/**` | 8+ | Various setError |
| `/src/components/ItemCreationWorkflow/hooks/*.ts` | 5+ | Error messages |

### Estimated Total Strings: ~50-60

---

## Implementation Tasks

### Task 1: Define Notification Namespace Structure

**Objective:** Create the translation namespace structure for notifications in `/messages/en.json`

**Translation Key Structure:**
```json
{
  "common": {
    "notifications": {
      "success": {
        "saved": "Changes saved successfully",
        "created": "Item created successfully",
        "deleted": "Item deleted successfully",
        "copied": "Copied to clipboard",
        "uploaded": "File uploaded successfully",
        "sent": "Email sent successfully"
      },
      "error": {
        "generic": "Something went wrong. Please try again.",
        "network": "Network error. Please try again.",
        "permission": "You do not have permission to perform this action",
        "notFound": "The requested item was not found",
        "loadFailed": "Failed to load data",
        "saveFailed": "Failed to save changes",
        "sessionInit": "Failed to initialize session",
        "clipboard": "Unable to read clipboard. Please paste manually."
      },
      "warning": {
        "unsavedChanges": "You have unsaved changes",
        "sessionExpired": "Your session has expired"
      },
      "info": {
        "loading": "Loading...",
        "processing": "Processing...",
        "saving": "Saving...",
        "generating": "Generating..."
      },
      "tier": {
        "single": "Dashboard simplified for single property",
        "few": "Property selector now available",
        "multiple": "Filtering and grouping controls now available",
        "many": "Advanced tools now available"
      },
      "session": {
        "restored": "Your previous session has been restored",
        "itemCount": "{count, plural, one {# item} other {# items}}",
        "needsReupload": "{count, plural, one {# piece needs} other {# pieces need}} re-upload"
      },
      "qrGeneration": {
        "ready": "Ready to generate",
        "complete": "Complete!",
        "failed": "Generation failed",
        "generating": "Generating QR code {current} of {total}...",
        "progress": "{completed} of {total} completed",
        "completedWithFailures": "{completed} completed, {failed} failed",
        "failedItems": "{count, plural, one {# item} other {# items}} failed to generate"
      },
      "preview": {
        "unavailable": "Preview unavailable",
        "networkError": "Unable to load preview due to network connectivity issues."
      }
    }
  }
}
```

**Acceptance Criteria:**
- [ ] Namespace structure created in `/messages/en.json`
- [ ] Keys organized by notification type (success, error, warning, info)
- [ ] Special sections for tier, session, and QR generation messages
- [ ] ICU pluralization format used where appropriate

---

### Task 2: Update useTierChangeNotification Hook

**Objective:** Replace hardcoded tier change messages with translation keys

**File:** `/src/hooks/useTierChangeNotification.ts`

**Current Code:**
```typescript
const TIER_CHANGE_MESSAGES: Record<DashboardTier, string> = {
  single: 'Dashboard simplified for single property',
  few: 'Property selector now available',
  multiple: 'Filtering and grouping controls now available',
  many: 'Advanced tools now available',
};
```

**Target Pattern:**
```typescript
import { useTranslations } from 'next-intl';

export function useTierChangeNotification(
  currentTier: DashboardTier,
  enabled: boolean = true,
  autoDismissMs: number = 3000
): UseTierChangeNotificationReturn {
  const t = useTranslations('common.notifications.tier');

  // Use t(currentTier) to get the localized message
  const message = t(currentTier);
  // ...
}
```

**Acceptance Criteria:**
- [ ] Hook imports useTranslations from next-intl
- [ ] Tier messages retrieved from translation keys
- [ ] Fallback behavior maintained
- [ ] Hook functionality unchanged

---

### Task 3: Update SessionRecoveryBanner Component

**Objective:** Extract all user-facing strings from SessionRecoveryBanner

**File:** `/src/components/ItemCreationWorkflow/components/shared/SessionRecoveryBanner.tsx`

**Strings to Extract:**
- "Your previous session has been restored"
- "{itemCount} {itemCount === 1 ? 'item' : 'items'}"
- "{contentNeedingReUpload} {contentNeedingReUpload === 1 ? 'piece needs' : 'pieces need'} re-upload"
- "Continue Session"
- "Start Fresh"
- "Dismiss notification" (aria-label)

**Target Pattern:**
```typescript
import { useTranslations } from 'next-intl';

export function SessionRecoveryBanner({ ... }) {
  const t = useTranslations('common.notifications.session');
  const tActions = useTranslations('common.actions');

  return (
    <h3>{t('restored')}</h3>
    <p>{t('itemCount', { count: itemCount })}</p>
    // ...
  );
}
```

**Acceptance Criteria:**
- [ ] All visible text extracted to translation keys
- [ ] Pluralization handled with ICU format
- [ ] ARIA labels internationalized
- [ ] Component functionality unchanged

---

### Task 4: Update NetworkErrorIndicator Component

**Objective:** Extract all user-facing strings from NetworkErrorIndicator

**File:** `/src/components/ItemCreationWorkflow/components/shared/NetworkErrorIndicator.tsx`

**Strings to Extract:**
- "Preview unavailable"
- "Unable to load preview due to network connectivity issues."
- "Retrying..." / "Try Again"
- "Proceed Without Preview"
- ARIA labels

**Acceptance Criteria:**
- [ ] All visible text extracted to translation keys
- [ ] Button states handled (loading vs normal)
- [ ] ARIA labels internationalized
- [ ] Component functionality unchanged

---

### Task 5: Update QRGenerationProgress Component

**Objective:** Extract all user-facing strings from QRGenerationProgress

**File:** `/src/components/ItemCreationWorkflow/components/shared/QRGenerationProgress.tsx`

**Strings to Extract:**
- "Ready to generate"
- "Complete!"
- "Generation failed"
- "Generating QR code {x} of {y}..."
- "{x} of {y} completed"
- "{x} completed, {y} failed"
- Status labels: "Pending", "Generating...", "Completed", "Failed"
- "Retry", "Retry Failed", "Skip & Continue", "Cancel"
- "{count} item(s) failed to generate"

**Acceptance Criteria:**
- [ ] All visible text extracted to translation keys
- [ ] Dynamic interpolation for counts
- [ ] Pluralization for item counts
- [ ] ARIA labels internationalized
- [ ] Component functionality unchanged

---

### Task 6: Update State-Based Error Messages

**Objective:** Create a utility hook for translated error messages and update components

**New File:** `/src/hooks/useNotificationMessages.ts`

**Purpose:** Provide a reusable hook for getting translated notification messages

```typescript
import { useTranslations } from 'next-intl';

export function useNotificationMessages() {
  const t = useTranslations('common.notifications');

  return {
    success: {
      saved: () => t('success.saved'),
      created: () => t('success.created'),
      deleted: () => t('success.deleted'),
      // ...
    },
    error: {
      generic: () => t('error.generic'),
      network: () => t('error.network'),
      permission: () => t('error.permission'),
      loadFailed: () => t('error.loadFailed'),
      // ...
    },
    // ...
  };
}
```

**Files to Update:**
- `/src/components/ReactionButtons.tsx`
- `/src/components/UserDashboard.tsx`
- `/src/components/KPIDashboardOverview.tsx`
- `/src/app/request-access/page.tsx`
- `/src/app/simple-login/page.tsx`
- `/src/components/VisitCounter.tsx`
- `/src/components/EmailPopup.tsx`

**Acceptance Criteria:**
- [ ] Utility hook created with all common messages
- [ ] Components updated to use the hook
- [ ] Error messages remain clear and informative
- [ ] Dynamic parameters supported where needed

---

### Task 7: Update Auth-Related Notification Messages

**Objective:** Extract notification messages from authentication components

**Files:**
- `/src/app/register/RegistrationPageContent.tsx`
- `/src/app/login/LoginPageContent.tsx`
- `/src/components/RegistrationForm.tsx`
- `/src/components/GoogleOAuthButton.tsx`
- `/src/components/LoginForm.tsx`

**Note:** These may overlap with Sub-Epic 2A (Authentication). Coordinate to avoid duplication. Use the `auth` namespace for auth-specific messages.

**Acceptance Criteria:**
- [ ] All status messages extracted
- [ ] Consistent with auth namespace from Sub-Epic 2A
- [ ] Loading states internationalized
- [ ] Error states internationalized

---

### Task 8: Update Dashboard Item/Property Error Messages

**Objective:** Extract error messages from dashboard management pages

**Files:**
- `/src/app/dashboard/items/page.tsx`
- `/src/app/dashboard/items/new/page.tsx`
- `/src/app/dashboard/items/[publicId]/edit/page.tsx`
- `/src/app/dashboard/properties/page.tsx`
- `/src/app/dashboard/properties/new/page.tsx`
- `/src/app/dashboard/properties/[propertyId]/page.tsx`
- `/src/app/dashboard/properties/[propertyId]/edit/page.tsx`

**Note:** Use existing `errors` namespace from Sub-Epic 2J where appropriate.

**Acceptance Criteria:**
- [ ] Permission error messages extracted
- [ ] Validation error messages extracted
- [ ] API error messages extracted
- [ ] Consistent with errors namespace

---

### Task 9: Update ItemCapture/ItemCreationWorkflow Error Messages

**Objective:** Extract error messages from item capture and workflow components

**Files:**
- `/src/components/ItemCapture/ItemCapture.tsx`
- `/src/components/ItemCapture/hooks/useItemCaptureState.ts`
- `/src/components/ItemCapture/components/steps/UrlInputStep.tsx`
- `/src/components/ItemCapture/editors/VideoTrimmer.tsx`
- `/src/components/ItemCapture/editors/ImageCropper.tsx`
- `/src/components/ItemCreationWorkflow/hooks/useUrlPreview.ts`

**Acceptance Criteria:**
- [ ] All setError calls use translation keys
- [ ] Media error messages internationalized
- [ ] URL validation messages internationalized
- [ ] Consistent with workflow namespace

---

### Task 10: Generate Translations for Non-English Languages

**Objective:** Generate translations for all notification messages in 5 additional languages

**Languages:** French (fr), Spanish (es), German (de), Dutch (nl), Italian (it)

**Files to Update:**
- `/messages/fr.json`
- `/messages/es.json`
- `/messages/de.json`
- `/messages/nl.json`
- `/messages/it.json`

**Acceptance Criteria:**
- [ ] All notification keys have translations in all 6 languages
- [ ] Translations are contextually appropriate
- [ ] Pluralization rules work correctly per language
- [ ] No missing keys in any language file

---

## Authorized Files and Functions for Modification

### Translation Files

| File | Action | Sections |
|------|--------|----------|
| `/messages/en.json` | Modify | Add `common.notifications` namespace |
| `/messages/fr.json` | Modify | Add `common.notifications` namespace |
| `/messages/es.json` | Modify | Add `common.notifications` namespace |
| `/messages/de.json` | Modify | Add `common.notifications` namespace |
| `/messages/nl.json` | Modify | Add `common.notifications` namespace |
| `/messages/it.json` | Modify | Add `common.notifications` namespace |

### New Files

| File | Purpose |
|------|---------|
| `/src/hooks/useNotificationMessages.ts` | Utility hook for translated notifications |

### Component Files to Modify

| File | Functions/Components Affected |
|------|------------------------------|
| `/src/hooks/useTierChangeNotification.ts` | `useTierChangeNotification`, `TIER_CHANGE_MESSAGES` |
| `/src/components/ItemCreationWorkflow/components/shared/SessionRecoveryBanner.tsx` | `SessionRecoveryBanner` |
| `/src/components/ItemCreationWorkflow/components/shared/NetworkErrorIndicator.tsx` | `NetworkErrorIndicator` |
| `/src/components/ItemCreationWorkflow/components/shared/QRGenerationProgress.tsx` | `QRGenerationProgress`, `ProgressBar`, `ItemStatusRow`, `ErrorBanner` |
| `/src/components/SimpleDashboard/LoadingIndicator.tsx` | `LoadingIndicator` |
| `/src/components/ReactionButtons.tsx` | Error state handling |
| `/src/components/UserDashboard.tsx` | Error state handling |
| `/src/components/KPIDashboardOverview.tsx` | Error state handling |
| `/src/app/request-access/page.tsx` | `RequestAccessPage` |
| `/src/app/simple-login/page.tsx` | Login error handling |
| `/src/components/VisitCounter.tsx` | Error state handling |
| `/src/components/EmailPopup.tsx` | `EmailPopup` error handling |
| `/src/app/register/RegistrationPageContent.tsx` | Status message handling |
| `/src/app/login/LoginPageContent.tsx` | Status message handling |
| `/src/components/RegistrationForm.tsx` | Form error messages |
| `/src/components/GoogleOAuthButton.tsx` | Error states |
| `/src/components/LoginForm.tsx` | Form error messages |
| `/src/app/dashboard/items/page.tsx` | Error handling |
| `/src/app/dashboard/items/new/page.tsx` | Validation/error handling |
| `/src/app/dashboard/items/[publicId]/edit/page.tsx` | Error handling |
| `/src/app/dashboard/properties/page.tsx` | Error handling |
| `/src/app/dashboard/properties/new/page.tsx` | Validation/error handling |
| `/src/app/dashboard/properties/[propertyId]/page.tsx` | Error handling |
| `/src/app/dashboard/properties/[propertyId]/edit/page.tsx` | Error handling |
| `/src/components/ItemCapture/ItemCapture.tsx` | `setError` calls |
| `/src/components/ItemCapture/hooks/useItemCaptureState.ts` | Error state management |
| `/src/components/ItemCapture/components/steps/UrlInputStep.tsx` | Error messages |
| `/src/components/ItemCapture/editors/VideoTrimmer.tsx` | Error messages |
| `/src/components/ItemCapture/editors/ImageCropper.tsx` | Error messages |
| `/src/components/ItemCreationWorkflow/hooks/useUrlPreview.ts` | Error messages |

---

## Dependencies

### Internal Dependencies

| Dependency | Description |
|------------|-------------|
| Task 2H.1 | Common namespace structure must exist |
| Sub-Epic 2J | Error messages namespace (coordinate on overlap) |
| Sub-Epic 2A | Auth messages namespace (coordinate on overlap) |

### External Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| next-intl | As installed in Epic 1 | i18n framework |

---

## Risk Analysis

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Message context loss | Medium | Low | Review translations for appropriate context |
| Pluralization errors | Medium | Low | Test with various count values |
| Dynamic message breaks | Low | Medium | Ensure interpolation params match |
| Component re-renders | Low | Low | Use stable translation hook patterns |

---

## Testing Requirements

### Unit Tests
- Verify translation keys resolve correctly
- Test pluralization with count values (0, 1, 2, many)
- Test dynamic interpolation parameters
- Verify fallback behavior when translation missing

### Integration Tests
- Test notification flow end-to-end
- Verify tier change notifications display correctly
- Test session recovery banner in all states
- Test QR generation progress messages

### Manual Testing Checklist
- [ ] All notification messages appear in correct language
- [ ] Pluralization works correctly (1 item vs 2 items)
- [ ] Dynamic values render correctly ({count} of {total})
- [ ] Screen readers announce notifications properly
- [ ] Loading/progress states show translated text
- [ ] Error messages are clear and actionable

---

## Acceptance Criteria Summary

Based on PRD REQ-308:
- [ ] All toast notification trigger points across the application have been identified and catalogued
- [ ] Success notification messages are extracted to translation keys and replaced with translation function calls
- [ ] Error and warning notification messages use translation keys instead of hardcoded strings
- [ ] Informational toast messages are internationalized
- [ ] Common notification patterns share consistent translation keys across different features
- [ ] Translation files include organized sections for notification messages with clear naming by type or severity
- [ ] Notification messages can accept dynamic parameters when needed for user-specific or context-specific content
- [ ] All notification functionality including timing, positioning, and dismiss behavior remains unchanged
- [ ] Notification accessibility attributes are properly maintained with translated content
- [ ] The tone and clarity of messages are preserved across all notification types

---

## References

- [PRD: L10N Epic 2 - Static UI Translation](/docs/prd/PRD_L10N_Epic2_Static_UI_Translation.md)
- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [Gen Requests Epic 2](/docs/gen_requests_epic2.md) - REQ-308
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
