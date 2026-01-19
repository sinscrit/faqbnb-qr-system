# REQ-364: Add Accessibility Features to Translation Components - Detailed Task Breakdown

**Request ID**: REQ-364
**Epic**: L10N Epic 5 - Owner Translation Management
**Phase**: 7 - Integration & Polish
**Task ID**: 7.4
**Type**: ENHANCEMENT
**Size**: M (Medium)
**Document Created**: 2026-01-19
**Last Modified**: 2026-01-19

---

## Executive Summary

This document provides granular, actionable implementation tasks for adding comprehensive accessibility features to all translation management components. The implementation ensures WCAG 2.1 Level AA compliance by adding proper ARIA labels to status icons, implementing keyboard navigation in preview panels, creating screen reader announcements for status changes, and ensuring proper focus management in modal dialogs. The work builds upon existing accessibility utilities in `src/components/ItemManager/utils/a11yUtils.tsx`.

---

## Reference Documents

| Document | Path | Purpose |
|----------|------|---------|
| Overview Document | `/docs/REQ-364-add-accessibility-features-overview.md` | Technical implementation breakdown |
| Requirements | `/docs/gen_requests_epic5.md` (REQ-364 section) | Feature requirements and acceptance criteria |
| Implementation Plan | `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md` | Epic-level implementation plan |
| Existing A11y Utils | `/src/components/ItemManager/utils/a11yUtils.tsx` | Reusable accessibility hooks and utilities |

---

## Task Dependencies

```
Task 1 (ARIA Labels for Status Icons)
    → Task 5 (Progress Bar ARIA) [independent]
    → Task 6 (Focus Indicators) [independent]

Task 2 (Keyboard Navigation) → depends on Task 1
Task 3 (Screen Reader Announcements) → depends on Task 2
Task 4 (Focus Management in Modals) → depends on Task 1
Task 7 (Semantic HTML) → can run parallel with Tasks 1-6
Task 8 (Alert Dialog Pattern) → depends on Task 4
Task 9 (Language Attributes) → can run parallel with Tasks 1-6
Task 10 (Accessibility Testing) → depends on all other tasks
```

---

## Detailed Tasks

### Task 1: Add ARIA Labels to TranslationStatusItem Component

**Story Points**: 1
**Priority**: Critical
**File**: `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx`

#### Objective
Add descriptive ARIA labels to all status icons and action buttons so screen reader users understand the translation state for each language.

#### Preconditions
- TranslationStatusItem component exists and renders status icons
- Component receives translation status and language information as props

#### Implementation Steps

##### Step 1.1: Create Status ARIA Label Constants
```typescript
// Add at top of file or in a shared constants file
export const STATUS_ARIA_LABELS: Record<string, string> = {
  pending: 'Translation pending',
  processing: 'Translation in progress',
  completed: 'Translation complete',
  failed: 'Translation failed',
  manual: 'Manually edited translation'
};

export const STALE_ARIA_SUFFIX = ', translation may be outdated';
```

##### Step 1.2: Add ARIA to Status Icon Element
Locate the status icon element and add:
```tsx
<span
  role="img"
  aria-label={`${locale.name}: ${STATUS_ARIA_LABELS[status]}${isStale ? STALE_ARIA_SUFFIX : ''}`}
  className={cn('flex-shrink-0', STATUS_COLORS[status])}
>
  {STATUS_ICONS[status]}
</span>
```

##### Step 1.3: Add ARIA Labels to Action Buttons
For each action button (Edit, Re-translate, Retry):
```tsx
<button
  onClick={onEdit}
  aria-label={`Edit ${locale.name} translation`}
  className="min-h-[44px] min-w-[44px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
>
  <Edit2 aria-hidden="true" className="w-4 h-4" />
</button>

<button
  onClick={onRetranslate}
  aria-label={`Re-translate ${locale.name}`}
  className="min-h-[44px] min-w-[44px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
>
  <RefreshCw aria-hidden="true" className="w-4 h-4" />
</button>

<button
  onClick={onRetry}
  aria-label={`Retry ${locale.name} translation`}
  className="min-h-[44px] min-w-[44px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
>
  <RotateCcw aria-hidden="true" className="w-4 h-4" />
</button>
```

##### Step 1.4: Hide Decorative Icons from Screen Readers
For flag icons and other decorative elements:
```tsx
<FlagIcon aria-hidden="true" className="w-5 h-5" />
```

##### Step 1.5: Add `role="listitem"` to Component Root
If not already wrapped in a list structure:
```tsx
<div role="listitem" className="...">
  {/* Status item content */}
</div>
```

#### Verification Checklist
- [ ] Screen reader announces status for each language (e.g., "French: Translation complete")
- [ ] Stale translations include outdated warning in announcement
- [ ] All action buttons have accessible names
- [ ] Decorative icons hidden from screen readers with `aria-hidden="true"`
- [ ] Minimum 44x44px touch targets on all buttons

---

### Task 2: Implement Keyboard Navigation in TranslationPreviewPanel

**Story Points**: 2
**Priority**: Critical
**File**: `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx`

#### Objective
Enable full keyboard navigation within the translation preview panel, including focus trapping, arrow key navigation between languages, and Escape to close.

#### Preconditions
- TranslationPreviewPanel component exists
- a11yUtils.tsx utilities available (`useFocusTrap`, `useRovingTabIndex`)
- Panel has `isOpen` and `onClose` props

#### Implementation Steps

##### Step 2.1: Import Accessibility Hooks
```typescript
import {
  useFocusTrap,
  useFocusRestore,
  useRovingTabIndex,
  FOCUSABLE_SELECTOR
} from '@/components/ItemManager/utils/a11yUtils';
```

##### Step 2.2: Add Refs and Focus Management Hooks
```typescript
const TranslationPreviewPanel: React.FC<TranslationPreviewPanelProps> = ({
  isOpen,
  onClose,
  entityType,
  entityId,
  sourceLanguage,
  sourceContent,
  ...props
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Focus trap for the entire panel
  useFocusTrap(panelRef, isOpen);

  // Roving tabindex for language status list
  const { currentIndex, setIndex, handleKeyDown } = useRovingTabIndex(
    SUPPORTED_LOCALES.length
  );
```

##### Step 2.3: Add Escape Key Handler
```typescript
useEffect(() => {
  if (!isOpen) return;

  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  document.addEventListener('keydown', handleEscape);
  return () => document.removeEventListener('keydown', handleEscape);
}, [isOpen, onClose]);
```

##### Step 2.4: Add ARIA Dialog Attributes
```tsx
<div
  ref={panelRef}
  role="dialog"
  aria-modal="true"
  aria-labelledby="translation-panel-title"
  aria-describedby="translation-panel-description"
  className="fixed right-0 top-0 h-full w-[400px] bg-white shadow-xl z-50"
>
  <h2 id="translation-panel-title" className="text-lg font-semibold p-4 border-b">
    Translations
  </h2>
  <p id="translation-panel-description" className="sr-only">
    View and manage translations for this {entityType}
  </p>
```

##### Step 2.5: Add List Role with Keyboard Handler
```tsx
<div
  role="list"
  aria-label="Translation status by language"
  onKeyDown={handleKeyDown}
  className="divide-y"
>
  {SUPPORTED_LOCALES.filter(l => l.code !== sourceLanguage).map((locale, idx) => (
    <TranslationStatusItem
      key={locale.code}
      locale={locale}
      translation={translations[locale.code]}
      tabIndex={idx === currentIndex ? 0 : -1}
      onFocus={() => setIndex(idx)}
      onEdit={() => handleEdit(locale.code)}
      onRetranslate={() => handleRetranslate(locale.code)}
      isStale={isStale(locale.code)}
    />
  ))}
</div>
```

##### Step 2.6: Ensure Close Button is Accessible
```tsx
<button
  ref={closeButtonRef}
  onClick={onClose}
  aria-label="Close translations panel"
  className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
>
  <X aria-hidden="true" className="w-5 h-5" />
</button>
```

#### Verification Checklist
- [ ] Tab key cycles only within panel when open
- [ ] Shift+Tab navigates backwards correctly
- [ ] Arrow Up/Down keys navigate between language items
- [ ] Home key focuses first language
- [ ] End key focuses last language
- [ ] Escape closes panel
- [ ] Focus returns to trigger element when closed
- [ ] Panel title announced on open

---

### Task 3: Implement Screen Reader Announcements for Status Changes

**Story Points**: 2
**Priority**: High
**Files**:
- `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx`
- `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.tsx`

#### Objective
Announce translation status changes to screen reader users using ARIA live regions, so users are notified when translations complete or fail without needing to manually check.

#### Preconditions
- useAnnounce hook available from a11yUtils.tsx
- Translation status updates come via realtime subscription or polling

#### Implementation Steps

##### Step 3.1: Create usePrevious Helper Hook
Add to component file or a shared hooks file:
```typescript
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}
```

##### Step 3.2: Import and Initialize Announcer
```typescript
import { useAnnounce } from '@/components/ItemManager/utils/a11yUtils';
import { getLocaleByCode } from '@/lib/i18n/config';

// Inside component:
const { announce, AnnouncerRegion } = useAnnounce();
const prevTranslations = usePrevious(translations);
```

##### Step 3.3: Add Status Change Detection Effect
```typescript
useEffect(() => {
  if (!prevTranslations) return;

  Object.entries(translations).forEach(([langCode, current]) => {
    const prev = prevTranslations[langCode];
    if (!prev) return;

    const langName = getLocaleByCode(langCode)?.name || langCode;

    // Announce completions (polite)
    if (prev.status !== 'completed' && current.status === 'completed') {
      announce(`${langName} translation completed`);
    }

    // Announce failures (assertive)
    if (prev.status !== 'failed' && current.status === 'failed') {
      announce(`${langName} translation failed. Retry available.`, 'assertive');
    }

    // Announce processing start
    if (prev.status !== 'processing' && current.status === 'processing') {
      announce(`${langName} translation in progress`);
    }
  });
}, [translations, prevTranslations, announce]);
```

##### Step 3.4: Add Overall Completion Announcement
```typescript
const completedCount = Object.values(translations).filter(
  t => t.status === 'completed' || t.status === 'manual'
).length;
const totalCount = Object.keys(translations).length;
const prevCompletedCount = usePrevious(completedCount);

useEffect(() => {
  if (prevCompletedCount !== undefined && completedCount > prevCompletedCount) {
    if (completedCount === totalCount) {
      announce('All translations complete');
    }
  }
}, [completedCount, prevCompletedCount, totalCount, announce]);
```

##### Step 3.5: Render Announcer Region
```tsx
return (
  <div ref={panelRef} role="dialog" aria-modal="true" ...>
    <AnnouncerRegion />
    {/* Rest of panel content */}
  </div>
);
```

##### Step 3.6: Add Announcements to Status Widget
Apply similar pattern to TranslationStatusWidget for dashboard-level announcements:
```typescript
// In TranslationStatusWidget.tsx
const { announce, AnnouncerRegion } = useAnnounce();

useEffect(() => {
  if (prevSummary && summary.failed > prevSummary.failed) {
    announce(`${summary.failed - prevSummary.failed} translation(s) failed`, 'assertive');
  }
  if (prevSummary && summary.complete > prevSummary.complete) {
    announce(`Translation progress: ${summary.complete} of ${summary.total} complete`);
  }
}, [summary, prevSummary, announce]);
```

#### Verification Checklist
- [ ] Translation completions announced with language name
- [ ] Translation failures announced assertively with retry guidance
- [ ] Processing start announced
- [ ] "All translations complete" announced when batch finishes
- [ ] No duplicate announcements for same status change
- [ ] Announcements don't interrupt user input

---

### Task 4: Implement Focus Management in TranslationEditor Modal

**Story Points**: 2
**Priority**: Critical
**File**: `/src/components/TranslationManagement/TranslationEditor/TranslationEditor.tsx`

#### Objective
Ensure the translation editor modal properly traps focus, focuses the first input on open, returns focus on close, and provides keyboard shortcuts for common actions.

#### Preconditions
- TranslationEditor component exists
- Modal opens when user clicks Edit on a translation
- Radix Dialog or similar modal primitive available

#### Implementation Steps

##### Step 4.1: Import Dependencies
```typescript
import { useRef, useEffect, useId } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useFocusTrap } from '@/components/ItemManager/utils/a11yUtils';
```

##### Step 4.2: Set Up Refs and IDs
```typescript
const TranslationEditor: React.FC<TranslationEditorProps> = ({
  translation,
  sourceContent,
  sourceLanguage,
  isOpen,
  onSave,
  onCancel
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLTextAreaElement>(null);
  const uniqueId = useId();

  // Focus trap
  useFocusTrap(dialogRef, isOpen);
```

##### Step 4.3: Focus First Input on Open
```typescript
useEffect(() => {
  if (isOpen && titleInputRef.current) {
    // Small delay to ensure dialog is rendered
    setTimeout(() => {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    }, 0);
  }
}, [isOpen]);
```

##### Step 4.4: Add Keyboard Shortcuts
```typescript
const handleKeyDown = (e: React.KeyboardEvent) => {
  // Cmd/Ctrl+Enter to save
  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
    e.preventDefault();
    handleSave();
  }
  // Escape to cancel (Radix Dialog handles this, but explicitly for clarity)
  if (e.key === 'Escape') {
    e.preventDefault();
    onCancel();
  }
};
```

##### Step 4.5: Create Accessible Form Structure
```typescript
// Generate unique IDs for form controls
const titleInputId = `translation-title-${uniqueId}`;
const titleHintId = `translation-title-hint-${uniqueId}`;
const descInputId = `translation-desc-${uniqueId}`;
const descHintId = `translation-desc-hint-${uniqueId}`;
```

##### Step 4.6: Render Dialog with ARIA Attributes
```tsx
return (
  <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onCancel()}>
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 bg-black/50" />
      <Dialog.Content
        ref={dialogRef}
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-auto"
        onKeyDown={handleKeyDown}
        aria-describedby="editor-description"
      >
        <Dialog.Title className="text-lg font-semibold p-4 border-b">
          Edit {translation.language} Translation
        </Dialog.Title>
        <Dialog.Description id="editor-description" className="sr-only">
          Compare original content and edit the translated version. Press Escape to cancel or Cmd+Enter to save.
        </Dialog.Description>

        {/* Form content */}
        <div className="p-4 grid grid-cols-2 gap-4">
          {/* Original (read-only) */}
          <div>
            <span className="block text-sm font-medium text-gray-700 mb-1">
              Original ({getLocaleByCode(sourceLanguage)?.name || sourceLanguage})
            </span>
            <p
              lang={sourceLanguage}
              className="bg-gray-50 p-3 rounded border text-gray-800"
            >
              {sourceContent.title}
            </p>
          </div>

          {/* Translation (editable) */}
          <div>
            <label
              htmlFor={titleInputId}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Translation ({translation.language})
            </label>
            <textarea
              id={titleInputId}
              ref={titleInputRef}
              lang={translation.language}
              aria-describedby={titleHintId}
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
            />
            <p id={titleHintId} className="text-xs text-gray-500 mt-1">
              {editedTitle.length} characters. Press {navigator.platform.includes('Mac') ? 'Cmd' : 'Ctrl'}+Enter to save.
            </p>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex justify-end gap-3 p-4 border-t">
          <Dialog.Close asChild>
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Cancel
            </button>
          </Dialog.Close>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Save Translation
          </button>
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
);
```

#### Verification Checklist
- [ ] Focus moves to first textarea on modal open
- [ ] Tab key cycles only within modal
- [ ] Shift+Tab cycles backwards within modal
- [ ] Escape closes modal without saving
- [ ] Cmd/Ctrl+Enter saves and closes modal
- [ ] Focus returns to Edit button that triggered modal
- [ ] All form inputs have associated labels
- [ ] Hint text linked via aria-describedby

---

### Task 5: Add ARIA Attributes to TranslationProgressBar

**Story Points**: 1
**Priority**: Medium
**File**: `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationProgressBar.tsx`

#### Objective
Make the progress bar accessible by adding proper progressbar role, ARIA attributes for current/min/max values, and screen-reader-only text describing the progress.

#### Implementation Steps

##### Step 5.1: Add ARIA Progressbar Attributes
```tsx
interface TranslationProgressBarProps {
  completed: number;
  total: number;
  isProcessing?: boolean;
}

const TranslationProgressBar: React.FC<TranslationProgressBarProps> = ({
  completed,
  total,
  isProcessing = false
}) => {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="flex items-center gap-3">
      {/* Visual label */}
      <span className="text-sm text-gray-600 whitespace-nowrap">
        {completed}/{total} Complete
      </span>

      {/* Progress bar */}
      <div
        role="progressbar"
        aria-valuenow={completed}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label="Translation progress"
        aria-busy={isProcessing}
        className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden"
      >
        <div
          className={cn(
            "h-full transition-all duration-300",
            completed === total ? "bg-green-500" : "bg-blue-500"
          )}
          style={{ width: `${percentage}%` }}
        />
        {/* Screen reader text */}
        <span className="sr-only">
          {completed} of {total} translations complete ({percentage}%)
          {isProcessing && '. Translation in progress.'}
        </span>
      </div>
    </div>
  );
};
```

#### Verification Checklist
- [ ] Screen reader announces progress value
- [ ] Progress bar has appropriate role="progressbar"
- [ ] aria-valuenow updates as translations complete
- [ ] aria-busy indicates processing state
- [ ] Descriptive sr-only text provides context

---

### Task 6: Add Visible Focus Indicators Across All Components

**Story Points**: 1
**Priority**: High
**Files**: All translation management components

#### Objective
Ensure all interactive elements have visible focus indicators with minimum 3:1 contrast ratio, consistent styling, and appropriate minimum touch target sizes.

#### Implementation Steps

##### Step 6.1: Define Shared Focus Classes
Create or update a shared constants file:
```typescript
// /src/components/TranslationManagement/TranslationManagement.constants.ts

/** Standard focus classes for buttons and interactive elements */
export const FOCUS_CLASSES = 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';

/** Focus classes using focus-visible to avoid showing on mouse clicks */
export const FOCUS_VISIBLE_CLASSES = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2';

/** Minimum touch target classes */
export const MIN_TOUCH_TARGET = 'min-h-[44px] min-w-[44px]';

/** Combined classes for icon-only buttons */
export const ICON_BUTTON_CLASSES = cn(
  'flex items-center justify-center',
  'rounded-full hover:bg-gray-100',
  MIN_TOUCH_TARGET,
  FOCUS_CLASSES
);
```

##### Step 6.2: Update Button Components
Apply consistent focus classes to all buttons:
```tsx
// Primary button
<button className={cn(
  "px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700",
  FOCUS_CLASSES
)}>
  Save
</button>

// Secondary button
<button className={cn(
  "px-4 py-2 text-gray-700 hover:bg-gray-100 rounded",
  FOCUS_CLASSES
)}>
  Cancel
</button>

// Icon button
<button className={cn(
  ICON_BUTTON_CLASSES,
  "p-2"
)} aria-label="Close">
  <X aria-hidden="true" className="w-5 h-5" />
</button>
```

##### Step 6.3: Audit All Components
Review and update focus indicators in:
- [ ] TranslationPreviewPanel (close button, action buttons)
- [ ] TranslationStatusItem (edit, re-translate, retry buttons)
- [ ] TranslationEditor (save, cancel buttons, textarea)
- [ ] TranslationStatusWidget (view details link)
- [ ] TranslationStatusColumn (clickable status indicator)
- [ ] TranslationStatusFilter (dropdown, checkboxes)
- [ ] BulkTranslationBar (action buttons)
- [ ] LanguageSelectorDialog (checkboxes, buttons)
- [ ] ManualEditWarningDialog (action buttons)
- [ ] LanguagePreferenceSection (dropdown, save button)

#### Verification Checklist
- [ ] All buttons have visible focus ring when focused via keyboard
- [ ] Focus indicators have minimum 3:1 contrast ratio
- [ ] Focus styling is consistent across all components
- [ ] Icon-only buttons have minimum 44x44px touch targets
- [ ] Focus indicators don't cause layout shifts

---

### Task 7: Implement Semantic HTML Structure

**Story Points**: 1
**Priority**: Medium
**Files**: All translation management components

#### Objective
Replace generic div elements with semantic HTML elements where appropriate to improve accessibility tree structure and screen reader navigation.

#### Implementation Steps

##### Step 7.1: Update TranslationPreviewPanel Structure
```tsx
<aside
  ref={panelRef}
  role="dialog"
  aria-modal="true"
  aria-labelledby="panel-title"
  className="fixed right-0 top-0 h-full w-[400px] bg-white shadow-xl z-50"
>
  <header className="flex items-center justify-between p-4 border-b">
    <h2 id="panel-title" className="text-lg font-semibold">Translations</h2>
    <button aria-label="Close panel" className={ICON_BUTTON_CLASSES}>
      <X aria-hidden="true" className="w-5 h-5" />
    </button>
  </header>

  <section aria-labelledby="source-heading" className="p-4 border-b">
    <h3 id="source-heading" className="text-sm font-medium text-gray-700 mb-2">
      Source Content ({sourceLanguage})
    </h3>
    {/* Source content display */}
  </section>

  <section aria-labelledby="translations-heading" className="flex-1 overflow-auto">
    <h3 id="translations-heading" className="text-sm font-medium text-gray-700 p-4 pb-2">
      Translations
    </h3>
    <ul role="list" aria-label="Translation status by language" className="divide-y">
      {languages.map(lang => (
        <li key={lang.code}>
          <TranslationStatusItem {...props} />
        </li>
      ))}
    </ul>
  </section>

  <footer className="p-4 border-t flex justify-end gap-2">
    <button className="...">Re-translate All</button>
    <button className="...">Close</button>
  </footer>
</aside>
```

##### Step 7.2: Ensure Button Elements for Actions
Replace any div/span with onClick handlers:
```tsx
// WRONG
<div onClick={handleClick} className="cursor-pointer">
  Click me
</div>

// CORRECT
<button onClick={handleClick} type="button">
  Click me
</button>
```

##### Step 7.3: Use nav for Navigation Links
In TranslationStatusWidget link to management page:
```tsx
<nav aria-label="Translation management">
  <a href="/dashboard2/translations" className="...">
    View All Translations
  </a>
</nav>
```

##### Step 7.4: Use fieldset/legend for Related Controls
In LanguageSelectorDialog:
```tsx
<fieldset>
  <legend className="text-sm font-medium mb-2">
    Select languages to translate
  </legend>
  <div className="space-y-2">
    {languages.map(lang => (
      <label key={lang.code} className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={selected.includes(lang.code)}
          onChange={() => toggleLanguage(lang.code)}
          className="rounded border-gray-300 focus:ring-blue-500"
        />
        {lang.name}
      </label>
    ))}
  </div>
</fieldset>
```

#### Verification Checklist
- [ ] Buttons used for all action triggers (not div/span)
- [ ] Proper heading hierarchy (h2 for panel title, h3 for sections)
- [ ] Lists use ul/li or role="list"/"listitem"
- [ ] nav used for navigation links
- [ ] fieldset/legend for related form controls
- [ ] section used with aria-labelledby for distinct areas

---

### Task 8: Implement Alert Dialog for ManualEditWarningDialog

**Story Points**: 1
**Priority**: High
**File**: `/src/components/TranslationManagement/ManualEditWarning/ManualEditWarningDialog.tsx`

#### Objective
Use the alertdialog role for the warning dialog that appears when source content is updated with existing manual translations, ensuring immediate announcement and proper focus management.

#### Implementation Steps

##### Step 8.1: Set Up Component with Focus Management
```typescript
import { useRef, useEffect } from 'react';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { useFocusTrap } from '@/components/ItemManager/utils/a11yUtils';

interface ManualEditWarningDialogProps {
  isOpen: boolean;
  affectedLanguages: string[];
  onKeep: () => void;
  onOverwrite: () => void;
}
```

##### Step 8.2: Focus Primary Action on Open
```typescript
const ManualEditWarningDialog: React.FC<ManualEditWarningDialogProps> = ({
  isOpen,
  affectedLanguages,
  onKeep,
  onOverwrite
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const keepButtonRef = useRef<HTMLButtonElement>(null);

  useFocusTrap(dialogRef, isOpen);

  // Focus primary action (Keep) on open
  useEffect(() => {
    if (isOpen && keepButtonRef.current) {
      setTimeout(() => keepButtonRef.current?.focus(), 0);
    }
  }, [isOpen]);
```

##### Step 8.3: Render Alert Dialog
```tsx
return (
  <AlertDialog.Root open={isOpen}>
    <AlertDialog.Portal>
      <AlertDialog.Overlay className="fixed inset-0 bg-black/50" />
      <AlertDialog.Content
        ref={dialogRef}
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl w-full max-w-md p-6"
      >
        <AlertDialog.Title className="text-lg font-semibold text-gray-900">
          Manual Edits Detected
        </AlertDialog.Title>
        <AlertDialog.Description className="mt-2 text-gray-600">
          You have manually edited translations for {formatLanguageList(affectedLanguages)}.
          Re-translating will overwrite these edits.
        </AlertDialog.Description>

        <div className="mt-6 flex gap-3 justify-end">
          <AlertDialog.Action asChild>
            <button
              ref={keepButtonRef}
              onClick={onKeep}
              className={cn(
                "px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700",
                FOCUS_CLASSES
              )}
            >
              Keep Manual Edits
            </button>
          </AlertDialog.Action>
          <AlertDialog.Cancel asChild>
            <button
              onClick={onOverwrite}
              className={cn(
                "px-4 py-2 text-red-600 border border-red-300 rounded hover:bg-red-50",
                FOCUS_CLASSES
              )}
            >
              Overwrite with New Translation
            </button>
          </AlertDialog.Cancel>
        </div>
      </AlertDialog.Content>
    </AlertDialog.Portal>
  </AlertDialog.Root>
);
```

#### Verification Checklist
- [ ] Dialog uses role="alertdialog" (via Radix AlertDialog)
- [ ] Warning message announced immediately on open
- [ ] Focus moves to primary action (Keep Manual Edits) on open
- [ ] Tab navigation trapped within dialog
- [ ] Both action buttons clearly labeled
- [ ] Focus returns to trigger on close

---

### Task 9: Add Language Attributes to Translated Content

**Story Points**: 1
**Priority**: Medium
**Files**:
- `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx`
- `/src/components/TranslationManagement/TranslationEditor/TranslationEditor.tsx`

#### Objective
Add the `lang` attribute to all displayed translated text so screen readers can properly pronounce content in the correct language.

#### Implementation Steps

##### Step 9.1: Add lang to TranslationStatusItem Preview
```tsx
// In TranslationStatusItem.tsx
<p
  lang={locale.code}
  className="text-sm text-gray-600 truncate mt-1"
>
  {translation.content?.title || 'No translation yet'}
</p>
```

##### Step 9.2: Add lang to TranslationEditor Inputs
```tsx
// In TranslationEditor.tsx

// Source content (read-only)
<p lang={sourceLanguage} className="bg-gray-50 p-3 rounded">
  {sourceContent.title}
</p>

// Translation textarea
<textarea
  id={titleInputId}
  ref={titleInputRef}
  lang={translation.language}
  value={editedTitle}
  onChange={(e) => setEditedTitle(e.target.value)}
  className="..."
/>
```

##### Step 9.3: Add lang to TranslationDiffView
```tsx
// In TranslationDiffView.tsx
<div className="grid grid-cols-2 gap-4">
  <div>
    <h4 className="text-sm font-medium mb-2">Original</h4>
    <p lang={sourceLanguage} className="...">{original}</p>
  </div>
  <div>
    <h4 className="text-sm font-medium mb-2">Translation</h4>
    <p lang={targetLanguage} className="...">{translated}</p>
  </div>
</div>
```

#### Language Code Reference
| Language | ISO Code |
|----------|----------|
| English | en |
| French | fr |
| German | de |
| Spanish | es |
| Dutch | nl |
| Italian | it |

#### Verification Checklist
- [ ] All displayed translated text has lang attribute
- [ ] Translation editor textareas have lang attribute
- [ ] Source content displays with source language attribute
- [ ] Screen reader changes pronunciation based on lang attribute

---

### Task 10: Create Accessibility Testing Documentation and Tests

**Story Points**: 2
**Priority**: High
**Output**: Test documentation and automated tests

#### Objective
Document testing procedures for keyboard navigation, screen reader compatibility, and create automated accessibility tests using axe-core.

#### Implementation Steps

##### Step 10.1: Create Keyboard Navigation Test Checklist
Create file `/docs/testing/accessibility-test-checklist.md`:

```markdown
# Accessibility Testing Checklist for Translation Components

## Test Environment Setup
- Enable VoiceOver (macOS): Cmd+F5
- Enable NVDA (Windows): Ctrl+Alt+N
- Browser: Chrome or Safari recommended

## TranslationPreviewPanel Tests

### Keyboard Navigation
- [ ] Tab moves focus into panel when opened
- [ ] Tab cycles through all interactive elements in logical order
- [ ] Shift+Tab navigates backwards
- [ ] Arrow Down moves to next language item
- [ ] Arrow Up moves to previous language item
- [ ] Home key focuses first language
- [ ] End key focuses last language
- [ ] Enter/Space on status item opens editor
- [ ] Escape closes panel
- [ ] Focus returns to trigger button on close

### Screen Reader (VoiceOver)
- [ ] Panel title "Translations" announced on open
- [ ] Each language status announced (e.g., "French: Translation complete")
- [ ] Stale indicator announced for outdated translations
- [ ] Progress bar value announced
- [ ] Button purposes announced (Edit, Re-translate, Retry)

## TranslationEditor Tests

### Keyboard Navigation
- [ ] Focus moves to first textarea on open
- [ ] Tab cycles within modal only (focus trapped)
- [ ] Escape closes modal without saving
- [ ] Cmd/Ctrl+Enter saves and closes
- [ ] Focus returns to Edit button on close

### Screen Reader
- [ ] Dialog title announced on open
- [ ] Form labels announced for each input
- [ ] Character count announced (via aria-describedby)
- [ ] Save/Cancel buttons announced

## ManualEditWarningDialog Tests

### Keyboard Navigation
- [ ] Focus moves to "Keep Manual Edits" button on open
- [ ] Tab cycles between both action buttons
- [ ] Enter activates focused button
- [ ] Focus returns appropriately on close

### Screen Reader
- [ ] Alert announced immediately
- [ ] Warning message read automatically
- [ ] Affected languages listed
- [ ] Both action options clearly announced

## Common Accessibility Checks

### Focus Indicators
- [ ] All buttons show visible focus ring
- [ ] Focus ring has sufficient contrast (3:1 minimum)
- [ ] No focus trap issues (can always navigate away)
- [ ] Touch targets minimum 44x44px

### Color Contrast
- [ ] Status colors readable against backgrounds
- [ ] Text meets 4.5:1 contrast for normal text
- [ ] Large text meets 3:1 contrast

### Semantic Structure
- [ ] Headings in logical hierarchy (h2, h3)
- [ ] Lists marked up correctly
- [ ] Buttons used for actions (not divs)
```

##### Step 10.2: Create VoiceOver Test Script
```markdown
## VoiceOver Test Procedure (macOS)

### Setup
1. Enable VoiceOver: Cmd+F5
2. Navigate to dashboard with content that has translations
3. Use VO+Arrow keys to navigate

### Test 1: Open Translation Preview
1. Navigate to a Save button and activate
2. Expected: "Translations, dialog" announced
3. Navigate with VO+Right
4. Expected: Each section announced with headings

### Test 2: Navigate Language List
1. Use Arrow Down to move through languages
2. Expected: Language name and status announced for each
3. Test Home/End keys
4. Expected: First/last language focused

### Test 3: Edit Translation
1. Press Enter on a completed translation
2. Expected: "Edit [Language] Translation, dialog" announced
3. Navigate form controls
4. Expected: Labels announced for each field
5. Press Escape
6. Expected: Focus returns to Edit button

### Test 4: Status Change Announcement
1. Trigger a re-translation
2. Wait for completion
3. Expected: "[Language] translation completed" announced automatically
```

##### Step 10.3: Add Automated axe-core Tests
Create test file `/src/components/TranslationManagement/__tests__/accessibility.test.tsx`:

```typescript
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { TranslationPreviewPanel } from '../TranslationPreviewPanel';
import { TranslationEditor } from '../TranslationEditor';
import { ManualEditWarningDialog } from '../ManualEditWarning';

expect.extend(toHaveNoViolations);

describe('Translation Components Accessibility', () => {
  describe('TranslationPreviewPanel', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <TranslationPreviewPanel
          isOpen={true}
          onClose={() => {}}
          entityType="article"
          entityId="123"
          sourceLanguage="en"
          sourceContent={{ title: 'Test Article' }}
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have correct dialog role', () => {
      const { getByRole } = render(
        <TranslationPreviewPanel isOpen={true} {...mockProps} />
      );

      expect(getByRole('dialog')).toBeInTheDocument();
      expect(getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    });

    it('should have accessible status icons', () => {
      const { getAllByRole } = render(
        <TranslationPreviewPanel isOpen={true} {...mockProps} />
      );

      const statusIcons = getAllByRole('img');
      statusIcons.forEach(icon => {
        expect(icon).toHaveAttribute('aria-label');
        expect(icon.getAttribute('aria-label')).not.toBe('');
      });
    });
  });

  describe('TranslationEditor', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <TranslationEditor
          isOpen={true}
          translation={{ language: 'fr', content: { title: 'Test' }, status: 'completed' }}
          sourceContent={{ title: 'Test' }}
          sourceLanguage="en"
          onSave={async () => {}}
          onCancel={() => {}}
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have properly labeled form controls', () => {
      const { getByLabelText } = render(
        <TranslationEditor isOpen={true} {...mockProps} />
      );

      expect(getByLabelText(/Translation/i)).toBeInTheDocument();
    });
  });

  describe('ManualEditWarningDialog', () => {
    it('should have alertdialog role', () => {
      const { getByRole } = render(
        <ManualEditWarningDialog
          isOpen={true}
          affectedLanguages={['French', 'German']}
          onKeep={() => {}}
          onOverwrite={() => {}}
        />
      );

      expect(getByRole('alertdialog')).toBeInTheDocument();
    });
  });
});
```

#### Verification Checklist
- [ ] Keyboard navigation checklist created and documented
- [ ] VoiceOver test script created
- [ ] NVDA test procedure documented
- [ ] Automated axe-core tests pass
- [ ] All tests documented in testing folder
- [ ] Test coverage includes all translation components

---

## Acceptance Criteria Mapping

| Acceptance Criteria | Task(s) |
|---------------------|---------|
| All status icons have descriptive ARIA labels | Task 1 |
| Preview panel expand/collapse keyboard accessible | Task 2 |
| Preview panel implements focus trap | Task 2 |
| Preview panel returns focus on close | Task 2 |
| Translation editor modals trap focus | Task 4 |
| Translation editor returns focus on dismiss | Task 4 |
| Language switcher fully keyboard navigable | Task 2 |
| Status changes trigger live region announcements | Task 3 |
| Live announcements include language and status | Task 3 |
| Visible focus indicators with 3:1 contrast | Task 6 |
| Consistent focus indicators | Task 6 |
| Semantic HTML elements used | Task 7 |
| Proper heading hierarchy | Task 7 |
| Form controls have associated labels | Task 4, Task 7 |
| Error messages via aria-describedby | Task 4 |
| Batch action controls keyboard accessible | Task 6 |
| Translation content has lang attribute | Task 9 |
| WCAG 2.1 Level AA compliance | All Tasks |
| Tested with screen readers | Task 10 |
| Keyboard navigation tested | Task 10 |

---

## Files Modified Summary

| File | Tasks | Changes |
|------|-------|---------|
| `TranslationPreviewPanel.tsx` | 2, 3 | Focus trap, keyboard nav, ARIA attributes, announcements |
| `TranslationStatusItem.tsx` | 1, 9 | ARIA labels, lang attribute, button accessibility |
| `TranslationProgressBar.tsx` | 5 | Progressbar role, ARIA values |
| `TranslationEditor.tsx` | 4, 9 | Focus management, keyboard shortcuts, form labels |
| `TranslationEditor/TranslationDiffView.tsx` | 9 | lang attributes |
| `TranslationStatusWidget.tsx` | 3 | Status announcements |
| `TranslationStatusColumn.tsx` | 1, 6 | ARIA labels, focus indicators |
| `TranslationStatusFilter.tsx` | 6, 7 | Focus indicators, semantic HTML |
| `BulkTranslationBar.tsx` | 6, 7 | Focus indicators, toolbar role |
| `LanguageSelectorDialog.tsx` | 6, 7 | Focus indicators, fieldset/legend |
| `ManualEditWarningDialog.tsx` | 8 | Alert dialog pattern, focus management |
| `LanguagePreferenceSection.tsx` | 6, 7 | Focus indicators, form labels |
| `TranslationManagement.constants.ts` | 1, 6 | Shared ARIA and focus constants |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Radix Dialog conflicts with custom focus trap | Use Radix's built-in focus management when available; only add custom if needed |
| Live region timing issues | Debounce rapid status changes; test with actual screen readers |
| Inconsistent browser focus behavior | Test in Safari, Chrome, Firefox; use standardized CSS |
| Touch target conflicts with design | Coordinate with design; prioritize accessibility |

---

## Estimated Total Effort

| Task | Story Points |
|------|--------------|
| Task 1: ARIA Labels for Status Icons | 1 |
| Task 2: Keyboard Navigation | 2 |
| Task 3: Screen Reader Announcements | 2 |
| Task 4: Focus Management in Editor | 2 |
| Task 5: Progress Bar ARIA | 1 |
| Task 6: Focus Indicators | 1 |
| Task 7: Semantic HTML | 1 |
| Task 8: Alert Dialog Pattern | 1 |
| Task 9: Language Attributes | 1 |
| Task 10: Testing Documentation | 2 |
| **Total** | **14 story points** |

---

*Document generated for FAQBNB Localization Epic 5 - Owner Translation Management*
*Task 7.4: Add Accessibility Features*
*Created: 2026-01-19*
