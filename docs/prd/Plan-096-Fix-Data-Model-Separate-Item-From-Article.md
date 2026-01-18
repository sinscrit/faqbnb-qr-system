# Implementation Plan: Fix Data Model - Separate Item from Article/Instructions

**Generated:** 2026-01-11 20:15:00 UTC
**Last Modified:** 2026-01-11 20:15:00 UTC
**Plan Number:** 096
**PRD Source:** `/docs/prd/intake/prd-fix-data-model---separate-item-from-articleinstruc-20260111-200533.md`
**Priority:** CRITICAL

---

## Overview

This plan addresses a fundamental data model confusion in the application where the UI conflates **Items** (physical objects like "Fridge") with **Articles** (instructional content like "How to Clean"). The current implementation incorrectly shows combined titles like "How to Clean - Steamer" as the "Item Name" and uses this combined string as the QR code label.

**Correct Data Model:**
- **Item** = A physical thing that gets ONE QR code (e.g., Fridge, Oven, Steamer)
- **Article** = Instructions/content about an item, multiple per item (e.g., "How to Clean", "How to Turn Off")
- **Purpose** = Article Title (same thing)
- **QR Code** = ONE per Item (not per article) - Scan "Fridge" to see all articles

**Key Change:** When a user scans a QR code labeled "Steamer", they should see a list of ALL articles for that item, not just one.

---

## Technical Context

### Existing Stack
- **Framework:** Next.js 15.5.9 with React 19.1.0
- **Language:** TypeScript 5.x
- **Styling:** Tailwind CSS v4
- **State Management:** useReducer pattern (custom hooks)
- **Database:** Supabase (PostgreSQL)
- **Build Tool:** Next.js with Turbopack
- **UI Components:** Lucide React icons, Radix UI primitives

### Current Database Schema
The database already has the correct structure (added in Plan-094):

```sql
-- Items table (physical objects - gets QR code)
CREATE TABLE items (
  id UUID PRIMARY KEY,
  public_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,        -- e.g., "Steamer"
  description TEXT,
  qr_code_url TEXT,
  property_id UUID REFERENCES properties(id)
);

-- Articles table (content grouping by purpose)
CREATE TABLE item_articles (
  id UUID PRIMARY KEY,
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  purpose VARCHAR(100) NOT NULL,      -- e.g., "how-to-clean"
  title VARCHAR(255) NOT NULL,        -- e.g., "How to Clean"
  display_order INTEGER DEFAULT 0
);

-- Links table (content belongs to articles)
CREATE TABLE item_links (
  id UUID PRIMARY KEY,
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  article_id UUID REFERENCES item_articles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0
);
```

### Problem Analysis

The database schema is correct, but the **UI and workflow logic** conflate Item and Article:

1. **PreviewSaveStep.tsx (Step 8):** Shows "Article Title" field with combined value like "How to Clean - Steamer"
2. **useWorkflowState.ts:** `SELECT_PURPOSE` action sets `itemName` to article title format
3. **titleGenerator.ts:** Generates "Purpose - Item" format for articles, but this is used as Item name
4. **QR Code Generation:** Uses the combined article title as the QR label instead of just the Item name
5. **ItemDisplay.tsx:** When scanning QR, currently shows articles but labeling is confusing

---

## Architecture

### Data Model Clarification

```
CURRENT (INCORRECT):                    DESIRED (CORRECT):
┌─────────────────────────────────┐     ┌─────────────────────────────────┐
│ Item                            │     │ Item                            │
│ name: "How to Clean - Steamer"  │     │ name: "Steamer"                 │
│ QR Label: "How to Clean - ..."  │     │ QR Label: "Steamer"             │
│                                 │     │                                 │
│ └─ Links (flat, no grouping)    │     │ └─ Articles                     │
│     ├── video.mp4               │     │     ├── "How to Clean"          │
│     └── manual.pdf              │     │     │   └─ Links: video.mp4     │
│                                 │     │     ├── "How to Use"            │
└─────────────────────────────────┘     │     │   └─ Links: manual.pdf    │
                                        │     └── "Troubleshooting"       │
                                        │         └─ Links: guide.mp4    │
                                        └─────────────────────────────────┘
```

### State Changes Required

#### CurrentItemState (useWorkflowState.ts)

```typescript
// CURRENT
interface CurrentItemState {
  specificItem: string;     // e.g., "Steamer"
  itemName: string;         // e.g., "How to Clean - Steamer" (WRONG!)
  purpose: PurposeType;
}

// DESIRED
interface CurrentItemState {
  specificItem: string;     // e.g., "Steamer" (the ITEM name)
  articleTitle: string;     // e.g., "How to Clean" (NEW - the ARTICLE title)
  purpose: PurposeType;
  // itemName is REMOVED or renamed to specificItem for clarity
}
```

---

## Files to Modify

| File | Change Type | Purpose |
|------|-------------|---------|
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` | MODIFY | Add `articleTitle` field, clarify `specificItem` is item name |
| `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts` | MODIFY | Fix `SELECT_PURPOSE` to set `articleTitle` not `itemName` |
| `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx` | MAJOR | Split display: Item Name (read-only) vs Article Title (editable) |
| `src/components/ItemCreationWorkflow/utils/titleGenerator.ts` | MODIFY | Rename/clarify functions for article vs item |
| `src/lib/titleGenerator.ts` | MODIFY | Ensure API-level title generation is for articles only |
| `src/lib/pdf-generator-pdfkit.ts` | MODIFY | Use Item name (not article title) for QR label |
| `src/components/ItemDisplay.tsx` | VERIFY | Ensure scan view shows Item name as header, articles below |
| `src/app/api/admin/items/route.ts` | MODIFY | Ensure Item name is stored separately from Article titles |
| `src/app/api/admin/items/[publicId]/route.ts` | VERIFY | Return Item name + all articles correctly |

---

## Integration Contract

### API Request Structure

```typescript
// POST /api/admin/items - Create Item with Article
interface CreateItemRequest {
  publicId: string;
  name: string;           // ITEM name: "Steamer" (NOT "How to Clean - Steamer")
  description?: string;
  propertyId: string;
  qrCodeUrl?: string;
  article: {
    purpose: PurposeType;
    title: string;        // ARTICLE title: "How to Clean" (auto-generated or user-edited)
    description?: string;
  };
  links: {
    title: string;
    linkType: LinkType;
    url: string;
    thumbnailUrl?: string;
    displayOrder: number;
  }[];
}
```

### API Response Structure

```typescript
// GET /api/items/[publicId] - Public Item View
interface ItemViewResponse {
  success: boolean;
  data: {
    id: string;
    publicId: string;
    name: string;             // "Steamer" - this appears on QR label
    description: string;
    qrCodeUrl: string;
    articles: {
      id: string;
      purpose: PurposeType;
      title: string;          // "How to Clean"
      description?: string;
      displayOrder: number;
      links: LinkData[];
    }[];
  };
}
```

---

## Implementation Approach

### Phase 1: State Model Refactoring (Core Fix)

**Task 1.1: Update Type Definitions**
- Add `articleTitle` field to `CurrentItemState`
- Keep `specificItem` as the Item name (physical object)
- Document the distinction in JSDoc comments

**Task 1.2: Fix useWorkflowState Reducer**
- Modify `SELECT_PURPOSE` action to:
  - Set `articleTitle` = `generateArticleTitle(purpose, specificItem)`
  - Keep `specificItem` unchanged (it's the Item name)
- Ensure `itemName` logic is removed or redirected

**Task 1.3: Update PreviewSaveStep UI**
- Display "Item Name" as read-only (showing `specificItem`: "Steamer")
- Display "Article Title" as editable (showing `articleTitle`: "How to Clean - Steamer")
- Make clear which value appears on the QR code label

### Phase 2: QR Code and PDF Generation

**Task 2.1: Fix QR Label Generation**
- Modify `pdf-generator-pdfkit.ts` to use Item name (not article title) for QR label
- Verify `qrItem.name` comes from the correct source

**Task 2.2: Verify Session Item Structure**
- Ensure `SessionItem` stores both Item name and Article title separately
- Update save flow to persist correct values

### Phase 3: API and Display Fixes

**Task 3.1: Fix Item Creation API**
- Ensure POST `/api/admin/items` stores:
  - `items.name` = Item name (e.g., "Steamer")
  - `item_articles.title` = Article title (e.g., "How to Clean - Steamer")
- Article title should include the purpose + item name format

**Task 3.2: Verify Public Display**
- Confirm `ItemDisplay.tsx` shows:
  - Header: Item name ("Steamer")
  - Section headers: Article titles ("How to Clean", "How to Use", etc.)
  - Links grouped under their respective articles

### Phase 4: Testing and Edge Cases

**Task 4.1: Update Tests**
- Fix tests that expect `itemName` to contain article title
- Add tests for new `articleTitle` field

**Task 4.2: Handle Migration**
- For existing items: keep backward compatibility
- New items: use correct separation

---

## Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Keep `specificItem` as Item name | Yes | Maintains semantic clarity; it's what the user selected |
| Add new `articleTitle` field | Yes | Cleaner than repurposing `itemName` |
| Remove `itemName` field | Rename to clarify | Reduce confusion; `specificItem` serves same purpose |
| QR label source | `specificItem` | Physical object name, not content title |
| Article title format | "Purpose - Item" | User expectation based on purpose selection |

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking existing items | Medium | High | Add backward compatibility checks for items without articles |
| Session persistence issues | Low | Medium | Verify session storage includes both fields |
| PDF generation regression | Medium | High | Add unit tests for QR label generation |
| API contract change | Low | Medium | Changes are additive; existing fields maintained |

---

## Effort Estimate

| Phase | Tasks | Estimate | Confidence |
|-------|-------|----------|------------|
| Phase 1: State Model Refactoring | 1.1-1.3 | 3-4 hours | High |
| Phase 2: QR/PDF Generation | 2.1-2.2 | 2 hours | High |
| Phase 3: API and Display | 3.1-3.2 | 2 hours | Medium |
| Phase 4: Testing | 4.1-4.2 | 2 hours | Medium |
| **Total** | | **9-10 hours** | High |

---

## File-by-File Implementation Guidance

### 1. `ItemCreationWorkflow.types.ts`

```typescript
// Add to CurrentItemState interface
export interface CurrentItemState {
  room: RoomType;
  itemType: ItemType;
  specificItem: string;        // The ITEM name: "Steamer" - appears on QR label
  articleTitle: string;        // NEW: The ARTICLE title: "How to Clean - Steamer"
  purpose: PurposeType | null;
  contentSource: 'existing' | 'create-new';
  contentType: ContentType | null;
  content: ContentPiece[];
  tags: string[];

  // DEPRECATED: Remove or alias to specificItem
  // itemName: string;
}
```

### 2. `useWorkflowState.ts`

```typescript
// In SELECT_PURPOSE action handler
case 'SELECT_PURPOSE': {
  if (!state.currentItem) return state;

  const purpose = action.payload;

  // Generate ARTICLE title (for the content/instructions)
  const articleTitle = generateArticleTitle({
    specificItem: state.currentItem.specificItem,  // "Steamer"
    purpose: purpose,  // "how-to-clean"
  });
  // Result: "How to Clean - Steamer"

  const updatedItem: CurrentItemState = {
    ...state.currentItem,
    purpose: purpose,
    articleTitle: articleTitle,  // NEW field
    // DO NOT set itemName here - it should stay as specificItem
  };

  return { ...state, currentItem: updatedItem };
}
```

### 3. `PreviewSaveStep.tsx`

```tsx
// ItemDetailsSection should show BOTH fields
function ItemDetailsSection({ currentItem, onUpdateArticleTitle, ... }) {
  return (
    <section>
      <h3>Item Details</h3>

      {/* Read-only metadata */}
      <ItemDetailsDisplay
        room={currentItem.room}
        itemType={currentItem.itemType}
        purpose={currentItem.purpose}
      />

      {/* Item Name - READ ONLY (this is what goes on QR) */}
      <div className="mt-4">
        <label className="text-sm font-medium text-gray-500">
          Item Name (QR Code Label)
        </label>
        <p className="text-lg font-medium bg-gray-50 px-3 py-2 rounded-md">
          {currentItem.specificItem}  {/* "Steamer" */}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          This name will appear on the QR code label
        </p>
      </div>

      {/* Article Title - EDITABLE */}
      <div className="mt-4">
        <label className="text-sm font-medium text-gray-500">
          Article Title
        </label>
        <ItemNameEditor
          value={currentItem.articleTitle}  {/* "How to Clean - Steamer" */}
          onChange={onUpdateArticleTitle}
          placeholder="Enter article title"
        />
        <p className="text-xs text-gray-400 mt-1">
          Guests will see this as the section header
        </p>
      </div>
    </section>
  );
}
```

### 4. `pdf-generator-pdfkit.ts`

```typescript
// Ensure QR label uses Item name, not article title
// Around line 186-190:
if (options.showLabels) {
  doc.font('Helvetica').fontSize(8);
  // USE: qrItem.specificItem or qrItem.itemName
  // NOT: qrItem.articleTitle
  const labelText = qrItem.name;  // Should be "Steamer", not "How to Clean - Steamer"
  const labelWidth = doc.widthOfString(labelText);
  const labelX = qrX + (qrSizePoints - labelWidth) / 2;
  const labelY = adjustedQrY + qrSizePoints + 8;
  doc.text(labelText, labelX, labelY);
}
```

### 5. `ItemDisplay.tsx`

```tsx
// The header should show ITEM name
<h1 className="text-xl font-bold">{item.name}</h1>  {/* "Steamer" */}

// Articles section shows article titles as headers
{item.articles.map((article) => (
  <div key={article.id}>
    <h3>{article.title}</h3>  {/* "How to Clean - Steamer" */}
    {article.links.map(link => <LinkCard ... />)}
  </div>
))}
```

---

## Testing Strategy

### Unit Tests

1. **titleGenerator.test.ts**
   - `generateArticleTitle({ specificItem: "Steamer", purpose: "how-to-clean" })` returns `"How to Clean - Steamer"`

2. **useWorkflowState.test.ts**
   - `SELECT_PURPOSE` action sets `articleTitle` correctly
   - `SELECT_PURPOSE` does NOT modify `specificItem`

3. **PreviewSaveStep.test.tsx**
   - Renders Item Name as read-only
   - Renders Article Title as editable
   - Editing Article Title calls `onUpdateArticleTitle`

### Integration Tests

1. **Workflow Complete Flow**
   - Create item with purpose selection
   - Verify saved item has correct `name` (Item) and `article.title` (Article)

2. **QR Generation**
   - Generate PDF with items
   - Verify QR labels show Item name, not Article title

### Manual Verification

1. Create new item: Kitchen > Appliance > "Steamer" > How to Clean
2. On PreviewSaveStep: Verify "Steamer" shown as Item Name (read-only), "How to Clean - Steamer" as Article Title (editable)
3. Generate QR PDF: Verify label says "Steamer" not "How to Clean - Steamer"
4. Scan QR code: Verify page shows "Steamer" header with "How to Clean - Steamer" as section

---

## Open Questions

1. **Existing Items Migration:** Should we run a migration to split existing `item.name` values that contain the "Purpose - Item" format into proper Item + Article structure?

2. **Multiple Articles per Item:** The current workflow creates one article per save. Should we consolidate articles when user adds more content to same item?

3. **Item Name Editing:** Should users be able to edit the Item name (specificItem) after initial selection, or only the Article title?

---

## References

- Database Schema: `/database/schema.sql`
- Prior Plan: `/docs/prd/Plan-094-UI-UX-Workflow-Improvements.md` (introduced articles)
- Source PRD: `/docs/prd/intake/prd-fix-data-model---separate-item-from-articleinstruc-20260111-200533.md`
- Existing Types: `/src/types/index.ts` (ItemArticle, PurposeType)
- Workflow Types: `/src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts`
