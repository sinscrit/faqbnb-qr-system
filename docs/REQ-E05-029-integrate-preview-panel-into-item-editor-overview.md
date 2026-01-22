# Implementation Overview: Integrate Preview Panel into Item Editor

## Header
| Field | Value |
|-------|-------|
| Request Reference | #029 (REQ-E05-029) |
| Source File | docs/gen_requests_epic5.md |
| Original Request Date | 2026-01-22 |
| Breakdown Created | 2026-01-22 20:37 |
| T-shirt Size | M (Medium) |
| Estimated Effort | 10-14 hours |
| Phase | Phase 7 (Integration & Polish), Task 7.2 |
| Status | PENDING |

## Request Overview

### Original Request Summary
Property owners need the TranslationPreviewPanel component integrated into the item editor page, allowing them to view and manage translations for their item content directly from the editing interface. The panel should automatically show after saving changes and auto-open when there are pending translations that need attention, following the same pattern as the article editor (REQ-E05-028).

### Why This Matters
Currently, the item editor page provides editing functionality for items (name, description, room, type, tags) but has no integration with the Translation Management system. After saving an item, owners must navigate to a separate Translation Management page to view or manage translations. This creates context switching and cognitive load, reducing translation workflow efficiency. By integrating translation management directly into the item editor, owners can manage translations without leaving the editing experience, ensuring immediate awareness of translation status and ability to take action on failures.

### Expected User Impact
Property owners will be able to:
- View translation status for all 6 supported languages directly from the item editor
- Access translation preview panel with a single button click
- Automatically see the panel after saving when translations need attention (pending/failed)
- Edit, re-translate, and retry translations without navigating away from the item
- Understand translation progress through visual badges and status indicators

---

## Goals

### Primary Objective
Integrate the TranslationPreviewPanel component into the item editor page to provide seamless translation management within the editing workflow.

### Functional Requirements
1. **Add Translation Button**: Add a "Translations" button to the item editor header near the Save button
2. **Implement Panel Integration**: Integrate TranslationPreviewPanel component with proper state management
3. **Auto-Open Logic**: Implement auto-open behavior after save when translations need attention
4. **Status Indicators**: Display translation status badges (pending count, failed count)
5. **Action Handlers**: Implement edit, re-translate, and retry action handlers
6. **Internationalization**: Add translation keys for all new UI text in all 6 supported locales
7. **Preserve Functionality**: Ensure existing edit functionality remains unaffected

### Success Metrics
- Translation panel opens correctly when "Translations" button is clicked
- Auto-open triggers once per save when translations are pending/failed
- All panel actions (edit, re-translate, retry) work correctly
- Status badges reflect accurate translation counts
- No regression in existing item edit functionality
- Translation keys available in all 6 locales (en, es, fr, de, it, nl)

### Assumptions & Clarifications
- TranslationPreviewPanel component (REQ-E05-007) is complete and follows the design spec
- useTranslationStatus hook (REQ-E05-011) is implemented and provides status, isLoading, and refetch
- Translation retry API (/api/translations/retry) accepts entityType, entityId, and languages array
- Auto-open behavior should match article editor pattern (REQ-E05-028) for consistency
- Status polling is handled internally by useTranslationStatus hook, not by this integration
- Badge display should only show when counts > 0 to avoid UI clutter

---

## Implementation Plan

### Step 1: Add Translation State Management

**Objective**: Add state variables and hooks for translation panel management.

**File**: `/src/app/dashboard2/items/[publicId]/edit/page.tsx`

**Implementation**:

1. Add imports at the top of the file (after line 27):
```typescript
// After existing imports (line 27)
import { Globe } from 'lucide-react';
import { TranslationPreviewPanel } from '@/components/TranslationManagement/TranslationPreviewPanel';
import { useTranslationStatus } from '@/hooks/useTranslationStatus';
import type { EntityStatusSummary } from '@/app/api/translations/status/batch/types';
```

2. Add translation state variables (after line 58, before fetchItem callback):
```typescript
// Translation panel state (after line 58)
const [isPanelOpen, setIsPanelOpen] = useState(false);
const [shouldAutoOpenPanel, setShouldAutoOpenPanel] = useState(false);

// Use the translation status hook for the current item
const {
  status: translationStatus,
  isLoading: statusLoading,
  refetch: refetchStatus
} = useTranslationStatus({
  entityType: 'item',
  entityId: publicId,
  enabled: !!publicId && !loading,
});
```

**Rationale**: Separates translation concerns from item editing state. The `shouldAutoOpenPanel` flag ensures auto-open triggers exactly once per save operation, preventing repeated opening during status polling.

---

### Step 2: Implement Auto-Open Logic

**Objective**: Add useEffect hook to handle auto-opening the panel after save when translations need attention.

**File**: `/src/app/dashboard2/items/[publicId]/edit/page.tsx`

**Implementation**:

Add after the existing `useEffect` for fetchItem (after line 132):
```typescript
// Auto-open panel logic
useEffect(() => {
  if (shouldAutoOpenPanel && translationStatus) {
    // Auto-open if:
    // 1. There are pending translations (being processed)
    // 2. There are failed translations (need attention)
    // 3. Overall status indicates pending or failures
    const shouldOpen =
      (translationStatus.pendingCount && translationStatus.pendingCount > 0) ||
      (translationStatus.failedCount && translationStatus.failedCount > 0) ||
      translationStatus.status === 'pending' ||
      translationStatus.status === 'has_failures';

    if (shouldOpen) {
      setIsPanelOpen(true);
    }

    // Reset flag after check (prevents repeated auto-opens during polling)
    setShouldAutoOpenPanel(false);
  }
}, [shouldAutoOpenPanel, translationStatus]);
```

**Rationale**: The flag-based approach ensures auto-open happens exactly once per save. Without this flag, the panel would repeatedly open during status polling if conditions remain true. The conditions match those specified in REQ-E05-028 for consistency.

---

### Step 3: Modify handleSubmit Function

**Objective**: Update the save handler to trigger translation status refresh and auto-open check.

**File**: `/src/app/dashboard2/items/[publicId]/edit/page.tsx`

**Implementation**:

Modify the `handleSubmit` function (lines 163-206). Specifically, after line 195 (successful save):
```typescript
if (response.success) {
  console.log('Item updated successfully:', response.data);

  // NEW: Trigger translation status refresh and auto-open check
  refetchStatus();
  setShouldAutoOpenPanel(true);

  // Option A: Stay on page to show panel (recommended for translation workflow)
  // The auto-open logic will handle opening the panel if needed
  // Do NOT redirect immediately - let user see panel if translations need attention

  // Option B: Conditional redirect - only if no pending/failed translations
  // Check status first, then redirect after a delay if panel didn't open
  setTimeout(() => {
    if (!isPanelOpen) {
      router.push('/dashboard2/items');
    }
  }, 1500);

  // Option C: Keep original redirect behavior (not recommended)
  // router.push('/dashboard2/items');
}
```

**Design Decision Required**:
- **Option A** (Recommended): Always stay on page after save. Best for translation workflow.
- **Option B** (Hybrid): Stay if translations need attention, redirect otherwise. Balances workflows.
- **Option C** (Current): Always redirect. Poorest translation workflow experience.

**Rationale**: The `refetchStatus()` call ensures latest translation status is fetched after save. The `setShouldAutoOpenPanel(true)` flag triggers the auto-open check in the useEffect. The delay in Option B allows time for status refresh and panel opening before redirect decision.

---

### Step 4: Add Translations Button to Header

**Objective**: Add a "Translations" button to the page header with status badges.

**File**: `/src/app/dashboard2/items/[publicId]/edit/page.tsx`

**Implementation**:

Replace the header section (lines 246-255) with:
```typescript
{/* Header */}
<div className="mb-6">
  <div className="flex items-center justify-between">
    {/* Left side: Back button and title */}
    <div className="flex items-center gap-4">
      <button
        onClick={() => router.push('/dashboard2/items')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('backToItems')}
      </button>
      <h1 className="text-2xl font-bold text-gray-900">{t('pageTitle')}</h1>
    </div>

    {/* Right side: Translations button */}
    <button
      type="button"
      onClick={() => setIsPanelOpen(true)}
      disabled={!publicId || loading}
      className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
    >
      <Globe className="w-4 h-4" />
      <span>{t('translations')}</span>
      {translationStatus?.pendingCount && translationStatus.pendingCount > 0 && (
        <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
          {translationStatus.pendingCount}
        </span>
      )}
      {translationStatus?.failedCount && translationStatus.failedCount > 0 && (
        <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded-full">
          {translationStatus.failedCount}
        </span>
      )}
    </button>
  </div>
</div>
```

**Rationale**: Positioning the Translations button in the header (separate from form action buttons) makes it always accessible regardless of scroll position. The badges provide at-a-glance status information. Using `type="button"` prevents form submission when clicked.

---

### Step 5: Integrate TranslationPreviewPanel Component

**Objective**: Add the TranslationPreviewPanel component with proper action handlers.

**File**: `/src/app/dashboard2/items/[publicId]/edit/page.tsx`

**Implementation**:

Add after the closing `</form>` tag and before the closing `</div>` (after line 369):
```typescript
      </form>

      {/* Translation Preview Panel */}
      <TranslationPreviewPanel
        entityId={publicId}
        entityType="item"
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        onEdit={(language) => {
          // Navigate to translation edit for this language
          router.push(`/dashboard2/translations/item/${publicId}/${language}/edit`);
        }}
        onRetranslate={async (language) => {
          // Trigger re-translation via API
          try {
            const response = await fetch('/api/translations/retry', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                entityType: 'item',
                entityId: publicId,
                languages: [language],
              }),
            });

            if (response.ok) {
              // Refresh status to show updated state
              refetchStatus();
            } else {
              console.error('Re-translate failed:', await response.text());
            }
          } catch (error) {
            console.error('Re-translate error:', error);
          }
        }}
        onRetry={async (language) => {
          // Retry failed translation
          try {
            const response = await fetch('/api/translations/retry', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                entityType: 'item',
                entityId: publicId,
                languages: [language],
              }),
            });

            if (response.ok) {
              // Refresh status to show updated state
              refetchStatus();
            } else {
              console.error('Retry failed:', await response.text());
            }
          } catch (error) {
            console.error('Retry error:', error);
          }
        }}
      />
    </div>
```

**Rationale**: The panel is placed outside the form to avoid interference with form submission. All action handlers (`onEdit`, `onRetranslate`, `onRetry`) are implemented inline for simplicity. The `refetchStatus()` call after each action ensures the UI updates with the latest translation status.

---

### Step 6: Add Translation Keys for All Locales

**Objective**: Add translation keys for all new UI text in all 6 supported locales.

**Files**:
- `/messages/en.json`
- `/messages/es.json`
- `/messages/fr.json`
- `/messages/de.json`
- `/messages/it.json`
- `/messages/nl.json`

**Implementation**:

Add to the `items.edit` namespace in each locale file:

**English (`/messages/en.json`)**:
```json
{
  "items": {
    "edit": {
      "translations": "Translations",
      "translationsTooltip": "View and manage translations for this item",
      "pendingTranslations": "{count, plural, one {# translation pending} other {# translations pending}}",
      "failedTranslations": "{count, plural, one {# translation failed} other {# translations failed}}",
      "translationStatus": "{completed} of {total} languages translated"
    }
  }
}
```

**Spanish (`/messages/es.json`)**:
```json
{
  "items": {
    "edit": {
      "translations": "Traducciones",
      "translationsTooltip": "Ver y gestionar traducciones para este elemento",
      "pendingTranslations": "{count, plural, one {# traducción pendiente} other {# traducciones pendientes}}",
      "failedTranslations": "{count, plural, one {# traducción fallida} other {# traducciones fallidas}}",
      "translationStatus": "{completed} de {total} idiomas traducidos"
    }
  }
}
```

**French (`/messages/fr.json`)**:
```json
{
  "items": {
    "edit": {
      "translations": "Traductions",
      "translationsTooltip": "Voir et gérer les traductions pour cet élément",
      "pendingTranslations": "{count, plural, one {# traduction en attente} other {# traductions en attente}}",
      "failedTranslations": "{count, plural, one {# traduction échouée} other {# traductions échouées}}",
      "translationStatus": "{completed} sur {total} langues traduites"
    }
  }
}
```

**German (`/messages/de.json`)**:
```json
{
  "items": {
    "edit": {
      "translations": "Übersetzungen",
      "translationsTooltip": "Übersetzungen für dieses Element anzeigen und verwalten",
      "pendingTranslations": "{count, plural, one {# Übersetzung ausstehend} other {# Übersetzungen ausstehend}}",
      "failedTranslations": "{count, plural, one {# Übersetzung fehlgeschlagen} other {# Übersetzungen fehlgeschlagen}}",
      "translationStatus": "{completed} von {total} Sprachen übersetzt"
    }
  }
}
```

**Italian (`/messages/it.json`)** (NOTE: Using 'it', NOT 'pt'):
```json
{
  "items": {
    "edit": {
      "translations": "Traduzioni",
      "translationsTooltip": "Visualizza e gestisci le traduzioni per questo elemento",
      "pendingTranslations": "{count, plural, one {# traduzione in sospeso} other {# traduzioni in sospeso}}",
      "failedTranslations": "{count, plural, one {# traduzione fallita} other {# traduzioni fallite}}",
      "translationStatus": "{completed} di {total} lingue tradotte"
    }
  }
}
```

**Dutch (`/messages/nl.json`)**:
```json
{
  "items": {
    "edit": {
      "translations": "Vertalingen",
      "translationsTooltip": "Vertalingen voor dit item bekijken en beheren",
      "pendingTranslations": "{count, plural, one {# vertaling in behandeling} other {# vertalingen in behandeling}}",
      "failedTranslations": "{count, plural, one {# vertaling mislukt} other {# vertalingen mislukt}}",
      "translationStatus": "{completed} van {total} talen vertaald"
    }
  }
}
```

**Rationale**: Using next-intl's plural syntax for count-based messages provides grammatically correct translations. All keys follow existing naming conventions in the codebase.

**CRITICAL CONSISTENCY NOTE**: The codebase uses 'it' (Italian) as defined in `/src/lib/i18n/config.ts:19`, NOT 'pt' (Portuguese). All translation files must use 'it.json', not 'pt.json'.

---

### Step 7: Add Integration Tests

**Objective**: Create tests to verify the integration works correctly.

**File**: `/src/app/dashboard2/items/[publicId]/edit/__tests__/page.test.tsx` (create new file)

**Implementation**:

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth, useAccountContext } from '@/contexts/AuthContext';
import { useTranslations } from 'next-intl';
import { useTranslationStatus } from '@/hooks/useTranslationStatus';
import EditItemPage from '../page';

// Mock dependencies
jest.mock('next/navigation');
jest.mock('@/contexts/AuthContext');
jest.mock('next-intl');
jest.mock('@/hooks/useTranslationStatus');
jest.mock('@/lib/api');

describe('EditItemPage - Translation Integration', () => {
  const mockRouter = { push: jest.fn() };
  const mockParams = { publicId: 'ITEM-123' };
  const mockUser = { id: 'user-1', email: 'test@example.com' };
  const mockAccount = { id: 'account-1', name: 'Test Account' };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useParams as jest.Mock).mockReturnValue(mockParams);
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
    (useAccountContext as jest.Mock).mockReturnValue({ currentAccount: mockAccount });
    (useTranslations as jest.Mock).mockReturnValue((key: string) => key);
    (useTranslationStatus as jest.Mock).mockReturnValue({
      status: null,
      isLoading: false,
      refetch: jest.fn(),
    });
  });

  test('renders Translations button in header', async () => {
    render(<EditItemPage />);

    await waitFor(() => {
      expect(screen.getByText('translations')).toBeInTheDocument();
    });
  });

  test('opens panel when Translations button is clicked', async () => {
    render(<EditItemPage />);

    await waitFor(() => {
      const translationsButton = screen.getByText('translations');
      fireEvent.click(translationsButton);
    });

    // Panel should be rendered with isOpen=true
    // Verify by checking for panel-specific content
    expect(screen.getByTestId('translation-preview-panel')).toBeInTheDocument();
  });

  test('displays pending count badge when translations are pending', async () => {
    (useTranslationStatus as jest.Mock).mockReturnValue({
      status: { pendingCount: 3, failedCount: 0, completedCount: 2 },
      isLoading: false,
      refetch: jest.fn(),
    });

    render(<EditItemPage />);

    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  test('displays failed count badge when translations have failed', async () => {
    (useTranslationStatus as jest.Mock).mockReturnValue({
      status: { pendingCount: 0, failedCount: 2, completedCount: 3 },
      isLoading: false,
      refetch: jest.fn(),
    });

    render(<EditItemPage />);

    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  test('auto-opens panel after save when translations are pending', async () => {
    const mockRefetch = jest.fn();
    (useTranslationStatus as jest.Mock).mockReturnValue({
      status: { pendingCount: 2, status: 'pending' },
      isLoading: false,
      refetch: mockRefetch,
    });

    render(<EditItemPage />);

    // Simulate save operation
    const saveButton = screen.getByText('buttons.save');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockRefetch).toHaveBeenCalled();
      // Panel should auto-open
      expect(screen.getByTestId('translation-preview-panel')).toHaveAttribute('data-open', 'true');
    });
  });

  test('calls refetchStatus when re-translate action is triggered', async () => {
    const mockRefetch = jest.fn();
    (useTranslationStatus as jest.Mock).mockReturnValue({
      status: { pendingCount: 0, completedCount: 5 },
      isLoading: false,
      refetch: mockRefetch,
    });

    global.fetch = jest.fn().mockResolvedValue({ ok: true });

    render(<EditItemPage />);

    // Open panel
    const translationsButton = screen.getByText('translations');
    fireEvent.click(translationsButton);

    // Simulate re-translate action
    const retranslateButton = screen.getByTestId('retranslate-es');
    fireEvent.click(retranslateButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/translations/retry', expect.any(Object));
      expect(mockRefetch).toHaveBeenCalled();
    });
  });
});
```

**Rationale**: Tests verify the critical integration points: button rendering, panel opening, badge display, auto-open logic, and action handlers. Using jest.mock ensures isolated unit testing without dependencies.

---

## Authorized Files and Functions for Modification

> ⚠️ **APPROVED SCOPE**: Changes outside this list require review

### Translation Integration - Item Editor

| File | Target | Type |
|------|--------|------|
| `/src/app/dashboard2/items/[publicId]/edit/page.tsx` | Lines 1-372 (entire file) | Modify |
| `/src/app/dashboard2/items/[publicId]/edit/page.tsx` | Add translation state (after line 58) | Add |
| `/src/app/dashboard2/items/[publicId]/edit/page.tsx` | Add auto-open useEffect (after line 132) | Add |
| `/src/app/dashboard2/items/[publicId]/edit/page.tsx` | Modify `handleSubmit` (lines 163-206) | Modify |
| `/src/app/dashboard2/items/[publicId]/edit/page.tsx` | Replace header section (lines 246-255) | Modify |
| `/src/app/dashboard2/items/[publicId]/edit/page.tsx` | Add TranslationPreviewPanel (after line 369) | Add |

### Translation Keys - All Locales

| File | Target | Type |
|------|--------|------|
| `/messages/en.json` | `items.edit` namespace | Extend |
| `/messages/es.json` | `items.edit` namespace | Extend |
| `/messages/fr.json` | `items.edit` namespace | Extend |
| `/messages/de.json` | `items.edit` namespace | Extend |
| `/messages/it.json` | `items.edit` namespace | Extend |
| `/messages/nl.json` | `items.edit` namespace | Extend |

### Test Files

| File | Target | Type |
|------|--------|------|
| `/src/app/dashboard2/items/[publicId]/edit/__tests__/page.test.tsx` | — | Create |

### Files That Must NOT Be Modified

- `/src/components/TranslationManagement/TranslationPreviewPanel.tsx` - Dependency component (REQ-E05-007)
- `/src/hooks/useTranslationStatus.ts` - Dependency hook (REQ-E05-011)
- `/src/app/api/translations/status/batch/types.ts` - Dependency types (REQ-E05-006)
- `/src/app/api/translations/retry/route.ts` - Dependency API (REQ-E05-003)
- Any other files not explicitly listed above

---

## Dependencies

### Depends On (Must Be Completed First)
- **REQ-E05-007** (Task 5.1): TranslationPreviewPanel Component - Provides the slide-out panel UI component with status display and action buttons
- **REQ-E05-011** (Task 5.5): useTranslationStatus Hook - Provides translation status fetching with isLoading, refetch capabilities
- **REQ-E05-001** (Task 1.1): Translation Status API Endpoint - Backend API for querying translation status by entity
- **REQ-E05-003** (Task 2.1): Re-Translate API Endpoint - Backend API for triggering re-translation and retry operations
- **REQ-E05-006** (Task 4.1): TranslationManagement Types File - Type definitions for EntityStatusSummary and related interfaces

### Blocks (Tasks That Require This First)
- **REQ-E05-030** (Task 7.3): Add Loading States and Error Handling - Will build upon this integration to add enhanced error handling

### Parallel Safety
- **Files Touched**:
  - `/src/app/dashboard2/items/[publicId]/edit/page.tsx`
  - `/messages/*.json` (all 6 locale files)
- **Conflicts With**: None - This is the only task modifying the item editor page in Epic 5
- **Safe to Parallelize With**:
  - REQ-E05-028 (modifies different file: article editor)
  - REQ-E05-025, REQ-E05-026, REQ-E05-027 (modify settings/preferences pages)
  - Any tasks not touching item editor or the same locale keys

### External Dependencies
- `next-intl` - Translation framework (already in use)
- `lucide-react` - Icons (Globe, Loader2, Save, ArrowLeft already imported)
- `next/navigation` - useRouter, useParams (already imported)
- `@/contexts/AuthContext` - useAuth, useAccountContext (already imported)

---

## Risks and Considerations

### Potential Side Effects

- **Item Editor Workflow**: Adding translation panel may affect save/redirect behavior - users might expect to stay on page after save to view translations
- **Form Performance**: Additional state management and status polling could impact form responsiveness if not optimized
- **UI Layout**: Adding Translations button to header requires space - may need to adjust header layout on smaller screens
- **Navigation Patterns**: Panel integration changes the mental model - users previously had to navigate away to manage translations
- **Status Polling**: If useTranslationStatus polls frequently, could increase API load when many users are editing simultaneously

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| TranslationPreviewPanel not yet implemented | HIGH | HIGH | Requires REQ-E05-007 completion first; document will fail type checking until dependency available |
| useTranslationStatus hook not yet implemented | HIGH | HIGH | Requires REQ-E05-011 completion first; import will fail until available |
| Auto-open logic triggers multiple times | MEDIUM | MEDIUM | Use `shouldAutoOpenPanel` flag with immediate reset in useEffect |
| Panel interferes with form submission | LOW | MEDIUM | Place panel outside `<form>` element; use `type="button"` on Translations button |
| Status refresh causes performance issues | LOW | MEDIUM | Hook should implement debouncing/throttling internally (REQ-E05-011) |
| Translation API not available | LOW | HIGH | Add error handling with try-catch blocks; log errors but don't block UI |

### User Experience Considerations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Panel auto-opens unexpectedly during normal workflow | MEDIUM | MEDIUM | Only auto-open after save, not on page load or during editing |
| Redirect behavior confusion | MEDIUM | HIGH | Document design decision clearly; provide option to change behavior |
| Too many badges clutter the UI | LOW | LOW | Show at most 2 badges (pending, failed); use clear styling |
| Button positioning feels awkward | LOW | MEDIUM | User testing during implementation; adjust based on feedback |

### Testing Requirements

- **Unit Tests**: Translation state initialization, auto-open flag logic, badge visibility, action handlers
- **Integration Tests**: Save-to-panel-open workflow, API calls, status refresh, error handling
- **Manual Testing**: Panel opening/closing, navigation, badge display, translations in all locales, TypeScript/ESLint checks

---

## Open Questions

### Design Decisions Needed

- [ ] **Post-Save Navigation Behavior**: Should the page stay on the editor after save, redirect to list, or conditionally stay based on translation status?
  - **Option A**: Always stay on page (best for translation workflow)
  - **Option B**: Conditional stay - only if translations need attention (hybrid, recommended)
  - **Option C**: Keep current redirect behavior (poorest translation experience)
- [ ] **Badge Display Strategy**: Show both pending and failed badges simultaneously, or prioritize one?
  - **Recommendation**: Show both when applicable for complete status picture
- [ ] **Error Handling Approach**: Use toast notifications, inline messages, or both for translation action errors?
  - **Recommendation**: Toast notifications (consistent with REQ-E05-030)

### Technical Clarifications

- [ ] **Panel Behavior**: Should TranslationPreviewPanel be slide-out overlay or inline expansion?
  - **Answer**: Follow TranslationPreviewPanel's default implementation (REQ-E05-007)
- [ ] **Loading State Scope**: During re-translate/retry, disable entire panel or just the action button?
  - **Recommendation**: Show spinner on specific button, keep panel interactive

---

## Out of Scope

The following items are explicitly **OUT OF SCOPE** for this request:

- **Component Implementation**: Implementing TranslationPreviewPanel component itself (REQ-E05-007) or useTranslationStatus hook (REQ-E05-011)
- **Translation Edit Pages**: Creating translation edit pages for items (separate request handles this)
- **Bulk Operations**: Bulk translation operations from item editor
- **Inline Editing**: Editing translations inline within the item editor (separate feature)
- **Advanced Features**: Translation quality indicators, confidence scores, history, version comparison
- **Custom Styling**: Custom theming for the panel beyond defaults
- **Performance Optimizations**: Caching translation status, optimistic UI updates, background sync
- **Extended Testing**: End-to-end tests across multiple pages, load testing, accessibility audit (separate requests)

---

## 9. Testing Requirements

### Unit Tests
- Test translation state initialization
- Test `shouldAutoOpenPanel` flag logic
- Test auto-open conditions (pending, failed, status values)
- Test action handler implementations (edit, re-translate, retry)
- Test badge visibility based on status counts
- Test button disabled states

### Integration Tests
- Test full save-to-panel-open workflow
- Test panel opening from button click
- Test panel closing from close button
- Test navigation to translation edit page
- Test API calls for re-translate and retry actions
- Test status refresh after actions
- Test error handling when APIs fail

### Manual Testing Checklist
- [ ] Click Translations button - panel opens
- [ ] Save item with no translations - panel does NOT auto-open
- [ ] Save item with pending translations - panel auto-opens once
- [ ] Save item with failed translations - panel auto-opens once
- [ ] Verify pending count badge displays correct number
- [ ] Verify failed count badge displays correct number
- [ ] Click Edit action - navigates to translation edit page
- [ ] Click Re-translate action - triggers API call and refreshes status
- [ ] Click Retry action - triggers API call and refreshes status
- [ ] Close panel with close button - panel closes
- [ ] Close panel with ESC key - panel closes (if supported by component)
- [ ] Verify all text appears in correct language when switching locales
- [ ] Verify no TypeScript errors in VS Code
- [ ] Verify no ESLint warnings
- [ ] Verify existing edit functionality still works (room, type, tags, save, cancel)

---

## 10. Success Criteria

### Functional Requirements
1. "Translations" button is visible in the item editor interface header
2. Translations button is positioned near the Save button for easy access
3. Clicking "Translations" button opens the TranslationPreviewPanel
4. Panel displays item publicId and entityType="item" correctly
5. Panel shows translation status for all 6 supported languages (es, fr, de, it, nl)
6. After successful save, translation status is refetched via `refetchStatus()`
7. Panel auto-opens after save if item has pending translations (pendingCount > 0)
8. Panel auto-opens after save if item has failed translations (failedCount > 0)
9. Panel auto-opens after save if status is 'pending' or 'has_failures'
10. Auto-open only triggers once per save operation (not on every status refresh)

### UI Requirements
11. Translation status badge shows pending count next to the Translations button when pendingCount > 0
12. Translation status badge shows failed count when failedCount > 0
13. Button spacing and alignment is consistent with existing UI patterns
14. Page layout remains responsive with the panel integration
15. Header layout accommodates both Translations and Save buttons without crowding

### Action Requirements
16. Clicking Edit action in panel navigates to `/dashboard2/translations/item/${publicId}/${language}/edit`
17. Clicking Re-translate action triggers re-translation API and refreshes status
18. Clicking Retry action for failed translations triggers retry API and refreshes status
19. Panel closes when clicking the close button
20. Panel closes when pressing ESC key (if supported by TranslationPreviewPanel)
21. `onClose` callback properly updates state to close panel

### Data Requirements
22. Translation status refreshes periodically while panel is open (if implemented in hook)
23. Loading state is handled gracefully while fetching translation status
24. Error state is handled if translation status fetch fails
25. Page continues to function normally if translation status API is unavailable
26. Save operation completes successfully before auto-opening panel
27. If save fails, panel does not auto-open

### Internationalization Requirements
28. Translation keys added for all new UI text in all supported locales (en, fr, es, de, nl, it)
29. All text displays correctly in each locale
30. Plural forms work correctly for count-based messages

### Code Quality Requirements
31. No TypeScript compilation errors
32. No ESLint warnings
33. Existing edit functionality is preserved and unaffected (room selector, type selector, tags edit)
34. Existing tests continue to pass
35. New integration tests pass

---

## 11. Implementation Notes

### Code Style Guidelines
- Follow existing code style in the item editor page (functional components, hooks)
- Use TypeScript strict mode - all types must be explicitly defined
- Use next-intl's `useTranslations` hook for all user-facing text
- Follow existing naming conventions: camelCase for variables, PascalCase for components
- Add JSDoc comments for complex logic (especially auto-open useEffect)

### Performance Considerations
- The `useTranslationStatus` hook should handle polling/refreshing internally (REQ-E05-011)
- Avoid unnecessary re-renders by using `useCallback` for action handlers if needed
- The `shouldAutoOpenPanel` flag prevents repeated status checks during polling
- Translation API calls should be non-blocking (don't prevent other user interactions)

### Accessibility Considerations
- Ensure Translations button is keyboard accessible (native `<button>` element)
- Ensure panel can be closed with keyboard (ESC key, close button focus)
- Add `aria-label` to Translations button if TranslationPreviewPanel requires it
- Badge counts should have appropriate aria-live regions for screen readers (handled by TranslationPreviewPanel)

### Internationalization Considerations
- **CRITICAL**: This codebase uses 'it' (Italian) as defined in `/src/lib/i18n/config.ts:19`, NOT 'pt' (Portuguese)
- All translation keys must exist in all 6 locale files: en, es, fr, de, it, nl
- Use next-intl's plural syntax for count-based messages (e.g., `{count, plural, one {...} other {...}}`)
- Test language switching to ensure all text updates correctly

### Error Handling Strategy
- Wrap API calls in try-catch blocks
- Log errors to console for debugging
- Don't block UI on translation API failures
- Show user-friendly error messages via toasts (consistent with REQ-E05-030)
- Gracefully degrade if TranslationPreviewPanel is unavailable

---

## 12. Effort Estimate

**Total Estimated Effort**: 10-14 hours

### Breakdown by Step

| Step | Description | Estimated Time |
|------|-------------|----------------|
| 1 | Add translation state management | 1-2 hours |
| 2 | Implement auto-open logic | 2-3 hours |
| 3 | Modify handleSubmit function | 1-2 hours |
| 4 | Add Translations button to header | 1-2 hours |
| 5 | Integrate TranslationPreviewPanel component | 2-3 hours |
| 6 | Add translation keys for all locales | 1 hour |
| 7 | Add integration tests | 2-3 hours |

### Additional Time Allocations
- **Code review and revisions**: 2 hours
- **Manual testing and bug fixes**: 2 hours
- **Documentation updates**: 1 hour

### Assumptions
- TranslationPreviewPanel component is complete and stable (REQ-E05-007)
- useTranslationStatus hook is complete and tested (REQ-E05-011)
- Translation APIs are functional and tested (REQ-E05-001, REQ-E05-003)
- No major UI redesigns required
- Developer is familiar with Next.js, React hooks, and next-intl

### Factors That Could Increase Estimate
- TranslationPreviewPanel API changes requiring rework
- Complex error handling requirements beyond basic try-catch
- Additional accessibility requirements not yet specified
- Performance issues requiring optimization
- Extensive bug fixes due to dependency issues

---

## 13. Related Documentation

### Implementation References
- REQ-E05-028: Integrate Preview Panel into Article Editor (same pattern)
- `/src/app/dashboard2/items/[publicId]/edit/page.tsx` - Current item editor implementation
- `/src/app/dashboard2/instructions/[articleId]/edit/page.tsx` - Article editor reference (REQ-E05-028)

### API References
- REQ-E05-001: Translation Status API Endpoint
- REQ-E05-003: Re-Translate API Endpoint
- REQ-E05-006: TranslationManagement Types File

### Component References
- REQ-E05-007: TranslationPreviewPanel Component
- REQ-E05-011: useTranslationStatus Hook

### Related Features
- REQ-E05-030: Add Loading States and Error Handling (will enhance this integration)

---

*Document generated: 2026-01-22 20:37*
*Source: docs/gen_requests_epic5.md - Request #029*
*Status: PENDING (Blocked by REQ-E05-007, REQ-E05-011)*
