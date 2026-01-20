# Implementation Breakdown: REQ-E05-028 - Integrate Preview Panel into Article Editor

**Request ID:** REQ-E05-028 (originally REQ-E05-029 in gen_requests_epic5.md)
**Date:** 2026-01-20
**Type:** ENHANCEMENT
**Size:** M (Medium)
**Phase:** 7 - Integration & Polish
**Task ID:** 7.1

**Last Modified:** 2026-01-20 23:15 UTC

---

## Summary

Property owners need the translation preview panel to automatically display within the article editor after saving content changes, showing translation status for all languages and providing immediate access to translation management actions.

---

## Dependencies

### Epic Dependencies
| Dependency | Description | Status |
|------------|-------------|--------|
| Epic 1 - Foundation | Translation tables, translation service, i18n framework | Required |
| Epic 3 - Dynamic Content | Translation trigger system, status tracking API | Required |

### Component Dependencies (from Epic 5)
| Component | Location | Purpose |
|-----------|----------|---------|
| TranslationPreviewPanel | `/src/components/TranslationManagement/TranslationPreviewPanel/` | Main slide-in panel component |
| useTranslationStatus | `/src/hooks/useTranslationStatus.ts` | Fetch translation status from API |
| useTranslationRealtime | `/src/hooks/useTranslationRealtime.ts` | Supabase realtime subscription |
| TranslationManagement.types | `/src/components/TranslationManagement/TranslationManagement.types.ts` | Shared type definitions |

### API Dependencies
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/translations/status` | GET | Fetch translation status for article |
| `/api/translations/retranslate` | POST | Queue re-translation jobs |
| `/api/translations/[entityType]/[entityId]/[language]` | PUT | Manual translation update |

---

## Current State Analysis

### Existing Article Editor Structure
**File:** `/src/app/dashboard2/instructions/[articleId]/edit/page.tsx`

The article editor page currently:
1. Fetches article data on mount via `fetchArticleData()`
2. Renders `InstructionEditor` component for editing
3. Handles save via `handleSave()` which:
   - Processes payload and calls `adminApi.updateArticle()`
   - Sets session storage flag on success
   - Redirects to `/dashboard2/instructions` list page
4. No translation status visibility or panel integration

### Existing Panel Patterns
**Reference:** `/src/components/ItemManager/components/AssetPanel/AssetPanel.tsx`

The AssetPanel component provides the established pattern for slide-in panels:
- Fixed position right-side drawer (400px width on desktop)
- Backdrop overlay with click-to-close
- `transform transition-transform duration-300 ease-out` animation
- `translate-x-0` (open) / `translate-x-full` (closed) states
- Focus management with refs
- Escape key to close
- ARIA attributes for accessibility

---

## Implementation Approach

### Integration Pattern

The translation preview panel will be integrated into the article editor page with:

1. **Panel State Management**: Local state to control panel visibility
2. **Auto-Open Logic**: After successful save, check for pending/failed translations
3. **Manual Toggle**: Button in toolbar/header to open panel on demand
4. **Entity Reference**: Pass `{ entityType: 'article', entityId: articleId }` to panel

### Data Flow

```
Article Save (handleSave)
    │
    ├── Save completes successfully
    │
    ├── Set panel open state = true
    │
    └── TranslationPreviewPanel
        │
        ├── useTranslationStatus(entityType: 'article', entityId)
        │   └── Fetch status from GET /api/translations/status
        │
        ├── useTranslationRealtime(entityType: 'article', entityId)
        │   └── Subscribe to translation table changes
        │
        └── Render status for all 6 languages
            ├── Edit → Open TranslationEditor modal
            ├── Re-translate → POST /api/translations/retranslate
            └── Retry → Re-queue failed jobs
```

---

## Task Breakdown

### Task 1: Import Dependencies and Add State
**Effort:** Small

Add required imports and state variables for panel integration:

```typescript
// New imports
import { TranslationPreviewPanel } from '@/components/TranslationManagement';
import { useTranslationStatus } from '@/hooks/useTranslationStatus';

// New state
const [isTranslationPanelOpen, setIsTranslationPanelOpen] = useState(false);
const [showTranslationButton, setShowTranslationButton] = useState(false);
```

### Task 2: Modify Save Handler for Auto-Open
**Effort:** Small

Update `handleSave` to open panel after successful save instead of immediate redirect:

```typescript
const handleSave = useCallback(async (payload: UpdateArticlePayload) => {
  // ... existing save logic ...

  if (response.success) {
    console.log('Article updated successfully:', response.data);

    // Show translation panel after save (defer redirect)
    setShowTranslationButton(true);
    setIsTranslationPanelOpen(true);

    // Mark as saved for later navigation
    sessionStorage.setItem('editSuccess', 'true');
  }
}, [articleId, articleData, currentAccount]);
```

### Task 3: Add Translation Status Check for Auto-Open Logic
**Effort:** Medium

Implement logic to determine if panel should auto-open:

```typescript
// Fetch translation status after save
const { data: translationStatus, isLoading: statusLoading } = useTranslationStatus({
  entityType: 'article',
  entityId: articleId,
  enabled: showTranslationButton, // Only fetch after save
});

// Check for pending or failed translations
const hasPendingTranslations = useMemo(() => {
  if (!translationStatus?.translations) return false;
  return Object.values(translationStatus.translations).some(
    (t) => t.status === 'pending' || t.status === 'processing' || t.status === 'failed'
  );
}, [translationStatus]);

// Auto-open panel if pending translations exist
useEffect(() => {
  if (showTranslationButton && hasPendingTranslations) {
    setIsTranslationPanelOpen(true);
  }
}, [showTranslationButton, hasPendingTranslations]);
```

### Task 4: Add Manual Toggle Button
**Effort:** Small

Add "View Translations" button visible after save:

```typescript
{showTranslationButton && (
  <button
    type="button"
    onClick={() => setIsTranslationPanelOpen(true)}
    className={cn(
      'px-4 py-2 border border-gray-300 rounded-lg',
      'text-gray-700 font-medium',
      'hover:bg-gray-50 transition-colors',
      'flex items-center gap-2'
    )}
    aria-label="View translation status"
  >
    <Languages className="w-4 h-4" />
    View Translations
  </button>
)}
```

### Task 5: Integrate TranslationPreviewPanel Component
**Effort:** Medium

Add the panel component to the render tree:

```typescript
{articleData && (
  <TranslationPreviewPanel
    entityType="article"
    entityId={articleId}
    sourceLanguage={articleData.sourceLanguage || 'en'}
    sourceContent={{
      title: articleData.title,
      description: articleData.description || undefined,
    }}
    isOpen={isTranslationPanelOpen}
    onClose={() => setIsTranslationPanelOpen(false)}
    onTranslationEdited={(language) => {
      console.log(`Translation edited for ${language}`);
    }}
  />
)}
```

### Task 6: Add "Done" Navigation Flow
**Effort:** Small

Add a way for user to complete and navigate away after reviewing translations:

```typescript
const handleFinishEditing = useCallback(() => {
  setIsTranslationPanelOpen(false);
  router.push('/dashboard2/instructions');
}, [router]);

// Add "Done" button in the saved state UI
{showTranslationButton && (
  <div className="flex gap-3">
    <button onClick={() => setIsTranslationPanelOpen(true)}>
      View Translations
    </button>
    <button
      onClick={handleFinishEditing}
      className="bg-[#FF385C] text-white ..."
    >
      Done
    </button>
  </div>
)}
```

### Task 7: Keyboard Shortcut Support (Optional Enhancement)
**Effort:** Small

Add keyboard shortcut (Alt+T) to toggle panel:

```typescript
useEffect(() => {
  if (!showTranslationButton) return;

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.altKey && e.key === 't') {
      e.preventDefault();
      setIsTranslationPanelOpen(prev => !prev);
    }
  };

  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, [showTranslationButton]);
```

### Task 8: Update UI Layout for Panel Coexistence
**Effort:** Small

Ensure editor content doesn't reflow when panel opens:

```typescript
// Main content wrapper - panel overlays, doesn't push content
<div className="relative">
  <div className="flex flex-col gap-6 max-w-4xl mx-auto p-6">
    {/* Editor content */}
  </div>

  {/* Panel overlays on top with fixed positioning */}
  {articleData && (
    <TranslationPreviewPanel {...panelProps} />
  )}
</div>
```

---

## Authorized Files and Functions for Modification

### Files to Modify

| File | Modification Type | Changes |
|------|-------------------|---------|
| `/src/app/dashboard2/instructions/[articleId]/edit/page.tsx` | **MODIFY** | Add panel integration, state, save handler updates |

### Specific Functions to Modify

| Function | File | Changes |
|----------|------|---------|
| `EditArticlePage` | `page.tsx` | Add state variables, import panel components |
| `handleSave` | `page.tsx` | Add auto-open logic, defer redirect |
| Render return | `page.tsx` | Add TranslationPreviewPanel, toggle button, done button |

### New Imports Required

```typescript
// Add to imports
import { useState, useEffect, useMemo } from 'react'; // Add useMemo, useEffect
import { Languages } from 'lucide-react'; // Add Languages icon
import { TranslationPreviewPanel } from '@/components/TranslationManagement';
import { useTranslationStatus } from '@/hooks/useTranslationStatus';
```

---

## Component Dependencies (Must Exist)

These components from earlier Epic 5 tasks MUST be implemented before this task:

| Component | Task Reference | File |
|-----------|---------------|------|
| TranslationPreviewPanel | REQ-E05-007 (Task 2.2) | `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx` |
| TranslationStatusItem | REQ-E05-008 (Task 2.3) | `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx` |
| TranslationProgressBar | REQ-E05-009 (Task 2.4) | `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationProgressBar.tsx` |
| TranslationEditor | REQ-E05-010 (Task 2.5) | `/src/components/TranslationManagement/TranslationEditor/TranslationEditor.tsx` |
| useTranslationStatus | REQ-E05-011 (Task 2.6) | `/src/hooks/useTranslationStatus.ts` |
| useTranslationRealtime | REQ-E05-012 (Task 2.7) | `/src/hooks/useTranslationRealtime.ts` |
| TranslationManagement.types | REQ-E05-006 (Task 2.1) | `/src/components/TranslationManagement/TranslationManagement.types.ts` |

---

## Acceptance Criteria

From REQ-E05-029 (gen_requests_epic5.md):

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

## Visual Reference

From Implementation Plan (PRD):

```
┌─────────────────────────────────────────────────────────────────┐
│ Translations                                              [X]   │
├─────────────────────────────────────────────────────────────────┤
│ Source (English):                                               │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ How to Use the Dishwasher                                   │ │
│ │ Load dishes on the lower and upper racks...                 │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ Translations:    [3/5 Complete] ████████░░                     │
│                                                                 │
│ FR Français ✓ Completed                          [Edit] [↻]    │
│    Comment utiliser le lave-vaisselle                          │
│                                                                 │
│ ES Español ✓ Completed                           [Edit] [↻]    │
│    Como usar el lavavajillas                                   │
│                                                                 │
│ DE Deutsch ⏳ In Progress                                       │
│    Translating...                                              │
│                                                                 │
│ IT Italiano ❌ Failed                            [Retry]        │
│    Translation failed. Click to retry.                         │
│                                                                 │
│ PT Português ● Not Started                        [Translate]   │
│    No translation available                                     │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                               [Re-translate All] [Close]        │
└─────────────────────────────────────────────────────────────────┘
```

---

## Status Colors Reference

| Status | Color | Tailwind Class |
|--------|-------|----------------|
| Completed | Green | `text-green-500` (#22C55E) |
| Manual | Purple | `text-violet-500` (#8B5CF6) |
| Pending/Processing | Orange | `text-amber-500` (#F59E0B) |
| Failed | Red | `text-red-500` (#EF4444) |
| Not Started | Gray | `text-gray-400` |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Dependency components not ready | Medium | High | Verify all Epic 5 Phase 2 tasks complete before starting |
| Panel z-index conflicts | Low | Low | Use established z-index patterns (z-40 backdrop, z-50 panel) |
| Realtime subscription reliability | Medium | Low | Fallback to polling, manual refresh button in panel |
| Mobile viewport usability | Medium | Medium | Test responsive behavior, ensure touch targets are adequate |
| Save flow interruption | Low | Medium | Maintain redirect capability via "Done" button |

---

## Testing Considerations

1. **Unit Tests**: Verify panel open/close state transitions
2. **Integration Tests**: Test save → auto-open flow with mock API
3. **E2E Tests**: Full workflow from edit → save → panel → done
4. **Accessibility Tests**: Keyboard navigation, focus management, ARIA
5. **Responsive Tests**: Verify panel behavior on tablet (768px) and mobile

---

## References

- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- Request Document: `/docs/gen_requests_epic5.md` (REQ-E05-029)
- AssetPanel Pattern: `/src/components/ItemManager/components/AssetPanel/AssetPanel.tsx`
- Current Article Editor: `/src/app/dashboard2/instructions/[articleId]/edit/page.tsx`
- Radix UI Dialog: https://www.radix-ui.com/primitives/docs/components/dialog
