# REQ-175: Synchronize Documentation with Implementation Changes - Detailed Task Breakdown

**Created**: 2026-01-09 23:59:00 UTC
**Last Modified**: 2026-01-09 23:59:00 UTC
**Request Reference**: `docs/gen_requests.md` - REQ-175
**Overview Document**: `docs/REQ-175-update-documentation-overview.md`
**Implementation Plan**: `docs/prd/Plan-094-UI-UX-Workflow-Improvements.md`
**Phase**: 6 - Integration & Polish
**Task ID**: 6.4
**Type**: ENHANCEMENT (Documentation Update)
**Size**: S
**Status**: Ready for Implementation

---

## Summary

This document provides granular, implementation-ready tasks for synchronizing all code documentation with the UI/UX workflow improvements implemented in Plan-094. Each task is scoped to approximately 1 story point (a few hours of focused work).

---

## Prerequisites

Before starting implementation:

- [ ] All Plan-094 phases (0-5) are complete
- [ ] New components exist: PurposeStep, ContentPreview, titleGenerator
- [ ] PreviewSaveStep redesign is complete
- [ ] Navigation removal from content input steps is complete
- [ ] WORKFLOW_STEPS has been updated in code to include `purpose-selection`

---

## Task Breakdown

### Task 1: Update WORKFLOW_STEPS Documentation in constants.ts

**File**: `src/components/ItemCreationWorkflow/utils/constants.ts`
**Modification Type**: MODIFY (JSDoc comments only)
**Estimated Effort**: 30-45 minutes

#### 1.1 Subtasks

1. **Update file header @lastModified annotation**
   - Location: Line 28
   - Current: `@lastModified 2026-01-05 (REQ-118 Documentation Updates)`
   - New: `@lastModified 2026-01-09 (Plan-094, REQ-175 Documentation Sync)`

2. **Update WORKFLOW_STEPS JSDoc comment**
   - Location: Lines 187-201
   - Add comprehensive step flow documentation
   - Include skip conditions
   - Document changes from previous flow

3. **Update PROGRESS_WEIGHTS JSDoc comment**
   - Location: Lines 222-231
   - Add comment explaining weight calculation changes

#### 1.2 Expected Code Changes

```typescript
// Replace existing WORKFLOW_STEPS JSDoc (lines 187-201)

/**
 * Ordered list of all workflow steps.
 *
 * ## Step Flow (Plan-094 UI/UX Improvements)
 *
 * ```
 * 1. room-selection        → Select room category
 * 2. item-type-selection   → Select item type (skips if 'general' room)
 * 3. specific-item-selection → Name the specific item
 * 4. purpose-selection     → Select content purpose (NEW)
 * 5. content-type-selection → Select content format (consolidated)
 * 6. content-creation      → Create/upload content
 * 7. preview-save          → Preview with actual content, edit title (redesigned)
 * 8. next-action           → Choose next step (simplified: 3 options)
 * 9. session-summary       → Review all items, generate QR codes
 * ```
 *
 * ## Changes from Original Flow
 * - ADDED: `purpose-selection` after specific-item (Phase 2)
 * - REMOVED: `content-source-selection` merged into content-type-selection (Phase 3)
 * - MODIFIED: `preview-save` redesigned with actual content previews (Phase 5)
 * - MODIFIED: `next-action` simplified to 3 options (Phase 4)
 *
 * ## Skip Conditions
 * - `item-type-selection`: Skipped when room is 'general'
 *
 * @see Plan-094-UI-UX-Workflow-Improvements.md for implementation details
 * @see STEP_TRANSITIONS in useWorkflowState.ts for navigation logic
 * @see PROGRESS_WEIGHTS for progress calculation
 * @lastModified 2026-01-09 (Plan-094, REQ-175)
 */
export const WORKFLOW_STEPS = [
  'room-selection',
  'item-type-selection',
  'specific-item-selection',
  'purpose-selection',      // NEW: Added in Plan-094
  'content-type-selection', // Consolidated (content-source-selection removed)
  'content-creation',
  'preview-save',
  'next-action',
  'session-summary',
] as const;
```

#### 1.3 Verification Steps

- [ ] File compiles without TypeScript errors
- [ ] JSDoc renders correctly in IDE hover tooltips
- [ ] All step names in comments match actual WORKFLOW_STEPS array
- [ ] No references to removed `content-source-selection` step
- [ ] @lastModified date is current

---

### Task 2: Add PURPOSE_TYPES Documentation

**File**: `src/components/ItemCreationWorkflow/utils/constants.ts`
**Modification Type**: ADD (JSDoc comments for new constants)
**Estimated Effort**: 20-30 minutes

#### 2.1 Subtasks

1. **Document PURPOSE_TYPES constant**
   - Add JSDoc explaining available purpose types
   - Include usage examples
   - Cross-reference to PurposeStep component

2. **Document PURPOSE_LABELS constant**
   - Add JSDoc explaining purpose labels
   - Include mapping to display text

3. **Document PURPOSE_DESCRIPTIONS constant**
   - Add JSDoc explaining descriptions
   - Note usage in UI helper text

#### 2.2 Expected Code Changes

```typescript
// Add after CONTENT_SOURCE_OPTIONS section (approximately line 165)

// =============================================================================
// Purpose Type Configuration (Plan-094)
// =============================================================================

/**
 * Available purpose/intent types for item content.
 *
 * Purpose Types:
 * - how-to-use       - Operating instructions and controls
 * - how-to-clean     - Cleaning and care instructions
 * - troubleshooting  - Common issues and fixes
 * - safety-info      - Safety warnings and precautions
 * - maintenance      - Regular maintenance tasks
 * - features         - Special features and tips
 * - other            - General information
 *
 * @see PurposeStep component for UI implementation
 * @see generateArticleTitle() for title generation using purpose
 * @created 2026-01-09 (Plan-094 Phase 2)
 */
export const PURPOSE_TYPES = [
  'how-to-use',
  'how-to-clean',
  'troubleshooting',
  'safety-info',
  'maintenance',
  'features',
  'other',
] as const;

/**
 * Type for purpose type values derived from PURPOSE_TYPES constant.
 */
export type PurposeTypeConst = (typeof PURPOSE_TYPES)[number];

/**
 * Human-readable labels for each purpose type.
 * Used for display in UI selection components and title generation.
 */
export const PURPOSE_LABELS: Record<PurposeTypeConst, string> = {
  'how-to-use': 'How to Use',
  'how-to-clean': 'How to Clean',
  'troubleshooting': 'Troubleshooting',
  'safety-info': 'Safety Information',
  'maintenance': 'Maintenance',
  'features': 'Features & Tips',
  'other': 'Other',
};

/**
 * Descriptive text for each purpose type.
 * Displayed as helper text in PurposeStep selection UI.
 */
export const PURPOSE_DESCRIPTIONS: Record<PurposeTypeConst, string> = {
  'how-to-use': 'Operating instructions and controls',
  'how-to-clean': 'Cleaning and care instructions',
  'troubleshooting': 'Common issues and fixes',
  'safety-info': 'Safety warnings and precautions',
  'maintenance': 'Regular maintenance tasks',
  'features': 'Special features and tips',
  'other': 'General information',
};
```

#### 2.3 Verification Steps

- [ ] Constants are exported from utils/index.ts
- [ ] TypeScript types resolve correctly
- [ ] JSDoc comments display in IDE
- [ ] All purpose types match actual implementation

---

### Task 3: Add JSDoc to New Components (PurposeStep, ContentPreview, titleGenerator)

**Files**:
- `src/components/ItemCreationWorkflow/components/steps/PurposeStep.tsx`
- `src/components/ItemCreationWorkflow/components/shared/ContentPreview.tsx`
- `src/components/ItemCreationWorkflow/utils/titleGenerator.ts`

**Modification Type**: ADD (JSDoc headers)
**Estimated Effort**: 45-60 minutes

#### 3.1 PurposeStep.tsx JSDoc Header

```typescript
/**
 * PurposeStep Component
 *
 * Step 4 of ItemCreationWorkflow - Purpose/Intent selection.
 * Allows users to select the purpose for their content (e.g., how-to-use,
 * how-to-clean, troubleshooting). This selection drives automatic title
 * generation for the article.
 *
 * Features:
 * - Grid layout of purpose options with icons
 * - Keyboard navigation (arrow keys, Enter/Space to select)
 * - Auto-advance on selection (with visual feedback delay)
 * - Screen reader announcements for selection
 *
 * @module ItemCreationWorkflow/components/steps/PurposeStep
 * @see docs/prd/Plan-094-UI-UX-Workflow-Improvements.md Phase 2
 * @see generateArticleTitle() for title generation
 * @created 2026-01-09 (Plan-094 Phase 2)
 * @lastModified 2026-01-09 (REQ-175 Documentation Sync)
 */
```

#### 3.2 ContentPreview.tsx JSDoc Header

```typescript
/**
 * ContentPreview Component
 *
 * Reusable component for rendering content previews across different media types.
 * Handles video, photo, PDF, text, and URL content with appropriate displays.
 *
 * Features:
 * - Video: Thumbnail with duration badge
 * - Photo: Image thumbnail with loading state
 * - PDF: Thumbnail with page count indicator
 * - Text: Truncated preview with text icon
 * - URL: Favicon, title, and domain display
 * - Loading and error states for all types
 *
 * @example
 * ```tsx
 * <ContentPreview
 *   content={contentPiece}
 *   size="medium"
 *   showRemove={true}
 *   onRemove={() => handleRemove(contentPiece.id)}
 * />
 * ```
 *
 * @module ItemCreationWorkflow/components/shared/ContentPreview
 * @see docs/prd/Plan-094-UI-UX-Workflow-Improvements.md Phase 5
 * @created 2026-01-09 (Plan-094 Phase 5)
 * @lastModified 2026-01-09 (REQ-175 Documentation Sync)
 */
```

#### 3.3 titleGenerator.ts JSDoc Header

```typescript
/**
 * Title Generator Utility
 *
 * Generates article titles based on user selections (purpose + item).
 * Creates titles in the format: "[Purpose Label] - [Item Name]"
 *
 * @example
 * ```ts
 * generateArticleTitle({ specificItem: "Fridge", purpose: "how-to-clean" })
 * // Returns: "How to Clean - Fridge"
 *
 * generateArticleTitle({ specificItem: "Oven", purpose: "troubleshooting" })
 * // Returns: "Troubleshooting - Oven"
 * ```
 *
 * Note: This generates the ARTICLE title, not the Item name.
 * - Item name: "Fridge" (physical object, unchanged)
 * - Article title: "How to Clean - Fridge" (content topic)
 *
 * @module ItemCreationWorkflow/utils/titleGenerator
 * @see docs/prd/Plan-094-UI-UX-Workflow-Improvements.md Appendix B
 * @created 2026-01-09 (Plan-094 Phase 1)
 * @lastModified 2026-01-09 (REQ-175 Documentation Sync)
 */
```

#### 3.4 Verification Steps

- [ ] All three files have complete JSDoc headers
- [ ] @module paths are correct
- [ ] @see references point to valid documents
- [ ] Code examples in JSDoc are accurate
- [ ] IDE tooltips display documentation correctly

---

### Task 4: Update JSDoc for Modified Step Components

**Files**:
- `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx`
- `src/components/ItemCreationWorkflow/components/steps/NextActionStep.tsx`
- `src/components/ItemCreationWorkflow/components/steps/ContentTypeStep.tsx`

**Modification Type**: MODIFY (JSDoc headers)
**Estimated Effort**: 30-45 minutes

#### 4.1 PreviewSaveStep.tsx JSDoc Update

```typescript
/**
 * PreviewSaveStep Component
 *
 * Step 7 of ItemCreationWorkflow - Preview and save captured content.
 *
 * Redesigned in Plan-094 to show:
 * - Item Details section with pre-populated fields (title editable, room/type/purpose read-only)
 * - Content section with actual previews using ContentPreview component
 * - Small "+ Add More" link instead of large CTAs
 * - Content count badge
 * - Drag-to-reorder capability with keyboard support
 *
 * Key Changes (Plan-094):
 * - Removed large "Add Media" / "Add Link" buttons
 * - Added pre-populated fields from user selections
 * - Integrated ContentPreview for actual content display
 * - Simplified visual hierarchy to prioritize review over adding
 *
 * @module ItemCreationWorkflow/components/steps/PreviewSaveStep
 * @see docs/REQ-106-preview-save-step-overview.md (original)
 * @see docs/prd/Plan-094-UI-UX-Workflow-Improvements.md Phase 5
 * @lastModified 2026-01-09 (Plan-094 Phase 5 Redesign, REQ-175)
 */
```

#### 4.2 NextActionStep.tsx JSDoc Update

```typescript
/**
 * NextActionStep Component
 *
 * Step 8 of ItemCreationWorkflow - Choose next action after content creation.
 *
 * Simplified in Plan-094 to exactly 3 action cards (no bottom navigation):
 * 1. Review & Submit - Proceed to session summary
 * 2. Add More Content - Return to add additional content to same item
 * 3. Cancel - Exit workflow with confirmation dialog
 *
 * Key Changes (Plan-094):
 * - Removed bottom navigation bar completely
 * - Standardized on 3 action cards only
 * - Added confirmation dialog for Cancel action
 *
 * @module ItemCreationWorkflow/components/steps/NextActionStep
 * @see docs/prd/Plan-094-UI-UX-Workflow-Improvements.md Phase 4
 * @lastModified 2026-01-09 (Plan-094 Phase 4, REQ-175)
 */
```

#### 4.3 ContentTypeStep.tsx JSDoc Update

```typescript
/**
 * ContentTypeStep Component
 *
 * Step 5 of ItemCreationWorkflow - Select content type/format.
 *
 * Consolidated in Plan-094 (formerly separate content-source-selection step):
 * - Record Video - Capture video with device camera
 * - Take Photo - Capture photo with device camera
 * - Write Text - Create text instructions
 * - Upload File - Upload video, image, PDF, or text files
 * - Add Link - Add URL/web link
 *
 * Key Changes (Plan-094):
 * - Now shows all 5 options in single view (consolidated)
 * - "Upload File" label updated with supported format hints
 * - Removed separate "I have content" / "Create new" selection
 *
 * @module ItemCreationWorkflow/components/steps/ContentTypeStep
 * @see docs/prd/Plan-094-UI-UX-Workflow-Improvements.md Phase 3
 * @lastModified 2026-01-09 (Plan-094 Phase 3, REQ-175)
 */
```

#### 4.4 Verification Steps

- [ ] All three files have updated JSDoc headers
- [ ] Step numbers are accurate (PreviewSaveStep=7, NextActionStep=8, ContentTypeStep=5)
- [ ] Key changes section accurately reflects Plan-094 modifications
- [ ] @lastModified dates are current

---

### Task 5: Update JSDoc for Content Input Steps (Navigation Removal)

**Files**:
- `src/components/ItemCreationWorkflow/components/steps/TextEditorStep.tsx`
- `src/components/ItemCreationWorkflow/components/steps/FileUploadStep.tsx`
- `src/components/ItemCreationWorkflow/components/steps/VideoCaptureStep.tsx`
- `src/components/ItemCreationWorkflow/components/steps/PhotoCaptureStep.tsx`
- `src/components/ItemCreationWorkflow/components/steps/UrlInputStep.tsx`

**Modification Type**: MODIFY (Add navigation change note to JSDoc)
**Estimated Effort**: 30-45 minutes

#### 5.1 Standard Navigation Note to Add

Add the following section to each file's existing JSDoc header:

```typescript
/**
 * [Existing component documentation...]
 *
 * Navigation Changes (Plan-094):
 * - Removed bottom navigation bar to eliminate duplicate controls
 * - Navigation handled via inline Back/Continue buttons only
 * - Before content added: Back button only
 * - After content added: Back + Continue buttons
 *
 * @see docs/prd/Plan-094-UI-UX-Workflow-Improvements.md Phase 4
 * @lastModified 2026-01-09 (Plan-094 Phase 4, REQ-175)
 */
```

#### 5.2 Files to Update

| File | Current @lastModified | New @lastModified |
|------|----------------------|-------------------|
| TextEditorStep.tsx | Varies | 2026-01-09 (Plan-094, REQ-175) |
| FileUploadStep.tsx | Varies | 2026-01-09 (Plan-094, REQ-175) |
| VideoCaptureStep.tsx | Varies | 2026-01-09 (Plan-094, REQ-175) |
| PhotoCaptureStep.tsx | Varies | 2026-01-09 (Plan-094, REQ-175) |
| UrlInputStep.tsx | Varies | 2026-01-09 (Plan-094, REQ-175) |

#### 5.3 Verification Steps

- [ ] All 5 content input step files have navigation note added
- [ ] @lastModified dates are updated
- [ ] @see reference to Plan-094 is included
- [ ] No duplicate JSDoc sections

---

### Task 6: Update Core Component JSDoc Headers

**Files**:
- `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`
- `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts`
- `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`

**Modification Type**: MODIFY (JSDoc headers and inline comments)
**Estimated Effort**: 45-60 minutes

#### 6.1 ItemCreationWorkflow.tsx Updates

```typescript
/**
 * ItemCreationWorkflow Component
 *
 * Main orchestrator component for the multi-step item creation workflow.
 * Manages step navigation, state, and integration with ItemCapture component.
 *
 * Workflow Steps (Plan-094):
 * 1. room-selection → 2. item-type-selection → 3. specific-item-selection →
 * 4. purpose-selection (NEW) → 5. content-type-selection → 6. content-creation →
 * 7. preview-save → 8. next-action → 9. session-summary
 *
 * Key Changes (Plan-094):
 * - Added step 4 (purpose-selection) for content purpose/intent
 * - Removed content-source-selection step (consolidated into content-type-selection)
 * - Updated step rendering for PurposeStep component
 * - Updated progress calculation for new step order
 *
 * @module ItemCreationWorkflow/ItemCreationWorkflow
 * @see docs/prd/Plan-094-UI-UX-Workflow-Improvements.md
 * @see useWorkflowState hook for state machine logic
 * @lastModified 2026-01-09 (Plan-094, REQ-175)
 */
```

#### 6.2 ItemCreationWorkflow.types.ts Updates

Add/update JSDoc for:
- `PurposeType` type definition
- `CurrentItemState.purpose` field
- `SELECT_PURPOSE` action type

```typescript
/**
 * Purpose/Intent categories for item content.
 * Drives automatic article title generation.
 *
 * @see generateArticleTitle() in utils/titleGenerator.ts
 * @created 2026-01-09 (Plan-094)
 */
export type PurposeType =
  | 'how-to-use'
  | 'how-to-clean'
  | 'troubleshooting'
  | 'safety-info'
  | 'maintenance'
  | 'features'
  | 'other';

/**
 * State for the item currently being created.
 *
 * @property purpose - NEW (Plan-094): Selected content purpose/intent
 */
export interface CurrentItemState {
  // ... existing fields ...
  /** Selected content purpose (Plan-094) - drives article title generation */
  purpose: PurposeType | null;
}
```

#### 6.3 useWorkflowState.ts Updates

Update STEP_TRANSITIONS documentation:

```typescript
/**
 * Step transition map defining valid navigation paths.
 *
 * Updated in Plan-094:
 * - Added purpose-selection step after specific-item-selection
 * - Removed content-source-selection (merged into content-type-selection)
 * - Updated next-action transitions for simplified flow
 *
 * @see WORKFLOW_STEPS in constants.ts for step order
 * @lastModified 2026-01-09 (Plan-094, REQ-175)
 */
export const STEP_TRANSITIONS: Record<WorkflowStep, WorkflowStep[]> = {
  'room-selection': ['item-type-selection', 'specific-item-selection'],
  'item-type-selection': ['specific-item-selection'],
  'specific-item-selection': ['purpose-selection'],  // Updated
  'purpose-selection': ['content-type-selection'],   // NEW
  'content-type-selection': ['content-creation'],
  'content-creation': ['preview-save'],
  'preview-save': ['next-action'],
  'next-action': ['room-selection', 'session-summary', 'content-type-selection'],
  'session-summary': [],
};
```

#### 6.4 Verification Steps

- [ ] Main component JSDoc reflects new step flow
- [ ] PurposeType is documented in types file
- [ ] STEP_TRANSITIONS comment is updated
- [ ] All @lastModified dates are current
- [ ] No references to removed steps

---

### Task 7: Update ItemCreationWorkflow README

**File**: `src/components/ItemCreationWorkflow/README.md`
**Modification Type**: MODIFY (Multiple sections)
**Estimated Effort**: 60-90 minutes

#### 7.1 Subtasks

1. **Update Last Modified header**
   - Location: Line 3
   - New value: `> **Last Modified:** 2026-01-09 (Plan-094 UI/UX Improvements, REQ-175)`

2. **Update Workflow Steps section**
   - Location: Lines 485-525
   - Update ASCII diagram to show new flow
   - Add "Changes from Previous Workflow" subsection

3. **Update Domain Types section**
   - Location: Lines 340-345
   - Add `PurposeType` to exported types

4. **Add New Utilities section**
   - Add after existing hooks documentation
   - Document `generateArticleTitle` function
   - Document `ContentPreview` component

5. **Update Related Documentation section**
   - Location: Lines 615-620
   - Add Plan-094 reference

6. **Update footer generation date**
   - Location: Line 623

#### 7.2 New Workflow Steps Diagram

```markdown
## Workflow Steps

The workflow guides users through a 9-step process:

```
┌─────────────────────┐
│ 1. Room Selection   │  Select room (kitchen, bedroom, etc.)
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ 2. Item Type        │  Select category (appliance, room-item, general-info)
└──────────┬──────────┘  * Skips if "General" room selected
           ▼
┌─────────────────────┐
│ 3. Specific Item    │  Select/name specific item with suggestions
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ 4. Purpose          │  NEW: Select purpose (how-to-use, how-to-clean, etc.)
└──────────┬──────────┘  * Drives automatic title generation
           ▼
┌─────────────────────┐
│ 5. Content Type     │  Select type: video, photo, PDF, text, URL
└──────────┬──────────┘  * All options in single view (consolidated)
           ▼
┌─────────────────────┐
│ 6. Content Creation │  Create/upload content (uses ItemCapture)
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ 7. Preview & Save   │  Preview actual content, edit auto-generated title
└──────────┬──────────┘  * Shows pre-populated fields (room, type, purpose)
           ▼
┌─────────────────────┐
│ 8. Next Action      │  "Review & Submit" | "Add More" | "Cancel"
└──────────┬──────────┘  * Simplified to 3 options with confirmation on Cancel
           ▼
┌─────────────────────┐
│ 9. Session Summary  │  Review all items, generate QR codes, print
└─────────────────────┘
```

### Changes from Previous Workflow (Plan-094)

- **NEW Step 4 (Purpose)**: Added purpose selection that drives automatic title generation
- **Removed Step**: Content Source Selection merged into Content Type Selection
- **Preview Redesign**: Step 7 now shows actual content previews and pre-populated fields
- **NextAction Simplified**: Step 8 reduced to 3 clear options with Cancel confirmation
- **Navigation Cleanup**: Removed duplicate bottom navigation from content input steps
```

#### 7.3 New Domain Types Entry

```markdown
### Domain Types

- **`RoomType`** - Room type identifiers
- **`ItemType`** - Item categories
- **`ContentType`** - Content type options
- **`PurposeType`** - NEW: Purpose/intent categories: `'how-to-use'` | `'how-to-clean'` | `'troubleshooting'` | `'safety-info'` | `'maintenance'` | `'features'` | `'other'`
```

#### 7.4 New Utilities Section

```markdown
### New Utilities (Plan-094)

#### generateArticleTitle

Auto-generates article titles from purpose and item selections.

```tsx
import { generateArticleTitle } from '@/components/ItemCreationWorkflow';

const title = generateArticleTitle({
  specificItem: 'Fridge',
  purpose: 'how-to-clean',
});
// Result: "How to Clean - Fridge"
```

#### ContentPreview Component

Reusable content preview component for all media types.

```tsx
import { ContentPreview } from '@/components/ItemCreationWorkflow';

<ContentPreview
  content={contentPiece}
  size="medium"
  showRemove={true}
  onRemove={() => handleRemove(contentPiece.id)}
/>
```
```

#### 7.5 Updated Related Documentation

```markdown
## Related Documentation

- **Implementation Plan (Original)**: `docs/prd/Plan-093-Item-Creation-Workflow.md`
- **UI/UX Improvements Plan**: `docs/prd/Plan-094-UI-UX-Workflow-Improvements.md`
- **ItemCapture Component**: `src/components/ItemCapture/README.md`
- **ItemManager Component**: `src/components/ItemManager/README.md`
```

#### 7.6 Verification Steps

- [ ] Last Modified date is updated
- [ ] Workflow steps diagram shows 9 steps with purpose-selection
- [ ] No references to removed content-source-selection
- [ ] PurposeType is listed in Domain Types
- [ ] New utilities section added with working examples
- [ ] Related Documentation includes Plan-094
- [ ] Footer generation date is updated

---

### Task 8: Verify Index File Exports

**Files**:
- `src/components/ItemCreationWorkflow/index.ts`
- `src/components/ItemCreationWorkflow/utils/index.ts`
- `src/components/ItemCreationWorkflow/components/shared/index.ts`
- `src/components/ItemCreationWorkflow/components/steps/index.ts`

**Modification Type**: VERIFY (and add documentation if missing)
**Estimated Effort**: 20-30 minutes

#### 8.1 Verification Checklist

- [ ] `index.ts` exports `PurposeType` type
- [ ] `index.ts` exports `generateArticleTitle` function
- [ ] `utils/index.ts` exports `generateArticleTitle`
- [ ] `utils/index.ts` exports `PURPOSE_TYPES`, `PURPOSE_LABELS`, `PURPOSE_DESCRIPTIONS`
- [ ] `components/shared/index.ts` exports `ContentPreview`
- [ ] `components/steps/index.ts` exports `PurposeStep`

#### 8.2 Expected Exports to Verify/Add

```typescript
// src/components/ItemCreationWorkflow/index.ts
export { PurposeStep } from './components/steps';
export { ContentPreview } from './components/shared';
export { generateArticleTitle } from './utils';
export type { PurposeType } from './ItemCreationWorkflow.types';

// src/components/ItemCreationWorkflow/utils/index.ts
export { generateArticleTitle } from './titleGenerator';
export {
  PURPOSE_TYPES,
  PURPOSE_LABELS,
  PURPOSE_DESCRIPTIONS,
} from './constants';
```

#### 8.3 Verification Steps

- [ ] All new components are exported
- [ ] All new utilities are exported
- [ ] All new types are exported
- [ ] TypeScript compilation succeeds
- [ ] Import statements work from consuming files

---

### Task 9: Search and Remove Deprecated References

**Scope**: All ItemCreationWorkflow files
**Modification Type**: VERIFY and REMOVE
**Estimated Effort**: 30-45 minutes

#### 9.1 Search Patterns

Run grep searches to find deprecated references:

```bash
# Search for references to removed step
grep -r "content-source-selection" src/components/ItemCreationWorkflow/
grep -r "ContentSourceStep" src/components/ItemCreationWorkflow/
grep -r "contentSource" src/components/ItemCreationWorkflow/

# Search for old step count references
grep -r "8-step" src/components/ItemCreationWorkflow/
grep -r "8 steps" src/components/ItemCreationWorkflow/
```

#### 9.2 Expected Findings and Actions

| Pattern | Action |
|---------|--------|
| `content-source-selection` | Remove from comments, update to `content-type-selection` |
| `ContentSourceStep` | Update any JSDoc references |
| `8-step` / `8 steps` | Update to `9-step` / `9 steps` |
| Old workflow diagrams | Update to include purpose-selection |

#### 9.3 Verification Steps

- [ ] No grep results for deprecated patterns
- [ ] All step counts reference 9 steps
- [ ] No stale comments about removed functionality

---

### Task 10: Final Documentation Verification

**Scope**: All modified files
**Modification Type**: VERIFY
**Estimated Effort**: 30-45 minutes

#### 10.1 Comprehensive Verification Checklist

**File Header Updates**:
- [ ] `constants.ts` - @lastModified 2026-01-09
- [ ] `ItemCreationWorkflow.tsx` - @lastModified 2026-01-09
- [ ] `ItemCreationWorkflow.types.ts` - @lastModified 2026-01-09
- [ ] `useWorkflowState.ts` - @lastModified 2026-01-09
- [ ] `PurposeStep.tsx` - @lastModified 2026-01-09
- [ ] `ContentPreview.tsx` - @lastModified 2026-01-09
- [ ] `titleGenerator.ts` - @lastModified 2026-01-09
- [ ] `PreviewSaveStep.tsx` - @lastModified 2026-01-09
- [ ] `NextActionStep.tsx` - @lastModified 2026-01-09
- [ ] `ContentTypeStep.tsx` - @lastModified 2026-01-09
- [ ] `TextEditorStep.tsx` - @lastModified 2026-01-09
- [ ] `FileUploadStep.tsx` - @lastModified 2026-01-09
- [ ] `VideoCaptureStep.tsx` - @lastModified 2026-01-09
- [ ] `PhotoCaptureStep.tsx` - @lastModified 2026-01-09
- [ ] `UrlInputStep.tsx` - @lastModified 2026-01-09
- [ ] `README.md` - Last Modified 2026-01-09

**Content Accuracy**:
- [ ] All workflow step descriptions match implementation
- [ ] Purpose types are correctly documented
- [ ] No references to removed functionality
- [ ] Code examples in README work correctly
- [ ] Cross-references (@see) point to valid documents

**TypeScript/IDE Verification**:
- [ ] No TypeScript compilation errors
- [ ] JSDoc hover tooltips display correctly
- [ ] No ESLint documentation warnings

#### 10.2 Testing Documentation Examples

Test that code examples in README execute correctly:

```typescript
// Test 1: generateArticleTitle
import { generateArticleTitle } from '@/components/ItemCreationWorkflow';
const title = generateArticleTitle({ specificItem: 'Fridge', purpose: 'how-to-clean' });
console.assert(title === 'How to Clean - Fridge', 'Title generation failed');

// Test 2: Component exports exist
import { PurposeStep, ContentPreview } from '@/components/ItemCreationWorkflow';
console.assert(typeof PurposeStep === 'function', 'PurposeStep not exported');
console.assert(typeof ContentPreview === 'function', 'ContentPreview not exported');

// Test 3: Constants exports
import { PURPOSE_TYPES, PURPOSE_LABELS } from '@/components/ItemCreationWorkflow';
console.assert(PURPOSE_TYPES.includes('how-to-use'), 'PURPOSE_TYPES missing');
```

#### 10.3 Verification Steps

- [ ] All files pass verification checklist
- [ ] Code examples execute successfully
- [ ] IDE displays documentation correctly
- [ ] No deprecation warnings in console

---

## Acceptance Criteria Mapping

| Acceptance Criterion | Tasks Covering |
|---------------------|----------------|
| WORKFLOW_STEPS constant comments match current step sequence | Tasks 1, 9 |
| JSDoc comments exist for all modified components | Tasks 3, 4, 5, 6 |
| @lastModified annotations with YYYY-MM-DD format | All tasks |
| README files updated to reflect current architecture | Task 7 |
| No documentation references deprecated features | Task 9 |
| Code examples execute successfully | Task 10 |

---

## Implementation Order

**Recommended sequence** (can be parallelized where indicated):

```
Task 1: WORKFLOW_STEPS docs ────────────────────────────────────┐
                                                                 │
Task 2: PURPOSE_TYPES docs ─────────────────────────────────────┼──▶ BATCH 1
                                                                 │
Task 3: New component JSDoc ────────────────────────────────────┘
                                      │
                                      ▼
Task 4: Modified step JSDoc ────────────────────────────────────┐
                                                                 │
Task 5: Content input steps JSDoc ──────────────────────────────┼──▶ BATCH 2
                                                                 │
Task 6: Core component JSDoc ───────────────────────────────────┘
                                      │
                                      ▼
Task 7: README update ──────────────────────────────────────────┐
                                                                 │
Task 8: Verify exports ─────────────────────────────────────────┼──▶ BATCH 3
                                                                 │
Task 9: Remove deprecated refs ─────────────────────────────────┘
                                      │
                                      ▼
Task 10: Final verification ─────────────────────────────────────▶ FINAL
```

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Missing file updates | Use checklist systematically |
| Outdated references missed | Run grep searches in Task 9 |
| Code examples outdated | Test all examples in Task 10 |
| TypeDoc compatibility issues | Verify JSDoc syntax during implementation |

---

## Post-Implementation Steps

1. Run TypeScript compilation to verify no errors
2. Run ESLint to check for documentation warnings
3. Manually verify IDE tooltips show documentation
4. Review README in rendered markdown viewer
5. Create commit with message: `docs(REQ-175): Synchronize documentation with Plan-094 UI/UX improvements`

---

## References

- **Overview Document**: `/docs/REQ-175-update-documentation-overview.md`
- **Implementation Plan**: `/docs/prd/Plan-094-UI-UX-Workflow-Improvements.md`
- **Request Source**: `/docs/gen_requests.md` - REQ-175
- **Current README**: `/src/components/ItemCreationWorkflow/README.md`
- **Constants File**: `/src/components/ItemCreationWorkflow/utils/constants.ts`

---

*Document generated: 2026-01-09 23:59:00 UTC*
*Generated as detailed task breakdown for REQ-175 Documentation Update implementation.*
