# REQ-357: Integrate Manual Translation Warning into Content Save Flow

**Document Created:** 2026-01-19 12:00:00 UTC
**Last Modified:** 2026-01-19 12:00:00 UTC

**Phase:** 5 - Manual Edit Preservation
**Task ID:** 5.3
**Epic:** L10N-Epic5 - Owner Translation Management
**Priority:** P2 - Medium
**Size:** M (Medium)
**Depends On:** REQ-355 (ManualEditWarningDialog component), Epic 1 (Foundation), Epic 3 (Dynamic Content Translation)

---

## Summary

This task integrates the ManualEditWarningDialog into article and item save flows to warn content editors before saving changes that would overwrite manually edited translations. The integration adds a pre-save check that queries for manual translations and conditionally displays a warning dialog, allowing editors to make informed decisions about preserving or re-translating their manually curated content.

---

## Current Behavior

When a content editor saves changes to an article or item:

1. **Article Edit Page** (`/src/app/dashboard2/instructions/[articleId]/edit/page.tsx`):
   - `handleSave` callback receives `UpdateArticlePayload`
   - Calls `adminApi.updateArticle(articleId, apiPayload, headers)` directly
   - Sets `sessionStorage.setItem('editSuccess', 'true')` and redirects to list
   - No translation check is performed

2. **Item Edit Page** (`/src/app/dashboard2/items/[publicId]/edit/page.tsx`):
   - `handleSubmit` handler processes form submission
   - Calls `adminApi.updateItem(publicId, {...}, headers)` directly
   - Redirects to items list on success
   - No translation check is performed

Both flows immediately proceed with the save operation without checking for existing manual translations. If manual translations exist, they will be marked for automatic re-translation, potentially overwriting carefully curated content.

---

## Expected Behavior

The save flow should be modified to:

1. Before executing the API update, check if any translations exist with `translation_status = 'manual'` for the entity being saved
2. If manual translations are detected:
   - Pause the save operation
   - Display the `ManualEditWarningDialog` showing which languages have manual edits
   - Provide options:
     - **Keep Manual Edits**: Complete save without re-translating manually edited languages
     - **Re-translate All**: Complete save and queue re-translation jobs for all languages
     - **Cancel**: Abort the save operation entirely
3. If no manual translations exist, proceed directly with the save
4. Handle loading states during the translation check query gracefully
5. Handle errors during translation check without breaking the save flow (fail-open to allow save)

---

## Technical Context

### Existing Patterns to Follow

| Pattern | File | Usage |
|---------|------|-------|
| Confirmation Dialog UI | `/src/components/ItemCreationWorkflow/components/shared/ConfirmExitDialog.tsx` | Modal styling, focus trapping, ARIA attributes |
| Delete Dialog with Items List | `/src/components/ItemManager/components/dialogs/ConfirmDeleteDialog.tsx` | Displaying list of affected items, loading states |
| Save Flow State Management | `/src/app/dashboard2/instructions/[articleId]/edit/page.tsx` | `isSaving` state, async save handler pattern |
| Translation Types | `/src/lib/translation-service/translation-service.types.ts` | `TranslationStatus`, `SupportedLanguage`, `SUPPORTED_LANGUAGES` |

### Dependencies

| Dependency | Source | Required For |
|------------|--------|--------------|
| `ManualEditWarningDialog` | REQ-355 (to be created) | Displaying the warning UI |
| Translation tables | Epic 1 | `article_translations`, `item_translations` tables |
| Translation status query | New API or direct Supabase query | Checking for `translation_status = 'manual'` |
| `SupportedLanguage` type | `/src/lib/translation-service/translation-service.types.ts` | Language type definitions |
| `SUPPORTED_LANGUAGES` | `/src/lib/translation-service/translation-service.types.ts` | Language display info (flags, names) |

### Database Schema Reference

```sql
-- From Epic 1 - article_translations table
CREATE TABLE article_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES item_articles(id),
  language VARCHAR(5) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  translation_status TEXT DEFAULT 'pending', -- Values: 'pending', 'processing', 'completed', 'failed', 'manual'
  translated_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- From Epic 1 - item_translations table
CREATE TABLE item_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES items(id),
  language VARCHAR(5) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  translation_status TEXT DEFAULT 'pending',
  translated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Architecture

### Component Integration Flow

```
User clicks "Save Changes"
        │
        ▼
┌─────────────────────────────────────┐
│ handleSave/handleSubmit triggered   │
│ (Article Edit or Item Edit page)    │
└─────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────┐
│ Check for manual translations       │
│ GET /api/translations/status        │
│ ?entityType=article&entityId=xxx    │
│ &status=manual                      │
└─────────────────────────────────────┘
        │
        ├── Error? ──────────┐
        │                    ▼
        │            Proceed with save (fail-open)
        │
        ▼
┌─────────────────────────────────────┐
│ Manual translations found?          │
└─────────────────────────────────────┘
        │
        ├── No ──────────────┐
        │                    ▼
        │            Proceed with save directly
        │
        ▼ Yes
┌─────────────────────────────────────┐
│ Show ManualEditWarningDialog        │
│ - List affected languages           │
│ - Keep Manual / Re-translate / Cancel│
└─────────────────────────────────────┘
        │
        ├── Cancel ──────────┐
        │                    ▼
        │            Abort save, reset state
        │
        ├── Keep Manual ─────┐
        │                    ▼
        │            Save with preserveManualTranslations: true
        │
        ▼ Re-translate All
┌─────────────────────────────────────┐
│ Save with overwriteManual: true     │
│ Queue re-translation jobs           │
└─────────────────────────────────────┘
```

### State Management

```typescript
// New state additions to edit pages
interface ManualTranslationWarningState {
  isCheckingTranslations: boolean;
  showWarningDialog: boolean;
  manualTranslations: {
    language: SupportedLanguage;
    translatedAt?: string;
    reviewedBy?: string;
  }[];
  pendingSavePayload: UpdateArticlePayload | ItemUpdatePayload | null;
}
```

---

## Implementation Tasks

### Task 5.3.1: Create useManualTranslationCheck Hook

**File:** `/src/hooks/useManualTranslationCheck.ts` (NEW)

Create a custom hook that checks for manual translations before save operations.

```typescript
interface UseManualTranslationCheckResult {
  checkForManualTranslations: (
    entityType: 'article' | 'item',
    entityId: string
  ) => Promise<ManualTranslation[]>;
  isChecking: boolean;
  error: string | null;
}

interface ManualTranslation {
  language: SupportedLanguage;
  translatedAt?: string;
  reviewedBy?: string;
}
```

**Implementation Details:**
- Query translation status API or Supabase directly
- Filter for `translation_status = 'manual'`
- Return list of languages with manual translations
- Handle errors gracefully (return empty array on error to allow save to proceed)
- Include loading state tracking

### Task 5.3.2: Create Translation Check API Endpoint (if not exists)

**File:** `/src/app/api/translations/check-manual/route.ts` (NEW - if needed)

If the existing translation status API doesn't support filtering by status, create a lightweight endpoint.

```typescript
// GET /api/translations/check-manual?entityType=article&entityId=xxx
interface CheckManualResponse {
  hasManualTranslations: boolean;
  manualTranslations: {
    language: SupportedLanguage;
    translatedAt: string | null;
    reviewedBy: string | null;
  }[];
}
```

**Note:** Check if existing `/api/translations/status` endpoint can be reused with query params.

### Task 5.3.3: Integrate Warning into Article Edit Page

**File:** `/src/app/dashboard2/instructions/[articleId]/edit/page.tsx` (MODIFY)

**Changes:**
1. Import `ManualEditWarningDialog` from TranslationManagement components
2. Import `useManualTranslationCheck` hook
3. Add warning dialog state management
4. Modify `handleSave` to check for manual translations before API call
5. Add dialog rendering with appropriate handlers

**Code Integration Points:**

```typescript
// Before (line ~122-182)
const handleSave = useCallback(async (payload: UpdateArticlePayload) => {
  setIsSaving(true);
  try {
    // ... current save logic
  } finally {
    setIsSaving(false);
  }
}, [...]);

// After - modified flow
const handleSave = useCallback(async (payload: UpdateArticlePayload) => {
  // Step 1: Check for manual translations
  setIsCheckingTranslations(true);
  const manualTranslations = await checkForManualTranslations('article', articleId);
  setIsCheckingTranslations(false);

  // Step 2: If manual translations exist, show warning dialog
  if (manualTranslations.length > 0) {
    setPendingSavePayload(payload);
    setManualTranslations(manualTranslations);
    setShowWarningDialog(true);
    return; // Wait for user decision
  }

  // Step 3: No manual translations, proceed with save
  await executeSave(payload);
}, [...]);
```

### Task 5.3.4: Integrate Warning into Item Edit Page

**File:** `/src/app/dashboard2/items/[publicId]/edit/page.tsx` (MODIFY)

**Changes:**
1. Import `ManualEditWarningDialog` from TranslationManagement components
2. Import `useManualTranslationCheck` hook
3. Add warning dialog state management
4. Modify `handleSubmit` to check for manual translations before API call
5. Add dialog rendering with appropriate handlers

**Code Integration Points:**

```typescript
// Before (line ~132-173)
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setSaving(true);
  // ... current save logic
};

// After - modified flow
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // Step 1: Check for manual translations
  setIsCheckingTranslations(true);
  const manualTranslations = await checkForManualTranslations('item', item!.id);
  setIsCheckingTranslations(false);

  // Step 2: If manual translations exist, show warning dialog
  if (manualTranslations.length > 0) {
    setManualTranslations(manualTranslations);
    setShowWarningDialog(true);
    return; // Wait for user decision
  }

  // Step 3: No manual translations, proceed with save
  await executeSave();
};
```

### Task 5.3.5: Implement Dialog Action Handlers

Add handlers for the three dialog actions in both edit pages:

**Keep Manual Edits:**
```typescript
const handleKeepManualEdits = async () => {
  setShowWarningDialog(false);
  // Save with flag to preserve manual translations
  await executeSave(pendingSavePayload, { preserveManualTranslations: true });
};
```

**Re-translate All:**
```typescript
const handleRetranslateAll = async () => {
  setShowWarningDialog(false);
  // Save and queue re-translation for all languages
  await executeSave(pendingSavePayload, { overwriteManual: true });
};
```

**Cancel:**
```typescript
const handleCancelSave = () => {
  setShowWarningDialog(false);
  setPendingSavePayload(null);
  setManualTranslations([]);
  // Don't call setSaving(false) - it was never set to true
};
```

### Task 5.3.6: Update API Payloads to Support Preservation Flags

**Files to potentially modify:**
- `/src/lib/api.ts` - `updateArticle` and `updateItem` methods
- Backend API handlers (if they don't already support these flags)

Add optional parameters to API update calls:
```typescript
interface UpdateOptions {
  preserveManualTranslations?: boolean;
  overwriteManual?: boolean;
}
```

---

## Authorized Files and Functions for Modification

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/hooks/useManualTranslationCheck.ts` | Hook for checking manual translations before save |
| `/src/app/api/translations/check-manual/route.ts` | API endpoint for manual translation check (if needed) |

### Files to Modify

| File Path | Functions/Sections to Modify |
|-----------|------------------------------|
| `/src/app/dashboard2/instructions/[articleId]/edit/page.tsx` | `handleSave` callback, add state variables, add dialog import/rendering |
| `/src/app/dashboard2/items/[publicId]/edit/page.tsx` | `handleSubmit` handler, add state variables, add dialog import/rendering |
| `/src/lib/api.ts` | `updateArticle()`, `updateItem()` - add optional preservation flags (if needed) |

### Files to Import From (Read-Only)

| File Path | What to Import |
|-----------|----------------|
| `/src/components/TranslationManagement/ManualEditWarning/ManualEditWarningDialog.tsx` | `ManualEditWarningDialog` component |
| `/src/lib/translation-service/translation-service.types.ts` | `SupportedLanguage`, `SUPPORTED_LANGUAGES`, `TranslationStatus` |
| `/src/lib/supabase.ts` | Supabase client for direct queries (if not using API) |

---

## UI/UX Specifications

### Loading States

1. **Translation Check Loading**: Show subtle loading indicator on save button while checking for manual translations
   - Button text: "Checking translations..." with spinner
   - Keep button disabled during check

2. **Save Loading**: Normal save loading state after decision is made
   - Button text: "Saving..." with spinner

### Dialog Appearance Timing

- Dialog should appear within 500ms of clicking save (translation check should be fast)
- If check takes >500ms, show loading indicator immediately

### Error Handling

- If translation check fails, proceed with save (fail-open design)
- Log error for debugging but don't block user
- Consider showing toast notification that translation check failed

---

## Acceptance Criteria

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
- [ ] Warning dialog integration works for all translatable entity types (articles, items)
- [ ] User experience remains responsive with minimal delay introduced by translation check

---

## Testing Considerations

### Unit Tests

1. `useManualTranslationCheck` hook:
   - Returns empty array when no manual translations exist
   - Returns correct languages when manual translations exist
   - Handles API errors gracefully
   - Sets loading state correctly

### Integration Tests

1. Article edit page with manual translations:
   - Dialog appears before save completes
   - Keep manual edits preserves translations
   - Re-translate all queues jobs
   - Cancel aborts save

2. Item edit page with manual translations:
   - Same scenarios as article page

3. Edge cases:
   - Network error during translation check (should allow save)
   - Empty translation table (should allow save without dialog)
   - Mixed translation statuses (only show manual ones)

---

## Dependencies and Blockers

| Dependency | Status | Notes |
|------------|--------|-------|
| ManualEditWarningDialog (REQ-355) | Required | Must be created first |
| Translation tables (Epic 1) | Required | `article_translations`, `item_translations` |
| Translation status API (Epic 3/5) | Preferred | Can use direct Supabase query as fallback |

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Translation check adds latency to save | Medium | Medium | Optimize query with indexes, set timeout, fail-open |
| Dialog disrupts save flow UX | Low | Medium | Clear messaging, fast response, easy cancel |
| API doesn't support preservation flags | Medium | Medium | Add backend support or handle in frontend |
| Race condition with concurrent edits | Low | Low | Use optimistic UI, refresh on error |

---

## Effort Estimate

| Task | Estimate | Confidence |
|------|----------|------------|
| Task 5.3.1: useManualTranslationCheck hook | 2-3 hours | High |
| Task 5.3.2: API endpoint (if needed) | 1-2 hours | Medium |
| Task 5.3.3: Article edit integration | 2-3 hours | High |
| Task 5.3.4: Item edit integration | 2-3 hours | High |
| Task 5.3.5: Dialog action handlers | 1-2 hours | High |
| Task 5.3.6: API payload updates | 1-2 hours | Medium |
| **Total** | **9-15 hours** | Medium |

---

## References

- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md` (Phase 5, Task 5.3)
- **Request Document:** `/docs/gen_requests_epic5.md` (REQ-357)
- **Related PRD:** `/docs/prd/PRD_L10N_Epic5_Owner_Translation_Management.md`
- **Dialog Pattern:** `/src/components/ItemCreationWorkflow/components/shared/ConfirmExitDialog.tsx`
- **Translation Types:** `/src/lib/translation-service/translation-service.types.ts`

---

*Document generated for FAQBNB L10N Epic 5 - Task 5.3: Integrate Warning into Content Save Flow*
