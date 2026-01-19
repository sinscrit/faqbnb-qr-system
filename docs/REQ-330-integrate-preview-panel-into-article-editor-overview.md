# REQ-330: Integrate Translation Preview Panel into Article Editor - Implementation Overview

**Last Modified:** 2026-01-18
**Request ID:** REQ-330
**Type:** ENHANCEMENT
**Size:** M (Medium)
**Phase:** 7 - Integration & Polish
**Task ID:** 7.1
**PRD Reference:** Plan-111-L10N-Epic5-Owner-Translation-Management.md
**Dependencies:** Epic 1 (Foundation), Epic 3 (Dynamic Content Translation), REQ-310 (TranslationPreviewPanel), REQ-314 (useTranslationStatus), REQ-315 (useTranslationRealtime)

---

## Summary

Integrate the TranslationPreviewPanel component into the article editor page so that property owners receive immediate translation status feedback after saving an article. The panel will automatically open when translations are pending or incomplete, providing visibility into translation progress and enabling quick access to translation management actions without navigating away from the editor.

---

## User Story

As a **property owner editing article content**, I want to **see the translation preview panel automatically appear after saving my article** so that I can **immediately understand the translation status across all languages and take action on pending or failed translations without leaving the editor context**.

---

## Acceptance Criteria

| # | Criterion | Verification Method |
|---|-----------|---------------------|
| AC-1 | TranslationPreviewPanel component is integrated into the article editor page | Code inspection, visual verification |
| AC-2 | Panel displays automatically after successful article save operations | Functional testing with save action |
| AC-3 | Panel loads translation status data for the saved article across all six languages | API response verification, visual check |
| AC-4 | Panel automatically opens when one or more translations have pending status | Conditional rendering verification |
| AC-5 | Panel remains collapsed when all translations are complete, but remains available for manual opening | State management verification |
| AC-6 | Panel displays article source content at the top for reference | Visual inspection |
| AC-7 | Panel shows status indicators for each of the six supported languages | Visual inspection with test data |
| AC-8 | Panel includes action buttons for editing, re-translating, and retrying translations | Click handler verification |
| AC-9 | Panel positioning and animation matches standard TranslationPreviewPanel behavior | Visual consistency check |
| AC-10 | Panel does not disrupt article editor layout when displayed | Layout testing |
| AC-11 | Panel handles cases where no translations exist gracefully without errors | Edge case testing |
| AC-12 | Panel updates in real-time if translation statuses change while panel is open | Realtime subscription verification |
| AC-13 | Panel can be manually closed by user after reviewing translation status | User interaction testing |
| AC-14 | Integration maintains responsive layout on tablet and desktop viewports | Responsive testing |
| AC-15 | Panel is keyboard accessible and integrates with editor keyboard navigation | WCAG 2.1 AA testing |

---

## Technical Approach

### Architecture Overview

This integration follows the pattern established in the existing article editor (`/src/app/dashboard2/instructions/[articleId]/edit/page.tsx`) which uses the `InstructionEditor` component. The TranslationPreviewPanel will be integrated at the page level, triggered after successful save operations.

```
ArticleEditPage (page.tsx)
├── State: previewPanelOpen, savedArticleData
├── InstructionEditor (existing)
│   └── onSave callback → triggers panel display
├── TranslationPreviewPanel (new integration)
│   ├── Receives: entityType, entityId, sourceContent, isOpen
│   ├── Uses: useTranslationStatus hook
│   └── Uses: useTranslationRealtime hook
```

### Integration Points

The integration occurs in the article edit page (`/src/app/dashboard2/instructions/[articleId]/edit/page.tsx`):

1. **After Save Hook:** Modify the `handleSave` callback to trigger the preview panel after successful save
2. **Panel State Management:** Add state to track panel visibility and auto-open conditions
3. **Source Content Propagation:** Pass the saved article's title and description to the panel
4. **Auto-open Logic:** Query translation status and auto-open panel if any translations are pending

### State Management

```typescript
// New state additions to EditArticlePage
interface TranslationPreviewState {
  isOpen: boolean;
  autoOpened: boolean;  // Track if auto-opened vs manually opened
}

// Default state
const [translationPreview, setTranslationPreview] = useState<TranslationPreviewState>({
  isOpen: false,
  autoOpened: false,
});

// After successful save
const handleSaveSuccess = (savedArticle: ArticleData) => {
  // Check if any translations are pending
  const hasPendingTranslations = checkPendingTranslations(savedArticle.id);

  setTranslationPreview({
    isOpen: hasPendingTranslations,  // Auto-open if pending
    autoOpened: hasPendingTranslations,
  });
};
```

### Data Flow

```
User clicks "Save Changes"
    │
    ▼
handleSave() in page.tsx
    │
    ├── API call: adminApi.updateArticle()
    │
    ├── On Success:
    │   ├── Set success flag in sessionStorage
    │   ├── Fetch translation status via useTranslationStatus
    │   │
    │   └── If any status is 'pending' or 'processing':
    │       └── setTranslationPreview({ isOpen: true, autoOpened: true })
    │
    └── TranslationPreviewPanel renders with:
        ├── entityType: 'article'
        ├── entityId: articleId
        ├── sourceLanguage: articleData.sourceLanguage || 'en'
        └── sourceContent: { title, description }
```

### Conditional Auto-Open Logic

The panel auto-opens based on translation status:

```typescript
// Determine if panel should auto-open
const shouldAutoOpen = (statuses: TranslationStatusMap): boolean => {
  return Object.values(statuses).some(
    (s) => s.status === 'pending' || s.status === 'processing' || s.status === 'failed'
  );
};
```

---

## Component Integration Details

### TranslationPreviewPanel Props Usage

```typescript
<TranslationPreviewPanel
  entityType="article"
  entityId={articleId}
  sourceLanguage={articleData?.sourceLanguage || 'en'}
  sourceContent={{
    title: articleData?.title || '',
    description: articleData?.description || undefined,
  }}
  isOpen={translationPreview.isOpen}
  onClose={() => setTranslationPreview({ isOpen: false, autoOpened: false })}
  onTranslationEdited={(language) => {
    // Optional: show toast notification
    console.log(`Translation edited for ${language}`);
  }}
  onRetranslate={(language) => {
    // Optional: trigger re-translation
    console.log(`Re-translation requested for ${language}`);
  }}
  onRetry={(language) => {
    // Optional: retry failed translation
    console.log(`Retry requested for ${language}`);
  }}
/>
```

### Save Flow Modification

The existing save flow redirects to the instructions list after save. This needs modification to:

1. **Show panel instead of immediate redirect** after save completes
2. **Allow user to review translations** before navigating away
3. **Provide "Done" action** to proceed with redirect when user is ready

**Current Flow:**
```typescript
const handleSave = async (payload: UpdateArticlePayload) => {
  // ... save logic ...
  sessionStorage.setItem('editSuccess', 'true');
  router.push('/dashboard2/instructions');  // Immediate redirect
};
```

**Modified Flow:**
```typescript
const handleSave = async (payload: UpdateArticlePayload) => {
  // ... save logic ...

  // Instead of immediate redirect, show translation panel
  setShowTranslationPanel(true);
  setLastSavedArticle({
    id: articleId,
    title: payload.title,
    description: articleData.description,
    sourceLanguage: articleData.sourceLanguage || 'en',
  });

  // User can close panel to proceed, or click dedicated "Done" button
};
```

### Layout Considerations

The TranslationPreviewPanel is positioned as a fixed overlay from the right side (400px width). The article editor content remains accessible underneath the overlay, with the panel not disrupting the editor layout.

```tsx
// In the page render
return (
  <div className="relative">
    <InstructionEditor
      articleData={articleData}
      onSave={handleSave}
      onCancel={handleCancel}
      isSaving={isSaving}
    />

    {/* Translation Preview Panel - overlays from right */}
    <TranslationPreviewPanel
      entityType="article"
      entityId={articleId}
      sourceLanguage={articleData.sourceLanguage || 'en'}
      sourceContent={{
        title: articleData.title,
        description: articleData.description || undefined,
      }}
      isOpen={showTranslationPanel}
      onClose={handlePanelClose}
    />
  </div>
);
```

---

## Implementation Tasks

### Task 1: Add translation panel state management
**Effort:** S (15-30 min)

Add state variables to track panel visibility and saved article context.

**Files:**
- Modify: `/src/app/dashboard2/instructions/[articleId]/edit/page.tsx`

**Changes:**
```typescript
// Add imports
import { TranslationPreviewPanel } from '@/components/TranslationManagement';
import { useTranslationStatus } from '@/hooks/useTranslationStatus';

// Add state
const [showTranslationPanel, setShowTranslationPanel] = useState(false);
const [lastSavedArticle, setLastSavedArticle] = useState<{
  id: string;
  title: string;
  description?: string;
  sourceLanguage: string;
} | null>(null);
```

### Task 2: Modify save handler to trigger panel display
**Effort:** M (30 min - 1 hour)

Update the `handleSave` callback to show the translation panel after successful save instead of immediate redirect.

**Files:**
- Modify: `/src/app/dashboard2/instructions/[articleId]/edit/page.tsx`

**Changes:**
- After successful `adminApi.updateArticle()` call
- Set `showTranslationPanel` to true
- Store saved article context for panel display
- Remove or defer the `router.push()` redirect

### Task 3: Implement auto-open logic based on translation status
**Effort:** M (1-2 hours)

Fetch translation status after save and auto-open panel if any translations are pending, processing, or failed.

**Files:**
- Modify: `/src/app/dashboard2/instructions/[articleId]/edit/page.tsx`

**Implementation:**
```typescript
// After save success, check translation status
const { data: translationStatus } = useTranslationStatus({
  entityType: 'article',
  entityId: articleId,
  enabled: lastSavedArticle !== null,
});

// Auto-open effect
useEffect(() => {
  if (translationStatus && lastSavedArticle) {
    const hasPending = Object.values(translationStatus.translations).some(
      (t) => t.status === 'pending' || t.status === 'processing' || t.status === 'failed'
    );
    if (hasPending) {
      setShowTranslationPanel(true);
    }
  }
}, [translationStatus, lastSavedArticle]);
```

### Task 4: Integrate TranslationPreviewPanel component
**Effort:** M (30 min - 1 hour)

Add the TranslationPreviewPanel component to the page render with proper props.

**Files:**
- Modify: `/src/app/dashboard2/instructions/[articleId]/edit/page.tsx`

**Changes:**
- Import TranslationPreviewPanel
- Add panel JSX after InstructionEditor
- Wire up props: entityType, entityId, sourceContent, isOpen, onClose

### Task 5: Handle panel close and navigation
**Effort:** S (15-30 min)

Implement the close handler that allows user to dismiss panel and optionally navigate away.

**Files:**
- Modify: `/src/app/dashboard2/instructions/[articleId]/edit/page.tsx`

**Implementation:**
```typescript
const handlePanelClose = useCallback(() => {
  setShowTranslationPanel(false);

  // If save was successful and user closes panel, redirect to list
  if (lastSavedArticle) {
    sessionStorage.setItem('editSuccess', 'true');
    router.push('/dashboard2/instructions');
  }
}, [lastSavedArticle, router]);
```

### Task 6: Add "Stay & Edit" option for users who want to continue editing
**Effort:** S (15-30 min)

Allow users to close the panel and continue editing without navigating away.

**Files:**
- Modify: `/src/app/dashboard2/instructions/[articleId]/edit/page.tsx`

**Implementation:**
- Add "Continue Editing" button in addition to panel close
- This resets panel state but keeps user on editor page

### Task 7: Handle edge cases (no translations, loading states)
**Effort:** S (30 min - 1 hour)

Ensure graceful handling when:
- No translation records exist yet
- Translation status is loading
- Translation fetch fails

**Files:**
- Modify: `/src/app/dashboard2/instructions/[articleId]/edit/page.tsx`

### Task 8: Add accessibility improvements
**Effort:** S (15-30 min)

Ensure keyboard navigation works between editor and panel:
- Focus management when panel opens
- Escape key closes panel
- Screen reader announcements

**Files:**
- Modify: `/src/app/dashboard2/instructions/[articleId]/edit/page.tsx`

---

## Authorized Files and Functions for Modification

### Files to Modify

| File Path | Changes | Functions/Sections Affected |
|-----------|---------|----------------------------|
| `/src/app/dashboard2/instructions/[articleId]/edit/page.tsx` | Primary integration file - add panel state, modify save handler, render panel | `EditArticlePage` component, `handleSave` function, render return section |

### New Imports Required

| Import | Source |
|--------|--------|
| `TranslationPreviewPanel` | `@/components/TranslationManagement` |
| `useTranslationStatus` | `@/hooks/useTranslationStatus` (if exists) |

### Files for Reference Only (Do Not Modify)

| File Path | Reference Purpose |
|-----------|-------------------|
| `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx` | Panel component API, props interface |
| `/src/components/InstructionEditor/InstructionEditor.tsx` | Current editor structure, save callback signature |
| `/src/components/ItemManager/components/ItemPreview/ItemPreviewModal.tsx` | Similar overlay pattern reference |
| `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md` | Full implementation plan context |

---

## Dependencies

### Internal Dependencies

| Dependency | Location | Required For | Status |
|------------|----------|--------------|--------|
| TranslationPreviewPanel | `/src/components/TranslationManagement/TranslationPreviewPanel/` | Panel UI component | Required (REQ-310) |
| useTranslationStatus hook | `/src/hooks/useTranslationStatus.ts` | Fetching translation status | Required (REQ-314) |
| useTranslationRealtime hook | `/src/hooks/useTranslationRealtime.ts` | Real-time status updates | Optional but recommended (REQ-315) |
| TranslationManagement types | `/src/components/TranslationManagement/TranslationManagement.types.ts` | Shared type definitions | Required (REQ-309) |

### External Dependencies

| Package | Version | Usage |
|---------|---------|-------|
| `@radix-ui/react-dialog` | (existing) | Used by TranslationPreviewPanel |
| `lucide-react` | (existing) | Icons in panel |

### Epic Dependencies

| Epic/Request | Dependency Type | Notes |
|--------------|-----------------|-------|
| Epic 1 | Required | Translation tables must exist (`article_translations`) |
| Epic 3 | Required | Translation status tracking, translation trigger system |
| REQ-309 | Required | TranslationManagement.types.ts |
| REQ-310 | Required | TranslationPreviewPanel component |
| REQ-314 | Required | useTranslationStatus hook |
| REQ-315 | Recommended | useTranslationRealtime hook for live updates |

---

## Database Tables Involved

### article_translations

| Column | Type | Purpose |
|--------|------|---------|
| `article_id` | uuid | FK to item_articles, links translation to article |
| `language` | varchar | Target language code (en, fr, es, de, nl, it) |
| `title` | varchar | Translated article title |
| `description` | text | Translated article description |
| `translation_status` | varchar | Status: pending, processing, completed, failed, manual |
| `translated_at` | timestamptz | When translation completed |
| `reviewed_by` | uuid | FK to users, who manually reviewed |

### item_articles (for context)

| Column | Type | Purpose |
|--------|------|---------|
| `id` | uuid | Article ID, used as entityId |
| `title` | varchar | Source article title |
| `description` | text | Source article description |
| `source_language` | varchar | Original language of content |

---

## API Interactions

### GET /api/translations/status

Fetches translation status for the article.

**Query Parameters:**
- `entityType`: 'article'
- `entityId`: article UUID

**Response Structure:**
```typescript
interface TranslationStatusResponse {
  sourceLanguage: SupportedLanguage;
  translations: {
    [key in SupportedLanguage]?: {
      status: 'pending' | 'processing' | 'completed' | 'failed' | 'manual';
      content?: { title?: string; description?: string };
      translatedAt?: string;
      isStale?: boolean;
      reviewedBy?: string;
    };
  };
}
```

---

## Testing Considerations

### Manual Testing Checklist

- [ ] Save article and verify panel appears
- [ ] Panel shows source content (title, description) correctly
- [ ] All 6 languages displayed with appropriate status
- [ ] Auto-opens when pending translations exist
- [ ] Stays closed when all translations complete
- [ ] Close button dismisses panel and navigates to list
- [ ] Can continue editing after closing panel (if option provided)
- [ ] Real-time updates when translation status changes
- [ ] Handles missing translation records gracefully
- [ ] Loading states display appropriately
- [ ] Error states display with retry option
- [ ] Keyboard navigation: Tab through panel, Escape to close
- [ ] Screen reader announces panel open/close
- [ ] Responsive: tablet and desktop layouts work correctly
- [ ] Panel doesn't break editor layout

### Unit Tests (deferred to Phase 7.5/7.6)

- Page component renders with panel
- Panel receives correct props from page state
- Save handler updates panel visibility
- Auto-open logic triggers on pending status
- Close handler navigates appropriately

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| TranslationPreviewPanel not yet implemented | Medium | High | Feature flag to hide panel until REQ-310 complete |
| useTranslationStatus hook not available | Medium | High | Stub with mock data, implement basic fetch inline |
| User confusion about post-save behavior change | Low | Medium | Clear UI messaging: "Translations in progress" |
| Performance impact from translation status fetch | Low | Low | Lazy load, debounce, cache responses |
| Panel blocking editor content on mobile | Low | Medium | Responsive design, full-screen panel on mobile |

---

## UX Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Article Editor Page                           │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    InstructionEditor                         │   │
│  │                                                              │   │
│  │   Article Title: [How to Use the Dishwasher          ]     │   │
│  │   Tags: [kitchen] [appliance]                                │   │
│  │   Content: [Video: Loading dishes...]                        │   │
│  │                                                              │   │
│  │                              [Cancel]  [Save Changes]        │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│                            User clicks "Save Changes"               │
│                                      │                              │
│                                      ▼                              │
│                        ┌─────────────────────────┐                 │
│                        │   Save API Success      │                 │
│                        │   Check translations... │                 │
│                        └──────────┬──────────────┘                 │
│                                   │                                 │
│              ┌────────────────────┴────────────────────┐           │
│              │                                         │           │
│              ▼                                         ▼           │
│     Has Pending/Failed                        All Complete         │
│              │                                         │           │
│              ▼                                         ▼           │
│     Auto-open Panel                        Panel Available          │
│              │                             (User can open)          │
│              │                                         │           │
└──────────────┼─────────────────────────────────────────┼───────────┘
               │                                         │
               ▼                                         │
┌──────────────────────────────────────────────┐        │
│  TranslationPreviewPanel (400px, right)       │        │
│  ┌──────────────────────────────────────┐    │        │
│  │ Translations                    [X]   │    │        │
│  ├──────────────────────────────────────┤    │        │
│  │ Source (English):                     │    │        │
│  │ How to Use the Dishwasher             │    │        │
│  │ Load dishes on the lower...           │    │        │
│  ├──────────────────────────────────────┤    │        │
│  │ 🇫🇷 Français ⏳ Processing            │    │        │
│  │ 🇪🇸 Español  ✓ Complete   [Edit] [↻] │    │        │
│  │ 🇩🇪 Deutsch  ⏳ Processing            │    │        │
│  │ 🇳🇱 Dutch    ✓ Complete   [Edit] [↻] │    │        │
│  │ 🇮🇹 Italiano ❌ Failed     [Retry]    │    │        │
│  ├──────────────────────────────────────┤    │        │
│  │           [Re-translate All] [Done]   │    │        │
│  └──────────────────────────────────────┘    │        │
└──────────────────────────────────────────────┘        │
               │                                         │
               └────────── User clicks "Done" ───────────┘
                                   │
                                   ▼
                   Navigate to /dashboard2/instructions
```

---

## References

- [Plan-111-L10N-Epic5-Owner-Translation-Management.md](/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md) - Full epic implementation plan
- [REQ-310-create-translationpreviewpanel-component-overview.md](/docs/REQ-310-create-translationpreviewpanel-component-overview.md) - Panel component specification
- [InstructionEditor.tsx](/src/components/InstructionEditor/InstructionEditor.tsx) - Current editor implementation
- [Edit page.tsx](/src/app/dashboard2/instructions/[articleId]/edit/page.tsx) - Current article edit page
- [gen_requests_epic5.md](/docs/gen_requests_epic5.md) - Original request (REQ-330)
