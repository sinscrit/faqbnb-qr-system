# REQ-175: Synchronize Documentation with Implementation Changes - Technical Overview

**Created**: 2026-01-09 23:55:00 UTC
**Last Modified**: 2026-01-09 23:55:00 UTC
**Request Reference**: `docs/gen_requests.md` - REQ-175
**Implementation Plan**: `docs/prd/Plan-094-UI-UX-Workflow-Improvements.md` - Phase 6, Task 6.4
**Type**: ENHANCEMENT (Documentation Update)
**Size**: S
**Status**: Pending Implementation

---

## Executive Summary

This task synchronizes all code documentation with the UI/UX workflow improvements implemented in Plan-094. The documentation update covers four key areas:

1. **WORKFLOW_STEPS Comments**: Update the constants file to reflect the new step sequence with Purpose Selection added and Content Source Selection removed
2. **Component JSDoc Comments**: Update documentation headers for all modified components with accurate descriptions and references
3. **README Updates**: Update the ItemCreationWorkflow README to reflect the new workflow architecture
4. **@lastModified Timestamps**: Add modification dates to all changed files following YYYY-MM-DD format

---

## Request Context

### From gen_requests.md (REQ-175)

> **Summary**: All code documentation, inline comments, and external documentation files must be updated to accurately reflect the changes made during the UI/UX workflow improvements implementation.

### Acceptance Criteria (from source)

- [ ] All WORKFLOW_STEPS constant comments match the current step sequence and behavior
- [ ] JSDoc comments exist for all modified components with complete parameter and return type documentation
- [ ] Modified files include @lastModified annotations with date in YYYY-MM-DD format
- [ ] README files (if present) are updated to reflect current component architecture and workflow
- [ ] No documentation references deprecated features or removed functionality
- [ ] Code examples in documentation execute successfully against current implementation

---

## Technical Context

### Files Modified by Plan-094 UI/UX Improvements

Based on the implementation plan (Plan-094), the following files were modified and require documentation updates:

#### Core Files Requiring Documentation Updates

| File Path | Modification Type | Documentation Needs |
|-----------|-------------------|---------------------|
| `src/components/ItemCreationWorkflow/utils/constants.ts` | MODIFIED | Update WORKFLOW_STEPS comments, add PURPOSE_TYPES docs |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` | MODIFIED | Update type docs for PurposeType, CurrentItemState |
| `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts` | MODIFIED | Update STEP_TRANSITIONS docs, SELECT_PURPOSE docs |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | MODIFIED | Update JSDoc header, step rendering docs |
| `src/components/ItemCreationWorkflow/README.md` | MODIFIED | Update workflow steps diagram, new exports |

#### New Components Created

| File Path | Documentation Needs |
|-----------|---------------------|
| `src/components/ItemCreationWorkflow/components/steps/PurposeStep.tsx` | NEW | Complete JSDoc header with props interface |
| `src/components/ItemCreationWorkflow/components/shared/ContentPreview.tsx` | NEW | Complete JSDoc header with usage examples |
| `src/components/ItemCreationWorkflow/utils/titleGenerator.ts` | NEW | Complete JSDoc with function documentation |

#### Modified Step Components

| File Path | Documentation Needs |
|-----------|---------------------|
| `src/components/ItemCreationWorkflow/components/steps/ContentTypeStep.tsx` | Update label descriptions |
| `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx` | Major update for redesign |
| `src/components/ItemCreationWorkflow/components/steps/NextActionStep.tsx` | Update for simplified navigation |
| `src/components/ItemCreationWorkflow/components/steps/ContentSourceStep.tsx` | Mark as deprecated/removed |

#### Content Input Steps (Navigation Removal)

| File Path | Documentation Needs |
|-----------|---------------------|
| `src/components/ItemCreationWorkflow/components/steps/TextEditorStep.tsx` | Update navigation docs |
| `src/components/ItemCreationWorkflow/components/steps/FileUploadStep.tsx` | Update navigation docs |
| `src/components/ItemCreationWorkflow/components/steps/VideoCaptureStep.tsx` | Update navigation docs |
| `src/components/ItemCreationWorkflow/components/steps/PhotoCaptureStep.tsx` | Update navigation docs |
| `src/components/ItemCreationWorkflow/components/steps/UrlInputStep.tsx` | Update navigation docs |

### Current Documentation Patterns

The codebase follows consistent documentation patterns that must be maintained:

#### JSDoc Header Pattern
```typescript
/**
 * ComponentName Component
 *
 * Brief description of component purpose.
 * Additional context about functionality.
 *
 * @module ModulePath
 * @see docs/related-document.md
 * @lastModified YYYY-MM-DD (REQ-XXX Description)
 */
```

#### Constants Documentation Pattern
```typescript
/**
 * Brief description of constant purpose.
 * Additional context about usage.
 */
export const CONSTANT_NAME = [...] as const;
```

#### Type Documentation Pattern
```typescript
/**
 * Description of what this type represents.
 * Additional context about usage.
 */
export type TypeName = ...;
```

---

## Implementation Approach

### Task 6.4.1: Update WORKFLOW_STEPS Comments

**Scope**: `src/components/ItemCreationWorkflow/utils/constants.ts`

**Current WORKFLOW_STEPS Definition** (lines 191-201):
```typescript
export const WORKFLOW_STEPS = [
  'room-selection',
  'item-type-selection',
  'specific-item-selection',
  'content-source-selection',  // <-- TO BE REMOVED
  // 'content-type-selection' - removed as redundant
  'content-creation',
  'preview-save',
  'next-action',
  'session-summary',
] as const;
```

**Required Changes**:

1. **Update WORKFLOW_STEPS array** to reflect new flow:
   ```typescript
   /**
    * Ordered list of all workflow steps.
    *
    * Step Flow (after Plan-094 UI/UX Improvements):
    * 1. room-selection      - Select room category (kitchen, bathroom, etc.)
    * 2. item-type-selection - Select item type (appliance, room-item, general-info)
    *                          NOTE: Skips if 'general' room selected
    * 3. specific-item-selection - Name the specific item
    * 4. purpose-selection   - NEW: Select content purpose (how-to-use, how-to-clean, etc.)
    * 5. content-type-selection - Select content format (consolidated from content-source-selection)
    * 6. content-creation    - Create/upload content
    * 7. preview-save        - Preview with actual content, edit title
    * 8. next-action         - Choose next step (simplified: 3 options only)
    * 9. session-summary     - Review all items, generate QR codes
    *
    * @see Plan-094-UI-UX-Workflow-Improvements.md for implementation details
    * @lastModified 2026-01-09 (REQ-175 Documentation Sync)
    */
   export const WORKFLOW_STEPS = [
     'room-selection',
     'item-type-selection',
     'specific-item-selection',
     'purpose-selection',      // NEW: Added in Plan-094
     'content-type-selection', // Consolidated (formerly separate content-source-selection)
     'content-creation',
     'preview-save',
     'next-action',
     'session-summary',
   ] as const;
   ```

2. **Add PURPOSE_TYPES documentation**:
   ```typescript
   /**
    * Available purpose/intent types for item content.
    *
    * Purpose Types (Plan-094):
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
    */
   export const PURPOSE_TYPES = [...] as const;
   ```

3. **Update PROGRESS_WEIGHTS** with comments:
   ```typescript
   /**
    * Progress weights for each workflow step.
    * Used to calculate progress bar percentage.
    *
    * Weights updated in Plan-094 to accommodate new purpose-selection step
    * and removal of content-source-selection step.
    *
    * @lastModified 2026-01-09 (REQ-175 Documentation Sync)
    */
   export const PROGRESS_WEIGHTS: Record<WorkflowStepConst, number> = {
     'room-selection': 10,
     'item-type-selection': 20,
     'specific-item-selection': 30,
     'purpose-selection': 40,       // NEW step
     'content-type-selection': 55,  // Renamed weight
     'content-creation': 70,
     'preview-save': 85,
     'next-action': 93,
     'session-summary': 100,
   };
   ```

---

### Task 6.4.2: Update Component JSDoc Comments

**Scope**: All modified components from Plan-094

#### PurposeStep.tsx (NEW)
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

#### ContentPreview.tsx (NEW)
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
 * @module ItemCreationWorkflow/components/shared/ContentPreview
 * @see docs/prd/Plan-094-UI-UX-Workflow-Improvements.md Phase 5
 * @created 2026-01-09 (Plan-094 Phase 5)
 * @lastModified 2026-01-09 (REQ-175 Documentation Sync)
 */
```

#### titleGenerator.ts (NEW)
```typescript
/**
 * Title Generator Utility
 *
 * Generates article titles based on user selections (purpose + item).
 * Creates titles in the format: "[Purpose Label] - [Item Name]"
 *
 * Examples:
 * - generateArticleTitle({ specificItem: "Fridge", purpose: "how-to-clean" })
 *   → "How to Clean - Fridge"
 * - generateArticleTitle({ specificItem: "Oven", purpose: "troubleshooting" })
 *   → "Troubleshooting - Oven"
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

#### PreviewSaveStep.tsx (MODIFIED - Major Redesign)
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
 * @lastModified 2026-01-09 (Plan-094 Phase 5 Redesign, REQ-175 Documentation Sync)
 */
```

#### NextActionStep.tsx (MODIFIED)
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
 * @lastModified 2026-01-09 (Plan-094 Phase 4, REQ-175 Documentation Sync)
 */
```

#### Content Input Steps (TextEditorStep, FileUploadStep, etc.)
Add this note to each:
```typescript
/**
 * [Step]Step Component
 *
 * [Existing description...]
 *
 * Navigation Changes (Plan-094):
 * - Removed bottom navigation bar to eliminate duplicate controls
 * - Navigation handled via inline Back/Continue buttons only
 * - Before content added: Back button only
 * - After content added: Back + Continue buttons
 *
 * @module ItemCreationWorkflow/components/steps/[Step]Step
 * @see docs/prd/Plan-094-UI-UX-Workflow-Improvements.md Phase 4
 * @lastModified 2026-01-09 (Plan-094 Phase 4, REQ-175 Documentation Sync)
 */
```

---

### Task 6.4.3: Update README

**Scope**: `src/components/ItemCreationWorkflow/README.md`

**Required Updates**:

1. **Update Last Modified header**:
   ```markdown
   > **Last Modified:** 2026-01-09 (Plan-094 UI/UX Improvements, REQ-175 Documentation Sync)
   ```

2. **Update Workflow Steps section** (replace current lines 485-525):
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

3. **Update Exported Types section** to include new types:
   ```markdown
   ### Domain Types

   - **`RoomType`** - Room type identifiers
   - **`ItemType`** - Item categories
   - **`ContentType`** - Content type options
   - **`PurposeType`** - NEW: Purpose/intent categories: `'how-to-use'` | `'how-to-clean'` | `'troubleshooting'` | `'safety-info'` | `'maintenance'` | `'features'` | `'other'`
   ```

4. **Add new exports section**:
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

5. **Update Related Documentation section**:
   ```markdown
   ## Related Documentation

   - **Implementation Plan (Original)**: `docs/prd/Plan-093-Item-Creation-Workflow.md`
   - **UI/UX Improvements Plan**: `docs/prd/Plan-094-UI-UX-Workflow-Improvements.md`
   - **ItemCapture Component**: `src/components/ItemCapture/README.md`
   - **ItemManager Component**: `src/components/ItemManager/README.md`
   ```

---

### Task 6.4.4: Add @lastModified Dates

**Scope**: All files modified in Plan-094

**Format**: `@lastModified YYYY-MM-DD (Request/Plan Reference)`

**Files to Update**:

| File | @lastModified Line |
|------|--------------------|
| `constants.ts` | `@lastModified 2026-01-09 (Plan-094, REQ-175)` |
| `ItemCreationWorkflow.types.ts` | `@lastModified 2026-01-09 (Plan-094, REQ-175)` |
| `useWorkflowState.ts` | `@lastModified 2026-01-09 (Plan-094, REQ-175)` |
| `ItemCreationWorkflow.tsx` | `@lastModified 2026-01-09 (Plan-094, REQ-175)` |
| `PurposeStep.tsx` | `@lastModified 2026-01-09 (Plan-094, REQ-175)` |
| `ContentPreview.tsx` | `@lastModified 2026-01-09 (Plan-094, REQ-175)` |
| `titleGenerator.ts` | `@lastModified 2026-01-09 (Plan-094, REQ-175)` |
| `PreviewSaveStep.tsx` | `@lastModified 2026-01-09 (Plan-094, REQ-175)` |
| `NextActionStep.tsx` | `@lastModified 2026-01-09 (Plan-094, REQ-175)` |
| `ContentTypeStep.tsx` | `@lastModified 2026-01-09 (Plan-094, REQ-175)` |
| `TextEditorStep.tsx` | `@lastModified 2026-01-09 (Plan-094, REQ-175)` |
| `FileUploadStep.tsx` | `@lastModified 2026-01-09 (Plan-094, REQ-175)` |
| `VideoCaptureStep.tsx` | `@lastModified 2026-01-09 (Plan-094, REQ-175)` |
| `PhotoCaptureStep.tsx` | `@lastModified 2026-01-09 (Plan-094, REQ-175)` |
| `UrlInputStep.tsx` | `@lastModified 2026-01-09 (Plan-094, REQ-175)` |

---

## Authorized Files and Functions for Modification

### Documentation Files

| File Path | Modification Type | Specific Sections |
|-----------|-------------------|-------------------|
| `src/components/ItemCreationWorkflow/README.md` | MODIFY | Workflow Steps, Exports, Related Docs |
| `src/components/ItemCreationWorkflow/utils/constants.ts` | MODIFY | JSDoc comments for WORKFLOW_STEPS, PURPOSE_TYPES, PROGRESS_WEIGHTS |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` | MODIFY | JSDoc header, PurposeType docs, CurrentItemState docs |

### Component Files (JSDoc Headers Only)

| File Path | Modification Type | Specific Area |
|-----------|-------------------|---------------|
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | MODIFY | JSDoc header only |
| `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts` | MODIFY | JSDoc header, STEP_TRANSITIONS comment |
| `src/components/ItemCreationWorkflow/components/steps/PurposeStep.tsx` | ADD | Complete JSDoc header |
| `src/components/ItemCreationWorkflow/components/shared/ContentPreview.tsx` | ADD | Complete JSDoc header |
| `src/components/ItemCreationWorkflow/utils/titleGenerator.ts` | ADD | Complete JSDoc header |
| `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx` | MODIFY | Update JSDoc header |
| `src/components/ItemCreationWorkflow/components/steps/NextActionStep.tsx` | MODIFY | Update JSDoc header |
| `src/components/ItemCreationWorkflow/components/steps/ContentTypeStep.tsx` | MODIFY | Update JSDoc header |
| `src/components/ItemCreationWorkflow/components/steps/TextEditorStep.tsx` | MODIFY | Update JSDoc header |
| `src/components/ItemCreationWorkflow/components/steps/FileUploadStep.tsx` | MODIFY | Update JSDoc header |
| `src/components/ItemCreationWorkflow/components/steps/VideoCaptureStep.tsx` | MODIFY | Update JSDoc header |
| `src/components/ItemCreationWorkflow/components/steps/PhotoCaptureStep.tsx` | MODIFY | Update JSDoc header |
| `src/components/ItemCreationWorkflow/components/steps/UrlInputStep.tsx` | MODIFY | Update JSDoc header |

### Index/Export Files (if needed)

| File Path | Modification Type |
|-----------|-------------------|
| `src/components/ItemCreationWorkflow/index.ts` | VERIFY | Exports include new components |
| `src/components/ItemCreationWorkflow/utils/index.ts` | VERIFY | Exports include titleGenerator |
| `src/components/ItemCreationWorkflow/components/shared/index.ts` | VERIFY | Exports include ContentPreview |
| `src/components/ItemCreationWorkflow/components/steps/index.ts` | VERIFY | Exports include PurposeStep |

---

## Verification Checklist

### Pre-Implementation
- [ ] All Plan-094 phases are complete
- [ ] New components exist and are functional
- [ ] WORKFLOW_STEPS has been updated in code

### Documentation Updates
- [ ] WORKFLOW_STEPS comments updated
- [ ] PURPOSE_TYPES documented
- [ ] PROGRESS_WEIGHTS commented
- [ ] All modified component JSDoc headers updated
- [ ] All new component JSDoc headers added
- [ ] README workflow diagram updated
- [ ] README exports section updated
- [ ] @lastModified dates added to all modified files

### Post-Implementation
- [ ] No documentation references removed `content-source-selection` step
- [ ] All code examples in README execute correctly
- [ ] JSDoc generates valid TypeDoc output (if using)
- [ ] IDE intellisense shows updated documentation

---

## Dependencies

### Prerequisites
- All Plan-094 phases (1-5) completed
- New components implemented: PurposeStep, ContentPreview, titleGenerator
- PreviewSaveStep redesign complete
- Navigation removal from content input steps complete

### Blocks
- None - documentation can be done after implementation

---

## Estimated Effort

| Task | Estimate |
|------|----------|
| 6.4.1 - WORKFLOW_STEPS comments | 30-45 mins |
| 6.4.2 - Component JSDoc comments | 1-2 hours |
| 6.4.3 - README updates | 45-60 mins |
| 6.4.4 - @lastModified timestamps | 15-20 mins |
| **Total** | **2.5-4 hours** |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Outdated references missed | Medium | Low | Grep for old step names |
| Code examples outdated | Low | Medium | Test examples after update |
| TypeDoc compatibility | Low | Low | Verify JSDoc syntax |
| Missing file updates | Medium | Low | Use checklist systematically |

---

## References

- **Implementation Plan**: `/docs/prd/Plan-094-UI-UX-Workflow-Improvements.md`
- **Current README**: `/src/components/ItemCreationWorkflow/README.md`
- **Constants File**: `/src/components/ItemCreationWorkflow/utils/constants.ts`
- **Types File**: `/src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts`
- **State Hook**: `/src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`
- **Previous Documentation Task**: `docs/REQ-118-documentation-updates-overview.md`

---

## Appendix A: Full WORKFLOW_STEPS Documentation Template

```typescript
// =============================================================================
// Workflow Configuration
// =============================================================================

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
 * @see STEP_TRANSITIONS for navigation logic
 * @see PROGRESS_WEIGHTS for progress calculation
 * @lastModified 2026-01-09 (Plan-094, REQ-175)
 */
export const WORKFLOW_STEPS = [
  'room-selection',
  'item-type-selection',
  'specific-item-selection',
  'purpose-selection',
  'content-type-selection',
  'content-creation',
  'preview-save',
  'next-action',
  'session-summary',
] as const;
```

---

## Appendix B: README Workflow Diagram (Complete)

```markdown
## Workflow Steps

The workflow guides users through a 9-step process:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ITEM CREATION WORKFLOW                            │
│                        (Updated Plan-094 Jan 2026)                         │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────┐
│ 1. Room Selection   │  ◄── Select room (kitchen, bedroom, bathroom, etc.)
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ 2. Item Type        │  ◄── Select: appliance | room-item | general-info
└──────────┬──────────┘      [SKIPS if "General" room selected]
           │
           ▼
┌─────────────────────┐
│ 3. Specific Item    │  ◄── Name item (suggestions or custom input)
└──────────┬──────────┘      Auto-generates item name: "Room - Item"
           │
           ▼
┌─────────────────────┐
│ 4. Purpose          │  ◄── NEW: Select purpose/intent category
└──────────┬──────────┘      Drives article title: "Purpose - Item"
           │
           ▼
┌─────────────────────┐
│ 5. Content Type     │  ◄── Select: Record Video | Take Photo | Write Text |
└──────────┬──────────┘             Upload File | Add Link
           │                  [CONSOLIDATED from old content-source step]
           ▼
┌─────────────────────┐
│ 6. Content Creation │  ◄── Create/capture content (integrates ItemCapture)
└──────────┬──────────┘      Multi-content support (up to 10 pieces)
           │
           ▼
┌─────────────────────┐
│ 7. Preview & Save   │  ◄── REDESIGNED: Shows actual content previews
└──────────┬──────────┘      Pre-filled: title (editable), room, type, purpose
           │                  Small "+ Add More" link (not large CTAs)
           ▼
┌─────────────────────┐
│ 8. Next Action      │  ◄── SIMPLIFIED: 3 options only
└──────────┬──────────┘      • Review & Submit → Session Summary
           │                  • Add More Content → Back to Content Source
           │                  • Cancel → Confirmation Dialog
           ▼
┌─────────────────────┐
│ 9. Session Summary  │  ◄── Review all items, batch QR generation
└─────────────────────┘      Print options: PDF download or direct print
```
```

---

*Document generated as Technical Lead overview for REQ-175 Documentation Update implementation.*
