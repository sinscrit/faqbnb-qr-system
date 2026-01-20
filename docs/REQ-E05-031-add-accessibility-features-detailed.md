# REQ-E05-031: Add Accessibility Features for Translation Management Components - Detailed Task Breakdown

**Document Type:** Detailed Implementation Tasks
**Request ID:** REQ-E05-031 (Epic 5 - Owner Translation Management)
**Created:** 2026-01-20
**Last Modified:** 2026-01-20 00:15 UTC
**Phase:** 7 - Integration & Polish
**Task ID:** 7.4

---

## Executive Summary

This document provides granular, actionable implementation tasks for adding comprehensive accessibility features to all Epic 5 translation management components. The implementation enables property owners using assistive technology to fully access translation management features through keyboard navigation, screen reader announcements, proper ARIA labeling, and focus management.

**Total Estimated Tasks:** 32 granular tasks across 12 implementation areas
**Dependencies:** All Epic 5 translation management components must be complete

---

## Task Breakdown

### Area 1: TranslationStatusItem - ARIA Labels for Status Icons

**Target File:** `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx`

#### Task 1.1: Add status icon ARIA wrapper structure
**Estimated Size:** 1 story point

**Current State:** Status icons display without accessibility attributes, relying only on color to convey status.

**Implementation Steps:**
1. Locate the status icon rendering section (look for CheckCircle, Clock, XCircle, PencilSquare icons)
2. Wrap each status icon in a `<span>` element with the following attributes:
   - `role="img"`
   - `aria-label` dynamically set based on language and status
3. Add `aria-hidden="true"` to the inner icon element
4. Add `title` attribute for tooltip on hover

**Code Pattern:**
```tsx
// Before
<CheckCircle className="w-4 h-4 text-green-500" />

// After
<span
  role="img"
  aria-label={`${languageName} translation ${getStatusLabel(status)}`}
  title={`${languageName}: ${getStatusLabel(status)}`}
>
  <CheckCircle className="w-4 h-4 text-green-500" aria-hidden="true" />
</span>
```

**Acceptance Criteria:**
- [ ] Each status icon wrapped with `role="img"` span
- [ ] `aria-label` includes language name and status description
- [ ] Inner icon has `aria-hidden="true"`
- [ ] `title` attribute provides hover tooltip
- [ ] Screen reader announces "French translation complete" (example)

---

#### Task 1.2: Create status label helper function
**Estimated Size:** 1 story point

**Implementation Steps:**
1. Create a helper function `getStatusAriaLabel(language: string, status: TranslationStatus): string`
2. Define label mappings for all status values:
   - `'completed'` -> "translation complete"
   - `'manual'` -> "translation manually edited"
   - `'pending'` -> "translation pending"
   - `'processing'` -> "translation in progress"
   - `'failed'` -> "translation failed, retry available"
   - `'stale'` (computed) -> "translation outdated"
   - default/not started -> "translation not started"
3. Export function from component file or types file

**Code Pattern:**
```tsx
export function getStatusAriaLabel(languageName: string, status: string, isStale?: boolean): string {
  if (isStale && status === 'completed') {
    return `${languageName} translation outdated`;
  }

  const statusLabels: Record<string, string> = {
    completed: 'translation complete',
    manual: 'translation manually edited',
    pending: 'translation pending',
    processing: 'translation in progress',
    failed: 'translation failed, retry available',
  };

  return `${languageName} ${statusLabels[status] || 'translation not started'}`;
}
```

**Acceptance Criteria:**
- [ ] Function handles all 5 translation status values
- [ ] Function handles stale state as additional flag
- [ ] Returns properly formatted string with language name first
- [ ] Unit test verifies all status combinations

---

#### Task 1.3: Add visible text labels alongside icons
**Estimated Size:** 1 story point

**Implementation Steps:**
1. Ensure each status row displays text label in addition to colored icon
2. Add status text after the icon (e.g., "Complete", "Pending", "Failed")
3. Text label should use standard color scheme matching icon
4. Verify color contrast meets WCAG AA (4.5:1 for normal text)

**Code Pattern:**
```tsx
<div className="flex items-center gap-2">
  <span role="img" aria-label={ariaLabel} title={tooltip}>
    <StatusIcon className={iconClass} aria-hidden="true" />
  </span>
  <span className={`text-sm ${textClass}`}>
    {statusText}
  </span>
</div>
```

**Acceptance Criteria:**
- [ ] Visible text label accompanies each status icon
- [ ] Text color matches icon color scheme
- [ ] Color contrast ratio verified (minimum 4.5:1)
- [ ] Non-color indicators present (icons have distinct shapes)

---

### Area 2: TranslationPreviewPanel - Keyboard Navigation

**Target File:** `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx`

#### Task 2.1: Import and integrate useFocusTrap hook
**Estimated Size:** 1 story point

**Implementation Steps:**
1. Add import: `import { useFocusTrap } from '@/components/ItemManager/utils/a11yUtils';`
2. Create ref for panel container: `const panelRef = useRef<HTMLDivElement>(null);`
3. Call hook with panel ref and open state: `useFocusTrap(panelRef, isOpen);`
4. Apply ref to the outermost panel container div

**Code Pattern:**
```tsx
import { useFocusTrap } from '@/components/ItemManager/utils/a11yUtils';

export function TranslationPreviewPanel({ isOpen, onClose, ... }: TranslationPreviewPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  useFocusTrap(panelRef, isOpen);

  return (
    <div ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="panel-title">
      ...
    </div>
  );
}
```

**Acceptance Criteria:**
- [ ] `useFocusTrap` hook imported and called
- [ ] Panel ref created and applied to container
- [ ] Focus trapped within panel when open
- [ ] Tab cycles through panel elements without escaping

---

#### Task 2.2: Implement Escape key handler
**Estimated Size:** 1 story point

**Implementation Steps:**
1. Add `useEffect` with keydown listener for Escape key
2. When Escape pressed while panel open, call `onClose()`
3. Clean up event listener on unmount

**Code Pattern:**
```tsx
useEffect(() => {
  if (!isOpen) return;

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, [isOpen, onClose]);
```

**Acceptance Criteria:**
- [ ] Escape key closes panel from any focused element
- [ ] Event listener cleaned up on unmount
- [ ] No memory leaks from event listeners

---

#### Task 2.3: Implement roving tabindex for language rows
**Estimated Size:** 2 story points

**Implementation Steps:**
1. Import `useRovingTabIndex` from a11yUtils
2. Get count of language rows (6 for supported languages)
3. Call hook: `const { currentIndex, setIndex, handleKeyDown } = useRovingTabIndex(languages.length);`
4. Apply `tabIndex={idx === currentIndex ? 0 : -1}` to each language row
5. Apply `onFocus={() => setIndex(idx)}` to each row
6. Apply `onKeyDown={handleKeyDown}` to the language list container

**Code Pattern:**
```tsx
const { currentIndex, setIndex, handleKeyDown } = useRovingTabIndex(languages.length);

return (
  <div
    role="list"
    aria-label="Translation status by language"
    onKeyDown={handleKeyDown}
  >
    {languages.map((lang, idx) => (
      <div
        key={lang.code}
        role="listitem"
        tabIndex={idx === currentIndex ? 0 : -1}
        onFocus={() => setIndex(idx)}
        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        <TranslationStatusItem language={lang} ... />
      </div>
    ))}
  </div>
);
```

**Acceptance Criteria:**
- [ ] Only one language row tabbable at a time
- [ ] Arrow Up/Down navigates between rows
- [ ] Home key moves to first row
- [ ] End key moves to last row
- [ ] Focus visible styling appears on focused row

---

#### Task 2.4: Add focus management for panel open/close
**Estimated Size:** 1 story point

**Implementation Steps:**
1. Create ref to store trigger element: `const triggerRef = useRef<HTMLElement | null>(null);`
2. Create ref for initial focus target (close button): `const closeButtonRef = useRef<HTMLButtonElement>(null);`
3. When panel opens, store current focused element and focus close button
4. When panel closes, restore focus to trigger element

**Note:** `useFocusTrap` already handles this, but verify behavior and add explicit refs if needed for more control.

**Code Pattern:**
```tsx
const closeButtonRef = useRef<HTMLButtonElement>(null);

useEffect(() => {
  if (isOpen && closeButtonRef.current) {
    // Small delay to ensure panel is rendered
    setTimeout(() => closeButtonRef.current?.focus(), 50);
  }
}, [isOpen]);

return (
  <button
    ref={closeButtonRef}
    onClick={onClose}
    aria-label="Close translation preview panel"
  >
    <X className="w-5 h-5" aria-hidden="true" />
  </button>
);
```

**Acceptance Criteria:**
- [ ] Focus moves to close button when panel opens
- [ ] Focus returns to trigger element when panel closes
- [ ] No focus lost when panel closes

---

#### Task 2.5: Add dialog ARIA attributes to panel
**Estimated Size:** 1 story point

**Implementation Steps:**
1. Add `role="dialog"` to panel container
2. Add `aria-modal="true"` to indicate modal nature
3. Add `aria-labelledby` pointing to panel title element ID
4. Add `aria-describedby` pointing to panel description if present
5. Add unique ID to panel title: `id="translation-panel-title"`

**Code Pattern:**
```tsx
<div
  ref={panelRef}
  role="dialog"
  aria-modal="true"
  aria-labelledby="translation-panel-title"
  className="..."
>
  <h2 id="translation-panel-title">Translations</h2>
  ...
</div>
```

**Acceptance Criteria:**
- [ ] Panel has `role="dialog"`
- [ ] Panel has `aria-modal="true"`
- [ ] Title properly linked via `aria-labelledby`
- [ ] Screen reader announces panel as dialog with title

---

### Area 3: Screen Reader Announcements

**Target Files:** Multiple components

#### Task 3.1: Add useAnnounce to TranslationPreviewPanel
**Estimated Size:** 1 story point

**Implementation Steps:**
1. Import `useAnnounce` from a11yUtils
2. Call hook: `const { announce, AnnouncerRegion } = useAnnounce();`
3. Render `<AnnouncerRegion />` inside panel
4. Call `announce()` for panel open event

**Code Pattern:**
```tsx
import { useAnnounce } from '@/components/ItemManager/utils/a11yUtils';

export function TranslationPreviewPanel({ ... }) {
  const { announce, AnnouncerRegion } = useAnnounce();

  useEffect(() => {
    if (isOpen && entityName) {
      announce(`Translation preview panel opened for ${entityName}`);
    }
  }, [isOpen, entityName, announce]);

  return (
    <div ...>
      <AnnouncerRegion />
      ...
    </div>
  );
}
```

**Acceptance Criteria:**
- [ ] `AnnouncerRegion` rendered in panel
- [ ] Panel open announces "Translation preview panel opened for [entity]"
- [ ] Announcement uses polite politeness level

---

#### Task 3.2: Add translation completion announcements
**Estimated Size:** 1 story point

**Implementation Steps:**
1. In component using `useTranslationRealtime`, detect when translation status changes to 'completed'
2. Call `announce()` with completion message
3. For failures, use assertive politeness level

**Code Pattern:**
```tsx
// In TranslationPreviewPanel or parent component
useEffect(() => {
  // Called when realtime update received
  const handleTranslationUpdate = (update: TranslationUpdate) => {
    if (update.status === 'completed') {
      announce(`${update.languageName} translation completed successfully`);
    } else if (update.status === 'failed') {
      announce(`${update.languageName} translation failed, retry available`, 'assertive');
    }
  };

  // Subscribe to realtime updates
  // ...
}, [announce]);
```

**Acceptance Criteria:**
- [ ] Completion announces "{language} translation completed successfully"
- [ ] Failure announces "{language} translation failed, retry available" with assertive
- [ ] Only announces for status changes (not initial load)

---

#### Task 3.3: Add bulk operation announcements to BulkTranslationBar
**Estimated Size:** 1 story point

**Target File:** `/src/components/TranslationManagement/BulkTranslationBar/BulkTranslationBar.tsx`

**Implementation Steps:**
1. Import and use `useAnnounce` hook
2. After bulk operation completes, announce result count
3. Include `<AnnouncerRegion />` in component

**Code Pattern:**
```tsx
const handleBulkRetranslate = async () => {
  const result = await retranslateApi.post(...);
  if (result.success) {
    announce(`${result.jobsQueued} translation job${result.jobsQueued !== 1 ? 's' : ''} queued successfully`);
  }
};
```

**Acceptance Criteria:**
- [ ] Announces "{count} translation jobs queued successfully"
- [ ] Uses polite politeness level
- [ ] Handles singular/plural correctly

---

### Area 4: TranslationEditor Modal - Focus Management

**Target File:** `/src/components/TranslationManagement/TranslationEditor/TranslationEditor.tsx`

#### Task 4.1: Implement focus trap in editor modal
**Estimated Size:** 1 story point

**Implementation Steps:**
1. Import `useFocusTrap` from a11yUtils
2. Create ref for modal container
3. Call `useFocusTrap(modalRef, isOpen)`
4. Apply ref to modal container

**Acceptance Criteria:**
- [ ] Focus trapped within modal when open
- [ ] Tab cycles through modal elements
- [ ] Shift+Tab cycles backwards

---

#### Task 4.2: Set initial focus to textarea
**Estimated Size:** 1 story point

**Implementation Steps:**
1. Create ref for translation textarea: `const textareaRef = useRef<HTMLTextAreaElement>(null);`
2. On modal open, focus textarea after small delay
3. Apply ref to textarea element

**Code Pattern:**
```tsx
const textareaRef = useRef<HTMLTextAreaElement>(null);

useEffect(() => {
  if (isOpen) {
    setTimeout(() => textareaRef.current?.focus(), 100);
  }
}, [isOpen]);

return (
  <textarea
    ref={textareaRef}
    aria-label={`${languageName} translation content`}
    ...
  />
);
```

**Acceptance Criteria:**
- [ ] Textarea receives focus when modal opens
- [ ] User can immediately start typing
- [ ] Focus visible styling on textarea

---

#### Task 4.3: Add ARIA attributes to editor modal
**Estimated Size:** 1 story point

**Implementation Steps:**
1. Add `role="dialog"` to modal container
2. Add `aria-modal="true"`
3. Add `aria-labelledby` pointing to modal title
4. Add descriptive title: "Edit {language} Translation"

**Code Pattern:**
```tsx
<Dialog.Content
  role="dialog"
  aria-modal="true"
  aria-labelledby="editor-modal-title"
>
  <Dialog.Title id="editor-modal-title">
    Edit {languageName} Translation
  </Dialog.Title>
  ...
</Dialog.Content>
```

**Acceptance Criteria:**
- [ ] Modal announced as dialog with title
- [ ] Language name included in title
- [ ] ARIA attributes properly set

---

#### Task 4.4: Implement Escape key for cancel workflow
**Estimated Size:** 1 story point

**Implementation Steps:**
1. Add keydown handler for Escape key
2. If dirty state, show confirmation before canceling
3. If clean, cancel immediately
4. Radix Dialog may handle this - verify and customize if needed

**Code Pattern:**
```tsx
const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === 'Escape') {
    e.preventDefault();
    if (isDirty) {
      setShowConfirmDialog(true);
    } else {
      onCancel();
    }
  }
};
```

**Acceptance Criteria:**
- [ ] Escape triggers cancel workflow
- [ ] Dirty state shows confirmation
- [ ] Clean state closes immediately

---

### Area 5: LanguageSelectorDialog - Focus Management

**Target File:** `/src/components/TranslationManagement/BulkTranslationBar/LanguageSelectorDialog.tsx`

#### Task 5.1: Implement focus trap in dialog
**Estimated Size:** 1 story point

**Implementation Steps:**
1. Import and use `useFocusTrap`
2. Create ref for dialog container
3. Focus first checkbox or "Select All" button on open

**Acceptance Criteria:**
- [ ] Focus trapped within dialog
- [ ] Initial focus on first checkbox or Select All
- [ ] Tab cycles through all controls

---

#### Task 5.2: Add keyboard navigation for checkbox list
**Estimated Size:** 1 story point

**Implementation Steps:**
1. Import `createKeyboardNavigator` from a11yUtils
2. Implement Arrow key navigation through checkbox list
3. Space key toggles checkbox state when focused

**Code Pattern:**
```tsx
const handleListKeyDown = createKeyboardNavigator({
  orientation: 'vertical',
  wrap: true,
  itemCount: languages.length,
  currentIndex: focusedIndex,
  onNavigate: (idx) => {
    setFocusedIndex(idx);
    checkboxRefs.current[idx]?.focus();
  },
});

return (
  <div role="group" aria-label="Select languages" onKeyDown={handleListKeyDown}>
    {languages.map((lang, idx) => (
      <label key={lang.code}>
        <input
          type="checkbox"
          ref={el => checkboxRefs.current[idx] = el}
          tabIndex={idx === focusedIndex ? 0 : -1}
          checked={selectedLanguages.includes(lang.code)}
          onChange={() => toggleLanguage(lang.code)}
        />
        {lang.name}
      </label>
    ))}
  </div>
);
```

**Acceptance Criteria:**
- [ ] Arrow keys navigate between checkboxes
- [ ] Space toggles checkbox state
- [ ] Only one checkbox tabbable at a time

---

### Area 6: ManualEditWarningDialog - Focus Management

**Target File:** `/src/components/TranslationManagement/ManualEditWarning/ManualEditWarningDialog.tsx`

#### Task 6.1: Implement focus trap and initial focus
**Estimated Size:** 1 story point

**Implementation Steps:**
1. Import `useFocusTrap` from a11yUtils
2. Set initial focus to "Keep Manual Edits" button (safer option)
3. Create ref for safe action button

**Code Pattern:**
```tsx
const keepEditsButtonRef = useRef<HTMLButtonElement>(null);

useEffect(() => {
  if (isOpen) {
    setTimeout(() => keepEditsButtonRef.current?.focus(), 100);
  }
}, [isOpen]);

return (
  <Dialog.Content>
    ...
    <button ref={keepEditsButtonRef} onClick={onKeepManual}>
      Keep Manual Edits
    </button>
    <button onClick={onRetranslate}>
      Re-translate All
    </button>
  </Dialog.Content>
);
```

**Acceptance Criteria:**
- [ ] Focus on "Keep Manual Edits" button on open
- [ ] Focus trapped within dialog
- [ ] Escape closes dialog (triggers cancel)

---

#### Task 6.2: Add alert dialog ARIA attributes
**Estimated Size:** 1 story point

**Implementation Steps:**
1. Use `role="alertdialog"` instead of `role="dialog"` (this is a warning)
2. Add `aria-describedby` pointing to warning message
3. Ensure warning icon has `aria-hidden="true"`

**Code Pattern:**
```tsx
<Dialog.Content
  role="alertdialog"
  aria-modal="true"
  aria-labelledby="warning-title"
  aria-describedby="warning-description"
>
  <AlertTriangle aria-hidden="true" />
  <Dialog.Title id="warning-title">Manual Translations Detected</Dialog.Title>
  <p id="warning-description">
    Updating source content will affect {affectedCount} manually edited translation(s).
  </p>
  ...
</Dialog.Content>
```

**Acceptance Criteria:**
- [ ] `role="alertdialog"` set
- [ ] Warning message linked via `aria-describedby`
- [ ] Screen reader announces as alert dialog

---

### Area 7: TranslationProgressBar - Progressbar ARIA

**Target File:** `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationProgressBar.tsx`

#### Task 7.1: Add progressbar role and ARIA attributes
**Estimated Size:** 1 story point

**Implementation Steps:**
1. Add `role="progressbar"` to container
2. Add `aria-valuenow={completedCount}`
3. Add `aria-valuemin={0}`
4. Add `aria-valuemax={totalCount}`
5. Add descriptive `aria-label`
6. Add screen reader only text description

**Code Pattern:**
```tsx
<div className="space-y-1">
  <div
    role="progressbar"
    aria-valuenow={completedCount}
    aria-valuemin={0}
    aria-valuemax={totalCount}
    aria-label={`Translation progress: ${completedCount} of ${totalCount} languages complete`}
    className="w-full bg-gray-200 rounded-full h-2"
  >
    <div
      className="bg-green-500 h-2 rounded-full transition-all duration-300"
      style={{ width: `${(completedCount / totalCount) * 100}%` }}
      aria-hidden="true"
    />
  </div>
  <span className="sr-only">
    {completedCount} of {totalCount} translations complete
  </span>
</div>
```

**Acceptance Criteria:**
- [ ] `role="progressbar"` on container
- [ ] All ARIA value attributes set correctly
- [ ] Screen reader only text provides additional context
- [ ] Inner progress bar has `aria-hidden="true"`

---

### Area 8: TranslationStatusColumn - Table Column Accessibility

**Target File:** `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.tsx`

#### Task 8.1: Add ARIA label to clickable indicator
**Estimated Size:** 1 story point

**Implementation Steps:**
1. Add `aria-label` with summary text to clickable container
2. Make container a button element for semantic correctness
3. Add keyboard activation (Enter/Space)

**Code Pattern:**
```tsx
<button
  onClick={onClick}
  aria-label={`Translation status: ${completedCount} of 6 complete. Click to view details`}
  className="flex gap-0.5 p-1 rounded hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
>
  {languages.map(lang => (
    <span
      key={lang.code}
      title={`${lang.name}: ${lang.status}`}
      className={`w-2 h-2 rounded-full ${getStatusColor(lang.status)}`}
      aria-hidden="true"
    />
  ))}
</button>
```

**Acceptance Criteria:**
- [ ] Clickable element is semantic button
- [ ] ARIA label describes translation summary
- [ ] Each dot has title attribute for tooltip
- [ ] Enter/Space activates click handler

---

#### Task 8.2: Add focus visible styling
**Estimated Size:** 0.5 story point

**Implementation Steps:**
1. Add focus ring classes to button element
2. Use consistent focus styling with other components

**Code Pattern:**
```tsx
className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
```

**Acceptance Criteria:**
- [ ] Focus ring visible on keyboard focus
- [ ] Focus ring meets 3:1 contrast ratio
- [ ] Consistent with other interactive elements

---

### Area 9: TranslationStatusFilter - Dropdown Accessibility

**Target File:** `/src/components/TranslationManagement/TranslationStatusFilter/TranslationStatusFilter.tsx`

#### Task 9.1: Add ARIA attributes to dropdown
**Estimated Size:** 1 story point

**Implementation Steps:**
1. Add `aria-label="Filter by translation status"` to select element
2. Add `id` to select and `htmlFor` to label for association
3. Add `aria-expanded` if using custom dropdown

**Code Pattern:**
```tsx
<label htmlFor="translation-status-filter" className="text-sm font-medium">
  Filter by Status
</label>
<select
  id="translation-status-filter"
  aria-label="Filter items by translation status"
  value={selectedFilter}
  onChange={onChange}
  className="..."
>
  <option value="all">All Items</option>
  <option value="complete">Fully Translated</option>
  ...
</select>
```

**Acceptance Criteria:**
- [ ] Label properly associated with select
- [ ] ARIA label provides context
- [ ] Keyboard navigable with arrow keys

---

### Area 10: BulkTranslationBar - Action Button Accessibility

**Target File:** `/src/components/TranslationManagement/BulkTranslationBar/BulkTranslationBar.tsx`

#### Task 10.1: Add descriptive ARIA labels to buttons
**Estimated Size:** 1 story point

**Implementation Steps:**
1. Add `aria-label` to each action button with full context
2. Ensure button text or label describes action completely

**Code Pattern:**
```tsx
<button
  onClick={handleRetranslateAll}
  aria-label={`Re-translate all ${selectedCount} selected items in all languages`}
  className="..."
>
  Re-translate All
</button>
<button
  onClick={openLanguageSelector}
  aria-label={`Select languages to re-translate for ${selectedCount} selected items`}
  className="..."
>
  Select Languages...
</button>
```

**Acceptance Criteria:**
- [ ] Each button has descriptive aria-label
- [ ] Labels include selection count for context
- [ ] Screen reader announces full action description

---

#### Task 10.2: Add live region for operation progress
**Estimated Size:** 1 story point

**Implementation Steps:**
1. Add `aria-live="polite"` region for progress updates
2. Update region content during bulk operations

**Code Pattern:**
```tsx
<div aria-live="polite" aria-atomic="true" className="sr-only">
  {operationStatus}
</div>

// Update during operation:
setOperationStatus('Processing 5 of 12 items...');
// After completion:
setOperationStatus('12 translation jobs queued successfully');
```

**Acceptance Criteria:**
- [ ] Live region announces progress updates
- [ ] Uses polite politeness level
- [ ] Announces completion message

---

### Area 11: Loading States Accessibility

**Target Files:** All translation management components

#### Task 11.1: Add aria-busy to containers during loading
**Estimated Size:** 1 story point

**Implementation Steps:**
1. Add `aria-busy="true"` to containers during async operations
2. Remove or set to false when loading completes
3. Apply to: TranslationPreviewPanel, TranslationStatusWidget, TranslationEditor

**Code Pattern:**
```tsx
<div aria-busy={isLoading}>
  {isLoading ? <LoadingSpinner aria-label="Loading translations" /> : children}
</div>
```

**Acceptance Criteria:**
- [ ] `aria-busy` set during all loading states
- [ ] Spinner has `aria-label="Loading translations"`
- [ ] Screen reader informed of busy state

---

### Area 12: Error States Accessibility

**Target Files:** All translation management components

#### Task 12.1: Add role="alert" to error messages
**Estimated Size:** 1 story point

**Implementation Steps:**
1. Add `role="alert"` to error message containers
2. This triggers immediate screen reader announcement
3. Apply to all error state displays

**Code Pattern:**
```tsx
{error && (
  <div role="alert" className="text-red-600 p-2 bg-red-50 rounded">
    <span className="font-medium">Error: </span>
    {error.message}
    <button aria-label={`Retry ${actionContext}`} onClick={onRetry}>
      Retry
    </button>
  </div>
)}
```

**Acceptance Criteria:**
- [ ] Error messages have `role="alert"`
- [ ] Screen reader announces errors immediately
- [ ] Retry buttons have contextual aria-labels

---

#### Task 12.2: Add contextual retry button labels
**Estimated Size:** 0.5 story point

**Implementation Steps:**
1. Ensure retry buttons include context in aria-label
2. Example: "Retry Spanish translation" not just "Retry"

**Code Pattern:**
```tsx
<button
  aria-label={`Retry ${languageName} translation`}
  onClick={() => handleRetry(language)}
>
  <RefreshCcw className="w-4 h-4" aria-hidden="true" />
  Retry
</button>
```

**Acceptance Criteria:**
- [ ] All retry buttons have contextual aria-labels
- [ ] Labels include entity/language being retried
- [ ] Icons have `aria-hidden="true"`

---

## Testing Requirements

### Automated Testing

#### Unit Tests
- [ ] Verify ARIA attributes present on status icons
- [ ] Verify keyboard handlers fire correctly
- [ ] Verify announce function called with correct messages
- [ ] Verify focus trap contains focus

#### Accessibility Auditing
- [ ] Run jest-axe on all modified components
- [ ] Zero violations for ARIA, labels, roles
- [ ] Verify color contrast programmatically

### Manual Testing

#### Screen Reader Testing (Priority: High)
1. **VoiceOver (macOS)**: Test all components with VoiceOver enabled
   - Verify announcements are clear and contextual
   - Verify navigation through panel is logical
   - Verify all status icons are announced correctly

2. **NVDA (Windows)**: Test critical paths
   - Panel open/close announcements
   - Translation status descriptions
   - Bulk operation feedback

#### Keyboard Navigation Testing
1. Navigate through TranslationPreviewPanel using only keyboard
2. Open and close TranslationEditor using only keyboard
3. Select languages in LanguageSelectorDialog using only keyboard
4. Complete bulk operation workflow using only keyboard

#### Focus Management Testing
1. Verify focus moves to panel on open
2. Verify focus returns to trigger on close
3. Verify no focus loss during any interaction

---

## Implementation Order

**Recommended sequence:**

1. **Task 1.1-1.3**: TranslationStatusItem ARIA labels (foundation for status accessibility)
2. **Task 7.1**: TranslationProgressBar ARIA (quick win)
3. **Task 2.1-2.5**: TranslationPreviewPanel keyboard navigation (high user impact)
4. **Task 3.1-3.3**: Screen reader announcements (high user impact)
5. **Task 4.1-4.4**: TranslationEditor focus management
6. **Task 5.1-5.2**: LanguageSelectorDialog accessibility
7. **Task 6.1-6.2**: ManualEditWarningDialog accessibility
8. **Task 8.1-8.2**: TranslationStatusColumn accessibility
9. **Task 9.1**: TranslationStatusFilter accessibility
10. **Task 10.1-10.2**: BulkTranslationBar accessibility
11. **Task 11.1**: Loading states accessibility
12. **Task 12.1-12.2**: Error states accessibility

---

## References

- **Overview Document:** `/docs/REQ-E05-031-add-accessibility-features-overview.md`
- **Request:** `/docs/gen_requests_epic5.md` (REQ-E05-032)
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- **Accessibility Utilities:** `/src/components/ItemManager/utils/a11yUtils.tsx`
- **WCAG 2.1 Guidelines:** https://www.w3.org/WAI/WCAG21/quickref/
- **Radix UI Dialog Accessibility:** https://www.radix-ui.com/primitives/docs/components/dialog

---

## Document History

| Date | Version | Changes |
|------|---------|---------|
| 2026-01-20 00:15 UTC | 1.0 | Initial detailed task breakdown |
