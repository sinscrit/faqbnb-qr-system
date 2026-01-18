# REQ-305: Extract and Centralize Button Labels for Internationalization - Implementation Overview

**Generated:** 2026-01-18 17:30:00 UTC
**Last Modified:** 2026-01-18 17:30:00 UTC
**Request Reference:** REQ-305 - Extract and Centralize Button Labels for Internationalization
**Plan Reference:** Plan-111-L10N-Epic2-Static-UI-Translation.md (Sub-Epic 2H, Task 2H.2)
**Status:** Ready for Implementation

---

## 1. Request Summary

Extract all hardcoded button labels throughout the application and centralize them into the `common.actions` namespace of the translation files, enabling internationalization and ensuring consistent terminology across the user interface.

**Scope:**
- Audit all components to identify hardcoded button labels
- Update approximately 45+ unique button labels across 200+ components
- Replace hardcoded strings with translation function calls (`t()`)
- Use existing `common.actions` keys from REQ-304 where applicable
- Add any newly discovered button labels to the `common.actions` namespace

**Out of Scope:**
- Translating button labels to other languages (handled by Task 2H.10)
- Modal/dialog strings extraction (Task 2H.3)
- Form validation messages (Task 2H.4)
- Creating the common namespace structure (Task 2H.1 - REQ-304, prerequisite)

---

## 2. Current State Analysis

### Existing Technology Stack

| Technology | Version | Location |
|------------|---------|----------|
| Next.js | 15.5.9 | `package.json` |
| React | 19.1.0 | `package.json` |
| TypeScript | ^5 | `package.json` |
| Tailwind CSS | ^4 | `package.json` |
| next-intl | (from Epic 1) | i18n framework |

### Current Button Label Patterns

All button labels are currently **hardcoded** directly in JSX markup. There is no centralized translation infrastructure for button text.

**Common Patterns Found:**

1. **Direct string literals in JSX:**
   ```tsx
   <button>Submit</button>
   <Button>Cancel</Button>
   ```

2. **Conditional loading states:**
   ```tsx
   <button>{loading ? 'Saving...' : 'Save'}</button>
   ```

3. **Props passed to button components:**
   ```tsx
   <ActionButton label="Delete" />
   ```

4. **Accessibility attributes:**
   ```tsx
   <button aria-label="Cancel and exit wizard">Cancel</button>
   ```

### Button Labels Inventory

Based on codebase analysis, **45+ unique button labels** were identified across **200+ components**:

#### Primary Action Buttons
| Button Label | Locations (Key Files) | Usage |
|--------------|----------------------|--------|
| Submit | `ReviewStep.tsx`, `StepNavigation.tsx` | Form/wizard submission |
| Continue | `StepNavigation.tsx` | Next step in workflow |
| Cancel | Multiple forms, dialogs, modals | Exit without saving |
| Back | `StepNavigation.tsx`, `UrlInputStep.tsx` | Return to previous step |
| Sign In with Email | `LoginForm.tsx` | Email-based login |
| Sign Out | `LogoutButton.tsx` | Logout action |

#### CRUD Operations
| Button Label | Locations | Usage |
|--------------|-----------|--------|
| Create Item | `ItemForm.tsx` | Create new item |
| Update Item | `ItemForm.tsx` | Update existing item |
| Create Property | `PropertyForm.tsx` | Create new property |
| Update Property | `PropertyForm.tsx` | Update existing property |
| Delete | `BulkActionsBar.tsx`, `ConfirmDeleteDialog.tsx` | Delete single/bulk items |
| Save | Various forms | Save changes |
| Edit | `InstructionsTable.tsx`, `GuideCard.tsx`, `ReviewStep.tsx` | Edit content |

#### Loading States (Dynamic)
| Loading Text | Base Action |
|--------------|-------------|
| Saving... | Save |
| Signing In... | Sign In |
| Updating... | Update |
| Creating... | Create |
| Deleting... | Delete |
| Creating property... | Create Property |

#### Media/Editing Operations
| Button Label | Location |
|--------------|----------|
| Apply Crop | `ImageCropper.tsx` |
| Cancel Crop | `ImageCropper.tsx` |
| Apply Rotate | `ImageRotator.tsx` |
| Cancel Rotate | `ImageRotator.tsx` |
| Apply Trim | `VideoTrimmer.tsx` |
| Cancel Trim | `VideoTrimmer.tsx` |

#### Content/Link Actions
| Button Label | Location |
|--------------|----------|
| Add Link | `UrlInputStep.tsx`, `InstructionEditor/*` |
| Add Link Anyway | `UrlInputStep.tsx` |
| Add Tag | `BulkActionsBar.tsx`, `TagsInlineEdit.tsx` |
| Add more media | `ReviewStep.tsx` |
| Add more links | `ReviewStep.tsx` |
| Write Text | `InstructionEditor/AddContentModal.tsx` |
| Upload File | `InstructionEditor/AddContentModal.tsx` |

#### Completion Actions
| Button Label | Location |
|--------------|----------|
| Complete Upload | `FileUploadStep.tsx` |
| Complete Text | `TextEditorStep.tsx` |
| Complete URL | `UrlInputStep.tsx` |
| Clear Filters | `FilterPanel.tsx` |
| Exit Workflow | `ConfirmExitDialog.tsx` |

---

## 3. Technical Approach

### Translation Pattern for Client Components

```typescript
// Before: Hardcoded
function SubmitButton({ loading }: { loading: boolean }) {
  return <button>{loading ? 'Saving...' : 'Submit'}</button>;
}

// After: Translated
import { useTranslations } from 'next-intl';

function SubmitButton({ loading }: { loading: boolean }) {
  const t = useTranslations('common.actions');
  return <button>{loading ? t('saving') : t('submit')}</button>;
}
```

### Translation Pattern for Server Components

```typescript
// Before: Hardcoded
async function FormActions() {
  return (
    <div>
      <button>Cancel</button>
      <button>Save</button>
    </div>
  );
}

// After: Translated
import { getTranslations } from 'next-intl/server';

async function FormActions() {
  const t = await getTranslations('common.actions');
  return (
    <div>
      <button>{t('cancel')}</button>
      <button>{t('save')}</button>
    </div>
  );
}
```

### Accessibility Attribute Translations

```tsx
// Before
<button aria-label="Cancel and exit wizard">Cancel</button>

// After
<button aria-label={t('cancelAndExit')}>{t('cancel')}</button>
```

### Key Naming Strategy

Use `common.actions` namespace for all button labels:

```json
{
  "common": {
    "actions": {
      "submit": "Submit",
      "cancel": "Cancel",
      "save": "Save",
      "saveChanges": "Save Changes",
      "saving": "Saving...",
      "delete": "Delete",
      "deleting": "Deleting...",
      "edit": "Edit",
      "create": "Create",
      "creating": "Creating...",
      "update": "Update",
      "updating": "Updating...",
      "back": "Back",
      "next": "Next",
      "continue": "Continue",
      "close": "Close",
      "confirm": "Confirm",
      "done": "Done",
      "signIn": "Sign In",
      "signingIn": "Signing In...",
      "signInWithEmail": "Sign In with Email",
      "signOut": "Sign Out",
      "continueWithGoogle": "Continue with Google",
      "register": "Register",
      "createItem": "Create Item",
      "updateItem": "Update Item",
      "createProperty": "Create Property",
      "updateProperty": "Update Property",
      "addLink": "Add Link",
      "addLinkAnyway": "Add Link Anyway",
      "addTag": "Add Tag",
      "addMoreMedia": "Add more media",
      "addMoreLinks": "Add more links",
      "editGuides": "Edit guides",
      "editItemDetails": "Edit item details",
      "applyCrop": "Apply Crop",
      "cancelCrop": "Cancel Crop",
      "applyRotate": "Apply Rotate",
      "cancelRotate": "Cancel Rotate",
      "applyTrim": "Apply Trim",
      "cancelTrim": "Cancel Trim",
      "cancelEditor": "Cancel Editor",
      "completeUpload": "Complete Upload",
      "completeText": "Complete Text",
      "completeUrl": "Complete URL",
      "clearFilters": "Clear Filters",
      "exitWorkflow": "Exit Workflow",
      "writeText": "Write Text",
      "uploadFile": "Upload File",
      "requestAccess": "Request Access"
    }
  }
}
```

---

## 4. Implementation Tasks

### Task 2H.2.1: Audit and Catalogue All Button Labels

**Purpose:** Create complete inventory of button labels and their locations

**Subtasks:**
- [ ] Run grep/search for all `<button>`, `<Button` patterns across codebase
- [ ] Document unique button labels found
- [ ] Map button labels to their component files
- [ ] Identify loading state patterns
- [ ] Identify aria-label/title patterns on buttons

**Estimated Time:** 30 minutes

### Task 2H.2.2: Extend `common.actions` Namespace

**Purpose:** Add any missing button labels discovered during audit

**Keys to add (if not already in REQ-304):**
- Context-specific actions: `signInWithEmail`, `continueWithGoogle`
- Form-specific actions: `createItem`, `updateItem`, `createProperty`, `updateProperty`
- Media editor actions: `applyCrop`, `cancelCrop`, `applyRotate`, `cancelRotate`, `applyTrim`, `cancelTrim`
- Workflow actions: `completeUpload`, `completeText`, `completeUrl`, `exitWorkflow`
- Content actions: `addLink`, `addLinkAnyway`, `addTag`, `addMoreMedia`, `addMoreLinks`, `editGuides`, `editItemDetails`

**File:** `/messages/en.json`

**Estimated Time:** 20 minutes

### Task 2H.2.3: Update Authentication Components

**Components to update:**
- `/src/components/LoginForm.tsx` (~4 button labels)
- `/src/components/LogoutButton.tsx` (~2 button labels)
- `/src/components/RegistrationForm.tsx` (~3 button labels)
- `/src/components/GoogleOAuthButton.tsx` (~1 button label)

**Estimated Time:** 25 minutes

### Task 2H.2.4: Update Form Components

**Components to update:**
- `/src/components/ItemForm.tsx` (~4 button labels)
- `/src/components/PropertyForm.tsx` (~6 button labels)
- `/src/components/ConfirmationModal.tsx` (~3 button labels)

**Estimated Time:** 20 minutes

### Task 2H.2.5: Update Wizard/Workflow Components

**Components to update:**
- `/src/components/ItemCapture/components/shared/StepNavigation.tsx` (~4 button labels)
- `/src/components/ItemCreationWorkflow/components/shared/ConfirmExitDialog.tsx` (~3 button labels)
- `/src/components/ItemCapture/components/steps/ReviewStep.tsx` (~6 button labels)
- `/src/components/ItemCapture/components/steps/UrlInputStep.tsx` (~4 button labels)
- `/src/components/ItemCapture/components/steps/FileUploadStep.tsx` (~2 button labels)
- `/src/components/ItemCapture/components/steps/TextEditorStep.tsx` (~2 button labels)

**Estimated Time:** 40 minutes

### Task 2H.2.6: Update Item Management Components

**Components to update:**
- `/src/components/ItemManager/components/dialogs/ConfirmDeleteDialog.tsx` (~4 button labels)
- `/src/components/ItemManager/components/dialogs/DeleteItemDialog.tsx` (~3 button labels)
- `/src/components/ItemManager/components/BulkActions/BulkActionsBar.tsx` (~5 button labels)
- `/src/components/ItemManager/components/FilterPanel.tsx` (~2 button labels)

**Estimated Time:** 30 minutes

### Task 2H.2.7: Update Media Editor Components

**Components to update:**
- `/src/components/ItemCapture/editors/ImageCropper.tsx` (~2 button labels)
- `/src/components/ItemCapture/editors/ImageRotator.tsx` (~2 button labels)
- `/src/components/ItemCapture/editors/VideoTrimmer.tsx` (~2 button labels)
- `/src/components/ItemCapture/editors/MarkdownEditor.tsx` (~1 button label)

**Estimated Time:** 20 minutes

### Task 2H.2.8: Update SimpleDashboard Components

**Components to update:**
- `/src/components/SimpleDashboard/PropertySection.tsx` (~2 button labels)
- `/src/components/SimpleDashboard/PropertyEditModal.tsx` (~3 button labels)
- `/src/components/SimpleDashboard/AddPropertyModal.tsx` (~3 button labels)
- `/src/components/SimpleDashboard/ActionButtons.tsx` (~4 button labels)

**Estimated Time:** 25 minutes

### Task 2H.2.9: Update Instruction/Content Components

**Components to update:**
- `/src/components/InstructionEditor/AddContentModal.tsx` (~3 button labels)
- `/src/components/InstructionsTable.tsx` (~2 button labels)
- `/src/components/GuideCard.tsx` (~1 button label)
- `/src/components/ItemManager/components/shared/TagsInlineEdit.tsx` (~2 button labels)

**Estimated Time:** 20 minutes

### Task 2H.2.10: Verify and Test All Button Updates

**Verification steps:**
- [ ] Run TypeScript compilation (`npm run build`)
- [ ] Verify all buttons render correctly
- [ ] Check loading states display properly
- [ ] Verify aria-labels are translated
- [ ] Spot-check key UI flows

**Estimated Time:** 30 minutes

---

## 5. Authorized Files and Functions for Modification

### Files to MODIFY - Translation File

| File Path | Description | Modification |
|-----------|-------------|--------------|
| `/messages/en.json` | English translation file | Extend `common.actions` with button labels |

### Files to MODIFY - Authentication Components

| File Path | Button Labels | Estimated Changes |
|-----------|---------------|-------------------|
| `/src/components/LoginForm.tsx` | Sign In with Email, Signing In..., Cancel | 4 strings |
| `/src/components/LogoutButton.tsx` | Sign Out, Cancel | 2 strings |
| `/src/components/RegistrationForm.tsx` | Register, Continue with Google | 3 strings |
| `/src/components/GoogleOAuthButton.tsx` | Continue with Google | 1 string |

### Files to MODIFY - Form Components

| File Path | Button Labels | Estimated Changes |
|-----------|---------------|-------------------|
| `/src/components/ItemForm.tsx` | Create Item, Update Item, Cancel, Saving... | 4 strings |
| `/src/components/PropertyForm.tsx` | Create Property, Update Property, Cancel, Creating..., Updating..., Saving... | 6 strings |
| `/src/components/ConfirmationModal.tsx` | Confirm, Cancel, Close | 3 strings |

### Files to MODIFY - Wizard/Workflow Components

| File Path | Button Labels | Estimated Changes |
|-----------|---------------|-------------------|
| `/src/components/ItemCapture/components/shared/StepNavigation.tsx` | Continue, Submit, Back, Cancel | 4 strings |
| `/src/components/ItemCreationWorkflow/components/shared/ConfirmExitDialog.tsx` | Exit Workflow, Cancel, Stay | 3 strings |
| `/src/components/ItemCapture/components/steps/ReviewStep.tsx` | Submit, Edit, Add more media, Add more links, Edit guides, Edit item details | 6 strings |
| `/src/components/ItemCapture/components/steps/UrlInputStep.tsx` | Add Link, Add Link Anyway, Back, Cancel | 4 strings |
| `/src/components/ItemCapture/components/steps/FileUploadStep.tsx` | Complete Upload, Cancel | 2 strings |
| `/src/components/ItemCapture/components/steps/TextEditorStep.tsx` | Complete Text, Cancel | 2 strings |

### Files to MODIFY - Item Management Components

| File Path | Button Labels | Estimated Changes |
|-----------|---------------|-------------------|
| `/src/components/ItemManager/components/dialogs/ConfirmDeleteDialog.tsx` | Delete, Delete N Items, Cancel, Deleting... | 4 strings |
| `/src/components/ItemManager/components/dialogs/DeleteItemDialog.tsx` | Delete, Cancel, Deleting... | 3 strings |
| `/src/components/ItemManager/components/BulkActions/BulkActionsBar.tsx` | Delete, Add Tag, Add, Move to, Remove Tag | 5 strings |
| `/src/components/ItemManager/components/FilterPanel.tsx` | Clear Filters, Apply | 2 strings |

### Files to MODIFY - Media Editor Components

| File Path | Button Labels | Estimated Changes |
|-----------|---------------|-------------------|
| `/src/components/ItemCapture/editors/ImageCropper.tsx` | Apply Crop, Cancel Crop | 2 strings |
| `/src/components/ItemCapture/editors/ImageRotator.tsx` | Apply Rotate, Cancel Rotate | 2 strings |
| `/src/components/ItemCapture/editors/VideoTrimmer.tsx` | Apply Trim, Cancel Trim | 2 strings |
| `/src/components/ItemCapture/editors/MarkdownEditor.tsx` | Cancel Editor | 1 string |

### Files to MODIFY - SimpleDashboard Components

| File Path | Button Labels | Estimated Changes |
|-----------|---------------|-------------------|
| `/src/components/SimpleDashboard/PropertySection.tsx` | Edit, View | 2 strings |
| `/src/components/SimpleDashboard/PropertyEditModal.tsx` | Save, Cancel, Saving... | 3 strings |
| `/src/components/SimpleDashboard/AddPropertyModal.tsx` | Create Property, Cancel, Creating... | 3 strings |
| `/src/components/SimpleDashboard/ActionButtons.tsx` | New Item, Add Property, View All, Print | 4 strings |

### Files to MODIFY - Instruction/Content Components

| File Path | Button Labels | Estimated Changes |
|-----------|---------------|-------------------|
| `/src/components/InstructionEditor/AddContentModal.tsx` | Write Text, Upload File, Cancel | 3 strings |
| `/src/components/InstructionsTable.tsx` | Edit, Delete | 2 strings |
| `/src/components/GuideCard.tsx` | Edit | 1 string |
| `/src/components/ItemManager/components/shared/TagsInlineEdit.tsx` | Add Tag, Save | 2 strings |

### Files NOT to Modify

- `/messages/fr.json`, `/messages/es.json`, etc. (Task 2H.10)
- Modal/dialog content strings (Task 2H.3)
- Form validation messages (Task 2H.4)
- Toast notification messages (Task 2H.5)
- `/src/lib/i18n/` configuration files (Epic 1)
- `/package.json`

---

## 6. Dependencies

### Prerequisite Tasks (Must Be Completed First)

| Task | Description | Dependency Type |
|------|-------------|-----------------|
| Epic 1 (All) | i18n Framework Foundation | Required |
| REQ-229 | Install and configure next-intl | Required |
| REQ-232 | Create IntlProvider wrapper | Required |
| REQ-233 | Create initial translation file structure | Required |
| REQ-304 (Task 2H.1) | Create common namespace structure | Required |

**Critical:** The `/messages/en.json` file with `common.actions` namespace must exist before starting this task.

### Downstream Dependencies (Tasks That Depend on This)

| Task | Description | Dependency |
|------|-------------|------------|
| Task 2H.10 | Generate translations for 5 non-English languages | Uses button label keys |
| Sub-Epic 2A-2G | Feature-specific component translations | Components already using `t()` pattern |

---

## 7. Acceptance Criteria

From REQ-305 in gen_requests_epic2.md:

- [ ] All button labels across the application have been identified and catalogued
- [ ] Button labels are organized within the common namespace in translation files with logical grouping
- [ ] All hardcoded button text in components has been replaced with translation function calls
- [ ] Standard action buttons use shared translation keys consistently across all components
- [ ] The translation file includes all common button labels such as submit, cancel, save, delete, edit, confirm, close, and others
- [ ] Components using the same action display identical button text through shared translation keys
- [ ] All button labels remain functionally equivalent after extraction
- [ ] The changes maintain existing button behavior and accessibility attributes

### Additional Verification Criteria

- [ ] All components import `useTranslations` from 'next-intl' (client) or `getTranslations` from 'next-intl/server' (server)
- [ ] Loading states use appropriate keys (e.g., `saving`, `deleting`, `updating`)
- [ ] aria-label attributes are translated alongside visible button text
- [ ] TypeScript compilation succeeds with no errors
- [ ] Build completes successfully

---

## 8. Testing Strategy

### Pre-Implementation Verification

```bash
# Verify prerequisite: next-intl installed
npm list next-intl

# Verify prerequisite: messages/en.json exists with common namespace
cat messages/en.json | python3 -c "
import json, sys
d = json.load(sys.stdin)
if 'common' in d and 'actions' in d['common']:
    print('common.actions namespace exists')
    print(f'Keys: {len(d[\"common\"][\"actions\"])}')
else:
    print('ERROR: common.actions namespace missing')
    sys.exit(1)
"
```

### Post-Implementation Verification

```bash
# Step 1: TypeScript compilation check
npm run build

# Step 2: Count translation function usage in modified files
grep -r "useTranslations\|getTranslations" src/components | wc -l

# Step 3: Check for remaining hardcoded button strings (sample search)
grep -r "'>Cancel<\|'>Save<\|'>Submit<\|'>Delete<" src/components
# Should return 0 results if all buttons are translated
```

### Manual Verification Checklist

**Authentication Flow:**
- [ ] Login page shows translated button labels
- [ ] Loading states display correctly during sign-in
- [ ] Logout button displays translated text

**Form Components:**
- [ ] Item create/edit forms show translated buttons
- [ ] Property create/edit forms show translated buttons
- [ ] Confirmation modals show translated buttons

**Workflow Components:**
- [ ] Step navigation shows Continue/Back/Submit translated
- [ ] Exit confirmation dialog shows translated options
- [ ] Review step shows all translated action buttons

**Item Management:**
- [ ] Delete confirmation shows translated text
- [ ] Bulk actions bar shows translated labels
- [ ] Filter panel shows Clear Filters translated

**Media Editors:**
- [ ] Image cropper shows Apply Crop/Cancel Crop translated
- [ ] Image rotator shows Apply Rotate/Cancel Rotate translated
- [ ] Video trimmer shows Apply Trim/Cancel Trim translated

---

## 9. Translation Keys Reference

### Complete `common.actions` Button Labels

```json
{
  "common": {
    "actions": {
      "submit": "Submit",
      "cancel": "Cancel",
      "save": "Save",
      "saveChanges": "Save Changes",
      "saving": "Saving...",
      "delete": "Delete",
      "deleting": "Deleting...",
      "deleteNItems": "Delete {count} Items",
      "edit": "Edit",
      "create": "Create",
      "creating": "Creating...",
      "update": "Update",
      "updating": "Updating...",
      "back": "Back",
      "next": "Next",
      "continue": "Continue",
      "close": "Close",
      "confirm": "Confirm",
      "done": "Done",
      "finish": "Finish",
      "stay": "Stay",
      "leave": "Leave",

      "signIn": "Sign In",
      "signingIn": "Signing In...",
      "signInWithEmail": "Sign In with Email",
      "signOut": "Sign Out",
      "continueWithGoogle": "Continue with Google",
      "register": "Register",
      "registering": "Registering...",

      "createItem": "Create Item",
      "updateItem": "Update Item",
      "createProperty": "Create Property",
      "updateProperty": "Update Property",
      "creatingProperty": "Creating property...",
      "savingProperty": "Saving property...",

      "add": "Add",
      "addLink": "Add Link",
      "addLinkAnyway": "Add Link Anyway",
      "addTag": "Add Tag",
      "addMoreMedia": "Add more media",
      "addMoreLinks": "Add more links",
      "editGuides": "Edit guides",
      "editItemDetails": "Edit item details",
      "writeText": "Write Text",
      "uploadFile": "Upload File",
      "removeTag": "Remove Tag",
      "moveTo": "Move to",

      "applyCrop": "Apply Crop",
      "cancelCrop": "Cancel Crop",
      "applyRotate": "Apply Rotate",
      "cancelRotate": "Cancel Rotate",
      "applyTrim": "Apply Trim",
      "cancelTrim": "Cancel Trim",
      "cancelEditor": "Cancel Editor",

      "completeUpload": "Complete Upload",
      "completeText": "Complete Text",
      "completeUrl": "Complete URL",
      "clearFilters": "Clear Filters",
      "apply": "Apply",
      "exitWorkflow": "Exit Workflow",

      "newItem": "New Item",
      "addProperty": "Add Property",
      "viewAll": "View All",
      "view": "View",
      "print": "Print",
      "requestAccess": "Request Access"
    }
  }
}
```

### Key Count Summary

| Category | Key Count |
|----------|-----------|
| Basic Actions | ~15 |
| Authentication Actions | ~6 |
| Form/Entity Actions | ~8 |
| Content Actions | ~12 |
| Media Editor Actions | ~7 |
| Workflow Actions | ~8 |
| Dashboard Actions | ~6 |
| **Total** | **~62** |

---

## 10. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Missing button labels | Medium | Low | Thorough grep-based audit; iterative discovery |
| Breaking button functionality | Low | High | Test each component after modification |
| Inconsistent key naming | Medium | Low | Follow established `common.actions` convention |
| Server/client component mismatch | Medium | Medium | Use correct hook: `useTranslations` (client) vs `getTranslations` (server) |
| TypeScript errors | Medium | Medium | Run build after each batch of changes |
| Missing prerequisite (REQ-304) | Low | High | Verify `common.actions` namespace exists before starting |

---

## 11. Estimated Effort

| Task | Estimate |
|------|----------|
| Audit and catalogue all button labels | 30 min |
| Extend `common.actions` namespace | 20 min |
| Update authentication components (4 files) | 25 min |
| Update form components (3 files) | 20 min |
| Update wizard/workflow components (6 files) | 40 min |
| Update item management components (4 files) | 30 min |
| Update media editor components (4 files) | 20 min |
| Update SimpleDashboard components (4 files) | 25 min |
| Update instruction/content components (4 files) | 20 min |
| Verification and testing | 30 min |
| **Total** | **~4.5 hours** |

---

## 12. Implementation Order

Recommended order to minimize breaking changes:

1. **Extend `common.actions` namespace** (Task 2H.2.2)
   - Ensures all keys are available before component updates

2. **Update core shared components first:**
   - `ConfirmationModal.tsx`
   - `StepNavigation.tsx`
   - These are used by many other components

3. **Update by feature area (independent):**
   - Authentication components
   - Form components
   - Media editor components

4. **Update workflow components:**
   - These have the most button labels
   - Test workflow end-to-end

5. **Update Item Management components**

6. **Update SimpleDashboard components**

7. **Update remaining content/instruction components**

8. **Final verification and testing**

---

## 13. Code Examples

### Client Component Example

```typescript
// /src/components/LoginForm.tsx
'use client';

import { useTranslations } from 'next-intl';

export function LoginForm() {
  const t = useTranslations('common.actions');
  const [loading, setLoading] = useState(false);

  return (
    <form>
      <button type="button" onClick={onCancel}>
        {t('cancel')}
      </button>
      <button type="submit" disabled={loading}>
        {loading ? t('signingIn') : t('signInWithEmail')}
      </button>
    </form>
  );
}
```

### Server Component Example

```typescript
// /src/app/dashboard2/page.tsx
import { getTranslations } from 'next-intl/server';

export default async function DashboardPage() {
  const t = await getTranslations('common.actions');

  return (
    <div>
      <button>{t('newItem')}</button>
      <button>{t('addProperty')}</button>
    </div>
  );
}
```

### Dynamic Count Example

```typescript
// /src/components/ItemManager/components/dialogs/ConfirmDeleteDialog.tsx
import { useTranslations } from 'next-intl';

export function ConfirmDeleteDialog({ count }: { count: number }) {
  const t = useTranslations('common.actions');

  return (
    <button>
      {count === 1 ? t('delete') : t('deleteNItems', { count })}
    </button>
  );
}
```

---

## 14. References

- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [PRD: L10N Epic 2 - Static UI Translation](/docs/prd/PRD_L10N_Epic2_Static_UI_Translation.md)
- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [REQ-304: Create Common Namespace Structure](/docs/REQ-304-create-common-namespace-structure-in-overview.md)
- [Plan: L10N Epic 1 - Foundation](/docs/prd/Plan-110-L10N-Epic1-Foundation.md)

---

*Document generated for FAQBNB Localization Epic 2 - Static UI Translation, Sub-Epic 2H, Task 2H.2*
