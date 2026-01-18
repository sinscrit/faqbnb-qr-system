# PRD: Localization Epic 5 - Owner Translation Management

**Document ID:** PRD_L10N_Epic5
**Created:** 2026-01-17
**Last Modified:** 2026-01-17
**Status:** Draft
**Epic Size:** M (Medium)
**Priority:** P2 - Medium
**Depends On:** Epic 1 (Foundation), Epic 3 (Dynamic Content Translation)

---

## 1. Executive Summary

This epic provides property owners with tools to view, review, and manage translations of their content. Since automated translations may contain errors, owners need the ability to preview translations, make corrections, and ensure guests receive accurate information in all languages.

### Key Capabilities
- Preview auto-generated translations after saving content
- Edit and correct translations manually
- Track translation status across all content
- Trigger re-translation when needed
- Set preferred source language for content creation

---

## 2. Goals & Objectives

### Primary Goals
1. Enable owners to preview translations immediately after content creation
2. Allow manual editing of any translation
3. Provide visibility into translation status (pending, completed, failed)
4. Support bulk translation management
5. Preserve manual edits when source content changes

### Success Criteria
- Owners can view all translations within 60 seconds of save
- Manual translation edits are saved and persist
- Clear status indicators for all content
- Easy workflow for correcting translation errors
- Bulk operations for efficiency

---

## 3. User Stories

### US-1: Preview Translations After Save
**As a** property owner,
**I want** to see translations of my content immediately after saving,
**So that** I can verify the translations are accurate before guests see them.

**Acceptance Criteria:**
- Translation preview panel appears after save
- Shows translation progress (5/5 complete, or 3/5 in progress)
- Each language translation is viewable
- Can compare translation with original

### US-2: Edit Translation Manually
**As a** property owner,
**I want** to correct a translation that seems wrong,
**So that** guests get accurate information in that language.

**Acceptance Criteria:**
- Each translation has an "Edit" action
- Inline editing of translated text
- Changes saved immediately
- Translation marked as "manually edited"
- Manual edits preserved on source update (with warning)

### US-3: View Translation Status
**As a** property owner,
**I want** to see which of my content has been translated,
**So that** I know what guests will see in each language.

**Acceptance Criteria:**
- Dashboard shows translation status summary
- Items list shows translation status per item
- Filtering by translation status
- Clear visual indicators (complete, partial, pending, failed)

### US-4: Re-translate Content
**As a** property owner,
**I want** to trigger a new translation,
**So that** I can get a fresh translation if the original was poor quality.

**Acceptance Criteria:**
- "Re-translate" action available per language
- Can re-translate all languages at once
- Warns if overwriting manual edits
- Shows progress during re-translation

### US-5: Set Source Language
**As a** property owner who writes in French,
**I want** to set my preferred content language,
**So that** I don't have to select it each time I create content.

**Acceptance Criteria:**
- Account-level language preference setting
- Content creation defaults to this language
- Can override per-item if needed
- Saved in user/account settings

---

## 4. Functional Requirements

### 4.1 Translation Preview Panel

#### FR-1.1: Post-Save Preview
After content is saved, show translation preview:
```tsx
<TranslationPreviewPanel
  entityType="article"
  entityId="abc-123"
  sourceLanguage="en"
  onClose={() => setShowPreview(false)}
/>
```

#### FR-1.2: Panel Layout
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
│ Translations:                                                   │
│                                                                 │
│ 🇫🇷 Francais ✓ Completed                          [Edit] [↻]  │
│    Comment utiliser le lave-vaisselle                           │
│    Chargez la vaisselle sur les paniers...                     │
│                                                                 │
│ 🇪🇸 Espanol ✓ Completed                           [Edit] [↻]  │
│    Como usar el lavavajillas                                    │
│    Cargue los platos en las bandejas...                        │
│                                                                 │
│ 🇩🇪 Deutsch ⏳ In Progress                                     │
│    Translating...                                               │
│                                                                 │
│ 🇳🇱 Nederlands ✓ Completed                        [Edit] [↻]  │
│    Hoe de vaatwasser te gebruiken                              │
│                                                                 │
│ 🇮🇹 Italiano ❌ Failed                            [Retry]      │
│    Translation failed. Click to retry.                         │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                               [Re-translate All] [Close]        │
└─────────────────────────────────────────────────────────────────┘
```

#### FR-1.3: Real-time Status Updates
Use Supabase Realtime or polling to update translation status:
```typescript
// Subscribe to translation status changes
useEffect(() => {
  const subscription = supabase
    .channel(`translations:${entityId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'article_translations',
      filter: `article_id=eq.${entityId}`
    }, handleTranslationUpdate)
    .subscribe();

  return () => subscription.unsubscribe();
}, [entityId]);
```

### 4.2 Translation Editor

#### FR-2.1: Inline Editing
Edit translations directly in the preview panel:
```tsx
<TranslationEditor
  translation={translation}
  onSave={(updated) => saveTranslation(updated)}
  onCancel={() => setEditing(false)}
/>
```

#### FR-2.2: Editor Features
- Side-by-side view: Original | Translation
- Character count (with limit warning if applicable)
- Save/Cancel buttons
- Dirty state indicator

#### FR-2.3: Save Manual Edit
```typescript
async function saveManualTranslation(
  entityType: string,
  entityId: string,
  language: string,
  translation: TranslationContent
): Promise<void> {
  await supabase
    .from(`${entityType}_translations`)
    .upsert({
      [`${entityType}_id`]: entityId,
      language,
      ...translation,
      translation_status: 'manual',
      reviewed_by: currentUserId,
      updated_at: new Date()
    });
}
```

#### FR-2.4: Edit History (Optional)
Track manual edits for audit:
```sql
-- Could be stored in a separate audit table
CREATE TABLE translation_edit_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(50),
  entity_id UUID,
  language VARCHAR(5),
  previous_value JSONB,
  new_value JSONB,
  edited_by UUID REFERENCES users(id),
  edited_at TIMESTAMPTZ DEFAULT now()
);
```

### 4.3 Translation Status Dashboard

#### FR-3.1: Status Summary Widget
Show on main dashboard:
```tsx
<TranslationStatusWidget
  totalItems={100}
  fullyTranslated={80}
  partiallyTranslated={15}
  pendingTranslation={3}
  failedTranslation={2}
/>

// Renders:
// ┌────────────────────────────────────────┐
// │ Translation Status                     │
// │                                        │
// │ ████████████████████░░░ 80% Complete  │
// │                                        │
// │ ✓ 80 Fully translated                 │
// │ ◐ 15 Partially translated             │
// │ ⏳ 3 Pending                           │
// │ ❌ 2 Failed                            │
// │                                        │
// │ [View Details]                         │
// └────────────────────────────────────────┘
```

#### FR-3.2: Item List Translation Status
Add translation status column to item lists:
```tsx
<ItemListTable
  items={items}
  columns={[
    'name',
    'createdAt',
    'translationStatus' // New column
  ]}
/>

// Translation status cell shows:
// ✓✓✓✓✓ (all 5 languages complete)
// ✓✓✓○○ (3 complete, 2 missing)
// ⏳ (translations in progress)
// ❌ (one or more failed)
```

#### FR-3.3: Filtering by Translation Status
Add filter to item list:
```tsx
<TranslationStatusFilter
  value={filter}
  onChange={setFilter}
  options={[
    { value: 'all', label: 'All' },
    { value: 'complete', label: 'Fully Translated' },
    { value: 'partial', label: 'Partially Translated' },
    { value: 'pending', label: 'Pending' },
    { value: 'failed', label: 'Failed' },
    { value: 'manual', label: 'Manually Edited' }
  ]}
/>
```

### 4.4 Bulk Translation Management

#### FR-4.1: Bulk Re-translate
Select multiple items and re-translate:
```tsx
<BulkActionBar
  selectedCount={selectedItems.length}
  actions={[
    {
      label: 'Re-translate All Languages',
      icon: RefreshIcon,
      onClick: () => bulkRetranslate(selectedItems, 'all')
    },
    {
      label: 'Re-translate Specific Language',
      icon: LanguageIcon,
      onClick: () => showLanguageSelector()
    }
  ]}
/>
```

#### FR-4.2: Bulk Status View
Translation status page showing all content:
```
Route: /dashboard2/translations

┌─────────────────────────────────────────────────────────────────┐
│ Translation Management                                          │
├─────────────────────────────────────────────────────────────────┤
│ [Filter: All ▼] [Language: All ▼] [Status: All ▼]             │
├─────────────────────────────────────────────────────────────────┤
│ Item/Article          │ EN │ FR │ ES │ DE │ NL │ IT │ Actions  │
├───────────────────────┼────┼────┼────┼────┼────┼────┼──────────┤
│ Samsung Washer        │ ● │ ✓ │ ✓ │ ✓ │ ✓ │ ✓ │ [View]    │
│  └─ How to Use        │ ● │ ✓ │ ✓ │ ✓ │ ⏳│ ✓ │ [View]    │
│  └─ Troubleshooting   │ ● │ ✓ │ ✓ │ ❌│ ✓ │ ✓ │ [Retry]   │
│ Nest Thermostat       │ ● │ ✓ │ ✓ │ ✓ │ ✓ │ ✓ │ [View]    │
│  └─ Setup Guide       │ ● │ ✓ │ ✓ │ ✓ │ ✓ │ ✓ │ [View]    │
└─────────────────────────────────────────────────────────────────┘

Legend: ● Original │ ✓ Translated │ ⏳ Pending │ ❌ Failed │ ✎ Manual
```

### 4.5 Source Language Preference

#### FR-5.1: Account Setting
Add to account settings page:
```tsx
<LanguagePreferenceSection>
  <h3>Content Language</h3>
  <p>New content will default to this language.</p>
  <LanguageSelector
    value={account.preferredLanguage}
    onChange={(lang) => updateAccountLanguage(lang)}
    languages={SUPPORTED_LANGUAGES}
  />
</LanguagePreferenceSection>
```

#### FR-5.2: Per-Content Override
In content creation forms:
```tsx
<FormField>
  <Label>Content Language</Label>
  <LanguageSelector
    value={sourceLanguage}
    onChange={setSourceLanguage}
    defaultValue={account.preferredLanguage}
  />
  <HelpText>
    This content will be translated from this language to all others.
  </HelpText>
</FormField>
```

### 4.6 Manual Edit Preservation

#### FR-6.1: Update Warning
When source content is updated and manual translations exist:
```tsx
<ManualEditWarningDialog
  manuallyEditedLanguages={['fr', 'de']}
  onKeepManual={() => updateSourceOnly()}
  onOverwrite={() => updateAndRetranslate()}
  onCancel={() => cancel()}
>
  <p>
    You have manually edited translations for French and German.
    What would you like to do?
  </p>
  <ul>
    <li><strong>Keep manual edits</strong> - Only update source, preserve manual translations</li>
    <li><strong>Re-translate all</strong> - Generate new translations (overwrites manual edits)</li>
  </ul>
</ManualEditWarningDialog>
```

#### FR-6.2: Stale Translation Indicator
Mark manual edits as potentially stale after source update:
```typescript
interface Translation {
  // ...
  isStale: boolean; // True if source updated after manual edit
  sourceVersionAtTranslation: number;
}
```

Visual indicator:
```
🇫🇷 Francais ✓ Manual Edit ⚠️ Source updated
    [Update Translation] [Keep Current]
```

---

## 5. API Endpoints

### 5.1 Get Translation Status
**Endpoint:** `GET /api/translations/status`

**Query Parameters:**
- `entityType` (optional): Filter by type
- `entityId` (optional): Specific entity
- `status` (optional): Filter by status

**Response:**
```json
{
  "summary": {
    "total": 100,
    "complete": 80,
    "partial": 15,
    "pending": 3,
    "failed": 2
  },
  "items": [
    {
      "entityType": "article",
      "entityId": "abc-123",
      "name": "How to Use the Dishwasher",
      "sourceLanguage": "en",
      "translations": {
        "fr": { "status": "completed", "isManual": false },
        "es": { "status": "completed", "isManual": true },
        "de": { "status": "pending" },
        "nl": { "status": "completed", "isManual": false },
        "it": { "status": "failed", "error": "Rate limit" }
      }
    }
  ]
}
```

### 5.2 Update Translation
**Endpoint:** `PUT /api/translations/{entityType}/{entityId}/{language}`

**Request:**
```json
{
  "title": "Comment utiliser le lave-vaisselle",
  "description": "Corrected translation..."
}
```

**Response:**
```json
{
  "success": true,
  "translation": {
    "language": "fr",
    "status": "manual",
    "reviewedBy": "user-123",
    "updatedAt": "2026-01-17T12:00:00Z"
  }
}
```

### 5.3 Trigger Re-translation
**Endpoint:** `POST /api/translations/retranslate`

**Request:**
```json
{
  "entities": [
    { "type": "article", "id": "abc-123" },
    { "type": "item", "id": "def-456" }
  ],
  "languages": ["de", "it"], // Optional, all if omitted
  "overwriteManual": false
}
```

**Response:**
```json
{
  "success": true,
  "jobsQueued": 4,
  "skipped": 2,
  "skippedReason": "Manual edits preserved"
}
```

### 5.4 Update Language Preference
**Endpoint:** `PUT /api/accounts/{accountId}/preferences`

**Request:**
```json
{
  "preferredLanguage": "fr"
}
```

---

## 6. Non-Functional Requirements

### NFR-1: Performance
- Translation preview loads within 1 second
- Real-time status updates within 2 seconds
- Bulk operations handle 100+ items

### NFR-2: Usability
- Clear visual status indicators
- Intuitive editing workflow
- Mobile-friendly management interface

### NFR-3: Data Integrity
- Manual edits never lost without warning
- Audit trail for changes
- Consistent state between UI and database

---

## 7. Acceptance Criteria

### AC-1: Translation Preview
- [ ] Preview panel shows after content save
- [ ] Real-time status updates as translations complete
- [ ] All languages visible with status
- [ ] Source content displayed for comparison

### AC-2: Manual Editing
- [ ] Can edit any translation inline
- [ ] Changes save immediately
- [ ] Manual status is tracked
- [ ] Edit preserved across sessions

### AC-3: Status Dashboard
- [ ] Summary widget on dashboard
- [ ] Status column in item lists
- [ ] Filtering by translation status
- [ ] Bulk selection and actions

### AC-4: Re-translation
- [ ] Can re-translate single language
- [ ] Can re-translate all languages
- [ ] Warning for manual edit overwrite
- [ ] Progress visible during re-translation

### AC-5: Source Language
- [ ] Account preference setting works
- [ ] Content defaults to preference
- [ ] Can override per-content
- [ ] Preference persists

### AC-6: Manual Edit Preservation
- [ ] Warning when source updated
- [ ] Option to keep or overwrite
- [ ] Stale indicator shows
- [ ] Can update stale translations

---

## 8. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Users confused by status | Medium | Low | Clear visual indicators, help text |
| Manual edits accidentally overwritten | Medium | High | Confirmation dialogs, audit trail |
| Performance with many items | Low | Medium | Pagination, efficient queries |
| Real-time updates unreliable | Low | Low | Fallback to polling, refresh button |

---

## 9. Dependencies

### Upstream
- Epic 1: Foundation (database tables, framework)
- Epic 3: Dynamic Content Translation (translations must be generated)

### Downstream
- None (this is owner-facing management)

---

## 10. Out of Scope

- Machine translation quality scoring
- Professional translation integration
- Translation memory/glossary management
- Collaborative translation workflow
- Translation approval process
- Analytics on translation usage

---

## 11. Future Considerations

### Phase 2 Features (Not in this epic)
- Translation quality ratings from guests
- Suggested improvements based on guest feedback
- Export/import translations (for professional review)
- Translation consistency checker
- Bulk CSV translation upload

---

## 12. UI/UX Specifications

### 12.1 Translation Status Icons
| Status | Icon | Color | Meaning |
|--------|------|-------|---------|
| Original | ● | Blue | Source language |
| Completed | ✓ | Green | Auto-translated |
| Manual | ✎ | Purple | Manually edited |
| Pending | ⏳ | Orange | In progress |
| Failed | ❌ | Red | Translation failed |
| Stale | ⚠️ | Yellow | Source updated |

### 12.2 Color Palette
- Complete: #22C55E (green-500)
- Pending: #F59E0B (amber-500)
- Failed: #EF4444 (red-500)
- Manual: #8B5CF6 (violet-500)
- Stale: #EAB308 (yellow-500)

### 12.3 Layout Patterns
- Preview panel: Slide-in from right, 400px width
- Editor: Modal or inline expansion
- Status page: Full-width table with sticky header

---

## 13. Appendix

### A. Translation Status State Machine
```
                    ┌──────────────┐
                    │   PENDING    │
                    └──────────────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
       ┌───────────┐ ┌──────────┐ ┌──────────┐
       │ COMPLETED │ │  FAILED  │ │  MANUAL  │
       └───────────┘ └──────────┘ └──────────┘
              │            │            │
              │            ▼            │
              │     ┌──────────┐        │
              │     │  RETRY   │────────┘
              │     └──────────┘
              │            │
              ▼            ▼
       ┌─────────────────────────┐
       │ STALE (after source     │
       │ content update)         │
       └─────────────────────────┘
```

### B. Sample Database Query for Status Dashboard
```sql
WITH translation_status AS (
  SELECT
    i.id as item_id,
    i.name,
    i.source_language,
    COUNT(CASE WHEN it.translation_status = 'completed' THEN 1 END) as completed,
    COUNT(CASE WHEN it.translation_status = 'pending' THEN 1 END) as pending,
    COUNT(CASE WHEN it.translation_status = 'failed' THEN 1 END) as failed,
    COUNT(CASE WHEN it.translation_status = 'manual' THEN 1 END) as manual
  FROM items i
  LEFT JOIN item_translations it ON it.item_id = i.id
  WHERE i.property_id IN (SELECT id FROM properties WHERE account_id = :accountId)
  GROUP BY i.id, i.name, i.source_language
)
SELECT
  *,
  CASE
    WHEN completed + manual = 5 THEN 'complete'
    WHEN pending > 0 THEN 'pending'
    WHEN failed > 0 THEN 'failed'
    WHEN completed + manual > 0 THEN 'partial'
    ELSE 'none'
  END as overall_status
FROM translation_status
ORDER BY
  CASE overall_status
    WHEN 'failed' THEN 1
    WHEN 'pending' THEN 2
    WHEN 'partial' THEN 3
    ELSE 4
  END;
```
