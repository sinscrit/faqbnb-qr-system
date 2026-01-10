# REQ-162: Consolidate Content Options into Single Selection Grid

**Document Type:** Technical Implementation Overview
**Request ID:** REQ-162
**Phase:** 3 - Remove Redundant Step & Update Labels
**Task ID:** 3.3
**Created:** 2026-01-09 21:15:00 UTC
**Last Modified:** 2026-01-09 21:15:00 UTC
**Implementation Plan Reference:** `/docs/prd/Plan-094-UI-UX-Workflow-Improvements.md`

---

## Executive Summary

This task consolidates the content selection experience by merging the options from `ContentSourceStep` into `ContentTypeStep`, displaying all five content creation methods in a unified grid layout. Users will see **Record Video**, **Take Photo**, **Write Text**, **Upload File** (with subtitle showing supported formats), and **Add Link** in a single view, eliminating the need for a separate content source selection step.

---

## Current State Analysis

### Current Workflow Flow
The existing implementation requires users to navigate through two separate steps:

1. **ContentSourceStep** (`content-source-selection`): User chooses between:
   - "I have content" (upload existing files)
   - "Create now" (record/capture new content)

2. **ContentTypeStep** (`content-type-selection`): Based on the source choice, displays filtered options:
   - If "existing": Upload Video, Upload Photo, Upload PDF, Paste Text, Paste URL
   - If "create-new": Record Video, Take Photo, Write Text

### Current Implementation Files

| File | Description |
|------|-------------|
| `ContentSourceStep.tsx` | Lines 1-256: Two-card selection component for existing vs create-new |
| `ContentTypeStep.tsx` | Lines 1-305: Grid of content type options filtered by source selection |
| `constants.ts` | Lines 150-163: `CONTENT_SOURCE_OPTIONS` mapping source to type labels |
| `useWorkflowState.ts` | Lines 76-86: `STEP_TRANSITIONS` defining content-source-selection → content-creation |
| `ItemCreationWorkflow.tsx` | Lines 478-496: Renders both ContentSourceStep and ContentTypeStep |

### Current State Machine Flow
```
specific-item-selection → content-source-selection → content-creation
                              ↓
                    (currently skips content-type-selection)
```

---

## Target State Design

### New Unified Content Options Grid

Display all 5 content options in a single grid layout:

| Option | Label | Subtitle | Icon | Content Type | Content Source |
|--------|-------|----------|------|--------------|----------------|
| 1 | Record Video | - | `Video` | `video` | `create-new` |
| 2 | Take Photo | - | `Camera` | `photo` | `create-new` |
| 3 | Write Text | - | `PenLine` | `text` | `create-new` |
| 4 | Upload File | Video, Image, PDF, Text | `Upload` | (varies by file) | `existing` |
| 5 | Add Link | - | `Link` | `url` | `existing` |

### New Workflow Flow
```
specific-item-selection → content-type-selection → content-creation
     (purpose-selection before specific-item in full Plan-094)
```

The `content-source-selection` step is removed entirely, and `ContentTypeStep` becomes the unified content selection interface.

---

## Technical Approach

### Approach A: Modify ContentTypeStep (Recommended)

Enhance `ContentTypeStep` to:
1. Always display all 5 unified content options (not filtered by source)
2. Determine `contentSource` internally based on which option is selected
3. Set both `contentType` and `contentSource` in state when an option is selected
4. Add subtitle support for the "Upload File" option

**Pros:**
- Reuses existing component structure and keyboard navigation
- Less code to modify overall
- Follows existing card-based UI patterns

**Cons:**
- Need to handle the "Upload File" option differently (it triggers file upload flow)

### Approach B: Replace ContentTypeStep with New Component

Create an entirely new `UnifiedContentStep` component.

**Pros:**
- Clean slate implementation
- No legacy code to work around

**Cons:**
- More code duplication
- Loses tested keyboard navigation logic
- Requires more extensive testing

### Selected Approach: **A (Modify ContentTypeStep)**

---

## Implementation Details

### 1. Create Unified Content Options Constant

Add new constant in `constants.ts`:

```typescript
export interface UnifiedContentOption {
  id: string;
  label: string;
  subtitle?: string;
  icon: LucideIcon;
  contentType: ContentType | 'file-upload';
  contentSource: 'existing' | 'create-new';
}

export const UNIFIED_CONTENT_OPTIONS: UnifiedContentOption[] = [
  { id: 'record-video', label: 'Record Video', icon: Video, contentType: 'video', contentSource: 'create-new' },
  { id: 'take-photo', label: 'Take Photo', icon: Camera, contentType: 'photo', contentSource: 'create-new' },
  { id: 'write-text', label: 'Write Text', icon: PenLine, contentType: 'text', contentSource: 'create-new' },
  { id: 'upload-file', label: 'Upload File', subtitle: 'Video, Image, PDF, Text', icon: Upload, contentType: 'file-upload', contentSource: 'existing' },
  { id: 'add-link', label: 'Add Link', icon: Link, contentType: 'url', contentSource: 'existing' },
];
```

### 2. Update ContentTypeStep Props

Modify props to support unified selection:

```typescript
export interface ContentTypeStepProps {
  /** Current selected content type from state (optional, for pre-selection) */
  currentContentType: ContentType | null;
  /** Handler when a content option is selected */
  onSelectContent: (contentType: ContentType | 'file-upload', contentSource: 'existing' | 'create-new') => void;
  /** Handler for proceeding to next step */
  onNext: () => void;
  /** Whether next step navigation is allowed */
  canNext: boolean;
  /** Optional CSS class name */
  className?: string;
}
```

### 3. Update ContentTypeStep Component

Key changes to `ContentTypeStep.tsx`:

1. **Remove source filtering logic** - Display all options always
2. **Add subtitle rendering** - For the "Upload File" option
3. **Update selection handler** - Set both contentType and contentSource
4. **Update header text** - Use unified messaging
5. **Handle 'file-upload' selection** - This triggers FileUploadStep which allows multiple file types

### 4. Update State Machine

Modify `useWorkflowState.ts`:

```typescript
export const STEP_TRANSITIONS: Record<WorkflowStep, WorkflowStep[]> = {
  // ... other transitions
  'specific-item-selection': ['content-type-selection'], // Skip content-source-selection
  'content-type-selection': ['content-creation'],
  // Remove content-source-selection from transitions
};
```

### 5. Update ItemCreationWorkflow.tsx

1. Remove `ContentSourceStep` import and rendering case
2. Update `ContentTypeStep` rendering to use new props
3. Update handlers to receive both contentType and contentSource

### 6. Handle File Upload Selection

When "Upload File" is selected:
- Set `contentSource` to `'existing'`
- Set `contentType` based on the file type detected after upload
- Route to `FileUploadStep` which supports multiple file types

---

## Files Requiring Modification

### Primary Files

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `src/components/ItemCreationWorkflow/components/steps/ContentTypeStep.tsx` | **MAJOR MODIFY** | Consolidate all 5 options, add subtitle support, update selection logic |
| `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts` | MODIFY | Update `STEP_TRANSITIONS` to skip content-source-selection |
| `src/components/ItemCreationWorkflow/utils/constants.ts` | MODIFY | Add `UNIFIED_CONTENT_OPTIONS` constant |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | MODIFY | Remove ContentSourceStep rendering, update ContentTypeStep props |

### Secondary Files

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `src/components/ItemCreationWorkflow/components/steps/ContentSourceStep.tsx` | DELETE or DEPRECATE | No longer needed in workflow |
| `src/components/ItemCreationWorkflow/components/steps/index.ts` | MODIFY | Update exports (remove ContentSourceStep if deleted) |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` | MODIFY (if needed) | Update if WorkflowStep type needs adjustment |

---

## Authorized Files and Functions for Modification

### Authorized for Modification

#### `ContentTypeStep.tsx`
- `EXISTING_CONTENT_OPTIONS` constant (lines 63-69) - **REPLACE** with unified options
- `CREATE_NEW_OPTIONS` constant (lines 71-75) - **REMOVE**
- `ContentTypeCard` component (lines 88-166) - **MODIFY** to support subtitle
- `ContentTypeStep` component (lines 172-304) - **MAJOR MODIFY**:
  - Remove `currentContentSource` prop dependency
  - Remove source-based filtering logic (lines 181-185)
  - Update header text (lines 196-202)
  - Update selection handler (lines 205-211)

#### `useWorkflowState.ts`
- `STEP_TRANSITIONS` constant (lines 76-86) - **MODIFY** specific-item-selection transition

#### `constants.ts`
- Add `UNIFIED_CONTENT_OPTIONS` constant after `CONTENT_SOURCE_OPTIONS` (after line 163)

#### `ItemCreationWorkflow.tsx`
- Import statements (line 23) - Remove ContentSourceStep
- `renderCurrentStep` function (lines 439-549):
  - Remove `case 'content-source-selection'` (lines 478-486)
  - Update `case 'content-type-selection'` (lines 487-496)

#### `ContentSourceStep.tsx`
- Entire file - Authorized for **DELETE** or marking as deprecated

#### `components/steps/index.ts`
- Export statements - Remove ContentSourceStep export if deleted

---

## Integration Contract

### New ContentTypeStep Interface

```typescript
interface ContentTypeStepProps {
  /** Current selected unified option id (for visual state) */
  currentSelection: string | null;
  /** Handler when content option is selected */
  onSelectContent: (
    contentType: ContentType | 'file-upload',
    contentSource: 'existing' | 'create-new'
  ) => void;
  /** Handler for proceeding to next step */
  onNext: () => void;
  /** Whether next step navigation is allowed */
  canNext: boolean;
  /** Optional CSS class name */
  className?: string;
}
```

### Selection Handler in ItemCreationWorkflow

```typescript
const handleUnifiedContentSelect = useCallback((
  contentType: ContentType | 'file-upload',
  contentSource: 'existing' | 'create-new'
) => {
  selectContentSource(contentSource);
  if (contentType !== 'file-upload') {
    selectContentType(contentType as ContentType);
  }
  // For 'file-upload', contentType is determined after file selection
  nextStep();
}, [selectContentSource, selectContentType, nextStep]);
```

---

## Acceptance Criteria Mapping

| Requirement | Implementation |
|-------------|----------------|
| Single content selection screen displays all five options | `ContentTypeStep` renders `UNIFIED_CONTENT_OPTIONS` |
| All options presented with equal visual weight | Same `ContentTypeCard` component used for all |
| "Upload File" displays subtitle | `subtitle` prop in card component |
| Users can select and immediately proceed | Auto-advance on selection (existing pattern) |
| Grid layout adapts responsively | Existing responsive grid classes maintained |
| Selection state clearly indicated | Existing selected state styling preserved |
| Workflow navigation routes correctly | `STEP_TRANSITIONS` updated |
| No redundant selection steps remain | `content-source-selection` removed from workflow |

---

## Testing Requirements

### Unit Tests

1. **ContentTypeStep renders all 5 options**
   - Verify all unified options are displayed
   - Verify subtitle displays for "Upload File"

2. **Selection triggers correct state updates**
   - Record Video → contentType: 'video', contentSource: 'create-new'
   - Take Photo → contentType: 'photo', contentSource: 'create-new'
   - Write Text → contentType: 'text', contentSource: 'create-new'
   - Upload File → contentSource: 'existing' (contentType TBD)
   - Add Link → contentType: 'url', contentSource: 'existing'

3. **Keyboard navigation works for 5-option grid**
   - Arrow key navigation
   - Enter/Space selection
   - Roving tabindex pattern

4. **Accessibility attributes present**
   - Role="radiogroup"
   - Aria-checked states
   - Screen reader announcements

### Integration Tests

1. **Workflow skips content-source-selection**
   - Verify specific-item-selection → content-type-selection transition

2. **Content creation receives correct context**
   - ContentCreationStep receives expected contentType and contentSource

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking existing keyboard navigation | Medium | Medium | Preserve existing `createKeyboardNavigator` pattern |
| File upload type detection issues | Low | Low | FileUploadStep already handles multi-type detection |
| Mobile layout issues with 5 options | Low | Medium | Use existing responsive 1/2 column grid |
| State machine conflicts | Low | High | Comprehensive testing of step transitions |

---

## Dependencies

### Prerequisite Tasks (from Plan-094)
- Task 3.1: Remove ContentSourceStep from workflow steps (must complete first)
- Task 3.2: Update ContentTypeStep labels (can be combined with this task)

### Dependent Tasks
- Task 4.x: Navigation cleanup tasks (after this completes)

---

## Effort Estimate

| Activity | Estimate |
|----------|----------|
| Update constants.ts with unified options | 15 min |
| Modify ContentTypeStep component | 1-2 hours |
| Update useWorkflowState transitions | 15 min |
| Update ItemCreationWorkflow rendering | 30 min |
| Remove/deprecate ContentSourceStep | 15 min |
| Unit tests | 1 hour |
| Integration testing | 30 min |
| **Total** | **3-4 hours** |

---

## References

- **PRD Source:** `/docs/prd/FAQBNB_Application_Review.pdf`
- **Implementation Plan:** `/docs/prd/Plan-094-UI-UX-Workflow-Improvements.md` (Phase 3, Task 3.3)
- **Request Definition:** `/docs/gen_requests.md` (REQ-162)
- **Related Requests:** REQ-160 (Remove ContentSourceStep), REQ-161 (Update labels)
- **Current Implementation:**
  - ContentTypeStep: `/src/components/ItemCreationWorkflow/components/steps/ContentTypeStep.tsx`
  - ContentSourceStep: `/src/components/ItemCreationWorkflow/components/steps/ContentSourceStep.tsx`
  - State Machine: `/src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`
  - Main Workflow: `/src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`
