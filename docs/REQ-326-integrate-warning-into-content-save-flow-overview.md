# REQ-326: Integrate Warning into Content Save Flow - Implementation Overview

**Document Created:** 2026-01-18
**Last Modified:** 2026-01-18
**Request Reference:** docs/gen_requests_epic5.md - Request #326
**Implementation Plan Reference:** docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md
**Phase:** 5 - Manual Edit Preservation
**Task ID:** 5.3
**Size:** M (Medium)
**Priority:** P2
**Depends On:** Epic 1 (Foundation), Epic 3 (Dynamic Content Translation), REQ-325 (ManualEditWarningDialog component)

---

## 1. Summary

Integrate the ManualEditWarningDialog component into the content save flow for articles and items. When a property owner saves changes to translatable content, the system should check for existing manual translations and display a warning dialog before processing the update. This ensures owners make informed decisions about preserving or overwriting their manually curated translation work.

---

## 2. Requirements Analysis

### 2.1 Core Functionality

| Requirement | Description | Priority |
|-------------|-------------|----------|
| Article Save Check | Article save handler checks for manual translations before processing | P0 |
| Item Save Check | Item save handler checks for manual translations before processing | P0 |
| Save Pause on Detection | Save operation pauses when manual translations are detected | P0 |
| Warning Dialog Display | ManualEditWarningDialog displays showing affected languages | P0 |
| Keep Manual Edits Flow | Choosing "Keep" completes save without re-translating | P0 |
| Re-translate All Flow | Choosing "Re-translate" completes save and queues translation jobs | P0 |
| Cancel Flow | Canceling dialog aborts the entire save operation | P0 |
| No-Dialog Fast Path | Save without manual translations proceeds immediately | P0 |
| Entity-Scoped Check | Translation check queries only the entity being saved | P1 |
| Loading State Handling | Graceful loading states during translation check | P1 |
| Error Handling | Handle errors during translation check without breaking save | P1 |
| All Entity Types | Works for properties, FAQs, articles, and amenities | P2 |
| Responsive UX | Minimal delay introduced by translation check | P2 |

### 2.2 User Stories

1. **As a property owner**, I want to be notified when saving content that has manual translations, so I can decide whether to preserve my translation work.

2. **As a property owner**, I want to keep my manual edits when updating source content, so I can manually update translations myself later.

3. **As a property owner**, I want to optionally re-translate all languages when my content significantly changes, so translations stay synchronized with the source.

4. **As a property owner**, I want to cancel a save operation if I didn't realize it would affect my translations, so I can review my changes first.

5. **As a property owner**, I want saves without manual translations to proceed immediately, so my workflow isn't slowed down unnecessarily.

---

## 3. Technical Context

### 3.1 Existing Stack

| Technology | Details |
|------------|---------|
| **Framework** | Next.js 15.5.9 with App Router |
| **Language** | TypeScript 5.x (strict mode) |
| **Styling** | Tailwind CSS 4.x |
| **State Management** | React useState/useReducer |
| **UI Components** | Radix UI Dialog (via ManualEditWarningDialog) |
| **API Client** | `/src/lib/adminApi.ts` - updateItem, updateArticle |
| **Backend** | Supabase (PostgreSQL with RLS) |

### 3.2 Related Patterns in Codebase

| Pattern | Location | Usage for This Integration |
|---------|----------|----------------------------|
| Save Handler | `/src/app/dashboard2/items/[publicId]/edit/page.tsx:132-173` | Item save flow to modify |
| Save Handler | `/src/app/dashboard2/instructions/[articleId]/edit/page.tsx:122-182` | Article save flow to modify |
| Account Header | Both edit pages | `x-current-account` header for API calls |
| Loading States | Both edit pages | `setSaving`/`setIsSaving` patterns |
| Error Display | Both edit pages | Error banner rendering patterns |
| API Client | `/src/lib/adminApi.ts` | Existing updateItem, updateArticle methods |

### 3.3 Current Save Handler Flow

**Item Edit Page (`/src/app/dashboard2/items/[publicId]/edit/page.tsx`):**
```
handleSubmit(e)
  → e.preventDefault()
  → setSaving(true)
  → adminApi.updateItem(publicId, { name, description, tags }, headers)
  → router.push('/dashboard2/items')
  → catch → setError(message)
  → finally → setSaving(false)
```

**Article Edit Page (`/src/app/dashboard2/instructions/[articleId]/edit/page.tsx`):**
```
handleSave(data)
  → setIsSaving(true)
  → adminApi.updateArticle(articleId, payload, headers)
  → sessionStorage.setItem('editSuccess')
  → router.push('/dashboard2/instructions')
  → catch → console.error, show error toast
  → finally → setIsSaving(false)
```

### 3.4 Dependencies from REQ-325

| Dependency | Purpose | Status |
|------------|---------|--------|
| ManualEditWarningDialog | Warning dialog component | Required (REQ-325) |
| ManualEditWarningDialogProps | Component type definitions | Required (REQ-325) |
| AffectedLanguage | Type for affected languages list | Required (REQ-325) |
| SupportedLanguage | Type for language codes | Required (REQ-325) |

### 3.5 Translation Table Schema Reference

| Table | Key Fields for Manual Detection |
|-------|--------------------------------|
| `article_translations` | `translation_status = 'manual'`, `reviewed_by`, `article_id` |
| `item_translations` | `translation_status = 'manual'`, `item_id` |
| `link_translations` | `translation_status = 'manual'`, `link_id` |

---

## 4. Architecture

### 4.1 Modified Save Flow

```
User Clicks Save Button
         │
         ▼
┌─────────────────────────┐
│ Form Validation         │
│ (existing logic)        │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ Check for Manual        │
│ Translations (API call) │
└───────────┬─────────────┘
            │
            ▼
    ┌───────────────┐
    │ Has Manual    │
    │ Translations? │
    └───────┬───────┘
           ╱ ╲
          ╱   ╲
       Yes     No
        │       │
        ▼       ▼
┌──────────────┐  ┌──────────────┐
│ Store        │  │ Proceed with │
│ Pending Data │  │ Save (fast   │
│ Show Dialog  │  │ path)        │
└──────┬───────┘  └──────────────┘
       │
       ▼
┌──────────────────────────────┐
│  ManualEditWarningDialog     │
│  ┌────────┐ ┌────────┐      │
│  │ Cancel │ │Keep    │      │
│  └───┬────┘ │Edits   │      │
│      │      └───┬────┘      │
│      │          │           │
│      │      ┌───┴────┐      │
│      │      │Re-trans│      │
│      │      │late All│      │
│      │      └───┬────┘      │
└──────┼──────────┼───────────┘
       │          │
       ▼          ▼
┌──────────────┐ ┌──────────────┐
│ Abort Save   │ │ Save with    │
│ Reset State  │ │ Translation  │
│              │ │ Flag         │
└──────────────┘ └──────────────┘
```

### 4.2 State Additions

**For Item Edit Page:**
```typescript
// New state additions
const [showManualEditWarning, setShowManualEditWarning] = useState(false);
const [pendingItemData, setPendingItemData] = useState<{
  name: string;
  description: string;
  tags: string[];
} | null>(null);
const [checkingTranslations, setCheckingTranslations] = useState(false);
const [manualTranslations, setManualTranslations] = useState<AffectedLanguage[]>([]);
```

**For Article Edit Page:**
```typescript
// New state additions
const [showManualEditWarning, setShowManualEditWarning] = useState(false);
const [pendingArticleData, setPendingArticleData] = useState<ArticlePayload | null>(null);
const [checkingTranslations, setCheckingTranslations] = useState(false);
const [manualTranslations, setManualTranslations] = useState<AffectedLanguage[]>([]);
```

### 4.3 API Requirements

**New API Endpoint: Check Manual Translations**
```
GET /api/admin/items/[publicId]/manual-translations
GET /api/admin/articles/[articleId]/manual-translations

Response:
{
  hasManualTranslations: boolean;
  affectedLanguages: AffectedLanguage[];
}
```

**Existing API Endpoint: Update with Translation Flags (modify)**
```
PUT /api/admin/items/[publicId]
PUT /api/admin/articles/[articleId]

Request body additions:
{
  ...existingFields,
  skipRetranslate?: boolean;   // Keep manual edits
  retranslateAll?: boolean;    // Force re-translate all
}
```

---

## 5. Implementation Tasks

### Task 5.3.1: Create manual translations check API for items
**File:** `/src/app/api/admin/items/[publicId]/manual-translations/route.ts`

- Create GET endpoint to check for manual translations
- Query `item_translations` where `item_id` matches and `translation_status = 'manual'`
- Also check associated `link_translations` and `article_translations`
- Return `hasManualTranslations` boolean and `affectedLanguages` array
- Validate account access using existing auth patterns
- Include language code, `hasManualEdit` flag, and optional `lastEditedAt`

**Estimated effort:** S

### Task 5.3.2: Create manual translations check API for articles
**File:** `/src/app/api/admin/articles/[articleId]/manual-translations/route.ts`

- Create GET endpoint to check for manual translations
- Query `article_translations` where `article_id` matches and `translation_status = 'manual'`
- Also check associated `link_translations` for links in the article
- Return `hasManualTranslations` boolean and `affectedLanguages` array
- Validate account access using existing auth patterns

**Estimated effort:** S

### Task 5.3.3: Extend item update API to support translation flags
**File:** `/src/app/api/admin/items/[publicId]/route.ts`

- Add `skipRetranslate` and `retranslateAll` fields to request body validation
- When `skipRetranslate` is true: update item without queuing translation jobs
- When `retranslateAll` is true: queue translation jobs for all languages via translation service
- Preserve existing behavior when neither flag is provided

**Estimated effort:** S

### Task 5.3.4: Extend article update API to support translation flags
**File:** `/src/app/api/admin/articles/[articleId]/route.ts`

- Add `skipRetranslate` and `retranslateAll` fields to request body validation
- When `skipRetranslate` is true: update article without queuing translation jobs
- When `retranslateAll` is true: queue translation jobs for all languages
- Preserve existing behavior when neither flag is provided

**Estimated effort:** S

### Task 5.3.5: Integrate warning dialog into Item Edit Page
**File:** `/src/app/dashboard2/items/[publicId]/edit/page.tsx`

**Sub-tasks:**
1. Import ManualEditWarningDialog component and types
2. Add state for dialog visibility, pending data, and manual translations
3. Modify `handleSubmit` to check for manual translations first
4. If manual translations exist: store pending data and show dialog
5. If no manual translations: proceed with save immediately
6. Implement `handleKeepManualEdits` callback - save with `skipRetranslate: true`
7. Implement `handleRetranslateAll` callback - save with `retranslateAll: true`
8. Implement `handleCancelWarning` callback - reset pending state
9. Render ManualEditWarningDialog at end of component
10. Handle loading states during translation check

**Estimated effort:** M

### Task 5.3.6: Integrate warning dialog into Article Edit Page
**File:** `/src/app/dashboard2/instructions/[articleId]/edit/page.tsx`

**Sub-tasks:**
1. Import ManualEditWarningDialog component and types
2. Add state for dialog visibility, pending data, and manual translations
3. Modify `handleSave` to check for manual translations first
4. If manual translations exist: store pending data and show dialog
5. If no manual translations: proceed with save immediately
6. Implement `handleKeepManualEdits` callback - save with `skipRetranslate: true`
7. Implement `handleRetranslateAll` callback - save with `retranslateAll: true`
8. Implement `handleCancelWarning` callback - reset pending state
9. Render ManualEditWarningDialog at end of component
10. Handle loading states during translation check

**Estimated effort:** M

### Task 5.3.7: Add helper function for translation check
**File:** `/src/lib/translationUtils.ts` (new file)

- Create `checkManualTranslations(entityType, entityId, headers)` helper
- Abstract the API call logic for reuse
- Handle errors gracefully (return empty array on failure to not block save)
- Add TypeScript types for response

**Estimated effort:** S

### Task 5.3.8: Update adminApi with translation flag support
**File:** `/src/lib/adminApi.ts`

- Extend `updateItem` method to accept optional `translationFlags` parameter
- Extend `updateArticle` method to accept optional `translationFlags` parameter
- Pass flags through to API requests

**Estimated effort:** XS

### Task 5.3.9: Add loading indicator during translation check
**Files:** Both edit pages

- Show subtle loading indicator while checking translations
- Consider: spinner on save button, or brief loading overlay
- Ensure check is fast to minimize UX impact

**Estimated effort:** XS

---

## 6. Authorized Files and Functions for Modification

### 6.1 New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/app/api/admin/items/[publicId]/manual-translations/route.ts` | GET endpoint for item translation check |
| `/src/app/api/admin/articles/[articleId]/manual-translations/route.ts` | GET endpoint for article translation check |
| `/src/lib/translationUtils.ts` | Helper functions for translation checks |

### 6.2 Files to Modify

| File Path | Changes | Scope of Changes |
|-----------|---------|------------------|
| `/src/app/dashboard2/items/[publicId]/edit/page.tsx` | Add manual edit warning integration | Add ~50-70 lines: state, handlers, dialog render |
| `/src/app/dashboard2/instructions/[articleId]/edit/page.tsx` | Add manual edit warning integration | Add ~50-70 lines: state, handlers, dialog render |
| `/src/app/api/admin/items/[publicId]/route.ts` | Add translation flag handling in PUT | Add ~15-20 lines in PUT handler |
| `/src/app/api/admin/articles/[articleId]/route.ts` | Add translation flag handling in PUT | Add ~15-20 lines in PUT handler |
| `/src/lib/adminApi.ts` | Extend updateItem/updateArticle signatures | Add ~10 lines for flag support |

### 6.3 Functions to Create

| Function | Location | Purpose |
|----------|----------|---------|
| `GET` handler | `.../manual-translations/route.ts` | Check for manual translations |
| `checkManualTranslations` | `translationUtils.ts` | Client-side helper for translation check |
| `handleKeepManualEdits` | Both edit pages | Callback for dialog keep action |
| `handleRetranslateAll` | Both edit pages | Callback for dialog re-translate action |
| `handleCancelWarning` | Both edit pages | Callback for dialog cancel action |

### 6.4 Functions to Modify

| Function | Location | Changes |
|----------|----------|---------|
| `handleSubmit` | Item edit page | Add translation check before save |
| `handleSave` | Article edit page | Add translation check before save |
| `PUT` handler | `/api/admin/items/[publicId]/route.ts` | Handle translation flags |
| `PUT` handler | `/api/admin/articles/[articleId]/route.ts` | Handle translation flags |
| `updateItem` | `adminApi.ts` | Accept translation flags parameter |
| `updateArticle` | `adminApi.ts` | Accept translation flags parameter |

---

## 7. Integration Points

### 7.1 ManualEditWarningDialog Integration

```tsx
// Example integration in Item Edit Page
import { ManualEditWarningDialog } from '@/components/TranslationManagement';
import type { AffectedLanguage } from '@/components/TranslationManagement/ManualEditWarning/ManualEditWarningDialog.types';

// In component:
const [showManualEditWarning, setShowManualEditWarning] = useState(false);
const [pendingItemData, setPendingItemData] = useState<ItemUpdateData | null>(null);
const [manualTranslations, setManualTranslations] = useState<AffectedLanguage[]>([]);

// Modified handleSubmit:
const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  setSaving(true);

  try {
    // Check for manual translations first
    const response = await fetch(
      `/api/admin/items/${publicId}/manual-translations`,
      { headers: { 'x-current-account': currentAccount.id } }
    );
    const { hasManualTranslations, affectedLanguages } = await response.json();

    if (hasManualTranslations) {
      // Store pending data and show dialog
      setPendingItemData({ name, description, tags });
      setManualTranslations(affectedLanguages);
      setShowManualEditWarning(true);
      setSaving(false);
      return;
    }

    // No manual translations - proceed with save
    await performSave({ name, description, tags });
  } catch (error) {
    setError(error.message);
  } finally {
    setSaving(false);
  }
};

// Dialog callbacks:
const handleKeepManualEdits = async () => {
  if (!pendingItemData) return;
  await performSave(pendingItemData, { skipRetranslate: true });
  setShowManualEditWarning(false);
  setPendingItemData(null);
};

const handleRetranslateAll = async () => {
  if (!pendingItemData) return;
  await performSave(pendingItemData, { retranslateAll: true });
  setShowManualEditWarning(false);
  setPendingItemData(null);
};

const handleCancelWarning = () => {
  setShowManualEditWarning(false);
  setPendingItemData(null);
  setManualTranslations([]);
};

// In render:
<ManualEditWarningDialog
  isOpen={showManualEditWarning}
  entityType="item"
  entityId={publicId}
  entityName={name}
  affectedLanguages={manualTranslations}
  onKeepManualEdits={handleKeepManualEdits}
  onRetranslateAll={handleRetranslateAll}
  onCancel={handleCancelWarning}
  loading={saving}
/>
```

### 7.2 API Flow

```
Client: handleSubmit()
    │
    ▼
GET /api/admin/items/[publicId]/manual-translations
    │
    ├─ Query: item_translations WHERE item_id = ? AND translation_status = 'manual'
    │
    ▼
Response: { hasManualTranslations: true, affectedLanguages: [...] }
    │
    ▼
[User interacts with ManualEditWarningDialog]
    │
    ├─ Keep Manual Edits:
    │      PUT /api/admin/items/[publicId] { ...data, skipRetranslate: true }
    │
    └─ Re-translate All:
           PUT /api/admin/items/[publicId] { ...data, retranslateAll: true }
               │
               └─ Backend queues translation jobs
```

---

## 8. Error Handling

### 8.1 Translation Check Errors

| Error Scenario | Handling |
|----------------|----------|
| Network failure during check | Proceed with save (warn in console), don't block user |
| 401/403 authentication error | Show error, don't proceed with save |
| 500 server error | Proceed with save (warn in console), don't block user |
| Timeout | Proceed with save after reasonable timeout (3s) |

**Rationale:** Translation check should not block saves. If the check fails, it's better to let the save proceed and potentially overwrite translations than to block the user entirely.

### 8.2 Save Errors

| Error Scenario | Handling |
|----------------|----------|
| Save fails after keeping edits | Show error, keep dialog open, allow retry |
| Save fails after re-translate | Show error, keep dialog open, allow retry |
| Translation queue fails | Save succeeds, show warning that translations may need manual refresh |

---

## 9. Acceptance Criteria Checklist

Based on REQ-326 requirements:

- [ ] Article save handler checks for manual translations before processing source content updates
- [ ] Item save handler checks for manual translations before processing source content updates
- [ ] Save operation pauses when manual translations are detected for the entity being saved
- [ ] ManualEditWarningDialog displays showing affected languages with manual edits
- [ ] Choosing "Keep Manual Edits" in dialog completes save without re-translating manually edited languages
- [ ] Choosing "Re-translate All" in dialog completes save and queues re-translation jobs for all languages
- [ ] Canceling dialog aborts the entire save operation without updating source content
- [ ] Save operations for content without manual translations proceed immediately without warning dialog
- [ ] Translation check query only examines translations for the specific entity being saved
- [ ] Integration handles loading states during translation check query gracefully
- [ ] Integration handles errors during translation check query without breaking save flow
- [ ] Warning dialog integration works for all translatable entity types including properties, FAQs, articles, and amenities
- [ ] User experience remains responsive with minimal delay introduced by translation check

---

## 10. Testing Considerations

### 10.1 Unit Tests

**API Endpoints:**
- GET manual-translations returns correct data when manual translations exist
- GET manual-translations returns empty when no manual translations
- PUT with skipRetranslate flag doesn't queue translation jobs
- PUT with retranslateAll flag queues translation jobs for all languages

**Integration Logic:**
- handleSubmit checks for translations before proceeding
- Dialog shown when manual translations detected
- Dialog not shown when no manual translations
- Keep Manual Edits calls save with correct flag
- Re-translate All calls save with correct flag
- Cancel aborts save and resets state

### 10.2 Integration Tests

- Full save flow with manual translations - keep edits path
- Full save flow with manual translations - re-translate path
- Full save flow with manual translations - cancel path
- Full save flow without manual translations - fast path
- Error recovery during translation check
- Error recovery during save

### 10.3 E2E Tests

- User saves item with manual translations → sees warning → keeps edits → save succeeds
- User saves item with manual translations → sees warning → re-translates → save succeeds
- User saves item with manual translations → sees warning → cancels → no save
- User saves item without manual translations → no warning → save succeeds

---

## 11. Performance Considerations

### 11.1 Translation Check Latency

The translation check adds an API call before save. To minimize user-perceived delay:

1. **Optimistic UI:** Show "Saving..." immediately, run check in background
2. **Efficient Query:** Index on `(item_id, translation_status)` for fast lookup
3. **Timeout:** If check takes >3 seconds, proceed with save
4. **Caching:** Consider caching translation status in component state if editing multiple times

### 11.2 Expected Latency

| Operation | Expected Time |
|-----------|---------------|
| Translation check API call | 50-200ms |
| Dialog render | <50ms |
| Save operation | 200-500ms |
| Translation job queue | <100ms |

**Total added delay:** ~50-200ms (only when manual translations exist)

---

## 12. Open Questions

1. **Property-level translations:** Should property updates also trigger this check?
   - *Recommendation:* Yes, add to property edit page in future iteration

2. **Link-level translations:** Should individual link edits trigger this check?
   - *Recommendation:* Check associated links when saving articles/items

3. **Bulk operations:** How should bulk item updates handle this?
   - *Recommendation:* Defer to bulk translation management features (REQ-321, REQ-322)

4. **Partial re-translate:** Should users be able to selectively re-translate some languages?
   - *Recommendation:* Defer to future iteration, keep simple binary choice for now (per REQ-325)

---

## 13. Code Examples

### 13.1 Manual Translations Check API

```typescript
// /src/app/api/admin/items/[publicId]/manual-translations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { validateAccountAccess } from '@/lib/auth';

interface AffectedLanguage {
  language: string;
  hasManualEdit: boolean;
  lastEditedAt?: string;
  reviewedBy?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { publicId: string } }
) {
  const supabase = createServerClient();
  const currentAccountId = request.headers.get('x-current-account');

  // Validate access
  const item = await validateAccountAccess(supabase, params.publicId, currentAccountId);
  if (!item) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  // Check for manual translations
  const { data: translations, error } = await supabase
    .from('item_translations')
    .select('language, translation_status, translated_at')
    .eq('item_id', item.id)
    .eq('translation_status', 'manual');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const affectedLanguages: AffectedLanguage[] = translations.map(t => ({
    language: t.language,
    hasManualEdit: true,
    lastEditedAt: t.translated_at,
  }));

  return NextResponse.json({
    hasManualTranslations: affectedLanguages.length > 0,
    affectedLanguages,
  });
}
```

### 13.2 Modified Save Handler

```typescript
// In item edit page - modified handleSubmit
const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setSaving(true);
  setError(null);

  try {
    // Step 1: Check for manual translations
    const checkResponse = await fetch(
      `/api/admin/items/${publicId}/manual-translations`,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-current-account': currentAccount?.id || '',
        },
      }
    );

    if (checkResponse.ok) {
      const { hasManualTranslations, affectedLanguages } = await checkResponse.json();

      if (hasManualTranslations) {
        // Store pending data and show warning dialog
        setPendingItemData({ name, description, tags });
        setManualTranslations(affectedLanguages);
        setShowManualEditWarning(true);
        setSaving(false);
        return;
      }
    }
    // If check fails, proceed with save (don't block user)

    // Step 2: Proceed with save (no manual translations)
    await performSave({ name, description, tags });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An error occurred';
    setError(message);
  } finally {
    setSaving(false);
  }
};

const performSave = async (
  data: { name: string; description: string; tags: string[] },
  flags?: { skipRetranslate?: boolean; retranslateAll?: boolean }
) => {
  const headers = {
    'Content-Type': 'application/json',
    'x-current-account': currentAccount?.id || '',
  };

  await adminApi.updateItem(publicId, { ...data, ...flags }, headers);
  router.push('/dashboard2/items');
};
```

---

## 14. Dependencies Graph

```
REQ-326 (This Task)
    │
    ├── REQ-325 (ManualEditWarningDialog Component)
    │       │
    │       └── REQ-309 (TranslationManagement.types.ts)
    │
    ├── Epic 1 (Translation Tables)
    │       │
    │       ├── article_translations table
    │       ├── item_translations table
    │       └── link_translations table
    │
    └── Epic 3 (Translation Service)
            │
            └── Translation job queue system
```

---

## 15. References

- Request: `docs/gen_requests_epic5.md` - REQ-326
- Implementation Plan: `docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- ManualEditWarningDialog Spec: `docs/REQ-325-create-manualeditwarningdialog-component-overview.md`
- Item Edit Page: `/src/app/dashboard2/items/[publicId]/edit/page.tsx`
- Article Edit Page: `/src/app/dashboard2/instructions/[articleId]/edit/page.tsx`
- Item API Route: `/src/app/api/admin/items/[publicId]/route.ts`
- Article API Route: `/src/app/api/admin/articles/[articleId]/route.ts`
- Admin API Client: `/src/lib/adminApi.ts`

---

*Document generated for FAQBNB L10N Epic 5 - Owner Translation Management*
