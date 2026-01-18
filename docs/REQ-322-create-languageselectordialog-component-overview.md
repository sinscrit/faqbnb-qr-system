# REQ-322: Create LanguageSelectorDialog Component - Technical Overview

**Last Modified:** 2026-01-18 12:30 UTC
**Request ID:** REQ-322
**Epic:** L10N Epic 5 - Owner Translation Management
**Phase:** 4 - Bulk Operations & Management Page
**Task ID:** 4.2
**Type:** NEW FEATURE
**Size:** M (Medium)
**Priority:** P2

---

## 1. Summary

Create a modal dialog component (`LanguageSelectorDialog`) that allows property owners to select one or more specific languages for bulk re-translation operations. The dialog displays a checkbox list of all six supported languages with Select All / Deselect All controls, enabling granular control over which languages receive bulk re-translation.

---

## 2. Requirements Reference

### From gen_requests_epic5.md (REQ-322)

**Context:** When property owners click "Re-translate Specific Language" in the BulkTranslationBar, this dialog opens to let them select target languages.

**Key Requirements:**
- Modal dialog triggered from BulkTranslationBar
- Checkbox list of all six supported languages
- Each entry shows: flag icon, language name, checkbox
- "Select All" and "Deselect All" action links
- Cancel and Confirm buttons in footer
- Confirm disabled when no languages selected
- Inline validation message when attempting to confirm with no selections
- Radix Dialog for accessibility

### Acceptance Criteria (from PRD)

- [ ] Dialog opens when "Re-translate Specific Language" action is triggered from BulkTranslationBar
- [ ] Dialog uses Radix Dialog component for accessibility and keyboard navigation
- [ ] Dialog displays all six supported languages in a vertical checkbox list
- [ ] Each language entry includes flag icon, language name, and checkbox control
- [ ] "Select All" action link checks all language checkboxes simultaneously
- [ ] "Deselect All" action link unchecks all language checkboxes simultaneously
- [ ] Dialog footer contains Cancel button that dismisses dialog without action
- [ ] Dialog footer contains Confirm button that initiates bulk re-translation for selected languages
- [ ] Confirm button is disabled when no languages are selected
- [ ] Inline validation message displays when user attempts to confirm with no selections
- [ ] Dialog tracks dirty state and prompts for confirmation if user attempts to close after making selections
- [ ] Successful confirmation closes dialog and triggers bulk re-translation operation
- [ ] Dialog is responsive and usable on tablet and desktop viewports
- [ ] Dialog is keyboard accessible with proper focus management and tab order
- [ ] Checkbox states are clearly visible for accessibility with sufficient color contrast
- [ ] Dialog provides appropriate ARIA labels for screen readers

---

## 3. Technical Context

### 3.1 Existing Stack

| Technology | Details |
|------------|---------|
| **Framework** | Next.js 15.5.9 with App Router |
| **Language** | TypeScript 5.x (strict mode) |
| **Styling** | Tailwind CSS 4.x |
| **UI Components** | Radix UI primitives (`@radix-ui/react-dialog`), Lucide React icons |
| **Utilities** | `cn()` from `@/lib/utils`, `useFocusTrap` from a11yUtils |

### 3.2 Relevant Existing Patterns

| Pattern | Location | Usage |
|---------|----------|-------|
| Radix Dialog | `/src/components/SimpleDashboard/AddPropertyModal.tsx` | Dialog.Root, Dialog.Portal, Dialog.Overlay, Dialog.Content pattern |
| Checkbox List | `/src/components/ItemManager/components/dialogs/ContentTypeFilter.tsx` | `role="checkbox"` button pattern with Check icon |
| Bulk Dialog | `/src/components/ItemManager/components/BulkActions/BulkTagDialog.tsx` | Modal dialog with checkbox selection, loading states |
| Focus Trap | `/src/components/ItemManager/utils/a11yUtils.tsx` | `useFocusTrap()` hook for modal focus management |

### 3.3 Dependencies

| Dependency | Status | Purpose |
|------------|--------|---------|
| `@radix-ui/react-dialog` | Installed | Accessible modal dialog primitive |
| `lucide-react` | Installed | Check icon, X icon, Languages/Globe icons |
| `/src/lib/utils.ts` | Exists | `cn()` utility for className merging |
| Epic 1 Translation Tables | Required | Language codes, translation infrastructure |
| BulkTranslationBar (Task 4.1) | Required | Parent component that triggers this dialog |

### 3.4 Supported Languages

Based on the implementation plan, the system supports **six languages**:

| Code | Language Name | Flag Emoji |
|------|---------------|------------|
| `en` | English | 🇺🇸 or 🇬🇧 |
| `fr` | French | 🇫🇷 |
| `es` | Spanish | 🇪🇸 |
| `de` | German | 🇩🇪 |
| `nl` | Dutch | 🇳🇱 |
| `it` | Italian | 🇮🇹 |

---

## 4. Component Architecture

### 4.1 File Structure

```
/src/components/TranslationManagement/
├── BulkTranslationBar/
│   ├── index.ts                    # Exports
│   ├── BulkTranslationBar.tsx      # Parent component (Task 4.1)
│   └── LanguageSelectorDialog.tsx  # This component (Task 4.2)
```

### 4.2 Component Interface

```typescript
/**
 * Supported language code type
 */
export type SupportedLanguage = 'en' | 'fr' | 'es' | 'de' | 'nl' | 'it';

/**
 * Language configuration with display info
 */
export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  flag: string;
}

/**
 * Props for LanguageSelectorDialog
 */
export interface LanguageSelectorDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Callback when dialog is closed without confirming */
  onClose: () => void;
  /** Callback when languages are confirmed for re-translation */
  onConfirm: (languages: SupportedLanguage[]) => void;
  /** Loading state during bulk operation */
  loading?: boolean;
  /** Optional additional CSS classes */
  className?: string;
}
```

### 4.3 Internal State

```typescript
interface DialogState {
  /** Set of currently selected language codes */
  selectedLanguages: Set<SupportedLanguage>;
  /** Whether user has made changes (for dirty state) */
  isDirty: boolean;
  /** Whether showing validation error */
  showValidationError: boolean;
}
```

---

## 5. Implementation Approach

### 5.1 Component Structure

```tsx
// Pseudocode structure
<Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
  <Dialog.Portal>
    <Dialog.Overlay />
    <Dialog.Content>
      {/* Header */}
      <Dialog.Title>Select Languages</Dialog.Title>
      <Dialog.Close />

      {/* Body */}
      <div role="group" aria-label="Language selection">
        {/* Select All / Deselect All */}
        <div className="flex gap-2">
          <button onClick={handleSelectAll}>Select All</button>
          <button onClick={handleDeselectAll}>Deselect All</button>
        </div>

        {/* Language checkbox list */}
        {SUPPORTED_LANGUAGES.map(lang => (
          <button
            role="checkbox"
            aria-checked={isSelected}
            onClick={() => toggleLanguage(lang.code)}
          >
            <CheckboxIndicator />
            <FlagIcon />
            <LanguageName />
          </button>
        ))}

        {/* Validation error */}
        {showValidationError && <ValidationMessage />}
      </div>

      {/* Footer */}
      <div>
        <CancelButton />
        <ConfirmButton disabled={noSelection || loading} />
      </div>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
```

### 5.2 Key Behaviors

1. **Initial State**: All languages deselected when dialog opens
2. **Select All**: Checks all six language checkboxes
3. **Deselect All**: Unchecks all language checkboxes
4. **Dirty State**: Track if user made changes from initial state
5. **Close Warning**: If dirty, prompt before closing (on X, overlay click, Escape)
6. **Validation**: Show inline error when confirming with zero selections
7. **Submit**: Return array of selected language codes to parent

### 5.3 Accessibility Requirements

| Requirement | Implementation |
|-------------|----------------|
| Focus trap | Use `useFocusTrap(dialogRef, isOpen)` |
| Keyboard navigation | Arrow keys for checkbox list, Enter/Space to toggle |
| ARIA attributes | `role="checkbox"`, `aria-checked`, `aria-label` |
| Screen reader | `aria-live="polite"` for validation errors |
| Focus on open | First focusable element (Select All button) |
| Escape to close | Built-in with Radix Dialog |

### 5.4 Styling Guidelines (Airbnb Design System)

| Element | Style |
|---------|-------|
| Dialog width | `max-w-md` (448px) |
| Border radius | `rounded-xl` |
| Background | `bg-white` |
| Header border | `border-b border-[#DDDDDD]` |
| Selected checkbox | `bg-blue-500` with white Check icon |
| Unselected checkbox | `border border-gray-400 bg-white` |
| Selected row | `bg-blue-50 border-2 border-blue-300` |
| Confirm button (primary) | `bg-[#222222] text-white` or `bg-blue-600` |
| Cancel button | `border border-gray-300 bg-white` |
| Touch targets | `min-h-[48px]` for mobile |
| Validation error | `text-[#FF385C]` (Airbnb red) |

---

## 6. Data Flow

```
BulkTranslationBar
    │
    ├── User clicks "Re-translate Specific Language"
    │   └── Opens LanguageSelectorDialog (isOpen=true)
    │
    ├── LanguageSelectorDialog
    │   ├── User selects/deselects languages
    │   ├── User clicks "Confirm"
    │   │   └── onConfirm(['fr', 'es', 'de']) called
    │   └── User clicks "Cancel"
    │       └── onClose() called
    │
    └── BulkTranslationBar receives selected languages
        └── Calls re-translate API with selected languages
```

---

## 7. Authorized Files and Functions for Modification

### 7.1 Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/components/TranslationManagement/BulkTranslationBar/LanguageSelectorDialog.tsx` | Main component implementation |

### 7.2 Files to Modify

| File Path | Changes |
|-----------|---------|
| `/src/components/TranslationManagement/BulkTranslationBar/index.ts` | Export LanguageSelectorDialog |
| `/src/components/TranslationManagement/TranslationManagement.types.ts` | Add `SupportedLanguage` type, `LanguageOption` interface, `LanguageSelectorDialogProps` interface |

### 7.3 Functions to Create

| Function | File | Purpose |
|----------|------|---------|
| `LanguageSelectorDialog` | LanguageSelectorDialog.tsx | Main component |
| `handleSelectAll` | LanguageSelectorDialog.tsx | Select all languages |
| `handleDeselectAll` | LanguageSelectorDialog.tsx | Deselect all languages |
| `handleToggleLanguage` | LanguageSelectorDialog.tsx | Toggle individual language |
| `handleConfirm` | LanguageSelectorDialog.tsx | Validate and confirm selection |
| `handleClose` | LanguageSelectorDialog.tsx | Handle close with dirty state check |

### 7.4 Constants to Define

| Constant | Location | Value |
|----------|----------|-------|
| `SUPPORTED_LANGUAGES` | LanguageSelectorDialog.tsx or types file | Array of `LanguageOption` objects |

```typescript
export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
];
```

---

## 8. Dependencies and Sequencing

### 8.1 Prerequisites

| Task | Status | Blocking? |
|------|--------|-----------|
| Task 4.1: BulkTranslationBar | Must exist | Yes - parent component |
| Task 2.1: TranslationManagement.types.ts | Should exist | No - can be created alongside |
| Epic 1: Translation infrastructure | Required | Yes - language codes |

### 8.2 Downstream Tasks

| Task | Dependency |
|------|------------|
| Task 4.3: Translation Management Page | Uses BulkTranslationBar which uses this dialog |

---

## 9. Testing Considerations

### 9.1 Unit Tests

- Renders all six languages in checkbox list
- Select All checks all checkboxes
- Deselect All unchecks all checkboxes
- Individual toggle works correctly
- Confirm button disabled when no selection
- Validation error shown when attempting to confirm with no selection
- onConfirm called with correct language array
- onClose called when cancelled
- Dirty state detection works

### 9.2 Accessibility Tests

- Dialog has proper ARIA attributes
- Checkboxes have correct `aria-checked` state
- Validation error announced to screen readers
- Focus trapped within dialog
- Keyboard navigation works (Tab, Shift+Tab, Enter, Space, Escape)

### 9.3 Integration Tests

- Dialog opens from BulkTranslationBar
- Selected languages passed correctly to parent
- Dialog closes after confirmation
- Loading state disables interaction

---

## 10. Error Handling

| Scenario | Handling |
|----------|----------|
| No languages selected | Show inline validation error, disable Confirm |
| User closes with unsaved changes | Show confirmation prompt |
| Parent loading state | Disable all interactions, show loading indicator |

---

## 11. UI Visual Reference

```
┌─────────────────────────────────────────────────────┐
│ Select Languages for Re-translation            [X]  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  [Select All]  [Deselect All]                       │
│                                                     │
│  ┌───────────────────────────────────────────────┐  │
│  │ ☐  🇺🇸  English                               │  │
│  └───────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────┐  │
│  │ ☑  🇫🇷  French                                │  │
│  └───────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────┐  │
│  │ ☑  🇪🇸  Spanish                               │  │
│  └───────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────┐  │
│  │ ☐  🇩🇪  German                                │  │
│  └───────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────┐  │
│  │ ☐  🇳🇱  Dutch                                 │  │
│  └───────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────┐  │
│  │ ☐  🇮🇹  Italian                               │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  ⚠️ Please select at least one language (if none)   │
│                                                     │
├─────────────────────────────────────────────────────┤
│                     [Cancel]  [Confirm (2)]         │
└─────────────────────────────────────────────────────┘
```

**Legend:**
- `☐` = Unchecked checkbox (gray border)
- `☑` = Checked checkbox (blue background with white checkmark)
- `[X]` = Close button
- `(2)` = Count of selected languages in Confirm button

---

## 12. References

- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- **Request Document:** `/docs/gen_requests_epic5.md` (REQ-322)
- **Radix Dialog Documentation:** https://www.radix-ui.com/primitives/docs/components/dialog
- **Existing Pattern - BulkTagDialog:** `/src/components/ItemManager/components/BulkActions/BulkTagDialog.tsx`
- **Existing Pattern - ContentTypeFilter:** `/src/components/ItemManager/components/dialogs/ContentTypeFilter.tsx`
- **Existing Pattern - AddPropertyModal:** `/src/components/SimpleDashboard/AddPropertyModal.tsx`
- **Accessibility Utils:** `/src/components/ItemManager/utils/a11yUtils.tsx`

---

## 13. Estimation

| Activity | Estimate |
|----------|----------|
| Component implementation | 3-4 hours |
| Types and exports | 30 minutes |
| Unit tests | 1-2 hours |
| Accessibility testing | 1 hour |
| **Total** | **5-7 hours** |

---

*Document generated for FAQBNB Localization Epic 5 - Task 4.2*
