# REQ-357: Integrate Manual Translation Warning into Content Save Flow - Detailed Task Breakdown

**Document Created:** 2026-01-19 12:30:00 UTC
**Last Modified:** 2026-01-19 12:30:00 UTC

**Phase:** 5 - Manual Edit Preservation
**Task ID:** 5.3
**Epic:** L10N-Epic5 - Owner Translation Management
**Priority:** P2 - Medium
**Size:** M (Medium)
**Depends On:** REQ-355 (ManualEditWarningDialog component), Epic 1 (Foundation), Epic 3 (Dynamic Content Translation)

---

## Overview

This document provides granular, implementation-ready tasks for integrating the ManualEditWarningDialog into article and item save flows. The integration warns content editors before saving changes that would overwrite manually edited translations, allowing them to make informed decisions about preserving or re-translating their manually curated content.

---

## Source Documents Reference

| Document | Purpose |
|----------|---------|
| `/docs/REQ-357-integrate-warning-into-content-save-flow-overview.md` | Technical overview and architecture |
| `/docs/gen_requests_epic5.md` (REQ-357) | Original requirement specification |
| `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md` | Implementation plan (Phase 5, Task 5.3) |

---

## Task Breakdown

### Task 5.3.1: Create ManualTranslation Type Definitions

**File:** `/src/hooks/useManualTranslationCheck.types.ts` (NEW)
**Estimate:** 15 minutes
**Depends On:** None

**Description:**
Create type definitions for the manual translation check hook to ensure type safety across components.

**Implementation Steps:**

1. Create new file at `/src/hooks/useManualTranslationCheck.types.ts`

2. Add the following type definitions:
```typescript
import type { SupportedLanguage } from '@/lib/translation-service/translation-service.types';

/**
 * Represents a single manual translation entry
 */
export interface ManualTranslation {
  /** Language code of the manual translation */
  language: SupportedLanguage;
  /** ISO timestamp when translation was last edited */
  translatedAt?: string;
  /** User ID of who reviewed/edited the translation */
  reviewedBy?: string;
  /** Display name of the language for UI purposes */
  languageName?: string;
}

/**
 * Entity types that support translations
 */
export type TranslatableEntityType = 'article' | 'item' | 'link';

/**
 * Result of checking for manual translations
 */
export interface ManualTranslationCheckResult {
  /** Function to check for manual translations */
  checkForManualTranslations: (
    entityType: TranslatableEntityType,
    entityId: string
  ) => Promise<ManualTranslation[]>;
  /** Whether a check is currently in progress */
  isChecking: boolean;
  /** Error message if check failed, null otherwise */
  error: string | null;
  /** Reset error state */
  resetError: () => void;
}

/**
 * API response for manual translation check endpoint
 */
export interface CheckManualTranslationsResponse {
  success: boolean;
  hasManualTranslations: boolean;
  manualTranslations: ManualTranslation[];
  error?: string;
}
```

**Acceptance Criteria:**
- [ ] Type file created with all required interfaces
- [ ] Types exported and importable from the hooks directory
- [ ] No TypeScript compilation errors

---

### Task 5.3.2: Create useManualTranslationCheck Hook

**File:** `/src/hooks/useManualTranslationCheck.ts` (NEW)
**Estimate:** 45 minutes
**Depends On:** Task 5.3.1, Task 5.3.3 (can proceed with direct Supabase query initially)

**Description:**
Create a custom hook that checks for manual translations before save operations. This hook will query the database to find any translations with `translation_status = 'manual'` for a given entity.

**Implementation Steps:**

1. Create new file at `/src/hooks/useManualTranslationCheck.ts`

2. Import required dependencies:
```typescript
import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase-client';
import type {
  ManualTranslation,
  ManualTranslationCheckResult,
  TranslatableEntityType
} from './useManualTranslationCheck.types';
import { SUPPORTED_LANGUAGES } from '@/lib/translation-service/translation-service.types';
```

3. Implement the hook with the following logic:
   - Accept no parameters (stateless utility hook)
   - Return `checkForManualTranslations` async function, `isChecking` state, `error` state, and `resetError` function
   - Query appropriate translation table based on entityType:
     - `'article'` → `article_translations`
     - `'item'` → `item_translations`
     - `'link'` → `link_translations`
   - Filter for `translation_status = 'manual'`
   - Map results to `ManualTranslation[]` format
   - Handle errors gracefully - return empty array on error (fail-open)
   - Log errors to console for debugging
   - Enrich results with language display names from `SUPPORTED_LANGUAGES`

4. Example implementation structure:
```typescript
export function useManualTranslationCheck(): ManualTranslationCheckResult {
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetError = useCallback(() => setError(null), []);

  const checkForManualTranslations = useCallback(async (
    entityType: TranslatableEntityType,
    entityId: string
  ): Promise<ManualTranslation[]> => {
    setIsChecking(true);
    setError(null);

    try {
      const supabase = createClient();

      // Determine table and foreign key column
      const tableMap = {
        article: { table: 'article_translations', fkColumn: 'article_id' },
        item: { table: 'item_translations', fkColumn: 'item_id' },
        link: { table: 'link_translations', fkColumn: 'link_id' },
      };

      const { table, fkColumn } = tableMap[entityType];

      const { data, error: queryError } = await supabase
        .from(table)
        .select('language, translated_at, reviewed_by')
        .eq(fkColumn, entityId)
        .eq('translation_status', 'manual');

      if (queryError) {
        console.error('Error checking manual translations:', queryError);
        setError(queryError.message);
        return []; // Fail-open: allow save to proceed
      }

      // Map to ManualTranslation format with language names
      return (data || []).map(row => ({
        language: row.language,
        translatedAt: row.translated_at,
        reviewedBy: row.reviewed_by,
        languageName: SUPPORTED_LANGUAGES[row.language]?.name || row.language,
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error checking manual translations:', err);
      setError(errorMessage);
      return []; // Fail-open: allow save to proceed
    } finally {
      setIsChecking(false);
    }
  }, []);

  return {
    checkForManualTranslations,
    isChecking,
    error,
    resetError,
  };
}
```

5. Export hook from `/src/hooks/index.ts` (create if doesn't exist)

**Acceptance Criteria:**
- [ ] Hook correctly queries article_translations table for article entities
- [ ] Hook correctly queries item_translations table for item entities
- [ ] Hook correctly queries link_translations table for link entities
- [ ] Returns empty array when no manual translations exist
- [ ] Returns correctly formatted ManualTranslation array when manual translations exist
- [ ] Handles database query errors gracefully (returns empty array, logs error)
- [ ] Sets isChecking to true during query and false after completion
- [ ] Error state is set on failure and can be reset

---

### Task 5.3.3: Create Check Manual Translations API Endpoint

**File:** `/src/app/api/translations/check-manual/route.ts` (NEW)
**Estimate:** 30 minutes
**Depends On:** Epic 1 (translation tables exist)

**Description:**
Create an optional API endpoint for checking manual translations. This provides an alternative to direct Supabase queries and allows for better separation of concerns. The hook from Task 5.3.2 can use either approach.

**Implementation Steps:**

1. Create directory structure: `/src/app/api/translations/check-manual/`

2. Create `route.ts` with GET handler:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

/**
 * GET /api/translations/check-manual
 *
 * Query params:
 * - entityType: 'article' | 'item' | 'link' (required)
 * - entityId: string (required)
 *
 * Returns list of languages with manual translations for the entity
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const entityType = searchParams.get('entityType');
  const entityId = searchParams.get('entityId');

  // Validate required params
  if (!entityType || !entityId) {
    return NextResponse.json(
      { success: false, error: 'Missing entityType or entityId' },
      { status: 400 }
    );
  }

  if (!['article', 'item', 'link'].includes(entityType)) {
    return NextResponse.json(
      { success: false, error: 'Invalid entityType' },
      { status: 400 }
    );
  }

  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Verify auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Table and FK mapping
    const tableConfig = {
      article: { table: 'article_translations', fkColumn: 'article_id' },
      item: { table: 'item_translations', fkColumn: 'item_id' },
      link: { table: 'link_translations', fkColumn: 'link_id' },
    };

    const { table, fkColumn } = tableConfig[entityType as keyof typeof tableConfig];

    const { data, error: queryError } = await supabase
      .from(table)
      .select('language, translated_at, reviewed_by')
      .eq(fkColumn, entityId)
      .eq('translation_status', 'manual');

    if (queryError) {
      console.error('Error checking manual translations:', queryError);
      return NextResponse.json(
        { success: false, error: queryError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      hasManualTranslations: (data?.length || 0) > 0,
      manualTranslations: data || [],
    });
  } catch (error) {
    console.error('Unexpected error in check-manual:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

**Acceptance Criteria:**
- [ ] Endpoint validates required query parameters
- [ ] Endpoint validates entityType is one of 'article', 'item', 'link'
- [ ] Endpoint requires authentication
- [ ] Endpoint queries correct table based on entityType
- [ ] Returns 200 with hasManualTranslations and manualTranslations array on success
- [ ] Returns appropriate error responses for invalid requests
- [ ] Handles database errors gracefully

---

### Task 5.3.4: Create Warning Dialog State Types

**File:** `/src/app/dashboard2/instructions/[articleId]/edit/types.ts` (NEW - or inline in page)
**Estimate:** 10 minutes
**Depends On:** Task 5.3.1

**Description:**
Define state interface for the manual translation warning flow in edit pages.

**Implementation Steps:**

1. Define the warning state interface:
```typescript
import type { UpdateArticlePayload } from '@/components/InstructionEditor';
import type { ManualTranslation } from '@/hooks/useManualTranslationCheck.types';

/**
 * State for managing manual translation warning dialog
 */
export interface ManualTranslationWarningState {
  /** Whether we're currently checking for manual translations */
  isCheckingTranslations: boolean;
  /** Whether the warning dialog is visible */
  showWarningDialog: boolean;
  /** List of manual translations found */
  manualTranslations: ManualTranslation[];
  /** Payload to save when user confirms (null if not pending) */
  pendingSavePayload: UpdateArticlePayload | null;
}

/**
 * Initial state for the warning flow
 */
export const initialWarningState: ManualTranslationWarningState = {
  isCheckingTranslations: false,
  showWarningDialog: false,
  manualTranslations: [],
  pendingSavePayload: null,
};
```

**Acceptance Criteria:**
- [ ] Types defined for warning dialog state
- [ ] Initial state constant created
- [ ] Types are compatible with both article and item edit pages

---

### Task 5.3.5: Integrate Warning into Article Edit Page

**File:** `/src/app/dashboard2/instructions/[articleId]/edit/page.tsx` (MODIFY)
**Estimate:** 1.5 hours
**Depends On:** Task 5.3.2, Task 5.3.4, REQ-355 (ManualEditWarningDialog)

**Description:**
Modify the article edit page to check for manual translations before saving and display the warning dialog when manual translations are detected.

**Implementation Steps:**

1. Add new imports at the top of the file (after existing imports, ~line 21):
```typescript
import { useManualTranslationCheck } from '@/hooks/useManualTranslationCheck';
import { ManualEditWarningDialog } from '@/components/TranslationManagement/ManualEditWarning';
import type { ManualTranslation } from '@/hooks/useManualTranslationCheck.types';
```

2. Add new state variables inside `EditArticlePage` component (after `isSaving` state, ~line 35):
```typescript
// Manual translation warning state
const [isCheckingTranslations, setIsCheckingTranslations] = useState(false);
const [showWarningDialog, setShowWarningDialog] = useState(false);
const [manualTranslations, setManualTranslations] = useState<ManualTranslation[]>([]);
const [pendingSavePayload, setPendingSavePayload] = useState<UpdateArticlePayload | null>(null);
```

3. Initialize the hook (after state declarations):
```typescript
const { checkForManualTranslations } = useManualTranslationCheck();
```

4. Create `executeSave` function that contains the actual save logic (extract from current `handleSave`):
```typescript
/**
 * Execute the actual save operation
 * @param payload - The article update payload
 * @param options - Save options
 */
const executeSave = useCallback(async (
  payload: UpdateArticlePayload,
  options?: { preserveManualTranslations?: boolean; overwriteManual?: boolean }
) => {
  if (!articleData || !currentAccount) {
    throw new Error('Missing data or account context');
  }

  setIsSaving(true);

  try {
    const headers: Record<string, string> = {
      'x-current-account': currentAccount.id,
    };

    // Process links with file uploads
    const processedLinks = await Promise.all(
      payload.links.map(async (link) => ({
        id: link.id,
        title: link.title,
        linkType: link.linkType,
        url: link.url,
        thumbnailUrl: link.thumbnailUrl,
        displayOrder: link.displayOrder,
      }))
    );

    // Build API payload
    const apiPayload: any = {
      title: payload.title,
      links: processedLinks,
    };

    // Include item tags if they changed
    if (payload.itemTags) {
      apiPayload.itemTags = payload.itemTags;
    }

    // Add translation preservation options if specified
    if (options?.preserveManualTranslations) {
      apiPayload.preserveManualTranslations = true;
    }
    if (options?.overwriteManual) {
      apiPayload.triggerRetranslation = true;
    }

    // Update article
    const response = await adminApi.updateArticle(articleId, apiPayload, headers);

    if (!response.success) {
      throw new Error(response.error || 'Failed to update article');
    }

    console.log('Article updated successfully:', response.data);

    // Set success flag for list page
    sessionStorage.setItem('editSuccess', 'true');

    // Redirect to list page
    router.push('/dashboard2/instructions');
  } catch (error) {
    console.error('Error saving article:', error);
    throw error;
  } finally {
    setIsSaving(false);
  }
}, [articleId, articleData, currentAccount, router]);
```

5. Modify `handleSave` to check for manual translations first:
```typescript
/**
 * Handle save - check for manual translations before processing
 */
const handleSave = useCallback(async (payload: UpdateArticlePayload) => {
  if (!articleData || !currentAccount) {
    throw new Error('Missing data or account context');
  }

  // Step 1: Check for manual translations
  setIsCheckingTranslations(true);

  try {
    const foundManualTranslations = await checkForManualTranslations('article', articleId);
    setIsCheckingTranslations(false);

    // Step 2: If manual translations exist, show warning dialog
    if (foundManualTranslations.length > 0) {
      setPendingSavePayload(payload);
      setManualTranslations(foundManualTranslations);
      setShowWarningDialog(true);
      return; // Wait for user decision
    }

    // Step 3: No manual translations, proceed with save directly
    await executeSave(payload);
  } catch (error) {
    setIsCheckingTranslations(false);
    // If translation check fails, proceed with save (fail-open)
    console.warn('Translation check failed, proceeding with save:', error);
    await executeSave(payload);
  }
}, [articleId, articleData, currentAccount, checkForManualTranslations, executeSave]);
```

6. Add dialog action handlers (after `handleCancel`):
```typescript
/**
 * Handle "Keep Manual Edits" action - save without re-translating manual translations
 */
const handleKeepManualEdits = useCallback(async () => {
  setShowWarningDialog(false);
  if (pendingSavePayload) {
    await executeSave(pendingSavePayload, { preserveManualTranslations: true });
    setPendingSavePayload(null);
    setManualTranslations([]);
  }
}, [pendingSavePayload, executeSave]);

/**
 * Handle "Re-translate All" action - save and re-translate all languages
 */
const handleRetranslateAll = useCallback(async () => {
  setShowWarningDialog(false);
  if (pendingSavePayload) {
    await executeSave(pendingSavePayload, { overwriteManual: true });
    setPendingSavePayload(null);
    setManualTranslations([]);
  }
}, [pendingSavePayload, executeSave]);

/**
 * Handle "Cancel" action - abort the save operation
 */
const handleCancelSave = useCallback(() => {
  setShowWarningDialog(false);
  setPendingSavePayload(null);
  setManualTranslations([]);
}, []);
```

7. Add dialog rendering in the return statement (before final closing tag or after `InstructionEditor`):
```typescript
{/* Manual Translation Warning Dialog */}
<ManualEditWarningDialog
  isOpen={showWarningDialog}
  manualTranslations={manualTranslations}
  onKeepManualEdits={handleKeepManualEdits}
  onRetranslateAll={handleRetranslateAll}
  onCancel={handleCancelSave}
/>
```

8. Update `isSaving` prop to include translation check state:
```typescript
<InstructionEditor
  articleData={articleData}
  onSave={handleSave}
  onCancel={handleCancel}
  isSaving={isSaving || isCheckingTranslations}
/>
```

**Acceptance Criteria:**
- [ ] Clicking save triggers manual translation check before API call
- [ ] Loading state shown during translation check
- [ ] Warning dialog appears when manual translations are detected
- [ ] "Keep Manual Edits" proceeds with save and preserves manual translations
- [ ] "Re-translate All" proceeds with save and triggers re-translation
- [ ] "Cancel" closes dialog and aborts save operation
- [ ] Save proceeds directly when no manual translations exist
- [ ] Translation check failures don't block the save (fail-open)

---

### Task 5.3.6: Integrate Warning into Item Edit Page

**File:** `/src/app/dashboard2/items/[publicId]/edit/page.tsx` (MODIFY)
**Estimate:** 1.5 hours
**Depends On:** Task 5.3.2, Task 5.3.4, REQ-355 (ManualEditWarningDialog)

**Description:**
Modify the item edit page to check for manual translations before saving and display the warning dialog when manual translations are detected.

**Implementation Steps:**

1. Add new imports at the top of the file (after existing imports, ~line 26):
```typescript
import { useManualTranslationCheck } from '@/hooks/useManualTranslationCheck';
import { ManualEditWarningDialog } from '@/components/TranslationManagement/ManualEditWarning';
import type { ManualTranslation } from '@/hooks/useManualTranslationCheck.types';
```

2. Add new state variables inside `EditItemPage` component (after `error` state, ~line 39):
```typescript
// Manual translation warning state
const [isCheckingTranslations, setIsCheckingTranslations] = useState(false);
const [showWarningDialog, setShowWarningDialog] = useState(false);
const [manualTranslations, setManualTranslations] = useState<ManualTranslation[]>([]);
const [pendingSaveCallback, setPendingSaveCallback] = useState<(() => Promise<void>) | null>(null);
```

3. Initialize the hook (after state declarations):
```typescript
const { checkForManualTranslations } = useManualTranslationCheck();
```

4. Create `executeSave` function (extract from current `handleSubmit`):
```typescript
/**
 * Execute the actual save operation
 * @param options - Save options for translation handling
 */
const executeSave = useCallback(async (
  options?: { preserveManualTranslations?: boolean; overwriteManual?: boolean }
) => {
  if (!item) return;

  setSaving(true);
  setError(null);

  const headers: Record<string, string> = {};
  if (currentAccount) {
    headers['x-current-account'] = currentAccount.id;
  }

  try {
    const propertyId = item.propertyId || item.property?.id;
    if (!propertyId) {
      setError('Property ID is missing');
      setSaving(false);
      return;
    }

    const payload: any = {
      name,
      description,
      propertyId,
      tags,
      links: [],
    };

    // Add translation preservation options if specified
    if (options?.preserveManualTranslations) {
      payload.preserveManualTranslations = true;
    }
    if (options?.overwriteManual) {
      payload.triggerRetranslation = true;
    }

    const response = await adminApi.updateItem(publicId, payload, headers);

    if (response.success) {
      router.push('/dashboard2/items');
    } else {
      setError(response.error || 'Failed to update item');
    }
  } catch (err) {
    console.error('Error updating item:', err);
    setError(err instanceof Error ? err.message : 'Failed to update item');
  } finally {
    setSaving(false);
  }
}, [item, name, description, tags, currentAccount, publicId, router]);
```

5. Modify `handleSubmit` to check for manual translations first:
```typescript
/**
 * Handle form submission - check for manual translations before processing
 */
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!item) return;

  // Step 1: Check for manual translations
  setIsCheckingTranslations(true);

  try {
    const foundManualTranslations = await checkForManualTranslations('item', item.id);
    setIsCheckingTranslations(false);

    // Step 2: If manual translations exist, show warning dialog
    if (foundManualTranslations.length > 0) {
      setManualTranslations(foundManualTranslations);
      setShowWarningDialog(true);
      return; // Wait for user decision
    }

    // Step 3: No manual translations, proceed with save directly
    await executeSave();
  } catch (error) {
    setIsCheckingTranslations(false);
    // If translation check fails, proceed with save (fail-open)
    console.warn('Translation check failed, proceeding with save:', error);
    await executeSave();
  }
};
```

6. Add dialog action handlers (after existing handlers):
```typescript
/**
 * Handle "Keep Manual Edits" action
 */
const handleKeepManualEdits = useCallback(async () => {
  setShowWarningDialog(false);
  setManualTranslations([]);
  await executeSave({ preserveManualTranslations: true });
}, [executeSave]);

/**
 * Handle "Re-translate All" action
 */
const handleRetranslateAll = useCallback(async () => {
  setShowWarningDialog(false);
  setManualTranslations([]);
  await executeSave({ overwriteManual: true });
}, [executeSave]);

/**
 * Handle "Cancel" action
 */
const handleCancelSave = useCallback(() => {
  setShowWarningDialog(false);
  setManualTranslations([]);
}, []);
```

7. Update save button disabled state to include translation check:
```typescript
disabled={saving || isCheckingTranslations || !name.trim()}
```

8. Update save button text to show translation check state:
```typescript
{saving || isCheckingTranslations ? (
  <>
    <Loader2 className="w-4 h-4 animate-spin" />
    {isCheckingTranslations ? 'Checking translations...' : 'Saving...'}
  </>
) : (
  <>
    <Save className="w-4 h-4" />
    Save Changes
  </>
)}
```

9. Add dialog rendering before form closing tag:
```typescript
{/* Manual Translation Warning Dialog */}
<ManualEditWarningDialog
  isOpen={showWarningDialog}
  manualTranslations={manualTranslations}
  onKeepManualEdits={handleKeepManualEdits}
  onRetranslateAll={handleRetranslateAll}
  onCancel={handleCancelSave}
/>
```

**Acceptance Criteria:**
- [ ] Clicking save triggers manual translation check before API call
- [ ] Loading state shown during translation check with appropriate text
- [ ] Warning dialog appears when manual translations are detected
- [ ] "Keep Manual Edits" proceeds with save and preserves manual translations
- [ ] "Re-translate All" proceeds with save and triggers re-translation
- [ ] "Cancel" closes dialog and aborts save operation
- [ ] Save proceeds directly when no manual translations exist
- [ ] Translation check failures don't block the save (fail-open)

---

### Task 5.3.7: Update API Methods for Translation Preservation Flags (Optional)

**File:** `/src/lib/api.ts` (MODIFY - if needed)
**Estimate:** 30 minutes
**Depends On:** Backend API support for these flags

**Description:**
Update the `adminApi.updateArticle()` and `adminApi.updateItem()` methods to support the new translation preservation flags, if the backend API supports them.

**Implementation Steps:**

1. Check if the existing API methods already pass through all payload properties

2. If needed, update type definitions for update payloads:
```typescript
interface UpdateOptions {
  preserveManualTranslations?: boolean;
  triggerRetranslation?: boolean;
}
```

3. Ensure flags are properly serialized in the API request body

4. Document the expected backend behavior for these flags:
   - `preserveManualTranslations: true` - Backend should NOT queue re-translation jobs for languages with `translation_status = 'manual'`
   - `triggerRetranslation: true` - Backend should queue re-translation jobs for ALL languages, including manually edited ones

**Note:** If the backend doesn't yet support these flags, this task becomes a stub for future implementation. The UI will function correctly, but the actual preservation behavior will need backend work.

**Acceptance Criteria:**
- [ ] API methods accept translation preservation options
- [ ] Options are properly serialized in request body
- [ ] Backend behavior is documented (even if not yet implemented)

---

### Task 5.3.8: Add Hook Export to Hooks Index

**File:** `/src/hooks/index.ts` (CREATE or MODIFY)
**Estimate:** 5 minutes
**Depends On:** Task 5.3.2

**Description:**
Export the new hook from the hooks directory index file for cleaner imports.

**Implementation Steps:**

1. Create or update `/src/hooks/index.ts`:
```typescript
// Existing exports (if any)
export * from './usePropertyContext';
// ... other existing exports

// New export for manual translation check
export * from './useManualTranslationCheck';
export * from './useManualTranslationCheck.types';
```

**Acceptance Criteria:**
- [ ] Hook can be imported from '@/hooks'
- [ ] Types can be imported from '@/hooks'

---

### Task 5.3.9: Write Unit Tests for useManualTranslationCheck Hook

**File:** `/src/hooks/__tests__/useManualTranslationCheck.test.ts` (NEW)
**Estimate:** 45 minutes
**Depends On:** Task 5.3.2

**Description:**
Write unit tests for the manual translation check hook.

**Implementation Steps:**

1. Create test file at `/src/hooks/__tests__/useManualTranslationCheck.test.ts`

2. Test scenarios:
   - Returns empty array when no manual translations exist
   - Returns correct ManualTranslation array when manual translations exist
   - Handles database query errors gracefully (returns empty array)
   - Sets isChecking to true during query and false after
   - Sets error state on failure
   - resetError clears the error state
   - Queries correct table for 'article' entityType
   - Queries correct table for 'item' entityType
   - Queries correct table for 'link' entityType

3. Mock Supabase client for tests:
```typescript
import { renderHook, act } from '@testing-library/react';
import { useManualTranslationCheck } from '../useManualTranslationCheck';

// Mock Supabase client
jest.mock('@/lib/supabase-client', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      })),
    })),
  })),
}));

describe('useManualTranslationCheck', () => {
  it('returns empty array when no manual translations exist', async () => {
    // Test implementation
  });

  // ... additional tests
});
```

**Acceptance Criteria:**
- [ ] All test scenarios pass
- [ ] Tests cover happy path and error cases
- [ ] Tests verify correct table is queried for each entity type

---

### Task 5.3.10: Write Integration Tests for Save Flow

**File:** `/src/app/dashboard2/instructions/[articleId]/edit/__tests__/page.test.tsx` (NEW)
**Estimate:** 1 hour
**Depends On:** Task 5.3.5, Task 5.3.6

**Description:**
Write integration tests for the article and item edit page save flows with manual translation warning.

**Implementation Steps:**

1. Create test file for article edit page

2. Test scenarios:
   - Dialog appears when manual translations exist
   - "Keep Manual Edits" calls API with preserveManualTranslations flag
   - "Re-translate All" calls API with triggerRetranslation flag
   - "Cancel" closes dialog without API call
   - Save proceeds directly when no manual translations
   - Save proceeds when translation check fails (fail-open)

3. Similar tests for item edit page

**Acceptance Criteria:**
- [ ] All integration test scenarios pass
- [ ] Tests verify dialog interactions
- [ ] Tests verify API calls with correct flags

---

## Files Summary

### Files to Create

| File Path | Task | Purpose |
|-----------|------|---------|
| `/src/hooks/useManualTranslationCheck.types.ts` | 5.3.1 | Type definitions for the hook |
| `/src/hooks/useManualTranslationCheck.ts` | 5.3.2 | Hook for checking manual translations |
| `/src/app/api/translations/check-manual/route.ts` | 5.3.3 | API endpoint (optional) |
| `/src/hooks/__tests__/useManualTranslationCheck.test.ts` | 5.3.9 | Unit tests for hook |

### Files to Modify

| File Path | Task | Changes |
|-----------|------|---------|
| `/src/app/dashboard2/instructions/[articleId]/edit/page.tsx` | 5.3.5 | Add warning dialog integration |
| `/src/app/dashboard2/items/[publicId]/edit/page.tsx` | 5.3.6 | Add warning dialog integration |
| `/src/hooks/index.ts` | 5.3.8 | Export new hook |
| `/src/lib/api.ts` | 5.3.7 | Add translation flags (if needed) |

### Files to Import From (Read-Only)

| File Path | What to Import |
|-----------|----------------|
| `/src/components/TranslationManagement/ManualEditWarning/ManualEditWarningDialog.tsx` | `ManualEditWarningDialog` component |
| `/src/lib/translation-service/translation-service.types.ts` | `SupportedLanguage`, `SUPPORTED_LANGUAGES` |
| `/src/lib/supabase-client.ts` | Supabase client for queries |

---

## Dependencies Graph

```
Task 5.3.1 (Types)
    │
    └──► Task 5.3.2 (Hook) ◄─── Task 5.3.3 (API - optional)
              │
              ├──► Task 5.3.4 (State Types)
              │
              ├──► Task 5.3.5 (Article Page) ◄─── REQ-355 (Dialog Component)
              │
              ├──► Task 5.3.6 (Item Page) ◄─── REQ-355 (Dialog Component)
              │
              └──► Task 5.3.8 (Export)
                      │
                      └──► Task 5.3.9 (Unit Tests)
                              │
                              └──► Task 5.3.10 (Integration Tests)

Task 5.3.7 (API Methods) - Can run in parallel
```

---

## Acceptance Criteria Summary

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

## Testing Checklist

### Manual Testing Scenarios

1. **Article with no manual translations:**
   - [ ] Edit article → Save → Should save directly without dialog

2. **Article with manual translations:**
   - [ ] Edit article → Save → Dialog appears listing affected languages
   - [ ] Click "Keep Manual Edits" → Save completes, manual translations preserved
   - [ ] Click "Re-translate All" → Save completes, re-translation queued
   - [ ] Click "Cancel" → Dialog closes, no save

3. **Item with no manual translations:**
   - [ ] Edit item → Save → Should save directly without dialog

4. **Item with manual translations:**
   - [ ] Edit item → Save → Dialog appears listing affected languages
   - [ ] Test all three dialog options

5. **Error scenarios:**
   - [ ] Database error during translation check → Save proceeds (fail-open)
   - [ ] Network timeout during check → Save proceeds (fail-open)

6. **Loading states:**
   - [ ] "Checking translations..." shown during translation check
   - [ ] Save button disabled during check
   - [ ] "Saving..." shown during actual save

---

## References

- **Overview Document:** `/docs/REQ-357-integrate-warning-into-content-save-flow-overview.md`
- **Request Document:** `/docs/gen_requests_epic5.md` (REQ-357)
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md` (Phase 5, Task 5.3)
- **Dialog Pattern:** `/src/components/ItemCreationWorkflow/components/shared/ConfirmExitDialog.tsx`
- **Article Edit Page:** `/src/app/dashboard2/instructions/[articleId]/edit/page.tsx`
- **Item Edit Page:** `/src/app/dashboard2/items/[publicId]/edit/page.tsx`

---

*Document generated for FAQBNB L10N Epic 5 - Task 5.3: Integrate Warning into Content Save Flow*
*Detailed task breakdown ready for AI coding agent or junior developer execution*
