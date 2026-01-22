# REQ-E05-028: Integrate Preview Panel into Article Editor - Implementation Breakdown

**Request ID**: REQ-E05-028
**Epic**: Epic 5 - Owner Translation Management
**Phase**: Phase 7 - Integration & Polish
**Task**: Task 7.1 - Integrate preview panel into article editor
**Created**: 2026-01-22 20:32
**Status**: PENDING

---

## Goal

Integrate the TranslationPreviewPanel component into the article editor page (`/dashboard2/instructions/[articleId]/edit`), enabling property owners to view and manage translations directly from the editing interface. The panel should auto-open after saving when there are pending, stale, or failed translations, providing seamless translation workflow visibility.

---

## Implementation Plan

### Step 1: Add Translation State Management

**File**: `/src/app/dashboard2/instructions/[articleId]/edit/page.tsx` (lines 15-36)

**Rationale**: Add state variables to control the translation panel visibility and track translation status.

**Implementation**:

Add new imports at the top:
```typescript
import { TranslationPreviewPanel } from '@/components/TranslationManagement/TranslationPreviewPanel';
import { useTranslationStatus } from '@/hooks/useTranslationStatus';
import { Globe } from 'lucide-react'; // For translations button icon
import type { EntityStatusSummary } from '@/app/api/translations/status/batch/types';
```

Add new state variables after existing state (around line 36):
```typescript
// Translation panel state
const [isPanelOpen, setIsPanelOpen] = useState(false);
const [shouldAutoOpenPanel, setShouldAutoOpenPanel] = useState(false);

// Use the translation status hook for the current article
const {
  status: translationStatus,
  isLoading: statusLoading,
  refetch: refetchStatus
} = useTranslationStatus({
  entityType: 'article',
  entityId: articleId,
  enabled: !!articleId && !loading,
});
```

**Estimated Effort**: 30 minutes

---

### Step 2: Implement Auto-Open Logic

**File**: `/src/app/dashboard2/instructions/[articleId]/edit/page.tsx`

**Rationale**: Automatically open panel after save when translations need attention (pending, failed, or stale).

**Implementation**:

Add useEffect for auto-open logic after state declarations:

```typescript
// Auto-open panel after save if translations need attention
useEffect(() => {
  if (shouldAutoOpenPanel && translationStatus) {
    // Auto-open if:
    // 1. There are pending translations
    // 2. There are failed translations
    // 3. Overall status indicates issues
    const shouldOpen =
      (translationStatus.pendingCount && translationStatus.pendingCount > 0) ||
      (translationStatus.failedCount && translationStatus.failedCount > 0) ||
      translationStatus.status === 'pending' ||
      translationStatus.status === 'has_failures';

    if (shouldOpen) {
      setIsPanelOpen(true);
      console.log('Auto-opening translation panel:', {
        pendingCount: translationStatus.pendingCount,
        failedCount: translationStatus.failedCount,
        status: translationStatus.status
      });
    }

    // Reset flag after checking
    setShouldAutoOpenPanel(false);
  }
}, [shouldAutoOpenPanel, translationStatus]);
```

**Key Design Decision**: Auto-open only triggers once per save operation, not on every status refresh. This prevents the panel from repeatedly opening during polling.

**Estimated Effort**: 1 hour

---

### Step 3: Update handleSave to Trigger Auto-Open

**File**: `/src/app/dashboard2/instructions/[articleId]/edit/page.tsx` (lines 123-184)

**Rationale**: After successful save, refresh translation status and trigger auto-open check.

**Implementation**:

Modify the `handleSave` function (around line 171):

```typescript
// After successful save
console.log('Article updated successfully:', response.data);

// NEW: Trigger translation status refresh and auto-open check
refetchStatus();
setShouldAutoOpenPanel(true);

// Set success flag for list page
sessionStorage.setItem('editSuccess', 'true');

// Option: Stay on page instead of redirecting to allow panel interaction
// For now, keep existing redirect behavior
// router.push('/dashboard2/instructions');

// Consider: Show success message and stay on page if panel will auto-open
if (translationStatus?.pendingCount || translationStatus?.failedCount) {
  // Stay on page to show panel
  console.log('Staying on page to show translation panel');
} else {
  // Redirect to list page
  router.push('/dashboard2/instructions');
}
```

**Alternative Approach**: Always stay on page after save to allow translation management. This provides better UX for translation workflows but changes current behavior.

**Decision Required**: Should we always stay on page after save, or only when translations need attention?

**Estimated Effort**: 1 hour

---

### Step 4: Add Translations Button to Editor Interface

**File**: `/src/app/dashboard2/instructions/[articleId]/edit/page.tsx` (lines 248-256)

**Rationale**: Provide manual access to translation panel via prominent button in editor interface.

**Implementation**:

Modify the return statement to add button wrapper:

```typescript
return (
  <>
    {/* Translations Button - Positioned above editor */}
    <div className="max-w-5xl mx-auto px-4 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPanelOpen(true)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg',
              'border border-gray-300 bg-white',
              'hover:bg-gray-50 transition-colors',
              'text-gray-700 font-medium text-sm'
            )}
            aria-label={t('editor.translationsTooltip')}
          >
            <Globe className="w-4 h-4" />
            <span>{t('editor.translations')}</span>

            {/* Show pending count badge */}
            {translationStatus?.pendingCount && translationStatus.pendingCount > 0 && (
              <span className="inline-flex items-center justify-center px-2 py-0.5 ml-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                {translationStatus.pendingCount}
              </span>
            )}

            {/* Show failed count badge */}
            {translationStatus?.failedCount && translationStatus.failedCount > 0 && (
              <span className="inline-flex items-center justify-center px-2 py-0.5 ml-1 text-xs font-medium rounded-full bg-red-100 text-red-700">
                {translationStatus.failedCount}
              </span>
            )}
          </button>

          {/* Optional: Status indicator */}
          {statusLoading && (
            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
          )}
        </div>
      </div>
    </div>

    {/* InstructionEditor Component */}
    <InstructionEditor
      articleData={articleData}
      onSave={handleSave}
      onCancel={handleCancel}
      isSaving={isSaving}
    />

    {/* Translation Preview Panel */}
    <TranslationPreviewPanel
      entityId={articleId}
      entityType="article"
      isOpen={isPanelOpen}
      onClose={() => setIsPanelOpen(false)}
      onEdit={(language) => {
        // Navigate to translation edit for this language
        // TODO: Implement translation edit page routing
        router.push(`/dashboard2/translations/article/${articleId}/${language}/edit`);
      }}
      onRetranslate={async (language) => {
        // Trigger re-translation via API
        try {
          const response = await fetch('/api/translations/retry', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              entityType: 'article',
              entityId: articleId,
              languages: [language],
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to re-translate');
          }

          // Refresh status after triggering re-translation
          refetchStatus();
        } catch (error) {
          console.error('Error re-translating:', error);
          // TODO: Show error toast
        }
      }}
      onRetry={async (language) => {
        // Retry failed translation
        try {
          const response = await fetch('/api/translations/retry', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              entityType: 'article',
              entityId: articleId,
              languages: [language],
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to retry translation');
          }

          // Refresh status after retry
          refetchStatus();
        } catch (error) {
          console.error('Error retrying translation:', error);
          // TODO: Show error toast
        }
      }}
    />
  </>
);
```

**Key Design Decisions**:
- Button positioned above editor for easy access
- Badges show pending/failed counts for at-a-glance status
- Loading indicator shows when status is being fetched
- Panel handlers integrated with existing API endpoints

**Estimated Effort**: 2-3 hours

---

### Step 5: Add Translation Keys for All Locales

**Files**: `/messages/en.json`, `/messages/es.json`, `/messages/fr.json`, `/messages/de.json`, `/messages/it.json`, `/messages/nl.json`

**Rationale**: Support i18n for new UI text.

**Implementation**:

Add to each locale file under `"articles"` namespace:

**English (`/messages/en.json`)**:
```json
{
  "articles": {
    "editor": {
      "translations": "Translations",
      "translationsTooltip": "View and manage translations for this article",
      "pendingTranslations": "{count, plural, one {# translation pending} other {# translations pending}}",
      "staleTranslations": "Some translations may be outdated"
    }
  }
}
```

**Spanish (`/messages/es.json`)**:
```json
{
  "articles": {
    "editor": {
      "translations": "Traducciones",
      "translationsTooltip": "Ver y gestionar las traducciones de este artículo",
      "pendingTranslations": "{count, plural, one {# traducción pendiente} other {# traducciones pendientes}}",
      "staleTranslations": "Algunas traducciones pueden estar desactualizadas"
    }
  }
}
```

**French (`/messages/fr.json`)**:
```json
{
  "articles": {
    "editor": {
      "translations": "Traductions",
      "translationsTooltip": "Afficher et gérer les traductions de cet article",
      "pendingTranslations": "{count, plural, one {# traduction en attente} other {# traductions en attente}}",
      "staleTranslations": "Certaines traductions peuvent être obsolètes"
    }
  }
}
```

**German (`/messages/de.json`)**:
```json
{
  "articles": {
    "editor": {
      "translations": "Übersetzungen",
      "translationsTooltip": "Übersetzungen für diesen Artikel anzeigen und verwalten",
      "pendingTranslations": "{count, plural, one {# Übersetzung ausstehend} other {# Übersetzungen ausstehend}}",
      "staleTranslations": "Einige Übersetzungen sind möglicherweise veraltet"
    }
  }
}
```

**Italian (`/messages/it.json`)**:
```json
{
  "articles": {
    "editor": {
      "translations": "Traduzioni",
      "translationsTooltip": "Visualizza e gestisci le traduzioni per questo articolo",
      "pendingTranslations": "{count, plural, one {# traduzione in sospeso} other {# traduzioni in sospeso}}",
      "staleTranslations": "Alcune traduzioni potrebbero essere obsolete"
    }
  }
}
```

**Dutch (`/messages/nl.json`)**:
```json
{
  "articles": {
    "editor": {
      "translations": "Vertalingen",
      "translationsTooltip": "Bekijk en beheer vertalingen voor dit artikel",
      "pendingTranslations": "{count, plural, one {# vertaling in behandeling} other {# vertalingen in behandeling}}",
      "staleTranslations": "Sommige vertalingen kunnen verouderd zijn"
    }
  }
}
```

**Estimated Effort**: 1 hour

---

### Step 6: Add Integration Tests

**File**: `/src/app/dashboard2/instructions/[articleId]/edit/__tests__/page.integration.test.tsx` (NEW)

**Rationale**: Verify translation panel integration behaves correctly.

**Test Cases**:
1. **Rendering Tests**:
   - Translations button renders in editor interface
   - Button shows Globe icon and "Translations" label
   - Clicking button opens TranslationPreviewPanel
   - Panel displays correct entityId and entityType="article"

2. **Status Display Tests**:
   - Pending count badge displays when pendingCount > 0
   - Failed count badge displays when failedCount > 0
   - Loading indicator shows while status is loading
   - No badges shown when all translations complete

3. **Auto-Open Tests**:
   - Panel auto-opens after save when pendingCount > 0
   - Panel auto-opens after save when failedCount > 0
   - Panel auto-opens after save when status is 'pending'
   - Panel auto-opens after save when status is 'has_failures'
   - Panel does NOT auto-open when all translations are complete
   - Auto-open only triggers once per save (not on every status refresh)

4. **Panel Interaction Tests**:
   - onClose closes the panel
   - onEdit navigates to translation edit page
   - onRetranslate calls retry API and refetches status
   - onRetry calls retry API for failed translations and refetches status

5. **Error Handling Tests**:
   - Handles missing articleId gracefully
   - Handles translation status fetch errors
   - Handles retry API errors
   - Page continues functioning if translation features unavailable

**Estimated Effort**: 3-4 hours

---

### Step 7: Manual Testing Checklist

**Rationale**: Verify all acceptance criteria before deployment.

**Test Scenarios**:

1. **Button Visibility and Interaction**:
   - ✅ Navigate to article edit page
   - ✅ "Translations" button visible above editor
   - ✅ Button shows Globe icon
   - ✅ Click button opens TranslationPreviewPanel
   - ✅ Panel shows article translations

2. **Status Badges**:
   - Edit article and save (triggers translations)
   - ✅ Pending count badge appears on button (e.g., "3")
   - ✅ Badge color is blue for pending
   - Wait for translation to fail (simulate error)
   - ✅ Failed count badge appears in red

3. **Auto-Open After Save**:
   - Edit article title
   - Click Save
   - ✅ Panel automatically opens (translations pending)
   - ✅ Panel shows translation status for all 6 languages
   - Close panel, edit again, save
   - ✅ Panel auto-opens again (only once per save)

4. **Panel Actions**:
   - Open panel
   - Click "Edit" for French translation
   - ✅ Navigates to translation edit page (or shows TODO if not implemented)
   - Return to editor, open panel
   - Click "Re-translate" for Spanish
   - ✅ Triggers re-translation API
   - ✅ Status refreshes after API call
   - Click "Retry" for failed translation
   - ✅ Triggers retry API
   - ✅ Status refreshes

5. **Panel Closing**:
   - Open panel
   - Click close button (X)
   - ✅ Panel closes
   - Open panel
   - Press ESC key
   - ✅ Panel closes
   - Open panel
   - Click outside panel (if overlay mode)
   - ✅ Panel closes

6. **Error Handling**:
   - Simulate translation status API error (network offline)
   - ✅ Button still renders
   - ✅ No crash, graceful degradation
   - ✅ Can still edit and save article

7. **Responsive Design**:
   - View on mobile (< 640px)
   - ✅ Button layout remains usable
   - ✅ Panel renders correctly on mobile
   - ✅ Touch interactions work

8. **i18n Verification**:
   - Switch UI language to each locale
   - ✅ Button label translates correctly
   - ✅ Tooltip text translates correctly

**Estimated Effort**: 2-3 hours

---

## Authorized Files for Modification

### Existing Files to Modify
1. `/src/app/dashboard2/instructions/[articleId]/edit/page.tsx` (main implementation)
   - Lines 15-36: Add imports and state variables
   - Lines 123-184: Update handleSave function
   - Lines 248-256: Replace simple return with button + panel integration

2. `/messages/en.json` - Add English translation keys
3. `/messages/es.json` - Add Spanish translation keys
4. `/messages/fr.json` - Add French translation keys
5. `/messages/de.json` - Add German translation keys
6. `/messages/it.json` - Add Italian translation keys
7. `/messages/nl.json` - Add Dutch translation keys

### New Files to Create
1. `/src/app/dashboard2/instructions/[articleId]/edit/__tests__/page.integration.test.tsx` - Integration tests

### Files to Reference (No Changes)
- `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx` - Component to integrate (REQ-E05-007)
- `/src/hooks/useTranslationStatus.ts` - Hook for fetching status (REQ-E05-011)
- `/src/app/api/translations/status/batch/types.ts` - EntityStatusSummary type
- `/src/app/api/translations/retry/route.ts` - Re-translate API endpoint (REQ-E05-003)
- `/src/components/InstructionEditor/InstructionEditor.tsx` - Existing editor component

---

## Dependencies

### Required (Must Be Complete First)
- **REQ-E05-007**: TranslationPreviewPanel Component ✅ (must exist)
- **REQ-E05-011**: useTranslationStatus Hook ✅ (must exist)
- **REQ-E05-001**: Translation Status API ✅ (must exist)
- **REQ-E05-003**: Re-Translate API Endpoint ✅ (must exist)
- **REQ-E05-006**: TranslationManagement Types ✅ (must exist)

### Blocks (Requires This First)
- None - This is an integration task that completes Phase 7, Task 7.1

### Parallel Safety
- **Files touched**: Article edit page + locale files
- **Conflicts with**: REQ-E05-029 (Item editor integration) - Different files, no conflict
- **Safe to parallelize with**: REQ-E05-029 and other Phase 7 tasks

### External Dependencies
- **Translation Status API**: Must return EntityStatusSummary with pendingCount, failedCount, status
- **Retry API**: Must accept entityType, entityId, languages array
- **Router**: Next.js router for navigation

---

## Technical Risks

### 1. TranslationPreviewPanel Component Not Ready
**Risk**: If REQ-E05-007 isn't complete, integration will fail.

**Mitigation**:
- Verify component exists before starting implementation
- Add fallback UI if component import fails
- Component has clear prop interface documentation

**Impact**: High - Blocks entire task if component missing.

---

### 2. useTranslationStatus Hook Performance
**Risk**: Hook may poll too frequently, causing performance issues or rate limiting.

**Mitigation**:
- Hook should have configurable polling interval
- Only poll while panel is open
- Disable hook when editor is loading or saving
- Respect API rate limits

**Impact**: Medium - Could degrade UX if polling is aggressive.

---

### 3. Auto-Open Logic Triggers Too Often
**Risk**: Panel repeatedly opening could annoy users.

**Mitigation**:
- Only auto-open once per save operation via `shouldAutoOpenPanel` flag
- Don't auto-open on every status refresh
- Consider adding user preference to disable auto-open (future enhancement)

**Impact**: Low - Flag-based logic prevents repeated opens.

---

### 4. Navigation After Save Behavior Change
**Risk**: Currently page redirects to list after save. Staying on page changes UX.

**Mitigation**:
- **Option A**: Always stay on page after save (better for translation workflow)
- **Option B**: Only stay if translations need attention (conditional)
- **Option C**: Keep current redirect, let users manually open panel from list

**Decision Required**: Which approach provides best UX?

**Impact**: Medium - Changes existing user workflow.

---

### 5. Missing Translation Edit Page Routes
**Risk**: onEdit handler navigates to translation edit page that may not exist yet.

**Mitigation**:
- Document TODO for translation edit page routing
- Show "Not implemented" message if route doesn't exist
- Plan translation edit page as separate task

**Impact**: Low - Can be stubbed out initially.

---

## Out of Scope

### 1. Translation Edit Page Implementation
This task integrates the translation panel into the editor but does NOT implement the translation edit pages that the panel's "Edit" button navigates to.

**Rationale**: Translation edit page is a separate feature (likely in Phase 4 or 5). This task only provides navigation hooks.

**Future Task**: REQ-E05-015 or similar for translation edit pages.

---

### 2. Real-Time Translation Status Updates
This implementation relies on polling via useTranslationStatus hook. Real-time updates via WebSocket are out of scope.

**Rationale**: Polling is simpler and sufficient for MVP. Real-time updates add complexity.

**Future Enhancement**: Add WebSocket support for instant status updates.

---

### 3. Translation History/Diff View
The panel shows current translation status but does NOT show translation history or diff view (before/after changes).

**Rationale**: Not part of Phase 7 requirements. Focus on current status visibility.

**Future Enhancement**: Add translation history panel in Phase 8+.

---

### 4. Bulk Translation Actions
This integration allows per-language actions (edit, re-translate, retry) but NOT bulk actions (e.g., "Re-translate all languages").

**Rationale**: Bulk actions are part of Translation Management page (REQ-E05-020), not editor integration.

---

### 5. Stale Translation Detection Visual Indicators
While auto-open triggers for stale translations, this task does NOT add visual indicators showing which specific translations are stale within the panel.

**Rationale**: Stale indicator is part of REQ-E05-023 (Implement Stale Translation Indicator). This task only triggers auto-open.

**Dependency**: REQ-E05-023 must be complete for stale visual indicators.

---

### 6. Translation Workflow Preferences
This task does NOT add user preferences for auto-open behavior (e.g., "Always auto-open", "Never auto-open", "Only for failures").

**Rationale**: Preferences are account-level settings (Phase 6). Keep auto-open logic simple for MVP.

**Future Enhancement**: Add preference toggle in Account Settings.

---

## Notes

### Auto-Open Trigger Conditions
Panel auto-opens when ANY of these conditions are true after save:
1. `translationStatus.pendingCount > 0` - Translations in progress
2. `translationStatus.failedCount > 0` - Translations failed
3. `translationStatus.status === 'pending'` - Overall status pending
4. `translationStatus.status === 'has_failures'` - Overall status has failures

**Does NOT auto-open** when:
- `translationStatus.status === 'fully_translated'` - All complete
- `translationStatus.status === 'not_started'` - No translations yet
- No translation status available (API error)

### Language Support
Supports 6 target languages: `es`, `fr`, `de`, `it`, `nl` (plus `en` as source).

**Note**: Request mentions `pt` (Portuguese) but codebase defines `it` (Italian). Use `it` per codebase source of truth.

### Integration Point Decision
The translations button is positioned **above** the InstructionEditor component, not inside it. This avoids modifying the InstructionEditor component props interface.

**Alternative**: Pass `headerActions` prop to InstructionEditor to render button inside editor chrome. This would require InstructionEditor component modification.

### Save Behavior Decision Needed
**Current**: Page redirects to `/dashboard2/instructions` after save
**Option A**: Stay on page always (better for translation workflow)
**Option B**: Stay on page only if panel will auto-open
**Option C**: Keep redirect, add "View Translations" button to success toast

**Recommendation**: Option B (conditional stay) - stay if translations need attention, redirect otherwise.

---

## Estimated Effort

**Total**: 10-14 hours

**Breakdown**:
- Step 1 (Add state management): 30 minutes
- Step 2 (Auto-open logic): 1 hour
- Step 3 (Update handleSave): 1 hour
- Step 4 (Add button and panel): 2-3 hours
- Step 5 (Translation keys): 1 hour
- Step 6 (Integration tests): 3-4 hours
- Step 7 (Manual testing): 2-3 hours

**Confidence Level**: Medium - Depends on completeness of prerequisite components (TranslationPreviewPanel, useTranslationStatus).

---

## Success Criteria

This implementation will be considered successful when:

1. ✅ "Translations" button visible in article editor interface
2. ✅ Clicking button opens TranslationPreviewPanel
3. ✅ Panel displays correct entityId and entityType="article"
4. ✅ Panel shows translation status for all 6 supported languages
5. ✅ After successful save, translation status is refetched
6. ✅ Panel auto-opens after save if pendingCount > 0
7. ✅ Panel auto-opens after save if failedCount > 0
8. ✅ Panel auto-opens after save if status is 'pending' or 'has_failures'
9. ✅ Auto-open only triggers once per save operation
10. ✅ Pending count badge displays on button when pendingCount > 0
11. ✅ Failed count badge displays on button when failedCount > 0
12. ✅ Edit action in panel navigates to translation edit page
13. ✅ Re-translate action triggers retry API and refreshes status
14. ✅ Retry action triggers retry API and refreshes status
15. ✅ Panel closes via close button, ESC key, and outside click
16. ✅ Loading state handled gracefully during status fetch
17. ✅ Error state handled if status fetch fails
18. ✅ Page functions normally if translation features unavailable
19. ✅ Translation keys added for all 6 locales
20. ✅ Page layout responsive with panel integration
21. ✅ No TypeScript compilation errors
22. ✅ No ESLint warnings
23. ✅ Existing edit functionality preserved
24. ✅ Existing tests continue to pass
25. ✅ All integration tests pass
26. ✅ Manual QA scenarios complete successfully

---

**Document Status**: PENDING
**Last Updated**: 2026-01-22 20:32
**Author**: Technical Lead
**Review Status**: Awaiting Implementation
