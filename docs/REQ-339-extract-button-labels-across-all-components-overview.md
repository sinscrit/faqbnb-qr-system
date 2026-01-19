# REQ-339: Extract Button Labels Across All Components - Implementation Overview
*Generated: 2026-01-19 12:30:00 UTC*
*Last Modified: 2026-01-19 12:30:00 UTC*

## Reference
- **Request**: REQ-339 (Extract Button Labels Across All Components)
- **Source**: docs/gen_requests_epic2.md
- **Implementation Plan**: docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md
- **Type**: Enhancement (Internationalization)
- **Epic**: 2 - Static UI Translation
- **Sub-Epic**: 2H - Common & Shared Components
- **Task ID**: 2H.2
- **Size**: M
- **Priority**: FIRST - Foundation for all other sub-epics

## Goals
1. Identify and catalog all hardcoded button labels across all components in the application
2. Replace hardcoded button text with translation function calls using `t()` from next-intl
3. Ensure all button labels reference keys from `common.actions.*` namespace for shared actions
4. Create component-specific button label keys where context-specific wording is needed
5. Maintain consistent button terminology across the entire application
6. Preserve all existing button functionality, styling, and event handlers

## Context from Implementation Plan

### Sub-Epic 2H Priority
Per Plan-111, Sub-Epic 2H (Common & Shared Components) is designated as **FIRST** in the recommended implementation order because:
- Button labels appear in virtually every component across the application
- Shared action keys enable consistent terminology across all features
- Centralizing button labels reduces translation duplication significantly
- All other sub-epics (2A-2J) will reference common button label keys

### Dependency on Task 2H.1
This task (2H.2) depends on Task 2H.1 (Create Common Namespace Structure) being complete:
- Common namespace structure with `common.actions.*` sub-category must exist
- Keys like `common.actions.save`, `common.actions.cancel`, etc. must be defined
- All 6 language files must have the common action keys translated

### Estimated Scope
Based on codebase analysis, the application contains approximately:
- **50+ unique button label strings** to extract
- **100+ component files** containing buttons
- **Buttons across all feature areas**: Auth, Dashboard, Item Management, Item Creation Workflow, Property Management, Modals/Dialogs, Forms

## Codebase Analysis

### Button Pattern Categories Identified

#### 1. Modal/Dialog Buttons (~40% of buttons)
Confirmation modals, delete dialogs, and action dialogs use consistent patterns:

**Files with modal buttons:**
- `/src/components/ConfirmationModal.tsx` - Generic confirmation modal
- `/src/components/ItemManager/components/dialogs/ConfirmDeleteDialog.tsx` - Delete confirmation
- `/src/components/ItemCreationWorkflow/components/shared/ConfirmExitDialog.tsx` - Exit confirmation
- `/src/components/ItemCreationWorkflow/components/shared/RemoveItemDialog.tsx` - Item removal
- `/src/components/ItemCreationWorkflow/components/shared/EmptySessionDialog.tsx` - Empty session warning
- `/src/components/ItemCreationWorkflow/components/shared/PDFExportDialog.tsx` - PDF export
- `/src/components/dashboard/ItemViewModal.tsx` - Item view modal
- `/src/components/dashboard/DeleteItemDialog.tsx` - Delete item dialog
- `/src/components/SimpleDashboard/PropertyEditModal.tsx` - Property edit modal
- `/src/components/SimpleDashboard/AddPropertyModal.tsx` - Add property modal
- `/src/components/InstructionEditor/components/AddContentModal.tsx` - Add content modal
- `/src/components/ItemManager/components/BulkActions/BulkTagDialog.tsx` - Bulk tag dialog
- `/src/components/ItemManager/components/BulkActions/BulkMoveDialog.tsx` - Bulk move dialog
- `/src/components/MediaManagement/DeleteMediaConfirmDialog.tsx` - Media delete confirmation
- `/src/components/ItemManager/components/AssetPanel/AssetRemoveConfirmDialog.tsx` - Asset removal

**Common button labels in modals:**
- "Cancel" / "Confirm" / "Delete" / "Save"
- "Yes" / "No"
- "Save Changes" / "Discard Changes"
- "Remove" / "Close"

#### 2. Form Action Buttons (~25% of buttons)
Forms across the application use submit, reset, and action buttons:

**Files with form buttons:**
- `/src/components/PropertyForm.tsx` - Property creation/edit form
- `/src/components/LoginForm.tsx` - Login form (already i18n'd via Auth tasks)
- `/src/components/RegistrationForm.tsx` - Registration form (already i18n'd)
- `/src/components/InstructionEditor/InstructionEditor.tsx` - Instruction editor
- `/src/components/InstructionEditor/components/ContentEditSection.tsx` - Content editor
- `/src/components/MailingListSignup.tsx` - Email signup form

**Common button labels in forms:**
- "Submit" / "Save" / "Update"
- "Reset" / "Clear"
- "Add" / "Remove"

#### 3. Navigation/Action Buttons (~20% of buttons)
Dashboard and navigation components have action-oriented buttons:

**Files with navigation buttons:**
- `/src/components/SimpleDashboard/ActionButtons.tsx` - Dashboard action buttons
- `/src/components/DashboardLayout.tsx` - Main dashboard navigation
- `/src/components/RoleBasedNavigation.tsx` - Role-based nav buttons
- `/src/components/AuthGuard.tsx` - Auth guard buttons
- `/src/components/ItemDisplay.tsx` - Item display navigation
- `/src/components/ItemSelectionList.tsx` - Item selection actions

**Common button labels in navigation:**
- "New QR Code Item" / "View QR Code Items" / "Print QR Code"
- "Back" / "Next" / "Continue"
- "View All" / "Show More"

#### 4. Item Workflow Buttons (~15% of buttons)
Item creation workflow has many step-specific buttons:

**Files with workflow buttons:**
- `/src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` - Main workflow
- `/src/components/ItemCreationWorkflow/components/shared/WorkflowHeader.tsx` - Header buttons
- `/src/components/ItemCreationWorkflow/components/steps/*.tsx` - All step components
- `/src/components/ItemCapture/components/steps/*.tsx` - Item capture steps
- `/src/components/ItemCapture/components/shared/StepNavigation.tsx` - Step navigation

**Common button labels in workflow:**
- "Back" / "Next" / "Skip"
- "Save & Continue" / "Done"
- "Add Another" / "Create Another"
- "Exit" / "Cancel"

### Hardcoded Button Labels Found

Based on codebase search, the following hardcoded labels require extraction:

| Label | Occurrences (Est.) | Translation Key |
|-------|-------------------|-----------------|
| "Save" | 15+ | `common.actions.save` |
| "Cancel" | 25+ | `common.actions.cancel` |
| "Delete" | 20+ | `common.actions.delete` |
| "Edit" | 10+ | `common.actions.edit` |
| "Confirm" | 10+ | `common.actions.confirm` |
| "Close" | 15+ | `common.actions.close` |
| "Back" | 20+ | `common.actions.back` |
| "Next" | 15+ | `common.actions.next` |
| "Submit" | 8+ | `common.actions.submit` |
| "Create" | 10+ | `common.actions.create` |
| "Save Changes" | 8+ | `common.actions.saveChanges` |
| "Discard" | 5+ | `common.actions.discard` |
| "Remove" | 10+ | `common.actions.remove` |
| "Add" | 15+ | `common.actions.add` |
| "Update" | 5+ | `common.actions.update` |
| "Continue" | 8+ | `common.actions.continue` |
| "Done" | 10+ | `common.actions.done` |
| "Retry" | 5+ | `common.actions.retry` |
| "Refresh" | 3+ | `common.actions.refresh` |
| "Clear" | 5+ | `common.actions.clear` |
| "Reset" | 3+ | `common.actions.reset` |
| "Apply" | 5+ | `common.actions.apply` |
| "View" | 8+ | `common.actions.view` |
| "View All" | 5+ | `common.actions.viewAll` |
| "Show More" | 3+ | `common.actions.showMore` |
| "Download" | 5+ | `common.actions.download` |
| "Print" | 8+ | `common.actions.print` |
| "Share" | 3+ | `common.actions.share` |
| "Copy" | 5+ | `common.actions.copy` |
| "Yes" | 5+ | `common.confirmation.yes` |
| "No" | 5+ | `common.confirmation.no` |

### Loading State Labels (Button Variants)

Many buttons display loading state text that also needs extraction:

| Loading Label | Translation Key |
|--------------|-----------------|
| "Saving..." | `common.status.saving` |
| "Deleting..." | `common.status.deleting` |
| "Loading..." | `common.status.loading` |
| "Submitting..." | `common.status.submitting` |
| "Processing..." | `common.status.processing` |
| "Canceling..." | `common.status.canceling` |
| "Creating..." | `common.status.creating` |
| "Updating..." | `common.status.updating` |

## Implementation Order

### Phase 1: Shared Component Buttons (Core)
Update buttons in shared, reusable components first as they impact the most usage:

1. `ConfirmationModal.tsx` - Generic confirmation modal
2. `ConfirmDeleteDialog.tsx` - Delete confirmation dialog
3. `ConfirmExitDialog.tsx` - Exit confirmation dialog
4. `RemoveItemDialog.tsx` - Remove item dialog
5. `EmptySessionDialog.tsx` - Empty session dialog
6. `PDFExportDialog.tsx` - PDF export dialog

### Phase 2: Dashboard & Navigation Buttons
Update primary navigation and dashboard action buttons:

1. `ActionButtons.tsx` - Dashboard action buttons
2. `DashboardLayout.tsx` - Layout navigation buttons
3. `RoleBasedNavigation.tsx` - Navigation buttons
4. `AuthGuard.tsx` - Auth guard buttons
5. `LogoutButton.tsx` - Logout button

### Phase 3: Property Management Buttons
Update property-related components:

1. `PropertyForm.tsx` - Property form buttons
2. `PropertyEditModal.tsx` - Property edit modal buttons
3. `AddPropertyModal.tsx` - Add property modal buttons

### Phase 4: Item Management Buttons
Update item manager components:

1. `ItemsManagement.tsx` - Item management buttons
2. `ItemViewModal.tsx` - Item view modal buttons
3. `DeleteItemDialog.tsx` - Delete item dialog buttons
4. `ItemRow.tsx` - Item row action buttons
5. `BulkActionsBar.tsx` - Bulk action buttons
6. `BulkTagDialog.tsx` - Bulk tag dialog buttons
7. `BulkMoveDialog.tsx` - Bulk move dialog buttons
8. `ItemPreviewModal.tsx` - Item preview modal buttons

### Phase 5: Item Creation Workflow Buttons
Update item creation workflow components:

1. `ItemCreationWorkflow.tsx` - Main workflow buttons
2. `WorkflowHeader.tsx` - Workflow header buttons
3. Step navigation buttons in all step components
4. `StepNavigation.tsx` - Shared step navigation

### Phase 6: Editor & Content Buttons
Update editor and content management buttons:

1. `InstructionEditor.tsx` - Instruction editor buttons
2. `ContentEditSection.tsx` - Content edit buttons
3. `AddContentModal.tsx` - Add content modal buttons
4. Media management buttons

### Phase 7: Miscellaneous Buttons
Update remaining components:

1. `ItemDisplay.tsx` - Item display buttons
2. `ItemSelectionList.tsx` - Item selection buttons
3. `QRCodePrintPreview.tsx` - Print preview buttons
4. `QRCodePrintManager.tsx` - Print manager buttons
5. Analytics and export buttons
6. Account selector buttons
7. Email popup buttons
8. Time range selector buttons

## Authorized Files and Functions for Modification

### Files to Modify (Grouped by Priority)

#### Priority 1: Shared Modal/Dialog Components

##### `/src/components/ConfirmationModal.tsx`
- **Purpose**: Generic reusable confirmation modal
- **Current hardcoded strings**: Lines 19-20 ("Confirm", "Cancel" as defaults)
- **Changes**:
  - Add `useTranslations` import from `next-intl`
  - Replace `confirmText = 'Confirm'` default with `t('common.actions.confirm')`
  - Replace `cancelText = 'Cancel'` default with `t('common.actions.cancel')`
- **Scope**: ~5 lines changed

##### `/src/components/ItemManager/components/dialogs/ConfirmDeleteDialog.tsx`
- **Purpose**: Deletion confirmation dialog with item preview
- **Current hardcoded strings**:
  - Line 62: "Delete Item" / "Delete Items"
  - Line 72-75: "Are you sure you want to delete..."
  - Line 84-88: "Delete" / "Delete X Items"
  - Line 252: "Cancel"
  - Line 271: "Deleting..."
- **Changes**:
  - Add `useTranslations` import
  - Update `getDeleteTitle()`, `getDeleteMessage()`, `getConfirmButtonText()` to use translations
  - Replace hardcoded "Cancel" and "Deleting..." with translation keys
- **Scope**: ~15 lines changed

##### `/src/components/ItemCreationWorkflow/components/shared/ConfirmExitDialog.tsx`
- **Purpose**: Confirm exit from workflow dialog
- **Changes**: Replace hardcoded button labels with translations
- **Translation keys**: `common.actions.cancel`, `common.actions.exit`, `workflow.dialogs.confirmExit.*`
- **Scope**: ~10 lines changed

##### `/src/components/ItemCreationWorkflow/components/shared/RemoveItemDialog.tsx`
- **Purpose**: Confirm item removal dialog
- **Changes**: Replace hardcoded button labels with translations
- **Translation keys**: `common.actions.cancel`, `common.actions.remove`
- **Scope**: ~10 lines changed

##### `/src/components/ItemCreationWorkflow/components/shared/EmptySessionDialog.tsx`
- **Purpose**: Empty session warning dialog
- **Changes**: Replace hardcoded button labels with translations
- **Translation keys**: `common.actions.ok`, `common.actions.cancel`
- **Scope**: ~10 lines changed

##### `/src/components/ItemCreationWorkflow/components/shared/PDFExportDialog.tsx`
- **Purpose**: PDF export options dialog
- **Changes**: Replace hardcoded button labels with translations
- **Translation keys**: `common.actions.cancel`, `common.actions.export`, `common.actions.download`
- **Scope**: ~10 lines changed

##### `/src/components/dashboard/ItemViewModal.tsx`
- **Purpose**: Item view and actions modal
- **Current hardcoded strings**: Lines 235, 253 ("Edit Item", "Delete")
- **Changes**: Replace with translation keys
- **Translation keys**: `items.actions.edit`, `common.actions.delete`
- **Scope**: ~8 lines changed

##### `/src/components/dashboard/DeleteItemDialog.tsx`
- **Purpose**: Delete item confirmation
- **Changes**: Replace hardcoded button labels
- **Translation keys**: `common.actions.cancel`, `common.actions.delete`, `common.status.deleting`
- **Scope**: ~8 lines changed

##### `/src/components/SimpleDashboard/PropertyEditModal.tsx`
- **Purpose**: Property edit modal
- **Current hardcoded strings**: Line 553 ("Save Changes")
- **Changes**: Replace with translation keys
- **Translation keys**: `common.actions.cancel`, `common.actions.saveChanges`, `common.status.saving`
- **Scope**: ~10 lines changed

##### `/src/components/SimpleDashboard/AddPropertyModal.tsx`
- **Purpose**: Add property modal
- **Changes**: Replace hardcoded button labels
- **Translation keys**: `common.actions.cancel`, `common.actions.create`, `common.status.creating`
- **Scope**: ~10 lines changed

##### `/src/components/InstructionEditor/components/AddContentModal.tsx`
- **Purpose**: Add content modal in instruction editor
- **Changes**: Replace hardcoded button labels
- **Translation keys**: `common.actions.cancel`, `common.actions.add`, various content type labels
- **Scope**: ~12 lines changed

##### `/src/components/ItemManager/components/BulkActions/BulkTagDialog.tsx`
- **Purpose**: Bulk tag assignment dialog
- **Changes**: Replace hardcoded button labels
- **Translation keys**: `common.actions.cancel`, `common.actions.apply`
- **Scope**: ~8 lines changed

##### `/src/components/ItemManager/components/BulkActions/BulkMoveDialog.tsx`
- **Purpose**: Bulk move items dialog
- **Changes**: Replace hardcoded button labels
- **Translation keys**: `common.actions.cancel`, `common.actions.move`
- **Scope**: ~8 lines changed

##### `/src/components/MediaManagement/DeleteMediaConfirmDialog.tsx`
- **Purpose**: Delete media confirmation dialog
- **Changes**: Replace hardcoded button labels
- **Translation keys**: `common.actions.cancel`, `common.actions.delete`
- **Scope**: ~8 lines changed

##### `/src/components/ItemManager/components/AssetPanel/AssetRemoveConfirmDialog.tsx`
- **Purpose**: Asset removal confirmation
- **Changes**: Replace hardcoded button labels
- **Translation keys**: `common.actions.cancel`, `common.actions.remove`
- **Scope**: ~8 lines changed

#### Priority 2: Dashboard & Navigation Components

##### `/src/components/SimpleDashboard/ActionButtons.tsx`
- **Purpose**: Primary dashboard action buttons
- **Current hardcoded strings**: Lines 159, 168, 175 ("New QR Code Item", "View QR Code Items", "Print QR Code")
- **Changes**:
  - Add `useTranslations` import
  - Replace label strings with translation keys
  - Update aria-labels to use translations
- **Translation keys**: `items.actions.createNew`, `items.actions.viewAll`, `items.actions.print`
- **Scope**: ~15 lines changed

##### `/src/components/DashboardLayout.tsx`
- **Purpose**: Main dashboard layout with navigation
- **Changes**: Replace navigation button labels
- **Translation keys**: Various navigation labels from `dashboard.nav.*`
- **Scope**: ~12 lines changed

##### `/src/components/RoleBasedNavigation.tsx`
- **Purpose**: Role-based navigation component
- **Changes**: Replace navigation labels
- **Scope**: ~10 lines changed

##### `/src/components/AuthGuard.tsx`
- **Purpose**: Authentication guard component
- **Changes**: Replace auth-related button labels
- **Translation keys**: `auth.signIn`, `auth.signOut`, etc.
- **Scope**: ~10 lines changed

##### `/src/components/LogoutButton.tsx`
- **Purpose**: Logout button component
- **Changes**: Replace logout button label and confirmation
- **Translation keys**: `auth.signOut`, `auth.confirmLogout`, `common.status.loggingOut`
- **Scope**: ~10 lines changed

#### Priority 3: Property Management Components

##### `/src/components/PropertyForm.tsx`
- **Purpose**: Property creation/edit form
- **Changes**: Replace form button labels
- **Translation keys**: `common.actions.save`, `common.actions.cancel`, `properties.actions.*`
- **Scope**: ~10 lines changed

#### Priority 4: Item Management Components

##### `/src/components/ItemsManagement.tsx`
- **Purpose**: Main item management view
- **Current hardcoded strings**: Lines 482-493 ("Delete Item", "Cancel", "Delete")
- **Changes**: Replace button labels in management interface
- **Scope**: ~15 lines changed

##### `/src/components/ItemManager/components/ItemRow.tsx`
- **Purpose**: Individual item row with actions
- **Changes**: Replace action button labels
- **Scope**: ~10 lines changed

##### `/src/components/ItemManager/components/BulkActions/BulkActionsBar.tsx`
- **Purpose**: Bulk actions toolbar
- **Changes**: Replace bulk action button labels
- **Translation keys**: `items.bulk.*`, `common.actions.*`
- **Scope**: ~12 lines changed

##### `/src/components/ItemManager/components/ItemPreview/ItemPreviewModal.tsx`
- **Purpose**: Item preview modal
- **Changes**: Replace button labels
- **Scope**: ~8 lines changed

#### Priority 5: Item Creation Workflow Components

##### `/src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`
- **Purpose**: Main item creation workflow
- **Changes**: Replace workflow navigation buttons
- **Scope**: ~10 lines changed

##### `/src/components/ItemCreationWorkflow/components/shared/WorkflowHeader.tsx`
- **Purpose**: Workflow header with navigation
- **Changes**: Replace back/exit button labels
- **Translation keys**: `common.actions.back`, `common.actions.exit`
- **Scope**: ~8 lines changed

##### `/src/components/ItemCreationWorkflow/components/steps/SessionSummaryStep.tsx`
- **Purpose**: Session summary step with actions
- **Changes**: Replace action button labels
- **Translation keys**: `workflow.steps.sessionSummary.*`
- **Scope**: ~12 lines changed

##### `/src/components/ItemCapture/components/shared/StepNavigation.tsx`
- **Purpose**: Shared step navigation component
- **Changes**: Replace back/next button labels
- **Translation keys**: `common.actions.back`, `common.actions.next`, `common.actions.done`
- **Scope**: ~8 lines changed

#### Priority 6: Editor & Content Components

##### `/src/components/InstructionEditor/InstructionEditor.tsx`
- **Purpose**: Instruction editor main component
- **Changes**: Replace editor action buttons
- **Scope**: ~10 lines changed

##### `/src/components/InstructionEditor/components/ContentEditSection.tsx`
- **Purpose**: Content editing section
- **Changes**: Replace content action buttons
- **Scope**: ~10 lines changed

#### Priority 7: Miscellaneous Components

##### `/src/components/ItemDisplay.tsx`
- **Purpose**: Item display component
- **Current hardcoded string**: Line 278 ("Back")
- **Changes**: Replace button labels
- **Scope**: ~8 lines changed

##### `/src/components/ItemSelectionList.tsx`
- **Purpose**: Item selection list
- **Current hardcoded string**: Line 233 ("Next steps:")
- **Changes**: Replace labels and action buttons
- **Scope**: ~10 lines changed

##### `/src/components/QRCodePrintPreview.tsx`
- **Purpose**: QR code print preview
- **Changes**: Replace print/download button labels
- **Translation keys**: `common.actions.print`, `common.actions.download`, `common.actions.close`
- **Scope**: ~10 lines changed

##### `/src/components/QRCodePrintManager.tsx`
- **Purpose**: QR code print manager
- **Changes**: Replace numerous print-related button labels
- **Scope**: ~20 lines changed

##### `/src/components/AccountSelector.tsx`
- **Purpose**: Account selector dropdown
- **Changes**: Replace selection button labels
- **Scope**: ~8 lines changed

##### `/src/components/EmailPopup.tsx`
- **Purpose**: Email subscription popup
- **Current hardcoded string**: Line 151 ("Close")
- **Changes**: Replace button labels
- **Translation keys**: `common.actions.close`, `common.actions.submit`, `common.actions.cancel`
- **Scope**: ~10 lines changed

##### `/src/components/TimeRangeSelector.tsx`
- **Purpose**: Time range selector
- **Changes**: Replace selection button labels
- **Scope**: ~6 lines changed

##### `/src/components/AnalyticsExport.tsx`
- **Purpose**: Analytics export functionality
- **Changes**: Replace export button labels
- **Translation keys**: `common.actions.export`, `common.actions.download`
- **Scope**: ~10 lines changed

##### `/src/components/PDFExportOptions.tsx`
- **Purpose**: PDF export options
- **Changes**: Replace export option buttons
- **Scope**: ~8 lines changed

##### `/src/components/AnalyticsOverviewCards.tsx`
- **Purpose**: Analytics overview cards
- **Changes**: Replace action button labels
- **Scope**: ~6 lines changed

##### `/src/components/AnalyticsManagement.tsx`
- **Purpose**: Analytics management
- **Changes**: Replace management button labels
- **Scope**: ~6 lines changed

##### `/src/components/UserDashboard.tsx`
- **Purpose**: User dashboard
- **Changes**: Replace dashboard button labels
- **Scope**: ~8 lines changed

##### `/src/components/UserAnalyticsTable.tsx`
- **Purpose**: User analytics table
- **Changes**: Replace table action button labels
- **Scope**: ~8 lines changed

##### `/src/components/ReactionButtons.tsx`
- **Purpose**: Reaction buttons component
- **Changes**: Replace reaction button labels if text-based
- **Scope**: ~4 lines changed

##### `/src/components/ReactionAnalytics.tsx`
- **Purpose**: Reaction analytics
- **Changes**: Replace button labels
- **Scope**: ~6 lines changed

### Translation Files to Update

#### `/messages/en.json`
- **Purpose**: Add any missing button-related translation keys
- **Changes**:
  - Ensure `common.actions.*` contains all button labels
  - Add `common.actions.saveChanges`, `common.actions.discard`, `common.actions.move`, `common.actions.export`, `common.actions.print` if missing
  - Add `common.status.submitting`, `common.status.processing`, `common.status.canceling`, `common.status.creating`, `common.status.updating` if missing

#### `/messages/fr.json`, `/messages/es.json`, `/messages/de.json`, `/messages/nl.json`, `/messages/it.json`
- **Purpose**: Add translations for any new keys added to en.json
- **Changes**: Mirror structure additions from en.json

## Technical Specifications

### Translation Pattern for Button Components

#### Pattern 1: Direct Button Label
```tsx
// Before
<button onClick={handleSave}>Save</button>

// After
import { useTranslations } from 'next-intl';

function Component() {
  const t = useTranslations('common.actions');
  return <button onClick={handleSave}>{t('save')}</button>;
}
```

#### Pattern 2: Button with Loading State
```tsx
// Before
<button disabled={loading}>
  {loading ? 'Saving...' : 'Save'}
</button>

// After
const t = useTranslations();
<button disabled={loading}>
  {loading ? t('common.status.saving') : t('common.actions.save')}
</button>
```

#### Pattern 3: Button with Default Props
```tsx
// Before
interface Props {
  confirmText?: string;
  cancelText?: string;
}
function Modal({ confirmText = 'Confirm', cancelText = 'Cancel' }: Props) {
  // ...
}

// After
function Modal({ confirmText, cancelText }: Props) {
  const t = useTranslations('common.actions');
  const confirmLabel = confirmText ?? t('confirm');
  const cancelLabel = cancelText ?? t('cancel');
  // ...
}
```

#### Pattern 4: Button in Config Object
```tsx
// Before
const buttonConfigs = [
  { label: 'New QR Code Item', onClick: handleCreate },
  { label: 'View QR Code Items', onClick: handleView },
];

// After
const t = useTranslations('items.actions');
const buttonConfigs = [
  { label: t('createNew'), onClick: handleCreate },
  { label: t('viewAll'), onClick: handleView },
];
```

### Namespace Organization for Button Labels

```
common.actions.*     - Generic action verbs (save, cancel, delete, edit)
common.status.*      - Loading/status labels (saving, deleting, loading)
common.confirmation.* - Confirmation dialog labels (yes, no)
items.actions.*      - Item-specific actions (createNew, viewQR, printQR)
properties.actions.* - Property-specific actions
workflow.actions.*   - Workflow-specific actions
auth.*               - Authentication-related labels
```

### Aria-Label Translations

Button aria-labels must also be translated for accessibility:

```tsx
// Before
<button aria-label="Create a new QR code item">
  <PlusCircle />
  New QR Code Item
</button>

// After
<button aria-label={t('ariaLabels.createNewItem')}>
  <PlusCircle />
  {t('items.actions.createNew')}
</button>
```

## Success Validation Checklist

### Code Changes Verification
- [ ] All identified components have `useTranslations` import added
- [ ] No hardcoded English button labels remain in modified components
- [ ] All button labels use `t()` function with appropriate namespace
- [ ] Loading state labels are also translated (e.g., "Saving..." → `t('common.status.saving')`)
- [ ] Aria-labels on buttons are translated for accessibility
- [ ] Default prop values for button text use translations

### Translation File Verification
- [ ] All required keys exist in `/messages/en.json`
- [ ] All required keys exist in all 5 non-English language files
- [ ] No duplicate keys exist
- [ ] Key naming follows convention `{namespace}.{area}.{element}`

### Functional Verification
- [ ] Application builds without TypeScript errors
- [ ] No missing translation warnings in browser console
- [ ] All buttons display correct text in English
- [ ] Language switching updates all button labels
- [ ] Button click handlers still function correctly
- [ ] Button disabled states work correctly
- [ ] Loading states display translated text

### Visual Verification
- [ ] Button text displays without truncation
- [ ] Button layouts remain consistent across languages
- [ ] No text overflow issues with longer translations

## Dependencies

### Required (from Epic 1)
- next-intl package installed and configured
- `useTranslations` hook available from `next-intl`
- Translation files exist in `/messages/` directory
- IntlProvider wrapping application

### Required (from Task 2H.1)
- `common.actions.*` namespace structure exists
- `common.status.*` namespace structure exists
- `common.confirmation.*` namespace structure exists
- All 6 language files have these namespaces populated

## Risk Assessment

- **Risk Level**: Low to Medium
- **Rationale**:
  - Many files to modify but changes are mechanical and repetitive
  - Pattern is well-established in next-intl documentation
  - No logic changes to button functionality
  - Changes are localized to text rendering only
- **Mitigation**:
  - Test each component after modification
  - Run full build to catch TypeScript errors
  - Verify translations load correctly in browser
  - Review in all supported languages for text fit

## Effort Estimate

- **Estimated Time**: 6-10 hours
- **Breakdown**:
  - Priority 1 (Shared Modals/Dialogs): 2-3 hours
  - Priority 2 (Dashboard/Navigation): 1-1.5 hours
  - Priority 3 (Property Management): 0.5 hours
  - Priority 4 (Item Management): 1-1.5 hours
  - Priority 5 (Item Creation Workflow): 1-1.5 hours
  - Priority 6 (Editor/Content): 0.5-1 hour
  - Priority 7 (Miscellaneous): 1-2 hours
  - Verification and testing: 1 hour

## Notes

### Component Reusability Consideration
The `ConfirmationModal` component accepts `confirmText` and `cancelText` props, allowing parent components to override button labels. After this task:
- Default values will be translated
- Parent components can still pass custom labels (which should also be translation keys)
- Consider creating a convention for passing translation keys vs. raw strings

### Future Hook Creation (Task 2H.11)
Task 2H.11 may create a `useCommonTranslations` convenience hook. Button label extraction should be compatible with this future enhancement:
```tsx
// Future usage pattern
const { actions, status } = useCommonTranslations();
<button>{loading ? status.saving : actions.save}</button>
```

### Testing Strategy
- Unit tests should mock `useTranslations` to return predictable values
- Integration tests should verify actual translations load
- Visual regression tests can catch layout issues with different languages
