# REQ-362: Integrate Translation Preview Panel into Item Editor - Implementation Overview

**Document Created:** 2026-01-19
**Last Modified:** 2026-01-19 14:45 UTC
**Status:** Draft
**Epic:** L10N Epic 5 - Owner Translation Management
**Phase:** 7 - Integration & Polish
**Task ID:** 7.2
**Size:** M (Medium)

---

## 1. Summary

This task integrates the `TranslationPreviewPanel` component into the item editor page (`/src/app/dashboard2/items/[publicId]/edit/page.tsx`). The panel will automatically appear after a successful save operation and will auto-open on page load if there are pending or in-progress translations for the item being edited. This follows the same implementation pattern established in REQ-361 (article editor integration).

---

## 2. Current Behavior

Currently, the item editor at `/src/app/dashboard2/items/[publicId]/edit/page.tsx`:
- Directly manages form state for item editing (name, description, tags, room, item type)
- After successful save via `adminApi.updateItem()`, immediately redirects to `/dashboard2/items`
- Has no awareness of translation status or translation workflow
- Does not provide any feedback about translations being processed

**Relevant Code Snippet (Current Save Flow - Lines 132-173):**
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!item) return;

  setSaving(true);
  setError(null);

  // ... validation and payload preparation ...

  try {
    const response = await adminApi.updateItem(publicId, {
      name,
      description,
      propertyId,
      tags,
      links: [],
    }, headers);

    if (response.success) {
      router.push('/dashboard2/items');  // Immediate redirect
    } else {
      setError(response.error || 'Failed to update item');
    }
  } catch (err) {
    // ... error handling ...
  } finally {
    setSaving(false);
  }
};
```

---

## 3. Expected Behavior

After implementation:

1. **After Save Success:**
   - The page will NOT immediately redirect to the items list
   - Instead, the `TranslationPreviewPanel` will slide in from the right
   - User can view real-time translation status for all target languages (fr, es, de, nl, it)
   - User can edit individual translations, trigger re-translation, or retry failed translations
   - User clicks "Close" button to navigate back to the items list

2. **Auto-Open on Page Load:**
   - When the edit page loads, check if any translations for this item are in `pending` or `processing` status
   - If pending/processing translations exist, automatically open the `TranslationPreviewPanel`
   - This allows users returning to the editor to immediately see translation progress

3. **Panel Features Available:**
   - View source content (item name, description)
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
| `item_translations` table | Database | Epic 1 | Data source |

### 4.2 Existing Patterns to Follow

| Pattern | Reference File | Usage |
|---------|----------------|-------|
| Radix Dialog slide-out | `/src/components/ItemManager/components/ItemPreview/ItemPreviewModal.tsx` | Panel animation and structure |
| Article editor integration | `/src/app/dashboard2/instructions/[articleId]/edit/page.tsx` (REQ-361) | Same pattern for item editor |
| Page state management | Current item edit page already uses useState/useCallback patterns | Panel visibility |
| AuthContext usage | Current page uses `useAuth`, `useAccountContext` | Validation |

### 4.3 Translation Table Schema Reference

```sql
-- item_translations table (from Epic 1)
item_translations (
  id UUID PRIMARY KEY,
  item_id UUID REFERENCES items(id),
  language VARCHAR(2) CHECK (language IN ('en','fr','es','de','nl','it')),
  name VARCHAR,
  description TEXT,
  translation_status VARCHAR DEFAULT 'pending'
    CHECK (translation_status IN ('pending','processing','completed','failed','manual')),
  translated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

### 4.4 Differences from Article Editor (REQ-361)

| Aspect | Article Editor (REQ-361) | Item Editor (REQ-362) |
|--------|--------------------------|----------------------|
| Component wrapping | Uses `InstructionEditor` component | Direct form rendering |
| Entity type | `'article'` | `'item'` |
| Source content fields | `{ title, description }` | `{ name, description }` |
| Entity ID source | `articleId` from params | `publicId` from params → fetch item.id |
| Save handler | `handleSave` callback passed to editor | `handleSubmit` form handler |

---

## 5. Implementation Approach

### 5.1 State Management Changes

Add the following state to `EditItemPage`:

```typescript
// New imports
import { TranslationPreviewPanel } from '@/components/TranslationManagement';
import type { SupportedLocale } from '@/lib/i18n/config';

// New state for translation preview panel (add after existing state)
const [showTranslationPanel, setShowTranslationPanel] = useState(false);
const [savedItemData, setSavedItemData] = useState<{
  entityType: 'item';
  entityId: string;
  sourceLanguage: SupportedLocale;
  sourceContent: { name: string; description?: string };
} | null>(null);
```

### 5.2 Modified Save Flow

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!item) return;

  setSaving(true);
  setError(null);

  // ... existing headers and propertyId validation ...

  try {
    const response = await adminApi.updateItem(publicId, {
      name,
      description,
      propertyId,
      tags,
      links: [],
    }, headers);

    if (response.success) {
      // NEW: Instead of immediate redirect, show translation panel
      setSavedItemData({
        entityType: 'item',
        entityId: item.id,  // Use the item's actual UUID, not publicId
        sourceLanguage: (item as any).sourceLanguage || 'en',
        sourceContent: {
          name: name,
          description: description || undefined,
        },
      });
      setShowTranslationPanel(true);

      // Store success flag (panel close will redirect)
      sessionStorage.setItem('editItemSuccess', 'true');

      // DO NOT redirect here - let panel handle navigation
    } else {
      setError(response.error || 'Failed to update item');
    }
  } catch (err) {
    console.error('Error updating item:', err);
    setError(err instanceof Error ? err.message : 'Failed to update item');
  } finally {
    setSaving(false);
  }
};
```

### 5.3 Auto-Open Logic on Page Load

```typescript
// After item data is fetched, check for pending translations
useEffect(() => {
  const checkPendingTranslations = async () => {
    if (!item || !currentAccount) return;

    try {
      const response = await fetch(
        `/api/translations/status?entityType=item&entityId=${item.id}`,
        { headers: { 'x-current-account': currentAccount.id } }
      );

      if (response.ok) {
        const data = await response.json();
        const hasPending = data.items?.[0]?.translations &&
          Object.values(data.items[0].translations).some(
            (t: any) => t.status === 'pending' || t.status === 'processing'
          );

        if (hasPending) {
          setSavedItemData({
            entityType: 'item',
            entityId: item.id,
            sourceLanguage: (item as any).sourceLanguage || 'en',
            sourceContent: {
              name: item.name,
              description: item.description || undefined,
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
}, [item, currentAccount]);
```

### 5.4 Panel Close Handler

```typescript
const handleTranslationPanelClose = useCallback(() => {
  setShowTranslationPanel(false);
  // Navigate to items list after panel closes
  router.push('/dashboard2/items');
}, [router]);
```

### 5.5 Render Changes

Update the return statement to include the panel (at the end of the existing JSX):

```tsx
return (
  <div className="max-w-2xl mx-auto">
    {/* ... existing header, error banner, form ... */}

    {/* Translation Preview Panel */}
    {savedItemData && (
      <TranslationPreviewPanel
        entityType={savedItemData.entityType}
        entityId={savedItemData.entityId}
        sourceLanguage={savedItemData.sourceLanguage}
        sourceContent={savedItemData.sourceContent}
        isOpen={showTranslationPanel}
        onClose={handleTranslationPanelClose}
        onTranslationEdited={(lang) => {
          console.log(`Translation edited for ${lang}`);
        }}
      />
    )}
  </div>
);
```

---

## 6. Authorized Files and Functions for Modification

### 6.1 Primary File to Modify

| File | Path | Changes |
|------|------|---------|
| Item Edit Page | `/src/app/dashboard2/items/[publicId]/edit/page.tsx` | Main integration work |

### 6.2 Functions to Modify

| Function | Lines | Description of Change |
|----------|-------|----------------------|
| `EditItemPage` (component) | 28-339 | Add state for panel, add close handler, modify render |
| `handleSubmit` | 132-173 | Remove redirect, trigger panel instead |

### 6.3 New Imports to Add

```typescript
// Add to existing imports (around line 16-26)
import { TranslationPreviewPanel } from '@/components/TranslationManagement';
import type { SupportedLocale } from '@/lib/i18n/config';
```

### 6.4 New State Variables

| Variable | Type | Purpose |
|----------|------|---------|
| `showTranslationPanel` | `boolean` | Controls panel visibility |
| `savedItemData` | Object or null | Stores item data for panel after save |

### 6.5 New Functions to Add

| Function | Purpose |
|----------|---------|
| `handleTranslationPanelClose` | Handle panel close and navigate to list |
| Effect for pending check | Check for pending translations on load |

### 6.6 Lines to Modify in Detail

| Line Range | Current Code | New Code Description |
|------------|-------------|----------------------|
| 36-44 | Form state declarations | Add `showTranslationPanel`, `savedItemData` state |
| 162-163 | `router.push('/dashboard2/items')` | Replace with panel state update |
| 336-338 | End of return statement | Add `TranslationPreviewPanel` component |

---

## 7. Component Props Interface Reference

```typescript
// From TranslationPreviewPanel (Phase 2 Task 2.2)
interface TranslationPreviewPanelProps {
  entityType: 'article' | 'item' | 'link';
  entityId: string;
  sourceLanguage: SupportedLocale;
  sourceContent: {
    title?: string;
    description?: string;
    name?: string;
  };
  isOpen: boolean;
  onClose: () => void;
  onTranslationEdited?: (language: SupportedLocale) => void;
}
```

**Note for Item Entity:** Use `name` field in `sourceContent` since items have `name` rather than `title`.

---

## 8. ItemWithDetails Type Reference

```typescript
// From src/types/index.ts (existing type)
interface ItemWithDetails {
  id: string;           // UUID - use this for entityId
  publicId: string;     // URL-friendly ID - used in route params
  name: string;
  description?: string | null;
  tags?: string[];
  propertyId?: string;
  property?: { id: string; name: string };
  articles?: Article[];
  // sourceLanguage may need to be added if not present
}
```

**Important:** The page receives `publicId` from params but the Translation Status API expects the item's UUID (`item.id`), not the publicId.

---

## 9. API Dependency

This task depends on the Translation Status API from Phase 1 Task 1.1:

```
GET /api/translations/status?entityType=item&entityId={itemId}
```

**Expected Response:**
```json
{
  "summary": { "total": 5, "complete": 2, "partial": 0, "pending": 2, "failed": 1 },
  "items": [{
    "entityType": "item",
    "entityId": "uuid",
    "name": "Item Name",
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
| Item has no UUID in response | Log error, skip panel (defensive check) |
| Source language not in item data | Default to 'en' |

---

## 11. Testing Considerations

### 11.1 Manual Testing Scenarios

1. **Save and Panel Opens:**
   - Edit item (name/description/tags) → Save → Panel should slide in from right
   - Panel shows source content (name, description) and translation statuses

2. **Auto-Open on Load:**
   - Item with pending translations → Navigate to edit page → Panel auto-opens

3. **Panel Actions:**
   - Click Edit on completed translation → Translation editor opens
   - Click Re-translate → Job queued, status updates
   - Click Close → Navigates to /dashboard2/items

4. **No Pending Translations:**
   - Item with all completed translations → Edit page → Panel does NOT auto-open

5. **Form Functionality Unaffected:**
   - Verify all existing form fields still work (name, description, room, type, tags)
   - Verify room selector, item type selector, tags inline edit all function correctly

### 11.2 Component Tests

- Verify `TranslationPreviewPanel` receives correct props with `name` in sourceContent
- Verify panel opens when `showTranslationPanel` is true
- Verify close handler triggers navigation to `/dashboard2/items`
- Verify `entityId` uses item's UUID not publicId

---

## 12. Acceptance Criteria Mapping

| Criteria from REQ-362 | Implementation |
|----------------------|----------------|
| Preview panel visible within item editor | Panel renders when `showTranslationPanel` is true |
| Owners can select language to preview | TranslationPreviewPanel shows all 6 languages with status |
| Preview reflects current item content | `sourceContent` populated with current name/description |
| Preview indicates translation status | TranslationStatusItem shows status icons and colors |
| Preview updates when content changes | Real-time updates via useTranslationRealtime hook |
| Same architectural pattern as article editor | Follows REQ-361 implementation exactly |

---

## 13. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| TranslationPreviewPanel component not ready | Medium | High | Check Phase 2 completion before starting |
| Translation Status API not ready | Medium | High | Stub API or mock response for development |
| Performance impact on page load | Low | Medium | Make status check async, don't block render |
| User confusion about new flow | Low | Low | Panel has clear Close button with expected behavior |
| publicId vs UUID confusion | Medium | Medium | Carefully use `item.id` for API calls, document clearly |

---

## 14. Related Tasks

| Task ID | Title | Relationship |
|---------|-------|--------------|
| REQ-361 / 7.1 | Integrate preview panel into article editor | Pattern to follow exactly |
| 2.2 | Create TranslationPreviewPanel | Provides component used here |
| 2.6 | Create useTranslationStatus hook | May use for status fetching |
| 2.7 | Create useTranslationRealtime hook | Real-time updates in panel |
| 1.1 | Create translation status API | API dependency |
| 7.3 | Add loading states and error handling | Follow-up polish |

---

## 15. Implementation Checklist

- [ ] Add new imports (TranslationPreviewPanel, SupportedLocale type)
- [ ] Add `showTranslationPanel` and `savedItemData` state variables
- [ ] Create `handleTranslationPanelClose` callback
- [ ] Modify `handleSubmit` to set state instead of redirect
- [ ] Add useEffect for checking pending translations on page load
- [ ] Add TranslationPreviewPanel to render output
- [ ] Test save flow shows panel
- [ ] Test auto-open on page load with pending translations
- [ ] Test panel close navigates to items list
- [ ] Verify existing form functionality unaffected

---

## 16. References

- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- **Request Document:** `/docs/gen_requests_epic5.md` (REQ-362)
- **Article Editor Pattern (REQ-361):** `/docs/REQ-361-integrate-preview-panel-into-article-editor-overview.md`
- **Current Item Edit Page:** `/src/app/dashboard2/items/[publicId]/edit/page.tsx`
- **Modal Pattern Reference:** `/src/components/ItemManager/components/ItemPreview/ItemPreviewModal.tsx`
- **Translation Types:** `/src/lib/translation-service/translation-service.types.ts`
- **i18n Config:** `/src/lib/i18n/config.ts`
- **Radix Dialog Docs:** https://www.radix-ui.com/primitives/docs/components/dialog

---

*Document generated for FAQBNB Localization Epic 5 - Owner Translation Management*
