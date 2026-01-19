# Detailed Task Breakdown: REQ-341 - Extract Toast Notification Messages for Internationalization

**Generated:** 2026-01-19 UTC
**Last Modified:** 2026-01-19 UTC
**Request ID:** REQ-341 (mapped from REQ-308, Task 2H.5)
**Sub-Epic:** 2H - Common & Shared Components
**Task ID:** 2H.5
**Size:** M (Medium)
**Priority:** P1 - High (Part of Common & Shared foundation)
**Overview Document:** [REQ-341-extract-toast-notification-messages-overview.md](./REQ-341-extract-toast-notification-messages-overview.md)

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Prerequisites](#prerequisites)
3. [Task Breakdown](#task-breakdown)
4. [Translation Key Structure](#translation-key-structure)
5. [Component Modification Details](#component-modification-details)
6. [Testing Checklist](#testing-checklist)
7. [Rollback Plan](#rollback-plan)

---

## Executive Summary

This document provides granular, implementation-ready tasks for extracting all hardcoded toast notification messages from FAQBNB components and replacing them with translation keys using the next-intl translation system. The task involves ~50 notification strings across 13+ component files.

**Scope:**
- Extract notification strings from QRCodePrintManager, useTierChangeNotification hook, form modals, authentication components, and workflow components
- Add `common.notifications` namespace structure to all 6 language files
- Maintain existing notification functionality (timing, positioning, dismiss behavior)
- Support dynamic interpolation for count-based and context-specific messages

---

## Prerequisites

Before starting this task, ensure the following are complete:

| Prerequisite | Status Check | Required |
|-------------|--------------|----------|
| Epic 1 Foundation complete | Check `/src/lib/i18n/config.ts` exists | ✅ Yes |
| next-intl installed | Check `package.json` for next-intl | ✅ Yes |
| IntlProvider configured | Check `/src/app/layout.tsx` | ✅ Yes |
| Translation files exist | Check `/messages/*.json` files | ✅ Yes |
| Task 2H.1 (common namespace) | Check `common` namespace in en.json | Recommended |

---

## Task Breakdown

### Task 1: Extend Common Namespace with Notifications Structure
**Story Points:** 1
**Priority:** Critical (Foundation)
**Estimated Duration:** Implementation task

#### 1.1 Add notifications sub-namespace to en.json

**File:** `/messages/en.json`

**Action:** Add the following `notifications` sub-namespace under the existing `common` namespace:

```json
{
  "common": {
    // ... existing common keys ...
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
        "unauthorized": "You are not authorized to perform this action.",
        "invalidSettings": "Invalid settings provided."
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
        "noCodesGenerated": "No QR codes generated yet",
        "invalidPageFormat": "Invalid page format. Please select A4 or Letter.",
        "invalidMargins": "Margins must be between 5 and 25 millimeters.",
        "invalidQrSize": "QR code size must be between 20 and 60 millimeters."
      },
      "property": {
        "createSuccess": "Property created successfully",
        "createFailed": "Failed to create property",
        "updateSuccess": "Property updated successfully",
        "updateFailed": "Failed to update property",
        "deleteSuccess": "Property deleted successfully",
        "deleteFailed": "Failed to delete property",
        "nameRequired": "Property name is required"
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
        "invalidCredentials": "Invalid email or password. Please check your credentials and try again.",
        "adminRequired": "Access denied. Admin privileges are required.",
        "codeValidationFailed": "Access code validation failed",
        "registrationSuccess": "Registration successful",
        "registrationFailed": "Registration failed",
        "creatingAccount": "Creating Account...",
        "connectingGoogle": "Connecting to Google...",
        "completingAuth": "Completing authentication...",
        "loginFailed": "Login failed: No user returned"
      },
      "file": {
        "uploadSuccess": "File uploaded successfully",
        "uploadFailed": "File upload failed. Please try again.",
        "tooLarge": "File size exceeds the maximum limit",
        "invalidType": "Invalid file type"
      },
      "workflow": {
        "sessionRecoveryAvailable": "Session recovery available",
        "contentSaved": "Content saved",
        "uploadInProgress": "Upload in progress"
      }
    }
  }
}
```

**Verification:**
- [ ] JSON syntax is valid (no trailing commas, proper nesting)
- [ ] All notification types are covered (success, error, warning, info)
- [ ] Pluralization uses ICU format for count-based messages
- [ ] Variable placeholders use `{variable}` syntax

---

#### 1.2 Propagate notifications namespace to other language files

**Files to update:**
- `/messages/fr.json`
- `/messages/es.json`
- `/messages/de.json`
- `/messages/nl.json`
- `/messages/it.json`

**Action for each file:** Add the same `notifications` structure with translated values.

**French (fr.json) translations:**
```json
{
  "common": {
    "notifications": {
      "success": {
        "generic": "Opération terminée avec succès",
        "saved": "Modifications enregistrées avec succès",
        "created": "{item} créé avec succès",
        "updated": "{item} mis à jour avec succès",
        "deleted": "{item} supprimé avec succès",
        "uploaded": "Fichier téléchargé avec succès",
        "exported": "Exportation terminée avec succès"
      },
      "error": {
        "generic": "Une erreur s'est produite. Veuillez réessayer.",
        "createFailed": "Échec de la création de {item}",
        "updateFailed": "Échec de la mise à jour de {item}",
        "deleteFailed": "Échec de la suppression de {item}",
        "uploadFailed": "Échec du téléchargement. Veuillez réessayer.",
        "networkError": "Erreur réseau. Veuillez vérifier votre connexion.",
        "validationFailed": "Veuillez vérifier vos données et réessayer.",
        "unauthorized": "Vous n'êtes pas autorisé à effectuer cette action.",
        "invalidSettings": "Paramètres invalides fournis."
      },
      "warning": {
        "unsavedChanges": "Vous avez des modifications non enregistrées",
        "sessionExpiring": "Votre session expire bientôt",
        "limitReached": "Vous avez atteint la limite de {limit}"
      },
      "info": {
        "processing": "Traitement en cours...",
        "pleaseWait": "Veuillez patienter...",
        "loading": "Chargement..."
      },
      "qrCode": {
        "generateSuccess": "{count, plural, one {# code QR généré} other {# codes QR générés}} avec succès !",
        "generateFailed": "Échec de la génération des codes QR",
        "pdfExportSuccess": "PDF exporté avec succès ! {count} codes QR inclus.",
        "pdfExportFailed": "Échec de l'exportation PDF. Veuillez réessayer.",
        "noCodesAvailable": "Aucun code QR disponible pour l'exportation",
        "noCodesGenerated": "Aucun code QR généré pour le moment",
        "invalidPageFormat": "Format de page invalide. Veuillez sélectionner A4 ou Letter.",
        "invalidMargins": "Les marges doivent être comprises entre 5 et 25 millimètres.",
        "invalidQrSize": "La taille du code QR doit être comprise entre 20 et 60 millimètres."
      },
      "property": {
        "createSuccess": "Propriété créée avec succès",
        "createFailed": "Échec de la création de la propriété",
        "updateSuccess": "Propriété mise à jour avec succès",
        "updateFailed": "Échec de la mise à jour de la propriété",
        "deleteSuccess": "Propriété supprimée avec succès",
        "deleteFailed": "Échec de la suppression de la propriété",
        "nameRequired": "Le nom de la propriété est requis"
      },
      "item": {
        "createSuccess": "Article créé avec succès",
        "createFailed": "Échec de la création de l'article",
        "updateSuccess": "Article mis à jour avec succès",
        "updateFailed": "Échec de la mise à jour de l'article",
        "deleteSuccess": "Article supprimé avec succès",
        "deleteFailed": "Échec de la suppression de l'article"
      },
      "dashboard": {
        "tierSingle": "Tableau de bord simplifié pour une seule propriété",
        "tierFew": "Sélecteur de propriété maintenant disponible",
        "tierMultiple": "Contrôles de filtrage et de regroupement maintenant disponibles",
        "tierMany": "Outils avancés maintenant disponibles"
      },
      "auth": {
        "loginSuccess": "Connexion réussie ! Redirection...",
        "logoutSuccess": "Vous avez été déconnecté",
        "sessionExpired": "Votre session a expiré. Veuillez vous reconnecter.",
        "accessDenied": "Accès refusé",
        "invalidCredentials": "Email ou mot de passe invalide. Veuillez vérifier vos identifiants et réessayer.",
        "adminRequired": "Accès refusé. Privilèges administrateur requis.",
        "codeValidationFailed": "Échec de la validation du code d'accès",
        "registrationSuccess": "Inscription réussie",
        "registrationFailed": "Échec de l'inscription",
        "creatingAccount": "Création du compte...",
        "connectingGoogle": "Connexion à Google...",
        "completingAuth": "Finalisation de l'authentification...",
        "loginFailed": "Échec de connexion : Aucun utilisateur retourné"
      },
      "file": {
        "uploadSuccess": "Fichier téléchargé avec succès",
        "uploadFailed": "Échec du téléchargement. Veuillez réessayer.",
        "tooLarge": "La taille du fichier dépasse la limite maximale",
        "invalidType": "Type de fichier invalide"
      },
      "workflow": {
        "sessionRecoveryAvailable": "Récupération de session disponible",
        "contentSaved": "Contenu enregistré",
        "uploadInProgress": "Téléchargement en cours"
      }
    }
  }
}
```

**Note:** Spanish, German, Dutch, and Italian translations follow the same structure. Use AI translation or professional translation services to generate accurate translations for each language.

---

### Task 2: Update QRCodePrintManager Notifications
**Story Points:** 1
**Priority:** High
**Estimated Duration:** Implementation task

**File:** `/src/components/QRCodePrintManager.tsx`

#### 2.1 Add translation import and hook

**Location:** Top of file (after existing imports, around line 38)

**Before:**
```typescript
import { cn } from '@/lib/utils';
```

**After:**
```typescript
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
```

#### 2.2 Initialize translation hook inside component

**Location:** Inside the `QRCodePrintManager` function (around line 67)

**Add after the `usePrintWindow` hook:**
```typescript
// Translation hook for notification messages
const t = useTranslations('common.notifications.qrCode');
```

#### 2.3 Replace success message for QR generation

**Location:** Line ~275

**Before:**
```typescript
setSuccessMessage(`Successfully generated ${results.size} QR codes!`);
```

**After:**
```typescript
setSuccessMessage(t('generateSuccess', { count: results.size }));
```

#### 2.4 Replace error message for QR generation failure

**Location:** Line ~282

**Before:**
```typescript
setLastError({
  message: error.message || 'Failed to generate QR codes',
  isRetryable
});
```

**After:**
```typescript
setLastError({
  message: error.message || t('generateFailed'),
  isRetryable
});
```

#### 2.5 Replace PDF validation error messages

**Location:** Lines ~299-319

**Before:**
```typescript
setLastError({ message: 'Invalid page format. Please select A4 or Letter.', isRetryable: false });
// ...
setLastError({ message: 'Margins must be between 5 and 25 millimeters.', isRetryable: false });
// ...
setLastError({ message: 'QR code size must be between 20 and 60 millimeters.', isRetryable: false });
// ...
setLastError({ message: 'Invalid PDF settings.', isRetryable: false });
```

**After:**
```typescript
setLastError({ message: t('invalidPageFormat'), isRetryable: false });
// ...
setLastError({ message: t('invalidMargins'), isRetryable: false });
// ...
setLastError({ message: t('invalidQrSize'), isRetryable: false });
// ...
setLastError({ message: t('invalidSettings'), isRetryable: false });
```

**Note:** For `invalidSettings`, use `const tErrors = useTranslations('common.notifications.error');` and call `tErrors('invalidSettings')`.

#### 2.6 Replace PDF export no QR codes error

**Location:** Line ~324

**Before:**
```typescript
setLastError({ message: 'No QR codes available for PDF export. Please generate QR codes first.', isRetryable: false });
```

**After:**
```typescript
setLastError({ message: t('noCodesAvailable'), isRetryable: false });
```

#### 2.7 Replace PDF export success message

**Location:** Line ~416

**Before:**
```typescript
setSuccessMessage(`PDF exported successfully! ${qrCodesArray.length} QR codes included.`);
```

**After:**
```typescript
setSuccessMessage(t('pdfExportSuccess', { count: qrCodesArray.length }));
```

#### 2.8 Replace PDF export error message

**Location:** Line ~430

**Before:**
```typescript
setLastError({
  message: error.message || 'Failed to export PDF. Please try again.',
  isRetryable: true
});
```

**After:**
```typescript
setLastError({
  message: error.message || t('pdfExportFailed'),
  isRetryable: true
});
```

#### 2.9 Replace "no QR codes available for export" message

**Location:** Line ~440

**Before:**
```typescript
setLastError({ message: 'No QR codes available for PDF export.', isRetryable: false });
```

**After:**
```typescript
setLastError({ message: t('noCodesAvailable'), isRetryable: false });
```

**Verification Checklist:**
- [ ] Import statement added correctly
- [ ] useTranslations hook initialized
- [ ] All 8+ notification strings replaced
- [ ] Interpolation variables match translation keys
- [ ] Component still compiles without errors

---

### Task 3: Update useTierChangeNotification Hook
**Story Points:** 0.5
**Priority:** High
**Estimated Duration:** Implementation task

**File:** `/src/hooks/useTierChangeNotification.ts`

#### 3.1 Add translation import

**Location:** Top of file (after line 8)

**Add:**
```typescript
import { useTranslations } from 'next-intl';
```

#### 3.2 Remove hardcoded messages object

**Location:** Lines 14-19

**Before:**
```typescript
const TIER_CHANGE_MESSAGES: Record<DashboardTier, string> = {
  single: 'Dashboard simplified for single property',
  few: 'Property selector now available',
  multiple: 'Filtering and grouping controls now available',
  many: 'Advanced tools now available',
};
```

**After:**
```typescript
// Translation key mapping for tier change messages
const TIER_CHANGE_KEYS: Record<DashboardTier, string> = {
  single: 'tierSingle',
  few: 'tierFew',
  multiple: 'tierMultiple',
  many: 'tierMany',
};
```

#### 3.3 Update hook to use translations

**Location:** Inside the `useTierChangeNotification` function (around line 54)

**Add after function parameters:**
```typescript
const t = useTranslations('common.notifications.dashboard');
```

#### 3.4 Update notification setting

**Location:** Line ~84

**Before:**
```typescript
const message = TIER_CHANGE_MESSAGES[currentTier];
setNotification(message);
```

**After:**
```typescript
const messageKey = TIER_CHANGE_KEYS[currentTier];
const message = t(messageKey);
setNotification(message);
```

**Verification Checklist:**
- [ ] Import statement added
- [ ] TIER_CHANGE_MESSAGES renamed to TIER_CHANGE_KEYS with key strings
- [ ] useTranslations hook added inside function
- [ ] Notification message uses translated value
- [ ] Hook maintains same return type interface

---

### Task 4: Update AddPropertyModal Error Notifications
**Story Points:** 0.5
**Priority:** Medium
**Estimated Duration:** Implementation task

**File:** `/src/components/SimpleDashboard/AddPropertyModal.tsx`

#### 4.1 Add translation import

**Location:** Top of file (with other imports)

**Add:**
```typescript
import { useTranslations } from 'next-intl';
```

#### 4.2 Initialize translation hook

**Location:** Inside the component function (after other hooks)

**Add:**
```typescript
const tNotifications = useTranslations('common.notifications.property');
```

#### 4.3 Replace error message for property creation failure

**Location:** Line ~248

**Before:**
```typescript
setErrors({
  general: error instanceof Error ? error.message : 'Failed to create property',
});
```

**After:**
```typescript
setErrors({
  general: error instanceof Error ? error.message : tNotifications('createFailed'),
});
```

#### 4.4 Replace "Property name is required" validation message

**Location:** Line ~97

**Before:**
```typescript
errors.name = 'Property name is required';
```

**After (optional - can use common.validation namespace):**
```typescript
// If using property-specific message:
errors.name = tNotifications('nameRequired');
```

**Note:** Validation messages may be handled in Task 2H.4 (Form Element Strings). Coordinate to avoid duplication.

**Verification Checklist:**
- [ ] Import added
- [ ] Hook initialized
- [ ] Error fallback message uses translation
- [ ] Form still submits correctly

---

### Task 5: Update LoginForm Error Notifications
**Story Points:** 0.5
**Priority:** Medium
**Estimated Duration:** Implementation task

**File:** `/src/components/LoginForm.tsx`

#### 5.1 Add translation import

**Location:** Top of file

**Add:**
```typescript
import { useTranslations } from 'next-intl';
```

#### 5.2 Initialize translation hook

**Location:** Inside the component function

**Add:**
```typescript
const tAuth = useTranslations('common.notifications.auth');
```

#### 5.3 Replace authentication error messages

**Location:** Lines ~138-143

**Before:**
```typescript
if (errorMessage.includes('Invalid login credentials') || /* ... */) {
  setErrors({ general: 'Invalid email or password. Please check your credentials and try again.' });
} else if (errorMessage.includes('admin privileges') || /* ... */) {
  setErrors({ general: 'Access denied. Admin privileges are required.' });
} else {
  setErrors({ general: errorMessage });
}
```

**After:**
```typescript
if (errorMessage.includes('Invalid login credentials') || /* ... */) {
  setErrors({ general: tAuth('invalidCredentials') });
} else if (errorMessage.includes('admin privileges') || /* ... */) {
  setErrors({ general: tAuth('adminRequired') });
} else {
  setErrors({ general: errorMessage });
}
```

#### 5.4 Replace "Login failed: No user returned" message

**Location:** Line ~161

**Before:**
```typescript
setErrors({ general: 'Login failed: No user returned' });
```

**After:**
```typescript
setErrors({ general: tAuth('loginFailed') });
```

**Verification Checklist:**
- [ ] Import added
- [ ] Hook initialized
- [ ] All hardcoded auth error messages replaced
- [ ] Login flow still works correctly

---

### Task 6: Update RegistrationForm Notifications
**Story Points:** 1
**Priority:** Medium
**Estimated Duration:** Implementation task

**File:** `/src/components/RegistrationForm.tsx`

#### 6.1 Add translation import and hook

**Location:** Top of file and inside component

**Add import:**
```typescript
import { useTranslations } from 'next-intl';
```

**Add hook inside component:**
```typescript
const tAuth = useTranslations('common.notifications.auth');
```

#### 6.2 Replace registration error messages

**Strings to replace (approximate line numbers from grep results):**
- Line ~324: `'Registration Failed'` → `tAuth('registrationFailed')`
- Line ~542: `'Registration failed'` → `tAuth('registrationFailed')`
- Line ~299, ~324: Dynamic error messages - keep as-is if they come from API

#### 6.3 Replace loading/progress messages

**Strings to replace:**
- `'Creating Account...'` → `tAuth('creatingAccount')`
- `'Connecting to Google...'` → `tAuth('connectingGoogle')`

**Verification Checklist:**
- [ ] Import and hook added
- [ ] Error messages replaced
- [ ] Loading states replaced
- [ ] Registration flow works end-to-end

---

### Task 7: Update Workflow Component Notifications
**Story Points:** 1
**Priority:** Medium
**Estimated Duration:** Implementation task

This task covers multiple workflow-related components.

#### 7.1 SessionRecoveryBanner.tsx

**File:** `/src/components/ItemCreationWorkflow/components/shared/SessionRecoveryBanner.tsx`

**Strings to extract:**
- "Session recovery available"
- Recovery-related status messages

#### 7.2 QRGenerationProgress.tsx

**File:** `/src/components/ItemCreationWorkflow/components/shared/QRGenerationProgress.tsx`

**Strings to extract:**
- Progress indicators
- Completion messages

#### 7.3 NetworkErrorIndicator.tsx

**File:** `/src/components/ItemCreationWorkflow/components/shared/NetworkErrorIndicator.tsx`

**Strings to extract:**
- Network error messages
- Retry prompts

**Pattern for all workflow components:**
```typescript
import { useTranslations } from 'next-intl';

// Inside component:
const tWorkflow = useTranslations('common.notifications.workflow');

// Replace strings:
// Before: "Session recovery available"
// After: tWorkflow('sessionRecoveryAvailable')
```

**Verification Checklist:**
- [ ] All workflow notification files identified
- [ ] Each file has translation imports
- [ ] Status messages extracted
- [ ] Workflow still functions correctly

---

### Task 8: Testing and Verification
**Story Points:** 1
**Priority:** Critical
**Estimated Duration:** Testing task

#### 8.1 Functional Testing

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| QR code generation success | Select items, generate QR codes | See translated success message |
| QR code generation failure | Trigger error condition | See translated error message |
| PDF export success | Export PDF with generated codes | See translated success message with count |
| PDF validation errors | Enter invalid settings | See translated validation messages |
| Tier change notification | Change property count to trigger tier change | See translated tier message |
| Login error | Enter invalid credentials | See translated error message |
| Property creation error | Trigger API error | See translated fallback message |

#### 8.2 Language Switching Tests

For each supported language (en, fr, es, de, nl, it):
- [ ] Switch language via LanguageSwitcher
- [ ] Trigger a success notification
- [ ] Trigger an error notification
- [ ] Verify correct language displays
- [ ] Verify no missing translation fallbacks (no keys shown)

#### 8.3 Pluralization Tests

| Test | Count | Expected (English) |
|------|-------|-------------------|
| QR generation | 1 | "Successfully generated 1 QR code!" |
| QR generation | 5 | "Successfully generated 5 QR codes!" |
| PDF export | 1 | "PDF exported successfully! 1 QR codes included." |
| PDF export | 10 | "PDF exported successfully! 10 QR codes included." |

#### 8.4 Accessibility Verification

- [ ] Screen reader announces notifications correctly
- [ ] aria-live regions still function
- [ ] Focus management unaffected
- [ ] Notification timing unchanged

---

## Translation Key Structure

### Complete Namespace Reference

```
common.notifications
├── success
│   ├── generic
│   ├── saved
│   ├── created (with {item})
│   ├── updated (with {item})
│   ├── deleted (with {item})
│   ├── uploaded
│   └── exported
├── error
│   ├── generic
│   ├── createFailed (with {item})
│   ├── updateFailed (with {item})
│   ├── deleteFailed (with {item})
│   ├── uploadFailed
│   ├── networkError
│   ├── validationFailed
│   ├── unauthorized
│   └── invalidSettings
├── warning
│   ├── unsavedChanges
│   ├── sessionExpiring
│   └── limitReached (with {limit})
├── info
│   ├── processing
│   ├── pleaseWait
│   └── loading
├── qrCode
│   ├── generateSuccess (with {count}, plural)
│   ├── generateFailed
│   ├── pdfExportSuccess (with {count})
│   ├── pdfExportFailed
│   ├── noCodesAvailable
│   ├── noCodesGenerated
│   ├── invalidPageFormat
│   ├── invalidMargins
│   └── invalidQrSize
├── property
│   ├── createSuccess
│   ├── createFailed
│   ├── updateSuccess
│   ├── updateFailed
│   ├── deleteSuccess
│   ├── deleteFailed
│   └── nameRequired
├── item
│   ├── createSuccess
│   ├── createFailed
│   ├── updateSuccess
│   ├── updateFailed
│   ├── deleteSuccess
│   └── deleteFailed
├── dashboard
│   ├── tierSingle
│   ├── tierFew
│   ├── tierMultiple
│   └── tierMany
├── auth
│   ├── loginSuccess
│   ├── logoutSuccess
│   ├── sessionExpired
│   ├── accessDenied
│   ├── invalidCredentials
│   ├── adminRequired
│   ├── codeValidationFailed
│   ├── registrationSuccess
│   ├── registrationFailed
│   ├── creatingAccount
│   ├── connectingGoogle
│   ├── completingAuth
│   └── loginFailed
├── file
│   ├── uploadSuccess
│   ├── uploadFailed
│   ├── tooLarge
│   └── invalidType
└── workflow
    ├── sessionRecoveryAvailable
    ├── contentSaved
    └── uploadInProgress
```

---

## Component Modification Details

### Files to Modify Summary

| File | Strings | Import | Hook Namespace |
|------|---------|--------|----------------|
| `/src/components/QRCodePrintManager.tsx` | 8 | `useTranslations` | `common.notifications.qrCode` |
| `/src/hooks/useTierChangeNotification.ts` | 4 | `useTranslations` | `common.notifications.dashboard` |
| `/src/components/SimpleDashboard/AddPropertyModal.tsx` | 2 | `useTranslations` | `common.notifications.property` |
| `/src/components/SimpleDashboard/PropertyEditModal.tsx` | 3 | `useTranslations` | `common.notifications.property` |
| `/src/components/LoginForm.tsx` | 4 | `useTranslations` | `common.notifications.auth` |
| `/src/components/RegistrationForm.tsx` | 5 | `useTranslations` | `common.notifications.auth` |
| `/src/app/login/LoginPageContent.tsx` | 3 | `useTranslations` | `common.notifications.auth` |
| `/src/app/register/complete/page.tsx` | 3 | `useTranslations` | `common.notifications.auth` |
| `/src/app/register/success/page.tsx` | 2 | `useTranslations` | `common.notifications.auth` |
| `/src/contexts/AuthContext.tsx` | 3 | `useTranslations` | `common.notifications.auth` |
| `.../SessionRecoveryBanner.tsx` | 3 | `useTranslations` | `common.notifications.workflow` |
| `.../QRGenerationProgress.tsx` | 4 | `useTranslations` | `common.notifications.qrCode` |
| `.../NetworkErrorIndicator.tsx` | 2 | `useTranslations` | `common.notifications.error` |

### Translation Files to Update

| File | Action |
|------|--------|
| `/messages/en.json` | Add full `common.notifications` namespace |
| `/messages/fr.json` | Add French translations |
| `/messages/es.json` | Add Spanish translations |
| `/messages/de.json` | Add German translations |
| `/messages/nl.json` | Add Dutch translations |
| `/messages/it.json` | Add Italian translations |

---

## Testing Checklist

### Pre-Implementation
- [ ] Verify Epic 1 foundation is complete
- [ ] Verify next-intl is properly configured
- [ ] Backup current translation files

### Post-Implementation
- [ ] All notification strings extracted from target components
- [ ] All 6 language files updated with `common.notifications` namespace
- [ ] No hardcoded English notification strings remain
- [ ] Pluralization works correctly for count-based messages
- [ ] Dynamic interpolation works for parameterized messages
- [ ] Notifications display correctly in all languages
- [ ] Notification timing, positioning, and dismiss behavior unchanged
- [ ] Accessibility (aria-live, screen reader) still functional
- [ ] Application builds without errors
- [ ] All existing tests pass

---

## Rollback Plan

If issues are discovered after deployment:

1. **Immediate Rollback:** Revert to previous translation files
   ```bash
   git checkout HEAD~1 -- messages/
   ```

2. **Partial Rollback:** If specific component has issues
   ```bash
   git checkout HEAD~1 -- src/components/QRCodePrintManager.tsx
   ```

3. **Translation Key Issues:** If keys are missing, ensure fallback to English
   - next-intl automatically falls back to source language
   - Console warnings indicate missing keys in development

---

## Definition of Done

- [ ] All acceptance criteria from REQ-308/REQ-341 are met
- [ ] All 50+ notification strings are extracted and translated
- [ ] All 6 language files contain complete `common.notifications` namespace
- [ ] All modified components compile without errors
- [ ] Notification functionality is unchanged (timing, position, dismiss)
- [ ] Pluralization works correctly in all languages
- [ ] Dynamic interpolation works correctly
- [ ] Accessibility is maintained
- [ ] Code passes linting and type checking
- [ ] Manual testing completed in all 6 languages
- [ ] PR reviewed and approved

---

## References

- [Overview Document: REQ-341](./REQ-341-extract-toast-notification-messages-overview.md)
- [Implementation Plan: L10N Epic 2](./prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [Requirements: gen_requests_epic2.md](./gen_requests_epic2.md) - REQ-308
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)

---

*Document generated for FAQBNB Localization Epic 2 - Static UI Translation*
*Task 2H.5: Extract Toast Notification Messages*
*Last Modified: 2026-01-19 UTC*
