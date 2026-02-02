# L10N Epic 5 - Owner Translation Management: End-to-End Use Case Test Scenarios

**Generated:** 2026-01-25 11:45:00 UTC
**Last Modified:** 2026-01-25 11:45:00 UTC
**Epic:** L10N Epic 5 - Owner Translation Management
**Total Use Cases:** 48

---

## Overview

This document contains comprehensive end-to-end use case test scenarios for the L10N Epic 5 Owner Translation Management implementation. These scenarios validate the full user journey for property owners managing translations of their content.

### Key Features Covered
1. Translation Preview Panel (slide-in from right after save)
2. Inline Translation Editor with side-by-side comparison
3. Translation Status Dashboard Widget and filtering
4. Bulk Translation Management (re-translate, retry failed)
5. Source Language Preference Setting
6. Manual Edit Preservation with stale indicators
7. Real-time translation status updates

### Supported Languages
- English (EN) - Source
- French (FR)
- Spanish (ES)
- German (DE)
- Dutch (NL)
- Italian (IT)

---

## Category 1: Translation Preview Panel

### UC-E5-001: View Translation Preview After Saving Article
**Category:** happy-path
**Priority:** P1 - Critical

**Preconditions:**
- User is authenticated as property owner
- User has access to at least one property
- Article editor is open with existing content

**Steps:**
1. Navigate to Dashboard > Instructions > [Article]
2. Open an existing article in edit mode
3. Make a change to the article content
4. Click "Save" button
5. Observe translation preview panel slides in from right

**Expected Results:**
- Translation preview panel slides in from right (400px width)
- Source content (English) displays at top with title and description
- All 6 target languages listed below with status indicators
- Progress bar shows "X/5 Complete" (excluding source language)
- Each language row shows: flag emoji, language name, status icon, preview text snippet
- Action buttons visible for each row: Edit, Re-translate (for completed), Retry (for failed)
- Panel has close button (X) in header
- Panel has "Re-translate All" and "Close" buttons at footer

---

### UC-E5-002: View Translation Preview After Saving Item
**Category:** happy-path
**Priority:** P1 - Critical

**Preconditions:**
- User is authenticated as property owner
- User has at least one item in their property

**Steps:**
1. Navigate to Dashboard > Items
2. Click on an item to edit
3. Modify item name or description
4. Click "Save" button
5. Observe translation preview panel

**Expected Results:**
- Translation preview panel appears after save
- Item name and description shown in source language
- All 6 languages listed with current translation status
- Real-time status updates as translations process

---

### UC-E5-003: Close Translation Preview Panel
**Category:** happy-path
**Priority:** P2 - High

**Preconditions:**
- Translation preview panel is open

**Steps:**
1. Click "X" close button in panel header
2. OR Click "Close" button in panel footer
3. OR Press Escape key

**Expected Results:**
- Panel slides out to the right
- Main content area returns to full width
- No data loss or errors

---

### UC-E5-004: Real-time Translation Status Updates
**Category:** happy-path
**Priority:** P1 - Critical

**Preconditions:**
- Translation preview panel is open
- Translations are in "pending" or "processing" status

**Steps:**
1. Open translation preview panel after saving content
2. Observe translations in "pending" or "processing" state
3. Wait for background translation jobs to complete

**Expected Results:**
- Status icons update in real-time without page refresh
- Progress bar updates as translations complete
- Status changes: pending (⏳ orange) → processing → completed (✓ green)
- Preview text snippet appears when translation completes
- No manual refresh required

---

### UC-E5-005: Translation Preview Panel Persists Navigation Context
**Category:** edge-case
**Priority:** P2 - High

**Preconditions:**
- Translation preview panel is open
- User has unsaved work in panel

**Steps:**
1. Open translation preview panel
2. Begin editing a translation (but don't save)
3. Attempt to navigate away from page

**Expected Results:**
- Warning dialog appears if there's unsaved work
- User can choose to stay or leave
- If user stays, panel remains open with unsaved changes

---

## Category 2: Translation Editor (Manual Editing)

### UC-E5-006: Open Translation Editor from Preview Panel
**Category:** happy-path
**Priority:** P1 - Critical

**Preconditions:**
- Translation preview panel is open
- At least one translation has completed

**Steps:**
1. In translation preview panel, locate a completed translation row
2. Click "Edit" button on that row

**Expected Results:**
- Translation Editor modal opens (Radix Dialog)
- Modal displays side-by-side view: Original (left) | Translation (right)
- Source language label and content shown on left
- Target language label and editable textarea on right
- Character count displayed below textarea
- Save and Cancel buttons visible
- Modal is centered and has backdrop overlay

---

### UC-E5-007: Edit Translation Content
**Category:** happy-path
**Priority:** P1 - Critical

**Preconditions:**
- Translation Editor modal is open

**Steps:**
1. Click into the translation textarea
2. Modify the translation text
3. Observe character count updates
4. Click "Save" button

**Expected Results:**
- Textarea is editable and responsive
- Character count updates in real-time as user types
- Save button becomes enabled when changes are made
- After save: modal closes, panel shows updated translation
- Translation status changes to "manual" (✎ purple)
- reviewedBy field is set to current user
- Success toast/notification appears

---

### UC-E5-008: Cancel Translation Edit Without Saving
**Category:** happy-path
**Priority:** P2 - High

**Preconditions:**
- Translation Editor modal is open
- User has made changes

**Steps:**
1. Make changes to translation text
2. Click "Cancel" button

**Expected Results:**
- Confirmation dialog appears asking to discard changes
- If confirmed: modal closes, changes are discarded
- If cancelled: modal stays open, changes preserved
- Original translation remains unchanged

---

### UC-E5-009: Edit Translation with Character Limit Warning
**Category:** edge-case
**Priority:** P2 - High

**Preconditions:**
- Translation Editor modal is open

**Steps:**
1. Enter text that exceeds recommended character limit
2. Observe character count indicator

**Expected Results:**
- Character count changes color (e.g., yellow at 80%, red at 100%)
- Warning message appears if limit exceeded
- User can still save (soft limit)
- Visual indicator persists until text shortened

---

### UC-E5-010: Edit Empty Translation (Failed Status)
**Category:** edge-case
**Priority:** P2 - High

**Preconditions:**
- Translation failed and has no content

**Steps:**
1. Click "Edit" on a translation with failed status
2. Translation Editor opens with empty textarea
3. Enter manual translation
4. Click Save

**Expected Results:**
- Editor opens even for failed translations
- User can enter translation manually
- After save, status changes from "failed" to "manual"
- Translation is now available

---

### UC-E5-011: Dirty State Tracking in Editor
**Category:** edge-case
**Priority:** P3 - Medium

**Preconditions:**
- Translation Editor modal is open

**Steps:**
1. Open editor (no changes yet)
2. Observe Save button state
3. Make a change to text
4. Observe Save button state
5. Undo the change (back to original)
6. Observe Save button state

**Expected Results:**
- Save button is disabled when no changes made
- Save button becomes enabled when text differs from original
- Save button becomes disabled again if text matches original
- Dirty state indicator (asterisk or "unsaved") shows in modal title

---

## Category 3: Re-translation Actions

### UC-E5-012: Re-translate Single Translation
**Category:** happy-path
**Priority:** P1 - Critical

**Preconditions:**
- Translation preview panel is open
- At least one completed translation exists

**Steps:**
1. Locate a completed translation row
2. Click "Re-translate" (↻) button on that row

**Expected Results:**
- Confirmation dialog appears (especially if manually edited)
- After confirmation: translation status changes to "pending"
- New translation job is queued
- Real-time status updates as job processes
- New translation appears when complete

---

### UC-E5-013: Re-translate Manual Translation Warning
**Category:** edge-case
**Priority:** P1 - Critical

**Preconditions:**
- Translation has "manual" status (was manually edited)

**Steps:**
1. Click "Re-translate" button on a manually edited translation

**Expected Results:**
- Warning dialog appears: "This translation was manually edited. Re-translating will overwrite your changes."
- Options: "Keep Manual" (cancel) or "Re-translate" (confirm)
- If confirmed: manual translation is replaced
- If cancelled: manual translation is preserved

---

### UC-E5-014: Re-translate All Languages
**Category:** happy-path
**Priority:** P1 - Critical

**Preconditions:**
- Translation preview panel is open

**Steps:**
1. Click "Re-translate All" button in panel footer

**Expected Results:**
- Confirmation dialog lists all languages that will be re-translated
- Warning shown if any manual translations exist
- After confirmation: all translation statuses change to "pending"
- Multiple translation jobs queued
- Progress bar resets and updates as jobs complete

---

### UC-E5-015: Retry Failed Translation
**Category:** error-handling
**Priority:** P1 - Critical

**Preconditions:**
- At least one translation has "failed" status

**Steps:**
1. Locate translation row with failed status (❌ red)
2. Click "Retry" button

**Expected Results:**
- Translation status changes to "pending"
- New translation job is queued with same parameters
- Status updates as job processes
- If successful: translation appears
- If fails again: shows failed status with error details

---

### UC-E5-016: Handle Re-translation API Failure
**Category:** error-handling
**Priority:** P2 - High

**Preconditions:**
- Translation preview panel is open
- API endpoint is unreachable (simulated)

**Steps:**
1. Click "Re-translate" on any translation
2. Simulate network failure

**Expected Results:**
- Error toast appears with clear message
- Translation status remains unchanged
- "Retry" button available for user to try again
- No data corruption or inconsistent state

---

## Category 4: Translation Status Dashboard Widget

### UC-E5-017: View Translation Status Summary on Dashboard
**Category:** happy-path
**Priority:** P1 - Critical

**Preconditions:**
- User is authenticated as property owner
- User has at least one property with content

**Steps:**
1. Navigate to Dashboard home page
2. Locate Translation Status Widget

**Expected Results:**
- Widget displays summary card with:
  - Title: "Translation Status"
  - Progress bar showing percentage complete
  - Counts: Complete (X), Partial (X), Pending (X), Failed (X)
  - "View Details" link/button
- Widget loads with skeleton/loading state initially
- Data updates on page refresh

---

### UC-E5-018: Navigate to Translation Management from Widget
**Category:** happy-path
**Priority:** P2 - High

**Preconditions:**
- Dashboard with Translation Status Widget visible

**Steps:**
1. Click "View Details" link in Translation Status Widget

**Expected Results:**
- Navigates to /dashboard2/translations page
- Full translation management table loads
- Filters are in default state (show all)

---

### UC-E5-019: Widget Shows Property-Specific Stats
**Category:** happy-path
**Priority:** P2 - High

**Preconditions:**
- User has multiple properties
- Property selector is available in dashboard

**Steps:**
1. Select Property A from property selector
2. Observe Translation Status Widget
3. Select Property B from property selector
4. Observe Translation Status Widget

**Expected Results:**
- Widget updates to show stats for selected property
- Counts and percentages change based on property selection
- Loading indicator shows during data fetch

---

## Category 5: Translation Management Page

### UC-E5-020: View Full Translation Management Table
**Category:** happy-path
**Priority:** P1 - Critical

**Preconditions:**
- User is authenticated as property owner

**Steps:**
1. Navigate to Dashboard > Translations (from navigation)
2. OR Click "View Details" from dashboard widget

**Expected Results:**
- Full-width table displays with columns:
  - Checkbox (for selection)
  - Name (Item/Article name)
  - Type (Article/Item/Link icon)
  - Language status columns (6 columns, one per language)
  - Actions column
- Each language column shows status dot with color:
  - Blue (●) = Original/Source
  - Green (✓) = Completed
  - Purple (✎) = Manual
  - Orange (⏳) = Pending
  - Red (❌) = Failed
- Clicking status dots opens translation preview panel

---

### UC-E5-021: Filter by Translation Status
**Category:** happy-path
**Priority:** P1 - Critical

**Preconditions:**
- Translation Management page is loaded

**Steps:**
1. Locate Translation Status Filter dropdown
2. Select "Failed" from dropdown options

**Expected Results:**
- Table filters to show only items with at least one failed translation
- Filter options include: All, Fully Translated, Partially Translated, Pending, Failed, Manually Edited
- Active filter is visually indicated
- Count of filtered items shown
- "Clear Filters" option available

---

### UC-E5-022: Filter by Entity Type
**Category:** happy-path
**Priority:** P2 - High

**Preconditions:**
- Translation Management page is loaded

**Steps:**
1. Locate Type filter
2. Select "Articles" only

**Expected Results:**
- Table shows only article entities
- Item and link entities are hidden
- Can multi-select types (Articles + Items)

---

### UC-E5-023: Search Translations by Name
**Category:** happy-path
**Priority:** P2 - High

**Preconditions:**
- Translation Management page is loaded

**Steps:**
1. Enter search term in search box
2. Press Enter or wait for debounce

**Expected Results:**
- Table filters to items matching search term
- Search matches against item/article name
- Search is case-insensitive
- "No results" message shown if no matches

---

### UC-E5-024: Pagination on Translation Management Page
**Category:** happy-path
**Priority:** P2 - High

**Preconditions:**
- Property has more than 25 content items

**Steps:**
1. Navigate to Translation Management page
2. Scroll to bottom of table
3. Click page 2 or "Next" button

**Expected Results:**
- Default page size: 25 items
- Pagination controls visible at bottom
- Shows current page and total pages
- Navigation between pages works smoothly
- Scroll position maintained or reset appropriately

---

### UC-E5-025: Open Preview Panel from Status Column Click
**Category:** happy-path
**Priority:** P1 - Critical

**Preconditions:**
- Translation Management page is loaded with data

**Steps:**
1. Click on any status dot in a language column

**Expected Results:**
- Translation preview panel opens
- Panel shows that specific entity's translations
- Clicked language is highlighted or scrolled to
- Panel matches preview panel from article/item editors

---

## Category 6: Bulk Translation Operations

### UC-E5-026: Select Multiple Items for Bulk Action
**Category:** happy-path
**Priority:** P1 - Critical

**Preconditions:**
- Translation Management page is loaded

**Steps:**
1. Click checkbox on first item row
2. Click checkbox on second item row
3. OR Click "Select All" checkbox in header

**Expected Results:**
- Items are visually selected (highlighted)
- Bulk Translation Bar appears at bottom of screen
- Bar shows: "X items selected" count
- Bulk action buttons visible: "Re-translate All", "Re-translate Languages..."
- "Clear Selection" button available

---

### UC-E5-027: Bulk Re-translate All Languages
**Category:** happy-path
**Priority:** P1 - Critical

**Preconditions:**
- Multiple items selected
- Bulk Translation Bar visible

**Steps:**
1. Select 3 items with checkboxes
2. Click "Re-translate All" in Bulk Translation Bar

**Expected Results:**
- Confirmation dialog shows:
  - Number of items (3)
  - Number of translations that will be affected (3 × 5 = 15)
  - Warning if any manual translations will be overwritten
- After confirmation:
  - Progress indicator shows in bulk bar
  - "Queuing X jobs..." message
  - Status indicators update as translations complete
- Success summary: "15 translations queued"

---

### UC-E5-028: Bulk Re-translate Specific Languages
**Category:** happy-path
**Priority:** P2 - High

**Preconditions:**
- Multiple items selected

**Steps:**
1. Select 5 items
2. Click "Re-translate Languages..." button
3. Language Selector Dialog opens
4. Check FR and ES only
5. Click "Re-translate"

**Expected Results:**
- Language Selector Dialog shows:
  - Checkbox list of all target languages (5)
  - "Select All" / "Deselect All" buttons
  - Count: "2 languages selected"
- After confirmation:
  - Only FR and ES translations are re-queued
  - Other languages unchanged
  - 5 items × 2 languages = 10 jobs queued

---

### UC-E5-029: Bulk Operation with Manual Edit Warning
**Category:** edge-case
**Priority:** P1 - Critical

**Preconditions:**
- Some selected items have manual translations

**Steps:**
1. Select items including some with manual translations
2. Click "Re-translate All"

**Expected Results:**
- Warning dialog specifically lists items with manual translations
- Shows which languages have manual edits
- Option to "Skip Manual Edits" or "Overwrite All"
- If Skip: manual translations preserved, others re-translated
- If Overwrite: all translations re-translated

---

### UC-E5-030: Bulk Operation Progress Indicator
**Category:** happy-path
**Priority:** P2 - High

**Preconditions:**
- Bulk operation in progress

**Steps:**
1. Start bulk re-translate operation
2. Observe progress during processing

**Expected Results:**
- Progress bar shows in Bulk Translation Bar
- Percentage or count updates: "5/15 complete"
- Can continue using the page during operation
- Completion notification when done
- Final summary: "15/15 translations complete, 0 failed"

---

### UC-E5-031: Cancel Bulk Selection
**Category:** happy-path
**Priority:** P3 - Medium

**Preconditions:**
- Items are selected

**Steps:**
1. Click "Clear Selection" in Bulk Translation Bar
2. OR Press Escape key

**Expected Results:**
- All checkboxes deselected
- Bulk Translation Bar disappears
- Table returns to normal state

---

## Category 7: Manual Edit Preservation & Stale Detection

### UC-E5-032: Manual Translation Marked with Special Status
**Category:** happy-path
**Priority:** P1 - Critical

**Preconditions:**
- Translation was manually edited and saved

**Steps:**
1. Open translation preview for content with manual translation
2. Observe manual translation status

**Expected Results:**
- Manual translation shows purple icon (✎)
- Status text: "Manually Edited"
- Edit and Re-translate buttons available
- reviewedBy shows the user who edited

---

### UC-E5-033: Stale Translation Warning When Source Updated
**Category:** happy-path
**Priority:** P1 - Critical

**Preconditions:**
- Content has manual translations
- User is about to edit source content

**Steps:**
1. Open article/item editor for content with manual translations
2. Modify the source content
3. Click "Save"

**Expected Results:**
- ManualEditWarningDialog appears before saving
- Dialog shows:
  - List of languages with manual translations
  - Warning: "Source content has changed. Manual translations may be outdated."
  - Options: "Keep Manual Edits" | "Re-translate All"
- If Keep: saves source, manual translations kept but marked stale
- If Re-translate: saves source, queues new translations

---

### UC-E5-034: Stale Translation Indicator Display
**Category:** happy-path
**Priority:** P2 - High

**Preconditions:**
- Source content was updated after manual translation

**Steps:**
1. Open translation preview panel
2. Observe stale manual translation

**Expected Results:**
- Stale translation shows yellow border/indicator (⚠️)
- Additional text: "Translation may be outdated"
- "Update Translation" button appears
- Tooltip explains: "Source content changed since this translation was last updated"

---

### UC-E5-035: Update Stale Translation
**Category:** happy-path
**Priority:** P2 - High

**Preconditions:**
- Translation has stale indicator

**Steps:**
1. Click "Update Translation" button on stale translation
2. Translation Editor opens with source comparison
3. User reviews and updates translation
4. Click Save

**Expected Results:**
- Editor shows current source (may be different from when originally translated)
- User can compare and update
- After save: stale indicator removed
- source_version_at updated to current timestamp

---

### UC-E5-036: Stale Detection Across Multiple Languages
**Category:** edge-case
**Priority:** P2 - High

**Preconditions:**
- Content has 3 manual translations (FR, ES, DE)
- 2 automatic translations (NL, IT)

**Steps:**
1. Update source content
2. Choose "Keep Manual Edits" in warning dialog
3. View translation preview panel

**Expected Results:**
- Manual translations (FR, ES, DE) show stale indicator
- Automatic translations (NL, IT) were re-translated automatically
- Clear visual distinction between stale manual and fresh auto translations

---

## Category 8: Language Preference Settings

### UC-E5-037: Set Default Source Language Preference
**Category:** happy-path
**Priority:** P2 - High

**Preconditions:**
- User is authenticated
- Account settings page accessible

**Steps:**
1. Navigate to Account Settings or Profile
2. Locate Language Preference Section
3. Select "French (FR)" as preferred source language
4. Click Save

**Expected Results:**
- Language selector shows all supported languages
- Current preference is pre-selected
- Save button shows loading state during save
- Success message: "Language preference saved"
- Help text explains: "New content will default to this language"

---

### UC-E5-038: New Content Uses Language Preference
**Category:** happy-path
**Priority:** P2 - High

**Preconditions:**
- User has set language preference to "French"

**Steps:**
1. Create new article or item
2. Observe source language selector

**Expected Results:**
- Source language field defaults to "French"
- User can still override per-content
- Saves correctly with selected source language

---

### UC-E5-039: Language Preference Persists Across Sessions
**Category:** happy-path
**Priority:** P3 - Medium

**Preconditions:**
- User has saved language preference

**Steps:**
1. Log out
2. Log back in
3. Navigate to Account Settings

**Expected Results:**
- Language preference shows previously saved value
- Creating new content still defaults to preference

---

## Category 9: Navigation Integration

### UC-E5-040: Translations Link in Dashboard Navigation
**Category:** happy-path
**Priority:** P2 - High

**Preconditions:**
- User is authenticated as property owner

**Steps:**
1. Navigate to dashboard
2. Observe side navigation menu
3. Click "Translations" link

**Expected Results:**
- "Translations" nav item visible with Globe/Languages icon
- Active state when on translations page
- Navigates to /dashboard2/translations
- Consistent with other nav items styling

---

### UC-E5-041: Translation Status Column in Items List
**Category:** happy-path
**Priority:** P2 - High

**Preconditions:**
- User is on Items list view

**Steps:**
1. Navigate to Dashboard > Items
2. Observe item list/grid

**Expected Results:**
- Translation status column shows for each item
- Compact 6-dot indicator (one per language)
- Dots colored by status (green, orange, red, purple, blue)
- Clicking dots opens translation preview panel

---

## Category 10: Error Handling & Loading States

### UC-E5-042: Loading State in Translation Preview Panel
**Category:** happy-path
**Priority:** P2 - High

**Preconditions:**
- User action triggers translation preview

**Steps:**
1. Save content to open translation preview
2. Observe initial loading state

**Expected Results:**
- Skeleton loader or spinner shows while data loads
- Panel structure visible with placeholder content
- Loads within reasonable time (< 2 seconds)
- Transitions smoothly to loaded state

---

### UC-E5-043: Error State When Translation API Fails
**Category:** error-handling
**Priority:** P1 - Critical

**Preconditions:**
- Translation status API is unavailable

**Steps:**
1. Open translation preview panel
2. API returns error

**Expected Results:**
- Error message displayed in panel
- "Failed to load translations" with clear message
- "Retry" button available
- No crash or frozen UI
- User can close panel and continue working

---

### UC-E5-044: Handle Network Disconnect During Operations
**Category:** error-handling
**Priority:** P2 - High

**Preconditions:**
- User is in the middle of a bulk operation

**Steps:**
1. Start bulk re-translation
2. Disconnect network mid-operation

**Expected Results:**
- Error toast appears for failed requests
- Partial completion shown (X/Y completed)
- Already-queued jobs continue server-side
- Option to retry failed portions

---

### UC-E5-045: Validation Error in Translation Editor
**Category:** error-handling
**Priority:** P2 - High

**Preconditions:**
- Translation Editor is open

**Steps:**
1. Clear all text from translation textarea (make it empty)
2. Click Save

**Expected Results:**
- Validation error shown: "Translation cannot be empty"
- Save button remains disabled or shows error
- User must enter valid content to save
- No empty translations saved to database

---

## Category 11: Accessibility

### UC-E5-046: Keyboard Navigation in Preview Panel
**Category:** accessibility
**Priority:** P2 - High

**Preconditions:**
- Translation preview panel is open

**Steps:**
1. Press Tab key to navigate through panel elements
2. Press Enter/Space on Edit button
3. Press Escape to close panel

**Expected Results:**
- All interactive elements are focusable
- Visible focus indicators on each element
- Tab order is logical (top to bottom, left to right)
- Enter/Space activates buttons
- Escape closes panel and returns focus appropriately

---

### UC-E5-047: Screen Reader Announcements for Status Changes
**Category:** accessibility
**Priority:** P2 - High

**Preconditions:**
- Screen reader is active
- Translation preview panel is open

**Steps:**
1. Wait for translation status to update
2. Listen for announcements

**Expected Results:**
- ARIA live regions announce status changes
- "French translation completed" announced when status changes
- Status icons have appropriate aria-labels
- "Pending", "Completed", "Failed", "Manual" statuses clearly announced

---

### UC-E5-048: Focus Management in Modal Dialogs
**Category:** accessibility
**Priority:** P2 - High

**Preconditions:**
- Translation Editor modal is opened

**Steps:**
1. Open Translation Editor modal
2. Observe initial focus position
3. Tab through all elements
4. Close modal

**Expected Results:**
- Focus moves into modal on open
- Focus trapped within modal (cannot tab to background)
- Focus returns to trigger element on close
- First focusable element receives initial focus

---

## Summary Statistics

| Category | Count | P1 | P2 | P3 |
|----------|-------|----|----|-----|
| Translation Preview Panel | 5 | 2 | 3 | 0 |
| Translation Editor | 6 | 2 | 3 | 1 |
| Re-translation Actions | 5 | 3 | 2 | 0 |
| Dashboard Widget | 3 | 1 | 2 | 0 |
| Translation Management Page | 6 | 2 | 4 | 0 |
| Bulk Operations | 6 | 2 | 3 | 1 |
| Manual Edit Preservation | 5 | 2 | 3 | 0 |
| Language Preference | 3 | 0 | 2 | 1 |
| Navigation Integration | 2 | 0 | 2 | 0 |
| Error Handling | 4 | 1 | 3 | 0 |
| Accessibility | 3 | 0 | 3 | 0 |
| **Total** | **48** | **15** | **30** | **3** |

---

## Test Environment Requirements

- **Browser Support:** Chrome (latest), Firefox (latest), Safari (latest)
- **Device Types:** Desktop (1920×1080, 1440×900), Tablet (1024×768)
- **Network Conditions:** Normal, Slow 3G (for loading states)
- **Accessibility Tools:** VoiceOver (macOS), NVDA (Windows)
- **Test Data:** Property with 10+ items, mix of translation statuses

---

## Notes

1. Real-time updates depend on Supabase Realtime subscriptions being active
2. Translation jobs may take 5-30 seconds to complete depending on content length
3. Stale detection uses source_version_at timestamp comparison
4. Bulk operations have a soft limit of 100 items for performance

---

*Generated for FAQBNB L10N Epic 5 - Owner Translation Management*
