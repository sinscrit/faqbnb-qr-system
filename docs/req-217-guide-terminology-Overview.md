# Implementation Overview: Replace "Instructions" Terminology with "Guide" Throughout Application

## Header
| Field | Value |
|-------|-------|
| Request Reference | #217 |
| Source File | docs/gen_requests.md |
| Original Request Date | 2026-01-13 09:02 |
| Breakdown Created | 2026-01-13 09:06:44 |
| T-shirt Size | M |
| Estimated Effort | 4-6 hours |

## Goals
Replace all user-facing occurrences of "Instructions" terminology with "Guide/Guides" throughout the application interface. This includes:

1. Navigation items and mobile labels
2. Page titles and headings
3. Table column headers (both full and abbreviated forms)
4. Sort options and dropdown labels
5. Empty state messages
6. Button labels and action cards
7. Success/error messages
8. aria-labels and accessibility text
9. Descriptive text and subtitles

### Assumptions & Clarifications
- Internal code variable names, function names, and type definitions remain unchanged (per request scope)
- File/folder names remain unchanged (e.g., `/dashboard/instructions`, `InstructionsTable.tsx`)
- Only user-facing strings (JSX text content, labels, descriptions) are modified
- The mapping is: "Instructions" -> "Guides" (plural), "Instruction" -> "Guide" (singular)
- Mobile abbreviated labels "Instr." -> "Guide" (fits in similar space)
- Test file strings that assert on user-facing text will need updates

## Implementation Plan

### Step 1: Update Navigation Items
- **Description**: Change navigation menu labels across dashboard layouts
- **Rationale**: Navigation is the primary entry point for terminology; updating this first ensures consistent user experience
- **Estimated Effort**: S (30 minutes)

### Step 2: Update Page Headers and Titles
- **Description**: Modify page titles, headings, and subtitle descriptions on Instructions-related pages
- **Rationale**: Page headers are prominent user-facing elements that establish context
- **Estimated Effort**: S (30 minutes)

### Step 3: Update Table Headers and Column Labels
- **Description**: Change "Instructions" column headers in ItemList and related components, including abbreviated forms
- **Rationale**: Tables display the terminology prominently; both full and abbreviated forms need updating
- **Estimated Effort**: S (30 minutes)

### Step 4: Update Sort Options and Constants
- **Description**: Modify sort option labels like "Most Instructions" -> "Most Guides"
- **Rationale**: Dropdown labels visible during user interaction need consistency
- **Estimated Effort**: S (20 minutes)

### Step 5: Update Empty States and Messages
- **Description**: Change empty state messages, error messages, and user feedback text
- **Rationale**: Empty states guide users; consistent terminology helps understanding
- **Estimated Effort**: M (45 minutes)

### Step 6: Update Action Cards and Buttons
- **Description**: Modify button labels like "Edit Instructions", "Add New Instructions"
- **Rationale**: Call-to-action elements are high-visibility user touchpoints
- **Estimated Effort**: S (30 minutes)

### Step 7: Update Accessibility Text (aria-labels)
- **Description**: Change aria-labels and screen reader text for accessibility compliance
- **Rationale**: Accessibility text must match visual terminology for consistent experience
- **Estimated Effort**: S (30 minutes)

### Step 8: Update Metadata and SEO Text
- **Description**: Modify app metadata description that mentions "instructions"
- **Rationale**: SEO/meta descriptions should reflect updated terminology
- **Estimated Effort**: S (15 minutes)

### Step 9: Update Test Assertions
- **Description**: Fix test files that assert on the old "Instructions" text
- **Rationale**: Tests must pass with new terminology; this is cleanup work
- **Estimated Effort**: M (1 hour)

## Authorized Files and Functions for Modification

> **APPROVED SCOPE**: Changes outside this list require review

### Navigation Items (Step 1)
| File | Target | Type |
|------|--------|------|
| `src/components/RoleBasedNavigation.tsx` | Line 91: `name: 'Instructions'` | Modify |
| `src/components/RoleBasedNavigation.tsx` | Line 92: `mobileName: 'Instr.'` | Modify |
| `src/components/RoleBasedNavigation.tsx` | Line 95: `description: 'View and manage instructions'` | Modify |
| `src/components/RoleBasedNavigation.tsx` | Line 354: `name: 'Instructions'` | Modify |
| `src/components/RoleBasedNavigation.tsx` | Line 355: `mobileName: 'Instr.'` | Modify |
| `src/components/RoleBasedNavigation.tsx` | Line 358: `description: 'View and manage instructions'` | Modify |
| `src/components/DashboardLayout.tsx` | Line 248: `'Instructions'` badge text | Modify |
| `src/app/dashboard/layout.tsx` | Line 97: `name: 'Instructions'`, `mobileName: 'Instr.'` | Modify |
| `src/app/dashboard2/layout.tsx` | Line 53-54: `name: 'Instructions'`, `mobileLabel: 'Instr.'` | Modify |

### Page Headers and Titles (Step 2)
| File | Target | Type |
|------|--------|------|
| `src/app/dashboard/instructions/page.tsx` | Line 84-85: Page title "Instructions" | Modify |
| `src/app/dashboard/instructions/page.tsx` | Line 88: Subtitle "View and manage instructions for your items" | Modify |
| `src/app/dashboard/instructions/page.tsx` | Line 115-119: "Instructions Coming Soon" and descriptions | Modify |
| `src/app/dashboard/instructions/page.tsx` | Line 46: "Please log in to access instructions" | Modify |
| `src/app/dashboard/instructions/page.tsx` | Line 63: "You do not have permission to view instructions" | Modify |
| `src/app/dashboard2/instructions/page.tsx` | Line 267-268: Page title "Instructions" | Modify |
| `src/app/dashboard2/instructions/page.tsx` | Line 272: Subtitle "Manage instruction articles for your items" | Modify |
| `src/app/dashboard2/instructions/page.tsx` | Line 155: "Please log in to access instructions" | Modify |
| `src/app/dashboard2/instructions/page.tsx` | Line 172: "Loading instructions..." | Modify |
| `src/app/dashboard2/instructions/page.tsx` | Line 183: "Error Loading Instructions" | Modify |
| `src/app/dashboard2/instructions/page.tsx` | Line 202-204: "No instructions yet" and descriptions | Modify |
| `src/app/dashboard2/instructions/page.tsx` | Line 246: "Instruction updated successfully" | Modify |
| `src/app/dashboard2/instructions/[articleId]/edit/page.tsx` | Line 233: "Back to Instructions" | Modify |

### Table Headers and Column Labels (Step 3)
| File | Target | Type |
|------|--------|------|
| `src/components/ItemManager/components/ItemList.tsx` | Line 142: `label="Instructions"` | Modify |
| `src/components/ItemManager/components/ItemList.tsx` | Line 152: `<span>Instructions</span>` | Modify |
| `src/components/ItemManager/components/ItemList.tsx` | Line 153: `<span>Instr.</span>` (mobile) | Modify |
| `src/components/InstructionsTable/InstructionsTable.tsx` | Line 128: "No instructions available" | Modify |

### Sort Options and Constants (Step 4)
| File | Target | Type |
|------|--------|------|
| `src/components/ItemManager/utils/sortUtils.ts` | Line 61: `'Most Instructions'` | Modify |
| `src/components/ItemManager/utils/sortUtils.ts` | Line 62: `'Fewest Instructions'` | Modify |
| `src/components/ItemManager/utils/constants.ts` | Line 39: `'Most Instructions'` | Modify |
| `src/components/ItemManager/utils/constants.ts` | Line 40: `'Fewest Instructions'` | Modify |

### Empty States and Messages (Step 5)
| File | Target | Type |
|------|--------|------|
| `src/components/ItemEditForm/ItemInstructionsList.tsx` | Line 62: Section heading "Instructions" | Modify |
| `src/components/ItemEditForm/ItemInstructionsList.tsx` | Line 83: Section heading "Instructions" | Modify |
| `src/components/ItemEditForm/ItemInstructionsList.tsx` | Line 87: "No instructions yet" | Modify |
| `src/components/ItemEditForm/ItemInstructionsList.tsx` | Line 88: "Instructions for this item will appear here" | Modify |
| `src/components/ItemEditForm/ItemInstructionsList.tsx` | Line 97: Section heading "Instructions" | Modify |
| `src/components/ItemManager/components/ItemPreview/InstructionsViewer.tsx` | Line 78: `headerText = 'Instructions'` (default prop) | Modify |
| `src/components/ItemManager/components/ItemPreview/InstructionsViewer.tsx` | Line 114: "No instructions provided." | Modify |
| `src/components/ItemCapture/components/steps/ReviewStep.tsx` | Line 616: "Instructions" heading | Modify |
| `src/components/ItemCapture/components/steps/ReviewStep.tsx` | Line 636: "No instructions added." | Modify |
| `src/components/ItemCapture/components/steps/ReviewStep.tsx` | Line 642: "Add instructions" link | Modify |

### Action Cards and Buttons (Step 6)
| File | Target | Type |
|------|--------|------|
| `src/components/ItemCapture/components/steps/WhatsNextStep.tsx` | Line 196: `title="Edit Instructions"` | Modify |
| `src/components/ItemCapture/components/steps/WhatsNextStep.tsx` | Line 197: `description="Review and modify the instructions you just created"` | Modify |
| `src/components/ItemCapture/components/steps/WhatsNextStep.tsx` | Line 204: `title="Add New Instructions"` | Modify |
| `src/components/ItemCapture/components/steps/WhatsNextStep.tsx` | Line 205: `description="Create different instructions for..."` | Modify |
| `src/components/ItemCapture/components/steps/ContentTypeStep.tsx` | Line 62: `'Capture video instructions'` | Modify |
| `src/components/ItemCapture/components/steps/ContentTypeStep.tsx` | Line 74: `'Create written instructions'` | Modify |
| `src/components/ItemCapture/components/steps/TextEditorStep.tsx` | Line 441: "Write Instructions" heading | Modify |
| `src/components/ItemCapture/components/steps/TextEditorStep.tsx` | Line 443: "Add text-based instructions..." | Modify |
| `src/components/ItemCapture/components/steps/TextEditorStep.tsx` | Line 471: placeholder text | Modify |

### Accessibility Text (Step 7)
| File | Target | Type |
|------|--------|------|
| `src/components/ItemManager/components/ItemRow.tsx` | Line 345: aria-label with "instructions" | Modify |
| `src/components/ItemManager/components/ItemPreview/InstructionsViewer.tsx` | Line 76: `ariaLabel = 'Item instructions'` | Modify |
| `src/components/ItemCapture/components/steps/ReviewStep.tsx` | Line 611: `aria-labelledby="instructions-heading"` | No change (id reference) |
| `src/components/ItemCapture/components/steps/ReviewStep.tsx` | Line 622: `aria-label="Edit instructions"` | Modify |

### Preview/Context Display Components (Step 5 continued)
| File | Target | Type |
|------|--------|------|
| `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx` | Line 200: Fallback title `'Instructions'` | Modify |
| `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx` | Line 245: "Article / Instructions" subheading | Modify |
| `src/components/ItemCreationWorkflow/components/shared/ItemContextDisplay.tsx` | Line 92: "Editing Instruction For:" | Modify |
| `src/components/InstructionEditor/components/ReadOnlyContextSection.tsx` | Line 33: "Editing Instruction For:" | Modify |
| `src/components/InstructionEditor/components/ContentEditSection.tsx` | Line 289: "leave this instruction empty" | Modify |

### Metadata and SEO (Step 8)
| File | Target | Type |
|------|--------|------|
| `src/app/layout.tsx` | Line 21: metadata description with "instructions" | Modify |
| `src/app/page.tsx` | Line 123: Hero heading "Any Item's Instructions" | Modify |
| `src/components/ItemDisplay.tsx` | Line 191: "Instructions & Resources" heading | Modify |

### Test Files (Step 9)
| File | Target | Type |
|------|--------|------|
| `src/app/dashboard/instructions/__tests__/page.test.tsx` | Multiple assertions on "Instructions" text | Modify |
| `src/components/ItemCapture/components/steps/__tests__/WhatsNextStep.test.tsx` | Assertions on button names | Modify |
| `src/components/ItemCapture/components/steps/__tests__/ContentTypeStep.test.tsx` | Line 180, 182: radio button names | Modify |
| `src/components/ItemCreationWorkflow/components/steps/__tests__/NextActionStep.test.tsx` | Multiple assertions | Modify |
| `src/components/ItemCreationWorkflow/components/steps/__tests__/PreviewSaveStep.test.tsx` | Multiple assertions | Modify |
| `src/app/dashboard2/__tests__/layout.test.tsx` | Line 76: expects "Instructions" | Modify |

## Dependencies

### Internal Dependencies
- None - This is a standalone terminology change

### External Dependencies
- None

## Risks and Considerations

### Potential Side Effects
- **URL Routes**: Routes remain `/dashboard/instructions` - consider if URL should also change (out of scope for this request)
- **Database/API**: If any API responses include "instructions" terminology, those would need backend changes (not observed in current scope)
- **Translation/i18n**: If the app supports internationalization, translation files would need updates
- **Documentation**: External documentation may reference "Instructions" terminology

### Testing Requirements
- Manual testing of all dashboard views to verify terminology consistency
- Screen reader testing to verify accessibility text updates
- Mobile viewport testing to verify abbreviated labels fit properly
- Unit test suite must pass after test assertion updates

### Open Questions
- [ ] Should the URL routes also change from `/instructions` to `/guides`? (Recommend separate request if needed)
- [ ] Are there any backend API responses that include "instructions" text that should be updated?
- [ ] Is there external documentation that references the "Instructions" terminology?

## Out of Scope
Per the original request:
- **Code variable names**: Internal variable names like `instructions`, `setInstructions`, `onEditInstructions` remain unchanged
- **File/folder names**: Files like `InstructionsTable.tsx`, folders like `/instructions/` remain unchanged
- **Type definitions**: Interfaces like `InstructionRow`, `InstructionsTableProps` remain unchanged
- **URL routes**: Path segments like `/dashboard/instructions` remain unchanged
- **Test page content**: Test harness pages in `/test/` folder that use "instructions" for testing purposes

---
*Document generated: 2026-01-13 09:06:44*
