# Implementation Plan: UI/UX Item Creation Workflow Improvements

**Generated:** 2026-01-09 19:30:00 UTC
**Last Modified:** 2026-01-09 20:15:00 UTC
**Plan Number:** 094
**PRD Source:** `/docs/prd/FAQBNB_Application_Review.pdf`

---

## Overview

This plan addresses 7 UI/UX change requests for the item creation workflow identified in the FAQBNB Application Review, **plus database refactoring to support the Article data model**.

### Key Changes:
1. **Database Refactoring**: New `item_articles` table to group media by purpose/topic
2. Removing the redundant "How would you like to add content?" step
3. Adding meaningful context with Purpose/Intent selection
4. Showing actual submitted content on the review screen (not empty placeholders)
5. Auto-generating article titles based on user selections

### Data Model Change:
```
CURRENT:                              NEW:
Item (Fridge)                         Item (Fridge) - physical object
└── item_links (flat list)            └── Articles (grouped by purpose)
    ├── video.mp4                         ├── Article: "How to Clean - Fridge"
    ├── manual.pdf                        │   ├── media: video.mp4
    └── guide.mp4                         │   └── media: manual.pdf
                                          └── Article: "Troubleshooting - Fridge"
                                              └── media: guide.mp4
```

### Title Format (confirmed):
- **Article Title**: "How to Clean - Fridge" (Purpose - Item)
- **Item Name**: "Fridge" (the physical object, unchanged)

### Cancel Confirmation (confirmed):
- Show confirmation dialog when user has added ANY content (upload, text, recording) and clicks Cancel

---

## Technical Context

### Existing Stack
- **Framework:** Next.js 15.5.9 with React 19.1.0
- **Language:** TypeScript 5.x
- **Styling:** Tailwind CSS v4
- **State Management:** useReducer pattern (custom hooks)
- **Build Tool:** Next.js with Turbopack
- **UI Components:** Lucide React icons, Radix UI primitives
- **Relevant Existing Patterns:**
  - `/src/components/ItemCreationWorkflow/` - Main workflow orchestration
  - `/src/components/ItemCapture/` - Content capture/upload components
  - Reducer-based state management in `useWorkflowState.ts`
  - Step components follow consistent props interface pattern

### Files to Modify

| File | Change Type | Purpose |
|------|-------------|---------|
| `ItemCreationWorkflow.types.ts` | MODIFY | Add `purpose` field to types |
| `useWorkflowState.ts` | MODIFY | Add Purpose step, update flow logic, update title generation |
| `constants.ts` | MODIFY | Add PURPOSE_TYPES, update WORKFLOW_STEPS |
| `ItemCreationWorkflow.tsx` | MODIFY | Add PurposeStep rendering, update step count |
| `ContentSourceStep.tsx` | DELETE/MODIFY | Remove or merge into ContentTypeStep |
| `ContentTypeStep.tsx` | MODIFY | Update "Upload File" label with supported formats |
| `NextActionStep.tsx` | MODIFY | Remove bottom navigation, add Cancel confirmation |
| `PreviewSaveStep.tsx` | MAJOR MODIFY | Redesign to show actual content previews |
| `NEW: PurposeStep.tsx` | CREATE | New step for purpose/intent selection |
| `NEW: ContentPreview.tsx` | CREATE | Component for rendering content previews |
| `NEW: TitleGenerator.ts` | CREATE | Utility for auto-generating titles |
| `TextEditorStep.tsx` | MODIFY | Remove duplicate bottom navigation |
| `FileUploadStep.tsx` | MODIFY | Update label, remove duplicate navigation |
| `VideoCaptureStep.tsx` | MODIFY | Remove duplicate bottom navigation |
| `PhotoCaptureStep.tsx` | MODIFY | Remove duplicate bottom navigation |
| `UrlInputStep.tsx` | MODIFY | Remove duplicate bottom navigation |

### New Dependencies Required

| Library | Purpose | Size Impact | Alternative Considered |
|---------|---------|-------------|------------------------|
| None | N/A | N/A | All requirements achievable with existing dependencies |

---

## Architecture

### Current vs New Workflow Steps

**Current Flow (8 steps):**
```
1. room-selection
2. item-type-selection
3. specific-item-selection
4. content-source-selection    <-- REMOVE (redundant)
5. content-type-selection
6. content-creation
7. preview-save
8. next-action
9. session-summary
```

**New Flow (7 steps):**
```
1. room-selection
2. item-type-selection
3. specific-item-selection
4. purpose-selection           <-- NEW STEP
5. content-type-selection      <-- Consolidated (shows all options)
6. content-creation
7. preview-save                <-- Redesigned with content preview
8. next-action                 <-- Simplified (3 options only)
9. session-summary
```

### Component Structure

```
ItemCreationWorkflow/
├── index.ts
├── ItemCreationWorkflow.tsx           # Main orchestrator (MODIFY)
├── ItemCreationWorkflow.types.ts      # Type definitions (MODIFY)
├── hooks/
│   ├── index.ts
│   └── useWorkflowState.ts            # State machine (MODIFY)
├── utils/
│   ├── index.ts
│   ├── constants.ts                   # Constants (MODIFY)
│   ├── titleGenerator.ts              # NEW: Auto-title generation
│   └── ...
└── components/
    ├── shared/
    │   ├── index.ts
    │   ├── ContentPreview.tsx         # NEW: Content preview component
    │   └── ...
    └── steps/
        ├── index.ts
        ├── RoomSelectionStep.tsx
        ├── ItemTypeStep.tsx
        ├── SpecificItemStep.tsx
        ├── PurposeStep.tsx            # NEW: Purpose selection step
        ├── ContentTypeStep.tsx        # MODIFY: Update labels
        ├── ContentCreationStep.tsx
        ├── PreviewSaveStep.tsx        # MAJOR MODIFY: Show content
        ├── NextActionStep.tsx         # MODIFY: Simplify buttons
        └── SessionSummaryStep.tsx
```

### State Management Changes

**New Types to Add:**

```typescript
// In ItemCreationWorkflow.types.ts

/** Purpose/Intent categories for item content */
export type PurposeType =
  | 'how-to-use'
  | 'how-to-clean'
  | 'troubleshooting'
  | 'safety-info'
  | 'maintenance'
  | 'features'
  | 'other';

/** Updated CurrentItemState */
export interface CurrentItemState {
  room: RoomType;
  itemType: ItemType;
  specificItem: string;
  itemName: string;
  purpose: PurposeType | null;       // NEW FIELD
  contentSource: 'existing' | 'create-new';
  contentType: ContentType | null;
  content: ContentPiece[];
}

/** New action types */
export type WorkflowAction =
  // ... existing actions ...
  | { type: 'SELECT_PURPOSE'; payload: PurposeType }
  | { type: 'SET_AUTO_GENERATED_TITLE' };
```

### Data Flow

```
User Selections → Auto-Title Generation → State Update
─────────────────────────────────────────────────────────
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Room        │ +  │ Item Type   │ +  │ Purpose     │
│ "Kitchen"   │    │ "Fridge"    │    │ "How to     │
└─────────────┘    └─────────────┘    │  clean"     │
                                       └─────────────┘
                           │
                           ▼
              ┌─────────────────────────────┐
              │ titleGenerator()            │
              │ "Kitchen Fridge - Cleaning" │
              └─────────────────────────────┘
                           │
                           ▼
              ┌─────────────────────────────┐
              │ currentItem.itemName        │
              │ (auto-generated, editable)  │
              └─────────────────────────────┘
```

---

## Integration Contract

### PurposeStep Props Interface

```typescript
export interface PurposeStepProps {
  /** Currently selected purpose (null if none) */
  currentPurpose: PurposeType | null;
  /** Callback when purpose is selected */
  onSelectPurpose: (purpose: PurposeType) => void;
  /** Callback to proceed to next step */
  onNext: () => void;
  /** Whether next step navigation is allowed */
  canNext: boolean;
  /** Optional CSS class */
  className?: string;
}
```

### ContentPreview Props Interface

```typescript
export interface ContentPreviewProps {
  /** Content piece to preview */
  content: ContentPiece;
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
  /** Whether to show remove button */
  showRemove?: boolean;
  /** Callback when remove is clicked */
  onRemove?: () => void;
  /** Optional CSS class */
  className?: string;
}
```

### Title Generator Interface

```typescript
export interface TitleGeneratorInput {
  room: RoomType;
  specificItem: string;
  purpose: PurposeType | null;
}

export function generateItemTitle(input: TitleGeneratorInput): string;
```

---

## Implementation Approach

### Phase 0: Database Refactoring (1-2 days)

This phase introduces the Article data model to support grouping media by purpose/topic.

#### Task 0.1: Create `item_articles` Table
- [ ] Create migration for `item_articles` table:
```sql
CREATE TABLE item_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  purpose VARCHAR(50) NOT NULL,  -- 'how_to_use', 'how_to_clean', 'troubleshooting', etc.
  title VARCHAR(255) NOT NULL,   -- Auto-generated: "How to Clean - Fridge"
  description TEXT,              -- Optional description
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for faster lookups
CREATE INDEX idx_item_articles_item_id ON item_articles(item_id);

-- RLS policies (similar to item_links)
ALTER TABLE item_articles ENABLE ROW LEVEL SECURITY;
```

#### Task 0.2: Add `article_id` to `item_links` Table
- [ ] Create migration to add `article_id` column:
```sql
-- Add article_id column (nullable for backwards compatibility)
ALTER TABLE item_links
  ADD COLUMN article_id UUID REFERENCES item_articles(id) ON DELETE CASCADE;

-- Index for faster lookups
CREATE INDEX idx_item_links_article_id ON item_links(article_id);
```

#### Task 0.3: Create RLS Policies for `item_articles`
- [ ] Create RLS policies matching existing item security:
```sql
-- Users can view articles for items in their properties
CREATE POLICY "Users can view own item articles"
  ON item_articles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM items i
      JOIN properties p ON i.property_id = p.id
      WHERE i.id = item_articles.item_id
      AND p.user_id = auth.uid()
    )
  );

-- Users can insert articles for their items
CREATE POLICY "Users can insert own item articles"
  ON item_articles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM items i
      JOIN properties p ON i.property_id = p.id
      WHERE i.id = item_articles.item_id
      AND p.user_id = auth.uid()
    )
  );

-- Users can update their own item articles
CREATE POLICY "Users can update own item articles"
  ON item_articles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM items i
      JOIN properties p ON i.property_id = p.id
      WHERE i.id = item_articles.item_id
      AND p.user_id = auth.uid()
    )
  );

-- Users can delete their own item articles
CREATE POLICY "Users can delete own item articles"
  ON item_articles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM items i
      JOIN properties p ON i.property_id = p.id
      WHERE i.id = item_articles.item_id
      AND p.user_id = auth.uid()
    )
  );

-- Public can view articles (for QR code access)
CREATE POLICY "Public can view item articles"
  ON item_articles FOR SELECT
  USING (true);
```

#### Task 0.4: Update API Endpoints
- [ ] Update `/api/admin/items` POST to create article when saving item
- [ ] Update `/api/admin/items` GET to include articles with nested links
- [ ] Create `/api/admin/articles` endpoints (CRUD operations)
- [ ] Update item display page to group content by article

#### Task 0.5: Update TypeScript Types
- [ ] Add `ItemArticle` interface:
```typescript
interface ItemArticle {
  id: string;
  itemId: string;
  purpose: PurposeType;
  title: string;
  description?: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  links?: ItemLink[];  // Nested media/links
}
```
- [ ] Update `Item` interface to include `articles: ItemArticle[]`
- [ ] Update admin API types

#### Task 0.6: Data Migration (if needed)
- [ ] Script to migrate existing `item_links` to articles (optional, for existing data):
```sql
-- Create default articles for existing items with links
INSERT INTO item_articles (item_id, purpose, title)
SELECT DISTINCT
  il.item_id,
  'other',
  COALESCE(i.name, 'Content')
FROM item_links il
JOIN items i ON il.item_id = i.id
WHERE il.article_id IS NULL;

-- Update existing links to reference new articles
UPDATE item_links il
SET article_id = (
  SELECT ia.id FROM item_articles ia
  WHERE ia.item_id = il.item_id
  LIMIT 1
)
WHERE il.article_id IS NULL;
```

**Deliverables:**
- New `item_articles` table with RLS policies
- Updated `item_links` table with `article_id` column
- Updated API endpoints
- TypeScript types for Article model

---

### Phase 1: Foundation (2-3 days)

#### Task 1.1: Update Types and Constants
- [ ] Add `PurposeType` to `ItemCreationWorkflow.types.ts`
- [ ] Add `purpose` field to `CurrentItemState` interface
- [ ] Add `SELECT_PURPOSE` action to `WorkflowAction` union
- [ ] Update `WorkflowStep` type to include `'purpose-selection'`
- [ ] Add `PURPOSE_TYPES` constant array to `constants.ts`
- [ ] Add `PURPOSE_LABELS` and `PURPOSE_DESCRIPTIONS` to `constants.ts`
- [ ] Update `WORKFLOW_STEPS` array (remove content-source-selection, add purpose-selection)
- [ ] Update `PROGRESS_WEIGHTS` for new step order
- [ ] Update `STEP_TRANSITIONS` in `useWorkflowState.ts`

#### Task 1.2: Create Title Generator Utility
- [ ] Create `/utils/titleGenerator.ts`
- [ ] Implement `generateItemTitle()` function
- [ ] Handle all purpose type combinations
- [ ] Add fallback for missing purpose
- [ ] Export from utils/index.ts

#### Task 1.3: Update State Machine
- [ ] Add `SELECT_PURPOSE` case to reducer
- [ ] Remove `content-source-selection` from step flow
- [ ] Update `getNextStep()` function for new flow
- [ ] Add title auto-generation on purpose selection
- [ ] Update `canGoNext` computed value for purpose step
- [ ] Add tests for new reducer cases

**Deliverables:**
- Updated type definitions
- Working title generator with tests
- Modified state machine with new step flow

---

### Phase 2: New Purpose Step (1-2 days)

#### Task 2.1: Create PurposeStep Component
- [ ] Create `/components/steps/PurposeStep.tsx`
- [ ] Implement purpose card grid (similar to ItemTypeStep pattern)
- [ ] Add icons for each purpose type
- [ ] Implement keyboard navigation (arrow keys)
- [ ] Add auto-advance on selection (with delay for visual feedback)
- [ ] Add aria labels and screen reader support
- [ ] Export from steps/index.ts

#### Task 2.2: Integrate PurposeStep into Workflow
- [ ] Add PurposeStep import to `ItemCreationWorkflow.tsx`
- [ ] Add case for 'purpose-selection' in `renderCurrentStep()`
- [ ] Connect to `selectPurpose` action
- [ ] Test navigation flow

#### Task 2.3: Create Unit Tests
- [ ] Test purpose selection updates state
- [ ] Test auto-advance behavior
- [ ] Test keyboard navigation
- [ ] Test accessibility attributes

**Deliverables:**
- Fully functional PurposeStep component
- Integration with main workflow
- Test coverage

---

### Phase 3: Remove Redundant Step & Update Labels (1 day)

#### Task 3.1: Remove ContentSourceStep
- [ ] Remove `content-source-selection` from `WORKFLOW_STEPS`
- [ ] Update `STEP_TRANSITIONS` to skip removed step
- [ ] Remove ContentSourceStep rendering case
- [ ] Update step index calculations
- [ ] Verify navigation still works

#### Task 3.2: Update ContentTypeStep Labels
- [ ] Change "Upload File" label to "Upload File"
- [ ] Add subtitle: "Video, Image, PDF, Text"
- [ ] Update `CONTENT_TYPE_OPTIONS` to show format hints
- [ ] Ensure icon still displays correctly

#### Task 3.3: Consolidate Content Options
- [ ] Merge ContentSourceStep options into ContentTypeStep
- [ ] Display all 5 options in single grid:
  - Record Video
  - Take Photo
  - Write Text
  - Upload File (Video, Image, PDF, Text)
  - Add Link

**Deliverables:**
- Simplified workflow with one less step
- Clear "Upload File" labeling with supported formats

---

### Phase 4: Remove Duplicate Navigation (1-2 days)

#### Task 4.1: Audit All Content Input Screens
- [ ] List all screens with bottom navigation:
  - TextEditorStep
  - FileUploadStep
  - VideoCaptureStep
  - PhotoCaptureStep
  - UrlInputStep
  - NextActionStep

#### Task 4.2: Remove Bottom Navigation from Content Screens
- [ ] TextEditorStep: Remove bottom bar, keep inline Back/Continue
- [ ] FileUploadStep: Remove bottom bar, keep inline navigation
- [ ] VideoCaptureStep: Remove bottom bar
- [ ] PhotoCaptureStep: Remove bottom bar
- [ ] UrlInputStep: Remove bottom bar
- [ ] Ensure consistent button placement across all screens

#### Task 4.3: Update Button Logic
- [ ] Before content: Show only "Back" button
- [ ] After content: Show "Back" + "Continue" buttons
- [ ] Ensure buttons are always visible (not scrolled off)
- [ ] Test on mobile viewport sizes

#### Task 4.4: Fix NextActionStep
- [ ] Remove bottom navigation bar completely
- [ ] Keep exactly 3 action cards:
  1. Review & Submit
  2. Add More Content
  3. Cancel
- [ ] Add confirmation dialog for Cancel action
- [ ] Update dialog to warn about losing work

**Deliverables:**
- Clean, single navigation pattern on all content screens
- Confirmation dialog on Cancel

---

### Phase 5: Redesign Review Screen (2-3 days)

#### Task 5.1: Create ContentPreview Component
- [ ] Create `/components/shared/ContentPreview.tsx`
- [ ] Handle video preview (thumbnail + duration badge)
- [ ] Handle photo preview (image thumbnail)
- [ ] Handle PDF preview (thumbnail + page count)
- [ ] Handle text preview (truncated text + icon)
- [ ] Handle URL preview (favicon + title + domain)
- [ ] Add loading states
- [ ] Export from shared/index.ts

#### Task 5.2: Redesign PreviewSaveStep Layout
- [ ] Remove large "Add Media" / "Add Link" buttons
- [ ] Show Item Details section with pre-filled data:
  - Title (auto-generated, editable)
  - Room (read-only, from selection)
  - Item Type (read-only, from selection)
  - Purpose (read-only, from selection)
- [ ] Show Content section with actual previews
- [ ] Add small "+ Add More" link (not large CTA)
- [ ] Show content count badge

#### Task 5.3: Update Content Display
- [ ] Use ContentPreview for each content piece
- [ ] Display in grid layout for multiple pieces
- [ ] Add reorder capability (drag handles)
- [ ] Add remove button on each piece
- [ ] Show empty state only when truly empty

#### Task 5.4: Pre-populate Fields
- [ ] Auto-fill Title from `generateItemTitle()`
- [ ] Display Room from `currentItem.room`
- [ ] Display Item Type from `currentItem.itemType`
- [ ] Display Purpose from `currentItem.purpose`
- [ ] Allow title editing (inline or modal)

#### Task 5.5: Update Tests
- [ ] Test content preview rendering for each type
- [ ] Test pre-populated fields display correctly
- [ ] Test title editing works
- [ ] Test empty state handling

**Deliverables:**
- ContentPreview component
- Redesigned PreviewSaveStep showing actual content
- Pre-populated item details

---

### Phase 6: Integration & Polish (1-2 days)

#### Task 6.1: End-to-End Flow Testing
- [ ] Test complete flow: Room -> Item Type -> Purpose -> Content Type -> Create -> Review -> Save
- [ ] Verify auto-generated title appears correctly
- [ ] Verify all pre-filled fields display correctly
- [ ] Test "Add More Content" flow
- [ ] Test Cancel with confirmation dialog

#### Task 6.2: Mobile Responsiveness
- [ ] Test on small viewport (320px width)
- [ ] Verify touch targets meet 48px minimum
- [ ] Test drag-to-reorder on mobile
- [ ] Verify content previews scale appropriately

#### Task 6.3: Accessibility Audit
- [ ] Verify all new components have aria labels
- [ ] Test keyboard navigation through entire flow
- [ ] Test screen reader announcements
- [ ] Verify focus management on step transitions

#### Task 6.4: Update Documentation
- [ ] Update WORKFLOW_STEPS comments
- [ ] Update component JSDoc comments
- [ ] Update README if exists
- [ ] Add @lastModified dates to modified files

**Deliverables:**
- Fully tested end-to-end flow
- Accessibility compliance
- Updated documentation

---

## Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Keep reducer pattern | useReducer | Consistent with existing codebase pattern; predictable state updates |
| Title generation timing | On purpose selection | Provides immediate feedback; user can still edit |
| Purpose step placement | After specific-item | Logical flow: know what item before asking purpose |
| ContentPreview as shared component | Reusable | Can be used in PreviewSaveStep, SessionSummaryStep, and future displays |
| Cancel confirmation dialog | Radix Dialog | Already using Radix; consistent with ConfirmExitDialog pattern |
| Content source merge | Into ContentTypeStep | Reduces steps; all options visible at once |

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking existing saved sessions | Medium | High | Version session storage, add migration path |
| State machine complexity | Medium | Medium | Comprehensive tests, clear documentation |
| Content preview performance | Low | Medium | Lazy loading thumbnails, optimize blob URLs |
| Mobile layout issues | Medium | Medium | Test on real devices, use responsive utilities |
| Title generation edge cases | Low | Low | Fallback to generic title if inputs missing |
| Accessibility regressions | Medium | High | Automated accessibility tests, manual testing |

---

## Testing Strategy

### Unit Tests
- Title generator function
- Reducer actions (SELECT_PURPOSE, updated flow)
- ContentPreview component rendering
- PurposeStep component

### Integration Tests
- Complete workflow navigation
- State persistence across steps
- Content preview rendering in context

### E2E Tests (Manual)
- Full user journey on desktop
- Full user journey on mobile
- Accessibility testing with screen reader

---

## Effort Estimate

| Phase | Tasks | Estimate | Confidence |
|-------|-------|----------|------------|
| **Phase 0: Database Refactoring** | New table, RLS, API updates | 1-2 days | High |
| Phase 1: Foundation | Types, constants, state machine | 2-3 days | High |
| Phase 2: Purpose Step | New component, integration | 1-2 days | High |
| Phase 3: Remove Redundant Step | Step removal, label updates | 1 day | High |
| Phase 4: Remove Duplicate Nav | 6 component updates | 1-2 days | Medium |
| Phase 5: Review Screen Redesign | ContentPreview, PreviewSaveStep | 2-3 days | Medium |
| Phase 6: Integration & Polish | Testing, a11y, docs | 1-2 days | High |
| **Total** | | **10-15 days** | Medium-High |

---

## Resolved Questions

1. **✅ Title format:** "How to Clean - Fridge" (Purpose - Item)
   - This is the ARTICLE title, not the Item name
   - Item name remains "Fridge" (physical object)
   - Article title is auto-generated from Purpose + Item

2. **✅ Cancel behavior:** Show confirmation dialog when user has added ANY content (upload, text, recording) and clicks Cancel

3. **✅ Database model:** Proceed with refactoring to support Article model
   - New `item_articles` table to group media by purpose
   - `item_links` gets `article_id` foreign key

## Open Questions

1. **Purpose list finalization:** Are the proposed purpose types comprehensive enough?
   - How to use
   - How to clean
   - Troubleshooting
   - Safety info
   - Maintenance
   - Features
   - Other

2. **Content preview sizing:** What's the preferred thumbnail size for content previews on the review screen? (Can decide during implementation)

---

## References

- PRD Source: `/docs/prd/FAQBNB_Application_Review.pdf`
- Existing Workflow PRD: `/docs/prd/PRD_Item_Creation_Workflow.md`
- Current Implementation Plan: `/docs/prd/Plan-093-Item-Creation-Workflow.md`
- ItemCapture Types: `/src/components/ItemCapture/ItemCapture.types.ts`
- Workflow Types: `/src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts`
- State Machine: `/src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`

---

## Appendix A: Purpose Type Constants

```typescript
// constants.ts additions

export const PURPOSE_TYPES = [
  'how-to-use',
  'how-to-clean',
  'troubleshooting',
  'safety-info',
  'maintenance',
  'features',
  'other',
] as const;

export type PurposeTypeConst = (typeof PURPOSE_TYPES)[number];

export const PURPOSE_LABELS: Record<PurposeTypeConst, string> = {
  'how-to-use': 'How to Use',
  'how-to-clean': 'How to Clean',
  'troubleshooting': 'Troubleshooting',
  'safety-info': 'Safety Information',
  'maintenance': 'Maintenance',
  'features': 'Features & Tips',
  'other': 'Other',
};

export const PURPOSE_DESCRIPTIONS: Record<PurposeTypeConst, string> = {
  'how-to-use': 'Operating instructions and controls',
  'how-to-clean': 'Cleaning and care instructions',
  'troubleshooting': 'Common issues and fixes',
  'safety-info': 'Safety warnings and precautions',
  'maintenance': 'Regular maintenance tasks',
  'features': 'Special features and tips',
  'other': 'General information',
};

export const PURPOSE_ICONS: Record<PurposeTypeConst, string> = {
  'how-to-use': 'play-circle',
  'how-to-clean': 'sparkles',
  'troubleshooting': 'wrench',
  'safety-info': 'alert-triangle',
  'maintenance': 'settings',
  'features': 'star',
  'other': 'info',
};
```

---

## Appendix B: Title Generator Implementation

```typescript
// utils/titleGenerator.ts

import { PURPOSE_LABELS } from './constants';
import type { PurposeType } from '../ItemCreationWorkflow.types';

export interface TitleGeneratorInput {
  specificItem: string;  // e.g., "Fridge"
  purpose: PurposeType | null;
}

/**
 * Generates an ARTICLE title based on user selections.
 * Format: "[Purpose] - [Item]"
 * Example: "How to Clean - Fridge"
 *
 * Note: This generates the ARTICLE title, not the Item name.
 * - Item name: "Fridge" (physical object, unchanged)
 * - Article title: "How to Clean - Fridge" (content topic)
 */
export function generateArticleTitle(input: TitleGeneratorInput): string {
  const { specificItem, purpose } = input;

  const purposeLabel = purpose ? PURPOSE_LABELS[purpose] : null;

  if (purposeLabel) {
    return `${purposeLabel} - ${specificItem}`;
  }

  // Fallback when no purpose selected
  return specificItem;
}

/**
 * Examples:
 * - generateArticleTitle({ specificItem: "Fridge", purpose: "how-to-clean" })
 *   → "How to Clean - Fridge"
 *
 * - generateArticleTitle({ specificItem: "Oven", purpose: "troubleshooting" })
 *   → "Troubleshooting - Oven"
 *
 * - generateArticleTitle({ specificItem: "Dishwasher", purpose: "how-to-use" })
 *   → "How to Use - Dishwasher"
 */
```

---

## Appendix C: Updated Step Transitions

```typescript
// useWorkflowState.ts - Updated STEP_TRANSITIONS

export const STEP_TRANSITIONS: Record<WorkflowStep, WorkflowStep[]> = {
  'room-selection': ['item-type-selection', 'specific-item-selection'],
  'item-type-selection': ['specific-item-selection'],
  'specific-item-selection': ['purpose-selection'],  // NEW: Goes to purpose
  'purpose-selection': ['content-type-selection'],   // NEW: Then to content type
  'content-type-selection': ['content-creation'],    // Direct to creation
  'content-creation': ['preview-save'],
  'preview-save': ['next-action'],
  'next-action': ['room-selection', 'session-summary', 'content-type-selection'],
  'session-summary': [],
};
```
