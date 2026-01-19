# Implementation Overview: REQ-341 - Extract Toast Notification Messages for Internationalization

**Generated:** 2026-01-19 UTC
**Last Modified:** 2026-01-19 UTC
**Request ID:** REQ-341 (mapped from REQ-308, Task 2H.5)
**Sub-Epic:** 2H - Common & Shared Components
**Task ID:** 2H.5
**Size:** M (Medium)
**Priority:** P1 - High (Part of Common & Shared foundation)

---

## Summary

Extract all hardcoded toast notification messages from components throughout the FAQBNB application and replace them with translation keys using the next-intl translation system. This enables notification messages to appear in the user's preferred language across all 6 supported locales (en, fr, es, de, nl, it).

---

## Background

### Current Behavior

Toast notifications throughout the application contain hardcoded English text for:
- **Success messages** (e.g., "Successfully generated {count} QR codes!", "PDF exported successfully!")
- **Error alerts** (e.g., "Failed to generate QR codes", "Failed to create property")
- **Informational updates** (e.g., "Dashboard simplified for single property", "Property selector now available")
- **Warning notifications** (e.g., "You have unsaved changes", "Access code validation failed")

These messages are embedded directly in component code or hook functions. Users see only English notifications regardless of their language preference.

### Expected Behavior

All toast notification messages should be retrieved from translation keys using the `useTranslations` hook. Notifications will appear in the user's selected language. The translation system provides appropriate fallbacks when specific translations are unavailable. Dynamic notifications (with item counts, names, etc.) use proper interpolation while maintaining grammatically correct translations.

---

## Technical Context

### Dependencies from Epic 1

| Dependency | Location | Status |
|------------|----------|--------|
| next-intl package | `package.json` | ✅ Installed |
| i18n config | `/src/lib/i18n/config.ts` | ✅ Complete |
| IntlProvider | `/src/app/layout.tsx` | ✅ Configured |
| Translation files | `/messages/*.json` | ✅ Structure exists |
| useTranslations hook | next-intl | ✅ Available |

### Existing Translation Namespace Structure

The `/messages/en.json` file already contains a `common` namespace with basic strings. Toast notification messages should be added under a new `common.notifications` sub-namespace for organization.

---

## Analysis of Notification Patterns

### Pattern 1: State-Based Success/Error Messages

Found in components like `QRCodePrintManager.tsx`:

```typescript
// Current implementation (hardcoded)
setSuccessMessage(`Successfully generated ${results.size} QR codes!`);
setLastError({ message: 'Failed to generate QR codes', isRetryable: true });
```

### Pattern 2: Tier Change Notification Hook

Found in `useTierChangeNotification.ts`:

```typescript
// Current implementation (hardcoded object)
const TIER_CHANGE_MESSAGES: Record<DashboardTier, string> = {
  single: 'Dashboard simplified for single property',
  few: 'Property selector now available',
  multiple: 'Filtering and grouping controls now available',
  many: 'Advanced tools now available',
};
```

### Pattern 3: Form Submission Feedback

Found in modals and forms like `AddPropertyModal.tsx`:

```typescript
// Current implementation (hardcoded in error state)
setErrors({
  general: error instanceof Error ? error.message : 'Failed to create property',
});
```

### Pattern 4: Inline Status Messages

Found in workflow components:

```typescript
// Current implementation (hardcoded JSX text)
<p className="text-gray-500">No QR codes generated yet</p>
```

---

## Proposed Translation Namespace Structure

Add to `/messages/en.json` under the `common` namespace:

```json
{
  "common": {
    "notifications": {
      "success": {
        "generic": "Operation completed successfully",
        "saved": "Changes saved successfully",
        "created": "{item} created successfully",
        "updated": "{item} updated successfully",
        "deleted": "{item} deleted successfully",
        "uploaded": "File uploaded successfully",
        "exported": "Export completed successfully"
      },
      "error": {
        "generic": "Something went wrong. Please try again.",
        "createFailed": "Failed to create {item}",
        "updateFailed": "Failed to update {item}",
        "deleteFailed": "Failed to delete {item}",
        "uploadFailed": "Upload failed. Please try again.",
        "networkError": "Network error. Please check your connection.",
        "validationFailed": "Please check your input and try again.",
        "unauthorized": "You are not authorized to perform this action."
      },
      "warning": {
        "unsavedChanges": "You have unsaved changes",
        "sessionExpiring": "Your session will expire soon",
        "limitReached": "You have reached the {limit} limit"
      },
      "info": {
        "processing": "Processing...",
        "pleaseWait": "Please wait...",
        "loading": "Loading..."
      },
      "qrCode": {
        "generateSuccess": "Successfully generated {count, plural, one {# QR code} other {# QR codes}}!",
        "generateFailed": "Failed to generate QR codes",
        "pdfExportSuccess": "PDF exported successfully! {count} QR codes included.",
        "pdfExportFailed": "Failed to export PDF. Please try again.",
        "noCodesAvailable": "No QR codes available for export",
        "noCodesGenerated": "No QR codes generated yet"
      },
      "property": {
        "createSuccess": "Property created successfully",
        "createFailed": "Failed to create property",
        "updateSuccess": "Property updated successfully",
        "updateFailed": "Failed to update property",
        "deleteSuccess": "Property deleted successfully",
        "deleteFailed": "Failed to delete property"
      },
      "item": {
        "createSuccess": "Item created successfully",
        "createFailed": "Failed to create item",
        "updateSuccess": "Item updated successfully",
        "updateFailed": "Failed to update item",
        "deleteSuccess": "Item deleted successfully",
        "deleteFailed": "Failed to delete item"
      },
      "dashboard": {
        "tierSingle": "Dashboard simplified for single property",
        "tierFew": "Property selector now available",
        "tierMultiple": "Filtering and grouping controls now available",
        "tierMany": "Advanced tools now available"
      },
      "auth": {
        "loginSuccess": "Login successful! Redirecting...",
        "logoutSuccess": "You have been signed out",
        "sessionExpired": "Your session has expired. Please sign in again.",
        "accessDenied": "Access denied",
        "codeValidationFailed": "Access code validation failed"
      },
      "file": {
        "uploadSuccess": "File uploaded successfully",
        "uploadFailed": "File upload failed. Please try again.",
        "tooLarge": "File size exceeds the maximum limit",
        "invalidType": "Invalid file type"
      }
    }
  }
}
```

---

## Implementation Tasks

### Task 1: Extend Common Namespace with Notifications Structure
- Add `notifications` sub-namespace to `/messages/en.json`
- Organize by notification type (success, error, warning, info) and feature area
- Include pluralization support for count-based messages

### Task 2: Update QRCodePrintManager Notifications
- Extract success messages for QR generation and PDF export
- Extract error messages with retry context
- Replace hardcoded strings with `useTranslations('common.notifications.qrCode')`

### Task 3: Update useTierChangeNotification Hook
- Extract `TIER_CHANGE_MESSAGES` object values to translation keys
- Update hook to use translations with `useTranslations('common.notifications.dashboard')`
- Maintain return type interface

### Task 4: Update Form Submission Notifications
- Extract success/error feedback messages from modal components
- Update `AddPropertyModal.tsx`, `PropertyEditModal.tsx`
- Update registration and authentication flow components

### Task 5: Update Workflow Component Notifications
- Extract inline status messages from ItemCreationWorkflow components
- Update `ContentCreationStep.tsx` and related step components
- Update session recovery and progress indicators

### Task 6: Create Notification Translation Utility (Optional Enhancement)
- Create reusable utility for common notification patterns
- Standardize notification message formatting across components

### Task 7: Generate Translations for Non-English Languages
- Propagate all notification keys to fr.json, es.json, de.json, nl.json, it.json
- Ensure pluralization rules are correct for each language

### Task 8: Testing and Verification
- Verify notifications display in all supported languages
- Test dynamic interpolation with variables
- Verify accessibility (screen reader announcements)

---

## Authorized Files and Functions for Modification

### Translation Files

| File Path | Modifications |
|-----------|---------------|
| `/messages/en.json` | Add `common.notifications` namespace structure |
| `/messages/fr.json` | Add French translations for notifications |
| `/messages/es.json` | Add Spanish translations for notifications |
| `/messages/de.json` | Add German translations for notifications |
| `/messages/nl.json` | Add Dutch translations for notifications |
| `/messages/it.json` | Add Italian translations for notifications |

### Component Files

| File Path | Functions/Elements to Modify |
|-----------|------------------------------|
| `/src/components/QRCodePrintManager.tsx` | `setSuccessMessage()`, `setLastError()` calls (~8 notification strings) |
| `/src/hooks/useTierChangeNotification.ts` | `TIER_CHANGE_MESSAGES` object (4 strings) |
| `/src/components/SimpleDashboard/AddPropertyModal.tsx` | Error state messages (~3 strings) |
| `/src/components/SimpleDashboard/PropertyEditModal.tsx` | Error state messages (~3 strings) |
| `/src/components/RegistrationForm.tsx` | Form feedback messages (~5 strings) |
| `/src/components/LoginForm.tsx` | Authentication feedback (~4 strings) |
| `/src/components/ItemCreationWorkflow/components/steps/ContentCreationStep.tsx` | Error handling messages (~2 strings) |
| `/src/components/ItemCreationWorkflow/components/shared/SessionRecoveryBanner.tsx` | Recovery notification messages (~3 strings) |
| `/src/components/ItemCreationWorkflow/components/shared/QRGenerationProgress.tsx` | Progress/completion messages (~4 strings) |
| `/src/components/ItemCreationWorkflow/components/shared/NetworkErrorIndicator.tsx` | Error messages (~2 strings) |
| `/src/app/login/LoginPageContent.tsx` | Login feedback messages (~3 strings) |
| `/src/app/register/complete/page.tsx` | Registration completion messages (~3 strings) |
| `/src/app/register/success/page.tsx` | Success feedback messages (~2 strings) |
| `/src/contexts/AuthContext.tsx` | Authentication state messages (~3 strings) |

### Estimated String Count: ~50 notification strings

---

## Integration Pattern

### Before (Hardcoded)

```typescript
// In QRCodePrintManager.tsx
setSuccessMessage(`Successfully generated ${results.size} QR codes!`);
```

### After (Translated)

```typescript
import { useTranslations } from 'next-intl';

function QRCodePrintManager() {
  const t = useTranslations('common.notifications.qrCode');

  // ...
  setSuccessMessage(t('generateSuccess', { count: results.size }));
}
```

### Hook Pattern (useTierChangeNotification)

```typescript
// Before
const TIER_CHANGE_MESSAGES: Record<DashboardTier, string> = {
  single: 'Dashboard simplified for single property',
  // ...
};

// After
import { useTranslations } from 'next-intl';

export function useTierChangeNotification(/*...*/) {
  const t = useTranslations('common.notifications.dashboard');

  const TIER_CHANGE_KEYS: Record<DashboardTier, string> = {
    single: 'tierSingle',
    few: 'tierFew',
    multiple: 'tierMultiple',
    many: 'tierMany',
  };

  // Use t(TIER_CHANGE_KEYS[currentTier]) instead of direct messages
}
```

---

## Acceptance Criteria

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
- [ ] All 6 language files (en, fr, es, de, nl, it) contain the notification translations

---

## Dependencies

### Depends On
- Epic 1 Foundation (REQ-229 through REQ-234) - ✅ Complete
- Task 2H.1: Create common namespace structure - Should be completed first

### Blocks
- Task 2H.6: Extract empty state messages (shares similar patterns)
- Task 2H.7: Extract loading state messages (shares similar patterns)

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Notification strings scattered across many files | Medium | Medium | Systematic search using grep for patterns like `setSuccess`, `setError`, `notification` |
| Dynamic notifications with complex interpolation | Medium | Low | Use ICU message format for plurals and variables |
| Breaking existing notification display logic | Low | Medium | Preserve state management patterns; only replace string values |
| Missing notifications during initial audit | Medium | Low | Include string count verification in testing phase |

---

## Effort Estimate

| Task | Estimate |
|------|----------|
| Task 1: Extend namespace structure | 0.5 hours |
| Task 2: QRCodePrintManager updates | 1 hour |
| Task 3: useTierChangeNotification hook | 0.5 hours |
| Task 4: Form submission notifications | 2 hours |
| Task 5: Workflow component notifications | 1.5 hours |
| Task 6: Optional utility (if needed) | 1 hour |
| Task 7: Generate translations | 1 hour |
| Task 8: Testing and verification | 1.5 hours |
| **Total** | **~9 hours** |

---

## References

- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [REQ-308: Extract Toast Notification Messages](/docs/gen_requests_epic2.md)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)

---

## Appendix: Notification String Inventory

### QRCodePrintManager.tsx (~8 strings)
1. `Successfully generated {count} QR codes!`
2. `PDF exported successfully! {count} QR codes included.`
3. `Failed to generate QR codes`
4. `Failed to export PDF. Please try again.`
5. `No QR codes available for PDF export. Please generate QR codes first.`
6. `No QR codes available for PDF export.`
7. `Invalid page format. Please select A4 or Letter.`
8. `Margins must be between 5 and 25 millimeters.`

### useTierChangeNotification.ts (4 strings)
1. `Dashboard simplified for single property`
2. `Property selector now available`
3. `Filtering and grouping controls now available`
4. `Advanced tools now available`

### AddPropertyModal.tsx (~3 strings)
1. `Failed to create property`
2. `Property name is required`
3. `Creating property...` (aria-live)

### Authentication Components (~10 strings)
1. `Login successful! Redirecting...`
2. `Completing authentication...`
3. `Invalid email or password`
4. `Session expired. Please sign in again.`
5. `Access code validation failed`
6. `Registration successful`
7. `Creating Account...`
8. `Connecting to Google...`
9. `Registration Failed`
10. `You have been signed out`

### Workflow Components (~5 strings)
1. `No QR codes generated yet`
2. `Error handling - could show toast/alert in future enhancement`
3. `Session recovery available`
4. `Content saved`
5. `Upload in progress`

---

*Document generated for FAQBNB Localization Epic 2 - Static UI Translation*
*Task 2H.5: Extract Toast Notification Messages*
