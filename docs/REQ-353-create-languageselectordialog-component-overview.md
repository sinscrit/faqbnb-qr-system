# REQ-353: Create LanguageSelectorDialog Component - Implementation Breakdown

**Generated:** 2026-01-19 23:45 UTC
**Last Modified:** 2026-01-19 23:45 UTC
**Epic:** L10N Epic 5 - Owner Translation Management
**Phase:** 4 - Bulk Operations & Management Page
**Task ID:** 4.2
**Implementation Plan Reference:** docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md
**Size:** S (Small)
**Estimated Effort:** 2-3 hours

---

## 1. Overview

### 1.1 Purpose

Create a modal dialog component that allows property owners to select one or more target languages when performing bulk re-translation operations. This component is part of the BulkTranslationBar UI and provides a user-friendly interface for language selection with Select All / Deselect All functionality.

### 1.2 Background

Property owners managing multilingual content need the ability to bulk re-translate selected items to specific languages. Rather than re-translating to all languages (which may be unnecessary or wasteful), owners should be able to choose exactly which languages need re-translation. This component supports that workflow by presenting a checkbox-based language selector within a modal dialog.

### 1.3 Scope

**In Scope:**
- Modal dialog for language selection using Radix Dialog pattern (custom implementation following existing codebase patterns)
- Checkbox list displaying all 6 supported languages with flags and native names
- Select All / Deselect All toggle functionality
- Confirm and Cancel action buttons
- Loading state support during bulk operation
- Full accessibility compliance (focus trap, keyboard navigation, ARIA attributes)

**Out of Scope:**
- The parent BulkTranslationBar component (Task 4.1)
- Actual re-translation API calls (handled by parent)
- Translation status display

---

## 2. Technical Context

### 2.1 Existing Codebase Patterns

| Pattern | Location | Relevance |
|---------|----------|-----------|
| BulkTagDialog | `/src/components/ItemManager/components/BulkActions/BulkTagDialog.tsx` | Primary reference for dialog structure, checkbox patterns, focus trap |
| BulkMoveDialog | `/src/components/ItemManager/components/BulkActions/BulkMoveDialog.tsx` | Reference for dialog layout, property dropdown pattern |
| useFocusTrap | `/src/components/ItemManager/utils/a11yUtils.tsx` | Focus management hook |
| i18n Config | `/src/lib/i18n/config.ts` | Language list, metadata, flag emojis |
| cn utility | `/src/lib/utils` | Class name merging utility |

### 2.2 Dependencies

| Dependency | Purpose | Status |
|------------|---------|--------|
| `@/lib/i18n/config` | `locales`, `localeMetadata`, `SupportedLocale` types | Exists (Epic 1) |
| `@/lib/utils` | `cn` utility function | Exists |
| `lucide-react` | Icons (X, Check, Globe, Loader2) | Exists |
| `a11yUtils` | `useFocusTrap` hook | Exists |

### 2.3 Supported Languages

From `/src/lib/i18n/config.ts`:
- English (en) - Flag: GB
- French (fr) - Flag: FR
- Spanish (es) - Flag: ES
- German (de) - Flag: DE
- Dutch (nl) - Flag: NL
- Italian (it) - Flag: IT

---

## 3. Component Specification

### 3.1 Props Interface

```typescript
/**
 * Props for the LanguageSelectorDialog component.
 */
export interface LanguageSelectorDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Languages to exclude from selection (e.g., source language) */
  excludeLanguages?: SupportedLocale[];
  /** Pre-selected languages (for edit mode) */
  initialSelection?: SupportedLocale[];
  /** Callback when languages are confirmed */
  onConfirm: (selectedLanguages: SupportedLocale[]) => void;
  /** Callback when dialog is cancelled/closed */
  onCancel: () => void;
  /** Loading state during operation */
  loading?: boolean;
  /** Optional title override */
  title?: string;
  /** Optional description text */
  description?: string;
  /** Optional additional CSS classes */
  className?: string;
}
```

### 3.2 Component State

```typescript
interface LanguageSelectorState {
  selectedLanguages: Set<SupportedLocale>;
}
```

### 3.3 UI Layout

```
+-----------------------------------------------------------+
|  Select Languages                                    [X]   |
+-----------------------------------------------------------+
|  Select target languages for re-translation:               |
|                                                            |
|  [Select All] / [Deselect All]                             |
|                                                            |
|  [ ] GB English (English)                                  |
|  [x] FR French (Francais)                                  |
|  [x] ES Spanish (Espanol)                                  |
|  [ ] DE German (Deutsch)                                   |
|  [x] NL Dutch (Nederlands)                                 |
|  [ ] IT Italian (Italiano)                                 |
|                                                            |
+-----------------------------------------------------------+
|                        [Cancel]  [Confirm (3 selected)]    |
+-----------------------------------------------------------+
```

### 3.4 Behavior Specification

| Behavior | Description |
|----------|-------------|
| Initial State | If `initialSelection` provided, pre-check those languages; otherwise all unchecked |
| Select All | Selects all available languages (excluding `excludeLanguages`) |
| Deselect All | Clears all selections |
| Checkbox Toggle | Individual language toggle updates `selectedLanguages` Set |
| Confirm Button | Disabled if no languages selected; calls `onConfirm` with array |
| Cancel Button | Calls `onCancel`, no state changes persisted |
| Escape Key | Closes dialog (same as Cancel) when not loading |
| Backdrop Click | Closes dialog when not loading |
| Loading State | Disables all interactive elements, shows spinner in Confirm button |

---

## 4. Implementation Tasks

### Task 1: Create types file
**File:** `/src/components/TranslationManagement/BulkTranslationBar/LanguageSelectorDialog.types.ts`
- Define `LanguageSelectorDialogProps` interface
- Export types for external use

### Task 2: Create LanguageSelectorDialog component
**File:** `/src/components/TranslationManagement/BulkTranslationBar/LanguageSelectorDialog.tsx`

**Subtasks:**
1. Create component shell with 'use client' directive
2. Implement state management with `useState` for `selectedLanguages` Set
3. Create available languages computation (filter out `excludeLanguages`)
4. Implement Select All / Deselect All toggle
5. Create language checkbox list with proper styling
6. Add header with title and close button
7. Add footer with Cancel and Confirm buttons
8. Integrate `useFocusTrap` from a11yUtils
9. Implement Escape key and backdrop click handlers
10. Handle body scroll lock when dialog is open
11. Add loading state handling

### Task 3: Create barrel export
**File:** `/src/components/TranslationManagement/BulkTranslationBar/index.ts`
- Export `LanguageSelectorDialog` component
- Export types

### Task 4: Update parent barrel exports (if exists)
**File:** `/src/components/TranslationManagement/index.ts`
- Add BulkTranslationBar exports

---

## 5. Authorized Files and Functions for Modification

### 5.1 New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/components/TranslationManagement/BulkTranslationBar/LanguageSelectorDialog.tsx` | Main component |
| `/src/components/TranslationManagement/BulkTranslationBar/LanguageSelectorDialog.types.ts` | Type definitions |
| `/src/components/TranslationManagement/BulkTranslationBar/index.ts` | Barrel exports |

### 5.2 Files to Modify

| File Path | Modification |
|-----------|--------------|
| `/src/components/TranslationManagement/index.ts` | Add export for BulkTranslationBar module (create if not exists) |

### 5.3 Read-Only Reference Files

| File Path | Purpose |
|-----------|---------|
| `/src/components/ItemManager/components/BulkActions/BulkTagDialog.tsx` | Dialog structure pattern |
| `/src/components/ItemManager/components/BulkActions/BulkMoveDialog.tsx` | Dialog layout pattern |
| `/src/components/ItemManager/utils/a11yUtils.tsx` | useFocusTrap hook |
| `/src/lib/i18n/config.ts` | Language configuration |
| `/src/lib/utils.ts` | cn utility |

---

## 6. Code Patterns to Follow

### 6.1 Component Structure
```typescript
'use client';

/**
 * LanguageSelectorDialog Component
 *
 * Modal dialog for selecting target languages for bulk translation operations.
 *
 * @module TranslationManagement/BulkTranslationBar/LanguageSelectorDialog
 * @see docs/REQ-353-create-languageselectordialog-component-overview.md
 * @lastModified 2026-01-19
 */

// Imports organized by: React, external libs, internal modules, types
```

### 6.2 Styling Conventions
- Use Tailwind CSS classes
- Use `cn()` utility for conditional classes
- Minimum 44x44px touch targets (use `min-h-[44px] min-w-[44px]` or `min-h-[48px]`)
- Focus ring: `focus:ring-2 focus:ring-blue-500` or `focus:ring-[#FF385C]`
- Consistent padding: `p-4` for sections, `gap-3` for spacing

### 6.3 Accessibility Requirements
- `role="dialog"` and `aria-modal="true"` on dialog container
- `aria-labelledby` pointing to title element
- `useFocusTrap` hook for focus management
- Escape key handling
- Clear ARIA labels on all interactive elements
- Screen reader announcements where appropriate

### 6.4 Color Palette (from PRD)
- Selected checkbox: `bg-blue-600` or `bg-[#FF385C]`
- Hover states: `hover:bg-gray-100`
- Primary button: `bg-blue-600 hover:bg-blue-700` or `bg-[#FF385C]`
- Secondary button: `bg-white border border-gray-300`

---

## 7. Testing Considerations

### 7.1 Unit Test Cases
- Renders all available languages
- Excludes languages in `excludeLanguages` prop
- Pre-selects languages from `initialSelection`
- Select All selects all available languages
- Deselect All clears all selections
- Confirm button disabled when no selection
- Confirm callback receives correct language array
- Cancel callback invoked on cancel/escape/backdrop click
- Loading state disables all interactions

### 7.2 Accessibility Test Cases
- Focus moves to first focusable element on open
- Focus trapped within dialog
- Focus restored to trigger element on close
- Escape key closes dialog
- All checkboxes keyboard accessible
- Screen reader announces dialog purpose

---

## 8. Integration Notes

### 8.1 Parent Component Usage
```tsx
// In BulkTranslationBar component
<LanguageSelectorDialog
  isOpen={isLanguageDialogOpen}
  excludeLanguages={[sourceLanguage]}
  onConfirm={(languages) => {
    handleBulkRetranslate(selectedItems, languages);
    setIsLanguageDialogOpen(false);
  }}
  onCancel={() => setIsLanguageDialogOpen(false)}
  loading={isRetranslating}
  title="Select Languages for Re-translation"
  description="Choose which languages to re-translate for the selected items."
/>
```

### 8.2 Dependency on Epic 1
This component uses types and utilities from Epic 1 Foundation:
- `SupportedLocale` type from `/src/lib/i18n/config.ts`
- `localeMetadata` for display names and flags
- `locales` array for iteration

---

## 9. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| i18n config not yet available | Low | High | Verify Epic 1 completion, fallback to hardcoded list |
| Inconsistent styling with other dialogs | Medium | Low | Follow BulkTagDialog pattern exactly |
| Focus trap issues | Low | Medium | Use proven useFocusTrap hook from codebase |

---

## 10. Acceptance Criteria

- [ ] LanguageSelectorDialog renders as a modal overlay
- [ ] Dialog displays all 6 supported languages with flags and native names
- [ ] Languages in `excludeLanguages` are not shown
- [ ] Select All/Deselect All toggles work correctly
- [ ] Individual language checkboxes can be toggled
- [ ] Confirm button shows count of selected languages
- [ ] Confirm button is disabled when no languages selected
- [ ] Cancel button and Escape key close the dialog
- [ ] Clicking backdrop closes the dialog
- [ ] Loading state disables all interactions and shows spinner
- [ ] Focus is trapped within the dialog when open
- [ ] Focus returns to trigger element when dialog closes
- [ ] All interactive elements meet 44x44px minimum touch target
- [ ] Component follows existing codebase patterns (BulkTagDialog, BulkMoveDialog)
- [ ] TypeScript types are properly defined and exported

---

## 11. References

- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- BulkTagDialog Pattern: `/src/components/ItemManager/components/BulkActions/BulkTagDialog.tsx`
- BulkMoveDialog Pattern: `/src/components/ItemManager/components/BulkActions/BulkMoveDialog.tsx`
- i18n Configuration: `/src/lib/i18n/config.ts`
- Accessibility Utilities: `/src/components/ItemManager/utils/a11yUtils.tsx`
- Epic 5 Requests: `/docs/gen_requests_epic5.md`
