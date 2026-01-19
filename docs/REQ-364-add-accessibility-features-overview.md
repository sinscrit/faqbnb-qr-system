# Implementation Breakdown: Add Accessibility Features to Translation Components

**Request Reference**: REQ-364 from Epic 5 (L10N Owner Translation Management)
**Related PRD**: `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
**Document Type**: Technical Implementation Breakdown
**Created**: 2026-01-19
**Last Modified**: 2026-01-19

---

## Summary

Enhance all translation management components with comprehensive accessibility features to meet WCAG 2.1 Level AA standards. This includes adding proper ARIA labels for status icons, implementing keyboard navigation for the translation preview panel, creating screen reader announcements for translation status changes, and ensuring proper focus management in modal dialogs. The implementation will leverage existing accessibility utilities from `src/components/ItemManager/utils/a11yUtils.tsx` to maintain consistency across the codebase.

---

## Task Context

| Attribute | Value |
|-----------|-------|
| **Phase** | 7 - Integration & Polish |
| **Task ID** | 7.4 |
| **Title** | Add Accessibility Features |
| **Epic** | L10N Epic 5 - Owner Translation Management |
| **Dependencies** | Tasks 2.1-2.7 (Core UI Components), Task 7.1-7.3 (Integration) |
| **Complexity** | Medium (M) |

### Task Requirements (from Implementation Plan)

- ARIA labels for status icons
- Keyboard navigation in preview panel
- Screen reader announcements for status changes
- Focus management in modals

---

## Accessibility Standards Reference

### WCAG 2.1 AA Key Requirements

| Guideline | Description | Relevance to Translation Components |
|-----------|-------------|--------------------------------------|
| 1.3.1 Info and Relationships | Programmatic structure matches visual | Status icons, preview panel structure |
| 1.4.3 Contrast Minimum | 4.5:1 for normal text, 3:1 for large | Status colors, focus indicators |
| 2.1.1 Keyboard | All functionality via keyboard | Panel navigation, editor controls |
| 2.1.2 No Keyboard Trap | Users can navigate away | Modals, slide-out panels |
| 2.4.3 Focus Order | Logical, meaningful focus sequence | Tab order through translation items |
| 2.4.7 Focus Visible | Visible keyboard focus indicator | All focusable elements (min 3:1) |
| 4.1.2 Name, Role, Value | ARIA for custom controls | Status icons, action buttons |

### Existing Codebase Accessibility Patterns

Based on analysis of existing accessibility implementations:

| Pattern | Source | Usage for Translation Components |
|---------|--------|----------------------------------|
| `useFocusTrap` hook | `ItemManager/utils/a11yUtils.tsx:83-153` | Focus trap in TranslationEditor modal |
| `useFocusRestore` hook | `ItemManager/utils/a11yUtils.tsx:174-187` | Restore focus on panel close |
| `useAnnounce` hook | `ItemManager/utils/a11yUtils.tsx:218-271` | Status change announcements |
| `createKeyboardNavigator` | `ItemManager/utils/a11yUtils.tsx:309-379` | Arrow key navigation in status list |
| `useRovingTabIndex` | `ItemManager/utils/a11yUtils.tsx:415-444` | Single-tab-stop navigation pattern |
| Radix Dialog pattern | `ItemPreviewModal.tsx` | Dialog ARIA attributes |
| `aria-live="polite"` | `ItemPreviewModal.tsx:419-421` | Dynamic announcements |
| `role="listbox"` | `LanguageSwitcher.tsx:369` | Language selection dropdown |

---

## Component Audit Scope

### Components Requiring Accessibility Updates

| Component | File Path | Priority | Key A11y Concerns |
|-----------|-----------|----------|-------------------|
| TranslationPreviewPanel | `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx` | Critical | Focus trap, keyboard nav, panel role |
| TranslationStatusItem | `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx` | High | Status icon ARIA, action buttons |
| TranslationProgressBar | `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationProgressBar.tsx` | Medium | Progressbar role, live region |
| TranslationEditor | `/src/components/TranslationManagement/TranslationEditor/TranslationEditor.tsx` | Critical | Dialog role, focus trap, form labels |
| TranslationStatusWidget | `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.tsx` | Medium | Widget role, link navigation |
| TranslationStatusColumn | `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.tsx` | High | Icon labels, interactive tooltip |
| TranslationStatusFilter | `/src/components/TranslationManagement/TranslationStatusFilter/TranslationStatusFilter.tsx` | Medium | Combobox pattern, checkbox aria |
| BulkTranslationBar | `/src/components/TranslationManagement/BulkTranslationBar/BulkTranslationBar.tsx` | Medium | Toolbar role, selection count |
| LanguageSelectorDialog | `/src/components/TranslationManagement/BulkTranslationBar/LanguageSelectorDialog.tsx` | High | Dialog role, checkbox group |
| ManualEditWarningDialog | `/src/components/TranslationManagement/ManualEditWarning/ManualEditWarningDialog.tsx` | Critical | Alert dialog, focus management |
| LanguagePreferenceSection | `/src/components/TranslationManagement/LanguagePreference/LanguagePreferenceSection.tsx` | Medium | Form labels, save confirmation |

---

## Technical Approach

### 1. Status Icon ARIA Labels

Define descriptive ARIA labels for each translation status:

```typescript
// Status icon ARIA label mapping
const STATUS_ARIA_LABELS: Record<TranslationStatus, string> = {
  pending: 'Translation pending',
  processing: 'Translation in progress',
  completed: 'Translation complete',
  failed: 'Translation failed',
  manual: 'Manually edited translation'
};

// Stale indicator
const STALE_ARIA_LABEL = 'Translation may be outdated';

// Usage in TranslationStatusItem
<span
  role="img"
  aria-label={`${languageName}: ${STATUS_ARIA_LABELS[status]}${isStale ? ', ' + STALE_ARIA_LABEL : ''}`}
  className={statusIconClasses}
>
  {statusIcon}
</span>
```

### 2. Keyboard Navigation Matrix

Expected keyboard behavior for translation components:

| Element | Tab | Enter/Space | Arrow Keys | Escape | Home/End |
|---------|-----|-------------|------------|--------|----------|
| Preview panel close | Focus | Close panel | N/A | Close panel | N/A |
| Language status item | Focus | Open editor | Up/Down navigate | N/A | First/Last |
| Edit button | Focus | Open editor | N/A | N/A | N/A |
| Re-translate button | Focus | Trigger action | N/A | N/A | N/A |
| Translation editor | Focus first field | Submit form | Tab fields | Cancel/close | N/A |
| Language selector | Focus | Toggle check | Up/Down | Close | First/Last |
| Progress bar | Skip (non-interactive) | N/A | N/A | N/A | N/A |

### 3. Focus Management Requirements

#### Panel Focus Handling

```typescript
// Pattern for slide-out panel focus management
const TranslationPreviewPanel = ({ isOpen, onClose, triggerRef }) => {
  const panelRef = useRef<HTMLDivElement>(null);

  // Focus trap within panel when open
  useFocusTrap(panelRef, isOpen);

  // Restore focus to trigger element on close
  useFocusRestore(isOpen);

  // Handle Escape key
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

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="translation-panel-title"
      aria-describedby="translation-panel-description"
    >
      {/* Panel content */}
    </div>
  );
};
```

#### Modal Dialog Focus Pattern

```typescript
// TranslationEditor focus management
const TranslationEditor = ({ isOpen, onSave, onCancel }) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLTextAreaElement>(null);

  useFocusTrap(dialogRef, isOpen);

  // Focus first input on open
  useEffect(() => {
    if (isOpen && firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, [isOpen]);

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="editor-title"
    >
      <textarea ref={firstInputRef} aria-label="Translation text" />
    </div>
  );
};
```

### 4. Screen Reader Announcements

#### Live Region for Status Updates

```typescript
// TranslationPreviewPanel with announcements
const { announce, AnnouncerRegion } = useAnnounce();

// Announce when translations complete
useEffect(() => {
  if (previousStatus !== 'completed' && currentStatus === 'completed') {
    announce(`${languageName} translation completed`);
  }
  if (previousStatus !== 'failed' && currentStatus === 'failed') {
    announce(`${languageName} translation failed`, 'assertive');
  }
}, [currentStatus, languageName]);

return (
  <div role="dialog">
    <AnnouncerRegion />
    {/* Panel content */}
  </div>
);
```

#### Progress Announcements

```typescript
// TranslationProgressBar with aria-live
<div
  role="progressbar"
  aria-valuenow={completedCount}
  aria-valuemin={0}
  aria-valuemax={totalCount}
  aria-label={`Translation progress: ${completedCount} of ${totalCount} languages complete`}
>
  <span className="sr-only">
    {completedCount} of {totalCount} translations complete
  </span>
  {/* Visual progress bar */}
</div>
```

---

## Implementation Tasks

### Task 1: Add ARIA Labels to TranslationStatusItem

**File**: `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx`

**Actions**:
1. Create status-to-ARIA-label mapping constant
2. Add `role="img"` with descriptive `aria-label` to status icons
3. Add `aria-label` to Edit, Re-translate, and Retry buttons
4. Add `aria-hidden="true"` to decorative flag icons
5. Ensure action buttons have minimum 44x44px touch targets
6. Add `lang` attribute to translation preview text

**Code Pattern**:
```tsx
// Status icon with ARIA
<span
  role="img"
  aria-label={`${locale.name}: ${STATUS_ARIA_LABELS[status]}${isStale ? ', translation may be outdated' : ''}`}
  className={cn(
    'flex-shrink-0',
    STATUS_COLORS[status]
  )}
>
  {STATUS_ICONS[status]}
</span>

// Action buttons
<button
  onClick={onEdit}
  aria-label={`Edit ${locale.name} translation`}
  className="min-h-[44px] min-w-[44px] focus:outline-none focus:ring-2 focus:ring-blue-500"
>
  <Edit2 aria-hidden="true" className="w-4 h-4" />
</button>

// Translation preview with language
<p lang={locale.code} className="text-sm text-gray-600 truncate">
  {previewText}
</p>
```

**Verification**:
- Screen reader announces status for each language
- All action buttons have accessible names
- Focus indicators visible (min 3:1 contrast)

---

### Task 2: Implement Keyboard Navigation in TranslationPreviewPanel

**File**: `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx`

**Actions**:
1. Import `useFocusTrap`, `useFocusRestore`, `useRovingTabIndex` from a11yUtils
2. Add focus trap for slide-out panel
3. Implement roving tabindex for language status list
4. Add Escape key handler to close panel
5. Add `role="dialog"` with `aria-modal="true"`
6. Add `aria-labelledby` and `aria-describedby` attributes
7. Implement Home/End key navigation to first/last language

**Code Pattern**:
```tsx
const TranslationPreviewPanel = ({ isOpen, onClose, entityType, entityId, ...props }) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const statusListRef = useRef<HTMLDivElement>(null);

  // Focus management
  useFocusTrap(panelRef, isOpen);
  useFocusRestore(isOpen);

  // Roving tabindex for status items
  const { currentIndex, setIndex, handleKeyDown } = useRovingTabIndex(
    SUPPORTED_LOCALES.length
  );

  // Escape to close
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

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="translation-panel-title"
      aria-describedby="translation-panel-desc"
      className="fixed right-0 top-0 h-full w-[400px] bg-white shadow-xl"
    >
      <h2 id="translation-panel-title">Translations</h2>
      <p id="translation-panel-desc" className="sr-only">
        View and manage translations for this {entityType}
      </p>

      <div
        ref={statusListRef}
        role="list"
        aria-label="Translation status by language"
        onKeyDown={handleKeyDown}
      >
        {languages.map((lang, idx) => (
          <TranslationStatusItem
            key={lang.code}
            tabIndex={idx === currentIndex ? 0 : -1}
            onFocus={() => setIndex(idx)}
            role="listitem"
            // ... other props
          />
        ))}
      </div>
    </div>
  );
};
```

**Verification**:
- Tab cycles only within panel when open
- Arrow keys navigate between language items
- Escape closes panel and returns focus to trigger
- Panel title announced on open

---

### Task 3: Implement Screen Reader Announcements for Status Changes

**Files**:
- `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx`
- `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.tsx`

**Actions**:
1. Import and use `useAnnounce` hook
2. Track previous status values with `usePrevious` pattern
3. Announce translation completions and failures
4. Announce bulk operation progress and completion
5. Use 'polite' for completions, 'assertive' for failures
6. Include language name in announcement text

**Code Pattern**:
```tsx
const TranslationPreviewPanel = ({ translations, ...props }) => {
  const { announce, AnnouncerRegion } = useAnnounce();
  const prevTranslations = usePrevious(translations);

  // Announce status changes
  useEffect(() => {
    if (!prevTranslations) return;

    Object.entries(translations).forEach(([lang, current]) => {
      const prev = prevTranslations[lang];
      if (!prev) return;

      if (prev.status !== 'completed' && current.status === 'completed') {
        const langName = getLocaleByCode(lang)?.name || lang;
        announce(`${langName} translation completed`);
      }

      if (prev.status !== 'failed' && current.status === 'failed') {
        const langName = getLocaleByCode(lang)?.name || lang;
        announce(`${langName} translation failed. Retry available.`, 'assertive');
      }
    });
  }, [translations, prevTranslations, announce]);

  // Announce overall progress
  const completedCount = Object.values(translations).filter(t => t.status === 'completed').length;
  const prevCompletedCount = usePrevious(completedCount);

  useEffect(() => {
    if (prevCompletedCount !== undefined && completedCount > prevCompletedCount) {
      const total = Object.keys(translations).length;
      if (completedCount === total) {
        announce('All translations complete');
      }
    }
  }, [completedCount, prevCompletedCount, translations, announce]);

  return (
    <>
      <AnnouncerRegion />
      {/* Panel content */}
    </>
  );
};

// Helper hook
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}
```

**Verification**:
- Status changes announced via screen reader
- Announcements include language name and status
- Assertive announcements for failures
- All translations complete announced

---

### Task 4: Implement Focus Management in TranslationEditor Modal

**File**: `/src/components/TranslationManagement/TranslationEditor/TranslationEditor.tsx`

**Actions**:
1. Use `useFocusTrap` hook for modal
2. Focus first textarea on modal open
3. Return focus to Edit button on close
4. Add `role="dialog"` with `aria-modal="true"`
5. Add proper `aria-labelledby` and `aria-describedby`
6. Associate form labels with inputs via `htmlFor`/`id`
7. Add `aria-describedby` for character count and hints
8. Handle Enter in textarea (allow, don't submit)
9. Add keyboard shortcut for save (Cmd/Ctrl+Enter)

**Code Pattern**:
```tsx
const TranslationEditor = ({
  translation,
  sourceContent,
  isOpen,
  onSave,
  onCancel
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLTextAreaElement>(null);
  const uniqueId = useId();

  useFocusTrap(dialogRef, isOpen);

  // Focus first input on open
  useEffect(() => {
    if (isOpen && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isOpen]);

  // Keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Cmd/Ctrl+Enter to save
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
    // Escape to cancel
    if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  const titleInputId = `translation-title-${uniqueId}`;
  const titleHintId = `translation-title-hint-${uniqueId}`;
  const descInputId = `translation-desc-${uniqueId}`;
  const descHintId = `translation-desc-hint-${uniqueId}`;

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content
          ref={dialogRef}
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ..."
          onKeyDown={handleKeyDown}
        >
          <Dialog.Title id="editor-title">
            Edit {translation.language} Translation
          </Dialog.Title>
          <Dialog.Description id="editor-desc" className="sr-only">
            Compare original content and edit the translated version
          </Dialog.Description>

          {/* Side-by-side comparison */}
          <div className="grid grid-cols-2 gap-4">
            {/* Original (read-only) */}
            <div>
              <label className="block text-sm font-medium">Original</label>
              <p lang="en" className="bg-gray-50 p-3 rounded">{sourceContent.title}</p>
            </div>

            {/* Translation (editable) */}
            <div>
              <label htmlFor={titleInputId} className="block text-sm font-medium">
                Translation
              </label>
              <textarea
                id={titleInputId}
                ref={titleInputRef}
                lang={translation.language}
                aria-describedby={titleHintId}
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500"
              />
              <p id={titleHintId} className="text-xs text-gray-500 mt-1">
                {editedTitle.length} characters. Press Cmd+Enter to save.
              </p>
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={onCancel}
              className="px-4 py-2 ... focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white ... focus:ring-2 focus:ring-blue-500"
            >
              Save Translation
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
```

**Verification**:
- Focus moves to first input on open
- Tab cycles within modal only
- Escape closes modal
- Focus returns to Edit button on close
- Cmd/Ctrl+Enter saves and closes

---

### Task 5: Add ARIA to TranslationProgressBar

**File**: `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationProgressBar.tsx`

**Actions**:
1. Add `role="progressbar"` with aria-valuenow/min/max
2. Add descriptive `aria-label` with counts
3. Add screen-reader-only text for exact values
4. Use `aria-busy` during active translations

**Code Pattern**:
```tsx
const TranslationProgressBar = ({ completed, total, isProcessing }) => {
  const percentage = Math.round((completed / total) * 100);

  return (
    <div
      role="progressbar"
      aria-valuenow={completed}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-label={`Translation progress`}
      aria-busy={isProcessing}
      className="relative h-2 bg-gray-200 rounded-full overflow-hidden"
    >
      <div
        className="absolute h-full bg-green-500 transition-all duration-300"
        style={{ width: `${percentage}%` }}
      />
      <span className="sr-only">
        {completed} of {total} translations complete ({percentage}%)
        {isProcessing && '. Translation in progress.'}
      </span>
    </div>
  );
};
```

---

### Task 6: Add Focus Indicators Across All Components

**Files**: All translation management components

**Actions**:
1. Audit all interactive elements for visible focus indicators
2. Add consistent `focus:ring-2 focus:ring-blue-500 focus:ring-offset-2` classes
3. Ensure contrast ratio of at least 3:1 for focus indicators
4. Add `focus-visible` variant where appropriate to avoid focus-ring on mouse clicks
5. Ensure minimum 44x44px touch targets

**CSS Pattern**:
```tsx
// Standard button focus
const buttonFocusClasses = cn(
  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
  'focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2'
);

// Icon-only button with minimum touch target
const iconButtonClasses = cn(
  'min-h-[44px] min-w-[44px]',
  'flex items-center justify-center',
  'rounded-full hover:bg-gray-100',
  buttonFocusClasses
);
```

---

### Task 7: Add Semantic HTML Structure

**Files**: All translation management components

**Actions**:
1. Use `<button>` for all action triggers (not div/span with onClick)
2. Use `<nav>` for translation management navigation links
3. Use proper heading hierarchy (h2 for panel title, h3 for sections)
4. Use `<section>` with `aria-labelledby` for distinct content areas
5. Use `<fieldset>` and `<legend>` for related form controls
6. Use `<ul>/<li>` or `role="list"/"listitem"` for language lists

**Code Pattern**:
```tsx
// TranslationPreviewPanel structure
<aside
  role="dialog"
  aria-modal="true"
  aria-labelledby="panel-title"
>
  <header>
    <h2 id="panel-title">Translations</h2>
    <button aria-label="Close panel">
      <X aria-hidden="true" />
    </button>
  </header>

  <section aria-labelledby="source-heading">
    <h3 id="source-heading">Source Content</h3>
    {/* Source content display */}
  </section>

  <section aria-labelledby="translations-heading">
    <h3 id="translations-heading">Translations</h3>
    <ul role="list" aria-label="Translation status by language">
      {languages.map(lang => (
        <li key={lang.code} role="listitem">
          <TranslationStatusItem ... />
        </li>
      ))}
    </ul>
  </section>

  <footer>
    <button>Re-translate All</button>
    <button>Close</button>
  </footer>
</aside>
```

---

### Task 8: Implement Alert Dialog for ManualEditWarningDialog

**File**: `/src/components/TranslationManagement/ManualEditWarning/ManualEditWarningDialog.tsx`

**Actions**:
1. Use `role="alertdialog"` instead of `role="dialog"`
2. Add `aria-describedby` pointing to warning message
3. Focus the primary action (Keep manual edits) on open
4. Ensure warning is announced immediately
5. Add clear labels for both options

**Code Pattern**:
```tsx
const ManualEditWarningDialog = ({ isOpen, onKeep, onOverwrite, affectedLanguages }) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const keepButtonRef = useRef<HTMLButtonElement>(null);

  useFocusTrap(dialogRef, isOpen);

  // Focus primary action on open
  useEffect(() => {
    if (isOpen && keepButtonRef.current) {
      keepButtonRef.current.focus();
    }
  }, [isOpen]);

  return (
    <div
      ref={dialogRef}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="warning-title"
      aria-describedby="warning-desc"
    >
      <h2 id="warning-title">Manual Edits Detected</h2>
      <p id="warning-desc">
        You have manually edited translations for {affectedLanguages.join(', ')}.
        Re-translating will overwrite these edits.
      </p>

      <div className="flex gap-3">
        <button
          ref={keepButtonRef}
          onClick={onKeep}
          className="... focus:ring-2 focus:ring-blue-500"
        >
          Keep Manual Edits
        </button>
        <button
          onClick={onOverwrite}
          className="... focus:ring-2 focus:ring-red-500"
        >
          Overwrite with New Translation
        </button>
      </div>
    </div>
  );
};
```

---

### Task 9: Add Language Attribute to Translated Content

**Files**:
- `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx`
- `/src/components/TranslationManagement/TranslationEditor/TranslationEditor.tsx`

**Actions**:
1. Add `lang` attribute to all displayed translated text
2. Add `lang` attribute to translation editor textarea
3. Use proper ISO 639-1 language codes (en, fr, de, es, nl, it)

**Code Pattern**:
```tsx
// TranslationStatusItem preview text
<p
  lang={locale.code}
  className="text-sm text-gray-600 truncate"
>
  {translation.content?.title}
</p>

// TranslationEditor textarea
<textarea
  lang={translation.language}
  dir={getTextDirection(translation.language)} // For future RTL support
  {...otherProps}
/>
```

---

### Task 10: Create Accessibility Testing Checklist

**Actions**:
1. Document keyboard navigation test procedures
2. Create screen reader test scripts for VoiceOver/NVDA
3. Add automated axe-core tests for translation components
4. Document focus management verification steps

**Testing Checklist**:

```markdown
## Keyboard Navigation Tests

### TranslationPreviewPanel
- [ ] Tab moves focus into panel when opened
- [ ] Tab cycles through all interactive elements in logical order
- [ ] Shift+Tab navigates backwards
- [ ] Escape closes panel
- [ ] Focus returns to trigger button on close
- [ ] Arrow keys navigate between language status items
- [ ] Enter/Space on status item opens editor
- [ ] Home key focuses first language
- [ ] End key focuses last language

### TranslationEditor
- [ ] Focus moves to first input on open
- [ ] Tab cycles within modal only
- [ ] Escape closes modal without saving
- [ ] Cmd/Ctrl+Enter saves and closes
- [ ] Focus returns to Edit button on close

### Screen Reader Tests (VoiceOver)
- [ ] Panel title announced on open
- [ ] Each language status announced with status name
- [ ] Status changes announced via live region
- [ ] Progress bar percentage announced
- [ ] Button purposes announced
- [ ] Editor labels announced
- [ ] Warnings announced as alerts
```

---

## Authorized Files and Functions for Modification

### Files to Create

| File Path | Purpose |
|-----------|---------|
| None | All accessibility features added to existing files |

### Files to Modify

| File Path | Changes |
|-----------|---------|
| `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx` | Add focus trap, keyboard nav, panel ARIA, announcements |
| `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx` | Add status icon ARIA, button labels, lang attribute |
| `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationProgressBar.tsx` | Add progressbar role, aria-valuenow |
| `/src/components/TranslationManagement/TranslationEditor/TranslationEditor.tsx` | Add dialog ARIA, focus trap, form labels, keyboard shortcuts |
| `/src/components/TranslationManagement/TranslationEditor/TranslationDiffView.tsx` | Add lang attributes, region roles |
| `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.tsx` | Add widget role, announcements |
| `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.tsx` | Add icon ARIA labels, tooltip accessibility |
| `/src/components/TranslationManagement/TranslationStatusFilter/TranslationStatusFilter.tsx` | Add combobox ARIA, checkbox labels |
| `/src/components/TranslationManagement/BulkTranslationBar/BulkTranslationBar.tsx` | Add toolbar role, selection count |
| `/src/components/TranslationManagement/BulkTranslationBar/LanguageSelectorDialog.tsx` | Add dialog ARIA, checkbox group |
| `/src/components/TranslationManagement/ManualEditWarning/ManualEditWarningDialog.tsx` | Add alertdialog role, focus management |
| `/src/components/TranslationManagement/LanguagePreference/LanguagePreferenceSection.tsx` | Add form labels, save confirmation |
| `/src/components/TranslationManagement/TranslationManagement.types.ts` | Add accessibility-related type definitions |

### Dependencies (Read-Only Reference)

| File Path | Usage |
|-----------|-------|
| `/src/components/ItemManager/utils/a11yUtils.tsx` | Import useFocusTrap, useAnnounce, createKeyboardNavigator |
| `/src/components/ItemManager/components/ItemPreview/ItemPreviewModal.tsx` | Reference for dialog pattern |
| `/src/components/ItemManager/components/BulkActions/BulkTagDialog.tsx` | Reference for focus trap usage |
| `/src/components/LanguageSwitcher/LanguageSwitcher.tsx` | Reference for listbox pattern |
| `@radix-ui/react-dialog` | Use for accessible modal dialogs |

---

## Acceptance Criteria

### ARIA Implementation
- [ ] All status icons have descriptive aria-labels including status name
- [ ] Status icons include language name in label
- [ ] Stale indicator included in ARIA label when applicable
- [ ] All action buttons have accessible names
- [ ] Dialog modals have role="dialog" or role="alertdialog"
- [ ] Dialogs have aria-modal="true"
- [ ] Dialogs have aria-labelledby pointing to title
- [ ] Progress bar has progressbar role with proper aria-values
- [ ] Translated text has lang attribute

### Keyboard Navigation
- [ ] Preview panel opens/closes with keyboard
- [ ] Tab navigates through all interactive elements
- [ ] Arrow keys navigate language list
- [ ] Escape closes panels and modals
- [ ] Enter/Space activates buttons
- [ ] Home/End navigate to first/last items
- [ ] No keyboard traps exist
- [ ] Cmd/Ctrl+Enter saves in editor

### Focus Management
- [ ] Focus trap active in all modals when open
- [ ] Focus moves to panel/modal on open
- [ ] Focus returns to trigger element on close
- [ ] Focus indicators visible (min 3:1 contrast)
- [ ] Focus indicators consistent across components
- [ ] Minimum 44x44px touch targets on all interactive elements

### Screen Reader Announcements
- [ ] Translation completions announced
- [ ] Translation failures announced assertively
- [ ] Progress updates announced
- [ ] Bulk operation completion announced
- [ ] Announcements include language name
- [ ] Live regions use appropriate politeness

### Semantic HTML
- [ ] Buttons used for actions (not divs)
- [ ] Proper heading hierarchy (h2, h3)
- [ ] Lists used for language items
- [ ] Form labels properly associated
- [ ] Error messages linked via aria-describedby

### Testing
- [ ] VoiceOver (macOS) testing complete
- [ ] Keyboard-only navigation testing complete
- [ ] All tests pass with screen reader
- [ ] No duplicate announcements
- [ ] Focus order matches visual order

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Radix Dialog conflicts with custom focus trap | Medium | Medium | Use Radix Dialog's built-in focus management instead |
| Live region announcement timing | Low | Medium | Use debounced announcements, test with real screen readers |
| Arrow key navigation conflicts | Low | Low | Test thoroughly, ensure no conflicts with text editing |
| Touch target size conflicts with design | Medium | Medium | Coordinate with design, prioritize accessibility |
| Cross-browser focus indicator differences | Low | Medium | Test in Safari, Chrome, Firefox; use consistent CSS |

---

## Testing Tools

| Tool | Purpose | Usage |
|------|---------|-------|
| VoiceOver | macOS screen reader | Manual testing |
| axe DevTools | Automated WCAG testing | Browser extension audit |
| Lighthouse | Accessibility score | CI/CD check |
| Tab key | Keyboard navigation | Manual verification |
| Chrome DevTools | Accessibility tree | Inspect ARIA |

---

## Related Documentation

- [Implementation Plan: L10N Epic 5](/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md) - Full epic specification
- [REQ-090: Accessibility Audit](/docs/REQ-090-accessibility-audit-overview.md) - ItemManager accessibility patterns
- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/) - Accessibility guidelines
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/) - Pattern implementations
- [Radix UI Accessibility](https://www.radix-ui.com/primitives/docs/overview/accessibility) - Component library patterns
- [a11yUtils.tsx](/src/components/ItemManager/utils/a11yUtils.tsx) - Existing accessibility hooks

---

## Appendix A: Status Icon ARIA Labels Reference

| Status | Icon | ARIA Label |
|--------|------|------------|
| Pending | `⏳` | "[Language]: Translation pending" |
| Processing | (spinner) | "[Language]: Translation in progress" |
| Completed | `✓` | "[Language]: Translation complete" |
| Failed | `❌` | "[Language]: Translation failed" |
| Manual | `✎` | "[Language]: Manually edited translation" |
| Stale | `⚠️` | "[Language]: [status], translation may be outdated" |

---

## Appendix B: Screen Reader Test Script

```markdown
## VoiceOver Test Procedure (macOS)

### Setup
1. Enable VoiceOver: Cmd+F5
2. Navigate to dashboard with translation management

### Test 1: Preview Panel
1. Save content to trigger preview panel
2. Verify: "Translations, dialog" announced
3. Tab to first language item
4. Verify: Language name and status announced
5. Press Arrow Down
6. Verify: Next language announced
7. Press Enter on an item
8. Verify: Editor dialog opens and title announced

### Test 2: Translation Editor
1. With editor open, verify focus in textarea
2. Tab through all controls
3. Verify: Each label announced
4. Press Escape
5. Verify: Focus returns to Edit button

### Test 3: Status Changes
1. Trigger a re-translation
2. Verify: "In progress" status announced
3. Wait for completion
4. Verify: "[Language] translation completed" announced

### Test 4: Warning Dialog
1. Edit a translation manually
2. Update source content
3. Verify: Alert dialog announced
4. Verify: Warning message announced
5. Navigate to both buttons
6. Verify: Button purposes clear
```

---

*Document generated for FAQBNB Localization Epic 5 - Owner Translation Management, Task 7.4*
