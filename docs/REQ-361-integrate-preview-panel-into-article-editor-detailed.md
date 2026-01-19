# REQ-361: Integrate Translation Preview Panel into Article Editor - Detailed Task Breakdown

**Document Created:** 2026-01-19
**Last Modified:** 2026-01-19
**Status:** Ready for Implementation
**Epic:** L10N Epic 5 - Owner Translation Management
**Phase:** 7 - Integration & Polish
**Task ID:** 7.1
**Size:** M (Medium)
**Estimated Effort:** 4-6 hours

---

## Document References

| Document | Path |
|----------|------|
| Overview Document | `/docs/REQ-361-integrate-preview-panel-into-article-editor-overview.md` |
| Requirements Document | `/docs/gen_requests_epic5.md` (REQ-361) |
| Implementation Plan | `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md` |
| Target File | `/src/app/dashboard2/instructions/[articleId]/edit/page.tsx` |

---

## Prerequisites and Dependencies

### Required Components (from earlier phases)

| Component | Location | Phase | Status |
|-----------|----------|-------|--------|
| `TranslationPreviewPanel` | `/src/components/TranslationManagement/TranslationPreviewPanel/` | Phase 2 (Task 2.2) | **Must exist** |
| `TranslationStatusItem` | `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx` | Phase 2 (Task 2.3) | **Must exist** |
| `TranslationProgressBar` | `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationProgressBar.tsx` | Phase 2 (Task 2.4) | **Must exist** |
| `TranslationEditor` | `/src/components/TranslationManagement/TranslationEditor/TranslationEditor.tsx` | Phase 2 (Task 2.5) | **Must exist** |
| `useTranslationStatus` hook | `/src/hooks/useTranslationStatus.ts` | Phase 2 (Task 2.6) | **Must exist** |
| `useTranslationRealtime` hook | `/src/hooks/useTranslationRealtime.ts` | Phase 2 (Task 2.7) | **Must exist** |
| Translation Status API | `/src/app/api/translations/status/route.ts` | Phase 1 (Task 1.1) | **Must exist** |

### Database Prerequisites

- `article_translations` table must exist with `translation_status` column
- Valid status values: `'pending'`, `'processing'`, `'completed'`, `'failed'`, `'manual'`

---

## Task Breakdown

### Task 1: Add Required Imports
**Estimated Time:** 5 minutes
**File:** `/src/app/dashboard2/instructions/[articleId]/edit/page.tsx`

#### Current Imports (Lines 16-22)
```typescript
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { useAuth, useAccountContext } from '@/contexts/AuthContext';
import { adminApi } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { InstructionEditor } from '@/components/InstructionEditor';
import type { ArticleEditData, UpdateArticlePayload } from '@/components/InstructionEditor';
```

#### New Imports to Add
```typescript
// Add after existing imports
import { TranslationPreviewPanel } from '@/components/TranslationManagement';
import type { SupportedLocale } from '@/lib/i18n/config';
```

#### Acceptance Criteria
- [ ] `TranslationPreviewPanel` component imported from `@/components/TranslationManagement`
- [ ] `SupportedLocale` type imported from `@/lib/i18n/config`
- [ ] No TypeScript errors on import statements
- [ ] Build succeeds with new imports

---

### Task 2: Add State Variables for Translation Panel
**Estimated Time:** 10 minutes
**File:** `/src/app/dashboard2/instructions/[articleId]/edit/page.tsx`

#### Current State Variables (Lines 32-35)
```typescript
const [loading, setLoading] = useState(true);
const [error, setError] = useState<Error | null>(null);
const [articleData, setArticleData] = useState<ArticleEditData | null>(null);
const [isSaving, setIsSaving] = useState(false);
```

#### New State Variables to Add
```typescript
// Add after existing state variables (after line 35)

/**
 * Controls visibility of the TranslationPreviewPanel
 */
const [showTranslationPanel, setShowTranslationPanel] = useState(false);

/**
 * Stores article data needed for the translation panel after save
 * Contains entity info and source content for preview
 */
const [savedArticleData, setSavedArticleData] = useState<{
  entityType: 'article';
  entityId: string;
  sourceLanguage: SupportedLocale;
  sourceContent: { title: string; description?: string };
} | null>(null);
```

#### Type Definition
```typescript
// Interface for the saved article data (add inline or to types file)
interface TranslationPanelData {
  entityType: 'article';
  entityId: string;
  sourceLanguage: SupportedLocale;
  sourceContent: {
    title: string;
    description?: string;
  };
}
```

#### Acceptance Criteria
- [ ] `showTranslationPanel` state variable declared with `useState(false)`
- [ ] `savedArticleData` state variable declared with proper type
- [ ] Type definition includes all required fields: `entityType`, `entityId`, `sourceLanguage`, `sourceContent`
- [ ] No TypeScript errors on state declarations

---

### Task 3: Modify handleSave Function
**Estimated Time:** 20 minutes
**File:** `/src/app/dashboard2/instructions/[articleId]/edit/page.tsx`

#### Current handleSave Implementation (Lines 122-182)
The current implementation:
1. Validates `articleData` and `currentAccount`
2. Processes links
3. Builds API payload
4. Calls `adminApi.updateArticle()`
5. On success: Sets `sessionStorage.setItem('editSuccess', 'true')`
6. Redirects immediately to `/dashboard2/instructions`

#### Modified handleSave Implementation
Replace the success handling (lines 169-175) with:

```typescript
const handleSave = useCallback(async (payload: UpdateArticlePayload) => {
  if (!articleData || !currentAccount) {
    throw new Error('Missing data or account context');
  }

  setIsSaving(true);

  try {
    const headers: Record<string, string> = {
      'x-current-account': currentAccount.id,
    };

    // Process links with file uploads (existing logic)
    const processedLinks = await Promise.all(
      payload.links.map(async (link) => {
        return {
          id: link.id,
          title: link.title,
          linkType: link.linkType,
          url: link.url,
          thumbnailUrl: link.thumbnailUrl,
          displayOrder: link.displayOrder,
        };
      })
    );

    // Build API payload (existing logic)
    const apiPayload: any = {
      title: payload.title,
      links: processedLinks,
    };

    if (payload.itemTags) {
      apiPayload.itemTags = payload.itemTags;
    }

    // Update article
    const response = await adminApi.updateArticle(articleId, apiPayload, headers);

    if (!response.success) {
      throw new Error(response.error || 'Failed to update article');
    }

    console.log('Article updated successfully:', response.data);

    // Set success flag for list page (will be used when panel closes)
    sessionStorage.setItem('editSuccess', 'true');

    // NEW: Instead of immediate redirect, show translation panel
    setSavedArticleData({
      entityType: 'article',
      entityId: articleId,
      sourceLanguage: (articleData as any).sourceLanguage || 'en',
      sourceContent: {
        title: payload.title,
        description: articleData.description || undefined,
      },
    });
    setShowTranslationPanel(true);

    // DO NOT redirect here - let panel handle navigation via onClose
  } catch (error) {
    console.error('Error saving article:', error);
    throw error;
  } finally {
    setIsSaving(false);
  }
}, [articleId, articleData, currentAccount]);
```

#### Key Changes
| Change | Before | After |
|--------|--------|-------|
| After success | Immediate `router.push()` | Set panel state, show panel |
| sessionStorage | Same | Same (kept for list page) |
| Navigation | Immediate | Deferred to panel close |

#### Acceptance Criteria
- [ ] `handleSave` no longer calls `router.push()` on success
- [ ] `setSavedArticleData()` called with correct entity data
- [ ] `setShowTranslationPanel(true)` called after successful save
- [ ] `sessionStorage.setItem('editSuccess', 'true')` still executed
- [ ] Error handling remains unchanged
- [ ] `isSaving` state management unchanged

---

### Task 4: Add Panel Close Handler
**Estimated Time:** 10 minutes
**File:** `/src/app/dashboard2/instructions/[articleId]/edit/page.tsx`

#### New Function to Add
Add after `handleCancel` function (around line 189):

```typescript
/**
 * Handle translation panel close - navigate back to instructions list
 * This is called when user clicks Close button or dismisses the panel
 */
const handleTranslationPanelClose = useCallback(() => {
  setShowTranslationPanel(false);
  setSavedArticleData(null);
  // Navigate to instructions list
  router.push('/dashboard2/instructions');
}, [router]);
```

#### Acceptance Criteria
- [ ] `handleTranslationPanelClose` function created with `useCallback`
- [ ] Function sets `showTranslationPanel` to `false`
- [ ] Function sets `savedArticleData` to `null` (cleanup)
- [ ] Function navigates to `/dashboard2/instructions`
- [ ] `router` included in dependency array

---

### Task 5: Add Auto-Open Logic on Page Load
**Estimated Time:** 25 minutes
**File:** `/src/app/dashboard2/instructions/[articleId]/edit/page.tsx`

#### New useEffect Hook
Add after the existing "Fetch article data on mount" useEffect (after line 117):

```typescript
/**
 * Check for pending/processing translations on page load
 * Auto-open the translation preview panel if translations are in progress
 */
useEffect(() => {
  const checkPendingTranslations = async () => {
    // Only check after article data is loaded and we have account context
    if (!articleData || !currentAccount) {
      return;
    }

    try {
      const response = await fetch(
        `/api/translations/status?entityType=article&entityId=${articleId}`,
        {
          headers: {
            'x-current-account': currentAccount.id,
          },
        }
      );

      if (!response.ok) {
        // Non-critical error - don't block editor functionality
        console.warn('Failed to check translation status:', response.statusText);
        return;
      }

      const data = await response.json();

      // Check if any translations are in pending or processing status
      const hasPendingOrProcessing = data.items?.[0]?.translations &&
        Object.values(data.items[0].translations).some(
          (translation: any) =>
            translation.status === 'pending' ||
            translation.status === 'processing'
        );

      if (hasPendingOrProcessing) {
        // Auto-open panel with current article data
        setSavedArticleData({
          entityType: 'article',
          entityId: articleId,
          sourceLanguage: (articleData as any).sourceLanguage || 'en',
          sourceContent: {
            title: articleData.title,
            description: articleData.description || undefined,
          },
        });
        setShowTranslationPanel(true);
      }
    } catch (error) {
      // Non-critical error - log but don't interrupt editor
      console.error('Failed to check translation status:', error);
    }
  };

  checkPendingTranslations();
}, [articleId, articleData, currentAccount]);
```

#### API Response Expected Format
```json
{
  "summary": { "total": 5, "complete": 2, "partial": 0, "pending": 2, "failed": 1 },
  "items": [{
    "entityType": "article",
    "entityId": "uuid-here",
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

#### Acceptance Criteria
- [ ] useEffect runs after `articleData` is loaded
- [ ] API call made to `/api/translations/status` with correct query params
- [ ] `x-current-account` header included in request
- [ ] Panel auto-opens if any translation has `status === 'pending'` or `status === 'processing'`
- [ ] Panel does NOT auto-open if all translations are `completed`, `failed`, or `manual`
- [ ] Errors are logged but do not block editor functionality
- [ ] Dependency array includes `articleId`, `articleData`, `currentAccount`

---

### Task 6: Update Return Statement with Panel Rendering
**Estimated Time:** 15 minutes
**File:** `/src/app/dashboard2/instructions/[articleId]/edit/page.tsx`

#### Current Return Statement (Lines 246-253)
```tsx
return (
  <InstructionEditor
    articleData={articleData}
    onSave={handleSave}
    onCancel={handleCancel}
    isSaving={isSaving}
  />
);
```

#### Modified Return Statement
```tsx
return (
  <>
    <InstructionEditor
      articleData={articleData}
      onSave={handleSave}
      onCancel={handleCancel}
      isSaving={isSaving}
    />

    {/* Translation Preview Panel - slides in from right after save */}
    {savedArticleData && (
      <TranslationPreviewPanel
        entityType={savedArticleData.entityType}
        entityId={savedArticleData.entityId}
        sourceLanguage={savedArticleData.sourceLanguage}
        sourceContent={savedArticleData.sourceContent}
        isOpen={showTranslationPanel}
        onClose={handleTranslationPanelClose}
        onTranslationEdited={(language) => {
          console.log(`Translation edited for language: ${language}`);
          // Optionally trigger a refresh or update UI
        }}
      />
    )}
  </>
);
```

#### TranslationPreviewPanel Props Reference
```typescript
interface TranslationPreviewPanelProps {
  /** Entity type being previewed */
  entityType: 'article' | 'item' | 'link';
  /** Entity ID */
  entityId: string;
  /** Source language of the content */
  sourceLanguage: SupportedLocale;
  /** Source content for comparison */
  sourceContent: {
    title?: string;
    description?: string;
    name?: string;
  };
  /** Whether panel is open */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
  /** Optional: Callback when translation is manually edited */
  onTranslationEdited?: (language: SupportedLocale) => void;
}
```

#### Acceptance Criteria
- [ ] Return wrapped in React Fragment (`<>...</>`)
- [ ] `TranslationPreviewPanel` rendered conditionally when `savedArticleData` exists
- [ ] All required props passed: `entityType`, `entityId`, `sourceLanguage`, `sourceContent`, `isOpen`, `onClose`
- [ ] Optional `onTranslationEdited` callback provided
- [ ] Panel only renders when there's saved article data
- [ ] `isOpen` controlled by `showTranslationPanel` state

---

### Task 7: Handle Optional sourceLanguage in ArticleEditData
**Estimated Time:** 15 minutes
**File:** `/src/app/dashboard2/instructions/[articleId]/edit/page.tsx`

#### Issue
The `ArticleEditData` interface may not include `sourceLanguage`. Need to ensure it's fetched from API and available.

#### Check/Update fetchArticleData Function
Update the data transformation (around line 73-93):

```typescript
// Transform to ArticleEditData format
const editData: ArticleEditData = {
  articleId: article.id,
  itemId: item.id,
  purpose: article.purpose,
  title: article.title || '',
  description: article.description || null,
  // Add source_language from API response
  sourceLanguage: article.source_language || 'en',
  item: {
    id: item.id,
    name: item.name,
    tags: item.tags || [],
  },
  links: (article.links || []).map((link: any) => ({
    id: link.id,
    title: link.title,
    linkType: link.link_type || link.linkType,
    url: link.url,
    thumbnailUrl: link.thumbnail_url || link.thumbnailUrl,
    displayOrder: link.display_order || link.displayOrder || 0,
  })),
};
```

#### Option A: Extend ArticleEditData Type (Preferred)
If type needs extension, update `/src/components/InstructionEditor/InstructionEditor.types.ts`:

```typescript
export interface ArticleEditData {
  articleId: string;
  itemId: string;
  purpose: string;
  title: string;
  description: string | null;
  sourceLanguage?: SupportedLocale;  // ADD THIS LINE
  item: { id: string; name: string; tags: string[]; };
  links: ArticleLinkData[];
}
```

#### Option B: Use Type Assertion (Fallback)
If modifying the type is not feasible, use type assertion:
```typescript
sourceLanguage: (articleData as any).sourceLanguage || 'en',
```

#### Acceptance Criteria
- [ ] `sourceLanguage` available in article data after fetch
- [ ] Defaults to `'en'` if not present in API response
- [ ] No TypeScript errors when accessing `sourceLanguage`
- [ ] Type safety maintained (prefer Option A over Option B)

---

### Task 8: Verify Build and Test
**Estimated Time:** 20 minutes

#### Build Verification
```bash
npm run build
```

#### Expected Outcomes
- [ ] No TypeScript compilation errors
- [ ] No ESLint errors
- [ ] Build completes successfully

#### Manual Testing Scenarios

##### Test Case 1: Save Article and Panel Opens
1. Navigate to `/dashboard2/instructions/{articleId}/edit`
2. Make a change to article title
3. Click Save
4. **Expected:** Panel slides in from right showing translation statuses
5. **Expected:** Page does NOT redirect to instructions list
6. Click Close button on panel
7. **Expected:** Navigates to `/dashboard2/instructions`

##### Test Case 2: Auto-Open on Page Load with Pending Translations
1. Have an article with pending translations in database
2. Navigate to `/dashboard2/instructions/{articleId}/edit`
3. **Expected:** Panel auto-opens showing pending translation statuses

##### Test Case 3: No Auto-Open When All Complete
1. Have an article with all translations completed
2. Navigate to `/dashboard2/instructions/{articleId}/edit`
3. **Expected:** Panel does NOT auto-open
4. Edit and save
5. **Expected:** Panel opens after save

##### Test Case 4: Panel Actions Work
1. After panel opens, verify:
   - Source content (title, description) displayed correctly
   - Each language (fr, es, de, nl, it) shows status
   - Progress bar shows completion (e.g., "3/5 complete")
   - Edit buttons work on completed translations
   - Re-translate buttons trigger re-translation
   - Retry buttons work on failed translations

##### Test Case 5: Error Handling
1. Simulate API failure (network offline or mock error)
2. **Expected:** Editor remains functional, error logged to console
3. **Expected:** Panel does not auto-open, no crash

#### Acceptance Criteria
- [ ] Build succeeds without errors
- [ ] Test Case 1 passes
- [ ] Test Case 2 passes
- [ ] Test Case 3 passes
- [ ] Test Case 4 passes
- [ ] Test Case 5 passes

---

## Complete Code Diff Summary

### New Imports
```diff
 import { useRouter, useParams } from 'next/navigation';
 import { useEffect, useState, useCallback } from 'react';
 import { useAuth, useAccountContext } from '@/contexts/AuthContext';
 import { adminApi } from '@/lib/api';
 import { Loader2 } from 'lucide-react';
 import { InstructionEditor } from '@/components/InstructionEditor';
 import type { ArticleEditData, UpdateArticlePayload } from '@/components/InstructionEditor';
+import { TranslationPreviewPanel } from '@/components/TranslationManagement';
+import type { SupportedLocale } from '@/lib/i18n/config';
```

### New State Variables
```diff
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<Error | null>(null);
   const [articleData, setArticleData] = useState<ArticleEditData | null>(null);
   const [isSaving, setIsSaving] = useState(false);
+  const [showTranslationPanel, setShowTranslationPanel] = useState(false);
+  const [savedArticleData, setSavedArticleData] = useState<{
+    entityType: 'article';
+    entityId: string;
+    sourceLanguage: SupportedLocale;
+    sourceContent: { title: string; description?: string };
+  } | null>(null);
```

### Modified handleSave (success path)
```diff
-      // Set success flag for list page
-      sessionStorage.setItem('editSuccess', 'true');
-
-      // Redirect to list page
-      router.push('/dashboard2/instructions');
+      // Set success flag for list page (will be used when panel closes)
+      sessionStorage.setItem('editSuccess', 'true');
+
+      // Show translation panel instead of immediate redirect
+      setSavedArticleData({
+        entityType: 'article',
+        entityId: articleId,
+        sourceLanguage: (articleData as any).sourceLanguage || 'en',
+        sourceContent: {
+          title: payload.title,
+          description: articleData.description || undefined,
+        },
+      });
+      setShowTranslationPanel(true);
```

### New Handler
```diff
+  const handleTranslationPanelClose = useCallback(() => {
+    setShowTranslationPanel(false);
+    setSavedArticleData(null);
+    router.push('/dashboard2/instructions');
+  }, [router]);
```

### New useEffect for Auto-Open
```diff
+  useEffect(() => {
+    const checkPendingTranslations = async () => {
+      if (!articleData || !currentAccount) return;
+      try {
+        const response = await fetch(
+          `/api/translations/status?entityType=article&entityId=${articleId}`,
+          { headers: { 'x-current-account': currentAccount.id } }
+        );
+        if (response.ok) {
+          const data = await response.json();
+          const hasPending = data.items?.[0]?.translations &&
+            Object.values(data.items[0].translations).some(
+              (t: any) => t.status === 'pending' || t.status === 'processing'
+            );
+          if (hasPending) {
+            setSavedArticleData({
+              entityType: 'article',
+              entityId: articleId,
+              sourceLanguage: (articleData as any).sourceLanguage || 'en',
+              sourceContent: {
+                title: articleData.title,
+                description: articleData.description || undefined,
+              },
+            });
+            setShowTranslationPanel(true);
+          }
+        }
+      } catch (error) {
+        console.error('Failed to check translation status:', error);
+      }
+    };
+    checkPendingTranslations();
+  }, [articleId, articleData, currentAccount]);
```

### Modified Return
```diff
   return (
-    <InstructionEditor
-      articleData={articleData}
-      onSave={handleSave}
-      onCancel={handleCancel}
-      isSaving={isSaving}
-    />
+    <>
+      <InstructionEditor
+        articleData={articleData}
+        onSave={handleSave}
+        onCancel={handleCancel}
+        isSaving={isSaving}
+      />
+      {savedArticleData && (
+        <TranslationPreviewPanel
+          entityType={savedArticleData.entityType}
+          entityId={savedArticleData.entityId}
+          sourceLanguage={savedArticleData.sourceLanguage}
+          sourceContent={savedArticleData.sourceContent}
+          isOpen={showTranslationPanel}
+          onClose={handleTranslationPanelClose}
+          onTranslationEdited={(language) => {
+            console.log(`Translation edited for language: ${language}`);
+          }}
+        />
+      )}
+    </>
   );
```

---

## Edge Cases and Error Handling

| Scenario | Handling |
|----------|----------|
| TranslationPreviewPanel component not yet available | Import will fail at build time - ensure Phase 2 is complete |
| Translation Status API unavailable | Log error, skip auto-open, editor remains functional |
| No translations exist yet for article | Panel opens with all statuses showing "pending" |
| User closes panel before translations complete | Navigation proceeds, user can return later to check status |
| Save fails | Existing error handling unchanged, panel not shown |
| Network error during status check | Catch error, log warning, editor continues normally |
| articleData.sourceLanguage is undefined | Default to `'en'` |

---

## Rollback Plan

If issues are encountered after deployment:

1. **Quick Fix:** Remove the conditional rendering of `TranslationPreviewPanel`
2. **Revert handleSave:** Restore immediate redirect to `/dashboard2/instructions`
3. **Remove useEffect:** Remove the auto-open check effect

```typescript
// Minimal rollback - restore original handleSave success path
sessionStorage.setItem('editSuccess', 'true');
router.push('/dashboard2/instructions');
```

---

## References

| Resource | Location |
|----------|----------|
| Overview Document | `/docs/REQ-361-integrate-preview-panel-into-article-editor-overview.md` |
| Implementation Plan | `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md` |
| Current Edit Page | `/src/app/dashboard2/instructions/[articleId]/edit/page.tsx` |
| TranslationPreviewPanel (Phase 2) | `/src/components/TranslationManagement/TranslationPreviewPanel/` |
| i18n Config | `/src/lib/i18n/config.ts` |
| Translation Status API | `/src/app/api/translations/status/route.ts` |

---

*Document generated for FAQBNB Localization Epic 5 - Owner Translation Management*
*Task 7.1: Integrate preview panel into article editor*
