# Detailed Task Breakdown: REQ-E05-028 - Integrate Preview Panel into Article Editor

**Request ID:** REQ-E05-028
**Overview Document:** REQ-E05-028-integrate-preview-panel-into-article-editor-overview.md
**Date Created:** 2026-01-20
**Last Modified:** 2026-01-20 23:45 UTC
**Type:** ENHANCEMENT
**Size:** M (Medium)
**Phase:** 7 - Integration & Polish
**Task ID:** 7.1

---

## Executive Summary

This task integrates the TranslationPreviewPanel component into the article editor page (`/dashboard2/instructions/[articleId]/edit`). After saving an article, property owners will see a slide-in panel displaying translation status for all six supported languages, with real-time updates as translations complete. The panel auto-opens when pending/failed translations exist and provides manual toggle access for on-demand viewing.

---

## Prerequisites

### Required Dependencies (Must Be Completed)

| Task | Component | Location | Status Check |
|------|-----------|----------|--------------|
| REQ-E05-006 | TranslationManagement.types.ts | `/src/components/TranslationManagement/TranslationManagement.types.ts` | Verify file exists |
| REQ-E05-007 | TranslationPreviewPanel | `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx` | Verify component exports |
| REQ-E05-008 | TranslationStatusItem | `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx` | Verify component exports |
| REQ-E05-009 | TranslationProgressBar | `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationProgressBar.tsx` | Verify component exports |
| REQ-E05-010 | TranslationEditor | `/src/components/TranslationManagement/TranslationEditor/TranslationEditor.tsx` | Verify component exports |
| REQ-E05-011 | useTranslationStatus | `/src/hooks/useTranslationStatus.ts` | Verify hook exports |
| REQ-E05-012 | useTranslationRealtime | `/src/hooks/useTranslationRealtime.ts` | Verify hook exports |

### API Dependencies (from Epic 3)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/translations/status` | GET | Fetch translation status for article |
| `/api/translations/retranslate` | POST | Queue re-translation jobs |
| `/api/translations/[entityType]/[entityId]/[language]` | PUT | Manual translation update |

---

## Target File

**Primary File:** `/src/app/dashboard2/instructions/[articleId]/edit/page.tsx`

**Current State:** 255 lines, handles article editing with save → redirect flow

**Target State:** ~350-400 lines, includes translation panel integration with auto-open and manual toggle

---

## Detailed Task Breakdown

### Task 1: Add Import Statements

**Effort:** XS (Extra Small) - 0.25 Story Points
**Lines to Modify:** Lines 1-23 (imports section)

#### 1.1 Add React Hook Imports

**Current Code (line 5-6):**
```typescript
import { useEffect, useState, useCallback } from 'react';
```

**New Code:**
```typescript
import { useEffect, useState, useCallback, useMemo } from 'react';
```

#### 1.2 Add Lucide Icon Import

**Current Code (line 8):**
```typescript
import { Loader2 } from 'lucide-react';
```

**New Code:**
```typescript
import { Loader2, Languages } from 'lucide-react';
```

#### 1.3 Add Translation Component Imports

**Insert after line 9 (after InstructionEditor import):**
```typescript
import { TranslationPreviewPanel } from '@/components/TranslationManagement';
import { useTranslationStatus } from '@/hooks/useTranslationStatus';
```

#### Verification Steps:
- [ ] File compiles without import errors
- [ ] All imported components/hooks exist in their specified locations
- [ ] No circular dependency warnings

---

### Task 2: Add State Variables for Panel Management

**Effort:** S (Small) - 0.5 Story Points
**Lines to Modify:** Lines 32-36 (after existing state declarations)

#### 2.1 Add Panel State Variables

**Insert after line 35 (after `const [isSaving, setIsSaving] = useState(false);`):**

```typescript
// Translation panel state management
const [isTranslationPanelOpen, setIsTranslationPanelOpen] = useState(false);
const [showTranslationButton, setShowTranslationButton] = useState(false);
const [saveCompleted, setSaveCompleted] = useState(false);
```

**Purpose:**
- `isTranslationPanelOpen`: Controls panel visibility (open/closed)
- `showTranslationButton`: Controls whether toggle button is rendered (appears after save)
- `saveCompleted`: Tracks if save operation completed successfully (triggers status fetch)

#### Verification Steps:
- [ ] State variables initialized correctly with default values
- [ ] No TypeScript errors for state declarations
- [ ] Component re-renders appropriately when state changes

---

### Task 3: Add Translation Status Hook Integration

**Effort:** M (Medium) - 1 Story Point
**Lines to Add:** After state declarations (approximately line 40)

#### 3.1 Configure useTranslationStatus Hook

**Insert after new state variables:**

```typescript
// Fetch translation status after save is completed
const { data: translationStatus, isLoading: statusLoading } = useTranslationStatus({
  entityType: 'article',
  entityId: articleId,
  enabled: saveCompleted && !!articleId, // Only fetch after save completes
});
```

#### 3.2 Add Derived State for Pending Translations

**Insert after hook configuration:**

```typescript
// Determine if there are pending or failed translations requiring attention
const hasPendingTranslations = useMemo(() => {
  if (!translationStatus?.translations) return false;
  return Object.values(translationStatus.translations).some(
    (t) => t.status === 'pending' || t.status === 'processing' || t.status === 'failed'
  );
}, [translationStatus]);
```

#### 3.3 Add Auto-Open Effect

**Insert after derived state:**

```typescript
// Auto-open panel when pending/failed translations exist after save
useEffect(() => {
  if (saveCompleted && !statusLoading && hasPendingTranslations) {
    setIsTranslationPanelOpen(true);
  }
}, [saveCompleted, statusLoading, hasPendingTranslations]);
```

#### Verification Steps:
- [ ] Hook only fetches when `saveCompleted` is true
- [ ] Derived state correctly identifies pending/failed statuses
- [ ] Auto-open effect triggers only once per save cycle
- [ ] No infinite loops or excessive re-renders

---

### Task 4: Modify handleSave Function for Panel Integration

**Effort:** M (Medium) - 1 Story Point
**Lines to Modify:** Lines 122-182 (handleSave function)

#### 4.1 Update Success Path in handleSave

**Current Code (lines 168-175):**
```typescript
console.log('Article updated successfully:', response.data);

// Set success flag for list page
sessionStorage.setItem('editSuccess', 'true');

// Redirect to list page
router.push('/dashboard2/instructions');
```

**New Code:**
```typescript
console.log('Article updated successfully:', response.data);

// Show translation panel and button instead of immediate redirect
setShowTranslationButton(true);
setSaveCompleted(true);

// Store success flag for when user navigates to list
sessionStorage.setItem('editSuccess', 'true');

// Note: Redirect is now handled by handleFinishEditing() after panel review
```

#### Verification Steps:
- [ ] Save no longer auto-redirects on success
- [ ] Panel state flags are set correctly after successful save
- [ ] Session storage flag is still set for list page
- [ ] Error handling path remains unchanged

---

### Task 5: Add Navigation and Panel Control Functions

**Effort:** S (Small) - 0.5 Story Points
**Lines to Add:** After handleCancel function (approximately line 190)

#### 5.1 Add handleFinishEditing Function

```typescript
/**
 * Handle "Done" action - navigate to instructions list after translation review
 */
const handleFinishEditing = useCallback(() => {
  setIsTranslationPanelOpen(false);
  router.push('/dashboard2/instructions');
}, [router]);
```

#### 5.2 Add handleToggleTranslationPanel Function

```typescript
/**
 * Toggle translation preview panel visibility
 */
const handleToggleTranslationPanel = useCallback(() => {
  setIsTranslationPanelOpen((prev) => !prev);
}, []);
```

#### 5.3 Add handleTranslationEdited Callback

```typescript
/**
 * Callback when a translation is manually edited in the panel
 */
const handleTranslationEdited = useCallback((language: string) => {
  console.log(`Translation edited for language: ${language}`);
  // Status will auto-refresh via useTranslationStatus
}, []);
```

#### Verification Steps:
- [ ] handleFinishEditing correctly closes panel and navigates
- [ ] handleToggleTranslationPanel toggles boolean state correctly
- [ ] Functions are properly memoized with useCallback
- [ ] Dependencies arrays are correct

---

### Task 6: Add Keyboard Shortcut Support

**Effort:** S (Small) - 0.5 Story Points
**Lines to Add:** After navigation functions

#### 6.1 Add Keyboard Shortcut Effect

```typescript
// Keyboard shortcut (Alt+T) to toggle translation panel
useEffect(() => {
  // Only enable shortcut after save is complete
  if (!showTranslationButton) return;

  const handleKeyDown = (e: KeyboardEvent) => {
    // Alt+T to toggle translation panel
    if (e.altKey && e.key.toLowerCase() === 't') {
      e.preventDefault();
      setIsTranslationPanelOpen((prev) => !prev);
    }
  };

  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, [showTranslationButton]);
```

#### Verification Steps:
- [ ] Shortcut only works after save completes
- [ ] Alt+T correctly toggles panel open/closed
- [ ] Event listener properly cleaned up on unmount
- [ ] No conflicts with browser or editor shortcuts

---

### Task 7: Update Render Logic - Add Post-Save UI

**Effort:** M (Medium) - 1.5 Story Points
**Lines to Modify:** Lines 246-253 (main render return)

#### 7.1 Wrap InstructionEditor in Container with Panel

**Current Code (lines 246-253):**
```typescript
return (
  <InstructionEditor
    articleData={articleData}
    onSave={handleSave}
    onCancel={handleCancel}
    isSaving={isSaving}
  />
);
```

**New Code:**
```typescript
return (
  <div className="relative">
    {/* Main Editor */}
    <InstructionEditor
      articleData={articleData}
      onSave={handleSave}
      onCancel={handleCancel}
      isSaving={isSaving}
    />

    {/* Post-Save Actions Bar */}
    {showTranslationButton && (
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-30 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          {/* Status Message */}
          <div className="flex items-center gap-2 text-green-700">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Article saved successfully!</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {/* View Translations Button */}
            <button
              type="button"
              onClick={handleToggleTranslationPanel}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:ring-offset-2"
              aria-label="View translation status (Alt+T)"
              title="View translation status (Alt+T)"
            >
              <Languages className="w-4 h-4" />
              {statusLoading ? 'Loading...' : 'View Translations'}
            </button>

            {/* Done Button - Navigate to List */}
            <button
              type="button"
              onClick={handleFinishEditing}
              className="px-6 py-2 bg-[#FF385C] text-white font-medium rounded-lg hover:bg-[#E31C5F] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:ring-offset-2"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Translation Preview Panel (Slide-in from right) */}
    {articleData && (
      <TranslationPreviewPanel
        entityType="article"
        entityId={articleId}
        sourceLanguage={(articleData as any).sourceLanguage || 'en'}
        sourceContent={{
          title: articleData.title,
          description: articleData.description || undefined,
        }}
        isOpen={isTranslationPanelOpen}
        onClose={() => setIsTranslationPanelOpen(false)}
        onTranslationEdited={handleTranslationEdited}
      />
    )}
  </div>
);
```

#### 7.2 Add Bottom Padding When Post-Save Bar is Visible

The editor container should have bottom padding when the save bar is visible to prevent content overlap. Add this CSS consideration to the wrapper:

```typescript
<div className={cn('relative', showTranslationButton && 'pb-20')}>
```

**Note:** This requires importing `cn` from `@/lib/utils` if not already imported.

#### Verification Steps:
- [ ] Editor renders correctly without post-save bar initially
- [ ] Post-save bar appears after successful save
- [ ] "View Translations" button opens panel
- [ ] "Done" button navigates to instructions list
- [ ] Panel overlays correctly without layout shift
- [ ] Content is not obscured by fixed bottom bar

---

### Task 8: Handle Source Language Extraction

**Effort:** S (Small) - 0.5 Story Points
**Lines to Modify:** In fetchArticleData function and ArticleEditData type handling

#### 8.1 Ensure Source Language is Available

The `ArticleEditData` type may not include `sourceLanguage`. Update the data extraction in `fetchArticleData`:

**In fetchArticleData (around line 73), after building editData:**
```typescript
// Add source language if available from article
const editData: ArticleEditData = {
  articleId: article.id,
  itemId: item.id,
  purpose: article.purpose,
  title: article.title || '',
  description: article.description || null,
  sourceLanguage: article.source_language || 'en', // Add this line
  item: {
    id: item.id,
    name: item.name,
    tags: item.tags || [],
  },
  links: (article.links || []).map((link: any) => ({
    // ... existing link mapping
  })),
};
```

**Note:** If `ArticleEditData` type doesn't support `sourceLanguage`, use type assertion or extend the interface as needed:

```typescript
interface ExtendedArticleEditData extends ArticleEditData {
  sourceLanguage?: string;
}
```

#### Verification Steps:
- [ ] Source language is extracted from article response
- [ ] Default 'en' is used when source language is not specified
- [ ] TypeScript doesn't error on sourceLanguage access

---

### Task 9: Add Accessibility Enhancements

**Effort:** S (Small) - 0.5 Story Points

#### 9.1 Add ARIA Announcements for Status Changes

**Add after state declarations:**
```typescript
// Announce status changes to screen readers
useEffect(() => {
  if (saveCompleted && !statusLoading) {
    const message = hasPendingTranslations
      ? 'Article saved. Some translations are pending or failed.'
      : 'Article saved. All translations are up to date.';

    // Create live region announcement
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);

    // Clean up after announcement
    setTimeout(() => document.body.removeChild(announcement), 1000);
  }
}, [saveCompleted, statusLoading, hasPendingTranslations]);
```

#### 9.2 Update Button Accessibility

Ensure all buttons have proper ARIA attributes:
- `aria-label` for icon-only buttons
- `aria-expanded` for panel toggle
- `aria-controls` to link toggle to panel

**Update View Translations button:**
```typescript
<button
  type="button"
  onClick={handleToggleTranslationPanel}
  aria-expanded={isTranslationPanelOpen}
  aria-controls="translation-preview-panel"
  aria-label={`${isTranslationPanelOpen ? 'Close' : 'Open'} translation preview panel (Alt+T)`}
  // ... rest of props
>
```

#### Verification Steps:
- [ ] Screen reader announces save completion status
- [ ] Toggle button has correct aria-expanded state
- [ ] Panel has matching id for aria-controls
- [ ] Keyboard navigation works correctly

---

### Task 10: Add Error Handling for Translation Status

**Effort:** S (Small) - 0.5 Story Points

#### 10.1 Handle Translation Status Fetch Errors

**Update useTranslationStatus hook usage to handle errors:**
```typescript
const {
  data: translationStatus,
  isLoading: statusLoading,
  error: statusError,
  refresh: refreshStatus
} = useTranslationStatus({
  entityType: 'article',
  entityId: articleId,
  enabled: saveCompleted && !!articleId,
});
```

**Add error display in the post-save bar:**
```typescript
{/* Status Error Message */}
{statusError && (
  <div className="flex items-center gap-2 text-amber-700">
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
    <span className="text-sm">Unable to load translation status</span>
    <button
      onClick={refreshStatus}
      className="text-sm underline hover:no-underline"
    >
      Retry
    </button>
  </div>
)}
```

#### Verification Steps:
- [ ] Error state is captured from hook
- [ ] Error message displays in UI
- [ ] Retry button triggers status refresh
- [ ] Panel still opens despite status fetch error

---

## Complete Modified File Structure

After all tasks are complete, the file should have this structure:

```typescript
'use client';

/**
 * REQ-214: Dedicated Single-Page Edit Experience - Edit Page
 * REQ-E05-028: Translation Preview Panel Integration
 * Created: 2026-01-12
 * Last Modified: 2026-01-20
 */

// === IMPORTS (Task 1) ===
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth, useAccountContext } from '@/contexts/AuthContext';
import { adminApi } from '@/lib/api';
import { Loader2, Languages } from 'lucide-react';
import { cn } from '@/lib/utils';
import { InstructionEditor } from '@/components/InstructionEditor';
import type { ArticleEditData, UpdateArticlePayload } from '@/components/InstructionEditor';
import { TranslationPreviewPanel } from '@/components/TranslationManagement';
import { useTranslationStatus } from '@/hooks/useTranslationStatus';

export default function EditArticlePage() {
  // === ROUTING & AUTH ===
  const router = useRouter();
  const params = useParams();
  const articleId = params.articleId as string;
  const { user } = useAuth();
  const { currentAccount } = useAccountContext();

  // === EXISTING STATE ===
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [articleData, setArticleData] = useState<ArticleEditData | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // === TRANSLATION PANEL STATE (Task 2) ===
  const [isTranslationPanelOpen, setIsTranslationPanelOpen] = useState(false);
  const [showTranslationButton, setShowTranslationButton] = useState(false);
  const [saveCompleted, setSaveCompleted] = useState(false);

  // === TRANSLATION STATUS HOOK (Task 3) ===
  const { data: translationStatus, isLoading: statusLoading, error: statusError, refresh: refreshStatus } = useTranslationStatus({...});
  const hasPendingTranslations = useMemo(() => {...}, [translationStatus]);

  // === AUTO-OPEN EFFECT (Task 3) ===
  useEffect(() => {...}, [saveCompleted, statusLoading, hasPendingTranslations]);

  // === ACCESSIBILITY ANNOUNCEMENT (Task 9) ===
  useEffect(() => {...}, [saveCompleted, statusLoading, hasPendingTranslations]);

  // === KEYBOARD SHORTCUT (Task 6) ===
  useEffect(() => {...}, [showTranslationButton]);

  // === DATA FETCHING ===
  const fetchArticleData = useCallback(async (articleId: string) => {...}, [user, currentAccount]);

  // === AUTH CHECK EFFECT ===
  useEffect(() => {...}, [user, router]);

  // === FETCH ON MOUNT EFFECT ===
  useEffect(() => {...}, [articleId, user, fetchArticleData]);

  // === SAVE HANDLER (Task 4 - Modified) ===
  const handleSave = useCallback(async (payload: UpdateArticlePayload) => {...}, [articleId, articleData, currentAccount]);

  // === CANCEL HANDLER ===
  const handleCancel = useCallback(() => {...}, [router]);

  // === NEW HANDLERS (Task 5) ===
  const handleFinishEditing = useCallback(() => {...}, [router]);
  const handleToggleTranslationPanel = useCallback(() => {...}, []);
  const handleTranslationEdited = useCallback((language: string) => {...}, []);

  // === RENDER LOADING/ERROR STATES ===
  if (!user) return <LoadingRedirect />;
  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;
  if (!articleData) return null;

  // === MAIN RENDER (Task 7) ===
  return (
    <div className={cn('relative', showTranslationButton && 'pb-20')}>
      <InstructionEditor {...} />
      {showTranslationButton && <PostSaveBar {...} />}
      {articleData && <TranslationPreviewPanel {...} />}
    </div>
  );
}
```

---

## Testing Requirements

### Unit Tests

| Test Case | Description | Expected Result |
|-----------|-------------|-----------------|
| Panel State Init | Panel closed by default | `isTranslationPanelOpen === false` |
| Toggle Button Hidden | Toggle hidden before save | `showTranslationButton === false` initially |
| Save Shows Toggle | Toggle appears after save | `showTranslationButton === true` after save |
| Auto-Open Pending | Panel opens for pending translations | Opens when `hasPendingTranslations === true` |
| Auto-Close Complete | Panel stays closed when all complete | Stays closed when `hasPendingTranslations === false` |
| Manual Toggle | Button toggles panel | Clicking toggles `isTranslationPanelOpen` |
| Keyboard Shortcut | Alt+T toggles panel | Panel toggles on Alt+T after save |
| Done Navigation | Done button navigates | Redirects to `/dashboard2/instructions` |

### Integration Tests

| Test Case | Description | Expected Result |
|-----------|-------------|-----------------|
| Save → Panel Flow | Complete save and panel auto-open | Panel opens when pending translations exist |
| Edit → Close → Done | Open panel, close, then done | Navigation works correctly |
| API Error Handling | Status fetch fails | Error displayed with retry option |
| Multiple Save Cycles | Save, close, edit, save again | Panel behavior resets correctly |

### E2E Tests

| Test Case | Description | Expected Result |
|-----------|-------------|-----------------|
| Full Edit Workflow | Edit article → Save → Review translations → Done | Complete flow works |
| Accessibility Flow | Keyboard-only navigation through flow | All interactions accessible |
| Mobile Responsive | Test on 768px viewport | Panel and bar render correctly |

---

## Rollback Plan

If issues are discovered after deployment:

1. **Quick Disable:** Comment out or remove the following additions:
   - TranslationPreviewPanel component render
   - Post-save action bar render
   - All new useEffect hooks

2. **Restore Original Save Behavior:**
   ```typescript
   // In handleSave success path, restore:
   router.push('/dashboard2/instructions');
   ```

3. **Remove Imports:** Remove unused imports to clean up

---

## Acceptance Criteria Checklist

From REQ-E05-029 in gen_requests_epic5.md:

- [ ] TranslationPreviewPanel component is integrated into article editor page
- [ ] Panel component receives article entity reference (entityType: 'article', entityId: articleId)
- [ ] Panel state management controls when panel is visible or hidden
- [ ] Panel automatically opens after successful article save operation completes
- [ ] Panel auto-open logic checks if any translation jobs are pending or failed
- [ ] Panel opens automatically only when pending or failed translations exist
- [ ] Panel remains closed after save when all translations are complete and up-to-date
- [ ] Manual toggle button displays in article editor header or toolbar area
- [ ] Manual toggle button shows "View Translations" or similar descriptive label
- [ ] Clicking toggle button opens panel regardless of automatic open conditions
- [ ] Panel slide-in animation triggers smoothly without disrupting editor layout
- [ ] Panel overlays editor content without causing layout reflow or shifting
- [ ] Panel remains accessible while editor is in edit mode for parallel workflows
- [ ] Panel close button dismisses panel and returns focus to editor content
- [ ] Clicking overlay backdrop outside panel closes panel
- [ ] Panel updates in real-time as translation jobs complete through subscriptions
- [ ] Panel integration preserves existing article editor save functionality
- [ ] Panel displays loading state while fetching translation status after save
- [ ] Panel handles error states gracefully if status fetch fails
- [ ] Panel shows empty state appropriately for newly created articles without translations yet
- [ ] Panel action buttons (edit, re-translate, retry) function correctly within editor context
- [ ] Panel width (400px) does not obscure critical editor controls on standard viewports
- [ ] Panel adapts responsively for tablet viewports maintaining usability
- [ ] Integration includes keyboard shortcuts for opening/closing panel (e.g., Alt+T)
- [ ] Panel keyboard accessibility works correctly within editor context
- [ ] Focus management handles transitions between editor and panel appropriately
- [ ] Panel z-index ensures it overlays editor content without being obscured by other UI elements
- [ ] Integration maintains editor performance without noticeable lag during panel operations
- [ ] Component handles edge cases like deleted articles or missing permissions gracefully
- [ ] Panel displays correctly in both light and dark theme contexts if themes are supported
- [ ] Integration follows consistent patterns with item editor translation panel integration (Task 7.2)

---

## Effort Summary

| Task | Description | Effort | Story Points |
|------|-------------|--------|--------------|
| 1 | Add Import Statements | XS | 0.25 |
| 2 | Add State Variables | S | 0.5 |
| 3 | Translation Status Hook Integration | M | 1.0 |
| 4 | Modify handleSave Function | M | 1.0 |
| 5 | Add Navigation/Control Functions | S | 0.5 |
| 6 | Keyboard Shortcut Support | S | 0.5 |
| 7 | Update Render Logic | M | 1.5 |
| 8 | Source Language Extraction | S | 0.5 |
| 9 | Accessibility Enhancements | S | 0.5 |
| 10 | Error Handling | S | 0.5 |
| **Total** | | | **6.75** |

**Estimated Time:** 4-6 hours for experienced developer

---

## References

- Overview Document: `docs/REQ-E05-028-integrate-preview-panel-into-article-editor-overview.md`
- Request Document: `docs/gen_requests_epic5.md` (REQ-E05-029)
- Implementation Plan: `docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- AssetPanel Pattern: `/src/components/ItemManager/components/AssetPanel/AssetPanel.tsx`
- Current Article Editor: `/src/app/dashboard2/instructions/[articleId]/edit/page.tsx`
- Radix UI Dialog: https://www.radix-ui.com/primitives/docs/components/dialog

---

*Document generated for FAQBNB Localization Epic 5 - Task 7.1: Integrate Preview Panel into Article Editor*
