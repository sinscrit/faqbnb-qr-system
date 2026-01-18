# Implementation Plan: Localization Epic 5 - Owner Translation Management

**Generated:** 2026-01-17 12:00:00 UTC
**Last Modified:** 2026-01-17 12:00:00 UTC
**PRD Reference:** PRD_L10N_Epic5_Owner_Translation_Management.md
**Epic Size:** M (Medium)
**Priority:** P2 - Medium
**Depends On:** Epic 1 (Foundation), Epic 3 (Dynamic Content Translation)

---

## Overview

This implementation plan provides property owners with tools to view, review, and manage translations of their content. Since automated translations may contain errors, owners need the ability to preview translations after saving content, make corrections, trigger re-translations, and track translation status across all content. The UI will integrate seamlessly with the existing dashboard patterns.

**Key Features:**
- Translation preview panel (slide-in from right after save)
- Inline translation editor with side-by-side comparison
- Translation status dashboard widget and filtering
- Bulk translation management (re-translate, retry failed)
- Source language preference setting
- Manual edit preservation with stale indicators

---

## Technical Context

### Existing Stack

| Technology | Details |
|------------|---------|
| **Framework** | Next.js 15.5.9 with App Router |
| **Language** | TypeScript 5.x (strict mode) |
| **Styling** | Tailwind CSS 4.x |
| **State Management** | React Context + useReducer (AuthContext, PropertyContext patterns) |
| **UI Components** | Radix UI primitives (Dialog, Dropdown), Heroicons, Lucide React |
| **Authentication** | Supabase Auth with AuthContext |
| **Backend** | Supabase (PostgreSQL with RLS) |
| **Deployment** | Railway |

### Relevant Existing Patterns

| Pattern | Location | Usage for This Epic |
|---------|----------|---------------------|
| Modal/Drawer | `/src/components/ItemManager/components/ItemPreview/ItemPreviewModal.tsx` | Base pattern for slide-out panel |
| Dialog | `@radix-ui/react-dialog` | Confirmation dialogs, editors |
| API Routes | `/src/app/api/admin/articles/route.ts` | Translation API pattern |
| Dashboard Layout | `/src/app/dashboard2/layout.tsx` | Navigation integration |
| Context Pattern | `/src/contexts/PropertyContext.tsx` | State management pattern |
| Custom Hooks | `/src/hooks/usePropertyContext.ts` | Hook patterns |
| Inline Edit | `/src/components/ItemManager/components/shared/InlineEdit.tsx` | Inline editing pattern |
| Tag Chips | `/src/components/ItemManager/components/shared/TagChip.tsx` | Status indicators |
| Filter Panel | `/src/components/ItemManager/components/dialogs/FilterPanel.tsx` | Filtering UI pattern |

### Dependencies from Epic 1 (Foundation)

| Dependency | Location | Status |
|------------|----------|--------|
| Translation tables | `article_translations`, `item_translations`, `link_translations`, `tag_translations` | Required |
| Translation jobs table | `translation_jobs` | Required |
| Translation service | `/src/lib/translation-service/` | Required |
| Job queue | `/src/lib/job-queue/` | Required |
| Language preference columns | `accounts.preferred_language`, `users.preferred_language` | Required |
| Source language columns | `items.source_language`, `item_articles.source_language`, `item_links.source_language` | Required |
| i18n framework | `next-intl` | Required for UI strings |

### Dependencies from Epic 3 (Dynamic Content Translation)

| Dependency | Purpose |
|------------|---------|
| Translation trigger system | Re-translation jobs queued here |
| Translation status tracking | FR-6 status API |
| Manual translation override API | `PUT /api/translations/{entityType}/{entityId}/{language}` |

### New Dependencies Required

| Library | Purpose | Size Impact | Alternative Considered |
|---------|---------|-------------|------------------------|
| None | All UI built with existing Radix + Tailwind | N/A | N/A |

**Note:** This epic uses existing dependencies. No new npm packages required.

---

## Architecture

### Component Structure

```
/src/components/TranslationManagement/
├── index.ts                              # Public exports
├── TranslationManagement.types.ts        # Shared types
│
├── TranslationPreviewPanel/
│   ├── index.ts                          # Panel exports
│   ├── TranslationPreviewPanel.tsx       # Main slide-out panel
│   ├── TranslationPreviewPanel.types.ts  # Panel types
│   ├── TranslationStatusItem.tsx         # Single language status row
│   └── TranslationProgressBar.tsx        # Overall progress indicator
│
├── TranslationEditor/
│   ├── index.ts                          # Editor exports
│   ├── TranslationEditor.tsx             # Side-by-side edit modal
│   ├── TranslationEditor.types.ts        # Editor types
│   └── TranslationDiffView.tsx           # Original vs translated comparison
│
├── TranslationStatusWidget/
│   ├── index.ts                          # Widget exports
│   ├── TranslationStatusWidget.tsx       # Dashboard summary widget
│   └── TranslationStatusWidget.types.ts  # Widget types
│
├── TranslationStatusColumn/
│   ├── index.ts                          # Column exports
│   └── TranslationStatusColumn.tsx       # Table column component
│
├── TranslationStatusFilter/
│   ├── index.ts                          # Filter exports
│   └── TranslationStatusFilter.tsx       # Status filter dropdown
│
├── BulkTranslationBar/
│   ├── index.ts                          # Bar exports
│   ├── BulkTranslationBar.tsx            # Bulk action bar
│   └── LanguageSelectorDialog.tsx        # Language picker for bulk ops
│
├── ManualEditWarning/
│   ├── index.ts                          # Warning exports
│   └── ManualEditWarningDialog.tsx       # Source update warning dialog
│
└── LanguagePreference/
    ├── index.ts                          # Preference exports
    └── LanguagePreferenceSection.tsx     # Account settings section

/src/app/dashboard2/translations/
└── page.tsx                              # Translation management page

/src/app/api/translations/
├── status/
│   └── route.ts                          # GET translation status (summary + items)
├── [entityType]/
│   └── [entityId]/
│       └── [language]/
│           └── route.ts                  # PUT update translation
└── retranslate/
    └── route.ts                          # POST trigger re-translation

/src/hooks/
├── useTranslationStatus.ts               # Fetch translation status
├── useTranslationPreview.ts              # Preview panel state
└── useTranslationRealtime.ts             # Supabase realtime subscription
```

### Database Schema Additions

**No new tables required.** This epic uses tables created in Epic 1.

#### Schema Reference (from Epic 1)

```sql
-- Translation status enum values
-- 'pending', 'processing', 'completed', 'failed', 'manual'

-- Key columns for this epic:
-- article_translations.translation_status
-- article_translations.reviewed_by
-- article_translations.translated_at

-- item_translations.translation_status
-- item_translations.translated_at

-- link_translations.translation_status
-- link_translations.translated_at
```

#### New Column Addition (Epic 5 specific)

```sql
-- Track source version for stale detection
ALTER TABLE article_translations ADD COLUMN IF NOT EXISTS source_version_at TIMESTAMPTZ;
ALTER TABLE item_translations ADD COLUMN IF NOT EXISTS source_version_at TIMESTAMPTZ;
ALTER TABLE link_translations ADD COLUMN IF NOT EXISTS source_version_at TIMESTAMPTZ;

-- Index for efficient status queries
CREATE INDEX IF NOT EXISTS idx_article_translations_status
  ON article_translations(translation_status);
CREATE INDEX IF NOT EXISTS idx_item_translations_status
  ON item_translations(translation_status);
CREATE INDEX IF NOT EXISTS idx_link_translations_status
  ON link_translations(translation_status);
```

### State Management

```typescript
// Translation preview state (component-local with hook)
interface TranslationPreviewState {
  isOpen: boolean;
  entityType: EntityType | null;
  entityId: string | null;
  sourceContent: { title?: string; description?: string; name?: string } | null;
  sourceLanguage: SupportedLanguage;
  translations: TranslationStatusMap;
  isLoading: boolean;
  error: string | null;
}

// Translation status map
type TranslationStatusMap = Record<SupportedLanguage, TranslationStatus>;

interface TranslationStatus {
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'manual';
  content?: { title?: string; description?: string; name?: string };
  translatedAt?: string;
  isStale?: boolean;
  reviewedBy?: string;
}
```

### Data Flow

```
Content Save (Item/Article/Link)
    │
    ▼
Show Translation Preview Panel
    │
    ├── Fetch current translations (GET /api/translations/status)
    │
    ├── Subscribe to realtime updates (Supabase channel)
    │
    └── Update UI as translations complete
         │
         ├── User clicks "Edit" on translation
         │   └── Open TranslationEditor modal
         │       └── Save (PUT /api/translations/{type}/{id}/{lang})
         │
         ├── User clicks "Re-translate"
         │   └── POST /api/translations/retranslate
         │       └── New jobs queued
         │
         └── User clicks "Close"
             └── Panel closes
```

---

## Integration Contract

### Translation Status API Interface

```typescript
// GET /api/translations/status
// Query params: entityType?, entityId?, status?, propertyId?

interface TranslationStatusResponse {
  summary: {
    total: number;
    complete: number;
    partial: number;
    pending: number;
    failed: number;
  };
  items: TranslationStatusItem[];
}

interface TranslationStatusItem {
  entityType: 'article' | 'item' | 'link';
  entityId: string;
  name: string;
  sourceLanguage: SupportedLanguage;
  translations: {
    [K in SupportedLanguage]?: {
      status: 'pending' | 'processing' | 'completed' | 'failed' | 'manual';
      isStale?: boolean;
      translatedAt?: string;
      reviewedBy?: string;
    };
  };
}
```

### Update Translation API Interface

```typescript
// PUT /api/translations/{entityType}/{entityId}/{language}

interface UpdateTranslationRequest {
  title?: string;
  description?: string;
  name?: string;
}

interface UpdateTranslationResponse {
  success: boolean;
  translation: {
    language: SupportedLanguage;
    status: 'manual';
    reviewedBy: string;
    updatedAt: string;
  };
}
```

### Re-translate API Interface

```typescript
// POST /api/translations/retranslate

interface RetranslateRequest {
  entities: { type: 'article' | 'item' | 'link'; id: string }[];
  languages?: SupportedLanguage[]; // All if omitted
  overwriteManual?: boolean;
}

interface RetranslateResponse {
  success: boolean;
  jobsQueued: number;
  skipped: number;
  skippedReason?: string;
}
```

### Translation Preview Panel Props

```typescript
interface TranslationPreviewPanelProps {
  /** Entity type being previewed */
  entityType: 'article' | 'item' | 'link';
  /** Entity ID */
  entityId: string;
  /** Source language of the content */
  sourceLanguage: SupportedLanguage;
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
  onTranslationEdited?: (language: SupportedLanguage) => void;
}
```

### Translation Editor Props

```typescript
interface TranslationEditorProps {
  /** Translation to edit */
  translation: {
    language: SupportedLanguage;
    content: { title?: string; description?: string; name?: string };
    status: string;
  };
  /** Source content for comparison */
  sourceContent: {
    title?: string;
    description?: string;
    name?: string;
  };
  /** Source language */
  sourceLanguage: SupportedLanguage;
  /** Whether editor is open */
  isOpen: boolean;
  /** Save handler */
  onSave: (updated: { title?: string; description?: string; name?: string }) => Promise<void>;
  /** Cancel handler */
  onCancel: () => void;
}
```

### Usage Examples

```tsx
// After saving an article, show translation preview
const handleArticleSave = async (article: ArticleData) => {
  const result = await saveArticle(article);
  if (result.success) {
    setPreviewState({
      isOpen: true,
      entityType: 'article',
      entityId: result.data.id,
      sourceLanguage: article.sourceLanguage || 'en',
      sourceContent: {
        title: article.title,
        description: article.description
      }
    });
  }
};

// In the save form component
<TranslationPreviewPanel
  entityType={previewState.entityType}
  entityId={previewState.entityId}
  sourceLanguage={previewState.sourceLanguage}
  sourceContent={previewState.sourceContent}
  isOpen={previewState.isOpen}
  onClose={() => setPreviewState({ ...previewState, isOpen: false })}
/>

// Dashboard translation status widget
<TranslationStatusWidget
  propertyId={selectedPropertyId}
  onViewDetails={() => router.push('/dashboard2/translations')}
/>

// Item list with translation status column
<ItemListTable
  items={items}
  columns={['name', 'createdAt', 'translationStatus']}
  onTranslationStatusClick={(item) => openTranslationPreview(item)}
/>
```

---

## Implementation Approach

### Phase 1: API Endpoints (2-3 days)

- [ ] **Task 1.1:** Create translation status API endpoint
  - File: `/src/app/api/translations/status/route.ts`
  - GET with filters: entityType, entityId, status, propertyId
  - Returns summary counts and item-level status
  - Include account access validation

- [ ] **Task 1.2:** Create update translation API endpoint
  - File: `/src/app/api/translations/[entityType]/[entityId]/[language]/route.ts`
  - PUT to update translation content
  - Set status to 'manual', record reviewedBy
  - Validate user has access to entity

- [ ] **Task 1.3:** Create re-translate API endpoint
  - File: `/src/app/api/translations/retranslate/route.ts`
  - POST to queue re-translation jobs
  - Support bulk entities
  - Option to skip/overwrite manual edits
  - Return job count and skipped count

- [ ] **Task 1.4:** Add source_version_at columns via migration
  - File: Apply via Supabase MCP
  - Add columns to track source content version
  - Create indexes for status queries

- [ ] **Task 1.5:** Update TypeScript database types
  - File: `/src/lib/supabase.ts`
  - Add translation table types (if not already from Epic 1)
  - Add new column types

### Phase 2: Core UI Components (3-4 days)

- [ ] **Task 2.1:** Create TranslationManagement types file
  - File: `/src/components/TranslationManagement/TranslationManagement.types.ts`
  - All shared interfaces and types

- [ ] **Task 2.2:** Create TranslationPreviewPanel component
  - File: `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx`
  - Slide-in panel from right (400px width)
  - Shows source content at top
  - Lists all 6 languages with status
  - Action buttons: Edit, Re-translate, Retry

- [ ] **Task 2.3:** Create TranslationStatusItem component
  - File: `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx`
  - Single row showing: flag, language name, status icon, preview text
  - Action buttons per row
  - Status colors per spec (green=complete, orange=pending, red=failed, purple=manual)

- [ ] **Task 2.4:** Create TranslationProgressBar component
  - File: `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationProgressBar.tsx`
  - Visual progress indicator (e.g., "3/5 translations complete")
  - Animated during processing

- [ ] **Task 2.5:** Create TranslationEditor component
  - File: `/src/components/TranslationManagement/TranslationEditor/TranslationEditor.tsx`
  - Modal dialog (Radix Dialog)
  - Side-by-side view: Original | Translation
  - Textarea for editing
  - Character count (with warning if applicable)
  - Save/Cancel buttons
  - Dirty state tracking

- [ ] **Task 2.6:** Create useTranslationStatus hook
  - File: `/src/hooks/useTranslationStatus.ts`
  - Fetch translation status from API
  - Support single entity or property-wide
  - Return loading, error, data states

- [ ] **Task 2.7:** Create useTranslationRealtime hook
  - File: `/src/hooks/useTranslationRealtime.ts`
  - Supabase realtime subscription for translation updates
  - Auto-update UI when translations complete
  - Cleanup on unmount

### Phase 3: Dashboard Integration (2-3 days)

- [ ] **Task 3.1:** Create TranslationStatusWidget component
  - File: `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.tsx`
  - Summary card for dashboard
  - Progress bar with percentage
  - Counts by status (complete, partial, pending, failed)
  - "View Details" link

- [ ] **Task 3.2:** Create TranslationStatusColumn component
  - File: `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.tsx`
  - Compact status indicator for table columns
  - Shows 6 dots/icons for each language
  - Clickable to open preview panel

- [ ] **Task 3.3:** Create TranslationStatusFilter component
  - File: `/src/components/TranslationManagement/TranslationStatusFilter/TranslationStatusFilter.tsx`
  - Dropdown filter for item lists
  - Options: All, Fully Translated, Partially Translated, Pending, Failed, Manually Edited

- [ ] **Task 3.4:** Integrate status widget into dashboard
  - File: `/src/app/dashboard2/page.tsx` (modify)
  - Add TranslationStatusWidget to dashboard layout
  - Fetch status summary on load

- [ ] **Task 3.5:** Add translation status column to Items list
  - File: `/src/components/ItemManager/components/ItemGrid.tsx` (modify)
  - Add optional translation status column
  - Integrate click handler for preview

### Phase 4: Bulk Operations & Management Page (2-3 days)

- [ ] **Task 4.1:** Create BulkTranslationBar component
  - File: `/src/components/TranslationManagement/BulkTranslationBar/BulkTranslationBar.tsx`
  - Appears when items selected
  - Actions: Re-translate All, Re-translate Specific Language
  - Progress indicator during bulk operations

- [ ] **Task 4.2:** Create LanguageSelectorDialog component
  - File: `/src/components/TranslationManagement/BulkTranslationBar/LanguageSelectorDialog.tsx`
  - Modal for selecting languages for bulk re-translate
  - Checkbox list of languages
  - Select All / Deselect All

- [ ] **Task 4.3:** Create Translation Management page
  - File: `/src/app/dashboard2/translations/page.tsx`
  - Full-width table showing all content
  - Columns: Item/Article name, language status columns, Actions
  - Filter bar: Type, Language, Status
  - Bulk selection support

- [ ] **Task 4.4:** Add translations link to navigation
  - File: `/src/app/dashboard2/layout.tsx` (modify)
  - Add "Translations" nav item (or sub-nav under settings)
  - Icon: Languages or Globe

### Phase 5: Manual Edit Preservation (1-2 days)

- [ ] **Task 5.1:** Create ManualEditWarningDialog component
  - File: `/src/components/TranslationManagement/ManualEditWarning/ManualEditWarningDialog.tsx`
  - Shown when source content updated and manual translations exist
  - Options: Keep manual edits, Re-translate all (with warning)
  - List affected languages

- [ ] **Task 5.2:** Implement stale translation indicator
  - Update TranslationStatusItem to show stale warning icon
  - Yellow border/indicator for stale manual edits
  - "Update Translation" action button

- [ ] **Task 5.3:** Integrate warning into content save flow
  - Hook into article/item save handlers
  - Check for manual translations before save
  - Show warning dialog if detected

### Phase 6: Language Preference Setting (1 day)

- [ ] **Task 6.1:** Create LanguagePreferenceSection component
  - File: `/src/components/TranslationManagement/LanguagePreference/LanguagePreferenceSection.tsx`
  - Language dropdown selector
  - Save button with loading state
  - Help text explaining the setting

- [ ] **Task 6.2:** Create account preference API endpoint
  - File: `/src/app/api/accounts/[accountId]/preferences/route.ts`
  - PUT endpoint to update preferredLanguage
  - Validate account access

- [ ] **Task 6.3:** Integrate into account settings (or profile)
  - Determine location (account settings vs user profile)
  - Add LanguagePreferenceSection component
  - Pre-populate with current preference

### Phase 7: Integration & Polish (2-3 days)

- [ ] **Task 7.1:** Integrate preview panel into article editor
  - File: `/src/app/dashboard2/instructions/[articleId]/edit/page.tsx` (modify)
  - Show panel after save
  - Auto-open if translations are pending

- [ ] **Task 7.2:** Integrate preview panel into item editor
  - File: `/src/app/dashboard2/items/[publicId]/edit/page.tsx` (modify)
  - Same pattern as article editor

- [ ] **Task 7.3:** Add loading states and error handling
  - All components: proper loading spinners
  - Error toasts/messages for API failures
  - Retry buttons for failed operations

- [ ] **Task 7.4:** Add accessibility features
  - ARIA labels for status icons
  - Keyboard navigation in preview panel
  - Screen reader announcements for status changes
  - Focus management in modals

- [ ] **Task 7.5:** Write unit tests for hooks
  - Test useTranslationStatus
  - Test useTranslationRealtime
  - Mock Supabase responses

- [ ] **Task 7.6:** Write component tests
  - Test TranslationPreviewPanel rendering
  - Test TranslationEditor save flow
  - Test TranslationStatusWidget counts

---

## Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Panel Type | Slide-in from right | Matches existing preview patterns, non-blocking UX |
| Panel Width | 400px | Sufficient for content, matches PRD spec |
| Editor Type | Modal dialog | Focused editing experience, prevents accidental navigation |
| Realtime Updates | Supabase Realtime | Already in stack, real-time translation status updates |
| Status Icons | Unicode/Emoji + colors | Simple, recognizable, matches PRD visual spec |
| Bulk Operations | Selection-based | Consistent with existing ItemManager patterns |
| Stale Detection | source_version_at timestamp | Simple comparison, no content hashing needed |

---

## File Changes Summary

### New Files

| File Path | Purpose |
|-----------|---------|
| `/src/components/TranslationManagement/index.ts` | Public exports |
| `/src/components/TranslationManagement/TranslationManagement.types.ts` | Shared types |
| `/src/components/TranslationManagement/TranslationPreviewPanel/index.ts` | Panel exports |
| `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx` | Main panel |
| `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.types.ts` | Panel types |
| `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx` | Status row |
| `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationProgressBar.tsx` | Progress bar |
| `/src/components/TranslationManagement/TranslationEditor/index.ts` | Editor exports |
| `/src/components/TranslationManagement/TranslationEditor/TranslationEditor.tsx` | Edit modal |
| `/src/components/TranslationManagement/TranslationEditor/TranslationEditor.types.ts` | Editor types |
| `/src/components/TranslationManagement/TranslationEditor/TranslationDiffView.tsx` | Diff view |
| `/src/components/TranslationManagement/TranslationStatusWidget/index.ts` | Widget exports |
| `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.tsx` | Dashboard widget |
| `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.types.ts` | Widget types |
| `/src/components/TranslationManagement/TranslationStatusColumn/index.ts` | Column exports |
| `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.tsx` | Table column |
| `/src/components/TranslationManagement/TranslationStatusFilter/index.ts` | Filter exports |
| `/src/components/TranslationManagement/TranslationStatusFilter/TranslationStatusFilter.tsx` | Status filter |
| `/src/components/TranslationManagement/BulkTranslationBar/index.ts` | Bar exports |
| `/src/components/TranslationManagement/BulkTranslationBar/BulkTranslationBar.tsx` | Bulk action bar |
| `/src/components/TranslationManagement/BulkTranslationBar/LanguageSelectorDialog.tsx` | Language picker |
| `/src/components/TranslationManagement/ManualEditWarning/index.ts` | Warning exports |
| `/src/components/TranslationManagement/ManualEditWarning/ManualEditWarningDialog.tsx` | Warning dialog |
| `/src/components/TranslationManagement/LanguagePreference/index.ts` | Preference exports |
| `/src/components/TranslationManagement/LanguagePreference/LanguagePreferenceSection.tsx` | Settings section |
| `/src/app/dashboard2/translations/page.tsx` | Management page |
| `/src/app/api/translations/status/route.ts` | Status API |
| `/src/app/api/translations/[entityType]/[entityId]/[language]/route.ts` | Update API |
| `/src/app/api/translations/retranslate/route.ts` | Re-translate API |
| `/src/app/api/accounts/[accountId]/preferences/route.ts` | Preferences API |
| `/src/hooks/useTranslationStatus.ts` | Status hook |
| `/src/hooks/useTranslationPreview.ts` | Preview state hook |
| `/src/hooks/useTranslationRealtime.ts` | Realtime hook |

### Modified Files

| File Path | Changes |
|-----------|---------|
| `/src/lib/supabase.ts` | Add translation table types (if not from Epic 1) |
| `/src/types/index.ts` | Export new translation types |
| `/src/app/dashboard2/layout.tsx` | Add Translations nav item |
| `/src/app/dashboard2/page.tsx` | Add TranslationStatusWidget |
| `/src/app/dashboard2/instructions/[articleId]/edit/page.tsx` | Integrate preview panel |
| `/src/app/dashboard2/items/[publicId]/edit/page.tsx` | Integrate preview panel |
| `/src/components/ItemManager/components/ItemGrid.tsx` | Add translation status column |

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Realtime subscription reliability | Medium | Low | Fallback to polling, manual refresh button |
| Performance with many translations | Low | Medium | Pagination, lazy loading, efficient queries |
| Manual edits accidentally overwritten | Medium | High | Confirmation dialogs, clear warnings, audit trail |
| Status inconsistency | Low | Medium | Optimistic updates, reconciliation on subscription |
| Mobile UX complexity | Medium | Medium | Responsive design, simplified mobile view |
| Epic 1/3 not complete | High | High | Stub APIs, feature flag to hide until ready |

---

## Effort Estimate

| Phase | Estimate | Confidence |
|-------|----------|------------|
| Phase 1: API Endpoints | 2-3 days | High |
| Phase 2: Core UI Components | 3-4 days | Medium |
| Phase 3: Dashboard Integration | 2-3 days | High |
| Phase 4: Bulk Operations & Management Page | 2-3 days | Medium |
| Phase 5: Manual Edit Preservation | 1-2 days | High |
| Phase 6: Language Preference Setting | 1 day | High |
| Phase 7: Integration & Polish | 2-3 days | Medium |
| **Total** | **13-19 days** | Medium |

**Notes:**
- Estimates assume Epic 1 and Epic 3 are complete
- Single developer estimate
- Phases 2-3 can partially overlap
- Buffer included for edge cases and testing

---

## Environment Variables Required

No new environment variables required. Uses existing:

```bash
# From Epic 1 (already configured)
TRANSLATION_PROVIDER=claude
ANTHROPIC_API_KEY=sk-ant-xxx
```

---

## Open Questions

1. **Navigation Placement:** Should "Translations" be a top-level nav item or under a "Settings" submenu?
   - *Recommendation:* Start as top-level for visibility, move later if nav gets crowded

2. **Stale Threshold:** How long after source update should a manual translation be marked stale?
   - *Recommendation:* Immediately (timestamp comparison), let user decide to update

3. **Bulk Operation Limits:** Should there be a limit on bulk re-translate operations?
   - *Recommendation:* Soft limit of 100 items, warning message for larger batches

4. **Audit Trail:** Should we implement the optional `translation_edit_history` table?
   - *Recommendation:* Defer to future iteration, track in reviewed_by for now

---

## Acceptance Criteria Mapping

| PRD Criteria | Implementation Task |
|--------------|---------------------|
| AC-1: Preview panel shows after save | Tasks 2.2, 7.1, 7.2 |
| AC-1: Real-time status updates | Task 2.7 |
| AC-1: All languages visible | Task 2.3 |
| AC-1: Source content displayed | Task 2.2 |
| AC-2: Can edit any translation inline | Tasks 2.5, 2.2 |
| AC-2: Changes save immediately | Task 2.5, 1.2 |
| AC-2: Manual status tracked | Task 1.2 |
| AC-2: Edit preserved across sessions | Task 1.2 |
| AC-3: Summary widget on dashboard | Tasks 3.1, 3.4 |
| AC-3: Status column in item lists | Tasks 3.2, 3.5 |
| AC-3: Filtering by status | Tasks 3.3, 4.3 |
| AC-3: Bulk selection and actions | Tasks 4.1, 4.3 |
| AC-4: Re-translate single language | Task 2.2 (action button) |
| AC-4: Re-translate all languages | Task 2.2 (action button) |
| AC-4: Warning for manual edit overwrite | Task 1.3, 2.2 |
| AC-4: Progress visible | Tasks 2.4, 2.7 |
| AC-5: Account preference setting | Tasks 6.1, 6.2, 6.3 |
| AC-5: Content defaults to preference | Task 6.3 (integration) |
| AC-5: Can override per-content | Form field (existing) |
| AC-5: Preference persists | Task 6.2 |
| AC-6: Warning when source updated | Tasks 5.1, 5.3 |
| AC-6: Option to keep or overwrite | Task 5.1 |
| AC-6: Stale indicator shows | Task 5.2 |
| AC-6: Can update stale translations | Task 5.2 |

---

## References

- PRD: `/docs/prd/PRD_L10N_Epic5_Owner_Translation_Management.md`
- Epic 1 PRD: `/docs/prd/PRD_L10N_Epic1_Foundation.md`
- Epic 1 Plan: `/docs/prd/Plan-110-L10N-Epic1-Foundation.md`
- Epic 3 PRD: `/docs/prd/PRD_L10N_Epic3_Dynamic_Content_Translation.md`
- [Radix UI Dialog](https://www.radix-ui.com/primitives/docs/components/dialog)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)

---

## UI Visual Specifications

### Status Icons Reference (from PRD)

| Status | Icon | Color | Tailwind Class |
|--------|------|-------|----------------|
| Original | `●` | Blue | `text-blue-500` |
| Completed | `✓` | Green | `text-green-500` (#22C55E) |
| Manual | `✎` | Purple | `text-violet-500` (#8B5CF6) |
| Pending | `⏳` | Orange | `text-amber-500` (#F59E0B) |
| Failed | `❌` | Red | `text-red-500` (#EF4444) |
| Stale | `⚠️` | Yellow | `text-yellow-500` (#EAB308) |

### Panel Layout Reference (from PRD)

```
┌─────────────────────────────────────────────────────────────────┐
│ Translations                                              [X]   │
├─────────────────────────────────────────────────────────────────┤
│ Source (English):                                               │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ How to Use the Dishwasher                                   │ │
│ │ Load dishes on the lower and upper racks...                 │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ Translations:    [3/5 Complete] ████████░░                     │
│                                                                 │
│ FR Francais ✓ Completed                          [Edit] [↻]    │
│    Comment utiliser le lave-vaisselle                          │
│                                                                 │
│ ES Espanol ✓ Completed                           [Edit] [↻]    │
│    Como usar el lavavajillas                                   │
│                                                                 │
│ DE Deutsch ⏳ In Progress                                       │
│    Translating...                                              │
│                                                                 │
│ NL Nederlands ✓ Completed                        [Edit] [↻]    │
│    Hoe de vaatwasser te gebruiken                              │
│                                                                 │
│ IT Italiano ❌ Failed                            [Retry]        │
│    Translation failed. Click to retry.                         │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                               [Re-translate All] [Close]        │
└─────────────────────────────────────────────────────────────────┘
```

---

*Plan generated for FAQBNB Localization Epic 5 - Owner Translation Management*
