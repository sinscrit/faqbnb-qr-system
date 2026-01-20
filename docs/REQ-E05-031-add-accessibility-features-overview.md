# REQ-E05-031: Add Accessibility Features for Translation Management Components

**Document Type:** Implementation Breakdown Overview
**Request ID:** REQ-E05-031 (Epic 5 - Owner Translation Management)
**Created:** 2026-01-20
**Last Modified:** 2026-01-20 23:59 UTC
**Phase:** 7 - Integration & Polish
**Task ID:** 7.4

---

## 1. Summary

Property owners using assistive technology need translation management components that are fully accessible through keyboard navigation, screen reader announcements, proper ARIA labeling, and focus management to ensure equal access to translation features.

This task enhances all translation management components built in Epic 5 with comprehensive accessibility features including ARIA labels for status icons, keyboard navigation in the preview panel, screen reader announcements for status changes, and proper focus management in modals.

---

## 2. Implementation Plan Reference

**Source Document:** `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
**Task Reference:** Phase 7, Task 7.4 - Add accessibility features

**Task Details from Plan:**
- ARIA labels for status icons
- Keyboard navigation in preview panel
- Screen reader announcements for status changes
- Focus management in modals

---

## 3. Dependencies

### Epic 1 (Foundation) Dependencies
- Translation tables with status columns (`items_translation`, `articles_translation`, `links_translation`)
- Translation status enum values: `'pending'`, `'processing'`, `'completed'`, `'failed'`, `'manual'`
- i18n framework (`next-intl`) for UI strings

### Epic 3 (Dynamic Content Translation) Dependencies
- Translation trigger system for job management
- Translation status tracking API

### Epic 5 Internal Dependencies (Must Be Complete First)
| Component | Location | Status Required |
|-----------|----------|-----------------|
| TranslationPreviewPanel | `/src/components/TranslationManagement/TranslationPreviewPanel/` | Must exist |
| TranslationStatusItem | `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx` | Must exist |
| TranslationProgressBar | `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationProgressBar.tsx` | Must exist |
| TranslationEditor | `/src/components/TranslationManagement/TranslationEditor/TranslationEditor.tsx` | Must exist |
| TranslationStatusWidget | `/src/components/TranslationManagement/TranslationStatusWidget/` | Must exist |
| TranslationStatusColumn | `/src/components/TranslationManagement/TranslationStatusColumn/` | Must exist |
| BulkTranslationBar | `/src/components/TranslationManagement/BulkTranslationBar/` | Must exist |
| LanguageSelectorDialog | `/src/components/TranslationManagement/BulkTranslationBar/LanguageSelectorDialog.tsx` | Must exist |
| ManualEditWarningDialog | `/src/components/TranslationManagement/ManualEditWarning/ManualEditWarningDialog.tsx` | Must exist |
| useTranslationStatus | `/src/hooks/useTranslationStatus.ts` | Must exist |
| useTranslationRealtime | `/src/hooks/useTranslationRealtime.ts` | Must exist |

---

## 4. Existing Patterns to Follow

### 4.1 Accessibility Utilities Module
**File:** `/src/components/ItemManager/utils/a11yUtils.tsx`

This codebase has a comprehensive accessibility utilities module with reusable hooks:

| Utility | Purpose | Usage for Translation Components |
|---------|---------|----------------------------------|
| `useFocusTrap` | Traps focus within a container when active, stores/restores previously focused element | Use in TranslationPreviewPanel, TranslationEditor, LanguageSelectorDialog |
| `useFocusRestore` | Simpler focus restoration on open/close | Alternative for simpler components |
| `useAnnounce` | Screen reader announcements via aria-live regions | Use for translation status change notifications |
| `createKeyboardNavigator` | Arrow key navigation handler | Use for language list navigation in preview panel |
| `useRovingTabIndex` | Roving tabindex pattern for toolbar-like groups | Use for action button groups |
| `getAriaDescribedBy` | Helper to build aria-describedby from optional IDs | Use for complex form fields |
| `FOCUSABLE_SELECTOR` | Selector for all focusable elements | Reference for focus trap implementation |

### 4.2 Radix UI Dialog Patterns
**Reference File:** `/src/components/ItemManager/components/ItemPreview/ItemPreviewModal.tsx`

Key patterns to follow:
- `role="alertdialog"` for confirmation dialogs
- `aria-modal="true"` for modal dialogs
- `aria-labelledby` and `aria-describedby` for dialog content
- Custom focus trap implementation for nested dialogs
- Escape key handling via `useEffect` with `keydown` event listener
- Focus restoration via `useRef` and `setTimeout` after dialog close

### 4.3 Status Icon Patterns
**Reference:** ItemPreviewModal and BulkMoveDialog components

```tsx
// Icon with aria-hidden for decorative elements
<MapPin className="w-4 h-4" aria-hidden="true" />

// Button with aria-label
<button aria-label="Close preview">
  <X className="w-5 h-5" />
</button>
```

### 4.4 Focus Visible Styling
**Reference:** Dashboard layout and all interactive components

```tsx
className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
// or
className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#222222] focus-visible:ring-offset-2"
```

### 4.5 Screen Reader Only Class
**Reference:** `/src/app/globals.css`

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

---

## 5. Technical Specifications

### 5.1 ARIA Labels for Status Icons

Each translation status icon must include descriptive ARIA labels:

| Status | Icon | Color | ARIA Label Format | Example |
|--------|------|-------|-------------------|---------|
| Complete | `✓` (Check) | Green `#22C55E` | "{language} translation complete" | "French translation complete" |
| Manual | `✎` (Pencil) | Purple `#8B5CF6` | "{language} translation manually edited" | "Spanish translation manually edited" |
| Pending | `⏳` (Clock) | Orange `#F59E0B` | "{language} translation pending" | "German translation pending" |
| Processing | `⏳` (Clock/Spinner) | Orange `#F59E0B` | "{language} translation in progress" | "Italian translation in progress" |
| Failed | `❌` (X) | Red `#EF4444` | "{language} translation failed, retry available" | "Portuguese translation failed, retry available" |
| Stale | `⚠️` (Warning) | Yellow `#EAB308` | "{language} translation outdated" | "French translation outdated" |
| Not Started | `○` (Empty) | Gray `#D1D5DB` | "{language} translation not started" | "German translation not started" |

**Implementation Pattern:**
```tsx
<span
  role="img"
  aria-label={`${languageName} translation ${statusLabel}`}
  className={statusColorClass}
>
  <StatusIcon className="w-4 h-4" aria-hidden="true" />
</span>
```

### 5.2 Keyboard Navigation in Preview Panel

**Required Keyboard Support:**

| Key | Action |
|-----|--------|
| `Tab` | Move focus to next interactive element |
| `Shift+Tab` | Move focus to previous interactive element |
| `Escape` | Close the panel, return focus to trigger |
| `ArrowDown` | Move focus to next language row (when in language list) |
| `ArrowUp` | Move focus to previous language row |
| `Home` | Move focus to first language row |
| `End` | Move focus to last language row |
| `Enter`/`Space` | Activate focused button (Edit, Re-translate, Retry) |

**Implementation using existing utilities:**
```tsx
import { useFocusTrap, createKeyboardNavigator, useRovingTabIndex } from '@/components/ItemManager/utils/a11yUtils';

// In TranslationPreviewPanel:
const panelRef = useRef<HTMLDivElement>(null);
useFocusTrap(panelRef, isOpen);

const { currentIndex, setIndex, handleKeyDown } = useRovingTabIndex(languages.length);

// For language list navigation
const handleListKeyDown = createKeyboardNavigator({
  orientation: 'vertical',
  wrap: true,
  itemCount: languages.length,
  currentIndex,
  onNavigate: setIndex,
});
```

### 5.3 Screen Reader Announcements

**Events Requiring Announcements:**

| Event | Announcement | Politeness |
|-------|--------------|------------|
| Translation job started | "{count} translation job(s) started" | polite |
| Single translation complete | "{language} translation completed successfully" | polite |
| Translation failed | "{language} translation failed, retry available" | assertive |
| Bulk operation complete | "{count} translation jobs queued successfully" | polite |
| Manual edit saved | "{language} translation saved as manual edit" | polite |
| Panel opened | "Translation preview panel opened for {entityName}" | polite |
| Panel closed | "Translation preview panel closed" | polite |

**Implementation using useAnnounce:**
```tsx
import { useAnnounce } from '@/components/ItemManager/utils/a11yUtils';

function TranslationPreviewPanel() {
  const { announce, AnnouncerRegion } = useAnnounce();

  // On translation complete (from realtime subscription)
  useEffect(() => {
    if (translationCompleted) {
      announce(`${languageName} translation completed successfully`);
    }
  }, [translationCompleted, languageName, announce]);

  // On translation failed
  useEffect(() => {
    if (translationFailed) {
      announce(`${languageName} translation failed, retry available`, 'assertive');
    }
  }, [translationFailed, languageName, announce]);

  return (
    <div>
      <AnnouncerRegion />
      {/* Panel content */}
    </div>
  );
}
```

### 5.4 Focus Management in Modals

**Focus Management Requirements:**

| Modal/Dialog | Initial Focus | Focus on Close |
|--------------|---------------|----------------|
| TranslationPreviewPanel | Close button or first language row | Element that triggered panel open |
| TranslationEditor | Translation textarea | Edit button that opened editor |
| LanguageSelectorDialog | First checkbox or "Select All" button | "Re-translate Specific Language" button |
| ManualEditWarningDialog | "Keep Manual Edits" button (safer option) | Save button that triggered warning |

**Implementation Pattern:**
```tsx
// Store trigger element ref
const triggerRef = useRef<HTMLButtonElement>(null);

// Focus first element on open
useEffect(() => {
  if (isOpen && initialFocusRef.current) {
    initialFocusRef.current.focus();
  }
}, [isOpen]);

// Restore focus on close
useEffect(() => {
  if (!isOpen && triggerRef.current) {
    triggerRef.current.focus();
  }
}, [isOpen]);
```

### 5.5 Progress Bar Accessibility

**TranslationProgressBar ARIA Requirements:**
```tsx
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
```

### 5.6 Color Contrast Requirements

All status indicators must meet WCAG AA contrast requirements:

| Element | Foreground | Background | Contrast Ratio | Requirement |
|---------|------------|------------|----------------|-------------|
| Complete icon (green) | #22C55E | White #FFFFFF | 2.5:1 | Requires text label (AA for UI components is 3:1) |
| Failed icon (red) | #EF4444 | White #FFFFFF | 3.4:1 | Passes for UI components |
| Pending icon (orange) | #F59E0B | White #FFFFFF | 2.1:1 | Requires text label |
| Manual icon (purple) | #8B5CF6 | White #FFFFFF | 3.2:1 | Passes for UI components |
| Status text labels | #374151 (gray-700) | White #FFFFFF | 7.5:1 | Passes AA |

**Mitigation:** All status indicators MUST include both icon AND text label to ensure accessibility regardless of color perception.

---

## 6. Ordered Implementation Tasks

### Task 1: Add ARIA Labels to TranslationStatusItem Component
**Priority:** High
**File:** `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx`

1. Add `role="img"` to status icon wrapper span
2. Add dynamic `aria-label` based on language and status
3. Ensure icon elements have `aria-hidden="true"`
4. Add visible text label alongside each icon for color-blind users
5. Add `title` attribute for tooltip on hover

### Task 2: Implement Keyboard Navigation in TranslationPreviewPanel
**Priority:** High
**File:** `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx`

1. Import `useFocusTrap` and `createKeyboardNavigator` from a11yUtils
2. Add `useFocusTrap` hook with panel ref and isOpen state
3. Implement `useRovingTabIndex` for language row navigation
4. Add `onKeyDown` handler for Arrow key navigation
5. Implement Escape key handling to close panel
6. Set initial focus to close button on panel open
7. Store and restore focus to trigger element on close

### Task 3: Add Screen Reader Announcements via useAnnounce
**Priority:** High
**Files:** Multiple components

**3.1 TranslationPreviewPanel:**
1. Import and use `useAnnounce` hook
2. Add `AnnouncerRegion` to component render
3. Announce panel open/close events
4. Subscribe to translation status changes and announce completions/failures

**3.2 TranslationStatusWidget:**
1. Add announcements for status count changes
2. Announce when translation jobs complete in realtime

**3.3 BulkTranslationBar:**
1. Announce when bulk operation starts
2. Announce completion with counts

### Task 4: Implement Focus Management in TranslationEditor Modal
**Priority:** High
**File:** `/src/components/TranslationManagement/TranslationEditor/TranslationEditor.tsx`

1. Add `useFocusTrap` hook with modal ref
2. Set initial focus to translation textarea on modal open
3. Store trigger button ref and restore focus on close
4. Implement Escape key to trigger cancel workflow
5. Add focus trap for Tab cycling within modal
6. Ensure confirm dialog respects focus trap when shown

### Task 5: Implement Focus Management in LanguageSelectorDialog
**Priority:** Medium
**File:** `/src/components/TranslationManagement/BulkTranslationBar/LanguageSelectorDialog.tsx`

1. Add `useFocusTrap` hook with dialog ref
2. Set initial focus to first checkbox or "Select All" button
3. Implement Arrow key navigation through checkbox list
4. Add Space key toggle for checkboxes
5. Restore focus to trigger button on close

### Task 6: Implement Focus Management in ManualEditWarningDialog
**Priority:** Medium
**File:** `/src/components/TranslationManagement/ManualEditWarning/ManualEditWarningDialog.tsx`

1. Add `useFocusTrap` hook with dialog ref
2. Set initial focus to "Keep Manual Edits" button (safer option)
3. Implement Tab cycling between buttons
4. Handle Escape key for cancel action
5. Restore focus to save button on close

### Task 7: Add ARIA Attributes to TranslationProgressBar
**Priority:** Medium
**File:** `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationProgressBar.tsx`

1. Add `role="progressbar"` to container
2. Add `aria-valuenow`, `aria-valuemin`, `aria-valuemax` attributes
3. Add `aria-label` with descriptive progress text
4. Add screen reader only text description

### Task 8: Add ARIA Labels to TranslationStatusColumn
**Priority:** Medium
**File:** `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.tsx`

1. Add `aria-label` to clickable indicator with summary text
2. Add tooltips (`title` attributes) for each language dot
3. Ensure Enter/Space key activates click handler
4. Add visible focus ring styling

### Task 9: Add ARIA Labels to TranslationStatusFilter
**Priority:** Medium
**File:** `/src/components/TranslationManagement/TranslationStatusFilter/TranslationStatusFilter.tsx`

1. Add `aria-label` to dropdown: "Filter by translation status"
2. Ensure proper label association with `htmlFor`/`id`
3. Add `aria-expanded` state for dropdown
4. Implement keyboard navigation with Arrow keys

### Task 10: Update BulkTranslationBar Accessibility
**Priority:** Medium
**File:** `/src/components/TranslationManagement/BulkTranslationBar/BulkTranslationBar.tsx`

1. Add descriptive `aria-label` to action buttons
2. Add `aria-live="polite"` region for operation progress
3. Ensure progress indicator is announced to screen readers
4. Add keyboard shortcuts for bulk actions if appropriate

### Task 11: Add Loading State Accessibility
**Priority:** Low
**Files:** All translation management components

1. Add `aria-busy="true"` to containers during async operations
2. Add `aria-label="Loading translations"` to loading spinners
3. Ensure loading state is announced to screen readers

### Task 12: Add Error State Accessibility
**Priority:** Low
**Files:** All translation management components

1. Add `role="alert"` to error message containers
2. Ensure errors are announced immediately via assertive aria-live
3. Add retry button `aria-label` with context (e.g., "Retry Spanish translation")

---

## 7. Authorized Files and Functions for Modification

### Files to Modify

| File Path | Modification Type | Functions/Sections to Modify |
|-----------|-------------------|------------------------------|
| `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx` | Modify | Add useFocusTrap, useAnnounce, keyboard handlers |
| `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx` | Modify | Add ARIA labels, role attributes, title tooltips |
| `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationProgressBar.tsx` | Modify | Add progressbar role and ARIA attributes |
| `/src/components/TranslationManagement/TranslationEditor/TranslationEditor.tsx` | Modify | Add focus management, focus trap, keyboard handlers |
| `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.tsx` | Modify | Add ARIA labels, screen reader announcements |
| `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.tsx` | Modify | Add ARIA labels, keyboard activation, tooltips |
| `/src/components/TranslationManagement/TranslationStatusFilter/TranslationStatusFilter.tsx` | Modify | Add ARIA attributes, keyboard navigation |
| `/src/components/TranslationManagement/BulkTranslationBar/BulkTranslationBar.tsx` | Modify | Add ARIA labels, live region, announcements |
| `/src/components/TranslationManagement/BulkTranslationBar/LanguageSelectorDialog.tsx` | Modify | Add focus trap, keyboard navigation |
| `/src/components/TranslationManagement/ManualEditWarning/ManualEditWarningDialog.tsx` | Modify | Add focus trap, focus management |

### Existing Files to Import From (Read Only)

| File Path | Items to Import |
|-----------|-----------------|
| `/src/components/ItemManager/utils/a11yUtils.tsx` | `useFocusTrap`, `useFocusRestore`, `useAnnounce`, `createKeyboardNavigator`, `useRovingTabIndex`, `getAriaDescribedBy`, `FOCUSABLE_SELECTOR`, `srOnlyStyles` |
| `/src/lib/utils.ts` | `cn` (className utility) |

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| None | All accessibility features will be added to existing components |

---

## 8. Acceptance Criteria Checklist

### ARIA Labels
- [ ] Translation status icons include ARIA labels describing status: "English translation complete", "Spanish translation pending", etc.
- [ ] Each status icon uses `role="img"` with descriptive `aria-label` attribute
- [ ] Translation status colors are never the only indicator (always accompanied by icon shapes and text labels)
- [ ] Color contrast ratios meet WCAG AA standards (4.5:1 for normal text, 3:1 for large text and UI components)

### Keyboard Navigation
- [ ] TranslationPreviewPanel is fully keyboard navigable with sequential tab order through all interactive elements
- [ ] Panel can be dismissed using Escape key from any focused element within panel
- [ ] Panel implements focus trap preventing tab navigation from leaving panel while open
- [ ] Panel sets focus to first actionable element when opened
- [ ] Panel returns focus to the triggering element when closed
- [ ] Each language row in preview panel is keyboard accessible via Tab key navigation
- [ ] Language row actions (Edit, Re-translate, Retry) can be activated via Enter or Space key

### Screen Reader Announcements
- [ ] Status change notifications use ARIA live regions with `aria-live="polite"` attribute
- [ ] Screen reader announces when translation job completes: "Spanish translation completed successfully"
- [ ] Screen reader announces when translation job fails: "German translation failed, retry available"
- [ ] Screen reader announces when bulk translation operation completes: "5 translation jobs queued successfully"

### Focus Management
- [ ] TranslationEditor modal implements focus trap preventing focus from leaving modal while open
- [ ] Modal sets initial focus to translation textarea on open for immediate editing
- [ ] Modal returns focus to triggering edit button when closed via save or cancel
- [ ] Modal can be dismissed via Escape key triggering cancel workflow with confirmation if dirty
- [ ] Language selection dialog maintains focus trap within checkbox list and action buttons
- [ ] Dialog sets focus to first checkbox or "Select All" button when opened
- [ ] Dialog checkbox states can be toggled using Space key when focused
- [ ] Dialog confirm button can be activated via Enter key when focused and enabled

### Progress Bar
- [ ] Widget progress bar uses `role="progressbar"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax` attributes
- [ ] Widget status counts use semantic elements with aria-labels describing metric meaning

### Form Controls
- [ ] All form inputs (language preference dropdown, editor textarea) have associated label elements
- [ ] Label associations use `htmlFor`/`id` matching or wrapped label pattern for proper screen reader identification
- [ ] Loading states include `aria-busy="true"` attribute on container elements during async operations
- [ ] Loading spinners include `aria-label="Loading translations"` or equivalent descriptive text
- [ ] Error messages include `role="alert"` to trigger immediate screen reader announcement

### General
- [ ] All interactive elements have minimum touch target size of 44x44 pixels for mobile accessibility
- [ ] Focus indicators have minimum 3:1 contrast ratio against background per WCAG 2.2 requirements
- [ ] Focus indicators are visible on all interactive elements (never removed via CSS `outline: none` without replacement)
- [ ] Status icons include `title` attributes for tooltip display on hover with descriptive text
- [ ] Tooltips are also accessible via keyboard focus with visible display when element receives focus
- [ ] Accessibility audit confirms WCAG 2.1 Level AA compliance for all translation management features

---

## 9. Testing Requirements

### Automated Testing
1. Unit tests verify ARIA attributes are present on status icons
2. Unit tests verify keyboard event handlers are called correctly
3. Unit tests verify screen reader announcements are triggered
4. Integration tests verify focus trap contains focus within modals
5. Automated accessibility testing (e.g., jest-axe) catches missing ARIA labels

### Manual Testing
1. Screen reader testing (VoiceOver on macOS, NVDA on Windows) verifies all announcements are clear
2. Keyboard-only navigation testing confirms all features are accessible without mouse
3. Color contrast verification using browser dev tools or contrast checker
4. Focus order testing ensures logical tab sequence

---

## 10. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Screen reader compatibility issues | Medium | Medium | Test with multiple screen readers (VoiceOver, NVDA, JAWS) |
| Focus trap conflicts with Radix Dialog | Low | Medium | Use Radix's built-in focus trap where possible |
| Keyboard navigation conflicts | Low | Low | Test thoroughly, ensure no conflicting handlers |
| Performance impact from announcements | Low | Low | Debounce rapid updates to prevent excessive announcements |
| Color contrast failures | Medium | Medium | Add visible text labels alongside all colored indicators |

---

## 11. References

- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- **Request Document:** `/docs/gen_requests_epic5.md` (REQ-E05-032)
- **Accessibility Utilities:** `/src/components/ItemManager/utils/a11yUtils.tsx`
- **Dialog Pattern Reference:** `/src/components/ItemManager/components/ItemPreview/ItemPreviewModal.tsx`
- **WCAG 2.1 Guidelines:** https://www.w3.org/WAI/WCAG21/quickref/
- **Radix UI Dialog Accessibility:** https://www.radix-ui.com/primitives/docs/components/dialog
