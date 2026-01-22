# REQ-E05-024: Integrate Manual Edit Warning into Content Save Flow - Implementation Breakdown

**Request ID**: REQ-E05-024
**Epic**: Epic 5 - Owner Translation Management
**Phase**: Phase 5 - Manual Edit Preservation
**Task**: Task 5.3 - Integrate warning into content save flow
**Created**: 2026-01-22 20:17:50
**Status**: PENDING

---

## Goal

Hook ManualEditWarningDialog into article and item save handlers to protect manual translations from accidental overwriting. When users edit source content (article title, item name/description), the system checks for existing manual translations and shows a warning dialog, allowing users to choose between keeping manual edits (which become stale) or re-translating all languages.

---

## Implementation Plan

### Step 1: Create useManualEditCheck Hook

**File**: `/src/hooks/useManualEditCheck.ts` (NEW)

**Rationale**: Centralized hook for manual translation detection logic, reusable across all editor components.

**Implementation**:

```typescript
'use client';

import { useState, useCallback } from 'react';
import type { SupportedLanguage } from '@/lib/translation-service/translation-service.types';

export interface ManualEditCheckOptions {
  entityType: 'item' | 'article';
  entityId: string;
}

export interface ManualEditCheckResult {
  hasManualEdits: boolean;
  manuallyEditedLanguages: SupportedLanguage[];
}

export interface UseManualEditCheckReturn {
  checkForManualEdits: (options: ManualEditCheckOptions) => Promise<ManualEditCheckResult>;
  isChecking: boolean;
  error: string | null;
  reset: () => void;
}

export function useManualEditCheck(): UseManualEditCheckReturn {
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkForManualEdits = useCallback(async (
    options: ManualEditCheckOptions
  ): Promise<ManualEditCheckResult> => {
    setIsChecking(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/translations/status/${options.entityType}/${options.entityId}`
      );

      if (!response.ok) {
        throw new Error('Failed to check translation status');
      }

      const data = await response.json();

      // Extract languages with status === 'manual'
      const manuallyEditedLanguages: SupportedLanguage[] = [];

      if (data.languages) {
        for (const [lang, langStatus] of Object.entries(data.languages)) {
          // Check the internal byLanguage structure for 'manual' status
          // The API maps 'manual' to 'completed', but we need to check the raw data
          if (langStatus && typeof langStatus === 'object' && 'status' in langStatus) {
            // We need to fetch the raw translation records to detect 'manual' status
            // The status API doesn't expose this directly, so we'll need to check
            // the translation_service module's getEntityTranslationStatus result
          }
        }
      }

      // Alternative: Query translation records directly
      const translationResponse = await fetch(
        `/api/translations/${options.entityType}/${options.entityId}`
      );

      if (translationResponse.ok) {
        const translations = await translationResponse.json();

        if (Array.isArray(translations)) {
          translations.forEach((t: any) => {
            if (t.status === 'manual') {
              manuallyEditedLanguages.push(t.language as SupportedLanguage);
            }
          });
        }
      }

      const hasManualEdits = manuallyEditedLanguages.length > 0;

      return {
        hasManualEdits,
        manuallyEditedLanguages,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error checking manual edits:', err);

      // On error, return false to allow save to proceed
      return {
        hasManualEdits: false,
        manuallyEditedLanguages: [],
      };
    } finally {
      setIsChecking(false);
    }
  }, []);

  const reset = useCallback(() => {
    setError(null);
  }, []);

  return {
    checkForManualEdits,
    isChecking,
    error,
    reset,
  };
}
```

**Note**: The translation status API needs investigation to determine how to detect `status === 'manual'` records. The API currently maps 'manual' to 'completed' in the response. We may need to:
- Add a separate endpoint that exposes raw translation records
- Modify the status API to include a `manuallyEditedLanguages` field
- Query the translation records directly from the hook

---

### Step 2: Update Translation Status API (Optional Enhancement)

**File**: `/src/app/api/translations/status/[entityType]/[entityId]/route.ts` (lines 130-185)

**Rationale**: Make manual translation detection easier by exposing `manuallyEditedLanguages` in the status API response.

**Implementation**:

Add to the status transformation logic (around line 145):

```typescript
// Track manually edited languages separately
const manuallyEditedLanguages: string[] = [];

for (const [lang, langStatus] of Object.entries(statusResult.byLanguage)) {
  if (!langStatus) continue;

  const internalStatus = langStatus.status as LanguageStatus;

  // Track manual edits
  if (internalStatus === 'manual') {
    manuallyEditedLanguages.push(lang);
  }

  // ... existing status mapping code
}

// Add to return object
return {
  entityId: statusResult.entityId,
  entityType: statusResult.entityType as TranslationEntityType,
  sourceLanguage: statusResult.sourceLanguage || 'en',
  overallStatus,
  completionPercentage: statusResult.completionPercentage,
  lastUpdated: statusResult.lastUpdatedAt || null,
  languages,
  completedLanguages,
  pendingLanguages,
  failedLanguages,
  manuallyEditedLanguages, // NEW
};
```

Update TypeScript types to include `manuallyEditedLanguages: string[]` in the response interface.

---

### Step 3: Integrate into InstructionEditor Component

**File**: `/src/components/InstructionEditor/InstructionEditor.tsx` (lines 79-149)

**Rationale**: Intercept article save flow to check for manual translations before proceeding.

**Implementation**:

```typescript
import { ManualEditWarningDialog } from '@/components/TranslationManagement/ManualEditWarning/ManualEditWarningDialog';
import { useManualEditCheck } from '@/hooks/useManualEditCheck';
import type { SupportedLanguage } from '@/lib/translation-service/translation-service.types';

export function InstructionEditor({
  articleData,
  onSave,
  onCancel,
  isSaving = false,
}: InstructionEditorProps) {
  // ... existing state

  // Manual edit check integration
  const { checkForManualEdits, isChecking } = useManualEditCheck();
  const [showManualEditWarning, setShowManualEditWarning] = useState(false);
  const [manuallyEditedLanguages, setManuallyEditedLanguages] = useState<SupportedLanguage[]>([]);
  const [pendingPayload, setPendingPayload] = useState<UpdateArticlePayload | null>(null);
  const [saveMode, setSaveMode] = useState<'skip' | 'overwrite' | null>(null);

  // Updated save handler
  const handleSave = useCallback(async () => {
    const payload: UpdateArticlePayload = {
      title: articleTitle,
      links: content.map(c => ({
        id: c.isNew ? undefined : c.id,
        title: c.title,
        linkType: mapContentTypeToLinkType(c.type),
        url: c.url,
        thumbnailUrl: c.thumbnailUrl || undefined,
        displayOrder: c.displayOrder,
        file: c.file,
      })),
      itemTags: tagsChanged ? tags : undefined,
    };

    // Check for manual translations before proceeding
    const result = await checkForManualEdits({
      entityType: 'article',
      entityId: articleData.id,
    });

    if (result.hasManualEdits) {
      // Show warning dialog
      setManuallyEditedLanguages(result.manuallyEditedLanguages);
      setPendingPayload(payload);
      setShowManualEditWarning(true);
      return;
    }

    // No manual edits, proceed with save
    await onSave(payload);
  }, [articleTitle, content, tags, tagsChanged, articleData.id, checkForManualEdits, onSave]);

  // Handle "Keep manual edits" choice
  const handleKeepManualEdits = useCallback(async () => {
    if (!pendingPayload) return;

    setSaveMode('skip');
    try {
      await onSave({
        ...pendingPayload,
        skipRetranslation: true,
      });
      setShowManualEditWarning(false);
      setPendingPayload(null);
    } finally {
      setSaveMode(null);
    }
  }, [pendingPayload, onSave]);

  // Handle "Re-translate all" choice
  const handleOverwriteManualEdits = useCallback(async () => {
    if (!pendingPayload) return;

    setSaveMode('overwrite');
    try {
      await onSave({
        ...pendingPayload,
        forceRetranslation: true,
      });
      setShowManualEditWarning(false);
      setPendingPayload(null);
    } finally {
      setSaveMode(null);
    }
  }, [pendingPayload, onSave]);

  // Handle cancel
  const handleCancelWarning = useCallback(() => {
    setShowManualEditWarning(false);
    setPendingPayload(null);
    setManuallyEditedLanguages([]);
  }, []);

  return (
    <div className={/* ... */}>
      {/* ... existing editor UI */}

      {/* Manual Edit Warning Dialog */}
      <ManualEditWarningDialog
        isOpen={showManualEditWarning}
        manuallyEditedLanguages={manuallyEditedLanguages}
        onKeepManual={handleKeepManualEdits}
        onOverwrite={handleOverwriteManualEdits}
        onCancel={handleCancelWarning}
        loading={saveMode}
        entityType="article"
      />
    </div>
  );
}
```

---

### Step 4: Update InstructionEditor Types

**File**: `/src/components/InstructionEditor/InstructionEditor.types.ts`

**Rationale**: Add optional flags for translation control to the payload interface.

**Implementation**:

```typescript
export interface UpdateArticlePayload {
  title: string;
  links: Array<{
    id?: string;
    title: string;
    linkType: string;
    url: string;
    thumbnailUrl?: string;
    displayOrder: number;
    file?: File;
  }>;
  itemTags?: string[];
  skipRetranslation?: boolean; // NEW
  forceRetranslation?: boolean; // NEW
}
```

---

### Step 5: Integrate into ItemForm Component

**File**: `/src/components/ItemForm.tsx` (lines 35-139)

**Rationale**: Intercept item save flow for items that already have translations.

**Implementation**:

```typescript
import { ManualEditWarningDialog } from '@/components/TranslationManagement/ManualEditWarning/ManualEditWarningDialog';
import { useManualEditCheck } from '@/hooks/useManualEditCheck';
import type { SupportedLanguage } from '@/lib/translation-service/translation-service.types';

export default function ItemForm({ item, properties = [], selectedPropertyId, onSave, onCancel, loading = false }: ItemFormProps) {
  // ... existing state

  // Manual edit check integration (only for edit mode)
  const { checkForManualEdits, isChecking } = useManualEditCheck();
  const [showManualEditWarning, setShowManualEditWarning] = useState(false);
  const [manuallyEditedLanguages, setManuallyEditedLanguages] = useState<SupportedLanguage[]>([]);
  const [pendingItemData, setPendingItemData] = useState<any>(null);
  const [saveMode, setSaveMode] = useState<'skip' | 'overwrite' | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const itemData = {
      ...formData,
      propertyId: formData.propertyId,
      qrCodeUrl: formData.qrCodeUrl || undefined,
      links: links.map((link, index) => ({
        id: link.id,
        title: link.title,
        linkType: link.linkType,
        url: link.url,
        thumbnailUrl: link.thumbnailUrl || undefined,
        displayOrder: index,
      })),
    };

    // Only check for manual translations if editing existing item
    if (item?.id) {
      const result = await checkForManualEdits({
        entityType: 'item',
        entityId: item.id,
      });

      if (result.hasManualEdits) {
        setManuallyEditedLanguages(result.manuallyEditedLanguages);
        setPendingItemData({ ...itemData, id: item.id });
        setShowManualEditWarning(true);
        return;
      }
    }

    // No manual edits or new item, proceed with save
    if (item?.id) {
      await onSave({ ...itemData, id: item.id } as UpdateItemRequest);
    } else {
      await onSave(itemData as CreateItemRequest);
    }
  };

  const handleKeepManualEdits = async () => {
    if (!pendingItemData) return;

    setSaveMode('skip');
    try {
      await onSave({
        ...pendingItemData,
        skipRetranslation: true,
      } as UpdateItemRequest);
      setShowManualEditWarning(false);
      setPendingItemData(null);
    } finally {
      setSaveMode(null);
    }
  };

  const handleOverwriteManualEdits = async () => {
    if (!pendingItemData) return;

    setSaveMode('overwrite');
    try {
      await onSave({
        ...pendingItemData,
        forceRetranslation: true,
      } as UpdateItemRequest);
      setShowManualEditWarning(false);
      setPendingItemData(null);
    } finally {
      setSaveMode(null);
    }
  };

  const handleCancelWarning = () => {
    setShowManualEditWarning(false);
    setPendingItemData(null);
    setManuallyEditedLanguages([]);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* ... existing form UI */}

      {/* Manual Edit Warning Dialog */}
      <ManualEditWarningDialog
        isOpen={showManualEditWarning}
        manuallyEditedLanguages={manuallyEditedLanguages}
        onKeepManual={handleKeepManualEdits}
        onOverwrite={handleOverwriteManualEdits}
        onCancel={handleCancelWarning}
        loading={saveMode}
        entityType="item"
      />
    </form>
  );
}
```

---

### Step 6: Update Item Types

**File**: `/src/types/index.ts`

**Rationale**: Add translation control flags to UpdateItemRequest type.

**Implementation**:

```typescript
export interface UpdateItemRequest {
  id: string;
  publicId: string;
  name: string;
  description: string;
  propertyId: string;
  qrCodeUrl?: string;
  links?: Array<{
    id?: string;
    title: string;
    linkType: LinkType;
    url: string;
    thumbnailUrl?: string;
    displayOrder: number;
  }>;
  skipRetranslation?: boolean; // NEW
  forceRetranslation?: boolean; // NEW
}
```

---

### Step 7: Update Article Update API Endpoint

**File**: `/src/app/api/articles/[id]/route.ts` (PUT handler)

**Rationale**: Accept and process `skipRetranslation` and `forceRetranslation` flags.

**Implementation**:

```typescript
// In PUT handler
const body = await req.json();
const {
  title,
  links,
  itemTags,
  skipRetranslation = false,
  forceRetranslation = false
} = body;

// Update article title
if (title !== undefined) {
  const { error: updateError } = await supabase
    .from('item_articles')
    .update({
      title,
      updated_at: new Date().toISOString(),
    })
    .eq('id', articleId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }
}

// Handle translation logic based on flags
if (skipRetranslation) {
  // Do NOT queue re-translation
  // Existing manual translations will become stale (source_updated_at > source_version_at)
  console.log('Skipping re-translation for article:', articleId);
} else if (forceRetranslation) {
  // Queue re-translation for all configured languages
  // This will overwrite manual translations
  const { error: translationError } = await fetch('/api/translations/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      entityType: 'article',
      entityId: articleId,
      forceRetranslate: true,
    }),
  });

  if (translationError) {
    console.error('Failed to queue re-translation:', translationError);
  }
} else {
  // Default behavior: trigger translation if configured
  // (existing behavior, no changes needed)
}
```

---

### Step 8: Update Item Update API Endpoint

**File**: `/src/app/api/items/[id]/route.ts` (PUT handler)

**Rationale**: Accept and process `skipRetranslation` and `forceRetranslation` flags for items.

**Implementation**:

```typescript
// In PUT handler
const body = await req.json();
const {
  name,
  description,
  publicId,
  propertyId,
  qrCodeUrl,
  links,
  skipRetranslation = false,
  forceRetranslation = false
} = body;

// Update item
const { error: updateError } = await supabase
  .from('items')
  .update({
    name,
    description,
    public_id: publicId,
    property_id: propertyId,
    qr_code_url: qrCodeUrl,
    updated_at: new Date().toISOString(),
  })
  .eq('id', itemId);

if (updateError) {
  return NextResponse.json({ error: updateError.message }, { status: 500 });
}

// Handle translation logic
if (skipRetranslation) {
  console.log('Skipping re-translation for item:', itemId);
} else if (forceRetranslation) {
  await fetch('/api/translations/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      entityType: 'item',
      entityId: itemId,
      forceRetranslate: true,
    }),
  });
}
```

---

### Step 9: Add Error Handling UI

**File**: `/src/components/InstructionEditor/InstructionEditor.tsx`

**Rationale**: Display user-friendly error messages if translation check fails.

**Implementation**:

```typescript
const { checkForManualEdits, isChecking, error: checkError } = useManualEditCheck();

// Show error toast/alert if check fails
useEffect(() => {
  if (checkError) {
    console.error('Translation check error:', checkError);
    // Optional: show toast notification
  }
}, [checkError]);
```

Add similar error handling to ItemForm.

---

### Step 10: Update Loading States

**File**: `/src/components/InstructionEditor/InstructionEditor.tsx`

**Rationale**: Show loading state during manual translation check.

**Implementation**:

```typescript
// Disable save button while checking
<button
  onClick={handleSave}
  disabled={isSaving || isChecking}
  className={/* ... */}
>
  {isChecking ? (
    <>
      <Loader2 className="w-4 h-4 animate-spin" />
      {t('checkingTranslations')}
    </>
  ) : isSaving ? (
    <>
      <Loader2 className="w-4 h-4 animate-spin" />
      {t('saving')}
    </>
  ) : (
    t('save')
  )}
</button>
```

---

### Step 11: Add Translation Keys

**File**: `/messages/en.json` (and all other locale files)

**Rationale**: Support i18n for new loading state message.

**Implementation**:

```json
{
  "articles": {
    "instructionEditor": {
      "checkingTranslations": "Checking translations...",
      "translationCheckFailed": "Failed to check translations. Proceeding with save."
    }
  },
  "items": {
    "form": {
      "checkingTranslations": "Checking translations...",
      "translationCheckFailed": "Failed to check translations. Proceeding with save."
    }
  }
}
```

Add translations for all 6 locales (en, es, fr, de, it, nl).

---

### Step 12: Add Unit Tests for useManualEditCheck Hook

**File**: `/src/hooks/__tests__/useManualEditCheck.test.ts` (NEW)

**Rationale**: Ensure hook correctly identifies manual translations and handles errors.

**Test Cases**:
1. Returns `hasManualEdits: true` when translations exist with `status === 'manual'`
2. Returns `hasManualEdits: false` when no manual translations exist
3. Returns `hasManualEdits: false` on API error (fail-safe)
4. Correctly extracts `manuallyEditedLanguages` array
5. Sets `isChecking` state correctly during fetch
6. Sets `error` state on fetch failure

---

### Step 13: Add Integration Tests

**File**: `/src/components/InstructionEditor/__tests__/InstructionEditor.integration.test.tsx` (NEW)

**Rationale**: Verify end-to-end save flow with manual translation detection.

**Test Cases**:
1. Save proceeds without dialog when no manual translations exist
2. Dialog appears when manual translations are detected
3. "Keep manual edits" saves with `skipRetranslation: true`
4. "Re-translate all" saves with `forceRetranslation: true`
5. "Cancel" aborts save and closes dialog
6. Loading states display correctly during check and save
7. Error handling works when translation check fails

---

### Step 14: Update API Documentation

**File**: `/docs/api/items.md` and `/docs/api/articles.md`

**Rationale**: Document new query parameters for update endpoints.

**Documentation**:

```markdown
### PUT /api/items/[id]

Update an existing item.

**Request Body:**
- `name` (string) - Item name
- `description` (string) - Item description
- `skipRetranslation` (boolean, optional) - If true, skip re-translation of content. Existing translations become stale.
- `forceRetranslation` (boolean, optional) - If true, queue re-translation for all languages, overwriting manual edits.

**Translation Behavior:**
- Default (neither flag): Trigger translation if configured (existing behavior)
- `skipRetranslation: true`: Update source without re-translating. Manual translations preserved but marked stale.
- `forceRetranslation: true`: Queue re-translation for all languages. Manual edits will be overwritten.
```

---

### Step 15: Manual QA Testing Checklist

**Rationale**: Verify all acceptance criteria before deployment.

**Test Scenarios**:

1. **Article with no translations**:
   - Edit article title
   - Click Save
   - ✅ Save proceeds immediately without dialog

2. **Article with manual translations**:
   - Edit article with manual FR and DE translations
   - Click Save
   - ✅ Dialog appears showing FR and DE languages
   - Click "Keep manual edits"
   - ✅ Article saves, translations become stale (detectable via source_version_at)
   - ✅ Dialog closes, success feedback shown

3. **Article with manual translations - Re-translate**:
   - Edit article with manual translations
   - Click Save
   - ✅ Dialog appears
   - Click "Re-translate all"
   - ✅ Article saves, re-translation job queued
   - ✅ Manual translations will be overwritten

4. **Article with manual translations - Cancel**:
   - Edit article
   - Click Save
   - ✅ Dialog appears
   - Click "Cancel"
   - ✅ Save aborted, article unchanged
   - ✅ Dialog closes, editor remains open

5. **Item with manual translations**:
   - Edit item name/description with manual translations
   - Click Save
   - ✅ Same behavior as article scenarios

6. **Loading states**:
   - Verify "Checking translations..." appears briefly
   - Verify "Saving..." appears during save
   - Verify appropriate button shows spinner during operation

7. **Error handling**:
   - Simulate API error during translation check
   - ✅ Error logged, save proceeds (fail-safe)

---

## Authorized Files for Modification

### New Files to Create
1. `/src/hooks/useManualEditCheck.ts` - Custom hook for manual translation detection
2. `/src/hooks/__tests__/useManualEditCheck.test.ts` - Unit tests for hook
3. `/src/components/InstructionEditor/__tests__/InstructionEditor.integration.test.tsx` - Integration tests

### Existing Files to Modify
1. `/src/components/InstructionEditor/InstructionEditor.tsx` (lines 79-149) - Add manual edit check integration
2. `/src/components/InstructionEditor/InstructionEditor.types.ts` - Add `skipRetranslation` and `forceRetranslation` flags
3. `/src/components/ItemForm.tsx` (lines 35-139) - Add manual edit check integration
4. `/src/types/index.ts` - Update `UpdateItemRequest` interface
5. `/src/app/api/articles/[id]/route.ts` - Accept and process translation control flags (PUT handler)
6. `/src/app/api/items/[id]/route.ts` - Accept and process translation control flags (PUT handler)
7. `/src/app/api/translations/status/[entityType]/[entityId]/route.ts` (lines 130-185) - Optional: expose `manuallyEditedLanguages`
8. `/messages/en.json` - Add translation keys for loading states
9. `/messages/es.json` - Add Spanish translations
10. `/messages/fr.json` - Add French translations
11. `/messages/de.json` - Add German translations
12. `/messages/it.json` - Add Italian translations
13. `/messages/nl.json` - Add Dutch translations

### Files to Reference (No Changes)
- `/src/components/TranslationManagement/ManualEditWarning/ManualEditWarningDialog.tsx` - Warning dialog component (from REQ-E05-022)
- `/src/lib/translation-service/translation-service.types.ts` - SupportedLanguage type
- `/src/lib/content-translation/index.ts` - Translation status utilities

---

## Dependencies

### Required (Must Be Complete First)
- **REQ-E05-001**: Translation Status API - Provides endpoint for checking translation status
- **REQ-E05-022**: ManualEditWarningDialog Component - UI component for warning dialog
- **REQ-E05-004**: source_version_at columns - Database columns for stale detection

### Related (Should Exist)
- **REQ-E05-003**: Re-Translate API Endpoint - For queuing re-translation when `forceRetranslation: true`
- Translation records must use `status` field with value 'manual' for manually edited translations

### Optional Enhancements
- **REQ-E05-023**: Stale Translation Indicator - Visual feedback after skipRetranslation is used

---

## Technical Risks

### 1. Translation Status API Limitations
**Risk**: Current status API maps 'manual' status to 'completed' in the response, making it difficult to detect manual translations.

**Mitigation**:
- Option 1: Enhance status API to expose `manuallyEditedLanguages` array (Step 2)
- Option 2: Query translation records directly from the hook
- Option 3: Create a dedicated `/api/translations/manual-check` endpoint

**Impact**: Medium - May require additional API development if current endpoint is insufficient.

---

### 2. Race Conditions in Save Flow
**Risk**: User could click save multiple times while translation check is in progress.

**Mitigation**:
- Disable save button during `isChecking` state (Step 10)
- Use `pendingPayload` state to queue exactly one save operation
- Clear pending state after save completes or user cancels

**Impact**: Low - Standard React state management patterns prevent this.

---

### 3. Fail-Safe Behavior on Error
**Risk**: If translation check fails, should save proceed or be blocked?

**Decision**: Save proceeds with a console warning (fail-safe approach). This prevents users from being blocked by temporary API issues.

**Rationale**: It's better to allow content updates than to completely block users due to a translation check failure. Manual translations are already at risk if the check fails, so the dialog wouldn't have helped anyway.

**Impact**: Low - Users can still save content even if translation check fails.

---

### 4. API Endpoint Compatibility
**Risk**: Article and item update endpoints may not currently accept additional body parameters.

**Mitigation**:
- Add optional `skipRetranslation` and `forceRetranslation` parameters with default values (false)
- Ensure backward compatibility (existing API calls continue working)
- Test with existing ItemForm and InstructionEditor usage

**Impact**: Low - Backward-compatible changes.

---

### 5. Loading State UX
**Risk**: Two sequential loading states (checking → saving) may confuse users.

**Mitigation**:
- Show clear loading messages ("Checking translations..." → "Saving...")
- Keep check fast (< 500ms) to minimize perceived delay
- Consider combining states if check is instant

**Impact**: Low - Clear messaging and fast API responses mitigate confusion.

---

## Out of Scope

### 1. ItemEditForm Component
While listed in the request's component summary table, ItemEditForm integration is deferred for this task. ItemForm covers the primary item editing flow. ItemEditForm can be addressed in a follow-up task if needed.

**Rationale**: Focus on the two main editors (InstructionEditor and ItemForm) first to validate the integration pattern. Add ItemEditForm integration once the pattern is proven.

---

### 2. InlineEdit Component
The request mentions considering inline edits for translatable fields (title, description). This is deferred due to complexity.

**Rationale**:
- Inline edits are quick, single-field updates
- Showing a modal dialog for every inline edit would be disruptive
- Solution: Inline edits could automatically use `skipRetranslation: true` behavior, preserving manual translations but marking them stale
- This decision should be made after user feedback on the main editor integration

**Defer to**: Follow-up task after main integration is tested with real users.

---

### 3. Batch Operations
Translation management page bulk operations are out of scope for this task. They will have their own manual edit handling logic.

**Rationale**: Bulk operations (REQ-E05-020) have separate UI flows and will implement their own warning dialogs specific to batch actions.

---

### 4. Link Updates
Item links (item_links table) are not covered by this integration. Only article titles and item name/description trigger manual edit checks.

**Rationale**:
- Links have their own translation records
- Link updates are less frequent than title/description updates
- Link translation preservation can be added in a future iteration if needed

**Defer to**: Future enhancement based on user needs.

---

### 5. Translation Job Monitoring
This task does not implement real-time feedback on re-translation job progress. Users will not see a progress bar or notification when `forceRetranslation` is used.

**Rationale**: Translation job monitoring is a separate feature (potentially part of Epic 3 - Dynamic Content Translation). This task only queues the job.

**Future Enhancement**: Translation status polling/websockets for real-time updates.

---

### 6. Undo Functionality
No undo mechanism is provided if users accidentally choose "Re-translate all" and lose manual edits.

**Rationale**:
- Database-level audit trails or versioning would be required
- Manual edits are overwritten permanently
- Users must make conscious choice via dialog

**Mitigation**: Dialog copy should be very clear about consequences of overwriting.

**Future Enhancement**: Translation version history (out of scope for Epic 5).

---

## Notes

### Translation Check Performance
The manual translation check adds a network request to the save flow. To minimize UX impact:
- Check should complete in < 500ms for most cases
- Status API should be optimized with proper indexes on `status` column
- Consider caching translation status for 10-30 seconds in the component

### API Design Decision
Two flags (`skipRetranslation` and `forceRetranslation`) are mutually exclusive but both optional:
- If both are true, `forceRetranslation` takes precedence
- If neither is true, default translation behavior applies
- This provides clear, explicit control over translation behavior

### Language Inconsistency Reminder
Codebase uses 'it' (Italian) not 'pt' (Portuguese) as defined in `translation-service.types.ts:22`. All implementations must use the SupportedLanguage type to avoid hardcoding incorrect language codes.

---

## Estimated Effort

**Total**: 12-16 hours

**Breakdown**:
- Step 1 (useManualEditCheck hook): 2-3 hours
- Step 2 (Status API enhancement): 1-2 hours (optional)
- Step 3-4 (InstructionEditor integration): 3-4 hours
- Step 5-6 (ItemForm integration): 2-3 hours
- Step 7-8 (API endpoint updates): 2-3 hours
- Step 9-11 (Error handling, loading states, i18n): 1-2 hours
- Step 12-13 (Testing): 2-3 hours
- Step 14 (Documentation): 0.5 hours
- Step 15 (QA): 1-2 hours

**Risk Buffer**: +25% for API investigation and integration issues (3-4 hours)

---

## Success Criteria

This implementation will be considered successful when:

1. ✅ `useManualEditCheck` hook correctly identifies manual translations
2. ✅ InstructionEditor shows ManualEditWarningDialog when manual translations exist
3. ✅ ItemForm shows ManualEditWarningDialog when editing items with manual translations
4. ✅ "Keep manual edits" option saves with `skipRetranslation: true`, preserving translations (which become stale)
5. ✅ "Re-translate all" option saves with `forceRetranslation: true`, queuing re-translation jobs
6. ✅ "Cancel" option aborts save and closes dialog
7. ✅ Save proceeds without dialog when no manual translations exist
8. ✅ Loading states display correctly ("Checking translations..." → "Saving...")
9. ✅ Error handling fails safely (save proceeds with console warning)
10. ✅ All TypeScript compilation passes with no errors
11. ✅ All unit and integration tests pass
12. ✅ Manual QA scenarios complete successfully
13. ✅ Translation keys exist for all 6 supported languages
14. ✅ API endpoints accept and process `skipRetranslation` and `forceRetranslation` flags

---

**Document Status**: PENDING
**Last Updated**: 2026-01-22 20:17:50
**Author**: Technical Lead
**Review Status**: Awaiting Implementation
