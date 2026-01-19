# REQ-331: Integrate Translation Preview Panel into Item Editor - Implementation Overview

**Last Modified:** 2026-01-18
**Request ID:** REQ-331
**Type:** ENHANCEMENT
**Size:** M (Medium)
**Phase:** 7 - Integration & Polish
**Task ID:** 7.2
**PRD Reference:** Plan-111-L10N-Epic5-Owner-Translation-Management.md
**Dependencies:** Epic 1 (Foundation), Epic 3 (Dynamic Content Translation), REQ-310 (TranslationPreviewPanel), REQ-314 (useTranslationStatus), REQ-315 (useTranslationRealtime)

---

## Summary

Integrate the TranslationPreviewPanel component into the item editor page so that property owners receive immediate translation status feedback after saving an item. The panel will automatically open when translations are pending or incomplete, providing visibility into translation progress and enabling quick access to translation management actions without navigating away from the editor.

This task follows the same pattern established in REQ-330 (article editor integration), adapting it for the item editor context with its different data structure (name/description vs title/description).

---

## User Story

As a **property owner editing item metadata**, I want to **see the translation preview panel automatically appear after saving my item** so that I can **immediately understand the translation status across all languages and take action on pending or failed translations without leaving the editor context**.

---

## Acceptance Criteria

| # | Criterion | Verification Method |
|---|-----------|---------------------|
| AC-1 | TranslationPreviewPanel component is integrated into the item editor page | Code inspection, visual verification |
| AC-2 | Panel displays automatically after successful item save operations | Functional testing with save action |
| AC-3 | Panel loads translation status data for the saved item across all six languages | API response verification, visual check |
| AC-4 | Panel automatically opens when one or more translations have pending status | Conditional rendering verification |
| AC-5 | Panel remains collapsed when all translations are complete, but remains available for manual opening | State management verification |
| AC-6 | Panel displays item source content (name, description) at the top for reference | Visual inspection |
| AC-7 | Panel shows status indicators for each of the six supported languages (en, fr, es, de, nl, it) | Visual inspection with test data |
| AC-8 | Panel includes action buttons for editing, re-translating, and retrying translations | Click handler verification |
| AC-9 | Panel positioning and animation matches standard TranslationPreviewPanel behavior (400px slide-in from right) | Visual consistency check |
| AC-10 | Panel does not disrupt item editor layout when displayed | Layout testing |
| AC-11 | Panel handles cases where no translations exist gracefully without errors | Edge case testing |
| AC-12 | Panel updates in real-time if translation statuses change while panel is open | Realtime subscription verification |
| AC-13 | Panel can be manually closed by user after reviewing translation status | User interaction testing |
| AC-14 | Integration maintains responsive layout on tablet and desktop viewports | Responsive testing |
| AC-15 | Panel is keyboard accessible and integrates with editor keyboard navigation | WCAG 2.1 AA testing |

---

## Technical Approach

### Architecture Overview

This integration modifies the existing item edit page (`/src/app/dashboard2/items/[publicId]/edit/page.tsx`) which directly renders a form for item metadata editing. Unlike the article editor (which uses a dedicated `InstructionEditor` component), the item editor has inline state management and form handling. The TranslationPreviewPanel will be integrated at the page level, triggered after successful save operations.

```
EditItemPage (page.tsx)
├── State: showTranslationPanel, savedItemData
├── Form (inline - name, description, tags, room, item type)
│   └── handleSubmit → triggers panel display on success
├── TranslationPreviewPanel (new integration)
│   ├── Receives: entityType='item', entityId, sourceContent
│   ├── Uses: useTranslationStatus hook
│   └── Uses: useTranslationRealtime hook (optional)
```

### Current Item Editor Structure

The current item editor page:
- Uses `publicId` (not UUID) to fetch item data via `adminApi.getItem(publicId)`
- Maintains local state for form fields: `name`, `description`, `tags`
- Saves via `adminApi.updateItem(publicId, {...})`
- Redirects to `/dashboard2/items` after successful save
- Returns the item's internal UUID via `item.id` after fetch

Key difference from article editor: The item editor works with `publicId` for routing but has access to the internal `id` (UUID) after fetching the item data. The translation system uses UUIDs, so we'll use `item.id` for translation queries.

### Integration Points

1. **After Save Hook:** Modify `handleSubmit` to show preview panel after successful save instead of immediate redirect
2. **Panel State Management:** Add state to track panel visibility and saved item context
3. **Source Content Propagation:** Pass the saved item's name and description to the panel
4. **Auto-open Logic:** Query translation status and auto-open panel if any translations are pending

### State Management

```typescript
// New state additions to EditItemPage
interface TranslationPreviewState {
  isOpen: boolean;
  autoOpened: boolean;  // Track if auto-opened vs manually opened
}

// State for saved item context (needed because form state may change)
interface SavedItemContext {
  id: string;          // UUID from item.id
  name: string;
  description: string | null;
  sourceLanguage: string;
}

// Default states
const [showTranslationPanel, setShowTranslationPanel] = useState(false);
const [savedItemContext, setSavedItemContext] = useState<SavedItemContext | null>(null);

// After successful save
const handleSaveSuccess = () => {
  // Store context for panel
  setSavedItemContext({
    id: item!.id,
    name,
    description: description || null,
    sourceLanguage: item?.source_language || 'en',
  });

  // Check if any translations are pending (via hook or inline check)
  // Auto-open if pending, otherwise just make panel available
  setShowTranslationPanel(hasPendingTranslations);
};
```

### Data Flow

```
User clicks "Save Changes"
    │
    ▼
handleSubmit() in page.tsx
    │
    ├── API call: adminApi.updateItem(publicId, {...})
    │
    ├── On Success:
    │   ├── Store savedItemContext with current form values
    │   ├── Fetch translation status via useTranslationStatus (item.id)
    │   │
    │   └── If any status is 'pending' or 'processing' or 'failed':
    │       └── setShowTranslationPanel(true)
    │
    └── TranslationPreviewPanel renders with:
        ├── entityType: 'item'
        ├── entityId: item.id (UUID)
        ├── sourceLanguage: item.source_language || 'en'
        └── sourceContent: { name, description }
```

### Entity Type Mapping

The TranslationPreviewPanel and translation APIs work with entity types. For items:

| Item Editor Field | Source Content Key | Translation Table Column |
|-------------------|-------------------|-------------------------|
| `name` | `name` | `item_translations.name` |
| `description` | `description` | `item_translations.description` |

Note: The panel's `sourceContent` prop uses generic keys that may differ per entity type. For articles it's `title`/`description`, for items it's `name`/`description`. The TranslationPreviewPanel component should handle this mapping internally.

---

## Component Integration Details

### TranslationPreviewPanel Props Usage

```typescript
<TranslationPreviewPanel
  entityType="item"
  entityId={savedItemContext?.id || item?.id}
  sourceLanguage={item?.source_language || 'en'}
  sourceContent={{
    name: savedItemContext?.name || name,
    description: savedItemContext?.description || description || undefined,
  }}
  isOpen={showTranslationPanel}
  onClose={handlePanelClose}
  onTranslationEdited={(language) => {
    // Optional: show toast notification
    console.log(`Translation edited for ${language}`);
  }}
  onRetranslate={(language) => {
    // Optional: trigger re-translation via API
    console.log(`Re-translation requested for ${language}`);
  }}
  onRetry={(language) => {
    // Optional: retry failed translation
    console.log(`Retry requested for ${language}`);
  }}
/>
```

### Save Flow Modification

**Current Flow:**
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  // ... validation and API call ...

  if (response.success) {
    router.push('/dashboard2/items');  // Immediate redirect
  }
};
```

**Modified Flow:**
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  // ... validation and API call ...

  if (response.success) {
    // Store saved item context
    setSavedItemContext({
      id: item!.id,
      name,
      description: description || null,
      sourceLanguage: item?.source_language || 'en',
    });

    // Show translation panel instead of immediate redirect
    setShowTranslationPanel(true);
  }
};
```

### Panel Close Handler

```typescript
const handlePanelClose = useCallback(() => {
  setShowTranslationPanel(false);

  // If save was successful, navigate to items list
  if (savedItemContext) {
    router.push('/dashboard2/items');
  }
}, [savedItemContext, router]);

// Alternative: "Continue Editing" option
const handleContinueEditing = useCallback(() => {
  setShowTranslationPanel(false);
  setSavedItemContext(null);
  // Stay on page, allow further edits
}, []);
```

### Layout Considerations

The TranslationPreviewPanel is positioned as a fixed overlay from the right side (400px width). The item editor form remains accessible underneath, with the panel not disrupting the editor layout.

```tsx
// In the page render
return (
  <div className="max-w-2xl mx-auto relative">
    {/* Header */}
    <div className="mb-6">...</div>

    {/* Error Banner */}
    {error && <div>...</div>}

    {/* Edit Form */}
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm ...">
      {/* Form fields */}
    </form>

    {/* Translation Preview Panel - overlays from right */}
    {item && (
      <TranslationPreviewPanel
        entityType="item"
        entityId={item.id}
        sourceLanguage={item.source_language || 'en'}
        sourceContent={{
          name: savedItemContext?.name || name,
          description: savedItemContext?.description || description || undefined,
        }}
        isOpen={showTranslationPanel}
        onClose={handlePanelClose}
      />
    )}
  </div>
);
```

---

## Implementation Tasks

### Task 1: Add translation panel imports and state
**Effort:** S (15-30 min)

Add necessary imports and state variables to track panel visibility and saved item context.

**Files:**
- Modify: `/src/app/dashboard2/items/[publicId]/edit/page.tsx`

**Changes:**
```typescript
// Add imports
import { TranslationPreviewPanel } from '@/components/TranslationManagement';
import { useTranslationStatus } from '@/hooks/useTranslationStatus';

// Add state (inside component)
const [showTranslationPanel, setShowTranslationPanel] = useState(false);
const [savedItemContext, setSavedItemContext] = useState<{
  id: string;
  name: string;
  description: string | null;
  sourceLanguage: string;
} | null>(null);
```

### Task 2: Modify save handler to trigger panel display
**Effort:** M (30 min - 1 hour)

Update the `handleSubmit` function to show the translation panel after successful save instead of immediate redirect.

**Files:**
- Modify: `/src/app/dashboard2/items/[publicId]/edit/page.tsx`

**Changes:**
- After successful `adminApi.updateItem()` call:
  - Store saved item context
  - Set `showTranslationPanel` to true
  - Remove the immediate `router.push()` redirect
  - Defer navigation to panel close handler

**Before:**
```typescript
if (response.success) {
  router.push('/dashboard2/items');
}
```

**After:**
```typescript
if (response.success) {
  setSavedItemContext({
    id: item!.id,
    name,
    description: description || null,
    sourceLanguage: (item as any).source_language || 'en',
  });
  setShowTranslationPanel(true);
}
```

### Task 3: Implement auto-open logic based on translation status
**Effort:** M (1-2 hours)

Fetch translation status after save and auto-open panel if any translations are pending, processing, or failed.

**Files:**
- Modify: `/src/app/dashboard2/items/[publicId]/edit/page.tsx`

**Implementation:**
```typescript
// Option A: Use useTranslationStatus hook
const { data: translationStatus, isLoading: statusLoading } = useTranslationStatus({
  entityType: 'item',
  entityId: item?.id,
  enabled: savedItemContext !== null,
});

// Auto-open effect
useEffect(() => {
  if (translationStatus && savedItemContext) {
    const hasPending = translationStatus.translations &&
      Object.values(translationStatus.translations).some(
        (t: any) => t?.status === 'pending' || t?.status === 'processing' || t?.status === 'failed'
      );
    if (hasPending) {
      setShowTranslationPanel(true);
    }
  }
}, [translationStatus, savedItemContext]);

// Option B: Inline fetch (if hook not available)
// Make a direct API call to /api/translations/status after save
```

### Task 4: Integrate TranslationPreviewPanel component
**Effort:** M (30 min - 1 hour)

Add the TranslationPreviewPanel component to the page render with proper props.

**Files:**
- Modify: `/src/app/dashboard2/items/[publicId]/edit/page.tsx`

**Changes:**
```typescript
// At end of component return, before closing </div>
{item && (
  <TranslationPreviewPanel
    entityType="item"
    entityId={item.id}
    sourceLanguage={(item as any).source_language || 'en'}
    sourceContent={{
      name: savedItemContext?.name || name,
      description: savedItemContext?.description || description || undefined,
    }}
    isOpen={showTranslationPanel}
    onClose={handlePanelClose}
  />
)}
```

### Task 5: Implement panel close and navigation handlers
**Effort:** S (15-30 min)

Add handlers for closing the panel, with options to navigate away or continue editing.

**Files:**
- Modify: `/src/app/dashboard2/items/[publicId]/edit/page.tsx`

**Implementation:**
```typescript
/**
 * Handle panel close - navigate to items list if save was successful
 */
const handlePanelClose = useCallback(() => {
  setShowTranslationPanel(false);

  if (savedItemContext) {
    router.push('/dashboard2/items');
  }
}, [savedItemContext, router]);

/**
 * Optional: Continue editing without navigating away
 */
const handleContinueEditing = useCallback(() => {
  setShowTranslationPanel(false);
  setSavedItemContext(null);
  // User can continue making changes
}, []);
```

### Task 6: Handle edge cases and loading states
**Effort:** S (30 min - 1 hour)

Ensure graceful handling when:
- No translation records exist yet for the item
- Translation status is loading
- Translation status fetch fails
- Item was just created (no translations expected)

**Files:**
- Modify: `/src/app/dashboard2/items/[publicId]/edit/page.tsx`

**Implementation:**
```typescript
// Panel handles no translations gracefully
// Add loading indicator if needed during status fetch
{showTranslationPanel && statusLoading && (
  <div className="fixed right-0 top-0 w-[400px] h-full bg-white shadow-lg flex items-center justify-center z-50">
    <Loader2 className="w-8 h-8 animate-spin text-[#FF385C]" />
  </div>
)}
```

### Task 7: Add accessibility improvements
**Effort:** S (15-30 min)

Ensure keyboard navigation works between editor form and panel:
- Focus management when panel opens (focus first interactive element in panel)
- Escape key closes panel
- Screen reader announcements for panel open/close state
- Proper ARIA attributes

**Files:**
- Modify: `/src/app/dashboard2/items/[publicId]/edit/page.tsx`

**Implementation:**
```typescript
// Focus management effect
useEffect(() => {
  if (showTranslationPanel) {
    // Focus will be managed by TranslationPreviewPanel component
    // Announce to screen readers
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    announcement.textContent = 'Translation preview panel opened';
    document.body.appendChild(announcement);
    setTimeout(() => announcement.remove(), 1000);
  }
}, [showTranslationPanel]);

// Escape key handler (if not handled by panel)
useEffect(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && showTranslationPanel) {
      handlePanelClose();
    }
  };
  document.addEventListener('keydown', handleEscape);
  return () => document.removeEventListener('keydown', handleEscape);
}, [showTranslationPanel, handlePanelClose]);
```

### Task 8: Add TypeScript type safety
**Effort:** S (15-30 min)

Ensure proper typing for all new code, particularly for translation status data and component props.

**Files:**
- Modify: `/src/app/dashboard2/items/[publicId]/edit/page.tsx`

**Implementation:**
```typescript
// Add types for saved item context
interface SavedItemContext {
  id: string;
  name: string;
  description: string | null;
  sourceLanguage: string;
}

// Type the state
const [savedItemContext, setSavedItemContext] = useState<SavedItemContext | null>(null);

// Ensure item type includes source_language (from supabase.ts types)
// ItemWithDetails should already have this from REQ-224
```

---

## Authorized Files and Functions for Modification

### Files to Modify

| File Path | Changes | Functions/Sections Affected |
|-----------|---------|----------------------------|
| `/src/app/dashboard2/items/[publicId]/edit/page.tsx` | Primary integration file - add panel state, modify save handler, render panel | `EditItemPage` component, `handleSubmit` function, render return section, imports |

### New Imports Required

| Import | Source |
|--------|--------|
| `TranslationPreviewPanel` | `@/components/TranslationManagement` |
| `useTranslationStatus` | `@/hooks/useTranslationStatus` (if exists) |

### Files for Reference Only (Do Not Modify)

| File Path | Reference Purpose |
|-----------|-------------------|
| `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx` | Panel component API, props interface |
| `/src/app/dashboard2/instructions/[articleId]/edit/page.tsx` | Reference for similar integration pattern (REQ-330) |
| `/src/components/ItemManager/components/ItemPreview/ItemPreviewModal.tsx` | Reference for Radix Dialog overlay pattern |
| `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md` | Full implementation plan context |
| `/docs/REQ-330-integrate-preview-panel-into-article-editor-overview.md` | Sister task reference for consistent approach |

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
| `@radix-ui/react-dialog` | (existing) | Used by TranslationPreviewPanel internally |
| `lucide-react` | (existing) | Icons in panel |

### Epic Dependencies

| Epic/Request | Dependency Type | Notes |
|--------------|-----------------|-------|
| Epic 1 | Required | Translation tables must exist (`item_translations`) |
| Epic 3 | Required | Translation status tracking, translation trigger system |
| REQ-309 | Required | TranslationManagement.types.ts |
| REQ-310 | Required | TranslationPreviewPanel component |
| REQ-314 | Required | useTranslationStatus hook |
| REQ-315 | Recommended | useTranslationRealtime hook for live updates |
| REQ-330 | Reference | Article editor integration (same pattern) |

---

## Database Tables Involved

### item_translations

| Column | Type | Purpose |
|--------|------|---------|
| `item_id` | uuid | FK to items.id, links translation to item |
| `language` | varchar | Target language code (en, fr, es, de, nl, it) |
| `name` | varchar | Translated item name |
| `description` | text | Translated item description |
| `translation_status` | varchar | Status: pending, processing, completed, failed, manual |
| `translated_at` | timestamptz | When translation completed |
| `created_at` | timestamptz | Record creation timestamp |
| `updated_at` | timestamptz | Record update timestamp |

### items (for context)

| Column | Type | Purpose |
|--------|------|---------|
| `id` | uuid | Item UUID, used as entityId for translations |
| `public_id` | varchar | URL-friendly identifier (used in routing) |
| `name` | varchar | Source item name |
| `description` | text | Source item description |
| `source_language` | varchar | Original language of content (default: 'en') |

---

## API Interactions

### GET /api/translations/status

Fetches translation status for the item.

**Query Parameters:**
- `entityType`: 'item'
- `entityId`: item UUID (from `item.id`, not `publicId`)

**Response Structure:**
```typescript
interface TranslationStatusResponse {
  sourceLanguage: SupportedLanguage;
  translations: {
    [key in SupportedLanguage]?: {
      status: 'pending' | 'processing' | 'completed' | 'failed' | 'manual';
      content?: { name?: string; description?: string };
      translatedAt?: string;
      isStale?: boolean;
    };
  };
}
```

---

## Testing Considerations

### Manual Testing Checklist

- [ ] Save item and verify panel appears
- [ ] Panel shows source content (name, description) correctly
- [ ] All 6 languages displayed with appropriate status indicators
- [ ] Panel auto-opens when pending translations exist
- [ ] Panel stays closed when all translations are complete (user can still open manually)
- [ ] Close button dismisses panel and navigates to items list
- [ ] Can continue editing after closing panel (if option provided)
- [ ] Real-time updates when translation status changes
- [ ] Handles missing translation records gracefully (shows "not started" state)
- [ ] Loading states display appropriately during status fetch
- [ ] Error states display with retry option
- [ ] Keyboard navigation: Tab through panel, Escape to close
- [ ] Screen reader announces panel open/close
- [ ] Responsive: tablet and desktop layouts work correctly
- [ ] Panel doesn't break editor layout or overlap form content
- [ ] Verify item.id (UUID) is used for translation queries, not publicId

### Unit Tests (deferred to Phase 7.5/7.6)

- Page component renders with panel when showTranslationPanel is true
- Panel receives correct props (entityType='item', correct entityId)
- Save handler updates panel visibility state
- Auto-open logic triggers on pending status
- Close handler navigates appropriately

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| TranslationPreviewPanel not yet implemented | Medium | High | Feature flag to hide panel until REQ-310 complete |
| useTranslationStatus hook not available | Medium | High | Stub with mock data, implement basic inline fetch |
| User confusion about post-save behavior change | Low | Medium | Clear UI messaging: "Translations in progress" |
| Performance impact from translation status fetch | Low | Low | Lazy load, cache responses |
| publicId vs UUID confusion in API calls | Low | High | Ensure item.id (UUID) is always used for translation queries |
| Panel blocking form on mobile viewports | Medium | Medium | Responsive design, consider full-screen panel on mobile |

---

## Differences from Article Editor Integration (REQ-330)

| Aspect | Article Editor (REQ-330) | Item Editor (REQ-331) |
|--------|--------------------------|----------------------|
| **Primary File** | `/src/app/dashboard2/instructions/[articleId]/edit/page.tsx` | `/src/app/dashboard2/items/[publicId]/edit/page.tsx` |
| **ID Type** | `articleId` (UUID) directly in route | `publicId` (friendly ID) in route, `item.id` (UUID) for API |
| **Editor Component** | Uses `InstructionEditor` wrapper | Inline form in page component |
| **Content Fields** | `title`, `description` | `name`, `description` |
| **Translation Table** | `article_translations` | `item_translations` |
| **Save Method** | `adminApi.updateArticle()` | `adminApi.updateItem()` |
| **Post-Save Redirect** | `/dashboard2/instructions` | `/dashboard2/items` |
| **Entity Type for Panel** | `'article'` | `'item'` |

---

## UX Flow Diagram

```
+---------------------------------------------------------------------+
|                        Item Editor Page                              |
|                                                                      |
|  +---------------------------------------------------------------+  |
|  |                        Edit Form                               |  |
|  |                                                                |  |
|  |   Item Name: [Dishwasher                               ]      |  |
|  |   Description: [Kitchen appliance for washing dishes   ]      |  |
|  |   Room: [Kitchen v]                                           |  |
|  |   Type: [Appliance v]                                         |  |
|  |   Tags: [cleaning] [kitchen] [+]                              |  |
|  |                                                                |  |
|  |                              [Cancel]  [Save Changes]          |  |
|  +---------------------------------------------------------------+  |
|                                                                      |
|                            User clicks "Save Changes"                |
|                                      |                               |
|                                      v                               |
|                        +-------------------------+                   |
|                        |   Save API Success      |                   |
|                        |   Check translations... |                   |
|                        +-----------+-------------+                   |
|                                    |                                 |
|              +---------------------+---------------------+           |
|              |                                           |           |
|              v                                           v           |
|     Has Pending/Failed                        All Complete           |
|              |                                           |           |
|              v                                           v           |
|     Auto-open Panel                        Panel Available           |
|              |                             (User can open)           |
|              |                                           |           |
+--------------|-------------------------------------------|-----------+
               |                                           |
               v                                           |
+----------------------------------------------+          |
|  TranslationPreviewPanel (400px, right)      |          |
|  +----------------------------------------+  |          |
|  | Translations                      [X]  |  |          |
|  +----------------------------------------+  |          |
|  | Source (English):                      |  |          |
|  | Dishwasher                             |  |          |
|  | Kitchen appliance for washing dishes   |  |          |
|  +----------------------------------------+  |          |
|  | [3/5 translations complete] ████████░░ |  |          |
|  |                                        |  |          |
|  | FR Francais  checkmark  Complete  [Edit] [Refresh]  |  |          |
|  | ES Espanol   clock      Processing            |  |          |
|  | DE Deutsch   checkmark  Complete  [Edit] [Refresh]  |  |          |
|  | NL Dutch     checkmark  Complete  [Edit] [Refresh]  |  |          |
|  | IT Italiano  x          Failed    [Retry]     |  |          |
|  +----------------------------------------+  |          |
|  |           [Re-translate All] [Done]    |  |          |
|  +----------------------------------------+  |          |
+----------------------------------------------+          |
               |                                           |
               +----------- User clicks "Done" -----------+
                                   |
                                   v
                   Navigate to /dashboard2/items
```

---

## References

- [Plan-111-L10N-Epic5-Owner-Translation-Management.md](/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md) - Full epic implementation plan
- [REQ-310-create-translationpreviewpanel-component-overview.md](/docs/REQ-310-create-translationpreviewpanel-component-overview.md) - Panel component specification
- [REQ-330-integrate-preview-panel-into-article-editor-overview.md](/docs/REQ-330-integrate-preview-panel-into-article-editor-overview.md) - Sister task (article editor integration)
- [Edit page.tsx](/src/app/dashboard2/items/[publicId]/edit/page.tsx) - Current item edit page
- [gen_requests_epic5.md](/docs/gen_requests_epic5.md) - Original request (REQ-331)
