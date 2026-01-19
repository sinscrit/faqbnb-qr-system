# REQ-333: Add Accessibility Features to Translation Management Interface

**Document Type:** Implementation Breakdown (Tech Lead Overview)
**Generated:** 2026-01-18
**Last Modified:** 2026-01-18
**Request Reference:** docs/gen_requests_epic5.md - REQ-333
**Implementation Plan Reference:** docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md
**Phase:** 7 - Integration & Polish
**Task ID:** 7.4

---

## Summary

This task adds comprehensive accessibility features to all TranslationManagement components to ensure property owners with disabilities can effectively manage translations. The implementation covers ARIA labels for status icons, keyboard navigation in the preview panel, screen reader announcements for status changes, and proper focus management in modal dialogs.

---

## Technical Context

### Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| Epic 1 (Foundation) | Required | Translation tables, i18n framework |
| Epic 3 (Dynamic Content) | Required | Translation status tracking |
| REQ-310 (TranslationPreviewPanel) | Required | Panel must exist before adding a11y features |
| REQ-311 (TranslationStatusItem) | Required | Status item rows need ARIA labels |
| REQ-312 (TranslationProgressBar) | Required | Progress bar needs ARIA labels |
| REQ-313 (TranslationEditor) | Required | Editor modal needs focus management |
| REQ-322 (LanguageSelectorDialog) | Required | Dialog needs focus trapping |
| REQ-325 (ManualEditWarningDialog) | Required | Warning dialog needs focus management |

### Existing Accessibility Patterns to Follow

| Pattern | Location | Purpose |
|---------|----------|---------|
| `useFocusTrap` | `/src/components/ItemManager/utils/a11yUtils.tsx` | Focus trapping in modals |
| `useFocusRestore` | `/src/components/ItemManager/utils/a11yUtils.tsx` | Restore focus when dialog closes |
| `useAnnounce` | `/src/components/ItemManager/utils/a11yUtils.tsx` | Screen reader announcements |
| `createKeyboardNavigator` | `/src/components/ItemManager/utils/a11yUtils.tsx` | Arrow key navigation |
| `useRovingTabIndex` | `/src/components/ItemManager/utils/a11yUtils.tsx` | Roving tabindex pattern |
| Radix Dialog | `/src/components/ItemManager/components/ItemPreview/ItemPreviewModal.tsx` | Accessible modal dialog |
| `sr-only` class | `/src/app/globals.css` | Visually hidden text for screen readers |

### Technology Stack

| Technology | Details |
|------------|---------|
| Framework | Next.js 15.5.9 with App Router |
| UI Components | Radix UI primitives (Dialog) |
| Styling | Tailwind CSS 4.x |
| Accessibility Utils | `a11yUtils.tsx` (existing) |

---

## Architecture Overview

### Component Accessibility Requirements

```
TranslationManagement/
├── TranslationPreviewPanel/
│   ├── TranslationPreviewPanel.tsx    → Keyboard nav, Escape to close
│   ├── TranslationStatusItem.tsx      → ARIA labels for status icons
│   └── TranslationProgressBar.tsx     → ARIA progressbar role
│
├── TranslationEditor/
│   └── TranslationEditor.tsx          → Focus trap, focus restore
│
├── TranslationStatusWidget/
│   └── TranslationStatusWidget.tsx    → ARIA labels, keyboard navigation
│
├── TranslationStatusColumn/
│   └── TranslationStatusColumn.tsx    → ARIA labels, non-color status
│
├── TranslationStatusFilter/
│   └── TranslationStatusFilter.tsx    → ARIA combobox pattern
│
├── BulkTranslationBar/
│   ├── BulkTranslationBar.tsx         → ARIA toolbar role
│   └── LanguageSelectorDialog.tsx     → Focus trap, focus restore
│
├── ManualEditWarning/
│   └── ManualEditWarningDialog.tsx    → Focus trap, alertdialog role
│
└── LanguagePreference/
    └── LanguagePreferenceSection.tsx  → ARIA labels for dropdown
```

### Accessibility Patterns to Implement

1. **Status Icon Labels** - All status icons must have descriptive ARIA labels
2. **Keyboard Navigation** - Arrow keys navigate language list, Tab for interactive elements
3. **Live Regions** - Announce status changes via `aria-live="polite"`
4. **Focus Management** - Focus trapping in modals, restore focus on close
5. **Color Independence** - Status distinguishable without color (icons + text)

---

## Implementation Approach

### Task Breakdown

#### Task 1: Add ARIA Labels to Status Icons

**Target Files:**
- `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx`
- `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.tsx`

**Changes Required:**

1. Add `aria-label` to status indicator icons:
```tsx
// Status icon mapping with ARIA labels
const STATUS_LABELS: Record<TranslationStatus, string> = {
  completed: 'Translation complete',
  pending: 'Translation pending',
  processing: 'Translation in progress',
  failed: 'Translation failed',
  manual: 'Manually edited translation',
};

// In render:
<span
  className={statusColorClass}
  role="img"
  aria-label={STATUS_LABELS[status]}
>
  {statusIcon}
</span>
```

2. Add text labels alongside icons for color-independence:
```tsx
// Visible label for color-blind users
<span className="sr-only">{STATUS_LABELS[status]}</span>
// Or use visible icon + text pattern
<span className="flex items-center gap-1">
  <CheckCircle className="h-4 w-4 text-green-500" aria-hidden="true" />
  <span className="text-xs text-gray-600">Complete</span>
</span>
```

**Acceptance Criteria Mapping:**
- [x] All translation status icons include descriptive ARIA labels indicating status meaning
- [x] Status labels distinguish between complete, pending, failed, and manually edited states
- [x] Color-coded status indicators are supplemented with icons or text

---

#### Task 2: Implement Keyboard Navigation in Preview Panel

**Target Files:**
- `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx`
- `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx`

**Changes Required:**

1. Import and use keyboard navigation utilities:
```tsx
import { createKeyboardNavigator, useRovingTabIndex } from '@/components/ItemManager/utils/a11yUtils';
```

2. Add arrow key navigation for language list:
```tsx
const { currentIndex, setIndex, handleKeyDown } = useRovingTabIndex(
  SUPPORTED_LANGUAGES.length
);

// In language list container:
<ul
  role="listbox"
  aria-label="Translation status by language"
  onKeyDown={handleKeyDown}
>
  {SUPPORTED_LANGUAGES.map((lang, idx) => (
    <TranslationStatusItem
      key={lang}
      language={lang}
      tabIndex={idx === currentIndex ? 0 : -1}
      onFocus={() => setIndex(idx)}
      aria-selected={idx === currentIndex}
    />
  ))}
</ul>
```

3. Add Escape key handler to close panel:
```tsx
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

4. Implement Tab key navigation for all interactive elements:
```tsx
// Ensure logical tab order: Close button → Progress bar → Language list → Action buttons
// Use tabIndex={0} for interactive elements, tabIndex={-1} for non-focused items in roving list
```

**Acceptance Criteria Mapping:**
- [x] TranslationPreviewPanel supports tab key navigation through all interactive elements in logical order
- [x] Preview panel supports arrow key navigation between language status entries
- [x] Pressing Escape key while preview panel is open closes the panel

---

#### Task 3: Implement Screen Reader Announcements

**Target Files:**
- `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx`
- `/src/hooks/useTranslationRealtime.ts`

**Changes Required:**

1. Add announcer region using existing hook:
```tsx
import { useAnnounce } from '@/components/ItemManager/utils/a11yUtils';

const { announce, AnnouncerRegion } = useAnnounce();

// In component JSX:
<AnnouncerRegion />
```

2. Announce status changes when realtime updates occur:
```tsx
// In useTranslationRealtime hook or component effect:
useEffect(() => {
  if (previousStatus && currentStatus !== previousStatus) {
    const languageName = LANGUAGE_NAMES[language];
    const statusLabel = STATUS_LABELS[currentStatus];
    announce(`${languageName}: ${statusLabel}`);
  }
}, [currentStatus, language, announce]);

// Example announcements:
// "Spanish: Translation complete"
// "French: Translation failed"
// "German: Translation in progress"
```

3. Announce loading states and progress:
```tsx
// When translations start loading:
announce('Loading translation status');

// When progress changes:
announce(`${completedCount} of ${totalLanguages} translations complete`);
```

**Acceptance Criteria Mapping:**
- [x] Translation status changes trigger screen reader announcements via ARIA live regions
- [x] Live region announcements include the affected language and new status state
- [x] Loading states and progress indicators are announced to screen readers via live regions

---

#### Task 4: Implement Focus Management in Modals

**Target Files:**
- `/src/components/TranslationManagement/TranslationEditor/TranslationEditor.tsx`
- `/src/components/TranslationManagement/BulkTranslationBar/LanguageSelectorDialog.tsx`
- `/src/components/TranslationManagement/ManualEditWarning/ManualEditWarningDialog.tsx`

**Changes Required:**

1. For Radix Dialog components (TranslationEditor, LanguageSelectorDialog):
```tsx
// Radix Dialog handles focus trap automatically, but verify:
<Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
  <Dialog.Portal>
    <Dialog.Overlay />
    <Dialog.Content
      // Radix auto-focuses first focusable element or content
      // For custom initial focus:
      onOpenAutoFocus={(e) => {
        e.preventDefault();
        initialFocusRef.current?.focus();
      }}
      // Return focus to trigger on close
      onCloseAutoFocus={(e) => {
        e.preventDefault();
        triggerRef.current?.focus();
      }}
    >
      ...
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
```

2. For custom dialogs not using Radix (if any):
```tsx
import { useFocusTrap, useFocusRestore } from '@/components/ItemManager/utils/a11yUtils';

// In component:
const dialogRef = useRef<HTMLDivElement>(null);
useFocusTrap(dialogRef, isOpen);
useFocusRestore(isOpen);

// In JSX:
<div
  ref={dialogRef}
  role="alertdialog"
  aria-modal="true"
  aria-labelledby="dialog-title"
  aria-describedby="dialog-description"
>
  <h2 id="dialog-title">Warning: Manual Edits Exist</h2>
  <p id="dialog-description">...</p>
  ...
</div>
```

3. For ManualEditWarningDialog specifically:
```tsx
// Use alertdialog role for important warnings
<Dialog.Content
  role="alertdialog"
  aria-describedby="warning-description"
>
  ...
</Dialog.Content>
```

**Acceptance Criteria Mapping:**
- [x] TranslationEditor modal implements focus trapping preventing focus from escaping dialog
- [x] LanguageSelectorDialog modal implements focus trapping preventing focus from escaping dialog
- [x] ManualEditWarningDialog modal implements focus trapping preventing focus from escaping dialog
- [x] When modals open, focus moves automatically to first interactive element or designated initial focus target
- [x] When modals close, focus returns to the triggering element that opened the modal

---

#### Task 5: Add Visible Focus Indicators

**Target Files:**
- All TranslationManagement components

**Changes Required:**

1. Apply consistent focus visible styles (already in Tailwind config):
```tsx
// Standard pattern for interactive elements:
className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"

// For buttons:
className={cn(
  "px-4 py-2 rounded-md",
  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
  "focus-visible:ring-2 focus-visible:ring-blue-500"
)}

// For list items with roving tabindex:
className={cn(
  "p-3 cursor-pointer",
  "focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500",
  idx === currentIndex && "bg-gray-100"
)}
```

2. Ensure minimum contrast ratio for focus indicators:
```tsx
// Blue-500 (#3B82F6) on white has sufficient contrast
// Verify dark mode styles if applicable
```

**Acceptance Criteria Mapping:**
- [x] All buttons, links, and form controls display visible focus indicators when focused
- [x] Focus indicators meet minimum contrast ratio requirements for accessibility standards

---

#### Task 6: Add Form Validation Announcements

**Target Files:**
- `/src/components/TranslationManagement/TranslationEditor/TranslationEditor.tsx`
- `/src/components/TranslationManagement/BulkTranslationBar/LanguageSelectorDialog.tsx`

**Changes Required:**

1. Associate error messages with inputs:
```tsx
<textarea
  id="translation-content"
  aria-invalid={!!error}
  aria-describedby={error ? "translation-error" : undefined}
  ...
/>
{error && (
  <p id="translation-error" role="alert" className="text-red-600 text-sm mt-1">
    {error}
  </p>
)}
```

2. Announce validation errors:
```tsx
useEffect(() => {
  if (validationError) {
    announce(validationError, 'assertive');
  }
}, [validationError, announce]);
```

**Acceptance Criteria Mapping:**
- [x] Form validation errors are announced to screen readers when they occur

---

#### Task 7: Add Accessible Names and Roles

**Target Files:**
- All TranslationManagement components

**Changes Required:**

1. Add ARIA roles to container elements:
```tsx
// TranslationPreviewPanel
<aside
  role="region"
  aria-label="Translation preview"
>

// BulkTranslationBar
<div
  role="toolbar"
  aria-label={`Bulk actions for ${selectedCount} selected items`}
>

// TranslationStatusWidget
<section
  role="region"
  aria-labelledby="translation-status-heading"
>
  <h2 id="translation-status-heading" className="sr-only">Translation Status Summary</h2>
```

2. Add accessible names to interactive elements:
```tsx
// Close button
<button
  aria-label="Close translation preview panel"
  onClick={onClose}
>
  <X className="h-5 w-5" aria-hidden="true" />
</button>

// Language status row
<li
  role="option"
  aria-label={`${languageName}: ${statusLabel}`}
  aria-selected={isSelected}
>

// Re-translate button
<button
  aria-label={`Re-translate ${languageName}`}
>
  <RefreshCw className="h-4 w-4" aria-hidden="true" />
</button>
```

**Acceptance Criteria Mapping:**
- [x] All interactive elements have descriptive accessible names via ARIA labels or visible text
- [x] Component landmarks use appropriate ARIA roles to aid screen reader navigation

---

#### Task 8: Ensure Minimum Touch Targets

**Target Files:**
- All interactive elements in TranslationManagement components

**Changes Required:**

1. Apply minimum size for touch targets:
```tsx
// Pattern from existing codebase:
className={cn(
  "min-h-[48px] min-w-[48px] md:min-h-[40px] md:min-w-[40px]",
  "touch-manipulation [-webkit-tap-highlight-color:transparent]"
)}
```

2. For icon-only buttons, ensure adequate padding:
```tsx
<button
  className="p-3 min-h-[44px] min-w-[44px] rounded-full hover:bg-gray-100"
  aria-label="Close preview"
>
  <X className="h-5 w-5" aria-hidden="true" />
</button>
```

**Acceptance Criteria Mapping:**
- [x] Interactive element hit targets meet minimum size requirements for touch and pointer accessibility

---

#### Task 9: Add Skip Links / Keyboard Shortcuts

**Target Files:**
- `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx`

**Changes Required:**

1. Add skip link to bypass language list when there are many items:
```tsx
// At top of panel
<a
  href="#translation-actions"
  className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-2 focus:bg-white focus:text-blue-600"
>
  Skip to translation actions
</a>

// Before action buttons
<div id="translation-actions">
  {/* Re-translate All, Close buttons */}
</div>
```

**Acceptance Criteria Mapping:**
- [x] Skip links or keyboard shortcuts allow bypassing repetitive navigation elements

---

## Authorized Files and Functions for Modification

### Files to Modify

| File Path | Changes | Estimated Effort |
|-----------|---------|------------------|
| `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx` | Add keyboard nav, ARIA roles, skip links, announcer | M |
| `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx` | Add ARIA labels, roving tabindex, color-independent status | S |
| `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationProgressBar.tsx` | Add ARIA progressbar role, labels | S |
| `/src/components/TranslationManagement/TranslationEditor/TranslationEditor.tsx` | Verify focus management, add error announcements | S |
| `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.tsx` | Add ARIA region, labels | S |
| `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.tsx` | Add ARIA labels, color-independent indicators | S |
| `/src/components/TranslationManagement/TranslationStatusFilter/TranslationStatusFilter.tsx` | Add ARIA combobox pattern | S |
| `/src/components/TranslationManagement/BulkTranslationBar/BulkTranslationBar.tsx` | Add ARIA toolbar role, labels | S |
| `/src/components/TranslationManagement/BulkTranslationBar/LanguageSelectorDialog.tsx` | Verify focus management, add error announcements | S |
| `/src/components/TranslationManagement/ManualEditWarning/ManualEditWarningDialog.tsx` | Verify alertdialog role, focus management | S |
| `/src/components/TranslationManagement/LanguagePreference/LanguagePreferenceSection.tsx` | Add ARIA labels for dropdown | S |
| `/src/hooks/useTranslationRealtime.ts` | Add announcement callback support | S |

### Functions/Components to Add or Modify

| Component/Function | Action | Description |
|--------------------|--------|-------------|
| `TranslationPreviewPanel` | Modify | Add keyboard handler, announcer region, skip links |
| `TranslationStatusItem` | Modify | Add ARIA label prop, tabIndex support, status text |
| `TranslationProgressBar` | Modify | Add role="progressbar", aria-valuenow/min/max |
| `useTranslationRealtime` | Modify | Add onStatusChange callback for announcements |
| All dialogs | Verify | Ensure Radix handles focus correctly, add alertdialog role where needed |

### Files to Import From (Read-Only Reference)

| File Path | Purpose |
|-----------|---------|
| `/src/components/ItemManager/utils/a11yUtils.tsx` | Import useFocusTrap, useAnnounce, createKeyboardNavigator, useRovingTabIndex |
| `/src/components/ItemManager/components/ItemPreview/ItemPreviewModal.tsx` | Reference pattern for Radix Dialog a11y |
| `/src/components/ItemManager/components/BulkActions/BulkMoveDialog.tsx` | Reference pattern for keyboard navigation |
| `/src/app/globals.css` | Reference sr-only, focus-visible styles |

---

## Integration Contract

### Props Updates Required

```typescript
// TranslationStatusItem needs roving tabindex support
interface TranslationStatusItemProps {
  // Existing props...
  tabIndex?: number;
  onFocus?: () => void;
  'aria-selected'?: boolean;
}

// TranslationPreviewPanel needs announcer support
interface TranslationPreviewPanelProps {
  // Existing props...
  /** Callback when status changes (for external announcement handling) */
  onStatusChange?: (language: SupportedLanguage, newStatus: TranslationStatus) => void;
}
```

### Event Handlers to Add

```typescript
// Keyboard navigation handler for preview panel
const handlePanelKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === 'Escape') {
    e.preventDefault();
    onClose();
  }
};

// Arrow key navigation for language list
const handleListKeyDown = createKeyboardNavigator({
  orientation: 'vertical',
  wrap: true,
  itemCount: SUPPORTED_LANGUAGES.length,
  currentIndex: focusedIndex,
  onNavigate: (index) => {
    setFocusedIndex(index);
    languageRefs[index]?.focus();
  },
});
```

---

## WCAG 2.1 Compliance Checklist

| Guideline | Level | Implementation |
|-----------|-------|----------------|
| 1.1.1 Non-text Content | A | ARIA labels for icons, alt text |
| 1.3.1 Info and Relationships | A | ARIA roles, labelledby/describedby |
| 1.4.1 Use of Color | A | Icons + text alongside colors |
| 1.4.3 Contrast (Minimum) | AA | Focus ring color contrast |
| 2.1.1 Keyboard | A | Full keyboard navigation |
| 2.1.2 No Keyboard Trap | A | Escape to close, proper tab cycling |
| 2.4.3 Focus Order | A | Logical tab order |
| 2.4.6 Headings and Labels | AA | Descriptive labels |
| 2.4.7 Focus Visible | AA | ring-2 ring-blue-500 |
| 2.5.5 Target Size | AAA | min-h-[44px] min-w-[44px] |
| 3.3.1 Error Identification | A | aria-invalid, error messages |
| 4.1.2 Name, Role, Value | A | ARIA attributes throughout |

---

## Testing Strategy

### Manual Testing Checklist

1. **Screen Reader Testing (VoiceOver/NVDA)**
   - [ ] Status icons announce their meaning
   - [ ] Language list navigation announced
   - [ ] Status changes announced via live regions
   - [ ] Modal open/close announced
   - [ ] Error messages announced

2. **Keyboard Testing**
   - [ ] Tab through all interactive elements
   - [ ] Arrow keys navigate language list
   - [ ] Escape closes panel/dialog
   - [ ] Enter activates buttons
   - [ ] Focus trapped in modals
   - [ ] Focus returns on modal close

3. **Visual Testing**
   - [ ] Focus indicators visible
   - [ ] Status distinguishable without color
   - [ ] Touch targets adequate size
   - [ ] Contrast ratios pass

### Automated Testing

```typescript
// Example test for accessibility
describe('TranslationPreviewPanel accessibility', () => {
  it('has accessible status icons', () => {
    render(<TranslationStatusItem status="completed" language="es" />);
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'Translation complete');
  });

  it('supports keyboard navigation', () => {
    render(<TranslationPreviewPanel {...props} />);
    const list = screen.getByRole('listbox');
    fireEvent.keyDown(list, { key: 'ArrowDown' });
    // Assert focus moved
  });

  it('traps focus in editor modal', () => {
    render(<TranslationEditor isOpen={true} {...props} />);
    const firstButton = screen.getAllByRole('button')[0];
    const lastButton = screen.getAllByRole('button').slice(-1)[0];

    lastButton.focus();
    fireEvent.keyDown(lastButton, { key: 'Tab' });
    expect(document.activeElement).toBe(firstButton);
  });
});
```

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Radix version incompatibility | Low | Medium | Test with current Radix version, pin if needed |
| Performance impact from live regions | Low | Low | Debounce announcements if too frequent |
| Conflicting focus management | Medium | High | Test with nested modals, use Radix for consistency |
| Screen reader differences | Medium | Medium | Test with VoiceOver (Mac), NVDA (Windows) |

---

## Estimated Effort

| Task | Estimate |
|------|----------|
| Task 1: ARIA Labels for Status Icons | 1-2 hours |
| Task 2: Keyboard Navigation | 2-3 hours |
| Task 3: Screen Reader Announcements | 2-3 hours |
| Task 4: Focus Management in Modals | 1-2 hours |
| Task 5: Focus Indicators | 1 hour |
| Task 6: Form Validation Announcements | 1 hour |
| Task 7: Accessible Names and Roles | 1-2 hours |
| Task 8: Touch Targets | 1 hour |
| Task 9: Skip Links | 30 min |
| Testing | 2-3 hours |
| **Total** | **12-17 hours** |

---

## References

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Radix UI Dialog Accessibility](https://www.radix-ui.com/primitives/docs/components/dialog#accessibility)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- Internal: `/src/components/ItemManager/utils/a11yUtils.tsx`
- Internal: `/docs/REQ-090-accessibility-audit-detailed.md`
- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
