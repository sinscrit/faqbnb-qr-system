# Implementation Overview: Edit Instruction Flow

## Header
| Field | Value |
|-------|-------|
| Request Reference | #213 |
| Source File | docs/gen_requests.md |
| Original Request Date | 2026-01-12 |
| Breakdown Created | 2026-01-12 21:23:47 CET |
| T-shirt Size | L |
| Estimated Effort | 3-4 days |

## Goals
Implement an edit workflow that allows property owners to modify existing instruction articles by reusing the ItemCreationWorkflow component in "edit mode". The system should pre-populate item context (room, item type, specific item, purpose) as read-only fields, load existing content pieces from the database, and allow users to add, remove, or reorder content. Changes should be persisted to the existing `item_articles` and `item_links` records without creating new items.

### Assumptions & Clarifications
- The edit mode will reuse the existing ItemCreationWorkflow component rather than creating a separate edit component
- Item context fields (room, item type, specific item name, purpose) will be displayed but not editable
- The workflow will start at the content selection step, bypassing the item context steps
- Users can add new content pieces, remove existing ones, and reorder all content
- Saving will update existing database records rather than creating new ones
- The route pattern will be `/dashboard2/instructions/[articleId]/edit`
- REQ-212 (Instructions List Page) is already implemented and provides the navigation entry point

## Implementation Plan

### Step 1: Create Edit Page Route
- **Description**: Create a new dynamic route page at `/dashboard2/instructions/[articleId]/edit` that will host the edit workflow
- **Rationale**: Establishes the URL structure and page component that will handle the edit mode
- **Estimated Effort**: S (2 hours)

### Step 2: Add getArticle API Client Method
- **Description**: Add a client-side API method `adminApi.getArticle(articleId)` to fetch a single article with its associated item data and content links
- **Rationale**: The API endpoint exists (`GET /api/admin/articles/[articleId]`) but needs a corresponding client method to be called from the edit page
- **Estimated Effort**: S (1 hour)

### Step 3: Extend ItemCreationWorkflow Types for Edit Mode
- **Description**: Add optional props to `ItemCreationWorkflowProps` to support edit mode: `editMode?: boolean`, `initialArticleId?: string`, `initialArticleData?: EditModeData`, and define the `EditModeData` type
- **Rationale**: The workflow needs to distinguish between create and edit modes, and receive the article data to pre-populate
- **Estimated Effort**: S (2 hours)

### Step 4: Implement Edit Data Loading Logic
- **Description**: Create a data loading function in the edit page that fetches the article, its associated item, and content pieces, then transforms them into the format expected by ItemCreationWorkflow
- **Rationale**: Must convert database structure (`ItemArticle` with nested `ItemLink[]`) to workflow structure (`CurrentItemState` with `ContentPiece[]`)
- **Estimated Effort**: M (4 hours)

### Step 5: Add Edit Mode Routing Logic to ItemCreationWorkflow
- **Description**: Modify ItemCreationWorkflow to detect edit mode and skip to content selection step (`content-type-selection`) instead of starting at `room-selection`
- **Rationale**: In edit mode, item context is already determined and should not be editable, so we bypass those steps
- **Estimated Effort**: M (3 hours)

### Step 6: Create Read-Only Item Context Display Component
- **Description**: Build a component that displays the item context (room, item type, item name, purpose) in a read-only format, shown at the top of the edit workflow
- **Rationale**: Users need to see the item context for orientation but should not be able to modify it
- **Estimated Effort**: M (3 hours)

### Step 7: Implement Edit Mode Save Handler
- **Description**: Create a new save handler `handleUpdateArticle` that uses `PUT /api/admin/articles/[articleId]` to update the article and manages adding/removing/reordering content links
- **Rationale**: Save behavior differs between create and edit modes; edit mode updates existing records instead of creating new ones
- **Estimated Effort**: L (6 hours)

### Step 8: Add Content Link Management Logic
- **Description**: Implement logic to track which content pieces are new (need INSERT), which are existing (need UPDATE), and which were removed (need DELETE) from the article
- **Rationale**: The API needs to know how to handle each content piece differently based on whether it existed before
- **Estimated Effort**: M (4 hours)

### Step 9: Update InstructionsTable Edit Handler
- **Description**: Modify the `handleEditArticle` function in `/dashboard2/instructions/page.tsx` to navigate to the new edit route
- **Rationale**: Connects the instructions list page to the edit workflow
- **Estimated Effort**: S (1 hour)

### Step 10: Add Cancel Navigation
- **Description**: Implement cancel behavior that returns users to `/dashboard2/instructions` without saving changes
- **Rationale**: Users need an escape route if they don't want to commit their edits
- **Estimated Effort**: S (1 hour)

### Step 11: Add Success Confirmation
- **Description**: After successful save, redirect to `/dashboard2/instructions` with a success toast/banner message
- **Rationale**: Provides clear feedback that changes were saved and returns user to the main instructions view
- **Estimated Effort**: S (2 hours)

### Step 12: Add Loading and Error States
- **Description**: Implement loading spinners during data fetch and save operations, and error handling with user-friendly messages
- **Rationale**: Improves user experience during async operations and provides feedback when issues occur
- **Estimated Effort**: M (3 hours)

### Step 13: Test Edit Workflow End-to-End
- **Description**: Manual testing of the complete edit flow including data loading, content modification, save, cancel, and error scenarios
- **Rationale**: Validates the integration works correctly before release
- **Estimated Effort**: M (4 hours)

## Authorized Files and Functions for Modification

> ⚠️ **APPROVED SCOPE**: Changes outside this list require review

### Edit Page Route (Step 1)
| File | Target | Type |
|------|--------|------|
| `src/app/dashboard2/instructions/[articleId]/edit/page.tsx` | — | Create |

### API Client (Step 2)
| File | Target | Type |
|------|--------|------|
| `src/lib/api.ts` | `adminApi.getArticle()` | Create |

### Type Definitions (Step 3)
| File | Target | Type |
|------|--------|------|
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` | `ItemCreationWorkflowProps` | Extend |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` | `EditModeData` interface | Create |

### Workflow Component (Steps 5, 6, 7, 8, 10, 11)
| File | Target | Type |
|------|--------|------|
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | Edit mode detection logic | Modify |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | Initial step routing | Modify |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | `handleUpdateArticle()` | Create |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | Content link diffing logic | Create |
| `src/components/ItemCreationWorkflow/components/shared/ItemContextDisplay.tsx` | — | Create |

### Instructions List Page (Step 9)
| File | Target | Type |
|------|--------|------|
| `src/app/dashboard2/instructions/page.tsx` | `handleEditArticle()` | Modify |

### Data Transformation (Step 4)
| File | Target | Type |
|------|--------|------|
| `src/app/dashboard2/instructions/[articleId]/edit/page.tsx` | `transformArticleToWorkflowState()` | Create |
| `src/app/dashboard2/instructions/[articleId]/edit/page.tsx` | `transformContentPiecesToLinks()` | Create |

## Dependencies

### Internal Dependencies
- REQ-212 (Instructions List Page) - **COMPLETED** - Provides navigation entry point
- REQ-208 (Separate Item from Article Types) - **COMPLETED** - Type definitions exist
- REQ-151 (Update API Endpoints) - **COMPLETED** - Article CRUD endpoints exist

### External Dependencies
- Existing ItemCreationWorkflow component
- Supabase database with `item_articles` and `item_links` tables
- Authentication system for user/account context

## Risks and Considerations

### Potential Side Effects
- ItemCreationWorkflow component may need careful refactoring to support both create and edit modes without breaking existing functionality
- Content piece ordering might conflict if users are editing the same article simultaneously (race condition)
- File uploads in edit mode need special handling - existing file URLs should be preserved, new files need uploading
- Removing content pieces needs cascade handling if they're referenced elsewhere

### Testing Requirements
- Integration testing for create mode to ensure no regressions
- Integration testing for edit mode with various article/content configurations
- Test with articles that have no content, single content, and multiple content pieces
- Test content reordering edge cases (first to last, last to first, etc.)
- Test cancel behavior to ensure no partial saves occur
- Test concurrent edit scenarios if possible
- Test file upload handling for new files in edit mode

### Open Questions
- [ ] Should we prevent editing if the article is being viewed by guests simultaneously?
- [ ] Do we need an audit trail for article edits (who edited what and when)?
- [ ] Should we support draft/publish workflow or are all edits immediately live?
- [ ] How should we handle orphaned content files when content pieces are removed?
- [ ] Should we show a "last edited by" timestamp on the article?
- [ ] Do we need optimistic locking to prevent overwriting concurrent edits?

## Out of Scope
- Editing the physical item itself (name, room, item type) - only article content is editable
- Creating new articles from the edit page - use the create workflow instead
- Bulk editing multiple articles at once
- Version history or undo functionality
- Real-time collaborative editing
- Editing item tags from the article edit view
- Deleting articles (this is a separate feature)

---
*Document generated: 2026-01-12 21:23:47 CET*
*Document modified: 2026-01-12 21:23:47 CET*
