# Implementation Plan: FAQBNB Review - Comprehensive Implementation

**Generated:** 2026-01-11 21:15:00
**Last Modified:** 2026-01-11 21:15:00
**Source PRD:** docs/prd/intake/prd-CPL-FAQBNB-Review-2026-01-11-20260111-204706.md

---

## Overview

This implementation plan addresses 5 change requests from the FAQBNB Application Review session dated 2026-01-11. The requests span UI/UX improvements, data model clarification, navigation updates, and workflow step count fixes. The plan provides a unified implementation strategy with proper dependency management to ensure all changes work cohesively.

**Priority Summary:**
- CRITICAL: 1 (REQ-2: Data Model)
- HIGH: 3 (REQ-1, REQ-3, REQ-5)
- MEDIUM: 1 (REQ-4)

---

## Technical Context

### Existing Stack
| Component | Technology | Location |
|-----------|------------|----------|
| Framework | Next.js 15.5.9 | `next.config.ts` |
| Language | TypeScript (strict mode) | `tsconfig.json` |
| React | React 19.1.0 | `package.json` |
| Styling | Tailwind CSS 4.x | `tailwind.config.*` |
| State Management | React Context + useReducer | `src/contexts/AuthContext.tsx` |
| Icons | Lucide React, Heroicons | `package.json` |
| Build Tool | Next.js Turbopack | `package.json` scripts |
| Database | Supabase (PostgreSQL) | Inferred from `@supabase/*` |
| Authentication | Supabase Auth | `src/lib/session.ts` |

### Key Components Identified
| Component | Location | Purpose |
|-----------|----------|---------|
| `DashboardLayout.tsx` | `src/components/` | Main dashboard wrapper with navigation |
| `RoleBasedNavigation.tsx` | `src/components/` | Navigation menu component |
| `UserDashboard.tsx` | `src/components/` | User dashboard with stats cards |
| `KPIDashboardOverview.tsx` | `src/components/` | Admin dashboard with KPI cards |
| `ItemCreationWorkflow.tsx` | `src/components/ItemCreationWorkflow/` | Multi-step item creation wizard |
| `useWorkflowState.ts` | `src/components/ItemCreationWorkflow/hooks/` | Workflow state machine |
| `NextActionStep.tsx` | `src/components/ItemCreationWorkflow/components/steps/` | "What's Next" screen |
| `PreviewSaveStep.tsx` | `src/components/ItemCreationWorkflow/components/steps/` | Save item step |
| `WorkflowHeader.tsx` | `src/components/ItemCreationWorkflow/components/shared/` | Step indicator header |
| `constants.ts` | `src/components/ItemCreationWorkflow/utils/` | Workflow step definitions |

### Data Model Types
| Type | Location | Purpose |
|------|----------|---------|
| `Item` | `src/types/index.ts` | Physical item entity |
| `ItemArticle` | `src/types/index.ts` | Article/instructions entity |
| `PurposeType` | `src/types/index.ts` | Article purpose categories |
| `ItemLink` | `src/types/index.ts` | Content links |

### New Dependencies Required
None - all changes use existing project dependencies.

---

## Architecture Analysis

### REQ-1: Dashboard Cards Clickability

**Current State Analysis:**
- `UserDashboard.tsx` (lines 151-180): Stats cards defined as plain `<div>` elements
- `KPIDashboardOverview.tsx` (lines 361-388): KPI cards using `KPICard` component
- Cards display counts but have no click handlers or navigation

**Pattern Observed:**
- Quick Actions in `UserDashboard.tsx` (lines 119-149) use anchor `<a>` tags with `href`
- Property summaries (lines 353-380) already clickable as `<a>` elements

**Architecture Decision:**
- Wrap stats cards in clickable containers using Next.js `Link` component for SPA navigation
- Match existing Quick Actions pattern for consistency

### REQ-2: Data Model Clarification (CRITICAL)

**Current State Analysis:**
- `Item` type (src/types/index.ts:6-17): Represents physical thing with `name`, `description`, `propertyId`
- `ItemArticle` type (src/types/index.ts:106-116): Represents content/instructions with `purpose`, `title`
- `PurposeType` (src/types/index.ts:95-103): Categories like 'how-to-use', 'how-to-clean'
- Workflow labels in `PreviewSaveStep.tsx` (lines 220-230): Uses "Article Title" terminology

**Data Model Clarification:**
```
Concept        | Database Entity  | UI Display            | Example
---------------|------------------|----------------------|------------------
Item           | items            | Item Name            | "Steamer"
Article        | item_articles    | Article Title        | "How to Clean"
Purpose        | item_articles.purpose | Purpose field   | "how-to-clean"
QR Code        | items.qr_code_url | ONE per Item        | Links to Item page
```

**Key Insight:** The data model is CORRECT in the codebase. The issue is UI labeling confusion:
- `PreviewSaveStep.tsx` shows "Article Title" but the `currentItem.itemName` field
- This conflates Item Name with Article Title in the UI

**Architecture Decision:**
- Keep data model as-is (it's correct)
- Fix UI labels to clearly distinguish:
  - "Item Name" for the physical item (e.g., "Steamer")
  - "Article Title" for the content purpose (auto-generated from purpose + item)
- Ensure QR code labels show Item Name only

### REQ-3: "What's Next" Screen Options

**Current State Analysis:**
- `NextActionStep.tsx` (lines 215-241): Shows 3 action cards:
  1. "Review & Submit" (green) - navigates to session-summary
  2. "Add More Content" (blue) - returns to content-type-selection
  3. "Cancel" (red) - exit workflow with confirmation
- Back arrow controlled by `canGoBack` in `WorkflowHeader.tsx`
- Step counter shows "Step 9 of 10" (incorrect per PRD)

**PRD Requirements:**
- REMOVE Cancel button
- REMOVE back arrow
- Change options to:
  1. Edit Instructions - edit the article just created
  2. Add New Instructions - create different instructions for same item
  3. Create New Item - start fresh with different item
  4. Done - exit workflow completely

**Architecture Decision:**
- Rename and restructure `NextActionStep.tsx` action cards
- Conditionally hide back button on this screen
- This screen should NOT be a numbered step (post-workflow menu)

### REQ-4: Navigation Menu Structure

**Current State Analysis:**
- `RoleBasedNavigation.tsx` (lines 56-123): Navigation items defined
- Current items: Dashboard, Items, Properties, Analytics (admin), System Admin
- Uses emoji icons (not Lucide icons): '📊', '📦', '🏠', '📈', '👑'
- No "Instructions" menu item exists

**PRD Requirements:**
| Desktop Label | Mobile Label | Icon |
|--------------|--------------|------|
| Dashboard | D/B | Dashboard/grid icon (NOT house) |
| Items | Items | Box/cube icon |
| Instructions (NEW) | Instr. | Document/list icon |
| Properties | Prop. | House/building icon |

**Architecture Decision:**
- Update `RoleBasedNavigation.tsx` to use Lucide icons
- Add new "Instructions" menu item pointing to `/dashboard/instructions`
- Implement responsive labels (full on desktop, abbreviated on mobile)
- Create placeholder page for Instructions route

### REQ-5: Workflow Step Count

**Current State Analysis:**
- `constants.ts` (lines 450-461): `WORKFLOW_STEPS` array has 10 steps
- Steps: room-selection, item-type-selection, specific-item-selection, purpose-selection, content-type-selection, media-capture, content-creation, preview-save, next-action, session-summary
- `WorkflowHeader.tsx` (line 113): Shows `Step {currentStepIndex + 1} of {totalSteps}`

**PRD Requirements:**
- Step counter should show "Step 8 of 8" on Save Item screen
- "Save Item" is the FINAL workflow step
- "Item Saved!" with QR code = END of workflow
- "Continue" leads to post-workflow menu (NOT a numbered step)

**Architecture Decision:**
- Define a subset of "user-visible steps" that excludes internal/post-workflow steps
- Workflow steps for UI display: 8 steps (up to preview-save)
- `next-action` and `session-summary` are post-workflow menus
- Keep `WORKFLOW_STEPS` array intact for state machine logic
- Add separate `USER_VISIBLE_STEPS` constant for UI step counting

---

## Integration Contracts

### Dashboard Cards (REQ-1)

**Props Interface for Clickable Stats Card:**
```typescript
interface ClickableStatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  href: string;  // NEW: Navigation destination
  loading?: boolean;
  className?: string;
}
```

### Navigation Items (REQ-4)

**Updated NavigationItem Interface:**
```typescript
interface NavigationItem {
  name: string;           // Full name for desktop
  shortName?: string;     // Abbreviated name for mobile (NEW)
  href: string;
  icon: React.ComponentType<{ className?: string }>; // Lucide icon (CHANGED)
  description?: string;
  requiredPermissions?: PermissionKey[];
  dashboardSection?: DashboardSection;
  adminOnly?: boolean;
  systemAdminOnly?: boolean;
}
```

### Workflow Step Display (REQ-5)

**New Constants:**
```typescript
// Steps visible to user in step counter
export const USER_VISIBLE_STEPS = [
  'room-selection',
  'item-type-selection',
  'specific-item-selection',
  'purpose-selection',
  'content-type-selection',
  'media-capture',
  'content-creation',
  'preview-save',  // Step 8 of 8
] as const;

// Post-workflow screens (not numbered)
export const POST_WORKFLOW_SCREENS = [
  'next-action',
  'session-summary',
] as const;
```

### NextActionStep Props (REQ-3)

**Revised Props Interface:**
```typescript
interface NextActionStepProps {
  // Existing
  itemsCreated: number;
  className?: string;

  // Callbacks - REVISED
  onEditInstructions: () => void;    // Edit the article just created
  onAddNewInstructions: () => void;  // Add different instructions for same item
  onCreateNewItem: () => void;       // Start fresh with different item
  onDone: () => void;                // Exit workflow completely
}
```

---

## Implementation Approach

### Dependency Analysis

```
REQ-5 (Step Count) ─┬─> REQ-3 (What's Next Screen)
                    │
REQ-2 (Data Model)  ─┘

REQ-1 (Dashboard Cards) - Independent
REQ-4 (Navigation Menu) - Independent
```

**Recommended Order:**
1. **Phase 1:** REQ-5 (Step Count) - Foundation for step display logic
2. **Phase 2:** REQ-2 (Data Model UI) - Terminology updates
3. **Phase 3:** REQ-3 (What's Next Screen) - Depends on step count changes
4. **Phase 4:** REQ-1 (Dashboard Cards) - Independent, low risk
5. **Phase 5:** REQ-4 (Navigation Menu) - Independent, low risk

---

## Phase 1: Fix Workflow Step Count (REQ-5)

**Objective:** Show "Step X of 8" for user-visible steps, hide step counter for post-workflow screens.

### Tasks

- [ ] **1.1** Add `USER_VISIBLE_STEPS` constant to `constants.ts`
  - File: `src/components/ItemCreationWorkflow/utils/constants.ts`
  - Add array of 8 user-visible steps (exclude next-action, session-summary)
  - Add `POST_WORKFLOW_SCREENS` array

- [ ] **1.2** Create `isUserVisibleStep()` helper function
  - File: `src/components/ItemCreationWorkflow/utils/constants.ts`
  - Returns true if step should show step counter
  - Export for use in components

- [ ] **1.3** Update `useWorkflowState.ts` computed values
  - File: `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`
  - Add `userVisibleStepIndex` computed value (0-7)
  - Add `userVisibleTotalSteps` constant (8)
  - Add `isPostWorkflowScreen` computed boolean

- [ ] **1.4** Update `WorkflowHeader.tsx` to use user-visible step count
  - File: `src/components/ItemCreationWorkflow/components/shared/WorkflowHeader.tsx`
  - Accept new props: `userVisibleStepIndex`, `isPostWorkflowScreen`
  - Conditionally hide step counter for post-workflow screens
  - Show "Step X of 8" instead of "Step X of 10"

- [ ] **1.5** Update `ItemCreationWorkflow.tsx` to pass new props
  - File: `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`
  - Pass computed values to WorkflowHeader

- [ ] **1.6** Update unit tests
  - File: `src/components/ItemCreationWorkflow/components/shared/__tests__/WorkflowHeader.test.tsx`
  - Update expectations for "Step X of 8"
  - Add test for post-workflow screen hiding

### Files Modified
| File | Changes |
|------|---------|
| `src/components/ItemCreationWorkflow/utils/constants.ts` | Add USER_VISIBLE_STEPS, POST_WORKFLOW_SCREENS, helper function |
| `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts` | Add computed values for user-visible steps |
| `src/components/ItemCreationWorkflow/components/shared/WorkflowHeader.tsx` | Conditional step counter display |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | Pass new props to header |
| Test files | Update expectations |

**Effort Estimate:** 0.5 days

---

## Phase 2: Fix Data Model UI Labels (REQ-2)

**Objective:** Clarify terminology in UI to distinguish Item Name from Article Title.

### Tasks

- [ ] **2.1** Update `PreviewSaveStep.tsx` labels
  - File: `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx`
  - Rename "Article Title" label (line 226) to "Instruction Title" or clarify context
  - Add helper text explaining the distinction
  - The `itemName` field in workflow actually represents the article/instruction title

- [ ] **2.2** Review `SpecificItemStep.tsx` labels
  - File: `src/components/ItemCreationWorkflow/components/steps/SpecificItemStep.tsx`
  - Ensure "Item Name" clearly refers to the physical item (e.g., "Steamer")
  - Auto-generated name should be just the item, not "How to Clean - Steamer"

- [ ] **2.3** Update title generation logic
  - File: `src/components/ItemCreationWorkflow/utils/titleGenerator.ts`
  - `generateArticleTitle()` should create article titles like "How to Clean"
  - Item name (physical) should be separate from article title (purpose)

- [ ] **2.4** Verify QR code label shows Item Name only
  - File: `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx`
  - SuccessOverlay (lines 382-424) shows QR code with `itemName`
  - Verify this shows the physical item name, not article title

- [ ] **2.5** Add clarifying comments in types
  - File: `src/types/index.ts`
  - Add JSDoc comments to `Item.name` and `ItemArticle.title` explaining distinction

### Files Modified
| File | Changes |
|------|---------|
| `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx` | Label updates, helper text |
| `src/components/ItemCreationWorkflow/components/steps/SpecificItemStep.tsx` | Label verification |
| `src/components/ItemCreationWorkflow/utils/titleGenerator.ts` | Logic review |
| `src/types/index.ts` | JSDoc documentation |

**Effort Estimate:** 0.5 days

---

## Phase 3: Fix "What's Next" Screen (REQ-3)

**Objective:** Replace current options with 4 new actions, remove back arrow.

### Tasks

- [ ] **3.1** Update `NextActionStep.tsx` action cards
  - File: `src/components/ItemCreationWorkflow/components/steps/NextActionStep.tsx`
  - Change 3 cards to 4 new cards:
    1. **Edit Instructions** (blue) - Edit the article just created
    2. **Add New Instructions** (green) - Create different instructions for same item
    3. **Create New Item** (purple) - Start fresh with different item
    4. **Done** (gray) - Exit workflow completely
  - Remove "Cancel" card entirely

- [ ] **3.2** Update props interface
  - File: `src/components/ItemCreationWorkflow/components/steps/NextActionStep.tsx`
  - Change callbacks to match new actions
  - Remove `hasUnsavedContent` prop (no longer relevant - item is saved)

- [ ] **3.3** Update `ItemCreationWorkflow.tsx` handlers
  - File: `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`
  - Create handlers for new callbacks:
    - `onEditInstructions`: Navigate back to preview-save with same item
    - `onAddNewInstructions`: Reset to purpose-selection with same item context
    - `onCreateNewItem`: Call `startNewItem()`
    - `onDone`: Complete session and exit

- [ ] **3.4** Hide back arrow on "What's Next" screen
  - File: `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`
  - Conditionally set `canGoBack={false}` when on next-action step
  - This is a post-workflow menu, not a navigable step

- [ ] **3.5** Update screen title and copy
  - Current: "What's Next? Choose what you'd like to do next"
  - New: "Item Saved! What would you like to do now?" (or similar)
  - Remove step counter visual

- [ ] **3.6** Update unit tests
  - Update test expectations for new action cards
  - Remove tests for Cancel confirmation dialog

### Files Modified
| File | Changes |
|------|---------|
| `src/components/ItemCreationWorkflow/components/steps/NextActionStep.tsx` | Complete rewrite of action cards |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | New handlers, conditional back button |
| Test files | Update expectations |

**Effort Estimate:** 1 day

---

## Phase 4: Make Dashboard Cards Clickable (REQ-1)

**Objective:** Allow users to click dashboard stats to navigate to detail views.

### Tasks

- [ ] **4.1** Create `ClickableStatCard` component
  - File: `src/components/ClickableStatCard.tsx` (new)
  - Wrapper that adds Link functionality to stat cards
  - Preserve existing visual styling
  - Add hover states for clickable indication

- [ ] **4.2** Update `UserDashboard.tsx` stats cards
  - File: `src/components/UserDashboard.tsx`
  - Replace static div wrappers with ClickableStatCard
  - Add navigation targets:
    - "Properties" → `/dashboard/properties`
    - "Items" → `/dashboard/items`
    - "Total Views" → `/dashboard/analytics` (or keep non-clickable if no analytics page for users)
    - "Activity" → Keep non-clickable (no dedicated page)

- [ ] **4.3** Update `KPIDashboardOverview.tsx` KPI cards
  - File: `src/components/KPIDashboardOverview.tsx`
  - Update KPICard component to accept optional `href` prop
  - Add navigation targets:
    - "Total Properties" → `/dashboard/properties`
    - "Total Items" → `/dashboard/items`
    - "Total Views" → `/dashboard/analytics`
    - "Active Items" → `/dashboard/items?filter=active`

- [ ] **4.4** Add visual feedback for clickable cards
  - Add cursor: pointer
  - Add hover shadow/border highlight
  - Add focus ring for keyboard accessibility

### Files Modified
| File | Changes |
|------|---------|
| `src/components/ClickableStatCard.tsx` | New component |
| `src/components/UserDashboard.tsx` | Wrap stats cards |
| `src/components/KPIDashboardOverview.tsx` | Add href to KPICard |

**Effort Estimate:** 0.5 days

---

## Phase 5: Update Navigation Menu (REQ-4)

**Objective:** Restructure navigation with new labels, icons, and Instructions menu item.

### Tasks

- [ ] **5.1** Update `RoleBasedNavigation.tsx` navigation items
  - File: `src/components/RoleBasedNavigation.tsx`
  - Replace emoji icons with Lucide icons:
    - Dashboard: `LayoutDashboard` (was '📊' house conflict)
    - Items: `Package` or `Box` (was '📦')
    - Instructions: `FileText` (NEW)
    - Properties: `Home` or `Building2` (was '🏠')
  - Add `shortName` property for mobile labels

- [ ] **5.2** Add responsive label display
  - Desktop: Show full label (Dashboard, Items, Instructions, Properties)
  - Mobile: Show abbreviated (D/B, Items, Instr., Prop.)
  - Use Tailwind responsive classes (hidden md:block, block md:hidden)

- [ ] **5.3** Create Instructions placeholder page
  - File: `src/app/dashboard/instructions/page.tsx` (new)
  - Basic placeholder: "Instructions management coming soon"
  - Should list all ItemArticles grouped by Item

- [ ] **5.4** Add Instructions route to navigation items array
  - Position: Between Items and Properties
  - Check permissions (if applicable)

- [ ] **5.5** Update `DashboardSection` enum if needed
  - File: `src/types/permissions.ts`
  - Add `instructions` section if not present

### Files Modified
| File | Changes |
|------|---------|
| `src/components/RoleBasedNavigation.tsx` | Icons, labels, new item |
| `src/app/dashboard/instructions/page.tsx` | New placeholder page |
| `src/types/permissions.ts` | Add section enum if needed |

**Effort Estimate:** 0.5 days

---

## Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Step count display | Separate USER_VISIBLE_STEPS array | Maintains state machine integrity while fixing UI display |
| Post-workflow menu | Hide step counter entirely | These are not "steps" - they're completion menus |
| Dashboard card clicks | Next.js Link component | SPA navigation without full page reload |
| Navigation icons | Lucide React | Already used in project, consistent iconography |
| Mobile labels | CSS responsive classes | No JS complexity, instant switching |
| Instructions page | Placeholder initially | Allows navigation structure without full implementation |

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Step count change breaks tests | Medium | Low | Update all test expectations in same PR |
| Data model terminology confusion | Low | High | Add clear JSDoc comments, review with stakeholders |
| Navigation changes break existing routes | Low | Medium | Keep existing routes, add new ones incrementally |
| Mobile label truncation issues | Medium | Low | Test on various mobile viewports |
| Workflow state regression | Medium | High | Comprehensive testing of all workflow paths |

---

## Recommended Spike Work

**Spike Goal:** Validate data model terminology with stakeholders

**Timebox:** 2 hours

**Success Criteria:**
- Confirm Item = physical thing (Steamer)
- Confirm Article = instructions about item (How to Clean)
- Confirm QR code points to Item page showing all Articles
- Get sign-off on UI label terminology

---

## Effort Estimate

| Phase | Description | Estimate | Confidence |
|-------|-------------|----------|------------|
| Phase 1 | Fix workflow step count (REQ-5) | 0.5 days | High |
| Phase 2 | Fix data model UI labels (REQ-2) | 0.5 days | Medium |
| Phase 3 | Fix "What's Next" screen (REQ-3) | 1 day | Medium |
| Phase 4 | Make dashboard cards clickable (REQ-1) | 0.5 days | High |
| Phase 5 | Update navigation menu (REQ-4) | 0.5 days | High |
| **Total** | **All 5 requirements** | **3 days** | **Medium-High** |

---

## Open Questions

1. **REQ-2 Data Model:** Should the QR code scan URL pattern change? Currently `/item/[publicId]` - is this still correct when showing all articles for an item?

2. **REQ-3 What's Next:** "Edit Instructions" action - should this go back to PreviewSaveStep or a different editing interface?

3. **REQ-4 Navigation:** Should "Instructions" be visible to all users or only admins? What permissions govern access?

4. **REQ-5 Step Count:** The PRD mentions "Step 8 of 8" but current workflow has 10 steps. After removing `content-source-selection` (already done in Plan-094), we have 9 steps. Confirm the correct user-visible step count.

5. **General:** Should these changes be deployed together or incrementally? Recommend together due to interdependencies between REQ-3 and REQ-5.

---

## References

- [PRD Source](docs/prd/intake/prd-CPL-FAQBNB-Review-2026-01-11-20260111-204706.md)
- [Plan-094 UI/UX Workflow Improvements](docs/prd/Plan-094-UI-UX-Workflow-Improvements.md)
- [Plan-093 Item Creation Workflow](docs/prd/Plan-093-Item-Creation-Workflow.md)
- [Lucide React Icons](https://lucide.dev/icons/)
- [Next.js Link Component](https://nextjs.org/docs/pages/api-reference/components/link)

---

## Validation Checkpoint

### Technical Foundation Verified:
1. Framework: Next.js 15.5.9 with React 19.1.0
2. TypeScript: Strict mode enabled
3. Styling: Tailwind CSS 4.x
4. Build: Next.js Turbopack

### Integration Requirements Verified:
5. Component location: All modifications in `src/components/` and `src/app/`
6. Similar patterns: Quick Actions, Property Summaries use clickable pattern
7. State management: React Context + useReducer pattern established
8. Component API: Props-based with callbacks

### PRD Requirements Verified:
9. All 5 requirements technically feasible
10. No stack conflicts identified
11. No new dependencies needed
12. Existing patterns can be extended

**Status:** Ready for implementation
