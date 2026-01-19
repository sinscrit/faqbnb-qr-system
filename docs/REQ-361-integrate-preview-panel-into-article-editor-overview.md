# REQ-361: Integrate Translation Preview Panel into Article Editor - Implementation Overview

**Document Created:** 2026-01-19
**Last Modified:** 2026-01-19
**Status:** Draft
**Epic:** L10N Epic 5 - Owner Translation Management
**Phase:** 7 - Integration & Polish
**Task ID:** 7.1
**Size:** M (Medium)

---

## 1. Summary

This task integrates the `TranslationPreviewPanel` component into the article editor page (`/src/app/dashboard2/instructions/[articleId]/edit/page.tsx`). The panel will automatically appear after a successful save operation and will auto-open on page load if there are pending or in-progress translations for the article being edited.

---

## 2. Current Behavior

Currently, the article editor at `/src/app/dashboard2/instructions/[articleId]/edit/page.tsx`:
- Uses the `InstructionEditor` component for article editing
- After successful save, immediately redirects to `/dashboard2/instructions` (instructions list page)
- Has no awareness of translation status or translation workflow
- Does not provide any feedback about translations being processed

**Relevant Code Snippet (Current Save Flow):**
```typescript
// From page.tsx lines 163-175
const response = await adminApi.updateArticle(articleId, apiPayload, headers);
if (!response.success) {
  throw new Error(response.error || 'Failed to update article');
}
// Set success flag for list page
sessionStorage.setItem('editSuccess', 'true');
// Redirect to list page
router.push('/dashboard2/instructions');
```

---

## 3. Expected Behavior

After implementation:

1. **After Save Success:**
   - The page will NOT immediately redirect to the instructions list
   - Instead, the `TranslationPreviewPanel` will slide in from the right
   - User can view real-time translation status for all target languages (fr, es, de, nl, it)
   - User can edit individual translations, trigger re-translation, or retry failed translations
   - User clicks "Close" button to navigate back to the instructions list

2. **Auto-Open on Page Load:**
   - When the edit page loads, check if any translations for this article are in `pending` or `processing` status
   - If pending/processing translations exist, automatically open the `TranslationPreviewPanel`
   - This allows users returning to the editor to immediately see translation progress

3. **Panel Features Available:**
   - View source content (article title, description)
   - See translation status for each of 6 target languages
   - Progress bar showing "X/5 complete"
   - Edit button for each completed translation
   - Re-translate button for individual languages
   - Retry button for failed translations
   - Re-translate All button in footer
   - Close button to navigate away

---

## 4. Technical Context

### 4.1 Dependencies from Previous Phases

| Dependency | Location | Status | Required By |
|------------|----------|--------|-------------|
| `TranslationPreviewPanel` component | `/src/components/TranslationManagement/TranslationPreviewPanel/` | Phase 2 (Task 2.2) | This task |
| `TranslationStatusItem` component | `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx` | Phase 2 (Task 2.3) | TranslationPreviewPanel |
| `TranslationProgressBar` component | `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationProgressBar.tsx` | Phase 2 (Task 2.4) | TranslationPreviewPanel |
| `TranslationEditor` component | `/src/components/TranslationManagement/TranslationEditor/TranslationEditor.tsx` | Phase 2 (Task 2.5) | For editing translations |
| `useTranslationStatus` hook | `/src/hooks/useTranslationStatus.ts` | Phase 2 (Task 2.6) | Fetching translation status |
| `useTranslationRealtime` hook | `/src/hooks/useTranslationRealtime.ts` | Phase 2 (Task 2.7) | Real-time status updates |
| Translation Status API | `/src/app/api/translations/status/route.ts` | Phase 1 (Task 1.1) | Status fetching |
| `article_translations` table | Database | Epic 1 | Data source |

### 4.2 Existing Patterns to Follow

| Pattern | Reference File | Usage |
|---------|----------------|-------|
| Radix Dialog slide-out | `/src/components/ItemManager/components/ItemPreview/ItemPreviewModal.tsx` | Panel animation and structure |
| Page state management | `/src/app/dashboard2/instructions/[articleId]/edit/page.tsx` | useState/useCallback patterns |
| Conditional rendering | Current page already uses loading/error states | Panel visibility |
| AuthContext usage | Current page uses `useAuth`, `useAccountContext` | Validation |

### 4.3 Translation Table Schema Reference

```sql
-- article_translations table (from Epic 1)
article_translations (
  id UUID PRIMARY KEY,
  article_id UUID REFERENCES item_articles(id),
  language VARCHAR(2) CHECK (language IN ('en','fr','es','de','nl','it')),
  title VARCHAR,
  description TEXT,
  translation_status VARCHAR DEFAULT 'pending'
    CHECK (translation_status IN ('pending','processing','completed','failed','manual')),
  translated_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

---

## 5. Implementation Approach

### 5.1 State Management Changes

Add the following state to `EditArticlePage`:

```typescript
// New state for translation preview panel
const [showTranslationPanel, setShowTranslationPanel] = useState(false);
const [savedArticleData, setSavedArticleData] = useState<{
  entityType: 'article';
  entityId: string;
  sourceLanguage: SupportedLanguage;
  sourceContent: { title: string; description?: string };
} | null>(null);
```

### 5.2 Modified Save Flow

```typescript
const handleSave = useCallback(async (payload: UpdateArticlePayload) => {
  // ... existing save logic ...

  const response = await adminApi.updateArticle(articleId, apiPayload, headers);

  if (!response.success) {
    throw new Error(response.error || 'Failed to update article');
  }

  // NEW: Instead of immediate redirect, show translation panel
  setSavedArticleData({
    entityType: 'article',
    entityId: articleId,
    sourceLanguage: articleData.sourceLanguage || 'en',
    sourceContent: {
      title: payload.title,
      description: articleData.description || undefined,
    },
  });
  setShowTranslationPanel(true);

  // Store success flag (panel close will redirect)
  sessionStorage.setItem('editSuccess', 'true');

  // DO NOT redirect here - let panel handle navigation
}, [articleId, articleData, currentAccount]);
```

### 5.3 Auto-Open Logic on Page Load

```typescript
// After article data is fetched, check for pending translations
useEffect(() => {
  const checkPendingTranslations = async () => {
    if (!articleData || !currentAccount) return;

    try {
      const response = await fetch(
        `/api/translations/status?entityType=article&entityId=${articleId}`,
        { headers: { 'x-current-account': currentAccount.id } }
      );

      if (response.ok) {
        const data = await response.json();
        const hasPending = data.items?.[0]?.translations &&
          Object.values(data.items[0].translations).some(
            (t: any) => t.status === 'pending' || t.status === 'processing'
          );

        if (hasPending) {
          setSavedArticleData({
            entityType: 'article',
            entityId: articleId,
            sourceLanguage: articleData.sourceLanguage || 'en',
            sourceContent: {
              title: articleData.title,
              description: articleData.description || undefined,
            },
          });
          setShowTranslationPanel(true);
        }
      }
    } catch (error) {
      console.error('Failed to check translation status:', error);
      // Non-critical error - don't block editor functionality
    }
  };

  checkPendingTranslations();
}, [articleId, articleData, currentAccount]);
```

### 5.4 Panel Close Handler

```typescript
const handleTranslationPanelClose = useCallback(() => {
  setShowTranslationPanel(false);
  // Navigate to instructions list after panel closes
  router.push('/dashboard2/instructions');
}, [router]);
```

### 5.5 Render Changes

```tsx
return (
  <>
    <InstructionEditor
      articleData={articleData}
      onSave={handleSave}
      onCancel={handleCancel}
      isSaving={isSaving}
    />

    {/* Translation Preview Panel */}
    {savedArticleData && (
      <TranslationPreviewPanel
        entityType={savedArticleData.entityType}
        entityId={savedArticleData.entityId}
        sourceLanguage={savedArticleData.sourceLanguage}
        sourceContent={savedArticleData.sourceContent}
        isOpen={showTranslationPanel}
        onClose={handleTranslationPanelClose}
        onTranslationEdited={(lang) => {
          console.log(`Translation edited for ${lang}`);
        }}
      />
    )}
  </>
);
```

---

## 6. Authorized Files and Functions for Modification

### 6.1 Primary File to Modify

| File | Path | Changes |
|------|------|---------|
| Article Edit Page | `/src/app/dashboard2/instructions/[articleId]/edit/page.tsx` | Main integration work |

### 6.2 Functions to Modify

| Function | Lines | Description of Change |
|----------|-------|----------------------|
| `EditArticlePage` (component) | 24-254 | Add state for panel, modify save flow |
| `handleSave` | 122-182 | Remove redirect, trigger panel instead |

### 6.3 New Imports to Add

```typescript
// Add to existing imports
import { TranslationPreviewPanel } from '@/components/TranslationManagement';
import type { SupportedLanguage } from '@/lib/i18n/config';
```

### 6.4 New State Variables

| Variable | Type | Purpose |
|----------|------|---------|
| `showTranslationPanel` | `boolean` | Controls panel visibility |
| `savedArticleData` | Object or null | Stores article data for panel after save |

### 6.5 New Functions to Add

| Function | Purpose |
|----------|---------|
| `handleTranslationPanelClose` | Handle panel close and navigate to list |
| Effect for pending check | Check for pending translations on load |

---

## 7. Component Props Interface Reference

```typescript
// From TranslationPreviewPanel (Phase 2 Task 2.2)
interface TranslationPreviewPanelProps {
  entityType: 'article' | 'item' | 'link';
  entityId: string;
  sourceLanguage: SupportedLanguage;
  sourceContent: {
    title?: string;
    description?: string;
    name?: string;
  };
  isOpen: boolean;
  onClose: () => void;
  onTranslationEdited?: (language: SupportedLanguage) => void;
}
```

---

## 8. ArticleEditData Extension

The existing `ArticleEditData` interface may need extension for source language:

```typescript
// Current (from InstructionEditor.types.ts)
export interface ArticleEditData {
  articleId: string;
  itemId: string;
  purpose: string;
  title: string;
  description: string | null;
  item: { id: string; name: string; tags: string[]; };
  links: ArticleLinkData[];
}

// May need to add (if not already present):
export interface ArticleEditData {
  // ... existing fields ...
  sourceLanguage?: SupportedLanguage;  // Add if missing
}
```

**Note:** Check if `source_language` is already being fetched from the API. If not, the `fetchArticleData` function may need modification to include it.

---

## 9. API Dependency

This task depends on the Translation Status API from Phase 1 Task 1.1:

```
GET /api/translations/status?entityType=article&entityId={articleId}
```

**Expected Response:**
```json
{
  "summary": { "total": 5, "complete": 2, "partial": 0, "pending": 2, "failed": 1 },
  "items": [{
    "entityType": "article",
    "entityId": "uuid",
    "name": "Article Title",
    "sourceLanguage": "en",
    "translations": {
      "fr": { "status": "completed", "translatedAt": "2026-01-19T10:00:00Z" },
      "es": { "status": "pending" },
      "de": { "status": "processing" },
      "nl": { "status": "completed", "translatedAt": "2026-01-19T10:01:00Z" },
      "it": { "status": "failed" }
    }
  }]
}
```

---

## 10. Edge Cases and Error Handling

| Scenario | Handling |
|----------|----------|
| TranslationPreviewPanel not yet available | Wrap import in try-catch or conditional check |
| Translation Status API unavailable | Log error, don't block editor, skip auto-open |
| No translations exist yet | Panel still shows with all "pending" status |
| User closes panel before translations complete | Navigation proceeds, user can return later |
| Save fails | Existing error handling unchanged, panel not shown |

---

## 11. Testing Considerations

### 11.1 Manual Testing Scenarios

1. **Save and Panel Opens:**
   - Edit article → Save → Panel should slide in from right
   - Panel shows source content and translation statuses

2. **Auto-Open on Load:**
   - Article with pending translations → Navigate to edit page → Panel auto-opens

3. **Panel Actions:**
   - Click Edit on completed translation → Translation editor opens
   - Click Re-translate → Job queued, status updates
   - Click Close → Navigates to /dashboard2/instructions

4. **No Pending Translations:**
   - Article with all completed translations → Edit page → Panel does NOT auto-open

### 11.2 Component Tests

- Verify `TranslationPreviewPanel` receives correct props
- Verify panel opens when `showTranslationPanel` is true
- Verify close handler triggers navigation

---

## 12. Acceptance Criteria Mapping

| Criteria | Implementation |
|----------|----------------|
| Panel appears after save | Modified `handleSave` sets state instead of redirecting |
| Auto-opens if pending translations | useEffect checks status on article data load |
| Displays translation status | TranslationPreviewPanel renders status for each language |
| All languages visible | Panel shows en, fr, es, de, nl, it with status icons |

---

## 13. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| TranslationPreviewPanel component not ready | Medium | High | Check Phase 2 completion before starting |
| Translation Status API not ready | Medium | High | Stub API or mock response for development |
| Performance impact on page load | Low | Medium | Make status check async, don't block render |
| User confusion about new flow | Low | Low | Panel has clear Close button with expected behavior |

---

## 14. Related Tasks

| Task ID | Title | Relationship |
|---------|-------|--------------|
| 2.2 | Create TranslationPreviewPanel | Provides component used here |
| 2.6 | Create useTranslationStatus hook | May use for status fetching |
| 2.7 | Create useTranslationRealtime hook | Real-time updates in panel |
| 1.1 | Create translation status API | API dependency |
| 7.2 | Integrate preview panel into item editor | Similar pattern for items |

---

## 15. References

- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- **Request Document:** `/docs/gen_requests_epic5.md` (REQ-361)
- **Current Edit Page:** `/src/app/dashboard2/instructions/[articleId]/edit/page.tsx`
- **InstructionEditor Component:** `/src/components/InstructionEditor/InstructionEditor.tsx`
- **Modal Pattern Reference:** `/src/components/ItemManager/components/ItemPreview/ItemPreviewModal.tsx`
- **Radix Dialog Docs:** https://www.radix-ui.com/primitives/docs/components/dialog

---

*Document generated for FAQBNB Localization Epic 5 - Owner Translation Management*
