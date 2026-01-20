# REQ-E02-002: Extract Button Labels Across All Components - Implementation Overview

*Generated: 2026-01-19 10:15:00 UTC*
*Last Modified: 2026-01-19 10:15:00 UTC*

## Reference

- **Request**: REQ-E02-002 (Extract Button Labels Across All Components)
- **Source**: docs/gen_requests_epic2.md
- **Implementation Plan**: docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md
- **Type**: Enhancement
- **Phase**: 2H (Common & Shared Components)
- **Task ID**: 2H.2
- **Size**: L (Large)
- **Epic**: Localization Epic 2 - Static UI Translation
- **Depends On**:
  - Epic 1 (L10N Foundation - next-intl setup)
  - REQ-E02-001 (Common Namespace Structure - must be completed first)

## Summary

Extract all hardcoded button labels from components throughout the application and replace them with references to localized strings from the i18n `common.actions` namespace. This task affects 50+ files containing button elements and ensures consistent, translatable button text across the entire application.

## Goals

1. Identify and catalog all button components across the codebase (50+ files)
2. Extract all hardcoded button labels to the `common.actions` namespace
3. Replace hardcoded strings with `useTranslations('common.actions')` hook references
4. Ensure buttons display translated text based on user's language preference
5. Eliminate all hardcoded English button text from components
6. Follow consistent naming conventions for translation keys

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

After REQ-E02-001 completion, `/messages/en.json` contains:

```json
{
  "common": {
    "actions": {
      "save": "Save",
      "cancel": "Cancel",
      "delete": "Delete",
      "edit": "Edit",
      "create": "Create",
      "submit": "Submit",
      "close": "Close",
      "back": "Back",
      "next": "Next",
      "confirm": "Confirm",
      "done": "Done",
      "continue": "Continue",
      "retry": "Retry",
      "refresh": "Refresh",
      "search": "Search",
      "filter": "Filter",
      "sort": "Sort",
      "clear": "Clear",
      "reset": "Reset",
      "apply": "Apply",
      "view": "View",
      "viewAll": "View All",
      "showMore": "Show More",
      "showLess": "Show Less",
      "selectAll": "Select All",
      "deselectAll": "Deselect All"
    },
    "status": { ... }
  }
}
```

### Estimated Scope

- **Files to modify**: 50+ component files
- **Button instances**: ~150-200 across all files
- **New translation keys needed**: ~25 additional action strings (beyond base common.actions)
- **Primary pattern**: HTML `<button>` elements with Tailwind CSS styling

## Current Button Patterns in Codebase

### Pattern 1: HTML Button Elements (Most Common)

```tsx
// Current: Hardcoded string
<button className="...">Sign In with Email</button>

// Target: Translated
<button className="...">{t('signInWithEmail')}</button>
```

### Pattern 2: Configuration-Driven Buttons

```tsx
// Current: ActionButtons.tsx
const buttonConfigs = [
  { key: 'create', label: 'New QR Code Item', ... },
  { key: 'view', label: 'View QR Code Items', ... },
];

// Target: Translated
const buttonConfigs = [
  { key: 'create', label: t('newQrCodeItem'), ... },
  { key: 'view', label: t('viewQrCodeItems'), ... },
];
```

### Pattern 3: Loading State Buttons

```tsx
// Current: LoginForm.tsx
{loading ? 'Signing In...' : 'Sign In with Email'}

// Target: Translated
{loading ? t('signingIn') : t('signInWithEmail')}
```

### Pattern 4: Icon + Text Buttons

```tsx
// Current
<button><LogIn className="..." />Sign In</button>

// Target
<button><LogIn className="..." />{t('signIn')}</button>
```

## Implementation Order

### Step 1: Extend Common Actions Namespace

Add additional action strings required by component-specific buttons to `/messages/en.json`:

```json
{
  "common": {
    "actions": {
      // Existing keys from REQ-E02-001...

      // Auth-related actions
      "signIn": "Sign In",
      "signInWithEmail": "Sign In with Email",
      "signingIn": "Signing In...",
      "signOut": "Sign Out",
      "signingOut": "Signing Out...",
      "signUp": "Sign Up",
      "continueWithGoogle": "Continue with Google",
      "connectingToGoogle": "Connecting to Google...",
      "createAccount": "Create Account",
      "creatingAccount": "Creating Account...",

      // QR Code / Item actions
      "newQrCodeItem": "New QR Code Item",
      "viewQrCodeItems": "View QR Code Items",
      "printQrCode": "Print QR Code",
      "downloadQrCode": "Download QR Code",
      "viewQrCode": "View QR Code",

      // Property actions
      "addProperty": "Add Property",
      "editProperty": "Edit Property",
      "deleteProperty": "Delete Property",
      "createProperty": "Create Property",

      // Content actions
      "addContent": "Add Content",
      "addArticle": "Add Article",
      "takePhoto": "Take Photo",
      "recordVideo": "Record Video",
      "uploadFile": "Upload File",
      "retake": "Retake",
      "useThis": "Use This",

      // Navigation actions
      "goBack": "Go Back",
      "exitWorkflow": "Exit",
      "stay": "Stay",

      // Form actions
      "saveChanges": "Save Changes",
      "discardChanges": "Discard Changes",
      "saveDraft": "Save Draft",

      // Bulk actions
      "deleteSelected": "Delete Selected",
      "moveSelected": "Move Selected",
      "printSelected": "Print Selected"
    }
  }
}
```

### Step 2: Update Auth Components (Priority: High)

Entry point to application - most visible buttons.

| File | Button Labels to Extract |
|------|--------------------------|
| `LoginForm.tsx` | "Sign In with Email", "Signing In...", "Remember me for 30 days" |
| `GoogleOAuthButton.tsx` | "Continue with Google", "Connecting to Google..." |
| `RegistrationForm.tsx` | "Create Account", "Creating Account...", "Sign Up" |
| `LogoutButton.tsx` | Already uses i18n (reference implementation) |

### Step 3: Update Dashboard/Navigation Components (Priority: High)

Core navigation buttons visible throughout the app.

| File | Button Labels to Extract |
|------|--------------------------|
| `ActionButtons.tsx` | "New QR Code Item", "View QR Code Items", "Print QR Code" |
| `SimpleDashboard/AddPropertyModal.tsx` | "Add Property", "Save", "Cancel" |
| `SimpleDashboard/PropertyEditModal.tsx` | "Save Changes", "Cancel", "Delete Property" |
| `PropertySearchBar.tsx` | "Clear" |
| `NavigationSidebar*.tsx` | Various navigation labels |

### Step 4: Update Item Management Components (Priority: Medium)

High-usage area with many action buttons.

| File | Button Labels to Extract |
|------|--------------------------|
| `ItemManager/ItemManager.tsx` | "Create", "Filter", "Sort" |
| `ItemManager/components/ItemToolbar.tsx` | Toolbar action buttons |
| `ItemManager/components/dialogs/ConfirmDeleteDialog.tsx` | "Delete", "Cancel" |
| `ItemManager/components/BulkActions/*.tsx` | Bulk action buttons |
| `ItemForm.tsx` | Form submission buttons |

### Step 5: Update Item Creation Workflow Components (Priority: Medium)

Workflow step navigation and action buttons.

| File | Button Labels to Extract |
|------|--------------------------|
| `ItemCreationWorkflow/ItemCreationWorkflow.tsx` | "Next", "Back", "Exit" |
| `ItemCreationWorkflow/components/shared/ConfirmExitDialog.tsx` | "Stay", "Exit" |
| `ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx` | "Save Item", "Add More Content" |
| `ItemCreationWorkflow/components/steps/SessionSummaryStep.tsx` | "Print QR Codes", "Create Another", "Done" |
| `ItemCreationWorkflow/components/shared/*.tsx` | Various dialog buttons |

### Step 6: Update Media/Content Components (Priority: Low)

Editor and media handling buttons.

| File | Button Labels to Extract |
|------|--------------------------|
| `ItemCapture/editors/MarkdownEditor.tsx` | Editor toolbar buttons |
| `ItemCapture/editors/ImageCropper.tsx` | "Apply Crop", "Reset" |
| `ItemCapture/editors/VideoTrimmer.tsx` | "Apply Trim" |
| `ItemCapture/components/steps/*.tsx` | Step action buttons |

### Step 7: Update Remaining Components (Priority: Low)

All other components with button labels.

| File | Button Labels to Extract |
|------|--------------------------|
| `QRCodePrintManager.tsx` | Print control buttons |
| `ConfirmationModal.tsx` | Generic confirmation buttons |
| `InstructionsTable/*.tsx` | Table action buttons |
| `PropertyForm.tsx` | Form action buttons |
| Various page components | Page-specific buttons |

## Authorized Files and Functions for Modification

### Translation Files to Modify

#### `/messages/en.json`

- **Purpose**: English translation source file
- **Modification**: Extend `common.actions` namespace with additional button labels
- **Changes**:
  - Add ~25 new action keys for component-specific buttons
  - Ensure all button labels have corresponding translation keys
  - Follow naming convention: `common.actions.{actionName}`

#### `/messages/fr.json`, `/messages/es.json`, `/messages/de.json`, `/messages/nl.json`, `/messages/it.json`

- **Purpose**: Non-English translation files
- **Modification**: Add same keys as en.json (with English placeholders initially)
- **Note**: Actual translations generated in separate task (2H.10)

### Component Files to Modify

#### Auth Components

| File | Modifications |
|------|---------------|
| `/src/components/LoginForm.tsx` | Add `useTranslations('common.actions')` hook; replace button text |
| `/src/components/GoogleOAuthButton.tsx` | Add i18n hook; replace button labels |
| `/src/components/RegistrationForm.tsx` | Add i18n hook; replace all button text |
| `/src/app/login/LoginPageContent.tsx` | Add i18n hook if buttons present |
| `/src/app/register/RegistrationPageContent.tsx` | Add i18n hook for any buttons |
| `/src/app/register/complete/page.tsx` | Add i18n hook for action buttons |

#### Dashboard Components

| File | Modifications |
|------|---------------|
| `/src/components/SimpleDashboard/ActionButtons.tsx` | Replace `buttonConfigs` labels with t() calls |
| `/src/components/SimpleDashboard/AddPropertyModal.tsx` | Add i18n hook; replace button labels |
| `/src/components/SimpleDashboard/PropertyEditModal.tsx` | Add i18n hook; replace button labels |
| `/src/components/SimpleDashboard/PropertySearchBar.tsx` | Replace "Clear" button text |
| `/src/components/SimpleDashboard/BulkOperationsToolbar.tsx` | Replace bulk action button labels |
| `/src/components/DashboardLayout.tsx` | Add i18n if buttons present |
| `/src/components/UserDashboard.tsx` | Add i18n hook for any action buttons |

#### Item Management Components

| File | Modifications |
|------|---------------|
| `/src/components/ItemManager/ItemManager.tsx` | Add i18n hook for action buttons |
| `/src/components/ItemManager/components/ItemToolbar.tsx` | Replace toolbar button labels |
| `/src/components/ItemManager/components/dialogs/ConfirmDeleteDialog.tsx` | Replace confirmation button labels |
| `/src/components/ItemManager/components/dialogs/FilterPanel.tsx` | Replace "Apply", "Clear" button labels |
| `/src/components/ItemManager/components/BulkActions/BulkTagDialog.tsx` | Replace dialog button labels |
| `/src/components/ItemManager/components/BulkActions/BulkMoveDialog.tsx` | Replace dialog button labels |
| `/src/components/ItemForm.tsx` | Replace form submission button labels |
| `/src/components/ItemsManagement.tsx` | Add i18n hook; replace button text |

#### Item Creation Workflow Components

| File | Modifications |
|------|---------------|
| `/src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | Add i18n hook for nav buttons |
| `/src/components/ItemCreationWorkflow/components/shared/ConfirmExitDialog.tsx` | Replace button labels |
| `/src/components/ItemCreationWorkflow/components/shared/RemoveItemDialog.tsx` | Replace button labels |
| `/src/components/ItemCreationWorkflow/components/shared/EmptySessionDialog.tsx` | Replace button labels |
| `/src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx` | Replace action buttons |
| `/src/components/ItemCreationWorkflow/components/steps/SessionSummaryStep.tsx` | Replace summary action buttons |
| `/src/components/ItemCreationWorkflow/components/shared/PrintOptionsPanel.tsx` | Replace print option buttons |
| `/src/components/ItemCreationWorkflow/components/shared/PDFExportDialog.tsx` | Replace export button labels |

#### Media/Content Components

| File | Modifications |
|------|---------------|
| `/src/components/ItemCapture/editors/MarkdownEditor.tsx` | Replace editor toolbar button labels |
| `/src/components/ItemCapture/editors/ImageCropper.tsx` | Replace crop action buttons |
| `/src/components/ItemCapture/editors/VideoTrimmer.tsx` | Replace trim action buttons |
| `/src/components/ItemCapture/components/steps/ContentTypeStep.tsx` | Replace content type buttons |
| `/src/components/ItemCapture/components/steps/ReviewStep.tsx` | Replace review action buttons |
| `/src/components/ItemCapture/components/steps/TextEditorStep.tsx` | Replace editor action buttons |

#### Other Components

| File | Modifications |
|------|---------------|
| `/src/components/QRCodePrintManager.tsx` | Replace print control button labels |
| `/src/components/ConfirmationModal.tsx` | Replace generic confirmation button labels |
| `/src/components/PropertyForm.tsx` | Replace form action buttons |
| `/src/components/PropertySelector.tsx` | Replace selector action buttons if any |
| `/src/components/AccessCodeInput.tsx` | Replace action buttons if any |
| `/src/components/InstructionsTable/GuideToolbar.tsx` | Replace toolbar buttons |

### Files NOT to Modify

- `/src/lib/i18n/config.ts` - No changes needed
- `/src/lib/i18n/index.ts` - No changes needed
- `/src/app/layout.tsx` - IntlProvider already configured
- Test files (`__tests__/*.tsx`) - Testing handled separately
- Static display components without buttons

## Technical Specifications

### Import Pattern

Every component with buttons must import the useTranslations hook:

```typescript
'use client';
import { useTranslations } from 'next-intl';

function MyComponent() {
  const t = useTranslations('common.actions');

  return (
    <button>{t('save')}</button>
  );
}
```

### Multiple Namespace Pattern

When a component needs buttons from `common.actions` AND component-specific translations:

```typescript
'use client';
import { useTranslations } from 'next-intl';

function LoginForm() {
  const tActions = useTranslations('common.actions');
  const tAuth = useTranslations('auth');

  return (
    <div>
      <h1>{tAuth('signInTitle')}</h1>
      <button>{tActions('signInWithEmail')}</button>
      <button>{tActions('cancel')}</button>
    </div>
  );
}
```

### Loading State Pattern

For buttons with loading/disabled states:

```typescript
<button disabled={loading}>
  {loading ? t('signingIn') : t('signInWithEmail')}
</button>
```

### Configuration-Driven Pattern

For components using button configuration arrays:

```typescript
function ActionButtons() {
  const t = useTranslations('common.actions');

  const buttonConfigs = [
    {
      key: 'create',
      label: t('newQrCodeItem'),
      icon: PlusCircle,
      variant: 'primary',
    },
    {
      key: 'view',
      label: t('viewQrCodeItems'),
      icon: Eye,
      variant: 'secondary',
    },
  ];

  return buttonConfigs.map(config => (
    <button key={config.key}>{config.label}</button>
  ));
}
```

### Accessibility Attributes

ARIA labels and titles should also be translated:

```typescript
<button
  aria-label={t('saveAriaLabel')}
  title={t('saveTooltip')}
>
  {t('save')}
</button>
```

## Translation Key Naming Convention

Following Plan-111 convention:
```
common.actions.{actionName}
```

### Rules:
- Use camelCase for multi-word actions: `signInWithEmail`, `newQrCodeItem`
- Use present participle for loading states: `signingIn`, `saving`, `deleting`
- Keep keys concise but descriptive
- Group related actions by prefix when logical

### Examples:
| Button Text | Translation Key |
|-------------|-----------------|
| "Save" | `common.actions.save` |
| "Save Changes" | `common.actions.saveChanges` |
| "Saving..." | `common.actions.saving` |
| "Sign In with Email" | `common.actions.signInWithEmail` |
| "Signing In..." | `common.actions.signingIn` |
| "New QR Code Item" | `common.actions.newQrCodeItem` |
| "Continue with Google" | `common.actions.continueWithGoogle` |

## Usage Patterns

### Client Component (Standard)

```typescript
'use client';
import { useTranslations } from 'next-intl';

function SaveButton({ loading }: { loading: boolean }) {
  const t = useTranslations('common.actions');

  return (
    <button disabled={loading}>
      {loading ? t('saving') : t('save')}
    </button>
  );
}
```

### Server Component (if needed)

```typescript
import { getTranslations } from 'next-intl/server';

async function StaticButton() {
  const t = await getTranslations('common.actions');

  return <button>{t('viewAll')}</button>;
}
```

## Success Validation Checklist

### Code Validation
- [ ] All 50+ component files with buttons have been updated
- [ ] Each updated component imports `useTranslations` from 'next-intl'
- [ ] No hardcoded English button text remains in modified components
- [ ] All button loading states use translated text
- [ ] All ARIA labels and titles are translated where present
- [ ] Configuration-driven button arrays use t() calls for labels

### Translation File Validation
- [ ] `/messages/en.json` contains all required action keys
- [ ] All 6 language files have identical key structures
- [ ] No duplicate keys within `common.actions`
- [ ] Key names follow camelCase naming convention

### Functional Validation
- [ ] Application builds without errors: `npm run build`
- [ ] Buttons display correct text in English
- [ ] Buttons display translated text when locale is changed
- [ ] Loading states show appropriate translated text
- [ ] No console warnings about missing translation keys

### Visual Validation
- [ ] Button text is fully visible (no truncation)
- [ ] Button sizes accommodate translated text
- [ ] Layout remains intact with longer translated strings

## Dependencies

### Required (Already Completed)
- REQ-E02-001: Common Namespace Structure must be complete
- Epic 1: next-intl foundation must be in place

### Related Tasks
- Task 2H.10: Will generate translations for non-English languages
- Task 2H.11: May create `useCommonTranslations` convenience hook

## Risk Assessment

- **Risk Level**: Medium
- **Rationale**:
  - Large number of files to modify (50+)
  - Risk of missing button instances
  - Potential for inconsistent implementation across files

### Potential Issues

| Issue | Likelihood | Impact | Mitigation |
|-------|------------|--------|------------|
| Missing button labels | Medium | Medium | Use grep to find all `<button` and verify coverage |
| Inconsistent key naming | Medium | Low | Establish naming convention before starting; review PRs |
| Build errors from imports | Low | High | Test build after each major component update |
| Longer translated text causing layout issues | Medium | Low | Design system already accounts for text expansion |
| Performance impact from multiple hooks | Low | Low | next-intl is optimized; negligible overhead |

## Search Patterns for Discovery

Use these patterns to find all buttons requiring updates:

```bash
# Find all button elements
grep -r "<button" --include="*.tsx" src/

# Find onClick handlers (may indicate clickable elements)
grep -r "onClick=" --include="*.tsx" src/

# Find hardcoded common button text
grep -rE "(Save|Cancel|Delete|Submit|Close|Back|Next)" --include="*.tsx" src/components/

# Find components already using useTranslations (reference)
grep -r "useTranslations" --include="*.tsx" src/
```

## Notes

### Reference Implementation

`/src/components/LogoutButton.tsx` is the reference implementation showing proper i18n usage:

```typescript
'use client';
import { useTranslations } from 'next-intl';

function ConfirmationModal({ ... }) {
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');

  return (
    <div>
      <h3>{t('confirmLogout')}</h3>
      <button>{tCommon('cancel')}</button>
      <button>{t('signOut')}</button>
    </div>
  );
}
```

### Coordination with Other Tasks

- This task focuses on `common.actions` namespace buttons
- Component-specific text (titles, descriptions) will be handled in other sub-epic tasks
- Modal content extraction is covered in Task 2H.3
- Form labels/placeholders are covered in Task 2H.4

### Estimated Effort

Based on Plan-111, this task is estimated at ~50 strings across 50+ files. This represents a significant portion of Sub-Epic 2H's overall ~800 strings.

---

*End of Implementation Overview*
